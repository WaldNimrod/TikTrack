/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 12
 * 
 * DATA MANIPULATION (2)
 * - sortLinkedItems() - מיון פריטים מקושרים - פתוחים ראשון, אחר כך תאריך
 * - formatLinkedItemName() - פורמט שם נקי של פריט מקושר - הסרת קידומות סוג ישות
 * 
 * UI RENDERING (3)
 * - getLinkedItemIcon() - קבלת נתיב איקון לסוג ישות
 * - getLinkedItemColor() - קבלת צבע לסוג ישות
 * - renderEmptyLinkedItems() - יצירת הודעת "אין פריטים" עם כפתור חיפוש
 * 
 * UTILITIES (3)
 * - getEntityLabel() - קבלת שם תצוגה בעברית לסוג ישות
 * - generateLinkedItemActions() - יצירת HTML של כפתורי פעולות לפריט מקושר
 * - shouldShowAction() - בדיקה אם יש להציג פעולה מסוימת
 * 
 * PRIVATE HELPERS (4)
 * - _getLinkedItemsFunctionForType() - קבלת פונקציית LINK לפי סוג ישות
 * - _getEditFunctionForType() - קבלת פונקציית EDIT לפי סוג ישות
 * - _getCancelFunctionForType() - קבלת פונקציית CANCEL/REACTIVATE לפי סוג ישות
 * - _getDeleteFunctionForType() - קבלת פונקציית DELETE לפי סוג ישות
 * 
 * ==========================================
 */

/**
 * Linked Items Service - TikTrack
 * ===============================
 * 
 * שירות מרכזי לניהול לוגיקה משותפת של אלמנטים מקושרים
 * איחוד לוגיקה מ-linked-items.js ו-entity-details-renderer.js
 * 
 * תכונות:
 * - מיון פריטים מקושרים (פתוחים ראשון, אחר כך תאריך)
 * - פורמט שם נקי של פריט
 * - יצירת כפתורי פעולות (VIEW, EDIT, DELETE, LINK, CANCEL/REACTIVATE)
 * - קבלת איקונים וצבעים לסוגי ישויות
 * - בדיקה אם להציג פעולה מסוימת
 * - טיפול במקרה אין פריטים מקושרים
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 * 
 * תיעוד: documentation/02-ARCHITECTURE/FRONTEND/LINKED_ITEMS_SYSTEM.md
 * 
 * @class LinkedItemsService
 */

// ===== LINKED ITEMS SERVICE =====

class LinkedItemsService {
    
    /**
     * מיון פריטים מקושרים - פתוחים ראשון, אחר כך תאריך (חדש לישן)
     * 
     * @param {Array} items - רשימת פריטים מקושרים
     * @returns {Array} - פריטים ממוינים
     * 
     * @example
     * const sorted = LinkedItemsService.sortLinkedItems(items);
     */
    static sortLinkedItems(items) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return items || [];
        }
        
        // יצירת עותק כדי לא לשנות את המקור
        const sorted = [...items];
        
        sorted.sort((a, b) => {
            // מיון לפי סטטוס - פתוח ראשון
            const statusOrder = { 'open': 0, 'closed': 1, 'cancelled': 2, 'canceled': 2 };
            const aStatusOrder = statusOrder[a.status] ?? 3;
            const bStatusOrder = statusOrder[b.status] ?? 3;
            
            if (aStatusOrder !== bStatusOrder) {
                return aStatusOrder - bStatusOrder;
            }
            
            // אם אותו סטטוס - מיון לפי תאריך (החדש ביותר ראשון)
            const aDate = new Date(a.created_at || a.updated_at || 0);
            const bDate = new Date(b.created_at || b.updated_at || 0);
            return bDate - aDate;
        });
        
        return sorted;
    }
    
    /**
     * פורמט שם נקי של פריט מקושר - הסרת קידומות סוג ישות
     * 
     * @param {Object} item - פריט מקושר
     * @returns {string} - שם מעוצב ללא קידומות
     * 
     * @example
     * const name = LinkedItemsService.formatLinkedItemName(item);
     */
    static formatLinkedItemName(item) {
        if (!item) return '';
        
        // שימוש ב-description אם קיים (מכיל את הפורמט הנכון מהשרת: "טרייד Long על TSLA")
        // אחרת נופל ל-title או name
        let name = item.description || item.title || item.name || item.symbol || '';
        
        // אם עדיין אין שם, נבנה שם בסיסי
        if (!name || name.trim() === '') {
            const typeLabel = this.getEntityLabel(item.type);
            const itemId = item.id || item.entity_id || item.linked_id || 'לא זמין';
            name = `${typeLabel} #${itemId}`;
            return name; // Return early - no need to clean prefixes for generated names
        }
        
        // הסרת סוג הישות מהשם אם הוא קיים
        const typePrefixes = {
            'trade': ['טרייד:', 'Trade:', 'trade:', 'טרייד '],
            'trade_plan': ['תכנון:', 'תכנית:', 'Plan:', 'plan:', 'תוכנית השקעה ', 'תוכנית טרייד '],
            'alert': ['התראה:', 'Alert:', 'alert:'],
            'trading_account': ['חשבון מסחר:', 'Account:', 'account:'],
            'ticker': ['טיקר:', 'Ticker:', 'ticker:'],
            'execution': ['ביצוע:', 'Execution:', 'execution:'],
            'cash_flow': ['תזרים:', 'Cash Flow:', 'cash_flow:'],
            'note': ['הערה:', 'Note:', 'note:']
        };
        
        const prefixes = typePrefixes[item.type] || [];
        for (const prefix of prefixes) {
            if (name.startsWith(prefix)) {
                name = name.substring(prefix.length).trim();
                break;
            }
        }
        
        // הסרת שם הישות מהתחלה גם אם הוא מופיע שוב
        const entityLabel = this.getEntityLabel(item.type);
        if (entityLabel && entityLabel !== item.type) {
            const entityLabelLower = entityLabel.toLowerCase();
            if (name.toLowerCase().startsWith(entityLabelLower + ' ')) {
                name = name.substring(entityLabelLower.length + 1).trim();
            } else if (name.toLowerCase().startsWith(entityLabelLower + ':')) {
                name = name.substring(entityLabelLower.length + 1).trim();
            }
        }
        
        return name || `#${item.id || 'לא זמין'}`;
    }
    
    /**
     * קבלת נתיב איקון לסוג ישות
     * 
     * @param {string} entityType - סוג ישות
     * @returns {string} - נתיב לאיקון
     * 
     * @example
     * const iconPath = LinkedItemsService.getLinkedItemIcon('trade');
     */
    static getLinkedItemIcon(entityType) {
        const iconMappings = {
            ticker: '/trading-ui/images/icons/tickers.svg',
            trade: '/trading-ui/images/icons/trades.svg',
            trade_plan: '/trading-ui/images/icons/trade_plans.svg',
            execution: '/trading-ui/images/icons/executions.svg',
            trading_account: '/trading-ui/images/icons/trading_accounts.svg',
            account: '/trading-ui/images/icons/trading_accounts.svg',
            alert: '/trading-ui/images/icons/alerts.svg',
            cash_flow: '/trading-ui/images/icons/cash_flows.svg',
            note: '/trading-ui/images/icons/notes.svg',
            position: '/trading-ui/images/icons/trades.svg'
        };
        
        return iconMappings[entityType] || '/trading-ui/images/icons/home.svg';
    }
    
    /**
     * קבלת צבע לסוג ישות
     * 
     * @param {string} entityType - סוג ישות
     * @param {Object} options - אפשרויות
     * @param {Object} options.entityColors - אובייקט צבעים לפי סוג ישות
     * @returns {string} - קוד צבע hex
     * 
     * @throws {Error} אם entityType לא מוגדר
     * 
     * @example
     * const color = LinkedItemsService.getLinkedItemColor('trade', { entityColors: this.entityColors });
     */
    static getLinkedItemColor(entityType, options = {}) {
        if (!entityType) {
            throw new Error('entityType is required');
        }
        
        if (options.entityColors && options.entityColors[entityType]) {
            return options.entityColors[entityType];
        }
        
        const defaultColors = {
            'trade': '#26baac',
            'trade_plan': '#26baac',
            'execution': '#28a745',
            'trading_account': '#28a745',
            'ticker': '#17a2b8',
            'alert': '#ffc107',
            'cash_flow': '#6c757d',
            'position': '#0d6efd',
            'note': '#343a40',
            'tag': '#26baac'
        };
        
        return defaultColors[entityType] || '#6c757d';
    }
    
    /**
     * קבלת שם תצוגה בעברית לסוג ישות
     * 
     * @param {string} entityType - סוג ישות
     * @returns {string} - שם תצוגה בעברית
     * 
     * @throws {Error} אם entityType לא מוגדר
     * 
     * @example
     * const label = LinkedItemsService.getEntityLabel('trade');
     */
    static getEntityLabel(entityType) {
        if (!entityType) {
            throw new Error('entityType is required');
        }
        
        const labels = {
            'trade': 'טרייד',
            'trade_plan': 'תוכנית השקעה',
            'execution': 'ביצוע',
            'trading_account': 'חשבון מסחר',
            'ticker': 'טיקר',
            'alert': 'התראה',
            'cash_flow': 'תזרים מזומנים',
            'position': 'פוזיציה',
            'note': 'הערה',
            'tag': 'תגית'
        };
        
        return labels[entityType] || entityType;
    }
    
    /**
     * יצירת HTML של כפתורי פעולות לפריט מקושר
     * 
     * מעודכן להעביר מידע נכון בין מודולים מקוננים
     * 
     * @param {Object} item - פריט מקושר
     * @param {string} context - הקשר (modal/table) - משפיע על סוג הכפתורים
     * @param {Object} options - אפשרויות נוספות (entityColors, renderer instance, sourceInfo)
     * @returns {string} - HTML של כפתורים
     * 
     * @example
     * const actionsHtml = LinkedItemsService.generateLinkedItemActions(item, 'table', { entityColors: this.entityColors, sourceInfo: { sourceModal: 'entity-details', sourceType: 'ticker', sourceId: 123 } });
     */
    static generateLinkedItemActions(item, context = 'modal', options = {}) {
        if (!item || !item.type || !item.id) return '';
        
        let actionsHtml = '<div class="btn-group btn-group-sm linked-items-actions" role="group">';
        
        // יצירת options ל-viewEntityDetails עם מידע על המקור
        // שימוש ב-ModalNavigationService לפתיחת מודל מקונן
        let viewOptions = { mode: 'view', includeLinkedItems: true };
        if (options.sourceInfo) {
            viewOptions.source = options.sourceInfo;
        }
        
        // בניית מחרוזת JavaScript object literal בצורה בטוחה לשימוש ב-eval
        // פונקציה רקורסיבית להמרת אובייקט ל-JavaScript object literal עם single quotes
        const buildObjectLiteral = (obj) => {
            if (obj === null) return 'null';
            if (obj === undefined) return 'undefined';
            if (typeof obj === 'string') return `'${obj.replace(/'/g, "\\'")}'`;
            if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
            if (Array.isArray(obj)) {
                return `[${obj.map(buildObjectLiteral).join(', ')}]`;
            }
            // אובייקט
            const entries = Object.entries(obj).map(([key, value]) => {
                const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key.replace(/'/g, "\\'")}'`;
                return `${safeKey}: ${buildObjectLiteral(value)}`;
            });
            return `{${entries.join(', ')}}`;
        };
        
        const viewOptionsStr = buildObjectLiteral(viewOptions);
        
        // כפתור VIEW - עם העברת מידע על המקור ושימוש ב-ModalNavigationService
        // showEntityDetails כבר משתמש ב-ModalNavigationService אוטומטית
        const onclickCode = `window.showEntityDetails('${item.type}', ${item.id}, ${viewOptionsStr})`;
        const escapedOnclick = onclickCode.replace(/"/g, '&quot;');
        actionsHtml += `<button data-button-type="VIEW" data-variant="small" data-onclick="${escapedOnclick}" data-text="" title="צפה בפרטים"></button>`;
        
        // כפתור LINK - הוסר לפי דרישת המשתמש
        
        // כפתור EDIT - עם בדיקה שהמודל קיים
        const editFunction = this._getEditFunctionForType(item.type, item.id);
        if (editFunction) {
            actionsHtml += `<button data-button-type="EDIT" data-variant="small" data-onclick="${editFunction}" data-text="" title="ערוך"></button>`;
        }
        
        // כפתור CANCEL/REACTIVATE או DELETE
        const cancelFunction = this._getCancelFunctionForType(item.type, item.id, item.status);
        if (cancelFunction) {
            const cancelType = item.status === 'cancelled' || item.status === 'canceled' ? 'REACTIVATE' : 'CANCEL';
            const cancelTitle = item.status === 'cancelled' || item.status === 'canceled' ? 'הפעל מחדש' : 'בטל';
            actionsHtml += `<button data-button-type="${cancelType}" data-variant="small" data-onclick="${cancelFunction}" data-text="" title="${cancelTitle}"></button>`;
        } else {
            // כפתור DELETE - תמיד להציג אם אין CANCEL/REACTIVATE
            const deleteFunction = this._getDeleteFunctionForType(item.type, item.id);
            if (deleteFunction) {
                actionsHtml += `<button data-button-type="DELETE" data-variant="small" data-onclick="${deleteFunction}" data-text="" title="מחק"></button>`;
            }
        }
        
        actionsHtml += '</div>';
        return actionsHtml;
    }
    
    /**
     * בדיקה אם יש להציג פעולה מסוימת
     * 
     * @param {Object} item - פריט מקושר
     * @param {string} actionType - סוג פעולה (VIEW, EDIT, DELETE, LINK, CANCEL, REACTIVATE)
     * @returns {boolean}
     * 
     * @example
     * if (LinkedItemsService.shouldShowAction(item, 'DELETE')) { ... }
     */
    static shouldShowAction(item, actionType) {
        if (!item || !actionType) return false;
        
        switch (actionType) {
            case 'VIEW':
                return true; // תמיד להציג VIEW
            case 'LINK':
                return false; // הוסר לפי דרישת המשתמש
            case 'EDIT':
                // לא להציג EDIT למצבים מסוימים
                return item.status !== 'cancelled' && item.status !== 'canceled';
            case 'DELETE':
                // תמיד להציג DELETE אם אין CANCEL/REACTIVATE
                return !this._getCancelFunctionForType(item.type, item.id, item.status);
            case 'CANCEL':
            case 'REACTIVATE':
                return !!this._getCancelFunctionForType(item.type, item.id, item.status);
            default:
                return false;
        }
    }
    
    /**
     * יצירת הודעת "אין פריטים" עם כפתור חיפוש
     * 
     * @param {string} entityType - סוג ישות
     * @param {string|number} entityId - מזהה ישות
     * @param {string} entityColor - צבע ישות
     * @returns {string} - HTML
     * 
     * @example
     * const emptyHtml = LinkedItemsService.renderEmptyLinkedItems('ticker', 123, '#019193');
     */
    static renderEmptyLinkedItems(entityType, entityId, entityColor = '#019193') {
        return `
            <div class="entity-linked-items">
                <h6 class="border-bottom pb-2 mb-3" style="border-bottom-color: ${entityColor} !important;">פריטים מקושרים</h6>
                <div class="text-muted text-center py-4">
                    <i class="fas fa-link fa-2x mb-3"></i>
                    <p>אין פריטים מקושרים</p>
                    <button class="btn btn-outline-primary btn-sm mt-2" onclick="window.showLinkedItemsModal([], '${entityType}', ${entityId || 'null'})">
                        <i class="fas fa-search me-1"></i>חפש פריטים מקושרים
                    </button>
                </div>
            </div>
        `;
    }
    
    // ===== PRIVATE HELPER METHODS =====
    
    /**
     * קבלת פונקציית LINK לפי סוג ישות
     * 
     * @private
     * @param {string} type - סוג ישות
     * @param {number|string} id - מזהה ישות
     * @returns {string|null} - פונקציה או null
     */
    static _getLinkedItemsFunctionForType(type, id) {
        const functions = {
            'trade': `viewLinkedItemsForTrade(${id})`,
            'trade_plan': `viewLinkedItemsForTradePlan(${id})`,
            'ticker': `viewLinkedItemsForTicker(${id})`,
            'trading_account': `viewLinkedItemsForAccount(${id})`,
            'alert': `viewLinkedItemsForAlert(${id})`,
            'cash_flow': `window.showLinkedItemsModal([], 'cash_flow', ${id})`,
            'execution': `viewLinkedItemsForExecution(${id})`,
            'note': `viewLinkedItemsForNote(${id})`
        };
        
        return functions[type] || `window.showLinkedItemsModal([], '${type}', ${id})`;
    }
    
    /**
     * קבלת פונקציית EDIT לפי סוג ישות
     * 
     * @private
     * @param {string} type - סוג ישות
     * @param {number|string} id - מזהה ישות
     * @returns {string|null} - פונקציה או null
     */
    static _getEditFunctionForType(type, id) {
        // מיפוי modalId לפי entityType
        const modalIdMap = {
            'trade': 'tradesModal',
            'trade_plan': 'tradePlansModal',
            'ticker': 'tickersModal',
            'trading_account': 'tradingAccountsModal',
            'alert': 'alertsModal',
            'cash_flow': 'cashFlowModal',
            'execution': 'executionsModal',
            'note': 'notesModal'
        };
        
        const modalId = modalIdMap[type];
        
        // אם יש modalId - השתמש ב-ModalManagerV2 (מערכת כללית)
        if (modalId && window.ModalManagerV2) {
            // לנוטס - נסה ליצור את המודל אם הוא לא קיים
            if (type === 'note') {
                return `(function() { 
                    if (window.ModalManagerV2) { 
                        try { 
                            window.ModalManagerV2.showEditModal('notesModal', 'note', ${id}); 
                        } catch (e) { 
                            console.warn('First attempt failed, trying to initialize notesModal:', e); 
                            if (window.notesModalConfig && typeof window.ModalManagerV2.createCRUDModal === 'function') { 
                                try { 
                                    window.ModalManagerV2.createCRUDModal(window.notesModalConfig); 
                                    setTimeout(() => { 
                                        window.ModalManagerV2.showEditModal('notesModal', 'note', ${id}); 
                                    }, 100); 
                                } catch (createError) { 
                                    console.error('Failed to create notesModal:', createError); 
                                    if (window.showErrorNotification) { 
                                        window.showErrorNotification('שגיאה', 'לא ניתן לפתוח מודל עריכה. נא לרענן את הדף.'); 
                                    } 
                                } 
                            } else if (window.showErrorNotification) { 
                                window.showErrorNotification('שגיאה', 'מודל הערות לא מוכן. נא לרענן את הדף.'); 
                            } 
                        } 
                    } 
                })()`;
            } else {
                // ישויות אחרות - שימוש ישיר ב-ModalManagerV2
                return `window.ModalManagerV2 && window.ModalManagerV2.showEditModal('${modalId}', '${type}', ${id})`;
            }
        }
        
        // Fallback לפונקציות ספציפיות (אם קיימות)
        const functions = {
            'trade': `editTradeRecord('${id}')`,
            'trade_plan': `editTradePlan('${id}')`,
            'trading_account': `editAccount('${id}')`,
            'alert': `editAlert(${id})`
        };
        
        return functions[type] || null;
    }
    
    /**
     * קבלת פונקציית CANCEL/REACTIVATE לפי סוג ישות
     * 
     * @private
     * @param {string} type - סוג ישות
     * @param {number|string} id - מזהה ישות
     * @param {string} status - סטטוס נוכחי
     * @returns {string|null} - פונקציה או null
     */
    static _getCancelFunctionForType(type, id, status) {
        const isCancelled = status === 'cancelled' || status === 'canceled';
        
        if (isCancelled) {
            // Reactivate functions
            const reactivateFunctions = {
                'trade': `window.reactivateTrade(${id})`,
                'trade_plan': `window.reactivateTradePlan(${id})`,
                'trading_account': `window.restoreTradingAccount(${id})`,
                'alert': `window.reactivateAlert(${id})`
            };
            return reactivateFunctions[type] || null;
        } else {
            // Cancel functions
            const cancelFunctions = {
                'trade': `cancelTradeRecord('${id}')`,
                'trade_plan': `window.openCancelTradePlanModal(${id})`,
                'trading_account': `window.cancelTradingAccountWithLinkedItemsCheck(${id})`,
                'alert': `window.cancelAlert(${id})`
            };
            return cancelFunctions[type] || null;
        }
    }
    
    /**
     * קבלת פונקציית DELETE לפי סוג ישות
     * 
     * @private
     * @param {string} type - סוג ישות
     * @param {number|string} id - מזהה ישות
     * @returns {string|null} - פונקציה או null
     */
    static _getDeleteFunctionForType(type, id) {
        // פונקציות ספציפיות (אם קיימות) - עדיפות על המערכת הכללית
        const specificFunctions = {
            'trade': `window.deleteTradeRecord && window.deleteTradeRecord(${id})`,
            'trade_plan': `window.deleteTradePlan && window.deleteTradePlan(${id})`,
            'ticker': `window.deleteTicker && window.deleteTicker(${id})`,
            'trading_account': `window.deleteTradingAccount && window.deleteTradingAccount(${id})`,
            'alert': `window.deleteAlert && window.deleteAlert(${id})`,
            'cash_flow': `window.deleteCashFlow && window.deleteCashFlow(${id})`,
            'execution': `window.deleteExecution && window.deleteExecution(${id})`,
            'note': `window.deleteNote && window.deleteNote(${id})`
        };
        
        // אם יש פונקציה ספציפית - השתמש בה
        if (specificFunctions[type]) {
            return specificFunctions[type];
        }
        
        // מערכת כללית - שימוש ב-EntityDetailsAPI
        // מיפוי פונקציות רענון לפי סוג ישות
        const refreshFuncMap = {
            'trade': 'loadTradesData',
            'trade_plan': 'loadTradePlansData',
            'ticker': 'loadTickersData',
            'trading_account': 'loadTradingAccountsData',
            'alert': 'loadAlertsData',
            'cash_flow': 'loadCashFlowsData',
            'execution': 'loadExecutionsData',
            'note': 'updateNotesTable'
        };
        
        const refreshFuncName = refreshFuncMap[type] || null;
        const refreshCode = refreshFuncName ? 
            `if (window.${refreshFuncName} && typeof window.${refreshFuncName} === 'function') { window.${refreshFuncName}(); }` : 
            '';
        
        return `(async function() {
            try {
                // בדיקת פריטים מקושרים לפני מחיקה
                if (window.checkLinkedItemsBeforeAction) {
                    const hasLinkedItems = await window.checkLinkedItemsBeforeAction('${type}', ${id}, 'delete');
                    if (hasLinkedItems) {
                        return; // המחיקה בוטלה - יש פריטים מקושרים
                    }
                }
                
                // מחיקה דרך EntityDetailsAPI (מערכת כללית)
                if (window.entityDetailsAPI && typeof window.entityDetailsAPI.deleteEntity === 'function') {
                    const deleted = await window.entityDetailsAPI.deleteEntity('${type}', ${id});
                    if (deleted) {
                        ${refreshCode}
                    }
                } else {
                    throw new Error('מערכת המחיקה הכללית לא זמינה');
                }
            } catch (error) {
                console.error('Error deleting ${type}:', error);
                if (window.showErrorNotification) {
                    window.showErrorNotification('שגיאה במחיקה', error.message || 'לא ניתן למחוק את הישות');
                }
            }
        })()`;
    }
}

// ===== GLOBAL EXPORT =====

/**
 * הוספה לאובייקט הגלובלי
 * 
 * @global
 * @name window.LinkedItemsService
 * @type {LinkedItemsService}
 */
window.LinkedItemsService = LinkedItemsService;

/**
 * Export for module systems
 * 
 * @module LinkedItemsService
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkedItemsService;
}

