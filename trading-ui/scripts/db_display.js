/**
 * ========================================
 * DB Display - Database Display Page Management
 * ========================================
 * 
 * This file contains all database display page functionality for the TikTrack application.
 * It handles displaying all database tables in one unified view with sorting and filtering.
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * - notification-system.js (for notifications)
 * 
 * Table Mapping:
 * - Uses all table types from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * File: trading-ui/scripts/db_display.js
 * Version: 1.0
 * Last Updated: September 1, 2025
 */

// ===== GLOBAL VARIABLES =====
let currentTableType = 'accounts'; // Default table type
let tableData = {};
let isDataLoaded = false;

// ===== PAGE INITIALIZATION =====

/**
 * Initialize the database display page
 */
function initDatabaseDisplay() {
    console.log('🔄 Initializing database display page...');
    
    // Load default table (accounts)
    loadTableData('accounts');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize header system
    if (window.headerSystem) {
        window.headerSystem.init();
    }
    
    console.log('✅ Database display page initialized successfully');
}

/**
 * Set up page event listeners
 */
function setupEventListeners() {
    // Table type selector
    const tableTypeSelect = document.getElementById('tableTypeSelect');
    if (tableTypeSelect) {
        tableTypeSelect.addEventListener('change', function() {
            const selectedType = this.value;
            loadTableData(selectedType);
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterTableData(this.value);
        });
    }
}

// ===== DATA LOADING =====

/**
 * Load data for a specific table type
 * @param {string} tableType - The table type to load
 */
async function loadTableData(tableType) {
    try {
        console.log(`📊 Loading data for table type: ${tableType}`);
        
        // Update current table type
        currentTableType = tableType;
        
        // Show loading state
        showLoadingState();
        
        // Fetch data from server
        const data = await fetchTableData(tableType);
        
        // Store data
        tableData[tableType] = data;
        
        // Update table display
        updateTableDisplay(data, tableType);
        
        // Update table info
        updateTableInfo(tableType, data.length);
        
        // Mark as loaded
        isDataLoaded = true;
        
        console.log(`✅ Data loaded for ${tableType}: ${data.length} records`);
        
    } catch (error) {
        console.error(`❌ Error loading data for ${tableType}:`, error);
        handleDataLoadError(error, tableType);
    }
}

/**
 * Fetch table data from server
 * @param {string} tableType - The table type to fetch
 * @returns {Promise<Array>} The fetched data
 */
async function fetchTableData(tableType) {
    try {
        const response = await fetch(`/api/v1/${tableType}/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            return result.data || [];
        } else {
            throw new Error(result.error?.message || `Error fetching ${tableType} data`);
        }
    } catch (error) {
        console.error(`❌ Error fetching ${tableType} data:`, error);
        // Return empty array on error
        return [];
    }
}

// ===== TABLE DISPLAY =====

/**
 * Update table display with data
 * @param {Array} data - The data to display
 * @param {string} tableType - The table type
 */
function updateTableDisplay(data, tableType) {
    const tableContainer = document.getElementById('tableContainer');
    if (!tableContainer) {
        console.error('❌ Table container not found');
        return;
    }
    
    // Get table mappings
    const tableMapping = window.tableMappings?.[tableType];
    if (!tableMapping) {
        console.error(`❌ No table mapping found for ${tableType}`);
        return;
    }
    
    // Create table HTML
    const tableHTML = createTableHTML(data, tableMapping, tableType);
    
    // Update container
    tableContainer.innerHTML = tableHTML;
    
    // Apply sorting functionality
    applySortingFunctionality(tableType);
}

/**
 * Create table HTML from data
 * @param {Array} data - The data to display
 * @param {Object} tableMapping - The table mapping configuration
 * @param {string} tableType - The table type
 * @returns {string} The table HTML
 */
function createTableHTML(data, tableMapping, tableType) {
    const columns = tableMapping.columns || [];
    
    // Create header
    let headerHTML = '<thead><tr>';
    columns.forEach((column, index) => {
        const sortable = column.sortable !== false;
        const sortClass = sortable ? 'sortable' : '';
        const sortOnClick = sortable ? `onclick="sortTable(${index}, '${tableType}')"` : '';
        
        headerHTML += `<th class="${sortClass}" ${sortOnClick} style="width: ${column.width || 'auto'};">${column.title || column.field}</th>`;
    });
    headerHTML += '</tr></thead>';
    
    // Create body
    let bodyHTML = '<tbody>';
    if (data.length === 0) {
        bodyHTML += `<tr><td colspan="${columns.length}" class="text-center">אין נתונים</td></tr>`;
    } else {
        data.forEach(row => {
            bodyHTML += '<tr>';
            columns.forEach(column => {
                const value = row[column.field] || '';
                const formattedValue = formatCellValue(value, column);
                bodyHTML += `<td>${formattedValue}</td>`;
            });
            bodyHTML += '</tr>';
        });
    }
    bodyHTML += '</tbody>';
    
    return `<table class="table table-striped table-hover" data-table-type="${tableType}">${headerHTML}${bodyHTML}</table>`;
}

/**
 * Format cell value based on column configuration
 * @param {*} value - The cell value
 * @param {Object} column - The column configuration
 * @returns {string} The formatted value
 */
function formatCellValue(value, column) {
    if (value === null || value === undefined) {
        return '';
    }
    
    // Apply formatting based on column type
    switch (column.type) {
        case 'date':
            return formatDate(value);
        case 'number':
            return formatNumber(value);
        case 'currency':
            return formatCurrency(value);
        case 'status':
            return formatStatus(value);
        default:
            return String(value);
    }
}

/**
 * Apply sorting functionality to table
 * @param {string} tableType - The table type
 */
function applySortingFunctionality(tableType) {
    // Sorting is handled by global sortTable function from main.js
    console.log(`🔀 Sorting functionality applied to ${tableType} table`);
}

// ===== UTILITY FUNCTIONS =====

/**
 * Show loading state
 */
function showLoadingState() {
    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer) {
        tableContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">טוען...</span></div></div>';
    }
}

/**
 * Update table information display
 * @param {string} tableType - The table type
 * @param {number} recordCount - The number of records
 */
function updateTableInfo(tableType, recordCount) {
    const tableInfoElement = document.getElementById('tableInfo');
    if (tableInfoElement) {
        const tableMapping = window.tableMappings?.[tableType];
        const tableName = tableMapping?.title || tableType;
        tableInfoElement.textContent = `${tableName} - ${recordCount} רשומות`;
    }
}

/**
 * Filter table data
 * @param {string} searchTerm - The search term
 */
function filterTableData(searchTerm) {
    if (!searchTerm || !tableData[currentTableType]) {
        updateTableDisplay(tableData[currentTableType] || [], currentTableType);
        return;
    }
    
    const filteredData = tableData[currentTableType].filter(row => {
        return Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
    
    updateTableDisplay(filteredData, currentTableType);
}

/**
 * Format date value
 * @param {string} dateString - The date string
 * @returns {string} The formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
    } catch (error) {
        return dateString;
    }
}

/**
 * Format number value
 * @param {number} number - The number
 * @returns {string} The formatted number
 */
function formatNumber(number) {
    if (number === null || number === undefined) return '';
    return Number(number).toLocaleString('he-IL');
}

/**
 * Format currency value
 * @param {number} amount - The amount
 * @returns {string} The formatted currency
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Format status value
 * @param {string} status - The status
 * @returns {string} The formatted status
 */
function formatStatus(status) {
    if (!status) return '';
    
    const statusMap = {
        'active': 'פעיל',
        'inactive': 'לא פעיל',
        'pending': 'ממתין',
        'completed': 'הושלם',
        'cancelled': 'בוטל'
    };
    
    return statusMap[status] || status;
}

/**
 * Handle data load error
 * @param {Error} error - The error
 * @param {string} tableType - The table type
 */
function handleDataLoadError(error, tableType) {
    console.error(`❌ Error loading ${tableType} data:`, error);
    
    // Show error notification
    if (window.showNotification) {
        window.showNotification(`שגיאה בטעינת נתוני ${tableType}`, 'error');
    }
    
    // Show error state in table
    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer) {
        tableContainer.innerHTML = `<div class="alert alert-danger">שגיאה בטעינת נתונים: ${error.message}</div>`;
    }
}

// ===== GLOBAL EXPORTS =====

// Export functions to global scope
window.initDatabaseDisplay = initDatabaseDisplay;
window.loadTableData = loadTableData;
window.filterTableData = filterTableData;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('➕ Database display page DOM loaded');
    initDatabaseDisplay();
});

console.log('✅ DB Display script loaded successfully');


