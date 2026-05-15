import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, sub, color = 'primary' }) {
  const colorClass = color === 'error'
    ? 'bg-error/10 text-error'
    : 'bg-primary/10 text-primary';

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex items-start gap-4 card-hover">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
        {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const statusColors = { confirmed: 'text-emerald-700 bg-emerald-50', pending: 'text-amber-700 bg-amber-50', completed: 'text-blue-700 bg-blue-50', cancelled: 'text-red-700 bg-red-50' };

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: loadingStats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.stats });
  const { data: revenue } = useQuery({ queryKey: ['dashboard-revenue'], queryFn: dashboardApi.revenue });

  if (loadingStats) return (
    <div className="flex items-center justify-center h-64">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">refresh</span>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-sm text-on-surface-variant mt-1">Welcome back, {user?.name} · {user?.restaurant}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="event_seat" label="Today's Reservations" value={stats?.todayReservations ?? 0} sub={`${stats?.confirmedToday ?? 0} confirmed`} />
        <StatCard icon="group" label="Total Guests Today" value={stats?.totalGuestsToday ?? 0} sub="across all tables" />
        <StatCard icon="star" label="VIP Clients" value={stats?.vipClients ?? 0} sub={`of ${stats?.totalClients ?? 0} total clients`} />
        <StatCard icon="restaurant_menu" label="Menu Items" value={stats?.availableMenuItems ?? 0} sub={`of ${stats?.menuItems ?? 0} total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h2 className="text-base font-semibold text-on-surface mb-6">Weekly Revenue</h2>
          {revenue ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003527" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#003527" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#404944' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#404944' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#003527" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-on-surface-variant">Loading chart…</div>}
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h2 className="text-base font-semibold text-on-surface mb-4">Upcoming</h2>
          <div className="space-y-3">
            {(stats?.upcomingReservations || []).length === 0 && (
              <p className="text-sm text-on-surface-variant">No upcoming reservations.</p>
            )}
            {(stats?.upcomingReservations || []).map(r => (
              <div key={r.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{r.clientName}</p>
                  <p className="text-xs text-on-surface-variant">{r.date} · {r.time} · {r.partySize} guests</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status] || ''}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
