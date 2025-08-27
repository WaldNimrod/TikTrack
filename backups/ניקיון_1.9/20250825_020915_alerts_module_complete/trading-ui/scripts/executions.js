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

console.log('🔄 === EXECUTIONS.JS LOADED ===');
console.log('🔄 Script loaded at:', new Date().toISOString());

// משתנים גלובליים
if (!window.executionsData) {
    window.executionsData = [];
}
let executionsData = window.executionsData;

// פונקציות בסיסיות
function openExecutionDetails(id) {
    console.log('פתיחת פרטי עסקה:', id);
    showAddExecutionModal();
}

function editExecution(id) {
    console.log('עריכת עסקה:', id);
    showEditExecutionModal(id);
}

function deleteExecution(id) {
    console.log('מחיקת עסקה:', id);
    showDeleteExecutionModal(id);
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleExecutionsSection() {
    console.log('🔄 toggleExecutionsSection נקראה');
    const contentSections = document.querySelectorAll('.content-section');
    console.log('📋 מספר content-sections נמצא:', contentSections.length);
    const executionsSection = contentSections[0]; // הסקשן הראשון - עסקעות

    if (!executionsSection) {
        console.error('❌ לא נמצא סקשן עסקעות');
        return;
    }
    console.log('✅ סקשן עסקעות נמצא:', executionsSection);

    const sectionBody = executionsSection.querySelector('.section-body');
    const toggleBtn = executionsSection.querySelector('button[onclick="toggleExecutionsSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    console.log('🎯 sectionBody נמצא:', !!sectionBody);
    console.log('🔘 toggleBtn נמצא:', !!toggleBtn);
    console.log('🎨 icon נמצא:', !!icon);

    if (sectionBody) {
        const isCollapsed = sectionBody.style.display === 'none';
        console.log('📊 מצב נוכחי - isCollapsed:', isCollapsed);

        if (isCollapsed) {
            sectionBody.style.display = 'block';
        } else {
            sectionBody.style.display = 'none';
        }

        // עדכון האייקון
        if (icon) {
            icon.textContent = isCollapsed ? '▲' : '▼';
        }

        // שמירת המצב ב-localStorage
        localStorage.setItem('executionsSectionCollapsed', !isCollapsed);
    }
}

// פונקציה לשחזור מצב הסגירה
function restoreExecutionsSectionState() {
    // שחזור מצב סקשן העסקעות
    const executionsCollapsed = localStorage.getItem('executionsSectionCollapsed') === 'true';
    const contentSections = document.querySelectorAll('.content-section');
    const executionsSection = contentSections[0];

    if (executionsSection) {
        const sectionBody = executionsSection.querySelector('.section-body');
        const toggleBtn = executionsSection.querySelector('button[onclick="toggleExecutionsSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && executionsCollapsed) {
            sectionBody.style.display = 'none';
            if (icon) {
                icon.textContent = '▼';
            }
        }
    }
}

// פונקציות נוספות
function resetAllFiltersAndReloadData() {
    console.log('איפוס פילטרים');
}

// ========================================
// פונקציות מודלים
// ========================================

/**
 * הצגת מודל הוספת עסקה
 */
function showAddExecutionModal() {
    console.log('🔄 הצגת מודל הוספת עסקה');

    // ניקוי הטופס
    document.getElementById('addExecutionForm').reset();
    clearExecutionValidationErrors();

    // הגדרת תאריך ברירת מחדל - היום
    const today = new Date();
    const todayString = today.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    document.getElementById('addExecutionDate').value = todayString;

    // טעינת טיקרים עם טריידים פעילים
    loadTickersWithActiveTrades();

    // חישוב ערכים מחושבים
    calculateAddExecutionValues();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addExecutionModal'));
    modal.show();
}

/**
 * הצגת מודל עריכת עסקה
 */
function showEditExecutionModal(id) {
    console.log('🔄 הצגת מודל עריכת עסקה:', id);

    // מציאת העסקה לפי ID
    const execution = executionsData.find(e => e.id == id);
    if (!execution) {
        showNotification('❌ עסקה לא נמצאה', 'error');
        return;
    }

    // טעינת טיקרים עם טריידים פעילים
    loadTickersWithActiveTrades();

    // מילוי הטופס
    document.getElementById('editExecutionId').value = execution.id;
    document.getElementById('editExecutionTradeId').value = execution.trade_id;

    // תיקון שדה הפעולה - מיפוי action/type לערכים ב-select
    const actionValue = execution.action || execution.type;
    document.getElementById('editExecutionType').value = actionValue;

    document.getElementById('editExecutionQuantity').value = execution.quantity;
    document.getElementById('editExecutionPrice').value = execution.price;
    document.getElementById('editExecutionDate').value = execution.execution_date;
    document.getElementById('editExecutionCommission').value = execution.commission || '';
    document.getElementById('editExecutionSource').value = execution.source || '';
    document.getElementById('editExecutionExternalId').value = execution.external_id || '';
    document.getElementById('editExecutionNotes').value = execution.notes || '';

    // הצגת כפתור קישור לטרייד אם יש טרייד
    const tradeLinkButton = document.getElementById('editExecutionTradeLink');
    if (tradeLinkButton && execution.trade_id) {
        tradeLinkButton.style.display = 'block';
        tradeLinkButton.setAttribute('data-trade-id', execution.trade_id);
    }

    clearExecutionValidationErrors();

    // חישוב ערכים מחושבים
    calculateEditExecutionValues();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editExecutionModal'));
    modal.show();
}

/**
 * הצגת מודל מחיקת עסקה
 */
async function showDeleteExecutionModal(id) {
    console.log('🔄 הצגת מודל מחיקת עסקה:', id);

    // מציאת העסקה לפי ID
    const execution = executionsData.find(e => e.id == id);
    if (!execution) {
        showNotification('❌ עסקה לא נמצאה', 'error');
        return;
    }

    // טעינת פרטי טרייד
    let tradeDetails = `טרייד ${execution.trade_id}`;
    try {
        const tradesResponse = await fetch('/api/v1/trades/');
        const tradesData = await tradesResponse.json();
        const trades = tradesData.data || tradesData || [];

        const trade = trades.find(t => t.id == execution.trade_id);
        if (trade) {
            // טעינת פרטי טיקר
            const tickersResponse = await fetch('/api/v1/tickers/');
            const tickersData = await tickersResponse.json();
            const tickers = tickersData.data || tickersData || [];

            const ticker = tickers.find(t => t.id == trade.ticker_id);
            const tickerSymbol = ticker ? ticker.symbol : 'לא מוגדר';

            tradeDetails = `${tickerSymbol} - טרייד ${trade.id} (${trade.side} ${trade.investment_type})`;
        }
    } catch (error) {
        console.warn('⚠️ Error loading trade details:', error);
    }

    // מילוי המודל
    document.getElementById('deleteExecutionId').value = execution.id;
    document.getElementById('deleteExecutionName').textContent = `עסקה ${execution.id} - ${tradeDetails}`;

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('deleteExecutionModal'));
    modal.show();
}

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
        showFieldError(input, errorElement, 'סמל טיקר הוא שדה חובה');
        return false;
    }

    if (symbol.length < 1 || symbol.length > 10) {
        showFieldError(input, errorElement, 'סמל טיקר חייב להיות בין 1 ל-10 תווים');
        return false;
    }

    if (!/^[A-Z0-9.]+$/.test(symbol)) {
        showFieldError(input, errorElement, 'סמל טיקר יכול להכיל רק אותיות באנגלית, מספרים ונקודות');
        return false;
    }

    // בדיקת ייחודיות
    const currentId = document.getElementById('editTickerId')?.value;
    const existingTicker = tickersData.find(t =>
        t.symbol.toUpperCase() === symbol && t.id != currentId
    );

    if (existingTicker) {
        showFieldError(input, errorElement, 'סמל טיקר זה כבר קיים במערכת');
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של מזהה טרייד
 */
function validateExecutionTradeId(input) {
    const tradeId = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!tradeId) {
        showFieldError(input, errorElement, 'מזהה טרייד הוא שדה חובה');
        return false;
    }

    const numTradeId = parseInt(tradeId);
    if (isNaN(numTradeId) || numTradeId < 1) {
        showFieldError(input, errorElement, 'מזהה טרייד חייב להיות מספר חיובי');
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
        showFieldError(input, errorElement, 'כמות היא שדה חובה');
        return false;
    }

    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity < 1) {
        showFieldError(input, errorElement, 'כמות חייבת להיות מספר חיובי');
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
        showFieldError(input, errorElement, 'מחיר הוא שדה חובה');
        return false;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
        showFieldError(input, errorElement, 'מחיר חייב להיות מספר חיובי');
        return false;
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * ולידציה של עמלה
 */
function validateExecutionCommission(input) {
    const commission = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (commission) {
        const numCommission = parseFloat(commission);
        if (isNaN(numCommission) || numCommission < 0) {
            showFieldError(input, errorElement, 'עמלה חייבת להיות מספר חיובי או אפס');
            return false;
        }
    }

    clearFieldError(input, errorElement);
    return true;
}

/**
 * הצגת שגיאת שדה
 */
function showFieldError(input, errorElement, message) {
    input.classList.add('is-invalid');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

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

    // וולידציה של מזהה טרייד
    const tradeIdField = document.getElementById(`${prefix}ExecutionTradeId`);
    if (!validateExecutionTradeId(tradeIdField)) {
        isValid = false;
    }

    // וולידציה של סוג עסקה
    const typeField = document.getElementById(`${prefix}ExecutionType`);
    if (!typeField.value) {
        const errorElement = document.getElementById(typeField.id + 'Error');
        showFieldError(typeField, errorElement, 'יש לבחור סוג עסקה');
        isValid = false;
    } else {
        const errorElement = document.getElementById(typeField.id + 'Error');
        clearFieldError(typeField, errorElement);
    }

    // וולידציה של כמות
    const quantityField = document.getElementById(`${prefix}ExecutionQuantity`);
    if (!validateExecutionQuantity(quantityField)) {
        isValid = false;
    } else {
        // בדיקה נוספת - כמות לא יכולה להיות גדולה מדי
        const quantity = parseInt(quantityField.value);
        if (quantity > 1000000) {
            const errorElement = document.getElementById(quantityField.id + 'Error');
            showFieldError(quantityField, errorElement, 'כמות גבוהה מדי (מקסימום 1,000,000)');
            isValid = false;
        }
    }

    // וולידציה של מחיר
    const priceField = document.getElementById(`${prefix}ExecutionPrice`);
    if (!validateExecutionPrice(priceField)) {
        isValid = false;
    } else {
        // בדיקה נוספת - מחיר לא יכול להיות גבוה מדי
        const price = parseFloat(priceField.value);
        if (price > 1000000) {
            const errorElement = document.getElementById(priceField.id + 'Error');
            showFieldError(priceField, errorElement, 'מחיר גבוה מדי (מקסימום 1,000,000)');
            isValid = false;
        }
    }

    // וולידציה של תאריך
    const dateField = document.getElementById(`${prefix}ExecutionDate`);
    if (!dateField.value) {
        const errorElement = document.getElementById(dateField.id + 'Error');
        showFieldError(dateField, errorElement, 'תאריך עסקה הוא שדה חובה');
        isValid = false;
    } else {
        const date = new Date(dateField.value);
        const today = new Date();
        const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

        if (date > maxDate) {
            const errorElement = document.getElementById(dateField.id + 'Error');
            showFieldError(dateField, errorElement, 'תאריך לא יכול להיות יותר משנה קדימה');
            isValid = false;
        } else {
            const minDate = new Date(2000, 0, 1);
            if (date < minDate) {
                const errorElement = document.getElementById(dateField.id + 'Error');
                showFieldError(dateField, errorElement, 'תאריך לא יכול להיות לפני שנת 2000');
                isValid = false;
            } else {
                const errorElement = document.getElementById(dateField.id + 'Error');
                clearFieldError(dateField, errorElement);
            }
        }
    }

    // וולידציה של עמלה (אופציונלי)
    const commissionField = document.getElementById(`${prefix}ExecutionCommission`);
    if (commissionField.value) {
        if (!validateExecutionCommission(commissionField)) {
            isValid = false;
        } else {
            // בדיקה נוספת - עמלה לא יכולה להיות גבוהה מדי
            const commission = parseFloat(commissionField.value);
            if (commission > 10000) {
                const errorElement = document.getElementById(commissionField.id + 'Error');
                showFieldError(commissionField, errorElement, 'עמלה גבוהה מדי (מקסימום 10,000)');
                isValid = false;
            }
        }
    }

    // וולידציה של הערות (אופציונלי)
    const notesField = document.getElementById(`${prefix}ExecutionNotes`);
    if (notesField.value && notesField.value.length > 1000) {
        const errorElement = document.getElementById(notesField.id + 'Error');
        showFieldError(notesField, errorElement, 'הערות ארוכות מדי (מקסימום 1,000 תווים)');
        isValid = false;
    } else if (notesField.value) {
        const errorElement = document.getElementById(notesField.id + 'Error');
        clearFieldError(notesField, errorElement);
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
    console.log('🔄 שמירת עסקה חדשה');

    // ולידציה
    const tradeId = document.getElementById('addExecutionTradeId').value;
    const type = document.getElementById('addExecutionType').value;
    const quantity = document.getElementById('addExecutionQuantity').value;
    const price = document.getElementById('addExecutionPrice').value;
    const executionDate = document.getElementById('addExecutionDate').value;
    const commission = document.getElementById('addExecutionCommission').value;
    const source = document.getElementById('addExecutionSource').value.trim();
    const externalId = document.getElementById('addExecutionExternalId').value.trim();
    const notes = document.getElementById('addExecutionNotes').value.trim();

    // בדיקת ולידציה מקיפה
    if (!validateCompleteExecutionForm('add')) {
        showNotification('❌ יש לתקן את השגיאות בטופס', 'error');
        return;
    }

    try {
        const executionData = {
            trade_id: parseInt(tradeId),
            type: type,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            execution_date: executionDate,
            commission: commission ? parseFloat(commission) : null,
            source: source || null,
            external_id: externalId || null,
            notes: notes || null
        };

        console.log('📤 שליחת נתונים:', executionData);

        const response = await fetch('/api/v1/executions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(executionData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ עסקה נשמרה בהצלחה:', result);

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('addExecutionModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            showNotification('✅ עסקה נשמרה בהצלחה', 'success');

            // רענון הנתונים
            await loadExecutionsData();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה בשמירת עסקה:', error);
            showNotification('❌ שגיאה בשמירת עסקה: ' + error, 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה בשמירת עסקה:', error);
        showNotification('❌ שגיאה בשמירת עסקה', 'error');
    }
}

/**
 * עדכון עסקה קיימת
 */
async function updateExecution() {
    console.log('🔄 עדכון עסקה');

    const id = document.getElementById('editExecutionId').value;
    const tradeId = document.getElementById('editExecutionTradeId').value;
    const type = document.getElementById('editExecutionType').value;
    const quantity = document.getElementById('editExecutionQuantity').value;
    const price = document.getElementById('editExecutionPrice').value;
    const executionDate = document.getElementById('editExecutionDate').value;
    const commission = document.getElementById('editExecutionCommission').value;
    const source = document.getElementById('editExecutionSource').value.trim();
    const externalId = document.getElementById('editExecutionExternalId').value.trim();
    const notes = document.getElementById('editExecutionNotes').value.trim();

    // בדיקת ולידציה
    if (!validateCompleteExecutionForm('edit')) {
        showNotification('❌ יש לתקן את השגיאות בטופס', 'error');
        return;
    }

    try {
        const executionData = {
            trade_id: parseInt(tradeId),
            type: type,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            execution_date: executionDate,
            commission: commission ? parseFloat(commission) : null,
            source: source || null,
            external_id: externalId || null,
            notes: notes || null
        };

        console.log('📤 שליחת נתונים לעדכון:', executionData);

        const response = await fetch(`/api/v1/executions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(executionData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ עסקה עודכנה בהצלחה:', result);

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editExecutionModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            showNotification('✅ עסקה עודכנה בהצלחה', 'success');

            // רענון הנתונים
            await loadExecutionsData();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה בעדכון עסקה:', error);
            showNotification('❌ שגיאה בעדכון עסקה: ' + error, 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה בעדכון עסקה:', error);
        showNotification('❌ שגיאה בעדכון עסקה', 'error');
    }
}

/**
 * אישור מחיקת עסקה
 */
async function confirmDeleteExecution() {
    console.log('🔄 אישור מחיקת עסקה');

    const id = document.getElementById('deleteExecutionId').value;

    try {
        const response = await fetch(`/api/v1/executions/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('✅ עסקה נמחקה בהצלחה');

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteExecutionModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            showNotification('✅ עסקה נמחקה בהצלחה', 'success');

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

                    // סגירת מודל המחיקה הרגיל
                    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteTickerModal'));
                    deleteModal.hide();

                    // הצגת מודל הפריטים המקושרים
                    await showLinkedItemsModal(id, errorData);
                    return;
                }

                showNotification('❌ שגיאה במחיקת טיקר: ' + errorData.error.message, 'error');

            } catch (parseError) {
                showNotification('❌ שגיאה במחיקת טיקר: ' + errorResponse, 'error');
            }
        }

    } catch (error) {
        console.error('❌ שגיאה במחיקת טיקר:', error);
        showNotification('❌ שגיאה במחיקת טיקר', 'error');
    }
}

// ========================================
// פונקציות מודל פריטים מקושרים
// ========================================

/**
 * הצגת מודל פריטים מקושרים
 */
async function showLinkedItemsModal(executionId, errorData) {
    console.log('🔄 הצגת מודל פריטים מקושרים לעסקה:', executionId);

    // מציאת העסקה לפי ID
    const execution = executionsData.find(e => e.id == executionId);
    if (!execution) {
        showNotification('❌ עסקה לא נמצאה', 'error');
        return;
    }

    // עדכון שם העסקה
    document.getElementById('linkedExecutionName').textContent = `עסקה ${execution.id} - טרייד ${execution.trade_id}`;

    // טעינת פרטי הפריטים המקושרים
    await loadLinkedItemsDetails(executionId, errorData);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('linkedItemsModal'));
    modal.show();
}

/**
 * טעינת פרטי הפריטים המקושרים
 */
async function loadLinkedItemsDetails(executionId, errorData = null) {
    console.log('🔄 טעינת פרטי פריטים מקושרים לעסקה:', executionId);
    console.log('📊 errorData:', errorData);

    const contentDiv = document.getElementById('linkedItemsContent');
    contentDiv.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><br>טוען פרטים...</div>';

    try {
        // קריאה ל-API לקבלת פרטי הפריטים המקושרים
        const response = await fetch(`/api/v1/executions/${executionId}/linked-items`);

        if (response.ok) {
            const data = await response.json();
            console.log('📊 נתונים מהשרת:', data);
            displayLinkedItems(data.data);
        } else {
            console.log('⚠️ API לא זמין, מנסה לטעון ממקורות מרובים');
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
    console.log('🔄 טעינת פריטים מקושרים ממקורות מרובים');

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
                                        <td><span class="badge bg-danger">${alert.status}</span></td>
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

/**
 * הצגת הודעה
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    container.appendChild(notification);

    // הסרה אוטומטית אחרי 5 שניות
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * טעינת נתוני עסקעות
 */
async function loadExecutionsData() {
    console.log('🔄 === LOAD EXECUTIONS DATA FUNCTION CALLED ===');
    console.log('🔄 Function loadExecutionsData entered at:', new Date().toISOString());

    try {
        console.log('🔄 === LOAD EXECUTIONS DATA START ===');
        console.log('🔄 טעינת נתוני עסקעות');

        const response = await fetch('/api/v1/executions/?_t=' + Date.now());
        if (response.ok) {
            const data = await response.json();
            executionsData = data.data || data;
            console.log('✅ נטענו', executionsData.length, 'עסקעות');
            console.log('📊 נתוני עסקעות:', executionsData);

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
                    updateExecutionsTable(filteredData);
                    return;
                }
            }

            // עדכון הטבלה
            updateExecutionsTable(executionsData);

        } else {
            console.error('❌ שגיאה בטעינת עסקעות');
            showNotification('❌ שגיאה בטעינת נתונים', 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה בטעינת עסקעות:', error);
        showNotification('❌ שגיאה בטעינת נתונים', 'error');
    }
}

/**
 * עדכון טבלת עסקעות
 */
async function updateExecutionsTable(executions) {
    console.log('🔄 === UPDATE EXECUTIONS TABLE START ===');
    console.log('🔄 updateExecutionsTable נקראה עם', executions.length, 'עסקעות');
    console.log('📊 נתוני עסקעות:', executions);

    const tbody = document.querySelector('#executionsTable tbody');
    if (!tbody) return;

    if (executions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">לא נמצאו עסקעות</td></tr>';
        return;
    }

    // טעינת נתוני טריידים וטיקרים
    let trades = [];
    let tickers = [];

    try {
        const [tradesResponse, tickersResponse] = await Promise.all([
            fetch('/api/v1/trades/').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/v1/tickers/').then(r => r.json()).catch(() => ({ data: [] }))
        ]);

        trades = tradesResponse.data || tradesResponse || [];
        tickers = tickersResponse.data || tickersResponse || [];

        console.log(`✅ נטענו ${trades.length} טריידים ו-${tickers.length} טיקרים`);
    } catch (error) {
        console.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error);
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
            (execution.action || execution.type) === 'sell' ? 'מכירה' :
                (execution.action || execution.type);

        return `
            <tr>
                <td class="ticker-cell"><strong>${symbol}</strong></td>
                <td><small style="color: #666;">${tradeInfo}</small></td>
                <td class="type-cell" data-type="${typeForFilter}">
                    <span class="${(execution.action || execution.type) === 'buy' ? 'profit-positive' : 'profit-negative'}">
                        ${(execution.action || execution.type) === 'buy' ? 'רכישה' : 'מכירה'}
                    </span>
                </td>
                <td>${execution.quantity}</td>
                <td>$${execution.price}</td>
                <td>${execution.fee ? '$' + execution.fee : '-'}</td>
                <td class="pl-cell">${window.colorAmount(0, '$0')}</td>
                <td>-</td>
                <td data-date="${execution.created_at}">${window.formatDateOnly(execution.created_at)}</td>
                <td data-date="${execution.date || execution.execution_date}">${window.formatDateOnly(execution.date || execution.execution_date)}</td>
                <td style="text-align: left; direction: ltr;">${execution.source || '-'}</td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-secondary" onclick="editExecution(${execution.id})" title="ערוך">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteExecution(${execution.id})" title="מחק">🗑️</button>
                    <button class="btn btn-sm btn-info" onclick="viewLinkedItems(${execution.id})" title="צפה באלמנטים מקושרים">
                      🔗
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // עדכון הספירה
    const countElement = document.querySelector('.table-count');
    if (countElement) {
        countElement.textContent = `${executions.length} עסקעות`;
    }
}

// פונקציה formatDate מוגדרת בקובץ main.js

// פונקציית פילטור מקומי לעסקאות
function filterExecutionsLocally(executions, selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm) {
    console.log('🔍 filterExecutionsLocally called with:', { selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm });

    return executions.filter(execution => {
        // פילטר חיפוש
        if (searchTerm && searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase();
            const symbol = execution.symbol || '';
            const action = execution.action || execution.type || '';
            const notes = execution.notes || '';

            if (!symbol.toLowerCase().includes(searchLower) &&
                !action.toLowerCase().includes(searchLower) &&
                !notes.toLowerCase().includes(searchLower)) {
                return false;
            }
        }

        // פילטר סוג (type)
        if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('הכול')) {
            const executionType = (execution.action || execution.type) === 'buy' ? 'קנייה' :
                (execution.action || execution.type) === 'sell' ? 'מכירה' : (execution.action || execution.type);

            if (!selectedTypes.includes(executionType)) {
                return false;
            }
        }

        // פילטר תאריך
        if (dateRange && dateRange !== 'כל זמן' && dateRange !== 'הכול') {
            const executionDate = new Date(execution.created_at || execution.date || execution.execution_date);
            const now = new Date();

            let startDate, endDate;

            switch (dateRange) {
                case 'היום':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                    break;
                case 'אתמול':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'השבוע':
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                    break;
                case '30 יום':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                    break;
                default:
                    return true; // אם לא מוכר, לא מסנן
            }

            if (executionDate < startDate || executionDate >= endDate) {
                return false;
            }
        }

        return true;
    });
}

// הגדרת הפונקציה כגלובלית
window.filterExecutionsLocally = filterExecutionsLocally;

// הגדרת הפונקציות כגלובליות
window.openExecutionDetails = openExecutionDetails;
window.editExecution = editExecution;
window.deleteExecution = deleteExecution;
window.toggleExecutionsSection = toggleExecutionsSection;
window.restoreExecutionsSectionState = restoreExecutionsSectionState;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;

// פונקציות מודלים
window.showAddExecutionModal = showAddExecutionModal;
window.showEditExecutionModal = showEditExecutionModal;
window.showDeleteExecutionModal = showDeleteExecutionModal;
window.saveExecution = saveExecution;
window.updateExecution = updateExecution;
window.confirmDeleteExecution = confirmDeleteExecution;

// פונקציות ולידציה
window.validateExecutionTradeId = validateExecutionTradeId;
window.validateExecutionQuantity = validateExecutionQuantity;
window.validateExecutionPrice = validateExecutionPrice;
window.validateExecutionCommission = validateExecutionCommission;

// פונקציות מודל פריטים מקושרים
window.showLinkedItemsModal = showLinkedItemsModal;
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
            updateExecutionsTable
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
        window.restoreAnyTableSort('executions', window.executionsData || [], updateExecutionsTable);
    } else {
        console.error('❌ restoreAnyTableSort function not found in main.js');
    }
}

// הגדרת הפונקציה כגלובלית
window.sortTable = sortTable;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === DOM CONTENT LOADED ===');
    console.log('🔄 Starting executions page initialization...');
    console.log('🔄 Current time:', new Date().toISOString());

    // שחזור מצב הסגירה
    console.log('🔄 Restoring executions section state...');
    restoreExecutionsSectionState();

    // טעינת נתונים
    console.log('🔄 Loading executions data...');
    console.log('🔄 About to call loadExecutionsData()...');
    loadExecutionsData();
    console.log('🔄 loadExecutionsData() called successfully');

    // שחזור מצב סידור
    console.log('🔄 Restoring sort state...');
    restoreSortState();

    console.log('✅ דף עסקעות נטען בהצלחה');
    console.log('🔄 === END DOM CONTENT LOADED ===');
});

// ===== פונקציות לטעינת טיקרים וטריידים =====

/**
 * טעינת טיקרים עם טריידים פעילים או סגורים
 */
async function loadTickersWithActiveTrades() {
    console.log('🔄 Loading tickers with trades...');

    try {
        // טעינת טיקרים
        const tickersResponse = await fetch('/api/v1/tickers/');
        const tickersData = await tickersResponse.json();
        const tickers = tickersData.data || tickersData || [];
        console.log('📊 Loaded', tickers.length, 'tickers from API');

        // טעינת טריידים
        const tradesResponse = await fetch('/api/v1/trades/');
        const tradesData = await tradesResponse.json();
        const trades = tradesData.data || tradesData || [];
        console.log('📊 Loaded', trades.length, 'trades from API');

        // סינון טיקרים עם טריידים פעילים (ברירת מחדל)
        const activeTickers = tickers.filter(ticker => {
            return trades.some(trade =>
                trade.ticker_id === ticker.id &&
                trade.status === 'active'
            );
        });
        console.log('✅ Found', activeTickers.length, 'tickers with active trades');

        // עדכון שדה הטיקר במודל הוספה
        const addTickerSelect = document.getElementById('addExecutionTicker');
        if (addTickerSelect) {
            addTickerSelect.innerHTML = '<option value="">בחר טיקר...</option>';
            activeTickers.forEach(ticker => {
                const option = document.createElement('option');
                option.value = ticker.id;
                option.textContent = `${ticker.symbol} - ${ticker.name}`;
                addTickerSelect.appendChild(option);
            });
            console.log('✅ Updated add ticker select with', activeTickers.length, 'options');
        }

        // עדכון שדה הטיקר במודל עריכה
        const editTickerSelect = document.getElementById('editExecutionTicker');
        if (editTickerSelect) {
            editTickerSelect.innerHTML = '<option value="">בחר טיקר...</option>';
            activeTickers.forEach(ticker => {
                const option = document.createElement('option');
                option.value = ticker.id;
                option.textContent = `${ticker.symbol} - ${ticker.name}`;
                editTickerSelect.appendChild(option);
            });
            console.log('✅ Updated edit ticker select with', activeTickers.length, 'options');
        }

    } catch (error) {
        console.error('❌ Error loading tickers with trades:', error);
    }
}

/**
 * טעינת טריידים פעילים או סגורים לטיקר שנבחר
 * @param {string} mode - 'add' או 'edit'
 */
async function loadActiveTradesForTicker(mode = 'add') {
    console.log('🔄 Loading trades for ticker, mode:', mode);

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

        // סינון טריידים לטיקר שנבחר
        let filteredTrades;
        if (showClosedTrades) {
            // הצג טריידים פעילים וסגורים
            filteredTrades = trades.filter(trade =>
                trade.ticker_id == tickerId &&
                (trade.status === 'active' || trade.status === 'closed')
            );
            console.log('✅ Found', filteredTrades.length, 'active or closed trades for ticker', tickerId);
        } else {
            // הצג רק טריידים פעילים
            filteredTrades = trades.filter(trade =>
                trade.ticker_id == tickerId &&
                trade.status === 'active'
            );
            console.log('✅ Found', filteredTrades.length, 'active trades for ticker', tickerId);
        }

        // עדכון שדה הטרייד
        const tradeSelect = mode === 'add'
            ? document.getElementById('addExecutionTradeId')
            : document.getElementById('editExecutionTradeId');

        if (tradeSelect) {
            tradeSelect.innerHTML = '<option value="">בחר טרייד...</option>';
            filteredTrades.forEach(trade => {
                const option = document.createElement('option');
                option.value = trade.id;
                const statusText = trade.status === 'active' ? 'פעיל' : 'סגור';
                option.textContent = `טרייד ${trade.id} - ${trade.side} ${trade.investment_type} (${statusText})`;
                tradeSelect.appendChild(option);
            });

            // הצגת כפתור קישור לטרייד
            const tradeLinkButton = mode === 'add'
                ? document.getElementById('addExecutionTradeLink')
                : document.getElementById('editExecutionTradeLink');
            if (tradeLinkButton) {
                tradeLinkButton.style.display = 'block';
            }
        }

    } catch (error) {
        console.error('❌ Error loading trades for ticker:', error);
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

// הגדרת הפונקציות כגלובליות
window.loadTickersWithActiveTrades = loadTickersWithActiveTrades;
window.loadTickersWithClosedTrades = loadTickersWithClosedTrades;
window.loadActiveTradesForTicker = loadActiveTradesForTicker;
window.updateTradesOnCheckboxChange = updateTradesOnCheckboxChange;

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
