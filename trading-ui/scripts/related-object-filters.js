/**
 * ========================================
 * מערכת פילטרים לפי סוג אובייקט מקושר - מערכת כללית
 * ========================================
 *
 * מערכת פילטרים מרכזית לסינון פריטים לפי סוג האובייקט המקושר
 * תומכת בכל היישויות עם שדה `related_type_id` וכפתורי פילטור עם `data-type`
 * 
 * 🎯 מטרה: פילטור אחיד לפי סוג אובייקט מקושר בכל העמודים
 * 📍 בשימוש: alerts.html, notes.html, וכל עמוד אחר שזקוק לסינון
 * 🔗 קשור למערכת: linked-items.js (מערכת האובייקטים המקושרים)
 *
 * כללים לשימוש:
 * 1. בעמוד HTML: הוסף כפתורי פילטור עם `data-type` attribute
 * 2. בקוד JS: קרא ל-`createRelatedObjectFilter(entityName, dataVar, updateFunction, itemName)`
 * 3. הפילטרים יתאתחלו אוטומטית ויצרו פונקציות גלובליות
 *
 * File: trading-ui/scripts/related-object-filters.js
 * Version: 2.0
 * Last Updated: October 15, 2025
 *
 * מחבר: TikTrack Development Team
 * ========================================
 */

/**
 * פילטר לפי סוג אובייקט מקושר - פונקציה גלובלית
 * @param {string} type - סוג האובייקט: 'all', 'account', 'trade', 'trade_plan', 'ticker'
 * @param {Array} data - מערך הנתונים לפילטור
 * @param {Function} updateFunction - פונקציה לעדכון הטבלה
 * @param {string} countSelector - סלקטור לאלמנט ספירת רשומות
 * @param {string} itemName - שם הפריטים (למשל: "התראות", "הודעות")
 */
function filterByRelatedObjectType(type, data, updateFunction, countSelector, itemName) {
  // פילטר לפי סוג אובייקט מקושר - סוג: ${type}, כמות נתונים: ${data.length}

  // עדכון מצב הכפתורים
  const buttons = document.querySelectorAll('[data-type]');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-type') === type) {
      btn.classList.add('active');
      btn.classList.remove('btn-outline-primary');
      btn.style.backgroundColor = 'white';
      const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
      btn.style.color = colors.positive;
      btn.style.borderColor = colors.positive;
    } else {
      btn.classList.remove('active');
      btn.classList.add('btn-outline-primary');
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });

  // מיפוי סוגים ל-ID
  const typeMapping = {
    'all': null,
    'account': 1,
    'trade': 2,
    'trade_plan': 3,
    'ticker': 4,
  };

  const targetTypeId = typeMapping[type];

  // פילטור הנתונים
  let filteredData = data;

  if (type !== 'all') {
    filteredData = data.filter(item => item.related_type_id === targetTypeId);
  }

  // עדכון הטבלה עם הנתונים המסוננים
  if (typeof updateFunction === 'function') {
    updateFunction(filteredData);
  }

  // עדכון ספירת רשומות
  const countElement = document.querySelector(countSelector);
  if (countElement) {
    countElement.textContent = `${filteredData.length} ${itemName}`;
  }

  // סוננו ${itemName} לפי סוג '${type}': נמצאו ${filteredData.length} פריטים

  return filteredData;
}

/**
 * פילטר התראות לפי סוג אובייקט מקושר
 * @param {string} type - סוג האובייקט
 */
function filterAlertsByRelatedObjectType(type) {
  if (typeof window.alertsData === 'undefined') {
    // נתוני התראות לא זמינים
    return;
  }

  return filterByRelatedObjectType(
    type,
    window.alertsData,
    window.updateAlertsTable,
    '.table-count',
    'התראות',
  );
}

/**
 * פילטר הודעות לפי סוג אובייקט מקושר
 * @param {string} type - סוג האובייקט
 */
function filterNotesByRelatedObjectType(type) {
  if (typeof window.notesData === 'undefined') {
    // נתוני הודעות לא זמינים
    return;
  }

  return filterByRelatedObjectType(
    type,
    window.notesData,
    window.updateNotesTable,
    '.table-count',
    'הודעות',
  );
}

/**
 * יצירת מערכת פילטרים לכל יישות - פונקציה כללית
 * @param {string} entityName - שם היישות (לדוגמה: 'alerts', 'notes')
 * @param {string} dataVarName - שם משתנה הנתונים הגלובלי (לדוגמה: 'alertsData')
 * @param {string} updateFunctionName - שם פונקציית עדכון הטבלה (לדוגמה: 'updateAlertsTable')
 * @param {string} itemName - שם הפריטים בעברית (לדוגמה: 'התראות', 'הערות')
 * @param {string} countSelector - סלקטור לאלמנט ספירה (אופציונלי)
 */
function createRelatedObjectFilter(entityName, dataVarName, updateFunctionName, itemName, countSelector = '.table-count') {
  // יצירת שם פונקציה לפי התקן
  const filterFunctionName = `filter${entityName.charAt(0).toUpperCase() + entityName.slice(1)}ByRelatedObjectType`;
  
  // הגדרת הפונקציה באופן דינמי
  window[filterFunctionName] = function(type) {
    if (typeof window[dataVarName] === 'undefined') {
      console.warn(`⚠️ נתוני ${itemName} לא זמינים לסינון`);
      return;
    }

    return filterByRelatedObjectType(
      type,
      window[dataVarName],
      window[updateFunctionName],
      countSelector,
      itemName
    );
  };

  console.log(`✅ נוצר פילטר לפי סוג אובייקט מקושר עבור ${itemName}: ${filterFunctionName}`);
  return window[filterFunctionName];
}

/**
 * אתחול אוטומטי של פילטרים לכל היישויות הבסיסיות
 * פונקציה זו מופעלת אוטומטית כאשר הקובץ נטען
 */
function initializeRelatedObjectFilters() {
  // הגדרת תצורות הפילטרים לכל יישות
  const filterConfigs = [
    {
      entityName: 'alerts',
      dataVarName: 'alertsData',
      updateFunctionName: 'updateAlertsTable',
      itemName: 'התראות'
    },
    {
      entityName: 'notes',
      dataVarName: 'notesData', 
      updateFunctionName: 'updateNotesTable',
      itemName: 'הודעות'
    }
    // נוכל להוסיף עוד יישויות כאן בקלות בעתיד
  ];

  // יצירת פילטרים לכל ההגדרות
  filterConfigs.forEach(config => {
    createRelatedObjectFilter(
      config.entityName,
      config.dataVarName,
      config.updateFunctionName,
      config.itemName
    );
  });

  console.log('🚀 מערכת הפילטרים לפי סוג אובייקט מקושר אותחלה');
}

// אתחול אוטומטי כאשר הקובץ נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRelatedObjectFilters);
} else {
  initializeRelatedObjectFilters();
}

// ייצוא הפונקציות לגלובל
window.filterByRelatedObjectType = filterByRelatedObjectType;
window.filterAlertsByRelatedObjectType = filterAlertsByRelatedObjectType;
window.filterNotesByRelatedObjectType = filterNotesByRelatedObjectType;
window.createRelatedObjectFilter = createRelatedObjectFilter;
window.initializeRelatedObjectFilters = initializeRelatedObjectFilters;
