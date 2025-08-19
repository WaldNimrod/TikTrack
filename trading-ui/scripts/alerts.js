/**
 * ========================================
 * דף ההתראות - Alerts Page
 * ========================================
 * 
 * קובץ ייעודי לדף ההתראות (alerts.html)
 * מכיל את כל הפונקציות הספציפיות לדף זה
 * 
 * פונקציות עיקריות:
 * - loadAlertsData() - טעינת נתוני התראות
 * - updateAlertsTable() - עדכון טבלת ההתראות
 * - markAlertAsRead() - סימון התראה כנקראה
 * - פונקציות מיון וסטטיסטיקות
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// משתנים גלובליים לדף ההתראות
let alertsData = [];

/**
 * פונקציה לטעינת נתוני התראות מהשרת
 */
async function loadAlertsData() {
    try {
    console.log('🔄 טוען התראות מהשרת...');
    
    // קריאה מה-API
    const response = await fetch('/api/v1/alerts/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let apiData = await response.json();
    
    // בדיקה שהנתונים בפורמט הנכון
    if (apiData && apiData.data && Array.isArray(apiData.data)) {
      apiData = apiData.data;
    }
    
    console.log('📡 נתונים מה-API:', apiData);
    console.log('📡 סוג הנתונים:', typeof apiData);
    console.log('📡 האם זה מערך:', Array.isArray(apiData));
    console.log('📡 אורך הנתונים:', apiData ? apiData.length : 'null');
    
    // עדכון הנתונים המקומיים
    alertsData = apiData.map(alert => ({
      id: alert.id,
      title: alert.title,
      message: alert.message,
      type: alert.type,
      status: alert.status,
      created_at: alert.created_at,
      read_at: alert.read_at,
      related_type: alert.related_type,
      related_id: alert.related_id
    }));
    
    console.log('📊 נתונים מעודכנים:', alertsData);
    console.log('📊 אורך alertsData:', alertsData.length);
    console.log('📊 דוגמה להתראה ראשונה:', alertsData[0]);
    
    // קבלת פילטרים שמורים
    const selectedStatuses = window.selectedStatusesForFilter || [];
    const selectedTypes = window.selectedTypesForFilter || [];
    const selectedDateRange = window.selectedDateRangeForFilter || null;
    const searchTerm = window.searchTermForFilter || '';
    
    console.log('🔄 פילטרים שמורים:', {
      selectedStatuses,
      selectedTypes,
      selectedDateRange,
      searchTerm
    });
    
    // שימוש בפונקציה המותאמת לפילטור
    filterAlertsData(selectedStatuses, selectedTypes, selectedDateRange, searchTerm);
    
    } catch (error) {
    console.error('Error loading alerts data:', error);
    document.querySelector('#alertsTable tbody').innerHTML = '<tr><td colspan="6" class="text-center text-danger">שגיאה בטעינת נתונים</td></tr>';
    }
}

/**
 * פונקציה לפילטור נתוני התראות
 */
function filterAlertsData(selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === FILTER ALERTS DATA ===');
  console.log('🔄 Selected statuses:', selectedStatuses);
  console.log('🔄 Selected types:', selectedTypes);
  console.log('🔄 Date range:', selectedDateRange);
  console.log('🔄 Search term:', searchTerm);
  
  console.log('🔄 Original alertsData length:', alertsData.length);
  console.log('🔄 Original alertsData:', alertsData);
  let filteredAlerts = [...alertsData];
  
  // פילטר לפי סטטוס
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
    console.log('🔄 Filtering by status:', selectedStatuses);
    filteredAlerts = filteredAlerts.filter(alert => {
      const statusDisplay = alert.status === 'read' ? 'נקראה' : 'לא נקראה';
      console.log(`🔄 Alert ${alert.id}: status=${alert.status}, display=${statusDisplay}, selected=${selectedStatuses}, match=${selectedStatuses.includes(statusDisplay)}`);
      return selectedStatuses.includes(statusDisplay);
    });
    console.log('🔄 After status filter:', filteredAlerts.length, 'alerts');
  }
  
  // פילטר לפי סוג
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    console.log('🔄 Filtering by type:', selectedTypes);
    filteredAlerts = filteredAlerts.filter(alert => {
      // המרת סוגים מאנגלית לעברית
      let typeDisplay;
      switch(alert.type) {
        case 'info':
          typeDisplay = 'מידע';
          break;
        case 'warning':
          typeDisplay = 'אזהרה';
          break;
        case 'error':
          typeDisplay = 'שגיאה';
          break;
        case 'success':
          typeDisplay = 'הצלחה';
          break;
        default:
          typeDisplay = alert.type;
      }
      
      // בדיקה אם הסוג הנבחר מתאים
      const isMatch = selectedTypes.includes(typeDisplay);
      console.log(`🔄 Alert ${alert.id}: type=${alert.type}, display=${typeDisplay}, selected=${selectedTypes}, match=${isMatch}`);
      return isMatch;
    });
    console.log('🔄 After type filter:', filteredAlerts.length, 'alerts');
  }
  
  // פילטר לפי חיפוש
  if (searchTerm && searchTerm.trim() !== '') {
    const searchLower = searchTerm.toLowerCase();
    filteredAlerts = filteredAlerts.filter(alert => {
      return (
        (alert.title && alert.title.toLowerCase().includes(searchLower)) ||
        (alert.message && alert.message.toLowerCase().includes(searchLower)) ||
        (alert.type && alert.type.toLowerCase().includes(searchLower))
      );
    });
    console.log('🔄 After search filter:', filteredAlerts.length, 'alerts');
  }
  
  // עדכון הטבלה
  console.log('🔄 === UPDATING TABLE ===');
  console.log('🔄 Filtered alerts count:', filteredAlerts.length);
  console.log('🔄 First filtered alert:', filteredAlerts[0]);
  updateAlertsTable(filteredAlerts);
}

/**
 * פונקציה לעדכון טבלת ההתראות
 */
function updateAlertsTable(alerts) {
  console.log('🔄 === UPDATE ALERTS TABLE ===');
  console.log('🔄 Alerts to display:', alerts.length);
  console.log('🔄 First alert:', alerts[0]);
  
  const tbody = document.querySelector('.main-content table tbody');
  if (!tbody) {
    console.error('Table body not found');
    return;
  }
  
  const tableHTML = alerts.map(alert => {
    const statusDisplay = alert.status === 'read' ? 'נקראה' : 'לא נקראה';
    const typeDisplay = getTypeDisplay(alert.type);
    const createdAt = alert.created_at ? new Date(alert.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
    
    return `
    <tr class="${alert.status === 'unread' ? 'unread-alert' : ''}">
      <td><strong>#${alert.id}</strong></td>
      <td><span class="alert-type-${alert.type}">${typeDisplay}</span></td>
      <td><strong>${alert.title || '-'}</strong></td>
      <td>${alert.message || '-'}</td>
      <td><span class="status-badge status-${alert.status}">${statusDisplay}</span></td>
      <td>${createdAt}</td>
      <td class="actions-cell">
        ${alert.status === 'unread' ? 
          `<button class="btn btn-sm btn-success" onclick="markAlertAsRead('${alert.id}')" title="סמן כנקראה">✓</button>` : 
          ''
        }
        <button class="btn btn-sm btn-danger" onclick="deleteAlert('${alert.id}')" title="מחק">✕</button>
      </td>
    </tr>
  `;
  }).join('');
  
  tbody.innerHTML = tableHTML;
  
  // עדכון ספירת רשומות
  const countElement = document.querySelector('.main-content .table-count');
  if (countElement) {
    countElement.textContent = `${alerts.length} התראות`;
  }
  
  // עדכון סטטיסטיקות הטבלה
  window.updateTableStats('alerts');
}

/**
 * פונקציה לתרגום סוג לעברית
 */
function getTypeDisplay(type) {
  const typeMap = {
    'info': 'מידע',
    'warning': 'אזהרה',
    'error': 'שגיאה',
    'success': 'הצלחה'
  };
  return typeMap[type] || type;
}

/**
 * פונקציה לסימון התראה כנקראה
 */
async function markAlertAsRead(alertId) {
    try {
    console.log('🔄 מסמן התראה כנקראה:', alertId);
    
    const response = await fetch(`/api/v1/alerts/${alertId}/mark-read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ התראה סומנה כנקראה:', result);
    
    // רענון הנתונים
    loadAlertsData();
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('ההתראה סומנה כנקראה', 'success');
    }
    
    } catch (error) {
    console.error('❌ שגיאה בסימון התראה כנקראה:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בסימון התראה כנקראה', 'error');
    }
    }
}

/**
 * פונקציה למחיקת התראה
 */
async function deleteAlert(alertId) {
  try {
    console.log('🗑️ מוחק התראה:', alertId);
    
    // אישור מחיקה
    if (!confirm('האם אתה בטוח שברצונך למחוק התראה זו?')) {
        return;
    }
    
    const response = await fetch(`/api/v1/alerts/${alertId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ התראה נמחקה:', result);
    
    // רענון הנתונים
    loadAlertsData();
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('ההתראה נמחקה בהצלחה', 'success');
    }

    } catch (error) {
    console.error('❌ שגיאה במחיקת התראה:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה במחיקת התראה', 'error');
    }
    }
}

/**
 * פונקציה לסימון כל ההתראות כנקראו
 */
async function markAllAlertsAsRead() {
  try {
    console.log('🔄 מסמן את כל ההתראות כנקראו');
    
    const response = await fetch('/api/v1/alerts/mark-all-read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ כל ההתראות סומנו כנקראו:', result);
    
    // רענון הנתונים
    loadAlertsData();
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('כל ההתראות סומנו כנקראו', 'success');
    }
    
  } catch (error) {
    console.error('❌ שגיאה בסימון כל ההתראות כנקראו:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בסימון כל ההתראות כנקראו', 'error');
    }
  }
}

/**
 * פונקציה למחיקת כל ההתראות
 */
async function deleteAllAlerts() {
  try {
    console.log('🗑️ מוחק את כל ההתראות');
    
    // אישור מחיקה
    if (!confirm('האם אתה בטוח שברצונך למחוק את כל ההתראות? פעולה זו אינה הפיכה.')) {
      return;
    }
    
    const response = await fetch('/api/v1/alerts/', {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ כל ההתראות נמחקו:', result);
    
    // רענון הנתונים
    loadAlertsData();
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('כל ההתראות נמחקו בהצלחה', 'success');
    }
    
  } catch (error) {
    console.error('❌ שגיאה במחיקת כל ההתראות:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה במחיקת כל ההתראות', 'error');
    }
  }
}

// הוספת הפונקציות לגלובל
window.loadAlertsData = loadAlertsData;
window.updateAlertsTable = updateAlertsTable;
window.filterAlertsData = filterAlertsData;
window.markAlertAsRead = markAlertAsRead;
window.deleteAlert = deleteAlert;
window.markAllAlertsAsRead = markAllAlertsAsRead;
window.deleteAllAlerts = deleteAllAlerts;

// הגדרת הפונקציה updateGridFromComponent לדף ההתראות
window.updateGridFromComponent = function(selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === UPDATE GRID FROM COMPONENT (alerts) ===');
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

  // קריאה לפונקציה הגלובלית
  window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'alerts');
};


