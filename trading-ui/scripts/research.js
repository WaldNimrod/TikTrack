// Research page functions

// Initialize research page
/**
 * Initialize the research page
 * Loads data and sets up event listeners
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

// Load research data
/**
 * Load research data from the server
 * Fetches market data, news, and analysis
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

// Setup event listeners
/**
 * Set up event listeners for research page
 * Handles user interactions and form submissions
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

// Research tool functions
/**
 * Analyze market trends
 * Performs technical analysis on market data
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
 * Compares performance of different tickers
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
 * Analyzes technical indicators and patterns
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
 * Retrieves and displays market summary data
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
 * Calculates and displays market volatility metrics
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
 * Retrieves and displays relevant market news
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
 * Exports research data in various formats
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

// Detailed Log Functions for Research Page
/**
 * Generate detailed log
 * Creates a comprehensive log of research activities
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
        window.Logger.error('שגיאה בהעתקה:', err, { page: "research" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}
