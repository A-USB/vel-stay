import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '../services/api';
import PageFooter from '../components/PageFooter';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  // 0=Sun…6=Sat → convert to Mon-first (0=Mon…6=Sun)
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    confirmed:  'bg-emerald-100 text-emerald-700',
    pending:    'bg-amber-100 text-amber-700',
    completed:  'bg-blue-100 text-blue-700',
    cancelled:  'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function UpcomingCard({ r, selected, onClick }) {
  const isSelected = selected?.id === r.id;
  return (
    <div
      onClick={() => onClick(r)}
      className={`rounded-xl p-3.5 cursor-pointer transition-all border ${
        isSelected
          ? 'bg-[#0d6644] border-[#0d6644] text-white'
          : 'bg-white border-gray-100 hover:border-[#0d6644]/30 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <p className={`text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#0d1f1a]'}`}>{r.time}</p>
          <p className={`text-xs mt-0.5 font-medium ${isSelected ? 'text-emerald-200' : 'text-[#555]'}`}>{r.clientName}</p>
        </div>
        {r.table ? (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
            isSelected ? 'bg-white/20 text-white' : 'bg-[#e6f4ee] text-[#0d6644]'
          }`}>
            TABLE {r.table}
          </span>
        ) : (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
            isSelected ? 'bg-amber-400/30 text-amber-100' : 'bg-amber-50 text-amber-600'
          }`}>
            UNASSIGNED
          </span>
        )}
      </div>
      <div className={`flex items-center gap-1 text-xs ${isSelected ? 'text-emerald-200' : 'text-[#888]'}`}>
        <span className="material-symbols-outlined text-sm">group</span>
        {r.partySize}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const emptyForm = { clientName: '', date: '', time: '', partySize: '', table: '', specialRequests: '' };

function BookingModal({ editing, initialDate, onClose, onCreate, onUpdate, loading, apiError }) {
  const [form, setForm] = useState(
    editing
      ? { clientName: editing.clientName, date: editing.date, time: editing.time, partySize: String(editing.partySize), table: editing.table || '', specialRequests: editing.specialRequests || '' }
      : { ...emptyForm, date: initialDate || '' }
  );
  const [errors, setErrors] = useState({});
  const set = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(err => ({ ...err, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.clientName.trim()) e.clientName = 'Guest name is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.time) e.time = 'Time is required';
    if (!form.partySize || Number(form.partySize) < 1) e.partySize = 'Party size must be at least 1';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    // Coerce partySize to number and send default status for new bookings
    const payload = {
      ...form,
      partySize: Number(form.partySize),
      ...(editing ? {} : { status: 'pending' }),
    };

    if (editing) onUpdate({ id: editing.id, data: payload });
    else onCreate(payload);
  };

  const fields = [
    { name: 'clientName', label: 'Guest Name', type: 'text', placeholder: 'Full name' },
    { name: 'date', label: 'Date', type: 'date', placeholder: '' },
    { name: 'time', label: 'Time', type: 'time', placeholder: '' },
    { name: 'partySize', label: 'Party Size', type: 'number', placeholder: '2' },
    { name: 'table', label: 'Table', type: 'text', placeholder: 'e.g. V04 (Window)' },
    { name: 'specialRequests', label: 'Special Requests (optional)', type: 'text', placeholder: 'Any notes…' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0d1f1a]">{editing ? 'Modify Booking' : 'New Booking'}</h2>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#555]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* API-level error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-lg">
            {apiError}
          </div>
        )}

        {fields.map(f => (
          <div key={f.name}>
            <label className="text-xs font-semibold text-[#888] block mb-1">{f.label}</label>
            <input
              name={f.name} type={f.type} value={form[f.name]} onChange={set}
              placeholder={f.placeholder}
              min={f.name === 'partySize' ? 1 : undefined}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm text-[#0d1f1a] focus:outline-none bg-[#fafafa] placeholder-[#ccc] transition-colors ${
                errors[f.name] ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#0d6644]'
              }`}
            />
            {errors[f.name] && (
              <p className="text-red-500 text-[11px] mt-1">{errors[f.name]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-[#555] text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#0d6644] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#0a5236] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> Saving…</>
              : editing ? 'Save Changes' : 'Create Booking'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const qc = useQueryClient();
  const today = new Date();

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => reservationsApi.list({}),
  });

  const createMutation = useMutation({
    mutationFn: reservationsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); closeModal(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => reservationsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); closeModal(); },
  });
  const deleteMutation = useMutation({
    mutationFn: reservationsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); setSelectedBooking(null); },
  });

  const closeModal = () => { setShowModal(false); setEditingBooking(null); };
  const openCreate = (dateStr) => { setEditingBooking(null); setShowModal(true); };
  const openEdit = (r) => { setEditingBooking(r); setShowModal(true); };

  // Group reservations by date string
  const byDate = useMemo(() => {
    const map = {};
    reservations.forEach(r => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [reservations]);

  // Today's / selected day upcoming list sorted by time
  const upcomingList = useMemo(() => {
    const dateStr = toDateStr(today);
    return (byDate[dateStr] || [])
      .filter(r => r.status !== 'cancelled' && r.status !== 'completed')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [byDate]);

  // Selected date bookings
  const selectedDateStr = toDateStr(selectedDate);
  const selectedDateBookings = (byDate[selectedDateStr] || []).sort((a, b) => a.time.localeCompare(b.time));

  // Total today
  const todayStr = toDateStr(today);
  const todayCount = (byDate[todayStr] || []).length;

  // Build calendar grid
  const firstDay = getFirstDayOfMonth(year, month); // 0=Mon
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevMonthDays - firstDay + 1 + i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false });
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f0]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shrink-0">
        <h1 className="font-bold text-[#0d1f1a] text-base">Reservations</h1>
        <div className="flex items-center gap-3">
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">search</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">notifications</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">help</span></button>
          <div className="w-8 h-8 rounded-full bg-[#0d6644] flex items-center justify-center text-white text-xs font-bold">M</div>
        </div>
      </div>

      {/* Body: calendar center + upcoming right */}
      <div className="flex flex-1 overflow-hidden">

        {/* Center column */}
        <div className="flex-1 p-8 overflow-auto space-y-5">

          {/* Month header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0d1f1a]">{MONTHS[month]} {year}</h2>
              <p className="text-sm text-[#888] mt-0.5">
                Manage {reservations.length} bookings across {/* table capacity */} 12 tables today
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#555] hover:bg-gray-50 transition-colors">
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#555] hover:bg-gray-50 transition-colors">
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
              <button
                onClick={() => openCreate(selectedDateStr)}
                className="flex items-center gap-1.5 bg-[#0d6644] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#0a5236] transition-colors ml-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                New Booking
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map(d => (
                <div key={d} className="py-2.5 text-center text-[10px] font-bold text-[#aaa] tracking-widest uppercase">
                  {d}
                </div>
              ))}
            </div>
            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 divide-x divide-gray-50 border-b border-gray-50 last:border-b-0">
                {week.map((cell, ci) => {
                  if (!cell.current) {
                    return <div key={ci} className="min-h-[80px] p-2 bg-[#fafafa] opacity-40" />;
                  }
                  const cellDate = new Date(year, month, cell.day);
                  const cellDateStr = toDateStr(cellDate);
                  const dayBookings = byDate[cellDateStr] || [];
                  const isToday = isSameDay(cellDate, today);
                  const isSelected = isSameDay(cellDate, selectedDate);

                  return (
                    <div
                      key={ci}
                      onClick={() => { setSelectedDate(cellDate); setSelectedBooking(null); }}
                      className={`min-h-[80px] p-2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#f0f9f4]' : 'hover:bg-[#fafcfa]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                        isToday ? 'bg-[#0d6644] text-white' : 'text-[#0d1f1a]'
                      }`}>
                        {cell.day}
                      </div>
                      {/* Booking pills — show up to 2 */}
                      <div className="space-y-0.5">
                        {dayBookings.slice(0, 2).map(r => (
                          <div
                            key={r.id}
                            onClick={e => { e.stopPropagation(); setSelectedDate(cellDate); setSelectedBooking(r); }}
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded truncate cursor-pointer ${
                              r.status === 'confirmed' ? 'bg-[#0d6644] text-white' :
                              r.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              r.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {dayBookings.length > 1 && dayBookings.indexOf(r) === 0
                              ? `${dayBookings.length} Bookings`
                              : r.clientName
                            }
                          </div>
                        ))}
                        {/* Waitlist indicator if more than 2 */}
                        {dayBookings.filter(r => r.status === 'pending').length > 0 && (
                          <div className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-600 truncate">
                            Waitlist: {dayBookings.filter(r => r.status === 'pending').length}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Selected Booking Detail Panel */}
          {selectedBooking ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#0d1f1a]">Selected Booking: {selectedBooking.clientName}</p>
                <button onClick={() => setSelectedBooking(null)} className="text-[#aaa] hover:text-[#555]">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Details row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: 'schedule', label: 'TIME', value: selectedBooking.time },
                  { icon: 'group', label: 'GUESTS', value: `${selectedBooking.partySize} People` },
                  { icon: 'table_restaurant', label: 'TABLE', value: selectedBooking.table || 'Unassigned' },
                  { icon: 'star', label: 'LOYALTY', value: selectedBooking.vip ? 'VIP' : 'Standard' },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#888] mb-0.5">
                      <span className="material-symbols-outlined text-sm">{item.icon}</span>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-[#aaa]">{item.label}</span>
                    </div>
                    <p className="text-sm font-bold text-[#0d1f1a]">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Special requests */}
              {selectedBooking.specialRequests && (
                <div className="bg-[#f0f9f5] border border-[#c6e8da] rounded-xl px-4 py-3">
                  <p className="text-sm text-[#0d4d32] italic">"{selectedBooking.specialRequests}"</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => updateMutation.mutate({ id: selectedBooking.id, data: { status: 'confirmed' } })}
                  className="flex-1 bg-[#0d6644] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#0a5236] transition-colors"
                >
                  Check in Guest
                </button>
                <button
                  onClick={() => openEdit(selectedBooking)}
                  className="flex-1 border border-gray-200 text-[#0d1f1a] text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Modify Booking
                </button>
                <button
                  onClick={() => { if (confirm('Delete this reservation?')) deleteMutation.mutate(selectedBooking.id); }}
                  className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-[#aaa] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ) : selectedDateBookings.length > 0 ? (
            /* Show list of that day's bookings if none selected */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <p className="text-sm font-bold text-[#0d1f1a]">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {selectedDateBookings.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedBooking(r)}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#0d6644]/30 hover:bg-[#f8fbf9] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#e6f4ee] rounded-lg flex items-center justify-center text-[#0d6644] font-bold text-xs">
                        {r.clientName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0d1f1a]">{r.clientName}</p>
                        <p className="text-xs text-[#888]">{r.time} · {r.partySize} guests</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.table && <span className="text-[10px] bg-[#e6f4ee] text-[#0d6644] font-bold px-2 py-0.5 rounded-full">Table {r.table}</span>}
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Capacity Status */}
          {(() => {
            const seated = reservations.filter(r => r.status === 'confirmed').length;
            const expected = reservations.filter(r => r.status === 'pending').length;
            const capacity = 24;
            const pct = Math.round((seated / capacity) * 100);
            return (
              <div className="bg-[#0d6644] rounded-2xl p-6 text-white space-y-4">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-emerald-300 mb-0.5">CAPACITY STATUS</p>
                  <p className="text-3xl font-bold">{pct}% <span className="text-base font-normal text-emerald-200">Occupancy</span></p>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-300 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-emerald-300 mb-0.5">Seated</p>
                    <p className="text-2xl font-bold">{seated}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-emerald-300 mb-0.5">Expected</p>
                    <p className="text-2xl font-bold">{expected}</p>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Right sidebar: Upcoming Today */}
        <div className="w-64 shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-hidden">
          <div className="px-4 pt-6 pb-3 border-b border-gray-100">
            <p className="font-bold text-[#0d1f1a] text-sm">Upcoming</p>
            <p className="text-xs font-semibold text-[#0d6644]">Today</p>
            <p className="text-[10px] text-[#aaa] mt-0.5">Queue for 18:00 – 21:00</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {upcomingList.length === 0 ? (
              <p className="text-xs text-[#aaa] text-center py-8">No upcoming bookings today</p>
            ) : (
              upcomingList.map(r => (
                <UpcomingCard
                  key={r.id}
                  r={r}
                  selected={selectedBooking}
                  onClick={booking => {
                    setSelectedBooking(booking);
                    setSelectedDate(new Date(booking.date));
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <BookingModal
          editing={editingBooking}
          initialDate={selectedDateStr}
          onClose={closeModal}
          onCreate={data => createMutation.mutate(data)}
          onUpdate={({ id, data }) => updateMutation.mutate({ id, data })}
          loading={createMutation.isPending || updateMutation.isPending}
          apiError={
            (createMutation.isError && (createMutation.error?.response?.data?.error || 'Failed to create booking. Please try again.')) ||
            (updateMutation.isError && (updateMutation.error?.response?.data?.error || 'Failed to update booking. Please try again.')) ||
            null
          }
        />
      )}

      <PageFooter />
    </div>
  );
}