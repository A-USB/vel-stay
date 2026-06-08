const express = require("express");
const { v4: uuidv4 } = require("uuid");
const {
  clientBookings,
  ratings,
  establishments,
  clientUsers,
} = require("../models/store");
const { authenticate, requireClient } = require("../middleware/auth");
const {
  isIsoDate,
  isTime,
  toPositiveInt,
  isNonEmptyString,
} = require("../utils/validation");

const router = express.Router();
router.use(authenticate, requireClient);

// ─── GET /api/client/dashboard ────────────────────────────────────────────
router.get("/dashboard", (req, res) => {
  const myBookings = clientBookings.filter(
    (b) => b.clientUserId === req.user.id,
  );
  const today = new Date().toISOString().split("T")[0];

  const upcoming = myBookings
    .filter((b) => b.date >= today && b.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  const completed = myBookings.filter((b) => b.status === "completed");

  const myRatings = ratings.filter((r) => r.clientUserId === req.user.id);

  const visitedIds = [...new Set(completed.map((b) => b.establishmentId))];
  const visitedPlaces = visitedIds
    .map((id) => {
      const est = establishments.find((e) => e.id === id);
      const myRating = myRatings.find((r) => r.establishmentId === id);
      const visits = completed.filter((b) => b.establishmentId === id).length;
      return est ? { ...est, visits, myRating: myRating || null } : null;
    })
    .filter(Boolean);

  res.json({
    totalBookings: myBookings.length,
    upcomingCount: upcoming.length,
    placesVisited: visitedPlaces.length,
    ratingsGiven: myRatings.length,
    upcomingBookings: upcoming,
    recentlyVisited: visitedPlaces.slice(0, 3),
  });
});

// ─── GET /api/client/bookings ─────────────────────────────────────────────
// Query: ?status=confirmed|pending|completed|cancelled
router.get("/bookings", (req, res) => {
  const { status } = req.query;
  let result = clientBookings.filter((b) => b.clientUserId === req.user.id);

  if (status) result = result.filter((b) => b.status === status);

  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(result);
});

// ─── POST /api/client/bookings ────────────────────────────────────────────
// Body: { establishmentId, date, time, partySize, specialRequests? }
router.post("/bookings", (req, res) => {
  const { establishmentId, date, time, specialRequests } = req.body;
  const partySize = toPositiveInt(req.body.partySize);

  if (
    !isNonEmptyString(establishmentId) ||
    !isIsoDate(date) ||
    !isTime(time) ||
    !partySize
  ) {
    return res
      .status(400)
      .json({
        error:
          "establishmentId, valid date, valid time, and positive partySize are required",
      });
  }

  const est = establishments.find((e) => e.id === establishmentId);
  if (!est) return res.status(404).json({ error: "Establishment not found" });

  const newBooking = {
    id: uuidv4(),
    clientUserId: req.user.id,
    establishmentId,
    establishmentName: est.name,
    establishmentType: est.type,
    date,
    time,
    partySize,
    status: "pending",
    specialRequests: specialRequests || "",
    createdAt: new Date().toISOString(),
  };

  clientBookings.push(newBooking);
  res.status(201).json(newBooking);
});

// ─── PATCH /api/client/bookings/:id ───────────────────────────────────────
// Clients can update date/time/partySize/specialRequests or cancel (status: cancelled)
router.patch("/bookings/:id", (req, res) => {
  const booking = clientBookings.find(
    (b) => b.id === req.params.id && b.clientUserId === req.user.id,
  );
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.status === "completed" || booking.status === "cancelled") {
    return res
      .status(400)
      .json({ error: "Cannot modify a completed or cancelled booking" });
  }

  if (req.body.date !== undefined) {
    if (!isIsoDate(req.body.date))
      return res.status(400).json({ error: "Invalid date" });
    booking.date = req.body.date;
  }
  if (req.body.time !== undefined) {
    if (!isTime(req.body.time))
      return res.status(400).json({ error: "Invalid time" });
    booking.time = req.body.time;
  }
  if (req.body.partySize !== undefined) {
    const ps = toPositiveInt(req.body.partySize);
    if (!ps)
      return res
        .status(400)
        .json({ error: "Party size must be a positive whole number" });
    booking.partySize = ps;
  }
  if (req.body.specialRequests !== undefined) {
    booking.specialRequests = req.body.specialRequests;
  }
  if (req.body.status !== undefined) {
    if (req.body.status !== "cancelled") {
      return res
        .status(400)
        .json({ error: "Clients can only cancel bookings" });
    }
    booking.status = "cancelled";
  }

  res.json(booking);
});

// ─── DELETE /api/client/bookings/:id ──────────────────────────────────────
router.delete("/bookings/:id", (req, res) => {
  const idx = clientBookings.findIndex(
    (b) => b.id === req.params.id && b.clientUserId === req.user.id,
  );
  if (idx === -1) return res.status(404).json({ error: "Booking not found" });
  if (["completed"].includes(clientBookings[idx].status)) {
    return res.status(400).json({ error: "Cannot delete a completed booking" });
  }
  clientBookings.splice(idx, 1);
  res.json({ message: "Booking deleted" });
});

// ─── GET /api/client/history ──────────────────────────────────────────────
// Places the client has visited (completed bookings), grouped by establishment
router.get("/history", (req, res) => {
  const completed = clientBookings.filter(
    (b) => b.clientUserId === req.user.id && b.status === "completed",
  );

  const myRatings = ratings.filter((r) => r.clientUserId === req.user.id);

  const grouped = {};
  completed.forEach((b) => {
    if (!grouped[b.establishmentId]) {
      const est = establishments.find((e) => e.id === b.establishmentId);
      const myRating = myRatings.find(
        (r) => r.establishmentId === b.establishmentId,
      );
      grouped[b.establishmentId] = {
        establishment: est || {
          id: b.establishmentId,
          name: b.establishmentName,
          type: b.establishmentType,
        },
        visits: [],
        myRating: myRating || null,
      };
    }
    grouped[b.establishmentId].visits.push({
      date: b.date,
      time: b.time,
      partySize: b.partySize,
      bookingId: b.id,
    });
  });

  const result = Object.values(grouped).map((g) => ({
    ...g,
    visitCount: g.visits.length,
    lastVisit:
      g.visits.sort((a, b) => b.date.localeCompare(a.date))[0]?.date || null,
  }));

  res.json(result);
});

// ─── GET /api/client/ratings ──────────────────────────────────────────────
router.get("/ratings", (req, res) => {
  const myRatings = ratings
    .filter((r) => r.clientUserId === req.user.id)
    .map((r) => {
      const est = establishments.find((e) => e.id === r.establishmentId);
      return {
        ...r,
        establishmentName: est?.name || "Unknown",
        establishmentType: est?.type || "unknown",
      };
    });
  res.json(myRatings);
});

// ─── POST /api/client/ratings ─────────────────────────────────────────────
// Body: { establishmentId, score (1-5), comment? }
router.post("/ratings", (req, res) => {
  const { establishmentId, comment } = req.body;
  const score = Number(req.body.score);

  if (
    !isNonEmptyString(establishmentId) ||
    !Number.isInteger(score) ||
    score < 1 ||
    score > 5
  ) {
    return res
      .status(400)
      .json({
        error: "establishmentId and a score between 1 and 5 are required",
      });
  }

  const est = establishments.find((e) => e.id === establishmentId);
  if (!est) return res.status(404).json({ error: "Establishment not found" });

  // Check the client has actually visited this place
  const hasVisited = clientBookings.some(
    (b) =>
      b.clientUserId === req.user.id &&
      b.establishmentId === establishmentId &&
      b.status === "completed",
  );
  if (!hasVisited) {
    return res
      .status(403)
      .json({ error: "You can only rate places you have visited" });
  }

  // Upsert: one rating per client per establishment
  const existing = ratings.find(
    (r) =>
      r.clientUserId === req.user.id && r.establishmentId === establishmentId,
  );
  if (existing) {
    existing.score = score;
    existing.comment = comment || existing.comment;
    existing.updatedAt = new Date().toISOString();
    return res.json(existing);
  }

  const newRating = {
    id: uuidv4(),
    clientUserId: req.user.id,
    establishmentId,
    score,
    comment: comment || "",
    createdAt: new Date().toISOString(),
  };
  ratings.push(newRating);

  // Update establishment's live rating average
  const estRatings = ratings.filter(
    (r) => r.establishmentId === establishmentId,
  );
  est.rating = parseFloat(
    (estRatings.reduce((s, r) => s + r.score, 0) / estRatings.length).toFixed(
      1,
    ),
  );
  est.reviewCount = estRatings.length;

  res.status(201).json(newRating);
});

module.exports = router;
