/**
 * Chart Theme System - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the chart theme system for TikTrack including:
 * - Theme management and registration
 * - Dynamic color integration
 * - Theme switching and application
 * - Color preference integration
 * - Performance optimization
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

console.log('🎨 Chart Theme System initialized');

/**
 * Chart Theme Manager class
 * @class ChartTheme
 */
class ChartTheme {
    constructor() {
        this.currentTheme = 'default';
        this.themes = new Map();
        this.dynamicColors = null;
        this.init();
    }

    /**
     * Initialize theme system
     * @function init
     * @returns {void}
     */
    init() {
        this.loadDefaultThemes();
        this.integrateWithColorSystem();
        
        // Listen for color preference changes
        if (window.addEventListener) {
            window.addEventListener('colorPreferencesUpdated', () => {
                this.updateDynamicColors();
            });
        }
        
        console.log('✅ Chart Theme System initialized');
    }

    /**
     * Load default themes
     * @function loadDefaultThemes
     * @returns {void}
     */
    loadDefaultThemes() {
        // Default theme
        this.registerTheme('default', {
            colors: {
                primary: 'var(--primary-color)',
                secondary: 'var(--secondary-color)',
                success: 'var(--success-color)',
                warning: 'var(--warning-color)',
                danger: 'var(--danger-color)',
                info: 'var(--info-color)',
                light: 'var(--light-color)',
                // dark removed - light mode only
            },
            fonts: {
                family: 'Noto Sans Hebrew, Arial, sans-serif',
                size: 12,
                weight: 'normal'
            },
            animations: {
                duration: 300,
                easing: 'easeInOutQuart'
            },
            grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                drawBorder: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }
        });

        /* ===== Light Mode Only - No Dark Mode ===== */
        /* Dark theme removed - only light mode supported */
    }

    /**
     * Register theme
     * @function registerTheme
     * @param {string} name - Theme name
     * @param {Object} config - Theme configuration
     * @returns {void}
     */
    registerTheme(name, config) {
        this.themes.set(name, config);
        console.log(`🎨 Theme '${name}' registered`);
    }

    /**
     * Get theme
     * @function getTheme
     * @param {string|null} name - Theme name
     * @returns {Object|null} Theme configuration
     */
    getTheme(name = null) {
        const themeName = name || this.currentTheme;
        const theme = this.themes.get(themeName);
        
        if (!theme) {
            console.warn(`⚠️ Theme '${themeName}' not found, using default`);
            return this.themes.get('default');
        }
        
        return theme;
    }

    /**
     * Set theme
     * @function setTheme
     * @param {string} name - Theme name
     * @returns {void}
     */
    setTheme(name) {
        if (!this.themes.has(name)) {
            console.warn(`⚠️ Theme '${name}' not found, falling back to default`);
            this.currentTheme = 'default';
        } else {
            this.currentTheme = name;
        }
        
        // Trigger theme update on all charts if ChartSystem is available
        if (window.ChartSystem) {
            window.ChartSystem.applyThemeToAllCharts();
        }
        
        console.log(`🎨 Theme set to '${this.currentTheme}'`);
    }

    /**
     * Integrate with color system
     * @function integrateWithColorSystem
     * @returns {void}
     */
    integrateWithColorSystem() {
        if (window.getColorPreferences) {
            // Get initial dynamic colors
            this.dynamicColors = window.getColorPreferences();
            console.log('🎨 Integrated with dynamic color system');
        } else {
            console.log('🎨 Dynamic color system not available, using CSS variables');
        }
    }

    /**
     * Get chart colors
     * @function getChartColors
     * @returns {Object} Chart colors
     */
    getChartColors() {
        if (this.dynamicColors) {
            return {
                primary: this.dynamicColors.primaryColor,
                chartPrimary: this.dynamicColors.chartPrimaryColor,
                secondary: this.dynamicColors.secondaryColor,
                success: this.dynamicColors.successColor,
                warning: this.dynamicColors.warningColor,
                danger: this.dynamicColors.dangerColor,
                info: this.dynamicColors.infoColor,
                light: this.dynamicColors.lightColor,
                // dark removed - light mode only
                chartBackground: this.dynamicColors.chartBackgroundColor,
                chartText: this.dynamicColors.chartTextColor,
                chartGrid: this.dynamicColors.chartGridColor,
                chartBorder: this.dynamicColors.chartBorderColor,
                chartPoint: this.dynamicColors.chartPointColor,
                chartAutoRefresh: this.dynamicColors.chartAutoRefresh,
                chartRefreshInterval: this.dynamicColors.chartRefreshInterval,
                chartQuality: this.dynamicColors.chartQuality,
                chartAnimations: this.dynamicColors.chartAnimations,
                chartInteractive: this.dynamicColors.chartInteractive,
                chartShowTooltips: this.dynamicColors.chartShowTooltips,
                chartExportFormat: this.dynamicColors.chartExportFormat,
                chartExportQuality: this.dynamicColors.chartExportQuality,
                chartExportResolution: this.dynamicColors.chartExportResolution,
                chartExportBackground: this.dynamicColors.chartExportBackground,
                // Entity colors for charts
                entityTradeColor: this.dynamicColors.entityTradeColor || this.dynamicColors.primaryColor,
                entityTradingAccountColor: this.dynamicColors.entityTradingAccountColor || this.dynamicColors.successColor
            };
        }
        
        // Fallback to CSS variables
        return {
            primary: 'var(--primary-color)',
            chartPrimary: 'var(--chart-primary-color)',
            secondary: 'var(--secondary-color)',
            success: 'var(--success-color)',
            warning: 'var(--warning-color)',
            danger: 'var(--danger-color)',
            info: 'var(--info-color)',
            light: 'var(--light-color)',
            // dark removed - light mode only
            chartBackground: 'var(--chart-background-color)',
            chartText: 'var(--chart-text-color)',
            chartGrid: 'var(--chart-grid-color)',
            chartBorder: 'var(--chart-border-color)',
            chartPoint: 'var(--chart-point-color)',
            chartAutoRefresh: 'var(--chart-auto-refresh)',
            chartRefreshInterval: 'var(--chart-refresh-interval)',
            chartQuality: 'var(--chart-quality)',
            chartAnimations: 'var(--chart-animations)',
            chartInteractive: 'var(--chart-interactive)',
            chartShowTooltips: 'var(--chart-show-tooltips)',
            chartExportFormat: 'var(--chart-export-format)',
            chartExportQuality: 'var(--chart-export-quality)',
            chartExportResolution: 'var(--chart-export-resolution)',
            chartExportBackground: 'var(--chart-export-background)',
            // Entity colors for charts
            entityTradeColor: 'var(--primary-color)',
            entityTradingAccountColor: 'var(--success-color)'
        };
    }

    /**
     * Get color
     * @function getColor
     * @param {string} colorName - Color name
     * @returns {string} Color value
     */
    getColor(colorName) {
        const colors = this.getChartColors();
        return colors[colorName] || colors.primary;
    }

    /**
     * Get chart color palette
     * @function getChartColorPalette
     * @returns {Array} Color palette
     */
    getChartColorPalette() {
        const colors = this.getChartColors();
        
        // If we have dynamic colors, return them directly
        if (this.dynamicColors) {
            return [
                this.dynamicColors.chartPrimaryColor || this.dynamicColors.primaryColor || '#1e40af',
                this.dynamicColors.successColor || '#28a745',
                this.dynamicColors.warningColor || '#ffc107',
                this.dynamicColors.dangerColor || '#dc3545',
                this.dynamicColors.infoColor || '#17a2b8',
                this.dynamicColors.secondaryColor || '#6c757d',
                this.dynamicColors.entityTradeColor || this.dynamicColors.primaryColor || '#26baac',
                this.dynamicColors.entityTradingAccountColor || this.dynamicColors.successColor || '#28a745'
            ];
        }
        
        // Fallback to hardcoded colors
        return [
            '#1e40af',  // כחול ראשי לגרפים
            '#28a745',  // ירוק הצלחה
            '#ffc107',  // צהוב אזהרה
            '#dc3545',  // אדום סכנה
            '#17a2b8',  // כחול מידע
            '#6c757d',  // אפור משני
            '#26baac',  // טורקיז טריידים
            '#28a745'   // ירוק חשבונות
        ];
    }

    /**
     * Get color with opacity
     * @function getColorWithOpacity
     * @param {string} colorName - Color name
     * @param {number} opacity - Opacity value
     * @returns {string} Color with opacity
     */
    getColorWithOpacity(colorName, opacity = 0.1) {
        const color = this.getColor(colorName);
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    }

    /* ===== Light Mode Only - No Dark Mode ===== */
    /* getDarkerColor function removed - only light mode supported */

    /**
     * Get lighter color
     * @function getLighterColor
     * @param {string} colorName - Color name
     * @param {number} amount - Lightness amount
     * @returns {string} Lighter color
     */
    getLighterColor(colorName, amount = 0.2) {
        const color = this.getColor(colorName);
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
            const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
            const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return color;
    }

    /**
     * Get chart options
     * @function getChartOptions
     * @param {string|null} themeName - Theme name
     * @returns {Object} Chart options
     */
    getChartOptions(themeName = null) {
        const theme = this.getTheme(themeName);
        const colors = this.getChartColors();
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: theme.fonts.family,
                            size: theme.fonts.size,
                            weight: theme.fonts.weight
                        },
                        color: colors.medium
                    }
                },
                tooltip: {
                    backgroundColor: theme.tooltip.backgroundColor,
                    titleColor: theme.tooltip.titleColor,
                    bodyColor: theme.tooltip.bodyColor,
                    borderColor: theme.tooltip.borderColor,
                    borderWidth: theme.tooltip.borderWidth,
                    titleFont: {
                        family: theme.fonts.family,
                        size: theme.fonts.size + 1,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: theme.fonts.family,
                        size: theme.fonts.size
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: theme.grid.color,
                        drawBorder: theme.grid.drawBorder
                    },
                    ticks: {
                        font: {
                            family: theme.fonts.family,
                            size: theme.fonts.size
                        },
                        color: colors.medium
                    }
                },
                y: {
                    grid: {
                        color: theme.grid.color,
                        drawBorder: theme.grid.drawBorder
                    },
                    ticks: {
                        font: {
                            family: theme.fonts.family,
                            size: theme.fonts.size
                        },
                        color: colors.medium
                    }
                }
            },
            animation: {
                duration: theme.animations.duration,
                easing: theme.animations.easing
            }
        };
    }

    /**
     * Update dynamic colors
     * @function updateDynamicColors
     * @returns {void}
     */
    updateDynamicColors() {
        if (window.getColorPreferences) {
            this.dynamicColors = window.getColorPreferences();
            console.log('🎨 Dynamic colors updated');
            
            // Update existing charts with new colors
            this.updateExistingCharts();
        }
    }
    
    /**
     * Update existing charts
     * @function updateExistingCharts
     * @returns {void}
     */
    updateExistingCharts() {
        if (window.ChartSystem) {
            const allCharts = window.ChartSystem.getAllCharts();
            allCharts.forEach(chart => {
                if (chart && !chart.destroyed) {
                    try {
                        // Update chart colors
                        const colors = this.getChartColors();
                        const colorPalette = this.getChartColorPalette();
                        
                        // Update dataset colors
                        if (chart.data && chart.data.datasets) {
                            chart.data.datasets.forEach((dataset, index) => {
                                if (dataset.backgroundColor) {
                                    if (Array.isArray(dataset.backgroundColor)) {
                                        dataset.backgroundColor = dataset.backgroundColor.map((_, i) => 
                                            colorPalette[i % colorPalette.length]
                                        );
                                    } else {
                                        dataset.backgroundColor = colorPalette[index % colorPalette.length];
                                    }
                                }
                                if (dataset.borderColor) {
                                    if (Array.isArray(dataset.borderColor)) {
                                        dataset.borderColor = dataset.borderColor.map((_, i) => 
                                            colorPalette[i % colorPalette.length]
                                        );
                                    } else {
                                        dataset.borderColor = colorPalette[index % colorPalette.length];
                                    }
                                }
                            });
                        }
                        
                        // Update chart options
                        const newOptions = this.getChartOptions();
                        chart.options = { ...chart.options, ...newOptions };
                        
                        chart.update();
                        console.log(`🎨 Updated chart ${chart.id || 'unknown'} with new colors`);
                    } catch (error) {
                        console.warn(`⚠️ Failed to update chart colors:`, error);
                    }
                }
            });
        }
    }

    /**
     * Get available themes
     * @function getAvailableThemes
     * @returns {Array} Available themes
     */
    getAvailableThemes() {
        return Array.from(this.themes.keys());
    }
}

// ===== GLOBAL EXPORTS =====
window.ChartTheme = ChartTheme;

// Create global instance
window.ChartTheme = new ChartTheme();

// Export convenience functions
window.getChartColor = (colorName) => window.ChartTheme.getColor(colorName);
window.getChartTheme = (themeName) => window.ChartTheme.getTheme(themeName);
window.setChartTheme = (themeName) => window.ChartTheme.setTheme(themeName);
window.getChartColorPalette = () => window.ChartTheme.getChartColorPalette();
window.getChartColorWithOpacity = (colorName, opacity) => window.ChartTheme.getColorWithOpacity(colorName, opacity);
/* getChartDarkerColor removed - only light mode supported */
window.getChartLighterColor = (colorName, amount) => window.ChartTheme.getLighterColor(colorName, amount);

console.log('✅ Chart Theme System ready');

