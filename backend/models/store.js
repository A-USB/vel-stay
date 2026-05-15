const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const defaultRestaurantId = uuidv4();

const createDefaultSettings = (restaurantName = 'My Restaurant') => ({
  restaurantName,
  address: '',
  phone: '',
  email: '',
  openingHours: {
    monday: '12:00-23:00',
    tuesday: '12:00-23:00',
    wednesday: '12:00-23:00',
    thursday: '12:00-23:00',
    friday: '12:00-00:00',
    saturday: '11:00-00:00',
    sunday: 'closed',
  },
  currency: 'USD',
  timezone: 'America/New_York',
  notifications: {
    emailReservations: true,
    smsConfirmations: false,
    dailyReport: true,
  },
  tableCapacity: 20,
});

const users = [
  {
    id: uuidv4(),
    restaurantId: defaultRestaurantId,
    name: 'Alex Morgan',
    email: 'manager@grandbistro.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'manager',
    restaurant: 'The Grand Bistro',
    avatar: null,
    createdAt: new Date('2024-01-15').toISOString(),
  },
];

const clients = [
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Sophia Andersen', email: 'sophia@email.com', phone: '+1 555-0101', visits: 12, totalSpent: 1840.50, lastVisit: '2024-11-20', vip: true, notes: 'Prefers window table, allergic to shellfish', tags: ['VIP', 'Regular'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Marcus Liu', email: 'marcus.liu@email.com', phone: '+1 555-0102', visits: 7, totalSpent: 920.00, lastVisit: '2024-11-18', vip: false, notes: 'Birthday on March 14th', tags: ['Regular'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Elena Vasquez', email: 'elena.v@email.com', phone: '+1 555-0103', visits: 3, totalSpent: 310.00, lastVisit: '2024-11-10', vip: false, notes: '', tags: ['New'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'James Thornton', email: 'j.thornton@corp.com', phone: '+1 555-0104', visits: 21, totalSpent: 4250.75, lastVisit: '2024-11-22', vip: true, notes: 'Corporate account - expense reporting needed', tags: ['VIP', 'Corporate'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Aisha Okoye', email: 'aisha.o@email.com', phone: '+1 555-0105', visits: 5, totalSpent: 680.00, lastVisit: '2024-11-15', vip: false, notes: 'Vegan menu required', tags: ['Regular', 'Dietary'] },
];

const menuItems = [
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Truffle Risotto', category: 'Mains', price: 28.50, description: 'Arborio rice, black truffle, parmesan, wild mushrooms', available: true, popular: true, image: null, allergens: ['dairy', 'gluten'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Burrata & Heirloom Tomatoes', category: 'Starters', price: 16.00, description: 'Fresh burrata, heirloom tomatoes, basil oil, fleur de sel', available: true, popular: true, image: null, allergens: ['dairy'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Grilled Sea Bass', category: 'Mains', price: 34.00, description: 'Line-caught sea bass, saffron beurre blanc, fennel salad', available: true, popular: false, image: null, allergens: ['fish'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Dark Chocolate Fondant', category: 'Desserts', price: 12.50, description: 'Warm chocolate fondant, vanilla bean ice cream, caramel sauce', available: true, popular: true, image: null, allergens: ['dairy', 'gluten', 'eggs'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Wagyu Beef Tartare', category: 'Starters', price: 22.00, description: 'A5 wagyu, capers, egg yolk, Dijon mustard, toast points', available: true, popular: false, image: null, allergens: ['eggs', 'gluten'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Sommelier Wine Flight', category: 'Beverages', price: 45.00, description: 'Three curated wines paired to your meal by our sommelier', available: true, popular: false, image: null, allergens: [] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Lobster Bisque', category: 'Starters', price: 18.00, description: 'Classic bisque, cognac cream, chive oil, crusty bread', available: false, popular: false, image: null, allergens: ['shellfish', 'dairy', 'gluten'] },
  { id: uuidv4(), restaurantId: defaultRestaurantId, name: 'Creme Brulee', category: 'Desserts', price: 11.00, description: 'Tahitian vanilla custard, torched caramel crust', available: true, popular: true, image: null, allergens: ['dairy', 'eggs'] },
];

const reservations = [
  { id: uuidv4(), restaurantId: defaultRestaurantId, clientId: clients[0].id, clientName: 'Sophia Andersen', date: '2024-11-25', time: '19:00', partySize: 2, table: 'T-4', status: 'confirmed', specialRequests: 'Window table preferred', createdAt: new Date().toISOString() },
  { id: uuidv4(), restaurantId: defaultRestaurantId, clientId: clients[3].id, clientName: 'James Thornton', date: '2024-11-25', time: '20:00', partySize: 6, table: 'T-12', status: 'confirmed', specialRequests: 'Corporate dinner, need receipts', createdAt: new Date().toISOString() },
  { id: uuidv4(), restaurantId: defaultRestaurantId, clientId: clients[1].id, clientName: 'Marcus Liu', date: '2024-11-26', time: '18:30', partySize: 4, table: 'T-7', status: 'pending', specialRequests: '', createdAt: new Date().toISOString() },
  { id: uuidv4(), restaurantId: defaultRestaurantId, clientId: clients[2].id, clientName: 'Elena Vasquez', date: '2024-11-26', time: '19:30', partySize: 2, table: 'T-3', status: 'confirmed', specialRequests: '', createdAt: new Date().toISOString() },
  { id: uuidv4(), restaurantId: defaultRestaurantId, clientId: clients[4].id, clientName: 'Aisha Okoye', date: '2024-11-27', time: '20:30', partySize: 3, table: 'T-9', status: 'pending', specialRequests: 'Vegan menu required for all guests', createdAt: new Date().toISOString() },
  { id: uuidv4(), restaurantId: defaultRestaurantId, clientId: null, clientName: 'Walk-in Guest', date: '2024-11-24', time: '13:00', partySize: 2, table: 'T-1', status: 'completed', specialRequests: '', createdAt: new Date().toISOString() },
];

const settingsByRestaurant = {
  [defaultRestaurantId]: {
    ...createDefaultSettings('The Grand Bistro'),
    address: '24 Rue de la Paix, Paris 75001',
    phone: '+33 1 42 96 00 00',
    email: 'contact@grandbistro.com',
  },
};

const getRestaurantSettings = (restaurantId, restaurantName) => {
  if (!settingsByRestaurant[restaurantId]) {
    settingsByRestaurant[restaurantId] = createDefaultSettings(restaurantName);
  }
  return settingsByRestaurant[restaurantId];
};

module.exports = {
  users,
  clients,
  menuItems,
  reservations,
  settingsByRestaurant,
  createDefaultSettings,
  getRestaurantSettings,
};
