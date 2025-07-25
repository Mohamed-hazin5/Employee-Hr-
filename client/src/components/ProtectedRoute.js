import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = localStorage.getItem('role');

  if (!user) {
    // User not authenticated, redirect to login
    return <Navigate to="/" replace />;
  }

  // Ensure allowedRoles is always an array for consistent processing
  const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  // Normalize the user's role to lowercase for case-insensitive comparison
  const normalizedRole = role ? role.toLowerCase() : '';

  if (allowedRoles && !rolesToCheck.some(allowedRole => allowedRole.toLowerCase() === normalizedRole)) {
    // User authenticated but not authorized, redirect to dashboard or unauthorized page
    // For simplicity, redirecting to dashboard. You might want a dedicated unauthorized page.
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;