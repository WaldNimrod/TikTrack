/**
 * Test Header Only Page - JavaScript Functions
 * פונקציות JavaScript ספציפיות לעמוד בדיקת ראש הדף
 * 
 * @version 1.0.0
 * @lastUpdated January 15, 2025
 * @author TikTrack Development Team
 */

// ===== STATUS COLORS TESTING =====

/**
 * בדיקת צבעי סטטוס דינמיים
 */
function testStatusColors() {
    console.log('🧪 Testing dynamic status colors...');
    
    // בדיקת פונקציות צבעי סטטוס
    if (typeof getStatusColor === 'function') {
        console.log('✅ getStatusColor function available');
        
        // בדיקת צבעי סטטוס שונים
        const statuses = ['open', 'closed', 'cancelled'];
        statuses.forEach(status => {
            const color = getStatusColor(status, 'medium');
            const bgColor = getStatusBackgroundColor(status);
            const textColor = getStatusTextColor(status);
            const borderColor = getStatusBorderColor(status);
            
            console.log(`Status: ${status}`);
            console.log(`  Color: ${color}`);
            console.log(`  Background: ${bgColor}`);
            console.log(`  Text: ${textColor}`);
            console.log(`  Border: ${borderColor}`);
        });
    } else {
        console.log('❌ getStatusColor function not available');
    }
    
    // בדיקת CSS Variables
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const statusVars = [
        '--status-open-color',
        '--status-closed-color', 
        '--status-cancelled-color'
    ];
    
    statusVars.forEach(varName => {
        const value = computedStyle.getPropertyValue(varName);
        console.log(`CSS Variable ${varName}: ${value}`);
    });
}

/**
 * עדכון תצוגת צבעי סטטוס
 */
function updateStatusColorDisplay() {
    console.log('🎨 Updating status color display...');
    
    // עדכון תגיות סטטוס בטבלה
    const statusElements = document.querySelectorAll('[data-status]');
    statusElements.forEach(element => {
        const status = element.getAttribute('data-status');
        const statusBadge = element.querySelector('.status-badge');
        
        if (statusBadge) {
            // הסרת מחלקות סטטוס קיימות
            statusBadge.classList.remove('status-open', 'status-closed', 'status-cancelled');
            
            // הוספת מחלקת סטטוס נכונה
            switch(status) {
                case 'פתוח':
                    statusBadge.classList.add('status-open');
                    break;
                case 'סגור':
                    statusBadge.classList.add('status-closed');
                    break;
                case 'מבוטל':
                    statusBadge.classList.add('status-cancelled');
                    break;
            }
        }
    });
    
    console.log('✅ Status color display updated');
}

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
 * אתחול העמוד
 */
document.addEventListener('DOMContentLoaded', function() {
    log('עמוד בדיקת ראש הדף נטען');
    updateDebugInfo();
    updateQuickStats();
    
    // בדיקת צבעי סטטוס דינמיים
    setTimeout(() => {
        testStatusColors();
        updateStatusColorDisplay();
    }, 1000);
});

// ===== EXPORTS =====

// Export functions to global scope
window.updateFilterDebugInfo = updateFilterDebugInfo;
window.testStatusColors = testStatusColors;
window.updateStatusColorDisplay = updateStatusColorDisplay;
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
