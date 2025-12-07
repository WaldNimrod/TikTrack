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

        // Wait for auth.js to load if not available
        if (!window.TikTrackAuth) {
          window.Logger?.info('Waiting for TikTrackAuth to load...', { page: 'user-profile' });
          let attempts = 0;
          while (!window.TikTrackAuth && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }

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

        // Replace icons with IconSystem
        if (typeof window.replaceIconsInContext === 'function') {
          try {
            await window.replaceIconsInContext(document);
            window.Logger?.debug('✅ Icons replaced with IconSystem', { page: 'user-profile' });
          } catch (iconError) {
            window.Logger?.warn('Failed to replace icons', { error: iconError, page: 'user-profile' });
          }
        }

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
          try {
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
            } else if (response.status === 401) {
              // 401 is expected when not authenticated - silently handle it
              // Don't log as error to avoid console pollution
            }
          } catch (error) {
            // Only log non-401 errors to avoid console pollution
            // 401 errors are expected and handled silently
            if (error.message && !error.message.includes('401') && !error.message.includes('UNAUTHORIZED')) {
              window.Logger?.warn('Error fetching user profile', { error: error.message, page: 'user-profile' });
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

      // Collect form data using DataCollectionService
      let formData;
      if (window.DataCollectionService && typeof window.DataCollectionService.collectFormData === 'function') {
        formData = window.DataCollectionService.collectFormData({
          email: { id: 'profileEmail', type: 'text', default: null },
          first_name: { id: 'profileFirstName', type: 'text', default: null },
          last_name: { id: 'profileLastName', type: 'text', default: null }
        });
      } else {
        // Fallback to manual collection
        formData = {
          email: document.getElementById('profileEmail')?.value || null,
          first_name: document.getElementById('profileFirstName')?.value || null,
          last_name: document.getElementById('profileLastName')?.value || null
        };
      }

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
          body: JSON.stringify(formData),
        });

        // Use CRUDResponseHandler for response handling
        if (window.CRUDResponseHandler && typeof window.CRUDResponseHandler.handleSaveResponse === 'function') {
          const crudResult = await window.CRUDResponseHandler.handleSaveResponse(response, {
            successMessage: 'פרטי המשתמש עודכנו בהצלחה',
            entityName: 'פרופיל משתמש',
            requiresHardReload: false,
          });

          // If save was successful, handle post-save operations
          if (crudResult && crudResult.status === 'success') {
            const updatedUser = crudResult.data?.user;
            if (updatedUser) {
              await this.handlePostProfileUpdate(updatedUser);
              // Reload profile to get updated data
              await this.loadUserProfile();
            }
          }
        } else {
          // Fallback to manual handling
          const data = await response.json();
          if (response.ok && data.status === 'success') {
            const updatedUser = data.data?.user;
            if (updatedUser) {
              await this.handlePostProfileUpdate(updatedUser);
              await this.loadUserProfile();
            }
          } else {
            const errorMessage = data.error?.message || 'שגיאה בעדכון פרטים';
            window.Logger?.error('Failed to update user profile', { message: errorMessage }, { page: 'user-profile' });
            if (window.NotificationSystem) {
              window.NotificationSystem.showError(errorMessage, 'system');
            }
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
     * Handle post-profile update operations (cache, events, etc.)
     * טיפול בפעולות לאחר עדכון פרופיל
     */
    async handlePostProfileUpdate(updatedUser) {
      // Update TikTrackAuth current user
      if (window.TikTrackAuth) {
        window.PageStateManager?.setItem('currentUser', JSON.stringify(updatedUser));
        const currentUser = window.TikTrackAuth.getCurrentUser();
        if (currentUser) {
          Object.assign(currentUser, updatedUser);
        }
      } else {
        window.PageStateManager?.setItem('currentUser', JSON.stringify(updatedUser));
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
    },

    /**
     * Handle password change
     * טיפול בשינוי סיסמה
     */
    async handlePasswordChange(event) {
      event.preventDefault();

      // Collect form data using DataCollectionService
      let formData;
      if (window.DataCollectionService && typeof window.DataCollectionService.collectFormData === 'function') {
        formData = window.DataCollectionService.collectFormData({
          current_password: { id: 'currentPassword', type: 'text' },
          new_password: { id: 'newPassword', type: 'text' },
          confirm_password: { id: 'confirmNewPassword', type: 'text' }
        });
      } else {
        // Fallback to manual collection
        formData = {
          current_password: document.getElementById('currentPassword')?.value || '',
          new_password: document.getElementById('newPassword')?.value || '',
          confirm_password: document.getElementById('confirmNewPassword')?.value || ''
        };
      }

      // Client-side validation (password matching and length)
      if (formData.new_password !== formData.confirm_password) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('הסיסמאות החדשות אינן תואמות', 'system');
        }
        return;
      }

      if (formData.new_password.length < 6) {
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
            current_password: formData.current_password,
            new_password: formData.new_password,
          }),
        });

        // Use CRUDResponseHandler for response handling
        if (window.CRUDResponseHandler && typeof window.CRUDResponseHandler.handleSaveResponse === 'function') {
          const crudResult = await window.CRUDResponseHandler.handleSaveResponse(response, {
            successMessage: 'סיסמה עודכנה בהצלחה',
            entityName: 'סיסמה',
            requiresHardReload: false,
          });

          // If save was successful, clear password fields
          if (crudResult && crudResult.status === 'success') {
            const currentPasswordEl = document.getElementById('currentPassword');
            const newPasswordEl = document.getElementById('newPassword');
            const confirmPasswordEl = document.getElementById('confirmNewPassword');

            if (currentPasswordEl) currentPasswordEl.value = '';
            if (newPasswordEl) newPasswordEl.value = '';
            if (confirmPasswordEl) confirmPasswordEl.value = '';
          }
        } else {
          // Fallback to manual handling
          const data = await response.json();
          if (response.ok && data.status === 'success') {
            window.Logger?.info('Password changed successfully', { page: 'user-profile' });
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
        if (isLoading) {
          text.classList.add('d-none');
          text.classList.remove('d-inline');
        } else {
          text.classList.remove('d-none');
          text.classList.add('d-inline');
        }
      }

      if (spinner) {
        if (isLoading) {
          spinner.classList.add('show');
        } else {
          spinner.classList.remove('show');
        }
      }
    },
  };

  // Export to global scope
  window.UserProfilePage = UserProfilePage;

  window.Logger?.info('✅ UserProfilePage loaded successfully', { page: 'user-profile' });
})();

