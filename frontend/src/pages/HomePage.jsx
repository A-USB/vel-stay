import React from 'react';
import { Link } from 'react-router-dom';

const partners = ['LAUBERGE', 'URBAN EATS', 'ZEPHYR BISTRO', 'METRO HOTEL', 'OASIS RESORTS'];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#eef0ee] text-[#0d1f1a] font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <span className="font-bold text-lg text-[#0d1f1a] tracking-tight">VelStay</span>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-[#555]">
          <a href="#" className="text-[#0d1f1a] font-semibold border-b-2 border-[#0d1f1a] pb-0.5">Home</a>
          <a href="#" className="hover:text-[#0d1f1a] transition-colors">Solutions</a>
          <a href="#" className="hover:text-[#0d1f1a] transition-colors">Pricing</a>
          <a href="#" className="hover:text-[#0d1f1a] transition-colors">Resources</a>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[#555] hover:text-[#0d1f1a]">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <button className="text-[#555] hover:text-[#0d1f1a]">
            <span className="material-symbols-outlined text-xl">help</span>
          </button>
          <Link
            to="/signup"
            className="bg-[#0d3d2e] text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-[#0a2e22] transition-colors"
          >
            Join
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white px-8 md:px-16 py-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Left */}
          <div className="flex-1 space-y-6">
            <span className="inline-block bg-[#c6f0e2] text-[#0d3d2e] text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
              The New Standard
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0d1f1a] leading-snug">
              Master Your Hospitality Operations with Precision.
            </h1>
            <p className="text-[#555] text-sm leading-relaxed max-w-md">
              An all-in-one management ecosystem designed for modern restaurants and luxury accommodations. Unified reservations, seamless CRM, and intelligent menu engineering.
            </p>
            <div className="flex gap-3 pt-2">
              <Link
                to="/signup"
                className="bg-[#0d3d2e] text-white font-semibold text-sm px-6 py-3 rounded-md hover:bg-[#0a2e22] transition-colors"
              >
                Get Started
              </Link>
              <a
                href="#"
                className="border border-[#0d3d2e] text-[#0d3d2e] font-semibold text-sm px-6 py-3 rounded-md hover:bg-[#f0faf6] transition-colors"
              >
                Book a Demo
              </a>
            </div>
          </div>

          {/* Right — food image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="rounded-2xl overflow-hidden border border-[#e0e0e0] shadow-sm w-full max-w-md aspect-[4/3] bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
                alt="Food spread"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#eef0ee] px-8 md:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#0d3d2e] tracking-widest uppercase mb-2">
              Streamlined Management Excellence
            </p>
            <p className="text-[#555] text-sm max-w-xl mx-auto">
              Powerful tools designed for the rigorous demands of high-volume hospitality venues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1 — Smart Reservations */}
            <div className="bg-white rounded-2xl p-8 space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-[#0d3d2e] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">calendar_month</span>
              </div>
              <h3 className="font-bold text-[#0d1f1a] text-base">Smart Reservations</h3>
              <p className="text-sm text-[#555] leading-relaxed">
                A unified booking engine that synchronizes lodge stays with dining reservations automatically. Eliminate overbooking and optimize floor capacity in real-time.
              </p>
            </div>

            {/* Card 2 — Guest Insights */}
            <div className="bg-white rounded-2xl p-8 space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-[#e8eeea] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0d3d2e] text-xl">group</span>
              </div>
              <h3 className="font-bold text-[#0d1f1a] text-base">Guest Insights (CRM)</h3>
              <p className="text-sm text-[#555] leading-relaxed">
                Build deep profiles for your regulars. Track preferences, allergies, and anniversary dates to provide truly personalized service.
              </p>
            </div>

            {/* Card 3 — Menu Management */}
            <div className="bg-white rounded-2xl p-8 space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-[#e8eeea] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0d3d2e] text-xl">no_food</span>
              </div>
              <h3 className="font-bold text-[#0d1f1a] text-base">Menu Management</h3>
              <p className="text-sm text-[#555] leading-relaxed">
                Dynamic menu engineering. Update prices across POS, website, and QR codes instantly while tracking food cost margins.
              </p>
              <p className="text-xs font-bold text-[#0d3d2e] tracking-widest uppercase">
                Inventory Sync Included
              </p>
            </div>

            {/* Card 4 — Global Command Center (dark) */}
            <div className="bg-[#0d3d2e] rounded-2xl p-8 space-y-5 shadow-sm">
              <p className="text-[#a8d5c2] text-xs font-semibold tracking-widest uppercase">
                Global Command Center
              </p>
              <p className="text-white text-sm leading-relaxed">
                Manage multiple properties from a single login. Consolidated financial reporting and staff scheduling for your entire hospitality group.
              </p>
              <div className="flex gap-3">
                <div className="border border-white/30 rounded-lg px-4 py-3 text-center min-w-[90px]">
                  <p className="text-white font-bold text-base">99.9%</p>
                  <p className="text-[#a8d5c2] text-xs">Uptime</p>
                </div>
                <div className="border border-white/30 rounded-lg px-4 py-3 text-center min-w-[90px]">
                  <p className="text-white font-bold text-base">15 min</p>
                  <p className="text-[#a8d5c2] text-xs">Avg Setup</p>
                </div>
              </div>
              <a
                href="#"
                className="inline-block border border-white/40 text-white text-xs font-semibold px-5 py-2.5 rounded-md hover:bg-white/10 transition-colors"
              >
                View Enterprise Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partners / Trust Bar */}
      <section className="bg-[#eef0ee] px-8 py-10 border-t border-[#dce0dc]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <p className="text-xs font-semibold text-[#888] tracking-[0.2em] uppercase">
            Powering Elite Hospitality Worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-10 items-center">
            {partners.map(p => (
              <span key={p} className="text-sm font-bold text-[#888] tracking-widest">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 md:px-16 py-16 bg-[#eef0ee]">
        <div className="max-w-3xl mx-auto bg-[#0d3d2e] rounded-2xl px-10 py-14 text-center space-y-5 relative overflow-hidden">
          {/* Decorative shapes bottom-left */}
          <div className="absolute -left-10 -bottom-6 w-40 h-40 bg-[#0a2e22] rounded-2xl" />
          <div className="absolute left-4 bottom-4 w-24 h-24 bg-[#1a5c44] rounded-xl opacity-60" />

          <h2 className="relative text-white text-xl font-bold">Ready to Elevate Your Service?</h2>
          <p className="relative text-[#a8d5c2] text-sm max-w-md mx-auto">
            Join over 2,500 establishments that have modernized their operations with RestoHost Pro.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/signup"
              className="bg-[#2ecc8e] text-[#0d1f1a] font-bold text-sm px-8 py-3 rounded-md hover:bg-[#25b87d] transition-colors"
            >
              Start Free Trial
            </Link>
            <a
              href="#"
              className="border border-white/40 text-white font-semibold text-sm px-8 py-3 rounded-md hover:bg-white/10 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center space-y-3">
        <div className="flex justify-center gap-10 text-xs text-[#888]">
          <a href="#" className="hover:text-[#0d3d2e] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#0d3d2e] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#0d3d2e] transition-colors">Contact Support</a>
        </div>
        <p className="text-xs text-[#aaa]">© 2026 RestoHost Management Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}