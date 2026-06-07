import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '../services/api';
import PageFooter from '../components/PageFooter';

// ─── Food images by category (fallback placeholders) ─────────────────────────
const FOOD_IMAGES = {
  Starters: [
    'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=80',
    'https://images.unsplash.com/photo-1548869206-93b036288d7e?w=400&q=80',
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
  ],
  Mains: [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
  ],
  Desserts: [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80',
  ],
  Beverages: [
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
  ],
};

const CATEGORY_ICONS = {
  Starters:   'restaurant',
  Mains:      'arrow_upward',
  Desserts:   'cake',
  Beverages:  'local_bar',
};

// Teal placeholder color for beverages/items without images
const PLACEHOLDER_COLORS = ['#4ecdc4', '#45b7b8', '#52d9d0'];

function getItemImage(item, index) {
  const imgs = FOOD_IMAGES[item.category];
  if (imgs) return imgs[index % imgs.length];
  return null;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
const emptyForm = { name: '', category: 'Starters', price: '', description: '', allergens: '' };

function ItemModal({ editing, onClose, onCreate, onUpdate, loading }) {
  const [form, setForm] = useState(
    editing
      ? { name: editing.name, category: editing.category, price: editing.price, description: editing.description, allergens: (editing.allergens || []).join(', ') }
      : emptyForm
  );
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    const data = { ...form, price: Number(form.price), allergens: form.allergens ? form.allergens.split(',').map(a => a.trim()) : [] };
    editing ? onUpdate({ id: editing.id, data }) : onCreate(data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0d1f1a]">{editing ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#555]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {[
          { name: 'name', label: 'Item Name', type: 'text', placeholder: 'e.g. Tuscan Bruschetta' },
          { name: 'price', label: 'Price ($)', type: 'number', placeholder: '0.00' },
          { name: 'description', label: 'Description', type: 'text', placeholder: 'Short description…' },
          { name: 'allergens', label: 'Allergens (comma-separated)', type: 'text', placeholder: 'e.g. Gluten, Dairy' },
        ].map(f => (
          <div key={f.name}>
            <label className="text-xs font-semibold text-[#888] block mb-1">{f.label}</label>
            <input
              name={f.name} type={f.type} value={form[f.name]} onChange={set}
              placeholder={f.placeholder}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0d1f1a] focus:outline-none focus:border-[#0d6644] bg-[#fafafa] placeholder-[#ccc]"
            />
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold text-[#888] block mb-1">Category</label>
          <select name="category" value={form.category} onChange={set}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0d1f1a] focus:outline-none focus:border-[#0d6644] bg-[#fafafa]">
            {['Starters', 'Mains', 'Desserts', 'Beverages'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-[#555] text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-[#0d6644] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#0a5236] transition-colors disabled:opacity-60">
            {loading ? 'Saving…' : editing ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card view (Starters, Desserts, Beverages) ────────────────────────────────
function CardItem({ item, index, onEdit, onDelete, onToggle }) {
  const imgSrc = getItemImage(item, index);
  const placeholderColor = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];

  return (
    <div className={`bg-white rounded-xl border-2 transition-all overflow-hidden ${item.available ? 'border-[#0d6644]' : 'border-gray-100 opacity-70'}`}>
      {/* Image or placeholder */}
      <div className="relative">
        {imgSrc ? (
          <img src={imgSrc} alt={item.name} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36 flex items-center justify-center" style={{ backgroundColor: placeholderColor }}>
            <span className="material-symbols-outlined text-white text-4xl">restaurant</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2 flex items-center justify-between">
        <p className="text-xs font-bold text-[#0d1f1a] truncate flex-1">{item.name}</p>
        <p className="text-xs font-bold text-[#0d6644] ml-2">${Number(item.price).toFixed(2)}</p>
      </div>
      {item.description && (
        <p className="px-3 pb-1 text-[10px] text-[#aaa] truncate">{item.description}</p>
      )}

      {/* Actions */}
      <div className="px-3 pb-3 flex gap-2 mt-1">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-[#555] text-xs py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit
        </button>
        <button
          onClick={() => onToggle(item)}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
            item.available
              ? 'border-[#0d6644]/30 text-[#0d6644] hover:bg-[#f0f9f4]'
              : 'border-gray-200 text-[#aaa] hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-sm">{item.available ? 'visibility' : 'visibility_off'}</span>
        </button>
        <button
          onClick={() => { if (confirm('Delete this item?')) onDelete(item.id); }}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#aaa] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
}

// ─── Table view (Mains) ───────────────────────────────────────────────────────
function TableItem({ item, index, onEdit, onDelete, onToggle }) {
  const imgSrc = getItemImage(item, index);

  return (
    <tr className="border-b border-gray-50 hover:bg-[#fafcfa] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {imgSrc ? (
            <img src={imgSrc} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#e6f4ee] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#0d6644] text-base">restaurant</span>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-[#0d1f1a]">{item.name}</p>
            {item.description && <p className="text-xs text-[#aaa]">{item.description}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-[#0d1f1a]">${Number(item.price).toFixed(2)}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onToggle(item)}
          className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
            item.available
              ? 'bg-[#e6f4ee] text-[#0d6644] border-[#b2ddc8]'
              : 'bg-gray-100 text-[#aaa] border-gray-200'
          }`}
        >
          {item.available ? 'Available' : 'Unavailable'}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(item)} className="text-[#888] hover:text-[#0d6644] transition-colors">
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
          <button onClick={() => { if (confirm('Delete this item?')) onDelete(item.id); }} className="text-[#888] hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({ category, items, onEdit, onDelete, onToggle }) {
  const icon = CATEGORY_ICONS[category] || 'restaurant';
  const useTable = category === 'Mains';

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#0d1f1a] text-lg">{icon}</span>
        <h2 className="text-base font-bold text-[#0d1f1a]">{category}</h2>
      </div>

      {useTable ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fafafa]">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-[#aaa] uppercase tracking-widest">Item Details</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-[#aaa] uppercase tracking-widest">Price</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-[#aaa] uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-[#aaa] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <TableItem key={item.id} item={item} index={i} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-[#aaa] text-sm">No items in this category</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <CardItem key={item.id} item={item} index={i} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
          ))}
          {items.length === 0 && (
            <div className="col-span-4 text-center py-8 text-[#aaa] text-sm">No items in this category</div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const CATEGORY_ORDER = ['Starters', 'Mains', 'Desserts', 'Beverages'];

export default function MenuPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: () => menuApi.list({}),
  });

  const createMutation = useMutation({
    mutationFn: menuApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu'] }); closeModal(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu'] }); closeModal(); },
  });
  const deleteMutation = useMutation({
    mutationFn: menuApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu'] }),
  });

  const closeModal = () => { setShowModal(false); setEditing(null); };
  const openEdit = item => { setEditing(item); setShowModal(true); };
  const openCreate = () => { setEditing(null); setShowModal(true); };
  const toggleAvail = item => updateMutation.mutate({ id: item.id, data: { available: !item.available } });

  // Group items by category
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {});

  // Also catch any unknown categories
  const extraCats = [...new Set(items.map(i => i.category))].filter(c => !CATEGORY_ORDER.includes(c));

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f0]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shrink-0">
        <h1 className="font-bold text-[#0d1f1a] text-base">Menu &amp; Services</h1>
        <div className="flex items-center gap-3">
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">search</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">notifications</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">help</span></button>
          <div className="w-8 h-8 rounded-full bg-[#0d6644] flex items-center justify-center text-white text-xs font-bold">M</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto space-y-10">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0d6644]">Digital Menu</h2>
            <p className="text-sm text-[#888] mt-0.5">Manage your culinary offerings and pricing in real time</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#0d6644] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0a5236] transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add new item
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-[#0d6644] text-4xl">refresh</span>
          </div>
        ) : (
          <div className="space-y-10">
            {CATEGORY_ORDER.map(cat => (
              <CategorySection
                key={cat}
                category={cat}
                items={grouped[cat] || []}
                onEdit={openEdit}
                onDelete={id => deleteMutation.mutate(id)}
                onToggle={toggleAvail}
              />
            ))}
            {extraCats.map(cat => (
              <CategorySection
                key={cat}
                category={cat}
                items={items.filter(i => i.category === cat)}
                onEdit={openEdit}
                onDelete={id => deleteMutation.mutate(id)}
                onToggle={toggleAvail}
              />
            ))}
          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <ItemModal
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