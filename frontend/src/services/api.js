import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('rh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rh_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  signup: (data) => api.post('/auth/signup', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
};

// ─── Reservations ─────────────────────────────────────────────────────────
export const reservationsApi = {
  list: (params) => api.get('/reservations', { params }).then(r => r.data),
  get: (id) => api.get(`/reservations/${id}`).then(r => r.data),
  create: (data) => api.post('/reservations', data).then(r => r.data),
  update: (id, data) => api.patch(`/reservations/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/reservations/${id}`).then(r => r.data),
};

// ─── Clients ──────────────────────────────────────────────────────────────
export const clientsApi = {
  list: (params) => api.get('/clients', { params }).then(r => r.data),
  get: (id) => api.get(`/clients/${id}`).then(r => r.data),
  create: (data) => api.post('/clients', data).then(r => r.data),
  update: (id, data) => api.patch(`/clients/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/clients/${id}`).then(r => r.data),
};

// ─── Menu ─────────────────────────────────────────────────────────────────
export const menuApi = {
  list: (params) => api.get('/menu', { params }).then(r => r.data),
  categories: () => api.get('/menu/categories').then(r => r.data),
  get: (id) => api.get(`/menu/${id}`).then(r => r.data),
  create: (data) => api.post('/menu', data).then(r => r.data),
  update: (id, data) => api.patch(`/menu/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/menu/${id}`).then(r => r.data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then(r => r.data),
  revenue: () => api.get('/dashboard/revenue').then(r => r.data),
};

// ─── Settings ─────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => api.get('/settings').then(r => r.data),
  update: (data) => api.patch('/settings', data).then(r => r.data),
};

export default api;
