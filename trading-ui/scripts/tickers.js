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
 * - notification-system.js (for linked items warnings)
 * - linked-items.js (for linked items modal display)
 * 
 * Table Mapping:
 * - Uses 'tickers' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * Linked Items Integration:
 * - Delete operations trigger linked items warning via notification-system.js
 * - Advanced modal display handled by linked-items.js
 * - Color-coded badges and responsive design
 * 
 * File: trading-ui/scripts/tickers.js
 * Version: 1.9.9
 * Last Updated: August 26, 2025
 */

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
 * קבלת עיצוב סטטוס טיקר
 */
function getTickerStatusStyle(status) {
    const statusConfig = {
        'open': { bg: '#e8f5e8', text: '#388e3c' },
        'closed': { bg: '#fff3cd', text: '#856404' },
        'canceled': { bg: '#ffebee', text: '#d32f2f' }
    };
    
    const config = statusConfig[status] || statusConfig['open'];
    return {
        backgroundColor: config.bg,
        color: config.text,
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
 * קבלת תווית סטטוס טיקר
 */
function getTickerStatusLabel(status) {
    const labels = {
        'open': 'פתוח',
        'closed': 'סגור',
        'canceled': 'מבוטל'
    };
    return labels[status] || 'פתוח';
}

/**
 * פונקציה ליצירת אפשרויות מטבע בטופס
 */
function generateTickerCurrencyOptions(ticker = null) {
    let options = '';
    
    // בדיקה אם יש נתוני מטבעות
    if (window.currenciesData && window.currenciesData.length > 0) {
        window.currenciesData.forEach(currency => {
            // בדיקה אם המטבע נבחר לטיקר הנוכחי
            const isSelected = ticker && (
                ticker.currency_id === currency.id || 
                (ticker.currency && ticker.currency.symbol === currency.symbol) || 
                ticker.currency === currency.symbol
            );
            
            options += `<option value="${currency.id}" ${isSelected ? 'selected' : ''}>${currency.name} (${currency.symbol})</option>`;
        });
    } else {
        // fallback - רק דולר אמריקאי אם אין נתונים
        const isSelected = ticker && (
            ticker.currency_id === 1 || 
            (ticker.currency && ticker.currency.symbol === 'USD') || 
            ticker.currency === 'USD'
        );
        options = `<option value="1" ${isSelected ? 'selected' : ''}>דולר אמריקאי (USD)</option>`;
    }
    
    return options;
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
        console.log('🔄 נתוני טריידים מהשרת:', tradesData);
        
        const trades = tradesData.data || tradesData;
        console.log('🔄 מערך טריידים:', trades);

        // יצירת מפה של טיקרים עם טריידים פתוחים
        const tickersWithOpenTrades = new Set();
        trades.forEach(trade => {
            console.log('🔄 בודק טרייד:', trade);
            if (trade.status === 'open' && trade.ticker_id) {
                tickersWithOpenTrades.add(trade.ticker_id);
                console.log('✅ הוספת ticker_id:', trade.ticker_id, 'למפה');
            }
        });

        console.log('🔍 טיקרים עם טריידים פתוחים:', Array.from(tickersWithOpenTrades));

        // עדכון שדה active_trades בטיקרים בזיכרון
        console.log('🔄 מתחיל עדכון טיקרים, מספר טיקרים:', tickersData.length);
        tickersData.forEach(ticker => {
            const hasOpenTrades = tickersWithOpenTrades.has(ticker.id);
            console.log(`🔄 טיקר ${ticker.symbol} (ID: ${ticker.id}): hasOpenTrades = ${hasOpenTrades}`);
            ticker.active_trades = hasOpenTrades;
        });

        console.log('✅ שדה active_trades עודכן עבור כל הטיקרים');

        // עדכון סטטיסטיקות סיכום לאחר עדכון שדה active_trades
        updateTickersSummaryStats(tickersData);

    } catch (error) {
        console.error('❌ Error updating active_trades field:', error);
    }
}

/**
 * עדכון אוטומטי של שדה active_trades לטיקר ספציפי
 */
async function updateTickerActiveTradesStatus(tickerId) {
    console.log('🔄 עדכון אוטומטי של שדה active_trades לטיקר:', tickerId);
    try {
        const response = await fetch(`/api/v1/tickers/${tickerId}/update-active-trades`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ שדה active_trades עודכן לטיקר:', result);
            
            // רענון הנתונים
            await loadTickersData();
        } else {
            console.error('❌ שגיאה בעדכון שדה active_trades לטיקר:', response.status);
        }
    } catch (error) {
        console.error('❌ שגיאה בעדכון שדה active_trades לטיקר:', error);
    }
}

/**
 * עדכון אוטומטי של כל שדות active_trades
 */
async function updateAllActiveTradesStatuses() {
    console.log('🔄 עדכון אוטומטי של כל שדות active_trades');
    try {
        const response = await fetch('/api/v1/tickers/update-all-active-trades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ כל שדות active_trades עודכנו:', result);
            
            // רענון הנתונים
            await loadTickersData();
        } else {
            console.error('❌ שגיאה בעדכון כל שדות active_trades:', response.status);
        }
    } catch (error) {
        console.error('❌ שגיאה בעדכון כל שדות active_trades:', error);
    }
}

// פונקציה לשחזור מצב הסגירה - שימוש בפונקציות הגלובליות
function restoreTickersSectionState() {
    // שחזור מצב הסקשן העליון
    if (typeof window.restoreAllSectionStates === 'function') {
        window.restoreAllSectionStates();
    } else {
        console.warn('⚠️ restoreAllSectionStates function not available globally');
    }
    
    // שחזור מצב הסקשנים הפנימיים
    if (typeof window.restoreSectionStates === 'function') {
        window.restoreSectionStates();
    } else {
        console.warn('⚠️ restoreSectionStates function not available globally');
    }
}

// פונקציות נוספות

// פונקציות לפתיחה/סגירה של סקשנים - משתמשות בפונקציות הגלובליות
function toggleTopSection() {
    // קריאה לפונקציה הגלובלית מ-main.js
    if (typeof window.toggleTopSectionGlobal === 'function') {
        window.toggleTopSectionGlobal();
    } else {
        console.error('❌ toggleTopSectionGlobal function not found in main.js');
    }
}

function toggleTickersSection() {
    if (typeof window.toggleMainSection === 'function') {
        window.toggleMainSection();
    } else {
        console.error('❌ toggleMainSection function not found in main.js');
    }
}

// פונקציות נוספות

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
    
    // ניקוי וולידציה
    if (window.clearValidation) {
        window.clearValidation('addTickerForm');
    }

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
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
        }
        return;
    }

    // עדכון אפשרויות מטבע לפני מילוי הטופס
    updateCurrencyOptions(ticker);

    // ניקוי וולידציה
    if (window.clearValidation) {
        window.clearValidation('editTickerForm');
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
        }
    }

    // עדכון סטטוס - המרה ל"לא מבוטל" או "מבוטל"
    const statusSelect = document.getElementById('editTickerStatus');
    if (statusSelect) {
        if (ticker.status === 'canceled') {
            statusSelect.value = 'canceled';
        } else {
            statusSelect.value = 'not_canceled';
        }
    }

    document.getElementById('editTickerRemarks').value = ticker.remarks || '';

    // ניקוי שגיאות ולידציה
    if (window.clearValidation) {
        window.clearValidation('editTickerForm');
    }

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editTickerModal'), {
        backdrop: true,
        keyboard: true
    });
    modal.show();
}

/**
 * מחיקת טיקר - wrapper לפונקציה showDeleteTickerModal
 */
function deleteTicker(id) {
    console.log('🔄 deleteTicker נקראה עבור ID:', id);
    showDeleteTickerModal(id);
}

/**
 * הצגת מודל מחיקת טיקר
 */
function showDeleteTickerModal(id) {
    console.log('🔄 הצגת מודל מחיקת טיקר:', id);

    // מציאת הטיקר לפי ID
    const ticker = tickersData.find(t => t.id == id);
    if (!ticker) {
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
        }
        return;
    }

    // שימוש במערכת האזהרות המרכזית
    if (window.showDeleteWarning) {
        window.showDeleteWarning('ticker', `${ticker.symbol} - ${ticker.name}`, 'טיקר',
            () => confirmDeleteTicker(ticker.id), // onConfirm callback
            () => console.log('מחיקת טיקר בוטלה') // onCancel callback
        );
    } else {
        console.error('❌ showDeleteWarning function not found');
        // fallback - הצגת המודל הישן
        const modal = new bootstrap.Modal(document.getElementById('deleteTickerModal'));
        modal.show();
    }
}

// ========================================
// פונקציות ולידציה
// ========================================

/**
 * וולידציה מקיפה של טופס טיקר
 * @param {string} mode - 'add' או 'edit'
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */








// ========================================
// פונקציות שמירה ועדכון
// ========================================

/**
 * שמירת טיקר חדש
 * 
 * Note: updated_at field is NOT set during creation - it's reserved for future pricing system updates
 */
async function saveTicker() {
    console.log('🔄 שמירת טיקר חדש');

    // ולידציה
    const symbol = document.getElementById('addTickerSymbol').value.trim().toUpperCase();
    const name = document.getElementById('addTickerName').value.trim();
    const type = document.getElementById('addTickerType').value;
    const currency_id = parseInt(document.getElementById('addTickerCurrency').value);
    const remarks = document.getElementById('addTickerRemarks').value.trim();

    // ולידציה גלובלית
    if (window.validateForm) {
        if (!window.validateForm('addTickerForm')) {
            return;
        }
    }

    // בדיקה אם הסמל כבר קיים במערכת
    const existingTicker = tickersData.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
    if (existingTicker) {
        if (window.showErrorNotification) {
            window.showErrorNotification(
                'שגיאת וולידציה', 
                `הסמל ${symbol} כבר קיים במערכת (טיקר: ${existingTicker.name})`
            );
        }
        return;
    }

    // טיקר חדש תמיד יהיה "closed" (אין לו טריידים)
    const finalStatus = 'closed';

    try {
        const tickerData = {
            symbol: symbol,
            name: name,
            type: type,
            currency_id: currency_id,
            status: finalStatus,
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
            if (window.showSuccessNotification) { 
                window.showSuccessNotification('הצלחה', `טיקר ${symbol} נוסף בהצלחה למערכת`); 
            }

            // רענון הנתונים
            await loadTickersData();

            // עדכון שדה active_trades
            await updateActiveTradesField();

        } else {
            const errorText = await response.text();
            console.error('❌ שגיאה בשמירת טיקר:', errorText);
            
            // ניסיון לפרסר את השגיאה JSON
            let errorMessage = 'שגיאה בשמירת טיקר';
            try {
                const errorData = JSON.parse(errorText);
                if (errorData.error && errorData.error.message) {
                    // בדיקה אם זו שגיאת UNIQUE constraint
                    if (errorData.error.message.includes('UNIQUE constraint failed: tickers.symbol')) {
                        errorMessage = 'הסמל כבר קיים במערכת';
                    } else {
                        errorMessage = errorData.error.message;
                    }
                }
            } catch (e) {
                // אם לא ניתן לפרסר JSON, השתמש בטקסט המקורי
                errorMessage = errorText;
            }
            
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בשמירה', errorMessage);
            }
        }

    } catch (error) {
        console.error('❌ שגיאה בשמירת טיקר:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת טיקר');
        }
    }
}

/**
 * עדכון טיקר קיים
 * 
 * כולל ולידציה של פריטים מקושרים באמצעות המערכת הכללית:
 * - API: /api/v1/linked-items/ticker/{id}
 * - פונקציה: window.showLinkedItemsWarning('ticker', id)
 * - מונע ביטול כאשר יש פריטים פתוחים
 * 
 * Note: updated_at field is NOT modified during user updates - it's reserved for future pricing system updates
 */
async function updateTicker() {
    console.log('🔄 עדכון טיקר');

    const id = document.getElementById('editTickerId').value;
    const symbol = document.getElementById('editTickerSymbol').value.trim().toUpperCase();
    const name = document.getElementById('editTickerName').value.trim();
    const type = document.getElementById('editTickerType').value;
    const currency_id = parseInt(document.getElementById('editTickerCurrency').value);
    const status = document.getElementById('editTickerStatus').value;
    const remarks = document.getElementById('editTickerRemarks').value.trim();

    // ולידציה גלובלית
    if (window.validateForm) {
        if (!window.validateForm('editTickerForm')) {
            return;
        }
    }

    // בדיקה אם הסמל כבר קיים בטיקרים אחרים (לא בטיקר הנוכחי)
    const existingTicker = tickersData.find(t => 
        t.symbol.toUpperCase() === symbol.toUpperCase() && 
        t.id != id
    );
    if (existingTicker) {
        if (window.showErrorNotification) {
            window.showErrorNotification(
                'שגיאת וולידציה', 
                `הסמל ${symbol} כבר קיים במערכת (טיקר: ${existingTicker.name})`
            );
        }
        return;
    }

    // טיפול בסטטוס "לא מבוטל" - צריך לקבוע אם זה "open" או "closed"
    let finalStatus = status;
    if (status === 'not_canceled') {
        // בדיקה אם יש טריידים או תכנונים פתוחים לטיקר זה
        const ticker = tickersData.find(t => t.id == id);
        if (ticker) {
            // אם יש טריידים או תכנונים פתוחים - סטטוס "open", אחרת "closed"
            finalStatus = ticker.active_trades ? 'open' : 'closed';
        } else {
            finalStatus = 'closed'; // ברירת מחדל
        }
    }

    // בדיקה אם הסטטוס השתנה ל"מבוטל" - אם כן, בדוק פריטים מקושרים
    const originalTicker = tickersData.find(t => t.id == id);
    if (originalTicker && status === 'canceled' && originalTicker.status !== 'canceled') {
        console.log('🔄 הסטטוס השתנה ל"מבוטל" - בודק פריטים מקושרים');
        
        // בדיקת פריטים מקושרים באמצעות המערכת הכללית
        try {
            console.log('🔧 בדיקת פריטים מקושרים בעדכון באמצעות המערכת הכללית');
            
            // שימוש ב-API הכללי לקבלת פריטים מקושרים
            const response = await fetch(`/api/v1/linked-items/ticker/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const linkedItemsData = await response.json();
            console.log('🔍 נתוני פריטים מקושרים לעדכון:', linkedItemsData);
            
            // בדיקה אם יש פריטים פתוחים שמונעים ביטול
            const openTrades = linkedItemsData.child_entities ? linkedItemsData.child_entities.filter(entity => 
                entity.type === 'trade' && entity.status === 'open'
            ) : [];
            const openPlans = linkedItemsData.child_entities ? linkedItemsData.child_entities.filter(entity => 
                entity.type === 'trade_plan' && entity.status === 'open'
            ) : [];
            
            const hasOpenTrades = openTrades.length > 0;
            const hasOpenPlans = openPlans.length > 0;
            
            console.log('🔍 hasOpenTrades:', hasOpenTrades, 'hasOpenPlans:', hasOpenPlans);
            console.log('🔍 openTrades:', openTrades);
            console.log('🔍 openPlans:', openPlans);
            
            if (hasOpenTrades || hasOpenPlans) {
                console.log('❌ נמצאו פריטים פתוחים - מונע עדכון');
                
                // שימוש במערכת הכללית להצגת פריטים מקושרים
                if (window.showLinkedItemsWarning) {
                    console.log('🔧 קריאה ל-showLinkedItemsWarning (מערכת כללית)');
                    window.showLinkedItemsWarning('ticker', id);
                } else {
                    console.error('❌ showLinkedItemsWarning לא זמינה');
                    // Fallback - הצגת הודעת אזהרה
                    if (window.showWarningNotification) {
                        window.showWarningNotification(
                            'לא ניתן לבטל טיקר',
                            `לא ניתן לבטל את הטיקר ${originalTicker.symbol} כי יש לו טריידים או תכנונים פתוחים. יש לסגור אותם קודם.`
                        );
                    }
                }
                return; // לא ממשיכים עם העדכון
            }
            
            console.log('✅ אין פריטים פתוחים - ממשיך עם העדכון');
            
        } catch (error) {
            console.error('❌ שגיאה בבדיקת פריטים מקושרים בעדכון:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification(
                    'שגיאה בבדיקה',
                    'שגיאה בבדיקת פריטים מקושרים. לא ניתן לבטל את הטיקר.'
                );
            }
            return; // לא ממשיכים עם העדכון
        }
        
        console.log('✅ אין פריטים פתוחים - ממשיך עם העדכון');
    }

    try {
        const tickerData = {
            symbol: symbol,
            name: name,
            type: type,
            currency_id: currency_id,
            status: finalStatus,
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
            if (window.showSuccessNotification) { 
                window.showSuccessNotification('הצלחה', `טיקר ${symbol} עודכן בהצלחה במערכת`); 
            }

            // רענון הנתונים
            await loadTickersData();

            // עדכון שדה active_trades
            await updateActiveTradesField();

        } else {
            const error = await response.text();
            console.error('❌ שגיאה בעדכון טיקר:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון טיקר: ' + error);
            }
        }

    } catch (error) {
        console.error('❌ שגיאה בעדכון טיקר:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון טיקר');
        }
    }
}

/**
 * ביטול טיקר
 */
async function cancelTicker(id) {
    console.log('🔄 ביטול טיקר:', id);

    // מציאת הטיקר לפי ID
    const ticker = tickersData.find(t => t.id == id);
    if (!ticker) {
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
        }
        return;
    }

    // בדיקה אם הטיקר כבר מבוטל
    if (ticker.status === 'canceled') {
        if (window.showInfoNotification) {
            window.showInfoNotification('מידע', 'הטיקר כבר מבוטל');
        }
        return;
    }

    // הצגת דיאלוג אישור לביטול
    console.log('🔧 בדיקה אם showCancelWarning זמינה:', typeof window.showCancelWarning);
    
    if (window.showCancelWarning) {
        console.log('🔧 קריאה ל-showCancelWarning עם:', {
            itemType: 'ticker',
            itemName: `${ticker.symbol} - ${ticker.name}`,
            onConfirm: 'performCancelTickerWithLinkedItemsCheck',
            onCancel: 'console.log'
        });
        
        window.showCancelWarning(
            'ticker',
            `${ticker.symbol} - ${ticker.name}`,
            () => performCancelTickerWithLinkedItemsCheck(id), // onConfirm - בדיקה עם פריטים מקושרים
            () => console.log('ביטול טיקר בוטל') // onCancel
        );
    } else {
        console.log('🔧 showCancelWarning לא זמינה - בדיקה ישירה');
        // Fallback - בדיקה ישירה עם פריטים מקושרים
        await performCancelTickerWithLinkedItemsCheck(id);
    }
}

/**
 * עדכון כל הסטטוסים של טיקרים
 */
async function updateAllTickerStatuses() {
    console.log('🔄 עדכון כל הסטטוסים של טיקרים');

    try {
        const response = await fetch('/api/v1/tickers/update-all-statuses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ סטטוסים עודכנו בהצלחה:', result);

            // הצגת הודעת הצלחה
            if (window.showSuccessNotification) { 
                window.showSuccessNotification('הצלחה', 'סטטוסים של כל הטיקרים עודכנו בהצלחה'); 
            }

            // רענון הנתונים
            await loadTickersData();

            // עדכון שדה active_trades
            await updateActiveTradesField();

        } else {
            const errorResponse = await response.text();
            console.error('❌ שגיאה בעדכון סטטוסים:', errorResponse);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון סטטוסים של טיקרים');
            }
        }

    } catch (error) {
        console.error('❌ שגיאה בעדכון סטטוסים:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון סטטוסים של טיקרים');
        }
    }
}

/**
 * ביצוע ביטול טיקר עם בדיקת פריטים מקושרים
 * 
 * משתמש במערכת הכללית לקבלת פריטים מקושרים:
 * - API: /api/v1/linked-items/ticker/{id}
 * - פונקציה: window.showLinkedItemsWarning('ticker', id)
 * - מודל: window.showLinkedItemsModal (מעוצב עם כל המידע)
 */
async function performCancelTickerWithLinkedItemsCheck(id) {
    console.log('🔄 ביצוע ביטול טיקר עם בדיקת פריטים מקושרים:', id);

    // מציאת פרטי הטיקר
    const ticker = tickersData.find(t => t.id == id);
    if (!ticker) {
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
        }
        return;
    }

    // בדיקת פריטים מקושרים באמצעות המערכת הכללית
    try {
        console.log('🔧 בדיקת פריטים מקושרים באמצעות המערכת הכללית');
        
        // שימוש ב-API הכללי לקבלת פריטים מקושרים
        const response = await fetch(`/api/v1/linked-items/ticker/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const linkedItemsData = await response.json();
        console.log('🔍 נתוני פריטים מקושרים:', linkedItemsData);
        
        // בדיקה אם יש פריטים פתוחים שמונעים ביטול
        const openTrades = linkedItemsData.child_entities ? linkedItemsData.child_entities.filter(entity => 
            entity.type === 'trade' && entity.status === 'open'
        ) : [];
        const openPlans = linkedItemsData.child_entities ? linkedItemsData.child_entities.filter(entity => 
            entity.type === 'trade_plan' && entity.status === 'open'
        ) : [];
        
        const hasOpenTrades = openTrades.length > 0;
        const hasOpenPlans = openPlans.length > 0;
        
        console.log('🔍 hasOpenTrades:', hasOpenTrades, 'hasOpenPlans:', hasOpenPlans);
        console.log('🔍 openTrades:', openTrades);
        console.log('🔍 openPlans:', openPlans);
        
        if (hasOpenTrades || hasOpenPlans) {
            console.log('❌ נמצאו פריטים פתוחים - מציג חלון מקושרים');
            
            // שימוש במערכת הכללית להצגת פריטים מקושרים
            if (window.showLinkedItemsWarning) {
                console.log('🔧 קריאה ל-showLinkedItemsWarning (מערכת כללית)');
                window.showLinkedItemsWarning('ticker', id);
            } else {
                console.error('❌ showLinkedItemsWarning לא זמינה');
                // Fallback - הצגת הודעת אזהרה
                if (window.showWarningNotification) {
                    window.showWarningNotification(
                        'לא ניתן לבטל טיקר',
                        `לא ניתן לבטל את הטיקר ${ticker.symbol} כי יש לו טריידים או תכנונים פתוחים. יש לסגור אותם קודם.`
                    );
                }
            }
            return;
        }
        
        console.log('✅ אין פריטים פתוחים - ממשיך לביטול');
        
    } catch (error) {
        console.error('❌ שגיאה בבדיקת פריטים מקושרים:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification(
                'שגיאה בבדיקה',
                'שגיאה בבדיקת פריטים מקושרים. לא ניתן לבטל את הטיקר.'
            );
        }
        return;
    }

    // אם הגענו לכאן - אין פריטים מקושרים, אפשר לבטל
    await performCancelTicker(id);
}

/**
 * ביצוע ביטול טיקר
 */
async function performCancelTicker(id) {
    console.log('🔄 ביצוע ביטול טיקר:', id);

    // מציאת פרטי הטיקר
    const ticker = tickersData.find(t => t.id == id);
    if (!ticker) {
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
        }
        return;
    }

    try {
        const response = await fetch(`/api/v1/tickers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'canceled'
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ טיקר בוטל בהצלחה:', result);

            // הצגת הודעת הצלחה עם פרטי הטיקר
            if (window.showSuccessNotification) { 
                window.showSuccessNotification('הצלחה', `הטיקר ${ticker.symbol} - ${ticker.name} בוטל בהצלחה`); 
            }

            // רענון הנתונים
            await loadTickersData();

            // עדכון שדה active_trades
            await updateActiveTradesField();

        } else {
            const errorResponse = await response.text();
            console.error('❌ שגיאה בביטול טיקר:', errorResponse);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול טיקר');
            }
        }

    } catch (error) {
        console.error('❌ שגיאה בביטול טיקר:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול טיקר');
        }
    }
}

/**
 * הפעלה מחדש של טיקר מבוטל
 * 
 * @param {string|number} tickerId - מזהה הטיקר
 */
async function reactivateTicker(tickerId) {
    try {
        console.log('✅ הפעלה מחדש של טיקר:', tickerId);

        // מציאת הטיקר בנתונים
        const ticker = tickersData.find(t => t.id == tickerId);
        if (!ticker) {
            console.error('Ticker not found:', tickerId);
            throw new Error('טיקר לא נמצא');
        }

        const response = await fetch(`/api/v1/tickers/${tickerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'active'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('✅ Ticker reactivated successfully');

        // הצגת הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('טיקר הופעל מחדש בהצלחה!');
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('טיקר הופעל מחדש בהצלחה!', 'success');
        }

        // רענון הטבלה
        await loadTickersData();

    } catch (error) {
        console.error('❌ Error reactivating ticker:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהפעלה מחדש', error.message);
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה בהפעלה מחדש', 'error');
        }
    }
}

/**
 * אישור מחיקת טיקר
 */
async function confirmDeleteTicker(id) {
    console.log('🔄 אישור מחיקת טיקר:', id);

    // מציאת הטיקר לפני מחיקה כדי להציג פרטים בהודעה
    const ticker = tickersData.find(t => t.id == id);
    const tickerInfo = ticker ? `${ticker.symbol} - ${ticker.name}` : `טיקר ${id}`;

    try {
        const response = await fetch(`/api/v1/tickers/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('✅ טיקר נמחק בהצלחה');

            // הצגת הודעת הצלחה
            if (window.showSuccessNotification) { 
                window.showSuccessNotification('הצלחה', `טיקר ${tickerInfo} נמחק בהצלחה מהמערכת`); 
            }

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
                console.log('🔄 בדיקת שגיאה:', errorData.error?.message);
                if (errorData.error && errorData.error.message &&
                    (errorData.error.message.includes('linked items') ||
                        errorData.error.message.includes('Cannot delete ticker with linked items'))) {

                    console.log('🔄 נמצאו פריטים מקושרים - קורא ל-showLinkedItemsWarning');
                    console.log('🔄 showLinkedItemsWarning זמין:', typeof showLinkedItemsWarning === 'function');
                    console.log('🔄 window.showLinkedItemsWarning זמין:', typeof window.showLinkedItemsWarning === 'function');

                    // הצגת אזהרת פריטים מקושרים לפני מחיקה
                    console.log('🔄 מנסה לקרוא לפונקציה...');
                    try {
                        if (window.showLinkedItemsWarning) {
                            window.showLinkedItemsWarning('ticker', id);
                        } else {
                            console.error('❌ showLinkedItemsWarning function not found');
                        }
                    } catch (error) {
                        console.error('❌ שגיאה בקריאה לפונקציה:', error);
                        if (window.showErrorNotification) {
                            window.showErrorNotification('שגיאה במחיקה', 'לא ניתן למחוק טיקר זה - יש פריטים מקושרים אליו');
                        }
                    }
                    return;
                } else {
                    console.log('🔄 לא נמצאו פריטים מקושרים - ממשיך להודעת שגיאה רגילה');
                }

                if (window.showErrorNotification) {
                    window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת טיקר: ' + errorData.error.message);
                }

            } catch (parseError) {
                            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת טיקר: ' + errorResponse);
            }
            }
        }

    } catch (error) {
        console.error('❌ שגיאה במחיקת טיקר:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת טיקר');
        }
    }
}

// ========================================
// פונקציות מודל פריטים מקושרים
// ========================================



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
    console.log('🔄 loadTickersData נקראה');

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
        console.log('🔄 tickersData תוכן:', tickersData);

        // עדכון שדה active_trades
        console.log('🔄 קורא ל-updateActiveTradesField');
        await updateActiveTradesField();

        // עדכון הטבלה (אחרי עדכון active_trades)
        console.log('🔄 קורא ל-updateTickersTable');
        console.log('🔄 updateTickersTable זמין:', typeof updateTickersTable === 'function');
        updateTickersTable(tickersData);

        // עדכון סטטיסטיקות סיכום
        console.log('🔄 קורא ל-updateTickersSummaryStats');
        console.log('🔄 updateTickersSummaryStats זמין:', typeof updateTickersSummaryStats === 'function');
        updateTickersSummaryStats(tickersData);

        console.log('✅ loadTickersData הושלם בהצלחה');
        console.log('🔄 loadTickersData הסתיים');

    } catch (error) {
        console.error('❌ שגיאה ב-loadTickersData:', error);
        console.error('❌ Error stack:', error.stack);
        console.log('🔄 loadTickersData הסתיים עם שגיאה');
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
    console.log('🔄 updateTickersTable נקראה');
    console.log('🔄 Input tickers:', tickers);
    console.log('🔄 tickers.length:', tickers ? tickers.length : 'undefined');

    try {
        // מציאת ה-tbody
        let tbody = document.querySelector('table[data-table-type="tickers"] tbody');
        console.log('🔄 tbody element:', tbody);

        if (!tbody) {
            console.log('🔄 מנסה דרך הקונטיינר...');
            const container = document.getElementById('tickersContainer');
            if (container) {
                tbody = container.querySelector('tbody');
                console.log('🔄 tbody דרך קונטיינר:', tbody);
            }
        }

        if (!tbody) {
            console.error('❌ לא נמצא tbody element!');
            console.log('🔄 מנסה למצוא את הטבלה...');
            const table = document.querySelector('table[data-table-type="tickers"]');
            console.log('🔄 table element:', table);
            if (table) {
                console.log('🔄 table.innerHTML:', table.innerHTML);
            }
            console.log('🔄 updateTickersTable מסתיים ללא tbody');
            return;
        }

        // בדיקה אם יש נתונים
        if (!tickers || tickers.length === 0) {
            console.log('🔄 אין נתונים, מציג הודעה');
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">לא נמצאו טיקרים</td></tr>';
            console.log('🔄 updateTickersTable מסתיים ללא נתונים');
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

            // קבלת עיצוב סטטוס
            const statusStyle = getTickerStatusStyle(ticker.status);
            const statusLabel = getTickerStatusLabel(ticker.status);

            return `
                <tr>
                    <td title="${ticker.symbol || 'N/A'}"><strong>${ticker.symbol || 'N/A'}</strong></td>
                    <td title="${ticker.active_trades ? 'יש טריידים פעילים' : 'אין טריידים פעילים'}">${ticker.active_trades ? '✅' : '❌'}</td>
                    <td title="${typeLabel}">
                        <span style="background-color: ${typeStyle.backgroundColor}; color: ${typeStyle.color}; padding: ${typeStyle.padding}; border-radius: ${typeStyle.borderRadius}; font-size: ${typeStyle.fontSize}; font-weight: ${typeStyle.fontWeight}; display: ${typeStyle.display}; min-width: ${typeStyle.minWidth}; text-align: ${typeStyle.textAlign};">
                            ${typeLabel}
                        </span>
                    </td>
                    <td title="${currencySymbol}"><strong>${currencySymbol}</strong></td>
                    <td title="${ticker.updated_at ? new Date(ticker.updated_at).toLocaleString('he-IL') : 'N/A'}">${ticker.updated_at ? new Date(ticker.updated_at).toLocaleString('he-IL') : 'N/A'}</td>
                    <td title="${ticker.name || 'N/A'}">${ticker.name || 'N/A'}</td>
                    <td title="${ticker.created_at ? new Date(ticker.created_at).toLocaleDateString('he-IL') : 'N/A'}">${ticker.created_at ? new Date(ticker.created_at).toLocaleDateString('he-IL') : 'N/A'}</td>
                    <td title="${ticker.remarks || '-'}">${ticker.remarks || '-'}</td>
                    <td title="${statusLabel}">
                        <span style="background-color: ${statusStyle.backgroundColor}; color: ${statusStyle.color}; padding: ${statusStyle.padding}; border-radius: ${statusStyle.borderRadius}; font-size: ${statusStyle.fontSize}; font-weight: ${statusStyle.fontWeight}; display: ${statusStyle.display}; min-width: ${statusStyle.minWidth}; text-align: ${statusStyle.textAlign};">
                            ${statusLabel}
                        </span>
                    </td>
                    <td class="actions-cell">
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-info" onclick="window.showLinkedItemsWarning('ticker', ${ticker.id})" title="פריטים מקושרים">🔗</button>
                            <button class="btn btn-outline-secondary" onclick="window.showEditTickerModal(${ticker.id})" title="ערוך">✏️</button>
                            <button class="btn btn-outline-danger" onclick="window.cancelTicker(${ticker.id})" title="בטל טיקר" ${ticker.status === 'canceled' ? 'disabled' : ''}><span class="cancel-icon">X</span></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        console.log('🔄 tableRows נוצר, אורך:', tableRows.length);

        // עדכון הטבלה
        const finalHTML = tableRows.join('');
        tbody.innerHTML = finalHTML;
        console.log('🔄 tbody.innerHTML עודכן');
        console.log('🔄 updateTickersTable הושלם בהצלחה');

        // עדכון הספירה
        const countElement = document.querySelector('.table-count');
        console.log('🔄 updateTickersTable מסתיים');
        console.log('🔄 updateTickersTable הושלם בהצלחה');
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
        console.log('🔄 updateTickersTable מסתיים עם שגיאה');
    }
}





// הגדרת הפונקציות כגלובליות
window.updateActiveTradesField = updateActiveTradesField;
window.updateTickerActiveTradesStatus = updateTickerActiveTradesStatus;
window.updateAllActiveTradesStatuses = updateAllActiveTradesStatuses;
window.deleteTicker = deleteTicker;
window.cancelTicker = cancelTicker;
window.performCancelTicker = performCancelTicker;
window.updateAllTickerStatuses = updateAllTickerStatuses;
window.toggleTopSection = toggleTopSection;
window.toggleTickersSection = toggleTickersSection;
window.restoreTickersSectionState = restoreTickersSectionState;

// פונקציות מודלים
window.showAddTickerModal = showAddTickerModal;
window.showEditTickerModal = showEditTickerModal;
window.showDeleteTickerModal = showDeleteTickerModal;
window.saveTicker = saveTicker;
window.updateTicker = updateTicker;
window.confirmDeleteTicker = confirmDeleteTicker;



// פונקציות מודל פריטים מקושרים - שימוש במערכת הכללית
// window.showLinkedItemsWarning - פונקציה כללית זמינה מ-linked-items.js

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
window.getTickerStatusStyle = getTickerStatusStyle;
window.getTickerStatusLabel = getTickerStatusLabel;
window.generateTickerCurrencyOptions = generateTickerCurrencyOptions;
window.updateCurrencyOptions = updateCurrencyOptions;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === DOM CONTENT LOADED ===');

    // שחזור מצב הסגירה
    restoreTickersSectionState();

    // אתחול וולידציה - שימוש בפונקציות הגלובליות
    if (window.initializeValidation) {
        // שימוש בוולידציה הגלובלית ללא כללים מותאמים
        window.initializeValidation('addTickerForm', {});
        window.initializeValidation('editTickerForm', {});
    }

    // שחזור מצב סידור
    restoreSortState();

    console.log('דף טיקרים נטען בהצלחה');
});

// אתחול נוסף כשהדף נטען לחלוטין
window.addEventListener('load', function () {
    console.log('🔄 === WINDOW LOADED ===');
    
    // טעינת נתונים עם ניסיונות חוזרים
    let attempts = 0;
    const maxAttempts = 10;
    
    function tryLoadData() {
        // tryLoadData נקראה
        console.log(`🔄 ניסיון ${attempts + 1} לטעינת נתונים...`);
        
        // בדיקה מפורטת יותר
        const table = document.querySelector('table[data-table-type="tickers"]');
        console.log('🔄 table element:', table);
        
        const container = document.getElementById('tickersContainer');
        console.log('🔄 container element:', container);
        
        const tbody = document.querySelector('table[data-table-type="tickers"] tbody') || 
                     document.getElementById('tickersContainer')?.querySelector('tbody');
        
        console.log('🔄 tbody element:', tbody);
        
        if (tbody) {
            console.log('✅ נמצא tbody, טוען נתונים...');
            console.log('🔄 קורא ל-loadTickersData...');
            loadTickersData();
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryLoadData, 500);
        } else {
            console.error('❌ לא הצלחתי למצוא את הטבלה אחרי 10 ניסיונות');
            console.log('🔄 מנסה לטעון נתונים בכל מקרה...');
            loadTickersData();
        }
    }
    
    console.log('🔄 קורא ל-tryLoadData...');
    tryLoadData();
});
