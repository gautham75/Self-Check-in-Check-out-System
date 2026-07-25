import React, { createContext, useState } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('self_checkin_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('self_checkin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (usernameOrEmail, password) => {
    const authData = await authService.login(usernameOrEmail, password);
    const { accessToken, id, username, email, fullName, role } = authData;

    const userObj = { id, username, email, fullName, role };

    setToken(accessToken);
    setUser(userObj);

    localStorage.setItem('self_checkin_token', accessToken);
    localStorage.setItem('self_checkin_user', JSON.stringify(userObj));

    return userObj;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('self_checkin_token');
    localStorage.removeItem('self_checkin_user');
  };

  const changePassword = async (oldPassword, newPassword) => {
    return await authService.changePassword(oldPassword, newPassword);
  };

  const role = user?.role || null;
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAdmin,
        isStaff,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
