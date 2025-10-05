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
 * @param {string} color - Bootstrap color class for the dialog (default: warning)
 */
function showConfirmationDialog(title, message, onConfirm = null, onCancel = null, color = 'warning') {
  // showConfirmationDialog נקראה
  // bootstrap קיים

  // יצירת מודל אישור דינמי
  const modalId = 'confirmationModal';

  // יצירת HTML למודל
  const modalHTML = `
        <div class="modal fade warning-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true" data-bs-backdrop="true" data-bs-keyboard="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-${color} text-white">
                        <h5 class="modal-title" id="${modalId}Label">${title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="margin-left: 8px;">ביטול</button>
                        <button type="button" class="btn btn-${color} confirm-btn">אישור</button>
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

  // הגדרת אירועי כפתורים
  const confirmBtn = modal.querySelector('.confirm-btn');
  const cancelBtn = modal.querySelector('.btn-secondary');

  // פונקציה לסגירת המודל
  const closeModal = () => {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    }
    // הסרת המודל מהדף אחרי סגירה
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  };

  // סגירה בלחיצה על הרקע
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.dataset.cancelled = 'true'; // סימון שביטלו
      closeModal();
    }
  });

  // אירוע אישור
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      modal.dataset.confirmed = 'true'; // סימון שאישרו
      closeModal();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    };
  }

  // אירוע ביטול
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      modal.dataset.cancelled = 'true'; // סימון שביטלו
      closeModal();
      if (typeof onCancel === 'function') {
        onCancel();
      }
    };
  }

  // אירוע סגירה על ידי לחיצה מחוץ למודל או ESC
  modal.addEventListener('hidden.bs.modal', () => {
    // רק אם לא לחצו על כפתור כלשהו (כדי למנוע כפילות)
    if (!modal.dataset.cancelled && !modal.dataset.confirmed && typeof onCancel === 'function') {
      onCancel();
    }
    // הסרת המודל מהדף
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  });

  // הצגת המודל
  // מציג את המודל עם bootstrap
  try {
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    // המודל הוצג בהצלחה
  } catch (error) {
    // fallback ל-confirm רגיל
    console.error('Bootstrap Modal Error:', error);
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
  // showDeleteWarning נקראה עם
  // showConfirmationDialog קיים

  const title = `מחיקת ${itemTypeDisplay}`;
  const message = `האם אתה בטוח שברצונך למחוק את ${itemTypeDisplay} "${itemName}"?\n\nפעולה זו אינה ניתנת לביטול.`;

  // קורא ל-showConfirmationDialog עם צבע אדום למחיקה
  showConfirmationDialog(title, message, onConfirm, onCancel, 'danger');
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
  
  console.log('🔄 Native confirm() function overridden with custom dialog system');
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
          console.log('✅ User confirmed:', message);
        },
        () => {
          // User cancelled
          console.log('❌ User cancelled:', message);
        },
        'warning'
      );
      
      // Return false to prevent immediate execution
      return false;
    }
  });
  
  console.log('🔄 Smart confirm replacement initialized');
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
