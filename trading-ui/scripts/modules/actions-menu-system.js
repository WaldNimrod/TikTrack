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

// הגדרת פונקציה גלובלית לבדיקה מיידית - זמינה מיד
console.log('🔧 ActionsMenuSystem: מגדיר את debugActionsMenu באופן גלובלי');

// וידוא שהפונקציה מוגדרת מיד
if (typeof window.debugActionsMenu === 'undefined') {
    console.log('🔧 ActionsMenuSystem: מגדיר debugActionsMenu לראשונה');
    window.debugActionsMenu = () => {
    const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
    console.log(`🔍 מצאתי ${allWrappers.length} actions menu wrappers`);
    
    allWrappers.forEach((wrapper, index) => {
        const popup = wrapper.querySelector('.actions-menu-popup');
        const actionsCell = wrapper.closest('.actions-cell');
        const tableRow = wrapper.closest('tr');
        
        if (!popup || !actionsCell || !tableRow) return;
        
        console.log(`\n📊 Actions Menu ${index + 1}:`);
        
        // בדיקת styles בפועל
        const popupStyle = window.getComputedStyle(popup);
        const cellStyle = window.getComputedStyle(actionsCell);
        const rowStyle = window.getComputedStyle(tableRow);
        
        console.log('Popup styles:', {
            zIndex: popupStyle.zIndex,
            position: popupStyle.position,
            opacity: popupStyle.opacity,
            visibility: popupStyle.visibility,
            pointerEvents: popupStyle.pointerEvents,
            transform: popupStyle.transform
        });
        
        // בדיקה מקיפה של z-index במיקום הפופאפ
        const popupRect = popup.getBoundingClientRect();
        const popupCenterX = popupRect.left + popupRect.width / 2;
        const popupCenterY = popupRect.top + popupRect.height / 2;
        
        // מציאת אלמנטים עם z-index גבוה יותר במיקום הפופאפ
        const elementsAtPoint = document.elementsFromPoint(popupCenterX, popupCenterY);
        const higherZIndexElements = [];
        
        elementsAtPoint.forEach((element, index) => {
            if (element === popup) return;
            
            const elementStyle = window.getComputedStyle(element);
            const elementZIndex = parseInt(elementStyle.zIndex) || 0;
            
            if (elementZIndex >= 956) { // גבוה מ-actions menu popup (955-956)
                higherZIndexElements.push({
                    tagName: element.tagName,
                    className: element.className,
                    id: element.id,
                    zIndex: elementZIndex,
                    depth: index,
                    rect: element.getBoundingClientRect()
                });
            }
        });
        
        if (higherZIndexElements.length > 0) {
            console.log('⚠️ אלמנטים עם z-index גבוה מ-955 במיקום הפופאפ:', higherZIndexElements);
        }
        
        console.log('Actions Cell styles:', {
            zIndex: cellStyle.zIndex,
            position: cellStyle.position,
            overflow: cellStyle.overflow
        });
        
        console.log('Table Row styles:', {
            zIndex: rowStyle.zIndex,
            position: rowStyle.position,
            transform: rowStyle.transform,
            boxShadow: rowStyle.boxShadow
        });
        
        // בדיקת מיקומים - popupRect כבר מוגדר למעלה
        const cellRect = actionsCell.getBoundingClientRect();
        const rowRect = tableRow.getBoundingClientRect();
        
        // חישוב גבהים
        const rowHeight = Math.round(rowRect.bottom - rowRect.top);
        const cellHeight = Math.round(cellRect.bottom - cellRect.top);
        const popupHeight = Math.round(popupRect.bottom - popupRect.top);
        
        console.log('📏 גבהים:');
        console.log(`   שורה: ${rowHeight}px`);
        console.log(`   תא פעולות: ${cellHeight}px`);
        console.log(`   תפריט פעולות: ${popupHeight}px`);
        
        console.log('מיקומים בפועל:');
        console.log('Popup:', {
            top: Math.round(popupRect.top),
            bottom: Math.round(popupRect.bottom),
            left: Math.round(popupRect.left),
            right: Math.round(popupRect.right),
            width: Math.round(popupRect.width),
            height: popupHeight
        });
        
        console.log('Cell:', {
            top: Math.round(cellRect.top),
            bottom: Math.round(cellRect.bottom),
            height: cellHeight
        });
        
        console.log('Row:', {
            top: Math.round(rowRect.top),
            bottom: Math.round(rowRect.bottom),
            height: rowHeight
        });
    });
    
    console.log('\n💡 טיפ: הרץ את הפקודה הזו כשהתפריט פתוח (hover) כדי לראות את המיקומים במצב פתוח');
    
    // בדיקה נוספת - האם יש popups שמוצגים?
    const visiblePopups = [];
    allWrappers.forEach((wrapper, index) => {
        const popup = wrapper.querySelector('.actions-menu-popup');
        if (popup) {
            const style = window.getComputedStyle(popup);
            if (style.opacity !== '0' && style.visibility !== 'hidden') {
                visiblePopups.push({index: index + 1, opacity: style.opacity, visibility: style.visibility});
            }
        }
    });
    
    if (visiblePopups.length > 0) {
        console.log('🎯 Popups הנראים כרגע:', visiblePopups);
    } else {
        console.log('ℹ️ אין popups נראים כרגע (זה נורמלי כשמעכברים מחוץ ל-actions menu)');
    }
    };
} // סיום של ה-if שהתחיל בשורה 24

// פונקציה נוספת לבדיקת hover state בזמן אמת
window.debugActionsMenuHover = () => {
    const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
    console.log('🔍 בדיקת hover state ל-actions menus...');
    
    allWrappers.forEach((wrapper, index) => {
        const popup = wrapper.querySelector('.actions-menu-popup');
        if (popup) {
            const rect = popup.getBoundingClientRect();
            const style = window.getComputedStyle(popup);
            
            // בדיקה אם הפופאפ נראה
            const isVisible = style.opacity !== '0' && 
                             style.visibility !== 'hidden' && 
                             rect.width > 0 && 
                             rect.height > 0;
            
            if (isVisible) {
                console.log(`✅ Actions Menu ${index + 1} נראה:`);
                console.log(`   Opacity: ${style.opacity}`);
                console.log(`   Visibility: ${style.visibility}`);
                console.log(`   Size: ${rect.width}x${rect.height}`);
            }
        }
    });
};

// פונקציה לבדיקת overflow - מה שמסתיר את התפריט
window.debugActionsMenuOverflow = () => {
    const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
    console.log('🔍 בדיקת overflow - מה מסתיר את התפריט...');
    
    allWrappers.forEach((wrapper, index) => {
        const popup = wrapper.querySelector('.actions-menu-popup');
        if (!popup) return;
        
        // בדיקה של כל ההורים עד הטבלה
        const checkOverflow = (element, path = '') => {
            if (!element) return;
            
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            const tagName = element.tagName.toLowerCase();
            const className = element.className || 'no-class';
            
            console.log(`${path}${tagName}.${className}:`, {
                overflow: style.overflow,
                overflowX: style.overflowX,
                overflowY: style.overflowY,
                position: style.position,
                zIndex: style.zIndex,
                clip: style.clip,
                clipPath: style.clipPath
            });
            
            // המשך בדיקה של ההורה
            if (element.parentElement && element !== document.body) {
                checkOverflow(element.parentElement, path + '  ');
            }
        };
        
        console.log(`\n📊 Actions Menu ${index + 1} - בדיקת overflow:`);
        checkOverflow(popup, '');
    });
};

console.log('✅ ActionsMenuSystem: debugActionsMenu מוגדרת וזמינה');

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
        (window.consoleCleanup?.debug || console.log)('   → Integrated with new button system');
        
        // מערכת פשוטה - הכל נעשה ב-CSS עם :hover
        // ה-JavaScript רק למקרים מיוחדים (אם צריך positioning דינמי)
        
        // יכול להוסיף event listeners למקרים מיוחדים אם צריך:
        // - מניעת סגירה בלחיצה על כפתור
        // - keyboard navigation
        // - touch events למובייל
        
        this.initAccessibility();
        this.attachLinkedItemsDebugLogger();
        this.attachZIndexDebugLogger();
    }

    /**
     * Convert regular action buttons to dropdown menu
     * @param {HTMLElement} actionsCell - The actions cell containing buttons
     * @returns {string} - HTML for the dropdown menu
     */
    createActionsMenu(buttons) {
        if (!buttons || buttons.length === 0) return '';
        
        const menuButtons = buttons.map(button => {
            // Handle both DOM elements and objects
            let buttonType, variant, onclick, text, title;
            
            if (button.getAttribute && typeof button.getAttribute === 'function') {
                // DOM element
                buttonType = button.getAttribute('data-button-type') || 'BUTTON';
                variant = button.getAttribute('data-variant') || 'small';
                onclick = button.getAttribute('data-onclick') || '';
                text = button.getAttribute('data-text') || '';
                title = button.getAttribute('title') || '';
            } else if (typeof button === 'object') {
                // Object with properties
                buttonType = button.type || 'BUTTON';
                variant = button.variant || 'small';
                onclick = button.onclick || '';
                text = button.text || '';
                title = button.title || '';
            } else {
                // Fallback
                buttonType = 'BUTTON';
                variant = 'small';
                onclick = '';
                text = '';
                title = '';
            }
            
            // Get icon based on button type
            let icon = '';
            switch(buttonType) {
                case 'LINK': icon = '🔗'; break;
                case 'EDIT': icon = '✏️'; break;
                case 'DELETE': icon = '🗑️'; break;
                case 'VIEW': icon = '👁️'; break;
                default: icon = '⚙️'; break;
            }
            
            return `<button class="btn" data-variant="small" data-button-type="${buttonType}" onclick="${onclick}" title="${title}">${icon}</button>`;
        }).join('');
        
        return `
            <div class="actions-menu-wrapper">
                <button class="btn actions-trigger" title="פעולות">⚙️</button>
                <div class="actions-menu-popup">
                    ${menuButtons}
                </div>
            </div>
        `;
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

    /**
     * מיקום התפריט הנפתח
     */
    positionPopup(wrapper) {
        const popup = wrapper.querySelector('.actions-menu-popup');
        const trigger = wrapper.querySelector('.actions-trigger');
        
        // Debug logs removed - system working correctly
        
        if (!popup || !trigger) {
            console.log('❌ [Actions Menu Debug] Missing popup or trigger');
            return;
        }
        
        const triggerRect = trigger.getBoundingClientRect();
        console.log('🔧 [Actions Menu Debug] Trigger rect:', triggerRect);
        
        // מיקום התפריט מימין לכפתור (לכיוון מרכז הטבלה)
        // מיקום קרוב מאוד לכפתור ועוד יותר גבוה
        popup.style.top = `${triggerRect.top - 12}px`; // 12px יותר גבוה (במקום 8px)
        popup.style.left = `${triggerRect.right - 2}px`; // 2px חופף לכפתור (במקום 1px)
        
        console.log('🔧 [Actions Menu Debug] Popup positioned at:', {
            top: popup.style.top,
            left: popup.style.left
        });
    }

    /**
     * הוספת לוגים לבדיקת z-index כשהתפריט נפתח
     */
    attachZIndexDebugLogger() {
        // הפונקציה debugActionsMenu כבר מוגדרת בתחילת הקובץ
        
        // נוסיף event listener פשוט יותר - עם בדיקת בטיחות
        document.addEventListener('mouseenter', (e) => {
            if (e.target && typeof e.target.closest === 'function' && e.target.closest('.actions-menu-wrapper')) {
                console.log('🎯 [Actions Menu Debug] Mouse entered actions menu');
                const wrapper = e.target.closest('.actions-menu-wrapper');
                const popup = wrapper.querySelector('.actions-menu-popup');
                console.log('🔍 [Actions Menu Debug] Popup element:', popup);
                console.log('🔍 [Actions Menu Debug] Popup styles:', {
                    opacity: popup.style.opacity,
                    visibility: popup.style.visibility,
                    display: popup.style.display
                });
                console.log('🔍 [Actions Menu Debug] Wrapper HTML:', wrapper.innerHTML);
                this.positionPopup(wrapper);
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            if (e.target && typeof e.target.closest === 'function' && e.target.closest('.actions-menu-wrapper')) {
                console.log('🎯 [Actions Menu Debug] Mouse left actions menu');
            }
        }, true);
        
        console.log('✅ Actions Menu Debug Logger הותקן. הרץ debugActionsMenu() כדי לבדוק');
        
        // קוד קונסולה לבדיקת z-index וחתיכה
        window.debugActionsMenuZIndex = () => {
            console.log('🔍 בדיקת z-index וחתיכה של התפריט...');
            
            const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
            console.log(`מצאתי ${allWrappers.length} actions menu wrappers`);
            
            allWrappers.forEach((wrapper, index) => {
                const popup = wrapper.querySelector('.actions-menu-popup');
                const actionsCell = wrapper.closest('.actions-cell');
                const tableRow = wrapper.closest('tr');
                const table = wrapper.closest('table');
                
                if (!popup || !actionsCell || !tableRow || !table) return;
                
                console.log(`\n=== Actions Menu ${index + 1} ===`);
                
                // בדיקת z-index
                const popupStyle = window.getComputedStyle(popup);
                const cellStyle = window.getComputedStyle(actionsCell);
                const rowStyle = window.getComputedStyle(tableRow);
                const tableStyle = window.getComputedStyle(table);
                
                console.log('Z-Index Values:');
                console.log(`  Popup: ${popupStyle.zIndex} (${popupStyle.position})`);
                console.log(`  Actions Cell: ${cellStyle.zIndex} (${cellStyle.position})`);
                console.log(`  Table Row: ${rowStyle.zIndex} (${rowStyle.position})`);
                console.log(`  Table: ${tableStyle.zIndex} (${tableStyle.position})`);
                
                // בדיקת overflow
                console.log('Overflow Values:');
                console.log(`  Actions Cell: ${cellStyle.overflow}`);
                console.log(`  Table Row: ${rowStyle.overflow}`);
                console.log(`  Table: ${tableStyle.overflow}`);
                
                // בדיקת stacking context
                const stackingContexts = [];
                let element = popup;
                while (element && element !== document.body) {
                    const style = window.getComputedStyle(element);
                    if (style.position !== 'static' || style.zIndex !== 'auto' || 
                        style.opacity !== '1' || style.transform !== 'none' ||
                        style.filter !== 'none' || style.willChange !== 'auto') {
                        stackingContexts.push({
                            element: element.tagName + (element.className ? '.' + element.className.split(' ').join('.') : ''),
                            position: style.position,
                            zIndex: style.zIndex,
                            opacity: style.opacity,
                            transform: style.transform,
                            filter: style.filter,
                            willChange: style.willChange
                        });
                    }
                    element = element.parentElement;
                }
                
                console.log('Stacking Contexts:');
                stackingContexts.forEach((ctx, i) => {
                    console.log(`  ${i + 1}. ${ctx.element}:`, ctx);
                });
                
                // בדיקת מיקום ונראות
                const popupRect = popup.getBoundingClientRect();
                const cellRect = actionsCell.getBoundingClientRect();
                const rowRect = tableRow.getBoundingClientRect();
                
                console.log('Position & Visibility:');
                console.log(`  Popup: x=${popupRect.x}, y=${popupRect.y}, w=${popupRect.width}, h=${popupRect.height}`);
                console.log(`  Actions Cell: x=${cellRect.x}, y=${cellRect.y}, w=${cellRect.width}, h=${cellRect.height}`);
                console.log(`  Table Row: x=${rowRect.x}, y=${rowRect.y}, w=${rowRect.width}, h=${rowRect.height}`);
                
                // בדיקה אם התפריט חתוך
                const isClipped = popupRect.top < rowRect.top || 
                                 popupRect.bottom > rowRect.bottom ||
                                 popupRect.left < rowRect.left || 
                                 popupRect.right > rowRect.right;
                
                console.log(`  Is Popup Clipped: ${isClipped ? '❌ YES' : '✅ NO'}`);
                
                if (isClipped) {
                    console.log('🔍 Clipping Analysis:');
                    if (popupRect.top < rowRect.top) console.log('  - Clipped from top');
                    if (popupRect.bottom > rowRect.bottom) console.log('  - Clipped from bottom');
                    if (popupRect.left < rowRect.left) console.log('  - Clipped from left');
                    if (popupRect.right > rowRect.right) console.log('  - Clipped from right');
                }
            });
        };
        
        console.log('🔧 קוד debugActionsMenuZIndex() הותקן. הרץ debugActionsMenuZIndex() כדי לבדוק z-index וחתיכה');
    }
}

// פונקציה גלובלית ליצירת תפריט פעולות
window.createActionsMenu = function(buttons) {
    if (window.actionsMenuSystem) {
        return window.actionsMenuSystem.createActionsMenu(buttons);
    } else {
        console.warn('ActionsMenuSystem not yet initialized');
        return null;
    }
};

// Initialize דרך UnifiedAppInitializer - כלל 43
// DOMContentLoaded listener הוסר לטובת מערכת האתחול המאוחדת
window.ActionsMenuSystem = ActionsMenuSystem;

// יצירת instance גלובלי אחרי שהקלאס מוגדר - רק אם עדיין לא קיים
if (!window.actionsMenuSystem) {
    window.actionsMenuSystem = new ActionsMenuSystem();
    console.log('🔧 ActionsMenuSystem: Instance created and ready');
}

