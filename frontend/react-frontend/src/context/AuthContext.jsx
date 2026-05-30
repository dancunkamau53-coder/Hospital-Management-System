import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { getToken, setToken } from '../utils/tokenManager';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setTokenState] = useState(getToken());

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token: accessToken, user: loggedUser } = response.data;
    setToken(accessToken);
    setTokenState(accessToken);
    setUser(loggedUser);

    if (loggedUser.role === 'ADMIN') {
      navigate('/admin');
    } else if (loggedUser.role === 'DOCTOR') {
      navigate('/doctor');
    } else {
      navigate('/patient');
    }
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    const { token: accessToken, user: createdUser } = response.data;
    setToken(accessToken);
    setTokenState(accessToken);
    setUser(createdUser);
    navigate('/patient');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTokenState(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}
