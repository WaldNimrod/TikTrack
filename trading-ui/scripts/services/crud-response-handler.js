/**
 * CRUD Response Handler - TikTrack
 * ================================
 * 
 * מערכת מרכזית לטיפול בתגובות API של פעולות CRUD
 * מחליפה לוגיקה זהה ב-18 פונקציות save/update/delete
 * 
 * @version 2.0.0
 * @created January 2025
 * @updated October 2025 - Extended for data load errors
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - הפרדה אוטומטית בין שגיאות ולידציה (400) לשגיאות מערכת (500)
 * - סגירת modal אוטומטית
 * - רענון טבלה אוטומטי
 * - הצגת הודעות הצלחה/שגיאה
 * - תמיכה ב-cache clearing
 * - טיפול בשגיאות טעינת נתונים (GET) עם Retry + Copy Error Log
 */

// ===== CRUD RESPONSE HANDLER =====

class CRUDResponseHandler {
    /**
     * טיפול בתגובת שמירה (POST)
     * 
     * @param {Response} response - תגובת fetch
     * @param {Object} options - אופציות: { modalId, successMessage, reloadFn, entityName }
     * @returns {Promise<Object|null>} - נתוני התגובה או null במקרה של שגיאה
     * 
     * @example
     * const result = await CRUDResponseHandler.handleSaveResponse(response, {
     *   modalId: 'addTradeModal',
     *   successMessage: 'טרייד נוסף בהצלחה',
     *   reloadFn: window.loadTradesData,
     *   entityName: 'טרייד'
     * });
     */
    static async handleSaveResponse(response, options = {}) {
        try {
            // טיפול בתגובה לא תקינה
            if (!response.ok) {
                const errorData = await response.json();
                
                // שגיאת ולידציה (HTTP 400)
                if (response.status === 400) {
                    const message = errorData.message || errorData.error || 'נתונים לא תקינים';
                    
                    // אם יש parser מותאם לשגיאות validation ברמת שדות
                    if (options.customValidationParser && typeof options.customValidationParser === 'function') {
                        try {
                            const fieldErrors = options.customValidationParser(message, errorData);
                            if (fieldErrors && Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                                // סימון כל השדות הבעייתיים
                                fieldErrors.forEach(({ fieldId, message: fieldMessage }) => {
                                    if (fieldId && typeof window.showFieldError === 'function') {
                                        window.showFieldError(fieldId, fieldMessage);
                                    }
                                });
                            }
                        } catch (parserError) {
                            console.warn('⚠️ שגיאה ב-customValidationParser:', parserError);
                        }
                    }
                    
                    // הודעה כללית
                    if (typeof window.showSimpleErrorNotification === 'function') {
                        window.showSimpleErrorNotification('שגיאת ולידציה', message);
                    }
                    return null;
                }
                
                // שגיאת מערכת אחרת
                throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
            }

            // תגובה תקינה
            const result = await response.json();
            
            // הצגת הודעת הצלחה
            if (typeof window.showSuccessNotification === 'function') {
                const message = options.successMessage || `${options.entityName || 'פריט'} נוסף בהצלחה`;
                window.showSuccessNotification('הצלחה', message);
            }

            // סגירת modal
            if (options.modalId) {
                const modal = bootstrap.Modal.getInstance(document.getElementById(options.modalId));
                if (modal) {
                    modal.hide();
                }
            }

            // רענון טבלה
            if (options.reloadFn && typeof options.reloadFn === 'function') {
                await options.reloadFn();
            }

            return result;
            
        } catch (error) {
            console.error('❌ שגיאה בשמירה:', error);
            
            if (typeof window.showErrorNotification === 'function') {
                const message = `שגיאה בשמירת ${options.entityName || 'פריט'}`;
                window.showErrorNotification(message, error.message);
            }
            
            return null;
        }
    }

    /**
     * טיפול בתגובת עדכון (PUT)
     * 
     * @param {Response} response - תגובת fetch
     * @param {Object} options - אופציות: { modalId, successMessage, reloadFn, entityName }
     * @returns {Promise<Object|null>} - נתוני התגובה או null במקרה של שגיאה
     * 
     * @example
     * const result = await CRUDResponseHandler.handleUpdateResponse(response, {
     *   modalId: 'editTradeModal',
     *   successMessage: 'טרייד עודכן בהצלחה',
     *   reloadFn: window.loadTradesData,
     *   entityName: 'טרייד'
     * });
     */
    static async handleUpdateResponse(response, options = {}) {
        try {
            // טיפול בתגובה לא תקינה
            if (!response.ok) {
                const errorData = await response.json();
                
                // שגיאת ולידציה (HTTP 400)
                if (response.status === 400) {
                    const message = errorData.message || errorData.error || 'נתונים לא תקינים';
                    
                    // אם יש parser מותאם לשגיאות validation ברמת שדות
                    if (options.customValidationParser && typeof options.customValidationParser === 'function') {
                        try {
                            const fieldErrors = options.customValidationParser(message, errorData);
                            if (fieldErrors && Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                                // סימון כל השדות הבעייתיים
                                fieldErrors.forEach(({ fieldId, message: fieldMessage }) => {
                                    if (fieldId && typeof window.showFieldError === 'function') {
                                        window.showFieldError(fieldId, fieldMessage);
                                    }
                                });
                            }
                        } catch (parserError) {
                            console.warn('⚠️ שגיאה ב-customValidationParser:', parserError);
                        }
                    }
                    
                    // הודעה כללית
                    if (typeof window.showSimpleErrorNotification === 'function') {
                        window.showSimpleErrorNotification('שגיאת ולידציה', message);
                    }
                    return null;
                }
                
                // שגיאת מערכת אחרת
                throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
            }

            // תגובה תקינה
            const result = await response.json();
            
            // הצגת הודעת הצלחה
            if (typeof window.showSuccessNotification === 'function') {
                const message = options.successMessage || `${options.entityName || 'פריט'} עודכן בהצלחה`;
                window.showSuccessNotification('הצלחה', message);
            }

            // סגירת modal
            if (options.modalId) {
                const modal = bootstrap.Modal.getInstance(document.getElementById(options.modalId));
                if (modal) {
                    modal.hide();
                }
            }

            // רענון טבלה
            if (options.reloadFn && typeof options.reloadFn === 'function') {
                await options.reloadFn();
            }

            return result;
            
        } catch (error) {
            console.error('❌ שגיאה בעדכון:', error);
            
            if (typeof window.showErrorNotification === 'function') {
                const message = `שגיאה בעדכון ${options.entityName || 'פריט'}`;
                window.showErrorNotification(message, error.message);
            }
            
            return null;
        }
    }

    /**
     * טיפול בתגובת מחיקה (DELETE)
     * 
     * @param {Response} response - תגובת fetch
     * @param {Object} options - אופציות: { successMessage, reloadFn, entityName }
     * @returns {Promise<boolean>} - true אם הצליח, false אחרת
     * 
     * @example
     * const success = await CRUDResponseHandler.handleDeleteResponse(response, {
     *   successMessage: 'טרייד נמחק בהצלחה',
     *   reloadFn: window.loadTradesData,
     *   entityName: 'טרייד'
     * });
     */
    static async handleDeleteResponse(response, options = {}) {
        try {
            // טיפול בתגובה לא תקינה
            if (!response.ok) {
                const errorData = await response.json();
                
                // שגיאת ולידציה (HTTP 400) - למשל פריט מקושר
                if (response.status === 400) {
                    if (typeof window.showSimpleErrorNotification === 'function') {
                        const message = errorData.message || errorData.error || 'לא ניתן למחוק';
                        window.showSimpleErrorNotification('שגיאה במחיקה', message);
                    }
                    return false;
                }
                
                // שגיאת מערכת אחרת
                throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
            }

            // תגובה תקינה
            
            // הצגת הודעת הצלחה
            if (typeof window.showSuccessNotification === 'function') {
                const message = options.successMessage || `${options.entityName || 'פריט'} נמחק בהצלחה`;
                window.showSuccessNotification('הצלחה', message);
            }

            // רענון טבלה
            if (options.reloadFn && typeof options.reloadFn === 'function') {
                await options.reloadFn();
            }

            return true;
            
        } catch (error) {
            console.error('❌ שגיאה במחיקה:', error);
            
            if (typeof window.showErrorNotification === 'function') {
                const message = `שגיאה במחיקת ${options.entityName || 'פריט'}`;
                window.showErrorNotification(message, error.message);
            }
            
            return false;
        }
    }

    /**
     * טיפול כללי בשגיאות
     * 
     * @param {Error} error - אובייקט שגיאה
     * @param {string} operation - שם הפעולה (למשל: "שמירת טרייד")
     * 
     * @example
     * CRUDResponseHandler.handleError(error, 'שמירת טרייד');
     */
    static handleError(error, operation = 'פעולה') {
        console.error(`❌ שגיאה ב${operation}:`, error);
        
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(`שגיאה ב${operation}`, error.message || 'שגיאה לא ידועה');
        }
    }

    /**
     * ביצוע פעולת CRUD מלאה (fetch + טיפול בתגובה)
     * 
     * @param {string} url - URL של ה-API
     * @param {Object} fetchOptions - אופציות fetch (method, body, headers)
     * @param {Object} handlerOptions - אופציות לטיפול בתגובה
     * @returns {Promise<Object|null>} - תוצאה או null
     * 
     * @example
     * const result = await CRUDResponseHandler.executeCRUDOperation('/api/trades/', {
     *   method: 'POST',
     *   body: JSON.stringify(tradeData),
     *   headers: { 'Content-Type': 'application/json' }
     * }, {
     *   modalId: 'addTradeModal',
     *   successMessage: 'טרייד נוסף בהצלחה',
     *   reloadFn: window.loadTradesData,
     *   entityName: 'טרייד'
     * });
     */
    static async executeCRUDOperation(url, fetchOptions, handlerOptions = {}) {
        try {
            const response = await fetch(url, fetchOptions);
            
            // קביעת סוג הפעולה
            const method = fetchOptions.method?.toUpperCase();
            
            if (method === 'POST') {
                return await this.handleSaveResponse(response, handlerOptions);
            } else if (method === 'PUT' || method === 'PATCH') {
                return await this.handleUpdateResponse(response, handlerOptions);
            } else if (method === 'DELETE') {
                return await this.handleDeleteResponse(response, handlerOptions);
            } else {
                // GET או אחר
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            }
            
        } catch (error) {
            this.handleError(error, handlerOptions.operation || 'פעולה');
            return null;
        }
    }

    /**
     * טיפול בשגיאות טעינת נתונים (GET) - תגובת שרת לא תקינה
     * 
     * @param {Response} response - תגובת fetch
     * @param {Object} options - אופציות
     * @param {string} options.tableId - מזהה הטבלה (e.g., 'alertsTable')
     * @param {string} options.entityName - שם הישות בעברית (e.g., 'התראות')
     * @param {number} [options.columns] - מספר עמודות (auto-detect if omitted)
     * @param {Function} [options.onRetry] - פונקציית retry
     * @returns {Array} מערך ריק (never throws)
     * 
     * @example
     * return CRUDResponseHandler.handleLoadResponse(response, {
     *   tableId: 'alertsTable',
     *   entityName: 'התראות',
     *   columns: 8,
     *   onRetry: loadAlertsData
     * });
     */
    static handleLoadResponse(response, options = {}) {
        const { tableId, entityName, columns, onRetry } = options;

        console.error(`❌ Server error ${response.status} loading ${entityName || 'data'}`);

        // User notification
        if (typeof window.showNotification === 'function') {
            window.showNotification(
                `❌ שגיאת שרת (${response.status}) - לא ניתן לטעון ${entityName || 'נתונים'}`,
                'error',
                'שגיאת טעינה'
            );
        }

        // Table UI error message
        this._renderTableError({
            tableId,
            columns,
            icon: 'fa-exclamation-triangle',
            title: `שגיאת שרת (${response.status})`,
            message: `לא ניתן לטעון ${entityName || 'נתונים'} מהשרת`,
            onRetry,
            errorType: 'server'
        });

        return [];
    }

    /**
     * טיפול בשגיאות רשת (fetch failed, timeout)
     * 
     * @param {Error} error - אובייקט השגיאה
     * @param {Object} options - אופציות
     * @param {string} options.tableId - מזהה הטבלה
     * @param {string} options.entityName - שם הישות בעברית
     * @param {number} [options.columns] - מספר עמודות
     * @param {Function} [options.onRetry] - פונקציית retry
     * @returns {Array} מערך ריק (never throws)
     * 
     * @example
     * return CRUDResponseHandler.handleNetworkError(error, {
     *   tableId: 'alertsTable',
     *   entityName: 'התראות',
     *   columns: 8,
     *   onRetry: loadAlertsData
     * });
     */
    static handleNetworkError(error, options = {}) {
        const { tableId, entityName, columns, onRetry } = options;

        console.error(`❌ Network error loading ${entityName || 'data'}:`, error);

        // User notification
        if (typeof window.showNotification === 'function') {
            window.showNotification(
                `❌ שגיאת רשת - לא ניתן לטעון ${entityName || 'נתונים'}`,
                'error',
                'שגיאת חיבור'
            );
        }

        // Table UI error message
        this._renderTableError({
            tableId,
            columns,
            icon: 'fa-wifi',
            title: 'שגיאת חיבור לשרת',
            message: 'בדוק חיבור לאינטרנט ונסה לרענן את הדף',
            onRetry,
            errorType: 'network',
            errorDetails: error.message
        });

        return [];
    }

    /**
     * רינדור הודעת שגיאה בטבלה עם כפתורי Retry ו-Copy Error Log
     * @private
     * 
     * @param {Object} config - קונפיגורציה
     * @param {string} config.tableId - מזהה הטבלה
     * @param {number} [config.columns] - מספר עמודות (auto-detect if omitted)
     * @param {string} config.icon - Font Awesome icon class
     * @param {string} config.title - כותרת השגיאה
     * @param {string} config.message - תיאור השגיאה
     * @param {Function} [config.onRetry] - פונקציית retry
     * @param {string} [config.errorType] - סוג השגיאה (server/network)
     * @param {string} [config.errorDetails] - פרטי שגיאה נוספים
     */
    static _renderTableError(config) {
        const { tableId, columns, icon, title, message, onRetry, errorType, errorDetails } = config;

        if (!tableId) {
            console.warn('⚠️ _renderTableError: tableId is required');
            return;
        }

        const tbody = document.querySelector(`#${tableId} tbody`);
        if (!tbody) {
            console.warn(`⚠️ _renderTableError: tbody not found for table #${tableId}`);
            return;
        }

        // Auto-detect columns if not provided
        const columnCount = columns || 
                           tbody.closest('table')?.querySelectorAll('thead th').length || 
                           20;

        // Generate error log for copy
        const errorLog = {
            timestamp: new Date().toISOString(),
            table: tableId,
            errorType: errorType || 'unknown',
            title,
            message,
            details: errorDetails || 'N/A',
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };

        const errorLogString = JSON.stringify(errorLog, null, 2);

        // Retry button (only if onRetry provided)
        const retryBtn = onRetry && typeof onRetry === 'function' ? `
            <button class="btn btn-sm btn-primary mt-2" onclick="(${onRetry.toString()})()">
                <i class="fas fa-sync"></i> נסה שוב
            </button>
        ` : '';

        // Copy error log button
        const copyBtn = `
            <button class="btn btn-sm btn-outline-secondary mt-2 ms-2" 
                    onclick="navigator.clipboard.writeText(\`${errorLogString.replace(/`/g, '\\`')}\`).then(() => { if (typeof window.showNotification === 'function') { window.showNotification('Log הועתק ללוח', 'success'); } else { alert('Log הועתק ללוח'); } })">
                <i class="fas fa-copy"></i> העתק פרטי שגיאה
            </button>
        `;

        tbody.innerHTML = `
            <tr>
                <td colspan="${columnCount}" class="text-center" style="color: #e74c3c; padding: 20px;">
                    <i class="fas ${icon} fa-2x mb-2"></i><br>
                    <strong style="font-size: 1.1em;">${title}</strong><br>
                    <small>${message}</small><br>
                    ${retryBtn}
                    ${copyBtn}
                </td>
            </tr>
        `;
    }
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.CRUDResponseHandler = CRUDResponseHandler;

// Shortcuts למתודות נפוצות - CRUD Operations
window.handleSaveResponse = (response, options) => CRUDResponseHandler.handleSaveResponse(response, options);
window.handleUpdateResponse = (response, options) => CRUDResponseHandler.handleUpdateResponse(response, options);
window.handleDeleteResponse = (response, options) => CRUDResponseHandler.handleDeleteResponse(response, options);
window.executeCRUDOperation = (url, fetchOptions, handlerOptions) => CRUDResponseHandler.executeCRUDOperation(url, fetchOptions, handlerOptions);

// Shortcuts למתודות חדשות - Data Load Errors (v2.0.0)
window.handleLoadResponse = (response, options) => CRUDResponseHandler.handleLoadResponse(response, options);
window.handleNetworkError = (error, options) => CRUDResponseHandler.handleNetworkError(error, options);

console.log('✅ CRUDResponseHandler v2.0.0 loaded successfully (now supports data load errors)');

