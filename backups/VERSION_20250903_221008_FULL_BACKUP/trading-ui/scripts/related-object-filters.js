/**
 * ========================================
 * פילטרים לפי סוג אובייקט מקושר
 * ========================================
 *
 * קובץ זה מכיל פונקציות פילטר לפי סוג אובייקט מקושר
 * שניתן להשתמש בהן בעמודי התראות והודעות
 * בנוסף לפילטר הראשי של המערכת
 *
 * חשוב: לא לגעת בפונקציונאליות הפילטר הראשי!
 * זהו פילטר נוסף שמפעיל פילטור ספציפי לפי סוג אובייקט מקושר
 *
 * File: trading-ui/scripts/related-object-filters.js
 * Version: 1.0
 * Last Updated: September 1, 2025
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

// ייצוא הפונקציות לגלובל
window.filterByRelatedObjectType = filterByRelatedObjectType;
window.filterAlertsByRelatedObjectType = filterAlertsByRelatedObjectType;
window.filterNotesByRelatedObjectType = filterNotesByRelatedObjectType;
