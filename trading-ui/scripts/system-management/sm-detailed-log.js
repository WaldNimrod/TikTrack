/**
 * System Management Detailed Log Generator
 * =========================================
 * 
 * Generates comprehensive detailed log of all objects and UI elements
 * displayed to the user in the system management page
 * 
 * @version 1.0.0
 * @created November 30, 2025
 */

/**
 * Generate detailed log for system management page
 * יצירת לוג מפורט לעמוד ניהול המערכת
 * 
 * The log includes information about every object and element displayed to the user
 * הלוג כולל מידע על כל אובייקט ואלמנט המוצג למשתמש
 */
async function generateSystemManagementDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - ניהול מערכת TikTrack ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // 1. מצב כללי של העמוד
    log.push('--- מצב כללי של העמוד ---');
    const sections = document.querySelectorAll('.content-section, .top-section, [data-section]');
    log.push(`סה"כ סקשנים: ${sections.length}`);
    
    sections.forEach((section, index) => {
        const header = section.querySelector('.section-header .table-title');
        const body = section.querySelector('.section-body');
        const sectionId = section.getAttribute('data-section') || `section-${index}`;
        const isOpen = body && body.style.display !== 'none' && !section.classList.contains('collapsed');
        const title = header ? header.textContent.trim() : `סקשן ${index + 1}`;
        
        log.push(`  ${index + 1}. "${title}" (${sectionId}): ${isOpen ? 'פתוח' : 'סגור'}`);
        
        // מידע מפורט על כל סקשן
        if (body) {
            const cards = body.querySelectorAll('.card, .sm-stats-card, .sm-actions-card');
            const buttons = body.querySelectorAll('button');
            const tables = body.querySelectorAll('table');
            const links = body.querySelectorAll('a');
            
            log.push(`    כרטיסים: ${cards.length}`);
            log.push(`    כפתורים: ${buttons.length}`);
            log.push(`    טבלאות: ${tables.length}`);
            log.push(`    קישורים: ${links.length}`);
        }
    });

    // 2. מידע מפורט על כל כרטיס סטטיסטיקות
    log.push('');
    log.push('--- כרטיסי סטטיסטיקות (Stats Cards) ---');
    const statsCards = document.querySelectorAll('.sm-stats-card');
    statsCards.forEach((card, index) => {
        const title = card.querySelector('.card-header h5')?.textContent.trim() || 'ללא כותרת';
        const rows = card.querySelectorAll('.sm-stat-row');
        
        log.push(`  ${index + 1}. "${title}":`);
        log.push(`    שורות: ${rows.length}`);
        
        rows.forEach((row, rowIndex) => {
            const label = row.querySelector('.stat-label')?.textContent.trim() || 'ללא תווית';
            const value = row.querySelector('.stat-value')?.textContent.trim() || 'ללא ערך';
            const badge = row.querySelector('.badge')?.textContent.trim();
            
            log.push(`      ${rowIndex + 1}. ${label}: ${value}${badge ? ` (תג: ${badge})` : ''}`);
        });
    });

    // 3. מידע מפורט על כל כרטיס פעולות
    log.push('');
    log.push('--- כרטיסי פעולות (Actions Cards) ---');
    const actionsCards = document.querySelectorAll('.sm-actions-card');
    actionsCards.forEach((card, index) => {
        const title = card.querySelector('.card-header h5')?.textContent.trim() || 'ללא כותרת';
        const actionGroups = card.querySelectorAll('.sm-action-group');
        const buttons = card.querySelectorAll('button');
        
        log.push(`  ${index + 1}. "${title}":`);
        log.push(`    קבוצות פעולות: ${actionGroups.length}`);
        log.push(`    כפתורים כולל: ${buttons.length}`);
        
        actionGroups.forEach((group, groupIndex) => {
            const groupTitle = group.querySelector('.action-group-title')?.textContent.trim() || 'ללא כותרת';
            const groupButtons = group.querySelectorAll('button');
            
            log.push(`      קבוצה ${groupIndex + 1}: "${groupTitle}"`);
            groupButtons.forEach((btn, btnIndex) => {
                const btnText = btn.textContent.trim() || 'ללא טקסט';
                const btnDisabled = btn.disabled ? 'מבוטל' : 'פעיל';
                const btnVariant = btn.className.match(/btn-(\w+)/)?.[1] || 'לא ידוע';
                const onclick = btn.getAttribute('onclick') || btn.getAttribute('data-action') || 'ללא פעולה';
                
                log.push(`        ${btnIndex + 1}. "${btnText}": ${btnVariant} - ${btnDisabled} - ${onclick.substring(0, 50)}`);
            });
        });
    });

    // 4. מידע מפורט על Dashboard (Top Section)
    log.push('');
    log.push('--- Dashboard (סקשן עליון) ---');
    const dashboardContent = document.getElementById('sm-dashboard-content');
    if (dashboardContent) {
        const dashboardCards = dashboardContent.querySelectorAll('.sm-stats-card, .card');
        log.push(`  כרטיסי Dashboard: ${dashboardCards.length}`);
        
        dashboardCards.forEach((card, index) => {
            const title = card.querySelector('.card-header h5, .card-header h6')?.textContent.trim() || 'ללא כותרת';
            const rows = card.querySelectorAll('.sm-stat-row, .stat-row');
            
            log.push(`    כרטיס ${index + 1}: "${title}"`);
            log.push(`      שורות: ${rows.length}`);
            
            rows.forEach((row, rowIndex) => {
                const label = row.querySelector('.stat-label, [class*="label"]')?.textContent.trim() || '';
                const value = row.querySelector('.stat-value, [class*="value"]')?.textContent.trim() || '';
                const badge = row.querySelector('.badge')?.textContent.trim() || '';
                const icon = row.querySelector('i')?.className || '';
                
                if (label || value) {
                    log.push(`      שורה ${rowIndex + 1}: ${label}: ${value}${badge ? ` (תג: ${badge})` : ''}${icon ? ` (אייקון: ${icon})` : ''}`);
                }
            });
            
            // בדיקת כפתורים בכרטיס
            const cardButtons = card.querySelectorAll('button');
            if (cardButtons.length > 0) {
                log.push(`      כפתורים: ${cardButtons.length}`);
                cardButtons.forEach((btn, btnIndex) => {
                    const btnText = btn.textContent.trim() || 'ללא טקסט';
                    const btnDisabled = btn.disabled ? 'מבוטל' : 'פעיל';
                    log.push(`        ${btnIndex + 1}. "${btnText}": ${btnDisabled}`);
                });
            }
        });
    } else {
        log.push('  Dashboard content לא נמצא');
    }

    // 5. מידע מפורט על כל סקשן
    log.push('');
    log.push('--- מידע מפורט על כל סקשן ---');
    
    const sectionIds = [
        'sm-dashboard', 'sm-server', 'sm-cache', 'sm-performance',
        'sm-external-data', 'sm-alerts', 'sm-database',
        'sm-background-tasks', 'sm-operations', 'sm-system-settings'
    ];
    
    for (const sectionId of sectionIds) {
        const section = document.querySelector(`[data-section="${sectionId}"]`);
        if (!section) {
            log.push(`  ${sectionId}: לא נמצא`);
            continue;
        }
        
        const body = section.querySelector('.section-body');
        if (!body) {
            log.push(`  ${sectionId}: אין body`);
            continue;
        }
        
        const sectionTitle = section.querySelector('.section-header .table-title')?.textContent.trim() || sectionId;
        log.push(`  ${sectionId} ("${sectionTitle}"):`);
        
        // כרטיסים (כל סוגי הכרטיסים)
        const cards = body.querySelectorAll('.card, .sm-stats-card, .sm-actions-card');
        log.push(`    כרטיסים: ${cards.length}`);
        cards.forEach((card, cardIndex) => {
            const cardTitle = card.querySelector('.card-header h5, .card-header h6, .card-title')?.textContent.trim() || 'ללא כותרת';
            const cardBody = card.querySelector('.card-body');
            const cardType = card.classList.contains('sm-stats-card') ? 'Stats Card' : 
                           card.classList.contains('sm-actions-card') ? 'Actions Card' : 'Card';
            
            log.push(`      כרטיס ${cardIndex + 1} (${cardType}): "${cardTitle}"`);
            
            // שורות סטטיסטיקה (אם זה stats card)
            if (card.classList.contains('sm-stats-card')) {
                const rows = card.querySelectorAll('.sm-stat-row');
                if (rows.length > 0) {
                    log.push(`        שורות סטטיסטיקה: ${rows.length}`);
                    rows.forEach((row, rowIndex) => {
                        const label = row.querySelector('.stat-label')?.textContent.trim() || '';
                        const value = row.querySelector('.stat-value')?.textContent.trim() || '';
                        const badge = row.querySelector('.badge')?.textContent.trim() || '';
                        if (label || value) {
                            log.push(`          ${rowIndex + 1}. ${label}: ${value}${badge ? ` (${badge})` : ''}`);
                        }
                    });
                }
            }
            
            // קבוצות פעולות (אם זה actions card)
            if (card.classList.contains('sm-actions-card')) {
                const actionGroups = card.querySelectorAll('.sm-action-group');
                if (actionGroups.length > 0) {
                    log.push(`        קבוצות פעולות: ${actionGroups.length}`);
                    actionGroups.forEach((group, groupIndex) => {
                        const groupTitle = group.querySelector('.action-group-title')?.textContent.trim() || 'ללא כותרת';
                        const groupButtons = group.querySelectorAll('button');
                        log.push(`          קבוצה ${groupIndex + 1}: "${groupTitle}" - ${groupButtons.length} כפתורים`);
                    });
                }
            }
            
            if (cardBody) {
                // טבלאות בכרטיס
                const tables = cardBody.querySelectorAll('table');
                if (tables.length > 0) {
                    log.push(`        טבלאות: ${tables.length}`);
                    tables.forEach((table, tableIndex) => {
                        const rows = table.querySelectorAll('tbody tr');
                        const headers = table.querySelectorAll('thead th, thead td');
                        const caption = table.querySelector('caption')?.textContent.trim();
                        log.push(`          טבלה ${tableIndex + 1}: ${headers.length} עמודות, ${rows.length} שורות${caption ? ` ("${caption}")` : ''}`);
                        
                        // פרטי שורות (רק 5 ראשונות)
                        if (rows.length > 0) {
                            const maxRows = Math.min(5, rows.length);
                            for (let i = 0; i < maxRows; i++) {
                                const row = rows[i];
                                const cells = row.querySelectorAll('td, th');
                                const cellTexts = Array.from(cells).slice(0, 3).map(c => c.textContent.trim()).join(' | ');
                                log.push(`            שורה ${i + 1}: ${cellTexts}${cells.length > 3 ? '...' : ''}`);
                            }
                            if (rows.length > 5) {
                                log.push(`            ... ועוד ${rows.length - 5} שורות`);
                            }
                        }
                    });
                }
                
                // כפתורים בכרטיס
                const buttons = cardBody.querySelectorAll('button');
                if (buttons.length > 0) {
                    log.push(`        כפתורים: ${buttons.length}`);
                    buttons.forEach((btn, btnIndex) => {
                        const btnText = btn.textContent.trim() || 'ללא טקסט';
                        const btnDisabled = btn.disabled ? 'מבוטל' : 'פעיל';
                        const btnVariant = btn.className.match(/btn-(\w+)/)?.[1] || 'לא ידוע';
                        const onclick = btn.getAttribute('onclick') || btn.getAttribute('data-action') || '';
                        log.push(`          ${btnIndex + 1}. "${btnText}": ${btnVariant} - ${btnDisabled}${onclick ? ` - ${onclick.substring(0, 40)}` : ''}`);
                    });
                }
                
                // תגים (badges)
                const badges = cardBody.querySelectorAll('.badge');
                if (badges.length > 0) {
                    log.push(`        תגים: ${badges.length}`);
                    badges.forEach((badge, badgeIndex) => {
                        const badgeText = badge.textContent.trim();
                        const badgeVariant = badge.className.match(/bg-(\w+)/)?.[1] || 'לא ידוע';
                        log.push(`          ${badgeIndex + 1}. "${badgeText}": ${badgeVariant}`);
                    });
                }
                
                // רשימות (lists)
                const lists = cardBody.querySelectorAll('ul, ol, .sm-detail-list');
                if (lists.length > 0) {
                    log.push(`        רשימות: ${lists.length}`);
                    lists.forEach((list, listIndex) => {
                        const items = list.querySelectorAll('li, .detail-item');
                        log.push(`          רשימה ${listIndex + 1}: ${items.length} פריטים`);
                    });
                }
            }
        });
        
        // כפתורים ישירים בסקשן (לא בתוך כרטיסים)
        const sectionButtons = body.querySelectorAll('button:not(.card button):not(.sm-stats-card button):not(.sm-actions-card button)');
        if (sectionButtons.length > 0) {
            log.push(`    כפתורים ישירים: ${sectionButtons.length}`);
            sectionButtons.forEach((btn, btnIndex) => {
                const btnText = btn.textContent.trim() || 'ללא טקסט';
                const btnDisabled = btn.disabled ? 'מבוטל' : 'פעיל';
                log.push(`      ${btnIndex + 1}. "${btnText}": ${btnDisabled}`);
            });
        }
        
        // קישורים
        const links = body.querySelectorAll('a:not(.card a):not(.sm-stats-card a):not(.sm-actions-card a)');
        if (links.length > 0) {
            log.push(`    קישורים: ${links.length}`);
            links.forEach((link, linkIndex) => {
                const linkText = link.textContent.trim() || 'ללא טקסט';
                const linkHref = link.getAttribute('href') || 'ללא קישור';
                log.push(`      ${linkIndex + 1}. "${linkText}": ${linkHref}`);
            });
        }
        
        // טפסים (forms)
        const forms = body.querySelectorAll('form');
        if (forms.length > 0) {
            log.push(`    טפסים: ${forms.length}`);
            forms.forEach((form, formIndex) => {
                const inputs = form.querySelectorAll('input, select, textarea');
                log.push(`      טופס ${formIndex + 1}: ${inputs.length} שדות`);
            });
        }
    }

    // 6. מידע על System Management Main Instance
    log.push('');
    log.push('--- System Management Main Instance ---');
    if (window.SystemManagementMain && window.SystemManagementMain.instance) {
        const main = window.SystemManagementMain.instance;
        log.push(`  SystemManagementMain initialized: ${main.isInitialized ? 'כן' : 'לא'}`);
        log.push(`  Sections registered: ${main.sections.size}`);
        
        main.sections.forEach((section, sectionId) => {
            log.push(`    ${sectionId}: ${section.constructor.name}`);
        });
    } else {
        log.push('  SystemManagementMain instance לא נמצא');
    }

    // 7. מידע על כל Section Instances
    log.push('');
    log.push('--- Section Instances ---');
    const sectionClasses = [
        'SMDashboardSection', 'SMServerSection', 'SMCacheSection',
        'SMPerformanceSection', 'SMExternalDataSection', 'SMAlertsSection',
        'SMDatabaseSection', 'SMBackgroundTasksSection', 'SMOperationsSection',
        'SMSystemSettingsSection'
    ];
    
    sectionClasses.forEach(className => {
        if (window[className]) {
            log.push(`  ${className}: זמין`);
        } else {
            log.push(`  ${className}: לא זמין`);
        }
    });

    // 8. כפתורים בכותרת הסקשן העליון
    log.push('');
    log.push('--- כפתורים בכותרת הסקשן העליון ---');
    const topSection = document.querySelector('.top-section[data-section="top"]');
    if (topSection) {
        const headerActions = topSection.querySelector('.table-actions');
        if (headerActions) {
            const quickLinks = headerActions.querySelectorAll('.quick-links a');
            const toggleButton = headerActions.querySelector('button[data-onclick*="toggleAllSections"]');
            const copyLogButton = headerActions.querySelector('.copy-detailed-log-btn');
            
            log.push(`  קישורים מהירים: ${quickLinks.length}`);
            quickLinks.forEach((link, index) => {
                const linkText = link.textContent.trim();
                const linkHref = link.getAttribute('href');
                log.push(`    ${index + 1}. "${linkText}": ${linkHref}`);
            });
            
            if (copyLogButton) {
                const copyText = copyLogButton.textContent.trim();
                const copyDisabled = copyLogButton.disabled ? 'מבוטל' : 'פעיל';
                log.push(`  כפתור העתק לוג מפורט: "${copyText}" - ${copyDisabled}`);
            }
            
            if (toggleButton) {
                const toggleText = toggleButton.getAttribute('data-text') || toggleButton.textContent.trim();
                log.push(`  כפתור Toggle: "${toggleText}"`);
            }
        }
    }

    // 9. טבלאות בממשק
    log.push('');
    log.push('--- טבלאות בממשק ---');
    const allTables = document.querySelectorAll('table');
    log.push(`  סה"כ טבלאות: ${allTables.length}`);
    
    allTables.forEach((table, index) => {
        const headers = table.querySelectorAll('thead th, thead td');
        const rows = table.querySelectorAll('tbody tr');
        const caption = table.querySelector('caption')?.textContent.trim();
        
        log.push(`  טבלה ${index + 1}:`);
        if (caption) log.push(`    כותרת: "${caption}"`);
        log.push(`    עמודות: ${headers.length}`);
        log.push(`    שורות: ${rows.length}`);
        
        if (headers.length > 0) {
            const headerTexts = Array.from(headers).map(h => h.textContent.trim()).join(', ');
            log.push(`    עמודות: ${headerTexts}`);
        }
    });

    // 10. מידע על API Calls ו-Data
    log.push('');
    log.push('--- מידע על נתונים מוצגים ---');
    
    // נסה לקבל נתונים מכל הסקשנים
    if (window.SystemManagementMain && window.SystemManagementMain.instance) {
        const main = window.SystemManagementMain.instance;
        main.sections.forEach((section, sectionId) => {
            if (section.data) {
                log.push(`  ${sectionId}:`);
                log.push(`    יש נתונים: כן`);
                log.push(`    סוג נתונים: ${typeof section.data}`);
                
                // נסה להציג סיכום של הנתונים
                if (typeof section.data === 'object') {
                    const keys = Object.keys(section.data);
                    log.push(`    מפתחות: ${keys.join(', ')}`);
                }
            } else {
                log.push(`  ${sectionId}: אין נתונים`);
            }
        });
    }

    // 11. מידע טכני
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
    
    if (window.performance && window.performance.memory) {
        const memoryUsed = Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024);
        log.push(`זיכרון JavaScript בשימוש: ${memoryUsed}MB`);
    }

    // 12. שגיאות והערות מהקונסולה
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

/**
 * Copy detailed log to clipboard
 * העתקת לוג מפורט ללוח
 */
async function copySystemManagementDetailedLog() {
    try {
        const copyBtn = document.querySelector('.copy-detailed-log-btn');
        if (copyBtn) {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מייצר לוג...';
            copyBtn.disabled = true;
            
            try {
                const detailedLog = await generateSystemManagementDetailedLog();
                
                if (detailedLog) {
                    await navigator.clipboard.writeText(detailedLog);
                    
                    if (typeof window.showSuccessNotification === 'function') {
                        window.showSuccessNotification(
                            'לוג מפורט הועתק ללוח',
                            'הלוג מכיל את כל מה שרואה המשתמש בעמוד ניהול המערכת'
                        );
                    } else if (typeof window.showNotification === 'function') {
                        window.showNotification('לוג מפורט הועתק ללוח', 'success');
                    } else {
                        alert('לוג מפורט הועתק ללוח!');
                    }
                    
                    console.log('✅ Detailed log copied to clipboard');
                }
            } finally {
                copyBtn.innerHTML = originalText;
                copyBtn.disabled = false;
            }
        } else {
            // Fallback if button not found
            const detailedLog = await generateSystemManagementDetailedLog();
            if (detailedLog) {
                await navigator.clipboard.writeText(detailedLog);
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

// Export functions to global scope
window.generateSystemManagementDetailedLog = generateSystemManagementDetailedLog;
window.copySystemManagementDetailedLog = copySystemManagementDetailedLog;


