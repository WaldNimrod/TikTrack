/**
 * ========================================
 * Trade Plans Page - Trade Plans Page
 * ========================================
 * 
 * Dedicated file for the trade plans page (trade_plans.html)
 * 
 * RECENT UPDATES (August 31, 2025):
 * =================================
 * 
 * VALIDATION SYSTEM IMPROVEMENTS:
 * - Fixed duplicate error messages in add form
 * - Implemented global validation system integration
 * - Real-time field validation with error highlighting
 * - Proper error field indication and clearing
 * 
 * TICKER CHANGE FEATURE:
 * - Added immediate confirmation dialog when ticker changes
 * - Feature currently disabled with "Feature not supported" message
 * - Automatic revert to original ticker value
 * - Clear user feedback about feature status
 * 
 * CANCELLATION SYSTEM ENHANCEMENT:
 * - Removed duplicate confirmation windows
 * - Added linked items checking before cancellation
 * - Fixed API method from PUT to POST for cancellation
 * - Clear success notifications after cancellation
 * 
 * SERVER INTEGRATION FIXES:
 * - Complete server restart with cleanup
 * - Database lock file resolution (WAL/SHM)
 * - Automatic package installation
 * - Comprehensive health checks
 * 
 * SORTING FIX (August 24, 2025):
 * =============================
 * 
 * ISSUE: RangeError: Maximum call stack size exceeded when clicking sort headers
 * - Function was calling window.sortTable instead of window.sortTableData
 * - This caused infinite recursion and browser crash
 * 
 * FIX APPLIED:
 * - Changed window.sortTable to window.sortTableData in sortTable function
 * - Updated function parameters to match global sorting system
 * - Fixed function signature: (columnIndex, data, tableType, updateFunction)
 * 
 * LINKED ITEMS INTEGRATION:
 * - Added "Show Linked Details" button to each row
 * - Integrated with linked-items.js for modal functionality
 * - Uses viewLinkedItemsForTradePlan() wrapper function
 * 
 * File contents:
 * - Loading planning data from server
 * - Displaying planning table with sorting and filters
 * - Adding new planning with comprehensive validation
 * - Editing existing planning with real-time validation
 * - Cancelling planning with linked items checking
 * - Deleting planning with confirmation
 * - Managing statuses and states
 * - Using global notification system
 * - "Show Linked Details" functionality
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (for global sorting functions)
 * - translation-utils.js (for status translations)
 * - linked-items.js (for linked items modal)
 * - validation-utils.js (for validation functions)
 * - notification-system.js (for notification system)
 * 
 * Table Mapping:
 * - Uses 'planning' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * Notification system:
 * - All user messages use the global notification system
 * - showSuccessNotification() - Success messages
 * - showErrorNotification() - Error messages
 * - showWarningNotification() - Warning messages
 * 
 * Author: Tik.track Development Team
 * Last update date: 2025-08-31
 * Status: ✅ Complete - Round B
 * @sortingFix August 24, 2025 - Fixed infinite recursion in sorting
 * @validationFix August 31, 2025 - Fixed validation system integration
 * @tickerChangeFix August 31, 2025 - Added ticker change confirmation
 * @cancellationFix August 31, 2025 - Enhanced cancellation system
 * @serverFix August 31, 2025 - Fixed server integration issues
 * ========================================
 */

// Global variables
let trade_plansData = [];

// ===== CRUD Modal Functions =====

/**
 * פתיחת מודל הוספת תכנון חדש
 */
function openAddTradePlanModal() {
    // Opening add trade plan modal
    const modal = new bootstrap.Modal(document.getElementById('addTradePlanModal'));

    // קבע ברירת מחדל של היום לשדה התאריך
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const dateInput = document.getElementById('addTradePlanDate');
    if (dateInput) dateInput.value = todayStr;

    modal.show();
}

/**
 * פתיחת מודל עריכת תכנון קיים
 */
async function openEditTradePlanModal(tradePlanId) {
    const tradePlan = trade_plansData.find(tp => tp.id == tradePlanId);
    if (!tradePlan) {
        handleElementNotFound('trade plan', 'CRITICAL');
        return;
    }

    // טעינת רשימת הטיקרים בחלון הבחירה
    await loadTickersForEditModal();

    // מילוי הטופס בנתונים קיימים
    document.getElementById('editTradePlanId').value = tradePlan.id;
    document.getElementById('editTradePlanTickerId').value = tradePlan.ticker_id;
    document.getElementById('editTradePlanInvestmentType').value = tradePlan.investment_type;
    document.getElementById('editTradePlanSide').value = tradePlan.side;
    document.getElementById('editTradePlanStatus').value = tradePlan.status;
    document.getElementById('editTradePlanPlannedAmount').value = tradePlan.planned_amount;
    document.getElementById('editTradePlanShares').value = tradePlan.shares || '';
    document.getElementById('editTradePlanStopPrice').value = tradePlan.stop_price || '';
    document.getElementById('editTradePlanTargetPrice').value = tradePlan.target_price || '';
    document.getElementById('editTradePlanEntryConditions').value = tradePlan.entry_conditions || '';
    document.getElementById('editTradePlanReasons').value = tradePlan.reasons || '';

    // עדכון תאריך
    if (tradePlan.created_at) {
        const date = new Date(tradePlan.created_at);
        const dateStr = date.toISOString().split('T')[0];
        document.getElementById('editTradePlanDate').value = dateStr;
    }

    // הפעלת כל השדות
    enableEditFields();

    // עדכון מידע על הטיקר
    await updateEditTickerInfo();

    // חישוב מספר מניות
    updateEditSharesFromAmount();

    const modal = new bootstrap.Modal(document.getElementById('editTradePlanModal'));
    modal.show();
}

/**
 * טעינת רשימת הטיקרים בחלון העריכה
 */
async function loadTickersForEditModal() {
    const tickerSelect = document.getElementById('editTradePlanTickerId');
    if (!tickerSelect) return;

    // ניקוי הרשימה הקיימת
    tickerSelect.innerHTML = '<option value="">בחר טיקר</option>';

    try {
        // ניסיון לקבל טיקרים מהשירות
        let tickers = [];
        if (typeof window.tickerService?.getTickers === 'function') {
            tickers = await window.tickerService.getTickers();
        } else if (window.tickersData) {
            tickers = window.tickersData;
        }

        // סינון טיקרים - רק פתוחים או סגורים (לא מבוטלים)
        const activeTickers = tickers.filter(ticker => 
            ticker.status === 'open' || ticker.status === 'closed'
        );

        // הוספת הטיקרים הפעילים לרשימה
        activeTickers.forEach(ticker => {
            const option = document.createElement('option');
            option.value = ticker.id;
            option.textContent = ticker.symbol;
            tickerSelect.appendChild(option);
        });
    } catch (error) {
        handleDataLoadError(error, 'טיקרים למודל עריכה');
    }
}

/**
 * הפעלת השדות במודל העריכה
 */
function enableEditFields() {
    const fields = [
        'editTradePlanInvestmentType',
        'editTradePlanSide', 
        'editTradePlanStatus',
        'editTradePlanPlannedAmount',
        'editTradePlanShares',
        'editTradePlanStopPrice',
        'editTradePlanTargetPrice',
        'editTradePlanEntryConditions',
        'editTradePlanReasons'
    ];

    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.disabled = false;
            field.classList.remove('disabled');
        }
    });
}

/**
 * עדכון מידע על הטיקר במודל העריכה
 */
async function updateEditTickerInfo() {
    const tickerId = document.getElementById('editTradePlanTickerId').value;
    const tickerDisplay = document.getElementById('editSelectedTickerDisplay');
    const priceDisplay = document.getElementById('editCurrentPriceDisplay');
    const changeDisplay = document.getElementById('editDailyChangeDisplay');
    const tradePlanId = document.getElementById('editTradePlanId').value;

    if (!tickerId) {
        tickerDisplay.textContent = 'לא נבחר';
        priceDisplay.textContent = '-';
        changeDisplay.textContent = '-';
        return;
    }

    // בדיקה אם הטיקר השתנה (רק אם יש תכנון נבחר)
    if (tradePlanId) {
        const originalTradePlan = trade_plansData.find(tp => tp.id == tradePlanId);
        if (originalTradePlan && originalTradePlan.ticker_id != tickerId) {
            // Ticker changed from original to new
            
            // הצגת הודעת אישור לשינוי טיקר
            if (typeof window.showConfirmationDialog === 'function') {
                window.showConfirmationDialog(
                    'שינוי טיקר לתכנון',
                    'האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?\n\nפעולה זו תשנה את הטיקר המקורי של התכנון.',
                    () => {
                        // המשתמש אישר - הצגת הודעה שהפיצ'ר לא נתמך
                        if (typeof window.showWarningNotification === 'function') {
                            window.showWarningNotification(
                                'פיצ\'ר לא נתמך',
                                'שינוי טיקר לתכנון לא נתמך עדיין. הטיקר יוחזר למצבו המקורי.'
                            );
                        }
                        // החזרת הטיקר למצבו המקורי
                        document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                        // עדכון התצוגה עם הטיקר המקורי
                        updateEditTickerInfo();
                        return;
                    },
                    () => {
                        // המשתמש ביטל - מחזירים את הטיקר המקורי
                        document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                        // עדכון התצוגה עם הטיקר המקורי
                        updateEditTickerInfo();
                        return;
                    }
                );
            } else {
                // Fallback למקרה שהפונקציה לא זמינה
                if (typeof window.showConfirmationDialog === 'function') {
                    window.showConfirmationDialog(
                        'שינוי טיקר לתכנון',
                        'האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?',
                        () => {
                            if (typeof window.showWarningNotification === 'function') {
                                window.showWarningNotification(
                                    'פיצ\'ר לא נתמך',
                                    'שינוי טיקר לתכנון לא נתמך עדיין. הטיקר יוחזר למצבו המקורי.'
                                );
                            }
                            document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                            updateEditTickerInfo();
                        },
                        () => {
                            document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                            updateEditTickerInfo();
                        }
                    );
                } else {
                    if (typeof window.showConfirmationDialog === 'function') {
                        window.showConfirmationDialog(
                            'שינוי טיקר לתכנון',
                            'האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?',
                            () => {
                                if (typeof window.showWarningNotification === 'function') {
                                    window.showWarningNotification(
                                        'פיצ\'ר לא נתמך',
                                        'שינוי טיקר לתכנון לא נתמך עדיין. הטיקר יוחזר למצבו המקורי.'
                                    );
                                }
                                document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                                updateEditTickerInfo();
                            },
                            () => {
                                document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                                updateEditTickerInfo();
                            }
                        );
                    } else {
                        const confirmed = confirm('האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?');
                        if (confirmed) {
                            if (typeof window.showWarningNotification === 'function') {
                                window.showWarningNotification(
                                    'פיצ\'ר לא נתמך',
                                    'שינוי טיקר לתכנון לא נתמך עדיין. הטיקר יוחזר למצבו המקורי.'
                                );
                            }
                            document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                            updateEditTickerInfo();
                        } else {
                            document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                            updateEditTickerInfo();
                        }
                    }
                }
            }
        }
    }

    // מציאת הטיקר בנתונים
    let ticker = null;
    if (typeof window.tickerService?.getTickers === 'function') {
        try {
            const tickers = await window.tickerService.getTickers();
            ticker = tickers.find(t => t.id == tickerId);
        } catch (error) {
            console.warn('Error getting tickers from service:', error);
        }
    }
    
    if (!ticker && window.tickersData) {
        ticker = window.tickersData.find(t => t.id == tickerId);
    }

    if (ticker) {
        tickerDisplay.textContent = ticker.symbol;
        
        // טיפול במחיר
        let displayPrice = ticker.current_price;
        if (!displayPrice || displayPrice === 0 || displayPrice === null) {
            // מחיר ברירת מחדל לפי סוג הטיקר
            switch (ticker.symbol) {
                case 'MSFT': displayPrice = 350.00; break;
                case 'AAPL': displayPrice = 180.00; break;
                case 'GOOGL': displayPrice = 140.00; break;
                case 'TSLA': displayPrice = 250.00; break;
                case 'SPY': displayPrice = 450.00; break;
                default: displayPrice = 100.00;
            }
            
            // הצגת הודעת אזהרה
            if (typeof window.showWarningNotification === 'function') {
                window.showWarningNotification(
                    'מחיר לא זמין', 
                    `המחיר הנוכחי של ${ticker.symbol} לא זמין. משתמש במחיר ברירת מחדל לצורך החישובים.`
                );
            }
        }
        
        priceDisplay.textContent = `$${displayPrice.toFixed(2)}`;

        const change = ticker.daily_change || 0;
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSign = change >= 0 ? '+' : '';
        changeDisplay.textContent = `${changeSign}${change}%`;
        changeDisplay.className = `form-control-plaintext ${changeClass}`;
    } else {
        tickerDisplay.textContent = 'לא נמצא';
        priceDisplay.textContent = '-';
        changeDisplay.textContent = '-';
    }
}



/**
 * עדכון מספר מניות מסכום מתוכנן במודל העריכה
 */
function updateEditSharesFromAmount() {
    const amountInput = document.getElementById('editTradePlanPlannedAmount');
    const sharesInput = document.getElementById('editTradePlanShares');
    const priceDisplay = document.getElementById('editCurrentPriceDisplay');

    if (!amountInput || !sharesInput || !priceDisplay) return;

    const amount = parseFloat(amountInput.value) || 0;
    const priceText = priceDisplay.textContent;
    const price = parseFloat(priceText.replace('$', '')) || 0;

    if (price > 0) {
        const result = convertAmountToShares(amount, price);
        sharesInput.value = result.shares;
    }
}

/**
 * עדכון סכום מתוכנן ממספר מניות במודל העריכה
 */
function updateEditAmountFromShares() {
    const amountInput = document.getElementById('editTradePlanPlannedAmount');
    const sharesInput = document.getElementById('editTradePlanShares');
    const priceDisplay = document.getElementById('editCurrentPriceDisplay');

    if (!amountInput || !sharesInput || !priceDisplay) return;

    const shares = parseFloat(sharesInput.value) || 0;
    const priceText = priceDisplay.textContent;
    const price = parseFloat(priceText.replace('$', '')) || 0;

    if (price > 0) {
        const amount = convertSharesToAmount(shares, price);
        amountInput.value = amount;
    }
}

/**
 * שמירת עריכת תכנון
 */
async function saveEditTradePlan() {
    try {
        // איסוף נתונים מהטופס
        const formData = {
            id: document.getElementById('editTradePlanId').value,
            ticker_id: document.getElementById('editTradePlanTickerId').value,
            investment_type: document.getElementById('editTradePlanInvestmentType').value,
            side: document.getElementById('editTradePlanSide').value,
            status: document.getElementById('editTradePlanStatus').value,
            planned_amount: parseFloat(document.getElementById('editTradePlanPlannedAmount').value),
            stop_price: parseFloat(document.getElementById('editTradePlanStopPrice').value) || null,
            target_price: parseFloat(document.getElementById('editTradePlanTargetPrice').value) || null,
            entry_conditions: document.getElementById('editTradePlanEntryConditions').value,
            reasons: document.getElementById('editTradePlanReasons').value
        };

        // בדיקה אם הסטטוס משתנה ל-'cancelled'
        const originalTradePlan = trade_plansData.find(tp => tp.id == formData.id);
        const isStatusChangingToCancelled = originalTradePlan && 
                                           originalTradePlan.status !== 'cancelled' && 
                                           formData.status === 'cancelled';

        if (isStatusChangingToCancelled) {
            // בדיקת פריטים מקושרים לפני הביטול
            await checkLinkedItemsBeforeCancel(formData.id);
            return; // לא ממשיכים עם העדכון אם יש פריטים מקושרים
        }

        // בדיקה אם הטיקר השתנה
        const isTickerChanging = originalTradePlan && 
                                originalTradePlan.ticker_id != formData.ticker_id;

        if (isTickerChanging) {
            // שינוי טיקר לא נתמך - הצגת הודעה ודחיית השינוי
            // Ticker change detected - feature not supported
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(
                    'פיצ\'ר לא נתמך',
                    'שינוי טיקר לתכנון לא נתמך עדיין. השינוי נדחה.'
                );
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שינוי טיקר לתכנון לא נתמך עדיין', 'error');
            }
            
            // החזרת הטיקר למצבו המקורי
            document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
            return; // לא ממשיכים עם העדכון
        }

        // שליחה לשרת
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/${formData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // הצגת הודעת הצלחה
        if (typeof window.showNotification === 'function') {
            window.showNotification('תכנון עודכן בהצלחה!', 'success');
        }

        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTradePlanModal'));
        modal.hide();

        // רענון הטבלה
        await loadTradePlansData();

    } catch (error) {
        handleSaveError(error, 'עדכון תכנון');
        
        // הצגת הודעת שגיאה
        let errorMessage = 'שגיאה בעדכון התכנון';
        try {
            const errorData = JSON.parse(error.message);
            errorMessage = errorData.error?.message || errorMessage;
        } catch {
            errorMessage = error.message || errorMessage;
        }
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(errorMessage, 'error');
        }
    }
}



/**
 * עדכון תכנון בשרת
 */
async function updateTradePlanOnServer(formData) {
    try {


        // שליחה לשרת
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/${formData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // הצגת הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('תכנון עודכן בהצלחה!', 'התכנון עודכן בהצלחה בשרת');
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('תכנון עודכן בהצלחה!', 'success');
        }

        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTradePlanModal'));
        if (modal) {
            modal.hide();
        }

        // רענון הטבלה
        await loadTradePlansData();

    } catch (error) {
        handleSaveError(error, 'עדכון תכנון');
        
        // הצגת הודעת שגיאה
        let errorMessage = 'שגיאה בעדכון התכנון';
        try {
            const errorData = JSON.parse(error.message);
            errorMessage = errorData.error?.message || errorMessage;
        } catch {
            errorMessage = error.message || errorMessage;
        }
        
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בעדכון תכנון', errorMessage);
        } else if (typeof window.showNotification === 'function') {
            window.showNotification(errorMessage, 'error');
        }
    }
}

/**
 * בדיקת פריטים מקושרים לפני ביטול תכנון
 */
async function checkLinkedItemsBeforeCancel(tradePlanId) {
    try {
        // בדיקת פריטים מקושרים דרך API הכללי
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/linked-items/trade_plan/${tradePlanId}`);
        
        if (!response.ok) {
            // אם לא ניתן לבדוק פריטים מקושרים, ממשיכים עם הביטול
            await cancelTradePlan(tradePlanId);
            return;
        }

        const linkedItemsData = await response.json();
        const childEntities = linkedItemsData.child_entities || [];
        const parentEntities = linkedItemsData.parent_entities || [];
        const allEntities = [...childEntities, ...parentEntities];

        if (allEntities.length > 0) {
            // יש פריטים מקושרים - הצגת חלון מקושרים
            if (typeof window.showLinkedItemsModal === 'function') {
                window.showLinkedItemsModal(linkedItemsData, 'trade_plan', tradePlanId);
            } else {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('לא ניתן לבטל תכנון זה - יש פריטים מקושרים אליו', 'error');
                }
            }
        } else {
            // אין פריטים מקושרים - ביצוע הביטול
            await cancelTradePlan(tradePlanId);
        }

    } catch (error) {
        console.error('❌ שגיאה בבדיקת פריטים מקושרים:', error);
        if (typeof window.handleSystemError === 'function') {
            window.handleSystemError(error, 'בדיקת פריטים מקושרים');
        } else if (typeof window.handleDataLoadError === 'function') {
            window.handleDataLoadError(error, 'בדיקת פריטים מקושרים');
        }
        // במקרה של שגיאה - ממשיכים עם הביטול
        await cancelTradePlan(tradePlanId);
    }
}

/**
 * הפעלה מחדש של תכנון מבוטל
 */
async function reactivateTradePlan(tradePlanId) {
    try {

        // מציאת התכנון בנתונים
        const tradePlan = trade_plansData.find(tp => tp.id == tradePlanId);
        if (!tradePlan) {
            handleElementNotFound('trade plan', 'CRITICAL');
            throw new Error('תכנון לא נמצא');
        }

        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/${tradePlanId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'open'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }



        // עדכון סטטוס הטיקר
        if (tradePlan.ticker_id) {
    
            if (typeof window.updateTickerActiveTradesStatus === 'function') {
                await window.updateTickerActiveTradesStatus(tradePlan.ticker_id);
            } else {
                console.warn('⚠️ updateTickerActiveTradesStatus function not available');
            }
        }

        // הצגת הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('תכנון הופעל מחדש בהצלחה!');
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('תכנון הופעל מחדש בהצלחה!', 'success');
        }

        // רענון הטבלה
        await loadTradePlansData();

    } catch (error) {
        handleSaveError(error, 'הפעלה מחדש של תכנון');
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהפעלה מחדש', error.message);
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה בהפעלה מחדש', 'error');
        }
    }
}



/**
 * פונקציות עזר למודל העריכה
 */
function addEditCondition() {
    if (typeof window.showNotification === 'function') {
        window.showNotification('פונקציונליות זו תהיה זמינה בקרוב', 'info');
    }
}

function addEditReason() {
    if (typeof window.showNotification === 'function') {
        window.showNotification('פונקציונליות זו תהיה זמינה בקרוב', 'info');
    }
}

function addEditImportantNote() {
    if (typeof window.showNotification === 'function') {
        window.showNotification('המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית', 'info');
    }
}

function addEditReminder() {
    if (typeof window.showNotification === 'function') {
        window.showNotification('המודול יאפשר בקרוב לייצר התראות לתוכנית', 'info');
    }
}

/**
 * פתיחת מודל ביטול תכנון
 */
function openCancelTradePlanModal(tradePlanId) {

    const tradePlan = trade_plansData.find(tp => tp.id == tradePlanId);
    if (!tradePlan) {
        handleElementNotFound('trade plan', 'CRITICAL');
        return;
    }

    // הצגת פרטי התכנון במודל הביטול
    document.getElementById('cancelTradePlanDetails').innerHTML = `
        <strong>טיקר:</strong> ${tradePlan.ticker?.symbol || 'לא מוגדר'}<br>
        <strong>סוג:</strong> ${tradePlan.investment_type || 'לא מוגדר'}<br>
        <strong>צד:</strong> ${tradePlan.side || 'לא מוגדר'}<br>
        <strong>סכום מתוכנן:</strong> $${tradePlan.planned_amount || '0.00'}
    `;

    document.getElementById('cancelTradePlanModal').setAttribute('data-trade-plan-id', tradePlanId);

    const modal = new bootstrap.Modal(document.getElementById('cancelTradePlanModal'));
    modal.show();
}

/**
 * פתיחת מודל מחיקת תכנון
 */
function openDeleteTradePlanModal(tradePlanId) {

    const tradePlan = trade_plansData.find(tp => tp.id == tradePlanId);
    if (!tradePlan) {
        handleElementNotFound('trade plan', 'CRITICAL');
        return;
    }

    // הצגת פרטי התכנון במודל המחיקה
    document.getElementById('deleteTradePlanDetails').innerHTML = `
        <strong>טיקר:</strong> ${tradePlan.ticker?.symbol || 'לא מוגדר'}<br>
        <strong>סוג:</strong> ${tradePlan.investment_type || 'לא מוגדר'}<br>
        <strong>צד:</strong> ${tradePlan.side || 'לא מוגדר'}<br>
        <strong>סכום מתוכנן:</strong> $${tradePlan.planned_amount || '0.00'}
    `;

    document.getElementById('deleteTradePlanModal').setAttribute('data-trade-plan-id', tradePlanId);

    const modal = new bootstrap.Modal(document.getElementById('deleteTradePlanModal'));
    modal.show();
}

/**
 * ביטול תכנון
 */
async function cancelTradePlan(tradePlanId) {
    try {
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/${tradePlanId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cancel_reason: 'תכנון בוטל על ידי המשתמש'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הצלחה', 'תכנון בוטל בהצלחה!');
        }

        await loadTradePlansData();
    } catch (error) {
        handleSaveError(error, 'ביטול תכנון');
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בביטול התכנון');
        }
    }
}

/**
 * אישור ביטול תכנון
 */
async function confirmCancelTradePlan() {
    const modal = document.getElementById('cancelTradePlanModal');
    const tradePlanId = modal.getAttribute('data-trade-plan-id');
    

    
    // סגירת המודל הראשון
    bootstrap.Modal.getInstance(modal).hide();
    
    // בדיקת פריטים מקושרים לפני ביטול
    await checkLinkedItemsBeforeCancel(tradePlanId);
}

/**
 * אישור מחיקת תכנון
 */
async function confirmDeleteTradePlan() {
    const modal = document.getElementById('deleteTradePlanModal');
    const tradePlanId = modal.getAttribute('data-trade-plan-id');

    if (!tradePlanId) {
        handleElementNotFound('trade plan ID', 'CRITICAL');
        return;
    }

    try {
        // שימוש בפונקציה deleteTradePlan במקום מחיקה ישירה
        await deleteTradePlan(tradePlanId);
        
        // סגירת המודל
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteTradePlanModal'));
        deleteModal.hide();

    } catch (error) {
        handleDeleteError(error, 'תכנון');
        // הפונקציה deleteTradePlan כבר מטפלת בהצגת שגיאות
    }
}

// ייצוא פונקציות לגלובל
window.openAddTradePlanModal = openAddTradePlanModal;
window.openEditTradePlanModal = openEditTradePlanModal;
window.openCancelTradePlanModal = openCancelTradePlanModal;
window.openDeleteTradePlanModal = openDeleteTradePlanModal;
window.saveEditTradePlan = saveEditTradePlan;
window.confirmCancelTradePlan = confirmCancelTradePlan;
window.confirmDeleteTradePlan = confirmDeleteTradePlan;
window.checkLinkedItemsBeforeCancel = checkLinkedItemsBeforeCancel;
window.cancelTradePlan = cancelTradePlan;
window.deleteTradePlan = deleteTradePlan;
window.reactivateTradePlan = reactivateTradePlan;

window.updateEditTickerInfo = updateEditTickerInfo;
window.updateEditSharesFromAmount = updateEditSharesFromAmount;
window.updateEditAmountFromShares = updateEditAmountFromShares;
window.addEditCondition = addEditCondition;
window.addEditReason = addEditReason;
window.addEditImportantNote = addEditImportantNote;
window.addEditReminder = addEditReminder;

// The translateDateRangeToDates function is already defined at the beginning of the file

// Defining the updateGridFromComponent function immediately at the beginning of the file

// Ensuring the function is only defined on the planning page
    if (window.location.pathname.includes('/trade_plans')) {
    window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {


        // Saving filters in global variables
        window.selectedStatusesForFilter = selectedStatuses || [];
        window.selectedTypesForFilter = selectedTypes || [];
        window.selectedDateRangeForFilter = selectedDateRange || null;
        window.searchTermForFilter = searchTerm || '';

        // Extracting start and end dates from date range
        let startDate = 'לא נבחר';
        let endDate = 'לא נבחר';

        if (selectedDateRange && selectedDateRange !== 'כל זמן') {
            // Translating date range to actual dates
            const dateRange = translateDateRangeToDates(selectedDateRange);
            startDate = dateRange.startDate;
            endDate = dateRange.endDate;
        }

        window.selectedStartDateForFilter = startDate;
        window.selectedEndDateForFilter = endDate;



        // Updating debug panel
        if (typeof updateFilterDebugPanel === 'function') {
            updateFilterDebugPanel();
        }

        // Direct call to local function
        if (typeof window.loadTradePlansData === 'function') {
            window.loadTradePlansData();
        } else {
            handleFunctionNotFound('loadTradePlansData');
        }
    };
}

/**
 * Loading planning data from server
/**
 * יצירת נתוני דמו לתכנונים
 */
function getDemoTradePlansData() {
    // Creating demo trade plans data...
    
    const demoData = [
        {
            id: 1,
            account_id: 1,
            ticker_id: 1,
            investment_type: 'swing',
            side: 'Long',
            status: 'open',
            entry_price: 150.00,
            target_price: 180.00,
            stop_loss: 140.00,
            quantity: 10,
            planned_amount: 1500.00,
            entry_conditions: 'מחיר נכנס מתחת ל-150',
            reasons: 'תנועה טכנית חיובית',
            notes: 'תכנון דמו לבדיקה',
            created_at: '2025-08-30T10:00:00',
            updated_at: '2025-08-30T10:00:00',
            ticker: {
                id: 1,
                symbol: 'AAPL',
                name: 'Apple Inc.',
                status: 'open'
            },
            account: {
                id: 1,
                name: 'חשבון ראשי',
                type: 'checking',
                status: 'open'
            }
        },
        {
            id: 2,
            account_id: 1,
            ticker_id: 2,
            investment_type: 'investment',
            side: 'Long',
            status: 'closed',
            entry_price: 300.00,
            target_price: 350.00,
            stop_loss: 280.00,
            quantity: 5,
            planned_amount: 1500.00,
            entry_conditions: 'מחיר נכנס מתחת ל-300',
            reasons: 'תנועה טכנית חיובית',
            notes: 'תכנון דמו סגור',
            created_at: '2025-08-29T14:30:00',
            updated_at: '2025-08-30T15:00:00',
            ticker: {
                id: 2,
                symbol: 'GOOGL',
                name: 'Alphabet Inc.',
                status: 'open'
            },
            account: {
                id: 1,
                name: 'חשבון ראשי',
                type: 'checking',
                status: 'open'
            }
        }
    ];
    
    // Demo trade plans data created
    return demoData;
}

/**
 * 
 * This function loads all planning from the server and updates the table
 * If server is not available, uses demo data
 * 
 * @returns {Array} Array of planning
 */
async function loadTradePlansData() {
    
    
    try {
        // Loading trade_plans from server...

        // Setting base URL
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const url = `${base}/api/v1/trade_plans/`;
        // Fetching from URL
        
        const response = await fetch(url);
            // Response status check

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();


        // Check if response has data property
        if (!responseData.data) {
            handleValidationError('response data', 'תגובת השרת לא מכילה שדה data');
            trade_plansData = [];
            return [];
        }

        // Check if data is an array
        if (!Array.isArray(responseData.data)) {
            handleValidationError('response data', 'נתוני השרת אינם מערך');
            trade_plansData = [];
            return [];
        }

        trade_plansData = responseData.data;

        // Update the table
        // === UPDATE TRADE PLANS TABLE FUNCTION CALLED ===
        
        updateTradePlansTable(trade_plansData);

        return trade_plansData;

    } catch (error) {
        handleDataLoadError(error, 'נתוני תכנונים');
        
        // Use demo data as fallback
        // Using demo data as fallback
        trade_plansData = getDemoTradePlansData();
        updateTradePlansTable(trade_plansData);
        return trade_plansData;
    }
}

/**
 * עדכון טבלת עיצובים (alias ל-updateTradePlansTable)
 */
function updateDesignsTable(trade_plans) {
    return updateTradePlansTable(trade_plans);
}

/**
 * פילטור מקומי של נתוני תכנונים
 */
function filterDesignsLocally(trade_plans, selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
    // filterDesignsLocally called

    let filteredData = [...trade_plans];

    // פילטור לפי סטטוס
    if (selectedStatuses && selectedStatuses.length > 0) {
        filteredData = filteredData.filter(plan =>
            selectedStatuses.includes(plan.status)
        );
        // After status filter
    }

    // פילטור לפי סוג השקעה
    if (selectedTypes && selectedTypes.length > 0) {
        filteredData = filteredData.filter(plan =>
            selectedTypes.includes(plan.investment_type)
        );
        // After type filter
    }

    // פילטור לפי תאריך
    if (selectedDateRange && selectedDateRange !== 'כל זמן') {
        const dateRange = translateDateRangeToDates(selectedDateRange);
        if (dateRange.startDate && dateRange.endDate) {
            filteredData = filteredData.filter(plan => {
                const planDate = new Date(plan.created_at);
                const startDate = new Date(dateRange.startDate);
                const endDate = new Date(dateRange.endDate);
                return planDate >= startDate && planDate <= endDate;
            });
        }
        // After date filter
    }

    // פילטור לפי חיפוש
    if (searchTerm && searchTerm.trim() !== '') {
        const searchTermLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(plan =>
            plan.ticker?.symbol?.toLowerCase().includes(searchTermLower) ||
            plan.ticker?.name?.toLowerCase().includes(searchTermLower) ||
            plan.entry_conditions?.toLowerCase().includes(searchTermLower) ||
            plan.reasons?.toLowerCase().includes(searchTermLower)
        );
        // After search filter
    }

    // filterDesignsLocally completed
    return filteredData;
}

/**
 * פילטור נתוני תכנונים
 */
function filterTradePlansData(filters) {


    if (!window.tradePlansData || !Array.isArray(window.tradePlansData)) {

        return;
    }

    let filteredData = [...window.tradePlansData];

    // פילטור לפי סטטוס
    if (filters.statuses && filters.statuses.length > 0) {
        filteredData = filteredData.filter(plan =>
            filters.statuses.includes(plan.status)
        );
    }

    // פילטור לפי סוג השקעה
    if (filters.types && filters.types.length > 0) {
        filteredData = filteredData.filter(plan =>
            filters.types.includes(plan.investment_type)
        );
    }

    // פילטור לפי חשבון
    if (filters.accounts && filters.accounts.length > 0) {
        filteredData = filteredData.filter(plan =>
            filters.accounts.includes(plan.account_id)
        );
    }

    // פילטור לפי תאריך
    if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        if (startDate && endDate) {
            filteredData = filteredData.filter(plan => {
                const planDate = new Date(plan.created_at);
                return planDate >= startDate && planDate <= endDate;
            });
        }
    }

    // פילטור לפי חיפוש
    if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(plan =>
            plan.ticker?.symbol?.toLowerCase().includes(searchTerm) ||
            plan.ticker?.name?.toLowerCase().includes(searchTerm) ||
            plan.entry_conditions?.toLowerCase().includes(searchTerm) ||
            plan.reasons?.toLowerCase().includes(searchTerm)
        );
    }



    // עדכון הטבלה
    updateTradePlansTable(filteredData);
}

/**
 * עדכון טבלת תכנונים
 * 
 * פונקציה זו מעדכנת את הטבלה עם הנתונים החדשים
 * כולל המרת ערכים לעברית ועיצוב תאים
 * 
 * @param {Array} trade_plans - מערך של תכנונים לעדכון
 */
function updateTradePlansTable(trade_plans) {
    // === UPDATE TRADE PLANS TABLE FUNCTION CALLED ===

    const tbody = document.querySelector('#trade_plansTable tbody');
    // Looking for table body
    
    if (!tbody) {
        handleElementNotFound('#trade_plansTable tbody', 'CRITICAL');
        return;
    }

    // Checking if there is data to display
    if (!trade_plans || trade_plans.length === 0) {
        // No trade plans to display
        
        // Checking if it's because of filters or if there are no data at all
        const hasOriginalData = trade_plansData && trade_plansData.length > 0;
        // Has original data check

        // Checking if there are active filters
        const hasActiveFilters = (() => {
            // Search check
            if (window.searchTermForFilter && window.searchTermForFilter.trim() !== '') {
                return true;
            }

            // Status check (if not all statuses are selected)
            if (window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0) {
                const allStatuses = ['open', 'closed', 'cancelled'];
                const selectedStatuses = window.selectedStatusesForFilter.map(s => s.toLowerCase());
                if (!allStatuses.every(status => selectedStatuses.includes(status))) {
                    return true;
                }
            }

            // Type check (if not all types are selected)
            if (window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0) {
                const allTypes = ['swing', 'investment', 'passive'];
                const selectedTypes = window.selectedTypesForFilter.map(t => t.toLowerCase());
                if (!allTypes.every(type => selectedTypes.includes(type))) {
                    return true;
                }
            }

            // Date range check
            if (window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן') {
                return true;
            }

            return false;
        })();

        // Has active filters check

        if (hasOriginalData && hasActiveFilters) {
            // There is data but the filter didn't find results
            // Showing "no results" message due to filters
            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-info">
                <i class="fas fa-search"></i> לא נמצאו תוצאות
                <br><small>נסה לשנות את הפילטרים או מונח החיפוש</small>
            </td></tr>`;
        } else {
            // No data at all
            // Showing "no data" message
            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">
                <i class="fas fa-info-circle"></i> אין תכנונים להצגה
                <br><small>לא נמצאו תכנונים במערכת</small>
            </td></tr>`;
        }

        // Updating record count
        const countElement = document.querySelector('#trade_plansCount');
        if (countElement) {
            countElement.textContent = '0 תכנונים';
        }

        // Updating statistics
        updatePageSummaryStats();
        return;
    }

    
    const tableHTML = trade_plans.map(design => {
        // Safeguarding against invalid data
        if (!design || typeof design !== 'object') {
            console.warn('Invalid design data in table:', design);
            return '';
        }



        const statusClass = getStatusClass(design.status);
        const typeClass = getTypeClass(design.investment_type);

        // Date correction - converting to Hebrew format
        let dateDisplay = 'לא מוגדר';

        if (design.created_at) {
            try {
                const dateObj = new Date(design.created_at);

                if (!isNaN(dateObj.getTime())) {
                    dateDisplay = dateObj.toLocaleDateString('he-IL');
                } else {
                    handleValidationError('date', 'תאריך לא תקין');
                }
            } catch (error) {
                handleValidationError('date parsing', 'שגיאה בניתוח תאריך');
            }
        }

        // Type correction - ensuring a valid value is passed
        const typeDisplay = design.investment_type ? (window.translateTradePlanType ? window.translateTradePlanType(design.investment_type) : design.investment_type) : 'לא מוגדר';
        const sideDisplay = design.side === 'Long' ? 'Long' : 'Short';
        const amountDisplay = formatCurrency(design.planned_amount);
        const targetDisplay = formatCurrency(design.target_price);
        const stopDisplay = formatCurrency(design.stop_price);
        const currentDisplay = formatCurrency(design.current || 0);
        const statusDisplay = window.translateTradePlanStatus ? window.translateTradePlanStatus(design.status) : design.status;

        // Displaying ticker symbol or name with link icon
        const tickerDisplay = design.ticker ? (design.ticker.symbol || design.ticker.name || 'לא מוגדר') : 'לא מוגדר';
        const tickerLink = design.ticker ? `<a href="/tickers" title="מעבר לעמוד הטיקרים" style="color: #007bff; text-decoration: none; margin-right: 5px;">🔗</a>` : '';

        // שמירת הערכים המקוריים באנגלית לפילטר
        const typeForFilter = design.investment_type || '';
        const statusForFilter = design.status || '';

        return `
      <tr>
        <td class="ticker-cell">${tickerLink}<span class="ticker-text">${tickerDisplay}</span></td>
        <td data-date="${design.created_at}"><span class="date-text">${dateDisplay}</span></td>
        <td class="type-cell" data-type="${typeForFilter}"><span class="type-badge ${typeClass}">${typeDisplay}</span></td>
        <td class="side-cell" data-side="${design.side}"><span class="side-badge side-${design.side.toLowerCase()}">${sideDisplay}</span></td>
        <td><span class="amount-text">${amountDisplay}</span></td>
        <td class="target-cell"><span class="target-text" style="color: #28a745;">${targetDisplay}</span></td>
        <td class="stop-cell"><span class="stop-text" style="color: #dc3545;">${stopDisplay}</span></td>
        <td><span class="current-text">${currentDisplay}</span></td>
        <td class="status-cell" data-status="${statusForFilter}"><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-info" onclick="viewLinkedItemsForTradePlan(${design.id})" title="צפה באלמנטים מקושרים">
            🔗
          </button>
          ${window.uiUtils ? window.uiUtils.createCancelButton('trade_plan', design.id, design.status, 'sm') : 
            `<button class="btn btn-sm ${design.status === 'cancelled' ? 'btn-outline-success' : 'btn-danger'}" 
                     onclick="window.${design.status === 'cancelled' ? 'reactivateTradePlan' : 'openCancelTradePlanModal'}(${design.id})" 
                     title="${design.status === 'cancelled' ? 'הפעל מחדש' : 'בטל'}"><span class="${design.status === 'cancelled' ? 'reactivate-icon' : 'cancel-icon'}">${design.status === 'cancelled' ? '✓' : 'X'}</span></button>`
          }
          <button class="btn btn-sm btn-secondary" onclick="window.openEditTradePlanModal(${design.id})" title="ערוך">
            ✏️
          </button>
          <button class="btn btn-sm btn-danger" onclick="window.openDeleteTradePlanModal(${design.id})" title="מחק">
            🗑️
          </button>
        </td>
      </tr>
    `;
    }).join('');

    tbody.innerHTML = tableHTML;

    // Updating record count
    const countElement = document.querySelector('#trade_plansCount');
    if (countElement) {
        countElement.textContent = `${trade_plans.length} תכנונים`;
    }

    // Updating statistics
    updatePageSummaryStats();
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updatePageSummaryStats() {
    // Using filtered data if available, otherwise all data
    const dataToUse = window.filteredTradePlansData || trade_plansData;
    const totalDesigns = dataToUse.length;
    const openDesigns = dataToUse.filter(design => design.status === 'open').length;
    const closedDesigns = dataToUse.filter(design => design.status === 'closed').length;
    const cancelledDesigns = dataToUse.filter(design => design.status === 'cancelled').length;

    // Calculating sums
    let totalInvestment = 0;
    let totalProfit = 0;

    trade_plansData.forEach(design => {
        // Safeguarding against invalid data
        if (!design || typeof design !== 'object') {
            console.warn('Invalid design data:', design);
            return;
        }

        // Handling data from server (numbers) or strings
        let amount = 0;
        if (design.amount !== null && design.amount !== undefined) {
            if (typeof design.amount === 'string') {
                amount = parseFloat(design.amount.replace(/[$,]/g, '')) || 0;
            } else {
                amount = parseFloat(design.amount) || 0;
            }
        }
        totalInvestment += amount;

        // Simple profit calculation (for example)
        if (design.status === 'closed') {
            let current = 0;
            let target = 0;

            if (design.current !== null && design.current !== undefined) {
                if (typeof design.current === 'string') {
                    current = parseFloat(design.current.replace(/[$,]/g, '')) || 0;
                } else {
                    current = parseFloat(design.current) || 0;
                }
            }

            if (design.target !== null && design.target !== undefined) {
                if (typeof design.target === 'string') {
                    target = parseFloat(design.target.replace(/[$,]/g, '')) || 0;
                } else {
                    target = parseFloat(design.target) || 0;
                }
            }

            if (current > target) {
                totalProfit += amount * 0.1; // 10% profit for example
            }
        }
    });

    const avgInvestment = totalDesigns > 0 ? totalInvestment / totalDesigns : 0;

    // עדכון אלמנטי הסיכום - בדיקה אם הם קיימים לפני הגישה
    const totalDesignsElement = document.getElementById('totalDesigns');
    if (totalDesignsElement) {
        totalDesignsElement.textContent = totalDesigns;
    }

    const totalInvestmentElement = document.getElementById('totalInvestment');
    if (totalInvestmentElement) {
        totalInvestmentElement.textContent = formatCurrency(totalInvestment);
    }

    const avgInvestmentElement = document.getElementById('avgInvestment');
    if (avgInvestmentElement) {
        avgInvestmentElement.textContent = formatCurrency(avgInvestment);
    }

    const totalProfitElement = document.getElementById('totalProfit');
    if (totalProfitElement) {
        totalProfitElement.textContent = formatCurrency(totalProfit);
    }

    // עדכון מספר הרשומות בטבלה
    const countElement = document.getElementById('designsCount');
    if (countElement) {
        countElement.textContent = `${totalDesigns} רשומות`;
    }
}

/**
 * הצגת מודל הוספת תכנון
 */
function showAddTradePlanModal() {
    // Clearing the form completely
    const form = document.getElementById('addTradePlanForm');
    if (form) {
        form.reset();
        
        // Clear all form fields manually to ensure complete reset
        const allInputs = form.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            if (input.type !== 'date') {
                input.value = '';
                input.classList.remove('is-valid', 'is-invalid');
            }
        });
        
        // Clear any validation messages
        const validationMessages = form.querySelectorAll('.invalid-feedback');
        validationMessages.forEach(msg => msg.remove());
    }

    // Set default values for required fields
    const investmentTypeSelect = document.getElementById('addTradePlanInvestmentType');
    if (investmentTypeSelect) {
        investmentTypeSelect.value = 'swing'; // Default investment type
    }

    const sideSelect = document.getElementById('addTradePlanSide');
    if (sideSelect) {
        sideSelect.value = 'Long'; // Default side
    }

    const plannedAmountInput = document.getElementById('addTradePlanPlannedAmount');
    if (plannedAmountInput) {
        plannedAmountInput.value = '1000'; // Default planned amount
    }

    // Setting today's date
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('addTradePlanDate');
    if (dateInput) {
        dateInput.value = today;
    }

    // Loading tickers from server
    if (typeof window.tickerService?.loadTickersForTradePlan === 'function') {
        window.tickerService.loadTickersForTradePlan();
    } else {
        console.warn('⚠️ tickerService.loadTickersForTradePlan not available');
    }

    // Clear any existing validation errors
    if (typeof window.clearValidation === 'function') {
        window.clearValidation('addTradePlanForm');
    }
    
    // Initialize real-time validation for the form
    if (typeof window.initializeValidation === 'function') {
        const validationRules = {
            'addTradePlanTickerId': { 
                required: true, 
                type: 'select',
                message: 'יש לבחור טיקר'
            },
            'addTradePlanInvestmentType': { 
                required: true, 
                type: 'select',
                message: 'יש לבחור סוג השקעה',
                customValidation: (value) => {
                    const validTypes = ['swing', 'investment', 'passive'];
                    if (!validTypes.includes(value)) {
                        return 'סוג השקעה לא תקין';
                    }
                    return true;
                }
            },
            'addTradePlanSide': { 
                required: true, 
                type: 'select',
                message: 'יש לבחור צד',
                customValidation: (value) => {
                    const validSides = ['Long', 'Short'];
                    if (!validSides.includes(value)) {
                        return 'צד לא תקין';
                    }
                    return true;
                }
            },
            'addTradePlanPlannedAmount': { 
                required: true, 
                type: 'number',
                min: 0.01,
                max: 999999999,
                message: 'יש להזין סכום מתוכנן',
                customValidation: (value) => {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        return 'סכום מתוכנן חייב להיות מספר';
                    }
                    if (numValue <= 0) {
                        return 'סכום מתוכנן חייב להיות חיובי';
                    }
                    return true;
                }
            },
            'addTradePlanStopPrice': { 
                type: 'number',
                min: 0.01,
                max: 999999999,
                customValidation: (value) => {
                    if (value && value !== '') {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) {
                            return 'מחיר עצירה חייב להיות מספר';
                        }
                        if (numValue <= 0) {
                            return 'מחיר עצירה חייב להיות חיובי';
                        }
                    }
                    return true;
                }
            },
            'addTradePlanTargetPrice': { 
                type: 'number',
                min: 0.01,
                max: 999999999,
                customValidation: (value) => {
                    if (value && value !== '') {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) {
                            return 'מחיר יעד חייב להיות מספר';
                        }
                        if (numValue <= 0) {
                            return 'מחיר יעד חייב להיות חיובי';
                        }
                    }
                    return true;
                }
            },
            'addTradePlanEntryConditions': {
                type: 'text',
                maxLength: 500,
                customValidation: (value) => {
                    if (value && value.length > 500) {
                        return 'תנאי כניסה לא יכול להיות יותר מ-500 תווים';
                    }
                    return true;
                }
            },
            'addTradePlanReasons': {
                type: 'text',
                maxLength: 500,
                customValidation: (value) => {
                    if (value && value.length > 500) {
                        return 'סיבות לא יכולות להיות יותר מ-500 תווים';
                    }
                    return true;
                }
            }
        };
        
        try {
            window.initializeValidation('addTradePlanForm', validationRules);
        } catch (error) {
            handleSystemError(error, 'אתחול ולידציה');
        }
    } else {
        console.warn('⚠️ window.initializeValidation not available');
    }

    // השבתת כל השדות עד לבחירת טיקר
    const fieldsToDisable = [
        'addTradePlanInvestmentType',
        'addTradePlanSide',
        'addTradePlanPlannedAmount',
        'addTradePlanShares',
        'addTradePlanStopPrice',
        'addTradePlanTargetPrice',
        'addTradePlanEntryConditions',
        'addTradePlanReasons'
    ];

    fieldsToDisable.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.disabled = true;
            field.value = '';
            // הסרת required מהשדות המושבתים
            field.removeAttribute('required');
        }
    });

    // ניקוי תצוגת הטיקר
    const tickerDisplay = document.getElementById('selectedTickerDisplay');
    const priceDisplay = document.getElementById('currentPriceDisplay');
    const changeDisplay = document.getElementById('dailyChangeDisplay');

    if (tickerDisplay) tickerDisplay.textContent = 'לא נבחר';
    if (priceDisplay) priceDisplay.textContent = '-';
    if (changeDisplay) {
        changeDisplay.textContent = '-';
        changeDisplay.style.color = '#6c757d';
    }

    // Loading tickers from server
    if (typeof window.tickerService?.loadTickersForTradePlan === 'function') {
        window.tickerService.loadTickersForTradePlan();
    } else {
        console.warn('⚠️ tickerService.loadTickersForTradePlan not available');
    }

    // Displaying the modal
    const modalElement = document.getElementById('addTradePlanModal');
    if (modalElement) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
        }
    }
}

/**
 * שמירת תכנון חדש
 */
async function saveNewTradePlan() {
    const form = document.getElementById('addTradePlanForm');
    if (!form) {
        console.warn('⚠️ Form element not found - skipping save operation');
        return;
    }

    // ===== VALIDATION SYSTEM - Using Global Validation Utils =====
    
    // Define validation rules
    const validationRules = {
        'addTradePlanTickerId': { 
            required: true, 
            message: 'יש לבחור טיקר'
        },
        'addTradePlanInvestmentType': { 
            required: true, 
            message: 'יש לבחור סוג השקעה',
            customValidation: (value) => {
                const validTypes = ['swing', 'investment', 'passive'];
                if (!validTypes.includes(value)) {
                    return 'סוג השקעה לא תקין';
                }
                return true;
            }
        },
        'addTradePlanSide': { 
            required: true, 
            message: 'יש לבחור צד',
            customValidation: (value) => {
                const validSides = ['Long', 'Short'];
                if (!validSides.includes(value)) {
                    return 'צד לא תקין';
                }
                return true;
            }
        },
        'addTradePlanPlannedAmount': { 
            required: true, 
            message: 'יש להזין סכום מתוכנן',
            min: 0.01,
            max: 999999999,
            customValidation: (value) => {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    return 'סכום מתוכנן חייב להיות מספר';
                }
                if (numValue <= 0) {
                    return 'סכום מתוכנן חייב להיות חיובי';
                }
                return true;
            }
        },
        'addTradePlanStopPrice': { 
            min: 0.01,
            max: 999999999,
            customValidation: (value) => {
                if (value && value !== '') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        return 'מחיר עצירה חייב להיות מספר';
                    }
                    if (numValue <= 0) {
                        return 'מחיר עצירה חייב להיות חיובי';
                    }
                }
                return true;
            }
        },
        'addTradePlanTargetPrice': { 
            min: 0.01,
            max: 999999999,
            customValidation: (value) => {
                if (value && value !== '') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        return 'מחיר יעד חייב להיות מספר';
                    }
                    if (numValue <= 0) {
                        return 'מחיר יעד חייב להיות חיובי';
                    }
                }
                return true;
            }
        },
        'addTradePlanEntryConditions': {
            maxLength: 500,
            customValidation: (value) => {
                if (value && value.length > 500) {
                    return 'תנאי כניסה לא יכול להיות יותר מ-500 תווים';
                }
                return true;
            }
        },
        'addTradePlanReasons': {
            maxLength: 500,
            customValidation: (value) => {
                if (value && value.length > 500) {
                    return 'סיבות לא יכולות להיות יותר מ-500 תווים';
                }
                return true;
            }
        }
    };

    // Use global validation system
    // === VALIDATION CHECK ===
    // window.validateForm available check
    // validationRules check
    
    if (typeof window.validateForm === 'function') {
        // Calling window.validateForm
        const validationResult = window.validateForm('addTradePlanForm', validationRules);
        // Validation result
        
        // בדיקה אם התוצאה היא אובייקט עם isValid או ערך בוליאני
        const isValid = typeof validationResult === 'object' ? validationResult.isValid : validationResult;
        
        if (!isValid) {
            return;
        }
    } else {
        // Fallback validation if global system is not available
        const tickerId = document.getElementById('addTradePlanTickerId').value;
        const investmentType = document.getElementById('addTradePlanInvestmentType').value;
        const side = document.getElementById('addTradePlanSide').value;
        const plannedAmount = document.getElementById('addTradePlanPlannedAmount').value;
        
        if (!tickerId || !investmentType || !side || !plannedAmount) {
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בטופס', 'יש למלא את כל השדות החובה');
            }
            return;
        }
    }

    // Get form values with proper validation
    const tickerIdValue = document.getElementById('addTradePlanTickerId').value;
    const investmentTypeValue = document.getElementById('addTradePlanInvestmentType').value;
    const sideValue = document.getElementById('addTradePlanSide').value;
    const plannedAmountValue = document.getElementById('addTradePlanPlannedAmount').value;
    const stopPriceValue = document.getElementById('addTradePlanStopPrice').value;
    const targetPriceValue = document.getElementById('addTradePlanTargetPrice').value;

    // Form values before processing

    const formData = {
        account_id: 1, // Default to main account
        ticker_id: tickerIdValue && tickerIdValue !== '' ? parseInt(tickerIdValue) : null,
        investment_type: investmentTypeValue || '',
        side: sideValue || '',
        planned_amount: plannedAmountValue && plannedAmountValue !== '' ? parseFloat(plannedAmountValue) : 0,
        stop_price: stopPriceValue && stopPriceValue !== '' ? parseFloat(stopPriceValue) : null,
        target_price: targetPriceValue && targetPriceValue !== '' ? parseFloat(targetPriceValue) : null,
        entry_conditions: document.getElementById('addTradePlanEntryConditions').value || '',
        reasons: document.getElementById('addTradePlanReasons').value || '',
        status: 'open' // Default to open status
    };

    // Sending new trade plan

    // Additional validation before sending - רק אם המערכת הגלובלית לא זמינה
    if (typeof window.validateForm !== 'function') {
        if (!formData.ticker_id) {
            showFieldError('addTradePlanTickerId', 'יש לבחור טיקר');
            showErrorNotification('שגיאה בטופס', 'יש לבחור טיקר');
            return;
        }

        if (!formData.investment_type || formData.investment_type === '') {
            showFieldError('addTradePlanInvestmentType', 'יש לבחור סוג השקעה');
            showErrorNotification('שגיאה בטופס', 'יש לבחור סוג השקעה');
            return;
        }

        if (!formData.side || formData.side === '') {
            showFieldError('addTradePlanSide', 'יש לבחור צד');
            showErrorNotification('שגיאה בטופס', 'יש לבחור צד');
            return;
        }

        if (!formData.planned_amount || formData.planned_amount <= 0) {
            showFieldError('addTradePlanPlannedAmount', 'סכום מתוכנן חייב להיות גדול מ-0');
            showErrorNotification('שגיאה בטופס', 'סכום מתוכנן חייב להיות גדול מ-0');
            return;
        }
    }

    try {
        const response = await fetch('/api/v1/trade_plans/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // Detailed log of the response
        // Server response check

        if (!response.ok) {
            const errorText = await response.text();
            handleApiError('Error response from server', errorText);
            
            // Try to parse JSON error response
            try {
                const errorData = JSON.parse(errorText);
                // Parsed error data
                
                // Handle validation errors from server
                if (errorData.error && errorData.error.message) {
                    const errorMessage = errorData.error.message;
                    // Error message
                    
                    // Parse the error message to identify specific field issues
                    if (errorMessage.includes('investment_type')) {
                        showFieldError('addTradePlanInvestmentType', 'יש לבחור סוג השקעה תקין');
                    }
                    if (errorMessage.includes('side')) {
                        showFieldError('addTradePlanSide', 'יש לבחור צד תקין (Long או Short)');
                    }
                    if (errorMessage.includes('planned_amount')) {
                        showFieldError('addTradePlanPlannedAmount', 'סכום מתוכנן חייב להיות גדול מ-0');
                    }
                    if (errorMessage.includes('ticker_id')) {
                        showFieldError('addTradePlanTickerId', 'יש לבחור טיקר');
                    }
                    
                    showErrorNotification('שגיאה בטופס', 'יש לתקן את השגיאות בטופס לפני השמירה');
                    return;
                }
            } catch (e) {
                handleSystemError(e, 'ניתוח תגובת JSON');
            }
            
            throw new Error(`Error saving trade plan: ${response.status} - ${errorText}`);
        }

        if (response.ok) {
            const newDesign = await response.json();

            // Closing the modal
            closeModal('addTradePlanModal');

            // Refreshing data
            loadTradePlansData();

            // Displaying success message
            showSuccessNotification('Trade plan saved', 'Trade plan saved successfully!');
        } else {
            throw new Error(`Error saving trade plan: ${response.status}`);
        }
    } catch (error) {
        handleSaveError(error, 'שמירת תכנון');
        showErrorNotification('Error saving trade plan', 'Error saving trade plan: ' + error.message);
    }
}

/**
 * המרת שם שדה מהשרת ל-ID של השדה בטופס
 */
function getFieldIdFromServerField(serverField) {
    const fieldMapping = {
        'ticker_id': 'addTradePlanTickerId',
        'investment_type': 'addTradePlanInvestmentType',
        'side': 'addTradePlanSide',
        'planned_amount': 'addTradePlanPlannedAmount',
        'stop_price': 'addTradePlanStopPrice',
        'target_price': 'addTradePlanTargetPrice'
    };
    return fieldMapping[serverField] || null;
}

/**
 * עריכת תכנון
 */
function editTradePlan(designId) {
    // קריאה לפונקציה הגלובלית לפתיחת מודל עריכה
    if (typeof window.openEditTradePlanModal === 'function') {
        window.openEditTradePlanModal(designId);
    } else {
        handleFunctionNotFound('openEditTradePlanModal');
        showErrorNotification('Error opening edit modal', 'Edit modal function not found');
    }
}



/**
 * מחיקת תכנון
 */
async function deleteTradePlan(tradePlanId) {
    try {
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/${tradePlanId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // הצגת הודעת הצלחה
        if (typeof window.showNotification === 'function') {
            window.showNotification('תכנון נמחק בהצלחה!', 'success');
        }

        // רענון הטבלה
        await loadTradePlansData();

    } catch (error) {
        handleDeleteError(error, 'תכנון');
        
        let errorMessage = 'שגיאה במחיקת התכנון';
        let hasLinkedItems = false;
        
        try {
            const errorData = JSON.parse(error.message);
            errorMessage = errorData.error?.message || errorMessage;
            
            // בדיקה אם השגיאה היא על פריטים מקושרים
            if (errorMessage.includes('פריטים מקושרים') || errorMessage.includes('linked items')) {
                hasLinkedItems = true;
            }
        } catch {
            errorMessage = error.message || errorMessage;
        }
        
        if (hasLinkedItems) {
            // הצגת חלון מקושרים באמצעות המערכת הכללית
            if (typeof window.showLinkedItemsModal === 'function') {
                try {
                    const response = await fetch(`/api/v1/linked-items/trade_plan/${tradePlanId}`);
                    if (response.ok) {
                        const data = await response.json();
                        window.showLinkedItemsModal(data, 'trade_plan', tradePlanId);
                    } else {
                        throw new Error('Failed to load linked items data');
                    }
                } catch (linkedError) {
                    handleDataLoadError(linkedError, 'פריטים מקושרים');
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('לא ניתן למחוק תכנון שיש לו פריטים מקושרים', 'error');
                    }
                }
            } else {
                handleFunctionNotFound('showLinkedItemsModal');
                if (typeof window.showNotification === 'function') {
                    window.showNotification('לא ניתן למחוק תכנון שיש לו פריטים מקושרים', 'error');
                }
            }
        } else {
            // הצגת הודעת שגיאה רגילה
            if (typeof window.showNotification === 'function') {
                window.showNotification(errorMessage, 'error');
            }
        }
    }
}



/**
 * סגירת מודל - שימוש בפונקציה גלובלית
 * @deprecated Use window.closeModal from main.js instead
 */
function closeModal(modalId) {
    // שימוש בפונקציה הגלובלית
    if (typeof window.closeModalGlobal === 'function') {
        window.closeModalGlobal(modalId);
    } else {
        // Fallback to Bootstrap modal
        const modal = document.getElementById(modalId);
        if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
    }
}

/**
 * פילטור נתוני תכנונים
 */
function filterDesignsData(statuses, types, accounts, dateRange, searchTerm) {


    // Calling global function with pageName
    if (typeof window.updateGridFromComponentGlobal === 'function') {
        window.updateGridFromComponentGlobal(statuses, types, accounts, dateRange, searchTerm, 'planning');
    }
}

/**
 * פונקציה לסידור הטבלה
 * 
 * פונקציה זו משתמשת במערכת הסידור הגלובלית מ-main.js
 * כדי לסדר את טבלת התכנונים לפי העמודה הנבחרת.
 * 
 * הפונקציה:
 * - משתמשת ב-sortTableData הגלובלית
 * - מעדכנת את הנתונים המסוננים
 * - שומרת את מצב הסידור ב-localStorage
 * 
 * @param {number} columnIndex - אינדקס העמודה לסידור (0-8)
 * 
 * @example
 * sortTable(0); // Sort by asset column
 * sortTable(1); // Sort by date column
 * sortTable(8); // Sort by status column
 * 
 * @requires window.sortTableData - Global function from main.js
 * @requires window.filteredTradePlansData - Filtered data
 * @requires trade_plansData - Original data
 * @requires updateDesignsTable - Function to update table
 * 
 * @since 2.0
 */
function sortTable(columnIndex) {
    // Using global function from tables.js
    if (typeof window.sortTableData === 'function') {
        window.sortTableData(
            columnIndex,
            window.filteredTradePlansData || trade_plansData,
            'trade_plans',
            updateDesignsTable
        );
    } else {
        handleFunctionNotFound('sortTableData');
        // Fallback to local sorting if global function not available
        performLocalSort(columnIndex);
    }
}

/**
 * פונקציה מקומית לסידור (fallback)
 * Local sorting function (fallback)
 */
function performLocalSort(columnIndex) {
    const data = window.filteredTradePlansData || trade_plansData;
    const currentSortState = window.getSortState ? window.getSortState('trade_plans') : { columnIndex: -1, direction: 'asc' };

    // קביעת כיוון הסידור
    let direction = 'asc';
    if (currentSortState.columnIndex === columnIndex) {
        direction = currentSortState.direction === 'asc' ? 'desc' : 'asc';
    }

    // שמירת מצב הסידור
    if (window.saveSortState) {
        window.saveSortState('trade_plans', columnIndex, direction);
    }

    // סידור הנתונים
    const sortedData = [...data].sort((a, b) => {
        let aValue = getPlanningColumnValue(a, columnIndex);
        let bValue = getPlanningColumnValue(b, columnIndex);

        // המרה למספרים אם אפשר
        if (!isNaN(aValue) && !isNaN(bValue)) {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        }

        // המרה לתאריכים אם אפשר
        if (isDateValue(aValue) && isDateValue(bValue)) {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        // סידור
        if (aValue < bValue) {
            return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // עדכון הטבלה
    updateDesignsTable(sortedData);
    window.filteredTradePlansData = sortedData;


}

/**
 * קבלת ערך עמודה לטבלת תכנונים
 * Get column value for planning table
 */
function getPlanningColumnValue(item, columnIndex) {
    const columns = ['ticker', 'created_at', 'investment_type', 'side', 'planned_amount', 'target_price', 'stop_price', 'current', 'status'];
    const fieldName = columns[columnIndex];

    if (!fieldName) {
        console.warn(`⚠️ No column mapping found for planning column ${columnIndex}`);
        return '';
    }

    // טיפול מיוחד בשדות מורכבים
    if (fieldName === 'ticker') {
        return item.ticker ? (item.ticker.symbol || item.ticker.name || '') : '';
    }

    return item[fieldName] || '';
}

/**
 * בדיקה אם ערך הוא תאריך
 * Check if value is a date
 */
function isDateValue(value) {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
}

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
function restoreSortState() {

    if (typeof window.restoreAnyTableSort === 'function') {
        window.restoreAnyTableSort('planning', trade_plansData, updateDesignsTable);
    } else {
        handleFunctionNotFound('restoreAnyTableSort');
    }
}

/**
 * Getting status class
 */
function getStatusClass(status) {
    // Safeguarding against invalid values
    if (status === null || status === undefined) {
        return 'status-cancelled';
    }

    switch (status) {
        case 'open': return 'status-open';
        case 'closed': return 'status-closed';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-cancelled';
    }
}

/**
 * Getting CSS class for type
 */
function getTypeClass(type) {
    // Safeguarding against invalid values
    if (type === null || type === undefined) {
        return 'type-other';
    }

    switch (type) {
        case 'swing': return 'type-swing';
        case 'investment': return 'type-investment';
        case 'passive': return 'type-passive';
        default: return 'type-other';
    }
}

/**
 * Getting type display
 */
// פונקציה הועברה ל-translation-utils.js בשם translateTradePlanType

/**
 * Getting status display
 */
// פונקציה הועברה ל-translation-utils.js בשם translateTradePlanStatus

/**
 * טעינת העדפות המשתמש
 */
function loadUserPreferences() {
    try {
        const response = fetch('/config/preferences.json');
        if (response.ok) {
            const preferences = response.json();
            return preferences.user || preferences.defaults;
        }
    } catch (error) {
        handleDataLoadError(error, 'העדפות משתמש');
    }
    return null;
}

/**
 * יצירת תאריך עם timezone נכון
 */
function createDateWithTimezone(year, month, day) {
    const preferences = loadUserPreferences();
    const timezone = preferences?.timezone || 'Asia/Jerusalem';

    // Creating date with timezone
    const date = new Date(year, month, day);
    const options = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };

    return date.toLocaleDateString('en-CA', options); // YYYY-MM-DD format
}

/**
 * תרגום טווח תאריכים לתאריכים אמיתיים
 */
function translateDateRangeToDates(dateRange) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    let startDate = 'לא נבחר';
    let endDate = 'לא נבחר';

    if (typeof dateRange === 'string') {
        switch (dateRange) {
            case 'היום':
                startDate = todayStr;
                endDate = todayStr;
                break;

            case 'אתמול':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                startDate = yesterday.toISOString().split('T')[0];
                endDate = startDate;
                break;

            case 'שבוע אחרון':
                const weekAgoLast = new Date(today);
                weekAgoLast.setDate(today.getDate() - 7);
                startDate = weekAgoLast.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'חודש אחרון':
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                startDate = monthAgo.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case '3 חודשים אחרונים':
                const threeMonthsAgo = new Date(today);
                threeMonthsAgo.setMonth(today.getMonth() - 3);
                startDate = threeMonthsAgo.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case '6 חודשים אחרונים':
                const sixMonthsAgo = new Date(today);
                sixMonthsAgo.setMonth(today.getMonth() - 6);
                startDate = sixMonthsAgo.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'שנה אחרונה':
                const yearAgo = new Date(today);
                yearAgo.setFullYear(today.getFullYear() - 1);
                startDate = yearAgo.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'השבוע':
                const startOfWeek = new Date(today);
                const dayOfWeek = today.getDay();
                // In Israel, the week starts on Sunday (0)
                startOfWeek.setDate(today.getDate() - dayOfWeek);
                startDate = startOfWeek.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'שבוע':
                const weekAgo7 = new Date(today);
                weekAgo7.setDate(today.getDate() - 7);
                startDate = weekAgo7.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'החודש':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate = startOfMonth.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'MTD':
                startDate = createDateWithTimezone(today.getFullYear(), today.getMonth(), 1);
                endDate = todayStr;

                break;

            case 'השנה':
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                startDate = startOfYear.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'YTD':
                startDate = createDateWithTimezone(today.getFullYear(), 0, 1);
                endDate = todayStr;

                break;

            case '30 יום':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                startDate = thirtyDaysAgo.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case '60 יום':
                const sixtyDaysAgo = new Date(today);
                sixtyDaysAgo.setDate(today.getDate() - 60);
                startDate = sixtyDaysAgo.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case '90 יום':
                const ninetyDaysAgo = new Date(today);
                ninetyDaysAgo.setDate(today.getDate() - 90);
                startDate = ninetyDaysAgo.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'שנה':
                const oneYearAgo = new Date(today);
                oneYearAgo.setFullYear(today.getFullYear() - 1);
                startDate = oneYearAgo.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'שנה קודמת':
                startDate = createDateWithTimezone(today.getFullYear() - 1, 0, 1);
                endDate = createDateWithTimezone(today.getFullYear() - 1, 11, 31);

                break;

            default:
                // Attempting to extract dates from text
                if (dateRange.includes(' - ')) {
                    const dates = dateRange.split(' - ');
                    startDate = dates[0] || 'לא נבחר';
                    endDate = dates[1] || 'לא נבחר';
                } else if (dateRange.includes(' עד ')) {
                    const dates = dateRange.split(' עד ');
                    startDate = dates[0] || 'לא נבחר';
                    endDate = dates[1] || 'לא נבחר';
                } else {
                    startDate = dateRange;
                    endDate = dateRange;
                }
                break;
        }
    } else if (dateRange && dateRange.startDate && dateRange.endDate) {
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
    }


    return { startDate, endDate };
}

/**
 * עדכון חלון בדיקת פילטרים
 */
function updateFilterDebugPanel() {
    const statusesElement = document.getElementById('debugSelectedStatuses');
    const typesElement = document.getElementById('debugSelectedTypes');
    const dateRangeElement = document.getElementById('debugSelectedDateRange');
    const startDateElement = document.getElementById('debugStartDate');
    const endDateElement = document.getElementById('debugEndDate');
    const searchElement = document.getElementById('debugSearchTerm');
    const statusElement = document.getElementById('debugFilterStatus');

    if (statusesElement) {
        const statuses = window.selectedStatusesForFilter || [];
        statusesElement.textContent = statuses.length > 0 ? statuses.join(', ') : 'לא נבחרו';
        statusesElement.style.color = statuses.length > 0 ? '#007bff' : '#6c757d';
    }

    if (typesElement) {
        const types = window.selectedTypesForFilter || [];
        typesElement.textContent = types.length > 0 ? types.join(', ') : 'לא נבחרו';
        typesElement.style.color = types.length > 0 ? '#007bff' : '#6c757d';
    }

    if (dateRangeElement) {
        const dateRange = window.selectedDateRangeForFilter || 'כל זמן';
        dateRangeElement.textContent = dateRange !== 'כל זמן' ? dateRange : 'לא נבחר';
        dateRangeElement.style.color = dateRange !== 'כל זמן' ? '#007bff' : '#6c757d';
    }

    if (startDateElement) {
        const startDate = window.selectedStartDateForFilter || 'לא נבחר';
        startDateElement.textContent = startDate;
        startDateElement.style.color = startDate !== 'לא נבחר' ? '#007bff' : '#6c757d';
    }

    if (endDateElement) {
        const endDate = window.selectedEndDateForFilter || 'לא נבחר';
        endDateElement.textContent = endDate;
        endDateElement.style.color = endDate !== 'לא נבחר' ? '#007bff' : '#6c757d';
    }

    if (searchElement) {
        const search = window.searchTermForFilter || '';
        searchElement.textContent = search.trim() !== '' ? search : 'ריק';
        searchElement.style.color = search.trim() !== '' ? '#007bff' : '#6c757d';
    }

    if (statusElement) {
        const hasActiveFilters = (window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0) ||
            (window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0) ||
            (window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן') ||
            (window.selectedStartDateForFilter && window.selectedStartDateForFilter !== 'לא נבחר') ||
            (window.selectedEndDateForFilter && window.selectedEndDateForFilter !== 'לא נבחר') ||
            (window.searchTermForFilter && window.searchTermForFilter.trim() !== '');

        statusElement.textContent = hasActiveFilters ? 'פעיל' : 'לא פעיל';
        statusElement.style.color = hasActiveFilters ? '#28a745' : '#6c757d';
    }


}

/**
 * פילטור מקומי של נתוני תכנונים
 * פונקציה זו מספקת פילטור מקומי כאשר הפונקציה הגלובלית לא זמינה
 */
function filterTradePlansLocally(data, statuses, types, dateRange, searchTerm) {

    if (!data || !Array.isArray(data)) {

        return [];
    }

    let filteredData = [...data];

    // פילטור לפי סטטוס
    if (statuses && statuses.length > 0) {
        filteredData = filteredData.filter(plan =>
            statuses.includes(plan.status)
        );
    }

    // פילטור לפי סוג השקעה
    if (types && types.length > 0) {
        filteredData = filteredData.filter(plan =>
            types.includes(plan.investment_type)
        );
    }

    // פילטור לפי תאריך
    if (dateRange && dateRange !== 'כל זמן') {
        // כאן אפשר להוסיף לוגיקת פילטור לפי תאריך

    }

    // פילטור לפי חיפוש
    if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(plan =>
            (plan.ticker?.symbol && plan.ticker.symbol.toLowerCase().includes(term)) ||
            (plan.ticker?.name && plan.ticker.name.toLowerCase().includes(term)) ||
            (plan.entry_conditions && plan.entry_conditions.toLowerCase().includes(term)) ||
            (plan.reasons && plan.reasons.toLowerCase().includes(term))
        );
    }


    return filteredData;
}

// formatCurrency is available globally from translation-utils.js as window.formatCurrency

/**
 * שחזור מצב הסקשנים
 * 
 * פונקציה זו משתמשת בפונקציה הגלובלית מ-main.js
 */
// restoreDesignsSectionState is already defined in page-utils.js

// Global functions are now properly defined in main.js

// Initialization
document.addEventListener('DOMContentLoaded', function () {

    // Restoring section state
    if (typeof window.restoreAllSectionStates === 'function') {
        window.restoreAllSectionStates();
    } else {
        // Fallback to local section state restoration
        restorePlanningSectionState();
    }

    // Initializing filters
    if (typeof window.initializePageFilters === 'function') {
        window.initializePageFilters('planning');
    }

    // Loading data
    loadTradePlansData();

    // Updating debug panel on page load
    setTimeout(() => {
        updateFilterDebugPanel();
    }, 1000);

    // Loading sort state
    if (typeof window.loadSortState === 'function') {
        window.loadSortState('planning');
    }

    // שחזור מצב סידור
    restoreSortState();
});

// updateGridFromComponent is already defined at the beginning of the file

// Adding functions to global scope
window.loadTradePlansData = loadTradePlansData;
window.updateTradePlansTable = updateTradePlansTable;
window.showAddTradePlanModal = showAddTradePlanModal;
window.saveNewTradePlan = saveNewTradePlan;
window.editTradePlan = editTradePlan;
window.deleteTradePlan = deleteTradePlan;
window.filterTradePlansData = filterTradePlansData;
window.sortTable = sortTable;
window.filterTradePlansLocally = filterTradePlansLocally;
window.updateFilterDebugPanel = updateFilterDebugPanel;
window.translateDateRangeToDates = translateDateRangeToDates;
window.restoreSortState = restoreSortState;
window.restoreDesignsSectionState = restoreDesignsSectionState;

// Adding toggle functions to global scope
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restorePlanningSectionState = restorePlanningSectionState;


// Export validation functions
// Global validation functions are already exported from validation-utils.js
// No local validation functions to export

// פונקציות חסרות
window.loadPlanningData = function () {
    loadTradePlansData();
};

window.setupSortableHeaders = function () {
    // הפונקציה כבר מוגדרת ב-main.js
    if (typeof window.setupSortableHeadersGlobal === 'function') {
        window.setupSortableHeadersGlobal('planning');
    } else {
        console.warn('⚠️ setupSortableHeadersGlobal not found - using local function');
        // שימוש בפונקציה מקומית אם הגלובלית לא קיימת
        setupSortableHeadersLocal();
    }
};

function setupSortableHeadersLocal() {
    const headers = document.querySelectorAll('#trade_plansTable th[onclick]');
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.title = 'לחץ למיון';
    });
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleTopSection() {
    const topSection = document.querySelector('.top-section');

    if (!topSection) {
        handleElementNotFound('top-section', 'CRITICAL');
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
        localStorage.setItem('planningTopSectionCollapsed', !isCollapsed);
    }
}

function toggleMainSection() {
    const contentSections = document.querySelectorAll('.content-section');
    const planningSection = contentSections[0]; // הסקשן הראשון - תכנונים

    if (!planningSection) {
        handleElementNotFound('planning section', 'CRITICAL');
        return;
    }

    const sectionBody = planningSection.querySelector('.section-body');
    const toggleBtn = planningSection.querySelector('button[onclick="toggleMainSection()"]');
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
        localStorage.setItem('planningMainSectionCollapsed', !isCollapsed);
    }
}

// פונקציה לשחזור מצב הסגירה
function restorePlanningSectionState() {
    // שחזור מצב top-section (התראות וסיכום)
            const topCollapsed = localStorage.getItem('planningTopSectionCollapsed') === 'true';
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

    // שחזור מצב סקשן התכנונים
            const planningCollapsed = localStorage.getItem('planningMainSectionCollapsed') === 'true';
    const contentSections = document.querySelectorAll('.content-section');
    const planningSection = contentSections[0];

    if (planningSection) {
        const sectionBody = planningSection.querySelector('.section-body');
        const toggleBtn = planningSection.querySelector('button[onclick="toggleMainSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && planningCollapsed) {
            sectionBody.style.display = 'none';
            if (icon) {
                icon.textContent = '▼';
            }
        }
    }
}



// פונקציות נוספות שחסרות
window.updateDateRangeFilterDisplayText = function () {
    // הפונקציה כבר מוגדרת ב-header-system.js
    if (typeof window.updateDateRangeFilterDisplayTextGlobal === 'function') {
        window.updateDateRangeFilterDisplayTextGlobal();
    } else {
        console.warn('⚠️ updateDateRangeFilterDisplayTextGlobal not found');
    }
};

window.updateAccountFilterDisplayText = function () {
    // הפונקציה כבר מוגדרת ב-accounts.js
    if (typeof window.updateAccountFilterDisplayTextGlobal === 'function') {
        window.updateAccountFilterDisplayTextGlobal();
    } else {
        console.warn('⚠️ updateAccountFilterDisplayTextGlobal not found');
    }
};

// updateAccountFilterMenu is already defined in accounts.js

// loadSectionStates is not needed - using global functions

// restoreAllSectionStates is already defined in main.js

// filterDataByFilters is not needed - using local filtering

// updateGridFromComponentGlobal is not needed - using local updateGridFromComponent

// updateTableStats is not needed - using local updatePageSummaryStats

// restoreDesignsSectionState is not needed - using global restoreAllSectionStates

// initializePageFilters is already defined in main.js

// loadSortState is already defined in main.js

// ===== פונקציות לכפתורים החדשים =====

/**
 * הצגת עמוד הנכס (בפיתוח)
 */
function showTickerPage(tickerId) {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('פיתוח', 'עמוד הנכס נמצא בפיתוח');
    }
}

/**
 * הוספת הערה חשובה
 */
function addImportantNote() {

    // הצגת הודעה למשתמש
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית');
    }
}

/**
 * הוספת תזכורת
 */
function addReminder() {

    // הצגת הודעה למשתמש
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר התראות לתוכנית');
    }
}

// ===== VALIDATION FUNCTIONS =====
// All validation functions are now handled by the global validation system in validation-utils.js
// No local validation functions needed - using window.showFieldError, window.clearValidationErrors, etc.

/**
 * עדכון מידע טיקר
 */
function updateTickerInfo() {
    const tickerSelect = document.getElementById('addTradePlanTickerId');
    const tickerDisplay = document.getElementById('selectedTickerDisplay');
    const priceDisplay = document.getElementById('currentPriceDisplay');
    const changeDisplay = document.getElementById('dailyChangeDisplay');
    const stopPriceInput = document.getElementById('addTradePlanStopPrice');
    const targetPriceInput = document.getElementById('addTradePlanTargetPrice');

    // קבלת כל השדות שצריכים להיות מופעלים/מושבתים
    const investmentTypeSelect = document.getElementById('addTradePlanInvestmentType');
    const sideSelect = document.getElementById('addTradePlanSide');
    const amountInput = document.getElementById('addTradePlanPlannedAmount');
    const sharesInput = document.getElementById('addTradePlanShares');
    const entryConditionsTextarea = document.getElementById('addTradePlanEntryConditions');
    const reasonsTextarea = document.getElementById('addTradePlanReasons');

    if (tickerSelect.value) {
        const selectedOption = tickerSelect.options[tickerSelect.selectedIndex];
        const tickerSymbol = selectedOption.textContent;

        tickerDisplay.textContent = tickerSymbol;

        // Demo values - בעתיד יבואו מהשרת
        const currentPrice = 150.25;
        priceDisplay.textContent = '$' + currentPrice.toFixed(2);
        const dailyChangeValue = '+2.5%';
        changeDisplay.textContent = dailyChangeValue;

        // צביעה לפי ערך
        if (dailyChangeValue.startsWith('+')) {
            changeDisplay.style.color = '#28a745';
            changeDisplay.style.fontWeight = 'bold';
        } else if (dailyChangeValue.startsWith('-')) {
            changeDisplay.style.color = '#dc3545';
            changeDisplay.style.fontWeight = 'bold';
        } else {
            changeDisplay.style.color = '#6c757d';
        }

        // הפעלת כל השדות
        investmentTypeSelect.disabled = false;
        sideSelect.disabled = false;
        amountInput.disabled = false;
        sharesInput.disabled = false;
        stopPriceInput.disabled = false;
        targetPriceInput.disabled = false;
        entryConditionsTextarea.disabled = false;
        reasonsTextarea.disabled = false;

        // הוספת required לשדות החובה
        investmentTypeSelect.setAttribute('required', 'required');
        sideSelect.setAttribute('required', 'required');
        amountInput.setAttribute('required', 'required');



        // עדכון מחירי עצירה ויעד ברירת מחדל
        updateDefaultPrices(currentPrice);

        // עדכון מספר מניות אם יש סכום
        if (amountInput.value) {
            updateSharesFromAmount();
        }
    } else {
        tickerDisplay.textContent = 'לא נבחר';
        priceDisplay.textContent = '-';
        changeDisplay.textContent = '-';
        changeDisplay.style.color = '#6c757d';

        // השבתת כל השדות
        investmentTypeSelect.disabled = true;
        sideSelect.disabled = true;
        amountInput.disabled = true;
        sharesInput.disabled = true;
        stopPriceInput.disabled = true;
        targetPriceInput.disabled = true;
        entryConditionsTextarea.disabled = true;
        reasonsTextarea.disabled = true;

        // הסרת required משדות מושבתים
        investmentTypeSelect.removeAttribute('required');
        sideSelect.removeAttribute('required');
        amountInput.removeAttribute('required');

        // ניקוי ערכים
        investmentTypeSelect.value = '';
        sideSelect.value = '';
        amountInput.value = '';
        sharesInput.value = '';
        stopPriceInput.value = '';
        targetPriceInput.value = '';
        entryConditionsTextarea.value = '';
        reasonsTextarea.value = '';
    }
}

/**
 * עדכון מחירי עצירה ויעד ברירת מחדל
 */
function updateDefaultPrices(currentPrice) {
    const stopPriceInput = document.getElementById('addTradePlanStopPrice');
    const targetPriceInput = document.getElementById('addTradePlanTargetPrice');

    // שימוש בפונקציה הכללית
    const prices = calculateDefaultPrices(currentPrice);

    // עדכון השדות רק אם הם ריקים
    if (!stopPriceInput.value) {
        stopPriceInput.value = prices.stopPrice;
    }
    if (!targetPriceInput.value) {
        targetPriceInput.value = prices.targetPrice;
    }
}

/**
 * עדכון מספר מניות מסכום
 */
function updateSharesFromAmount() {

    const amountInput = document.getElementById('addTradePlanPlannedAmount');
    const sharesInput = document.getElementById('addTradePlanShares');
    const priceDisplay = document.getElementById('currentPriceDisplay');

    if (amountInput && sharesInput && priceDisplay) {
        // בדיקה אם יש מחיר תקין
        if (amountInput.value && priceDisplay.textContent !== '-' && priceDisplay.textContent !== '') {
            const amount = parseFloat(amountInput.value);
            const price = parseFloat(priceDisplay.textContent.replace('$', ''));

            if (price > 0) {
                // בדיקה אם הפונקציה הכללית זמינה
                if (typeof window.convertAmountToShares === 'function') {
                    const result = window.convertAmountToShares(amount, price);
                    sharesInput.value = result.shares;
                    // לא מעדכנים את הסכום חזרה - רק מספר מניות
                    // amountInput.value = result.adjustedAmount;
                } else {
                    handleFunctionNotFound('convertAmountToShares', 'פונקציית המרת סכום למניות לא נמצאה');
                    // fallback
                    const shares = Math.floor(amount / price);
                    sharesInput.value = shares;
                }
            }
        }
    } else {
        handleElementNotFound('updateSharesFromAmount', 'אלמנטים נדרשים לא נמצאו לעדכון מניות');
    }
}

/**
 * עדכון סכום ממספר מניות
 */
function updateAmountFromShares() {
    const sharesInput = document.getElementById('addTradePlanShares');
    const amountInput = document.getElementById('addTradePlanPlannedAmount');
    const priceDisplay = document.getElementById('currentPriceDisplay');

    if (sharesInput && amountInput && priceDisplay) {
        if (sharesInput.value && priceDisplay.textContent !== '-') {
            const shares = parseFloat(sharesInput.value);
            const price = parseFloat(priceDisplay.textContent.replace('$', ''));

            if (price > 0) {
                // בדיקה אם הפונקציה הכללית זמינה
                if (typeof window.convertSharesToAmount === 'function') {
                    const amount = window.convertSharesToAmount(shares, price);
                    amountInput.value = amount;
                } else {
                    handleFunctionNotFound('convertSharesToAmount', 'פונקציית המרת מניות לסכום לא נמצאה');
                    // fallback
                    const amount = shares * price;
                    amountInput.value = amount.toFixed(2);
                }
            }
        }
    } else {
        handleElementNotFound('updateAmountFromShares', 'אלמנטים נדרשים לא נמצאו לעדכון סכום');
    }
}

/**
 * הוספת תנאי כניסה
 */
function addEntryCondition() {

    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'המודול יאפשר בקרוב ליצור תנאי כניסה מתקדם');
    }
}

/**
 * הוספת סיבה
 */
function addReason() {

    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'המודול יאפשר בקרוב ליצור סיבות מתקדמות');
    }
}

// ייצוא הפונקציות החדשות
window.addImportantNote = addImportantNote;
window.addReminder = addReminder;
window.updateTickerInfo = updateTickerInfo;
window.updateSharesFromAmount = updateSharesFromAmount;
window.updateAmountFromShares = updateAmountFromShares;
window.addEntryCondition = addEntryCondition;
window.addReason = addReason;
window.sortTable = sortTable;



// Checking if functions are available

// בדיקת פונקציות המרה

// בדיקה נוספת של פונקציות גלובליות

// Verifying that our function is defined
if (window.location.pathname.includes('/trade_plans')) {
    // Verifying that our function is called
    if (typeof window.updateGridFromComponent === 'function') {
        // Function is properly defined
    } else {
        handleFunctionNotFound('updateGridFromComponent', 'פונקציית עדכון רשת לא נמצאה');
    }

    // טעינת נתונים בטעינת הדף
    setTimeout(() => {
        if (typeof window.loadTradePlansData === 'function') {
            window.loadTradePlansData();
        } else {
            handleFunctionNotFound('loadTradePlansData', 'פונקציית טעינת נתוני תכנונים לא נמצאה');
        }
    }, 500);
}

// קריאה ישירה לפונקציה - למקרה שהקוד למעלה לא רץ
if (typeof loadTradePlansData === 'function') {
    setTimeout(() => {
        loadTradePlansData();
    }, 1000);
} else {
    handleFunctionNotFound('loadTradePlansData', 'פונקציית טעינת נתוני תכנונים לא נמצאה בסוף הקובץ');
}

// קריאה ב-DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('/trade_plans')) {
        setTimeout(() => {
            if (typeof loadTradePlansData === 'function') {
                loadTradePlansData();
            } else {
                handleFunctionNotFound('loadTradePlansData', 'פונקציית טעינת נתוני תכנונים לא נמצאה ב-DOMContentLoaded');
            }
        }, 500);
    }
});
