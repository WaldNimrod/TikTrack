// ===== קובץ JavaScript לדף טיקרים =====

// משתנים גלובליים
if (!window.tickersData) {
    window.tickersData = [];
}
if (!window.currenciesData) {
    window.currenciesData = [];
}
if (!window.currenciesLoaded) {
    window.currenciesLoaded = false;
}
let tickersData = window.tickersData;

// פונקציה לטעינת מטבעות מהשרת
async function loadCurrenciesFromServer() {
    console.log('🔄 === Loading currencies from server ===');

    try {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://127.0.0.1:8080/api/v1/currencies/', {
            method: 'GET',
            headers: headers
        });

        console.log('🔄 Currencies response status:', response.status);

        if (response.ok) {
            const responseData = await response.json();
            console.log('🔄 Currencies response from server:', responseData);

            const currencies = responseData.data || responseData;
            window.currenciesData = currencies;
            window.currenciesLoaded = true;
            console.log('🔄 Currencies loaded from server:', currencies.length, 'currencies');
            console.log('🔄 Currencies details:', currencies);

            // עדכון אפשרויות בטופס
            updateCurrencyOptions();
        } else {
            console.log('🔄 Error loading currencies from server, status:', response.status);
            const errorText = await response.text();
            console.log('🔄 Error response:', errorText);
            // טעינת מטבעות ברירת מחדל
            window.currenciesData = [
                { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' }
            ];
            window.currenciesLoaded = true;

            // עדכון אפשרויות בטופס
            updateCurrencyOptions();
        }

    } catch (error) {
        console.log('🔄 Error loading currencies from server:', error);
        // טעינת מטבעות ברירת מחדל
        window.currenciesData = [
            { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' }
        ];
        window.currenciesLoaded = true;

        // עדכון אפשרויות בטופס
        updateCurrencyOptions();
    }
}

// פונקציה עזר להצגת מטבע
function getTickerCurrencyDisplay(ticker) {
    if (ticker.currency && ticker.currency.symbol) {
        // אם יש פרטי מטבע מלאים
        return ticker.currency.symbol;
    } else if (ticker.currency_id && window.currenciesData.length > 0) {
        // אם יש רק currency_id, נחפש את המטבע
        const currency = window.currenciesData.find(c => c.id === ticker.currency_id);
        if (currency) {
            return currency.symbol;
        }
    } else if (ticker.currency) {
        // fallback למטבע הישן
        return ticker.currency;
    }
    return '-';
}

// פונקציה ליצירת אפשרויות מטבע בטופס
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

// פונקציה לעדכון אפשרויות מטבע בטופס
function updateCurrencyOptions() {
    const addSelect = document.getElementById('addTickerCurrency');
    const editSelect = document.getElementById('editTickerCurrency');

    if (addSelect) {
        const addOptions = generateTickerCurrencyOptions();
        addSelect.innerHTML = '<option value="">בחר מטבע...</option>' + addOptions;
    }

    if (editSelect) {
        const editOptions = generateTickerCurrencyOptions();
        editSelect.innerHTML = '<option value="">בחר מטבע...</option>' + editOptions;
    }
}

// פונקציות בסיסיות
function openTickerDetails(id) {
    console.log('פתיחת פרטי תיקר:', id);
    showAddTickerModal();
}

function editTicker(id) {
    console.log('עריכת תיקר:', id);
    showEditTickerModal(id);
}

function deleteTicker(id) {
    console.log('מחיקת תיקר:', id);
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

    // ניקוי הטופס
    document.getElementById('addTickerForm').reset();
    clearTickerValidationErrors();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addTickerModal'));
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
        showNotification('❌ טיקר לא נמצא', 'error');
        return;
    }

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
        } else if (ticker.currency && ticker.currency.symbol) {
            // אם יש פרטי מטבע מלאים
            const currency = window.currenciesData.find(c => c.symbol === ticker.currency.symbol);
            if (currency) {
                currencySelect.value = currency.id;
            }
        } else if (ticker.currency) {
            // fallback למטבע הישן
            const currency = window.currenciesData.find(c => c.symbol === ticker.currency);
            if (currency) {
                currencySelect.value = currency.id;
            }
        }
    }

    document.getElementById('editTickerRemarks').value = ticker.remarks || '';

    clearTickerValidationErrors();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editTickerModal'));
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
        showNotification('❌ טיקר לא נמצא', 'error');
        return;
    }

    // מילוי המודל
    document.getElementById('deleteTickerId').value = ticker.id;
    document.getElementById('deleteTickerName').textContent = `${ticker.symbol} - ${ticker.name}`;

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('deleteTickerModal'));
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
 * ולידציה של שם טיקר
 */
function validateTickerName(input) {
    const name = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');

    if (!name) {
        showFieldError(input, errorElement, 'שם החברה הוא שדה חובה');
        return false;
    }

    if (name.length < 2 || name.length > 100) {
        showFieldError(input, errorElement, 'שם החברה חייב להיות בין 2 ל-100 תווים');
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
    if (!validateTickerSymbol(document.getElementById('addTickerSymbol')) ||
        !validateTickerName(document.getElementById('addTickerName')) ||
        !type || !currency_id) {
        showNotification('❌ יש לתקן את השגיאות בטופס', 'error');
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
            showNotification('✅ טיקר נשמר בהצלחה', 'success');

            // רענון הנתונים
            await loadTickersData();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה בשמירת טיקר:', error);
            showNotification('❌ שגיאה בשמירת טיקר: ' + error, 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה בשמירת טיקר:', error);
        showNotification('❌ שגיאה בשמירת טיקר', 'error');
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
    if (!validateTickerSymbol(document.getElementById('editTickerSymbol')) ||
        !validateTickerName(document.getElementById('editTickerName')) ||
        !type || !currency_id) {
        showNotification('❌ יש לתקן את השגיאות בטופס', 'error');
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
            showNotification('✅ טיקר עודכן בהצלחה', 'success');

            // רענון הנתונים
            await loadTickersData();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה בעדכון טיקר:', error);
            showNotification('❌ שגיאה בעדכון טיקר: ' + error, 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה בעדכון טיקר:', error);
        showNotification('❌ שגיאה בעדכון טיקר', 'error');
    }
}

/**
 * אישור מחיקת טיקר
 */
async function confirmDeleteTicker() {
    console.log('🔄 אישור מחיקת טיקר');

    const id = document.getElementById('deleteTickerId').value;

    try {
        const response = await fetch(`/api/v1/tickers/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('✅ טיקר נמחק בהצלחה');

            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteTickerModal'));
            modal.hide();

            // הצגת הודעת הצלחה
            showNotification('✅ טיקר נמחק בהצלחה', 'success');

            // רענון הנתונים
            await loadTickersData();

        } else {
            const errorResponse = await response.text();
            console.error('❌ שגיאה במחיקת טיקר:', errorResponse);

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
async function showLinkedItemsModal(tickerId, errorData) {
    console.log('🔄 הצגת מודל פריטים מקושרים לטיקר:', tickerId);

    // מציאת הטיקר לפי ID
    const ticker = tickersData.find(t => t.id == tickerId);
    if (!ticker) {
        showNotification('❌ טיקר לא נמצא', 'error');
        return;
    }

    // עדכון שם הטיקר
    document.getElementById('linkedTickerName').textContent = `${ticker.symbol} - ${ticker.name}`;

    // טעינת פרטי הפריטים המקושרים
    await loadLinkedItemsDetails(tickerId, errorData);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('linkedItemsModal'));
    modal.show();
}

/**
 * טעינת פרטי הפריטים המקושרים
 */
async function loadLinkedItemsDetails(tickerId, errorData = null) {
    console.log('🔄 טעינת פרטי פריטים מקושרים לטיקר:', tickerId);
    console.log('📊 errorData:', errorData);

    const contentDiv = document.getElementById('linkedItemsContent');
    contentDiv.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><br>טוען פרטים...</div>';

    try {
        // קריאה ל-API לקבלת פרטי הפריטים המקושרים
        const response = await fetch(`/api/v1/tickers/${tickerId}/linked-items`);

        if (response.ok) {
            const data = await response.json();
            console.log('📊 נתונים מהשרת:', data);
            displayLinkedItems(data.data);
        } else {
            console.log('⚠️ API לא זמין, מנסה לטעון ממקורות מרובים');
            // אם אין API ספציפי, ננסה לטעון מכל ה-APIs
            await loadLinkedItemsFromMultipleSources(tickerId);
        }

    } catch (error) {
        console.error('❌ שגיאה בטעינת פריטים מקושרים:', error);
        // אם יש שגיאה, ננסה לטעון מכל ה-APIs
        await loadLinkedItemsFromMultipleSources(tickerId);
    }
}

/**
 * טעינת פריטים מקושרים ממקורות מרובים
 */
async function loadLinkedItemsFromMultipleSources(tickerId) {
    console.log('🔄 טעינת פריטים מקושרים ממקורות מרובים');

    const ticker = tickersData.find(t => t.id == tickerId);
    if (!ticker) return;

    const linkedItems = {
        open_trades: [],
        open_trade_plans: [],
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
                linkedItems.open_trades = trades.filter(trade =>
                    trade.ticker_id == tickerId &&
                    (trade.status === 'open' || trade.status === 'pending')
                );
            }
        } catch (e) { console.warn('לא ניתן לטעון טריידים:', e); }

        // טעינת תכנונים
        try {
            const plansResponse = await fetch('/api/v1/trade_plans/');
            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                const plans = plansData.data || plansData;
                linkedItems.open_trade_plans = plans.filter(plan =>
                    plan.ticker_id == tickerId &&
                    (plan.status === 'open' || plan.status === 'pending')
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
                    alert.related_type_id === 4 && alert.related_id == tickerId &&
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
                    note.related_type_id === 4 && note.related_id == tickerId
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

    // טריידים פתוחים
    console.log('🔍 בדיקת טריידים פתוחים:', linkedItems.open_trades);
    console.log('🔍 האם קיים open_trades?', !!linkedItems.open_trades);
    console.log('🔍 אורך open_trades:', linkedItems.open_trades ? linkedItems.open_trades.length : 'undefined');
    if (linkedItems.open_trades && linkedItems.open_trades.length > 0) {
        console.log('✅ נמצאו טריידים פתוחים, יוצר HTML');
        html += `
            <div class="card mb-3">
                <div class="card-header bg-warning text-dark">
                    <h6 class="mb-0">🔄 טריידים פתוחים (${linkedItems.open_trades.length})</h6>
                </div>
                <div class="card-body">
                    <p><strong>נמצאו ${linkedItems.open_trades.length} טריידים פתוחים:</strong></p>
                    <ul>
                        ${linkedItems.open_trades.map(trade => `
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

    // תכנונים פתוחים
    console.log('🔍 בדיקת תכנונים פתוחים:', linkedItems.open_trade_plans);
    if (linkedItems.open_trade_plans && linkedItems.open_trade_plans.length > 0) {
        html += `
            <div class="card mb-3">
                <div class="card-header bg-info text-white">
                    <h6 class="mb-0">📋 תכנונים פתוחים (${linkedItems.open_trade_plans.length})</h6>
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
                                ${linkedItems.open_trade_plans.map(plan => `
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
    window.location.href = '/trades'; // ברירת מחדל - דף מעקב
}

/**
 * מעבר לטרייד ספציפי
 */
function goToTrade(tradeId) {
    window.location.href = `/trades#trade-${tradeId}`;
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
 * טעינת נתוני טיקרים
 */
async function loadTickersData() {
    try {
        console.log('🔄 טעינת נתוני טיקרים');

        const response = await fetch('/api/v1/tickers');
        if (response.ok) {
            const data = await response.json();
            tickersData = data.data || data;
            console.log('✅ נטענו', tickersData.length, 'טיקרים');

            // עדכון הטבלה
            updateTickersTable(tickersData);

        } else {
            console.error('❌ שגיאה בטעינת טיקרים');
            showNotification('❌ שגיאה בטעינת נתונים', 'error');
        }

    } catch (error) {
        console.error('❌ שגיאה בטעינת טיקרים:', error);
        showNotification('❌ שגיאה בטעינת נתונים', 'error');
    }
}

/**
 * עדכון טבלת טיקרים
 */
function updateTickersTable(tickers) {
    const tbody = document.querySelector('#tickersTable tbody');
    if (!tbody) return;

    if (tickers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">לא נמצאו טיקרים</td></tr>';
        return;
    }

    tbody.innerHTML = tickers.map(ticker => `
        <tr>
            <td><strong>${ticker.symbol}</strong></td>
            <td>${ticker.name}</td>
            <td>${ticker.type}</td>
            <td>${ticker.remarks || ''}</td>
            <td>${getTickerCurrencyDisplay(ticker)}</td>
            <td>${ticker.active_trades ? 'כן' : 'לא'}</td>
            <td>${formatDate(ticker.created_at)}</td>
            <td>${formatDate(ticker.updated_at)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editTicker(${ticker.id})" title="ערוך">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTicker(${ticker.id})" title="מחק">X</button>
            </td>
        </tr>
    `).join('');

    // עדכון הספירה
    const countElement = document.querySelector('.table-count');
    if (countElement) {
        countElement.textContent = `${tickers.length} טיקרים`;
    }
}

/**
 * עיצוב תאריך
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

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
window.showLinkedItemsModal = showLinkedItemsModal;
window.loadLinkedItemsDetails = loadLinkedItemsDetails;
window.displayLinkedItems = displayLinkedItems;
window.goToLinkedItems = goToLinkedItems;
window.goToTrade = goToTrade;
window.goToPlan = goToPlan;
window.goToAlert = goToAlert;
window.goToNote = goToNote;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === DOM CONTENT LOADED ===');

    // שחזור מצב הסגירה
    restoreTickersSectionState();

    // טעינת מטבעות
    loadCurrenciesFromServer();

    // טעינת נתונים
    loadTickersData();

    console.log('דף טיקרים נטען בהצלחה');
});
