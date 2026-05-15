import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/reservations', icon: 'event_seat', label: 'Reservations' },
  { to: '/clients', icon: 'people', label: 'Clients' },
  { to: '/menu', icon: 'restaurant_menu', label: 'Menu' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-surface-container-lowest border-r border-outline-variant sidebar-transition ${collapsed ? 'w-16' : 'w-56'} shrink-0`}>
        {/* Brand */}
        <div className={`flex items-center gap-2 px-4 py-5 border-b border-outline-variant ${collapsed ? 'justify-center' : ''}`}>
          <span className="material-symbols-outlined text-primary text-2xl">restaurant_menu</span>
          {!collapsed && <span className="font-bold text-emerald-900 text-sm">RestoHost Pro</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Collapse */}
        <div className="border-t border-outline-variant p-2 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-on-surface truncate">{user?.name}</p>
              <p className="text-xs text-on-surface-variant truncate">{user?.restaurant}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors ${collapsed ? 'justify-center' : ''}`}
            title="Logout"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
