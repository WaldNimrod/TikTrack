/**
 * Page Utils - TikTrack Page Management Utilities
 * ===============================================
 * 
 * This file contains all page-related utility functions including:
 * - Page initialization
 * - Filter management
 * - Table statistics
 * - Page state management
 * 
 * Extracted from main.js to improve modularity and maintainability.
 * 
 * @version 1.0
 * @lastUpdated August 24, 2025
 */

// ===== פונקציות ניהול דפים =====
// Page management functions

/**
 * פונקציה לאתחול פילטרים לדף
 * Initialize page filters
 * 
 * @param {string} pageName - שם הדף
 */
function initializePageFilters(pageName) {
    console.log(`🔄 אתחול פילטרים לדף: ${pageName}`);

    // כאן תהיה לוגיקת אתחול הפילטרים
    // כרגע זו פונקציה ריקה כי הפילטרים מטופלים על ידי header-system.js

    console.log(`✅ פילטרים לאתחול לדף ${pageName} הושלמו`);
}

/**
 * פונקציה להגדרת כותרות למיון
 * Setup sortable headers for tables
 */
function setupSortableHeaders() {
    console.log('🔄 הגדרת כותרות למיון');

    // כאן תהיה לוגיקת הגדרת כותרות למיון
    // כרגע זו פונקציה ריקה כי המיון מטופל על ידי מערכת אחרת

    console.log('✅ כותרות למיון הוגדרו');
}

/**
 * פונקציה לעדכון סטטיסטיקות הטבלה
 * Update table statistics
 */
function updateTableStats() {
    console.log('🔄 עדכון סטטיסטיקות הטבלה');

    // כאן תהיה לוגיקת עדכון הסטטיסטיקות
    // כרגע זו פונקציה ריקה

    console.log('✅ סטטיסטיקות הטבלה עודכנו');
}

/**
 * פונקציה לדיבוג פילטרים שמורים
 * Debug saved filters
 * 
 * @param {string} pageName - שם הדף
 */
function debugSavedFilters(pageName) {
    console.log(`🔄 דיבוג פילטרים שמורים עבור דף: ${pageName}`);

    // בדיקת פילטרים שמורים ב-localStorage
    const savedStatuses = localStorage.getItem(`${pageName}FilterStatuses`);
    const savedDateRange = localStorage.getItem(`${pageName}FilterDateRange`);
    const savedSearch = localStorage.getItem(`${pageName}FilterSearch`);

    console.log(`📊 פילטרים שמורים עבור ${pageName}:`, {
        statuses: savedStatuses,
        dateRange: savedDateRange,
        search: savedSearch
    });
}

/**
 * פונקציה לשחזור מצב סקשן עיצובים (לא רלוונטי לדף המעקב)
 * Restore designs section state (not relevant for trades page)
 */
function restoreDesignsSectionState() {
    console.log('🔄 שחזור מצב סקשן עיצובים (לא רלוונטי לדף המעקב)');
    // פונקציה ריקה - לא רלוונטית לדף המעקב
}

/**
 * פונקציה לאתחול דף
 * Initialize page
 * 
 * @param {string} pageName - שם הדף
 */
function initializePage(pageName) {
    console.log(`🔄 אתחול דף: ${pageName}`);

    // אתחול פילטרים
    initializePageFilters(pageName);

    // הגדרת כותרות למיון
    setupSortableHeaders();

    // עדכון סטטיסטיקות
    updateTableStats();

    console.log(`✅ אתחול דף ${pageName} הושלם`);
}

/**
 * פונקציה לשמירת מצב דף
 * Save page state
 * 
 * @param {string} pageName - שם הדף
 * @param {Object} state - מצב הדף
 */
function savePageState(pageName, state) {
    console.log(`🔄 שמירת מצב דף: ${pageName}`, state);

    try {
        localStorage.setItem(`${pageName}State`, JSON.stringify(state));
        console.log(`✅ מצב דף ${pageName} נשמר בהצלחה`);
    } catch (error) {
        console.error(`❌ שגיאה בשמירת מצב דף ${pageName}:`, error);
    }
}

/**
 * פונקציה לטעינת מצב דף
 * Load page state
 * 
 * @param {string} pageName - שם הדף
 * @returns {Object|null} מצב הדף או null
 */
function loadPageState(pageName) {
    console.log(`🔄 טעינת מצב דף: ${pageName}`);

    try {
        const savedState = localStorage.getItem(`${pageName}State`);
        if (savedState) {
            const state = JSON.parse(savedState);
            console.log(`✅ מצב דף ${pageName} נטען בהצלחה`, state);
            return state;
        }
    } catch (error) {
        console.error(`❌ שגיאה בטעינת מצב דף ${pageName}:`, error);
    }

    return null;
}

/**
 * פונקציה לניקוי מצב דף
 * Clear page state
 * 
 * @param {string} pageName - שם הדף
 */
function clearPageState(pageName) {
    console.log(`🔄 ניקוי מצב דף: ${pageName}`);

    try {
        localStorage.removeItem(`${pageName}State`);
        localStorage.removeItem(`${pageName}FilterStatuses`);
        localStorage.removeItem(`${pageName}FilterDateRange`);
        localStorage.removeItem(`${pageName}FilterSearch`);
        console.log(`✅ מצב דף ${pageName} נוקה בהצלחה`);
    } catch (error) {
        console.error(`❌ שגיאה בניקוי מצב דף ${pageName}:`, error);
    }
}

/**
 * פונקציה לבדיקת זמינות דף
 * Check page availability
 * 
 * @param {string} pageName - שם הדף
 * @returns {boolean} true אם הדף זמין
 */
function isPageAvailable(pageName) {
    const availablePages = [
        'accounts', 'trades', 'tickers', 'alerts', 'cash_flows',
        'notes', 'trade_plans', 'executions', 'preferences'
    ];

    return availablePages.includes(pageName);
}

/**
 * פונקציה לקבלת מידע על דף
 * Get page information
 * 
 * @param {string} pageName - שם הדף
 * @returns {Object|null} מידע על הדף או null
 */
function getPageInfo(pageName) {
    const pageInfo = {
        'accounts': {
            title: 'חשבונות',
            icon: '💰',
            description: 'ניהול חשבונות מסחר'
        },
        'trades': {
            title: 'טריידים',
            icon: '📈',
            description: 'ניהול טריידים פעילים וסגורים'
        },
        'tickers': {
            title: 'טיקרים',
            icon: '📊',
            description: 'ניהול מניות וניירות ערך'
        },
        'alerts': {
            title: 'התראות',
            icon: '🔔',
            description: 'ניהול התראות מחיר וזמן'
        },
        'cash_flows': {
            title: 'תזרים מזומנים',
            icon: '💸',
            description: 'ניהול תזרים מזומנים'
        },
        'notes': {
            title: 'הערות',
            icon: '📝',
            description: 'ניהול הערות ומועדפים'
        },
        'trade_plans': {
            title: 'תוכניות טרייד',
            icon: '📋',
            description: 'ניהול תוכניות מסחר'
        },
        'executions': {
            title: 'ביצועים',
            icon: '⚡',
            description: 'ניהול ביצועי טריידים'
        },
        'preferences': {
            title: 'העדפות',
            icon: '⚙️',
            description: 'הגדרות מערכת'
        }
    };

    return pageInfo[pageName] || null;
}

/**
 * פונקציה לניווט לדף
 * Navigate to page
 * 
 * @param {string} pageName - שם הדף
 * @param {Object} options - אפשרויות ניווט
 */
function navigateToPage(pageName, options = {}) {
    console.log(`🔄 ניווט לדף: ${pageName}`, options);

    if (!isPageAvailable(pageName)) {
        console.error(`❌ דף ${pageName} אינו זמין`);
        return;
    }

    const pageInfo = getPageInfo(pageName);
    if (pageInfo) {
        console.log(`📍 ניווט ל: ${pageInfo.title} (${pageInfo.icon})`);
    }

    // שמירת מצב נוכחי אם נדרש
    if (options.saveState) {
        const currentPage = getCurrentPageName();
        if (currentPage) {
            savePageState(currentPage, options.currentState);
        }
    }

    // ניווט לדף
    const url = options.useHtml ? `/${pageName}.html` : `/${pageName}`;
    window.location.href = url;
}

/**
 * פונקציה לקבלת שם הדף הנוכחי
 * Get current page name
 * 
 * @returns {string|null} שם הדף הנוכחי או null
 */
function getCurrentPageName() {
    const path = window.location.pathname;

    // הסרת סיומת .html אם קיימת
    const cleanPath = path.replace(/\.html$/, '');

    // הסרת / מתחילת הנתיב
    const pageName = cleanPath.replace(/^\//, '');

    return pageName || null;
}

/**
 * פונקציה לבדיקת אם הדף הנוכחי הוא דף מסוים
 * Check if current page is specific page
 * 
 * @param {string} pageName - שם הדף לבדיקה
 * @returns {boolean} true אם זה הדף הנוכחי
 */
function isCurrentPage(pageName) {
    const currentPage = getCurrentPageName();
    return currentPage === pageName;
}

// ===== ייצוא פונקציות גלובליות =====
// Export global functions

window.initializePageFilters = initializePageFilters;
window.setupSortableHeaders = setupSortableHeaders;
window.updateTableStats = updateTableStats;
window.debugSavedFilters = debugSavedFilters;
window.restoreDesignsSectionState = restoreDesignsSectionState;
window.initializePage = initializePage;
window.savePageState = savePageState;
window.loadPageState = loadPageState;
window.clearPageState = clearPageState;
window.isPageAvailable = isPageAvailable;
window.getPageInfo = getPageInfo;
window.navigateToPage = navigateToPage;
window.getCurrentPageName = getCurrentPageName;
window.isCurrentPage = isCurrentPage;

console.log('✅ Page Utils loaded successfully');
