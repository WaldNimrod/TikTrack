/**
 * Final Menu Structure - JavaScript Functions
 * פונקציות JavaScript לתפריט הסופי בסגנון אפל
 * 
 * @version 1.0.0
 * @lastUpdated September 7, 2025
 * @author TikTrack Development Team
 */

// ===== Filter Toggle Function =====
function toggleFilterSection(sectionName) {
    console.log('🔧 toggleFilterSection called with:', sectionName);
    const filterSection = document.getElementById('headerFilters');
    const toggleBtn = document.getElementById('filterToggleBtn');
    
    if (!filterSection) {
        console.error('❌ filterSection not found');
        return;
    }
    
    if (!toggleBtn) {
        console.error('❌ toggleBtn not found');
        return;
    }
    
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
    
    // שמירת מצב
    saveFilterState();
}

// ===== Filter Functions =====
function toggleStatusFilter() {
    console.log('🔧 toggleStatusFilter called');
    const menu = document.getElementById('statusFilterMenu');
    console.log('📋 statusFilterMenu element:', menu);
    if (menu) {
        menu.classList.toggle('show');
        console.log('✅ Status filter toggled, classes:', menu.className);
        console.log('🎨 Computed styles:', {
            display: window.getComputedStyle(menu).display,
            opacity: window.getComputedStyle(menu).opacity,
            visibility: window.getComputedStyle(menu).visibility,
            zIndex: window.getComputedStyle(menu).zIndex
        });
    } else {
        console.error('❌ statusFilterMenu not found');
    }
}

function selectStatusOption(value) {
    // עדכון הטקסט
    const statusToggle = document.querySelector('.filter-group:nth-child(1) .filter-toggle span');
    if (statusToggle) {
        statusToggle.textContent = value;
    }
    
    // עדכון הפילטר במערכת
    if (window.updateFilter) {
        window.updateFilter('status', value === 'הכל' ? [] : [value]);
    }
    
    // סגירת התפריט
    document.getElementById('statusFilterMenu').classList.remove('show');
    
    // שמירת מצב
    saveFilterState();
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

function toggleTypeFilter() {
    console.log('🔧 toggleTypeFilter called');
    const menu = document.getElementById('typeFilterMenu');
    console.log('📋 typeFilterMenu element:', menu);
    if (menu) {
        menu.classList.toggle('show');
        
        // Force visibility with inline styles
        if (menu.classList.contains('show')) {
            menu.style.opacity = '1';
            menu.style.visibility = 'visible';
            menu.style.transform = 'translateY(0)';
            menu.style.display = 'block';
        } else {
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
            menu.style.transform = 'translateY(-10px)';
        }
        
        console.log('✅ Type filter toggled, classes:', menu.className);
        console.log('🎨 Computed styles:', {
            display: window.getComputedStyle(menu).display,
            opacity: window.getComputedStyle(menu).opacity,
            visibility: window.getComputedStyle(menu).visibility,
            zIndex: window.getComputedStyle(menu).zIndex
        });
    } else {
        console.error('❌ typeFilterMenu not found');
    }
}

function selectTypeOption(value) {
    // עדכון הטקסט
    const typeToggle = document.querySelector('.filter-group:nth-child(2) .filter-toggle span');
    if (typeToggle) {
        typeToggle.textContent = value;
    }
    
    // עדכון הפילטר במערכת
    if (window.updateFilter) {
        window.updateFilter('type', value === 'הכל' ? [] : [value]);
    }
    
    // סגירת התפריט
    document.getElementById('typeFilterMenu').classList.remove('show');
    
    // שמירת מצב
    saveFilterState();
}

function toggleAccountFilter() {
    console.log('🔧 toggleAccountFilter called');
    const menu = document.getElementById('accountFilterMenu');
    console.log('📋 accountFilterMenu element:', menu);
    if (menu) {
        menu.classList.toggle('show');
        
        // Force visibility with inline styles
        if (menu.classList.contains('show')) {
            menu.style.opacity = '1';
            menu.style.visibility = 'visible';
            menu.style.transform = 'translateY(0)';
            menu.style.display = 'block';
        } else {
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
            menu.style.transform = 'translateY(-10px)';
        }
        
        console.log('✅ Account filter toggled, classes:', menu.className);
        console.log('🎨 Computed styles:', {
            display: window.getComputedStyle(menu).display,
            opacity: window.getComputedStyle(menu).opacity,
            visibility: window.getComputedStyle(menu).visibility,
            zIndex: window.getComputedStyle(menu).zIndex
        });
    } else {
        console.error('❌ accountFilterMenu not found');
    }
}

function selectAccountOption(value) {
    // עדכון הטקסט
    const accountToggle = document.querySelector('.filter-group:nth-child(3) .filter-toggle span');
    if (accountToggle) {
        accountToggle.textContent = value;
    }
    
    // עדכון הפילטר במערכת (מולטיסלקט)
    if (window.updateFilter) {
        if (value === 'הכל') {
            window.updateFilter('account', []);
        } else {
            // עבור חשבונות ספציפיים, נשמור את ה-ID
            const accountId = getAccountIdByName(value);
            window.updateFilter('account', accountId ? [accountId] : []);
        }
    }
    
    // סגירת התפריט
    document.getElementById('accountFilterMenu').classList.remove('show');
    
    // שמירת מצב
    saveFilterState();
}

// פונקציה עזר לקבלת ID חשבון לפי שם
function getAccountIdByName(accountName) {
    if (!window.accountsData || !Array.isArray(window.accountsData)) {
        return null;
    }
    
    const account = window.accountsData.find(acc => acc.name === accountName);
    return account ? account.id : null;
}

// פונקציה לטעינת חשבונות דינמית
async function loadAccountsForFilter() {
    try {
        console.log('🔄 Loading accounts for filter...');
        
        // ניסיון לטעון חשבונות
        if (typeof window.loadAccountsDataForAccountsPage === 'function') {
            await window.loadAccountsDataForAccountsPage();
        } else if (typeof window.loadAccountsData === 'function') {
            await window.loadAccountsData();
        }
        
        // בדיקה שהחשבונות נטענו
        if (window.accountsData && window.accountsData.length > 0) {
            console.log('✅ Accounts loaded successfully:', window.accountsData.length);
            updateAccountFilterOptions();
        } else {
            console.warn('⚠️ No accounts loaded, using fallback');
            useAccountFilterFallback();
        }
    } catch (error) {
        console.error('❌ Error loading accounts:', error);
        useAccountFilterFallback();
    }
}

// עדכון אפשרויות פילטר החשבונות
function updateAccountFilterOptions() {
    const accountMenu = document.getElementById('accountFilterMenu');
    if (!accountMenu || !window.accountsData) return;
    
    // ניקוי אפשרויות קיימות (למעט "הכל")
    const existingOptions = accountMenu.querySelectorAll('.filter-option:not([data-fallback])');
    existingOptions.forEach(option => {
        if (option.textContent !== 'הכל') {
            option.remove();
        }
    });
    
    // הוספת חשבונות פעילים
    const activeAccounts = window.accountsData.filter(account => account.status === 'active');
    activeAccounts.forEach(account => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        option.textContent = account.name;
        option.setAttribute('data-account-id', account.id);
        option.onclick = () => selectAccountOption(account.name);
        accountMenu.appendChild(option);
    });
}

// fallback למצב שלא נטענים חשבונות
function useAccountFilterFallback() {
    const accountMenu = document.getElementById('accountFilterMenu');
    if (!accountMenu) return;
    
    // הוספת אפשרויות fallback בהתאם לטבלה
    const fallbackOptions = [
        { name: 'Trading Account 1', id: 'Trading Account 1' },
        { name: 'Investment Account', id: 'Investment Account' },
        { name: 'Retirement Account', id: 'Retirement Account' }
    ];
    
    // ניקוי אפשרויות קיימות (למעט "הכל")
    const existingOptions = accountMenu.querySelectorAll('.filter-option:not([data-fallback])');
    existingOptions.forEach(option => {
        if (option.textContent !== 'הכל') {
            option.remove();
        }
    });
    
    // הוספת אפשרויות fallback
    fallbackOptions.forEach(account => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        option.textContent = account.name;
        option.setAttribute('data-account-id', account.id);
        option.setAttribute('data-fallback', 'true');
        option.onclick = () => selectAccountOption(account.name);
        accountMenu.appendChild(option);
    });
    
    console.log('🔄 Using account filter fallback options');
}

function toggleDateRangeFilter() {
    console.log('🔧 toggleDateRangeFilter called');
    const menu = document.getElementById('dateRangeFilterMenu');
    console.log('📋 dateRangeFilterMenu element:', menu);
    if (menu) {
        menu.classList.toggle('show');
        
        // Force visibility with inline styles
        if (menu.classList.contains('show')) {
            menu.style.opacity = '1';
            menu.style.visibility = 'visible';
            menu.style.transform = 'translateY(0)';
            menu.style.display = 'block';
        } else {
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
            menu.style.transform = 'translateY(-10px)';
        }
        
        console.log('✅ Date range filter toggled, classes:', menu.className);
        console.log('🎨 Computed styles:', {
            display: window.getComputedStyle(menu).display,
            opacity: window.getComputedStyle(menu).opacity,
            visibility: window.getComputedStyle(menu).visibility,
            zIndex: window.getComputedStyle(menu).zIndex
        });
    } else {
        console.error('❌ dateRangeFilterMenu not found');
    }
}

function selectDateRangeOption(dateRange) {
    // עדכון הטקסט הנבחר - הצגת טווח תאריכים
    const dateToggle = document.querySelector('.filter-group:nth-child(4) .filter-toggle span');
    if (dateToggle) {
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

        dateToggle.textContent = displayText;
    }

    // עדכון הפילטר במערכת
    if (window.updateFilter) {
        window.updateFilter('dateRange', dateRange);
    }

    // סגירת התפריט
    document.getElementById('dateRangeFilterMenu').classList.remove('show');
    
    // שמירת מצב
    saveFilterState();
}

// ===== Search Functions =====
function clearSearch() {
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
        searchInput.value = '';
        // עדכון הפילטר במערכת
        if (window.updateFilter) {
            window.updateFilter('search', '');
        }
        // שמירת מצב
        saveFilterState();
    }
}

// ===== Reset and Clear Functions =====
// Reset Filters Function - חיבור למערכת ההעדפות
function resetFilters() {
    // קריאה למערכת הפילטרים לאיפוס
    if (window.resetToUserDefaults) {
        window.resetToUserDefaults();
    } else if (window.filterSystem && window.filterSystem.resetFilters) {
        window.filterSystem.resetFilters();
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
    // איפוס שדה חיפוש
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {searchInput.value = '';}
    
    // איפוס טקסטי הפילטרים
    const statusToggle = document.querySelector('.filter-group:nth-child(1) .filter-toggle span');
    if (statusToggle) {statusToggle.textContent = 'סטטוס';}
    
    const typeToggle = document.querySelector('.filter-group:nth-child(2) .filter-toggle span');
    if (typeToggle) {typeToggle.textContent = 'סוג השקעה';}
    
    const accountToggle = document.querySelector('.filter-group:nth-child(3) .filter-toggle span');
    if (accountToggle) {accountToggle.textContent = 'חשבון';}
    
    const dateToggle = document.querySelector('.filter-group:nth-child(4) .filter-toggle span');
    if (dateToggle) {dateToggle.textContent = 'טווח תאריכים';}
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
window.toggleFilterSection = toggleFilterSection;
window.toggleSection = toggleFilterSection; // Backward compatibility
window.toggleStatusFilter = toggleStatusFilter;
window.toggleTypeFilter = toggleTypeFilter;
window.toggleAccountFilter = toggleAccountFilter;
window.toggleDateRangeFilter = toggleDateRangeFilter;
window.selectStatusOption = selectStatusOption;
window.selectTypeOption = selectTypeOption;
window.selectAccountOption = selectAccountOption;
window.selectDateRangeOption = selectDateRangeOption;
window.clearSearch = clearSearch;
window.resetFilters = resetFilters;
window.clearAll = clearAll;
window.resetFiltersManually = resetFiltersManually;
window.clearFiltersManually = clearFiltersManually;
window.loadAccountsForFilter = loadAccountsForFilter;
window.updateAccountFilterOptions = updateAccountFilterOptions;
window.useAccountFilterFallback = useAccountFilterFallback;
window.getAccountIdByName = getAccountIdByName;
window.saveFilterState = saveFilterState;
window.restoreFilterState = restoreFilterState;

// ===== Filter State Management =====
// שמירת מצב הפילטרים
function saveFilterState() {
    const filterState = {
        isOpen: document.getElementById('headerFilters').classList.contains('show'),
        searchValue: document.getElementById('searchFilterInput').value,
        statusValue: document.querySelector('.filter-group:nth-child(1) .filter-toggle span').textContent,
        typeValue: document.querySelector('.filter-group:nth-child(2) .filter-toggle span').textContent,
        accountValue: document.querySelector('.filter-group:nth-child(3) .filter-toggle span').textContent,
        dateRangeValue: document.querySelector('.filter-group:nth-child(4) .filter-toggle span').textContent
    };
    
    localStorage.setItem('tiktrack_filter_state', JSON.stringify(filterState));
    console.log('💾 Filter state saved:', filterState);
}

// שחזור מצב הפילטרים
function restoreFilterState() {
    try {
        const savedState = localStorage.getItem('tiktrack_filter_state');
        if (!savedState) return;
        
        const filterState = JSON.parse(savedState);
        console.log('🔄 Restoring filter state:', filterState);
        
        // שחזור מצב פתיחה/סגירה
        const filterSection = document.getElementById('headerFilters');
        const toggleBtn = document.getElementById('filterToggleBtn');
        
        if (filterState.isOpen) {
            filterSection.classList.add('show');
            toggleBtn.classList.remove('collapsed');
            // חישוב גובה הפילטר
            const filterHeight = filterSection.offsetHeight;
            document.documentElement.style.setProperty('--filter-height', filterHeight + 'px');
        } else {
            filterSection.classList.remove('show');
            toggleBtn.classList.add('collapsed');
            document.documentElement.style.setProperty('--filter-height', '0px');
        }
        
        // שחזור ערכי הפילטרים
        document.getElementById('searchFilterInput').value = filterState.searchValue || '';
        
        const statusToggle = document.querySelector('.filter-group:nth-child(1) .filter-toggle span');
        if (statusToggle) statusToggle.textContent = filterState.statusValue || 'סטטוס';
        
        const typeToggle = document.querySelector('.filter-group:nth-child(2) .filter-toggle span');
        if (typeToggle) typeToggle.textContent = filterState.typeValue || 'סוג השקעה';
        
        const accountToggle = document.querySelector('.filter-group:nth-child(3) .filter-toggle span');
        if (accountToggle) accountToggle.textContent = filterState.accountValue || 'חשבון';
        
        const dateToggle = document.querySelector('.filter-group:nth-child(4) .filter-toggle span');
        if (dateToggle) dateToggle.textContent = filterState.dateRangeValue || 'טווח תאריכים';
        
        console.log('✅ Filter state restored successfully');
    } catch (error) {
        console.error('❌ Error restoring filter state:', error);
    }
}

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

    // Search input event listener
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            if (window.updateFilter) {
                window.updateFilter('search', e.target.value);
            }
            // שמירת מצב
            saveFilterState();
        });
    }

    // Close filter menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-dropdown')) {
            document.querySelectorAll('.filter-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Initialize filter system
    if (window.filterSystem) {
        console.log('🔧 Initializing filter system...');
        window.filterSystem.initialize();
        
        // Register the test table
        const testTable = document.querySelector('[data-table-type="test_trades"]');
        if (testTable) {
            window.filterSystem.registerTable('test_trades', {
                fields: ['date', 'symbol', 'type', 'amount', 'status'],
                renderFunction: function(data) {
                    // Simple render function for test table
                    console.log('Rendering test table with data:', data);
                }
            });
            console.log('✅ Test table registered with filter system');
        }
    }

    // Load accounts for filter
    loadAccountsForFilter();

    // Restore filter state after a short delay to ensure DOM is ready
    setTimeout(() => {
        restoreFilterState();
    }, 100);

    console.log('✅ Menu JavaScript loaded successfully');
});
