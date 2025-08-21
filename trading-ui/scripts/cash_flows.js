// ===== קובץ JavaScript לדף תזרימי מזומנים =====

// משתנים גלובליים
if (!window.cashFlowsData) {
    window.cashFlowsData = [];
}
let cashFlowsData = window.cashFlowsData;

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

// פונקציה לשחזור מצב הסגירה
function restoreCashFlowsSectionState() {
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
            updateSummaryStats();
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
        row.innerHTML = `
            <td>${cashFlow.id}</td>
            <td>${cashFlow.account_id}</td>
            <td><strong>${getTypeDisplayName(cashFlow.type)}</strong></td>
            <td>${formatAmount(cashFlow.amount)}</td>
            <td>${cashFlow.currency_symbol || '-'}</td>
            <td>${cashFlow.usd_rate || '1.000000'}</td>
            <td>${formatDate(cashFlow.date)}</td>
            <td>${cashFlow.description || '-'}</td>
            <td>${getSourceDisplayName(cashFlow.source)}</td>
            <td>${cashFlow.external_id || '0'}</td>
            <td>${formatDateTime(cashFlow.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editCashFlow(${cashFlow.id})" title="ערוך">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCashFlow(${cashFlow.id})" title="מחק">X</button>
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
function updateSummaryStats() {
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

/**
 * המרת סוג תזרים לשם תצוגה
 */
function getTypeDisplayName(type) {
    const typeNames = {
        'deposit': 'הפקדה',
        'withdrawal': 'משיכה',
        'dividend': 'דיבידנד',
        'fee': 'עמלה',
        'other': 'אחר'
    };
    return typeNames[type] || type;
}

/**
 * המרת מקור לשם תצוגה
 */
function getSourceDisplayName(source) {
    const sourceNames = {
        'manual': 'ידני',
        'file_import': 'ייבוא מקובץ',
        'direct_import': 'ייבוא ישיר'
    };
    return sourceNames[source] || source;
}

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
// אתחול הדף
// ========================================

/**
 * אתחול הדף
 */
async function initializeCashFlowsPage() {
    console.log('🔄 אתחול דף תזרימי מזומנים...');

    // טעינת נתונים
    await loadCashFlows();

    // שחזור מצב הסגירה
    restoreCashFlowsSectionState();

    // טעינת מצב הסידור
    if (typeof loadSortState === 'function') {
        loadSortState('cashFlowsTable');
    }

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
window.toggleCashFlowsSection = toggleCashFlowsSection;
window.saveCashFlow = saveCashFlow;
window.updateCashFlow = updateCashFlow;
window.confirmDeleteCashFlow = confirmDeleteCashFlow;
