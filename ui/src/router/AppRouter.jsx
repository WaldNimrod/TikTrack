/**
 * AppRouter - React Router Core Infrastructure
 * --------------------------------------------
 * Main router setup for TikTrack Phoenix Frontend
 * 
 * @description Provides routing infrastructure for Public and Protected routes
 * @legacyReference Legacy routing system
 * @infrastructure Team 60 - Router skeleton (Team 30 adds components/logic)
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Public Routes (will be imported by Team 30)
// import LoginForm from '../components/auth/LoginForm';
// import RegisterForm from '../components/auth/RegisterForm';
// import PasswordResetFlow from '../components/auth/PasswordResetFlow';

// Protected Routes (will be imported by Team 30)
// import Dashboard from '../views/Dashboard';
// import AccountsView from '../views/financial/D16_ACCTS_VIEW';
// import BrokersView from '../views/financial/D18_BRKRS_VIEW';
// import CashView from '../views/financial/D21_CASH_VIEW';

/**
 * AppRouter Component
 * 
 * @description Main router component with route definitions
 * - Public routes: /login, /register, /reset-password
 * - Protected routes: /dashboard, /accounts, /brokers, /cash
 * - Default redirect: / -> /login
 * - 404 fallback: * -> /login
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {/* TODO: Team 30 - Uncomment and import actual components */}
        {/* <Route path="/login" element={<LoginForm />} /> */}
        {/* <Route path="/register" element={<RegisterForm />} /> */}
        {/* <Route path="/reset-password" element={<PasswordResetFlow />} /> */}
        
        {/* Protected Routes */}
        {/* TODO: Team 30 - Uncomment and import actual components */}
        {/* <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } /> */}
        {/* <Route path="/accounts" element={
          <ProtectedRoute>
            <AccountsView />
          </ProtectedRoute>
        } /> */}
        {/* <Route path="/brokers" element={
          <ProtectedRoute>
            <BrokersView />
          </ProtectedRoute>
        } /> */}
        {/* <Route path="/cash" element={
          <ProtectedRoute>
            <CashView />
          </ProtectedRoute>
        } /> */}
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
