import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clientApi } from '../../services/api';

const TYPE_ICONS = { restaurant: 'restaurant', bar: 'local_bar', hotel: 'hotel', motel: 'bed' };
const TYPE_COLORS = {
  restaurant: 'bg-emerald-50 text-emerald-700',
  bar: 'bg-purple-50 text-purple-700',
  hotel: 'bg-blue-50 text-blue-700',
  motel: 'bg-orange-50 text-orange-700',
};

function StarRating({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i}
          className={`material-symbols-outlined text-sm ${i <= score ? 'text-yellow-400' : 'text-gray-200'}`}
          style={{ fontVariationSettings: i <= score ? "'FILL' 1" : "'FILL' 0" }}>
          star
        </span>
      ))}
    </div>
  );
}

export default function ClientHistoryPage() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['client-history'],
    queryFn: clientApi.history,
  });

  return (
    <div className="min-h-screen bg-[#f0f2f0]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3">
        <span className="font-bold text-[#0d1f1a] text-sm">Places Visited</span>
      </div>

      <div className="p-8 max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f1a]">Places Visited</h1>
          <p className="text-sm text-[#888] mt-0.5">
            {history.length} place{history.length !== 1 ? 's' : ''} visited
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-[#0d6644] text-3xl">refresh</span>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <span className="material-symbols-outlined text-gray-200 text-5xl block mb-3">history</span>
            <p className="text-[#aaa] mb-4">You haven't visited any places yet</p>
            <Link to="/client/explore" className="bg-[#0d6644] text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-[#0a5236] transition-colors inline-block">
              Explore Places
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {history.map(({ establishment: est, visitCount, lastVisit, myRating }) => (
              <div key={est.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Color banner */}
                <div className={`h-20 flex items-center justify-center ${TYPE_COLORS[est.type] || 'bg-gray-50'}`}>
                  <span className="material-symbols-outlined text-4xl opacity-40">
                    {TYPE_ICONS[est.type] || 'place'}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[est.type]}`}>
                        {est.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#0d1f1a]">{est.name}</h3>
                    {est.address && <p className="text-xs text-[#aaa] mt-0.5">{est.address}</p>}
                  </div>

                  <div className="flex gap-4 text-xs text-[#666]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">confirmation_number</span>
                      {visitCount} visit{visitCount !== 1 ? 's' : ''}
                    </span>
                    {lastVisit && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        Last: {lastVisit}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {myRating ? (
                    <div className="bg-[#f8faf9] rounded-xl px-3 py-2.5">
                      <p className="text-xs text-[#aaa] mb-1">Your rating</p>
                      <StarRating score={myRating.score} />
                      {myRating.comment && (
                        <p className="text-xs text-[#555] mt-1.5 italic">"{myRating.comment}"</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2.5 flex items-center justify-between">
                      <p className="text-xs text-yellow-700 font-medium">You haven't rated this yet</p>
                      <Link
                        to={`/client/place/${est.id}`}
                        className="text-xs text-[#0d6644] font-bold hover:underline"
                      >
                        Rate now →
                      </Link>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Link
                      to={`/client/place/${est.id}`}
                      className="flex-1 text-center border border-gray-200 text-[#444] text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Place
                    </Link>
                    <Link
                      to={`/client/place/${est.id}`}
                      state={{ tab: 'Book' }}
                      className="flex-1 text-center bg-[#0d6644] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#0a5236] transition-colors"
                    >
                      Book Again
                    </Link>
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