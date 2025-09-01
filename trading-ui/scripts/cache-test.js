/**
 * Cache Test Page JavaScript - TikTrack
 * 
 * This script provides functionality for testing the advanced cache system,
 * including statistics, health checks, operations, and performance testing.
 * 
 * Author: TikTrack Development Team
 * Created: September 2025
 * Version: 1.0
 */

class CacheTester {
    constructor() {
        this.apiBaseUrl = '/api/v1/cache';
        this.logEntries = [];
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.loadInitialData();
        this.log('info', 'דף בדיקת Cache נטען בהצלחה');
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Cache statistics
        document.getElementById('refresh-stats').addEventListener('click', () => {
            this.loadCacheStats();
        });

        // Health check
        document.getElementById('health-check').addEventListener('click', () => {
            this.performHealthCheck();
        });

        // Cache operations
        document.getElementById('clear-cache').addEventListener('click', () => {
            this.clearCache();
        });

        document.getElementById('invalidate-tickers').addEventListener('click', () => {
            this.invalidateCacheByDependency('tickers');
        });

        document.getElementById('invalidate-trades').addEventListener('click', () => {
            this.invalidateCacheByDependency('trades');
        });

        // System info
        document.getElementById('get-info').addEventListener('click', () => {
            this.getSystemInfo();
        });

        // Performance testing
        document.getElementById('run-performance-test').addEventListener('click', () => {
            this.runPerformanceTest();
        });

        // Clear log
        document.getElementById('clear-log').addEventListener('click', () => {
            this.clearLog();
        });
    }

    /**
     * Load initial data when page loads
     */
    loadInitialData() {
        this.loadCacheStats();
        this.performHealthCheck();
        this.getSystemInfo();
    }

    /**
     * Load cache statistics
     */
    async loadCacheStats() {
        try {
            this.showLoading('cache-stats-content', 'טוען סטטיסטיקות...');
            
            const response = await fetch(`${this.apiBaseUrl}/stats`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.displayCacheStats(data.data);
                this.log('success', 'סטטיסטיקות Cache נטענו בהצלחה');
            } else {
                throw new Error(data.message || 'שגיאה בטעינת סטטיסטיקות');
            }
        } catch (error) {
            this.displayError('cache-stats-content', 'שגיאה בטעינת סטטיסטיקות', error);
            this.log('error', `שגיאה בטעינת סטטיסטיקות: ${error.message}`);
        }
    }

    /**
     * Display cache statistics
     */
    displayCacheStats(stats) {
        const content = document.getElementById('cache-stats-content');
        
        const html = `
            <div class="row">
                <div class="col-md-6">
                    <h6>סטטיסטיקות כלליות</h6>
                    <ul class="list-unstyled">
                        <li><strong>סה"כ רשומות:</strong> ${stats.total_entries}</li>
                        <li><strong>רשומות פגי תוקף:</strong> ${stats.expired_entries}</li>
                        <li><strong>אחוז פגיעות:</strong> ${stats.hit_rate_percent}%</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6>שימוש זיכרון</h6>
                    <ul class="list-unstyled">
                        <li><strong>זיכרון בשימוש:</strong> ${stats.estimated_memory_mb} MB</li>
                        <li><strong>זיכרון מקסימלי:</strong> ${stats.max_memory_mb} MB</li>
                        <li><strong>אחוז שימוש:</strong> ${stats.memory_usage_percent}%</li>
                    </ul>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6>סטטיסטיקות פעילות</h6>
                    <div class="row">
                        <div class="col-md-3">
                            <div class="text-center">
                                <div class="h4 text-primary">${stats.stats.hits}</div>
                                <small class="text-muted">פגיעות</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <div class="h4 text-warning">${stats.stats.misses}</div>
                                <small class="text-muted">החטאות</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <div class="h4 text-success">${stats.stats.sets}</div>
                                <small class="text-muted">הגדרות</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <div class="h4 text-danger">${stats.stats.invalidations}</div>
                                <small class="text-muted">ביטולים</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }

    /**
     * Perform health check
     */
    async performHealthCheck() {
        try {
            this.showLoading('health-check-content', 'בודק בריאות...');
            
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.displayHealthCheck(data.data);
                this.log('success', 'בדיקת בריאות הושלמה בהצלחה');
            } else {
                throw new Error(data.message || 'שגיאה בבדיקת בריאות');
            }
        } catch (error) {
            this.displayError('health-check-content', 'שגיאה בבדיקת בריאות', error);
            this.log('error', `שגיאה בבדיקת בריאות: ${error.message}`);
        }
    }

    /**
     * Display health check results
     */
    displayHealthCheck(health) {
        const content = document.getElementById('health-check-content');
        
        const statusClass = health.status === 'healthy' ? 'success' : 
                           health.status === 'warning' ? 'warning' : 'danger';
        
        const html = `
            <div class="text-center mb-3">
                <span class="badge bg-${statusClass} fs-6">${health.status.toUpperCase()}</span>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h6>בדיקות בריאות</h6>
                    <ul class="list-unstyled">
                        <li>
                            <i class="fas fa-${health.memory_ok ? 'check text-success' : 'times text-danger'}"></i>
                            זיכרון: ${health.memory_ok ? 'בסדר' : 'בעיה'}
                        </li>
                        <li>
                            <i class="fas fa-${health.hit_rate_ok ? 'check text-success' : 'times text-danger'}"></i>
                            אחוז פגיעות: ${health.hit_rate_ok ? 'בסדר' : 'בעיה'}
                        </li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6>פרטים</h6>
                    <ul class="list-unstyled">
                        <li><strong>זמן בדיקה:</strong> ${new Date(health.timestamp).toLocaleString('he-IL')}</li>
                        <li><strong>זיכרון בשימוש:</strong> ${health.stats.estimated_memory_mb} MB</li>
                        <li><strong>אחוז פגיעות:</strong> ${health.stats.hit_rate_percent}%</li>
                    </ul>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }

    /**
     * Clear all cache
     */
    async clearCache() {
        if (!confirm('האם אתה בטוח שברצונך לנקות את כל ה-Cache?')) {
            return;
        }

        try {
            this.log('info', 'מנקה Cache...');
            
            const response = await fetch(`${this.apiBaseUrl}/clear`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                this.log('success', 'Cache נוקה בהצלחה');
                this.loadCacheStats(); // Refresh stats
            } else {
                throw new Error(data.message || 'שגיאה בניקוי Cache');
            }
        } catch (error) {
            this.log('error', `שגיאה בניקוי Cache: ${error.message}`);
        }
    }

    /**
     * Invalidate cache by dependency
     */
    async invalidateCacheByDependency(dependency) {
        try {
            this.log('info', `מבטל Cache עבור: ${dependency}`);
            
            const response = await fetch(`${this.apiBaseUrl}/invalidate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dependency })
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                this.log('success', `Cache בוטל בהצלחה עבור: ${dependency}`);
                this.loadCacheStats(); // Refresh stats
            } else {
                throw new Error(data.message || 'שגיאה בביטול Cache');
            }
        } catch (error) {
            this.log('error', `שגיאה בביטול Cache: ${error.message}`);
        }
    }

    /**
     * Get system information
     */
    async getSystemInfo() {
        try {
            this.showLoading('system-info-content', 'טוען מידע...');
            
            const response = await fetch(`${this.apiBaseUrl}/info`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.displaySystemInfo(data.data);
                this.log('success', 'מידע על המערכת נטען בהצלחה');
            } else {
                throw new Error(data.message || 'שגיאה בטעינת מידע');
            }
        } catch (error) {
            this.displayError('system-info-content', 'שגיאה בטעינת מידע', error);
            this.log('error', `שגיאה בטעינת מידע: ${error.message}`);
        }
    }

    /**
     * Display system information
     */
    displaySystemInfo(info) {
        const content = document.getElementById('system-info-content');
        
        const html = `
            <div class="row">
                <div class="col-md-6">
                    <h6>פרטי המערכת</h6>
                    <ul class="list-unstyled">
                        <li><strong>סוג Cache:</strong> ${info.cache_type}</li>
                        <li><strong>גרסה:</strong> ${info.version}</li>
                        <li><strong>סטטוס:</strong> 
                            <span class="badge bg-${info.current_status === 'healthy' ? 'success' : 'warning'}">
                                ${info.current_status}
                            </span>
                        </li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6>תכונות</h6>
                    <ul class="list-unstyled">
                        ${info.features.map(feature => `<li><i class="fas fa-check text-success me-1"></i>${feature}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }

    /**
     * Run performance test
     */
    async runPerformanceTest() {
        const iterations = parseInt(document.getElementById('test-iterations').value);
        
        if (iterations < 1 || iterations > 1000) {
            this.log('error', 'מספר האיטרציות חייב להיות בין 1 ל-1000');
            return;
        }

        try {
            this.log('info', `מתחיל בדיקת ביצועים עם ${iterations} איטרציות...`);
            
            const results = document.getElementById('performance-results');
            results.innerHTML = '<div class="text-center"><div class="spinner-border text-primary"></div><p>מריץ בדיקה...</p></div>';
            
            // Simulate performance test by making multiple API calls
            const startTime = performance.now();
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < iterations; i++) {
                try {
                    const response = await fetch(`${this.apiBaseUrl}/stats`);
                    if (response.ok) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    errorCount++;
                }
                
                // Small delay to prevent overwhelming the server
                if (i % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const avgTime = totalTime / iterations;
            
            const html = `
                <h6>תוצאות בדיקת הביצועים</h6>
                <ul class="list-unstyled">
                    <li><strong>סה"כ זמן:</strong> ${totalTime.toFixed(2)} ms</li>
                    <li><strong>זמן ממוצע:</strong> ${avgTime.toFixed(2)} ms</li>
                    <li><strong>בקשות מוצלחות:</strong> ${successCount}</li>
                    <li><strong>בקשות שנכשלו:</strong> ${errorCount}</li>
                    <li><strong>אחוז הצלחה:</strong> ${((successCount / iterations) * 100).toFixed(1)}%</li>
                </ul>
            `;
            
            results.innerHTML = html;
            this.log('success', `בדיקת ביצועים הושלמה: ${iterations} איטרציות ב-${totalTime.toFixed(2)}ms`);
            
        } catch (error) {
            this.log('error', `שגיאה בבדיקת ביצועים: ${error.message}`);
            document.getElementById('performance-results').innerHTML = '<p class="text-danger">שגיאה בבדיקת הביצועים</p>';
        }
    }

    /**
     * Show loading state
     */
    showLoading(elementId, message) {
        const element = document.getElementById(elementId);
        element.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">טוען...</span>
                </div>
                <p class="mt-2">${message}</p>
            </div>
        `;
    }

    /**
     * Display error message
     */
    displayError(elementId, title, error) {
        const element = document.getElementById(elementId);
        element.innerHTML = `
            <div class="alert alert-danger">
                <h6>${title}</h6>
                <p class="mb-0">${error.message}</p>
            </div>
        `;
    }

    /**
     * Add log entry
     */
    log(level, message) {
        const timestamp = new Date().toLocaleTimeString('he-IL');
        const levelClass = {
            'info': 'text-info',
            'success': 'text-success',
            'warning': 'text-warning',
            'error': 'text-danger'
        }[level] || 'text-secondary';
        
        const logEntry = {
            timestamp,
            level,
            message,
            levelClass
        };
        
        this.logEntries.push(logEntry);
        this.updateLogDisplay();
        
        // Keep only last 100 log entries
        if (this.logEntries.length > 100) {
            this.logEntries = this.logEntries.slice(-100);
        }
    }

    /**
     * Update log display
     */
    updateLogDisplay() {
        const logContent = document.getElementById('log-content');
        const html = this.logEntries.map(entry => `
            <div class="log-entry">
                <span class="text-muted">[${entry.timestamp}]</span>
                <span class="${entry.levelClass}">[${entry.level.toUpperCase()}]</span>
                <span>${entry.message}</span>
            </div>
        `).join('');
        
        logContent.innerHTML = html;
        logContent.scrollTop = logContent.scrollHeight;
    }

    /**
     * Clear log
     */
    clearLog() {
        this.logEntries = [];
        this.updateLogDisplay();
        this.log('info', 'יומן נוקה');
    }
}

// Initialize the cache tester when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CacheTester();
});
