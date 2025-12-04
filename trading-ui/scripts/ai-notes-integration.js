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
      window.Logger?.info('AINotesIntegration.saveAsNote called', { 
        page: 'ai-analysis',
        hasAnalysisResult: !!analysisResult,
        hasResponseText: !!analysisResult?.response_text,
        analysisId: analysisResult?.id
      });
      
      if (!analysisResult || !analysisResult.response_text) {
        window.Logger?.warn('No analysis result or response_text to save', { 
          page: 'ai-analysis',
          hasAnalysisResult: !!analysisResult,
          hasResponseText: !!analysisResult?.response_text
        });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('אין תוצאות לשמירה', 'system');
        }
        return;
      }

      try {
        // Show selection modal for related type
        window.Logger?.info('Showing related type selector', { page: 'ai-analysis' });
        const relatedType = await this.showRelatedTypeSelector();
        if (!relatedType) {
          window.Logger?.info('User cancelled related type selection', { page: 'ai-analysis' });
          return; // User cancelled
        }
        
        window.Logger?.info('User selected related type', { 
          page: 'ai-analysis',
          relatedType
        });

        // Show selection modal for related object
        window.Logger?.info('Showing related object selector', { 
          page: 'ai-analysis',
          relatedType
        });
        const relatedId = await this.showRelatedObjectSelector(relatedType);
        if (!relatedId) {
          window.Logger?.info('User cancelled related object selection', { page: 'ai-analysis' });
          return; // User cancelled
        }
        
        window.Logger?.info('User selected related object', { 
          page: 'ai-analysis',
          relatedType,
          relatedId
        });

        // Convert markdown to HTML
        window.Logger?.info('Converting markdown to HTML', { 
          page: 'ai-analysis',
          responseTextLength: analysisResult.response_text?.length || 0
        });
        const htmlContent = await this.convertMarkdownToHTML(analysisResult.response_text);

        // Always open notes modal with pre-filled data (don't save directly)
        // This allows user to review and edit before saving
        window.Logger?.info('Opening notes modal with pre-filled data', { 
          page: 'ai-analysis',
          relatedType,
          relatedId,
          htmlContentLength: htmlContent?.length || 0
        });
        await this.openNoteModal(htmlContent, relatedType, relatedId);
        
        window.Logger?.info('Notes modal opened successfully', { page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('Error saving analysis as note', error, { 
          page: 'ai-analysis',
          analysisId: analysisResult?.id,
          errorMessage: error?.message,
          errorStack: error?.stack
        });
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
          window.Logger?.info('Opening related type selector modal', { page: 'ai-analysis' });
          
          // Use window.createAndShowModal helper which integrates with ModalManagerV2
          await window.createAndShowModal(modalHTML, modalId, { backdrop: false, keyboard: true });

          const modalElement = document.getElementById(modalId);
          if (!modalElement) {
            window.Logger?.warn('Related type selector modal element not found', { page: 'ai-analysis' });
            resolve(null);
            return;
          }

          // Wait for Button System to process buttons (they may get new IDs)
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find confirm button - may have dynamic ID from Button System
          // Try multiple strategies to find the button
          let confirmBtn = document.getElementById('aiNoteRelatedTypeConfirm');
          if (!confirmBtn) {
            // Try to find by data attribute or button type
            confirmBtn = modalElement.querySelector('button[data-button-type="PRIMARY"]');
          }
          if (!confirmBtn) {
            // Try to find by text content
            const allButtons = modalElement.querySelectorAll('button');
            confirmBtn = Array.from(allButtons).find(btn => btn.textContent?.trim() === 'אישור');
          }
          
          const select = document.getElementById('aiNoteRelatedTypeSelect');

          if (!confirmBtn) {
            window.Logger?.error('Confirm button not found in related type selector modal', { page: 'ai-analysis' });
            resolve(null);
            return;
          }
          
          if (!select) {
            window.Logger?.error('Select element not found in related type selector modal', { page: 'ai-analysis' });
            resolve(null);
            return;
          }

          window.Logger?.info('Found elements in related type selector modal', { 
            page: 'ai-analysis',
            confirmBtnId: confirmBtn.id,
            selectId: select.id
          });

          // Helper function to hide and cleanup modal
          const hideAndCleanup = async () => {
            window.Logger?.info('Hiding and cleaning up related type selector modal', { page: 'ai-analysis' });
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
            window.Logger?.info('User confirmed related type selection', { 
              page: 'ai-analysis',
              selectedValue
            });
            if (!selectedValue) {
              if (window.NotificationSystem) {
                window.NotificationSystem.showError('נא לבחור סוג אובייקט', 'system');
              }
              return;
            }
            await hideAndCleanup();
            resolve(selectedValue || null);
          };

          const handleCancel = async () => {
            window.Logger?.info('User cancelled related type selection', { page: 'ai-analysis' });
            await hideAndCleanup();
            resolve(null);
          };

          // Remove old listeners by cloning (if button was already processed)
          const newConfirmBtn = confirmBtn.cloneNode(true);
          confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
          
          newConfirmBtn.addEventListener('click', handleConfirm);
          modalElement.addEventListener('hidden.bs.modal', handleCancel);
          
          window.Logger?.info('Event listeners attached to related type selector modal', { 
            page: 'ai-analysis',
            confirmBtnId: newConfirmBtn.id
          });
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
          window.Logger?.info('Opening related object selector modal', { 
            page: 'ai-analysis',
            relatedType,
            typeLabel: typeInfo.label
          });
          
          // Use window.createAndShowModal helper which integrates with ModalManagerV2
          await window.createAndShowModal(modalHTML, modalId, { backdrop: false, keyboard: true });

          const modalElement = document.getElementById(modalId);
          if (!modalElement) {
            window.Logger?.warn('Related object selector modal element not found', { page: 'ai-analysis' });
            resolve(null);
            return;
          }

          // Wait for Button System to process buttons and SelectPopulatorService to populate select
          await new Promise(resolve => setTimeout(resolve, 700));
          
          // Find confirm button - may have dynamic ID from Button System
          // Try multiple strategies to find the button
          let confirmBtn = document.getElementById('aiNoteRelatedObjectConfirm');
          if (!confirmBtn) {
            // Try to find by button type (Button System may have replaced it)
            const primaryButtons = modalElement.querySelectorAll('button[data-button-type="PRIMARY"]');
            // Get the last PRIMARY button (should be the confirm button)
            if (primaryButtons.length > 0) {
              confirmBtn = primaryButtons[primaryButtons.length - 1];
            }
          }
          if (!confirmBtn) {
            // Try to find by text content
            const allButtons = modalElement.querySelectorAll('button');
            confirmBtn = Array.from(allButtons).find(btn => btn.textContent?.trim() === 'אישור');
          }
          
          const select = document.getElementById('aiNoteRelatedObjectSelect');
          
          if (!confirmBtn) {
            window.Logger?.error('Confirm button not found in related object selector modal', { page: 'ai-analysis' });
            resolve(null);
            return;
          }
          
          if (!select) {
            window.Logger?.error('Select element not found in related object selector modal', { page: 'ai-analysis' });
            resolve(null);
            return;
          }
          
          window.Logger?.info('Found elements in related object selector modal', { 
            page: 'ai-analysis',
            confirmBtnId: confirmBtn.id,
            selectId: select.id,
            selectOptionsCount: select.options.length
          });

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
                select.textContent = '';
                const option = document.createElement('option');
                option.value = '';
                option.textContent = `בחר ${typeInfo.label}...`;
                select.appendChild(option);
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
            select.textContent = '';
            const option = document.createElement('option');
            option.value = '';
            option.textContent = `שגיאה בטעינת ${typeInfo.label}`;
            select.appendChild(option);
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
            window.Logger?.info('User confirmed related object selection', { 
              page: 'ai-analysis',
              selectedValue,
              relatedType
            });
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
            window.Logger?.info('User cancelled related object selection', { page: 'ai-analysis' });
            await hideAndCleanup();
            resolve(null);
          };

          // Remove old listeners by cloning (if button was already processed)
          const newConfirmBtn = confirmBtn.cloneNode(true);
          confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
          
          newConfirmBtn.addEventListener('click', handleConfirm);
          modalElement.addEventListener('hidden.bs.modal', handleCancel);
          
          window.Logger?.info('Event listeners attached to related object selector modal', { 
            page: 'ai-analysis',
            confirmBtnId: newConfirmBtn.id
          });
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
      if (!window.ModalManagerV2) {
        window.Logger?.warn('ModalManagerV2 not available for opening notes modal', { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('לא ניתן לפתוח מודול הערות', 'system');
        }
        return;
      }

      window.Logger?.info('Opening notes modal with pre-filled data', {
        page: 'ai-analysis',
        relatedType,
        relatedId,
        hasContent: !!content
      });

      // Open modal with pre-filled data using ModalManagerV2
      // ModalManagerV2 will handle prefill automatically via populateForm
      try {
        window.Logger?.info('Opening notes modal with prefill data', {
          page: 'ai-analysis',
          relatedType,
          relatedId,
          hasContent: !!content,
          contentLength: content?.length || 0
        });
        
        await window.ModalManagerV2.showModal('notesModal', 'add', null, {
          prefill: {
            noteContent: content,
            noteRelatedType: relatedType,
            noteRelatedObject: relatedId,
          },
        });
        
        window.Logger?.info('Notes modal opened successfully', { page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('Error opening notes modal', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בפתיחת מודול הערות', 'system');
        }
      }
    },
  };

  // Expose to global scope
  window.AINotesIntegration = AINotesIntegration;

  window.Logger?.info('✅ AI Notes Integration loaded', { page: 'ai-analysis' });
})();

