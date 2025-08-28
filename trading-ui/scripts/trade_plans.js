/**
 * ========================================
 * Trade Plans Page - Trade Plans Page
 * ========================================
 * 
 * Dedicated file for the trade plans page (trade_plans.html)
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
 * - Adding new planning
 * - Editing existing planning
 * - Deleting planning
 * - Managing statuses and states
 * - Using global notification system
 * - "Show Linked Details" functionality
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (for global sorting functions)
 * - translation-utils.js (for status translations)
 * - linked-items.js (for linked items modal)
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
 * Last update date: 2025-08-24
 * @sortingFix August 24, 2025 - Fixed infinite recursion in sorting
 * ========================================
 */

// Global variables
let trade_plansData = [];

/**
 * בדיקת פילטרים פעילים
 * פונקציה מרכזית לבדיקת האם יש פילטרים פעילים
 */

// ===== CRUD Modal Functions =====

/**
 * פתיחת מודל הוספת תכנון חדש
 */
function openAddTradePlanModal() {
  
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
function openEditTradePlanModal(tradePlanId) {
  

    const tradePlan = trade_plansData.find(tp => tp.id === tradePlanId);
    if (!tradePlan) {
        console.error('Trade plan not found:', tradePlanId);
        return;
    }

    // מילוי הטופס בנתונים קיימים
    document.getElementById('editTradePlanId').value = tradePlan.id;
    document.getElementById('editTradePlanTickerId').value = tradePlan.ticker_id;
    document.getElementById('editTradePlanInvestmentType').value = tradePlan.investment_type;
    document.getElementById('editTradePlanSide').value = tradePlan.side;
    document.getElementById('editTradePlanPlannedAmount').value = tradePlan.planned_amount;
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

    // עדכון מידע על הטיקר
    updateEditTickerInfo();

    const modal = new bootstrap.Modal(document.getElementById('editTradePlanModal'));
    modal.show();
}

/**
 * עדכון מידע על הטיקר במודל העריכה
 */
function updateEditTickerInfo() {
    const tickerId = document.getElementById('editTradePlanTickerId').value;
    const tickerDisplay = document.getElementById('editSelectedTickerDisplay');
    const priceDisplay = document.getElementById('editCurrentPriceDisplay');
    const changeDisplay = document.getElementById('editDailyChangeDisplay');

    if (!tickerId) {
        tickerDisplay.textContent = 'לא נבחר';
        priceDisplay.textContent = '-';
        changeDisplay.textContent = '-';
        return;
    }

    // מציאת הטיקר בנתונים
    const ticker = window.tickersData?.find(t => t.id == tickerId);
    if (ticker) {
        tickerDisplay.textContent = ticker.symbol;
        priceDisplay.textContent = `$${ticker.current_price || '0.00'}`;

        const change = ticker.daily_change || 0;
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSign = change >= 0 ? '+' : '';
        changeDisplay.textContent = `${changeSign}${change}%`;
        changeDisplay.className = `form-control-plaintext ${changeClass}`;

        // הפעלת השדות
        enableEditFields();
    } else {
        tickerDisplay.textContent = 'לא נמצא';
        priceDisplay.textContent = '-';
        changeDisplay.textContent = '-';
    }
}

/**
 * הפעלת השדות במודל העריכה
 */
function enableEditFields() {
    const fields = [
        'editTradePlanInvestmentType',
        'editTradePlanSide',
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
        }
    });
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
  

    const formData = {
        id: document.getElementById('editTradePlanId').value,
        ticker_id: document.getElementById('editTradePlanTickerId').value,
        investment_type: document.getElementById('editTradePlanInvestmentType').value,
        side: document.getElementById('editTradePlanSide').value,
        planned_amount: parseFloat(document.getElementById('editTradePlanPlannedAmount').value),
        stop_price: parseFloat(document.getElementById('editTradePlanStopPrice').value) || null,
        target_price: parseFloat(document.getElementById('editTradePlanTargetPrice').value) || null,
        entry_conditions: document.getElementById('editTradePlanEntryConditions').value,
        reasons: document.getElementById('editTradePlanReasons').value,
        created_at: document.getElementById('editTradePlanDate').value
    };

    try {
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/${formData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
      

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
        console.error('❌ Error updating trade plan:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה בעדכון התכנון', 'error');
        }
    }
}

/**
 * אישור מחיקת תכנון
 */
async function confirmDeleteTradePlan() {
    const modal = document.getElementById('deleteTradePlanModal');
    const tradePlanId = modal.getAttribute('data-trade-plan-id');

    if (!tradePlanId) {
        console.error('No trade plan ID found');
        return;
    }

    try {
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/${tradePlanId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

      

        // הצגת הודעת הצלחה
        if (typeof window.showNotification === 'function') {
            window.showNotification('תכנון נמחק בהצלחה!', 'success');
        }

        // סגירת המודל
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteTradePlanModal'));
        deleteModal.hide();

        // רענון הטבלה
        await loadTradePlansData();

    } catch (error) {
        console.error('❌ Error deleting trade plan:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה במחיקת התכנון', 'error');
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
 * פתיחת מודל מחיקת תכנון
 */
function openDeleteTradePlanModal(tradePlanId) {
  

    const tradePlan = trade_plansData.find(tp => tp.id === tradePlanId);
    if (!tradePlan) {
        console.error('Trade plan not found:', tradePlanId);
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

// ייצוא פונקציות לגלובל
window.openAddTradePlanModal = openAddTradePlanModal;
window.openEditTradePlanModal = openEditTradePlanModal;
window.openDeleteTradePlanModal = openDeleteTradePlanModal;
window.saveEditTradePlan = saveEditTradePlan;
window.confirmDeleteTradePlan = confirmDeleteTradePlan;
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
if (window.location.pathname.includes('/planning') || window.location.pathname.includes('/trade_plans')) {
    window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
      
            selectedStatuses,
            selectedTypes,
            selectedDateRange,
            searchTerm
        });

      

        // Saving filters in global variables
        

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

      
            selectedStartDateForFilter: window.selectedStartDateForFilter,
            selectedEndDateForFilter: window.selectedEndDateForFilter,
        });



        // Direct call to local function
      
        if (typeof window.loadTradePlansData === 'function') {
            window.loadTradePlansData();
        } else {
            console.error('❌ loadTradePlansData function not found');
        }
    };
}

/**
 * Loading planning data from server
 * 
 * This function loads all planning from the server and updates the table
 * If server is not available, uses demo data
 * 
 * @returns {Array} Array of planning
 */
async function loadTradePlansData() {
    try {
        console.log('🔄 Loading trade_plans from server...');

        // Setting base URL
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🔄 Data received from server:', data);

        // Checking that data is an array
        let trade_plans = data;
        if (!Array.isArray(trade_plans)) {
            console.log('🔄 Received data is not an array, looking for data.data');
            if (data && data.data && Array.isArray(data.data)) {
                trade_plans = data.data;
            } else {
                throw new Error('Data received from server is not in correct format');
            }
        }

        console.log(`✅ Loaded ${trade_plans.length} trade_plans`);

        // Updating global variable - using original fields from server
        trade_plansData = trade_plans;

        // Debug log - checking first data structure
        if (trade_plansData.length > 0) {
            console.log('🔄 First design data structure:', {
                id: trade_plansData[0].id,
                created_at: trade_plansData[0].created_at,
                investment_type: trade_plansData[0].investment_type,
                status: trade_plansData[0].status,
                ticker: trade_plansData[0].ticker,
                side: trade_plansData[0].side
            });
        }

        // Applying filters to data
        let filteredDesigns = [...trade_plansData];

        // Checking if there are active filters
        const hasActiveFilters = checkActiveFilters();

        console.log('🔄 Checking filters for planning page:', {
            hasActiveFilters,
        });

        if (hasActiveFilters) {
            console.log('🔄 Applying filters to trade_plans data...');

window.setupSortableHeaders = function () {
    console.log('🔄 setupSortableHeaders called for planning page');
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
    console.log('🔄 Setting up sortable headers locally for planning page');
    const headers = document.querySelectorAll('#trade_plansTable th[onclick]');
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.title = 'לחץ למיון';
    });
}

// פונקציות נוספות שחסרות


// updateAccountFilterMenu is already defined in accounts.js

// loadSectionStates is not needed - using global functions

// restoreAllSectionStates is already defined in main.js



// updateGridFromComponentGlobal is not needed - using local updateGridFromComponent

// updateTableStats is not needed - using local updatePageSummaryStats

// restoreDesignsSectionState is not needed - using global restoreAllSectionStates

// initializePageFilters is already defined in main.js

// loadSortState is already defined in main.js

// ===== פונקציות לכפתורים החדשים =====

/**
 * הוספת הערה חשובה
 */
function addImportantNote() {
    console.log('🔄 הודעת הערות עשירות');

    // הצגת הודעה למשתמש
    if (typeof showNotification === 'function') {
        showNotification('המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית', 'info');
    } else {
        alert('המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית');
    }
}

/**
 * הוספת תזכורת
 */
function addReminder() {
    console.log('🔄 הודעת התראות');

    // הצגת הודעה למשתמש
    if (typeof showNotification === 'function') {
        showNotification('המודול יאפשר בקרוב לייצר התראות לתוכנית', 'warning');
    } else {
        alert('המודול יאפשר בקרוב לייצר התראות לתוכנית');
    }
}

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

        console.log('✅ Fields enabled:', {
            investmentType: !investmentTypeSelect.disabled,
            side: !sideSelect.disabled,
            amount: !amountInput.disabled,
            shares: !sharesInput.disabled,
            stopPrice: !stopPriceInput.disabled,
            targetPrice: !targetPriceInput.disabled
        });

        // בדיקה נוספת של שדה הסכום
        console.log('🔍 Amount field details:', {
            disabled: amountInput.disabled,
            readonly: amountInput.readOnly,
            value: amountInput.value,
            style: amountInput.style.backgroundColor,
            classList: Array.from(amountInput.classList)
        });

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
    console.log('🔄 updateSharesFromAmount called');

    const amountInput = document.getElementById('addTradePlanPlannedAmount');
    const sharesInput = document.getElementById('addTradePlanShares');
    const priceDisplay = document.getElementById('currentPriceDisplay');

    console.log('Elements found:', {
        amountInput: !!amountInput,
        sharesInput: !!sharesInput,
        priceDisplay: !!priceDisplay
    });

    if (amountInput && sharesInput && priceDisplay) {
        console.log('Values:', {
            amount: amountInput.value,
            price: priceDisplay.textContent
        });

        // בדיקה אם יש מחיר תקין
        if (amountInput.value && priceDisplay.textContent !== '-' && priceDisplay.textContent !== '') {
            const amount = parseFloat(amountInput.value);
            const price = parseFloat(priceDisplay.textContent.replace('$', ''));

            console.log('Parsed values:', { amount, price });

            if (price > 0) {
                // בדיקה אם הפונקציה הכללית זמינה
                if (typeof window.convertAmountToShares === 'function') {
                    console.log('Using convertAmountToShares function');
                    const result = window.convertAmountToShares(amount, price);
                    console.log('Conversion result:', result);
                    sharesInput.value = result.shares;
                    // לא מעדכנים את הסכום חזרה - רק מספר מניות
                    // amountInput.value = result.adjustedAmount;
                } else {
                    console.error('convertAmountToShares function not found!');

/**
 * עדכון סכום ממספר מניות
 */
function updateAmountFromShares() {
    console.log('🔄 updateAmountFromShares called');

    const sharesInput = document.getElementById('addTradePlanShares');
    const amountInput = document.getElementById('addTradePlanPlannedAmount');
    const priceDisplay = document.getElementById('currentPriceDisplay');

    console.log('Elements found:', {
        sharesInput: !!sharesInput,
        amountInput: !!amountInput,
        priceDisplay: !!priceDisplay
    });

    if (sharesInput && amountInput && priceDisplay) {
        console.log('Values:', {
            shares: sharesInput.value,
            price: priceDisplay.textContent
        });

        if (sharesInput.value && priceDisplay.textContent !== '-') {
            const shares = parseFloat(sharesInput.value);
            const price = parseFloat(priceDisplay.textContent.replace('$', ''));

            console.log('Parsed values:', { shares, price });

            if (price > 0) {
                // בדיקה אם הפונקציה הכללית זמינה
                if (typeof window.convertSharesToAmount === 'function') {
                    console.log('Using convertSharesToAmount function');
                    const amount = window.convertSharesToAmount(shares, price);
                    console.log('Conversion result:', amount);
                    amountInput.value = amount;
                } else {
                    console.error('convertSharesToAmount function not found!');
                    // fallback
                    const amount = shares * price;
                    amountInput.value = amount.toFixed(2);
                }
            }
        }
    } else {
        console.error('One or more elements not found');
    }
}

/**
 * הוספת תנאי כניסה
 */
function addEntryCondition() {
    console.log('🔄 הוספת תנאי כניסה');

    if (typeof showNotification === 'function') {
        showNotification('המודול יאפשר בקרוב ליצור תנאי כניסה מתקדם', 'info');
    } else {
        alert('המודול יאפשר בקרוב ליצור תנאי כניסה מתקדם');
    }
}

/**
 * הוספת סיבה
 */
function addReason() {
    console.log('🔄 הוספת סיבה');

    if (typeof showNotification === 'function') {
        showNotification('המודול יאפשר בקרוב ליצור סיבות מתקדמות', 'info');
    } else {
        alert('המודול יאפשר בקרוב ליצור סיבות מתקדמות');
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

console.log('✅ Trade plans functions exported:', {
    updateSharesFromAmount: typeof updateSharesFromAmount,
    updateAmountFromShares: typeof updateAmountFromShares
});

// Checking if functions are available
console.log('🔄 Trade_plans.js loaded. Available functions:', {
    loadTradePlansData: typeof window.loadTradePlansData,
    updateTradePlansTable: typeof window.updateTradePlansTable,
    
    updateGridFromComponentGlobal: typeof window.updateGridFromComponentGlobal,
    updateGridFromComponent: typeof window.updateGridFromComponent,
    addImportantNote: typeof window.addImportantNote,
    addReminder: typeof window.addReminder,
    updateSharesFromAmount: typeof window.updateSharesFromAmount,
    updateAmountFromShares: typeof window.updateAmountFromShares
});

// בדיקת פונקציות המרה
console.log('🔄 Checking conversion functions:', {
    convertAmountToShares: typeof window.convertAmountToShares,
    convertSharesToAmount: typeof window.convertSharesToAmount,
    calculateDefaultPrices: typeof window.calculateDefaultPrices,
    getUserPreference: typeof window.getUserPreference
});

// Verifying that our function is defined
if (window.location.pathname.includes('/trade_plans')) {
    console.log('✅ Trade plans page detected - updateGridFromComponent should be ours');
    console.log('✅ Our updateGridFromComponent function:', typeof window.updateGridFromComponent);

    // Verifying that our function is called
    if (typeof window.updateGridFromComponent === 'function') {
        console.log('✅ Our updateGridFromComponent function is properly defined');
    } else {
        console.error('❌ Our updateGridFromComponent function is NOT defined');
    }

    // בדיקת פונקציות המרה
    setTimeout(() => {
        console.log('🔄 Final check of conversion functions:', {
            updateSharesFromAmount: typeof window.updateSharesFromAmount,
            updateAmountFromShares: typeof window.updateAmountFromShares,
            convertAmountToShares: typeof window.convertAmountToShares,
            convertSharesToAmount: typeof window.convertSharesToAmount
        });
    }, 1000);
}
