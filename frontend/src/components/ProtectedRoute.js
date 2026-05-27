import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap any <Route> element with this to require a valid session.
 * Saves the attempted URL so after login the user is sent back there.
 *
 * Usage in App.js:
 *   <Route path="/movies" element={<ProtectedRoute><Movies /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}