import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('manager');
  const [form, setForm] = useState({ name: '', email: '', password: '', restaurant: '', category: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
    setLoading(true);
    try {
      await signup({ ...form, role });
      navigate(role === 'manager' ? '/dashboard' : '/client');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg text-sm text-[#0d1f1a] placeholder-[#aaa] border border-[#dde] focus:outline-none focus:border-[#0d6644] transition-colors bg-white";

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* Left panel */}
      <div
        className="hidden md:flex flex-col justify-between w-[42%] shrink-0 p-10 relative overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0d2e22]/80" />
        <div className="relative z-10">
          <span className="text-white font-bold text-lg">VelStay</span>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-3xl font-bold leading-tight">
            Elevate your hospitality management
          </h2>
          <p className="text-[#a8d5c2] text-sm leading-relaxed">
            Join thousands of business owners who trust our platform to streamline reservations, manage menus, and deliver exceptional guest experiences.
          </p>
          <div className="space-y-3 pt-2">
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#2ecc8e] text-base">bolt</span>
                <p className="text-white font-semibold text-sm">Advanced Analytics</p>
              </div>
              <p className="text-[#a8d5c2] text-xs">Real-time business insights at your fingertips.</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#2ecc8e] text-base">bar_chart</span>
                <p className="text-white font-semibold text-sm">Instant sync</p>
              </div>
              <p className="text-[#a8d5c2] text-xs">Cloud based data synchronization across all devices.</p>
            </div>
          </div>
        </div>
        <div />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-5">

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#0d6644]">Create your account</h1>
            <p className="text-[#777] text-sm">Enter your details to start your 14-day free trial</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('manager')}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                role === 'manager'
                  ? 'border-[#0d6644] bg-[#f0faf6]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${role === 'manager' ? 'text-[#0d6644]' : 'text-[#aaa]'}`}>
                store
              </span>
              <div className="text-center">
                <p className={`text-sm font-bold ${role === 'manager' ? 'text-[#0d6644]' : 'text-[#444]'}`}>I'm a Manager</p>
                <p className="text-xs text-[#aaa]">Manage my venue</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                role === 'client'
                  ? 'border-[#0d6644] bg-[#f0faf6]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${role === 'client' ? 'text-[#0d6644]' : 'text-[#aaa]'}`}>
                person
              </span>
              <div className="text-center">
                <p className={`text-sm font-bold ${role === 'client' ? 'text-[#0d6644]' : 'text-[#444]'}`}>I'm a Guest</p>
                <p className="text-xs text-[#aaa]">Explore & book places</p>
              </div>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#444] block">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputClass} />
            </div>

            {/* Manager-only fields */}
            {role === 'manager' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#444] block">Business Name</label>
                  <input name="restaurant" type="text" value={form.restaurant} onChange={handleChange} placeholder="Grand Legacy Hotel" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#444] block">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className={inputClass} style={{ color: form.category ? '#0d1f1a' : '#aaa' }}>
                    <option value="" disabled>Select Type</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="cafe">Café</option>
                    <option value="resort">Resort</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Client-only fields */}
            {role === 'client' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#444] block">Phone (optional)</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 555-0000" className={inputClass} />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#444] block">Email address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="work@company.com" className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#444] block">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••••••" className={inputClass} />
              <p className="text-xs text-[#aaa] mt-1">Must be at least 8 characters long</p>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#0d6644] hover:bg-[#0a5236] text-white font-semibold py-3 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create your account'}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e8e8e8]" />
            <span className="text-[#aaa] text-xs">or continue with</span>
            <div className="flex-1 h-px bg-[#e8e8e8]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg text-[#333] text-sm font-medium border border-[#dde] hover:bg-gray-50 transition-colors bg-white">
              <GoogleIcon /> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg text-[#333] text-sm font-medium border border-[#dde] hover:bg-gray-50 transition-colors bg-white">
              <span className="material-symbols-outlined text-base text-[#555]">corporate_fare</span> Enterprise
            </button>
          </div>

          <p className="text-center text-[#777] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0d6644] font-semibold hover:underline">Sign in.</Link>
          </p>
        </div>
      </div>
    </div>
  );
}