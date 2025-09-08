/**
 * Test Header Only Page - JavaScript Functions
 * פונקציות JavaScript ספציפיות לעמוד בדיקת ראש הדף
 * 
 * @version 1.0.0
 * @lastUpdated January 15, 2025
 * @author TikTrack Development Team
 */


// ===== DEBUG FUNCTIONS =====

/**
 * פונקציה לעדכון מידע דיבאג פילטרים
 */
function updateFilterDebugInfo() {
    // עדכון מידע דיבאג - קורא ישירות מה-DOM
    const statusText = document.getElementById('selectedStatus');
    const typeText = document.getElementById('selectedType');
    const accountText = document.getElementById('selectedAccount');
    const dateRangeText = document.getElementById('selectedDateRange');
    const searchInput = document.getElementById('searchFilterInput');

    // עדכון מידע דיבאג
    document.getElementById('statusDebug').textContent = statusText ? statusText.textContent : 'כל הסטטוסים';
    document.getElementById('typeDebug').textContent = typeText ? typeText.textContent : 'כל הסוגים';
    document.getElementById('accountDebug').textContent = accountText ? accountText.textContent : 'כל החשבונות';
    document.getElementById('dateDebug').textContent = dateRangeText ? dateRangeText.textContent : 'כל התאריכים';
}

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
function updateDebugInfo() {
    // עדכון מצב מערכות
    if (typeof window.filterSystem !== 'undefined') {
        updateStatus('filterSystemStatus', '✅ זמין');
    } else {
        updateStatus('filterSystemStatus', '❌ לא זמין', false);
    }

    // עדכון מצב אזור פילטרים
    const filtersSection = document.getElementById('headerFilters');
    if (filtersSection) {
        const isVisible = filtersSection.style.display !== 'none';
        updateStatus('filtersSectionStatus', isVisible ? '✅ פתוח' : '❌ סגור', isVisible);
    }

    // עדכון מצב פילטרים נוכחי
    updateCurrentFilterStatus();

    // עדכון טווח תאריכים
    updateDateRangeInfo();

    // עדכון סטטיסטיקות טבלאות
    updateTableStats();

    // עדכון מידע דיבאג פילטרים
    updateFilterDebugInfo();
}

/**
 * פונקציה לעדכון מצב פילטרים נוכחי
 */
function updateCurrentFilterStatus() {
    // פילטר סטטוס
    const statusText = document.getElementById('selectedStatus');
    if (statusText) {
        document.getElementById('currentStatusFilter').textContent = statusText.textContent;
    }

    // פילטר טיפוס
    const typeText = document.getElementById('selectedType');
    if (typeText) {
        document.getElementById('currentTypeFilter').textContent = typeText.textContent;
    }

    // פילטר חשבון
    const accountText = document.getElementById('selectedAccount');
    if (accountText) {
        document.getElementById('currentAccountFilter').textContent = accountText.textContent;
    }

    // פילטר תאריכים
    const dateRangeText = document.getElementById('selectedDateRange');
    if (dateRangeText) {
        document.getElementById('currentDateRangeFilter').textContent = dateRangeText.textContent;
    }

    // פילטר חיפוש
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
        document.getElementById('currentSearchFilter').textContent = searchInput.value || 'אין חיפוש';
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
    document.getElementById('currentTime').textContent = currentTime;

    // עדכון מספר טבלאות
    const tables = document.querySelectorAll('table');
    document.getElementById('tablesCount').textContent = `${tables.length} טבלאות`;

    // עדכון מספר סקשנים
    const sections = document.querySelectorAll('.content-section');
    document.getElementById('sectionsCount').textContent = `${sections.length} סקשנים`;
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
    console.log('🔧 loadActionButtons called');
    console.log('🔧 generateActionButtons function available:', typeof generateActionButtons);
    
    // טעינת כפתורים לשורה 1 (AAPL)
    const cell1 = document.getElementById('actions-cell-1');
    console.log('🔧 Cell 1 found:', !!cell1);
    if (cell1 && typeof generateActionButtons === 'function') {
        console.log('🔧 Loading buttons for cell 1...');
        const buttonsHtml = generateActionButtons(1, 'ticker', 'פתוח', 'viewTickerDetails', 'viewLinkedItems', 'editTicker', 'cancelTicker', 'restoreTicker', 'deleteTicker', true, true, true, true, true);
        cell1.innerHTML = buttonsHtml;
        console.log('🔧 Cell 1 HTML set:', cell1.innerHTML.length, 'characters');
    } else {
        console.log('❌ Cell 1 not found or function not available');
    }
    
    // טעינת כפתורים לשורה 2 (MSFT)
    const cell2 = document.getElementById('actions-cell-2');
    console.log('🔧 Cell 2 found:', !!cell2);
    if (cell2 && typeof generateActionButtons === 'function') {
        console.log('🔧 Loading buttons for cell 2...');
        const buttonsHtml = generateActionButtons(2, 'ticker', 'פתוח', 'viewTickerDetails', 'viewLinkedItems', 'editTicker', 'cancelTicker', 'restoreTicker', 'deleteTicker', true, true, true, true, true);
        cell2.innerHTML = buttonsHtml;
        console.log('🔧 Cell 2 HTML set:', cell2.innerHTML.length, 'characters');
    } else {
        console.log('❌ Cell 2 not found or function not available');
    }
    
    // טעינת כפתורים לשורה 3 (GOOGL)
    const cell3 = document.getElementById('actions-cell-3');
    console.log('🔧 Cell 3 found:', !!cell3);
    if (cell3 && typeof generateActionButtons === 'function') {
        console.log('🔧 Loading buttons for cell 3...');
        const buttonsHtml = generateActionButtons(3, 'ticker', 'סגור', 'viewTickerDetails', 'viewLinkedItems', 'editTicker', 'cancelTicker', 'restoreTicker', 'deleteTicker', true, true, true, true, true);
        cell3.innerHTML = buttonsHtml;
        console.log('🔧 Cell 3 HTML set:', cell3.innerHTML.length, 'characters');
    } else {
        console.log('❌ Cell 3 not found or function not available');
    }
    
    // טעינת כפתורים לשורה 4 (TSLA)
    const cell4 = document.getElementById('actions-cell-4');
    console.log('🔧 Cell 4 found:', !!cell4);
    if (cell4 && typeof generateActionButtons === 'function') {
        console.log('🔧 Loading buttons for cell 4...');
        const buttonsHtml = generateActionButtons(4, 'ticker', 'פתוח', 'viewTickerDetails', 'viewLinkedItems', 'editTicker', 'cancelTicker', 'restoreTicker', 'deleteTicker', true, true, true, true, true);
        cell4.innerHTML = buttonsHtml;
        console.log('🔧 Cell 4 HTML set:', cell4.innerHTML.length, 'characters');
    } else {
        console.log('❌ Cell 4 not found or function not available');
    }
    
    // טעינת כפתורים לשורה 5 (NVDA)
    const cell5 = document.getElementById('actions-cell-5');
    console.log('🔧 Cell 5 found:', !!cell5);
    if (cell5 && typeof generateActionButtons === 'function') {
        console.log('🔧 Loading buttons for cell 5...');
        const buttonsHtml = generateActionButtons(5, 'ticker', 'פתוח', 'viewTickerDetails', 'viewLinkedItems', 'editTicker', 'cancelTicker', 'restoreTicker', 'deleteTicker', true, true, true, true, true);
        cell5.innerHTML = buttonsHtml;
        console.log('🔧 Cell 5 HTML set:', cell5.innerHTML.length, 'characters');
    } else {
        console.log('❌ Cell 5 not found or function not available');
    }
}

/**
 * אתחול העמוד
 */
document.addEventListener('DOMContentLoaded', function() {
    log('עמוד בדיקת ראש הדף נטען');
    updateDebugInfo();
    updateQuickStats();
    
    // טעינת כפתורי פעולות אחרי שהדף נטען
    setTimeout(loadActionButtons, 100);
});

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
window.updateFilterDebugInfo = updateFilterDebugInfo;
window.log = log;
window.updateStatus = updateStatus;
window.updateDebugInfo = updateDebugInfo;
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
window.toggleTopSection = toggleTopSection;
window.toggleSection = toggleSection;
