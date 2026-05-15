const jwt = require('jsonwebtoken');
const { users } = require('../models/store');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid or expired token' });

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurant: user.restaurant,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };
