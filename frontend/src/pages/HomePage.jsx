import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: 'event_seat', title: 'Smart Reservations', desc: 'Manage bookings, tables, and waitlists in real time.' },
  { icon: 'people', title: 'Client Management', desc: 'VIP profiles, visit history, dietary preferences, and more.' },
  { icon: 'restaurant_menu', title: 'Menu Control', desc: 'Update your menu, toggle availability, track popular items.' },
  { icon: 'bar_chart', title: 'Analytics Dashboard', desc: 'Revenue trends, covers, and performance at a glance.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-on-background font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-outline-variant bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">restaurant_menu</span>
          <span className="font-bold text-emerald-900">VelStay</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Sign In</Link>
          <Link to="/signup" className="bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-8 py-24 relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <span className="inline-flex items-center gap-1 bg-primary-fixed text-primary text-xs font-semibold px-3 py-1 rounded-full mb-6">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          Premium Restaurant Platform
        </span>
        <h1 className="text-5xl font-extrabold text-on-surface max-w-2xl leading-tight mb-6">
          Run your restaurant <span className="text-primary">smarter</span>, not harder.
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl mb-10">
          VelStay brings reservations, clients, menus, and analytics into one elegant dashboard built for modern restaurateurs.
        </p>
        <div className="flex gap-4">
          <Link to="/signup" className="bg-primary text-on-primary font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-all">
            Start for free
          </Link>
          <Link to="/login" className="border border-outline text-on-surface font-semibold px-8 py-3 rounded-full hover:bg-surface-container transition-colors">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-on-surface mb-12">Everything you need to run your restaurant</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex gap-4 card-hover">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">{f.icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-on-surface mb-1">{f.title}</h3>
                <p className="text-sm text-on-surface-variant">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-on-primary px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to elevate your service?</h2>
        <p className="text-on-primary/80 mb-8">Join hundreds of restaurants managing their business with VelStay.</p>
        <Link to="/signup" className="bg-on-primary text-primary font-bold px-10 py-3 rounded-full hover:opacity-90 transition-all">
          Get started today
        </Link>
      </section>

      <footer className="py-8 border-t border-outline-variant text-center text-xs text-on-surface-variant">
        © 2024 RestoHost Management Systems. All rights reserved.
      </footer>
    </div>
  );
}
