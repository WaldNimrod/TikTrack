/**
 * Preferences UI System - TikTrack
 * ================================
 *
 * UI helpers and form management for preferences
 * Handles all user interface interactions
 *
 * @version 1.3.0
 * @date January 23, 2025
 * @updated January 30, 2025 - Fixed saveAllPreferences to clear cache before reload
 * @updated January 30, 2025 - Fixed cache clearing to work directly with localStorage keys
 * @updated January 30, 2025 - Replaced page reload with refreshUserPreferences + loadAllPreferences
 * @author TikTrack Development Team
 *
 * @description
 * UI-focused preferences system with:
 * - Form management and validation
 * - UI updates and feedback
 * - Loading states and animations
 * - Error handling and notifications
 * - Integration with preferences-core.js and preferences-colors.js
 *
 * @architecture
 * - FormManager: Form operations and validation
 * - UIManager: UI updates and feedback
 * - LoadingManager: Loading states
 * - NotificationManager: User feedback
 * - PreferencesUI: Main coordinator
 */

if (window.Logger && window.Logger.info) {
  window.Logger.info('📄 Loading preferences-ui.js v1.0.0...', { page: 'preferences-ui' });
}

// ============================================================================
// FUNCTION INDEX
// ============================================================================
/**
 * ============================================================================
 * FUNCTION INDEX - Preferences UI System
 * ============================================================================
 * 
 * Core Classes:
 * - FormManager - Form operations and validation
 * - UIManager - UI updates and feedback
 * - LoadingManager - Loading states
 * - NotificationManager - User feedback
 * - PreferencesUI - Main coordinator class
 * 
 * Global Functions:
 * - saveAllPreferences(userId, profileId) - Save all preferences (backward compatibility wrapper)
 * 
 * Global Instances:
 * - window.PreferencesUI - Main preferences UI instance
 * 
 * Main Methods (PreferencesUI class):
 * - initialize() - Initialize preferences UI system
 * - loadAllPreferences(userId, profileId) - Load all preferences
 * - saveAllPreferences(userId, profileId) - Save all preferences
 * - updateProfileContext(context) - Update profile context
 * - updateActiveUserDisplay(userInfo) - Update active user display
 * - updateProfileContext(profileContext) - Update profile context display
 * 
 * Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
 * ============================================================================
 */

// ============================================================================
// FORM MANAGER CLASS
// ============================================================================

/**
 * Form Management System
 * Handles all form operations for preferences
 */
class FormManager {
  constructor() {
    this.forms = new Map();
    this.validators = new Map();
    this.setupDefaultValidators();
  }

  /**
     * Setup default form validators
     */
  setupDefaultValidators() {
    // Email validator
    this.validators.set('email', value => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    // Number validator
    this.validators.set('number', value => !isNaN(value) && isFinite(value));

    // URL validator
    this.validators.set('url', value => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    });

    // Required validator
    this.validators.set('required', value => value !== null && value !== undefined && value !== '');
  }

  /**
     * Collect form data
     * @param {string} formId - Form ID (optional, uses first form if not provided)
     * @returns {Object} Form data object
     */
  collectFormData(formId = null) {
    const form = formId ? document.getElementById(formId) : document.querySelector('form');
    if (!form) {
      window.Logger.warn('⚠️ No form found', { page: 'preferences-ui' });
      return {};
    }

    // Reverse field name mapping for UI elements to preferences
    const fieldMapping = {};

    const formData = {};
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      const name = input.name || input.id;
      if (!name) {return;}

      // Apply reverse field mapping if exists
      const mappedName = fieldMapping[name] || name;

      let value = input.value;

      // Handle different input types
      if (input.type === 'checkbox') {
        value = input.checked;
      } else if (input.type === 'radio') {
        if (input.checked) {
          value = input.value;
        } else {
          return; // Skip unchecked radio buttons
        }
      } else if (input.type === 'number') {
        value = parseFloat(value) || 0;
      }

      formData[mappedName] = value;
    });

    window.Logger.info('📋 Collected form data:', formData, { page: 'preferences-ui' });
    return formData;
  }

  /**
     * Populate form with data
     * @param {Object} data - Data to populate
     * @param {string} formId - Form ID (optional)
     */
  populateForm(data, formId = null) {
    const form = formId ? document.getElementById(formId) : document.querySelector('form');
    if (!form) {
      window.Logger.warn('⚠️ No form found', { page: 'preferences-ui' });
      return;
    }

    // Field name mapping for preferences to UI elements
    const fieldMapping = {};

    Object.entries(data).forEach(([name, value]) => {
      // Apply field mapping if exists
      const mappedName = fieldMapping[name] || name;
      const input = form.querySelector(`[name="${mappedName}"], #${mappedName}`);
      if (!input) {return;}

      // Handle different input types
      if (input.type === 'checkbox') {
        input.checked = Boolean(value);
      } else if (input.type === 'radio') {
        const radioInput = form.querySelector(`[name="${mappedName}"][value="${value}"]`);
        if (radioInput) {
          radioInput.checked = true;
        }
      } else if (input.type === 'color') {
        // Convert color values with alpha channel to RGB hex format (#rrggbb)
        // Color inputs only accept #rrggbb format, not #rrggbbaa
        if (value && typeof value === 'string') {
          // Check if it's an 8-digit hex with alpha
          if (/^#[0-9A-Fa-f]{8}$/i.test(value)) {
            // Strip the alpha channel (last 2 characters)
            input.value = value.substring(0, 7);
          } else if (/^#[0-9A-Fa-f]{6}$/i.test(value)) {
            // Already valid 6-digit hex
            input.value = value;
          } else {
            // Try to use ColorPickerManager converter if available
            if (window.ColorPickerManager && typeof window.ColorPickerManager.getInstance === 'function') {
              const colorManager = window.ColorPickerManager.getInstance();
              if (colorManager && typeof colorManager.convertToColorInputFormat === 'function') {
                input.value = colorManager.convertToColorInputFormat(value);
              } else {
                input.value = '#000000';
              }
            } else {
              input.value = '#000000';
            }
          }
        } else {
          input.value = '#000000';
        }
      } else {
        input.value = value;
      }
    });

    window.Logger.info('📋 Populated form with data', { page: 'preferences-ui' });
  }

  /**
     * Validate form
     * @param {string} formId - Form ID (optional)
     * @returns {Object} Validation results
     */
  validateForm(formId = null) {
    const form = formId ? document.getElementById(formId) : document.querySelector('form');
    if (!form) {
      return { valid: false, errors: ['No form found'] };
    }

    const errors = [];
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      const name = input.name || input.id;
      if (!name) {return;}

      const value = input.value;
      const validators = input.getAttribute('data-validate')?.split(',') || [];

      // Check required
      if (validators.includes('required') && !this.validators.get('required')(value)) {
        errors.push(`${name} is required`);
      }

      // Check other validators
      validators.forEach(validator => {
        if (validator !== 'required' && this.validators.has(validator)) {
          if (!this.validators.get(validator)(value)) {
            errors.push(`${name} is not a valid ${validator}`);
          }
        }
      });
    });

    const result = {
      valid: errors.length === 0,
      errors,
    };

    window.Logger.info('✅ Form validation result:', result, { page: 'preferences-ui' });
    return result;
  }

  /**
     * Reset form to defaults
     * @param {string} formId - Form ID (optional)
     */
  resetForm(formId = null) {
    const form = formId ? document.getElementById(formId) : document.querySelector('form');
    if (!form) {
      window.Logger.warn('⚠️ No form found', { page: 'preferences-ui' });
      return;
    }

    form.reset();
    window.Logger.info('🔄 Form reset to defaults', { page: 'preferences-ui' });
  }
}

// ============================================================================
// UI MANAGER CLASS
// ============================================================================

/**
 * UI Management System
 * Handles all UI updates and feedback
 */
class UIManager {
  constructor() {
    this.loadingStates = new Map();
    this.counters = new Map();
  }

  /**
     * Show loading state
     * @param {string} elementId - Element ID
     * @param {string} message - Loading message
     */
  showLoading(elementId, message = 'טוען...') {
    const element = document.getElementById(elementId);
    if (!element) {return;}

    this.loadingStates.set(elementId, {
      originalContent: element.innerHTML,
      originalDisabled: element.disabled,
    });

    element.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ${message}
        `;
    element.disabled = true;

    window.Logger.info(`⏳ Loading state: ${elementId}`, { page: 'preferences-ui' });
  }

  /**
     * Hide loading state
     * @param {string} elementId - Element ID
     */
  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {return;}

    const state = this.loadingStates.get(elementId);
    if (state) {
      element.innerHTML = state.originalContent;
      element.disabled = state.originalDisabled;
      this.loadingStates.delete(elementId);
    }

    window.Logger.info(`✅ Loading complete: ${elementId}`, { page: 'preferences-ui' });
  }

  /**
     * Update counter
     * @param {string} counterId - Counter ID
     * @param {number} value - Counter value
     * @param {string} label - Counter label
     */
  updateCounter(counterId, value, label = '') {
    const element = document.getElementById(counterId);
    if (!element) {return;}

    element.textContent = `${label}${value}`;
    this.counters.set(counterId, value);

    window.Logger.info(`📊 Updated counter ${counterId}: ${value}`, { page: 'preferences-ui' });
  }

  /**
     * Show success message
     * @param {string} message - Success message
     * @param {number} duration - Display duration (ms)
     */
  showSuccess(message, duration = 3000) {
    if (window.showSuccessNotification) {
      window.showSuccessNotification('הצלחה', message, duration);
    } else {
      window.Logger.info(`✅ ${message}`, { page: 'preferences-ui' });
    }
  }

  /**
     * Show error message
     * @param {string} message - Error message
     * @param {number} duration - Display duration (ms)
     */
  showError(message, duration = 5000) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', message, duration);
    } else {
      window.Logger.error(`❌ ${message}`, { page: 'preferences-ui' });
    }
  }

  /**
     * Show info message
     * @param {string} message - Info message
     * @param {number} duration - Display duration (ms)
     */
  showInfo(message, duration = 4000) {
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע', message, duration);
    } else {
      window.Logger.info(`ℹ️ ${message}`, { page: 'preferences-ui' });
    }
  }

  /**
     * Toggle section visibility
     * @param {string} sectionId - Section ID
     * @param {boolean} visible - Visibility state
     */
  toggleSection(sectionId, visible = null) {
    const section = document.getElementById(sectionId);
    if (!section) {return;}

    const isVisible = visible !== null ? visible : section.style.display !== 'none';
    section.style.display = isVisible ? 'block' : 'none';

    window.Logger.info(`👁️ Section ${sectionId}: ${isVisible ? 'visible' : 'hidden'}`, { page: 'preferences-ui' });
  }

  /**
     * Update form status
     * @param {string} status - Status (saving, saved, error)
     * @param {string} message - Status message
     */
  updateFormStatus(status, message = '') {
    const statusElement = document.getElementById('form-status');
    if (!statusElement) {return;}

    const statusClasses = {
      saving: 'text-warning',
      saved: 'text-success',
      error: 'text-danger',
    };

    statusElement.className = statusClasses[status] || '';
    statusElement.textContent = message;

    window.Logger.info(`📋 Form status: ${status} - ${message}`, { page: 'preferences-ui' });
  }
}

// ============================================================================
// LOADING MANAGER CLASS
// ============================================================================

/**
 * Loading State Manager
 * Handles loading states and animations
 */
class LoadingManager {
  constructor() {
    this.activeLoaders = new Set();
  }

  /**
     * Start loading
     * @param {string} loaderId - Loader ID
     * @param {string} message - Loading message
     */
  startLoading(loaderId, message = 'טוען...') {
    this.activeLoaders.add(loaderId);

    // Show global loading if available
    if (window.showInfoNotification) {
      window.showInfoNotification('טעינה', message);
    }

    window.Logger.info(`⏳ Started loading: ${loaderId}`, { page: 'preferences-ui' });
  }

  /**
     * Stop loading
     * @param {string} loaderId - Loader ID
     * @param {boolean} success - Loading success
     * @param {string} message - Completion message
     */
  stopLoading(loaderId, success = true, message = 'הושלם') {
    this.activeLoaders.delete(loaderId);

    // Show completion message
    if (success && window.showSuccessNotification) {
      window.showSuccessNotification('הצלחה', message);
    } else if (!success && window.showErrorNotification) {
      window.showErrorNotification('שגיאה', message);
    }

    window.Logger.info(`✅ Stopped loading: ${loaderId} (${success ? 'success' : 'error'}, { page: "preferences-ui" })`);
  }

  /**
     * Check if loading
     * @param {string} loaderId - Loader ID
     * @returns {boolean} Is loading
     */
  isLoading(loaderId) {
    return this.activeLoaders.has(loaderId);
  }

  /**
     * Get all active loaders
     * @returns {Array<string>} Active loader IDs
     */
  getActiveLoaders() {
    return Array.from(this.activeLoaders);
  }
}

// ============================================================================
// MAIN PREFERENCES UI CLASS
// ============================================================================

/**
 * Main Preferences UI System
 * Coordinates all UI operations
 */
class PreferencesUI {
  constructor() {
    this.formManager = new FormManager();
    this.uiManager = new UIManager();
    this.loadingManager = new LoadingManager();

    this.currentUserId = null;
    this.currentProfileId = null; // Will be loaded from server
    this.cachedPreferences = {};
    this.profileContext = null;
    this.lastResolvedProfileId = null;
    this._initialized = false;
    this._telemetry = {
      marks: {},
      mark(label) { this.marks[label] = performance.now(); },
      read() { return { ...this.marks }; },
      reset() { this.marks = {}; },
    };
  }

  /**
   * Bootstrap barrier - single call to server bootstrap endpoint with ETag
   * Seeds context and core groups; fires preferences:bootstrap:ready.
   */
  async bootstrap() {
    try {
      this._telemetry.mark('bootstrap.start');
      const payload = (window.PreferencesData?.fetchJson && typeof window.PreferencesData.fetchJson === 'function')
        ? await window.PreferencesData.fetchJson('/api/preferences/bootstrap', { dedupe: true })
        : null;
      // If 304 or empty, rely on caches; initialize continues
      if (payload && payload.data && payload.data.profile_context) {
        await this.updateProfileContext(payload.data.profile_context);
        this.currentUserId = payload.data.user_id || this.currentUserId;
        this.currentProfileId = payload.data.profile_id ?? this.currentProfileId;
      }
      this._telemetry.mark('bootstrap.end');
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('preferences:bootstrap:ready', {
          detail: { ok: true },
        }));
      }
    } catch (err) {
      window.Logger?.warn('⚠️ PreferencesUI.bootstrap failed (continuing with fallback)', err, { page: 'preferences-ui' });
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('preferences:bootstrap:ready', {
          detail: { ok: false, error: err?.message || 'bootstrap failed' },
        }));
      }
    }
  }

  /**
     * Single entry-point initializer to avoid fan-out.
     * Enforces strict order: context -> lazy -> preferences -> UI bind.
     */
  async initialize() {
    if (this._initialized) {
      window.Logger?.info('ℹ️ PreferencesUI already initialized, skipping re-init', { page: 'preferences-ui' });
      return;
    }
    this._initialized = true;
    window.__PREFERENCES_PAGE_ACTIVE__ = true;

    try {
      this._telemetry.reset();
      this._telemetry.mark('init.start');
      // 0) Bootstrap barrier first (handles ETag/304; seeds context)
      await this.bootstrap();
      // 1) Load profiles to get profile_context (source of truth) or confirm it
      this._telemetry.mark('profiles.load.start');
      const { profiles = [], profileContext = null } = (window.PreferencesData?.loadProfiles && typeof window.PreferencesData.loadProfiles === 'function')
        ? await window.PreferencesData.loadProfiles({ force: true })
        : { profiles: [], profileContext: null };
      this._telemetry.mark('profiles.load.end');
      if (profileContext) {
        this._telemetry.mark('context.update.start');
        await this.updateProfileContext(profileContext);
        this._telemetry.mark('context.update.end');
      }

      // 2) Initialize LazyLoader with resolved ids
      const effectiveUserId = this.currentUserId ?? profileContext?.user?.id ?? null;
      const effectiveProfileId = this.currentProfileId ?? profileContext?.resolved_profile_id ?? null;
      if (window.LazyLoader && effectiveUserId !== null && effectiveProfileId !== null) {
        this._telemetry.mark('lazy.init.start');
        await window.LazyLoader.initialize(effectiveUserId, effectiveProfileId);
        this._telemetry.mark('lazy.init.end');
      }

      // 3) Load all preferences (single call path)
      this._telemetry.mark('prefs.load.start');
      await this.loadAllPreferences(effectiveUserId, effectiveProfileId);
      this._telemetry.mark('prefs.load.end');
      this._telemetry.mark('init.end');

      window.Logger?.info('✅ PreferencesUI initialize completed', {
        page: 'preferences-ui',
        userId: this.currentUserId,
        profileId: this.currentProfileId,
        telemetry: this._telemetry.read(),
      });
      // Fire a lightweight event for monitoring widgets
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('preferences:init:completed', {
          detail: { telemetry: this._telemetry.read() },
        }));
      }
    } catch (e) {
      window.Logger?.error('❌ PreferencesUI initialize failed', e, { page: 'preferences-ui' });
      this.uiManager.showError('שגיאה בטעינת העדפות');
    }
  }

  /**
     * Load active profile from server
     * @returns {Promise<number>} Active profile ID
     */
  async loadActiveProfile() {
    try {
      window.Logger.info('🔍 Loading active profile from server...', { page: 'preferences-ui' });
      if (!window.PreferencesData?.loadProfiles || typeof window.PreferencesData.loadProfiles !== 'function') {
        window.Logger.warn('⚠️ PreferencesData.loadProfiles not available', { page: 'preferences-ui' });
        return;
      }
      const { profiles, profileContext } = await window.PreferencesData.loadProfiles({
        userId: this.currentUserId ?? undefined,
        force: true,
      });
      window.Logger.info(`🔍 Loaded ${profiles.length} profiles from server`, { page: 'preferences-ui' });

      if (profileContext) {
        await this.updateProfileContext(profileContext);
        const resolvedId = profileContext.resolved_profile_id;
        if (resolvedId !== null && resolvedId !== undefined) {
          this.currentProfileId = resolvedId;
          if (window.PreferencesCore) {
            window.PreferencesCore.currentProfileId = resolvedId;
            if (typeof window.PreferencesCore.latestProfileContext !== 'undefined') {
              window.PreferencesCore.latestProfileContext = profileContext;
            }
          }
          if (profileContext.user?.id) {
            this.currentUserId = profileContext.user.id;
            if (window.PreferencesCore) {
              window.PreferencesCore.currentUserId = profileContext.user.id;
            }
          }
          return resolvedId;
        }
      }

      // Find active profile
      const activeProfile = profiles.find(p => p.active === true);

      // If no active profile found, use default profile (ID: 0)
      if (!activeProfile) {
        window.Logger.info('✅ No active profile found - using default profile (ID: 0)', { page: 'preferences-ui' });
        this.currentProfileId = 0;
        if (window.PreferencesCore) {
          window.PreferencesCore.currentProfileId = 0;
          window.PreferencesCore.latestProfileContext = profileContext || window.PreferencesCore.latestProfileContext || null;
        }
        if (profileContext) {
          await this.updateProfileContext({
            ...profileContext,
            resolved_profile_id: 0,
          });
        }
        return 0;
      }

      // Check if active profile is default system profile (ID: 0)
      if (activeProfile.id === 0) {
        window.Logger.info('✅ Active profile is system default profile (ID: 0)', { page: 'preferences-ui' });
        this.currentProfileId = 0;
        if (window.PreferencesCore) {
          window.PreferencesCore.currentProfileId = 0;
          window.PreferencesCore.latestProfileContext = profileContext || window.PreferencesCore.latestProfileContext || null;
        }
        if (profileContext) {
          await this.updateProfileContext({
            ...profileContext,
            resolved_profile_id: 0,
          });
        }
        return 0;
      }

      // Check if active profile has is_default flag
      if (activeProfile.is_default || activeProfile.default) {
        // If it's a user profile marked as default, still check if ID is 0
        if (activeProfile.id === 0 || activeProfile.user_id === 0) {
          window.Logger.info('✅ Active profile is default system profile (ID: 0, user_id: 0)', { page: 'preferences-ui' });
          this.currentProfileId = 0;
          return 0;
        } else {
          // User profile marked as default - use it as-is
          this.currentProfileId = activeProfile.id;
          window.Logger.info(`✅ Active profile loaded: ${activeProfile.name} (ID: ${activeProfile.id})`, { page: 'preferences-ui' });
          return activeProfile.id;
        }
      }

      // Regular user profile
      this.currentProfileId = activeProfile.id;
      if (window.PreferencesCore) {
        window.PreferencesCore.currentProfileId = activeProfile.id;
        if (!profileContext) {
          window.PreferencesCore.latestProfileContext = window.PreferencesCore.latestProfileContext || null;
        }
      }
      window.Logger.info(`✅ Active profile loaded: ${activeProfile.name} (ID: ${activeProfile.id})`, { page: 'preferences-ui' });
      if (profileContext) {
        await this.updateProfileContext({
          ...profileContext,
          resolved_profile_id: activeProfile.id,
        });
      }
      return activeProfile.id;

    } catch (error) {
      window.Logger.error('❌ Error loading active profile:', error, { page: 'preferences-ui' });
      // Fallback to default profile (ID: 0)
      this.currentProfileId = 0;
      window.Logger.info('✅ Falling back to default profile (ID: 0)', { page: 'preferences-ui' });
      if (window.PreferencesCore) {
        window.PreferencesCore.currentProfileId = 0;
      }
      this.updateActiveUserDisplay(null);
      this.updateActiveProfileDisplay(null);
      this.renderProfileBanner(); // Hide banner if necessary
      return 0;
    }
  }

  /**
     * Update profile context and render banner
     * @param {Object|null} context - Profile context metadata
     */
  updateProfileContext(context = null) {
    let refreshPromise = Promise.resolve();
    const previousResolvedId = this.profileContext?.resolved_profile_id ?? this.lastResolvedProfileId ?? null;
    const userInfoRaw = context?.user || null;
    const resolvedProfileRaw = context?.resolved_profile || null;
    // Build safe fallbacks so UI never shows "לא זמין"/"ברירת מחדל" when IDs are known
    const effectiveUserId =
      (userInfoRaw && (userInfoRaw.id ?? null)) ??
      (context?.user_id ?? null) ??
      (this.currentUserId ?? null);
    // Build complete userInfo object with all available fields
    const userInfo = effectiveUserId ? {
      id: Number(effectiveUserId),
      display_name: userInfoRaw?.display_name || userInfoRaw?.full_name || null,
      username: userInfoRaw?.username || null,
      full_name: userInfoRaw?.full_name || null,
    } : (userInfoRaw || null);
    const effectiveResolvedProfileId =
      (context?.resolved_profile_id ?? null) ??
      (context?.profile_id ?? null) ??
      (this.currentProfileId ?? null);
    const resolvedProfile = resolvedProfileRaw || (effectiveResolvedProfileId !== null && effectiveResolvedProfileId !== undefined
      ? { id: Number(effectiveResolvedProfileId), name: `Profile #${Number(effectiveResolvedProfileId)}` }
      : null);
    if (window.Logger) {
      window.Logger.info('🔁 updateProfileContext invoked', {
        page: 'preferences-ui',
        hasContext: !!context,
        requestedProfileId: context?.requested_profile_id ?? null,
        resolvedProfileId: context?.resolved_profile_id ?? null,
        activeProfileId: context?.active_profile_id ?? null,
        userId: userInfo?.id ?? null,
        previousResolvedId,
      });
    }
    if (context) {
      this.profileContext = { ...context };
      if (userInfo?.id) {
        this.currentUserId = userInfo.id;
      }
      if (effectiveResolvedProfileId !== null && effectiveResolvedProfileId !== undefined) {
        this.currentProfileId = Number(effectiveResolvedProfileId);
        if (window.PreferencesCore) {
          window.PreferencesCore.currentProfileId = Number(effectiveResolvedProfileId);
        }
      }
      if (window.PreferencesCore) {
        window.PreferencesCore.latestProfileContext = { ...context };
        if (userInfo?.id) {
          window.PreferencesCore.currentUserId = userInfo.id;
        }
      }
      this.updateActiveUserDisplay(userInfo);
      this.updateActiveProfileDisplay(resolvedProfile);
      if (window.UnifiedCacheManager?.refreshUserPreferences && effectiveResolvedProfileId !== null && effectiveResolvedProfileId !== undefined) {
        if (previousResolvedId !== null && previousResolvedId !== Number(effectiveResolvedProfileId)) {
          refreshPromise = window.UnifiedCacheManager.refreshUserPreferences(Number(effectiveResolvedProfileId), null, {
            userId: userInfo?.id ?? this.currentUserId ?? 1,
            previousProfileId: previousResolvedId,
          }).catch(cacheError => {
            window.Logger?.warn('⚠️ Failed to refresh cache after profile change', cacheError, { page: 'preferences-ui' });
          });
        }
      }
      this.lastResolvedProfileId = (effectiveResolvedProfileId !== null && effectiveResolvedProfileId !== undefined)
        ? Number(effectiveResolvedProfileId)
        : this.lastResolvedProfileId;
    } else {
      this.profileContext = null;
      this.lastResolvedProfileId = null;
      this.updateActiveUserDisplay(null);
      this.updateActiveProfileDisplay(null);
    }
    if (window.Logger) {
      window.Logger.info('✅ updateProfileContext completed', {
        page: 'preferences-ui',
        currentProfileId: this.currentProfileId,
        currentUserId: this.currentUserId,
        hasProfileContext: !!this.profileContext,
      });
    }
    this.renderProfileBanner();
    return refreshPromise;
  }

  /**
     * Render profile context banner UI
     */
  renderProfileBanner() {
    const banner = document.getElementById('profileContextBanner');
    if (!banner) {
      return;
    }

    if (!this.profileContext) {
      banner.classList.add('d-none');
      banner.setAttribute('aria-hidden', 'true');
      banner.innerHTML = '';
      return;
    }

    const context = this.profileContext;
    banner.classList.remove('d-none');
    banner.setAttribute('aria-hidden', 'false');

    banner.className = 'alert profile-context-banner mb-3';
    if (['no_active_profile', 'fallback_default_profile'].includes(context.status)) {
      banner.classList.add('alert-warning');
    } else {
      banner.classList.add('alert-info');
    }

    banner.innerHTML = '';

    const messageEl = document.createElement('div');
    messageEl.className = 'profile-context-message fw-semibold';
    messageEl.textContent = context.message || 'מוצגים נתוני פרופיל';
    banner.appendChild(messageEl);

    if (Array.isArray(context.warnings) && context.warnings.length > 0) {
      const warningsTitle = document.createElement('div');
      warningsTitle.className = 'profile-context-warning-title mt-2';
      warningsTitle.textContent = 'אזהרות:';
      banner.appendChild(warningsTitle);

      const warningsList = document.createElement('ul');
      warningsList.className = 'profile-context-warning-list mb-0';
      context.warnings.forEach(warning => {
        const li = document.createElement('li');
        li.textContent = warning;
        warningsList.appendChild(li);
      });
      banner.appendChild(warningsList);
    }

    if (context.resolved_profile && context.resolved_profile.name) {
      const details = document.createElement('div');
      details.className = 'profile-context-details mt-2 small text-muted';
      const profileName = context.resolved_profile.name;
      const profileId = context.resolved_profile.id ?? '0';
      details.textContent = `פרופיל מוצג: ${profileName} (ID ${profileId})`;
      banner.appendChild(details);
    }
  }

  /**
     * Update active user display elements in summary and card
     * @param {Object|null} userInfo - Active user information
     */
  updateActiveUserDisplay(userInfo = null) {
    // Fallback to profileContext if userInfo is null/empty
    if (!userInfo || (!userInfo.id && !userInfo.username)) {
      const ctx = this.profileContext || window.PreferencesCore?.latestProfileContext || null;
      if (ctx?.user) {
        userInfo = ctx.user;
      } else if (ctx?.user_id) {
        // Build minimal user object from user_id if user object missing
        userInfo = { id: ctx.user_id };
      }
    }

    const hasId = userInfo?.id !== undefined && userInfo?.id !== null;
    const nameRaw = userInfo?.display_name?.trim?.() ||
      userInfo?.full_name?.trim?.() ||
      userInfo?.username?.trim?.() ||
      '';
    const nameOrFallback = nameRaw || (hasId ? `User #${userInfo.id}` : 'לא זמין');
    const combined = hasId ? `${nameOrFallback} (#${userInfo.id})` : nameOrFallback;
    const summaryNameEl = document.getElementById('activeUserName');
    const summaryIdEl = document.getElementById('activeUserId');
    const cardNameEl = document.getElementById('activeUserName_display');
    const cardIdEl = document.getElementById('activeUserId_display');

    if (summaryNameEl) {
      summaryNameEl.textContent = combined;
    }
    if (summaryIdEl) {
      summaryIdEl.textContent = hasId ? `#${userInfo.id}` : '';
    }
    if (cardNameEl) {
      cardNameEl.textContent = combined;
    }
    if (cardIdEl) {
      cardIdEl.textContent = hasId ? `#${userInfo.id}` : '';
    }

    if (hasId) {
      this.currentUserId = userInfo.id;
    }

    window.Logger?.info('👤 Active user display updated', {
      page: 'preferences-ui',
      displayName: combined,
      userId: hasId ? userInfo.id : null,
      userInfoSource: userInfo ? 'provided' : 'fallback',
    });
  }

  /**
     * Update active profile display elements in summary and card
     * @param {Object|null} profile - Active profile data
     */
  updateActiveProfileDisplay(profile = null) {
    const hasId = profile?.id !== undefined && profile?.id !== null;
    const nameRaw = profile?.name || '';
    const nameOrFallback = nameRaw || (hasId ? `Profile #${profile.id}` : 'ברירת מחדל');
    const combined = hasId ? `${nameOrFallback} (#${profile.id})` : nameOrFallback;
    const profileDescription = profile?.description || (profile?.id === 0 ? 'פרופיל ברירת מחדל של המערכת' : 'פרופיל משתמש');

    const summaryNameEl = document.getElementById('activeProfileName');
    const cardNameEl = document.getElementById('activeProfileName_display');
    const cardDescriptionEl = document.getElementById('activeProfileDescription_display');
    const summaryInfoEl = document.getElementById('activeProfileInfo');

    if (summaryNameEl) {
      summaryNameEl.textContent = combined;
    }
    if (cardNameEl) {
      cardNameEl.textContent = combined;
    }
    if (cardDescriptionEl) {
      cardDescriptionEl.textContent = profileDescription;
    }
    if (summaryInfoEl) {
      summaryInfoEl.textContent = combined;
    }

    window.Logger?.info('📘 Active profile display updated', {
      page: 'preferences-ui',
      profileName: nameOrFallback,
      profileId: profile?.id ?? null,
    });
  }

  /**
     * Load all preferences into form with lazy loading
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async loadAllPreferences(userId = null, profileId = null) {
    const loaderId = 'load_preferences';

    try {
      this.loadingManager.startLoading(loaderId, 'טוען העדפות...');

      // Initialize color pickers first if available
      if (window.ColorPickerManager) {
        window.ColorPickerManager.initializePickers();
      }

      // Load active profile if not provided
      if (profileId === null || profileId === undefined) {
        profileId = await this.loadActiveProfile();
      }

      const finalUserId = userId || this.currentUserId;
      let resolvedProfileId = this.currentProfileId !== null && this.currentProfileId !== undefined
        ? this.currentProfileId
        : profileId !== null && profileId !== undefined ? profileId : 0;

      window.Logger.info(`✅ PreferencesUI currentProfileId updated to: ${resolvedProfileId}`, { page: 'preferences-ui' });

      // Ensure PreferencesCore works with the same profile (required for saves)
      if (window.PreferencesCore) {
        if (typeof window.PreferencesCore.setCurrentProfile === 'function') {
          await window.PreferencesCore.setCurrentProfile(finalUserId, resolvedProfileId);
          window.Logger.info(`✅ PreferencesCore currentProfileId synced to: ${resolvedProfileId}`, { page: 'preferences-ui' });
        } else {
          window.PreferencesCore.currentUserId = finalUserId;
          window.PreferencesCore.currentProfileId = resolvedProfileId;
          window.Logger.info(`✅ PreferencesCore currentProfileId manually set to: ${resolvedProfileId}`, { page: 'preferences-ui' });
        }
      }

      // Initialize lazy loading if available
      if (window.LazyLoader) {
        window.Logger.debug(`🔍 Calling LazyLoader.initialize(userId=${finalUserId}, profileId=${resolvedProfileId})`, { page: 'preferences-ui' });

        await window.LazyLoader.initialize(
          finalUserId,
          resolvedProfileId,
        );

        // Get loading stats
        const stats = window.LazyLoader.getLoadingStats();
        window.Logger.debug(`🔍 Lazy loading stats: ${stats.loaded}/${stats.total} (${stats.percentage}%)`, { page: 'preferences-ui' });

        // Load ALL preferences at once from API
        window.Logger.debug(`🔍 Calling PreferencesCore.getAllPreferences(userId=${finalUserId}, profileId=${resolvedProfileId})`, { page: 'preferences-ui' });

        const allPreferences = await window.PreferencesCore.getAllPreferences(finalUserId, resolvedProfileId);
        window.Logger.info(`✅ Loaded ${Object.keys(allPreferences, { page: 'preferences-ui' }).length} preferences from API`);

        // Load colors separately for color pickers
        if (window.ColorManager && window.ColorPickerManager) {
          const colors = await window.ColorManager.loadAllColors(finalUserId, resolvedProfileId);
          window.ColorPickerManager.loadColors(colors);
          // Merge colors into allPreferences for populateForm
          Object.assign(allPreferences, colors);
        }

        const latestContext = window.PreferencesCore?.getLatestProfileContext?.() || this.profileContext;
        if (latestContext?.resolved_profile_id !== null && latestContext?.resolved_profile_id !== undefined) {
          resolvedProfileId = latestContext.resolved_profile_id;
        }
        this.updateGlobalPreferences(allPreferences, finalUserId, resolvedProfileId, latestContext);

        // Populate form with ALL preferences
        this.formManager.populateForm(allPreferences);

        // Update counters
        await this.updateCounters(allPreferences);

        // Load profiles to dropdown (only if profileSelect element exists - preferences page only)
        const profileSelect = document.getElementById('profileSelect');
        if (profileSelect) {
          const effectiveUserId = this.currentUserId ?? finalUserId ?? 1;
          await window.loadProfilesToDropdown(effectiveUserId);
        }

        this.loadingManager.stopLoading(loaderId, true, `נטענו ${Object.keys(allPreferences).length} העדפות`);

      } else {
        window.Logger.info('⚠️ LazyLoader not available, using standard loading', { page: 'preferences-ui' });

        // Load non-color preferences
        const preferences = await window.PreferencesCore.getAllPreferences(
          finalUserId,
          resolvedProfileId,
        );

        // Load color preferences
        if (window.ColorManager) {
          const colors = await window.ColorManager.loadAllColors(
            finalUserId,
            resolvedProfileId,
          );
          Object.assign(preferences, colors);

          // Load colors into color pickers
          if (window.ColorPickerManager) {
            window.ColorPickerManager.loadColors(colors);
          }
        }

        const latestContext = window.PreferencesCore?.getLatestProfileContext?.() || this.profileContext;
        if (latestContext?.resolved_profile_id !== null && latestContext?.resolved_profile_id !== undefined) {
          resolvedProfileId = latestContext.resolved_profile_id;
        }
        this.updateGlobalPreferences(preferences, finalUserId, resolvedProfileId, latestContext);

        // Populate form
        this.formManager.populateForm(preferences);

        // Update counters
        await this.updateCounters(preferences);

        // Load profiles to dropdown
        window.Logger.info('🔄 Calling loadProfilesToDropdown...', { page: 'preferences-ui' });
        const effectiveUserId = this.currentUserId ?? finalUserId ?? 1;
        await window.loadProfilesToDropdown(effectiveUserId);

        this.loadingManager.stopLoading(loaderId, true, 'העדפות נטענו בהצלחה');
      }

    } catch (error) {
      window.Logger.error('❌ Error loading preferences:', error, { page: 'preferences-ui' });
      this.loadingManager.stopLoading(loaderId, false, 'שגיאה בטעינת העדפות');
      this.uiManager.showError('שגיאה בטעינת העדפות: ' + error.message);
    }
  }

  /**
     * Update global preference stores and notify systems
     * @param {Object} preferences - Preferences object
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  updateGlobalPreferences(preferences, userId, profileId, profileContext = null) {
    const normalized = preferences ? { ...preferences } : {};

    // Update local cache
    this.cachedPreferences = normalized;
    this.currentUserId = userId;
    this.currentProfileId = profileId;

    const effectiveContext = profileContext || (window.PreferencesCore?.getLatestProfileContext?.() ?? null);
    if (effectiveContext) {
      if (effectiveContext.user?.id) {
        this.currentUserId = effectiveContext.user.id;
      }
      if (effectiveContext.resolved_profile_id !== null && effectiveContext.resolved_profile_id !== undefined) {
        this.currentProfileId = effectiveContext.resolved_profile_id;
      }
    }

    // Update global references
    window.__latestPrefs = { ...normalized };
    window.currentPreferences = { ...normalized };
    window.userPreferences = { ...normalized };

    // Sync PreferencesSystem manager if available
    if (window.PreferencesSystem?.manager) {
      window.PreferencesSystem.manager.currentPreferences = { ...normalized };
      if (typeof window.PreferencesSystem.manager.setActiveProfile === 'function') {
        window.PreferencesSystem.manager.setActiveProfile(profileId);
      } else {
        window.PreferencesSystem.manager.currentProfile = profileId;
      }
    }

    // Sync PreferencesCore globals
    if (window.PreferencesCore) {
      window.PreferencesCore.currentUserId = this.currentUserId;
      window.PreferencesCore.currentProfileId = this.currentProfileId;
      window.PreferencesCore.latestProfileContext = effectiveContext || window.PreferencesCore.latestProfileContext || null;
    }

    // Sync PreferencesGroupManager state
    if (window.PreferencesGroupManager) {
      window.PreferencesGroupManager.currentUserId = this.currentUserId;
      window.PreferencesGroupManager.currentProfileId = this.currentProfileId;
    }

    // Keep ColorManager cache aligned
    if (window.ColorManager && window.ColorManager.colorCache instanceof Map) {
      Object.keys(normalized).forEach(key => {
        if (window.ColorManager.defaultColors && Object.prototype.hasOwnProperty.call(window.ColorManager.defaultColors, key)) {
          window.ColorManager.colorCache.set(key, normalized[key]);
        }
      });
    }

    // Apply color schemes if systems available
    if (typeof window.updateCSSVariablesFromPreferences === 'function') {
      window.updateCSSVariablesFromPreferences(window.currentPreferences);
    } else if (window.ColorSchemeSystem?.updateCSSVariablesFromPreferences) {
      window.ColorSchemeSystem.updateCSSVariablesFromPreferences(window.currentPreferences);
    } else if (window.colorSchemeSystem?.updateCSSVariablesFromPreferences) {
      window.colorSchemeSystem.updateCSSVariablesFromPreferences(window.currentPreferences);
    }

    // Dispatch global event
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('preferences:updated', {
        detail: {
          source: 'preferences-ui',
          userId: this.currentUserId,
          profileId: this.currentProfileId,
          preferenceCount: Object.keys(normalized).length,
        },
      }));
    }

    if (effectiveContext) {
      const contextPromise = this.updateProfileContext(effectiveContext);
      if (contextPromise && typeof contextPromise.then === 'function') {
        contextPromise.catch(contextError => {
          window.Logger?.warn('⚠️ Failed updating profile context after global preferences sync', contextError, { page: 'preferences-ui' });
        });
      }
    } else {
      this.updateActiveUserDisplay(null);
      this.updateActiveProfileDisplay(null);
      this.renderProfileBanner();
    }

    window.Logger?.info('✅ Global preferences updated successfully', {
      page: 'preferences-ui',
      userId: this.currentUserId,
      profileId: this.currentProfileId,
      preferenceCount: Object.keys(normalized).length,
    });
  }

  /**
     * Save All Preferences - Clean Implementation
     * Handles saving preferences with proper validation and error handling
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<boolean>} Success status
     */
  async saveAllPreferences(userId = null, profileId = null) {
    try {
      window.Logger.info('💾 Starting save all preferences process...', { page: 'preferences-ui' });

      // Get form element
      const form = document.getElementById('preferencesForm');
      if (!form) {
        throw new Error('Preferences form not found');
      }

      // Collect form data using FormManager (handles both name and id)
      const formData = this.formManager.collectFormData('preferencesForm');
      const changedPreferences = {};

      // Check for changes and collect only changed preferences
      // Filter out non-preference fields (profile management, etc.)
      const excludedFields = ['profileSelect', 'newProfileName', 'switchProfileBtn', 'createProfileBtn'];

      for (const [key, value] of Object.entries(formData)) {
        // Skip excluded fields
        if (excludedFields.includes(key)) {
          continue;
        }

        if (this.hasChanged(key, value)) {
          // Convert values to strings for database storage
          if (typeof value === 'boolean') {
            changedPreferences[key] = value.toString();
          } else if (typeof value === 'number') {
            changedPreferences[key] = value.toString();
          } else {
            changedPreferences[key] = value;
          }
        }
      }

      // Check if there are any changes
      if (Object.keys(changedPreferences).length === 0) {
        window.Logger.info('ℹ️ No changes to save', { page: 'preferences-ui' });
        if (typeof window.showInfoNotification === 'function') {
          window.showInfoNotification('אין שינויים לשמירה');
        }
        return true;
      }

      window.Logger.info(`📊 Found ${Object.keys(changedPreferences).length} changed preferences`);
      window.Logger?.info('🔍 Changed preferences captured', {
        page: 'preferences-ui',
        changedCount: Object.keys(changedPreferences).length,
        changedKeys: Object.keys(changedPreferences),
      });

      // Validate all changed preferences
      for (const [name, value] of Object.entries(changedPreferences)) {
        window.Logger.info(`🔍 Validating ${name} = ${value} (type: ${typeof value})...`, { page: 'preferences-ui' });

        if (window.PreferenceValidator) {
          const validation = await window.PreferenceValidator.validatePreference(name, value);
          if (!validation.valid) {
            window.Logger.error(`❌ Validation failed for ${name}:`, {
              value,
              valueType: typeof value,
              errors: validation.errors,
              page: 'preferences-ui',
            });
            const errorMessages = validation.errors.map(e => e.message).join(', ');
            throw new Error(`Validation failed for ${name}: ${errorMessages}`);
          }
        }
      }

      window.Logger.info('✅ All preferences validated successfully', { page: 'preferences-ui' });

      // Get current profile IDs for debugging
      const finalUserId = userId || window.PreferencesCore?.currentUserId || 1;
      const finalProfileId = profileId || window.PreferencesCore?.currentProfileId || null;

      window.Logger?.info('🔍 Profile IDs before save', {
        page: 'preferences-ui',
        userId_param: userId,
        profileId_param: profileId,
        PreferencesCore_currentUserId: window.PreferencesCore?.currentUserId,
        PreferencesCore_currentProfileId: window.PreferencesCore?.currentProfileId,
        PreferencesUI_currentProfileId: this.currentProfileId,
        finalUserId,
        finalProfileId,
      });

      // Save to backend
      const requestData = {
        user_id: finalUserId,
        profile_id: finalProfileId,
        preferences: changedPreferences,
      };

      window.Logger?.info('🔍 Sending save request to server', {
        page: 'preferences-ui',
        payload: requestData,
      });

      const result = await window.PreferencesData.savePreferences({
        preferences: changedPreferences,
        userId: finalUserId,
        profileId: finalProfileId,
      });
      window.Logger?.info('🔍 Save server response parsed', {
        page: 'preferences-ui',
        result,
      });

      // Show success notification
      if (typeof window.showSuccessNotification === 'function') {
        const savedCount = Object.keys(changedPreferences).length;
        window.showSuccessNotification(
          `העדפות נשמרו בהצלחה! (${savedCount} העדפות)`,
          3000,
        );
      }

      // Clear preferences cache and reload using UnifiedCacheManager.refreshUserPreferences
      // This is the CORRECT way according to the architecture
      window.Logger?.info('🧹 Cache clearing debug start', { page: 'preferences-ui' });
      window.Logger.info('🧹 Clearing preferences cache and reloading from backend...', { page: 'preferences-ui' });

      // DEBUG: Check localStorage before clearing
      const allKeysBefore = Object.keys(localStorage);
      const prefKeysBefore = allKeysBefore.filter(k =>
        k.includes('preference') || k.includes('all_preferences'),
      );
      window.Logger?.info('🔍 localStorage keys before clearing', {
        page: 'preferences-ui',
        totalKeys: allKeysBefore.length,
        preferenceKeys: prefKeysBefore,
      });

      try {
        // Use the official refreshUserPreferences method which:
        // 1. Clears all preference cache keys
        // 2. Reloads preferences from backend via PreferencesCore
        // 3. Updates the UI automatically via LazyLoader
        window.Logger?.info('🔍 Checking UnifiedCacheManager availability', {
          page: 'preferences-ui',
          exists: !!window.UnifiedCacheManager,
          hasRefreshMethod: !!window.UnifiedCacheManager?.refreshUserPreferences,
        });

        if (window.UnifiedCacheManager && window.UnifiedCacheManager.refreshUserPreferences) {
          window.Logger?.info('✅ Calling UnifiedCacheManager.refreshUserPreferences()', { page: 'preferences-ui' });

          // CRITICAL: Use the same profileId that was used for saving
          // Otherwise we'll reload the wrong profile's preferences
          const saveProfileId = finalProfileId;
          window.Logger?.info('🔍 Will reload preferences for profileId', { page: 'preferences-ui', profileId: saveProfileId });

          await window.UnifiedCacheManager.refreshUserPreferences(saveProfileId, null, {
            userId: finalUserId,
            preferenceNames: Object.keys(changedPreferences),
          });
          window.Logger?.info('✅ refreshUserPreferences completed', { page: 'preferences-ui' });
          window.Logger.info('✅ Preferences cache cleared and reloaded from backend', { page: 'preferences-ui' });

          // DEBUG: Check localStorage after clearing
          const allKeysAfter = Object.keys(localStorage);
          const prefKeysAfter = allKeysAfter.filter(k =>
            k.includes('preference') || k.includes('all_preferences'),
          );
          window.Logger?.info('🔍 localStorage keys after clearing', {
            page: 'preferences-ui',
            preferenceKeys: prefKeysAfter,
            removedCount: prefKeysBefore.length - prefKeysAfter.length,
          });

          // NOTE: refreshUserPreferences already calls initializeWithLazyLoading which loads preferences
          // We just need to reload the form with the already-loaded preferences
          window.Logger.info('🔄 Reloading preferences into form...', { page: 'preferences-ui' });
          await this.loadAllPreferences();
          window.Logger.info('✅ Preferences form updated with new values', { page: 'preferences-ui' });

          window.Logger?.info('🧹 Cache clearing debug end', { page: 'preferences-ui' });
        } else {
          // Fallback to manual clearing if refreshUserPreferences not available
          window.Logger.warn('⚠️ refreshUserPreferences not available, using manual clearing', { page: 'preferences-ui' });

          const finalUserId = userId || window.PreferencesCore.currentUserId;
          const finalProfileId = profileId || window.PreferencesCore.currentProfileId;

          const allKeys = Object.keys(localStorage);
          const prefKeys = allKeys.filter(key =>
            key.startsWith('preference_') && key.includes(`_${finalUserId}_${finalProfileId}`) ||
                        key.startsWith('tiktrack_preference_') && key.includes(`_${finalUserId}_${finalProfileId}`) ||
                        key === `all_preferences_${finalUserId}_${finalProfileId}` ||
                        key === `tiktrack_all_preferences_${finalUserId}_${finalProfileId}` ||
                        key === 'user-preferences' ||
                        key === 'tiktrack_user-preferences',
          );

          for (const key of prefKeys) {
            localStorage.removeItem(key);
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.remove) {
              await window.UnifiedCacheManager.remove(key);
            }
          }

          // Reload preferences
          await this.loadAllPreferences();
        }
      } catch (cacheError) {
        window.Logger.warn('⚠️ Error refreshing preferences cache:', cacheError, { page: 'preferences-ui' });
        // Continue even if cache clearing fails
      }

      return true;

    } catch (error) {
      window.Logger.error('❌ Error saving preferences:', error, { page: 'preferences-ui' });

      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification(`שגיאה בשמירת העדפות: ${error.message}`);
      }

      return false;
    }
  }

  /**
     * Check if preference has changed
     * @param {string} key - Preference key
     * @param {string} value - New value
     * @returns {boolean} True if changed
     */
  hasChanged(key, value) {
    // For now, assume all values are changed
    // In a more sophisticated implementation, we would compare with original values
    return value !== null && value !== undefined && value !== '';
  }

  /**
     * Reset all preferences to defaults
     */
  async resetToDefaults() {
    try {
      this.uiManager.showInfo('מאפס העדפות לברירות מחדל...');

      // Reset form
      this.formManager.resetForm();

      // Reset colors if available
      if (window.ColorManager) {
        window.resetAllColorsToDefaults();
      }

      // Clear cache
      window.PreferencesCore.clearCache();

      this.uiManager.showSuccess('העדפות אופסו לברירות מחדל');

    } catch (error) {
      window.Logger.error('❌ Error resetting preferences:', error, { page: 'preferences-ui' });
      this.uiManager.showError('שגיאה באיפוס העדפות: ' + error.message);
    }
  }

  /**
     * Update counters
     * @param {Object} preferences - Preferences object
     */
  async updateCounters(preferences) {
    const totalCount = Object.keys(preferences).length;
    const colorCount = Object.keys(preferences).filter(key =>
      key.includes('Color') || key.includes('color'),
    ).length;
    const nonColorCount = totalCount - colorCount;

    this.uiManager.updateCounter('total-preferences', totalCount, 'סה"כ העדפות: ');
    this.uiManager.updateCounter('color-preferences', colorCount, 'צבעים: ');
    this.uiManager.updateCounter('non-color-preferences', nonColorCount, 'אחרות: ');

    // Update HTML statistics
    await this.updateStatistics(preferences);
  }

  /**
     * Update statistics in HTML
     * @param {Object} preferences - Preferences object
     */
  async updateStatistics(preferences) {
    try {
      window.Logger.info('📊 Updating statistics...', { page: 'preferences-ui' });

      // Update preferences count
      const preferencesCount = Object.keys(preferences).length;
      const preferencesCountElement = document.getElementById('preferencesCount');
      if (preferencesCountElement) {
        preferencesCountElement.textContent = preferencesCount;
        window.Logger.info(`📊 Updated preferences count: ${preferencesCount}`, { page: 'preferences-ui' });
      }

      // Update profiles count
      try {
        const profiles = await window.getUserProfiles();
        const profilesCount = profiles.length;
        const profilesCountElement = document.getElementById('profilesCount');
        if (profilesCountElement) {
          profilesCountElement.textContent = profilesCount;
          window.Logger.info(`📊 Updated profiles count: ${profilesCount}`, { page: 'preferences-ui' });
        }
      } catch (error) {
        window.Logger.error('❌ Error loading profiles count:', error, { page: 'preferences-ui' });
        const profilesCountElement = document.getElementById('profilesCount');
        if (profilesCountElement) {
          profilesCountElement.textContent = 'שגיאה';
        }
      }

      // Update groups count
      try {
        if (!window.PreferencesData?.loadPreferenceGroupsMetadata || typeof window.PreferencesData.loadPreferenceGroupsMetadata !== 'function') {
          window.Logger.warn('⚠️ PreferencesData.loadPreferenceGroupsMetadata not available', { page: 'preferences-ui' });
          return;
        }
        const { count: groupsCount } = await window.PreferencesData.loadPreferenceGroupsMetadata();
        const groupsCountElement = document.getElementById('groupsCount');
        if (groupsCountElement) {
          groupsCountElement.textContent = groupsCount;
          window.Logger.info(`📊 Updated groups count: ${groupsCount}`, { page: 'preferences-ui' });
        }
      } catch (error) {
        window.Logger.error('❌ Error loading groups count:', error, { page: 'preferences-ui' });
        const groupsCountElement = document.getElementById('groupsCount');
        if (groupsCountElement) {
          groupsCountElement.textContent = 'שגיאה';
        }
      }

      window.Logger.info('✅ Statistics updated successfully', { page: 'preferences-ui' });
    } catch (error) {
      window.Logger.error('❌ Error updating statistics:', error, { page: 'preferences-ui' });
    }
  }

  /**
     * Toggle preference sections
     * @param {string} sectionName - Section name
     */
  toggleSection(sectionName) {
    const sectionId = `section-${sectionName}`;
    this.uiManager.toggleSection(sectionId);
  }

  /**
     * Show preference groups
     * @param {Array<string>} groups - Group names to show
     */
  showPreferenceGroups(groups = ['general', 'colors', 'notifications', 'display']) {
    groups.forEach(group => {
      const sectionId = `section-${group}`;
      this.uiManager.toggleSection(sectionId, true);
    });
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Create global instance
window.PreferencesUI = new PreferencesUI();

// ============================================================================
// GLOBAL FUNCTIONS (Backward Compatibility)
// ============================================================================

/**
 * Load all preferences (backward compatibility)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 */
/**
 * Save all preferences (backward compatibility)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 */
window.saveAllPreferences = async function(userId = null, profileId = null) {
  return await window.PreferencesUI.saveAllPreferences(userId, profileId);
};

/**
 * Save individual preference with cache management
 * @param {string} preferenceName - Preference name
 * @param {any} value - Preference value
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 * @returns {Promise<boolean>} Success status
 */

/**
 * Debug function to monitor preferences cache and reload system
 * @function debugPreferencesCacheSystem
 */
window.debugPreferencesCacheSystem = function() {
  window.Logger?.info('🔍 Preferences cache system debug start', { page: 'preferences-ui' });

  // Check if required functions exist
  window.Logger?.info('📋 Function availability', {
    page: 'preferences-ui',
    clearCacheQuick: typeof window.clearCacheQuick,
    UnifiedCacheManager: typeof window.UnifiedCacheManager,
    CRUDResponseHandler: typeof window.CRUDResponseHandler,
    PreferencesCore: typeof window.PreferencesCore,
    PreferencesUI: typeof window.PreferencesUI,
  });

  // Check current profile
  window.Logger?.info('👤 Current profile snapshot', {
    page: 'preferences-ui',
    currentUserId: window.PreferencesCore?.currentUserId || null,
    currentProfileId: window.PreferencesCore?.currentProfileId || null,
  });

  // Check cache state
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
    window.Logger?.info('💾 Cache manager state', {
      page: 'preferences-ui',
      initialized: window.UnifiedCacheManager.initialized,
      hasGetAllKeys: typeof window.UnifiedCacheManager.getAllKeys === 'function',
    });
  } else {
    window.Logger?.warn('❌ UnifiedCacheManager not available or not initialized', { page: 'preferences-ui' });
  }

  // Test clearCacheQuick function
  if (typeof window.clearCacheQuick === 'function') {
    window.Logger?.info('🧪 clearCacheQuick available', {
      page: 'preferences-ui',
      type: typeof window.clearCacheQuick,
    });
  } else {
    window.Logger?.warn('🧪 clearCacheQuick not available', { page: 'preferences-ui' });
  }

  window.Logger?.info('🔍 Preferences cache system debug end', { page: 'preferences-ui' });
};

/**
 * Test preferences save with monitoring (no auto-reload)
 * @function testPreferencesSaveWithMonitoring
 */
window.testPreferencesSaveWithMonitoring = async function() {
  window.Logger?.info('🧪 Testing preferences save with monitoring', { page: 'preferences-ui' });

  try {
    // Test cache clearing with auto-reload disabled
    window.Logger?.info('🔄 Testing cache clearing without auto-reload', { page: 'preferences-ui' });

    if (typeof window.clearCacheQuick === 'function') {
      await window.clearCacheQuick(null, { autoRefresh: false });
      window.Logger?.info('✅ Cache cleared via clearCacheQuick (no auto-reload)', { page: 'preferences-ui' });
    } else if (window.UnifiedCacheManager && window.UnifiedCacheManager.clearAllCacheQuick) {
      const result = await window.UnifiedCacheManager.clearAllCacheQuick({ autoRefresh: false });
      window.Logger?.info('✅ Cache cleared via UnifiedCacheManager.clearAllCacheQuick (no auto-reload)', {
        page: 'preferences-ui',
        result,
      });
    } else {
      window.Logger?.warn('❌ No cache clearing function available for monitoring test', { page: 'preferences-ui' });
    }

    // Test preferences reload
    window.Logger?.info('🔄 Testing preferences reload after cache clear', { page: 'preferences-ui' });
    if (window.PreferencesUI && window.PreferencesUI.loadAllPreferences) {
      await window.PreferencesUI.loadAllPreferences();
      window.Logger?.info('✅ Preferences reloaded successfully during monitoring test', { page: 'preferences-ui' });
    }

    window.Logger?.info('🧪 Preferences save monitoring test completed', { page: 'preferences-ui' });

  } catch (error) {
    window.Logger?.error('❌ Preferences save monitoring test failed', error, { page: 'preferences-ui' });
  }
};

/**
 * Force refresh preferences data (for debug mode)
 * @function forceRefreshPreferences
 */
window.forceRefreshPreferences = async function() {
  window.Logger?.info('🔄 Force refreshing preferences...', { page: 'preferences-ui' });

  try {
    // Clear cache first
    if (typeof window.clearCacheQuick === 'function') {
      window.Logger?.info('🧹 Clearing cache via clearCacheQuick', { page: 'preferences-ui' });
      await window.clearCacheQuick(null, { autoRefresh: false });
    } else if (window.UnifiedCacheManager && window.UnifiedCacheManager.clearAllCacheQuick) {
      window.Logger?.info('🧹 Clearing cache via UnifiedCacheManager.clearAllCacheQuick', { page: 'preferences-ui' });
      await window.UnifiedCacheManager.clearAllCacheQuick({ autoRefresh: false });
    } else {
      window.Logger?.warn('⚠️ No cache clear method available for forceRefreshPreferences', { page: 'preferences-ui' });
    }

    // Reload preferences and UI
    if (window.PreferencesUI && window.PreferencesUI.loadAllPreferences) {
      window.Logger?.info('🔄 Reloading preferences and UI after cache clear', { page: 'preferences-ui' });
      await window.PreferencesUI.loadAllPreferences();
    }

    window.Logger?.info('✅ Force refresh completed', { page: 'preferences-ui' });

  } catch (error) {
    window.Logger?.error('❌ Force refresh failed', error, { page: 'preferences-ui' });
  }
};

/**
 * Check cache state and preferences data
 * @function checkCacheAndPreferencesState
 */
window.checkCacheAndPreferencesState = async function() {
  window.Logger?.info('🔍 Checking cache and preferences state...', { page: 'preferences-ui' });

  try {
    // Check cache state
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.getAllKeys) {
      const keys = await window.UnifiedCacheManager.getAllKeys();
      const prefKeys = keys.filter(k => k.includes('preference'));
      window.Logger?.info('💾 Cache state snapshot', {
        page: 'preferences-ui',
        totalKeys: keys.length,
        preferenceKeysCount: prefKeys.length,
        preferenceKeys: prefKeys,
      });
    } else {
      window.Logger?.warn('⚠️ UnifiedCacheManager.getAllKeys unavailable', { page: 'preferences-ui' });
    }

    // Check current preferences
    if (window.PreferencesCore && window.PreferencesCore.getAllPreferences) {
      const prefs = await window.PreferencesCore.getAllPreferences();
      window.Logger?.info('⚙️ Current preferences snapshot', {
        page: 'preferences-ui',
        preferenceCount: Object.keys(prefs).length,
        sample: Object.keys(prefs).slice(0, 10).reduce((acc, key) => {
          acc[key] = prefs[key];
          return acc;
        }, {}),
      });
    }

    // Check UI state
    const form = document.getElementById('preferencesForm');
    if (form) {
      const formData = new FormData(form);
      const formPrefs = {};
      for (const [key, value] of formData.entries()) {
        if (!['profileSelect', 'newProfileName', 'switchProfileBtn', 'createProfileBtn'].includes(key)) {
          formPrefs[key] = value;
        }
      }
      window.Logger?.info('🖥️ Form state snapshot', {
        page: 'preferences-ui',
        formPreferenceCount: Object.keys(formPrefs).length,
        sampleValues: Object.keys(formPrefs).slice(0, 10).reduce((acc, key) => {
          acc[key] = formPrefs[key];
          return acc;
        }, {}),
      });
    }

    window.Logger?.info('🔍 State check completed', { page: 'preferences-ui' });

  } catch (error) {
    window.Logger?.error('❌ State check failed', error, { page: 'preferences-ui' });
  }
};

/**
 * Preferences debugger utilities
 */
window.PreferencesDebugger = {
  logProfileContext() {
    const context = window.PreferencesUI?.profileContext || null;
    const summary = {
      hasContext: !!context,
      requestedProfileId: context?.requested_profile_id ?? null,
      resolvedProfileId: context?.resolved_profile_id ?? null,
      activeProfileId: context?.active_profile_id ?? null,
      userId: context?.user?.id ?? null,
    };
    window.Logger?.info('🧭 PreferencesDebugger.logProfileContext', {
      page: 'preferences-ui',
      summary,
      context,
    });
  },
  logDropdownState() {
    const select = document.getElementById('profileSelect');
    if (!select) {
      window.Logger?.warn('🧭 PreferencesDebugger.logDropdownState: profileSelect not found', { page: 'preferences-ui' });
      return;
    }
    const options = Array.from(select.options || []).map(opt => ({
      value: opt.value,
      text: opt.textContent,
      selected: opt.selected,
    }));
    window.Logger?.info('🧭 PreferencesDebugger.logDropdownState', {
      page: 'preferences-ui',
      selectedValue: select.value,
      optionsCount: options.length,
      options,
    });
  },
  async logCacheState() {
    if (!window.UnifiedCacheManager || typeof window.UnifiedCacheManager.getAllKeys !== 'function') {
      window.Logger?.warn('🧭 PreferencesDebugger.logCacheState: UnifiedCacheManager unavailable', { page: 'preferences-ui' });
      return;
    }
    try {
      const keys = await window.UnifiedCacheManager.getAllKeys();
      const preferenceKeys = keys.filter(key => key.includes('preference'));
      window.Logger?.info('🧭 PreferencesDebugger.logCacheState', {
        page: 'preferences-ui',
        totalKeys: keys.length,
        preferenceKeysCount: preferenceKeys.length,
        preferenceKeys,
      });
    } catch (error) {
      window.Logger?.error('🧭 PreferencesDebugger.logCacheState failed', error, { page: 'preferences-ui' });
    }
  },
  async logFullState() {
    window.Logger?.info('🧭 PreferencesDebugger.logFullState starting', { page: 'preferences-ui' });
    this.logProfileContext();
    this.logDropdownState();
    await this.logCacheState();
    const prefs = window.currentPreferences || {};
    window.Logger?.info('🧭 PreferencesDebugger.logFullState: currentPreferences snapshot', {
      page: 'preferences-ui',
      preferenceCount: Object.keys(prefs).length,
      samplePreferences: Object.keys(prefs).slice(0, 15).reduce((acc, key) => {
        acc[key] = prefs[key];
        return acc;
      }, {}),
    });
    window.Logger?.info('🧭 PreferencesDebugger.logFullState completed', { page: 'preferences-ui' });
  },
};

window.logPreferencesDebug = function() {
  return window.PreferencesDebugger.logFullState();
};
window.saveIndividualPreference = async function(preferenceName, value, userId = null, profileId = null) {
  try {
    window.Logger.info(`💾 Saving individual preference: ${preferenceName} = ${value}`, { page: 'preferences-ui' });

    // Validate
    if (window.PreferenceValidator) {
      const validation = await window.PreferenceValidator.validatePreference(preferenceName, value);
      if (!validation.valid) {
        throw new Error(validation.errors.map(e => e.message).join(', '));
      }
    }

    // Save to backend
    const success = await window.PreferencesCore.savePreference(preferenceName, value, userId, profileId);

    if (success) {
      // Clear cache for this preference
      const cacheKey = `preference_${preferenceName}_${userId || window.PreferencesCore.currentUserId}_${profileId || window.PreferencesCore.currentProfileId}`;
      if (window.UnifiedCacheManager) {
        await window.UnifiedCacheManager.remove(cacheKey);
      }

      // Show success
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification(`העדפה "${preferenceName}" נשמרה בהצלחה`);
      }

      window.Logger.info(`✅ Individual preference saved: ${preferenceName}`, { page: 'preferences-ui' });
      return true;
    }

    return false;
  } catch (error) {
    window.Logger.error(`❌ Error saving individual preference ${preferenceName}:`, error, { page: 'preferences-ui' });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification(`שגיאה בשמירת העדפה: ${error.message}`);
    }
    return false;
  }
};

/**
 * Reset to defaults (backward compatibility)
 */
window.resetToDefaults = function() {
  return window.PreferencesUI.resetToDefaults();
};

/**
 * Update counters (backward compatibility)
 * @param {Object} preferences - Preferences object
 */
window.updateCounters = async function(preferences) {
  return await window.PreferencesUI.updateCounters(preferences);
};

/**
 * Toggle section (backward compatibility)
 * @param {string} sectionName - Section name
 */
// Define only if a global toggleSection is not already provided by the unified UI system
if (!window.toggleSection) {
  window.toggleSection = function(sectionName) {
    return window.PreferencesUI.toggleSection(sectionName);
  };
}

/**
 * Load profiles to dropdown
 * @param {number} userId - User ID (default: 1)
 * @returns {Promise<boolean>} Success status
 */
window.loadProfilesToDropdown = async function(userId = null) {
  try {
    // Check if profileSelect element exists first (preferences page only)
    const profileSelect = document.getElementById('profileSelect');
    if (!profileSelect) {
      // Silently return - this is normal for pages that don't have profile select
      return false;
    }

    // Resolve userId from context if not provided
    if (!userId || userId === 1) {
      userId = window.PreferencesUI?.currentUserId
        ?? window.PreferencesUI?.profileContext?.user_id
        ?? window.PreferencesUI?.profileContext?.user?.id
        ?? window.PreferencesCore?.currentUserId
        ?? window.PreferencesUIV4?.currentUserId
        ?? 1;
    }
    
    window.Logger.info('📂 Loading profiles to dropdown...', { page: 'preferences-ui', userId });

    if (!window.PreferencesData?.loadProfiles || typeof window.PreferencesData.loadProfiles !== 'function') {
      window.Logger.warn('⚠️ PreferencesData.loadProfiles not available', { page: 'preferences-ui' });
      return false;
    }
    const { profiles = [], profileContext = null } = await window.PreferencesData.loadProfiles({ userId, force: true });
    window.Logger.info('📋 Profiles API response', {
      page: 'preferences-ui',
      profilesCount: profiles.length,
      resolvedProfileId: profileContext?.resolved_profile_id ?? null,
      activeProfileId: profileContext?.active_profile_id ?? null,
    });

    if (window.PreferencesUI) {
      try {
        if (profileContext) {
          await window.PreferencesUI.updateProfileContext(profileContext);
        } else {
          window.PreferencesUI.updateActiveUserDisplay(null);
          window.PreferencesUI.updateActiveProfileDisplay(null);
        }
      } catch (contextError) {
        window.Logger?.warn('⚠️ Failed to sync profile context while loading profiles', contextError, { page: 'preferences-ui' });
      }
    }

    // Clear existing options
    profileSelect.innerHTML = '';

    if (profiles && profiles.length > 0) {
      // Add all profiles (including default profile if it exists)
      profiles.forEach(profile => {
        const option = document.createElement('option');
        const optionValue = String(profile.id);
        option.value = optionValue;
        option.dataset.profileName = profile.name || '';
        option.textContent = profile.name || `פרופיל #${profile.id}`;
        if (profile.active) {
          option.selected = true;
        }
        profileSelect.appendChild(option);
      });

      // Determine active profile
      const activeProfile = profileContext?.resolved_profile && typeof profileContext.resolved_profile === 'object'
        ? {
          ...profileContext.resolved_profile,
          active: true,
        }
        : profiles.find(p => p.active);

      window.Logger.debug('🔍 Found active profile:', activeProfile, { page: 'preferences-ui' });

      if (activeProfile) {
        // Update PreferencesUI currentProfileId
        if (window.PreferencesUI) {
          window.PreferencesUI.currentProfileId = activeProfile.id;
          window.Logger.info(`✅ PreferencesUI currentProfileId updated to: ${activeProfile.id}`, { page: 'preferences-ui' });
        }

        // Select the active profile in dropdown
        const activeOption = profileSelect.querySelector(`option[value="${String(activeProfile.id)}"]`);
        if (activeOption) {
          activeOption.selected = true;
          profileSelect.value = activeOption.value;
          window.Logger.debug(`🔍 Selected active profile in dropdown: ${activeProfile.name}`, { page: 'preferences-ui' });
        } else {
          window.Logger.warn(`⚠️ Active profile option not found in dropdown: ${activeProfile.name}`, { page: 'preferences-ui' });
        }
      } else {
        // No active profile found, select default
        const defaultOption = profileSelect.querySelector('option[value="0"]');
        if (defaultOption) {
          defaultOption.selected = true;
          profileSelect.value = defaultOption.value;
          window.Logger.debug('🔍 No active profile found, selected default', { page: 'preferences-ui' });
        }
      }

      window.Logger.info(`✅ Loaded ${profiles.length} profiles to dropdown`, {
        page: 'preferences-ui',
        activeProfileId: activeProfile?.id ?? null,
      });

      // Update active profile info in the new card format
      const activeProfileName = document.getElementById('activeProfileName');
      const activeProfileDescription = document.getElementById('activeProfileDescription');
      const activeProfileInfo = document.getElementById('activeProfileInfo'); // Summary element
      const activeUserNameSummary = document.getElementById('activeUserName');
      const activeUserIdSummary = document.getElementById('activeUserId');
      const activeUserNameDisplay = document.getElementById('activeUserName_display');
      const activeUserIdDisplay = document.getElementById('activeUserId_display');

      if (activeProfile) {
        if (activeProfileName) {
          activeProfileName.textContent = activeProfile.name;
        }
        if (activeProfileDescription) {
          activeProfileDescription.textContent = activeProfile.description || 'פרופיל משתמש';
        }
        if (activeProfileInfo) {
          activeProfileInfo.textContent = activeProfile.name;
        }
        // Build userInfo with fallbacks
        let userInfo = profileContext?.user || null;
        if (!userInfo && profileContext?.user_id) {
          // Fallback: build minimal user object from user_id
          userInfo = { id: profileContext.user_id };
        }
        if (window.PreferencesUI) {
          window.PreferencesUI.updateActiveUserDisplay(userInfo);
          window.PreferencesUI.updateActiveProfileDisplay(activeProfile);
        } else {
          const displayName = userInfo?.display_name || userInfo?.full_name || userInfo?.username || (userInfo?.id ? `User #${userInfo.id}` : 'לא זמין');
          const idText = userInfo?.id !== undefined && userInfo?.id !== null ? `(#${userInfo.id})` : '';
          const combined = userInfo?.id ? `${displayName} ${idText}` : displayName;
          if (activeUserNameSummary) {
            activeUserNameSummary.textContent = combined;
          }
          if (activeUserIdSummary) {
            activeUserIdSummary.textContent = idText;
          }
          if (activeUserNameDisplay) {
            activeUserNameDisplay.textContent = combined;
          }
          if (activeUserIdDisplay) {
            activeUserIdDisplay.textContent = idText;
          }
        }
        window.Logger.debug(`🔍 Updated active profile card to: ${activeProfile.name}`, {
          page: 'preferences-ui',
          profileId: activeProfile.id,
        });

        // Check if this is the default profile and disable all preferences
        // Default profile is: ID = 0, or is_default = true, or name matches
        const isDefaultProfile = activeProfile.id === 0 ||
                                       activeProfile.is_default === true ||
                                       activeProfile.default === true ||
                                       activeProfile.name === 'ברירת מחדל' ||
                                       activeProfile.name === 'פרופיל ברירת מחדל';

        window.Logger.info(`🔍 Profile check: ID=${activeProfile.id}, is_default=${activeProfile.is_default}, name="${activeProfile.name}", isDefaultProfile=${isDefaultProfile}`, { page: 'preferences-ui' });

        if (isDefaultProfile) {
          window.Logger.info('🔒 Default profile active - disabling all preferences interface', { page: 'preferences-ui' });
          window.disableAllPreferencesInterface();
        } else {
          window.Logger.info('✅ User profile active - enabling all preferences interface', { page: 'preferences-ui' });
          window.enableAllPreferencesInterface();
        }
      } else {
        if (activeProfileName) {
          activeProfileName.textContent = 'ברירת מחדל';
        }
        if (activeProfileDescription) {
          activeProfileDescription.textContent = 'פרופיל ברירת מחדל של המערכת';
        }
        if (activeProfileInfo) {
          activeProfileInfo.textContent = 'ברירת מחדל';
        }
        if (window.PreferencesUI) {
          window.PreferencesUI.updateActiveUserDisplay(profileContext?.user || null);
          window.PreferencesUI.updateActiveProfileDisplay(null);
        }
        window.Logger.debug('🔍 Updated active profile card to: ברירת מחדל (no active profile)', { page: 'preferences-ui' });

        // Default profile is active - disable all preferences
        window.Logger.info('🔒 Default profile active - disabling all preferences interface', { page: 'preferences-ui' });
        window.disableAllPreferencesInterface();
      }

      return true;
    } else {
      window.Logger.info('⚠️ No profiles found, using default', { page: 'preferences-ui' });

      const defaultOption = document.createElement('option');
      defaultOption.value = '0';
      defaultOption.textContent = 'ברירת מחדל';
      defaultOption.selected = true;
      profileSelect.appendChild(defaultOption);

      if (window.PreferencesUI) {
        window.PreferencesUI.currentProfileId = 0;
        window.PreferencesUI.updateActiveUserDisplay(profileContext?.user || null);
        window.PreferencesUI.updateActiveProfileDisplay(null);
      }

      window.disableAllPreferencesInterface();
      return true;
    }
  } catch (error) {
    window.Logger.error('❌ Error loading profiles to dropdown:', error, { page: 'preferences-ui' });
    return false;
  }
};

/**
 * Get user profiles
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Profiles array
 */
window.getUserProfiles = async function(userId = 1) {
  try {
    if (!window.PreferencesData?.loadProfiles || typeof window.PreferencesData.loadProfiles !== 'function') {
      window.Logger.warn('⚠️ PreferencesData.loadProfiles not available', { page: 'preferences-ui' });
      return [];
    }
    const result = await window.PreferencesData.loadProfiles({ userId });
    return result.profiles || [];
  } catch (error) {
    window.Logger.error('❌ Error loading profiles:', error, { page: 'preferences-ui' });
    return [];
  }
};

// Note: switchProfile is now in preferences-profiles.js - ProfileManager.switchProfile()

window.loadAllPreferences = async function(userId = 1, profileId = null) {
  window.Logger?.info('🔄 loadAllPreferences wrapper invoked', {
    page: 'preferences-ui',
    userId,
    profileId,
  });
  return await window.PreferencesUI.loadAllPreferences(userId, profileId);
};

/**
 * Load preferences (backward compatibility)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 * @returns {Promise<boolean>} Success status
 */
window.loadPreferences = async function(userId = 1, profileId = null) {
  try {
    window.Logger.info(`🔄 Loading preferences for user ${userId}, profile ${profileId}`, { page: 'preferences-ui' });

    if (window.PreferencesUI) {
      await window.PreferencesUI.loadAllPreferences(userId, profileId);
      return true;
    } else {
      window.Logger.warn('⚠️ PreferencesUI not available', { page: 'preferences-ui' });
      return false;
    }
  } catch (error) {
    window.Logger.error('❌ Error loading preferences:', error, { page: 'preferences-ui' });
    return false;
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// ============================================================================
// DEFAULT PROFILE PROTECTION
// ============================================================================

/**
 * Disable all preferences interface when default profile is active
 */
window.disableAllPreferencesInterface = function() {
  window.Logger.info('🔒 Disabling all preferences interface...', { page: 'preferences-ui' });

  // Disable all form inputs except profile management
  const allInputs = document.querySelectorAll('#preferencesForm input, #preferencesForm select, #preferencesForm textarea');
  allInputs.forEach(input => {
    // Keep profile select and new profile name input enabled
    if (input.id === 'profileSelect' || input.id === 'newProfileName') {
      input.disabled = false;
      input.classList.remove('disabled');
    } else {
      input.disabled = true;
      input.classList.add('disabled');
    }
  });

  // Disable all buttons except profile management (keep profile switching and creation enabled)
  const allButtons = document.querySelectorAll('#preferencesForm button:not([onclick*="switchActiveProfile"]):not([onclick*="createNewProfile"]):not([id*="switchProfileBtn"]):not([id*="createProfileBtn"])');
  allButtons.forEach(button => {
    button.disabled = true;
    button.classList.add('disabled');
  });

  // Keep profile management buttons enabled
  const profileButtons = document.querySelectorAll('button[onclick*="switchActiveProfile"], button[onclick*="createNewProfile"], #switchProfileBtn, #createProfileBtn');
  profileButtons.forEach(button => {
    button.disabled = false;
    button.classList.remove('disabled');
    window.Logger.info(`✅ Kept profile management button enabled: ${button.id || button.onclick}`, { page: 'preferences-ui' });
  });

  // Keep profile select and new profile name input enabled
  const profileSelect = document.getElementById('profileSelect');
  const newProfileName = document.getElementById('newProfileName');
  if (profileSelect) {
    profileSelect.disabled = false;
    profileSelect.classList.remove('disabled');
    window.Logger.info('✅ Kept profile select enabled', { page: 'preferences-ui' });
  }
  if (newProfileName) {
    newProfileName.disabled = false;
    newProfileName.classList.remove('disabled');
    window.Logger.info('✅ Kept new profile name input enabled', { page: 'preferences-ui' });
  }

  // Add visual indicator to all save buttons
  const saveButtons = document.querySelectorAll('button[onclick*="saveAllPreferences"], #savePreferencesBtn');
  saveButtons.forEach(saveButton => {
    saveButton.innerHTML = '<i class="bi bi-lock"></i> פרופיל ברירת מחדל - לא ניתן לערוך';
    saveButton.classList.add('btn-secondary', 'disabled');
    saveButton.classList.remove('btn-success');
    window.Logger.info(`🔒 Disabled save button: ${saveButton.id || 'unnamed'}`, { page: 'preferences-ui' });
  });

  // Show warning message (only if not already shown)
  if (!document.getElementById('defaultProfileWarning')) {
    showDefaultProfileWarning();
  }

  window.Logger.info('✅ All preferences interface disabled', { page: 'preferences-ui' });
};

/**
 * Enable all preferences interface when user profile is active
 */
window.enableAllPreferencesInterface = function() {
  window.Logger.info('✅ Enabling all preferences interface...', { page: 'preferences-ui' });

  // First, hide warning message (this should happen immediately)
  hideDefaultProfileWarning();
  window.Logger.info('✅ Hidden default profile warning message', { page: 'preferences-ui' });

  // Enable all form inputs
  const allInputs = document.querySelectorAll('#preferencesForm input, #preferencesForm select, #preferencesForm textarea');
  allInputs.forEach(input => {
    input.disabled = false;
    input.classList.remove('disabled');
  });
  window.Logger.info(`✅ Enabled ${allInputs.length} form inputs`, { page: 'preferences-ui' });

  // Enable all buttons
  const allButtons = document.querySelectorAll('#preferencesForm button');
  allButtons.forEach(button => {
    button.disabled = false;
    button.classList.remove('disabled');
  });
  window.Logger.info(`✅ Enabled ${allButtons.length} buttons`, { page: 'preferences-ui' });

  // Restore all save buttons
  const saveButtons = document.querySelectorAll('button[onclick*="saveAllPreferences"], #savePreferencesBtn');
  saveButtons.forEach(saveButton => {
    saveButton.innerHTML = '<i class="bi bi-save me-2"></i>שמור העדפות';
    saveButton.classList.add('btn-success');
    saveButton.classList.remove('btn-secondary', 'disabled');
    window.Logger.info(`✅ Enabled save button: ${saveButton.id || 'unnamed'}`, { page: 'preferences-ui' });
  });

  window.Logger.info('✅ All preferences interface enabled', { page: 'preferences-ui' });
};

/**
 * Show warning message for default profile
 */
function showDefaultProfileWarning() {
  // Remove existing warning if any
  hideDefaultProfileWarning();

  // Create warning message
  const warningDiv = document.createElement('div');
  warningDiv.id = 'defaultProfileWarning';
  warningDiv.className = 'alert alert-warning alert-dismissible fade show';
  warningDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        <strong>פרופיל ברירת מחדל פעיל!</strong>
        לא ניתן לערוך הגדרות בפרופיל ברירת מחדל. 
        החלף לפרופיל משתמש כדי לערוך הגדרות.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  // Insert after the profile management section
  const profileSection = document.getElementById('section1');
  if (profileSection) {
    profileSection.insertAdjacentElement('afterend', warningDiv);
  }
}

/**
 * Hide warning message for default profile
 */
function hideDefaultProfileWarning() {
  const warningDiv = document.getElementById('defaultProfileWarning');
  if (warningDiv) {
    warningDiv.remove();
  }
}

// Auto-initialization removed - preferences loading is now handled centrally by unified-app-initializer.js
// All pages with 'preferences' package will have preferences loaded through the unified initialization system
// This ensures single point of entry, proper cache usage, and no duplicate API calls

if (window.Logger && window.Logger.info) {
  window.Logger.info('✅ preferences-ui.js loaded successfully', { page: 'preferences-ui' });
}
