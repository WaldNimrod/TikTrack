// ===== MAIN.JS - קובץ כללי לכל האתר =====

/**
 * מערכת התראות גלובלית - CSS
 */
function addNotificationStyles() {
  if (document.getElementById('notificationStyles')) {
    return; // כבר קיים
  }

  const style = document.createElement('style');
  style.id = 'notificationStyles';
  style.textContent = `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      max-width: 400px;
    }

    .notification-container.modal-notification {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 999999;
      max-width: 350px;
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-bottom: 10px;
      padding: 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      border-left: 4px solid #007bff;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
    }

    .notification.show {
      transform: translateX(0);
      opacity: 1;
    }

    .notification.hide {
      transform: translateX(100%);
      opacity: 0;
    }

    .notification.success {
      border-left-color: #28a745;
    }

    .notification.error {
      border-left-color: #dc3545;
    }

    .notification.warning {
      border-left-color: #ffc107;
    }

    .notification.info {
      border-left-color: #17a2b8;
    }

    .notification-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
    }

    .notification-message {
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-close:hover {
      color: #333;
    }
  `;
  document.head.appendChild(style);
}

// הוספת CSS בטעינת הדף
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addNotificationStyles);
} else {
  addNotificationStyles();
}

/**
 * קובץ JavaScript ראשי לאתר TikTrack
 * 
 * קובץ זה מכיל את הפונקציונליות הבסיסית של האפליקציה
 * כולל אתחול, ניווט, פונקציות עזר כלליות ומערכת התראות
 * 
 * כללי חשובים:
 * 1. פונקציות שקשורות רק לישות אחת מישויות בסיס הנתונים נכתבת בקובץ ייעודי משלה
 * 2. פונקציות כלליות הקשורות לכל העמודים או הישויות נכתבות בקובץ הזה
 * 3. קובץ זה כולל את כל הפונקציונליות מ-grid-table.js ו-grid-data.js
 * 
 * תכולת הקובץ:
 * - מערכת התראות גלובלית (showNotification, showSuccessNotification, וכו')
 * - פונקציות API כלליות (apiCall)
 * - הגדרות עמודות גריד סטנדרטיות
 * - פונקציות עזר כלליות (formatCurrency, formatDate, וכו')
 * - ניהול מצב האפליקציה
 * - פונקציות אתחול גריד
 * 
 * היררכיה: נטען ראשון, מכיל פונקציות בסיסיות
 */

// ===== GRID CORE FUNCTIONS =====
// קובץ ייעודי ללוגיקת הגריד הבסיסית - משותף לכל הדפים

// משתנים גלובליים
let externalFilterPresent = false;

// ===== ייצוא מיידי של פונקציות גלובליות =====
// ייצוא הפונקציות הגלובליות מיד בתחילת הקובץ כדי לוודא שהן זמינות

// פונקציה לאתחול הגדרות תצוגה בדף הערות
window.resetNotesDisplaySettings = function () {
  console.log('🔄 === אתחול הגדרות תצוגה בדף הערות ===');

  // מחיקת הגדרות שמורות
  localStorage.removeItem('notesTopSectionHidden');
  localStorage.removeItem('notesMainSectionHidden');

  // איפוס תצוגת הסקשנים
  const topSection = document.getElementById('notesTopSection');
  const mainSection = document.getElementById('notesMainSection');

  if (topSection) {
    topSection.style.display = 'block';
    console.log('✅ אופס top section');
  }

  if (mainSection) {
    mainSection.style.display = 'block';
    console.log('✅ אופס main section');
  }

  // איפוס אייקונים
  const topIcon = document.querySelector('.top-section .filter-icon');
  const mainIcon = document.querySelector('.content-section .filter-icon');

  if (topIcon) {
    topIcon.textContent = '▲';
    console.log('✅ אופס top icon');
  }

  if (mainIcon) {
    mainIcon.textContent = '▲';
    console.log('✅ אופס main icon');
  }

  console.log('✅ אתחול הגדרות תצוגה הושלם');
};

// פונקציה לאיפוס אוטומטי של הגדרות תצוגה בדף הערות
window.autoResetNotesDisplay = function () {
  if (window.location.pathname.includes('/notes')) {
    console.log('🔄 === איפוס אוטומטי של הגדרות תצוגה בדף הערות ===');

    // בדיקה אם יש הגדרות שמורות שגויות
    const topHidden = localStorage.getItem('notesTopSectionHidden');
    const mainHidden = localStorage.getItem('notesMainSectionHidden');

    if (topHidden === 'true' || mainHidden === 'true') {
      console.log('⚠️ נמצאו הגדרות שגויות - מאתחל...');
      window.resetNotesDisplaySettings();
    }
  }
};

// הגדרת הפונקציות הגלובליות ישירות
window.toggleTopSection = function () {
  const currentPath = window.location.pathname;

  // טיפול מיוחד לדף הערות
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesTopSection');
    const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (section && toggleBtn) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';

      // עדכון האייקון בלבד
      if (icon) {
        icon.textContent = isHidden ? '▲' : '▼';
      }

      // שמירת המצב
      localStorage.setItem('notesTopSectionHidden', !isHidden);
    }
    return;
  }

  // טיפול רגיל לשאר הדפים
  const section = document.querySelector('.top-section .section-body');
  const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // קביעת מפתח localStorage לפי הדף הנוכחי
    let storageKey = 'topSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsTopSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'topSectionCollapsed';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem(storageKey, !isCollapsed);
  }
};

window.toggleMainSection = function () {
  const currentPath = window.location.pathname;

  // טיפול מיוחד לדף הערות
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesMainSection');
    const toggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (section && toggleBtn) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';

      // עדכון האייקון בלבד
      if (icon) {
        icon.textContent = isHidden ? '▲' : '▼';
      }

      // שמירת המצב
      localStorage.setItem('notesMainSectionHidden', !isHidden);
    }
    return;
  }

  // טיפול רגיל לשאר הדפים
  const section = document.querySelector('.content-section .section-body');
  const toggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // קביעת מפתח localStorage לפי הדף הנוכחי
    let storageKey = 'mainSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsMainSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningMainSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'mainSectionCollapsed';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem(storageKey, !isCollapsed);
  }
};

window.restoreAllSectionStates = function () {
  const currentPath = window.location.pathname;

  // טיפול מיוחד לדף הערות
  if (currentPath.includes('/notes')) {
    // שחזור סקשן עליון
    const topSectionHidden = localStorage.getItem('notesTopSectionHidden') === 'true';
    const topSection = document.getElementById('notesTopSection');
    const topButton = document.querySelector('[onclick*="toggleTopSection"]');

    if (topSection && topButton) {
      topSection.style.display = topSectionHidden ? 'none' : 'block';
      topButton.innerHTML = topSectionHidden ? '▶ הצג' : '▼ הסתר';
    }

    // שחזור סקשן ראשי
    const mainSectionHidden = localStorage.getItem('notesMainSectionHidden') === 'true';
    const mainSection = document.getElementById('notesMainSection');
    const mainButton = document.querySelector('[onclick*="toggleMainSection"]');

    if (mainSection && mainButton) {
      mainSection.style.display = mainSectionHidden ? 'none' : 'block';
      mainButton.innerHTML = mainSectionHidden ? '▶ הצג' : '▼ הסתר';
    }
    return;
  }

  // טיפול רגיל לשאר הדפים
  // שחזור מצב top section
  const topSection = document.querySelector('.top-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;

  if (topSection && topToggleBtn && topIcon) {
    let storageKey = 'topSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsTopSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'topSectionCollapsed';
    }

    const isCollapsed = localStorage.getItem(storageKey) === 'true';

    if (isCollapsed) {
      topSection.classList.add('collapsed');
      topSection.style.display = 'none';
      topIcon.textContent = '▼';
    } else {
      topSection.classList.remove('collapsed');
      topSection.style.display = 'block';
      topIcon.textContent = '▲';
    }
  }

  // שחזור מצב main section
  const mainSection = document.querySelector('.content-section .section-body');
  const mainToggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const mainIcon = mainToggleBtn ? mainToggleBtn.querySelector('.filter-icon') : null;

  if (mainSection && mainToggleBtn && mainIcon) {
    let storageKey = 'mainSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsMainSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningMainSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'mainSectionCollapsed';
    }

    const isCollapsed = localStorage.getItem(storageKey) === 'true';

    if (isCollapsed) {
      mainSection.classList.add('collapsed');
      mainSection.style.display = 'none';
      mainIcon.textContent = '▼';
    } else {
      mainSection.classList.remove('collapsed');
      mainSection.style.display = 'block';
      mainIcon.textContent = '▲';
    }
  }
};

// ===== מערכת התראות =====
/**
 * מערכת התראות גלובלית לאתר
 * 
 * מערכת זו מספקת הודעות משתמש יפות ומודרניות במקום alert() הסטנדרטי
 * ההתראות מוצגות בפינה הימנית העליונה של המסך ונעלמות אוטומטית
 * 
 * תכונות:
 * - 4 סוגי התראות: הצלחה, שגיאה, אזהרה, מידע
 * - אנימציות חלקות עם כניסה ויציאה
 * - זמן הצגה מותאם לכל סוג התראה
 * - כפתור סגירה ידני
 * - עיצוב מודרני עם blur effect
 * 
 * שימוש:
 * showSuccessNotification('כותרת', 'הודעה');
 * showErrorNotification('כותרת', 'הודעה');
 * showWarningNotification('כותרת', 'הודעה');
 * showInfoNotification('כותרת', 'הודעה');
 */

/**
 * פונקציה להצגת התראה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {string} type - סוג ההתראה (success, error, warning, info)
 * @param {number} duration - משך זמן בהצגה (במילישניות, ברירת מחדל: 4000)
 * @param {string} containerId - מזהה של container ספציפי (אופציונלי)
 * @param {boolean} isModal - האם ההתראה בתוך מודול (ברירת מחדל: false)
 */
function showNotification(title, message, type = 'info', duration = 4000, containerId = null, isModal = false) {
  // יצירת container אם לא קיים
  let container = document.getElementById('notificationContainer');

  if (containerId) {
    // אם יש container ספציפי, נשתמש בו
    container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = isModal ? 'notification-container modal-notification' : 'notification-container';

      // אם זה מודול, נוסיף את ה-container לתוך המודול
      if (isModal) {
        const modalId = containerId.replace('notificationContainer_', '');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.appendChild(container);
        } else {
          document.body.appendChild(container);
        }
      } else {
        document.body.appendChild(container);
      }
    }
  } else {
    // container גלובלי
    if (!container) {
      container = document.createElement('div');
      container.id = 'notificationContainer';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  notification.innerHTML = `
    <div class="notification-icon">${icons[type] || icons.info}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(notification);

  // אנימציית כניסה
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // הסרה אוטומטית
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }
}

/**
 * פונקציות עזר להתראות
 * 
 * פונקציות אלו מספקות ממשק נוח להצגת התראות מסוגים שונים
 * כל פונקציה מגדירה זמן הצגה מותאם לסוג ההתראה
 */

/**
 * הצגת התראת הצלחה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 4000ms)
 */
function showSuccessNotification(title, message, duration = 4000) {
  showNotification(title, message, 'success', duration);
}

/**
 * הצגת התראת שגיאה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 6000ms)
 */
function showErrorNotification(title, message, duration = 6000) {
  showNotification(title, message, 'error', duration);
}

/**
 * הצגת התראת אזהרה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 5000ms)
 */
function showWarningNotification(title, message, duration = 5000) {
  console.log('🔔 === SHOW WARNING NOTIFICATION ===');
  console.log('🔔 Title:', title);
  console.log('🔔 Message:', message);
  console.log('🔔 Duration:', duration);
  showNotification(title, message, 'warning', duration);
}

/**
 * פונקציות להתראות בתוך מודול
 * 
 * פונקציות אלו מאפשרות הצגת התראות בתוך מודול ספציפי
 * עם מיקום מותאם וזמן הצגה קצר יותר
 */

/**
 * הצגת התראה בתוך מודול
 * @param {string} modalId - מזהה המודול
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {string} type - סוג ההתראה (success, error, warning, info)
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 3000ms)
 */
function showModalNotification(modalId, title, message, type = 'info', duration = 3000) {
  const containerId = `notificationContainer_${modalId}`;
  showNotification(title, message, type, duration, containerId, true);
}

/**
 * הצגת התראת הצלחה בתוך מודול
 * @param {string} modalId - מזהה המודול
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 3000ms)
 */
function showModalSuccessNotification(modalId, title, message, duration = 3000) {
  showModalNotification(modalId, title, message, 'success', duration);
}

/**
 * הצגת התראת שגיאה בתוך מודול
 * @param {string} modalId - מזהה המודול
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 4000ms)
 */
function showModalErrorNotification(modalId, title, message, duration = 4000) {
  showModalNotification(modalId, title, message, 'error', duration);
}

/**
 * הצגת התראת אזהרה בתוך מודול
 * @param {string} modalId - מזהה המודול
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 3500ms)
 */
function showModalWarningNotification(modalId, title, message, duration = 3500) {
  showModalNotification(modalId, title, message, 'warning', duration);
}

/**
 * הצגת התראת מידע בתוך מודול
 * @param {string} modalId - מזהה המודול
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 3000ms)
 */
function showModalInfoNotification(modalId, title, message, duration = 3000) {
  showModalNotification(modalId, title, message, 'info', duration);
}

/**
 * הצגת התראת מידע
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 4000ms)
 */
function showInfoNotification(title, message, duration = 4000) {
  showNotification(title, message, 'info', duration);
}

/**
 * פונקציית API כללית
 * 
 * פונקציה זו מספקת ממשק אחיד לכל קריאות ה-API לאתר
 * כולל טיפול אוטומטי ב-headers, שגיאות ולוגים
 * 
 * @param {string} endpoint - נקודת הקצה של ה-API (למשל: '/api/v1/alerts/')
 * @param {Object} options - אפשרויות הבקשה (method, body, headers, וכו')
 * @returns {Promise<Object>} תגובת השרת
 * @throws {Error} שגיאה אם הבקשה נכשלה
 */
async function apiCall(endpoint, options = {}) {
  const baseUrl = 'http://127.0.0.1:8080';
  const url = `${baseUrl}${endpoint}`;

  // הגדרת headers
  let headers = {};

  // אם יש FormData, לא שולח Content-Type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // הוספת headers נוספים אם יש
  if (options.headers) {
    headers = { ...headers, ...options.headers };
  }

  const finalOptions = {
    ...options,
    headers
  };

  try {
    console.log('📡 שולח בקשה ל:', url);
    console.log('📋 סוג body:', options.body instanceof FormData ? 'FormData' : 'JSON');

    const response = await fetch(url, finalOptions);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ שגיאה בתגובה:', response.status, data);
      throw new Error(data.error?.message || data.message || `HTTP ${response.status}`);
    }

    console.log('✅ תגובה מוצלחת:', data);
    return data;
  } catch (error) {
    console.error(`❌ שגיאת API (${endpoint}):`, error);
    throw error;
  }
}

/**
 * הגדרת עמודות הגריד הסטנדרטיות
 * 
 * פונקציה זו מחזירה את הגדרות העמודות הבסיסיות לכל הטבלאות
 * כולל עמודות פעולות, סטטוס, ערכים נוכחיים וכו'
 * 
 * @returns {Array} מערך של הגדרות עמודות
 */
const getDefaultColumnDefs = () => [
  {
    headerName: "המרה",
    field: "action",
    width: 60,
    minWidth: 50,
    maxWidth: 80,
    cellRenderer: params => `<span style="cursor: pointer; font-size: 1.2rem;">${params.value}</span>`
  },
  {
    headerName: "סטטוס",
    field: "status",
    width: 80,
    minWidth: 70,
    maxWidth: 100,
    cellClass: params => `badge-status ${params.value}`,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual'],
      defaultOption: 'equals'
    }
  },
  {
    headerName: "נוכחי",
    field: "current",
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : ''
  },
  {
    headerName: "סטופ",
    field: "stop",
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : ''
  },
  {
    headerName: "יעד",
    field: "target",
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : ''
  },
  {
    headerName: "סכום/כמות",
    field: "amount",
    width: 140,
    minWidth: 120,
    maxWidth: 160
  },
  {
    headerName: "סוג",
    field: "type",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual'],
      defaultOption: 'equals'
    }
  },
  {
    headerName: "תאריך",
    field: "date",
    width: 120,
    minWidth: 100,
    maxWidth: 140,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'greaterThan', 'lessThan'],
      defaultOption: 'equals'
    }
  },
  {
    headerName: "טיקר",
    field: "ticker",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'contains'],
      defaultOption: 'contains'
    }
  }
];

// ===== GRID DATA MANAGEMENT =====
// קובץ ייעודי לניהול נתונים - משותף לכל הדפים

// נתוני דוגמה סטנדרטיים - ללא חשבונות ספציפיים
const getDefaultRowData = () => [
  { ticker: "AAPL", date: "2025-08-01", type: "סווינג", amount: "$25,000 (#100)", target: "$210 (12.3%)", stop: "$180 (-6.7%)", current: "$184.32 (+1.2%)", status: "פתוח", action: "⬅️", account: "" },
  { ticker: "TSLA", date: "2025-07-30", type: "השקעה", amount: "$20,000 (#100)", target: "$780 (10.1%)", stop: "$690 (-4.8%)", current: "$688.90 (-2.1%)", status: "סגור", action: "⬅️", account: "" },
  { ticker: "NVDA", date: "2025-07-28", type: "השקעה", amount: "$15,000 (#75)", target: "$540 (8.2%)", stop: "$480 (-4.5%)", current: "$503.20 (+0.5%)", status: "פתוח", action: "⬅️", account: "" },
  { ticker: "AMZN", date: "2025-07-27", type: "פאסיבי", amount: "$10,000 (#50)", target: "$140 (6.3%)", stop: "$126 (-3.1%)", current: "$129.00 (-1.0%)", status: "מבוטל", action: "⬅️", account: "" },
  { ticker: "GOOG", date: "2025-07-26", type: "השקעה", amount: "$20,000 (#60)", target: "$148 (9.0%)", stop: "$130 (-3.4%)", current: "$141.00 (+1.6%)", status: "פתוח", action: "⬅️", account: "" },
  { ticker: "MSFT", date: "2025-07-25", type: "סווינג", amount: "$18,000 (#90)", target: "$355 (11.2%)", stop: "$320 (-4.2%)", current: "$342.00 (+2.4%)", status: "סגור", action: "⬅️", account: "" }
];

// פונקציה לטעינת נתונים מהשרת
async function loadPlansFromServer() {
  try {
    console.log('Loading plans from server...');

    // כאן תהיה קריאה לשרת האמיתי
    // const response = await fetch('/api/plans');
    // const data = await response.json();

    // כרגע נחזיר נתוני דוגמה
    const data = getDefaultRowData();

    console.log('Plans loaded from server:', data.length, 'items');
    return data;
  } catch (error) {
    console.error('Error loading plans from server:', error);
    // במקרה של שגיאה, נחזיר נתוני דוגמה
    return getDefaultRowData();
  }
}

// פונקציה לחילוץ סכום מהשדה amount
function extractAmount(amountString) {
  if (!amountString) return 0;

  // מחפש מספר אחרי הסימן $ ולפני הסימן (
  const match = amountString.match(/\$([0-9,]+)/);
  if (match) {
    // מסיר פסיקים וממיר למספר
    return parseFloat(match[1].replace(/,/g, ''));
  }

  // אם לא מצאנו $, נחפש מספר רגיל
  const numberMatch = amountString.match(/[\d,]+/);
  if (numberMatch) {
    return parseInt(numberMatch[0].replace(/,/g, ''));
  }

  return 0;
}

// פונקציה לעדכון סטטיסטיקות
function updatePageSummaryStats(data = null) {
  console.log('=== updateSummaryStats called ===');
  console.log('Input data:', data);
  console.log('window.rowData:', window.rowData);
  console.log('window.gridApi exists:', !!window.gridApi);

  let statsData;

  // אם לא הועברו נתונים, השתמש בנתונים המוצגים בגריד (כמו בדף התכנונים)
  if (!data && window.gridApi) {
    const displayedRows = [];
    window.gridApi.forEachNodeAfterFilter(node => {
      displayedRows.push(node.data);
    });
    statsData = displayedRows;
    console.log('Using displayed rows from grid:', statsData);
  } else if (!data) {
    statsData = window.rowData || [];
    console.log('Using window.rowData:', statsData);
  } else {
    statsData = data;
    console.log('Using provided data:', statsData);
  }

  console.log('Stats data to process:', statsData);
  console.log('Stats data length:', statsData.length);

  if (statsData.length === 0) {
    console.log('No data to calculate statistics');
    // עדכון תצוגה עם אפסים
    updateStatsDisplay({
      totalRecords: 0,
      totalAmount: 0,
      averageAmount: 0
    });
    return;
  }

  // חישוב סטטיסטיקות כלליות
  const totalRecords = statsData.length;
  let totalAmount = 0;

  // חישוב סכום כולל
  statsData.forEach(record => {
    try {
      totalAmount += extractAmount(record.amount);
    } catch (e) {
      console.log('שגיאה בחישוב סכום לרשומה:', record, e);
    }
  });

  // חישוב סכום ממוצע
  const averageAmount = totalRecords > 0 ? Math.round(totalAmount / totalRecords) : 0;

  console.log('Summary statistics calculated:', {
    totalRecords: totalRecords,
    totalAmount: totalAmount,
    averageAmount: averageAmount
  });

  // עדכון תצוגת הסטטיסטיקות
  updateStatsDisplay({
    totalRecords: totalRecords,
    totalAmount: totalAmount,
    averageAmount: averageAmount
  });
}

// פונקציה לעדכון תצוגת הסטטיסטיקות
function updateStatsDisplay(stats) {
  console.log('=== updateStatsDisplay called ===');
  console.log('Stats to display:', stats);

  // פונקציה לעיצוב מספרים עם פסיקים
  const formatNumber = (num) => {
    return num.toLocaleString('he-IL');
  };

  // פונקציה לעיצוב סכומים בדולרים
  const formatCurrency = (num) => {
    return `$${num.toLocaleString('he-IL')}`;
  };

  // עדכון התצוגה עם המידע החדש
  const summaryDiv = document.querySelector('.info-summary');
  if (summaryDiv) {
    summaryDiv.innerHTML = `
      <div>סה"כ רשומות: <strong>${formatNumber(stats.totalRecords)}</strong></div>
      <div>סה"כ סכום: <strong>${formatCurrency(stats.totalAmount)}</strong></div>
      <div>סכום ממוצע: <strong>${formatCurrency(stats.averageAmount)}</strong></div>
    `;
    console.log('Updated info-summary with:', stats);
  } else {
    console.warn('info-summary element not found');
  }

  console.log('Stats display updated:', stats);
}

// ===== פונקציות כללית לסגירה/פתיחה של סקשנים =====

/**
 * פונקציה כללית לפתיחה/סגירה של סקשנים
 * @param {string} sectionId - מזהה הסקשן
 */
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const icon = document.querySelector(`#${sectionId} .filter-icon`);

  if (!section || !icon) {
    console.error(`❌ לא נמצא סקשן או אייקון עבור: ${sectionId}`);
    return;
  }

  // קביעת שם הדף לפי ה-URL הנוכחי
  const currentPath = window.location.pathname;
  let pageName = 'default';

  if (currentPath.includes('/database')) {
    pageName = 'database';
  } else if (currentPath.includes('/accounts')) {
    pageName = 'accounts';
  } else if (currentPath.includes('/tickers')) {
    pageName = 'tickers';
  } else if (currentPath.includes('/trades')) {
    pageName = 'trades';
  } else if (currentPath.includes('/planning')) {
    pageName = 'planning';
  } else if (currentPath.includes('/trades')) {
    pageName = 'tracking';
  } else if (currentPath.includes('/designs')) {
    pageName = 'designs';
  } else if (currentPath.includes('/notes')) {
    pageName = 'notes';
  } else if (currentPath.includes('/alerts')) {
    pageName = 'alerts';
  }

  // הוספת שם הדף למפתח כדי שכל דף ישמור את הסטטוס שלו בנפרד
  const storageKey = `${pageName}_${sectionId}Collapsed`;

  if (section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    icon.textContent = '▲';
    localStorage.setItem(storageKey, 'false');
  } else {
    section.classList.add('collapsed');
    icon.textContent = '▼';
    localStorage.setItem(storageKey, 'true');
  }
}

/**
 * פונקציה לסגירה/פתיחה של כל הסקשנים
 */
function toggleAllSections() {
  const sections = document.querySelectorAll('.content-section');
  const isAnyOpen = Array.from(sections).some(section => !section.classList.contains('collapsed'));
  const pageName = 'database';

  sections.forEach(section => {
    const sectionId = section.id;
    const storageKey = `${pageName}_${sectionId}Collapsed`;

    if (isAnyOpen) {
      section.classList.add('collapsed');
      const icon = section.querySelector('.filter-icon');
      if (icon) icon.textContent = '▼';
      localStorage.setItem(storageKey, 'true');
    } else {
      section.classList.remove('collapsed');
      const icon = section.querySelector('.filter-icon');
      if (icon) icon.textContent = '▲';
      localStorage.setItem(storageKey, 'false');
    }
  });

  // עדכון האייקון בכפתור הראשי
  const mainButton = document.querySelector('button[onclick="toggleAllSections()"]');
  if (mainButton) {
    const icon = isAnyOpen ? '▼' : '▲';
    const buttonIcon = mainButton.querySelector('.filter-icon');
    if (buttonIcon) buttonIcon.textContent = icon;
  }
}

// ===== פונקציות המרה ופורמט =====

/**
 * המרת סטטוס חשבון לעברית
 */

/**
 * הצגת מודל עריכת התראה
 */
function showEditAlertModal(alert) {
  console.log('עריכת התראה:', alert);
  alert('פונקציית עריכת התראה תתווסף בקרוב');
}

/**
 * ביטול התראה
 */
async function cancelAlert(alertId) {
  console.log(`ביטול התראה ${alertId}`);
  if (!confirm('האם אתה בטוח שברצונך לבטל התראה זו?')) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/alerts/${alertId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('התראה בוטלה בהצלחה');

      // רענון הנתונים
      if (typeof window.loadAlertsData === 'function') {
        window.loadAlertsData();
      }

      // הצגת הודעה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('התראה בוטלה', 'התראה בוטלה בהצלחה!');
      } else {
        alert('התראה בוטלה בהצלחה!');
      }
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'שגיאה בביטול התראה');
    }
  } catch (error) {
    console.error('שגיאה בביטול התראה:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בביטול התראה', error.message);
    } else {
      alert('שגיאה בביטול התראה: ' + error.message);
    }
  }
}

/**
 * סימון התראה כמופעלת
 */
function markAlertAsTriggered(alertId) {
  console.log(`סימון התראה ${alertId} כמופעלת`);
  alert('פונקציית סימון התראה כמופעלת תתווסף בקרוב');
}

/**
 * עיצוב מטבע
 */
function formatCurrency(amount) {
  if (typeof amount === 'number') {
    return `$${amount.toLocaleString('he-IL')}`;
  }
  return amount;
}

/**
 * עיצוב תאריך
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return dateString;
  }
}

/**
 * עיצוב תאריך ושעה
 */
function formatDateTime(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('he-IL');
  } catch (error) {
    return dateString;
  }
}

// ===== פונקציות פילטור טבלאות =====

/**
 * פילטור טבלה לפי טקסט
 */
function filterTable(tableId, searchTerm) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  const term = searchTerm.toLowerCase();

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    let found = false;

    cells.forEach(cell => {
      const text = cell.textContent.toLowerCase();
      if (text.includes(term)) {
        found = true;
      }
    });

    if (found || term === '') {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });

  // עדכון ספירה
  updateTableCount(tableId);
}

/**
 * עדכון ספירת שורות בטבלה
 */
function updateTableCount(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const visibleRows = Array.from(tbody.querySelectorAll('tr')).filter(row =>
    row.style.display !== 'none'
  ).length;

  // עדכון הספירה בהתאם לטבלה
  const countElement = getCountElementForTable(tableId);
  if (countElement) {
    const tableName = getTableNameForTable(tableId);
    countElement.textContent = `${visibleRows} ${tableName}`;
  }
}

/**
 * קבלת אלמנט הספירה המתאים
 */
function getCountElementForTable(tableId) {
  const countMap = {
    'usersTable': 'usersCount',
    'accountsTable': 'accountsCount',
    'tickersTable': 'tickersCount',
    'tradesTable': 'tradesCount',
    'tradePlansTable': 'tradePlansCount',
    'alertsTable': 'alertsCount',
    'cashFlowsTable': 'cashFlowsCount',
    'notesTable': 'notesCount',
    'executionsTable': 'executionsCount',
    'userRolesTable': 'userRolesCount'
  };

  const countId = countMap[tableId];
  return countId ? document.getElementById(countId) : null;
}

/**
 * קבלת שם הטבלה
 */
function getTableNameForTable(tableId) {
  const nameMap = {
    'usersTable': 'משתמשים',
    'accountsTable': 'חשבונות',
    'tickersTable': 'טיקרים',
    'tradesTable': 'טריידים',
    'tradePlansTable': 'תוכניות טרייד',
    'alertsTable': 'התראות',
    'cashFlowsTable': 'תזרימי מזומנים',
    'notesTable': 'הערות',
    'executionsTable': 'ביצועים',
    'userRolesTable': 'תפקידי משתמשים'
  };

  return nameMap[tableId] || '';
}

// ===== פונקציות לטעינת נתונים מבסיס הנתונים =====

// משתנים גלובליים לנתונים
let currentDataSource = null;
let currentDataConfig = null;

// הגדרות ברירת מחדל לנתונים - הוסרו הגדרות ספציפיות לתכנונים
const DEFAULT_DATA_CONFIG = {
  apiEndpoint: 'http://127.0.0.1:8080/api/data',
  dataMapping: {},
  statusMapping: {},
  typeMapping: {},
  defaultFilters: {}
};

// פונקציה לטעינת נתונים מבסיס הנתונים
async function loadDataFromDatabase(config = {}) {
  try {
    console.log('Loading data from database with config:', config);

    // מיזוג הגדרות מותאמות אישית עם ברירת המחדל
    const dataConfig = { ...DEFAULT_DATA_CONFIG, ...config };
    currentDataConfig = dataConfig;

    // קריאה לשרת
    const response = await fetch(dataConfig.apiEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    console.log('Raw data from server:', rawData);

    // המרת הנתונים לפורמט הנדרש לגריד
    const processedData = processDataForGrid(rawData, dataConfig);
    console.log('Processed data for grid:', processedData);

    // שמירת הנתונים הגלובליים
    window.rowData = processedData;
    currentDataSource = processedData;

    // עדכון הגריד אם הוא קיים
    if (window.gridApi) {
      updateGridData(processedData);
      // הסטטיסטיקות יתעדכנו על ידי הפילטר
    } else {
      // אם הגריד לא קיים, עדכן רק את הסטטיסטיקות
      updatePageSummaryStats(processedData);
    }

    console.log('Data loaded successfully:', processedData.length, 'items');
    return processedData;

  } catch (error) {
    console.error('Error loading data from database:', error);

    // במקרה של שגיאה, נחזיר נתוני דוגמה
    const fallbackData = getDefaultRowData();
    window.rowData = fallbackData;
    currentDataSource = fallbackData;

    if (window.gridApi) {
      updateGridData(fallbackData);
    }

    return fallbackData;
  }
}

// פונקציה להמרת נתונים לפורמט הגריד
function processDataForGrid(rawData, config) {
  console.log('=== processDataForGrid called ===');
  console.log('Raw data:', rawData);
  console.log('Config:', config);

  const mapping = config.dataMapping;
  const statusMapping = config.statusMapping;
  const typeMapping = config.typeMapping;

  const processedData = rawData.map(item => {
    // המרת תאריך
    const date = item[mapping.date] ? formatDate(item[mapping.date]) : 'N/A';

    // המרת סטטוס
    const rawStatus = item[mapping.status] || 'open';
    const status = statusMapping[rawStatus] || rawStatus;

    // המרת סוג
    const rawType = item[mapping.type] || 'long';
    const type = typeMapping[rawType] || rawType;

    // המרת סכום
    const amount = item[mapping.amount] ? formatAmount(item[mapping.amount]) : 'N/A';

    // המרת מחירים
    const target = item[mapping.target] ? formatPrice(item[mapping.target]) : 'N/A';
    const stop = item[mapping.stop] ? formatPrice(item[mapping.stop]) : 'N/A';
    const current = item[mapping.current] ? formatPrice(item[mapping.current]) : 'N/A';

    const processedItem = {
      ticker: item[mapping.ticker] || 'N/A',
      date: date,
      type: type,
      amount: amount,
      target: target,
      stop: stop,
      current: current,
      status: status,
      action: '⬅️',
      account: item[mapping.account] || 'N/A'
    };

    console.log('Processed item:', processedItem);
    return processedItem;
  });

  console.log('Final processed data:', processedData);
  return processedData;
}

// פונקציה לעיצוב סכום
function formatAmount(amount) {
  if (typeof amount === 'number') {
    return `$${amount.toLocaleString()}`;
  }
  return amount;
}

// פונקציה לעיצוב מחיר
function formatPrice(price) {
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }
  return price;
}

// פונקציה לקבלת נתונים לפי סוג
async function loadDataByType(dataType, customConfig = {}) {
  console.log('=== loadDataByType called ===');
  console.log('Data type:', dataType);
  console.log('Custom config:', customConfig);

  const dataTypes = {
    'tradeplans': {
      apiEndpoint: 'http://127.0.0.1:8080/api/tradeplans',
      dataMapping: {
        ticker: 'ticker',
        date: 'created_at',
        type: 'investment_type',
        amount: 'planned_amount',
        target: 'target_price',
        stop: 'stop_price',
        current: 'current_price',
        status: 'status',
        action: 'action',
        account: 'account_name'
      }
    },
    'trades': {
      apiEndpoint: 'http://127.0.0.1:8080/api/trades',
      dataMapping: {
        ticker: 'ticker',
        date: 'created_at',
        type: 'type',
        amount: 'total_pl',
        target: 'target_price',
        stop: 'stop_price',
        current: 'current_price',
        status: 'status',
        action: 'action',
        account: 'account_name'
      }
    },
    'alerts': {
      apiEndpoint: 'http://127.0.0.1:8080/api/alerts',
      dataMapping: {
        ticker: 'ticker',
        date: 'created_at',
        type: 'alert_type',
        amount: 'condition',
        target: 'target_price',
        stop: 'stop_price',
        current: 'current_price',
        status: 'status',
        action: 'action',
        account: 'account_name'
      }
    }
  };

  const config = dataTypes[dataType];
  if (!config) {
    console.error('Unknown data type:', dataType);
    return null;
  }

  // מיזוג עם הגדרות מותאמות אישית
  const finalConfig = { ...config, ...customConfig };
  console.log('Final config:', finalConfig);

  const result = await loadDataFromDatabase(finalConfig);
  console.log('loadDataByType result:', result);

  return result;
}

// פונקציה לקבלת מידע על מקור הנתונים הנוכחי
function getCurrentDataSourceInfo() {
  return {
    dataSource: currentDataSource,
    config: currentDataConfig,
    count: currentDataSource ? currentDataSource.length : 0
  };
}

// פונקציה לבדיקת זמינות השרת
async function checkServerAvailability() {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/tradeplans');
    return response.ok;
  } catch (error) {
    console.error('Server not available:', error);
    return false;
  }
}

// ===== פונקציות אתחול גריד =====

/**
 * פונקציה לאתחול מלא של מערכת הגריד
 */
async function initializeGridSystem(containerId = '#agGridFloating', customOptions = {}) {
  console.log('=== Initializing Grid System ===');

  try {
    // 1. אתחול נתונים
    console.log('1. Initializing data...');
    const data = await initializeData();

    // 2. יצירת הגריד
    console.log('2. Creating grid...');
    const gridOptions = createGrid(containerId, data, customOptions);

    if (!gridOptions) {
      console.error('Failed to create grid');
      return false;
    }

    // 3. אתחול מערכת הפילטרים
    console.log('3. Initializing filter system...');
    initializeFilterSystem();

    // 4. טעינת פילטרים שמורים
    console.log('4. Loading saved filters...');
    const savedFilters = loadSavedFilters();
    if (savedFilters && savedFilters.statuses) {
      console.log('Found saved filters, will apply after grid creation:', savedFilters);
      window.pendingFilter = savedFilters.statuses;
    }

    // 5. עדכון סטטיסטיקות
    console.log('5. Updating statistics...');
    updatePageSummaryStats(data);

    console.log('=== Grid System Initialized Successfully ===');
    return true;

  } catch (error) {
    console.error('Error initializing grid system:', error);
    return false;
  }
}

/**
 * פונקציה לאתחול מהיר של גריד בסיסי
 */
function initializeBasicGrid(containerId = '#agGridFloating') {
  console.log('=== Initializing Basic Grid ===');

  try {
    // שימוש בנתוני דוגמה
    const data = getDefaultRowData();
    window.rowData = data;

    // יצירת גריד בסיסי
    const gridOptions = createGrid(containerId, data);

    if (gridOptions) {
      console.log('Basic grid initialized successfully');
      return true;
    } else {
      console.error('Failed to initialize basic grid');
      return false;
    }

  } catch (error) {
    console.error('Error initializing basic grid:', error);
    return false;
  }
}

/**
 * פונקציה ליצירת גריד עם פילטרים מותאמים אישית
 */
function initializeGridWithFilters(containerId = '#agGridFloating', filters = {}) {
  console.log('=== Initializing Grid with Custom Filters ===');

  try {
    // טעינת נתונים עם פילטרים
    const data = getDefaultRowData();
    window.rowData = data;

    // יצירת הגריד
    const gridOptions = createGrid(containerId, data);

    if (gridOptions) {
      // החלת פילטרים מותאמים אישית
      if (filters.statuses) {
        applyStatusFilterToGrid(filters.statuses, filters.accounts);
      }

      console.log('Grid with custom filters initialized successfully');
      return true;
    } else {
      console.error('Failed to initialize grid with filters');
      return false;
    }

  } catch (error) {
    console.error('Error initializing grid with filters:', error);
    return false;
  }
}

/**
 * פונקציה לבדיקת זמינות המערכת
 */
function checkSystemAvailability() {
  console.log('=== Checking System Availability ===');

  const checks = {
    agGrid: typeof agGrid !== 'undefined',
    gridApi: !!window.gridApi,
    rowData: !!window.rowData,
    filterSystem: typeof applyStatusFilterToGrid === 'function',
    dataSystem: typeof getDefaultRowData === 'function'
  };

  console.log('System availability:', checks);

  const allAvailable = Object.values(checks).every(check => check);
  console.log('All systems available:', allAvailable);

  return allAvailable;
}

/**
 * פונקציה לרענון מלא של המערכת
 */
async function refreshGridSystem() {
  console.log('=== Refreshing Grid System ===');

  try {
    // רענון נתונים
    const newData = await refreshData();

    // רענון הגריד
    if (window.gridApi) {
      refreshGrid();
    }

    // רענון סטטיסטיקות
    updatePageSummaryStats(newData);

    console.log('Grid system refreshed successfully');
    return true;

  } catch (error) {
    console.error('Error refreshing grid system:', error);
    return false;
  }
}

/**
 * פונקציה לניקוי המערכת
 */
function clearGridSystem() {
  console.log('=== Clearing Grid System ===');

  try {
    // ניקוי הגריד
    clearGrid();

    // ניקוי נתונים
    clearDataFromLocalStorage();

    // ניקוי פילטרים
    clearTestFilter();

    console.log('Grid system cleared successfully');
    return true;

  } catch (error) {
    console.error('Error clearing grid system:', error);
    return false;
  }
}

// ===== פונקציות מקוריות מ-main.js =====

document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector("#agGrid");
  if (!gridDiv) return;

  const columnDefs = [
    {
      headerName: "נכס",
      field: "ticker",
      cellRenderer: params => `<a href="#" onclick="openPlanDetails('${params.value}'); return false;">${params.value}</a>`
    },
    { headerName: "תאריך", field: "date" },
    { headerName: "סוג השקעה", field: "type" },
    { headerName: "סכום/כמות", field: "amount" },
    { headerName: "יעד", field: "target" },
    { headerName: "סטופ", field: "stop" },
    { headerName: "נוכחי", field: "current" },
    { headerName: "סטטוס", field: "status" },
    { headerName: "המרה לטרייד", field: "action", cellRenderer: () => '⬅️' }
  ];

  const rowData = [
    { ticker: "AAPL", date: "2025-08-01", type: "סווינג", amount: "$25,000 (#100)", target: "$210 (12.3%)", stop: "$180 (-6.7%)", current: "$184.32 (+1.2%)", status: "פתוח", action: "" },
    { ticker: "TSLA", date: "2025-07-30", type: "השקעה", amount: "$20,000 (#100)", target: "$780 (10.1%)", stop: "$690 (-4.8%)", current: "$688.90 (-2.1%)", status: "סגור", action: "" },
    { ticker: "NVDA", date: "2025-07-28", type: "השקעה", amount: "$15,000 (#75)", target: "$540 (8.2%)", stop: "$480 (-4.5%)", current: "$503.20 (+0.5%)", status: "פתוח", action: "" },
    { ticker: "AMZN", date: "2025-07-27", type: "פאסיבי", amount: "$10,000 (#50)", target: "$140 (6.3%)", stop: "$126 (-3.1%)", current: "$129.00 (-1.0%)", status: "מבוטל", action: "" },
    { ticker: "GOOG", date: "2025-07-26", type: "השקעה", amount: "$20,000 (#60)", target: "$148 (9.0%)", stop: "$130 (-3.4%)", current: "$141.00 (+1.6%)", status: "פתוח", action: "" },
    { ticker: "MSFT", date: "2025-07-25", type: "סווינג", amount: "$18,000 (#90)", target: "$355 (11.2%)", stop: "$320 (-4.2%)", current: "$342.00 (+2.4%)", status: "סגור", action: "" }
  ];

  const gridOptions = {
    columnDefs,
    rowData,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true
    }
  };

  agGrid.createGrid(gridDiv, gridOptions);
});

function openPlanDetails(ticker = null) {
  const modal = document.getElementById("planModal");
  const content = document.getElementById("planDetailsContent");

  // קבלת תאריך נוכחי
  const today = new Date().toISOString().split('T')[0];

  if (ticker) {
    // עריכת תכנון קיים
    content.innerHTML = `<h2>עריכת תכנון - ${ticker}</h2>
      <form id="planForm">
        <div class="form-group">
          <label>נכס:</label>
          <input type="text" value="${ticker}" readonly>
        </div>
        <div class="form-group">
          <label>תאריך:</label>
          <input type="date" value="${today}">
        </div>
        <div class="form-group">
          <label>סוג השקעה:</label>
          <select>
            <option value="סווינג">סווינג</option>
            <option value="השקעה">השקעה</option>
            <option value="פאסיבי">פאסיבי</option>
          </select>
        </div>
        <div class="form-group">
          <label>סכום השקעה:</label>
          <input type="number" placeholder="הכנס סכום">
        </div>
        <div class="form-group">
          <label>כמות מניות:</label>
          <input type="number" placeholder="הכנס כמות">
        </div>
        <div class="form-group">
          <label>מחיר יעד:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר יעד">
        </div>
        <div class="form-group">
          <label>מחיר סטופ:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר סטופ">
        </div>
        <div class="form-actions">
          <button type="submit">שמור</button>
          <button type="button" onclick="closePlanDetails()">ביטול</button>
        </div>
      </form>`;
  } else {
    // הוספת תכנון חדש
    content.innerHTML = `<h2>הוספת תכנון חדש</h2>
      <form id="planForm">
        <div class="form-group">
          <label>נכס:</label>
          <input type="text" placeholder="הכנס סימול הנכס">
        </div>
        <div class="form-group">
          <label>תאריך:</label>
          <input type="date" value="${today}">
        </div>
        <div class="form-group">
          <label>סוג השקעה:</label>
          <select>
            <option value="סווינג">סווינג</option>
            <option value="השקעה">השקעה</option>
            <option value="פאסיבי">פאסיבי</option>
          </select>
        </div>
        <div class="form-group">
          <label>סכום השקעה:</label>
          <input type="number" placeholder="הכנס סכום">
        </div>
        <div class="form-group">
          <label>כמות מניות:</label>
          <input type="number" placeholder="הכנס כמות">
        </div>
        <div class="form-group">
          <label>מחיר יעד:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר יעד">
        </div>
        <div class="form-group">
          <label>מחיר סטופ:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר סטופ">
        </div>
        <div class="form-actions">
          <button type="submit">שמור</button>
          <button type="button" onclick="closePlanDetails()">ביטול</button>
        </div>
      </form>`;
  }

  modal.style.display = "block";
}

function closePlanDetails() {
  document.getElementById("planModal").style.display = "none";
}

// ===== פונקציות עריכה ומחיקה =====

// פונקציה לעריכת רשומה
function editRecord(tableType, recordId) {
  console.log(`עריכת ${tableType} עם מזהה ${recordId}`);
  alert(`פונקציית עריכה עבור ${tableType} עם מזהה ${recordId} תתווסף בקרוב`);
}

// פונקציה למחיקת רשומה
function deleteRecord(tableType, recordId) {
  console.log(`מחיקת ${tableType} עם מזהה ${recordId}`);
  if (confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
    alert(`פונקציית מחיקה עבור ${tableType} עם מזהה ${recordId} תתווסף בקרוב`);
  }
}

// פונקציה לשמירת רשומה
function saveRecord(tableType) {
  console.log(`שמירת ${tableType}`);
  alert(`פונקציית שמירה עבור ${tableType} תתווסף בקרוב`);
}

// פונקציה לביטול רשומה
function cancelRecord(tableType, recordId) {
  console.log(`ביטול ${tableType} עם מזהה ${recordId}`);

  if (tableType === 'trades') {
    // ביטול טרייד - שינוי סטטוס לבוטל
    if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
      // קריאה לפונקציה הספציפית לדף
      if (typeof window.cancelTrade === 'function') {
        window.cancelTrade(recordId);
      } else {
        alert('פונקציית ביטול טרייד לא זמינה');
      }
    }
  } else if (tableType === 'trade_plans') {
    // ביטול תוכנית טרייד - העברה לפונקציה הספציפית
    if (typeof window.cancelTradePlan === 'function') {
      window.cancelTradePlan(recordId);
    } else {
      alert('פונקציית ביטול תוכנית טרייד לא זמינה');
    }
  } else {
    alert('ביטול לא נתמך עבור סוג זה של רשומה');
  }
}

// פונקציה להצגת הודעות - הוסרה כפילות, משתמשים במערכת ההתראות המתקדמת למעלה

// ===== הוספת הפונקציות החדשות לגלובל =====

// הוספת הפונקציות החדשות לגלובל
window.apiCall = apiCall;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.saveRecord = saveRecord;
window.cancelRecord = cancelRecord;
window.showEditAlertModal = showEditAlertModal;
window.cancelAlert = cancelAlert;
window.markAlertAsTriggered = markAlertAsTriggered;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.filterTable = filterTable;
window.updateTableCount = updateTableCount;
window.getCountElementForTable = getCountElementForTable;
window.getTableNameForTable = getTableNameForTable;
window.toggleSection = toggleSection;
window.toggleAllSections = toggleAllSections;
window.showNotification = showNotification;
window.showSuccessNotification = showSuccessNotification;
window.showErrorNotification = showErrorNotification;
window.showWarningNotification = showWarningNotification;
window.showInfoNotification = showInfoNotification;

// פונקציות התראות בתוך מודול
window.showModalNotification = showModalNotification;
window.showModalSuccessNotification = showModalSuccessNotification;
window.showModalErrorNotification = showModalErrorNotification;
window.showModalWarningNotification = showModalWarningNotification;
window.showModalInfoNotification = showModalInfoNotification;

// פונקציות נתונים
window.getDefaultRowData = getDefaultRowData;
window.loadPlansFromServer = loadPlansFromServer;
window.updatePageSummaryStats = updatePageSummaryStats;
window.updateStatsDisplay = updateStatsDisplay;
window.loadDataFromDatabase = loadDataFromDatabase;
window.processDataForGrid = processDataForGrid;
window.loadDataByType = loadDataByType;
window.getCurrentDataSourceInfo = getCurrentDataSourceInfo;
window.checkServerAvailability = checkServerAvailability;

// פונקציות אתחול גריד
window.initializeGridSystem = initializeGridSystem;
window.initializeBasicGrid = initializeBasicGrid;
window.initializeGridWithFilters = initializeGridWithFilters;
window.checkSystemAvailability = checkSystemAvailability;
window.refreshGridSystem = refreshGridSystem;
window.clearGridSystem = clearGridSystem;

// פונקציה לטעינת מצב הסקשנים לפי הדף הנוכחי
function loadSectionStates() {
  const currentPath = window.location.pathname;
  let pageName = 'default';

  if (currentPath.includes('/database')) {
    pageName = 'database';
  } else if (currentPath.includes('/accounts')) {
    pageName = 'accounts';
  } else if (currentPath.includes('/tickers')) {
    pageName = 'tickers';
  } else if (currentPath.includes('/trades')) {
    pageName = 'trades';
  } else if (currentPath.includes('/planning')) {
    pageName = 'planning';
  } else if (currentPath.includes('/trades')) {
    pageName = 'tracking';
  } else if (currentPath.includes('/designs')) {
    pageName = 'designs';
  } else if (currentPath.includes('/notes')) {
    pageName = 'notes';
  } else if (currentPath.includes('/alerts')) {
    pageName = 'alerts';
  }

  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    const sectionId = section.id;
    const icon = section.querySelector('.filter-icon');

    if (icon) {
      const storageKey = `${pageName}_${sectionId}Collapsed`;
      const isCollapsed = localStorage.getItem(storageKey) === 'true';

      if (isCollapsed) {
        section.classList.add('collapsed');
        icon.textContent = '▼';
      } else {
        section.classList.remove('collapsed');
        icon.textContent = '▲';
      }
    }
  });
}

window.loadSectionStates = loadSectionStates;

// ===== פונקציות גלובליות לסגירת סקשנים =====
// הפונקציות מוגדרות בתחילת הקובץ כפונקציות גלובליות

// וידוא שהפונקציות זמינות מיד
console.log('✅ Global toggle functions loaded and ready:', {
  toggleTopSection: typeof window.toggleTopSection,
  toggleMainSection: typeof window.toggleMainSection,
  restoreAllSectionStates: typeof window.restoreAllSectionStates
});

// ניקוי הודעות קונסולה אחרי זמן קצר
setTimeout(() => {
  console.log('🧹 Clearing console messages to reduce clutter...');
  if (console.clear) {
    console.clear();
  }
}, 20000);

// אתחול אוטומטי של הגדרות תצוגה בדף הערות
if (typeof window.autoResetNotesDisplay === 'function') {
  window.autoResetNotesDisplay();
}

// אתחול אוטומטי כשהדף נטען
document.addEventListener('DOMContentLoaded', function () {
  if (typeof window.autoResetNotesDisplay === 'function') {
    window.autoResetNotesDisplay();
  }
});

// ===== פונקציות סידור טבלאות גלובליות =====
/**
 * מערכת סידור טבלאות גלובלית
 * 
 * מערכת זו מספקת פונקציונליות סידור אחידה לכל הטבלאות באתר.
 * 
 * תכונות:
 * - סידור לפי כל סוגי הנתונים (טקסט, מספרים, תאריכים, סטטוסים)
 * - שמירת מצב הסידור ב-localStorage
 * - אייקונים דינמיים המציגים כיוון הסידור
 * - תמיכה במבני נתונים שונים (אובייקטים, מחרוזות)
 * 
 * שימוש:
 * 1. הוסף class="sortable-header" לכפתורי הכותרות
 * 2. הוסף <span class="sort-icon">↕</span> בתוך הכפתור
 * 3. קרא ל-sortTableData עם הפרמטרים הנכונים
 * 
 * דוגמה:
 * <button class="sortable-header" onclick="sortTable(0)">
 *   <span class="sort-icon">↕</span>כותרת
 * </button>
 * 
 * @author TikTrack Development Team
 * @version 2.0
 * @since 2025-08-21
 */

// משתנים גלובליים לסידור
window.currentSortColumn = -1;
window.currentSortDirection = 'asc';

/**
 * פונקציה גלובלית לסידור טבלאות
 * 
 * פונקציה זו מבצעת סידור של נתונים לפי עמודה מסוימת ומעדכנת את הטבלה.
 * הפונקציה תומכת בסידור עולה ויורד, שומרת את המצב ב-localStorage,
 * ומעדכנת את אייקוני הסידור.
 * 
 * @param {number} columnIndex - אינדקס העמודה לסידור (0-8)
 * @param {Array} data - מערך הנתונים לסידור
 * @param {string} pageName - שם הדף לשמירת מצב (למשל: 'planning', 'alerts')
 * @param {Function} updateTableFunction - פונקציה לעדכון הטבלה עם הנתונים המסודרים
 * @returns {Array} הנתונים המסודרים
 * 
 * @example
 * // סידור טבלת תכנונים לפי עמודת נכס
 * const sortedData = sortTableData(0, designsData, 'planning', updateDesignsTable);
 * 
 * @throws {Error} אם הפונקציה updateTableFunction לא קיימת
 * 
 * @since 2.0
 */
function sortTableData(columnIndex, data, pageName, updateTableFunction) {
  console.log(`🔄 === SORT TABLE (${pageName}) ===`);
  console.log('🔄 Column clicked:', columnIndex);

  // קבלת הנתונים הנוכחיים
  let sortedData = [...data];

  // עדכון כיוון הסידור
  if (window.currentSortColumn === columnIndex) {
    window.currentSortDirection = window.currentSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    window.currentSortColumn = columnIndex;
    window.currentSortDirection = 'asc';
  }

  // מיון הנתונים
  sortedData.sort((a, b) => {
    let aValue, bValue;

    // טיפול מיוחד לדף מעקב טריידים
    if (pageName === 'trades') {
      switch (columnIndex) {
        case 0: // חשבון
          aValue = (a.account_name || a.account_id || '').toLowerCase();
          bValue = (b.account_name || b.account_id || '').toLowerCase();
          break;
        case 1: // טיקר
          aValue = (a.ticker_symbol || a.symbol || '').toLowerCase();
          bValue = (b.ticker_symbol || b.symbol || '').toLowerCase();
          break;
        case 2: // תוכנית
          aValue = (a.trade_plan_id || '').toString();
          bValue = (b.trade_plan_id || '').toString();
          break;
        case 3: // סטטוס
          aValue = getStatusForSort(a.status);
          bValue = getStatusForSort(b.status);
          break;
        case 4: // סוג
          aValue = (a.type || '').toLowerCase();
          bValue = (b.type || '').toLowerCase();
          break;
        case 5: // צד
          aValue = (a.side || 'Long').toLowerCase();
          bValue = (b.side || 'Long').toLowerCase();
          break;
        case 6: // נוצר ב
          aValue = new Date(a.created_at || '').getTime();
          bValue = new Date(b.created_at || '').getTime();
          break;
        case 7: // נסגר ב
          aValue = new Date(a.closed_at || a.cancelled_at || '').getTime();
          bValue = new Date(b.closed_at || b.cancelled_at || '').getTime();
          break;
        case 8: // רווח/הפסד
          aValue = parseFloat(a.total_pl) || 0;
          bValue = parseFloat(b.total_pl) || 0;
          break;
        case 9: // הערות
          aValue = (a.notes || '').toLowerCase();
          bValue = (b.notes || '').toLowerCase();
          break;
        default:
          return 0;
      }
    } else {
      // טיפול כללי לשאר הדפים
      switch (columnIndex) {
        case 0: // נכס (Ticker)
          aValue = getTickerValue(a).toLowerCase();
          bValue = getTickerValue(b).toLowerCase();
          break;
        case 1: // תאריך
          aValue = new Date(getDateValue(a)).getTime();
          bValue = new Date(getDateValue(b)).getTime();
          break;
        case 2: // סוג
          aValue = getTypeValue(a).toLowerCase();
          bValue = getTypeValue(b).toLowerCase();
          break;
        case 3: // צד
          aValue = (getSideValue(a) || 'Long').toLowerCase();
          bValue = (getSideValue(b) || 'Long').toLowerCase();
          break;
        case 4: // סכום
          aValue = parseFloat(getAmountValue(a)) || 0;
          bValue = parseFloat(getAmountValue(b)) || 0;
          break;
        case 5: // יעד
          aValue = parseFloat(getTargetValue(a)) || 0;
          bValue = parseFloat(getTargetValue(b)) || 0;
          break;
        case 6: // סטופ
          aValue = parseFloat(getStopValue(a)) || 0;
          bValue = parseFloat(getStopValue(b)) || 0;
          break;
        case 7: // נוכחי
          aValue = parseFloat(getCurrentValue(a)) || 0;
          bValue = parseFloat(getCurrentValue(b)) || 0;
          break;
        case 8: // סטטוס
          aValue = getStatusForSort(getStatusValue(a));
          bValue = getStatusForSort(getStatusValue(b));
          break;
        default:
          return 0;
      }
    }

    // השוואה
    if (aValue < bValue) {
      return window.currentSortDirection === 'asc' ? -1 : 1;
    } else if (aValue > bValue) {
      return window.currentSortDirection === 'asc' ? 1 : -1;
    } else {
      return 0;
    }
  });

  // עדכון הטבלה
  if (typeof updateTableFunction === 'function') {
    updateTableFunction(sortedData);
  }

  // עדכון אייקונים
  updateTableSortIcons(columnIndex, pageName);

  // שמירת מצב המיון ב-localStorage
  localStorage.setItem(`${pageName}SortColumn`, columnIndex.toString());
  localStorage.setItem(`${pageName}SortDirection`, window.currentSortDirection);

  return sortedData;
}

/**
 * פונקציות עזר לחילוץ ערכים מנתונים
 */

/**
 * חילוץ ערך ticker מפריט נתונים
 * 
 * @param {Object} item - פריט הנתונים
 * @returns {string} ערך ה-ticker (symbol או name)
 * 
 * @example
 * getTickerValue({ticker: {symbol: 'AAPL', name: 'Apple Inc.'}}) // 'AAPL'
 * getTickerValue({ticker: 'AAPL'}) // 'AAPL'
 */
function getTickerValue(item) {
  if (item.ticker && typeof item.ticker === 'object') {
    return item.ticker.symbol || item.ticker.name || '';
  }
  return item.ticker || item.ticker_symbol || item.symbol || '';
}

/**
 * חילוץ ערך תאריך מפריט נתונים
 * 
 * @param {Object} item - פריט הנתונים
 * @returns {string} ערך התאריך
 * 
 * @example
 * getDateValue({created_at: '2025-08-21'}) // '2025-08-21'
 * getDateValue({date: '2025-08-21'}) // '2025-08-21'
 */
function getDateValue(item) {
  return item.created_at || item.date || '';
}

/**
 * חילוץ ערך סוג מפריט נתונים
 * 
 * @param {Object} item - פריט הנתונים
 * @returns {string} ערך הסוג
 * 
 * @example
 * getTypeValue({investment_type: 'swing'}) // 'swing'
 * getTypeValue({type: 'investment'}) // 'investment'
 */
function getTypeValue(item) {
  return item.investment_type || item.type || item.trade_type || '';
}

/**
 * חילוץ ערך צד מפריט נתונים
 * 
 * @param {Object} item - פריט הנתונים
 * @returns {string} ערך הצד (ברירת מחדל: 'Long')
 * 
 * @example
 * getSideValue({side: 'Short'}) // 'Short'
 * getSideValue({}) // 'Long'
 */
function getSideValue(item) {
  return item.side || 'Long';
}

/**
 * חילוץ ערך סכום מפריט נתונים
 * 
 * @param {Object} item - פריט הנתונים
 * @returns {number} ערך הסכום (ברירת מחדל: 0)
 * 
 * @example
 * getAmountValue({planned_amount: 1000}) // 1000
 * getAmountValue({amount: 500}) // 500
 */
function getAmountValue(item) {
  return item.planned_amount || item.amount || 0;
}

/**
 * חילוץ ערך יעד מפריט נתונים
 * 
 * @param {Object} item - פריט הנתונים
 * @returns {number} ערך היעד (ברירת מחדל: 0)
 * 
 * @example
 * getTargetValue({target_price: 150}) // 150
 * getTargetValue({target: 200}) // 200
 */
function getTargetValue(item) {
  return item.target_price || item.target || 0;
}

/**
 * חילוץ ערך סטופ מפריט נתונים
 * 
 * @param {Object} item - פריט הנתונים
 * @returns {number} ערך הסטופ (ברירת מחדל: 0)
 * 
 * @example
 * getStopValue({stop_price: 100}) // 100
 * getStopValue({stop: 90}) // 90
 */
function getStopValue(item) {
  return item.stop_price || item.stop || 0;
}

/**
 * חילוץ ערך נוכחי מפריט נתונים
 * 
 * @param {Object} item - פריט הנתונים
 * @returns {number} הערך הנוכחי (ברירת מחדל: 0)
 * 
 * @example
 * getCurrentValue({current_price: 120}) // 120
 * getCurrentValue({current: 110}) // 110
 */
function getCurrentValue(item) {
  return item.current_price || item.current || 0;
}

/**
 * חילוץ ערך סטטוס מפריט נתונים
 * 
 * @param {Object} item - פריט הנתונים
 * @returns {string} ערך הסטטוס
 * 
 * @example
 * getStatusValue({status: 'open'}) // 'open'
 * getStatusValue({status: 'closed'}) // 'closed'
 */
function getStatusValue(item) {
  return item.status || '';
}

/**
 * פונקציה לקבלת ערך מספרי לסטטוס לסידור
 * 
 * ממירה סטטוסים טקסטואליים לערכים מספריים לצורך סידור עקבי.
 * 
 * @param {string} status - הסטטוס לסידור
 * @returns {number} ערך מספרי לסידור (1=open, 2=closed, 3=cancelled, 0=אחר)
 * 
 * @example
 * getStatusForSort('open') // 1
 * getStatusForSort('closed') // 2
 * getStatusForSort('cancelled') // 3
 * getStatusForSort('unknown') // 0
 */
function getStatusForSort(status) {
  switch (status) {
    case 'open': return 1;
    case 'closed': return 2;
    case 'cancelled': return 3;
    case 'cancelled': return 3;
    default: return 0;
  }
}

/**
 * פונקציה לעדכון אייקוני המיון
 * 
 * מעדכנת את אייקוני הסידור בטבלה לפי העמודה הפעילה וכיוון הסידור.
 * 
 * @param {number} activeColumnIndex - אינדקס העמודה הפעילה
 * @param {string} pageName - שם הדף (לא בשימוש כרגע)
 * 
 * @example
 * updateSortIcons(0, 'planning'); // מעדכן אייקון בעמודה הראשונה
 */
function updateTableSortIcons(activeColumnIndex, pageName) {
  const buttons = document.querySelectorAll('.sortable-header');

  buttons.forEach((button, index) => {
    const sortIcon = button.querySelector('.sort-icon');
    if (sortIcon) {
      if (index === activeColumnIndex) {
        const iconText = window.currentSortDirection === 'asc' ? '↑' : '↓';
        sortIcon.textContent = iconText;
        sortIcon.style.color = '#ff9c05';
        button.classList.add('active-sort');
      } else {
        sortIcon.textContent = '↕';
        sortIcon.style.color = '#999';
        button.classList.remove('active-sort');
      }
    }
  });
}

/**
 * פונקציה לטעינת מצב המיון מ-localStorage
 * 
 * טוענת את מצב הסידור השמור ומעדכנת את האייקונים בהתאם.
 * 
 * @param {string} pageName - שם הדף לטעינת המצב
 * 
 * @example
 * loadSortState('planning'); // טוען מצב סידור לדף תכנונים
 */
function loadSortState(pageName) {
  const savedColumn = localStorage.getItem(`${pageName}SortColumn`);
  const savedDirection = localStorage.getItem(`${pageName}SortDirection`);

  if (savedColumn !== null) {
    window.currentSortColumn = parseInt(savedColumn);
    window.currentSortDirection = savedDirection || 'asc';

    // עדכון אייקונים
    updateTableSortIcons(window.currentSortColumn, pageName);
  }
}

// ייצוא הפונקציות הגלובליות
window.sortTableData = sortTableData;
window.getStatusForSort = getStatusForSort;
window.updateTableSortIcons = updateTableSortIcons;
window.loadSortState = loadSortState;

// ===== סיום הקובץ =====
