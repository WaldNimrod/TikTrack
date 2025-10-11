/**
 * Test Header Only Page - JavaScript Functions
 * עמוד בדיקה פשוט למערכת ראש הדף
 * 
 * @version 4.0.0
 * @lastUpdated October 11, 2025
 * @author TikTrack Development Team
 */

console.log('🔧 test-header-only.js v4.0.0 loaded successfully!');

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
            updateInfoCards();
        } else {
            console.error('❌ Filter system not available after waiting');
        }
        
        console.log('✅ Test Header Page initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing test header page:', error);
    }
};

// ===== INFO CARDS UPDATE =====

/**
 * Update Info Cards with System Status
 */
function updateInfoCards() {
    // Filter System Status
    if (window.filterSystem) {
        updateElement('filterSystemStatus', '✅ זמין', 'green');
        
        // Count tables
        const tradePlansTable = document.getElementById('tradePlansTable');
        const executionsTable = document.getElementById('executionsTable');
        
        let tablesCount = 0;
        if (tradePlansTable && tradePlansTable.getAttribute('data-table-type')) tablesCount++;
        if (executionsTable && executionsTable.getAttribute('data-table-type')) tablesCount++;
        
        updateElement('registeredTablesCount', tablesCount.toString(), 'green');
        
        // Count rows
        if (tradePlansTable) {
            const rows = tradePlansTable.querySelectorAll('tbody tr');
            const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none').length;
            updateElement('tradePlansRows', `${visibleRows}/${rows.length}`, 'green');
        }
        
        if (executionsTable) {
            const rows = executionsTable.querySelectorAll('tbody tr');
            const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none').length;
            updateElement('executionsRows', `${visibleRows}/${rows.length}`, 'green');
        }
    } else {
        updateElement('filterSystemStatus', '❌ לא זמין', 'red');
    }
    
    // Performance Metrics
    if (window.performance && window.performance.now) {
        const loadTime = Math.round(window.performance.now());
        updateElement('loadTime', `${loadTime}ms`, 'green');
        updateElement('headerLoadTime', '~150ms', 'green');
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

// ===== SECTION TOGGLE FUNCTIONS =====

/**
 * Toggle Top Section
 */
window.toggleTopSection = function() {
    const section = document.getElementById('top-section');
    if (section) {
        section.classList.toggle('collapsed');
        
        // Update icon
        const icon = section.querySelector('.section-toggle-icon');
        if (icon) {
            icon.textContent = section.classList.contains('collapsed') ? '▲' : '▼';
        }
        
        console.log('🔧 Top section toggled');
    }
};

/**
 * Toggle Section
 */
window.toggleSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
        
        // Update icon
        const icon = section.querySelector('.section-toggle-icon');
        if (icon) {
            icon.textContent = section.classList.contains('collapsed') ? '▲' : '▼';
        }
        
        console.log(`🔧 Section ${sectionId} toggled`);
        
        // Update card counts after toggle
        setTimeout(updateInfoCards, 100);
    }
};

// ===== FILTER CHANGE LISTENER =====

/**
 * Listen to filter changes and update cards
 */
if (window.filterSystem) {
    // Hook into filter system to update cards when filters change
    const originalApplyFilters = window.filterSystem.applyAllFilters;
    if (originalApplyFilters) {
        window.filterSystem.applyAllFilters = function() {
            originalApplyFilters.call(this);
            setTimeout(updateInfoCards, 100);
        };
    }
}

// Update cards periodically to catch filter changes
setInterval(updateInfoCards, 2000);

console.log('✅ test-header-only.js v4.0.0 initialization complete');
