/**
 * TikTrack - Tickers Management Module
 * =====================================
 * 
 * מודול ניהול טיקרים - קובץ JavaScript ייעודי לניהול טיקרים במערכת TikTrack
 * 
 * תכונות עיקריות:
 * - טעינת וניהול טיקרים מהשרת
 * - ולידציה של נתוני טיקרים
 * - ניהול מודלים להוספה ועריכה
 * - בדיקת כפילות סימבולים
 * - ניהול פריטים מקושרים
 * 
 * פונקציות עיקריות:
 * - loadTickersData() - טעינת טיקרים מהשרת
 * - validateTickerData() - ולידציה של נתונים
 * - saveTicker() - שמירת טיקר חדש
 * - updateTickerFromModal() - עדכון טיקר קיים
 * - deleteTicker() - מחיקת טיקר עם בדיקת פריטים מקושרים
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Date: August 2025
 * 
 * @fileoverview ניהול טיקרים במערכת TikTrack
 */

// ===== TICKERS MANAGEMENT =====
// קובץ ייעודי לניהול טיקרים - משותף לכל הדפים

/**
 * ולידציה של נתוני טיקר בצד הלקוח
 * 
 * פונקציה זו מבצעת ולידציה מלאה של נתוני טיקר לפני שליחה לשרת.
 * כוללת בדיקות אורך, פורמט, ערכים מותרים ועוד.
 * 
 * @param {Object} tickerData - נתוני הטיקר לוולידציה
 * @param {string} tickerData.symbol - סימבול הטיקר (חובה)
 * @param {string} tickerData.name - שם הטיקר
 * @param {string} tickerData.type - סוג הטיקר
 * @param {string} tickerData.currency - מטבע הטיקר
 * @param {string} tickerData.remarks - הערות
 * 
 * @returns {Object} אובייקט עם תוצאות הולידציה
 * @returns {boolean} returns.isValid - האם הנתונים תקינים
 * @returns {string[]} returns.errors - רשימת שגיאות
 * @returns {string[]} returns.warnings - רשימת אזהרות
 * 
 * @example
 * const tickerData = {
 *   symbol: 'AAPL',
 *   name: 'Apple Inc.',
 *   type: 'stock',
 *   currency: 'USD'
 * };
 * const validation = validateTickerData(tickerData);
 * if (!validation.isValid) {
 *   console.log('שגיאות:', validation.errors);
 *   console.log('אזהרות:', validation.warnings);
 * }
 * 
 * @throws {Error} אם tickerData אינו אובייקט
 */
function validateTickerData(tickerData) {
    const errors = [];
    const warnings = [];

    // בדיקת סימבול
    const symbol = (tickerData.symbol || '').trim().toUpperCase();
    if (!symbol) {
        errors.push('סימבול הוא שדה חובה');
    } else if (symbol.length > 10) {
        errors.push('סימבול לא יכול להיות ארוך מ-10 תווים');
    } else if (!/^[A-Z0-9]+$/.test(symbol)) {
        errors.push('סימבול יכול להכיל רק אותיות ומספרים באנגלית');
    }

    // בדיקת שם
    const name = (tickerData.name || '').trim();
    if (name && name.length > 100) {
        errors.push('שם לא יכול להיות ארוך מ-100 תווים');
    }

    // בדיקת סוג
    const type = (tickerData.type || '').trim();
    const validTypes = ['stock', 'etf', 'crypto', 'forex', 'commodity'];
    if (type && !validTypes.includes(type)) {
        warnings.push(`סוג לא מוכר: ${type}. סוגים מוכרים: ${validTypes.join(', ')}`);
    }

    // בדיקת מטבע
    const currency = (tickerData.currency || '').trim().toUpperCase();
    if (currency && currency.length !== 3) {
        errors.push('מטבע חייב להיות בדיוק 3 תווים');
    }

    // בדיקת הערות
    const remarks = (tickerData.remarks || '').trim();
    if (remarks && remarks.length > 500) {
        errors.push('הערות לא יכולות להיות ארוכות מ-500 תווים');
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}

/**
 * בדיקה אם סימבול כבר קיים ברשימת הטיקרים
 * 
 * פונקציה זו בודקת אם סימבול מסוים כבר קיים ברשימת הטיקרים.
 * שימושית למניעת כפילות בעת הוספת טיקר חדש או עריכת טיקר קיים.
 * 
 * @param {string} symbol - הסימבול לבדיקה (יומר לאותיות גדולות)
 * @param {Array} existingTickers - רשימת הטיקרים הקיימים במערכת
 * @param {number|null} excludeId - מזהה טיקר לא לכלול בבדיקה (לעריכה)
 * 
 * @returns {boolean} True אם הסימבול קיים, False אחרת
 * 
 * @example
 * // בדיקה רגילה
 * const exists = checkSymbolExists('AAPL', tickersList);
 * 
 * // בדיקה עם הדרה (לעריכה)
 * const exists = checkSymbolExists('AAPL', tickersList, 5);
 * 
 * @throws {Error} אם symbol אינו מחרוזת
 * @throws {Error} אם existingTickers אינו מערך
 */
function checkSymbolExists(symbol, existingTickers, excludeId = null) {
    const normalizedSymbol = symbol.trim().toUpperCase();
    return existingTickers.some(ticker => {
        if (excludeId && ticker.id === excludeId) {
            return false;
        }
        return ticker.symbol === normalizedSymbol;
    });
}

/**
 * טעינת טיקרים מהשרת
 * הפונקציה טוענת את כל הטיקרים ומחזירה אותם
 * 
 * @returns {Promise<Array>} מערך של טיקרים
 * 
 * @example
 * const tickers = await loadTickersData();
 */
async function loadTickersData() {
    try {
        console.log('🔄 טוען טיקרים...');
        const response = await apiCall('/api/v1/tickers/');
        const tickers = response.data || response;
        console.log(`✅ נטענו ${tickers.length} טיקרים`);
        return tickers;
    } catch (error) {
        console.error('❌ שגיאה בטעינת טיקרים:', error);
        throw error;
    }
}

/**
 * חישוב סטטיסטיקות מנתוני הטיקרים
 * הפונקציה מחשבת סטטיסטיקות כלליות מנתוני הטיקרים
 * 
 * @param {Array} tickers - מערך של טיקרים
 * @returns {Object} אובייקט עם הסטטיסטיקות
 * 
 * @example
 * const stats = calculateTickersStats(tickers);
 */
function calculateTickersStats(tickers) {
    const openTickers = tickers.filter(ticker => ticker.status === 'פתוח').length;
    const totalTickers = tickers.length;
    const usdTickers = tickers.filter(ticker => ticker.currency === 'USD').length;
    const ilsTickers = tickers.filter(ticker => ticker.currency === 'ILS').length;

    return {
        open_tickers: openTickers,
        total_tickers: totalTickers,
        usd_tickers: usdTickers,
        ils_tickers: ilsTickers
    };
}

/**
 * המרת סטטוס טיקר מ-עברית לאנגלית
 * הפונקציה ממירה ערכים בעברית לערכים שהשרת מצפה להם
 * 
 * @param {string} statusDisplay - סטטוס בעברית
 * @returns {string} סטטוס באנגלית
 * 
 * @example
 * const status = convertTickerStatus('פתוח'); // returns 'open'
 */
function convertTickerStatus(statusDisplay) {
    return statusDisplay || 'פתוח';
}

/**
 * המרת סטטוס טיקר מאנגלית לעברית
 * הפונקציה ממירה ערכים מהשרת לערכים לתצוגה בעברית
 * 
 * @param {string} status - סטטוס באנגלית
 * @returns {string} סטטוס בעברית
 * 
 * @example
 * const statusDisplay = convertTickerStatusToHebrew('open'); // returns 'פתוח'
 */
function convertTickerStatusToHebrew(status) {
    if (status === 'open' || status === 'פתוח') {
        return 'פתוח';
    } else if (status === 'closed' || status === 'סגור') {
        return 'סגור';
    } else if (status === 'cancelled' || status === 'בוטל') {
        return 'מבוטל';
    }
    return status || 'פתוח';
}

/**
 * מילוי נתונים במודל עריכת טיקר
 * הפונקציה ממלאת את כל השדות במודל העריכה עם נתוני הטיקר
 * 
 * @param {Object} ticker - נתוני הטיקר
 * 
 * @example
 * fillTickerEditModal(tickerData);
 */
function fillTickerEditModal(ticker) {
    console.log(`🔧 מילוי מודל עריכת טיקר עם נתונים:`, ticker);

    // מילוי שדות הטופס
    document.getElementById('editTickerId').value = ticker.id;
    document.getElementById('editTickerSymbol').value = ticker.symbol || '';
    document.getElementById('editTickerName').value = ticker.name || '';
    document.getElementById('editTickerCurrency').value = ticker.currency || 'USD';
    document.getElementById('editTickerStatus').value = convertTickerStatusToHebrew(ticker.status);
    document.getElementById('editTickerSector').value = ticker.sector || '';
    document.getElementById('editTickerIndustry').value = ticker.industry || '';
    document.getElementById('editTickerNotes').value = ticker.notes || '';
}

/**
 * איסוף נתונים ממודל עריכת טיקר
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני הטיקר
 * 
 * @example
 * const tickerData = collectTickerEditData();
 */
function collectTickerEditData() {
    const tickerData = {
        symbol: document.getElementById('editTickerSymbol').value.trim(),
        name: document.getElementById('editTickerName').value.trim(),
        currency: document.getElementById('editTickerCurrency').value,
        status: convertTickerStatus(document.getElementById('editTickerStatus').value),
        sector: document.getElementById('editTickerSector').value.trim(),
        industry: document.getElementById('editTickerIndustry').value.trim(),
        notes: document.getElementById('editTickerNotes').value.trim()
    };

    console.log('📝 נתונים שנאספו ממודל עריכת טיקר:', tickerData);
    return tickerData;
}

/**
 * איסוף נתונים ממודל הוספת טיקר
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני הטיקר החדש
 * 
 * @example
 * const tickerData = collectTickerAddData();
 */
function collectTickerAddData() {
    const tickerData = {
        symbol: document.getElementById('tickerSymbol').value.trim(),
        name: document.getElementById('tickerName').value.trim(),
        currency: document.getElementById('tickerCurrency').value,
        status: convertTickerStatus(document.getElementById('tickerStatus').value),
        sector: document.getElementById('tickerSector').value.trim(),
        industry: document.getElementById('tickerIndustry').value.trim(),
        notes: document.getElementById('tickerNotes').value.trim()
    };

    console.log('📝 נתונים שנאספו ממודל הוספת טיקר:', tickerData);
    return tickerData;
}

/**
 * יצירת טיקר חדש
 * הפונקציה שולחת בקשה לשרת ליצירת טיקר חדש
 * 
 * @param {Object} tickerData - נתוני הטיקר החדש
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await createTicker(tickerData);
 */
async function createTicker(tickerData) {
    try {
        console.log('🚀 יוצר טיקר חדש:', tickerData);

        const response = await apiCall('/api/v1/tickers/', {
            method: 'POST',
            body: JSON.stringify(tickerData)
        });

        console.log('✅ טיקר נוצר בהצלחה:', response);
        showNotification('טיקר נוצר בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה ביצירת טיקר:', error);
        showNotification('שגיאה ביצירת טיקר: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * עדכון טיקר קיים
 * הפונקציה שולחת בקשה לשרת לעדכון טיקר קיים
 * 
 * @param {number} tickerId - מזהה הטיקר
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await updateTicker(1);
 */
async function updateTicker(tickerId) {
    try {
        const tickerData = collectTickerEditData();
        console.log(`🔄 מעדכן טיקר ${tickerId}:`, tickerData);

        const response = await apiCall(`/api/v1/tickers/${tickerId}`, {
            method: 'PUT',
            body: JSON.stringify(tickerData)
        });

        console.log('✅ טיקר עודכן בהצלחה:', response);
        showNotification('טיקר עודכן בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בעדכון טיקר:', error);
        showNotification('שגיאה בעדכון טיקר: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * מחיקת טיקר
 * הפונקציה שולחת בקשה לשרת למחיקת טיקר
 * 
 * @param {number} tickerId - מזהה הטיקר
 * @param {string} tickerName - שם הטיקר
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await deleteTicker(1, 'AAPL');
 */
async function deleteTicker(tickerId, tickerName) {
    try {
        console.log(`🔍 בודק פריטים מקושרים לטיקר ${tickerId}: ${tickerName}...`);

        // בדיקת פריטים מקושרים
        const linkedItemsResponse = await apiCall(`/api/v1/tickers/${tickerId}/linked-items`);
        const linkedItems = linkedItemsResponse.data;

        if (linkedItems.has_linked_items) {
            console.log(`⚠️ נמצאו פריטים מקושרים לטיקר ${tickerName}`);
            await showLinkedItemsWarning(tickerName, linkedItems);
            return null; // מניעת המחיקה
        }

        // אישור מחיקה
        const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את הטיקר "${tickerName}"?\n\nפעולה זו לא ניתנת לביטול.`);
        if (!confirmed) {
            console.log('❌ מחיקת טיקר בוטלה על ידי המשתמש');
            return null;
        }

        console.log(`🗑️ מוחק טיקר ${tickerId}: ${tickerName}`);
        const response = await apiCall(`/api/v1/tickers/${tickerId}`, {
            method: 'DELETE'
        });

        console.log('✅ טיקר נמחק בהצלחה:', response);
        if (typeof window.showNotification === 'function') {
            window.showNotification(`טיקר "${tickerName}" נמחק בהצלחה!`, 'success');
        } else {
            alert(`טיקר "${tickerName}" נמחק בהצלחה!`);
        }

        // רענון הטבלה
        if (typeof loadTickers === 'function') {
            await loadTickers();
        } else if (typeof loadTickersData === 'function') {
            await loadTickersData();
        }

        return response;
    } catch (error) {
        console.error('❌ שגיאה במחיקת טיקר:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה במחיקת טיקר: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        } else {
            alert('שגיאה במחיקת טיקר: ' + (error.message || 'שגיאה לא ידועה'));
        }
        throw error;
    }
}

/**
 * ביטול טיקר (שינוי סטטוס למבוטל)
 * הפונקציה שולחת בקשה לשרת לביטול טיקר
 * 
 * @param {number} tickerId - מזהה הטיקר
 * @param {string} tickerName - שם הטיקר
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await cancelTicker(1, 'AAPL');
 */
async function cancelTicker(tickerId, tickerName) {
    try {
        console.log(`🔍 בודק פריטים מקושרים לטיקר ${tickerId}: ${tickerName}...`);

        // בדיקת פריטים מקושרים
        const linkedItemsResponse = await apiCall(`/api/v1/tickers/${tickerId}/linked-items`);
        const linkedItems = linkedItemsResponse.data;

        if (linkedItems.has_linked_items) {
            console.log(`⚠️ נמצאו פריטים מקושרים לטיקר ${tickerName}`);
            await showLinkedItemsWarning(tickerName, linkedItems);
            return null; // מניעת הביטול
        }

        // אישור ביטול
        const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את הטיקר "${tickerName}"?\n\nהסטטוס ישתנה ל"מבוטל".`);
        if (!confirmed) {
            console.log('❌ ביטול טיקר בוטל על ידי המשתמש');
            return null;
        }

        console.log(`🚫 מבטל טיקר ${tickerId}: ${tickerName}`);
        const response = await apiCall(`/api/v1/tickers/${tickerId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'מבוטל' })
        });

        console.log('✅ טיקר בוטל בהצלחה:', response);
        if (typeof window.showNotification === 'function') {
            window.showNotification(`טיקר "${tickerName}" בוטל בהצלחה!`, 'success');
        } else {
            alert(`טיקר "${tickerName}" בוטל בהצלחה!`);
        }

        // רענון הטבלה
        if (typeof loadTickers === 'function') {
            await loadTickers();
        } else if (typeof loadTickersData === 'function') {
            await loadTickersData();
        }

        return response;
    } catch (error) {
        console.error('❌ שגיאה בביטול טיקר:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה בביטול טיקר: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        } else {
            alert('שגיאה בביטול טיקר: ' + (error.message || 'שגיאה לא ידועה'));
        }
        throw error;
    }
}

/**
 * הצגת מודל הוספת טיקר
 * הפונקציה מציגה את המודל להוספת טיקר חדש
 * 
 * @example
 * showAddTickerModal();
 */
function showAddTickerModal() {
    console.log('📝 מציג מודל הוספת טיקר');

    // ניקוי הטופס
    document.getElementById('tickerSymbol').value = '';
    document.getElementById('tickerName').value = '';
    document.getElementById('tickerCurrency').value = 'USD';
    document.getElementById('tickerStatus').value = 'פתוח';
    document.getElementById('tickerSector').value = '';
    document.getElementById('tickerIndustry').value = '';
    document.getElementById('tickerNotes').value = '';

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addTickerModal'));
    modal.show();
}

/**
 * הצגת מודל עריכת טיקר
 * הפונקציה מציגה את המודל לעריכת טיקר קיים
 * 
 * @param {Object} ticker - נתוני הטיקר
 * 
 * @example
 * showEditTickerModal(tickerData);
 */
function showEditTickerModal(ticker) {
    console.log('✏️ מציג מודל עריכת טיקר:', ticker);

    // מילוי הנתונים
    fillTickerEditModal(ticker);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editTickerModal'));
    modal.show();
}

/**
 * שמירת טיקר חדש
 * 
 * פונקציה זו שומרת טיקר חדש במערכת. כוללת:
 * - ולידציה של הנתונים
 * - בדיקת כפילות סימבול
 * - שליחה לשרת
 * - רענון הטבלה
 * - הצגת הודעות למשתמש
 * 
 * @async
 * @returns {Promise<void>}
 * 
 * @example
 * // קריאה מהטופס
 * await saveTicker();
 * 
 * @throws {Error} אם הנתונים לא תקינים
 * @throws {Error} אם הסימבול כבר קיים
 * @throws {Error} אם יש שגיאה בתקשורת עם השרת
 */
async function saveTicker() {
    try {
        const tickerData = collectTickerAddData();

        // ולידציה של הנתונים
        const validation = validateTickerData(tickerData);
        if (!validation.isValid) {
            showNotification(`שגיאות ולידציה: ${validation.errors.join(', ')}`, 'error');
            return;
        }

        // הצגת אזהרות אם יש
        if (validation.warnings.length > 0) {
            console.warn('אזהרות ולידציה:', validation.warnings);
        }

        // בדיקה שהסימבול לא קיים
        const existingTickers = await loadTickersData();
        if (checkSymbolExists(tickerData.symbol, existingTickers)) {
            showNotification(`סימבול ${tickerData.symbol.toUpperCase()} כבר קיים במערכת`, 'error');
            return;
        }

        await createTicker(tickerData);

        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTickerModal'));
        modal.hide();

        // רענון הטבלה
        await refreshTickersTable();

        showNotification('טיקר נוסף בהצלחה!', 'success');

    } catch (error) {
        console.error('❌ שגיאה בשמירת טיקר:', error);
        showNotification(`שגיאה בשמירת טיקר: ${error.message}`, 'error');
    }
}

/**
 * עדכון טיקר מהמודל
 * 
 * פונקציה זו מעדכנת טיקר קיים במערכת. כוללת:
 * - ולידציה של הנתונים
 * - בדיקת כפילות סימבול (אם השתנה)
 * - שליחה לשרת
 * - רענון הטבלה
 * - הצגת הודעות למשתמש
 * 
 * @async
 * @returns {Promise<void>}
 * 
 * @example
 * // קריאה מהטופס עריכה
 * await updateTickerFromModal();
 * 
 * @throws {Error} אם הנתונים לא תקינים
 * @throws {Error} אם הסימבול כבר קיים (אם השתנה)
 * @throws {Error} אם יש שגיאה בתקשורת עם השרת
 * @throws {Error} אם הטיקר לא נמצא
 */
async function updateTickerFromModal() {
    try {
        const tickerId = document.getElementById('editTickerId').value;
        const tickerData = collectTickerEditData();

        // ולידציה של הנתונים
        const validation = validateTickerData(tickerData);
        if (!validation.isValid) {
            showNotification(`שגיאות ולידציה: ${validation.errors.join(', ')}`, 'error');
            return;
        }

        // הצגת אזהרות אם יש
        if (validation.warnings.length > 0) {
            console.warn('אזהרות ולידציה:', validation.warnings);
        }

        // בדיקה שהסימבול לא קיים (אם השתנה)
        const existingTickers = await loadTickersData();
        if (checkSymbolExists(tickerData.symbol, existingTickers, parseInt(tickerId))) {
            showNotification(`סימבול ${tickerData.symbol.toUpperCase()} כבר קיים במערכת`, 'error');
            return;
        }

        await updateTicker(tickerId);

        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTickerModal'));
        modal.hide();

        // רענון הטבלה
        await refreshTickersTable();

        showNotification('טיקר עודכן בהצלחה!', 'success');

    } catch (error) {
        console.error('❌ שגיאה בעדכון טיקר:', error);
        showNotification(`שגיאה בעדכון טיקר: ${error.message}`, 'error');
    }
}

/**
 * עדכון טבלת טיקרים בדף database.html
 * הפונקציה מעדכנת את הטבלה עם נתוני הטיקרים
 * 
 * @param {Array} tickers - מערך של טיקרים
 * 
 * @example
 * updateTickersTable(tickers);
 */
function updateTickersTable(tickers) {
    console.log('🔄 מעדכן טבלת טיקרים עם', tickers.length, 'טיקרים');

    const tbody = document.querySelector('#tickersTable tbody');
    if (!tbody) {
        console.error('❌ לא נמצא tbody לטבלת טיקרים');
        return;
    }

    tbody.innerHTML = tickers.map(ticker => `
        <tr>
            <td>${ticker.id}</td>
            <td>${ticker.symbol || '-'}</td>
            <td>${ticker.name || '-'}</td>
            <td>${ticker.sector || '-'}</td>
            <td>${ticker.industry || '-'}</td>
            <td>${ticker.currency || '-'}</td>
            <td>${window.convertTickerStatusToHebrew(ticker.status)}</td>
            <td>${ticker.notes || '-'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="showEditTickerModal(${JSON.stringify(ticker).replace(/"/g, '&quot;')})" title="ערוך">✏️</button>
                <button class="btn btn-sm btn-secondary" onclick="cancelTicker(${ticker.id}, '${ticker.name || ticker.symbol}')" title="ביטול">X</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTicker(${ticker.id}, '${ticker.name || ticker.symbol}')" title="מחק">🗑️</button>
            </td>
        </tr>
    `).join('');

    // עדכון ספירת רשומות
    const countElement = document.getElementById('tickersCount');
    if (countElement) {
        countElement.textContent = `${tickers.length} טיקרים`;
    }

    // הצגת הטבלה אם היא מוסתרת
    const section = document.getElementById('tickersSection');
    const container = document.getElementById('tickersContainer');
    const footer = document.querySelector('#tickersSection .table-footer');
    const icon = document.querySelector('#tickersSection .filter-icon');

    if (section && section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        if (container) container.style.display = 'block';
        if (footer) footer.style.display = 'block';
        if (icon) icon.textContent = '▲';
        localStorage.setItem('tickersSectionOpen', 'true');
    }

    console.log('✅ טבלת טיקרים עודכנה בהצלחה');
}

/**
 * רענון טבלת טיקרים
 * הפונקציה מרעננת את טבלת הטיקרים עם נתונים עדכניים
 * 
 * @example
 * await refreshTickersTable();
 */
async function refreshTickersTable() {
    try {
        console.log('🔄 מרענן טבלת טיקרים...');
        const tickers = await loadTickersData();

        // עדכון הטבלה (תלוי בדף)
        if (typeof updateTickersTable === 'function') {
            updateTickersTable(tickers);
        }

        // עדכון סטטיסטיקות (תלוי בדף)
        if (typeof updateTickersStats === 'function') {
            const stats = calculateTickersStats(tickers);
            updateTickersStats(stats);
        }

        console.log('✅ טבלת טיקרים רועננה בהצלחה');
    } catch (error) {
        console.error('❌ שגיאה ברענון טבלת טיקרים:', error);
    }
}

/**
 * הצגת הודעה למשתמש
 * הפונקציה מציגה הודעה למשתמש
 * 
 * @param {string} message - תוכן ההודעה
 * @param {string} type - סוג ההודעה (success/error/warning/info)
 * 
 * @example
 * showNotification('הטיקר נשמר בהצלחה!', 'success');
 */
function showNotification(message, type = 'info') {
    // בדיקה אם יש פונקציה גלובלית
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }

    // הצגה פשוטה
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
}

/**
 * הצגת אזהרה על פריטים מקושרים לטיקר
 * מציג מודל מפורט עם כל הפריטים המקושרים לטיקר
 * 
 * @param {string} tickerName - שם הטיקר
 * @param {Object} linkedItems - אובייקט עם הפריטים המקושרים
 */
async function showLinkedItemsWarning(tickerName, linkedItems) {
    console.log('⚠️ מציג אזהרה על פריטים מקושרים:', linkedItems);

    // הצגת המודל - נשתמש ב-alert פשוט במקום Bootstrap Modal
    const message = `לא ניתן למחוק את הטיקר "${tickerName}" - יש פריטים מקושרים:\n\n` +
        `טריידים פתוחים: ${linkedItems.open_trades.length}\n` +
        `תכנונים פתוחים: ${linkedItems.open_trade_plans.length}\n` +
        `הערות: ${linkedItems.notes.length}\n` +
        `התראות: ${linkedItems.alerts.length}`;

    // הצגת פרטים נוספים
    const details = `פרטי הפריטים המקושרים:\n\n` +
        `טריידים פתוחים:\n${linkedItems.open_trades.map(t => `- ${t.ticker_symbol} (ID: ${t.id})`).join('\n')}\n\n` +
        `תכנונים פתוחים:\n${linkedItems.open_trade_plans.map(p => `- ${p.ticker.symbol} (ID: ${p.id})`).join('\n')}\n\n` +
        `הערות:\n${linkedItems.notes.map(n => `- ${n.content.substring(0, 50)}...`).join('\n')}\n\n` +
        `התראות:\n${linkedItems.alerts.map(a => `- ${a.message}`).join('\n')}`;

    alert(message + '\n\n' + details);
    console.log('✅ אזהרת פריטים מקושרים הוצגה בהצלחה');
}

/**
 * הצגת אזהרה על טריידים פתוחים לטיקר
 * מציג מודל מפורט עם כל הטריידים המקושרים לטיקר
 * 
 * @param {string} tickerName - שם הטיקר
 * @param {Array} openTrades - מערך של טריידים פתוחים
 * @param {string} actionType - סוג הפעולה (delete/cancel)
 */
async function showOpenTradesWarning(tickerName, openTrades, actionType) {
    console.log(`⚠️ מציג אזהרה על טריידים פתוחים לטיקר ${tickerName}:`, openTrades);

    let modalContent = `
        <div class="modal-header">
            <h5 class="modal-title">⚠️ לא ניתן לבטל טיקר</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <div class="alert alert-warning">
                <strong>לא ניתן לבטל את הטיקר "${tickerName}"</strong><br>
                קיימים טריידים פתוחים לטיקר זה:
            </div>
            
            <div class="open-trades-details">
    `;

    if (openTrades.length > 0) {
        modalContent += `
            <div class="open-trades-section mb-3">
                <h6 class="text-danger">📈 טריידים פתוחים (${openTrades.length})</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>מזהה</th>
                                <th>חשבון</th>
                                <th>צד</th>
                                <th>סטטוס</th>
                                <th>סוג</th>
                                <th>תאריך יצירה</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        openTrades.forEach(trade => {
            modalContent += `
                <tr>
                    <td>${trade.id}</td>
                    <td>${trade.account_name || `Account ${trade.account_id}`}</td>
                    <td>${trade.side || 'לא מוגדר'}</td>
                    <td><span class="badge bg-warning">${trade.status || 'פתוח'}</span></td>
                    <td>${trade.type || 'לא מוגדר'}</td>
                    <td>${trade.created_at || 'לא מוגדר'}</td>
                </tr>
            `;
        });

        modalContent += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    modalContent += `
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
        </div>
    `;

    const modalId = 'openTradesModal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', modalId + 'Label');
        modal.setAttribute('aria-hidden', 'true');
        document.body.appendChild(modal);
    }

    modal.innerHTML = modalContent;

    // הצגה פשוטה עם alert
    const message = `לא ניתן לבטל את הטיקר "${tickerName}" - יש טריידים פתוחים:\n\n` +
        `טריידים פתוחים: ${openTrades.length}`;

    // הצגת פרטי הטריידים הפתוחים
    const details = `פרטי הטריידים הפתוחים:\n\n` +
        `${openTrades.map(trade => `- ${trade.ticker_symbol} (ID: ${trade.id}) - ${trade.status}`).join('\n')}`;

    alert(message + '\n\n' + details);
    console.log('✅ אזהרת טריידים פתוחים הוצגה בהצלחה');
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====

// פונקציות עיקריות
window.loadTickersData = loadTickersData;
window.calculateTickersStats = calculateTickersStats;
window.convertTickerStatus = convertTickerStatus;
window.convertTickerStatusToHebrew = convertTickerStatusToHebrew;
window.fillTickerEditModal = fillTickerEditModal;
window.collectTickerEditData = collectTickerEditData;
window.collectTickerAddData = collectTickerAddData;
window.createTicker = createTicker;
window.updateTicker = updateTicker;
window.deleteTicker = deleteTicker;
window.cancelTicker = cancelTicker;

// פונקציות UI
window.showAddTickerModal = showAddTickerModal;
window.showEditTickerModal = showEditTickerModal;
window.saveTicker = saveTicker;
window.updateTickerFromModal = updateTickerFromModal;
window.updateTickersTable = updateTickersTable;
window.refreshTickersTable = refreshTickersTable;
window.showLinkedItemsWarning = showLinkedItemsWarning;
window.showOpenTradesWarning = showOpenTradesWarning;

// פונקציות ולידציה
window.validateTickerData = validateTickerData;
window.checkSymbolExists = checkSymbolExists;

// פונקציה ספציפית למחיקת טיקרים - מחליפה את deleteRecord הכללית
window.deleteTickerRecord = function (recordId) {
    console.log(`מחיקת ticker עם מזהה ${recordId}`);

    // נצטרך את שם הטיקר - נקבל אותו מהטבלה
    const row = document.querySelector(`tr[data-id="${recordId}"]`);
    let tickerName = `Ticker ${recordId}`;

    if (row) {
        // נחפש את הסימבול בטבלה
        const symbolCell = row.querySelector('td:nth-child(2)'); // עמודת הסימבול
        if (symbolCell) {
            tickerName = symbolCell.textContent.trim();
        }
    }

    // קריאה לפונקציה הספציפית של tickers
    window.deleteTicker(recordId, tickerName);

    // רענון הטבלה אחרי ניסיון המחיקה
    setTimeout(() => {
        if (typeof window.loadTickers === 'function') {
            window.loadTickers();
        }
    }, 1000);
};

// פונקציה ספציפית לעריכת טיקרים
window.editTickerRecord = function (recordId) {
    console.log(`עריכת ticker עם מזהה ${recordId}`);

    // קריאה לפונקציה הספציפית של tickers
    if (typeof window.showEditTickerModal === 'function') {
        // נצטרך את נתוני הטיקר - נקבל אותם מהטבלה או מהשרת
        window.showEditTickerModal(recordId);
    } else {
        alert('פונקציית עריכת טיקר לא זמינה');
    }
};

// פונקציה ספציפית לביטול טיקרים
window.cancelTickerRecord = function (recordId) {
    console.log(`ביטול ticker עם מזהה ${recordId}`);

    // נצטרך את שם הטיקר - נקבל אותו מהטבלה
    const row = document.querySelector(`tr[data-id="${recordId}"]`);
    let tickerName = `Ticker ${recordId}`;

    if (row) {
        // נחפש את הסימבול בטבלה
        const symbolCell = row.querySelector('td:nth-child(2)'); // עמודת הסימבול
        if (symbolCell) {
            tickerName = symbolCell.textContent.trim();
        }
    }

    // קריאה לפונקציה הספציפית של tickers
    window.cancelTicker(recordId, tickerName);
};

console.log('✅ קובץ tickers.js נטען בהצלחה - פונקציות זמינות גלובלית');
