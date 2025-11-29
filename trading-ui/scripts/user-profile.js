/**
 * User Profile Page - TikTrack
 * עמוד ניהול פרופיל משתמש
 *
 * Dependencies:
 * - auth.js (TikTrackAuth)
 * - notification-system.js (NotificationSystem)
 * - logger-service.js (Logger)
 *
 * File: trading-ui/scripts/user-profile.js
 * Version: 1.0.0
 * Last Updated: January 28, 2025
 */

(function() {
  'use strict';

  /**
   * User Profile Page Manager
   * מנהל עמוד פרופיל משתמש
   */
  const UserProfilePage = {
    version: '1.0.0',
    initialized: false,

    /**
     * Initialize the user profile page
     * אתחול עמוד פרופיל משתמש
     */
    async init() {
      if (this.initialized) {
        window.Logger?.warn('UserProfilePage already initialized', { page: 'user-profile' });
        return;
      }

      try {
        window.Logger?.info('🚀 Initializing User Profile Page...', { page: 'user-profile' });

        // Check authentication
        if (!window.TikTrackAuth || !window.TikTrackAuth.isAuthenticated()) {
          window.Logger?.warn('User not authenticated, redirecting to login', { page: 'user-profile' });
          window.location.href = 'login.html';
          return;
        }

        // Load user profile data
        await this.loadUserProfile();

        // Setup form handlers
        this.setupFormHandlers();

        this.initialized = true;
        window.Logger?.info('✅ User Profile Page initialized successfully', { page: 'user-profile' });
      } catch (error) {
        window.Logger?.error('❌ Error initializing User Profile Page', error, { page: 'user-profile' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה באתחול עמוד פרופיל משתמש', 'system');
        }
      }
    },

    /**
     * Load user profile data
     * טעינת נתוני פרופיל משתמש
     */
    async loadUserProfile() {
      try {
        window.Logger?.info('Loading user profile data...', { page: 'user-profile' });

        const user = window.TikTrackAuth?.getCurrentUser();
        if (!user) {
          // Try to fetch from API
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data?.user) {
              this.populateProfileForm(data.data.user);
              return;
            }
          }

          // Not authenticated - redirect to login
          window.Logger?.warn('User not authenticated, redirecting to login', { page: 'user-profile' });
          window.location.href = 'login.html';
          return;
        }

        // Populate form with user data
        this.populateProfileForm(user);
      } catch (error) {
        window.Logger?.error('Error loading user profile', error, { page: 'user-profile' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בטעינת פרטי המשתמש', 'system');
        }
      }
    },

    /**
     * Populate profile form with user data
     * מילוי טופס פרופיל עם נתוני משתמש
     */
    populateProfileForm(user) {
      try {
        const usernameEl = document.getElementById('profileUsername');
        const emailEl = document.getElementById('profileEmail');
        const firstNameEl = document.getElementById('profileFirstName');
        const lastNameEl = document.getElementById('profileLastName');

        if (usernameEl) usernameEl.value = user.username || '';
        if (emailEl) emailEl.value = user.email || '';
        if (firstNameEl) firstNameEl.value = user.first_name || '';
        if (lastNameEl) lastNameEl.value = user.last_name || '';

        window.Logger?.info('Profile form populated successfully', { page: 'user-profile' });
      } catch (error) {
        window.Logger?.error('Error populating profile form', error, { page: 'user-profile' });
      }
    },

    /**
     * Setup form event handlers
     * הגדרת מטפלי אירועים לטפסים
     */
    setupFormHandlers() {
      // User info form
      const userInfoForm = document.getElementById('userInfoForm');
      if (userInfoForm) {
        userInfoForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleProfileUpdate(e);
        });
      }

      // Password form
      const passwordForm = document.getElementById('passwordForm');
      if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handlePasswordChange(e);
        });
      }
    },

    /**
     * Handle profile update
     * טיפול בעדכון פרופיל
     */
    async handleProfileUpdate(event) {
      event.preventDefault();

      const email = document.getElementById('profileEmail')?.value || '';
      const firstName = document.getElementById('profileFirstName')?.value || '';
      const lastName = document.getElementById('profileLastName')?.value || '';

      // Set loading state
      this.setLoadingState(true, 'updateInfoBtn', 'updateInfoBtnText', 'updateInfoBtnSpinner');

      try {
        window.Logger?.info('Updating user profile...', { page: 'user-profile' });

        const response = await fetch('/api/auth/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: email || null,
            first_name: firstName || null,
            last_name: lastName || null,
          }),
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          window.Logger?.info('User profile updated successfully', { page: 'user-profile' });

          // Show success notification
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('פרטי המשתמש עודכנו בהצלחה', 'business');
          }

          // Update local storage
          if (data.data?.user) {
            localStorage.setItem('currentUser', JSON.stringify(data.data.user));
            
            // Update header display if available
            if (window.dispatchEvent) {
              window.dispatchEvent(new Event('login:success'));
            }
          }

          // Reload profile to get updated data
          await this.loadUserProfile();
        } else {
          const errorMessage = data.error?.message || 'שגיאה בעדכון פרטים';
          window.Logger?.error('Failed to update user profile', { message: errorMessage }, { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(errorMessage, 'system');
          }
        }
      } catch (error) {
        window.Logger?.error('Error updating user profile', error, { page: 'user-profile' });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בעדכון פרטי המשתמש: ' + (error.message || 'שגיאה לא ידועה'), 'system');
        }
      } finally {
        this.setLoadingState(false, 'updateInfoBtn', 'updateInfoBtnText', 'updateInfoBtnSpinner');
      }
    },

    /**
     * Handle password change
     * טיפול בשינוי סיסמה
     */
    async handlePasswordChange(event) {
      event.preventDefault();

      const currentPassword = document.getElementById('currentPassword')?.value || '';
      const newPassword = document.getElementById('newPassword')?.value || '';
      const confirmPassword = document.getElementById('confirmNewPassword')?.value || '';

      // Validation
      if (newPassword !== confirmPassword) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('הסיסמאות החדשות אינן תואמות', 'system');
        }
        return;
      }

      if (newPassword.length < 6) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('סיסמה חדשה חייבת להכיל לפחות 6 תווים', 'system');
        }
        return;
      }

      // Set loading state
      this.setLoadingState(true, 'updatePasswordBtn', 'updatePasswordBtnText', 'updatePasswordBtnSpinner');

      try {
        window.Logger?.info('Changing user password...', { page: 'user-profile' });

        const response = await fetch('/api/auth/me/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          window.Logger?.info('Password changed successfully', { page: 'user-profile' });

          // Show success notification
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('סיסמה עודכנה בהצלחה', 'business');
          }

          // Clear password fields
          const currentPasswordEl = document.getElementById('currentPassword');
          const newPasswordEl = document.getElementById('newPassword');
          const confirmPasswordEl = document.getElementById('confirmNewPassword');

          if (currentPasswordEl) currentPasswordEl.value = '';
          if (newPasswordEl) newPasswordEl.value = '';
          if (confirmPasswordEl) confirmPasswordEl.value = '';
        } else {
          const errorMessage = data.error?.message || 'שגיאה בעדכון סיסמה';
          window.Logger?.error('Failed to change password', { message: errorMessage }, { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(errorMessage, 'system');
          }
        }
      } catch (error) {
        window.Logger?.error('Error changing password', error, { page: 'user-profile' });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בעדכון הסיסמה: ' + (error.message || 'שגיאה לא ידועה'), 'system');
        }
      } finally {
        this.setLoadingState(false, 'updatePasswordBtn', 'updatePasswordBtnText', 'updatePasswordBtnSpinner');
      }
    },

    /**
     * Set loading state for buttons
     * הגדרת מצב טעינה לכפתורים
     */
    setLoadingState(isLoading, buttonId, textId, spinnerId) {
      const button = document.getElementById(buttonId);
      const text = document.getElementById(textId);
      const spinner = document.getElementById(spinnerId);

      if (button) {
        button.disabled = isLoading;
      }

      if (text) {
        text.style.display = isLoading ? 'none' : 'inline';
      }

      if (spinner) {
        spinner.style.display = isLoading ? 'inline' : 'none';
      }
    },
  };

  // Export to global scope
  window.UserProfilePage = UserProfilePage;

  window.Logger?.info('✅ UserProfilePage loaded successfully', { page: 'user-profile' });
})();

