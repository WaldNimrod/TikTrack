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
console.log('🔧 ActionsMenuSystem: Script loaded at:', new Date().toISOString());

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
        console.log('🔧 ActionsMenuSystem: מתחיל אתחול');
        console.log('🔧 ActionsMenuSystem: DOM ready state:', document.readyState);
        console.log('🔧 ActionsMenuSystem: Available elements:', document.querySelectorAll('.actions-menu-wrapper').length);
        
        if (window.consoleCleanup && typeof window.consoleCleanup.debug === 'function') {
            window.consoleCleanup.debug('✅ Actions Menu System initialized');
        } else {
            console.log('✅ Actions Menu System initialized');
        }
        (window.consoleCleanup?.debug || console.log)('   → Fixed positioning to avoid table overflow clipping');
        (window.consoleCleanup?.debug || console.log)('   → RTL aware positioning');
        (window.consoleCleanup?.debug || console.log)('   → Supports 2-5 buttons dynamically');
        (window.consoleCleanup?.debug || console.log)('   → Integrated with new button system');
        
        // Set up hover event listeners to position popup dynamically
        this.attachHoverPositioning();
        
        this.initAccessibility();
        this.attachLinkedItemsDebugLogger();
        // Disabled JavaScript hover delay - using CSS-only hover instead
        // this.attachZIndexDebugLogger();
    }

    /**
     * Convert regular action buttons to dropdown menu
     * @param {HTMLElement} actionsCell - The actions cell containing buttons
     * @returns {string} - HTML for the dropdown menu
     */
    createActionsMenu(buttons) {
        console.log('🔧 [ActionsMenuSystem] createActionsMenu called with buttons:', buttons);
        if (!buttons || buttons.length === 0) {
            console.warn('⚠️ [ActionsMenuSystem] No buttons provided');
            return '';
        }
        
        const menuButtons = buttons.map((button, index) => {
            console.log(`🔧 [ActionsMenuSystem] Processing button ${index + 1}:`, button);
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
            
            // Escape onclick for HTML attribute - escape single quotes since we use single quotes for the attribute
            let escapedOnclick = onclick || '';
            if (escapedOnclick) {
                // Escape single quotes (since we use single quotes for the attribute wrapper)
                escapedOnclick = escapedOnclick.replace(/'/g, '&#39;');
                // Double quotes are OK inside single-quoted attribute
            }
            
            // Use single quotes for the data-onclick attribute value - allows double quotes inside without escaping
            const buttonHTML = `<button class="btn actions-menu-item" data-variant="small" data-button-type="${buttonType}" data-onclick='${escapedOnclick}' title="${title || ''}" style="margin-right: 4px;">${icon}</button>`;
            console.log(`✅ [ActionsMenuSystem] Created button ${index + 1}:`, {
                type: buttonType,
                onclick: onclick,
                escapedOnclick: escapedOnclick,
                html: buttonHTML.substring(0, 100) + '...'
            });
            return buttonHTML;
        }).join('');
        
        const fullHTML = `
            <div class="actions-menu-wrapper">
                <button class="btn actions-trigger" title="פעולות">⚙️</button>
                <div class="actions-menu-popup">
                    ${menuButtons}
                </div>
            </div>
        `;
        console.log('✅ [ActionsMenuSystem] Full menu HTML created:', fullHTML.substring(0, 200) + '...');
        return fullHTML;
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
     * Uses position: fixed to avoid being clipped by table overflow
     * RTL: תפריט נפתח מימין לכפתור (לפניו, לכיוון מרכז הטבלה)
     */
    positionPopup(wrapper) {
        const popup = wrapper.querySelector('.actions-menu-popup');
        const trigger = wrapper.querySelector('.actions-trigger');
        
        if (!popup || !trigger) {
            return;
        }
        
        // Get trigger position relative to viewport (for position: fixed)
        const triggerRect = trigger.getBoundingClientRect();
        
        // RTL support: check document direction
        const isRTL = document.documentElement.dir === 'rtl' || 
                     getComputedStyle(document.body).direction === 'rtl';
        
        // Temporarily show popup to calculate its width
        const wasVisible = popup.style.display !== 'none';
        if (!wasVisible) {
            popup.style.display = 'block';
            popup.style.visibility = 'hidden'; // Hidden but takes space
        }
        
        const popupWidth = popup.offsetWidth || 120; // Get actual width
        const triggerWidth = trigger.offsetWidth || 32; // Get trigger button width
        
        if (!wasVisible) {
            popup.style.display = 'none'; // Restore original state
        }
        
        if (isRTL) {
            // RTL: popup opens to the RIGHT of trigger (before it, towards center of table)
            // In RTL (right-to-left): "right" of button = before it = towards center = leftward in screen coordinates
            // The popup should START at trigger.right (where trigger ends) and extend LEFTWARD (towards center)
            // Simple: popup.left = trigger.right, popup extends leftward naturally
            popup.style.left = `${triggerRect.right}px`; // Start at trigger.right, extends leftward (towards center)
            popup.style.right = 'auto';
        } else {
            // LTR: popup opens to the right of trigger
            popup.style.left = `${triggerRect.right + 2}px`;
            popup.style.right = 'auto';
        }
        
        // Position vertically aligned with trigger
        popup.style.top = `${triggerRect.top - 5}px`;
        
        // Ensure popup is visible
        popup.style.position = 'fixed';
        popup.style.zIndex = '9999';
    }

    /**
     * הוספת לוגים לבדיקת z-index כשהתפריט נפתח
     */
    attachZIndexDebugLogger() {
        // הפונקציה debugActionsMenu כבר מוגדרת בתחילת הקובץ
        
        // Add hover delay for better UX
        this.attachHoverDelay();
        
        console.log('✅ Actions Menu Debug Logger הותקן. הרץ debugActionsMenu() כדי לבדוק');
    }

    /**
     * Attach hover event listeners to position popup dynamically
     * This ensures popup is positioned correctly when using position: fixed
     */
    attachHoverPositioning() {
        // Observe all action menu popups and reposition when they become visible
        const observePopup = (popup) => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const style = window.getComputedStyle(popup);
                        if (style.display !== 'none' && style.visibility !== 'hidden') {
                            const wrapper = popup.closest('.actions-menu-wrapper');
                            if (wrapper) {
                                this.positionPopup(wrapper);
                            }
                        }
                    }
                });
            });
            observer.observe(popup, { attributes: true, attributeFilter: ['style'] });
        };

        // Observe existing popups
        document.querySelectorAll('.actions-menu-popup').forEach(observePopup);

        // Observe document for new popups added dynamically
        const documentObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const popups = node.querySelectorAll ? node.querySelectorAll('.actions-menu-popup') : [];
                        if (node.classList && node.classList.contains('actions-menu-popup')) {
                            observePopup(node);
                        }
                        popups.forEach(observePopup);
                    }
                });
            });
        });
        documentObserver.observe(document.body, { childList: true, subtree: true });

        // Also position on mouseenter as fallback
        document.addEventListener('mouseenter', (e) => {
            if (e.target && typeof e.target.closest === 'function') {
                const wrapper = e.target.closest('.actions-menu-wrapper');
                if (wrapper) {
                    const popup = wrapper.querySelector('.actions-menu-popup');
                    if (popup) {
                        // Small delay to ensure popup is visible before positioning
                        setTimeout(() => {
                            const style = window.getComputedStyle(popup);
                            if (style.display !== 'none' && style.visibility !== 'hidden') {
                                this.positionPopup(wrapper);
                            }
                        }, 10);
                    }
                }
            }
        }, true);
        
        // Reposition on scroll to keep popup aligned
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.querySelectorAll('.actions-menu-popup').forEach(popup => {
                    const style = window.getComputedStyle(popup);
                    if (style.display !== 'none' && style.visibility !== 'hidden') {
                        const wrapper = popup.closest('.actions-menu-wrapper');
                        if (wrapper) {
                            this.positionPopup(wrapper);
                        }
                    }
                });
            }, 10);
        }, true);
    }

    /**
     * Add hover delay for better UX
     */
    attachHoverDelay() {
        let hoverTimeout;
        let currentMouseX = 0;
        let currentMouseY = 0;
        
        // Track mouse position for accurate hover detection
        document.addEventListener('mousemove', (e) => {
            currentMouseX = e.clientX;
            currentMouseY = e.clientY;
        }, true);
        
        // Clear timeout when mouse enters wrapper or popup
        const clearHideTimeout = () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
        };
        
        document.addEventListener('mouseenter', (e) => {
            if (e.target && typeof e.target.closest === 'function') {
                const wrapper = e.target.closest('.actions-menu-wrapper');
                const popup = e.target.closest('.actions-menu-popup');
                
                if (wrapper || popup) {
                    clearHideTimeout();
                    const targetWrapper = wrapper || popup.closest('.actions-menu-wrapper');
                    if (targetWrapper) {
                        const targetPopup = targetWrapper.querySelector('.actions-menu-popup');
                        if (targetPopup) {
                            targetPopup.style.display = 'block';
                            targetPopup.style.opacity = '1';
                            targetPopup.style.visibility = 'visible';
                        }
                    }
                }
            }
        }, true);
        
        // Handle mouseleave for both wrapper and popup
        const handleMouseLeave = (e) => {
            if (e.target && typeof e.target.closest === 'function') {
                const wrapper = e.target.closest('.actions-menu-wrapper');
                const popup = e.target.closest('.actions-menu-popup');
                
                // Find the relevant wrapper and popup
                let targetWrapper = wrapper;
                let targetPopup = null;
                
                if (popup && !wrapper) {
                    // Mouse left popup but not wrapper yet
                    targetWrapper = popup.closest('.actions-menu-wrapper');
                    targetPopup = popup;
                } else if (wrapper) {
                    // Mouse left wrapper
                    targetPopup = wrapper.querySelector('.actions-menu-popup');
                }
                
                if (targetWrapper && targetPopup) {
                    // Use a delay to allow mouse to move to popup or back to wrapper
                    hoverTimeout = setTimeout(() => {
                        // Check if mouse is still over wrapper or popup using current mouse position
                        const hoveredElement = document.elementFromPoint(currentMouseX, currentMouseY);
                        const isStillOverWrapper = hoveredElement?.closest('.actions-menu-wrapper') === targetWrapper;
                        const isStillOverPopup = hoveredElement?.closest('.actions-menu-popup') === targetPopup;
                        
                        if (!isStillOverWrapper && !isStillOverPopup) {
                            targetPopup.style.display = 'none';
                            targetPopup.style.opacity = '0';
                            targetPopup.style.visibility = 'hidden';
                        }
                    }, 400); // Increased delay from 200ms to 400ms for better UX
                }
            }
        };
        
        document.addEventListener('mouseleave', handleMouseLeave, true);
        
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
    console.log('🔧 [window.createActionsMenu] Called with:', buttons);
    console.log('🔧 [window.createActionsMenu] window.actionsMenuSystem exists?', !!window.actionsMenuSystem);
    console.log('🔧 [window.createActionsMenu] ActionsMenuSystem class exists?', typeof ActionsMenuSystem);
    
    // Try to use instance first
    if (window.actionsMenuSystem) {
        console.log('✅ [window.createActionsMenu] Using existing instance');
        return window.actionsMenuSystem.createActionsMenu(buttons);
    }
    
    // Fallback: create instance on-the-fly if ActionsMenuSystem class is available
    if (typeof ActionsMenuSystem !== 'undefined') {
        console.log('⚠️ [window.createActionsMenu] Creating new instance on-the-fly');
        if (!window.actionsMenuSystem) {
            window.actionsMenuSystem = new ActionsMenuSystem();
        }
        return window.actionsMenuSystem.createActionsMenu(buttons);
    }
    
    // Final fallback: create HTML directly (same as fallback in pages)
    console.warn('⚠️ [window.createActionsMenu] Using direct HTML fallback');
    if (!buttons || buttons.length === 0) return '';
    
    const menuButtons = buttons.map(button => {
        const buttonType = button.type || 'BUTTON';
        const onclick = button.onclick || '';
        const title = button.title || '';
        
        // Get icon
        let icon = '';
        switch(buttonType) {
            case 'LINK': icon = '🔗'; break;
            case 'EDIT': icon = '✏️'; break;
            case 'DELETE': icon = '🗑️'; break;
            case 'VIEW': icon = '👁️'; break;
            default: icon = '⚙️'; break;
        }
        
        // Escape onclick for HTML attribute - escape single quotes since we use single quotes for the attribute
        let escapedOnclick = onclick || '';
        if (escapedOnclick) {
            escapedOnclick = escapedOnclick.replace(/'/g, '&#39;');
        }
        console.log(`🔧 [window.createActionsMenu fallback] Button ${buttonType}:`, { onclick, escapedOnclick });
        return `<button class="btn actions-menu-item" data-variant="small" data-button-type="${buttonType}" data-onclick='${escapedOnclick}' title="${title || ''}" style="margin-right: 4px;">${icon}</button>`;
    }).join('');
    
    const fallbackHTML = `
        <div class="actions-menu-wrapper">
            <button class="btn actions-trigger" title="פעולות">⚙️</button>
            <div class="actions-menu-popup">
                ${menuButtons}
            </div>
        </div>
    `;
    console.log('✅ [window.createActionsMenu fallback] Generated HTML:', fallbackHTML.substring(0, 200) + '...');
    return fallbackHTML;
};

// Initialize דרך UnifiedAppInitializer - כלל 43
// DOMContentLoaded listener הוסר לטובת מערכת האתחול המאוחדת
window.ActionsMenuSystem = ActionsMenuSystem;

// יצירת instance גלובלי אחרי שהקלאס מוגדר - רק אם עדיין לא קיים
if (!window.actionsMenuSystem) {
    window.actionsMenuSystem = new ActionsMenuSystem();
    console.log('✅ ActionsMenuSystem initialized manually');
}

