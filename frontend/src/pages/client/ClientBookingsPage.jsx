import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../../services/api';

const STATUS_STYLES = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const TYPE_ICONS = { restaurant: 'restaurant', bar: 'local_bar', hotel: 'hotel', motel: 'bed' };

export default function ClientBookingsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['client-bookings', filter],
    queryFn: () => clientApi.bookings(filter ? { status: filter } : {}),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => clientApi.cancelBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-bookings'] }),
  });

  const filters = ['', 'confirmed', 'pending', 'completed', 'cancelled'];

  return (
    <div className="min-h-screen bg-[#f0f2f0]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
        <span className="font-bold text-[#0d1f1a] text-sm">My Bookings</span>
        <Link to="/client/explore" className="flex items-center gap-1.5 bg-[#0d6644] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#0a5236] transition-colors">
          <span className="material-symbols-outlined text-sm">add</span> New Booking
        </Link>
      </div>

      <div className="p-8 max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f1a]">My Bookings</h1>
          <p className="text-sm text-[#888] mt-0.5">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filters.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                filter === s
                  ? 'bg-[#0d6644] text-white border-[#0d6644]'
                  : 'border-gray-200 text-[#666] hover:bg-gray-50'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-[#0d6644] text-3xl">refresh</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <span className="material-symbols-outlined text-gray-200 text-5xl block mb-3">calendar_month</span>
            <p className="text-[#aaa] mb-4">No bookings found</p>
            <Link to="/client/explore" className="bg-[#0d6644] text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-[#0a5236] transition-colors inline-block">
              Explore Places
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-[#e6f4ee] rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#0d6644] text-lg">
                        {TYPE_ICONS[b.establishmentType] || 'place'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[#0d1f1a]">{b.establishmentName}</p>
                      <p className="text-xs text-[#aaa] mt-0.5 capitalize">{b.establishmentType}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#666]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          {b.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {b.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">group</span>
                          {b.partySize} guest{b.partySize !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {b.specialRequests && (
                        <p className="text-xs text-[#aaa] mt-1.5 italic">"{b.specialRequests}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                    {(b.status === 'confirmed' || b.status === 'pending') && (
                      <button
                        onClick={() => { if (confirm('Cancel this booking?')) cancelMutation.mutate(b.id); }}
                        disabled={cancelMutation.isPending}
                        className="text-xs text-red-500 hover:underline font-semibold disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    {b.status === 'completed' && (
                      <Link
                        to={`/client/place/${b.establishmentId}`}
                        className="text-xs text-[#0d6644] hover:underline font-semibold"
                      >
                        Rate & Review
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}