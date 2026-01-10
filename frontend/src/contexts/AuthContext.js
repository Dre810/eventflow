import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import Swal from 'sweetalert2';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Don't logout immediately, just set user to null
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      // For development, use mock login
      const response = process.env.NODE_ENV === 'development' 
        ? await authAPI.mockLogin({ email, password })
        : await authAPI.login({ email, password });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      Swal.fire({
        title: 'Welcome back!',
        text: `Successfully logged in as ${user.name}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      
      return user;
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      Swal.fire({
        title: 'Welcome!',
        text: 'Account created successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      
      return user;
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    Swal.fire({
      title: 'Logging out...',
      text: 'You have been logged out',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/';
    });
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      Swal.fire('Success', 'Profile updated successfully', 'success');
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      login,
      register,
      logout,
      updateProfile,
      checkAuth,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};