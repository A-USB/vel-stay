import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '../services/api';

const CATEGORY_COLORS = { Starters: 'bg-blue-50 text-blue-700', Mains: 'bg-emerald-50 text-emerald-700', Desserts: 'bg-pink-50 text-pink-700', Beverages: 'bg-amber-50 text-amber-700' };
const emptyForm = { name: '', category: 'Mains', price: '', description: '', allergens: '' };

export default function MenuPage() {
  const qc = useQueryClient();
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['menu', filterCat],
    queryFn: () => menuApi.list(filterCat ? { category: filterCat } : {}),
  });
  const { data: categories = [] } = useQuery({ queryKey: ['menu-categories'], queryFn: menuApi.categories });

  const createMutation = useMutation({ mutationFn: menuApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu'] }); qc.invalidateQueries({ queryKey: ['menu-categories'] }); closeModal(); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => menuApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu'] }); qc.invalidateQueries({ queryKey: ['menu-categories'] }); closeModal(); } });
  const deleteMutation = useMutation({ mutationFn: menuApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu'] }); qc.invalidateQueries({ queryKey: ['menu-categories'] }); } });
  const toggleAvail = (item) => updateMutation.mutate({ id: item.id, data: { available: !item.available } });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, category: item.category, price: item.price, description: item.description, allergens: (item.allergens || []).join(', ') }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };
  const handleSubmit = () => {
    const data = { ...form, price: Number(form.price), allergens: form.allergens ? form.allergens.split(',').map(a => a.trim()) : [] };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Menu & Services</h1>
          <p className="text-sm text-on-surface-variant mt-1">{items.filter(i => i.available).length} of {items.length} items available</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer">
          <span className="material-symbols-outlined text-base">add</span> Add Item
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {['', ...categories].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterCat === c ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
            {c || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-5 card-hover space-y-3 ${!item.available ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-on-surface">{item.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] || 'bg-surface-container text-on-surface-variant'}`}>{item.category}</span>
                </div>
                <p className="text-lg font-bold text-primary shrink-0">${item.price.toFixed(2)}</p>
              </div>
              {item.description && <p className="text-xs text-on-surface-variant">{item.description}</p>}
              {item.allergens?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.allergens.map(a => <span key={a} className="text-xs bg-error-container text-on-error-container px-2 py-0.5 rounded-full">{a}</span>)}
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => toggleAvail(item)}
                  className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors font-medium ${item.available ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
                  {item.available ? '✓ Available' : 'Unavailable'}
                </button>
                <button onClick={() => openEdit(item)} className="text-xs border border-outline-variant py-1.5 px-3 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button onClick={() => { if (confirm('Delete item?')) deleteMutation.mutate(item.id); }} className="text-xs border border-outline-variant py-1.5 px-3 rounded-lg hover:bg-error-container hover:text-on-error-container transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="col-span-3 text-center py-12 text-on-surface-variant">No menu items found.</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface">{editing ? 'Edit Item' : 'Add Menu Item'}</h2>
            {[
              { name: 'name', label: 'Name', type: 'text' },
              { name: 'price', label: 'Price ($)', type: 'number' },
              { name: 'description', label: 'Description', type: 'text' },
              { name: 'allergens', label: 'Allergens (comma-separated)', type: 'text' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">{f.label}</label>
                <input name={f.name} type={f.type} value={form[f.name]} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1">Category</label>
              <select name="category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-2 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary">
                {['Starters', 'Mains', 'Desserts', 'Beverages'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 border border-outline text-on-surface-variant text-sm py-2 rounded-lg hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-primary text-on-primary text-sm font-semibold py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer">
                {editing ? 'Update' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
