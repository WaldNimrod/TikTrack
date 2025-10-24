// Research page functions

// Initialize research page
function initializeResearchPage() {
    window.Logger.info('🔍 Initializing Research Page...', { page: "research" });
    
    // Load initial research data
    loadResearchData();
    
    // Set up event listeners
    setupResearchEventListeners();
}

// Load research data
function loadResearchData() {
    window.Logger.info('📊 Loading research data...', { page: "research" });
    
    // Simulate loading data
    setTimeout(() => {
        showSuccessNotification('נתוני התחקיר נטענו בהצלחה', '', 4000, 'business');
    }, 1000);
}

// Setup event listeners
function setupResearchEventListeners() {
    // Add any specific event listeners for research page
    window.Logger.info('🎯 Setting up research event listeners...', { page: "research" });
}

// Research tool functions
function analyzeMarketTrends() {
    showInfoNotification('מנתח מגמות שוק...');
    // Simulate analysis
    setTimeout(() => {
        showSuccessNotification('ניתוח מגמות הושלם', '', 4000, 'business');
    }, 2000);
}

function compareTickers() {
    showInfoNotification('משווה טיקרים...');
    // Simulate comparison
    setTimeout(() => {
        showSuccessNotification('השוואת טיקרים הושלמה', '', 4000, 'business');
    }, 1500);
}

function technicalAnalysis() {
    showInfoNotification('מבצע ניתוח טכני...');
    // Simulate analysis
    setTimeout(() => {
        showSuccessNotification('ניתוח טכני הושלם', '', 4000, 'business');
    }, 2500);
}

function getMarketOverview() {
    showInfoNotification('טוען סקירת שוק...');
    // Simulate loading
    setTimeout(() => {
        showSuccessNotification('סקירת שוק נטענה');
    }, 1200);
}

function getVolatilityIndex() {
    showInfoNotification('מחשב מדד תנודתיות...');
    // Simulate calculation
    setTimeout(() => {
        showSuccessNotification('מדד תנודתיות חושב');
    }, 1800);
}

function getNewsFeed() {
    showInfoNotification('טוען חדשות שוק...');
    // Simulate loading
    setTimeout(() => {
        showSuccessNotification('חדשות שוק נטענו');
    }, 1000);
}

function exportResearchData() {
    showInfoNotification('מייצא נתוני תחקיר...');
    // Simulate export
    setTimeout(() => {
        showSuccessNotification('נתוני התחקיר יוצאו בהצלחה');
    }, 2000);
}

// Detailed Log Functions for Research Page
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
