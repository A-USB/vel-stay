import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../services/api';

const emptyForm = { name: '', email: '', phone: '', notes: '' };

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientsApi.list(search ? { search } : {}),
  });

  const createMutation = useMutation({ mutationFn: clientsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); closeModal(); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => clientsApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); closeModal(); } });
  const deleteMutation = useMutation({ mutationFn: clientsApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }) });
  const toggleVip = (c) => updateMutation.mutate({ id: c.id, data: { vip: !c.vip } });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone, notes: c.notes }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };
  const handleSubmit = () => editing ? updateMutation.mutate({ id: editing.id, data: form }) : createMutation.mutate(form);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Clients</h1>
          <p className="text-sm text-on-surface-variant mt-1">{clients.length} clients in your database</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer">
          <span className="material-symbols-outlined text-base">person_add</span> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
          className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary" />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12"><span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => (
            <div key={c.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 card-hover space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{c.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm">{c.name}</p>
                    <p className="text-xs text-on-surface-variant">{c.email}</p>
                  </div>
                </div>
                <button onClick={() => toggleVip(c)} title={c.vip ? 'Remove VIP' : 'Make VIP'}
                  className={`text-lg transition-colors ${c.vip ? 'text-amber-400' : 'text-outline hover:text-amber-400'}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: c.vip ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-container-low rounded-lg p-2">
                  <p className="text-on-surface-variant">Visits</p>
                  <p className="font-semibold text-on-surface">{c.visits}</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-2">
                  <p className="text-on-surface-variant">Spent</p>
                  <p className="font-semibold text-on-surface">${c.totalSpent.toFixed(0)}</p>
                </div>
              </div>
              {c.notes && <p className="text-xs text-on-surface-variant italic border-t border-outline-variant pt-2">{c.notes}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => openEdit(c)} className="flex-1 text-xs border border-outline-variant py-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">Edit</button>
                <button onClick={() => { if (confirm('Delete client?')) deleteMutation.mutate(c.id); }} className="text-xs border border-outline-variant py-1.5 px-3 rounded-lg hover:bg-error-container hover:text-on-error-container hover:border-error transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
          {clients.length === 0 && <div className="col-span-3 text-center py-12 text-on-surface-variant">No clients found.</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface">{editing ? 'Edit Client' : 'Add Client'}</h2>
            {[
              { name: 'name', label: 'Full Name', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'phone', label: 'Phone', type: 'tel' },
              { name: 'notes', label: 'Notes', type: 'text' },
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
                {editing ? 'Update' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
