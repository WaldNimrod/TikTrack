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
    console.log('פתיחת פרטי תזרים מזומנים:', id);
    showAddCashFlowModal();
}

function editCashFlow(id) {
    console.log('עריכת תזרים מזומנים:', id);
    showEditCashFlowModal(id);
}

function deleteCashFlow(id) {
    console.log('מחיקת תזרים מזומנים:', id);
    showDeleteCashFlowModal(id);
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleTopSection() {
    console.log('🔄 toggleTopSection נקראה');
    const topSection = document.querySelector('.top-section');

    if (!topSection) {
        console.error('❌ לא נמצא top-section');
        return;
    }
    console.log('✅ top-section נמצא:', topSection);

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
    console.log('🔄 toggleCashFlowsSection נקראה');
    const contentSections = document.querySelectorAll('.content-section');
    console.log('📋 מספר content-sections נמצא:', contentSections.length);
    const cashFlowsSection = contentSections[0]; // הסקשן הראשון - תזרימי מזומנים

    if (!cashFlowsSection) {
        console.error('❌ לא נמצא סקשן תזרימי מזומנים');
        return;
    }
    console.log('✅ סקשן תזרימי מזומנים נמצא:', cashFlowsSection);

    const sectionBody = cashFlowsSection.querySelector('.section-body');
    const toggleBtn = cashFlowsSection.querySelector('button[onclick="toggleCashFlowsSection()"]');
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
    console.log('איפוס פילטרים');
}

// ========================================
// פונקציות מודלים
// ========================================

/**
 * הצגת מודל הוספת תזרים מזומנים
 */
function showAddCashFlowModal() {
    console.log('🔄 הצגת מודל הוספת תזרים מזומנים');

    // איפוס הטופס
    document.getElementById('addCashFlowForm').reset();

    // טעינת רשימת החשבונות והמטבעות
    loadAccountsForCashFlow();
    loadCurrenciesForCashFlow();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addCashFlowModal'));
    modal.show();
}

/**
 * הצגת מודל עריכת תזרים מזומנים
 */
function showEditCashFlowModal(id) {
    console.log('🔄 הצגת מודל עריכת תזרים מזומנים:', id);

    const cashFlow = cashFlowsData.find(cf => cf.id === id);
    if (!cashFlow) {
        console.error('❌ תזרים מזומנים לא נמצא:', id);
        return;
    }

    // מילוי הטופס
    document.getElementById('editCashFlowId').value = cashFlow.id;
    document.getElementById('editCashFlowAccountId').value = cashFlow.account_id;
    document.getElementById('editCashFlowType').value = cashFlow.type;
    document.getElementById('editCashFlowAmount').value = cashFlow.amount;
    document.getElementById('editCashFlowCurrencyId').value = cashFlow.currency_id || '';
    document.getElementById('editCashFlowDate').value = cashFlow.date;
    document.getElementById('editCashFlowDescription').value = cashFlow.description || '';
    document.getElementById('editCashFlowSource').value = cashFlow.source || 'manual';

    // טעינת רשימת החשבונות והמטבעות
    loadAccountsForEditCashFlow();
    loadCurrenciesForEditCashFlow();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editCashFlowModal'));
    modal.show();
}

/**
 * הצגת מודל מחיקת תזרים מזומנים
 */
function showDeleteCashFlowModal(id) {
    console.log('🔄 הצגת מודל מחיקת תזרים מזומנים:', id);

    const cashFlow = cashFlowsData.find(cf => cf.id === id);
    if (!cashFlow) {
        console.error('❌ תזרים מזומנים לא נמצא:', id);
        return;
    }

    // מילוי פרטי המחיקה
    document.getElementById('deleteCashFlowId').value = cashFlow.id;
    document.getElementById('deleteCashFlowName').textContent = `${cashFlow.type} - ${cashFlow.amount}`;

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('deleteCashFlowModal'));
    modal.show();
}

// ========================================
// פונקציות API
// ========================================

/**
 * טעינת תזרימי מזומנים מהשרת
 */
async function loadCashFlows() {
    try {
        console.log('🔄 טעינת תזרימי מזומנים...');

        const response = await fetch('http://localhost:8080/api/v1/cash_flows/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            cashFlowsData = result.data;
            console.log('✅ תזרימי מזומנים נטענו:', cashFlowsData.length);
            renderCashFlowsTable();
            updatePageSummaryStats();
        } else {
            console.error('❌ שגיאה בטעינת תזרימי מזומנים:', result.error);
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת תזרימי מזומנים:', error);
    }
}

/**
 * שמירת תזרים מזומנים חדש
 */
async function saveCashFlow() {
    try {
        console.log('🔄 שמירת תזרים מזומנים חדש...');

        // איסוף נתונים מהטופס
        const formData = {
            account_id: parseInt(document.getElementById('cashFlowAccountId').value),
            type: document.getElementById('cashFlowType').value,
            amount: parseFloat(document.getElementById('cashFlowAmount').value),
            currency_id: parseInt(document.getElementById('cashFlowCurrencyId').value),
            usd_rate: 1.000000, // כרגע תמיד 1
            date: document.getElementById('cashFlowDate').value,
            description: document.getElementById('cashFlowDescription').value,
            source: document.getElementById('cashFlowSource').value,
            external_id: '0' // כרגע תמיד 0
        };

        // בדיקת תקינות
        if (!formData.account_id || !formData.type || !formData.amount || !formData.currency_id || !formData.date) {
            alert('יש למלא את כל השדות הנדרשים');
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
            console.log('✅ תזרים מזומנים נשמר בהצלחה');

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCashFlowModal'));
            modal.hide();

            // טעינה מחדש של הנתונים
            await loadCashFlows();
        } else {
            console.error('❌ שגיאה בשמירת תזרים מזומנים:', result.error);
            alert('שגיאה בשמירת תזרים מזומנים');
        }
    } catch (error) {
        console.error('❌ שגיאה בשמירת תזרים מזומנים:', error);
        alert('שגיאה בשמירת תזרים מזומנים');
    }
}

/**
 * עדכון תזרים מזומנים
 */
async function updateCashFlow() {
    try {
        console.log('🔄 עדכון תזרים מזומנים...');

        const id = parseInt(document.getElementById('editCashFlowId').value);

        // איסוף נתונים מהטופס
        const formData = {
            account_id: parseInt(document.getElementById('editCashFlowAccountId').value),
            type: document.getElementById('editCashFlowType').value,
            amount: parseFloat(document.getElementById('editCashFlowAmount').value),
            currency_id: parseInt(document.getElementById('editCashFlowCurrencyId').value),
            usd_rate: 1.000000, // כרגע תמיד 1
            date: document.getElementById('editCashFlowDate').value,
            description: document.getElementById('editCashFlowDescription').value,
            source: document.getElementById('editCashFlowSource').value,
            external_id: '0' // כרגע תמיד 0
        };

        // בדיקת תקינות
        if (!formData.account_id || !formData.type || !formData.amount || !formData.currency_id || !formData.date) {
            alert('יש למלא את כל השדות הנדרשים');
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
            console.log('✅ תזרים מזומנים עודכן בהצלחה');

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editCashFlowModal'));
            modal.hide();

            // טעינה מחדש של הנתונים
            await loadCashFlows();
        } else {
            console.error('❌ שגיאה בעדכון תזרים מזומנים:', result.error);
            alert('שגיאה בעדכון תזרים מזומנים');
        }
    } catch (error) {
        console.error('❌ שגיאה בעדכון תזרים מזומנים:', error);
        alert('שגיאה בעדכון תזרים מזומנים');
    }
}

/**
 * מחיקת תזרים מזומנים
 */
async function confirmDeleteCashFlow() {
    try {
        console.log('🔄 מחיקת תזרים מזומנים...');

        const id = parseInt(document.getElementById('deleteCashFlowId').value);

        const response = await fetch(`http://localhost:8080/api/v1/cash_flows/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            console.log('✅ תזרים מזומנים נמחק בהצלחה');

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteCashFlowModal'));
            modal.hide();

            // טעינה מחדש של הנתונים
            await loadCashFlows();
        } else {
            console.error('❌ שגיאה במחיקת תזרים מזומנים:', result.error);
            alert('שגיאה במחיקת תזרים מזומנים');
        }
    } catch (error) {
        console.error('❌ שגיאה במחיקת תזרים מזומנים:', error);
        alert('שגיאה במחיקת תזרים מזומנים');
    }
}

// ========================================
// פונקציות עזר
// ========================================

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
        const response = await fetch('http://localhost:8080/api/v1/currencies/');
        if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
                const select = document.getElementById('cashFlowCurrencyId');
                select.innerHTML = '<option value="">בחר מטבע...</option>';

                result.data.forEach(currency => {
                    const option = document.createElement('option');
                    option.value = currency.id;
                    option.textContent = `${currency.symbol} - ${currency.name}`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('שגיאה בטעינת מטבעות:', error);
    }
}

/**
 * טעינת רשימת מטבעות למודל עריכה
 */
async function loadCurrenciesForEditCashFlow() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/currencies/');
        if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
                const select = document.getElementById('editCashFlowCurrencyId');
                select.innerHTML = '<option value="">בחר מטבע...</option>';

                result.data.forEach(currency => {
                    const option = document.createElement('option');
                    option.value = currency.id;
                    option.textContent = `${currency.symbol} - ${currency.name}`;
                    select.appendChild(option);
                });
            }
        }
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

    cashFlowsData.forEach(cashFlow => {
        const row = document.createElement('tr');
        const accountName = cashFlow.account_name || `חשבון ${cashFlow.account_id}`;
        const currencySymbol = cashFlow.currency_symbol || '$';

        row.innerHTML = `
            <td><strong>${accountName}</strong></td>
            <td><strong>${window.translateCashFlowType ? window.translateCashFlowType(cashFlow.type) : cashFlow.type}</strong></td>
            <td>${window.colorAmount(cashFlow.amount)}</td>
            <td>${currencySymbol}</td>
            <td>${cashFlow.usd_rate || '1.000000'}</td>
            <td>${formatDate(cashFlow.date)}</td>
            <td>${cashFlow.description || '-'}</td>
            <td>${window.translateCashFlowSource ? window.translateCashFlowSource(cashFlow.source) : cashFlow.source}</td>
            <td>${cashFlow.external_id || '0'}</td>
            <td>${formatDateTime(cashFlow.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editCashFlow(${cashFlow.id})" title="ערוך">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCashFlow(${cashFlow.id})" title="מחק">🗑️</button>
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
    const totalCashFlows = cashFlowsData.length;
    const totalDeposits = cashFlowsData
        .filter(cf => cf.type === 'deposit')
        .reduce((sum, cf) => sum + parseFloat(cf.amount), 0);
    const totalWithdrawals = cashFlowsData
        .filter(cf => cf.type === 'withdrawal')
        .reduce((sum, cf) => sum + parseFloat(cf.amount), 0);
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
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * פורמט תאריך
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
}

/**
 * פורמט תאריך ושעה
 */
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('he-IL');
}

// ========================================
// פונקציות עדכון טבלה
// ========================================

/**
 * עדכון טבלת תזרימי מזומנים
 * @param {Array} cashFlows - מערך של תזרימי מזומנים
 */
function updateCashFlowsTable(cashFlows) {
    console.log('🔄 עדכון טבלת תזרימי מזומנים עם', cashFlows.length, 'רשומות');

    const tbody = document.querySelector('#cashFlowsTable tbody');
    if (!tbody) {
        console.error('❌ לא נמצא tbody לטבלת תזרימי מזומנים');
        return;
    }

    if (cashFlows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">לא נמצאו תזרימי מזומנים</td></tr>';
        return;
    }

    tbody.innerHTML = cashFlows.map(cashFlow => {
        // המרת סוגים לעברית לפילטר
        const typeForFilter = cashFlow.type === 'deposit' ? 'הפקדה' :
            cashFlow.type === 'withdrawal' ? 'משיכה' :
                cashFlow.type === 'dividend' ? 'דיבידנד' :
                    cashFlow.type === 'fee' ? 'עמלה' :
                        cashFlow.type === 'interest' ? 'ריבית' : cashFlow.type;

        // המרת סטטוס לפילטר
        const statusForFilter = cashFlow.status === 'completed' ? 'הושלם' :
            cashFlow.status === 'pending' ? 'ממתין' :
                cashFlow.status === 'cancelled' ? 'בוטל' : cashFlow.status;

        return `
            <tr>
                <td data-account="${cashFlow.account_name || cashFlow.account_id || '-'}">${cashFlow.account_name || cashFlow.account_id || '-'}</td>
                <td data-type="${typeForFilter}">${cashFlow.type}</td>
                <td>${cashFlow.description || '-'}</td>
                <td>${window.colorAmount(cashFlow.amount || 0, `$${cashFlow.amount ? cashFlow.amount.toLocaleString() : '0'}`)}</td>
                <td data-status="${statusForFilter}">${cashFlow.status}</td>
                <td data-date="${cashFlow.date}">${formatDate(cashFlow.date)}</td>
                <td>${cashFlow.notes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editCashFlow(${cashFlow.id})" title="ערוך">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCashFlow(${cashFlow.id})" title="מחק">X</button>
                </td>
            </tr>
        `;
    }).join('');

    // עדכון הספירה
    const countElement = document.querySelector('.table-count');
    if (countElement) {
        countElement.textContent = `${cashFlows.length} תזרימי מזומנים`;
    }
}

// הגדרת הפונקציה כגלובלית
window.updateCashFlowsTable = updateCashFlowsTable;

// פונקציית פילטור מקומי לתזרימי מזומנים
function filterCashFlowsLocally(cashFlows, selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm) {
    console.log('🔍 filterCashFlowsLocally called with:', { selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm });

    return cashFlows.filter(cashFlow => {
        // פילטר חיפוש
        if (searchTerm && searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase();
            const accountName = cashFlow.account_name || '';
            const description = cashFlow.description || '';
            const notes = cashFlow.notes || '';

            if (!accountName.toLowerCase().includes(searchLower) &&
                !description.toLowerCase().includes(searchLower) &&
                !notes.toLowerCase().includes(searchLower)) {
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

        // פילטר סטטוס
        if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('הכול')) {
            const cashFlowStatus = cashFlow.status === 'completed' ? 'הושלם' :
                cashFlow.status === 'pending' ? 'ממתין' :
                    cashFlow.status === 'cancelled' ? 'בוטל' : cashFlow.status;

            if (!selectedStatuses.includes(cashFlowStatus)) {
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

/**
 * טעינת נתוני תזרימי מזומנים
 */
async function loadCashFlows() {
    try {
        console.log('🔄 טעינת נתוני תזרימי מזומנים...');

        const response = await fetch('/api/v1/cash_flows/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const cashFlows = data.data || data || [];

        console.log('✅ נטענו', cashFlows.length, 'תזרימי מזומנים');

        // עדכון המשתנה הגלובלי
        window.cashFlowsData = cashFlows;
        cashFlowsData = cashFlows;

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
                const filteredData = filterCashFlowsLocally(
                    cashFlows,
                    filters.status,
                    filters.type,
                    filters.account,
                    filters.dateRange,
                    filters.search
                );
                updateCashFlowsTable(filteredData);
                return;
            }
        }

        // עדכון הטבלה
        updateCashFlowsTable(cashFlows);

    } catch (error) {
        console.error('❌ שגיאה בטעינת תזרימי מזומנים:', error);

        // שימוש בנתוני דוגמה אם השרת לא זמין
        const sampleData = [
            {
                id: 1,
                account_name: 'חשבון ראשי',
                type: 'deposit',
                description: 'הפקדה ראשונית',
                amount: 10000,
                status: 'completed',
                date: '2025-01-15',
                notes: 'הפקדה ראשונית'
            }
        ];

        window.cashFlowsData = sampleData;
        cashFlowsData = sampleData;
        updateCashFlowsTable(sampleData);
    }
}

/**
 * אתחול הדף
 */
async function initializeCashFlowsPage() {
    console.log('🔄 אתחול דף תזרימי מזומנים...');

    // טעינת נתונים
    await loadCashFlows();

    // שחזור מצב הסגירה
    restoreCashFlowsSectionState();

    // שחזור מצב סידור
    restoreSortState();

    console.log('✅ דף תזרימי מזומנים אותחל בהצלחה');
}

// הפעלת אתחול כשהדף נטען
document.addEventListener('DOMContentLoaded', function () {
    console.log('📄 DOM נטען - אתחול דף תזרימי מזומנים');
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
    console.log(`🔄 sortTable נקראה עבור עמודה ${columnIndex}`);

    if (typeof window.sortTable === 'function') {
        window.sortTable(
            'cash_flows',
            columnIndex,
            window.cashFlowsData || [],
            updateCashFlowsTable
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
    console.log('🔄 Restoring sort state for cash flows table');

    if (typeof window.restoreAnyTableSort === 'function') {
        window.restoreAnyTableSort('cash_flows', window.cashFlowsData || [], updateCashFlowsTable);
    } else {
        console.error('❌ restoreAnyTableSort function not found in main.js');
    }
}

// הגדרת הפונקציה כגלובלית
window.sortTable = sortTable;
