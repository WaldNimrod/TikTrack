// ===== קובץ JavaScript לדף טיקרים =====
/*
 * Tickers.js - Tickers Page Management
 * ====================================
 * 
 * This file contains all tickers management functionality for the TikTrack application.
 * It handles tickers CRUD operations, table updates, and user interactions.
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * 
 * Table Mapping:
 * - Uses 'tickers' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * File: trading-ui/scripts/tickers.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// משתנים גלובליים
console.log('🔄 === TICKERS.JS LOADING STARTED ===');
if (!window.tickersData) {
    window.tickersData = [];
    console.log('🔄 יצירת window.tickersData חדש');
}
if (!window.currenciesData) {
    window.currenciesData = [];
    console.log('🔄 יצירת window.currenciesData חדש');
}
if (!window.currenciesLoaded) {
    window.currenciesLoaded = false;
    console.log('🔄 יצירת window.currenciesLoaded חדש');
}
let tickersData = window.tickersData;
console.log('🔄 tickersData נוצר:', tickersData);
console.log('🔄 window.tickersData:', window.tickersData);

// מפת צבעים לסוגי טיקרים
const tickerTypeColors = {
    'stock': { bg: '#e3f2fd', text: '#1976d2', label: 'מניה' },
    'etf': { bg: '#f3e5f5', text: '#7b1fa2', label: 'ETF' },
    'bond': { bg: '#e8f5e8', text: '#388e3c', label: 'אג"ח' },
    'crypto': { bg: '#fff3e0', text: '#f57c00', label: 'קריפטו' },
    'forex': { bg: '#fce4ec', text: '#c2185b', label: 'מטבע חוץ' },
    'commodity': { bg: '#f1f8e9', text: '#689f38', label: 'סחורה' },
    'other': { bg: '#fafafa', text: '#616161', label: 'אחר' }
};

/**
 * טעינת נתוני מטבעות מהשרת
 */
async function loadCurrenciesData() {
    console.log('🔄 === LOADCURRENCIESDATA STARTED ===');

    try {
        const response = await fetch('/api/v1/currencies/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        window.currenciesData = data.data || data;
        window.currenciesLoaded = true;

        console.log('✅ מטבעות נטענו:', window.currenciesData.length, 'מטבעות');

    } catch (error) {
        console.error('❌ שגיאה בטעינת מטבעות:', error);
        window.currenciesData = [];
        window.currenciesLoaded = false;
    }
}

/**
 * קבלת סמל מטבע לפי מזהה
 */
function getCurrencySymbol(currencyId) {
    if (!window.currenciesData || !window.currenciesLoaded) {
        return currencyId || 'N/A';
    }

    const currency = window.currenciesData.find(c => c.id == currencyId);
    return currency ? currency.symbol : (currencyId || 'N/A');
}

/**
 * קבלת עיצוב סוג טיקר
 */
function getTickerTypeStyle(type) {
    const typeConfig = tickerTypeColors[type] || tickerTypeColors['other'];
    return {
        backgroundColor: typeConfig.bg,
        color: typeConfig.text,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: '500',
        display: 'inline-block',
        minWidth: '60px',
        textAlign: 'center'
    };
}

/**
 * פונקציה ליצירת אפשרויות מטבע בטופס
 */
function generateTickerCurrencyOptions(ticker = null) {
    if (!window.currenciesData || window.currenciesData.length === 0) {
        // אם אין מטבעות, נחזיר ברירת מחדל
        return `
            <option value="1" ${ticker && (ticker.currency_id === 1 || (ticker.currency && ticker.currency.symbol === 'USD') || ticker.currency === 'USD') ? 'selected' : ''}>דולר אמריקאי (USD)</option>
        `;
    }

    return window.currenciesData.map(currency => {
        const isSelected = ticker && (
            ticker.currency_id === currency.id ||
            (ticker.currency && ticker.currency.symbol === currency.symbol) ||
            ticker.currency === currency.symbol
        );

        return `<option value="${currency.id}" ${isSelected ? 'selected' : ''}>${currency.name} (${currency.symbol})</option>`;
    }).join('');
}

/**
 * פונקציה לעדכון אפשרויות מטבע בטופס
 */
function updateCurrencyOptions(ticker = null) {
    const addSelect = document.getElementById('addTickerCurrency');
    const editSelect = document.getElementById('editTickerCurrency');

    if (addSelect) {
        const addOptions = generateTickerCurrencyOptions();
        addSelect.innerHTML = '<option value="">בחר מטבע...</option>' + addOptions;
    }

    if (editSelect) {
        const editOptions = generateTickerCurrencyOptions(ticker);
        editSelect.innerHTML = '<option value="">בחר מטבע...</option>' + editOptions;
    }
}

// פונקציה לעדכון שדה active_trades לפי טריידים פתוחים
async function updateActiveTradesField() {
    console.log('🔄 updateActiveTradesField נקראה');
    // Updating active_trades field for tickers

    try {
        // טעינת טריידים מהשרת
        const tradesResponse = await fetch('/api/v1/trades/');
        if (!tradesResponse.ok) {
            console.warn('⚠️ Could not load trades for active_trades update');
            return;
        }

        const tradesData = await tradesResponse.json();
        const trades = tradesData.data || tradesData;

        // יצירת מפה של טיקרים עם טריידים פתוחים
        const tickersWithOpenTrades = new Set();
        trades.forEach(trade => {
            if (trade.status === 'open' && trade.ticker_id) {
                tickersWithOpenTrades.add(trade.ticker_id);
            }
        });

        console.log('🔍 טיקרים עם טריידים פתוחים:', Array.from(tickersWithOpenTrades));

        // עדכון שדה active_trades בטיקרים בזיכרון
        tickersData.forEach(ticker => {
            const hasOpenTrades = tickersWithOpenTrades.has(ticker.id);
            ticker.active_trades = hasOpenTrades;
        });

        console.log('✅ שדה active_trades עודכן עבור כל הטיקרים');

        // עדכון סטטיסטיקות סיכום לאחר עדכון שדה active_trades
        updateTickersSummaryStats(tickersData);

    } catch (error) {
        console.error('❌ Error updating active_trades field:', error);
    }
}

// פונקציה לשחזור מצב הסגירה
function restoreTickersSectionState() {
    // שחזור מצב top-section (התראות וסיכום)
    const topCollapsed = localStorage.getItem('tickersTopSectionHidden') === 'true';
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

    // שחזור מצב סקשן הטיקרים
    const tickersCollapsed = localStorage.getItem('tickersSectionCollapsed') === 'true';
    const contentSections = document.querySelectorAll('.content-section');
    const tickersSection = contentSections[0];

    if (tickersSection) {
        const sectionBody = tickersSection.querySelector('.section-body');
        const toggleBtn = tickersSection.querySelector('button[onclick="toggleTickersSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && tickersCollapsed) {
            sectionBody.style.display = 'none';
            if (icon) {
                icon.textContent = '▼';
            }
        }
    }
}

// פונקציות נוספות
function openTickerDetails(id) {
    // פתיחת פרטי תיקר
    showAddTickerModal();
}

function editTicker(id) {
    // עריכת תיקר
    showEditTickerModal(id);
}

function deleteTicker(id) {
    // מחיקת תיקר
    showDeleteTickerModal(id);
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
        localStorage.setItem('tickersTopSectionHidden', !isCollapsed);
    }
}

function toggleTickersSection() {
    console.log('🔄 toggleTickersSection נקראה');
    const contentSections = document.querySelectorAll('.content-section');
    console.log('📋 מספר content-sections נמצא:', contentSections.length);
    const tickersSection = contentSections[0]; // הסקשן הראשון - טיקרים

    if (!tickersSection) {
        console.error('❌ לא נמצא סקשן טיקרים');
        return;
    }
    console.log('✅ סקשן טיקרים נמצא:', tickersSection);

    const sectionBody = tickersSection.querySelector('.section-body');
    const toggleBtn = tickersSection.querySelector('button[onclick="toggleTickersSection()"]');
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
        localStorage.setItem('tickersSectionCollapsed', !isCollapsed);
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
 * הצגת מודל הוספת טיקר
 */
function showAddTickerModal() {
    console.log('🔄 הצגת מודל הוספת טיקר');

    // עדכון אפשרויות מטבע לפני הצגת הטופס
    updateCurrencyOptions();

    // ניקוי הטופס
    document.getElementById('addTickerForm').reset();
    clearTickerValidationErrors();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addTickerModal'), {
        backdrop: true,
        keyboard: true
    });
    modal.show();
}

/**
 * הצגת מודל עריכת טיקר
 */
function showEditTickerModal(id) {
    console.log('🔄 הצגת מודל עריכת טיקר:', id);

    // מציאת הטיקר לפי ID
    const ticker = tickersData.find(t => t.id == id);
    if (!ticker) {
        if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ טיקר לא נמצא'); };
        return;
    }

    // עדכון אפשרויות מטבע לפני מילוי הטופס
    updateCurrencyOptions(ticker);

    // מילוי הטופס
    document.getElementById('editTickerId').value = ticker.id;
    document.getElementById('editTickerSymbol').value = ticker.symbol;
    document.getElementById('editTickerName').value = ticker.name;
    document.getElementById('editTickerType').value = ticker.type;

    // עדכון מטבע - תמיכה במערכת החדשה
    const currencySelect = document.getElementById('editTickerCurrency');
    if (currencySelect) {
        if (ticker.currency_id) {
            currencySelect.value = ticker.currency_id;
        }
    }

    document.getElementById('editTickerRemarks').value = ticker.remarks || '';

    clearTickerValidationErrors();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editTickerModal'), {
        backdrop: true,
        keyboard: true
    });
    modal.show();
}

/**
 * הצגת מודל מחיקת טיקר
 */
function showDeleteTickerModal(id) {
    console.log('🔄 הצגת מודל מחיקת טיקר:', id);

    // מציאת הטיקר לפי ID
    const ticker = tickersData.find(t => t.id == id);
    if (!ticker) {
        if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ טיקר לא נמצא'); };
        return;
    }

    // שימוש במערכת האזהרות המרכזית
    showDeleteWarning('ticker', `${ticker.symbol} - ${ticker.name}`,
        () => confirmDeleteTicker(ticker.id), // onConfirm callback
        () => console.log('מחיקת טיקר בוטלה') // onCancel callback
    );
}

// ========================================
// פונקציות ולידציה
// ========================================

/**
 * וולידציה מקיפה של טופס טיקר
 * @param {string} mode - 'add' או 'edit'
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateCompleteTickerForm(mode) {
    const prefix = mode === 'add' ? 'add' : 'edit';
    let isValid = true;

    // וולידציה של סמל טיקר
    const symbolField = document.getElementById(`${prefix}TickerSymbol`);
    if (!validateTickerSymbol(symbolField)) {
        isValid = false;
    }

    // וולידציה של שם טיקר
    const nameField = document.getElementById(`${prefix}TickerName`);
    if (!validateTickerName(nameField)) {
        isValid = false;
    }

    // וולידציה של סוג טיקר
    const typeField = document.getElementById(`${prefix}TickerType`);
    if (!typeField.value) {
        const errorElement = document.getElementById(typeField.id + 'Error');
        showFieldError(typeField, errorElement, 'יש לבחור סוג טיקר');
        isValid = false;
    } else {
        const errorElement = document.getElementById(typeField.id + 'Error');
        clearFieldError(typeField, errorElement);
    }

    // וולידציה של מטבע
    const currencyField = document.getElementById(`${prefix}TickerCurrency`);
    if (!currencyField.value || isNaN(parseInt(currencyField.value))) {
        const errorElement = document.getElementById(currencyField.id + 'Error');
        showFieldError(currencyField, errorElement, 'יש לבחור מטבע');
        isValid = false;
    } else {
        const errorElement = document.getElementById(currencyField.id + 'Error');
        clearFieldError(currencyField, errorElement);
    }

    // וולידציה של הערות (אופציונלי)
    const remarksField = document.getElementById(`${prefix}TickerRemarks`);
    if (remarksField.value && remarksField.value.length > 500) {
        const errorElement = document.getElementById(remarksField.id + 'Error');
        showFieldError(remarksField, errorElement, 'הערות ארוכות מדי (מקסימום 500 תווים)');
        isValid = false;
    } else if (remarksField.value) {
        const errorElement = document.getElementById(remarksField.id + 'Error');
        clearFieldError(remarksField, errorElement);
    }

    return isValid;
}

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

    if (!/^[A-Z0-9]+$/.test(symbol)) {
        showFieldError(input, errorElement, 'סמל טיקר יכול להכיל רק אותיות באנגלית ומספרים');
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
 * ולידציה של שם טיקר
 */
function validateTickerName(input) {
    const name = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!name) {
        showFieldError(input, errorElement, 'שם החברה הוא שדה חובה');
        return false;
    }

    if (name.length < 2 || name.length > 100) {  // Changed to 100
        showFieldError(input, errorElement, 'שם החברה חייב להיות בין 2 ל-100 תווים');  // Changed to 100
        return false;
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
function clearTickerValidationErrors() {
    const form = document.getElementById('addTickerForm');
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

    const editForm = document.getElementById('editTickerForm');
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

// ========================================
// פונקציות שמירה ועדכון
// ========================================

/**
 * שמירת טיקר חדש
 */
async function saveTicker() {
    console.log('🔄 שמירת טיקר חדש');

    // ולידציה
    const symbol = document.getElementById('addTickerSymbol').value.trim().toUpperCase();
    const name = document.getElementById('addTickerName').value.trim();
    const type = document.getElementById('addTickerType').value;
    const currency_id = parseInt(document.getElementById('addTickerCurrency').value);
    const remarks = document.getElementById('addTickerRemarks').value.trim();

    // בדיקת ולידציה
    if (!validateCompleteTickerForm('add')) {
        if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ יש לתקן את השגיאות בטופס'); };
        return;
    }

    try {
        const tickerData = {
            symbol: symbol,
            name: name,
            type: type,
            currency_id: currency_id,
            remarks: remarks || null
        };

        console.log('📤 שליחת נתונים:', tickerData);

        const response = await fetch('/api/v1/tickers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tickerData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ טיקר נשמר בהצלחה:', result);

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTickerModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            if (typeof window.showSuccessNotification === 'function') { window.showSuccessNotification('✅ טיקר נשמר בהצלחה'); };

            // רענון הנתונים
            await loadTickersData();

            // עדכון שדה active_trades
            await updateActiveTradesField();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה בשמירת טיקר:', error);
            if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ שגיאה בשמירת טיקר: ' + error); };
        }

    } catch (error) {
        console.error('❌ שגיאה בשמירת טיקר:', error);
        if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ שגיאה בשמירת טיקר'); };
    }
}

/**
 * עדכון טיקר קיים
 */
async function updateTicker() {
    console.log('🔄 עדכון טיקר');

    const id = document.getElementById('editTickerId').value;
    const symbol = document.getElementById('editTickerSymbol').value.trim().toUpperCase();
    const name = document.getElementById('editTickerName').value.trim();
    const type = document.getElementById('editTickerType').value;
    const currency_id = parseInt(document.getElementById('editTickerCurrency').value);
    const remarks = document.getElementById('editTickerRemarks').value.trim();

    // בדיקת ולידציה
    if (!validateCompleteTickerForm('edit')) {
        if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ יש לתקן את השגיאות בטופס'); };
        return;
    }

    try {
        const tickerData = {
            symbol: symbol,
            name: name,
            type: type,
            currency_id: currency_id,
            remarks: remarks || null
        };

        console.log('📤 שליחת נתונים לעדכון:', tickerData);

        const response = await fetch(`/api/v1/tickers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tickerData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ טיקר עודכן בהצלחה:', result);

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTickerModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            if (typeof window.showSuccessNotification === 'function') { window.showSuccessNotification('✅ טיקר עודכן בהצלחה'); };

            // רענון הנתונים
            await loadTickersData();

            // עדכון שדה active_trades
            await updateActiveTradesField();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה בעדכון טיקר:', error);
            if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ שגיאה בעדכון טיקר: ' + error); };
        }

    } catch (error) {
        console.error('❌ שגיאה בעדכון טיקר:', error);
        if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ שגיאה בעדכון טיקר'); };
    }
}

/**
 * אישור מחיקת טיקר
 */
async function confirmDeleteTicker(id) {
    console.log('🔄 אישור מחיקת טיקר:', id);

    try {
        const response = await fetch(`/api/v1/tickers/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('✅ טיקר נמחק בהצלחה');

            // הצגת הודעת הצלחה
            if (typeof window.showSuccessNotification === 'function') { window.showSuccessNotification('✅ טיקר נמחק בהצלחה'); };

            // רענון הנתונים
            await loadTickersData();

            // עדכון שדה active_trades
            await updateActiveTradesField();

        } else {
            const errorResponse = await response.text();
            console.error('❌ שגיאה במחיקת טיקר:', errorResponse);

            try {
                const errorData = JSON.parse(errorResponse);

                // בדיקה אם השגיאה קשורה לפריטים מקושרים
                if (errorData.error && errorData.error.message &&
                    errorData.error.message.includes('linked items')) {

                    // הצגת אזהרת פריטים מקושרים
                    if (typeof window.showLinkedItemsWarning === 'function') {
                        window.showLinkedItemsWarning('ticker', 5, // TODO: Get actual count
                            () => confirmDeleteTicker(id), // onConfirm callback
                            () => console.log('מחיקת טיקר בוטלה') // onCancel callback
                        );
                    } else {
                        console.error('❌ showLinkedItemsWarning function not available');
                    }
                    return;
                }

                if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ שגיאה במחיקת טיקר: ' + errorData.error.message); };

            } catch (parseError) {
                if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ שגיאה במחיקת טיקר: ' + errorResponse); };
            }
        }

    } catch (error) {
        console.error('❌ שגיאה במחיקת טיקר:', error);
        if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ שגיאה במחיקת טיקר'); };
    }
}

// ========================================
// פונקציות מודל פריטים מקושרים
// ========================================

/**
 * הצגת מודל פריטים מקושרים לטיקר
 */
async function showTickerLinkedItemsModal(tickerId, errorData) {
    console.log('🔄 הצגת מודל פריטים מקושרים לטיקר:', tickerId);

    // מציאת הטיקר לפי ID
    const ticker = tickersData.find(t => t.id == tickerId);
    if (!ticker) {
        if (typeof window.showErrorNotification === 'function') { window.showErrorNotification('❌ טיקר לא נמצא'); };
        return;
    }

    // טעינת פרטי הפריטים המקושרים
    const linkedItemsData = await loadLinkedItemsData(tickerId, errorData);
    
    // הצגת המודל המפורט
    if (typeof window.showLinkedItemsModal === 'function') {
        window.showLinkedItemsModal(linkedItemsData, 'ticker', tickerId);
    } else {
        console.error('❌ showLinkedItemsModal function not available');
        if (typeof window.showErrorNotification === 'function') { 
            window.showErrorNotification('❌ מערכת הפריטים המקושרים לא זמינה'); 
        }
    }
}

/**
 * טעינת נתוני פריטים מקושרים בפורמט הנכון
 */
async function loadLinkedItemsData(tickerId, errorData = null) {
    console.log('🔄 טעינת נתוני פריטים מקושרים לטיקר:', tickerId);
    
    const ticker = tickersData.find(t => t.id == tickerId);
    if (!ticker) return null;

    const linkedItems = [];

    try {
        // טעינת טריידים
        try {
            const tradesResponse = await fetch('/api/v1/trades/');
            if (tradesResponse.ok) {
                const tradesData = await tradesResponse.json();
                const trades = tradesData.data || tradesData;
                const tickerTrades = trades.filter(trade =>
                    trade.ticker_id == tickerId &&
                    (trade.status === 'open' || trade.status === 'pending')
                );
                
                tickerTrades.forEach(trade => {
                    linkedItems.push({
                        id: trade.id,
                        type: 'trade',
                        name: `${trade.symbol} - ${trade.side || 'לא מוגדר'}`,
                        status: trade.status,
                        side: trade.side,
                        amount: trade.amount,
                        created_at: trade.created_at
                    });
                });
            }
        } catch (e) { console.warn('לא ניתן לטעון טריידים:', e); }

        // טעינת תכנונים
        try {
            const plansResponse = await fetch('/api/v1/trade_plans/');
            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                const plans = plansData.data || plansData;
                const tickerPlans = plans.filter(plan =>
                    plan.ticker_id == tickerId &&
                    (plan.status === 'open' || plan.status === 'pending')
                );
                
                tickerPlans.forEach(plan => {
                    linkedItems.push({
                        id: plan.id,
                        type: 'trade_plan',
                        name: `${plan.investment_type || 'לא מוגדר'} - ${plan.strategy || 'לא מוגדר'}`,
                        status: plan.status,
                        strategy: plan.strategy,
                        investment_type: plan.investment_type,
                        created_at: plan.created_at
                    });
                });
            }
        } catch (e) { console.warn('לא ניתן לטעון תכנונים:', e); }

        // טעינת התראות
        try {
            const alertsResponse = await fetch('/api/v1/alerts/');
            if (alertsResponse.ok) {
                const alertsData = await alertsResponse.json();
                const alerts = alertsData.data || alertsData;
                const tickerAlerts = alerts.filter(alert =>
                    alert.related_type_id === 4 && alert.related_id == tickerId &&
                    alert.status === 'open'
                );
                
                tickerAlerts.forEach(alert => {
                    linkedItems.push({
                        id: alert.id,
                        type: 'alert',
                        name: `${alert.alert_type || 'לא מוגדר'} - ${alert.condition || 'לא מוגדר'}`,
                        status: alert.status,
                        alert_type: alert.alert_type,
                        condition: alert.condition,
                        created_at: alert.created_at
                    });
                });
            }
        } catch (e) { console.warn('לא ניתן לטעון התראות:', e); }

        // טעינת הערות
        try {
            const notesResponse = await fetch('/api/v1/notes/');
            if (notesResponse.ok) {
                const notesData = await notesResponse.json();
                const notes = notesData.data || notesData;
                const tickerNotes = notes.filter(note =>
                    note.related_type_id === 4 && note.related_id == tickerId
                );
                
                tickerNotes.forEach(note => {
                    linkedItems.push({
                        id: note.id,
                        type: 'note',
                        name: note.content ? note.content.substring(0, 50) + '...' : 'ללא כותרת',
                        content: note.content,
                        created_at: note.created_at
                    });
                });
            }
        } catch (e) { console.warn('לא ניתן לטעון הערות:', e); }

        return {
            tickerSymbol: ticker.symbol,
            tickerName: ticker.name,
            linkedItems: linkedItems
        };

    } catch (error) {
        console.error('❌ שגיאה בטעינת נתוני פריטים מקושרים:', error);
        return {
            tickerSymbol: ticker.symbol,
            tickerName: ticker.name,
            linkedItems: []
        };
    }
}

/**
 * הצגת פריטים מקושרים לטיקר
 */
function viewLinkedItemsForTicker(tickerId) {
    console.log('🔄 הצגת פריטים מקושרים לטיקר:', tickerId);
    showTickerLinkedItemsModal(tickerId);
}











// ========================================
// פונקציות עזר
// ========================================

/**
 * הצגת הודעה
 */


/**
 * טעינת נתוני טיקרים - גרסה פשוטה
 */
async function loadTickersData() {
    console.log('🔄 === LOADTICKERSDATA STARTED ===');

    try {
        // טעינת מטבעות אם עוד לא נטענו
        if (!window.currenciesLoaded) {
            console.log('🔄 טוען מטבעות...');
            await loadCurrenciesData();
        }

        console.log('🔄 מתחיל fetch ל-/api/v1/tickers/');
        const response = await fetch('/api/v1/tickers/');
        console.log('🔄 תגובה מהשרת:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🔄 נתונים מהשרת:', data);

        // שמירת הנתונים
        tickersData = data.data || data;
        window.tickersData = tickersData;
        console.log('🔄 tickersData נשמר:', tickersData.length, 'טיקרים');

        // עדכון הטבלה
        console.log('🔄 קורא ל-updateTickersTable');
        updateTickersTable(tickersData);

        // עדכון סטטיסטיקות סיכום
        console.log('🔄 קורא ל-updateTickersSummaryStats');
        updateTickersSummaryStats(tickersData);

        console.log('✅ loadTickersData הושלם בהצלחה');

    } catch (error) {
        console.error('❌ שגיאה ב-loadTickersData:', error);
        console.error('❌ Error stack:', error.stack);
    }
}

/**
 * עדכון סטטיסטיקות סיכום טיקרים
 */
function updateTickersSummaryStats(tickers) {
    console.log('🔄 === UPDATETICKERSSUMMARYSTATS STARTED ===');

    try {
        if (!tickers || tickers.length === 0) {
            // אם אין נתונים, אפס את כל השדות
            document.getElementById('totalTickers').textContent = '0';
            document.getElementById('activeTickers').textContent = '0';
            document.getElementById('latestUpdate').textContent = 'אין נתונים';
            document.getElementById('oldestUpdate').textContent = 'אין נתונים';
            return;
        }

        // חישוב סטטיסטיקות
        const totalTickers = tickers.length;
        const activeTickers = tickers.filter(ticker => ticker.active_trades).length;

        // חישוב תאריכי עדכון
        const validUpdatedDates = tickers
            .map(ticker => ticker.updated_at)
            .filter(date => date)
            .map(date => new Date(date))
            .filter(date => !isNaN(date.getTime()));

        let latestUpdate = 'אין נתונים';
        let oldestUpdate = 'אין נתונים';

        if (validUpdatedDates.length > 0) {
            const latest = new Date(Math.max(...validUpdatedDates));
            const oldest = new Date(Math.min(...validUpdatedDates));

            latestUpdate = latest.toLocaleDateString('he-IL');
            oldestUpdate = oldest.toLocaleDateString('he-IL');
        }

        // עדכון השדות ב-HTML
        document.getElementById('totalTickers').textContent = totalTickers;
        document.getElementById('activeTickers').textContent = activeTickers;
        document.getElementById('latestUpdate').textContent = latestUpdate;
        document.getElementById('oldestUpdate').textContent = oldestUpdate;

        console.log('✅ סטטיסטיקות סיכום עודכנו:', {
            totalTickers,
            activeTickers,
            latestUpdate,
            oldestUpdate
        });

    } catch (error) {
        console.error('❌ שגיאה בעדכון סטטיסטיקות סיכום:', error);
    }
}

/**
 * עדכון טבלת טיקרים - גרסה פשוטה
 */
function updateTickersTable(tickers) {
    console.log('🔄 === UPDATETICKERSTABLE STARTED ===');
    console.log('🔄 Input tickers:', tickers);
    console.log('🔄 tickers.length:', tickers ? tickers.length : 'undefined');

    try {
        // מציאת ה-tbody
        const tbody = document.querySelector('#tickersTable tbody');
        console.log('🔄 tbody element:', tbody);

        if (!tbody) {
            console.error('❌ לא נמצא tbody element!');
            return;
        }

        // בדיקה אם יש נתונים
        if (!tickers || tickers.length === 0) {
            console.log('🔄 אין נתונים, מציג הודעה');
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">לא נמצאו טיקרים</td></tr>';
            return;
        }

        console.log('🔄 מתחיל יצירת שורות טבלה...');

        // יצירת שורות עם עיצוב משופר
        const tableRows = tickers.map(ticker => {
            console.log('🔄 מעבד ticker:', ticker.symbol);

            // קבלת סמל מטבע
            const currencySymbol = getCurrencySymbol(ticker.currency_id);

            // קבלת עיצוב סוג טיקר
            const typeStyle = getTickerTypeStyle(ticker.type);
            const typeLabel = tickerTypeColors[ticker.type]?.label || ticker.type || 'N/A';

            return `
                <tr>
                    <td><strong>${ticker.symbol || 'N/A'}</strong></td>
                    <td>${ticker.active_trades ? '✅' : '❌'}</td>
                    <td>
                        <span style="background-color: ${typeStyle.backgroundColor}; color: ${typeStyle.color}; padding: ${typeStyle.padding}; border-radius: ${typeStyle.borderRadius}; font-size: ${typeStyle.fontSize}; font-weight: ${typeStyle.fontWeight}; display: ${typeStyle.display}; min-width: ${typeStyle.minWidth}; text-align: ${typeStyle.textAlign};">
                            ${typeLabel}
                        </span>
                    </td>
                    <td><strong>${currencySymbol}</strong></td>
                    <td>${ticker.updated_at ? new Date(ticker.updated_at).toLocaleString('he-IL') : 'N/A'}</td>
                    <td>${ticker.name || 'N/A'}</td>
                    <td>${ticker.created_at ? new Date(ticker.created_at).toLocaleDateString('he-IL') : 'N/A'}</td>
                    <td>${ticker.remarks || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewLinkedItemsForTicker(${ticker.id})" title="פריטים מקושרים">🔗</button>
                        <button class="btn btn-sm btn-secondary" onclick="showEditTickerModal(${ticker.id})" title="ערוך">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteTicker(${ticker.id})" title="מחק">🗑️</button>
                    </td>
                </tr>
            `;
        });

        console.log('🔄 tableRows נוצר, אורך:', tableRows.length);

        // עדכון הטבלה
        const finalHTML = tableRows.join('');
        tbody.innerHTML = finalHTML;
        console.log('🔄 tbody.innerHTML עודכן');

        // עדכון הספירה
        const countElement = document.querySelector('.table-count');
        if (countElement) {
            countElement.textContent = `${tickers.length} טיקרים`;
            console.log('🔄 ספירה עודכנה:', tickers.length);
        }

        // עדכון סטטיסטיקות סיכום
        updateTickersSummaryStats(tickers);

        console.log('✅ updateTickersTable הושלם בהצלחה');

    } catch (error) {
        console.error('❌ שגיאה ב-updateTickersTable:', error);
        console.error('❌ Error stack:', error.stack);
    }
}



// פונקציית פילטור מקומי לטיקרים
function filterTickersLocally(tickers, selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm) {
    console.log('🔍 filterTickersLocally called with:', { selectedStatuses, selectedTypes, selectedAccounts, dateRange, searchTerm });

    return tickers.filter(ticker => {
        // פילטר חיפוש
        if (searchTerm && searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase();
            const symbol = ticker.symbol || '';
            const name = ticker.name || '';
            const remarks = ticker.remarks || '';

            if (!symbol.toLowerCase().includes(searchLower) &&
                !name.toLowerCase().includes(searchLower) &&
                !remarks.toLowerCase().includes(searchLower)) {
                return false;
            }
        }

        // פילטר סוג (type)
        if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('הכול')) {
            const tickerType = ticker.type === 'stock' ? 'מניה' :
                ticker.type === 'etf' ? 'ETF' :
                    ticker.type === 'bond' ? 'אג"ח' :
                        ticker.type === 'crypto' ? 'קריפטו' : ticker.type;

            if (!selectedTypes.includes(tickerType)) {
                return false;
            }
        }

        // פילטר סטטוס
        if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('הכול')) {
            const tickerStatus = ticker.active_trades ? 'פעיל' : 'לא פעיל';

            if (!selectedStatuses.includes(tickerStatus)) {
                return false;
            }
        }

        // פילטר תאריך
        if (dateRange && dateRange !== 'כל זמן' && dateRange !== 'הכול') {
            const tickerDate = new Date(ticker.created_at);
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

            if (tickerDate < startDate || tickerDate >= endDate) {
                return false;
            }
        }

        return true;
    });
}

// הגדרת הפונקציה כגלובלית
window.filterTickersLocally = filterTickersLocally;
window.updateActiveTradesField = updateActiveTradesField;

// הגדרת הפונקציות כגלובליות
window.openTickerDetails = openTickerDetails;
window.editTicker = editTicker;
window.deleteTicker = deleteTicker;
window.toggleTopSection = toggleTopSection;
window.toggleTickersSection = toggleTickersSection;
window.restoreTickersSectionState = restoreTickersSectionState;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;

// פונקציות מודלים
window.showAddTickerModal = showAddTickerModal;
window.showEditTickerModal = showEditTickerModal;
window.showDeleteTickerModal = showDeleteTickerModal;
window.saveTicker = saveTicker;
window.updateTicker = updateTicker;
window.confirmDeleteTicker = confirmDeleteTicker;

// פונקציות ולידציה
window.validateTickerSymbol = validateTickerSymbol;
window.validateTickerName = validateTickerName;

// פונקציות מודל פריטים מקושרים
window.showTickerLinkedItemsModal = showTickerLinkedItemsModal;
window.loadLinkedItemsData = loadLinkedItemsData;
window.viewLinkedItemsForTicker = viewLinkedItemsForTicker;

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת טיקרים
 * @param {number} columnIndex - אינדקס העמודה לסידור
 * 
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת סימבול
 * sortTable(1); // סידור לפי עמודת שם
 * sortTable(2); // סידור לפי עמודת סוג
 * 
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */
function sortTable(columnIndex) {
    console.log(`🔄 sortTable נקראה עבור עמודה ${columnIndex}`);

    if (typeof window.sortTableData === 'function') {
        window.sortTableData(
            columnIndex,
            window.tickersData || [],
            'tickers',
            updateTickersTable
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
    console.log('🔄 Restoring sort state for tickers table');

    if (typeof window.restoreAnyTableSort === 'function') {
        window.restoreAnyTableSort('tickers', window.tickersData || [], updateTickersTable);
    } else {
        console.error('❌ restoreAnyTableSort function not found in main.js');
    }
}

// הגדרת הפונקציות כגלובליות
window.sortTable = sortTable;
window.updateTickersSummaryStats = updateTickersSummaryStats;
window.loadCurrenciesData = loadCurrenciesData;
window.getCurrencySymbol = getCurrencySymbol;
window.getTickerTypeStyle = getTickerTypeStyle;
window.generateTickerCurrencyOptions = generateTickerCurrencyOptions;
window.updateCurrencyOptions = updateCurrencyOptions;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === DOM CONTENT LOADED ===');

    // שחזור מצב הסגירה
    restoreTickersSectionState();

    // טעינת נתונים
    console.log('🔄 קורא ל-loadTickersData...');
    loadTickersData();

    // שחזור מצב סידור
    restoreSortState();

    console.log('דף טיקרים נטען בהצלחה');
});
