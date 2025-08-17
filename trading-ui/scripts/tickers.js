// ===== TICKERS MANAGEMENT =====
// קובץ ייעודי לניהול טיקרים - משותף לכל הדפים

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
    const activeTickers = tickers.filter(ticker => ticker.status === 'פתוח').length;
    const totalTickers = tickers.length;
    const usdTickers = tickers.filter(ticker => ticker.currency === 'USD').length;
    const ilsTickers = tickers.filter(ticker => ticker.currency === 'ILS').length;
    
    return {
        active_tickers: activeTickers,
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
 * const status = convertTickerStatus('פתוח'); // returns 'active'
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
 * const statusDisplay = convertTickerStatusToHebrew('active'); // returns 'פתוח'
 */
function convertTickerStatusToHebrew(status) {
    if (status === 'active' || status === 'פעיל' || status === 'open') {
        return 'פתוח';
    } else if (status === 'inactive' || status === 'לא פעיל' || status === 'closed') {
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
        // בדיקה אם יש טריידים פתוחים לטיקר זה
        console.log(`🔍 בודק טריידים פתוחים לטיקר ${tickerId}...`);
        const tradesResponse = await apiCall(`/api/v1/trades/?ticker_id=${tickerId}&status=${encodeURIComponent('פתוח')}`);
        const openTrades = tradesResponse.data || tradesResponse || [];
        
        if (openTrades.length > 0) {
            console.log(`⚠️ נמצאו ${openTrades.length} טריידים פתוחים לטיקר ${tickerName}`);
            await showOpenTradesWarning(tickerName, openTrades, 'delete');
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
        showNotification(`טיקר "${tickerName}" נמחק בהצלחה!`, 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה במחיקת טיקר:', error);
        showNotification('שגיאה במחיקת טיקר: ' + (error.message || 'שגיאה לא ידועה'), 'error');
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
        // בדיקה אם יש טריידים פתוחים לטיקר זה
        console.log(`🔍 בודק טריידים פתוחים לטיקר ${tickerId}...`);
        const tradesResponse = await apiCall(`/api/v1/trades/?ticker_id=${tickerId}&status=${encodeURIComponent('פתוח')}`);
        const openTrades = tradesResponse.data || tradesResponse || [];
        
        if (openTrades.length > 0) {
            console.log(`⚠️ נמצאו ${openTrades.length} טריידים פתוחים לטיקר ${tickerName}`);
            await showOpenTradesWarning(tickerName, openTrades, 'cancel');
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
        showNotification(`טיקר "${tickerName}" בוטל בהצלחה!`, 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בביטול טיקר:', error);
        showNotification('שגיאה בביטול טיקר: ' + (error.message || 'שגיאה לא ידועה'), 'error');
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
 * הפונקציה שומרת טיקר חדש ומרעננת את הטבלה
 * 
 * @example
 * saveTicker();
 */
async function saveTicker() {
    try {
        const tickerData = collectTickerAddData();
        
        // בדיקות תקינות
        if (!tickerData.symbol) {
            showNotification('שם הסימבול הוא שדה חובה', 'error');
            return;
        }
        
        if (!tickerData.name) {
            showNotification('שם הטיקר הוא שדה חובה', 'error');
            return;
        }
        
        await createTicker(tickerData);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTickerModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshTickersTable();
        
    } catch (error) {
        console.error('❌ שגיאה בשמירת טיקר:', error);
    }
}

/**
 * עדכון טיקר מהמודל
 * הפונקציה מעדכנת טיקר קיים ומרעננת את הטבלה
 * 
 * @example
 * updateTickerFromModal();
 */
async function updateTickerFromModal() {
    try {
        const tickerId = document.getElementById('editTickerId').value;
        const tickerData = collectTickerEditData();
        
        // בדיקות תקינות
        if (!tickerData.symbol) {
            showNotification('שם הסימבול הוא שדה חובה', 'error');
            return;
        }
        
        if (!tickerData.name) {
            showNotification('שם הטיקר הוא שדה חובה', 'error');
            return;
        }
        
        await updateTicker(tickerId);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTickerModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshTickersTable();
        
    } catch (error) {
        console.error('❌ שגיאה בעדכון טיקר:', error);
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
                <button class="btn btn-sm btn-secondary" onclick="cancelTicker(${ticker.id}, '${ticker.name || ticker.symbol}')" title="ביטול">❌</button>
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
window.showNotification = showNotification;

console.log('✅ קובץ tickers.js נטען בהצלחה - פונקציות זמינות גלובלית');
