import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageFooter from '../components/PageFooter';

const STATUS_STYLES = {
  confirmed: 'bg-blue-100 text-blue-700',
  pending:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  arrived:   'bg-emerald-100 text-emerald-700',
};

function Avatar({ name }) {
  const colors = [
    'bg-teal-400', 'bg-blue-400', 'bg-purple-400',
    'bg-orange-400', 'bg-pink-400', 'bg-indigo-400',
  ];
  const bg = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${bg}`}>
      {name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.stats });
  const { data: revenue } = useQuery({ queryKey: ['dashboard-revenue'], queryFn: dashboardApi.revenue });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <span className="material-symbols-outlined animate-spin text-[#0d6644] text-4xl">refresh</span>
    </div>
  );

  const upcomingList = stats?.upcomingReservations || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f0]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm text-[#888]">
          <span>Overview</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-[#0d1f1a] font-semibold">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">search</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">notifications</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">help</span></button>
          <div className="w-8 h-8 rounded-full bg-[#0d6644] flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) || 'M'}
          </div>
        </div>
      </div>

      {/* Main content — flex-1 so footer stays at bottom */}
      <div className="flex-1 p-8 space-y-6 max-w-5xl w-full">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f1a]">Dashboard</h1>
          <p className="text-sm text-[#888] mt-0.5">
            Welcome back, {user?.name}. Here's what's happening at {user?.restaurant} today.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 bg-[#e6f4ee] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0d6644] text-lg">home</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12.5%</span>
            </div>
            <p className="text-xs text-[#888] uppercase tracking-wide font-semibold mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-[#0d1f1a]">$12,480.00</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500 text-lg">calendar_month</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {stats?.todayReservations ?? 0} Today
              </span>
            </div>
            <p className="text-xs text-[#888] uppercase tracking-wide font-semibold mb-1">New Reservations</p>
            <p className="text-2xl font-bold text-[#0d1f1a]">{stats?.todayReservations ?? 42}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-400 text-lg">table_restaurant</span>
              </div>
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Peak Hour</span>
            </div>
            <p className="text-xs text-[#888] uppercase tracking-wide font-semibold mb-1">Active Tables</p>
            <p className="text-2xl font-bold text-[#0d1f1a]">
              {stats?.confirmedToday ?? 18}/{stats?.tableCapacity ?? 24}
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-[#0d1f1a]">Revenue Trend</h2>
              <p className="text-xs text-[#888]">Weekly financial overview</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-[#444] focus:outline-none focus:border-[#0d6644] bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
            </select>
          </div>
          {revenue ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue} barSize={28}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {(revenue || []).map((entry, index) => {
                    const max = Math.max(...revenue.map(r => r.revenue));
                    return <Cell key={index} fill={entry.revenue === max ? '#0d3d2e' : '#b2e8d8'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[#aaa] text-sm">Loading chart…</div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#0d1f1a]">Recent Bookings</h2>
            <button className="text-xs text-[#0d6644] font-semibold hover:underline">View All</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[#aaa] uppercase tracking-wide border-b border-gray-100">
                <th className="px-6 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Guests</th>
                <th className="px-4 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">Table</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {upcomingList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#aaa]">No recent bookings</td>
                </tr>
              ) : (
                upcomingList.map(r => (
                  <tr key={r.id} className="hover:bg-[#f8faf9] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.clientName} />
                        <div>
                          <p className="font-semibold text-[#0d1f1a] text-sm">{r.clientName}</p>
                          <p className="text-xs text-[#aaa]">{r.vip ? 'VIP Guest' : 'Regular Member'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#555]">{r.partySize}</td>
                    <td className="px-4 py-4 text-[#555]">{r.time}</td>
                    <td className="px-4 py-4 text-[#555]">{r.table || '—'}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}