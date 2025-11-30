/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 13
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
 * PRIVATE HELPERS (5)
 * - _getLinkedItemsFunctionForType() - קבלת פונקציית LINK לפי סוג ישות
 * - _getEditFunctionForType() - קבלת פונקציית EDIT לפי סוג ישות
 * - _getCancelFunctionForType() - קבלת פונקציית CANCEL/REACTIVATE לפי סוג ישות
 * - _getUnlinkFunctionForTradePlan() - קבלת פונקציית UNLINK/LINK עבור trade ↔ trade_plan
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
    static async getLinkedItemIcon(entityType) {
        // Use IconSystem if available, fallback to old method
        if (typeof window.IconSystem !== 'undefined' && window.IconSystem.getEntityIcon) {
            try {
                return await window.IconSystem.getEntityIcon(entityType);
            } catch (error) {
                if (typeof window.Logger !== 'undefined') {
                    window.Logger.warn('⚠️ Error getting linked item icon from IconSystem, using fallback', { entityType, error, page: 'linked-items-service' });
                }
            }
        }
        
        // Fallback to old method
        const iconMappings = {
            ticker: '/trading-ui/images/icons/entities/tickers.svg',
            trade: '/trading-ui/images/icons/entities/trades.svg',
            trade_plan: '/trading-ui/images/icons/entities/trade_plans.svg',
            execution: '/trading-ui/images/icons/entities/executions.svg',
            trading_account: '/trading-ui/images/icons/entities/trading_accounts.svg',
            account: '/trading-ui/images/icons/entities/trading_accounts.svg',
            alert: '/trading-ui/images/icons/entities/alerts.svg',
            cash_flow: '/trading-ui/images/icons/entities/cash_flows.svg',
            note: '/trading-ui/images/icons/entities/notes.svg',
            position: '/trading-ui/images/icons/entities/trades.svg'
        };
        
        return iconMappings[entityType] || '/trading-ui/images/icons/entities/home.svg';
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
        
        // First, try provided entity colors
        if (options.entityColors && options.entityColors[entityType]) {
            return options.entityColors[entityType];
        }
        
        // Use centralized Color Scheme System
        if (typeof window.getEntityColor === 'function') {
            const color = window.getEntityColor(entityType);
            if (color) {
                return color;
            }
        }
        
        // No hardcoded fallback - return empty string to force system to load from preferences
        if (window.Logger && window.Logger.warn) {
            window.Logger.warn(`⚠️ No color found for entity type: ${entityType} - Color Scheme System should load from preferences`, {
                page: 'linked-items-service'
            });
        }
        return '';
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
            'note': 'הערה'
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
        
        // כפתור UNLINK/LINK עבור trade ↔ trade_plan (אם רלוונטי)
        // בדיקה אם זה trade_plan ב-linked items של trade, או trade ב-linked items של trade_plan
        const sourceType = options.sourceInfo?.sourceType || options.sourceType;
        const sourceId = options.sourceInfo?.sourceId || options.sourceId;
        const unlinkFunction = this._getUnlinkFunctionForTradePlan(item, sourceType, sourceId);
        if (unlinkFunction) {
            const isLinked = (item.type === 'trade' && item.trade_plan_id) || 
                            (item.type === 'trade_plan' && sourceType === 'trade' && sourceId);
            const unlinkType = isLinked ? 'UNLINK' : 'LINK';
            const unlinkTitle = isLinked ? 'בטל קישור' : 'קשר לתוכנית';
            actionsHtml += `<button data-button-type="${unlinkType}" data-variant="small" data-onclick="${unlinkFunction}" data-text="" title="${unlinkTitle}"></button>`;
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
        
        // מיפוי config name לפי entityType
        const configNameMap = {
            'trade': 'tradesModalConfig',
            'trade_plan': 'tradePlansModalConfig',
            'ticker': 'tickersModalConfig',
            'trading_account': 'tradingAccountsModalConfig',
            'alert': 'alertsModalConfig',
            'cash_flow': 'cashFlowModalConfig',
            'execution': 'executionsModalConfig',
            'note': 'notesModalConfig'
        };
        
        // מיפוי config file path לפי entityType
        const configFileMap = {
            'trade': '/scripts/modal-configs/trades-config.js?v=1.0.0',
            'trade_plan': '/scripts/modal-configs/trade-plans-config.js?v=1.0.0',
            'ticker': '/scripts/modal-configs/tickers-config.js?v=1.0.0',
            'trading_account': '/scripts/modal-configs/trading-accounts-config.js?v=1.0.0',
            'alert': '/scripts/modal-configs/alerts-config.js?v=1.0.0',
            'cash_flow': '/scripts/modal-configs/cash-flows-config.js?v=1.0.0',
            'execution': '/scripts/modal-configs/executions-config.js?v=1.0.0',
            'note': '/scripts/modal-configs/notes-config.js?v=1.0.0'
        };
        
        const modalId = modalIdMap[type];
        const configName = configNameMap[type];
        const configFile = configFileMap[type];
        
        // אם יש modalId - השתמש ב-ModalManagerV2 (מערכת כללית)
        if (modalId && window.ModalManagerV2) {
            // פונקציה מאוחדת לטעינה ופתיחה של מודל עריכה
            return `(async function() { 
                if (!window.ModalManagerV2) {
                    if (window.showErrorNotification) {
                        window.showErrorNotification('שגיאה', 'מערכת המודולים לא זמינה. נא לרענן את הדף.');
                    }
                    return;
                }
                
                try {
                    // נסה לפתוח את המודל ישירות
                    // הערה: notes-config.js נטען מראש ב-trades.html, אז המודל אמור להיות זמין
                    await window.ModalManagerV2.showEditModal('${modalId}', '${type}', ${id});
                } catch (e) {
                    // Fallback: אם המודל לא קיים, נסה לטעון את הקונפיגורציה דינמית
                    // הערה: זה fallback בלבד - modal configs אמורים להיטען מראש דרך package-manifest
                    const modalElement = document.getElementById('${modalId}');
                    if (!modalElement && window.ModalManagerV2.createCRUDModal) {
                        // בדיקה אם הקונפיגורציה קיימת
                        if (!window.${configName}) {
                            // טעינה דינמית של הקונפיגורציה (fallback בלבד)
                            window.Logger?.warn('Modal config not loaded, attempting dynamic load (fallback)', {
                                modalId: '${modalId}',
                                configName: '${configName}',
                                configFile: '${configFile}',
                                page: 'linked-items-service'
                            });
                            try {
                                const script = document.createElement('script');
                                script.src = '${configFile}';
                                script.async = false; // לא async כדי להבטיח סדר טעינה
                                await new Promise((resolve, reject) => {
                                    script.onload = () => {
                                        if (window.${configName}) {
                                            resolve();
                                        } else {
                                            reject(new Error('${configName} not found after loading script'));
                                        }
                                    };
                                    script.onerror = reject;
                                    document.head.appendChild(script);
                                });
                            } catch (loadError) {
                                console.error('Failed to load ${configFile}:', loadError);
                                if (window.showErrorNotification) {
                                    window.showErrorNotification('שגיאה', 'לא ניתן לטעון את קונפיגורציית המודל. נא לרענן את הדף.');
                                }
                                return;
                            }
                        }
                        
                        // יצירת המודל מהקונפיגורציה
                        if (window.${configName} && typeof window.ModalManagerV2.createCRUDModal === 'function') {
                            try {
                                window.ModalManagerV2.createCRUDModal(window.${configName});
                                // המתנה קצרה כדי להבטיח שהמודל נוצר
                                await new Promise(resolve => setTimeout(resolve, 150));
                                // נסה שוב לפתוח את המודל
                                await window.ModalManagerV2.showEditModal('${modalId}', '${type}', ${id});
                            } catch (createError) {
                                console.error('Failed to create ${modalId}:', createError);
                                if (window.showErrorNotification) {
                                    window.showErrorNotification('שגיאה', 'לא ניתן לפתוח מודל עריכה. נא לרענן את הדף.');
                                }
                            }
                        } else {
                            if (window.showErrorNotification) {
                                window.showErrorNotification('שגיאה', 'קונפיגורציית המודל לא זמינה. נא לרענן את הדף.');
                            }
                        }
                    } else {
                        // אם המודל קיים אבל יש שגיאה אחרת
                        console.error('Error opening ${modalId}:', e);
                        if (window.showErrorNotification) {
                            window.showErrorNotification('שגיאה', 'לא ניתן לפתוח מודל עריכה. נא לרענן את הדף.');
                        }
                    }
                }
            })()`;
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
                'trading_account': `window.reactivateAccount(${id})`,
                'alert': `window.reactivateAlert(${id})`
            };
            return reactivateFunctions[type] || null;
        } else {
            // Cancel functions
            const cancelFunctions = {
                'trade': `cancelTradeRecord('${id}')`,
                'trade_plan': `window.openCancelTradePlanModal(${id})`,
                'trading_account': `window.cancelAccount(${id})`,
                'alert': `window.cancelAlert(${id})`
            };
            return cancelFunctions[type] || null;
        }
    }
    
    /**
     * קבלת פונקציית UNLINK/LINK עבור trade ↔ trade_plan
     * 
     * תומך בביטול קישור בין trade ל-trade_plan ולהפך.
     * 
     * @private
     * @param {Object} item - פריט מקושר
     * @param {string} sourceType - סוג הישות המקורית (trade או trade_plan)
     * @param {number|string} sourceId - מזהה הישות המקורית
     * @returns {string|null} - פונקציה או null
     */
    static _getUnlinkFunctionForTradePlan(item, sourceType, sourceId) {
        // רק עבור trade ↔ trade_plan
        if ((item.type === 'trade' && sourceType === 'trade_plan') || 
            (item.type === 'trade_plan' && sourceType === 'trade')) {
            
            if (item.type === 'trade') {
                // trade ב-linked items של trade_plan - אפשר לבטל קישור
                if (item.trade_plan_id) {
                    // Unlink: עדכון trade.trade_plan_id = null
                    return `(async function() {
                        try {
                            if (window.UnifiedCRUDService && typeof window.UnifiedCRUDService.updateEntity === 'function') {
                                const success = await window.UnifiedCRUDService.updateEntity('trade', ${item.id}, {
                                    trade_plan_id: null
                                }, {
                                    successMessage: 'קישור לתוכנית בוטל בהצלחה',
                                    entityName: 'טרייד',
                                    reloadFn: () => {
                                        if (window.loadTradesData) window.loadTradesData();
                                        if (window.loadTradePlansData) window.loadTradePlansData();
                                    }
                                });
                                if (success) {
                                    // רענון מודל המקושרים אם קיים
                                    const currentModal = document.querySelector('#linkedItemsModal');
                                    if (currentModal) {
                                        const modalSourceId = currentModal.dataset.sourceId;
                                        const modalSourceType = currentModal.dataset.sourceType;
                                        if (modalSourceId && modalSourceType && window.showLinkedItemsModal) {
                                            window.showLinkedItemsModal([], modalSourceType, modalSourceId);
                                        }
                                    }
                                }
                            } else {
                                // Fallback ל-fetch ישיר
                                const response = await fetch('/api/trades/${item.id}', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ trade_plan_id: null })
                                });
                                if (response.ok) {
                                    if (window.showSuccessNotification) {
                                        window.showSuccessNotification('הצלחה', 'קישור לתוכנית בוטל בהצלחה');
                                    }
                                    if (window.loadTradesData) window.loadTradesData();
                                    if (window.loadTradePlansData) window.loadTradePlansData();
                                } else {
                                    throw new Error('לא ניתן לבטל את הקישור');
                                }
                            }
                        } catch (error) {
                            console.error('Error unlinking trade from plan:', error);
                            if (window.showErrorNotification) {
                                window.showErrorNotification('שגיאה', error.message || 'לא ניתן לבטל את הקישור');
                            }
                        }
                    })()`;
                }
            } else if (item.type === 'trade_plan' && sourceType === 'trade' && sourceId) {
                // trade_plan ב-linked items של trade - אפשר לבטל קישור
                // Unlink: עדכון trade.trade_plan_id = null (עדכון ה-trade, לא ה-trade_plan)
                return `(async function() {
                    try {
                        const tradeId = ${sourceId};
                        if (!tradeId) {
                            throw new Error('לא ניתן לבטל קישור - טרייד לא נמצא');
                        }
                        
                        if (window.UnifiedCRUDService && typeof window.UnifiedCRUDService.updateEntity === 'function') {
                            const success = await window.UnifiedCRUDService.updateEntity('trade', tradeId, {
                                trade_plan_id: null
                            }, {
                                successMessage: 'קישור לתוכנית בוטל בהצלחה',
                                entityName: 'טרייד',
                                reloadFn: () => {
                                    if (window.loadTradesData) window.loadTradesData();
                                    if (window.loadTradePlansData) window.loadTradePlansData();
                                }
                            });
                            if (success) {
                                // רענון מודל המקושרים אם קיים
                                if (currentModal && window.showLinkedItemsModal) {
                                    const modalSourceId = currentModal.dataset.sourceId;
                                    const modalSourceType = currentModal.dataset.sourceType;
                                    if (modalSourceId && modalSourceType) {
                                        window.showLinkedItemsModal([], modalSourceType, modalSourceId);
                                    }
                                }
                            }
                        } else {
                            // Fallback ל-fetch ישיר
                            const response = await fetch('/api/trades/' + tradeId, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ trade_plan_id: null })
                            });
                            if (response.ok) {
                                if (window.showSuccessNotification) {
                                    window.showSuccessNotification('הצלחה', 'קישור לתוכנית בוטל בהצלחה');
                                }
                                if (window.loadTradesData) window.loadTradesData();
                                if (window.loadTradePlansData) window.loadTradePlansData();
                            } else {
                                throw new Error('לא ניתן לבטל את הקישור');
                            }
                        }
                    } catch (error) {
                        console.error('Error unlinking trade from plan:', error);
                        if (window.showErrorNotification) {
                            window.showErrorNotification('שגיאה', error.message || 'לא ניתן לבטל את הקישור');
                        }
                    }
                })()`;
            }
        }
        
        return null;
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
        
        // פונקציות ספציפיות (אם קיימות) - עדיפות על המערכת הכללית
        const specificFunctions = {
            'trade': 'window.deleteTradeRecord',
            'trade_plan': 'window.deleteTradePlan',
            'ticker': 'window.deleteTicker',
            'trading_account': 'window.deleteTradingAccount',
            'alert': 'window.deleteAlert',
            'cash_flow': 'window.deleteCashFlow',
            'execution': 'window.deleteExecution',
            'note': 'window.deleteNote'
        };
        
        const specificFuncName = specificFunctions[type];
        
        // אם יש פונקציה ספציפית - בדוק אם היא קיימת, אחרת השתמש במערכת הכללית
        if (specificFuncName) {
            return `(async function() {
                const specificFunc = ${specificFuncName};
                if (specificFunc && typeof specificFunc === 'function') {
                    // יש פונקציה ספציפית - השתמש בה
                    try {
                        await specificFunc(${id});
                    } catch (error) {
                        console.error('Error in specific delete function:', error);
                        if (window.showErrorNotification) {
                            window.showErrorNotification('שגיאה במחיקה', error.message || 'לא ניתן למחוק את הישות');
                        }
                    }
                } else {
                    // אין פונקציה ספציפית - השתמש ב-UnifiedCRUDService
                    try {
                        // בדיקת פריטים מקושרים לפני מחיקה
                        const checkLinkedItems = async (entityType, entityId) => {
                            if (window.checkLinkedItemsBeforeAction) {
                                return await window.checkLinkedItemsBeforeAction(entityType, entityId, 'delete');
                            }
                            return false;
                        };
                        
                        // שימוש ב-UnifiedCRUDService.deleteEntity (מערכת מאוחדת)
                        if (window.UnifiedCRUDService && typeof window.UnifiedCRUDService.deleteEntity === 'function') {
                            const success = await window.UnifiedCRUDService.deleteEntity('${type}', ${id}, {
                                checkLinkedItems: checkLinkedItems,
                                reloadFn: ${refreshFuncName ? `() => { if (window.${refreshFuncName}) window.${refreshFuncName}(); }` : 'null'}
                            });
                            
                            if (!success) {
                                // המחיקה בוטלה או נכשלה - UnifiedCRUDService כבר הציג הודעות
                                return;
                            }
                        } else if (window.entityDetailsAPI && typeof window.entityDetailsAPI.deleteEntity === 'function') {
                            // Fallback ל-EntityDetailsAPI אם UnifiedCRUDService לא זמין
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
                }
            })()`;
        }
        
        // מערכת כללית - שימוש ב-UnifiedCRUDService (אם אין פונקציה ספציפית)
        return `(async function() {
            try {
                // בדיקת פריטים מקושרים לפני מחיקה
                const checkLinkedItems = async (entityType, entityId) => {
                    if (window.checkLinkedItemsBeforeAction) {
                        return await window.checkLinkedItemsBeforeAction(entityType, entityId, 'delete');
                    }
                    return false;
                };
                
                // שימוש ב-UnifiedCRUDService.deleteEntity (מערכת מאוחדת)
                if (window.UnifiedCRUDService && typeof window.UnifiedCRUDService.deleteEntity === 'function') {
                    const success = await window.UnifiedCRUDService.deleteEntity('${type}', ${id}, {
                        checkLinkedItems: checkLinkedItems,
                        reloadFn: ${refreshFuncName ? `() => { if (window.${refreshFuncName}) window.${refreshFuncName}(); }` : 'null'}
                    });
                    
                    if (!success) {
                        // המחיקה בוטלה או נכשלה - UnifiedCRUDService כבר הציג הודעות
                        return;
                    }
                } else if (window.entityDetailsAPI && typeof window.entityDetailsAPI.deleteEntity === 'function') {
                    // Fallback ל-EntityDetailsAPI אם UnifiedCRUDService לא זמין
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

