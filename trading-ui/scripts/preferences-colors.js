/**
 * Preferences Colors System - TikTrack
 * ===================================
 *
 * Dedicated system for managing all color preferences
 * Handles 60+ color preferences with specialized logic
 *
 * @version 1.0.0
 * @date January 23, 2025
 * @author TikTrack Development Team
 *
 * @description
 * Specialized color management system with:
 * - Color loading and validation
 * - Color scheme synchronization
 * - Color picker management
 * - Color preview and testing
 * - Integration with ColorSchemeSystem
 *
 * @architecture
 * - ColorManager: Core color operations
 * - ColorPickerManager: UI color pickers
 * - ColorSchemeSync: Sync with ColorSchemeSystem
 * - ColorValidation: Color format validation
 * - ColorPreview: Live preview system
 */

if (window.Logger && window.Logger.info) {
  window.Logger.info('🎨 Loading preferences-colors.js v1.0.0...', { page: 'preferences-colors' });
}

// ============================================================================
// FUNCTION INDEX
// ============================================================================
/**
 * ============================================================================
 * FUNCTION INDEX - Preferences Colors System
 * ============================================================================
 * 
 * Core Classes:
 * - ColorManager - Core color operations (load, save, validate)
 * - ColorPickerManager - UI color pickers management
 * 
 * Global Functions:
 * - loadColorsForPreferences(userId, profileId) - Load all colors for preferences page
 * - resetAllColorsToDefaults() - Reset all colors to default values
 * - getColorPreference(colorName) - Get color by name
 * - setColorPreference(colorName, colorValue) - Set color preference
 * 
 * Global Instances:
 * - window.ColorManager - Main color manager instance
 * - window.ColorPickerManager - Main color picker manager instance
 * 
 * Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
 * ============================================================================
 */

// ============================================================================
// COLOR MANAGER CLASS
// ============================================================================

/**
 * Core Color Management System
 * Handles all color-related preferences
 */
class ColorManager {
  constructor() {
    this.colorCache = new Map();
    this.colorGroups = {
      'chart': ['chartBackgroundColor', 'chartBorderColor', 'chartGridColor', 'chartPointColor', 'chartPrimaryColor', 'chartSecondaryColor', 'chartTextColor'],
      'entity': ['entityAlertColor', 'entityAlertColorDark', 'entityAlertColorLight', 'entityInfoColor', 'entityInfoColorDark', 'entityInfoColorLight', 'entityNoteColor', 'entityNoteColorDark', 'entityNoteColorLight', 'entityTradeColor', 'entityTradeColorDark', 'entityTradeColorLight', 'entityTickerColor', 'entityTickerColorDark', 'entityTickerColorLight', 'entityExecutionColor', 'entityExecutionColorDark', 'entityExecutionColorLight', 'entityTradingAccountColor', 'entityTradingAccountColorDark', 'entityTradingAccountColorLight', 'entityTradePlanColor', 'entityTradePlanColorDark', 'entityTradePlanColorLight', 'entityCashFlowColor', 'entityCashFlowColorDark', 'entityCashFlowColorLight', 'entityPreferencesColor', 'entityPreferencesColorDark', 'entityPreferencesColorLight', 'entityResearchColor', 'entityResearchColorDark', 'entityResearchColorLight'],
      'status': ['statusOpenColor', 'statusClosedColor', 'statusCancelledColor'],
      'value': ['valuePositiveColor', 'valueNegativeColor', 'valueNeutralColor', 'valuePositiveColorLight', 'valuePositiveColorDark', 'valueNegativeColorLight', 'valueNegativeColorDark', 'valueNeutralColorLight', 'valueNeutralColorDark'],
      'theme': ['primaryColor', 'secondaryColor', 'successColor', 'dangerColor', 'warningColor', 'infoColor'],
      'ui': ['backgroundColor', 'textColor', 'linkColor', 'borderColor', 'shadowColor', 'highlightColor'],
      'notifications': ['notificationSuccessColor', 'notificationErrorColor', 'notificationWarningColor', 'notificationInfoColor'],
    };

    this.defaultColors = {
      // Chart colors
      'chartBackgroundColor': '#ffffff',
      'chartBorderColor': '#e0e0e0',
      'chartGridColor': '#f0f0f0',
      'chartPointColor': '#26baac',
      'chartPrimaryColor': '#1a8f83',
      'chartSecondaryColor': '#fc5a06',
      'chartTextColor': '#333333',

      // Entity colors
      'entityAlertColor': '#ff9800',
      'entityAlertColorDark': '#f57c00',
      'entityAlertColorLight': '#ffb74d',
      'entityInfoColor': '#17a2b8',
      'entityInfoColorDark': '#138496',
      'entityInfoColorLight': '#bee5eb',
      'entityNoteColor': '#607d8b',
      'entityNoteColorDark': '#455a64',
      'entityNoteColorLight': '#90a4ae',
      'entityTradeColor': '#26baac',
      'entityTradeColorDark': '#1a8f83',
      'entityTradeColorLight': '#6ed8ca',
      'entityTickerColor': '#17a2b8',
      'entityTickerColorDark': '#138496',
      'entityTickerColorLight': '#20c997',
      'entityExecutionColor': '#6f42c1',
      'entityExecutionColorDark': '#5a2d91',
      'entityExecutionColorLight': '#8e44ad',
      'entityTradingAccountColor': '#28a745',
      'entityTradingAccountColorDark': '#1e7e34',
      'entityTradingAccountColorLight': '#34ce57',
      'entityTradePlanColor': '#9c27b0',
      'entityTradePlanColorDark': '#7b1fa2',
      'entityTradePlanColorLight': '#ba68c8',
      'entityCashFlowColor': '#20c997',
      'entityCashFlowColorDark': '#138496',
      'entityCashFlowColorLight': '#20c997',
      'entityPreferencesColor': '#607d8b',
      'entityPreferencesColorDark': '#455a64',
      'entityPreferencesColorLight': '#90a4ae',
      'entityResearchColor': '#9c27b0',
      'entityResearchColorDark': '#7b1fa2',
      'entityResearchColorLight': '#ba68c8',

      // Status colors
      'statusOpenColor': '#28a745',
      'statusClosedColor': '#6c757d',
      'statusCancelledColor': '#dc3545',

      // Value colors
      'valuePositiveColor': '#28a745',
      'valueNegativeColor': '#dc3545',
      'valueNeutralColor': '#6c757d',
      'valuePositiveColorLight': '#e8f5e8',
      'valuePositiveColorDark': '#1e7e34',
      'valueNegativeColorLight': '#fdeaea',
      'valueNegativeColorDark': '#c82333',
      'valueNeutralColorLight': '#f8f9fa',
      'valueNeutralColorDark': '#495057',

      // Theme colors
      'primaryColor': '#26baac',
      'secondaryColor': '#fc5a06',
      'successColor': '#28a745',
      'dangerColor': '#dc3545',
      'warningColor': '#ffc107',
      'infoColor': '#17a2b8',
      'linkColor': '#26baac',

      // UI colors
      'backgroundColor': '#ffffff',
      'textColor': '#333333',
      'borderColor': '#dee2e6',
      'shadowColor': '#666666',
      'highlightColor': '#26baac',

      // Notification colors
      'notificationSuccessColor': '#28a745',
      'notificationErrorColor': '#dc3545',
      'notificationWarningColor': '#ffc107',
      'notificationInfoColor': '#17a2b8',
    };
  }

  /**
     * Load all color preferences
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} Color preferences object
     */
  async loadAllColors(userId = 1, profileId = null) {
    try {
      window.Logger.info('🎨 Loading all color preferences...', { page: 'preferences-colors' });

      // Get all color preference names
      const colorNames = Object.keys(this.defaultColors);

      const finalUserId = userId !== null && userId !== undefined
        ? userId
        : window.PreferencesCore?.currentUserId || window.PreferencesUI?.currentUserId || 1;
      const finalProfileId = profileId !== null && profileId !== undefined
        ? profileId
        : window.PreferencesCore?.currentProfileId ?? window.PreferencesUI?.currentProfileId ?? null;

      // Check if PreferencesData is available
      if (!window.PreferencesData || typeof window.PreferencesData.loadPreferencesByNames !== 'function') {
        window.Logger?.warn?.('[ColorManager] PreferencesData.loadPreferencesByNames API is not available - using default colors', {
          page: 'preferences-colors',
          userId: finalUserId,
          profileId: finalProfileId,
        });
        return this.defaultColors;
      }

      const fetched = await window.PreferencesData.loadPreferencesByNames({
        names: colorNames,
        userId: finalUserId,
        profileId: finalProfileId,
        force: true,
      });

      const allColors = {};
      colorNames.forEach(name => {
        const value = fetched?.[name] ?? this.defaultColors[name];
        allColors[name] = value;
        this.colorCache.set(name, value);
      });

      window.Logger.info(`✅ Loaded ${Object.keys(allColors, { page: 'preferences-colors' }).length} color preferences`);
      return allColors;

    } catch (error) {
      window.Logger.error('❌ Error loading colors:', error, { page: 'preferences-colors' });
      return this.defaultColors;
    }
  }

  /**
     * Load colors for specific group
     * @param {string} groupName - Group name (chart, entity, status, value, theme, ui)
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} Group colors
     */
  async loadColorGroup(groupName, userId = 1, profileId = null) {
    const groupColors = this.colorGroups[groupName] || [];
    if (groupColors.length === 0) {
      window.Logger.warn(`⚠️ Unknown color group: ${groupName}`, { page: 'preferences-colors' });
      return {};
    }

    const finalUserId = userId !== null && userId !== undefined
      ? userId
      : window.PreferencesCore?.currentUserId || window.PreferencesUI?.currentUserId || 1;
    const finalProfileId = profileId !== null && profileId !== undefined
      ? profileId
      : window.PreferencesCore?.currentProfileId ?? window.PreferencesUI?.currentProfileId ?? null;

    // Check if PreferencesData is available
    if (!window.PreferencesData || typeof window.PreferencesData.loadPreferencesByNames !== 'function') {
      window.Logger?.warn?.('[ColorManager] PreferencesData.loadPreferencesByNames API is not available - using default group colors', {
        page: 'preferences-colors',
        userId: finalUserId,
        profileId: finalProfileId,
      });
      return {};
    }

    const fetched = await window.PreferencesData.loadPreferencesByNames({
      names: groupColors,
      userId: finalUserId,
      profileId: finalProfileId,
      force: true,
    });

    const groupData = {};
    groupColors.forEach(colorName => {
      groupData[colorName] = fetched?.[colorName] ?? this.defaultColors[colorName];
    });

    return groupData;
  }

  /**
     * Save color preference
     * @param {string} colorName - Color name
     * @param {string} colorValue - Color value (hex, rgb, etc.)
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<boolean>} Success status
     */
  async saveColor(colorName, colorValue, userId = 1, profileId = null) {
    try {
      // Validate color format
      if (!this.validateColorFormat(colorValue)) {
        throw new Error(`Invalid color format: ${colorValue}`);
      }

      const finalUserId = userId !== null && userId !== undefined
        ? userId
        : window.PreferencesCore?.currentUserId || window.PreferencesUI?.currentUserId || 1;
      const finalProfileId = profileId !== null && profileId !== undefined
        ? profileId
        : window.PreferencesCore?.currentProfileId ?? window.PreferencesUI?.currentProfileId ?? null;

      await window.PreferencesData.savePreference({
        preferenceName: colorName,
        value: colorValue,
        userId: finalUserId,
        profileId: finalProfileId,
      });

      this.colorCache.set(colorName, colorValue);

      // Sync with ColorSchemeSystem if available
      if (window.ColorSchemeSystem || window.colorSchemeSystem) {
        await this.syncWithColorScheme(colorName, colorValue);
      }

      window.Logger.info(`✅ Saved color ${colorName}: ${colorValue}`, { page: 'preferences-colors' });
      return true;

    } catch (error) {
      window.Logger.error(`❌ Error saving color ${colorName}:`, error, { page: 'preferences-colors' });
      return false;
    }
  }

  /**
     * Validate color format
     * @param {string} color - Color value
     * @returns {boolean} Is valid
     */
  validateColorFormat(color) {
    if (!color || typeof color !== 'string') {return false;}

    // Hex color validation
    if (color.startsWith('#')) {
      return /^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color);
    }

    // RGB color validation
    if (color.startsWith('rgb')) {
      return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color);
    }

    // Named colors (basic validation)
    const namedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey'];
    return namedColors.includes(color.toLowerCase());
  }

  /**
     * Sync color with ColorSchemeSystem
     * @param {string} colorName - Color name
     * @param {string} colorValue - Color value
     */
  async syncWithColorScheme(colorName, colorValue) {
    try {
      // Try ColorSchemeSystem API (with capital C)
      if (window.ColorSchemeSystem && typeof window.ColorSchemeSystem.updateColor === 'function') {
        await window.ColorSchemeSystem.updateColor(colorName, colorValue);
        window.Logger.info(`🎨 Synced ${colorName} with ColorSchemeSystem`, { page: 'preferences-colors' });
        return;
      }
      
      // Fallback to updateEntityColors if ColorSchemeSystem.updateColor not available
      if (typeof window.updateEntityColors === 'function') {
        const payload = {
          colorScheme: {
            entities: {
              [colorName]: colorValue,
            },
          },
        };
        window.updateEntityColors(payload);
        window.Logger.info(`🎨 Synced ${colorName} with ColorSchemeSystem via updateEntityColors`, { page: 'preferences-colors' });
        return;
      }
      
      // If no sync method available, log warning
      if (window.Logger && window.Logger.warn) {
        window.Logger.warn(`⚠️ ColorSchemeSystem sync not available for ${colorName}`, { page: 'preferences-colors' });
      }
    } catch (error) {
      if (window.Logger && window.Logger.warn) {
        window.Logger.warn(`⚠️ Failed to sync ${colorName} with ColorSchemeSystem:`, error, { page: 'preferences-colors' });
      }
    }
  }

  /**
     * Get color by name
     * @param {string} colorName - Color name
     * @returns {string} Color value
     */
  getColor(colorName) {
    return this.colorCache.get(colorName) || this.defaultColors[colorName] || '#000000';
  }

  /**
     * Get all colors for a specific group
     * @param {string} groupName - Group name
     * @returns {Object} Group colors
     */
  getGroupColors(groupName) {
    const groupColors = this.colorGroups[groupName] || [];
    const result = {};

    groupColors.forEach(colorName => {
      result[colorName] = this.getColor(colorName);
    });

    return result;
  }
}

// ============================================================================
// COLOR PICKER MANAGER CLASS
// ============================================================================

/**
 * Color Picker UI Management
 * Handles all color picker interactions
 */
class ColorPickerManager {
  constructor() {
    this.pickers = new Map();
    this.previewElements = new Map();
  }

  /**
     * Initialize all color pickers on page
     */
  initializePickers() {
    const colorPickers = document.querySelectorAll('input[type="color"]');
    window.Logger.info(`🎨 Found ${colorPickers.length} color pickers`, { page: 'preferences-colors' });

    colorPickers.forEach(picker => {
      this.registerPicker(picker);
    });
  }

  /**
     * Register a color picker
     * @param {HTMLInputElement} picker - Color picker element
     */
  registerPicker(picker) {
    const id = picker.id;
    const colorKey = picker.getAttribute('data-color-key') || id;

    this.pickers.set(id, {
      element: picker,
      colorKey,
      originalValue: picker.value,
    });

    // Add event listeners
    picker.addEventListener('change', e => this.onColorChange(id, e.target.value));
    picker.addEventListener('input', e => this.onColorInput(id, e.target.value));

    window.Logger.info(`🎨 Registered color picker: ${id} (key: ${colorKey}, { page: "preferences-colors" })`);
  }

  /**
     * Handle color change
     * @param {string} pickerId - Picker ID
     * @param {string} colorValue - New color value
     */
  onColorChange(pickerId, colorValue) {
    const picker = this.pickers.get(pickerId);
    if (!picker) {return;}

    window.Logger.info(`🎨 Color changed: ${pickerId} = ${colorValue}`, { page: 'preferences-colors' });

    // Update preview if exists
    this.updatePreview(pickerId, colorValue);

    // Trigger save if auto-save is enabled
    if (picker.element.hasAttribute('data-auto-save')) {
      this.saveColor(picker.colorKey, colorValue);
    }
  }

  /**
     * Handle color input (real-time)
     * @param {string} pickerId - Picker ID
     * @param {string} colorValue - New color value
     */
  onColorInput(pickerId, colorValue) {
    const picker = this.pickers.get(pickerId);
    if (!picker) {return;}

    // Update preview in real-time
    this.updatePreview(pickerId, colorValue);
  }

  /**
     * Update color preview
     * @param {string} pickerId - Picker ID
     * @param {string} colorValue - Color value
     */
  updatePreview(pickerId, colorValue) {
    const picker = this.pickers.get(pickerId);
    if (!picker) {return;}

    // Find preview element
    const previewId = `${pickerId}_preview`;
    let previewElement = document.getElementById(previewId);

    if (!previewElement) {
      // Create preview element if it doesn't exist
      previewElement = document.createElement('div');
      previewElement.id = previewId;
      previewElement.className = 'color-preview';
      previewElement.style.cssText = `
                width: 20px;
                height: 20px;
                border: 1px solid #ccc;
                border-radius: 3px;
                display: inline-block;
                margin-left: 5px;
                vertical-align: middle;
            `;

      // Insert after the picker
      picker.element.parentNode.insertBefore(previewElement, picker.element.nextSibling);
    }

    // Update preview color
    previewElement.style.backgroundColor = colorValue;
  }

  /**
     * Save color preference
     * @param {string} colorKey - Color key
     * @param {string} colorValue - Color value
     */
  async saveColor(colorKey, colorValue) {
    try {
      if (window.ColorManager) {
        const success = await window.ColorManager.saveColor(colorKey, colorValue);
        if (success) {
          window.Logger.info(`✅ Saved color ${colorKey}: ${colorValue}`, { page: 'preferences-colors' });
        } else {
          window.Logger.error(`❌ Failed to save color ${colorKey}`, { page: 'preferences-colors' });
        }
      } else {
        window.Logger.warn('⚠️ ColorManager not available', { page: 'preferences-colors' });
      }
    } catch (error) {
      window.Logger.error(`❌ Error saving color ${colorKey}:`, error, { page: 'preferences-colors' });
    }
  }

  /**
     * Load colors into pickers
     * @param {Object} colors - Colors object
     */
  loadColors(colors) {
    Object.entries(colors).forEach(([colorKey, colorValue]) => {
      // Find picker by color key
      const picker = Array.from(this.pickers.values()).find(p => p.colorKey === colorKey);
      if (picker && picker.element) {
        // Convert RGBA to RGB for color inputs (they don't support alpha)
        const cleanValue = this.convertToColorInputFormat(colorValue);
        // Use DataCollectionService to set value if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
          window.DataCollectionService.setValue(picker.element.id, cleanValue, 'text');
        } else {
          picker.element.value = cleanValue;
        }
        this.updatePreview(picker.element.id, cleanValue);
      }
    });
  }

  /**
     * Convert color value to color input format
     * Converts rgba/rgba hex to rgb hex
     * @param {string} colorValue - Color value
     * @returns {string} RGB hex color
     */
  convertToColorInputFormat(colorValue) {
    if (!colorValue) {return '#000000';}

    // If it's already a valid 6-digit hex, return as is
    if (/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
      return colorValue;
    }

    // If it's an 8-digit hex (with alpha), strip the alpha
    if (/^#[0-9A-Fa-f]{8}$/.test(colorValue)) {
      return colorValue.substring(0, 7);
    }

    // Fallback
    return '#000000';
  }

  /**
     * Reset all pickers to default values
     */
  resetToDefaults() {
    this.pickers.forEach((picker, id) => {
      // Use DataCollectionService to set value if available
      if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        window.DataCollectionService.setValue(picker.element.id, picker.originalValue, 'text');
      } else {
        picker.element.value = picker.originalValue;
      }
      this.updatePreview(id, picker.originalValue);
    });
  }
}

// ============================================================================
// GLOBAL INSTANCES
// ============================================================================

// Create global instances
window.ColorManager = new ColorManager();
window.ColorPickerManager = new ColorPickerManager();

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

/**
 * Load all colors for preferences page
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 */
window.loadColorsForPreferences = async function(userId = 1, profileId = 3) {
  try {
    window.Logger.info('🎨 Loading colors for preferences page...', { page: 'preferences-colors' });

    // Initialize color pickers
    window.ColorPickerManager.initializePickers();

    // Load all colors
    const colors = await window.ColorManager.loadAllColors(userId, profileId);

    // Load colors into pickers
    window.ColorPickerManager.loadColors(colors);

    window.Logger.info(`✅ Loaded ${Object.keys(colors, { page: 'preferences-colors' }).length} colors for preferences`);

  } catch (error) {
    window.Logger.error('❌ Error loading colors for preferences:', error, { page: 'preferences-colors' });
  }
};

/**
 * Reset all colors to defaults
 */
window.resetAllColorsToDefaults = function() {
  try {
    window.Logger.info('🎨 Resetting all colors to defaults...', { page: 'preferences-colors' });

    // Reset pickers
    window.ColorPickerManager.resetToDefaults();

    // Clear cache
    window.ColorManager.colorCache.clear();

    window.Logger.info('✅ Reset all colors to defaults', { page: 'preferences-colors' });

  } catch (error) {
    window.Logger.error('❌ Error resetting colors:', error, { page: 'preferences-colors' });
  }
};

/**
 * Get color by name
 * @param {string} colorName - Color name
 * @returns {string} Color value
 */
window.getColorPreference = function(colorName) {
  return window.ColorManager.getColor(colorName);
};

/**
 * Set color preference
 * @param {string} colorName - Color name
 * @param {string} colorValue - Color value
 */
window.setColorPreference = async function(colorName, colorValue) {
  return await window.ColorManager.saveColor(colorName, colorValue);
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.Logger.info('🎨 Color preferences system initialized', { page: 'preferences-colors' });
  });
} else {
  window.Logger.info('🎨 Color preferences system initialized', { page: 'preferences-colors' });
}

if (window.Logger && window.Logger.info) {
  window.Logger.debug('✅ preferences-colors.js loaded successfully', { page: 'preferences-colors' });
}
