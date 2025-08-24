/**
 * ========================================
 * Planning Page - Planning Page
 * ========================================
 * 
 * Dedicated file for the planning page (planning.html)
 * 
 * File contents:
 * - Loading planning data from server
 * - Displaying planning table with sorting and filters
 * - Adding new planning
 * - Editing existing planning
 * - Deleting planning
 * - Managing statuses and states
 * - Using global notification system
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (for global sorting functions)
 * - translation-utils.js (for status translations)
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
 * Last update date: 2025
 * ========================================
 */

// Global variables
let trade_plansData = [];

// The translateDateRangeToDates function is already defined at the beginning of the file

// Defining the updateGridFromComponent function immediately at the beginning of the file
console.log('🔄 Planning.js: Setting up updateGridFromComponent for planning page');
// Ensuring the function is only defined on the planning page
if (window.location.pathname.includes('/planning')) {
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
        console.log('🔄 Calling loadDesignsData directly for planning page');
        if (typeof window.loadDesignsData === 'function') {
            window.loadDesignsData();
        } else {
            console.error('❌ loadDesignsData function not found');
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
async function loadDesignsData() {
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
        window.filteredDesignsData = filteredDesigns;

        // Updating table with filtered data
        updateTradePlansTable(filteredTradePlans);

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
                <br><button class="btn btn-sm btn-outline-primary mt-2" onclick="if (typeof window.loadDesignsData === 'function') { window.loadDesignsData(); } else { location.reload(); }">נסה שוב</button>
            </td></tr>`;
        }

        // Resetting data
        trade_plansData = [];
        window.filteredDesignsData = [];

        // Updating statistics
        updatePageSummaryStats();

        return trade_plansData;
    }
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
        <td><span class="ticker-text">${tickerDisplay}</span></td>
        <td data-date="${design.created_at}"><span class="date-text">${dateDisplay}</span></td>
        <td data-type="${typeForFilter}"><span class="type-badge ${typeClass}">${typeDisplay}</span></td>
        <td><span class="side-badge ${design.side.toLowerCase()}">${sideDisplay}</span></td>
        <td><span class="amount-text">${amountDisplay}</span></td>
        <td><span class="target-text">${targetDisplay}</span></td>
        <td><span class="stop-text">${stopDisplay}</span></td>
        <td><span class="current-text">${currentDisplay}</span></td>
        <td data-status="${statusForFilter}"><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-secondary" onclick="editTradePlan(${design.id})" title="ערוך">
            ✏️
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteTradePlan(${design.id})" title="מחק">
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
    const dataToUse = window.filteredDesignsData || trade_plansData;
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

    document.getElementById('totalDesigns').textContent = totalDesigns;
    document.getElementById('totalInvestment').textContent = formatCurrency(totalInvestment);
    document.getElementById('avgInvestment').textContent = formatCurrency(avgInvestment);
    document.getElementById('totalProfit').textContent = formatCurrency(totalProfit);
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
            loadDesignsData();

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
 * @requires window.filteredDesignsData - Filtered data
 * @requires trade_plansData - Original data
 * @requires updateDesignsTable - Function to update table
 * 
 * @since 2.0
 */
function sortTable(columnIndex) {
    console.log(`🔄 Sorting planning table by column ${columnIndex}`);

    // Using new global function from main.js
    if (typeof window.sortTable === 'function') {
        window.sortTable(
            'planning',
            columnIndex,
            window.filteredDesignsData || trade_plansData,
            updateDesignsTable
        );
    } else {
        console.error('❌ sortTable function not found in main.js');
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
    const data = window.filteredDesignsData || trade_plansData;
    const currentSortState = window.getSortState ? window.getSortState('planning') : { columnIndex: -1, direction: 'asc' };

    // קביעת כיוון הסידור
    let direction = 'asc';
    if (currentSortState.columnIndex === columnIndex) {
        direction = currentSortState.direction === 'asc' ? 'desc' : 'asc';
    }

    // שמירת מצב הסידור
    if (window.saveSortState) {
        window.saveSortState('planning', columnIndex, direction);
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
    window.filteredDesignsData = sortedData;

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
 * פילטור מקומי של תכנונים
 */
function filterDesignsLocally(trade_plans, selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
    console.log('🔄 === FILTER DESIGNS LOCALLY ===');
    console.log('🔄 Original trade_plans:', trade_plans.length);
    console.log('🔄 Filters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

    let filteredDesigns = [...trade_plans];

    // Extracting start and end dates
    let startDate = null;
    let endDate = null;

    if (selectedDateRange && selectedDateRange !== 'כל זמן') {
        console.log('🔄 Filter: Translating date range:', selectedDateRange);
        const dateRange = translateDateRangeToDates(selectedDateRange);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
        console.log('🔄 Filter: Translation result:', { startDate, endDate });
    }

    console.log('🔄 Extracted dates:', { startDate, endDate });

    // Filtering by status
    if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
        console.log('🔄 Filtering by status:', selectedStatuses);
        filteredDesigns = filteredDesigns.filter(design => {
            // המרת הערכים הנבחרים לאנגלית
            const statusTranslations = {
                'פתוח': 'open',
                'סגור': 'closed',
                'מבוטל': 'cancelled'
            };

            const translatedSelectedStatuses = selectedStatuses.map(status =>
                statusTranslations[status] || status
            );

            const isMatch = translatedSelectedStatuses.includes(design.status);
            console.log(`🔄 Design ${design.id}: status=${design.status}, selected=${selectedStatuses}, translated=${translatedSelectedStatuses}, match=${isMatch}`);
            return isMatch;
        });
        console.log('🔄 After status filter:', filteredDesigns.length, 'trade_plans');
    }

    // Filtering by type
    if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
        console.log('🔄 Filtering by type:', selectedTypes);
        filteredDesigns = filteredDesigns.filter(design => {
            // המרת הערכים הנבחרים לאנגלית
            const typeTranslations = {
                'סווינג': 'swing',
                'השקעה': 'investment',
                'פסיבי': 'passive'
            };

            const translatedSelectedTypes = selectedTypes.map(type =>
                typeTranslations[type] || type
            );

            const designType = design.investment_type || design.type;
            const isMatch = translatedSelectedTypes.includes(designType);
            console.log(`🔄 Design ${design.id}: type=${designType}, selected=${selectedTypes}, translated=${translatedSelectedTypes}, match=${isMatch}`);
            return isMatch;
        });
        console.log('🔄 After type filter:', filteredDesigns.length, 'trade_plans');
    }

    // Filtering by dates
    if (startDate && endDate) {
        console.log('🔄 Filtering by date range:', { startDate, endDate });
        filteredDesigns = filteredDesigns.filter(design => {
            if (!design.created_at) return false;

            const designDate = new Date(design.created_at);
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Setting time to start of day for start date and end of day for end date
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const isInRange = designDate >= start && designDate <= end;
            console.log(`🔄 Design ${design.id}: created_at=${design.created_at}, inRange=${isInRange}`);
            return isInRange;
        });
        console.log('🔄 After date filter:', filteredDesigns.length, 'trade_plans');
    }

    // Filtering by search term
    if (searchTerm && searchTerm.trim() !== '') {
        console.log('🔄 Filtering by search term:', searchTerm);
        const searchLower = searchTerm.toLowerCase();

        // Bi-directional search term translations
        const searchTranslations = {
            // Status translations
            'פתוח': 'open',
            'סגור': 'closed',
            'מבוטל': 'cancelled',
            'מבוטל': 'cancelled',
            'open': 'open',
            'closed': 'closed',
            'cancelled': 'cancelled',

            // Investment type translations
            'סווינג': 'swing',
            'השקעה': 'investment',
            'פאסיבי': 'passive',
            'swing': 'swing',
            'investment': 'investment',
            'passive': 'passive',

            // Side translations
            'לונג': 'long',
            'שורט': 'short',
            'long': 'long',
            'short': 'short',

            // Number translations
            'אפס': '0',
            'אחת': '1',
            'שתיים': '2',
            'שלוש': '3',
            'ארבע': '4',
            'חמש': '5',
            'שש': '6',
            'שבע': '7',
            'שמונה': '8',
            'תשע': '9',
            'עשר': '10'
        };

        // Creating an array of search terms including translations
        const searchTerms = [searchLower];

        // Adding exact translation
        if (searchTranslations[searchLower]) {
            searchTerms.push(searchTranslations[searchLower]);
        }

        // Adding partial search - if user searches for part of a word
        Object.keys(searchTranslations).forEach(hebrewTerm => {
            if (hebrewTerm.includes(searchLower) && !searchTerms.includes(searchTranslations[hebrewTerm])) {
                searchTerms.push(searchTranslations[hebrewTerm]);
            }
        });

        filteredDesigns = filteredDesigns.filter(design => {
            // Searching in all relevant fields - based on actual server structure
            const tickerMatch = design.ticker && searchTerms.some(term =>
                (design.ticker.symbol && design.ticker.symbol.toLowerCase().includes(term)) ||
                (design.ticker.name && design.ticker.name.toLowerCase().includes(term))
            );

            const typeMatch = design.investment_type && searchTerms.some(term =>
                design.investment_type.toLowerCase().includes(term)
            );

            const sideMatch = design.side && searchTerms.some(term =>
                design.side.toLowerCase().includes(term)
            );

            const statusMatch = design.status && searchTerms.some(term =>
                design.status.toLowerCase().includes(term)
            );

            const amountMatch = design.planned_amount && searchTerms.some(term =>
                design.planned_amount.toString().includes(term)
            );

            const targetMatch = design.target_price && searchTerms.some(term =>
                design.target_price.toString().includes(term)
            );

            const stopMatch = design.stop_price && searchTerms.some(term =>
                design.stop_price.toString().includes(term)
            );

            const entryMatch = design.entry_conditions && searchTerms.some(term =>
                design.entry_conditions.toLowerCase().includes(term)
            );

            const reasonsMatch = design.reasons && searchTerms.some(term =>
                design.reasons.toLowerCase().includes(term)
            );

            const accountMatch = design.account && design.account.name && searchTerms.some(term =>
                design.account.name.toLowerCase().includes(term)
            );

            const isMatch = tickerMatch || typeMatch || sideMatch || statusMatch ||
                amountMatch || targetMatch || stopMatch || entryMatch || reasonsMatch || accountMatch;

            console.log(`🔄 Design ${design.id} search:`, {
                ticker: design.ticker?.symbol,
                type: design.investment_type,
                side: design.side,
                status: design.status,
                searchTerms: searchTerms,
                originalSearch: searchLower,
                isMatch
            });

            return isMatch;
        });
        console.log('🔄 After search filter:', filteredDesigns.length, 'trade_plans');
    }

    console.log('🔄 Final filtered trade_plans:', filteredDesigns.length);
    return filteredDesigns;
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
function restoreDesignsSectionState() {
    // Using the new global function
    if (typeof window.restoreAllSectionStates === 'function') {
        window.restoreAllSectionStates();
    } else {
        console.error('restoreAllSectionStates function not found in main.js');
    }
}

// Safeguarding - ensuring global functions are available
if (typeof window.toggleTopSection !== 'function') {
    console.warn('⚠️ toggleTopSection not found in main.js - creating fallback');
    window.toggleTopSection = function () {
        console.warn('🔄 toggleTopSection fallback called - main.js may not be loaded properly');
        console.log('📍 Current page:', window.location.pathname);
        console.log('📍 Available functions:', Object.keys(window).filter(key => key.includes('toggle')));
    };
} else {
    console.log('✅ toggleTopSection found in main.js');
}

if (typeof window.toggleMainSection !== 'function') {
    console.warn('⚠️ toggleMainSection not found in main.js - creating fallback');
    window.toggleMainSection = function () {
        console.log('🔄 toggleMainSection fallback called');
        console.log('📍 Current page:', window.location.pathname);
        console.log('📍 Available functions:', Object.keys(window).filter(key => key.includes('toggle')));
        
        const contentSections = document.querySelectorAll('.content-section');
        console.log('📋 Number of content-sections found:', contentSections.length);
        const planningSection = contentSections[0]; // The first section - planning

        if (!planningSection) {
            console.error('❌ Planning section not found');
            return;
        }
        console.log('✅ Planning section found:', planningSection);

        const sectionBody = planningSection.querySelector('.section-body');
        const toggleBtn = planningSection.querySelector('button[onclick="toggleMainSection()"]');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        console.log('🎯 sectionBody found:', !!sectionBody);
        console.log('🔘 toggleBtn found:', !!toggleBtn);
        console.log('🎨 icon found:', !!icon);

        if (sectionBody) {
            const isCollapsed = sectionBody.style.display === 'none';
            console.log('📊 Current state - isCollapsed:', isCollapsed);

            if (isCollapsed) {
                sectionBody.style.display = 'block';
            } else {
                sectionBody.style.display = 'none';
            }

            // Updating icon
            if (icon) {
                icon.textContent = isCollapsed ? '▲' : '▼';
            }

            // Saving state to localStorage
            localStorage.setItem('planningSectionCollapsed', !isCollapsed);
        }
    };
} else {
    console.log('✅ toggleMainSection found in main.js');
}

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
    restoreDesignsSectionState();

    // Initializing filters
    if (typeof window.initializePageFilters === 'function') {
        window.initializePageFilters('planning');
    }

    // Loading data
    loadDesignsData();

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
window.loadDesignsData = loadDesignsData;
window.updateDesignsTable = updateDesignsTable;
window.showAddTradePlanModal = showAddTradePlanModal;
window.saveNewTradePlan = saveNewTradePlan;
window.editDesign = editDesign;
window.deleteDesign = deleteDesign;
window.filterDesignsData = filterDesignsData;
window.sortTable = sortTable;
window.filterDesignsLocally = filterDesignsLocally;
window.updateFilterDebugPanel = updateFilterDebugPanel;
window.translateDateRangeToDates = translateDateRangeToDates;
window.restoreSortState = restoreSortState;

// פונקציות חסרות
window.loadPlanningData = function() {
    console.log('🔄 loadPlanningData called - redirecting to loadDesignsData');
    loadDesignsData();
};

window.setupSortableHeaders = function() {
    console.log('🔄 setupSortableHeaders called for planning page');
    // הפונקציה כבר מוגדרת ב-main.js
    if (typeof window.setupSortableHeadersGlobal === 'function') {
        window.setupSortableHeadersGlobal('planning');
    } else {
        console.warn('⚠️ setupSortableHeadersGlobal not found');
    }
};

window.updateTableStats = function() {
    console.log('🔄 updateTableStats called for planning page');
    updatePageSummaryStats();
};

// Checking if functions are available
console.log('🔄 Planning.js loaded. Available functions:', {
    loadDesignsData: typeof window.loadDesignsData,
    updateDesignsTable: typeof window.updateDesignsTable,
    filterDataByFilters: typeof window.filterDataByFilters,
    updateGridFromComponentGlobal: typeof window.updateGridFromComponentGlobal,
    updateGridFromComponent: typeof window.updateGridFromComponent
});

// Verifying that our function is defined
if (window.location.pathname.includes('/planning')) {
    console.log('✅ Planning page detected - updateGridFromComponent should be ours');
    console.log('✅ Our updateGridFromComponent function:', typeof window.updateGridFromComponent);

    // Verifying that our function is called
    if (typeof window.updateGridFromComponent === 'function') {
        console.log('✅ Our updateGridFromComponent function is properly defined');
    } else {
        console.error('❌ Our updateGridFromComponent function is NOT defined');
    }
}
