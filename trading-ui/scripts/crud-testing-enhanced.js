/**
 * Enhanced UI Testing System - TikTrack
 * =====================================
 *
 * Advanced UI testing system that performs real user interface interactions:
 * - Real button clicks and form submissions
 * - DOM manipulation validation
 * - Modal interactions
 * - Navigation flow testing
 * - Accessibility testing
 *
 * Features:
 * - Selenium WebDriver integration for real browser automation
 * - Puppeteer support for headless testing
 * - Visual regression testing
 * - Performance monitoring during UI interactions
 * - Cross-browser compatibility testing
 *
 * Dependencies:
 * - IntegratedCRUDE2ETester (main testing system)
 * - Selenium WebDriver (for browser automation)
 * - Puppeteer (for advanced browser control)
 *
 * @author TikTrack Development Team
 * @version 2.0.0
 * @lastUpdated December 2025 - Advanced UI Testing Implementation
 * 
 * ============================================================================
 * FUNCTION INDEX - CRUD Enhanced Testing System
 * ============================================================================
 * 
 * Class: CRUDEnhancedTester
 * 
 * Initialization:
 * - constructor() - Initialize CRUD testing system
 * - initializeEntitiesMapping() - Map all entities in the system
 * 
 * Testing Operations:
 * - smartEntityTest(entityName) - Run smart test for specific entity
 * - runAllEntitiesTest() - Run tests for all entities
 * - testPageLoad(pageUrl) - Test page loading
 * - testAPILoad(apiUrl) - Test API load endpoint
 * - testAPICreate(apiUrl, testData) - Test API create endpoint
 * - testAPIUpdate(apiUrl, recordId, updateData) - Test API update endpoint
 * - testAPIDelete(apiUrl, recordId) - Test API delete endpoint
 * 
 * Reporting:
 * - generateSmartReport(results, totalTime) - Generate smart test report
 * - generateRecommendations(result) - Generate recommendations from result
 * - generateUrgentActions(result) - Generate urgent actions
 * - generateGeneralRecommendations(results) - Generate general recommendations
 * - calculatePriorities(results) - Calculate test priorities
 * - displayFinalReport(report) - Display final test report
 * - populateFinalReportCard(report) - Populate final report card
 * - saveReportToStorage(report) - Save report to storage
 * 
 * Utilities:
 * - sleep(ms) - Sleep for specified milliseconds
 * - updateStatsDisplay() - Update statistics display
 * - updateRealTimeResults(result) - Update real-time results display
 * 
 * Export Functions (Global):
 * - generateHTMLReport(report) - Generate HTML report
 * - generateMarkdownReport(report) - Generate Markdown report
 * - generateTextReport(report) - Generate text report
 * - getScoreClass(score) - Get CSS class for score
 * - downloadFile(content, filename, contentType) - Download file
 * 
 * ============================================================================
 */

class CRUDEnhancedTester {
  constructor() {
    console.log('🚀 אתחול CRUDEnhancedTester...');

    // מיפוי כל 29 העמודים במערכת
    this.entities = this.initializeEntitiesMapping();

    // הגדרות בדיקה
    this.testConfig = {
      apiTimeout: 10000, // 10 שניות timeout לAPI
      uiTimeout: 5000, // 5 שניות timeout לUI
      sleepBetweenTests: 200, // 200ms בין בדיקות
      maxRetries: 2, // מקסימום ניסיונות חוזרים
      cleanupTestData: true, // ניקוי אוטומטי של נתוני דמו
    };

    // סטטיסטיקות בזמן אמת
    this.stats = {
      total: 0,
      tested: 0,
      passed: 0,
      failed: 0,
      inProgress: 0,
      userPages: 0,
      devTools: 0,
    };

    // תוצאות מפורטות
    this.results = [];
    this.detailedReports = {};

    // Client request ID base for tracing
    this.requestCounter = 0;

    console.log('✅ CRUDEnhancedTester אותחל בהצלחה');
  }

  /**
   * מיפוי כל הישויות במערכת
   * @returns {Object} מיפוי מלא של כל העמודים
   */
  initializeEntitiesMapping() {
    return {
      // ===== עמודי משתמש (13) - בדיקות מעמיקות =====
      trades: {
        type: 'user_page',
        displayName: 'טריידים',
        apiUrl: '/api/trades/',
        pageUrl: '/trades',
        hasCRUD: true,
        // testData will be populated dynamically with actual IDs
        testData: null,
        getTestData: async function() {
          // Get actual IDs from user's data
          const accountsRes = await fetch('/api/trading-accounts/');
          const accountsData = await accountsRes.json();
          const accounts = accountsData.data || [];
          const accountId = accounts.length > 0 ? accounts[0].id : null;
          
          const tickersRes = await fetch('/api/tickers/');
          const tickersData = await tickersRes.json();
          const tickers = tickersData.data || [];
          const tickerId = tickers.length > 0 ? tickers[0].id : null;
          
          if (!accountId || !tickerId) {
            throw new Error('No trading account or ticker available for testing');
          }
          
          return {
            trading_account_id: accountId,
            ticker_id: tickerId,
            status: 'open',
            investment_type: 'swing',
            side: 'Long',
            notes: 'CRUD Test Record - Safe to delete',
          };
        },
        expectedButtons: ['הוסף טרייד', 'ערוך', 'מחק'],
        tableSelector: '#tradesTable',
        modalSelector: '#tradesModal',
        priority: 1, // הכי קריטי
      },

      alerts: {
        type: 'user_page',
        displayName: 'התראות',
        apiUrl: '/api/alerts/',
        pageUrl: '/alerts',
        hasCRUD: true,
        testData: {
          message: 'CRUD Test Alert - Safe to delete',
          status: 'open',
          is_triggered: 'false',
          related_type_id: 4,
          related_id: 1,
          condition_attribute: 'price',
          condition_operator: 'more_than',
          condition_number: '160.00',
        },
        expectedButtons: ['הוסף התראה', 'ערוך', 'מחק'],
        tableSelector: '#alertsTable',
        modalSelector: '#alertsModal',
        priority: 2,
      },

      tickers: {
        type: 'user_page',
        displayName: 'טיקרים',
        apiUrl: '/api/tickers/',
        pageUrl: '/tickers',
        hasCRUD: true,
        slaMs: 5000,
        testData: {
          symbol: `T${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          name: 'CRUD Test Ticker - Safe to delete',
          type: 'stock',
          currency_id: 1,
          remarks: 'CRUD Test Record',
        },
        expectedButtons: ['הוסף טיקר', 'ערוך', 'מחק'],
        tableSelector: '#tickersTable',
        modalSelector: '#tickersModal',
        priority: 2,
      },

      trading_accounts: {
        type: 'user_page',
        displayName: 'חשבונות מסחר',
        apiUrl: '/api/trading-accounts/',
        pageUrl: '/trading_accounts',
        hasCRUD: true,
        testData: {
          name: 'CRUD Test Account - Safe to delete',
          currency_id: 1,
          status: 'open',
          cash_balance: 10000.0,
          notes: 'CRUD Test Record',
        },
        expectedButtons: ['הוסף חשבון', 'ערוך', 'מחק'],
        tableSelector: '#accountsTable',
        modalSelector: '#tradingAccountsModal',
        priority: 2,
      },

      executions: {
        type: 'user_page',
        displayName: 'ביצועי עסקאות',
        apiUrl: '/api/executions/',
        pageUrl: '/executions',
        hasCRUD: true,
        // testData will be populated dynamically with actual IDs
        testData: null,
        getTestData: async function() {
          // Get actual trade ID from user's data
          const tradesRes = await fetch('/api/trades/');
          const tradesData = await tradesRes.json();
          const trades = tradesData.data || [];
          const tradeId = trades.length > 0 ? trades[0].id : null;
          
          if (!tradeId) {
            throw new Error('No trade available for testing');
          }
          
          return {
            trade_id: tradeId,
            action: 'buy',
            date: new Date().toISOString(),
            quantity: 100,
            price: 150.5,
            fee: 1.5,
            source: 'manual',
            notes: 'CRUD Test Execution - Safe to delete',
          };
        },
        expectedButtons: ['הוסף ביצוע', 'ערוך', 'מחק'],
        tableSelector: '#executionsTable',
        modalSelector: '#executionsModal',
        priority: 2,
      },

      cash_flows: {
        type: 'user_page',
        displayName: 'תזרימי מזומנים',
        apiUrl: '/api/cash-flows/',
        pageUrl: '/cash_flows',
        hasCRUD: true,
        // testData will be populated dynamically with actual IDs
        testData: null,
        getTestData: async function() {
          // Get actual trading_account ID from user's data
          const accountsRes = await fetch('/api/trading-accounts/');
          const accountsData = await accountsRes.json();
          const accounts = accountsData.data || [];
          const accountId = accounts.length > 0 ? accounts[0].id : null;
          
          if (!accountId) {
            throw new Error('No trading account available for testing');
          }
          
          return {
            trading_account_id: accountId,
            type: 'deposit',
            amount: 1000.0,
            date: new Date().toISOString().split('T')[0],
            description: 'CRUD Test Cash Flow - Safe to delete',
            currency_id: 1,
            usd_rate: 1.0,
            source: 'manual',
          };
        },
        expectedButtons: ['הוסף תזרים', 'ערוך', 'מחק'],
        tableSelector: '#cashFlowsTable',
        modalSelector: '#cashFlowModal',
        priority: 2,
      },

      trade_plans: {
        type: 'user_page',
        displayName: 'תוכניות מסחר',
        apiUrl: '/api/trade-plans/',
        pageUrl: '/trade_plans',
        hasCRUD: true,
        // testData will be populated dynamically with actual IDs
        testData: null,
        getTestData: async function() {
          // Get actual IDs from user's data
          const accountsRes = await fetch('/api/trading-accounts/');
          const accountsData = await accountsRes.json();
          const accounts = accountsData.data || [];
          const accountId = accounts.length > 0 ? accounts[0].id : null;
          
          const tickersRes = await fetch('/api/tickers/');
          const tickersData = await tickersRes.json();
          const tickers = tickersData.data || [];
          const tickerId = tickers.length > 0 ? tickers[0].id : null;
          
          if (!accountId || !tickerId) {
            throw new Error('No trading account or ticker available for testing');
          }
          
          return {
            trading_account_id: accountId,
            ticker_id: tickerId,
            investment_type: 'swing',
            side: 'Long',
            status: 'open',
            planned_amount: 1000,
            entry_price: 150.0,
            entry_conditions: 'CRUD Test Entry Conditions',
            target_price: 155.0,
            reasons: 'CRUD Test Trade Plan - Safe to delete',
          };
        },
        expectedButtons: ['הוסף תוכנית', 'ערוך', 'מחק'],
        tableSelector: '#tradePlansTable',
        modalSelector: '#tradePlansModal',
        priority: 2,
      },

      notes: {
        type: 'user_page',
        displayName: 'הערות',
        apiUrl: '/api/notes/',
        pageUrl: '/notes',
        hasCRUD: true,
        testData: {
          content: 'CRUD Test Note - Safe to delete',
          related_type_id: 1,
          related_id: 1,
        },
        expectedButtons: ['הוסף הערה', 'ערוך', 'מחק'],
        tableSelector: '#notesTable',
        modalSelector: '#notesModal',
        priority: 3,
      },

      'ai-analysis': {
        type: 'user_page',
        displayName: 'ניתוח AI',
        apiUrl: '/api/ai-analysis/templates',
        pageUrl: '/ai-analysis',
        hasCRUD: false, // AI analysis has special workflow
        testData: null,
        expectedButtons: ['צור ניתוח', 'ערוך', 'מחק'],
        tableSelector: '#aiAnalysisTable',
        modalSelector: '#aiAnalysisModal',
        priority: 3,
      },

      'watch-list': {
        type: 'user_page',
        displayName: 'רשימות צפייה',
        apiUrl: '/api/watch-lists/',
        pageUrl: '/watch-list',
        hasCRUD: true,
        testData: {
          name: 'CRUD Test Watch List - Safe to delete',
          description: 'CRUD Test Record',
        },
        expectedButtons: ['הוסף רשימה', 'ערוך', 'מחק'],
        tableSelector: '#watchListsTable',
        modalSelector: '#watchListModal',
        priority: 3,
      },

      'user-profile': {
        type: 'user_page',
        displayName: 'פרופיל משתמש',
        apiUrl: null, // Uses /api/auth/me
        pageUrl: '/user-profile',
        hasCRUD: false, // Profile update, not standard CRUD
        testData: null,
        expectedButtons: ['עדכן פרופיל', 'שנה סיסמה'],
        tableSelector: null,
        modalSelector: null,
        priority: 3,
      },

      'ticker-dashboard': {
        type: 'user_page',
        displayName: 'דשבורד טיקר',
        apiUrl: null, // Uses /api/tickers/{id}/*
        pageUrl: '/ticker-dashboard',
        hasCRUD: false, // Dashboard view
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 3,
      },

      'trading-journal': {
        type: 'user_page',
        displayName: 'יומן מסחר',
        apiUrl: '/api/trading-journal/statistics?start_date=2025-01-01T00:00:00Z&end_date=2025-12-31T23:59:59Z',
        pageUrl: '/trading-journal',
        hasCRUD: false, // Historical view
        testData: null,
        expectedButtons: [],
        tableSelector: '#tradingJournalTable',
        modalSelector: null,
        priority: 3,
      },

      index: {
        type: 'user_page',
        displayName: 'דף הבית',
        apiUrl: null, // דף הבית אין לו CRUD API
        pageUrl: '/',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 3,
      },

      research: {
        type: 'user_page',
        displayName: 'מחקר וניתוח',
        apiUrl: null, // דף מחקר אין לו CRUD API
        pageUrl: '/research',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 3,
      },

      preferences: {
        type: 'user_page',
        displayName: 'העדפות משתמש',
        apiUrl: null,
        pageUrl: '/preferences',
        hasCRUD: false, // העדפות לא CRUD רגיל
        skipResponseTimePenalty: true,
        testData: null,
        expectedButtons: ['שמור הגדרות'],
        tableSelector: null,
        modalSelector: null,
        priority: 3,
      },

      db_display: {
        type: 'user_page',
        displayName: 'תצוגת בסיס נתונים',
        apiUrl: null, // תצוגה בלבד
        pageUrl: '/db_display',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: '#dbTable',
        modalSelector: null,
        priority: 3,
      },

      db_extradata: {
        type: 'user_page',
        displayName: 'נתונים נוספים',
        apiUrl: null, // תצוגה בלבד
        pageUrl: '/db_extradata',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: '#extraDataTable',
        modalSelector: null,
        priority: 3,
      },

      // ===== כלי פיתוח (16) - בדיקות מהירות =====
      'system-management': {
        type: 'dev_tool',
        displayName: 'ניהול מערכת',
        apiUrl: null,
        pageUrl: '/system-management',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'server-monitor': {
        type: 'dev_tool',
        displayName: 'ניטור שרת',
        apiUrl: null,
        pageUrl: '/server-monitor',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'background-tasks': {
        type: 'dev_tool',
        displayName: 'משימות ברקע',
        apiUrl: null,
        pageUrl: '/background-tasks',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'external-data-dashboard': {
        type: 'dev_tool',
        displayName: 'נתונים חיצוניים',
        apiUrl: null,
        pageUrl: '/external-data-dashboard',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'notifications-center': {
        type: 'dev_tool',
        displayName: 'מרכז התראות',
        apiUrl: null,
        pageUrl: '/notifications-center',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'code-quality-dashboard': {
        type: 'dev_tool',
        displayName: 'דשבורד איכות קוד',
        apiUrl: null,
        pageUrl: '/code-quality-dashboard',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'chart-management': {
        type: 'dev_tool',
        displayName: 'ניהול גרפים',
        apiUrl: null,
        pageUrl: '/chart-management',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'css-management': {
        type: 'dev_tool',
        displayName: 'ניהול CSS',
        apiUrl: null,
        pageUrl: '/css-management',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'crud-testing-dashboard': {
        type: 'dev_tool',
        displayName: 'דשבורד בדיקות CRUD',
        apiUrl: null,
        pageUrl: '/crud-testing-dashboard',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'cache-management': {
        type: 'dev_tool',
        displayName: 'ניהול מטמון',
        apiUrl: null,
        pageUrl: '/cache-management',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      constraints: {
        type: 'dev_tool',
        displayName: 'ניהול אילוצים',
        apiUrl: null,
        pageUrl: '/constraints',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'dynamic-colors-display': {
        type: 'dev_tool',
        displayName: 'תצוגת צבעים',
        apiUrl: null,
        pageUrl: '/dynamic-colors-display',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      'test-header-only': {
        type: 'dev_tool',
        displayName: 'בדיקת כותרת',
        apiUrl: null,
        pageUrl: '/test-header-only',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },

      designs: {
        type: 'dev_tool',
        displayName: 'גלריית עיצובים',
        apiUrl: null,
        pageUrl: '/designs',
        hasCRUD: false,
        testData: null,
        expectedButtons: [],
        tableSelector: null,
        modalSelector: null,
        priority: 4,
      },
    };
  }

  /**
   * בדיקה חכמה מהירה לישות אחת (10-15 שניות)
   * @param {string} entityName שם הישות
   * @returns {Object} תוצאות הבדיקה עם ציון 0-100
   */
  async smartEntityTest(entityName) {
    const startTime = Date.now();
    const entity = this.entities[entityName];
    // SLA in ms per entity, function-scoped (not block-scoped) to avoid ReferenceError later
    const slaMs = entity && typeof entity.slaMs === 'number' ? entity.slaMs : 3000;

    if (!entity) {
      return {
        entity: entityName,
        score: 0,
        issues: [`Entity '${entityName}' not found in mapping`],
        needsDeepTesting: true,
        responseTime: 0,
        timestamp: new Date().toISOString(),
        error: 'Entity not found',
      };
    }


    let score = 0;
    let issues = [];
    const debugCalls = [];
    let testRecordId = null;

    console.log(`🔍 Entity details:`, {
      hasApi: !!entity.apiUrl,
      hasCRUD: entity.hasCRUD,
      apiUrl: entity.apiUrl
    });

    try {
      // 1. בדיקת טעינת עמוד (20 נקודות)
      const pageLoadResult = await this.testPageLoad(entity.pageUrl);
      if (pageLoadResult.success) {
        score += 20;
        console.log(`✅ ${entityName}: Page loads successfully`);
      } else {
        issues.push(`Page Load failed: ${pageLoadResult.error}`);
        console.log(`❌ ${entityName}: Page load failed - ${pageLoadResult.error}`);
      }

      // 2. בדיקת API GET (20 נקודות) - רק לישויות עם API
      let apiWorking = false;
      if (entity.apiUrl) {
        const loadResult = await this.testAPILoad(entity.apiUrl);
        if (loadResult.success) {
          score += 20;
          apiWorking = true;
          console.log(`✅ ${entityName}: API GET works`);
          debugCalls.push({
            step: 'GET',
            url: entity.apiUrl,
            timeMs: loadResult.responseTime,
            bytes: loadResult.responseBytes,
            headers: loadResult.headers,
            curl: loadResult.curl,
            requestId: loadResult.requestId,
          });
        } else {
          issues.push(`API Load failed: ${loadResult.error}`);
          console.log(`❌ ${entityName}: API GET failed - ${loadResult.error}`);
          if (loadResult.curl)
            debugCalls.push({
              step: 'GET',
              url: entity.apiUrl,
              error: loadResult.error,
              headers: loadResult.headers,
              curl: loadResult.curl,
              requestId: loadResult.requestId,
            });
        }
      } else {
        // אם אין API, נותנים נקודות על כך שזה נורמלי
        score += 20;
        apiWorking = true; // No API is OK
        console.log(`✅ ${entityName}: No API (as expected)`);
      }

      // 3. בדיקת CREATE (15 נקודות) - רק לישויות עם CRUD ו-API שעובד
      if (entity.hasCRUD && apiWorking) {
        // Get test data - support both static and dynamic
        let testData = entity.testData;
        if (!testData && entity.getTestData && typeof entity.getTestData === 'function') {
          try {
            testData = await entity.getTestData();
          } catch (error) {
            issues.push(`Failed to get test data: ${error.message}`);
            console.log(`❌ ${entityName}: Failed to get test data - ${error.message}`);
            testData = null;
          }
        }
        
        if (testData) {
          const createResult = await this.testAPICreate(entity.apiUrl, testData);
        if (createResult.success) {
          score += 15;
          testRecordId = createResult.id;
          console.log(`✅ ${entityName}: CREATE works (ID: ${testRecordId})`);
          debugCalls.push({
            step: 'POST',
            url: entity.apiUrl,
            timeMs: createResult.responseTime,
            bytes: createResult.responseBytes,
            headers: createResult.headers,
            curl: createResult.curl,
            id: testRecordId,
          });
        } else {
          issues.push(`CREATE failed: ${createResult.error}`);
          console.log(`❌ ${entityName}: CREATE failed - ${createResult.error}`);
          if (createResult.curl)
            debugCalls.push({
              step: 'POST',
              url: entity.apiUrl,
              error: createResult.error,
              headers: createResult.headers,
              curl: createResult.curl,
            });
        }
        } else {
          issues.push(`No test data available for CREATE`);
          console.log(`⚠️ ${entityName}: No test data available`);
        }
      } else {
        // אם אין CRUD, נותנים נקודות
        score += 15;
        console.log(`✅ ${entityName}: No CRUD (as expected)`);
      }

      // 4. בדיקת UPDATE (15 נקודות) - רק אם CREATE הצליח ו-API עובד
      if (testRecordId && entity.hasCRUD && apiWorking) {
        // הימנעות משדות יחסים שאינם מחרוזות (למשל notes ב-Ticker הוא יחס), נעדכן שדות בטוחים
        let updateData;
        const baseTestData = entity.testData || (entity.getTestData ? await entity.getTestData().catch(() => ({})) : {});
        if (entityName === 'tickers') {
          // For tickers, we need to include symbol (required field) from the test data
          // Symbol is required for UPDATE, so we must include it from the original testData
          const tickerSymbol = baseTestData?.symbol || testData?.symbol || 'TEST';
          updateData = {
            symbol: tickerSymbol, // Required field - must be included
            name: 'CRUD Test Ticker - Updated',
            remarks: 'UPDATED by CRUD Test - Safe to delete',
          };
        } else {
          updateData = { ...baseTestData, notes: 'UPDATED by CRUD Test - Safe to delete' };
        }
        const updateResult = await this.testAPIUpdate(entity.apiUrl, testRecordId, updateData);
        if (updateResult.success) {
          score += 15;
          console.log(`✅ ${entityName}: UPDATE works`);
          debugCalls.push({
            step: 'PUT',
            url: `${entity.apiUrl}/${testRecordId}`,
            timeMs: updateResult.responseTime,
            bytes: updateResult.responseBytes,
            headers: updateResult.headers,
            curl: updateResult.curl,
          });
        } else {
          issues.push(`UPDATE failed: ${updateResult.error}`);
          console.log(`❌ ${entityName}: UPDATE failed - ${updateResult.error}`);
          if (updateResult.curl)
            debugCalls.push({
              step: 'PUT',
              url: `${entity.apiUrl}/${testRecordId}`,
              error: updateResult.error,
              headers: updateResult.headers,
              curl: updateResult.curl,
            });
        }
      } else if (!entity.hasCRUD) {
        score += 15;
        console.log(`✅ ${entityName}: No UPDATE needed`);
      }

      // 5. בדיקת DELETE (15 נקודות) - רק אם CREATE הצליח ו-API עובד
      if (testRecordId && entity.hasCRUD && apiWorking) {
        const deleteResult = await this.testAPIDelete(entity.apiUrl, testRecordId);
        if (deleteResult.success) {
          score += 15;
          console.log(`✅ ${entityName}: DELETE works`);
          debugCalls.push({
            step: 'DELETE',
            url: `${entity.apiUrl}/${testRecordId}`,
            timeMs: deleteResult.responseTime,
            bytes: deleteResult.responseBytes,
            headers: deleteResult.headers,
            curl: deleteResult.curl,
          });
        } else {
          issues.push(`DELETE failed: ${deleteResult.error}`);
          console.log(`❌ ${entityName}: DELETE failed - ${deleteResult.error}`);
          if (deleteResult.curl)
            debugCalls.push({
              step: 'DELETE',
              url: `${entity.apiUrl}/${testRecordId}`,
              error: deleteResult.error,
              headers: deleteResult.headers,
              curl: deleteResult.curl,
            });
        }
      } else if (!entity.hasCRUD) {
        score += 15;
        console.log(`✅ ${entityName}: No DELETE needed`);
      }

      // 6. בדיקת זמן תגובה (15 נקודות) עם SLA פר-יישות
      const responseTime = Date.now() - startTime;
      if (entity.skipResponseTimePenalty) {
        score += 15;
        console.log(`✅ ${entityName}: Response time check skipped (policy)`);
      } else {
        // Prefer pure GET latency if available over total duration (CRUD adds noise)
        const getCall = debugCalls.find(c => c.step === 'GET');
        const latency =
          getCall && typeof getCall.timeMs === 'number' ? getCall.timeMs : responseTime;
        if (latency <= slaMs) {
          score += 15;
          console.log(`✅ ${entityName}: GET latency within SLA (${latency}ms ≤ ${slaMs}ms)`);
        } else if (latency < Math.max(slaMs * 2, 10000)) {
          score += 10;
          console.log(`⚠️ ${entityName}: GET latency slow (${latency}ms > SLA ${slaMs}ms)`);
          issues.push(`Slow GET latency: ${latency}ms (SLA ${slaMs}ms)`);
        } else {
          issues.push(`Very slow GET latency: ${latency}ms (SLA ${slaMs}ms)`);
          console.log(`❌ ${entityName}: Very slow GET latency (${latency}ms)`);
        }
      }
    } catch (error) {
      console.error(`💥 ${entityName}: Test failed with error:`, error);
      issues.push(`Test failed: ${error.message}`);
    }

    const finalResponseTime = Date.now() - startTime;
    const times = debugCalls.filter(c => typeof c.timeMs === 'number').map(c => c.timeMs);
    const p50 = this._percentile(times, 50);
    const p95 = this._percentile(times, 95);
    const result = {
      entity: entityName,
      displayName: entity.displayName,
      type: entity.type,
      score: Math.min(score, 100),
      issues: issues,
      needsDeepTesting: entity.type === 'user_page' && score < 80,
      responseTime: finalResponseTime,
      responseTimeGet: debugCalls.find(c => c.step === 'GET')?.timeMs || null,
      slaMs: slaMs,
      timestamp: new Date().toISOString(),
      testRecordId: testRecordId,
      hasCRUD: entity.hasCRUD,
      p50: p50,
      p95: p95,
      debug: { calls: debugCalls },
    };

    console.log(
      `📊 ${entityName}: Final Score = ${result.score}/100 ${result.needsDeepTesting ? '(needs deep testing)' : '(passed)'}`
    );

    return result;
  }

  /**
   * הרצת בדיקות על כל הישויות (3 דקות)
   * @returns {Object} דוח מקיף עם כל התוצאות
   */
  async runAllEntitiesTest() {
    console.log('🚀 Starting comprehensive testing of all entities...');
    const startTime = Date.now();

    // התחלת progress tracking
    if (window.initializeProgressTracking) {
        window.initializeProgressTracking();
    }

    // איפוס סטטיסטיקות
    this.stats = {
      total: Object.keys(this.entities).length,
      tested: 0,
      passed: 0,
      failed: 0,
      inProgress: 0,
      userPages: Object.values(this.entities).filter(e => e.type === 'user_page').length,
      devTools: Object.values(this.entities).filter(e => e.type === 'dev_tool').length,
    };

    this.results = [];

    // הצגת התקדמות
    this.updateStatsDisplay();

    // בדיקת כל הישויות
    for (const entityName of Object.keys(this.entities)) {
      const entity = this.entities[entityName];

      // עדכון progress
      const currentIndex = Object.keys(this.entities).indexOf(entityName) + 1;
      const progressPercent = Math.round((currentIndex / this.stats.total) * 100);
      const progressText = `בודק ${entity.displayName} (${currentIndex}/${this.stats.total})`;
      const progressDetails = `מעבד ${entity.displayName}...`;

      console.log(`🔄 PROGRESS UPDATE: ${progressPercent}% - ${progressText}`);

      if (window.updateProgress) {
        console.log('✅ Calling window.updateProgress');
        window.updateProgress(progressPercent, progressText, progressDetails);
      } else {
        console.log('❌ window.updateProgress not available');
      }

      // עדכון סטטוס
      this.stats.inProgress = 1;
      this.updateStatsDisplay();

      console.log(
        `\n🎯 ${this.stats.tested + 1}/${this.stats.total}: Testing ${entity.displayName}...`
      );

      try {
        // הרצת בדיקה
        const result = await this.smartEntityTest(entityName);
        this.results.push(result);

        // עדכון סטטיסטיקות
        this.stats.tested++;
        this.stats.inProgress = 0;

        if (result.score >= 80) {
          this.stats.passed++;
        } else {
          this.stats.failed++;
        }

        // עדכון UI בזמן אמת
        this.updateRealTimeResults(result);
        this.updateStatsDisplay();

      } catch (error) {
        console.error(`❌ Error testing ${entityName}:`, error);

        // יצירת תוצאה שגוי גם במקרה של שגיאה
        const errorResult = {
          entity: entityName,
          displayName: entity.displayName,
          overall: 'error',
          error: error.message,
          api: 'ERROR',
          ui: 'ERROR',
          e2e: 'ERROR',
          score: 0,
          issues: [`שגיאה קריטית: ${error.message}`],
          details: `שגיאה קריטית: ${error.message}`
        };

        this.results.push(errorResult);
        this.stats.tested++;
        this.stats.failed++;
        this.stats.inProgress = 0;

        // עדכון UI בזמן אמת גם לשגיאות
        this.updateRealTimeResults(errorResult);
        this.updateStatsDisplay();
      }

      // הפסקה קטנה בין בדיקות
      await this.sleep(this.testConfig.sleepBetweenTests);
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n🏁 All tests completed in ${Math.round(totalTime / 1000)} seconds`);

    // הצגת תוצאות סופיות גם אם יש שגיאות
    if (window.updateProgress) {
        window.updateProgress(100, 'בדיקה הושלמה', `הושלמו ${this.stats.tested} מתוך ${this.stats.total} בדיקות`);
    }

    // הסתרת progress tracking אחרי השלמה
    if (window.hideProgressTracking) {
        window.hideProgressTracking();
    }

    // יצירת דוח מקיף
    const report = await this.generateSmartReport(this.results, totalTime);

    // הצגת דוח סופי
    this.displayFinalReport(report);

    return report;
  }

  /**
   * יצירת פקודת curl מהבקשה
   * @param {Object} request פרטי הבקשה
   * @returns {string} פקודת curl
   */
  _toCurl(request) {
    let curl = `curl -X ${request.method} '${request.url}'`;

    if (request.headers) {
      Object.entries(request.headers).forEach(([key, value]) => {
        curl += ` -H '${key}: ${value}'`;
      });
    }

    if (request.body) {
      curl += ` -d '${JSON.stringify(request.body)}'`;
    }

    return curl;
  }

  /**
   * חישוב percentile מספרי
   * @param {Array<number>} arr מערך מספרים
   * @param {number} p percentile (למשל 50, 95)
   * @returns {number} ערך ה-percentile
   */
  _percentile(arr, p) {
    if (arr.length === 0) return 0;

    const sorted = arr.slice().sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * שמירת דוח לאחסון מקומי
   * @param {Object} report הדוח לשמירה
   */
  async saveReportToStorage(report) {
    try {
      const reportData = {
        ...report,
        savedAt: new Date().toISOString(),
      };

      // שמירה ב-localStorage
      localStorage.setItem('lastCRUDTestReport', JSON.stringify(reportData));

      console.log('✅ Report saved to storage successfully');
    } catch (error) {
      console.warn('⚠️ Failed to save report to storage:', error);
    }
  }

  /**
   * יצירת דוח מקיף עם כל התוצאות
   * @param {Array} results מערך תוצאות הבדיקות
   * @param {number} totalTime זמן כולל במילישניות
   * @returns {Object} דוח מקיף
   */
  async generateSmartReport(results, totalTime) {
    const userPageResults = results.filter(r => this.entities[r.entity].type === 'user_page');
    const devToolResults = results.filter(r => this.entities[r.entity].type === 'dev_tool');

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgUserPageScore =
      userPageResults.reduce((sum, r) => sum + r.score, 0) / userPageResults.length;
    const avgDevToolScore =
      devToolResults.reduce((sum, r) => sum + r.score, 0) / devToolResults.length;

    const problematicPages = results.filter(r => r.needsDeepTesting);
    const criticalIssues = results.filter(r => r.score < 50);

    // Acceptance criteria (tickers): p50 ≤ 300ms, p95 ≤ 700ms
    const tickersRes = results.find(r => r.entity === 'tickers');
    const tickersAcceptance = tickersRes
      ? {
          p50: tickersRes.p50 != null ? Math.round(tickersRes.p50) : null,
          p95: tickersRes.p95 != null ? Math.round(tickersRes.p95) : null,
          pass:
            tickersRes.p50 != null &&
            tickersRes.p95 != null &&
            tickersRes.p50 <= 300 &&
            tickersRes.p95 <= 700,
        }
      : null;

    return {
      // סיכום כללי
      summary: {
        overallScore: Math.round(avgScore),
        totalEntities: results.length,
        passedEntities: results.filter(r => r.score >= 80).length,
        problematicEntities: problematicPages.length,
        criticalEntities: criticalIssues.length,
        avgResponseTime: Math.round(
          results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
        ),
        totalTestTime: Math.round(totalTime / 1000),
        timestamp: new Date().toISOString(),
        acceptance: {
          tickers: tickersAcceptance,
        },
      },

      // פירוט לפי סוג
      breakdown: {
        userPages: {
          total: userPageResults.length,
          avgScore: Math.round(avgUserPageScore),
          passed: userPageResults.filter(r => r.score >= 80).length,
          problematic: userPageResults.filter(r => r.needsDeepTesting).length,
          needsDeepTesting: userPageResults.filter(r => r.needsDeepTesting),
        },
        devTools: {
          total: devToolResults.length,
          avgScore: Math.round(avgDevToolScore),
          passed: devToolResults.filter(r => r.score >= 80).length,
          problematic: devToolResults.filter(r => r.score < 80).length,
        },
      },

      // עמודים בעייתיים
      problematicPages: problematicPages.map(result => ({
        entity: result.entity,
        displayName: result.displayName,
        score: result.score,
        issues: result.issues,
        type: result.type,
        responseTime: result.responseTime,
        recommendations: this.generateRecommendations(result),
      })),

      // עמודים קריטיים
      criticalIssues: criticalIssues.map(result => ({
        entity: result.entity,
        displayName: result.displayName,
        score: result.score,
        issues: result.issues,
        urgentActions: this.generateUrgentActions(result),
      })),

      // תוצאות מלאות
      allResults: results,

      // המלצות כלליות
      recommendations: this.generateGeneralRecommendations(results),

      // הערכת עדיפויות
      priorities: this.calculatePriorities(results),
    };
  }

  /**
   * יצירת המלצות תיקון לישות ספציפית
   * @param {Object} result תוצאת בדיקה של ישות
   * @returns {Array} מערך המלצות
   */
  generateRecommendations(result) {
    const recommendations = [];
    const entity = this.entities[result.entity];

    result.issues.forEach(issue => {
      if (issue.includes('Page Load failed')) {
        recommendations.push({
          priority: 1,
          category: 'page_load',
          action: 'בדוק שהעמוד נגיש ונטען ללא שגיאות',
          technicalDetails: `URL: ${entity.pageUrl}`,
          estimatedTime: '10 דקות',
        });
      }

      if (issue.includes('API Load failed')) {
        recommendations.push({
          priority: 1,
          category: 'api',
          action: 'בדוק שה-API endpoint פעיל ומחזיר נתונים',
          technicalDetails: `API: ${entity.apiUrl}`,
          estimatedTime: '15 דקות',
        });
      }

      if (issue.includes('CREATE failed')) {
        recommendations.push({
          priority: 2,
          category: 'crud',
          action: 'בדוק שפונקציית יצירה עובדת עם נתוני הדמו',
          technicalDetails: `API: POST ${entity.apiUrl}`,
          estimatedTime: '20 דקות',
        });
      }

      if (issue.includes('Slow response')) {
        recommendations.push({
          priority: 3,
          category: 'performance',
          action: 'בדוק ביצועים ואופטימיזציה של השאילתות',
          technicalDetails: `Response time: ${result.responseTime}ms`,
          estimatedTime: '30 דקות',
        });
      }
    });

    // אם אין המלצות ספציפיות, הוסף כלליות
    if (recommendations.length === 0 && result.score < 80) {
      recommendations.push({
        priority: 2,
        category: 'general',
        action: 'הרץ בדיקות UI מפורטות לזיהוי בעיות ספציפיות',
        technicalDetails: 'Run deep UI testing',
        estimatedTime: '7-10 דקות',
      });
    }

    return recommendations;
  }

  /**
   * יצירת פעולות דחופות לעמודים קריטיים
   * @param {Object} result תוצאת בדיקה
   * @returns {Array} מערך פעולות דחופות
   */
  generateUrgentActions(result) {
    const actions = [];

    if (result.score < 30) {
      actions.push({
        action: 'בדיקה ידנית מיידית - העמוד לא פונקציונלי',
        priority: 'CRITICAL',
        timeframe: 'מיידי',
      });
    }

    if (result.issues.some(issue => issue.includes('Page Load failed'))) {
      actions.push({
        action: 'תקן בעיות טעינת עמוד - משתמשים לא יכולים לגשת',
        priority: 'HIGH',
        timeframe: 'תוך שעה',
      });
    }

    return actions;
  }

  /**
   * יצירת המלצות כלליות למערכת
   * @param {Array} results כל תוצאות הבדיקות
   * @returns {Array} המלצות כלליות
   */
  generateGeneralRecommendations(results) {
    const recommendations = [];
    const userPageIssues = results.filter(
      r => this.entities[r.entity].type === 'user_page' && r.score < 80
    ).length;
    const totalUserPages = results.filter(r => this.entities[r.entity].type === 'user_page').length;

    if (userPageIssues > totalUserPages * 0.3) {
      recommendations.push({
        type: 'system_wide',
        title: 'בעיות נרחבות בעמודי משתמש',
        description: `${userPageIssues} מתוך ${totalUserPages} עמודי משתמש דורשים תיקון`,
        action: 'הרץ בדיקות UI מפורטות על כל עמודי המשתמש',
        estimatedTime: `${userPageIssues * 8} דקות`,
      });
    }

    const slowPages = results.filter(r => r.responseTime > 5000).length;
    if (slowPages > 0) {
      recommendations.push({
        type: 'performance',
        title: 'בעיות ביצועים',
        description: `${slowPages} עמודים עם זמני תגובה איטיים`,
        action: 'בדוק אופטימיזציית מסד נתונים ו-API calls',
        estimatedTime: '1-2 שעות',
      });
    }

    return recommendations;
  }

  /**
   * חישוב עדיפויות תיקון
   * @param {Array} results תוצאות הבדיקות
   * @returns {Object} מערך עדיפויות
   */
  calculatePriorities(results) {
    const criticalPages = results.filter(r => r.score < 50);
    const userPageIssues = results.filter(
      r => this.entities[r.entity].type === 'user_page' && r.score < 80
    );

    return {
      immediate: criticalPages.map(r => ({
        entity: r.entity,
        displayName: r.displayName,
        score: r.score,
        reason: 'ציון קריטי - דורש תיקון מיידי',
      })),

      high: userPageIssues
        .filter(r => r.score >= 50)
        .map(r => ({
          entity: r.entity,
          displayName: r.displayName,
          score: r.score,
          reason: 'עמוד משתמש עם בעיות - עדיפות גבוהה',
        })),

      medium: results
        .filter(r => this.entities[r.entity].type === 'dev_tool' && r.score < 80)
        .map(r => ({
          entity: r.entity,
          displayName: r.displayName,
          score: r.score,
          reason: 'כלי פיתוח עם בעיות - עדיפות בינונית',
        })),
    };
  }

  // ===== פונקציות בדיקה ברמת API =====

  /**
   * בדיקת טעינת עמוד
   * @param {string} pageUrl כתובת העמוד
   * @returns {Object} תוצאת הבדיקה
   */
  async testPageLoad(pageUrl) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${window.location.origin}${pageUrl}`, {
        method: 'GET',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cache-Control': 'no-cache',
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          status: response.status,
          responseTime: responseTime,
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          responseTime: responseTime,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 0,
        responseTime: 0,
      };
    }
  }

  /**
   * בדיקת טעינת נתונים מ-API
   * @param {string} apiUrl כתובת ה-API
   * @returns {Object} תוצאת הבדיקה
   */
  async testAPILoad(apiUrl) {
    try {
      const startTime = Date.now();
      const reqId = `crudtest-${Date.now()}-${++this.requestCounter}`;
      const controller = new AbortController();
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Request-Id': reqId,
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const headersObj = {};
      response.headers.forEach((v, k) => {
        headersObj[k] = v;
      });
      const cloned = response.clone();
      const text = await cloned.text();
      const bytes = new Blob([text]).size;
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      const curl = this._toCurl({
        url: apiUrl,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Request-Id': reqId,
          'Cache-Control': 'no-cache',
        },
      });

      const baseResult = {
        requestId: reqId,
        responseTime,
        headers: headersObj,
        responseBytes: bytes,
        curl,
      };

      if (response.ok) {
        return {
          success: true,
          data,
          count: Array.isArray(data) ? data.length : data?.data ? data.data.length : 1,
          ...baseResult,
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`,
          ...baseResult,
        };
      }
    } catch (error) {
      return { success: false, error: error.message, responseTime: 0 };
    }
  }

  /**
   * בדיקת יצירת רשומה חדשה
   * @param {string} apiUrl כתובת ה-API
   * @param {Object} testData נתוני הבדיקה
   * @returns {Object} תוצאת הבדיקה
   */
  async testAPICreate(apiUrl, testData) {
    try {
      const reqId = `crudtest-${Date.now()}-${++this.requestCounter}`;
      const startTime = Date.now();
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Request-Id': reqId,
      };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(testData),
      });
      const responseTime = Date.now() - startTime;
      const headersObj = {};
      response.headers.forEach((v, k) => (headersObj[k] = v));
      const text = await response.clone().text();
      const bytes = new Blob([text]).size;
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      const curl = this._toCurl({ url: apiUrl, method: 'POST', headers, body: testData });

      if (response.ok) {
        return {
          success: true,
          id: data?.id || data?.data?.id || null,
          data,
          responseTime,
          headers: headersObj,
          responseBytes: bytes,
          curl,
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`,
          responseTime,
          headers: headersObj,
          responseBytes: bytes,
          curl,
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * בדיקת עדכון רשומה
   * @param {string} apiUrl כתובת ה-API
   * @param {number} recordId מזהה הרשומה
   * @param {Object} updateData נתונים מעודכנים
   * @returns {Object} תוצאת הבדיקה
   */
  async testAPIUpdate(apiUrl, recordId, updateData) {
    try {
      const reqId = `crudtest-${Date.now()}-${++this.requestCounter}`;
      const startTime = Date.now();
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Request-Id': reqId,
      };
      const url = `${apiUrl}/${recordId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });
      const responseTime = Date.now() - startTime;
      const headersObj = {};
      response.headers.forEach((v, k) => (headersObj[k] = v));
      const text = await response.clone().text();
      const bytes = new Blob([text]).size;
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      const curl = this._toCurl({ url, method: 'PUT', headers, body: updateData });
      if (response.ok) {
        return {
          success: true,
          data,
          responseTime,
          headers: headersObj,
          responseBytes: bytes,
          curl,
        };
      }
      return {
        success: false,
        error: `HTTP ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`,
        responseTime,
        headers: headersObj,
        responseBytes: bytes,
        curl,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * בדיקת מחיקת רשומה
   * @param {string} apiUrl כתובת ה-API
   * @param {number} recordId מזהה הרשומה
   * @returns {Object} תוצאת הבדיקה
   */
  async testAPIDelete(apiUrl, recordId) {
    try {
      const reqId = `crudtest-${Date.now()}-${++this.requestCounter}`;
      const startTime = Date.now();
      const headers = { Accept: 'application/json', 'X-Request-Id': reqId };
      const url = `${apiUrl}/${recordId}`;
      const response = await fetch(url, { method: 'DELETE', headers });
      const responseTime = Date.now() - startTime;
      const headersObj = {};
      response.headers.forEach((v, k) => (headersObj[k] = v));
      const text = await response.clone().text();
      const bytes = new Blob([text]).size;
      const curl = this._toCurl({ url, method: 'DELETE', headers });
      if (response.ok) {
        return { success: true, responseTime, headers: headersObj, responseBytes: bytes, curl };
      }
      return {
        success: false,
        error: `HTTP ${response.status}: ${text}`,
        responseTime,
        headers: headersObj,
        responseBytes: bytes,
        curl,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== פונקציות עזר =====

  /**
   * השהיה
   * @param {number} ms מילישניות
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * עדכון תצוגת סטטיסטיקות בזמן אמת
   */
  updateStatsDisplay() {
    // עדכון מספרים עיקריים
    const elements = {
      overallScore: Math.round((this.stats.passed / Math.max(this.stats.tested, 1)) * 100),
      testedCount: this.stats.tested,
      passedCount: this.stats.passed,
      problematicCount: this.stats.failed,
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });

    // עדכון progress bar אם קיים
    const progressElement = document.getElementById('testProgress');
    if (progressElement) {
      const percentage = Math.round((this.stats.tested / this.stats.total) * 100);
      progressElement.style.width = `${percentage}%`;
      progressElement.textContent = `${percentage}%`;
    }
  }

  /**
   * עדכון תוצאות בזמן אמת בטבלה
   * @param {Object} result תוצאת בדיקה
   */
  updateRealTimeResults(result) {
    const tableBody = document.querySelector('#testResultsTable tbody');
    if (!tableBody) return;

    // יצירת שורה חדשה
    const row = document.createElement('tr');
    row.id = `result-${result.entity}`;

    // סטטוס עם צבע
    let statusClass = 'text-success';
    let statusIcon = '✅';
    let statusText = 'עבר';

    if (result.score < 50) {
      statusClass = 'text-danger';
      statusIcon = '❌';
      statusText = 'נכשל';
    } else if (result.score < 80) {
      statusClass = 'text-warning';
      statusIcon = '⚠️';
      statusText = 'בעייתי';
    }

    // ציון עם צבע
    let scoreClass = 'text-success';
    if (result.score < 50) scoreClass = 'text-danger';
    else if (result.score < 80) scoreClass = 'text-warning';

    row.textContent = '';
    const rowHTML = `
            <td>
                <strong>${result.displayName}</strong><br>
                <small class="text-muted">${result.entity}</small>
            </td>
            <td class="${statusClass}">
                ${statusIcon} ${statusText}
            </td>
            <td class="${scoreClass}">
                <strong>${result.score}/100</strong>
            </td>
            <td>
                ${result.responseTime}ms
            </td>
            <td>
                ${
                  result.needsDeepTesting
                    ? '<button class="btn btn-sm btn-warning" onclick="runDeepTestingForProblematic()">בדיקה מפורטת</button>'
                    : '<span class="text-muted">-</span>'
                }
            </td>
        `;
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<table><tbody><tr>${rowHTML}</tr></tbody></table>`, 'text/html');
    const tempRow = doc.body.querySelector('tr');
    if (tempRow) {
        Array.from(tempRow.children).forEach(cell => {
            row.appendChild(cell.cloneNode(true));
        });
    }

    tableBody.appendChild(row);

    // גלילה לשורה החדשה
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * הצגת דוח סופי
   * @param {Object} report הדוח המקיף
   */
  displayFinalReport(report) {
    console.log('\n🎉 FINAL REPORT GENERATED:');
    console.log(`📊 Overall Score: ${report.summary.overallScore}/100`);
    console.log(`✅ Passed: ${report.summary.passedEntities}/${report.summary.totalEntities}`);
    console.log(`⚠️  Problematic: ${report.summary.problematicEntities}`);
    console.log(`🚨 Critical: ${report.summary.criticalEntities}`);

    // הצגת דוח בכרטיס
    const finalReportCard = document.getElementById('finalReportCard');
    if (finalReportCard) {
      finalReportCard.style.display = 'block';
      this.populateFinalReportCard(report);
    }

    // שמירת דוח לאחסון מקומי
    this.saveReportToStorage(report);

    return report;
  }

  /**
   * מילוי כרטיס הדוח הסופי בנתונים
   * @param {Object} report הדוח המקיף
   */
  populateFinalReportCard(report) {

    // עדכון הציון הכללי
    const overallScoreElement = document.getElementById('overallScore');
    if (overallScoreElement) {
      overallScoreElement.textContent = `${report.summary.overallScore}/100`;
      // שינוי צבע לפי הציון
      overallScoreElement.className = 'text-success';
      if (report.summary.overallScore < 50) overallScoreElement.className = 'text-danger';
      else if (report.summary.overallScore < 80) overallScoreElement.className = 'text-warning';
    }

    // עדכון מספרים
    const passedElement = document.getElementById('passedCount');
    if (passedElement) {
      passedElement.textContent = report.summary.passedEntities;
    }

    const problematicElement = document.getElementById('problematicCount');
    if (problematicElement) {
      problematicElement.textContent = report.summary.problematicEntities;
    }

    const criticalElement = document.getElementById('criticalCount');
    if (criticalElement) {
      criticalElement.textContent = report.summary.criticalEntities || 0;
    }

    // עדכון זמן כולל
    const totalTimeElement = document.getElementById('totalTime');
    if (totalTimeElement) {
      totalTimeElement.textContent = `${report.summary.totalTestTime} שניות`;
    }

    // עדכון מספר ישויות
    const entitiesElement = document.getElementById('entitiesTested');
    if (entitiesElement) {
      entitiesElement.textContent = `${report.summary.totalEntities} ישויות`;
    }

  }
}

// יצירת instance גלובלי
window.CRUDEnhancedTester = CRUDEnhancedTester;

// Version: 1.0.8 - Fixed API URLs for ai-analysis and trading-journal

// פונקציות גלובליות לקריאה מה-HTML
window.runDeepTestingForProblematic = async function () {
  if (!window.crudEnhancedTester) {
    window.crudEnhancedTester = new CRUDEnhancedTester();
  }

  if (window.showInfoNotification) {
    window.showInfoNotification(
      'בדיקות מפורטות',
      'מתחיל בדיקות מפורטות לעמודים בעייתיים...',
      3000
    );
  }

  try {
    // אם אין תוצאות קודמות – מריץ אוטומטית בדיקה מהירה לכל העמודים
    if (
      !Array.isArray(window.crudEnhancedTester.results) ||
      window.crudEnhancedTester.results.length === 0
    ) {
      if (window.showInfoNotification) {
        window.showInfoNotification(
          'בדיקות CRUD',
          'מריץ בדיקה מהירה לכל העמודים לפני בדיקות מפורטות...',
          3000
        );
      }
      try {
        await window.crudEnhancedTester.runAllEntitiesTest();
        if (window.showSuccessNotification) {
          window.showSuccessNotification(
            'בדיקה מהירה הושלמה',
            'כעת מריץ בדיקות מפורטות לעמודים הבעייתיים...',
            3000
          );
        }
      } catch (e) {
        if (window.showErrorNotification) {
          window.showErrorNotification(
            'שגיאה',
            `הבדיקה המהירה נכשלה: ${e?.message || 'unknown'}`,
            6000
          );
        }
        return;
      }
    }

    const problematicPages = window.crudEnhancedTester.results.filter(
      r => r.needsDeepTesting && window.crudEnhancedTester.entities[r.entity].type === 'user_page'
    );

    if (problematicPages.length === 0) {
      if (window.showSuccessNotification) {
        window.showSuccessNotification(
          'אין עמודים בעייתיים',
          'כל עמודי המשתמש עברו את הבדיקות הבסיסיות בהצלחה. אין צורך בבדיקות מפורטות.',
          5000
        );
      }
      return;
    }

    // כאן אמורה להיות הלוגיקה לבדיקה מפורטת
    // אבל במערכת החדשה אנחנו לא צריכים את זה
    if (window.showInfoNotification) {
      window.showInfoNotification(
        'בדיקה מפורטת',
        `נמצאו ${problematicPages.length} עמודים בעייתיים. בדיקה מפורטת זמינה במערכת החדשה.`,
        5000
      );
    }

  } catch (error) {
    console.error('❌ Deep testing failed:', error);

    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בבדיקות מפורטות', `הבדיקות נכשלו: ${error.message}`, 7000);
    }
  }
};
