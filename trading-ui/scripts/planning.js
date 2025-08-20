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
        if (typeof window.filterDataByFilters === 'function') {
            console.log('🔄 Applying filters to designs data...');
            filteredDesigns = window.filterDataByFilters(designsData, 'planning');
            console.log('🔄 After filtering:', filteredDesigns.length, 'designs');
        }

        // שמירת הנתונים המסוננים לגלובלי
        window.filteredDesignsData = filteredDesigns;

        // עדכון הטבלה עם הנתונים המסוננים
        updateDesignsTable(filteredDesigns);

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
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">
            <i class="fas fa-info-circle"></i> אין תכנונים להצגה
            <br><small>לא נמצאו תכנונים במערכת</small>
        </td></tr>`;

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
        restoreAllSectionStates: typeof window.restoreAllSectionStates
    });

    // שחזור מצב הסקשנים
    restoreDesignsSectionState();

    // אתחול פילטרים
    if (typeof window.initializePageFilters === 'function') {
        window.initializePageFilters('planning');
    }

    // טעינת נתונים
    loadDesignsData();
});

// הגדרת הפונקציה updateGridFromComponent לדף התכנונים
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
    console.log('🔄 updateGridFromComponent called for planning page with:', {
        selectedStatuses,
        selectedTypes,
        selectedDateRange,
        searchTerm
    });

    // קריאה לפונקציה הגלובלית
    if (typeof window.updateGridFromComponentGlobal === 'function') {
        window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'planning');
    } else {
        console.error('updateGridFromComponentGlobal function not found');
        // fallback - טעינת נתונים מחדש
        if (typeof window.loadDesignsData === 'function') {
            window.loadDesignsData();
        }
    }
};

// הוספת הפונקציות לגלובל
window.loadDesignsData = loadDesignsData;
window.updateDesignsTable = updateDesignsTable;
window.showAddTradePlanModal = showAddTradePlanModal;
window.saveNewTradePlan = saveNewTradePlan;
window.editDesign = editDesign;
window.deleteDesign = deleteDesign;
window.filterDesignsData = filterDesignsData;
window.sortTable = sortTable;
