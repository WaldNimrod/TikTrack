/**
 * Preferences Group Manager
 * ========================
 *
 * מנהל קבוצות העדפות - אקורדיון יחודי + lazy loading
 *
 * תכונות:
 * - רק section אחד פתוח בכל זמן (מלבד top)
 * - טעינת העדפות רק כשפותחים section
 * - שמירת העדפות לפי קבוצה
 *
 * @version 1.0.0
 * @lastUpdated January 30, 2025
 */

// ============================================================================
// FUNCTION INDEX
// ============================================================================
/**
 * ============================================================================
 * FUNCTION INDEX - Preferences Group Manager
 * ============================================================================
 * 
 * Core Classes:
 * - PreferencesGroupManager - Group management with accordion UI
 * 
 * Global Functions:
 * - loadPreferenceGroup(groupName, userId, profileId) - Load preference group
 * - savePreferenceGroup(groupName) - Save preference group
 * - toggleSection(sectionId) - Toggle section open/close
 * 
 * Global Instances:
 * - window.PreferencesGroupManager - Main group manager instance
 * 
 * Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
 * ============================================================================
 */

class PreferencesGroupManager {
  constructor() {
    this.openSectionId = null; // רק section אחד פתוח
    this.groupsMap = {
      'section2': 'basic_settings',
      'section3': 'trading_settings',
      'section4': 'filter_settings',
      'section5': 'notification_settings',
      'section6': 'colors_unified',
      'section7': 'chart_settings_unified',
      'section8': 'ui_settings',
    };
    
    // Initialize user modification tracking for preference fields
    this._initializeUserModificationTracking();
    this.currentUserId = 1;
    this.currentProfileId = null;
    // מיפוי שמות מפתח קנוניים ↔ מזהי שדות/שמות ישנים ב-DOM
    // הערה: הרשימה תורחב בהמשך לפי הסריקה; מבוצעת כאן ליבה ראשונית כדי לאפשר דו-כיווניות.
    this.nameAliases = {
      // Filters (historic camelCase → canonical snake_case)
      default_status_filter: ['defaultStatusFilter'],
      default_type_filter: ['defaultTypeFilter'],
      default_date_range_filter: ['defaultDateRangeFilter'],
      default_search_filter: ['defaultSearchFilter'],
      // Trading basic
      default_trading_account: ['defaultTradingAccount', 'tradingAccountDefault'],
      default_page_size: ['defaultPageSize', 'pageSizeDefault'],
      // Colors (inputs משתמשים ב-data-color-key, אך נוסיף עזרי תאימות)
      primary_color: ['primaryColor', 'colorPrimary'],
      secondary_color: ['secondaryColor', 'colorSecondary'],
      success_color: ['successColor'],
      danger_color: ['dangerColor'],
      warning_color: ['warningColor'],
      info_color: ['infoColor'],
      // Notifications
      notification_mode: ['notificationMode'],
      log_level: ['logLevel'],
      verbose_logging: ['verboseLogging'],
      // Charts unified
      chart_candles_up_color: ['chartCandlesUpColor'],
      chart_candles_down_color: ['chartCandlesDownColor'],
      chart_grid_color: ['chartGridColor'],
    };
    // מיפוי הפוך מהיר: מזהה/שם שדה → מפתח קנוני
    this.reverseNameAliases = this._buildReverseAliases(this.nameAliases);
    this.valueMappings = {
      defaultStatusFilter: {
        toEnglish: {
          'פתוח': 'open',
          'סגור': 'closed',
          'מבוטל': 'cancelled',
          'בוטל': 'cancelled',
          'הכל': 'all',
          'הכול': 'all',
          'open': 'open',
          'closed': 'closed',
          'cancelled': 'cancelled',
          'canceled': 'cancelled',
          'all': 'all',
        },
      },
      defaultTypeFilter: {
        toEnglish: {
          'Swing': 'swing',
          'סווינג': 'swing',
          'השקעה': 'investment',
          'Investment': 'investment',
          'פאסיבי': 'passive',
          'פסיבי': 'passive', // Support legacy value
          'Passive': 'passive',
          'הכל': 'all',
          'הכול': 'all',
          'swing': 'swing',
          'investment': 'investment',
          'passive': 'passive',
          'all': 'all',
        },
      },
      defaultDateRangeFilter: {
        toEnglish: {
          'היום': 'today',
          'אתמול': 'yesterday',
          'השבוע': 'this_week',
          'החודש': 'this_month',
          'השנה': 'this_year',
          'השבוע שעבר': 'last_week',
          'השנה שעברה': 'last_year',
          'החודש שעבר': 'last_month',
          '7 ימים אחרונים': 'last_7_days',
          '30 ימים אחרונים': 'last_30_days',
          '90 ימים אחרונים': 'last_90_days',
          'מותאם אישית': 'custom',
          'כל זמן': 'all',
          'הכל': 'all',
          'הכול': 'all',
          'today': 'today',
          'yesterday': 'yesterday',
          'this_week': 'this_week',
          'this_month': 'this_month',
          'this_year': 'this_year',
          'last_week': 'last_week',
          'last_year': 'last_year',
          'last_month': 'last_month',
          'last_7_days': 'last_7_days',
          'last_30_days': 'last_30_days',
          'last_90_days': 'last_90_days',
          'custom': 'custom',
          'all': 'all',
        },
      },
      defaultSearchFilter: {
        toEnglish: {
          'הכל': 'all',
          'הכול': 'all',
          '': '',
          'all': 'all',
        },
      },
    };
  }

  /**
   * Initialize event listeners to track user modifications to preference fields
   * This prevents populateGroupFields from overwriting user input
   */
  _initializeUserModificationTracking() {
    // Use event delegation on the preferences form
    const form = document.getElementById('preferencesForm');
    if (!form) {
      // Form might not exist yet, try again later
      setTimeout(() => this._initializeUserModificationTracking(), 500);
      return;
    }

    // Mark fields as user-modified when user types or changes them
    const markAsUserModified = (event) => {
      const field = event.target;
      if (field && (field.tagName === 'INPUT' || field.tagName === 'SELECT' || field.tagName === 'TEXTAREA')) {
        // Only mark if field is in a preferences section
        const section = field.closest('[id^="section"]');
        if (section && Object.keys(this.groupsMap).includes(section.id)) {
          field.dataset.userModified = 'true';
          window.Logger?.debug?.('✅ Marked field as user-modified', {
            page: 'preferences-group-manager',
            fieldId: field.id,
            fieldName: field.name,
            value: field.value
          });
        }
      }
    };

    // Add event listeners using delegation
    form.addEventListener('input', markAsUserModified, true);
    form.addEventListener('change', markAsUserModified, true);
    
    window.Logger?.debug?.('✅ Initialized user modification tracking for preference fields', {
      page: 'preferences-group-manager'
    });
  }

  /**
   * בניית מיפוי הפוך לזיהוי מהיר של קלטי UI והשלכתם למפתח הקנוני
   * @param {Object} aliases - map of canonicalKey -> string[]
   * @returns {Object} reverse map uiName/id -> canonicalKey
   */
  _buildReverseAliases(aliases) {
    const reverse = {};
    Object.keys(aliases).forEach(canonical => {
      const list = Array.isArray(aliases[canonical]) ? aliases[canonical] : [];
      list.forEach(alias => {
        if (alias && typeof alias === 'string') {
          reverse[alias] = canonical;
        }
      });
      // גם המפתח הקנוני עצמו צריך לעבוד ישירות
      reverse[canonical] = canonical;
    });
    return reverse;
  }

  /**
     * קבלת רשימת שמות/מזהים אפשריים לשדה לפי מפתח קנוני
     * כוללת: המפתח הקנוני, עליאסים, וגם html-safe-escaped
     */
  _getPossibleFieldNames(canonicalKey) {
    const names = new Set();
    if (canonicalKey) {
      names.add(canonicalKey);
      const aliasList = this.nameAliases[canonicalKey] || [];
      aliasList.forEach(a => names.add(a));
    }
    return Array.from(names);
  }

  /**
     * פתיחת section (סוגר אחרים אוטומטית)
     * @param {string} sectionId - Section ID
     */
  async openSection(sectionId) {
    // סגירת כל האחרים
    if (this.openSectionId && this.openSectionId !== sectionId) {
      await this.closeSection(this.openSectionId);
    }

    const section = document.getElementById(sectionId);
    if (!section) {
      window.Logger?.warn(`Section ${sectionId} not found`, { page: 'preferences-group-manager' });
      return;
    }

    const sectionBody = section.querySelector('.section-body');
    const icon = section.querySelector('.section-toggle-icon');

    if (sectionBody) {
      sectionBody.classList.remove('collapsed');
      sectionBody.style.display = 'block';
      if (icon) {icon.textContent = '▲';}

      this.openSectionId = sectionId;

      window.Logger?.debug(`✅ Opened section ${sectionId}`, { page: 'preferences-group-manager' });

      // טעינת העדפות הקבוצה
      const groupName = this.groupsMap[sectionId];
      if (groupName && !this.isGroupLoaded(sectionId)) {
        await this.loadGroupData(sectionId, groupName);
      }
    }
  }

  /**
     * סגירת section
     * @param {string} sectionId - Section ID
     */
  async closeSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {return;}

    const sectionBody = section.querySelector('.section-body');
    const icon = section.querySelector('.section-toggle-icon');

    if (sectionBody) {
      sectionBody.classList.add('collapsed');
      sectionBody.style.display = 'none';
      if (icon) {icon.textContent = '▼';}

      if (this.openSectionId === sectionId) {
        this.openSectionId = null;
      }

      window.Logger?.debug(`✅ Closed section ${sectionId}`, { page: 'preferences-group-manager' });
    }
  }

  /**
     * טעינת נתוני קבוצה
     * @param {string} sectionId - Section ID
     * @param {string} groupName - Group name
     */
  async loadGroupData(sectionId, groupName) {
    try {
      const t0 = performance && performance.now ? performance.now() : Date.now();
      window.Logger?.info(`📥 Loading group ${groupName}...`, { page: 'preferences-group-manager' });

      // בדיקה אם PreferencesCore זמין
      if (!window.PreferencesCore || !window.PreferencesCore.loadGroupPreferences) {
        window.Logger?.warn('PreferencesCore not available', { page: 'preferences-group-manager' });
        return;
      }

      // CRITICAL: Force refresh to ensure we get latest data from server, not stale cache
      // This is especially important after saving preferences
      const preferences = await window.PreferencesCore.loadGroupPreferences(groupName, null, null, true); // forceRefresh = true
      const populatedStats = this.populateGroupFields(sectionId, preferences);
      this.markGroupAsLoaded(sectionId);

      if (window.PreferencesCore) {
        this.currentUserId = window.PreferencesCore.currentUserId || this.currentUserId;
        this.currentProfileId = window.PreferencesCore.currentProfileId ?? this.currentProfileId;
      } else if (window.PreferencesUI) {
        this.currentUserId = window.PreferencesUI.currentUserId || this.currentUserId;
        this.currentProfileId = window.PreferencesUI.currentProfileId ?? this.currentProfileId;
      }

      const t1 = performance && performance.now ? performance.now() : Date.now();
      window.Logger?.info(`✅ Loaded ${Object.keys(preferences).length} preferences for group ${groupName}`, {
        page: 'preferences-group-manager',
        timeMs: Math.round(t1 - t0),
        populatedFields: populatedStats?.populatedCount ?? null,
        unresolvedFields: populatedStats?.unresolvedKeys ?? [],
      });
    } catch (error) {
      window.Logger?.error(`Failed to load group ${groupName}:`, error, { page: 'preferences-group-manager' });
      // Use CRUDResponseHandler for error notification if available
      if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler.handleError) {
        window.CRUDResponseHandler.handleError(error, `טעינת קבוצת העדפות ${this.getGroupDisplayName(groupName)}`);
      } else if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification?.(`שגיאה בטעינת קבוצה ${this.getGroupDisplayName(groupName)}`);
      }
    }
  }

  /**
     * מילוי שדות בקבוצה
     * @param {string} sectionId - Section ID
     * @param {Object} preferences - Preferences object
     */
  populateGroupFields(sectionId, preferences) {
    const section = document.getElementById(sectionId);
    if (!section) {
      window.Logger?.warn(`Section ${sectionId} not found for population`, { page: 'preferences-group-manager' });
      return { populatedCount: 0, unresolvedKeys: [] };
    }

    const normalizedPreferences = Array.isArray(preferences)
      ? preferences.reduce((acc, pref, index) => {
        const key = pref?.preference_name || pref?.preferenceName || pref?.name || pref?.html_id;
        if (!key) {
          window.Logger?.debug?.('⚠️ Skipping preference entry without name', { page: 'preferences-group-manager', index, pref });
          return acc;
        }
        const value = pref?.saved_value ?? pref?.value ?? pref?.default_value ?? pref?.defaultValue ?? '';
        acc[key] = value;
        return acc;
      }, {})
      : preferences || {};

    let populatedCount = 0;
    const unresolvedKeys = [];
    Object.keys(normalizedPreferences).forEach(rawKey => {
      if (!rawKey) {return;}
      // Resolve canonical key (supports both canonical and alias keys coming from backend/cache)
      const canonicalKey = this.reverseNameAliases[rawKey] || rawKey;
      const possibleNames = this._getPossibleFieldNames(canonicalKey);

      // Build selector including name/id and escaped variants
      const selectorParts = [];
      possibleNames.forEach(nameOrId => {
        const esc = typeof window !== 'undefined' && window.CSS && typeof window.CSS.escape === 'function'
          ? window.CSS.escape(nameOrId)
          : nameOrId;
        selectorParts.push(`[name="${nameOrId}"]`, `[name="${esc}"]`, `#${esc}`);
      });

      // Try data-color-key as well
      selectorParts.push(`[data-color-key="${canonicalKey}"]`);

      const field = section.querySelector(selectorParts.join(', '));
      if (field) {
        // CRITICAL: Check if field was modified by user before overwriting
        // If field has focus or was recently modified, preserve user's input
        const fieldHasFocus = document.activeElement === field;
        const cachedValue = normalizedPreferences[rawKey];
        const currentValue = field.type === 'checkbox' ? field.checked : field.value;
        
        // Check if value actually differs from cached value
        const valueDiffers = field.type === 'checkbox' 
          ? (currentValue !== (cachedValue === 'true' || cachedValue === true))
          : (currentValue !== '' && currentValue !== cachedValue && cachedValue !== undefined && cachedValue !== null);
        
        const fieldWasModified = field.dataset.userModified === 'true' || valueDiffers;
        
        // Skip population if field is currently being edited or was modified by user
        // UNLESS explicitly allowed to repopulate (e.g., after save)
        if (fieldHasFocus || (fieldWasModified && !field.dataset.allowRepopulate)) {
          window.Logger?.debug?.('⏭️ Skipping field population - user is editing or field was modified', {
            page: 'preferences-group-manager',
            fieldId: field.id,
            fieldName: field.name,
            currentValue: currentValue,
            cachedValue: cachedValue,
            hasFocus: fieldHasFocus,
            wasModified: fieldWasModified,
            valueDiffers: valueDiffers
          });
          // Don't increment populatedCount for skipped fields
          return; // Continue to next field
        }
        
        if (field.type === 'checkbox') {
          const v = normalizedPreferences[rawKey];
          field.checked = v === 'true' || v === true;
        } else {
          const sourceValue = normalizedPreferences[rawKey];
          const normalizedValue = this.normalizePreferenceValue(canonicalKey, sourceValue, 'toEnglish');
          const previousValue = field.value;
          
          // Only update if value actually changed
          if (field.value === normalizedValue || field.value === sourceValue) {
            // Value already matches, no need to update
            populatedCount++;
            return; // Continue to next field
          }
          
          // Use DataCollectionService to set value if available
          if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
            window.DataCollectionService.setValue(field.id, normalizedValue, 'text');
            // Check if assignment succeeded (for selects)
            if (field.tagName === 'SELECT') {
              const currentValue = window.DataCollectionService.getValue(field.id, 'text', '');
              if (currentValue !== normalizedValue && sourceValue !== undefined && sourceValue !== null) {
                window.DataCollectionService.setValue(field.id, sourceValue, 'text');
              } else if (currentValue === '' && previousValue !== '') {
                // Only restore previous value if it's not empty and current is empty
                // But don't restore if user was editing
                if (!fieldHasFocus && !fieldWasModified) {
                  window.DataCollectionService.setValue(field.id, previousValue, 'text');
                }
              }
            }
          } else {
            field.value = normalizedValue;
            // If direct assignment failed (option not found), try fallback to original value
            if (field.value !== normalizedValue && sourceValue !== undefined && sourceValue !== null) {
              field.value = sourceValue;
            }
            // If still empty and there was a previous value, restore it to avoid blank selection
            // BUT: Only if user is not currently editing
            if (field.value === '' && previousValue !== '' && !fieldHasFocus && !fieldWasModified) {
              field.value = previousValue;
            }
          }
          
          // Clear user modification flag after successful population
          delete field.dataset.userModified;
        }
        populatedCount++;
      } else {
        unresolvedKeys.push(canonicalKey);
      }
    });

    window.Logger?.debug(`Populated ${populatedCount} fields in section ${sectionId}`, {
      page: 'preferences-group-manager',
      unresolvedCount: unresolvedKeys.length,
      unresolvedKeys,
    });
    return { populatedCount, unresolvedKeys };
  }

  /**
     * Normalize preference value between UI and storage formats
     * @param {string} prefName - Preference name
     * @param {any} value - Current value
     * @param {('toEnglish'|'toUI')} direction - Normalization direction
     * @returns {any} Normalized value
     */
  normalizePreferenceValue(prefName, value, direction = 'toEnglish') {
    if (value === null || value === undefined) {
      return value;
    }

    if (!Object.prototype.hasOwnProperty.call(this.valueMappings, prefName)) {
      return value;
    }

    const normalizedValue = String(value).trim();
    const mapping = this.valueMappings[prefName].toEnglish || {};

    if (direction === 'toEnglish') {
      return mapping[normalizedValue] || normalizedValue;
    }

    // Currently we store and display the English codes in the UI selects,
    // so for toUI we can reuse the same mapping (fallback to original value).
    return mapping[normalizedValue] || normalizedValue;
  }

  /**
     * שמירת קבוצה
     * @param {string} groupName - Group name
     */
  async saveGroup(groupName) {
    const sectionId = Object.keys(this.groupsMap).find(
      key => this.groupsMap[key] === groupName,
    );

    if (!sectionId) {
      const error = new Error(`Group ${groupName} not found in mapping`);
      window.Logger?.error(error.message, { page: 'preferences-group-manager' });
      // Use CRUDResponseHandler for error notification if available
      if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler.handleError) {
        window.CRUDResponseHandler.handleError(error, 'שמירת קבוצת העדפות');
      } else if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification?.('קבוצה לא נמצאה');
      }
      throw error;
    }

    const section = document.getElementById(sectionId);
    if (!section) {
      const error = new Error(`Section ${sectionId} not found`);
      window.Logger?.error(error.message, { page: 'preferences-group-manager' });
      // Use CRUDResponseHandler for error notification if available
      if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler.handleError) {
        window.CRUDResponseHandler.handleError(error, 'שמירת קבוצת העדפות');
      }
      throw error;
    }

    const formData = this.collectGroupData(section);

    if (Object.keys(formData).length === 0) {
      window.Logger?.warn(`No data to save for group ${groupName}`, { page: 'preferences-group-manager' });
      // Return success (no data to save is not an error)
      return { saved: 0, skipped: true };
    }

    try {
      window.Logger?.info(`💾 Saving ${Object.keys(formData).length} preferences for group ${groupName}...`, { page: 'preferences-group-manager' });

      // בדיקה אם PreferencesCore זמין
      if (!window.PreferencesCore || !window.PreferencesCore.saveGroupPreferences) {
        const error = new Error('PreferencesCore.saveGroupPreferences not available');
        window.Logger?.error(error.message, { page: 'preferences-group-manager' });
        // Use CRUDResponseHandler for error notification if available
        if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler.handleError) {
          window.CRUDResponseHandler.handleError(error, 'שמירת קבוצת העדפות');
        } else if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification?.('מערכת העדפות לא זמינה');
        }
        throw error;
      }

      // שמירה
      const results = await window.PreferencesCore.saveGroupPreferences(groupName, formData);
      const userId = window.PreferencesCore?.currentUserId || window.PreferencesUI?.currentUserId || this.currentUserId || 1;
      const profileId = window.PreferencesCore?.currentProfileId || window.PreferencesUI?.currentProfileId || this.currentProfileId || 0;
      const savedKeys = Object.keys(formData);

      // OPTIMIZED: Use PreferencesManager for optimistic updates
      // No need to refresh/reload after save - use saved values directly
      if (window.PreferencesManager && typeof window.PreferencesManager.saveGroup === 'function') {
        // Use PreferencesManager which handles optimistic updates
        const saveResults = await window.PreferencesManager.saveGroup(groupName, formData, {
          userId,
          profileId,
          optimisticUpdate: true, // Update UI immediately without reload
        });

        // Only invalidate cache (don't reload)
        if (window.PreferencesCache) {
          await window.PreferencesCache.clearGroup(groupName, userId, profileId);
        }

        // Update UI with saved values (optimistic update already done by PreferencesManager)
        const sectionId = Object.keys(this.groupsMap).find(id => this.groupsMap[id] === groupName);
        if (sectionId && window.PreferencesUI && typeof window.PreferencesUI.updateFields === 'function') {
          // Mark fields as allowRepopulate to allow update
          const section = document.getElementById(sectionId);
          if (section) {
            const fields = section.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
              field.dataset.allowRepopulate = 'true';
            });
            // Update fields with saved values
            window.PreferencesUI.updateFields(formData);
            // Clear allowRepopulate flag
            fields.forEach(field => {
              delete field.dataset.allowRepopulate;
              delete field.dataset.userModified;
            });
          }
        }

        return saveResults;
      }

      // FALLBACK: Original flow (for backward compatibility)
      // ניקוי cache של הקבוצה
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.refreshUserPreferences) {
        await window.UnifiedCacheManager.refreshUserPreferences(profileId, groupName, {
          userId,
          preferenceNames: savedKeys,
        });
      }

      await this.refreshGroupState(groupName, savedKeys);

      // Note: Success notification is handled by CRUDResponseHandler in PreferencesData.savePreferences()
      // Only show additional notification if save was successful but CRUDResponseHandler didn't show one
      if (results.saved > 0 && typeof window.showSuccessNotification === 'function') {
        const displayName = this.getGroupDisplayName(groupName);
        // Only show if CRUDResponseHandler didn't already show a notification
        // (CRUDResponseHandler shows notification automatically, so this is a fallback)
        window.Logger?.debug?.('Preferences group saved successfully', {
          page: 'preferences-group-manager',
          groupName,
          savedCount: results.saved,
        });
      }

      window.Logger?.info(`✅ Saved ${results.saved} preferences for group ${groupName}`, { page: 'preferences-group-manager' });

      // רענון טבלת Preference Types (אם קיימת בממשק) באמצעות אירוע כללי
      try {
        if (typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('preferences:types-refresh', {
            detail: { source: 'preferences-group-manager', groupName, savedKeys },
          }));
        }
      } catch (e) {
        window.Logger?.warn('⚠️ Failed to dispatch preferences:types-refresh event', e, { page: 'preferences-group-manager' });
      }

      return results;
    } catch (error) {
      window.Logger?.error(`Failed to save group ${groupName}:`, error, { page: 'preferences-group-manager' });
      // Error notification is handled by CRUDResponseHandler in PreferencesData.savePreferences()
      // Only show additional notification if CRUDResponseHandler didn't show one
      if (typeof window.showErrorNotification === 'function' && 
          typeof window.CRUDResponseHandler === 'undefined') {
        window.showErrorNotification?.('שגיאה בשמירת הגדרות');
      }
      throw error; // Re-throw to allow caller to handle
    }
  }

  /**
     * איסוף נתונים מקבוצה
     * @param {HTMLElement} section - Section element
     * @returns {Object} Form data
     */
  collectGroupData(section) {
    const formData = {};
    const inputs = section.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      // Determine canonical preference key:
      // Priority: explicit data-color-key / data-pref-key → alias reverse map → name/id
      let canonicalName = null;
      if (input.dataset && (input.dataset.colorKey || input.dataset.prefKey)) {
        canonicalName = input.dataset.colorKey || input.dataset.prefKey;
      } else {
        const uiName = input.name || input.id;
        canonicalName = this.reverseNameAliases[uiName] || uiName;
      }

      if (!canonicalName) {return;}

      // Skip buttons, hidden fields, disabled fields
      if (input.type === 'button' || input.type === 'submit' || input.type === 'hidden') {return;}
      if (input.disabled) {return;}

      if (input.type === 'checkbox') {
        formData[canonicalName] = input.checked ? 'true' : 'false';
      } else {
        formData[canonicalName] = this.normalizePreferenceValue(canonicalName, input.value, 'toEnglish');
      }
    });

    return formData;
  }

  /**
     * קבלת שם תצוגה לקבוצה
     * @param {string} groupName - Group name
     * @returns {string} Display name
     */
  getGroupDisplayName(groupName) {
    const names = {
      'basic_settings': 'הגדרות בסיסיות',
      'trading_settings': 'הגדרות מסחר',
      'filter_settings': 'פילטרים',
      'colors_unified': 'צבעים',
      'notification_settings': 'התראות',
      'chart_settings_unified': 'הגדרות גרפים',
    };
    return names[groupName] || groupName;
  }

  /**
     * בדיקה אם קבוצה כבר נטענה
     * @param {string} sectionId - Section ID
     * @returns {boolean} Is loaded
     */
  isGroupLoaded(sectionId) {
    const section = document.getElementById(sectionId);
    return section ? section.dataset.loaded === 'true' : false;
  }

  /**
     * סימון קבוצה כנטענת
     * @param {string} sectionId - Section ID
     */
  markGroupAsLoaded(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.dataset.loaded = 'true';
    }
  }

  /**
     * רענון מצב הקבוצה והעדפות גלובליות אחרי שמירה
     * @param {string} groupName - Group name
     * @param {Array<string>} savedKeys - Saved preference keys
     */
  async refreshGroupState(groupName, savedKeys = []) {
    try {
      const userId = window.PreferencesCore?.currentUserId || window.PreferencesUI?.currentUserId || this.currentUserId || 1;
      let profileId = window.PreferencesCore?.currentProfileId;

      if (profileId === null || profileId === undefined) {
        if (window.PreferencesUI?.currentProfileId !== null && window.PreferencesUI?.currentProfileId !== undefined) {
          profileId = window.PreferencesUI.currentProfileId;
        } else if (typeof window.PreferencesUI?.loadActiveProfile === 'function') {
          profileId = await window.PreferencesUI.loadActiveProfile();
        } else if (this.currentProfileId !== null && this.currentProfileId !== undefined) {
          profileId = this.currentProfileId;
        } else {
          profileId = 0;
        }
      }

      this.currentUserId = userId;
      this.currentProfileId = profileId;

      if (!window.PreferencesCore?.loadGroupPreferences) {
        window.Logger?.warn('PreferencesCore.loadGroupPreferences unavailable - skipping refresh', { page: 'preferences-group-manager' });
        return;
      }

      const refreshedGroup = await window.PreferencesCore.loadGroupPreferences(groupName, userId, profileId);
      const latestContext = window.PreferencesCore?.getLatestProfileContext?.() || window.PreferencesUI?.profileContext || null;
      if (!refreshedGroup || typeof refreshedGroup !== 'object') {
        window.Logger?.warn(`No refreshed data returned for group ${groupName}`, { page: 'preferences-group-manager' });
        return;
      }

      let combinedPreferences = {};
      if (window.PreferencesUI?.cachedPreferences && Object.keys(window.PreferencesUI.cachedPreferences).length > 0) {
        combinedPreferences = { ...window.PreferencesUI.cachedPreferences, ...refreshedGroup };
      } else if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
        combinedPreferences = { ...window.currentPreferences, ...refreshedGroup };
      } else {
        combinedPreferences = { ...refreshedGroup };
      }

      if (window.PreferencesUI && typeof window.PreferencesUI.updateGlobalPreferences === 'function') {
        window.PreferencesUI.updateGlobalPreferences(combinedPreferences, userId, profileId, latestContext);
      } else {
        window.currentPreferences = { ...window.currentPreferences || {}, ...refreshedGroup };
        window.userPreferences = { ...window.userPreferences || {}, ...refreshedGroup };

        if (window.PreferencesSystem?.manager) {
          window.PreferencesSystem.manager.currentPreferences = {
            ...window.PreferencesSystem.manager.currentPreferences || {},
            ...refreshedGroup,
          };
          if (typeof window.PreferencesSystem.manager.setActiveProfile === 'function') {
            window.PreferencesSystem.manager.setActiveProfile(profileId);
          } else {
            window.PreferencesSystem.manager.currentProfile = profileId;
          }
        }

        if (window.PreferencesUI) {
          window.PreferencesUI.cachedPreferences = combinedPreferences;
          window.PreferencesUI.currentUserId = userId;
          window.PreferencesUI.currentProfileId = profileId;
        }

        if (typeof window.updateCSSVariablesFromPreferences === 'function') {
          window.updateCSSVariablesFromPreferences(window.currentPreferences);
        } else if (window.ColorSchemeSystem?.updateCSSVariablesFromPreferences) {
          window.ColorSchemeSystem.updateCSSVariablesFromPreferences(window.currentPreferences);
        } else if (window.colorSchemeSystem?.updateCSSVariablesFromPreferences) {
          window.colorSchemeSystem.updateCSSVariablesFromPreferences(window.currentPreferences);
        }

      }

      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('preferences:group-updated', {
          detail: {
            groupName,
            userId,
            profileId,
            updatedKeys: savedKeys,
            preferenceCount: Object.keys(refreshedGroup).length,
          },
        }));
      }

      // Update color-related systems if needed
      if (groupName === 'colors_unified') {
        if (window.ColorPickerManager) {
          window.ColorPickerManager.loadColors(refreshedGroup);
        }
        if (window.ColorManager && window.ColorManager.colorCache instanceof Map) {
          Object.keys(refreshedGroup).forEach(key => {
            if (window.ColorManager.defaultColors && Object.prototype.hasOwnProperty.call(window.ColorManager.defaultColors, key)) {
              window.ColorManager.colorCache.set(key, refreshedGroup[key]);
            }
          });
        }
      }

      // OPTIMIZED: Only populate if explicitly requested (not after save)
      // After save, we use optimistic updates, so no need to reload
      const sectionId = Object.keys(this.groupsMap).find(id => this.groupsMap[id] === groupName);
      if (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
          // Only populate if this is a manual refresh, not after save
          // Check if we have savedKeys - if yes, this is after save, skip population
          if (savedKeys.length === 0) {
            // Manual refresh - populate fields
            const fields = section.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
              field.dataset.allowRepopulate = 'true';
            });
            
            // Populate fields
            this.populateGroupFields(sectionId, refreshedGroup);
            
            // Clear allowRepopulate flag after population
            fields.forEach(field => {
              delete field.dataset.allowRepopulate;
              delete field.dataset.userModified;
            });
          } else {
            // After save - optimistic update already done, just update cache
            window.Logger?.debug?.('Skipping population after save (optimistic update already done)', {
              page: 'preferences-group-manager',
              groupName,
            });
          }
        }
      }

      if (groupName === 'basic_settings' && typeof window.loadAccountsForPreferences === 'function') {
        await window.loadAccountsForPreferences();
      }

      window.Logger?.info(`✅ Group ${groupName} state refreshed successfully`, {
        page: 'preferences-group-manager',
        profileId,
        userId,
        updatedKeysCount: savedKeys.length,
      });
    } catch (error) {
      window.Logger?.warn(`⚠️ Failed to refresh group ${groupName} after save`, error, { page: 'preferences-group-manager' });
    }
  }
}

// אתחול גלובלי
window.PreferencesGroupManager = new PreferencesGroupManager();

// NOTE: toggleSection is handled by ui-utils.js with accordion logic
// We don't override it here - the accordion mode is configured in page-initialization-configs.js

/**
 * שמירת קבוצה
 * @param {string} groupName - Group name
 */
window.savePreferenceGroup = async function(groupName) {
  if (!window.PreferencesGroupManager) {
    window.Logger?.error('PreferencesGroupManager not available', { page: 'preferences-group-manager' });
    throw new Error('PreferencesGroupManager not available');
  }
  return await window.PreferencesGroupManager.saveGroup(groupName);
};

// NOTE: toggleAllSections is handled by ui-utils.js with accordion logic
// We don't override it here - the accordion mode is configured in page-initialization-configs.js

window.Logger?.info('✅ PreferencesGroupManager loaded successfully', { page: 'preferences-group-manager' });

