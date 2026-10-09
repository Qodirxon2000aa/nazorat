import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('filial_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.getCurrentUser();
        const me = res.user || res;
        setUser(me);
        try { localStorage.setItem('filial_user', JSON.stringify(me)); } catch (e) { /* ignore */ }
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          // Token haqiqatan yaroqsiz — chiqarib yuboramiz
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('filial_token');
          localStorage.removeItem('filial_user');
          setUser(null);
        } else {
          // Tarmoq/server vaqtinchalik ishlamayapti: foydalanuvchini tizimdan chiqarmaymiz,
          // saqlangan profil bilan kiramiz (sahifalarda "Qayta urinish" ko'rinadi)
          try {
            setUser(JSON.parse(localStorage.getItem('filial_user') || 'null'));
          } catch (e) {
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res && res.token) {
      localStorage.setItem('filial_token', res.token);
      try { localStorage.setItem('filial_user', JSON.stringify(res.user)); } catch (e) { /* ignore */ }
      setUser(res.user);
    } else {
      throw new Error('Token olinmadi');
    }
  };

  const logout = () => {
    localStorage.removeItem('filial_token');
    localStorage.removeItem('filial_user');
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
