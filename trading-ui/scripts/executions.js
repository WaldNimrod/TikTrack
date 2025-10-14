// ===== קובץ JavaScript לדף עסקעות =====

// ===== Global Element Cache =====
let addExecutionModal = null;
let addExecutionModalElement = null;
let editExecutionModal = null;
let editExecutionModalElement = null;
let linkedItemsModal = null;
let linkedItemsModalElement = null;
let addExecutionForm = null;
let editExecutionForm = null;
let editExecutionDate = null;

// DOMContentLoaded removed - handled by unified system via PAGE_CONFIGS in core-systems.js

window.initializeExecutionsModals = function() {
    addExecutionModalElement = document.getElementById('addExecutionModal');
    editExecutionModalElement = document.getElementById('editExecutionModal');
    linkedItemsModalElement = document.getElementById('linkedItemsModal');
    addExecutionForm = document.getElementById('addExecutionForm');
    editExecutionForm = document.getElementById('editExecutionForm');
    editExecutionDate = document.getElementById('editExecutionDate');
    
    if (addExecutionModalElement) addExecutionModal = new bootstrap.Modal(addExecutionModalElement);
    if (editExecutionModalElement) editExecutionModal = new bootstrap.Modal(editExecutionModalElement);
    if (linkedItemsModalElement) linkedItemsModal = new bootstrap.Modal(linkedItemsModalElement);
};

/**
 * הוספת ביצוע חדש
 * פותח מודל להוספת ביצוע חדש
 */
// הוסר: addExecution() גרם לכפילות מול saveExecution
/*
 * Executions.js - Executions Page Management
 * =========================================
 *
 * This file contains all executions management functionality for the TikTrack application.
 * It handles executions CRUD operations, table updates, and user interactions.
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 *
 * Table Mapping:
 * - Uses 'executions' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * File: trading-ui/scripts/executions.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// ייצוא מוקדם של הפונקציה למניעת שגיאות
window.loadExecutionsData = window.loadExecutionsData || function() {
  // loadExecutionsData not yet defined, using placeholder
};

// משתנים גלובליים
if (!window.executionsData) {
  window.executionsData = [];
}
let executionsData = window.executionsData;

// משתנים לפילטרים
let originalExecutions = []; // הנתונים המקוריים - לא משתנים
let allExecutions = [];
let filteredExecutions = [];
let tradesData = []; // נתוני טריידים לשמירת מפת חשבונות

// פונקציות בסיסיות
function openExecutionDetails(_id) {

  showAddExecutionModal();
}

function editExecution(id) {

  showEditExecutionModal(id);
}

function deleteExecution(id) {
  // deleteExecution called with id
  // window.showDeleteWarning exists check

  // קבלת פרטי העסקה מהטבלה
  const executionRow = document.querySelector(`tr[data-execution-id="${id}"]`);
  let executionDetails = `עסקה #${id}`;
  
  if (executionRow) {
    const cells = executionRow.querySelectorAll('td');
    if (cells.length >= 4) {
      const action = cells[1]?.textContent?.trim() || '';
      const quantity = cells[2]?.textContent?.trim() || '';
      const price = cells[3]?.textContent?.trim() || '';
      executionDetails = `${action} ${quantity} יחידות ב-${price}`;
    }
  }

  // שימוש במערכת הגלובלית למחיקה
  if (typeof window.showDeleteWarning === 'function') {
    // Using global showDeleteWarning with relevant details
    window.showDeleteWarning('executions', executionDetails, 'עסקה', async () => {
      // Delete confirmed, calling confirmDeleteExecution
      // קריאה לפונקציה המקומית לאחר אישור
      await confirmDeleteExecution(id);
    }, null);
  } else {
    // Using fallback - global system not available
    // גיבוי למקרה שהמערכת הגלובלית לא זמינה
    handleSystemError(new Error('מערכת מחיקה לא זמינה'), 'מערכת מחיקה');
  }
}

/**
 * הצגת פרטי עסקה
 */
function showExecutionDetails(executionId) {
    // חיפוש העסקה בנתונים
    const execution = window.executionsData ? window.executionsData.find(e => e.id === executionId) : null;
    
    if (!execution) {
        console.error(`❌ Execution with ID ${executionId} not found`);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', `עסקה עם ID ${executionId} לא נמצאה`);
        }
        return;
    }

    // שימוש במערכת הצגת פרטים כללית אם זמינה
    if (typeof window.showEntityDetails === 'function') {
        window.showEntityDetails('execution', executionId, { mode: 'view' });
    } else {
        // הצגה פשוטה
        const details = `פרטי עסקה:
ID: ${execution.id}
פעולה: ${execution.action || execution.type || 'לא מוגדר'}
כמות: ${execution.quantity || 'לא מוגדר'}
מחיר: $${execution.price || '0'}
תאריך: ${execution.date || execution.execution_date || 'לא מוגדר'}
מקור: ${execution.source || 'לא מוגדר'}
טרייד: ${execution.trade_id || 'לא מוגדר'}`;
        alert(details);
    }
}

// פונקציות לפתיחה/סגירה של סקשנים - שימוש במערכת הכללית

// ========================================
// פונקציות מודלים
// ========================================

/**
 * ניקוי והשבתת שדות בטופס הוספת עסקה
 */
function resetAddExecutionForm() {
  // ניקוי הטופס
  addExecutionForm.reset();
  if (typeof window.clearValidation === 'function') {
    window.clearValidation('addExecutionForm');
  }

  // השבתת כל השדות חוץ מטיקר
  const fieldsToDisable = [
    'executionType',
    'executionQuantity',
    'executionPrice',
    'executionDate',
    'executionAccount',
    'executionCommission',
    'executionNotes',
  ];

  fieldsToDisable.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.disabled = true;
    }
  });

  // הסתרת כפתור קישור לטרייד
  const tradeLinkButton = document.getElementById('addExecutionTradeLink');
  if (tradeLinkButton) {
    tradeLinkButton.style.display = 'none';
  }


}

function enableAddExecutionFields() {
  const fieldsToEnable = [
    'executionType',
    'executionQuantity',
    'executionPrice',
    'executionDate',
    'executionAccount',
    'executionCommission',
    'executionNotes',
  ];
  fieldsToEnable.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.disabled = false;
    }
  });
}

/**
 * הצגת מודל הוספת עסקה
 */
async function showAddExecutionModal() {


  // ניקוי והשבתת השדות
  resetAddExecutionForm();

  // הגדרת תאריך ברירת מחדל באמצעות DefaultValueSetter
  if (window.DefaultValueSetter) {
    window.DefaultValueSetter.setCurrentDateTime('executionDate');
  } else {
    // Fallback למקרה שהשירות לא זמין
    const today = new Date();
    const todayString = today.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    window.DataCollectionService.setValue('executionDate', todayString, 'text');
  }

  // טעינת חשבון ברירת מחדל תתבצע דרך SelectPopulatorService (בהמשך)

  // טעינת טיקרים באמצעות SelectPopulatorService
  if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function') {
    await window.SelectPopulatorService.populateTickersSelect('executionTicker', {
      includeEmpty: true,
      emptyText: 'בחר טיקר...'
    });
  } else {
    // Fallback למקרה שהשירות לא זמין
  await updateTickersList('add', false);
  }

  // טעינת חשבונות עם ברירת מחדל מהעדפות (מיד עם פתיחת המודל)
  if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
    await window.SelectPopulatorService.populateAccountsSelect('executionAccount', {
      includeEmpty: true,
      emptyText: 'בחר חשבון...',
      defaultFromPreferences: true,
      // ברירת מחדל נוספת למקרה שהמערכת לא זמינה
      defaultValue: (typeof window.getPreference === 'function') 
        ? (await window.getPreference('default_trading_account')) 
        : undefined
    });
  }

  // הפעלת כל השדות לאחר בחירת טיקר
  const tickerSelect = document.getElementById('executionTicker');
  if (tickerSelect) {
    tickerSelect.disabled = false;
    tickerSelect.addEventListener('change', async () => {
      if (tickerSelect.value) {
        enableAddExecutionFields();
        // מילוי מחיר ברירת מחדל מהמחיר האחרון של הטיקר
        fillDefaultPriceFromTicker(tickerSelect.value);
        // עמלת ברירת מחדל מהעדפות (טוען מידית ללא תלות במערכת המתקדמת)
        await fillDefaultCommissionFromPreferences();
        // טעינת טריידים פתוחים לטיקר
        await populateTradesForSelectedTicker(tickerSelect.value);
        // טעינת חשבונות עם ברירת מחדל מהעדפות
        if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
          await window.SelectPopulatorService.populateAccountsSelect('executionAccount', {
            includeEmpty: true,
            emptyText: 'בחר חשבון...',
            defaultFromPreferences: true
          });
        }
      }
    });
  }

  // חישוב ערכים מחושבים
  calculateAddExecutionValues();

  // הגדרת עמלת ברירת מחדל באופן מיידי (גם לפני בחירת טיקר)
  await fillDefaultCommissionFromPreferences();

  // הצגת המודל
  const modal = new bootstrap.Modal(addExecutionModalElement);
  modal.show();
}

// מילוי מחיר ברירת מחדל לפי הטיקר הנבחר
async function fillDefaultPriceFromTicker(tickerId) {
  try {
    const resp = await fetch(`/api/tickers/${tickerId}`);
    if (!resp.ok) {return;}
    const data = await resp.json();
    const price = data?.data?.current_price;
    const priceEl = document.getElementById('executionPrice');
    if (priceEl && price && !Number.isNaN(Number(price))) {
      priceEl.value = Number(price).toFixed(2);
    }
  } catch (e) {
    // שקט - לא חוסם UX
  }
}

// מילוי עמלת ברירת מחדל מהעדפות
async function fillDefaultCommissionFromPreferences() {
  try {
    const commissionEl = document.getElementById('executionCommission');
    if (!commissionEl) {return;}
    // ניסיון 1: מפתח תקני במערכת v2 - defaultCommission
    if (typeof window.getCurrentPreference === 'function') {
      const pref = await window.getCurrentPreference('defaultCommission');
      if (pref !== null && pref !== undefined && pref !== '') {
        const val = Number(pref);
        if (!Number.isNaN(val)) {
          commissionEl.value = val.toFixed(2);
          return;
        }
      }
    }
    // ניסיון 2: DefaultValueSetter עם המפתח התקני
    if (window.DefaultValueSetter && typeof window.DefaultValueSetter.setPreferenceValue === 'function') {
      const pref = await window.DefaultValueSetter.setPreferenceValue('executionCommission', 'defaultCommission');
      if (pref !== null && pref !== undefined && pref !== '') {
        const val = Number(pref);
        if (!Number.isNaN(val)) {
          commissionEl.value = val.toFixed(2);
          return;
        }
      }
    }
    // ניסיון 3: API פשוטה של getPreference עם המפתח התקני
    if (typeof window.getPreference === 'function') {
      const pref = await window.getPreference('defaultCommission');
      if (pref !== null && pref !== undefined && pref !== '') {
        const val = Number(pref);
        if (!Number.isNaN(val)) {
          commissionEl.value = val.toFixed(2);
          return;
        }
      }
    }
    // ניסיון 4 (תמיכה לאחור): מפתח ישן default_execution_commission
    if (typeof window.getPreference === 'function') {
      const prefLegacy = await window.getPreference('default_execution_commission');
      if (prefLegacy !== null && prefLegacy !== undefined && prefLegacy !== '') {
        const val = Number(prefLegacy);
        if (!Number.isNaN(val)) {
          commissionEl.value = val.toFixed(2);
          return;
        }
      }
    }
    // אם לא נמצא ערך - משאירים שדה ריק (לא 0)
  } catch (e) {
    // שקט
  }
}

// טעינת טריידים פתוחים לטיקר וסימון select הטרייד
async function populateTradesForSelectedTicker(tickerId) {
  try {
    const select = document.getElementById('executionAccount');
    if (!select) {return;}
    // טען את כל הטריידים ובחר לפי ticker_id
    const resp = await fetch('/api/trades/');
    if (!resp.ok) {return;}
    const data = await resp.json();
    const trades = data?.data || [];
    const filtered = trades.filter(t => String(t.ticker_id) === String(tickerId) && t.status === 'open');
    select.innerHTML = '';
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = 'בחר טרייד';
    select.appendChild(empty);
    filtered.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.display_name || t.remarks || `Trade ${t.id}`;
      select.appendChild(opt);
    });
  } catch (e) {
    // שקט
  }
}

/**
 * ניקוי והשבתת שדות בטופס עריכת עסקה
 */
function resetEditExecutionForm() {
  // ניקוי הטופס
  editExecutionForm.reset();
  if (typeof window.clearValidation === 'function') {
    window.clearValidation('editExecutionForm');
  }

  // השבתת כל השדות חוץ מטיקר
  const fieldsToDisable = [
    'editExecutionTradeId',
    'editExecutionType',
    'editExecutionQuantity',
    'editExecutionPrice',
    'editExecutionCommission',
    'editExecutionDate',
    'editExecutionNotes',
  ];

  fieldsToDisable.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.disabled = true;
    }
  });

  // הסתרת כפתור קישור לטרייד
  const tradeLinkButton = document.getElementById('editExecutionTradeLink');
  if (tradeLinkButton) {
    tradeLinkButton.style.display = 'none';
  }


}

/**
 * הצגת מודל עריכת עסקה
 */
async function showEditExecutionModal(id) {
  console.log(`📝 Opening edit modal for execution ${id}`);

  // מציאת העסקה לפי ID
  const execution = executionsData.find(e => e.id === id);
  if (!execution) {
    console.error(`❌ Execution ${id} not found in executionsData`);
    handleElementNotFound('execution', 'CRITICAL');
    return;
  }

  // מילוי שדה ה-ID לפני כל השאר
  window.DataCollectionService.setValue('editExecutionId', execution.id, 'int');
  
  // זיהוי סוג השיוך החדש
  const assignmentType = execution.linked_type || (execution.trade_id ? 'trade' : 'ticker');
  console.log(`🔗 Execution ${id} assignment type: ${assignmentType}`);
  
  // הגדרת רדיו באטן
  const tickerRadio = document.getElementById('editAssignToTicker');
  const tradeRadio = document.getElementById('editAssignToTrade');
  
  if (assignmentType === 'ticker') {
    if (tickerRadio) tickerRadio.checked = true;
    if (tradeRadio) tradeRadio.checked = false;
  } else {
    if (tickerRadio) tickerRadio.checked = false;
    if (tradeRadio) tradeRadio.checked = true;
  }
  
  // החלפת שדות בהתאם לסוג השיוך
  if (typeof window.toggleAssignmentFields === 'function') {
    window.toggleAssignmentFields('edit');
  }
  
  // מילוי שדות בהתאם לסוג השיוך החדש
  if (assignmentType === 'ticker') {
    // שיוך לטיקר - מלא שדה טיקר
    const tickerSelect = document.getElementById('editExecutionTicker');
    if (tickerSelect && execution.ticker_id) {
      // טען קודם את הטיקרים
      if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function') {
        await window.SelectPopulatorService.populateTickersSelect('editExecutionTicker', {
          includeEmpty: true,
          emptyText: 'בחר טיקר...'
        });
      }
      tickerSelect.value = String(execution.ticker_id);
    }
    
    // מלא שדה חשבון אם קיים
    const accountSelect = document.getElementById('editExecutionAccount');
    if (accountSelect && execution.trading_account_id) {
      if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
        await window.SelectPopulatorService.populateAccountsSelect('editExecutionAccount', {
          includeEmpty: true,
          emptyText: 'בחר חשבון (אופציונלי)'
        });
      }
      accountSelect.value = String(execution.trading_account_id);
    }
    
  } else {
    // שיוך לטרייד - לוגיקה קיימת (בהמשך)
  }

  // טעינת טיקרים באמצעות SelectPopulatorService
  const showClosedTrades = document.getElementById('editExecutionShowClosedTrades')?.checked || false;
  if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function') {
    await window.SelectPopulatorService.populateTickersSelect('editExecutionTicker', {
      includeEmpty: true,
      emptyText: 'בחר טיקר...'
    });
  } else {
    // Fallback למקרה שהשירות לא זמין
    await updateTickersList('edit', showClosedTrades);
  }

  // בחירת טיקר ברירת מחדל לפי המידע שנגזר (tickerId) אם קיים
  if (tickerId) {
    const tickerSelect = document.getElementById('editExecutionTicker');
    if (tickerSelect) {
      tickerSelect.value = String(tickerId);
    }
  }

  // טעינת פרטי הטרייד/תכנון המקושר
  let linkedObject = null;
  let tickerId = null;
  let actionValue = null;
  let executionDate = null;

  try {
    // בדיקה אם יש טרייד מקושר
    if (execution.trade_id) {

      const tradesResponse = await fetch('/api/trades/');
      const responseData = await tradesResponse.json();
      const trades = responseData.data || responseData || [];


      const trade = trades.find(t => t.id === execution.trade_id);
      if (trade) {

        linkedObject = { type: 'trade', data: trade };
        tickerId = trade.ticker_id;
      } else {

      }
    }

    // אם לא נמצא טרייד, נבדוק תכנונים
    if (!linkedObject) {
      try {
        const plansResponse = await fetch('/api/trade_plans/');
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          const plans = plansData.data || plansData || [];

          const plan = plans.find(p => p.id === execution.trade_id);
          if (plan) {
            linkedObject = { type: 'plan', data: plan };
            tickerId = plan.ticker_id;

          }
        }
      } catch {
        // לא ניתן לטעון תכנונים
      }
    }

    // עדכון שדה הטיקר
    if (tickerId) {

      const tickerSelect = document.getElementById('editExecutionTicker');
      if (tickerSelect) {
        tickerSelect.value = tickerId;

        // טעינת טריידים ותכנונים לטיקר זה
        await loadActiveTradesForTicker('edit');

      } else {

      }
    } else {

    }

    // מילוי הטופס - שדה ID כבר מולא למעלה

    // עדכון שדה הטרייד/תכנון - מחכים לטעינת הטריידים
    if (linkedObject) {
      const tradeSelect = document.getElementById('editExecutionTradeId');
      if (tradeSelect) {
        // האפשרויות מכילות מספרים ישירים, לא trade_X או plan_X
        const value = linkedObject.data.id.toString();

        // פונקציה לבדיקה ומילוי
        const trySetTradeValue = () => {

          const optionExists = Array.from(tradeSelect.options).some(option => option.value === value);
          if (optionExists) {
            tradeSelect.value = value;

            return true;
          }
          return false;
        };

        // נסיון ראשון
        if (!trySetTradeValue()) {

          // נסיון נוסף אחרי זמן קצר
          setTimeout(() => {
            if (!trySetTradeValue()) {

            }
          }, 500);
        }
      }
    }

    // תיקון שדה הפעולה - מיפוי action/type לערכים ב-select
    actionValue = execution.action || execution.type;
    if (actionValue) {
      const actionSelect = document.getElementById('editExecutionType');
      if (actionSelect) {
        actionSelect.value = actionValue;

      } else {

      }
    } else {

    }

    // מילוי שדה הכמות
    if (execution.quantity) {
      const quantityField = document.getElementById('editExecutionQuantity');
      if (quantityField) {
        quantityField.value = execution.quantity;

      } else {

      }
    } else {

    }

    // מילוי שדה המחיר
    if (execution.price) {
      const priceField = document.getElementById('editExecutionPrice');
      if (priceField) {
        priceField.value = execution.price;

      } else {

      }
    } else {

    }

    // עיבוד תאריך ביצוע - בדיקה של שדות שונים
    executionDate = execution.date || execution.execution_date || execution.created_at;

    console.log('🔍 [EDIT MODAL] שדות תאריך זמינים:', {
      date: execution.date,
      execution_date: execution.execution_date,
      created_at: execution.created_at
    });
    if (executionDate) {
      try {
        // המרה לפורמט datetime-local
        const date = new Date(executionDate);
        const localDateTime = date.toISOString().slice(0, 16);
        const dateField = editExecutionDate;
        if (dateField) {
          dateField.value = localDateTime;

        } else {

        }
      } catch (error) {

        const dateField = editExecutionDate;
        if (dateField) {
          dateField.value = '';
        }
      }
    } else {

      const dateField = editExecutionDate;
      if (dateField) {
        dateField.value = '';
      }
    }

    // מילוי שדה העמלה
    const commissionValue = execution.fee || execution.commission || '';
    if (commissionValue) {
      const commissionField = document.getElementById('editExecutionCommission');
      if (commissionField) {
        commissionField.value = commissionValue;

      } else {

      }
    } else {

    }

    // מילוי שדה המקור
    const sourceValue = execution.source || execution.source_type || execution.source_name || execution.sourceType || 'manual';
    const sourceField = document.getElementById('editExecutionSource');
    if (sourceField) {
      sourceField.value = sourceValue;

    } else {

    }

    // מילוי שדה מזהה חיצוני אם קיים
    const externalIdValue = execution.external_id || execution.externalId || '';
    const externalIdField = document.getElementById('editExecutionExternalId');
    if (externalIdField) {
      externalIdField.value = externalIdValue;
      if (externalIdValue) {

      }
    } else {

    }

    // הצגת/הסתרת שדה מזהה חיצוני לפי המקור
    toggleExternalIdField('edit');

    // מילוי שדה ההערות
    const notesValue = execution.notes || '';
    if (notesValue) {
      const notesField = document.getElementById('editExecutionNotes');
      if (notesField) {
        notesField.value = notesValue;

      } else {

      }
    } else {

    }

    // הצגת כפתור קישור לטרייד/תכנון אם יש
    const tradeLinkButton = document.getElementById('editExecutionTradeLink');
    if (tradeLinkButton && linkedObject) {
      tradeLinkButton.style.display = 'block';
      tradeLinkButton.setAttribute('data-trade-id', linkedObject.data.id);
      tradeLinkButton.setAttribute('data-object-type', linkedObject.type);
    }

  } catch (error) {
    handleDataLoadError(error, 'פרטי אובייקט מקושר');
  }

  if (typeof window.clearValidation === 'function') {
    window.clearValidation('editExecutionForm');
  }

  // הפעלת כל השדות בעריכת עסקה
  enableAllFields('edit');

  // חישוב ערכים מחושבים
  calculateEditExecutionValues();

  console.log('🎯 [EDIT MODAL] סיכום מילוי טופס עריכה:');
  console.log('🎯 [EDIT MODAL] - עסקה ID:', execution.id);
  console.log('🎯 [EDIT MODAL] - טרייד מקושר:', linkedObject ? `${linkedObject.type}:${linkedObject.data.id}` : 'אין');
  console.log('🎯 [EDIT MODAL] - טיקר:', tickerId);
  console.log('🎯 [EDIT MODAL] - פעולה:', actionValue);
  console.log('🎯 [EDIT MODAL] - כמות:', execution.quantity);
  console.log('🎯 [EDIT MODAL] - מחיר:', execution.price);
  console.log('🎯 [EDIT MODAL] - תאריך:', executionDate);

  // הצגת המודל
  const modal = new bootstrap.Modal(editExecutionModalElement);
  modal.show();
}

// פונקציה זו הוסרה - שימוש במערכת הגלובלית showDeleteWarning

// ========================================
// פונקציות ולידציה
// ========================================


/**
 * ולידציה של מזהה טרייד
 */
// ========================================
// פונקציות ולידציה
// ========================================
/**
 * ולידציה של טופס הוספת עסקה
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
function validateExecutionForm() {
    return window.validateEntityForm('addExecutionForm', [
        { id: 'addExecutionTradeId', name: 'טרייד/תכנון' },
        { 
            id: 'addExecutionType', 
            name: 'סוג עסקה',
            validation: (value) => {
                if (!['buy', 'sale'].includes(value)) {
                    return 'סוג עסקה לא תקין';
                }
                return true;
            }
        },
        { 
            id: 'addExecutionQuantity', 
            name: 'כמות',
            validation: (value) => {
                const num = parseInt(value);
                if (isNaN(num)) return 'כמות חייבת להיות מספר';
                if (num <= 0) return 'כמות חייבת להיות חיובית';
                if (num > 1000000) return 'כמות גבוהה מדי (מקסימום 1,000,000)';
  return true;
}
        },
        { 
            id: 'addExecutionPrice', 
            name: 'מחיר',
            validation: (value) => {
                const num = parseFloat(value);
                if (isNaN(num)) return 'מחיר חייב להיות מספר';
                if (num <= 0) return 'מחיר חייב להיות חיובי';
                if (num > 1000000) return 'מחיר גבוה מדי (מקסימום 1,000,000)';
                return true;
            }
        },
        { id: 'addExecutionDate', name: 'תאריך עסקה' },
        { 
            id: 'addExecutionCommission', 
            name: 'עמלה',
            validation: (value) => {
                if (value && value !== '') {
                    const num = parseFloat(value);
                    if (isNaN(num)) return 'עמלה חייבת להיות מספר';
                    if (num < 0) return 'עמלה לא יכולה להיות שלילית';
                    if (num > 10000) return 'עמלה גבוהה מדי (מקסימום 10,000)';
                }
  return true;
}
        },
        { 
            id: 'addExecutionNotes', 
            name: 'הערות',
            validation: (value) => {
                if (value && value.length > 1000) {
                    return 'הערות ארוכות מדי (מקסימום 1,000 תווים)';
                }
                return true;
            }
        }
    ]);
}

/**
 * ולידציה של טופס עריכת עסקה
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
function validateEditExecutionForm() {
    return window.validateEntityForm('editExecutionForm', [
        { id: 'editExecutionTradeId', name: 'טרייד/תכנון' },
        { 
            id: 'editExecutionType', 
            name: 'סוג עסקה',
            validation: (value) => {
                if (!['buy', 'sale'].includes(value)) {
                    return 'סוג עסקה לא תקין';
                }
  return true;
}
        },
        { 
            id: 'editExecutionQuantity', 
            name: 'כמות',
            validation: (value) => {
                const num = parseInt(value);
                if (isNaN(num)) return 'כמות חייבת להיות מספר';
                if (num <= 0) return 'כמות חייבת להיות חיובית';
                if (num > 1000000) return 'כמות גבוהה מדי (מקסימום 1,000,000)';
  return true;
}
        },
        { 
            id: 'editExecutionPrice', 
            name: 'מחיר',
            validation: (value) => {
                const num = parseFloat(value);
                if (isNaN(num)) return 'מחיר חייב להיות מספר';
                if (num <= 0) return 'מחיר חייב להיות חיובי';
                if (num > 1000000) return 'מחיר גבוה מדי (מקסימום 1,000,000)';
  return true;
}
        },
        { id: 'editExecutionDate', name: 'תאריך עסקה' },
        { 
            id: 'editExecutionCommission', 
            name: 'עמלה',
            validation: (value) => {
                if (value && value !== '') {
                    const num = parseFloat(value);
                    if (isNaN(num)) return 'עמלה חייבת להיות מספר';
                    if (num < 0) return 'עמלה לא יכולה להיות שלילית';
                    if (num > 10000) return 'עמלה גבוהה מדי (מקסימום 10,000)';
                }
  return true;
}
        },
        { 
            id: 'editExecutionNotes', 
            name: 'הערות',
            validation: (value) => {
                if (value && value.length > 1000) {
                    return 'הערות ארוכות מדי (מקסימום 1,000 תווים)';
                }
  return true;
}
        }
    ]);
}


// ========================================
// פונקציות שמירה ועדכון
// ========================================

/**
 * שמירת עסקה חדשה
 */
/**
 * שמירת עסקה חדשה
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
async function saveExecution() {
  try {
    // 1. ולידציה
    if (!validateExecutionForm()) {
    return;
  }

  // 2. קבלת סוג שיוך (ticker/trade)
  const assignmentType = document.querySelector('input[name="addAssignmentType"]:checked')?.value || 'ticker';
  
  // 3. בניית אובייקט נתונים בסיסי
  const baseData = window.DataCollectionService.collectFormData({
      action: { id: 'executionType', type: 'text' },
      quantity: { id: 'executionQuantity', type: 'int' },
      price: { id: 'executionPrice', type: 'number' },
      date: { id: 'executionDate', type: 'text' },
      fee: { id: 'executionCommission', type: 'number', default: null },
      source: { id: null, type: 'text', default: 'manual' },
      notes: { id: 'executionNotes', type: 'text', default: null }
  });
    
    // 4. הוספת שדות שיוך בהתאם לסוג
    const executionData = {
        ...baseData,
        date: baseData.date ? new Date(baseData.date).toISOString() : null
    };
    
    if (assignmentType === 'ticker') {
        // שיוך לטיקר
        const tickerId = document.getElementById('executionTicker').value;
        executionData.ticker_id = tickerId ? parseInt(tickerId) : null;
        executionData.trade_id = null;
        
        // חשבון אופציונלי
        const accountId = document.getElementById('executionAccount').value;
        executionData.trading_account_id = accountId ? parseInt(accountId) : null;
    } else {
        // שיוך לטרייד
        const tradeId = document.getElementById('addExecutionTradeId').value;
        executionData.trade_id = tradeId ? parseInt(tradeId) : null;
        executionData.ticker_id = null;
        
        // חשבון חובה
        const accountId = document.getElementById('executionAccount').value;
        executionData.trading_account_id = accountId ? parseInt(accountId) : null;
    }

  // DEBUG: לוג לפני שליחה
  console.log('🟨 [Executions] About to POST /api/executions/ with payload:', executionData);

  // 3. שליחה לשרת
  const response = await fetch('/api/executions/', {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(executionData),
    });

  // DEBUG: סטטוס ותוכן תגובה
  try {
    const clone = response.clone();
    const text = await clone.text();
    console.log('🟨 [Executions] POST response status:', response.status, 'body:', text);
  } catch (e) {
    console.log('🟨 [Executions] Unable to read response clone');
  }

    // 4. טיפול בתגובה באמצעות CRUDResponseHandler
    await window.CRUDResponseHandler.handleSaveResponse(response, {
        modalId: 'addExecutionModal',
        successMessage: 'עסקה נוספה בהצלחה',
      customValidationParser: (errorMessage) => {
        if (typeof errorMessage !== 'string') {return null;}
        const normalized = String(errorMessage);
        const out = [];
        if (normalized.includes('action')) out.push({ fieldId: 'addExecutionType', message: 'יש לבחור פעולה' });
        if (normalized.includes('quantity')) out.push({ fieldId: 'addExecutionQuantity', message: 'יש להזין כמות תקינה' });
        if (normalized.includes('price')) out.push({ fieldId: 'addExecutionPrice', message: 'יש להזין מחיר תקין' });
        if (normalized.includes('date')) out.push({ fieldId: 'addExecutionDate', message: 'יש לבחור תאריך' });
        if (normalized.includes('fee')) out.push({ fieldId: 'addExecutionCommission', message: 'עמלה לא תקינה' });
        if (normalized.includes('source')) out.push({ fieldId: 'addExecutionSource', message: 'מקור לא תקין' });
        return out.length ? out : null;
      },
        reloadFn: async () => {
            // ניקוי מטמון
            if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
                await window.UnifiedCacheManager.remove('executions');
                console.log('✅ מטמון executions נוקה אחרי הוספה');
            }
            // רענון טבלה
            if (typeof window.loadExecutionsData === 'function') {
                await window.loadExecutionsData();
            }
        },
        entityName: 'עסקה'
    });

  } catch (error) {
    console.error('Error saving execution:', error);
    if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בשמירת עסקה', error.message);
    }
  }
}

/**
 * עדכון עסקה קיימת
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
async function updateExecution() {
  try {
    // 1. ולידציה
    if (!validateEditExecutionForm()) {
    return;
  }

    // 2. קבלת מזהה ו סוג שיוך
    const id = window.DataCollectionService.getValue('editExecutionId', 'int');
    const assignmentType = document.querySelector('input[name="editAssignmentType"]:checked')?.value || 'trade';
    
    // 3. בניית אובייקט נתונים בסיסי
    const baseData = window.DataCollectionService.collectFormData({
        action: { id: 'editExecutionType', type: 'text' },
        quantity: { id: 'editExecutionQuantity', type: 'int' },
        price: { id: 'editExecutionPrice', type: 'number' },
        date: { id: 'editExecutionDate', type: 'text' },
        fee: { id: 'editExecutionCommission', type: 'number', default: null },
        source: { id: null, type: 'text', default: 'manual' },
        notes: { id: 'editExecutionNotes', type: 'text', default: null }
    });
    
    // 4. הוספת שדות שיוך בהתאם לסוג
    const executionData = {
        ...baseData,
        date: baseData.date ? new Date(baseData.date).toISOString() : null
    };
    
    if (assignmentType === 'ticker') {
        // שיוך לטיקר
        const tickerId = document.getElementById('editExecutionTicker').value;
        executionData.ticker_id = tickerId ? parseInt(tickerId) : null;
        executionData.trade_id = null;
        
        // חשבון אופציונלי
        const accountId = document.getElementById('editExecutionAccount').value;
        executionData.trading_account_id = accountId ? parseInt(accountId) : null;
    } else {
        // שיוך לטרייד
        const tradeId = document.getElementById('editExecutionTradeId').value;
        executionData.trade_id = tradeId ? parseInt(tradeId) : null;
        executionData.ticker_id = null;
        
        // חשבון חובה
        const accountId = document.getElementById('editExecutionAccount').value;
        executionData.trading_account_id = accountId ? parseInt(accountId) : null;
    }

    // 3. שליחה לשרת
    console.log('🟨 [Executions] About to PUT /api/executions/'+id+' with payload:', executionData);
    const response = await fetch(`/api/executions/${id}`, {
      method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(executionData),
    });

    try {
      const clone = response.clone();
      const text = await clone.text();
      console.log('🟨 [Executions] PUT response status:', response.status, 'body:', text);
    } catch (e) {
      console.log('🟨 [Executions] Unable to read PUT response clone');
    }

    // 4. טיפול בתגובה באמצעות CRUDResponseHandler
    await window.CRUDResponseHandler.handleUpdateResponse(response, {
        modalId: 'editExecutionModal',
        successMessage: 'עסקה עודכנה בהצלחה',
      customValidationParser: (errorMessage) => {
        if (typeof errorMessage !== 'string') {return null;}
        const normalized = String(errorMessage);
        const out = [];
        if (normalized.includes('action')) out.push({ fieldId: 'editExecutionType', message: 'יש לבחור פעולה' });
        if (normalized.includes('quantity')) out.push({ fieldId: 'editExecutionQuantity', message: 'יש להזין כמות תקינה' });
        if (normalized.includes('price')) out.push({ fieldId: 'editExecutionPrice', message: 'יש להזין מחיר תקין' });
        if (normalized.includes('date')) out.push({ fieldId: 'editExecutionDate', message: 'יש לבחור תאריך' });
        if (normalized.includes('fee')) out.push({ fieldId: 'editExecutionCommission', message: 'עמלה לא תקינה' });
        if (normalized.includes('source')) out.push({ fieldId: 'editExecutionSource', message: 'מקור לא תקין' });
        return out.length ? out : null;
      },
        reloadFn: async () => {
            // ניקוי מטמון
            if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
                await window.UnifiedCacheManager.remove('executions');
                console.log('✅ מטמון executions נוקה אחרי עדכון');
            }
            // רענון טבלה
            if (typeof window.loadExecutionsData === 'function') {
                await window.loadExecutionsData();
            }
        },
        entityName: 'עסקה'
    });

  } catch (error) {
    console.error('Error updating execution:', error);
    if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון עסקה', error.message);
    }
  }
}

/**
 * אישור מחיקת עסקה
 */
async function confirmDeleteExecution(_id) {
  // confirmDeleteExecution called with id

  // אם לא קיבלנו ID כפרמטר, ננסה לקבל אותו מהטופס
  let executionId = _id;
  if (!executionId) {
    executionId = document.getElementById('deleteExecutionId').value;
    // Got id from form
  }

  // ביצועים לא צריכים בדיקת מקושרים - אין להם ילדים
  // Executions do not require linked items check - no children

  try {
    // Making DELETE request
    const response = await fetch(`/api/executions/${executionId}`, {
      method: 'DELETE',
    });
    // DELETE response status

    if (response.ok) {

      // ניקוי מטמון executions
      if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
        await window.UnifiedCacheManager.remove('executions');
        console.log('✅ מטמון executions נוקה אחרי מחיקה');
      }


      // סגירת המודל - לא נדרש כי אין מודל
      // Delete successful, no modal to close

      // הצגת הודעת הצלחה
      // Showing success notification for delete
      // window.showSuccessNotification exists check

      if (typeof window.showSuccessNotification === 'function') {
        // Calling showSuccessNotification
        window.showSuccessNotification('הצלחה', 'עסקה נמחקה בהצלחה מהמערכת', 4000, 'business');
      } else {
        handleSystemError(new Error('showSuccessNotification not available'), 'מערכת התראות');
      }

      // רענון הנתונים
      await loadExecutionsData();

    } else {
      const errorResponse = await response.text();
      handleDeleteError(new Error(errorResponse), 'עסקה');

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם השגיאה קשורה לפריטים מקושרים
        if (errorData.error && errorData.error.message &&
                    errorData.error.message.includes('linked items')) {

          // סגירת מודל המחיקה הרגיל - לא נדרש
          // Linked items found, no modal to close

          // הצגת מודל הפריטים המקושרים
          await showExecutionLinkedItemsModal(executionId, errorData);
          return;
        }

        handleDeleteError(new Error(errorData.error.message), 'עסקה');

      } catch {
        handleDeleteError(new Error(errorResponse), 'עסקה');
      }
    }

  } catch (error) {
    handleDeleteError(error, 'עסקה');
  }
}

// ========================================
// פונקציות מודל פריטים מקושרים
// ========================================

/**
 * הצגת מודל פריטים מקושרים
 * שימוש בפונקציה הגלובלית מ-linked-items.js
 */
async function showExecutionLinkedItemsModal(executionId, _errorData) {


  // מציאת העסקה לפי ID
  const execution = executionsData.find(e => e.id === executionId);
  if (!execution) {
    handleElementNotFound('execution', 'CRITICAL');
    return;
  }

  // טעינת נתונים מקושרים מהשרת
  try {
    const response = await fetch(`http://127.0.0.1:8080/api/executions/${executionId}/linked-items`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const linkedData = await response.json();


    // שימוש בפונקציה הגלובלית מ-linked-items.js
    if (typeof window.showLinkedItemsModal === 'function') {
      // הוספת פרטי העסקה לנתונים
      const enhancedData = {
        ...linkedData,
        executionId: execution.id,
        tradeId: execution.trade_id,
      };

      // קריאה לפונקציה הגלובלית
      window.showLinkedItemsModal(enhancedData, 'execution', executionId);
    } else {
      handleFunctionNotFound('showLinkedItemsModal', 'CRITICAL');
    }

  } catch (error) {
    handleDataLoadError(error, 'נתונים מקושרים');
  }
}

/**
 * פריטים מקושרים - Linked Items
 * ⚠️ הקובץ משתמש במערכת הכללית linked-items.js
 * 
 * במקום הפונקציות המקומיות שהוסרו, השתמש ב:
 * - window.loadLinkedItemsData('execution', executionId)
 * - window.showLinkedItemsModal(data, 'execution', executionId, 'view')
 * - window.viewLinkedItemsForExecution(executionId)
 */

/**
 * מעבר לניהול פריטים מקושרים
 */
function goToLinkedItems() {
  // סגירת המודל
  const modal = bootstrap.Modal.getInstance(linkedItemsModalElement);
  modal.hide();

  // מעבר לדף הניהול הרלוונטי (לפי הפריט הראשון שנמצא)
  window.location.href = '/trade_plans'; // ברירת מחדל - דף תכנון
}

/**
 * מעבר לטרייד ספציפי
 */
function goToTrade(tradeId) {
  window.location.href = `/trade_plans#trade-${tradeId}`;
}

/**
 * מעבר לתכנון ספציפי
 */
function goToPlan(planId) {
  window.location.href = `/trade_plans#plan-${planId}`;
}

/**
 * מעבר להתראה ספציפית
 */
function goToAlert(alertId) {
  window.location.href = `/alerts#alert-${alertId}`;
}

/**
 * מעבר להערה ספציפית
 */
function goToNote(noteId) {
  window.location.href = `/notes#note-${noteId}`;
}

// ========================================
// פונקציות עזר
// ========================================

// showNotification מיוצאת מקובץ ui-utils.js

/**
 * טעינת נתוני עסקעות
 */
async function loadExecutionsData() {
  // loadExecutionsData called
  try {
    // טעינת נתוני עסקעות

    const response = await fetch('/api/executions/?_t=' + Date.now());
    if (response.ok) {
      const data = await response.json();
      executionsData = data.data || data;
      // נטענו עסקעות

      // בדיקה אם יש פילטרים פעילים
      if (window.headerSystem && window.headerSystem.currentFilters) {
        const filters = window.headerSystem.currentFilters;
        const hasActiveFilters = filters.status && filters.status.length > 0 ||
                    filters.type && filters.type.length > 0 ||
                    filters.account && filters.account.length > 0 ||
                    filters.dateRange && filters.dateRange !== '' ||
                    filters.search && filters.search !== '';

        if (hasActiveFilters) {
          // יש פילטרים פעילים, מסנן נתונים מקומית
          const filteredData = filterExecutionsLocally(
            executionsData,
            filters.status,
            filters.type,
            filters.account,
            filters.dateRange,
            filters.search,
          );
          updateExecutionsTableMain(filteredData);
          return;
        }
      }

      // עדכון הטבלה
      updateExecutionsTableMain(executionsData);

    } else {
      const errorText = await response.text();
      handleDataLoadError(new Error(`סטטוס: ${response.status} - ${errorText}`), 'עסקעות');
      handleDataLoadError(new Error(`סטטוס: ${response.status} - ${errorText}`), 'עסקעות');
    }

  } catch (error) {
    handleDataLoadError(error, 'עסקעות');
  }
}

/**
 * עדכון טבלת עסקעות
 */
async function updateExecutionsTableMain(executions) {
  // updateExecutionsTableMain called with executions
  const tbody = document.querySelector('#executionsTable tbody');
  if (!tbody) {
    // // console.warn('⚠️ executionsTable tbody not found - this is expected on trades page');
    return;
  }

  if (executions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">לא נמצאו עסקעות</td></tr>';
    return;
  }

  // קבלת צבעים מהמערכת הגלובלית
  const colors = window.getTableColors ? window.getTableColors() : {
    positive: '#28a745',
    negative: '#dc3545',
    secondary: '#6c757d'
  };
  const positiveColor = colors.positive;
  const negativeColor = colors.negative;
  const secondaryColor = colors.secondary;
  
  // קבלת צבעי רקע ומסגרת לערכי חיובי/שלילי
  const positiveBgColor = window.getNumericValueColor ? window.getNumericValueColor(1, 'light') : 'rgba(40, 167, 69, 0.1)';
  const positiveBorderColor = window.getNumericValueColor ? window.getNumericValueColor(1, 'border') : 'rgba(40, 167, 69, 0.3)';
  const negativeBgColor = window.getNumericValueColor ? window.getNumericValueColor(-1, 'light') : 'rgba(220, 53, 69, 0.1)';
  const negativeBorderColor = window.getNumericValueColor ? window.getNumericValueColor(-1, 'border') : 'rgba(220, 53, 69, 0.3)';

  // טעינת נתוני טריידים וטיקרים
  let trades = [];
  let tickers = [];

  try {
    const [tradesResponse, tickersResponse] = await Promise.all([
      fetch('/api/trades/').then(r => {
        if (r.ok) {
          return r.json();
        } else {
          // // console.warn('⚠️ Trades API returned error:', r.status);
          return { data: [] };
        }
      }).catch(() => ({ data: [] })),
      fetch('/api/tickers/').then(r => {
        if (r.ok) {
          return r.json();
        } else {
          // // console.warn('⚠️ Tickers API returned error:', r.status);
          return { data: [] };
        }
      }).catch(() => ({ data: [] })),
    ]);

    trades = tradesResponse.data || [];
    tickers = tickersResponse.data || [];

    // וידוא שהנתונים הם מערכים
    if (!Array.isArray(trades)) {
      // // console.warn('⚠️ trades אינו מערך:', trades);
      trades = [];
    }
    if (!Array.isArray(tickers)) {
      // // console.warn('⚠️ tickers אינו מערך:', tickers);
      tickers = [];
    }

    // נטענו טריידים וטיקרים
  } catch {
    // // console.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error);
    trades = [];
    tickers = [];
  }

  tbody.innerHTML = executions.map(execution => {
    // שימוש בנתונים החדשים - תמיכה בשיוך גמיש
    const linkedDisplay = execution.linked_display || execution.trade_display || execution.ticker_symbol || 'לא מוגדר';
    const linkedType = execution.linked_type || 'trade'; // ברירת מחדל לתאימות לאחור
    const linkedId = execution.linked_id || execution.trade_id || execution.ticker_id;
    
    // סימבול לתצוגה - לפי סוג השיוך
    const symbol = linkedType === 'ticker' ? 
      execution.ticker_symbol || execution.trade_ticker_symbol || 'לא מוגדר' : 
      execution.trade_ticker_symbol || execution.ticker_symbol || 'לא מוגדר';
    
    const accountName = execution.account_name || execution.trading_account_name || 'לא מוגדר';

    // Determine a safe tickerId to use for links (may be null)
    const tickerIdSafe = (linkedType === 'ticker' && linkedId)
      ? linkedId
      : (() => {
          const symbolForLookup = execution.trade_ticker_symbol || execution.ticker_symbol || symbol;
          const found = Array.isArray(tickers) ? tickers.find(t => t.symbol === symbolForLookup) : null;
          return found ? found.id : null;
        })();

    // Build click attributes safely (omit onclick when tickerId is unavailable)
    const tickerClickAttr = (tickerIdSafe !== null && tickerIdSafe !== undefined)
      ? `onclick="window.showEntityDetailsModal && window.showEntityDetailsModal('ticker', ${tickerIdSafe}, 'view')"`
      : '';
    const tickerItemsClickAttr = (tickerIdSafe !== null && tickerIdSafe !== undefined)
      ? `onclick="window.viewLinkedItemsForTicker && window.viewLinkedItemsForTicker(${tickerIdSafe})"`
      : '';

    // שימוש ב-FieldRendererService לעיצוב שדות
    const actionBadge = window.FieldRendererService ? 
      window.FieldRendererService.renderAction(execution.action || execution.type) : 
      `<span class="${(execution.action || execution.type) === 'buy' ? 'profit-positive' : 'profit-negative'}">${(execution.action || execution.type) === 'buy' ? 'קניה' : 'מכירה'}</span>`;

    const dateBadge = window.FieldRendererService ? 
      window.FieldRendererService.renderDate(execution.date || execution.execution_date) : 
      (execution.date || execution.execution_date ? new Date(execution.date || execution.execution_date).toLocaleDateString('he-IL') : '-');

    // P&L - טרם הוטמע (TODO: חישוב P&L אמיתי)
    // בקניה: ריק
    // במכירה: N/A (ממתין להטמעה)
    const isSell = (execution.action || execution.type) === 'sell' || (execution.action || execution.type) === 'sale';
    const plBadge = isSell ? '<span class="text-muted fw-bold">N/A</span>' : '-';

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = (execution.action || execution.type) === 'buy' ? 'קנייה' :
      (execution.action || execution.type) === 'sale' ? 'מכירה' :
        execution.action || execution.type;

    return `
            <tr data-execution-id="${execution.id}">
                <td class="ticker-cell">
                    <div class="ticker-cell-content d-flex align-items-center gap-1" style="white-space: nowrap; flex-direction: row-reverse;">
                        <strong class="ticker-symbol-link ${execution.action === 'buy' ? 'action-buy' : 'action-sell'}" 
                          ${tickerClickAttr}
                          title="פתח פרטי סימבול">${symbol}</strong>
                        <button class="btn btn-sm btn-info" 
                          ${tickerItemsClickAttr}
                          title="פריטים מקושרים לטיקר" style="padding: 2px 6px; font-size: 0.75rem;">🔗</button>
                    </div>
                </td>
                <td class="type-cell" data-type="${typeForFilter}">${actionBadge}</td>
                <td data-account="${accountName}" class="account-cell-link" 
                  onclick="window.showEntityDetailsModal && window.showEntityDetailsModal('account', '${accountName}', 'view')" 
                  title="פתח פרטי חשבון">${accountName}</td>
                <td>${window.FieldRendererService ? window.FieldRendererService.renderShares(execution.quantity) : (execution.quantity ? '#' + execution.quantity : '-')}</td>
                <td>$${execution.price}</td>
                <td class="linked-cell">
                    ${linkedType === 'trade' ? 
                        `<span class="linked-badge entity-trade" 
                              onclick="window.location.href='/trades?highlight=${linkedId}'" 
                              style="cursor: pointer;" 
                              title="לחץ לפתיחת הטרייד">
                            ${linkedDisplay}
                        </span>` : 
                        `<span class="linked-badge entity-ticker pending-assignment" 
                              title="עסקה ממתינה לשיוך לטרייד - לחץ לעריכה" 
                              onclick="editExecution(${execution.id})" 
                              style="cursor: pointer;">
                            ${linkedDisplay}
                        </span>`
                    }
                </td>
                <td class="pl-cell">${plBadge}</td>
                <td data-date="${execution.date || execution.execution_date}">${dateBadge}</td>
                <td class="source-cell">${execution.source || '-'}</td>
                <td class="col-actions actions-cell">
                    ${window.createActionsMenu ? window.createActionsMenu([
                        window.createLinkButton ? window.createLinkButton(`viewLinkedItemsForExecution(${execution.id})`) : '',
                        window.createEditButton ? window.createEditButton(`editExecution(${execution.id})`) : '',
                        window.createButton ? window.createButton('VIEW', `showExecutionDetails(${execution.id})`) : '',
                        window.createDeleteButton ? window.createDeleteButton(`deleteExecution(${execution.id})`) : ''
                    ], execution.id) : ''}
                </td>
            </tr>
        `;
  }).join('');

  // עדכון הספירה
  const countElement = document.querySelector('.table-count');
  if (countElement) {
    countElement.textContent = `${executions.length} עסקעות`;
  }

  // עדכון ה-info-summary
  updateExecutionsSummary(executions);

  // Table update completed successfully
  // === END UPDATE EXECUTIONS TABLE ===
}

// פונקציה formatDate מוגדרת בקובץ main.js

// פונקציה לבדיקה אם תאריך נמצא בטווח
function isDateInRange(dateString, dateRange) {
  // isDateInRange called

  if (!dateString || !dateRange || dateRange === 'כל זמן') {
    return true;
  }

  // חילוץ התאריך בלבד (ללא שעה)
  let dateOnly = dateString;
  if (dateString.includes(' ')) {
    dateOnly = dateString.split(' ')[0];
  }

  const date = new Date(dateOnly);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // סוף היום

  // Parsed date
  // Today

  switch (dateRange) {
  case 'היום': {
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    return date >= startOfDay && date <= today;
  }

  case 'אתמול': {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);
    return date >= startOfYesterday && date <= endOfYesterday;
  }

  case 'שבוע': {
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo && date <= today;
  }

  case 'השבוע': {
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek && date <= today;
  }

  case 'MTD': {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return date >= startOfMonth && date <= today;
  }

  case 'YTD': {
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    return date >= startOfYear && date <= today;
  }

  case 'שנה': {
    const yearAgo = new Date(today);
    yearAgo.setDate(yearAgo.getDate() - 365);
    return date >= yearAgo && date <= today;
  }

  default:
    return true;
  }
}

// הגדרת הפונקציה כגלובלית
window.isDateInRange = isDateInRange;

// פונקציית פילטור מקומי לעסקאות
function filterExecutionsLocally(executions, selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm) {
  // filterExecutionsLocally called

  if (!executions || !Array.isArray(executions)) {
    // // console.warn('⚠️ No executions data to filter');
    return [];
  }

  let filtered = executions;

  // פילטר לפי סטטוס
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('הכול')) {
    filtered = filtered.filter(execution => {
      const status = execution.status || 'לא מוגדר';
      return selectedStatuses.includes(status);
    });
  }

  // פילטר לפי סוג
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('הכול')) {
    filtered = filtered.filter(execution => {
      const type = execution.type || execution.action || 'לא מוגדר';
      const typeHebrew = type === 'buy' ? 'קנייה' : type === 'sell' ? 'מכירה' : type;
      return selectedTypes.includes(typeHebrew);
    });
  }

  // פילטר לפי חשבון
  if (selectedAccounts && selectedAccounts.length > 0 && !selectedAccounts.includes('הכול')) {
    filtered = filtered.filter(execution => {
      const account = execution.account_name || 'לא מוגדר';
      return selectedAccounts.includes(account);
    });
  }

  // פילטר לפי תאריך - עובד מול שדה created_at (תאריך יצירה)
  if (dateRange && dateRange !== 'כל זמן') {
    // Applying date filter
    filtered = filtered.filter(execution => {
      const executionDate = execution.created_at; // תאריך יצירה בלבד
      // Checking execution created_at

      if (!executionDate) {
        // No created_at found, including in results
        return true;
      }

      // חילוץ התאריך בלבד (ללא שעה)
      let dateOnly = executionDate;
      if (executionDate.includes(' ')) {
        dateOnly = executionDate.split(' ')[0];
      }

      const isInRange = isDateInRange(dateOnly, dateRange);
      // Created date in range check
      return isInRange;
    });
    // After date filter
  }

  // פילטר לפי חיפוש חופשי
  if (searchTerm && searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(execution =>
      execution.symbol && execution.symbol.toLowerCase().includes(searchLower) ||
                execution.account_name && execution.account_name.toLowerCase().includes(searchLower) ||
                execution.notes && execution.notes.toLowerCase().includes(searchLower) ||
                execution.execution_date && execution.execution_date.toLowerCase().includes(searchLower),
    );
  }

  // Filtered executions
  return filtered;
}

// הגדרת הפונקציה כגלובלית
window.filterExecutionsLocally = filterExecutionsLocally;

// הגדרת הפונקציות כגלובליות
window.openExecutionDetails = openExecutionDetails;
window.editExecution = editExecution;
window.deleteExecution = deleteExecution;

/**
 * פונקציה לסגירה/פתיחה של executions-section
 */
// toggleExecutionsSection function removed - using global toggleSection('executions') instead

// restoreExecutionsSectionState function removed - using global toggleSection system instead

// פונקציה לסגירה/פתיחה של top-section

// פונקציה לאיפוס פילטרים וטעינה מחדש
// resetAllFiltersAndReloadData() - לא בשימוש, הוסרה

// פונקציות מודלים
window.showAddExecutionModal = showAddExecutionModal;
window.showEditExecutionModal = showEditExecutionModal;
// window.showDeleteExecutionModal = showDeleteExecutionModal; // הוסר - שימוש במערכת הגלובלית
// Export validation functions
window.validateExecutionForm = validateExecutionForm;
window.validateEditExecutionForm = validateEditExecutionForm;

// Export save/update functions
window.saveExecution = saveExecution;
window.updateExecution = updateExecution;
window.confirmDeleteExecution = confirmDeleteExecution;

// Old validation functions removed - now using validateExecutionForm() and validateEditExecutionForm()

// פונקציות מודל פריטים מקושרים
window.showExecutionLinkedItemsModal = showExecutionLinkedItemsModal;
// Removed non-existent function exports - these are in linked-items.js
window.goToNote = goToNote;

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת עסקעות
 * @param {number} columnIndex - אינדקס העמודה לסידור
 *
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת נכס
 * sortTable(2); // סידור לפי עמודת פעולה
 * sortTable(8); // סידור לפי עמודת תאריך יצירה
 *
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */

/**
 * טעינת צבעים מההעדפות ויישום על הכותרות
 */
async function loadColorsAndApplyToHeaders() {
  try {
    // המתן לאתחול UnifiedCacheManager אם הוא עדיין לא אותחל
    if (window.UnifiedCacheManager && !window.UnifiedCacheManager.initialized) {
      console.log('⏳ Waiting for UnifiedCacheManager initialization...');
      let attempts = 0;
      const maxAttempts = 50; // 5 שניות מקסימום
      
      while (!window.UnifiedCacheManager.initialized && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!window.UnifiedCacheManager.initialized) {
        console.warn('⚠️ UnifiedCacheManager initialization timeout, proceeding with fallback');
      } else {

      }
    }

    // נסה לטעון העדפות ראשית, ואז fallback
    if (!window.currentPreferences) {
      if (window.preferences && window.preferences.loadPreferences) {
        await window.preferences.loadPreferences();

      } else if (window.loadPreferences) {
        await window.loadPreferences();

      }
    }

    // טעינת צבעים מההעדפות
    if (window.loadEntityColorsFromPreferences && window.currentPreferences) {
      window.loadEntityColorsFromPreferences(window.currentPreferences);

    }

    // יישום צבעי ישות על כותרות
    if (window.applyEntityColorsToHeaders) {
      window.applyEntityColorsToHeaders('execution');
    }
  } catch (error) {
    console.error('שגיאה בטעינת צבעים:', error);
  }
}

// הגדרת הפונקציה כגלובלית
// window.sortTable export removed - using global version from tables.js

// אתחול הדף
// Second DOMContentLoaded removed - merged into initializeExecutionsPage

/**
 * הגדרת תצורות מודלים
 */
function setupModalConfigurations() {
  // הגדרת מודלים שלא נסגרים בלחיצה על הרקע
  const modals = [
    'addExecutionModal',
    'editExecutionModal',
    'deleteExecutionModal',
    'linkedItemsModal',
  ];

  modals.forEach(modalId => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      // הגדרת backdrop ל-true (סגירה בלחיצה על הרקע)
      modalElement.setAttribute('data-bs-backdrop', 'true');
      modalElement.setAttribute('data-bs-keyboard', 'true');
    }
  });
}

// ===== פונקציות לטעינת טיקרים וטריידים =====

/**
 * טעינת טיקרים עם טריידים ותכנונים בסטטוס פתוח או סגור
 */
async function loadTickersWithOpenOrClosedTradesAndPlans() {
  // Loading tickers with open or closed trades and plans

  try {
    // שימוש בפונקציה החדשה - הצג טיקרים עם טריידים ותכנונים בסטטוס פתוח או סגור
    // Loading tickers with open or closed trades and plans
    const relevantTickers = await window.tickerService.getTickersWithOpenOrClosedTradesAndPlans({
      useCache: true,
    });

    // Relevant tickers found
    // Relevant tickers

    // אם אין טיקרים רלוונטיים, הצג את כל הטיקרים
    const tickersToShow = relevantTickers.length > 0 ? relevantTickers : await window.tickerService.getTickers();
    // Showing tickers in dropdown

    // עדכון שדות ה-select
    window.tickerService.updateTickerSelect('addExecutionTicker', tickersToShow);
    window.tickerService.updateTickerSelect('editExecutionTicker', tickersToShow);

  } catch (error) {
    handleDataLoadError(error, 'טיקרים עם טריידים ותכנונים');
    // Fallback - טעינת כל הטיקרים
    try {
      const allTickers = await window.tickerService.getTickers();
      window.tickerService.updateTickerSelect('addExecutionTicker', allTickers);
      window.tickerService.updateTickerSelect('editExecutionTicker', allTickers);
    } catch (fallbackError) {
      handleDataLoadError(fallbackError, 'טיקרים (גיבוי)');
    }
  }
}

/**
 * הפעלה/השבתה של שדה מזהה חיצוני לפי בחירת מקור
 */


/**
 * הפעלת כל השדות אחרי בחירת טרייד/תכנון
 * @param {string} mode - 'add' או 'edit'
 */
function enableAllFields(mode = 'add') {
  const fields = [
    'Type',
    'Quantity',
    'Price',
    'Commission',
    'Date',
    'Notes',
  ];

  fields.forEach(field => {
    const fieldId = mode === 'add' ? `addExecution${field}` : `editExecution${field}`;
    const element = document.getElementById(fieldId);
    if (element) {
      element.disabled = false;
    }
  });

  // Enabled all fields for execution form
}

/**
 * טעינת טריידים לטיקר שנבחר
 * @param {string} mode - מצב ('add' או 'edit')
 * @param {boolean} showClosedTrades - האם להציג טריידים סגורים
 */
async function loadActiveTradesForTicker(mode = 'add', _showClosedTrades = false) {

  const tickerId = mode === 'add'
    ? document.getElementById('addExecutionTicker').value
    : document.getElementById('editExecutionTicker').value;

  if (!tickerId) {

    return;
  }

  // בדיקת הצ'קבוקס (אם לא הועבר כפרמטר)
  let showClosedTrades = _showClosedTrades;
  if (showClosedTrades === undefined) {
    showClosedTrades = mode === 'add'
      ? document.getElementById('addExecutionShowClosedTrades')?.checked || false
      : document.getElementById('editExecutionShowClosedTrades')?.checked || false;
  }

  try {
    // טעינת טריידים
    const tradesResponse = await fetch('/api/trades/');
    const tickerTradesData = await tradesResponse.json();
    const trades = tickerTradesData.data || tickerTradesData || [];

    // סינון טריידים לטיקר שנבחר
    let filteredTrades;

    if (showClosedTrades) {
      // הצג טריידים פעילים + טריידים סגורים
      const activeTrades = trades.filter(trade =>
        trade.ticker_id === parseInt(tickerId) && (trade.status === 'active' || trade.status === 'open'),
      );

      const closedTrades = trades.filter(trade =>
        trade.ticker_id === parseInt(tickerId) && (trade.status === 'closed' || trade.status === 'cancelled'),
      );

      filteredTrades = [...activeTrades, ...closedTrades];


    } else {
      // הצג רק טריידים פעילים
      filteredTrades = trades.filter(trade =>
        trade.ticker_id === parseInt(tickerId) && (trade.status === 'active' || trade.status === 'open'),
      );

    }

    // במצב עריכה, נוודא שהטרייד המקושר לעסקה נמצא ברשימה
    if (mode === 'edit') {
      const executionId = document.getElementById('editExecutionId')?.value;

      const currentExecution = executionsData.find(e => e.id === parseInt(executionId));

      if (currentExecution && currentExecution.trade_id) {

        const specificTrade = trades.find(trade => trade.id === currentExecution.trade_id);

        if (specificTrade) {
          // בדיקה אם הטרייד הספציפי כבר ברשימה
          const alreadyInList = filteredTrades.some(trade => trade.id === specificTrade.id);

          if (!alreadyInList) {
            // הוספת הטרייד הספציפי לרשימה
            filteredTrades.unshift(specificTrade);

          } else {

          }
        } else {

        }
      } else {

      }
    }


    // לוג נוסף לוודא שהטרייד המקושר נוסף
    if (mode === 'edit') {
      const executionId = document.getElementById('editExecutionId')?.value;
      const currentExecution = executionsData.find(e => e.id === parseInt(executionId));
      if (currentExecution && currentExecution.trade_id) {
        const tradeInList = filteredTrades.find(t => t.id === currentExecution.trade_id);
        if (tradeInList) {

        } else {

        }
      }
    }

    // עדכון שדה הטרייד
    const tradeSelect = mode === 'add'
      ? document.getElementById('addExecutionTradeId')
      : document.getElementById('editExecutionTradeId');

    if (tradeSelect) {
      tradeSelect.innerHTML = '<option value="">בחר טרייד...</option>';

      // הוספת טריידים
      filteredTrades.forEach(trade => {
        const option = document.createElement('option');
        option.value = trade.id; // מספר ישיר
        const statusText = trade.status === 'active' ? 'פעיל' :
          trade.status === 'closed' ? 'סגור' :
            trade.status === 'cancelled' ? 'בוטל' : trade.status;

        // עיבוד תאריך היצירה
        let creationDate = 'תאריך לא ידוע';
        if (trade.created_at) {
          try {
            const date = new Date(trade.created_at);
            creationDate = date.toLocaleDateString('he-IL');
          } catch {
            // // console.warn('⚠️ לא ניתן לעבד תאריך יצירה:', trade.created_at);
          }
        }

        option.textContent = `טרייד: ${trade.side} ${trade.investment_type} - ${creationDate} (${statusText})`;
        tradeSelect.appendChild(option);
      });

      // הפעלת השדה
      tradeSelect.disabled = false;
      // // console.log('✅ שדה טרייד עודכן:', filteredTrades.length, 'אפשרויות');
    }

  } catch (error) {
    // // console.error('❌ שגיאה בטעינת טריידים:', error);
    handleDataLoadError(error, 'טעינת טריידים לטיקר');
  }
}


/**
 * עדכון טריידים כאשר הצ'קבוקס משתנה
 * @param {string} mode - 'add' או 'edit'
 */
async function updateTradesOnCheckboxChange(mode = 'add') {
  // // console.log('🔄 עדכון טריידים לפי צ\'קבוקס, מצב:', mode);

  try {
    // בדיקת הצ'קבוקס
    const showClosedTrades = mode === 'add'
      ? document.getElementById('addExecutionShowClosedTrades')?.checked || false
      : document.getElementById('editExecutionShowClosedTrades')?.checked || false;


    // קבלת הטיקר הנבחר
    const tickerSelect = mode === 'add'
      ? document.getElementById('addExecutionTicker')
      : document.getElementById('editExecutionTicker');

    const tickerId = tickerSelect?.value;

    // תמיד עדכן את רשימת הטיקרים כשהצ'קבוקס משתנה
    await updateTickersList(mode, showClosedTrades);

    if (tickerId) {
      // עדכון הטריידים לטיקר הנבחר
      await loadActiveTradesForTicker(mode, showClosedTrades);
    }

  } catch (error) {
    // // console.error('❌ שגיאה בעדכון טריידים:', error);
    handleDataLoadError(error, 'עדכון טריידים לפי צ\'קבוקס');
  }
}

/**
 * עדכון טריידים כאשר הטיקר משתנה
 * @param {string} mode - 'add' או 'edit'
 */
async function updateTradesOnTickerChange(mode = 'add') {

  try {
    // בדיקת הצ'קבוקס הנוכחי
    const showClosedTrades = mode === 'add'
      ? document.getElementById('addExecutionShowClosedTrades')?.checked || false
      : document.getElementById('editExecutionShowClosedTrades')?.checked || false;

    // עדכון הטריידים לטיקר הנבחר
    await loadActiveTradesForTicker(mode, showClosedTrades);

  } catch (error) {
    // console.error('❌ שגיאה בעדכון טריידים:', error);
    handleDataLoadError(error, 'עדכון טריידים לפי שינוי טיקר');
  }
}

/**
 * מעבר לדף טיקר (בפיתוח)
 * @param {string} symbol - סמל הטיקר
 */
function goToTickerPage(_symbol) {
  // מעבר לדף טיקר
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'מעבר לדף טיקר - בפיתוח');
  } else {
    // מעבר לדף טיקר - בפיתוח
  }
  // TODO: ניתוב לדף טיקר - ראה: CENTRAL_TASKS_TODO.md (משימה 1)
}


/**
 * הצגת עזרה לבחירת טיקר
 */
function showTickerHelp() {
  // הצגת עזרה לבחירת טיקר
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'בדוק אם יש לך תכנון או טרייד לטיקר שאתה מחפש. אם עדיין אין - הוסף טיקר');
  } else {
    // בדוק אם יש לך תכנון או טרייד לטיקר שאתה מחפש. אם עדיין אין - הוסף טיקר
  }
}

/**
 * הוספת טיקר חדש
 */
function addNewTicker() {
  // הוספת טיקר חדש
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'הוספת טיקר - בפיתוח');
  } else {
    // הוספת טיקר - בפיתוח
  }
  // TODO: פתיחת מודל הוספת טיקר - ראה: CENTRAL_TASKS_TODO.md (משימה 2)
}

/**
 * הוספת תכנון חדש
 */
function addNewPlan() {
  // הוספת תכנון חדש
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'הוספת תכנון - בפיתוח');
  } else {
    // הוספת תכנון - בפיתוח
  }
  // TODO: פתיחת מודל הוספת תכנון - ראה: CENTRAL_TASKS_TODO.md (משימה 3)
}

/**
 * הוספת טרייד חדש
 */
function addNewTrade() {
  // הוספת טרייד חדש
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'הוספת טרייד - בפיתוח');
  } else {
    // הוספת טרייד - בפיתוח
  }
  // TODO: פתיחת מודל הוספת טרייד - ראה: CENTRAL_TASKS_TODO.md (משימה 4)
}

/**
 * עדכון סיכום נתונים לעסקעות
 * @param {Array} executions - מערך העסקעות
 */
function updateExecutionsSummary(executions) {
  // עדכון סיכום נתונים לעסקעות

  // בדיקה אם האלמנטים קיימים בדף
  const totalExecutionsElement = document.getElementById('totalExecutions');
  const totalBuyExecutionsElement = document.getElementById('totalBuyExecutions');
  const totalSellExecutionsElement = document.getElementById('totalSellExecutions');
  const totalBuyAmountElement = document.getElementById('totalBuyAmount');
  const totalSellAmountElement = document.getElementById('totalSellAmount');
  const balanceAmountElement = document.getElementById('balanceAmount');

  if (!totalExecutionsElement || !totalBuyExecutionsElement || !totalSellExecutionsElement ||
        !totalBuyAmountElement || !totalSellAmountElement || !balanceAmountElement) {
    // console.warn('⚠️ Executions summary elements not found - this is expected on trades page');
    return;
  }

  if (!executions || executions.length === 0) {
    // איפוס ערכים
    totalExecutionsElement.textContent = '0';
    totalBuyExecutionsElement.textContent = '0';
    totalSellExecutionsElement.textContent = '0';
    totalBuyAmountElement.textContent = '$0';
    totalSellAmountElement.textContent = '$0';
    balanceAmountElement.textContent = '$0';
    return;
  }

  // חישוב סיכומים
  const totalExecutions = executions.length;

  // הפרדה בין קניות למכירות
  const buyExecutions = executions.filter(exec => (exec.action || exec.type) === 'buy');
  const sellExecutions = executions.filter(exec => (exec.action || exec.type) === 'sale');

  const totalBuyExecutions = buyExecutions.length;
  const totalSellExecutions = sellExecutions.length;

  // חישוב סכומי קניות ומכירות
  const totalBuyAmount = buyExecutions.reduce((sum, exec) => {
    const quantity = parseInt(exec.quantity) || 0;
    const price = parseFloat(exec.price) || 0;
    return sum + quantity * price;
  }, 0);

  const totalSellAmount = sellExecutions.reduce((sum, exec) => {
    const quantity = parseInt(exec.quantity) || 0;
    const price = parseFloat(exec.price) || 0;
    return sum + quantity * price;
  }, 0);

  // חישוב מאזן (מכירות - קניות)
  const balance = totalSellAmount - totalBuyAmount;

  // עדכון ה-DOM עם פורמט מספרים
  totalExecutionsElement.textContent = window.formatNumberWithCommas ? window.formatNumberWithCommas(totalExecutions) : totalExecutions.toLocaleString('he-IL');
  totalBuyExecutionsElement.textContent = window.formatNumberWithCommas ?
    window.formatNumberWithCommas(totalBuyExecutions) :
    totalBuyExecutions.toLocaleString('he-IL');
  totalSellExecutionsElement.textContent = window.formatNumberWithCommas ?
    window.formatNumberWithCommas(totalSellExecutions) :
    totalSellExecutions.toLocaleString('he-IL');
  totalBuyAmountElement.textContent = window.formatCurrencyWithCommas ?
    window.formatCurrencyWithCommas(totalBuyAmount) :
    `$${totalBuyAmount.toFixed(2)}`;
  totalSellAmountElement.textContent = window.formatCurrencyWithCommas ?
    window.formatCurrencyWithCommas(totalSellAmount) :
    `$${totalSellAmount.toFixed(2)}`;

  // שימוש בפונקציה הכללית לצביעה
  const balanceElement = balanceAmountElement;

  // קבלת צבעים מהמערכת הגלובלית
  const colors = window.getTableColors ? window.getTableColors() : {
    positive: '#28a745',
    negative: '#dc3545',
    secondary: '#6c757d'
  };

  // צביעה ידנית
  balanceElement.textContent = `$${balance.toFixed(2)}`;
  if (balance > 0) {
    balanceElement.style.color = colors.positive;
  } else if (balance < 0) {
    balanceElement.style.color = colors.negative;
  } else {
    balanceElement.style.color = colors.secondary;
  }

  // סיכום נתונים עודכן
}

// הגדרת הפונקציות כגלובליות
window.loadTickersWithOpenOrClosedTradesAndPlans = loadTickersWithOpenOrClosedTradesAndPlans;
// window.loadTickersWithClosedTrades = loadTickersWithClosedTrades; // פונקציה לא קיימת
window.loadActiveTradesForTicker = loadActiveTradesForTicker;
window.enableAllFields = enableAllFields;
// window.toggleExternalIdField = toggleExternalIdField; // פונקציה לא קיימת
window.resetAddExecutionForm = resetAddExecutionForm;
window.resetEditExecutionForm = resetEditExecutionForm;
window.updateTradesOnCheckboxChange = updateTradesOnCheckboxChange;
window.updateTradesOnTickerChange = updateTradesOnTickerChange;
window.goToTickerPage = goToTickerPage;
window.updateExecutionsSummary = updateExecutionsSummary;
window.showTickerHelp = showTickerHelp;
window.addNewTicker = addNewTicker;
window.addNewPlan = addNewPlan;
window.addNewTrade = addNewTrade;

/**
 * חישוב ערכים מחושבים לטופס הוספה
 */
function calculateAddExecutionValues() {
  const quantity = parseFloat(document.getElementById('executionQuantity').value) || 0;
  const price = parseFloat(document.getElementById('executionPrice').value) || 0;

  const total = quantity * price;

  // אין אלמנט total במודל הנוכחי - נסיר את זה
  // document.getElementById('addExecutionTotal').textContent = `$${total.toFixed(2)}`;
}

/**
 * חישוב ערכים מחושבים לטופס עריכה
 */
function calculateEditExecutionValues() {
  const quantity = parseFloat(document.getElementById('editExecutionQuantity').value) || 0;
  const price = parseFloat(document.getElementById('editExecutionPrice').value) || 0;
  const commission = parseFloat(document.getElementById('editExecutionCommission').value) || 0;

  const total = quantity * price + commission;

  document.getElementById('editExecutionTotal').textContent = `$${total.toFixed(2)}`;
}

// הגדרת הפונקציות כגלובליות
window.calculateAddExecutionValues = calculateAddExecutionValues;
window.calculateEditExecutionValues = calculateEditExecutionValues;

/**
 * מעבר לטרייד המקושר
 * @param {string} mode - 'add' או 'edit'
 */
function goToLinkedTrade(mode = 'edit') {
  const tradeId = mode === 'add'
    ? document.getElementById('addExecutionTradeId').value
    : document.getElementById('editExecutionTradeLink').getAttribute('data-trade-id');

  if (tradeId) {
    // Going to trade
    // סגירת המודל
    const modalId = mode === 'add' ? 'addExecutionModal' : 'editExecutionModal';
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
      modal.hide();
    }

    // מעבר לדף הטריידים
    window.location.href = `/trades?highlight=${tradeId}`;
  } else {
    handleElementNotFound('trade ID', 'CRITICAL');
  }
}

// הגדרת הפונקציה כגלובלית
window.goToLinkedTrade = goToLinkedTrade;

// ========================================
// פונקציות שהועברו מ-trades.js
// ========================================

/**
 * טעינת עסקאות לטרייד
 * @param {number} tradeId - מזהה הטרייד
 */
function loadTradeExecutions(_tradeId) {
  // טעינת עסקאות לטרייד

  try {
    // כאן תהיה קריאה לשרת לטעינת העסקאות
    // כרגע נציג נתוני דוגמה

    // לא צריך לעדכן טבלה בדף executions (זו פונקציה למודל עריכת טרייד)
    // loadTradeExecutions called on executions page - no action needed
    // loadTradeExecutions completed successfully
  } catch (error) {
    handleDataLoadError(error, 'עסקאות לטרייד');
  }
}

/**
 * עדכון טבלת העסקאות במודל עריכת טרייד
 * @param {Array} executions - מערך העסקאות
 */
function updateExecutionsTableForTradeModal(executions) {
  // updateExecutionsTableForTradeModal called

  // בדיקה אם אנחנו בדף trades או בדף executions
  const currentPath = window.location.pathname;
  const isTradesPage = currentPath === '/trades' || currentPath.includes('trades');

  if (isTradesPage) {
    // בדף trades - עדכון טבלת העסקאות במודל העריכה
    const tableBody = document.getElementById('editTradeExecutionsTable');
    if (!tableBody) {
      // console.warn('⚠️ editTradeExecutionsTable element not found on trades page');
      return;
    }

    tableBody.innerHTML = '';

    executions.forEach(execution => {
      const row = document.createElement('tr');

      // שימוש ב-FieldRendererService לעיצוב אחיד
      const typeBadge = window.FieldRendererService ? 
        window.FieldRendererService.renderSide(execution.type === 'buy' ? 'long' : 'short') :
        (execution.type === 'buy' ? '<span class="badge bg-success">קניה</span>' : '<span class="badge bg-danger">מכירה</span>');

      const statusBadge = window.FieldRendererService ? 
        window.FieldRendererService.renderStatus(execution.status, 'execution') :
        (execution.status === 'completed' ? '<span class="badge bg-success">הושלם</span>' : '<span class="badge bg-warning">ממתין</span>');

      row.innerHTML = `
                <td>${execution.date}</td>
                <td>${typeBadge}</td>
                <td>${execution.quantity}</td>
                <td>$${execution.price.toFixed(2)}</td>
                <td>$${execution.commission.toFixed(2)}</td>
                <td>$${execution.total.toFixed(2)}</td>
                <td>${statusBadge}</td>
            `;

      tableBody.appendChild(row);
    });

    // updateExecutionsTable completed for trades page
  } else {
    // בדף executions - לא צריך לעדכן טבלה זו (זו פונקציה למודל עריכת טרייד)
    // updateExecutionsTableForTradeModal called on executions page - no action needed
  }
}

/**
 * הוספת קניה/מכירה במודל עריכת טרייד
 */
function addEditBuySell() {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'פונקציונליות הוספת קניה/מכירה נמצאת בפיתוח');
  } else {
    // פונקציונליות הוספת קניה/מכירה נמצאת בפיתוח
  }
}

/**
 * שיוך עסקה קיימת לטרייד
 */
function linkExistingExecution() {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'פונקציונליות שיוך עסקה קיימת נמצאת בפיתוח');
  } else {
    // פונקציונליות שיוך עסקה קיימת נמצאת בפיתוח
  }
}

/**
 * ביטול שיוך עסקה מטרייד
 */
function unlinkExecution() {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'פונקציונליות ביטול שיוך עסקה נמצאת בפיתוח');
  } else {
    // פונקציונליות ביטול שיוך עסקה נמצאת בפיתוח
  }
}

// הגדרת הפונקציות כגלובליות
window.loadTradeExecutions = loadTradeExecutions;
window.updateExecutionsTableMain = updateExecutionsTableMain;
window.updateExecutionsTableForTradeModal = updateExecutionsTableForTradeModal;
window.addEditBuySell = addEditBuySell;
window.linkExistingExecution = linkExistingExecution;
window.unlinkExecution = unlinkExecution;

// הגדרת פונקציות פילטר כגלובליות
window.filterExecutionsByAccount = window.filterExecutionsByAccount || function() {};
window.searchExecutions = window.searchExecutions || function() {};
window.resetExecutionsFilters = window.resetExecutionsFilters || function() {};

// פונקציה זו הוסרה - כפילות עם הפונקציה הראשונה

// ========================================
// אתחול וולידציה
// ========================================

// אתחול הדף
// Third DOMContentLoaded removed - merged into initializeExecutionsPage
async function _initializeExecutionsPageValidation() {
  // שחזור מצב הסגירה - handled by unified system finalization stage
  // No need - unified system handles this
  
  // Fallback for backward compatibility
  if (typeof window.restoreAllSectionStates === 'function') {
    // Already handled by system
  } else {
    // console.warn('⚠️ restoreAllSectionStates function not available, using fallback');
    // Fallback: restore top section state manually with UnifiedCacheManager support
    let topSectionHidden = false;
    
    if (window.UnifiedCacheManager?.isInitialized()) {
      try {
        const savedState = await window.UnifiedCacheManager.get('executionsTopSectionCollapsed', {
          layer: 'localStorage'
        });
        topSectionHidden = savedState === 'true' || savedState === true;
      } catch (err) {
        topSectionHidden = localStorage.getItem('executionsTopSectionCollapsed') === 'true';
      }
    } else {
      topSectionHidden = localStorage.getItem('executionsTopSectionCollapsed') === 'true';
    }
    
    const topSection = document.querySelector('.top-section .section-body');
    const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleSection"]');
    const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;

    if (topSection && topIcon) {
      if (topSectionHidden) {
        topSection.style.display = 'none';
        topIcon.textContent = '▼';
      } else {
        topSection.style.display = 'block';
        topIcon.textContent = '▲';
      }
    }
  }

  // אתחול וולידציה עם כללים מותאמים לביצועים
  if (window.initializeValidation) {
    // כללי וולידציה מותאמים לטופס הוספת ביצוע
    const addExecutionValidationRules = {
      trade_id: {
        required: true,
        message: 'יש לבחור טרייד',
      },
      action: {
        required: true,
        enum: ['buy', 'sell'],
        message: 'יש לבחור פעולה תקינה',
      },
      quantity: {
        required: true,
        min: 0.01,
        message: 'יש להזין כמות חיובית',
      },
      price: {
        required: true,
        min: 0.01,
        message: 'יש להזין מחיר חיובי',
      },
    };

    // כללי וולידציה מותאמים לטופס עריכת ביצוע
    const editExecutionValidationRules = {
      trade_id: {
        required: true,
        message: 'יש לבחור טרייד',
      },
      action: {
        required: true,
        enum: ['buy', 'sell'],
        message: 'יש לבחור פעולה תקינה',
      },
      quantity: {
        required: true,
        min: 0.01,
        message: 'יש להזין כמות חיובית',
      },
      price: {
        required: true,
        min: 0.01,
        message: 'יש להזין מחיר חיובי',
      },
    };

    window.initializeValidation('addExecutionForm', addExecutionValidationRules);
    window.initializeValidation('editExecutionForm', editExecutionValidationRules);
  }

  // Executions page initialized successfully
} // End of _initializeExecutionsPageValidation

// בדיקה שהפונקציות נטענו בהצלחה

//   loadTradeExecutions: typeof loadTradeExecutions,
//   updateExecutionsTableMain: typeof updateExecutionsTableMain,
//   updateExecutionsTableForTradeModal: typeof updateExecutionsTableForTradeModal,
//   addEditBuySell: typeof addEditBuySell,
//   linkExistingExecution: typeof linkExistingExecution,
//   unlinkExecution: typeof unlinkExecution,
// });

// ===== מערכת פילטרים לעמוד הביצועים =====

// הגדרת פונקציות פילטר
function setupExecutionsFilterFunctions() {
  // Setting up executions filter functions

  // שימוש במערכת הפילטרים הגלובלית - לא מעבירים פונקציה, רק מתחברים למערכת
  if (typeof window.applyTableFilter === 'function') {
    // רישום הפונקציות הגלובליות למערכת הפילטרים
    window.executionsFilterFunctions = {
      updateTable(filteredData) {
        updateExecutionsTableMain(filteredData);
        updateExecutionsSummary(filteredData);
      },
    };
  }

  // פונקציה לפילטר חשבון
  window.filterExecutionsByAccount = function(accountNames) {
    // Filtering executions by account names

    const namesArray = Array.isArray(accountNames) ? accountNames : [accountNames];

    // בדיקה אם זה "הכול" או רשימה ריקה
    if (namesArray.length === 0 || namesArray.includes('all') || namesArray.includes('הכול')) {
      filteredExecutions = [...originalExecutions];
      // Showing all executions
      updateExecutionsTableMain(filteredExecutions);
      updateExecutionsSummary(filteredExecutions);
      // Filtered to executions
      return;
    }

    // Looking for executions with account names

    // אם יש לנו כבר נתוני טריידים, השתמש בהם
    if (tradesData.length > 0) {
      applyAccountFilterWithTradesData(namesArray);
    } else {
      // טעינת נתוני טריידים כדי לקבל את שמות החשבונות
      fetch('/api/trades/')
        .then(response => response.json())
        .then(data => {
          tradesData = data.data || [];
          applyAccountFilterWithTradesData(namesArray);
        })
        .catch(error => {
          handleDataLoadError(error, 'טריידים לפילטר חשבון');
          // Fallback - הצגת כל הביצועים
          filteredExecutions = [...allExecutions];
          updateExecutionsTableMain(filteredExecutions);
          updateExecutionsSummary(filteredExecutions);
        });
    }
  };

  // פונקציה עזר לפילטר חשבון עם נתוני טריידים
  function applyAccountFilterWithTradesData(namesArray) {
    const tradesMap = {};

    // יצירת מפה של trade_id -> account_name
    tradesData.forEach(trade => {
      tradesMap[trade.id] = trade.account_name;
    });

    // Trades map
    // Looking for accounts
    // Original executions count

    filteredExecutions = originalExecutions.filter(execution => {
      const tradeAccountName = tradesMap[execution.trade_id];
      const isIncluded = namesArray.includes(tradeAccountName);
      // Execution ID details
      return isIncluded;
    });

    // Filtered executions count
    updateExecutionsTableMain(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    // Filtered to executions
  }

  // פונקציה לחיפוש חופשי
  window.searchExecutions = function(searchTerm) {
    // Searching executions

    if (!searchTerm || searchTerm.trim() === '') {
      filteredExecutions = [...originalExecutions];
    } else {
      const term = searchTerm.toLowerCase();
      filteredExecutions = originalExecutions.filter(execution =>
        execution.symbol && execution.symbol.toLowerCase().includes(term) ||
        execution.trade_name && execution.trade_name.toLowerCase().includes(term) ||
        execution.action && execution.action.toLowerCase().includes(term) ||
        execution.quantity && execution.quantity.toString().includes(term) ||
        execution.price && execution.price.toString().includes(term) ||
        execution.commission && execution.commission.toString().includes(term) ||
        execution.notes && execution.notes.toLowerCase().includes(term) ||
        execution.created_at && execution.created_at.toLowerCase().includes(term) ||
        execution.execution_date && execution.execution_date.toLowerCase().includes(term),
      );
    }

    updateExecutionsTableMain(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    // Search results
  };

  // פונקציה לפילטר לפי סוג עסקה
  window.filterExecutionsByType = function(types) {
    // Filtering executions by type

    const typesArray = Array.isArray(types) ? types : [types];

    if (typesArray.length === 0 || typesArray.includes('all') || typesArray.includes('הכול')) {
      filteredExecutions = [...originalExecutions];
    } else {
      filteredExecutions = originalExecutions.filter(execution => {
        const executionType = execution.action || execution.type || '';
        return typesArray.some(type =>
          executionType.toLowerCase().includes(type.toLowerCase()) ||
          type === 'קנייה' && executionType.toLowerCase().includes('buy') ||
          type === 'מכירה' && executionType.toLowerCase().includes('sell'),
        );
      });
    }

    updateExecutionsTableMain(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    // Filtered by type
  };

  // פונקציה לפילטר לפי תאריך
  window.filterExecutionsByDate = function(dateRange) {
    // Filtering executions by date range

    if (!dateRange || dateRange === 'all' || dateRange === 'הכול') {
      filteredExecutions = [...originalExecutions];
    } else {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      filteredExecutions = originalExecutions.filter(execution => {
        const executionDate = new Date(execution.execution_date || execution.created_at);

        switch (dateRange) {
        case 'today':
        case 'היום':
          return executionDate.toDateString() === today.toDateString();
        case 'yesterday':
        case 'אתמול':
          return executionDate.toDateString() === yesterday.toDateString();
        case 'week':
        case 'שבוע': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return executionDate >= weekAgo;
        }
        case 'month':
        case 'חודש': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return executionDate >= monthAgo;
        }
        default:
          return true;
        }
      });
    }

    updateExecutionsTableMain(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    // Filtered by date
  };

  // פונקציה לאיפוס פילטרים
  window.resetExecutionsFilters = function() {
    // Resetting executions filters
    filteredExecutions = [...originalExecutions];
    updateExecutionsTableMain(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    // Filters reset, showing all executions
  };

  // Executions filter functions setup complete
}

// פונקציה לעדכון הנתונים הגלובליים
function updateExecutionsGlobalData(executions) {
  originalExecutions = executions || [];
  allExecutions = [...originalExecutions];
  filteredExecutions = [...allExecutions];
  // Executions global data updated
}

// עדכון הפונקציה הקיימת loadExecutionsData
const originalLoadExecutionsData = window.loadExecutionsData || loadExecutionsData;
window.loadExecutionsData = async function() {
  await originalLoadExecutionsData();

  // עדכון הנתונים הגלובליים לאחר טעינה
  if (executionsData && executionsData.length > 0) {
    updateExecutionsGlobalData(executionsData);

    // טעינת נתוני טריידים לטובת פילטר החשבונות
    try {
      const response = await fetch('/api/trades/');
      const data = await response.json();
      tradesData = data.data || [];
      // Loaded trades data for account filter
    } catch (error) {
      handleDataLoadError(error, 'נתוני טריידים');
      tradesData = [];
    }

    setupExecutionsFilterFunctions();
  }

  // טעינת טבלת טיקרים חלקית
  try {
    const tickers = await loadTickersSummaryData();
    updateTickersSummaryTable(tickers);

  } catch (error) {
    // console.error('❌ שגיאה בטעינת טבלת טיקרים חלקית:', error);
    handleDataLoadError(error, 'טבלת טיקרים חלקית');
  }
};

// הוספת פונקציות CRUD גלובליות
if (typeof window.registerCRUDFunctions === 'function') {
  window.registerCRUDFunctions('executions', {
    create: saveExecution,
    read: loadExecutionsData,
    update: updateExecution,
    delete: confirmDeleteExecution,
    showAddModal: showAddExecutionModal,
    showEditModal: showEditExecutionModal,
    showDeleteModal: deleteExecution,
  });
}

/**
 * זיהוי מזהה השדה מהודעת שגיאה
 * @param {string} errorMessage - הודעת השגיאה
 * @param {string} prefix - קידומת הטופס (add או edit)
 * @returns {string|null} מזהה השדה או null
 */


// ייצוא הפונקציה הגלובלית
window.loadExecutionsData = loadExecutionsData;

// ========================================
// פונקציות ביטול טיקר - שימוש בפונקציות הגלובליות
// ========================================

// הפונקציות של ביטול טיקר נמצאות בקובץ tickers.js
// כאן אנחנו משתמשים בפונקציות הגלובליות

/**
 * הצגת/הסתרת שדה מזהה חיצוני לפי מקור
 * @param {string} mode - 'add' או 'edit'
 */
function toggleExternalIdField(mode) {
  const prefix = mode === 'add' ? 'add' : 'edit';
  const sourceField = document.getElementById(`${prefix}ExecutionSource`);
  const externalIdContainer = document.getElementById(`${prefix}ExecutionExternalIdContainer`);
  const externalIdField = document.getElementById(`${prefix}ExecutionExternalId`);

  if (!sourceField || !externalIdContainer) {
    // console.warn(`⚠️ שדות לא נמצאו עבור mode: ${mode}`);
    return;
  }

  const source = sourceField.value;

  if (source === 'manual') {
    // הסתרת שדה מזהה חיצוני עבור מקור ידני
    externalIdContainer.style.display = 'none';
    if (externalIdField) {
      externalIdField.value = '';
    }
    // שדה מזהה חיצוני מוסתר (מקור ידני)
  } else {
    // הצגת שדה מזהה חיצוני עבור מקורות אחרים
    externalIdContainer.style.display = 'block';
    // שדה מזהה חיצוני מוצג
  }
}

// ייצוא הפונקציה
window.toggleExternalIdField = toggleExternalIdField;

// ========================================
// פונקציות לטבלת טיקרים חלקית
// ========================================

// משתנים לטבלת טיקרים
let tickersSummaryData = [];

/**
 * טעינת נתוני טיקרים חלקיים
 */
async function loadTickersSummaryData() {


  try {
    // טעינת טיקרים
    const tickersResponse = await fetch('/api/tickers/');
    const tickersData = await tickersResponse.json();
    const allTickers = tickersData.data || tickersData || [];

    // טעינת טריידים
    const tradesResponse = await fetch('/api/trades/');
    const summaryTradesData = await tradesResponse.json();
    const trades = summaryTradesData.data || summaryTradesData || [];

    // סינון טיקרים עם טריידים פעילים או סגורים
    const relevantTickers = allTickers.filter(ticker => {
      const tickerTrades = trades.filter(trade => trade.ticker_id === ticker.id);
      return tickerTrades.some(trade =>
        trade.status === 'active' || trade.status === 'open' || trade.status === 'closed',
      );
    });

    // עיבוד נתונים לכל טיקר
    const processedTickers = relevantTickers.map(ticker => {
      const tickerTrades = trades.filter(trade => trade.ticker_id === ticker.id);
      const activeTrades = tickerTrades.filter(trade =>
        trade.status === 'active' || trade.status === 'open',
      );
      const closedTrades = tickerTrades.filter(trade => trade.status === 'closed');

      // קביעת סטטוס
      let status = 'אין טריידים';
      if (activeTrades.length > 0 && closedTrades.length > 0) {
        status = 'פעיל + סגור';
      } else if (activeTrades.length > 0) {
        status = 'פעיל';
      } else if (closedTrades.length > 0) {
        status = 'סגור';
      }

      return {
        id: ticker.id,
        symbol: ticker.symbol,
        name: ticker.name,
        status,
        totalTrades: tickerTrades.length,
        activeTrades: activeTrades.length,
        closedTrades: closedTrades.length,
        created_at: ticker.created_at,
      };
    });

    tickersSummaryData = processedTickers;
    window.tickersSummaryData = processedTickers;

    return processedTickers;

  } catch (error) {
    // console.error('❌ שגיאה בטעינת טיקרים חלקיים:', error);
    handleDataLoadError(error, 'טעינת טיקרים חלקיים');
    return [];
  }
}

/**
 * עדכון טבלת טיקרים חלקית
 */
function updateTickersSummaryTable(tickers = null) {


  const tableBody = document.querySelector('#tickersTable tbody');
  if (!tableBody) {
    // console.warn('⚠️ טבלת טיקרים לא נמצאה');
    return;
  }

  const dataToShow = tickers || tickersSummaryData;

  if (!dataToShow || dataToShow.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">לא נמצאו טיקרים רלוונטיים</td></tr>';
    document.getElementById('tickersCount').textContent = '0 טיקרים';
    return;
  }

  // עדכון מונה
  document.getElementById('tickersCount').textContent = `${dataToShow.length} טיקרים`;

  // ניקוי הטבלה
  tableBody.innerHTML = '';

  // הוספת שורות
  dataToShow.forEach(ticker => {
    const row = document.createElement('tr');

    // עיבוד תאריך יצירה
    let creationDate = 'תאריך לא ידוע';
    if (ticker.created_at) {
      try {
        const date = new Date(ticker.created_at);
        creationDate = date.toLocaleDateString('he-IL');
      } catch {
        // console.warn('⚠️ לא ניתן לעבד תאריך יצירה:', ticker.created_at);
      }
    }

    // קביעת צבע סטטוס
    let statusClass = '';
    if (ticker.status === 'פעיל') {
      statusClass = 'text-success';
    } else if (ticker.status === 'סגור') {
      statusClass = 'text-secondary';
    } else if (ticker.status === 'פעיל + סגור') {
      statusClass = 'text-primary';
    }

    row.innerHTML = `
            <td><strong>${ticker.symbol}</strong></td>
            <td>${ticker.name}</td>
            <td><span class="${statusClass}">${ticker.status}</span></td>
            <td>${ticker.totalTrades} (${ticker.activeTrades} פעיל, ${ticker.closedTrades} סגור)</td>
            <td>${creationDate}</td>
            <td class="col-actions actions-cell">
                ${window.createActionsMenu ? window.createActionsMenu([
                    window.createButton ? window.createButton('VIEW', `viewTickerDetails(${ticker.id})`) : '',
                    window.createButton ? window.createButton('ADD', `addExecutionForTicker(${ticker.id})`) : ''
                ], ticker.id) : ''}
            </td>
        `;

    tableBody.appendChild(row);
  });

}

/**
 * רענון רשימת טיקרים
 */
async function refreshTickersSummary() {


  try {
    const tickers = await loadTickersSummaryData();
    updateTickersSummaryTable(tickers);

    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('רענון הושלם', `נטענו ${tickers.length} טיקרים`);
    }
  } catch {
    // console.error('❌ שגיאה ברענון טיקרים:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה ברענון', 'לא ניתן לרענן את רשימת הטיקרים');
    }
  }
}

/**
 * צפייה בפרטי טיקר
 */
function viewTickerDetails(tickerId) {


  // מציאת הטיקר
  const ticker = tickersSummaryData.find(t => t.id === tickerId);
  if (!ticker) {
    // console.warn('⚠️ טיקר לא נמצא:', tickerId);
    return;
  }

  // הצגת פרטי טיקר (בפיתוח)
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('פרטי טיקר', `טיקר: ${ticker.symbol} - ${ticker.name}\nסטטוס: ${ticker.status}\nטריידים: ${ticker.totalTrades}`);
  }
}

/**
 * הוספת עסקה לטיקר
 */
function addExecutionForTicker(tickerId) {


  // מציאת הטיקר
  const ticker = tickersSummaryData.find(t => t.id === tickerId);
  if (!ticker) {
    // console.warn('⚠️ טיקר לא נמצא:', tickerId);
    return;
  }

  // פתיחת מודל הוספת עסקה
  showAddExecutionModal();

  // בחירת הטיקר במודל
  setTimeout(() => {
    const tickerSelect = document.getElementById('addExecutionTicker');
    if (tickerSelect) {
      tickerSelect.value = tickerId;
      // הפעלת שינוי הטיקר
      if (typeof updateTradesOnTickerChange === 'function') {
        updateTradesOnTickerChange('add');
      }
    }
  }, 100);
}

/**
 * הצגה/הסתרה של סקשן הטיקרים
 */
function toggleTickersSection() {
  const section = document.querySelector('.content-section:has(#tickersContainer)');
  if (section) {
    const body = section.querySelector('.section-body');
    const icon = section.querySelector('.filter-icon');

    if (body.style.display === 'none') {
      body.style.display = 'block';
      icon.textContent = '▲';
    } else {
      body.style.display = 'none';
      icon.textContent = '▼';
    }
  }
}

// ייצוא פונקציות
window.loadTickersSummaryData = loadTickersSummaryData;
window.updateTickersSummaryTable = updateTickersSummaryTable;
window.refreshTickersSummary = refreshTickersSummary;
window.viewTickerDetails = viewTickerDetails;
window.addExecutionForTicker = addExecutionForTicker;
window.toggleTickersSection = toggleTickersSection;

/**
 * עדכון רשימת הטיקרים לפי הצ'קבוקס
 * @param {string} mode - מצב ('add' או 'edit')
 * @param {boolean} showClosedTrades - האם להציג טריידים סגורים
 */
async function updateTickersList(mode, showClosedTrades = false) {


  try {
    // טעינת כל הטיקרים
    const tickersResponse = await fetch('/api/tickers/');
    const tickersData = await tickersResponse.json();
    const allTickers = tickersData.data || tickersData || [];

    // טעינת טריידים
    const tradesResponse = await fetch('/api/trades/');
    const tickersTradesData = await tradesResponse.json();
    const trades = tickersTradesData.data || tickersTradesData || [];

    // סינון טיקרים לפי הקריטריונים
    let filteredTickers;

    if (showClosedTrades) {
      // הצג טיקרים עם טריידים פעילים + טיקרים עם טריידים סגורים
      const tickersWithActiveTrades = allTickers.filter(ticker =>
        trades.some(trade => trade.ticker_id === ticker.id && (trade.status === 'active' || trade.status === 'open')),
      );

      const tickersWithClosedTrades = allTickers.filter(ticker =>
        trades.some(trade => trade.ticker_id === ticker.id && trade.status === 'closed'),
      );

      // איחוד ללא כפילויות
      const allRelevantTickers = [...tickersWithActiveTrades, ...tickersWithClosedTrades];
      filteredTickers = allRelevantTickers.filter((ticker, index, self) =>
        index === self.findIndex(t => t.id === ticker.id),
      );


    } else {
      // הצג רק טיקרים עם טריידים פעילים
      filteredTickers = allTickers.filter(ticker =>
        trades.some(trade => trade.ticker_id === ticker.id && (trade.status === 'active' || trade.status === 'open')),
      );

    }

    // עדכון שדה הטיקר
    const tickerSelect = mode === 'add'
      ? document.getElementById('addExecutionTicker')
      : document.getElementById('editExecutionTicker');

    if (tickerSelect) {
      tickerSelect.innerHTML = '<option value="">בחר טיקר...</option>';
      filteredTickers.forEach(ticker => {
        const option = document.createElement('option');
        option.value = ticker.id;
        option.textContent = `${ticker.symbol} - ${ticker.name}`;
        tickerSelect.appendChild(option);
      });


    }

  } catch (error) {
    // console.error('❌ שגיאה בעדכון רשימת טיקרים:', error);
    handleDataLoadError(error, 'עדכון רשימת טיקרים');
  }
}

window.updateTickersList = updateTickersList;

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions

function toggleExecutionsSection() {
    if (typeof window.toggleSection === 'function') {
        window.toggleSection('executions');
    } else {
        console.warn('toggleSection function not found');
    }
}

// Execution CRUD functions
// הוסר: עטיפת saveExecution כפולה שגרמה לרקורסיה

// הוסר: עטיפת updateExecution כפולה שגרמה לרקורסיה

function confirmDeleteExecution() {
    if (typeof window.confirmDeleteExecution === 'function') {
        window.confirmDeleteExecution();
    } else {
        console.warn('confirmDeleteExecution function not found');
    }
}

// Navigation functions
function goToLinkedTrade(mode = 'edit') {
    if (typeof window.goToLinkedTrade === 'function') {
        window.goToLinkedTrade(mode);
    } else {
        console.warn('goToLinkedTrade function not found');
    }
}

function addNewPlan() {
    if (typeof window.addNewPlan === 'function') {
        window.addNewPlan();
    } else {
        console.warn('addNewPlan function not found');
    }
}

function addNewTrade() {
    if (typeof window.addNewTrade === 'function') {
        window.addNewTrade();
    } else {
        console.warn('addNewTrade function not found');
    }
}

function addNewTicker() {
    if (typeof window.addNewTicker === 'function') {
        window.addNewTicker();
    } else {
        console.warn('addNewTicker function not found');
    }
}

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for onclick attributes
// window.toggleSection removed - using global version from ui-utils.js
window.toggleExecutionsSection = toggleExecutionsSection;
// ייצוא גלובלי כפול - מוסר (כבר מיוצא בשורות 2065-2087)

// Modal event listeners for form reset

/**
 * Generate detailed log for Executions
 */
function generateDetailedLog() {
    // יצירת timestamp באמצעות DefaultValueSetter או fallback
    let timestamp;
    if (window.DefaultValueSetter && typeof window.DefaultValueSetter.getFormattedDateTime === 'function') {
        timestamp = window.DefaultValueSetter.getFormattedDateTime('he-IL');
    } else {
        timestamp = new Date().toLocaleString('he-IL');
    }
    const log = [];

    log.push('=== לוג מפורט - עסקעות ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // 1. מצב כללי של העמוד
    log.push('--- מצב כללי של העמוד ---');
    const sections = document.querySelectorAll('.content-section, .section');
    sections.forEach((section, index) => {
        const header = section.querySelector('.section-header, h2, h3');
        const body = section.querySelector('.section-body, .card-body');
        const isOpen = body && body.style.display !== 'none' && !section.classList.contains('collapsed');
        const title = header ? header.textContent.trim() : `סקשן ${index + 1}`;
        log.push(`  ${index + 1}. "${title}": ${isOpen ? 'פתוח' : 'סגור'}`);
    });

    // 2. סטטיסטיקות עסקעות
    log.push('');
    log.push('--- סטטיסטיקות עסקעות ---');
    const executionStats = [
        'totalExecutions', 'totalBuyExecutions', 'totalSellExecutions',
        'totalBuyAmount', 'totalSellAmount', 'balanceAmount'
    ];
    
    executionStats.forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${statId}: ${value} (${visible})`);
        }
    });

    // 3. טבלת עסקעות
    log.push('');
    log.push('--- טבלת עסקעות ---');
    const table = document.querySelector('#executionsTable, .table, table');
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        log.push(`מספר שורות: ${rows.length}`);
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => cell.textContent.trim()).join(' | ');
            log.push(`  ${index + 1}. ${rowData}`);
        });
    } else {
        log.push('טבלה לא נמצאה');
    }

    // 4. כפתורים וקונטרולים
    log.push('');
    log.push('--- כפתורים וקונטרולים ---');
    const buttonIds = [
        'addExecutionBtn', 'editExecutionBtn', 'deleteExecutionBtn', 'filterBtn',
        'exportBtn', 'refreshBtn', 'searchBtn'
    ];
    
    buttonIds.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const visible = btn.offsetParent !== null ? 'נראה' : 'לא נראה';
            const disabled = btn.disabled ? 'מבוטל' : 'פעיל';
            const text = btn.textContent.trim() || btn.value || 'ללא טקסט';
            log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
        }
    });

    // 5. פילטרים וחיפוש
    log.push('');
    log.push('--- פילטרים וחיפוש ---');
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="חיפוש"], input[placeholder*="search"]');
    if (searchInput) {
        const value = searchInput.value || 'ריק';
        const visible = searchInput.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`חיפוש: "${value}" (${visible})`);
    }

    const filters = document.querySelectorAll('.filter, .form-select, select');
    filters.forEach((filter, index) => {
        const value = filter.value || 'לא נבחר';
        const visible = filter.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`פילטר ${index + 1}: "${value}" (${visible})`);
    });

    // 6. מידע טכני
    log.push('');
    log.push('--- מידע טכני ---');
    log.push(`זמן יצירת הלוג: ${timestamp}`);
    log.push(`גרסת דפדפן: ${navigator.userAgent}`);
    log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
    log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
    
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        log.push(`זמן טעינת עמוד: ${loadTime}ms`);
    }
    
    if (navigator.deviceMemory) {
        log.push(`זיכרון זמין: ${navigator.deviceMemory}GB`);
    }
    
    log.push(`שפת דפדפן: ${navigator.language}`);
    log.push(`פלטפורמה: ${navigator.platform}`);

    // 7. שגיאות והערות מהקונסולה
    log.push('');
    log.push('--- שגיאות והערות מהקונסולה ---');
    log.push('⚠️ חשוב: הלוג המפורט חייב לכלול שגיאות קונסולה לאבחון בעיות');
    log.push('📋 הוראות: פתח את Developer Tools (F12) > Console');
    log.push('📋 העתק את כל השגיאות וההערות מהקונסולה');
    log.push('📋 הוסף אותן ללוג המפורט לפני שליחה');

    log.push('');
    log.push('=== סוף לוג ===');
    return log.join('\n');
}

// Local copyDetailedLog function for executions page
async function copyDetailedLog() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את כל מה שרואה המשתמש בעמוד');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('לוג מפורט הועתק ללוח', 'success');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        }
    } catch (error) {
        console.error('שגיאה בהעתקת הלוג המפורט:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}

// ===== UNIFIED PAGE INITIALIZATION =====
// All DOMContentLoaded listeners merged into single initialization function
// Called from PAGE_CONFIGS in core-systems.js

window.initializeExecutionsPage = async function() {
    console.log('⚡ Initializing Executions Page...');
    // הוסר: אתחול העדפות מתבצע כעת גלובלית באתחול המאוחד

    // 0. יישור קו עם מערכת ההעדפות המאוחדת: החלת ברירות מחדל כאשר המערכת מוכנה
    try {
        const applyPrefDefaults = async () => {
            // ודא שמערכת ההעדפות מאותחלת לפני שימוש
            if (window.PreferencesSystem && window.PreferencesSystem.initialized) {
                await populateAccountsWithDefault('executionAccount');
                await fillDefaultCommissionFromPreferences();
            }
        };

        // אם כבר מאותחל בשלב זה - החל מיידית
        if (window.PreferencesSystem?.initialized) {
            await applyPrefDefaults();
        }

        // כאשר ההעדפות נטענות (מאתחל מאוחד) - החל ברירות מחדל
        window.addEventListener('preferences:loaded', () => {
            // לאפשר לצבעים/מטמון להתעדכן לפני מילוי שדות
            setTimeout(() => { applyPrefDefaults(); }, 0);
        });

        // כאשר ההעדפות מתעדכנות בזמן ריצה - רענן ברירות מחדל
        window.addEventListener('preferences:updated', () => {
            setTimeout(() => { applyPrefDefaults(); }, 0);
        });
    } catch (_e) {
        // לא חוסם את האתחול
    }

    // 1. Initialize modals
    if (typeof window.initializeExecutionsModals === 'function') {
        window.initializeExecutionsModals();
    }
    
    // 2. Setup modal configurations
    setupModalConfigurations();
    
    // 3. Load data
    if (typeof window.loadExecutionsData === 'function') {
        loadExecutionsData();
    }
    
    // 4. Load colors and apply to headers
    if (typeof window.loadColorPreferences === 'function') {
        window.loadColorPreferences().then(() => {
            console.log('✅ Dynamic colors loaded for executions');
        }).catch(error => {
            console.error('❌ Failed to load colors:', error);
        });
    }
    
    // 5. Setup filter functions
    setupExecutionsFilterFunctions();
    
    // 6. Restore sort state
    if (typeof window.restoreAnyTableSort === 'function') {
        window.restoreAnyTableSort('executions', window.executionsData || [], updateExecutionsTableMain);
    }
    
    // 7. Initialize tickers lists
    updateTickersList('add', false);
    updateTickersList('edit', false);
    
    // 8. Initialize validation
    if (window.initializeValidation) {
        const addExecutionValidationRules = {
            trade_id: {
                required: true,
                type: 'number',
                min: 1,
                message: 'יש לבחור טרייד',
            },
            quantity: {
                required: true,
                type: 'number',
                min: 1,
                message: 'יש להזין כמות חיובית',
            },
            price: {
                required: true,
                type: 'number',
                min: 0.01,
                message: 'יש להזין מחיר חיובי',
            },
        };
        
        window.initializeValidation('addExecutionForm', addExecutionValidationRules);
        window.initializeValidation('editExecutionForm', {});
    }
    
    // 9. Setup modal reset handlers
    if (addExecutionModalElement) {
        addExecutionModalElement.addEventListener('hidden.bs.modal', function() {
            resetAddExecutionForm();
        });
    }
    
    if (editExecutionModalElement) {
        editExecutionModalElement.addEventListener('hidden.bs.modal', function() {
            resetEditExecutionForm();
        });
    }
    
    // 10. Auto-refresh every 30 seconds
    setInterval(() => {
        if (typeof window.loadExecutionsData === 'function') {
            loadExecutionsData();
        }
    }, 30000);
    
    console.log('✅ Executions page initialized successfully');
};

// ========================================
// Flexible Assignment Logic (Ticker/Trade)
// ========================================

/**
 * החלפת שדות שיוך בהתאם לבחירה ברדיו באטן
 * @param {string} mode - 'add' או 'edit'
 */
function toggleAssignmentFields(mode = 'add') {
    try {
        const assignmentType = document.querySelector(`input[name="${mode}AssignmentType"]:checked`)?.value;
        
        if (!assignmentType) {
            console.warn('No assignment type selected');
            return;
        }
        
        const tickerField = document.getElementById(`${mode}TickerField`);
        const tradeField = document.getElementById(`${mode}TradeField`);
        const accountField = document.getElementById(mode === 'add' ? 'executionAccount' : 'editExecutionAccount');
        const accountHint = document.getElementById(`${mode}AccountHint`);
        
        if (assignmentType === 'ticker') {
            // הצג טיקר, הסתר טרייד
            if (tickerField) tickerField.style.display = 'block';
            if (tradeField) tradeField.style.display = 'none';
            
            // נקה את שדה הטרייד
            const tradeSelect = document.getElementById(mode === 'add' ? 'addExecutionTradeId' : 'editExecutionTradeId');
            if (tradeSelect) tradeSelect.value = '';
            
            // חשבון אופציונלי
            if (accountField) accountField.removeAttribute('required');
            if (accountHint) accountHint.textContent = 'אופציונלי כאשר משויך לטיקר';
            
        } else if (assignmentType === 'trade') {
            // הצג טרייד, הסתר טיקר
            if (tickerField) tickerField.style.display = 'none';
            if (tradeField) tradeField.style.display = 'block';
            
            // נקה את שדה הטיקר
            const tickerSelect = document.getElementById(mode === 'add' ? 'executionTicker' : 'editExecutionTicker');
            if (tickerSelect) tickerSelect.value = '';
            
            // חשבון חובה
            if (accountField) accountField.setAttribute('required', 'required');
            if (accountHint) accountHint.textContent = 'חובה כאשר משויך לטרייד';
        }
    } catch (error) {
        console.error('Error in toggleAssignmentFields:', error);
    }
}

window.toggleAssignmentFields = toggleAssignmentFields;

/**
 * ולידציה משופרת לטופס הוספה - תומכת בשיוך גמיש
 */
function validateExecutionForm() {
    try {
        const assignmentType = document.querySelector('input[name="addAssignmentType"]:checked')?.value;
        
        // בדיקת שדות בסיסיים
        const action = document.getElementById('executionType').value;
        const quantity = document.getElementById('executionQuantity').value;
        const price = document.getElementById('executionPrice').value;
        const date = document.getElementById('executionDate').value;
        
        if (!action) {
            window.showErrorNotification('חובה לבחור סוג עסקה');
            return false;
        }
        
        if (!quantity || parseFloat(quantity) <= 0) {
            window.showErrorNotification('חובה להזין כמות חוקית');
            return false;
        }
        
        if (!price || parseFloat(price) <= 0) {
            window.showErrorNotification('חובה להזין מחיר חוקי');
            return false;
        }
        
        if (!date) {
            window.showErrorNotification('חובה לבחור תאריך');
            return false;
        }
        
        // ולידציה ספציפית לשיוך
        if (assignmentType === 'ticker') {
            const tickerId = document.getElementById('executionTicker').value;
            if (!tickerId) {
                window.showErrorNotification('חובה לבחור טיקר');
                return false;
            }
        } else {
            const tradeId = document.getElementById('addExecutionTradeId').value;
            if (!tradeId) {
                window.showErrorNotification('חובה לבחור טרייד');
                return false;
            }
            
            const accountId = document.getElementById('executionAccount').value;
            if (!accountId) {
                window.showErrorNotification('חובה לבחור חשבון כאשר משויך לטרייד');
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error in validateExecutionForm:', error);
        return false;
    }
}

/**
 * ולידציה משופרת לטופס עריכה - תומכת בשיוך גמיש
 */
function validateEditExecutionForm() {
    try {
        const assignmentType = document.querySelector('input[name="editAssignmentType"]:checked')?.value;
        
        // בדיקת שדות בסיסיים
        const action = document.getElementById('editExecutionType').value;
        const quantity = document.getElementById('editExecutionQuantity').value;
        const price = document.getElementById('editExecutionPrice').value;
        const date = document.getElementById('editExecutionDate').value;
        
        if (!action) {
            window.showErrorNotification('חובה לבחור סוג עסקה');
            return false;
        }
        
        if (!quantity || parseFloat(quantity) <= 0) {
            window.showErrorNotification('חובה להזין כמות חוקית');
            return false;
        }
        
        if (!price || parseFloat(price) <= 0) {
            window.showErrorNotification('חובה להזין מחיר חוקי');
            return false;
        }
        
        if (!date) {
            window.showErrorNotification('חובה לבחור תאריך');
            return false;
        }
        
        // ולידציה ספציפית לשיוך
        if (assignmentType === 'ticker') {
            const tickerId = document.getElementById('editExecutionTicker').value;
            if (!tickerId) {
                window.showErrorNotification('חובה לבחור טיקר');
                return false;
            }
        } else {
            const tradeId = document.getElementById('editExecutionTradeId').value;
            if (!tradeId) {
                window.showErrorNotification('חובה לבחור טרייד');
                return false;
            }
            
            const accountId = document.getElementById('editExecutionAccount').value;
            if (!accountId) {
                window.showErrorNotification('חובה לבחור חשבון כאשר משויך לטרייד');
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error in validateEditExecutionForm:', error);
        return false;
    }
}
