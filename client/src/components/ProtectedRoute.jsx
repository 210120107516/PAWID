import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Optional: Show a loading spinner while checking auth status
    return <div>Loading...</div>;
  }

  if (!user) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />; // 'replace' avoids adding login to history
  }

  // User is logged in, render the requested component/page
  // 'Outlet' is used when this component wraps other routes in App.jsx
  return children ? children : <Outlet />;
};

// Optional: Protect routes based on specific roles
export const RoleProtectedRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles || !allowedRoles.includes(user.role)) {
        // User does not have the required role, redirect or show forbidden page
        // Redirecting to dashboard or home might be friendlier than a stark forbidden page
        console.warn(`Access denied for role: ${user.role}. Required: ${allowedRoles.join(', ')}`);
        return <Navigate to="/dashboard" replace />; // Or show a specific 'Unauthorized' component
    }

    return children ? children : <Outlet />;
};


export default ProtectedRoute;