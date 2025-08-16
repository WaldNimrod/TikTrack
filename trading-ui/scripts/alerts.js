// ===== ALERTS MANAGEMENT =====
// קובץ ייעודי לניהול התראות - משותף לכל הדפים

/**
 * טעינת התראות מהשרת
 * הפונקציה טוענת את כל ההתראות ומחזירה אותן
 * 
 * @returns {Promise<Array>} מערך של התראות
 * 
 * @example
 * const alerts = await loadAlertsData();
 */
async function loadAlertsData() {
    try {
        console.log('🔄 טוען התראות...');
        const response = await apiCall('/api/v1/alerts/');
        const alerts = response.data || response;
        console.log(`✅ נטענו ${alerts.length} התראות`);
        return alerts;
    } catch (error) {
        console.error('❌ שגיאה בטעינת התראות:', error);
        throw error;
    }
}

/**
 * חישוב סטטיסטיקות מנתוני ההתראות
 * הפונקציה מחשבת סטטיסטיקות כלליות מנתוני ההתראות
 * 
 * @param {Array} alerts - מערך של התראות
 * @returns {Object} אובייקט עם הסטטיסטיקות
 * 
 * @example
 * const stats = calculateAlertsStats(alerts);
 */
function calculateAlertsStats(alerts) {
    const activeAlerts = alerts.filter(alert => alert.status === 'פתוח').length;
    const totalAlerts = alerts.length;
    const triggeredAlerts = alerts.filter(alert => alert.triggered_at).length;
    const priceAlerts = alerts.filter(alert => alert.type === 'price').length;
    
    return {
        active_alerts: activeAlerts,
        total_alerts: totalAlerts,
        triggered_alerts: triggeredAlerts,
        price_alerts: priceAlerts
    };
}

/**
 * המרת סטטוס התראה מ-עברית לאנגלית
 * הפונקציה ממירה ערכים בעברית לערכים שהשרת מצפה להם
 * 
 * @param {string} statusDisplay - סטטוס בעברית
 * @returns {string} סטטוס באנגלית
 * 
 * @example
 * const status = convertAlertStatus('פתוח'); // returns 'active'
 */
function convertAlertStatus(statusDisplay) {
    return statusDisplay || 'פתוח';
}

/**
 * המרת סטטוס התראה מאנגלית לעברית
 * הפונקציה ממירה ערכים מהשרת לערכים לתצוגה בעברית
 * 
 * @param {string} status - סטטוס באנגלית
 * @returns {string} סטטוס בעברית
 * 
 * @example
 * const statusDisplay = convertAlertStatusToHebrew('active'); // returns 'פתוח'
 */
function convertAlertStatusToHebrew(status) {
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
 * מילוי נתונים במודל עריכת התראה
 * הפונקציה ממלאת את כל השדות במודל העריכה עם נתוני ההתראה
 * 
 * @param {Object} alert - נתוני ההתראה
 * 
 * @example
 * fillAlertEditModal(alertData);
 */
function fillAlertEditModal(alert) {
    console.log(`🔧 מילוי מודל עריכת התראה עם נתונים:`, alert);
    
    // מילוי שדות הטופס
    document.getElementById('editAlertId').value = alert.id;
    document.getElementById('editAlertAccountId').value = alert.account_id || '';
    document.getElementById('editAlertTickerId').value = alert.ticker_id || '';
    document.getElementById('editAlertType').value = alert.type || '';
    document.getElementById('editAlertCondition').value = alert.condition || '';
    document.getElementById('editAlertMessage').value = alert.message || '';
    document.getElementById('editAlertStatus').value = convertAlertStatusToHebrew(alert.status);
}

/**
 * איסוף נתונים ממודל עריכת התראה
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני ההתראה
 * 
 * @example
 * const alertData = collectAlertEditData();
 */
function collectAlertEditData() {
    const alertData = {
        account_id: document.getElementById('editAlertAccountId').value ? parseInt(document.getElementById('editAlertAccountId').value) : null,
        ticker_id: document.getElementById('editAlertTickerId').value ? parseInt(document.getElementById('editAlertTickerId').value) : null,
        type: document.getElementById('editAlertType').value.trim(),
        condition: document.getElementById('editAlertCondition').value.trim(),
        message: document.getElementById('editAlertMessage').value.trim(),
        status: convertAlertStatus(document.getElementById('editAlertStatus').value)
    };
    
    console.log('📝 נתונים שנאספו ממודל עריכת התראה:', alertData);
    return alertData;
}

/**
 * איסוף נתונים ממודל הוספת התראה
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני ההתראה החדשה
 * 
 * @example
 * const alertData = collectAlertAddData();
 */
function collectAlertAddData() {
    const alertData = {
        account_id: document.getElementById('alertAccountId').value ? parseInt(document.getElementById('alertAccountId').value) : null,
        ticker_id: document.getElementById('alertTickerId').value ? parseInt(document.getElementById('alertTickerId').value) : null,
        type: document.getElementById('alertType').value.trim(),
        condition: document.getElementById('alertCondition').value.trim(),
        message: document.getElementById('alertMessage').value.trim(),
        status: convertAlertStatus(document.getElementById('alertStatus').value)
    };
    
    console.log('📝 נתונים שנאספו ממודל הוספת התראה:', alertData);
    return alertData;
}

/**
 * יצירת התראה חדשה
 * הפונקציה שולחת בקשה לשרת ליצירת התראה חדשה
 * 
 * @param {Object} alertData - נתוני ההתראה החדשה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await createAlert(alertData);
 */
async function createAlert(alertData) {
    try {
        console.log('🚀 יוצר התראה חדשה:', alertData);
        
        const response = await apiCall('/api/v1/alerts/', {
            method: 'POST',
            body: JSON.stringify(alertData)
        });
        
        console.log('✅ התראה נוצרה בהצלחה:', response);
        showNotification('התראה נוצרה בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה ביצירת התראה:', error);
        showNotification('שגיאה ביצירת התראה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * עדכון התראה קיימת
 * הפונקציה שולחת בקשה לשרת לעדכון התראה קיימת
 * 
 * @param {number} alertId - מזהה ההתראה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await updateAlert(1);
 */
async function updateAlert(alertId) {
    try {
        const alertData = collectAlertEditData();
        console.log(`🔄 מעדכן התראה ${alertId}:`, alertData);
        
        const response = await apiCall(`/api/v1/alerts/${alertId}`, {
            method: 'PUT',
            body: JSON.stringify(alertData)
        });
        
        console.log('✅ התראה עודכנה בהצלחה:', response);
        showNotification('התראה עודכנה בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בעדכון התראה:', error);
        showNotification('שגיאה בעדכון התראה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * מחיקת התראה
 * הפונקציה שולחת בקשה לשרת למחיקת התראה
 * 
 * @param {number} alertId - מזהה ההתראה
 * @param {string} alertType - סוג ההתראה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await deleteAlert(1, 'price');
 */
async function deleteAlert(alertId, alertType) {
    try {
        // אישור מחיקה
        const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את ההתראה "${alertType}"?\n\nפעולה זו לא ניתנת לביטול.`);
        if (!confirmed) {
            console.log('❌ מחיקת התראה בוטלה על ידי המשתמש');
            return null;
        }
        
        console.log(`🗑️ מוחק התראה ${alertId}: ${alertType}`);
        const response = await apiCall(`/api/v1/alerts/${alertId}`, {
            method: 'DELETE'
        });
        
        console.log('✅ התראה נמחקה בהצלחה:', response);
        showNotification(`התראה "${alertType}" נמחקה בהצלחה!`, 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה במחיקת התראה:', error);
        showNotification('שגיאה במחיקת התראה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * ביטול התראה (שינוי סטטוס למבוטל)
 * הפונקציה שולחת בקשה לשרת לביטול התראה
 * 
 * @param {number} alertId - מזהה ההתראה
 * @param {string} alertType - סוג ההתראה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await cancelAlert(1, 'price');
 */
async function cancelAlert(alertId, alertType) {
    try {
        // אישור ביטול
        const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את ההתראה "${alertType}"?\n\nהסטטוס ישתנה ל"מבוטל".`);
        if (!confirmed) {
            console.log('❌ ביטול התראה בוטל על ידי המשתמש');
            return null;
        }
        
        console.log(`🚫 מבטל התראה ${alertId}: ${alertType}`);
        const response = await apiCall(`/api/v1/alerts/${alertId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'מבוטל' })
        });
        
        console.log('✅ התראה בוטלה בהצלחה:', response);
        showNotification(`התראה "${alertType}" בוטלה בהצלחה!`, 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בביטול התראה:', error);
        showNotification('שגיאה בביטול התראה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * הצגת מודל הוספת התראה
 * הפונקציה מציגה את המודל להוספת התראה חדשה
 * 
 * @example
 * showAddAlertModal();
 */
function showAddAlertModal() {
    console.log('📝 מציג מודל הוספת התראה');
    
    // ניקוי הטופס
    document.getElementById('alertAccountId').value = '';
    document.getElementById('alertTickerId').value = '';
    document.getElementById('alertType').value = '';
    document.getElementById('alertCondition').value = '';
    document.getElementById('alertMessage').value = '';
    document.getElementById('alertStatus').value = 'פתוח';
    
    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addAlertModal'));
    modal.show();
}

/**
 * הצגת מודל עריכת התראה
 * הפונקציה מציגה את המודל לעריכת התראה קיימת
 * 
 * @param {Object} alert - נתוני ההתראה
 * 
 * @example
 * showEditAlertModal(alertData);
 */
function showEditAlertModal(alert) {
    console.log('✏️ מציג מודל עריכת התראה:', alert);
    
    // מילוי הנתונים
    fillAlertEditModal(alert);
    
    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editAlertModal'));
    modal.show();
}

/**
 * שמירת התראה חדשה
 * הפונקציה שומרת התראה חדשה ומרעננת את הטבלה
 * 
 * @example
 * saveAlert();
 */
async function saveAlert() {
    try {
        const alertData = collectAlertAddData();
        
        // בדיקות תקינות
        if (!alertData.type) {
            showNotification('סוג ההתראה הוא שדה חובה', 'error');
            return;
        }
        
        if (!alertData.condition) {
            showNotification('תנאי ההתראה הוא שדה חובה', 'error');
            return;
        }
        
        await createAlert(alertData);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('addAlertModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshAlertsTable();
        
    } catch (error) {
        console.error('❌ שגיאה בשמירת התראה:', error);
    }
}

/**
 * עדכון התראה מהמודל
 * הפונקציה מעדכנת התראה קיימת ומרעננת את הטבלה
 * 
 * @example
 * updateAlertFromModal();
 */
async function updateAlertFromModal() {
    try {
        const alertId = document.getElementById('editAlertId').value;
        const alertData = collectAlertEditData();
        
        // בדיקות תקינות
        if (!alertData.type) {
            showNotification('סוג ההתראה הוא שדה חובה', 'error');
            return;
        }
        
        if (!alertData.condition) {
            showNotification('תנאי ההתראה הוא שדה חובה', 'error');
            return;
        }
        
        await updateAlert(alertId);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editAlertModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshAlertsTable();
        
    } catch (error) {
        console.error('❌ שגיאה בעדכון התראה:', error);
    }
}

/**
 * רענון טבלת התראות
 * הפונקציה מרעננת את טבלת ההתראות עם נתונים עדכניים
 * 
 * @example
 * await refreshAlertsTable();
 */
async function refreshAlertsTable() {
    try {
        console.log('🔄 מרענן טבלת התראות...');
        const alerts = await loadAlertsData();
        
        // עדכון הטבלה (תלוי בדף)
        if (typeof updateAlertsTable === 'function') {
            updateAlertsTable(alerts);
        }
        
        // עדכון סטטיסטיקות (תלוי בדף)
        if (typeof updateAlertsStats === 'function') {
            const stats = calculateAlertsStats(alerts);
            updateAlertsStats(stats);
        }
        
        console.log('✅ טבלת התראות רועננה בהצלחה');
    } catch (error) {
        console.error('❌ שגיאה ברענון טבלת התראות:', error);
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
 * showNotification('ההתראה נשמרה בהצלחה!', 'success');
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
window.loadAlertsData = loadAlertsData;
window.calculateAlertsStats = calculateAlertsStats;
window.convertAlertStatus = convertAlertStatus;
window.convertAlertStatusToHebrew = convertAlertStatusToHebrew;
window.fillAlertEditModal = fillAlertEditModal;
window.collectAlertEditData = collectAlertEditData;
window.collectAlertAddData = collectAlertAddData;
window.createAlert = createAlert;
window.updateAlert = updateAlert;
window.deleteAlert = deleteAlert;
window.cancelAlert = cancelAlert;

// פונקציות UI
window.showAddAlertModal = showAddAlertModal;
window.showEditAlertModal = showEditAlertModal;
window.saveAlert = saveAlert;
window.updateAlertFromModal = updateAlertFromModal;
window.refreshAlertsTable = refreshAlertsTable;
window.showNotification = showNotification;

console.log('✅ קובץ alerts.js נטען בהצלחה - פונקציות זמינות גלובלית');
