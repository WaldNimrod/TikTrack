// ===== קובץ JavaScript לדף עסקעות =====
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
function openExecutionDetails(id) {
  
    showAddExecutionModal();
}

function editExecution(id) {
  
    showEditExecutionModal(id);
}

function deleteExecution(id) {
    console.log('🔧 deleteExecution called with id:', id);
    console.log('🔧 window.showDeleteWarning exists:', typeof window.showDeleteWarning === 'function');
    
    // שימוש במערכת הגלובלית למחיקה
    if (typeof window.showDeleteWarning === 'function') {
        console.log('🔧 Using global showDeleteWarning');
        window.showDeleteWarning('executions', id, 'עסקה', async () => {
            console.log('🔧 Delete confirmed, calling confirmDeleteExecution');
            // קריאה לפונקציה המקומית לאחר אישור
            await confirmDeleteExecution(id);
        }, null);
    } else {
        console.log('🔧 Using fallback - global system not available');
        // גיבוי למקרה שהמערכת הגלובלית לא זמינה
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מערכת מחיקה לא זמינה');
        } else {
            console.error('מערכת מחיקה לא זמינה');
        }
    }
}

// פונקציות לפתיחה/סגירה של סקשנים - שימוש במערכת הכללית
function toggleExecutionsSection() {
  // שימוש במערכת הכללית מ-main.js
  if (typeof window.toggleMainSection === 'function') {
    window.toggleMainSection();
  } else {
    console.error('❌ toggleMainSection function not found in main.js');
  }
}

// פונקציה לשחזור מצב הסגירה - שימוש במערכת הכללית
function restoreExecutionsSectionState() {
    // שימוש במערכת הכללית מ-main.js
    if (typeof window.restoreAllSectionStates === 'function') {
        window.restoreAllSectionStates();
    } else {
        console.error('❌ restoreAllSectionStates function not found in main.js');
    }
}

// פונקציות נוספות

// ========================================
// פונקציות מודלים
// ========================================

/**
 * ניקוי והשבתת שדות בטופס הוספת עסקה
 */
function resetAddExecutionForm() {
    // ניקוי הטופס
    document.getElementById('addExecutionForm').reset();
    clearExecutionValidationErrors();

    // השבתת כל השדות חוץ מטיקר
    const fieldsToDisable = [
        'addExecutionTradeId',
        'addExecutionType',
        'addExecutionQuantity',
        'addExecutionPrice',
        'addExecutionCommission',
        'addExecutionDate',
        'addExecutionNotes'
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

/**
 * הצגת מודל הוספת עסקה
 */
async function showAddExecutionModal() {
  

    // ניקוי והשבתת השדות
    resetAddExecutionForm();

    // הגדרת תאריך ברירת מחדל - היום
    const today = new Date();
    const todayString = today.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    document.getElementById('addExecutionDate').value = todayString;

    // הגדרת עמלה ברירת מחדל לפי העדפות
    try {
        const defaultCommission = window.userPreferences && window.userPreferences.defaultCommission 
            ? window.userPreferences.defaultCommission 
            : 9.99; // ערך ברירת מחדל אם אין העדפות
        document.getElementById('addExecutionCommission').value = defaultCommission;
    } catch (error) {
        document.getElementById('addExecutionCommission').value = 9.99;
    }

    // טעינת טיקרים עם טריידים ותכנונים בסטטוס פתוח או סגור
    await loadTickersWithOpenOrClosedTradesAndPlans();

    // חישוב ערכים מחושבים
    calculateAddExecutionValues();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addExecutionModal'));
    modal.show();
}

/**
 * ניקוי והשבתת שדות בטופס עריכת עסקה
 */
function resetEditExecutionForm() {
    // ניקוי הטופס
    document.getElementById('editExecutionForm').reset();
    clearExecutionValidationErrors();

    // השבתת כל השדות חוץ מטיקר
    const fieldsToDisable = [
        'editExecutionTradeId',
        'editExecutionType',
        'editExecutionQuantity',
        'editExecutionPrice',
        'editExecutionCommission',
        'editExecutionDate',
        'editExecutionNotes'
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
  

    // מציאת העסקה לפי ID
    const execution = executionsData.find(e => e.id == id);
    if (!execution) {
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'עסקה לא נמצאה');
        } else {
            console.error('עסקה לא נמצאה');
        }
        return;
    }

    // טעינת טיקרים עם טריידים ותכנונים בסטטוס פתוח או סגור
    await loadTickersWithOpenOrClosedTradesAndPlans();

    // טעינת פרטי הטרייד/תכנון המקושר
    let linkedObject = null;
    let tickerId = null;

    try {
        // בדיקה אם יש טרייד מקושר
        if (execution.trade_id) {
            const tradesResponse = await fetch('/api/v1/trades/');
            const tradesData = await tradesResponse.json();
            const trades = tradesData.data || tradesData || [];

            const trade = trades.find(t => t.id == execution.trade_id);
            if (trade) {
                linkedObject = { type: 'trade', data: trade };
                tickerId = trade.ticker_id;
              
            }
        }

        // אם לא נמצא טרייד, נבדוק תכנונים
        if (!linkedObject) {
            try {
                const plansResponse = await fetch('/api/v1/trade_plans/');
                if (plansResponse.ok) {
                    const plansData = await plansResponse.json();
                    const plans = plansData.data || plansData || [];

                    const plan = plans.find(p => p.id == execution.trade_id);
                    if (plan) {
                        linkedObject = { type: 'plan', data: plan };
                        tickerId = plan.ticker_id;
                      
                    }
                }
            } catch (error) {
                console.warn('⚠️ לא ניתן לטעון תכנונים:', error);
            }
        }

        // עדכון שדה הטיקר
        if (tickerId) {
            const tickerSelect = document.getElementById('editExecutionTicker');
            if (tickerSelect) {
                tickerSelect.value = tickerId;
                // טעינת טריידים ותכנונים לטיקר זה
                await loadActiveTradesForTicker('edit');
            }
        }

        // מילוי הטופס
        document.getElementById('editExecutionId').value = execution.id;

        // עדכון שדה הטרייד/תכנון - מחכים לטעינת הטריידים
        if (linkedObject) {
            // מחכים לטעינת הטריידים לפני מילוי השדה
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const tradeSelect = document.getElementById('editExecutionTradeId');
            if (tradeSelect && tradeSelect.options.length > 0) {
                // האפשרויות מכילות מספרים ישירים, לא trade_X או plan_X
                const value = linkedObject.data.id.toString();
                
                console.log('🔍 מחפש ערך:', value, 'באפשרויות:', Array.from(tradeSelect.options).map(opt => opt.value));
                
                // בדיקה אם הערך קיים באפשרויות
                const optionExists = Array.from(tradeSelect.options).some(option => option.value === value);
                if (optionExists) {
                    tradeSelect.value = value;
                    console.log('✅ שדה טרייד/תכנון מולא:', value);
                } else {
                    console.warn('⚠️ הערך לא נמצא באפשרויות:', value);
                    console.warn('⚠️ האפשרויות הזמינות:', Array.from(tradeSelect.options).map(opt => ({value: opt.value, text: opt.textContent})));
                }
            }
        }

        // תיקון שדה הפעולה - מיפוי action/type לערכים ב-select
        const actionValue = execution.action || execution.type;
        if (actionValue) {
            const actionSelect = document.getElementById('editExecutionType');
            if (actionSelect) {
                actionSelect.value = actionValue;
                console.log('✅ שדה פעולה מולא:', actionValue);
            }
        }

        // מילוי שדה הכמות
        if (execution.quantity) {
            document.getElementById('editExecutionQuantity').value = execution.quantity;
            console.log('✅ שדה כמות מולא:', execution.quantity);
        }

        // מילוי שדה המחיר
        if (execution.price) {
            document.getElementById('editExecutionPrice').value = execution.price;
            console.log('✅ שדה מחיר מולא:', execution.price);
        }

        // עיבוד תאריך ביצוע - בדיקה של שדות שונים
        let executionDate = execution.date || execution.execution_date;
        if (executionDate) {
            try {
                // המרה לפורמט datetime-local
                const date = new Date(executionDate);
                const localDateTime = date.toISOString().slice(0, 16);
                document.getElementById('editExecutionDate').value = localDateTime;
                console.log('✅ שדה תאריך מולא:', localDateTime);
            } catch (error) {
                console.warn('⚠️ Error processing execution date:', executionDate, error);
                document.getElementById('editExecutionDate').value = '';
            }
        } else {
            console.warn('⚠️ No execution date found');
            document.getElementById('editExecutionDate').value = '';
        }

        // מילוי שדה העמלה
        const commissionValue = execution.fee || execution.commission || '';
        if (commissionValue) {
            document.getElementById('editExecutionCommission').value = commissionValue;
            console.log('✅ שדה עמלה מולא:', commissionValue);
        }

        // מילוי שדה המקור
        const sourceValue = execution.source || 'manual';
        document.getElementById('editExecutionSource').value = sourceValue;
        console.log('✅ שדה מקור מולא:', sourceValue);

        // מילוי שדה ההערות
        const notesValue = execution.notes || '';
        if (notesValue) {
            document.getElementById('editExecutionNotes').value = notesValue;
            console.log('✅ שדה הערות מולא:', notesValue);
        }

        // הצגת כפתור קישור לטרייד/תכנון אם יש
        const tradeLinkButton = document.getElementById('editExecutionTradeLink');
        if (tradeLinkButton && linkedObject) {
            tradeLinkButton.style.display = 'block';
            tradeLinkButton.setAttribute('data-trade-id', linkedObject.data.id);
            tradeLinkButton.setAttribute('data-object-type', linkedObject.type);
        }

    } catch (error) {
        console.error('❌ Error loading linked object details:', error);
    }

    clearExecutionValidationErrors();

    // הפעלת כל השדות בעריכת עסקה
    enableAllFields('edit');

    // חישוב ערכים מחושבים
    calculateEditExecutionValues();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editExecutionModal'));
    modal.show();
}

// פונקציה זו הוסרה - שימוש במערכת הגלובלית showDeleteWarning

// ========================================
// פונקציות ולידציה
// ========================================

/**
 * ולידציה של סמל טיקר
 */
function validateTickerSymbol(input) {
    const symbol = input.value.trim().toUpperCase();
    const errorElement = document.getElementById(input.id + 'Error');

    // בדיקות בסיסיות
    if (!symbol) {
        if (window.showValidationWarning) {
            window.showValidationWarning(input.id, 'סמל טיקר הוא שדה חובה');
        }
        return false;
    }

    if (symbol.length < 1 || symbol.length > 10) {
        if (window.showValidationWarning) {
            window.showValidationWarning(input.id, 'סמל טיקר חייב להיות בין 1 ל-10 תווים');
        }
        return false;
    }

    if (!/^[A-Z0-9.]+$/.test(symbol)) {
        if (window.showValidationWarning) {
            window.showValidationWarning(input.id, 'סמל טיקר יכול להכיל רק אותיות באנגלית, מספרים ונקודות');
        }
        return false;
    }

    // בדיקת ייחודיות
    const currentId = document.getElementById('editTickerId')?.value;
    const existingTicker = tickersData.find(t =>
        t.symbol.toUpperCase() === symbol && t.id != currentId
    );

    if (existingTicker) {
        if (window.showValidationWarning) {
            window.showValidationWarning(input.id, 'סמל טיקר זה כבר קיים במערכת');
        }
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של מזהה טרייד
 */
function validateExecutionTradeId(input) {
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
}

/**
 * ולידציה של כמות
 */
function validateExecutionQuantity(input) {
    const quantity = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!quantity) {
        return false;
    }

    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של מחיר
 */
function validateExecutionPrice(input) {
    const price = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!price) {
        return false;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של עמלה (fee)
 */
function validateExecutionCommission(input) {
    const commission = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (commission) {
        const numCommission = parseFloat(commission);
        if (isNaN(numCommission) || numCommission < 0) {
            if (window.showValidationWarning) {
                window.showValidationWarning(input.id, 'עמלה חייבת להיות מספר חיובי או אפס (שדה fee אופציונלי)');
            }
            return false;
        }
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של מקור (source)
 */
function validateExecutionSource(input) {
    const source = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (source && source.length > 100) {
        if (window.showValidationWarning) {
            window.showValidationWarning(input.id, 'מקור ארוך מדי (מקסימום 100 תווים)');
        }
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של הערות (notes)
 */
function validateExecutionNotes(input) {
    const notes = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (notes && notes.length > 500) {
        if (window.showValidationWarning) {
            window.showValidationWarning(input.id, 'הערות ארוכות מדי (מקסימום 500 תווים לפי VARCHAR(500))');
        }
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של מזהה חיצוני (external_id)
 */
function validateExecutionExternalId(input) {
    const externalId = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (externalId && externalId.length > 100) {
        if (window.showValidationWarning) {
            window.showValidationWarning(input.id, 'מזהה חיצוני ארוך מדי (מקסימום 100 תווים לפי VARCHAR(100))');
        }
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של תאריך (date)
 */
function validateExecutionDate(input) {
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
}

/**
 * ולידציה של סוג עסקה (action)
 */
function validateExecutionType(input) {
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
}

/**
 * הצגת שגיאת שדה
 */
// showFieldError() - זמינה גלובלית מ-ui-utils.js כ-showValidationWarning

/**
 * ניקוי שגיאת שדה
 */
function clearFieldError(input, errorElement) {
    input.classList.remove('is-invalid');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

/**
 * ניקוי כל שגיאות הולידציה
 */
function clearExecutionValidationErrors() {
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
}

/**
 * וולידציה מקיפה של טופס עסקה
 * @param {string} mode - 'add' או 'edit'
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateCompleteExecutionForm(mode) {
    const prefix = mode === 'add' ? 'add' : 'edit';
    let isValid = true;
    const errors = [];

    // וולידציה של מזהה טרייד (trade_id - שדה חובה)
    const tradeIdField = document.getElementById(`${prefix}ExecutionTradeId`);
    if (!validateExecutionTradeId(tradeIdField)) {
        isValid = false;
        errors.push('בחירת טרייד או תכנון היא שדה חובה');
    }

    // וולידציה של סוג עסקה (action - שדה חובה)
    const typeField = document.getElementById(`${prefix}ExecutionType`);
    if (!validateExecutionType(typeField)) {
        isValid = false;
        errors.push('סוג עסקה הוא שדה חובה');
    }

    // וולידציה של כמות (quantity - שדה חובה)
    const quantityField = document.getElementById(`${prefix}ExecutionQuantity`);
    if (!validateExecutionQuantity(quantityField)) {
        isValid = false;
        errors.push('כמות היא שדה חובה');
    } else {
        // בדיקה נוספת - כמות לא יכולה להיות גדולה מדי
        const quantity = parseInt(quantityField.value);
        if (quantity > 1000000) {
            isValid = false;
            errors.push('כמות גבוהה מדי (מקסימום 1,000,000)');
        }
    }

    // וולידציה של מחיר (price - שדה חובה)
    const priceField = document.getElementById(`${prefix}ExecutionPrice`);
    if (!validateExecutionPrice(priceField)) {
        isValid = false;
        errors.push('מחיר הוא שדה חובה');
    } else {
        // בדיקה נוספת - מחיר לא יכול להיות גבוה מדי
        const price = parseFloat(priceField.value);
        if (price > 1000000) {
            isValid = false;
            errors.push('מחיר גבוה מדי (מקסימום 1,000,000)');
        }
    }

    // וולידציה של תאריך (date - שדה חובה לפי האילוצים בבסיס הנתונים)
    const dateField = document.getElementById(`${prefix}ExecutionDate`);
    if (!validateExecutionDate(dateField)) {
        isValid = false;
        errors.push('תאריך עסקה הוא שדה חובה');
    }

    // וולידציה של עמלה (fee - אופציונלי)
    const commissionField = document.getElementById(`${prefix}ExecutionCommission`);
    if (commissionField && commissionField.value) {
        if (!validateExecutionCommission(commissionField)) {
            isValid = false;
            errors.push('עמלה לא תקינה');
        } else {
            // בדיקה נוספת - עמלה לא יכולה להיות גבוהה מדי
            const commission = parseFloat(commissionField.value);
            if (commission > 10000) {
                isValid = false;
                errors.push('עמלה גבוהה מדי (מקסימום 10,000)');
            }
        }
    }

    // וולידציה של הערות (notes - אופציונלי)
    const notesField = document.getElementById(`${prefix}ExecutionNotes`);
    if (notesField && notesField.value) {
        if (!validateExecutionNotes(notesField)) {
            isValid = false;
            errors.push('הערות לא תקינות');
        }
    }

    // וולידציה של מקור (source - אופציונלי)
    const sourceField = document.getElementById(`${prefix}ExecutionSource`);
    if (sourceField && sourceField.value) {
        if (!validateExecutionSource(sourceField)) {
            isValid = false;
            errors.push('מקור לא תקין');
        }
    }

    // וולידציה של מזהה חיצוני (external_id - אופציונלי, VARCHAR(100))
    const externalIdField = document.getElementById(`${prefix}ExecutionExternalId`);
    if (externalIdField && externalIdField.value) {
        if (!validateExecutionExternalId(externalIdField)) {
            isValid = false;
            errors.push('מזהה חיצוני לא תקין');
        }
    }

    // הצגת הודעת שגיאה מפורטת אם יש שגיאות
    if (!isValid && errors.length > 0) {
        const errorMessage = errors.join(', ');
        console.log('🔧 Validation errors:', errors);
        console.log('🔧 window.showErrorNotification exists:', typeof window.showErrorNotification === 'function');
        console.log('🔧 window.showValidationWarning exists:', typeof window.showValidationWarning === 'function');
        
        // שימוש ישיר ב-showErrorNotification עם פרטים מפורטים
        if (window.showErrorNotification) {
            console.log('🔧 Calling showErrorNotification with detailed error message');
            window.showErrorNotification('שגיאות בטופס', `יש לתקן את השגיאות הבאות: ${errorMessage}`);
        } else {
            console.error('❌ showErrorNotification not available');
            console.error(`שגיאות בטופס: ${errorMessage}`);
        }
    }

    return isValid;
}

/**
 * ולידציה של טופס עסקה (פונקציה ישנה - נשמרת לתאימות)
 */
function validateExecutionForm() {
    const tradeId = document.getElementById('addExecutionTradeId').value;
    const type = document.getElementById('addExecutionType').value;
    const quantity = document.getElementById('addExecutionQuantity').value;
    const price = document.getElementById('addExecutionPrice').value;
    const executionDate = document.getElementById('addExecutionDate').value;

    return validateExecutionTradeId(document.getElementById('addExecutionTradeId')) &&
        validateExecutionQuantity(document.getElementById('addExecutionQuantity')) &&
        validateExecutionPrice(document.getElementById('addExecutionPrice')) &&
        type && executionDate;
}

// ========================================
// פונקציות שמירה ועדכון
// ========================================

/**
 * שמירת עסקה חדשה
 */
async function saveExecution() {
  

    // ולידציה
    const tradeIdValue = document.getElementById('addExecutionTradeId').value;
    const type = document.getElementById('addExecutionType').value;
    const quantity = document.getElementById('addExecutionQuantity').value;
    const price = document.getElementById('addExecutionPrice').value;
    const executionDate = document.getElementById('addExecutionDate').value;
    const commission = document.getElementById('addExecutionCommission').value;
    const notes = document.getElementById('addExecutionNotes').value.trim();

    // בדיקת ולידציה מקיפה
    if (!validateCompleteExecutionForm('add')) {
        return; // הפונקציה validateCompleteExecutionForm תציג את ההודעות
    }

    // בדיקת ערך action
    if (!type || (type !== 'buy' && type !== 'sale')) {
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'יש לבחור פעולה תקינה (קניה או מכירה)');
        } else {
            console.error('יש לבחור פעולה תקינה (קניה או מכירה)');
        }
        return;
    }

    // עיבוד ערך trade_id - עכשיו זה מספר ישיר
    let tradeId = null;
    if (tradeIdValue) {
        tradeId = parseInt(tradeIdValue);
        if (isNaN(tradeId) || tradeId < 0) {
                    if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מזהה טרייד לא תקין');
        } else {
            console.error('מזהה טרייד לא תקין');
        }
            return;
        }
    }

    try {
        const executionData = {
            trade_id: tradeId,
            action: type,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            date: executionDate ? new Date(executionDate).toISOString() : null,
            fee: commission ? parseFloat(commission) : null,
            source: 'manual',
            notes: notes || null
        };

        

        const response = await fetch('/api/v1/executions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(executionData)
        });

        if (response.ok) {
            const result = await response.json();
          

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('addExecutionModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            console.log('🔧 Showing success notification for save');
            console.log('🔧 window.showSuccessNotification exists:', typeof window.showSuccessNotification === 'function');
            
            if (typeof window.showSuccessNotification === 'function') {
                console.log('🔧 Calling showSuccessNotification with:', 'הצלחה', 'עסקה חדשה נוספה בהצלחה למערכת');
                window.showSuccessNotification('הצלחה', 'עסקה חדשה נוספה בהצלחה למערכת');
            } else {
                console.error('❌ showSuccessNotification not available');
                console.log('עסקה חדשה נוספה בהצלחה למערכת');
            }

            // רענון הנתונים
            await loadExecutionsData();

        } else {
            const result = await response.json();
            console.error('❌ שגיאה בשמירת עסקה:', result.error);
            
            // טיפול בשגיאות וולידציה מהשרת
            let errorMessage = 'שגיאה בשמירת עסקה';
            
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
                        if (error.includes("Field 'action' has invalid value")) {
                            fieldError = 'סוג עסקה לא תקין - יש לבחור ערך מהרשימה';
                            fieldName = 'addExecutionType';
                        } else if (error.includes("Field 'source' has invalid value")) {
                            fieldError = 'מקור לא תקין - יש לבחור ערך מהרשימה';
                            fieldName = 'addExecutionSource';
                        } else if (error.includes("Field 'quantity' is out of range")) {
                            fieldError = 'כמות חייבת להיות חיובית';
                            fieldName = 'addExecutionQuantity';
                        } else if (error.includes("Field 'price' is out of range")) {
                            fieldError = 'מחיר חייב להיות חיובי';
                            fieldName = 'addExecutionPrice';
                        } else if (error.includes("Field 'date' is out of range")) {
                            fieldError = 'תאריך עסקה חייב להיות אחרי תאריך פתיחת הטרייד';
                            fieldName = 'addExecutionDate';
                        } else if (error.includes("Field 'trade_id' references non-existent record")) {
                            fieldError = 'טרייד לא קיים במערכת';
                            fieldName = 'addExecutionTradeId';
                        }
                        
                        // שימוש במערכת ההתראות המובנת
                        console.log('🔧 Field validation error (add):', { fieldName, fieldError });
                        console.log('🔧 window.showValidationWarning exists (add):', typeof window.showValidationWarning === 'function');
                        
                        if (fieldName && window.showValidationWarning) {
                            console.log('🔧 Calling showValidationWarning (add) with:', fieldName, fieldError);
                            window.showValidationWarning(fieldName, fieldError);
                        } else {
                            console.log('🔧 Using showErrorNotification as fallback (add)');
                            window.showErrorNotification('שגיאת וולידציה', fieldError);
                        }
                    });
                } else {
                    // שגיאה כללית
                    window.showErrorNotification('שגיאה בשמירה', serverMessage);
                }
            } else {
                // הצגת הודעת שגיאה כללית
                window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת עסקה - בדוק את הנתונים שהוזנו');
            }
        }

    } catch (error) {
        console.error('❌ שגיאה בשמירת עסקה:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בשמירת עסקה');
        } else {
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'שגיאה בשמירת עסקה');
            } else {
                console.error('שגיאה בשמירת עסקה');
            }
        }
    }
}

/**
 * עדכון עסקה קיימת
 */
async function updateExecution() {
  

    const id = document.getElementById('editExecutionId').value;
    const tradeIdValue = document.getElementById('editExecutionTradeId').value;
    const type = document.getElementById('editExecutionType').value;
    const quantity = document.getElementById('editExecutionQuantity').value;
    const price = document.getElementById('editExecutionPrice').value;
    const executionDate = document.getElementById('editExecutionDate').value;
    const commission = document.getElementById('editExecutionCommission').value;
    const notes = document.getElementById('editExecutionNotes').value.trim();

    // בדיקת ולידציה
    if (!validateCompleteExecutionForm('edit')) {
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'יש לתקן את השגיאות בטופס');
        } else {
            if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'יש לתקן את השגיאות בטופס');
        } else {
            console.error('יש לתקן את השגיאות בטופס');
        }
        }
        return;
    }

    // בדיקת ערך action
    if (!type || (type !== 'buy' && type !== 'sale')) {
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'יש לבחור פעולה תקינה (קניה או מכירה)');
        } else {
            if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'יש לבחור פעולה תקינה (קניה או מכירה)');
        } else {
            console.error('יש לבחור פעולה תקינה (קניה או מכירה)');
        }
        }
        return;
    }

    // עיבוד ערך trade_id - עכשיו זה מספר ישיר
    let tradeId = null;
    if (tradeIdValue) {
        tradeId = parseInt(tradeIdValue);
        if (isNaN(tradeId) || tradeId < 0) {
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'מזהה טרייד לא תקין');
            } else {
                if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מזהה טרייד לא תקין');
        } else {
            console.error('מזהה טרייד לא תקין');
        }
            }
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
            source: source,
            notes: notes || null
        };

      

        const response = await fetch(`/api/v1/executions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(executionData)
        });

        if (response.ok) {
            const result = await response.json();
          

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editExecutionModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            console.log('🔧 Showing success notification for update');
            console.log('🔧 window.showSuccessNotification exists:', typeof window.showSuccessNotification === 'function');
            
            if (typeof window.showSuccessNotification === 'function') {
                console.log('🔧 Calling showSuccessNotification with:', 'הצלחה', 'עסקה עודכנה בהצלחה במערכת');
                window.showSuccessNotification('הצלחה', 'עסקה עודכנה בהצלחה במערכת');
            } else {
                console.error('❌ showSuccessNotification not available');
                console.log('עסקה עודכנה בהצלחה במערכת');
            }

            // רענון הנתונים
            await loadExecutionsData();

        } else {
            const result = await response.json();
            console.error('❌ שגיאה בעדכון עסקה:', result.error);
            
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
                        if (error.includes("Field 'action' has invalid value")) {
                            fieldError = 'סוג עסקה לא תקין - יש לבחור ערך מהרשימה';
                            fieldName = 'editExecutionType';
                        } else if (error.includes("Field 'source' has invalid value")) {
                            fieldError = 'מקור לא תקין - יש לבחור ערך מהרשימה';
                            fieldName = 'editExecutionSource';
                        } else if (error.includes("Field 'quantity' is out of range")) {
                            fieldError = 'כמות חייבת להיות חיובית';
                            fieldName = 'editExecutionQuantity';
                        } else if (error.includes("Field 'price' is out of range")) {
                            fieldError = 'מחיר חייב להיות חיובי';
                            fieldName = 'editExecutionPrice';
                        } else if (error.includes("Field 'date' is out of range")) {
                            fieldError = 'תאריך עסקה חייב להיות אחרי תאריך פתיחת הטרייד';
                            fieldName = 'editExecutionDate';
                        } else if (error.includes("Field 'trade_id' references non-existent record")) {
                            fieldError = 'טרייד לא קיים במערכת';
                            fieldName = 'editExecutionTradeId';
                        }
                        
                        // שימוש במערכת ההתראות המובנת
                        console.log('🔧 Field validation error (edit):', { fieldName, fieldError });
                        console.log('🔧 window.showValidationWarning exists (edit):', typeof window.showValidationWarning === 'function');
                        
                        if (fieldName && window.showValidationWarning) {
                            console.log('🔧 Calling showValidationWarning (edit) with:', fieldName, fieldError);
                            window.showValidationWarning(fieldName, fieldError);
                        } else {
                            console.log('🔧 Using showErrorNotification as fallback (edit)');
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
        console.error('❌ שגיאה בעדכון עסקה:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בעדכון עסקה');
        } else {
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'שגיאה בעדכון עסקה');
            } else {
                console.error('שגיאה בעדכון עסקה');
            }
        }
    }
}

/**
 * אישור מחיקת עסקה
 */
async function confirmDeleteExecution(id) {
    console.log('🔧 confirmDeleteExecution called with id:', id);
    
    // אם לא קיבלנו ID כפרמטר, ננסה לקבל אותו מהטופס
    if (!id) {
        id = document.getElementById('deleteExecutionId').value;
        console.log('🔧 Got id from form:', id);
    }

    // בדיקת פריטים מקושרים לפני מחיקה
    if (typeof window.checkLinkedItemsBeforeDelete === 'function') {
        console.log('🔧 Checking linked items before delete');
        const hasLinkedItems = await window.checkLinkedItemsBeforeDelete('executions', id);
        if (hasLinkedItems) {
            console.log('🔧 Has linked items, returning');
            return; // הפונקציה הגלובלית תטפל בהצגת המודל
        }
    }

    try {
        console.log('🔧 Making DELETE request to:', `/api/v1/executions/${id}`);
        const response = await fetch(`/api/v1/executions/${id}`, {
            method: 'DELETE'
        });
        console.log('🔧 DELETE response status:', response.status);

        if (response.ok) {
          

            // סגירת המודל - לא נדרש כי אין מודל
            console.log('🔧 Delete successful, no modal to close');

            // הצגת הודעת הצלחה
            console.log('🔧 Showing success notification for delete');
            console.log('🔧 window.showSuccessNotification exists:', typeof window.showSuccessNotification === 'function');
            
            if (typeof window.showSuccessNotification === 'function') {
                console.log('🔧 Calling showSuccessNotification with:', 'הצלחה', 'עסקה נמחקה בהצלחה מהמערכת');
                window.showSuccessNotification('הצלחה', 'עסקה נמחקה בהצלחה מהמערכת');
            } else {
                console.error('❌ showSuccessNotification not available');
                console.log('עסקה נמחקה בהצלחה מהמערכת');
            }

            // רענון הנתונים
            await loadExecutionsData();

        } else {
            const errorResponse = await response.text();
            console.error('❌ שגיאה במחיקת עסקה:', errorResponse);

            try {
                const errorData = JSON.parse(errorResponse);

                // בדיקה אם השגיאה קשורה לפריטים מקושרים
                if (errorData.error && errorData.error.message &&
                    errorData.error.message.includes('linked items')) {

                    // סגירת מודל המחיקה הרגיל - לא נדרש
                    console.log('🔧 Linked items found, no modal to close');

                    // הצגת מודל הפריטים המקושרים
                    await showExecutionLinkedItemsModal(id, errorData);
                    return;
                }

                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה', 'שגיאה במחיקת עסקה: ' + errorData.error.message);
                } else {
                    if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'שגיאה במחיקת עסקה: ' + errorData.error.message);
            } else {
                console.error('שגיאה במחיקת עסקה: ' + errorData.error.message);
            }
                }

            } catch (parseError) {
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה', 'שגיאה במחיקת עסקה: ' + errorResponse);
                } else {
                    if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'שגיאה במחיקת עסקה: ' + errorResponse);
            } else {
                console.error('שגיאה במחיקת עסקה: ' + errorResponse);
            }
                }
            }
        }

    } catch (error) {
        console.error('❌ שגיאה במחיקת עסקה:', error);
        if (typeof window.showErrorNotification === 'function') {
            const errorMessage = error.message || 'שגיאה לא ידועה';
            const errorDetails = error.response ? `סטטוס: ${error.response.status}` : '';
            window.showErrorNotification('שגיאה במחיקת עסקה', `${errorMessage} ${errorDetails}`);
        } else {
            console.error('שגיאה במחיקת עסקה');
        }
    }
}

// ========================================
// פונקציות מודל פריטים מקושרים
// ========================================

/**
 * הצגת מודל פריטים מקושרים
 * שימוש בפונקציה הגלובלית מ-linked-items.js
 */
async function showExecutionLinkedItemsModal(executionId, errorData) {
  

    // מציאת העסקה לפי ID
    const execution = executionsData.find(e => e.id == executionId);
    if (!execution) {
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'עסקה לא נמצאה');
        } else {
            console.error('עסקה לא נמצאה');
        }
        return;
    }

    // טעינת נתונים מקושרים מהשרת
    try {
        const response = await fetch(`http://127.0.0.1:8080/api/v1/executions/${executionId}/linked-items`);
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
                tradeId: execution.trade_id
            };

            // קריאה לפונקציה הגלובלית
            window.showLinkedItemsModal(enhancedData, 'execution', executionId);
        } else {
            console.error('❌ showLinkedItemsModal function not found');
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'פונקציה להצגת פריטים מקושרים לא זמינה');
            } else {
                console.error('פונקציה להצגת פריטים מקושרים לא זמינה');
            }
        }

    } catch (error) {
        console.error('❌ שגיאה בטעינת נתונים מקושרים:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתונים מקושרים');
        } else {
            console.error('שגיאה בטעינת נתונים מקושרים');
        }
    }
}

/**
 * טעינת פרטי הפריטים המקושרים
 */
async function loadLinkedItemsDetails(executionId, errorData = null) {
  
  

    const contentDiv = document.getElementById('linkedItemsContent');
    contentDiv.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><br>טוען פרטים...</div>';

    try {
        // קריאה ל-API לקבלת פרטי הפריטים המקושרים
        const response = await fetch(`/api/v1/executions/${executionId}/linked-items`);

        if (response.ok) {
            const data = await response.json();
          
            displayLinkedItems(data.data);
        } else {
          
            // אם אין API ספציפי, ננסה לטעון מכל ה-APIs
            await loadLinkedItemsFromMultipleSources(executionId);
        }

    } catch (error) {
        console.error('❌ שגיאה בטעינת פריטים מקושרים:', error);
        // אם יש שגיאה, ננסה לטעון מכל ה-APIs
        await loadLinkedItemsFromMultipleSources(executionId);
    }
}

/**
 * טעינת פריטים מקושרים ממקורות מרובים
 */
async function loadLinkedItemsFromMultipleSources(executionId) {
  

    const execution = executionsData.find(e => e.id == executionId);
    if (!execution) return;

    const linkedItems = {
        trades: [],
        trade_plans: [],
        alerts: [],
        notes: []
    };

    try {
        // טעינת טריידים
        try {
            const tradesResponse = await fetch('/api/v1/trades/');
            if (tradesResponse.ok) {
                const tradesData = await tradesResponse.json();
                const trades = tradesData.data || tradesData;
                linkedItems.trades = trades.filter(trade =>
                    trade.id == execution.trade_id
                );
            }
        } catch (e) { console.warn('לא ניתן לטעון טריידים:', e); }

        // טעינת תכנונים
        try {
            const plansResponse = await fetch('/api/v1/trade_plans/');
            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                const plans = plansData.data || plansData;
                linkedItems.trade_plans = plans.filter(plan =>
                    plan.trade_id == execution.trade_id
                );
            }
        } catch (e) { console.warn('לא ניתן לטעון תכנונים:', e); }

        // טעינת התראות
        try {
            const alertsResponse = await fetch('/api/v1/alerts/');
            if (alertsResponse.ok) {
                const alertsData = await alertsResponse.json();
                const alerts = alertsData.data || alertsData;
                linkedItems.alerts = alerts.filter(alert =>
                    alert.related_type_id === 5 && alert.related_id == executionId &&
                    alert.status === 'open'
                );
            }
        } catch (e) { console.warn('לא ניתן לטעון התראות:', e); }

        // טעינת הערות
        try {
            const notesResponse = await fetch('/api/v1/notes/');
            if (notesResponse.ok) {
                const notesData = await notesResponse.json();
                const notes = notesData.data || notesData;
                linkedItems.notes = notes.filter(note =>
                    note.related_type_id === 5 && note.related_id == executionId
                );
            }
        } catch (e) { console.warn('לא ניתן לטעון הערות:', e); }

        displayLinkedItems(linkedItems);

    } catch (error) {
        console.error('❌ שגיאה בטעינת פריטים מקושרים:', error);
        document.getElementById('linkedItemsContent').innerHTML =
            '<div class="alert alert-danger">שגיאה בטעינת פרטי הפריטים המקושרים</div>';
    }
}

/**
 * הצגת הפריטים המקושרים
 */
function displayLinkedItems(linkedItems) {
    console.log('🔄 הצגת פריטים מקושרים:', linkedItems);
    console.log('📊 סוג הנתונים:', typeof linkedItems);
    console.log('📊 מפתחות:', Object.keys(linkedItems || {}));

    const contentDiv = document.getElementById('linkedItemsContent');
    let html = '';

    // טריידים מקושרים
    console.log('🔍 בדיקת טריידים מקושרים:', linkedItems.trades);
    console.log('🔍 האם קיים trades?', !!linkedItems.trades);
    console.log('🔍 אורך trades:', linkedItems.trades ? linkedItems.trades.length : 'undefined');
    if (linkedItems.trades && linkedItems.trades.length > 0) {
        console.log('✅ נמצאו טריידים מקושרים, יוצר HTML');
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
                                <button class="btn btn-sm btn-outline-primary ms-2" onclick="goToTrade(${trade.id})">
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
    console.log('🔍 בדיקת תכנונים מקושרים:', linkedItems.trade_plans);
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
                                            <button class="btn btn-sm btn-outline-primary" onclick="goToPlan(${plan.id})">
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
                                        <td><span class="badge ${window.getAlertStatusClass ? window.getAlertStatusClass(alert.status, alert.is_triggered) : 'bg-danger'}">${window.getAlertStatusDisplay ? window.getAlertStatusDisplay(alert.status, alert.is_triggered) : alert.status}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" onclick="goToAlert(${alert.id})">
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
                                        <td>${note.content ? note.content.substring(0, 50) + '...' : 'ללא תוכן'}</td>
                                        <td>${formatDate(note.created_at)}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" onclick="goToNote(${note.id})">
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

    console.log('🔍 HTML שנוצר:', html);
    if (!html) {
        html = '<div class="alert alert-success">✅ לא נמצאו פריטים מקושרים פתוחים. ניתן למחוק את הטיקר בבטחה.</div>';
    }

    contentDiv.innerHTML = html;
}

/**
 * מעבר לניהול פריטים מקושרים
 */
function goToLinkedItems() {
    // סגירת המודל
    const modal = bootstrap.Modal.getInstance(document.getElementById('linkedItemsModal'));
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
    window.location.href = `/planning#plan-${planId}`;
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
    try {
        console.log('🔄 טעינת נתוני עסקעות...');

        const response = await fetch('/api/v1/executions/?_t=' + Date.now());
        if (response.ok) {
            const data = await response.json();
            executionsData = data.data || data;
            console.log('✅ נטענו', executionsData.length, 'עסקעות');

            // בדיקה אם יש פילטרים פעילים
            if (window.headerSystem && window.headerSystem.currentFilters) {
                const filters = window.headerSystem.currentFilters;
                const hasActiveFilters = (filters.status && filters.status.length > 0) ||
                    (filters.type && filters.type.length > 0) ||
                    (filters.account && filters.account.length > 0) ||
                    (filters.dateRange && filters.dateRange !== '') ||
                    (filters.search && filters.search !== '');

                if (hasActiveFilters) {
                    console.log('🔍 יש פילטרים פעילים, מסנן נתונים מקומית');
                    const filteredData = filterExecutionsLocally(
                        executionsData,
                        filters.status,
                        filters.type,
                        filters.account,
                        filters.dateRange,
                        filters.search
                    );
                    updateExecutionsTableMain(filteredData);
                    return;
                }
            }

            // עדכון הטבלה
            updateExecutionsTableMain(executionsData);

        } else {
            const errorText = await response.text();
            console.error('❌ שגיאה בטעינת עסקעות:', response.status, errorText);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בטעינת נתונים', `סטטוס: ${response.status} - ${errorText}`);
            } else {
                console.error('שגיאה בטעינת נתונים');
            }
        }

    } catch (error) {
        console.error('❌ שגיאה בטעינת עסקעות:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת נתונים', error.message || 'שגיאה לא ידועה');
        } else {
            console.error('שגיאה בטעינת נתונים');
        }
    }
}

/**
 * עדכון טבלת עסקעות
 */
async function updateExecutionsTableMain(executions) {
    const table = document.querySelector('#executionsTable');
    const tbody = document.querySelector('#executionsTable tbody');
    if (!tbody) {
        console.error('❌ executionsTable tbody not found');
        return;
    }

    if (executions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">לא נמצאו עסקעות</td></tr>';
        return;
    }

    // טעינת נתוני טריידים וטיקרים
    let trades = [];
    let tickers = [];

    try {
        const [tradesResponse, tickersResponse] = await Promise.all([
            fetch('/api/v1/trades/').then(r => {
                if (r.ok) {
                    return r.json();
                } else {
                    console.warn('⚠️ Trades API returned error:', r.status);
                    return { data: [] };
                }
            }).catch(() => ({ data: [] })),
            fetch('/api/v1/tickers/').then(r => {
                if (r.ok) {
                    return r.json();
                } else {
                    console.warn('⚠️ Tickers API returned error:', r.status);
                    return { data: [] };
                }
            }).catch(() => ({ data: [] }))
        ]);

        trades = tradesResponse.data || [];
        tickers = tickersResponse.data || [];

        // וידוא שהנתונים הם מערכים
        if (!Array.isArray(trades)) {
            console.warn('⚠️ trades אינו מערך:', trades);
            trades = [];
        }
        if (!Array.isArray(tickers)) {
            console.warn('⚠️ tickers אינו מערך:', tickers);
            tickers = [];
        }

        console.log(`✅ נטענו ${trades.length} טריידים ו-${tickers.length} טיקרים`);
    } catch (error) {
        console.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error);
        trades = [];
        tickers = [];
    }

    tbody.innerHTML = executions.map(execution => {
        // מציאת הטרייד המקושר
        const trade = trades.find(t => t.id === execution.trade_id);
        let symbol = 'לא מוגדר';
        let tradeInfo = '';

        if (trade) {
            // מציאת הטיקר
            const ticker = tickers.find(t => t.id === trade.ticker_id);
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
                (execution.action || execution.type);

        // מציאת שם החשבון מהטרייד
        const accountName = trade ? trade.account_name : 'לא מוגדר';

        return `
            <tr>
                                   <td class="ticker-cell">
                       <div style="display: flex; align-items: center; gap: 8px;">
                           <button class="btn btn-sm btn-outline-success" onclick="goToTickerPage('${symbol}')" title="עבור לדף טיקר - בפיתוח" style="background-color: white; border-color: #28a745; color: #28a745;">
                               🔗
                           </button>
                           <strong>${symbol}</strong>
                       </div>
                   </td>
                <td><small style="color: #666;">${tradeInfo}</small></td>
                <td class="type-cell" data-type="${typeForFilter}">
                    <span class="${(execution.action || execution.type) === 'buy' ? 'profit-positive' : 'profit-negative'}">
                        ${(execution.action || execution.type) === 'buy' ? 'קניה' : 'מכירה'}
                    </span>
                </td>
                <td data-account="${accountName}">${accountName}</td>
                <td>${execution.quantity}</td>
                <td>$${execution.price}</td>
                <td>${execution.fee ? '$' + execution.fee : '-'}</td>
                <td class="pl-cell">$0</td>
                <td>${execution.notes || '-'}</td>
                <td data-date="${execution.created_at}">${execution.created_at ? new Date(execution.created_at).toLocaleDateString('he-IL') : '-'}</td>
                <td data-date="${execution.date || execution.execution_date}">${(execution.date || execution.execution_date) ? new Date(execution.date || execution.execution_date).toLocaleDateString('he-IL') : '-'}</td>
                <td style="text-align: left; direction: ltr;">${execution.source || '-'}</td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-info" onclick="showLinkedItemsWarning('execution', ${execution.id})" title="פריטים מקושרים">🔗</button>
                    <button class="btn btn-sm btn-secondary" onclick="editExecution(${execution.id})" title="ערוך">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteExecution(${execution.id})" title="מחק">🗑️</button>
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
    
    console.log('✅ Table update completed successfully');
    console.log('🔄 === END UPDATE EXECUTIONS TABLE ===');
}

// פונקציה formatDate מוגדרת בקובץ main.js

// פונקציה לבדיקה אם תאריך נמצא בטווח
function isDateInRange(dateString, dateRange) {
    console.log('🔍 isDateInRange called with:', { dateString, dateRange });
    
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
    
    console.log('🔍 Parsed date:', date);
    console.log('🔍 Today:', today);
    
    switch (dateRange) {
        case 'היום':
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            return date >= startOfDay && date <= today;
            
        case 'אתמול':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const startOfYesterday = new Date(yesterday);
            startOfYesterday.setHours(0, 0, 0, 0);
            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setHours(23, 59, 59, 999);
            return date >= startOfYesterday && date <= endOfYesterday;
            
        case 'שבוע':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo && date <= today;
            
        case 'השבוע':
            const startOfWeek = new Date(today);
            const dayOfWeek = startOfWeek.getDay();
            startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
            startOfWeek.setHours(0, 0, 0, 0);
            return date >= startOfWeek && date <= today;
            
        case 'MTD':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return date >= startOfMonth && date <= today;
            
        case 'YTD':
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            return date >= startOfYear && date <= today;
            
        case 'שנה':
            const yearAgo = new Date(today);
            yearAgo.setDate(yearAgo.getDate() - 365);
            return date >= yearAgo && date <= today;
            
        default:
            return true;
    }
}

// הגדרת הפונקציה כגלובלית
window.isDateInRange = isDateInRange;

// פונקציית פילטור מקומי לעסקאות
function filterExecutionsLocally(executions, selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm) {
    console.log('🔍 filterExecutionsLocally called with:', { selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm });
    
    if (!executions || !Array.isArray(executions)) {
        console.warn('⚠️ No executions data to filter');
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
        console.log('🔍 Applying date filter:', dateRange);
        filtered = filtered.filter(execution => {
            const executionDate = execution.created_at; // תאריך יצירה בלבד
            console.log('🔍 Checking execution created_at:', executionDate, 'for execution ID:', execution.id);
            
            if (!executionDate) {
                console.log('🔍 No created_at found, including in results');
                return true;
            }
            
            // חילוץ התאריך בלבד (ללא שעה)
            let dateOnly = executionDate;
            if (executionDate.includes(' ')) {
                dateOnly = executionDate.split(' ')[0];
            }
            
            const isInRange = isDateInRange(dateOnly, dateRange);
            console.log('🔍 Created date', dateOnly, 'in range', dateRange, ':', isInRange);
            return isInRange;
        });
        console.log('🔍 After date filter:', filtered.length, 'executions remaining');
    }
    
    // פילטר לפי חיפוש חופשי
    if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(execution => {
            return (
                (execution.symbol && execution.symbol.toLowerCase().includes(searchLower)) ||
                (execution.account_name && execution.account_name.toLowerCase().includes(searchLower)) ||
                (execution.notes && execution.notes.toLowerCase().includes(searchLower)) ||
                (execution.execution_date && execution.execution_date.toLowerCase().includes(searchLower))
            );
        });
    }
    
    console.log(`✅ Filtered ${executions.length} executions to ${filtered.length}`);
    return filtered;
}

// הגדרת הפונקציה כגלובלית
window.filterExecutionsLocally = filterExecutionsLocally;

// הגדרת הפונקציות כגלובליות
window.openExecutionDetails = openExecutionDetails;
window.editExecution = editExecution;
window.deleteExecution = deleteExecution;
window.toggleExecutionsSection = toggleExecutionsSection;
window.restoreExecutionsSectionState = restoreExecutionsSectionState;

// פונקציה לסגירה/פתיחה של top-section
window.toggleTopSection = function() {
    if (typeof window.toggleTopSectionGlobal === 'function') {
        window.toggleTopSectionGlobal();
    } else {
        console.error('❌ toggleTopSectionGlobal function not found in main.js');
    }
};

// פונקציה לאיפוס פילטרים וטעינה מחדש
// resetAllFiltersAndReloadData() - לא בשימוש, הוסרה

// פונקציות מודלים
window.showAddExecutionModal = showAddExecutionModal;
window.showEditExecutionModal = showEditExecutionModal;
// window.showDeleteExecutionModal = showDeleteExecutionModal; // הוסר - שימוש במערכת הגלובלית
window.saveExecution = saveExecution;
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
function sortTable(columnIndex) {
    console.log(`🔄 sortTable נקראה עבור עמודה ${columnIndex}`);

    if (typeof window.sortTable === 'function') {
        window.sortTable(
            'executions',
            columnIndex,
            window.executionsData || [],
            updateExecutionsTableMain
        );
    } else {
        console.error('❌ sortTable function not found in main.js');
    }
}

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
function restoreSortState() {
    console.log('🔄 Restoring sort state for executions table');

    if (typeof window.restoreAnyTableSort === 'function') {
        window.restoreAnyTableSort('executions', window.executionsData || [], updateExecutionsTableMain);
    } else {
        console.error('❌ restoreAnyTableSort function not found in main.js');
    }
}

// הגדרת הפונקציה כגלובלית
window.sortTable = sortTable;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
    // הגדרת מודלים שלא נסגרים בלחיצה על הרקע
    setupModalConfigurations();

    // שחזור מצב הסגירה
    restoreExecutionsSectionState();

    // טעינת נתונים
    loadExecutionsData();
    
    // הגדרת פונקציות פילטר
    setupExecutionsFilterFunctions();

    // שחזור מצב סידור
    restoreSortState();
});

/**
 * הגדרת תצורות מודלים
 */
function setupModalConfigurations() {
    // הגדרת מודלים שלא נסגרים בלחיצה על הרקע
    const modals = [
        'addExecutionModal',
        'editExecutionModal',
        'deleteExecutionModal',
        'linkedItemsModal'
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
    console.log('🔄 Loading tickers with open or closed trades and plans...');

    try {
        // שימוש בפונקציה החדשה - הצג טיקרים עם טריידים ותכנונים בסטטוס פתוח או סגור
        console.log('🔍 Loading tickers with open or closed trades and plans...');
        const relevantTickers = await window.tickerService.getTickersWithOpenOrClosedTradesAndPlans({
            useCache: true
        });

        console.log('📊 Relevant tickers found:', relevantTickers.length);
        console.log('📊 Relevant tickers:', relevantTickers.map(t => t.symbol));

        // אם אין טיקרים רלוונטיים, הצג את כל הטיקרים
        const tickersToShow = relevantTickers.length > 0 ? relevantTickers : await window.tickerService.getTickers();
        console.log('📊 Showing', tickersToShow.length, 'tickers in dropdown');

        // עדכון שדות ה-select
        window.tickerService.updateTickerSelect('addExecutionTicker', tickersToShow);
        window.tickerService.updateTickerSelect('editExecutionTicker', tickersToShow);

    } catch (error) {
        console.error('❌ Error loading tickers with open or closed trades and plans:', error);
        // Fallback - טעינת כל הטיקרים
        try {
            const allTickers = await window.tickerService.getTickers();
            window.tickerService.updateTickerSelect('addExecutionTicker', allTickers);
            window.tickerService.updateTickerSelect('editExecutionTicker', allTickers);
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
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
        'Notes'
    ];

    fields.forEach(field => {
        const fieldId = mode === 'add' ? `addExecution${field}` : `editExecution${field}`;
        const element = document.getElementById(fieldId);
        if (element) {
            element.disabled = false;
        }
    });

    console.log(`✅ Enabled all fields for ${mode} execution form`);
}

/**
 * טעינת טריידים ותכנונים לטיקר שנבחר
 * @param {string} mode - 'add' או 'edit'
 */
async function loadActiveTradesForTicker(mode = 'add') {
    console.log('🔄 Loading trades and plans for ticker, mode:', mode);

    const tickerId = mode === 'add'
        ? document.getElementById('addExecutionTicker').value
        : document.getElementById('editExecutionTicker').value;

    if (!tickerId) {
        console.log('❌ No ticker selected');
        return;
    }

    // בדיקת הצ'קבוקס
    const showClosedTrades = mode === 'add'
        ? document.getElementById('addExecutionShowClosedTrades')?.checked || false
        : document.getElementById('editExecutionShowClosedTrades')?.checked || false;

    console.log('🔍 Show closed trades:', showClosedTrades);

    try {
        // טעינת טריידים
        const tradesResponse = await fetch('/api/v1/trades/');
        const tradesData = await tradesResponse.json();
        const trades = tradesData.data || tradesData || [];

        // טעינת תכנונים
        let plans = [];
        try {
            const plansResponse = await fetch('/api/v1/trade_plans/');
            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                plans = plansData.data || plansData || [];
            }
        } catch (error) {
            console.warn('⚠️ לא ניתן לטעון תכנונים:', error);
        }

        // סינון טריידים ותכנונים לטיקר שנבחר
        const filteredTrades = trades.filter(trade => trade.ticker_id == tickerId);
        const filteredPlans = plans.filter(plan => plan.ticker_id == tickerId);

        console.log('✅ Found', filteredTrades.length, 'trades for ticker', tickerId);
        console.log('✅ Found', filteredPlans.length, 'plans for ticker', tickerId);

        // עדכון שדה הטרייד/תכנון
        const tradeSelect = mode === 'add'
            ? document.getElementById('addExecutionTradeId')
            : document.getElementById('editExecutionTradeId');

        if (tradeSelect) {
            tradeSelect.innerHTML = '<option value="">בחר טרייד או תכנון...</option>';

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
                    } catch (e) {
                        console.warn('⚠️ לא ניתן לעבד תאריך יצירה:', trade.created_at);
                    }
                }

                option.textContent = `טרייד: ${trade.side} ${trade.investment_type} - ${creationDate} (${statusText})`;
                tradeSelect.appendChild(option);
            });

            // הוספת תכנונים
            filteredPlans.forEach(plan => {
                const option = document.createElement('option');
                option.value = plan.id; // מספר ישיר
                const statusText = plan.status === 'open' ? 'פתוח' :
                    plan.status === 'closed' ? 'סגור' :
                        plan.status === 'cancelled' ? 'בוטל' : plan.status;

                // עיבוד תאריך היצירה
                let creationDate = 'תאריך לא ידוע';
                if (plan.created_at) {
                    try {
                        const date = new Date(plan.created_at);
                        creationDate = date.toLocaleDateString('he-IL');
                    } catch (e) {
                        console.warn('⚠️ לא ניתן לעבד תאריך יצירה:', plan.created_at);
                    }
                }

                option.textContent = `תכנון: ${plan.side} ${plan.investment_type} - ${creationDate} (${statusText})`;
                tradeSelect.appendChild(option);
            });

            // הצגת כפתור קישור לטרייד/תכנון
            const tradeLinkButton = mode === 'add'
                ? document.getElementById('addExecutionTradeLink')
                : document.getElementById('editExecutionTradeLink');
            if (tradeLinkButton) {
                tradeLinkButton.style.display = 'block';
            }

            // הפעלת שדה בחירת טרייד/תכנון
            tradeSelect.disabled = false;
        }

    } catch (error) {
        console.error('❌ Error loading trades and plans for ticker:', error);
    }
}

/**
 * טעינת טיקרים עם טריידים סגורים
 */
async function loadTickersWithClosedTrades() {
    console.log('🔄 Loading tickers with closed trades...');

    try {
        // טעינת טיקרים
        const tickersResponse = await fetch('/api/v1/tickers/');
        const tickersData = await tickersResponse.json();
        const tickers = tickersData.data || tickersData || [];

        // טעינת טריידים
        const tradesResponse = await fetch('/api/v1/trades/');
        const tradesData = await tradesResponse.json();
        const trades = tradesData.data || tradesData || [];

        // סינון טיקרים עם טריידים פעילים או סגורים
        const allTickers = tickers.filter(ticker => {
            return trades.some(trade =>
                trade.ticker_id === ticker.id &&
                (trade.status === 'active' || trade.status === 'closed')
            );
        });
        console.log('✅ Found', allTickers.length, 'tickers with active or closed trades');

        return allTickers;
    } catch (error) {
        console.error('❌ Error loading tickers with closed trades:', error);
        return [];
    }
}

/**
 * עדכון טריידים כאשר הצ'קבוקס משתנה
 * @param {string} mode - 'add' או 'edit'
 */
async function updateTradesOnCheckboxChange(mode = 'add') {
    console.log('🔄 Updating trades due to checkbox change, mode:', mode);

    // הצגת הודעת "בפיתוח"
    if (typeof window.showInfoNotification === 'function') {
                    window.showInfoNotification('מידע', 'פיצ\'ר "הצג טריידים סגורים" - בפיתוח');
    } else {
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('מידע', 'פיצ\'ר "הצג טריידים סגורים" - בפיתוח');
        } else {
            console.log('פיצ\'ר "הצג טריידים סגורים" - בפיתוח');
        }
    }

    try {
        // בדיקת הצ'קבוקס
        const showClosedTrades = mode === 'add'
            ? document.getElementById('addExecutionShowClosedTrades')?.checked || false
            : document.getElementById('editExecutionShowClosedTrades')?.checked || false;

        console.log('🔍 Show closed trades:', showClosedTrades);

        let tickers;
        if (showClosedTrades) {
            tickers = await loadTickersWithClosedTrades();
        } else {
            // טעינת טיקרים עם טריידים פעילים בלבד
            const tickersResponse = await fetch('/api/v1/tickers/');
            const tickersData = await tickersResponse.json();
            const allTickers = tickersData.data || tickersData || [];

            const tradesResponse = await fetch('/api/v1/trades/');
            const tradesData = await tradesResponse.json();
            const trades = tradesData.data || tradesData || [];

            tickers = allTickers.filter(ticker => {
                return trades.some(trade =>
                    trade.ticker_id === ticker.id &&
                    trade.status === 'active'
                );
            });
        }

        // עדכון שדה הטיקר
        const tickerSelect = mode === 'add'
            ? document.getElementById('addExecutionTicker')
            : document.getElementById('editExecutionTicker');

        if (tickerSelect) {
            tickerSelect.innerHTML = '<option value="">בחר טיקר...</option>';
            tickers.forEach(ticker => {
                const option = document.createElement('option');
                option.value = ticker.id;
                option.textContent = `${ticker.symbol} - ${ticker.name}`;
                tickerSelect.appendChild(option);
            });
            console.log('✅ Updated ticker select with', tickers.length, 'options');
        }

        // אם יש טיקר נבחר, עדכן את הטריידים
        const tickerId = tickerSelect?.value;
        if (tickerId) {
            await loadActiveTradesForTicker(mode);
        }

    } catch (error) {
        console.error('❌ Error updating trades on checkbox change:', error);
    }
}

/**
 * מעבר לדף טיקר (בפיתוח)
 * @param {string} symbol - סמל הטיקר
 */
function goToTickerPage(symbol) {
    console.log('🔄 מעבר לדף טיקר:', symbol);
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'מעבר לדף טיקר - בפיתוח');
    } else {
        console.log('מעבר לדף טיקר - בפיתוח');
    }
    // TODO: ניתוב לדף טיקר כשהפיצ'ר יהיה מוכן
}

/**
 * קבלת טיקרים מהשרת
 * @returns {Promise<Array>} מערך של טיקרים
 */
async function getTickers() {
    try {
        const response = await fetch('/api/v1/tickers/');
        if (response.ok) {
            const data = await response.json();
            const tickers = data.data || data || [];
            console.log('✅ Retrieved', tickers.length, 'tickers from server');
            return tickers;
        } else {
            console.error('❌ Failed to fetch tickers:', response.status);
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching tickers:', error);
        return [];
    }
}

/**
 * הצגת עזרה לבחירת טיקר
 */
function showTickerHelp() {
    console.log('🔄 הצגת עזרה לבחירת טיקר');
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'בדוק אם יש לך תכנון או טרייד לטיקר שאתה מחפש. אם עדיין אין - הוסף טיקר');
    } else {
        console.log('בדוק אם יש לך תכנון או טרייד לטיקר שאתה מחפש. אם עדיין אין - הוסף טיקר');
    }
}

/**
 * הוספת טיקר חדש
 */
function addNewTicker() {
    console.log('🔄 הוספת טיקר חדש');
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'הוספת טיקר - בפיתוח');
    } else {
        console.log('הוספת טיקר - בפיתוח');
    }
    // TODO: פתיחת מודל הוספת טיקר
}

/**
 * הוספת תכנון חדש
 */
function addNewPlan() {
    console.log('🔄 הוספת תכנון חדש');
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'הוספת תכנון - בפיתוח');
    } else {
        console.log('הוספת תכנון - בפיתוח');
    }
    // TODO: פתיחת מודל הוספת תכנון
}

/**
 * הוספת טרייד חדש
 */
function addNewTrade() {
    console.log('🔄 הוספת טרייד חדש');
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'הוספת טרייד - בפיתוח');
    } else {
        console.log('הוספת טרייד - בפיתוח');
    }
    // TODO: פתיחת מודל הוספת טרייד
}

/**
 * עדכון סיכום נתונים לעסקעות
 * @param {Array} executions - מערך העסקעות
 */
function updateExecutionsSummary(executions) {
    console.log('🔄 עדכון סיכום נתונים לעסקעות');

    if (!executions || executions.length === 0) {
        // איפוס ערכים
        document.getElementById('totalExecutions').textContent = '0';
        document.getElementById('totalBuyExecutions').textContent = '0';
        document.getElementById('totalSellExecutions').textContent = '0';
        document.getElementById('totalBuyAmount').textContent = '$0';
        document.getElementById('totalSellAmount').textContent = '$0';
        document.getElementById('balanceAmount').textContent = '$0';
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
        return sum + (quantity * price);
    }, 0);

    const totalSellAmount = sellExecutions.reduce((sum, exec) => {
        const quantity = parseInt(exec.quantity) || 0;
        const price = parseFloat(exec.price) || 0;
        return sum + (quantity * price);
    }, 0);

    // חישוב מאזן (מכירות - קניות)
    const balance = totalSellAmount - totalBuyAmount;

    // עדכון ה-DOM עם פורמט מספרים
    document.getElementById('totalExecutions').textContent = window.formatNumberWithCommas ? window.formatNumberWithCommas(totalExecutions) : totalExecutions.toLocaleString('he-IL');
    document.getElementById('totalBuyExecutions').textContent = window.formatNumberWithCommas ? window.formatNumberWithCommas(totalBuyExecutions) : totalBuyExecutions.toLocaleString('he-IL');
    document.getElementById('totalSellExecutions').textContent = window.formatNumberWithCommas ? window.formatNumberWithCommas(totalSellExecutions) : totalSellExecutions.toLocaleString('he-IL');
    document.getElementById('totalBuyAmount').textContent = window.formatCurrencyWithCommas ? window.formatCurrencyWithCommas(totalBuyAmount) : `$${totalBuyAmount.toFixed(2)}`;
    document.getElementById('totalSellAmount').textContent = window.formatCurrencyWithCommas ? window.formatCurrencyWithCommas(totalSellAmount) : `$${totalSellAmount.toFixed(2)}`;

    // שימוש בפונקציה הכללית לצביעה
    const balanceElement = document.getElementById('balanceAmount');

    // צביעה ידנית
    balanceElement.textContent = `$${balance.toFixed(2)}`;
    if (balance > 0) {
        balanceElement.style.color = '#28a745'; // ירוק
    } else if (balance < 0) {
        balanceElement.style.color = '#dc3545'; // אדום
    } else {
        balanceElement.style.color = '#6c757d'; // אפור
    }

    console.log('✅ סיכום נתונים עודכן:', {
        totalExecutions,
        totalBuyExecutions,
        totalSellExecutions,
        totalBuyAmount: totalBuyAmount.toFixed(2),
        totalSellAmount: totalSellAmount.toFixed(2),
        balance: balance.toFixed(2)
    });
}

// הגדרת הפונקציות כגלובליות
window.loadTickersWithOpenOrClosedTradesAndPlans = loadTickersWithOpenOrClosedTradesAndPlans;
// window.loadTickersWithClosedTrades = loadTickersWithClosedTrades; // פונקציה לא קיימת
// window.loadActiveTradesForTicker = loadActiveTradesForTicker; // פונקציה לא קיימת
window.enableAllFields = enableAllFields;
// window.toggleExternalIdField = toggleExternalIdField; // פונקציה לא קיימת
window.resetAddExecutionForm = resetAddExecutionForm;
window.resetEditExecutionForm = resetEditExecutionForm;
// window.updateTradesOnCheckboxChange = updateTradesOnCheckboxChange; // פונקציה לא קיימת
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
    const quantity = parseFloat(document.getElementById('addExecutionQuantity').value) || 0;
    const price = parseFloat(document.getElementById('addExecutionPrice').value) || 0;
    const commission = parseFloat(document.getElementById('addExecutionCommission').value) || 0;

    const total = (quantity * price) + commission;

    document.getElementById('addExecutionTotal').textContent = `$${total.toFixed(2)}`;
}

/**
 * חישוב ערכים מחושבים לטופס עריכה
 */
function calculateEditExecutionValues() {
    const quantity = parseFloat(document.getElementById('editExecutionQuantity').value) || 0;
    const price = parseFloat(document.getElementById('editExecutionPrice').value) || 0;
    const commission = parseFloat(document.getElementById('editExecutionCommission').value) || 0;

    const total = (quantity * price) + commission;

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
        console.log('🔄 Going to trade:', tradeId);
        // סגירת המודל
        const modalId = mode === 'add' ? 'addExecutionModal' : 'editExecutionModal';
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modal) {
            modal.hide();
        }

        // מעבר לדף הטריידים
        window.location.href = `/trades?highlight=${tradeId}`;
    } else {
        console.error('❌ No trade ID found');
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
function loadTradeExecutions(tradeId) {
    console.log('🔄 טעינת עסקאות לטרייד:', tradeId);

    try {
        // כאן תהיה קריאה לשרת לטעינת העסקאות
        // כרגע נציג נתוני דוגמה
        const executionsData = [
            {
                id: 1,
                date: '2024-01-15 10:30',
                type: 'buy',
                quantity: 50,
                price: 44.50,
                commission: 1.25,
                total: 2226.25,
                status: 'completed'
            },
            {
                id: 2,
                date: '2024-01-16 14:15',
                type: 'buy',
                quantity: 50,
                price: 46.00,
                commission: 1.25,
                total: 2301.25,
                status: 'completed'
            },
            {
                id: 3,
                date: '2024-01-20 11:45',
                type: 'sell',
                quantity: 100,
                price: 47.50,
                commission: 1.25,
                total: 4748.75,
                status: 'completed'
            }
        ];

        // לא צריך לעדכן טבלה בדף executions (זו פונקציה למודל עריכת טרייד)
        console.log('ℹ️ loadTradeExecutions called on executions page - no action needed');
        console.log('✅ loadTradeExecutions completed successfully');
    } catch (error) {
        console.error('❌ Error in loadTradeExecutions:', error);
    }
}

/**
 * עדכון טבלת העסקאות במודל עריכת טרייד
 * @param {Array} executions - מערך העסקאות
 */
function updateExecutionsTableForTradeModal(executions) {
    console.log('🔄 updateExecutionsTableForTradeModal called with:', executions);

    // בדיקה אם אנחנו בדף trades או בדף executions
    const currentPath = window.location.pathname;
    const isTradesPage = currentPath === '/trades' || currentPath.includes('trades');

    if (isTradesPage) {
        // בדף trades - עדכון טבלת העסקאות במודל העריכה
        const tableBody = document.getElementById('editTradeExecutionsTable');
        if (!tableBody) {
            console.warn('⚠️ editTradeExecutionsTable element not found on trades page');
            return;
        }

        tableBody.innerHTML = '';

        executions.forEach(execution => {
            const row = document.createElement('tr');

            const typeBadge = execution.type === 'buy'
                ? '<span class="badge bg-success">קניה</span>'
                : '<span class="badge bg-danger">מכירה</span>';

            const statusBadge = execution.status === 'completed'
                ? '<span class="badge bg-success">הושלם</span>'
                : '<span class="badge bg-warning">ממתין</span>';

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

        console.log('✅ updateExecutionsTable completed for trades page');
    } else {
        // בדף executions - לא צריך לעדכן טבלה זו (זו פונקציה למודל עריכת טרייד)
        console.log('ℹ️ updateExecutionsTableForTradeModal called on executions page - no action needed');
    }
}

/**
 * הוספת קניה/מכירה במודל עריכת טרייד
 */
function addEditBuySell() {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'פונקציונליות הוספת קניה/מכירה נמצאת בפיתוח');
    } else {
        console.log('פונקציונליות הוספת קניה/מכירה נמצאת בפיתוח');
    }
}

/**
 * שיוך עסקה קיימת לטרייד
 */
function linkExistingExecution() {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'פונקציונליות שיוך עסקה קיימת נמצאת בפיתוח');
    } else {
        console.log('פונקציונליות שיוך עסקה קיימת נמצאת בפיתוח');
    }
}

/**
 * ביטול שיוך עסקה מטרייד
 */
function unlinkExecution() {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'פונקציונליות ביטול שיוך עסקה נמצאת בפיתוח');
    } else {
        console.log('פונקציונליות ביטול שיוך עסקה נמצאת בפיתוח');
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
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔧 DOM Content Loaded - checking notification functions');
    console.log('🔧 window.showSuccessNotification:', typeof window.showSuccessNotification);
    console.log('🔧 window.showErrorNotification:', typeof window.showErrorNotification);
    console.log('🔧 window.showInfoNotification:', typeof window.showInfoNotification);

    // שחזור מצב הסגירה
    if (typeof window.restoreAllSectionStates === 'function') {
        window.restoreAllSectionStates();
    }

    // אתחול וולידציה עם כללים מותאמים לביצועים
    if (window.initializeValidation) {
        // כללי וולידציה מותאמים לטופס הוספת ביצוע
        const addExecutionValidationRules = {
            trade_id: {
                required: true,
                message: 'יש לבחור טרייד'
            },
            action: {
                required: true,
                enum: ['buy', 'sell'],
                message: 'יש לבחור פעולה תקינה'
            },
            quantity: {
                required: true,
                min: 0.01,
                message: 'יש להזין כמות חיובית'
            },
            price: {
                required: true,
                min: 0.01,
                message: 'יש להזין מחיר חיובי'
            }
        };
        
        // כללי וולידציה מותאמים לטופס עריכת ביצוע
        const editExecutionValidationRules = {
            trade_id: {
                required: true,
                message: 'יש לבחור טרייד'
            },
            action: {
                required: true,
                enum: ['buy', 'sell'],
                message: 'יש לבחור פעולה תקינה'
            },
            quantity: {
                required: true,
                min: 0.01,
                message: 'יש להזין כמות חיובית'
            },
            price: {
                required: true,
                min: 0.01,
                message: 'יש להזין מחיר חיובי'
            }
        };
        
        window.initializeValidation('addExecutionForm', addExecutionValidationRules);
        window.initializeValidation('editExecutionForm', editExecutionValidationRules);
    }

    console.log('✅ Executions page initialized successfully');
});

// בדיקה שהפונקציות נטענו בהצלחה
console.log('✅ Execution functions loaded:', {
    loadTradeExecutions: typeof loadTradeExecutions,
    updateExecutionsTableMain: typeof updateExecutionsTableMain,
    updateExecutionsTableForTradeModal: typeof updateExecutionsTableForTradeModal,
    addEditBuySell: typeof addEditBuySell,
    linkExistingExecution: typeof linkExistingExecution,
    unlinkExecution: typeof unlinkExecution
});

// ===== מערכת פילטרים לעמוד הביצועים =====

// הגדרת פונקציות פילטר
function setupExecutionsFilterFunctions() {
  console.log('🔄 Setting up executions filter functions...');
  
  // שימוש במערכת הפילטרים הגלובלית
  if (typeof window.applyTableFilter === 'function') {
    window.applyTableFilter('executions', function(filteredData) {
      updateExecutionsTableMain(filteredData);
      updateExecutionsSummary(filteredData);
    });
  }
  
  // פונקציה לפילטר חשבון
  window.filterExecutionsByAccount = function(accountNames) {
    console.log('🔄 Filtering executions by account names:', accountNames);
    
    const namesArray = Array.isArray(accountNames) ? accountNames : [accountNames];
    
    // בדיקה אם זה "הכול" או רשימה ריקה
    if (namesArray.length === 0 || namesArray.includes('all') || namesArray.includes('הכול')) {
      filteredExecutions = [...originalExecutions];
      console.log('🔄 Showing all executions');
      updateExecutionsTableMain(filteredExecutions);
      updateExecutionsSummary(filteredExecutions);
      console.log('✅ Filtered to', filteredExecutions.length, 'executions');
      return;
    }
    
    console.log('🔄 Looking for executions with account names:', namesArray);
    
    // אם יש לנו כבר נתוני טריידים, השתמש בהם
    if (tradesData.length > 0) {
      applyAccountFilterWithTradesData(namesArray);
    } else {
      // טעינת נתוני טריידים כדי לקבל את שמות החשבונות
      fetch('/api/v1/trades/')
        .then(response => response.json())
        .then(data => {
          tradesData = data.data || [];
          applyAccountFilterWithTradesData(namesArray);
        })
        .catch(error => {
          console.error('❌ Error loading trades for account filter:', error);
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
    
    console.log('🔄 Trades map:', tradesMap);
    console.log('🔄 Looking for accounts:', namesArray);
    console.log('🔄 Original executions count:', originalExecutions.length);
    
    filteredExecutions = originalExecutions.filter(execution => {
      const tradeAccountName = tradesMap[execution.trade_id];
      const isIncluded = namesArray.includes(tradeAccountName);
      console.log('🔄 Execution ID:', execution.id, 'trade_id:', execution.trade_id, 'Account name:', tradeAccountName, 'Looking for:', namesArray, 'Included:', isIncluded);
      return isIncluded;
    });
    
    console.log('🔄 Filtered executions count:', filteredExecutions.length);
    updateExecutionsTableMain(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    console.log('✅ Filtered to', filteredExecutions.length, 'executions');
  }
  
  // פונקציה לחיפוש חופשי
  window.searchExecutions = function(searchTerm) {
    console.log('🔄 Searching executions:', searchTerm);
    
    if (!searchTerm || searchTerm.trim() === '') {
      filteredExecutions = [...originalExecutions];
    } else {
      const term = searchTerm.toLowerCase();
      filteredExecutions = originalExecutions.filter(execution => 
        (execution.symbol && execution.symbol.toLowerCase().includes(term)) ||
        (execution.trade_name && execution.trade_name.toLowerCase().includes(term)) ||
        (execution.action && execution.action.toLowerCase().includes(term)) ||
        (execution.quantity && execution.quantity.toString().includes(term)) ||
        (execution.price && execution.price.toString().includes(term)) ||
        (execution.commission && execution.commission.toString().includes(term)) ||
        (execution.notes && execution.notes.toLowerCase().includes(term)) ||
        (execution.created_at && execution.created_at.toLowerCase().includes(term)) ||
        (execution.execution_date && execution.execution_date.toLowerCase().includes(term))
      );
    }
    
    updateExecutionsTableMain(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    console.log('✅ Search results:', filteredExecutions.length, 'executions');
  };
  
  // פונקציה לאיפוס פילטרים
  window.resetExecutionsFilters = function() {
    console.log('🔄 Resetting executions filters');
    filteredExecutions = [...originalExecutions];
    updateExecutionsTableMain(filteredExecutions);
    updateExecutionsSummary(filteredExecutions);
    console.log('✅ Filters reset, showing all', originalExecutions.length, 'executions');
  };
  
  console.log('✅ Executions filter functions setup complete');
}

// פונקציה לעדכון הנתונים הגלובליים
function updateExecutionsGlobalData(executions) {
  originalExecutions = executions || [];
  allExecutions = [...originalExecutions];
  filteredExecutions = [...allExecutions];
  console.log('✅ Executions global data updated:', originalExecutions.length, 'executions');
}

// עדכון הפונקציה הקיימת loadExecutionsData
const originalLoadExecutionsData = window.loadExecutionsData;
window.loadExecutionsData = async function() {
  await originalLoadExecutionsData();
  
  // עדכון הנתונים הגלובליים לאחר טעינה
  if (executionsData && executionsData.length > 0) {
    updateExecutionsGlobalData(executionsData);
    
    // טעינת נתוני טריידים לטובת פילטר החשבונות
    try {
      const response = await fetch('/api/v1/trades/');
      const data = await response.json();
      tradesData = data.data || [];
      console.log('✅ Loaded trades data for account filter:', tradesData.length, 'trades');
    } catch (error) {
      console.error('❌ Error loading trades data:', error);
      tradesData = [];
    }
    
    setupExecutionsFilterFunctions();
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
    showDeleteModal: deleteExecution
  });
}

/**
 * זיהוי מזהה השדה מהודעת שגיאה
 * @param {string} errorMessage - הודעת השגיאה
 * @param {string} prefix - קידומת הטופס (add או edit)
 * @returns {string|null} מזהה השדה או null
 */
function getFieldIdFromError(errorMessage, prefix) {
    const fieldMappings = {
        'יש לבחור טרייד': `${prefix}ExecutionTradeId`,
        'יש לבחור פעולה תקינה': `${prefix}ExecutionType`,
        'יש להזין כמות חיובית': `${prefix}ExecutionQuantity`,
        'יש להזין מחיר חיובי': `${prefix}ExecutionPrice`,
        'עמלה גבוהה מדי': `${prefix}ExecutionCommission`,
        'הערות ארוכות מדי': `${prefix}ExecutionNotes`,
        'מקור ארוך מדי': `${prefix}ExecutionSource`,
        'מזהה חיצוני לא תקין': `${prefix}ExecutionExternalId`,
        'יש להזין תאריך עסקה': `${prefix}ExecutionDate`
    };
    
    for (const [message, fieldId] of Object.entries(fieldMappings)) {
        if (errorMessage.includes(message)) {
            return fieldId;
        }
    }
    
    return null;
}
