const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { menuItems } = require('../models/store');
const { authenticate } = require('../middleware/auth');
const { isNonEmptyString, toNonNegativeNumber, toStringArray } = require('../utils/validation');

const router = express.Router();
router.use(authenticate);

const byRestaurant = restaurantId => menuItems.filter(m => m.restaurantId === restaurantId);
const findItem = (restaurantId, id) => menuItems.find(m => m.restaurantId === restaurantId && m.id === id);

router.get('/', (req, res) => {
  const { category, available } = req.query;
  let result = byRestaurant(req.user.restaurantId);

  if (category) result = result.filter(m => m.category === category);
  if (available !== undefined) result = result.filter(m => m.available === (available === 'true'));

  res.json(result);
});

router.get('/categories', (req, res) => {
  const cats = [...new Set(byRestaurant(req.user.restaurantId).map(m => m.category))].sort();
  res.json(cats);
});

router.get('/:id', (req, res) => {
  const item = findItem(req.user.restaurantId, req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  res.json(item);
});

router.post('/', (req, res) => {
  const { name, category, description, allergens } = req.body;
  const price = toNonNegativeNumber(req.body.price);

  if (!isNonEmptyString(name) || !isNonEmptyString(category) || price === null) {
    return res.status(400).json({ error: 'Name, category, and a non-negative price are required' });
  }

  const item = {
    id: uuidv4(),
    restaurantId: req.user.restaurantId,
    name: name.trim(),
    category: category.trim(),
    price,
    description: description || '',
    available: true,
    popular: false,
    image: null,
    allergens: toStringArray(allergens),
  };

  menuItems.push(item);
  res.status(201).json(item);
});

router.patch('/:id', (req, res) => {
  const item = findItem(req.user.restaurantId, req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });

  if (req.body.name !== undefined) {
    if (!isNonEmptyString(req.body.name)) return res.status(400).json({ error: 'Name cannot be empty' });
    item.name = req.body.name.trim();
  }
  if (req.body.category !== undefined) {
    if (!isNonEmptyString(req.body.category)) return res.status(400).json({ error: 'Category cannot be empty' });
    item.category = req.body.category.trim();
  }
  if (req.body.price !== undefined) {
    const price = toNonNegativeNumber(req.body.price);
    if (price === null) return res.status(400).json({ error: 'Price must be a non-negative number' });
    item.price = price;
  }
  if (req.body.description !== undefined) item.description = req.body.description;
  if (req.body.available !== undefined) item.available = Boolean(req.body.available);
  if (req.body.popular !== undefined) item.popular = Boolean(req.body.popular);
  if (req.body.allergens !== undefined) item.allergens = toStringArray(req.body.allergens);

  res.json(item);
});

router.delete('/:id', (req, res) => {
  const idx = menuItems.findIndex(m => m.restaurantId === req.user.restaurantId && m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Menu item not found' });
  menuItems.splice(idx, 1);
  res.json({ message: 'Menu item deleted' });
});

module.exports = router;
