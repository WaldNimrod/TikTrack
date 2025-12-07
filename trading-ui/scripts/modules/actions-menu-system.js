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

const ACTIONS_MENU_DEBUG_ENABLED = window.ActionsMenuDebugMode === true;
const actionsMenuDebugLog = (...args) => {
    if (ACTIONS_MENU_DEBUG_ENABLED) {
        console.log(...args);
    }
};

// וידוא שהפונקציה מוגדרת מיד
if (typeof window.debugActionsMenu === 'undefined') {
    window.debugActionsMenu = () => {
    const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
    
    allWrappers.forEach((wrapper, index) => {
        const popup = wrapper.querySelector('.actions-menu-popup');
        const actionsCell = wrapper.closest('.actions-cell');
        const tableRow = wrapper.closest('tr');
        
        if (!popup || !actionsCell || !tableRow) return;
        
        // בדיקת styles בפועל
        const popupStyle = window.getComputedStyle(popup);
        const cellStyle = window.getComputedStyle(actionsCell);
        const rowStyle = window.getComputedStyle(tableRow);
        
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
        
        // בדיקת מיקומים - popupRect כבר מוגדר למעלה
        const cellRect = actionsCell.getBoundingClientRect();
        const rowRect = tableRow.getBoundingClientRect();
        
        // חישוב גבהים
        const rowHeight = Math.round(rowRect.bottom - rowRect.top);
        const cellHeight = Math.round(cellRect.bottom - cellRect.top);
        const popupHeight = Math.round(popupRect.bottom - popupRect.top);
        
        actionsMenuDebugLog('מיקומים בפועל:');
        actionsMenuDebugLog('Popup:', {
            top: Math.round(popupRect.top),
            bottom: Math.round(popupRect.bottom),
            left: Math.round(popupRect.left),
            right: Math.round(popupRect.right),
            width: Math.round(popupRect.width),
            height: popupHeight
        });
        
        actionsMenuDebugLog('Cell:', {
            top: Math.round(cellRect.top),
            bottom: Math.round(cellRect.bottom),
            height: cellHeight
        });
        
        actionsMenuDebugLog('Row:', {
            top: Math.round(rowRect.top),
            bottom: Math.round(rowRect.bottom),
            height: rowHeight
        });
    });
    
    actionsMenuDebugLog('\n💡 טיפ: הרץ את הפקודה הזו כשהתפריט פתוח (hover) כדי לראות את המיקומים במצב פתוח');
    
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
        actionsMenuDebugLog('🎯 Popups הנראים כרגע:', visiblePopups);
    } else {
        actionsMenuDebugLog('ℹ️ אין popups נראים כרגע (זה נורמלי כשמעכברים מחוץ ל-actions menu)');
    }
    };
} // סיום של ה-if שהתחיל בשורה 24

// פונקציה נוספת לבדיקת hover state בזמן אמת
window.debugActionsMenuHover = () => {
    const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
    actionsMenuDebugLog('🔍 בדיקת hover state ל-actions menus...');
    
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
                actionsMenuDebugLog(`✅ Actions Menu ${index + 1} נראה:`);
                actionsMenuDebugLog(`   Opacity: ${style.opacity}`);
                actionsMenuDebugLog(`   Visibility: ${style.visibility}`);
                actionsMenuDebugLog(`   Size: ${rect.width}x${rect.height}`);
            }
        }
    });
};

// פונקציה לבדיקת overflow - מה שמסתיר את התפריט
window.debugActionsMenuOverflow = () => {
    const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
    actionsMenuDebugLog('🔍 בדיקת overflow - מה מסתיר את התפריט...');
    
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
            
            actionsMenuDebugLog(`${path}${tagName}.${className}:`, {
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
        
        actionsMenuDebugLog(`\n📊 Actions Menu ${index + 1} - בדיקת overflow:`);
        checkOverflow(popup, '');
    });
};


class ActionsMenuSystem {
    constructor() {
        this.init();
    }

    init() {
        
        if (window.Logger) {
            window.Logger.info('✅ Actions Menu System initialized', { page: "actions-menu-system", keepInfo: true });
        }
        
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
        if (!buttons || buttons.length === 0) {
            console.warn('⚠️ [ActionsMenuSystem] No buttons provided');
            return '';
        }
        
        const menuButtons = buttons.map((button, index) => {
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
            
            // Get icon based on button type - use BUTTON_ICONS if available
            let icon = '';
            if (window.BUTTON_ICONS && window.BUTTON_ICONS[buttonType]) {
                // Use SVG path from BUTTON_ICONS - convert to img tag
                const iconPath = window.BUTTON_ICONS[buttonType];
                if (iconPath.startsWith('/') || iconPath.startsWith('http')) {
                    // It's a path, convert to img tag
                    icon = `<img src="${iconPath}" width="16" height="16" alt="${buttonType}" class="icon">`;
                } else {
                    // It's already HTML or emoji
                    icon = iconPath;
                }
            } else {
                // Fallback to emoji if BUTTON_ICONS not available
                switch(buttonType) {
                    case 'LINK': icon = '🔗'; break;
                    case 'EDIT': icon = '✏️'; break;
                    case 'DELETE': icon = '🗑️'; break;
                    case 'VIEW': icon = '👁️'; break;
                    case 'ADD': icon = '➕'; break;
                    case 'MENU': icon = '⚙️'; break;
                    case 'DASHBOARD': icon = '📊'; break;
                    case 'REFRESH': icon = '🔄'; break;
                    case 'RERUN': icon = '🔄'; break;
                    default: icon = '⚙️'; break;
                }
            }
            
            // Escape onclick for HTML attribute - escape single quotes since we use single quotes for the attribute
            let escapedOnclick = onclick || '';
            if (escapedOnclick) {
                // Escape single quotes (since we use single quotes for the attribute wrapper)
                escapedOnclick = escapedOnclick.replace(/'/g, '&#39;');
                // Also escape double quotes to prevent parsing issues
                escapedOnclick = escapedOnclick.replace(/"/g, '&quot;');
            }
            
            // Use single quotes for the data-onclick attribute value - allows double quotes inside without escaping
            // Convert title to data-tooltip for consistency with button system
            // If no title provided, the button system will use default tooltip via _getDefaultTooltip
            let tooltipText = title || '';
            let tooltipAttrs = '';
            
            if (tooltipText) {
                // Explicit tooltip provided
                tooltipAttrs = `data-tooltip="${tooltipText}" data-tooltip-placement="top" data-tooltip-trigger="hover"`;
            } else {
                // No explicit tooltip - button system will use default via _getDefaultTooltip
                // We don't add data-tooltip here, let the button system handle it
                tooltipAttrs = `data-tooltip-placement="top" data-tooltip-trigger="hover"`;
            }
            
            const buttonHTML = `<button class="btn actions-menu-item" data-variant="small" data-button-type="${buttonType}" data-onclick='${escapedOnclick}' ${tooltipAttrs} style="margin-right: 4px;">${icon}</button>`;
            return buttonHTML;
        }).join('');
        
        // Get menu trigger icon from BUTTON_ICONS or fallback to emoji
        let menuIcon = '⚙️';
        if (window.BUTTON_ICONS && window.BUTTON_ICONS.MENU) {
            const menuIconPath = window.BUTTON_ICONS.MENU;
            if (menuIconPath.startsWith('/') || menuIconPath.startsWith('http')) {
                menuIcon = `<img src="${menuIconPath}" width="16" height="16" alt="פעולות" class="icon">`;
            } else {
                menuIcon = menuIconPath;
            }
        }
        
        const fullHTML = `
            <div class="actions-menu-wrapper">
                <button class="btn actions-trigger" data-tooltip="פעולות" data-tooltip-placement="top" data-tooltip-trigger="hover">${menuIcon}</button>
                <div class="actions-menu-popup">
                    ${menuButtons}
                </div>
            </div>
        `;
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

            const logFn = (window.consoleCleanup?.info || actionsMenuDebugLog);
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
        
    }

    /**
     * Attach hover event listeners to position popup dynamically
     * This ensures popup is positioned correctly when using position: fixed
     */
    attachHoverPositioning() {
        // Observe all action menu popups and reposition when they become visible
        const observePopup = (popup) => {
            if (!popup || !popup.nodeType || popup.nodeType !== Node.ELEMENT_NODE) {
                return; // Skip if popup is not a valid element
            }
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
            try {
                observer.observe(popup, { attributes: true, attributeFilter: ['style'] });
            } catch (error) {
                // Popup is not a valid Node - skip
                if (window.Logger) {
                    window.Logger.debug('Failed to observe popup:', error);
                }
            }
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
        
        // Wait for document.body to be available
        if (document.body) {
            documentObserver.observe(document.body, { childList: true, subtree: true });
        } else {
            // Retry after DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    if (document.body) {
                        documentObserver.observe(document.body, { childList: true, subtree: true });
                    }
                });
            } else {
                // DOM already loaded but body not available - retry after delay
                setTimeout(() => {
                    if (document.body) {
                        documentObserver.observe(document.body, { childList: true, subtree: true });
                    }
                }, 100);
            }
        }

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
            
            const allWrappers = document.querySelectorAll('.actions-menu-wrapper');
            
            allWrappers.forEach((wrapper, index) => {
                const popup = wrapper.querySelector('.actions-menu-popup');
                const actionsCell = wrapper.closest('.actions-cell');
                const tableRow = wrapper.closest('tr');
                const table = wrapper.closest('table');
                
                if (!popup || !actionsCell || !tableRow || !table) return;
                
                actionsMenuDebugLog(`\n=== Actions Menu ${index + 1} ===`);
                
                // בדיקת z-index
                const popupStyle = window.getComputedStyle(popup);
                const cellStyle = window.getComputedStyle(actionsCell);
                const rowStyle = window.getComputedStyle(tableRow);
                const tableStyle = window.getComputedStyle(table);
                
                actionsMenuDebugLog('Z-Index Values:');
                actionsMenuDebugLog(`  Popup: ${popupStyle.zIndex} (${popupStyle.position})`);
                actionsMenuDebugLog(`  Actions Cell: ${cellStyle.zIndex} (${cellStyle.position})`);
                actionsMenuDebugLog(`  Table Row: ${rowStyle.zIndex} (${rowStyle.position})`);
                actionsMenuDebugLog(`  Table: ${tableStyle.zIndex} (${tableStyle.position})`);
                
                // בדיקת overflow
                actionsMenuDebugLog('Overflow Values:');
                actionsMenuDebugLog(`  Actions Cell: ${cellStyle.overflow}`);
                actionsMenuDebugLog(`  Table Row: ${rowStyle.overflow}`);
                actionsMenuDebugLog(`  Table: ${tableStyle.overflow}`);
                
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
                
                actionsMenuDebugLog('Stacking Contexts:');
                stackingContexts.forEach((ctx, i) => {
                    actionsMenuDebugLog(`  ${i + 1}. ${ctx.element}:`, ctx);
                });
                
                // בדיקת מיקום ונראות
                const popupRect = popup.getBoundingClientRect();
                const cellRect = actionsCell.getBoundingClientRect();
                const rowRect = tableRow.getBoundingClientRect();
                
                actionsMenuDebugLog('Position & Visibility:');
                actionsMenuDebugLog(`  Popup: x=${popupRect.x}, y=${popupRect.y}, w=${popupRect.width}, h=${popupRect.height}`);
                actionsMenuDebugLog(`  Actions Cell: x=${cellRect.x}, y=${cellRect.y}, w=${cellRect.width}, h=${cellRect.height}`);
                actionsMenuDebugLog(`  Table Row: x=${rowRect.x}, y=${rowRect.y}, w=${rowRect.width}, h=${rowRect.height}`);
                
                // בדיקה אם התפריט חתוך
                const isClipped = popupRect.top < rowRect.top || 
                                 popupRect.bottom > rowRect.bottom ||
                                 popupRect.left < rowRect.left || 
                                 popupRect.right > rowRect.right;
                
                actionsMenuDebugLog(`  Is Popup Clipped: ${isClipped ? '❌ YES' : '✅ NO'}`);
                
                if (isClipped) {
                    actionsMenuDebugLog('🔍 Clipping Analysis:');
                    if (popupRect.top < rowRect.top) actionsMenuDebugLog('  - Clipped from top');
                    if (popupRect.bottom > rowRect.bottom) actionsMenuDebugLog('  - Clipped from bottom');
                    if (popupRect.left < rowRect.left) actionsMenuDebugLog('  - Clipped from left');
                    if (popupRect.right > rowRect.right) actionsMenuDebugLog('  - Clipped from right');
                }
            });
        };
        
    }
}

// פונקציה גלובלית ליצירת תפריט פעולות
window.createActionsMenu = function(buttons) {
    // Try to use instance first
    if (window.actionsMenuSystem) {
        return window.actionsMenuSystem.createActionsMenu(buttons);
    }
    
    // Fallback: create instance on-the-fly if ActionsMenuSystem class is available
    if (typeof ActionsMenuSystem !== 'undefined') {
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
        
        // Get icon from BUTTON_ICONS or fallback to emoji
        let icon = '';
        if (window.BUTTON_ICONS && window.BUTTON_ICONS[buttonType]) {
            const iconPath = window.BUTTON_ICONS[buttonType];
            if (iconPath.startsWith('/') || iconPath.startsWith('http')) {
                icon = `<img src="${iconPath}" width="16" height="16" alt="${buttonType}" class="icon">`;
            } else {
                icon = iconPath;
            }
        } else {
            // Fallback to emoji
            switch(buttonType) {
                case 'LINK': icon = '🔗'; break;
                case 'EDIT': icon = '✏️'; break;
                case 'DELETE': icon = '🗑️'; break;
                case 'VIEW': icon = '👁️'; break;
                case 'ADD': icon = '➕'; break;
                case 'DASHBOARD': icon = '📊'; break;
                default: icon = '⚙️'; break;
            }
        }
        
        // Escape onclick for HTML attribute - escape single quotes since we use single quotes for the attribute
        let escapedOnclick = onclick || '';
        if (escapedOnclick) {
            escapedOnclick = escapedOnclick.replace(/'/g, '&#39;');
        }
        // Convert title to data-tooltip for consistency with button system
        // If no title provided, the button system will use default tooltip via _getDefaultTooltip
        let tooltipText = title || '';
        let tooltipAttrs = '';
        
        if (tooltipText) {
            // Explicit tooltip provided
            tooltipAttrs = `data-tooltip="${tooltipText}" data-tooltip-placement="top" data-tooltip-trigger="hover"`;
        } else {
            // No explicit tooltip - button system will use default via _getDefaultTooltip
            tooltipAttrs = `data-tooltip-placement="top" data-tooltip-trigger="hover"`;
        }
        
        return `<button class="btn actions-menu-item" data-variant="small" data-button-type="${buttonType}" data-onclick='${escapedOnclick}' ${tooltipAttrs} style="margin-right: 4px;">${icon}</button>`;
    }).join('');
    
    const fallbackHTML = `
        <div class="actions-menu-wrapper">
            <button class="btn actions-trigger" data-tooltip="פעולות" data-tooltip-placement="top" data-tooltip-trigger="hover">⚙️</button>
            <div class="actions-menu-popup">
                ${menuButtons}
            </div>
        </div>
    `;
    return fallbackHTML;
};

// Initialize דרך UnifiedAppInitializer - כלל 43
// DOMContentLoaded listener הוסר לטובת מערכת האתחול המאוחדת
window.ActionsMenuSystem = ActionsMenuSystem;

// יצירת instance גלובלי אחרי שהקלאס מוגדר - רק אם עדיין לא קיים
if (!window.actionsMenuSystem) {
    window.actionsMenuSystem = new ActionsMenuSystem();
    if (window.Logger) {
        window.Logger.info('✅ ActionsMenuSystem initialized manually', { page: "actions-menu-system", keepInfo: true });
    }
}

