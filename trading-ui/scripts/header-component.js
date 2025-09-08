/**
 * Header Component - כל הקוד של אלמנט ראש הדף
 * כולל תפריט ופילטרים
 */

// ===== Menu Functions =====

// Toggle filter section
function toggleFilterSection(sectionId) {
    console.log('🔧 toggleFilterSection called with:', sectionId);
    
    const filtersSection = document.getElementById('headerFilters');
    if (!filtersSection) {
        console.error('❌ headerFilters element not found');
        return;
    }

    const isCurrentlyOpen = filtersSection.classList.contains('show');
    
    if (isCurrentlyOpen) {
        filtersSection.classList.remove('show');
        filtersSection.style.display = 'none';
        document.querySelector('.filter-toggle-btn').classList.add('collapsed');
    } else {
        filtersSection.classList.add('show');
        filtersSection.style.display = 'block';
        document.querySelector('.filter-toggle-btn').classList.remove('collapsed');
        
        // Calculate filter height for button positioning
        const filterHeight = filtersSection.offsetHeight;
        document.documentElement.style.setProperty('--filter-height', filterHeight + 'px');
    }
    
    saveFilterState();
}

// ===== Filter Functions =====

// Toggle individual filters
function toggleStatusFilter() {
    console.log('🔧 toggleStatusFilter called');
    const statusFilterMenu = document.getElementById('statusFilterMenu');
    if (statusFilterMenu) {
        statusFilterMenu.classList.toggle('show');
        console.log('✅ Status filter toggled, classes:', statusFilterMenu.className);
    }
}

function toggleTypeFilter() {
    console.log('🔧 toggleTypeFilter called');
    const typeFilterMenu = document.getElementById('typeFilterMenu');
    if (typeFilterMenu) {
        typeFilterMenu.classList.toggle('show');
        console.log('✅ Type filter toggled, classes:', typeFilterMenu.className);
    }
}

function toggleAccountFilter() {
    console.log('🔧 toggleAccountFilter called');
    const accountFilterMenu = document.getElementById('accountFilterMenu');
    if (accountFilterMenu) {
        accountFilterMenu.classList.toggle('show');
        console.log('✅ Account filter toggled, classes:', accountFilterMenu.className);
    }
}

function toggleDateRangeFilter() {
    console.log('🔧 toggleDateRangeFilter called');
    const dateRangeFilterMenu = document.getElementById('dateRangeFilterMenu');
    if (dateRangeFilterMenu) {
        dateRangeFilterMenu.classList.toggle('show');
        console.log('✅ Date range filter toggled, classes:', dateRangeFilterMenu.className);
    }
}

// Select filter options
function selectStatusOption(value) {
    console.log('🔧 selectStatusOption called with:', value);
    
    const statusMenu = document.getElementById('statusFilterMenu');
    if (statusMenu) {
        // Toggle selection for multi-select
        const selectedOption = statusMenu.querySelector(`[onclick*="${value}"]`);
        if (selectedOption) {
            selectedOption.classList.toggle('selected');
        }
        
        // Update button text to show selected count
        const selectedOptions = statusMenu.querySelectorAll('.filter-option.selected');
        const statusButton = document.querySelector('.filter-group:nth-child(1) .filter-toggle span');
        if (statusButton) {
            if (selectedOptions.length === 0) {
                statusButton.textContent = 'סטטוס';
            } else if (selectedOptions.length === 1) {
                const value = selectedOptions[0].getAttribute('onclick').match(/'([^']+)'/)[1];
                const statusTranslations = {
                    'all': 'סטטוס',
                    'open': 'פתוח',
                    'closed': 'סגור',
                    'cancelled': 'מבוטל'
                };
                statusButton.textContent = statusTranslations[value] || value;
            } else {
                statusButton.textContent = `${selectedOptions.length} סטטוסים`;
            }
        }
        
        // Don't close dropdown - stays open for multi-select
    }
    
    // Update filter system - הערכים נשארים באנגלית
    if (window.updateFilter) {
        const selectedValues = Array.from(statusMenu.querySelectorAll('.filter-option.selected'))
            .map(option => option.getAttribute('onclick').match(/'([^']+)'/)[1])
            .filter(val => val !== 'all');
        window.updateFilter('status', selectedValues);
    }
    
    saveFilterState();
}

function selectTypeOption(value) {
    console.log('🔧 selectTypeOption called with:', value);
    
    const typeMenu = document.getElementById('typeFilterMenu');
    if (typeMenu) {
        // Toggle selection for multi-select
        const selectedOption = typeMenu.querySelector(`[onclick*="${value}"]`);
        if (selectedOption) {
            selectedOption.classList.toggle('selected');
        }
        
        // Update button text to show selected count
        const selectedOptions = typeMenu.querySelectorAll('.filter-option.selected');
        const typeButton = document.querySelector('.filter-group:nth-child(2) .filter-toggle span');
        if (typeButton) {
            if (selectedOptions.length === 0) {
                typeButton.textContent = 'סוג השקעה';
            } else if (selectedOptions.length === 1) {
                const value = selectedOptions[0].getAttribute('onclick').match(/'([^']+)'/)[1];
                const typeTranslations = {
                    'all': 'סוג השקעה',
                    'swing': 'סווינג',
                    'investment': 'השקעה',
                    'passive': 'פסיבי'
                };
                typeButton.textContent = typeTranslations[value] || value;
            } else {
                typeButton.textContent = `${selectedOptions.length} סוגים`;
            }
        }
        
        // Don't close dropdown - stays open for multi-select
    }
    
    // Update filter system - הערכים נשארים באנגלית
    if (window.updateFilter) {
        const selectedValues = Array.from(typeMenu.querySelectorAll('.filter-option.selected'))
            .map(option => option.getAttribute('onclick').match(/'([^']+)'/)[1])
            .filter(val => val !== 'all');
        window.updateFilter('type', selectedValues);
    }
    
    saveFilterState();
}

function selectAccountOption(value) {
    console.log('🔧 selectAccountOption called with:', value);
    
    const accountMenu = document.getElementById('accountFilterMenu');
    if (accountMenu) {
        // Toggle selection for multi-select
        const selectedOption = accountMenu.querySelector(`[onclick*="${value}"]`);
        if (selectedOption) {
            selectedOption.classList.toggle('selected');
        }
        
        // Update button text to show selected count
        const selectedOptions = accountMenu.querySelectorAll('.filter-option.selected');
        const accountButton = document.querySelector('.filter-group:nth-child(3) .filter-toggle span');
        if (accountButton) {
            if (selectedOptions.length === 0) {
                accountButton.textContent = 'חשבון';
            } else if (selectedOptions.length === 1) {
                const value = selectedOptions[0].getAttribute('onclick').match(/'([^']+)'/)[1];
                const accountTranslations = {
                    'all': 'חשבון',
                    'Trading Account 1': 'חשבון מסחר 1',
                    'Investment Account': 'חשבון השקעות',
                    'Retirement Account': 'חשבון פנסיה'
                };
                accountButton.textContent = accountTranslations[value] || value;
            } else {
                accountButton.textContent = `${selectedOptions.length} חשבונות`;
            }
        }
        
        // Don't close dropdown - stays open for multi-select
    }
    
    // Update filter system - הערכים נשארים באנגלית
    if (window.updateFilter) {
        const selectedValues = Array.from(accountMenu.querySelectorAll('.filter-option.selected'))
            .map(option => option.getAttribute('onclick').match(/'([^']+)'/)[1])
            .filter(val => val !== 'all');
        window.updateFilter('account', selectedValues);
    }
    
    saveFilterState();
}

function selectDateRangeOption(value) {
    console.log('🔧 selectDateRangeOption called with:', value);
    
    const dateButton = document.querySelector('.filter-group:nth-child(4) .filter-toggle span');
    if (dateButton) {
        // תרגום רק בממשק - הערכים נשארים באנגלית
        const dateTranslations = {
            'all': 'תאריך',
            'today': 'היום',
            'yesterday': 'אתמול',
            'this_week': 'השבוע',
            'last_week': 'שבוע שעבר',
            'this_month': 'החודש',
            'last_month': 'חודש שעבר',
            'this_year': 'השנה',
            'last_year': 'שנה שעברה'
        };
        dateButton.textContent = dateTranslations[value] || value;
    }
    
    // Mark selected option
    const dateMenu = document.getElementById('dateRangeFilterMenu');
    if (dateMenu) {
        // Remove previous selection
        dateMenu.querySelectorAll('.filter-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Mark current selection
        const selectedOption = dateMenu.querySelector(`[onclick*="${value}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        // Close dropdown immediately after selection
        dateMenu.classList.remove('show');
    }
    
    // Update filter system - הערכים נשארים באנגלית
    if (window.updateFilter) {
        window.updateFilter('dateRange', value);
    }
    
    saveFilterState();
}

// ===== Account Management =====

// Load accounts for filter
async function loadAccountsForFilter() {
    console.log('🔄 Loading accounts for filter...');
    
    try {
        const response = await fetch('/api/accounts');
        if (response.ok) {
            const accounts = await response.json();
            window.accountsData = accounts.filter(account => account.status === 'active');
            
            if (window.accountsData.length > 0) {
                updateAccountFilterOptions();
                console.log('✅ Accounts loaded:', window.accountsData.length);
            } else {
                console.log('⚠️ No accounts loaded, using fallback');
                useAccountFilterFallback();
            }
        } else {
            console.log('⚠️ No accounts loaded, using fallback');
            useAccountFilterFallback();
        }
    } catch (error) {
        console.error('❌ Error loading accounts:', error);
        useAccountFilterFallback();
    }
}

// Update account filter options
function updateAccountFilterOptions() {
    const accountMenu = document.getElementById('accountFilterMenu');
    if (!accountMenu || !window.accountsData) return;
    
    // Clear existing options (except "הכל")
    const existingOptions = accountMenu.querySelectorAll('.filter-option:not([data-fallback])');
    existingOptions.forEach(option => {
        if (option.textContent !== 'הכל') {
            option.remove();
        }
    });
    
    // Add account options
    window.accountsData.forEach(account => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        option.textContent = account.name;
        option.onclick = () => selectAccountOption(account.id);
        accountMenu.appendChild(option);
    });
    
    console.log('✅ Account filter options updated');
}

// Fallback for account filter
function useAccountFilterFallback() {
    const accountMenu = document.getElementById('accountFilterMenu');
    if (!accountMenu) return;
    
    console.log('🔄 Using account filter fallback - showing only "הכל"');
    
    // Clear existing options (except "הכל")
    const existingOptions = accountMenu.querySelectorAll('.filter-option:not([data-fallback])');
    existingOptions.forEach(option => {
        if (option.textContent !== 'הכל') {
            option.remove();
        }
    });
    
    // No additional options - only "הכל" remains
}

// Get account ID by name
function getAccountIdByName(name) {
    if (window.accountsData) {
        const account = window.accountsData.find(acc => acc.name === name);
        return account ? account.id : name;
    }
    return name;
}

// ===== Search Functions =====

function clearSearch() {
    console.log('🔧 clearSearch called');
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
        console.log('✅ Search input found, clearing...');
        searchInput.value = '';
        if (window.updateFilter) {
            window.updateFilter('search', '');
        }
        saveFilterState();
    } else {
        console.error('❌ Search input not found');
    }
}

// ===== Filter Actions =====

function resetFiltersManually() {
    console.log('🔄 Resetting filters manually...');
    
    // Reset button texts to default Hebrew labels
    document.querySelector('.filter-group:nth-child(1) .filter-toggle span').textContent = 'סטטוס';
    document.querySelector('.filter-group:nth-child(2) .filter-toggle span').textContent = 'סוג השקעה';
    document.querySelector('.filter-group:nth-child(3) .filter-toggle span').textContent = 'חשבון';
    document.querySelector('.filter-group:nth-child(4) .filter-toggle span').textContent = 'תאריך';
    
    // Clear search
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset filter system
    if (window.resetToUserDefaults) {
        window.resetToUserDefaults();
    }
    
    saveFilterState();
}

function clearAllFilters() {
    console.log('🔄 Clearing all filters...');
    
    // Reset button texts to default Hebrew labels
    document.querySelector('.filter-group:nth-child(1) .filter-toggle span').textContent = 'סטטוס';
    document.querySelector('.filter-group:nth-child(2) .filter-toggle span').textContent = 'סוג השקעה';
    document.querySelector('.filter-group:nth-child(3) .filter-toggle span').textContent = 'חשבון';
    document.querySelector('.filter-group:nth-child(4) .filter-toggle span').textContent = 'תאריך';
    
    // Clear search
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Clear filter system
    if (window.clearAllFilters) {
        window.clearAllFilters();
    }
    
    saveFilterState();
}

// ===== Filter State Management =====

// Save filter state
function saveFilterState() {
    const filterState = {
        isOpen: document.getElementById('headerFilters').classList.contains('show'),
        searchValue: document.getElementById('searchFilterInput').value,
        statusValue: document.querySelector('.filter-group:nth-child(1) .filter-toggle span').textContent,
        typeValue: document.querySelector('.filter-group:nth-child(2) .filter-toggle span').textContent,
        accountValue: document.querySelector('.filter-group:nth-child(3) .filter-toggle span').textContent,
        dateValue: document.querySelector('.filter-group:nth-child(4) .filter-toggle span').textContent
    };
    
    localStorage.setItem('headerFilterState', JSON.stringify(filterState));
    console.log('💾 Filter state saved:', filterState);
}

// Restore filter state
function restoreFilterState() {
    console.log('🔄 Restoring filter state...');
    
    try {
        const savedState = localStorage.getItem('headerFilterState');
        if (savedState) {
            const filterState = JSON.parse(savedState);
            
            // Restore filter open/closed state
            const filtersSection = document.getElementById('headerFilters');
            const toggleBtn = document.querySelector('.filter-toggle-btn');
            
            if (filterState.isOpen) {
                filtersSection.classList.add('show');
                filtersSection.style.display = 'block';
                toggleBtn.classList.remove('collapsed');
                
                // Calculate filter height for button positioning
                const filterHeight = filtersSection.offsetHeight;
                document.documentElement.style.setProperty('--filter-height', filterHeight + 'px');
            } else {
                filtersSection.classList.remove('show');
                filtersSection.style.display = 'none';
                toggleBtn.classList.add('collapsed');
            }
            
            // Restore search value
            const searchInput = document.getElementById('searchFilterInput');
            if (searchInput) {
                searchInput.value = filterState.searchValue || '';
            }
            
            // Restore button texts to default Hebrew labels
            document.querySelector('.filter-group:nth-child(1) .filter-toggle span').textContent = 'סטטוס';
            document.querySelector('.filter-group:nth-child(2) .filter-toggle span').textContent = 'סוג השקעה';
            document.querySelector('.filter-group:nth-child(3) .filter-toggle span').textContent = 'חשבון';
            document.querySelector('.filter-group:nth-child(4) .filter-toggle span').textContent = 'תאריך';
            
            console.log('✅ Filter state restored successfully');
        }
    } catch (error) {
        console.error('❌ Error restoring filter state:', error);
    }
}

// ===== Initialization =====

// Initialize header component
function initializeHeaderComponent() {
    console.log('🔧 Initializing header component...');
    
    // Load accounts for filter
    loadAccountsForFilter();
    
    // Register test table with filter system
    if (window.filterSystem) {
        window.filterSystem.registerTable('test-table', {
            fields: ['status', 'type', 'account_id', 'date'],
            data: [] // Will be populated by the page
        });
        console.log('✅ Test table registered with filter system');
    }
    
    // Restore filter state
    restoreFilterState();
    
    // Add search input event listener
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (window.updateFilter) {
                window.updateFilter('search', this.value);
            }
            saveFilterState();
        });
    }
    
    // Add mouse leave event listeners for multi-select filters
    const multiSelectFilters = ['statusFilterMenu', 'typeFilterMenu', 'accountFilterMenu'];
    multiSelectFilters.forEach(menuId => {
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.addEventListener('mouseleave', function() {
                this.classList.remove('show');
            });
        }
    });
    
    console.log('✅ Header component initialized successfully');
}

// ===== Global Exports =====

// Export functions globally for backward compatibility
window.toggleSection = toggleFilterSection;
window.toggleFilterSection = toggleFilterSection;
window.toggleStatusFilter = toggleStatusFilter;
window.toggleTypeFilter = toggleTypeFilter;
window.toggleAccountFilter = toggleAccountFilter;
window.toggleDateRangeFilter = toggleDateRangeFilter;
window.selectStatusOption = selectStatusOption;
window.selectTypeOption = selectTypeOption;
window.selectAccountOption = selectAccountOption;
window.selectDateRangeOption = selectDateRangeOption;
window.clearSearch = clearSearch;
window.resetFiltersManually = resetFiltersManually;
window.clearAllFilters = clearAllFilters;
window.loadAccountsForFilter = loadAccountsForFilter;
window.updateAccountFilterOptions = updateAccountFilterOptions;
window.useAccountFilterFallback = useAccountFilterFallback;
window.getAccountIdByName = getAccountIdByName;
window.saveFilterState = saveFilterState;
window.restoreFilterState = restoreFilterState;
window.initializeHeaderComponent = initializeHeaderComponent;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeHeaderComponent();
});
