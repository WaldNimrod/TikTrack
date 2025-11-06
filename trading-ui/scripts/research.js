/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 12
 * 
 * PAGE INITIALIZATION (2)
 * - initializeResearchPage() - Initialize the research page
 * - setupResearchEventListeners() - Setup research event listeners
 * 
 * DATA LOADING (4)
 * - loadResearchData() - Load research data from server
 * - getMarketOverview() - Get market overview
 * - getVolatilityIndex() - Get volatility index
 * - getNewsFeed() - Get news feed
 * 
 * OTHER (6)
 * - analyzeMarketTrends() - Analyze market trends
 * - compareTickers() - Compare tickers
 * - technicalAnalysis() - Perform technical analysis
 * - exportResearchData() - Export research data
 * - generateDetailedLog() - Generate detailed log
 * - generateDetailedLogForResearch() - Generate detailed log
 * 
 * ==========================================
 */
/**
 * Research Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for the research page including:
 * - Page initialization and data loading
 * - Event handling and UI interactions
 * - Research tools and analysis functions
 * - Market data processing and visualization
 * - Export and reporting functionality
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

// ===== PAGE INITIALIZATION =====
/**
 * Initialize the research page
 * @function initializeResearchPage
 * @returns {void}
 */
function initializeResearchPage() {
    try {
        window.Logger.info('🔍 Initializing Research Page...', { page: "research" });
        
        // Load initial research data
        loadResearchData();
        
        // Set up event listeners
        setupResearchEventListeners();
    } catch (error) {
        window.Logger.error('שגיאה באתחול עמוד המחקר:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה באתחול עמוד המחקר', error.message);
        }
    }
}

// ===== DATA LOADING =====
/**
 * Load research data from server
 * @function loadResearchData
 * @returns {void}
 */
function loadResearchData() {
    try {
        window.Logger.info('📊 Loading research data...', { page: "research" });
        
        // Simulate loading data
        setTimeout(() => {
            showSuccessNotification('נתוני התחקיר נטענו בהצלחה', '', 4000, 'business');
        }, 1000);
    } catch (error) {
        window.Logger.error('שגיאה בטעינת נתוני המחקר:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת נתוני המחקר', error.message);
        }
    }
}

// ===== EVENT HANDLING =====
/**
 * Setup research event listeners
 * @function setupResearchEventListeners
 * @returns {void}
 */
function setupResearchEventListeners() {
    try {
        // Add any specific event listeners for research page
        window.Logger.info('🎯 Setting up research event listeners...', { page: "research" });
    } catch (error) {
        window.Logger.error('שגיאה בהגדרת אירועי המחקר:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהגדרת אירועי המחקר', error.message);
        }
    }
}

// ===== RESEARCH TOOLS =====
/**
 * Analyze market trends
 * @function analyzeMarketTrends
 * @returns {void}
 */
function analyzeMarketTrends() {
    try {
        showInfoNotification('מנתח מגמות שוק...');
        // Simulate analysis
        setTimeout(() => {
            showSuccessNotification('ניתוח מגמות הושלם', '', 4000, 'business');
        }, 2000);
    } catch (error) {
        window.Logger.error('שגיאה בניתוח מגמות שוק:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בניתוח מגמות שוק', error.message);
        }
    }
}

/**
 * Compare tickers
 * @function compareTickers
 * @returns {void}
 */
function compareTickers() {
    try {
        showInfoNotification('משווה טיקרים...');
        // Simulate comparison
        setTimeout(() => {
            showSuccessNotification('השוואת טיקרים הושלמה', '', 4000, 'business');
        }, 1500);
    } catch (error) {
        window.Logger.error('שגיאה בהשוואת טיקרים:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהשוואת טיקרים', error.message);
        }
    }
}

/**
 * Perform technical analysis
 * @function technicalAnalysis
 * @returns {void}
 */
function technicalAnalysis() {
    try {
        showInfoNotification('מבצע ניתוח טכני...');
        // Simulate analysis
        setTimeout(() => {
            showSuccessNotification('ניתוח טכני הושלם', '', 4000, 'business');
        }, 2500);
    } catch (error) {
        window.Logger.error('שגיאה בניתוח טכני:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בניתוח טכני', error.message);
        }
    }
}

/**
 * Get market overview
 * @function getMarketOverview
 * @returns {void}
 */
function getMarketOverview() {
    try {
        showInfoNotification('טוען סקירת שוק...');
        // Simulate loading
        setTimeout(() => {
            showSuccessNotification('סקירת שוק נטענה');
        }, 1200);
    } catch (error) {
        window.Logger.error('שגיאה בקבלת סקירת שוק:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בקבלת סקירת שוק', error.message);
        }
    }
}

/**
 * Get volatility index
 * @function getVolatilityIndex
 * @returns {void}
 */
function getVolatilityIndex() {
    try {
        showInfoNotification('מחשב מדד תנודתיות...');
        // Simulate calculation
        setTimeout(() => {
            showSuccessNotification('מדד תנודתיות חושב');
        }, 1800);
    } catch (error) {
        window.Logger.error('שגיאה בחישוב מדד תנודתיות:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בחישוב מדד תנודתיות', error.message);
        }
    }
}

/**
 * Get news feed
 * @function getNewsFeed
 * @returns {void}
 */
function getNewsFeed() {
    try {
        showInfoNotification('טוען חדשות שוק...');
        // Simulate loading
        setTimeout(() => {
            showSuccessNotification('חדשות שוק נטענו');
        }, 1000);
    } catch (error) {
        window.Logger.error('שגיאה בטעינת חדשות שוק:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת חדשות שוק', error.message);
        }
    }
}

/**
 * Export research data
 * @function exportResearchData
 * @returns {void}
 */
function exportResearchData() {
    try {
        showInfoNotification('מייצא נתוני תחקיר...');
        // Simulate export
        setTimeout(() => {
            showSuccessNotification('נתוני התחקיר יוצאו בהצלחה');
        }, 2000);
    } catch (error) {
        window.Logger.error('שגיאה בייצוא נתוני תחקיר:', error, { page: "research" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בייצוא נתוני תחקיר', error.message);
        }
    }
}

/**
 * Generate detailed log
 * @function generateDetailedLog
 * @returns {void}
 */
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'research',
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            },
            memory: window.performance.memory ? {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            } : null,
            researchStats: {
                totalProfit: document.querySelector('.card-value')?.textContent || 'לא נמצא',
                activeTrades: document.querySelectorAll('.card-value')[1]?.textContent || 'לא נמצא',
                successRate: document.querySelectorAll('.card-value')[2]?.textContent || 'לא נמצא',
                profitChange: document.querySelector('.card-change.positive')?.textContent || 'לא נמצא'
            },
            sections: {
                contentSection: {
                    title: 'תחקיר שוק',
                    visible: !document.querySelector('.content-section')?.classList.contains('d-none'),
                    researchResults: document.getElementById('researchResults')?.textContent?.substring(0, 200) || 'לא נמצא'
                }
            },
            researchTools: {
                analyzeMarketTrends: typeof window.analyzeMarketTrends === 'function' ? 'זמין' : 'לא זמין',
                compareTickers: typeof window.compareTickers === 'function' ? 'זמין' : 'לא זמין',
                technicalAnalysis: typeof window.technicalAnalysis === 'function' ? 'זמין' : 'לא זמין',
                getMarketOverview: typeof window.getMarketOverview === 'function' ? 'זמין' : 'לא זמין',
                getVolatilityIndex: typeof window.getVolatilityIndex === 'function' ? 'זמין' : 'לא זמין',
                getNewsFeed: typeof window.getNewsFeed === 'function' ? 'זמין' : 'לא זמין'
            },
            functions: {
                loadResearchData: typeof window.loadResearchData === 'function' ? 'זמין' : 'לא זמין',
                exportResearchData: typeof window.exportResearchData === 'function' ? 'זמין' : 'לא זמין'
            },
            summaryCards: {
                totalCards: document.querySelectorAll('.summary-card').length,
                profitCard: document.querySelector('.summary-card .card-title')?.textContent || 'לא נמצא',
                activeTradesCard: document.querySelectorAll('.summary-card .card-title')[1]?.textContent || 'לא נמצא',
                successRateCard: document.querySelectorAll('.summary-card .card-title')[2]?.textContent || 'לא נמצא'
            },
            tables: {
                researchTable: document.querySelector('table') ? 'זמין' : 'לא זמין',
                tableRows: document.querySelectorAll('tbody tr').length,
                hasData: document.querySelectorAll('tbody tr').length > 0
            },
            console: {
                errors: [],
                warnings: [],
                logs: []
            }
        };

        // Capture console messages
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = function(...args) {
            logData.console.errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            logData.console.warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };

        console.log = function(...args) {
            logData.console.logs.push(args.join(' '));
            originalLog.apply(console, args);
        };

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        return `Error generating log: ${error.message}`;
    }
}


// Export functions to global scope
// window. export removed - using global version from system-management.js
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only

// Local  function for research page
/**
 * Copy the research page detailed log to the clipboard.
 * @returns {Promise<void>}
 */
async function generateDetailedLogForResearch() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        } else {
            if (window.showWarningNotification) {
                window.showWarningNotification('אין לוג להעתקה');
            } else {
                alert('אין לוג להעתקה');
            }
        }
    } catch (err) {
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת לוג', err.message);
        } else {
            alert('שגיאה בהעתקת לוג: ' + err.message);
        }
    }
}

// ===== GLOBAL EXPORTS =====
window.initializeResearchPage = initializeResearchPage;
window.loadResearchData = loadResearchData;
window.setupResearchEventListeners = setupResearchEventListeners;
window.analyzeMarketTrends = analyzeMarketTrends;
window.compareTickers = compareTickers;
window.technicalAnalysis = technicalAnalysis;
window.getMarketOverview = getMarketOverview;
window.getVolatilityIndex = getVolatilityIndex;
window.getNewsFeed = getNewsFeed;
window.exportResearchData = exportResearchData;
window.generateDetailedLog = generateDetailedLog;
window.generateDetailedLogForResearch = generateDetailedLogForResearch;
