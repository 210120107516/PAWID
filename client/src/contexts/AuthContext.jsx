import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService'; // We'll create this

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth check

  useEffect(() => {
    // Check for token in local storage on initial load
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Optionally: Verify token with backend '/me' endpoint
          const currentUser = await authService.getMe(token); // Pass token
          setUser(currentUser);
        } catch (error) {
          console.error("Session check failed:", error);
          localStorage.removeItem('authToken'); // Invalid token
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('authToken', data.token);
      setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
      return data; // Return user data/token if needed
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw error to be caught in the component
    }
  };

  const register = async (name, email, password, role) => {
     try {
      const data = await authService.register(name, email, password, role);
      localStorage.setItem('authToken', data.token);
      setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    // Optionally: Call a backend logout endpoint if needed
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children} {/* Render children only after initial loading check */}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};