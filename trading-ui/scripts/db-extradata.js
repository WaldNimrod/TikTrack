// ===== קובץ JavaScript ייעודי לדף טבלאות עזר =====
/*
 * DB-Extradata.js - Database Extra Data Page Management
 * ===================================================
 *
 * This file contains all database extra data management functionality for the TikTrack application.
 * It handles display and management of auxiliary database tables.
 *
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 *
 * File: trading-ui/scripts/db-extradata.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// ===== משתנים גלובליים =====
// הגדרת משתנים גלובליים לנתונים
if (!window.currenciesData) {
  window.currenciesData = [];
}
if (!window.noteRelationTypesData) {
  window.noteRelationTypesData = [];
}
if (!window.triggerButtonsData) {
  window.triggerButtonsData = [];
}

let currenciesData = window.currenciesData;
let noteRelationTypesData = window.noteRelationTypesData;
let triggerButtonsData = window.triggerButtonsData;

// ===== פונקציות לטעינת נתונים =====

// פונקציה לטעינת נתוני מטבעות
async function loadCurrenciesData() {

  try {
    const response = await fetch('/api/v1/currencies/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      currenciesData = result.data;
      window.currenciesData = result.data;
      updateCurrenciesTable(result.data);
      updateCurrenciesCount(result.data.length);
      // נטענו מטבעות
    } else {
      throw new Error(result.error?.message || 'שגיאה בטעינת מטבעות');
    }
  } catch (error) {
    handleDataLoadError(error, 'מטבעות');
  }
}

// פונקציה לעדכון טבלת מטבעות
function updateCurrenciesTable(currencies) {
  const tbody = document.querySelector('#currenciesTable tbody');
  if (!tbody) {
    handleElementNotFound('#currenciesTable tbody', 'CRITICAL');
    return;
  }

  if (currencies.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = currencies.map(currency => {
    // בדיקה אם זה רשומת הבסיס (מזהה 1)
    const isBaseRecord = currency.id === 1;
    const isProtected = isBaseRecord;

    return `
    <tr ${isProtected ? 'class="table-warning"' : ''}>
      <td class="ticker-cell" data-type="${currency.symbol || ''}">${currency.symbol || ''}</td>
      <td>${currency.name || ''}</td>
      <td>${currency.usd_rate || ''}</td>
      <td>${currency.id || ''}</td>
      <td data-date="${currency.created_at}">${currency.created_at || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" 
                        onclick="editCurrencyRecord(${currency.id})" 
                        title="${isProtected ? 'רשומת בסיס - לא ניתן לערוך' : 'ערוך'}"
                        ${isProtected ? 'disabled' : ''}>✏️</button>
              </td>
              <td class="p-0">
                <button class="btn btn-sm btn-danger" 
                        onclick="deleteCurrencyRecord(${currency.id})" 
                        title="${isProtected ? 'רשומת בסיס - לא ניתן למחוק' : 'מחק'}"
                        ${isProtected ? 'disabled' : ''}>🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        ${isProtected ? '<small class="text-muted d-block mt-1">🔒 רשומת בסיס מוגנת</small>' : ''}
      </td>
    </tr>
  `;
  }).join('');

  tbody.innerHTML = rows;
}

// פונקציה לעדכון מספר המטבעות
function updateCurrenciesCount(count) {
  // עדכון מונה הטבלה עם שם מהכותרת
  const countElement = document.getElementById('currenciesCount');
  if (countElement) {
    countElement.textContent = `💱 מטבעות: ${count}`;
  }

  // עדכון הסטטיסטיקות הכלליות
  const summaryCountElement = document.getElementById('summaryCurrenciesCount');
  if (summaryCountElement) {
    summaryCountElement.textContent = count;
  }

  const totalRecordsElement = document.getElementById('totalRecords');
  if (totalRecordsElement) {
    const currentTotal = parseInt(totalRecordsElement.textContent) || 0;
    totalRecordsElement.textContent = currentTotal + count;
  }
}

// פונקציה לטעינת נתוני סוגי קישור הערות
async function loadNoteRelationTypesData() {

  try {
    const response = await fetch('/api/v1/note_relation_types/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      noteRelationTypesData = result.data;
      window.noteRelationTypesData = result.data;
      updateNoteRelationTypesTable(result.data);
      updateNoteRelationTypesCount(result.data.length);
      // נטענו סוגי קישור
    } else {
      throw new Error(result.error?.message || 'שגיאה בטעינת סוגי קישור');
    }
  } catch (error) {
    handleDataLoadError(error, 'סוגי קישור');
  }
}

// פונקציה לעדכון טבלת סוגי קישור
function updateNoteRelationTypesTable(noteRelationTypes) {
  const tbody = document.querySelector('#noteRelationTypesTable tbody');
  if (!tbody) {
    handleElementNotFound('#noteRelationTypesTable tbody', 'CRITICAL');
    return;
  }

  if (noteRelationTypes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = noteRelationTypes.map(type => {
    // המרת סוג לפילטר
    const typeForFilter = type.note_relation_type === 'account' ? 'חשבון' :
      type.note_relation_type === 'trade' ? 'טרייד' :
        type.note_relation_type === 'trade_plan' ? 'תוכנית' :
          type.note_relation_type === 'ticker' ? 'טיקר' : type.note_relation_type || '';

    return `
    <tr>
      <td data-type="${typeForFilter}">${type.note_relation_type || ''}</td>
      <td>${type.id || ''}</td>
      <td data-date="${type.created_at}">${type.created_at || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" onclick="editNoteRelationTypeRecord(${type.id})" title="ערוך">✏️</button>
              </td>
              <td class="p-0">
                <button class="btn btn-sm btn-danger" onclick="deleteNoteRelationTypeRecord(${type.id})" title="מחק">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  `;}).join('');

  tbody.innerHTML = rows;
}

// פונקציה לעדכון מספר סוגי קישור
function updateNoteRelationTypesCount(count) {
  // עדכון מונה הטבלה עם שם מהכותרת
  const countElement = document.getElementById('noteRelationTypesCount');
  if (countElement) {
    countElement.textContent = `🔗 סוגי קישור: ${count}`;
  }

  // עדכון הסטטיסטיקות הכלליות
  const summaryCountElement = document.getElementById('summaryNoteRelationTypesCount');
  if (summaryCountElement) {
    summaryCountElement.textContent = count;
  }

  const totalRecordsElement = document.getElementById('totalRecords');
  if (totalRecordsElement) {
    const currentTotal = parseInt(totalRecordsElement.textContent) || 0;
    totalRecordsElement.textContent = currentTotal + count;
  }
}

// פונקציה לטעינת נתוני כפתורי טריגרים
async function loadTriggerButtonsData() {
  try {
    // כרגע אין API לכפתורי טריגרים - נשתמש בנתונים ריקים
    triggerButtonsData = [];
    window.triggerButtonsData = [];
    updateTriggerButtonsTable([]);
    updateTriggerButtonsCount();

    // נטענו כפתורי טריגרים (ריקים)
  } catch (error) {
    handleDataLoadError(error, 'כפתורי טריגרים');
  }
}

// פונקציה לעדכון טבלת כפתורי טריגרים
function updateTriggerButtonsTable(triggerButtons) {
  // כרגע לא צריך לעדכן טבלה כי השתמשנו בכרטיסים סטטיים
  return;
}

// פונקציה לעדכון מספר כפתורי טריגרים (הוסרה - קיימת בהמשך הקובץ)
// function updateTriggerButtonsCount(count) { ... }

// פונקציה להצגת שגיאה בטבלת סוגי קישור - משתמשת במערכת ההתראות הגלובלית

// פונקציות עריכה ומחיקה (placeholder)
// פונקציות אלו הוחלפו בפונקציות החדשות עם שמות ברורים יותר
// editCurrency, deleteCurrency, editNoteRelationType, deleteNoteRelationType

// פונקציה לעדכון סטטיסטיקות כלליות
function updateSummaryStats() {
  const currenciesCount = document.getElementById('summaryCurrenciesCount');
  const noteRelationTypesCount = document.getElementById('summaryNoteRelationTypesCount');
  const totalRecords = document.getElementById('totalRecords');

  if (currenciesCount && noteRelationTypesCount && totalRecords) {
    const currencies = parseInt(currenciesCount.textContent) || 0;
    const noteTypes = parseInt(noteRelationTypesCount.textContent) || 0;
    const total = currencies + noteTypes;

    totalRecords.textContent = total;
  }
}

// פונקציה לטעינת כל הנתונים
async function loadAllData() {
  // טעינת נתונים במקביל
  await Promise.all([
    loadCurrenciesData(),
    loadNoteRelationTypesData(),
    loadTriggerButtonsData(),
  ]);

  // עדכון סטטיסטיקות כלליות
  updateSummaryStats();
}

// הגדרת הפונקציות כגלובליות
window.loadCurrenciesData = loadCurrenciesData;
window.loadNoteRelationTypesData = loadNoteRelationTypesData;
window.loadAllData = loadAllData;
// window.editCurrency = editCurrencyRecord; // This line is removed as per the edit hint
// window.deleteCurrency = deleteCurrencyRecord; // This line is removed as per the edit hint
// window.editNoteRelationType = editNoteRelationTypeRecord; // This line is removed as per the edit hint
// window.deleteNoteRelationType = deleteNoteRelationTypeRecord; // This line is removed as per the edit hint

// פונקציה לעדכון טקסט טעינה
function updateLoadingText() {
  const currenciesCountElement = document.getElementById('currenciesCount');
  const noteRelationTypesCountElement = document.getElementById('noteRelationTypesCount');

  if (currenciesCountElement) {
    currenciesCountElement.textContent = '💱 מטבעות: טוען...';
  }

  if (noteRelationTypesCountElement) {
    noteRelationTypesCountElement.textContent = '🔗 סוגי קישור: טוען...';
  }
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  // שחזור מצב הסגירה של הסקשנים
  if (typeof window.restoreDbExtradataSectionState === 'function') {
    window.restoreDbExtradataSectionState();
  } else {
    handleFunctionNotFound('restoreDbExtradataSectionState');
  }

  // עדכון טקסט טעינה
  updateLoadingText();

  // טעינת הנתונים
  loadAllData();
});

// ===== פונקציות וולידציה =====

// ===== פונקציות CRUD למטבעות (Currencies) =====

// ===== פונקציות CRUD למטבעות (Currencies) =====

// פונקציה להוספת מטבע חדש
function addCurrencyRecord() {
  showAddCurrencyModal();
}

// פונקציה לעריכת מטבע
function editCurrencyRecord(id) {
  // בדיקה אם זה רשומת הבסיס (מזהה 1)
  if (id === 1) {
    if (typeof window.showWarningNotification === 'function') {
      window.showWarningNotification('רשומה מוגנת', 'לא ניתן לערוך רשומת בסיס מוגנת');
    } else {
      console.warn('לא ניתן לערוך רשומת בסיס מוגנת');
    }
    return;
  }
  showEditCurrencyModal(id);
}

// פונקציה למחיקת מטבע
function deleteCurrencyRecord(id) {
  // בדיקה אם זה רשומת הבסיס (מזהה 1)
  if (id === 1) {
    if (typeof window.showWarningNotification === 'function') {
      window.showWarningNotification('רשומה מוגנת', 'לא ניתן למחוק רשומת בסיס מוגנת');
    } else {
      console.warn('לא ניתן למחוק רשומת בסיס מוגנת');
    }
    return;
  }
  showDeleteCurrencyModal(id);
}

// פונקציה להצגת מודל הוספת מטבע
function showAddCurrencyModal() {
  const modalHtml = `
        <div class="modal fade" id="addCurrencyModal" tabindex="-1" aria-labelledby="addCurrencyModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header linkedItems_modal-header-colored bg-primary">
                        <h5 class="modal-title text-white" id="addCurrencyModalLabel">הוסף מטבע חדש</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addCurrencyForm" novalidate>
                            <div class="mb-3">
                                <label for="currencySymbol" class="form-label">סמל מטבע *</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="currencySymbol" 
                                       name="symbol" 
                                       required 
                                       maxlength="10" 
                                       pattern="^[A-Z]+$"
                                       placeholder="USD">
                                <div class="form-text">רק אותיות אנגליות גדולות (למשל: USD, EUR, ILS)</div>
                            </div>
                            <div class="mb-3">
                                <label for="currencyName" class="form-label">שם מטבע *</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="currencyName" 
                                       name="name" 
                                       required 
                                       maxlength="100" 
                                       placeholder="US Dollar">
                            </div>
                            <div class="mb-3">
                                <label for="currencyUsdRate" class="form-label">שער דולר</label>
                                <input type="number" 
                                       class="form-control" 
                                       id="currencyUsdRate" 
                                       name="usd_rate" 
                                       step="0.000001" 
                                       min="0" 
                                       value="1.0" 
                                       placeholder="1.0">
                                <div class="form-text">שער המרה לדולר אמריקאי (ברירת מחדל: 1.0)</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="saveCurrencyRecord()">שמור</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('addCurrencyModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('addCurrencyModal'));

  // ניקוי וולידציות לפני הצגת המודל
  modal._element.addEventListener('shown.bs.modal', function() {
    clearModalValidations('addCurrencyForm');
    setupModalValidations('addCurrencyForm');
  });

  modal.show();
}

// פונקציה להצגת מודל עריכת מטבע
function showEditCurrencyModal(id) {
  // טעינת נתוני המטבע
  fetch(`/api/v1/currencies/${id}`)
    .then(response => response.json())
    .then(result => {
      if (result.status === 'success') {
        const currency = result.data;
        showEditCurrencyModalWithData(currency);
      } else {
        handleDataLoadError(new Error('שגיאה בטעינת נתוני המטבע'), 'נתוני המטבע');
      }
    })
    .catch(error => {
      handleDataLoadError(error, 'נתוני המטבע');
    });
}

// פונקציה להצגת מודל עריכת מטבע עם נתונים
function showEditCurrencyModalWithData(currency) {
  const modalHtml = `
        <div class="modal fade" id="editCurrencyModal" tabindex="-1" aria-labelledby="editCurrencyModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header linkedItems_modal-header-colored bg-secondary">
                        <h5 class="modal-title text-white" id="editCurrencyModalLabel">ערוך מטבע</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editCurrencyForm" novalidate>
                            <input type="hidden" id="editCurrencyId" value="${currency.id}">
                            <div class="mb-3">
                                <label for="editCurrencySymbol" class="form-label">סמל מטבע *</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="editCurrencySymbol" 
                                       name="symbol" 
                                       required 
                                       maxlength="10" 
                                       pattern="^[A-Z]+$"
                                       value="${currency.symbol}">
                                <div class="form-text">רק אותיות אנגליות גדולות (למשל: USD, EUR, ILS)</div>
                            </div>
                            <div class="mb-3">
                                <label for="editCurrencyName" class="form-label">שם מטבע *</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="editCurrencyName" 
                                       name="name" 
                                       required 
                                       maxlength="100" 
                                       value="${currency.name}">
                            </div>
                            <div class="mb-3">
                                <label for="editCurrencyUsdRate" class="form-label">שער דולר</label>
                                <input type="number" 
                                       class="form-control" 
                                       id="editCurrencyUsdRate" 
                                       name="usd_rate" 
                                       step="0.000001" 
                                       min="0" 
                                       value="${currency.usd_rate}">
                                <div class="form-text">שער המרה לדולר אמריקאי</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="updateCurrencyRecord()">עדכן</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('editCurrencyModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('editCurrencyModal'));

  // ניקוי וולידציות לפני הצגת המודל
  modal._element.addEventListener('shown.bs.modal', function() {
    clearModalValidations('editCurrencyForm');
    setupModalValidations('editCurrencyForm');
  });

  modal.show();
}

// פונקציה להצגת מודל מחיקת מטבע
function showDeleteCurrencyModal(id) {
  const modalHtml = `
        <div class="modal fade" id="deleteCurrencyModal" tabindex="-1" aria-labelledby="deleteCurrencyModalLabel" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header modal-header-danger">
                        <h5 class="modal-title text-white" id="deleteCurrencyModalLabel">מחק מטבע</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger" role="alert">
                            <h6 class="alert-heading">⚠️ אזהרה!</h6>
                            <p class="mb-1">האם אתה בטוח שברצונך למחוק מטבע זה?</p>
                            <p class="mb-0 small text-muted">פעולה זו אינה הפיכה ותמחק את המטבע לצמיתות.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-danger" onclick="confirmDeleteCurrencyRecord(${id})">מחק</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('deleteCurrencyModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('deleteCurrencyModal'));
  modal.show();
}

// פונקציה לשמירת מטבע חדש
async function saveCurrencyRecord() {
  // וולידציה של הטופס באמצעות הפונקציה הכללית
  if (!validateForm('addCurrencyForm')) {
    handleValidationError('addCurrencyForm', 'יש לתקן שגיאות בטופס לפני השמירה');
    return;
  }

  const form = document.getElementById('addCurrencyForm');
  const formData = new FormData(form);

  const currencyData = {
    symbol: formData.get('symbol').trim().toUpperCase(),
    name: formData.get('name').trim(),
    usd_rate: parseFloat(formData.get('usd_rate')) || 1.0,
  };

  try {
    const response = await fetch('/api/v1/currencies/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currencyData),
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', `מטבע ${currencyData.symbol} נוסף בהצלחה למערכת`);
      } else {
      }
      bootstrap.Modal.getInstance(document.getElementById('addCurrencyModal')).hide();
      loadCurrenciesData(); // טעינה מחדש של הנתונים
    } else {
      // הודעות שגיאה ספציפיות
      let errorMessage = 'שגיאה בהוספת מטבע';

      if (result.error && result.error.message) {
        if (result.error.message.includes('UNIQUE constraint failed') ||
                    result.error.message.includes('symbol')) {
          errorMessage = 'סמל מטבע זה כבר קיים במערכת';
        } else if (result.error.message.includes('symbol and name are required')) {
          errorMessage = 'סמל מטבע ושם מטבע הם שדות חובה';
        } else {
          errorMessage = result.error.message;
        }
      }

      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', errorMessage);
      } else {
        handleValidationError('addCurrencyForm', errorMessage);
      }
    }
  } catch (error) {
    handleSaveError(error, 'הוספת מטבע');
  }
}

// פונקציה לעדכון מטבע
async function updateCurrencyRecord() {
  // וולידציה של הטופס באמצעות הפונקציה הכללית
  if (!validateForm('editCurrencyForm')) {
    handleValidationError('editCurrencyForm', 'יש לתקן שגיאות בטופס לפני העדכון');
    return;
  }

  const form = document.getElementById('editCurrencyForm');
  const formData = new FormData(form);
  const currencyId = document.getElementById('editCurrencyId').value;

  const currencyData = {
    symbol: formData.get('symbol').trim().toUpperCase(),
    name: formData.get('name').trim(),
    usd_rate: parseFloat(formData.get('usd_rate')) || 1.0,
  };

  try {
    const response = await fetch(`/api/v1/currencies/${currencyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currencyData),
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', `מטבע ${currencyData.symbol} עודכן בהצלחה במערכת`);
      } else {
      }
      bootstrap.Modal.getInstance(document.getElementById('editCurrencyModal')).hide();
      loadCurrenciesData(); // טעינה מחדש של הנתונים
    } else {
      // הודעות שגיאה ספציפיות
      let errorMessage = 'שגיאה בעדכון מטבע';

      if (result.error && result.error.message) {
        if (result.error.message.includes('UNIQUE constraint failed') ||
                    result.error.message.includes('symbol')) {
          errorMessage = 'סמל מטבע זה כבר קיים במערכת';
        } else if (result.error.message.includes('symbol and name are required')) {
          errorMessage = 'סמל מטבע ושם מטבע הם שדות חובה';
        } else if (result.error.message.includes('Currency not found')) {
          errorMessage = 'המטבע לא נמצא במערכת';
        } else {
          errorMessage = result.error.message;
        }
      }

      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', errorMessage);
      } else {
        handleValidationError('editCurrencyForm', errorMessage);
      }
    }
  } catch (error) {
    handleSaveError(error, 'עדכון מטבע');
  }
}

// פונקציה לאישור מחיקת מטבע
async function confirmDeleteCurrencyRecord(id) {
  // מציאת המטבע לפני מחיקה כדי להציג פרטים בהודעה
  const currency = currenciesData.find(c => c.id == id);
  const currencyInfo = currency ? `${currency.symbol} - ${currency.name}` : `מטבע ${id}`;

  try {
    const response = await fetch(`/api/v1/currencies/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', `מטבע ${currencyInfo} נמחק בהצלחה מהמערכת`);
      } else {
      }
      bootstrap.Modal.getInstance(document.getElementById('deleteCurrencyModal')).hide();
      loadCurrenciesData(); // טעינה מחדש של הנתונים
    } else {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', result.error?.message || 'שגיאה במחיקת מטבע');
      } else {
        handleDeleteError(new Error(result.error?.message || 'שגיאה במחיקת מטבע'), 'מטבע');
      }
    }
  } catch (error) {
    handleDeleteError(error, 'מטבע');
  }
}

// ===== פונקציות CRUD לסוגי קישור הערות (Note Relation Types) =====

// פונקציה להוספת סוג קישור חדש
function addNoteRelationTypeRecord() {
  showAddNoteRelationTypeModal();
}

// פונקציה לעריכת סוג קישור
function editNoteRelationTypeRecord(id) {
  showEditNoteRelationTypeModal(id);
}

// פונקציה למחיקת סוג קישור
function deleteNoteRelationTypeRecord(id) {
  showDeleteNoteRelationTypeModal(id);
}

// פונקציה להצגת מודל הוספת סוג קישור
function showAddNoteRelationTypeModal() {
  const modalHtml = `
        <div class="modal fade" id="addNoteRelationTypeModal" tabindex="-1" aria-labelledby="addNoteRelationTypeModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header linkedItems_modal-header-colored bg-primary">
                        <h5 class="modal-title text-white" id="addNoteRelationTypeModalLabel">הוסף סוג קישור חדש</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addNoteRelationTypeForm">
                            <div class="mb-3">
                                <label for="noteRelationType" class="form-label">סוג קישור *</label>
                                <input type="text" class="form-control" id="noteRelationType" name="note_relation_type" required maxlength="20" placeholder="example_type">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="saveNoteRelationTypeRecord()">שמור</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('addNoteRelationTypeModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('addNoteRelationTypeModal'));
  modal.show();
}

// פונקציה להצגת מודל עריכת סוג קישור
function showEditNoteRelationTypeModal(id) {
  // טעינת נתוני סוג הקישור
  fetch(`/api/v1/note_relation_types/${id}`)
    .then(response => response.json())
    .then(result => {
      if (result.status === 'success') {
        const noteType = result.data;
        showEditNoteRelationTypeModalWithData(noteType);
      } else {
        handleDataLoadError(new Error('שגיאה בטעינת נתוני סוג הקישור'), 'נתוני סוג הקישור');
      }
    })
    .catch(error => {
      handleDataLoadError(error, 'נתוני סוג הקישור');
    });
}

// פונקציה להצגת מודל עריכת סוג קישור עם נתונים
function showEditNoteRelationTypeModalWithData(noteType) {
  const modalHtml = `
        <div class="modal fade" id="editNoteRelationTypeModal" tabindex="-1" aria-labelledby="editNoteRelationTypeModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header linkedItems_modal-header-colored bg-secondary">
                        <h5 class="modal-title text-white" id="editNoteRelationTypeModalLabel">ערוך סוג קישור</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editNoteRelationTypeForm">
                            <input type="hidden" id="editNoteRelationTypeId" value="${noteType.id}">
                            <div class="mb-3">
                                <label for="editNoteRelationType" class="form-label">סוג קישור *</label>
                                <input type="text" class="form-control" id="editNoteRelationType" name="note_relation_type" required maxlength="20" value="${noteType.note_relation_type}">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="updateNoteRelationTypeRecord()">עדכן</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('editNoteRelationTypeModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('editNoteRelationTypeModal'));
  modal.show();
}

// פונקציה להצגת מודל מחיקת סוג קישור
function showDeleteNoteRelationTypeModal(id) {
  const modalHtml = `
        <div class="modal fade" id="deleteNoteRelationTypeModal" tabindex="-1" aria-labelledby="deleteNoteRelationTypeModalLabel" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header modal-header-danger">
                        <h5 class="modal-title text-white" id="deleteNoteRelationTypeModalLabel">מחק סוג קישור</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger" role="alert">
                            <h6 class="alert-heading">⚠️ אזהרה!</h6>
                            <p class="mb-1">האם אתה בטוח שברצונך למחוק סוג קישור זה?</p>
                            <p class="mb-0 small text-muted">פעולה זו אינה הפיכה ותמחק את סוג הקישור לצמיתות.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-danger" onclick="confirmDeleteNoteRelationTypeRecord(${id})">מחק</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('deleteNoteRelationTypeModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('deleteNoteRelationTypeModal'));
  modal.show();
}

// פונקציה לשמירת סוג קישור חדש
async function saveNoteRelationTypeRecord() {
  // וולידציה של הטופס באמצעות הפונקציה הכללית
  if (!validateForm('addNoteRelationTypeForm')) {
    handleValidationError('addNoteRelationTypeForm', 'יש לתקן שגיאות בטופס לפני השמירה');
    return;
  }

  const form = document.getElementById('addNoteRelationTypeForm');
  const formData = new FormData(form);

  const noteTypeData = {
    note_relation_type: formData.get('note_relation_type'),
  };

  try {
    const response = await fetch('/api/v1/note_relation_types/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteTypeData),
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', `סוג קישור ${noteTypeData.note_relation_type} נוסף בהצלחה למערכת`);
      } else {
      }
      bootstrap.Modal.getInstance(document.getElementById('addNoteRelationTypeModal')).hide();
      loadNoteRelationTypesData(); // טעינה מחדש של הנתונים
    } else {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', result.error?.message || 'שגיאה בהוספת סוג קישור');
      } else {
        handleSaveError(new Error(result.error?.message || 'שגיאה בהוספת סוג קישור'), 'הוספת סוג קישור');
      }
    }
  } catch (error) {
    handleSaveError(error, 'הוספת סוג קישור');
  }
}

// פונקציה לעדכון סוג קישור
async function updateNoteRelationTypeRecord() {
  // וולידציה של הטופס באמצעות הפונקציה הכללית
  if (!validateForm('editNoteRelationTypeForm')) {
    handleValidationError('editNoteRelationTypeForm', 'יש לתקן שגיאות בטופס לפני העדכון');
    return;
  }

  const form = document.getElementById('editNoteRelationTypeForm');
  const formData = new FormData(form);
  const noteTypeId = document.getElementById('editNoteRelationTypeId').value;

  const noteTypeData = {
    note_relation_type: formData.get('note_relation_type'),
  };

  try {
    const response = await fetch(`/api/v1/note_relation_types/${noteTypeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteTypeData),
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', `סוג קישור ${noteTypeData.note_relation_type} עודכן בהצלחה במערכת`);
      } else {
      }
      bootstrap.Modal.getInstance(document.getElementById('editNoteRelationTypeModal')).hide();
      loadNoteRelationTypesData(); // טעינה מחדש של הנתונים
    } else {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', result.error?.message || 'שגיאה בעדכון סוג קישור');
      } else {
        handleSaveError(new Error(result.error?.message || 'שגיאה בעדכון סוג קישור'), 'עדכון סוג קישור');
      }
    }
  } catch (error) {
    handleSaveError(error, 'עדכון סוג קישור');
  }
}

// פונקציה לאישור מחיקת סוג קישור
async function confirmDeleteNoteRelationTypeRecord(id) {
  // מציאת סוג הקישור לפני מחיקה כדי להציג פרטים בהודעה
  const noteType = noteRelationTypesData.find(n => n.id == id);
  const noteTypeInfo = noteType ? noteType.note_relation_type : `סוג קישור ${id}`;

  try {
    const response = await fetch(`/api/v1/note_relation_types/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', `סוג קישור ${noteTypeInfo} נמחק בהצלחה מהמערכת`);
      } else {
      }
      bootstrap.Modal.getInstance(document.getElementById('deleteNoteRelationTypeModal')).hide();
      loadNoteRelationTypesData(); // טעינה מחדש של הנתונים
    } else {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', result.error?.message || 'שגיאה במחיקת סוג קישור');
      } else {
        handleDeleteError(new Error(result.error?.message || 'שגיאה במחיקת סוג קישור'), 'סוג קישור');
      }
    }
  } catch (error) {
    handleDeleteError(error, 'סוג קישור');
  }
}

// ===== פונקציות CRUD לכפתורי טריגרים (Trigger Buttons) =====

// פונקציה להוספת כפתור טריגר חדש
function addTriggerButtonRecord() {
  showAddTriggerButtonModal();
}

// פונקציה לעריכת כפתור טריגר
function editTriggerButtonRecord(id) {
  showEditTriggerButtonModal(id);
}

// פונקציה למחיקת כפתור טריגר
function deleteTriggerButtonRecord(id) {
  showDeleteTriggerButtonModal(id);
}

// פונקציה להצגת מודל הוספת כפתור טריגר
function showAddTriggerButtonModal() {
  const modalHtml = `
        <div class="modal fade" id="addTriggerButtonModal" tabindex="-1" aria-labelledby="addTriggerButtonModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header linkedItems_modal-header-colored bg-primary">
                        <h5 class="modal-title text-white" id="addTriggerButtonModalLabel">הוסף כפתור טריגר חדש</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addTriggerButtonForm">
                            <div class="mb-3">
                                <label for="triggerButtonName" class="form-label">שם כפתור *</label>
                                <input type="text" class="form-control" id="triggerButtonName" name="button_name" required maxlength="50" placeholder="New Trigger Button">
                            </div>
                            <div class="mb-3">
                                <label for="triggerButtonDescription" class="form-label">תיאור</label>
                                <textarea class="form-control" id="triggerButtonDescription" name="description" rows="3" placeholder="Optional description for the trigger button"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="triggerButtonActionType" class="form-label">סוג פעולה *</label>
                                <select class="form-control" id="triggerButtonActionType" name="action_type" required>
                                    <option value="">בחר סוג פעולה</option>
                                    <option value="open_chart">פתיחת גרף</option>
                                    <option value="open_trade_panel">פתיחת דף טרייד</option>
                                    <option value="open_trade_plan_panel">פתיחת דף תוכנית טרייד</option>
                                    <option value="open_note_panel">פתיחת דף הערות</option>
                                    <option value="open_settings_panel">פתיחת דף הגדרות</option>
                                    <option value="custom_script">פעולה מותאמת</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="triggerButtonIsActive" class="form-label">פעיל</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="triggerButtonIsActive" name="is_active" value="true">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="saveTriggerButtonRecord()">שמור</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('addTriggerButtonModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('addTriggerButtonModal'));
  modal.show();
}

// פונקציה להצגת מודל עריכת כפתור טריגר
function showEditTriggerButtonModal(id) {
  // טעינת נתוני הכפתור
  fetch(`/api/v1/trigger_buttons/${id}`)
    .then(response => response.json())
    .then(result => {
      if (result.status === 'success') {
        const button = result.data;
        showEditTriggerButtonModalWithData(button);
      } else {
        handleDataLoadError(new Error('שגיאה בטעינת נתוני כפתור טריגר'), 'נתוני כפתור טריגר');
      }
    })
    .catch(error => {
      handleDataLoadError(error, 'נתוני כפתור טריגר');
    });
}

// פונקציה להצגת מודל עריכת כפתור טריגר עם נתונים
function showEditTriggerButtonModalWithData(button) {
  const modalHtml = `
        <div class="modal fade" id="editTriggerButtonModal" tabindex="-1" aria-labelledby="editTriggerButtonModalLabel" aria-hidden="true" data-bs-backdrop="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header linkedItems_modal-header-colored bg-secondary">
                        <h5 class="modal-title text-white" id="editTriggerButtonModalLabel">ערוך כפתור טריגר</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editTriggerButtonForm">
                            <input type="hidden" id="editTriggerButtonId" value="${button.id}">
                            <div class="mb-3">
                                <label for="editTriggerButtonName" class="form-label">שם כפתור *</label>
                                <input type="text" class="form-control" id="editTriggerButtonName" name="button_name" required maxlength="50" value="${button.button_name}">
                            </div>
                            <div class="mb-3">
                                <label for="editTriggerButtonDescription" class="form-label">תיאור</label>
                                <textarea class="form-control" id="editTriggerButtonDescription" name="description" rows="3">${button.description}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="editTriggerButtonActionType" class="form-label">סוג פעולה *</label>
                                <select class="form-control" id="editTriggerButtonActionType" name="action_type" required>
                                    <option value="">בחר סוג פעולה</option>
                                    <option value="open_chart" ${button.action_type === 'open_chart' ? 'selected' : ''}>פתיחת גרף</option>
                                    <option value="open_trade_panel" ${button.action_type === 'open_trade_panel' ? 'selected' : ''}>פתיחת דף טרייד</option>
                                    <option value="open_trade_plan_panel" ${button.action_type === 'open_trade_plan_panel' ? 'selected' : ''}>פתיחת דף תוכנית טרייד</option>
                                    <option value="open_note_panel" ${button.action_type === 'open_note_panel' ? 'selected' : ''}>פתיחת דף הערות</option>
                                    <option value="open_settings_panel" ${button.action_type === 'open_settings_panel' ? 'selected' : ''}>פתיחת דף הגדרות</option>
                                    <option value="custom_script" ${button.action_type === 'custom_script' ? 'selected' : ''}>פעולה מותאמת</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editTriggerButtonIsActive" class="form-label">פעיל</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="editTriggerButtonIsActive" name="is_active" value="true" ${button.is_active ? 'checked' : ''}>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="updateTriggerButtonRecord()">עדכן</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('editTriggerButtonModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('editTriggerButtonModal'));
  modal.show();
}

// פונקציה להצגת מודל מחיקת כפתור טריגר
function showDeleteTriggerButtonModal(id) {
  const modalHtml = `
        <div class="modal fade" id="deleteTriggerButtonModal" tabindex="-1" aria-labelledby="deleteTriggerButtonModalLabel" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header modal-header-danger">
                        <h5 class="modal-title text-white" id="deleteTriggerButtonModalLabel">מחק כפתור טריגר</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger" role="alert">
                            <h6 class="alert-heading">⚠️ אזהרה!</h6>
                            <p class="mb-1">האם אתה בטוח שברצונך למחוק כפתור טריגר זה?</p>
                            <p class="mb-0 small text-muted">פעולה זו אינה הפיכה ותמחק את הכפתור לצמיתות.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-danger" onclick="confirmDeleteTriggerButtonRecord(${id})">מחק</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('deleteTriggerButtonModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('deleteTriggerButtonModal'));
  modal.show();
}

// פונקציה לשמירת כפתור טריגר חדש
async function saveTriggerButtonRecord() {
  // וולידציה של הטופס באמצעות הפונקציה הכללית
  if (!validateForm('addTriggerButtonForm')) {
    handleValidationError('addTriggerButtonForm', 'יש לתקן שגיאות בטופס לפני השמירה');
    return;
  }

  const form = document.getElementById('addTriggerButtonForm');
  const formData = new FormData(form);

  const buttonData = {
    button_name: formData.get('button_name').trim(),
    description: formData.get('description').trim(),
    action_type: formData.get('action_type'),
    is_active: formData.get('is_active') === 'true',
  };

  try {
    const response = await fetch('/api/v1/trigger_buttons/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buttonData),
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', `כפתור טריגר ${buttonData.button_name} נוסף בהצלחה למערכת`);
      } else {
      }
      bootstrap.Modal.getInstance(document.getElementById('addTriggerButtonModal')).hide();
      loadTriggerButtonsData(); // טעינה מחדש של הנתונים
    } else {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', result.error?.message || 'שגיאה בהוספת כפתור טריגר');
      } else {
        handleSaveError(new Error(result.error?.message || 'שגיאה בהוספת כפתור טריגר'), 'הוספת כפתור טריגר');
      }
    }
  } catch (error) {
    handleSaveError(error, 'הוספת כפתור טריגר');
  }
}

// פונקציה לעדכון כפתור טריגר
async function updateTriggerButtonRecord() {
  // וולידציה של הטופס באמצעות הפונקציה הכללית
  if (!validateForm('editTriggerButtonForm')) {
    handleValidationError('editTriggerButtonForm', 'יש לתקן שגיאות בטופס לפני העדכון');
    return;
  }

  const form = document.getElementById('editTriggerButtonForm');
  const formData = new FormData(form);
  const buttonId = document.getElementById('editTriggerButtonId').value;

  const buttonData = {
    button_name: formData.get('button_name').trim(),
    description: formData.get('description').trim(),
    action_type: formData.get('action_type'),
    is_active: formData.get('is_active') === 'true',
  };

  try {
    const response = await fetch(`/api/v1/trigger_buttons/${buttonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buttonData),
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', `כפתור טריגר ${buttonData.button_name} עודכן בהצלחה במערכת`);
      } else {
      }
      bootstrap.Modal.getInstance(document.getElementById('editTriggerButtonModal')).hide();
      loadTriggerButtonsData(); // טעינה מחדש של הנתונים
    } else {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', result.error?.message || 'שגיאה בעדכון כפתור טריגר');
      } else {
        handleSaveError(new Error(result.error?.message || 'שגיאה בעדכון כפתור טריגר'), 'עדכון כפתור טריגר');
      }
    }
  } catch (error) {
    handleSaveError(error, 'עדכון כפתור טריגר');
  }
}

// פונקציה לאישור מחיקת כפתור טריגר
async function confirmDeleteTriggerButtonRecord(id) {
  // מציאת הכפתור לפני מחיקה כדי להציג פרטים בהודעה
  const button = triggerButtonsData.find(b => b.id == id);
  const buttonInfo = button ? `${button.button_name} (${button.action_type})` : `כפתור טריגר ${id}`;

  try {
    const response = await fetch(`/api/v1/trigger_buttons/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', `כפתור טריגר ${buttonInfo} נמחק בהצלחה מהמערכת`);
      } else {
      }
      bootstrap.Modal.getInstance(document.getElementById('deleteTriggerButtonModal')).hide();
      loadTriggerButtonsData(); // טעינה מחדש של הנתונים
    } else {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', result.error?.message || 'שגיאה במחיקת כפתור טריגר');
      } else {
        handleDeleteError(new Error(result.error?.message || 'שגיאה במחיקת כפתור טריגר'), 'כפתור טריגר');
      }
    }
  } catch (error) {
    handleDeleteError(error, 'כפתור טריגר');
  }
}

// ===== פונקציות כלליות =====

// showNotification מיוצאת מקובץ ui-utils.js

// פונקציה כללית להוספת רשומה (מטבע או סוג קישור)
function addRecord() {
  // נבדוק איזה כפתור לחצו על ידי בדיקת event target
  const event = window.event || arguments.callee.caller.arguments[0];
  if (event && event.target) {
    const button = event.target.closest('button');
    if (button) {
      const section = button.closest('.content-section');
      if (section) {
        const currenciesTable = section.querySelector('#currenciesTable');
        const noteTypesTable = section.querySelector('#noteRelationTypesTable');
        const triggerButtonsTable = section.querySelector('#triggerButtonsTable');

        if (currenciesTable) {
          addCurrencyRecord();
        } else if (noteTypesTable) {
          addNoteRelationTypeRecord();
        } else if (triggerButtonsTable) {
          addTriggerButtonRecord();
        } else {
          // ברירת מחדל - הוספת מטבע
          addCurrencyRecord();
        }
        return;
      }
    }
  }

  // אם לא הצלחנו לזהות, נבדוק לפי הסקשן הפעיל
  const contentSections = document.querySelectorAll('.content-section');
  const firstSection = contentSections[0]; // מטבעות
  const secondSection = contentSections[1]; // סוגי קישור
  const thirdSection = contentSections[2]; // כפתורי טריגרים

  // נבדוק איזה סקשן לא מוסתר
  if (firstSection && firstSection.querySelector('.section-body').style.display !== 'none') {
    addCurrencyRecord();
  } else if (secondSection && secondSection.querySelector('.section-body').style.display !== 'none') {
    addNoteRelationTypeRecord();
  } else if (thirdSection && thirdSection.querySelector('.section-body').style.display !== 'none') {
    addTriggerButtonRecord();
  } else {
    // ברירת מחדל - הוספת מטבע
    addCurrencyRecord();
  }
}

// ===== ייצוא פונקציות לגלובל =====

// ייצוא פונקציות וולידציה - רק אם הפונקציות הגלובליות לא קיימות
// הערה: פונקציות הוולידציה הוסרו כי הן משתמשות בפונקציות הגלובליות

// ייצוא פונקציות מטבעות
window.addCurrencyRecord = addCurrencyRecord;
window.editCurrencyRecord = editCurrencyRecord;
window.deleteCurrencyRecord = deleteCurrencyRecord;
window.saveCurrencyRecord = saveCurrencyRecord;
window.updateCurrencyRecord = updateCurrencyRecord;
window.confirmDeleteCurrencyRecord = confirmDeleteCurrencyRecord;

// ייצוא פונקציות סוגי קישור
window.addNoteRelationTypeRecord = addNoteRelationTypeRecord;
window.editNoteRelationTypeRecord = editNoteRelationTypeRecord;
window.deleteNoteRelationTypeRecord = deleteNoteRelationTypeRecord;
window.saveNoteRelationTypeRecord = saveNoteRelationTypeRecord;
window.updateNoteRelationTypeRecord = updateNoteRelationTypeRecord;
window.confirmDeleteNoteRelationTypeRecord = confirmDeleteNoteRelationTypeRecord;

// ייצוא פונקציות כפתורי טריגרים
window.addTriggerButtonRecord = addTriggerButtonRecord;
window.editTriggerButtonRecord = editTriggerButtonRecord;
window.deleteTriggerButtonRecord = deleteTriggerButtonRecord;
window.saveTriggerButtonRecord = saveTriggerButtonRecord;
window.updateTriggerButtonRecord = updateTriggerButtonRecord;
window.confirmDeleteTriggerButtonRecord = confirmDeleteTriggerButtonRecord;

// ייצוא פונקציות פעולה לכרטיסי טריגרים
window.showTriggerDetails = showTriggerDetails;
window.testTrigger = testTrigger;
window.activateTrigger = activateTrigger;
window.getTriggerInfo = getTriggerInfo;

// ייצוא פונקציה כללית
window.addRecord = addRecord;

// ייצוא פונקציות צפייה
window.viewCurrency = function(id) {
  if (typeof window.showEditCurrencyModal === 'function') {
    window.showEditCurrencyModal(id);
  } else {

  }
};

window.viewNoteRelationType = function(id) {
  if (typeof window.showEditNoteRelationTypeModal === 'function') {
    window.showEditNoteRelationTypeModal(id);
  } else {

  }
};

// ייצוא פונקציות הוספה
window.showAddCurrencyModal = showAddCurrencyModal;
window.showAddNoteRelationTypeModal = showAddNoteRelationTypeModal;
window.showAddTriggerButtonModal = showAddTriggerButtonModal;

// ייצוא פונקציות עריכה
window.showEditCurrencyModal = showEditCurrencyModal;
window.showEditNoteRelationTypeModal = showEditNoteRelationTypeModal;
window.showEditTriggerButtonModal = showEditTriggerButtonModal;

// ייצוא פונקציות מחיקה
window.showDeleteCurrencyModal = showDeleteCurrencyModal;
window.showDeleteNoteRelationTypeModal = showDeleteNoteRelationTypeModal;
window.showDeleteTriggerButtonModal = showDeleteTriggerButtonModal;

// ייצוא פונקציות עדכון טבלאות
window.updateCurrenciesTable = updateCurrenciesTable;
window.updateNoteRelationTypesTable = updateNoteRelationTypesTable;
window.updateTriggerButtonsTable = updateTriggerButtonsTable;

// ייצוא פונקציות וולידציה
window.initializeRealTimeValidation = initializeRealTimeValidation;
window.clearModalValidations = clearModalValidations;
window.setupModalValidations = setupModalValidations;

// window.showNotification מיוצאת מקובץ ui-utils.js

// ===== פונקציות וולידציה בזמן אמת =====

// פונקציה לניקוי וולידציות במודל
function clearModalValidations(formId) {
  const form = document.getElementById(formId);
  if (!form) {return;}

  // ניקוי כל השדות
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (window.clearFieldValidation) {
      window.clearFieldValidation(input);
    } else {
      // Fallback לניקוי בסיסי
      input.classList.remove('is-valid', 'is-invalid');
      const parent = input.parentElement;
      if (parent) {
        const icon = parent.querySelector('.validation-icon');
        if (icon) {icon.remove();}
      }
    }
  });
}

// פונקציה להגדרת וולידציות במודל
function setupModalValidations(formId) {
  const form = document.getElementById(formId);
  if (!form || !window.setupFieldValidation) {return;}

  // הגדרת וולידציה לכל השדות הרלוונטיים
  const currencySymbol = form.querySelector('#currencySymbol, #editCurrencySymbol');
  const currencyName = form.querySelector('#currencyName, #editCurrencyName');
  const currencyUsdRate = form.querySelector('#currencyUsdRate, #editCurrencyUsdRate');

  if (currencySymbol) {
    window.setupFieldValidation(currencySymbol.id, {
      required: true,
      pattern: /^[A-Z]+$/,
      minLength: 1,
      maxLength: 10,
    }, 'text');
  }

  if (currencyName) {
    window.setupFieldValidation(currencyName.id, {
      required: true,
      maxLength: 100,
    }, 'text');
  }

  if (currencyUsdRate) {
    window.setupFieldValidation(currencyUsdRate.id, {
      type: 'number',
      min: 0,
    }, 'number');
  }
}

// פונקציה לאתחול וולידציה בזמן אמת
function initializeRealTimeValidation() {
  // הגדרת וולידציה לשדות מטבע
  if (window.setupFieldValidation) {
    // שדות מודל הוספת מטבע - בדיקה אם קיימים
    const currencySymbol = document.getElementById('currencySymbol');
    if (currencySymbol) {
      window.setupFieldValidation('currencySymbol', {
        required: true,
        pattern: /^[A-Z]+$/,
        minLength: 1,
        maxLength: 10,
      }, 'text');
    }

    const currencyName = document.getElementById('currencyName');
    if (currencyName) {
      window.setupFieldValidation('currencyName', {
        required: true,
        maxLength: 100,
      }, 'text');
    }

    const currencyUsdRate = document.getElementById('currencyUsdRate');
    if (currencyUsdRate) {
      window.setupFieldValidation('currencyUsdRate', {
        type: 'number',
        min: 0,
      }, 'number');
    }

    // שדות מודל עריכת מטבע - בדיקה אם קיימים
    const editCurrencySymbol = document.getElementById('editCurrencySymbol');
    if (editCurrencySymbol) {
      window.setupFieldValidation('editCurrencySymbol', {
        required: true,
        pattern: /^[A-Z]+$/,
        minLength: 1,
        maxLength: 10,
      }, 'text');
    }

    const editCurrencyName = document.getElementById('editCurrencyName');
    if (editCurrencyName) {
      window.setupFieldValidation('editCurrencyName', {
        required: true,
        maxLength: 100,
      }, 'text');
    }

    const editCurrencyUsdRate = document.getElementById('editCurrencyUsdRate');
    if (editCurrencyUsdRate) {
      window.setupFieldValidation('editCurrencyUsdRate', {
        type: 'number',
        min: 0,
      }, 'number');
    }

    // שדות סוגי קישור - בדיקה אם קיימים
    const noteRelationType = document.getElementById('noteRelationType');
    if (noteRelationType) {
      window.setupFieldValidation('noteRelationType', {
        required: true,
        maxLength: 20,
      }, 'text');
    }

    const editNoteRelationType = document.getElementById('editNoteRelationType');
    if (editNoteRelationType) {
      window.setupFieldValidation('editNoteRelationType', {
        required: true,
        maxLength: 20,
      }, 'text');
    }

    // שדות כפתורי טריגרים - בדיקה אם קיימים
    const triggerButtonName = document.getElementById('triggerButtonName');
    if (triggerButtonName) {
      window.setupFieldValidation('triggerButtonName', {
        required: true,
        maxLength: 50,
      }, 'text');
    }

    const triggerButtonActionType = document.getElementById('triggerButtonActionType');
    if (triggerButtonActionType) {
      window.setupFieldValidation('triggerButtonActionType', {
        required: true,
      }, 'select');
    }
  } else {
    console.warn('⚠️ Validation system not available');
  }
}

// ===== אתחול העמוד =====

// אתחול אוטומטי כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
  // שחזור מצב הסקשן העליון
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  } else {
    console.warn('⚠️ restoreAllSectionStates function not available globally');
  }

  // שחזור מצב הסקשנים הפנימיים
  if (typeof window.restoreSectionStates === 'function') {
    window.restoreSectionStates();
  } else {
    console.warn('⚠️ restoreSectionStates function not available globally');
  }

  // אתחול וולידציה בזמן אמת (אם המערכת זמינה)
  if (typeof window.setupFieldValidation === 'function') {
    initializeRealTimeValidation();
  } else {
    console.warn('⚠️ Validation system not available');
  }

});

// ========================================
// Export Functions
// ========================================

// ===== פונקציות לכפתורי פעולה בכרטיסי טריגרים =====

// פונקציה להצגת פרטי טריגר
function showTriggerDetails(triggerId) {
  const triggerInfo = getTriggerInfo(triggerId);
  if (!triggerInfo) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'לא נמצא מידע על הטריגר');
    }
    return;
  }

  const modalHtml = `
        <div class="modal fade" id="triggerDetailsModal" tabindex="-1" aria-labelledby="triggerDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header linkedItems_modal-header-colored">
                        <h5 class="modal-title" id="triggerDetailsModalLabel">פרטי טריגר: ${triggerInfo.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>מידע כללי</h6>
                                <ul class="list-unstyled">
                                    <li><strong>שם:</strong> ${triggerInfo.name}</li>
                                    <li><strong>סטטוס:</strong> <span class="badge ${triggerInfo.status === 'active' ? 'bg-success' : 'bg-warning'}">${triggerInfo.status === 'active' ? 'פעיל' : 'מתוכנן'}</span></li>
                                    <li><strong>סוג:</strong> ${triggerInfo.type}</li>
                                    <li><strong>טבלאות:</strong> ${triggerInfo.tables}</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6>פעולה</h6>
                                <p>${triggerInfo.action}</p>
                                <h6>תיאור</h6>
                                <p>${triggerInfo.description}</p>
                            </div>
                        </div>
                        ${triggerInfo.sql ? `
                        <div class="mt-3">
                            <h6>SQL Code</h6>
                            <pre class="bg-light p-3 rounded"><code>${triggerInfo.sql}</code></pre>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
                        ${triggerInfo.status === 'planned' ? `<button type="button" class="btn btn-warning" onclick="activateTrigger('${triggerId}')">הפעל טריגר</button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById('triggerDetailsModal');
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('triggerDetailsModal'));
  modal.show();
}

// פונקציה לבדיקת טריגר
function testTrigger(triggerId) {
  const triggerInfo = getTriggerInfo(triggerId);
  if (!triggerInfo) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'לא נמצא מידע על הטריגר');
    }
    return;
  }

  if (typeof window.showSuccessNotification === 'function') {
    window.showSuccessNotification('בדיקה', `בדיקת טריגר ${triggerInfo.name} בוצעה בהצלחה`);
  }
}

// פונקציה להפעלת טריגר
function activateTrigger(triggerId) {
  const triggerInfo = getTriggerInfo(triggerId);
  if (!triggerInfo) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'לא נמצא מידע על הטריגר');
    }
    return;
  }

  if (typeof window.showSuccessNotification === 'function') {
    window.showSuccessNotification('הפעלה', `טריגר ${triggerInfo.name} הופעל בהצלחה`);
  } else {
  }

  // עדכון הסטטוס בכרטיס
  const statusElement = document.querySelector(`[onclick*="${triggerId}"]`).closest('.trigger-button-card').querySelector('.trigger-status');
  if (statusElement) {
    statusElement.textContent = 'פעיל';
    statusElement.className = 'trigger-status active';
  }
}

// פונקציה לקבלת מידע על טריגר
function getTriggerInfo(triggerId) {
  const triggers = {
    'protect_base_currency': {
      name: 'הגנה על מטבע הבסיס',
      status: 'active',
      type: 'טריגר בסיס נתונים',
      tables: 'currencies',
      action: 'מניעת עדכון/מחיקה של מטבע הבסיס (ID=1)',
      description: 'מונע שינויים במטבע הבסיס של המערכת',
      sql: `CREATE TRIGGER protect_base_currency_update 
BEFORE UPDATE ON currencies 
BEGIN 
    SELECT CASE 
        WHEN NEW.id = 1 
        THEN RAISE(ABORT, 'Cannot update base currency record (ID=1)') 
    END; 
END`,
    },
    'protect_last_account': {
      name: 'הגנה על החשבון האחרון',
      status: 'active',
      type: 'טריגר בסיס נתונים',
      tables: 'accounts',
      action: 'מניעת מחיקת החשבון האחרון במערכת',
      description: 'מבטיח שתמיד יהיה לפחות חשבון אחד במערכת',
      sql: `CREATE TRIGGER protect_last_account_delete 
BEFORE DELETE ON accounts 
BEGIN 
    SELECT CASE 
        WHEN (SELECT COUNT(*) FROM accounts) = 1 
        THEN RAISE(ABORT, 'Cannot delete the last account in the system') 
    END; 
END`,
    },
    'trade_active_trades': {
      name: 'עדכון טריידים פעילים',
      status: 'planned',
      type: 'טריגר בסיס נתונים',
      tables: 'trades, tickers',
      action: 'עדכון שדה active_trades בטבלת tickers',
      description: 'מעדכן אוטומטית את מספר הטריידים הפעילים לכל טיקר',
      sql: `CREATE TRIGGER trigger_trade_insert_active_trades
AFTER INSERT ON trades
FOR EACH ROW
BEGIN
    UPDATE tickers 
    SET active_trades = (
        SELECT COUNT(*) > 0 
        FROM trades 
        WHERE trades.ticker_id = NEW.ticker_id 
        AND trades.status = 'open'
    ),
    updated_at = datetime('now')
    WHERE tickers.id = NEW.ticker_id;
END`,
    },
    'trade_ticker_status': {
      name: 'עדכון סטטוס טיקר',
      status: 'planned',
      type: 'טריגר בסיס נתונים',
      tables: 'trades, tickers',
      action: 'עדכון סטטוס טיקר בהתאם לטריידים פעילים',
      description: 'מעדכן את סטטוס הטיקר ל-\'open\' או \'closed\' בהתאם לטריידים',
      sql: `CREATE TRIGGER trigger_trade_insert_ticker_status
AFTER INSERT ON trades
FOR EACH ROW
BEGIN
    UPDATE tickers 
    SET status = CASE 
        WHEN NEW.status = 'open' OR (
            SELECT COUNT(*) > 0 
            FROM trades 
            WHERE trades.ticker_id = NEW.ticker_id 
            AND trades.status = 'open'
        ) THEN 'open'
        ELSE 'closed'
    END,
    updated_at = datetime('now')
    WHERE tickers.id = NEW.ticker_id
    AND tickers.status != 'cancelled';
END`,
    },
    'plan_active_trades': {
      name: 'עדכון טריידים פעילים מתוכניות',
      status: 'planned',
      type: 'טריגר בסיס נתונים',
      tables: 'trade_plans, tickers',
      action: 'עדכון שדה active_trades בטבלת tickers',
      description: 'מעדכן אוטומטית את מספר הטריידים הפעילים לכל טיקר כולל תוכניות',
      sql: `CREATE TRIGGER update_ticker_active_trades_on_plan_insert
AFTER INSERT ON trade_plans
BEGIN
    UPDATE tickers 
    SET active_trades = (
        SELECT COUNT(*) > 0 
        FROM trades 
        WHERE ticker_id = NEW.ticker_id AND status = 'open'
    ) OR (
        SELECT COUNT(*) > 0 
        FROM trade_plans 
        WHERE ticker_id = NEW.ticker_id AND status = 'open'
    )
    WHERE id = NEW.ticker_id;
END`,
    },
    'plan_ticker_status': {
      name: 'עדכון סטטוס טיקר מתוכניות',
      status: 'planned',
      type: 'טריגר בסיס נתונים',
      tables: 'trade_plans, tickers',
      action: 'עדכון סטטוס טיקר בהתאם לתוכניות פעילות',
      description: 'מעדכן את סטטוס הטיקר בהתאם לתוכניות טרייד פעילות',
      sql: `CREATE TRIGGER trigger_trade_plan_insert_ticker_status
AFTER INSERT ON trade_plans
FOR EACH ROW
BEGIN
    UPDATE tickers 
    SET status = CASE 
        WHEN NEW.status = 'open' OR (
            SELECT COUNT(*) > 0 
            FROM trades 
            WHERE trades.ticker_id = NEW.ticker_id 
            AND trades.status = 'open'
        ) THEN 'open'
        ELSE 'closed'
    END,
    updated_at = datetime('now')
    WHERE tickers.id = NEW.ticker_id
    AND tickers.status != 'cancelled';
END`,
    },
    'alert_account': {
      name: 'בדיקת התראות חשבון',
      status: 'active',
      type: 'לוגיקה Python',
      tables: 'alerts',
      action: 'בדיקת תנאי התראה לחשבון',
      description: 'בודק תנאי התראה ספציפי לחשבון',
    },
    'alert_trade': {
      name: 'בדיקת התראות טרייד',
      status: 'active',
      type: 'לוגיקה Python',
      tables: 'alerts',
      action: 'בדיקת תנאי התראה לטרייד',
      description: 'בודק תנאי התראה ספציפי לטרייד',
    },
    'alert_trade_plan': {
      name: 'בדיקת התראות תוכנית',
      status: 'active',
      type: 'לוגיקה Python',
      tables: 'alerts',
      action: 'בדיקת תנאי התראה לתוכנית טרייד',
      description: 'בודק תנאי התראה ספציפי לתוכנית טרייד',
    },
    'alert_ticker': {
      name: 'בדיקת התראות טיקר',
      status: 'active',
      type: 'לוגיקה Python',
      tables: 'alerts',
      action: 'בדיקת תנאי התראה לטיקר',
      description: 'בודק תנאי התראה ספציפי לטיקר',
    },
  };

  return triggers[triggerId];
}
