/**
 * Function Index:
 * ==============
 * 
 * EXECUTION MANAGEMENT:
 * - addExecution()
 * - editExecution()
 * - deleteExecution()
 * - updateExecution()
 * 
 * VALIDATION:
 * - validateExecutionDate()
 * - validateExecutionType()
 * - clearFieldError()
 * - clearExecutionValidationErrors()
 * - validateCompleteExecutionForm()
 * 
 * UI MANAGEMENT:
 * - displayLinkedItems()
 * - goToLinkedItems()
 * - goToTrade()
 * - goToPlan()
 * - goToAlert()
 * - goToNote()
 * - goToTickerPage()
 * - showTickerHelp()
 * - addNewTicker()
 * 
 * DATA FILTERING:
 * - isDateInRange()
 * - filterExecutionsLocally()
 * 
 * UTILITY FUNCTIONS:
 * - restoreSortState()
 * - setupModalConfigurations()
 * - enableAllFields()
 * 
 * ==============
 */

// ===== קובץ JavaScript לדף עסקעות =====

/**
 * הוספת ביצוע חדש
 * פותח מודל להוספת ביצוע חדש
 */
function addExecution() {
  try {
    window.Logger.info('➕ מוסיף ביצוע חדש', { page: "executions" });
    
    // פתיחת מודל הוספת ביצוע - שימוש במערכת הכללית
    if (typeof window.showAddExecutionModal === 'function') {
      window.showAddExecutionModal();
    } else {
      window.Logger.error('❌ showAddExecutionModal לא זמין במערכת הכללית', { page: "executions" });
    }
    
  } catch (error) {
    window.Logger.error('שגיאה בהוספת ביצוע:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת ביצוע', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהוספת ביצוע', 'error');
    }
  }
}
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
  try {
    // שימוש במערכת הכללית
    if (typeof window.showAddExecutionModal === 'function') {
      window.showAddExecutionModal();
    } else {
      window.Logger.error('❌ showAddExecutionModal לא זמין במערכת הכללית', { page: "executions" });
    }
  } catch (error) {
    window.Logger.error('שגיאה בפתיחת פרטי ביצוע:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפתיחת פרטי ביצוע', error.message);
    }
  }
}

function editExecution(id) {
  try {
    showEditExecutionModal(id);
  } catch (error) {
    window.Logger.error('שגיאה בעריכת ביצוע:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעריכת ביצוע', error.message);
    }
  }
}

function deleteExecution(id) {
  try {
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
  
  } catch (error) {
    window.Logger.error('שגיאה במחיקת ביצוע:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במחיקת ביצוע', error.message);
    }
  }
}

// פונקציות לפתיחה/סגירה של סקשנים - שימוש במערכת הכללית

// ========================================
// פונקציות מודלים
// ========================================

/**
 * ניקוי והשבתת שדות בטופס עסקה (הוספה או עריכה)
 * @param {string} formType - 'add' או 'edit'
 */
function resetExecutionForm(formType) {
  try {
    const isEdit = formType === 'edit';
    const formPrefix = isEdit ? 'editExecution' : 'execution';
    const formId = `${formPrefix}Form`;
    
    // ניקוי הטופס
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
    clearExecutionValidationErrors();

    // השבתת כל השדות חוץ מטיקר
    const fieldsToDisable = [
      `${formPrefix}TradeId`,
      `${formPrefix}Type`,
      `${formPrefix}Quantity`,
      `${formPrefix}Price`,
      `${formPrefix}Commission`,
      `${formPrefix}Date`,
      `${formPrefix}Notes`,
    ];

    fieldsToDisable.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.disabled = true;
      }
    });

    // הסתרת כפתור קישור לטרייד
    const tradeLinkButton = document.getElementById(`${formPrefix}TradeLink`);
    if (tradeLinkButton) {
      tradeLinkButton.style.display = 'none';
    }

  } catch (error) {
    const action = formType === 'edit' ? 'עריכת' : 'הוספת';
    window.Logger.error(`שגיאה באיפוס טופס ${action} ביצוע:`, error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification(`שגיאה באיפוס טופס ${action} ביצוע`, error.message);
    }
  }
}

/**
 * ניקוי והשבתת שדות בטופס הוספת עסקה
 * @deprecated Use resetExecutionForm('add') instead
 */
function resetAddExecutionForm() {
  resetExecutionForm('add');
}

// showAddExecutionModal הועבר למערכת הכללית

/**
 * ניקוי והשבתת שדות בטופס עריכת עסקה
 * @deprecated Use resetExecutionForm('edit') instead
 */
function resetEditExecutionForm() {
  resetExecutionForm('edit');
}

/**
 * הצגת מודל עריכת עסקה
 */
async function showEditExecutionModal(id) {
  window.Logger.info('🔍 [EDIT MODAL] פתיחת מודל עריכה עבור עסקה ID:', id, { page: "executions" });
  window.Logger.info('🔍 [EDIT MODAL] נתוני עסקעות במטמון:', executionsData.length, 'עסקעות', { page: "executions" });
  window.Logger.info('🔍 [EDIT MODAL] נתוני עסקעות במטמון:', executionsData.map(e => `${e.id}(trade:${e.trade_id}, { page: "executions" })`));

  // מציאת העסקה לפי ID
  const execution = executionsData.find(e => e.id === id);
  if (!execution) {
    window.Logger.info('❌ [EDIT MODAL] עסקה לא נמצאה במטמון:', id, { page: "executions" });
    handleElementNotFound('execution', 'CRITICAL');
    return;
  }
  
  window.Logger.info('✅ [EDIT MODAL] עסקה נמצאה:', execution, { page: "executions" });

  // מילוי שדה ה-ID לפני כל השאר
  document.getElementById('editExecutionId').value = execution.id;
  window.Logger.info('✅ [EDIT MODAL] שדה ID מולא:', execution.id, { page: "executions" });

  // טעינת טיקרים לפי הצ'קבוקס
  const showClosedTrades = document.getElementById('editExecutionShowClosedTrades')?.checked || false;
  await updateTickersList('edit', showClosedTrades);

  // טעינת פרטי הטרייד/תכנון המקושר
  let linkedObject = null;
  let tickerId = null;
  let actionValue = null;
  let executionDate = null;

  try {
    // בדיקה אם יש טרייד מקושר
    if (execution.trade_id) {
      window.Logger.info('🔍 [EDIT MODAL] מחפש טרייד מקושר ID:', execution.trade_id, { page: "executions" });
      const tradesResponse = await fetch('/api/trades/');
      const responseData = await tradesResponse.json();
      const trades = responseData.data || responseData || [];
      
      window.Logger.info('🔍 [EDIT MODAL] טריידים נטענו מהשרת:', trades.length, 'טריידים', { page: "executions" });
      window.Logger.info('🔍 [EDIT MODAL] טריידים מהשרת:', trades.map(t => `${t.id}(ticker:${t.ticker_id},status:${t.status}, { page: "executions" })`));

      const trade = trades.find(t => t.id === execution.trade_id);
      if (trade) {
        window.Logger.info('✅ [EDIT MODAL] טרייד מקושר נמצא:', trade, { page: "executions" });
        linkedObject = { type: 'trade', data: trade };
        tickerId = trade.ticker_id;
      } else {
        window.Logger.info('❌ [EDIT MODAL] טרייד מקושר לא נמצא:', execution.trade_id, { page: "executions" });
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
      window.Logger.info('🔍 [EDIT MODAL] מעדכן שדה טיקר ל-ID:', tickerId, { page: "executions" });
      const tickerSelect = document.getElementById('editExecutionTicker');
      if (tickerSelect) {
        tickerSelect.value = tickerId;
        window.Logger.info('✅ [EDIT MODAL] שדה טיקר עודכן ל:', tickerId, { page: "executions" });
        // טעינת טריידים ותכנונים לטיקר זה
        await loadActiveTradesForTicker('edit');
        window.Logger.info('✅ [EDIT MODAL] טריידים נטענו לטיקר:', tickerId, { page: "executions" });
      } else {
        window.Logger.info('❌ [EDIT MODAL] שדה טיקר לא נמצא ב-DOM', { page: "executions" });
      }
    } else {
      window.Logger.info('⚠️ [EDIT MODAL] אין tickerId לעדכון', { page: "executions" });
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
          window.Logger.info('🔍 [EDIT MODAL] מחפש ערך טרייד:', value, 'באפשרויות:', Array.from(tradeSelect.options, { page: "executions" }).map(o => `${o.value}(${o.text})`));
          const optionExists = Array.from(tradeSelect.options).some(option => option.value === value);
          if (optionExists) {
            tradeSelect.value = value;
            window.Logger.info('✅ [EDIT MODAL] שדה טרייד/תכנון מולא:', value, { page: "executions" });
            return true;
          }
          return false;
        };

        // נסיון ראשון
        if (!trySetTradeValue()) {
          window.Logger.info('⚠️ הערך לא נמצא באפשרויות:', value, 'אפשרויות:', Array.from(tradeSelect.options, { page: "executions" }).map(o => o.value));
          
          // נסיון נוסף אחרי זמן קצר
          setTimeout(() => {
            if (!trySetTradeValue()) {
              window.Logger.info('❌ לא ניתן למלא שדה טרייד/תכנון:', value, { page: "executions" });
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
        window.Logger.info('✅ [EDIT MODAL] שדה פעולה מולא:', actionValue, { page: "executions" });
      } else {
        window.Logger.info('❌ [EDIT MODAL] שדה פעולה לא נמצא ב-DOM', { page: "executions" });
      }
    } else {
      window.Logger.info('⚠️ [EDIT MODAL] אין ערך פעולה לעסקה', { page: "executions" });
    }

    // מילוי שדה הכמות
    if (execution.quantity) {
      const quantityField = document.getElementById('editExecutionQuantity');
      if (quantityField) {
        quantityField.value = execution.quantity;
        window.Logger.info('✅ [EDIT MODAL] שדה כמות מולא:', execution.quantity, { page: "executions" });
      } else {
        window.Logger.info('❌ [EDIT MODAL] שדה כמות לא נמצא ב-DOM', { page: "executions" });
      }
    } else {
      window.Logger.info('⚠️ [EDIT MODAL] אין כמות לעסקה', { page: "executions" });
    }

    // מילוי שדה המחיר
    if (execution.price) {
      const priceField = document.getElementById('editExecutionPrice');
      if (priceField) {
        priceField.value = execution.price;
        window.Logger.info('✅ [EDIT MODAL] שדה מחיר מולא:', execution.price, { page: "executions" });
      } else {
        window.Logger.info('❌ [EDIT MODAL] שדה מחיר לא נמצא ב-DOM', { page: "executions" });
      }
    } else {
      window.Logger.info('⚠️ [EDIT MODAL] אין מחיר לעסקה', { page: "executions" });
    }

    // עיבוד תאריך ביצוע - בדיקה של שדות שונים
    executionDate = execution.date || execution.execution_date || execution.created_at;
    window.Logger.info('🔍 [EDIT MODAL] תאריך ביצוע גולמי:', executionDate, { page: "executions" });
    window.Logger.info('🔍 [EDIT MODAL] שדות תאריך זמינים:', {
      date: execution.date,
      execution_date: execution.execution_date,
      created_at: execution.created_at
    }, { page: "executions" });
    if (executionDate) {
      try {
        // המרה לפורמט datetime-local
        const date = new Date(executionDate);
        const localDateTime = date.toISOString().slice(0, 16);
        const dateField = document.getElementById('editExecutionDate');
        if (dateField) {
          dateField.value = localDateTime;
          window.Logger.info('✅ [EDIT MODAL] שדה תאריך מולא:', localDateTime, 'מהתאריך:', executionDate, { page: "executions" });
        } else {
          window.Logger.info('❌ [EDIT MODAL] שדה תאריך לא נמצא ב-DOM', { page: "executions" });
        }
      } catch (error) {
        window.Logger.info('❌ [EDIT MODAL] שגיאה בעיבוד תאריך:', error, 'תאריך גולמי:', executionDate, { page: "executions" });
        const dateField = document.getElementById('editExecutionDate');
        if (dateField) {
          dateField.value = '';
        }
      }
    } else {
      window.Logger.info('⚠️ [EDIT MODAL] אין תאריך ביצוע לעסקה', { page: "executions" });
      const dateField = document.getElementById('editExecutionDate');
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
        window.Logger.info('✅ [EDIT MODAL] שדה עמלה מולא:', commissionValue, { page: "executions" });
      } else {
        window.Logger.info('❌ [EDIT MODAL] שדה עמלה לא נמצא ב-DOM', { page: "executions" });
      }
    } else {
      window.Logger.info('⚠️ [EDIT MODAL] אין עמלה לעסקה', { page: "executions" });
    }

    // מילוי שדה המקור
    const sourceValue = execution.source || execution.source_type || execution.source_name || execution.sourceType || 'manual';
    const sourceField = document.getElementById('editExecutionSource');
    if (sourceField) {
      sourceField.value = sourceValue;
      window.Logger.info('✅ [EDIT MODAL] שדה מקור מולא:', sourceValue, { page: "executions" });
    } else {
      window.Logger.info('❌ [EDIT MODAL] שדה מקור לא נמצא ב-DOM', { page: "executions" });
    }

    // מילוי שדה מזהה חיצוני אם קיים
    const externalIdValue = execution.external_id || execution.externalId || '';
    const externalIdField = document.getElementById('editExecutionExternalId');
    if (externalIdField) {
      externalIdField.value = externalIdValue;
      if (externalIdValue) {
        window.Logger.info('✅ [EDIT MODAL] שדה מזהה חיצוני מולא:', externalIdValue, { page: "executions" });
      }
    } else {
      window.Logger.info('❌ [EDIT MODAL] שדה מזהה חיצוני לא נמצא ב-DOM', { page: "executions" });
    }

    // הצגת/הסתרת שדה מזהה חיצוני לפי המקור
    toggleExternalIdField('edit');

    // מילוי שדה ההערות
    const notesValue = execution.notes || '';
    if (notesValue) {
      const notesField = document.getElementById('editExecutionNotes');
      if (notesField) {
        notesField.value = notesValue;
        window.Logger.info('✅ [EDIT MODAL] שדה הערות מולא:', notesValue, { page: "executions" });
      } else {
        window.Logger.info('❌ [EDIT MODAL] שדה הערות לא נמצא ב-DOM', { page: "executions" });
      }
    } else {
      window.Logger.info('⚠️ [EDIT MODAL] אין הערות לעסקה', { page: "executions" });
    }

    // הצגת כפתור קישור לטרייד/תכנון אם יש
    const tradeLinkButton = document.getElementById('editExecutionTradeLink');
    if (tradeLinkButton && linkedObject) {
      tradeLinkButton.style.display = 'block';
      tradeLinkButton.setAttribute('data-trade-id', linkedObject.data.id);
      tradeLinkButton.setAttribute('data-object-type', linkedObject.type);
    }

  } catch (error) {
    handleApiError(error, 'פרטי אובייקט מקושר');
  }

  clearExecutionValidationErrors();

  // הפעלת כל השדות בעריכת עסקה
  enableAllFields('edit');

  // חישוב ערכים מחושבים
  calculateEditExecutionValues();

  window.Logger.info('🎯 [EDIT MODAL] סיכום מילוי טופס עריכה:', { page: "executions" });
  window.Logger.info('🎯 [EDIT MODAL] - עסקה ID:', execution.id, { page: "executions" });
  window.Logger.info('🎯 [EDIT MODAL] - טרייד מקושר:', linkedObject ? `${linkedObject.type}:${linkedObject.data.id}` : 'אין', { page: "executions" });
  window.Logger.info('🎯 [EDIT MODAL] - טיקר:', tickerId, { page: "executions" });
  window.Logger.info('🎯 [EDIT MODAL] - פעולה:', actionValue, { page: "executions" });
  window.Logger.info('🎯 [EDIT MODAL] - כמות:', execution.quantity, { page: "executions" });
  window.Logger.info('🎯 [EDIT MODAL] - מחיר:', execution.price, { page: "executions" });
  window.Logger.info('🎯 [EDIT MODAL] - תאריך:', executionDate, { page: "executions" });

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('editExecutionModal'));
  modal.show();
}

// פונקציה זו הוסרה - שימוש במערכת הגלובלית showDeleteWarning

// ========================================
// פונקציות ולידציה
// ========================================


/**
 * ולידציה של מזהה טרייד
 */
function validateExecutionTradeId(input) {
  try {
    const selectedValue = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!selectedValue) {
      // סימון השדה כשגוי
      input.classList.add('is-invalid');
      if (errorElement) {
        errorElement.textContent = 'בחירת טרייד או תכנון היא שדה חובה';
      errorElement.style.display = 'block';
    }
    return false;
  }

  // בדיקה שהערך הוא מספר חיובי
  const numId = parseInt(selectedValue);
  if (isNaN(numId) || numId < 0) {
    // סימון השדה כשגוי
    input.classList.add('is-invalid');
    if (errorElement) {
      errorElement.textContent = 'מזהה טרייד חייב להיות מספר חיובי';
      errorElement.style.display = 'block';
    }
    return false;
  }

  clearFieldError(input, errorElement);
  return true;
  
  } catch (error) {
    window.Logger.error('שגיאה בוולידציה של מזהה טרייד:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בוולידציה של מזהה טרייד', error.message);
    }
    return false;
  }
}

/**
 * ולידציה של כמות
 * @deprecated השתמש ב-window.validateField() במקום
 */
function validateExecutionQuantity(input) {
  return window.validateField(input, {required: true, min: 0.01});
}

/**
 * ולידציה של מחיר
 * @deprecated השתמש ב-window.validateField() במקום
 */
function validateExecutionPrice(input) {
  return window.validateField(input, {required: true, min: 0.01});
}

/**
 * ולידציה של עמלה (fee)
 * @deprecated השתמש ב-window.validateField() במקום
 */
function validateExecutionCommission(input) {
  return window.validateField(input, {required: false, min: 0});
}

/**
 * ולידציה של מקור (source)
 * @deprecated השתמש ב-window.validateField() במקום
 */
function validateExecutionSource(input) {
  return window.validateField(input, {required: false, maxLength: 100});
}

/**
 * ולידציה של הערות (notes)
 * @deprecated השתמש ב-window.validateField() במקום
 */
function validateExecutionNotes(input) {
  return window.validateField(input, {required: false, maxLength: 500});
}

/**
 * ולידציה של מזהה חיצוני (external_id)
 * @deprecated השתמש ב-window.validateField() במקום
 */
function validateExecutionExternalId(input) {
  return window.validateField(input, {required: false, maxLength: 100});
}

/**
 * ולידציה של תאריך (date)
 */
function validateExecutionDate(input) {
  try {
    const date = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!date) {
      if (window.showValidationWarning) {
        window.showValidationWarning(input.id, 'תאריך עסקה הוא שדה חובה (לפי אילוץ NOT NULL)');
      }
      return false;
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      if (window.showValidationWarning) {
        window.showValidationWarning(input.id, 'תאריך לא תקין');
    }
    return false;
  }

  const today = new Date();
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  if (dateObj > maxDate) {
    if (window.showValidationWarning) {
      window.showValidationWarning(input.id, 'תאריך לא יכול להיות יותר משנה קדימה');
    }
    return false;
  }

  const minDate = new Date(2000, 0, 1);
  if (dateObj < minDate) {
    if (window.showValidationWarning) {
      window.showValidationWarning(input.id, 'תאריך לא יכול להיות לפני שנת 2000');
    }
    return false;
  }

  clearFieldError(input, errorElement);
  return true;
  
  } catch (error) {
    window.Logger.error('שגיאה בוולידציה של תאריך:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בוולידציה של תאריך', error.message);
    }
    return false;
  }
}

/**
 * ולידציה של סוג עסקה (action)
 */
function validateExecutionType(input) {
  try {
    const type = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!type) {
      return false;
    }

    // בדיקה שהערך הוא אחד מהערכים המותרים בבסיס הנתונים (ENUM: buy, sale)
    if (type !== 'buy' && type !== 'sale') {
      return false;
    }

    clearFieldError(input, errorElement);
    return true;
  } catch (error) {
    window.Logger.error('שגיאה בוולידציה של סוג עסקה:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בוולידציה של סוג עסקה', error.message);
    }
    return false;
  }
}

/**
 * הצגת שגיאת שדה
 */
// showFieldError() - זמינה גלובלית מ-ui-utils.js כ-showValidationWarning

/**
 * ניקוי שגיאת שדה
 */
function clearFieldError(input, errorElement) {
  try {
    input.classList.remove('is-invalid');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  } catch (error) {
    window.Logger.error('שגיאה בניקוי שגיאת שדה:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בניקוי שגיאת שדה', error.message);
    }
  }
}

/**
 * ניקוי כל שגיאות הולידציה
 */
function clearExecutionValidationErrors() {
  try {
    const form = document.getElementById('addExecutionForm');
    if (form) {
      const inputs = form.querySelectorAll('.is-invalid');
      inputs.forEach(input => {
        input.classList.remove('is-invalid');
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) {
          errorElement.textContent = '';
          errorElement.style.display = 'none';
        }
      });
    }

  const editForm = document.getElementById('editExecutionForm');
  if (editForm) {
    const inputs = editForm.querySelectorAll('.is-invalid');
    inputs.forEach(input => {
      input.classList.remove('is-invalid');
      const errorElement = document.getElementById(input.id + 'Error');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    });
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בניקוי שגיאות ולידציה:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בניקוי שגיאות ולידציה', error.message);
    }
  }
}

// ולידציה - משתמש במערכת הכללית window.validateEntityForm
/**
 * ולידציה מלאה של טופס ביצוע
 * @deprecated השתמש ב-window.validateForm() או window.validateEntityForm() במקום
 */
function validateCompleteExecutionForm(mode) {
  const prefix = mode === 'add' ? 'add' : 'edit';
  const formId = `${prefix}ExecutionForm`;
  
  const fieldConfigs = [
    {id: `${prefix}ExecutionTradeId`, name: 'טרייד/תוכנית', rules: {required: true}},
    {id: `${prefix}ExecutionType`, name: 'סוג עסקה', rules: {required: true}},
    {id: `${prefix}ExecutionQuantity`, name: 'כמות', rules: {required: true, min: 0.01, max: 1000000}},
    {id: `${prefix}ExecutionPrice`, name: 'מחיר', rules: {required: true, min: 0.01, max: 1000000}},
    {id: `${prefix}ExecutionDate`, name: 'תאריך', rules: {required: true}},
    {id: `${prefix}ExecutionCommission`, name: 'עמלה', rules: {required: false, min: 0, max: 10000}},
    {id: `${prefix}ExecutionNotes`, name: 'הערות', rules: {required: false, maxLength: 500}},
    {id: `${prefix}ExecutionSource`, name: 'מקור', rules: {required: false, maxLength: 100}},
    {id: `${prefix}ExecutionExternalId`, name: 'מזהה חיצוני', rules: {required: false, maxLength: 100}}
  ];
  
  const result = window.validateEntityForm(formId, fieldConfigs);

  // הצגת הודעת שגיאה מפורטת אם יש שגיאות
  if (!result.isValid && result.errorMessages.length > 0) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאות ולידציה', result.errorMessages.join('\n'));
    }
  }
  
  return result.isValid;
}


// ========================================
// פונקציות שמירה ועדכון
// ========================================

/**
 * שמירת עסקה חדשה
 */
async function saveExecution() {


  // איסוף נתונים מהטופס באמצעות DataCollectionService
  const executionData = DataCollectionService.collectFormData({
    trade_id: { id: 'addExecutionTradeId', type: 'int' },
    action: { id: 'addExecutionType', type: 'text' },
    quantity: { id: 'addExecutionQuantity', type: 'int' },
    price: { id: 'addExecutionPrice', type: 'number' },
    date: { id: 'addExecutionDate', type: 'date' },
    fee: { id: 'addExecutionCommission', type: 'number' },
    notes: { id: 'addExecutionNotes', type: 'text' },
    source: { id: 'addExecutionSource', type: 'text', default: 'manual' }
  });

  const tradeIdValue = executionData.trade_id;
  const type = executionData.action;
  const quantity = executionData.quantity;
  const price = executionData.price;
  const executionDate = executionData.date;
  const commission = executionData.fee;
  const notes = executionData.notes;

  // ולידציה - משתמש במערכת הכללית window.validateEntityForm

  // בדיקת ערך action
  if (!type || type !== 'buy' && type !== 'sale') {
    handleValidationError('addExecutionType', 'יש לבחור פעולה תקינה (קניה או מכירה)');
    return;
  }

  // עיבוד ערך trade_id - עכשיו זה מספר ישיר
  let tradeId = null;
  if (tradeIdValue) {
    tradeId = parseInt(tradeIdValue);
    if (isNaN(tradeId) || tradeId < 0) {
      handleValidationError('addExecutionTradeId', 'מזהה טרייד לא תקין');
      return;
    }
  }

  try {
    const executionPayload = {
      trade_id: tradeId,
      action: type,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      date: executionDate ? new Date(executionDate).toISOString() : null,
      fee: commission ? parseFloat(commission) : null,
      source: 'manual',
      notes: notes || null,
    };

    const response = await fetch('/api/executions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(executionPayload),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'addExecutionModal',
      successMessage: 'עסקה נשמרה בהצלחה!',
      apiUrl: '/api/executions/',
      entityName: 'עסקה'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת עסקה');
  }
}

/**
 * עדכון עסקה קיימת
 */
async function updateExecutionWrapper() {


  const id = document.getElementById('editExecutionId').value;
  const tradeIdValue = document.getElementById('editExecutionTradeId').value;
  const type = document.getElementById('editExecutionType').value;
  const quantity = document.getElementById('editExecutionQuantity').value;
  const price = document.getElementById('editExecutionPrice').value;
  const executionDate = document.getElementById('editExecutionDate').value;
  const commission = document.getElementById('editExecutionCommission').value;
  const notes = document.getElementById('editExecutionNotes').value.trim();

  // ולידציה - משתמש במערכת הכללית window.validateEntityForm

  // בדיקת ערך action
  if (!type || type !== 'buy' && type !== 'sale') {
    handleValidationError('editExecutionType', 'יש לבחור פעולה תקינה (קניה או מכירה)');
    return;
  }

  // עיבוד ערך trade_id - עכשיו זה מספר ישיר
  let tradeId = null;
  if (tradeIdValue) {
    tradeId = parseInt(tradeIdValue);
    if (isNaN(tradeId) || tradeId < 0) {
      handleValidationError('editExecutionTradeId', 'מזהה טרייד לא תקין');
      return;
    }
  }

  try {
    const source = document.getElementById('editExecutionSource')?.value || 'manual';

    const executionData = {
      trade_id: tradeId,
      action: type,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      date: executionDate ? new Date(executionDate).toISOString() : null,
      fee: commission ? parseFloat(commission) : null,
      source,
      notes: notes || null,
    };


    const response = await fetch(`/api/executions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(executionData),
    });

    if (response.ok) {
      await response.json();


      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('editExecutionModal'));
      modal.hide();

      // הצגת הודעת הצלחה
      // Showing success notification for update
      // window.showSuccessNotification exists check

      if (typeof window.showSuccessNotification === 'function') {
        // Calling showSuccessNotification
        window.showSuccessNotification('הצלחה', 'עסקה עודכנה בהצלחה במערכת', 4000, 'business');
      } else {
        handleSystemError(new Error('showSuccessNotification not available'), 'מערכת התראות');
      }

      // רענון הנתונים
      await loadExecutionsData();

    } else {
      const result = await response.json();
      handleSaveError(new Error(result.error), 'עדכון עסקה');

      // טיפול בשגיאות וולידציה מהשרת
      if (result.error && result.error.message) {
        const serverMessage = result.error.message;

        // אם זו שגיאת וולידציה, נפרק אותה להודעות ספציפיות
        if (serverMessage.includes('validation failed')) {
          const validationErrors = serverMessage.replace('Execution validation failed: ', '').split('; ');

          // הצגת כל שגיאה בנפרד
          validationErrors.forEach(error => {
            let fieldError = error;
            let fieldName = '';

            // תרגום שגיאות ספציפיות
            if (error.includes('Field \'action\' has invalid value')) {
              fieldError = 'סוג עסקה לא תקין - יש לבחור ערך מהרשימה';
              fieldName = 'editExecutionType';
            } else if (error.includes('Field \'source\' has invalid value')) {
              fieldError = 'מקור לא תקין - יש לבחור ערך מהרשימה';
              fieldName = 'editExecutionSource';
            } else if (error.includes('Field \'quantity\' is out of range')) {
              fieldError = 'כמות חייבת להיות חיובית';
              fieldName = 'editExecutionQuantity';
            } else if (error.includes('Field \'price\' is out of range')) {
              fieldError = 'מחיר חייב להיות חיובי';
              fieldName = 'editExecutionPrice';
            } else if (error.includes('Field \'date\' is out of range')) {
              fieldError = 'תאריך עסקה חייב להיות אחרי תאריך פתיחת הטרייד';
              fieldName = 'editExecutionDate';
            } else if (error.includes('Field \'trade_id\' references non-existent record')) {
              fieldError = 'טרייד לא קיים במערכת';
              fieldName = 'editExecutionTradeId';
            }

            // שימוש במערכת ההתראות המובנת
            // Field validation error (edit) check
            // window.showValidationWarning exists (edit) check

            if (fieldName && window.showValidationWarning) {
              // Calling showValidationWarning (edit)
              window.showValidationWarning(fieldName, fieldError);
            } else {
              // Using showErrorNotification as fallback (edit)
              window.showErrorNotification('שגיאת וולידציה', fieldError);
            }
          });
        } else {
          // שגיאה כללית
          window.showErrorNotification('שגיאה בעדכון', serverMessage);
        }
      } else {
        // הצגת הודעת שגיאה כללית
        window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון עסקה - בדוק את הנתונים שהוזנו');
      }
    }

  } catch (error) {
    handleSaveError(error, 'עדכון עסקה');
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

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'עסקה נמחקה בהצלחה!',
      apiUrl: '/api/executions/',
      entityName: 'עסקה'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת עסקה');
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
    handleApiError(error, 'נתונים מקושרים');
  }
}

/**
 * טעינת פרטי הפריטים המקושרים
 */
async function loadLinkedItemsDetails(executionId, _errorData = null) {


  const contentDiv = document.getElementById('linkedItemsContent');
  contentDiv.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><br>טוען פרטים...</div>';

  try {
    // קריאה ל-API לקבלת פרטי הפריטים המקושרים
    const response = await fetch(`/api/executions/${executionId}/linked-items`);

    if (response.ok) {
      const data = await response.json();

      displayLinkedItems(data.data);
    } else {

      // אם אין API ספציפי, ננסה לטעון מכל ה-APIs
      await loadLinkedItemsFromMultipleSources(executionId);
    }

  } catch (error) {
    handleApiError(error, 'פריטים מקושרים');
    // אם יש שגיאה, ננסה לטעון מכל ה-APIs
    await loadLinkedItemsFromMultipleSources(executionId);
  }
}

/**
 * טעינת פריטים מקושרים ממקורות מרובים
 */
async function loadLinkedItemsFromMultipleSources(executionId) {


  const execution = executionsData.find(e => e.id === executionId);
  if (!execution) {return;}

  const linkedItems = {
    trades: [],
    trade_plans: [],
    alerts: [],
    notes: [],
  };

  try {
    // טעינת טריידים
    try {
      const tradesResponse = await fetch('/api/trades/');
      if (tradesResponse.ok) {
        const linkedTradesData = await tradesResponse.json();
        const trades = linkedTradesData.data || linkedTradesData || [];
        linkedItems.trades = trades.filter(trade =>
          trade.id === execution.trade_id,
        );
      }
    } catch (e) { 
      window.Logger.warn('לא ניתן לטעון טריידים:', e, { page: "executions" }); 
    }

    // טעינת תכנונים
    try {
      const plansResponse = await fetch('/api/trade_plans/');
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        const plans = plansData.data || plansData || [];
        linkedItems.trade_plans = plans.filter(plan =>
          plan.trade_id === execution.trade_id,
        );
      }
    } catch (e) { 
      window.Logger.warn('לא ניתן לטעון תכנונים:', e, { page: "executions" }); 
    }

    // טעינת התראות
    try {
      const alertsResponse = await fetch('/api/alerts/');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        const alerts = alertsData.data || alertsData || [];
        linkedItems.alerts = alerts.filter(alert =>
          alert.related_type_id === 5 && alert.related_id === executionId &&
                    alert.status === 'open',
        );
      }
    } catch (e) { 
      window.Logger.warn('לא ניתן לטעון התראות:', e, { page: "executions" }); 
    }

    // טעינת הערות
    try {
      const notesResponse = await fetch('/api/notes/');
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        const notes = notesData.data || notesData || [];
        linkedItems.notes = notes.filter(note =>
          note.related_type_id === 5 && note.related_id === executionId,
        );
      }
    } catch (e) { 
      window.Logger.warn('לא ניתן לטעון הערות:', e, { page: "executions" }); 
    }

    displayLinkedItems(linkedItems);

  } catch (error) {
    handleApiError(error, 'פריטים מקושרים');
    document.getElementById('linkedItemsContent').innerHTML =
            '<div class="alert alert-danger">שגיאה בטעינת פרטי הפריטים המקושרים</div>';
  }
}

/**
 * הצגת הפריטים המקושרים
 */
function displayLinkedItems(linkedItems) {
  try {
    // הצגת פריטים מקושרים
    // סוג הנתונים
    // מפתחות

    const contentDiv = document.getElementById('linkedItemsContent');
    let html = '';

    // טריידים מקושרים
    // בדיקת טריידים מקושרים
    // האם קיים trades
    // אורך trades
    if (linkedItems.trades && linkedItems.trades.length > 0) {
      // נמצאו טריידים מקושרים, יוצר HTML
      html += `
            <div class="card mb-3">
                <div class="card-header bg-warning text-dark">
                    <h6 class="mb-0">🔄 טריידים מקושרים (${linkedItems.trades.length})</h6>
                </div>
                <div class="card-body">
                    <p><strong>נמצאו ${linkedItems.trades.length} טריידים מקושרים:</strong></p>
                    <ul>
                        ${linkedItems.trades.map(trade => `
                            <li>
                                טרייד #${trade.id} - חשבון: ${trade.account_name || 'לא זמין'} - סטטוס: ${trade.status}
                                <button class="btn btn-sm ms-2" onclick="goToTrade(${trade.id})">
                                    עבור לטרייד
                                </button>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
  }

  // תכנונים מקושרים
  // בדיקת תכנונים מקושרים
  if (linkedItems.trade_plans && linkedItems.trade_plans.length > 0) {
    html += `
            <div class="card mb-3">
                <div class="card-header bg-info text-white">
                    <h6 class="mb-0">📋 תכנונים מקושרים (${linkedItems.trade_plans.length})</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>מזהה</th>
                                    <th>סוג השקעה</th>
                                    <th>סטטוס</th>
                                    <th>תאריך יצירה</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linkedItems.trade_plans.map(plan => `
                                    <tr>
                                        <td>${plan.id}</td>
                                        <td>${plan.investment_type}</td>
                                        <td><span class="badge bg-info">${plan.status}</span></td>
                                        <td>${formatDate(plan.created_at)}</td>
                                        <td>
                                            <button class="btn btn-sm" 
                                              onclick="goToPlan(${plan.id})">
                                                עבור לתכנון
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
  }

  // התראות פעילות
  if (linkedItems.alerts && linkedItems.alerts.length > 0) {
    html += `
            <div class="card mb-3">
                <div class="card-header bg-danger text-white">
                    <h6 class="mb-0">🚨 התראות פעילות (${linkedItems.alerts.length})</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>מזהה</th>
                                    <th>סוג התראה</th>
                                    <th>תנאי</th>
                                    <th>סטטוס</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linkedItems.alerts.map(alert => `
                                    <tr>
                                        <td>${alert.id}</td>
                                        <td>${alert.alert_type}</td>
                                        <td>${alert.condition || 'לא זמין'}</td>
                                        <td><span class="badge ${
  window.getAlertStatusClass ?
    window.getAlertStatusClass(alert.status, alert.is_triggered) :
    'bg-danger'
}">${
  window.getAlertStatusDisplay ?
    window.getAlertStatusDisplay(alert.status, alert.is_triggered) :
    alert.status
}</span></td>
                                        <td>
                                            <button class="btn btn-sm" 
                                              onclick="goToAlert(${alert.id})">
                                                עבור להתראה
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        `;
  }

  // הערות
  if (linkedItems.notes && linkedItems.notes.length > 0) {
    html += `
            <div class="card mb-3">
                <div class="card-header bg-secondary text-white">
                    <h6 class="mb-0">📝 הערות (${linkedItems.notes.length})</h6>
            </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>מזהה</th>
                                    <th>תוכן</th>
                                    <th>תאריך יצירה</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linkedItems.notes.map(note => `
                                    <tr>
                                        <td>${note.id}</td>
                                        <td>${
  note.content ?
    note.content.substring(0, 50) + '...' :
    'ללא תוכן'
}</td>
                                        <td>${formatDate(note.created_at)}</td>
                                        <td>
                                            <button class="btn btn-sm" 
                                              onclick="goToNote(${note.id})">
                                                עבור להערה
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
        </div>
                </div>
        </div>
    `;
  }

  // HTML שנוצר
  if (!html) {
    html = '<div class="alert alert-success">✅ לא נמצאו פריטים מקושרים פתוחים. ' +
      'ניתן למחוק את הטיקר בבטחה.</div>';
  }

  contentDiv.innerHTML = html;
  
  } catch (error) {
    window.Logger.error('שגיאה בהצגת פריטים מקושרים:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פריטים מקושרים', error.message);
    }
  }
}

/**
 * מעבר לניהול פריטים מקושרים
 */
function goToLinkedItems() {
  try {
    // סגירת המודל
    const modal = bootstrap.Modal.getInstance(document.getElementById('linkedItemsModal'));
    modal.hide();

    // מעבר לדף הניהול הרלוונטי (לפי הפריט הראשון שנמצא)
    window.location.href = '/trade_plans'; // ברירת מחדל - דף תכנון
  } catch (error) {
    window.Logger.error('שגיאה במעבר לפריטים מקושרים:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במעבר לפריטים מקושרים', error.message);
    }
  }
}

/**
 * מעבר לטרייד ספציפי
 */
function goToTrade(tradeId) {
  try {
    window.location.href = `/trade_plans#trade-${tradeId}`;
  } catch (error) {
    window.Logger.error('שגיאה במעבר לטרייד:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במעבר לטרייד', error.message);
    }
  }
}

/**
 * מעבר לתכנון ספציפי
 */
function goToPlan(planId) {
  try {
    window.location.href = `/trade_plans#plan-${planId}`;
  } catch (error) {
    window.Logger.error('שגיאה במעבר לתכנון:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במעבר לתכנון', error.message);
    }
  }
}

/**
 * מעבר להתראה ספציפית
 */
function goToAlert(alertId) {
  try {
    window.location.href = `/alerts#alert-${alertId}`;
  } catch (error) {
    window.Logger.error('שגיאה במעבר להתראה:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במעבר להתראה', error.message);
    }
  }
}

/**
 * מעבר להערה ספציפית
 */
function goToNote(noteId) {
  try {
    window.location.href = `/notes#note-${noteId}`;
  } catch (error) {
    window.Logger.error('שגיאה במעבר להערה:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במעבר להערה', error.message);
    }
  }
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
      handleApiError(new Error(`סטטוס: ${response.status} - ${errorText}`), 'עסקעות');
      handleApiError(new Error(`סטטוס: ${response.status} - ${errorText}`), 'עסקעות');
    }

  } catch (error) {
    handleApiError(error, 'עסקעות');
  }
}

/**
 * עדכון טבלת עסקעות
 */
async function updateExecutionsTableMain(executions) {
  // updateExecutionsTableMain called with executions
  const tbody = document.querySelector('#executionsTable tbody');
  if (!tbody) {
    // // window.Logger.warn('⚠️ executionsTable tbody not found - this is expected on trades page', { page: "executions" });
    return;
  }

  // זיהוי רשומות חדשות
  const existingExecutionIds = new Set();
  const existingRows = tbody.querySelectorAll('tr[data-execution-id]');
  existingRows.forEach(row => {
    const executionId = row.getAttribute('data-execution-id');
    if (executionId) {
      existingExecutionIds.add(parseInt(executionId));
    }
  });

  const newExecutionIds = executions
    .map(exec => exec.id)
    .filter(id => !existingExecutionIds.has(id));

  if (executions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">לא נמצאו עסקעות</td></tr>';
    return;
  }

  // קבלת צבעים מהמערכת הגלובלית
  const colors = window.getTableColors();
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
          // // window.Logger.warn('⚠️ Trades API returned error:', r.status, { page: "executions" });
          return { data: [] };
        }
      }).catch(() => ({ data: [] })),
      fetch('/api/tickers/').then(r => {
        if (r.ok) {
          return r.json();
        } else {
          // // window.Logger.warn('⚠️ Tickers API returned error:', r.status, { page: "executions" });
          return { data: [] };
        }
      }).catch(() => ({ data: [] })),
    ]);

    trades = tradesResponse.data || [];
    tickers = tickersResponse.data || [];

    // וידוא שהנתונים הם מערכים
    if (!Array.isArray(trades)) {
      // // window.Logger.warn('⚠️ trades אינו מערך:', trades, { page: "executions" });
      trades = [];
    }
    if (!Array.isArray(tickers)) {
      // // window.Logger.warn('⚠️ tickers אינו מערך:', tickers, { page: "executions" });
      tickers = [];
    }

    // נטענו טריידים וטיקרים
  } catch {
    // // window.Logger.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error, { page: "executions" });
    trades = [];
    tickers = [];
  }

  tbody.innerHTML = executions.map(execution => {
    // מציאת הטרייד המקושר
    const trade = trades.find(t => t.id === execution.trade_id);
    let symbol = 'לא מוגדר';
    let tradeInfo = '';
    let ticker = null;

    if (trade) {
      // מציאת הטיקר
      ticker = tickers.find(t => t.id === trade.ticker_id);
      symbol = ticker ? ticker.symbol : 'לא מוגדר';

      // מידע על הטרייד: תאריך פתיחה | צד | סוג
      const openDate = trade.created_at ? new Date(trade.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
      const side = trade.side || 'לא מוגדר';
      const type = trade.investment_type || 'לא מוגדר';

      tradeInfo = `${openDate} | ${side} | ${type}`;
    } else {
      tradeInfo = `טרייד ${execution.trade_id}`;
    }

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = (execution.action || execution.type) === 'buy' ? 'קנייה' :
      (execution.action || execution.type) === 'sale' ? 'מכירה' :
        execution.action || execution.type;

    // מציאת שם החשבון מהטרייד
    const accountName = trade ? trade.account_name : 'לא מוגדר';

    return `
            <tr data-execution-id="${execution.id}" class="execution-row">
                                   <td class="ticker-cell">
                       <div style="display: flex; align-items: center; gap: 8px;">
                           <strong style="cursor: pointer; color: ${positiveColor};" 
                             onclick="if(window.showEntityDetailsModal) { window.showEntityDetailsModal('ticker', ${ticker ? ticker.id : 'null'}, 'view'); } else { window.Logger.info('Entity details modal not available', { page: "executions" }); }" 
                             title="פתח פרטי סימבול">${symbol}</strong>
                       </div>
                   </td>
                <td class="type-cell" data-type="${typeForFilter}">
                    ${window.renderAction ? window.renderAction(execution.action || execution.type) : 
                      `<span class="${(execution.action || execution.type) === 'buy' ? 'profit-positive' : 'profit-negative'}">
                        ${(execution.action || execution.type) === 'buy' ? 'קניה' : 'מכירה'}
                      </span>`}
                </td>
                <td data-account="${accountName}" style="cursor: pointer;" 
                  onclick="if(window.showEntityDetailsModal) { window.showEntityDetailsModal('account', '${accountName}', 'view'); } else { window.Logger.info('Entity details modal not available', { page: "executions" }); }" 
                  title="פתח פרטי חשבון">${accountName}</td>
                <td>${window.renderShares ? window.renderShares(execution.quantity) : execution.quantity}</td>
                <td>$${execution.price}</td>
                <td class="pl-cell">$0</td>
                <td data-date="${execution.date || execution.execution_date}">${window.renderExecutionDate ? window.renderExecutionDate(execution.date || execution.execution_date) : (execution.date || execution.execution_date ? new Date(execution.date || execution.execution_date).toLocaleDateString('he-IL') : '-')}</td>
                <td style="text-align: left; direction: ltr;">${execution.source || '-'}</td>
                <td class="actions-cell">
                    ${window.createActionsMenu ? window.createActionsMenu([
                      { type: 'VIEW', onclick: `window.showEntityDetails('execution', ${execution.id}, { mode: 'view' })`, title: 'צפה בפרטי עסקה' },
                      { type: 'LINK', onclick: `window.Logger.info('🔗 [LINKED ITEMS] לחיצה על כפתור מקושרים עבור עסקה:', ${execution.id}, { page: "executions" }); if(window.loadLinkedItemsData) { window.loadLinkedItemsData('execution', ${execution.id}).then(data => { window.Logger.info('🔗 [LINKED ITEMS] נתונים נטענו:', data, { page: "executions" }); if(data) { window.Logger.info('🔗 [LINKED ITEMS] מציג מודל עם נתונים', { page: "executions" }); window.showLinkedItemsModal(data, 'execution', ${execution.id}, 'view'); } else { window.Logger.info('❌ [LINKED ITEMS] אין נתונים להצגה', { page: "executions" }); } }); } else { window.Logger.info('❌ [LINKED ITEMS] loadLinkedItemsData לא זמין', { page: "executions" }); }`, title: 'פריטים מקושרים' },
                      { type: 'EDIT', onclick: `editExecution(${execution.id})`, title: 'ערוך' },
                      { type: 'DELETE', onclick: `deleteExecution(${execution.id})`, title: 'מחק' }
                    ]) : `
                    <button class="btn btn-sm" 
                      onclick="window.showEntityDetails('execution', ${execution.id}, { mode: 'view' })" 
                      title="צפה בפרטי עסקה">👁️</button>
                    <button class="btn btn-sm" 
                      onclick="window.Logger.info('🔗 [LINKED ITEMS] לחיצה על כפתור מקושרים עבור עסקה:', ${execution.id}, { page: "executions" }); if(window.loadLinkedItemsData) { window.loadLinkedItemsData('execution', ${execution.id}).then(data => { window.Logger.info('🔗 [LINKED ITEMS] נתונים נטענו:', data, { page: "executions" }); if(data) { window.Logger.info('🔗 [LINKED ITEMS] מציג מודל עם נתונים', { page: "executions" }); window.showLinkedItemsModal(data, 'execution', ${execution.id}, 'view'); } else { window.Logger.info('❌ [LINKED ITEMS] אין נתונים להצגה', { page: "executions" }); } }); } else { window.Logger.info('❌ [LINKED ITEMS] loadLinkedItemsData לא זמין', { page: "executions" }); }" 
                      title="פריטים מקושרים">🔗</button>
                    <button class="btn btn-sm" 
                      onclick="editExecution(${execution.id})" 
                      title="ערוך">✏️</button>
                    <button class="btn btn-sm" 
                      onclick="deleteExecution(${execution.id})" 
                      title="מחק">🗑️</button>
                    `}
                </td>
            </tr>
        `;
  }).join('');

  // צביעת רשומות חדשות
  if (newExecutionIds.length > 0) {
    console.log(`🎨 Highlighting ${newExecutionIds.length} new executions`);
    
    // הוספת CSS animation אם לא קיים
    if (!document.getElementById('new-execution-styles')) {
      const style = document.createElement('style');
      style.id = 'new-execution-styles';
      style.textContent = `
        .execution-row.newly-added {
          background-color: rgba(40, 167, 69, 0.2) !important;
          border-left: 4px solid #28a745 !important;
          animation: fadeNewExecution 3s ease-out forwards;
        }
        
        @keyframes fadeNewExecution {
          0% {
            background-color: rgba(40, 167, 69, 0.3);
            border-left-color: #28a745;
          }
          50% {
            background-color: rgba(40, 167, 69, 0.15);
            border-left-color: #28a745;
          }
          100% {
            background-color: transparent;
            border-left-color: transparent;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // הוספת class לרשומות החדשות
    setTimeout(() => {
      newExecutionIds.forEach(executionId => {
        const row = tbody.querySelector(`tr[data-execution-id="${executionId}"]`);
        if (row) {
          row.classList.add('newly-added');
          
          // הסרת ה-class אחרי 3 דקות
          setTimeout(() => {
            row.classList.remove('newly-added');
            // בדיקה אם יש עוד רשומות מודגשות
            const remainingHighlighted = document.querySelectorAll('.execution-row.newly-added');
            if (remainingHighlighted.length === 0) {
              const clearBtn = document.getElementById('clearHighlightsBtn');
              if (clearBtn) {
                clearBtn.style.display = 'none';
              }
            }
          }, 3 * 60 * 1000); // 3 דקות
        }
      });
      
      // הצגת כפתור הניקוי
      const clearBtn = document.getElementById('clearHighlightsBtn');
      if (clearBtn) {
        clearBtn.style.display = 'inline-block';
      }
    }, 100); // קצת delay כדי שהטבלה תיטען
  }

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

/**
 * ניקוי צביעת רשומות חדשות
 */
function clearNewExecutionHighlights() {
  const highlightedRows = document.querySelectorAll('.execution-row.newly-added');
  highlightedRows.forEach(row => {
    row.classList.remove('newly-added');
  });
  
  // הסתרת כפתור הניקוי
  const clearBtn = document.getElementById('clearHighlightsBtn');
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
  
  console.log(`🧹 Cleared highlights from ${highlightedRows.length} rows`);
}

// פונקציה formatDate מוגדרת בקובץ main.js

// פונקציה לבדיקה אם תאריך נמצא בטווח
function isDateInRange(dateString, dateRange) {
  try {
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
  
  } catch (error) {
    window.Logger.error('שגיאה בבדיקת תאריך בטווח:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בבדיקת תאריך בטווח', error.message);
    }
    return false;
  }
}

// הגדרת הפונקציה כגלובלית
window.isDateInRange = isDateInRange;

// פונקציית פילטור מקומי לעסקאות
function filterExecutionsLocally(executions, selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm) {
  try {
    // filterExecutionsLocally called

    if (!executions || !Array.isArray(executions)) {
      // // window.Logger.warn('⚠️ No executions data to filter', { page: "executions" });
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
  } catch (error) {
    window.Logger.error('שגיאה בפילטור מקומי של עסקעות:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפילטור מקומי של עסקעות', error.message);
    }
    return executions; // החזרת הנתונים המקוריים במקרה של שגיאה
  }
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
// window.showAddExecutionModal = showAddExecutionModal; // הועבר למערכת הכללית
window.showEditExecutionModal = showEditExecutionModal;
// window.showDeleteExecutionModal = showDeleteExecutionModal; // הוסר - שימוש במערכת הגלובלית
window.saveExecution = saveExecution;

/**
 * עדכון ביצוע - פונקציה גלובלית
 */
function updateExecution() {
  try {
    // קריאה לפונקציה הראשית
    updateExecutionWrapper();
  } catch (error) {
    window.Logger.error('שגיאה בעדכון עסקה:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון עסקה', error.message);
    }
  }
}

window.updateExecution = updateExecution;
window.confirmDeleteExecution = confirmDeleteExecution;

// פונקציות ולידציה
window.validateExecutionTradeId = validateExecutionTradeId;
window.validateExecutionQuantity = validateExecutionQuantity;
window.validateExecutionPrice = validateExecutionPrice;
window.validateExecutionCommission = validateExecutionCommission;
window.validateExecutionType = validateExecutionType;
window.validateExecutionSource = validateExecutionSource;
window.validateExecutionNotes = validateExecutionNotes;


window.validateExecutionExternalId = validateExecutionExternalId;
window.validateExecutionDate = validateExecutionDate;

// פונקציות מודל פריטים מקושרים
window.showExecutionLinkedItemsModal = showExecutionLinkedItemsModal;
window.loadLinkedItemsDetails = loadLinkedItemsDetails;
window.displayLinkedItems = displayLinkedItems;
window.goToLinkedItems = goToLinkedItems;
window.goToTrade = goToTrade;
window.goToPlan = goToPlan;
window.goToAlert = goToAlert;
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
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
function restoreSortState() {
  try {
    // Restoring sort state for executions table

    if (typeof window.restoreAnyTableSort === 'function') {
      window.restoreAnyTableSort('executions', window.executionsData || [], updateExecutionsTableMain);
    } else {
      handleFunctionNotFound('restoreAnyTableSort');
    }
  } catch (error) {
    window.Logger.error('שגיאה בשחזור מצב מיון:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשחזור מצב מיון', error.message);
    }
  }
}

// הגדרת הפונקציה כגלובלית
// window.sortTable export removed - using global version from tables.js

// Initialize executions page - integrated with unified system
window.initializeExecutionsPage = async function() {
  window.Logger.info('⚡ Executions page initialized via unified system', { page: "executions" });
  
  // הגדרת מודלים שלא נסגרים בלחיצה על הרקע
  setupModalConfigurations();

  // שחזור מצב הסגירה - handled by global toggleSection system

  // טעינת נתונים
  loadExecutionsData();

  // יישום צבעי ישות על כותרות
  if (window.applyEntityColorsToHeaders) {
    window.applyEntityColorsToHeaders('execution');
  }

  // הגדרת פונקציות פילטר
  setupExecutionsFilterFunctions();

  // שחזור מצב סידור
  restoreSortState();

  // אתחול רשימת טיקרים לפי הצ'קבוקס (ברירת מחדל: לא מסומן)
  updateTickersList('add', false);
  updateTickersList('edit', false);

  // עדכון אוטומטי כל 30 שניות - הושבת זמנית למניעת לופים
  // setInterval(() => {
  //   window.Logger.info('🔄 Auto-refreshing executions data...', { page: "executions" });
  //   loadExecutionsData();
  // }, 30000);
};

// Fallback for direct access (backward compatibility)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initializeExecutionsPage);
} else {
  // DOM already loaded, initialize immediately
  window.initializeExecutionsPage();
}

/**
 * הגדרת תצורות מודלים
 */
function setupModalConfigurations() {
  try {
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
  
  } catch (error) {
    window.Logger.error('שגיאה בהגדרת קונפיגורציות מודל:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהגדרת קונפיגורציות מודל', error.message);
    }
  }
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
    handleApiError(error, 'טיקרים עם טריידים ותכנונים');
    // Fallback - טעינת כל הטיקרים
    try {
      const allTickers = await window.tickerService.getTickers();
      window.tickerService.updateTickerSelect('addExecutionTicker', allTickers);
      window.tickerService.updateTickerSelect('editExecutionTicker', allTickers);
    } catch (fallbackError) {
      handleApiError(fallbackError, 'טיקרים (גיבוי)');
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
  try {
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
  
  } catch (error) {
    window.Logger.error('שגיאה בהפעלת כל השדות:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלת כל השדות', error.message);
    }
  }
}

/**
 * טעינת טריידים לטיקר שנבחר
 * @param {string} mode - מצב ('add' או 'edit')
 * @param {boolean} showClosedTrades - האם להציג טריידים סגורים
 */
async function loadActiveTradesForTicker(mode = 'add', _showClosedTrades = false) {
  window.Logger.info('🔄 טעינת טריידים לטיקר, מצב:', mode, 'הצג טריידים סגורים:', _showClosedTrades, { page: "executions" });

  const tickerId = mode === 'add'
    ? document.getElementById('executionTicker').value
    : document.getElementById('editExecutionTicker').value;

  if (!tickerId) {
    window.Logger.info('🔄 אין טיקר נבחר', { page: "executions" });
    return;
  }
  
  window.Logger.info('🔄 טיקר נבחר:', tickerId, { page: "executions" });

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

      window.Logger.info('🔄 טריידים פעילים לטיקר:', activeTrades.length, { page: "executions" });
      window.Logger.info('🔄 טריידים סגורים לטיקר:', closedTrades.length, { page: "executions" });
      window.Logger.info('🔄 סה"כ טריידים רלוונטיים:', filteredTrades.length, { page: "executions" });
    } else {
      // הצג רק טריידים פעילים
      filteredTrades = trades.filter(trade =>
        trade.ticker_id === parseInt(tickerId) && (trade.status === 'active' || trade.status === 'open'),
      );
      window.Logger.info('🔄 טריידים פעילים בלבד לטיקר:', filteredTrades.length, { page: "executions" });
    }

    // במצב עריכה, נוודא שהטרייד המקושר לעסקה נמצא ברשימה
    if (mode === 'edit') {
      const executionId = document.getElementById('editExecutionId')?.value;
      window.Logger.info('🔍 [EDIT MODAL] מחפש עסקה לעריכה ID:', executionId, { page: "executions" });
      const currentExecution = executionsData.find(e => e.id === parseInt(executionId));
      window.Logger.info('🔍 [EDIT MODAL] עסקה נמצאה:', currentExecution, { page: "executions" });
      
      if (currentExecution && currentExecution.trade_id) {
        window.Logger.info('🔍 [EDIT MODAL] מחפש טרייד מקושר ID:', currentExecution.trade_id, { page: "executions" });
        const specificTrade = trades.find(trade => trade.id === currentExecution.trade_id);
        window.Logger.info('🔍 [EDIT MODAL] טרייד מקושר נמצא:', specificTrade, { page: "executions" });
        
        if (specificTrade) {
          // בדיקה אם הטרייד הספציפי כבר ברשימה
          const alreadyInList = filteredTrades.some(trade => trade.id === specificTrade.id);
          window.Logger.info('🔍 [EDIT MODAL] טרייד כבר ברשימה:', alreadyInList, { page: "executions" });
          
          if (!alreadyInList) {
            // הוספת הטרייד הספציפי לרשימה
            filteredTrades.unshift(specificTrade);
            window.Logger.info('✅ [EDIT MODAL] הוספת טרייד ספציפי לעריכה:', specificTrade.id, 'סטטוס:', specificTrade.status, { page: "executions" });
          } else {
            window.Logger.info('✅ [EDIT MODAL] טרייד ספציפי כבר ברשימה:', specificTrade.id, { page: "executions" });
          }
        } else {
          window.Logger.info('❌ [EDIT MODAL] טרייד מקושר לא נמצא ברשימת הטריידים:', currentExecution.trade_id, { page: "executions" });
        }
      } else {
        window.Logger.info('❌ [EDIT MODAL] אין עסקה או trade_id:', currentExecution, { page: "executions" });
      }
    }

    window.Logger.info('🔄 נמצאו טריידים:', filteredTrades.length, { page: "executions" });
    window.Logger.info('🔄 טריידים ברשימה:', filteredTrades.map(t => `${t.id}(${t.status}, { page: "executions" })`));
    
    // לוג נוסף לוודא שהטרייד המקושר נוסף
    if (mode === 'edit') {
      const executionId = document.getElementById('editExecutionId')?.value;
      const currentExecution = executionsData.find(e => e.id === parseInt(executionId));
      if (currentExecution && currentExecution.trade_id) {
        const tradeInList = filteredTrades.find(t => t.id === currentExecution.trade_id);
        if (tradeInList) {
          window.Logger.info('✅ [EDIT MODAL] טרייד מקושר נמצא ברשימה הסופית:', tradeInList.id, 'סטטוס:', tradeInList.status, { page: "executions" });
        } else {
          window.Logger.info('❌ [EDIT MODAL] טרייד מקושר לא נמצא ברשימה הסופית:', currentExecution.trade_id, { page: "executions" });
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
            // // window.Logger.warn('⚠️ לא ניתן לעבד תאריך יצירה:', trade.created_at, { page: "executions" });
          }
        }

        option.textContent = `טרייד: ${trade.side} ${trade.investment_type} - ${creationDate} (${statusText})`;
        tradeSelect.appendChild(option);
      });

      // הפעלת השדה
      tradeSelect.disabled = false;
      // // window.Logger.info('✅ שדה טרייד עודכן:', filteredTrades.length, 'אפשרויות', { page: "executions" });
    }

  } catch (error) {
    // // window.Logger.error('❌ שגיאה בטעינת טריידים:', error, { page: "executions" });
    handleApiError(error, 'טעינת טריידים לטיקר');
  }
}


/**
 * עדכון טריידים כאשר הצ'קבוקס משתנה
 * @param {string} mode - 'add' או 'edit'
 */
async function updateTradesOnCheckboxChange(mode = 'add') {
  // // window.Logger.info('🔄 עדכון טריידים לפי צ\'קבוקס, מצב:', mode, { page: "executions" });

  try {
    // בדיקת הצ'קבוקס
    const showClosedTrades = mode === 'add'
      ? document.getElementById('addExecutionShowClosedTrades')?.checked || false
      : document.getElementById('editExecutionShowClosedTrades')?.checked || false;

    // window.Logger.info('🔄 הצג טריידים סגורים:', showClosedTrades, { page: "executions" });

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
    // // window.Logger.error('❌ שגיאה בעדכון טריידים:', error, { page: "executions" });
    handleApiError(error, 'עדכון טריידים לפי צ\'קבוקס');
  }
}

/**
 * עדכון טריידים כאשר הטיקר משתנה
 * @param {string} mode - 'add' או 'edit'
 */
async function updateTradesOnTickerChange(mode = 'add') {
  window.Logger.info('🔄 עדכון טריידים לפי שינוי טיקר, מצב:', mode, { page: "executions" });

  try {
    // בדיקת הצ'קבוקס הנוכחי
    const showClosedTrades = mode === 'add'
      ? document.getElementById('addExecutionShowClosedTrades')?.checked || false
      : document.getElementById('editExecutionShowClosedTrades')?.checked || false;

    window.Logger.info('🔄 הצג טריידים סגורים:', showClosedTrades, { page: "executions" });

    // עדכון הטריידים לטיקר הנבחר
    await loadActiveTradesForTicker(mode, showClosedTrades);

  } catch (error) {
    // window.Logger.error('❌ שגיאה בעדכון טריידים:', error, { page: "executions" });
    handleApiError(error, 'עדכון טריידים לפי שינוי טיקר');
  }
}

/**
 * מעבר לדף טיקר (בפיתוח)
 * @param {string} symbol - סמל הטיקר
 */
function goToTickerPage(_symbol) {
  try {
    // מעבר לדף טיקר
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', 'מעבר לדף טיקר - בפיתוח');
    } else {
      // מעבר לדף טיקר - בפיתוח
    }
    // TODO: ניתוב לדף טיקר - ראה: CENTRAL_TASKS_TODO.md (משימה 1)
  } catch (error) {
    window.Logger.error('שגיאה במעבר לעמוד טיקר:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במעבר לעמוד טיקר', error.message);
    }
  }
}


/**
 * הצגת עזרה לבחירת טיקר
 */
function showTickerHelp() {
  try {
    // הצגת עזרה לבחירת טיקר
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', 'בדוק אם יש לך תכנון או טרייד לטיקר שאתה מחפש. אם עדיין אין - הוסף טיקר');
    } else {
      // בדוק אם יש לך תכנון או טרייד לטיקר שאתה מחפש. אם עדיין אין - הוסף טיקר
    }
  } catch (error) {
    window.Logger.error('שגיאה בהצגת עזרה לטיקר:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת עזרה לטיקר', error.message);
    }
  }
}

/**
 * הוספת טיקר חדש
 */
function addNewTicker() {
  try {
    // הוספת טיקר חדש
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', 'הוספת טיקר - בפיתוח');
    } else {
      // הוספת טיקר - בפיתוח
    }
    // TODO: פתיחת מודל הוספת טיקר - ראה: CENTRAL_TASKS_TODO.md (משימה 2)
  } catch (error) {
    window.Logger.error('שגיאה בהוספת טיקר חדש:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת טיקר חדש', error.message);
    }
  }
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
  // עדכון סיכום נתונים לעסקעות - מערכת מאוחדת
  if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
    const config = window.INFO_SUMMARY_CONFIGS.executions;
    window.InfoSummarySystem.calculateAndRender(executions, config);
  } else {
    // מערכת סיכום נתונים לא זמינה
    const summaryStatsElement = document.getElementById('summaryStats');
    if (summaryStatsElement) {
      summaryStatsElement.innerHTML = `
        <div style="color: #dc3545; font-weight: bold;">
          ⚠️ מערכת סיכום נתונים לא זמינה - נא לרענן את הדף
        </div>
      `;
    }
  }
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
 * הפעלה/השבתה של שדות הטופס
 * @param {boolean} enable - true להפעלה, false להשבתה
 */
function toggleExecutionFormFields(enable) {
  const formFields = [
    'executionType', 'executionQuantity', 'executionPrice', 'executionDate', 'executionAccount', 'executionCommission'
  ];
  
  formFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = !enable;
      if (enable) {
        field.classList.remove('disabled');
      } else {
        field.classList.add('disabled');
      }
    }
  });
}

/**
 * הפעלת שדות הטופס אחרי בחירת טיקר
 * @deprecated Use toggleExecutionFormFields(true) instead
 */
function enableExecutionFormFields() {
  toggleExecutionFormFields(true);
}

/**
 * השבתת שדות הטופס
 * @deprecated Use toggleExecutionFormFields(false) instead
 */
function disableExecutionFormFields() {
  toggleExecutionFormFields(false);
}

/**
 * טעינת מידע על הטיקר
 */
async function loadExecutionTickerInfo(tickerId) {
  try {
    window.Logger.info('🔄 Loading ticker info for ID:', tickerId, { page: "executions" });
    
    // Get ticker data from API
    const response = await fetch(`/api/tickers/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const tickers = data.data || data;
    
    // Find the specific ticker
    const ticker = tickers.find(t => t.id == tickerId);
    if (!ticker) {
      throw new Error('Ticker not found');
    }
    
    // Display ticker info
    displayExecutionTickerInfo(ticker);
    
    // Set default quantity to 100
    const quantityField = document.getElementById('executionQuantity');
    if (quantityField) {
      quantityField.value = 100;
    }
    
    // Set default price to current price
    const priceField = document.getElementById('executionPrice');
    if (priceField && ticker.current_price) {
      priceField.value = ticker.current_price;
    }
    
    // Set default commission from preferences
    const commissionField = document.getElementById('executionCommission');
    if (commissionField) {
      try {
        if (typeof window.getCurrentPreference === 'function') {
          const defaultCommission = await window.getCurrentPreference('defaultCommission');
          if (defaultCommission !== null && defaultCommission !== undefined) {
            commissionField.value = defaultCommission;
          }
        }
      } catch (error) {
        window.Logger.warn('⚠️ Could not load default commission from preferences:', error, { page: "executions" });
      }
    }
    
  } catch (error) {
    window.Logger.error('❌ Error loading ticker info:', error, { page: "executions" });
  }
}

/**
 * הצגת מידע על הטיקר
 */
function displayExecutionTickerInfo(ticker) {
  // Create or update ticker info display
  let tickerInfoDiv = document.getElementById('executionTickerInfo');
  if (!tickerInfoDiv) {
    // Create a new row for ticker info
    const tickerInfoRow = document.createElement('div');
    tickerInfoRow.className = 'row';
    tickerInfoRow.id = 'executionTickerInfoRow';
    
    // Create column for ticker info
    const tickerInfoCol = document.createElement('div');
    tickerInfoCol.className = 'col-12';
    
    tickerInfoDiv = document.createElement('div');
    tickerInfoDiv.id = 'executionTickerInfo';
    tickerInfoDiv.className = 'mb-3 p-3 bg-light rounded';
    
    tickerInfoCol.appendChild(tickerInfoDiv);
    tickerInfoRow.appendChild(tickerInfoCol);
    
    // Insert after the ticker/type row
    const tickerTypeRow = document.getElementById('executionTicker').closest('.row');
    if (tickerTypeRow && tickerTypeRow.parentNode) {
      tickerTypeRow.parentNode.insertBefore(tickerInfoRow, tickerTypeRow.nextSibling);
    }
  }
  
  // Use the new global renderTickerInfo function
  tickerInfoDiv.innerHTML = window.renderTickerInfo(ticker, 'ticker-info-display');
}

/**
 * הסתרת מידע על הטיקר
 */
function hideExecutionTickerInfo() {
  const tickerInfoDiv = document.getElementById('executionTickerInfo');
  if (tickerInfoDiv) {
    tickerInfoDiv.remove();
  }
}

/**
 * חישוב ערכים מחושבים לטופס עסקה (הוספה או עריכה)
 * @param {string} formType - 'add' או 'edit'
 */
function calculateExecutionValues(formType) {
  const isEdit = formType === 'edit';
  const prefix = isEdit ? 'editExecution' : 'execution';
  
  const quantity = parseFloat(document.getElementById(`${prefix}Quantity`).value) || 0;
  const price = parseFloat(document.getElementById(`${prefix}Price`).value) || 0;
  const commission = parseFloat(document.getElementById(`${prefix}Commission`).value) || 0;
  
  let total = 0;
  let label = '';
  
  if (isEdit) {
    // בטופס עריכה - לוגיקה פשוטה
    total = quantity * price + commission;
    label = 'סה"כ:';
    
    const totalElement = document.getElementById(`${prefix}Total`);
    if (totalElement) {
      totalElement.textContent = `$${total.toFixed(2)}`;
    }
  } else {
    // בטופס הוספה - לוגיקה מתקדמת עם buy/sell
    const type = document.getElementById(`${prefix}Type`).value;
    
    if (type === 'buy') {
      // בקנייה: סה"כ עלות = -(כמות * מחיר + עמלה) - שלילי כי זה כסף שיוצא
      total = -(quantity * price + commission);
      label = 'סה"כ עלות:';
    } else if (type === 'sell') {
      // במכירה: סה"כ מזומן = כמות * מחיר - עמלה - חיובי כי זה כסף שנכנס
      total = quantity * price - commission;
      label = 'סה"כ מזומן:';
    } else {
      // אם לא נבחר סוג, הצג סכום בסיסי
      total = quantity * price;
      label = 'סה"כ:';
    }
    
    // עדכון התצוגה
    const totalElement = document.getElementById(`${prefix}Total`);
    if (totalElement) {
      const sign = total >= 0 ? '' : '-';
      totalElement.innerHTML = `<strong>${label}</strong> ${sign}$${Math.abs(total).toFixed(2)}`;
    }
  }
}

/**
 * חישוב ערכים מחושבים לטופס הוספה
 * @deprecated Use calculateExecutionValues('add') instead
 */
function calculateAddExecutionValues() {
  calculateExecutionValues('add');
}

/**
 * חישוב ערכים מחושבים לטופס עריכה
 * @deprecated Use calculateExecutionValues('edit') instead
 */
function calculateEditExecutionValues() {
  calculateExecutionValues('edit');
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
    ? document.getElementById('executionTradeId').value
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
    handleApiError(error, 'עסקאות לטרייד');
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
      // window.Logger.warn('⚠️ editTradeExecutionsTable element not found on trades page', { page: "executions" });
      return;
    }

    tableBody.innerHTML = '';

    executions.forEach(execution => {
      const row = document.createElement('tr');

      const typeBadge = window.renderAction ? window.renderAction(execution.type) : 
        (execution.type === 'buy' ? '<span class="badge bg-success">קניה</span>' : '<span class="badge bg-danger">מכירה</span>');

      const statusBadge = execution.status === 'completed'
        ? '<span class="badge bg-success">הושלם</span>'
        : '<span class="badge bg-warning">ממתין</span>';

      row.innerHTML = `
                <td>${window.renderExecutionDate ? window.renderExecutionDate(execution.date) : execution.date}</td>
                <td>${typeBadge}</td>
                <td>${window.renderShares ? window.renderShares(execution.quantity) : execution.quantity}</td>
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

// הוסר - המערכת המאוחדת מטפלת באתחול
// אתחול הדף
// document.addEventListener('DOMContentLoaded', function () {
  // DOM Content Loaded - checking notification functions
  // window.showSuccessNotification
  // window.showErrorNotification
  // window.showInfoNotification

  // שחזור מצב הסגירה
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  } else {
    // window.Logger.warn('⚠️ restoreAllSectionStates function not available, using fallback', { page: "executions" });
    // Fallback: restore top section state manually
    const topSectionHidden = localStorage.getItem('executionsTopSectionCollapsed') === 'true';
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
// });

// בדיקה שהפונקציות נטענו בהצלחה
// window.Logger.info('✅ Execution functions loaded:', {
//   loadTradeExecutions: typeof loadTradeExecutions,
//   updateExecutionsTableMain: typeof updateExecutionsTableMain,
//   updateExecutionsTableForTradeModal: typeof updateExecutionsTableForTradeModal,
//   addEditBuySell: typeof addEditBuySell,
//   linkExistingExecution: typeof linkExistingExecution,
//   unlinkExecution: typeof unlinkExecution,
// }, { page: "executions" });

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
          handleApiError(error, 'טריידים לפילטר חשבון');
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
      handleApiError(error, 'נתוני טריידים');
      tradesData = [];
    }

    setupExecutionsFilterFunctions();
  }

  // טעינת טבלת טיקרים חלקית
  try {
    const tickers = await loadTickersSummaryData();
    updateTickersSummaryTable(tickers);
    // window.Logger.info('✅ טבלת טיקרים חלקית נטענה בהצלחה', { page: "executions" });
  } catch (error) {
    // window.Logger.error('❌ שגיאה בטעינת טבלת טיקרים חלקית:', error, { page: "executions" });
    handleApiError(error, 'טבלת טיקרים חלקית');
  }
};

// הוספת פונקציות CRUD גלובליות
if (typeof window.registerCRUDFunctions === 'function') {
  window.registerCRUDFunctions('executions', {
    create: saveExecution,
    read: loadExecutionsData,
    update: updateExecution,
    delete: confirmDeleteExecution,
    showAddModal: window.showAddExecutionModal, // שימוש במערכת הכללית
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
    // window.Logger.warn(`⚠️ שדות לא נמצאו עבור mode: ${mode}`, { page: "executions" });
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
  // window.Logger.info('🔄 טעינת נתוני טיקרים חלקיים...', { page: "executions" });

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

    // window.Logger.info('✅ טעינת טיקרים חלקיים הושלמה:', processedTickers.length, 'טיקרים', { page: "executions" });
    return processedTickers;

  } catch (error) {
    // window.Logger.error('❌ שגיאה בטעינת טיקרים חלקיים:', error, { page: "executions" });
    handleApiError(error, 'טעינת טיקרים חלקיים');
    return [];
  }
}

/**
 * עדכון טבלת טיקרים חלקית
 */
function updateTickersSummaryTable(tickers = null) {
  // window.Logger.info('🔄 עדכון טבלת טיקרים חלקית...', { page: "executions" });

  const tableBody = document.querySelector('#tickersTable tbody');
  if (!tableBody) {
    // window.Logger.warn('⚠️ טבלת טיקרים לא נמצאה', { page: "executions" });
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
        // window.Logger.warn('⚠️ לא ניתן לעבד תאריך יצירה:', ticker.created_at, { page: "executions" });
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
            <td class="actions-cell">
                <button class="btn btn-sm" 
                  onclick="viewTickerDetails(${ticker.id})" 
                  title="צפה בפרטים">
                    <img src="images/icons/tickers.svg" alt="צפה" 
                      class="action-icon" style="width: 14px; height: 14px;">
                </button>
                <button class="btn btn-sm" 
                  onclick="addExecutionForTicker(${ticker.id})" 
                  title="הוסף עסקה">
                    <img src="images/icons/executions.svg" alt="הוסף" 
                      class="action-icon" style="width: 14px; height: 14px;">
                </button>
            </td>
        `;

    tableBody.appendChild(row);
  });

  // window.Logger.info('✅ טבלת טיקרים חלקית עודכנה:', dataToShow.length, 'שורות', { page: "executions" });
}

/**
 * רענון רשימת טיקרים
 */
async function refreshTickersSummary() {
  // window.Logger.info('🔄 רענון רשימת טיקרים...', { page: "executions" });

  try {
    const tickers = await loadTickersSummaryData();
    updateTickersSummaryTable(tickers);

    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('רענון הושלם', `נטענו ${tickers.length} טיקרים`);
    }
  } catch {
    // window.Logger.error('❌ שגיאה ברענון טיקרים:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה ברענון', 'לא ניתן לרענן את רשימת הטיקרים');
    }
  }
}

/**
 * צפייה בפרטי טיקר
 */
function viewTickerDetails(tickerId) {
  // window.Logger.info('🔄 צפייה בפרטי טיקר:', tickerId, { page: "executions" });

  // מציאת הטיקר
  const ticker = tickersSummaryData.find(t => t.id === tickerId);
  if (!ticker) {
    // window.Logger.warn('⚠️ טיקר לא נמצא:', tickerId, { page: "executions" });
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
  // window.Logger.info('🔄 הוספת עסקה לטיקר:', tickerId, { page: "executions" });

  // מציאת הטיקר
  const ticker = tickersSummaryData.find(t => t.id === tickerId);
  if (!ticker) {
    // window.Logger.warn('⚠️ טיקר לא נמצא:', tickerId, { page: "executions" });
    return;
  }

  // פתיחת מודל הוספת עסקה - שימוש במערכת הכללית
  if (typeof window.showAddExecutionModal === 'function') {
    window.showAddExecutionModal();
  } else {
    window.Logger.error('❌ showAddExecutionModal לא זמין במערכת הכללית', { page: "executions" });
  }

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
  // window.Logger.info('🔄 עדכון רשימת טיקרים:', { mode, showClosedTrades }, { page: "executions" });

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

      // window.Logger.info('🔄 טיקרים עם טריידים פעילים:', tickersWithActiveTrades.map(t => t.symbol, { page: "executions" }));
      // window.Logger.info('🔄 טיקרים עם טריידים סגורים:', tickersWithClosedTrades.map(t => t.symbol, { page: "executions" }));
      // window.Logger.info('🔄 סה"כ טיקרים רלוונטיים:', filteredTickers.map(t => t.symbol, { page: "executions" }));
    } else {
      // הצג רק טיקרים עם טריידים פעילים
      filteredTickers = allTickers.filter(ticker =>
        trades.some(trade => trade.ticker_id === ticker.id && (trade.status === 'active' || trade.status === 'open')),
      );
      // window.Logger.info('🔄 טיקרים עם טריידים פעילים בלבד:', filteredTickers.map(t => t.symbol, { page: "executions" }));
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
      // window.Logger.info('✅ רשימת טיקרים עודכנה:', filteredTickers.length, 'טיקרים', { page: "executions" });
      // window.Logger.info('🔄 טיקרים שנבחרו:', filteredTickers.map(t => t.symbol, { page: "executions" }));
    }

  } catch (error) {
    // window.Logger.error('❌ שגיאה בעדכון רשימת טיקרים:', error, { page: "executions" });
    handleApiError(error, 'עדכון רשימת טיקרים');
  }
}

window.updateTickersList = updateTickersList;

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions

function toggleExecutionsSection() {
    if (typeof window.toggleSection === 'function') {
        window.toggleSection('executions');
    } else {
        window.Logger.warn('toggleSection function not found', { page: "executions" });
    }
}

// ===== IMPORT MODAL FUNCTIONS =====
// Import functionality is handled by import-user-data.js
// This file only contains the modal opening/closing functions
