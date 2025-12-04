/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 24
 * 
 * PAGE INITIALIZATION (1)
 * - init() - Initialize AI Analysis Manager, load templates, settings, and history
 * 
 * UI UPDATES (4)
 * - updateProviderSelectModal() - Update provider select dropdown in modal with LLM settings
 * - updateProviderSelect() - Update provider select dropdown on page with LLM settings
 * - renderHistory() - Render analysis history list in container
 * - renderResultsModal() - Render analysis results in modal container
 * 
 * EVENT HANDLING (4)
 * - setupFormHandler() - Setup event handlers for analysis form submission
 * - handleTemplateSelection() - Handle template selection (legacy - redirects to modal flow)
 * - handleTemplateSelectionFromModal() - Handle template selection from modal
 * - handleGenerateAnalysis() - Handle analysis generation from form data
 * 
 * MODAL MANAGEMENT (2)
 * - openTemplateSelectionModal() - Open modal for template selection
 * - openVariablesModal() - Open modal for variables input
 * - openResultsModal() - Open modal to display analysis results
 * 
 * DATA LOADING (3)
 * - getTradingMethods() - Get list of trading methods for dropdown
 * - getTickers() - Get list of tickers for dropdown
 * - getTradePlanReasons() - Get unique reasons from user's trade plans
 * 
 * DATA MANIPULATION (3)
 * - renderVariablesFormModal() - Render variables form in modal based on template
 * - renderVariablesForm() - Render variables form on page (legacy)
 * - viewHistoryItem() - View and load full analysis from history item
 * 
 * VALIDATION (1)
 * - checkLLMProvidersConfigured() - Check if LLM providers are configured and show warning
 * 
 * UTILITIES (4)
 * - populateTradingMethodsSelect() - Populate trading methods select dropdown
 * - populateTickersSelect() - Populate tickers select dropdown
 * - renderResults() - Render analysis results using AIResultRenderer
 * - setLoadingState() - Set loading state for buttons using CSS classes
 * 
 * EXPORT & INTEGRATION (3)
 * - saveAsNote() - Save current analysis as note
 * - exportToPDF() - Export current analysis to PDF
 * - exportToMarkdown() - Export current analysis to Markdown
 * - exportToHTML() - Export current analysis to HTML
 * 
 * ==========================================
 */
/**
 * AI Analysis Manager
 * ======================================
 * Main UI manager for AI Analysis page
 *
 * Responsibilities:
 * - Coordinate between components
 * - Handle user interactions
 * - Manage page state
 * - Integrate with all systems
 *
 * @version 1.0.0
 * @created January 28, 2025
 * @author TikTrack Development Team
 */
(function() {
  'use strict';

  const AIAnalysisManager = {
    version: '1.0.0',
    initialized: false,
    selectedTemplate: null,
    currentAnalysis: null,
    pendingResult: null, // Store result to show after history reload
    templates: [],
    history: [],
    llmProviderSettings: null,

    /**
     * Initialize AI Analysis Manager
     */
    async init() {
      if (this.initialized) {
        window.Logger?.warn('AIAnalysisManager already initialized', { page: 'ai-analysis' });
        return;
      }

      try {
        window.Logger?.info('🚀 Initializing AI Analysis Manager...', { page: 'ai-analysis' });

        // Load templates
        this.templates = await window.AIAnalysisData?.loadTemplates() || [];
        if (window.AITemplateSelector) {
          // Render templates in both page and modal
          await window.AITemplateSelector.render(this.templates);
          if (typeof window.AITemplateSelector.renderModal === 'function') {
            await window.AITemplateSelector.renderModal(this.templates);
          }
        }

        // Load LLM provider settings
        try {
          this.llmProviderSettings = await window.AIAnalysisData?.getLLMProviderSettings();
          if (this.llmProviderSettings) {
            this.updateProviderSelect();
            this.updateProviderSelectModal();
          }
        } catch (error) {
          window.Logger?.warn('Could not load LLM provider settings', { page: 'ai-analysis', error });
        }

        // Load history
        try {
          this.history = await window.AIAnalysisData?.loadHistory() || [];
          // Check availability for all items (cache + notes) before rendering
          await this.checkAvailabilityForAll();
          this.renderHistory();
          
          // Update summary stats after checking availability
          if (window.updatePageSummaryStats && this.history) {
            window.updatePageSummaryStats('ai-analysis', this.history);
          }
        } catch (error) {
          window.Logger?.warn('Could not load history', { page: 'ai-analysis', error });
        }

        // Setup form handler
        this.setupFormHandler();

        // Setup Page Visibility API listener to close modals when page returns from sleep/hidden
        this.setupPageVisibilityListener();

        this.initialized = true;
        window.Logger?.info('✅ AI Analysis Manager initialized successfully', { page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('❌ Error initializing AI Analysis Manager', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה באתחול מערכת ניתוח AI', 'system');
        }
      }
    },

    /**
     * Update provider select with settings (modal version)
     */
    updateProviderSelectModal() {
      const providerSelect = document.getElementById('llmProviderModal');
      if (!providerSelect || !this.llmProviderSettings) return;

      // Set default provider
      if (this.llmProviderSettings.default_provider) {
        providerSelect.value = this.llmProviderSettings.default_provider;
      }

      // Disable providers that are not configured
      const options = providerSelect.querySelectorAll('option');
      options.forEach((option) => {
        if (option.value === 'gemini' && !this.llmProviderSettings.gemini_configured) {
          option.disabled = true;
          option.textContent += ' (לא מוגדר)';
        }
        if (option.value === 'perplexity' && !this.llmProviderSettings.perplexity_configured) {
          option.disabled = true;
          option.textContent += ' (לא מוגדר)';
        }
      });
    },

    /**
     * Update provider select with settings (page version - legacy)
     */
    updateProviderSelect() {
      const providerSelect = document.getElementById('llmProvider');
      if (!providerSelect || !this.llmProviderSettings) return;

      // Set default provider
      if (this.llmProviderSettings.default_provider) {
        providerSelect.value = this.llmProviderSettings.default_provider;
      }

      // Disable providers that are not configured
      const options = providerSelect.querySelectorAll('option');
      options.forEach((option) => {
        if (option.value === 'gemini' && !this.llmProviderSettings.gemini_configured) {
          option.disabled = true;
          option.textContent += ' (לא מוגדר)';
        }
        if (option.value === 'perplexity' && !this.llmProviderSettings.perplexity_configured) {
          option.disabled = true;
          option.textContent += ' (לא מוגדר)';
        }
      });
    },

    /**
     * Setup form handler
     */
    setupFormHandler() {
      // Setup handler for modal form
      const formModal = document.getElementById('aiAnalysisFormModal');
      if (formModal) {
        // Remove any existing event listeners by removing and re-adding
        const formClone = formModal.cloneNode(true);
        formModal.parentNode.replaceChild(formClone, formModal);
        
        // Add submit handler to form
        formClone.addEventListener('submit', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.Logger?.info('📝 Form submit event triggered', { page: 'ai-analysis' });
          await this.handleGenerateAnalysis();
        });
        
        // Also add click handler directly to button as backup
        // Try multiple ways to find the button (Button System may replace it with dynamic ID):
        // 1. By ID (if exists)
        let btn = document.getElementById('generateAnalysisBtnModal');
        
        // 2. By text content (if Button System created it dynamically)
        if (!btn) {
          const buttons = formClone.querySelectorAll('button[type="submit"]');
          btn = Array.from(buttons).find(b => 
            b.textContent?.includes('צור ניתוח') || 
            b.textContent?.includes('יוצר ניתוח') ||
            b.querySelector('span')?.textContent?.includes('צור ניתוח')
          );
        }
        
        // 3. By data attribute (if Button System added it)
        if (!btn) {
          btn = formClone.querySelector('button[data-text*="צור ניתוח"]');
        }
        
        if (btn) {
          // Set ID for future reference if missing
          if (!btn.id) {
            btn.id = 'generateAnalysisBtnModal';
          }
          
          // Find or create text and spinner elements
          let btnText = document.getElementById('generateAnalysisBtnTextModal');
          let btnSpinner = document.getElementById('generateAnalysisBtnSpinnerModal');
          
          if (!btnText) {
            // Try to find existing text span
            btnText = btn.querySelector('span.btn-text') || btn.querySelector('span[id*="Text"]');
            if (btnText && !btnText.id) {
              btnText.id = 'generateAnalysisBtnTextModal';
            }
          }
          
          if (!btnSpinner) {
            // Try to find existing spinner span
            btnSpinner = btn.querySelector('span.hide') || btn.querySelector('span[id*="Spinner"]');
            if (btnSpinner && !btnSpinner.id) {
              btnSpinner.id = 'generateAnalysisBtnSpinnerModal';
            }
          }
          
          // Remove old listener by cloning button
          const btnClone = btn.cloneNode(true);
          btn.parentNode.replaceChild(btnClone, btn);
          
          // Update references after clone
          btn = document.getElementById('generateAnalysisBtnModal');
          btnText = document.getElementById('generateAnalysisBtnTextModal');
          btnSpinner = document.getElementById('generateAnalysisBtnSpinnerModal');
          
          btnClone.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.Logger?.info('🖱️ Button click event triggered', { page: 'ai-analysis' });
            await this.handleGenerateAnalysis();
          });
          
          window.Logger?.info('✅ Form handler setup complete', { 
            page: 'ai-analysis',
            buttonId: btnClone.id,
            hasText: !!btnText,
            hasSpinner: !!btnSpinner
          });
        } else {
          window.Logger?.warn('⚠️ Generate analysis button not found in DOM', { page: 'ai-analysis' });
        }
      } else {
        window.Logger?.warn('⚠️ aiAnalysisFormModal not found in DOM', { page: 'ai-analysis' });
      }

      // Setup handler for page form (legacy - kept for compatibility)
      const form = document.getElementById('aiAnalysisForm');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await this.handleGenerateAnalysis();
        });
      }
    },

    /**
     * Open template selection modal (without template ID - opens modal first)
     */
    async openTemplateSelectionModal() {
      try {
        // Show template selection modal
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          await window.ModalManagerV2.showModal('aiTemplateSelectionModal', 'view');
        } else if (window.bootstrap && window.bootstrap.Modal) {
          const modalElement = document.getElementById('aiTemplateSelectionModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement, { backdrop: false, keyboard: true });
            modal.show();
          }
        }

        window.Logger?.info('Template selection modal opened', { page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('Error opening template selection modal', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בפתיחת מודול בחירת תבנית', 'system');
        }
      }
    },

    /**
     * Handle template selection from modal
     */
    async handleTemplateSelectionFromModal(templateId) {
      try {
        // Ensure we're using the correct context (AIAnalysisManager)
        const manager = window.AIAnalysisManager || this;
        
        // Ensure we have access to templates
        if (!manager.templates || manager.templates.length === 0) {
          window.Logger?.warn('Templates not loaded yet, loading now...', { page: 'ai-analysis' });
          manager.templates = await window.AIAnalysisData?.loadTemplates() || [];
        }

        // Convert templateId to number for comparison
        const id = typeof templateId === 'string' ? parseInt(templateId, 10) : templateId;
        manager.selectedTemplate = manager.templates.find((t) => t.id === id);
        if (!manager.selectedTemplate) {
          window.Logger?.warn('Template not found', { page: 'ai-analysis', templateId, id, availableIds: manager.templates.map(t => t.id) });
          throw new Error('Template not found');
        }

        // Close template selection modal
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
          window.ModalManagerV2.hideModal('aiTemplateSelectionModal');
        } else if (bootstrap?.Modal) {
        const templateModal = bootstrap.Modal.getInstance(document.getElementById('aiTemplateSelectionModal'));
        if (templateModal) {
          templateModal.hide();
          }
        }

        // Open variables modal
        await manager.openVariablesModal();

        window.Logger?.info('Template selected, opening variables modal', { page: 'ai-analysis', templateId });
      } catch (error) {
        window.Logger?.error('Error selecting template', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בבחירת תבנית', 'system');
        }
      }
    },

    /**
     * Open variables modal
     */
    async openVariablesModal() {
      try {
        if (!this.selectedTemplate) {
          throw new Error('No template selected');
        }

        // Check if any LLM providers are configured
        await this.checkLLMProvidersConfigured();

        const manager = window.AIAnalysisManager || this;
        const template = this.selectedTemplate;

        // Show modal using ModalManagerV2 if available, otherwise Bootstrap
        // IMPORTANT: Render form AFTER modal is shown to ensure proper data flow through ModalManagerV2
        let modalShown = false;
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          try {
            // Open modal first - ModalManagerV2 will handle nested modal detection and z-index
            await window.ModalManagerV2.showModal('aiVariablesModal', 'view', null, {
              template: template // Pass template data through options for later use
            });
            
            // After modal is shown, render the form
            // Use shown.bs.modal event to ensure modal is fully visible and DOM is ready
            const modalElement = document.getElementById('aiVariablesModal');
            if (modalElement) {
              const renderFormAfterShow = async () => {
                window.Logger?.info('Modal shown via ModalManagerV2, rendering variables form', { page: 'ai-analysis' });
                
                // Render variables form in modal (now that modal is open and DOM is ready)
                await manager.renderVariablesFormModal(template);

        // Update provider select
        if (typeof manager.updateProviderSelectModal === 'function') {
          manager.updateProviderSelectModal();
        } else if (typeof manager.updateProviderSelect === 'function') {
          manager.updateProviderSelect();
        }

                // Populate tickers after form is rendered (if needed)
                const tickerSelect = document.querySelector('#aiVariablesModal select[data-needs-ticker-population="true"]');
                if (tickerSelect && window.SelectPopulatorService) {
                  try {
                    window.Logger?.info('🔄 Populating tickers after modal shown', { 
                      page: 'ai-analysis', 
                      selectId: tickerSelect.id 
                    });
                    
                    await window.SelectPopulatorService.populateTickersSelect(tickerSelect, {
                      includeEmpty: true,
                      emptyText: 'בחר טיקר...'
                    });
                    
                    // Add "אחר" option after tickers
                    const otherOption = document.createElement('option');
                    otherOption.value = '__other__';
                    otherOption.textContent = 'אחר';
                    tickerSelect.appendChild(otherOption);
                    
                    tickerSelect.removeAttribute('data-needs-ticker-population');
                    
                    window.Logger?.info('✅ Tickers populated after modal shown', { 
                      page: 'ai-analysis', 
                      selectId: tickerSelect.id,
                      optionsCount: tickerSelect.options.length 
                    });
                  } catch (error) {
                    window.Logger?.warn('Error populating tickers after modal shown', error, { page: 'ai-analysis' });
                  }
                }
                
                // Setup form handler after form is rendered
                if (typeof manager.setupFormHandler === 'function') {
                  setTimeout(() => {
                    manager.setupFormHandler();
                    window.Logger?.debug('Form handler setup after modal shown', { page: 'ai-analysis' });
                  }, 100);
                }
              };
              
              // Listen for modal shown event (Bootstrap event)
              modalElement.addEventListener('shown.bs.modal', renderFormAfterShow, { once: true });
              
              // If modal is already shown, call immediately
              if (modalElement.classList.contains('show')) {
                setTimeout(renderFormAfterShow, 50);
              }
            }
            
            modalShown = true;
          } catch (error) {
            window.Logger?.warn('ModalManagerV2.showModal failed, trying Bootstrap fallback', { page: 'ai-analysis', error });
          }
        }
        
        if (!modalShown) {
            // Fallback: Render form first, then open modal
            await manager.renderVariablesFormModal(template);

            // Update provider select
            if (typeof manager.updateProviderSelectModal === 'function') {
              manager.updateProviderSelectModal();
            } else if (typeof manager.updateProviderSelect === 'function') {
              manager.updateProviderSelect();
            }
            
            // Populate tickers after form is rendered (if needed)
            const tickerSelect = document.querySelector('#aiVariablesModal select[data-needs-ticker-population="true"]');
            if (tickerSelect && window.SelectPopulatorService) {
              try {
                window.Logger?.info('🔄 Populating tickers (fallback)', { 
                  page: 'ai-analysis', 
                  selectId: tickerSelect.id 
                });
                
                await window.SelectPopulatorService.populateTickersSelect(tickerSelect, {
                  includeEmpty: true,
                  emptyText: 'בחר טיקר...'
                });
                
                // Add "אחר" option after tickers
                const otherOption = document.createElement('option');
                otherOption.value = '__other__';
                otherOption.textContent = 'אחר';
                tickerSelect.appendChild(otherOption);
                
                tickerSelect.removeAttribute('data-needs-ticker-population');
                
                window.Logger?.info('✅ Tickers populated (fallback)', { 
                  page: 'ai-analysis', 
                  selectId: tickerSelect.id,
                  optionsCount: tickerSelect.options.length 
                });
              } catch (error) {
                window.Logger?.warn('Error populating tickers (fallback)', error, { page: 'ai-analysis' });
              }
            }
            
            // Setup form handler
            if (typeof manager.setupFormHandler === 'function') {
              manager.setupFormHandler();
            }

          // Fallback to Bootstrap Modal
          const modalElement = document.getElementById('aiVariablesModal');
          if (!modalElement) {
            throw new Error('Variables modal element not found');
          }

          // Use Bootstrap Modal directly for unregistered modals
          if (window.bootstrap && window.bootstrap.Modal) {
            window.Logger?.debug('Opening variables modal via Bootstrap', { page: 'ai-analysis' });
            const modal = new bootstrap.Modal(modalElement, { backdrop: false, keyboard: true });
            modal.show();
            
            // Setup form handler again after modal is shown
            setTimeout(() => {
              if (typeof manager.setupFormHandler === 'function') {
                manager.setupFormHandler();
                window.Logger?.debug('Form handler setup after modal shown', { page: 'ai-analysis' });
              }
            }, 200);
          } else {
            throw new Error('Bootstrap Modal not available');
          }
        }

        window.Logger?.info('Variables modal opened', { page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('Error opening variables modal', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בפתיחת מודול משתנים', 'system');
        }
      }
    },

    /**
     * Check if LLM providers are configured and show warning if not
     */
    async checkLLMProvidersConfigured() {
      try {
        if (!this.llmProviderSettings) {
          // Load settings if not already loaded
          this.llmProviderSettings = await window.AIAnalysisData?.getLLMProviderSettings() || null;
        }

        const hasConfiguredProvider = this.llmProviderSettings && (
          this.llmProviderSettings.gemini_configured || 
          this.llmProviderSettings.perplexity_configured
        );

        if (!hasConfiguredProvider) {
          // Show warning in modal
          const modalBody = document.querySelector('#aiVariablesModal .modal-body');
          if (modalBody) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'alert alert-warning alert-dismissible fade show';
            warningDiv.setAttribute('role', 'alert');
            const strong = document.createElement('strong');
            strong.textContent = '⚠️ אין מנוע AI מוגדר';
            warningDiv.appendChild(strong);
            const p1 = document.createElement('p');
            p1.textContent = 'על מנת להשתמש במערכת ניתוח AI, יש להגדיר מפתח API למנוע AI בפרופיל המשתמש.';
            warningDiv.appendChild(p1);
            const p2 = document.createElement('p');
            const strong2 = document.createElement('strong');
            strong2.textContent = 'איך להגדיר:';
            p2.appendChild(strong2);
            warningDiv.appendChild(p2);
            // Create ordered list
            const ol = document.createElement('ol');
            const li1 = document.createElement('li');
            const a1 = document.createElement('a');
            a1.href = '/user-profile#ai-analysis';
            a1.target = '_blank';
            a1.className = 'alert-link';
            const strong3 = document.createElement('strong');
            strong3.textContent = 'פרופיל משתמש → הגדרות AI Analysis';
            a1.appendChild(strong3);
            li1.appendChild(document.createTextNode('עבור לעמוד '));
            li1.appendChild(a1);
            ol.appendChild(li1);
            const li2 = document.createElement('li');
            li2.textContent = 'גלול לסקשן "הגדרות AI Analysis" (או לחץ על הקישור למעלה)';
            ol.appendChild(li2);
            const li3 = document.createElement('li');
            li3.textContent = 'הגדר מפתח API למנוע AI (Gemini או Perplexity)';
            ol.appendChild(li3);
            const li4 = document.createElement('li');
            li4.textContent = 'לחץ על "בדוק מפתח" כדי לוודא שהמפתח תקין';
            ol.appendChild(li4);
            const li5 = document.createElement('li');
            li5.textContent = 'לחץ על "שמור הגדרות"';
            ol.appendChild(li5);
            warningDiv.appendChild(ol);
            // Create "איך להשיג מפתח API" paragraph
            const p3 = document.createElement('p');
            const strong4 = document.createElement('strong');
            strong4.textContent = 'איך להשיג מפתח API:';
            p3.appendChild(strong4);
            warningDiv.appendChild(p3);
            // Create unordered list
            const ul = document.createElement('ul');
            const li6 = document.createElement('li');
            const strong5 = document.createElement('strong');
            strong5.textContent = 'Gemini:';
            li6.appendChild(strong5);
            li6.appendChild(document.createTextNode(' עבור ל-'));
            const a2 = document.createElement('a');
            a2.href = 'https://aistudio.google.com/';
            a2.target = '_blank';
            a2.className = 'alert-link';
            a2.textContent = 'Google AI Studio';
            li6.appendChild(a2);
            li6.appendChild(document.createTextNode(' ולחץ על "Get API Key"'));
            ul.appendChild(li6);
            const li7 = document.createElement('li');
            const strong6 = document.createElement('strong');
            strong6.textContent = 'Perplexity:';
            li7.appendChild(strong6);
            li7.appendChild(document.createTextNode(' עבור ל-'));
            const a3 = document.createElement('a');
            a3.href = 'https://www.perplexity.ai/api';
            a3.target = '_blank';
            a3.className = 'alert-link';
            a3.textContent = 'Perplexity API';
            li7.appendChild(a3);
            li7.appendChild(document.createTextNode(' ולחץ על "Create API Key"'));
            ul.appendChild(li7);
            warningDiv.appendChild(ul);
            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'btn-close';
            closeBtn.setAttribute('data-bs-dismiss', 'alert');
            closeBtn.setAttribute('aria-label', 'Close');
            warningDiv.appendChild(closeBtn);
            modalBody.insertBefore(warningDiv, modalBody.firstChild);
          }
        }
      } catch (error) {
        window.Logger?.warn('Error checking LLM providers configuration', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Handle template selection (legacy - kept for compatibility)
     */
    async handleTemplateSelection(templateId) {
      // Redirect to new modal flow
      await this.handleTemplateSelectionFromModal(templateId);
    },

    /**
     * Render variables form in modal
     * כל משתנה יוצג כ-dropdown עם אופציות + "אחר"
     */
    async renderVariablesFormModal(template) {
      const container = document.getElementById('variablesContainerModal');
      if (!container) {
        window.Logger?.warn('Variables container modal not found', { page: 'ai-analysis' });
        return;
      }

      // Clear existing content (but keep warning if exists)
      const warningDiv = container.querySelector('.alert-warning');
      // Remove all children except warningDiv
      const children = Array.from(container.children);
      children.forEach(child => {
        if (child !== warningDiv) {
          container.removeChild(child);
        }
      });
      // Clear text content if any
      container.textContent = '';
      if (warningDiv) {
        container.appendChild(warningDiv);
      }

      try {
        const variables = template.variables_json?.variables || [];
        
        for (const variable of variables) {
          // Skip response_language - it's handled by static HTML element
          if (variable.key === 'response_language') {
            continue;
          }
          
          const col = document.createElement('div');
          col.className = 'col-md-4 mb-3';

          const label = document.createElement('label');
          label.className = 'form-label';
          label.textContent = variable.label || variable.key;
          label.setAttribute('for', `var_modal_${variable.key}`);

          // Always create a select dropdown with "אחר" option
          const select = document.createElement('select');
          select.className = 'form-select';
          select.id = `var_modal_${variable.key}`;
          select.name = variable.key;
          
          // Add empty option (only if not using tickers - tickers will add their own)
          const isTickerField = (variable.key === 'ticker_symbol' || variable.key === 'stock_ticker') &&
                                window.SelectPopulatorService && 
                                typeof window.SelectPopulatorService.populateTickersSelect === 'function';
          
          if (!isTickerField) {
          const emptyOption = document.createElement('option');
          emptyOption.value = '';
          emptyOption.textContent = 'בחר...';
          select.appendChild(emptyOption);
          }

          // Populate options based on variable type and key
          let options = [];
          
          if (variable.key === 'investment_type' && window.VALID_INVESTMENT_TYPES) {
            // Use Investment Types from system
            options = window.VALID_INVESTMENT_TYPES.map(type => ({
              value: type,
              label: window.INVESTMENT_TYPE_LABELS?.[type] || type
            }));
          } else if (variable.key === 'technical_indicators' || variable.key === 'condition_focus') {
            // Use Trading Methods from system
            if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTradingMethodsSelect === 'function') {
              // Get trading methods
              const tradingMethods = await this.getTradingMethods();
              options = tradingMethods.map(method => ({
                value: method.name || method,
                label: method.name || method
              }));
            }
          } else if (variable.key === 'ticker_symbol' || variable.key === 'stock_ticker') {
            // Use Tickers from system - populate directly using SelectPopulatorService
            if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function') {
              // We'll populate the select after it's created
              // For now, just mark it for later population
              select.setAttribute('data-populate-tickers', 'true');
            } else {
              // Fallback: get tickers manually
              const tickers = await this.getTickers();
              options = tickers.map(ticker => ({
                value: ticker.symbol || ticker.symbol || ticker,
                label: ticker.symbol || ticker.name || ticker
              }));
            }
          } else if (variable.key === 'investment_thesis' && variable.integration === 'reasons') {
            // Use Reasons from Trade Plans - get unique reasons from user's trade plans
            const reasons = await this.getTradePlanReasons();
            options = reasons.map(reason => ({
              value: reason,
              label: reason
            }));
          } else if (variable.options && Array.isArray(variable.options)) {
            // Use provided options
            options = variable.options.map(option => ({
              value: typeof option === 'string' ? option : option.value,
              label: typeof option === 'string' ? option : option.label || option.value
            }));
          } else if (variable.type === 'select' && variable.options) {
            // Already handled above
          }

          // Add all options to select (only if not using tickers integration)
          if (select.getAttribute('data-populate-tickers') !== 'true') {
            options.forEach(option => {
              const optionEl = document.createElement('option');
              optionEl.value = option.value;
              optionEl.textContent = option.label;
              select.appendChild(optionEl);
            });

            // Always add "אחר" option
            const otherOption = document.createElement('option');
            otherOption.value = '__other__';
            otherOption.textContent = 'אחר';
            select.appendChild(otherOption);
          }

          // Create hidden text/textarea input for "אחר" value
          let otherInput;
          if (variable.type === 'textarea') {
            otherInput = document.createElement('textarea');
            otherInput.rows = variable.rows || 3;
          } else {
            otherInput = document.createElement('input');
            otherInput.type = variable.type === 'number' ? 'number' : 'text';
          }
          otherInput.className = 'form-control mt-2 other-input';
          otherInput.id = `var_modal_${variable.key}_other`;
          otherInput.name = `${variable.key}_other`;
          if (variable.placeholder) {
            otherInput.placeholder = variable.placeholder;
          }

          // Handle "אחר" selection - Use CSS classes instead of inline styles
          select.addEventListener('change', () => {
            const otherInputEl = document.getElementById(`var_modal_${variable.key}_other`);
            if (select.value === '__other__') {
              otherInputEl.classList.add('show');
              otherInputEl.required = variable.required || false;
            } else {
              otherInputEl.classList.remove('show');
              otherInputEl.value = '';
              otherInputEl.required = false;
            }
          });

          // Set default value if provided
          if (variable.default_value) {
            select.value = variable.default_value;
          }

          if (variable.required) {
            select.required = true;
          }

          col.appendChild(label);
          col.appendChild(select);
          col.appendChild(otherInput);
          container.appendChild(col);

          // Populate tickers select if needed (after element is in DOM)
          // Store reference for later population after modal is shown
          if (select.getAttribute('data-populate-tickers') === 'true') {
            // Mark for population - will be populated after modal is shown
            select.setAttribute('data-needs-ticker-population', 'true');
            
            // Also try immediate population as fallback (in case modal is already shown)
            setTimeout(async () => {
              try {
                // Wait for SelectPopulatorService to be available
                let retries = 0;
                while (!window.SelectPopulatorService && retries < 10) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  retries++;
                }
                
                if (!window.SelectPopulatorService) {
                  window.Logger?.warn('SelectPopulatorService not available for immediate ticker population', { page: 'ai-analysis' });
                  return;
                }
                
                // Check if select still exists and needs population
                const selectEl = document.getElementById(select.id);
                if (!selectEl || selectEl.getAttribute('data-needs-ticker-population') !== 'true') {
                  return; // Already populated or removed
                }
                
                // Populate tickers - includeEmpty: true so it adds "בחר..." option
                window.Logger?.info('🔄 Starting ticker population (immediate)', { 
                  page: 'ai-analysis', 
                  selectId: select.id 
                });
                
                await window.SelectPopulatorService.populateTickersSelect(selectEl, {
                  includeEmpty: true, // Add empty option "בחר טיקר..."
                  emptyText: 'בחר טיקר...'
                });
                
                // Verify tickers were loaded
                const tickerOptionsCount = selectEl.options.length;
                window.Logger?.info('✅ Tickers populated (immediate)', { 
                  page: 'ai-analysis', 
                  selectId: selectEl.id,
                  tickerOptionsCount 
                });
                
                if (tickerOptionsCount > 1) {
                  // Mark as populated
                  selectEl.removeAttribute('data-needs-ticker-population');
                
                // After tickers are populated, add "אחר" option at the end
                const otherOption = document.createElement('option');
                otherOption.value = '__other__';
                otherOption.textContent = 'אחר';
                  selectEl.appendChild(otherOption);
                  
                  window.Logger?.info('✅ Added "אחר" option after tickers', { 
                    page: 'ai-analysis', 
                    selectId: selectEl.id,
                    totalOptions: selectEl.options.length,
                    tickerOptionsCount 
                  });
                } else {
                  window.Logger?.warn('⚠️ No tickers loaded - only empty option found', { 
                    page: 'ai-analysis', 
                    selectId: selectEl.id 
                  });
                }
              } catch (error) {
                window.Logger?.warn('Error populating tickers (immediate)', error, { page: 'ai-analysis' });
                // Add "אחר" even if population failed
                const selectEl = document.getElementById(select.id);
                if (selectEl) {
                const otherOption = document.createElement('option');
                otherOption.value = '__other__';
                otherOption.textContent = 'אחר';
                  selectEl.appendChild(otherOption);
              }
              }
            }, 200); // Small delay to ensure DOM is ready
          }
        }
      } catch (error) {
        window.Logger?.error('Error rendering variables form in modal', error, { page: 'ai-analysis' });
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.textContent = 'שגיאה בטעינת משתנים';
        container.appendChild(errorDiv);
      }
    },

    /**
     * Get trading methods for dropdown
     */
    async getTradingMethods() {
      try {
        if (window.SelectPopulatorService && typeof window.SelectPopulatorService.getTradingMethods === 'function') {
          return await window.SelectPopulatorService.getTradingMethods();
        }
        // Fallback: try to get from ConditionsCRUDManager
        if (window.ConditionsCRUDManager && typeof window.ConditionsCRUDManager.getTradingMethods === 'function') {
          return await window.ConditionsCRUDManager.getTradingMethods();
        }
        return [];
      } catch (error) {
        window.Logger?.warn('Error getting trading methods', error, { page: 'ai-analysis' });
        return [];
      }
    },

    /**
     * Get tickers for dropdown
     */
    async getTickers() {
      try {
        if (window.SelectPopulatorService && typeof window.SelectPopulatorService.getTickers === 'function') {
          return await window.SelectPopulatorService.getTickers();
        }
        // Fallback: try tickerService
        if (window.tickerService && typeof window.tickerService.getTickers === 'function') {
          return await window.tickerService.getTickers();
        }
        return [];
      } catch (error) {
        window.Logger?.warn('Error getting tickers', error, { page: 'ai-analysis' });
        return [];
      }
    },

    /**
     * Get unique reasons from user's trade plans
     * For Equity Research Analysis, includes recommended fundamental reasons
     */
    async getTradePlanReasons() {
      try {
        // Fetch trade plans from API
        const response = await fetch('/api/trade-plans/', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const tradePlans = Array.isArray(data?.data) ? data.data : [];

        // Extract unique reasons (non-empty)
        const reasonsSet = new Set();
        tradePlans.forEach(plan => {
          if (plan.reasons && plan.reasons.trim()) {
            reasonsSet.add(plan.reasons.trim());
          }
        });

        // Convert to array and sort
        const userReasons = Array.from(reasonsSet).sort();
        
        // Recommended reasons for Equity Research Analysis (fundamental analysis)
        const recommendedReasons = [
          'דוחות כספיים חזקים - צמיחה בהכנסות וברווחיות',
          'שיפור בתחזיות - עלייה בהערכות אנליסטים',
          'חדשות חיוביות - השקת מוצר/שירות חדש או חוזה גדול',
          'שינוי במנהלות - מינוי מנכ"ל/מנהלים חדשים או שינוי אסטרטגי',
          'שיפור תחרותי - עלייה בנתח שוק או יתרון תחרותי חדש'
        ];

        // Combine: recommended reasons first, then user's reasons
        const allReasons = [...recommendedReasons, ...userReasons];
        
        window.Logger?.debug('Loaded trade plan reasons', {
          page: 'ai-analysis',
          userReasonsCount: userReasons.length,
          recommendedReasonsCount: recommendedReasons.length,
          totalCount: allReasons.length
        });

        return allReasons;
      } catch (error) {
        window.Logger?.warn('Error getting trade plan reasons', error, { page: 'ai-analysis' });
        // Return recommended reasons if API fails
        return [
          'דוחות כספיים חזקים - צמיחה בהכנסות וברווחיות',
          'שיפור בתחזיות - עלייה בהערכות אנליסטים',
          'חדשות חיוביות - השקת מוצר/שירות חדש או חוזה גדול',
          'שינוי במנהלות - מינוי מנכ"ל/מנהלים חדשים או שינוי אסטרטגי',
          'שיפור תחרותי - עלייה בנתח שוק או יתרון תחרותי חדש'
        ];
      }
    },

    /**
     * Render variables form (legacy - kept for compatibility)
     */
    async renderVariablesForm(template) {
      const container = document.getElementById('variablesContainer');
      if (!container) return;

      container.textContent = '';

      try {
        const variables = template.variables_json?.variables || [];
        
        for (const variable of variables) {
          const col = document.createElement('div');
          col.className = 'col-md-6';

          const label = document.createElement('label');
          label.className = 'form-label';
          label.textContent = variable.label || variable.key;
          label.setAttribute('for', `var_${variable.key}`);

          let input;
          if (variable.type === 'textarea') {
            input = document.createElement('textarea');
            input.className = 'form-control';
            input.rows = 3;
          } else if (variable.type === 'select') {
            input = document.createElement('select');
            input.className = 'form-select';
            
            // Check if this is a special integration field
            if (variable.key === 'investment_type' && window.VALID_INVESTMENT_TYPES) {
              // Use Investment Types from system
              window.VALID_INVESTMENT_TYPES.forEach((type) => {
                const optionEl = document.createElement('option');
                optionEl.value = type;
                const label = window.INVESTMENT_TYPE_LABELS?.[type] || type;
                optionEl.textContent = label;
                input.appendChild(optionEl);
              });
            } else if (variable.key === 'technical_indicators' || variable.key === 'condition_focus') {
              // Use Trading Methods from system
              await this.populateTradingMethodsSelect(input);
            } else if (variable.key === 'ticker_symbol' || variable.key === 'stock_ticker') {
              // Use Tickers from system
              await this.populateTickersSelect(input);
            } else if (variable.options) {
              // Use provided options
              variable.options.forEach((option) => {
                const optionEl = document.createElement('option');
                optionEl.value = typeof option === 'string' ? option : option.value;
                optionEl.textContent = typeof option === 'string' ? option : option.label;
                input.appendChild(optionEl);
              });
            }
          } else {
            input = document.createElement('input');
            input.type = variable.type === 'number' ? 'number' : 'text';
            input.className = 'form-control';
          }

          input.id = `var_${variable.key}`;
          input.name = variable.key;
          if (variable.placeholder) {
            input.placeholder = variable.placeholder;
          }
          if (variable.default_value) {
            input.value = variable.default_value;
          }
          if (variable.required) {
            input.required = true;
          }

          col.appendChild(label);
          col.appendChild(input);
          container.appendChild(col);
        }
      } catch (error) {
        window.Logger?.error('Error rendering variables form', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Populate trading methods select
     */
    async populateTradingMethodsSelect(select) {
      try {
        // Try ConditionsCRUDManager first (preferred - uses cache)
        if (window.ConditionsCRUDManager && typeof window.ConditionsCRUDManager.getTradingMethods === 'function') {
          const methods = await window.ConditionsCRUDManager.getTradingMethods();
          if (methods && methods.length > 0) {
            // Use SelectPopulatorService.populateSelectWithData for consistent formatting
            if (window.SelectPopulatorService?.populateSelectWithData) {
              window.SelectPopulatorService.populateSelectWithData(select, methods, {
                valueField: 'id',
                textField: (method) => method.name_he || method.name || `Method #${method.id}`,
                includeEmpty: true,
                emptyText: 'בחר שיטת מסחר...'
              });
            } else {
              // Fallback to manual population
              methods.forEach((method) => {
                const optionEl = document.createElement('option');
                optionEl.value = method.id;
                optionEl.textContent = method.name_he || method.name || `Method #${method.id}`;
                select.appendChild(optionEl);
              });
            }
            window.Logger?.debug('Trading methods loaded via ConditionsCRUDManager', {
              page: 'ai-analysis',
              count: methods.length
            });
            return;
          }
        }

        // Try SelectPopulatorService.populateGenericSelect as second option
        if (window.SelectPopulatorService?.populateGenericSelect) {
          await window.SelectPopulatorService.populateGenericSelect(select, '/api/trading-methods/', {
            valueField: 'id',
            textField: (method) => method.name_he || method.name || `Method #${method.id}`,
            includeEmpty: true,
            emptyText: 'בחר שיטת מסחר...'
          });
          window.Logger?.debug('Trading methods loaded via SelectPopulatorService', { page: 'ai-analysis' });
          return;
        }

        // Fallback to direct API call
        const response = await fetch('/api/trading-methods/');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            data.data.forEach((method) => {
              const optionEl = document.createElement('option');
              optionEl.value = method.id;
              optionEl.textContent = method.name_he || method.name || `Method #${method.id}`;
              select.appendChild(optionEl);
            });
          }
        }
      } catch (error) {
        window.Logger?.warn('Error loading trading methods', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Populate tickers select
     */
    async populateTickersSelect(select) {
      try {
        // Use SelectPopulatorService standard method
        if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function') {
          await window.SelectPopulatorService.populateTickersSelect(select, {
            includeEmpty: true,
            emptyText: 'בחר טיקר...'
          });
          window.Logger?.debug('Tickers loaded via SelectPopulatorService', { page: 'ai-analysis' });
          return;
        }

        // Fallback to direct API call - use /api/tickers/my
        window.Logger?.warn('SelectPopulatorService not available, using direct API call', { page: 'ai-analysis' });
        let response = await fetch('/api/tickers/my');
        if (!response.ok) {
          // Fallback to /api/tickers/ if /my fails
          response = await fetch('/api/tickers/');
        }
        if (response.ok) {
          const data = await response.json();
          const tickers = data.status === 'success' && data.data ? data.data : (Array.isArray(data) ? data : []);
          tickers.forEach((ticker) => {
            const optionEl = document.createElement('option');
            optionEl.value = ticker.symbol || ticker.id;
            // Display ticker + company name (use custom name if available)
            const displayName = ticker.name_custom || ticker.name || ticker.symbol;
            const displayText = displayName ? `${ticker.symbol} - ${displayName}` : ticker.symbol;
            optionEl.textContent = displayText || `Ticker #${ticker.id}`;
            select.appendChild(optionEl);
          });
        }
      } catch (error) {
        window.Logger?.warn('Error loading tickers', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Handle generate analysis
     */
    async handleGenerateAnalysis() {
      if (!this.selectedTemplate) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('נא לבחור תבנית ניתוח', 'system');
        }
        return;
      }

      // Check if we're in modal or page
      const providerSelect = document.getElementById('llmProviderModal') || document.getElementById('llmProvider');
      const provider = providerSelect?.value;

      if (!provider) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('נא לבחור מנוע AI', 'system');
        }
        return;
      }

      // Build field map dynamically from template using DataCollectionService
      const fieldMap = {};
      if (this.selectedTemplate.variables_json?.variables) {
        this.selectedTemplate.variables_json.variables.forEach((variable) => {
          // Skip response_language - it's handled by static HTML element
          if (variable.key === 'response_language') {
            return;
          }
          
          // Check if we're in modal or page
          const fieldId = document.getElementById(`var_modal_${variable.key}`) ? `var_modal_${variable.key}` : `var_${variable.key}`;
          fieldMap[variable.key] = {
            id: fieldId,
            type: variable.type === 'number' ? 'number' : variable.type === 'select' ? 'text' : variable.type === 'textarea' ? 'text' : 'text',
            default: variable.default_value || null
          };
        });
      }
      
      // Add response_language manually (static HTML element)
      if (document.getElementById('responseLanguageModal') || document.getElementById('responseLanguage')) {
        fieldMap['response_language'] = {
          id: document.getElementById('responseLanguageModal') ? 'responseLanguageModal' : 'responseLanguage',
          type: 'text',
          default: 'hebrew'
        };
      }

      // Collect variables from form using DataCollectionService
      let variables = {};
      if (window.DataCollectionService && typeof window.DataCollectionService.collectFormData === 'function') {
        // Use DataCollectionService for standard field collection
        variables = window.DataCollectionService.collectFormData(fieldMap) || {};
        
        // Handle "אחר" option and convert ticker IDs to text - check each select field
        Object.keys(fieldMap).forEach((key) => {
          const fieldConfig = fieldMap[key];
          const selectElement = document.getElementById(fieldConfig.id);
          
          if (selectElement && selectElement.tagName === 'SELECT') {
            if (selectElement.value === '__other__') {
              // Use value from "אחר" input instead
              const otherInputId = `${fieldConfig.id}_other`;
              const otherInput = document.getElementById(otherInputId);
              if (otherInput && otherInput.value) {
                variables[key] = otherInput.value;
              } else {
                // Remove "__other__" if no value in "אחר" input
                delete variables[key];
              }
            } else if (selectElement.value && (key === 'stock_ticker' || key === 'ticker_symbol')) {
              // For ticker fields, use the text content of the selected option instead of ID
              const selectedOption = selectElement.options[selectElement.selectedIndex];
              if (selectedOption && selectedOption.textContent) {
                // Extract ticker symbol from text (e.g., "TSLA - Tesla, Inc." -> "TSLA")
                const optionText = selectedOption.textContent.trim();
                // If text contains " - ", take the part before it (the ticker symbol)
                const tickerSymbol = optionText.includes(' - ') 
                  ? optionText.split(' - ')[0].trim()
                  : optionText;
                variables[key] = tickerSymbol;
                window.Logger?.debug('Converted ticker ID to symbol', {
                  page: 'ai-analysis',
                  key,
                  id: selectElement.value,
                  symbol: tickerSymbol,
                  fullText: optionText
                });
              }
            }
          }
        });
      } else {
        // Fallback to manual collection (for backward compatibility)
        window.Logger?.warn('DataCollectionService not available, using manual collection', { page: 'ai-analysis' });
        const variableInputs = document.querySelectorAll('#variablesContainerModal select, #variablesContainerModal input, #variablesContainerModal textarea, #variablesContainer select, #variablesContainer input, #variablesContainer textarea');
        
        variableInputs.forEach((input) => {
          if (!input.name) return;
          
          // Skip "אחר" inputs - we'll handle them separately
          if (input.name.endsWith('_other')) return;
          
          if (input.tagName === 'SELECT') {
            const select = input;
            if (select.value === '__other__') {
              // Use value from "אחר" input
              const otherInput = document.getElementById(`${select.id}_other`);
              if (otherInput && otherInput.value) {
                variables[input.name] = otherInput.value;
              }
            } else if (select.value) {
              // For ticker fields, convert ID to symbol text
              if ((input.name === 'stock_ticker' || input.name === 'ticker_symbol') && select.selectedIndex >= 0) {
                const selectedOption = select.options[select.selectedIndex];
                if (selectedOption && selectedOption.textContent) {
                  const optionText = selectedOption.textContent.trim();
                  const tickerSymbol = optionText.includes(' - ') 
                    ? optionText.split(' - ')[0].trim()
                    : optionText;
                  variables[input.name] = tickerSymbol;
                  window.Logger?.debug('Converted ticker ID to symbol (fallback)', {
                    page: 'ai-analysis',
                    name: input.name,
                    id: select.value,
                    symbol: tickerSymbol
                  });
                } else {
                  variables[input.name] = select.value;
                }
              } else {
                variables[input.name] = select.value;
              }
            }
          } else if (input.value) {
            variables[input.name] = input.value;
          }
        });
        
        // Always collect response_language from the modal (it's not in fieldMap)
        const responseLanguageEl = document.getElementById('responseLanguageModal');
        if (responseLanguageEl) {
          variables['response_language'] = responseLanguageEl.value || 'hebrew';
        }
      }

      window.Logger?.debug('Collected variables', {
        page: 'ai-analysis',
        variableCount: Object.keys(variables).length,
        variables: Object.keys(variables)
      });

      // Set loading state - check both modal and page
      // Check if we're in modal by looking for the modal form
      const modalForm = document.getElementById('aiAnalysisFormModal');
      const isModal = !!modalForm;
      
      // Set loading state IMMEDIATELY to prevent double clicks (synchronous operation)
      if (isModal) {
        this.setLoadingState(true, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal', 'מתחיל...');
      } else {
        this.setLoadingState(true, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner', 'מתחיל...');
      }
      
      // Show progress overlay IMMEDIATELY
      this.showProgressOverlay(1, 'מתחיל תהליך יצירת הניתוח...', 'מאתחל את המערכת ומכין את הנתונים');
      
      // Force a small delay to ensure UI updates are visible
      await new Promise(resolve => setTimeout(resolve, 50));
      
      window.Logger?.info('🚀 Starting analysis generation process', {
        page: 'ai-analysis',
        templateId: this.selectedTemplate.id,
        provider
      });

      // Validate request before generating analysis using Business Logic Layer
      if (window.AIAnalysisData?.validateAnalysisRequest) {
        try {
          // Update loading state for validation
          if (isModal) {
            this.setLoadingState(true, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal', 'מאמת נתונים...');
          } else {
            this.setLoadingState(true, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner', 'מאמת נתונים...');
          }
          
          // Update progress overlay to step 2
          this.showProgressOverlay(2, 'מאמת נתונים...', 'בודק תקינות הנתונים והגדרות');
          
          window.Logger?.info?.('🔍 Validating analysis request...', { page: 'ai-analysis' });
          
          const validationResult = await window.AIAnalysisData.validateAnalysisRequest({
            template_id: this.selectedTemplate.id,
            variables: variables,
            provider: provider
          });

          if (!validationResult.is_valid) {
            // Hide progress overlay on error
            this.hideProgressOverlay();
            
            // Reset loading state
            if (isModal) {
              this.setLoadingState(false, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal');
            } else {
              this.setLoadingState(false, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner');
            }
            
            const errorMessage = validationResult.errors.join(', ');
            
            window.Logger?.warn?.('⚠️ Validation failed', {
              page: 'ai-analysis',
              errors: validationResult.errors,
            });
            
            if (window.NotificationSystem) {
              window.NotificationSystem.showError(
                'שגיאת ולידציה: ' + errorMessage,
                'system'
              );
            }
            return;
          }
          
          window.Logger?.info?.('✅ Validation passed', { page: 'ai-analysis' });
          
          // Update loading state after validation passes
          if (isModal) {
            this.setLoadingState(true, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal', 'יוצר ניתוח...');
          } else {
            this.setLoadingState(true, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner', 'יוצר ניתוח...');
          }
          
          // Update progress overlay to step 3
          this.showProgressOverlay(3, 'שולח בקשה למנוע AI...', 'מתחבר למנוע ומעביר את הנתונים');
        } catch (validationError) {
          // Hide progress overlay on error
          this.hideProgressOverlay();
          
          // Reset loading state on validation error
          if (isModal) {
            this.setLoadingState(false, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal');
          } else {
            this.setLoadingState(false, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner');
          }
          
          window.Logger?.error?.('❌ Error during validation', {
            page: 'ai-analysis',
            error: validationError?.message || validationError,
          });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(
              'שגיאה בוולידציה: ' + (validationError?.message || 'שגיאה לא ידועה'),
              'system'
            );
          }
          return;
        }
      }

      try {
        // Update loading state for API call
        if (isModal) {
          this.setLoadingState(true, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal', 'שולח בקשה...');
        } else {
          this.setLoadingState(true, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner', 'שולח בקשה...');
        }
        
        window.Logger?.info('Generating analysis...', {
          page: 'ai-analysis',
          templateId: this.selectedTemplate.id,
          provider,
        });

        if (window.NotificationSystem) {
          window.NotificationSystem.showInfo('📤 שולח בקשה לשרת... ממתין לתגובת המנוע', 'system', { duration: 8000 });
        }

        // Build API URL
        const apiUrl = window.API_BASE_URL 
          ? (window.API_BASE_URL.endsWith('/') ? window.API_BASE_URL : `${window.API_BASE_URL}/`) + 'api/ai-analysis/generate'
          : '/api/ai-analysis/generate';

        // Update loading state - waiting for response
        if (isModal) {
          this.setLoadingState(true, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal', 'ממתין לתגובה...');
        } else {
          this.setLoadingState(true, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner', 'ממתין לתגובה...');
        }
        
        // Update progress overlay to step 4
        this.showProgressOverlay(4, 'ממתין לתגובת המנוע...', 'המנוע מעבד את הבקשה - זה עלול לקחת 30-60 שניות');

        // Make API call directly to use CRUDResponseHandler
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            template_id: this.selectedTemplate.id,
            variables: variables,
            provider: provider,
          }),
        });
        
        // Update loading state - processing response
        if (isModal) {
          this.setLoadingState(true, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal', 'מעבד תגובה...');
        } else {
          this.setLoadingState(true, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner', 'מעבד תגובה...');
        }
        
        // Update progress overlay to step 5
        this.showProgressOverlay(5, 'מעבד תוצאות...', 'מכין את הדוח הסופי ושומר במטמון');

        // Read response first to get result data before passing to CRUDResponseHandler
        // We need to clone the response because CRUDResponseHandler will also read it
        const responseClone = response.clone();
        let responseData = null;
        let result = null;
        
        try {
          responseData = await response.json();
          
          // Extract result from response
          if (responseData.status === 'success' && responseData.data) {
            result = responseData.data;
            
            // Store result for display after reload - MUST be set BEFORE reloadFn is called
            this.pendingResult = result;
            
            window.Logger?.info('✅ Analysis generated successfully - storing pending result', {
              page: 'ai-analysis',
              requestId: result.id,
              status: result.status,
              hasResponseText: !!result.response_text,
              pendingResultSet: !!this.pendingResult
            });
            
            // Save response_text to cache IMMEDIATELY (before reloadFn is called)
            if (result.id && result.response_text) {
              const cacheKey = `ai-analysis-response-${result.id}`;
              if (window.UnifiedCacheManager) {
                // Check if already in cache before saving
                const existingCache = await window.UnifiedCacheManager.get(cacheKey);
                if (!existingCache || !existingCache.response_text) {
                  await window.UnifiedCacheManager.save(cacheKey, {
                    response_text: result.response_text,
                    response_json: result.response_json || null,
                    cached_at: new Date().toISOString()
                  }, {
                    ttl: 7200000, // 2 hours
                    layer: 'indexedDB',
                    compress: true
                  });
                  window.Logger?.info('✅ Saved AI analysis response to cache (before reloadFn)', { 
                    page: 'ai-analysis', 
                    requestId: result.id,
                    cacheKey,
                    hasResponseText: !!result.response_text
                  });
                } else {
                  window.Logger?.debug('⏭️ Skipped cache save - already exists (handleGenerateAnalysis CRUD)', { 
                    page: 'ai-analysis', 
                    requestId: result.id
                  });
                }
              }
            }
          }
        } catch (error) {
          window.Logger?.error('Error reading response before CRUDResponseHandler', {
            page: 'ai-analysis',
            error: error?.message || error
          });
        }

        // Use CRUDResponseHandler for response handling
        if (window.CRUDResponseHandler && typeof window.CRUDResponseHandler.handleSaveResponse === 'function') {
          // Now call CRUDResponseHandler with cloned response
          const crudResult = await window.CRUDResponseHandler.handleSaveResponse(responseClone, {
            modalId: 'aiVariablesModal',
            successMessage: 'ניתוח נוצר בהצלחה!',
            entityName: 'ניתוח AI',
            reloadFn: async () => {
              // Update progress overlay - finalizing
              this.showProgressOverlay(5, 'מסיים תהליך...', 'מעדכן את הטבלה ומכין את התוצאות');
              
              // Update loading state - updating table
              if (isModal) {
                this.setLoadingState(true, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal', 'מעדכן טבלה...');
              } else {
                this.setLoadingState(true, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner', 'מעדכן טבלה...');
              }
              
              // Reload history after successful analysis creation
              this.history = await window.AIAnalysisData?.loadHistory({ force: true }) || [];
              
              // Check availability AFTER cache is saved (give it a moment for cache to be fully written)
              await new Promise(resolve => setTimeout(resolve, 200)); // Delay to ensure cache is saved
              await this.checkAvailabilityForAll();
              this.renderHistory();
              // Update summary stats after availability check
              if (window.updatePageSummaryStats) {
                window.updatePageSummaryStats('ai-analysis', this.history);
              }
              
              // Show results after history is updated (if we have a pending result)
              if (this.pendingResult && this.pendingResult.id) {
                window.Logger?.info('📊 Opening results modal for pending result', {
                  page: 'ai-analysis',
                  pendingResultId: this.pendingResult.id,
                  hasResponseText: !!this.pendingResult.response_text
                });
                
                // Find the updated result from history to get latest availability info
                const updatedResult = this.history.find(h => h.id === this.pendingResult.id) || this.pendingResult;
                
                // Ensure we have response_text from pendingResult if not in updatedResult
                if (!updatedResult.response_text && this.pendingResult.response_text) {
                  updatedResult.response_text = this.pendingResult.response_text;
                }
                
                // Hide progress overlay before showing results
                this.hideProgressOverlay();
                
                await this.openResultsModal(updatedResult);
                this.pendingResult = null; // Clear pending result
                
                // Reset loading state after results are shown
                if (isModal) {
                  this.setLoadingState(false, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal');
                } else {
                  this.setLoadingState(false, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner');
                }
              } else {
                window.Logger?.warn('⚠️ No pending result to display', {
                  page: 'ai-analysis',
                  pendingResult: this.pendingResult,
                  historyLength: this.history.length
                });
                
                // Hide progress overlay
                this.hideProgressOverlay();
                
                // Reset loading state
                if (isModal) {
                  this.setLoadingState(false, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal');
                } else {
                  this.setLoadingState(false, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner');
                }
                
                // If no pending result but analysis was created, show info
                if (window.NotificationSystem) {
                  window.NotificationSystem.showInfo(
                    '✅ הניתוח נוצר בהצלחה. ניתן לצפות בו מהטבלה.',
                    'business',
                    { duration: 5000 }
                  );
                }
              }
            },
            requiresHardReload: false,
          });

          if (crudResult && crudResult.status === 'success' && crudResult.data) {
            // result already set above, just verify
            if (!result) {
              result = crudResult.data;
              this.pendingResult = result;
            }
            
            // Show success notification immediately
            if (window.NotificationSystem) {
              window.NotificationSystem.showSuccess(
                `✅ הניתוח הושלם בהצלחה! מספר בקשה: ${result.id || 'N/A'}`,
                'business',
                { duration: 5000 }
              );
            }
            
            window.Logger?.info('✅ Analysis generated successfully (CRUD path)', {
              page: 'ai-analysis',
              requestId: result.id,
              status: result.status,
              hasResponseText: !!result.response_text,
              pendingResultSet: !!this.pendingResult
            });
          } else {
            // Handle error from CRUDResponseHandler
            const errorMessage = crudResult?.error?.message || crudResult?.message || 'שגיאה לא ידועה ביצירת הניתוח';
            
            // Hide progress overlay on error
            this.hideProgressOverlay();
            
            window.Logger?.error('❌ Analysis generation failed', {
              page: 'ai-analysis',
              error: errorMessage,
              crudResult
            });
            
            if (window.NotificationSystem) {
              window.NotificationSystem.showError(
                `❌ הניתוח נכשל: ${errorMessage}`,
                'system',
                { duration: 8000 }
              );
            }
          }
        } else {
          // Fallback to manual handling
          window.Logger?.warn('CRUDResponseHandler not available, using manual handling', { page: 'ai-analysis' });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.status === 'success' && data.data) {
            result = data.data;
            
            // Save response_text to cache (not in DB) - only if not already cached
            if (result.id && result.response_text) {
              const cacheKey = `ai-analysis-response-${result.id}`;
              if (window.UnifiedCacheManager) {
                // Check if already in cache before saving
                const existingCache = await window.UnifiedCacheManager.get(cacheKey);
                if (!existingCache || !existingCache.response_text) {
                const saveResult = await window.UnifiedCacheManager.save(cacheKey, {
                  response_text: result.response_text,
                  response_json: result.response_json || null,
                  cached_at: new Date().toISOString()
                }, {
                  ttl: 7200000, // 2 hours
                  layer: 'indexedDB',
                  compress: true
                });
                
                if (saveResult) {
                  window.Logger?.info('✅ Saved AI analysis response to cache', { 
                    page: 'ai-analysis', 
                    requestId: result.id,
                    cacheKey,
                    hasResponseText: !!result.response_text
                  });
                  
                  // Update availability for this specific item immediately
                  if (this.history) {
                    const historyItem = this.history.find(h => h.id === result.id);
                    if (historyItem) {
                      historyItem._availability = {
                        has_cache: true,
                        has_note: false,
                        note_id: null
                      };
                      window.Logger?.debug('Updated availability for history item', {
                        page: 'ai-analysis',
                        id: result.id,
                        has_cache: true
                      });
                    }
                  }
                } else {
                  window.Logger?.warn('⚠️ Failed to save AI analysis response to cache', { 
                    page: 'ai-analysis', 
                    requestId: result.id,
                    cacheKey
                  });
                }
              } else {
                window.Logger?.debug('⏭️ Skipped cache save - already exists (handleGenerateAnalysis fallback)', { 
                  page: 'ai-analysis', 
                  requestId: result.id
                  });
                }
              }
            }
            
            // Show success notification
            if (window.NotificationSystem) {
              window.NotificationSystem.showSuccess(
                `✅ הניתוח הושלם בהצלחה! מספר בקשה: ${result.id || 'N/A'}`,
                'business',
                { duration: 5000 }
              );
            }
            
            window.Logger?.info('✅ Analysis generated successfully (fallback path)', {
              page: 'ai-analysis',
              requestId: result.id,
              status: result.status,
              hasResponseText: !!result.response_text
            });
            
            // Close variables modal
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
              window.ModalManagerV2.hideModal('aiVariablesModal');
            } else if (bootstrap?.Modal) {
            const variablesModal = bootstrap.Modal.getInstance(document.getElementById('aiVariablesModal'));
            if (variablesModal) {
              variablesModal.hide();
              }
            }
            
            // Update progress overlay - finalizing
            this.showProgressOverlay(5, 'מסיים תהליך...', 'מעדכן את הטבלה ומכין את התוצאות');
            
            // Reload history
            this.history = await window.AIAnalysisData?.loadHistory({ force: true }) || [];
            // Check availability AFTER cache is saved (give it a moment for cache to be fully written)
            await new Promise(resolve => setTimeout(resolve, 200)); // Delay to ensure cache is saved
            await this.checkAvailabilityForAll();
            this.renderHistory();
            // Update summary stats after availability check
            if (window.updatePageSummaryStats) {
              window.updatePageSummaryStats('ai-analysis', this.history);
            }
            
            // Show results modal after history is updated
            if (result && result.id) {
              // Hide progress overlay before showing results
              this.hideProgressOverlay();
              
              // Ensure we have the latest result with cache info
              const updatedResult = this.history.find(h => h.id === result.id) || result;
              await this.openResultsModal(updatedResult);
            } else {
              // Hide progress overlay
              this.hideProgressOverlay();
              
              // If no result ID, show info
              if (window.NotificationSystem) {
                window.NotificationSystem.showInfo(
                  '✅ הניתוח נוצר בהצלחה. ניתן לצפות בו מהטבלה.',
                  'business',
                  { duration: 5000 }
                );
              }
            }
          } else {
            throw new Error(data.message || 'שגיאה ביצירת ניתוח');
          }
        }

        // Show results if not already shown (fallback for non-CRUDResponseHandler flow)
        if (result && !window.CRUDResponseHandler) {
          this.currentAnalysis = result;
          await this.openResultsModal(result);
        }
      } catch (error) {
        // Hide progress overlay on error
        this.hideProgressOverlay();
        
        window.Logger?.error('❌ Error generating analysis', {
          page: 'ai-analysis',
          error: error?.message || error,
          stack: error?.stack
        });
        
        // Show detailed error notification
        const errorMessage = error?.message || 'שגיאה לא ידועה';
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(
            `❌ הניתוח נכשל: ${errorMessage}`,
            'system',
            { duration: 8000 }
          );
        }
        
        // Try to show error in results modal if possible
        if (error?.response || error?.data) {
          try {
            const errorResult = {
              status: 'failed',
              error_message: errorMessage,
              id: error?.data?.id || null
            };
            await this.openResultsModal(errorResult);
          } catch (modalError) {
            window.Logger?.warn('Could not show error in results modal', { page: 'ai-analysis', error: modalError });
          }
        }
      } finally {
        // Hide progress overlay in finally (in case it wasn't hidden already)
        this.hideProgressOverlay();
        
        // Reset loading state - check both modal and page
        const isModal = document.getElementById('generateAnalysisBtnModal');
        if (isModal) {
          this.setLoadingState(false, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal');
        } else {
          this.setLoadingState(false, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner');
        }
      }
    },

    /**
     * Open results modal
     */
    async openResultsModal(analysisResult) {
      try {
        // Hide progress overlay when opening results
        this.hideProgressOverlay();
        
        // Set currentAnalysis for saveAsNote functionality
        this.currentAnalysis = analysisResult;
        
        window.Logger?.info('Opening results modal', { 
          page: 'ai-analysis',
          requestId: analysisResult?.id,
          hasCurrentAnalysis: !!this.currentAnalysis,
          hasResponseText: !!analysisResult?.response_text
        });
        
        // Render results in modal
        await this.renderResultsModal(analysisResult);

        // Show modal using ModalManagerV2 if available, otherwise Bootstrap
        let modalShown = false;
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          try {
            await window.ModalManagerV2.showModal('aiResultsModal', 'view');
            modalShown = true;
            
            // Setup event listeners for action buttons after modal is shown
            // Wait a bit for Button System to process buttons
            setTimeout(() => {
              this.setupResultsModalButtons();
            }, 300);
            
            // Show success notification after modal is shown
            if (analysisResult && analysisResult.status !== 'failed' && analysisResult.response_text) {
              if (window.NotificationSystem) {
                window.NotificationSystem.showSuccess(
                  `✅ תוצאות הניתוח מוצגות. מספר בקשה: ${analysisResult.id || 'N/A'}`,
                  'business',
                  { duration: 5000 }
                );
              }
            }
          } catch (error) {
            window.Logger?.warn('ModalManagerV2.showModal failed, trying Bootstrap fallback', { page: 'ai-analysis', error });
          }
        }
        
        if (!modalShown) {
          // Fallback to Bootstrap Modal
          const modalElement = document.getElementById('aiResultsModal');
          if (!modalElement) {
            throw new Error('Results modal element not found');
          }

          // Use Bootstrap Modal directly for unregistered modals
          if (window.bootstrap && window.bootstrap.Modal) {
            window.Logger?.debug('Opening results modal via Bootstrap', { page: 'ai-analysis' });
            const modal = new bootstrap.Modal(modalElement, { backdrop: false, keyboard: true });
            modal.show();
            
            // Setup event listeners for action buttons after modal is shown
            // Wait a bit for Button System to process buttons
            setTimeout(() => {
              this.setupResultsModalButtons();
            }, 300);
            
            // Show success notification after modal is shown
            if (analysisResult && analysisResult.status !== 'failed' && analysisResult.response_text) {
              setTimeout(() => {
                if (window.NotificationSystem) {
                  window.NotificationSystem.showSuccess(
                    `✅ תוצאות הניתוח מוצגות. מספר בקשה: ${analysisResult.id || 'N/A'}`,
                    'business',
                    { duration: 5000 }
                  );
                }
              }, 300);
            }
          } else {
            throw new Error('Bootstrap Modal not available');
          }
        }

        window.Logger?.info('Results modal opened', { 
          page: 'ai-analysis',
          requestId: analysisResult?.id,
          status: analysisResult?.status,
          hasResponseText: !!analysisResult?.response_text
        });
      } catch (error) {
        window.Logger?.error('Error opening results modal', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(
            `שגיאה בפתיחת מודול תוצאות: ${error?.message || 'שגיאה לא ידועה'}`,
            'system',
            { duration: 8000 }
          );
        }
      }
    },

    /**
     * Render results in modal
     */
    async renderResultsModal(analysisResult) {
      const container = document.getElementById('resultsContainerModal');
      if (!container) {
        window.Logger?.warn('Results container modal not found', { page: 'ai-analysis' });
        return;
      }

      if (!analysisResult) {
        container.textContent = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-warning';
        alert.textContent = 'אין תוצאות להצגה';
        container.appendChild(alert);
        return;
      }

      // Check if analysis failed or has no response
      if (analysisResult.status === 'failed') {
        const errorMessage = analysisResult.error_message || 'שגיאה לא ידועה ביצירת הניתוח';
        container.textContent = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        const h5 = document.createElement('h5');
        h5.textContent = '❌ הניתוח נכשל';
        alert.appendChild(h5);
        const p = document.createElement('p');
        p.textContent = errorMessage;
        alert.appendChild(p);
        if (analysisResult.id) {
          const small = document.createElement('small');
          small.textContent = `מספר בקשה: ${analysisResult.id}`;
          alert.appendChild(small);
        }
        container.appendChild(alert);
        return;
      }

      // Show loading message while retrieving response
      container.textContent = '';
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'text-center p-4';
      const spinner = document.createElement('div');
      spinner.className = 'spinner-border text-primary';
      spinner.setAttribute('role', 'status');
      const spinnerSpan = document.createElement('span');
      spinnerSpan.className = 'visually-hidden';
      spinnerSpan.textContent = 'טוען...';
      spinner.appendChild(spinnerSpan);
      loadingDiv.appendChild(spinner);
      const p = document.createElement('p');
      p.className = 'mt-2';
      p.textContent = 'טוען תוצאות הניתוח...';
      loadingDiv.appendChild(p);
      container.appendChild(loadingDiv);
      
      if (window.NotificationSystem) {
        window.NotificationSystem.showInfo('🔍 מחפש תוצאות במטמון...', 'system', { duration: 2000 });
      }
      
      // Try to get response_text from result first
      let responseText = analysisResult.response_text;
      
      // If not in result, try cache
      if (!responseText && analysisResult.id && window.UnifiedCacheManager) {
        const cacheKey = `ai-analysis-response-${analysisResult.id}`;
        window.Logger?.debug('Checking cache for analysis response', { 
          page: 'ai-analysis', 
          requestId: analysisResult.id,
          cacheKey
        });
        
        const cachedData = await window.UnifiedCacheManager.get(cacheKey);
        if (cachedData && cachedData.response_text) {
          responseText = cachedData.response_text;
          window.Logger?.info('✅ Retrieved AI analysis response from cache', { 
            page: 'ai-analysis', 
            requestId: analysisResult.id,
            responseLength: responseText?.length || 0
          });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('✅ נמצא במטמון! טוען תוצאות...', 'system', { duration: 2000 });
          }
        } else {
          window.Logger?.warn('⚠️ Analysis response not found in cache', { 
            page: 'ai-analysis', 
            requestId: analysisResult.id,
            cacheKey,
            cachedDataExists: !!cachedData
          });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showInfo('🔍 לא נמצא במטמון, מחפש במקורות אחרים...', 'system', { duration: 2000 });
          }
        }
      }
      
      // If still no response_text, try pendingResult first (for just-created analyses)
      if (!responseText && analysisResult.id && this.pendingResult && this.pendingResult.id === analysisResult.id) {
        responseText = this.pendingResult.response_text;
        if (responseText) {
          window.Logger?.info('✅ Retrieved AI analysis response from pendingResult', { 
            page: 'ai-analysis', 
            requestId: analysisResult.id,
            responseLength: responseText?.length || 0
          });
          // Don't save to cache here - it's already saved in handleGenerateAnalysis
        }
      }
      
      // If still no response_text, try to load from API (only if not just created)
      // Skip API call if this is a just-created analysis (already saved in handleGenerateAnalysis)
      const isJustCreated = this.pendingResult && this.pendingResult.id === analysisResult.id;
      if (!responseText && !isJustCreated && analysisResult.id && analysisResult.status === 'completed') {
        window.Logger?.info('🔄 Loading analysis response from API...', { 
            page: 'ai-analysis', 
            requestId: analysisResult.id 
          });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showInfo('📡 טוען תוצאות מהשרת...', 'system', { duration: 3000 });
        }
        
        container.textContent = '';
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-center p-4';
        const spinner = document.createElement('div');
        spinner.className = 'spinner-border text-primary';
        spinner.setAttribute('role', 'status');
        const spinnerSpan = document.createElement('span');
        spinnerSpan.className = 'visually-hidden';
        spinnerSpan.textContent = 'טוען...';
        spinner.appendChild(spinnerSpan);
        loadingDiv.appendChild(spinner);
        const p = document.createElement('p');
        p.className = 'mt-2';
        p.textContent = 'טוען תוצאות מהשרת...';
        loadingDiv.appendChild(p);
        container.appendChild(loadingDiv);
        
        try {
          const response = await fetch(`/api/ai-analysis/history/${analysisResult.id}`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data && data.data.response_text) {
              responseText = data.data.response_text;
              window.Logger?.info('✅ Retrieved AI analysis response from API', { 
                page: 'ai-analysis', 
                requestId: analysisResult.id,
                responseLength: responseText?.length || 0
              });
              
              // Save to cache for future use (only if not already cached)
              if (window.UnifiedCacheManager && analysisResult.id) {
                const cacheKey = `ai-analysis-response-${analysisResult.id}`;
                // Check if already in cache before saving
                const existingCache = await window.UnifiedCacheManager.get(cacheKey);
                if (!existingCache || !existingCache.response_text) {
                  if (window.NotificationSystem) {
                    window.NotificationSystem.showInfo('💾 שומר במטמון...', 'system', { duration: 2000 });
                  }
                  
                  await window.UnifiedCacheManager.save(cacheKey, {
                    response_text: responseText,
                    response_json: data.data.response_json || null,
                    cached_at: new Date().toISOString()
                  }, {
                    ttl: 7200000, // 2 hours
                    layer: 'indexedDB',
                    compress: true
                  });
                  window.Logger?.info('💾 Saved analysis response to cache', { 
                    page: 'ai-analysis', 
                    requestId: analysisResult.id
                  });
                  
                  if (window.NotificationSystem) {
                    window.NotificationSystem.showSuccess('✅ נשמר במטמון! מציג תוצאות...', 'system', { duration: 2000 });
                  }
                } else {
                  window.Logger?.debug('⏭️ Skipped cache save - already exists', { 
                    page: 'ai-analysis', 
                    requestId: analysisResult.id
                  });
                }
              }
            } else {
              window.Logger?.warn('⚠️ API returned analysis but no response_text', { 
                page: 'ai-analysis', 
                requestId: analysisResult.id,
                hasData: !!data.data,
                status: data.status
              });
            }
          } else {
            window.Logger?.warn('⚠️ API request failed', { 
              page: 'ai-analysis', 
              requestId: analysisResult.id,
              status: response.status
            });
          }
        } catch (apiError) {
          window.Logger?.error('❌ Error loading analysis from API', { 
            page: 'ai-analysis', 
            requestId: analysisResult.id,
            error: apiError?.message || apiError
          });
        }
      }

      if (!responseText) {
        container.textContent = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-warning';
        const h5 = document.createElement('h5');
        h5.textContent = '⚠️ אין תוצאות להצגה';
        alert.appendChild(h5);
        const p1 = document.createElement('p');
        p1.textContent = 'הניתוח הושלם אך התוצאות לא זמינות כרגע. התוצאות נשמרות במטמון למשך 2 שעות בלבד.';
        alert.appendChild(p1);
        const p2 = document.createElement('p');
        p2.textContent = 'אם שמרת את הניתוח כהערה, תוכל למצוא אותו בעמוד הערות.';
        alert.appendChild(p2);
        if (analysisResult.status) {
          const p3 = document.createElement('p');
          p3.textContent = 'סטטוס: ';
          const strong = document.createElement('strong');
          strong.textContent = analysisResult.status;
          p3.appendChild(strong);
          alert.appendChild(p3);
        }
        if (analysisResult.id) {
          const p4 = document.createElement('p');
          const small = document.createElement('small');
          small.textContent = `מספר בקשה: ${analysisResult.id}`;
          p4.appendChild(small);
          alert.appendChild(p4);
        }
        container.appendChild(alert);
        return;
      }

      try {

        // Convert markdown to HTML
        let htmlContent;
        if (typeof marked !== 'undefined') {
          htmlContent = marked.parse(responseText);
        } else {
          // Basic fallback
          htmlContent = responseText
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        }

        // Render HTML content with proper styling (not github-markdown white-on-black)
        container.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        doc.body.childNodes.forEach(node => {
          container.appendChild(node.cloneNode(true));
        });
        // Remove github-markdown class to use system styling
        container.className = 'ai-analysis-results-content';

        window.Logger?.info('Results rendered in modal', { page: 'ai-analysis', requestId: analysisResult.id });
      } catch (error) {
        window.Logger?.error('Error rendering results in modal', error, { page: 'ai-analysis' });
        container.textContent = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.textContent = 'שגיאה בהצגת תוצאות';
        container.appendChild(alert);
      }
    },

    /**
     * Render results
     */
    async renderResults(analysisResult) {
      if (!window.AIResultRenderer) {
        window.Logger?.warn('AIResultRenderer not available', { page: 'ai-analysis' });
        return;
      }

      await window.AIResultRenderer.render(analysisResult);
    },

    /**
     * Render history as table (with sorting and filtering)
     */
    renderHistory() {
      const container = document.getElementById('historyContainer');
      if (!container) return;

      if (!this.history || this.history.length === 0) {
        container.textContent = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-info';
        alert.textContent = 'אין ניתוחים בהיסטוריה';
        container.appendChild(alert);
        // Register empty table
        this.registerHistoryTable([]);
        return;
      }

      // Create table structure
      const tableHTML = `
        <div class="table-responsive">
          <table class="table table-hover" id="aiAnalysisHistoryTable" data-table-type="ai_analysis_history">
            <thead>
              <tr>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="מזהה" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 0)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="תבנית" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 1)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="מנוע" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 2)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="סטטוס" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 3)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="נוצר ב" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 4)"></button>
                </th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody id="aiAnalysisHistoryTableBody">
              <!-- Rows will be rendered here -->
            </tbody>
          </table>
        </div>
      `;

      container.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(tableHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
        container.appendChild(node.cloneNode(true));
      });

      // Render table rows
      const tbody = document.getElementById('aiAnalysisHistoryTableBody');
      if (tbody) {
        this.history.forEach((item) => {
          const row = this.renderHistoryRow(item);
          tbody.appendChild(row);
        });
      }

      // Process buttons
      if (typeof window.processButtons === 'function') {
        window.processButtons();
      }

      // Register table with UnifiedTableSystem
      this.registerHistoryTable(this.history);
    },

    /**
     * Check availability for all history items (cache + notes)
     */
    async checkAvailabilityForAll() {
      if (!this.history || this.history.length === 0) {
        return;
      }

      try {
        // Get all analysis IDs
        const analysisIds = this.history
          .filter(item => item.status === 'completed')
          .map(item => item.id);

        if (analysisIds.length === 0) {
          return;
        }

        window.Logger?.debug('Starting availability check', {
          page: 'ai-analysis',
          totalItems: this.history.length,
          completedItems: analysisIds.length
        });

        // Small delay to ensure cache writes are complete
        await new Promise(resolve => setTimeout(resolve, 150));

        // Check cache for all items (async check)
        const cacheChecks = {};
        if (window.UnifiedCacheManager) {
          window.Logger?.debug('Checking cache for items', {
            page: 'ai-analysis',
            itemCount: analysisIds.length
          });
          
          const cachePromises = analysisIds.map(async (id) => {
            const cacheKey = `ai-analysis-response-${id}`;
            try {
              // Try to get from indexedDB layer first (where we save it)
              let cachedData = await window.UnifiedCacheManager.get(cacheKey, 'indexedDB');
              
              // If not found, try memory layer
              if (!cachedData) {
                cachedData = await window.UnifiedCacheManager.get(cacheKey, 'memory');
              }
              
              // If still not found, try localStorage
              if (!cachedData) {
                cachedData = await window.UnifiedCacheManager.get(cacheKey, 'localStorage');
              }
              
              // If still not found, try without layer (default search)
              if (!cachedData) {
                cachedData = await window.UnifiedCacheManager.get(cacheKey);
              }
              
              const hasCache = !!(cachedData && (
                cachedData.response_text || 
                (typeof cachedData === 'object' && Object.keys(cachedData).length > 0)
              ));
              
              if (hasCache) {
                window.Logger?.debug('Found in cache', { 
                  page: 'ai-analysis', 
                  id, 
                  cacheKey,
                  hasResponseText: !!cachedData?.response_text,
                  cacheKeys: cachedData ? Object.keys(cachedData) : []
                });
              } else {
                window.Logger?.debug('Not found in cache', { 
                  page: 'ai-analysis', 
                  id, 
                  cacheKey,
                  searchedLayers: ['indexedDB', 'memory', 'localStorage', 'default']
                });
              }
              return {
                id,
                has_cache: hasCache,
                has_note: false,
                note_id: null
              };
            } catch (error) {
              window.Logger?.warn('Error checking cache', { 
                page: 'ai-analysis', 
                id, 
                cacheKey, 
                error: error?.message || error 
              });
              return {
                id,
                has_cache: false,
                has_note: false,
                note_id: null
              };
            }
          });
          
          const cacheResults = await Promise.all(cachePromises);
          cacheResults.forEach(result => {
            cacheChecks[result.id] = {
              has_cache: result.has_cache,
              has_note: result.has_note,
              note_id: result.note_id
            };
          });
          
          const cacheCount = Object.values(cacheChecks).filter(c => c.has_cache).length;
          window.Logger?.debug('Cache check completed', {
            page: 'ai-analysis',
            totalChecked: cacheResults.length,
            foundInCache: cacheCount
          });
        }

        // Check notes via API (batch)
        window.Logger?.debug('Checking notes availability via API', {
          page: 'ai-analysis',
          analysisIds: analysisIds
        });
        
        try {
          const response = await fetch('/api/ai-analysis/history/availability/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ analysis_ids: analysisIds })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data) {
              // Merge cache and note availability
              for (const id of analysisIds) {
                const apiData = data.data[id] || {};
                if (cacheChecks[id]) {
                  cacheChecks[id].has_note = apiData.has_note || false;
                  cacheChecks[id].note_id = apiData.note_id || null;
                } else {
                  cacheChecks[id] = {
                    has_cache: false,
                    has_note: apiData.has_note || false,
                    note_id: apiData.note_id || null
                  };
                }
              }
              const noteCount = Object.values(cacheChecks).filter(c => c.has_note).length;
              window.Logger?.debug('Merged note availability from API', {
                page: 'ai-analysis',
                noteCount: noteCount,
                totalChecked: analysisIds.length
              });
            }
          } else {
            const errorText = await response.text().catch(() => 'Unknown error');
            window.Logger?.warn('API error checking notes availability', {
              page: 'ai-analysis',
              status: response.status,
              error: errorText
            });
          }
        } catch (error) {
          window.Logger?.warn('Error checking notes availability', { page: 'ai-analysis', error });
        }

        // Store availability info in history items
        let availableCount = 0;
        let cacheFoundCount = 0;
        let noteFoundCount = 0;
        
        for (const item of this.history) {
          if (item.status === 'completed' && cacheChecks[item.id]) {
            item._availability = cacheChecks[item.id];
            if (cacheChecks[item.id].has_cache) {
              cacheFoundCount++;
            }
            if (cacheChecks[item.id].has_note) {
              noteFoundCount++;
            }
            if (cacheChecks[item.id].has_cache || cacheChecks[item.id].has_note) {
              availableCount++;
            }
          } else if (item.status === 'completed') {
            // For completed items, initialize availability even if not checked
            item._availability = {
              has_cache: false,
              has_note: false,
              note_id: null
            };
          } else {
            // For non-completed items, no availability
            item._availability = {
              has_cache: false,
              has_note: false,
              note_id: null
            };
          }
        }

        window.Logger?.info('✅ Checked availability for all history items', {
          page: 'ai-analysis',
          totalCompleted: analysisIds.length,
          totalHistoryItems: this.history.length,
          availableCount: availableCount,
          cacheFoundCount: cacheFoundCount,
          noteFoundCount: noteFoundCount,
          cacheCount: Object.values(cacheChecks).filter(c => c && c.has_cache).length,
          noteCount: Object.values(cacheChecks).filter(c => c && c.has_note).length
        });
      } catch (error) {
        window.Logger?.error('Error checking availability for all items', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Re-run analysis with same parameters
     */
    async rerunAnalysis(analysisId) {
      try {
        // Find the analysis in history
        let analysis = this.history.find(h => h.id === analysisId);
        if (!analysis) {
          // Try to load from API
          const response = await fetch(`/api/ai-analysis/history/${analysisId}`, {
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Analysis not found');
          }
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            analysis = data.data;
          } else {
            throw new Error('Analysis not found');
          }
        }
        
        await this.rerunAnalysisWithData(analysis);
      } catch (error) {
        window.Logger?.error('Error re-running analysis', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בהרצה חוזרת של הניתוח', 'system');
        }
      }
    },

    /**
     * Re-run analysis with provided data
     */
    async rerunAnalysisWithData(analysis) {
      try {
        // Parse variables from the original analysis
        let variables = {};
        if (analysis.variables_json) {
          if (typeof analysis.variables_json === 'string') {
            variables = JSON.parse(analysis.variables_json);
          } else {
            variables = analysis.variables_json;
          }
        }

        // Get template ID
        const templateId = analysis.template_id;
        if (!templateId) {
          throw new Error('Template ID not found in analysis');
        }

        // Get provider (use same provider or default)
        const provider = analysis.provider || 'gemini';

        window.Logger?.info('Re-running analysis', {
          page: 'ai-analysis',
          analysisId: analysis.id,
          templateId,
          provider
        });

        // Validate request before generating analysis using Business Logic Layer
        if (window.AIAnalysisData?.validateAnalysisRequest) {
          try {
            window.Logger?.info?.('🔍 Validating analysis request before rerun...', { page: 'ai-analysis' });
            
            const validationResult = await window.AIAnalysisData.validateAnalysisRequest({
              template_id: templateId,
              variables: variables,
              provider: provider
            });

            if (!validationResult.is_valid) {
              const errorMessage = validationResult.errors.join(', ');
              
              window.Logger?.warn?.('⚠️ Validation failed before rerun', {
                page: 'ai-analysis',
                errors: validationResult.errors,
              });
              
              if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                  'שגיאת ולידציה: ' + errorMessage,
                  'system'
                );
              }
              return;
            }
            
            window.Logger?.info?.('✅ Validation passed for rerun', { page: 'ai-analysis' });
          } catch (validationError) {
            window.Logger?.error?.('❌ Error during validation for rerun', {
              page: 'ai-analysis',
              error: validationError?.message || validationError,
            });
            
            if (window.NotificationSystem) {
              window.NotificationSystem.showError(
                'שגיאה בוולידציה: ' + (validationError?.message || 'שגיאה לא ידועה'),
                'system'
              );
            }
            return;
          }
        }

        // Show loading notification
        if (window.NotificationSystem) {
          window.NotificationSystem.showInfo('מריץ ניתוח מחדש...', 'system');
        }

        // Call generate API
        const apiUrl = window.API_BASE_URL 
          ? (window.API_BASE_URL.endsWith('/') ? window.API_BASE_URL : `${window.API_BASE_URL}/`) + 'api/ai-analysis/generate'
          : '/api/ai-analysis/generate';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            template_id: templateId,
            variables: variables,
            provider: provider
          })
        });

        // Use CRUDResponseHandler if available (same flow as handleGenerateAnalysis)
        // CRUDResponseHandler will handle error responses too, so don't read response here
        if (window.CRUDResponseHandler && typeof window.CRUDResponseHandler.handleSaveResponse === 'function') {
          const crudResult = await window.CRUDResponseHandler.handleSaveResponse(response, {
              modalId: null, // No modal to close for rerun
              successMessage: 'ניתוח נוצר מחדש בהצלחה!',
              entityName: 'ניתוח AI',
              reloadFn: async () => {
                // Reload history after successful analysis creation
                this.history = await window.AIAnalysisData?.loadHistory({ force: true }) || [];
                // Check availability AFTER cache is saved (give it a moment for cache to be fully written)
                await new Promise(resolve => setTimeout(resolve, 200)); // Delay to ensure cache is saved
                await this.checkAvailabilityForAll();
                this.renderHistory();
                // Update summary stats after availability check
                if (window.updatePageSummaryStats) {
                  window.updatePageSummaryStats('ai-analysis', this.history);
                }
                
                // Show results after history is updated (if we have a pending result)
                if (this.pendingResult && this.pendingResult.id) {
                  // Find the updated result from history to get latest availability info
                  const updatedResult = this.history.find(h => h.id === this.pendingResult.id) || this.pendingResult;
                  await this.openResultsModal(updatedResult);
                  this.pendingResult = null; // Clear pending result
                }
              },
              requiresHardReload: false,
            });

            // Use result from CRUDResponseHandler instead of reading response ourselves
            if (crudResult && crudResult.status === 'success' && crudResult.data) {
              const analysisResult = crudResult.data;
              
              // Save response_text to cache (not in DB) - only if not already cached
              if (analysisResult.id && analysisResult.response_text) {
                const cacheKey = `ai-analysis-response-${analysisResult.id}`;
                if (window.UnifiedCacheManager) {
                  // Check if already in cache before saving
                  const existingCache = await window.UnifiedCacheManager.get(cacheKey);
                  if (!existingCache || !existingCache.response_text) {
                    await window.UnifiedCacheManager.save(cacheKey, {
                      response_text: analysisResult.response_text,
                      response_json: analysisResult.response_json || null,
                      cached_at: new Date().toISOString()
                    }, {
                      ttl: 7200000, // 2 hours
                      layer: 'indexedDB',
                      compress: true
                    });
                    window.Logger?.info('✅ Saved AI analysis response to cache (rerun)', { 
                      page: 'ai-analysis', 
                      requestId: analysisResult.id,
                      cacheKey,
                      hasResponseText: !!analysisResult.response_text
                    });
                  } else {
                    window.Logger?.debug('⏭️ Skipped cache save - already exists (rerun CRUD)', { 
                      page: 'ai-analysis', 
                      requestId: analysisResult.id
                    });
                  }
                }
              }
              
              // Store result for display after reload
              this.pendingResult = analysisResult;
            }
        } else {
          // Fallback: CRUDResponseHandler not available, read response manually
          window.Logger?.warn('CRUDResponseHandler not available for rerun, using manual handling', { page: 'ai-analysis' });

        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            // Save response_text to cache (not in DB) - only if not already cached
            if (result.data.id && result.data.response_text) {
            const cacheKey = `ai-analysis-response-${result.data.id}`;
              if (window.UnifiedCacheManager) {
                // Check if already in cache before saving
                const existingCache = await window.UnifiedCacheManager.get(cacheKey);
                if (!existingCache || !existingCache.response_text) {
            await window.UnifiedCacheManager.save(cacheKey, {
              response_text: result.data.response_text,
                    response_json: result.data.response_json || null,
                    cached_at: new Date().toISOString()
                  }, {
                    ttl: 7200000, // 2 hours
                    layer: 'indexedDB',
                    compress: true
                  });
                  window.Logger?.info('✅ Saved AI analysis response to cache (rerun, manual)', { 
                    page: 'ai-analysis', 
                    requestId: result.data.id,
                    cacheKey,
                    hasResponseText: !!result.data.response_text
                  });
                } else {
                  window.Logger?.debug('⏭️ Skipped cache save - already exists (rerun manual)', { 
                    page: 'ai-analysis', 
                    requestId: result.data.id
                  });
                }
              }
          }

          // Show success notification
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('הניתוח הושלם בהצלחה!', 'business');
          }

          // Reload history to show new analysis
          this.history = await window.AIAnalysisData?.loadHistory({ force: true }) || [];
            // Check availability AFTER cache is saved (give it a moment for cache to be fully written)
            await new Promise(resolve => setTimeout(resolve, 200)); // Delay to ensure cache is saved
          await this.checkAvailabilityForAll();
          this.renderHistory();
          
            // Update summary stats after availability check
          if (window.updatePageSummaryStats) {
            window.updatePageSummaryStats('ai-analysis', this.history);
          }
          
            // Open results modal after history is updated
            if (result.data && result.data.id) {
              // Ensure we have the latest result with cache info
              const updatedResult = this.history.find(h => h.id === result.data.id) || result.data;
              await this.openResultsModal(updatedResult);
            }
        } else {
          throw new Error(result.message || 'Failed to generate analysis');
          }
        }
      } catch (error) {
        window.Logger?.error('Error re-running analysis', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(
            `שגיאה בהרצה חוזרת: ${error.message || 'שגיאה לא ידועה'}`,
            'system'
          );
        }
      }
    },

    /**
     * Check if analysis response is available (in cache or as note)
     */
    async isResponseAvailable(analysisId) {
      // Check cache first
      if (window.UnifiedCacheManager) {
        const cacheKey = `ai-analysis-response-${analysisId}`;
        const cachedData = await window.UnifiedCacheManager.get(cacheKey);
        if (cachedData && cachedData.response_text) {
          return { available: true, source: 'cache' };
        }
      }
      
      // Check if saved as note via API
      try {
        const response = await fetch(`/api/ai-analysis/history/${analysisId}/availability`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data && data.data.has_note) {
            return { available: true, source: 'note', note_id: data.data.note_id };
          }
        }
      } catch (error) {
        window.Logger?.warn('Error checking note availability', { page: 'ai-analysis', error });
      }
      
      return { available: false, source: null };
    },

    /**
     * Render single history row
     */
    renderHistoryRow(item) {
      const row = document.createElement('tr');
      row.setAttribute('data-analysis-id', item.id);

      // ID
      const idCell = document.createElement('td');
      idCell.className = 'col-id';
      idCell.textContent = `#${item.id}`;
      row.appendChild(idCell);

      // Template name
      const templateCell = document.createElement('td');
      templateCell.textContent = item.template_name || 'ניתוח';
      row.appendChild(templateCell);

      // Provider
      const providerCell = document.createElement('td');
      providerCell.textContent = item.provider || 'לא זמין';
      row.appendChild(providerCell);

      // Status - use FieldRendererService directly (always available via BASE package)
      const statusCell = document.createElement('td');
      if (window.FieldRendererService) {
        let statusForRender = item.status;
        if (item.status === 'completed') statusForRender = 'completed';
        else if (item.status === 'failed') statusForRender = 'cancelled';
        else statusForRender = 'open';
        statusCell.textContent = '';
        const statusHTML = window.FieldRendererService.renderStatus(statusForRender, 'ai_analysis');
        const parser = new DOMParser();
        const doc = parser.parseFromString(statusHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
          statusCell.appendChild(node.cloneNode(true));
        });
      } else {
        statusCell.textContent = item.status === 'completed' ? 'הושלם' : item.status === 'failed' ? 'נכשל' : 'ממתין';
      }
      row.appendChild(statusCell);

      // Created at - handle DateEnvelope format - use FieldRendererService directly
      const dateCell = document.createElement('td');
      if (window.FieldRendererService) {
        // Check if created_at is already a DateEnvelope or needs conversion
        const dateValue = item.created_at_envelope || item.created_at;
        const dateHTML = window.FieldRendererService.renderDate(dateValue, true);
        dateCell.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(dateHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
          dateCell.appendChild(node.cloneNode(true));
        });
      } else {
        // Fallback: try to parse date
        const dateValue = item.created_at_envelope?.display || item.created_at_envelope?.local || item.created_at;
        dateCell.textContent = dateValue ? new Date(dateValue).toLocaleString('he-IL') : '-';
      }
      row.appendChild(dateCell);

      // Actions
      const actionsCell = document.createElement('td');
      
      // Always add "Re-run" button for all records
      const rerunBtn = document.createElement('button');
      rerunBtn.className = 'btn btn-sm btn-outline-secondary';
      rerunBtn.setAttribute('data-button-type', 'SECONDARY');
      rerunBtn.setAttribute('data-variant', 'small');
      rerunBtn.setAttribute('data-text', 'הרצה חוזרת');
      rerunBtn.setAttribute('data-onclick', `window.AIAnalysisManager.rerunAnalysis(${item.id})`);
      rerunBtn.setAttribute('title', 'הרצה חוזרת של הניתוח לקבלת משוב עדכני מהמנוע');
      actionsCell.appendChild(rerunBtn);
      
      // Show "View Results" button only if data is available (cache or note)
      if (item.status === 'completed') {
        const availability = item._availability || { has_cache: false, has_note: false, note_id: null };
        
        // Only show "View Results" if we have data available
        if (availability.has_cache || availability.has_note) {
          const viewBtn = document.createElement('button');
          viewBtn.className = 'btn btn-sm btn-primary ms-2';
          viewBtn.setAttribute('data-button-type', 'PRIMARY');
          viewBtn.setAttribute('data-variant', 'small');
          viewBtn.setAttribute('data-text', 'צפה בתוצאות');
          viewBtn.setAttribute('data-onclick', `window.AIAnalysisManager.viewHistoryItem(${item.id})`);
          
          // Build tooltip based on availability
          let tooltip = '';
          if (availability.has_note && availability.note_id) {
            tooltip = `נשמר כהערה (מזהה: ${availability.note_id})`;
          } else if (availability.has_cache) {
            tooltip = 'התוצאות זמינות זמנית במטמון (2 שעות)';
          }
          viewBtn.title = tooltip;
          
          actionsCell.appendChild(viewBtn);
          
          // Show note indicator if saved as note
          if (availability.has_note && availability.note_id) {
            const noteBadge = document.createElement('span');
            noteBadge.className = 'badge bg-success ms-2';
            noteBadge.textContent = `📝 הערה #${availability.note_id}`;
            noteBadge.setAttribute('title', 'הניתוח נשמר כהערה');
            actionsCell.appendChild(noteBadge);
          }
        } else {
          // No data available - show message
          const msgSpan = document.createElement('span');
          msgSpan.className = 'text-muted small ms-2';
          msgSpan.textContent = 'תוצאות לא זמינות';
          msgSpan.setAttribute('title', 'התוצאות לא זמינות במטמון או כהערה. לחץ על "הרצה חוזרת" ליצירת ניתוח חדש.');
          actionsCell.appendChild(msgSpan);
        }
      } else if (item.status === 'failed') {
        const msgSpan = document.createElement('span');
        msgSpan.className = 'text-danger small ms-2';
        msgSpan.textContent = 'נכשל';
        actionsCell.appendChild(msgSpan);
      } else if (item.status === 'pending') {
        const msgSpan = document.createElement('span');
        msgSpan.className = 'text-muted small ms-2';
        msgSpan.textContent = 'ממתין...';
        actionsCell.appendChild(msgSpan);
      }
      
      row.appendChild(actionsCell);

      return row;
    },

    /**
     * Register history table with UnifiedTableSystem
     */
    registerHistoryTable(data = null) {
      const TABLE_TYPE = 'ai_analysis_history';
      const TABLE_ID = 'aiAnalysisHistoryTable';
      const effectiveData = Array.isArray(data) ? data : (this.history || []);

      // Register with TableDataRegistry
      if (window.TableDataRegistry) {
        window.TableDataRegistry.registerTable({
          tableType: TABLE_TYPE,
          tableId: TABLE_ID,
          source: 'ai-analysis-page'
        });
        window.TableDataRegistry.setFullData(TABLE_TYPE, effectiveData, {
          tableId: TABLE_ID,
          resetFiltered: true
        });
      }

      // Register with UnifiedTableSystem
      if (window.UnifiedTableSystem && window.UnifiedTableSystem.registry) {
        const columns = [
          { key: 'template_name', sortType: 'string' },
          { key: 'provider', sortType: 'string' },
          { key: 'status', sortType: 'string' },
          { key: 'created_at', sortType: 'dateEnvelope' }
        ];

        window.UnifiedTableSystem.registry.register(TABLE_TYPE, {
          dataGetter: () => effectiveData,
          updateFunction: (tableData) => {
            const tbody = document.getElementById('aiAnalysisHistoryTableBody');
            if (tbody) {
              tbody.textContent = '';
              const dataToRender = Array.isArray(tableData) ? tableData : effectiveData;
              dataToRender.forEach((item) => {
                tbody.appendChild(this.renderHistoryRow(item));
              });
              if (typeof window.processButtons === 'function') {
                window.processButtons();
              }
            }
          },
          tableSelector: `#${TABLE_ID}`,
          columns,
          sortable: true,
          filterable: true,
          defaultSort: { columnIndex: 3, direction: 'desc', key: 'created_at' }
        });
      }

      // Register with PaginationSystem
      if (window.PaginationSystem?.registerTableInRegistry) {
        window.PaginationSystem.registerTableInRegistry(TABLE_TYPE, TABLE_ID, 'ai-analysis-page');
      }
    },

    /**
     * View history item
     * Checks cache first, then API, then notes
     */
    async viewHistoryItem(itemOrId) {
      try {
        // Handle both item object and item ID
        let item = itemOrId;
        if (typeof itemOrId === 'number' || typeof itemOrId === 'string') {
          // Find item in history by ID
          const itemId = typeof itemOrId === 'string' ? parseInt(itemOrId, 10) : itemOrId;
          item = this.history.find(h => h.id === itemId);
          if (!item) {
            window.Logger?.warn('History item not found, loading from API', { page: 'ai-analysis', id: itemId });
            // Try to load from API if not in history
            const response = await fetch(`/api/ai-analysis/history/${itemId}`, {
              credentials: 'include',
            });
            if (response.ok) {
              const data = await response.json();
              if (data.status === 'success' && data.data) {
                item = data.data;
              }
            }
            if (!item) {
              if (window.NotificationSystem) {
                window.NotificationSystem.showError('פריט לא נמצא בהיסטוריה', 'system');
              }
              return;
            }
          }
        }

        // Check cache first
        let analysisResult = null;
        if (window.UnifiedCacheManager && item.id) {
          const cacheKey = `ai-analysis-response-${item.id}`;
          const cachedData = await window.UnifiedCacheManager.get(cacheKey);
          if (cachedData && cachedData.response_text) {
            window.Logger?.debug('Found analysis response in cache', { page: 'ai-analysis', id: item.id });
            analysisResult = {
              ...item,
              response_text: cachedData.response_text,
              response_json: cachedData.response_json
            };
          }
        }

        // If not in cache, try to load from API
        if (!analysisResult || !analysisResult.response_text) {
          const response = await fetch(`/api/ai-analysis/history/${item.id}`, {
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to load analysis');
          }

          const data = await response.json();
          if (data.status === 'success' && data.data) {
            analysisResult = data.data;
            
            // If API returned response_text, save to cache (only if not already cached)
            if (analysisResult.response_text && window.UnifiedCacheManager && item.id) {
              const cacheKey = `ai-analysis-response-${item.id}`;
              // Check if already in cache before saving
              const existingCache = await window.UnifiedCacheManager.get(cacheKey);
              if (!existingCache || !existingCache.response_text) {
              await window.UnifiedCacheManager.save(cacheKey, {
                response_text: analysisResult.response_text,
                  response_json: analysisResult.response_json,
                  cached_at: new Date().toISOString()
                }, { 
                  ttl: 7200000, // 2 hours
                  layer: 'indexedDB',
                  compress: true
                });
                window.Logger?.debug('💾 Saved analysis response to cache (viewHistoryItem)', { 
                  page: 'ai-analysis', 
                  requestId: item.id
                });
              } else {
                window.Logger?.debug('⏭️ Skipped cache save - already exists (viewHistoryItem)', { 
                  page: 'ai-analysis', 
                  requestId: item.id
                });
              }
            }
          }
        }

        // If still no response_text, check notes (if analysis was saved as note)
        if (!analysisResult || !analysisResult.response_text) {
          window.Logger?.warn('Analysis response not found in cache or API, checking notes...', { 
            page: 'ai-analysis', 
            id: item.id 
          });
          
          // Check availability API for note info
          let noteId = null;
          let noteExists = false;
          try {
            const availabilityResponse = await fetch(`/api/ai-analysis/history/${item.id}/availability`, {
              credentials: 'include',
            });
            if (availabilityResponse.ok) {
              const availabilityData = await availabilityResponse.json();
              if (availabilityData.status === 'success' && availabilityData.data) {
                noteId = availabilityData.data.note_id;
                noteExists = availabilityData.data.has_note;
              }
            }
          } catch (error) {
            window.Logger?.warn('Error checking note availability', { page: 'ai-analysis', error });
          }
          
          // If note exists, try to load it
          if (noteExists && noteId) {
            try {
              const noteResponse = await fetch(`/api/notes/${noteId}`, {
                credentials: 'include',
              });
              if (noteResponse.ok) {
                const noteData = await noteResponse.json();
                if (noteData.status === 'success' && noteData.data && noteData.data.content) {
                  // Found note - use its content as response
                  analysisResult = {
                    ...item,
                    response_text: noteData.data.content,
                    _from_note: true,
                    _note_id: noteId
                  };
                  window.Logger?.info('Loaded analysis from note', { page: 'ai-analysis', note_id: noteId });
                } else {
                  // Note not found (deleted)
                  noteExists = false;
                  if (window.NotificationSystem) {
                    window.NotificationSystem.showWarning(
                      'ההערה שנשמרה עבור ניתוח זה נמחקה. התוצאות לא זמינות.',
                      'system'
                    );
                  }
                }
              } else if (noteResponse.status === 404) {
                // Note not found (deleted)
                noteExists = false;
                if (window.NotificationSystem) {
                  window.NotificationSystem.showWarning(
                    'ההערה שנשמרה עבור ניתוח זה נמחקה. התוצאות לא זמינות.',
                    'system'
                  );
                }
              }
            } catch (error) {
              window.Logger?.warn('Error loading note', { page: 'ai-analysis', error });
            }
          }
          
          // If still no response, show message
          if (!analysisResult || !analysisResult.response_text) {
            if (window.NotificationSystem) {
              if (noteId && !noteExists) {
                window.NotificationSystem.showWarning(
                  'ההערה שנשמרה עבור ניתוח זה נמחקה. התוצאות לא זמינות.',
                  'system'
                );
              } else {
                window.NotificationSystem.showWarning(
                  'תוצאות הניתוח לא זמינות. התוצאות נשמרות במטמון למשך 2 שעות בלבד. אם שמרת את הניתוח כהערה, תוכל למצוא אותו בעמוד הערות.',
                  'system'
                );
              }
            }
            
            // Still open modal to show analysis metadata
            if (analysisResult) {
              this.currentAnalysis = analysisResult;
              await this.openResultsModal(analysisResult);
            }
            return;
          }
        }

        // Open results modal with the analysis result
        if (analysisResult) {
          this.currentAnalysis = analysisResult;
          await this.openResultsModal(analysisResult);
        }
      } catch (error) {
        window.Logger?.error('Error viewing history item', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בטעינת ניתוח', 'system');
        }
      }
    },

    /**
     * Setup event listeners for results modal action buttons
     * Must be called after modal is shown and Button System has processed buttons
     */
    setupResultsModalButtons() {
      window.Logger?.info('Setting up results modal action buttons', { page: 'ai-analysis' });
      
      // Find "Save as Note" button - may have dynamic ID from Button System
      const saveAsNoteBtn = document.querySelector('#aiResultsModal button[data-onclick*="saveAsNote"], #aiResultsModal button#saveAsNoteBtnModal, #aiResultsModal [id*="saveAsNote"]');
      
      if (saveAsNoteBtn) {
        // Remove old listeners by cloning
        const newBtn = saveAsNoteBtn.cloneNode(true);
        saveAsNoteBtn.parentNode.replaceChild(newBtn, saveAsNoteBtn);
        
        // Add direct event listener
        newBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          window.Logger?.info('🖱️ Save as Note button clicked', { 
            page: 'ai-analysis',
            hasCurrentAnalysis: !!this.currentAnalysis,
            currentAnalysisId: this.currentAnalysis?.id
          });
          await this.saveAsNote();
          return false;
        });
        
        window.Logger?.info('✅ Save as Note button connected', { 
          page: 'ai-analysis',
          buttonId: newBtn.id,
          buttonText: newBtn.textContent?.trim()
        });
      } else {
        window.Logger?.warn('⚠️ Save as Note button not found in results modal', { page: 'ai-analysis' });
      }
    },

    /**
     * Save as note
     */
    async saveAsNote() {
      window.Logger?.info('📝 saveAsNote called', { 
        page: 'ai-analysis',
        hasCurrentAnalysis: !!this.currentAnalysis,
        currentAnalysisId: this.currentAnalysis?.id,
        hasResponseText: !!this.currentAnalysis?.response_text
      });
      
      if (!this.currentAnalysis) {
        window.Logger?.warn('⚠️ No current analysis to save', { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('אין ניתוח לשמירה', 'system');
        }
        return;
      }

      // If no response_text, try to load from cache or API
      if (!this.currentAnalysis.response_text) {
        window.Logger?.warn('⚠️ Current analysis has no response_text, attempting to load...', { 
          page: 'ai-analysis',
          analysisId: this.currentAnalysis.id,
          status: this.currentAnalysis.status
        });
        
        // Try to load from cache first
        if (this.currentAnalysis.id) {
          const cacheKey = `ai-analysis-response-${this.currentAnalysis.id}`;
          const cachedData = await window.UnifiedCacheManager?.get(cacheKey);
          if (cachedData && cachedData.response_text) {
            this.currentAnalysis.response_text = cachedData.response_text;
            window.Logger?.info('✅ Loaded response_text from cache', { 
              page: 'ai-analysis',
              analysisId: this.currentAnalysis.id
            });
          } else {
            // Try to load from API
            try {
              const response = await fetch(`/api/ai-analysis/history/${this.currentAnalysis.id}`);
              if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data && data.data.response_text) {
                  this.currentAnalysis.response_text = data.data.response_text;
                  window.Logger?.info('✅ Loaded response_text from API', { 
                    page: 'ai-analysis',
                    analysisId: this.currentAnalysis.id
                  });
                }
              }
            } catch (error) {
              window.Logger?.warn('Failed to load response_text from API', { 
                page: 'ai-analysis',
                error: error.message
              });
            }
          }
        }
        
        // If still no response_text, show error
        if (!this.currentAnalysis.response_text) {
          window.Logger?.warn('⚠️ Current analysis has no response_text after loading attempts', { 
            page: 'ai-analysis',
            analysisId: this.currentAnalysis.id,
            status: this.currentAnalysis.status
          });
          if (window.NotificationSystem) {
            window.NotificationSystem.showError('אין תוצאות לשמירה. נא להריץ ניתוח מחדש.', 'system');
          }
          return;
        }
      }

      if (!window.AINotesIntegration) {
        window.Logger?.error('❌ AINotesIntegration not available', { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('מערכת הערות לא זמינה', 'system');
        }
        return;
      }

      try {
        window.Logger?.info('✅ Calling AINotesIntegration.saveAsNote', { 
          page: 'ai-analysis',
          analysisId: this.currentAnalysis.id
        });
        await window.AINotesIntegration.saveAsNote(this.currentAnalysis);
      } catch (error) {
        window.Logger?.error('❌ Error in saveAsNote', error, { 
          page: 'ai-analysis',
          analysisId: this.currentAnalysis?.id,
          errorMessage: error?.message,
          errorStack: error?.stack
        });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בשמירת הערה', 'system');
        }
      }
    },

    /**
     * Export to PDF
     */
    async exportToPDF() {
      if (!this.currentAnalysis) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('אין ניתוח לייצוא', 'system');
        }
        return;
      }

      try {
        await window.AIAnalysisData?.exportToPDF(this.currentAnalysis);
      } catch (error) {
        window.Logger?.error('Error exporting to PDF', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Export to Markdown
     */
    async exportToMarkdown() {
      if (!this.currentAnalysis) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('אין ניתוח לייצוא', 'system');
        }
        return;
      }

      try {
        await window.AIAnalysisData?.exportToMarkdown(this.currentAnalysis);
      } catch (error) {
        window.Logger?.error('Error exporting to Markdown', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Export to HTML
     */
    async exportToHTML() {
      if (!this.currentAnalysis) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('אין ניתוח לייצוא', 'system');
        }
        return;
      }

      try {
        await window.AIAnalysisData?.exportToHTML(this.currentAnalysis);
      } catch (error) {
        window.Logger?.error('Error exporting to HTML', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Set loading state
     * Uses CSS classes instead of inline styles for ITCSS compliance
     * @param {boolean} loading - Whether loading state is active
     * @param {string} btnId - Button element ID
     * @param {string} textId - Text element ID
     * @param {string} spinnerId - Spinner element ID
     * @param {string} loadingMessage - Optional custom loading message
     */
    /**
     * Show progress overlay with current step
     */
    showProgressOverlay(step = 1, stepText = '', description = '') {
      const overlay = document.getElementById('aiAnalysisProgressOverlay');
      if (!overlay) {
        window.Logger?.warn('Progress overlay element not found', { page: 'ai-analysis' });
        return;
      }
      
      // Calculate z-index using ModalZIndexManager if available
      let overlayZIndex = 2000; // Default fallback
      if (window.ModalZIndexManager) {
        const stack = window.ModalNavigationService?.getStack?.() || [];
        const stackDepth = stack.length;
        // Progress overlay should be above all modals
        // BASE_Z_INDEX (1040) + (max stack depth * 10) + 100 for progress overlay
        overlayZIndex = window.ModalZIndexManager.BASE_Z_INDEX + (stackDepth * window.ModalZIndexManager.Z_INDEX_INCREMENT) + 100;
        window.Logger?.debug('Progress overlay z-index calculated', {
          page: 'ai-analysis',
          stackDepth,
          baseZIndex: window.ModalZIndexManager.BASE_Z_INDEX,
          increment: window.ModalZIndexManager.Z_INDEX_INCREMENT,
          calculatedZIndex: overlayZIndex
        });
      }
      
      // Set z-index
      overlay.style.zIndex = overlayZIndex;
      
      // Show overlay
      overlay.classList.remove('d-none');
      overlay.style.display = 'flex';
      
      // Update all steps
      const steps = overlay.querySelectorAll('.progress-step');
      steps.forEach((stepEl, index) => {
        const stepNum = index + 1;
        stepEl.classList.remove('active', 'completed');
        
        if (stepNum < step) {
          stepEl.classList.add('completed');
        } else if (stepNum === step) {
          stepEl.classList.add('active');
        }
      });
      
      // Update current step text
      const currentStepText = overlay.querySelector('#aiAnalysisCurrentStep .current-step-text');
      if (currentStepText && stepText) {
        currentStepText.textContent = stepText;
      }
      
      // Update active step description
      const activeStep = overlay.querySelector(`.progress-step[data-step="${step}"]`);
      if (activeStep && description) {
        const descEl = activeStep.querySelector('.step-description');
        if (descEl) {
          descEl.textContent = description;
        }
      }
      
      // Update progress bar
      const progressBar = overlay.querySelector('#aiAnalysisProgressBar');
      const progressPercentage = overlay.querySelector('#aiAnalysisProgressPercentage');
      const percentage = Math.min(100, (step / 5) * 100);
      
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
      }
      
      if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(percentage)}%`;
      }
      
      window.Logger?.debug('Progress overlay updated', { 
        page: 'ai-analysis', 
        step, 
        stepText, 
        percentage 
      });
    },
    
    /**
     * Hide progress overlay
     */
    hideProgressOverlay() {
      const overlay = document.getElementById('aiAnalysisProgressOverlay');
      if (overlay) {
        overlay.classList.add('d-none');
        overlay.style.display = 'none';
        
        // Reset progress
        const progressBar = overlay.querySelector('#aiAnalysisProgressBar');
        const progressPercentage = overlay.querySelector('#aiAnalysisProgressPercentage');
        if (progressBar) {
          progressBar.style.width = '0%';
          progressBar.setAttribute('aria-valuenow', 0);
        }
        if (progressPercentage) {
          progressPercentage.textContent = '0%';
        }
        
        // Reset all steps
        const steps = overlay.querySelectorAll('.progress-step');
        steps.forEach(stepEl => {
          stepEl.classList.remove('active', 'completed');
        });
        
        window.Logger?.debug('Progress overlay hidden', { page: 'ai-analysis' });
      }
    },
    
    setLoadingState(loading, btnId, textId, spinnerId, loadingMessage = null) {
      // Find button dynamically - Button System may change the ID
      let btn = document.getElementById(btnId);
      if (!btn && btnId === 'generateAnalysisBtnModal') {
        // Try to find button in modal form
        const form = document.getElementById('aiAnalysisFormModal');
        if (form) {
          btn = form.querySelector('button[type="submit"]');
          window.Logger?.debug('Found button dynamically in modal form', { 
            page: 'ai-analysis', 
            btnId: btn?.id || 'not found',
            found: !!btn
          });
        }
      } else if (!btn && btnId === 'generateAnalysisBtn') {
        // Try to find button in page form
        const form = document.getElementById('aiAnalysisForm');
        if (form) {
          btn = form.querySelector('button[type="submit"]');
          window.Logger?.debug('Found button dynamically in page form', { 
            page: 'ai-analysis', 
            btnId: btn?.id || 'not found',
            found: !!btn
          });
        }
      }
      
      const text = document.getElementById(textId);
      const spinner = document.getElementById(spinnerId);

      if (btn) {
        btn.disabled = loading;
        // Also add visual indication
        if (loading) {
          btn.setAttribute('aria-busy', 'true');
          btn.style.cursor = 'not-allowed';
          btn.style.opacity = '0.6';
          window.Logger?.debug('Button disabled and visual indication added', { 
            page: 'ai-analysis', 
            btnId: btn.id,
            loading,
            loadingMessage
          });
        } else {
          btn.removeAttribute('aria-busy');
          btn.style.cursor = '';
          btn.style.opacity = '';
          window.Logger?.debug('Button enabled and visual indication removed', { 
            page: 'ai-analysis', 
            btnId: btn.id
          });
        }
      } else {
        window.Logger?.warn('Button not found for setLoadingState', { 
          page: 'ai-analysis', 
          btnId, 
          textId,
          spinnerId,
          found: false,
          modalFormExists: !!document.getElementById('aiAnalysisFormModal'),
          pageFormExists: !!document.getElementById('aiAnalysisForm')
        });
      }

      if (text) {
        // Use CSS classes instead of inline styles
        if (loading) {
          text.classList.add('hide');
          text.classList.remove('btn-text');
        } else {
          text.classList.remove('hide');
          text.classList.add('btn-text');
        }
      }

      if (spinner) {
        // Use CSS classes instead of inline styles
        if (loading) {
          spinner.classList.add('show');
          spinner.classList.add('btn-spinner');
          // Update spinner text if loadingMessage provided
          if (loadingMessage && spinner.textContent !== undefined) {
            spinner.textContent = loadingMessage;
          }
        } else {
          spinner.classList.remove('show');
          spinner.classList.remove('btn-spinner');
          // Reset spinner text to default
          if (spinner.textContent !== undefined && spinner.id && spinner.id.includes('Modal')) {
            spinner.textContent = '⏳ יוצר ניתוח...';
          }
        }
      } else if (loading && loadingMessage) {
        // If spinner element doesn't exist, create a temporary one or show notification
        window.Logger?.warn('Spinner element not found, showing notification instead', { 
          page: 'ai-analysis', 
          spinnerId 
        });
      }
    },

    /**
     * Delete all analysis records
     * @returns {Promise<Object>} - Result with deleted_count
     */
    async deleteAllAnalyses() {
      try {
        if (!window.AIAnalysisData || !window.AIAnalysisData.deleteAllAnalyses) {
          throw new Error('AIAnalysisData.deleteAllAnalyses not available');
        }

        // Confirm deletion
        if (window.NotificationSystem) {
          const confirmed = await new Promise((resolve) => {
            if (typeof window.showConfirmDialog === 'function') {
              window.showConfirmDialog(
                'מחיקת כל הרשומות',
                'האם אתה בטוח שברצונך למחוק את כל רשומות הניתוח? פעולה זו אינה ניתנת לביטול.',
                () => resolve(true),
                () => resolve(false)
              );
            } else {
              // Fallback: use browser confirm
              if (window.showDeleteWarning) {
                window.showDeleteWarning(
                  'האם אתה בטוח שברצונך למחוק את כל רשומות הניתוח? פעולה זו אינה ניתנת לביטול.',
                  () => resolve(true),
                  () => resolve(false)
                );
              } else if (window.showConfirmationDialog) {
                window.showConfirmationDialog(
                  'מחיקת כל הרשומות',
                  'האם אתה בטוח שברצונך למחוק את כל רשומות הניתוח? פעולה זו אינה ניתנת לביטול.',
                  () => resolve(true),
                  () => resolve(false),
                  'danger'
                );
              } else {
                if (window.showDeleteWarning) {
                  window.showDeleteWarning(
                    'האם אתה בטוח שברצונך למחוק את כל רשומות הניתוח? פעולה זו אינה ניתנת לביטול.',
                    () => resolve(true),
                    () => resolve(false)
                  );
                } else if (window.showConfirmationDialog) {
                  window.showConfirmationDialog(
                    'מחיקת כל הרשומות',
                    'האם אתה בטוח שברצונך למחוק את כל רשומות הניתוח? פעולה זו אינה ניתנת לביטול.',
                    () => resolve(true),
                    () => resolve(false),
                    'danger'
                  );
                } else {
                  resolve(confirm('האם אתה בטוח שברצונך למחוק את כל רשומות הניתוח? פעולה זו אינה ניתנת לביטול.'));
                }
              }
            }
          });

          if (!confirmed) {
            return { status: 'cancelled', message: 'מחיקה בוטלה' };
          }
        }

        // Show loading
        if (window.NotificationSystem) {
          window.NotificationSystem.showInfo('מוחק את כל הרשומות...', 'system');
        }

        // Delete all analyses
        const result = await window.AIAnalysisData.deleteAllAnalyses();

        // Clear all AI analysis cache entries
        if (window.UnifiedCacheManager) {
          try {
            // Clear all response cache entries (ai-analysis-response-*)
            if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
              await window.UnifiedCacheManager.clearByPattern('ai-analysis-response-');
              window.Logger?.info('🧹 Cleared AI analysis response cache', { page: 'ai-analysis' });
            } else if (typeof window.UnifiedCacheManager.invalidate === 'function') {
              await window.UnifiedCacheManager.invalidate('ai-analysis-response-*');
              window.Logger?.info('🧹 Invalidated AI analysis response cache', { page: 'ai-analysis' });
            }
            
            // Clear history cache
            if (typeof window.UnifiedCacheManager.invalidate === 'function') {
              await window.UnifiedCacheManager.invalidate('ai-analysis-history');
              window.Logger?.info('🧹 Cleared AI analysis history cache', { page: 'ai-analysis' });
            }
          } catch (cacheError) {
            window.Logger?.warn('⚠️ Error clearing cache', { page: 'ai-analysis', error: cacheError });
          }
        }

        // Clear history and re-render
        this.history = [];
        this.renderHistory();

        // Update summary stats
        if (window.updatePageSummaryStats) {
          window.updatePageSummaryStats('ai-analysis', this.history);
        }

        // Show success
        if (window.NotificationSystem) {
          window.NotificationSystem.showSuccess(
            `נמחקו ${result.deleted_count || 0} רשומות והמטמון נוקה בהצלחה`,
            'business'
          );
        }

        window.Logger?.info('✅ All analyses deleted successfully', {
          page: 'ai-analysis',
          deletedCount: result.deleted_count || 0
        });

        return result;
      } catch (error) {
        window.Logger?.error('Error deleting all analyses', error, { page: 'ai-analysis' });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(
            `שגיאה במחיקת הרשומות: ${error.message || 'שגיאה לא ידועה'}`,
            'system'
          );
        }
        
        throw error;
      }
    },

    /**
     * Setup Page Visibility API listener to close modals when page returns from sleep/hidden
     */
    setupPageVisibilityListener() {
      if (typeof document === 'undefined' || !document.addEventListener) {
        return;
      }

      document.addEventListener('visibilitychange', () => {
        // When page becomes visible again after being hidden
        if (document.visibilityState === 'visible') {
          // Close any open modals using ModalManagerV2
          if (window.ModalManagerV2 && window.ModalManagerV2.hideModal) {
            // Get all currently open modals
            const openModals = document.querySelectorAll('.modal.show, .modal[style*="display: block"]');
            
            openModals.forEach(modal => {
              const modalId = modal.getAttribute('id');
              if (modalId) {
                window.Logger?.info('Closing modal after page visibility change', {
                  page: 'ai-analysis',
                  modalId
                });
                
                // Close modal using ModalManagerV2
                window.ModalManagerV2.hideModal(modalId);
              }
            });
          } else {
            // Fallback: Use Bootstrap modal API directly
            const openModals = document.querySelectorAll('.modal.show, .modal[style*="display: block"]');
            openModals.forEach(modal => {
              const bsModal = bootstrap?.Modal?.getInstance(modal);
              if (bsModal) {
                bsModal.hide();
              } else {
                // Direct hide if Bootstrap instance not available
                modal.style.display = 'none';
                modal.classList.remove('show');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                  backdrop.remove();
                }
              }
            });
          }
        }
      });
      
      window.Logger?.info('Page Visibility API listener setup for modal management', { page: 'ai-analysis' });
    },
  };

  // Expose to global scope
  window.AIAnalysisManager = AIAnalysisManager;

  // Initialization is handled by page-initialization-configs.js
  // No auto-initialization needed here - customInitializers will call init()
})();

