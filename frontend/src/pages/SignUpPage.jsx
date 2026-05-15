import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', restaurant: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-8 py-16 bg-background">
      <div className="w-full max-w-[440px]">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 space-y-6" style={{ boxShadow: '0 4px 12px rgba(19,27,46,0.1)' }}>
          <div className="flex flex-col items-center text-center space-y-2 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-3xl">restaurant_menu</span>
              <span className="text-xl font-bold text-emerald-900">RestoHost Pro</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Create your account</h1>
            <p className="text-sm text-on-surface-variant">Start managing your restaurant smarter.</p>
          </div>

          {error && <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Alex Morgan' },
              { name: 'restaurant', label: 'Restaurant Name', type: 'text', placeholder: 'The Grand Bistro' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'alex@mybistro.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.name} className="space-y-1">
                <label className="text-xs font-semibold tracking-wide text-on-surface-variant block">{f.label}</label>
                <input
                  name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full px-6 py-3 bg-surface-container-low border border-outline rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full bg-primary text-on-primary text-sm font-semibold py-3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 mt-2 cursor-pointer"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
