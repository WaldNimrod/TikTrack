/**
 * Designs Page Script - TikTrack
 * ==============================
 * 
 * JavaScript functionality for the designs page
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 2025
 */


// ===== FUNCTION INDEX =====

// === Data Functions ===
// - getColumns() - Getcolumns

// === Other ===
// - generateDetailedLog() - Generatedetailedlog


/**
 * Toggle all sections visibility
 */

/**
 * Toggle specific section visibility
 */

/**
 * Generate detailed log for Designs page
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - עמוד עיצובים ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // סטטוס כללי
    log.push('--- סטטוס כללי ---');
    const topSection = document.querySelector('.top-section .section-body');
    const isTopOpen = topSection && topSection.style.display !== 'none';
    log.push(`סקשן עליון: ${isTopOpen ? 'פתוח' : 'סגור'}`);
    
    // תצוגה מפורטת לפי סקשנים
    log.push('--- תצוגה מפורטת לפי סקשנים ---');
    
    // סקשן עליון
    log.push(`סקשן עליון: ${isTopOpen ? 'פתוח' : 'סגור'}`);
    const topContent = topSection?.textContent || 'אין תוכן';
    log.push(`  תוכן: "${topContent}"`);

    // סקשן 1
    const section1 = document.getElementById('section1');
    if (section1) {
        const isSection1Open = section1.querySelector('.section-body')?.style.display !== 'none';
        log.push(`סקשן 1: ${isSection1Open ? 'פתוח' : 'סגור'}`);
        const section1Content = section1.querySelector('.section-body')?.textContent || 'אין תוכן';
        log.push(`  תוכן: "${section1Content}"`);
    }

    // סקשן 2
    const section2 = document.getElementById('section2');
    if (section2) {
        const isSection2Open = section2.querySelector('.section-body')?.style.display !== 'none';
        log.push(`סקשן 2: ${isSection2Open ? 'פתוח' : 'סגור'}`);
        const section2Content = section2.querySelector('.section-body')?.textContent || 'אין תוכן';
        log.push(`  תוכן: "${section2Content}"`);
    }

    // סקשן 3
    const section3 = document.getElementById('section3');
    if (section3) {
        const isSection3Open = section3.querySelector('.section-body')?.style.display !== 'none';
        log.push(`סקשן 3: ${isSection3Open ? 'פתוח' : 'סגור'}`);
        const section3Content = section3.querySelector('.section-body')?.textContent || 'אין תוכן';
        log.push(`  תוכן: "${section3Content}"`);
    }

    // סטטיסטיקות וביצועים
    log.push('--- סטטיסטיקות וביצועים ---');
    log.push(`זמן טעינת עמוד: ${Date.now() - performance.timing.navigationStart}ms`);
    if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        log.push(`זיכרון בשימוש: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    }

    // לוגים ושגיאות
    log.push('--- לוגים ושגיאות ---');
    if (window.consoleLogs && window.consoleLogs.length > 0) {
        const recentLogs = window.consoleLogs.slice(-10);
        recentLogs.forEach(entry => {
            log.push(`[${entry.timestamp}] ${entry.level}: ${entry.message}`);
        });
    } else {
        log.push('אין לוגים זמינים');
    }

    // מידע טכני
    log.push('--- מידע טכני ---');
    log.push(`User Agent: ${navigator.userAgent}`);
    log.push(`Language: ${navigator.language}`);
    log.push(`Platform: ${navigator.platform}`);

    log.push('=== סוף הלוג ===');
    return log.join('\n');
}

/**
 * Register designs page tables with UnifiedTableSystem
 * This function registers all tables on the designs page for unified sorting and filtering
 */
window.registerDesignsTables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { page: "designs" });
        return;
    }

    // Get column mappings from table-mappings.js
    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    // Register button-system table
    const buttonSystemTable = document.getElementById('buttonSystemTable');
    if (buttonSystemTable) {
        window.UnifiedTableSystem.registry.register('button-system', {
            dataGetter: () => {
                // Get data from table body if available
                const tbody = buttonSystemTable.querySelector('tbody');
                if (!tbody) return [];
                
                // Extract data from table rows
                const rows = Array.from(tbody.querySelectorAll('tr'));
                return rows.map(row => {
                    const cells = row.querySelectorAll('td');
                    return {
                        id: cells[0]?.textContent?.trim() || '',
                        name: cells[1]?.textContent?.trim() || '',
                        description: cells[2]?.textContent?.trim() || '',
                        // Add more fields as needed
                    };
                });
            },
            updateFunction: (data) => {
                // Update table if needed
                if (typeof window.updateButtonSystemTable === 'function') {
                    window.updateButtonSystemTable(data);
                }
            },
            tableSelector: '#buttonSystemTable',
            columns: getColumns('button-system') || [],
            sortable: true,
            filterable: true,
        });
    }

    // Register color-tokens table
    const colorTokensTable = document.getElementById('colorTokensTable');
    if (colorTokensTable) {
        window.UnifiedTableSystem.registry.register('color-tokens', {
            dataGetter: () => {
                const tbody = colorTokensTable.querySelector('tbody');
                if (!tbody) return [];
                
                const rows = Array.from(tbody.querySelectorAll('tr'));
                return rows.map(row => {
                    const cells = row.querySelectorAll('td');
                    return {
                        group: cells[0]?.textContent?.trim() || '',
                        name: cells[1]?.textContent?.trim() || '',
                        identifier: cells[2]?.textContent?.trim() || '',
                        value: cells[3]?.textContent?.trim() || '',
                        details: cells[4]?.textContent?.trim() || '',
                    };
                });
            },
            updateFunction: (data) => {
                if (typeof window.updateColorTokensTable === 'function') {
                    window.updateColorTokensTable(data);
                }
            },
            tableSelector: '#colorTokensTable',
            columns: getColumns('color-tokens') || [],
            sortable: true,
            filterable: true,
        });
    }

    // Register entity-colors table
    const entityColorsTable = document.querySelector('table[data-table-type="entity-colors"]');
    if (entityColorsTable) {
        window.UnifiedTableSystem.registry.register('entity-colors', {
            dataGetter: () => {
                const tbody = entityColorsTable.querySelector('tbody');
                if (!tbody) return [];
                
                const rows = Array.from(tbody.querySelectorAll('tr'));
                return rows.map(row => {
                    const cells = row.querySelectorAll('td');
                    return {
                        button: cells[0]?.textContent?.trim() || '',
                        ticker: cells[1]?.textContent?.trim() || '',
                        trade: cells[2]?.textContent?.trim() || '',
                        trade_plan: cells[3]?.textContent?.trim() || '',
                        alert: cells[4]?.textContent?.trim() || '',
                    };
                });
            },
            updateFunction: (data) => {
                if (typeof window.updateEntityColorsTable === 'function') {
                    window.updateEntityColorsTable(data);
                }
            },
            tableSelector: 'table[data-table-type="entity-colors"]',
            columns: getColumns('entity-colors') || [],
            sortable: true,
            filterable: true,
        });
    }

    window.Logger?.info('✅ Designs tables registered with UnifiedTableSystem', { 
        page: "designs",
        tables: ['button-system', 'color-tokens', 'entity-colors']
    });
};

// Register tables when DOM is ready and UnifiedTableSystem is available
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for UnifiedTableSystem
        const waitForUnifiedTableSystem = setInterval(() => {
            if (window.UnifiedTableSystem && typeof window.registerDesignsTables === 'function') {
                window.registerDesignsTables();
                clearInterval(waitForUnifiedTableSystem);
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(waitForUnifiedTableSystem);
        }, 5000);
    });
} else {
    // DOM already loaded
    if (window.UnifiedTableSystem && typeof window.registerDesignsTables === 'function') {
        window.registerDesignsTables();
    } else {
        // Wait for UnifiedTableSystem
        const waitForUnifiedTableSystem = setInterval(() => {
            if (window.UnifiedTableSystem && typeof window.registerDesignsTables === 'function') {
                window.registerDesignsTables();
                clearInterval(waitForUnifiedTableSystem);
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(waitForUnifiedTableSystem);
        }, 5000);
    }
}
