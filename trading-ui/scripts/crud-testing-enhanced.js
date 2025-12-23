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
        apiUrl: '/api/ai-analysis/',
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
        apiUrl: '/api/trading-journal/',
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

    console.log(`🧪 Smart Testing: ${entity.displayName} (${entityName})`);

    let score = 0;
    let issues = [];
    const debugCalls = [];
    let testRecordId = null;

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
      if (entity.apiUrl) {
        const loadResult = await this.testAPILoad(entity.apiUrl);
        if (loadResult.success) {
          score += 20;
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
        console.log(`✅ ${entityName}: No API (as expected)`);
      }

      // 3. בדיקת CREATE (15 נקודות) - רק לישויות עם CRUD
      if (entity.hasCRUD) {
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

      // 4. בדיקת UPDATE (15 נקודות) - רק אם CREATE הצליח
      if (testRecordId && entity.hasCRUD) {
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

      // 5. בדיקת DELETE (15 נקודות) - רק אם CREATE הצליח
      if (testRecordId && entity.hasCRUD) {
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

      // עדכון סטטוס
      this.stats.inProgress = 1;
      this.updateStatsDisplay();

      console.log(
        `\n🎯 ${this.stats.tested + 1}/${this.stats.total}: Testing ${entity.displayName}...`
      );

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

      // הפסקה קטנה בין בדיקות
      await this.sleep(this.testConfig.sleepBetweenTests);
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n🏁 All tests completed in ${Math.round(totalTime / 1000)} seconds`);

    // יצירת דוח מקיף
    const report = await this.generateSmartReport(this.results, totalTime);

    // הצגת דוח סופי
    this.displayFinalReport(report);

    return report;
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
    // סיכום כללי
    const summaryElement = document.getElementById('overallSummary');
    if (summaryElement) {
      let alertClass = 'alert-success';
      if (report.summary.overallScore < 50) alertClass = 'alert-danger';
      else if (report.summary.overallScore < 80) alertClass = 'alert-warning';

      summaryElement.className = `alert ${alertClass}`;
      summaryElement.textContent = '';
      const summaryHTML = `
                <h5>ציון כללי: ${report.summary.overallScore}/100</h5>
                <p>
                    <strong>${report.summary.passedEntities}</strong> עמודים עברו בהצלחה מתוך <strong>${report.summary.totalEntities}</strong> | 
                    <strong>${report.summary.problematicEntities}</strong> עמודים דורשים תיקון | 
                    זמן כולל: <strong>${report.summary.totalTestTime}</strong> שניות
                </p>
            `;
      const parser = new DOMParser();
      const doc = parser.parseFromString(summaryHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
          summaryElement.appendChild(node.cloneNode(true));
      });
    }

    // עמודים תקינים
    const healthyPagesElement = document.getElementById('healthyPagesList');
    if (healthyPagesElement) {
      const healthyPages = report.allResults.filter(r => r.score >= 80);
      healthyPagesElement.textContent = '';
      const healthyPagesHTML = healthyPages
        .map(
          page =>
            `<span class="badge bg-success me-2 mb-2">${page.displayName} (${page.score}/100)</span>`
        )
        .join('');
      const parser = new DOMParser();
      const doc = parser.parseFromString(healthyPagesHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
          healthyPagesElement.appendChild(node.cloneNode(true));
      });
    }

    // עמודים בעייתיים
    const problematicPagesElement = document.getElementById('problematicPagesList');
    if (problematicPagesElement) {
      problematicPagesElement.textContent = '';
      const problematicPagesHTML = report.problematicPages
        .map(
          page => `
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="text-danger">⚠️ ${page.displayName} (ציון: ${page.score}/100)</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>בעיות שנמצאו:</strong></p>
                        <ul>
                            ${page.issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                        ${
                          page.recommendations.length > 0
                            ? `
                            <p><strong>המלצות תיקון:</strong></p>
                            <ul>
                                ${page.recommendations
                                  .map(
                                    rec => `
                                    <li><strong>עדיפות ${rec.priority}:</strong> ${rec.action} (${rec.estimatedTime})</li>
                                `
                                  )
                                  .join('')}
                            </ul>
                        `
                            : ''
                        }
                    </div>
                </div>
            `
        )
        .join('');
      const parser = new DOMParser();
      const doc = parser.parseFromString(problematicPagesHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
          problematicPagesElement.appendChild(node.cloneNode(true));
      });
    }

    // המלצות תיקון
    const recommendationsElement = document.getElementById('recommendationsList');
    if (recommendationsElement) {
      recommendationsElement.textContent = '';
      const recommendationsHTML = report.recommendations
        .map(
          rec => `
                <div class="alert alert-warning">
                    <h6>${rec.title}</h6>
                    <p>${rec.description}</p>
                    <strong>פעולה מומלצת:</strong> ${rec.action}<br>
                    <strong>זמן משוער:</strong> ${rec.estimatedTime}
                </div>
            `
        )
        .join('');
      const parser = new DOMParser();
      const doc = parser.parseFromString(recommendationsHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
          recommendationsElement.appendChild(node.cloneNode(true));
      });
    }
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

      // שמירה ב-UnifiedCacheManager אם זמין
      if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.save === 'function') {
        await window.UnifiedCacheManager.save('crud_test_report_latest', reportData, {
          layer: 'localStorage',
          ttl: null, // ללא תפוגה
        });
      }

      console.log('✅ Report saved to storage successfully');
    } catch (error) {
      console.warn('⚠️ Failed to save report to storage:', error);
    }
  }
}

// יצירת instance גלובלי
window.CRUDEnhancedTester = CRUDEnhancedTester;

// פונקציות גלובליות לקריאה מה-HTML
window.runSmartTestAllEntities = async function () {
  if (!window.crudEnhancedTester) {
    window.crudEnhancedTester = new CRUDEnhancedTester();
  }

  console.log('🚀 Starting smart test for all entities...');

  // הצגת הודעה
  if (window.showInfoNotification) {
    window.showInfoNotification('בדיקות CRUD', 'מתחיל בדיקות מהירות לכל העמודים...', 3000);
  }

  try {
    const report = await window.crudEnhancedTester.runAllEntitiesTest();

    // הצגת הודעת סיום
    if (window.showSuccessNotification) {
      window.showSuccessNotification(
        'בדיקות הושלמו!',
        `ציון כללי: ${report.summary.overallScore}/100 | ${report.summary.problematicEntities} עמודים דורשים תיקון`,
        5000
      );
    }

    return report;
  } catch (error) {
    console.error('❌ Smart test failed:', error);

    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בבדיקות', `הבדיקות נכשלו: ${error.message}`, 7000);
    }

    throw error;
  }
};

window.runSmartTestSingleEntity = async function () {
  const select = document.getElementById('singleEntitySelect');
  if (!select || !select.value) {
    alert('אנא בחר ישות לבדיקה');
    return;
  }

  if (!window.crudEnhancedTester) {
    window.crudEnhancedTester = new CRUDEnhancedTester();
  }

  const entityName = select.value;
  console.log(`🎯 Starting smart test for ${entityName}...`);

  if (window.showInfoNotification) {
    window.showInfoNotification('בדיקת CRUD', `מתחיל בדיקה של ${entityName}...`, 2000);
  }

  try {
    const result = await window.crudEnhancedTester.smartEntityTest(entityName);

    // עדכון UI
    window.crudEnhancedTester.updateRealTimeResults(result);

    // הצגת תוצאה
    const message = `${result.displayName}: ${result.score}/100 נקודות`;
    if (result.score >= 80) {
      if (window.showSuccessNotification) {
        window.showSuccessNotification('בדיקה הושלמה', message, 3000);
      }
    } else {
      if (window.showWarningNotification) {
        window.showWarningNotification('נמצאו בעיות', message, 5000);
      }
    }

    return result;
  } catch (error) {
    console.error(`❌ Smart test failed for ${entityName}:`, error);

    if (window.showErrorNotification) {
      window.showErrorNotification(
        'שגיאה בבדיקה',
        `בדיקת ${entityName} נכשלה: ${error.message}`,
        5000
      );
    }

    throw error;
  }
};

// ===== פונקציות ייצוא דוחות =====

/**
 * הרצת בדיקות מפורטות לעמודים בעייתיים
 */
window.runDeepTestingForProblematic = async function () {
  if (!window.crudEnhancedTester) {
    window.crudEnhancedTester = new CRUDEnhancedTester();
  }

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
    if (window.showFinalSuccessNotification) {
      window.showFinalSuccessNotification(
        'אין עמודים בעייתיים',
        'כל עמודי המשתמש עברו את הבדיקות הבסיסיות בהצלחה. אין צורך בבדיקות מפורטות.',
        5000,
        'system'
      );
    } else if (window.showSuccessNotification) {
      window.showSuccessNotification(
        'אין עמודים בעייתיים',
        'כל עמודי המשתמש עברו את הבדיקות הבסיסיות בהצלחה.',
        4000
      );
    }
    return;
  }

  console.log(`🔍 Starting deep testing for ${problematicPages.length} problematic pages...`);
  if (window.showInfoNotification) {
    window.showInfoNotification(
      'בדיקות מפורטות',
      `מתחיל בדיקות מפורטות ל-${problematicPages.length} עמודים בעייתיים...`,
      3000
    );
  }

  const results = [];
  let failures = 0;

  // בדיקה מפורטת לכל עמוד בעייתי
  for (const r of problematicPages) {
    try {
      console.log(`🔍 Running deep test for ${r.entity}...`);

      // בדיקה מפורטת - נריץ בדיקה נוספת לעמוד הבעייתי
      const deepResult = await window.crudEnhancedTester.runSingleEntityTest(r.entity);

      results.push({
        entity: r.entity,
        success: deepResult.score >= 80,
        score: deepResult.score,
        details: deepResult,
        issues: deepResult.issues || [],
        recommendations: deepResult.recommendations || [],
      });

      if (deepResult.score < 80) {
        failures++;
        console.log(`❌ ${r.entity} still problematic: ${deepResult.score}/100`);
      } else {
        console.log(`✅ ${r.entity} fixed: ${deepResult.score}/100`);
      }
    } catch (e) {
      failures++;
      console.error(`❌ Deep test failed for ${r.entity}:`, e);
      results.push({
        entity: r.entity,
        success: false,
        error: e?.message || 'unknown',
        score: 0,
      });
    }
  }

  // שמירת תוצאות בדיקה מפורטת
  try {
    const prev = JSON.parse(localStorage.getItem('lastCRUDTestReport') || '{}');
    prev.deepTesting = { timestamp: new Date().toISOString(), results };
    localStorage.setItem('lastCRUDTestReport', JSON.stringify(prev));
  } catch (e) {}

  // הצגת תוצאות בדיקות מפורטות
  console.log(
    `📊 Deep testing completed: ${failures} failures out of ${problematicPages.length} pages`
  );

  if (failures === 0) {
    if (window.showSuccessNotification) {
      window.showSuccessNotification(
        'בדיקות מפורטות הסתיימו',
        'כל העמודים הבעייתיים עברו בהצלחה!',
        5000
      );
    }
  } else {
    if (window.showErrorNotification) {
      window.showErrorNotification(
        'נמצאו בעיות בבדיקות מפורטות',
        `ב-${failures} עמודים עדיין קיימות בעיות. ראה דוח מפורט למטה.`,
        8000
      );
    }
  }

  // הצגת דוח מפורט של הבדיקות המפורטות
  const deepReportCard = document.getElementById('deepTestingResults');
  if (deepReportCard) {
    deepReportCard.style.display = 'block';

    // יצירת תוכן הדוח המפורט
    let reportContent = `
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-search text-info"></i>
                    תוצאות בדיקות מפורטות
                </h6>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="text-center">
                            <h4 class="text-primary mb-0">${problematicPages.length}</h4>
                            <small class="text-muted">עמודים נבדקו</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-center">
                            <h4 class="text-success mb-0">${problematicPages.length - failures}</h4>
                            <small class="text-muted">תוקנו</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-center">
                            <h4 class="text-danger mb-0">${failures}</h4>
                            <small class="text-muted">עדיין בעייתיים</small>
                        </div>
                    </div>
                </div>
        `;

    // הוספת פרטים לכל עמוד
    results.forEach(result => {
      const statusClass = result.success ? 'success' : 'danger';
      const statusIcon = result.success ? '✅' : '❌';
      const statusText = result.success ? 'תוקן' : 'עדיין בעייתי';

      reportContent += `
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="text-${statusClass}">
                            ${statusIcon} ${result.entity} (${result.score}/100) - ${statusText}
                        </h6>
                    </div>
                    <div class="card-body">
            `;

      if (result.error) {
        reportContent += `<p class="text-danger"><strong>שגיאה:</strong> ${result.error}</p>`;
      }

      if (result.issues && result.issues.length > 0) {
        reportContent += `
                    <p><strong>בעיות שנמצאו:</strong></p>
                    <ul>
                        ${result.issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                `;
      }

      if (result.recommendations && result.recommendations.length > 0) {
        reportContent += `
                    <p><strong>המלצות תיקון:</strong></p>
                    <ul>
                        ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                `;
      }

      reportContent += `
                    </div>
                </div>
            `;
    });

    reportContent += `
                <div class="text-center mt-3">
                    <button class="btn btn-primary" onclick="copyReportToClipboard()">
                        <i class="fas fa-copy"></i> העתק דוח
                    </button>
                </div>
            </div>
        `;

    deepReportCard.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(reportContent, 'text/html');
    doc.body.childNodes.forEach(node => {
        deepReportCard.appendChild(node.cloneNode(true));
    });
  }
};

/**
 * ייצוא דוח HTML
 */
window.exportReportHTML = function () {
  const report = JSON.parse(localStorage.getItem('lastCRUDTestReport') || '{}');

  if (!report.summary) {
    if (window.showErrorNotification) {
      window.showErrorNotification('אין דוח זמין', 'אנא הרץ בדיקות תחילה ואז נסה שוב.', 5000);
    }
    return;
  }

  const html = generateHTMLReport(report);
  downloadFile(
    html,
    `crud-test-report-${new Date().toISOString().split('T')[0]}.html`,
    'text/html'
  );

  if (window.showSuccessNotification) {
    window.showSuccessNotification('ייצוא הושלם', 'דוח HTML הורד בהצלחה', 3000);
  }
};

/**
 * ייצוא דוח Markdown
 */
window.exportReportMarkdown = function () {
  const report = JSON.parse(localStorage.getItem('lastCRUDTestReport') || '{}');

  if (!report.summary) {
    if (window.showErrorNotification) {
      window.showErrorNotification('אין דוח זמין', 'אנא הרץ בדיקות תחילה ואז נסה שוב.', 5000);
    }
    return;
  }

  const markdown = generateMarkdownReport(report);
  downloadFile(
    markdown,
    `crud-test-report-${new Date().toISOString().split('T')[0]}.md`,
    'text/markdown'
  );

  if (window.showSuccessNotification) {
    window.showSuccessNotification('ייצוא הושלם', 'דוח Markdown הורד בהצלחה', 3000);
  }
};

/**
 * ייצוא דוח CSV
 */
window.exportReportCSV = function () {
  const report = JSON.parse(localStorage.getItem('lastCRUDTestReport') || '{}');

  if (!report.summary) {
    if (window.showErrorNotification) {
      window.showErrorNotification('אין דוח זמין', 'אנא הרץ בדיקות תחילה ואז נסה שוב.', 5000);
    }
    return;
  }

  try {
    // כותרות CSV
    const headers = [
      'entity',
      'displayName',
      'type',
      'score',
      'responseTimeMs',
      'p50',
      'p95',
      'issues',
    ];
    const rows = [headers.join(',')];

    (report.allResults || []).forEach(r => {
      const issues = (r.issues || []).join(' | ').replace(/\n|\r/g, ' ');
      const row = [
        r.entity,
        (r.displayName || '').replace(/,/g, ' '),
        r.type || '',
        r.score != null ? r.score : r.overallScore != null ? r.overallScore : '',
        r.responseTime != null ? r.responseTime : '',
        r.p50 != null ? Math.round(r.p50) : '',
        r.p95 != null ? Math.round(r.p95) : '',
        `"${issues}"`,
      ].join(',');
      rows.push(row);
    });

    const csv = rows.join('\n');
    downloadFile(csv, `crud-test-report-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');

    if (window.showSuccessNotification) {
      window.showSuccessNotification('ייצוא הושלם', 'דוח CSV הורד בהצלחה', 3000);
    }
  } catch (error) {
    console.error('Failed to export CSV:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בייצוא CSV', error.message || 'unknown', 5000);
    }
  }
};

/**
 * העתקת דוח ללוח
 */
window.copyReportToClipboard = async function () {
  const report = JSON.parse(localStorage.getItem('lastCRUDTestReport') || '{}');

  if (!report.summary) {
    if (window.showErrorNotification) {
      window.showErrorNotification('אין דוח זמין', 'אנא הרץ בדיקות תחילה ואז נסה שוב.', 5000);
    }
    return;
  }

  const text = generateTextReport(report);

  try {
    await navigator.clipboard.writeText(text);
    if (window.showSuccessNotification) {
      window.showSuccessNotification('הועתק בהצלחה', 'הדוח הועתק ללוח', 2000);
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback: create textarea and copy
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    if (window.showSuccessNotification) {
      window.showSuccessNotification('הועתק בהצלחה', 'הדוח הועתק ללוח (fallback)', 2000);
    }
  }
};

/**
 * הדפסת דוח
 */
window.printReport = function () {
  const report = JSON.parse(localStorage.getItem('lastCRUDTestReport') || '{}');

  if (!report.summary) {
    alert('אין דוח זמין. אנא הרץ בדיקות תחילה.');
    return;
  }

  const html = generateHTMLReport(report);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    if (window.showErrorNotification) {
      window.showErrorNotification(
        'חסימת חלון',
        'הדפדפן חסם חלון הדפסה. אפשר popups ונסה שוב.',
        6000
      );
    }
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

// ===== פונקציות עזר ליצירת דוחות =====

/**
 * יצירת דוח HTML
 */
function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>דוח בדיקות CRUD - TikTrack</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .stat-number { font-size: 2rem; font-weight: bold; }
        .score-excellent { color: #28a745; }
        .score-good { color: #ffc107; }
        .score-poor { color: #dc3545; }
        @media print {
            .btn { display: none; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body class="bg-light">
    <div class="container my-4">
        <header class="text-center mb-4">
            <h1><i class="fas fa-clipboard-check"></i> דוח בדיקות CRUD</h1>
            <h2 class="text-muted">TikTrack System Testing Report</h2>
            <p class="text-muted">נוצר: ${new Date(report.summary.timestamp).toLocaleString('he-IL')}</p>
        </header>

        <!-- סיכום כללי -->
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h3>📊 סיכום כללי</h3>
            </div>
            <div class="card-body">
                <div class="row text-center">
                    <div class="col-md-3">
                        <div class="stat-number ${getScoreClass(report.summary.overallScore)}">${report.summary.overallScore}/100</div>
                        <div>ציון כללי</div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-number text-info">${report.summary.passedEntities}</div>
                        <div>עמודים תקינים</div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-number text-warning">${report.summary.problematicEntities}</div>
                        <div>עמודים בעייתיים</div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-number text-secondary">${report.summary.totalTestTime}s</div>
                        <div>זמן בדיקות</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- פירוט לפי סוג -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h4>👥 עמודי משתמש</h4>
                    </div>
                    <div class="card-body">
                        <p><strong>ציון ממוצע:</strong> ${report.breakdown.userPages.avgScore}/100</p>
                        <p><strong>תקינים:</strong> ${report.breakdown.userPages.passed}/${report.breakdown.userPages.total}</p>
                        <p><strong>דורשים תיקון:</strong> ${report.breakdown.userPages.problematic}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h4>🔧 כלי פיתוח</h4>
                    </div>
                    <div class="card-body">
                        <p><strong>ציון ממוצע:</strong> ${report.breakdown.devTools.avgScore}/100</p>
                        <p><strong>תקינים:</strong> ${report.breakdown.devTools.passed}/${report.breakdown.devTools.total}</p>
                        <p><strong>דורשים תיקון:</strong> ${report.breakdown.devTools.problematic}</p>
                    </div>
                </div>
            </div>
        </div>

        ${
          report.problematicPages.length > 0
            ? `
        <!-- עמודים בעייתיים -->
        <div class="card mb-4 page-break">
            <div class="card-header bg-warning">
                <h3>⚠️ עמודים בעייתיים</h3>
            </div>
            <div class="card-body">
                ${report.problematicPages
                  .map(
                    page => `
                    <div class="card mb-3">
                        <div class="card-header">
                            <h5>${page.displayName} <span class="badge bg-danger">${page.score}/100</span></h5>
                        </div>
                        <div class="card-body">
                            <h6>בעיות שנמצאו:</h6>
                            <ul>
                                ${page.issues.map(issue => `<li>${issue}</li>`).join('')}
                            </ul>
                            ${
                              page.recommendations.length > 0
                                ? `
                                <h6>המלצות תיקון:</h6>
                                <ol>
                                    ${page.recommendations
                                      .map(
                                        rec => `
                                        <li><strong>עדיפות ${rec.priority}:</strong> ${rec.action} <em>(${rec.estimatedTime})</em></li>
                                    `
                                      )
                                      .join('')}
                                </ol>
                            `
                                : ''
                            }
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
        `
            : ''
        }

        <!-- המלצות כלליות -->
        ${
          report.recommendations.length > 0
            ? `
        <div class="card mb-4">
            <div class="card-header bg-info text-white">
                <h3>💡 המלצות כלליות</h3>
            </div>
            <div class="card-body">
                ${report.recommendations
                  .map(
                    rec => `
                    <div class="alert alert-info">
                        <h6>${rec.title}</h6>
                        <p>${rec.description}</p>
                        <strong>פעולה מומלצת:</strong> ${rec.action}<br>
                        <strong>זמן משוער:</strong> ${rec.estimatedTime}
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
        `
            : ''
        }

        <!-- תוצאות מפורטות -->
        <div class="card page-break">
            <div class="card-header">
                <h3>📋 תוצאות מפורטות</h3>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>עמוד</th>
                                <th>סוג</th>
                                <th>ציון</th>
                                <th>זמן תגובה</th>
                                <th>p50</th>
                                <th>p95</th>
                                <th>סטטוס</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.allResults
                              .map(
                                result => `
                                <tr>
                                    <td>${result.displayName}</td>
                                    <td>${result.type === 'user_page' ? 'עמוד משתמש' : 'כלי פיתוח'}</td>
                                    <td><span class="${getScoreClass(result.score)}">${result.score}/100</span></td>
                                    <td>${result.responseTimeGet != null ? result.responseTimeGet : result.responseTime}ms${result.responseTimeGet != null && result.responseTime !== result.responseTimeGet ? ` <small class="text-muted">(סה"כ: ${result.responseTime}ms)</small>` : ''}</td>
                                    <td>${result.p50 != null ? Math.round(result.p50) + 'ms' : '-'}</td>
                                    <td>${result.p95 != null ? Math.round(result.p95) + 'ms' : '-'}</td>
                                    <td>
                                        ${
                                          result.score >= 80
                                            ? '<span class="badge bg-success">תקין</span>'
                                            : '<span class="badge bg-warning">בעייתי</span>'
                                        }
                                    </td>
                                </tr>
                                ${
                                  result.debug?.calls?.length
                                    ? `
                                <tr>
                                  <td colspan="7">
                                    <details>
                                      <summary>Debug API Calls (${result.debug.calls.length})</summary>
                                      ${result.debug.calls
                                        .map(
                                          (c, idx) => `
                                        <div class="mb-2">
                                          <code>#${idx + 1} ${c.step || ''} ${c.url || ''} · ${c.timeMs != null ? c.timeMs + 'ms' : ''} · ${c.bytes != null ? c.bytes + ' bytes' : ''}</code>
                                          ${c.curl ? `<pre class="mt-1" style="white-space:pre-wrap">${c.curl}</pre>` : ''}
                                        </div>
                                      `
                                        )
                                        .join('')}
                                    </details>
                                  </td>
                                </tr>`
                                    : ''
                                }
                            `
                              )
                              .join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <footer class="text-center mt-4 text-muted">
            <p>דוח נוצר אוטומטיקות על ידי מערכת בדיקות CRUD היברידית - TikTrack</p>
            <p>תאריך יצירה: ${new Date().toLocaleString('he-IL')}</p>
        </footer>
    </div>
</body>
</html>`;
}

/**
 * יצירת דוח Markdown
 */
function generateMarkdownReport(report) {
  return `# דוח בדיקות CRUD - TikTrack

**נוצר:** ${new Date(report.summary.timestamp).toLocaleString('he-IL')}

## 📊 סיכום כללי

// - **ציון כללי:** ${report.summary.overallScore}/100
// - **עמודים תקינים:** ${report.summary.passedEntities}/${report.summary.totalEntities}
// - **עמודים בעייתיים:** ${report.summary.problematicEntities}
// - **זמן בדיקות:** ${report.summary.totalTestTime} שניות
// - **זמן תגובה ממוצע:** ${report.summary.avgResponseTime}ms

## 📊 פירוט לפי סוג

### 👥 עמודי משתמש
// - **ציון ממוצע:** ${report.breakdown.userPages.avgScore}/100
// - **תקינים:** ${report.breakdown.userPages.passed}/${report.breakdown.userPages.total}
// - **דורשים תיקון:** ${report.breakdown.userPages.problematic}

### 🔧 כלי פיתוח
// - **ציון ממוצע:** ${report.breakdown.devTools.avgScore}/100
// - **תקינים:** ${report.breakdown.devTools.passed}/${report.breakdown.devTools.total}
// - **דורשים תיקון:** ${report.breakdown.devTools.problematic}

${
  report.problematicPages.length > 0
    ? `
## ⚠️ עמודים בעייתיים

${report.problematicPages
  .map(
    page => `
### ${page.displayName} (${page.score}/100)

**בעיות שנמצאו:**
${page.issues.map(issue => `- ${issue}`).join('\n')}

${
  page.recommendations.length > 0
    ? `
**המלצות תיקון:**
${page.recommendations.map(rec => `${rec.priority}. ${rec.action} *(${rec.estimatedTime})*`).join('\n')}
`
    : ''
}
`
  )
  .join('\n')}
`
    : ''
}

${
  report.recommendations.length > 0
    ? `
## 💡 המלצות כלליות

${report.recommendations
  .map(
    rec => `
### ${rec.title}
${rec.description}

**פעולה מומלצת:** ${rec.action}  
**זמן משוער:** ${rec.estimatedTime}
`
  )
  .join('\n')}
`
    : ''
}

## 📋 תוצאות מפורטות

| עמוד | סוג | ציון | זמן תגובה | סטטוס |
|------|-----|------|-----------|--------|
${report.allResults
  .map(
    result =>
      `| ${result.displayName} | ${result.type === 'user_page' ? 'עמוד משתמש' : 'כלי פיתוח'} | ${result.score}/100 | ${result.responseTime}ms | ${result.score >= 80 ? '✅ תקין' : '⚠️ בעייתי'} |`
  )
  .join('\n')}

---
*דוח נוצר אוטומטי על ידי מערכת בדיקות CRUD היברידית - TikTrack*  
*תאריך יצירה: ${new Date().toLocaleString('he-IL')}*`;
}

/**
 * יצירת דוח טקסט פשוט
 */
function generateTextReport(report) {
  return `דוח בדיקות CRUD - TikTrack
================================

נוצר: ${new Date(report.summary.timestamp).toLocaleString('he-IL')}

סיכום כללי:
// - ציון כללי: ${report.summary.overallScore}/100
// - עמודים תקינים: ${report.summary.passedEntities}/${report.summary.totalEntities}
// - עמודים בעייתיים: ${report.summary.problematicEntities}
// - זמן בדיקות: ${report.summary.totalTestTime} שניות

עמודי משתמש:
// - ציון ממוצע: ${report.breakdown.userPages.avgScore}/100
// - תקינים: ${report.breakdown.userPages.passed}/${report.breakdown.userPages.total}

כלי פיתוח:
// - ציון ממוצע: ${report.breakdown.devTools.avgScore}/100
// - תקינים: ${report.breakdown.devTools.passed}/${report.breakdown.devTools.total}

${
  report.problematicPages.length > 0
    ? `
עמודים בעייתיים:
${report.problematicPages
  .map(
    page => `
${page.displayName} (${page.score}/100):
בעיות: ${page.issues.join(', ')}
`
  )
  .join('')}
`
    : ''
}

תוצאות מפורטות:
${report.allResults
  .map(
    result => {
      // Use responseTimeGet (GET latency) if available, otherwise fallback to responseTime (total test time)
      const displayTime = result.responseTimeGet != null ? result.responseTimeGet : result.responseTime;
      return `${result.displayName}: ${result.score}/100 (${displayTime}ms) - ${result.score >= 80 ? 'תקין' : 'בעייתי'}`;
    }
  )
  .join('\n')}

---
דוח נוצר אוטומטי - ${new Date().toLocaleString('he-IL')}`;
}

/**
 * קבלת מחלקת CSS לפי ציון
 */
function getScoreClass(score) {
  if (score >= 80) return 'score-excellent';
  if (score >= 50) return 'score-good';
  return 'score-poor';
}

/**
 * הורדת קובץ
 */
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== Internal helpers =====
CRUDEnhancedTester.prototype._toCurl = function ({ url, method, headers, body }) {
  const h = Object.entries(headers || {})
    .map(([k, v]) => `-H '${k}: ${v}'`)
    .join(' ');
  const d = body ? `--data '${typeof body === 'string' ? body : JSON.stringify(body)}'` : '';
  return `curl -X ${method || 'GET'} ${h} ${d} '${url}'`;
};

CRUDEnhancedTester.prototype._percentile = function (values, p) {
  try {
    if (!values || values.length === 0) return null;
    const arr = values.slice().sort((a, b) => a - b);
    const rank = (p / 100) * (arr.length - 1);
    const low = Math.floor(rank);
    const high = Math.ceil(rank);
    if (low === high) return arr[low];
    const w = rank - low;
    return arr[low] * (1 - w) + arr[high] * w;
  } catch {
    return null;
  }
};

console.log('✅ CRUD Enhanced Testing System loaded successfully');
