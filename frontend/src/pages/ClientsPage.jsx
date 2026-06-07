import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../services/api';
import PageFooter from '../components/PageFooter';

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-red-400', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500',
  'bg-emerald-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
];
function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const color = AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
const emptyForm = { name: '', email: '', phone: '', notes: '' };

function ClientModal({ editing, onClose, onCreate, onUpdate, loading }) {
  const [form, setForm] = useState(
    editing ? { name: editing.name, email: editing.email, phone: editing.phone, notes: editing.notes || '' } : emptyForm
  );
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = () => editing ? onUpdate({ id: editing.id, data: form }) : onCreate(form);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0d1f1a]">{editing ? 'Edit Client' : 'Add Client'}</h2>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#555]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {[
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com' },
          { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 000 0000' },
          { name: 'notes', label: 'Notes', type: 'text', placeholder: 'Any preferences…' },
        ].map(f => (
          <div key={f.name}>
            <label className="text-xs font-semibold text-[#888] block mb-1">{f.label}</label>
            <input name={f.name} type={f.type} value={form[f.name]} onChange={set} placeholder={f.placeholder}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0d1f1a] focus:outline-none focus:border-[#0d6644] bg-[#fafafa] placeholder-[#ccc]" />
          </div>
        ))}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-[#555] text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-[#0d6644] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#0a5236] transition-colors disabled:opacity-60">
            {loading ? 'Saving…' : editing ? 'Save Changes' : 'Add Client'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientsApi.list(search ? { search } : {}),
  });

  const createMutation = useMutation({ mutationFn: clientsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); closeModal(); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => clientsApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); closeModal(); } });
  const deleteMutation = useMutation({ mutationFn: clientsApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }) });

  const closeModal = () => { setShowModal(false); setEditing(null); };
  const openEdit = c => { setEditing(c); setShowModal(true); };
  const toggleVip = c => updateMutation.mutate({ id: c.id, data: { vip: !c.vip } });

  // Stats
  const totalClients = clients.length;
  const vipCount = clients.filter(c => c.vip).length;
  const returningRate = totalClients > 0 ? Math.round((clients.filter(c => c.visits > 1).length / totalClients) * 100) : 0;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));
  const paginated = clients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Format last visit
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', d: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f0]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shrink-0">
        <h1 className="font-bold text-[#0d1f1a] text-base">VelStay</h1>
        <div className="flex items-center gap-3">
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">search</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">notifications</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">help</span></button>
          <div className="w-8 h-8 rounded-full bg-[#0d6644] flex items-center justify-center text-white text-xs font-bold">M</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-[#0d1f1a]">Client Directory</h2>
          <p className="text-sm text-[#888] mt-0.5">Manage guest relationships and track dining history</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Clients */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#e6f4ee] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0d6644] text-lg">group</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12.5%</span>
            </div>
            <p className="text-xs text-[#aaa] uppercase tracking-widest font-semibold mb-1">Total clients</p>
            <p className="text-2xl font-bold text-[#0d1f1a]">{totalClients.toLocaleString()}</p>
          </div>

          {/* VIP Guests */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+4%</span>
            </div>
            <p className="text-xs text-[#aaa] uppercase tracking-widest font-semibold mb-1">VIP Guests</p>
            <p className="text-2xl font-bold text-[#0d1f1a]">{vipCount}</p>
          </div>

          {/* Returning Rate */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-500 text-lg">verified</span>
              </div>
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-2%</span>
            </div>
            <p className="text-xs text-[#aaa] uppercase tracking-widest font-semibold mb-1">Returning Rate</p>
            <p className="text-2xl font-bold text-[#0d1f1a]">{returningRate}%</p>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 border border-gray-200 text-[#555] text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filters
              </button>
              <button className="flex items-center gap-1.5 border border-gray-200 text-[#555] text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="material-symbols-outlined text-sm">upload</span>
                Export
              </button>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-[#aaa]">Showing {Math.min((page-1)*PAGE_SIZE+1, clients.length)}–{Math.min(page*PAGE_SIZE, clients.length)} of {clients.length.toLocaleString()} results</p>
              <button
                onClick={() => { setEditing(null); setShowModal(true); }}
                className="flex items-center gap-1.5 bg-[#0d6644] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#0a5236] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Add Client
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <span className="material-symbols-outlined animate-spin text-[#0d6644] text-3xl">refresh</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Email', 'Total Visits', 'Last Visit', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-[#aaa] uppercase tracking-widest">{h}</th>
                  ))}
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-[#aaa]">No clients found</td></tr>
                )}
                {paginated.map((c, i) => (
                  <tr key={c.id} className="hover:bg-[#fafcfa] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div>
                          <p className="font-semibold text-[#0d1f1a] text-sm">{c.name}</p>
                          <p className="text-[11px] text-[#aaa]">ID #{c.id || String(1930 + i)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#555] text-xs">{c.email}</td>
                    <td className="px-5 py-3.5 text-[#555] text-sm font-medium">{c.visits ?? 0}</td>
                    <td className="px-5 py-3.5 text-[#555] text-xs">{formatDate(c.lastVisit)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleVip(c)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${
                          c.vip
                            ? 'bg-[#e6f4ee] text-[#0d6644] border-[#b2ddc8]'
                            : 'bg-gray-100 text-[#888] border-gray-200'
                        }`}
                      >
                        {c.vip ? 'VIP' : 'REGULAR'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(c)} className="text-[#aaa] hover:text-[#0d6644] transition-colors">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => { if (confirm('Delete client?')) deleteMutation.mutate(c.id); }} className="text-[#aaa] hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 py-4 border-t border-gray-100">
              {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    page === p ? 'bg-[#0d1f1a] text-white' : 'text-[#aaa] hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {showModal && (
        <ClientModal
          editing={editing}
          onClose={closeModal}
          onCreate={data => createMutation.mutate(data)}
          onUpdate={({ id, data }) => updateMutation.mutate({ id, data })}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      <PageFooter />
    </div>
  );
}