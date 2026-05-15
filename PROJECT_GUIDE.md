# RestoHost Pro Project Guide

## Quick Start

Open two terminals:

```bash
cd C:\Users\MESSI\Desktop\ReactJS\backend
npm run dev
```

```bash
cd C:\Users\MESSI\Desktop\ReactJS\frontend
npm run dev
```

Frontend: `http://localhost:3000`
Backend API: `http://localhost:5000/api`

Seed login:

```text
Email: manager@grandbistro.com
Password: password123
```

## Architecture

The app is split into:

- `backend/`: Express API, JWT auth, in-memory data store.
- `frontend/`: Vite React app with React Router, React Query, Axios, Tailwind, and Recharts.

The frontend talks to the backend through `frontend/src/services/api.js`. During development, `frontend/vite.config.js` proxies `/api` to `http://localhost:5000`.

## Backend Map

- `backend/index.js`: Express app setup, CORS, JSON parsing, API route mounting, health check, global errors.
- `backend/middleware/auth.js`: Reads the Bearer token, verifies JWT, reloads the current user, and attaches restaurant context.
- `backend/models/store.js`: In-memory seed data and per-restaurant settings. This resets when the backend restarts.
- `backend/utils/validation.js`: Shared validation helpers for email, dates, times, numbers, arrays, and reservation statuses.
- `backend/routes/auth.js`: Login, signup, current user, logout.
- `backend/routes/reservations.js`: Reservation CRUD, table conflict checks, client ownership checks.
- `backend/routes/clients.js`: Client CRUD scoped to the logged-in restaurant.
- `backend/routes/menu.js`: Menu CRUD scoped to the logged-in restaurant.
- `backend/routes/dashboard.js`: Dashboard summaries and revenue chart data.
- `backend/routes/settings.js`: Restaurant profile and preferences.

## Frontend Map

- `frontend/src/main.jsx`: React Query provider and app bootstrap.
- `frontend/src/App.jsx`: Public/private route definitions.
- `frontend/src/context/AuthContext.jsx`: Login/signup/logout state and token restore.
- `frontend/src/components/Layout.jsx`: Authenticated shell with sidebar navigation.
- `frontend/src/pages/DashboardPage.jsx`: Stats, chart, upcoming reservations.
- `frontend/src/pages/ReservationsPage.jsx`: Reservation list, filters, create/edit modal.
- `frontend/src/pages/ClientsPage.jsx`: Client cards, search, VIP toggle, create/edit modal.
- `frontend/src/pages/MenuPage.jsx`: Menu cards, categories, availability toggle, create/edit modal.
- `frontend/src/pages/SettingsPage.jsx`: Restaurant settings form.
- `frontend/src/index.css`: Global Tailwind styles and shared component polish.

## Important Notes

This project still uses an in-memory backend store. It is good for demos and UI development, but data disappears on restart. The next production-level step is replacing `backend/models/store.js` with a real database layer such as PostgreSQL, SQLite, MongoDB, or Prisma-backed storage.

Each user now has a `restaurantId`, and clients, menu items, reservations, dashboard data, and settings are scoped to that restaurant. That prevents one signed-up restaurant from seeing another restaurant's data.
