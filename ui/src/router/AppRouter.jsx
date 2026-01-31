import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import PasswordResetFlow from '../components/auth/PasswordResetFlow.jsx';
// Import other components as they are created
// import ApiKeysManagement from '../components/api-keys/ApiKeysManagement.jsx';
// import SecuritySettings from '../components/security/SecuritySettings.jsx';

/**
 * AppRouter - הגדרת Routes למערכת
 * 
 * @description מגדיר את כל ה-Routes של האפליקציה
 * @legacyReference Legacy.routing
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/reset-password" element={<PasswordResetFlow />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {/* Dashboard component - to be created */}
              <div>Dashboard - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-keys"
          element={
            <ProtectedRoute>
              {/* API Keys component - to be created in Task 30.1.5 */}
              <div>API Keys Management - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute>
              {/* Security Settings component - to be created in Task 30.1.6 */}
              <div>Security Settings - Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
