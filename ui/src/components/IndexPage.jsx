/**
 * IndexPage - דף בית זמני
 * -------------------------
 * דף אינדקס זמני עם כפתור התחברות והצגת שם משתמש מחובר
 * 
 * @description דף בית זמני להצגת מצב התחברות וכפתור התחברות
 * @temporary Temporary index page until full dashboard is ready
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.js';
import { audit } from '../utils/audit.js';
import { debugLog } from '../utils/debug.js';

/**
 * IndexPage Component
 * 
 * @description דף בית זמני עם כפתור התחברות והצגת שם משתמש מחובר
 */
const IndexPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * בדיקת מצב התחברות נוכחי
     */
    const checkAuthStatus = async () => {
      try {
        debugLog('IndexPage', 'Checking authentication status');
        
        // בדיקה אם יש access token
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          debugLog('IndexPage', 'No access token found');
          setLoading(false);
          return;
        }

        // ניסיון לקבל מידע על המשתמש הנוכחי
        try {
          const userData = await authService.getCurrentUser();
          debugLog('IndexPage', 'User data retrieved', { 
            userId: userData.externalUlids, 
            username: userData.username 
          });
          setCurrentUser(userData);
        } catch (error) {
          debugLog('IndexPage', 'Failed to get user data', error);
          // אם יש שגיאה, מנקים את ה-token
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        debugLog('IndexPage', 'Error checking auth status', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * טיפול בלחיצה על כפתור התחברות
   */
  const handleLoginClick = () => {
    audit.log('IndexPage', 'Login button clicked');
    navigate('/login');
  };

  /**
   * טיפול בלחיצה על כפתור התנתקות
   */
  const handleLogoutClick = async () => {
    try {
      audit.log('IndexPage', 'Logout button clicked');
      await authService.logout();
      setCurrentUser(null);
      navigate('/login');
    } catch (error) {
      debugLog('IndexPage', 'Logout error', error);
      // גם אם יש שגיאה, מנקים את ה-state
      localStorage.removeItem('access_token');
      setCurrentUser(null);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>טוען...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>🏛️ TikTrack Phoenix</h1>
        <p>מערכת ניהול מסחר</p>
      </header>

      <main>
        {currentUser ? (
          <div style={{ 
            padding: '2rem', 
            border: '1px solid var(--pico-border-color)', 
            borderRadius: 'var(--pico-border-radius)',
            textAlign: 'center'
          }}>
            <h2>✅ מחובר</h2>
            <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
              <strong>שם משתמש:</strong> {currentUser.username || currentUser.email || 'לא זמין'}
            </p>
            {currentUser.email && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>אימייל:</strong> {currentUser.email}
              </p>
            )}
            {currentUser.role && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>תפקיד:</strong> {currentUser.role}
              </p>
            )}
            {currentUser.displayName && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>שם תצוגה:</strong> {currentUser.displayName}
              </p>
            )}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                to="/profile"
                className="primary"
                style={{ 
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  textDecoration: 'none',
                  borderRadius: 'var(--pico-border-radius)',
                  fontSize: '1rem'
                }}
              >
                ניהול פרופיל
              </Link>
              <button 
                onClick={handleLogoutClick}
                className="secondary"
              >
                התנתק
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: '2rem', 
            border: '1px solid var(--pico-border-color)', 
            borderRadius: 'var(--pico-border-radius)',
            textAlign: 'center'
          }}>
            <h2>👋 ברוך הבא</h2>
            <p style={{ margin: '1.5rem 0' }}>
              על מנת להתחבר למערכת, לחץ על הכפתור הבא:
            </p>
            <button 
              onClick={handleLoginClick}
              className="primary"
              style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}
            >
              התחבר
            </button>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--pico-muted-color)' }}>
        <p>דף זמני - פרויקט פיניקס v2.5</p>
      </footer>
    </div>
  );
};

export default IndexPage;
