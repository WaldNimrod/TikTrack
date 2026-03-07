/**
 * Phoenix Modal Component - Reusable Modal/Dialog Component
 * --------------------------------------------------------
 * Generic modal component for forms, dialogs, and overlays
 * 
 * @description Provides a reusable modal system with backdrop, close button, and form support
 * @version v1.0.0
 */

/**
 * Create and show a modal
 * @param {Object} options - Modal configuration
 * @param {string} options.title - Modal title
 * @param {HTMLElement|string} options.content - Modal content (HTML element or HTML string)
 * @param {Function} options.onClose - Callback when modal is closed
 * @param {Function} options.onSave - Callback when save button is clicked (optional)
 * @param {boolean} options.showSaveButton - Whether to show save button (default: true)
 * @param {string} options.saveButtonText - Save button text (default: "שמירה")
 * @param {string} options.cancelButtonText - Cancel button text (default: "ביטול")
 * @param {string} options.entity - Entity for header color (trading_account | brokers_fees | cash_flow)
 * @returns {HTMLElement} Modal element
 */
export function createModal(options = {}) {
  const {
    title = '',
    content = '',
    onClose = null,
    onSave = null,
    showSaveButton = true,
    saveButtonText = 'שמירה',
    cancelButtonText = 'ביטול',
    entity = null,
    confirmMode = false
  } = options;

  // Remove existing modal if any
  const existingBackdrop = document.getElementById('phoenix-modal-backdrop');
  if (existingBackdrop) {
    existingBackdrop.remove();
  }

  // Create modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'phoenix-modal-backdrop';
  backdrop.id = 'phoenix-modal-backdrop';
  
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'phoenix-modal';
  modal.id = 'phoenix-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'phoenix-modal-title');
  if (entity) {
    modal.setAttribute('data-entity', entity);
    modal.classList.add(`modal-entity-${entity}`);
  }

  // Create modal header
  const header = document.createElement('div');
  header.className = 'phoenix-modal__header';
  
  const titleElement = document.createElement('h2');
  titleElement.className = 'phoenix-modal__title';
  titleElement.id = 'phoenix-modal-title';
  titleElement.textContent = title;
  
  const closeButton = document.createElement('button');
  closeButton.className = 'phoenix-modal__close';
  closeButton.setAttribute('aria-label', 'סגור');
  closeButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6L6 18M6 6l12 12"></path>
    </svg>
  `;
  
  header.appendChild(titleElement);
  header.appendChild(closeButton);

  // Create modal body
  const body = document.createElement('div');
  body.className = 'phoenix-modal__body';
  
  // Insert content
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }

  // Create modal footer (RTL order: Cancel ימין, Confirm שמאל)
  const footer = document.createElement('div');
  footer.className = 'phoenix-modal__footer';

  const cancelButton = document.createElement('button');
  cancelButton.className = 'phoenix-modal__cancel-btn phoenix-btn phoenix-btn--secondary';
  cancelButton.type = 'button';
  cancelButton.textContent = cancelButtonText;
  footer.appendChild(cancelButton);

  if (showSaveButton && onSave) {
    const saveButton = document.createElement('button');
    saveButton.className = 'phoenix-modal__save-btn phoenix-btn phoenix-btn--primary' + (confirmMode ? ' phoenix-modal__confirm-btn' : '');
    if (confirmMode) saveButton.setAttribute('data-action', 'confirm-delete');
    saveButton.type = 'button';
    saveButton.textContent = saveButtonText;
    footer.appendChild(saveButton);

    saveButton.addEventListener('click', function(e) {
      e.preventDefault();
      onSave();
    });
  }

  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Event handlers
  function closeModalInternal() {
    backdrop.remove();
    if (onClose) {
      onClose();
    }
  }

  closeButton.addEventListener('click', closeModalInternal);
  cancelButton.addEventListener('click', closeModalInternal);
  
  backdrop.addEventListener('click', function(e) {
    if (e.target === backdrop) {
      closeModalInternal();
    }
  });

  // ESC key handler
  const escHandler = function(e) {
    if (e.key === 'Escape') {
      closeModalInternal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Focus first input in modal
  setTimeout(() => {
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      firstInput.focus();
    }
  }, 100);

  return modal;
}

/**
 * Close modal programmatically
 */
export function closeModal() {
  const backdrop = document.getElementById('phoenix-modal-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
}
