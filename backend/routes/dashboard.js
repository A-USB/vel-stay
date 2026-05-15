const express = require('express');
const { reservations, clients, menuItems } = require('../models/store');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const restaurantReservations = reservations.filter(r => r.restaurantId === req.user.restaurantId);
  const restaurantClients = clients.filter(c => c.restaurantId === req.user.restaurantId);
  const restaurantMenuItems = menuItems.filter(m => m.restaurantId === req.user.restaurantId);
  const todayRes = restaurantReservations.filter(r => r.date === today);
  const confirmedToday = todayRes.filter(r => r.status === 'confirmed').length;
  const totalGuests = todayRes.reduce((sum, r) => sum + (r.partySize || 0), 0);
  const vipClients = restaurantClients.filter(c => c.vip).length;
  const availableItems = restaurantMenuItems.filter(m => m.available).length;
  const weekRevenue = restaurantClients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  res.json({
    todayReservations: todayRes.length,
    confirmedToday,
    totalGuestsToday: totalGuests,
    totalClients: restaurantClients.length,
    vipClients,
    menuItems: restaurantMenuItems.length,
    availableMenuItems: availableItems,
    estimatedWeekRevenue: Math.round(weekRevenue * 0.15),
    upcomingReservations: restaurantReservations
      .filter(r => r.date >= today && r.status !== 'cancelled')
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
      .slice(0, 5),
    recentClients: restaurantClients.slice(-3),
  });
});

router.get('/revenue', (req, res) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const restaurantClients = clients.filter(c => c.restaurantId === req.user.restaurantId);
  const baseline = restaurantClients.reduce((sum, c) => sum + (c.totalSpent || 0), 0) || 7000;
  const revenue = days.map((day, index) => ({
    day,
    revenue: Math.round((baseline / 7) * (0.75 + index * 0.08)),
    covers: Math.round(20 + index * 5 + restaurantClients.length * 1.5),
  }));
  res.json(revenue);
});

module.exports = router;
