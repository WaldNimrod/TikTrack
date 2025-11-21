/**
 * Rich Text Editor Service - TikTrack
 * ====================================
 * 
 * מערכת מרכזית לניהול עורכי טקסט עשיר (Quill.js)
 * מספקת ממשק אחיד לעריכת טקסט עשיר בכל המערכת
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - אתחול עורכי Quill.js
 * - ניהול instances של עורכים
 * - Sanitization של HTML עם DOMPurify
 * - תמיכה מלאה ב-RTL/LTR
 * - תמיכה בצבעים, יישור, ועיצוב בסיסי
 * - אינטגרציה עם ModalManagerV2
 * 
 * תלויות:
 * - Quill.js 1.3.7 (CDN)
 * - DOMPurify 3.0.6 (CDN)
 */

// ===== RICH TEXT EDITOR SERVICE =====

class RichTextEditorService {
    /**
     * Registry של כל העורכים הפעילים
     * @private
     */
    static _editors = new Map();

    /**
     * ברירות מחדל לעורך
     * @private
     */
    static _defaultOptions = {
        theme: 'snow',
        direction: 'rtl', // RTL ברירת מחדל לעברית
        placeholder: 'הכנס תוכן כאן...',
        modules: {
            toolbar: [
                // Headings
                [{ 'header': [2, 3, false] }], // H2, H3 בלבד
                
                // Text formatting
                ['bold', 'italic', 'underline', 'strike'],
                
                // Colors - ממשק בחירת צבע
                [{ 'color': [] }, { 'background': [] }],
                
                // Alignment - יישור
                [{ 'align': ['right', 'center', 'left', 'justify'] }],
                
                // Direction - RTL/LTR
                [{ 'direction': 'rtl' }, { 'direction': 'ltr' }],
                
                // Lists
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                
                // Link
                ['link'],
                
                // Clean formatting
                ['clean']
            ]
        }
    };

    /**
     * אתחול עורך Quill.js חדש
     * 
     * @param {string} editorId - ID של האלמנט שיכיל את העורך
     * @param {Object} options - אפשרויות מותאמות אישית (אופציונלי)
     * @returns {Object|null} - Instance של Quill או null אם נכשל
     * 
     * @example
     * const quill = RichTextEditorService.initEditor('noteContent', {
     *   placeholder: 'הכנס הערה...',
     *   maxLength: 10000
     * });
     */
    static initEditor(editorId, options = {}) {
        try {
            // בדיקה ש-Quill זמין
            if (typeof window.Quill === 'undefined') {
                console.error('❌ RichTextEditorService: Quill.js לא נטען. ודא שהספרייה נטענת לפני השירות.');
                return null;
            }

            // בדיקה שהאלמנט קיים
            const container = document.getElementById(editorId);
            if (!container) {
                console.error(`❌ RichTextEditorService: אלמנט עם ID "${editorId}" לא נמצא`);
                return null;
            }

            // בדיקה אם העורך כבר קיים
            if (this._editors.has(editorId)) {
                console.warn(`⚠️ RichTextEditorService: עורך עם ID "${editorId}" כבר קיים. משתמש בעורך הקיים.`);
                return this._editors.get(editorId);
            }

            // בדיקה שהקונטיינר גלוי (Quill נכשל אם הקונטיינר מוסתר)
            // בדיקה מחמירה יותר למודולים מקוננים
            const modalElement = container.closest('.modal');
            
            // בדיקה אם המודל מקונן - בדיקה כפולה:
            // 1. אם יש class modal-nested
            // 2. אם יש מודל אחר פתוח (בדיקה כמו ב-modal-manager-v2.js)
            let isNested = false;
            if (modalElement) {
                isNested = modalElement.classList.contains('modal-nested');
                // אם לא נמצא class, נבדוק אם יש מודל אחר פתוח
                if (!isNested) {
                    const otherOpenModals = document.querySelectorAll('.modal.show');
                    for (const otherModal of otherOpenModals) {
                        if (otherModal !== modalElement && otherModal.id !== container.id) {
                            isNested = true;
                            break;
                        }
                    }
                }
                // בדיקה נוספת דרך ModalNavigationService
                if (!isNested && window.ModalNavigationService && 
                    window.ModalNavigationService.getStack && 
                    typeof window.ModalNavigationService.getStack === 'function') {
                    const stack = window.ModalNavigationService.getStack();
                    isNested = stack.length > 1;
                }
            }
            
            // בדיקה אם המודל עצמו גלוי (חשוב למודולים מקוננים)
            const isModalVisible = modalElement && 
                                 (modalElement.classList.contains('show') || modalElement.style.display === 'block');
            
            // בדיקות visibility בסיסיות
            const hasOffsetParent = container.offsetParent !== null;
            const hasDisplay = container.style.display !== 'none' && !container.classList.contains('d-none');
            const hasSize = container.offsetWidth > 0 && container.offsetHeight > 0;
            const hasVisibility = getComputedStyle(container).visibility !== 'hidden';
            const hasOpacity = getComputedStyle(container).opacity !== '0';
            
            // בדיקה נוספת עם getBoundingClientRect
            const rect = container.getBoundingClientRect();
            const hasRectSize = rect.width > 0 && rect.height > 0;
            
            // למודולים מקוננים, ננסה לאתחל גם אם offsetParent הוא null
            // כל עוד המודל עצמו גלוי והקונטיינר קיים ב-DOM
            // CRITICAL: למודולים מקוננים, offsetParent יכול להיות null גם כשהמודל גלוי
            const isVisible = hasOffsetParent && hasDisplay && hasSize && hasVisibility && hasOpacity;
            const isInViewport = isNested ? 
                hasRectSize : // למודולים מקוננים, רק נבדוק שיש גודל
                (hasRectSize && rect.top >= 0 && rect.left >= 0);
            
            // למודולים מקוננים, ננסה לאתחל גם אם offsetParent הוא null
            // כל עוד המודל עצמו גלוי והקונטיינר קיים ב-DOM
            if (!isVisible || !isInViewport) {
                if (isNested && isModalVisible) {
                    // למודולים מקוננים, ננסה בכל זאת אם המודל גלוי
                    // גם אם offsetParent הוא null (זה יכול לקרות במודלים מקוננים)
                    // נבדוק אם הקונטיינר קיים ב-DOM ואם יש לו parent element
                    const hasParent = container.parentElement !== null;
                    const parentHasSize = container.parentElement && 
                                        (container.parentElement.offsetWidth > 0 || container.parentElement.offsetHeight > 0);
                    
                    // CRITICAL: למודולים מקוננים, ננסה לאתחל גם אם אין גודל
                    // כל עוד המודל גלוי והקונטיינר קיים ב-DOM
                    if (hasParent) {
                        window.Logger?.warn(`RichTextEditorService: קונטיינר "${editorId}" לא עובר בדיקות visibility מלאות (nested modal), אבל המודל גלוי - מנסה לאתחל בכל זאת`, {
                            editorId,
                            offsetParent: hasOffsetParent,
                            display: container.style.display,
                            hasDNone: container.classList.contains('d-none'),
                            width: container.offsetWidth,
                            height: container.offsetHeight,
                            rectWidth: rect.width,
                            rectHeight: rect.height,
                            rectTop: rect.top,
                            rectLeft: rect.left,
                            visibility: getComputedStyle(container).visibility,
                            opacity: getComputedStyle(container).opacity,
                            isModalVisible,
                            modalHasShow: modalElement?.classList.contains('show'),
                            hasParent,
                            parentHasSize,
                            isNested,
                            page: 'rich-text-editor-service'
                        });
                        // נמשיך לאתחל למרות הבדיקות - ננסה לאתחל את Quill
                        // אבל נצטרך לוודא שהקונטיינר מוכן לפני
                        // ננסה להגדיר גודל מינימלי אם אין - CRITICAL למודולים מקוננים
                        const minHeight = options.minHeight || 200;
                        if (!hasSize && !hasRectSize) {
                            // ננסה להגדיר גודל מינימלי מהקונפיגורציה או ברירת מחדל
                            if (!container.style.minHeight) {
                                container.style.minHeight = `${minHeight}px`;
                            }
                            // ננסה גם להגדיר width אם אין
                            if (!container.style.width) {
                                if (container.parentElement && container.parentElement.offsetWidth > 0) {
                                    container.style.width = '100%';
                                } else if (modalElement) {
                                    // אם אין parent עם גודל, ננסה להשתמש בגודל המודל
                                    const modalContent = modalElement.querySelector('.modal-content');
                                    if (modalContent && modalContent.offsetWidth > 0) {
                                        container.style.width = '100%';
                                    }
                                }
                            }
                            window.Logger?.debug(`RichTextEditorService: הגדרת minHeight ${minHeight}px לקונטיינר "${editorId}" (nested modal, no size)`, {
                                editorId,
                                minHeight,
                                page: 'rich-text-editor-service'
                            });
                        } else if (!container.style.minHeight) {
                            // גם אם יש גודל, נגדיר minHeight כדי להבטיח שהקונטיינר תמיד יהיה גלוי
                            container.style.minHeight = `${minHeight}px`;
                            window.Logger?.debug(`RichTextEditorService: הגדרת minHeight ${minHeight}px לקונטיינר "${editorId}" (nested modal, preventive)`, {
                                editorId,
                                minHeight,
                                page: 'rich-text-editor-service'
                            });
                        }
                    } else {
                        // אין parent - לא נוכל לאתחל
                        window.Logger?.warn(`RichTextEditorService: קונטיינר "${editorId}" לא גלוי ואין parent (nested modal). יאותחל עם retry mechanism.`, {
                            editorId,
                            offsetParent: hasOffsetParent,
                            display: container.style.display,
                            hasDNone: container.classList.contains('d-none'),
                            width: container.offsetWidth,
                            height: container.offsetHeight,
                            rectWidth: rect.width,
                            rectHeight: rect.height,
                            rectTop: rect.top,
                            rectLeft: rect.left,
                            visibility: getComputedStyle(container).visibility,
                            opacity: getComputedStyle(container).opacity,
                            isModalVisible,
                            modalHasShow: modalElement?.classList.contains('show'),
                            hasParent,
                            isNested,
                            page: 'rich-text-editor-service'
                        });
                        return null;
                    }
                } else {
                    // למודולים רגילים, נחזיר null
                    window.Logger?.warn(`RichTextEditorService: קונטיינר "${editorId}" לא גלוי. נסה שוב לאחר שהמודל מוצג במלואו.`, {
                        editorId,
                        offsetParent: hasOffsetParent,
                        display: container.style.display,
                        hasDNone: container.classList.contains('d-none'),
                        width: container.offsetWidth,
                        height: container.offsetHeight,
                        rectWidth: rect.width,
                        rectHeight: rect.height,
                        visibility: getComputedStyle(container).visibility,
                        opacity: getComputedStyle(container).opacity,
                        page: 'rich-text-editor-service'
                    });
                    return null;
                }
            }

            // מיזוג אפשרויות עם ברירות מחדל
            const mergedOptions = this._mergeOptions(this._defaultOptions, options);

            // יצירת container לעורך אם לא קיים
            // Quill צריך container ריק - אם יש תוכן, נמחק אותו
            if (container.querySelector('.ql-container')) {
                // Quill כבר אותחל - נחזיר את ה-instance הקיים
                const existingQuill = this._editors.get(editorId);
                if (existingQuill) {
                    return existingQuill;
                }
                // אם יש container אבל אין instance, נמחק אותו ונאתחל מחדש
                container.innerHTML = '';
            }

            // אתחול Quill - Quill יוצר את ה-HTML בעצמו
            const quill = new window.Quill(container, mergedOptions);

            // שמירת instance
            this._editors.set(editorId, quill);

            // הוספת maxLength handler אם מוגדר
            if (options.maxLength) {
                this._addMaxLengthHandler(quill, options.maxLength);
            }

            console.log(`✅ RichTextEditorService: עורך "${editorId}" אותחל בהצלחה`);
            return quill;

        } catch (error) {
            console.error(`❌ RichTextEditorService: שגיאה באתחול עורך "${editorId}":`, error);
            return null;
        }
    }

    /**
     * קבלת תוכן HTML מהעורך (עם sanitization)
     * 
     * @param {string} editorId - ID של העורך
     * @returns {string} - תוכן HTML מנוקה
     * 
     * @example
     * const html = RichTextEditorService.getContent('noteContent');
     */
    static getContent(editorId) {
        try {
            const quill = this.getEditorInstance(editorId);
            if (!quill) {
                console.warn(`⚠️ RichTextEditorService: עורך "${editorId}" לא נמצא`);
                return '';
            }

            // קבלת HTML מהעורך
            const html = quill.root.innerHTML;

            // Sanitization עם DOMPurify
            return this.sanitizeHTML(html);

        } catch (error) {
            console.error(`❌ RichTextEditorService: שגיאה בקבלת תוכן מ-"${editorId}":`, error);
            return '';
        }
    }

    /**
     * הגדרת תוכן HTML בעורך
     * 
     * @param {string} editorId - ID של העורך
     * @param {string} html - תוכן HTML להגדרה
     * 
     * @example
     * RichTextEditorService.setContent('noteContent', '<p>תוכן חדש</p>');
     */
    static setContent(editorId, html) {
        try {
            const quill = this.getEditorInstance(editorId);
            if (!quill) {
                console.warn(`⚠️ RichTextEditorService: עורך "${editorId}" לא נמצא`);
                return;
            }

            // Sanitization לפני הגדרה
            const sanitizedHtml = this.sanitizeHTML(html || '');

            // הגדרת תוכן
            quill.root.innerHTML = sanitizedHtml;

        } catch (error) {
            console.error(`❌ RichTextEditorService: שגיאה בהגדרת תוכן ל-"${editorId}":`, error);
        }
    }

    /**
     * הרס עורך והסרתו מה-registry
     * 
     * @param {string} editorId - ID של העורך
     * 
     * @example
     * RichTextEditorService.destroyEditor('noteContent');
     */
    static destroyEditor(editorId) {
        try {
            const quill = this._editors.get(editorId);
            if (quill && typeof quill.off === 'function') {
                // Remove any event listeners if needed
                quill.off('text-change');
            }
            this._editors.delete(editorId);

            const container = document.getElementById(editorId);
            if (container) {
                // Remove Quill toolbar that may have been injected as a sibling
                const prevSibling = container.previousElementSibling;
                if (prevSibling && prevSibling.classList && prevSibling.classList.contains('ql-toolbar')) {
                    prevSibling.remove();
                }
                const nextSibling = container.nextElementSibling;
                if (nextSibling && nextSibling.classList && nextSibling.classList.contains('ql-toolbar')) {
                    nextSibling.remove();
                }

                // Clear container content and restore base classes
                container.innerHTML = '';
                container.classList.remove('ql-container', 'ql-snow');
                container.removeAttribute('data-placeholder');
            }

            console.log(`✅ RichTextEditorService: עורך "${editorId}" הוסר`);
        } catch (error) {
            console.error(`❌ RichTextEditorService: שגיאה בהרס עורך "${editorId}":`, error);
        }
    }

    /**
     * קבלת instance של עורך
     * 
     * @param {string} editorId - ID של העורך
     * @returns {Object|null} - Instance של Quill או null
     * 
     * @example
     * const quill = RichTextEditorService.getEditorInstance('noteContent');
     */
    static getEditorInstance(editorId) {
        return this._editors.get(editorId) || null;
    }

    /**
     * Sanitization של HTML עם DOMPurify
     * 
     * @param {string} html - HTML לניקוי
     * @returns {string} - HTML מנוקה
     * 
     * @example
     * const cleanHtml = RichTextEditorService.sanitizeHTML('<p>תוכן</p><script>alert("xss")</script>');
     */
    static sanitizeHTML(html) {
        try {
            // בדיקה ש-DOMPurify זמין
            if (typeof window.DOMPurify === 'undefined') {
                console.warn('⚠️ RichTextEditorService: DOMPurify לא זמין. מחזיר HTML ללא ניקוי.');
                return html || '';
            }

            // Sanitization
            const clean = window.DOMPurify.sanitize(html || '', {
                ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3',
                    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre',
                    'span'
                ],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'dir'],
                ALLOW_DATA_ATTR: false
            });

            return clean;

        } catch (error) {
            console.error('❌ RichTextEditorService: שגיאה ב-sanitization:', error);
            return html || '';
        }
    }

    /**
     * מיזוג אפשרויות עם ברירות מחדל
     * @private
     */
    static _mergeOptions(defaults, custom) {
        const merged = JSON.parse(JSON.stringify(defaults)); // Deep copy

        // מיזוג modules.toolbar
        if (custom.modules && custom.modules.toolbar) {
            merged.modules.toolbar = custom.modules.toolbar;
        }

        // מיזוג שאר האפשרויות
        Object.keys(custom).forEach(key => {
            if (key !== 'modules') {
                merged[key] = custom[key];
            }
        });

        return merged;
    }

    /**
     * הוספת handler ל-maxLength
     * @private
     */
    static _addMaxLengthHandler(quill, maxLength) {
        quill.on('text-change', function() {
            const text = quill.getText();
            if (text.length > maxLength) {
                // חיתוך התוכן
                const delta = quill.getContents();
                let length = 0;
                let index = 0;
                
                for (let i = 0; i < delta.ops.length; i++) {
                    const op = delta.ops[i];
                    if (op.insert) {
                        const insertLength = typeof op.insert === 'string' 
                            ? op.insert.length 
                            : 1;
                        if (length + insertLength > maxLength) {
                            index = i;
                            break;
                        }
                        length += insertLength;
                    }
                }
                
                // עדכון התוכן
                const newDelta = delta.slice(0, index);
                quill.setContents(newDelta);
                
                // הודעה למשתמש
                if (window.showNotification) {
                    window.showNotification(
                        `התוכן חורג מהגבול המותר (${maxLength} תווים)`,
                        'warning'
                    );
                }
            }
        });
    }
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.RichTextEditorService = RichTextEditorService;

// Shortcuts למתודות נפוצות
window.initRichTextEditor = (editorId, options) => RichTextEditorService.initEditor(editorId, options);
window.getRichTextContent = (editorId) => RichTextEditorService.getContent(editorId);
window.setRichTextContent = (editorId, html) => RichTextEditorService.setContent(editorId, html);
window.destroyRichTextEditor = (editorId) => RichTextEditorService.destroyEditor(editorId);

console.log('✅ RichTextEditorService loaded successfully');

