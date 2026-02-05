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
        
        {/* Protected Routes - Authentication required */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect - redirect to home if authenticated, otherwise to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
