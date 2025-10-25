import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authService.getUser();
      setUser(response.data);
    } catch (error) {
      // User is not authenticated or there was an error
      // This is expected when not logged in, so we don't log it as an error
      // Only log actual errors (not 401 which is expected)
      if (error.response?.status !== 401) {
        console.error('Auth check failed:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 
                     error.response?.data?.errors?.email?.[0] || 
                     'Login failed';
      return { 
        success: false, 
        message 
      };
    }
  };

  const register = async (name, email, password, password_confirmation, phone = '') => {
    try {
      const response = await authService.register({ 
        name, 
        email, 
        password, 
        password_confirmation,
        phone
      });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      // Even if logout fails on the server, we should clear the user state locally
      setUser(null);
      return { 
        success: false, 
        message: 'Logout failed' 
      };
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const updatePassword = async (data) => {
    try {
      const response = await authService.updatePassword(data);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password update failed'
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    loading,
    isAuthenticated: !!user,
  };

  // Always render children, even while loading
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};