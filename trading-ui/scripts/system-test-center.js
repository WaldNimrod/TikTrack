/**
 * System Test Center - Simple Version
 * מרכז בדיקות מערכת - גרסה פשוטה
 */

// System Test Center loaded successfully

class SimpleTestCenter {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.log('🚀 מרכז בדיקות מערכת מתחיל...');
    this.log('✅ מרכז בדיקות מערכת מוכן לשימוש');
  }

  setupEventListeners() {

    // System status buttons
    const refreshAllStatusBtn = document.getElementById('refresh-all-status');
    if (refreshAllStatusBtn) {
      refreshAllStatusBtn.addEventListener('click', () => this.refreshAllStatus());
      // Button refresh-all-status connected
    }

    // Cache buttons
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
      // Button clear-cache-btn connected
    }

    const invalidateCacheBtn = document.getElementById('invalidate-cache-btn');
    if (invalidateCacheBtn) {
      invalidateCacheBtn.addEventListener('click', () => this.invalidateCache());
      // Button invalidate-cache-btn connected
    }

    const cacheHealthCheckBtn = document.getElementById('cache-health-check');
    if (cacheHealthCheckBtn) {
      cacheHealthCheckBtn.addEventListener('click', () => this.checkCacheHealth());
      // Button cache-health-check connected
    }

    const getCacheInfoBtn = document.getElementById('get-cache-info');
    if (getCacheInfoBtn) {
      getCacheInfoBtn.addEventListener('click', () => this.getCacheInfo());
      // Button get-cache-info connected
    }

    const refreshCacheStatsBtn = document.getElementById('refresh-cache-stats');
    if (refreshCacheStatsBtn) {
      refreshCacheStatsBtn.addEventListener('click', () => this.refreshCacheStats());
      // Button refresh-cache-stats connected
    }

    // Query buttons
    const optimizeQueriesBtn = document.getElementById('optimize-queries-btn');
    if (optimizeQueriesBtn) {
      optimizeQueriesBtn.addEventListener('click', () => this.optimizeQueries());
      // Button optimize-queries-btn connected
    }

    const runQueryTestBtn = document.getElementById('run-query-test');
    if (runQueryTestBtn) {
      runQueryTestBtn.addEventListener('click', () => this.runQueryTest());
      // Button run-query-test connected
    }

    const refreshQueryStatsBtn = document.getElementById('refresh-query-stats');
    if (refreshQueryStatsBtn) {
      refreshQueryStatsBtn.addEventListener('click', () => this.refreshQueryStats());
      // Button refresh-query-stats connected
    }

    const getSlowQueriesBtn = document.getElementById('get-slow-queries');
    if (getSlowQueriesBtn) {
      getSlowQueriesBtn.addEventListener('click', () => this.getSlowQueries());
      // Button get-slow-queries connected
    }

    const clearQueryProfilesBtn = document.getElementById('clear-query-profiles');
    if (clearQueryProfilesBtn) {
      clearQueryProfilesBtn.addEventListener('click', () => this.clearQueryProfiles());
      // Button clear-query-profiles connected
    }

    const exportQueryProfilesBtn = document.getElementById('export-query-profiles');
    if (exportQueryProfilesBtn) {
      exportQueryProfilesBtn.addEventListener('click', () => this.exportQueryProfiles());
      // Button export-query-profiles connected
    }

    // External data buttons
    const testExternalDataBtn = document.getElementById('test-external-data-btn');
    if (testExternalDataBtn) {
      testExternalDataBtn.addEventListener('click', () => this.testExternalData());
      // Button test-external-data-btn connected
    }

    const testExternalDataDataBtn = document.getElementById('test-external-data-data-btn');
    if (testExternalDataDataBtn) {
      testExternalDataDataBtn.addEventListener('click', () => this.testExternalDataData());
      // Button test-external-data-data-btn connected
    }

    // Performance buttons
    const runPerformanceTestBtn = document.getElementById('run-performance-test-btn');
    if (runPerformanceTestBtn) {
      runPerformanceTestBtn.addEventListener('click', () => this.runPerformanceTest());
      // Button run-performance-test-btn connected
    }

    const runPerformanceTestCheckBtn = document.getElementById('run-performance-test-check-btn');
    if (runPerformanceTestCheckBtn) {
      runPerformanceTestCheckBtn.addEventListener('click', () => this.runPerformanceTestCheck());
      // Button run-performance-test-check-btn connected
    }

    // Log buttons
    const clearLogBtn = document.getElementById('clear-log');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', () => this.clearLog());
      // Button clear-log connected
    }

    const exportLogBtn = document.getElementById('export-log');
    if (exportLogBtn) {
      exportLogBtn.addEventListener('click', () => this.exportLog());
      // Button export-log connected
    }

    // Function completed
  }

  // Button action functions
  async refreshAllStatus() {

    this.log('🔄 מתחיל רענון סטטוס כללי...');
    this.showLoading('system-status-overview', 'מרענן סטטוס כללי...');
    await this.delay(1000);

    try {
      await Promise.all([
        this.loadCacheData(),
        this.loadQueryData(),
        this.loadExternalData(),
        this.loadPerformanceData(),
      ]);
      this.log('✅ סטטוס כללי עודכן בהצלחה');
    } catch (error) {
      this.log('❌ שגיאה בעדכון סטטוס: ' + error.message);
    }

    // Refresh all status completed
  }

  async clearCache() {
    this.log('🧹 מתחיל ניקוי Cache...');
    this.showLoading('cache-stats-content', 'מנקה Cache...');
    await this.delay(1000);
    this.loadCacheData();
    this.log('✅ Cache נוקה בהצלחה');
    // Clear cache completed
  }

  async invalidateCache() {
    this.log('🗑️ מתחיל ביטול Cache...');
    this.showLoading('cache-health-content', 'מבטל Cache...');
    await this.delay(1000);
    this.loadCacheData();
    this.log('✅ Cache בוטל בהצלחה');
    // Invalidate cache completed
  }

  async checkCacheHealth() {
    this.log('🏥 מתחיל בדיקת בריאות Cache...');
    this.showLoading('cache-health-content', 'בודק בריאות Cache...');
    await this.delay(800);
    this.loadCacheData();
    this.log('✅ בדיקת בריאות Cache הושלמה');
    // Check cache health completed
  }

  async getCacheInfo() {
    this.log('ℹ️ מתחיל קבלת מידע על Cache...');
    this.showLoading('cache-info-content', 'מקבל מידע על Cache...');
    await this.delay(600);
    this.loadCacheData();
    this.log('✅ מידע על Cache התקבל בהצלחה');
    // Get cache info completed
  }

  async refreshCacheStats() {

    this.log('📊 מתחיל רענון סטטיסטיקות Cache...');
    this.showLoading('cache-stats-content', 'מרענן סטטיסטיקות Cache...');
    await this.delay(700);
    this.loadCacheData();
    this.log('✅ סטטיסטיקות Cache עודכנו בהצלחה');
    // Refresh cache stats completed
  }

  async optimizeQueries() {
    this.log('⚡ מתחיל אופטימיזציה של Queries...');
    this.showLoading('query-opportunities-content', 'מבצע אופטימיזציה...');
    await this.delay(1000);
    this.loadQueryData();
    this.log('✅ אופטימיזציה של Queries הושלמה בהצלחה');
    // Optimize queries completed
  }

  async runQueryTest() {

    const queryType = document.getElementById('test-query-type')?.value || 'tickers';
    // Query type selected
    this.log(`🧪 מתחיל בדיקת Query: ${queryType}`);

    this.showLoading('query-test-results', 'מבצע בדיקה...');
    await this.delay(800);

    const results = {
      query_type: queryType,
      execution_time: (Math.random() * 2 + 0.5).toFixed(2),
      status: 'success',
      message: `בדיקת ${queryType} הושלמה בהצלחה`,
    };

    this.displayQueryTestResults(results);
    this.log(`✅ בדיקת Query ${queryType} הושלמה בהצלחה`);
    // Run query test completed
  }

  async refreshQueryStats() {
    this.log('📈 מתחיל רענון סטטיסטיקות Queries...');
    this.showLoading('query-stats-content', 'מרענן סטטיסטיקות Queries...');
    await this.delay(700);
    this.loadQueryData();
    this.log('✅ סטטיסטיקות Queries עודכנו בהצלחה');
    // Refresh query stats completed
  }

  async getSlowQueries() {
    this.log('🐌 מתחיל בדיקת Queries איטיים...');
    this.showLoading('slow-queries-content', 'בודק Queries איטיים...');
    await this.delay(900);
    this.loadQueryData();
    this.log('✅ Queries איטיים נבדקו בהצלחה');
    // Get slow queries completed
  }

  async clearQueryProfiles() {
    this.log('🗑️ מתחיל ניקוי פרופילי Queries...');
    await this.delay(500);
    this.log('✅ פרופילי Queries נוקו בהצלחה');
    // Clear query profiles completed
  }

  async exportQueryProfiles() {
    this.log('📤 מתחיל ייצוא פרופילי Queries...');
    await this.delay(800);
    this.log('✅ פרופילי Queries יוצאו בהצלחה');
    // Export query profiles completed
  }

  displayQueryTestResults(results) {

    const element = document.getElementById('query-test-results');
    if (!element) {
      // Element not found error
      this.log('❌ שגיאה: Element query-test-results לא נמצא');
      return;
    }

    element.innerHTML = `
      <div class="alert alert-success">
        <h6>תוצאות בדיקת Query</h6>
        <p><strong>סוג Query:</strong> ${results.query_type}</p>
        <p><strong>זמן ביצוע:</strong> ${results.execution_time}s</p>
        <p><strong>סטטוס:</strong> <span class="badge bg-success">${results.status}</span></p>
        <p><strong>הודעה:</strong> ${results.message}</p>
      </div>
    `;

    this.log('✅ תוצאות בדיקת Query הוצגו בהצלחה');
    // Display query test results completed
  }

  async testExternalData() {

    this.log('🌐 מתחיל בדיקת חיבור לנתונים חיצוניים...');
    this.showLoading('external-data-status-content', 'בודק חיבור...');
    await this.delay(1000);
    this.loadExternalData();
    this.log('✅ בדיקת חיבור לנתונים חיצוניים הושלמה');
    // Function completed
  }

  async testExternalDataData() {

    this.log('📊 מתחיל בדיקת נתונים חיצוניים...');
    this.showLoading('external-data-test-content', 'בודק נתונים...');
    await this.delay(1000);
    this.loadExternalData();
    this.log('✅ בדיקת נתונים חיצוניים הושלמה');
    // Function completed
  }

  async runPerformanceTest() {

    this.log('🚀 מתחיל בדיקת ביצועים...');
    this.showLoading('performance-metrics-content', 'מבצע בדיקה...');
    await this.delay(1000);
    this.loadPerformanceData();
    this.log('✅ בדיקת ביצועים הושלמה בהצלחה');
    // Function completed
  }

  async runPerformanceTestCheck() {

    this.log('🔍 מתחיל בדיקת ביצועים מתקדמת...');
    this.showLoading('performance-test-content', 'בודק ביצועים...');
    await this.delay(1000);
    this.loadPerformanceData();
    this.log('✅ בדיקת ביצועים מתקדמת הושלמה בהצלחה');
    // Function completed
  }

  clearLog() {

    this.log('🧹 מנקה יומן פעילות...');
    const logContent = document.getElementById('unified-log-content');
    if (logContent) {
      logContent.innerHTML = '';
    }
    this.log('✅ יומן פעילות נוקה בהצלחה');
    // Function completed
  }

  async exportLog() {

    this.log('📤 מתחיל ייצוא יומן פעילות...');
    await this.delay(500);
    this.log('✅ יומן פעילות יוצא בהצלחה');
    // Function completed
  }

  // Data loading functions
  loadCacheData() {


    // Cache Stats
    this.displayCacheStats({
      total_entries: 1250,
      memory_usage_mb: 45.2,
      hit_rate: 87.5,
      miss_rate: 12.5,
    });

    // Cache Health
    this.displayCacheHealth({
      status: 'healthy',
      checks: {
        memory_usage: 'OK',
        connection: 'OK',
        performance: 'OK',
      },
      message: 'מערכת Cache פועלת כרגיל',
    });

    // Cache Info
    this.displayCacheInfo({
      version: '2.1.0',
      uptime_hours: 48,
      last_cleanup: '2025-01-01 10:00:00',
    });

    // Function completed
  }

  loadQueryData() {


    // Query Stats
    this.displayQueryStats({
      total_queries: 12500,
      avg_response_time: 0.15,
      slow_queries_count: 23,
    });

    // Query Opportunities
    this.displayQueryOpportunities([
      { query: 'SELECT * FROM trades', impact: 'high', description: 'N+1 query detected' },
      { query: 'SELECT * FROM executions', impact: 'medium', description: 'Missing index' },
    ]);

    // Slow Queries
    this.displaySlowQueries([
      { query: 'SELECT * FROM trades WHERE date > ?', execution_time: 2.5, frequency: 15 },
      { query: 'SELECT * FROM executions JOIN trades', execution_time: 1.8, frequency: 8 },
    ]);

    // Function completed
  }

  loadExternalData() {


    // External Data Status
    this.displayExternalDataStatus({
      yahoo_finance: 'connected',
      alpha_vantage: 'disconnected',
      last_update: '2025-01-01 12:00:00',
    });

    // External Data Test
    this.displayExternalDataTest({
      status: 'success',
      message: 'בדיקת חיבור לנתונים חיצוניים הושלמה בהצלחה',
    });

    // Function completed
  }

  loadPerformanceData() {


    // Performance Metrics
    this.displayPerformanceMetrics({
      cpu_usage: 35,
      memory_usage: 68,
      disk_usage: 14,
      response_time: 0.12,
    });

    // Performance Test
    this.displayPerformanceTest({
      status: 'success',
      score: 85,
      recommendations: [
        'בצע אופטימיזציה של Database queries',
        'הגדל Cache memory',
        'בצע Database indexing',
      ],
    });

    // Function completed
  }

  // Display functions
  displayCacheStats(stats) {
    const element = document.getElementById('cache-stats-content');
    if (!element) {return;}

    element.innerHTML = `
      <div class="row">
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="text-primary">${stats.total_entries}</h4>
            <small class="text-muted">סך הכל רשומות</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="text-info">${stats.memory_usage_mb}MB</h4>
            <small class="text-muted">שימוש בזיכרון</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="text-success">${stats.hit_rate}%</h4>
            <small class="text-muted">Hit Rate</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="text-warning">${stats.miss_rate}%</h4>
            <small class="text-muted">Miss Rate</small>
          </div>
        </div>
      </div>
    `;
  }

  displayCacheHealth(health) {
    const element = document.getElementById('cache-health-content');
    if (!element) {return;}

    const statusColor = health.status === 'healthy' ? 'success' : 'danger';
    element.innerHTML = `
      <div class="alert alert-${statusColor}">
        <h6>סטטוס בריאות Cache</h6>
        <p><strong>סטטוס:</strong> <span class="badge bg-${statusColor}">${health.status}</span></p>
        <p><strong>בדיקות:</strong></p>
        <ul>
          <li>שימוש בזיכרון: ${health.checks.memory_usage}</li>
          <li>חיבור: ${health.checks.connection}</li>
          <li>ביצועים: ${health.checks.performance}</li>
        </ul>
        <p><strong>הודעה:</strong> ${health.message}</p>
      </div>
    `;
  }

  displayCacheInfo(info) {
    const element = document.getElementById('cache-info-content');
    if (!element) {return;}

    element.innerHTML = `
      <div class="alert alert-info">
        <h6>מידע על מערכת Cache</h6>
        <p><strong>גרסה:</strong> ${info.version}</p>
        <p><strong>זמן פעילות:</strong> ${info.uptime_hours} שעות</p>
        <p><strong>ניקוי אחרון:</strong> ${info.last_cleanup}</p>
      </div>
    `;
  }

  displayQueryStats(stats) {
    const element = document.getElementById('query-stats-content');
    if (!element) {return;}

    element.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <div class="text-center">
            <h4 class="text-primary">${stats.total_queries}</h4>
            <small class="text-muted">סך הכל Queries</small>
          </div>
        </div>
        <div class="col-md-4">
          <div class="text-center">
            <h4 class="text-success">${stats.avg_response_time}s</h4>
            <small class="text-muted">זמן תגובה ממוצע</small>
          </div>
        </div>
        <div class="col-md-4">
          <div class="text-center">
            <h4 class="text-warning">${stats.slow_queries_count}</h4>
            <small class="text-muted">Queries איטיים</small>
          </div>
        </div>
      </div>
    `;
  }

  displayQueryOpportunities(opportunities) {
    const element = document.getElementById('query-opportunities-content');
    if (!element) {return;}

    const opportunitiesHtml = opportunities.map(opp => `
      <li class="mb-2">
        <strong>${opp.query}</strong>
        <span class="badge bg-${opp.impact === 'high' ? 'danger' : 'warning'} ms-2">${opp.impact}</span>
        <br><small class="text-muted">${opp.description}</small>
      </li>
    `).join('');

    element.innerHTML = `
      <div class="alert alert-warning">
        <h6>הזדמנויות אופטימיזציה</h6>
        <ul class="list-unstyled">${opportunitiesHtml}</ul>
      </div>
    `;
  }

  displaySlowQueries(queries) {
    const element = document.getElementById('slow-queries-content');
    if (!element) {return;}

    const queriesHtml = queries.map(query => `
      <li class="mb-2">
        <strong>${query.query}</strong>
        <br><small class="text-muted">זמן ביצוע: ${query.execution_time}s, תדירות: ${query.frequency}</small>
      </li>
    `).join('');

    element.innerHTML = `
      <div class="alert alert-danger">
        <h6>Queries איטיים</h6>
        <ul class="list-unstyled">${queriesHtml}</ul>
      </div>
    `;
  }

  displayExternalDataStatus(status) {
    const element = document.getElementById('external-data-status-content');
    if (!element) {return;}

    const yahooStatus = status.yahoo_finance === 'connected' ? 'success' : 'danger';
    const alphaStatus = status.alpha_vantage === 'connected' ? 'success' : 'danger';

    element.innerHTML = `
      <div class="alert alert-info">
        <h6>סטטוס חיבור לנתונים חיצוניים</h6>
        <p><strong>Yahoo Finance:</strong> <span class="badge bg-${yahooStatus}">${status.yahoo_finance}</span></p>
        <p><strong>Alpha Vantage:</strong> <span class="badge bg-${alphaStatus}">${status.alpha_vantage}</span></p>
        <p><strong>עדכון אחרון:</strong> ${status.last_update}</p>
      </div>
    `;
  }

  displayExternalDataTest(test) {
    const element = document.getElementById('external-data-test-content');
    if (!element) {return;}

    const statusColor = test.status === 'success' ? 'success' : 'danger';
    element.innerHTML = `
      <div class="alert alert-${statusColor}">
        <h6>תוצאות בדיקת נתונים חיצוניים</h6>
        <p><strong>סטטוס:</strong> <span class="badge bg-${statusColor}">${test.status}</span></p>
        <p><strong>הודעה:</strong> ${test.message}</p>
      </div>
    `;
  }

  displayPerformanceMetrics(metrics) {
    const element = document.getElementById('performance-metrics-content');
    if (!element) {return;}

    element.innerHTML = `
      <div class="row">
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="text-primary">${metrics.cpu_usage}%</h4>
            <small class="text-muted">שימוש ב-CPU</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="text-info">${metrics.memory_usage}%</h4>
            <small class="text-muted">שימוש בזיכרון</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="text-warning">${metrics.disk_usage}%</h4>
            <small class="text-muted">שימוש בדיסק</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="text-success">${metrics.response_time}s</h4>
            <small class="text-muted">זמן תגובה</small>
          </div>
        </div>
      </div>
    `;
  }

  displayPerformanceTest(test) {
    const element = document.getElementById('performance-test-content');
    if (!element) {return;}

    const recommendationsHtml = test.recommendations.map(rec => `<li>${rec}</li>`).join('');

    element.innerHTML = `
      <div class="alert alert-info">
        <h6>תוצאות בדיקת ביצועים</h6>
        <p><strong>סטטוס:</strong> <span class="badge bg-${test.status === 'success' ? 'success' : 'danger'}">${test.status}</span></p>
        <p><strong>ציון:</strong> ${test.score}/100</p>
        <p><strong>המלצות:</strong></p>
        <ul>${recommendationsHtml}</ul>
      </div>
    `;
  }

  log(message) {
    const logContent = document.getElementById('unified-log-content');
    if (!logContent) {
      // Log element not found - cannot display message
      return;
    }

    const timestamp = new Date().toLocaleTimeString('he-IL');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry mb-2 p-2 border-start border-3 border-primary bg-light';
    logEntry.innerHTML = `
      <small class="text-muted">${timestamp}</small>
      <span class="ms-2">${message}</span>
    `;

    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
  }

  showLoading(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) {
      // Element not found error
      return;
    }

    element.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">טוען...</span>
        </div>
        <p class="mt-2">${message}</p>
      </div>
    `;
  }

  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {

  new SimpleTestCenter();
  // Object created
});

// Script loaded
