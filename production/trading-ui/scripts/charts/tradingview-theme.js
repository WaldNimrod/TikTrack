/**
 * TradingView Theme System - TikTrack
 * ====================================
 * 
 * Theme management for TradingView Lightweight Charts
 * Integrates with system colors and preferences
 * 
 * @version 1.0.0
 * @created January 27, 2025
 * @author TikTrack Development Team
 * 
 * Documentation: See documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/
 */

(function() {
    'use strict';

    /**
     * Helper function to get CSS variable value
     * @param {string} variableName - CSS variable name
     * @param {string} fallback - Fallback value
     * @returns {string} CSS variable value or fallback
     */
    function getCSSVariableValue(variableName, fallback) {
        try {
            if (typeof window !== 'undefined' && window.getComputedStyle) {
                const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
                if (value) {
                    const trimmed = value.trim();
                    if (trimmed) {
                        return trimmed;
                    }
                }
            }
        } catch (error) {
            window.Logger?.warn('⚠️ Failed to read CSS variable', { variableName, error }, { page: 'tradingview-theme' });
        }
        return fallback;
    }

    /**
     * Convert hex color to RGBA
     * @param {string} hex - Hex color (#RRGGBB or #RRGGBBAA)
     * @param {number} alpha - Alpha value (0-1)
     * @returns {string} RGBA color string
     */
    function hexToRgba(hex, alpha = 1) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            return hex; // Return original if not valid hex
        }
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * TradingView Theme Manager
     * @class TradingViewTheme
     */
    class TradingViewTheme {
        constructor() {
            this.currentTheme = 'default';
            this.preferences = null;
            this.init();
        }

        /**
         * Initialize theme system
         * @function init
         * @returns {void}
         */
        async init() {
            // Load preferences
            await this.loadPreferences();
            
            // Listen for preference changes
            if (window.addEventListener) {
                window.addEventListener('preferences:updated', () => {
                    this.loadPreferences();
                });
            }
            
            console.log('✅ TradingView Theme System initialized');
        }

        /**
         * Load preferences
         * @function loadPreferences
         * @returns {Promise<void>}
         */
        async loadPreferences() {
            try {
                if (window.PreferencesData) {
                    // Load chart preferences (using camelCase names as per database)
                    const chartQuality = await window.PreferencesData.loadPreference({
                        preferenceName: 'chartQuality',
                        force: false
                    });
                    
                    const chartAnimations = await window.PreferencesData.loadPreference({
                        preferenceName: 'chartAnimations',
                        force: false
                    });
                    
                    this.preferences = {
                        quality: chartQuality?.value || 'medium',
                        animations: chartAnimations?.value !== false
                    };
                }
            } catch (error) {
                // Silently fallback to defaults - preferences may not exist yet
                this.preferences = {
                    quality: 'medium',
                    animations: true
                };
            }
        }

        /**
         * Get theme options for chart
         * @function getThemeOptions
         * @param {string} themeName - Theme name (optional)
         * @returns {Object} Chart options
         */
        getThemeOptions(themeName = null) {
            const theme = themeName || this.currentTheme;
            
            // Get colors from CSS variables
            const backgroundColor = getCSSVariableValue('--card-background', '#ffffff');
            const textColor = getCSSVariableValue('--text-color', '#000000');
            const primaryColor = getCSSVariableValue('--primary-color', '#26baac');
            const successColor = getCSSVariableValue('--success-color', '#28a745');
            const warningColor = getCSSVariableValue('--warning-color', '#ffc107');
            const dangerColor = getCSSVariableValue('--danger-color', '#dc3545');
            const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
            const gridColor = getCSSVariableValue('--border-color', '#e0e0e0');
            const mutedColor = getCSSVariableValue('--muted-color', '#6c757d');

            const options = {
                layout: {
                    background: { 
                        type: 0, // ColorType.Solid = 0
                        color: backgroundColor 
                    },
                    textColor: textColor,
                },
                grid: {
                    vertLines: {
                        color: gridColor,
                        style: 0, // Solid
                        visible: true,
                    },
                    horzLines: {
                        color: gridColor,
                        style: 0, // Solid
                        visible: true,
                    },
                },
                crosshair: {
                    mode: 0, // Normal
                },
                rightPriceScale: {
                    borderColor: gridColor,
                },
                timeScale: {
                    borderColor: gridColor,
                },
            };
            
            // Remove undefined/null values to avoid errors
            Object.keys(options).forEach(key => {
                if (options[key] === undefined || options[key] === null) {
                    delete options[key];
                }
            });

            // Apply preferences
            if (this.preferences) {
                if (!this.preferences.animations) {
                    // Disable animations if preference is off
                    options.layout.animation = false;
                }
            }

            return options;
        }

        /**
         * Get color for series
         * @function getSeriesColor
         * @param {string} type - Color type (primary, success, warning, danger, info)
         * @param {number} alpha - Alpha value (0-1)
         * @returns {string} Color string
         */
        getSeriesColor(type = 'primary', alpha = 1) {
            const colorMap = {
                primary: getCSSVariableValue('--primary-color', '#26baac'),
                success: getCSSVariableValue('--success-color', '#28a745'),
                warning: getCSSVariableValue('--warning-color', '#ffc107'),
                danger: getCSSVariableValue('--danger-color', '#dc3545'),
                info: getCSSVariableValue('--info-color', '#17a2b8'),
                muted: getCSSVariableValue('--muted-color', '#6c757d'),
            };

            const color = colorMap[type] || colorMap.primary;
            
            if (alpha < 1) {
                return hexToRgba(color, alpha);
            }
            
            return color;
        }

        /**
         * Get chart colors object
         * @function getChartColors
         * @returns {Object} Colors object
         */
        getChartColors() {
            return {
                primary: this.getSeriesColor('primary'),
                success: this.getSeriesColor('success'),
                warning: this.getSeriesColor('warning'),
                danger: this.getSeriesColor('danger'),
                info: this.getSeriesColor('info'),
                muted: this.getSeriesColor('muted'),
                background: getCSSVariableValue('--card-background', '#ffffff'),
                text: getCSSVariableValue('--text-color', '#000000'),
                grid: getCSSVariableValue('--border-color', '#e0e0e0'),
            };
        }
    }

    // Create global instance
    window.TradingViewTheme = new TradingViewTheme();
    
    console.log('🎨 TradingView Theme System loaded');
})();

