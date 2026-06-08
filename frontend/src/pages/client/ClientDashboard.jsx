import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clientApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TYPE_ICONS = { restaurant: 'restaurant', bar: 'local_bar', hotel: 'hotel', motel: 'bed' };
const TYPE_COLORS = { restaurant: 'bg-emerald-50 text-emerald-700', bar: 'bg-purple-50 text-purple-700', hotel: 'bg-blue-50 text-blue-700', motel: 'bg-orange-50 text-orange-700' };

const STATUS_STYLES = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StarRating({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`material-symbols-outlined text-sm ${i <= score ? 'text-yellow-400' : 'text-gray-200'}`}
          style={{ fontVariationSettings: i <= score ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['client-dashboard'],
    queryFn: clientApi.dashboard,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <span className="material-symbols-outlined animate-spin text-[#0d6644] text-4xl">refresh</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f0]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
        <span className="font-bold text-[#0d1f1a] text-sm">VelStay</span>
        <div className="flex items-center gap-3">
          <button className="text-[#888]"><span className="material-symbols-outlined text-xl">notifications</span></button>
          <div className="w-8 h-8 rounded-full bg-[#0d6644] flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) || 'G'}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f1a]">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-[#888] mt-0.5">Here's a look at your activity</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: 'calendar_month', label: 'Total Bookings', value: data?.totalBookings ?? 0, color: 'bg-blue-50 text-blue-500' },
            { icon: 'event_available', label: 'Upcoming', value: data?.upcomingCount ?? 0, color: 'bg-emerald-50 text-emerald-600' },
            { icon: 'place', label: 'Places Visited', value: data?.placesVisited ?? 0, color: 'bg-purple-50 text-purple-500' },
            { icon: 'star', label: 'Ratings Given', value: data?.ratingsGiven ?? 0, color: 'bg-yellow-50 text-yellow-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <span className="material-symbols-outlined text-lg">{s.icon}</span>
              </div>
              <p className="text-xs text-[#888] font-semibold uppercase tracking-wide mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#0d1f1a]">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming bookings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#0d1f1a]">Upcoming Bookings</h2>
              <Link to="/client/bookings" className="text-xs text-[#0d6644] font-semibold hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(data?.upcomingBookings || []).length === 0 && (
                <div className="px-6 py-8 text-center">
                  <span className="material-symbols-outlined text-gray-200 text-4xl block mb-2">calendar_month</span>
                  <p className="text-sm text-[#aaa]">No upcoming bookings</p>
                  <Link to="/client/explore" className="text-xs text-[#0d6644] font-semibold mt-2 inline-block hover:underline">Explore places →</Link>
                </div>
              )}
              {(data?.upcomingBookings || []).map(b => (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#0d1f1a] text-sm">{b.establishmentName}</p>
                    <p className="text-xs text-[#aaa] mt-0.5">{b.date} · {b.time} · {b.partySize} guests</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently visited */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#0d1f1a]">Recently Visited</h2>
              <Link to="/client/history" className="text-xs text-[#0d6644] font-semibold hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(data?.recentlyVisited || []).length === 0 && (
                <div className="px-6 py-8 text-center">
                  <span className="material-symbols-outlined text-gray-200 text-4xl block mb-2">place</span>
                  <p className="text-sm text-[#aaa]">No visits yet</p>
                  <Link to="/client/explore" className="text-xs text-[#0d6644] font-semibold mt-2 inline-block hover:underline">Discover places →</Link>
                </div>
              )}
              {(data?.recentlyVisited || []).map(place => (
                <div key={place.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${TYPE_COLORS[place.type] || 'bg-gray-50 text-gray-500'}`}>
                      <span className="material-symbols-outlined text-base">{TYPE_ICONS[place.type] || 'place'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#0d1f1a] text-sm">{place.name}</p>
                      <p className="text-xs text-[#aaa] capitalize">{place.type} · {place.visits} visit{place.visits !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {place.myRating
                    ? <StarRating score={place.myRating.score} />
                    : (
                      <Link to={`/client/place/${place.id}`} className="text-xs text-[#0d6644] font-semibold hover:underline">
                        Rate
                      </Link>
                    )
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick explore CTA */}
        <div className="bg-[#0d3d2e] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-base">Discover new places</h3>
            <p className="text-[#a8d5c2] text-sm mt-0.5">Hotels, restaurants, bars and more near you</p>
          </div>
          <Link
            to="/client/explore"
            className="bg-[#2ecc8e] text-[#0d1f1a] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#25b87d] transition-colors shrink-0"
          >
            Explore Now
          </Link>
        </div>
      </div>
    </div>
  );
}