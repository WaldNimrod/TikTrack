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

console.log('🎨 Loading preferences-colors.js v1.0.0...');

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
            'chart': ['chartBackgroundColor', 'chartBorderColor', 'chartGridColor', 'chartPointColor', 'chartPrimaryColor', 'chartTextColor'],
            'entity': ['entityAlertColor', 'entityAlertColorDark', 'entityAlertColorLight', 'entityInfoColor', 'entityInfoColorDark', 'entityInfoColorLight'],
            'status': ['statusOpenColor', 'statusClosedColor', 'statusCancelledColor', 'statusPendingColor'],
            'value': ['valuePositiveColor', 'valueNegativeColor', 'valueNeutralColor', 'valuePositiveColorLight', 'valuePositiveColorDark', 'valueNegativeColorLight', 'valueNegativeColorDark', 'valueNeutralColorLight', 'valueNeutralColorDark'],
            'theme': ['primaryColor', 'secondaryColor', 'successColor', 'dangerColor', 'warningColor', 'infoColor'],
            'ui': ['backgroundColor', 'textColor', 'borderColor', 'shadowColor', 'highlightColor']
        };
        
        this.defaultColors = {
            // Chart colors
            'chartBackgroundColor': '#ffffff',
            'chartBorderColor': '#e0e0e0',
            'chartGridColor': '#f0f0f0',
            'chartPointColor': '#007bff',
            'chartPrimaryColor': '#007bff',
            'chartTextColor': '#333333',
            
            // Entity colors
            'entityAlertColor': '#dc3545',
            'entityAlertColorDark': '#c82333',
            'entityAlertColorLight': '#f8d7da',
            'entityInfoColor': '#17a2b8',
            'entityInfoColorDark': '#138496',
            'entityInfoColorLight': '#d1ecf1',
            
            // Status colors
            'statusOpenColor': '#28a745',
            'statusClosedColor': '#6c757d',
            'statusCancelledColor': '#dc3545',
            'statusPendingColor': '#ffc107',
            
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
            'primaryColor': '#007bff',
            'secondaryColor': '#6c757d',
            'successColor': '#28a745',
            'dangerColor': '#dc3545',
            'warningColor': '#ffc107',
            'infoColor': '#17a2b8',
            
            // UI colors
            'backgroundColor': '#ffffff',
            'textColor': '#333333',
            'borderColor': '#dee2e6',
            'shadowColor': '#000000',
            'highlightColor': '#007bff'
        };
    }
    
    /**
     * Load all color preferences
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} Color preferences object
     */
    async loadAllColors(userId = 1, profileId = 3) {
        try {
            console.log('🎨 Loading all color preferences...');
            
            // Get all color preference names
            const colorNames = Object.keys(this.defaultColors);
            
            // Load colors in batches to avoid overwhelming the server
            const batchSize = 10;
            const batches = [];
            for (let i = 0; i < colorNames.length; i += batchSize) {
                batches.push(colorNames.slice(i, i + batchSize));
            }
            
            const allColors = {};
            
            for (const batch of batches) {
                const batchPromises = batch.map(async (colorName) => {
                    try {
                        const response = await fetch(`/api/preferences/user/preference?name=${colorName}&user_id=${userId}&profile_id=${profileId}`);
                        if (response.ok) {
                            const result = await response.json();
                            return { name: colorName, value: result.data?.value || this.defaultColors[colorName] };
                        }
                    } catch (error) {
                        console.warn(`⚠️ Failed to load color ${colorName}:`, error);
                    }
                    return { name: colorName, value: this.defaultColors[colorName] };
                });
                
                const batchResults = await Promise.all(batchPromises);
                batchResults.forEach(({ name, value }) => {
                    allColors[name] = value;
                    this.colorCache.set(name, value);
                });
            }
            
            console.log(`✅ Loaded ${Object.keys(allColors).length} color preferences`);
            return allColors;
            
        } catch (error) {
            console.error('❌ Error loading colors:', error);
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
    async loadColorGroup(groupName, userId = 1, profileId = 3) {
        const groupColors = this.colorGroups[groupName] || [];
        if (groupColors.length === 0) {
            console.warn(`⚠️ Unknown color group: ${groupName}`);
            return {};
        }
        
        const groupData = {};
        for (const colorName of groupColors) {
            try {
                const response = await fetch(`/api/preferences/user/preference?name=${colorName}&user_id=${userId}&profile_id=${profileId}`);
                if (response.ok) {
                    const result = await response.json();
                    groupData[colorName] = result.data?.value || this.defaultColors[colorName];
                } else {
                    groupData[colorName] = this.defaultColors[colorName];
                }
            } catch (error) {
                console.warn(`⚠️ Failed to load color ${colorName}:`, error);
                groupData[colorName] = this.defaultColors[colorName];
            }
        }
        
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
    async saveColor(colorName, colorValue, userId = 1, profileId = 3) {
        try {
            // Validate color format
            if (!this.validateColorFormat(colorValue)) {
                throw new Error(`Invalid color format: ${colorValue}`);
            }
            
            const response = await fetch('/api/preferences/user/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    preference_name: colorName,
                    value: colorValue,
                    user_id: userId,
                    profile_id: profileId
                })
            });
            
            if (response.ok) {
                // Update cache
                this.colorCache.set(colorName, colorValue);
                
                // Sync with ColorSchemeSystem if available
                if (window.ColorSchemeSystem) {
                    await this.syncWithColorScheme(colorName, colorValue);
                }
                
                console.log(`✅ Saved color ${colorName}: ${colorValue}`);
                return true;
            } else {
                const error = await response.text();
                throw new Error(`Save failed: ${error}`);
            }
            
        } catch (error) {
            console.error(`❌ Error saving color ${colorName}:`, error);
            return false;
        }
    }
    
    /**
     * Validate color format
     * @param {string} color - Color value
     * @returns {boolean} Is valid
     */
    validateColorFormat(color) {
        if (!color || typeof color !== 'string') return false;
        
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
            if (window.ColorSchemeSystem && window.ColorSchemeSystem.updateColor) {
                await window.ColorSchemeSystem.updateColor(colorName, colorValue);
                console.log(`🎨 Synced ${colorName} with ColorSchemeSystem`);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to sync ${colorName} with ColorSchemeSystem:`, error);
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
        console.log(`🎨 Found ${colorPickers.length} color pickers`);
        
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
            colorKey: colorKey,
            originalValue: picker.value
        });
        
        // Add event listeners
        picker.addEventListener('change', (e) => this.onColorChange(id, e.target.value));
        picker.addEventListener('input', (e) => this.onColorInput(id, e.target.value));
        
        console.log(`🎨 Registered color picker: ${id} (key: ${colorKey})`);
    }
    
    /**
     * Handle color change
     * @param {string} pickerId - Picker ID
     * @param {string} colorValue - New color value
     */
    onColorChange(pickerId, colorValue) {
        const picker = this.pickers.get(pickerId);
        if (!picker) return;
        
        console.log(`🎨 Color changed: ${pickerId} = ${colorValue}`);
        
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
        if (!picker) return;
        
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
        if (!picker) return;
        
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
                    console.log(`✅ Saved color ${colorKey}: ${colorValue}`);
                } else {
                    console.error(`❌ Failed to save color ${colorKey}`);
                }
            } else {
                console.warn('⚠️ ColorManager not available');
            }
        } catch (error) {
            console.error(`❌ Error saving color ${colorKey}:`, error);
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
                picker.element.value = colorValue;
                this.updatePreview(picker.element.id, colorValue);
            }
        });
    }
    
    /**
     * Reset all pickers to default values
     */
    resetToDefaults() {
        this.pickers.forEach((picker, id) => {
            picker.element.value = picker.originalValue;
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
        console.log('🎨 Loading colors for preferences page...');
        
        // Initialize color pickers
        window.ColorPickerManager.initializePickers();
        
        // Load all colors
        const colors = await window.ColorManager.loadAllColors(userId, profileId);
        
        // Load colors into pickers
        window.ColorPickerManager.loadColors(colors);
        
        console.log(`✅ Loaded ${Object.keys(colors).length} colors for preferences`);
        
    } catch (error) {
        console.error('❌ Error loading colors for preferences:', error);
    }
};

/**
 * Save all color preferences
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 */
window.saveAllColorPreferences = async function(userId = 1, profileId = 3) {
    try {
        console.log('🎨 Saving all color preferences...');
        
        const colorPickers = document.querySelectorAll('input[type="color"]');
        let savedCount = 0;
        let errorCount = 0;
        
        for (const picker of colorPickers) {
            const colorKey = picker.getAttribute('data-color-key') || picker.id;
            const colorValue = picker.value;
            
            try {
                const success = await window.ColorManager.saveColor(colorKey, colorValue, userId, profileId);
                if (success) {
                    savedCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`❌ Error saving color ${colorKey}:`, error);
                errorCount++;
            }
        }
        
        console.log(`✅ Saved ${savedCount} colors, ${errorCount} errors`);
        
        return {
            saved: savedCount,
            errors: errorCount,
            total: colorPickers.length
        };
        
    } catch (error) {
        console.error('❌ Error saving all color preferences:', error);
        return { saved: 0, errors: 1, total: 0 };
    }
};

/**
 * Reset all colors to defaults
 */
window.resetAllColorsToDefaults = function() {
    try {
        console.log('🎨 Resetting all colors to defaults...');
        
        // Reset pickers
        window.ColorPickerManager.resetToDefaults();
        
        // Clear cache
        window.ColorManager.colorCache.clear();
        
        console.log('✅ Reset all colors to defaults');
        
    } catch (error) {
        console.error('❌ Error resetting colors:', error);
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
        console.log('🎨 Color preferences system initialized');
    });
} else {
    console.log('🎨 Color preferences system initialized');
}

console.log('✅ preferences-colors.js loaded successfully');
