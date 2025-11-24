/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 62
 * 
 * PAGE INITIALIZATION (2)
 * - setupModalConfigurations() - * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * - setupExecutionsFilterFunctions() - setupExecutionsFilterFunctions function
 * 
 * DATA LOADING (6)
 * - loadExecutionsData() - * מעבר להתראה ספציפית
 * - loadTickersWithOpenOrClosedTradesAndPlans() - * הגדרת תצורות מודלים
 * - loadActiveTradesForTicker() - * הפעלה/השבתה של שדה מזהה חיצוני לפי בחירת מקור
 * - loadExecutionTickerInfo() - * Enable execution form fields
 * - loadTradeExecutions() - * מעבר לטרייד המקושר
 * - loadTickersSummaryData() - loadTickersSummaryData function
 * 
 * DATA MANIPULATION (20)
 * - addExecution() - addExecution function
 * - resetAddExecutionForm() - resetAddExecutionForm function
 * - updateRealizedPLField() - updateRealizedPLField function
 * - updateExecutionWrapper() - updateExecutionWrapper function
 * - updateExecutionsTableMain() - updateExecutionsTableMain function
 * - updateTradesOnCheckboxChange() - updateTradesOnCheckboxChange function
 * - updateTradesOnTickerChange() - updateTradesOnTickerChange function
 * - addNewTicker() - * Show ticker help
 * - addNewPlan() - * הוספת טיקר חדש
 * - addNewTrade() - * הוספת טיקר חדש
 * - updateExecutionsSummary() - * הוספת תכנון חדש
 * - calculateAddExecutionValues() - calculateAddExecutionValues function
 * - updateExecutionsTableForTradeModal() - * טעינת ביצועים לטרייד
 * - addEditBuySell() - addEditBuySell function
 * - updateExecutionsGlobalData() - updateExecutionsGlobalData function
 * - updateTickersSummaryTable() - updateTickersSummaryTable function
 * - addExecutionForTicker() - * צפייה בפרטי טיקר
 * - updateTickersList() - * הצגה/הסתרה של סקשן הטיקרים
 * - showAddExecutionModal() - showAddExecutionModal function
 * - deleteExecution() - * Show add execution modal
 * 
 * EVENT HANDLING (20)
 * - editExecution() - editExecution function
 * - resetExecutionForm() - resetExecutionForm function
 * - resetEditExecutionForm() - resetEditExecutionForm function
 * - fillEditExecutionForm() - * הצגת מודל עריכת עסקה
 * - showExecutionLinkedItemsModal() - showExecutionLinkedItemsModal function
 * - goToNote() - * מעבר לתכנון ספציפי
 * - filterExecutionsLocally() - filterExecutionsLocally function
 * - toggleExecutionFormFields() - toggleExecutionFormFields function
 * - enableExecutionFormFields() - * הפעלה/השבתה של שדות הטופס
 * - disableExecutionFormFields() - * הפעלה/השבתה של שדות הטופס
 * - displayExecutionTickerInfo() - displayExecutionTickerInfo function
 * - hideExecutionTickerInfo() - hideExecutionTickerInfo function
 * - calculateExecutionValues() - * הסתרת מידע על הטיקר
 * - calculateEditExecutionValues() - * חישוב ערכים מחושבים לטופס הוספה
 * - linkExistingExecution() - * הוספת קניה/מכירה במודל עריכת טרייד
 * - unlinkExecution() - * הוספת קניה/מכירה במודל עריכת טרייד
 * - toggleTickersSection() - * הוספת עסקה לטיקר
 * - toggleExecutionsSection() - toggleExecutionsSection function
 * - showEditExecutionModal() - * Show add execution modal
 * - performExecutionDeletion() - performExecutionDeletion function
 * 
 * UI UPDATES (2)
 * - displayLinkedItems() - displayLinkedItems function
 * - showTickerHelp() - * מעבר לדף טיקר (בפיתוח)
 * 
 * OTHER (12)
 * - goToTrade() - goToTrade function
 * - goToPlan() - * מעבר לטרייד ספציפי
 * - goToAlert() - * מעבר לטרייד ספציפי
 * - isDateInRange() - isDateInRange function
 * - restoreSortState() - restoreSortState function
 * - enableAllFields() - enableAllFields function
 * - goToTickerPage() - * עדכון טריידים כאשר הטיקר משתנה
 * - goToLinkedTrade() - * חישוב ערכים מחושבים לטופס הוספה
 * - applyAccountFilterWithTradesData() - applyAccountFilterWithTradesData function
 * - toggleExternalIdField() - toggleExternalIdField function
 * - refreshTickersSummary() - refreshTickersSummary function
 * - viewTickerDetails() - * רענון רשימת טיקרים
 * 
 * ==========================================
 */
/**
 * Executions Page - Comprehensive Function Index
 * ==============================================
 * 
 * This file contains all functions for managing executions including:
 * - CRUD operations for executions
 * - Data loading and table management
 * - Form validation and UI interactions
 * - Modal handling and state management
 * - Import functionality integration
 * - Linked items management
 * - Ticker and trade integration
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

// ===== קובץ JavaScript לדף ביצועים =====

// ===== EXECUTION MANAGEMENT FUNCTIONS =====
// CRUD operations for executions

/**
 * Add new execution
 * Opens modal for adding new execution
 * 
 * @function addExecution
 * @returns {Promise<void>} Resolves after modal interaction and tag hydration complete.
 */
async function addExecution() {
  try {
    window.Logger.info('➕ מוסיף ביצוע חדש', { page: "executions" });
    
    // פתיחת מודל הוספת ביצוע - שימוש במערכת הכללית
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
      await window.ModalManagerV2.showModal('executionsModal', 'add');
      const select = document.getElementById('executionTags');
      if (select) {
        select.setAttribute('data-initial-value', '');
        if (window.TagUIManager?.refreshSelectOptions) {
          await window.TagUIManager.refreshSelectOptions(select);
        }
      }
    } else {
      window.Logger.error('❌ ModalManagerV2 לא זמין במערכת הכללית', { page: "executions" });
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
// Note: The actual function will be assigned later (line 2930)
// This placeholder is only set if it doesn't already exist
if (!window.loadExecutionsData) {
  window.loadExecutionsData = function() {
    window.Logger?.warn?.('⚠️ loadExecutionsData called before initialization', { page: "executions" });
    return Promise.resolve([]);
  };
}

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
// REMOVED: openExecutionDetails - unused function, replaced by showAddExecutionModal

/**
 * Open the execution edit modal and hydrate tag selections.
 * @param {number|string} id - Execution identifier to edit.
 * @returns {Promise<void>} Resolves after modal interaction and tag hydration complete.
 */
async function editExecution(id) {
  try {
  // Use ModalManagerV2 directly
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
    await window.ModalManagerV2.showEditModal('executionsModal', 'execution', id);
    if (window.TagUIManager?.hydrateSelectForEntity) {
      await window.TagUIManager.hydrateSelectForEntity('executionTags', 'execution', id, { force: true });
    }
  } else {
    window.Logger.error('❌ ModalManagerV2 לא זמין במערכת הכללית', { page: "executions" });
  }
  } catch (error) {
    window.Logger.error('שגיאה בעריכת ביצוע:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעריכת ביצוע', error.message);
    }
  }
}

// deleteExecution function removed - now defined at line 4017
// This stub prevents old code from breaking - new implementation uses the general CRUD pattern

// פונקציות לפתיחה/סגירה של סקשנים - שימוש במערכת הכללית

// ========================================
// פונקציות מודלים
// ========================================

// REMOVED: resetExecutionForm, resetAddExecutionForm, resetEditExecutionForm - not used
// ModalManagerV2 handles form reset automatically

// showAddExecutionModal הועבר למערכת הכללית

/**
 * הצגת מודל עריכת עסקה
 */
/**
 * עדכון שדה Realized P/L לפי סוג הפעולה
 * ModalManagerV2 uses field.id directly from config (executionType, not addExecutionType/editExecutionType)
 * 
 * Realized P/L נדרש רק ל:
 * - sell (מכירה) - סגירת פוזיציה long
 * - cover (כיסוי) - סגירת פוזיציה short
 * 
 * Realized P/L לא נדרש ל:
 * - buy (קנייה) - פתיחת פוזיציה long
 * - short (מכירה בחסר) - פתיחת פוזיציה short
 */
function updateRealizedPLField() {
  // ModalManagerV2 uses the field id directly from config - no prefix
  const actionSelect = document.getElementById('executionType');
  const realizedPLField = document.getElementById('executionRealizedPL');
  
  if (!actionSelect || !realizedPLField) {
    window.Logger?.debug('⚠️ updateRealizedPLField: Field not found', {
      actionSelect: !!actionSelect,
      realizedPLField: !!realizedPLField,
      page: 'executions'
    });
    return;
  }
  
  const actionType = actionSelect.value;
  
  // Enable Realized P/L only for sell and cover (closing positions)
  if (actionType === 'sell' || actionType === 'cover') {
    realizedPLField.disabled = false;
    realizedPLField.required = true;
    window.Logger?.debug('✅ updateRealizedPLField: Enabled Realized P/L', {
      actionType,
      page: 'executions'
    });
  } else {
    // Disable Realized P/L for buy, short, and any unknown types (opening positions)
    realizedPLField.disabled = true;
    realizedPLField.required = false;
    realizedPLField.value = '';
    window.Logger?.debug('✅ updateRealizedPLField: Disabled Realized P/L', {
      actionType,
      page: 'executions'
    });
  }
}

// NOTE: showEditExecutionModal is defined later in the file (line ~3995)

// פונקציה זו הוסרה - שימוש במערכת הגלובלית showDeleteWarning

// ========================================
// פונקציות ולידציה
// ========================================


// REMOVED: validateExecutionTradeId - deprecated, use window.validateField() instead

// REMOVED: Deprecated validation functions - use window.validateField() instead
// - validateExecutionQuantity
// - validateExecutionPrice
// - validateExecutionCommission
// - validateExecutionSource
// - validateExecutionNotes
// - validateExecutionExternalId

// REMOVED: Deprecated validation functions - use window.validateField() instead
// - validateExecutionDate
// - validateExecutionType

/**
 * הצגת שגיאת שדה
 */
// showFieldError() - זמינה גלובלית מ-ui-utils.js כ-showValidationWarning

// REMOVED: clearFieldError - use window.clearFieldValidation() from validation-utils.js instead

// REMOVED: clearExecutionValidationErrors - use window.clearValidation() instead
// REMOVED: validateCompleteExecutionForm - use window.validateForm() or window.validateEntityForm() instead


// ========================================
// פונקציות שמירה ועדכון
// ========================================

/**
 * Save execution - required by ModalManagerV2
 * Handles both add and edit modes
 * @function saveExecution
 * @async
 * @returns {Promise<void>}
 */
async function saveExecution() {
    window.Logger.debug('saveExecution called', { page: 'executions' });
    
    try {
        // Collect form data using DataCollectionService
        const form = document.getElementById('executionsModalForm');
        if (!form) {
            throw new Error('Execution form not found');
        }
        
        const executionData = DataCollectionService.collectFormData({
            ticker_id: { id: 'executionTicker', type: 'int' },
            trading_account_id: { id: 'executionAccount', type: 'int' },
            action: { id: 'executionType', type: 'text' }, // Map executionType to action
            quantity: { id: 'executionQuantity', type: 'float' },
            price: { id: 'executionPrice', type: 'float' },
            date: { id: 'executionDate', type: 'date' }, // DateTime format
            fee: { id: 'executionCommission', type: 'float', default: 0 }, // Map executionCommission to fee
            realized_pl: { id: 'executionRealizedPL', type: 'int', default: null },
            mtm_pl: { id: 'executionMTMPL', type: 'int', default: null },
            notes: { id: 'executionNotes', type: 'rich-text', default: null },
            source: { id: 'executionSource', type: 'text', default: 'manual' },
            external_id: { id: 'executionExternalId', type: 'text', default: null },
            trade_id: { id: 'trade_id', type: 'int', default: null },
            tag_ids: { id: 'executionTags', type: 'tags', default: [] }
        });

        const tagIds = Array.isArray(executionData.tag_ids) ? executionData.tag_ids : [];
        delete executionData.tag_ids;
        
        // ולידציה מפורטת
        let hasErrors = false;
        if (!executionData.ticker_id) {
            if (window.showValidationWarning) {
                window.showValidationWarning('executionTicker', 'טיקר הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!executionData.trading_account_id) {
            if (window.showValidationWarning) {
                window.showValidationWarning('executionAccount', 'חשבון מסחר הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!executionData.action) {
            if (window.showValidationWarning) {
                window.showValidationWarning('executionType', 'סוג ביצוע הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!executionData.quantity || executionData.quantity <= 0) {
            if (window.showValidationWarning) {
                window.showValidationWarning('executionQuantity', 'כמות חייבת להיות גדולה מ-0');
            }
            hasErrors = true;
        }
        
        if (!executionData.price || executionData.price <= 0) {
            if (window.showValidationWarning) {
                window.showValidationWarning('executionPrice', 'מחיר חייב להיות גדול מ-0');
            }
            hasErrors = true;
        }
        
        if (!executionData.date) {
            if (window.showValidationWarning) {
                window.showValidationWarning('executionDate', 'תאריך ושעה הם שדות חובה');
            }
            hasErrors = true;
        }

        if (executionData.notes && executionData.notes.length > 5000) {
            if (window.showValidationWarning) {
                window.showValidationWarning('executionNotes', 'הערות העסקה חורגות מהאורך המותר (5,000 תווים)');
            }
            hasErrors = true;
        }
        
        // Validate realized_pl for sell and cover actions (closing positions only)
        // Realized P/L is required only for sell (closing long position) and cover (closing short position)
        if (executionData.action === 'sell' || executionData.action === 'cover') {
            if (executionData.realized_pl === null || executionData.realized_pl === undefined) {
                if (window.showValidationWarning) {
                    const actionLabel = executionData.action === 'sell' ? 'מכירה' : 'כיסוי';
                    window.showValidationWarning('executionRealizedPL', `Realized P/L חובה ב-${actionLabel}`);
                }
                hasErrors = true;
            }
        }
        
        if (hasErrors) {
            return;
        }
        
        // Determine if this is add or edit
        const isEdit = form.dataset.mode === 'edit';
        const executionId = form.dataset.executionId;
        
        // Prepare API call
        const url = isEdit ? `/api/executions/${executionId}` : '/api/executions';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Send to API using ExecutionsData service if available
        let response;
        if (isEdit && typeof window.ExecutionsData?.updateExecution === 'function') {
            response = await window.ExecutionsData.updateExecution(executionId, executionData);
        } else if (!isEdit && typeof window.ExecutionsData?.createExecution === 'function') {
            response = await window.ExecutionsData.createExecution(executionData);
        } else {
            // Fallback to direct fetch
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(executionData)
            });
        }
        
        // Use CRUDResponseHandler for consistent response handling
        let crudResult;
        if (isEdit) {
            crudResult = await CRUDResponseHandler.handleUpdateResponse(response, {
                modalId: 'executionsModal',
                successMessage: 'ביצוע עודכן בהצלחה',
                entityName: 'ביצוע',
                reloadFn: window.loadExecutionsData,
                requiresHardReload: false
            });
        } else {
            crudResult = await CRUDResponseHandler.handleSaveResponse(response, {
                modalId: 'executionsModal',
                successMessage: 'ביצוע נוסף בהצלחה',
                entityName: 'ביצוע',
                reloadFn: window.loadExecutionsData,
                requiresHardReload: false
            });
        }

        const executionRecordId = isEdit ? Number(executionId) : Number(crudResult?.data?.id || crudResult?.id);
        if (Number.isFinite(executionRecordId)) {
            try {
                await window.TagService.replaceEntityTags('execution', executionRecordId, tagIds);
            } catch (tagError) {
                window.Logger?.warn('⚠️ Failed to update execution tags', {
                    error: tagError,
                    executionId: executionRecordId,
                    page: 'executions'
                });
                const errorMessage = window.TagService?.formatTagErrorMessage
                    ? window.TagService.formatTagErrorMessage('הביצוע נשמר אך עדכון התגיות נכשל', tagError)
                    : 'הביצוע נשמר אך עדכון התגיות נכשל';
                window.showErrorNotification?.('שמירת תגיות', errorMessage);
            }
        }
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'שמירת ביצוע');
    }
}

// Export save function for ModalManagerV2
window.saveExecution = saveExecution;

/**
 * Update execution - wrapper for saveExecution in edit mode
 * @function updateExecution
 * @async
 * @param {number} executionId - Execution ID (optional, gets from form if not provided)
 * @returns {Promise<void>}
 */
async function updateExecution(executionId) {
    // Update execution uses the same saveExecution function
    // The form's dataset.mode will be set to 'edit' by ModalManagerV2
    return await saveExecution();
}

// Export update function
window.updateExecution = updateExecution;

// confirmDeleteExecution function removed - now using performExecutionDeletion in general CRUD pattern

// ========================================
// פונקציות מודל פריטים מקושרים
// ========================================

/**
 * הצגת מודל פריטים מקושרים
 * שימוש בפונקציה הגלובלית מ-linked-items.js
 */
// REMOVED: showExecutionLinkedItemsModal - use window.viewLinkedItems(executionId, 'execution') or window.viewLinkedItemsForExecution(executionId) from linked-items.js instead

// REMOVED: loadLinkedItemsDetails and loadLinkedItemsFromMultipleSources - unused functions
// Use viewLinkedItemsForExecution from linked-items.js instead

/**
 * Display linked items for execution
 * @param {Object} linkedItems - Object containing linked items (trades, plans, alerts, notes)
 * @returns {void}
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
                                טרייד #${trade.id} - חשבון מסחר: ${trade.account_name || 'לא זמין'} - סטטוס: ${trade.status}
                                <button data-button-type="LINK" data-variant="full" data-icon="🔗" data-text="עבור לטרייד" data-classes="btn-sm ms-2" data-onclick="goToTrade(${trade.id})"></button>
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
                                            <button data-button-type="LINK" data-variant="full" data-icon="🔗" data-text="עבור לתכנון" data-classes="btn-sm" data-onclick="goToPlan(${plan.id})"></button>
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
                                            <button data-button-type="LINK" data-variant="full" data-icon="🔗" data-text="עבור להתראה" data-classes="btn-sm" data-onclick="goToAlert(${alert.id})"></button>
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
                                            <button data-button-type="LINK" data-variant="full" data-icon="🔗" data-text="עבור להערה" data-classes="btn-sm" data-onclick="goToNote(${note.id})"></button>
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

// ===== UI MANAGEMENT FUNCTIONS =====
// UI interactions, linked items, and navigation

// REMOVED: displayLinkedItems(executionId) - duplicate function (there's another displayLinkedItems(linkedItems) that's used)

/**
 * Navigate to specific trade page
 * @param {number|string} tradeId - Trade ID
 * @returns {void}
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
 * Navigate to specific trade plan page
 * @param {number|string} planId - Trade plan ID
 * @returns {void}
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
 * Navigate to specific alert page
 * @param {number|string} alertId - Alert ID
 * @returns {void}
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
 * Navigate to specific note page
 * @param {number|string} noteId - Note ID
 * @returns {void}
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

// ===== DATA LOADING FUNCTIONS =====
// Data fetching, table updates, and statistics

/**
 * Load executions data from server
 * Fetches all executions and updates the table display
 * 
 * @function loadExecutionsData
 * @async
 * @returns {Promise<void>}
 */
async function loadExecutionsData(options = {}) {
  const { force = false, ttl = window.ExecutionsData?.TTL || 45000 } = options;

  try {
    window.Logger.info('Loading executions data via ExecutionsData service', { page: "executions" });

    let rawExecutions;
    if (typeof window.ExecutionsData?.loadExecutionsData === 'function') {
      window.Logger.debug('📦 Using ExecutionsData service', { page: "executions" });
      rawExecutions = await window.ExecutionsData.loadExecutionsData({ force, ttl });
      window.Logger.debug('📦 ExecutionsData returned', { 
        count: Array.isArray(rawExecutions) ? rawExecutions.length : 0,
        type: typeof rawExecutions,
        page: "executions" 
      });
    } else {
      window.Logger.warn('⚠️ ExecutionsData service not available, using direct fetch', { page: "executions" });
      const base = window.location?.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const response = await fetch(`${base}/api/executions/?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`סטטוס: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      rawExecutions = data?.data || data;
      window.Logger.debug('📦 Direct fetch returned', { 
        count: Array.isArray(rawExecutions) ? rawExecutions.length : 0,
        page: "executions" 
      });
    }

    executionsData = Array.isArray(rawExecutions)
      ? rawExecutions.map(execution => ({
          ...execution,
          updated_at: execution.updated_at || execution.execution_date || execution.date || execution.created_at || null
        }))
      : [];
    window.executionsData = executionsData; // עדכון הנתונים הגלובליים
    
    window.Logger.info('✅ Executions data loaded', { 
      count: executionsData.length,
      page: "executions" 
    });

    if (window.headerSystem && window.headerSystem.currentFilters) {
      const filters = window.headerSystem.currentFilters;
      const hasActiveFilters = !!(
        (filters.status && filters.status.length > 0) ||
        (filters.type && filters.type.length > 0) ||
        (filters.account && filters.account.length > 0) ||
        (filters.dateRange && filters.dateRange !== '') ||
        (filters.search && filters.search !== '')
      );

      if (hasActiveFilters) {
        const filteredData = filterExecutionsLocally(
          executionsData,
          filters.status,
          filters.type,
          filters.account,
          filters.dateRange,
          filters.search,
        );
        syncExecutionsPagination(executionsData);
        setExecutionsFilteredDataset(filteredData);
        return;
      }
    }

    window.Logger.debug('🔄 Syncing executions pagination', { 
      count: executionsData.length,
      page: "executions" 
    });
    syncExecutionsPagination(executionsData);

    if (typeof window.registerExecutionsTables === 'function') {
      window.registerExecutionsTables();
    }

    await restorePageState('executions');
    
    window.Logger.info('✅ Executions table updated', { 
      count: executionsData.length,
      page: "executions" 
    });
  } catch (error) {
    handleApiError(error, 'ביצועים');
  }
}

/**
 * Sync executions pagination with data
 * @param {Array} executionsData - Executions data array
 * @returns {void}
 */
function syncExecutionsPagination(executionsData) {
  try {
    const tableId = 'executionsTable';
    const tableType = 'executions';
    
    window.Logger.debug('🔄 syncExecutionsPagination called', { 
      count: Array.isArray(executionsData) ? executionsData.length : 0,
      tableId,
      tableType,
      page: "executions" 
    });

    if (window.setTableData) {
      window.setTableData(tableType, executionsData, { tableId });
      window.setFilteredTableData(tableType, executionsData, { tableId, skipPageReset: true });
      window.Logger.debug('✅ setTableData called', { page: "executions" });
    } else {
      window.Logger.warn('⚠️ setTableData not available', { page: "executions" });
    }

    const paginationInstance = window.ensureTablePagination
      ? window.ensureTablePagination(tableId, getExecutionsPaginationOptions())
      : null;

    if (paginationInstance) {
      paginationInstance.setData(executionsData);
      window.Logger.debug('✅ Pagination instance setData called', { page: "executions" });
    } else {
      window.Logger.debug('⚠️ No pagination instance, using updateExecutionsTableMain', { page: "executions" });
      updateExecutionsTableMain(executionsData, { skipCounters: true, skipSummary: true, internal: true });
      updateExecutionsSummary(executionsData);
      updateExecutionsCounters(executionsData?.length || 0);
    }
  } catch (error) {
    window.Logger?.error('❌ syncExecutionsPagination failed', { error: error?.message, page: "executions" });
    updateExecutionsTableMain(executionsData, { skipCounters: true, skipSummary: true, internal: true });
    updateExecutionsSummary(executionsData);
    updateExecutionsCounters(executionsData?.length || 0);
  }
}

/**
 * Set filtered executions dataset and update table
 * @param {Array} filteredExecutions - Filtered executions array
 * @returns {void}
 */
function setExecutionsFilteredDataset(filteredExecutions) {
  try {
    const tableId = 'executionsTable';
    const tableType = 'executions';

    if (window.setFilteredTableData) {
      window.setFilteredTableData(tableType, filteredExecutions, { tableId });
    }

    const paginationInstance = window.ensureTablePagination
      ? window.ensureTablePagination(tableId, getExecutionsPaginationOptions())
      : null;

    if (paginationInstance) {
      paginationInstance.setData(filteredExecutions);
    } else {
      updateExecutionsTableMain(filteredExecutions, { skipCounters: true, skipSummary: true, internal: true });
      updateExecutionsSummary(filteredExecutions);
      updateExecutionsCounters(filteredExecutions?.length || 0);
    }
  } catch (error) {
    window.Logger?.error('setExecutionsFilteredDataset failed', { error });
    updateExecutionsTableMain(filteredExecutions || [], { skipCounters: true, skipSummary: true, internal: true });
    updateExecutionsSummary(filteredExecutions);
    updateExecutionsCounters(filteredExecutions?.length || 0);
  }
}

/**
 * Get pagination options for executions table
 * @returns {Object} Pagination options object
 */
function getExecutionsPaginationOptions() {
  return {
    tableType: 'executions',
    onAfterRender: handleExecutionsPageRender,
    onFilteredDataChange: handleExecutionsFilteredChange,
  };
}

/**
 * Handle executions page render event
 * @param {Object} params - Render parameters
 * @param {Array} params.pageData - Page data array
 * @param {Object} params.pagination - Pagination info
 * @returns {void}
 */
function handleExecutionsPageRender({ pageData, pagination }) {
  updateExecutionsTableMain(pageData, { skipCounters: true, skipSummary: true, internal: true });
  if (window.setPageTableData) {
    window.setPageTableData('executions', pageData, {
      tableId: 'executionsTable',
      pageInfo: pagination,
    });
  }
  updateExecutionsCounters();
}

/**
 * Handle executions filtered data change event
 * @param {Object} params - Filter parameters
 * @param {Array} params.filteredData - Filtered data array
 * @returns {void}
 */
function handleExecutionsFilteredChange({ filteredData }) {
  updateExecutionsSummary(filteredData);
  updateExecutionsCounters(filteredData?.length || 0);
}

/**
 * Apply filtered executions data
 * @param {Array} data - Filtered executions data
 * @returns {void}
 */
function applyExecutionsFilteredData(data) {
  filteredExecutions = Array.isArray(data) ? data : [];
  setExecutionsFilteredDataset(filteredExecutions);
}

/**
 * Update executions summary statistics
 * @param {Array|null} [filteredDataOverride=null] - Optional filtered data override
 * @returns {void}
 */
function updateExecutionsSummary(filteredDataOverride = null) {
  try {
    const filteredData = filteredDataOverride
      || (window.getFilteredTableData ? window.getFilteredTableData('executions', { asReference: true }) : window.executionsData);

    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      const config = window.INFO_SUMMARY_CONFIGS.executions;
      if (config) {
        window.InfoSummarySystem.calculateAndRender(filteredData || [], config);
      }
    } else if (typeof window.updatePageSummaryStats === 'function') {
      window.updatePageSummaryStats('executions', filteredData || window.executionsData);
    } else {
      const summaryStatsElement = document.getElementById('summaryStats');
      if (summaryStatsElement) {
        summaryStatsElement.innerHTML = `
          <div style="color: #dc3545; font-weight: bold;">
            ⚠️ מערכת סיכום נתונים לא זמינה - נא לרענן את הדף
          </div>
        `;
      }
    }
  } catch (error) {
    window.Logger?.warn('updateExecutionsSummary failed', { error });
  }
}

/**
 * Update executions counter display
 * @param {number|null} [filteredCountOverride=null] - Optional filtered count override
 * @returns {void}
 */
function updateExecutionsCounters(filteredCountOverride = null) {
  try {
    // Use generic updateTableCount function
    if (window.updateTableCount) {
      window.updateTableCount('.table-count', 'executions', 'ביצועים', filteredCountOverride);
    } else {
      // Fallback to old implementation
      const countElement = document.querySelector('.table-count');
      if (!countElement) {
        return;
      }

      let filteredCount = filteredCountOverride;
      if (filteredCount === null || typeof filteredCount === 'undefined') {
        if (window.getTableDataCounts) {
          const counts = window.getTableDataCounts('executions');
          filteredCount = counts.filtered;
        } else {
          filteredCount = window.executionsData?.length || 0;
        }
      }

      countElement.textContent = `${filteredCount} ביצועים`;
    }
  } catch (error) {
    window.Logger?.warn('updateExecutionsCounters failed', { error });
  }
}

/**
 * עדכון טבלת ביצועים
 */
async function updateExecutionsTableMain(executions, options = {}) {
  if (!options.internal) {
    setExecutionsFilteredDataset(executions);
    return;
  }

  executions = Array.isArray(executions) ? executions : [];
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
    tbody.innerHTML = '<tr><td colspan="12" class="text-center">לא נמצאו ביצועים</td></tr>';
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
    // Use entity services instead of direct fetch calls
    const [tradesData, tickersData] = await Promise.all([
      (window.TradesData && typeof window.TradesData.loadTradesData === 'function')
        ? window.TradesData.loadTradesData().catch(() => [])
        : Promise.resolve([]),
      (window.tickerService && typeof window.tickerService.getTickers === 'function')
        ? window.tickerService.getTickers().catch(() => [])
        : (window.getTickers && typeof window.getTickers === 'function')
          ? window.getTickers().catch(() => [])
          : Promise.resolve([]),
    ]);

    trades = Array.isArray(tradesData) ? tradesData : [];
    tickers = Array.isArray(tickersData) ? tickersData : [];

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
    // מציאת הטרייד המקושר (אופציונלי)
    const trade = trades.find(t => t.id === execution.trade_id);
    let symbol = 'לא מוגדר';
    let tradeInfo = '';
    let ticker = null;

    // תמיד להשתמש בטיקר ישירות מהרשומה
    if (execution.ticker_symbol) {
      // יש ticker_symbol ישירות מהשרת
      symbol = execution.ticker_symbol;
      if (execution.ticker_id) {
        ticker = tickers.find(t => t.id === execution.ticker_id);
      }
    } else if (execution.ticker_id) {
      // יש ticker_id ישיר ברשומה, לחפש בטבלת הטיקרים
      ticker = tickers.find(t => t.id === execution.ticker_id);
      symbol = ticker ? ticker.symbol : 'לא מוגדר';
    } else if (trade && trade.ticker_symbol) {
      // אין ticker_id ישיר, אבל יש טרייד עם טיקר - להשתמש בטיקר של הטרייד
      symbol = trade.ticker_symbol;
      if (trade.ticker_id) {
        ticker = tickers.find(t => t.id === trade.ticker_id);
      }
    } else if (trade && trade.ticker_id) {
      // אין ticker_symbol בטרייד, אבל יש ticker_id - לחפש בטבלת הטיקרים
      ticker = tickers.find(t => t.id === trade.ticker_id);
      symbol = ticker ? ticker.symbol : 'לא מוגדר';
    }

    if (trade) {
      // מידע על הטרייד: תאריך פתיחה | צד | סוג
      const openDate = trade.created_at ? (window.formatDate ? window.formatDate(trade.created_at) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(trade.created_at) : 'לא מוגדר')) : 'לא מוגדר';
      const side = trade.side || 'לא מוגדר';
      const type = trade.investment_type || 'לא מוגדר';

      tradeInfo = `${openDate} | ${side} | ${type}`;
    } else {
      tradeInfo = execution.trade_id ? `טרייד ${execution.trade_id}` : 'ללא טרייד';
    }

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = (execution.action || execution.type) === 'buy' ? 'קנייה' :
      (execution.action || execution.type) === 'sale' ? 'מכירה' :
        execution.action || execution.type;

    // תמיד להשתמש בחשבון ישירות מהרשומה, או מהטרייד אם אין ישיר
    const accountName = execution.account_name || (trade ? trade.account_name : 'לא מוגדר');

    // Trade column - show trade ID with link button if exists
    const tradeCell = execution.trade_id 
      ? `<div class="table-cell-flex-small">
           <button data-button-type="LINK" data-variant="small" data-icon="🔗" data-classes="btn-outline-primary table-btn-small" data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${execution.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${execution.trade_id}, 'view'); }" title="פתח פרטי טרייד"></button>
           <span>#${execution.trade_id}</span>
         </div>`
      : '-';

    return `
            <tr data-execution-id="${execution.id}" class="execution-row">
                <td class="trade-cell" data-trade-id="${execution.trade_id || ''}">
                    ${tradeCell}
                </td>
                <td class="ticker-cell">
                    <div class="table-cell-flex">
                        <strong class="table-link-positive" 
                          data-onclick="if(window.showEntityDetailsModal) { window.showEntityDetailsModal('ticker', ${ticker ? ticker.id : 'null'}, 'view'); } else { window.Logger.info('Entity details modal not available', { page: "executions" }); }" 
                          title="פתח פרטי סימבול">${symbol}</strong>
                    </div>
                </td>
                <td class="type-cell" data-type="${typeForFilter}">
                    ${window.renderAction ? window.renderAction(execution.action || execution.type) : (() => {
                        const action = ((execution.action || execution.type || '').trim()).toLowerCase();
                        if (!action) return '<span class="badge badge-secondary">-</span>';
                        const actionTranslations = { 'buy': 'קנייה', 'sell': 'מכירה', 'short': 'קנייה בחסר', 'cover': 'כיסוי' };
                        const actionHebrew = actionTranslations[action] || action;
                        const positiveActions = new Set(['buy', 'short']);
                        const colorClass = positiveActions.has(action) ? ' text-success' : ' text-danger';
                        return `<span class="badge badge-type badge-capsule${colorClass}" data-type="${action}">${actionHebrew}</span>`;
                    })()}
                </td>
                <td class="table-cell-clickable" data-account="${accountName}" 
                  data-onclick="if(window.showEntityDetailsModal) { window.showEntityDetailsModal('account', '${accountName}', 'view'); } else { window.Logger.info('Entity details modal not available', { page: "executions" }); }" 
                  title="פתח פרטי חשבון מסחר">${accountName}</td>
                <td>${window.renderShares ? window.renderShares(execution.quantity) : execution.quantity}</td>
                <td>${window.formatPrice ? window.formatPrice(execution.price) : (execution.price ? `$${parseFloat(execution.price).toFixed(2)}` : '-')}</td>
                <td class="realized-pl-cell" data-realized-pl="${execution.realized_pl || ''}">
                    ${execution.realized_pl !== null && execution.realized_pl !== undefined ? 
                        (execution.realized_pl >= 0 ? 
                            `<span class="numeric-ltr numeric-value-positive">$${execution.realized_pl}</span>` : 
                            `<span class="numeric-ltr numeric-value-negative">-$${Math.abs(execution.realized_pl)}</span>`) : 
                        '-'}
                </td>
                <td class="mtm-pl-cell" data-mtm-pl="${execution.mtm_pl || ''}">
                    ${execution.mtm_pl !== null && execution.mtm_pl !== undefined ? 
                        (execution.mtm_pl >= 0 ? 
                            `<span class="numeric-ltr numeric-value-positive">$${execution.mtm_pl}</span>` : 
                            `<span class="numeric-ltr numeric-value-negative">-$${Math.abs(execution.mtm_pl)}</span>`) : 
                        '-'}
                </td>
                <td data-date="${execution.execution_date?.utc || execution.execution_date || execution.date || ''}">
                    ${window.renderExecutionDate ? window.renderExecutionDate(execution.execution_date || execution.date) : window.renderDate ? window.renderDate(execution.execution_date || execution.date, true) : ((execution.execution_date || execution.date) ? (window.formatDate ? window.formatDate(execution.execution_date || execution.date, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(execution.execution_date || execution.date, { includeTime: true }) : '-')) : '-')}
                </td>
                <td class="numeric-ltr" dir="ltr">${execution.source || '-'}</td>
                ${(() => {
                  // Prefer FieldRendererService.renderDate for consistent date formatting
                  const rawDate = execution.updated_at || execution.execution_date || execution.date || execution.created_at || null;
                  
                  if (!rawDate) {
                    return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
                  }

                  // Use FieldRendererService.renderDate for proper date formatting
                  let dateDisplay = '';
                  let epoch = null;

                  if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                    // Use FieldRendererService to render date with time
                    dateDisplay = window.FieldRendererService.renderDate(rawDate, true);
                    
                    // Get epoch for sorting
                    if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                      const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(rawDate) : rawDate;
                      epoch = window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                    } else if (rawDate instanceof Date) {
                      epoch = rawDate.getTime();
                    } else if (typeof rawDate === 'string') {
                      const parsed = Date.parse(rawDate);
                      epoch = Number.isNaN(parsed) ? null : parsed;
                    } else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {
                      epoch = rawDate.epochMs;
                    }
                  } else {
                    // Fallback: work directly with date envelope objects or raw values
                    const envelope = window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function'
                      ? window.dateUtils.ensureDateEnvelope(rawDate)
                      : rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || rawDate.local)
                        ? rawDate
                        : null;

                    // Derive epoch milliseconds in a canonical way
                    epoch = (() => {
                      if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                        return window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                      }
                      if (typeof window.getEpochMilliseconds === 'function') {
                        return window.getEpochMilliseconds(envelope || rawDate);
                      }
                      if (envelope && typeof envelope.epochMs === 'number') {
                        return envelope.epochMs;
                      }
                      if (rawDate instanceof Date) {
                        return rawDate.getTime();
                      }
                      if (typeof rawDate === 'string') {
                        const parsed = Date.parse(rawDate);
                        return Number.isNaN(parsed) ? null : parsed;
                      }
                      return null;
                    })();

                    if (epoch === null || Number.isNaN(epoch)) {
                      return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
                    }

                    // Build date display using unified date utilities
                    dateDisplay = (() => {
                      if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
                        return window.dateUtils.formatDateTime(envelope || rawDate);
                      }
                      if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
                        return window.dateUtils.formatDate(envelope || rawDate, { includeTime: true });
                      }
                      try {
                        // Use dateUtils to convert epoch to Date object
                        let dateObj;
                        if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                          dateObj = window.dateUtils.toDateObject({ epochMs: epoch });
                        } else {
                          dateObj = new Date(epoch);
                        }
                        // Use FieldRendererService or dateUtils for consistent date formatting
                        if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                          return window.FieldRendererService.renderDate(dateObj, true);
                        }
                        if (window.formatDate) {
                          return window.formatDate(dateObj, true);
                        }
                        if (window.dateUtils?.formatDate) {
                          return window.dateUtils.formatDate(dateObj, { includeTime: true });
                        }
                        // Last resort: use toLocaleString
                        return dateObj.toLocaleString('he-IL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      } catch (err) {
                        window.Logger?.warn('⚠️ executions updated-cell date formatting failed', { err, executionId: execution?.id }, { page: 'executions' });
                        return 'לא מוגדר';
                      }
                    })();
                  }

                  if (!dateDisplay || dateDisplay === '-') {
                    return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
                  }

                  return `<td class="col-updated"${epoch ? ` data-epoch="${epoch}"` : ''} title="${dateDisplay}"><span class="updated-value" dir="ltr">${dateDisplay}</span></td>`;
                })()}
                <td class="actions-cell">
                    <div class="d-flex gap-1 justify-content-center align-items-center table-flex-nowrap">
                      ${(() => {
                        if (!window.createActionsMenu) {
                          return '<!-- Actions menu not available -->';
                        }
                        const result = window.createActionsMenu([
                          { type: 'VIEW', onclick: `window.showEntityDetails('execution', ${execution.id}, { mode: 'view' })`, title: 'צפה בפרטי עסקה' },
                          { type: 'EDIT', onclick: `editExecution(${execution.id})`, title: 'ערוך' },
                          { type: 'DELETE', onclick: `deleteExecution(${execution.id})`, title: 'מחק' }
                        ]);
                        return result || '';
                      })()}
                    </div>
                </td>
            </tr>
        `;
  }).join('');

  // צביעת רשומות חדשות
  if (newExecutionIds.length > 0) {
    if (window.Logger) {
      window.Logger.debug(`Highlighting ${newExecutionIds.length} new executions`, { 
        count: newExecutionIds.length, 
        page: 'executions' 
      });
    }
    
    // הוספת CSS animation אם לא קיים
    if (!document.getElementById('new-execution-styles')) {
      const style = document.createElement('style');
      style.id = 'new-execution-styles';
      style.textContent = `
        .execution-row.newly-added {
          background-color: rgba(40, 167, 69, 0.2) !important;
          animation: fadeNewExecution 3s ease-out forwards;
        }
        
        @keyframes fadeNewExecution {
          0% {
            background-color: rgba(40, 167, 69, 0.3);
          }
          50% {
            background-color: rgba(40, 167, 69, 0.15);
          }
          100% {
            background-color: transparent;
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
                clearBtn.classList.add('d-none');
                clearBtn.classList.remove('d-inline-block');
              }
            }
          }, 3 * 60 * 1000); // 3 דקות
        }
      });
      
      // הצגת כפתור הניקוי
      const clearBtn = document.getElementById('clearHighlightsBtn');
      if (clearBtn) {
        clearBtn.classList.remove('d-none');
        clearBtn.classList.add('d-inline-block');
      }
    }, 100); // קצת delay כדי שהטבלה תיטען
  }

  if (!options.skipCounters) {
    updateExecutionsCounters();
  }

  if (!options.skipSummary) {
    updateExecutionsSummary();
  }

  // Table update completed successfully
  // === END UPDATE EXECUTIONS TABLE ===
}

// REMOVED: clearNewExecutionHighlights - unused function

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

  // Use dateUtils for consistent date parsing
  let date;
  if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
    date = window.dateUtils.toDateObject(dateOnly);
  } else {
    date = new Date(dateOnly);
  }
  
  let today;
  if (window.dateUtils && typeof window.dateUtils.getToday === 'function') {
    today = window.dateUtils.getToday();
  } else {
    today = new Date();
  }
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

/**
 * Filter executions locally by multiple criteria
 * @param {Array} executions - Executions array to filter
 * @param {Array} selectedStatuses - Selected statuses filter
 * @param {Array} selectedTypes - Selected types filter
 * @param {Array} selectedAccounts - Selected accounts filter
 * @param {string} dateRange - Date range filter
 * @param {string} searchTerm - Search term filter
 * @returns {Array} Filtered executions array
 */
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

  // פילטר לפי חשבון מסחר
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
      window.Logger.error('שגיאה בפילטור מקומי של ביצועים:', error, { page: "executions" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפילטור מקומי של ביצועים', error.message);
    }
    return executions; // החזרת הנתונים המקוריים במקרה של שגיאה
  }
}

// הגדרת הפונקציה כגלובלית
window.filterExecutionsLocally = filterExecutionsLocally;

// הגדרת הפונקציות כגלובליות
// window.openExecutionDetails removed - function no longer exists (replaced by showAddExecutionModal)
window.editExecution = editExecution;
// window.deleteExecution removed - now exported once at line 3054

/**
 * פונקציה לסגירה/פתיחה של executions-section
 */
// toggleExecutionsSection function removed - using global toggleSection('executions') instead

// restoreExecutionsSectionState function removed - using global toggleSection system instead

// פונקציה לסגירה/פתיחה של top-section

// פונקציה לאיפוס פילטרים וטעינה מחדש
// resetAllFiltersAndReloadData() - לא בשימוש, הוסרה

// פונקציות מודלים - Wrapper functions for backward compatibility
// REMOVED: window.showAddExecutionModal - use window.showModalSafe('executionsModal', 'add') directly

window.showEditExecutionModal = function(executionId) {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
        window.ModalManagerV2.showEditModal('executionsModal', 'execution', executionId);
    } else {
        window.Logger.error('ModalManagerV2 not available', { page: 'executions' });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
        }
    }
};

// REMOVED: window.saveExecution - function removed

// REMOVED: updateExecution - unused wrapper, use updateExecutionWrapper directly
// REMOVED: window.confirmDeleteExecution - function removed, using deleteExecution instead

// REMOVED: window exports for removed validation functions
// REMOVED: window exports for removed linked items functions
window.goToTrade = goToTrade;
window.goToPlan = goToPlan;
window.goToAlert = goToAlert;
window.goToNote = goToNote;

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת ביצועים
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

// ===== INITIALIZATION FUNCTIONS =====
// Page initialization and setup

/**
 * Initialize executions page
 * Integrated with unified initialization system
 * 
 * @function initializeExecutionsPage
 * @async
 * @returns {Promise<void>}
 */
window.initializeExecutionsPage = async function() {
  window.Logger.info('⚡ Executions page initialized via unified system', { page: "executions" });
  
  // הגדרת מודלים שלא נסגרים בלחיצה על הרקע
  setupModalConfigurations();

  // אתחול ממשק יצירת טרייד מאשכול ביצועים - LAZY LOADING
  // נטען רק כשהמשתמש פותח את הסקשן trade-creation
  const tradeCreationSection = document.getElementById('trade-creation') || document.querySelector('[data-section="trade-creation"]');
  if (tradeCreationSection && window.PendingExecutionTradeCreation) {
    let tradeCreationInitialized = false;
    
    // Initialize section but don't load data yet
    const initializeTradeCreationSection = () => {
      if (!tradeCreationInitialized && window.PendingExecutionTradeCreation?.initializeExecutionsSection) {
        tradeCreationInitialized = true;
        window.Logger?.info('🔄 Initializing trade creation section (lazy loading)', { page: "executions" });
        window.PendingExecutionTradeCreation.initializeExecutionsSection({
          containerId: 'executionTradeCreationClustersContainer',
          countElementId: 'executionTradeCreationClustersCount',
          loadingElementId: 'executionTradeCreationClustersLoading',
          emptyStateId: 'executionTradeCreationClustersEmpty',
          errorElementId: 'executionTradeCreationClustersError'
        });
      }
    };
    
    // Wait for sections to be restored before initializing observers
    // This prevents loading data during initial page load when restoreAllSectionStates opens sections
    let tradeCreationDebounceTimer = null;
    const setupTradeCreationObserver = () => {
      // Check if section is actually visible to user (not just restored state)
      const sectionBody = tradeCreationSection.querySelector('.section-body');
      const isActuallyOpen = sectionBody && sectionBody.style.display !== 'none' && !sectionBody.classList.contains('hidden');
      
      // Only initialize if section is actually open (user-initiated, not just restored state)
      if (!isActuallyOpen) {
        // Observer לבדיקת visibility של הסקשן - רק אחרי ש-sections שוחזרו
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !tradeCreationInitialized) {
              // Debounce to avoid multiple rapid calls
              if (tradeCreationDebounceTimer) {
                clearTimeout(tradeCreationDebounceTimer);
              }
              tradeCreationDebounceTimer = setTimeout(() => {
                initializeTradeCreationSection();
                observer.disconnect();
              }, 500); // 500ms debounce
            }
          });
        }, { threshold: 0.1 });
        
        observer.observe(tradeCreationSection);
      }
    };
    
    // Wait for sections:restored event or check if already restored
    if (window.sectionsRestored) {
      setupTradeCreationObserver();
    } else {
      document.addEventListener('sections:restored', setupTradeCreationObserver, { once: true });
    }
  }

  // שחזור מצב הסגירה - handled by global toggleSection system

  // טעינת נתונים - נטען ב-customInitializers, לא כאן כדי למנוע קריאה כפולה
  // await loadExecutionsData(); // Removed - loaded in customInitializers

  // יישום צבעי ישות על כותרות
  if (window.applyEntityColorsToHeaders) {
    window.applyEntityColorsToHeaders('execution');
  }

  // הגדרת פונקציות פילטר
  setupExecutionsFilterFunctions();

  // שחזור מצב סידור
  if (window.pageUtils?.restoreSortState) {
    await window.pageUtils.restoreSortState('executions');
  } else if (window.UnifiedTableSystem?.sorter?.applyDefaultSort) {
    await window.UnifiedTableSystem.sorter.applyDefaultSort('executions');
  }

  // אתחול רשימת טיקרים - LAZY LOADING: נטען רק כשהמשתמש פותח את ה-modal
  // updateTickersList('add', false); // Removed - lazy loading on modal open
  // updateTickersList('edit', false); // Removed - lazy loading on modal open

    // Event listeners לעדכון שדה Realized P/L לפי סוג הפעולה
  // ModalManagerV2 uses field.id directly from config (executionType, not addExecutionType/editExecutionType)
  // We need to attach the listener when the modal is shown, not on page load
  // LAZY LOADING: טעינת רשימת טיקרים רק כשהמשתמש פותח את ה-modal
  // Use Bootstrap's shown.bs.modal event
  document.addEventListener('shown.bs.modal', async function(event) {
    const modalElement = event.target;
    if (modalElement && modalElement.id === 'executionsModal') {
      // Determine mode from modal or default to 'add'
      const mode = modalElement.getAttribute('data-mode') || 'add';
      const showClosedTrades = false; // ברירת מחדל
      
      // טעינת רשימת טיקרים רק כשהמשתמש פותח את ה-modal (lazy loading)
      if (typeof updateTickersList === 'function') {
        try {
          window.Logger?.info('🔄 Loading tickers list (lazy loading - modal opened)', { mode, page: "executions" });
          await updateTickersList(mode, showClosedTrades);
        } catch (error) {
          window.Logger?.warn('⚠️ Failed to load tickers list on modal open:', error, { page: "executions" });
        }
      }
    }
  });

  // Load trade suggestions - LAZY LOADING: נטען רק כשהמשתמש מגיע לסקשן
  // Event listener לטעינת המלצות כשהמשתמש פותח את סקשן suggestions
  const suggestionsSection = document.getElementById('suggestions');
  if (suggestionsSection && typeof loadTradeSuggestionsForAll === 'function') {
    let suggestionsLoaded = false;
    
    // Wait for sections to be restored before initializing observers
    // This prevents loading data during initial page load when restoreAllSectionStates opens sections
    let suggestionsDebounceTimer = null;
    const setupSuggestionsObserver = () => {
      // Check if section is actually visible to user (not just restored state)
      const sectionBody = suggestionsSection.querySelector('.section-body');
      const isActuallyOpen = sectionBody && sectionBody.style.display !== 'none' && !sectionBody.classList.contains('hidden');
      
      // Only initialize if section is actually open (user-initiated, not just restored state)
      if (!isActuallyOpen) {
        // Observer לבדיקת visibility של הסקשן - רק אחרי ש-sections שוחזרו
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            // אם הסקשן גלוי ולא טענו עדיין את הנתונים
            if (entry.isIntersecting && !suggestionsLoaded) {
              // Debounce to avoid multiple rapid calls
              if (suggestionsDebounceTimer) {
                clearTimeout(suggestionsDebounceTimer);
              }
              suggestionsDebounceTimer = setTimeout(() => {
                suggestionsLoaded = true;
                window.Logger?.info('🔄 Loading trade suggestions (lazy loading - section visible)', { page: "executions" });
                loadTradeSuggestionsForAll().catch(error => {
                  window.Logger?.warn('⚠️ Failed to load trade suggestions on section open:', error, { page: "executions" });
                  suggestionsLoaded = false; // Allow retry
                });
                observer.disconnect(); // Stop observing after first load
              }, 500); // 500ms debounce
            }
          });
        }, { threshold: 0.1 }); // Trigger when 10% of section is visible
        
        observer.observe(suggestionsSection);
      }
    };
    
    // Wait for sections:restored event or check if already restored
    if (window.sectionsRestored) {
      setupSuggestionsObserver();
    } else {
      document.addEventListener('sections:restored', setupSuggestionsObserver, { once: true });
    }
  }
  
  // Wrapper ל-toggleSection עם lazy loading לסקשנים
  if (typeof window.toggleSection === 'function') {
    const originalToggleSection = window.toggleSection;
    window.toggleSection = function(sectionId) {
      const result = originalToggleSection.call(this, sectionId);
      
      // LAZY LOADING: טעינת נתונים כשהמשתמש פותח סקשן
      setTimeout(() => {
        const section = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
        if (!section) return;
        
        const sectionBody = section.querySelector('.section-body');
        const isOpen = sectionBody && sectionBody.style.display !== 'none' && !sectionBody.classList.contains('hidden');
        
        // Trade creation section - lazy loading
        if (sectionId === 'trade-creation' && isOpen && window.PendingExecutionTradeCreation) {
          const containerId = 'executionTradeCreationClustersContainer';
          const container = document.getElementById(containerId);
          
          // אם הסקשן פתוח והקונטיינר לא מכיל נתונים, אתחל
          if (container && (!container.children.length || container.textContent.trim() === '' || container.textContent.includes('טוען'))) {
            if (window.PendingExecutionTradeCreation.initializeExecutionsSection) {
              window.Logger?.info('🔄 Initializing trade creation section (lazy loading - user toggled section)', { page: "executions" });
              window.PendingExecutionTradeCreation.initializeExecutionsSection({
                containerId: containerId,
                countElementId: 'executionTradeCreationClustersCount',
                loadingElementId: 'executionTradeCreationClustersLoading',
                emptyStateId: 'executionTradeCreationClustersEmpty',
                errorElementId: 'executionTradeCreationClustersError'
              });
            }
          }
        }
        
        // Suggestions section - lazy loading
        if (sectionId === 'suggestions' && isOpen && typeof loadTradeSuggestionsForAll === 'function') {
          // Check if suggestions are already loaded
          const suggestionsTable = section.querySelector('table');
          const hasSuggestions = suggestionsTable && suggestionsTable.querySelector('tbody') && 
                                 suggestionsTable.querySelector('tbody').children.length > 0;
          
          if (!hasSuggestions) {
            window.Logger?.info('🔄 Loading trade suggestions (lazy loading - user toggled section)', { page: "executions" });
            loadTradeSuggestionsForAll().catch(error => {
              window.Logger?.warn('⚠️ Failed to load trade suggestions on toggle:', error, { page: "executions" });
            });
          }
        }
      }, 100); // Small delay to ensure section is fully opened
      
      return result;
    };
  }

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
 * Setup modal configurations (backdrop, keyboard)
 * @returns {void}
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

// ===== TICKER MANAGEMENT FUNCTIONS =====
// Ticker loading, updating, and integration

/**
 * Load tickers with open or closed trades and plans
 * Loads tickers that have active trading activity
 * 
 * @function loadTickersWithOpenOrClosedTradesAndPlans
 * @async
 * @returns {Promise<void>}
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
    window.tickerService.updateTickerSelect('executionTicker', tickersToShow);

  } catch (error) {
    handleApiError(error, 'טיקרים עם טריידים ותכנונים');
    // Fallback - טעינת כל הטיקרים
    try {
      const allTickers = await window.tickerService.getTickers();
      window.tickerService.updateTickerSelect('executionTicker', allTickers);
    } catch (fallbackError) {
      handleApiError(fallbackError, 'טיקרים (גיבוי)');
    }
  }
}

/**
 * הפעלה/השבתה של שדה מזהה חיצוני לפי בחירת מקור
 */


/**
 * Enable all form fields after trade/plan selection
 * @param {string} [mode='add'] - Mode ('add' or 'edit')
 * @returns {void}
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
 * Load active trades for selected ticker using entity service
 * 
 * טעינת טריידים לטיקר שנבחר באמצעות שירות ישויות
 * 
 * Loads trades data using TradesData service instead of direct API calls.
 * Falls back to direct API call if service is unavailable.
 * 
 * @param {string} mode - מצב ('add' או 'edit')
 * @param {boolean} showClosedTrades - האם להציג טריידים סגורים
 * @returns {Promise<void>}
 * @throws {Error} When data loading fails
 * 
 * @example
 * await loadActiveTradesForTicker('add', false);
 */
async function loadActiveTradesForTicker(mode = 'add', _showClosedTrades = false) {
  window.Logger.info('🔄 טעינת טריידים לטיקר, מצב:', mode, 'הצג טריידים סגורים:', _showClosedTrades, { page: "executions" });

  const tickerSelect = document.getElementById('executionTicker');
  const tickerId = tickerSelect ? tickerSelect.value : null;

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
    // טעינת טריידים באמצעות שירות ישויות (preferred method)
    let trades = [];
    if (window.TradesData && typeof window.TradesData.loadTradesData === 'function') {
      trades = await window.TradesData.loadTradesData().catch(() => []);
    } else {
      // Fallback: direct API call
      const tradesResponse = await fetch('/api/trades/');
      const tickerTradesData = await tradesResponse.json();
      trades = tickerTradesData.data || tickerTradesData || [];
    }

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
            // Use FieldRendererService or dateUtils for consistent date formatting
            if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
              creationDate = window.FieldRendererService.renderDate(trade.created_at, false);
            } else if (window.formatDate) {
              const date = window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(trade.created_at) : new Date(trade.created_at);
              creationDate = window.formatDate(date);
            } else if (window.dateUtils?.formatDate) {
              creationDate = window.dateUtils.formatDate(trade.created_at, { includeTime: false });
            } else {
              const date = window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(trade.created_at) : new Date(trade.created_at);
              creationDate = date.toLocaleDateString('he-IL');
            }
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
 * Update trades list when checkbox changes
 * @param {string} [mode='add'] - Mode ('add' or 'edit')
 * @returns {Promise<void>}
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
    const tickerSelect = document.getElementById('executionTicker');
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
 * Update trades list when ticker changes
 * @param {string} [mode='add'] - Mode ('add' or 'edit')
 * @returns {Promise<void>}
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
 * Navigate to ticker page (in development)
 * @param {string} _symbol - Ticker symbol (unused)
 * @returns {void}
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


// ===== UTILITY FUNCTIONS =====
// Helper functions for notifications and general utilities

/**
 * Show ticker help
 * Displays help information for ticker selection
 * 
 * @function showTickerHelp
 * @returns {void}
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
 * Add new ticker (in development)
 * @returns {void}
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
 * Add new trade plan (in development)
 * @returns {void}
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
 * עדכון סיכום נתונים לביצועים
 * @param {Array} executions - מערך הביצועים
 */

// הגדרת הפונקציות כגלובליות
window.loadTickersWithOpenOrClosedTradesAndPlans = loadTickersWithOpenOrClosedTradesAndPlans;
// window.loadTickersWithClosedTrades = loadTickersWithClosedTrades; // פונקציה לא קיימת
window.loadActiveTradesForTicker = loadActiveTradesForTicker;
window.enableAllFields = enableAllFields;
// window.toggleExternalIdField = toggleExternalIdField; // פונקציה לא קיימת
// REMOVED: window.resetAddExecutionForm, window.resetEditExecutionForm - functions removed
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

// ===== FORM MANAGEMENT FUNCTIONS =====
// Form field enabling/disabling and validation

/**
 * Enable execution form fields
 * Activates form fields after ticker selection
 * @deprecated Use toggleExecutionFormFields(true) instead
 * 
 * @function enableExecutionFormFields
 * @returns {void}
 */
function enableExecutionFormFields() {
  toggleExecutionFormFields(true);
}

/**
 * Disable execution form fields
 * @deprecated Use toggleExecutionFormFields(false) instead
 * @returns {void}
 */
function disableExecutionFormFields() {
  toggleExecutionFormFields(false);
}

/**
 * Load ticker information for execution form
 * @param {number|string} tickerId - Ticker ID
 * @returns {Promise<void>}
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
        if (typeof window.getPreference === 'function') {
          const defaultCommission = await window.getPreference('defaultCommission');
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
 * Display ticker information in execution form
 * @param {Object} ticker - Ticker object
 * @returns {void}
 */
function displayExecutionTickerInfo(ticker) {
  // Create or update ticker info display
  let tickerInfoDiv = document.getElementById('executionTickerInfo');
  if (!tickerInfoDiv) {
    // Create a new row for ticker info spanning full width
    const tickerInfoRow = document.createElement('div');
    tickerInfoRow.className = 'row';
    tickerInfoRow.id = 'executionTickerInfoRow';
    
    // Create column for ticker info - full width
    const tickerInfoCol = document.createElement('div');
    tickerInfoCol.className = 'col-12';
    
    tickerInfoDiv = document.createElement('div');
    tickerInfoDiv.id = 'executionTickerInfo';
    tickerInfoDiv.className = 'mb-3 p-3 bg-light rounded';
    
    tickerInfoCol.appendChild(tickerInfoDiv);
    tickerInfoRow.appendChild(tickerInfoCol);
    
    // Insert after the ticker/account row
    const tickerSelect = document.getElementById('executionTicker');
    if (tickerSelect) {
      const tickerField = tickerSelect.closest('.mb-3');
      if (tickerField && tickerField.parentNode) {
        // Find the row containing the ticker field
        const row = tickerField.closest('.row');
        if (row && row.parentNode) {
          row.parentNode.insertBefore(tickerInfoRow, row.nextSibling);
        }
      }
    }
  }
  
  // Use the new global renderTickerInfo function
  if (window.renderTickerInfo) {
    tickerInfoDiv.innerHTML = window.renderTickerInfo(ticker, 'ticker-info-display');
  } else {
    // Fallback if renderTickerInfo not available
    tickerInfoDiv.innerHTML = `
      <div class="ticker-info-display">
        <div class="row">
          <div class="col-md-6">
            <strong>${ticker.symbol || 'N/A'}</strong> - ${ticker.name || 'N/A'}
          </div>
          <div class="col-md-6 text-end">
            <span class="fw-bold">$${(ticker.current_price || 0).toFixed(2)}</span>
            <span class="${(ticker.daily_change || 0) >= 0 ? 'text-success' : 'text-danger'}">
              ${(ticker.daily_change || 0) >= 0 ? '↗' : '↘'} ${(ticker.daily_change || 0).toFixed(2)} (${(ticker.daily_change_percent || 0).toFixed(2)}%)
            </span>
          </div>
        </div>
        <div class="row mt-1">
          <div class="col-12">
            <small class="text-muted">
              נפח: ${(ticker.volume || 0).toLocaleString()} | 
              שינוי יומי: ${(ticker.daily_change || 0).toFixed(2)} (${(ticker.daily_change_percent || 0).toFixed(2)}%)
            </small>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Hide ticker information from execution form
 * @returns {void}
 */
function hideExecutionTickerInfo() {
  const tickerInfoDiv = document.getElementById('executionTickerInfo');
  if (tickerInfoDiv) {
    tickerInfoDiv.remove();
  }
}

/**
 * Calculate execution values (total, etc.) for form
 * Uses backend Business Logic API via ExecutionsData service
 * @param {string} formType - Form type ('add' or 'edit')
 * @returns {Promise<void>}
 */
async function calculateExecutionValues(formType) {
  const isEdit = formType === 'edit';
  const prefix = isEdit ? 'editExecution' : 'execution';
  
  const quantity = parseFloat(document.getElementById(`${prefix}Quantity`).value) || 0;
  const price = parseFloat(document.getElementById(`${prefix}Price`).value) || 0;
  const commission = parseFloat(document.getElementById(`${prefix}Commission`).value) || 0;
  const action = document.getElementById(`${prefix}Type`)?.value || 'buy';

  // Use backend Business Logic API if available
  if (window.ExecutionsData && typeof window.ExecutionsData.calculateExecutionValues === 'function') {
    try {
      const result = await window.ExecutionsData.calculateExecutionValues({
        quantity,
        price,
        commission,
        action
      });
      
      if (result && result.total !== undefined) {
        const totalElement = document.getElementById(`${prefix}Total`);
        if (totalElement) {
          const sign = result.total >= 0 ? '' : '-';
          totalElement.innerHTML = `<strong>${result.label || 'סה"כ:'}</strong> ${sign}$${Math.abs(result.total).toFixed(2)}`;
        }
        return;
      }
    } catch (error) {
      window.Logger?.warn?.('⚠️ Error calling ExecutionsData.calculateExecutionValues, using fallback', {
        page: 'executions',
        error: error?.message || error
      });
      // Fall through to local calculation
    }
  }

  // Fallback: Local calculation (backward compatibility)
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
    if (action === 'buy') {
      // בקנייה: סה"כ עלות = -(כמות * מחיר + עמלה) - שלילי כי זה כסף שיוצא
      total = -(quantity * price + commission);
      label = 'סה"כ עלות:';
    } else if (action === 'sell') {
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
 * Calculate execution values for add form
 * @deprecated Use calculateExecutionValues('add') instead
 * @returns {Promise<void>}
 */
async function calculateAddExecutionValues() {
  await calculateExecutionValues('add');
}

/**
 * Calculate execution values for edit form
 * @deprecated Use calculateExecutionValues('edit') instead
 * @returns {Promise<void>}
 */
async function calculateEditExecutionValues() {
  await calculateExecutionValues('edit');
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
 * Load executions for trade (used in trade modal)
 * @param {number} _tradeId - Trade ID (unused)
 * @returns {void}
 */
function loadTradeExecutions(_tradeId) {
  // טעינת ביצועים לטרייד

  try {
    // כאן תהיה קריאה לשרת לטעינת הביצועים
    // כרגע נציג נתוני דוגמה

    // לא צריך לעדכן טבלה בדף executions (זו פונקציה למודל עריכת טרייד)
    // loadTradeExecutions called on executions page - no action needed
    // loadTradeExecutions completed successfully
  } catch (error) {
    handleApiError(error, 'ביצועים לטרייד');
  }
}

/**
 * עדכון טבלת הביצועים במודל עריכת טרייד
 * @param {Array} executions - מערך הביצועים
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

      const typeBadge = window.renderAction ? window.renderAction(execution.type) : (() => {
        const action = ((execution.type || '').trim()).toLowerCase();
        if (!action) return '<span class="badge badge-secondary">-</span>';
        const actionTranslations = { 'buy': 'קנייה', 'sell': 'מכירה', 'short': 'קנייה בחסר', 'cover': 'כיסוי' };
        const actionHebrew = actionTranslations[action] || action;
        const positiveActions = new Set(['buy', 'short']);
        const colorClass = positiveActions.has(action) ? ' text-success' : ' text-danger';
        return `<span class="badge badge-type badge-capsule${colorClass}" data-type="${action}">${actionHebrew}</span>`;
      })();

      const statusBadge = execution.status === 'completed'
        ? '<span class="badge bg-success">הושלם</span>'
        : '<span class="badge bg-warning">ממתין</span>';

      row.innerHTML = `
                <td>${window.renderExecutionDate ? window.renderExecutionDate(execution.date) : execution.date}</td>
                <td>${typeBadge}</td>
                <td>${window.renderShares ? window.renderShares(execution.quantity) : execution.quantity}</td>
                <td>${window.formatPrice ? window.formatPrice(execution.price) : (execution.price ? `$${parseFloat(execution.price).toFixed(2)}` : '-')}</td>
                <td>${window.formatPrice ? window.formatPrice(execution.commission) : (execution.commission ? `$${parseFloat(execution.commission).toFixed(2)}` : '-')}</td>
                <td>${window.formatPrice ? window.formatPrice(execution.total) : (execution.total ? `$${parseFloat(execution.total).toFixed(2)}` : '-')}</td>
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
 * Link existing execution to trade (in development)
 * @returns {void}
 */
function linkExistingExecution() {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'פונקציונליות שיוך עסקה קיימת נמצאת בפיתוח');
  } else {
    // פונקציונליות שיוך עסקה קיימת נמצאת בפיתוח
  }
}

/**
 * Unlink execution from trade (in development)
 * @returns {void}
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

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for HTML onclick attributes

// Export all necessary functions to global scope
window.addExecution = addExecution;
window.editExecution = editExecution;
window.deleteExecution = deleteExecution;
// REMOVED: window.updateExecution - function removed
// REMOVED: window.validateExecutionDate - function removed, use window.validateField() instead
// REMOVED: window.validateExecutionType - function removed, use window.validateField() instead
// REMOVED: window.clearFieldError - use window.clearFieldValidation() from validation-utils.js instead
// REMOVED: window.clearExecutionValidationErrors - use window.clearValidation() from validation-utils.js instead
// REMOVED: window.validateCompleteExecutionForm - use window.validateForm() or window.validateEntityForm() instead
window.displayLinkedItems = displayLinkedItems;
// REMOVED DUPLICATES: goToTrade, goToPlan, goToAlert, goToNote, goToTickerPage, showTickerHelp, addNewTicker, isDateInRange, filterExecutionsLocally already exported above
window.restoreSortState = restoreSortState;
// REMOVED DUPLICATES: setupModalConfigurations, enableAllFields, updateExecutionsTableMain already exported above
window.initializeExecutionsPage = window.initializeExecutionsPage;
window.loadTickersWithOpenOrClosedTradesAndPlans = loadTickersWithOpenOrClosedTradesAndPlans;
window.updateTickersList = updateTickersList;
window.addNewPlan = addNewPlan;
window.addNewTrade = addNewTrade;
window.enableExecutionFormFields = enableExecutionFormFields;
window.disableExecutionFormFields = disableExecutionFormFields;
window.loadExecutionTickerInfo = loadExecutionTickerInfo;
window.hideExecutionTickerInfo = hideExecutionTickerInfo;
// REMOVED DUPLICATES: calculateAddExecutionValues, calculateEditExecutionValues, addEditBuySell, linkExistingExecution, unlinkExecution already exported above
window.filterExecutionsByAccount = window.filterExecutionsByAccount;
window.searchExecutions = window.searchExecutions;
window.resetExecutionsFilters = window.resetExecutionsFilters;
window.setupExecutionsFilterFunctions = setupExecutionsFilterFunctions;
// REMOVED: window.toggleExecutionsSection - use window.toggleSection('executions') directly
// REMOVED: window.showAddExecutionModal - use window.ModalManagerV2.showModal('executionsModal', 'add') directly
// REMOVED: window.showEditExecutionModal - use window.ModalManagerV2.showEditModal('executionsModal', 'execution', id) directly

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
        topSection.classList.add('d-none');
        topSection.classList.remove('d-block');
        topIcon.textContent = '▼';
      } else {
        topSection.classList.remove('d-none');
        topSection.classList.add('d-block');
        topIcon.textContent = '▲';
      }
    }
  }

  // אתחול וולידציה עם כללים מותאמים לביצועים
  if (window.initializeValidation) {
    // כללי וולידציה מותאמים לטופס הוספת ביצוע
    const addExecutionValidationRules = {
      trade_id: {
        required: false,
        message: 'טרייד (אופציונלי)',
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
        required: false,
        message: 'טרייד (אופציונלי)',
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

// ===== SORTING AND FILTERING FUNCTIONS =====
// Table sorting, filtering, and state management

/**
 * Setup executions filter functions
 * Configures filter system for executions table
 * 
 * @function setupExecutionsFilterFunctions
 * @returns {void}
 */
function setupExecutionsFilterFunctions() {
  // Setting up executions filter functions

  // שימוש במערכת הפילטרים הגלובלית - לא מעבירים פונקציה, רק מתחברים למערכת
  if (typeof window.applyTableFilter === 'function') {
    // רישום הפונקציות הגלובליות למערכת הפילטרים
    window.executionsFilterFunctions = {
      updateTable(filteredData) {
        applyExecutionsFilteredData(filteredData);
      },
    };
  }

  // פונקציה לפילטר חשבון מסחר
  window.filterExecutionsByAccount = function(accountNames) {
    try {
    // Filtering executions by account names

    const namesArray = Array.isArray(accountNames) ? accountNames : [accountNames];

    // בדיקה אם זה "הכול" או רשימה ריקה
    if (namesArray.length === 0 || namesArray.includes('all') || namesArray.includes('הכול')) {
      filteredExecutions = [...originalExecutions];
      // Showing all executions
      applyExecutionsFilteredData(filteredExecutions);
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
          handleApiError(error, 'טריידים לפילטר חשבון מסחר');
          // Fallback - הצגת כל הביצועים
          filteredExecutions = [...allExecutions];
      applyExecutionsFilteredData(filteredExecutions);
        });
    }
    } catch (error) {
      window.Logger.error('filterExecutionsByAccount failed', { page: 'executions', error: error?.message || error });
      // Fallback - הצגת כל הביצועים
      filteredExecutions = [...originalExecutions];
      applyExecutionsFilteredData(filteredExecutions);
    }
  };

  // פונקציה עזר לפילטר חשבון מסחר עם נתוני טריידים
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
    applyExecutionsFilteredData(filteredExecutions);
    // Filtered to executions
  }

  // פונקציה לחיפוש חופשי
  window.searchExecutions = function(searchTerm) {
    try {
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

    applyExecutionsFilteredData(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    // Search results
    } catch (error) {
      window.Logger.error('searchExecutions failed', { page: 'executions', error: error?.message || error });
      // Fallback - הצגת כל הביצועים
      filteredExecutions = [...originalExecutions];
      applyExecutionsFilteredData(filteredExecutions);
    }
  };

  // פונקציה לפילטר לפי סוג עסקה
  window.filterExecutionsByType = function(types) {
    try {
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

    applyExecutionsFilteredData(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    // Filtered by type
    } catch (error) {
      window.Logger.error('filterExecutionsByType failed', { page: 'executions', error: error?.message || error });
      // Fallback - הצגת כל הביצועים
      filteredExecutions = [...originalExecutions];
      applyExecutionsFilteredData(filteredExecutions);
    }
  };

  // פונקציה לפילטר לפי תאריך
  window.filterExecutionsByDate = function(dateRange) {
    try {
    // Filtering executions by date range

    if (!dateRange || dateRange === 'all' || dateRange === 'הכול') {
      filteredExecutions = [...originalExecutions];
    } else {
      // Use dateUtils for consistent date handling
      let today;
      if (window.dateUtils && typeof window.dateUtils.getToday === 'function') {
        today = window.dateUtils.getToday();
      } else {
        today = new Date();
      }
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      filteredExecutions = originalExecutions.filter(execution => {
        // Use dateUtils to parse execution date
        let executionDate;
        const dateValue = execution.execution_date || execution.created_at;
        if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
          executionDate = window.dateUtils.toDateObject(dateValue);
        } else {
          executionDate = new Date(dateValue);
        }

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

    applyExecutionsFilteredData(filteredExecutions);
    // Filtered by date
    } catch (error) {
      window.Logger.error('filterExecutionsByDate failed', { page: 'executions', error: error?.message || error });
      // Fallback - הצגת כל הביצועים
      filteredExecutions = [...originalExecutions];
      applyExecutionsFilteredData(filteredExecutions);
    }
  };

  // פונקציה לאיפוס פילטרים
  window.resetExecutionsFilters = function() {
    try {
    // Resetting executions filters
    filteredExecutions = [...originalExecutions];
    applyExecutionsFilteredData(filteredExecutions);
    // Filters reset, showing all executions
    } catch (error) {
      window.Logger.error('resetExecutionsFilters failed', { page: 'executions', error: error?.message || error });
      // Fallback - הצגת כל הביצועים
      filteredExecutions = [...originalExecutions];
      applyExecutionsFilteredData(filteredExecutions);
    }
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
// Use the actual function, not the placeholder
// Standard pattern: when called from CRUD operations, always use force: true (like trades.js)
const originalLoadExecutionsData = loadExecutionsData;
window.loadExecutionsData = async function(options = {}) {
  // When called from CRUDResponseHandler, always force reload to get fresh data
  // This matches the standard pattern used in trades.js and other pages
  await originalLoadExecutionsData({ ...options, force: true });

  // עדכון הנתונים הגלובליים לאחר טעינה
  if (window.executionsData && window.executionsData.length > 0) {
    updateExecutionsGlobalData(window.executionsData);

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

  // טעינת טבלת טיקרים חלקית - LAZY LOADING: נטען רק כשנחוץ
  // Removed from here - will be loaded on demand when needed
  // This prevents multiple concurrent API calls on page load
  // try {
  //   const tickers = await loadTickersSummaryData();
  //   updateTickersSummaryTable(tickers);
  // } catch (error) {
  //   handleApiError(error, 'טבלת טיקרים חלקית');
  // }
};

// הוספת פונקציות CRUD גלובליות
if (typeof window.registerCRUDFunctions === 'function') {
  window.registerCRUDFunctions('executions', {
    create: saveExecution,
    read: loadExecutionsData,
    update: updateExecution,
    delete: deleteExecution, // Using deleteExecution which includes confirmation
    showAddModal: () => window.ModalManagerV2?.showModal('executionsModal', 'add'), // שימוש במערכת הכללית
    showEditModal: (id) => window.ModalManagerV2?.showEditModal('executionsModal', 'execution', id),
    showDeleteModal: deleteExecution,
  });
}

/**
 * זיהוי מזהה השדה מהודעת שגיאה
 * @param {string} errorMessage - הודעת השגיאה
 * @param {string} prefix - קידומת הטופס (add או edit)
 * @returns {string|null} מזהה השדה או null
 */


// ייצוא הפונקציה הגלובלית - לא צורך כי זה כבר ה-wrapped version מ-line 3533
// window.loadExecutionsData = loadExecutionsData; // This was overriding the wrapper!

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
    externalIdContainer.classList.add('d-none');
    externalIdContainer.classList.remove('d-block');
    if (externalIdField) {
      externalIdField.value = '';
    }
    // שדה מזהה חיצוני מוסתר (מקור ידני)
  } else {
    // הצגת שדה מזהה חיצוני עבור מקורות אחרים
    externalIdContainer.classList.remove('d-none');
    externalIdContainer.classList.add('d-block');
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
 * Load tickers summary data using entity services
 * 
 * טעינת נתוני טיקרים חלקיים באמצעות שירותי ישויות
 * 
 * Loads tickers and trades data using global entity services instead of direct API calls.
 * Falls back to direct API calls if services are unavailable.
 * 
 * @async
 * @returns {Promise<void>}
 * @throws {Error} When data loading fails
 * 
 * @example
 * await loadTickersSummaryData();
 */
async function loadTickersSummaryData() {
  // window.Logger.info('🔄 טעינת נתוני טיקרים חלקיים...', { page: "executions" });

  try {
    // טעינת טיקרים באמצעות שירות ישויות (preferred method)
    let allTickers = [];
    if (window.tickerService && typeof window.tickerService.getTickers === 'function') {
      allTickers = await window.tickerService.getTickers().catch(() => []);
    } else if (window.getTickers && typeof window.getTickers === 'function') {
      allTickers = await window.getTickers().catch(() => []);
    } else {
      // Fallback: direct API call
      const tickersResponse = await fetch('/api/tickers/');
      const tickersData = await tickersResponse.json();
      allTickers = tickersData.data || tickersData || [];
    }

    // טעינת טריידים באמצעות שירות
    let trades = [];
    if (window.TradesData && typeof window.TradesData.loadTradesData === 'function') {
      trades = await window.TradesData.loadTradesData().catch(() => []);
    } else {
      // Fallback: direct API call
      const tradesResponse = await fetch('/api/trades/');
      const summaryTradesData = await tradesResponse.json();
      trades = summaryTradesData.data || summaryTradesData || [];
    }

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
        // Use FieldRendererService or dateUtils for consistent date formatting
        if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
          creationDate = window.FieldRendererService.renderDate(ticker.created_at, false);
        } else if (window.formatDate) {
          const date = window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(ticker.created_at) : new Date(ticker.created_at);
          creationDate = window.formatDate(date);
        } else if (window.dateUtils?.formatDate) {
          creationDate = window.dateUtils.formatDate(ticker.created_at, { includeTime: false });
        } else {
          const date = window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(ticker.created_at) : new Date(ticker.created_at);
          creationDate = date.toLocaleDateString('he-IL');
        }
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
                <button data-button-type="VIEW" data-variant="small" data-icon="👁️" data-classes="btn-outline-primary table-btn-small" data-onclick="viewTickerDetails(${ticker.id})" title="צפה בפרטים"></button>
                <button data-button-type="ADD" data-variant="small" data-icon="➕" data-classes="btn-outline-success table-btn-small" data-onclick="addExecutionForTicker(${ticker.id})" title="הוסף עסקה"></button>
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
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
    window.ModalManagerV2.showModal('executionsModal', 'add');
  } else {
    window.Logger.error('❌ ModalManagerV2 לא זמין במערכת הכללית', { page: "executions" });
  }

  // בחירת הטיקר במודל
  setTimeout(() => {
    const tickerSelect = document.getElementById('executionTicker');
    if (tickerSelect) {
      tickerSelect.value = tickerId;
      // הפעלת שינוי הטיקר
      if (typeof updateTradesOnTickerChange === 'function') {
        updateTradesOnTickerChange('add');
      }
      // טעינת מידע על הטיקר
      if (window.loadExecutionTickerInfo) {
        window.loadExecutionTickerInfo(tickerId);
      }
    }
  }, 100);
}

/**
 * הצגה/הסתרה של סקשן הטיקרים
 */
// REMOVED: toggleTickersSection - use window.toggleSection('tickers') from ui-utils.js instead

// ייצוא פונקציות
window.loadTickersSummaryData = loadTickersSummaryData;
window.updateTickersSummaryTable = updateTickersSummaryTable;
window.refreshTickersSummary = refreshTickersSummary;
window.viewTickerDetails = viewTickerDetails;
window.addExecutionForTicker = addExecutionForTicker;
// REMOVED: window.toggleTickersSection - use window.toggleSection('tickers') directly

/**
 * Update tickers list using entity services
 * 
 * עדכון רשימת טיקרים באמצעות שירותי ישויות
 * 
 * Loads tickers and trades data using global entity services instead of direct API calls.
 * Filters tickers based on mode and showClosedTrades parameter.
 * 
 * @param {string} mode - מצב ('add' או 'edit')
 * @param {boolean} showClosedTrades - האם להציג טריידים סגורים
 * @returns {Promise<void>}
 * @throws {Error} When data loading fails
 * 
 * @example
 * await updateTickersList('add', false);
 */
async function updateTickersList(mode, showClosedTrades = false) {
  // window.Logger.info('🔄 עדכון רשימת טיקרים:', { mode, showClosedTrades }, { page: "executions" });

  try {
    // טעינת כל הטיקרים באמצעות שירות ישויות (preferred method)
    let allTickers = [];
    if (window.tickerService && typeof window.tickerService.getTickers === 'function') {
      allTickers = await window.tickerService.getTickers().catch(() => []);
    } else if (window.getTickers && typeof window.getTickers === 'function') {
      allTickers = await window.getTickers().catch(() => []);
    } else {
      // Fallback: direct API call
      const tickersResponse = await fetch('/api/tickers/');
      const tickersData = await tickersResponse.json();
      allTickers = tickersData.data || tickersData || [];
    }

    // טעינת טריידים באמצעות שירות
    let trades = [];
    if (window.TradesData && typeof window.TradesData.loadTradesData === 'function') {
      trades = await window.TradesData.loadTradesData().catch(() => []);
    } else {
      // Fallback: direct API call
      const tradesResponse = await fetch('/api/trades/');
      const tickersTradesData = await tradesResponse.json();
      trades = tickersTradesData.data || tickersTradesData || [];
    }

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
    const tickerSelect = document.getElementById('executionTicker');

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

// REMOVED: toggleExecutionsSection - use window.toggleSection('executions') from ui-utils.js directly

// ===== IMPORT MODAL FUNCTIONS =====
// Import functionality is handled by import-user-data.js
// This file only contains the modal opening/closing functions

// ===== MODAL FUNCTIONS - NEW SYSTEM =====
// Modal management using ModalManagerV2

// REMOVED: showAddExecutionModal - use window.ModalManagerV2.showModal('executionsModal', 'add') directly

// REMOVED: showEditExecutionModal - use window.ModalManagerV2.showEditModal('executionsModal', 'execution', executionId) directly

/**
 * מחיקת ביצוע
 * Includes linked items check and detailed execution information
 */
async function deleteExecution(executionId) {
    try {
        // Get execution details for confirmation message
        let executionDetails = `ביצוע #${executionId}`;
        const execution = window.executionsData?.find(exec => exec.id === executionId || exec.id === parseInt(executionId));
        
        if (execution) {
            const ticker = execution.ticker_symbol || execution.symbol || 'לא מוגדר';
            const actionText = window.renderAction ? 
                               window.renderAction(execution.action || execution.type).replace(/<[^>]*>/g, '') : 
                               (() => {
                                   const action = (((execution.action || execution.type) || '').trim()).toLowerCase();
                                   const actionTranslations = { 'buy': 'קנייה', 'sell': 'מכירה', 'short': 'קנייה בחסר', 'cover': 'כיסוי' };
                                   return actionTranslations[action] || action;
                               })();
            const quantity = execution.quantity || '0';
            const price = execution.price ? (window.formatPrice ? window.formatPrice(execution.price) : `$${parseFloat(execution.price).toFixed(2)}`) : '$0';
            // Use FieldRendererService or dateUtils for consistent date formatting
            let date = 'לא מוגדר';
            const dateValue = execution.date || execution.execution_date;
            if (dateValue) {
              if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                date = window.FieldRendererService.renderDate(dateValue, false);
              } else if (window.formatDate) {
                date = window.formatDate(dateValue);
              } else if (window.dateUtils?.formatDate) {
                date = window.dateUtils.formatDate(dateValue, { includeTime: false });
              } else {
                const dateObj = window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(dateValue) : new Date(dateValue);
                date = dateObj.toLocaleDateString('he-IL');
              }
            }
            executionDetails = `${ticker} - ${actionText}, ${quantity} יחידות ב-${price}, תאריך: ${date}`;
        }
        
        // Check linked items first
        if (window.checkLinkedItemsBeforeAction) {
            const hasLinkedItems = await window.checkLinkedItemsBeforeAction('execution', executionId, 'delete');
            if (hasLinkedItems) {
                window.Logger.info('Execution has linked items, deletion cancelled', { executionId, page: 'executions' });
                return;
            }
        }
        
        // Use warning system for confirmation with detailed information
        if (window.showDeleteWarning) {
            window.showDeleteWarning('execution', executionDetails, 'ביצוע',
                async () => await performExecutionDeletion(executionId),
                () => {}
            );
        } else {
            // Fallback to simple confirm
            if (!confirm('האם אתה בטוח שברצונך למחוק את הביצוע?')) {
                return;
            }
            await performExecutionDeletion(executionId);
        }
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'מחיקת ביצוע');
    }
}

async function performExecutionDeletion(executionId) {
    try {
        // Clear cache before deletion to ensure fresh data after reload
        if (window.unifiedCacheManager) {
            await window.unifiedCacheManager.clearByPattern('executions-data');
            await window.unifiedCacheManager.clearByPattern('dashboard-data');
            await window.unifiedCacheManager.clearByPattern('account-activity-data');
            await window.unifiedCacheManager.clearByPattern('account-activity-*');
            await window.unifiedCacheManager.clearByPattern('account-balance-*');
        }
        
        // Send delete request using ExecutionsData service if available
        let response;
        if (typeof window.ExecutionsData?.deleteExecution === 'function') {
            response = await window.ExecutionsData.deleteExecution(executionId);
        } else {
            // Fallback to direct fetch
            response = await fetch(`/api/executions/${executionId}`, {
                method: 'DELETE'
            });
        }
        
        // Use CRUDResponseHandler for consistent response handling
        await CRUDResponseHandler.handleDeleteResponse(response, {
            successMessage: 'ביצוע נמחק בהצלחה',
            entityName: 'ביצוע',
            reloadFn: window.loadExecutionsData,
            requiresHardReload: false
        });
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'מחיקת ביצוע');
    }
}

// Export functions to window for global access
// Note: saveExecution already exported above

/**
 * Restore page state (filters, sort, sections, entity filters)
 * @param {string} pageName - Page name
 * @returns {Promise<void>}
 */
async function restorePageState(pageName) {
  try {
    // אתחול PageStateManager אם לא מאותחל
    if (window.PageStateManager && !window.PageStateManager.initialized) {
      await window.PageStateManager.initialize();
    }

    if (!window.PageStateManager || !window.PageStateManager.initialized) {
      if (window.Logger) {
        window.Logger.warn('⚠️ PageStateManager not available, skipping state restoration', { page: pageName });
      }
      return;
    }

    // מיגרציה של נתונים קיימים אם יש
    await window.PageStateManager.migrateLegacyData(pageName);

    // טעינת מצב מלא
    const pageState = await window.PageStateManager.loadPageState(pageName);
    if (!pageState) {
      return; // אין מצב שמור
    }

    // שחזור פילטרים ראשיים
    if (pageState.filters && window.filterSystem) {
      window.filterSystem.currentFilters = { ...window.filterSystem.currentFilters, ...pageState.filters };
      if (window.filterSystem.applyAllFilters) {
        window.filterSystem.applyAllFilters();
      }
    }

    // שחזור סידור
    if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      const { columnIndex, direction } = pageState.sort;
      if (typeof columnIndex === 'number' && columnIndex >= 0) {
        await window.UnifiedTableSystem.sorter.sort('executions', columnIndex, {
          direction: direction || 'asc',
          saveState: false // Don't save again, already restored
        });
      }
    } else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      // אם אין מצב שמור, נסה להחיל סידור ברירת מחדל
      await window.UnifiedTableSystem.sorter.applyDefaultSort('executions');
    }

    // שחזור סקשנים
    if (pageState.sections && typeof window.restoreAllSectionStates === 'function') {
      await window.restoreAllSectionStates();
    }

    // שחזור פילטרים פנימיים (entity filters) - מתבצע אוטומטית ב-entity-details-renderer

    if (window.Logger) {
      window.Logger.debug(`✅ Page state restored for "${pageName}"`, { page: pageName });
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error(`❌ Error restoring page state for "${pageName}":`, error, { page: pageName });
    }
  }
}

/**
 * Register executions table with UnifiedTableSystem
 * This function registers the executions table for unified sorting and filtering
 */
window.registerExecutionsTables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { page: "executions" });
        return;
    }

    // Get column mappings from table-mappings.js
    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    // Register executions table
    window.UnifiedTableSystem.registry.register('executions', {
        dataGetter: () => {
            return window.executionsData || [];
        },
        updateFunction: (data) => {
            if (typeof window.updateExecutionsTableMain === 'function') {
                window.updateExecutionsTableMain(data);
            }
        },
        tableSelector: '#executionsTable',
        columns: getColumns('executions'),
        sortable: true,
        filterable: true,
        // Default sort: date desc (column index 8)
        defaultSort: { columnIndex: 8, direction: 'desc', key: 'date' }
    });
    
    // Register trade suggestions table
    window.UnifiedTableSystem.registry.register('trade_suggestions', {
        dataGetter: () => {
            if (tradeSuggestionsFlatList && tradeSuggestionsFlatList.length > 0) {
                return tradeSuggestionsFlatList.map(item => ({ ...item }));
            }
            return buildTradeSuggestionsFlatList(tradeSuggestionsData);
        },
        updateFunction: (data) => {
            if (Array.isArray(data)) {
                updateTradeSuggestionsTable(data);
            }
        },
        tableSelector: '#tradeSuggestionsTable',
        columns: getColumns('trade_suggestions'),
        sortable: true,
        filterable: false,
        // Default sort: trade_created_at desc (column index 5)
        defaultSort: { columnIndex: 5, direction: 'desc', key: 'trade_created_at' }
    });
};

// ========================================
// Trade Suggestions Functions
// ========================================

/**
 * Global variable to store suggestions data
 */
let tradeSuggestionsData = {};
let tradeSuggestionsFlatList = [];
let tradeSuggestionsPaginationInstance = null;

/**
 * Load trade suggestions for all pending executions
 */
async function loadTradeSuggestionsForAll() {
    try {
        window.Logger?.info('🔄 Loading trade suggestions for all pending executions...', { page: "executions" });
        
        // Get pending executions
        const pendingResponse = await fetch('/api/executions/pending-assignment');
        if (!pendingResponse.ok) {
            throw new Error(`HTTP ${pendingResponse.status}: ${pendingResponse.statusText}`);
        }
        
        const pendingResult = await pendingResponse.json();
        const pendingExecutions = pendingResult.data || [];
        
        if (pendingExecutions.length === 0) {
            // No pending executions - hide section or show message
            tradeSuggestionsData = {};
            tradeSuggestionsFlatList = [];
            renderTradeSuggestionsSection({});
            updateSuggestionsCount(0);
            return;
        }
        
        // Load suggestions for each execution
        const suggestionsPromises = pendingExecutions.map(async (execution) => {
            try {
                const suggestResponse = await fetch(`/api/executions/${execution.id}/suggest-trades`);
                if (!suggestResponse.ok) {
                    window.Logger?.warn(`⚠️ Failed to load suggestions for execution ${execution.id}`, { page: "executions" });
                    return { execution_id: execution.id, suggestions: [] };
                }
                
                const suggestResult = await suggestResponse.json();
                return {
                    execution_id: execution.id,
                    execution: execution,
                    suggestions: suggestResult.data || []
                };
            } catch (error) {
                window.Logger?.error(`❌ Error loading suggestions for execution ${execution.id}:`, error, { page: "executions" });
                return { execution_id: execution.id, execution: execution, suggestions: [] };
            }
        });
        
        const suggestionsResults = await Promise.all(suggestionsPromises);
        
        // Build suggestions data structure
        const suggestionsData = {};
        suggestionsResults.forEach(result => {
            if (result.suggestions && result.suggestions.length > 0) {
                suggestionsData[result.execution_id] = {
                    execution: result.execution,
                    suggestions: result.suggestions
                };
            }
        });
        
        tradeSuggestionsData = suggestionsData;
        tradeSuggestionsFlatList = buildTradeSuggestionsFlatList(suggestionsData);
        
        // Render suggestions section
        renderTradeSuggestionsSection(suggestionsData, tradeSuggestionsFlatList);
        updateSuggestionsCount(Object.keys(suggestionsData).length);
        
        window.Logger?.info(`✅ Loaded suggestions for ${Object.keys(suggestionsData).length} executions`, { page: "executions" });
        
    } catch (error) {
        window.Logger?.error('❌ Error loading trade suggestions:', error, { page: "executions" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת המלצות שיוך', error.message);
        }
    }
}

/**
 * Update suggestions count display
 */
function updateSuggestionsCount(count) {
    const countElement = document.getElementById('suggestionsCount');
    if (countElement) {
        countElement.textContent = count > 0 ? `${count} ביצועים עם המלצות` : 'אין המלצות';
    }
}

/**
 * Render trade suggestions section
 */
function renderTradeSuggestionsSection(suggestionsData, flatList = null) {
    const container = document.getElementById('tradeSuggestionsContainer');
    if (!container) {
        window.Logger?.warn('⚠️ tradeSuggestionsContainer not found', { page: "executions" });
        return;
    }

    if (window.destroyPagination) {
        window.destroyPagination('tradeSuggestionsTable');
    }
    tradeSuggestionsPaginationInstance = null;
    
    const effectiveRows = Array.isArray(flatList) ? flatList : (
        tradeSuggestionsFlatList.length > 0
            ? tradeSuggestionsFlatList
            : buildTradeSuggestionsFlatList(suggestionsData)
    );
    tradeSuggestionsFlatList = effectiveRows ? effectiveRows.map(item => ({ ...item })) : [];
    
    if (!tradeSuggestionsFlatList || tradeSuggestionsFlatList.length === 0) {
        tradeSuggestionsFlatList = [];
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <strong>אין המלצות זמינות</strong><br>
                כל הביצועים משוייכים לטריידים או שאין טריידים מתאימים.
            </div>
        `;
        return;
    }
    
    // Render table
    const html = `
        <div class="table-responsive">
            <table class="table table-hover" id="tradeSuggestionsTable" data-table-type="trade_suggestions">
                <thead>
                    <tr>
                        <th class="col-checkbox">
                            <input type="checkbox" id="selectAllSuggestions" title="בחר הכל" onchange="toggleAllSuggestions(this.checked)">
                        </th>
                        <th class="col-score">
                            <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="ציון התאמה" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trade_suggestions', 1)"></button>
                        </th>
                        <th class="col-execution">
                            <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="ביצוע" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trade_suggestions', 2)"></button>
                        </th>
                        <th class="col-trade">
                            <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="טרייד" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trade_suggestions', 3)"></button>
                        </th>
                        <th class="col-account">
                            <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="חשבון" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trade_suggestions', 4)"></button>
                        </th>
                        <th class="col-date">
                            <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="תאריך טרייד" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trade_suggestions', 5)"></button>
                        </th>
                        <th class="col-status">
                            <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="סטטוס" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trade_suggestions', 6)"></button>
                        </th>
                        <th class="col-side">
                            <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="צד" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trade_suggestions', 7)"></button>
                        </th>
                        <th class="col-type">
                            <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="סוג" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trade_suggestions', 8)"></button>
                        </th>
                        <th class="col-match">
                            <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="סיבות התאמה" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trade_suggestions', 9)"></button>
                        </th>
                        <th class="col-actions actions-cell">פעולות</th>
                    </tr>
                </thead>
                <tbody id="tradeSuggestionsTableBody">
                    <tr><td colspan="12" class="text-center text-muted">טוען נתונים...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Ensure table is registered with unified system
    if (window.UnifiedTableSystem && window.UnifiedTableSystem.registry && typeof window.registerExecutionsTables === 'function') {
        try {
            if (!window.UnifiedTableSystem.registry.isRegistered('trade_suggestions')) {
                window.registerExecutionsTables();
            }
        } catch (error) {
            window.Logger?.warn('⚠️ Failed to register trade_suggestions table:', error, { page: "executions" });
        }
    }
    
    // Setup select all checkbox handler
    const selectAllCheckbox = document.getElementById('selectAllSuggestions');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function(e) {
            toggleAllSuggestions(e.target.checked);
        });
    }

    initializeTradeSuggestionsPagination(tradeSuggestionsFlatList);
}

/**
 * Build single trade suggestion table row
 */
function buildTradeSuggestionRow(executionId, execution, suggestion, showExecutionInfo) {
    const FieldRenderer = window.FieldRendererService;
    
    const executionSymbol = execution?.ticker_symbol || execution?.symbol || 'לא מוגדר';
    const executionDateValue = execution?.execution_date || execution?.date || execution?.created_at || null;
    const executionDate = FieldRenderer?.renderExecutionDate
        ? FieldRenderer.renderExecutionDate(executionDateValue)
        : (FieldRenderer?.renderDate
            ? FieldRenderer.renderDate(executionDateValue, true)
            : (executionDateValue ? (window.formatDate ? window.formatDate(executionDateValue) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(executionDateValue) : (window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(executionDateValue).toLocaleDateString('he-IL') : new Date(executionDateValue).toLocaleDateString('he-IL')))) : '-'));
    const executionPrice = FieldRenderer?.renderAmount ? FieldRenderer.renderAmount(execution?.price, '$', 2, false) : (execution?.price ? `$${parseFloat(execution.price).toFixed(2)}` : '-');
    const executionQuantity = FieldRenderer?.renderShares ? FieldRenderer.renderShares(execution?.quantity) : (execution?.quantity || '-');
    const executionAction = FieldRenderer?.renderAction ? FieldRenderer.renderAction(execution?.action) : (() => {
        const action = ((execution?.action || '').trim()).toLowerCase();
        if (!action) return '<span class="badge badge-secondary">-</span>';
        const actionTranslations = { 'buy': 'קנייה', 'sell': 'מכירה', 'short': 'קנייה בחסר', 'cover': 'כיסוי' };
        const actionHebrew = actionTranslations[action] || action;
        const positiveActions = new Set(['buy', 'short']);
        const colorClass = positiveActions.has(action) ? ' text-success' : ' text-danger';
        return `<span class="badge badge-type badge-capsule${colorClass}" data-type="${action}">${actionHebrew}</span>`;
    })();
    
    const scoreCategory = suggestion.score >= 100 ? 'open' : 
                          suggestion.score >= 70 ? 'warning' : 'info';
    const scoreBadge = `<span class="status-badge" data-status-category="${scoreCategory}">${suggestion.score}</span>`;
    
    const tradeEnvelope = suggestion.trade_created_at || suggestion.created_at;
    const tradeLocalValue = tradeEnvelope?.local || tradeEnvelope?.utc || tradeEnvelope?.display || suggestion.created_at;
    const tradeDate = FieldRenderer?.renderDate ? FieldRenderer.renderDate(tradeLocalValue) : (tradeLocalValue ? (window.formatDate ? window.formatDate(tradeLocalValue) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(tradeLocalValue) : (window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(tradeLocalValue).toLocaleDateString('he-IL') : new Date(tradeLocalValue).toLocaleDateString('he-IL')))) : '-');
    const tradeSortValue = tradeEnvelope?.epochMs ?? suggestion.trade_created_at_epoch ?? tradeEnvelope?.utc ?? tradeLocalValue ?? '';
    const tradeStatus = FieldRenderer?.renderStatus ? FieldRenderer.renderStatus(suggestion.status, 'trade') : (suggestion.status === 'open' || suggestion.status === 'active' ? 'פעיל' : suggestion.status === 'closed' ? 'סגור' : suggestion.status);
    const tradeSide = FieldRenderer?.renderSide ? FieldRenderer.renderSide(suggestion.side) : (suggestion.side || '-');
    const investmentType = FieldRenderer?.renderType ? FieldRenderer.renderType(suggestion.investment_type) : (suggestion.investment_type || '-');
    const matchReasons = suggestion.match_reasons ? suggestion.match_reasons.join(', ') : '-';
    
    const executionInfo = showExecutionInfo
        ? `<div class="table-cell-flex">
             <strong class="table-link-positive" 
               data-onclick="if(window.showEntityDetailsModal) { window.showEntityDetailsModal('execution', ${executionId}, 'view'); }"
               title="פתח פרטי ביצוע">
               #${executionId}
             </strong>
             <span class="text-muted">${executionSymbol}</span>
           </div>
           <div class="text-muted small">
             ${executionAction} | ${executionDate} | ${executionQuantity} | ${executionPrice}
           </div>`
        : '';
    
    return `
        <tr class="suggestion-row" data-execution-id="${executionId}" data-trade-id="${suggestion.trade_id}" data-score="${suggestion.score}" data-account-name="${suggestion.account_name || ''}" data-date="${suggestion.created_at || ''}" data-status="${suggestion.status || ''}" data-side="${suggestion.side || ''}" data-type="${suggestion.investment_type || ''}">
            <td class="col-checkbox">
                <input type="checkbox" 
                       class="suggestion-checkbox" 
                       data-execution-id="${executionId}" 
                       data-trade-id="${suggestion.trade_id}"
                       id="suggestion_${executionId}_${suggestion.trade_id}">
            </td>
            <td class="col-score" data-sort-value="${suggestion.score}">
                ${scoreBadge}
            </td>
            <td class="col-execution">
                ${executionInfo}
            </td>
            <td class="col-trade">
                <div class="table-cell-flex">
                    <button data-button-type="LINK" data-variant="small" data-icon="🔗" data-classes="btn-outline-primary table-btn-small" data-onclick="openTradeDetailsModal(${suggestion.trade_id})" title="פתח פרטי טרייד"></button>
                    <strong>#${suggestion.trade_id}</strong>
                </div>
                <div class="text-muted small">${suggestion.ticker_symbol || ''}</div>
            </td>
            <td class="col-account" data-sort-value="${suggestion.account_name || ''}">
                ${suggestion.account_name || '-'}
            </td>
            <td class="col-date" data-date="${tradeLocalValue || ''}" data-sort-value="${tradeSortValue || ''}">
                ${tradeDate}
            </td>
            <td class="col-status" data-sort-value="${suggestion.status || ''}">
                ${tradeStatus}
            </td>
            <td class="col-side" data-sort-value="${suggestion.side || ''}">
                ${tradeSide}
            </td>
            <td class="col-type" data-sort-value="${suggestion.investment_type || ''}">
                ${investmentType}
            </td>
            <td class="col-match">
                <span class="text-muted small">${matchReasons}</span>
            </td>
            <td class="col-actions actions-cell">
                <div class="table-cell-flex-small">
                    <button data-button-type="APPROVE" data-variant="small" data-icon="✓" data-classes="btn-outline-success table-btn-small" data-onclick="acceptSuggestion(${executionId}, ${suggestion.trade_id})" title="קבל המלצה"></button>
                    <button data-button-type="REJECT" data-variant="small" data-icon="✗" data-classes="btn-outline-danger table-btn-small" data-onclick="rejectSuggestion(${executionId}, ${suggestion.trade_id})" title="דחה המלצה"></button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Toggle all suggestions checkbox
 */
function toggleAllSuggestions(checked) {
    const checkboxes = document.querySelectorAll('.suggestion-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = checked;
    });
}

/**
 * Accept a single suggestion
 */
async function acceptSuggestion(executionId, tradeId) {
    try {
        window.Logger?.info(`✅ Accepting suggestion: execution ${executionId} -> trade ${tradeId}`, { page: "executions" });
        
        // Use ExecutionsData service if available
        let response;
        if (typeof window.ExecutionsData?.updateExecution === 'function') {
            response = await window.ExecutionsData.updateExecution(executionId, {
                trade_id: tradeId
            });
        } else {
            // Fallback to direct fetch
            response = await fetch(`/api/executions/${executionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trade_id: tradeId
                })
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to assign execution to trade');
        }
        
        // Show success notification
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('השיוך בוצע בהצלחה', `ביצוע #${executionId} שויך לטרייד #${tradeId}`);
        }
        
        // Reload suggestions
        await loadTradeSuggestionsForAll();
        
        // Reload executions table
        if (typeof window.loadExecutionsData === 'function') {
            await window.loadExecutionsData();
        }
        
    } catch (error) {
        window.Logger?.error(`❌ Error accepting suggestion:`, error, { page: "executions" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בשיוך', error.message);
        }
    }
}

/**
 * Reject a single suggestion
 */
function rejectSuggestion(executionId, tradeId) {
    window.Logger?.info(`❌ Rejecting suggestion: execution ${executionId} -> trade ${tradeId}`, { page: "executions" });
    
    // Remove the suggestion row from UI
    const suggestionRow = document.querySelector(
        `.suggestion-row[data-execution-id="${executionId}"][data-trade-id="${tradeId}"]`
    );
    
    if (suggestionRow) {
        suggestionRow.classList.add('rejected', 'd-none');
    }
    
    // Remove from data
    if (tradeSuggestionsData[executionId]) {
        tradeSuggestionsData[executionId].suggestions = tradeSuggestionsData[executionId].suggestions.filter(
            s => s.trade_id !== tradeId
        );
        
        // If no more suggestions for this execution, remove it
        if (tradeSuggestionsData[executionId].suggestions.length === 0) {
            delete tradeSuggestionsData[executionId];
        }
    }
    
    // Re-render table
    renderTradeSuggestionsSection(tradeSuggestionsData);
    updateSuggestionsCount(Object.keys(tradeSuggestionsData).length);
}

/**
 * Accept all suggestions
 */
async function acceptAllSuggestions() {
    try {
        window.Logger?.info('✅ Accepting all suggestions...', { page: "executions" });
        
        const assignments = [];
        Object.keys(tradeSuggestionsData).forEach(executionId => {
            const data = tradeSuggestionsData[executionId];
            // Get the highest score suggestion for each execution
            if (data.suggestions && data.suggestions.length > 0) {
                const bestSuggestion = data.suggestions[0]; // Already sorted by score
                assignments.push({
                    execution_id: parseInt(executionId),
                    trade_id: bestSuggestion.trade_id
                });
            }
        });
        
        if (assignments.length === 0) {
            if (typeof window.showInfoNotification === 'function') {
                window.showInfoNotification('אין המלצות', 'אין המלצות זמינות לאישור');
            }
            return;
        }
        
        // Batch assign
        const response = await fetch('/api/executions/batch-assign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assignments })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to assign executions');
        }
        
        const result = await response.json();
        
        // Show success notification
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification(
                'שיוך הושלם',
                `שויכו ${result.summary.success} ביצועים מתוך ${result.summary.total}`
            );
        }
        
        // Reload suggestions
        await loadTradeSuggestionsForAll();
        
        // Reload executions table
        if (typeof window.loadExecutionsData === 'function') {
            await window.loadExecutionsData();
        }
        
    } catch (error) {
        window.Logger?.error('❌ Error accepting all suggestions:', error, { page: "executions" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בשיוך מרוכז', error.message);
        }
    }
}

/**
 * Reject all suggestions
 */
function rejectAllSuggestions() {
    window.Logger?.info('❌ Rejecting all suggestions...', { page: "executions" });
    
    // Clear all suggestions
    tradeSuggestionsData = {};
    tradeSuggestionsFlatList = [];
    renderTradeSuggestionsSection({});
    updateSuggestionsCount(0);
    
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('המלצות נדחו', 'כל ההמלצות נדחו');
    }
}

/**
 * Apply selected suggestions
 */
async function applySelectedSuggestions() {
    try {
        window.Logger?.info('✅ Applying selected suggestions...', { page: "executions" });
        
        // Get all checked suggestions
        const checkedBoxes = document.querySelectorAll('.suggestion-checkbox:checked');
        
        if (checkedBoxes.length === 0) {
            if (typeof window.showInfoNotification === 'function') {
                window.showInfoNotification('אין בחירות', 'אנא סמן המלצות לשיוך');
            }
            return;
        }
        
        const assignments = [];
        checkedBoxes.forEach(checkbox => {
            const executionId = parseInt(checkbox.getAttribute('data-execution-id'));
            const tradeId = parseInt(checkbox.getAttribute('data-trade-id'));
            assignments.push({
                execution_id: executionId,
                trade_id: tradeId
            });
        });
        
        // Batch assign
        const response = await fetch('/api/executions/batch-assign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assignments })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to assign executions');
        }
        
        const result = await response.json();
        
        // Show success notification
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification(
                'שיוך הושלם',
                `שויכו ${result.summary.success} ביצועים מתוך ${result.summary.total}`
            );
        }
        
        // Reload suggestions
        await loadTradeSuggestionsForAll();
        
        // Reload executions table
        if (typeof window.loadExecutionsData === 'function') {
            await window.loadExecutionsData();
        }
        
    } catch (error) {
        window.Logger?.error('❌ Error applying selected suggestions:', error, { page: "executions" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בשיוך נבחרים', error.message);
        }
    }
}

// Export functions to global scope
/**
 * Open trade details modal
 * Helper function to open trade details modal from suggestion table
 */
function openTradeDetailsModal(tradeId) {
    if (window.entityDetailsModal && window.entityDetailsModal.show) {
        window.entityDetailsModal.show('trade', tradeId, { mode: 'view' });
    } else if (window.showEntityDetailsModal) {
        window.showEntityDetailsModal('trade', tradeId, { mode: 'view' });
    } else if (window.showEntityDetails) {
        window.showEntityDetails('trade', tradeId, { mode: 'view' });
    } else {
        window.Logger?.warn('No entity details modal function available', { page: "executions" });
    }
}

/**
 * Get flat data array for sorting
 * Converts the nested suggestionsData structure to a flat array of rows
 * This function creates a flat array where each item represents one row in the table
 */
function getTradeSuggestionsFlatData() {
    if (tradeSuggestionsFlatList && tradeSuggestionsFlatList.length > 0) {
        return tradeSuggestionsFlatList.map(item => ({ ...item }));
    }
    tradeSuggestionsFlatList = buildTradeSuggestionsFlatList(tradeSuggestionsData);
    return tradeSuggestionsFlatList.map(item => ({ ...item }));
}

/**
 * Sort trade suggestions table
 * Wrapper for sortTableData with custom column value resolution
 */
async function sortTradeSuggestionsTable(columnIndex, data, tableType, updateFunction) {
    // Use the standard sortTableData function
    if (window.sortTableData) {
        return await window.sortTableData(columnIndex, data, tableType, updateFunction);
    }
    return data;
}

/**
 * Update trade suggestions table after sorting
 */
function updateTradeSuggestionsTable(sortedData) {
    // Convert flat sorted data back to nested structure while preserving order
    const newSuggestionsData = {};
    sortedData.forEach(item => {
        const executionId = item.execution_id.toString();
        if (!newSuggestionsData[executionId]) {
            newSuggestionsData[executionId] = {
                execution: item.execution,
                suggestions: []
            };
        }
        newSuggestionsData[executionId].suggestions.push(item.suggestion);
    });
    
    // Update global data representations
    tradeSuggestionsData = newSuggestionsData;
    tradeSuggestionsFlatList = sortedData.map(item => ({ ...item }));
    
    // Re-render table in the sorted order
    renderTradeSuggestionsSection(newSuggestionsData, sortedData);
}

window.loadTradeSuggestionsForAll = loadTradeSuggestionsForAll;
window.renderTradeSuggestionsSection = renderTradeSuggestionsSection;
window.toggleAllSuggestions = toggleAllSuggestions;
window.acceptSuggestion = acceptSuggestion;
window.rejectSuggestion = rejectSuggestion;
window.getTradeSuggestionsFlatData = getTradeSuggestionsFlatData;
window.sortTradeSuggestionsTable = sortTradeSuggestionsTable;
window.updateTradeSuggestionsTable = updateTradeSuggestionsTable;
window.openTradeDetailsModal = openTradeDetailsModal;
window.acceptAllSuggestions = acceptAllSuggestions;
window.rejectAllSuggestions = rejectAllSuggestions;
window.applySelectedSuggestions = applySelectedSuggestions;

/**
 * Initialize pagination for trade suggestions table
 */
function initializeTradeSuggestionsPagination(data) {
    const suggestionsArray = Array.isArray(data) ? data : [];

    if (!window.createPagination) {
        renderTradeSuggestionsPageRows(suggestionsArray);
        return;
    }

    if (!tradeSuggestionsPaginationInstance) {
        tradeSuggestionsPaginationInstance = window.createPagination('tradeSuggestionsTable', {
            showPageSizeSelector: true,
            showNavigation: true,
            onPageChange: (pageData) => {
                renderTradeSuggestionsPageRows(pageData);
            },
            onPageSizeChange: () => {
                if (tradeSuggestionsPaginationInstance) {
                    renderTradeSuggestionsPageRows(tradeSuggestionsPaginationInstance.getCurrentPageData());
                }
            }
        });
    }

    tradeSuggestionsPaginationInstance.setData(suggestionsArray);
    const currentPageData = tradeSuggestionsPaginationInstance.getCurrentPageData();
    renderTradeSuggestionsPageRows(currentPageData);
}

/**
 * Render table rows for current pagination page
 */
function renderTradeSuggestionsPageRows(pageData) {
    const table = document.getElementById('tradeSuggestionsTable');
    if (!table) {
        return;
    }
    const tbody = table.querySelector('#tradeSuggestionsTableBody') || table.querySelector('tbody');
    if (!tbody) {
        return;
    }

    const selectAllCheckbox = document.getElementById('selectAllSuggestions');

    if (!Array.isArray(pageData) || pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="text-center text-muted">אין המלצות זמינות</td></tr>';
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        return;
    }

    const rows = [];
    let lastExecutionId = null;
    pageData.forEach(item => {
        const executionId = item.execution_id;
        const execution = item.execution || (tradeSuggestionsData[executionId]?.execution ?? {});
        const suggestion = item.suggestion;
        if (!suggestion) {
            return;
        }
        const showExecutionInfo = executionId !== lastExecutionId;
        rows.push(buildTradeSuggestionRow(executionId, execution, suggestion, showExecutionInfo));
        lastExecutionId = executionId;
    });

    tbody.innerHTML = rows.join('');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
}

/**
 * Build flat list of trade suggestions with sorting fields
 */
function buildTradeSuggestionsFlatList(sourceData) {
    const parseDateToTimestamp = (value) => {
        if (!value && value !== 0) {
            return null;
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (value instanceof Date) {
            return value.getTime();
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) {
                return null;
            }

            const dateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
                const datePart = dateMatch[1];
                const timestamp = Date.parse(`${datePart}T00:00:00Z`);
                if (!Number.isNaN(timestamp)) {
                    return timestamp;
                }
            }

            const parsed = Date.parse(trimmed);
            if (!Number.isNaN(parsed)) {
                const normalized = new Date(parsed);
                normalized.setHours(0, 0, 0, 0);
                return normalized.getTime();
            }

            return null;
        }
        return null;
    };

    const resolveTimezone = () => {
        if (window.currentPreferences?.timezone) {
            return window.currentPreferences.timezone;
        }
        if (window.PreferencesSystem?.manager?.currentPreferences?.timezone) {
            return window.PreferencesSystem.manager.currentPreferences.timezone;
        }
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        } catch {
            return 'UTC';
        }
    };

    const createDateEnvelope = (value) => {
        if (window.tableMappings?.buildDateEnvelope) {
            return window.tableMappings.buildDateEnvelope(value, { timezone: resolveTimezone() });
        }

        const timestamp = parseDateToTimestamp(value);
        if (timestamp === null) {
            return null;
        }
        const utc = new Date(timestamp).toISOString();
        const timezone = resolveTimezone();
        const local = typeof value === 'string' && value.trim() ? value : utc;
        let display = '-';
        try {
            if (typeof window.formatDate === 'function') {
                display = window.formatDate(local);
            } else if (typeof window.dateUtils?.formatDate === 'function') {
                display = window.dateUtils.formatDate(timestamp);
            } else {
                // Use dateUtils to convert timestamp to Date object
                const dateObj = window.dateUtils?.toDateObject ? window.dateUtils.toDateObject({ epochMs: timestamp }) : new Date(timestamp);
                display = dateObj.toLocaleDateString('he-IL');
            }
        } catch {
            display = new Date(timestamp).toISOString().split('T')[0];
        }
        return {
            utc,
            epochMs: timestamp,
            local,
            timezone,
            display
        };
    };

    const flatData = [];
    if (!sourceData) {
        return flatData;
    }
    Object.keys(sourceData).forEach(executionId => {
        const data = sourceData[executionId];
        if (data?.suggestions && Array.isArray(data.suggestions)) {
            const executionEnvelope = createDateEnvelope(data.execution?.date);
            data.suggestions.forEach(suggestion => {
                const tradeDateRaw = suggestion.created_at ||
                    suggestion.opened_at ||
                    suggestion.open_date ||
                    suggestion.start_date;
                const tradeEnvelope = createDateEnvelope(tradeDateRaw);
                flatData.push({
                    execution_id: parseInt(executionId, 10),
                    execution: data.execution,
                    suggestion,
                    // Fields for sorting (must match TABLE_COLUMN_MAPPINGS)
                    score: suggestion.score || 0,
                    execution_date: executionEnvelope,
                    trade_id: suggestion.trade_id || 0,
                    account_name: suggestion.account_name || '',
                    trade_created_at: tradeEnvelope,
                    trade_created_at_epoch: tradeEnvelope?.epochMs ?? null,
                    status: suggestion.status || '',
                    side: suggestion.side || '',
                    investment_type: suggestion.investment_type || '',
                    match_reasons_text: Array.isArray(suggestion.match_reasons) ? suggestion.match_reasons.join(', ') : (suggestion.match_reasons || '')
                });
            });
        }
    });
    return flatData;
}
