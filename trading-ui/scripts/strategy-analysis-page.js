/**
 * Strategy Analysis Page - Strategy analysis and performance
 * 
 * This file handles the strategy analysis page functionality for the mockup.
 * Based on comparative-analysis-page.js with adaptations for strategies.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */

(function() {
    'use strict';

// Helper function to get CSS variable value
function getCSSVariableValue(variableName, fallback) {
    try {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
        return value && value.trim() ? value.trim() : fallback;
    } catch (error) {
        return fallback;
    }
}

// Get entity color dynamically from system
function getEntityColor(entityType) {
    // Try to use color-scheme-system if available
    if (window.getEntityColor && typeof window.getEntityColor === 'function') {
        const color = window.getEntityColor(entityType);
        if (color) return color;
    }
    
    // Try CSS variable
    const cssVar = getCSSVariableValue(`--entity-${entityType.replace('_', '-')}-color`, '');
    if (cssVar) return cssVar;
    
    // Fallback to default entity colors from color-scheme-system
    const defaultColors = {
        'trade': '#26baac',
        'trade_plan': '#28a745',
        'execution': '#17a2b8',
        'account': '#6f42c1',
        'trading_account': '#28a745',
        'cash_flow': '#fd7e14',
        'ticker': '#20c997',
        'alert': '#dc3545',
        'note': '#6c757d',
        'constraint': '#e83e8c',
        'design': '#6f42c1',
        'research': '#17a2b8',
        'preference': '#adb5bd',
        'development': '#fc5a06',
        'position': '#0d6efd',
        'strategy': '#6f42c1'
    };
    
    return defaultColors[entityType] || getCSSVariableValue('--primary-color', '#26baac');
}

// Initialize series checkboxes UI
function initializeSeriesControls() {
    const container = document.getElementById('series-checkboxes-container');
    if (!container) return;
    
    container.innerHTML = AVAILABLE_SERIES.map(series => {
        const color = getEntityColor(series.entityType);
        const isChecked = seriesVisibility[series.key] !== false; // Default true
        return `
            <div class="series-checkbox-container">
                <input type="checkbox" 
                       id="series-${series.key}" 
                       class="form-check-input" 
                       ${isChecked ? 'checked' : ''}
                       onchange="toggleSeries('${series.key}', this.checked)">
                <label for="series-${series.key}" class="series-checkbox-label">
                    <div class="series-color-indicator" style="background-color: ${color};"></div>
                    <span class="form-label-small">${series.label}</span>
                </label>
            </div>
        `;
    }).join('');
}

// Toggle series visibility
function toggleSeries(seriesKey, visible) {
    seriesVisibility[seriesKey] = visible;
    saveSeriesVisibilityState();
    updateStrategyPerformanceChart(getFilterValues());
}

// Save series visibility state using PreferencesCore
async function saveSeriesVisibilityState() {
    try {
        if (window.PreferencesCore && typeof window.PreferencesCore.savePreference === 'function') {
            await window.PreferencesCore.savePreference(PREF_SERIES_VISIBILITY, seriesVisibility);
        } else {
            // Fallback to localStorage
            localStorage.setItem(PREF_SERIES_VISIBILITY, JSON.stringify(seriesVisibility));
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Failed to save series visibility state', { page: 'strategy-analysis-page', error });
        }
    }
}

// Load series visibility state using PreferencesCore
async function loadSeriesVisibilityState() {
    try {
        let savedState = null;
        if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
            savedState = await window.PreferencesCore.getPreference(PREF_SERIES_VISIBILITY);
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem(PREF_SERIES_VISIBILITY);
            if (saved) {
                savedState = JSON.parse(saved);
            }
        }
        
        if (savedState) {
            Object.keys(savedState).forEach(key => {
                if (seriesVisibility.hasOwnProperty(key)) {
                    seriesVisibility[key] = savedState[key];
                }
            });
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Failed to load series visibility state', { page: 'strategy-analysis-page', error });
        }
    }
}

// Chart variables
let strategyPerformanceChart = null;
let chartSeries = {}; // Object to store all series by column key

// Available columns/series configuration - adapted for strategies
const AVAILABLE_SERIES = [
    { key: 'trades', label: 'טריידים', entityType: 'trade', priceScaleId: 'left', format: 'number' },
    { key: 'avgPL', label: 'P/L ממוצע', entityType: 'execution', priceScaleId: 'right', format: 'currency' },
    { key: 'totalPL', label: 'P/L כולל', entityType: 'trade', priceScaleId: 'right', format: 'currency' },
    { key: 'successRate', label: 'אחוז הצלחה', entityType: 'trade_plan', priceScaleId: 'left', format: 'percentage' },
    { key: 'maxInvestmentAtPoint', label: 'מקס בנקודה', entityType: 'position', priceScaleId: 'right', format: 'currency' },
    { key: 'totalPurchases', label: 'סה"כ קניות', entityType: 'cash_flow', priceScaleId: 'right', format: 'currency' }
];

// Series visibility state (default: all visible)
let seriesVisibility = {};
AVAILABLE_SERIES.forEach(series => {
    seriesVisibility[series.key] = true;
});

// Filter state - separated into record filters and comparison parameters
// Using PreferencesCore preference names
const PREF_SERIES_VISIBILITY = 'strategy-analysis-series-visibility';
const PREF_FILTERS = 'strategy-analysis-filters';
const PREF_RECORD_FILTERS = 'strategy-analysis-record-filters';
const PREF_COMPARISON_PARAMS = 'strategy-analysis-comparison-params';

// Wait for TradingView adapter
async function waitForTradingViewAdapter() {
    let retries = 0;
    const maxRetries = 100; // 5 seconds max
    
    while ((typeof window.TradingViewChartAdapter === 'undefined' || 
           (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined')) && 
           retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
    }
    
    if (typeof window.TradingViewChartAdapter === 'undefined') {
        if (window.Logger) {
            window.Logger.error('❌ TradingViewChartAdapter not available', { page: 'strategy-analysis-page', timeout: maxRetries * 50 });
        }
        throw new Error('TradingViewChartAdapter not loaded');
    }
    
    if (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined') {
        if (window.Logger) {
            window.Logger.error('❌ LightweightCharts not available', { page: 'strategy-analysis-page', timeout: maxRetries * 50 });
        }
        throw new Error('LightweightCharts not loaded');
    }
    
    if (window.Logger) {
        window.Logger.info('✅ TradingView libraries loaded', { page: 'strategy-analysis-page' });
    }
}

// Initialize Header System
async function initializeHeader() {
    // Wait for HeaderSystem to be available
    if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
        try {
            await window.HeaderSystem.initialize();
            if (window.Logger) {
                window.Logger.info('✅ Header System initialized', { page: 'strategy-analysis-page' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing Header System', { 
                    page: 'strategy-analysis-page', 
                    error 
                });
            }
        }
    } else {
        // Retry after a short delay if HeaderSystem not loaded yet
        setTimeout(() => {
            if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                window.HeaderSystem.initialize().catch((error) => {
                    if (window.Logger) {
                        window.Logger.error('Error initializing Header System (retry)', { 
                            page: 'strategy-analysis-page', 
                            error 
                        });
                    }
                });
            } else {
                if (window.Logger) {
                    window.Logger.warn('HeaderSystem not available after retry', { page: 'strategy-analysis-page' });
                }
            }
        }, 500);
    }
}

// Get current record filter values (for filtering which strategies to include)
function getRecordFilterValues() {
    const tradingAccounts = Array.from(document.getElementById('recordFilterTradingAccounts')?.selectedOptions || [])
        .map(opt => opt.value);
    
    // Get selected tags
    let selectedTags = [];
    if (window.TagUIManager && typeof window.TagUIManager.getSelectedValues === 'function') {
        const tagsSelect = document.getElementById('recordFilterTags');
        if (tagsSelect) {
            selectedTags = window.TagUIManager.getSelectedValues(tagsSelect);
        }
    } else {
        // Fallback: get from select directly
        const tagsSelect = document.getElementById('recordFilterTags');
        if (tagsSelect) {
            selectedTags = Array.from(tagsSelect.selectedOptions || [])
                .map(opt => parseInt(opt.value))
                .filter(v => !isNaN(v));
        }
    }
    
    // Get status filter (active/inactive for strategies)
    const selectedStatusItem = document.querySelector('#statusFilterMenu .status-filter-item.selected');
    const selectedStatus = selectedStatusItem ? selectedStatusItem.getAttribute('data-value') : 'הכול';
    const statuses = selectedStatus === 'הכול' ? ['active', 'inactive'] : [selectedStatus];
    
    // Get date range
    const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    const dateRange = selectedItem ? selectedItem.getAttribute('data-value') : 'השנה';
    const { start, end } = getDateRange();
    
    return {
        tradingAccounts,
        tags: selectedTags,
        status: statuses,
        dateRange,
        dateRangeStart: start ? start.toISOString().split('T')[0] : '',
        dateRangeEnd: end ? end.toISOString().split('T')[0] : ''
    };
}

// Get current comparison parameter values (for selecting what to compare by)
function getComparisonParameterValues() {
    const tradingMethods = {
        enabled: document.getElementById('compareByTradingMethods')?.checked || false,
        values: Array.from(document.getElementById('comparisonTradingMethods')?.selectedOptions || [])
            .map(opt => opt.value)
    };
    
    const ticker = {
        enabled: document.getElementById('compareByTicker')?.checked || false,
        values: Array.from(document.getElementById('comparisonTickers')?.selectedOptions || [])
            .map(opt => opt.value)
    };
    
    // Get selected tags for comparison
    let selectedTags = [];
    if (window.TagUIManager && typeof window.TagUIManager.getSelectedValues === 'function') {
        const tagsSelect = document.getElementById('comparisonTags');
        if (tagsSelect) {
            selectedTags = window.TagUIManager.getSelectedValues(tagsSelect);
        }
    } else {
        // Fallback: get from select directly
        const tagsSelect = document.getElementById('comparisonTags');
        if (tagsSelect) {
            selectedTags = Array.from(tagsSelect.selectedOptions || [])
                .map(opt => parseInt(opt.value))
                .filter(v => !isNaN(v));
        }
    }
    
    const tags = {
        enabled: document.getElementById('compareByTags')?.checked || false,
        values: selectedTags
    };
    
    return {
        tradingMethods,
        ticker,
        tags
    };
}

// Get combined filter values (for backward compatibility and mock data generation)
function getFilterValues() {
    const recordFilters = getRecordFilterValues();
    const comparisonParams = getComparisonParameterValues();
    
    return {
        recordFilters,
        comparisonParameters: comparisonParams
    };
}

// Get date range (returns start and end dates based on selected range)
function getDateRange() {
    // Check if custom dates are set (priority over preset)
    const fromDate = document.getElementById('customDateFrom')?.value;
    const toDate = document.getElementById('customDateTo')?.value;
    
    if (fromDate && toDate) {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end, range: 'מותאם אישית' };
    }
    
    // Use preset if no custom dates
    const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    if (!selectedItem) {
        // Default to current year
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return { start: yearStart, end: today, range: 'השנה' };
    }
    
    const range = selectedItem.getAttribute('data-value');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let start = null;
    let end = today;
    
    switch (range) {
        case 'כל זמן':
            return { start: null, end: null, range };
            
        case 'היום':
            start = new Date(today);
            break;
            
        case 'אתמול':
            start = new Date(today);
            start.setDate(today.getDate() - 1);
            end = new Date(start);
            break;
            
        case 'השבוע': {
            const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
            start = new Date(today);
            start.setDate(today.getDate() - dayOfWeek);
            break;
        }
        
        case 'שבוע':
            start = new Date(today);
            start.setDate(today.getDate() - 7);
            break;
            
        case 'שבוע קודם': {
            const dayOfWeek = today.getDay();
            const lastWeekEnd = new Date(today);
            lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1);
            end = new Date(lastWeekEnd);
            end.setHours(23, 59, 59, 999);
            start = new Date(lastWeekEnd);
            start.setDate(lastWeekEnd.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            break;
        }
        
        case 'החודש': {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        }
        
        case 'חודש':
            start = new Date(today);
            start.setDate(today.getDate() - 30);
            break;
            
        case 'חודש קודם': {
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            start = lastMonthStart;
            end = lastMonthEnd;
            end.setHours(23, 59, 59, 999);
            break;
        }
        
        case 'השנה': {
            start = new Date(today.getFullYear(), 0, 1);
            break;
        }
        
        case 'שנה':
            start = new Date(today);
            start.setDate(today.getDate() - 365);
            break;
            
        case 'שנה קודמת': {
            const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
            const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
            start = lastYearStart;
            end = lastYearEnd;
            end.setHours(23, 59, 59, 999);
            break;
        }
    }
    
    if (start) {
        start.setHours(0, 0, 0, 0);
    }
    if (end) {
        end.setHours(23, 59, 59, 999);
    }
    
    return { start, end, range };
}

// Toggle date range filter menu
function toggleDateRangeFilterMenu() {
    const menu = document.getElementById('dateRangeFilterMenu');
    if (menu) {
        const isCurrentlyOpen = menu.classList.contains('show');
        if (isCurrentlyOpen) {
            menu.classList.remove('show');
        } else {
            menu.classList.add('show');
        }
    }
}

// Select date range option
function selectDateRangeOption(dateRange) {
    const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
    dateRangeItems.forEach(item => item.classList.remove('selected'));
    
    const clickedItem = Array.from(dateRangeItems).find(
        item => item.getAttribute('data-value') === dateRange
    );
    if (clickedItem) {
        clickedItem.classList.add('selected');
    }
    
    // Clear custom date inputs when preset is selected
    const fromInput = document.getElementById('customDateFrom');
    const toInput = document.getElementById('customDateTo');
    if (fromInput) {
        fromInput.value = '';
    }
    if (toInput) {
        toInput.value = '';
    }
    
    updateDateRangeFilterText();
    
    // Close menu
    const dateMenu = document.getElementById('dateRangeFilterMenu');
    if (dateMenu) {
        dateMenu.classList.remove('show');
    }
    
    // Apply filters
    applyRecordFilters();
}

// Handle custom date from change
function handleCustomDateFromChange() {
    // Clear preset selection when custom date is changed
    const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
    dateRangeItems.forEach(item => item.classList.remove('selected'));
    
    const fromDate = document.getElementById('customDateFrom')?.value;
    const toDate = document.getElementById('customDateTo')?.value;
    
    // Update filter text
    updateDateRangeFilterText();
    
    // Only apply if both dates are set
    if (fromDate && toDate) {
        applyRecordFilters();
    }
}

// Handle custom date to change
function handleCustomDateToChange() {
    // Clear preset selection when custom date is changed
    const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
    dateRangeItems.forEach(item => item.classList.remove('selected'));
    
    const fromDate = document.getElementById('customDateFrom')?.value;
    const toDate = document.getElementById('customDateTo')?.value;
    
    // Update filter text
    updateDateRangeFilterText();
    
    // Only apply if both dates are set
    if (fromDate && toDate) {
        applyRecordFilters();
    }
}

// Update date range filter text
function updateDateRangeFilterText() {
    const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    const dateElement = document.getElementById('selectedDateRange');
    const fromDate = document.getElementById('customDateFrom')?.value;
    const toDate = document.getElementById('customDateTo')?.value;
    
    if (dateElement) {
        // If custom dates are set, show them
        if (fromDate && toDate) {
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
            };
            dateElement.textContent = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
        } else if (selectedItem) {
            // Show preset selection
            const optionText = selectedItem.querySelector('.option-text');
            const displayText = optionText ? optionText.textContent.trim() : selectedItem.getAttribute('data-value');
            dateElement.textContent = displayText;
        } else {
            dateElement.textContent = 'השנה'; // Default
        }
    }
}

// ===== Status Filter Functions =====
function toggleStatusFilterMenu() {
    const menu = document.getElementById('statusFilterMenu');
    if (menu) {
        const isCurrentlyOpen = menu.classList.contains('show');
        if (isCurrentlyOpen) {
            menu.classList.remove('show');
        } else {
            menu.classList.add('show');
        }
    }
}

function selectStatusOption(status) {
    const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
    statusItems.forEach(item => item.classList.remove('selected'));
    
    const clickedItem = Array.from(statusItems).find(
        item => item.getAttribute('data-value') === status
    );
    if (clickedItem) {
        clickedItem.classList.add('selected');
    }
    
    updateStatusFilterText();
    
    // Close menu
    const statusMenu = document.getElementById('statusFilterMenu');
    if (statusMenu) {
        statusMenu.classList.remove('show');
    }
    
    // Apply filters
    applyRecordFilters();
}

function updateStatusFilterText() {
    const selectedItem = document.querySelector('#statusFilterMenu .status-filter-item.selected');
    const statusElement = document.getElementById('selectedStatus');
    
    if (statusElement) {
        if (selectedItem) {
            const optionText = selectedItem.querySelector('.option-text');
            const displayText = optionText ? optionText.textContent.trim() : selectedItem.getAttribute('data-value');
            statusElement.textContent = displayText;
        } else {
            statusElement.textContent = 'כל הסטטוסים';
        }
    }
}

// ===== Record Filter Functions =====
function applyRecordFilters() {
    saveRecordFilterState();
    updateAllVisualizations();
}

function resetRecordFilters() {
    // Clear date range preset
    const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
    dateRangeItems.forEach(item => item.classList.remove('selected'));
    
    // Clear custom date inputs
    const fromInput = document.getElementById('customDateFrom');
    const toInput = document.getElementById('customDateTo');
    if (fromInput) fromInput.value = '';
    if (toInput) toInput.value = '';
    updateDateRangeFilterText();
    
    // Clear trading accounts
    const tradingAccounts = document.getElementById('recordFilterTradingAccounts');
    if (tradingAccounts) {
        Array.from(tradingAccounts.options).forEach(opt => opt.selected = false);
    }
    
    // Clear tags
    const tagsSelect = document.getElementById('recordFilterTags');
    if (tagsSelect) {
        if (window.TagUIManager && typeof window.TagUIManager.setSelectedValues === 'function') {
            window.TagUIManager.setSelectedValues(tagsSelect, []);
        } else {
            Array.from(tagsSelect.options).forEach(opt => opt.selected = false);
        }
    }
    
    // Reset status filter to "הכול"
    const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
    statusItems.forEach(item => item.classList.remove('selected'));
    const allStatusItem = document.querySelector('#statusFilterMenu .status-filter-item[data-value="הכול"]');
    if (allStatusItem) allStatusItem.classList.add('selected');
    updateStatusFilterText();
    
    saveRecordFilterState();
    updateAllVisualizations();
}

function resetRecordFiltersToDefaults() {
    // Set date range to "השנה" (current year)
    const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
    dateRangeItems.forEach(item => item.classList.remove('selected'));
    const yearItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item[data-value="השנה"]');
    if (yearItem) {
        yearItem.classList.add('selected');
    }
    
    // Clear custom date inputs
    const fromInput = document.getElementById('customDateFrom');
    const toInput = document.getElementById('customDateTo');
    if (fromInput) fromInput.value = '';
    if (toInput) toInput.value = '';
    updateDateRangeFilterText();
    
    // Set default trading account to first account only
    const tradingAccounts = document.getElementById('recordFilterTradingAccounts');
    if (tradingAccounts && tradingAccounts.options.length > 0) {
        Array.from(tradingAccounts.options).forEach((opt, index) => {
            opt.selected = index === 0; // First account only
        });
    }
    
    // Set status filter to "הכול"
    const allStatusItem = document.querySelector('#statusFilterMenu .status-filter-item[data-value="הכול"]');
    if (allStatusItem) allStatusItem.classList.add('selected');
    updateStatusFilterText();
    
    saveRecordFilterState();
    updateAllVisualizations();
}

// ===== Comparison Parameter Functions =====
function toggleComparisonParameter(paramType) {
    let checkbox, select, btnSelectAll, btnClearAll;
    
    switch (paramType) {
        case 'tradingMethods':
            checkbox = document.getElementById('compareByTradingMethods');
            select = document.getElementById('comparisonTradingMethods');
            btnSelectAll = document.getElementById('btn-select-all-trading-methods');
            btnClearAll = document.getElementById('btn-clear-all-trading-methods');
            break;
        case 'ticker':
            checkbox = document.getElementById('compareByTicker');
            select = document.getElementById('comparisonTickers');
            btnSelectAll = document.getElementById('btn-select-all-tickers');
            btnClearAll = document.getElementById('btn-clear-all-tickers');
            break;
        case 'tags':
            checkbox = document.getElementById('compareByTags');
            select = document.getElementById('comparisonTags');
            btnSelectAll = document.getElementById('btn-select-all-comparison-tags');
            btnClearAll = document.getElementById('btn-clear-all-comparison-tags');
            break;
    }
    
    if (checkbox && select) {
        const isEnabled = checkbox.checked;
        select.disabled = !isEnabled;
        if (btnSelectAll) btnSelectAll.disabled = !isEnabled;
        if (btnClearAll) btnClearAll.disabled = !isEnabled;
        
        // If disabled, clear selection
        if (!isEnabled) {
            if (select.multiple) {
                Array.from(select.options).forEach(opt => opt.selected = false);
            } else {
                select.value = '';
            }
        }
        
        saveComparisonParameterState();
        applyComparisonParameters();
    }
}

function applyComparisonParameters() {
    saveComparisonParameterState();
    updateAllVisualizations();
}

function resetComparisonParameters() {
    // Clear all comparison parameter checkboxes
    document.getElementById('compareByTradingMethods').checked = false;
    document.getElementById('compareByTicker').checked = false;
    document.getElementById('compareByTags').checked = false;
    
    // Disable all selects
    document.getElementById('comparisonTradingMethods').disabled = true;
    document.getElementById('comparisonTickers').disabled = true;
    document.getElementById('comparisonTags').disabled = true;
    
    // Clear all selections
    Array.from(document.getElementById('comparisonTradingMethods').options).forEach(opt => opt.selected = false);
    Array.from(document.getElementById('comparisonTickers').options).forEach(opt => opt.selected = false);
    const tagsSelect = document.getElementById('comparisonTags');
    if (tagsSelect) {
        if (window.TagUIManager && typeof window.TagUIManager.setSelectedValues === 'function') {
            window.TagUIManager.setSelectedValues(tagsSelect, []);
        } else {
            Array.from(tagsSelect.options).forEach(opt => opt.selected = false);
        }
    }
    
    // Disable all buttons
    document.getElementById('btn-select-all-trading-methods').disabled = true;
    document.getElementById('btn-clear-all-trading-methods').disabled = true;
    document.getElementById('btn-select-all-tickers').disabled = true;
    document.getElementById('btn-clear-all-tickers').disabled = true;
    document.getElementById('btn-select-all-comparison-tags').disabled = true;
    document.getElementById('btn-clear-all-comparison-tags').disabled = true;
    
    saveComparisonParameterState();
    updateAllVisualizations();
}

function resetComparisonParametersToDefaults() {
    // Default: Compare by trading methods (first method selected)
    const compareByTradingMethods = document.getElementById('compareByTradingMethods');
    const comparisonTradingMethods = document.getElementById('comparisonTradingMethods');
    const btnSelectAllTrading = document.getElementById('btn-select-all-trading-methods');
    const btnClearAllTrading = document.getElementById('btn-clear-all-trading-methods');
    
    if (compareByTradingMethods && comparisonTradingMethods && comparisonTradingMethods.options.length > 0) {
        // Enable the checkbox
        compareByTradingMethods.checked = true;
        
        // Enable the select and buttons
        comparisonTradingMethods.disabled = false;
        if (btnSelectAllTrading) btnSelectAllTrading.disabled = false;
        if (btnClearAllTrading) btnClearAllTrading.disabled = false;
        
        // Select first trading method only
        Array.from(comparisonTradingMethods.options).forEach((opt, index) => {
            opt.selected = index === 0; // First method only
        });
        
        // Save the default state
        saveComparisonParameterState();
        
        if (window.Logger) {
            window.Logger.info('✅ Default comparison parameters set (Trading Methods - first)', { 
                page: 'strategy-analysis-page',
                methodsCount: comparisonTradingMethods.options.length,
                selectedCount: Array.from(comparisonTradingMethods.selectedOptions).length
            });
        }
    }
    
    applyComparisonParameters();
}

// ===== Helper Functions for Select Options =====
function selectAllOptions(selectId) {
    const select = document.getElementById(selectId);
    if (select) {
        if (select.classList.contains('tag-multi-select') && window.TagUIManager && typeof window.TagUIManager.setSelectedValues === 'function') {
            const allTagIds = Array.from(select.options).map(opt => parseInt(opt.value)).filter(v => !isNaN(v));
            window.TagUIManager.setSelectedValues(select, allTagIds);
        } else {
            Array.from(select.options).forEach(opt => opt.selected = true);
        }
        // Trigger change event
        if (select.onchange) {
            select.onchange();
        } else {
            // Check if it's a record filter or comparison parameter
            if (selectId.includes('recordFilter')) {
                applyRecordFilters();
            } else if (selectId.includes('comparison')) {
                applyComparisonParameters();
            }
        }
    }
}

function clearAllOptions(selectId) {
    const select = document.getElementById(selectId);
    if (select) {
        if (select.classList.contains('tag-multi-select') && window.TagUIManager && typeof window.TagUIManager.setSelectedValues === 'function') {
            window.TagUIManager.setSelectedValues(select, []);
        } else {
            Array.from(select.options).forEach(opt => opt.selected = false);
        }
        // Trigger change event
        if (select.onchange) {
            select.onchange();
        } else {
            // Check if it's a record filter or comparison parameter
            if (selectId.includes('recordFilter')) {
                applyRecordFilters();
            } else if (selectId.includes('comparison')) {
                applyComparisonParameters();
            }
        }
    }
}

// ===== Mock Data Generation Functions =====

// Generate mock tags for categories (for display purposes)
function generateMockTagsForCategory(categoryName) {
    // Mock tags based on category name
    const mockTags = [
        { id: 1, name: 'מוצלח', category: { name: 'תוצאות', color_hex: '#28a745' } },
        { id: 2, name: 'סיכון נמוך', category: { name: 'סיכון', color_hex: '#007bff' } },
        { id: 3, name: 'רווחי', category: { name: 'תוצאות', color_hex: '#28a745' } },
        { id: 4, name: 'מהיר', category: { name: 'זמן', color_hex: '#ffc107' } },
        { id: 5, name: 'ארוך טווח', category: { name: 'זמן', color_hex: '#17a2b8' } }
    ];
    
    // Return 1-3 random tags
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...mockTags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Render tags as badges
function renderTagsBadges(tags) {
    if (!tags || tags.length === 0) {
        return '<span class="text-muted small">-</span>';
    }
    
    return tags.map(tag => {
        const color = tag.category?.color_hex || '#26baac';
        const displayName = tag.category?.name 
            ? `${tag.category.name} • ${tag.name}`
            : tag.name;
        return `<span class="badge rounded-pill bg-light text-dark border me-1 mb-1 compact-stat-label-small" style="border-color: ${color};">${displayName}</span>`;
    }).join('');
}

// Create comparison categories from enabled parameters (cross-product)
function createStrategyCategories(comparisonParams) {
    const enabledParams = [];
    
    if (window.Logger) {
        window.Logger.info('🔍 Creating strategy comparison categories', { 
            page: 'strategy-analysis-page',
            params: {
                tradingMethods: { enabled: comparisonParams.tradingMethods?.enabled, valuesCount: comparisonParams.tradingMethods?.values?.length || 0 },
                ticker: { enabled: comparisonParams.ticker?.enabled, valuesCount: comparisonParams.ticker?.values?.length || 0 },
                tags: { enabled: comparisonParams.tags?.enabled, valuesCount: comparisonParams.tags?.values?.length || 0 }
            }
        });
    }
    
    // Collect enabled parameters with their values
    if (comparisonParams.tradingMethods.enabled && comparisonParams.tradingMethods.values.length > 0) {
        // Get method names from select options
        const methodSelect = document.getElementById('comparisonTradingMethods');
        const methodNames = [];
        if (methodSelect) {
            comparisonParams.tradingMethods.values.forEach(id => {
                const option = methodSelect.querySelector(`option[value="${id}"]`);
                if (option) methodNames.push(option.textContent.trim());
            });
        }
        if (methodNames.length > 0) {
            enabledParams.push({
                name: 'שיטות מסחר',
                values: methodNames
            });
        }
    }
    
    if (comparisonParams.ticker.enabled && comparisonParams.ticker.values.length > 0) {
        // Get ticker symbols from select options
        const tickerSelect = document.getElementById('comparisonTickers');
        const tickerSymbols = [];
        if (tickerSelect) {
            comparisonParams.ticker.values.forEach(id => {
                const option = tickerSelect.querySelector(`option[value="${id}"]`);
                if (option) tickerSymbols.push(option.textContent.trim());
            });
        }
        if (tickerSymbols.length > 0) {
            enabledParams.push({
                name: 'טיקר',
                values: tickerSymbols
            });
        }
    }
    
    if (comparisonParams.tags.enabled && comparisonParams.tags.values.length > 0) {
        // Get tag names from select options
        const tagsSelect = document.getElementById('comparisonTags');
        const tagNames = [];
        if (tagsSelect) {
            comparisonParams.tags.values.forEach(id => {
                const option = tagsSelect.querySelector(`option[value="${id}"]`);
                if (option) tagNames.push(option.textContent.trim());
            });
        }
        if (tagNames.length > 0) {
            enabledParams.push({
                name: 'תגיות',
                values: tagNames
            });
        }
    }
    
    // If no parameters enabled, return empty array
    if (enabledParams.length === 0) {
        if (window.Logger) {
            window.Logger.warn('⚠️ No comparison parameters enabled - returning empty categories', { 
                page: 'strategy-analysis-page',
                comparisonParams: comparisonParams
            });
        }
        return { categories: [], paramHeaders: [] };
    }
    
    if (window.Logger) {
        window.Logger.info('✅ Creating categories from enabled parameters', { 
            page: 'strategy-analysis-page',
            enabledParamsCount: enabledParams.length,
            enabledParams: enabledParams.map(p => ({ name: p.name, valuesCount: p.values.length }))
        });
    }
    
    // Create cross-product of all parameter combinations
    function cartesianProduct(arrays) {
        return arrays.reduce((acc, arr) => {
            const result = [];
            acc.forEach(accItem => {
                arr.forEach(arrItem => {
                    result.push([...accItem, arrItem]);
                });
            });
            return result;
        }, [[]]);
    }
    
    const combinations = cartesianProduct(enabledParams.map(p => p.values));
    
    if (window.Logger) {
        window.Logger.info('📊 Generated category combinations', { 
            page: 'strategy-analysis-page',
            combinationsCount: combinations.length
        });
    }
    
    // Create category objects with parameter values separated
    const categories = combinations.map(combo => {
        const categoryName = combo.join(' • ');
        const paramValues = {};
        enabledParams.forEach((param, index) => {
            paramValues[param.name] = combo[index];
        });
        
        return {
            name: categoryName, // Keep for backward compatibility (charts, heatmap)
            paramValues: paramValues, // New: separated parameter values
            paramHeaders: enabledParams.map(p => p.name), // Parameter headers
            trades: Math.floor(Math.random() * 30) + 10,
            avgPL: 0, // Will be calculated (can be positive or negative)
            totalPL: 0, // Will be calculated
            successRate: Math.floor(Math.random() * 30) + 50,
            totalInvestment: 0, // Will be calculated (max investment at point in time + total purchases)
            maxInvestmentAtPoint: 0, // Maximum investment at any point in time
            totalPurchases: 0, // Total purchases amount
            tags: generateMockTagsForCategory(categoryName)
        };
    });
    
    return {
        categories: categories,
        paramHeaders: enabledParams.map(p => p.name)
    };
}

// Generate mock comparison table data
function generateMockStrategyComparisonTableData(filterState) {
    const recordFilters = filterState.recordFilters;
    const comparisonParams = filterState.comparisonParameters;
    
    // Create categories from comparison parameters
    const result = createStrategyCategories(comparisonParams);
    const categories = result.categories;
    const paramHeaders = result.paramHeaders;
    
    // If no comparison parameters enabled, show message
    if (categories.length === 0) {
        return {
            data: [{
                name: 'אין פרמטרים להשוואה נבחרים',
                paramValues: {},
                paramHeaders: [],
                trades: 0,
                avgPL: 0,
                totalPL: 0,
                successRate: 0,
                tags: []
            }],
            paramHeaders: []
        };
    }
    
    // Apply variations based on filters
    const seed = JSON.stringify(filterState).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    // Simple seeded random
    let seedValue = seed;
    function seededRandom() {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
    }
    
    // Add variations and calculate totalPL, totalInvestment
    // Include both positive and negative P/L values for realistic data
    categories.forEach((cat, index) => {
        const variation = (seededRandom() - 0.5) * 0.2; // ±10%
        cat.trades = Math.max(1, Math.round(cat.trades * (1 + variation)));
        
        // Generate P/L values: mix of positive and negative
        // About 40% will be negative (losses), 60% positive (profits)
        const isNegative = seededRandom() < 0.4;
        
        if (isNegative) {
            // Negative P/L (losses): -$50 to -$500 per trade
            cat.avgPL = -Math.round(seededRandom() * 450 + 50);
        } else {
            // Positive P/L (profits): $50 to $500 per trade
            cat.avgPL = Math.round(seededRandom() * 450 + 50);
        }
        
        cat.totalPL = cat.trades * cat.avgPL;
        
        // Success rate: lower for negative P/L categories
        if (isNegative) {
            cat.successRate = Math.max(20, Math.min(50, Math.round(35 + (seededRandom() - 0.5) * 15)));
        } else {
            cat.successRate = Math.max(50, Math.min(100, Math.round(65 + (seededRandom() - 0.5) * 20)));
        }
        
        // Calculate investment metrics
        // Total purchases: based on trades and average investment per trade
        const avgInvestmentPerTrade = Math.floor(seededRandom() * 5000) + 2000; // $2K-$7K per trade
        cat.totalPurchases = cat.trades * avgInvestmentPerTrade;
        
        // Max investment at point in time: typically 60-80% of total purchases (some trades closed)
        const maxInvestmentPercent = 0.6 + (seededRandom() * 0.2); // 60-80%
        cat.maxInvestmentAtPoint = Math.round(cat.totalPurchases * maxInvestmentPercent);
        
        // Total investment: max investment + remaining (total purchases - max investment)
        cat.totalInvestment = cat.maxInvestmentAtPoint + (cat.totalPurchases - cat.maxInvestmentAtPoint);
    });
    
    return {
        data: categories,
        paramHeaders: paramHeaders
    };
}

// Generate mock data for all series by column
function generateMockSeriesData(filters, seriesKey) {
    const tableResult = generateMockStrategyComparisonTableData(filters);
    const tableData = tableResult.data;
    const data = [];
    
    // Find series config
    const seriesConfig = AVAILABLE_SERIES.find(s => s.key === seriesKey);
    if (!seriesConfig) return { data: [], categories: [] };
    
    // Calculate time offset for grouped bars
    // Each category gets a time slot, and each series within a category gets an offset
    const seriesIndex = AVAILABLE_SERIES.findIndex(s => s.key === seriesKey);
    const visibleSeries = AVAILABLE_SERIES.filter(s => seriesVisibility[s.key] !== false);
    const visibleIndex = visibleSeries.findIndex(s => s.key === seriesKey);
    const totalVisible = visibleSeries.length;
    
    // Use a base date for the chart (e.g., 2024-01-01)
    // Each category will be spaced by days, and each series within a category by hours
    const baseDate = new Date('2024-01-01');
    
    // Use Unix timestamp (seconds since epoch) for better precision
    // Base timestamp: 2024-01-01 00:00:00 UTC
    const baseTimestamp = Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000);
    // Each category gets 1 day (86400 seconds) for data + 1 day for spacing = 2 days total
    // Each series within category gets 1 hour (3600 seconds)
    const secondsPerDay = 86400;
    const secondsPerHour = 3600;
    const daysPerCategory = 2; // 1 day for data + 1 day for spacing
    
    tableData.forEach((cat, catIndex) => {
        // Base time for category - each category gets 2 days (1 day data + 1 day spacing)
        // Data starts at the beginning of each 2-day block
        const categoryBaseTime = baseTimestamp + (catIndex * daysPerCategory * secondsPerDay);
        // Offset within category - each series gets 1 hour offset
        // This creates grouped bars: series 0 at hour 0, series 1 at hour 1, etc.
        const timeOffset = visibleIndex * secondsPerHour;
        const time = categoryBaseTime + timeOffset;
        
        let value = cat[seriesKey];
        if (value === undefined || value === null) {
            // Handle missing values
            value = 0;
        }
        
        data.push({
            time: time,
            value: value
        });
    });
    
    return {
        data,
        categories: tableData.map(cat => cat.name),
        seriesConfig: seriesConfig
    };
}

// Generate mock heatmap data
function generateMockHeatmapData(filters) {
    const tableResult = generateMockStrategyComparisonTableData(filters);
    const tableData = tableResult.data;
    
    // Separate positive and negative values for percentile calculation
    const allPLValues = tableData.map(cat => cat.totalPL);
    const allAvgPL = tableData.map(cat => cat.avgPL);
    const allSuccessRates = tableData.map(cat => cat.successRate);
    const allTrades = tableData.map(cat => cat.trades);
    const allMaxInvestment = tableData.map(cat => cat.maxInvestmentAtPoint || 0);
    const allTotalPurchases = tableData.map(cat => cat.totalPurchases || 0);
    
    // Separate positive and negative arrays
    const positivePLValues = allPLValues.filter(v => v >= 0);
    const negativePLValues = allPLValues.filter(v => v < 0);
    const positiveAvgPL = allAvgPL.filter(v => v >= 0);
    const negativeAvgPL = allAvgPL.filter(v => v < 0);
    
    const getPercentile = (value, arr) => {
        if (arr.length === 0) return 0.5;
        const sorted = [...arr].sort((a, b) => a - b);
        const index = sorted.findIndex(v => v >= value);
        return index === -1 ? 1 : index / sorted.length;
    };
    
    // Get percentile for P/L values - separate positive and negative
    const getPLPercentile = (value) => {
        if (value >= 0) {
            // Positive: higher is better, percentile 1 = best
            if (positivePLValues.length === 0) return 0.5;
            return getPercentile(value, positivePLValues);
        } else {
            // Negative: lower (more negative) is worse, percentile 1 = worst
            // Invert so that less negative = better percentile
            if (negativePLValues.length === 0) return 0.5;
            const sorted = [...negativePLValues].sort((a, b) => a - b); // Sort ascending (most negative first)
            const index = sorted.findIndex(v => v <= value); // Find first value <= current (more negative)
            const percentile = index === -1 ? 1 : index / sorted.length;
            return 1 - percentile; // Invert: less negative = higher percentile
        }
    };
    
    // Get percentile for Avg P/L values - separate positive and negative
    const getAvgPLPercentile = (value) => {
        if (value >= 0) {
            // Positive: higher is better
            if (positiveAvgPL.length === 0) return 0.5;
            return getPercentile(value, positiveAvgPL);
        } else {
            // Negative: lower (more negative) is worse
            if (negativeAvgPL.length === 0) return 0.5;
            const sorted = [...negativeAvgPL].sort((a, b) => a - b);
            const index = sorted.findIndex(v => v <= value);
            const percentile = index === -1 ? 1 : index / sorted.length;
            return 1 - percentile; // Invert: less negative = higher percentile
        }
    };
    
    return tableData.map(cat => ({
        category: cat.name,
        totalPL: cat.totalPL,
        successRate: cat.successRate,
        avgPL: cat.avgPL,
        trades: cat.trades,
        maxInvestmentAtPoint: cat.maxInvestmentAtPoint || 0,
        totalPurchases: cat.totalPurchases || 0,
        totalInvestment: cat.totalInvestment || 0,
        plPercentile: getPLPercentile(cat.totalPL),
        successPercentile: getPercentile(cat.successRate, allSuccessRates),
        avgPLPercentile: getAvgPLPercentile(cat.avgPL),
        tradesPercentile: getPercentile(cat.trades, allTrades),
        maxInvestmentPercentile: getPercentile(cat.maxInvestmentAtPoint || 0, allMaxInvestment),
        totalPurchasesPercentile: getPercentile(cat.totalPurchases || 0, allTotalPurchases)
    }));
}

// Format currency
function formatCurrency(value) {
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
}

// Format P/L with percentage (using existing system pattern)
function formatPLWithPercent(plValue, plPercent) {
    if (plValue === null || plValue === undefined) {
        return '<span class="text-muted">-</span>';
    }
    
    // Use FieldRendererService if available
    let plFormatted;
    if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
        plFormatted = window.FieldRendererService.renderAmount(plValue, '$', 2, true);
    } else {
        // Fallback formatting
        const sign = plValue >= 0 ? '+' : '';
        const absValue = Math.abs(plValue);
        if (absValue >= 1000) {
            plFormatted = `${sign}$${(absValue / 1000).toFixed(1)}K`;
        } else {
            plFormatted = `${sign}$${absValue.toFixed(0)}`;
        }
    }
    
    // Add percentage if available - using FieldRendererService
    if (plPercent !== null && plPercent !== undefined && !isNaN(plPercent)) {
        let percentHtml;
        if (window.FieldRendererService && typeof window.FieldRendererService.renderNumericValue === 'function') {
            percentHtml = window.FieldRendererService.renderNumericValue(plPercent, '%', true);
        } else {
            // Fallback
            const percentSign = plPercent >= 0 ? '+' : '';
            percentHtml = `<span class="text-muted">(${percentSign}${plPercent.toFixed(2)}%)</span>`;
        }
        return `${plFormatted} ${percentHtml}`;
    }
    
    return plFormatted;
}

// Format investment value with percentage (similar to formatPLWithPercent)
function formatInvestmentWithPercent(value, percent) {
    if (value === null || value === undefined) {
        return '<span class="text-muted">-</span>';
    }
    
    // Use FieldRendererService if available
    let valueFormatted;
    if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
        valueFormatted = window.FieldRendererService.renderAmount(value, '$', 0, false);
    } else {
        // Fallback formatting
        if (value >= 1000) {
            valueFormatted = `$${(value / 1000).toFixed(1)}K`;
        } else {
            valueFormatted = `$${value.toFixed(0)}`;
        }
    }
    
    // Add percentage if available - using FieldRendererService
    if (percent !== null && percent !== undefined && !isNaN(percent)) {
        let percentHtml;
        if (window.FieldRendererService && typeof window.FieldRendererService.renderNumericValue === 'function') {
            percentHtml = window.FieldRendererService.renderNumericValue(percent, '%', true);
        } else {
            // Fallback
            const percentFormatted = percent.toFixed(1);
            const percentClass = percent >= 0 ? 'text-success' : 'text-danger';
            percentHtml = `<span class="${percentClass} form-label-small percent-opacity">(${percent >= 0 ? '+' : ''}${percentFormatted}%)</span>`;
        }
        return `${valueFormatted} ${percentHtml}`;
    }
    
    return valueFormatted;
}

// Get color class based on percentile - more sensitive gradient
function getColorClass(percentile) {
    // More granular gradient: 7 levels instead of 3
    if (percentile >= 0.9) return 'heatmap-excellent';      // Top 10%
    if (percentile >= 0.75) return 'heatmap-very-good';     // Top 25%
    if (percentile >= 0.6) return 'heatmap-good';           // Top 40%
    if (percentile >= 0.4) return 'heatmap-average';        // Middle 20%
    if (percentile >= 0.25) return 'heatmap-below-avg';    // Bottom 25%
    if (percentile >= 0.1) return 'heatmap-poor';           // Bottom 10%
    return 'heatmap-very-poor';                              // Bottom 10%
}

// Get color style based on percentile and value sign for inline gradient
// IMPORTANT: Positive values cannot be below 0, negative values cannot be above 0
function getColorStyle(percentile, value) {
    // Separate handling for positive and negative values
    if (value >= 0) {
        // Positive values: only green gradient (0 to 1, where 1 = best positive)
        const opacity = 0.2 + (percentile * 0.5); // 0.2 to 0.7
        return `background-color: rgba(40, 167, 69, ${opacity.toFixed(2)});`;
    } else {
        // Negative values: only red gradient (0 to 1, where 1 = worst negative)
        // For negatives, higher percentile means worse (more negative), so invert
        const invertedPercentile = 1 - percentile;
        const opacity = 0.2 + (invertedPercentile * 0.5); // 0.2 to 0.7
        return `background-color: rgba(220, 53, 69, ${opacity.toFixed(2)});`;
    }
}

// Format filter info for display
function formatFilterInfo(recordFilters) {
    const parts = [];
    
    // Date range
    if (recordFilters.dateRangeStart && recordFilters.dateRangeEnd) {
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
        };
        parts.push(`תאריכים: ${formatDate(recordFilters.dateRangeStart)} - ${formatDate(recordFilters.dateRangeEnd)}`);
    } else if (recordFilters.dateRange) {
        parts.push(`תאריכים: ${recordFilters.dateRange}`);
    }
    
    // Trading accounts
    if (recordFilters.tradingAccounts && recordFilters.tradingAccounts.length > 0) {
        const accountSelect = document.getElementById('recordFilterTradingAccounts');
        const accountNames = recordFilters.tradingAccounts.map(id => {
            if (accountSelect) {
                const option = accountSelect.querySelector(`option[value="${id}"]`);
                return option ? option.textContent.trim() : `Account #${id}`;
            }
            return `Account #${id}`;
        });
        parts.push(`חשבונות מסחר: ${accountNames.join(', ')}`);
    }
    
    // Tags
    if (recordFilters.tags && recordFilters.tags.length > 0) {
        const tagsSelect = document.getElementById('recordFilterTags');
        const tagNames = recordFilters.tags.map(id => {
            if (tagsSelect) {
                const option = tagsSelect.querySelector(`option[value="${id}"]`);
                return option ? option.textContent.trim() : `Tag #${id}`;
            }
            return `Tag #${id}`;
        });
        parts.push(`תגיות: ${tagNames.join(', ')}`);
    }
    
    // Status
    if (recordFilters.status && recordFilters.status.length > 0) {
        const statusLabels = recordFilters.status.map(s => {
            if (s === 'active') return 'פעיל';
            if (s === 'inactive') return 'לא פעיל';
            return s;
        });
        if (statusLabels.length === 2) {
            parts.push(`סטטוס: כל הסטטוסים`);
        } else {
            parts.push(`סטטוס: ${statusLabels.join(', ')}`);
        }
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'אין פרמטרי סינון';
}

// Format comparison info for display
function formatComparisonInfo(comparisonParams) {
    const parts = [];
    
    // Trading Methods
    if (comparisonParams.tradingMethods.enabled && comparisonParams.tradingMethods.values.length > 0) {
        const methodSelect = document.getElementById('comparisonTradingMethods');
        const methodNames = comparisonParams.tradingMethods.values.map(id => {
            if (methodSelect) {
                const option = methodSelect.querySelector(`option[value="${id}"]`);
                return option ? option.textContent.trim() : `Method #${id}`;
            }
            return `Method #${id}`;
        });
        parts.push(`שיטות מסחר: ${methodNames.join(', ')}`);
    }
    
    // Ticker
    if (comparisonParams.ticker.enabled && comparisonParams.ticker.values.length > 0) {
        const tickerSelect = document.getElementById('comparisonTickers');
        const tickerSymbols = comparisonParams.ticker.values.map(id => {
            if (tickerSelect) {
                const option = tickerSelect.querySelector(`option[value="${id}"]`);
                return option ? option.textContent.trim() : `Ticker #${id}`;
            }
            return `Ticker #${id}`;
        });
        parts.push(`טיקר: ${tickerSymbols.join(', ')}`);
    }
    
    // Tags
    if (comparisonParams.tags.enabled && comparisonParams.tags.values.length > 0) {
        const tagsSelect = document.getElementById('comparisonTags');
        const tagNames = comparisonParams.tags.values.map(id => {
            if (tagsSelect) {
                const option = tagsSelect.querySelector(`option[value="${id}"]`);
                return option ? option.textContent.trim() : `Tag #${id}`;
            }
            return `Tag #${id}`;
        });
        parts.push(`תגיות: ${tagNames.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'אין פרמטרי השוואה';
}

// Update comparison table with animation
function updateStrategyComparisonTable(filters) {
    const result = generateMockStrategyComparisonTableData(filters);
    const data = result.data;
    const paramHeaders = result.paramHeaders;
    
    const tbody = document.getElementById('comparison-table-body');
    const thead = document.querySelector('#comparison-table-section table thead tr');
    const summary = document.getElementById('comparison-table-summary');
    const filterInfo = document.getElementById('comparison-table-filter-info');
    const comparisonInfo = document.getElementById('comparison-table-comparison-info');
    const summaryRow = document.querySelector('#comparison-table-summary')?.parentElement;
    const filterInfoRow = document.querySelector('#comparison-table-filter-info')?.parentElement;
    const comparisonInfoRow = document.querySelector('#comparison-table-comparison-info')?.parentElement;
    
    if (!tbody || !thead) return;
    
    // Update table headers dynamically
    const headerHTML = paramHeaders.map(header => `<th>${header}</th>`).join('') +
        '<th>טריידים</th>' +
        '<th>P/L ממוצע</th>' +
        '<th>P/L כולל</th>' +
        '<th>אחוז הצלחה</th>' +
        '<th class="text-end">מקס בנקודה</th>' +
        '<th class="text-end">סה"כ קניות</th>';
    
    thead.innerHTML = headerHTML;
    
    // Calculate colspan for summary and info rows
    const summaryColspan = paramHeaders.length + 6; // param columns + 6 data columns
    
    // Update summary colspan
    if (summaryRow) {
        const summaryCell = summaryRow.querySelector('td');
        if (summaryCell) {
            summaryCell.setAttribute('colspan', summaryColspan);
        }
    }
    
    // Update filter info colspan
    if (filterInfoRow) {
        const filterInfoCell = filterInfoRow.querySelector('td');
        if (filterInfoCell) {
            filterInfoCell.setAttribute('colspan', summaryColspan);
        }
    }
    
    // Update comparison info colspan
    if (comparisonInfoRow) {
        const comparisonInfoCell = comparisonInfoRow.querySelector('td');
        if (comparisonInfoCell) {
            comparisonInfoCell.setAttribute('colspan', summaryColspan);
        }
    }
    
    // Fade out
    tbody.style.opacity = '0';
    tbody.style.transition = 'opacity 0.3s';
    
    setTimeout(() => {
        // Calculate totals for percentage calculation
        const totalMaxInvestment = data.reduce((sum, cat) => sum + (cat.maxInvestmentAtPoint || 0), 0);
        const totalTotalPurchases = data.reduce((sum, cat) => sum + (cat.totalPurchases || 0), 0);
        
        // Calculate summary totals and averages
        const totalTrades = data.reduce((sum, cat) => sum + (cat.trades || 0), 0);
        const totalAvgPL = data.reduce((sum, cat) => sum + (cat.avgPL || 0), 0);
        const totalTotalPL = data.reduce((sum, cat) => sum + (cat.totalPL || 0), 0);
        const totalSuccessRate = data.reduce((sum, cat) => sum + (cat.successRate || 0), 0);
        
        const avgTrades = data.length > 0 ? totalTrades / data.length : 0;
        const avgAvgPL = data.length > 0 ? totalAvgPL / data.length : 0;
        const avgTotalPL = data.length > 0 ? totalTotalPL / data.length : 0;
        const avgSuccessRate = data.length > 0 ? totalSuccessRate / data.length : 0;
        const avgMaxInvestment = data.length > 0 ? totalMaxInvestment / data.length : 0;
        const avgTotalPurchases = data.length > 0 ? totalTotalPurchases / data.length : 0;
        
        // Calculate overall P/L percentage for summary
        const totalInvestment = data.reduce((sum, cat) => sum + (cat.totalInvestment || 0), 0);
        const summaryPLPercent = totalInvestment > 0 
            ? ((totalTotalPL / totalInvestment) * 100) 
            : null;
        
        // Build data rows
        const dataRows = data.map(cat => {
            // Build parameter value cells
            const paramCells = paramHeaders.map(header => {
                const value = cat.paramValues[header] || '';
                return `<td><strong>${value}</strong></td>`;
            }).join('');
            
            // Calculate P/L percentage (based on total investment)
            const plPercent = cat.totalInvestment > 0 
                ? ((cat.totalPL / cat.totalInvestment) * 100) 
                : null;
            
            // Calculate investment percentages (based on total across all categories)
            const maxInvestmentPercent = totalMaxInvestment > 0 
                ? ((cat.maxInvestmentAtPoint || 0) / totalMaxInvestment) * 100 
                : null;
            const totalPurchasesPercent = totalTotalPurchases > 0 
                ? ((cat.totalPurchases || 0) / totalTotalPurchases) * 100 
                : null;
            
            // Build data cells
            const dataCells = `
                <td>${cat.trades}</td>
                <td>${formatPLWithPercent(cat.avgPL, plPercent)}</td>
                <td>${formatPLWithPercent(cat.totalPL, plPercent)}</td>
                <td>${cat.successRate}%</td>
                <td class="text-end">${formatInvestmentWithPercent(cat.maxInvestmentAtPoint, maxInvestmentPercent)}</td>
                <td class="text-end">${formatInvestmentWithPercent(cat.totalPurchases, totalPurchasesPercent)}</td>
            `;
            
            return `<tr class="fade-in-row">${paramCells}${dataCells}</tr>`;
        }).join('');
        
        // Build summary row (last row, highlighted)
        const summaryParamCells = paramHeaders.map(() => '<td><strong>סה"כ<br>ממוצע</strong></td>').join('');
        
        // Calculate percentages for summary investment values
        const summaryMaxInvestmentPercent = totalMaxInvestment > 0 ? 100 : null;
        const summaryTotalPurchasesPercent = totalTotalPurchases > 0 ? 100 : null;
        
        const summaryRow = `
            <tr class="table-info fw-bold table-summary-row">
                ${summaryParamCells}
                <td><strong>${totalTrades}<br>${avgTrades.toFixed(1)}</strong></td>
                <td><strong>${formatPLWithPercent(totalAvgPL, summaryPLPercent)}<br>${formatPLWithPercent(avgAvgPL, summaryPLPercent)}</strong></td>
                <td><strong>${formatPLWithPercent(totalTotalPL, summaryPLPercent)}<br>${formatPLWithPercent(avgTotalPL, summaryPLPercent)}</strong></td>
                <td><strong>${avgSuccessRate.toFixed(1)}%</strong></td>
                <td class="text-end"><strong>${formatInvestmentWithPercent(totalMaxInvestment, summaryMaxInvestmentPercent)}<br>${formatInvestmentWithPercent(avgMaxInvestment, null)}</strong></td>
                <td class="text-end"><strong>${formatInvestmentWithPercent(totalTotalPurchases, summaryTotalPurchasesPercent)}<br>${formatInvestmentWithPercent(avgTotalPurchases, null)}</strong></td>
            </tr>
        `;
        
        tbody.innerHTML = dataRows + summaryRow;
        
        // Fade in
        tbody.style.opacity = '1';
    }, 150);
    
    // Update summary
    const totalCategories = data.length;
    const totalTrades = data.reduce((sum, cat) => sum + cat.trades, 0);
    const totalPL = data.reduce((sum, cat) => sum + cat.totalPL, 0);
    
    if (summary) {
        summary.style.transition = 'opacity 0.3s';
        summary.style.opacity = '0';
        setTimeout(() => {
            summary.innerHTML = `
                <strong>סיכום:</strong>
                סה"כ קטגוריות: ${totalCategories} |
                סה"כ טריידים: ${totalTrades} |
                P/L כולל: ${formatCurrency(totalPL)}
            `;
            summary.style.opacity = '1';
        }, 150);
    }
    
    // Update filter info
    if (filterInfo) {
        filterInfo.style.transition = 'opacity 0.3s';
        filterInfo.style.opacity = '0';
        setTimeout(() => {
            const filterText = formatFilterInfo(filters.recordFilters);
            filterInfo.innerHTML = `<strong>פרמטרי סינון:</strong> ${filterText}`;
            filterInfo.style.opacity = '1';
        }, 150);
    }
    
    // Update comparison info
    if (comparisonInfo) {
        comparisonInfo.style.transition = 'opacity 0.3s';
        comparisonInfo.style.opacity = '0';
        setTimeout(() => {
            const comparisonText = formatComparisonInfo(filters.comparisonParameters);
            comparisonInfo.innerHTML = `<strong>פרמטרי השוואה:</strong> ${comparisonText}`;
            comparisonInfo.style.opacity = '1';
        }, 150);
    }
}

// Update heatmap
function updateHeatmap(filters) {
    const data = generateMockHeatmapData(filters);
    const tbody = document.getElementById('heatmap-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = data.map((item, index) => {
        // Calculate percentages for investment values
        const totalMaxInvestment = data.reduce((sum, it) => sum + (it.maxInvestmentAtPoint || 0), 0);
        const totalTotalPurchases = data.reduce((sum, it) => sum + (it.totalPurchases || 0), 0);
        const maxInvestmentPercent = totalMaxInvestment > 0 
            ? ((item.maxInvestmentAtPoint || 0) / totalMaxInvestment) * 100 
            : null;
        const totalPurchasesPercent = totalTotalPurchases > 0 
            ? ((item.totalPurchases || 0) / totalTotalPurchases) * 100 
            : null;
        
        // Calculate P/L percentage
        const plPercent = item.totalInvestment > 0 
            ? ((item.totalPL / item.totalInvestment) * 100) 
            : null;
        
        return `
        <tr class="heatmap-row" data-category="${item.category}" data-index="${index}">
            <td><strong>${item.category}</strong></td>
            <td style="${getColorStyle(item.tradesPercentile, item.trades)}" data-value="${item.trades}">${item.trades}</td>
            <td style="${getColorStyle(item.avgPLPercentile, item.avgPL)}" data-value="${item.avgPL}">${formatPLWithPercent(item.avgPL, plPercent)}</td>
            <td style="${getColorStyle(item.plPercentile, item.totalPL)}" data-value="${item.totalPL}">${formatPLWithPercent(item.totalPL, plPercent)}</td>
            <td style="${getColorStyle(item.successPercentile, item.successRate)}" data-value="${item.successRate}">${item.successRate}%</td>
            <td class="text-end" style="${getColorStyle(item.maxInvestmentPercentile, item.maxInvestmentAtPoint || 0)}" data-value="${item.maxInvestmentAtPoint || 0}">${formatInvestmentWithPercent(item.maxInvestmentAtPoint || 0, maxInvestmentPercent)}</td>
            <td class="text-end" style="${getColorStyle(item.totalPurchasesPercentile, item.totalPurchases || 0)}" data-value="${item.totalPurchases || 0}">${formatInvestmentWithPercent(item.totalPurchases || 0, totalPurchasesPercent)}</td>
        </tr>
    `;
    }).join('');
    
    // Add hover effects
    tbody.querySelectorAll('.heatmap-row').forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
}

// Update visual heatmap
function updateVisualHeatmap(filters) {
    const data = generateMockHeatmapData(filters);
    const grid = document.getElementById('visual-heatmap-grid');
    const title = document.getElementById('visual-heatmap-title');
    const sortBySelect = document.getElementById('visualHeatmapSortBy');
    
    if (!grid) return;
    
    // Get current sort by value
    const currentSortBy = sortBySelect ? sortBySelect.value : 'totalPL';
    
    // Sort data
    const sortedData = [...data].sort((a, b) => {
        const aValue = a[currentSortBy] || 0;
        const bValue = b[currentSortBy] || 0;
        return bValue - aValue; // Descending order
    });
    
    // Calculate percentiles for current sort key
    const allValues = sortedData.map(d => d[currentSortBy] || 0);
    const positiveValues = allValues.filter(v => v >= 0);
    const negativeValues = allValues.filter(v => v < 0);
    
    const getPercentile = (value, arr) => {
        if (arr.length === 0) return 0.5;
        const sorted = [...arr].sort((a, b) => a - b);
        const index = sorted.findIndex(v => v >= value);
        return index === -1 ? 1 : index / sorted.length;
    };
    
    const getValuePercentile = (value) => {
        if (value >= 0) {
            if (positiveValues.length === 0) return 0.5;
            return getPercentile(value, positiveValues);
        } else {
            if (negativeValues.length === 0) return 0.5;
            const sorted = [...negativeValues].sort((a, b) => a - b);
            const index = sorted.findIndex(v => v <= value);
            const percentile = index === -1 ? 1 : index / sorted.length;
            return 1 - percentile; // Invert for negative values
        }
    };
    
    // Update title
    const sortLabels = {
        'totalPL': 'P/L כולל',
        'successRate': 'אחוז הצלחה',
        'trades': 'מספר טריידים',
        'avgPL': 'P/L ממוצע'
    };
    if (title) {
        title.textContent = `מפת חום - ${sortLabels[currentSortBy] || 'P/L כולל'} לפי קטגוריה`;
    }
    
    // Clear grid
    grid.innerHTML = '';
    
    // Create cells
    sortedData.forEach((item, index) => {
        const value = item[currentSortBy] || 0;
        const percentile = getValuePercentile(value);
        // Get color class based on value sign and percentile
        let colorClass;
        if (value >= 0) {
            // Positive values: use green gradient classes
            colorClass = getColorClass(percentile);
        } else {
            // Negative values: use red gradient classes (invert percentile)
            const invertedPercentile = 1 - percentile;
            if (invertedPercentile >= 0.9) colorClass = 'heatmap-negative-excellent';
            else if (invertedPercentile >= 0.75) colorClass = 'heatmap-negative-very-poor';
            else if (invertedPercentile >= 0.6) colorClass = 'heatmap-negative-poor';
            else if (invertedPercentile >= 0.4) colorClass = 'heatmap-negative-average';
            else if (invertedPercentile >= 0.25) colorClass = 'heatmap-negative-below-avg';
            else if (invertedPercentile >= 0.1) colorClass = 'heatmap-negative-good';
            else colorClass = 'heatmap-negative-very-good';
        }
        
        const cell = document.createElement('div');
        cell.className = `heatmap-cell ${colorClass}`;
        cell.dataset.category = item.category;
        cell.dataset.index = index;
        
        // Determine value type
        let valueType = 'number';
        let formattedValue = value;
        if (currentSortBy.includes('PL')) {
            valueType = 'currency';
            formattedValue = formatCurrency(value);
        } else if (currentSortBy.includes('Rate')) {
            valueType = 'percentage';
            formattedValue = `${value}%`;
        } else {
            formattedValue = value.toString();
        }
        
        cell.innerHTML = `
            <div class="heatmap-cell-label">${item.category}</div>
            <div class="heatmap-cell-value">${formattedValue}</div>
            ${currentSortBy === 'totalPL' ? `<div class="heatmap-cell-percent">${item.successRate}% הצלחה</div>` : ''}
        `;
        
        grid.appendChild(cell);
    });
    
    // Add event listener for sort by change
    if (sortBySelect && !sortBySelect.dataset.listenerAdded) {
        sortBySelect.addEventListener('change', () => {
            updateVisualHeatmap(filters);
        });
        sortBySelect.dataset.listenerAdded = 'true';
    }
}

// Initialize Strategy Performance Chart
async function initStrategyPerformanceChart() {
    try {
        await waitForTradingViewAdapter();
        
        const container = document.getElementById('strategy-performance-chart-container');
        if (!container) {
            if (window.Logger) {
                window.Logger.error('Strategy performance chart container not found', { page: 'strategy-analysis-page' });
            }
            return;
        }
        
        // Get wrapper for width calculation (if exists)
        const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
        const containerWidth = wrapper ? wrapper.clientWidth : container.clientWidth;
        
        // Remove loading indicator
        const loading = container.querySelector('.chart-loading');
        if (loading) loading.remove();
        
        // Destroy existing chart if any
        if (strategyPerformanceChart) {
            try {
                if (window.TradingViewChartAdapter && typeof window.TradingViewChartAdapter.destroyChart === 'function') {
                    window.TradingViewChartAdapter.destroyChart(strategyPerformanceChart);
                } else {
                    strategyPerformanceChart.remove();
                }
            } catch (e) {
                if (window.Logger) {
                    window.Logger.warn('Error removing existing strategy performance chart', { page: 'strategy-analysis-page', error: e });
                }
            }
        }
        
        const filters = getFilterValues();
        
        // Create chart with dual price scales
        strategyPerformanceChart = window.TradingViewChartAdapter.createChart(container, {
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: getCSSVariableValue('--text-color', '#333')
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: true, color: getCSSVariableValue('--border-color', '#e0e0e0') }
            },
            width: containerWidth,
            height: 300,
            timeScale: {
                visible: true,
                timeVisible: true,
                secondsVisible: false
            },
            rightPriceScale: {
                borderVisible: true,
                borderColor: getCSSVariableValue('--border-color', '#e0e0e0'),
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                }
            },
            leftPriceScale: {
                visible: true,
                borderVisible: true,
                borderColor: getCSSVariableValue('--border-color', '#e0e0e0'),
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                }
            }
        });
        
        // Clear existing series - remove all series we've stored
        Object.values(chartSeries).forEach(series => {
            if (series) {
                try {
                    strategyPerformanceChart.removeSeries(series);
                } catch (e) {
                    if (window.Logger) {
                        window.Logger.warn('Error removing series', { page: 'strategy-analysis-page', error: e });
                    }
                }
            }
        });
        chartSeries = {};
        
        // Add series for each visible column
        const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
        const visibleSeries = AVAILABLE_SERIES.filter(s => seriesVisibility[s.key] !== false);
        let categories = [];
        
        if (lightweightCharts && lightweightCharts.HistogramSeries) {
            visibleSeries.forEach(seriesConfig => {
                const seriesData = generateMockSeriesData(filters, seriesConfig.key);
                if (seriesData.data.length > 0) {
                    if (categories.length === 0) {
                        categories = seriesData.categories;
                    }
                    
                    const color = getEntityColor(seriesConfig.entityType);
                    const series = strategyPerformanceChart.addSeries(lightweightCharts.HistogramSeries, {
                        color: color,
                        priceFormat: {
                            type: 'price',
                            precision: seriesConfig.format === 'percentage' ? 1 : 0,
                            minMove: seriesConfig.format === 'percentage' ? 0.1 : 1
                        },
                        title: seriesConfig.label,
                        priceScaleId: seriesConfig.priceScaleId,
                        baseLineVisible: false
                    });
                    series.setData(seriesData.data);
                    chartSeries[seriesConfig.key] = series;
                }
            });
        } else {
            // Fallback: use area series
            visibleSeries.forEach(seriesConfig => {
                const seriesData = generateMockSeriesData(filters, seriesConfig.key);
                if (seriesData.data.length > 0) {
                    if (categories.length === 0) {
                        categories = seriesData.categories;
                    }
                    
                    const color = getEntityColor(seriesConfig.entityType);
                    const series = window.TradingViewChartAdapter.addAreaSeries(strategyPerformanceChart, {
                        lineColor: color,
                        topColor: color,
                        bottomColor: color + '28',
                        priceFormat: {
                            type: 'price',
                            precision: seriesConfig.format === 'percentage' ? 1 : 0,
                            minMove: seriesConfig.format === 'percentage' ? 0.1 : 1
                        },
                        title: seriesConfig.label,
                        priceScaleId: seriesConfig.priceScaleId
                    });
                    series.setData(seriesData.data);
                    chartSeries[seriesConfig.key] = series;
                }
            });
        }
        
        // Update legend
        updateChartLegend();
        
        // Set custom time formatter to show category names (centered for each category group)
        if (categories.length > 0) {
            const visibleCount = visibleSeries.length;
            // Base timestamp: 2024-01-01 00:00:00 UTC (in seconds)
            const baseTimestamp = Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000);
            const secondsPerDay = 86400;
            const secondsPerHour = 3600;
            const daysPerCategory = 2; // 1 day for data + 1 day for spacing
            
            strategyPerformanceChart.timeScale().applyOptions({
                timeVisible: true,
                tickMarkFormatter: (time, tickMarkType, locale) => {
                    // Time is already a Unix timestamp (in seconds)
                    const timestamp = typeof time === 'string' ? parseInt(time) : time;
                    
                    // Calculate category index based on 2-day blocks from base timestamp
                    const daysFromBase = Math.floor((timestamp - baseTimestamp) / secondsPerDay);
                    const categoryIndex = Math.floor(daysFromBase / daysPerCategory);
                    
                    // Only show label at the center of each category group (at noon of the first day of each 2-day block)
                    // Center is at base of category + half of visible series hours
                    const centerOffset = Math.floor(visibleCount / 2) * secondsPerHour;
                    const centerTimestamp = baseTimestamp + (categoryIndex * daysPerCategory * secondsPerDay) + centerOffset;
                    
                    // Show label if we're within 2 hours of the center
                    if (Math.abs(timestamp - centerTimestamp) < (2 * secondsPerHour)) {
                        if (categoryIndex >= 0 && categoryIndex < categories.length) {
                            return categories[categoryIndex];
                        }
                    }
                    return '';
                }
            });
        }
        
        strategyPerformanceChart.timeScale().fitContent();
        if (window.Logger) {
            window.Logger.info('✅ Strategy performance chart initialized', { page: 'strategy-analysis-page' });
        }
        
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('Error initializing strategy performance chart', { page: 'strategy-analysis-page', error });
        }
        const container = document.getElementById('strategy-performance-chart-container');
        if (container) {
            const loading = container.querySelector('.chart-loading');
            if (loading) {
                loading.innerHTML = '<img src="../../images/icons/tabler/alert-triangle.svg" width="16" height="16" alt="alert-triangle" class="icon"> שגיאה בטעינת גרף';
                loading.style.color = '#dc3545';
            }
        }
    }
}

// Update chart legend
function updateChartLegend() {
    const legend = document.getElementById('strategy-chart-legend');
    if (!legend) return;
    
    const legendItems = [];
    
    // Add legend item for each visible series
    AVAILABLE_SERIES.forEach(seriesConfig => {
        if (seriesVisibility[seriesConfig.key] !== false && chartSeries[seriesConfig.key]) {
            const color = getEntityColor(seriesConfig.entityType);
            legendItems.push(`
                <div class="series-checkbox-container">
                    <div class="series-legend-color" style="background-color: ${color};"></div>
                    <span class="form-label-small"><strong>${seriesConfig.label}</strong></span>
                </div>
            `);
        }
    });
    
    legend.innerHTML = legendItems.join('');
}

// Update Strategy Performance Chart
async function updateStrategyPerformanceChart(filters) {
    if (!strategyPerformanceChart) {
        await initStrategyPerformanceChart();
        // After initialization, continue with update
        if (!strategyPerformanceChart) {
            if (window.Logger) {
                window.Logger.warn('Chart initialization failed, skipping update', { page: 'strategy-analysis-page' });
            }
            return;
        }
    }
    
    try {
        // Clear existing series - remove all series we've stored
        Object.values(chartSeries).forEach(series => {
            if (series) {
                try {
                    strategyPerformanceChart.removeSeries(series);
                } catch (e) {
                    if (window.Logger) {
                        window.Logger.warn('Error removing series', { page: 'strategy-analysis-page', error: e });
                    }
                }
            }
        });
        chartSeries = {};
        
        // Add series for each visible column
        const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
        const visibleSeries = AVAILABLE_SERIES.filter(s => seriesVisibility[s.key] !== false);
        let categories = [];
        
        if (lightweightCharts && lightweightCharts.HistogramSeries) {
            visibleSeries.forEach(seriesConfig => {
                const seriesData = generateMockSeriesData(filters, seriesConfig.key);
                if (seriesData.data.length > 0) {
                    if (categories.length === 0) {
                        categories = seriesData.categories;
                    }
                    
                    const color = getEntityColor(seriesConfig.entityType);
                    const series = strategyPerformanceChart.addSeries(lightweightCharts.HistogramSeries, {
                        color: color,
                        priceFormat: {
                            type: 'price',
                            precision: seriesConfig.format === 'percentage' ? 1 : 0,
                            minMove: seriesConfig.format === 'percentage' ? 0.1 : 1
                        },
                        title: seriesConfig.label,
                        priceScaleId: seriesConfig.priceScaleId,
                        baseLineVisible: false
                    });
                    series.setData(seriesData.data);
                    chartSeries[seriesConfig.key] = series;
                }
            });
        } else {
            // Fallback: use area series
            visibleSeries.forEach(seriesConfig => {
                const seriesData = generateMockSeriesData(filters, seriesConfig.key);
                if (seriesData.data.length > 0) {
                    if (categories.length === 0) {
                        categories = seriesData.categories;
                    }
                    
                    const color = getEntityColor(seriesConfig.entityType);
                    const series = window.TradingViewChartAdapter.addAreaSeries(strategyPerformanceChart, {
                        lineColor: color,
                        topColor: color,
                        bottomColor: color + '28',
                        priceFormat: {
                            type: 'price',
                            precision: seriesConfig.format === 'percentage' ? 1 : 0,
                            minMove: seriesConfig.format === 'percentage' ? 0.1 : 1
                        },
                        title: seriesConfig.label,
                        priceScaleId: seriesConfig.priceScaleId
                    });
                    series.setData(seriesData.data);
                    chartSeries[seriesConfig.key] = series;
                }
            });
        }
        
        // Update legend
        updateChartLegend();
        
        // Set custom time formatter to show category names
        if (categories.length > 0) {
            const visibleCount = visibleSeries.length;
            const baseTimestamp = Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000);
            const secondsPerDay = 86400;
            const secondsPerHour = 3600;
            const daysPerCategory = 2;
            
            strategyPerformanceChart.timeScale().applyOptions({
                timeVisible: true,
                tickMarkFormatter: (time, tickMarkType, locale) => {
                    const timestamp = typeof time === 'string' ? parseInt(time) : time;
                    const daysFromBase = Math.floor((timestamp - baseTimestamp) / secondsPerDay);
                    const categoryIndex = Math.floor(daysFromBase / daysPerCategory);
                    const centerOffset = Math.floor(visibleCount / 2) * secondsPerHour;
                    const centerTimestamp = baseTimestamp + (categoryIndex * daysPerCategory * secondsPerDay) + centerOffset;
                    
                    if (Math.abs(timestamp - centerTimestamp) < (2 * secondsPerHour)) {
                        if (categoryIndex >= 0 && categoryIndex < categories.length) {
                            return categories[categoryIndex];
                        }
                    }
                    return '';
                }
            });
        }
        
        strategyPerformanceChart.timeScale().fitContent();
        
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('Error updating strategy performance chart', { page: 'strategy-analysis-page', error });
        }
    }
}

// Update all visualizations
async function updateAllVisualizations() {
    const filters = getFilterValues();
    
    // Update table
    updateStrategyComparisonTable(filters);
    
    // Update heatmap
    updateHeatmap(filters);
    
    // Update visual heatmap
    updateVisualHeatmap(filters);
    
    // Update charts (async to handle chart initialization if needed)
    await updateStrategyPerformanceChart(filters);
    
    // Update insights
    updateStrategyInsights(filters);
}

// Update strategy insights
function updateStrategyInsights(filters) {
    const data = generateMockStrategyComparisonTableData(filters).data;
    
    if (data.length === 0) {
        const bestStrategy = document.getElementById('best-strategy-insight');
        const bestSuccessRate = document.getElementById('best-success-rate-insight');
        const recommendation = document.getElementById('recommendation-insight');
        
        if (bestStrategy) bestStrategy.innerHTML = '<img src="../../images/icons/tabler/info-circle.svg" width="16" height="16" alt="icon" class="icon"><strong>אסטרטגיה הטובה ביותר:</strong> אין נתונים';
        if (bestSuccessRate) bestSuccessRate.innerHTML = '<img src="../../images/icons/tabler/info-circle.svg" width="16" height="16" alt="info-circle" class="icon"><strong>אחוז הצלחה הגבוה ביותר:</strong> אין נתונים';
        if (recommendation) recommendation.innerHTML = '<img src="../../images/icons/tabler/alert-triangle.svg" width="16" height="16" alt="alert-triangle" class="icon"><strong>המלצה:</strong> אין נתונים להצגה';
        return;
    }
    
    // Find best strategy by total PL
    const bestStrategy = data.reduce((best, current) => {
        return (current.totalPL > best.totalPL) ? current : best;
    }, data[0]);
    
    // Find best success rate
    const bestSuccessRateStrategy = data.reduce((best, current) => {
        return (current.successRate > best.successRate) ? current : best;
    }, data[0]);
    
    // Calculate risk/reward for best strategy
    const riskReward = bestStrategy.totalPL > 0 && bestStrategy.trades > 0
        ? (bestStrategy.totalPL / (bestStrategy.trades * Math.abs(bestStrategy.avgPL || 1))).toFixed(1)
        : '0';
    
    const bestStrategyEl = document.getElementById('best-strategy-insight');
    const bestSuccessRateEl = document.getElementById('best-success-rate-insight');
    const recommendationEl = document.getElementById('recommendation-insight');
    
    if (bestStrategyEl) {
        bestStrategyEl.innerHTML = `
            <img src="../../images/icons/tabler/info-circle.svg" width="16" height="16" alt="icon" class="icon">
            <strong>אסטרטגיה הטובה ביותר:</strong> ${bestStrategy.name || 'לא זמין'} עם P/L כולל של ${formatCurrency(bestStrategy.totalPL)}
        `;
    }
    
    if (bestSuccessRateEl) {
        bestSuccessRateEl.innerHTML = `
            <img src="../../images/icons/tabler/info-circle.svg" width="16" height="16" alt="info-circle" class="icon">
            <strong>אחוז הצלחה הגבוה ביותר:</strong> ${bestSuccessRateStrategy.name || 'לא זמין'} עם ${bestSuccessRateStrategy.successRate}%
        `;
    }
    
    if (recommendationEl) {
        const recommendationText = bestStrategy.totalPL > 0
            ? `שקול להגדיל את השימוש ב-${bestStrategy.name || 'אסטרטגיה זו'} בגלל ה-P/L הגבוה (${formatCurrency(bestStrategy.totalPL)})`
            : 'אין המלצות זמינות כרגע';
        recommendationEl.innerHTML = `
            <img src="../../images/icons/tabler/alert-triangle.svg" width="16" height="16" alt="alert-triangle" class="icon">
            <strong>המלצה:</strong> ${recommendationText}
        `;
    }
}

// ===== Preferences Management =====

// Save record filter state
async function saveRecordFilterState() {
    try {
        const recordFilters = getRecordFilterValues();
        if (window.PreferencesCore && typeof window.PreferencesCore.savePreference === 'function') {
            await window.PreferencesCore.savePreference(PREF_RECORD_FILTERS, recordFilters);
        } else {
            // Fallback to localStorage
            localStorage.setItem(PREF_RECORD_FILTERS, JSON.stringify(recordFilters));
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Failed to save record filter state', { page: 'strategy-analysis-page', error });
        }
    }
}

// Load record filter state
async function loadRecordFilterState() {
    try {
        let savedState = null;
        if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
            savedState = await window.PreferencesCore.getPreference(PREF_RECORD_FILTERS);
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem(PREF_RECORD_FILTERS);
            if (saved) {
                savedState = JSON.parse(saved);
            }
        }
        
        if (savedState) {
            // Restore date range
            if (savedState.dateRange) {
                const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
                dateRangeItems.forEach(item => item.classList.remove('selected'));
                const selectedItem = document.querySelector(`#dateRangeFilterMenu .date-range-filter-item[data-value="${savedState.dateRange}"]`);
                if (selectedItem) {
                    selectedItem.classList.add('selected');
                }
            }
            
            // Restore custom dates
            if (savedState.dateRangeStart) {
                const fromInput = document.getElementById('customDateFrom');
                if (fromInput) fromInput.value = savedState.dateRangeStart;
            }
            if (savedState.dateRangeEnd) {
                const toInput = document.getElementById('customDateTo');
                if (toInput) toInput.value = savedState.dateRangeEnd;
            }
            updateDateRangeFilterText();
            
            // Restore trading accounts
            if (savedState.tradingAccounts && savedState.tradingAccounts.length > 0) {
                const tradingAccounts = document.getElementById('recordFilterTradingAccounts');
                if (tradingAccounts) {
                    Array.from(tradingAccounts.options).forEach(opt => {
                        opt.selected = savedState.tradingAccounts.includes(opt.value);
                    });
                }
            }
            
            // Restore tags
            if (savedState.tags && savedState.tags.length > 0) {
                const tagsSelect = document.getElementById('recordFilterTags');
                if (tagsSelect) {
                    if (window.TagUIManager && typeof window.TagUIManager.setSelectedValues === 'function') {
                        window.TagUIManager.setSelectedValues(tagsSelect, savedState.tags);
                    } else {
                        Array.from(tagsSelect.options).forEach(opt => {
                            opt.selected = savedState.tags.includes(parseInt(opt.value));
                        });
                    }
                }
            }
            
            // Restore status
            if (savedState.status && savedState.status.length > 0) {
                const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
                statusItems.forEach(item => item.classList.remove('selected'));
                const selectedStatus = savedState.status[0]; // Take first status
                const statusItem = document.querySelector(`#statusFilterMenu .status-filter-item[data-value="${selectedStatus}"]`);
                if (statusItem) {
                    statusItem.classList.add('selected');
                } else {
                    // Default to "הכול"
                    const allStatusItem = document.querySelector('#statusFilterMenu .status-filter-item[data-value="הכול"]');
                    if (allStatusItem) allStatusItem.classList.add('selected');
                }
                updateStatusFilterText();
            }
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Failed to load record filter state', { page: 'strategy-analysis-page', error });
        }
    }
}

// Save comparison parameter state
async function saveComparisonParameterState() {
    try {
        const comparisonParams = getComparisonParameterValues();
        if (window.PreferencesCore && typeof window.PreferencesCore.savePreference === 'function') {
            await window.PreferencesCore.savePreference(PREF_COMPARISON_PARAMS, comparisonParams);
        } else {
            // Fallback to localStorage
            localStorage.setItem(PREF_COMPARISON_PARAMS, JSON.stringify(comparisonParams));
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Failed to save comparison parameter state', { page: 'strategy-analysis-page', error });
        }
    }
}

// Load comparison parameter state
async function loadComparisonParameterState() {
    try {
        let savedState = null;
        if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
            savedState = await window.PreferencesCore.getPreference(PREF_COMPARISON_PARAMS);
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem(PREF_COMPARISON_PARAMS);
            if (saved) {
                savedState = JSON.parse(saved);
            }
        }
        
        if (savedState) {
            // Restore trading methods
            if (savedState.tradingMethods) {
                const checkbox = document.getElementById('compareByTradingMethods');
                const select = document.getElementById('comparisonTradingMethods');
                const btnSelectAll = document.getElementById('btn-select-all-trading-methods');
                const btnClearAll = document.getElementById('btn-clear-all-trading-methods');
                
                if (checkbox && select) {
                    checkbox.checked = savedState.tradingMethods.enabled;
                    select.disabled = !savedState.tradingMethods.enabled;
                    if (btnSelectAll) btnSelectAll.disabled = !savedState.tradingMethods.enabled;
                    if (btnClearAll) btnClearAll.disabled = !savedState.tradingMethods.enabled;
                    
                    if (savedState.tradingMethods.values && savedState.tradingMethods.values.length > 0) {
                        Array.from(select.options).forEach(opt => {
                            opt.selected = savedState.tradingMethods.values.includes(opt.value);
                        });
                    }
                }
            }
            
            // Restore ticker
            if (savedState.ticker) {
                const checkbox = document.getElementById('compareByTicker');
                const select = document.getElementById('comparisonTickers');
                const btnSelectAll = document.getElementById('btn-select-all-tickers');
                const btnClearAll = document.getElementById('btn-clear-all-tickers');
                
                if (checkbox && select) {
                    checkbox.checked = savedState.ticker.enabled;
                    select.disabled = !savedState.ticker.enabled;
                    if (btnSelectAll) btnSelectAll.disabled = !savedState.ticker.enabled;
                    if (btnClearAll) btnClearAll.disabled = !savedState.ticker.enabled;
                    
                    if (savedState.ticker.values && savedState.ticker.values.length > 0) {
                        Array.from(select.options).forEach(opt => {
                            opt.selected = savedState.ticker.values.includes(opt.value);
                        });
                    }
                }
            }
            
            // Restore tags
            if (savedState.tags) {
                const checkbox = document.getElementById('compareByTags');
                const select = document.getElementById('comparisonTags');
                const btnSelectAll = document.getElementById('btn-select-all-comparison-tags');
                const btnClearAll = document.getElementById('btn-clear-all-comparison-tags');
                
                if (checkbox && select) {
                    checkbox.checked = savedState.tags.enabled;
                    select.disabled = !savedState.tags.enabled;
                    if (btnSelectAll) btnSelectAll.disabled = !savedState.tags.enabled;
                    if (btnClearAll) btnClearAll.disabled = !savedState.tags.enabled;
                    
                    if (savedState.tags.values && savedState.tags.values.length > 0) {
                        if (window.TagUIManager && typeof window.TagUIManager.setSelectedValues === 'function') {
                            window.TagUIManager.setSelectedValues(select, savedState.tags.values);
                        } else {
                            Array.from(select.options).forEach(opt => {
                                opt.selected = savedState.tags.values.includes(parseInt(opt.value));
                            });
                        }
                    }
                }
            }
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Failed to load comparison parameter state', { page: 'strategy-analysis-page', error });
        }
    }
}

// ===== Data Loading Functions =====

// Load trading accounts for filters
async function loadTradingAccounts() {
    // Mock data for trading accounts
    const mockAccounts = [
        { id: 1, name: 'חשבון מסחר 1' },
        { id: 2, name: 'חשבון מסחר 2' },
        { id: 3, name: 'חשבון מסחר 3' }
    ];
    
    const select = document.getElementById('recordFilterTradingAccounts');
    if (select) {
        // Clear existing options (except first empty option if exists)
        const firstOption = select.options[0];
        select.innerHTML = '';
        if (firstOption && firstOption.value === '') {
            select.appendChild(firstOption);
        }
        
        mockAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name;
            select.appendChild(option);
        });
    }
}

// Load trading methods for comparison
async function loadTradingMethods() {
    // Mock data for trading methods
    const mockMethods = [
        { id: 1, name: 'שיטת מסחר 1' },
        { id: 2, name: 'שיטת מסחר 2' },
        { id: 3, name: 'שיטת מסחר 3' },
        { id: 4, name: 'שיטת מסחר 4' }
    ];
    
    const select = document.getElementById('comparisonTradingMethods');
    if (select) {
        select.innerHTML = '';
        mockMethods.forEach(method => {
            const option = document.createElement('option');
            option.value = method.id;
            option.textContent = method.name;
            select.appendChild(option);
        });
    }
}

// Load tickers for comparison
async function loadTickers() {
    // Mock data for tickers
    const mockTickers = [
        { id: 1, symbol: 'AAPL' },
        { id: 2, symbol: 'TSLA' },
        { id: 3, symbol: 'MSFT' },
        { id: 4, symbol: 'GOOGL' },
        { id: 5, symbol: 'AMZN' }
    ];
    
    const select = document.getElementById('comparisonTickers');
    if (select) {
        select.innerHTML = '';
        mockTickers.forEach(ticker => {
            const option = document.createElement('option');
            option.value = ticker.id;
            option.textContent = ticker.symbol;
            select.appendChild(option);
        });
    }
}

// Initialize record filter tags
async function initializeRecordFilterTags() {
    const tagsSelect = document.getElementById('recordFilterTags');
    if (!tagsSelect) return;
    
    // Mock tags
    const mockTags = [
        { id: 1, name: 'מוצלח', category: { name: 'תוצאות', color_hex: '#28a745' } },
        { id: 2, name: 'סיכון נמוך', category: { name: 'סיכון', color_hex: '#007bff' } },
        { id: 3, name: 'רווחי', category: { name: 'תוצאות', color_hex: '#28a745' } },
        { id: 4, name: 'מהיר', category: { name: 'זמן', color_hex: '#ffc107' } },
        { id: 5, name: 'ארוך טווח', category: { name: 'זמן', color_hex: '#17a2b8' } }
    ];
    
    // Initialize TagUIManager if available
    if (window.TagUIManager && typeof window.TagUIManager.initialize === 'function') {
        await window.TagUIManager.initialize(tagsSelect, mockTags);
    } else {
        // Fallback: create options manually
        tagsSelect.innerHTML = '';
        mockTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.category ? `${tag.category.name} • ${tag.name}` : tag.name;
            tagsSelect.appendChild(option);
        });
    }
}

// Initialize comparison tags
async function initializeComparisonTags() {
    const tagsSelect = document.getElementById('comparisonTags');
    if (!tagsSelect) return;
    
    // Mock tags (same as record filter tags)
    const mockTags = [
        { id: 1, name: 'מוצלח', category: { name: 'תוצאות', color_hex: '#28a745' } },
        { id: 2, name: 'סיכון נמוך', category: { name: 'סיכון', color_hex: '#007bff' } },
        { id: 3, name: 'רווחי', category: { name: 'תוצאות', color_hex: '#28a745' } },
        { id: 4, name: 'מהיר', category: { name: 'זמן', color_hex: '#ffc107' } },
        { id: 5, name: 'ארוך טווח', category: { name: 'זמן', color_hex: '#17a2b8' } }
    ];
    
    // Initialize TagUIManager if available
    if (window.TagUIManager && typeof window.TagUIManager.initialize === 'function') {
        await window.TagUIManager.initialize(tagsSelect, mockTags);
    } else {
        // Fallback: create options manually
        tagsSelect.innerHTML = '';
        mockTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.category ? `${tag.category.name} • ${tag.name}` : tag.name;
            tagsSelect.appendChild(option);
        });
    }
}

// ===== Initialize Page =====

// Initialize page
async function initializePage() {
    try {
        // Initialize Header System first
        await initializeHeader();
        
        // Wait for Preferences to be loaded
        if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
            await window.PreferencesCore.initializeWithLazyLoading();
        }
        
        // Load dynamic data
        await loadTradingAccounts();
        await loadTradingMethods();
        await loadTickers();
        await initializeRecordFilterTags();
        await initializeComparisonTags();
        
        // Load saved state or set defaults
        await loadRecordFilterState();
        await loadComparisonParameterState();
        await loadSeriesVisibilityState();
        
        // Set defaults if no saved state
        const comparisonParams = getComparisonParameterValues();
        const hasEnabledParams = Object.values(comparisonParams).some(p => p.enabled && p.values.length > 0);
        if (!hasEnabledParams) {
            resetComparisonParametersToDefaults();
        }
        
        // Initialize series controls
        initializeSeriesControls();
        
        // Update all visualizations
        await updateAllVisualizations();
        
        // Initialize chart
        await initStrategyPerformanceChart();
        
        // Set up event listeners
        setupEventListeners();
        
        if (window.Logger) {
            window.Logger.info('✅ Strategy analysis page initialized', { page: 'strategy-analysis-page' });
        }
        
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('Error initializing strategy analysis page', { page: 'strategy-analysis-page', error });
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Date range custom inputs
    const fromInput = document.getElementById('customDateFrom');
    const toInput = document.getElementById('customDateTo');
    if (fromInput) {
        fromInput.addEventListener('change', handleCustomDateFromChange);
    }
    if (toInput) {
        toInput.addEventListener('change', handleCustomDateToChange);
    }
    
    // Record filter selects
    const tradingAccountsSelect = document.getElementById('recordFilterTradingAccounts');
    if (tradingAccountsSelect) {
        tradingAccountsSelect.addEventListener('change', applyRecordFilters);
    }
    
    const recordTagsSelect = document.getElementById('recordFilterTags');
    if (recordTagsSelect) {
        recordTagsSelect.addEventListener('change', applyRecordFilters);
    }
    
    // Comparison parameter selects
    const comparisonTradingMethodsSelect = document.getElementById('comparisonTradingMethods');
    if (comparisonTradingMethodsSelect) {
        comparisonTradingMethodsSelect.addEventListener('change', applyComparisonParameters);
    }
    
    const comparisonTickersSelect = document.getElementById('comparisonTickers');
    if (comparisonTickersSelect) {
        comparisonTickersSelect.addEventListener('change', applyComparisonParameters);
    }
    
    const comparisonTagsSelect = document.getElementById('comparisonTags');
    if (comparisonTagsSelect) {
        comparisonTagsSelect.addEventListener('change', applyComparisonParameters);
    }
}

// Export functions to window for debugging
window.strategyAnalysisPage = {
    getCSSVariableValue,
    getEntityColor,
    initializeHeader,
    getRecordFilterValues,
    getComparisonParameterValues,
    getFilterValues,
    getDateRange,
    toggleDateRangeFilterMenu,
    selectDateRangeOption,
    handleCustomDateFromChange,
    handleCustomDateToChange,
    updateDateRangeFilterText,
    toggleStatusFilterMenu,
    selectStatusOption,
    updateStatusFilterText,
    applyRecordFilters,
    resetRecordFilters,
    resetRecordFiltersToDefaults,
    toggleComparisonParameter,
    applyComparisonParameters,
    resetComparisonParameters,
    resetComparisonParametersToDefaults,
    selectAllOptions,
    clearAllOptions,
    updateStrategyComparisonTable,
    updateHeatmap,
    updateVisualHeatmap,
    initStrategyPerformanceChart,
    updateStrategyPerformanceChart,
    updateChartLegend,
    updateAllVisualizations,
    updateStrategyInsights,
    initializePage
};

// Make functions globally available
window.toggleDateRangeFilterMenu = toggleDateRangeFilterMenu;
window.selectDateRangeOption = selectDateRangeOption;
window.handleCustomDateFromChange = handleCustomDateFromChange;
window.handleCustomDateToChange = handleCustomDateToChange;
window.toggleStatusFilterMenu = toggleStatusFilterMenu;
window.selectStatusOption = selectStatusOption;
window.toggleComparisonParameter = toggleComparisonParameter;
window.selectAllOptions = selectAllOptions;
window.clearAllOptions = clearAllOptions;
window.toggleSeries = toggleSeries;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    // DOM already loaded
    initializePage();
}

})();

