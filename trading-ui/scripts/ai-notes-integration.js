/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 5
 * 
 * DATA MANIPULATION (1)
 * - saveAsNote() - Save analysis result as note with related type and object
 * 
 * MODAL MANAGEMENT (2)
 * - showRelatedTypeSelector() - Show modal for selecting related type (ticker/trade/plan/account)
 * - showRelatedObjectSelector() - Show modal for selecting related object based on type
 * 
 * UTILITIES (2)
 * - convertMarkdownToHTML() - Convert markdown text to HTML
 * - openNoteModal() - Open notes modal with pre-filled content
 * 
 * ==========================================
 */
/**
 * AI Notes Integration
 * ======================================
 * Integration with Notes system for saving AI analysis results
 *
 * Responsibilities:
 * - Save analysis results as notes
 * - Convert markdown to HTML
 * - Open notes modal with pre-filled content
 * - Link to ticker/trade/plan
 *
 * @version 1.0.0
 * @created January 28, 2025
 * @author TikTrack Development Team
 */
(function() {
  'use strict';

  const AINotesIntegration = {
    version: '1.0.0',

    /**
     * Save analysis as note
     */
    async saveAsNote(analysisResult) {
      if (!analysisResult || !analysisResult.response_text) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('אין תוצאות לשמירה', 'system');
        }
        return;
      }

      try {
        // Show selection modal for related type
        const relatedType = await this.showRelatedTypeSelector();
        if (!relatedType) {
          return; // User cancelled
        }

        // Show selection modal for related object
        const relatedId = await this.showRelatedObjectSelector(relatedType);
        if (!relatedId) {
          return; // User cancelled
        }

        // Convert markdown to HTML
        const htmlContent = await this.convertMarkdownToHTML(analysisResult.response_text);

        // Use NotesData service to create note
        if (window.NotesData && window.NotesData.createNote) {
          const payload = {
            content: htmlContent,
            related_type_id: parseInt(relatedType, 10),
            related_id: parseInt(relatedId, 10),
          };

          const response = await window.NotesData.createNote({ payload });

          // Handle response with CRUDResponseHandler if available
          if (window.CRUDResponseHandler) {
            await window.CRUDResponseHandler.handleSaveResponse(response, {
              modalId: null,
              successMessage: 'הערה נשמרה בהצלחה!',
              entityName: 'הערה',
              reloadFn: () => {
                // Optional: reload notes if needed
              },
              requiresHardReload: false,
            });
          } else {
            // Fallback notification
            if (window.NotificationSystem) {
              window.NotificationSystem.showSuccess('הערה נשמרה בהצלחה!', 'business');
            }
          }

          window.Logger?.info('Analysis saved as note', {
            page: 'ai-analysis',
            relatedType,
            relatedId,
          });
        } else {
          // Fallback: open modal
          await this.openNoteModal(htmlContent, relatedType, relatedId);
        }
      } catch (error) {
        window.Logger?.error('Error saving analysis as note', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בשמירת הערה', 'system');
        }
      }
    },

    /**
     * Show related type selector using modal
     * Uses ModalManagerV2 via window.createAndShowModal helper for proper modal management
     */
    async showRelatedTypeSelector() {
      return new Promise(async (resolve) => {
        // Create a simple modal for type selection
        const modalId = 'aiNoteRelatedTypeModal';
        const modalHTML = `
          <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true" data-bs-backdrop="false" data-bs-keyboard="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header modal-header-colored">
                  <h5 class="modal-title" id="${modalId}Label">בחר סוג אובייקט מקושר</h5>
                  <button type="button" data-button-type="CLOSE" data-bs-dismiss="modal" data-text="" title="סגור"></button>
                </div>
                <div class="modal-body">
                  <label for="aiNoteRelatedTypeSelect" class="form-label">סוג אובייקט:</label>
                  <select id="aiNoteRelatedTypeSelect" class="form-select">
                    <option value="">בחר סוג...</option>
                    <option value="1">חשבון מסחר</option>
                    <option value="2">טרייד</option>
                    <option value="3">תוכנית השקעה</option>
                    <option value="4">טיקר</option>
                  </select>
                </div>
                <div class="modal-footer">
                  <button type="button" data-button-type="SECONDARY" data-variant="full" data-bs-dismiss="modal" data-text="ביטול"></button>
                  <button type="button" data-button-type="PRIMARY" data-variant="full" id="aiNoteRelatedTypeConfirm" data-text="אישור"></button>
                </div>
              </div>
            </div>
          </div>
        `;

        try {
          // Use window.createAndShowModal helper which integrates with ModalManagerV2
          await window.createAndShowModal(modalHTML, modalId, { backdrop: false, keyboard: true });

          const modalElement = document.getElementById(modalId);
          if (!modalElement) {
            resolve(null);
            return;
          }

          const confirmBtn = document.getElementById('aiNoteRelatedTypeConfirm');
          const select = document.getElementById('aiNoteRelatedTypeSelect');

          // Helper function to hide and cleanup modal
          const hideAndCleanup = async () => {
            // Hide modal using ModalManagerV2 or Bootstrap
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
              await window.ModalManagerV2.hideModal(modalId);
            } else if (bootstrap?.Modal) {
              const bsModal = bootstrap.Modal.getInstance(modalElement);
              if (bsModal) {
                bsModal.hide();
              }
            }
            
            // Remove modal from DOM after animation
            setTimeout(() => {
              if (modalElement.parentNode) {
                modalElement.remove();
              }
            }, 300); // Bootstrap fade animation duration
          };

          const handleConfirm = async () => {
            const selectedValue = select.value;
            await hideAndCleanup();
            resolve(selectedValue || null);
          };

          const handleCancel = async () => {
            await hideAndCleanup();
            resolve(null);
          };

          confirmBtn.addEventListener('click', handleConfirm);
          modalElement.addEventListener('hidden.bs.modal', handleCancel);
        } catch (error) {
          window.Logger?.error('Error showing related type selector modal', error, { page: 'ai-analysis' });
          resolve(null);
        }
      });
    },

    /**
     * Show related object selector using modal with SelectPopulatorService
     */
    async showRelatedObjectSelector(relatedType) {
      return new Promise(async (resolve) => {
        const typeMap = {
          '1': { label: 'חשבון מסחר', endpoint: 'accounts' },
          '2': { label: 'טרייד', endpoint: 'trades' },
          '3': { label: 'תוכנית השקעה', endpoint: 'trade-plans' },
          '4': { label: 'טיקר', endpoint: 'tickers' }
        };

        const typeInfo = typeMap[relatedType];
        if (!typeInfo) {
          resolve(null);
          return;
        }

        // Create a simple modal for object selection
        const modalId = 'aiNoteRelatedObjectModal';
        const modalHTML = `
          <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true" data-bs-backdrop="false" data-bs-keyboard="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header modal-header-colored">
                  <h5 class="modal-title" id="${modalId}Label">בחר ${typeInfo.label}</h5>
                  <button type="button" data-button-type="CLOSE" data-bs-dismiss="modal" data-text="" title="סגור"></button>
                </div>
                <div class="modal-body">
                  <label for="aiNoteRelatedObjectSelect" class="form-label">${typeInfo.label}:</label>
                  <select id="aiNoteRelatedObjectSelect" class="form-select">
                    <option value="">טוען...</option>
                  </select>
                </div>
                <div class="modal-footer">
                  <button type="button" data-button-type="SECONDARY" data-variant="full" data-bs-dismiss="modal" data-text="ביטול"></button>
                  <button type="button" data-button-type="PRIMARY" data-variant="full" id="aiNoteRelatedObjectConfirm" data-text="אישור"></button>
                </div>
              </div>
            </div>
          </div>
        `;

        try {
          // Use window.createAndShowModal helper which integrates with ModalManagerV2
          await window.createAndShowModal(modalHTML, modalId, { backdrop: false, keyboard: true });

          const modalElement = document.getElementById(modalId);
          if (!modalElement) {
            resolve(null);
            return;
          }

          const confirmBtn = document.getElementById('aiNoteRelatedObjectConfirm');
          const select = document.getElementById('aiNoteRelatedObjectSelect');

          // Populate select using SelectPopulatorService
          try {
            if (relatedType === '1' && window.SelectPopulatorService?.populateAccountsSelect) {
              await window.SelectPopulatorService.populateAccountsSelect(select, {
                includeEmpty: true,
                emptyText: `בחר ${typeInfo.label}...`
              });
            } else if (relatedType === '2' && window.SelectPopulatorService?.populateTradesSelect) {
              await window.SelectPopulatorService.populateTradesSelect(select, {
                includeEmpty: true,
                emptyText: `בחר ${typeInfo.label}...`
              });
            } else if (relatedType === '3' && window.SelectPopulatorService?.populateTradePlansSelect) {
              await window.SelectPopulatorService.populateTradePlansSelect(select, {
                includeEmpty: true,
                emptyText: `בחר ${typeInfo.label}...`
              });
            } else if (relatedType === '4' && window.SelectPopulatorService?.populateTickersSelect) {
              await window.SelectPopulatorService.populateTickersSelect(select, {
                includeEmpty: true,
                emptyText: `בחר ${typeInfo.label}...`
              });
            } else {
              // Fallback: direct API call
              const response = await fetch(`/api/${typeInfo.endpoint}/`);
              if (response.ok) {
                const data = await response.json();
                const items = Array.isArray(data?.data) ? data.data : [];
                select.innerHTML = `<option value="">בחר ${typeInfo.label}...</option>`;
                items.forEach((item) => {
                  const option = document.createElement('option');
                  if (relatedType === '4') {
                    option.value = item.id;
                    option.textContent = item.symbol || `Ticker #${item.id}`;
                  } else {
                    option.value = item.id;
                    option.textContent = item.name || item.symbol || `${typeInfo.label} #${item.id}`;
                  }
                  select.appendChild(option);
                });
              }
            }
          } catch (error) {
            window.Logger?.warn('Error populating related object select', error, { page: 'ai-analysis' });
            select.innerHTML = `<option value="">שגיאה בטעינת ${typeInfo.label}</option>`;
          }

          // Helper function to hide and cleanup modal
          const hideAndCleanup = async () => {
            // Hide modal using ModalManagerV2 or Bootstrap
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
              await window.ModalManagerV2.hideModal(modalId);
            } else if (bootstrap?.Modal) {
              const bsModal = bootstrap.Modal.getInstance(modalElement);
              if (bsModal) {
                bsModal.hide();
              }
            }
            
            // Remove modal from DOM after animation
            setTimeout(() => {
              if (modalElement.parentNode) {
                modalElement.remove();
              }
            }, 300); // Bootstrap fade animation duration
          };

          const handleConfirm = async () => {
            const selectedValue = select.value;
            if (!selectedValue) {
              if (window.NotificationSystem) {
                window.NotificationSystem.showError('נא לבחור אובייקט', 'system');
              }
              return;
            }
            
            await hideAndCleanup();
            resolve(parseInt(selectedValue, 10));
          };

          const handleCancel = async () => {
            await hideAndCleanup();
            resolve(null);
          };

          confirmBtn.addEventListener('click', handleConfirm);
          modalElement.addEventListener('hidden.bs.modal', handleCancel);
        } catch (error) {
          window.Logger?.error('Error showing related object selector modal', error, { page: 'ai-analysis' });
          resolve(null);
        }
      });
    },

    /**
     * Convert markdown to HTML
     */
    async convertMarkdownToHTML(markdownText) {
      if (typeof marked !== 'undefined') {
        return marked.parse(markdownText);
      }

      // Basic fallback conversion
      return markdownText
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    },

    /**
     * Open notes modal with pre-filled content
     */
    async openNoteModal(content, relatedType, relatedId) {
      if (!window.NotesData || !window.ModalManagerV2) {
        // Fallback: save directly
        await window.AIAnalysisData?.saveAsNote(
          { response_text: content },
          relatedType,
          relatedId
        );
        return;
      }

      // Open modal with pre-filled data
      if (window.ModalManagerV2.showModal) {
        await window.ModalManagerV2.showModal('notesModal', 'add', {
          prefill: {
            noteContent: content,
            noteRelatedType: relatedType,
            noteRelatedObject: relatedId,
          },
        });
      }
    },
  };

  // Expose to global scope
  window.AINotesIntegration = AINotesIntegration;

  window.Logger?.info('✅ AI Notes Integration loaded', { page: 'ai-analysis' });
})();

