/**
 * ========================================
 * Shared Modal Manager
 * ========================================
 * 
 * קוד משותף למודלים:
 * - פתיחת/סגירת מודלים
 * - איפוס טפסים
 * - ניהול מצב מודלים
 */

/**
 * מחלקה לניהול מודלים
 */
class ModalManager {
  /**
   * פתיחת מודל
   * @param {string} modalId - מזהה המודל
   * @param {Object} options - אפשרויות נוספות
   * @returns {Promise<void>}
   */
  static async showModal(modalId, options = {}) {
    try {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        throw new Error(`Modal with ID '${modalId}' not found`);
      }

      // איפוס טופס אם נדרש
      if (options.resetForm !== false) {
        this.resetForm(modalId);
      }

      // טעינת נתונים אם נדרש
      if (options.loadData && typeof options.loadData === 'function') {
        await options.loadData();
      }

      // הצגת המודל
      const modal = new bootstrap.Modal(modalElement, {
        backdrop: options.backdrop !== false ? true : false,
        keyboard: options.keyboard !== false ? true : false,
        focus: options.focus !== false ? true : false
      });

      modal.show();

      // callback אחרי הצגה
      if (options.onShown && typeof options.onShown === 'function') {
        modalElement.addEventListener('shown.bs.modal', options.onShown, { once: true });
      }

      console.log(`✅ Modal '${modalId}' opened`);
    } catch (error) {
      console.error(`❌ Error opening modal '${modalId}':`, error);
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', `שגיאה בפתיחת מודל: ${modalId}`);
      }
    }
  }

  /**
   * סגירת מודל
   * @param {string} modalId - מזהה המודל
   * @param {Object} options - אפשרויות נוספות
   * @returns {void}
   */
  static closeModal(modalId, options = {}) {
    try {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        console.warn(`Modal with ID '${modalId}' not found`);
        return;
      }

      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // callback אחרי סגירה
      if (options.onHidden && typeof options.onHidden === 'function') {
        modalElement.addEventListener('hidden.bs.modal', options.onHidden, { once: true });
      }

      console.log(`✅ Modal '${modalId}' closed`);
    } catch (error) {
      console.error(`❌ Error closing modal '${modalId}':`, error);
    }
  }

  /**
   * איפוס טופס במודל
   * @param {string} modalId - מזהה המודל
   * @param {string} formId - מזהה הטופס (אופציונלי)
   * @returns {void}
   */
  static resetForm(modalId, formId = null) {
    try {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        console.warn(`Modal with ID '${modalId}' not found`);
        return;
      }

      // חיפוש טופס במודל
      let form;
      if (formId) {
        form = document.getElementById(formId);
      } else {
        form = modalElement.querySelector('form');
      }

      if (form) {
        form.reset();
        
        // ניקוי שגיאות validation
        this.clearValidationErrors(form);
        
        // הפעלת שדות אם נדרש
        this.enableFormFields(form);
        
        console.log(`✅ Form reset in modal '${modalId}'`);
      } else {
        console.warn(`No form found in modal '${modalId}'`);
      }
    } catch (error) {
      console.error(`❌ Error resetting form in modal '${modalId}':`, error);
    }
  }

  /**
   * מילוי טופס במודל
   * @param {string} modalId - מזהה המודל
   * @param {Object} data - נתונים למילוי
   * @param {string} formId - מזהה הטופס (אופציונלי)
   * @returns {void}
   */
  static fillForm(modalId, data, formId = null) {
    try {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        console.warn(`Modal with ID '${modalId}' not found`);
        return;
      }

      // חיפוש טופס במודל
      let form;
      if (formId) {
        form = document.getElementById(formId);
      } else {
        form = modalElement.querySelector('form');
      }

      if (form && data) {
        Object.entries(data).forEach(([fieldId, value]) => {
          const field = form.querySelector(`#${fieldId}`);
          if (field) {
            field.value = value || '';
          }
        });
        
        console.log(`✅ Form filled in modal '${modalId}'`);
      } else {
        console.warn(`No form or data found for modal '${modalId}'`);
      }
    } catch (error) {
      console.error(`❌ Error filling form in modal '${modalId}':`, error);
    }
  }

  /**
   * השבתת שדות טופס
   * @param {HTMLElement|string} form - טופס או מזהה טופס
   * @param {Array} excludeFields - שדות שלא להשבית
   * @returns {void}
   */
  static disableFormFields(form, excludeFields = []) {
    try {
      const formElement = typeof form === 'string' ? document.getElementById(form) : form;
      if (!formElement) {
        console.warn('Form not found');
        return;
      }

      const fields = formElement.querySelectorAll('input, select, textarea, button');
      fields.forEach(field => {
        if (!excludeFields.includes(field.id)) {
          field.disabled = true;
        }
      });

      console.log('✅ Form fields disabled');
    } catch (error) {
      console.error('❌ Error disabling form fields:', error);
    }
  }

  /**
   * הפעלת שדות טופס
   * @param {HTMLElement|string} form - טופס או מזהה טופס
   * @param {Array} excludeFields - שדות שלא להפעיל
   * @returns {void}
   */
  static enableFormFields(form, excludeFields = []) {
    try {
      const formElement = typeof form === 'string' ? document.getElementById(form) : form;
      if (!formElement) {
        console.warn('Form not found');
        return;
      }

      const fields = formElement.querySelectorAll('input, select, textarea, button');
      fields.forEach(field => {
        if (!excludeFields.includes(field.id)) {
          field.disabled = false;
        }
      });

      console.log('✅ Form fields enabled');
    } catch (error) {
      console.error('❌ Error enabling form fields:', error);
    }
  }

  /**
   * ניקוי שגיאות validation
   * @param {HTMLElement|string} form - טופס או מזהה טופס
   * @returns {void}
   */
  static clearValidationErrors(form) {
    try {
      const formElement = typeof form === 'string' ? document.getElementById(form) : form;
      if (!formElement) {
        console.warn('Form not found');
        return;
      }

      // הסרת classes של שגיאה
      const errorFields = formElement.querySelectorAll('.is-invalid');
      errorFields.forEach(field => {
        field.classList.remove('is-invalid');
      });

      // הסרת הודעות שגיאה
      const errorMessages = formElement.querySelectorAll('.invalid-feedback');
      errorMessages.forEach(message => {
        message.remove();
      });

      console.log('✅ Validation errors cleared');
    } catch (error) {
      console.error('❌ Error clearing validation errors:', error);
    }
  }

  /**
   * הצגת שגיאות validation
   * @param {HTMLElement|string} form - טופס או מזהה טופס
   * @param {Object} errors - שגיאות
   * @returns {void}
   */
  static showValidationErrors(form, errors) {
    try {
      const formElement = typeof form === 'string' ? document.getElementById(form) : form;
      if (!formElement) {
        console.warn('Form not found');
        return;
      }

      // ניקוי שגיאות קודמות
      this.clearValidationErrors(formElement);

      // הצגת שגיאות חדשות
      Object.entries(errors).forEach(([fieldId, message]) => {
        const field = formElement.querySelector(`#${fieldId}`);
        if (field) {
          field.classList.add('is-invalid');
          
          // הוספת הודעת שגיאה
          const errorDiv = document.createElement('div');
          errorDiv.className = 'invalid-feedback';
          errorDiv.textContent = message;
          
          field.parentNode.appendChild(errorDiv);
        }
      });

      console.log('✅ Validation errors shown');
    } catch (error) {
      console.error('❌ Error showing validation errors:', error);
    }
  }

  /**
   * קבלת נתוני טופס
   * @param {HTMLElement|string} form - טופס או מזהה טופס
   * @returns {Object} נתוני הטופס
   */
  static getFormData(form) {
    try {
      const formElement = typeof form === 'string' ? document.getElementById(form) : form;
      if (!formElement) {
        console.warn('Form not found');
        return {};
      }

      const formData = new FormData(formElement);
      const data = {};

      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      console.log('✅ Form data collected');
      return data;
    } catch (error) {
      console.error('❌ Error getting form data:', error);
      return {};
    }
  }

  /**
   * בדיקת תקינות טופס
   * @param {HTMLElement|string} form - טופס או מזהה טופס
   * @returns {boolean} האם הטופס תקין
   */
  static validateForm(form) {
    try {
      const formElement = typeof form === 'string' ? document.getElementById(form) : form;
      if (!formElement) {
        console.warn('Form not found');
        return false;
      }

      // בדיקת HTML5 validation
      const isValid = formElement.checkValidity();
      
      if (!isValid) {
        formElement.reportValidity();
      }

      return isValid;
    } catch (error) {
      console.error('❌ Error validating form:', error);
      return false;
    }
  }

  /**
   * הצגת טעינה במודל
   * @param {string} modalId - מזהה המודל
   * @param {boolean} show - האם להציג
   * @returns {void}
   */
  static showLoading(modalId, show = true) {
    try {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        console.warn(`Modal with ID '${modalId}' not found`);
        return;
      }

      const loadingElement = modalElement.querySelector('.loading-indicator');
      if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
      }

      // השבתת/הפעלת טופס
      const form = modalElement.querySelector('form');
      if (form) {
        if (show) {
          this.disableFormFields(form);
        } else {
          this.enableFormFields(form);
        }
      }
    } catch (error) {
      console.error(`❌ Error showing loading in modal '${modalId}':`, error);
    }
  }

  /**
   * יצירת מודל דינמי
   * @param {Object} config - קונפיגורציה
   * @returns {HTMLElement} אלמנט מודל
   */
  static createModal(config) {
    try {
      const modalId = config.id || `modal-${Date.now()}`;
      
      const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
          <div class="modal-dialog ${config.size || ''}">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="${modalId}Label">${config.title || 'Modal'}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                ${config.body || ''}
              </div>
              <div class="modal-footer">
                ${config.footer || ''}
              </div>
            </div>
          </div>
        </div>
      `;

      // יצירת אלמנט
      const modalElement = document.createElement('div');
      modalElement.innerHTML = modalHTML;
      const modal = modalElement.firstElementChild;

      // הוספה ל-DOM
      document.body.appendChild(modal);

      console.log(`✅ Dynamic modal '${modalId}' created`);
      return modal;
    } catch (error) {
      console.error('❌ Error creating dynamic modal:', error);
      return null;
    }
  }
}

// ייצוא המודול
window.ModalManager = ModalManager;

console.log('✅ Shared Modal Manager module loaded');
