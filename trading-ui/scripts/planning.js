/**
 * ========================================
 * דף התכנון - Planning Page
 * ========================================
 * 
 * קובץ ייעודי לדף התכנון (planning.html)
 * 
 * תכולת הקובץ:
 * - טעינת נתוני תכנונים מהשרת
 * - הצגת טבלת תכנונים עם מיון ופילטרים
 * - הוספת תכנון חדש
 * - עריכת תכנון קיים
 * - מחיקת תכנון
 * - ניהול סטטוסים ומצבים
 * - שימוש במערכת התראות גלובלית
 * 
 * מערכת התראות:
 * - כל הודעות המשתמש משתמשות במערכת ההתראות הגלובלית
 * - showSuccessNotification() - הודעות הצלחה
 * - showErrorNotification() - הודעות שגיאה
 * - showWarningNotification() - הודעות אזהרה
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// משתנים גלובליים
let designsData = [];

// הפונקציה translateDateRangeToDates כבר מוגדרת בתחילת הקובץ

// הגדרת הפונקציה updateGridFromComponent מיד בתחילת הקובץ
console.log('🔄 Planning.js: Setting up updateGridFromComponent for planning page');
// וידוא שהפונקציה מוגדרת רק בדף התכנונים
if (window.location.pathname.includes('/planning')) {
    window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
        console.log('🔄 updateGridFromComponent called for planning page with:', {
            selectedStatuses,
            selectedTypes,
            selectedDateRange,
            searchTerm
        });

        console.log('✅ This is the PLANNING page updateGridFromComponent function!');

        // שמירת הפילטרים במשתנים גלובליים
        window.selectedStatusesForFilter = selectedStatuses || [];
        window.selectedTypesForFilter = selectedTypes || [];
        window.selectedDateRangeForFilter = selectedDateRange || null;
        window.searchTermForFilter = searchTerm || '';

        // חילוץ תאריכי התחלה וסיום מטווח התאריכים
        let startDate = 'לא נבחר';
        let endDate = 'לא נבחר';

        if (selectedDateRange && selectedDateRange !== 'כל זמן') {
            console.log('🔄 Translating date range:', selectedDateRange);
            // תרגום טווח התאריכים לתאריכים אמיתיים
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

        // עדכון חלון הבדיקה
        if (typeof updateFilterDebugPanel === 'function') {
            updateFilterDebugPanel();
        }

        // קריאה ישירה לפונקציה המקומית
        console.log('🔄 Calling loadDesignsData directly for planning page');
        if (typeof window.loadDesignsData === 'function') {
            window.loadDesignsData();
        } else {
            console.error('❌ loadDesignsData function not found');
        }
    };
}

/**
 * טעינת נתוני תכנונים מהשרת
 * 
 * פונקציה זו טוענת את כל התכנונים מהשרת ומעדכנת את הטבלה
 * אם השרת לא זמין, משתמשת בנתוני דמו
 * 
 * @returns {Array} מערך של תכנונים
 */
async function loadDesignsData() {
    try {
        console.log('🔄 טוען תכנונים מהשרת...');

        // הגדרת base URL
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🔄 נתונים שהתקבלו מהשרת:', data);

        // בדיקה שהנתונים הם מערך
        let designs = data;
        if (!Array.isArray(designs)) {
            console.log('🔄 הנתונים שהתקבלו אינם מערך, מחפש data.data');
            if (data && data.data && Array.isArray(data.data)) {
                designs = data.data;
            } else {
                throw new Error('הנתונים שהתקבלו מהשרת אינם בפורמט הנכון');
            }
        }

        console.log(`✅ נטענו ${designs.length} תכנונים`);

        // עדכון המשתנה הגלובלי
        designsData = designs.map(design => ({
            id: design.id,
            ticker: design.ticker_symbol || design.ticker,
            date: design.created_at || design.date,
            type: design.investment_type || design.type,
            side: design.side,
            amount: design.planned_amount || design.amount,
            target: design.target_price || design.target,
            stop: design.stop_price || design.stop,
            current: design.current_price || design.current,
            status: design.status
        }));

        // החלת פילטרים על הנתונים
        let filteredDesigns = [...designsData];

        // בדיקה אם יש פילטרים פעילים
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
            console.log('🔄 Applying filters to designs data...');
            if (typeof window.filterDataByFilters === 'function') {
                filteredDesigns = window.filterDataByFilters(designsData, 'planning');
            } else {
                // פונקציה מקומית לפילטור אם הפונקציה הגלובלית לא זמינה
                filteredDesigns = filterDesignsLocally(designsData, window.selectedStatusesForFilter, window.selectedTypesForFilter, window.selectedDateRangeForFilter, window.searchTermForFilter);
            }
            console.log('🔄 After filtering:', filteredDesigns.length, 'designs');
        } else {
            console.log('🔄 No active filters, showing all designs');
        }

        // שמירת הנתונים המסוננים לגלובלי
        window.filteredDesignsData = filteredDesigns;

        // עדכון הטבלה עם הנתונים המסוננים
        updateDesignsTable(filteredDesigns);

        // עדכון חלון הבדיקה
        updateFilterDebugPanel();

        return designsData;

    } catch (error) {
        console.error('❌ Error loading designs data:', error);
        console.error('❌ Error details:', error.message);

        // הצגת הודעת שגיאה מפורטת בטבלה
        const tbody = document.querySelector('#designsTable tbody');
        if (tbody) {
            // זיהוי סוג השגיאה
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

        // איפוס הנתונים
        designsData = [];
        window.filteredDesignsData = [];

        // עדכון סטטיסטיקות
        updateSummaryStats();

        return designsData;
    }
}

/**
 * עדכון טבלת תכנונים
 * 
 * פונקציה זו מעדכנת את הטבלה עם הנתונים החדשים
 * כולל המרת ערכים לעברית ועיצוב תאים
 * 
 * @param {Array} designs - מערך של תכנונים לעדכון
 */
function updateDesignsTable(designs) {
    console.log('🔄 === UPDATE DESIGNS TABLE ===');
    console.log('🔄 Designs to display:', designs.length);

    const tbody = document.querySelector('#designsTable tbody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }

    // בדיקה אם יש נתונים להצגה
    if (!designs || designs.length === 0) {
        // בדיקה אם זה בגלל פילטר או שאין נתונים בכלל
        const hasOriginalData = designsData && designsData.length > 0;

        // בדיקה אם יש פילטרים פעילים
        const hasActiveFilters = (() => {
            // בדיקת חיפוש
            if (window.searchTermForFilter && window.searchTermForFilter.trim() !== '') {
                return true;
            }

            // בדיקת סטטוסים (אם לא כל הסטטוסים מסומנים)
            if (window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0) {
                const allStatuses = ['open', 'closed', 'cancelled'];
                const selectedStatuses = window.selectedStatusesForFilter.map(s => s.toLowerCase());
                if (!allStatuses.every(status => selectedStatuses.includes(status))) {
                    return true;
                }
            }

            // בדיקת סוגים (אם לא כל הסוגים מסומנים)
            if (window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0) {
                const allTypes = ['swing', 'investment', 'passive'];
                const selectedTypes = window.selectedTypesForFilter.map(t => t.toLowerCase());
                if (!allTypes.every(type => selectedTypes.includes(type))) {
                    return true;
                }
            }

            // בדיקת טווח תאריכים
            if (window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן') {
                return true;
            }

            return false;
        })();

        if (hasOriginalData && hasActiveFilters) {
            // יש נתונים אבל הפילטר לא מצא תוצאות
            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-info">
                <i class="fas fa-search"></i> לא נמצאו תוצאות
                <br><small>נסה לשנות את הפילטרים או מונח החיפוש</small>
            </td></tr>`;
        } else {
            // אין נתונים בכלל
            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">
                <i class="fas fa-info-circle"></i> אין תכנונים להצגה
                <br><small>לא נמצאו תכנונים במערכת</small>
            </td></tr>`;
        }

        // עדכון ספירת רשומות
        const countElement = document.querySelector('#designsCount');
        if (countElement) {
            countElement.textContent = '0 תכנונים';
        }

        // עדכון סטטיסטיקות
        updateSummaryStats();
        return;
    }

    const tableHTML = designs.map(design => {
        // הגנה מפני נתונים לא תקינים
        if (!design || typeof design !== 'object') {
            console.warn('Invalid design data in table:', design);
            return '';
        }

        const statusClass = getStatusClass(design.status);
        const typeClass = getTypeClass(design.type);

        const date = design.date ? new Date(design.date).toLocaleDateString('he-IL') : 'לא מוגדר';
        const typeDisplay = getTypeDisplay(design.type);
        const sideDisplay = design.side === 'Long' ? 'Long' : 'Short';
        const amountDisplay = formatCurrency(design.amount);
        const targetDisplay = formatCurrency(design.target);
        const stopDisplay = formatCurrency(design.stop);
        const currentDisplay = formatCurrency(design.current);
        const statusDisplay = getStatusDisplay(design.status);

        return `
      <tr>
        <td><span class="ticker-text">${design.ticker}</span></td>
        <td><span class="date-text">${date}</span></td>
        <td><span class="type-badge ${typeClass}">${typeDisplay}</span></td>
        <td><span class="side-badge ${design.side.toLowerCase()}">${sideDisplay}</span></td>
        <td><span class="amount-text">${amountDisplay}</span></td>
        <td><span class="target-text">${targetDisplay}</span></td>
        <td><span class="stop-text">${stopDisplay}</span></td>
        <td><span class="current-text">${currentDisplay}</span></td>
        <td><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-secondary" onclick="editDesign(${design.id})" title="ערוך">
            ✏️
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteDesign(${design.id})" title="מחק">
            🗑️
          </button>
        </td>
      </tr>
    `;
    }).join('');

    tbody.innerHTML = tableHTML;

    // עדכון ספירת רשומות
    const countElement = document.querySelector('#designsCount');
    if (countElement) {
        countElement.textContent = `${designs.length} תכנונים`;
    }

    // עדכון סטטיסטיקות
    updateSummaryStats();
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updateSummaryStats() {
    // שימוש בנתונים המסוננים אם יש, אחרת בכל הנתונים
    const dataToUse = window.filteredDesignsData || designsData;
    const totalDesigns = dataToUse.length;
    const openDesigns = dataToUse.filter(design => design.status === 'open').length;
    const closedDesigns = dataToUse.filter(design => design.status === 'closed').length;
    const cancelledDesigns = dataToUse.filter(design => design.status === 'cancelled').length;

    // חישוב סכומים
    let totalInvestment = 0;
    let totalProfit = 0;

    designsData.forEach(design => {
        // הגנה מפני נתונים לא תקינים
        if (!design || typeof design !== 'object') {
            console.warn('Invalid design data:', design);
            return;
        }

        // טיפול בנתונים מהשרת (מספרים) או מחרוזות
        let amount = 0;
        if (design.amount !== null && design.amount !== undefined) {
            if (typeof design.amount === 'string') {
                amount = parseFloat(design.amount.replace(/[$,]/g, '')) || 0;
            } else {
                amount = parseFloat(design.amount) || 0;
            }
        }
        totalInvestment += amount;

        // חישוב רווח פשוט (לצורך הדוגמה)
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
                totalProfit += amount * 0.1; // רווח של 10% לדוגמה
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
    // ניקוי הטופס
    const form = document.getElementById('addTradePlanForm');
    if (form) {
        form.reset();
    }

    // קביעת תאריך היום
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('addTradePlanDate');
    if (dateInput) {
        dateInput.value = today;
    }

    // הצגת המודל
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

    // בדיקת תקינות הטופס
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = {
        ticker_id: document.getElementById('addTradePlanTickerId').value,
        investment_type: document.getElementById('addTradePlanInvestmentType').value,
        side: document.getElementById('addTradePlanSide').value,
        planned_amount: parseFloat(document.getElementById('addTradePlanPlannedAmount').value),
        stop_price: parseFloat(document.getElementById('addTradePlanStopPrice').value) || null,
        target_price: parseFloat(document.getElementById('addTradePlanTargetPrice').value) || null,
        entry_conditions: document.getElementById('addTradePlanEntryConditions').value,
        reasons: document.getElementById('addTradePlanReasons').value,
        created_at: document.getElementById('addTradePlanDate').value
    };

    console.log('שולח תכנון חדש:', formData);

    try {
        const response = await fetch('/api/v1/trade_plans/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const newDesign = await response.json();
            console.log('תכנון נשמר בהצלחה:', newDesign);

            // סגירת המודל
            closeModal('addTradePlanModal');

            // רענון הנתונים
            loadDesignsData();

            // הצגת הודעה
            showSuccessNotification('תכנון נשמר', 'תכנון נשמר בהצלחה!');
        } else {
            throw new Error(`שגיאה בשמירת תכנון: ${response.status}`);
        }
    } catch (error) {
        console.error('שגיאה בשמירת תכנון:', error);
        showErrorNotification('שגיאה בשמירת תכנון', 'שגיאה בשמירת תכנון: ' + error.message);
    }
}

/**
 * עריכת תכנון
 */
function editDesign(designId) {
    const design = designsData.find(d => d.id === designId);
    if (!design) {
        showErrorNotification('תכנון לא נמצא', 'תכנון לא נמצא');
        return;
    }

    // כאן תהיה פתיחת מודל עריכה
    console.log('עריכת תכנון:', design);
    showInfoNotification('עריכת תכנון', 'פונקציית עריכת תכנון תתווסף בקרוב');
}

/**
 * מחיקת תכנון
 */
async function deleteDesign(designId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק תכנון זה?')) {
        return;
    }

    try {
        console.log('מוחק תכנון:', designId);

        const response = await fetch(`/api/v1/trade_plans/${designId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('תכנון נמחק בהצלחה');

            // רענון הנתונים
            loadDesignsData();

            // הצגת הודעה
            showSuccessNotification('תכנון נמחק', 'תכנון נמחק בהצלחה!');
        } else {
            throw new Error(`שגיאה במחיקת תכנון: ${response.status}`);
        }
    } catch (error) {
        console.error('שגיאה במחיקת תכנון:', error);
        showErrorNotification('שגיאה במחיקת תכנון', 'שגיאה במחיקת תכנון: ' + error.message);
    }
}

/**
 * סגירת מודל
 */
function closeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        } else {
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
        }
    }
}

/**
 * פילטור נתוני תכנונים
 */
function filterDesignsData(statuses, types, accounts, dateRange, searchTerm) {
    console.log('פילטור תכנונים:', { statuses, types, accounts, dateRange, searchTerm });

    // קריאה לפונקציה הגלובלית עם pageName
    if (typeof window.updateGridFromComponentGlobal === 'function') {
        window.updateGridFromComponentGlobal(statuses, types, accounts, dateRange, searchTerm, 'planning');
    }
}

/**
 * מיון טבלה
 */
function sortTable(columnIndex) {
    console.log(`מיון לפי עמודה ${columnIndex}`);
    // פונקציה זו תתווסף בהמשך
}

/**
 * קבלת מחלקת סטטוס
 */
function getStatusClass(status) {
    // הגנה מפני ערכים לא תקינים
    if (status === null || status === undefined) {
        return 'status-inactive';
    }

    switch (status) {
        case 'open': return 'status-open';
        case 'closed': return 'status-closed';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-inactive';
    }
}

/**
 * קבלת מחלקת CSS לסוג
 */
function getTypeClass(type) {
    // הגנה מפני ערכים לא תקינים
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
 * קבלת תצוגת סוג
 */
function getTypeDisplay(type) {
    // הגנה מפני ערכים לא תקינים
    if (type === null || type === undefined) {
        return 'לא מוגדר';
    }

    const typeMap = {
        'swing': 'סווינג',
        'investment': 'השקעה',
        'passive': 'פאסיבי'
    };
    return typeMap[type] || type;
}

/**
 * קבלת תצוגת סטטוס
 */
function getStatusDisplay(status) {
    // הגנה מפני ערכים לא תקינים
    if (status === null || status === undefined) {
        return 'לא מוגדר';
    }

    const statusMap = {
        'open': 'פתוח',
        'closed': 'סגור',
        'cancelled': 'מבוטל'
    };
    return statusMap[status] || status;
}

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

    // יצירת תאריך עם timezone
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
                // בישראל השבוע מתחיל ביום ראשון (0)
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
                console.log('🔄 שנה קודמת calculation:', {
                    today: todayStr,
                    lastYear: today.getFullYear() - 1,
                    startDate: startDate,
                    endDate: endDate
                });
                break;

            default:
                // ניסיון לחלץ תאריכים מטקסט
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
function filterDesignsLocally(designs, selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
    console.log('🔄 === FILTER DESIGNS LOCALLY ===');
    console.log('🔄 Original designs:', designs.length);
    console.log('🔄 Filters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

    let filteredDesigns = [...designs];

    // חילוץ תאריכי התחלה וסיום
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

    // פילטר לפי סטטוס
    if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
        console.log('🔄 Filtering by status:', selectedStatuses);
        filteredDesigns = filteredDesigns.filter(design => {
            let itemStatus;
            if (design.status === 'cancelled') {
                itemStatus = 'מבוטל';
            } else if (design.status === 'closed') {
                itemStatus = 'סגור';
            } else {
                itemStatus = 'פתוח';
            }
            const isMatch = selectedStatuses.includes(itemStatus);
            console.log(`🔄 Design ${design.id}: status=${design.status}, mapped=${itemStatus}, selected=${selectedStatuses}, match=${isMatch}`);
            return isMatch;
        });
        console.log('🔄 After status filter:', filteredDesigns.length, 'designs');
    }

    // פילטר לפי סוג
    if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
        console.log('🔄 Filtering by type:', selectedTypes);
        filteredDesigns = filteredDesigns.filter(design => {
            let typeDisplay;
            switch (design.type || design.investment_type) {
                case 'swing':
                    typeDisplay = 'סווינג';
                    break;
                case 'investment':
                    typeDisplay = 'השקעה';
                    break;
                case 'passive':
                    typeDisplay = 'פאסיבי';
                    break;
                default:
                    typeDisplay = design.type || design.investment_type;
            }
            const isMatch = selectedTypes.includes(typeDisplay);
            console.log(`🔄 Design ${design.id}: type=${design.type}, mapped=${typeDisplay}, selected=${selectedTypes}, match=${isMatch}`);
            return isMatch;
        });
        console.log('🔄 After type filter:', filteredDesigns.length, 'designs');
    }

    // פילטר לפי תאריכים
    if (startDate && endDate) {
        console.log('🔄 Filtering by date range:', { startDate, endDate });
        filteredDesigns = filteredDesigns.filter(design => {
            if (!design.date) return false;

            const designDate = new Date(design.date);
            const start = new Date(startDate);
            const end = new Date(endDate);

            // הגדרת זמן לתחילת היום לתאריך התחלה ולסוף היום לתאריך סיום
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const isInRange = designDate >= start && designDate <= end;
            console.log(`🔄 Design ${design.id}: date=${design.date}, inRange=${isInRange}`);
            return isInRange;
        });
        console.log('🔄 After date filter:', filteredDesigns.length, 'designs');
    }

    // פילטר לפי חיפוש
    if (searchTerm && searchTerm.trim() !== '') {
        console.log('🔄 Filtering by search term:', searchTerm);
        const searchLower = searchTerm.toLowerCase();

        // תרגום מונחי חיפוש דו-כיווני
        const searchTranslations = {
            // תרגום סטטוסים
            'פתוח': 'open',
            'סגור': 'closed',
            'בוטל': 'cancelled',
            'מבוטל': 'cancelled',
            'open': 'open',
            'closed': 'closed',
            'cancelled': 'cancelled',

            // תרגום סוגי השקעות
            'סווינג': 'swing',
            'השקעה': 'investment',
            'פאסיבי': 'passive',
            'swing': 'swing',
            'investment': 'investment',
            'passive': 'passive',

            // תרגום צדדים
            'לונג': 'long',
            'שורט': 'short',
            'long': 'long',
            'short': 'short',

            // תרגום מספרים
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

        // יצירת מערך מונחי חיפוש כולל התרגום
        const searchTerms = [searchLower];

        // הוספת תרגום מדויק
        if (searchTranslations[searchLower]) {
            searchTerms.push(searchTranslations[searchLower]);
        }

        // הוספת חיפוש חלקי - אם המשתמש מחפש חלק ממילה
        Object.keys(searchTranslations).forEach(hebrewTerm => {
            if (hebrewTerm.includes(searchLower) && !searchTerms.includes(searchTranslations[hebrewTerm])) {
                searchTerms.push(searchTranslations[hebrewTerm]);
            }
        });

        filteredDesigns = filteredDesigns.filter(design => {
            // חיפוש בכל השדות הרלוונטיים - לפי המבנה האמיתי מהשרת
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
        console.log('🔄 After search filter:', filteredDesigns.length, 'designs');
    }

    console.log('🔄 Final filtered designs:', filteredDesigns.length);
    return filteredDesigns;
}

/**
 * עיצוב מטבע
 */
function formatCurrency(amount) {
    // טיפול במקרים של null, undefined או ערכים לא תקינים
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

    // אם לא הצלחנו לפרסר, נחזיר 0
    return '$0';
}

/**
 * שחזור מצב הסקשנים
 * 
 * פונקציה זו משתמשת בפונקציה הגלובלית מ-main.js
 */
function restoreDesignsSectionState() {
    // שימוש בפונקציה הגלובלית החדשה
    if (typeof window.restoreAllSectionStates === 'function') {
        window.restoreAllSectionStates();
    } else {
        console.error('restoreAllSectionStates function not found in main.js');
    }
}

// הגנה - וידוא שהפונקציות הגלובליות זמינות
if (typeof window.toggleTopSection !== 'function') {
    window.toggleTopSection = function () {
        console.warn('toggleTopSection fallback called - main.js may not be loaded properly');
    };
}

if (typeof window.toggleMainSection !== 'function') {
    window.toggleMainSection = function () {
        console.warn('toggleMainSection fallback called - main.js may not be loaded properly');
    };
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === DOM CONTENT LOADED (PLANNING) ===');

    // בדיקת זמינות פונקציות גלובליות
    console.log('🔍 Checking global functions:', {
        toggleTopSection: typeof window.toggleTopSection,
        toggleMainSection: typeof window.toggleMainSection,
        restoreAllSectionStates: typeof window.restoreAllSectionStates,
        filterDataByFilters: typeof window.filterDataByFilters,
        updateGridFromComponentGlobal: typeof window.updateGridFromComponentGlobal
    });

    // שחזור מצב הסקשנים
    restoreDesignsSectionState();

    // אתחול פילטרים
    if (typeof window.initializePageFilters === 'function') {
        window.initializePageFilters('planning');
    }

    // טעינת נתונים
    loadDesignsData();

    // עדכון חלון הבדיקה בטעינת הדף
    setTimeout(() => {
        updateFilterDebugPanel();
    }, 1000);
});

// הפונקציה updateGridFromComponent כבר מוגדרת בתחילת הקובץ

// הוספת הפונקציות לגלובל
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

// בדיקה שהפונקציות זמינות
console.log('🔄 Planning.js loaded. Available functions:', {
    loadDesignsData: typeof window.loadDesignsData,
    updateDesignsTable: typeof window.updateDesignsTable,
    filterDataByFilters: typeof window.filterDataByFilters,
    updateGridFromComponentGlobal: typeof window.updateGridFromComponentGlobal,
    updateGridFromComponent: typeof window.updateGridFromComponent
});

// וידוא שהפונקציה שלנו מוגדרת
if (window.location.pathname.includes('/planning')) {
    console.log('✅ Planning page detected - updateGridFromComponent should be ours');
    console.log('✅ Our updateGridFromComponent function:', typeof window.updateGridFromComponent);

    // בדיקה שהפונקציה שלנו נקראת
    if (typeof window.updateGridFromComponent === 'function') {
        console.log('✅ Our updateGridFromComponent function is properly defined');
    } else {
        console.error('❌ Our updateGridFromComponent function is NOT defined');
    }
}
