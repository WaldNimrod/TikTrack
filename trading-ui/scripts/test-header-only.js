/**
 * Test Header Only Page - JavaScript Functions
 * פונקציות JavaScript ספציפיות לעמוד בדיקת ראש הדף
 * 
 * @version 3.1.0
 * @lastUpdated January 15, 2025
 * @author TikTrack Development Team
 */

console.log('🔧 test-header-only.js loaded successfully!');


// ===== DEBUG FUNCTIONS =====

// Debug functions moved to header-system.js

/**
 * פונקציות בדיקה
 */
function log(message) {
    const logElement = document.getElementById('testLog');
    if (logElement) {
        const timestamp = new Date().toLocaleTimeString();
        logElement.innerHTML += `<p>[${timestamp}] ${message}</p>`;
        logElement.scrollTop = logElement.scrollHeight;
    }
    console.log(message);
}

function updateStatus(elementId, status, isSuccess = true) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = status;
        element.style.color = isSuccess ? 'green' : 'red';
    }
}

/**
 * פונקציית debug למצב פילטרים
 */
// updateDebugInfo function moved to header-system.js

/**
 * פונקציה לעדכון מצב פילטרים נוכחי
 */
function updateCurrentFilterStatus() {
    // פילטר סטטוס
    const statusText = document.getElementById('selectedStatus');
    const currentStatusFilter = document.getElementById('currentStatusFilter');
    if (statusText && currentStatusFilter) {
        currentStatusFilter.textContent = statusText.textContent;
    }

    // פילטר טיפוס
    const typeText = document.getElementById('selectedType');
    const currentTypeFilter = document.getElementById('currentTypeFilter');
    if (typeText && currentTypeFilter) {
        currentTypeFilter.textContent = typeText.textContent;
    }

    // פילטר חשבון
    const accountText = document.getElementById('selectedAccount');
    const currentAccountFilter = document.getElementById('currentAccountFilter');
    if (accountText && currentAccountFilter) {
        currentAccountFilter.textContent = accountText.textContent;
    }

    // פילטר תאריכים
    const dateRangeText = document.getElementById('selectedDateRange');
    const currentDateRangeFilter = document.getElementById('currentDateRangeFilter');
    if (dateRangeText && currentDateRangeFilter) {
        currentDateRangeFilter.textContent = dateRangeText.textContent;
    }

    // פילטר חיפוש
    const searchInput = document.getElementById('searchFilterInput');
    const currentSearchFilter = document.getElementById('currentSearchFilter');
    if (searchInput && currentSearchFilter) {
        currentSearchFilter.textContent = searchInput.value || 'אין חיפוש';
    }
}

/**
 * פונקציה לעדכון מידע טווח תאריכים
 */
function updateDateRangeInfo() {
    const startElement = document.getElementById('dateRangeStart');
    const endElement = document.getElementById('dateRangeEnd');
    const descriptionElement = document.getElementById('dateRangeDescription');

    if (startElement && endElement && descriptionElement) {
        // כאן תוכל להוסיף לוגיקה לעדכון טווח התאריכים
        startElement.textContent = 'לא נבחר';
        endElement.textContent = 'לא נבחר';
        descriptionElement.textContent = 'לא נבחר';
    }
}

/**
 * פונקציה לעדכון סטטיסטיקות טבלאות
 */
function updateTableStats() {
    // סטטיסטיקות טבלת ביצועים
    const performanceTable = document.getElementById('performanceTable');
    if (performanceTable) {
        const rows = performanceTable.querySelectorAll('tbody tr');
        document.getElementById('performanceTableCount').textContent = `${rows.length} רשומות`;
    }

    // סטטיסטיקות טבלת דיבאג
    const debugTable = document.getElementById('debugTable');
    if (debugTable) {
        const rows = debugTable.querySelectorAll('tbody tr');
        document.getElementById('debugTableCount').textContent = `${rows.length} רשומות`;
    }
}

/**
 * פונקציה לעדכון סטטיסטיקות מהירות
 */
function updateQuickStats() {
    // עדכון סטטיסטיקות מהירות
    const currentTime = new Date().toLocaleTimeString();
    const currentTimeElement = document.getElementById('currentTime');
    if (currentTimeElement) {
        currentTimeElement.textContent = currentTime;
    }

    // עדכון מספר טבלאות
    const tables = document.querySelectorAll('table');
    const tablesCountElement = document.getElementById('tablesCount');
    if (tablesCountElement) {
        tablesCountElement.textContent = `${tables.length} טבלאות`;
    }

    // עדכון מספר סקשנים
    const sections = document.querySelectorAll('.content-section');
    const sectionsCountElement = document.getElementById('sectionsCount');
    if (sectionsCountElement) {
        sectionsCountElement.textContent = `${sections.length} סקשנים`;
    }
}

/**
 * פונקציה להצגת קונטיינר פעיל
 */
function showActiveContainer() {
    log('הצגת קונטיינר פעיל...');
    // כאן תוכל להוסיף לוגיקה להצגת קונטיינר פעיל
}

// ===== TEST FUNCTIONS =====

/**
 * פונקציות בדיקה
 */
function testStatusFilter() {
    log('בדיקת פילטר סטטוס...');
    // כאן תוכל להוסיף לוגיקה לבדיקת פילטר סטטוס
}

function testTypeFilter() {
    log('בדיקת פילטר סוג...');
    // כאן תוכל להוסיף לוגיקה לבדיקת פילטר סוג
}

function testAccountFilter() {
    log('בדיקת פילטר חשבון...');
    // כאן תוכל להוסיף לוגיקה לבדיקת פילטר חשבון
}

function testDateFilter() {
    log('בדיקת פילטר תאריך...');
    // כאן תוכל להוסיף לוגיקה לבדיקת פילטר תאריך
}

function testSearchFilter() {
    log('בדיקת חיפוש חופשי...');
    // כאן תוכל להוסיף לוגיקה לבדיקת חיפוש חופשי
}

// ===== INITIALIZATION =====

/**
 * טעינת כפתורי פעולות לטבלה
 */
function loadActionButtons() {
    console.log('🔧 loadActionButtons called - START');
    console.log('🔧 loadTableActionButtons function available:', typeof window.loadTableActionButtons);
    
    // טעינת כפתורים לכל הטבלה בבת אחת
    if (typeof window.loadTableActionButtons === 'function') {
        console.log('🔧 Loading action buttons for entire table...');
        
        // הגדרות מותאמות אישית לטבלת הטיקרים
        const tickerConfig = {
            showDetails: false,  // הסתרת כפתור פרטים
            showLinked: true,
            showEdit: true,
            showCancel: true,
            showDelete: true
            // הפונקציות יוגדרו אוטומטית לפי entityType
        };
        
        window.loadTableActionButtons('tickersTable', 'ticker', tickerConfig);
        console.log('✅ Action buttons loaded for all rows');
    } else {
        console.log('❌ loadTableActionButtons function not available');
    }
}

/**
 * אתחול העמוד
 */
document.addEventListener('DOMContentLoaded', function() {
    log('עמוד בדיקת ראש הדף נטען');
    updateQuickStats();
    
    // טעינת נתונים אמיתיים מבסיס הנתונים
    loadRealData();
    
    // טעינת כפתורי פעולות אחרי שהדף נטען
    console.log('🔧 Setting timeout for loadActionButtons...');
    setTimeout(function() {
        console.log('🔧 Timeout triggered, calling loadActionButtons...');
        loadActionButtons();
    }, 100);
});

// ===== DATA LOADING FUNCTIONS =====

/**
 * טעינת נתונים אמיתיים מבסיס הנתונים
 */
async function loadRealData() {
    console.log('🔄 טעינת נתונים אמיתיים מבסיס הנתונים...');
    
    try {
        // טעינת נתוני טיקרים
        if (typeof window.loadTickersData === 'function') {
            console.log('🔄 טוען נתוני טיקרים...');
            await window.loadTickersData();
            console.log('✅ נתוני טיקרים נטענו');
        } else {
            console.warn('⚠️ פונקציית loadTickersData לא זמינה');
        }
        
        // טעינת נתוני תכנוני טריידים
        if (typeof window.loadTradePlansData === 'function') {
            console.log('🔄 טוען נתוני תכנוני טריידים...');
            await window.loadTradePlansData();
            console.log('✅ נתוני תכנוני טריידים נטענו');
        } else {
            console.warn('⚠️ פונקציית loadTradePlansData לא זמינה');
        }
        
        log('נתונים אמיתיים נטענו מבסיס הנתונים');
        
    } catch (error) {
        console.error('❌ שגיאה בטעינת נתונים:', error);
        log('שגיאה בטעינת נתונים: ' + error.message);
    }
}

// ===== TICKER TABLE FUNCTIONS =====

/**
 * פונקציות לטבלת טיקרים
 */


/**
 * פילטר טיקרים לפי סוג
 * @param {string} type - סוג הטיקר
 */
function filterTickersByType(type) {
    console.log('Filtering tickers by type:', type);
    // פונקציה בסיסית - תיושם בעתיד
}

/**
 * פתיחה/סגירה של סקשן הטיקרים
 */
function toggleTickersSection() {
    console.log('Toggling tickers section');
    // פונקציה בסיסית - תיושם בעתיד
}



// Toggle functions are now handled by the global system in ui-utils.js
// No local functions needed - using window.toggleTopSection() and window.toggleSection()

// ===== EXPORTS =====

// Export functions to global scope
window.log = log;
window.updateStatus = updateStatus;
window.updateCurrentFilterStatus = updateCurrentFilterStatus;
window.updateDateRangeInfo = updateDateRangeInfo;
window.updateTableStats = updateTableStats;
window.updateQuickStats = updateQuickStats;
window.showActiveContainer = showActiveContainer;
window.testStatusFilter = testStatusFilter;
window.testTypeFilter = testTypeFilter;
window.testAccountFilter = testAccountFilter;
window.testDateFilter = testDateFilter;
window.testSearchFilter = testSearchFilter;

// Export ticker functions
window.filterTickersByType = filterTickersByType;
window.toggleTickersSection = toggleTickersSection;
window.loadActionButtons = loadActionButtons;
window.loadRealData = loadRealData;
window.toggleTopSection = toggleTopSection;
window.toggleSection = toggleSection;
