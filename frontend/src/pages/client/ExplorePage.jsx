import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { establishmentsApi } from '../../services/api';

const TYPE_FILTERS = ['', 'restaurant', 'bar', 'hotel', 'motel'];
const TYPE_LABELS = { '': 'All', restaurant: 'Restaurants', bar: 'Bars', hotel: 'Hotels', motel: 'Motels' };
const TYPE_ICONS = { restaurant: 'restaurant', bar: 'local_bar', hotel: 'hotel', motel: 'bed' };
const TYPE_COLORS = {
  restaurant: 'bg-emerald-50 text-emerald-700',
  bar: 'bg-purple-50 text-purple-700',
  hotel: 'bg-blue-50 text-blue-700',
  motel: 'bg-orange-50 text-orange-700',
};
const PRICE_COLORS = { '$': 'text-emerald-600', '$$': 'text-blue-600', '$$$': 'text-orange-500', '$$$$': 'text-red-500' };

function StarRating({ score }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`material-symbols-outlined text-xs ${i <= Math.round(score) ? 'text-yellow-400' : 'text-gray-200'}`}
            style={{ fontVariationSettings: i <= Math.round(score) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
        ))}
      </div>
      <span className="text-xs text-[#888]">{score}</span>
    </div>
  );
}

export default function ExplorePage() {
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');

  const { data: places = [], isLoading } = useQuery({
    queryKey: ['establishments', type, search],
    queryFn: () => establishmentsApi.list({ ...(type && { type }), ...(search && { search }) }),
  });

  return (
    <div className="min-h-screen bg-[#f0f2f0]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
        <span className="font-bold text-[#0d1f1a] text-sm">Explore Places</span>
        <div className="flex items-center gap-3">
          <button className="text-[#888]"><span className="material-symbols-outlined text-xl">notifications</span></button>
        </div>
      </div>

      <div className="p-8 space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f1a]">Explore Places</h1>
          <p className="text-sm text-[#888] mt-0.5">Discover hotels, restaurants, bars and more</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] text-lg">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, tag, or description…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0d6644] transition-colors"
          />
        </div>

        {/* Type filters */}
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                type === t
                  ? 'bg-[#0d6644] text-white border-[#0d6644]'
                  : 'border-gray-200 text-[#666] hover:bg-gray-50'
              }`}
            >
              {t && <span className="material-symbols-outlined text-sm">{TYPE_ICONS[t]}</span>}
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-[#0d6644] text-3xl">refresh</span>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#aaa] font-medium">{places.length} place{places.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {places.map(place => (
                <Link
                  key={place.id}
                  to={`/client/place/${place.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image / placeholder */}
                  <div className="h-36 bg-gradient-to-br from-[#e6f4ee] to-[#c6e8da] flex items-center justify-center relative">
                    <span className={`material-symbols-outlined text-5xl ${TYPE_COLORS[place.type]?.split(' ')[1] || 'text-[#0d6644]'}`}>
                      {TYPE_ICONS[place.type] || 'place'}
                    </span>
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TYPE_COLORS[place.type] || 'bg-gray-100 text-gray-600'}`}>
                      {place.type}
                    </span>
                    <span className={`absolute top-3 right-3 text-xs font-bold ${PRICE_COLORS[place.priceRange] || 'text-[#888]'}`}>
                      {place.priceRange}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-[#0d1f1a] group-hover:text-[#0d6644] transition-colors">{place.name}</h3>
                      <p className="text-xs text-[#aaa] mt-0.5">{place.address}</p>
                    </div>

                    <StarRating score={place.rating} />

                    <p className="text-xs text-[#666] leading-relaxed line-clamp-2">{place.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {place.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-[#f0f2f0] text-[#666] px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#aaa]">
                        <span className="material-symbols-outlined text-xs align-middle mr-0.5">schedule</span>
                        {place.openingHours}
                      </span>
                      <span className="text-xs font-semibold text-[#0d6644] group-hover:underline">View →</span>
                    </div>
                  </div>
                </Link>
              ))}

              {places.length === 0 && (
                <div className="col-span-3 text-center py-16">
                  <span className="material-symbols-outlined text-gray-200 text-5xl block mb-3">travel_explore</span>
                  <p className="text-[#aaa]">No places found. Try a different search.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}