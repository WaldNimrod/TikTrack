/**
 * CRUD Response Handler - TikTrack
 * ================================
 * 
 * מערכת מרכזית לטיפול בתגובות API של פעולות CRUD
 * מחליפה לוגיקה זהה ב-18 פונקציות save/update/delete
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - הפרדה אוטומטית בין שגיאות ולידציה (400) לשגיאות מערכת (500)
 * - סגירת modal אוטומטית
 * - רענון טבלה אוטומטי
 * - הצגת הודעות הצלחה/שגיאה
 * - תמיכה ב-cache clearing
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
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.CRUDResponseHandler = CRUDResponseHandler;

// Shortcuts למתודות נפוצות
window.handleSaveResponse = (response, options) => CRUDResponseHandler.handleSaveResponse(response, options);
window.handleUpdateResponse = (response, options) => CRUDResponseHandler.handleUpdateResponse(response, options);
window.handleDeleteResponse = (response, options) => CRUDResponseHandler.handleDeleteResponse(response, options);
window.executeCRUDOperation = (url, fetchOptions, handlerOptions) => CRUDResponseHandler.executeCRUDOperation(url, fetchOptions, handlerOptions);

console.log('✅ CRUDResponseHandler loaded successfully');

