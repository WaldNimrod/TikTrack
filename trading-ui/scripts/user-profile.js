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

console.log('[user-profile.js] Script loaded, checking initial state...');
console.log('[user-profile.js] window.authToken:', !!window.authToken);
console.log('[user-profile.js] window.currentUser:', !!window.currentUser);
console.log('[user-profile.js] sessionStorage.authToken:', sessionStorage.getItem('authToken') ? 'present' : 'null');
console.log('[user-profile.js] sessionStorage.currentUser:', sessionStorage.getItem('currentUser') ? 'present' : 'null');

// Immediate auth check - redirect if not authenticated
(async function() {
  try {
    console.log('[user-profile.js] Running immediate auth check...');

    // Wait for auth data to be available or timeout
    let authWaitAttempts = 0;
    const maxAuthWait = 100; // 5 seconds

    while ((!window.authToken || !window.currentUser) && authWaitAttempts < maxAuthWait) {
      // Check sessionStorage for tokens
      const sessionToken = sessionStorage.getItem('authToken');
      const sessionUser = sessionStorage.getItem('currentUser');

      if (sessionToken && sessionUser) {
        // Try to set window objects from sessionStorage
        try {
          window.authToken = sessionToken;
          window.currentUser = JSON.parse(sessionUser);
          console.log('[user-profile.js] Set auth data from sessionStorage');
          break;
        } catch (e) {
          console.log('[user-profile.js] Failed to parse session user:', e.message);
        }
      }

      // Check UnifiedCacheManager if available
      if (window.UnifiedCacheManager?.initialized) {
        try {
          const ucToken = await window.UnifiedCacheManager.get('authToken', { layer: 'sessionStorage' });
          const ucUser = await window.UnifiedCacheManager.get('currentUser', { layer: 'sessionStorage' });
          if (ucToken && ucUser) {
            window.authToken = ucToken;
            window.currentUser = ucUser;
            console.log('[user-profile.js] Set auth data from UnifiedCacheManager');
            break;
          }
        } catch (e) {
          // Ignore
        }
      }

      await new Promise(resolve => setTimeout(resolve, 50));
      authWaitAttempts++;
    }

    if (!window.authToken || !window.currentUser) {
      console.log('[user-profile.js] No auth tokens found after waiting, redirecting to login');
      // Save current URL for redirect after login
      sessionStorage.setItem('login_redirect_url', window.location.href);
      window.location.href = '/login.html';
      return;
    }

    console.log('[user-profile.js] Auth check passed, continuing initialization');

  } catch (error) {
    console.log('[user-profile.js] Auth check failed:', error.message);
    window.location.href = '/login.html';
  }
})();

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

        // region agent log - user profile auth check
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            location: 'trading-ui/scripts/user-profile.js:init',
            message: 'User profile page initialization - checking auth state',
            data: {
              hasTikTrackAuth: !!window.TikTrackAuth,
              hasAuthToken: !!window.authToken,
              hasCurrentUser: !!window.currentUser,
              currentUserId: window.currentUser?.id,
              isAuthenticated: window.TikTrackAuth?.isAuthenticated?.(),
              documentReadyState: document.readyState,
              timestamp: Date.now()
            },
            sessionId: 'user_profile_auth_check',
            runId: 'option1_user_profile_fix',
            hypothesisId: 'user_profile_auth_state'
          })
        }).catch(() => {});
        // endregion

        // Wait for auth.js to load if not available
        if (!window.TikTrackAuth) {
          window.Logger?.info('Waiting for TikTrackAuth to load...', { page: 'user-profile' });
          let attempts = 0;
          while (!window.TikTrackAuth && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }

        // Wait for UnifiedCacheManager to initialize and sync auth data
        console.log('[user-profile] Starting UnifiedCacheManager wait, current state:', {
          hasUCM: !!window.UnifiedCacheManager,
          initialized: window.UnifiedCacheManager?.initialized,
          hasAuthToken: !!window.authToken,
          hasCurrentUser: !!window.currentUser
        });

        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
          window.Logger?.info('Waiting for UnifiedCacheManager to initialize...', { page: 'user-profile' });
          let attempts = 0;
          while ((!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          console.log(`[user-profile] UnifiedCacheManager wait completed after ${attempts} attempts`);
          window.Logger?.info(`UnifiedCacheManager wait completed after ${attempts} attempts`, { page: 'user-profile' });
        }

        // Additional wait for auth data to be available in window objects
        if (!window.authToken || !window.currentUser) {
          window.Logger?.info('Waiting for auth data to be available...', { page: 'user-profile' });
          let attempts = 0;
          while ((!window.authToken || !window.currentUser) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            // Try to sync from UnifiedCacheManager if available
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
              try {
                console.log('[user-profile] About to call UnifiedCacheManager.get...');
                const token = await window.UnifiedCacheManager.get('authToken', { layer: 'sessionStorage' });
                const user = await window.UnifiedCacheManager.get('currentUser', { layer: 'sessionStorage' });
                console.log(`[user-profile] UnifiedCacheManager.get results: token=${!!token}, user=${!!user}`);
                console.log(`[user-profile] Token value:`, token);
                console.log(`[user-profile] User value:`, user);
                if (token) window.authToken = token;
                if (user) window.currentUser = user;
                window.Logger?.debug(`Synced auth data: token=${!!token}, user=${!!user}`, { page: 'user-profile' });
              } catch (e) {
                console.log('[user-profile] UnifiedCacheManager.get error:', e.message);
                // Ignore sync errors
                window.Logger?.warn('Auth sync failed', { error: e.message, page: 'user-profile' });
              }
            }
          }
          window.Logger?.info(`Auth data wait completed after ${attempts} attempts`, { page: 'user-profile' });
        }

        // Authentication is handled by ensureAuthenticatedForPage in page-initialization-configs.js
        // ensureAuthenticatedForPage already verified authentication before this code runs

        // Load user profile data
        await this.loadUserProfile();

        // Load AI Analysis settings
        await this.loadAIAnalysisSettings();

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
        window.Logger?.info(`Auth state at loadUserProfile: token=${!!window.authToken}, user=${!!window.currentUser}`, { page: 'user-profile' });

        // Try to get from cache first (UnifiedCacheManager)
        let user = null;
        const cacheKey = 'user_profile_data';
        
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
          try {
            const cachedUser = await window.UnifiedCacheManager.get(cacheKey, {
              layer: 'sessionStorage',
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

        // If not in cache, try from window.currentUser (from bootstrap)
        if (!user) {
          user = window.currentUser;
        }

        // If still no user, try from TikTrackAuth
        if (!user) {
          user = window.TikTrackAuth?.getCurrentUser();
        }

        // If still no user, fetch from API
        if (!user) {
          try {
            // region agent log - user-profile fetch /api/auth/me
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/user-profile.js:fetch_api_auth_me',message:'Fetching /api/auth/me for user data',data:{page:window.location.pathname,hasAuthToken:!!window.authToken,hasCurrentUser:!!window.currentUser,sessionToken:sessionStorage.getItem('authToken')},sessionId:'debug-session',runId:'user_profile_loop_fix_v2',hypothesisId:'H7_user_profile_api_calls',timestamp:Date.now()})}).catch(()=>{});
            // endregion
            const response = await fetch('/api/auth/me', {
              method: 'GET', });

            if (response.ok) {
              const data = await response.json();
              if (data.status === 'success' && data.data?.user) {
                user = data.data.user;
                
                // Save to cache
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                  try {
                    await window.UnifiedCacheManager.save(cacheKey, user, {
                      layer: 'sessionStorage',
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

          // Authentication is handled by ensureAuthenticatedForPage - if we reach here, user should be authenticated
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
        const iconEl = document.getElementById('profileIcon');

        if (usernameEl) usernameEl.value = user.username || '';
        if (emailEl) emailEl.value = user.email || '';
        if (firstNameEl) firstNameEl.value = user.first_name || '';
        if (lastNameEl) lastNameEl.value = user.last_name || '';
        if (iconEl) iconEl.value = user.icon || '';

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

      // AI Analysis settings form
      const aiAnalysisForm = document.getElementById('aiAnalysisSettingsForm');
      if (aiAnalysisForm) {
        aiAnalysisForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleAIAnalysisSettingsUpdate(e);
        });
      }

      // API Key visibility toggles
      const toggleGeminiBtn = document.getElementById('toggleGeminiKeyBtn');
      if (toggleGeminiBtn) {
        toggleGeminiBtn.addEventListener('click', () => this.toggleApiKeyVisibility('geminiApiKey'));
      }

      const togglePerplexityBtn = document.getElementById('togglePerplexityKeyBtn');
      if (togglePerplexityBtn) {
        togglePerplexityBtn.addEventListener('click', () => this.toggleApiKeyVisibility('perplexityApiKey'));
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
          last_name: { id: 'profileLastName', type: 'text', default: null },
          icon: { id: 'profileIcon', type: 'text', default: null }
        });
      } else {
        // Fallback to manual collection
        formData = {
          email: document.getElementById('profileEmail')?.value || null,
          first_name: document.getElementById('profileFirstName')?.value || null,
          last_name: document.getElementById('profileLastName')?.value || null,
          icon: document.getElementById('profileIcon')?.value || null
        };
      }

      // Set loading state
      this.setLoadingState(true, 'updateInfoBtn', 'updateInfoBtnText', 'updateInfoBtnSpinner');

      try {
        window.Logger?.info('Updating user profile...', { page: 'user-profile' });

        // region agent log - user-profile PUT /api/auth/me
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/user-profile.js:put_api_auth_me',message:'PUT /api/auth/me for profile update',data:{page:window.location.pathname,hasAuthToken:!!window.authToken,hasCurrentUser:!!window.currentUser,sessionToken:sessionStorage.getItem('authToken')},sessionId:'debug-session',runId:'user_profile_loop_fix_v2',hypothesisId:'H7_user_profile_api_calls',timestamp:Date.now()})}).catch(()=>{});
        // endregion
        const response = await fetch('/api/auth/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }, body: JSON.stringify(formData),
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
      // Update UnifiedCacheManager with updated user (same as auth.js does)
      if (window.UnifiedCacheManager) {
        try {
          await window.UnifiedCacheManager.save('currentUser', updatedUser);
          window.Logger?.debug('✅ Updated currentUser in UnifiedCacheManager', { page: 'user-profile' });
        } catch (e) {
          console.warn('Error saving currentUser to cache:', e);
          // Fallback to sessionStorage bootstrap key (Option 1 - no localStorage)
          try {
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            window.Logger?.debug('✅ Updated currentUser in sessionStorage bootstrap key (fallback)', { page: 'user-profile' });
          } catch (storageError) {
            window.Logger?.warn('Failed to update currentUser in sessionStorage', { error: storageError, page: 'user-profile' });
          }
        }
      } else {
        // Fallback to sessionStorage bootstrap key if UnifiedCacheManager not available (Option 1)
        try {
          sessionStorage.setItem('dev_currentUser', JSON.stringify(updatedUser));
          window.Logger?.debug('✅ Updated currentUser in sessionStorage bootstrap key (fallback)', { page: 'user-profile' });
        } catch (storageError) {
          window.Logger?.warn('Failed to update currentUser in sessionStorage', { error: storageError, page: 'user-profile' });
        }
      }

      // Update TikTrackAuth current user if available
      if (window.TikTrackAuth) {
        const currentUser = window.TikTrackAuth.getCurrentUser();
        if (currentUser) {
          Object.assign(currentUser, updatedUser);
          window.Logger?.debug('✅ Updated TikTrackAuth currentUser', { page: 'user-profile' });
        }
      }

      // Update UnifiedCacheManager cache
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        try {
          const cacheKey = 'user_profile_data';
          await window.UnifiedCacheManager.save(cacheKey, updatedUser, {
            layer: 'sessionStorage',
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
          }, body: JSON.stringify({
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
     * Load AI Analysis settings
     * טעינת הגדרות AI Analysis
     */
    async loadAIAnalysisSettings() {
      try {
        window.Logger?.info('Loading AI Analysis settings...', { page: 'user-profile' });

        const response = await fetch('/api/ai_analysis/llm-provider', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            this.populateAIAnalysisForm(data.data);
            window.Logger?.info('AI Analysis settings loaded successfully', { page: 'user-profile' });
          }
        } else if (response.status === 401) {
          // User not authenticated - this is expected behavior
          window.Logger?.debug('User not authenticated for AI Analysis settings', { page: 'user-profile' });
        }
      } catch (error) {
        window.Logger?.warn('Error loading AI Analysis settings', { error: error.message, page: 'user-profile' });
        // Don't show error to user - this is optional functionality
      }
    },

    /**
     * Populate AI Analysis form with settings
     * מילוי טופס AI Analysis עם הגדרות
     */
    populateAIAnalysisForm(settings) {
      try {
        const defaultProviderEl = document.getElementById('aiDefaultProvider');
        const geminiApiKeyEl = document.getElementById('geminiApiKey');
        const perplexityApiKeyEl = document.getElementById('perplexityApiKey');

        if (defaultProviderEl && settings.default_provider) {
          defaultProviderEl.value = settings.default_provider;
        }

        if (geminiApiKeyEl && settings.gemini_api_key) {
          geminiApiKeyEl.value = settings.gemini_api_key;
        }

        if (perplexityApiKeyEl && settings.perplexity_api_key) {
          perplexityApiKeyEl.value = settings.perplexity_api_key;
        }

        // Update status displays
        this.updateApiKeyStatus('gemini', settings.gemini_configured);
        this.updateApiKeyStatus('perplexity', settings.perplexity_configured);

        window.Logger?.info('AI Analysis form populated successfully', { page: 'user-profile' });
      } catch (error) {
        window.Logger?.error('Error populating AI Analysis form', error, { page: 'user-profile' });
      }
    },

    /**
     * Update API key status display
     * עדכון תצוגת סטטוס מפתח API
     */
    updateApiKeyStatus(provider, isConfigured) {
      const statusEl = document.getElementById(`${provider}KeyStatus`);
      if (statusEl) {
        if (isConfigured) {
          statusEl.innerHTML = '<span class="text-success">✓ מוגדר</span>';
        } else {
          statusEl.innerHTML = '<span class="text-muted">לא מוגדר</span>';
        }
      }
    },

    /**
     * Handle AI Analysis settings update
     * טיפול בעדכון הגדרות AI Analysis
     */
    async handleAIAnalysisSettingsUpdate(event) {
      event.preventDefault();

      // Collect form data
      const formData = {
        default_provider: document.getElementById('aiDefaultProvider')?.value || 'gemini',
        gemini_api_key: document.getElementById('geminiApiKey')?.value || null,
        perplexity_api_key: document.getElementById('perplexityApiKey')?.value || null
      };

      // Set loading state
      this.setLoadingState(true, 'saveAiAnalysisBtn', 'saveAiAnalysisBtnText', 'saveAiAnalysisBtnSpinner');

      try {
        window.Logger?.info('Updating AI Analysis settings...', { page: 'user-profile' });

        // Save default provider
        if (formData.default_provider) {
          await this.updateDefaultProvider(formData.default_provider);
        }

        // Save API keys
        const updatePromises = [];

        if (formData.gemini_api_key) {
          updatePromises.push(this.updateApiKey('gemini', formData.gemini_api_key));
        }

        if (formData.perplexity_api_key) {
          updatePromises.push(this.updateApiKey('perplexity', formData.perplexity_api_key));
        }

        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
        }

        // Reload settings to get updated status
        await this.loadAIAnalysisSettings();

        // Show success message
        if (window.NotificationSystem) {
          window.NotificationSystem.showSuccess('הגדרות AI Analysis נשמרו בהצלחה', 'business');
        }

        const statusEl = document.getElementById('aiAnalysisStatus');
        if (statusEl) {
          statusEl.innerHTML = '<div class="alert alert-success">הגדרות נשמרו בהצלחה!</div>';
          setTimeout(() => {
            statusEl.innerHTML = '';
          }, 3000);
        }

      } catch (error) {
        window.Logger?.error('Error updating AI Analysis settings', error, { page: 'user-profile' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בשמירת הגדרות AI Analysis', 'system');
        }

        const statusEl = document.getElementById('aiAnalysisStatus');
        if (statusEl) {
          statusEl.innerHTML = '<div class="alert alert-danger">שגיאה בשמירת הגדרות</div>';
        }
      } finally {
        this.setLoadingState(false, 'saveAiAnalysisBtn', 'saveAiAnalysisBtnText', 'saveAiAnalysisBtnSpinner');
      }
    },

    /**
     * Update default provider
     * עדכון מנוע ברירת מחדל
     */
    async updateDefaultProvider(provider) {
      const response = await fetch('/api/ai_analysis/llm-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          default_provider: provider
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update default provider');
      }
    },

    /**
     * Update API key for provider
     * עדכון מפתח API לספק
     */
    async updateApiKey(provider, apiKey) {
      const response = await fetch('/api/ai_analysis/llm-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: provider,
          api_key: apiKey,
          validate: true
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to update ${provider} API key`);
      }

      return response.json();
    },

    /**
     * Toggle API key visibility
     * החלפת נראות מפתח API
     */
    toggleApiKeyVisibility(fieldId) {
      const input = document.getElementById(fieldId);
      const button = document.getElementById(`toggle${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}Btn`);
      const icon = document.getElementById(`toggle${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}Icon`);

      if (input && button && icon) {
        if (input.type === 'password') {
          input.type = 'text';
          icon.textContent = '👁️‍🗨️'; // Hide icon
          button.title = 'הסתר מפתח';
        } else {
          input.type = 'password';
          icon.textContent = '👁️'; // Show icon
          button.title = 'הצג מפתח';
        }
      }
    },

    /**
     * Validate Gemini API key
     * בדיקת מפתח Gemini API
     */
    async validateGeminiKey() {
      await this.validateApiKey('gemini');
    },

    /**
     * Validate Perplexity API key
     * בדיקת מפתח Perplexity API
     */
    async validatePerplexityKey() {
      await this.validateApiKey('perplexity');
    },

    /**
     * Validate API key for provider
     * בדיקת מפתח API לספק
     */
    async validateApiKey(provider) {
      const input = document.getElementById(`${provider}ApiKey`);
      const button = document.getElementById(`validate${provider.charAt(0).toUpperCase() + provider.slice(1)}Btn`);
      const btnText = document.getElementById(`validate${provider.charAt(0).toUpperCase() + provider.slice(1)}BtnText`);
      const btnSpinner = document.getElementById(`validate${provider.charAt(0).toUpperCase() + provider.slice(1)}BtnSpinner`);
      const statusEl = document.getElementById(`${provider}KeyStatus`);

      if (!input || !input.value) {
        if (statusEl) {
          statusEl.innerHTML = '<span class="text-warning">הכנס מפתח API תחילה</span>';
        }
        return;
      }

      // Set loading state
      if (button) button.disabled = true;
      if (btnText) btnText.classList.add('d-none');
      if (btnSpinner) btnSpinner.classList.remove('d-none');

      try {
        window.Logger?.info(`Validating ${provider} API key...`, { page: 'user-profile' });

        const response = await fetch('/api/ai_analysis/llm-provider', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: provider,
            api_key: input.value,
            validate: true
          })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          if (statusEl) {
            statusEl.innerHTML = '<span class="text-success">✓ מפתח תקין</span>';
          }
          window.Logger?.info(`${provider} API key validated successfully`, { page: 'user-profile' });
        } else {
          if (statusEl) {
            statusEl.innerHTML = '<span class="text-danger">✗ מפתח לא תקין</span>';
          }
          window.Logger?.warn(`${provider} API key validation failed`, { message: data.message, page: 'user-profile' });
        }
      } catch (error) {
        if (statusEl) {
          statusEl.innerHTML = '<span class="text-danger">✗ שגיאה בבדיקה</span>';
        }
        window.Logger?.error(`Error validating ${provider} API key`, error, { page: 'user-profile' });
      } finally {
        // Reset loading state
        if (button) button.disabled = false;
        if (btnText) btnText.classList.remove('d-none');
        if (btnSpinner) btnSpinner.classList.add('d-none');
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

  // Export AI Analysis functions to global scope for button onclick handlers
  window.AIAnalysisManager = {
    validateGeminiKey: () => UserProfilePage.validateGeminiKey(),
    validatePerplexityKey: () => UserProfilePage.validatePerplexityKey()
  };

  window.Logger?.info('✅ UserProfilePage loaded successfully', { page: 'user-profile' });
})();
