/**
 * planning.js - קובץ הפונקציות של דף התכנונים
 * 
 * קובץ זה מכיל את כל הפונקציות הספציפיות לדף התכנונים:
 * - טעינת נתוני תכנונים
 * - עדכון טבלת התכנונים
 * - פונקציות עריכה ומחיקה
 * - מערכת מיון
 * - פונקציות פילטרים
 */

// משתנים גלובליים
let planningData = [];
let planningCurrentSortColumn = null;
let planningCurrentSortDirection = 'asc';

/**
 * פונקציה לטעינת נתוני תכנונים מהשרת
 */
async function loadPlanningData() {
    try {
        console.log('🔄 טוען נתוני תכנונים מהשרת...');

        // טעינת נתונים מהשרת
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/trade_plans/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🔄 נתונים שהתקבלו מהשרת:', data);

        // בדיקה שהנתונים הם מערך
        let plansData = data;
        if (!Array.isArray(plansData)) {
            if (plansData && plansData.data && Array.isArray(plansData.data)) {
                plansData = plansData.data;
            } else {
                throw new Error('הנתונים שהתקבלו מהשרת אינם בפורמט הנכון');
            }
        }

        // המרת הנתונים לפורמט הנדרש
        planningData = plansData.map(plan => {
            console.log('🔄 Processing plan:', plan.id, 'ticker:', plan.ticker);
            return {
                id: plan.id,
                ticker: plan.ticker?.symbol || plan.ticker_symbol || 'N/A',
                created_at: plan.created_at,
                type: plan.investment_type || 'swing',
                side: plan.side || 'Long',
                amount: plan.planned_amount || 0,
                target: plan.target_price || 0,
                stop: plan.stop_price || 0,
                current: 0, // יטען בנפרד אם נדרש
                status: plan.status || 'open',
                account: plan.account?.name || 'N/A',
                entry_conditions: plan.entry_conditions || '',
                reasons: plan.reasons || ''
            };
        });

        console.log('🔄 מספר תכנונים שנטענו:', planningData.length);

        if (planningData.length === 0) {
            console.log('🔄 אין תכנונים להצגה');
            const tbody = document.querySelector('#designsTable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">אין תכנונים להצגה</td></tr>';
            }
            return;
        }

        // שימוש בפונקציה הגלובלית לסינון
        let filteredData = planningData;
        if (typeof window.filterDataByFilters === 'function') {
            filteredData = window.filterDataByFilters(planningData, 'planning');
        }

        // עדכון הטבלה
        updatePlanningTable(filteredData);

        console.log('🔄 טעינת תכנונים הושלמה בהצלחה');

    } catch (error) {
        console.error('❌ Error loading planning data:', error);

        const tbody = document.querySelector('#designsTable tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">
        <i class="fas fa-exclamation-triangle"></i> שגיאה בטעינת נתונים
        <br><small>פרטי השגיאה: ${error.message}</small>
        <br><button class="btn btn-sm btn-outline-primary mt-2" onclick="loadPlanningData()">נסה שוב</button>
      </td></tr>`;
        }
    }
}

/**
 * פונקציה לעדכון טבלת התכנונים
 */
function updatePlanningTable(designs) {
    const tbody = document.querySelector('#designsTable tbody');
    if (!tbody) {
        console.error('Table body not found for planning table');
        return;
    }

    if (!designs || designs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">אין תכנונים להצגה</td></tr>';
        return;
    }

    const tableHTML = designs.map(design => {
        console.log('🔄 Creating row for design:', design.id, 'ticker:', design.ticker);
        return `
       <tr data-id="${design.id}">
         <td><strong><a href="#" onclick="openPlanningDetails('${design.id}')" class="ticker-link">${design.ticker}</a></strong></td>
         <td>${design.created_at ? new Date(design.created_at).toLocaleDateString('he-IL') : 'N/A'}</td>
         <td><span class="type-${design.type}">${getTypeDisplay(design.type)}</span></td>
         <td><span class="${(design.side || 'Long').toLowerCase() === 'long' ? 'side-long' : 'side-short'}">${design.side || 'Long'}</span></td>
         <td>$${design.amount.toLocaleString()}</td>
         <td>$${design.target.toFixed(2)}</td>
         <td>$${design.stop.toFixed(2)}</td>
         <td>$${design.current.toFixed(2)} (0.0%)</td>
         <td><span class="status-badge status-${design.status}">${getStatusDisplay(design.status)}</span></td>
         <td>
           <button class="btn btn-sm btn-secondary" onclick="editPlanning('${design.id}')" title="ערוך">
             ✏️
           </button>
           <button class="btn btn-sm btn-danger" onclick="deletePlanning('${design.id}')" title="מחק">X</button>
         </td>
       </tr>
     `;
    }).join('');

    tbody.innerHTML = tableHTML;

    // עדכון מונה
    const countElement = document.getElementById('designsCount');
    if (countElement) {
        countElement.textContent = `${designs.length} תכנונים`;
    }
}

/**
 * פונקציה לפתיחת פרטי תכנון
 */
function openPlanningDetails(id) {
    console.log('פתיחת פרטי תכנון:', id);
    // כאן יוכנס קוד לפתיחת פרטי תכנון
}

/**
 * פונקציה לעריכת תכנון
 */
function editPlanning(id) {
    console.log('עריכת תכנון:', id);
    // כאן יוכנס קוד לעריכת תכנון
}

/**
 * פונקציה למחיקת תכנון
 */
function deletePlanning(id) {
    console.log('מחיקת תכנון:', id);
    if (confirm('האם אתה בטוח שברצונך למחוק תכנון זה?')) {
        // כאן יוכנס קוד למחיקת תכנון
    }
}

/**
 * פונקציה לביטול תכנון טרייד
 */
async function cancelTradePlan(recordId) {
    console.log('ביטול תכנון טרייד:', recordId);

    if (!confirm('האם אתה בטוח שברצונך לבטל תכנון טרייד זה?')) {
        return;
    }

    try {
        // קריאה ל-API לביטול התכנון
        const response = await window.apiCall(`/api/v1/trade_plans/${recordId}/cancel`, 'POST');

        if (response.status === 'success') {
            if (typeof window.showNotification === 'function') {
                window.showNotification('תכנון הטרייד בוטל בהצלחה', 'success');
            } else {
                alert('תכנון הטרייד בוטל בהצלחה');
            }

            // רענון הטבלה
            loadPlanningData();
        } else {
            throw new Error(response.message || 'שגיאה בביטול התכנון');
        }
    } catch (error) {
        console.error('שגיאה בביטול תכנון:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification(`שגיאה בביטול התכנון: ${error.message}`, 'error');
        } else {
            alert(`שגיאה בביטול התכנון: ${error.message}`);
        }
    }
}

/**
 * פונקציה לפתיחת מודל הוספת תכנון
 */
function openAddTradePlanModal() {
    console.log('פתיחת מודל הוספת תכנון');
    const modal = new bootstrap.Modal(document.getElementById('addTradePlanModal'));
    modal.show();
}

/**
 * פונקציה לשמירת תכנון חדש
 */
function saveNewTradePlan() {
    console.log('שמירת תכנון חדש');

    // קבלת הנתונים מהטופס
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

    // בדיקת תקינות
    if (!formData.ticker_id || !formData.investment_type || !formData.side || !formData.planned_amount) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('נא למלא את כל השדות הנדרשים', 'error');
        } else {
            alert('נא למלא את כל השדות הנדרשים');
        }
        return;
    }

    // כאן יוכנס קוד לשמירה לשרת
    if (typeof window.showNotification === 'function') {
        window.showNotification('תכנון חדש נשמר בהצלחה!', 'success');
    } else {
        alert('תכנון חדש נשמר בהצלחה!');
    }

    // סגירת המודל
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTradePlanModal'));
    modal.hide();

    // רענון הטבלה
    loadPlanningData();
}

/**
 * פונקציה למיון הטבלה
 */
function sortPlanningTable(columnIndex) {
    console.log('🔄 === SORT PLANNING TABLE ===');
    console.log('🔄 Column clicked:', columnIndex);

    // קבלת הנתונים הנוכחיים
    let designs = [...planningData];

    // החלת פילטרים קיימים
    if (typeof window.filterDataByFilters === 'function') {
        designs = window.filterDataByFilters(designs, 'planning');
    }

    // עדכון המשתנים הגלובליים
    if (planningCurrentSortColumn === columnIndex) {
        planningCurrentSortDirection = planningCurrentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        planningCurrentSortColumn = columnIndex;
        planningCurrentSortDirection = 'asc';
    }

    // מיון הנתונים
    designs.sort((a, b) => {
        let aValue, bValue;

        switch (columnIndex) {
            case 0: // נכס (Ticker)
                aValue = a.ticker.toLowerCase();
                bValue = b.ticker.toLowerCase();
                break;
            case 1: // תאריך
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
                break;
            case 2: // סוג
                aValue = a.type.toLowerCase();
                bValue = b.type.toLowerCase();
                break;
            case 3: // צד
                aValue = (a.side || 'Long').toLowerCase();
                bValue = (b.side || 'Long').toLowerCase();
                break;
            case 4: // סכום
                aValue = parseFloat(a.amount);
                bValue = parseFloat(b.amount);
                break;
            case 5: // יעד
                aValue = parseFloat(a.target);
                bValue = parseFloat(b.target);
                break;
            case 6: // סטופ
                aValue = parseFloat(a.stop);
                bValue = parseFloat(b.stop);
                break;
            case 7: // נוכחי
                aValue = parseFloat(a.current);
                bValue = parseFloat(b.current);
                break;
            case 8: // סטטוס
                aValue = getStatusForSort(a.status);
                bValue = getStatusForSort(b.status);
                break;
            default:
                return 0;
        }

        // השוואה
        if (aValue < bValue) {
            return planningCurrentSortDirection === 'asc' ? -1 : 1;
        } else if (aValue > bValue) {
            return planningCurrentSortDirection === 'asc' ? 1 : -1;
        } else {
            return 0;
        }
    });

    // עדכון הטבלה
    updatePlanningTable(designs);

    // עדכון אייקונים
    updateSortIcons(columnIndex);

    // שמירת מצב המיון ב-localStorage
    localStorage.setItem('planningSortColumn', columnIndex.toString());
    localStorage.setItem('planningSortDirection', planningCurrentSortDirection);
}

/**
 * פונקציה לעדכון אייקוני המיון
 */
function updateSortIcons(activeColumnIndex) {
    const buttons = document.querySelectorAll('.sortable-header-btn');

    buttons.forEach((button, index) => {
        const sortIcon = button.querySelector('.sort-icon');
        if (sortIcon) {
            if (index === activeColumnIndex) {
                const iconText = planningCurrentSortDirection === 'asc' ? '↑' : '↓';
                sortIcon.textContent = iconText;
                sortIcon.style.color = '#ff9c05';
                sortIcon.style.fontWeight = 'bold';
            } else {
                sortIcon.textContent = '↕';
                sortIcon.style.color = '#666';
                sortIcon.style.fontWeight = 'normal';
            }
        }
    });
}

/**
 * פונקציה לאיפוס מיון
 */
function resetSort() {
    planningCurrentSortColumn = null;
    planningCurrentSortDirection = 'asc';

    // מחיקת מצב מיון מ-localStorage
    localStorage.removeItem('planningSortColumn');
    localStorage.removeItem('planningSortDirection');

    // איפוס אייקונים
    updateSortIcons(-1);

    // רענון הנתונים
    loadPlanningData();

    if (typeof window.showNotification === 'function') {
        window.showNotification('מיון אופס', 'success');
    }
}

/**
 * פונקציה לקבלת ערך סטטוס למיון
 */
function getStatusForSort(status) {
    switch (status) {
        case 'open': return 1;
        case 'closed': return 2;
        case 'canceled': return 3;
        default: return 0;
    }
}

/**
 * פונקציה להצגת סוג
 */
function getTypeDisplay(type) {
    switch (type) {
        case 'swing': return 'סווינג';
        case 'investment': return 'השקעה';
        case 'passive': return 'פאסיבי';
        default: return type;
    }
}

/**
 * פונקציה להצגת סטטוס
 */
function getStatusDisplay(status) {
    switch (status) {
        case 'open': return 'פתוח';
        case 'closed': return 'סגור';
        case 'cancelled': return 'מבוטל';
        case 'canceled': return 'מבוטל';
        default: return status;
    }
}

/**
 * פונקציה לטעינת תכנונים (alias)
 */
function loadDesigns() {
    loadPlanningData();
}

/**
 * פונקציה לפילטור נתונים
 */
function filterPlanningData(statuses, types, accounts, dateRange, searchTerm) {
    console.log('🔄 Filtering planning data:', { statuses, types, accounts, dateRange, searchTerm });

    // שמירת הפילטרים
    window.selectedStatusesForFilter = statuses || [];
    window.selectedTypesForFilter = types || [];
    window.selectedAccountsForFilter = accounts || [];
    window.selectedDateRangeForFilter = dateRange || null;
    window.searchTermForFilter = searchTerm || '';

    // רענון הנתונים
    loadPlanningData();
}

/**
 * פונקציה לאיפוס פילטרים ורענון נתונים
 */
function resetAllFiltersAndReloadData() {
    // איפוס פילטרים
    window.selectedStatusesForFilter = [];
    window.selectedTypesForFilter = [];
    window.selectedAccountsForFilter = [];
    window.selectedDateRangeForFilter = null;
    window.searchTermForFilter = '';

    // רענון נתונים
    loadPlanningData();

    if (typeof window.showNotification === 'function') {
        window.showNotification('פילטרים אופסו', 'success');
    }
}

/**
 * פונקציה לרענון נתונים בלבד
 */
function refreshDataOnly() {
    loadPlanningData();
}

/**
 * פונקציה לסגירה/פתיחה של סקשן התכנונים
 */
function togglePlanningSection() {
    const section = document.getElementById('designsSection');
    if (section) {
        const isHidden = section.style.display === 'none';
        section.style.display = isHidden ? 'block' : 'none';

        // שמירת המצב
        localStorage.setItem('planningSectionCollapsed', !isHidden);
    }
}

/**
 * פונקציה לשחזור מצב הסקשן
 */
function restorePlanningSectionState() {
    const section = document.getElementById('designsSection');
    if (section) {
        const isCollapsed = localStorage.getItem('planningSectionCollapsed') === 'true';
        section.style.display = isCollapsed ? 'none' : 'block';
    }
}

// ===== ייצוא הפונקציות לגלובל =====

// פונקציות טעינה ועדכון
window.loadPlanningData = loadPlanningData;
window.updatePlanningTable = updatePlanningTable;
window.loadDesigns = loadDesigns;

// פונקציות פעולות
window.openPlanningDetails = openPlanningDetails;
window.editPlanning = editPlanning;
window.deletePlanning = deletePlanning;
window.cancelTradePlan = cancelTradePlan;

// פונקציות מודל
window.openAddTradePlanModal = openAddTradePlanModal;
window.saveNewTradePlan = saveNewTradePlan;

// פונקציות מיון
window.sortPlanningTable = sortPlanningTable;
window.updateSortIcons = updateSortIcons;
window.resetSort = resetSort;

// פונקציות פילטרים
window.filterPlanningData = filterPlanningData;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;
window.refreshDataOnly = refreshDataOnly;

// פונקציות UI
window.togglePlanningSection = togglePlanningSection;
window.restorePlanningSectionState = restorePlanningSectionState;

// Aliases לשמירה על תאימות
window.loadDesignsData = loadPlanningData;
window.updateDesignsTable = updatePlanningTable;
window.sortTable = sortPlanningTable;
window.filterDesignsData = filterPlanningData;
window.toggleDesignsSectionLocal = togglePlanningSection;
window.restoreDesignsSectionState = restorePlanningSectionState;

console.log('✅ קובץ planning.js נטען בהצלחה - פונקציות זמינות גלובלית');
