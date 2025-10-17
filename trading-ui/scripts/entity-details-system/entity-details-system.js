/**
 * Entity Details System - המערכת המרכזית לפרטי ישויות
 * מערכת דינמית חכמה ומרכזית להצגת דף של ישות ספציפית
 */

class EntityDetailsSystem {
    constructor() {
        this.modules = new Map();
        this.currentEntity = null;
        this.currentModule = null;
        this.history = [];
        this.isInitialized = false;
        
        console.log('🎯 Entity Details System - מוכן לאתחול');
    }

    /**
     * אתחול המערכת
     */
    async init() {
        if (this.isInitialized) {
            console.log('✅ Entity Details System כבר מאותחל');
            return;
        }

        try {
            // יצירת חלון המודל אם לא קיים
            this.createModalIfNotExists();
            
            // רישום מודולים
            this.registerModules();
            
            // קישור אירועים
            this.bindEvents();
            
            this.isInitialized = true;
            console.log('✅ Entity Details System מאותחל בהצלחה');
            
        } catch (error) {
            console.error('❌ שגיאה באתחול Entity Details System:', error);
            throw error;
        }
    }

    /**
     * רישום מודול חדש
     */
    registerModule(entityType, module) {
        this.modules.set(entityType, module);
        console.log(`📝 מודול ${entityType} נרשם במערכת`);
    }

    /**
     * קבלת מודול לפי סוג ישות
     */
    getModule(entityType) {
        return this.modules.get(entityType);
    }

    /**
     * פתיחת מודול פרטים
     */
    async openDetails(entityType, entityId, sourceTable = null) {
        try {
            console.log(`🔍 פתיחת פרטי ${entityType} #${entityId}`);
            
            // בדיקה שהמערכת מאותחלת
            if (!this.isInitialized) {
                await this.init();
            }
            
            // קבלת המודול המתאים
            const module = this.getModule(entityType);
            if (!module) {
                throw new Error(`מודול ${entityType} לא נמצא`);
            }
            
            // שמירת המצב הנוכחי
            this.currentEntity = { type: entityType, id: entityId, sourceTable };
            this.currentModule = module;
            
            // הוספה להיסטוריה
            this.addToHistory(entityType, entityId, sourceTable);
            
            // פתיחת המודול
            await module.show(entityId);
            
            console.log(`✅ פרטי ${entityType} #${entityId} נפתחו בהצלחה`);
            
        } catch (error) {
            console.error(`❌ שגיאה בפתיחת פרטי ${entityType}:`, error);
            this.showError(`שגיאה בפתיחת פרטי ${entityType}: ${error.message}`);
        }
    }

    /**
     * הוספה להיסטוריה
     */
    addToHistory(entityType, entityId, sourceTable) {
        const historyItem = {
            type: entityType,
            id: entityId,
            sourceTable,
            timestamp: new Date()
        };
        
        // הוספה לתחילת הרשימה
        this.history.unshift(historyItem);
        
        // הגבלת גודל ההיסטוריה
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        console.log(`📚 נוסף להיסטוריה: ${entityType} #${entityId}`);
    }

    /**
     * קבלת היסטוריית צפייה
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * ניקוי ההיסטוריה
     */
    clearHistory() {
        this.history = [];
        console.log('🗑️ היסטוריית הצפייה נוקתה');
    }

    /**
     * קבלת הישות הנוכחית
     */
    getCurrentEntity() {
        return this.currentEntity;
    }

    /**
     * יצירת חלון המודל אם לא קיים
     */
    createModalIfNotExists() {
        if (document.getElementById('entityDetailsModal')) {
            return; // המודל כבר קיים
        }

        const modalHTML = `
            <div id="entityDetailsModal" class="modal fade entity-details-modal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <!-- כותרת המודל -->
                        <div class="modal-header entity-details-header">
                            <h5 id="entityDetailsTitle" class="modal-title">
                                <i id="entityIcon" class="entity-icon"></i>
                                <span id="entityName">שם הישות</span>
                                <span id="entityId" class="entity-id">#123</span>
                            </h5>
                            
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="סגור"></button>
                        </div>
                        
                        <!-- תוכן המודל -->
                        <div class="modal-body entity-details-content" id="entityDetailsContent">
                            <div class="loading-spinner">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">טוען...</span>
                                </div>
                                <p>טוען פרטים...</p>
                            </div>
                        </div>
                        
                        <!-- כפתורי פעולה -->
                        <div class="modal-footer entity-details-footer">
                            <div class="entity-actions">
                                <!-- כפתורי פעולה ייחודיים לכל ישות -->
                            </div>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // הוספה לגוף הדף
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('🏗️ חלון פרטי ישות נוצר');
    }

    /**
     * רישום מודולים
     */
    registerModules() {
        // המודולים יירשמו כאן כשהם ייווצרו
        console.log('📝 מוכנים לרישום מודולים');
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // קישור אירועי סגירת המודל
        document.addEventListener('hidden.bs.modal', (event) => {
            if (event.target.id === 'entityDetailsModal') {
                this.onModalClose();
            }
        });
        
        console.log('🔗 אירועי המערכת קושרו');
    }

    /**
     * טיפול בסגירת המודל
     */
    onModalClose() {
        if (this.currentModule && typeof this.currentModule.hide === 'function') {
            this.currentModule.hide();
        }
        
        this.currentEntity = null;
        this.currentModule = null;
        
        console.log('🚪 חלון פרטי ישות נסגר');
    }

    /**
     * הצגת שגיאה
     */
    showError(message) {
        const content = document.getElementById('entityDetailsContent');
        if (content) {
            content.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>שגיאה:</strong> ${message}
                </div>
            `;
        }
        
        console.error('❌ שגיאה במערכת:', message);
    }

    /**
     * הצגת מצב טעינה
     */
    showLoading() {
        const content = document.getElementById('entityDetailsContent');
        if (content) {
            content.innerHTML = `
                <div class="loading-spinner text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">טוען...</span>
                    </div>
                    <p class="mt-2">טוען פרטים...</p>
                </div>
            `;
        }
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
    showModal(title, content) {
        // עדכון כותרת
        const titleElement = document.getElementById('entityDetailsTitle');
        if (titleElement) {
            titleElement.innerHTML = title;
        }
        
        // עדכון תוכן
        const contentElement = document.getElementById('entityDetailsContent');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
        
        // פתיחת המודל
        const modal = new bootstrap.Modal(document.getElementById('entityDetailsModal'));
        modal.show();
        
        console.log(`📖 חלון פרטים נפתח: ${title}`);
    }

    /**
     * סגירת המודל
     */
    hideModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('entityDetailsModal'));
        if (modal) {
            modal.hide();
        }
    }
}

// יצירת instance גלובלי
window.EntityDetailsSystem = new EntityDetailsSystem();

// אתחול אוטומטי כשהדף נטען
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('🎯 Entity Details System - מוכן לשימוש');
// });

console.log('🎯 Entity Details System - נטען בהצלחה');
