import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Password reset failed');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};