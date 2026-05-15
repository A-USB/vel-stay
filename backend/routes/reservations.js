const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { clients, reservations } = require('../models/store');
const { authenticate } = require('../middleware/auth');
const { VALID_STATUSES, isIsoDate, isNonEmptyString, isTime, toPositiveInt } = require('../utils/validation');

const router = express.Router();
router.use(authenticate);

const byRestaurant = restaurantId => reservations.filter(r => r.restaurantId === restaurantId);
const findReservation = (restaurantId, id) => reservations.find(r => r.restaurantId === restaurantId && r.id === id);
const findClient = (restaurantId, id) => clients.find(c => c.restaurantId === restaurantId && c.id === id);

const hasTableConflict = (restaurantId, { id, date, time, table }) => {
  if (!isNonEmptyString(table) || table.trim().toUpperCase() === 'TBD') return false;
  return reservations.some(r =>
    r.restaurantId === restaurantId &&
    r.id !== id &&
    r.status !== 'cancelled' &&
    r.date === date &&
    r.time === time &&
    r.table.toLowerCase() === table.trim().toLowerCase()
  );
};

router.get('/', (req, res) => {
  const { date, status } = req.query;
  let result = byRestaurant(req.user.restaurantId);

  if (date) result = result.filter(r => r.date === date);
  if (status) result = result.filter(r => r.status === status);

  result.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  res.json(result);
});

router.get('/:id', (req, res) => {
  const reservation = findReservation(req.user.restaurantId, req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
  res.json(reservation);
});

router.post('/', (req, res) => {
  const { clientName, date, time, table, specialRequests, clientId } = req.body;
  const partySize = toPositiveInt(req.body.partySize);
  let resolvedClientName = clientName;
  let resolvedClientId = clientId || null;

  if (clientId) {
    const client = findClient(req.user.restaurantId, clientId);
    if (!client) return res.status(400).json({ error: 'Client does not belong to this restaurant' });
    resolvedClientName = client.name;
    resolvedClientId = client.id;
  }

  if (!isNonEmptyString(resolvedClientName) || !isIsoDate(date) || !isTime(time) || !partySize) {
    return res.status(400).json({ error: 'Guest name, valid date, valid time, and positive party size are required' });
  }

  const reservation = {
    id: uuidv4(),
    restaurantId: req.user.restaurantId,
    clientId: resolvedClientId,
    clientName: resolvedClientName.trim(),
    date,
    time,
    partySize,
    table: isNonEmptyString(table) ? table.trim() : 'TBD',
    status: 'pending',
    specialRequests: specialRequests || '',
    createdAt: new Date().toISOString(),
  };

  if (hasTableConflict(req.user.restaurantId, reservation)) {
    return res.status(409).json({ error: 'That table is already booked at this date and time' });
  }

  reservations.push(reservation);
  res.status(201).json(reservation);
});

router.patch('/:id', (req, res) => {
  const reservation = findReservation(req.user.restaurantId, req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

  const nextReservation = { ...reservation };

  if (req.body.clientId !== undefined) {
    if (req.body.clientId === null || req.body.clientId === '') {
      nextReservation.clientId = null;
    } else {
      const client = findClient(req.user.restaurantId, req.body.clientId);
      if (!client) return res.status(400).json({ error: 'Client does not belong to this restaurant' });
      nextReservation.clientId = client.id;
      nextReservation.clientName = client.name;
    }
  }

  if (req.body.clientName !== undefined && nextReservation.clientId === null) {
    if (!isNonEmptyString(req.body.clientName)) return res.status(400).json({ error: 'Guest name cannot be empty' });
    nextReservation.clientName = req.body.clientName.trim();
  }
  if (req.body.date !== undefined) {
    if (!isIsoDate(req.body.date)) return res.status(400).json({ error: 'A valid date is required' });
    nextReservation.date = req.body.date;
  }
  if (req.body.time !== undefined) {
    if (!isTime(req.body.time)) return res.status(400).json({ error: 'A valid time is required' });
    nextReservation.time = req.body.time;
  }
  if (req.body.partySize !== undefined) {
    const partySize = toPositiveInt(req.body.partySize);
    if (!partySize) return res.status(400).json({ error: 'Party size must be a positive whole number' });
    nextReservation.partySize = partySize;
  }
  if (req.body.table !== undefined) nextReservation.table = isNonEmptyString(req.body.table) ? req.body.table.trim() : 'TBD';
  if (req.body.status !== undefined) {
    if (!VALID_STATUSES.has(req.body.status)) return res.status(400).json({ error: 'Invalid reservation status' });
    nextReservation.status = req.body.status;
  }
  if (req.body.specialRequests !== undefined) nextReservation.specialRequests = req.body.specialRequests;

  if (hasTableConflict(req.user.restaurantId, nextReservation)) {
    return res.status(409).json({ error: 'That table is already booked at this date and time' });
  }

  Object.assign(reservation, nextReservation);
  res.json(reservation);
});

router.delete('/:id', (req, res) => {
  const idx = reservations.findIndex(r => r.restaurantId === req.user.restaurantId && r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Reservation not found' });
  reservations.splice(idx, 1);
  res.json({ message: 'Reservation deleted' });
});

module.exports = router;
