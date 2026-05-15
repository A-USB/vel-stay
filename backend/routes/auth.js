const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users, getRestaurantSettings } = require('../models/store');
const { authenticate } = require('../middleware/auth');
const { isEmail, isNonEmptyString, normalizeEmail } = require('../utils/validation');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ error: 'A valid email and password are required' });
    }

    const user = users.find(u => normalizeEmail(u.email) === normalizeEmail(email));
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, restaurantId: user.restaurantId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const { password: _, ...userWithoutPw } = user;
    res.json({ token, user: userWithoutPw });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, restaurant } = req.body;
    if (!isNonEmptyString(name) || !isEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ error: 'Name, valid email, and password are required' });
    }
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (users.find(u => normalizeEmail(u.email) === normalizeEmail(email))) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const restaurantName = isNonEmptyString(restaurant) ? restaurant.trim() : 'My Restaurant';
    const restaurantId = uuidv4();
    const newUser = {
      id: uuidv4(),
      restaurantId,
      name: name.trim(),
      email: normalizeEmail(email),
      password: hashed,
      role: 'manager',
      restaurant: restaurantName,
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    getRestaurantSettings(restaurantId, restaurantName);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, restaurantId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const { password: _, ...userWithoutPw } = newUser;
    res.status(201).json({ token, user: userWithoutPw });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.get('/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userWithoutPw } = user;
  res.json(userWithoutPw);
});

router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
