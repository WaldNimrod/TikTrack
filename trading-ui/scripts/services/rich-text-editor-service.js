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
            if (quill) {
                // ניקוי event listeners אם יש
                // Quill לא מספק destroy method רשמי, אז רק נסיר מה-registry
                this._editors.delete(editorId);
                console.log(`✅ RichTextEditorService: עורך "${editorId}" הוסר`);
            }
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

