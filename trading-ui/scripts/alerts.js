/* ===== מערכת התראות ===== */
/*
 * קובץ זה מכיל את כל הפונקציות הקשורות להתראות
 * כולל טעינת התראות, הצגת כרטיסיות וניהול סטטוס
 * 
 * תכולת הקובץ:
 * - loadAlertsForCards: טעינת התראות לכרטיסיות
 * - createAlertCardHTML: יצירת HTML לכרטיסיית התראה
 * - markAlertAsRead: סימון התראה כנקראה
 * - refreshAlerts: רענון התראות
 * 
 * שימוש: נטען בדפים שצריכים הצגת התראות
 * תלויות: fetch API, DOM manipulation
 */

// משתנים גלובליים להתראות
window.alertsData = [];
window.alertsLoaded = false;

// ===== ALERTS MANAGEMENT =====
// קובץ ייעודי לניהול התראות - משותף לכל הדפים

console.log('🚀 alerts.js file loaded successfully!');

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
 * המרת סטטוס is_triggered לעברית
 * הפונקציה ממירה ערכים מהשרת לערכים לתצוגה בעברית
 * 
 * @param {string} isTriggered - סטטוס is_triggered
 * @returns {string} סטטוס בעברית
 * 
 * @example
 * const triggeredDisplay = convertIsTriggeredToHebrew('new'); // returns 'חדש'
 */
function convertIsTriggeredToHebrew(isTriggered) {
    if (isTriggered === 'false') {
        return 'לא הופעל';
    } else if (isTriggered === 'new') {
        return 'חדש';
    } else if (isTriggered === 'true') {
        return 'נקרא';
    }
    return isTriggered || 'לא הופעל';
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
    document.getElementById('editAlertIsTriggered').value = alert.is_triggered || 'false';
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
        status: convertAlertStatus(document.getElementById('editAlertStatus').value),
        is_triggered: document.getElementById('editAlertIsTriggered').value
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
        status: convertAlertStatus(document.getElementById('alertStatus').value),
        is_triggered: document.getElementById('alertIsTriggered').value || 'false'
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
 * סימון התראה כמופעלת (new)
 * הפונקציה שולחת בקשה לשרת לסימון התראה כמופעלת
 * 
 * @param {number} alertId - מזהה ההתראה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await markAlertAsTriggered(1);
 */
async function markAlertAsTriggered(alertId) {
    try {
        console.log(`🔔 מסמן התראה ${alertId} כמופעלת`);
        const response = await apiCall(`/api/v1/alerts/${alertId}/trigger`, {
            method: 'POST'
        });
        
        console.log('✅ התראה סומנה כמופעלת:', response);
        showNotification('התראה סומנה כמופעלת!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בסימון התראה כמופעלת:', error);
        showNotification('שגיאה בסימון התראה כמופעלת: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * סימון התראה כנקראה (true)
 * הפונקציה שולחת בקשה לשרת לסימון התראה כנקראה
 * 
 * @param {number} alertId - מזהה ההתראה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await markAlertAsRead(1);
 */
async function markAlertAsRead(alertId) {
    try {
        console.log(`📖 מסמן התראה ${alertId} כנקראה`);
        const response = await apiCall(`/api/v1/alerts/${alertId}/read`, {
            method: 'POST'
        });
        
        console.log('✅ התראה סומנה כנקראה:', response);
        showNotification('התראה סומנה כנקראה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בסימון התראה כנקראה:', error);
        showNotification('שגיאה בסימון התראה כנקראה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
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
 * עדכון טבלת התראות בדף database.html
 * הפונקציה מעדכנת את הטבלה עם נתוני ההתראות
 * 
 * @param {Array} alerts - מערך של התראות
 * 
 * @example
 * updateAlertsTable(alerts);
 */
function updateAlertsTable(alerts) {
    console.log('🔄 מעדכן טבלת התראות עם', alerts.length, 'התראות');
    
    const tbody = document.querySelector('#alertsTable tbody');
    if (!tbody) {
        console.error('❌ לא נמצא tbody לטבלת התראות');
        return;
    }
    
    tbody.innerHTML = alerts.map(alert => `
        <tr>
            <td>${alert.id}</td>
            <td>${alert.account_id || '-'}</td>
            <td>${alert.ticker_id || '-'}</td>
            <td>${alert.type || '-'}</td>
            <td>${alert.condition || '-'}</td>
            <td>${alert.message || '-'}</td>
            <td>${convertAlertStatusToHebrew(alert.status)}</td>
            <td>${convertIsTriggeredToHebrew(alert.is_triggered)}</td>
            <td>${alert.triggered_at ? window.formatDateTime(alert.triggered_at) : '-'}</td>
            <td>
                            <button class="btn btn-sm btn-secondary" onclick="showEditAlertModal(${JSON.stringify(alert).replace(/"/g, '&quot;')})" title="ערוך">✏️</button>
            <button class="btn btn-sm btn-secondary" onclick="cancelAlert(${alert.id}, '${alert.type}')" title="ביטול">❌</button>
            <button class="btn btn-sm btn-danger" onclick="deleteAlert(${alert.id}, '${alert.type}')" title="מחק">🗑️</button>
                <button class="btn btn-sm btn-info" onclick="markAlertAsTriggered(${alert.id})" title="סמן כמופעלת">🔔</button>
                <button class="btn btn-sm btn-success" onclick="markAlertAsRead(${alert.id})" title="סמן כנקראה">📖</button>
            </td>
        </tr>
    `).join('');
    
    // עדכון ספירת רשומות
    const countElement = document.getElementById('alertsCount');
    if (countElement) {
        countElement.textContent = `${alerts.length} התראות`;
    }
    
    // הצגת הטבלה אם היא מוסתרת
    const section = document.getElementById('alertsSection');
    const container = document.getElementById('alertsContainer');
    const footer = document.querySelector('#alertsSection .table-footer');
    const icon = document.querySelector('#alertsSection .filter-icon');
    
    if (section && section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        if (container) container.style.display = 'block';
        if (footer) footer.style.display = 'block';
        if (icon) icon.textContent = '▲';
        localStorage.setItem('alertsSectionOpen', 'true');
    }
    
    console.log('✅ טבלת התראות עודכנה בהצלחה');
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
window.convertIsTriggeredToHebrew = convertIsTriggeredToHebrew;
window.fillAlertEditModal = fillAlertEditModal;
window.collectAlertEditData = collectAlertEditData;
window.collectAlertAddData = collectAlertAddData;
window.createAlert = createAlert;
window.updateAlert = updateAlert;
window.deleteAlert = deleteAlert;
window.cancelAlert = cancelAlert;
window.markAlertAsTriggered = markAlertAsTriggered;
window.markAlertAsRead = markAlertAsRead;

// פונקציות UI
window.showAddAlertModal = showAddAlertModal;
window.showEditAlertModal = showEditAlertModal;
window.saveAlert = saveAlert;
window.updateAlertFromModal = updateAlertFromModal;
window.updateAlertsTable = updateAlertsTable;
window.refreshAlertsTable = refreshAlertsTable;
window.showNotification = showNotification;

console.log('✅ קובץ alerts.js נטען בהצלחה - פונקציות זמינות גלובלית');

// ===== מערכת כרטיסיות התראות =====
// פונקציות ייעודיות לכרטיסיות ההתראות בדף designs.html

// משתנים גלובליים לכרטיסיות
let alertsCardsData = [];
let newAlertsCount = 0;

// פונקציה לטעינת התראות לכרטיסיות
async function loadAlertsForCards() {
  console.log('🔄 === Loading alerts for cards ===');
  console.log('🔄 Function called from:', new Error().stack);
  
  try {
    const token = localStorage.getItem('authToken');
    console.log('🔄 Token found:', !!token);
    
    if (!token) {
      console.log('🔄 No auth token found, using sample alerts');
      loadSampleAlertsForCards();
      return;
    }
    
    console.log('🔄 Fetching alerts from server...');
    const response = await fetch('http://127.0.0.1:8080/api/v1/alerts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔄 Response status:', response.status);
    
    if (response.ok) {
      const alerts = await response.json();
      console.log('🔄 Raw response from server:', alerts);
      
      // בדיקה אם התגובה היא מערך או אובייקט עם data
      alertsCardsData = Array.isArray(alerts) ? alerts : (alerts.data || []);
      console.log('🔄 Alerts loaded from server:', alertsCardsData.length, 'alerts');
      console.log('🔄 Sample alert data:', alertsCardsData[0]);
      
      if (alertsCardsData.length === 0) {
        console.log('🔄 No alerts found in server response, using sample data');
        loadSampleAlertsForCards();
      } else {
        filterAndDisplayNewAlerts();
      }
    } else {
      console.log('🔄 Error loading alerts from server, status:', response.status);
      loadSampleAlertsForCards();
    }
    
  } catch (error) {
    console.log('🔄 Error loading alerts from server:', error);
    loadSampleAlertsForCards();
  }
}

// פונקציה לטעינת התראות דוגמה לכרטיסיות
function loadSampleAlertsForCards() {
  console.log('🔄 Loading sample alerts for cards');
  
  // יצירת התראות דוגמה עם מצבים שונים - רק 2 חדשות כמו בקוד הידני
  const alertsCardsData = [
    {
      id: 1,
      title: 'התראה על מחיר נכס',
      message: 'מחיר AAPL הגיע ליעד המחיר שהוגדר',
      ticker: 'AAPL',
      current_price: 185.50,
      target_price: 185.00,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // לפני 30 דקות
      is_triggered: 'new',
      alert_type: 'price_target'
    },
    {
      id: 2,
      title: 'התראה על נפח מסחר',
      message: 'נפח המסחר ב-TSLA עלה ב-50% מהממוצע היומי',
      ticker: 'TSLA',
      volume: 15000000,
      avg_volume: 10000000,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // לפני שעתיים
      is_triggered: 'new',
      alert_type: 'volume_spike'
    }
  ];
  
  console.log('🔄 Sample alerts data created:', alertsCardsData);
  
  // עדכון מונה ההתראות
  newAlertsCount = alertsCardsData.length;
  updateAlertsCount();
  
  // הצגת הכרטיסיות עם העיצוב המלא
  const cardsContainer = document.getElementById('alertsCards');
  if (cardsContainer) {
    console.log('🔄 Found alertsCards container, rendering sample alerts...');
    const cardsHTML = alertsCardsData.map(alert => createAlertCardHTML(alert)).join('');
    cardsContainer.innerHTML = cardsHTML;
    console.log('🔄 Sample cards rendered successfully!');
  } else {
    console.log('🔄 alertsCards container NOT found!');
  }
}

// פונקציה לסינון והצגת התראות חדשות בלבד
function filterAndDisplayNewAlerts() {
  console.log('🔄 Filtering new alerts...');
  console.log('🔄 Total alerts in data:', alertsCardsData.length);
  
  if (alertsCardsData.length === 0) {
    console.log('🔄 No alerts data available');
    newAlertsCount = 0;
    updateAlertsCount();
    renderAlertsCards([]);
    return;
  }
  
  // לוג של כל ההתראות עם הסטטוס שלהן
  alertsCardsData.forEach((alert, index) => {
    console.log(`🔄 Alert ${index + 1}: ID=${alert.id}, is_triggered="${alert.is_triggered}"`);
  });
  
  const newAlerts = alertsCardsData.filter(alert => alert.is_triggered === 'new');
  newAlertsCount = newAlerts.length;
  
  console.log('🔄 Found', newAlertsCount, 'new alerts');
  console.log('🔄 New alerts:', newAlerts);
  
  updateAlertsCount();
  renderAlertsCards(newAlerts);
}

// פונקציה לעדכון מונה ההתראות
function updateAlertsCount() {
  const countElement = document.getElementById('newAlertsCount');
  if (countElement) {
    countElement.textContent = `${newAlertsCount} התראות`;
  }
}

// פונקציה לרנדור כרטיסיות ההתראות
function renderAlertsCards(alerts) {
  console.log('🔄 Rendering alerts cards...');
  
  const cardsContainer = document.getElementById('alertsCards');
  if (!cardsContainer) {
    console.log('🔄 Alerts cards container not found');
    return;
  }
  
  if (alerts.length === 0) {
    cardsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 3rem; margin-bottom: 20px;">🔕</div>
        <h4>אין התראות חדשות</h4>
        <p>כל ההתראות נקראו או שאין התראות פעילות כרגע</p>
      </div>
    `;
    return;
  }
  
  const cardsHTML = alerts.map(alert => createAlertCardHTML(alert)).join('');
  cardsContainer.innerHTML = cardsHTML;
  
  console.log('🔄 Rendered', alerts.length, 'alert cards');
}

// פונקציה ליצירת HTML של כרטיסיית התראה
function createAlertCardHTML(alert) {
  const timeAgo = getTimeAgo(alert.created_at);
  const alertIcon = getAlertIcon(alert.type || alert.alert_type);
  
  // יצירת כותרת עם סימבול
  let title = '';
  let tickerSymbol = '';
  
  if (alert.title) {
    // נתוני דמה - יש title ו-ticker
    title = alert.title;
    tickerSymbol = alert.ticker || '';
  } else {
    // נתונים מהשרת - יש type ו-condition
    title = alert.condition || 'התראה';
    tickerSymbol = extractTickerFromCondition(alert.condition) || '';
  }
  
  return `
    <div class="alert-card" data-alert-id="${alert.id}">
      <div class="alert-card-header">
        <h4 class="alert-card-title">${alertIcon} ${tickerSymbol || 'התראה'}</h4>
        <span class="alert-card-time">${timeAgo}</span>
      </div>
      
      <div class="alert-card-content">
        <p class="alert-card-message"><strong>${title}</strong></p>
        <p class="alert-card-message">${alert.message || alert.condition || ''}</p>
        
        <div class="alert-card-details">
          ${getAlertDetails(alert)}
          <span class="alert-detail-item">$${getCurrentPrice(tickerSymbol)}</span>
          <span class="alert-detail-item ${getDailyChangeClass(tickerSymbol)}">${getDailyChange(tickerSymbol)}%</span>
        </div>
      </div>
      
      <div class="alert-card-footer" style="display: flex; justify-content: flex-end;">
        <button class="btn-mark-read" onclick="markAlertAsRead(${alert.id})" data-alert-id="${alert.id}">
          ✓ קראתי
        </button>
      </div>
    </div>
  `;
}

// פונקציה לחילוץ סימבול מהתנאי
function extractTickerFromCondition(condition) {
  if (!condition) return '';
  
  // חיפוש סימבולים נפוצים בתנאי
  const tickerPatterns = [
    /\b(AAPL|TSLA|MSFT|GOOGL|NVDA|AMZN|META|NFLX|SPY|QQQ|IWM)\b/gi,
    /\b([A-Z]{2,5})\b/g
  ];
  
  for (const pattern of tickerPatterns) {
    const match = condition.match(pattern);
    if (match) {
      return match[0].toUpperCase();
    }
  }
  
  return '';
}

// פונקציות לנתוני דמה של מחירים
function getCurrentPrice(ticker) {
  const prices = {
    'AAPL': '185.50',
    'TSLA': '245.30',
    'MSFT': '415.80',
    'GOOGL': '141.20',
    'NVDA': '875.40',
    'AMZN': '149.80',
    'META': '485.60',
    'NFLX': '625.90',
    'SPY': '485.20',
    'QQQ': '425.80',
    'IWM': '195.40'
  };
  return prices[ticker] || '0.00';
}

function getDailyChange(ticker) {
  const changes = {
    'AAPL': '+2.3',
    'TSLA': '-1.8',
    'MSFT': '+0.9',
    'GOOGL': '+1.2',
    'NVDA': '+3.5',
    'AMZN': '-0.7',
    'META': '+1.8',
    'NFLX': '+2.1',
    'SPY': '+0.5',
    'QQQ': '+0.8',
    'IWM': '-0.3'
  };
  return changes[ticker] || '0.0';
}

function getDailyChangeClass(ticker) {
  const change = getDailyChange(ticker);
  if (change.startsWith('+')) {
    return 'positive-change';
  } else if (change.startsWith('-')) {
    return 'negative-change';
  }
  return '';
}

// פונקציה לקבלת אייקון לפי סוג ההתראה
function getAlertIcon(alertType) {
  const icons = {
    'price_target': '🎯',
    'volume_spike': '📊',
    'price_movement': '📈',
    'support_resistance': '⚖️',
    'profit_target': '💰',
    'stop_loss': '⚠️'
  };
  
  return icons[alertType] || '🔔';
}

// פונקציה לקבלת פרטי התראה
function getAlertDetails(alert) {
  let details = '';
  
  switch (alert.alert_type) {
    case 'price_target':
      details = `
        <span class="alert-detail-item">יעד: $${alert.target_price}</span>
        <span class="alert-detail-item">נוכחי: $${alert.current_price}</span>
      `;
      break;
    case 'volume_spike':
      details = `
        <span class="alert-detail-item">נפח: ${formatNumber(alert.volume)}</span>
        <span class="alert-detail-item">ממוצע: ${formatNumber(alert.avg_volume)}</span>
      `;
      break;
    case 'price_movement':
      details = `
        <span class="alert-detail-item">שינוי: ${alert.price_change}%</span>
      `;
      break;
    case 'support_resistance':
      details = `
        <span class="alert-detail-item">תמיכה: $${alert.support_level}</span>
        <span class="alert-detail-item">נוכחי: $${alert.current_price}</span>
      `;
      break;
    case 'profit_target':
      details = `
        <span class="alert-detail-item">יעד: ${alert.profit_target}%</span>
        <span class="alert-detail-item">נוכחי: ${alert.current_profit}%</span>
      `;
      break;
    case 'stop_loss':
      details = `
        <span class="alert-detail-item">סטופ: $${alert.stop_loss}</span>
        <span class="alert-detail-item">נוכחי: $${alert.current_price}</span>
      `;
      break;
  }
  
  return details;
}

// פונקציה לסמן התראה כנקראה
async function markAlertAsRead(alertId) {
  console.log('🔄 Marking alert as read:', alertId);
  
  const button = document.querySelector(`button[data-alert-id="${alertId}"]`);
  if (button) {
    button.disabled = true;
    button.textContent = '✓ נקרא';
  }
  
  try {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // עדכון בשרת - שימוש ב-endpoint ייעודי לסימון כנקרא
      const response = await fetch(`http://127.0.0.1:8080/api/v1/alerts/${alertId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('🔄 Alert marked as read on server');
      } else {
        console.log('🔄 Error updating alert on server');
      }
    }
    
    // עדכון מקומי
    const alertIndex = alertsCardsData.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
      alertsCardsData[alertIndex].is_triggered = true;
    }
    
    // הסתרת הכרטיסיה
    const card = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (card) {
      card.style.opacity = '0.5';
      card.style.transform = 'scale(0.98)';
      
      setTimeout(() => {
        card.remove();
        newAlertsCount--;
        updateAlertsCount();
        
        // אם אין יותר התראות, הצג הודעה
        if (newAlertsCount === 0) {
          renderAlertsCards([]);
        }
      }, 300);
    }
    
  } catch (error) {
    console.log('🔄 Error marking alert as read:', error);
    
    // החזרת הכפתור למצב רגיל במקרה של שגיאה
    if (button) {
      button.disabled = false;
      button.textContent = '✓ קראתי';
    }
  }
}

// פונקציה לחישוב זמן שעבר
function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  
  return date.toLocaleDateString('he-IL');
}

// פונקציה לעיצוב מספרים
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// פונקציה לרענון ההתראות
function refreshAlerts() {
  console.log('🔄 Refreshing alerts...');
  loadAlertsForCards();
}

// ייצוא הפונקציות החדשות לשימוש גלובלי
window.loadAlertsForCards = loadAlertsForCards;
window.loadSampleAlertsForCards = loadSampleAlertsForCards;
window.markAlertAsRead = markAlertAsRead;
window.refreshAlerts = refreshAlerts;

console.log('✅ פונקציות כרטיסיות התראות נוספו לקובץ alerts.js');

// בדיקה שהפונקציות זמינות
console.log('🔄 Testing function availability:');
console.log('🔄 loadAlertsForCards available:', typeof loadAlertsForCards);
console.log('🔄 loadSampleAlertsForCards available:', typeof loadSampleAlertsForCards);
console.log('🔄 markAlertAsRead available:', typeof markAlertAsRead);
console.log('🔄 refreshAlerts available:', typeof refreshAlerts);
