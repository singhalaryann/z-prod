// app/context/AuthContext.js
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on initial load
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Initialize with default userId for demo mode
      const defaultUserId = 'a724a284-dd80-4ff2-8d0a-b36bff0fa426';
      localStorage.setItem('userId', defaultUserId);
      setUserId(defaultUserId);
    }
    setIsLoading(false);
  }, []);

  // Function to login user
  const login = (id) => {
    localStorage.setItem('userId', id);
    setUserId(id);
  };

  // Function to logout user
  const logout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
  };

  // Don't render children until we've checked localStorage
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);