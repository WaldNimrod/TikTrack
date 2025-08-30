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

// ===== CRUD Modal Functions =====

/**
 * פתיחת מודל הוספת תכנון חדש
 */
function openAddTradePlanModal() {
    console.log('🔄 Opening add trade plan modal');
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
    console.log('🔄 Opening edit trade plan modal for ID:', tradePlanId);

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
    console.log('🔄 Saving edited trade plan');

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
        console.log('✅ Trade plan updated successfully:', result);

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

        console.log('✅ Trade plan deleted successfully');

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
    console.log('🔄 Opening delete trade plan modal for ID:', tradePlanId);

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
console.log('🔄 Planning.js: Setting up updateGridFromComponent for planning page');
// Ensuring the function is only defined on the planning page
if (window.location.pathname.includes('/planning') || window.location.pathname.includes('/trade_plans')) {
    window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
        console.log('🔄 updateGridFromComponent called for planning page with:', {
            selectedStatuses,
            selectedTypes,
            selectedDateRange,
            searchTerm
        });

        console.log('✅ This is the PLANNING page updateGridFromComponent function!');

        // Saving filters in global variables
        window.selectedStatusesForFilter = selectedStatuses || [];
        window.selectedTypesForFilter = selectedTypes || [];
        window.selectedDateRangeForFilter = selectedDateRange || null;
        window.searchTermForFilter = searchTerm || '';

        // Extracting start and end dates from date range
        let startDate = 'לא נבחר';
        let endDate = 'לא נבחר';

        if (selectedDateRange && selectedDateRange !== 'כל זמן') {
            console.log('🔄 Translating date range:', selectedDateRange);
            // Translating date range to actual dates
            const dateRange = translateDateRangeToDates(selectedDateRange);
            startDate = dateRange.startDate;
            endDate = dateRange.endDate;
            console.log('🔄 Translation result:', { startDate, endDate });
        }

        window.selectedStartDateForFilter = startDate;
        window.selectedEndDateForFilter = endDate;

        console.log('🔄 Filters saved for planning page:', {
            selectedStatusesForFilter: window.selectedStatusesForFilter,
            selectedTypesForFilter: window.selectedTypesForFilter,
            selectedDateRangeForFilter: window.selectedDateRangeForFilter,
            selectedStartDateForFilter: window.selectedStartDateForFilter,
            selectedEndDateForFilter: window.selectedEndDateForFilter,
            searchTermForFilter: window.searchTermForFilter
        });

        // Updating debug panel
        if (typeof updateFilterDebugPanel === 'function') {
            updateFilterDebugPanel();
        }

        // Direct call to local function
        console.log('🔄 Calling loadTradePlansData directly for trade plans page');
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
    console.log('🔄 === LOAD TRADE PLANS DATA FUNCTION CALLED ===');
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
        const hasActiveFilters = (window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0) ||
            (window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0) ||
            (window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן') ||
            (window.searchTermForFilter && window.searchTermForFilter.trim() !== '');

        console.log('🔄 Checking filters for planning page:', {
            hasActiveFilters,
            selectedStatusesForFilter: window.selectedStatusesForFilter,
            selectedTypesForFilter: window.selectedTypesForFilter,
            selectedDateRangeForFilter: window.selectedDateRangeForFilter,
            searchTermForFilter: window.searchTermForFilter
        });

        if (hasActiveFilters) {
            console.log('🔄 Applying filters to trade_plans data...');
            if (typeof window.filterDataByFilters === 'function') {
                filteredDesigns = window.filterDataByFilters(trade_plansData, 'planning');
            } else {
                // Local filtering function if global function is not available
                filteredDesigns = filterDesignsLocally(trade_plansData, window.selectedStatusesForFilter, window.selectedTypesForFilter, window.selectedDateRangeForFilter, window.searchTermForFilter);
            }
            console.log('🔄 After filtering:', filteredDesigns.length, 'trade_plans');
        } else {
            console.log('🔄 No active filters, showing all trade_plans');
        }

        // Saving filtered data to global
        window.filteredTradePlansData = filteredDesigns;

        // Updating table with filtered data
        updateTradePlansTable(filteredDesigns);

        // Updating debug panel
        updateFilterDebugPanel();

        return trade_plansData;

    } catch (error) {
        console.error('❌ Error loading trade_plans data:', error);
        console.error('❌ Error details:', error.message);

        // Displaying detailed error message in table
        const tbody = document.querySelector('#trade_plansTable tbody');
        if (tbody) {
            // Identifying error type
            let errorMessage = 'שגיאה בטעינת נתונים';
            let errorDetails = error.message;

            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'השרת לא זמין';
                errorDetails = 'לא ניתן להתחבר לשרת. אנא ודא שהשרת פועל ונסה שוב.';
            } else if (error.message.includes('HTTP error! status: 404')) {
                errorMessage = 'הנתונים לא נמצאו';
                errorDetails = 'הנתונים המבוקשים לא נמצאו בשרת.';
            } else if (error.message.includes('HTTP error! status: 500')) {
                errorMessage = 'שגיאת שרת';
                errorDetails = 'אירעה שגיאה בשרת. אנא נסה שוב מאוחר יותר.';
            }

            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">
                <i class="fas fa-exclamation-triangle"></i> ${errorMessage}
                <br><small>${errorDetails}</small>
                <br><button class="btn btn-sm btn-outline-primary mt-2" onclick="if (typeof window.loadTradePlansData === 'function') { window.loadTradePlansData(); } else { location.reload(); }">נסה שוב</button>
            </td></tr>`;
        }

        // Resetting data
        trade_plansData = [];
        window.filteredTradePlansData = [];

        // Updating statistics
        updatePageSummaryStats();

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
 * פילטור נתוני תכנונים
 */
function filterTradePlansData(filters) {
    console.log('🔄 Filtering trade plans data with filters:', filters);

    if (!window.tradePlansData || !Array.isArray(window.tradePlansData)) {
        console.log('No trade plans data available for filtering');
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

    console.log(`✅ Filtered ${filteredData.length} trade plans from ${window.tradePlansData.length}`);

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
    console.log('🔄 === UPDATE TRADE PLANS TABLE ===');
    console.log('🔄 Designs to display:', trade_plans.length);

    const tbody = document.querySelector('#trade_plansTable tbody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }

    // Checking if there is data to display
    if (!trade_plans || trade_plans.length === 0) {
        // Checking if it's because of filters or if there are no data at all
        const hasOriginalData = trade_plansData && trade_plansData.length > 0;

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

        if (hasOriginalData && hasActiveFilters) {
            // There is data but the filter didn't find results
            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-info">
                <i class="fas fa-search"></i> לא נמצאו תוצאות
                <br><small>נסה לשנות את הפילטרים או מונח החיפוש</small>
            </td></tr>`;
        } else {
            // No data at all
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

        // Debug log
        console.log('🔄 Processing design for table:', {
            id: design.id,
            ticker: design.ticker,
            tickerSymbol: design.ticker?.symbol,
            tickerName: design.ticker?.name,
            investmentType: design.investment_type,
            status: design.status,
            side: design.side,
            created_at: design.created_at
        });

        const statusClass = getStatusClass(design.status);
        const typeClass = getTypeClass(design.investment_type);

        // Date correction - converting to Hebrew format
        let dateDisplay = 'לא מוגדר';
        console.log('🔄 Processing date for design:', design.id, 'created_at:', design.created_at, 'type:', typeof design.created_at);

        if (design.created_at) {
            try {
                const dateObj = new Date(design.created_at);
                console.log('🔄 Date object created:', dateObj, 'isValid:', !isNaN(dateObj.getTime()));

                if (!isNaN(dateObj.getTime())) {
                    dateDisplay = dateObj.toLocaleDateString('he-IL');
                    console.log('🔄 Date conversion successful:', {
                        original: design.created_at,
                        dateObj: dateObj,
                        display: dateDisplay
                    });
                } else {
                    console.error('Invalid date:', design.created_at);
                }
            } catch (error) {
                console.error('Error parsing date:', design.created_at, error);
            }
        } else {
            console.log('🔄 No created_at field for design:', design.id);
        }

        // Type correction - ensuring a valid value is passed
        console.log('🔄 Processing type for design:', design.id, 'investment_type:', design.investment_type, 'type:', typeof design.investment_type);
        const typeDisplay = design.investment_type ? (window.translateTradePlanType ? window.translateTradePlanType(design.investment_type) : design.investment_type) : 'לא מוגדר';
        console.log('🔄 Type display result:', typeDisplay);
        const sideDisplay = design.side === 'Long' ? 'Long' : 'Short';
        const amountDisplay = formatCurrency(design.planned_amount);
        const targetDisplay = formatCurrency(design.target_price);
        const stopDisplay = formatCurrency(design.stop_price);
        const currentDisplay = formatCurrency(design.current || 0);
        const statusDisplay = window.translateTradePlanStatus ? window.translateTradePlanStatus(design.status) : design.status;

        // Displaying ticker symbol or name
        const tickerDisplay = design.ticker ? (design.ticker.symbol || design.ticker.name || 'לא מוגדר') : 'לא מוגדר';

        // שמירת הערכים המקוריים באנגלית לפילטר
        const typeForFilter = design.investment_type || '';
        const statusForFilter = design.status || '';

        return `
      <tr>
        <td class="ticker-cell"><span class="ticker-text">${tickerDisplay}</span></td>
        <td data-date="${design.created_at}"><span class="date-text">${dateDisplay}</span></td>
        <td class="type-cell" data-type="${typeForFilter}"><span class="type-badge ${typeClass}">${typeDisplay}</span></td>
        <td class="side-cell" data-side="${design.side}"><span class="side-badge ${design.side.toLowerCase()}">${sideDisplay}</span></td>
        <td><span class="amount-text">${amountDisplay}</span></td>
        <td class="target-cell"><span class="target-text">${targetDisplay}</span></td>
        <td class="stop-cell"><span class="stop-text">${stopDisplay}</span></td>
        <td><span class="current-text">${currentDisplay}</span></td>
        <td class="status-cell" data-status="${statusForFilter}"><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-info" onclick="viewLinkedItemsForTradePlan(${design.id})" title="צפה באלמנטים מקושרים">
            🔗
          </button>
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
    // Clearing the form
    const form = document.getElementById('addTradePlanForm');
    if (form) {
        form.reset();
    }

    // Setting today's date
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('addTradePlanDate');
    if (dateInput) {
        dateInput.value = today;
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
        console.error('Form element not found');
        return;
    }

    // Validating the form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = {
        account_id: 1, // Default to main account
        ticker_id: parseInt(document.getElementById('addTradePlanTickerId').value),
        investment_type: document.getElementById('addTradePlanInvestmentType').value,
        side: document.getElementById('addTradePlanSide').value,
        planned_amount: parseFloat(document.getElementById('addTradePlanPlannedAmount').value) || 0,
        stop_price: parseFloat(document.getElementById('addTradePlanStopPrice').value) || null,
        target_price: parseFloat(document.getElementById('addTradePlanTargetPrice').value) || null,
        entry_conditions: document.getElementById('addTradePlanEntryConditions').value || '',
        reasons: document.getElementById('addTradePlanReasons').value || '',
        status: 'open' // Default to open status
    };

    console.log('Sending new trade plan:', formData);

    try {
        const response = await fetch('/api/v1/trade_plans/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // Detailed log of the response
        console.log('Server response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from server:', errorText);
            throw new Error(`Error saving trade plan: ${response.status} - ${errorText}`);
        }

        if (response.ok) {
            const newDesign = await response.json();
            console.log('Trade plan saved successfully:', newDesign);

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
        console.error('Error saving trade plan:', error);
        showErrorNotification('Error saving trade plan', 'Error saving trade plan: ' + error.message);
    }
}

/**
 * עריכת תכנון
 */
function editTradePlan(designId) {
    console.log('Opening edit modal for trade plan:', designId);
    // קריאה לפונקציה הגלובלית לפתיחת מודל עריכה
    if (typeof window.openEditTradePlanModal === 'function') {
        window.openEditTradePlanModal(designId);
    } else {
        console.error('openEditTradePlanModal function not found');
        showErrorNotification('Error opening edit modal', 'Edit modal function not found');
    }
}

/**
 * מחיקת תכנון
 */
async function deleteTradePlan(designId) {
    console.log('Opening delete modal for trade plan:', designId);
    // קריאה לפונקציה הגלובלית לפתיחת מודל מחיקה
    if (typeof window.openDeleteTradePlanModal === 'function') {
        window.openDeleteTradePlanModal(designId);
    } else {
        console.error('openDeleteTradePlanModal function not found');
        showErrorNotification('Error opening delete modal', 'Delete modal function not found');
    }
}

/**
 * סגירת מודל - שימוש בפונקציה גלובלית
 * @deprecated Use window.closeModal from main.js instead
 */
function closeModal(modalId) {
    // שימוש בפונקציה הגלובלית
    if (typeof window.closeModal === 'function') {
        window.closeModal(modalId);
    } else {
        console.error('❌ closeModal function not found in main.js');
    }
}

/**
 * פילטור נתוני תכנונים
 */
function filterDesignsData(statuses, types, accounts, dateRange, searchTerm) {
    console.log('Filtering trade plans:', { statuses, types, accounts, dateRange, searchTerm });

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
    console.log(`🔄 Sorting planning table by column ${columnIndex}`);

    // Using global function from tables.js
    if (typeof window.sortTableData === 'function') {
        window.sortTableData(
            columnIndex,
            window.filteredTradePlansData || trade_plansData,
            'trade_plans',
            updateDesignsTable
        );
    } else {
        console.error('❌ sortTableData function not found in tables.js');
        // Fallback to local sorting if global function not available
        console.log('🔄 Using fallback local sorting');
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

    console.log(`✅ Local sorting completed for column ${columnIndex}, direction: ${direction}`);
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
    console.log('🔄 Restoring sort state for planning table');

    if (typeof window.restoreAnyTableSort === 'function') {
        window.restoreAnyTableSort('planning', trade_plansData, updateDesignsTable);
    } else {
        console.error('❌ restoreAnyTableSort function not found in main.js');
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
        console.error('❌ Error loading preferences:', error);
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
                console.log('🔄 MTD calculation:', {
                    today: todayStr,
                    month: today.getMonth(),
                    year: today.getFullYear(),
                    startDate: startDate
                });
                break;

            case 'השנה':
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                startDate = startOfYear.toISOString().split('T')[0];
                endDate = todayStr;
                break;

            case 'YTD':
                startDate = createDateWithTimezone(today.getFullYear(), 0, 1);
                endDate = todayStr;
                console.log('🔄 YTD calculation:', {
                    today: todayStr,
                    year: today.getFullYear(),
                    startDate: startDate
                });
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
                console.log('🔄 Previous year calculation:', {
                    today: todayStr,
                    lastYear: today.getFullYear() - 1,
                    startDate: startDate,
                    endDate: endDate
                });
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

    console.log('🔄 Date range translation:', {
        original: dateRange,
        startDate,
        endDate,
        today: todayStr,
        dayOfWeek: today.getDay()
    });
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

    console.log('🔄 Filter debug panel updated');
}

/**
 * פילטור מקומי של נתוני תכנונים
 * פונקציה זו מספקת פילטור מקומי כאשר הפונקציה הגלובלית לא זמינה
 */
function filterTradePlansLocally(data, statuses, types, dateRange, searchTerm) {
    console.log('🔄 Local filtering of trade plans data');

    if (!data || !Array.isArray(data)) {
        console.warn('No data to filter');
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
        console.log('Date range filtering not implemented yet');
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

    console.log(`✅ Locally filtered ${filteredData.length} trade plans from ${data.length}`);
    return filteredData;
}

/**
 * עיצוב מטבע
 */
function formatCurrency(amount) {
    // Handling null, undefined or invalid values
    if (amount === null || amount === undefined || amount === '') {
        return '$0';
    }

    if (typeof amount === 'number') {
        return `$${amount.toLocaleString('he-IL')}`;
    }

    if (typeof amount === 'string') {
        const num = parseFloat(amount.replace(/[$,]/g, ''));
        if (!isNaN(num)) {
            return `$${num.toLocaleString('he-IL')}`;
        }
    }

    // If we couldn't parse, return 0
    return '$0';
}

/**
 * שחזור מצב הסקשנים
 * 
 * פונקציה זו משתמשת בפונקציה הגלובלית מ-main.js
 */
// restoreDesignsSectionState is already defined in page-utils.js

// Global functions are now properly defined in main.js
console.log('✅ Global toggle functions available from main.js');

// Initialization
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === DOM CONTENT LOADED (PLANNING) ===');

    // Checking global function availability
    console.log('🔍 Checking global functions:', {
        toggleTopSection: typeof window.toggleTopSection,
        toggleMainSection: typeof window.toggleMainSection,
        restoreAllSectionStates: typeof window.restoreAllSectionStates,
        filterDataByFilters: typeof window.filterDataByFilters,
        updateGridFromComponentGlobal: typeof window.updateGridFromComponentGlobal
    });

    // Restoring section state
    if (typeof window.restoreAllSectionStates === 'function') {
        window.restoreAllSectionStates();
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

// פונקציות חסרות
window.loadPlanningData = function () {
    console.log('🔄 loadPlanningData called - redirecting to loadTradePlansData');
    loadTradePlansData();
};

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
window.updateDateRangeFilterDisplayText = function () {
    console.log('🔄 updateDateRangeFilterDisplayText called');
    // הפונקציה כבר מוגדרת ב-header-system.js
    if (typeof window.updateDateRangeFilterDisplayTextGlobal === 'function') {
        window.updateDateRangeFilterDisplayTextGlobal();
    } else {
        console.warn('⚠️ updateDateRangeFilterDisplayTextGlobal not found');
    }
};

window.updateAccountFilterDisplayText = function () {
    console.log('🔄 updateAccountFilterDisplayText called');
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
                    console.log('Available global functions:', Object.keys(window).filter(key => key.includes('convert')));
                    // fallback
                    const shares = Math.floor(amount / price);
                    sharesInput.value = shares;
                }
            } else {
                console.log('Price is not valid:', price);
            }
        } else {
            console.log('Missing amount or price. Amount:', amountInput.value, 'Price:', priceDisplay.textContent);
        }
    } else {
        console.error('One or more elements not found');
    }
}

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
    filterDataByFilters: typeof window.filterDataByFilters,
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
