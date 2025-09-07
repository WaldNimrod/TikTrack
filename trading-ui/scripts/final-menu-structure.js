/**
 * Final Menu Structure - JavaScript Functions
 * פונקציות JavaScript לתפריט הסופי בסגנון אפל
 * 
 * @version 1.0.0
 * @lastUpdated September 7, 2025
 * @author TikTrack Development Team
 */

// ===== Filter Toggle Function =====
function toggleSection(sectionName) {
    const filterSection = document.getElementById('headerFilters');
    const toggleBtn = document.getElementById('filterToggleBtn');
    
    if (filterSection.classList.contains('show')) {
        filterSection.classList.remove('show');
        toggleBtn.classList.add('collapsed');
        // הסרת משתנה CSS של גובה הפילטר
        document.documentElement.style.setProperty('--filter-height', '0px');
    } else {
        filterSection.classList.add('show');
        toggleBtn.classList.remove('collapsed');
        // חישוב גובה הפילטר והגדרת משתנה CSS
        const filterHeight = filterSection.offsetHeight;
        document.documentElement.style.setProperty('--filter-height', filterHeight + 'px');
    }
}

// ===== Filter Functions =====
function toggleStatusFilter() {
    const menu = document.getElementById('statusFilterMenu');
    menu.classList.toggle('show');
}

function selectStatusOption(value) {
    document.getElementById('selectedStatus').textContent = value;
    document.getElementById('statusFilterMenu').classList.remove('show');
}

function toggleTypeFilter() {
    const menu = document.getElementById('typeFilterMenu');
    menu.classList.toggle('show');
}

function selectTypeOption(value) {
    document.getElementById('selectedType').textContent = value;
    document.getElementById('typeFilterMenu').classList.remove('show');
}

function toggleAccountFilter() {
    const menu = document.getElementById('accountFilterMenu');
    menu.classList.toggle('show');
}

function selectAccountOption(value) {
    document.getElementById('selectedAccount').textContent = value;
    document.getElementById('accountFilterMenu').classList.remove('show');
}

function toggleDateRangeFilter() {
    const menu = document.getElementById('dateRangeFilterMenu');
    menu.classList.toggle('show');
}

function selectDateRangeOption(dateRange) {
    // עדכון הטקסט הנבחר - הצגת טווח תאריכים
    const selectedDateRangeElement = document.getElementById('selectedDateRange');
    if (selectedDateRangeElement) {
        let displayText = 'כל זמן';

        if (dateRange === 'היום') {
            const today = new Date();
            const todayStr = today.toLocaleDateString('he-IL');
            displayText = `${todayStr} - ${todayStr}`;
        } else if (dateRange === 'אתמול') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString('he-IL');
            displayText = `${yesterdayStr} - ${yesterdayStr}`;
        } else if (dateRange === 'השבוע') {
            // השבוע = מתחילת השבוע הקלנדארי ועד היום
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());

            const startStr = startOfWeek.toLocaleDateString('he-IL');
            const endStr = today.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === 'שבוע') {
            // שבוע = 7 ימים אחרונים
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);

            const startStr = startDate.toLocaleDateString('he-IL');
            const endStr = today.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === 'MTD') {
            // MTD = מתחילת החודש הקלנדארי ועד היום
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            const startStr = startOfMonth.toLocaleDateString('he-IL');
            const endStr = today.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === '30 יום') {
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 30);

            const startStr = startDate.toLocaleDateString('he-IL');
            const endStr = today.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === '60 יום') {
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 60);

            const startStr = startDate.toLocaleDateString('he-IL');
            const endStr = today.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === '90 יום') {
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 90);

            const startStr = startDate.toLocaleDateString('he-IL');
            const endStr = today.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === 'YTD') {
            // YTD = מתחילת השנה הקלנדארית ועד היום
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);

            const startStr = startOfYear.toLocaleDateString('he-IL');
            const endStr = today.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === 'שנה') {
            // שנה = 365 יום
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 365);

            const startStr = startDate.toLocaleDateString('he-IL');
            const endStr = today.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === 'שבוע קודם') {
            // שבוע קודם = מתחילת השבוע הקלנדארי הקודם ועד סופו
            const today = new Date();
            const startOfLastWeek = new Date(today);
            startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
            const endOfLastWeek = new Date(startOfLastWeek);
            endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);

            const startStr = startOfLastWeek.toLocaleDateString('he-IL');
            const endStr = endOfLastWeek.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === 'חודש קודם') {
            // חודש קודם = מתחילת החודש הקלנדארי הקודם ועד סופו
            const today = new Date();
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

            const startStr = startOfLastMonth.toLocaleDateString('he-IL');
            const endStr = endOfLastMonth.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        } else if (dateRange === 'שנה קודמת') {
            // שנה קודמת = מתחילת השנה הקלנדארית הקודמת ועד סופה
            const today = new Date();
            const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
            const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);

            const startStr = startOfLastYear.toLocaleDateString('he-IL');
            const endStr = endOfLastYear.toLocaleDateString('he-IL');
            displayText = `${startStr} - ${endStr}`;
        }

        selectedDateRangeElement.textContent = displayText;
    }

    // סגירת התפריט
    document.getElementById('dateRangeFilterMenu').classList.remove('show');
}

// ===== Search Functions =====
function clearSearch() {
    document.getElementById('searchFilterInput').value = '';
}

// ===== Reset and Clear Functions =====
// Reset Filters Function - חיבור למערכת ההעדפות
function resetFilters() {
    // קריאה למערכת ההעדפות לאיפוס לברירות מחדל
    if (window.resetFiltersToDefaults) {
        window.resetFiltersToDefaults();
    } else {
        // Fallback - איפוס ידני
        resetFiltersManually();
    }
}

// Clear All Function - חיבור למערכת הפילטרים
function clearAll() {
    // קריאה למערכת הפילטרים לניקוי מלא
    if (window.clearAllFilters) {
        window.clearAllFilters();
    } else {
        // Fallback - ניקוי ידני
        clearFiltersManually();
    }
}

// ===== Fallback Functions =====
function resetFiltersManually() {
    // איפוס פילטר סטטוס - בחירת "הכול"
    const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
    statusItems.forEach(item => item.classList.remove('selected'));
    const allStatusItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
    if (allStatusItem) {allStatusItem.classList.add('selected');}
    
    // איפוס פילטר סוג השקעה
    const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
    typeItems.forEach(item => item.classList.remove('selected'));
    const allTypeItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === 'הכול');
    if (allTypeItem) {allTypeItem.classList.add('selected');}
    
    // איפוס פילטר חשבון
    const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
    accountItems.forEach(item => item.classList.remove('selected'));
    const allAccountItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
    if (allAccountItem) {allAccountItem.classList.add('selected');}
    
    // איפוס פילטר תאריכים
    const dateItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
    dateItems.forEach(item => item.classList.remove('selected'));
    const allDateItem = Array.from(dateItems).find(item => item.getAttribute('data-value') === 'כל זמן');
    if (allDateItem) {allDateItem.classList.add('selected');}
    
    // איפוס שדה חיפוש
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {searchInput.value = '';}
    
    // עדכון טקסטים
    document.getElementById('selectedStatus').textContent = 'כל סטטוס';
    document.getElementById('selectedType').textContent = 'כל סוג השקעה';
    document.getElementById('selectedAccount').textContent = 'כל חשבון';
    document.getElementById('selectedDateRange').textContent = 'כל זמן';
}

function clearFiltersManually() {
    // ניקוי כל הפילטרים - הצגת כל הרשומות
    resetFiltersManually();
    
    // סגירת כל התפריטים
    document.querySelectorAll('.filter-menu').forEach(menu => {
        menu.classList.remove('show');
    });
}

// ===== Global Export =====
// ייצוא פונקציות לגלובל
window.selectDateRangeOption = selectDateRangeOption;
window.resetFilters = resetFilters;
window.clearAll = clearAll;
window.resetFiltersManually = resetFiltersManually;
window.clearFiltersManually = clearFiltersManually;

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize filter toggle button state
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    if (filterToggleBtn) {
        filterToggleBtn.classList.add('collapsed');
    }

    // Search clear button
    const searchClearBtn = document.getElementById('searchClearBtn');
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', clearSearch);
    }

    // Close filter menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-dropdown')) {
            document.querySelectorAll('.filter-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    console.log('✅ Final Menu Structure JavaScript loaded successfully');
});
