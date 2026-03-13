/**
 * AppRouter - React Router Configuration
 * --------------------------------------
 * Main router configuration for TikTrack Phoenix Frontend
 *
 * @description Defines all routes and navigation structure
 * @infrastructure Team 60 - Router setup
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../cubes/identity/components/auth/ProtectedRoute.jsx';
import HomePage from '../components/HomePage.jsx';

// Auth components (lazy loaded for better performance)
import LoginForm from '../cubes/identity/components/auth/LoginForm.jsx';
import RegisterForm from '../cubes/identity/components/auth/RegisterForm.jsx';
import PasswordResetFlow from '../cubes/identity/components/auth/PasswordResetFlow.jsx';
import ProfileView from '../cubes/identity/components/profile/ProfileView.jsx';

// Admin components
import DesignSystemDashboard from '../components/admin/DesignSystemDashboard.jsx';

/**
 * AppRouter Component
 *
 * @description Main router component that defines all application routes
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/reset-password" element={<PasswordResetFlow />} />

        {/* Type B (Shared): Home - accessible to both guests and authenticated users */}
        {/* No ProtectedRoute - Home is Type B (Shared) per ADR-013 */}
        <Route path="/" element={<HomePage />} />

        {/* Type C (Auth-only): Profile - requires authentication */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          }
        />

        {/* Type D (Admin-only): Design System Dashboard - requires ADMIN or SUPERADMIN role */}
        <Route
          path="/admin/design-system"
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <DesignSystemDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default redirect - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
