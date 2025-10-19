/**
 * Chart Export System - TikTrack Chart System
 * מערכת ייצוא גרפים - מערכת גרפים TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('📤 Chart Export System initialized');

class ChartExportSystem {
    constructor() {
        this.supportedFormats = ['png', 'jpg', 'pdf', 'svg'];
        this.qualityLevels = ['low', 'medium', 'high', 'ultra'];
        this.exportQueue = [];
        this.isExporting = false;
    }

    /**
     * Export a single chart
     * ייצוא גרף בודד
     */
    async exportChart(chartId, options = {}) {
        try {
            console.log(`📤 Exporting chart: ${chartId}`);
            
            // Validate chart exists
            if (!window.ChartSystem) {
                throw new Error('Chart system not available');
            }
            
            const chart = window.ChartSystem.getChart(chartId);
            if (!chart) {
                throw new Error(`Chart ${chartId} not found`);
            }
            
            // Get default options from preferences
            let defaultFormat = 'png';
            let defaultQuality = 'medium';
            let defaultResolution = '1x';
            let includeBackground = true;
            
            try {
                if (window.getPreference) {
                    defaultFormat = await window.getPreference('chartExportFormat') || 'png';
                    defaultQuality = await window.getPreference('chartExportQuality') || 'medium';
                    defaultResolution = await window.getPreference('chartExportResolution') || '1x';
                    const backgroundPref = await window.getPreference('chartExportBackground');
                    includeBackground = backgroundPref === 'true' || backgroundPref === true;
                }
            } catch (error) {
                console.log('Using fallback export settings');
            }
            
            // Set default options
            const exportOptions = {
                format: options.format || defaultFormat,
                quality: options.quality || defaultQuality,
                width: options.width || 800,
                height: options.height || 600,
                filename: options.filename || `chart_${chartId}_${Date.now()}`,
                resolution: options.resolution || defaultResolution,
                includeBackground: options.includeBackground !== undefined ? options.includeBackground : includeBackground,
                ...options
            };
            
            // Validate format
            if (!this.supportedFormats.includes(exportOptions.format)) {
                throw new Error(`Unsupported format: ${exportOptions.format}`);
            }
            
            // Validate quality
            if (!this.qualityLevels.includes(exportOptions.quality)) {
                throw new Error(`Unsupported quality: ${exportOptions.quality}`);
            }
            
            // Show future feature message
            const message = `ייצוא גרף ${chartId} בפורמט ${exportOptions.format} (${exportOptions.quality}) - תכונה עתידית`;
            
            if (typeof showLocalNotification === 'function') {
                showLocalNotification(message, 'info');
            } else {
                console.log(`📤 ${message}`);
            }
            
            // Simulate export process (future implementation)
            await this.simulateExport(exportOptions);
            
            console.log(`✅ Chart ${chartId} export completed`);
            
        } catch (error) {
            console.error(`❌ Error exporting chart ${chartId}:`, error);
            
            const errorMessage = `שגיאה בייצוא גרף ${chartId}: ${error.message}`;
            if (typeof showLocalNotification === 'function') {
                showLocalNotification(errorMessage, 'error');
            } else {
                console.error(errorMessage);
            }
        }
    }

    /**
     * Export multiple charts
     * ייצוא מספר גרפים
     */
    async exportMultipleCharts(chartIds, options = {}) {
        try {
            console.log(`📤 Exporting multiple charts: ${chartIds.join(', ')}`);
            
            if (!Array.isArray(chartIds) || chartIds.length === 0) {
                throw new Error('No charts specified for export');
            }
            
            // Set default options
            const exportOptions = {
                format: options.format || 'png',
                quality: options.quality || 'high',
                zip: options.zip || true,
                filename: options.filename || `charts_export_${Date.now()}`,
                ...options
            };
            
            // Show future feature message
            const message = `ייצוא ${chartIds.length} גרפים בפורמט ${exportOptions.format} (${exportOptions.quality}) - תכונה עתידית`;
            
            if (typeof showLocalNotification === 'function') {
                showLocalNotification(message, 'info');
            } else {
                console.log(`📤 ${message}`);
            }
            
            // Simulate export process
            await this.simulateExport(exportOptions);
            
            console.log(`✅ Multiple charts export completed`);
            
        } catch (error) {
            console.error('❌ Error exporting multiple charts:', error);
            
            const errorMessage = `שגיאה בייצוא מספר גרפים: ${error.message}`;
            if (typeof showLocalNotification === 'function') {
                showLocalNotification(errorMessage, 'error');
            } else {
                console.error(errorMessage);
            }
        }
    }

    /**
     * Export all active charts
     * ייצוא כל הגרפים הפעילים
     */
    async exportAllCharts(options = {}) {
        try {
            console.log('📤 Exporting all active charts');
            
            if (!window.ChartSystem) {
                throw new Error('Chart system not available');
            }
            
            const allCharts = window.ChartSystem.getAllCharts();
            const activeCharts = allCharts.filter(chart => chart && !chart.destroyed);
            
            if (activeCharts.length === 0) {
                const message = 'אין גרפים פעילים לייצוא';
                if (typeof showLocalNotification === 'function') {
                    showLocalNotification(message, 'warning');
                } else {
                    console.warn(message);
                }
                return;
            }
            
            const chartIds = activeCharts.map((chart, index) => chart.id || `chart_${index}`);
            
            await this.exportMultipleCharts(chartIds, options);
            
        } catch (error) {
            console.error('❌ Error exporting all charts:', error);
            
            const errorMessage = `שגיאה בייצוא כל הגרפים: ${error.message}`;
            if (typeof showLocalNotification === 'function') {
                showLocalNotification(errorMessage, 'error');
            } else {
                console.error(errorMessage);
            }
        }
    }

    /**
     * Get export status
     * קבלת סטטוס ייצוא
     */
    getExportStatus() {
        return {
            isExporting: this.isExporting,
            queueLength: this.exportQueue.length,
            supportedFormats: this.supportedFormats,
            qualityLevels: this.qualityLevels
        };
    }

    /**
     * Simulate export process (future implementation)
     * סימולציה של תהליך ייצוא (יישום עתידי)
     */
    async simulateExport(options) {
        return new Promise((resolve) => {
            // Simulate export delay
            setTimeout(() => {
                console.log(`📤 Export simulation completed: ${options.filename}.${options.format}`);
                resolve();
            }, 1000);
        });
    }

    /**
     * Get supported formats
     * קבלת פורמטים נתמכים
     */
    getSupportedFormats() {
        return this.supportedFormats;
    }

    /**
     * Get quality levels
     * קבלת רמות איכות
     */
    getQualityLevels() {
        return this.qualityLevels;
    }

    /**
     * Validate export options
     * אימות אפשרויות ייצוא
     */
    validateOptions(options) {
        const errors = [];
        
        if (options.format && !this.supportedFormats.includes(options.format)) {
            errors.push(`Unsupported format: ${options.format}`);
        }
        
        if (options.quality && !this.qualityLevels.includes(options.quality)) {
            errors.push(`Unsupported quality: ${options.quality}`);
        }
        
        if (options.width && (options.width < 100 || options.width > 4000)) {
            errors.push('Width must be between 100 and 4000 pixels');
        }
        
        if (options.height && (options.height < 100 || options.height > 4000)) {
            errors.push('Height must be between 100 and 4000 pixels');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Create global instance
window.ChartExportSystem = new ChartExportSystem();

// Export functions for backward compatibility
window.exportChart = (chartId, options) => window.ChartExportSystem.exportChart(chartId, options);
window.exportMultipleCharts = (chartIds, options) => window.ChartExportSystem.exportMultipleCharts(chartIds, options);
window.exportAllCharts = (options) => window.ChartExportSystem.exportAllCharts(options);

console.log('✅ Chart Export System ready');
