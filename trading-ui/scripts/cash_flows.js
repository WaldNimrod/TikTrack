// ===== קובץ JavaScript לדף תזרימי מזומנים =====
/*
 * Cash Flows.js - Cash Flows Page Management
 * ==========================================
 * 
 * This file contains all cash flows management functionality for the TikTrack application.
 * It handles cash flows CRUD operations, table updates, and user interactions.
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * 
 * Table Mapping:
 * - Uses 'cash_flows' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * File: trading-ui/scripts/cash_flows.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// משתנים גלובליים
if (!window.cashFlowsData) {
    window.cashFlowsData = [];
}
let cashFlowsData = window.cashFlowsData;

// השתמש בפונקציה הכללית מ-translation-utils.js
// הפונקציה colorAmount זמינה גלובלית מ-translation-utils.js

// פונקציות בסיסיות
function openCashFlowDetails(id) {
    showAddCashFlowModal();
}

function editCashFlow(id) {
    showEditCashFlowModal(id);
}

function deleteCashFlow(id) {
    showDeleteCashFlowModal(id);
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleTopSection() {
    const topSection = document.querySelector('.top-section');

    if (!topSection) {
        console.error('❌ לא נמצא top-section');
        return;
    }

    const sectionBody = topSection.querySelector('.section-body');
    const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody) {
        const isCollapsed = sectionBody.style.display === 'none';

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
        localStorage.setItem('cashFlowsTopSectionHidden', !isCollapsed);
    }
}

function toggleCashFlowsSection() {
    const contentSections = document.querySelectorAll('.content-section');
    const cashFlowsSection = contentSections[0]; // הסקשן הראשון - תזרימי מזומנים

    if (!cashFlowsSection) {
        console.error('❌ לא נמצא סקשן תזרימי מזומנים');
        return;
    }

    const sectionBody = cashFlowsSection.querySelector('.section-body');
    const toggleBtn = cashFlowsSection.querySelector('button[onclick="toggleCashFlowsSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody) {
        const isCollapsed = sectionBody.style.display === 'none';

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
        localStorage.setItem('cashFlowsSectionCollapsed', !isCollapsed);
    }
}

// פונקציות לשחזור מצב הסגירה
function restoreCashFlowsSectionState() {
    // שחזור מצב top-section (התראות וסיכום)
    const topCollapsed = localStorage.getItem('cashFlowsTopSectionHidden') === 'true';
    const topSection = document.querySelector('.top-section');

    if (topSection) {
        const sectionBody = topSection.querySelector('.section-body');
        const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && topCollapsed) {
            sectionBody.style.display = 'none';
            if (icon) {
                icon.textContent = '▼';
            }
        }
    }

    // שחזור מצב סקשן תזרימי מזומנים
    const cashFlowsCollapsed = localStorage.getItem('cashFlowsSectionCollapsed') === 'true';
    const contentSections = document.querySelectorAll('.content-section');
    const cashFlowsSection = contentSections[0];

    if (cashFlowsSection) {
        const sectionBody = cashFlowsSection.querySelector('.section-body');
        const toggleBtn = cashFlowsSection.querySelector('button[onclick="toggleCashFlowsSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && cashFlowsCollapsed) {
            sectionBody.style.display = 'none';
            if (icon) {
                icon.textContent = '▼';
            }
        }
    }
}

// פונקציות נוספות
function resetAllFiltersAndReloadData() {
    // איפוס פילטרים
}

// ========================================
// פונקציות מודלים
// ========================================





/**
 * הצגת מודל מחיקת תזרים מזומנים
 */
function showDeleteCashFlowModal(id) {
    console.log('🗑️ הצגת מודל מחיקה לתזרים:', id);

    const cashFlow = cashFlowsData.find(cf => cf.id === id);
    if (!cashFlow) {
        console.error('❌ תזרים מזומנים לא נמצא:', id);
        return;
    }

    // שימוש במערכת האזהרות המרכזית
    const cashFlowName = `${cashFlow.type} - ${cashFlow.amount}`;
    console.log('📝 שם התזרים למחיקה:', cashFlowName);

    window.showDeleteWarning(
        'תזרים מזומנים',
        cashFlowName,
        () => {
            console.log('✅ אישור מחיקה - מתחיל מחיקה');
            confirmDeleteCashFlow(id);
        },
        () => {
            console.log('❌ ביטול מחיקה');
            if (window.showNotification) {
                window.showNotification('מחיקה בוטלה', 'info');
            }
        }
    );
}

// ========================================
// פונקציות API
// ========================================

/**
 * טעינת תזרימי מזומנים מהשרת
 */
async function loadCashFlows() {
    try {

        const response = await fetch('http://localhost:8080/api/v1/cash_flows/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            cashFlowsData = result.data;
            renderCashFlowsTable();
            updatePageSummaryStats();
        } else {
            console.error('❌ שגיאה בטעינת תזרימי מזומנים:', result.error);

            // הצגת הודעת שגיאה
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בטעינה', 'שגיאה בטעינת תזרימי מזומנים');
            }
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת תזרימי מזומנים:', error);

        // הצגת הודעת שגיאה
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בטעינה', 'שגיאה בטעינת תזרימי מזומנים');
        }
    }
}

/**
 * וולידציה של טופס תזרים מזומנים
 * @param {Object} formData - נתוני הטופס
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateCashFlowForm(formData) {
    let isValid = true;

    // ניקוי הודעות שגיאה קודמות
    clearValidationErrors();

    // וולידציה של חשבון
    if (!formData.account_id || isNaN(formData.account_id)) {
        showFieldError('cashFlowAccountId', 'יש לבחור חשבון');
        isValid = false;
    }

    // וולידציה של סוג
    if (!formData.type) {
        showFieldError('cashFlowType', 'יש לבחור סוג תזרים');
        isValid = false;
    }

    // וולידציה של סכום
    if (!formData.amount || isNaN(formData.amount)) {
        showFieldError('cashFlowAmount', 'יש להזין סכום תקין');
        isValid = false;
    } else if (formData.amount === 0) {
        showFieldError('cashFlowAmount', 'סכום לא יכול להיות 0');
        isValid = false;
    } else if (Math.abs(formData.amount) > 10000000) {
        showFieldError('cashFlowAmount', 'סכום גבוה מדי (מקסימום 10,000,000)');
        isValid = false;
    }

    // וולידציה של מטבע - מטבע הוא אופציונלי
    if (formData.currency_id && isNaN(formData.currency_id)) {
        showFieldError('cashFlowCurrencyId', 'יש לבחור מטבע תקין');
        isValid = false;
    }

    // וולידציה של תאריך
    if (!formData.date) {
        showFieldError('cashFlowDate', 'יש להזין תאריך');
        isValid = false;
    } else {
        const date = new Date(formData.date);
        const today = new Date();
        const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

        if (date > maxDate) {
            showFieldError('cashFlowDate', 'תאריך לא יכול להיות יותר משנה קדימה');
            isValid = false;
        }

        const minDate = new Date(2000, 0, 1);
        if (date < minDate) {
            showFieldError('cashFlowDate', 'תאריך לא יכול להיות לפני שנת 2000');
            isValid = false;
        }
    }

    // וולידציה של מקור
    if (!formData.source) {
        showFieldError('cashFlowSource', 'יש לבחור מקור');
        isValid = false;
    }

    return isValid;
}

/**
 * הצגת שגיאת וולידציה לשדה
 * @param {string} fieldId - מזהה השדה
 * @param {string} message - הודעת השגיאה
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + 'Error');

    if (field) {
        field.classList.add('is-invalid');
        field.focus();
    }

    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // שימוש במערכת האזהרות החדשה
    if (window.showValidationWarning) {
        window.showValidationWarning(fieldId, message);
    }
}

/**
 * ניקוי הודעות שגיאה
 */
function clearValidationErrors() {
    const fields = ['cashFlowAccountId', 'cashFlowType', 'cashFlowAmount', 'cashFlowCurrencyId', 'cashFlowDate', 'cashFlowSource'];

    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');

        if (field) {
            field.classList.remove('is-invalid');
        }

        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    });
}



/**
 * וולידציה של טופס עריכת תזרים מזומנים
 * @param {Object} formData - נתוני הטופס
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateEditCashFlowForm(formData) {
    let isValid = true;

    // ניקוי הודעות שגיאה קודמות
    clearEditValidationErrors();

    // וולידציה של חשבון
    if (!formData.account_id || isNaN(formData.account_id)) {
        showEditFieldError('editCashFlowAccountId', 'יש לבחור חשבון');
        isValid = false;
    }

    // וולידציה של סוג
    if (!formData.type) {
        showEditFieldError('editCashFlowType', 'יש לבחור סוג תזרים');
        isValid = false;
    }

    // וולידציה של סכום
    if (!formData.amount || isNaN(formData.amount)) {
        showEditFieldError('editCashFlowAmount', 'יש להזין סכום תקין');
        isValid = false;
    } else if (formData.amount === 0) {
        showEditFieldError('editCashFlowAmount', 'סכום לא יכול להיות 0');
        isValid = false;
    } else if (Math.abs(formData.amount) > 10000000) {
        showEditFieldError('editCashFlowAmount', 'סכום גבוה מדי (מקסימום 10,000,000)');
        isValid = false;
    }

    // וולידציה של מטבע - מטבע הוא אופציונלי
    if (formData.currency_id && isNaN(formData.currency_id)) {
        showEditFieldError('editCashFlowCurrencyId', 'יש לבחור מטבע תקין');
        isValid = false;
    }

    // וולידציה של תאריך
    if (!formData.date) {
        showEditFieldError('editCashFlowDate', 'יש להזין תאריך');
        isValid = false;
    } else {
        const date = new Date(formData.date);
        const today = new Date();
        const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

        if (date > maxDate) {
            showEditFieldError('editCashFlowDate', 'תאריך לא יכול להיות יותר משנה קדימה');
            isValid = false;
        }

        const minDate = new Date(2000, 0, 1);
        if (date < minDate) {
            showEditFieldError('editCashFlowDate', 'תאריך לא יכול להיות לפני שנת 2000');
            isValid = false;
        }
    }

    // וולידציה של מקור
    if (!formData.source) {
        showEditFieldError('editCashFlowSource', 'יש לבחור מקור');
        isValid = false;
    }

    return isValid;
}

/**
 * הצגת שגיאת וולידציה לשדה עריכה
 * @param {string} fieldId - מזהה השדה
 * @param {string} message - הודעת השגיאה
 */
function showEditFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + 'Error');

    if (field) {
        field.classList.add('is-invalid');
        field.focus();
    }

    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // שימוש במערכת האזהרות החדשה
    if (window.showValidationWarning) {
        window.showValidationWarning(fieldId, message);
    }
}

/**
 * ניקוי הודעות שגיאה לעריכה
 */
function clearEditValidationErrors() {
    const fields = ['editCashFlowAccountId', 'editCashFlowType', 'editCashFlowAmount', 'editCashFlowCurrencyId', 'editCashFlowDate', 'editCashFlowSource'];

    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');

        if (field) {
            field.classList.remove('is-invalid');
        }

        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    });
}



/**
 * מחיקת תזרים מזומנים
 */
async function confirmDeleteCashFlow(id) {
    try {
        console.log('🗑️ מתחיל מחיקת תזרים מזומנים:', id);

        const response = await fetch(`http://localhost:8080/api/v1/cash_flows/${id}`, {
            method: 'DELETE'
        });

        console.log('📡 תגובת השרת:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📄 תוצאת המחיקה:', result);

        if (result.status === 'success') {
            console.log('✅ מחיקה הצליחה, סוגר מודל ומעדכן נתונים');

            // הצגת הודעת הצלחה
            if (window.showSuccessNotification) {
                window.showSuccessNotification('תזרים מזומנים', 'תזרים המזומנים נמחק בהצלחה');
            } else {
                alert('תזרים המזומנים נמחק בהצלחה');
            }

            // טעינה מחדש של הנתונים
            console.log('🔄 טוען נתונים מחדש...');
            await loadCashFlows();
            console.log('✅ נתונים נטענו מחדש');
        } else {
            console.error('❌ שגיאה במחיקת תזרים מזומנים:', result.error);

            // הצגת הודעת שגיאה
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת תזרים מזומנים');
            } else {
                alert('שגיאה במחיקת תזרים מזומנים');
            }
        }
    } catch (error) {
        console.error('❌ שגיאה במחיקת תזרים מזומנים:', error);

        // הצגת הודעת שגיאה
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת תזרים מזומנים');
        } else {
            alert('שגיאה במחיקת תזרים מזומנים');
        }
    }
}

// ========================================
// פונקציות פריטים מקושרים
// ========================================

/**
 * הצגת פריטים מקושרים לתזרים מזומנים
 * @param {number} cashFlowId - מזהה תזרים המזומנים
 */
function viewLinkedItemsForCashFlow(cashFlowId) {
    // שימוש במערכת הפריטים המקושרים הגלובלית
    if (window.showLinkedItemsModal) {
        window.showLinkedItemsModal('cash_flow', cashFlowId, 'תזרים מזומנים');
    } else {
        console.error('❌ מערכת הפריטים המקושרים לא זמינה');

        // הצגת הודעת שגיאה
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'מערכת הפריטים המקושרים לא זמינה כרגע');
        } else {
            alert('מערכת הפריטים המקושרים לא זמינה כרגע');
        }
    }
}

// ========================================
// פונקציות עזר
// ========================================

/**
 * טעינת מטבעות מהשרת עם מערכת המטבעות החדשה
 */
async function loadCurrenciesFromServer() {
    try {
        const response = await fetch('/api/v1/currencies/dropdown');
        if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
                // עדכון המשתנה הגלובלי של מטבעות
                window.currenciesData = result.data;
                return result.data;
            }
        }
    } catch (error) {
        console.error('שגיאה בטעינת מטבעות מהשרת:', error);

        // הצגת הודעת שגיאה
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בטעינה', 'שגיאה בטעינת מטבעות מהשרת');
        }
    }
    return [];
}

/**
 * טעינת רשימת חשבונות למודל הוספה
 */
async function loadAccountsForCashFlow() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/accounts/');
        if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
                const select = document.getElementById('cashFlowAccountId');
                select.innerHTML = '<option value="">בחר חשבון...</option>';

                // הצגת רק חשבונות פתוחים
                result.data
                    .filter(account => account.status === 'open')
                    .forEach(account => {
                        const option = document.createElement('option');
                        option.value = account.id;
                        option.textContent = account.name;
                        select.appendChild(option);
                    });
            }
        }
    } catch (error) {
        console.error('שגיאה בטעינת חשבונות:', error);

        // הצגת הודעת שגיאה
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בטעינה', 'שגיאה בטעינת חשבונות');
        }
    }
}

/**
 * טעינת רשימת חשבונות למודל עריכה
 */
async function loadAccountsForEditCashFlow() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/accounts/');
        if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
                const select = document.getElementById('editCashFlowAccountId');
                select.innerHTML = '<option value="">בחר חשבון...</option>';

                result.data.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = account.name;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('שגיאה בטעינת חשבונות:', error);
    }
}

/**
 * טעינת רשימת מטבעות למודל הוספה
 */
async function loadCurrenciesForCashFlow() {
    try {
        // טעינת מטבעות מהשרת עם המערכת החדשה
        const currencies = await loadCurrenciesFromServer();

        const select = document.getElementById('cashFlowCurrencyId');
        select.innerHTML = '<option value="">בחר מטבע...</option>';

        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.id;
            option.textContent = `${currency.symbol} - ${currency.name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('שגיאה בטעינת מטבעות:', error);

        // הצגת הודעת שגיאה
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בטעינה', 'שגיאה בטעינת מטבעות');
        }
    }
}

/**
 * טעינת רשימת מטבעות למודל עריכה
 */
async function loadCurrenciesForEditCashFlow() {
    try {
        // טעינת מטבעות מהשרת עם המערכת החדשה
        const currencies = await loadCurrenciesFromServer();

        const select = document.getElementById('editCashFlowCurrencyId');
        select.innerHTML = '<option value="">בחר מטבע...</option>';

        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.id;
            option.textContent = `${currency.symbol} - ${currency.name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('שגיאה בטעינת מטבעות:', error);
    }
}

/**
 * רינדור טבלת תזרימי מזומנים
 */
function renderCashFlowsTable() {
    const tbody = document.querySelector('#cashFlowsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!cashFlowsData || cashFlowsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-center">לא נמצאו תזרימי מזומנים</td></tr>';
        return;
    }

    cashFlowsData.forEach(cashFlow => {
        const row = document.createElement('tr');
        const accountName = cashFlow.account_name || `חשבון ${cashFlow.account_id}`;

        // שימוש במערכת המטבעות החדשה
        const currencyDisplay = window.getCashFlowCurrencyDisplay ?
            window.getCashFlowCurrencyDisplay(cashFlow) :
            (cashFlow.currency_symbol || '$');

        // קבלת סוג עם צבע
        const typeDisplay = getCashFlowTypeWithColor(cashFlow.type);

        // עיצוב סכום עם יישור נכון וצביעה
        const amountDisplay = formatCashFlowAmount(cashFlow.amount);

        // עיצוב שער עם 2 ספרות אחרי הנקודה
        const rateDisplay = formatUsdRate(cashFlow.usd_rate);

        row.innerHTML = `
            <td class="ticker-cell"><strong>${accountName}</strong></td>
            <td class="type-cell">${typeDisplay}</td>
            <td style="text-align: left; direction: ltr;">${amountDisplay}</td>
            <td style="text-align: center;">${currencyDisplay}</td>
            <td style="text-align: center;">${rateDisplay}</td>
            <td style="text-align: center;">${formatDate(cashFlow.date)}</td>
            <td>${cashFlow.description || '-'}</td>
            <td>${window.translateCashFlowSource ? window.translateCashFlowSource(cashFlow.source) : cashFlow.source}</td>
            <td>${cashFlow.external_id || '0'}</td>
            <td style="text-align: center;">${formatDateOnly(cashFlow.created_at)}</td>
            <td class="actions-cell">
                <table class="table table-sm table-borderless mb-0">
                    <tbody>
                        <tr>
                            <td class="p-0 pe-1">
                                ${createEditButton(`editCashFlow(${cashFlow.id})`)}
                            </td>
                            <td class="p-0 pe-1">
                                ${createDeleteButton(`deleteCashFlow(${cashFlow.id})`)}
                            </td>
                            <td class="p-0">
                                ${createLinkButton(`viewLinkedItemsForCashFlow(${cashFlow.id})`)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        `;
        tbody.appendChild(row);
    });

    // עדכון מספר הפריטים
    const countElement = document.querySelector('.table-count');
    if (countElement) {
        countElement.textContent = `${cashFlowsData.length} תזרימים`;
    }
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updatePageSummaryStats() {
    if (!cashFlowsData) {
        cashFlowsData = [];
    }

    const totalCashFlows = cashFlowsData.length;
    const totalDeposits = cashFlowsData
        .filter(cf => cf.type === 'deposit')
        .reduce((sum, cf) => sum + parseFloat(cf.amount || 0), 0);
    const totalWithdrawals = cashFlowsData
        .filter(cf => cf.type === 'withdrawal')
        .reduce((sum, cf) => sum + parseFloat(cf.amount || 0), 0);
    const currentBalance = totalDeposits - totalWithdrawals;

    document.getElementById('totalCashFlows').textContent = totalCashFlows;
    document.getElementById('totalDeposits').textContent = formatAmount(totalDeposits);
    document.getElementById('totalWithdrawals').textContent = formatAmount(totalWithdrawals);
    document.getElementById('currentBalance').textContent = formatAmount(currentBalance);
}

// פונקציות הועברו ל-translation-utils.js:
// getTypeDisplayName -> translateCashFlowType
// getSourceDisplayName -> translateCashFlowSource

/**
 * פורמט סכום
 */
function formatAmount(amount) {
    // שימוש במערכת הפורמט החדשה
    if (window.formatCurrencyWithCommas) {
        return window.formatCurrencyWithCommas(amount, 'USD');
    }

    // גיבוי למערכת הישנה
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}



/**
 * קבלת סוג תזרים עם צבע
 */
function getCashFlowTypeWithColor(type) {
    const typeTranslation = window.translateCashFlowType ? window.translateCashFlowType(type) : type;

    let typeClass = '';
    switch (type) {
        case 'deposit':
            typeClass = 'type-investment'; // ירוק - הפקדה
            break;
        case 'withdrawal':
            typeClass = 'type-swing'; // כחול - משיכה
            break;
        case 'dividend':
            typeClass = 'type-passive'; // צהוב - דיבידנד
            break;
        case 'fee':
            typeClass = 'type-crypto'; // סגול - עמלה
            break;
        case 'interest':
            typeClass = 'type-investment'; // ירוק - ריבית
            break;
        default:
            typeClass = 'type-other';
    }

    return `<span class="${typeClass}"><strong>${typeTranslation}</strong></span>`;
}

/**
 * עיצוב סכום עם יישור נכון וצביעה
 */
function formatCashFlowAmount(amount) {
    if (!amount && amount !== 0) return '-';

    const numAmount = parseFloat(amount);
    const isPositive = numAmount >= 0;
    const absAmount = Math.abs(numAmount);

    // שימוש במערכת הפורמט החדשה
    if (window.formatCurrencyWithCommas) {
        const formattedAmount = window.formatCurrencyWithCommas(absAmount, 'USD');
        const displayAmount = `${isPositive ? '+' : '-'}${formattedAmount}`;

        // שימוש במערכת הצביעה החדשה
        if (window.colorAmountByValue) {
            return window.colorAmountByValue(numAmount, displayAmount);
        }
    }

    // עיצוב הסכום עם סימן בצד הנכון (שמאל)
    const formattedAmount = `${isPositive ? '+' : '-'}$${absAmount.toFixed(2)}`;

    // צביעה לפי סכום
    const colorClass = isPositive ? 'profit-positive' : 'profit-negative';

    return `<span class="${colorClass}">${formattedAmount}</span>`;
}

/**
 * עיצוב שער דולר עם 2 ספרות אחרי הנקודה
 */
function formatUsdRate(rate) {
    if (!rate) return '1.00';
    const numRate = parseFloat(rate);
    return numRate.toFixed(2);
}

// ========================================
// פונקציות עדכון טבלה
// ========================================

/**
 * עדכון טבלת תזרימי מזומנים
 * @param {Array} cashFlows - מערך של תזרימי מזומנים
 */
function updateCashFlowsTable(cashFlows) {

    // עדכון הנתונים הגלובליים
    window.cashFlowsData = cashFlows;
    cashFlowsData = cashFlows;

    // רינדור הטבלה
    renderCashFlowsTable();

    // עדכון סטטיסטיקות
    updatePageSummaryStats();
}

// הגדרת הפונקציה כגלובלית
window.updateCashFlowsTable = updateCashFlowsTable;

// פונקציית פילטור מקומי לתזרימי מזומנים
function filterCashFlowsLocally(cashFlows, selectedTypes, selectedAccounts, dateRange, searchTerm) {

    return cashFlows.filter(cashFlow => {
        // פילטר חיפוש
        if (searchTerm && searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase();
            const accountName = cashFlow.account_name || '';
            const description = cashFlow.description || '';
            const externalId = cashFlow.external_id || '';

            if (!accountName.toLowerCase().includes(searchLower) &&
                !description.toLowerCase().includes(searchLower) &&
                !externalId.toLowerCase().includes(searchLower)) {
                return false;
            }
        }

        // פילטר סוג (type)
        if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('הכול')) {
            const cashFlowType = cashFlow.type === 'deposit' ? 'הפקדה' :
                cashFlow.type === 'withdrawal' ? 'משיכה' :
                    cashFlow.type === 'dividend' ? 'דיבידנד' :
                        cashFlow.type === 'fee' ? 'עמלה' :
                            cashFlow.type === 'interest' ? 'ריבית' : cashFlow.type;

            if (!selectedTypes.includes(cashFlowType)) {
                return false;
            }
        }



        // פילטר חשבון
        if (selectedAccounts && selectedAccounts.length > 0 && !selectedAccounts.includes('הכול')) {
            const accountName = cashFlow.account_name || cashFlow.account_id || '';
            if (!selectedAccounts.includes(accountName)) {
                return false;
            }
        }

        // פילטר תאריך
        if (dateRange && dateRange !== 'כל זמן' && dateRange !== 'הכול') {
            const cashFlowDate = new Date(cashFlow.date);
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

            if (cashFlowDate < startDate || cashFlowDate >= endDate) {
                return false;
            }
        }

        return true;
    });
}

// הגדרת הפונקציה כגלובלית
window.filterCashFlowsLocally = filterCashFlowsLocally;

// ========================================
// אתחול הדף
// ========================================

// הפונקציה loadCashFlows הראשונה נשארת בשורה 241
// הפונקציה הכפולה נמחקה

/**
 * אתחול הדף
 */
async function initializeCashFlowsPage() {

    // טעינת מטבעות מהשרת
    await loadCurrenciesFromServer();

    // טעינת נתונים
    await loadCashFlows();

    // שחזור מצב הסגירה
    restoreCashFlowsSectionState();

    // שחזור מצב סידור
    restoreSortState();
}

// הפעלת אתחול כשהדף נטען
document.addEventListener('DOMContentLoaded', function () {
    initializeCashFlowsPage();
});

// ייצוא פונקציות גלובליות
window.openCashFlowDetails = openCashFlowDetails;
window.editCashFlow = editCashFlow;
window.deleteCashFlow = deleteCashFlow;
window.toggleTopSection = toggleTopSection;
window.toggleCashFlowsSection = toggleCashFlowsSection;
window.restoreCashFlowsSectionState = restoreCashFlowsSectionState;
window.saveCashFlow = saveCashFlow;
window.updateCashFlow = updateCashFlow;
window.confirmDeleteCashFlow = confirmDeleteCashFlow;
window.viewLinkedItemsForCashFlow = viewLinkedItemsForCashFlow;

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת תזרימי מזומנים
 * @param {number} columnIndex - אינדקס העמודה לסידור
 * 
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת חשבון
 * sortTable(2); // סידור לפי עמודת סכום
 * sortTable(4); // סידור לפי עמודת תאריך
 * 
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */
function sortTable(columnIndex) {

    if (typeof window.sortTableData === 'function') {
        window.sortTableData(
            columnIndex,
            window.cashFlowsData || [],
            'cash_flows',
            updateCashFlowsTable
        );
    } else {
        console.error('❌ sortTableData function not found in tables.js');
    }
}

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
function restoreSortState() {

    if (typeof window.restoreAnyTableSort === 'function') {
        window.restoreAnyTableSort('cash_flows', window.cashFlowsData || [], updateCashFlowsTable);
    } else {
        console.error('❌ restoreAnyTableSort function not found in main.js');
    }
}

// הגדרת הפונקציה כגלובלית
window.sortTable = sortTable;

// ========================================
// פונקציות לניהול שדה מזהה חיצוני
// ========================================

/**
 * ניהול שדה מזהה חיצוני בהתאם למקור
 * @param {string} source - מקור התזרים
 * @param {string} modalType - סוג המודל ('add' או 'edit')
 */
function manageExternalIdField(source, modalType) {
    const prefix = modalType === 'edit' ? 'edit' : '';
    const externalIdField = document.getElementById(`${prefix}CashFlowExternalId`);

    if (!externalIdField) {
        console.error(`❌ שדה מזהה חיצוני לא נמצא במודל ${modalType}`);
        return;
    }

    // אם המקור הוא ידני, השדה לא פעיל
    if (source === 'manual') {
        externalIdField.disabled = true;
        externalIdField.value = '0'; // ערך ברירת מחדל
        externalIdField.classList.add('form-control-disabled');
    } else {
        // אם המקור אינו ידני, השדה פעיל
        externalIdField.disabled = false;
        externalIdField.classList.remove('form-control-disabled');

        // אם השדה ריק, אפשר למשתמש להזין ערך
        if (externalIdField.value === '0') {
            externalIdField.value = '';
        }
    }
}

/**
 * הוספת event listeners לשדות מקור
 */
function setupSourceFieldListeners() {
    // למודל הוספה
    const addSourceField = document.getElementById('cashFlowSource');
    if (addSourceField) {
        addSourceField.addEventListener('change', function () {
            manageExternalIdField(this.value, 'add');
        });
    }

    // למודל עריכה
    const editSourceField = document.getElementById('editCashFlowSource');
    if (editSourceField) {
        editSourceField.addEventListener('change', function () {
            manageExternalIdField(this.value, 'edit');
        });
    }
}

/**
 * אתחול שדות מזהה חיצוני במודלים
 */
function initializeExternalIdFields() {
    // אתחול במודל הוספה
    const addSourceField = document.getElementById('cashFlowSource');
    if (addSourceField) {
        manageExternalIdField(addSourceField.value, 'add');
    }

    // אתחול במודל עריכה
    const editSourceField = document.getElementById('editCashFlowSource');
    if (editSourceField) {
        manageExternalIdField(editSourceField.value, 'edit');
    }
}

// עדכון פונקציית showAddCashFlowModal
function showAddCashFlowModal() {
    // איפוס הטופס
    document.getElementById('addCashFlowForm').reset();

    // הגדרת תאריך ברירת מחדל להיום
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('cashFlowDate').value = today;

    // טעינת רשימת החשבונות והמטבעות
    loadAccountsForCashFlow();
    loadCurrenciesForCashFlow();

    // אתחול שדה מזהה חיצוני
    initializeExternalIdFields();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addCashFlowModal'));
    modal.show();
}

// עדכון פונקציית showEditCashFlowModal
async function showEditCashFlowModal(id) {
    const cashFlow = cashFlowsData.find(cf => cf.id === id);
    if (!cashFlow) {
        console.error('❌ תזרים מזומנים לא נמצא:', id);
        return;
    }

    // טעינת רשימת החשבונות והמטבעות קודם
    await loadAccountsForEditCashFlow();
    await loadCurrenciesForEditCashFlow();

    // מילוי הטופס אחרי שהרשימות נטענו
    console.log('📝 מילוי טופס עריכה:', cashFlow);
    document.getElementById('editCashFlowId').value = cashFlow.id;
    document.getElementById('editCashFlowAccountId').value = cashFlow.account_id;
    document.getElementById('editCashFlowType').value = cashFlow.type;
    console.log('🔍 ערך type שנקבע:', cashFlow.type);
    document.getElementById('editCashFlowAmount').value = cashFlow.amount;
    document.getElementById('editCashFlowCurrencyId').value = cashFlow.currency_id || '';
    document.getElementById('editCashFlowDate').value = cashFlow.date;
    document.getElementById('editCashFlowDescription').value = cashFlow.description || '';
    document.getElementById('editCashFlowSource').value = cashFlow.source || 'manual';
    document.getElementById('editCashFlowExternalId').value = cashFlow.external_id || '0';

    // אתחול שדה מזהה חיצוני
    initializeExternalIdFields();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editCashFlowModal'));
    modal.show();
}

// עדכון פונקציית saveCashFlow
async function saveCashFlow() {
    try {
        // איסוף נתונים מהטופס
        const currencyIdValue = document.getElementById('cashFlowCurrencyId').value;
        const externalIdValue = document.getElementById('cashFlowExternalId').value;
        const formData = {
            account_id: parseInt(document.getElementById('cashFlowAccountId').value),
            type: document.getElementById('cashFlowType').value,
            amount: parseFloat(document.getElementById('cashFlowAmount').value),
            currency_id: currencyIdValue ? parseInt(currencyIdValue) : null,
            usd_rate: 1.000000,
            date: document.getElementById('cashFlowDate').value,
            description: document.getElementById('cashFlowDescription').value,
            source: document.getElementById('cashFlowSource').value,
            external_id: externalIdValue || '0'
        };

        // בדיקת תקינות מקיפה
        if (!validateCashFlowForm(formData)) {
            return;
        }

        const response = await fetch('http://localhost:8080/api/v1/cash_flows/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCashFlowModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            if (window.showSuccessNotification) {
                window.showSuccessNotification('תזרים מזומנים', 'תזרים המזומנים נשמר בהצלחה');
            } else {
                alert('תזרים המזומנים נשמר בהצלחה');
            }

            // טעינה מחדש של הנתונים
            await loadCashFlows();
        } else {
            console.error('❌ שגיאה בשמירת תזרים מזומנים:', result.error);

            // הצגת הודעת שגיאה
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת תזרים מזומנים');
            } else {
                alert('שגיאה בשמירת תזרים מזומנים');
            }
        }
    } catch (error) {
        console.error('❌ שגיאה בשמירת תזרים מזומנים:', error);

        // הצגת הודעת שגיאה
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת תזרים מזומנים');
        } else {
            alert('שגיאה בשמירת תזרים מזומנים');
        }
    }
}

// עדכון פונקציית updateCashFlow
async function updateCashFlow() {
    try {
        const id = parseInt(document.getElementById('editCashFlowId').value);

        // איסוף נתונים מהטופס
        const currencyIdValue = document.getElementById('editCashFlowCurrencyId').value;
        const externalIdValue = document.getElementById('editCashFlowExternalId').value;
        const formData = {
            account_id: parseInt(document.getElementById('editCashFlowAccountId').value),
            type: document.getElementById('editCashFlowType').value,
            amount: parseFloat(document.getElementById('editCashFlowAmount').value),
            currency_id: currencyIdValue ? parseInt(currencyIdValue) : null,
            usd_rate: 1.000000,
            date: document.getElementById('editCashFlowDate').value,
            description: document.getElementById('editCashFlowDescription').value,
            source: document.getElementById('editCashFlowSource').value,
            external_id: externalIdValue || '0'
        };

        console.log('📝 נתונים לעדכון:', formData);
        console.log('🔍 ערך type:', formData.type);
        console.log('🔍 ערך type מהשדה:', document.getElementById('editCashFlowType').value);

        // בדיקת תקינות מקיפה
        if (!validateEditCashFlowForm(formData)) {
            return;
        }

        const response = await fetch(`http://localhost:8080/api/v1/cash_flows/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editCashFlowModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            if (window.showSuccessNotification) {
                window.showSuccessNotification('תזרים מזומנים', 'תזרים המזומנים נעדכן בהצלחה');
            } else {
                alert('תזרים המזומנים נעדכן בהצלחה');
            }

            // טעינה מחדש של הנתונים
            await loadCashFlows();
        } else {
            console.error('❌ שגיאה בעדכון תזרים מזומנים:', result.error);

            // הצגת הודעת שגיאה
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון תזרים מזומנים');
            } else {
                alert('שגיאה בעדכון תזרים מזומנים');
            }
        }
    } catch (error) {
        console.error('❌ שגיאה בעדכון תזרים מזומנים:', error);

        // הצגת הודעת שגיאה
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון תזרים מזומנים');
        } else {
            alert('שגיאה בעדכון תזרים מזומנים');
        }
    }
}

// עדכון פונקציית initializeCashFlowsPage
async function initializeCashFlowsPage() {
    // טעינת מטבעות מהשרת
    await loadCurrenciesFromServer();

    // טעינת נתונים
    await loadCashFlows();

    // שחזור מצב הסגירה
    restoreCashFlowsSectionState();

    // שחזור מצב סידור
    restoreSortState();

    // הגדרת event listeners לשדות מקור
    setupSourceFieldListeners();
}

// ייצוא פונקציות גלובליות נוספות
window.manageExternalIdField = manageExternalIdField;
window.setupSourceFieldListeners = setupSourceFieldListeners;
window.initializeExternalIdFields = initializeExternalIdFields;
