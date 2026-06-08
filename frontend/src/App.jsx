import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ReservationsPage from './pages/ReservationsPage';
import ClientsPage from './pages/ClientsPage';
import MenuPage from './pages/MenuPage';
import SettingsPage from './pages/SettingsPage';

import ClientLayout from './components/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ExplorePage from './pages/client/ExplorePage';
import PlaceDetailPage from './pages/client/PlaceDetailPage';
import ClientBookingsPage from './pages/client/ClientBookingsPage';
import ClientHistoryPage from './pages/client/ClientHistoryPage';


function PrivateManagerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'manager') return <Navigate to="/client" replace />;
  return children;
}

function PrivateClientRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'client') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'manager') return <Navigate to="/dashboard" replace />;
  if (user?.role === 'client') return <Navigate to="/client" replace />;
  return children;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="material-symbols-outlined animate-spin text-[#0d6644] text-4xl">refresh</span>
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />

          <Route path="/" element={<PrivateManagerRoute><Layout /></PrivateManagerRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="/client" element={<PrivateClientRoute><ClientLayout /></PrivateClientRoute>}>
            <Route index element={<ClientDashboard />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="place/:id" element={<PlaceDetailPage />} />
            <Route path="bookings" element={<ClientBookingsPage />} />
            <Route path="history" element={<ClientHistoryPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}