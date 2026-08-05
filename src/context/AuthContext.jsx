import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Foydalanuvchi iltimosiga binoan login tizimi o'chirildi. To'g'ridan-to'g'ri Admin qilib kiritiladi.
    const dummyAdmin = {
      id: 'admin_id',
      username: 'admin',
      name: 'Super',
      surname: 'Admin',
      role: 'Super Admin',
      permissions: [
        "filial_view",
        "filial_add",
        "filial_edit",
        "filial_delete",
        "xodim_view",
        "xodim_add",
        "xodim_edit",
        "xodim_delete",
        "baho_view",
        "baho_add",
        "statistika_view",
        "sozlamalar_view"
      ]
    };
    setUser(dummyAdmin);
    setLoading(false);
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
