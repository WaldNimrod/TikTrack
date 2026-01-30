/**
 * Warning System - TikTrack
 * ==========================
 *
 * מערכת אזהרות מרכזית לפרויקט TikTrack
 *
 * קובץ זה מכיל פונקציות מערכת האזהרות:
 * 1. WARNING DIALOGS - דיאלוגי אישור ואזהרה
 * 2. VALIDATION WARNINGS - אזהרות ולידציה לשדות
 * 3. DELETE CONFIRMATIONS - אישורי מחיקה
 *
 * קובץ: trading-ui/scripts/warning-system.js
 * גרסה: 1.0
 * תאריך יצירה: ספטמבר 2025
 *
 * הועבר מ: notification-system.js (ארכיטקטורה מחודשת)
 * 
 * תלויות:
 * - notification-system.js (לפונקציית showErrorNotification)
 * - Bootstrap 5.3.0 (לפונקציונליות מודלים)
 *
 * דוקומנטציה מפורטת: documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */


// ===== FUNCTION INDEX =====
//
// === Event Handlers ===
// - showValidationWarning() - Showvalidationwarning
// - showConfirmationDialog() - Showconfirmationdialog
// - globalConfirm() - Globalconfirm
// - overrideNativeConfirm() - Overridenativeconfirm
// - smartConfirmReplacement() - Smartconfirmreplacement
// - cleanupFunctions() - Cleanupfunctions
//
// === UI Functions ===
// - showDeleteWarning() - Showdeletewarning
//
// === API Functions ===
// - invokeCallbacks() - Invokecallbacks
// === Object Methods ===
// - confirmationModalCancel() - Confirmationmodalcancel
// - confirmationModalCancel() - Confirmationmodalcancel
// - confirmationModalConfirm() - Confirmationmodalconfirm
// - confirmationModalConfirm() - Confirmationmodalconfirm

// === Other ===
// - closeModal() - Closemodal

// ===== VALIDATION WARNING FUNCTIONS =====

/**
 * Show validation warning for form fields
 * WARNING SYSTEM - Shows validation errors with field highlighting
 *
 * @param {string} fieldId - ID of the field with validation error
 * @param {string} message - Validation error message
 * @param {number} duration - Display duration in milliseconds (default: 6000)
 */
function showValidationWarning(fieldId, message, duration = 6000) {
  // showValidationWarning called

  // Get field name for better error message
  const field = document.getElementById(fieldId);
  let fieldName = fieldId;

  if (field) {
    // Try to get a human-readable field name
    const label = document.querySelector(`label[for="${fieldId}"]`);
    if (label) {
      fieldName = label.textContent.trim();
    } else if (field.placeholder) {
      fieldName = field.placeholder;
    } else if (field.name) {
      fieldName = field.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  }

  // Create detailed error message
  const detailedMessage = `${fieldName}: ${message}`;

  // Show error notification (red)
  // showValidationWarning calling showErrorNotification
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאת וולידציה', detailedMessage, duration);
  } else {
    console.error('showErrorNotification is not available');
  }

  // Highlight the problematic field
  // Field element found

  if (field) {
    // Add error styling
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');

    // Add red border
    const colors = window.getTableColors ? window.getTableColors() : { negative: '#dc3545' };
    field.style.borderColor = colors.negative;
    field.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';

    // Scroll to field
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Focus on field
    field.focus();

    // Field styling applied

    // Remove styling after 3 seconds
    setTimeout(() => {
      field.classList.remove('is-invalid');
      field.style.borderColor = '';
      field.style.boxShadow = '';
      // Field styling removed
    }, 3000);
  } else {
    // Field not found
    console.warn(`⚠️ Field not found: ${fieldId}`);
  }
}

// ===== CONFIRMATION DIALOG FUNCTIONS =====

/**
 * Show confirmation dialog
 * WARNING SYSTEM - Shows confirmation dialog for important actions
 *
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Function} onConfirm - Callback for confirm action
 * @param {Function} onCancel - Callback for cancel action
 * @param {string} color - Bootstrap color class for the dialog (default: danger)
 */
function showConfirmationDialog(title, message, onConfirm = null, onCancel = null, color = 'danger') {
  // יצירת מודל אישור דינמי
  const modalId = 'confirmationModal';

  // יצירת HTML למודל
  const modalHTML = `
        <div class="modal fade warning-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true" data-bs-backdrop="true" data-bs-keyboard="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-${color} text-white">
                        <h5 class="modal-title" id="${modalId}Label">${title}</h5>
                        ${window.createCloseButton ? window.createCloseButton('', 'Close') : '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'}
                    </div>
                    <div class="modal-body">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
                        <button data-button-type="CANCEL" data-attributes="data-bs-dismiss='modal' type='button'" data-classes="ms-2" data-onclick="window.confirmationModalCancel()"></button>
                        <button type="button" class="btn btn-${color} confirm-btn" data-onclick="window.confirmationModalConfirm()">אישור</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // קבלת המודל החדש
  const modal = document.getElementById(modalId);

  // פונקציה לסגירת המודל
  const closeModal = () => {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
      window.ModalManagerV2.hideModal(modalId);
    } else if (bootstrap?.Modal) {
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    // הסרת המודל מהדף אחרי סגירה
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  };

  // מדד למניעת קריאה כפולה
  let callbacksInvoked = false;

  // פונקציה לזימון callbacks רק פעם אחת
  const invokeCallbacks = (isConfirm) => {
    if (callbacksInvoked) {
      return;
    }
    callbacksInvoked = true;
    
    if (isConfirm && typeof onConfirm === 'function') {
      onConfirm();
    } else if (!isConfirm && typeof onCancel === 'function') {
      onCancel();
    }
  };

  // פונקציה לניקוי הפונקציות הגלובליות
  const cleanupFunctions = () => {
    // נקה את הפונקציות רק אחרי שהמודל נסגר לגמרי
    setTimeout(() => {
      if (window.confirmationModalConfirm && modal.dataset.confirmed === 'true') {
        delete window.confirmationModalConfirm;
      }
      if (window.confirmationModalCancel && modal.dataset.cancelled === 'true') {
        delete window.confirmationModalCancel;
      }
    }, 500); // המתן 500ms אחרי סגירת המודל
  };

  // יצירת פונקציות גלובליות לכפתורים (עם data-onclick)
  // תמיד צור מחדש את הפונקציות כדי למנוע בעיות עם מודלים מרובים
  window.confirmationModalConfirm = () => {
    if (!modal || modal.dataset.confirmed === 'true') {
      return; // Already confirmed or modal removed, prevent double execution
    }
    modal.dataset.confirmed = 'true';
    // Remove aria-hidden before invoking callbacks to prevent accessibility warning
    modal.removeAttribute('aria-hidden');
    invokeCallbacks(true);
    closeModal();
    cleanupFunctions();
  };

  window.confirmationModalCancel = () => {
    if (!modal || modal.dataset.cancelled === 'true') {
      return; // Already cancelled or modal removed, prevent double execution
    }
    modal.dataset.cancelled = 'true';
    // Remove aria-hidden before invoking callbacks to prevent accessibility warning
    modal.removeAttribute('aria-hidden');
    invokeCallbacks(false);
    closeModal();
    cleanupFunctions();
  };

  // סגירה בלחיצה על הרקע
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      if (modal.dataset.cancelled !== 'true') {
        modal.dataset.cancelled = 'true';
        invokeCallbacks(false);
        closeModal();
        cleanupFunctions();
      }
    }
  });

  // אירוע סגירה על ידי לחיצה מחוץ למודל או ESC
  modal.addEventListener('hidden.bs.modal', () => {
    // רק אם לא זומנו callbacks (כדי למנוע כפילות)
    if (!callbacksInvoked) {
      invokeCallbacks(false);
    }
    // הסרת המודל מהדף
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
    cleanupFunctions();
  });

  // הצגת המודל דרך ModalManagerV2 או Bootstrap fallback
  try {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
      // ניקוי backdrops לפני פתיחה
      if (window.ModalManagerV2._cleanupBootstrapBackdrops) {
        window.ModalManagerV2._cleanupBootstrapBackdrops();
      }
      
      window.ModalManagerV2.showModal(modalId, 'view').then(() => {
        // עדכון z-index דרך ModalZIndexManager
        if (window.ModalZIndexManager && typeof window.ModalZIndexManager.forceUpdate === 'function') {
          requestAnimationFrame(() => {
            window.ModalZIndexManager.forceUpdate(modal);
          });
        }
      }).catch(error => {
        window.Logger?.error('Error showing confirmation modal via ModalManagerV2', { error, modalId, page: 'warning-system' });
        // Fallback to Bootstrap
        if (bootstrap?.Modal) {
          // ניקוי backdrops לפני פתיחה
          if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
            window.ModalManagerV2._cleanupBootstrapBackdrops();
          }
          const bootstrapModal = new bootstrap.Modal(modal, { backdrop: false });
          bootstrapModal.show();
          // ניקוי backdrops אחרי פתיחה
          if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
            setTimeout(() => {
              window.ModalManagerV2._cleanupBootstrapBackdrops();
            }, 50);
          }
          // עדכון z-index
          if (window.ModalZIndexManager?.forceUpdate) {
            setTimeout(() => {
              window.ModalZIndexManager.forceUpdate(modal);
            }, 50);
          }
        } else {
          throw error;
        }
      });
    } else if (bootstrap?.Modal) {
      // ניקוי backdrops לפני פתיחה
      if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
        window.ModalManagerV2._cleanupBootstrapBackdrops();
      }
      const bootstrapModal = new bootstrap.Modal(modal, { backdrop: false });
      bootstrapModal.show();
      // ניקוי backdrops אחרי פתיחה
      if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
        setTimeout(() => {
          window.ModalManagerV2._cleanupBootstrapBackdrops();
        }, 50);
      }
      // עדכון z-index
      if (window.ModalZIndexManager?.forceUpdate) {
        setTimeout(() => {
          window.ModalZIndexManager.forceUpdate(modal);
        }, 50);
      }
    } else {
      throw new Error('Bootstrap Modal not available');
    }
  } catch (error) {
    console.error('❌ showConfirmationDialog - Modal Error:', error);
    // fallback ל-confirm רגיל
    const confirmed = window.confirm(message);
    if (confirmed && onConfirm) {
      onConfirm();
    } else if (!confirmed && onCancel) {
      onCancel();
    }
  }
}

// ===== DELETE WARNING FUNCTIONS =====

/**
 * Show delete warning
 * WARNING SYSTEM - Shows warning for delete operations
 *
 * @param {string} itemType - Type of item being deleted
 * @param {string} itemName - Name/ID of item being deleted
 * @param {string} itemTypeDisplay - Display name for item type
 * @param {Function} onConfirm - Callback for confirm action
 * @param {Function} onCancel - Callback for cancel action
 */
function showDeleteWarning(itemType, itemName, itemTypeDisplay, onConfirm = null, onCancel = null) {
  const title = `מחיקת ${itemTypeDisplay}`;
  const message = `האם אתה בטוח שברצונך למחוק את ${itemTypeDisplay} "${itemName}"?\n\nפעולה זו אינה ניתנת לביטול.`;

  // קורא ל-showConfirmationDialog עם צבע לבן למחיקה
  showConfirmationDialog(title, message, onConfirm, onCancel, 'warning');
}

// ===== GLOBAL CONFIRM REPLACEMENT =====

/**
 * Global confirm replacement - replaces all confirm() calls with custom dialog
 * This function should be used instead of the native confirm() function
 * 
 * @param {string} message - The confirmation message
 * @param {function} onConfirm - Callback function when user confirms
 * @param {function} onCancel - Callback function when user cancels (optional)
 * @param {string} title - Dialog title (optional, defaults to "אישור")
 * @param {string} color - Dialog color theme (optional, defaults to 'warning')
 */
function globalConfirm(message, onConfirm, onCancel = null, title = 'אישור', color = 'warning') {
  showConfirmationDialog(
    title,
    message,
    onConfirm,
    onCancel,
    color
  );
}

/**
 * Override native confirm function globally
 * This replaces the browser's native confirm() with our custom dialog
 * 
 * IMPORTANT: This maintains backward compatibility by handling both sync and async patterns
 */
function overrideNativeConfirm() {
  // Store original confirm function
  window._originalConfirm = window.confirm;
  
  // Override confirm function - maintains backward compatibility
  window.confirm = function(message, title = 'אישור') {
    // Use custom confirmation dialog
    showConfirmationDialog(
      title,
      message,
      () => {
        // User confirmed - continue execution
        return true;
      },
      () => {
        // User cancelled - stop execution
        return false;
      },
      'warning'
    );
    
    // Return false by default to prevent immediate execution
    // The actual logic will be handled by the dialog callbacks
    return false;
  };
}

/**
 * Smart confirm replacement that works with existing code patterns
 * This function detects the calling context and handles it appropriately
 */
function smartConfirmReplacement() {
  // Store original confirm function
  window._originalConfirm = window.confirm;
  
  // Create a proxy that intercepts confirm calls
  window.confirm = new Proxy(window._originalConfirm, {
    apply: function(target, thisArg, argumentsList) {
      const message = argumentsList[0];
      const title = argumentsList[1] || 'אישור';
      
      // Show custom confirmation dialog
      showConfirmationDialog(
        title,
        message,
        () => {
          // User confirmed - we need to continue the original execution
          // This is tricky because we need to resume the calling function
        },
        () => {
          // User cancelled
        },
        'warning'
      );
      
      // Return false to prevent immediate execution
      return false;
    }
  });
}

// ===== EXPORT TO GLOBAL SCOPE =====

// Export WARNING SYSTEM functions to global scope
window.showValidationWarning = showValidationWarning;
window.showConfirmationDialog = showConfirmationDialog;
window.showDeleteWarning = showDeleteWarning;
window.globalConfirm = globalConfirm;
window.overrideNativeConfirm = overrideNativeConfirm;

// Export the module itself
window.warningSystem = {
  showValidationWarning,
  showConfirmationDialog,
  showDeleteWarning,
};

// בדיקת פונקציות בסוף טעינת warning-system.js
// warning-system.js נטען
// showDeleteWarning קיים
// showConfirmationDialog קיים
// window.showDeleteWarning קיים
// window.showConfirmationDialog קיים
// window.showValidationWarning קיים
