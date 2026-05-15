import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center min-h-screen px-8 py-16 bg-background relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-surface-container-low/50 to-transparent pointer-events-none" />

      <div className="w-full max-w-[440px] z-10">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 space-y-6" style={{ boxShadow: '0 4px 12px rgba(19,27,46,0.1)' }}>
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-3xl">restaurant_menu</span>
              <span className="text-xl font-bold text-emerald-900">RestoHost Pro</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Welcome back</h1>
            <p className="text-sm text-on-surface-variant">Manage your reservations and kitchen with ease.</p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-on-surface-variant block">Email Address</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="manager@grandbistro.com"
                className="w-full px-6 py-3 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold tracking-wide text-on-surface-variant">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot Password?</a>
              </div>
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-6 py-3 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary text-sm font-semibold py-3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              <div className="flex items-center gap-2">
                <div className="h-px flex-grow bg-outline-variant" />
                <span className="text-xs text-outline">or continue with</span>
                <div className="h-px flex-grow bg-outline-variant" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 border border-outline py-3 rounded-lg text-xs font-medium hover:bg-surface-container transition-colors">
                  <img alt="Google" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqmdePq9chuUZItY9kwzNOvIg0gF-Occ9XgbWcW9T1-GJuadMwZ_VN0OsroBXRKglw0tb-qsaN-pNOk_DP8wDOn52CW_D9Ncqm1znO3GEmW_PSZr9aBp9fs1KBRAiL4hnxSypqIZ2cfQgYnVXqCspRxJBEAGvZixfN4dc5C4WBoOl35sVFGOmXmgmVt2NX0xqeQ6XSOVx7hzCZXLYBFoOq3HoMmzrDJ5528JC2zWv4WlJk7Y7j5lC4SkQMZS_2HegadKIgMIxE4kux" />
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 border border-outline py-3 rounded-lg text-xs font-medium hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-base">terminal</span>
                  Enterprise
                </button>
              </div>
            </div>
          </form>

          <div className="pt-4 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-0 w-full py-6 border-t border-slate-100 bg-white text-xs">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-3">
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Contact Support</a>
          </div>
          <p className="text-slate-400">© 2024 RestoHost Management Systems. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
