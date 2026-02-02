/**
 * ProtectedRoute - רכיב הגנה על Routes
 * -------------------------------------
 * רכיב React להגנה על routes שדורשים אימות
 * 
 * @description בודק אם המשתמש מחובר ומפנה ל-login אם לא
 * @legacyReference Legacy.auth.isAuthenticated()
 */

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/auth.js';
import { audit } from '../../../../utils/audit.js';

/**
 * ProtectedRoute Component
 * 
 * @description רכיב wrapper שמגן על routes שדורשים אימות
 * @legacyReference Legacy.auth.isAuthenticated()
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - התוכן להגנה
 * @param {boolean} [props.requireAuth=true] - האם נדרש אימות (default: true)
 */
const ProtectedRoute = ({ children, requireAuth = true }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    /**
     * Check Authentication Status
     * 
     * @description בודק את סטטוס האימות
     */
    const checkAuth = async () => {
      setIsChecking(true);
      audit.log('Auth', 'ProtectedRoute: Checking authentication status');

      try {
        // Check if access token exists
        const hasToken = authService.isAuthenticated();
        
        if (!hasToken) {
          setIsAuthenticated(false);
          setIsChecking(false);
          audit.log('Auth', 'ProtectedRoute: No access token found');
          return;
        }

        // Try to get current user to verify token is valid
        try {
          await authService.getCurrentUser();
          setIsAuthenticated(true);
          audit.log('Auth', 'ProtectedRoute: User authenticated');
        } catch (error) {
          // Token might be expired, try to refresh
          audit.log('Auth', 'ProtectedRoute: Token validation failed, attempting refresh');
          
          try {
            await authService.refreshToken();
            setIsAuthenticated(true);
            audit.log('Auth', 'ProtectedRoute: Token refreshed successfully');
          } catch (refreshError) {
            // Refresh failed - user needs to login
            setIsAuthenticated(false);
            audit.error('Auth', 'ProtectedRoute: Token refresh failed', refreshError);
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        audit.error('Auth', 'ProtectedRoute: Authentication check failed', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (requireAuth) {
      checkAuth();
    } else {
      setIsAuthenticated(true);
      setIsChecking(false);
    }
  }, [requireAuth]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="auth-layout-root" dir="rtl">
        <tt-container>
          <tt-section>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>בודק הרשאות...</p>
            </div>
          </tt-section>
        </tt-container>
      </div>
    );
  }

  // If authentication is required and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    audit.log('Auth', 'ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // User is authenticated or route doesn't require auth
  return <>{children}</>;
};

export default ProtectedRoute;
