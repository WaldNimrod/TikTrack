/**
 * Base Entity Module - מודול בסיס לכל מודולי הפרטים
 * מכיל פונקציונליות משותפת לכל המודולים
 */

class BaseEntityModule {
    constructor(entityType) {
        this.entityType = entityType;
        this.isVisible = false;
        this.currentData = null;
        
        console.log(`📦 מודול בסיס נוצר עבור ${entityType}`);
    }

    /**
     * הצגת המודול עם נתונים
     */
    async show(entityId) {
        try {
            this.isVisible = true;
            this.showLoading();
            
            // טעינת נתונים
            const data = await this.loadData(entityId);
            this.currentData = data;
            
            // עיבוד התוכן
            const content = this.renderContent(data);
            
            // הצגת המודל
            this.showModal(content);
            
            // קישור אירועים
            this.bindEvents();
            
            console.log(`✅ מודול ${this.entityType} הוצג בהצלחה`);
            
        } catch (error) {
            console.error(`❌ שגיאה בהצגת מודול ${this.entityType}:`, error);
            this.showError(`שגיאה בטעינת פרטי ${this.entityType}: ${error.message}`);
        }
    }

    /**
     * הסתרת המודול
     */
    hide() {
        this.isVisible = false;
        this.unbindEvents();
        this.currentData = null;
        
        console.log(`🚪 מודול ${this.entityType} הוסתר`);
    }

    /**
     * טעינת נתונים מהשרת - יש לממש בכל מודול
     */
    async loadData(entityId) {
        throw new Error(`loadData לא מומש עבור ${this.entityType}`);
    }

    /**
     * עיבוד הנתונים לתצוגה - יש לממש בכל מודול
     */
    renderContent(data) {
        throw new Error(`renderContent לא מומש עבור ${this.entityType}`);
    }

    /**
     * הצגת שגיאות
     */
    showError(message) {
        const content = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>שגיאה:</strong> ${message}
            </div>
        `;
        
        this.showModal(content);
    }

    /**
     * הצגת מצב טעינה
     */
    showLoading() {
        const content = `
            <div class="loading-spinner text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">טוען...</span>
                </div>
                <p class="mt-2">טוען פרטי ${this.entityType}...</p>
            </div>
        `;
        
        this.showModal(content);
    }

    /**
     * הסתרת מצב טעינה
     */
    hideLoading() {
        // הטעינה תוסתר כשהתוכן יוחלף
    }

    /**
     * הצגת המודל
     */
    showModal(content) {
        if (window.EntityDetailsSystem) {
            const title = this.getEntityTitle();
            window.EntityDetailsSystem.showModal(title, content);
        }
    }

    /**
     * קבלת כותרת הישות - יש לממש בכל מודול
     */
    getEntityTitle() {
        return `${this.entityType} פרטים`;
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // קישור אירועי קישורים
        this.bindLinkEvents();
        
        console.log(`🔗 אירועי מודול ${this.entityType} קושרו`);
    }

    /**
     * הסרת קישורי אירועים
     */
    unbindEvents() {
        // הסרת event listeners
        console.log(`🔓 אירועי מודול ${this.entityType} הוסרו`);
    }

    /**
     * קישור אירועי קישורים
     */
    bindLinkEvents() {
        // קישור אירועי לחיצה על קישורים
        document.addEventListener('click', (event) => {
            const link = event.target.closest('.entity-link');
            if (link) {
                event.preventDefault();
                this.handleLinkClick(link);
            }
        });
    }

    /**
     * טיפול בלחיצות על קישורים
     */
    handleLinkClick(link) {
        const entityType = link.getAttribute('data-entity');
        const entityId = link.getAttribute('data-id');
        
        if (entityType && entityId && window.EntityDetailsSystem) {
            console.log(`🔗 לחיצה על קישור: ${entityType} #${entityId}`);
            window.EntityDetailsSystem.openDetails(entityType, entityId);
        }
    }

    /**
     * יצירת קישור ישות
     */
    createEntityLink(entityType, entityId, text, additionalClasses = '') {
        return `
            <span class="entity-link ${additionalClasses}" 
                  data-entity="${entityType}" 
                  data-id="${entityId}"
                  title="לחץ לצפייה ב${entityType}">
                ${text}
            </span>
        `;
    }

    /**
     * יצירת שורת מידע
     */
    createInfoRow(label, value, additionalClasses = '') {
        return `
            <div class="info-row ${additionalClasses}">
                <label>${label}:</label>
                <span>${value}</span>
            </div>
        `;
    }

    /**
     * יצירת תג סטטוס
     */
    createStatusBadge(status, additionalClasses = '') {
        return `
            <span class="status-badge ${status} ${additionalClasses}">
                ${this.translateStatus(status)}
            </span>
        `;
    }

    /**
     * תרגום סטטוס לעברית
     */
    translateStatus(status) {
        const translations = {
            'active': 'פעיל',
            'inactive': 'לא פעיל',
            'pending': 'ממתין',
            'completed': 'הושלם',
            'cancelled': 'בוטל',
            'open': 'פתוח',
            'closed': 'סגור',
            'buy': 'קנייה',
            'sell': 'מכירה'
        };
        
        return translations[status] || status;
    }

    /**
     * עיצוב תאריך
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    /**
     * עיצוב מספר
     */
    formatNumber(number, decimals = 2) {
        if (number === null || number === undefined) return '-';
        
        try {
            return parseFloat(number).toLocaleString('he-IL', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        } catch (error) {
            return number.toString();
        }
    }

    /**
     * עיצוב מטבע
     */
    formatCurrency(amount, currency = 'USD') {
        if (amount === null || amount === undefined) return '-';
        
        try {
            const formatted = parseFloat(amount).toLocaleString('he-IL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            return `$${formatted}`;
        } catch (error) {
            return `$${amount}`;
        }
    }

    /**
     * עיצוב אחוזים
     */
    formatPercentage(value, decimals = 2) {
        if (value === null || value === undefined) return '-';
        
        try {
            const formatted = parseFloat(value).toLocaleString('he-IL', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
            
            return `${formatted}%`;
        } catch (error) {
            return `${value}%`;
        }
    }

    /**
     * יצירת כרטיס מידע
     */
    createInfoCard(title, content, additionalClasses = '') {
        return `
            <div class="info-card ${additionalClasses}">
                <h6 class="info-card-title">${title}</h6>
                <div class="info-card-content">
                    ${content}
                </div>
            </div>
        `;
    }

    /**
     * יצירת טבלת מידע
     */
    createInfoTable(data, additionalClasses = '') {
        if (!data || data.length === 0) {
            return '<p class="text-muted">אין נתונים להצגה</p>';
        }
        
        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-sm ${additionalClasses}">
                    <tbody>
        `;
        
        data.forEach(row => {
            tableHTML += `
                <tr>
                    <td class="fw-bold">${row.label}</td>
                    <td>${row.value}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        return tableHTML;
    }
}

console.log('📦 Base Entity Module - נטען בהצלחה');
