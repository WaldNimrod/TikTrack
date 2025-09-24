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

console.log('🎨 Designs page script loaded');

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
 * Copy detailed log to clipboard
 */

// ===== GLOBAL FUNCTION EXPORTS =====

// window.toggleAllSections export removed - using global version from ui-utils.js
// window.toggleSection export removed - using global version from ui-utils.js
// window.copyDetailedLog export removed - using global version from system-management.js

console.log('✅ Designs page script ready');
