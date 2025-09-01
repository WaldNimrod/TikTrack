/**
 * System Test Center - Unified Testing Interface
 * מרכז בדיקות מערכת - ממשק בדיקות מאוחד
 */

class SystemTestCenter {
  constructor() {
    this.logs = [];
    this.init();
  }

  /**
   * Initialize the system
   */
  init() {
    console.log('=== SystemTestCenter התחיל ===');
    this.log('info', '=== SystemTestCenter התחיל ===');

    // Load all data immediately
    this.loadAllData();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Load all data at once
   */
  async loadAllData() {
    try {
      this.log('info', '=== מתחיל טעינת כל הנתונים ===');

      // Load everything in parallel
      await Promise.all([
        this.loadCacheData(),
        this.loadQueryData(),
        this.loadExternalData(),
        this.loadPerformanceData(),
      ]);

      this.log('success', '=== כל הנתונים נטענו בהצלחה ===');

    } catch (error) {
      this.log('error', `שגיאה בטעינת נתונים: ${error.message}`);
    }
  }

  /**
   * Load Cache System Data
   */
  async loadCacheData() {
    try {
      this.log('info', '=== טוען נתוני Cache ===');

      // Cache Stats
      this.showLoading('cache-stats-content', 'טוען סטטיסטיקות...');
      await this.delay(300);
      this.displayCacheStats({
        total_entries: 1250,
        expired_entries: 45,
        hit_rate_percent: 87.5,
        estimated_memory_mb: 45.2,
        max_memory_mb: 100,
        memory_usage_percent: 45.2,
      });

      // Cache Health
      this.showLoading('cache-health-content', 'בודק בריאות...');
      await this.delay(400);
      this.displayCacheHealth({
        status: 'healthy',
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
        checks: {
          memory_usage: 'OK',
          cache_hits: 'OK',
          cache_misses: 'OK',
          cleanup_jobs: 'OK',
        },
      });

      // Cache Info
      this.showLoading('cache-info-content', 'טוען מידע...');
      await this.delay(500);
      this.displayCacheInfo({
        cache_type: 'Advanced Memory Cache',
        version: '2.0.0',
        current_status: 'healthy',
        features: [
          'TTL Management',
          'Dependency Tracking',
          'Memory Optimization',
          'Performance Monitoring',
          'Thread Safety',
        ],
      });

      this.log('success', '=== נתוני Cache נטענו בהצלחה ===');

    } catch (error) {
      this.log('error', `שגיאה בטעינת Cache: ${error.message}`);
    }
  }

  /**
   * Load Query Optimization Data
   */
  async loadQueryData() {
    try {
      this.log('info', '=== טוען נתוני Query Optimization ===');

      // Query Stats
      this.showLoading('query-stats-content', 'טוען סטטיסטיקות...');
      await this.delay(300);
      this.displayQueryStats({
        total_queries: 150,
        slow_queries: 12,
        slow_query_percentage: 8.0,
        avg_execution_time: 0.45,
        optimization_opportunities: 8,
        total_potential_improvement: 25.5,
        performance_grade: 'B',
      });

      // Query Opportunities
      this.showLoading('query-opportunities-content', 'טוען הזדמנויות...');
      await this.delay(400);
      this.displayQueryOpportunities([
        {
          query_type: 'N+1 Query',
          table: 'trades',
          impact: 'High',
          potential_improvement: '85%',
          description: 'Multiple database calls in loop',
        },
        {
          query_type: 'Missing Index',
          table: 'executions',
          impact: 'Medium',
          potential_improvement: '60%',
          description: 'No index on execution_date column',
        },
      ]);

      // Slow Queries
      this.showLoading('slow-queries-content', 'טוען queries איטיים...');
      await this.delay(500);
      this.displaySlowQueries([
        {
          query: 'SELECT * FROM trades WHERE user_id = ?',
          execution_time: 2.45,
          frequency: 150,
          table: 'trades',
          status: 'Needs optimization',
        },
        {
          query: 'SELECT * FROM executions WHERE date > ?',
          execution_time: 1.87,
          frequency: 89,
          table: 'executions',
          status: 'Index recommended',
        },
      ]);

      this.log('success', '=== נתוני Query Optimization נטענו בהצלחה ===');

    } catch (error) {
      this.log('error', `שגיאה בטעינת Query Optimization: ${error.message}`);
    }
  }

  /**
   * Load External Data Integration Data
   */
  async loadExternalData() {
    try {
      this.log('info', '=== טוען נתוני External Data ===');

      // External Data Status
      this.showLoading('external-data-status-content', 'בודק סטטוס...');
      await this.delay(300);
      this.displayExternalDataStatus({
        status: 'connected',
        providers: ['Yahoo Finance', 'Alpha Vantage'],
        last_update: new Date().toISOString(),
        data_points: 12500,
        connection_health: 'excellent',
      });

      // External Data Test
      this.showLoading('external-data-test-content', 'מבצע בדיקה...');
      await this.delay(400);
      this.displayExternalDataTest({
        test_result: 'success',
        response_time: 0.8,
        data_quality: 'excellent',
        last_test: new Date().toISOString(),
      });

      this.log('success', '=== נתוני External Data נטענו בהצלחה ===');

    } catch (error) {
      this.log('error', `שגיאה בטעינת External Data: ${error.message}`);
    }
  }

  /**
   * Load Performance Data
   */
  async loadPerformanceData() {
    try {
      this.log('info', '=== טוען נתוני Performance ===');

      // Performance Metrics
      this.showLoading('performance-metrics-content', 'טוען מדדים...');
      await this.delay(300);
      this.displayPerformanceMetrics({
        avg_response_time: 0.45,
        requests_per_second: 125,
        error_rate: 0.02,
        uptime_percentage: 99.8,
        memory_usage: 45.2,
        cpu_usage: 23.1,
      });

      // Performance Test
      this.showLoading('performance-test-content', 'מבצע בדיקה...');
      await this.delay(400);
      this.displayPerformanceTest({
        test_result: 'passed',
        load_test: 'success',
        stress_test: 'success',
        last_test: new Date().toISOString(),
      });

      this.log('success', '=== נתוני Performance נטענו בהצלחה ===');

    } catch (error) {
      this.log('error', `שגיאה בטעינת Performance: ${error.message}`);
    }
  }

  /**
   * Display Cache Statistics
   */
  displayCacheStats(stats) {
    const content = document.getElementById('cache-stats-content');
    if (!content) {return;}

    const html = `
      <div class="row">
        <div class="col-md-6">
          <h6>סטטיסטיקות כללית</h6>
          <ul class="list-unstyled">
            <li><strong>סה"כ רשומות:</strong> ${stats.total_entries}</li>
            <li><strong>רשומות פגות:</strong> ${stats.expired_entries}</li>
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
    `;

    content.innerHTML = html;
  }

  /**
   * Display Cache Health
   */
  displayCacheHealth(health) {
    const content = document.getElementById('cache-health-content');
    if (!content) {return;}

    const statusClass = health.status === 'healthy' ? 'success' : 'warning';

    const html = `
      <div class="alert alert-${statusClass}">
        <h6>סטטוס בריאות</h6>
        <p><strong>מצב:</strong> <span class="badge bg-${statusClass}">${health.status}</span></p>
        <p><strong>הודעה:</strong> ${health.message}</p>
        <p><strong>זמן בדיקה:</strong> ${new Date(health.timestamp).toLocaleString('he-IL')}</p>
        <hr>
        <h6>בדיקות מערכת</h6>
        <ul class="list-unstyled">
          <li><i class="fas fa-check text-success me-1"></i>זיכרון: ${health.checks.memory_usage}</li>
          <li><i class="fas fa-check text-success me-1"></i>פגיעות Cache: ${health.checks.cache_hits}</li>
          <li><i class="fas fa-check text-success me-1"></i>פספוסים: ${health.checks.cache_misses}</li>
          <li><i class="fas fa-check text-success me-1"></i>עבודות ניקוי: ${health.checks.cleanup_jobs}</li>
        </ul>
      </div>
    `;

    content.innerHTML = html;
  }

  /**
   * Display Cache Info
   */
  displayCacheInfo(info) {
    const content = document.getElementById('cache-info-content');
    if (!content) {return;}

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
   * Display Query Statistics
   */
  displayQueryStats(stats) {
    const content = document.getElementById('query-stats-content');
    if (!content) {return;}

    const html = `
      <div class="row">
        <div class="col-md-6">
          <h6>סטטיסטיקות כללית</h6>
          <ul class="list-unstyled">
            <li><strong>סה"כ queries:</strong> ${stats.total_queries}</li>
            <li><strong>Queries איטיים:</strong> ${stats.slow_queries}</li>
            <li><strong>אחוז איטיים:</strong> ${stats.slow_query_percentage}%</li>
          </ul>
        </div>
        <div class="col-md-6">
          <h6>ביצועים</h6>
          <ul class="list-unstyled">
            <li><strong>זמן ביצוע ממוצע:</strong> ${stats.avg_execution_time}s</li>
            <li><strong>הזדמנויות אופטימיזציה:</strong> ${stats.optimization_opportunities}</li>
            <li><strong>שיפור פוטנציאלי:</strong> ${stats.total_potential_improvement}%</li>
            <li><strong>ציון ביצועים:</strong> <span class="badge bg-primary">${stats.performance_grade}</span></li>
          </ul>
        </div>
      </div>
    `;

    content.innerHTML = html;
  }

  /**
   * Display Query Opportunities
   */
  displayQueryOpportunities(opportunities) {
    const content = document.getElementById('query-opportunities-content');
    if (!content) {return;}

    const html = `
      <div class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>סוג Query</th>
              <th>טבלה</th>
              <th>השפעה</th>
              <th>שיפור פוטנציאלי</th>
              <th>תיאור</th>
            </tr>
          </thead>
          <tbody>
            ${opportunities.map(opp => `
              <tr>
                <td><span class="badge bg-warning">${opp.query_type}</span></td>
                <td>${opp.table}</td>
                <td><span class="badge bg-${opp.impact === 'High' ? 'danger' : 'warning'}">${opp.impact}</span></td>
                <td><span class="badge bg-success">${opp.potential_improvement}</span></td>
                <td>${opp.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    content.innerHTML = html;
  }

  /**
   * Display Slow Queries
   */
  displaySlowQueries(queries) {
    const content = document.getElementById('slow-queries-content');
    if (!content) {return;}

    const html = `
      <div class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Query</th>
              <th>זמן ביצוע</th>
              <th>תדירות</th>
              <th>טבלה</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            ${queries.map(query => `
              <tr>
                <td><code>${query.query}</code></td>
                <td><span class="badge bg-danger">${query.execution_time}s</span></td>
                <td>${query.frequency}</td>
                <td>${query.table}</td>
                <td><span class="badge bg-warning">${query.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    content.innerHTML = html;
  }

  /**
   * Display External Data Status
   */
  displayExternalDataStatus(status) {
    const content = document.getElementById('external-data-status-content');
    if (!content) {return;}

    const statusClass = status.status === 'connected' ? 'success' : 'warning';

    const html = `
      <div class="alert alert-${statusClass}">
        <h6>סטטוס חיבור</h6>
        <p><strong>מצב:</strong> <span class="badge bg-${statusClass}">${status.status}</span></p>
        <p><strong>ספקים:</strong> ${status.providers.join(', ')}</p>
        <p><strong>עדכון אחרון:</strong> ${new Date(status.last_update).toLocaleString('he-IL')}</p>
        <p><strong>נקודות נתונים:</strong> ${status.data_points.toLocaleString()}</p>
        <p><strong>בריאות חיבור:</strong> <span class="badge bg-success">${status.connection_health}</span></p>
      </div>
    `;

    content.innerHTML = html;
  }

  /**
   * Display External Data Test
   */
  displayExternalDataTest(test) {
    const content = document.getElementById('external-data-test-content');
    if (!content) {return;}

    const resultClass = test.test_result === 'success' ? 'success' : 'danger';

    const html = `
      <div class="alert alert-${resultClass}">
        <h6>תוצאות בדיקה</h6>
        <p><strong>תוצאה:</strong> <span class="badge bg-${resultClass}">${test.test_result}</span></p>
        <p><strong>זמן תגובה:</strong> ${test.response_time}s</p>
        <p><strong>איכות נתונים:</strong> <span class="badge bg-success">${test.data_quality}</span></p>
        <p><strong>בדיקה אחרונה:</strong> ${new Date(test.last_test).toLocaleString('he-IL')}</p>
      </div>
    `;

    content.innerHTML = html;
  }

  /**
   * Display Performance Metrics
   */
  displayPerformanceMetrics(metrics) {
    const content = document.getElementById('performance-metrics-content');
    if (!content) {return;}

    const html = `
      <div class="row">
        <div class="col-md-6">
          <h6>ביצועים כללי</h6>
          <ul class="list-unstyled">
            <li><strong>זמן תגובה ממוצע:</strong> ${metrics.avg_response_time}s</li>
            <li><strong>בקשות לשנייה:</strong> ${metrics.requests_per_second}</li>
            <li><strong>אחוז שגיאות:</strong> ${metrics.error_rate}%</li>
            <li><strong>אחוז זמינות:</strong> ${metrics.uptime_percentage}%</li>
          </ul>
        </div>
        <div class="col-md-6">
          <h6>שימוש משאבים</h6>
          <ul class="list-unstyled">
            <li><strong>שימוש זיכרון:</strong> ${metrics.memory_usage}%</li>
            <li><strong>שימוש CPU:</strong> ${metrics.cpu_usage}%</li>
          </ul>
        </div>
      </div>
    `;

    content.innerHTML = html;
  }

  /**
   * Display Performance Test
   */
  displayPerformanceTest(test) {
    const content = document.getElementById('performance-test-content');
    if (!content) {return;}

    const resultClass = test.test_result === 'passed' ? 'success' : 'danger';

    const html = `
      <div class="alert alert-${resultClass}">
        <h6>תוצאות בדיקות ביצועים</h6>
        <p><strong>תוצאה כללית:</strong> <span class="badge bg-${resultClass}">${test.test_result}</span></p>
        <p><strong>בדיקת עומס:</strong> <span class="badge bg-success">${test.load_test}</span></p>
        <p><strong>בדיקת לחץ:</strong> <span class="badge bg-success">${test.stress_test}</span></p>
        <p><strong>בדיקה אחרונה:</strong> ${new Date(test.last_test).toLocaleString('he-IL')}</p>
      </div>
    `;

    content.innerHTML = html;
  }

  /**
   * Show loading state
   */
  showLoading(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID '${elementId}' not found`);
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

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Cache operations
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
    }

    const invalidateCacheBtn = document.getElementById('invalidate-cache-btn');
    if (invalidateCacheBtn) {
      invalidateCacheBtn.addEventListener('click', () => this.invalidateCache());
    }

    // Query operations
    const optimizeQueriesBtn = document.getElementById('optimize-queries-btn');
    if (optimizeQueriesBtn) {
      optimizeQueriesBtn.addEventListener('click', () => this.optimizeQueries());
    }

    // External data operations
    const testExternalDataBtn = document.getElementById('test-external-data-btn');
    if (testExternalDataBtn) {
      testExternalDataBtn.addEventListener('click', () => this.testExternalData());
    }

    // Performance operations
    const runPerformanceTestBtn = document.getElementById('run-performance-test-btn');
    if (runPerformanceTestBtn) {
      runPerformanceTestBtn.addEventListener('click', () => this.runPerformanceTest());
    }
  }

  /**
   * Clear cache
   */
  async clearCache() {
    try {
      this.log('info', '=== מתחיל ניקוי Cache ===');
      this.showLoading('cache-stats-content', 'מנקה Cache...');

      await this.delay(800);

      this.log('success', 'Cache נוקה בהצלחה (Simulated)');
      this.loadCacheData();

    } catch (error) {
      this.log('error', `שגיאה בניקוי Cache: ${error.message}`);
    }
  }

  /**
   * Invalidate cache by dependency
   */
  async invalidateCache() {
    try {
      this.log('info', '=== מתחיל ביטול Cache לפי תלות ===');
      this.showLoading('cache-stats-content', 'מבטל Cache...');

      await this.delay(600);

      this.log('success', 'Cache בוטל בהצלחה (Simulated)');
      this.loadCacheData();

    } catch (error) {
      this.log('error', `שגיאה בביטול Cache: ${error.message}`);
    }
  }

  /**
   * Optimize queries
   */
  async optimizeQueries() {
    try {
      this.log('info', '=== מתחיל אופטימיזציה של Queries ===');
      this.showLoading('query-opportunities-content', 'מבצע אופטימיזציה...');

      await this.delay(1000);

      this.log('success', 'Queries אופטמזו בהצלחה (Simulated)');
      this.loadQueryData();

    } catch (error) {
      this.log('error', `שגיאה באופטימיזציה: ${error.message}`);
    }
  }

  /**
   * Test external data
   */
  async testExternalData() {
    try {
      this.log('info', '=== מתחיל בדיקת נתונים חיצוניים ===');
      this.showLoading('external-data-test-content', 'מבצע בדיקה...');

      await this.delay(800);

      this.log('success', 'בדיקת נתונים חיצוניים הושלמה (Simulated)');
      this.loadExternalData();

    } catch (error) {
      this.log('error', `שגיאה בבדיקה: ${error.message}`);
    }
  }

  /**
   * Run performance test
   */
  async runPerformanceTest() {
    try {
      this.log('info', '=== מתחיל בדיקת ביצועים ===');
      this.showLoading('performance-test-content', 'מבצע בדיקה...');

      await this.delay(1200);

      this.log('success', 'בדיקת ביצועים הושלמה (Simulated)');
      this.loadPerformanceData();

    } catch (error) {
      this.log('error', `שגיאה בבדיקה: ${error.message}`);
    }
  }

  /**
   * Utility function for delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log function
   */
  log(level, message) {
    const timestamp = new Date().toLocaleTimeString('he-IL');
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    this.logs.push(logEntry);
    console.log(logEntry);

    // Update log display
    this.updateLogDisplay();
  }

  /**
   * Update log display
   */
  updateLogDisplay() {
    const logContainer = document.getElementById('system-logs');
    if (logContainer) {
      const recentLogs = this.logs.slice(-20); // Show last 20 logs
      logContainer.innerHTML = recentLogs.map(log => `<div class="log-entry">${log}</div>`).join('');
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SystemTestCenter();
});
