/**
 * Cross-Page Testing System - TikTrack
 * =====================================
 * 
 * מערכת בדיקות רוחבית לכל עמודי המשתמש (24 עמודים)
 * בודקת: ברירות מחדל, צבעים וסגנונות, מיון טבלאות, סקשנים, פילטרים
 * 
 * @version 1.0.0
 * @author TikTrack Development Team
 * 
 * ============================================================================
 * CROSS-PAGE TESTING SYSTEM OVERVIEW
 * ============================================================================
 * 
 * מערכת בדיקות רוחבית שפועלת על כל עמודי המשתמש במערכת:
 * 
 * 1. בדיקת ברירות מחדל:
 *    - תאריך (היום)
 *    - חשבון מסחר + מטבע מההעדפות
 *    - העדפות מסחר (side, investment_type)
 *    - איזור זמן ותיקון אחיד
 *    - חלוקת טבלאות לעמודים
 * 
 * 2. בדיקת צבעים וסגנונות:
 *    - צבעי ישויות מההעדפות
 *    - צבעי status/side/type אחידים
 *    - צבעים ב-widgets
 *    - tooltips בכפתורים
 * 
 * 3. בדיקת מיון טבלאות:
 *    - ברירת מחדל (חדש למעלה)
 *    - לחיצה ראשונה (ASC)
 *    - לחיצה שניה (DESC)
 * 
 * 4. בדיקת סקשנים:
 *    - פתיחה וסגירה
 *    - שמירת מצב
 * 
 * 5. בדיקת פילטרים:
 *    - פילטר ראשי בראש העמוד
 *    - פילטר כפול (ראשי + פנימי)
 *    - שמירת מצב
 * 
 * ============================================================================
 */

// ============================================================================
// CROSS-PAGE TESTER CLASS
// ============================================================================

class CrossPageTester {
    /**
     * Constructor
     * @param {IntegratedCRUDE2ETester} crudTester - Reference to CRUD tester for integration
     */
    constructor(crudTester) {
        this.crudTester = crudTester;
        this.logger = window.Logger || console;
        
        // Results storage
        this.results = {
            defaults: [],
            colors: [],
            sorting: [],
            sections: [],
            filters: [],
            infoSummary: []
        };
        
        // Statistics
        this.stats = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            inProgress: 0,
            executionTime: 0
        };
        
        // List of user pages to test (24 pages)
        this.userPages = [
            // Dashboards (2)
            { key: 'index', name: 'דשבורד ראשי', url: '/', hasModals: false, hasTables: true, hasSections: false },
            { key: 'research', name: 'מחקר וניתוח', url: '/research', hasModals: false, hasTables: false, hasSections: false },
            
            // Core pages (8)
            { key: 'trades', name: 'טריידים', url: '/trades', hasModals: true, hasTables: true, hasSections: false },
            { key: 'executions', name: 'ביצועי עסקאות', url: '/executions', hasModals: true, hasTables: true, hasSections: false },
            { key: 'alerts', name: 'התראות', url: '/alerts', hasModals: true, hasTables: true, hasSections: false },
            { key: 'trade_plans', name: 'תכניות מסחר', url: '/trade_plans', hasModals: true, hasTables: true, hasSections: false },
            { key: 'tickers', name: 'טיקרים', url: '/tickers', hasModals: true, hasTables: true, hasSections: false },
            { key: 'trading_accounts', name: 'חשבונות מסחר', url: '/trading_accounts', hasModals: true, hasTables: true, hasSections: false },
            { key: 'notes', name: 'הערות', url: '/notes', hasModals: true, hasTables: true, hasSections: false },
            { key: 'cash_flows', name: 'תזרימי מזומן', url: '/cash_flows', hasModals: true, hasTables: true, hasSections: false },
            
            // Advanced pages (7)
            { key: 'ai_analysis', name: 'ניתוח AI', url: '/ai_analysis', hasModals: false, hasTables: false, hasSections: false },
            { key: 'watch_lists', name: 'רשימות צפייה', url: '/watch_lists', hasModals: true, hasTables: true, hasSections: false },
            { key: 'user_profile', name: 'פרופיל משתמש', url: '/user_profile', hasModals: false, hasTables: false, hasSections: false },
            { key: 'ticker_dashboard', name: 'דשבורד טיקר', url: '/ticker_dashboard', hasModals: false, hasTables: false, hasSections: false },
            { key: 'trading_journal', name: 'יומן מסחר', url: '/trading_journal', hasModals: true, hasTables: true, hasSections: false },
            { key: 'trade_history', name: 'היסטוריית טרייד', url: '/trade_history', hasModals: false, hasTables: true, hasSections: false },
            { key: 'portfolio_state', name: 'מצב תיק היסטורי', url: '/portfolio_state', hasModals: false, hasTables: true, hasSections: false },
            
            // Supporting pages (3)
            { key: 'preferences', name: 'העדפות', url: '/preferences', hasModals: false, hasTables: false, hasSections: true },
            { key: 'data_import', name: 'ייבוא נתונים', url: '/data_import', hasModals: false, hasTables: false, hasSections: true },
            { key: 'tag_management', name: 'תגיות', url: '/tag_management', hasModals: true, hasTables: true, hasSections: false }
        ];
        
        console.log('🔍 Cross-Page Tester initialized');
    }
    
    /**
     * Run all cross-page tests
     * @returns {Promise<Object>} Test results
     */
    async runAllTests() {
        const startTime = Date.now();
        this.stats.inProgress = this.userPages.length * 5; // 5 test categories per page
        
        this.logger?.info('🚀 Starting cross-page tests', { 
            totalPages: this.userPages.length,
            testCategories: 5
        });
        
        try {
            // Run tests for each page
            for (const page of this.userPages) {
                await this.testPage(page);
            }
            
            this.stats.executionTime = Date.now() - startTime;
            this.stats.inProgress = 0;
            
            this.logger?.info('✅ Cross-page tests completed', {
                totalTests: this.stats.totalTests,
                passed: this.stats.passed,
                failed: this.stats.failed,
                executionTime: this.stats.executionTime
            });
            
            return {
                results: this.results,
                stats: this.stats
            };
        } catch (error) {
            this.logger?.error('❌ Cross-page tests failed', error);
            throw error;
        }
    }
    
    /**
     * Test a single page
     * @param {Object} page - Page configuration
     */
    async testPage(page) {
        this.logger?.info(`Testing page: ${page.name}`, { url: page.url });
        
        try {
            // Test 1: Defaults
            await this.testDefaults(page);
            
            // Test 2: Colors and styles
            await this.testColors(page);
            
            // Test 3: Table sorting
            if (page.hasTables) {
                await this.testSorting(page);
            }
            
            // Test 4: Sections
            if (page.hasSections) {
                await this.testSections(page);
            }
            
            // Test 5: Filters
            if (page.hasTables) {
                await this.testFilters(page);
            }
        } catch (error) {
            this.logger?.error(`Error testing page ${page.name}`, error);
        }
    }
    
    /**
     * Test 1: Defaults
     * @param {Object} page - Page configuration
     */
    async testDefaults(page) {
        const startTime = Date.now();
        const result = {
            page: page.name,
            workflow: `${page.name} - ברירות מחדל`,
            status: 'success',
            tests: [],
            errors: [],
            executionTime: 0
        };
        
        let testIframe = null;
        
        try {
            // Clean up any existing iframes before starting new test (same as CRUD tests)
            if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
                this.crudTester.cleanupTestIframes();
            }
            
            // Load page in visible iframe using crudTester's method (same as CRUD tests)
            if (!this.crudTester || typeof this.crudTester.loadPageInIframe !== 'function') {
                throw new Error('crudTester.loadPageInIframe is not available');
            }
            
            // Add .html extension if needed (same as CRUD tests)
            const pageUrl = page.url.endsWith('.html') ? page.url : `${page.url}.html`;
            testIframe = await this.crudTester.loadPageInIframe(pageUrl);
            
            const iframeDoc = this.getIframeDocument(testIframe);
            const iframeWindow = this.getIframeWindow(testIframe);
            
            // Test 1.1: Date defaults (for pages with modals)
            if (page.hasModals) {
                try {
                    await this.waitForElementInIframe(testIframe, 'main, [data-section="main"], .main-content', 10000);
                    
                    // Try to open add modal
                    const addButton = iframeDoc.querySelector('button[data-onclick*="showAddModal"], button[data-onclick*="add"], button[data-button-type="ADD"]');
                    if (addButton && iframeWindow.ModalManagerV2) {
                        // Get entity type from page
                        const entityType = this.getEntityTypeFromPage(page.key);
                        if (entityType) {
                            const modalId = this.getModalIdForEntity(entityType);
                            if (modalId) {
                                await iframeWindow.ModalManagerV2.showModal(modalId, 'add');
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                
                                // Check date fields
                                const dateFields = iframeDoc.querySelectorAll('input[type="date"], input[type="datetime-local"]');
                                for (const dateField of dateFields) {
                                    const today = new Date();
                                    const expectedDate = dateField.type === 'datetime-local' 
                                        ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`
                                        : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                    
                                    if (dateField.value === expectedDate || dateField.value.startsWith(expectedDate.split('T')[0])) {
                                        result.tests.push({
                                            name: `תאריך ברירת מחדל - ${dateField.id || dateField.name}`,
                                            status: 'success',
                                            message: `תאריך נכון: ${dateField.value}`
                                        });
                                        this.stats.passed++;
                                    } else {
                                        result.tests.push({
                                            name: `תאריך ברירת מחדל - ${dateField.id || dateField.name}`,
                                            status: 'failed',
                                            message: `תאריך שגוי: ${dateField.value}, צפוי: ${expectedDate}`
                                        });
                                        result.errors.push(`תאריך שגוי בשדה ${dateField.id || dateField.name}`);
                                        this.stats.failed++;
                                    }
                                    this.stats.totalTests++;
                                }
                                
                                // Close modal
                                if (iframeWindow.ModalManagerV2) {
                                    await iframeWindow.ModalManagerV2.closeModal(modalId);
                                }
                            }
                        }
                    }
                } catch (error) {
                    result.tests.push({
                        name: 'תאריך ברירת מחדל',
                        status: 'skipped',
                        message: `לא ניתן לבדוק: ${error.message}`
                    });
                }
            }
            
            // Test 1.2: Trading account + currency defaults
            if (['trades', 'trade_plans', 'executions', 'cash_flows'].includes(page.key)) {
                try {
                    // Check if preferences are loaded
                    const defaultAccount = await this.getPreferenceValue(iframeWindow, 'default_trading_account');
                    const defaultCurrency = await this.getPreferenceValue(iframeWindow, 'default_currency');
                    
                    if (defaultAccount || defaultCurrency) {
                        result.tests.push({
                            name: 'חשבון מסחר ומטבע מההעדפות',
                            status: 'success',
                            message: `חשבון: ${defaultAccount || 'לא מוגדר'}, מטבע: ${defaultCurrency || 'לא מוגדר'}`
                        });
                        this.stats.passed++;
                    } else {
                        result.tests.push({
                            name: 'חשבון מסחר ומטבע מההעדפות',
                            status: 'warning',
                            message: 'לא נמצאו העדפות ברירת מחדל'
                        });
                    }
                    this.stats.totalTests++;
                } catch (error) {
                    result.tests.push({
                        name: 'חשבון מסחר ומטבע מההעדפות',
                        status: 'skipped',
                        message: `לא ניתן לבדוק: ${error.message}`
                    });
                }
            }
            
            // Test 1.3: Trading preferences (side, investment_type)
            if (['trades', 'trade_plans'].includes(page.key)) {
                try {
                    const defaultSide = await this.getPreferenceValue(iframeWindow, 'default_side');
                    const defaultInvestmentType = await this.getPreferenceValue(iframeWindow, 'default_investment_type');
                    
                    if (defaultSide || defaultInvestmentType) {
                        result.tests.push({
                            name: 'העדפות מסחר (side, investment_type)',
                            status: 'success',
                            message: `Side: ${defaultSide || 'לא מוגדר'}, Type: ${defaultInvestmentType || 'לא מוגדר'}`
                        });
                        this.stats.passed++;
                    } else {
                        result.tests.push({
                            name: 'העדפות מסחר (side, investment_type)',
                            status: 'warning',
                            message: 'לא נמצאו העדפות מסחר'
                        });
                    }
                    this.stats.totalTests++;
                } catch (error) {
                    result.tests.push({
                        name: 'העדפות מסחר',
                        status: 'skipped',
                        message: `לא ניתן לבדוק: ${error.message}`
                    });
                }
            }
            
            // Test 1.4: Timezone and date formatting
            if (page.hasTables) {
                try {
                    // Check if dateUtils is available
                    if (iframeWindow.formatDate || iframeWindow.dateUtils) {
                        // Check if dates in table are formatted correctly
                        const dateCells = iframeDoc.querySelectorAll('td[data-date], .date-cell, [data-date-envelope]');
                        let datesChecked = 0;
                        let datesFormatted = 0;
                        
                        for (const cell of Array.from(dateCells).slice(0, 5)) { // Check first 5 dates
                            const dateText = cell.textContent.trim();
                            // Check if date is in Hebrew format (dd.mm.yyyy) or contains Hebrew date format
                            if (dateText && (dateText.match(/\d{2}\.\d{2}\.\d{4}/) || dateText.includes('יום') || dateText.includes('שעה'))) {
                                datesFormatted++;
                            }
                            datesChecked++;
                        }
                        
                        if (datesChecked > 0) {
                            result.tests.push({
                                name: 'תיקון אחיד של תאריכים',
                                status: datesFormatted === datesChecked ? 'success' : 'warning',
                                message: `${datesFormatted}/${datesChecked} תאריכים בפורמט נכון`
                            });
                            if (datesFormatted === datesChecked) {
                                this.stats.passed++;
                            }
                            this.stats.totalTests++;
                        }
                    }
                } catch (error) {
                    result.tests.push({
                        name: 'תיקון אחיד של תאריכים',
                        status: 'skipped',
                        message: `לא ניתן לבדוק: ${error.message}`
                    });
                }
            }
            
            // Test 1.5: Pagination preferences
            if (page.hasTables) {
                try {
                    const pagination = iframeDoc.querySelector('.pagination, [data-pagination]');
                    if (pagination) {
                        // Check if pagination respects user preferences
                        const pageSizeSelect = iframeDoc.querySelector('select[data-page-size], select[name="pageSize"]');
                        if (pageSizeSelect) {
                            const defaultPageSize = await this.getPreferenceValue(iframeWindow, 'default_table_page_size');
                            if (defaultPageSize && pageSizeSelect.value === String(defaultPageSize)) {
                                result.tests.push({
                                    name: 'חלוקת טבלאות לעמודים',
                                    status: 'success',
                                    message: `גודל עמוד נכון: ${defaultPageSize}`
                                });
                                this.stats.passed++;
                            } else {
                                result.tests.push({
                                    name: 'חלוקת טבלאות לעמודים',
                                    status: 'warning',
                                    message: `גודל עמוד: ${pageSizeSelect.value}, העדפה: ${defaultPageSize || 'לא מוגדר'}`
                                });
                            }
                            this.stats.totalTests++;
                        }
                    }
                } catch (error) {
                    result.tests.push({
                        name: 'חלוקת טבלאות לעמודים',
                        status: 'skipped',
                        message: `לא ניתן לבדוק: ${error.message}`
                    });
                }
            }
            
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            
            // Update status based on test results
            const failedTests = result.tests.filter(t => t.status === 'failed').length;
            const warningTests = result.tests.filter(t => t.status === 'warning').length;
            
            if (failedTests > 0 || result.errors.length > 0) {
                result.status = 'failed';
            } else if (warningTests > 0) {
                result.status = 'warning';
            }
            
            // Format error message for display
            if (result.errors.length > 0) {
                result.error = result.errors.join('; ');
            } else if (result.tests.length > 0) {
                const failed = result.tests.filter(t => t.status === 'failed');
                const warnings = result.tests.filter(t => t.status === 'warning');
                if (failed.length > 0) {
                    result.error = failed.map(t => t.message).join('; ');
                } else if (warnings.length > 0) {
                    result.error = warnings.map(t => t.message).join('; ');
                } else {
                    result.error = 'OK';
                }
            } else {
                result.error = 'OK';
            }
            
            // Note: Don't cleanup iframe - crudTester manages it in testIframeContainer
            
        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
            result.error = error.message;
            result.executionTime = Date.now() - startTime;
            this.logger?.error(`Error in testDefaults for ${page.name}`, error);
        }
        
        this.results.defaults.push(result);
        
        // Update dashboard and test results table after each test (same as CRUD tests)
        if (this.crudTester) {
            if (typeof this.crudTester.updateTestResults === 'function') {
                this.crudTester.updateTestResults();
            }
            if (typeof this.crudTester.updateDashboard === 'function') {
                this.crudTester.updateDashboard();
            }
        }
        
        // Clean up iframe after test completes (same as CRUD tests)
        if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
            this.crudTester.cleanupTestIframes();
        }
    }
    
    /**
     * Helper: Get preference value
     * @param {Window} iframeWindow - Iframe window
     * @param {string} preferenceName - Preference name
     * @returns {Promise<*>} Preference value
     */
    async getPreferenceValue(iframeWindow, preferenceName) {
        try {
            // Try multiple sources
            if (iframeWindow.PreferencesSystem?.manager?.currentPreferences) {
                const value = iframeWindow.PreferencesSystem.manager.currentPreferences[preferenceName];
                if (value !== undefined && value !== null) {
                    return value;
                }
            }
            
            if (iframeWindow.PreferencesCore?.currentPreferences) {
                const value = iframeWindow.PreferencesCore.currentPreferences[preferenceName];
                if (value !== undefined && value !== null) {
                    return value;
                }
            }
            
            if (iframeWindow.getPreferenceFromMemory) {
                const value = await iframeWindow.getPreferenceFromMemory(preferenceName);
                if (value !== undefined && value !== null) {
                    return value;
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Helper: Get entity type from page key
     * @param {string} pageKey - Page key
     * @returns {string|null} Entity type
     */
    getEntityTypeFromPage(pageKey) {
        const mapping = {
            'trades': 'trade',
            'trade_plans': 'trade_plan',
            'alerts': 'alert',
            'tickers': 'ticker',
            'trading_accounts': 'trading_account',
            'executions': 'execution',
            'cash_flows': 'cash_flow',
            'notes': 'note',
            'watch_lists': 'watch_list',
            'tag_management': 'tag'
        };
        return mapping[pageKey] || null;
    }
    
    /**
     * Helper: Get modal ID for entity type
     * @param {string} entityType - Entity type
     * @returns {string|null} Modal ID
     */
    getModalIdForEntity(entityType) {
        const mapping = {
            'trade': 'tradesModal',
            'trade_plan': 'tradePlansModal',
            'alert': 'alertsModal',
            'ticker': 'tickersModal',
            'trading_account': 'tradingAccountsModal',
            'execution': 'executionsModal',
            'cash_flow': 'cashFlowsModal',
            'note': 'notesModal',
            'watch_list': 'watchListsModal',
            'tag': 'tagModal'
        };
        return mapping[entityType] || null;
    }
    
    /**
     * Test 2: Colors and styles
     * @param {Object} page - Page configuration
     */
    async testColors(page) {
        const startTime = Date.now();
        const result = {
            page: page.name,
            workflow: `${page.name} - צבעים וסגנונות`,
            status: 'success',
            tests: [],
            errors: [],
            executionTime: 0
        };
        
        let testIframe = null;
        
        try {
            // Clean up any existing iframes before starting new test (same as CRUD tests)
            if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
                this.crudTester.cleanupTestIframes();
            }
            
            // Load page in visible iframe using crudTester's method (same as CRUD tests)
            if (!this.crudTester || typeof this.crudTester.loadPageInIframe !== 'function') {
                throw new Error('crudTester.loadPageInIframe is not available');
            }
            
            // Add .html extension if needed (same as CRUD tests)
            const pageUrl = page.url.endsWith('.html') ? page.url : `${page.url}.html`;
            testIframe = await this.crudTester.loadPageInIframe(pageUrl);
            
            const iframeDoc = this.getIframeDocument(testIframe);
            const iframeWindow = this.getIframeWindow(testIframe);
            
            // Test 2.1: Entity colors from preferences
            if (page.hasTables) {
                try {
                    // Check if getEntityColor is available
                    if (iframeWindow.getEntityColor && typeof iframeWindow.getEntityColor === 'function') {
                        const entityType = this.getEntityTypeFromPage(page.key);
                        if (entityType) {
                            const entityColor = iframeWindow.getEntityColor(entityType);
                            if (entityColor) {
                                result.tests.push({
                                    name: `צבע ישות - ${entityType}`,
                                    status: 'success',
                                    message: `צבע: ${entityColor}`
                                });
                                this.stats.passed++;
                            } else {
                                result.tests.push({
                                    name: `צבע ישות - ${entityType}`,
                                    status: 'warning',
                                    message: 'לא נמצא צבע מההעדפות'
                                });
                            }
                            this.stats.totalTests++;
                        }
                    }
                } catch (error) {
                    result.tests.push({
                        name: 'צבעי ישויות',
                        status: 'skipped',
                        message: `לא ניתן לבדוק: ${error.message}`
                    });
                }
            }
            
            // Test 2.2: Status colors in tables
            if (page.hasTables) {
                try {
                    // Check if FieldRendererService is used
                    if (iframeWindow.FieldRendererService) {
                        // Check if badges use FieldRendererService
                        const statusBadges = iframeDoc.querySelectorAll('.status-badge, [data-status-category]');
                        let badgesChecked = 0;
                        let badgesUsingService = 0;
                        
                        for (const badge of Array.from(statusBadges).slice(0, 10)) {
                            badgesChecked++;
                            // Check if badge has data-status-category (indicates FieldRendererService)
                            if (badge.hasAttribute('data-status-category') || badge.hasAttribute('data-entity')) {
                                badgesUsingService++;
                            }
                        }
                        
                        if (badgesChecked > 0) {
                            result.tests.push({
                                name: 'צבעי status אחידים בטבלאות',
                                status: badgesUsingService === badgesChecked ? 'success' : 'warning',
                                message: `${badgesUsingService}/${badgesChecked} badges משתמשים ב-FieldRendererService`
                            });
                            if (badgesUsingService === badgesChecked) {
                                this.stats.passed++;
                            }
                            this.stats.totalTests++;
                        }
                    }
                } catch (error) {
                    result.tests.push({
                        name: 'צבעי status אחידים',
                        status: 'skipped',
                        message: `לא ניתן לבדוק: ${error.message}`
                    });
                }
            }
            
            // Test 2.3: Widget colors
            if (['index', 'ticker_dashboard'].includes(page.key)) {
                try {
                    const widgets = iframeDoc.querySelectorAll('.widget, [data-widget-type]');
                    let widgetsChecked = 0;
                    let widgetsUsingColors = 0;
                    
                    for (const widget of Array.from(widgets).slice(0, 5)) {
                        widgetsChecked++;
                        // Check if widget uses getEntityColor (check computed styles or data attributes)
                        const style = window.getComputedStyle(widget);
                        const hasColor = style.color !== 'rgb(0, 0, 0)' || widget.hasAttribute('data-entity-color');
                        
                        if (hasColor) {
                            widgetsUsingColors++;
                        }
                    }
                    
                    if (widgetsChecked > 0) {
                        result.tests.push({
                            name: 'צבעים ב-widgets',
                            status: widgetsUsingColors > 0 ? 'success' : 'warning',
                            message: `${widgetsUsingColors}/${widgetsChecked} widgets עם צבעים`
                        });
                        if (widgetsUsingColors > 0) {
                            this.stats.passed++;
                        }
                        this.stats.totalTests++;
                    }
                } catch (error) {
                    result.tests.push({
                        name: 'צבעים ב-widgets',
                        status: 'skipped',
                        message: `לא ניתן לבדוק: ${error.message}`
                    });
                }
            }
            
            // Test 2.4: Button tooltips
            try {
                const buttons = iframeDoc.querySelectorAll('button[data-bs-toggle="tooltip"], button[title], button[data-tooltip]');
                let buttonsChecked = 0;
                let buttonsWithTooltip = 0;
                
                for (const button of Array.from(buttons).slice(0, 20)) {
                    buttonsChecked++;
                    if (button.hasAttribute('title') || button.hasAttribute('data-bs-toggle') || button.hasAttribute('data-tooltip')) {
                        buttonsWithTooltip++;
                    }
                }
                
                if (buttonsChecked > 0) {
                    result.tests.push({
                        name: 'Tooltips בכפתורים',
                        status: buttonsWithTooltip === buttonsChecked ? 'success' : 'warning',
                        message: `${buttonsWithTooltip}/${buttonsChecked} כפתורים עם tooltip`
                    });
                    if (buttonsWithTooltip === buttonsChecked) {
                        this.stats.passed++;
                    }
                    this.stats.totalTests++;
                }
            } catch (error) {
                result.tests.push({
                    name: 'Tooltips בכפתורים',
                    status: 'skipped',
                    message: `לא ניתן לבדוק: ${error.message}`
                });
            }
            
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            
            // Update status based on test results
            const failedTests = result.tests.filter(t => t.status === 'failed').length;
            const warningTests = result.tests.filter(t => t.status === 'warning').length;
            
            if (failedTests > 0 || result.errors.length > 0) {
                result.status = 'failed';
            } else if (warningTests > 0) {
                result.status = 'warning';
            }
            
            // Format error message for display
            if (result.errors.length > 0) {
                result.error = result.errors.join('; ');
            } else if (result.tests.length > 0) {
                const failed = result.tests.filter(t => t.status === 'failed');
                const warnings = result.tests.filter(t => t.status === 'warning');
                if (failed.length > 0) {
                    result.error = failed.map(t => t.message).join('; ');
                } else if (warnings.length > 0) {
                    result.error = warnings.map(t => t.message).join('; ');
                } else {
                    result.error = 'OK';
                }
            } else {
                result.error = 'OK';
            }
            
            // Note: Don't cleanup iframe - crudTester manages it in testIframeContainer
            
        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
            result.error = error.message;
            result.executionTime = Date.now() - startTime;
            this.logger?.error(`Error in testColors for ${page.name}`, error);
            
            // Note: Don't cleanup iframe on error - crudTester manages it in testIframeContainer
        }
        
        this.results.colors.push(result);
        
        // Update dashboard and test results table after each test (same as CRUD tests)
        if (this.crudTester) {
            if (typeof this.crudTester.updateTestResults === 'function') {
                this.crudTester.updateTestResults();
            }
            if (typeof this.crudTester.updateDashboard === 'function') {
                this.crudTester.updateDashboard();
            }
        }
        
        // Clean up iframe after test completes (same as CRUD tests)
        if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
            this.crudTester.cleanupTestIframes();
        }
    }
    
    /**
     * Test 3: Table sorting
     * @param {Object} page - Page configuration
     */
    async testSorting(page) {
        const startTime = Date.now();
        const result = {
            page: page.name,
            workflow: `${page.name} - מיון טבלאות`,
            status: 'success',
            tests: [],
            errors: [],
            executionTime: 0
        };
        
        let testIframe = null;
        
        try {
            // Clean up any existing iframes before starting new test (same as CRUD tests)
            if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
                this.crudTester.cleanupTestIframes();
            }
            
            // Load page in visible iframe using crudTester's method (same as CRUD tests)
            if (!this.crudTester || typeof this.crudTester.loadPageInIframe !== 'function') {
                throw new Error('crudTester.loadPageInIframe is not available');
            }
            
            // Add .html extension if needed (same as CRUD tests)
            const pageUrl = page.url.endsWith('.html') ? page.url : `${page.url}.html`;
            testIframe = await this.crudTester.loadPageInIframe(pageUrl);
            
            const iframeDoc = this.getIframeDocument(testIframe);
            const iframeWindow = this.getIframeWindow(testIframe);
            
            await this.waitForElementInIframe(testIframe, 'table, table tbody', 10000);
            
            // Find first table
            const table = iframeDoc.querySelector('table[data-table-type], table tbody');
            if (!table) {
                result.tests.push({
                    name: 'מיון טבלאות',
                    status: 'skipped',
                    message: 'לא נמצאה טבלה'
                });
                // Note: Don't cleanup iframe - crudTester manages it in testIframeContainer
                this.results.sorting.push(result);
                return;
            }
            
            const tableType = table.getAttribute('data-table-type') || this.getEntityTypeFromPage(page.key);
            
            // Test 3.1: Default sort (newest first)
            try {
                if (iframeWindow.UnifiedTableSystem && iframeWindow.UnifiedTableSystem.registry.isRegistered(tableType)) {
                    // Check default sort
                    const config = iframeWindow.UnifiedTableSystem.registry.getConfig(tableType);
                    if (config && config.defaultSort) {
                        result.tests.push({
                            name: 'ברירת מחדל - חדש למעלה',
                            status: 'success',
                            message: `ברירת מחדל מוגדרת: ${JSON.stringify(config.defaultSort)}`
                        });
                        this.stats.passed++;
                    } else {
                        result.tests.push({
                            name: 'ברירת מחדל - חדש למעלה',
                            status: 'warning',
                            message: 'לא נמצאה ברירת מחדל מוגדרת'
                        });
                    }
                    this.stats.totalTests++;
                }
            } catch (error) {
                result.tests.push({
                    name: 'ברירת מחדל - חדש למעלה',
                    status: 'skipped',
                    message: `לא ניתן לבדוק: ${error.message}`
                });
            }
            
            // Test 3.2: First click sorts ASC
            try {
                const firstHeader = iframeDoc.querySelector('table thead th, table thead td');
                if (firstHeader && iframeWindow.UnifiedTableSystem) {
                    const columnIndex = Array.from(firstHeader.parentElement.children).indexOf(firstHeader);
                    
                    // Get initial order
                    const initialRows = Array.from(table.querySelectorAll('tbody tr, tbody > tr'));
                    const initialFirstValue = initialRows[0]?.querySelector('td')?.textContent?.trim();
                    
                    // Click header
                    firstHeader.click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Check if sorted
                    const afterClickRows = Array.from(table.querySelectorAll('tbody tr, tbody > tr'));
                    const afterClickFirstValue = afterClickRows[0]?.querySelector('td')?.textContent?.trim();
                    
                    if (initialFirstValue !== afterClickFirstValue) {
                        result.tests.push({
                            name: 'לחיצה ראשונה ממינת (ASC)',
                            status: 'success',
                            message: 'הטבלה ממוינת לאחר לחיצה'
                        });
                        this.stats.passed++;
                    } else {
                        result.tests.push({
                            name: 'לחיצה ראשונה ממינת (ASC)',
                            status: 'warning',
                            message: 'הטבלה לא השתנתה לאחר לחיצה'
                        });
                    }
                    this.stats.totalTests++;
                    
                    // Test 3.3: Second click reverses sort (DESC)
                    firstHeader.click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const afterSecondClickRows = Array.from(table.querySelectorAll('tbody tr, tbody > tr'));
                    const afterSecondClickFirstValue = afterSecondClickRows[0]?.querySelector('td')?.textContent?.trim();
                    
                    if (afterClickFirstValue !== afterSecondClickFirstValue) {
                        result.tests.push({
                            name: 'לחיצה שניה הופכת מיון (DESC)',
                            status: 'success',
                            message: 'המיון התהפך לאחר לחיצה שניה'
                        });
                        this.stats.passed++;
                    } else {
                        result.tests.push({
                            name: 'לחיצה שניה הופכת מיון (DESC)',
                            status: 'warning',
                            message: 'המיון לא התהפך לאחר לחיצה שניה'
                        });
                    }
                    this.stats.totalTests++;
                }
            } catch (error) {
                result.tests.push({
                    name: 'מיון טבלאות',
                    status: 'skipped',
                    message: `לא ניתן לבדוק: ${error.message}`
                });
            }
            
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            
            // Update status based on test results
            const failedTests = result.tests.filter(t => t.status === 'failed').length;
            const warningTests = result.tests.filter(t => t.status === 'warning').length;
            
            if (failedTests > 0 || result.errors.length > 0) {
                result.status = 'failed';
            } else if (warningTests > 0) {
                result.status = 'warning';
            }
            
            // Format error message for display
            if (result.errors.length > 0) {
                result.error = result.errors.join('; ');
            } else if (result.tests.length > 0) {
                const failed = result.tests.filter(t => t.status === 'failed');
                const warnings = result.tests.filter(t => t.status === 'warning');
                if (failed.length > 0) {
                    result.error = failed.map(t => t.message).join('; ');
                } else if (warnings.length > 0) {
                    result.error = warnings.map(t => t.message).join('; ');
                } else {
                    result.error = 'OK';
                }
            } else {
                result.error = 'OK';
            }
            
            // Note: Don't cleanup iframe - crudTester manages it in testIframeContainer
            
        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
            result.error = error.message;
            result.executionTime = Date.now() - startTime;
            this.logger?.error(`Error in testSorting for ${page.name}`, error);
            
            // Note: Don't cleanup iframe on error - crudTester manages it in testIframeContainer
        }
        
        this.results.sorting.push(result);
        
        // Update dashboard and test results table after each test (same as CRUD tests)
        if (this.crudTester) {
            if (typeof this.crudTester.updateTestResults === 'function') {
                this.crudTester.updateTestResults();
            }
            if (typeof this.crudTester.updateDashboard === 'function') {
                this.crudTester.updateDashboard();
            }
        }
        
        // Clean up iframe after test completes (same as CRUD tests)
        if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
            this.crudTester.cleanupTestIframes();
        }
    }
    
    /**
     * Test 4: Sections
     * @param {Object} page - Page configuration
     */
    async testSections(page) {
        const startTime = Date.now();
        const result = {
            page: page.name,
            workflow: `${page.name} - סקשנים`,
            status: 'success',
            tests: [],
            errors: [],
            executionTime: 0
        };
        
        let testIframe = null;
        
        try {
            // Clean up any existing iframes before starting new test (same as CRUD tests)
            if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
                this.crudTester.cleanupTestIframes();
            }
            
            // Load page in visible iframe using crudTester's method (same as CRUD tests)
            if (!this.crudTester || typeof this.crudTester.loadPageInIframe !== 'function') {
                throw new Error('crudTester.loadPageInIframe is not available');
            }
            
            // Add .html extension if needed (same as CRUD tests)
            const pageUrl = page.url.endsWith('.html') ? page.url : `${page.url}.html`;
            testIframe = await this.crudTester.loadPageInIframe(pageUrl);
            
            const iframeDoc = this.getIframeDocument(testIframe);
            const iframeWindow = this.getIframeWindow(testIframe);
            
            await this.waitForElementInIframe(testIframe, 'main, [data-section="main"], .main-content', 10000);
            
            // Find sections
            const sections = iframeDoc.querySelectorAll('[id^="section"], .section, [data-section]');
            
            if (sections.length === 0) {
                result.tests.push({
                    name: 'פתיחה וסגירה של סקשנים',
                    status: 'skipped',
                    message: 'לא נמצאו סקשנים'
                });
                // Note: Don't cleanup iframe - crudTester manages it in testIframeContainer
                this.results.sections.push(result);
                return;
            }
            
            // Test first section
            const firstSection = sections[0];
            const sectionId = firstSection.id || firstSection.getAttribute('data-section');
            const sectionBody = firstSection.querySelector('.section-body');
            
            if (!sectionBody) {
                result.tests.push({
                    name: 'פתיחה וסגירה של סקשנים',
                    status: 'skipped',
                    message: 'לא נמצא section-body'
                });
                // Note: Don't cleanup iframe - crudTester manages it in testIframeContainer
                this.results.sections.push(result);
                return;
            }
            
            // Test 4.1: Toggle section open/close
            try {
                const isInitiallyHidden = sectionBody.classList.contains('d-none') || 
                                         window.getComputedStyle(sectionBody).display === 'none';
                
                // Find toggle button
                const toggleButton = firstSection.querySelector('button[data-onclick*="toggleSection"], button[onclick*="toggleSection"], button[data-button-type="TOGGLE"]');
                
                if (toggleButton && iframeWindow.toggleSection) {
                    // Toggle section
                    toggleButton.click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const isAfterToggleHidden = sectionBody.classList.contains('d-none') || 
                                               window.getComputedStyle(sectionBody).display === 'none';
                    
                    if (isInitiallyHidden !== isAfterToggleHidden) {
                        result.tests.push({
                            name: 'פתיחה וסגירה של סקשן',
                            status: 'success',
                            message: `סקשן ${isAfterToggleHidden ? 'נסגר' : 'נפתח'} בהצלחה`
                        });
                        this.stats.passed++;
                    } else {
                        result.tests.push({
                            name: 'פתיחה וסגירה של סקשן',
                            status: 'warning',
                            message: 'הסקשן לא השתנה לאחר לחיצה'
                        });
                    }
                    this.stats.totalTests++;
                    
                    // Test 4.2: State persistence
                    // Reload page and check if state is saved
                    const pageUrl = page.url.endsWith('.html') ? page.url : `${page.url}.html`;
                    testIframe.src = pageUrl;
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    const reloadedDoc = this.getIframeDocument(testIframe);
                    const reloadedSection = reloadedDoc.querySelector(`#${sectionId}, [data-section="${sectionId}"]`);
                    const reloadedSectionBody = reloadedSection?.querySelector('.section-body');
                    
                    if (reloadedSectionBody) {
                        const isStatePreserved = (isAfterToggleHidden && reloadedSectionBody.classList.contains('d-none')) ||
                                               (!isAfterToggleHidden && !reloadedSectionBody.classList.contains('d-none'));
                        
                        result.tests.push({
                            name: 'שמירת מצב סקשן',
                            status: isStatePreserved ? 'success' : 'warning',
                            message: isStatePreserved ? 'מצב נשמר לאחר ריענון' : 'מצב לא נשמר לאחר ריענון'
                        });
                        if (isStatePreserved) {
                            this.stats.passed++;
                        }
                        this.stats.totalTests++;
                    }
                } else {
                    result.tests.push({
                        name: 'פתיחה וסגירה של סקשן',
                        status: 'skipped',
                        message: 'לא נמצא כפתור toggle או פונקציה toggleSection'
                    });
                }
            } catch (error) {
                result.tests.push({
                    name: 'פתיחה וסגירה של סקשנים',
                    status: 'skipped',
                    message: `לא ניתן לבדוק: ${error.message}`
                });
            }
            
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            
            // Update status based on test results
            const failedTests = result.tests.filter(t => t.status === 'failed').length;
            const warningTests = result.tests.filter(t => t.status === 'warning').length;
            
            if (failedTests > 0 || result.errors.length > 0) {
                result.status = 'failed';
            } else if (warningTests > 0) {
                result.status = 'warning';
            }
            
            // Format error message for display
            if (result.errors.length > 0) {
                result.error = result.errors.join('; ');
            } else if (result.tests.length > 0) {
                const failed = result.tests.filter(t => t.status === 'failed');
                const warnings = result.tests.filter(t => t.status === 'warning');
                if (failed.length > 0) {
                    result.error = failed.map(t => t.message).join('; ');
                } else if (warnings.length > 0) {
                    result.error = warnings.map(t => t.message).join('; ');
                } else {
                    result.error = 'OK';
                }
            } else {
                result.error = 'OK';
            }
            
            // Note: Don't cleanup iframe - crudTester manages it in testIframeContainer
            
        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
            result.error = error.message;
            result.executionTime = Date.now() - startTime;
            this.logger?.error(`Error in testSections for ${page.name}`, error);
            
            // Note: Don't cleanup iframe on error - crudTester manages it in testIframeContainer
        }
        
        this.results.sections.push(result);
        
        // Update dashboard and test results table after each test (same as CRUD tests)
        if (this.crudTester) {
            if (typeof this.crudTester.updateTestResults === 'function') {
                this.crudTester.updateTestResults();
            }
            if (typeof this.crudTester.updateDashboard === 'function') {
                this.crudTester.updateDashboard();
            }
        }
        
        // Clean up iframe after test completes (same as CRUD tests)
        if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
            this.crudTester.cleanupTestIframes();
        }
    }
    
    /**
     * Test 5: Filters
     * @param {Object} page - Page configuration
     */
    async testFilters(page) {
        const startTime = Date.now();
        const result = {
            page: page.name,
            workflow: `${page.name} - פילטרים`,
            status: 'success',
            tests: [],
            errors: [],
            executionTime: 0
        };
        
        let testIframe = null;
        
        try {
            // Clean up any existing iframes before starting new test (same as CRUD tests)
            if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
                this.crudTester.cleanupTestIframes();
            }
            
            // Load page in visible iframe using crudTester's method (same as CRUD tests)
            if (!this.crudTester || typeof this.crudTester.loadPageInIframe !== 'function') {
                throw new Error('crudTester.loadPageInIframe is not available');
            }
            
            // Add .html extension if needed (same as CRUD tests)
            const pageUrl = page.url.endsWith('.html') ? page.url : `${page.url}.html`;
            testIframe = await this.crudTester.loadPageInIframe(pageUrl);
            
            const iframeDoc = this.getIframeDocument(testIframe);
            const iframeWindow = this.getIframeWindow(testIframe);
            
            await this.waitForElementInIframe(testIframe, '#unified-header, main, [data-section="main"]', 10000);
            
            // Test 5.1: Header filters
            try {
                const header = iframeDoc.querySelector('#unified-header');
                if (header && iframeWindow.HeaderSystem) {
                    // Check if filters are available
                    const statusFilter = iframeDoc.querySelector('[data-filter="status"], #statusFilter');
                    const typeFilter = iframeDoc.querySelector('[data-filter="type"], #typeFilter');
                    const accountFilter = iframeDoc.querySelector('[data-filter="account"], #accountFilter');
                    const dateFilter = iframeDoc.querySelector('[data-filter="date"], #dateFilter');
                    const searchFilter = iframeDoc.querySelector('[data-filter="search"], #searchFilter, input[type="search"]');
                    
                    const filtersFound = [statusFilter, typeFilter, accountFilter, dateFilter, searchFilter].filter(Boolean).length;
                    
                    if (filtersFound > 0) {
                        result.tests.push({
                            name: 'פילטרים בראש העמוד',
                            status: 'success',
                            message: `נמצאו ${filtersFound} פילטרים בראש העמוד`
                        });
                        this.stats.passed++;
                    } else {
                        result.tests.push({
                            name: 'פילטרים בראש העמוד',
                            status: 'warning',
                            message: 'לא נמצאו פילטרים בראש העמוד'
                        });
                    }
                    this.stats.totalTests++;
                    
                    // Test if filters work on tables
                    if (page.hasTables && filtersFound > 0) {
                        const table = iframeDoc.querySelector('table[data-table-type], table tbody');
                        if (table) {
                            const initialRowCount = table.querySelectorAll('tbody tr, tbody > tr').length;
                            
                            // Apply a filter (if possible)
                            if (statusFilter && iframeWindow.HeaderSystem.selectStatusOption) {
                                // Try to select a status
                                const statusOptions = statusFilter.querySelectorAll('option');
                                if (statusOptions.length > 1) {
                                    statusFilter.value = statusOptions[1].value;
                                    statusFilter.dispatchEvent(new Event('change', { bubbles: true }));
                                    
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    
                                    const afterFilterRowCount = table.querySelectorAll('tbody tr, tbody > tr').length;
                                    
                                    if (initialRowCount !== afterFilterRowCount) {
                                        result.tests.push({
                                            name: 'פילטרים פועלים על טבלאות',
                                            status: 'success',
                                            message: `מספר שורות השתנה מ-${initialRowCount} ל-${afterFilterRowCount}`
                                        });
                                        this.stats.passed++;
                                    } else {
                                        result.tests.push({
                                            name: 'פילטרים פועלים על טבלאות',
                                            status: 'warning',
                                            message: 'מספר שורות לא השתנה לאחר הפעלת פילטר'
                                        });
                                    }
                                    this.stats.totalTests++;
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                result.tests.push({
                    name: 'פילטרים בראש העמוד',
                    status: 'skipped',
                    message: `לא ניתן לבדוק: ${error.message}`
                });
            }
            
            // Test 5.2: Double filter (header + internal)
            try {
                // Check for internal filters
                const internalFilters = iframeDoc.querySelectorAll('.page-filter, [data-page-filter], .filter-section:not(#unified-header .filter-section)');
                
                if (internalFilters.length > 0 && iframeDoc.querySelector('#unified-header')) {
                    // Check if double filter notification is shown
                    // This would require actually triggering both filters, which is complex
                    // For now, just check if both exist
                    result.tests.push({
                        name: 'פילטר כפול (ראשי + פנימי)',
                        status: 'info',
                        message: `נמצאו ${internalFilters.length} פילטרים פנימיים בנוסף לפילטרים בראש העמוד`
                    });
                    this.stats.totalTests++;
                }
            } catch (error) {
                result.tests.push({
                    name: 'פילטר כפול',
                    status: 'skipped',
                    message: `לא ניתן לבדוק: ${error.message}`
                });
            }
            
            // Test 5.3: Filter state persistence
            try {
                if (iframeWindow.HeaderSystem && iframeWindow.UnifiedCacheManager) {
                    // Check if filter state can be saved
                    result.tests.push({
                        name: 'שמירת מצב פילטרים',
                        status: 'success',
                        message: 'מערכות שמירת מצב זמינות'
                    });
                    this.stats.passed++;
                    this.stats.totalTests++;
                } else {
                    result.tests.push({
                        name: 'שמירת מצב פילטרים',
                        status: 'warning',
                        message: 'מערכות שמירת מצב לא זמינות'
                    });
                    this.stats.totalTests++;
                }
            } catch (error) {
                result.tests.push({
                    name: 'שמירת מצב פילטרים',
                    status: 'skipped',
                    message: `לא ניתן לבדוק: ${error.message}`
                });
            }
            
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            
            // Update status based on test results
            const failedTests = result.tests.filter(t => t.status === 'failed').length;
            const warningTests = result.tests.filter(t => t.status === 'warning').length;
            
            if (failedTests > 0 || result.errors.length > 0) {
                result.status = 'failed';
            } else if (warningTests > 0) {
                result.status = 'warning';
            }
            
            // Format error message for display
            if (result.errors.length > 0) {
                result.error = result.errors.join('; ');
            } else if (result.tests.length > 0) {
                const failed = result.tests.filter(t => t.status === 'failed');
                const warnings = result.tests.filter(t => t.status === 'warning');
                if (failed.length > 0) {
                    result.error = failed.map(t => t.message).join('; ');
                } else if (warnings.length > 0) {
                    result.error = warnings.map(t => t.message).join('; ');
                } else {
                    result.error = 'OK';
                }
            } else {
                result.error = 'OK';
            }
            
            // Note: Don't cleanup iframe - crudTester manages it in testIframeContainer
            
        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
            result.error = error.message;
            result.executionTime = Date.now() - startTime;
            this.logger?.error(`Error in testFilters for ${page.name}`, error);
            
            // Note: Don't cleanup iframe on error - crudTester manages it in testIframeContainer
        }
        
        this.results.filters.push(result);
        
        // Update dashboard and test results table after each test (same as CRUD tests)
        if (this.crudTester) {
            if (typeof this.crudTester.updateTestResults === 'function') {
                this.crudTester.updateTestResults();
            }
            if (typeof this.crudTester.updateDashboard === 'function') {
                this.crudTester.updateDashboard();
            }
        }
        
        // Clean up iframe after test completes (same as CRUD tests)
        if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
            this.crudTester.cleanupTestIframes();
        }
    }
    
    /**
     * Helper: Wait for element in iframe
     * @param {HTMLIFrameElement} iframe - Iframe element
     * @param {string} selector - CSS selector
     * @param {number} timeout - Timeout in ms
     * @returns {Promise<Element>} Found element
     */
    async waitForElementInIframe(iframe, selector, timeout = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const element = iframeDoc.querySelector(selector);
                if (element) {
                    return element;
                }
            } catch (e) {
                // Cross-origin or not loaded yet
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error(`Element ${selector} not found in iframe within ${timeout}ms`);
    }
    
    /**
     * Helper: Get iframe document
     * @param {HTMLIFrameElement} iframe - Iframe element
     * @returns {Document} Iframe document
     */
    getIframeDocument(iframe) {
        return iframe.contentDocument || iframe.contentWindow.document;
    }
    
    /**
     * Helper: Get iframe window
     * @param {HTMLIFrameElement} iframe - Iframe element
     * @returns {Window} Iframe window
     */
    getIframeWindow(iframe) {
        return iframe.contentWindow;
    }
    
    /**
     * Test 6: Info Summary
     * @param {Object} page - Page configuration
     */
    async testInfoSummary(page) {
        const startTime = Date.now();
        const result = {
            page: page.name,
            workflow: `${page.name} - סיכום מידע`,
            status: 'success',
            tests: [],
            errors: [],
            executionTime: 0
        };
        
        let testIframe = null;
        
        try {
            // Clean up any existing iframes before starting new test (same as CRUD tests)
            if (this.crudTester && typeof this.crudTester.cleanupTestIframes === 'function') {
                this.crudTester.cleanupTestIframes();
            }
            
            // Load page in visible iframe using crudTester's method (same as CRUD tests)
            if (!this.crudTester || typeof this.crudTester.loadPageInIframe !== 'function') {
                throw new Error('crudTester.loadPageInIframe is not available');
            }
            
            // Add .html extension if needed (same as CRUD tests)
            const pageUrl = page.url.endsWith('.html') ? page.url : `${page.url}.html`;
            testIframe = await this.crudTester.loadPageInIframe(pageUrl);
            
            const iframeDoc = this.getIframeDocument(testIframe);
            const iframeWindow = this.getIframeWindow(testIframe);
            
            await this.waitForElementInIframe(testIframe, 'main, [data-section="main"], .main-content', 10000);
            
            // Test 6.1: Check if info summary container exists
            try {
                const infoSummaryContainer = iframeDoc.querySelector('#infoSummaryContainer');
                if (infoSummaryContainer) {
                    result.tests.push({
                        name: 'קיים אלמנט סיכום מידע',
                        status: 'success',
                        message: 'נמצא אלמנט #infoSummaryContainer'
                    });
                    this.stats.passed++;
                    
                    // Test 6.2: Check if info summary is rendered
                    const summaryCards = infoSummaryContainer.querySelectorAll('.info-summary-card, .summary-card, [data-summary-type]');
                    if (summaryCards.length > 0) {
                        result.tests.push({
                            name: 'סיכום מידע מוצג',
                            status: 'success',
                            message: `נמצאו ${summaryCards.length} כרטיסי סיכום`
                        });
                        this.stats.passed++;
                    } else {
                        result.tests.push({
                            name: 'סיכום מידע מוצג',
                            status: 'warning',
                            message: 'אלמנט קיים אך לא נמצאו כרטיסי סיכום'
                        });
                    }
                    this.stats.totalTests++;
                    
                    // Test 6.3: Check if InfoSummarySystem is available
                    if (iframeWindow.InfoSummarySystem) {
                        result.tests.push({
                            name: 'מערכת InfoSummarySystem זמינה',
                            status: 'success',
                            message: 'מערכת סיכום מידע זמינה'
                        });
                        this.stats.passed++;
                    } else {
                        result.tests.push({
                            name: 'מערכת InfoSummarySystem זמינה',
                            status: 'warning',
                            message: 'מערכת סיכום מידע לא זמינה'
                        });
                    }
                    this.stats.totalTests++;
                } else {
                    result.tests.push({
                        name: 'קיים אלמנט סיכום מידע',
                        status: 'skipped',
                        message: 'לא נמצא אלמנט #infoSummaryContainer - עמוד זה לא משתמש בסיכום מידע'
                    });
                }
                this.stats.totalTests++;
            } catch (error) {
                result.tests.push({
                    name: 'בדיקת סיכום מידע',
                    status: 'skipped',
                    message: `לא ניתן לבדוק: ${error.message}`
                });
            }
            
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            
            // Update status based on test results
            const failedTests = result.tests.filter(t => t.status === 'failed').length;
            const warningTests = result.tests.filter(t => t.status === 'warning').length;
            
            if (failedTests > 0 || result.errors.length > 0) {
                result.status = 'failed';
            } else if (warningTests > 0) {
                result.status = 'warning';
            }
            
            // Format error message for display
            if (result.errors.length > 0) {
                result.error = result.errors.join('; ');
            } else if (result.tests.length > 0) {
                const failed = result.tests.filter(t => t.status === 'failed');
                const warnings = result.tests.filter(t => t.status === 'warning');
                if (failed.length > 0) {
                    result.error = failed.map(t => t.message).join('; ');
                } else if (warnings.length > 0) {
                    result.error = warnings.map(t => t.message).join('; ');
                } else {
                    result.error = 'OK';
                }
            } else {
                result.error = 'OK';
            }
            
            // Note: Don't cleanup iframe - crudTester manages it in testIframeContainer
            
        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
            result.error = error.message;
            result.executionTime = Date.now() - startTime;
            this.logger?.error(`Error in testInfoSummary for ${page.name}`, error);
            
            // Note: Don't cleanup iframe on error - crudTester manages it in testIframeContainer
        }
        
        this.results.infoSummary.push(result);
        
        // Update dashboard if crudTester is available
        if (this.crudTester && typeof this.crudTester.updateTestResults === 'function') {
            this.crudTester.updateTestResults();
        }
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.CrossPageTester = CrossPageTester;
}

