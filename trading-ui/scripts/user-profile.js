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

        // Try to get from cache first (UnifiedCacheManager)
        let user = null;
        const cacheKey = 'user_profile_data';
        
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
          try {
            const cachedUser = await window.UnifiedCacheManager.get(cacheKey, {
              layer: 'localStorage',
              ttl: 300000, // 5 minutes
              includeUserId: false
            });
            if (cachedUser) {
              user = cachedUser;
              window.Logger?.debug('✅ Loaded user profile from cache', { page: 'user-profile' });
            }
          } catch (cacheError) {
            window.Logger?.warn('Cache read failed, fetching from API', { error: cacheError, page: 'user-profile' });
          }
        }

        // If not in cache, try from TikTrackAuth
        if (!user) {
          user = window.TikTrackAuth?.getCurrentUser();
        }

        // If still no user, fetch from API
        if (!user) {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data?.user) {
              user = data.data.user;
              
              // Save to cache
              if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                try {
                  await window.UnifiedCacheManager.save(cacheKey, user, {
                    layer: 'localStorage',
                    ttl: 300000,
                    includeUserId: false
                  });
                } catch (cacheError) {
                  window.Logger?.warn('Cache save failed', { error: cacheError, page: 'user-profile' });
                }
              }
            }
          }

          // Not authenticated - redirect to login
          if (!user) {
            window.Logger?.warn('User not authenticated, redirecting to login', { page: 'user-profile' });
            window.location.href = 'login.html';
            return;
          }
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

          const updatedUser = data.data?.user;
          if (updatedUser) {
            // Update TikTrackAuth current user (update the internal state directly)
            // We already have the updated user from the API response, no need to call updateUserProfile again
            if (window.TikTrackAuth) {
              // Update the internal currentUser variable in auth.js
              // Since we can't directly access the private variable, we update localStorage
              // and the next getCurrentUser() call will load it
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              
              // Also try to update via getCurrentUser if it exists and returns a reference
              const currentUser = window.TikTrackAuth.getCurrentUser();
              if (currentUser) {
                // Update the returned object (if it's a reference)
                Object.assign(currentUser, updatedUser);
              }
            } else {
              // Fallback: update localStorage directly
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }

            // Update UnifiedCacheManager cache
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
              try {
                const cacheKey = 'user_profile_data';
                await window.UnifiedCacheManager.save(cacheKey, updatedUser, {
                  layer: 'localStorage',
                  ttl: 300000, // 5 minutes
                  includeUserId: false
                });
                window.Logger?.debug('✅ User profile saved to cache', { page: 'user-profile' });
              } catch (cacheError) {
                window.Logger?.warn('Cache save failed', { error: cacheError, page: 'user-profile' });
              }
            }

            // Invalidate user-related cache via CacheSyncManager
            if (window.CacheSyncManager) {
              try {
                await window.CacheSyncManager.invalidateByAction('user-updated');
                window.Logger?.debug('✅ Cache invalidated via CacheSyncManager', { page: 'user-profile' });
              } catch (syncError) {
                window.Logger?.warn('CacheSyncManager invalidation failed', { error: syncError, page: 'user-profile' });
              }
            }

            // Update header display
            if (window.HeaderSystem && typeof window.HeaderSystem.updateUserDisplay === 'function') {
              window.HeaderSystem.updateUserDisplay();
              window.Logger?.debug('✅ Header user display updated', { page: 'user-profile' });
            }

            // Dispatch event for other systems
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('user:updated', { detail: { user: updatedUser } }));
              window.dispatchEvent(new Event('login:success')); // For backward compatibility
            }
          }

          // Show success notification
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('פרטי המשתמש עודכנו בהצלחה', 'business');
          }

          // Reload profile to get updated data (this will also refresh from cache/API)
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

