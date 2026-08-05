import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('filial_token');
      if (token) {
        try {
          const res = await api.getCurrentUser();
          // Assuming backend returns { user: {...} } or just {...}
          setUser(res.user || res);
        } catch (error) {
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('filial_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res && res.token) {
      localStorage.setItem('filial_token', res.token);
      setUser(res.user);
    } else {
      throw new Error('Token olinmadi');
    }
  };

  const logout = () => {
    localStorage.removeItem('filial_token');
    setUser(null);
  };

  const hasPermission = (permissionId) => {
    if (!user) return false;
    if (user.role === 'Super Admin') return true;
    return user.permissions?.includes(permissionId) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth AuthProvider ichida ishlatilishi kerak');
  }
  return context;
};
