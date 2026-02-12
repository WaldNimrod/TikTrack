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
import { debugLog } from '../../../../utils/debug.js';

/**
 * ProtectedRoute Component
 * 
 * @description רכיב wrapper שמגן על routes שדורשים אימות
 * Stage 1: Enhanced to support Admin-only (Type D) per ADR-013
 * @legacyReference Legacy.auth.isAuthenticated()
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - התוכן להגנה
 * @param {boolean} [props.requireAuth=true] - האם נדרש אימות (default: true)
 * @param {boolean} [props.requireAdmin=false] - האם נדרש תפקיד מנהל (Type D: Admin-only)
 */
const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    /**
     * Check Authentication Status
     * Stage 1: Enhanced to support Admin-only (Type D) per ADR-013
     * 
     * @description בודק את סטטוס האימות ו-role (אם נדרש)
     */
    const checkAuth = async () => {
      setIsChecking(true);
      debugLog('Auth', 'ProtectedRoute: Checking authentication status', { requireAdmin });

      try {
        // Check if access token exists
        const hasToken = authService.isAuthenticated();
        
        if (!hasToken) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsChecking(false);
          debugLog('Auth', 'ProtectedRoute: No access token found');
          return;
        }

        // Try to get current user to verify token is valid
        try {
          await authService.getCurrentUser();
          setIsAuthenticated(true);
          
          // Check admin role if required (Type D: Admin-only)
          if (requireAdmin) {
            const userIsAdmin = authService.isAdmin();
            setIsAdmin(userIsAdmin);
            debugLog('Auth', 'ProtectedRoute: User authenticated', { 
              isAdmin: userIsAdmin,
              role: authService.getUserRole()
            });
          } else {
            setIsAdmin(false); // Not checking admin for regular routes
            debugLog('Auth', 'ProtectedRoute: User authenticated');
          }
        } catch (error) {
          // Token might be expired, try to refresh
          debugLog('Auth', 'ProtectedRoute: Token validation failed, attempting refresh');
          
          try {
            await authService.refreshToken();
            setIsAuthenticated(true);
            
            // Check admin role after refresh if required
            if (requireAdmin) {
              const userIsAdmin = authService.isAdmin();
              setIsAdmin(userIsAdmin);
              debugLog('Auth', 'ProtectedRoute: Token refreshed successfully', { 
                isAdmin: userIsAdmin 
              });
            } else {
              setIsAdmin(false);
              debugLog('Auth', 'ProtectedRoute: Token refreshed successfully');
            }
          } catch (refreshError) {
            // Refresh failed - user needs to login
            setIsAuthenticated(false);
            setIsAdmin(false);
            audit.error('Auth', 'ProtectedRoute: Token refresh failed', refreshError);
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        audit.error('Auth', 'ProtectedRoute: Authentication check failed', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (requireAuth || requireAdmin) {
      checkAuth();
    } else {
      setIsAuthenticated(true);
      setIsAdmin(false);
      setIsChecking(false);
    }
  }, [requireAuth, requireAdmin]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="auth-layout-root" dir="rtl">
        <tt-container>
          <tt-section>
            <div className="auth-loading-state">
              <p>בודק הרשאות...</p>
            </div>
          </tt-section>
        </tt-container>
      </div>
    );
  }

  // Type D (Admin-only): Guest → Home; Logged-in but not admin → block message (per product decision)
  if (requireAdmin && !isAuthenticated) {
    debugLog('Auth', 'ProtectedRoute: Guest on admin route → redirect to Home');
    return <Navigate to="/" replace />;
  }
  if (requireAdmin && isAuthenticated && !isAdmin) {
    debugLog('Auth', 'ProtectedRoute: User not authorized for admin route (show block message)', {
      role: authService.getUserRole()
    });
    return (
      <div className="auth-layout-root" dir="rtl">
        <tt-container>
          <tt-section>
            <div className="auth-block-message" role="alert">
              <h2>אין הרשאה</h2>
              <p>אין לך הרשאה לגשת לעמוד זה. נדרשת הרשאת מנהל.</p>
              <a href="/" className="phx-btn phx-btn--primary">חזרה לדף הבית</a>
            </div>
          </tt-section>
        </tt-container>
      </div>
    );
  }

  // Type C (Auth-only): Guest → redirect to Home (not /login per ADR-013)
  if (requireAuth && !isAuthenticated) {
    debugLog('Auth', 'ProtectedRoute: Redirecting to Home (Type C: Auth-only)');
    return <Navigate to="/" replace />;
  }

  // User is authenticated (and admin if required) or route doesn't require auth
  return <>{children}</>;
};

export default ProtectedRoute;
