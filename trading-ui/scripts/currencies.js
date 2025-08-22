// ===== קובץ JavaScript לדף מטבעות =====

// משתנים גלובליים
if (!window.currenciesData) {
    window.currenciesData = [];
}
let currenciesData = window.currenciesData;

// פונקציות בסיסיות
function openCurrencyDetails(id) {
    console.log('פתיחת פרטי מטבע:', id);
    showAddCurrencyModal();
}

function editCurrency(id) {
    console.log('עריכת מטבע:', id);
    showEditCurrencyModal(id);
}

function deleteCurrency(id) {
    console.log('מחיקת מטבע:', id);
    showDeleteCurrencyModal(id);
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleCurrenciesSection() {
    console.log('🔄 toggleCurrenciesSection נקראה');
    const contentSections = document.querySelectorAll('.content-section');
    console.log('📋 מספר content-sections נמצא:', contentSections.length);
    const currenciesSection = contentSections[0]; // הסקשן הראשון - מטבעות

    if (!currenciesSection) {
        console.error('❌ לא נמצא סקשן מטבעות');
        return;
    }
    console.log('✅ סקשן מטבעות נמצא:', currenciesSection);

    const sectionBody = currenciesSection.querySelector('.section-body');
    const toggleBtn = currenciesSection.querySelector('button[onclick="toggleCurrenciesSection()"]');
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
        localStorage.setItem('currenciesSectionCollapsed', !isCollapsed);
    }
}

// פונקציה לשחזור מצב הסגירה
function restoreCurrenciesSectionState() {
    // שחזור מצב סקשן מטבעות
    const currenciesCollapsed = localStorage.getItem('currenciesSectionCollapsed') === 'true';
    const contentSections = document.querySelectorAll('.content-section');
    const currenciesSection = contentSections[0];

    if (currenciesSection) {
        const sectionBody = currenciesSection.querySelector('.section-body');
        const toggleBtn = currenciesSection.querySelector('button[onclick="toggleCurrenciesSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && currenciesCollapsed) {
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
 * הצגת מודל הוספת מטבע
 */
function showAddCurrencyModal() {
    console.log('🔄 הצגת מודל הוספת מטבע');
    const modal = document.getElementById('addCurrencyModal');
    if (modal) {
        // איפוס הטופס
        document.getElementById('addCurrencyForm').reset();

        // הצגת המודל
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    } else {
        console.error('❌ לא נמצא מודל הוספת מטבע');
    }
}

/**
 * הצגת מודל עריכת מטבע
 */
function showEditCurrencyModal(id) {
    console.log('🔄 הצגת מודל עריכת מטבע:', id);

    const currency = currenciesData.find(c => c.id === id);
    if (!currency) {
        console.error('❌ מטבע לא נמצא:', id);
        return;
    }

    // מילוי הטופס
    document.getElementById('editCurrencyId').value = currency.id;
    document.getElementById('editCurrencySymbol').value = currency.symbol;
    document.getElementById('editCurrencyName').value = currency.name;
    document.getElementById('editCurrencyUsdRate').value = currency.usd_rate;

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editCurrencyModal'));
    modal.show();
}

/**
 * הצגת מודל מחיקת מטבע
 */
function showDeleteCurrencyModal(id) {
    console.log('🔄 הצגת מודל מחיקת מטבע:', id);

    const currency = currenciesData.find(c => c.id === id);
    if (!currency) {
        console.error('❌ מטבע לא נמצא:', id);
        return;
    }

    // מילוי פרטי המחיקה
    document.getElementById('deleteCurrencyId').value = currency.id;
    document.getElementById('deleteCurrencyName').textContent = `${currency.symbol} - ${currency.name}`;

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('deleteCurrencyModal'));
    modal.show();
}

// ========================================
// פונקציות API
// ========================================

/**
 * טעינת מטבעות מהשרת
 */
async function loadCurrencies() {
    try {
        console.log('🔄 טעינת מטבעות...');

        const response = await fetch('http://localhost:8080/api/v1/currencies/');
        console.log('📡 תגובת השרת:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log('📊 נתונים מהשרת:', result);

        if (result.status === 'success') {
            currenciesData = result.data;
            console.log('✅ מטבעות נטענו:', currenciesData.length);
            renderCurrenciesTable();
            updatePageSummaryStats();
        } else {
            console.error('❌ שגיאה בטעינת מטבעות:', result.error);
            // הצגת שגיאה למשתמש
            const tbody = document.querySelector('#currenciesTable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">שגיאה בטעינת נתונים: ' + result.error + '</td></tr>';
            }
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת מטבעות:', error);
        // הצגת שגיאה למשתמש
        const tbody = document.querySelector('#currenciesTable tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">שגיאה בטעינת נתונים: ' + error.message + '</td></tr>';
        }
    }
}

/**
 * שמירת מטבע חדש
 */
async function saveCurrency() {
    try {
        console.log('🔄 שמירת מטבע חדש...');

        const symbol = document.getElementById('currencySymbol').value.trim();
        const name = document.getElementById('currencyName').value.trim();
        const usdRate = parseFloat(document.getElementById('currencyUsdRate').value);

        // ולידציה
        if (!symbol || !name || isNaN(usdRate)) {
            alert('יש למלא את כל השדות');
            return;
        }

        const data = {
            symbol: symbol,
            name: name,
            usd_rate: usdRate
        };

        const response = await fetch('http://localhost:8080/api/v1/currencies/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === 'success') {
            console.log('✅ מטבע נשמר בהצלחה');

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCurrencyModal'));
            modal.hide();

            // טעינה מחדש של הנתונים
            await loadCurrencies();
        } else {
            console.error('❌ שגיאה בשמירת מטבע:', result.error);
            alert('שגיאה בשמירת מטבע');
        }
    } catch (error) {
        console.error('❌ שגיאה בשמירת מטבע:', error);
        alert('שגיאה בשמירת מטבע');
    }
}

/**
 * עדכון מטבע
 */
async function updateCurrency() {
    try {
        console.log('🔄 עדכון מטבע...');

        const id = parseInt(document.getElementById('editCurrencyId').value);
        const symbol = document.getElementById('editCurrencySymbol').value.trim();
        const name = document.getElementById('editCurrencyName').value.trim();
        const usdRate = parseFloat(document.getElementById('editCurrencyUsdRate').value);

        // ולידציה
        if (!symbol || !name || isNaN(usdRate)) {
            alert('יש למלא את כל השדות');
            return;
        }

        const data = {
            symbol: symbol,
            name: name,
            usd_rate: usdRate
        };

        const response = await fetch(`http://localhost:8080/api/v1/currencies/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === 'success') {
            console.log('✅ מטבע עודכן בהצלחה');

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editCurrencyModal'));
            modal.hide();

            // טעינה מחדש של הנתונים
            await loadCurrencies();
        } else {
            console.error('❌ שגיאה בעדכון מטבע:', result.error);
            alert('שגיאה בעדכון מטבע');
        }
    } catch (error) {
        console.error('❌ שגיאה בעדכון מטבע:', error);
        alert('שגיאה בעדכון מטבע');
    }
}

/**
 * מחיקת מטבע
 */
async function confirmDeleteCurrency() {
    try {
        console.log('🔄 מחיקת מטבע...');

        const id = parseInt(document.getElementById('deleteCurrencyId').value);

        const response = await fetch(`http://localhost:8080/api/v1/currencies/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.status === 'success') {
            console.log('✅ מטבע נמחק בהצלחה');

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteCurrencyModal'));
            modal.hide();

            // טעינה מחדש של הנתונים
            await loadCurrencies();
        } else {
            console.error('❌ שגיאה במחיקת מטבע:', result.error);
            alert('שגיאה במחיקת מטבע');
        }
    } catch (error) {
        console.error('❌ שגיאה במחיקת מטבע:', error);
        alert('שגיאה במחיקת מטבע');
    }
}

// ========================================
// פונקציות תצוגה
// ========================================

/**
 * רינדור טבלת מטבעות
 */
function renderCurrenciesTable() {
    const tbody = document.querySelector('#currenciesTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    currenciesData.forEach(currency => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${currency.id}</td>
            <td><strong>${currency.symbol}</strong></td>
            <td>${currency.name}</td>
            <td>${parseFloat(currency.usd_rate).toFixed(6)}</td>
            <td>${formatDateTime(currency.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editCurrency(${currency.id})" title="ערוך">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCurrency(${currency.id})" title="מחק">X</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // עדכון מספר הפריטים
    const countElement = document.querySelector('.table-count');
    if (countElement) {
        countElement.textContent = `${currenciesData.length} מטבעות`;
    }
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updatePageSummaryStats() {
    const totalCurrencies = currenciesData.length;
    const rates = currenciesData.map(c => parseFloat(c.usd_rate));
    const maxRate = rates.length > 0 ? Math.max(...rates) : 1.0;
    const minRate = rates.length > 0 ? Math.min(...rates) : 1.0;

    document.getElementById('totalCurrencies').textContent = totalCurrencies;
    document.getElementById('baseCurrency').textContent = 'USD';
    document.getElementById('maxRate').textContent = maxRate.toFixed(6);
    document.getElementById('minRate').textContent = minRate.toFixed(6);
}

/**
 * פורמט תאריך ושעה
 */
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('he-IL');
}

// ========================================
// פונקציות אתחול
// ========================================

/**
 * אתחול דף מטבעות
 */
async function initializeCurrenciesPage() {
    console.log('🔄 אתחול דף מטבעות...');

    // טעינת נתונים
    await loadCurrencies();

    // שחזור מצב הסגירה
    restoreCurrenciesSectionState();

    console.log('✅ דף מטבעות אותחל בהצלחה');
}
