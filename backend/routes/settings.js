const express = require('express');
const { getRestaurantSettings, users } = require('../models/store');
const { authenticate } = require('../middleware/auth');
const { isEmail, isNonEmptyString, toPositiveInt } = require('../utils/validation');

const router = express.Router();
router.use(authenticate);

const allowed = ['restaurantName', 'address', 'phone', 'email', 'openingHours', 'currency', 'timezone', 'notifications', 'tableCapacity'];

router.get('/', (req, res) => {
  res.json(getRestaurantSettings(req.user.restaurantId, req.user.restaurant));
});

router.patch('/', (req, res) => {
  const settings = getRestaurantSettings(req.user.restaurantId, req.user.restaurant);

  if (req.body.restaurantName !== undefined) {
    if (!isNonEmptyString(req.body.restaurantName)) return res.status(400).json({ error: 'Restaurant name cannot be empty' });
    settings.restaurantName = req.body.restaurantName.trim();
    users
      .filter(user => user.restaurantId === req.user.restaurantId)
      .forEach(user => { user.restaurant = settings.restaurantName; });
  }

  if (req.body.email !== undefined) {
    if (req.body.email && !isEmail(req.body.email)) return res.status(400).json({ error: 'A valid restaurant email is required' });
    settings.email = req.body.email;
  }

  if (req.body.tableCapacity !== undefined) {
    const tableCapacity = toPositiveInt(req.body.tableCapacity);
    if (!tableCapacity) return res.status(400).json({ error: 'Table capacity must be a positive whole number' });
    settings.tableCapacity = tableCapacity;
  }

  allowed.forEach(field => {
    if (['restaurantName', 'email', 'tableCapacity'].includes(field)) return;
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  });

  res.json(settings);
});

module.exports = router;
