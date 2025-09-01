/**
 * Cache Test System - TikTrack
 * Comprehensive cache testing and monitoring system
 *
 * Features:
 * - Real-time cache status monitoring
 * - Cache operations testing
 * - Performance monitoring
 * - Logging and debugging
 *
 * Author: TikTrack Development Team
 * Created: September 2025
 * Version: 1.0
 */

class CacheTestSystem {
  constructor() {
    this.logs = [];
    this.performanceMetrics = {};
    this.isMonitoring = false;
    this.monitoringInterval = null;

    this.initializeEventListeners();
    this.loadInitialData();
    this.startPerformanceMonitoring();
  }

  /**
     * Initialize event listeners for all buttons and controls
     */
  initializeEventListeners() {
    // Cache operations
    document.getElementById('clear-cache-btn')?.addEventListener('click', () => this.clearCache());
    document.getElementById('health-check-btn')?.addEventListener('click', () => this.performHealthCheck());
    document.getElementById('stats-btn')?.addEventListener('click', () => this.getCacheStats());
    document.getElementById('refresh-btn')?.addEventListener('click', () => this.refreshAllData());

    // Cache testing
    document.getElementById('set-cache-btn')?.addEventListener('click', () => this.testSetCache());
    document.getElementById('get-cache-btn')?.addEventListener('click', () => this.testGetCache());
    document.getElementById('delete-cache-btn')?.addEventListener('click', () => this.testDeleteCache());

    // Logs and debugging
    document.getElementById('clear-logs-btn')?.addEventListener('click', () => this.clearLogs());
    document.getElementById('export-logs-btn')?.addEventListener('click', () => this.exportLogs());
  }

  /**
     * Load initial data when page loads
     */
  async loadInitialData() {
    try {
      await Promise.all([
        this.updateSystemStatus(),
        this.updatePerformanceStats(),
        this.updateMemoryUsage(),
        this.updateHitRate(),
        this.updateCacheStats(),
        this.updateResponseTimes(),
        this.updatePerformanceAnalysis(),
      ]);

      this.log('Initial data loaded successfully', 'info');
    } catch (error) {
      this.log(`Failed to load initial data: ${error.message}`, 'error');
    }
  }

  /**
     * Update system status display
     */
  async updateSystemStatus() {
    try {
      const response = await fetch('/api/v1/cache/status');
      const data = await response.json();

      if (data.status === 'success') {
        const statusElement = document.getElementById('system-status');
        const statusData = data.data;

        statusElement.innerHTML = `
                    <div class="status-indicator ${statusData.status}">
                        <i class="fas fa-check-circle"></i>
                        ${this.getStatusText(statusData.status)}
                    </div>
                    <div class="status-details">
                        <small>גרסה: ${statusData.version}</small><br>
                        <small>בריאות: ${this.getHealthText(statusData.health)}</small>
                    </div>
                `;

        statusElement.className = `status-indicator ${statusData.status}`;
      }
    } catch (error) {
      this.log(`Failed to update system status: ${error.message}`, 'error');
      this.updateSystemStatusError();
    }
  }

  /**
     * Update performance statistics display
     */
  async updatePerformanceStats() {
    try {
      const response = await fetch('/api/v1/cache/stats');
      const data = await response.json();

      if (data.status === 'success') {
        const statsElement = document.getElementById('performance-stats');
        const stats = data.data;

        statsElement.innerHTML = `
                    <div class="stat-value">${stats.total_entries}</div>
                    <div class="stat-label">רשומות Cache</div>
                    <div class="stat-value">${stats.hit_rate_percent.toFixed(1)}%</div>
                    <div class="stat-label">Hit Rate</div>
                `;
      }
    } catch (error) {
      this.log(`Failed to update performance stats: ${error.message}`, 'error');
    }
  }

  /**
     * Update memory usage display
     */
  async updateMemoryUsage() {
    try {
      const response = await fetch('/api/v1/cache/stats');
      const data = await response.json();

      if (data.status === 'success') {
        const memoryElement = document.getElementById('memory-usage');
        const stats = data.data;
        const usagePercent = stats.memory_usage_percent;

        memoryElement.innerHTML = `
                    <div class="memory-text">${stats.estimated_memory_mb.toFixed(2)} MB</div>
                    <div class="memory-bar">
                        <div class="memory-fill" style="width: ${usagePercent}%"></div>
                    </div>
                    <div class="stat-label">${usagePercent.toFixed(1)}% מ-${stats.max_memory_mb} MB</div>
                `;
      }
    } catch (error) {
      this.log(`Failed to update memory usage: ${error.message}`, 'error');
    }
  }

  /**
     * Update hit rate display
     */
  async updateHitRate() {
    try {
      const response = await fetch('/api/v1/cache/stats');
      const data = await response.json();

      if (data.status === 'success') {
        const hitRateElement = document.getElementById('hit-rate');
        const stats = data.data;
        const hitRate = stats.hit_rate_percent;

        // Calculate the angle for the conic gradient
        const angle = hitRate / 100 * 360;

        hitRateElement.innerHTML = `
                    <div class="hit-rate-circle" style="background: conic-gradient(#28a745 0deg, #28a745 ${angle}deg, #e9ecef ${angle}deg);">
                        <div class="hit-rate-text">${hitRate.toFixed(1)}%</div>
                    </div>
                    <div class="stat-label">Hit Rate</div>
                `;
      }
    } catch (error) {
      this.log(`Failed to update hit rate: ${error.message}`, 'error');
    }
  }

  /**
     * Update cache statistics display
     */
  async updateCacheStats() {
    try {
      const response = await fetch('/api/v1/cache/stats');
      const data = await response.json();

      if (data.status === 'success') {
        const statsElement = document.getElementById('cache-stats');
        const stats = data.data;

        statsElement.innerHTML = `
                    <div class="performance-data">
                        <strong>סטטיסטיקות Cache:</strong><br>
                        • רשומות: ${stats.total_entries}<br>
                        • Hit Rate: ${stats.hit_rate_percent.toFixed(1)}%<br>
                        • זיכרון: ${stats.estimated_memory_mb.toFixed(2)} MB<br>
                        • רשומות פגות: ${stats.expired_entries}<br>
                        • Hits: ${stats.stats.hits}<br>
                        • Misses: ${stats.stats.misses}<br>
                        • מחיקות: ${stats.stats.deletes}<br>
                        • Invalidations: ${stats.stats.invalidations}
                    </div>
                `;
      }
    } catch (error) {
      this.log(`Failed to update cache stats: ${error.message}`, 'error');
    }
  }

  /**
     * Update response times display
     */
  async updateResponseTimes() {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/v1/cache/health');
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const responseElement = document.getElementById('response-times');
      responseElement.innerHTML = `
                <div class="performance-data">
                    <strong>זמני תגובה:</strong><br>
                    • Cache Health: ${responseTime.toFixed(2)} ms<br>
                    • ממוצע: ${this.calculateAverageResponseTime('cache_health', responseTime)} ms<br>
                    • מינימום: ${this.getMinResponseTime('cache_health')} ms<br>
                    • מקסימום: ${this.getMaxResponseTime('cache_health')} ms
                </div>
            `;

      this.recordResponseTime('cache_health', responseTime);
    } catch (error) {
      this.log(`Failed to update response times: ${error.message}`, 'error');
    }
  }

  /**
     * Update performance analysis display
     */
  async updatePerformanceAnalysis() {
    try {
      const response = await fetch('/api/v1/cache/stats');
      const data = await response.json();

      if (data.status === 'success') {
        const analysisElement = document.getElementById('performance-analysis');
        const stats = data.data;

        const analysis = this.analyzePerformance(stats);

        analysisElement.innerHTML = `
                    <div class="performance-data">
                        <strong>ניתוח ביצועים:</strong><br>
                        • איכות: ${analysis.quality}<br>
                        • יעילות: ${analysis.efficiency}<br>
                        • המלצות: ${analysis.recommendations.join('<br>• ')}
                    </div>
                `;
      }
    } catch (error) {
      this.log(`Failed to update performance analysis: ${error.message}`, 'error');
    }
  }

  /**
     * Clear all cache entries
     */
  async clearCache() {
    try {
      const button = document.getElementById('clear-cache-btn');
      const originalText = button.innerHTML;

      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מנקה...';
      button.disabled = true;

      const response = await fetch('/api/v1/cache/clear', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.status === 'success') {
        this.log('Cache cleared successfully', 'success');
        this.showNotification('Cache נוקה בהצלחה', 'success');

        // Refresh all data
        await this.refreshAllData();
      } else {
        throw new Error(data.message || 'Failed to clear cache');
      }
    } catch (error) {
      this.log(`Failed to clear cache: ${error.message}`, 'error');
      this.showNotification('שגיאה בניקוי Cache', 'error');
    } finally {
      const button = document.getElementById('clear-cache-btn');
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }

  /**
     * Perform health check
     */
  async performHealthCheck() {
    try {
      const button = document.getElementById('health-check-btn');
      const originalText = button.innerHTML;

      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> בודק...';
      button.disabled = true;

      const response = await fetch('/api/v1/cache/health');
      const data = await response.json();

      if (data.status === 'success') {
        this.log('Health check completed', 'info');
        this.showNotification('בדיקת בריאות הושלמה', 'success');

        // Update displays
        await this.updateSystemStatus();
        await this.updateMemoryUsage();
        await this.updateHitRate();
      } else {
        throw new Error(data.message || 'Health check failed');
      }
    } catch (error) {
      this.log(`Health check failed: ${error.message}`, 'error');
      this.showNotification('בדיקת בריאות נכשלה', 'error');
    } finally {
      const button = document.getElementById('health-check-btn');
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }

  /**
     * Get cache statistics
     */
  async getCacheStats() {
    try {
      const button = document.getElementById('stats-btn');
      const originalText = button.innerHTML;

      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> טוען...';
      button.disabled = true;

      const response = await fetch('/api/v1/cache/stats');
      const data = await response.json();

      if (data.status === 'success') {
        this.log('Cache statistics retrieved', 'info');
        this.showNotification('סטטיסטיקות Cache נטענו', 'success');

        // Update displays
        await this.updatePerformanceStats();
        await this.updateCacheStats();
      } else {
        throw new Error(data.message || 'Failed to get cache stats');
      }
    } catch (error) {
      this.log(`Failed to get cache stats: ${error.message}`, 'error');
      this.showNotification('שגיאה בטעינת סטטיסטיקות', 'error');
    } finally {
      const button = document.getElementById('stats-btn');
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }

  /**
     * Refresh all data
     */
  async refreshAllData() {
    try {
      const button = document.getElementById('refresh-btn');
      const originalText = button.innerHTML;

      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מרענן...';
      button.disabled = true;

      await Promise.all([
        this.updateSystemStatus(),
        this.updatePerformanceStats(),
        this.updateMemoryUsage(),
        this.updateHitRate(),
        this.updateCacheStats(),
        this.updateResponseTimes(),
        this.updatePerformanceAnalysis(),
      ]);

      this.log('All data refreshed successfully', 'success');
      this.showNotification('כל הנתונים רועננו', 'success');
    } catch (error) {
      this.log(`Failed to refresh data: ${error.message}`, 'error');
      this.showNotification('שגיאה ברענון נתונים', 'error');
    } finally {
      const button = document.getElementById('refresh-btn');
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }

  /**
     * Test setting cache entry
     */
  async testSetCache() {
    const key = document.getElementById('test-key').value;
    const value = document.getElementById('test-value').value;
    const ttl = document.getElementById('test-ttl').value;

    if (!key || !value) {
      this.showNotification('נא למלא מפתח וערך', 'warning');
      return;
    }

    try {
      this.log(`Testing cache set: ${key} = ${value} (TTL: ${ttl}s)`, 'info');

      // Simulate cache set operation
      const testOutput = document.getElementById('test-output');
      testOutput.innerHTML = `
                <div class="test-result success">
                    <strong>✅ Cache Set Test:</strong><br>
                    מפתח: ${key}<br>
                    ערך: ${value}<br>
                    TTL: ${ttl} שניות<br>
                    זמן: ${new Date().toLocaleTimeString()}<br>
                    <small>הערה: זהו סימולציה - השרת האמיתי לא תומך ב-set operations</small>
                </div>
            `;

      this.log('Cache set test completed (simulated)', 'success');
    } catch (error) {
      this.log(`Cache set test failed: ${error.message}`, 'error');
      this.updateTestOutput('error', 'Cache set test failed');
    }
  }

  /**
     * Test getting cache entry
     */
  async testGetCache() {
    const key = document.getElementById('test-key').value;

    if (!key) {
      this.showNotification('נא למלא מפתח', 'warning');
      return;
    }

    try {
      this.log(`Testing cache get: ${key}`, 'info');

      // Simulate cache get operation
      const testOutput = document.getElementById('test-output');
      testOutput.innerHTML = `
                <div class="test-result info">
                    <strong>🔍 Cache Get Test:</strong><br>
                    מפתח: ${key}<br>
                    תוצאה: לא נמצא (Cache miss)<br>
                    זמן: ${new Date().toLocaleTimeString()}<br>
                    <small>הערה: זהו סימולציה - השרת האמיתי לא תומך ב-get operations</small>
                </div>
            `;

      this.log('Cache get test completed (simulated)', 'success');
    } catch (error) {
      this.log(`Cache get test failed: ${error.message}`, 'error');
      this.updateTestOutput('error', 'Cache get test failed');
    }
  }

  /**
     * Test deleting cache entry
     */
  async testDeleteCache() {
    const key = document.getElementById('test-key').value;

    if (!key) {
      this.showNotification('נא למלא מפתח', 'warning');
      return;
    }

    try {
      this.log(`Testing cache delete: ${key}`, 'info');

      // Simulate cache delete operation
      const testOutput = document.getElementById('test-output');
      testOutput.innerHTML = `
                <div class="test-result warning">
                    <strong>🗑️ Cache Delete Test:</strong><br>
                    מפתח: ${key}<br>
                    תוצאה: נמחק בהצלחה<br>
                    זמן: ${new Date().toLocaleTimeString()}<br>
                    <small>הערה: זהו סימולציה - השרת האמיתי לא תומך ב-delete operations</small>
                </div>
            `;

      this.log('Cache delete test completed (simulated)', 'success');
    } catch (error) {
      this.log(`Cache delete test failed: ${error.message}`, 'error');
      this.updateTestOutput('error', 'Cache delete test failed');
    }
  }

  /**
     * Start performance monitoring
     */
  startPerformanceMonitoring() {
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.updateResponseTimes();
    }, 5000); // Update every 5 seconds

    this.log('Performance monitoring started', 'info');
  }

  /**
     * Stop performance monitoring
     */
  stopPerformanceMonitoring() {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.log('Performance monitoring stopped', 'info');
  }

  /**
     * Record response time for performance tracking
     */
  recordResponseTime(operation, time) {
    if (!this.performanceMetrics[operation]) {
      this.performanceMetrics[operation] = [];
    }

    this.performanceMetrics[operation].push(time);

    // Keep only last 100 measurements
    if (this.performanceMetrics[operation].length > 100) {
      this.performanceMetrics[operation].shift();
    }
  }

  /**
     * Calculate average response time
     */
  calculateAverageResponseTime(operation, currentTime) {
    const times = this.performanceMetrics[operation] || [];
    if (times.length === 0) {return currentTime;}

    const sum = times.reduce((acc, time) => acc + time, 0);
    return (sum / times.length).toFixed(2);
  }

  /**
     * Get minimum response time
     */
  getMinResponseTime(operation) {
    const times = this.performanceMetrics[operation] || [];
    if (times.length === 0) {return 'N/A';}

    return Math.min(...times).toFixed(2);
  }

  /**
     * Get maximum response time
     */
  getMaxResponseTime(operation) {
    const times = this.performanceMetrics[operation] || [];
    if (times.length === 0) {return 'N/A';}

    return Math.max(...times).toFixed(2);
  }

  /**
     * Analyze performance and provide recommendations
     */
  analyzePerformance(stats) {
    const hitRate = stats.hit_rate_percent;
    const memoryUsage = stats.memory_usage_percent;
    const totalEntries = stats.total_entries;

    let quality = 'טוב';
    let efficiency = 'יעיל';
    const recommendations = [];

    // Analyze hit rate
    if (hitRate < 50) {
      quality = 'נמוך';
      recommendations.push('Hit rate נמוך - שקול הגדלת cache size');
    } else if (hitRate < 80) {
      quality = 'בינוני';
      recommendations.push('Hit rate בינוני - יש מקום לשיפור');
    } else {
      quality = 'מעולה';
    }

    // Analyze memory usage
    if (memoryUsage > 80) {
      efficiency = 'לא יעיל';
      recommendations.push('שימוש זיכרון גבוה - שקול ניקוי cache');
    } else if (memoryUsage > 60) {
      efficiency = 'בינוני';
      recommendations.push('שימוש זיכרון בינוני - עקוב אחרי השימוש');
    }

    // Analyze cache entries
    if (totalEntries === 0) {
      recommendations.push('אין רשומות cache - המערכת לא פעילה');
    } else if (totalEntries < 10) {
      recommendations.push('מעט רשומות cache - בדוק אם המערכת עובדת כראוי');
    }

    if (recommendations.length === 0) {
      recommendations.push('המערכת עובדת בצורה אופטימלית');
    }

    return { quality, efficiency, recommendations };
  }

  /**
     * Clear all logs
     */
  clearLogs() {
    this.logs = [];
    const logsContent = document.getElementById('logs-content');
    logsContent.innerHTML = '<p class="placeholder">הלוגים נוקו</p>';
    this.log('Logs cleared', 'info');
  }

  /**
     * Export logs to file
     */
  exportLogs() {
    try {
      const logData = this.logs.map(log =>
        `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`,
      ).join('\n');

      const blob = new Blob([logData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cache-test-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.log('Logs exported successfully', 'success');
      this.showNotification('הלוגים יוצאו בהצלחה', 'success');
    } catch (error) {
      this.log(`Failed to export logs: ${error.message}`, 'error');
      this.showNotification('שגיאה בייצוא לוגים', 'error');
    }
  }

  /**
     * Add log entry
     */
  log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { message, level, timestamp };

    this.logs.push(logEntry);

    // Update logs display
    const logsContent = document.getElementById('logs-content');
    if (logsContent) {
      const logElement = document.createElement('div');
      logElement.className = `log-entry log-${level}`;
      logElement.innerHTML = `<span class="log-time">[${timestamp}]</span> <span class="log-level">[${level.toUpperCase()}]</span> ${message}`;

      logsContent.appendChild(logElement);
      logsContent.scrollTop = logsContent.scrollHeight;

      // Keep only last 100 log entries
      while (logsContent.children.length > 100) {
        logsContent.removeChild(logsContent.firstChild);
      }
    }

    // Also log to console
    console.log(`[CacheTest] [${level.toUpperCase()}] ${message}`);
  }

  /**
     * Update test output
     */
  updateTestOutput(type, message) {
    const testOutput = document.getElementById('test-output');
    testOutput.innerHTML = `<div class="test-result ${type}">${message}</div>`;
  }

  /**
     * Show notification
     */
  showNotification(message, type = 'info') {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback notification
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  /**
     * Get status text in Hebrew
     */
  getStatusText(status) {
    const statusMap = {
      'active': 'פעיל',
      'degraded': 'מושפל',
      'inactive': 'לא פעיל',
    };
    return statusMap[status] || status;
  }

  /**
     * Get health text in Hebrew
     */
  getHealthText(health) {
    const healthMap = {
      'healthy': 'בריא',
      'warning': 'אזהרה',
      'error': 'שגיאה',
    };
    return healthMap[health] || health;
  }

  /**
     * Update system status error display
     */
  updateSystemStatusError() {
    const statusElement = document.getElementById('system-status');
    statusElement.innerHTML = `
            <div class="status-indicator error">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בטעינת מצב
            </div>
        `;
    statusElement.className = 'status-indicator error';
  }
}

// Initialize the cache test system when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.cacheTestSystem = new CacheTestSystem();
});

// Export for global access
window.CacheTestSystem = CacheTestSystem;
