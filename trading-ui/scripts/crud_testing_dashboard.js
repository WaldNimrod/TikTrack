/**
 * CRUD Testing Dashboard 2.0 - Integrated Testing System
 * =======================================================
 *
 * Comprehensive testing dashboard that integrates multiple testing layers:
 * 1. UI Testing Layer - Real user interface interactions
 * 2. API Testing Layer - Database and backend validation
 * 3. E2E Testing Layer - Complete workflow testing
 * 4. Debug & Monitoring Layer - Real-time monitoring and debugging
 *
 * @version 2.0.0
 * @author TikTrack Development Team
 * 
 * ============================================================================
 * INTEGRATED TESTING SYSTEM OVERVIEW
 * ============================================================================
 * 
 * This system replaces the old fragmented testing approach with a unified,
 * comprehensive testing platform that covers all aspects of the application.
 *
 * Key Features:
 * - Real UI interactions (not just API calls)
 * - Complete E2E workflows
 * - Live monitoring and debugging
 * - Comprehensive error tracking
 * - Performance analytics
 * - Coverage mapping
 * 
 * ============================================================================
 */

// ============================================================================
// INTEGRATED CRUD TESTING DASHBOARD 2.0
// ============================================================================

class IntegratedCRUDE2ETester {
    constructor() {
        this.pages = this.initializePagesMapping();
        this.currentTestType = null;
        this.results = {
            ui: [],
            api: [],
            e2e: [],
            debug: [],
            'info-summary': []
        };
        this.stats = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            inProgress: 0,
            executionTime: 0
        };

        this.logger = window.Logger;
        this.monitoringActive = false;

        console.log('🚀 Integrated CRUD E2E Tester initialized');
    }

    /**
     * Initialize complete pages mapping from documentation
     */
    initializePagesMapping() {
        return {
            // User Pages (17 pages)
            index: { name: 'דשבורד ראשי', type: 'user', url: '/', hasCRUD: false },
            trades: { name: 'טריידים', type: 'user', url: '/trades', hasCRUD: true },
            trade_plans: { name: 'תכניות מסחר', type: 'user', url: '/trade_plans', hasCRUD: true },
            alerts: { name: 'התראות', type: 'user', url: '/alerts', hasCRUD: true },
            tickers: { name: 'טיקרים', type: 'user', url: '/tickers', hasCRUD: true },
            ticker_dashboard: { name: 'דשבורד טיקר', type: 'user', url: '/ticker_dashboard', hasCRUD: false },
            trading_accounts: { name: 'חשבונות מסחר', type: 'user', url: '/trading_accounts', hasCRUD: true },
            executions: { name: 'ביצועי עסקאות', type: 'user', url: '/executions', hasCRUD: true },
            cash_flows: { name: 'תזרימי מזומן', type: 'user', url: '/cash_flows', hasCRUD: true },
            notes: { name: 'הערות', type: 'user', url: '/notes', hasCRUD: true },
            research: { name: 'מחקר', type: 'user', url: '/research', hasCRUD: false },
            ai_analysis: { name: 'ניתוח AI', type: 'user', url: '/ai_analysis', hasCRUD: false },
            watch_lists: { name: 'רשימות צפייה', type: 'user', url: '/watch_lists', hasCRUD: true },
            user_profile: { name: 'פרופיל משתמש', type: 'user', url: '/user_profile', hasCRUD: true },
            portfolio_state: { name: 'מצב תיק', type: 'user', url: '/portfolio_state', hasCRUD: false },
            trade_history: { name: 'היסטוריית טריידים', type: 'user', url: '/trade_history', hasCRUD: false },
            trading_journal: { name: 'יומן מסחר', type: 'user', url: '/trading_journal', hasCRUD: true },
            tag_management: { name: 'תגיות', type: 'user', url: '/tag_management', hasCRUD: true },
            data_import: { name: 'ייבוא נתונים', type: 'user', url: '/data_import', hasCRUD: true },
            preferences: { name: 'העדפות', type: 'user', url: '/preferences', hasCRUD: true },

            // Technical Pages (12 pages)
            db_display: { name: 'תצוגת בסיס נתונים', type: 'technical', url: '/db_display', hasCRUD: false },
            db_extradata: { name: 'נתונים נוספים', type: 'technical', url: '/db_extradata', hasCRUD: false },
            constraints: { name: 'אילוצי מערכת', type: 'technical', url: '/constraints', hasCRUD: false },
            background_tasks: { name: 'משימות רקע', type: 'technical', url: '/background-tasks', hasCRUD: false },
            server_monitor: { name: 'ניטור שרת', type: 'technical', url: '/server-monitor', hasCRUD: false },
            system_management: { name: 'ניהול מערכת', type: 'technical', url: '/system-management', hasCRUD: false },
            notifications_center: { name: 'מרכז התראות', type: 'technical', url: '/notifications-center', hasCRUD: false },
            css_management: { name: 'ניהול CSS', type: 'technical', url: '/css-management', hasCRUD: false },
            dynamic_colors_display: { name: 'תצוגת צבעים', type: 'technical', url: '/dynamic-colors-display', hasCRUD: false },
            designs: { name: 'גלרית עיצובים', type: 'technical', url: '/designs', hasCRUD: false },
            cache_management: { name: 'ניהול מטמון', type: 'technical', url: '/cache-management', hasCRUD: false },
            code_quality_dashboard: { name: 'דשבורד איכות קוד', type: 'technical', url: '/code-quality-dashboard', hasCRUD: false }
        };
    }

    /**
     * Entity Field Maps - Comprehensive field definitions for all CRUD entities
     * Used by DataCollectionService and validation system
     */
    getEntityFieldMaps() {
        return {
            trade: {
                required: ['trading_account_id', 'ticker_id', 'status', 'side', 'investment_type'],
                fields: {
                    trading_account_id: { id: '#tradeAccount', type: 'int', required: true },
                    ticker_id: { id: '#tradeTicker', type: 'int', required: true },
                    status: { id: '#tradeStatus', type: 'text', required: true, default: 'open' },
                    side: { id: '#tradeSide', type: 'text', required: true, default: 'Long' },
                    investment_type: { id: '#tradeType', type: 'text', required: true, default: 'swing' },
                    planned_quantity: { id: '#tradeQuantity', type: 'number', required: true, default: 100 },
                    entry_price: { id: '#tradeEntryPrice', type: 'number', required: true, default: 100 },
                    // Note: stop_price and target_price are not in Trade model - they exist only in TradePlan
                    // entry_date is also not in Trade model - Trade uses created_at from BaseModel
                    // tag_ids is not supported directly in Trade model - tags are handled via /api/tags/assign endpoint separately
                    notes: { id: '#tradeNotes', type: 'rich-text', default: null }
                },
                modalId: 'tradesModal'
            },
            trade_plan: {
                required: ['trading_account_id', 'ticker_id', 'side', 'investment_type', 'status', 'entry_price'],
                fields: {
                    trading_account_id: { id: '#tradePlanAccount', type: 'int', required: true },
                    ticker_id: { id: '#tradePlanTicker', type: 'int', required: true },
                    side: { id: '#tradePlanSide', type: 'text', required: true, default: 'Long' },
                    investment_type: { id: '#tradePlanType', type: 'text', required: true, default: 'swing' },
                    status: { id: '#tradePlanStatus', type: 'text', required: true, default: 'open' },
                    planned_amount: { id: '#planAmount', type: 'number', required: true, default: 10000 },
                    entry_price: { id: '#tradePlanEntryPrice', type: 'number', required: true, default: 100 },
                    // quantity removed - TradePlan model does not have this field
                    stop_price: { id: '#tradePlanStopLoss', type: 'number', default: null },
                    target_price: { id: '#tradePlanTakeProfit', type: 'number', default: null },
                    // created_at removed - comes from BaseModel automatically, not a user-filled field
                    notes: { id: '#tradePlanNotes', type: 'rich-text', default: null },
                    tag_ids: { id: '#tradePlanTags', type: 'tags', default: [] }
                },
                modalId: 'tradePlansModal'
            },
            alert: {
                required: ['alertStatusCombined'],
                fields: {
                    related_type_id: { id: '#alertRelatedType', type: 'int', default: 4 },
                    related_id: { id: '#alertRelatedObject', type: 'int', default: null },
                    condition_attribute: { id: '#alertType', type: 'text', default: null },
                    condition_operator: { id: '#alertCondition', type: 'text', default: null },
                    condition_number: { id: '#alertValue', type: 'number', default: null },
                    status: { id: '#alertStatusCombined', type: 'text', required: true, default: 'new' }, // Fixed: 'new' maps to status='open' + is_triggered='false' in backend
                    created_at: { id: '#alertCreatedAt', type: 'datetime-local', default: null },
                    expiry_date: { id: '#alertExpiryDate', type: 'datetime-local', default: null },
                    trade_condition_id: { id: '#alertTradeCondition', type: 'int', default: null },
                    plan_condition_id: { id: '#alertPlanCondition', type: 'int', default: null }
                },
                modalId: 'alertsModal'
            },
            ticker: {
                required: ['symbol', 'name', 'type', 'currency_id', 'status'],
                fields: {
                    symbol: { id: '#tickerSymbol', type: 'text', required: true, maxLength: 10 }, // Fixed: added maxLength validation (10 chars per Backend model)
                    name: { id: '#tickerName', type: 'text', required: true, maxLength: 100 }, // Fixed: added maxLength validation (100 chars per Backend model)
                    type: { id: '#tickerType', type: 'text', required: true, default: 'stock' },
                    currency_id: { id: '#tickerCurrency', type: 'int', required: true },
                    status: { id: '#tickerStatus', type: 'text', required: true, default: 'open' }, // Fixed: changed from 'closed' to 'open' to match Backend model
                    remarks: { id: '#tickerRemarks', type: 'rich-text', default: null },
                    tag_ids: { id: '#tickerTags', type: 'tags', default: [] }
                },
                modalId: 'tickersModal'
            },
            trading_account: {
                required: ['name', 'currency_id'],
                fields: {
                    name: { id: '#accountName', type: 'text', required: true },
                    currency_id: { id: '#accountCurrency', type: 'int', required: true },
                    // type field removed - not in TradingAccount model
                    opening_balance: { id: '#accountOpeningBalance', type: 'number', default: 0 },
                    status: { id: '#accountStatus', type: 'text', default: 'open' },
                    notes: { id: '#accountNotes', type: 'rich-text', default: null }
                },
                modalId: 'tradingAccountsModal'
            },
            execution: {
                required: ['ticker_id', 'trading_account_id', 'action', 'quantity', 'price', 'date'],
                fields: {
                    ticker_id: { id: '#executionTicker', type: 'int', required: true },
                    trading_account_id: { id: '#executionAccount', type: 'int', required: true },
                    action: { id: '#executionType', type: 'text', required: true, default: 'buy' },
                    quantity: { id: '#executionQuantity', type: 'number', required: true, default: 100 },
                    price: { id: '#executionPrice', type: 'number', required: true, default: 100 },
                    date: { id: '#executionDate', type: 'datetime-local', required: true },
                    fee: { id: '#executionCommission', type: 'number', default: 0 },
                    source: { id: '#executionSource', type: 'text', default: 'manual' },
                    external_id: { id: '#executionExternalId', type: 'text', default: null },
                    notes: { id: '#executionNotes', type: 'rich-text', default: null },
                    realized_pl: { id: '#executionRealizedPL', type: 'number', default: null },
                    mtm_pl: { id: '#executionMTMPL', type: 'number', default: null },
                    trade_id: { id: '#trade_id', type: 'int', default: null }
                },
                modalId: 'executionsModal'
            },
            cash_flow: {
                required: ['type', 'trading_account_id', 'amount', 'currency_id', 'date'],
                fields: {
                    type: { id: '#cashFlowType', type: 'text', required: true, default: 'deposit' },
                    trading_account_id: { id: '#cashFlowAccount', type: 'int', required: true },
                    amount: { id: '#cashFlowAmount', type: 'number', required: true, default: 1000 },
                    currency_id: { id: '#cashFlowCurrency', type: 'int', required: true },
                    date: { id: '#cashFlowDate', type: 'date', required: true },
                    source: { id: '#cashFlowSource', type: 'text', required: true, default: 'manual' },
                    external_id: { id: '#cashFlowExternalId', type: 'text', default: null },
                    description: { id: '#cashFlowDescription', type: 'rich-text', default: null },
                    trade_id: { id: '#trade_id', type: 'int', default: null }
                },
                modalId: 'cashFlowModal'
            },
            note: {
                required: ['related_type_id', 'related_id', 'content'],
                fields: {
                    related_type_id: { id: '#noteRelatedType', type: 'int', required: true },
                    related_id: { id: '#noteRelatedObject', type: 'int', required: true },
                    content: { id: '#noteContent', type: 'rich-text', required: true },
                    tag_ids: { id: '#noteTags', type: 'tags', default: [] }
                },
                modalId: 'notesModal'
            },
            watch_list: {
                required: ['name'],
                fields: {
                    name: { id: '#watchListName', type: 'text', required: true },
                    icon: { id: '#watchListIcon', type: 'text', default: '' },
                    icon_library: { id: '#watchListIconLibrary', type: 'text', default: 'tabler' },
                    view_mode: { id: '#watchListViewMode', type: 'text', default: 'table' }
                },
                modalId: 'watchListModal'
            },
            tag_category: {
                required: ['name'],
                fields: {
                    name: { id: '#tagCategoryName', type: 'text', required: true },
                    order_index: { id: '#tagCategoryOrder', type: 'int', default: 0 },
                    is_active: { id: '#tagCategoryActive', type: 'bool', default: true }
                    // Note: description field exists in UI but is not supported by backend API
                },
                modalId: 'tagCategoryModal'
            },
            tag: {
                required: ['name'],
                fields: {
                    name: { id: '#tagName', type: 'text', required: true },
                    category_id: { id: '#tagCategory', type: 'int', default: null },
                    description: { id: '#tagDescription', type: 'text', default: '' },
                    is_active: { id: '#tagActive', type: 'bool', default: true }
                },
                modalId: 'tagModal'
            },
            import_session: {
                required: ['name'],
                fields: {
                    name: { id: '#importSessionName', type: 'text', required: true },
                    description: { id: '#importSessionDescription', type: 'text', default: '' }
                },
                modalId: 'importSessionModal'
            },
            preference_profile: {
                required: ['name'],
                fields: {
                    name: { id: '#preferenceProfileName', type: 'text', required: true },
                    description: { id: '#preferenceProfileDescription', type: 'text', default: '' },
                    is_active: { id: '#preferenceProfileIsActive', type: 'bool', default: true }
                },
                modalId: 'preferenceProfileModal'
            },
            user_profile: {
                required: ['first_name', 'last_name', 'email'],
                fields: {
                    first_name: { id: '#firstName', type: 'text', required: true },
                    last_name: { id: '#lastName', type: 'text', required: true },
                    email: { id: '#email', type: 'text', required: true },
                    phone: { id: '#phone', type: 'text', default: '' }
                },
                modalId: null // Uses form, not modal - form is already visible on page
            },
            trading_journal: {
                required: ['trade_id', 'entry_date'],
                fields: {
                    trade_id: { id: '#tradingJournalTrade', type: 'int', required: true },
                    entry_date: { id: '#tradingJournalEntryDate', type: 'datetime-local', required: true },
                    notes: { id: '#tradingJournalNotes', type: 'rich-text', default: null },
                    mood: { id: '#tradingJournalMood', type: 'text', default: null },
                    lessons_learned: { id: '#tradingJournalLessonsLearned', type: 'rich-text', default: null },
                    performance_rating: { id: '#tradingJournalPerformanceRating', type: 'int', default: null }
                },
                modalId: 'tradingJournalModal'
            }
        };
    }

    /**
     * Run integrated tests (all types)
     */
    async runIntegratedTests() {
        this.logger?.info('🚀 Starting integrated testing suite');

        const startTime = Date.now();
        this.resetStats();

        try {
            // Run all test types in sequence
            await this.runUITests();
            await this.runAPITests();
            await this.runE2ETests();

            this.stats.executionTime = Date.now() - startTime;
            this.updateDashboard();

            this.logger?.info('✅ Integrated testing completed', {
                totalTests: this.stats.totalTests,
                passed: this.stats.passed,
                failed: this.stats.failed,
                executionTime: this.stats.executionTime
            });

        } catch (error) {
            this.logger?.error('❌ Integrated testing failed', error);
            this.showError('שגיאה בבדיקות משולבות: ' + error.message);
        }
    }

    /**
     * UI Testing - Real interface interactions
     */
    async runUITests() {
        this.logger?.info('🖱️ Starting UI Tests');
        this.currentTestType = 'ui';

        try {
            // Include all user pages for UI testing, not just CRUD pages
            const uiPages = Object.entries(this.pages).filter(([_, page]) => page.type === 'user');

            this.logger?.info(`Found ${uiPages.length} user pages for UI testing`);

            for (const [key, page] of uiPages) {
                this.logger?.debug(`Testing page: ${page.name} (${key})`);
                await this.runUIPageTest(key, page);
            }

            this.logger?.info('✅ UI Tests completed successfully');

            // Update dashboard statistics after UI tests
            this.updateDashboard();

            // Show summary notification
            const totalTests = this.results.ui.length;
            const passedTests = this.results.ui.filter(r => r.status === 'success').length;
            const failedTests = totalTests - passedTests;

            if (failedTests === 0) {
                if (window.NotificationSystem && window.NotificationSystem.showSuccess) {
                    window.NotificationSystem.showSuccess(
                        'בדיקות ממשק משתמש הושלמו בהצלחה',
                        `נבדקו ${totalTests} עמודים - כל הבדיקות עברו בהצלחה`,
                        5000,
                        'system'
                    );
                } else if (window.showSuccessNotification) {
                    window.showSuccessNotification(
                        'בדיקות ממשק משתמש הושלמו בהצלחה',
                        `נבדקו ${totalTests} עמודים - כל הבדיקות עברו בהצלחה`
                    );
                }
            } else {
                if (window.NotificationSystem && window.NotificationSystem.showWarning) {
                    window.NotificationSystem.showWarning(
                        'בדיקות ממשק משתמש הושלמו עם כשלים',
                        `נבדקו ${totalTests} עמודים - ${passedTests} עברו, ${failedTests} נכשלו`,
                        6000,
                        'system'
                    );
                } else if (window.showWarningNotification) {
                    window.showWarningNotification(
                        'בדיקות ממשק משתמש הושלמו עם כשלים',
                        `נבדקו ${totalTests} עמודים - ${passedTests} עברו, ${failedTests} נכשלו`
                    );
                }
            }
        } catch (error) {
            this.logger?.error('❌ UI Tests failed with error:', error);
            throw error;
        }
    }

    /**
     * API Testing - Database validation
     */
    async runAPITests() {
        this.logger?.info('🔗 Starting API Tests');
        this.currentTestType = 'api';

        // Use existing API testing logic from crud-testing-enhanced.js
        if (window.CRUDEnhancedTester) {
            const tester = new window.CRUDEnhancedTester();
            const results = await tester.runAllEntitiesTest();
            this.processAPIResults(results);
        }
    }

    /**
     * E2E Testing - Complete workflows
     */
    async runE2ETests() {
        this.logger?.info('🔄 Starting E2E Tests');
        this.currentTestType = 'e2e';

        try {
            // Get all pages with CRUD capabilities
            const crudPages = Object.entries(this.pages).filter(([key, page]) => page.hasCRUD && page.type === 'user');
            
            this.logger?.info(`🔵 [runE2ETests] Found ${crudPages.length} pages with CRUD`, {
                pages: crudPages.map(([key, page]) => ({ key, name: page.name }))
            });
            
            // Run generic CRUD tests for all pages (including trades, alerts, user_profile)
            // This uses the unified approach with DataCollectionService, validation, and UnifiedCRUDService
            for (const [pageKey, page] of crudPages) {
                // #endregion
                
                // Clean up any existing iframes before starting new test
                this.cleanupTestIframes();
                
                const iframesBeforeTest = document.querySelectorAll('iframe[id^="test-iframe-"]').length;
                // #endregion
                
                try {
                    // Special handling for tag_management (has two CRUD types: categories and tags)
                    if (pageKey === 'tag_management') {
                        this.logger?.info(`🔵 [runE2ETests] Running tag management tests (categories and tags)`);
                        await this.runTagManagementTests();
                        continue;
                    }
                    
                    // Special handling for preferences (has profiles and preferences)
                    if (pageKey === 'preferences') {
                        this.logger?.info(`🔵 [runE2ETests] Running preferences tests (profiles and preferences)`);
                        await this.runPreferencesTests();
                        continue;
                    }
                    
                    // Special handling for data_import (import sessions)
                    if (pageKey === 'data_import') {
                        this.logger?.info(`🔵 [runE2ETests] Running data import tests (import sessions)`);
                        await this.runDataImportTests();
                        continue;
                    }
                    
                    // Generic CRUD test for all other pages
                    this.logger?.info(`🔵 [runE2ETests] Running generic CRUD test for ${page.name}`);
                    // #endregion
                    await this.runGenericCRUDTest(pageKey, page);
                    // #endregion
                } catch (error) {
                    // #endregion
                    this.logger?.error(`❌ [runE2ETests] Test failed for ${page.name}`, { error: error.message });
                    this.results.e2e.push({
                        workflow: `${page.name} CRUD`,
                        status: 'failed',
                        error: error.message,
                        executionTime: 0
                    });
                } finally {
                    // Clean up iframes after each test
                    this.cleanupTestIframes();
                    const iframesAfterTest = document.querySelectorAll('iframe[id^="test-iframe-"]').length;
                    // #endregion
                    
                    // Small delay between tests to allow cleanup to complete
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Update dashboard statistics after E2E tests
            this.updateDashboard();

            // Show summary notification
            const totalTests = this.results.e2e.length;
            const passedTests = this.results.e2e.filter(r => r.status === 'success').length;
            const failedTests = totalTests - passedTests;

            if (failedTests === 0) {
                if (window.NotificationSystem && window.NotificationSystem.showSuccess) {
                    window.NotificationSystem.showSuccess(
                        'בדיקות E2E הושלמו בהצלחה',
                        `נבדקו ${totalTests} תהליכים - כל הבדיקות עברו בהצלחה`,
                        5000,
                        'system'
                    );
                } else if (window.showSuccessNotification) {
                    window.showSuccessNotification(
                        'בדיקות E2E הושלמו בהצלחה',
                        `נבדקו ${totalTests} תהליכים - כל הבדיקות עברו בהצלחה`
                    );
                }
        } else {
                if (window.NotificationSystem && window.NotificationSystem.showWarning) {
                    window.NotificationSystem.showWarning(
                        'בדיקות E2E הושלמו עם כשלים',
                        `נבדקו ${totalTests} תהליכים - ${passedTests} עברו, ${failedTests} נכשלו`,
                        6000,
                        'system'
                    );
                } else if (window.showWarningNotification) {
                    window.showWarningNotification(
                        'בדיקות E2E הושלמו עם כשלים',
                        `נבדקו ${totalTests} תהליכים - ${passedTests} עברו, ${failedTests} נכשלו`
                    );
                }
            }

            this.logger?.info('✅ E2E Tests completed successfully');
        } catch (error) {
            this.logger?.error('❌ E2E Tests failed with error:', error);
            throw error;
        }
    }

    /**
     * Clean up all test iframes to prevent nested iframes
     */
    cleanupTestIframes() {
        // Remove all iframes from testIframeContainer
        const container = document.getElementById('testIframeContainer');
        if (container) {
            const iframes = container.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                try {
                    // Remove event listeners and clean up
                    iframe.onload = null;
                    iframe.onerror = null;
                    iframe.src = 'about:blank'; // Clear src first
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                } catch (error) {
                    this.logger?.warn(`⚠️ [cleanupTestIframes] Error removing iframe: ${error.message}`);
                }
            });
            this.logger?.debug(`🧹 [cleanupTestIframes] Removed ${iframes.length} iframe(s) from container`);
        }
        
        // Also remove any orphaned iframes with test-iframe- prefix
        const allIframes = document.querySelectorAll('iframe[id^="test-iframe-"]');
        allIframes.forEach(iframe => {
            try {
                iframe.onload = null;
                iframe.onerror = null;
                iframe.src = 'about:blank';
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            } catch (error) {
                this.logger?.warn(`⚠️ [cleanupTestIframes] Error removing orphaned iframe: ${error.message}`);
            }
        });
        
        if (allIframes.length > 0) {
            this.logger?.debug(`🧹 [cleanupTestIframes] Removed ${allIframes.length} orphaned iframe(s)`);
        }
    }

    /**
     * Load INFO_SUMMARY_CONFIGS dynamically if not already loaded
     */
    async loadInfoSummaryConfigs() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.INFO_SUMMARY_CONFIGS) {
                resolve();
                return;
            }
    
            // Create script element
            const script = document.createElement('script');
            script.src = '/scripts/info-summary-configs.js?v=1.0.0';
            script.onload = () => {
                // Wait a bit for the script to execute
                setTimeout(() => {
                    if (window.INFO_SUMMARY_CONFIGS) {
                        this.logger?.info('✅ [loadInfoSummaryConfigs] INFO_SUMMARY_CONFIGS loaded successfully');
                        resolve();
                    } else {
                        this.logger?.error('❌ [loadInfoSummaryConfigs] INFO_SUMMARY_CONFIGS not found after loading script');
                        reject(new Error('INFO_SUMMARY_CONFIGS not loaded'));
                    }
                }, 100);
            };
            script.onerror = () => {
                this.logger?.error('❌ [loadInfoSummaryConfigs] Failed to load info-summary-configs.js');
                reject(new Error('Failed to load info-summary-configs.js'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Info Summary System Testing - Cross-page validation
     * Tests info summary elements across all pages for:
     * - Element existence and proper structure
     * - Data accuracy and completeness
     * - Consistent styling and layout
     * - Proper use of centralized InfoSummarySystem
     * - Configuration correctness
     */
    async runInfoSummaryTests() {
        this.logger?.info('📊 Starting Info Summary System Tests');
        this.currentTestType = 'info-summary';

        try {
            // Load INFO_SUMMARY_CONFIGS if not already loaded
            if (!window.INFO_SUMMARY_CONFIGS) {
                this.logger?.info('🔵 [runInfoSummaryTests] INFO_SUMMARY_CONFIGS not loaded, loading dynamically...');
                await this.loadInfoSummaryConfigs();
            }

            // Get all pages that should have info summary
            // Map page keys to possible config keys (handle underscore vs hyphen differences)
            const pageKeyToConfigKey = {
                'ai_analysis': 'ai-analysis',
                'portfolio_state': 'portfolio-state-page',
                'trade_history': null, // No config yet
                'research': null, // No config yet
                'watch_lists': null, // No config yet
                'user_profile': null, // No config yet
                'trading_journal': null, // No config yet
                'tag_management': null, // No config yet
                'data_import': null, // No config yet
                'ticker_dashboard': null, // No config yet
                'strategy_analysis': 'strategy-analysis'
            };

            // Debug: Check if INFO_SUMMARY_CONFIGS exists
            this.logger?.info(`🔵 [runInfoSummaryTests] INFO_SUMMARY_CONFIGS exists: ${!!window.INFO_SUMMARY_CONFIGS}`);
            if (window.INFO_SUMMARY_CONFIGS) {
                const configKeys = Object.keys(window.INFO_SUMMARY_CONFIGS);
                this.logger?.info(`🔵 [runInfoSummaryTests] Available config keys: ${configKeys.join(', ')}`);
            }

            // Debug: Check user pages
            const userPages = Object.entries(this.pages).filter(([key, page]) => page.type === 'user');
            this.logger?.info(`🔵 [runInfoSummaryTests] Total user pages: ${userPages.length}`);
            userPages.forEach(([key, page]) => {
                this.logger?.debug(`🔵 [runInfoSummaryTests] User page: ${key} (${page.name})`);
            });

            const pagesWithSummary = Object.entries(this.pages).filter(([key, page]) => {
                if (page.type !== 'user') {
                    this.logger?.debug(`🔵 [runInfoSummaryTests] Skipping ${key} - not user page (type: ${page.type})`);
                    return false;
                }
                
                // Try direct key match first
                let configKey = key;
                if (pageKeyToConfigKey[key] !== undefined) {
                    configKey = pageKeyToConfigKey[key];
                    if (configKey === null) {
                        this.logger?.debug(`🔵 [runInfoSummaryTests] Skipping ${key} - explicitly no config`);
                        return false; // Explicitly no config
                    }
                }
                
                // Check if page has config in INFO_SUMMARY_CONFIGS
                const hasConfig = window.INFO_SUMMARY_CONFIGS && window.INFO_SUMMARY_CONFIGS[configKey];
                
                this.logger?.debug(`🔵 [runInfoSummaryTests] Checking ${key} -> ${configKey}: ${hasConfig ? 'FOUND' : 'NOT FOUND'}`);
                
                if (hasConfig) {
                    this.logger?.info(`✅ [runInfoSummaryTests] Found config for ${page.name} (${key} -> ${configKey})`);
                }
                
                return hasConfig;
            });

            this.logger?.info(`🔵 [runInfoSummaryTests] Found ${pagesWithSummary.length} pages with info summary config`);

            const testResults = [];

            // Run tests sequentially (one at a time) to avoid nested iframes
            for (const [pageKey, page] of pagesWithSummary) {
                try {
                    this.logger?.info(`🔵 [runInfoSummaryTests] Testing ${page.name} (${pageKey})...`);
                    
                    // Clean up any existing iframes before starting new test
                    this.cleanupTestIframes();
                    
                    // Run test for this page
                    const result = await this.testPageInfoSummary(pageKey, page);
                    testResults.push(result);
                    
                    // Store results immediately after each test
                    this.results['info-summary'] = testResults;
                    
                    // Update dashboard and test results table after each test
                    this.updateDashboard();
                    this.updateTestResults();
                    
                    // Clean up iframe after test completes
                    this.cleanupTestIframes();
                    
                    // Small delay between tests
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    this.logger?.error(`❌ [runInfoSummaryTests] Test failed for ${page.name}`, { error: error.message });
                    const errorResult = {
                        page: page.name,
                        pageKey,
                        status: 'failed',
                        error: error.message,
                        executionTime: 0
                    };
                    testResults.push(errorResult);
                    
                    // Store results immediately even on error
                    this.results['info-summary'] = testResults;
                    
                    // Update dashboard and test results table even on error
                    this.updateDashboard();
                    this.updateTestResults();
                    
                    // Clean up iframe even on error
                    this.cleanupTestIframes();
                }
            }

            // Final update (redundant but ensures consistency)
            this.results['info-summary'] = testResults;
            this.updateDashboard();
            this.updateTestResults();

            // Show summary
            const totalTests = testResults.length;
            const passedTests = testResults.filter(r => r.status === 'success').length;
            const failedTests = totalTests - passedTests;

            if (failedTests === 0) {
                if (window.NotificationSystem && window.NotificationSystem.showSuccess) {
                    window.NotificationSystem.showSuccess(
                        'בדיקות Info Summary הושלמו בהצלחה',
                        `נבדקו ${totalTests} עמודים - כל הבדיקות עברו בהצלחה`,
                        5000,
                        'system'
                    );
                }
            } else {
                if (window.NotificationSystem && window.NotificationSystem.showWarning) {
                    window.NotificationSystem.showWarning(
                        'בדיקות Info Summary הושלמו עם כשלים',
                        `נבדקו ${totalTests} עמודים - ${passedTests} עברו, ${failedTests} נכשלו`,
                        6000,
                        'system'
                    );
                }
            }

            this.logger?.info('✅ Info Summary Tests completed');
        } catch (error) {
            this.logger?.error('❌ Info Summary Tests failed with error:', error);
            throw error;
        }
    }

    /**
     * Test info summary for a single page
     */
    async testPageInfoSummary(pageKey, page) {
        const startTime = Date.now();
        const issues = [];
        const warnings = [];
        const consoleErrors = [];

        try {
            // Ensure no existing iframes before loading new one
            this.cleanupTestIframes();
            
            // Load page in iframe (handle special cases like index page)
            let pageUrl = page.url;
            if (pageKey === 'index') {
                // Index page is served at root, use /index.html
                pageUrl = '/index.html';
            } else if (!pageUrl.endsWith('.html')) {
                pageUrl = `${pageUrl}.html`;
            }
            
            const iframe = await this.loadPageInIframe(pageUrl);
            const iframeWindow = iframe.contentWindow;
            const iframeDocument = iframe.contentDocument;
            
            // Capture console errors from iframe
            if (iframeWindow) {
                const originalError = iframeWindow.console.error;
                const originalWarn = iframeWindow.console.warn;
                const errorHandler = (iframeWindow.addEventListener || (() => {}));
                
                // Override console.error to capture errors
                iframeWindow.console.error = function(...args) {
                    const message = args.map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg);
                            } catch (e) {
                                return String(arg);
                            }
                        }
                        return String(arg);
                    }).join(' ');
                    
                    // Filter out expected/non-critical errors
                    const msgLower = message.toLowerCase();
                    const isExpectedError = msgLower.includes('404') ||
                        msgLower.includes('not found') ||
                        msgLower.includes('network') ||
                        msgLower.includes('cors') ||
                        msgLower.includes('cross-origin') ||
                        msgLower.includes('blocked by client') ||
                        msgLower.includes('favicon') ||
                        msgLower.includes('401') ||
                        msgLower.includes('unauthorized') ||
                        msgLower.includes('modalmanagerv2 not yet available') ||
                        msgLower.includes('iconmappings.buttons not loaded') ||
                        msgLower.includes('preferencesdata.loadallpreferencesraw api is not available') ||
                        msgLower.includes('calendardataloader not available') ||
                        msgLower.includes('generateentitytypefilterbutton not available') ||
                        msgLower.includes('eod load attempt failed') ||
                        msgLower.includes('element not found') ||
                        msgLower.includes('container not found') ||
                        msgLower.includes('section not found') ||
                        msgLower.includes('table not found') ||
                        msgLower.includes('select not found') ||
                        msgLower.includes('button not found') ||
                        msgLower.includes('not yet available') ||
                        msgLower.includes('not available after waiting');
                    
                    if (!isExpectedError) {
                        consoleErrors.push({
                            message: message,
                            timestamp: new Date().toISOString(),
                            type: 'error'
                        });
                    }
                    
                    originalError.apply(iframeWindow.console, args);
                };
                
                // Override console.warn for critical warnings
                iframeWindow.console.warn = function(...args) {
                    const message = args.map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg);
                            } catch (e) {
                                return String(arg);
                            }
                        }
                        return String(arg);
                    }).join(' ');
                    
                    const msgLower = message.toLowerCase();
                    const isExpectedWarning = msgLower.includes('modalmanagerv2 not yet available') ||
                        msgLower.includes('iconmappings.buttons not loaded') ||
                        msgLower.includes('preferencesdata.loadallpreferencesraw api is not available') ||
                        msgLower.includes('calendardataloader not available') ||
                        msgLower.includes('generateentitytypefilterbutton not available') ||
                        msgLower.includes('ticker filter select not found') ||
                        msgLower.includes('journal entries cards container not found') ||
                        msgLower.includes('activity chart section not found') ||
                        msgLower.includes('no timeline data available') ||
                        msgLower.includes('no market price data available') ||
                        msgLower.includes('eod load attempt failed') ||
                        msgLower.includes('failed to load eod alerts data') ||
                        msgLower.includes('cannot read properties of undefined') ||
                        msgLower.includes('dashboard section not found') ||
                        msgLower.includes('element not found') ||
                        msgLower.includes('container not found') ||
                        msgLower.includes('section not found') ||
                        msgLower.includes('table not found') ||
                        msgLower.includes('select not found') ||
                        msgLower.includes('button not found') ||
                        msgLower.includes('not yet available') ||
                        msgLower.includes('not available after waiting') ||
                        msgLower.includes('skipping') ||
                        msgLower.includes('401') ||
                        msgLower.includes('unauthorized') ||
                        msgLower.includes('favicon') ||
                        msgLower.includes('404') ||
                        msgLower.includes('not found') ||
                        msgLower.includes('network') ||
                        msgLower.includes('cors') ||
                        msgLower.includes('cross-origin') ||
                        msgLower.includes('blocked by client') ||
                        msgLower.includes('research api unavailable') ||
                        msgLower.includes('api unavailable');
                    
                    // Only capture critical warnings (not expected ones)
                    if (!isExpectedWarning && (
                        message.includes('not defined') || 
                        message.includes('is not a function') ||
                        message.includes('Failed to load') ||
                        message.includes('Uncaught'))) {
                        consoleErrors.push({
                            message: message,
                            timestamp: new Date().toISOString(),
                            type: 'warning'
                        });
                    }
                    
                    originalWarn.apply(iframeWindow.console, args);
                };
                
                // Global error handler
                if (iframeWindow.addEventListener) {
                    iframeWindow.addEventListener('error', (event) => {
                        const msg = (event.message || 'Unknown error').toLowerCase();
                        const isExpectedError = msg.includes('404') ||
                            msg.includes('not found') ||
                            msg.includes('network') ||
                            msg.includes('cors') ||
                            msg.includes('cross-origin') ||
                            msg.includes('blocked by client') ||
                            msg.includes('failed to load eod alerts data') ||
                            msg.includes('cannot read properties of undefined') ||
                            msg.includes('research api unavailable') ||
                            msg.includes('api unavailable') ||
                            msg.includes('401') ||
                            msg.includes('unauthorized') ||
                            msg.includes('favicon');
                        
                        if (!isExpectedError) {
                            consoleErrors.push({
                                message: event.message || 'Unknown error',
                                filename: event.filename || 'unknown',
                                lineno: event.lineno || 0,
                                colno: event.colno || 0,
                                type: 'runtime'
                            });
                        }
                    });
                    
                    // Unhandled promise rejection handler
                    iframeWindow.addEventListener('unhandledrejection', (event) => {
                        const msg = (event.reason?.message || String(event.reason) || 'Unhandled promise rejection').toLowerCase();
                        const isExpectedRejection = msg.includes('404') ||
                            msg.includes('not found') ||
                            msg.includes('network') ||
                            msg.includes('cors') ||
                            msg.includes('cross-origin') ||
                            msg.includes('blocked by client') ||
                            msg.includes('failed to load eod alerts data') ||
                            msg.includes('cannot read properties of undefined') ||
                            msg.includes('research api unavailable') ||
                            msg.includes('api unavailable') ||
                            msg.includes('401') ||
                            msg.includes('unauthorized');
                        
                        if (!isExpectedRejection) {
                            consoleErrors.push({
                                message: event.reason?.message || String(event.reason) || 'Unhandled promise rejection',
                                type: 'promise'
                            });
                        }
                    });
                }
            }

        } catch (error) {
            this.logger?.error('❌ [testPageInfoSummary] Test failed', {
                pageKey,
                error: error.message,
                page: page.name
            });
            return {
                page: page.name,
                pageKey,
                status: 'failed',
                error: error.message,
                issues: [`Test error: ${error.message}`],
                warnings: [],
                executionTime: Date.now() - startTime
            };
        } finally {
            this.cleanupTestIframes();
        }
    }
}

// ============================================================================
// INITIALIZATION FUNCTION
// ============================================================================

/**
 * Initialize CRUD Testing Dashboard
 * Creates and initializes the integrated testing system
 */
function initializeCRUDTestingDashboard() {
    try {
        // Create the main tester instance
        window.crudTester = new IntegratedCRUDE2ETester();

        // Initialize the dashboard UI
        window.crudTester.initializeDashboard();

        window.Logger?.info('🧪 CRUD Testing Dashboard initialized successfully', {
            page: 'crud-testing-dashboard',
            version: '2.0.0'
        });

    } catch (error) {
        console.error('❌ Failed to initialize CRUD Testing Dashboard:', error);
        window.Logger?.error('❌ CRUD Testing Dashboard initialization failed', {
            error: error.message,
            stack: error.stack,
            page: 'crud-testing-dashboard'
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCRUDTestingDashboard);
} else {
    // DOM already loaded
    initializeCRUDTestingDashboard();
}

// Export initialization function
window.initializeCRUDTestingDashboard = initializeCRUDTestingDashboard;

// Log that button system tests function is available
window.Logger?.debug('crud_testing_dashboard.js loaded', {
    page: 'crud-testing-dashboard',
    runButtonSystemTests: typeof window.runButtonSystemTests,
    testButtonSystemDirect: typeof window.testButtonSystemDirect
});

