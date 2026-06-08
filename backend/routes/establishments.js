const express = require("express");
const { establishments, menuItems, ratings } = require("../models/store");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// ─── GET /api/establishments ───────────────────────────────────────────────
// Query: ?type=restaurant|bar|hotel|motel  &search=  &minRating=
router.get("/", (req, res) => {
  const { type, search, minRating } = req.query;
  let result = [...establishments];

  if (type) {
    result = result.filter((e) => e.type === type);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (minRating) {
    result = result.filter((e) => e.rating >= Number(minRating));
  }

  // Attach computed average rating from live ratings data
  result = result.map((e) => {
    const estRatings = ratings.filter((r) => r.establishmentId === e.id);
    const avg = estRatings.length
      ? parseFloat(
          (
            estRatings.reduce((s, r) => s + r.score, 0) / estRatings.length
          ).toFixed(1),
        )
      : e.rating;
    return {
      ...e,
      rating: avg,
      reviewCount: estRatings.length || e.reviewCount,
    };
  });

  res.json(result);
});

// ─── GET /api/establishments/:id ──────────────────────────────────────────
router.get("/:id", (req, res) => {
  const est = establishments.find((e) => e.id === req.params.id);
  if (!est) return res.status(404).json({ error: "Establishment not found" });

  const estRatings = ratings.filter((r) => r.establishmentId === est.id);
  const avg = estRatings.length
    ? parseFloat(
        (
          estRatings.reduce((s, r) => s + r.score, 0) / estRatings.length
        ).toFixed(1),
      )
    : est.rating;

  res.json({
    ...est,
    rating: avg,
    reviewCount: estRatings.length || est.reviewCount,
  });
});

// ─── GET /api/establishments/:id/menu ─────────────────────────────────────
router.get("/:id/menu", (req, res) => {
  const est = establishments.find((e) => e.id === req.params.id);
  if (!est) return res.status(404).json({ error: "Establishment not found" });

  const items = menuItems
    .filter((m) => m.restaurantId === req.params.id && m.available)
    .map(({ restaurantId, ...rest }) => rest); // strip internal field

  res.json(items);
});

// ─── GET /api/establishments/:id/ratings ──────────────────────────────────
router.get("/:id/ratings", (req, res) => {
  const est = establishments.find((e) => e.id === req.params.id);
  if (!est) return res.status(404).json({ error: "Establishment not found" });

  const estRatings = ratings
    .filter((r) => r.establishmentId === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(estRatings);
});

module.exports = router;
