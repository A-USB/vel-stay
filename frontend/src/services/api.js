import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rh_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("rh_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  signup: (data) => api.post("/auth/signup", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
};

// ─── Manager: Reservations ─────────────────────────────────────────────────
export const reservationsApi = {
  list: (params) => api.get("/reservations", { params }).then((r) => r.data),
  get: (id) => api.get(`/reservations/${id}`).then((r) => r.data),
  create: (data) => api.post("/reservations", data).then((r) => r.data),
  update: (id, data) =>
    api.patch(`/reservations/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/reservations/${id}`).then((r) => r.data),
};

// ─── Manager: Clients ──────────────────────────────────────────────────────
export const clientsApi = {
  list: (params) => api.get("/clients", { params }).then((r) => r.data),
  get: (id) => api.get(`/clients/${id}`).then((r) => r.data),
  create: (data) => api.post("/clients", data).then((r) => r.data),
  update: (id, data) => api.patch(`/clients/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/clients/${id}`).then((r) => r.data),
};

// ─── Manager: Menu ─────────────────────────────────────────────────────────
export const menuApi = {
  list: (params) => api.get("/menu", { params }).then((r) => r.data),
  categories: () => api.get("/menu/categories").then((r) => r.data),
  get: (id) => api.get(`/menu/${id}`).then((r) => r.data),
  create: (data) => api.post("/menu", data).then((r) => r.data),
  update: (id, data) => api.patch(`/menu/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/menu/${id}`).then((r) => r.data),
};

// ─── Manager: Dashboard ────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get("/dashboard/stats").then((r) => r.data),
  revenue: () => api.get("/dashboard/revenue").then((r) => r.data),
};

// ─── Manager: Settings ─────────────────────────────────────────────────────
export const settingsApi = {
  get: () => api.get("/settings").then((r) => r.data),
  update: (data) => api.patch("/settings", data).then((r) => r.data),
};

// ─── Client: Establishments ────────────────────────────────────────────────
export const establishmentsApi = {
  list: (params) => api.get("/establishments", { params }).then((r) => r.data),
  get: (id) => api.get(`/establishments/${id}`).then((r) => r.data),
  menu: (id) => api.get(`/establishments/${id}/menu`).then((r) => r.data),
  ratings: (id) => api.get(`/establishments/${id}/ratings`).then((r) => r.data),
};

// ─── Client: Workspace ─────────────────────────────────────────────────────
export const clientApi = {
  dashboard: () => api.get("/client/dashboard").then((r) => r.data),
  // Bookings
  bookings: (params) =>
    api.get("/client/bookings", { params }).then((r) => r.data),
  book: (data) => api.post("/client/bookings", data).then((r) => r.data),
  updateBooking: (id, data) =>
    api.patch(`/client/bookings/${id}`, data).then((r) => r.data),
  cancelBooking: (id) =>
    api
      .patch(`/client/bookings/${id}`, { status: "cancelled" })
      .then((r) => r.data),
  deleteBooking: (id) =>
    api.delete(`/client/bookings/${id}`).then((r) => r.data),
  // History
  history: () => api.get("/client/history").then((r) => r.data),
  // Ratings
  myRatings: () => api.get("/client/ratings").then((r) => r.data),
  submitRating: (data) => api.post("/client/ratings", data).then((r) => r.data),
};

export default api;
