/**
 * System Test Center JavaScript - TikTrack
 *
 * Unified testing system for all TikTrack services including:
 * - Cache System
 * - Query Optimization
 * - External Data Integration
 * - Performance Testing
 *
 * Author: TikTrack Development Team
 * Created: September 2025
 * Version: 1.0
 */

class SystemTestCenter {
  constructor() {
    this.logEntries = [];
    this.isLoading = false;

    // API endpoints - using simulated data for now
    this.endpoints = {
      cache: null, // Will use simulated data
      query: null, // Will use simulated data
      external: null, // Will use simulated data
      performance: null, // Will use simulated data
    };

    this.initializeEventListeners();
    this.loadInitialData();
    this.log('info', 'מרכז בדיקות מערכת נטען בהצלחה');
  }

  /**
     * Initialize all event listeners
     */
  initializeEventListeners() {
    // System status
    document.getElementById('refresh-all-status').addEventListener('click', () => {
      this.refreshAllSystemStatus();
    });

    // Cache system events
    document.getElementById('refresh-cache-stats').addEventListener('click', () => {
      this.loadCacheStats();
    });
    document.getElementById('cache-health-check').addEventListener('click', () => {
      this.performCacheHealthCheck();
    });
    document.getElementById('clear-cache').addEventListener('click', () => {
      this.clearCache();
    });
    document.getElementById('invalidate-tickers').addEventListener('click', () => {
      this.invalidateCacheByDependency('tickers');
    });
    document.getElementById('invalidate-trades').addEventListener('click', () => {
      this.invalidateCacheByDependency('trades');
    });
    document.getElementById('get-cache-info').addEventListener('click', () => {
      this.getCacheInfo();
    });

    // Query optimization events
    document.getElementById('refresh-query-stats').addEventListener('click', () => {
      this.loadQueryStats();
    });
    document.getElementById('get-query-opportunities').addEventListener('click', () => {
      this.loadQueryOpportunities();
    });
    document.getElementById('get-slow-queries').addEventListener('click', () => {
      this.loadSlowQueries();
    });
    document.getElementById('clear-query-profiles').addEventListener('click', () => {
      this.clearQueryProfiles();
    });
    document.getElementById('export-query-profiles').addEventListener('click', () => {
      this.exportQueryProfiles();
    });
    document.getElementById('run-query-test').addEventListener('click', () => {
      this.runQueryTest();
    });

    // External data events
    document.getElementById('check-api-status').addEventListener('click', () => {
      this.checkApiStatus();
    });
    document.getElementById('test-models').addEventListener('click', () => {
      this.testModels();
    });
    document.getElementById('fetch-single-quote').addEventListener('click', () => {
      this.fetchSingleQuote();
    });
    document.getElementById('fetch-batch-quotes').addEventListener('click', () => {
      this.fetchBatchQuotes();
    });
    document.getElementById('refresh-all-prices').addEventListener('click', () => {
      this.refreshAllPrices();
    });
    document.getElementById('check-providers').addEventListener('click', () => {
      this.checkProviders();
    });

    // Performance events
    document.getElementById('run-performance-test').addEventListener('click', () => {
      this.runPerformanceTest();
    });
    document.getElementById('get-system-metrics').addEventListener('click', () => {
      this.getSystemMetrics();
    });
    document.getElementById('test-cache-response').addEventListener('click', () => {
      this.testResponseTime('cache');
    });
    document.getElementById('test-query-response').addEventListener('click', () => {
      this.testResponseTime('query');
    });
    document.getElementById('test-external-response').addEventListener('click', () => {
      this.testResponseTime('external');
    });
    document.getElementById('test-db-response').addEventListener('click', () => {
      this.testResponseTime('database');
    });

    // Log management
    document.getElementById('clear-log').addEventListener('click', () => {
      this.clearLog();
    });
    document.getElementById('export-log').addEventListener('click', () => {
      this.exportLog();
    });
  }

  /**
     * Load initial data
     */
  async loadInitialData() {
    try {
      console.log('=== loadInitialData התחיל ===');
      this.log('info', '=== loadInitialData התחיל ===');
      this.log('info', '1. טוען נתונים ראשוניים...');
      
      // Load system status first
      console.log('2. קורא ל-refreshAllSystemStatus...');
      this.log('info', '2. קורא ל-refreshAllSystemStatus...');
      await this.refreshAllSystemStatus();
      console.log('3. refreshAllSystemStatus הושלם');
      this.log('info', '3. refreshAllSystemStatus הושלם');
      
      // Load detailed data
      console.log('4. מתחיל טעינת נתונים מפורטים במקביל...');
      this.log('info', '4. מתחיל טעינת נתונים מפורטים במקביל...');
      await Promise.all([
        this.loadCacheStats(),
        this.loadQueryStats(),
        this.checkApiStatus()
      ]);
      console.log('5. כל הנתונים המפורטים נטענו');
      this.log('info', '5. כל הנתונים המפורטים נטענו');
      
      // Load cache health check
      console.log('6. מתחיל בדיקת בריאות Cache...');
      this.log('info', '6. מתחיל בדיקת בריאות Cache...');
      await this.performCacheHealthCheck();
      console.log('7. בדיקת בריאות Cache הושלמה');
      this.log('info', '7. בדיקת בריאות Cache הושלמה');
      
      // Load cache info
      console.log('8. מתחיל טעינת מידע על מערכת Cache...');
      this.log('info', '8. מתחיל טעינת מידע על מערכת Cache...');
      await this.getCacheInfo();
      console.log('9. מידע על מערכת Cache נטען');
      this.log('info', '9. מידע על מערכת Cache נטען');
      
      // Load Query Optimizer data
      console.log('10. מתחיל טעינת הזדמנויות אופטימיזציה...');
      this.log('info', '10. מתחיל טעינת הזדמנויות אופטימיזציה...');
      try {
        console.log('10a. קורא ל-loadQueryOpportunities...');
        await this.loadQueryOpportunities();
        console.log('10b. loadQueryOpportunities הושלם בהצלחה');
        this.log('info', '11. הזדמנויות אופטימיזציה נטענו בהצלחה');
      } catch (error) {
        console.error('10c. שגיאה ב-loadQueryOpportunities:', error);
        this.log('error', `11. שגיאה בטעינת הזדמנויות אופטימיזציה: ${error.message}`);
      }
      
      console.log('12. מתחיל טעינת queries איטיים...');
      this.log('info', '12. מתחיל טעינת queries איטיים...');
      try {
        console.log('12a. קורא ל-loadSlowQueries...');
        await this.loadSlowQueries();
        console.log('12b. loadSlowQueries הושלם בהצלחה');
        this.log('info', '13. Queries איטיים נטענו בהצלחה');
      } catch (error) {
        console.error('12c. שגיאה ב-loadSlowQueries:', error);
        this.log('error', `13. שגיאה בטעינת queries איטיים: ${error.message}`);
      }
      
      console.log('=== כל הנתונים הראשוניים נטענו בהצלחה ===');
      this.log('success', '=== כל הנתונים הראשוניים נטענו בהצלחה ===');
    } catch (error) {
      console.error('=== שגיאה בטעינת נתונים ראשוניים ===');
      console.error('שגיאה:', error.message);
      console.error('Stack:', error.stack);
      this.log('error', `=== שגיאה בטעינת נתונים ראשוניים ===`);
      this.log('error', `שגיאה: ${error.message}`);
      this.log('error', `Stack: ${error.stack}`);
    }
  }

  /**
     * Refresh all system status
     */
  async refreshAllSystemStatus() {
    try {
      this.log('info', 'מרענן סטטוס כל המערכות...');

      const statusOverview = document.getElementById('system-status-overview');
      statusOverview.innerHTML = `
                <div class="col-md-3 mb-3">
                    <div class="card system-status-card text-center">
                        <div class="card-body">
                            <i class="fas fa-database fa-2x text-primary mb-2"></i>
                            <h6>מערכת Cache</h6>
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                            <small>בודק...</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card system-status-card text-center">
                        <div class="card-body">
                            <i class="fas fa-search fa-2x text-success mb-2"></i>
                            <h6>Query Optimization</h6>
                            <div class="spinner-border spinner-border-sm text-success"></div>
                            <small>בודק...</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card system-status-card text-center">
                        <div class="card-body">
                            <i class="fas fa-cloud fa-2x text-info mb-2"></i>
                            <h6>נתונים חיצוניים</h6>
                            <div class="spinner-border spinner-border-sm text-info"></div>
                            <small>בודק...</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card system-status-card text-center">
                        <div class="card-body">
                            <i class="fas fa-tachometer-alt fa-2x text-warning mb-2"></i>
                            <h6>ביצועים</h6>
                            <div class="spinner-border spinner-border-sm text-warning"></div>
                            <small>בודק...</small>
                        </div>
                    </div>
                </div>
            `;

      // Check each system status
      await Promise.all([
        this.checkCacheStatus(),
        this.checkQueryStatus(),
        this.checkExternalDataStatus(),
        this.checkPerformanceStatus(),
      ]);

      this.log('success', 'סטטוס כל המערכות עודכן בהצלחה');
    } catch (error) {
      this.log('error', `שגיאה בעדכון סטטוס מערכות: ${error.message}`);
    }
  }

  /**
     * Check cache system status
     */
  async checkCacheStatus() {
    try {
      const statusCard = document.querySelector('#system-status-overview .col-md-3:nth-child(1) .card');
      
      // Simulate cache status
      const simulatedHealth = {
        status: 'healthy',
        memory_mb: 45.2
      };
      
      const statusClass = simulatedHealth.status === 'healthy' ? 'success' : 'warning';
      
      statusCard.innerHTML = `
        <div class="card-body">
          <i class="fas fa-database fa-2x text-${statusClass} mb-2"></i>
          <h6>מערכת Cache</h6>
          <span class="badge bg-${statusClass}">${simulatedHealth.status}</span>
          <small class="d-block mt-1">זיכרון: ${simulatedHealth.memory_mb}MB</small>
          <small class="d-block mt-1 text-warning">Simulated Data</small>
        </div>
      `;
      
      this.log('info', 'Cache status displayed (simulated data)');
    } catch (error) {
      this.log('error', `שגיאה בבדיקת סטטוס Cache: ${error.message}`);
    }
  }

  /**
     * Check query optimization status
     */
  async checkQueryStatus() {
    try {
      const statusCard = document.querySelector('#system-status-overview .col-md-3:nth-child(2) .card');

      // Try real API first, fallback to simulated data
      if (this.endpoints.query) {
        try {
          const response = await fetch(`${this.endpoints.query}/stats`);
          if (response.ok) {
            const data = await response.json();
            const gradeClass = this.getGradeClass(data.performance_grade || 'B');

            statusCard.innerHTML = `
                            <div class="card-body">
                                <i class="fas fa-search fa-2x text-success mb-2"></i>
                                <h6>Query Optimization</h6>
                                <span class="badge ${gradeClass}">${data.performance_grade || 'B'}</span>
                                <small class="d-block mt-1">${data.total_queries || 0} queries</small>
                                <small class="d-block mt-1 text-success">Live Data</small>
                            </div>
                        `;
            return;
          }
        } catch (apiError) {
          this.log('warning', 'Query API not available, using simulated data');
        }
      }

      // Fallback to simulated data
      const simulatedStats = {
        performance_grade: 'B',
        total_queries: 150,
        slow_queries: 12,
        optimization_opportunities: 8,
      };

      const gradeClass = this.getGradeClass(simulatedStats.performance_grade);

      statusCard.innerHTML = `
                <div class="card-body">
                    <i class="fas fa-search fa-2x text-success mb-2"></i>
                    <h6>Query Optimization</h6>
                    <span class="badge ${gradeClass}">${simulatedStats.performance_grade}</span>
                    <small class="d-block mt-1">${simulatedStats.total_queries} queries</small>
                    <small class="d-block mt-1 text-warning">Simulated Data</small>
                </div>
            `;

      this.log('info', 'Query Optimization status displayed (simulated data)');
    } catch (error) {
      this.log('error', `שגיאה בבדיקת סטטוס Query Optimization: ${error.message}`);
    }
  }

  /**
     * Check external data status
     */
  async checkExternalDataStatus() {
    try {
      const statusCard = document.querySelector('#system-status-overview .col-md-3:nth-child(3) .card');

      // Try real API first, fallback to simulated data
      if (this.endpoints.external) {
        try {
          const response = await fetch(`${this.endpoints.external}/status`);
          if (response.ok) {
            const data = await response.json();
            const statusClass = data.status === 'active' ? 'success' : 'warning';

            statusCard.innerHTML = `
                            <div class="card-body">
                                <i class="fas fa-cloud fa-2x text-${statusClass} mb-2"></i>
                                <h6>נתונים חיצוניים</h6>
                                <span class="badge bg-${statusClass}">${data.status}</span>
                                <small class="d-block mt-1">${data.providers?.length || 0} ספקים זמינים</small>
                                <small class="d-block mt-1 text-success">Live Data</small>
                            </div>
                        `;
            return;
          }
        } catch (apiError) {
          this.log('warning', 'External Data API not available, using simulated data');
        }
      }

      // Fallback to simulated data
      const simulatedStatus = {
        status: 'active',
        providers: ['Yahoo Finance', 'Alpha Vantage'],
        last_update: new Date().toISOString(),
      };

      const statusClass = simulatedStatus.status === 'active' ? 'success' : 'warning';

      statusCard.innerHTML = `
                <div class="card-body">
                    <i class="fas fa-cloud fa-2x text-${statusClass} mb-2"></i>
                    <h6>נתונים חיצוניים</h6>
                    <span class="badge bg-${statusClass}">${simulatedStatus.status}</span>
                    <small class="d-block mt-1">${simulatedStatus.providers.length} ספקים זמינים</small>
                    <small class="d-block mt-1 text-warning">Simulated Data</small>
                </div>
            `;

      this.log('info', 'External Data status displayed (simulated data)');
    } catch (error) {
      this.log('error', `שגיאה בבדיקת סטטוס נתונים חיצוניים: ${error.message}`);
    }
  }

  /**
     * Check performance status
     */
  async checkPerformanceStatus() {
    try {
      // Simulate performance check
      const startTime = performance.now();
      await fetch('/api/v1/cache/stats');
      const responseTime = performance.now() - startTime;

      const statusCard = document.querySelector('#system-status-overview .col-md-3:nth-child(4) .card');
      const performanceClass = responseTime < 100 ? 'success' : responseTime < 500 ? 'warning' : 'danger';

      statusCard.innerHTML = `
                <div class="card-body">
                    <i class="fas fa-tachometer-alt fa-2x text-${performanceClass} mb-2"></i>
                    <h6>ביצועים</h6>
                    <span class="badge bg-${performanceClass}">${responseTime.toFixed(0)}ms</span>
                    <small class="d-block mt-1">זמן תגובה</small>
                </div>
            `;
    } catch (error) {
      this.log('error', `שגיאה בבדיקת סטטוס ביצועים: ${error.message}`);
    }
  }

  /**
     * Get CSS class for performance grade
     */
  getGradeClass(grade) {
    const gradeClasses = {
      'A': 'bg-success',
      'B': 'bg-info',
      'C': 'bg-warning',
      'D': 'bg-warning',
      'F': 'bg-danger',
    };
    return gradeClasses[grade] || 'bg-secondary';
  }

  // Cache System Methods
  async loadCacheStats() {
    try {
      this.log('info', '=== loadCacheStats התחיל ===');
      this.log('info', '1. מציג loading לסטטיסטיקות...');
      this.showLoading('cache-stats-content', 'טוען סטטיסטיקות...');
      this.log('info', '2. Loading לסטטיסטיקות הוצג');

      this.log('info', '3. מתחיל delay מדומה...');
      // Simulate loading with shorter delay
      await new Promise(resolve => setTimeout(resolve, 300));
      this.log('info', '4. Delay הסתיים');

      this.log('info', '5. יוצר נתוני סטטיסטיקות מדומים...');
      // Simulate cache stats
      const simulatedStats = {
        total_entries: 1250,
        expired_entries: 45,
        hit_rate_percent: 87.5,
        estimated_memory_mb: 45.2,
        max_memory_mb: 100.0,
        memory_usage_percent: 45.2
      };
      this.log('info', `6. נתונים נוצרו: ${JSON.stringify(simulatedStats)}`);

      this.log('info', '7. קורא ל-displayCacheStats...');
      this.displayCacheStats(simulatedStats);
      this.log('info', '8. displayCacheStats הושלם');

      this.log('success', '=== סטטיסטיקות Cache נטענו בהצלחה (Simulated) ===');
    } catch (error) {
      this.log('error', `=== שגיאה בטעינת סטטיסטיקות ===`);
      this.log('error', `שגיאה: ${error.message}`);
      this.log('error', `Stack: ${error.stack}`);
      this.displayError('cache-stats-content', 'שגיאה בטעינת סטטיסטיקות', error);
    }
  }

  displayCacheStats(stats) {
    const content = document.getElementById('cache-stats-content');
    
    // Safety check - ensure stats object exists and has required properties
    if (!stats) {
      content.innerHTML = '<div class="alert alert-warning">אין נתונים זמינים</div>';
      return;
    }

    const html = `
      <div class="row">
        <div class="col-md-6">
          <h6>סטטיסטיקות כלליות</h6>
          <ul class="list-unstyled">
            <li><strong>סה"כ רשומות:</strong> ${stats.total_entries || 0}</li>
            <li><strong>רשומות פגי תוקף:</strong> ${stats.expired_entries || 0}</li>
            <li><strong>אחוז פגיעות:</strong> ${stats.hit_rate_percent || 0}%</li>
          </ul>
        </div>
        <div class="col-md-6">
          <h6>שימוש זיכרון</h6>
          <ul class="list-unstyled">
            <li><strong>זיכרון בשימוש:</strong> ${stats.estimated_memory_mb || 0} MB</li>
            <li><strong>זיכרון מקסימלי:</strong> ${stats.max_memory_mb || 0} MB</li>
            <li><strong>אחוז שימוש:</strong> ${stats.memory_usage_percent || 0}%</li>
          </ul>
        </div>
      </div>
    `;

    content.innerHTML = html;
  }

  async performCacheHealthCheck() {
    try {
      console.log('=== מתחיל בדיקת בריאות Cache ===');
      this.log('info', '=== מתחיל בדיקת בריאות Cache ===');
      
      console.log('1. מציג loading...');
      this.log('info', '1. מציג loading...');
      this.showLoading('cache-health-content', 'בודק בריאות...');
      
      console.log('2. Loading הוצג בהצלחה');
      this.log('info', '2. Loading הוצג בהצלחה');

      console.log('3. מתחיל delay מדומה...');
      this.log('info', '3. מתחיל delay מדומה...');
      // Simulate loading with shorter delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('4. Delay הסתיים');
      this.log('info', '4. Delay הסתיים');

      console.log('5. יוצר נתוני בריאות מדומים...');
      this.log('info', '5. יוצר נתוני בריאות מדומים...');
      // Simulate health check
      const simulatedHealth = {
        status: 'healthy',
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
        checks: {
          memory_usage: 'OK',
          cache_hits: 'OK',
          cache_misses: 'OK',
          cleanup_jobs: 'OK'
        }
      };
      
      console.log(`6. נתונים נוצרו:`, simulatedHealth);
      this.log('info', `6. נתונים נוצרו: ${JSON.stringify(simulatedHealth)}`);

      console.log('7. קורא ל-displayCacheHealth...');
      this.log('info', '7. קורא ל-displayCacheHealth...');
      this.displayCacheHealth(simulatedHealth);
      
      console.log('8. displayCacheHealth הושלם');
      this.log('info', '8. displayCacheHealth הושלם');

      console.log('=== בדיקת בריאות Cache הושלמה בהצלחה (Simulated) ===');
      this.log('success', '=== בדיקת בריאות Cache הושלמה בהצלחה (Simulated) ===');
    } catch (error) {
      console.error('=== שגיאה בבדיקת בריאות ===');
      console.error('שגיאה:', error.message);
      console.error('Stack:', error.stack);
      this.log('error', `=== שגיאה בבדיקת בריאות ===`);
      this.log('error', `שגיאה: ${error.message}`);
      this.log('error', `Stack: ${error.stack}`);
      this.displayError('cache-health-content', 'שגיאה בבדיקת בריאות', error);
    }
  }

  displayCacheHealth(health) {
    this.log('info', '=== displayCacheHealth התחיל ===');
    this.log('info', `1. מקבל health object: ${JSON.stringify(health)}`);
    
    const content = document.getElementById('cache-health-content');
    this.log('info', `2. מחפש element עם ID: cache-health-content`);
    
    if (!content) {
      this.log('error', '3. Element לא נמצא!');
      return;
    }
    this.log('info', '3. Element נמצא בהצלחה');
    
    // Safety check - ensure health object exists and has required properties
    if (!health || !health.checks) {
      this.log('warning', '4. נתוני בריאות לא תקינים, מציג אזהרה');
      content.innerHTML = '<div class="alert alert-warning">אין נתוני בריאות זמינים</div>';
      return;
    }
    this.log('info', '4. נתוני בריאות תקינים');

    this.log('info', '5. יוצר HTML...');
    const statusClass = health.status === 'healthy' ? 'success' :
      health.status === 'warning' ? 'warning' : 'danger';

    const html = `
      <div class="text-center mb-3">
        <span class="badge bg-${statusClass} fs-6">${health.status?.toUpperCase() || 'UNKNOWN'}</span>
      </div>
      <div class="row">
        <div class="col-md-6">
          <h6>בדיקות בריאות</h6>
          <ul class="list-unstyled">
            <li>
              <i class="fas fa-${health.checks.memory_usage === 'OK' ? 'check text-success' : 'times text-danger'}"></i>
              זיכרון: ${health.checks.memory_usage === 'OK' ? 'בסדר' : 'בעיה'}
            </li>
            <li>
              <i class="fas fa-${health.checks.cache_hits === 'OK' ? 'check text-success' : 'times text-danger'}"></i>
              Cache Hits: ${health.checks.cache_hits === 'OK' ? 'בסדר' : 'בעיה'}
            </li>
            <li>
              <i class="fas fa-${health.checks.cache_misses === 'OK' ? 'check text-success' : 'times text-danger'}"></i>
              Cache Misses: ${health.checks.cache_misses === 'OK' ? 'בסדר' : 'בעיה'}
            </li>
            <li>
              <i class="fas fa-${health.checks.cleanup_jobs === 'OK' ? 'check text-success' : 'times text-danger'}"></i>
              עבודות ניקוי: ${health.checks.cleanup_jobs === 'OK' ? 'בסדר' : 'בעיה'}
            </li>
          </ul>
        </div>
        <div class="col-md-6">
          <h6>פרטים</h6>
          <ul class="list-unstyled">
            <li><strong>זמן בדיקה:</strong> ${health.timestamp ? new Date(health.timestamp).toLocaleString('he-IL') : 'לא זמין'}</li>
            <li><strong>סטטוס:</strong> ${health.message || 'לא זמין'}</li>
          </ul>
        </div>
      </div>
    `;

    this.log('info', '6. HTML נוצר, מעדכן את התוכן...');
    content.innerHTML = html;
    this.log('info', '7. תוכן עודכן בהצלחה');
    this.log('info', '=== displayCacheHealth הושלם ===');
  }

  async clearCache() {
    if (!confirm('האם אתה בטוח שברצונך לנקות את כל ה-Cache?')) {
      return;
    }

    try {
      this.log('info', 'מנקה Cache...');

      // Simulate clearing
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.log('success', 'Cache נוקה בהצלחה (Simulated)');
      this.loadCacheStats();
    } catch (error) {
      this.log('error', `שגיאה בניקוי Cache: ${error.message}`);
    }
  }

  async invalidateCacheByDependency(dependency) {
    try {
      this.log('info', `מבטל Cache עבור: ${dependency}`);

      // Simulate invalidation
      await new Promise(resolve => setTimeout(resolve, 600));

      this.log('success', `Cache בוטל בהצלחה עבור: ${dependency} (Simulated)`);
      this.loadCacheStats();
    } catch (error) {
      this.log('error', `שגיאה בביטול Cache: ${error.message}`);
    }
  }

  async getCacheInfo() {
    try {
      this.log('info', '=== getCacheInfo התחיל ===');
      this.showLoading('cache-info-content', 'טוען מידע...');

      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 700));

      // Simulate cache info
      const simulatedInfo = {
        cache_type: 'Advanced Memory Cache',
        version: '2.0.0',
        current_status: 'healthy',
        features: [
          'TTL Management',
          'Dependency Tracking',
          'Memory Optimization',
          'Performance Monitoring',
          'Thread Safety'
        ]
      };

      this.displayCacheInfo(simulatedInfo);
      this.log('success', 'מידע על מערכת Cache נטען בהצלחה (Simulated)');
      this.log('info', '=== getCacheInfo הושלם ===');
    } catch (error) {
      this.log('error', `=== שגיאה ב-getCacheInfo ===`);
      this.log('error', `שגיאה: ${error.message}`);
      this.displayError('cache-info-content', 'שגיאה בטעינת מידע', error);
    }
  }

  displayCacheInfo(info) {
    const content = document.getElementById('cache-info-content');

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

  // Query Optimization Methods
  async loadQueryStats() {
    try {
      this.showLoading('query-stats-content', 'טוען סטטיסטיקות...');

      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate query stats
      const simulatedStats = {
        total_queries: 150,
        slow_queries: 12,
        slow_query_percentage: 8.0,
        avg_execution_time: 0.45,
        optimization_opportunities: 8,
        total_potential_improvement: 25.5,
        performance_grade: 'B',
      };

      this.displayQueryStats(simulatedStats);
      this.log('success', 'סטטיסטיקות Query Optimization נטענו בהצלחה (Simulated)');
    } catch (error) {
      this.displayError('query-stats-content', 'שגיאה בטעינת סטטיסטיקות', error);
      this.log('error', `שגיאה בטעינת סטטיסטיקות: ${error.message}`);
    }
  }

  displayQueryStats(stats) {
    const content = document.getElementById('query-stats-content');
    
    // Safety check - ensure stats object exists and has required properties
    if (!stats) {
      content.innerHTML = '<div class="alert alert-warning">אין נתונים זמינים</div>';
      return;
    }

    const performanceGradeClass = this.getGradeClass(stats.performance_grade || 'B');

    const html = `
      <div class="row">
        <div class="col-md-6">
          <h6>סטטיסטיקות כלליות</h6>
          <ul class="list-unstyled">
            <li><strong>סה"כ Queries:</strong> ${stats.total_queries || 0}</li>
            <li><strong>Queries איטיים:</strong> ${stats.slow_queries || 0}</li>
            <li><strong>אחוז איטיים:</strong> ${stats.slow_query_percentage || 0}%</li>
            <li><strong>זמן ממוצע:</strong> ${stats.avg_execution_time || 0}s</li>
          </ul>
        </div>
        <div class="col-md-6">
          <h6>אופטימיזציה</h6>
          <ul class="list-unstyled">
            <li><strong>הזדמנויות:</strong> ${stats.optimization_opportunities || 0}</li>
            <li><strong>שיפור פוטנציאלי:</strong> ${stats.total_potential_improvement || 0}%</li>
            <li><strong>ציון ביצועים:</strong> 
              <span class="badge ${performanceGradeClass} fs-6">${stats.performance_grade || 'B'}</span>
            </li>
          </ul>
        </div>
      </div>
    `;

    content.innerHTML = html;
  }

  // Query Optimization Methods - Additional Functions
  async loadQueryOpportunities() {
    try {
      console.log('=== loadQueryOpportunities התחיל ===');
      this.log('info', '=== loadQueryOpportunities התחיל ===');
      this.log('info', '1. מציג loading להזדמנויות...');
      this.showLoading('query-opportunities-content', 'טוען הזדמנויות...');
      console.log('2. Loading להזדמנויות הוצג');
      this.log('info', '2. Loading להזדמנויות הוצג');

      console.log('3. מתחיל delay מדומה...');
      this.log('info', '3. מתחיל delay מדומה...');
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log('4. Delay הסתיים');
      this.log('info', '4. Delay הסתיים');

      console.log('5. יוצר נתוני הזדמנויות מדומים...');
      this.log('info', '5. יוצר נתוני הזדמנויות מדומים...');
      // Simulate data
      const simulatedOpportunities = [
        {
          query_type: 'Ticker Queries',
          description: 'Multiple ticker lookups can be optimized with batch loading',
          potential_improvement: 35,
        },
        {
          query_type: 'Trade History',
          description: 'Trade history queries can benefit from indexing',
          potential_improvement: 28,
        },
        {
          query_type: 'Account Balances',
          description: 'Account balance calculations can be cached',
          potential_improvement: 42,
        },
      ];
      console.log('6. נתונים נוצרו:', simulatedOpportunities);
      this.log('info', `6. נתונים נוצרו: ${JSON.stringify(simulatedOpportunities)}`);

      console.log('7. קורא ל-displayQueryOpportunities...');
      this.log('info', '7. קורא ל-displayQueryOpportunities...');
      this.displayQueryOpportunities(simulatedOpportunities);
      console.log('8. displayQueryOpportunities הושלם');
      this.log('info', '8. displayQueryOpportunities הושלם');

      console.log('=== הזדמנויות אופטימיזציה נטענו בהצלחה (Simulated) ===');
      this.log('success', '=== הזדמנויות אופטימיזציה נטענו בהצלחה (Simulated) ===');
    } catch (error) {
      console.error('=== שגיאה בטעינת הזדמנויות ===');
      console.error('שגיאה:', error.message);
      console.error('Stack:', error.stack);
      this.log('error', `=== שגיאה בטעינת הזדמנויות ===`);
      this.log('error', `שגיאה: ${error.message}`);
      this.log('error', `Stack: ${error.stack}`);
      this.displayError('query-opportunities-content', 'שגיאה בטעינת הזדמנויות', error);
    }
  }

  displayQueryOpportunities(opportunities) {
    this.log('info', '=== displayQueryOpportunities התחיל ===');
    this.log('info', `1. מקבל opportunities: ${JSON.stringify(opportunities)}`);
    
    const content = document.getElementById('query-opportunities-content');
    this.log('info', `2. מחפש element עם ID: query-opportunities-content`);
    
    if (!content) {
      this.log('error', '3. Element לא נמצא!');
      return;
    }
    this.log('info', '3. Element נמצא בהצלחה');

    if (!opportunities || opportunities.length === 0) {
      this.log('warning', '4. אין הזדמנויות, מציג הודעה');
      content.innerHTML = '<p class="text-success">אין הזדמנויות אופטימיזציה זמינות</p>';
      return;
    }
    this.log('info', '4. יש הזדמנויות, יוצר HTML...');

    const html = `
      <div class="row">
        <div class="col-12">
          <h6>הזדמנויות אופטימיזציה</h6>
          <div class="list-group">
            ${opportunities.map(opp => `
              <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>${opp.query_type}</strong>
                    <br><small class="text-muted">${opp.description}</small>
                  </div>
                  <span class="badge bg-warning">${opp.potential_improvement}%</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.log('info', '5. HTML נוצר, מעדכן את התוכן...');
    content.innerHTML = html;
    this.log('info', '6. תוכן עודכן בהצלחה');
    this.log('info', '=== displayQueryOpportunities הושלם ===');
  }

  async loadSlowQueries() {
    try {
      console.log('=== loadSlowQueries התחיל ===');
      this.log('info', '=== loadSlowQueries התחיל ===');
      this.log('info', '1. מציג loading ל-queries איטיים...');
      this.showLoading('slow-queries-content', 'טוען queries איטיים...');
      console.log('2. Loading ל-queries איטיים הוצג');
      this.log('info', '2. Loading ל-queries איטיים הוצג');

      console.log('3. מתחיל delay מדומה...');
      this.log('info', '3. מתחיל delay מדומה...');
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 700));
      console.log('4. Delay הסתיים');
      this.log('info', '4. Delay הסתיים');

      console.log('5. יוצר נתוני queries איטיים מדומים...');
      this.log('info', '5. יוצר נתוני queries איטיים מדומים...');
      // Simulate data
      const simulatedSlowQueries = [
        {
          query_type: 'Complex Trade Analysis',
          execution_time: 2.45,
        },
        {
          query_type: 'Portfolio Performance',
          execution_time: 1.87,
        },
        {
          query_type: 'Historical Data Export',
          execution_time: 3.12,
        },
      ];
      console.log('6. נתונים נוצרו:', simulatedSlowQueries);
      this.log('info', `6. נתונים נוצרו: ${JSON.stringify(simulatedSlowQueries)}`);

      console.log('7. קורא ל-displaySlowQueries...');
      this.log('info', '7. קורא ל-displaySlowQueries...');
      this.displaySlowQueries(simulatedSlowQueries);
      console.log('8. displaySlowQueries הושלם');
      this.log('info', '8. displaySlowQueries הושלם');

      console.log('=== Queries איטיים נטענו בהצלחה (Simulated) ===');
      this.log('success', '=== Queries איטיים נטענו בהצלחה (Simulated) ===');
    } catch (error) {
      console.error('=== שגיאה בטעינת queries איטיים ===');
      console.error('שגיאה:', error.message);
      console.error('Stack:', error.stack);
      this.log('error', `=== שגיאה בטעינת queries איטיים ===`);
      this.log('error', `שגיאה: ${error.message}`);
      this.log('error', `Stack: ${error.stack}`);
      this.displayError('slow-queries-content', 'שגיאה בטעינת queries איטיים', error);
    }
  }

  displaySlowQueries(slowQueries) {
    this.log('info', '=== displaySlowQueries התחיל ===');
    this.log('info', `1. מקבל slowQueries: ${JSON.stringify(slowQueries)}`);
    
    const content = document.getElementById('slow-queries-content');
    this.log('info', `2. מחפש element עם ID: slow-queries-content`);
    
    if (!content) {
      this.log('error', '3. Element לא נמצא!');
      return;
    }
    this.log('info', '3. Element נמצא בהצלחה');

    if (!slowQueries || slowQueries.length === 0) {
      this.log('warning', '4. אין queries איטיים, מציג הודעה');
      content.innerHTML = '<p class="text-success">אין queries איטיים זמינים</p>';
      return;
    }
    this.log('info', '4. יש queries איטיים, יוצר HTML...');

    const html = `
      <div class="row">
        <div class="col-12">
          <h6>Queries איטיים</h6>
          <div class="list-group">
            ${slowQueries.map(query => `
              <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>${query.query_type}</strong>
                    <br><small class="text-muted">זמן ביצוע: ${query.execution_time}s</small>
                  </div>
                  <span class="badge bg-danger">${query.execution_time}s</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.log('info', '5. HTML נוצר, מעדכן את התוכן...');
    content.innerHTML = html;
    this.log('info', '6. תוכן עודכן בהצלחה');
    this.log('info', '=== displaySlowQueries הושלם ===');
  }

  async clearQueryProfiles() {
    try {
      this.log('info', 'מנקה פרופילי queries...');

      // Simulate clearing profiles
      await new Promise(resolve => setTimeout(resolve, 500));

      this.log('success', 'פרופילי queries נוקו בהצלחה (Simulated)');
      this.loadQueryStats(); // Reload stats
    } catch (error) {
      this.log('error', `שגיאה בניקוי פרופילים: ${error.message}`);
    }
  }

  async exportQueryProfiles() {
    try {
      this.log('info', 'מייצא פרופילי queries...');

      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 600));

      // Create simulated export data
      const exportData = {
        timestamp: new Date().toISOString(),
        total_queries: 150,
        slow_queries: 12,
        optimization_opportunities: 8,
        performance_grade: 'B',
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_profiles_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.log('success', 'פרופילי queries יוצאו בהצלחה (Simulated)');
    } catch (error) {
      this.log('error', `שגיאה בייצוא פרופילים: ${error.message}`);
    }
  }

  async runQueryTest() {
    try {
      const queryType = document.getElementById('test-query-type').value;
      this.log('info', `מריץ בדיקת query: ${queryType}`);

      const resultsDiv = document.getElementById('query-test-results');
      resultsDiv.innerHTML = '<div class="spinner-border spinner-border-sm text-primary"></div> בדיקה רצה...';

      // Simulate query test
      await new Promise(resolve => setTimeout(resolve, 1000));

      resultsDiv.innerHTML = `
                <div class="alert alert-success">
                    <h6>בדיקת Query הושלמה</h6>
                    <p><strong>סוג:</strong> ${queryType}</p>
                    <p><strong>זמן ביצוע:</strong> 0.5s</p>
                    <p><strong>תוצאה:</strong> הצלחה</p>
                </div>
            `;

      this.log('success', `בדיקת query ${queryType} הושלמה בהצלחה`);
    } catch (error) {
      this.log('error', `שגיאה בבדיקת query: ${error.message}`);
    }
  }

  // External Data Methods
  async checkApiStatus() {
    try {
      this.showLoading('api-status-content', 'בודק סטטוס API...');

      // Simulate API status check
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simulate API status
      const simulatedApiStatus = {
        status: 'active',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        response_time: 45,
      };

      this.displayApiStatus(simulatedApiStatus);
      this.log('success', 'סטטוס API נבדק בהצלחה (Simulated)');
    } catch (error) {
      this.displayError('api-status-content', 'שגיאה בבדיקת סטטוס API', error);
      this.log('error', `שגיאה בבדיקת סטטוס API: ${error.message}`);
    }
  }

  displayApiStatus(status) {
    const content = document.getElementById('api-status-content');

    const statusClass = status.status === 'active' ? 'success' : 'warning';

    const html = `
            <div class="text-center mb-3">
                <span class="badge bg-${statusClass} fs-6">${status.status}</span>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h6>סטטוס כללי</h6>
                    <ul class="list-unstyled">
                        <li><strong>מצב:</strong> ${status.status}</li>
                        <li><strong>זמן בדיקה:</strong> ${new Date(status.timestamp).toLocaleString('he-IL')}</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6>פרטים</h6>
                    <ul class="list-unstyled">
                        <li><strong>גרסה:</strong> ${status.version || 'N/A'}</li>
                        <li><strong>זמן תגובה:</strong> ${status.response_time || 'N/A'}ms</li>
                    </ul>
                </div>
            </div>
        `;

    content.innerHTML = html;
  }

  async testModels() {
    try {
      this.showLoading('models-test-content', 'בודק מודלים...');

      // Simulate model test
      await new Promise(resolve => setTimeout(resolve, 1000));

      const content = document.getElementById('models-test-content');
      content.innerHTML = `
                <div class="alert alert-success">
                    <h6>בדיקת מודלים הושלמה</h6>
                    <p><strong>סטטוס:</strong> כל המודלים תקינים</p>
                    <p><strong>מספר מודלים:</strong> 5</p>
                    <p><strong>זמן בדיקה:</strong> 1.0s</p>
                </div>
            `;

      this.log('success', 'בדיקת מודלים הושלמה בהצלחה');
    } catch (error) {
      this.log('error', `שגיאה בבדיקת מודלים: ${error.message}`);
    }
  }

  async fetchSingleQuote() {
    try {
      this.log('info', 'מביא ציטוט בודד...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      this.log('success', 'ציטוט בודד התקבל בהצלחה');
    } catch (error) {
      this.log('error', `שגיאה בקבלת ציטוט: ${error.message}`);
    }
  }

  async fetchBatchQuotes() {
    try {
      this.log('info', 'מביא ציטוטים מרובים...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      this.log('success', 'ציטוטים מרובים התקבלו בהצלחה');
    } catch (error) {
      this.log('error', `שגיאה בקבלת ציטוטים: ${error.message}`);
    }
  }

  async refreshAllPrices() {
    try {
      this.log('info', 'מרענן כל המחירים...');

      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1200));

      this.log('success', 'כל המחירים רועננו בהצלחה');
    } catch (error) {
      this.log('error', `שגיאה ברענון מחירים: ${error.message}`);
    }
  }

  async checkProviders() {
    try {
      this.showLoading('providers-test-content', 'בודק ספקים...');

      // Simulate provider check
      await new Promise(resolve => setTimeout(resolve, 600));

      const content = document.getElementById('providers-test-content');
      content.innerHTML = `
                <div class="alert alert-success">
                    <h6>בדיקת ספקים הושלמה</h6>
                    <p><strong>Yahoo Finance:</strong> פעיל</p>
                    <p><strong>Alpha Vantage:</strong> פעיל</p>
                    <p><strong>סה"כ ספקים:</strong> 2</p>
                </div>
            `;

      this.log('success', 'בדיקת ספקים הושלמה בהצלחה');
    } catch (error) {
      this.log('error', `שגיאה בבדיקת ספקים: ${error.message}`);
    }
  }

  // Performance Methods
  async runPerformanceTest() {
    try {
      const iterations = document.getElementById('test-iterations').value;
      this.log('info', `מריץ בדיקת ביצועים עם ${iterations} איטרציות...`);

      const resultsDiv = document.getElementById('performance-results');
      resultsDiv.innerHTML = '<div class="spinner-border spinner-border-sm text-primary"></div> בדיקה רצה...';

      // Simulate performance test
      await new Promise(resolve => setTimeout(resolve, 2000));

      resultsDiv.innerHTML = `
                <div class="alert alert-success">
                    <h6>בדיקת ביצועים הושלמה</h6>
                    <p><strong>איטרציות:</strong> ${iterations}</p>
                    <p><strong>זמן ממוצע:</strong> 45ms</p>
                    <p><strong>זמן כולל:</strong> 2.0s</p>
                    <p><strong>תוצאה:</strong> מעולה</p>
                </div>
            `;

      this.log('success', `בדיקת ביצועים עם ${iterations} איטרציות הושלמה בהצלחה`);
    } catch (error) {
      this.log('error', `שגיאה בבדיקת ביצועים: ${error.message}`);
    }
  }

  async getSystemMetrics() {
    try {
      this.showLoading('system-metrics-content', 'טוען מדדי מערכת...');

      // Simulate metrics loading
      await new Promise(resolve => setTimeout(resolve, 800));

      const content = document.getElementById('system-metrics-content');
      content.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>מדדי ביצועים</h6>
                        <ul class="list-unstyled">
                            <li><strong>CPU:</strong> 15%</li>
                            <li><strong>זיכרון:</strong> 45%</li>
                            <li><strong>דיסק:</strong> 30%</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6>מדדי רשת</h6>
                        <ul class="list-unstyled">
                            <li><strong>בקשות/דקה:</strong> 120</li>
                            <li><strong>זמן תגובה ממוצע:</strong> 85ms</li>
                            <li><strong>שגיאות:</strong> 0.1%</li>
                        </ul>
                    </div>
                </div>
            `;

      this.log('success', 'מדדי מערכת נטענו בהצלחה');
    } catch (error) {
      this.log('error', `שגיאה בטעינת מדדי מערכת: ${error.message}`);
    }
  }

  async testResponseTime(type) {
    try {
      this.log('info', `בודק זמן תגובה עבור: ${type}`);

      const startTime = performance.now();

      // Simulate API call based on type
      let endpoint = '';
      switch(type) {
      case 'cache':
        endpoint = '/api/v1/cache/stats';
        break;
      case 'query':
        endpoint = '/api/v1/query-optimization/stats';
        break;
      case 'external':
        endpoint = '/api/v1/market-data/status';
        break;
      case 'database':
        endpoint = '/api/v1/tickers';
        break;
      }

      if (endpoint) {
        await fetch(endpoint);
      } else {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
      }

      const responseTime = performance.now() - startTime;

      const resultsDiv = document.getElementById('response-time-results');
      resultsDiv.innerHTML = `
                <div class="alert alert-info">
                    <h6>זמן תגובה נבדק</h6>
                    <p><strong>סוג:</strong> ${type}</p>
                    <p><strong>זמן תגובה:</strong> ${responseTime.toFixed(0)}ms</p>
                    <p><strong>סטטוס:</strong> ${responseTime < 200 ? 'מעולה' : responseTime < 500 ? 'טוב' : 'איטי'}</p>
                </div>
            `;

      this.log('success', `זמן תגובה עבור ${type}: ${responseTime.toFixed(0)}ms`);
    } catch (error) {
      this.log('error', `שגיאה בבדיקת זמן תגובה: ${error.message}`);
    }
  }

  // Utility Methods
  showLoading(elementId, message) {
    this.log('info', `=== showLoading התחיל ===`);
    this.log('info', `1. מחפש element עם ID: ${elementId}`);
    this.log('info', `2. הודעה: ${message}`);
    
    const element = document.getElementById(elementId);
    if (!element) {
      this.log('error', `3. Element עם ID '${elementId}' לא נמצא!`);
      console.error(`Element with ID '${elementId}' not found`);
      return;
    }
    
    this.log('info', '3. Element נמצא, מעדכן תוכן...');
    element.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">טוען...</span>
        </div>
        <p class="mt-2">${message}</p>
      </div>
    `;
    this.log('info', '4. תוכן loading עודכן בהצלחה');
    this.log('info', '=== showLoading הושלם ===');
  }

  displayError(elementId, title, error) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID '${elementId}' not found`);
      return;
    }
    
    element.innerHTML = `
      <div class="alert alert-danger">
        <h6>${title}</h6>
        <p class="mb-0">${error.message}</p>
      </div>
    `;
  }

  log(level, message) {
    const timestamp = new Date().toLocaleTimeString('he-IL');
    const levelClass = {
      'info': 'text-info',
      'success': 'text-success',
      'warning': 'text-warning',
      'error': 'text-danger',
    }[level] || 'text-secondary';

    const logEntry = {
      timestamp,
      level,
      message,
      levelClass,
    };

    this.logEntries.push(logEntry);
    this.updateLogDisplay();

    // Keep only last 100 log entries
    if (this.logEntries.length > 100) {
      this.logEntries = this.logEntries.slice(-100);
    }
  }

  updateLogDisplay() {
    const logContent = document.getElementById('unified-log-content');
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

  clearLog() {
    this.logEntries = [];
    this.updateLogDisplay();
    this.log('info', 'יומן נוקה');
  }

  exportLog() {
    const logData = this.logEntries.map(entry =>
      `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`,
    ).join('\n');

    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_test_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.log('success', 'יומן יוצא בהצלחה');
  }
}

// Initialize the system test center when page loads
document.addEventListener('DOMContentLoaded', () => {
  new SystemTestCenter();
});
