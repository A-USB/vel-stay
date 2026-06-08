import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/client', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/client/explore', icon: 'travel_explore', label: 'Explore' },
  { to: '/client/bookings', icon: 'calendar_month', label: 'My Bookings' },
  { to: '/client/history', icon: 'history', label: 'History' },
];

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#f0f2f0]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* Sidebar */}
      <aside className={`flex flex-col bg-white border-r border-gray-100 shrink-0 transition-all duration-200 ${collapsed ? 'w-16' : 'w-52'}`}>

        {/* Brand */}
        <div className={`px-5 pt-6 pb-4 border-b border-gray-100 ${collapsed ? 'flex justify-center px-0' : ''}`}>
          {!collapsed ? (
            <div>
              <p className="font-bold text-[#0d1f1a] text-sm leading-tight">{user?.name || 'Guest'}</p>
              <p className="text-xs text-[#aaa] uppercase tracking-widest mt-0.5">Guest Account</p>
            </div>
          ) : (
            <div className="w-7 h-7 bg-[#0d6644] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.name?.charAt(0) || 'G'}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#e6f4ee] text-[#0d6644] font-semibold'
                    : 'text-[#666] hover:bg-gray-50 hover:text-[#0d1f1a]'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <span className="material-symbols-outlined text-[1.1rem]">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-2 space-y-0.5">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[#666] hover:bg-red-50 hover:text-red-600 transition-colors ${collapsed ? 'justify-center' : ''}`}
            title="Logout"
          >
            <span className="material-symbols-outlined text-[1.1rem]">logout</span>
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-[#aaa] hover:bg-gray-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-base">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}