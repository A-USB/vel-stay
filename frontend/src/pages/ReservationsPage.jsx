import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '../services/api';

const STATUS_COLORS = { confirmed: 'text-emerald-700 bg-emerald-50 border-emerald-200', pending: 'text-amber-700 bg-amber-50 border-amber-200', completed: 'text-blue-700 bg-blue-50 border-blue-200', cancelled: 'text-red-700 bg-red-50 border-red-200' };

const emptyForm = { clientName: '', date: '', time: '', partySize: '', table: '', specialRequests: '' };

export default function ReservationsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('');

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations', filterStatus],
    queryFn: () => reservationsApi.list(filterStatus ? { status: filterStatus } : {}),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ clientName: r.clientName, date: r.date, time: r.time, partySize: r.partySize, table: r.table, specialRequests: r.specialRequests }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = () => {
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const handleStatusChange = (id, status) => updateMutation.mutate({ id, data: { status } });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Reservations</h1>
          <p className="text-sm text-on-surface-variant mt-1">{reservations.length} total reservations</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer">
          <span className="material-symbols-outlined text-base">add</span> New Reservation
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'confirmed', 'pending', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === s ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span></div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wide">
              <tr>
                {['Guest', 'Date & Time', 'Party', 'Table', 'Status', 'Special Requests', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {reservations.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-on-surface-variant">No reservations found</td></tr>
              )}
              {reservations.map(r => (
                <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">{r.clientName}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{r.date} · {r.time}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{r.partySize}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{r.table}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer bg-transparent ${STATUS_COLORS[r.status] || ''}`}>
                      {['confirmed','pending','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[160px] truncate">{r.specialRequests || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(r)} className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => { if (confirm('Delete this reservation?')) deleteMutation.mutate(r.id); }} className="text-on-surface-variant hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface">{editing ? 'Edit Reservation' : 'New Reservation'}</h2>
            {[
              { name: 'clientName', label: 'Guest Name', type: 'text' },
              { name: 'date', label: 'Date', type: 'date' },
              { name: 'time', label: 'Time', type: 'time' },
              { name: 'partySize', label: 'Party Size', type: 'number' },
              { name: 'table', label: 'Table', type: 'text' },
              { name: 'specialRequests', label: 'Special Requests', type: 'text' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">{f.label}</label>
                <input name={f.name} type={f.type} value={form[f.name]} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 border border-outline text-on-surface-variant text-sm py-2 rounded-lg hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-primary text-on-primary text-sm font-semibold py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer">
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
