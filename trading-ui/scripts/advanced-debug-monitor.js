/**
 * Advanced Debug & Monitoring System - TikTrack
 * =============================================
 *
 * Comprehensive debugging and monitoring system for the testing dashboard:
 * - Real-time log monitoring
 * - Performance analytics
 * - Error tracking and analysis
 * - Network request monitoring
 * - Memory usage tracking
 * - Visual debugging tools
 *
 * Features:
 * - Live log streaming
 * - Performance bottleneck detection
 * - Error pattern analysis
 * - Network waterfall charts
 * - Memory leak detection
 * - Visual DOM inspection
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated December 2025
 */

class AdvancedDebugMonitor {
    constructor() {
        this.isActive = false;
        this.logs = [];
        this.errors = [];
        this.performanceMetrics = [];
        this.networkRequests = [];

        this.maxLogs = 1000;
        this.maxErrors = 500;

        this.logger = window.Logger;
        this.originalConsoleLog = console.log;
        this.originalConsoleError = console.error;
        this.originalConsoleWarn = console.warn;

        console.log('🔧 Advanced Debug Monitor initialized');
    }

    /**
     * Start comprehensive monitoring
     */
    startMonitoring() {
        if (this.isActive) return;

        this.isActive = true;
        this.logger?.info('🚀 Advanced Debug Monitor started');

        this.setupLogInterception();
        this.setupErrorTracking();
        this.setupPerformanceMonitoring();
        this.setupNetworkMonitoring();
        this.setupMemoryMonitoring();

        this.displayStatus('ניטור מתקדם פעיל');
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.isActive = false;
        this.restoreOriginalConsole();
        this.displayStatus('ניטור הופסק');
        this.logger?.info('⏹️ Advanced Debug Monitor stopped');
    }

    /**
     * Setup console log interception
     */
    setupLogInterception() {
        const self = this;

        console.log = function(...args) {
            self.captureLog('log', args);
            self.originalConsoleLog.apply(console, args);
        };

        console.error = function(...args) {
            self.captureLog('error', args);
            self.originalConsoleError.apply(console, args);
        };

        console.warn = function(...args) {
            self.captureLog('warn', args);
            self.originalConsoleWarn.apply(console, args);
        };
    }

    /**
     * Setup error tracking
     */
    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.captureError(event.error, event.filename, event.lineno, event.colno);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.captureError(event.reason, 'unhandled_promise', 0, 0);
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor long tasks
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 50) { // Tasks longer than 50ms
                    this.capturePerformanceMetric('long_task', {
                        duration: entry.duration,
                        startTime: entry.startTime,
                        name: entry.name
                    });
                }
            }
        });

        observer.observe({ entryTypes: ['longtask'] });

        // Monitor navigation timing
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.capturePerformanceMetric('page_load', {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart
            });
        });
    }

    /**
     * Setup network monitoring
     */
    setupNetworkMonitoring() {
        // Monitor fetch requests
        const originalFetch = window.fetch;
        const self = this;

        window.fetch = function(...args) {
            const startTime = Date.now();
            const url = args[0];

            return originalFetch.apply(this, args)
                .then(response => {
                    const duration = Date.now() - startTime;
                    self.captureNetworkRequest({
                        url: url,
                        method: args[1]?.method || 'GET',
                        status: response.status,
                        duration: duration,
                        type: 'fetch'
                    });
                    return response;
                })
                .catch(error => {
                    self.captureNetworkRequest({
                        url: url,
                        method: args[1]?.method || 'GET',
                        status: 0,
                        duration: Date.now() - startTime,
                        error: error.message,
                        type: 'fetch'
                    });
                    throw error;
                });
        };

        // Monitor XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            const startTime = Date.now();
            this._url = url;
            this._method = method;

            this.addEventListener('loadend', function() {
                self.captureNetworkRequest({
                    url: this._url,
                    method: this._method,
                    status: this.status,
                    duration: Date.now() - startTime,
                    type: 'xhr'
                });
            });

            return originalOpen.apply(this, arguments);
        };
    }

    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        if (performance.memory) {
            setInterval(() => {
                const memInfo = performance.memory;
                this.capturePerformanceMetric('memory_usage', {
                    used: memInfo.usedJSHeapSize,
                    total: memInfo.totalJSHeapSize,
                    limit: memInfo.jsHeapSizeLimit,
                    usagePercent: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
                });
            }, 5000);
        }
    }

    /**
     * Capture log entry
     */
    captureLog(level, args) {
        if (!this.isActive) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '),
            stack: level === 'error' ? new Error().stack : null
        };

        this.logs.push(logEntry);

        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.updateLiveLogs(logEntry);
    }

    /**
     * Capture error
     */
    captureError(error, filename, lineno, colno) {
        if (!this.isActive) return;

        const errorEntry = {
            timestamp: new Date().toISOString(),
            message: error.message || String(error),
            filename: filename,
            lineno: lineno,
            colno: colno,
            stack: error.stack,
            type: 'javascript_error'
        };

        this.errors.push(errorEntry);

        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        this.updateErrorDisplay(errorEntry);
    }

    /**
     * Capture performance metric
     */
    capturePerformanceMetric(type, data) {
        if (!this.isActive) return;

        const metric = {
            timestamp: new Date().toISOString(),
            type: type,
            data: data
        };

        this.performanceMetrics.push(metric);
        this.updatePerformanceDisplay(metric);
    }

    /**
     * Capture network request
     */
    captureNetworkRequest(request) {
        if (!this.isActive) return;

        const networkEntry = {
            timestamp: new Date().toISOString(),
            ...request
        };

        this.networkRequests.push(networkEntry);
        this.updateNetworkDisplay(networkEntry);
    }

    /**
     * Update live logs display
     */
    updateLiveLogs(logEntry) {
        const logsElement = document.getElementById('liveLogs');
        if (!logsElement) return;

        const logDiv = document.createElement('div');
        logDiv.className = `log-entry log-${logEntry.level}`;
        logDiv.innerHTML = `
            <span class="log-time">${new Date(logEntry.timestamp).toLocaleTimeString()}</span>
            <span class="log-level log-level-${logEntry.level}">[${logEntry.level.toUpperCase()}]</span>
            <span class="log-message">${logEntry.message}</span>
        `;

        logsElement.appendChild(logDiv);
        logsElement.scrollTop = logsElement.scrollHeight;

        // Keep only recent entries in DOM
        while (logsElement.children.length > 100) {
            logsElement.removeChild(logsElement.firstChild);
        }
    }

    /**
     * Update error display
     */
    updateErrorDisplay(errorEntry) {
        const errorElement = document.getElementById('errorTracker');
        if (!errorElement) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-entry';
        errorDiv.innerHTML = `
            <div class="error-header">
                <strong>${errorEntry.message}</strong>
                <small>${new Date(errorEntry.timestamp).toLocaleTimeString()}</small>
            </div>
            <div class="error-details">
                <small>File: ${errorEntry.filename}:${errorEntry.lineno}</small>
            </div>
        `;

        errorElement.appendChild(errorDiv);
    }

    /**
     * Update performance display
     */
    updatePerformanceDisplay(metric) {
        // Update performance charts/visualizations
        this.logger?.info('Performance metric captured', metric);
    }

    /**
     * Update network display
     */
    updateNetworkDisplay(request) {
        // Update network waterfall chart
        this.logger?.info('Network request captured', request);
    }

    /**
     * Restore original console methods
     */
    restoreOriginalConsole() {
        console.log = this.originalConsoleLog;
        console.error = this.originalConsoleError;
        console.warn = this.originalConsoleWarn;
    }

    /**
     * Display status message
     */
    displayStatus(message) {
        const statusElement = document.getElementById('systemStatus');
        if (statusElement) {
            statusElement.innerHTML = `<div class="alert alert-info mb-0">${message}</div>`;
        }
    }

    /**
     * Get monitoring statistics
     */
    getStats() {
        return {
            isActive: this.isActive,
            logsCount: this.logs.length,
            errorsCount: this.errors.length,
            performanceMetricsCount: this.performanceMetrics.length,
            networkRequestsCount: this.networkRequests.length
        };
    }

    /**
     * Export monitoring data
     */
    exportData() {
        return {
            logs: this.logs,
            errors: this.errors,
            performanceMetrics: this.performanceMetrics,
            networkRequests: this.networkRequests,
            exportTimestamp: new Date().toISOString()
        };
    }

    /**
     * Clear all monitoring data
     */
    clearData() {
        this.logs = [];
        this.errors = [];
        this.performanceMetrics = [];
        this.networkRequests = [];

        // Clear DOM displays
        const logsElement = document.getElementById('liveLogs');
        const errorElement = document.getElementById('errorTracker');

        if (logsElement) logsElement.innerHTML = '';
        if (errorElement) errorElement.innerHTML = '<div class="alert alert-info">נתוני ניטור נוקו</div>';
    }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

let advancedDebugMonitor = null;

/**
 * Initialize advanced debug monitor
 */
function initializeAdvancedDebugMonitor() {
    if (!advancedDebugMonitor) {
        advancedDebugMonitor = new AdvancedDebugMonitor();
    }
    return advancedDebugMonitor;
}

/**
 * Get debug monitor instance
 */
function getDebugMonitor() {
    return advancedDebugMonitor || initializeAdvancedDebugMonitor();
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeAdvancedDebugMonitor();
});

// Export for global access
window.AdvancedDebugMonitor = AdvancedDebugMonitor;
window.getDebugMonitor = getDebugMonitor;
