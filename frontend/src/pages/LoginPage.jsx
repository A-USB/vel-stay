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
      const data = await login(form.email, form.password);
      // Route based on role returned from backend
      if (data.user.role === 'manager') {
        navigate('/dashboard');
      } else {
        navigate('/client');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#0d2e22]/75" />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8 space-y-6"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(100,220,180,0.35)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-[#a8d5c2] text-sm font-semibold tracking-widest uppercase">VelStay</p>
          <h1 className="text-white text-3xl font-bold">Welcome Back</h1>
          <p className="text-[#a8d5c2] text-sm">Sign in to your manager or guest account</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-white/70 text-xs font-medium block">Email address</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#2ecc8e]"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-white/70 text-xs font-medium">Password</label>
              <a href="#" className="text-xs text-[#2ecc8e] hover:underline">Forgot Password?</a>
            </div>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#2ecc8e]"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#0d6644] hover:bg-[#0a5236] text-white font-semibold py-3 rounded-lg text-sm transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Role hint */}
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/60 text-xs">
            You'll be directed to the right workspace based on your account type automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/50 text-xs">or continue with</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-white text-sm font-medium transition-colors hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <GoogleIcon /> Google
          </button>
          <button
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-white text-sm font-medium transition-colors hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <span className="material-symbols-outlined text-base">corporate_fare</span> Enterprise
          </button>
        </div>

        <p className="text-center text-white/50 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#2ecc8e] font-semibold hover:underline">Create an account.</Link>
        </p>
      </div>
    </div>
  );
}