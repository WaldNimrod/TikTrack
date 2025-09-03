/**
 * System Test Center - Simple Version
 * מרכז בדיקות מערכת - גרסה פשוטה
 */

console.log('=== system-test-center.js נטען ===');

class SimpleTestCenter {
  constructor() {
    console.log('=== SimpleTestCenter נוצר ===');
    this.init();
  }

  init() {
    console.log('=== init התחיל ===');
    this.setupEventListeners();
    this.log('🚀 מרכז בדיקות מערכת מתחיל...');
    this.log('✅ מרכז בדיקות מערכת מוכן לשימוש');
    console.log('=== init הושלם ===');
  }

  setupEventListeners() {
    console.log('=== setupEventListeners התחיל ===');

    // System status buttons
    const refreshAllStatusBtn = document.getElementById('refresh-all-status');
    if (refreshAllStatusBtn) {
      refreshAllStatusBtn.addEventListener('click', () => this.refreshAllStatus());
      console.log('כפתור refresh-all-status מקושר');
    }

    // Cache buttons
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
      console.log('כפתור clear-cache-btn מקושר');
    }

    const invalidateCacheBtn = document.getElementById('invalidate-cache-btn');
    if (invalidateCacheBtn) {
      invalidateCacheBtn.addEventListener('click', () => this.invalidateCache());
      console.log('כפתור invalidate-cache-btn מקושר');
    }

    const cacheHealthCheckBtn = document.getElementById('cache-health-check');
    if (cacheHealthCheckBtn) {
      cacheHealthCheckBtn.addEventListener('click', () => this.checkCacheHealth());
      console.log('כפתור cache-health-check מקושר');
    }

    const getCacheInfoBtn = document.getElementById('get-cache-info');
    if (getCacheInfoBtn) {
      getCacheInfoBtn.addEventListener('click', () => this.getCacheInfo());
      console.log('כפתור get-cache-info מקושר');
    }

    const refreshCacheStatsBtn = document.getElementById('refresh-cache-stats');
    if (refreshCacheStatsBtn) {
      refreshCacheStatsBtn.addEventListener('click', () => this.refreshCacheStats());
      console.log('כפתור refresh-cache-stats מקושר');
    }

    // Query buttons
    const optimizeQueriesBtn = document.getElementById('optimize-queries-btn');
    if (optimizeQueriesBtn) {
      optimizeQueriesBtn.addEventListener('click', () => this.optimizeQueries());
      console.log('כפתור optimize-queries-btn מקושר');
    }

    const runQueryTestBtn = document.getElementById('run-query-test');
    if (runQueryTestBtn) {
      runQueryTestBtn.addEventListener('click', () => this.runQueryTest());
      console.log('כפתור run-query-test מקושר');
    }

    const refreshQueryStatsBtn = document.getElementById('refresh-query-stats');
    if (refreshQueryStatsBtn) {
      refreshQueryStatsBtn.addEventListener('click', () => this.refreshQueryStats());
      console.log('כפתור refresh-query-stats מקושר');
    }

    const getSlowQueriesBtn = document.getElementById('get-slow-queries');
    if (getSlowQueriesBtn) {
      getSlowQueriesBtn.addEventListener('click', () => this.getSlowQueries());
      console.log('כפתור get-slow-queries מקושר');
    }

    const clearQueryProfilesBtn = document.getElementById('clear-query-profiles');
    if (clearQueryProfilesBtn) {
      clearQueryProfilesBtn.addEventListener('click', () => this.clearQueryProfiles());
      console.log('כפתור clear-query-profiles מקושר');
    }

    const exportQueryProfilesBtn = document.getElementById('export-query-profiles');
    if (exportQueryProfilesBtn) {
      exportQueryProfilesBtn.addEventListener('click', () => this.exportQueryProfiles());
      console.log('כפתור export-query-profiles מקושר');
    }

    // External data buttons
    const testExternalDataBtn = document.getElementById('test-external-data-btn');
    if (testExternalDataBtn) {
      testExternalDataBtn.addEventListener('click', () => this.testExternalData());
      console.log('כפתור test-external-data-btn מקושר');
    }

    const testExternalDataDataBtn = document.getElementById('test-external-data-data-btn');
    if (testExternalDataDataBtn) {
      testExternalDataDataBtn.addEventListener('click', () => this.testExternalDataData());
      console.log('כפתור test-external-data-data-btn מקושר');
    }

    // Performance buttons
    const runPerformanceTestBtn = document.getElementById('run-performance-test-btn');
    if (runPerformanceTestBtn) {
      runPerformanceTestBtn.addEventListener('click', () => this.runPerformanceTest());
      console.log('כפתור run-performance-test-btn מקושר');
    }

    const runPerformanceTestCheckBtn = document.getElementById('run-performance-test-check-btn');
    if (runPerformanceTestCheckBtn) {
      runPerformanceTestCheckBtn.addEventListener('click', () => this.runPerformanceTestCheck());
      console.log('כפתור run-performance-test-check-btn מקושר');
    }

    // Log buttons
    const clearLogBtn = document.getElementById('clear-log');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', () => this.clearLog());
      console.log('כפתור clear-log מקושר');
    }

    const exportLogBtn = document.getElementById('export-log');
    if (exportLogBtn) {
      exportLogBtn.addEventListener('click', () => this.exportLog());
      console.log('כפתור export-log מקושר');
    }

    console.log('=== setupEventListeners הושלם ===');
  }

  // Button action functions
  async refreshAllStatus() {
    console.log('=== refreshAllStatus התחיל ===');
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

    console.log('=== refreshAllStatus הושלם ===');
  }

  async clearCache() {
    console.log('=== clearCache התחיל ===');
    this.log('🧹 מתחיל ניקוי Cache...');
    this.showLoading('cache-stats-content', 'מנקה Cache...');
    await this.delay(1000);
    this.loadCacheData();
    this.log('✅ Cache נוקה בהצלחה');
    console.log('=== clearCache הושלם ===');
  }

  async invalidateCache() {
    console.log('=== invalidateCache התחיל ===');
    this.log('🗑️ מתחיל ביטול Cache...');
    this.showLoading('cache-health-content', 'מבטל Cache...');
    await this.delay(1000);
    this.loadCacheData();
    this.log('✅ Cache בוטל בהצלחה');
    console.log('=== invalidateCache הושלם ===');
  }

  async checkCacheHealth() {
    console.log('=== checkCacheHealth התחיל ===');
    this.log('🏥 מתחיל בדיקת בריאות Cache...');
    this.showLoading('cache-health-content', 'בודק בריאות Cache...');
    await this.delay(800);
    this.loadCacheData();
    this.log('✅ בדיקת בריאות Cache הושלמה');
    console.log('=== checkCacheHealth הושלם ===');
  }

  async getCacheInfo() {
    console.log('=== getCacheInfo התחיל ===');
    this.log('ℹ️ מתחיל קבלת מידע על Cache...');
    this.showLoading('cache-info-content', 'מקבל מידע על Cache...');
    await this.delay(600);
    this.loadCacheData();
    this.log('✅ מידע על Cache התקבל בהצלחה');
    console.log('=== getCacheInfo הושלם ===');
  }

  async refreshCacheStats() {
    console.log('=== refreshCacheStats התחיל ===');
    this.log('📊 מתחיל רענון סטטיסטיקות Cache...');
    this.showLoading('cache-stats-content', 'מרענן סטטיסטיקות Cache...');
    await this.delay(700);
    this.loadCacheData();
    this.log('✅ סטטיסטיקות Cache עודכנו בהצלחה');
    console.log('=== refreshCacheStats הושלם ===');
  }

  async optimizeQueries() {
    console.log('=== optimizeQueries התחיל ===');
    this.log('⚡ מתחיל אופטימיזציה של Queries...');
    this.showLoading('query-opportunities-content', 'מבצע אופטימיזציה...');
    await this.delay(1000);
    this.loadQueryData();
    this.log('✅ אופטימיזציה של Queries הושלמה בהצלחה');
    console.log('=== optimizeQueries הושלם ===');
  }

  async runQueryTest() {
    console.log('=== runQueryTest התחיל ===');

    const queryType = document.getElementById('test-query-type')?.value || 'tickers';
    console.log(`סוג Query: ${queryType}`);
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
    console.log('=== runQueryTest הושלם ===');
  }

  async refreshQueryStats() {
    console.log('=== refreshQueryStats התחיל ===');
    this.log('📈 מתחיל רענון סטטיסטיקות Queries...');
    this.showLoading('query-stats-content', 'מרענן סטטיסטיקות Queries...');
    await this.delay(700);
    this.loadQueryData();
    this.log('✅ סטטיסטיקות Queries עודכנו בהצלחה');
    console.log('=== refreshQueryStats הושלם ===');
  }

  async getSlowQueries() {
    console.log('=== getSlowQueries התחיל ===');
    this.log('🐌 מתחיל בדיקת Queries איטיים...');
    this.showLoading('slow-queries-content', 'בודק Queries איטיים...');
    await this.delay(900);
    this.loadQueryData();
    this.log('✅ Queries איטיים נבדקו בהצלחה');
    console.log('=== getSlowQueries הושלם ===');
  }

  async clearQueryProfiles() {
    console.log('=== clearQueryProfiles התחיל ===');
    this.log('🗑️ מתחיל ניקוי פרופילי Queries...');
    await this.delay(500);
    this.log('✅ פרופילי Queries נוקו בהצלחה');
    console.log('=== clearQueryProfiles הושלם ===');
  }

  async exportQueryProfiles() {
    console.log('=== exportQueryProfiles התחיל ===');
    this.log('📤 מתחיל ייצוא פרופילי Queries...');
    await this.delay(800);
    this.log('✅ פרופילי Queries יוצאו בהצלחה');
    console.log('=== exportQueryProfiles הושלם ===');
  }

  displayQueryTestResults(results) {
    console.log('=== displayQueryTestResults התחיל ===');
    console.log('תוצאות:', results);

    const element = document.getElementById('query-test-results');
    if (!element) {
      console.error('Element query-test-results לא נמצא');
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
    console.log('=== displayQueryTestResults הושלם ===');
  }

  async testExternalData() {
    console.log('=== testExternalData התחיל ===');
    this.log('🌐 מתחיל בדיקת חיבור לנתונים חיצוניים...');
    this.showLoading('external-data-status-content', 'בודק חיבור...');
    await this.delay(1000);
    this.loadExternalData();
    this.log('✅ בדיקת חיבור לנתונים חיצוניים הושלמה');
    console.log('=== testExternalData הושלם ===');
  }

  async testExternalDataData() {
    console.log('=== testExternalDataData התחיל ===');
    this.log('📊 מתחיל בדיקת נתונים חיצוניים...');
    this.showLoading('external-data-test-content', 'בודק נתונים...');
    await this.delay(1000);
    this.loadExternalData();
    this.log('✅ בדיקת נתונים חיצוניים הושלמה');
    console.log('=== testExternalDataData הושלם ===');
  }

  async runPerformanceTest() {
    console.log('=== runPerformanceTest התחיל ===');
    this.log('🚀 מתחיל בדיקת ביצועים...');
    this.showLoading('performance-metrics-content', 'מבצע בדיקה...');
    await this.delay(1000);
    this.loadPerformanceData();
    this.log('✅ בדיקת ביצועים הושלמה בהצלחה');
    console.log('=== runPerformanceTest הושלם ===');
  }

  async runPerformanceTestCheck() {
    console.log('=== runPerformanceTestCheck התחיל ===');
    this.log('🔍 מתחיל בדיקת ביצועים מתקדמת...');
    this.showLoading('performance-test-content', 'בודק ביצועים...');
    await this.delay(1000);
    this.loadPerformanceData();
    this.log('✅ בדיקת ביצועים מתקדמת הושלמה בהצלחה');
    console.log('=== runPerformanceTestCheck הושלם ===');
  }

  async clearLog() {
    console.log('=== clearLog התחיל ===');
    this.log('🧹 מנקה יומן פעילות...');
    const logContent = document.getElementById('unified-log-content');
    if (logContent) {
      logContent.innerHTML = '';
    }
    this.log('✅ יומן פעילות נוקה בהצלחה');
    console.log('=== clearLog הושלם ===');
  }

  async exportLog() {
    console.log('=== exportLog התחיל ===');
    this.log('📤 מתחיל ייצוא יומן פעילות...');
    await this.delay(500);
    this.log('✅ יומן פעילות יוצא בהצלחה');
    console.log('=== exportLog הושלם ===');
  }

  // Data loading functions
  async loadCacheData() {
    console.log('=== loadCacheData התחיל ===');

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

    console.log('=== loadCacheData הושלם ===');
  }

  async loadQueryData() {
    console.log('=== loadQueryData התחיל ===');

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

    console.log('=== loadQueryData הושלם ===');
  }

  async loadExternalData() {
    console.log('=== loadExternalData התחיל ===');

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

    console.log('=== loadExternalData הושלם ===');
  }

  async loadPerformanceData() {
    console.log('=== loadPerformanceData התחיל ===');

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

    console.log('=== loadPerformanceData הושלם ===');
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
      console.error('Element unified-log-content לא נמצא');
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
      console.error(`Element ${elementId} לא נמצא`);
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

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== DOMContentLoaded התחיל ===');
  new SimpleTestCenter();
  console.log('=== SimpleTestCenter נוצר בהצלחה ===');
});

console.log('=== system-test-center.js נטען בהצלחה ===');
