import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageFooter from '../components/PageFooter';

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-[#0d6644]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, children, highlighted }) {
  return (
    <div className={`rounded-xl border p-6 space-y-5 ${highlighted ? 'border-blue-300 bg-white shadow-sm' : 'border-gray-200 bg-white shadow-sm'}`}>
      <div>
        <p className="text-sm font-bold text-[#0d1f1a]">{title}</p>
        {subtitle && <p className="text-xs text-[#aaa] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder, readOnly }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-[#555] block">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-[#0d1f1a] focus:outline-none focus:border-[#0d6644] transition-colors placeholder-[#ccc] ${readOnly ? 'bg-[#f5f5f5] text-[#aaa] cursor-not-allowed' : 'bg-white'}`}
      />
    </div>
  );
}

// ─── Sidebar nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'business', icon: 'store', label: 'Business Profile' },
  { key: 'user', icon: 'person', label: 'User Account' },
  { key: 'notifications', icon: 'notifications', label: 'Notifications' },
  { key: 'billing', icon: 'receipt_long', label: 'Billing & Plans' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('business');
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const [form, setForm] = useState(null);

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const mutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading || !form) return (
    <div className="flex items-center justify-center h-64">
      <span className="material-symbols-outlined animate-spin text-[#0d6644] text-4xl">refresh</span>
    </div>
  );

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNotif = (key, val) => setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: val } }));

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f0]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-[#0d1f1a] text-base">VelStay</h1>
          <span className="text-[#aaa] text-sm">Settings</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">search</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">notifications</span></button>
          <button className="text-[#888] hover:text-[#0d1f1a]"><span className="material-symbols-outlined text-xl">help</span></button>
          <div className="w-8 h-8 rounded-full bg-[#0d6644] flex items-center justify-center text-white text-xs font-bold">M</div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Page header */}
          <div>
            <p className="text-xs font-semibold text-[#888] uppercase tracking-widest">Account Settings</p>
            <p className="text-xs text-[#aaa] mt-0.5">Manage your business information, personal preferences and billing cycles</p>
          </div>

          <div className="flex gap-6 items-start">

            {/* Left sidebar nav */}
            <div className="w-48 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${
                    activeSection === item.key
                      ? 'border-l-[#0d6644] bg-[#f0f9f4] text-[#0d6644]'
                      : 'border-l-transparent text-[#555] hover:bg-gray-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right content */}
            <div className="flex-1 space-y-5">

              {/* Business Profile */}
              <Section title="Business Profile" subtitle="Public information and your establishment">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Establishment Name" value={form.restaurantName} onChange={v => set('restaurantName', v)} placeholder="The Grand Legacy Hotel" />
                  <Field label="Business Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="+250 712 345 678" />
                </div>
                <Field label="Street Address" value={form.address} onChange={v => set('address', v)} placeholder="KN 146 Kigali, Rwanda" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" value={form.city} onChange={v => set('city', v)} placeholder="Kigali, Rwanda" />
                  <Field label="Postal Code" value={form.postalCode} onChange={v => set('postalCode', v)} placeholder="PO BOX 456 Kigali" />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => mutation.mutate(form)}
                    disabled={mutation.isPending}
                    className="bg-[#0d6644] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0a5236] transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {mutation.isPending ? (
                      <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> Saving…</>
                    ) : saved ? (
                      <><span className="material-symbols-outlined text-sm">check_circle</span> Saved!</>
                    ) : 'Save Business Details'}
                  </button>
                </div>
              </Section>

              {/* User Account */}
              <Section title="User account" subtitle="Manage your personal credentials and access" highlighted>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-200 flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow">
                    <span className="material-symbols-outlined text-amber-700 text-2xl">person</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <Field label="Full Name" value={user?.name || form.userName} onChange={v => set('userName', v)} placeholder="Legacy McQueen" />
                    <Field label="Email Address" value={user?.email || form.email} readOnly />
                  </div>
                </div>
              </Section>

              {/* Notifications */}
              <Section title="Notifications" subtitle="Choose how you want to be alerted about activity">
                <div className="flex justify-end -mt-8 mb-2">
                  <button className="text-xs font-semibold text-[#0d6644] hover:underline">Default All</button>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'emailReservations', icon: 'calendar_month', label: 'New Reservations', desc: 'Push notification for every new booking' },
                    { key: 'dailyReport', icon: 'mail', label: 'Daily Digest Email', desc: "Summary of the day's performance at 11:00 PM" },
                    { key: 'smsConfirmations', icon: 'chat', label: 'SMS Alerts', desc: 'Urgent operations alerts sent to mobile' },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#555] text-base">{n.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0d1f1a]">{n.label}</p>
                          <p className="text-xs text-[#aaa]">{n.desc}</p>
                        </div>
                      </div>
                      <Toggle checked={form.notifications?.[n.key] || false} onChange={v => setNotif(n.key, v)} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => mutation.mutate(form)}
                    disabled={mutation.isPending}
                    className="bg-[#0d6644] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0a5236] transition-colors disabled:opacity-60"
                  >
                    Save Preferences
                  </button>
                </div>
              </Section>

              {/* Billing & Subscription */}
              <Section title="Billing & Subscription" subtitle="Manage your payment methods and plan level">
                {/* Current plan */}
                <div className="bg-[#0d6644] rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">Pro Management Suite</p>
                    <p className="text-emerald-300 text-xs mt-0.5">Next billing date: Jan 15, 2026 ($149.00 / mo)</p>
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-lg border border-white/30 transition-colors">
                    Upgrade Plan
                  </button>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#0d1f1a]">Payment Methods</p>
                  <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#555] text-base">credit_card</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0d1f1a]">VISA ending in **** 4242</p>
                        <p className="text-xs text-[#aaa]">Expires 04/27 · Primary</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-[#0d6644] hover:underline">Edit</button>
                  </div>
                  <button className="text-xs font-semibold text-[#0d6644] hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add New Payment Method
                  </button>
                </div>
              </Section>

            </div>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}