const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { clients, reservations } = require('../models/store');
const { authenticate } = require('../middleware/auth');
const { isEmail, isNonEmptyString, normalizeEmail, toStringArray } = require('../utils/validation');

const router = express.Router();
router.use(authenticate);

const byRestaurant = (restaurantId) => clients.filter(c => c.restaurantId === restaurantId);
const findClient = (restaurantId, id) => clients.find(c => c.restaurantId === restaurantId && c.id === id);

router.get('/', (req, res) => {
  const { search, vip } = req.query;
  let result = byRestaurant(req.user.restaurantId);

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }

  if (vip !== undefined) result = result.filter(c => c.vip === (vip === 'true'));
  res.json(result);
});

router.get('/:id', (req, res) => {
  const client = findClient(req.user.restaurantId, req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
});

router.post('/', (req, res) => {
  const { name, email, phone, notes, tags } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!isNonEmptyString(name) || !isEmail(email)) {
    return res.status(400).json({ error: 'A client name and valid email are required' });
  }

  if (byRestaurant(req.user.restaurantId).some(c => normalizeEmail(c.email) === normalizedEmail)) {
    return res.status(409).json({ error: 'Client with this email already exists' });
  }

  const newClient = {
    id: uuidv4(),
    restaurantId: req.user.restaurantId,
    name: name.trim(),
    email: normalizedEmail,
    phone: phone || '',
    visits: 0,
    totalSpent: 0,
    lastVisit: null,
    vip: false,
    notes: notes || '',
    tags: toStringArray(tags),
  };

  clients.push(newClient);
  res.status(201).json(newClient);
});

router.patch('/:id', (req, res) => {
  const client = findClient(req.user.restaurantId, req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  if (req.body.email !== undefined) {
    if (!isEmail(req.body.email)) return res.status(400).json({ error: 'A valid email is required' });
    const normalizedEmail = normalizeEmail(req.body.email);
    const duplicate = byRestaurant(req.user.restaurantId).some(c => c.id !== client.id && normalizeEmail(c.email) === normalizedEmail);
    if (duplicate) return res.status(409).json({ error: 'Client with this email already exists' });
    client.email = normalizedEmail;
  }

  if (req.body.name !== undefined) {
    if (!isNonEmptyString(req.body.name)) return res.status(400).json({ error: 'Client name cannot be empty' });
    client.name = req.body.name.trim();
  }

  ['phone', 'notes'].forEach(field => {
    if (req.body[field] !== undefined) client[field] = req.body[field];
  });
  if (req.body.vip !== undefined) client.vip = Boolean(req.body.vip);
  if (req.body.tags !== undefined) client.tags = toStringArray(req.body.tags);

  res.json(client);
});

router.delete('/:id', (req, res) => {
  const idx = clients.findIndex(c => c.restaurantId === req.user.restaurantId && c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Client not found' });

  const [deleted] = clients.splice(idx, 1);
  reservations.forEach(reservation => {
    if (reservation.restaurantId === req.user.restaurantId && reservation.clientId === deleted.id) {
      reservation.clientId = null;
    }
  });

  res.json({ message: 'Client deleted' });
});

module.exports = router;
