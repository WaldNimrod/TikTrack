/**
 * Console Checker for Final UI Standardization Testing
 * כלי בדיקת קונסולה אוטומטי לתהליך בדיקות סופי
 * 
 * תכונות:
 * - תפיסת console logs בזמן אמת
 * - זיהוי שגיאות, אזהרות והודעות מיותרות
 * - דוח מפורט עם המלצות
 * - אינטגרציה עם Logger Service
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @date 28 בינואר 2025
 */

(function() {
    'use strict';

    /**
     * Console Checker Class
     */
    class ConsoleChecker {
        constructor() {
            this.originalConsole = {
                log: console.log,
                error: console.error,
                warn: console.warn,
                info: console.info,
                debug: console.debug
            };
            
            this.capturedLogs = {
                errors: [],
                warnings: [],
                logs: [],
                info: [],
                debug: []
            };
            
            this.isCapturing = false;
            this.startTime = null;
            this.pageName = this.getPageName();
            this.allowedLogs = new Set([
                // הודעות לגיטימיות מהמערכת
                '📊 Loading',
                '✅',
                '🔍',
                '🚀',
                '📦',
                '🎯'
            ]);
            
            this.init();
        }
        
        /**
         * Get current page name
         */
        getPageName() {
            const path = window.location.pathname;
            const filename = path.split('/').pop();
            return filename.replace('.html', '') || 'index';
        }
        
        /**
         * Initialize checker
         */
        init() {
            // Wait for page to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.startCapture(), 1000);
                });
            } else {
                setTimeout(() => this.startCapture(), 1000);
            }
        }
        
        /**
         * Start capturing console logs
         */
        startCapture() {
            if (this.isCapturing) return;
            
            this.isCapturing = true;
            this.startTime = new Date();
            
            // Override console methods
            const self = this;
            
            console.log = function(...args) {
                self.captureLog('log', args);
                self.originalConsole.log.apply(console, args);
            };
            
            console.error = function(...args) {
                self.captureLog('error', args);
                self.originalConsole.error.apply(console, args);
            };
            
            console.warn = function(...args) {
                self.captureLog('warn', args);
                self.originalConsole.warn.apply(console, args);
            };
            
            console.info = function(...args) {
                self.captureLog('info', args);
                self.originalConsole.info.apply(console, args);
            };
            
            console.debug = function(...args) {
                self.captureLog('debug', args);
                self.originalConsole.debug.apply(console, args);
            };
            
            // Log that we started capturing
            if (window.Logger && window.Logger.info) {
                window.Logger.info('Console Checker started capturing logs', {
                    page: this.pageName
                });
            }
        }
        
        /**
         * Capture console log
         */
        captureLog(level, args) {
            const message = this.formatMessage(args);
            const timestamp = new Date().toISOString();
            const stack = this.getStackTrace();
            
            const logEntry = {
                timestamp,
                message,
                level,
                stack,
                isAllowed: this.isAllowedLog(message)
            };
            
            if (level === 'error') {
                this.capturedLogs.errors.push(logEntry);
            } else if (level === 'warn') {
                this.capturedLogs.warnings.push(logEntry);
            } else if (level === 'log') {
                this.capturedLogs.logs.push(logEntry);
            } else if (level === 'info') {
                this.capturedLogs.info.push(logEntry);
            } else if (level === 'debug') {
                this.capturedLogs.debug.push(logEntry);
            }
        }
        
        /**
         * Format message from args
         */
        formatMessage(args) {
            return args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    } catch (e) {
                        return String(arg);
                    }
                }
                return String(arg);
            }).join(' ');
        }
        
        /**
         * Get stack trace
         */
        getStackTrace() {
            try {
                throw new Error();
            } catch (e) {
                return e.stack || '';
            }
        }
        
        /**
         * Check if log is allowed (legitimate system message)
         */
        isAllowedLog(message) {
            for (const allowed of this.allowedLogs) {
                if (message.includes(allowed)) {
                    return true;
                }
            }
            return false;
        }
        
        /**
         * Stop capturing and restore original console
         */
        stopCapture() {
            if (!this.isCapturing) return;
            
            this.isCapturing = false;
            
            // Restore original console methods
            console.log = this.originalConsole.log;
            console.error = this.originalConsole.error;
            console.warn = this.originalConsole.warn;
            console.info = this.originalConsole.info;
            console.debug = this.originalConsole.debug;
        }
        
        /**
         * Get report
         */
        getReport() {
            const endTime = new Date();
            const duration = endTime - this.startTime;
            
            const totalErrors = this.capturedLogs.errors.length;
            const totalWarnings = this.capturedLogs.warnings.length;
            const totalLogs = this.capturedLogs.logs.length;
            const totalInfo = this.capturedLogs.info.length;
            
            // Filter out allowed logs
            const criticalErrors = this.capturedLogs.errors.filter(log => !log.isAllowed);
            const criticalWarnings = this.capturedLogs.warnings.filter(log => !log.isAllowed);
            const unnecessaryLogs = this.capturedLogs.logs.filter(log => !log.isAllowed);
            
            const report = {
                pageName: this.pageName,
                timestamp: endTime.toISOString(),
                duration: duration,
                summary: {
                    totalErrors: criticalErrors.length,
                    totalWarnings: criticalWarnings.length,
                    totalUnnecessaryLogs: unnecessaryLogs.length,
                    totalCaptured: totalErrors + totalWarnings + totalLogs + totalInfo,
                    status: criticalErrors.length === 0 && criticalWarnings.length === 0 ? 'clean' : 'issues'
                },
                errors: criticalErrors,
                warnings: criticalWarnings,
                unnecessaryLogs: unnecessaryLogs,
                recommendations: this.generateRecommendations(criticalErrors, criticalWarnings, unnecessaryLogs)
            };
            
            return report;
        }
        
        /**
         * Generate recommendations
         */
        generateRecommendations(errors, warnings, logs) {
            const recommendations = [];
            
            if (errors.length > 0) {
                recommendations.push({
                    severity: 'critical',
                    message: `${errors.length} שגיאות נמצאו - יש לתקן לפני המשך`,
                    action: 'תיקון שגיאות קוד'
                });
            }
            
            if (warnings.length > 0) {
                recommendations.push({
                    severity: 'warning',
                    message: `${warnings.length} אזהרות נמצאו - מומלץ לבדוק`,
                    action: 'בדיקת אזהרות ותיקון'
                });
            }
            
            if (logs.length > 0) {
                recommendations.push({
                    severity: 'info',
                    message: `${logs.length} הודעות console מיותרות - מומלץ להחליף ב-Logger Service`,
                    action: 'החלפת console.log ב-Logger Service'
                });
            }
            
            if (errors.length === 0 && warnings.length === 0 && logs.length === 0) {
                recommendations.push({
                    severity: 'success',
                    message: 'קונסולה נקייה - אין בעיות',
                    action: 'המשיך לשלב הבא'
                });
            }
            
            return recommendations;
        }
        
        /**
         * Print report to console
         */
        printReport() {
            const report = this.getReport();
            
            console.group(`📊 Console Checker Report - ${report.pageName}`);
            console.log(`⏱️ Duration: ${(report.duration / 1000).toFixed(2)}s`);
            console.log(`📈 Status: ${report.summary.status === 'clean' ? '✅ CLEAN' : '❌ ISSUES'}`);
            console.log(`🔴 Errors: ${report.summary.totalErrors}`);
            console.log(`⚠️ Warnings: ${report.summary.totalWarnings}`);
            console.log(`📝 Unnecessary Logs: ${report.summary.totalUnnecessaryLogs}`);
            
            if (report.errors.length > 0) {
                console.group('🔴 Errors:');
                report.errors.forEach((error, index) => {
                    console.error(`${index + 1}. [${error.timestamp}] ${error.message}`);
                });
                console.groupEnd();
            }
            
            if (report.warnings.length > 0) {
                console.group('⚠️ Warnings:');
                report.warnings.forEach((warning, index) => {
                    console.warn(`${index + 1}. [${warning.timestamp}] ${warning.message}`);
                });
                console.groupEnd();
            }
            
            if (report.recommendations.length > 0) {
                console.group('💡 Recommendations:');
                report.recommendations.forEach((rec, index) => {
                    const icon = rec.severity === 'critical' ? '🔴' : 
                                rec.severity === 'warning' ? '⚠️' : 
                                rec.severity === 'success' ? '✅' : 'ℹ️';
                    console.log(`${icon} ${rec.message}`);
                    console.log(`   Action: ${rec.action}`);
                });
                console.groupEnd();
            }
            
            console.groupEnd();
            
            return report;
        }
        
        /**
         * Get report as JSON
         */
        getReportJSON() {
            return JSON.stringify(this.getReport(), null, 2);
        }
        
        /**
         * Export report to file (trigger download)
         */
        exportReport() {
            const report = this.getReportJSON();
            const blob = new Blob([report], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `console-checker-report-${this.pageName}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
    
    // Make it available globally
    window.ConsoleChecker = ConsoleChecker;
    
    // Auto-initialize if in browser
    if (typeof window !== 'undefined') {
        window.consoleCheckerInstance = new ConsoleChecker();
        
        // Make it accessible via global function
        window.runConsoleCheck = function() {
            if (window.consoleCheckerInstance) {
                window.consoleCheckerInstance.stopCapture();
                return window.consoleCheckerInstance.printReport();
            }
            return null;
        };
        
        window.getConsoleCheckReport = function() {
            if (window.consoleCheckerInstance) {
                window.consoleCheckerInstance.stopCapture();
                return window.consoleCheckerInstance.getReport();
            }
            return null;
        };
        
        window.exportConsoleCheckReport = function() {
            if (window.consoleCheckerInstance) {
                window.consoleCheckerInstance.stopCapture();
                window.consoleCheckerInstance.exportReport();
            }
        };
    }
    
})();


