/**
 * Technical Indicators Help Service
 * =================================
 * 
 * Provides help text and tooltips for technical indicators in Hebrew.
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */

(function() {
    'use strict';
    
    /**
     * Help text for technical indicators (in Hebrew)
     */
    const INDICATOR_HELP = {
        'ATR': 'טווח תנודה ממוצע - מדד לתנודתיות השוק. ערכים נמוכים מצביעים על תנודתיות נמוכה, ערכים גבוהים על תנודתיות גבוהה.',
        'Volatility': 'תנודתיות - מידת השינוי במחיר לאורך זמן. תנודתיות גבוהה מצביעה על שינויים גדולים במחיר.',
        '52W Range': 'טווח מחירים ל-52 שבועות אחרונים. מציג את המחיר הגבוה והנמוך ביותר בשנה האחרונה.',
        'Volume': 'נפח מסחר - כמות המניות שנסחרו בתקופה מסוימת. נפח גבוה מצביע על עניין רב במניה.',
        'RSI': 'מדד חוזק יחסי - מצביע על מצב קנייה/מכירה. ערכים מעל 70 מצביעים על קנייה מוגזמת, ערכים מתחת ל-30 על מכירה מוגזמת.',
        'MACD': 'ממוצע נע מתכנס-מתבדר - מדד מומנטום. מצביע על שינויי מגמה במחיר.',
        'תנודתיות': 'תנודתיות - מידת השינוי במחיר לאורך זמן. תנודתיות גבוהה מצביעה על שינויים גדולים במחיר.',
        'נפח': 'נפח מסחר - כמות המניות שנסחרו בתקופה מסוימת. נפח גבוה מצביע על עניין רב במניה.'
    };
    
    /**
     * Technical Indicators Help Service
     */
    window.TechnicalIndicatorsHelp = {
        /**
         * Get help text for an indicator
         * @param {string} indicatorName - Name of the indicator (e.g., 'ATR', 'Volatility')
         * @returns {string} Help text in Hebrew
         */
        getHelp: function(indicatorName) {
            return INDICATOR_HELP[indicatorName] || 'מידע לא זמין';
        },
        
        /**
         * Render help icon with tooltip
         * @param {string} indicatorName - Name of the indicator
         * @returns {string} HTML for help icon
         */
        renderHelpIcon: function(indicatorName) {
            const helpText = this.getHelp(indicatorName);
            // Use IconSystem if available, otherwise use simple icon
            let iconHtml = '';
            if (window.IconSystem && typeof window.IconSystem.renderIcon === 'function') {
                iconHtml = window.IconSystem.renderIcon('button', 'info-circle', {
                    size: 14,
                    class: 'help-icon'
                });
            } else {
                iconHtml = '<span class="help-icon" style="display: inline-block; width: 14px; height: 14px; cursor: help;">ℹ️</span>';
            }
            
            return `<span class="help-icon-wrapper" data-bs-toggle="tooltip" data-bs-placement="top" title="${helpText}" style="margin-right: 4px; cursor: help;">
                ${iconHtml}
            </span>`;
        },
        
        /**
         * Initialize tooltips for help icons
         * Should be called after DOM is ready
         */
        initializeTooltips: function() {
            if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Tooltip) {
                // Initialize Bootstrap tooltips
                const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltipElements.forEach(element => {
                    new window.bootstrap.Tooltip(element);
                });
            } else if (window.Logger) {
                window.Logger.debug('Bootstrap Tooltip not available - tooltips will not work', { page: 'technical-indicators-help' });
            }
        }
    };
    
    // Auto-initialize tooltips when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                window.TechnicalIndicatorsHelp.initializeTooltips();
            }, 1000); // Wait for Bootstrap to load
        });
    } else {
        setTimeout(() => {
            window.TechnicalIndicatorsHelp.initializeTooltips();
        }, 1000);
    }
    
})();

