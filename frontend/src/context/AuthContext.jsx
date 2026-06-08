import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rh_token');
    if (token) {
      authApi.me()
        .then(setUser)
        .catch(() => localStorage.removeItem('rh_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('rh_token', data.token);
    setUser(data.user);
    return data; // return so LoginPage can read data.user.role
  };

  const signup = async (formData) => {
    const data = await authApi.signup(formData);
    localStorage.setItem('rh_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    localStorage.removeItem('rh_token');
    setUser(null);
  };

  const isManager = user?.role === 'manager';
  const isClient = user?.role === 'client';

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isManager, isClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);