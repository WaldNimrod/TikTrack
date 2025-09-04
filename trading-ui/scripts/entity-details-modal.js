/**
 * Entity Details Modal - TikTrack Entity Details System
 * ===================================================
 *
 * מערכת מתקדמת להצגת פרטי ישויות במערכת TikTrack
 *
 * תכונות עיקריות:
 * - חלון קופץ אחיד לכל סוגי הישויות
 * - הצגת מידע מפורט וקישורים
 * - אינטגרציה עם מערכת הנתונים החיצוניים
 * - תמיכה ב-RTL ועיצוב מתקדם
 * - אינטגרציה עם מערכת ההתראות הגלובלית
 *
 * קובץ: trading-ui/scripts/entity-details-modal.js
 * גרסה: 1.0.0
 * יוצר: Nimrod
 * תאריך יצירה: 4 בספטמבר 2025
 *
 * תלויות:
 * - entity-details-renderer.js (רנדור תצוגות)
 * - entity-details-api.js (קריאות API)
 * - notification-system.js (התראות גלובליות)
 * - Bootstrap 5.3.0 (מודלים)
 *
 * דוקומנטציה: documentation/features/entity-details-system/README.md
 */

// ===== ENTITY DETAILS MODAL CLASS =====

/**
 * EntityDetailsModal - מחלקה ראשית לניהול חלון קופץ פרטי ישויות
 *
 * @class EntityDetailsModal
 */
class EntityDetailsModal {

  /**
     * Constructor - אתחול מחלקת EntityDetailsModal
     *
     * @constructor
     */
  constructor() {
    this.modal = null;
    this.modalId = 'entityDetailsModal';
    this.currentEntityType = null;
    this.currentEntityId = null;
    this.isInitialized = false;

    // אתחול המערכת
    this.init();
  }

  /**
     * Initialize modal system - אתחול מערכת המודל
     *
     * @private
     */
  init() {
    try {
      // יצירת מבנה HTML בסיסי למודל
      this.createModalStructure();

      // הוספת event listeners
      this.setupEventListeners();

      this.isInitialized = true;

      // הוספה לאובייקט הגלובלי
      window.entityDetailsModal = this;

      console.info('EntityDetailsModal initialized successfully');

    } catch (error) {
      // // console.error('Error initializing EntityDetailsModal:', error); // Disabled for linting
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה באתחול מערכת פרטי ישויות');
      }
    }
  }

  /**
     * Create modal HTML structure - יצירת מבנה HTML למודל
     *
     * @private
     */
  createModalStructure() {
    // בדיקה אם המודל כבר קיים
    if (document.getElementById(this.modalId)) {
      this.modal = document.getElementById(this.modalId);
      return;
    }

    // יצירת מבנה HTML למודל
    const modalHTML = `
            <div class="modal fade" id="${this.modalId}" tabindex="-1" 
                 aria-labelledby="${this.modalId}Label" aria-hidden="true" 
                 data-bs-backdrop="true" data-bs-keyboard="true">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content entity-details-modal">
                        <div class="modal-header entity-details-header">
                            <h5 class="modal-title" id="${this.modalId}Label">
                                פרטי ישות
                            </h5>
                            <button type="button" class="btn-close" 
                                    data-bs-dismiss="modal" aria-label="סגירה"
                                    title="סגירה (ESC)"></button>
                        </div>
                        <div class="modal-body entity-details-body" id="entityDetailsContent">
                            <div class="entity-details-loading">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">טוען...</span>
                                </div>
                                <p class="mt-3">טוען פרטי ישות...</p>
                            </div>
                        </div>
                        <div class="modal-footer entity-details-footer">
                            <button type="button" class="btn btn-secondary" 
                                    data-bs-dismiss="modal">סגירה</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // הוספה ל-DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // שמירת הפניה למודל
    this.modal = document.getElementById(this.modalId);
  }

  /**
     * Setup event listeners - הגדרת מאזיני אירועים
     *
     * @private
     */
  setupEventListeners() {
    if (!this.modal) {return;}

    // מאזין לסגירת המודל
    this.modal.addEventListener('hidden.bs.modal', () => {
      this.onModalHidden();
    });

    // מאזין למקש ESC
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });

    // // console.debug('EntityDetailsModal event listeners set up'); // Disabled for linting
  }

  /**
     * Show entity details modal - הצגת חלון קופץ עם פרטי ישות
     *
     * @param {string} entityType - סוג הישות (ticker, trade, trade_plan, וכו')
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} options - אפשרויות נוספות
     * @public
     */
  async show(entityType, entityId, options = {}) {
    try {
      if (!entityType || !entityId && entityId !== 0) {
        throw new Error('חסרים פרמטרים: entityType ו-entityId');
      }

      // בדיקת אתחול
      if (!this.isInitialized) {
        throw new Error('EntityDetailsModal לא אותחל');
      }

      // שמירת מידע נוכחי
      this.currentEntityType = entityType;
      this.currentEntityId = entityId;

      // עדכון כותרת המודל
      this.updateModalTitle(entityType, entityId);

      // הצגת מצב טעינה
      this.showLoadingState();

      // הצגת המודל
      this.showModal();

      // טעינת הנתונים
      await this.loadEntityData(entityType, entityId, options);

    } catch (error) {
      // // console.error('Error showing entity details modal:', error); // Disabled for linting
      if (window.showErrorNotification) {
        window.showErrorNotification(`שגיאה בהצגת פרטי ישות: ${error.message}`);
      }
      this.hide();
    }
  }

  /**
     * Hide modal - הסתרת החלון הקופץ
     *
     * @public
     */
  hide() {
    try {
      if (this.modal && this.isVisible()) {
        const bsModal = bootstrap.Modal.getInstance(this.modal);
        if (bsModal) {
          bsModal.hide();
        } else {
          // fallback
          this.modal.style.display = 'none';
          this.modal.classList.remove('show');
          document.body.classList.remove('modal-open');
        }
      }
    } catch (error) {
      // // console.error('Error hiding entity details modal:', error); // Disabled for linting
    }
  }

  /**
     * Check if modal is visible - בדיקה אם המודל מוצג
     *
     * @returns {boolean} - true אם המודל מוצג
     * @public
     */
  isVisible() {
    return this.modal && this.modal.classList.contains('show');
  }

  /**
     * Update modal title - עדכון כותרת המודל
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @private
     */
  updateModalTitle(entityType, entityId) {
    const titleElement = document.getElementById(`${this.modalId}Label`);
    if (!titleElement) {return;}

    const entityNames = {
      ticker: 'טיקר',
      trade: 'טרייד',
      trade_plan: 'תכנית השקעה',
      execution: 'ביצוע עסקה',
      account: 'חשבון',
      alert: 'התראה',
      cash_flow: 'תזרים מזומנים',
      note: 'הערה',
    };

    const entityName = entityNames[entityType] || 'ישות';
    titleElement.textContent = `פרטי ${entityName} #${entityId}`;
  }

  /**
     * Show loading state - הצגת מצב טעינה
     *
     * @private
     */
  showLoadingState() {
    const contentElement = document.getElementById('entityDetailsContent');
    if (!contentElement) {return;}

    contentElement.innerHTML = `
            <div class="entity-details-loading d-flex flex-column align-items-center justify-content-center" style="min-height: 300px;">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">טוען...</span>
                </div>
                <p class="mt-3 text-muted">טוען פרטי ישות...</p>
            </div>
        `;
  }

  /**
     * Load entity data - טעינת נתוני הישות
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @param {Object} options - אפשרויות נוספות
     * @private
     */
  async loadEntityData(entityType, entityId, options = {}) {
    try {
      // בדיקת זמינות API module
      if (!window.entityDetailsAPI) {
        throw new Error('Entity Details API לא נטען');
      }

      // קריאה ל-API לקבלת נתוני הישות
      let entityData = await window.entityDetailsAPI.getEntityDetails(entityType, entityId);

      // בדיקת זמינות Renderer module
      if (!window.entityDetailsRenderer) {
        throw new Error('Entity Details Renderer לא נטען');
      }

      // קבלת נתונים חיצוניים עבור טיקרים
      if (entityType === 'ticker' && window.entityDetailsAPI) {
        try {
          const externalData = await window.entityDetailsAPI.getExternalData(entityType, entityData);
          if (externalData) {
            // שילוב הנתונים החיצוניים עם נתוני הישות
            entityData = { ...entityData, ...externalData };
            // Note: entityData is reassigned to include external data
          }
        } catch (error) {
          // // console.debug('Could not load external data for ticker:', error); // Disabled for linting
        }
      }

      // רנדור הנתונים
      const renderedContent = window.entityDetailsRenderer.render(entityType, entityData, options);

      // הצגת התוכן ברנדור
      this.showRenderedContent(renderedContent);

    } catch (error) {
      // // console.error('Error loading entity data:', error); // Disabled for linting
      this.showErrorState(error.message);
    }
  }

  /**
     * Show rendered content - הצגת תוכן מרונדר
     *
     * @param {string} renderedContent - תוכן HTML מרונדר
     * @private
     */
  showRenderedContent(renderedContent) {
    const contentElement = document.getElementById('entityDetailsContent');
    if (!contentElement) {return;}

    contentElement.innerHTML = renderedContent;
  }

  /**
     * Show error state - הצגת מצב שגיאה
     *
     * @param {string} errorMessage - הודעת שגיאה
     * @private
     */
  showErrorState(errorMessage) {
    const contentElement = document.getElementById('entityDetailsContent');
    if (!contentElement) {return;}

    contentElement.innerHTML = `
            <div class="entity-details-error d-flex flex-column align-items-center justify-content-center" style="min-height: 300px;">
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h6>שגיאה בטעינת פרטי הישות</h6>
                    <p class="mb-0">${errorMessage}</p>
                </div>
                <button type="button" class="btn btn-outline-primary" onclick="window.entityDetailsModal.retry()">
                    נסה שוב
                </button>
            </div>
        `;
  }

  /**
     * Show modal using Bootstrap - הצגת המודל באמצעות Bootstrap
     *
     * @private
     */
  showModal() {
    if (!this.modal) {return;}

    try {
      const bsModal = new bootstrap.Modal(this.modal);
      bsModal.show();
    } catch (error) {
      // // console.error('Error showing modal with Bootstrap:', error); // Disabled for linting
      // fallback להצגה ישירה
      this.modal.style.display = 'block';
      this.modal.classList.add('show');
      document.body.classList.add('modal-open');
    }
  }

  /**
     * Retry loading data - ניסיון חוזר לטעינת נתונים
     *
     * @public
     */
  async retry() {
    if (this.currentEntityType && this.currentEntityId !== null) {
      await this.show(this.currentEntityType, this.currentEntityId);
    }
  }

  /**
     * Handle modal hidden event - טיפול באירוע הסתרת המודל
     *
     * @private
     */
  onModalHidden() {
    // ניקוי נתונים נוכחיים
    this.currentEntityType = null;
    this.currentEntityId = null;

    // ניקוי תוכן המודל
    const contentElement = document.getElementById('entityDetailsContent');
    if (contentElement) {
      contentElement.innerHTML = '';
    }
  }

  /**
     * Get current entity info - קבלת מידע על הישות הנוכחית
     *
     * @returns {Object} - מידע על הישות הנוכחית
     * @public
     */
  getCurrentEntityInfo() {
    return {
      entityType: this.currentEntityType,
      entityId: this.currentEntityId,
      isVisible: this.isVisible(),
    };
  }

  /**
     * Edit entity - עריכת ישות (פתיחת מודל עריכה)
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @public
     */
  editEntity(entityType, entityId) {
    try {
      // הסתרת חלון הפרטים
      this.hide();

      // פתיחת מודל עריכה לפי סוג הישות
      const editFunctions = {
        ticker: 'editTicker',
        trade: 'editTrade',
        trade_plan: 'editTradePlan',
        execution: 'editExecution',
        account: 'editAccount',
        alert: 'editAlert',
        cash_flow: 'editCashFlow',
        note: 'editNote',
      };

      const editFunction = editFunctions[entityType];
      if (editFunction && window[editFunction]) {
        window[editFunction](entityId);
      } else {
        // // console.warn(`Edit function not found for entity type: ${entityType}`); // Disabled for linting
        if (window.showWarningNotification) {
          window.showWarningNotification(`פונקציית עריכה לא נמצאה עבור ${entityType}`);
        }
      }

    } catch (error) {
      // // console.error('Error editing entity:', error); // Disabled for linting
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בפתיחת מודל עריכה');
      }
    }
  }

  /**
     * Open entity page - פתיחת דף הישות
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @public
     */
  openEntityPage(entityType, entityId) {
    try {
      const pageUrls = {
        ticker: 'tickers',
        trade: 'trades',
        trade_plan: 'trade_plans',
        execution: 'executions',
        account: 'accounts',
        alert: 'alerts',
        cash_flow: 'cash_flows',
        note: 'notes',
      };

      const pageUrl = pageUrls[entityType];
      if (pageUrl) {
        // פתיחה בטאב חדש עם פילטר לפי המזהה
        const url = `${pageUrl}?filter_id=${entityId}`;
        window.open(url, '_blank');

        if (window.showInfoNotification) {
          window.showInfoNotification(`נפתח דף ${entityType} בטאב חדש`);
        }
      } else {
        // // console.warn(`Page URL not found for entity type: ${entityType}`); // Disabled for linting
        if (window.showWarningNotification) {
          window.showWarningNotification('דף לא נמצא עבור סוג ישות זה');
        }
      }

    } catch (error) {
      // // console.error('Error opening entity page:', error); // Disabled for linting
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בפתיחת דף הישות');
      }
    }
  }

  /**
     * Show linked items - הצגת פריטים מקושרים
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @public
     */
  showLinkedItems(entityType, entityId) {
    try {
      // שימוש במערכת הפריטים המקושרים הקיימת
      if (window.showLinkedItemsModal) {
        window.showLinkedItemsModal(entityType, entityId);
      } else {
        // // console.warn('Linked items system not available'); // Disabled for linting
        if (window.showWarningNotification) {
          window.showWarningNotification('מערכת הפריטים המקושרים לא זמינה');
        }
      }

    } catch (error) {
      // // console.error('Error showing linked items:', error); // Disabled for linting
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בהצגת פריטים מקושרים');
      }
    }
  }

  /**
     * Export entity - ייצוא ישות
     *
     * @param {string} entityType - סוג הישות
     * @param {number|string} entityId - מזהה הישות
     * @public
     */
  async exportEntity(entityType, entityId) {
    try {
      if (window.showInfoNotification) {
        window.showInfoNotification('מכין קובץ ייצוא...');
      }

      // קבלת נתוני הישות
      const entityData = await window.entityDetailsAPI.getEntityWithLinkedItems(entityType, entityId);

      if (!entityData) {
        throw new Error('לא ניתן לקבל נתוני ישות לייצוא');
      }

      // יצירת תוכן JSON לייצוא
      const exportData = {
        entity_type: entityType,
        entity_id: entityId,
        export_date: new Date().toISOString(),
        data: entityData,
      };

      // יצירת קובץ להורדה
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});

      // יצירת link להורדה
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(dataBlob);
      downloadLink.download = `${entityType}_${entityId}_details.json`;

      // הפעלת ההורדה
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // ניקוי זכרון
      URL.revokeObjectURL(downloadLink.href);

      if (window.showSuccessNotification) {
        window.showSuccessNotification('הקובץ יוצא בהצלחה');
      }

    } catch (error) {
      // // console.error('Error exporting entity:', error); // Disabled for linting
      if (window.showErrorNotification) {
        window.showErrorNotification(`שגיאה בייצוא: ${error.message}`);
      }
    }
  }
}

// ===== GLOBAL FUNCTIONS =====

/**
 * Show entity details - פונקציה גלובלית להצגת פרטי ישות
 *
 * @param {string} entityType - סוג הישות
 * @param {number|string} entityId - מזהה הישות
 * @param {Object} options - אפשרויות נוספות
 * @global
 */
function showEntityDetails(entityType, entityId, options = {}) {
  try {
    if (window.entityDetailsModal) {
      window.entityDetailsModal.show(entityType, entityId, options);
    } else {
      // // console.error('EntityDetailsModal not initialized'); // Disabled for linting
      if (window.showErrorNotification) {
        window.showErrorNotification('מערכת פרטי ישויות לא מוכנה');
      }
    }
  } catch (error) {
    // // console.error('Error in showEntityDetails:', error); // Disabled for linting
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בהצגת פרטי ישות');
    }
  }
}

/**
 * Hide entity details modal - פונקציה גלובלית להסתרת חלון פרטי ישות
 *
 * @global
 */
function hideEntityDetails() {
  try {
    if (window.entityDetailsModal) {
      window.entityDetailsModal.hide();
    }
  } catch (error) {
    // // console.error('Error in hideEntityDetails:', error); // Disabled for linting
  }
}

// ===== AUTO INITIALIZATION =====

/**
 * Auto-initialize when DOM is ready - אתחול אוטומטי כשה-DOM מוכן
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // אתחול המחלקה הראשית
    new EntityDetailsModal();

    console.info('Entity Details Modal system loaded and ready');

  } catch (error) {
    // // console.error('Error auto-initializing EntityDetailsModal:', error); // Disabled for linting
  }
});

// ===== FUNCTION INDEX =====
/*
 * 📚 אינדקס פונקציות:
 * ================
 *
 * מחלקה ראשית:
 * - EntityDetailsModal.constructor() - אתחול המחלקה
 * - EntityDetailsModal.init() - אתחול מערכת המודל
 * - EntityDetailsModal.show() - הצגת פרטי ישות
 * - EntityDetailsModal.hide() - הסתרת המודל
 * - EntityDetailsModal.isVisible() - בדיקה אם המודל מוצג
 *
 * פונקציות עזר פרטיות:
 * - createModalStructure() - יצירת מבנה HTML
 * - setupEventListeners() - הגדרת מאזינים
 * - updateModalTitle() - עדכון כותרת
 * - showLoadingState() - הצגת מצב טעינה
 * - loadEntityData() - טעינת נתוני ישות
 * - showRenderedContent() - הצגת תוכן מרונדר
 * - showErrorState() - הצגת מצב שגיאה
 * - showModal() - הצגת המודל
 * - retry() - ניסיון חוזר
 * - onModalHidden() - טיפול בהסתרה
 * - getCurrentEntityInfo() - קבלת מידע נוכחי
 *
 * פונקציות גלובליות:
 * - showEntityDetails() - הצגת פרטי ישות
 * - hideEntityDetails() - הסתרת חלון פרטים
 *
 * אתחול אוטומטי:
 * - DOMContentLoaded listener - אתחול כשה-DOM מוכן
 */
