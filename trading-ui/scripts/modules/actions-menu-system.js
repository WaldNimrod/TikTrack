/**
 * Actions Menu System
 * Manages hover-based popup menus for table actions
 * 
 * File: trading-ui/scripts/modules/actions-menu-system.js
 * Version: 1.0
 * Created: January 13, 2025
 * 
 * Features:
 * - Pure CSS hover (no JavaScript delays needed)
 * - Auto-positioning (RTL aware)
 * - Material Design
 * - Supports 2-5 buttons dynamically
 * 
 * Usage:
 * System initializes automatically on DOMContentLoaded.
 * No manual initialization needed.
 */

class ActionsMenuSystem {
    constructor() {
        this.init();
    }

    init() {
        if (window.consoleCleanup && typeof window.consoleCleanup.debug === 'function') {
            window.consoleCleanup.debug('✅ Actions Menu System initialized');
        } else {
            console.log('✅ Actions Menu System initialized');
        }
        (window.consoleCleanup?.debug || console.log)('   → CSS-based hover (no JavaScript delays)');
        (window.consoleCleanup?.debug || console.log)('   → RTL aware positioning');
        (window.consoleCleanup?.debug || console.log)('   → Supports 2-5 buttons dynamically');
        
        // מערכת פשוטה - הכל נעשה ב-CSS עם :hover
        // ה-JavaScript רק למקרים מיוחדים (אם צריך positioning דינמי)
        
        // יכול להוסיף event listeners למקרים מיוחדים אם צריך:
        // - מניעת סגירה בלחיצה על כפתור
        // - keyboard navigation
        // - touch events למובייל
        
        this.initAccessibility();
        this.attachLinkedItemsDebugLogger();
    }
    
    /**
     * אתחול נגישות - keyboard navigation
     */
    initAccessibility() {
        // תמיכה ב-keyboard navigation (Escape לסגירה)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // סגירת כל הפופאפים הפתוחים
                const openPopups = document.querySelectorAll('.actions-menu-popup.active');
                openPopups.forEach(popup => {
                    popup.classList.remove('active');
                });
            }
        });
    }

    /**
     * הוספת לוגים לקליק על כפתורי "אלמנטים מקושרים" בתוך תפריט פעולות
     * מזהה כפתורים המכילים את האירוע viewLinkedItemsFor* ומדווח על entity/id
     */
    attachLinkedItemsDebugLogger() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!target) return;

            // נאתר כפתור בתוך popup של תפריט פעולות
            const menuWrapper = target.closest('.actions-menu-wrapper');
            if (!menuWrapper) return;

            const btnEl = target.closest('button');
            if (!btnEl) return;

            const onclickAttr = btnEl.getAttribute('onclick') || '';
            const isLinkedBtn = /showLinkedItemsModal\(|viewLinkedItemsFor|openLinkedItemsModal\(/.test(onclickAttr);
            if (!isLinkedBtn) return;
            // נעדיף לחלץ פרמטרים מתוך הקריאה ל-showLinkedItemsModal אם קיימת
            const showArgs = onclickAttr.match(/showLinkedItemsModal\s*\(([^)]*)\)/);
            const genericArgs = onclickAttr.match(/\(([^)]*)\)/g);
            let arg = '';
            if (showArgs && showArgs[1] !== undefined) {
                const parts = showArgs[1].split(',').map(s => s.trim().replace(/['"`]/g, ''));
                arg = parts.length ? parts[parts.length - 1] : '';
            } else if (genericArgs && genericArgs.length > 0) {
                // קח את קבוצת הסוגריים האחרונה (לרוב זו של הקריאה האמיתית)
                const last = genericArgs[genericArgs.length - 1];
                const inner = last.slice(1, -1); // הסר סוגריים
                const parts = inner.split(',').map(s => s.trim().replace(/['"`]/g, ''));
                arg = parts.length ? parts[parts.length - 1] : '';
            }

            const actionsCell = btnEl.closest('.actions-cell');
            const entityId = actionsCell?.dataset?.entityId || arg || '';

            const logFn = (window.consoleCleanup?.info || console.log);
            logFn(`🔗 [LinkedItems] Click detected:`, {
                onclick: onclickAttr,
                detectedEntityId: entityId,
                actionsCellDataset: actionsCell?.dataset || {}
            });

            if (!entityId) {
                (window.consoleCleanup?.error || console.error)(`❌ [LinkedItems] לא נמצא מזהה ישות בתא הפעולות או באירוע.`);
            }
        }, true);
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.actionsMenuSystem = new ActionsMenuSystem();
    });
} else {
    window.actionsMenuSystem = new ActionsMenuSystem();
}

