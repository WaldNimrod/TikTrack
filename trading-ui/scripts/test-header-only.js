/**
 * Test Header Only Page - JavaScript Functions
 * עמוד בדיקה פשוט למערכת ראש הדף
 * 
 * @version 4.0.0
 * @lastUpdated October 11, 2025
 * @author TikTrack Development Team
 */

console.log('🔧 test-header-only.js v4.0.0 loaded successfully!');

// ===== GLOBAL VARIABLES =====

let tradePlansData = [];
let executionsData = [];

// ===== GLOBAL INITIALIZATION FUNCTION =====

/**
 * Initialize Test Header Page
 * Called by unified initialization system
 */
window.initializeTestHeaderPage = async function() {
    console.log('🧪 Test Header Page initialization starting...');
    
    try {
        // Wait for filter system to be ready
        let attempts = 0;
        while (!window.filterSystem && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.filterSystem) {
            console.log('✅ Filter system ready');
        } else {
            console.error('❌ Filter system not available after waiting');
        }
        
        // Load real data from API
        await loadAllData();
        
        // Update info cards
        updateInfoCards();
        
        // Setup auto-refresh
        setupAutoRefresh();
        
        console.log('✅ Test Header Page initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing test header page:', error);
    }
};

// ===== DATA LOADING =====

/**
 * Load all data from API
 */
async function loadAllData() {
    console.log('📊 Loading data from API...');
    
    try {
        // Load trade plans
        await loadTradePlansData();
        
        // Load executions
        await loadExecutionsData();
        
        console.log('✅ All data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

/**
 * Load Trade Plans Data
 */
async function loadTradePlansData() {
    try {
        console.log('📋 Loading trade plans...');
        
        // Use the global loadTableData function if available
        if (typeof window.loadTableData === 'function') {
            const data = await window.loadTableData('trade_plans', renderTradePlansTable, {
                tableId: 'tradePlansTable',
                entityName: 'תוכניות מסחר',
                columns: 10,
                onRetry: loadTradePlansData
            });
            
            tradePlansData = data || [];
            console.log(`✅ Loaded ${tradePlansData.length} trade plans`);
            return;
        }
        
        // Fallback: Direct API call
        const response = await fetch('/api/trade-plans/?_t=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        tradePlansData = result.trade_plans || result.data || result || [];
        
        console.log(`✅ Loaded ${tradePlansData.length} trade plans`);
        renderTradePlansTable();
        
    } catch (error) {
        console.error('❌ Error loading trade plans:', error);
        showTableError('tradePlansContainer', 'שגיאה בטעינת תכנוני טריידים');
    }
}

/**
 * Load Executions Data
 */
async function loadExecutionsData() {
    try {
        console.log('📊 Loading executions...');
        
        // Direct API call (like executions.js does)
        const response = await fetch('/api/executions/?_t=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        executionsData = result.data || result.executions || result || [];
        
        console.log(`✅ Loaded ${executionsData.length} executions`);
        
        // Render table
        renderExecutionsTable();
        
    } catch (error) {
        console.error('❌ Error loading executions:', error);
        showTableError('executionsContainer', 'שגיאה בטעינת ביצועים');
    }
}

// ===== TABLE RENDERING =====

/**
 * Render Trade Plans Table
 */
function renderTradePlansTable(data) {
    const tbody = document.getElementById('tradePlansTableBody');
    if (!tbody) return;
    
    // Use provided data or global tradePlansData
    const plansToRender = data || tradePlansData;
    
    if (!plansToRender || plansToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted"><i class="fas fa-info-circle"></i> אין תכנוני טריידים</td></tr>';
        updateInfoCards();
        return;
    }
    
    tbody.innerHTML = plansToRender.map(plan => `
        <tr>
            <td>${plan.ticker_symbol || ''}</td>
            <td data-date="${plan.plan_date || ''}">${plan.plan_date || ''}</td>
            <td data-investment-type="${plan.investment_type || ''}">${plan.investment_type || ''}</td>
            <td>${plan.planned_side || ''}</td>
            <td>${plan.planned_quantity || ''}</td>
            <td>${plan.planned_price ? '$' + parseFloat(plan.planned_price).toFixed(2) : ''}</td>
            <td>${plan.planned_investment ? '$' + parseFloat(plan.planned_investment).toFixed(2) : ''}</td>
            <td data-status="${plan.status || ''}">
                ${window.FieldRendererService ? 
                    window.FieldRendererService.renderStatus(plan.status) : 
                    `<span class="status-badge status-${plan.status}">${plan.status}</span>`
                }
            </td>
            <td>${plan.expected_profit ? '$' + parseFloat(plan.expected_profit).toFixed(2) : ''}</td>
            <td data-account="${plan.account_name || ''}">${plan.account_name || ''}</td>
        </tr>
    `).join('');
    
    console.log(`✅ Trade plans table rendered with ${plansToRender.length} rows`);
    updateInfoCards();
}

/**
 * Render Executions Table
 */
function renderExecutionsTable(data) {
    const tbody = document.getElementById('executionsTableBody');
    if (!tbody) return;
    
    // Use provided data or global executionsData
    const executionsToRender = data || executionsData;
    
    if (!executionsToRender || executionsToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted"><i class="fas fa-info-circle"></i> אין ביצועים</td></tr>';
        updateInfoCards();
        return;
    }
    
    tbody.innerHTML = executionsToRender.map(execution => `
        <tr>
            <td>${execution.ticker_symbol || ''}</td>
            <td>${execution.action || ''}</td>
            <td data-account="${execution.account_name || ''}">${execution.account_name || ''}</td>
            <td>${execution.quantity || ''}</td>
            <td>${execution.price ? '$' + parseFloat(execution.price).toFixed(2) : ''}</td>
            <td>${execution.pnl ? 
                window.FieldRendererService ? 
                    window.FieldRendererService.renderNumeric(execution.pnl, 2, '$') : 
                    '$' + parseFloat(execution.pnl).toFixed(2) : 
                ''
            }</td>
            <td data-date="${execution.execution_date || ''}">${execution.execution_date || ''}</td>
            <td>${execution.source || ''}</td>
            <td data-status="${execution.status || ''}">
                ${window.FieldRendererService ? 
                    window.FieldRendererService.renderStatus(execution.status) : 
                    `<span class="status-badge status-${execution.status}">${execution.status}</span>`
                }
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ Executions table rendered with ${executionsToRender.length} rows`);
    updateInfoCards();
}

/**
 * Show Table Error
 */
function showTableError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const table = container.querySelector('table');
    if (table) {
        const tbody = table.querySelector('tbody');
        if (tbody) {
            const colCount = table.querySelectorAll('thead th').length;
            tbody.innerHTML = `
                <tr>
                    <td colspan="${colCount}" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle"></i> ${message}
                        <br>
                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="window.initializeTestHeaderPage()">
                            <i class="fas fa-sync"></i> נסה שוב
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

// ===== INFO CARDS UPDATE =====

/**
 * Update Info Cards with System Status
 */
function updateInfoCards() {
    // Filter System Status
    if (window.filterSystem) {
        updateElement('filterSystemStatus', '✅ זמין', 'green');
        updateElement('registeredTablesCount', '2', 'green');
    } else {
        updateElement('filterSystemStatus', '❌ לא זמין', 'red');
    }
    
    // Count visible rows
    const tradePlansTable = document.getElementById('tradePlansTable');
    const executionsTable = document.getElementById('executionsTable');
    
    if (tradePlansTable) {
        const rows = tradePlansTable.querySelectorAll('tbody tr');
        const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none').length;
        const total = rows.length;
        updateElement('tradePlansRows', `${visibleRows}/${total}`, visibleRows === total ? 'green' : 'orange');
    }
    
    if (executionsTable) {
        const rows = executionsTable.querySelectorAll('tbody tr');
        const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none').length;
        const total = rows.length;
        updateElement('executionsRows', `${visibleRows}/${total}`, visibleRows === total ? 'green' : 'orange');
    }
    
    // Performance
    if (window.performance && window.performance.now) {
        const loadTime = Math.round(window.performance.now());
        updateElement('loadTime', `${loadTime}ms`, 'green');
    }
}

/**
 * Update Element Text and Color
 */
function updateElement(elementId, text, color) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
        element.style.color = color;
        element.style.fontWeight = 'bold';
    }
}

// ===== AUTO REFRESH =====

/**
 * Setup Auto Refresh
 */
function setupAutoRefresh() {
    // Update cards when filters change
    if (window.filterSystem) {
        const originalApply = window.filterSystem.applyAllFilters;
        if (originalApply) {
            window.filterSystem.applyAllFilters = function() {
                originalApply.call(this);
                setTimeout(updateInfoCards, 100);
            };
        }
    }
    
    // Periodic update
    setInterval(updateInfoCards, 3000);
    
    console.log('✅ Auto-refresh enabled');
}

// ===== SECTION TOGGLE FUNCTIONS =====

/**
 * Toggle Section
 */
window.toggleSection = function(sectionId) {
    const section = document.getElementById(sectionId === 'top' ? 'topSection' : sectionId);
    if (section) {
        section.classList.toggle('collapsed');
        
        // Update icon
        const icon = section.querySelector('.filter-icon, .section-toggle-icon');
        if (icon) {
            icon.textContent = section.classList.contains('collapsed') ? '▲' : '▼';
        }
        
        console.log(`🔧 Section ${sectionId} toggled`);
    }
};

console.log('✅ test-header-only.js v4.0.0 initialization complete');
