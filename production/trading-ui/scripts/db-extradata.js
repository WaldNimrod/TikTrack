

// ===== FUNCTION INDEX =====
// === Functions ===
// - copyDetailedLogLocal() - Copydetailedloglocal
// - generateDetailedLog() - Generatedetailedlog
// - showTriggerDetails() - Showtriggerdetails
// - testTrigger() - Testtrigger

// === UI Functions ===
/**
 * showTriggerDetails - Showtriggerdetails
 *
 * @param {*} triggerId - Parameter description
 * @returns {{*}} Return description
 */
// - showTriggerDetails() - Showtriggerdetails

// === Other ===
/**
 * testTrigger - Testtrigger
 *
 * @param {*} triggerId - Parameter description
 * @returns {{*}} Return description
 */
// - testTrigger() - Testtrigger
/**
 * generateDetailedLog - Generatedetailedlog
 *
 * @returns {{*}} Return description
 */
// - generateDetailedLog() - Generatedetailedlog
/**
 * copyDetailedLogLocal - Copydetailedloglocal
 *
 * @returns {{*}} Return description
 */
// - copyDetailedLogLocal() - Copydetailedloglocal

// DB Extra Data Page Script
// document.addEventListener('DOMContentLoaded', function () {
//     console.log('טבלאות עזר - עמוד נטען');
//     // Filter system is handled by the unified initialization system
//     // No need to initialize manually
// });

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions


// Sorting functions

// Trigger functions
/**
 * showTriggerDetails - Showtriggerdetails
 *
 * @param {*} triggerId - Parameter description
 * @returns {{*}} Return description
 */
function showTriggerDetails(triggerId) {
    if (typeof window.showTriggerDetails === 'function') {
        window.showTriggerDetails(triggerId);
    } else {
        console.warn('showTriggerDetails function not found');
        console.log('Trigger details for:', triggerId);
    }
}

function testTrigger(triggerId) {
    if (typeof window.testTrigger === 'function') {
        window.testTrigger(triggerId);
    } else {
        console.warn('testTrigger function not found');
        console.log('Testing trigger:', triggerId);
    }
}

/**
 * Generate detailed log for Database Extra Data
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - טבלאות עזר ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // 1. מצב כללי של העמוד
    log.push('--- מצב כללי של העמוד ---');
    const sections = document.querySelectorAll('.content-section, .section');
    sections.forEach((section, index) => {
        const header = section.querySelector('.section-header, h2, h3');
        const body = section.querySelector('.section-body, .card-body');
        const isOpen = body && body.style.display !== 'none' && !section.classList.contains('collapsed');
        const title = header ? header.textContent.trim() : `סקשן ${index + 1}`;
        log.push(`  ${index + 1}. "${title}": ${isOpen ? 'פתוח' : 'סגור'}`);
    });

    // 2. טבלאות עזר
    log.push('');
    log.push('--- טבלאות עזר ---');
    const tables = document.querySelectorAll('.table, table');
    log.push(`מספר טבלאות: ${tables.length}`);
    tables.forEach((table, index) => {
        const rows = table.querySelectorAll('tbody tr');
        const caption = table.querySelector('caption')?.textContent.trim() || `טבלה ${index + 1}`;
        log.push(`  ${index + 1}. "${caption}": ${rows.length} שורות`);
    });

    // 3. טריגרים
    log.push('');
    log.push('--- טריגרים ---');
    const triggers = document.querySelectorAll('.trigger, [data-trigger]');
    log.push(`מספר טריגרים: ${triggers.length}`);
    triggers.forEach((trigger, index) => {
        const name = trigger.textContent.trim() || trigger.dataset.trigger || `טריגר ${index + 1}`;
        const visible = trigger.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`  ${index + 1}. "${name}" (${visible})`);
    });

    // 4. כפתורים וקונטרולים
    log.push('');
    log.push('--- כפתורים וקונטרולים ---');
    const buttonIds = [
        'showTriggerDetailsBtn', 'testTriggerBtn', 'refreshBtn', 'exportBtn'
    ];
    
    buttonIds.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const visible = btn.offsetParent !== null ? 'נראה' : 'לא נראה';
            const disabled = btn.disabled ? 'מבוטל' : 'פעיל';
            const text = btn.textContent.trim() || btn.value || 'ללא טקסט';
            log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
        }
    });

    // 5. מידע טכני
    log.push('');
    log.push('--- מידע טכני ---');
    log.push(`זמן יצירת הלוג: ${timestamp}`);
    log.push(`גרסת דפדפן: ${navigator.userAgent}`);
    log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
    log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
    
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        log.push(`זמן טעינת עמוד: ${loadTime}ms`);
    }
    
    if (navigator.deviceMemory) {
        log.push(`זיכרון זמין: ${navigator.deviceMemory}GB`);
    }
    
    log.push(`שפת דפדפן: ${navigator.language}`);
    log.push(`פלטפורמה: ${navigator.platform}`);

    // 6. שגיאות והערות מהקונסולה
    log.push('');
    log.push('--- שגיאות והערות מהקונסולה ---');
    log.push('⚠️ חשוב: הלוג המפורט חייב לכלול שגיאות קונסולה לאבחון בעיות');
    log.push('📋 הוראות: פתח את Developer Tools (F12) > Console');
    log.push('📋 העתק את כל השגיאות וההערות מהקונסולה');
    log.push('📋 הוסף אותן ללוג המפורט לפני שליחה');

    log.push('');
    log.push('=== סוף לוג ===');
    return log.join('\n');
}

// Local copyDetailedLog function for db-extradata page
async function copyDetailedLogLocal() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את כל מה שרואה המשתמש בעמוד', 4000, 'development');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('לוג מפורט הועתק ללוח', 'success');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        }
    } catch (error) {
        console.error('שגיאה בהעתקת הלוג המפורט:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for onclick attributes
// window.toggleSection removed - using global version from ui-utils.js
// window.toggleSection export removed - using global version from ui-utils.js
// window.sortTable export removed - using global version from tables.js
window.showTriggerDetails = showTriggerDetails;
window.testTrigger = testTrigger;
