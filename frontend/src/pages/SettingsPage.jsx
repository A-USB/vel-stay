import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/api';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const mutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  if (isLoading || !form) return <div className="flex items-center justify-center h-64"><span className="material-symbols-outlined animate-spin text-primary text-4xl">refresh</span></div>;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNotif = (key, val) => setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: val } }));

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your restaurant profile and preferences</p>
      </div>

      {/* Restaurant Info */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">store</span> Restaurant Information
        </h2>
        {[
          { key: 'restaurantName', label: 'Restaurant Name' },
          { key: 'address', label: 'Address' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">{f.label}</label>
            <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Currency</label>
            <select value={form.currency} onChange={e => set('currency', e.target.value)}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary">
              {['USD', 'EUR', 'GBP', 'ZAR', 'AUD'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Table Capacity</label>
            <input type="number" value={form.tableCapacity} onChange={e => set('tableCapacity', Number(e.target.value))}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">notifications</span> Notifications
        </h2>
        {[
          { key: 'emailReservations', label: 'Email alerts for new reservations' },
          { key: 'smsConfirmations', label: 'SMS confirmations for guests' },
          { key: 'dailyReport', label: 'Daily summary report' },
        ].map(n => (
          <label key={n.key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-on-surface">{n.label}</span>
            <div className="relative">
              <input type="checkbox" checked={form.notifications?.[n.key] || false} onChange={e => setNotif(n.key, e.target.checked)} className="sr-only" />
              <div onClick={() => setNotif(n.key, !form.notifications?.[n.key])}
                className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${form.notifications?.[n.key] ? 'bg-primary' : 'bg-outline'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${form.notifications?.[n.key] ? 'left-5' : 'left-1'}`} />
              </div>
            </div>
          </label>
        ))}
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="bg-primary text-on-primary text-sm font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-all disabled:opacity-60 cursor-pointer">
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-emerald-600 flex items-center gap-1"><span className="material-symbols-outlined text-base">check_circle</span> Saved!</span>}
      </div>
    </div>
  );
}
