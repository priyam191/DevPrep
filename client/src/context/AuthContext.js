import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

const AuthContext = createContext();
const AUTH_TOKEN_KEY = 'devprep_token';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep cookies for same-site deployments and send the token for cross-site APIs.
  axios.defaults.withCredentials = true;

  const checkUserStatus = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      if (response.data && response.data.user) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const apiOrigin = new URL(API_URL || window.location.origin, window.location.origin).origin;
    const interceptorId = axios.interceptors.request.use((config) => {
      const requestOrigin = new URL(config.url, window.location.origin).origin;

      if (requestOrigin === apiOrigin) {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        delete config.headers.Authorization;
      }

      return config;
    });

    checkUserStatus();

    return () => axios.interceptors.request.eject(interceptorId);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token } = response.data;
      if (!token) {
        throw new Error('Login response did not include an authentication token.');
      }
      localStorage.setItem(AUTH_TOKEN_KEY, token);

      const user = await checkUserStatus();
      if (!user) {
        throw new Error('Login succeeded, but authentication could not be verified.');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
