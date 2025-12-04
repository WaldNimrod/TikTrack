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
     * @param {Object} options - אופציות: { modalId, successMessage, reloadFn, entityName, requiresHardReload }
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
        console.log('🔵 handleSaveResponse CALLED');
        console.log('🔵 handleSaveResponse - response ok:', response.ok);
        console.log('🔵 handleSaveResponse - options:', options);
        
        try {
            // טיפול בתגובה לא תקינה
            if (!response.ok) {
                console.log('❌ handleSaveResponse - Response not OK');
                console.log('❌ Response status:', response.status);
                console.log('❌ Response statusText:', response.statusText);
                
                let errorData;
                try {
                    const responseText = await response.text();
                    console.log('❌ Response text (raw):', responseText);
                    errorData = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('❌ Failed to parse error response:', parseError);
                    errorData = { error: 'שגיאה לא צפויה מהשרת' };
                }
                
                console.log('❌ Error data:', errorData);
                console.log('❌ Error message:', errorData.message || errorData.error);
                console.log('❌ Full error object:', JSON.stringify(errorData, null, 2));
                
                // שגיאת ולידציה (HTTP 400)
                if (response.status === 400) {
                    // Ensure message is a string
                    let message = errorData.message || errorData.error || 'נתונים לא תקינים';
                    if (typeof message === 'object') {
                        message = message.message || JSON.stringify(message);
                    }
                    
                    // Log detailed validation error
                    console.error('❌ Validation Error Details:', {
                        status: response.status,
                        message: message,
                        errorData: errorData,
                        errorMessage: errorData.error?.message || errorData.error,
                        errors: errorData.errors || errorData.error
                    });
                    
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
            console.log('✅ handleSaveResponse - Response OK, reading JSON...');
            const result = await response.json();
            console.log('✅ handleSaveResponse - JSON read successfully');
            console.log('🔍 handleSaveResponse - result structure:', {
                hasStatus: 'status' in result,
                hasData: 'data' in result,
                hasId: result?.data?.id !== undefined,
                resultId: result?.data?.id,
                resultKeys: Object.keys(result),
                dataKeys: result?.data ? Object.keys(result.data) : []
            });
            
            // הצגת הודעת הצלחה
            if (typeof window.showSuccessNotification === 'function') {
                const message = options.successMessage || `${options.entityName || 'פריט'} נוסף בהצלחה`;
                console.log('✅ handleSaveResponse - Showing success notification:', message);
                window.showSuccessNotification('הצלחה', message);
            }

            // סגירת modal
            if (options.modalId) {
                console.log('✅ handleSaveResponse - Closing modal:', options.modalId);
                if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                    window.ModalManagerV2.hideModal(options.modalId);
                } else if (bootstrap?.Modal) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById(options.modalId));
                    if (modal) {
                        modal.hide();
                    }
                }
            }

            // רענון טבלה - מערכת מרכזית
            console.log('✅ handleSaveResponse - Calling handleTableRefresh...');
            
            await this.handleTableRefresh(options);
            console.log('✅ handleSaveResponse - handleTableRefresh completed');

            return result;
            
        } catch (error) {
            console.error('❌ handleSaveResponse - Error caught:', error);
            console.error('❌ handleSaveResponse - Error message:', error.message);
            console.error('❌ handleSaveResponse - Error stack:', error.stack);
            
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
     * @param {Object} options - אופציות: { modalId, successMessage, reloadFn, entityName, requiresHardReload }
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
                    // Ensure message is a string
                    let message = errorData.message || errorData.error || 'נתונים לא תקינים';
                    if (typeof message === 'object') {
                        message = message.message || JSON.stringify(message);
                    }
                    
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
                if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                    window.ModalManagerV2.hideModal(options.modalId);
                } else if (bootstrap?.Modal) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById(options.modalId));
                    if (modal) {
                        modal.hide();
                    }
                }
            }

            // רענון טבלה - מערכת מרכזית
            await this.handleTableRefresh(options);
            
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
        console.log('🔥🔥🔥 handleDeleteResponse CALLED with response status:', response.status);
        console.log('🔥 handleDeleteResponse - options:', options);
        
        try {
            // טיפול בתגובה לא תקינה
            if (!response.ok) {
                console.log('❌ handleDeleteResponse - Response not OK, status:', response.status);
                const errorData = await response.json();
                console.log('❌ handleDeleteResponse - Error data:', errorData);
                
                // שגיאת ולידציה (HTTP 400) - למשל פריט מקושר
                if (response.status === 400) {
                    console.log('❌ handleDeleteResponse - 400 error, showing validation error');
                    if (typeof window.showSimpleErrorNotification === 'function') {
                        const errorMsg = typeof errorData.error === 'object' ? errorData.error?.message : errorData.error;
                        const message = typeof errorData.message === 'object' ? errorData.message?.message : errorData.message;
                        
                        // Provide detailed error message
                        const entityTypeName = options.entityName || 'הפריט';
                        let finalMessage;
                        
                        if (errorMsg || message) {
                            finalMessage = `לא ניתן למחוק את ${entityTypeName}: ${errorMsg || message}`;
                        } else {
                            finalMessage = `לא ניתן למחוק את ${entityTypeName}. ייתכן שהפריט קשור לפריטים אחרים במערכת (למשל, טריידים או הערות).`;
                        }
                        
                        window.showSimpleErrorNotification('שגיאה במחיקה', finalMessage);
                    }
                    return false;
                }
                
                // שגיאת 404 - פריט לא נמצא
                // NOTE: Even if item not found (404), we still need to refresh the table
                // because the item might have been deleted by another user or the UI state is stale
                if (response.status === 404) {
                    console.log('❌ handleDeleteResponse - 404 error, item not found - refreshing table anyway');
                    if (typeof window.showErrorNotification === 'function') {
                        const errorMsg = typeof errorData.error === 'object' ? errorData.error?.message : errorData.error;
                        const message = typeof errorData.message === 'object' ? errorData.message?.message : errorData.message;
                        
                        // Provide detailed error message to user
                        const entityTypeName = options.entityName || 'הפריט';
                        let finalMessage;
                        
                        if (errorMsg || message) {
                            finalMessage = `${entityTypeName} לא נמצא במערכת: ${errorMsg || message}`;
                        } else {
                            finalMessage = `${entityTypeName} לא נמצא במערכת. ייתכן שכבר נמחק על ידי משתמש אחר או שהמצב הנוכחי של הדף לא מעודכן.`;
                        }
                        
                        window.showErrorNotification('שגיאה במחיקה', finalMessage);
                    }
                    
                    // Still refresh the table to sync with server state
                    console.log('🔥 handleDeleteResponse - 404: Calling handleTableRefresh to sync UI with server...');
                    await this.handleTableRefresh(options);
                    console.log('🔥 handleDeleteResponse - 404: handleTableRefresh completed');
                    
                    return false;
                }
                
                // שגיאת מערכת אחרת
                console.log('❌ handleDeleteResponse - System error, throwing:', errorData.message || errorData.error);
                const errorMsg = typeof errorData.error === 'object' ? errorData.error?.message : errorData.error;
                const message = typeof errorData.message === 'object' ? errorData.message?.message : errorData.message;
                throw new Error(message || errorMsg || `HTTP error! status: ${response.status}`);
            }

            // תגובה תקינה
            console.log('✅ handleDeleteResponse - Response OK, proceeding with success flow');
            
            // הצגת הודעת הצלחה
            if (typeof window.showSuccessNotification === 'function') {
                const message = options.successMessage || `${options.entityName || 'פריט'} נמחק בהצלחה`;
                console.log('🔥 handleDeleteResponse - Showing success notification:', message);
                window.showSuccessNotification('הצלחה', message);
            }

            // רענון טבלה - מערכת מרכזית
            console.log('🔥 handleDeleteResponse - Calling handleTableRefresh...');
            await this.handleTableRefresh(options);
            console.log('🔥 handleDeleteResponse - handleTableRefresh completed');

            console.log('✅ handleDeleteResponse - Success flow completed, returning true');
            return true;
            
        } catch (error) {
            console.error('❌ handleDeleteResponse - Error occurred:', error);
            
            if (typeof window.showErrorNotification === 'function') {
                const entityTypeName = options.entityName || 'הפריט';
                const errorMessage = error.message || 'שגיאה לא ידועה';
                const message = `שגיאה במחיקת ${entityTypeName}: ${errorMessage}`;
                window.showErrorNotification('שגיאה במחיקה', message);
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
        
        // Store error log globally for copy button access
        window._currentErrorLog = errorLogString;

        // Retry button (only if onRetry provided) - using TikTrack button classes
        const retryBtn = onRetry && typeof onRetry === 'function' ? `
            <button class="btn btn-primary mt-3 ms-2" onclick="(${onRetry.toString()})()">
                <i class="fas fa-sync"></i> נסה שוב
            </button>
        ` : '';

        // Copy error log button - using secondary button style
        const copyBtn = `
            <button class="btn btn-secondary mt-3 ms-2" onclick="window.copyCurrentErrorLog()">
                <i class="fas fa-copy"></i> העתק פרטי שגיאה
            </button>
        `;
        
        // Global helper function for copying error log
        window.copyCurrentErrorLog = function() {
            if (window._currentErrorLog) {
                navigator.clipboard.writeText(window._currentErrorLog)
                    .then(() => {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification('פרטי השגיאה הועתקו ללוח', 'success');
                        } else if (window.showSuccessNotification) {
                            window.showSuccessNotification('פרטי השגיאה הועתקו ללוח');
                        } else if (window.showInfoNotification) {
                            window.showInfoNotification('פרטי השגיאה הועתקו ללוח', 'success');
                        } else {
                            alert('פרטי השגיאה הועתקו ללוח');
                        }
                    })
                    .catch(() => {
                        if (window.showErrorNotification) {
                            window.showErrorNotification('שגיאה בהעתקה ללוח');
                        } else if (window.showInfoNotification) {
                            window.showInfoNotification('שגיאה בהעתקה ללוח', 'error');
                        } else {
                            alert('שגיאה בהעתקה ללוח');
                        }
                    });
            }
        };

        // Build error row using createElement
        tbody.textContent = '';
        const errorRow = document.createElement('tr');
        const errorCell = document.createElement('td');
        errorCell.colSpan = columnCount;
        errorCell.className = 'text-center text-danger';
        errorCell.style.padding = '20px';
        const errorIcon = document.createElement('i');
        errorIcon.className = `fas ${icon} fa-2x mb-2`;
        errorCell.appendChild(errorIcon);
        errorCell.appendChild(document.createElement('br'));
        const strong = document.createElement('strong');
        strong.style.fontSize = '1.1em';
        strong.textContent = title;
        errorCell.appendChild(strong);
        errorCell.appendChild(document.createElement('br'));
        const small = document.createElement('small');
        small.textContent = message;
        errorCell.appendChild(small);
        errorCell.appendChild(document.createElement('br'));
        // Insert retry and copy buttons using DOMParser
        const buttonsHTML = retryBtn + copyBtn;
        const parser = new DOMParser();
        const doc = parser.parseFromString(buttonsHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
          errorCell.appendChild(node.cloneNode(true));
        });
        errorRow.appendChild(errorCell);
        tbody.appendChild(errorRow);
    }

    /**
     * רענון טבלאות - פשוט וממוקד
     * 
     * פשוט וקל: אם יש reloadFn - קוראים לו ישירות, ללא cache clearing.
     * זה מבטיח רענון מיידי של נתונים מהשרת.
     * 
     * @param {Object} options - אופציות רענון
     * @param {Function} [options.reloadFn] - פונקציית רענון מותאמת אישית
     * @param {boolean} [options.requiresHardReload] - דורש hard reload (להעדפות בלבד)
     */
    static async handleTableRefresh(options = {}) {
        try {
            console.log('🔄 handleTableRefresh called with options:', options);
            
            // פשטות מקסימלית: אם יש reloadFn - קוראים לו ישירות ללא cache clearing
            if (options.reloadFn && typeof options.reloadFn === 'function') {
                console.log('✅ handleTableRefresh: Calling reloadFn...');
                console.log('🔍 handleTableRefresh: reloadFn type:', typeof options.reloadFn);
                console.log('🔍 handleTableRefresh: reloadFn name:', options.reloadFn.name || 'anonymous');
                try {
                    await options.reloadFn();
                    console.log('✅ handleTableRefresh: reloadFn completed successfully');
                } catch (reloadError) {
                    console.error('❌ handleTableRefresh: Error in reloadFn:', reloadError);
                    console.error('❌ handleTableRefresh: Error stack:', reloadError.stack);
                    throw reloadError; // Re-throw to be caught by outer catch
                }
                return;
            }

            // אם דורש hard reload (להעדפות בלבד)
            if (options.requiresHardReload) {
                console.log('⚠️ handleTableRefresh: requiresHardReload=true, calling clearCacheQuick');
                if (typeof window.clearCacheQuick === 'function') {
                    await window.clearCacheQuick();
                }
                return;
            }

            // ברירת מחדל - אין פעולה
            // זה מגיע רק אם לא הועבר reloadFn, מה שאומר שזה כנראה old code
            console.warn('⚠️ handleTableRefresh called without reloadFn - no action taken');
        } catch (error) {
            console.error('❌ שגיאה ברענון טבלה:', error);
            console.error('❌ שגיאה ברענון טבלה - stack:', error.stack);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה ברענון טבלה', error.message || 'שגיאה לא ידועה');
            }
        }
    }

    /**
     * בדיקת זמינות UnifiedCacheManager
     * @private
     * @returns {boolean} האם UnifiedCacheManager זמין ומאותחל
     */
    static _isUnifiedCacheManagerAvailable() {
        return typeof window.UnifiedCacheManager !== 'undefined' && 
               window.UnifiedCacheManager !== null &&
               window.UnifiedCacheManager.initialized === true;
    }
    
    /**
     * ניקוי מטמון ממוקד עבור ישות ספציפית
     * @param {string} entityType - סוג הישות (trades, alerts, etc.)
     */
    static async clearEntityCache(entityType) {
        console.log(`🔥 clearEntityCache called for entityType: ${entityType}`);
        
        if (!this._isUnifiedCacheManagerAvailable()) {
            console.debug(`⚠️ UnifiedCacheManager not available or not initialized - skipping cache clear for ${entityType}`);
            return;
        }
        
        try {
            const keys = await window.UnifiedCacheManager.getAllKeys();
            console.log(`🔥 clearEntityCache - All keys:`, keys);
            
            const entityKeys = keys.filter(k => 
                k.startsWith(`${entityType}_`) || 
                k.startsWith(`all_${entityType}`) ||
                k.includes(entityType)
            );
            
            console.log(`🔥 clearEntityCache - Entity keys to remove:`, entityKeys);
            
            for (const key of entityKeys) {
                await window.UnifiedCacheManager.remove(key);
            }
            console.log(`✅ נוקה מטמון עבור ${entityType} (${entityKeys.length} מפתחות)`);
        } catch (error) {
            console.error(`❌ שגיאה בניקוי מטמון ${entityType}:`, error);
        }
    }

    /**
     * זיהוי סוג ישות מהURL או options
     */
    static detectEntityType(options = {}) {
        // זיהוי מה-URL אם קיים
        if (options.apiUrl) {
            const urlMatch = options.apiUrl.match(/\/api\/([^\/]+)/);
            if (urlMatch) return urlMatch[1];
        }

        // זיהוי מהentityName
        if (options.entityName) {
            const entityMap = {
                'הערה': 'notes',
                'התראה': 'alerts', 
                'טרייד': 'trades',
                'ביצוע': 'executions',
                'טיקר': 'tickers',
                'חשבון מסחר מסחר': 'trading_accounts',
                'תזרים מזומנים': 'cash_flows',
                'תזרים מזומן': 'cash_flows',  // Added alternative name
                'תוכנית מסחר': 'trade_plans'
            };
            return entityMap[options.entityName] || null;
        }

        return null;
    }

    /**
     * רענון טבלאות אוטומטי לפי entity type
     */
    static async refreshEntityTables(entityType) {
        try {
            // ניקוי מטמון עבור הישות - שימוש ב-CacheSyncManager
            const actionMap = {
                'trade': 'trade-updated',
                'trades': 'trade-updated',
                'trade_plan': 'trade-plan-updated',
                'trade_plans': 'trade-plan-updated',
                'alert': 'alert-updated',
                'alerts': 'alert-updated',
                'execution': 'execution-updated',
                'executions': 'execution-updated',
                'cash_flow': 'cash-flow-updated',
                'cash_flows': 'cash-flow-updated',
                'note': 'note-updated',
                'notes': 'note-updated',
                'ticker': 'ticker-updated',
                'tickers': 'ticker-updated',
                'trading_account': 'account-updated',
                'trading_accounts': 'account-updated',
                'account': 'account-updated',
                'accounts': 'account-updated'
            };
            
            // Try CacheSyncManager first (preferred method)
            const action = actionMap[entityType];
            if (action && window.CacheSyncManager?.invalidateByAction) {
                try {
                    await window.CacheSyncManager.invalidateByAction(action);
                    console.log(`🔄 נוקה מטמון עבור ${entityType} דרך CacheSyncManager (action: ${action})`);
                } catch (cacheError) {
                    console.warn(`⚠️ CacheSyncManager.invalidateByAction failed for ${entityType}, falling back to direct invalidation`, cacheError);
                    // Fallback to direct invalidation
                    await this._invalidateCacheDirectly(entityType);
                }
            } else if (this._isUnifiedCacheManagerAvailable()) {
                // Fallback to direct invalidation if CacheSyncManager not available or entity type not mapped
                await this._invalidateCacheDirectly(entityType);
            } else {
                console.debug(`⚠️ Cache managers not available - skipping cache clear for ${entityType}`);
            }

            // איפוס דגלי טעינה קיימים אם יש גישה אליהם
            this.resetLoadingFlags(entityType);

            // איפוס דגלים מיוחדים עבור ישויות ספציפיות
            this.resetSpecialFlags(entityType);

            // קריאה לפונקציית הטעינה המתאימה
            const loadFunction = this.getLoadFunctionForEntity(entityType);
            
            if (loadFunction && typeof loadFunction === 'function') {
                await loadFunction();
                console.log(`✅ רוען טבלה עבור ${entityType}`);
            } else {
                console.warn(`⚠️ לא נמצאה פונקציית טעינה עבור ${entityType}`);
            }

        } catch (error) {
            console.error(`❌ שגיאה ברענון ${entityType}:`, error);
        }
    }

    /**
     * ניקוי מטמון ישיר (fallback method)
     * @private
     */
    static async _invalidateCacheDirectly(entityType) {
        if (!this._isUnifiedCacheManagerAvailable()) {
            return;
        }
        
        try {
            // ניקוי ממוקד לפי entity type
            const keys = await window.UnifiedCacheManager.getAllKeys();
            const entityKeys = keys.filter(k => 
                k.startsWith(`${entityType}_`) || 
                k.startsWith(`all_${entityType}`) ||
                k.includes(entityType)
            );
            
            for (const key of entityKeys) {
                await window.UnifiedCacheManager.remove(key);
            }
            console.log(`🔄 נוקה מטמון ישיר עבור ${entityType} (${entityKeys.length} מפתחות)`);
        } catch (error) {
            console.warn(`⚠️ Failed to invalidate cache directly for ${entityType}:`, error);
        }
    }

    /**
     * איפוס דגלי טעינה - מנסה לגשת לדגלים דרך פונקציות עזר
     */
    static resetLoadingFlags(entityType) {
        try {
            // קריאה לפונקציות עזר אם הן קיימות לאיפוס דגלים
            const resetFunctionMap = {
                'notes': () => {
                    // קריאה לפונקציה שמאפסת את הדגל
                    if (typeof window.resetNotesLoadingFlag === 'function') {
                        window.resetNotesLoadingFlag();
                    }
                },
                'alerts': () => {
                    if (typeof window.resetAlertsLoadingFlag === 'function') {
                        window.resetAlertsLoadingFlag();
                    }
                },
                'trades': () => {
                    if (typeof window.resetTradesLoadingFlag === 'function') {
                        window.resetTradesLoadingFlag();
                    }
                },
                'executions': () => {
                    if (typeof window.resetExecutionsLoadingFlag === 'function') {
                        window.resetExecutionsLoadingFlag();
                    }
                },
                'tickers': () => {
                    if (typeof window.resetTickersLoadingFlag === 'function') {
                        window.resetTickersLoadingFlag();
                    }
                },
                'trading_accounts': () => {
                    if (typeof window.resetAccountsLoadingFlag === 'function') {
                        window.resetAccountsLoadingFlag();
                    }
                },
                'cash_flows': () => {
                    if (typeof window.resetCashFlowsLoadingFlag === 'function') {
                        window.resetCashFlowsLoadingFlag();
                    }
                },
                'trade_plans': () => {
                    if (typeof window.resetTradePlansLoadingFlag === 'function') {
                        window.resetTradePlansLoadingFlag();
                    }
                }
            };

            const resetFunction = resetFunctionMap[entityType];
            if (resetFunction) {
                resetFunction();
            }
        } catch (error) {
            // אי אפשר לגשת לדגלים - זה בסדר, פונקציית הטעינה תטפל בזה
            console.log(`ℹ️ לא ניתן לאפס דגל טעינה עבור ${entityType}`);
        }
    }

    /**
     * איפוס דגלים מיוחדים עבור ישויות ספציפיות
     */
    static resetSpecialFlags(entityType) {
        try {
            // דגלים מיוחדים עבור notes
            if (entityType === 'notes') {
                if (typeof window.removeAttachmentFlag !== 'undefined') {
                    window.removeAttachmentFlag = false;
                }
                if (typeof window.replaceAttachmentFlag !== 'undefined') {
                    window.replaceAttachmentFlag = false;
                }
            }
            
            // כאן אפשר להוסיף דגלים מיוחדים נוספים עבור ישויות אחרות
        } catch (error) {
            console.log(`ℹ️ לא ניתן לאפס דגלים מיוחדים עבור ${entityType}`);
        }
    }

    /**
     * מיפוי entity type לפונקציית טעינה עם איפוס דגלי טעינה
     */
    static getLoadFunctionForEntity(entityType) {
        const loadFunctionMap = {
            'notes': () => {
                // הloadNotesData עצמה מטפלת באיפוס הדגל
                return window.loadNotesData ? window.loadNotesData() : null;
            },
            'alerts': () => window.loadAlertsData ? window.loadAlertsData() : null,
            'trades': () => window.loadTradesData ? window.loadTradesData() : null,
            'executions': () => window.loadExecutionsData ? window.loadExecutionsData() : null,
            'tickers': () => window.loadTickersData ? window.loadTickersData() : null,
            'trading_accounts': () => window.loadTradingAccountsDataForTradingAccountsPage ? window.loadTradingAccountsDataForTradingAccountsPage() : null,
            'cash_flows': () => window.loadCashFlowsData ? window.loadCashFlowsData() : null,
            'trade_plans': () => window.loadTradePlansData ? window.loadTradePlansData() : null
        };

        return loadFunctionMap[entityType];
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


