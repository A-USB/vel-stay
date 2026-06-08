import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { establishmentsApi, clientApi } from '../../services/api';

const TYPE_ICONS = { restaurant: 'restaurant', bar: 'local_bar', hotel: 'hotel', motel: 'bed' };
const TYPE_COLORS = { restaurant: 'bg-emerald-50 text-emerald-700', bar: 'bg-purple-50 text-purple-700', hotel: 'bg-blue-50 text-blue-700', motel: 'bg-orange-50 text-orange-700' };

function StarRating({ score, interactive = false, onSelect }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          onClick={() => interactive && onSelect?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`material-symbols-outlined ${interactive ? 'cursor-pointer text-2xl' : 'text-sm'} ${
            i <= (hover || score) ? 'text-yellow-400' : 'text-gray-200'
          }`}
          style={{ fontVariationSettings: i <= (hover || score) ? "'FILL' 1" : "'FILL' 0" }}
        >star</span>
      ))}
    </div>
  );
}

const TABS = ['Overview', 'Menu', 'Book', 'Reviews'];

export default function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState('Overview');
  const [bookForm, setBookForm] = useState({ date: '', time: '', partySize: '', specialRequests: '' });
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const { data: place, isLoading: loadingPlace } = useQuery({
    queryKey: ['establishment', id],
    queryFn: () => establishmentsApi.get(id),
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['establishment-menu', id],
    queryFn: () => establishmentsApi.menu(id),
    enabled: tab === 'Menu',
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['establishment-ratings', id],
    queryFn: () => establishmentsApi.ratings(id),
    enabled: tab === 'Reviews',
  });

  const bookMutation = useMutation({
    mutationFn: (data) => clientApi.book(data),
    onSuccess: () => {
      setBookSuccess(true);
      setBookForm({ date: '', time: '', partySize: '', specialRequests: '' });
      qc.invalidateQueries({ queryKey: ['client-dashboard'] });
      qc.invalidateQueries({ queryKey: ['client-bookings'] });
    },
    onError: (err) => setBookError(err.response?.data?.error || 'Booking failed'),
  });

  const ratingMutation = useMutation({
    mutationFn: (data) => clientApi.submitRating(data),
    onSuccess: () => {
      setRatingSuccess(true);
      qc.invalidateQueries({ queryKey: ['establishment-ratings', id] });
      qc.invalidateQueries({ queryKey: ['establishment', id] });
    },
  });

  const handleBook = (e) => {
    e.preventDefault();
    setBookError('');
    setBookSuccess(false);
    bookMutation.mutate({ establishmentId: id, ...bookForm, partySize: Number(bookForm.partySize) });
  };

  const handleRating = (e) => {
    e.preventDefault();
    if (!ratingScore) return;
    ratingMutation.mutate({ establishmentId: id, score: ratingScore, comment: ratingComment });
  };

  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loadingPlace) return (
    <div className="flex items-center justify-center h-64">
      <span className="material-symbols-outlined animate-spin text-[#0d6644] text-4xl">refresh</span>
    </div>
  );
  if (!place) return <div className="p-8 text-[#aaa]">Place not found.</div>;

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6644] bg-white";

  return (
    <div className="min-h-screen bg-[#f0f2f0]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/client/explore')} className="text-[#888] hover:text-[#0d1f1a] transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-bold text-[#0d1f1a] text-sm">{place.name}</span>
      </div>

      <div className="p-8 max-w-4xl space-y-6">
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className={`h-40 flex items-center justify-center ${TYPE_COLORS[place.type] || 'bg-gray-50'}`}>
            <span className="material-symbols-outlined text-7xl opacity-30">{TYPE_ICONS[place.type] || 'place'}</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TYPE_COLORS[place.type]}`}>{place.type}</span>
                  <span className="text-xs text-[#aaa] font-bold">{place.priceRange}</span>
                </div>
                <h1 className="text-xl font-bold text-[#0d1f1a]">{place.name}</h1>
                <p className="text-sm text-[#aaa] mt-0.5">{place.address}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`material-symbols-outlined text-sm ${i <= Math.round(place.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                      style={{ fontVariationSettings: i <= Math.round(place.rating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  ))}
                </div>
                <p className="text-xs text-[#aaa] mt-0.5">{place.rating} · {place.reviewCount} reviews</p>
              </div>
            </div>
            <p className="text-sm text-[#555] leading-relaxed">{place.description}</p>
            <div className="flex flex-wrap gap-2">
              {place.tags?.map(tag => (
                <span key={tag} className="text-xs bg-[#f0f2f0] text-[#666] px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="flex gap-6 text-xs text-[#888] pt-1">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{place.openingHours}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">phone</span>{place.phone}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">email</span>{place.email}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-[#0d6644] text-white' : 'text-[#666] hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'Overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: 'table_restaurant', label: 'Table Capacity', value: place.tableCapacity },
              { icon: 'star', label: 'Rating', value: `${place.rating} / 5` },
              { icon: 'rate_review', label: 'Reviews', value: place.reviewCount },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <span className="material-symbols-outlined text-[#0d6644] text-2xl block mb-2">{s.icon}</span>
                <p className="text-xs text-[#aaa] font-semibold uppercase tracking-wide">{s.label}</p>
                <p className="text-xl font-bold text-[#0d1f1a] mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'Menu' && (
          <div className="space-y-6">
            {Object.keys(menuByCategory).length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <span className="material-symbols-outlined text-gray-200 text-4xl block mb-2">restaurant_menu</span>
                <p className="text-[#aaa] text-sm">No menu items available</p>
              </div>
            )}
            {Object.entries(menuByCategory).map(([cat, items]) => (
              <div key={cat}>
                <h3 className="font-bold text-[#0d1f1a] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0d6644] text-lg">restaurant_menu</span>{cat}
                </h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {items.map((item, i) => (
                    <div key={item.id} className={`flex items-start justify-between px-6 py-4 ${i !== items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#0d1f1a] text-sm">{item.name}</p>
                          {item.popular && <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full font-semibold">Popular</span>}
                        </div>
                        {item.description && <p className="text-xs text-[#aaa] mt-0.5">{item.description}</p>}
                        {item.allergens?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.allergens.map(a => (
                              <span key={a} className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-[#0d6644] shrink-0">${Number(item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Book' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md space-y-4">
            <h2 className="font-bold text-[#0d1f1a]">Make a Reservation</h2>

            {bookSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Booking submitted! You'll receive confirmation shortly.
              </div>
            )}
            {bookError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{bookError}</div>
            )}

            <form onSubmit={handleBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#666] block mb-1">Date</label>
                  <input type="date" value={bookForm.date} onChange={e => setBookForm(f => ({ ...f, date: e.target.value }))} className={inputClass} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#666] block mb-1">Time</label>
                  <input type="time" value={bookForm.time} onChange={e => setBookForm(f => ({ ...f, time: e.target.value }))} className={inputClass} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#666] block mb-1">Party Size</label>
                <input type="number" min="1" max={place.tableCapacity} value={bookForm.partySize} onChange={e => setBookForm(f => ({ ...f, partySize: e.target.value }))} placeholder="2" className={inputClass} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#666] block mb-1">Special Requests</label>
                <textarea value={bookForm.specialRequests} onChange={e => setBookForm(f => ({ ...f, specialRequests: e.target.value }))} placeholder="Any dietary requirements, accessibility needs…" rows={3} className={inputClass + ' resize-none'} />
              </div>
              <button type="submit" disabled={bookMutation.isPending} className="w-full bg-[#0d6644] text-white font-semibold py-3 rounded-xl text-sm hover:bg-[#0a5236] transition-colors disabled:opacity-60">
                {bookMutation.isPending ? 'Booking…' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        )}

        {tab === 'Reviews' && (
          <div className="space-y-4">
            {/* Submit rating */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-[#0d1f1a]">Leave a Review</h3>
              {ratingSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Thank you for your review!
                </div>
              ) : (
                <form onSubmit={handleRating} className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[#666] mb-2">Your rating</p>
                    <StarRating score={ratingScore} interactive onSelect={setRatingScore} />
                  </div>
                  <textarea
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    placeholder="Share your experience…"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6644] bg-white resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!ratingScore || ratingMutation.isPending}
                    className="bg-[#0d6644] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-[#0a5236] transition-colors disabled:opacity-40"
                  >
                    {ratingMutation.isPending ? 'Submitting…' : 'Submit Review'}
                  </button>
                  {ratingMutation.isError && (
                    <p className="text-xs text-red-500">{ratingMutation.error?.response?.data?.error || 'Could not submit review'}</p>
                  )}
                </form>
              )}
            </div>

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <span className="material-symbols-outlined text-gray-200 text-4xl block mb-2">rate_review</span>
                <p className="text-[#aaa] text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : (
              reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <StarRating score={r.score} />
                    <span className="text-xs text-[#aaa]">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="text-sm text-[#555] leading-relaxed">"{r.comment}"</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}