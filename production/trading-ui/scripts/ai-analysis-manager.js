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
     * Open template selection - redirects to wizard interface
     * @deprecated Old modal system removed - this function now only opens wizard
     */
    async openTemplateSelectionModal() {
      try {
        // Use new wizard interface (old modals removed)
        if (window.AIAnalysisWizard && typeof window.AIAnalysisWizard.openWizard === 'function') {
          await window.AIAnalysisWizard.openWizard('new');
          window.Logger?.info('AI Analysis Wizard opened', { page: 'ai-analysis' });
        } else {
          throw new Error('AI Analysis Wizard not available');
        }
      } catch (error) {
        window.Logger?.error('Error opening AI Analysis Wizard', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בפתיחת וויזארד ניתוח AI', 'system');
        }
      }
    },

    /**
     * Handle template selection - opens wizard with selected template
     * @deprecated Old modal system removed - this function now only opens wizard
     */
    async handleTemplateSelectionFromModal(templateId) {
      try {
        // Use new wizard interface (old modals removed)
        if (!window.AIAnalysisWizard || typeof window.AIAnalysisWizard.openWizard !== 'function') {
          throw new Error('AI Analysis Wizard not available');
        }

        // Ensure wizard is initialized
        if (!window.AIAnalysisWizard.initialized) {
          await window.AIAnalysisWizard.init();
        }

        // Ensure we have access to templates
        if (!window.AIAnalysisWizard.templates || window.AIAnalysisWizard.templates.length === 0) {
          window.AIAnalysisWizard.templates = await window.AIAnalysisData?.loadTemplates() || [];
        }

        // Convert templateId to number for comparison
        const id = typeof templateId === 'string' ? parseInt(templateId, 10) : templateId;
        const template = window.AIAnalysisWizard.templates.find((t) => t.id === id);
        
        if (!template) {
          window.Logger?.warn('Template not found', { page: 'ai-analysis', templateId: id });
          throw new Error('Template not found');
        }

        // Open wizard and select template
        await window.AIAnalysisWizard.openWizard('new');
        
        // Select template in wizard
        window.AIAnalysisWizard.handleTemplateSelection(id);

        window.Logger?.info('Template selected, wizard opened', { page: 'ai-analysis', templateId: id });
      } catch (error) {
        window.Logger?.error('Error selecting template', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בבחירת תבנית', 'system');
        }
      }
    },

    /**
     * Open variables modal (legacy - kept for compatibility but should use wizard)
     * @deprecated Old modal system removed - use AIAnalysisWizard.openWizard() instead
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
                
                // Populate trading accounts after form is rendered (if needed)
                const accountSelect = document.querySelector('#aiVariablesModal select[data-populate-accounts="true"]');
                if (accountSelect && window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
                  try {
                    window.Logger?.info('🔄 Populating trading accounts after modal shown', { 
                      page: 'ai-analysis', 
                      selectId: accountSelect.id 
                    });
                    
                    await window.SelectPopulatorService.populateAccountsSelect(accountSelect, {
                      includeEmpty: true,
                      emptyText: 'בחר חשבון מסחר...',
                      defaultFromPreferences: true // Use default from preferences
                    });
                    
                    accountSelect.removeAttribute('data-populate-accounts');
                    
                    window.Logger?.info('✅ Trading accounts populated after modal shown', { 
                      page: 'ai-analysis', 
                      selectId: accountSelect.id,
                      optionsCount: accountSelect.options.length 
                    });
                  } catch (error) {
                    window.Logger?.warn('Error populating trading accounts after modal shown', error, { page: 'ai-analysis' });
                  }
                }
                
                // Also handle text field for trading_account (convert to select if needed)
                const accountTextField = document.querySelector('#aiVariablesModal input[id*="trading_account"], #aiVariablesModal input[id*="account"]');
                if (accountTextField && accountTextField.type === 'text' && !accountTextField.parentElement.querySelector('select')) {
                  // Convert text field to select with accounts
                  try {
                    window.Logger?.info('🔄 Converting trading_account text field to select', { 
                      page: 'ai-analysis', 
                      fieldId: accountTextField.id 
                    });
                    
                    // Create select element
                    const accountSelect = document.createElement('select');
                    accountSelect.id = accountTextField.id;
                    accountSelect.className = accountTextField.className;
                    accountSelect.name = accountTextField.name || accountTextField.id;
                    accountSelect.required = accountTextField.required;
                    
                    // Replace text input with select
                    accountTextField.parentElement.replaceChild(accountSelect, accountTextField);
                    
                    // Populate with accounts
                    if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
                      await window.SelectPopulatorService.populateAccountsSelect(accountSelect, {
                        includeEmpty: true,
                        emptyText: 'בחר חשבון מסחר...',
                        defaultFromPreferences: true
                      });
                      
                      window.Logger?.info('✅ Trading accounts select created and populated', { 
                        page: 'ai-analysis', 
                        selectId: accountSelect.id,
                        optionsCount: accountSelect.options.length 
                      });
                    }
                  } catch (error) {
                    window.Logger?.warn('Error converting trading_account field to select', error, { page: 'ai-analysis' });
                  }
                }
                
                // Populate trading methods after form is rendered (if needed)
                const tradingMethodsSelect = document.querySelector('#aiVariablesModal select[data-populate-trading-methods="true"]');
                if (tradingMethodsSelect && typeof manager.populateTradingMethodsSelect === 'function') {
                  try {
                    window.Logger?.info('🔄 Populating trading methods after modal shown', { 
                      page: 'ai-analysis', 
                      selectId: tradingMethodsSelect.id 
                    });
                    
                    await manager.populateTradingMethodsSelect(tradingMethodsSelect);
                    
                    // Add "אחר" option after trading methods
                    const otherOption = document.createElement('option');
                    otherOption.value = '__other__';
                    otherOption.textContent = 'אחר';
                    tradingMethodsSelect.appendChild(otherOption);
                    
                    tradingMethodsSelect.removeAttribute('data-populate-trading-methods');
                    
                    window.Logger?.info('✅ Trading methods populated after modal shown', { 
                      page: 'ai-analysis', 
                      selectId: tradingMethodsSelect.id,
                      optionsCount: tradingMethodsSelect.options.length 
                    });
                  } catch (error) {
                    window.Logger?.warn('Error populating trading methods after modal shown', error, { page: 'ai-analysis' });
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
          
          // Add required asterisk if field is required
          if (variable.required) {
            const asterisk = document.createElement('span');
            asterisk.className = 'text-danger';
            asterisk.textContent = ' *';
            label.appendChild(asterisk);
          }

          // Check if this is a date_range field - use DateRangePickerService
          // Must check BEFORE creating select/text inputs
          const isDateRange = (variable.key === 'date_range' || variable.type === 'date-range') && 
                             window.DateRangePickerService;
          
          // Log for debugging
          if (variable.key === 'date_range') {
            window.Logger?.debug('Detected date_range field', {
              key: variable.key,
              type: variable.type,
              isDateRange: isDateRange,
              DateRangePickerServiceAvailable: !!window.DateRangePickerService,
              page: 'ai-analysis'
            });
          }
          
          let select, textInput;
          let isTextInput = false;
          let isDateRangeField = false;
          
          // If it's a date range field, skip select/text creation - will handle separately
          if (isDateRange) {
            // Use DateRangePickerService for date_range fields
            isDateRangeField = true;
            window.Logger?.debug('Setting isDateRangeField=true for date_range', {
              key: variable.key,
              type: variable.type,
              DateRangePickerServiceAvailable: !!window.DateRangePickerService,
              page: 'ai-analysis'
            });
            // Will render using DateRangePickerService.render() below - skip to that section
            // Don't create select or text input for date range fields
          } else {
            // Check if variable should be text input (text/number type without options)
            const shouldBeTextInput = (variable.type === 'text' || variable.type === 'number') && 
                                      (!variable.options || !Array.isArray(variable.options) || variable.options.length === 0) &&
                                      variable.key !== 'ticker_symbol' && 
                                      variable.key !== 'stock_ticker' &&
                                      variable.key !== 'trading_account' &&
                                      variable.key !== 'account_id' &&
                                      variable.integration !== 'trading_accounts';
          
            if (shouldBeTextInput) {
            // Create text/number input for simple fields (like single_trade_id)
            textInput = document.createElement('input');
            textInput.type = variable.type === 'number' ? 'number' : 'text';
            textInput.className = 'form-control';
            textInput.id = `var_modal_${variable.key}`;
            textInput.name = variable.key;
            if (variable.placeholder) {
              textInput.placeholder = variable.placeholder;
            }
            if (variable.default_value) {
              textInput.value = variable.default_value;
            }
            if (variable.required) {
              textInput.required = true;
            }
              isTextInput = true;
            } else {
              // Always create a select dropdown with "אחר" option
              select = document.createElement('select');
              select.className = 'form-select';
              select.id = `var_modal_${variable.key}`;
              select.name = variable.key;
            }
          }
          
          // Skip select/text handling if it's a date range field (will be handled separately)
          if (!isDateRangeField) {
            // Add empty option (only if not using tickers or accounts - they will add their own)
            // Skip if this is a text input field
            if (!isTextInput) {
              const isTickerField = (variable.key === 'ticker_symbol' || variable.key === 'stock_ticker') &&
                                    window.SelectPopulatorService && 
                                    typeof window.SelectPopulatorService.populateTickersSelect === 'function';
              
              const isAccountField = (variable.key === 'trading_account' || variable.key === 'account_id' || variable.integration === 'trading_accounts') &&
                                     window.SelectPopulatorService && 
                                     typeof window.SelectPopulatorService.populateAccountsSelect === 'function';
              
              if (!isTickerField && !isAccountField) {
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = 'בחר...';
                select.appendChild(emptyOption);
              }
            }

            // Populate options based on variable type and key (only for select fields)
          let options = [];
          
          if (variable.key === 'investment_type' && window.VALID_INVESTMENT_TYPES) {
            // Use Investment Types from system
            options = window.VALID_INVESTMENT_TYPES.map(type => ({
              value: type,
              label: window.INVESTMENT_TYPE_LABELS?.[type] || type
            }));
          } else if (variable.integration === 'trading_methods' || variable.key === 'technical_indicators' || variable.key === 'condition_focus') {
            // Use Trading Methods from system - populate directly using populateTradingMethodsSelect
            // Mark for later population after select is added to DOM
            select.setAttribute('data-populate-trading-methods', 'true');
            // Don't populate options array here - will be populated directly in select element
          } else if (variable.integration === 'trading_accounts' || variable.key === 'trading_account' || variable.key === 'account_id') {
            // Use Trading Accounts from system - populate directly using SelectPopulatorService
            if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
              // Mark for later population after select is added to DOM
              select.setAttribute('data-populate-accounts', 'true');
            } else {
              // Fallback: get accounts manually
              try {
                const response = await fetch('/api/trading-accounts/open');
                const data = await response.json();
                const accounts = data.data || data || [];
                options = accounts.filter(acc => acc.status === 'open').map(account => ({
                  value: account.id.toString(),
                  label: account.name || `Account #${account.id}`
                }));
              } catch (error) {
                window.Logger?.warn('Error loading trading accounts', error, { page: 'ai-analysis' });
                options = [];
              }
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
          } else if (variable.key === 'trading_account' || variable.key === 'account_id') {
            // Use Trading Accounts from system - populate directly using SelectPopulatorService
            if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
              // Mark for later population after select is added to DOM
              select.setAttribute('data-populate-accounts', 'true');
            } else {
              // Fallback: get accounts manually
              try {
                const response = await fetch('/api/trading-accounts/open');
                const data = await response.json();
                const accounts = data.data || data || [];
                options = accounts.filter(acc => acc.status === 'open').map(account => ({
                  value: account.id.toString(),
                  label: account.name || `Account #${account.id}`
                }));
              } catch (error) {
                window.Logger?.warn('Error loading trading accounts', error, { page: 'ai-analysis' });
                options = [];
              }
            }
          } else if (variable.options && Array.isArray(variable.options)) {
            // Use provided options
            options = variable.options.map(option => ({
              value: typeof option === 'string' ? option : option.value,
              label: typeof option === 'string' ? option : option.label || option.value
            }));
          } else if (variable.type === 'select' && variable.options) {
            // Already handled above
          }

          // Add all options to select (only if not using tickers, trading methods, or accounts integration)
          // Skip if this is a text input field
          if (!isTextInput) {
            const needsTickerPopulation = select.getAttribute('data-populate-tickers') === 'true';
            const needsTradingMethodsPopulation = select.getAttribute('data-populate-trading-methods') === 'true';
            const needsAccountsPopulation = select.getAttribute('data-populate-accounts') === 'true';
            
            if (!needsTickerPopulation && !needsTradingMethodsPopulation && !needsAccountsPopulation) {
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
          }

            // Create hidden text/textarea input for "אחר" value (only for select fields)
            let otherInput;
            if (!isTextInput) {
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

            // Set default value if provided (only for select fields)
            if (!isTextInput) {
              if (variable.default_value) {
                select.value = variable.default_value;
              }

              if (variable.required) {
                select.required = true;
              }
            }

            // Handle conditional display (e.g., single_trade_id depends on trade_selection_type)
            if (variable.conditional_display) {
              const dependsOn = variable.conditional_display.depends_on;
              const showWhen = variable.conditional_display.show_when;
              
              // Initially hide if conditional
              col.style.display = 'none';
              
              // Find the dependent field
              const dependentSelect = document.getElementById(`var_modal_${dependsOn}`) || document.getElementById(`var_${dependsOn}`);
              if (dependentSelect) {
                // Handler function to show/hide based on dependency
                const updateVisibility = () => {
                  if (dependentSelect.value === showWhen) {
                    col.style.display = '';
                  } else {
                    col.style.display = 'none';
                    // Clear value when hidden
                    if (select) select.value = '';
                    if (textInput) textInput.value = '';
                  }
                };
                
                // Set initial visibility
                updateVisibility();
                
                // Add listener for changes
                dependentSelect.addEventListener('change', updateVisibility);
              }
            }

            // Append to container based on type (only if not date range field)
            if (!isDateRangeField) {
              if (isTextInput) {
                // For text input, just add label and input
                col.appendChild(label);
                col.appendChild(textInput);
                container.appendChild(col);
              } else {
                // For select, add label, select, and other input
                col.appendChild(label);
                col.appendChild(select);
                if (otherInput) {
                  col.appendChild(otherInput);
                }
                container.appendChild(col);
              }
            }
          }
          
          // Handle date range fields separately (MUST handle after select/text to avoid creating select)
          if (isDateRangeField && window.DateRangePickerService) {
            // Create col if not already created (since we skipped select/text creation)
            // col should already exist from line 838, but check anyway
            if (!col || col.parentNode) {
              // If col already appended, create new one
              col = document.createElement('div');
              col.className = 'col-md-4 mb-3';
            }
            
            // Render date range picker using DateRangePickerService
            const dateRangeConfig = {
              id: `var_modal_${variable.key}`,
              label: variable.label || variable.key,
              required: variable.required || false,
              defaultValue: variable.default_value || '',
              onChange: null
            };
            
            const dateRangeHTML = window.DateRangePickerService.render(dateRangeConfig);
            // Replace col content with date range picker HTML (includes label with asterisk)
            col.innerHTML = dateRangeHTML;
            
            // Handle conditional display
            if (variable.conditional_display) {
              const dependsOn = variable.conditional_display.depends_on;
              const showWhen = variable.conditional_display.show_when;
              
              col.style.display = 'none';
              
              const dependentSelect = document.getElementById(`var_modal_${dependsOn}`) || document.getElementById(`var_${dependsOn}`);
              if (dependentSelect) {
                const updateVisibility = () => {
                  if (dependentSelect.value === showWhen) {
                    col.style.display = '';
                  } else {
                    col.style.display = 'none';
                  }
                };
                updateVisibility();
                dependentSelect.addEventListener('change', updateVisibility);
              }
            }
            
            container.appendChild(col);
            
            // Initialize date range picker after a short delay
            setTimeout(() => {
              window.DateRangePickerService.initialize(dateRangeConfig.id);
            }, 100);
          }

          // Populate tickers select if needed (after element is in DOM)
          // Store reference for later population after modal is shown
          // Only check if select exists (not for text inputs)
          if (!isTextInput && select && select.getAttribute('data-populate-tickers') === 'true') {
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
                if (select && select.id) {
                  const selectEl = document.getElementById(select.id);
                  if (selectEl) {
                    const otherOption = document.createElement('option');
                    otherOption.value = '__other__';
                    otherOption.textContent = 'אחר';
                    selectEl.appendChild(otherOption);
                  }
                }
              }
            }, 200); // Small delay to ensure DOM is ready
          }
        } // End of for loop
      } // End of try block
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
        const response = await fetch('/api/trade-plans/', { });
        
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
            } else if (variable.integration === 'trading_methods' || variable.key === 'technical_indicators' || variable.key === 'condition_focus') {
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
                textField: (method) => method.name_he || method.name_en || method.name || `Method #${method.id}`,
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
        // Note: populateGenericSelect expects an ID string (without #), not an element
        // So we need to use it with the element's ID or use direct API call
        if (window.SelectPopulatorService?.populateGenericSelect && select.id) {
          try {
            await window.SelectPopulatorService.populateGenericSelect(select.id, '/api/trading-methods/', {
              valueField: 'id',
              textField: (method) => method.name_he || method.name_en || method.name || `Method #${method.id}`,
              includeEmpty: true,
              emptyText: 'בחר שיטת מסחר...'
            });
            window.Logger?.debug('Trading methods loaded via SelectPopulatorService.populateGenericSelect', { page: 'ai-analysis' });
            return;
          } catch (error) {
            window.Logger?.warn('Error using populateGenericSelect, falling back to direct API', error, { page: 'ai-analysis' });
          }
        }

        // Fallback to direct API call
        window.Logger?.debug('Loading trading methods via direct API call', { page: 'ai-analysis' });
        const response = await fetch('/api/trading-methods/');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data && data.data.length > 0) {
            // Clear existing options except empty one
            while (select.options.length > 0) {
              select.remove(0);
            }
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'בחר שיטת מסחר...';
            select.appendChild(emptyOption);
            
            // Add methods
            data.data.forEach((method) => {
              const optionEl = document.createElement('option');
              optionEl.value = method.id;
              optionEl.textContent = method.name_he || method.name_en || method.name || `Method #${method.id}`;
              select.appendChild(optionEl);
            });
            
            window.Logger?.info('Trading methods loaded via direct API call', {
              page: 'ai-analysis',
              count: data.data.length
            });
          } else {
            window.Logger?.warn('API returned no trading methods', { page: 'ai-analysis', responseData: data });
          }
        } else {
          window.Logger?.warn('Failed to fetch trading methods from API', {
            page: 'ai-analysis',
            status: response.status,
            statusText: response.statusText
          });
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
        
        // Collect date_range from DateRangePickerService if available
        const dateRangeFieldId = 'var_modal_date_range';
        if (window.DateRangePickerService && document.querySelector(`[data-date-range-picker-id="${dateRangeFieldId}"]`)) {
          const dateRangeValue = window.DateRangePickerService.getRangeString(dateRangeFieldId);
          if (dateRangeValue) {
            variables['date_range'] = dateRangeValue;
          }
        }
        
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

      // Build v2.0 structure: Separate prompt_variables from filters
      // Filters that should NOT be sent to LLM: trading_account, trading_account_id, account_id
      // These are stored in filters for future analysis but not sent in prompt
      const prompt_variables = {};
      const filters = {};
      const trade_selection = {};
      
      // Define which variables are filters (not sent to LLM)
      const filterKeys = ['trading_account', 'trading_account_id', 'account_id'];
      
      // Handle trade_selection_type and related fields
      const tradeSelectionType = variables['trade_selection_type'] || 'all';
      
      // Separate variables into prompt_variables and filters
      Object.keys(variables).forEach(key => {
        if (filterKeys.includes(key)) {
          // Convert to trading_account_id if needed for backend
          if (key === 'trading_account') {
            filters['trading_account_id'] = variables[key];
          } else {
            filters[key] = variables[key];
          }
        } else if (key === 'trade_selection_type') {
          // Store in trade_selection
          trade_selection['type'] = variables[key];
        } else if (key === 'single_trade_id') {
          // Store in trade_selection if single trade is selected
          if (tradeSelectionType === 'single' && variables[key]) {
            trade_selection['trade_id'] = parseInt(variables[key], 10);
          }
        } else if (key === 'response_language') {
          // response_language is kept in prompt_variables but handled separately in backend
          prompt_variables[key] = variables[key];
        } else {
          // All other variables go to prompt_variables
          prompt_variables[key] = variables[key];
        }
      });
      
      // Build v2.0 structure
      const variables_v2 = {
        version: '2.0',
        prompt_variables: prompt_variables,
        filters: filters,
        trade_selection: trade_selection,
        metadata: {
          analysis_scope: this.selectedTemplate.name || 'unknown',
          filters_applied: Object.keys(filters),
          trade_selection_type: tradeSelectionType
        }
      };
      
      // Use v2.0 structure for API call
      variables = variables_v2;
      
      window.Logger?.debug('Built v2.0 variables structure', {
        page: 'ai-analysis',
        prompt_variables_count: Object.keys(prompt_variables).length,
        filters_count: Object.keys(filters).length,
        filters: Object.keys(filters)
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
          }, body: JSON.stringify({
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
            
            // Save response_text to cache IMMEDIATELY (before reloadFn is called) - ALWAYS save
            if (result.id && result.response_text) {
              const cacheKey = `ai-analysis-response-${result.id}`;
              if (window.UnifiedCacheManager) {
                // Always save to cache (even if exists) to ensure data is up to date
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
            // Check for specific error codes and extract user-friendly messages
            let errorMessage = crudResult?.error?.message || crudResult?.message || 'שגיאה לא ידועה ביצירת הניתוח';
            const errorCode = responseData?.error_code || crudResult?.error?.code;
            
            // Use error code mapping if available
            if (errorCode && responseData?.error_message) {
              errorMessage = responseData.error_message;
            } else if (errorCode && crudResult?.error?.user_message) {
              errorMessage = crudResult.error.user_message;
            }
            
            // Hide progress overlay on error
            this.hideProgressOverlay();
            
            // Reset loading state on error
            if (isModal) {
              this.setLoadingState(false, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal');
            } else {
              this.setLoadingState(false, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner');
            }
            
            window.Logger?.error('❌ Analysis generation failed', {
              page: 'ai-analysis',
              error: errorMessage,
              errorCode: errorCode,
              crudResult
            });
            
            if (window.NotificationSystem) {
              window.NotificationSystem.showError(
                errorMessage,
                'system',
                { duration: 10000 }
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
            
            // Save response_text to cache - ALWAYS save, even if exists (to update timestamp)
            if (result.id && result.response_text) {
              const cacheKey = `ai-analysis-response-${result.id}`;
              if (window.UnifiedCacheManager) {
                // Always save to cache (even if exists) to ensure data is up to date
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
        
        // Extract error message and code
        let errorMessage = error?.message || 'שגיאה לא ידועה';
        let errorCode = error?.errorCode || null;
        let errorAction = error?.errorAction || null;
        
        // Reset loading state on error
        if (isModal) {
          this.setLoadingState(false, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal');
        } else {
          this.setLoadingState(false, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner');
        }
        
        // If error has errorCode, use the message from error (already user-friendly)
        // Otherwise, try to extract from error response
        if (error?.response) {
          try {
            const errorData = await error.response.json().catch(() => ({}));
            // Prefer user-friendly error message from server
            if (errorData.error_message || errorData.message) {
              errorMessage = errorData.error_message || errorData.message;
            }
            if (errorData.error_code && !errorCode) {
              errorCode = errorData.error_code;
            }
            if (errorData.action && !errorAction) {
              errorAction = errorData.action;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
        
        // Show detailed error notification with error code if available
        let notificationMessage = `❌ הניתוח נכשל: ${errorMessage}`;
        if (errorCode) {
          window.Logger?.info?.('Error code detected', { page: 'ai-analysis', errorCode, errorAction });
          // Error message is already user-friendly, just show it
        }
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(
            notificationMessage,
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
              error_code: errorCode,
              error_action: errorAction,
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
        
        // Parse error message to extract error code and detailed info
        let errorCode = null;
        let displayMessage = errorMessage;
        let provider = analysisResult.provider || null;
        let resetTime = null;
        let retryAfter = null;
        
        // Extract error code from format "ERROR_CODE: message" or just use message
        if (errorMessage.includes(': ')) {
          const parts = errorMessage.split(': ', 2);
          if (parts.length >= 2 && parts[0].startsWith('AI_')) {
            errorCode = parts[0];
            displayMessage = parts[1];
          }
        }
        
        // Build detailed error message
        let detailedMessage = displayMessage;
        const details = [];
        
        // Add provider info if available
        if (provider) {
          const providerNames = {
            'gemini': 'Gemini',
            'perplexity': 'Perplexity'
          };
          details.push(`מנוע AI: ${providerNames[provider] || provider}`);
        }
        
        // Add reset time if available (from error_data_json or metadata)
        if (analysisResult.error_data_json) {
          try {
            const errorData = JSON.parse(analysisResult.error_data_json);
            if (errorData.reset_time) {
              resetTime = errorData.reset_time;
            }
            if (errorData.retry_after_minutes) {
              retryAfter = errorData.retry_after_minutes;
            }
            if (errorData.provider && !provider) {
              provider = errorData.provider;
              const providerNames = {
                'gemini': 'Gemini',
                'perplexity': 'Perplexity'
              };
              details.push(`מנוע AI: ${providerNames[provider] || provider}`);
            }
          } catch (e) {
            window.Logger?.warn('Error parsing error_data_json', { error: e, page: 'ai-analysis' });
          }
        }
        
        if (resetTime) {
          try {
            const resetDate = new Date(resetTime);
            const formattedTime = resetDate.toLocaleString('he-IL', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
            details.push(`המכסה מתאפסת ב: ${formattedTime}`);
          } catch (e) {
            details.push(`המכסה מתאפסת ב: ${resetTime}`);
          }
        } else if (retryAfter !== null) {
          details.push(`ניתן לנסות שוב בעוד: ${retryAfter} דקות`);
        }
        
        // Add action link based on error code
        if (errorCode && (errorCode === 'AI_1007' || errorCode === 'AI_1004')) {
          // Quota exceeded or rate limit - suggest checking settings
          details.push('<a href="preferences.html#ai-settings" class="text-white text-decoration-underline">לבדיקת הגדרות מכסה ומפתחות API</a>');
        }
        
        // Check if error message is in English - if so, apply LTR direction
        const isEnglish = /^[a-zA-Z]/.test(displayMessage.trim()) || /[a-zA-Z]{3,}/.test(displayMessage);
        
        container.textContent = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        
        const h5 = document.createElement('h5');
        h5.textContent = '❌ הניתוח נכשל';
        alert.appendChild(h5);
        
        // Main error message
        const p = document.createElement('p');
        p.innerHTML = `<strong>${displayMessage}</strong>`;
        // Apply LTR direction for English messages
        if (isEnglish) {
          p.style.direction = 'ltr';
          p.style.textAlign = 'left';
        }
        alert.appendChild(p);
        
        // Add details section if we have additional info
        if (details.length > 0) {
          const detailsDiv = document.createElement('div');
          detailsDiv.className = 'mt-3';
          detailsDiv.style.fontSize = '0.9rem';
          const detailsTitle = document.createElement('strong');
          detailsTitle.textContent = 'פרטים נוספים:';
          detailsDiv.appendChild(detailsTitle);
          const detailsList = document.createElement('ul');
          detailsList.className = 'mb-0 mt-2';
          detailsList.style.paddingRight = '1.5rem';
          details.forEach(detail => {
            const li = document.createElement('li');
            li.innerHTML = detail;
            detailsList.appendChild(li);
          });
          detailsDiv.appendChild(detailsList);
          alert.appendChild(detailsDiv);
        }
        
        // Add request ID
        if (analysisResult.id) {
          const small = document.createElement('small');
          small.className = 'd-block mt-2';
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
          const response = await fetch(`/api/ai-analysis/history/${analysisResult.id}`, { });
          
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
                // Always save to cache (even if exists) to ensure data is up to date
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
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="טיקר" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 2)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="מנוע" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 3)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="סטטוס" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 4)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="נוצר ב" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 5)"></button>
                </th>
                <th>אובייקט משתמש</th>
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
              // UnifiedCacheManager.get() searches all layers automatically in order:
              // memory -> localStorage -> indexedDB -> backend
              // No need to specify layer - it will search all layers automatically
              const cachedData = await window.UnifiedCacheManager.get(cacheKey);
              
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
                has_db: false,  // Will be updated from API response
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
                has_db: false,  // Will be updated from API response
                has_note: false,
                note_id: null
              };
            }
          });
          
          const cacheResults = await Promise.all(cachePromises);
          cacheResults.forEach(result => {
            cacheChecks[result.id] = {
              has_cache: result.has_cache,
              has_db: result.has_db || false,  // Will be updated from API response
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
            }, body: JSON.stringify({ analysis_ids: analysisIds })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data) {
              // Merge cache, note, and DB availability
              for (const id of analysisIds) {
                const apiData = data.data[id] || {};
                if (cacheChecks[id]) {
                  cacheChecks[id].has_note = apiData.has_note || false;
                  cacheChecks[id].note_id = apiData.note_id || null;
                  cacheChecks[id].has_db = apiData.has_db || false;
                } else {
                  cacheChecks[id] = {
                    has_cache: false,
                    has_db: apiData.has_db || false,
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
            if (cacheChecks[item.id].has_cache || cacheChecks[item.id].has_db || cacheChecks[item.id].has_note) {
              availableCount++;
            }
          } else if (item.status === 'completed') {
            // For completed items, initialize availability even if not checked
            // Default to has_db: true for completed items (will be verified when viewing)
            item._availability = {
              has_cache: false,
              has_db: true,  // Completed analyses should have response_text in DB
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
     * Now uses wizard interface in rerun mode
     */
    async rerunAnalysis(analysisId) {
      try {
        // Find the analysis in history
        let analysis = this.history.find(h => h.id === analysisId);
        if (!analysis) {
          // Try to load from API
          const response = await fetch(`/api/ai-analysis/history/${analysisId}`, { });
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
        
        // Use wizard in rerun mode
        if (window.AIAnalysisWizard && typeof window.AIAnalysisWizard.openWizard === 'function') {
          await window.AIAnalysisWizard.openWizard('rerun', analysis);
          window.Logger?.info('AI Analysis Wizard opened in rerun mode', { analysisId, page: 'ai-analysis' });
        } else {
          // Fallback to old method
          await this.rerunAnalysisWithData(analysis);
        }
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

        // Show progress overlay IMMEDIATELY (same as new analysis)
        this.showProgressOverlay(1, 'מתחיל תהליך הרצה מחדש...', 'מאתחל את המערכת ומכין את הנתונים');
        
        // Force a small delay to ensure UI updates are visible
        await new Promise(resolve => setTimeout(resolve, 50));

        // Validate request before generating analysis using Business Logic Layer
        if (window.AIAnalysisData?.validateAnalysisRequest) {
          try {
            window.Logger?.info?.('🔍 Validating analysis request before rerun...', { 
              page: 'ai-analysis',
              templateId: templateId,
              provider: provider,
              variables: variables,
              variablesType: typeof variables,
              variablesKeys: variables ? Object.keys(variables) : []
            });
            
            // Update progress overlay to step 2
            this.showProgressOverlay(2, 'מאמת נתונים...', 'בודק תקינות הנתונים והגדרות');
            
            const validationData = {
              template_id: templateId,
              variables: variables,
              provider: provider
            };
            
            window.Logger?.debug?.('📤 Sending validation request', {
              page: 'ai-analysis',
              validationData: validationData
            });
            
            const validationResult = await window.AIAnalysisData.validateAnalysisRequest(validationData);
            
            window.Logger?.debug?.('📥 Received validation result', {
              page: 'ai-analysis',
              validationResult: validationResult,
              isValid: validationResult?.is_valid,
              errors: validationResult?.errors
            });

            if (!validationResult.is_valid) {
              // Extract error messages - handle both array and single message
              let errorMessages = [];
              if (validationResult.errors) {
                if (Array.isArray(validationResult.errors)) {
                  errorMessages = validationResult.errors;
                } else if (typeof validationResult.errors === 'string') {
                  errorMessages = [validationResult.errors];
                }
              }
              
              const errorMessage = errorMessages.length > 0 
                ? errorMessages.join('\n')
                : 'שגיאת ולידציה לא ידועה';
              
              window.Logger?.warn?.('⚠️ Validation failed before rerun', {
                page: 'ai-analysis',
                validationResult: validationResult,
                errors: validationResult.errors,
                errorMessages: errorMessages,
                templateId: templateId,
                provider: provider,
                variables: variables
              });
              
              // Hide progress overlay on error
              this.hideProgressOverlay();
              
              if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                  'שגיאת ולידציה:\n' + errorMessage,
                  'system'
                );
              }
              return;
            }
            
            window.Logger?.info?.('✅ Validation passed for rerun', { page: 'ai-analysis' });
            
            // Update progress overlay to step 3
            this.showProgressOverlay(3, 'שולח בקשה למנוע AI...', 'מתחבר למנוע ומעביר את הנתונים');
          } catch (validationError) {
            window.Logger?.error?.('❌ Error during validation for rerun', {
              page: 'ai-analysis',
              error: validationError?.message || validationError,
            });
            
            // Hide progress overlay on error
            this.hideProgressOverlay();
            
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
          window.NotificationSystem.showInfo('📤 שולח בקשה לשרת... ממתין לתגובת המנוע', 'system', { duration: 8000 });
        }

        // Update progress overlay to step 4
        this.showProgressOverlay(4, 'ממתין לתגובת המנוע...', 'המנוע מעבד את הבקשה - זה עלול לקחת 30-60 שניות');

        // Call generate API
        const apiUrl = window.API_BASE_URL 
          ? (window.API_BASE_URL.endsWith('/') ? window.API_BASE_URL : `${window.API_BASE_URL}/`) + 'api/ai-analysis/generate'
          : '/api/ai-analysis/generate';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, body: JSON.stringify({
            template_id: templateId,
            variables: variables,
            provider: provider
          })
        });

        // Check if response is OK
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.error?.message) {
              errorMessage = errorData.error.message;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
          
          window.Logger?.error('Rerun API call failed', {
            page: 'ai-analysis',
            status: response.status,
            statusText: response.statusText,
            errorMessage
          });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(
              `שגיאה בהרצה חוזרת: ${errorMessage}`,
              'system'
            );
          }
          
          // Hide progress overlay on error
          this.hideProgressOverlay();
          
          return;
        }

        // Update progress overlay to step 5
        this.showProgressOverlay(5, 'מעבד תוצאות...', 'מכין את הדוח הסופי ושומר במטמון');

        // Read response and save pendingResult BEFORE calling CRUDResponseHandler (same as handleGenerateAnalysis)
        const responseClone = response.clone();
        let responseData = null;
        let result = null;
        
        try {
          responseData = await response.json();
          
          // Check if response indicates failure
          if (responseData.status === 'error' || (responseData.status === 'success' && responseData.data && responseData.data.status === 'failed')) {
            const errorMessage = responseData.data?.error_message || responseData.error?.message || responseData.message || 'הניתוח נכשל';
            
            window.Logger?.warn('Rerun analysis failed', {
              page: 'ai-analysis',
              status: responseData.status,
              errorMessage,
              errorData: responseData.error
            });
            
            if (window.NotificationSystem) {
              window.NotificationSystem.showError(
                `שגיאה בהרצה חוזרת: ${errorMessage}`,
                'system'
              );
            }
            
            // Hide progress overlay on error
            this.hideProgressOverlay();
            
            return;
          }
          
          // Extract result from response
          if (responseData.status === 'success' && responseData.data) {
            result = responseData.data;
            
            // Check if result status is failed
            if (result.status === 'failed') {
              const errorMessage = result.error_message || 'הניתוח נכשל';
              
              window.Logger?.warn('Rerun analysis result is failed', {
                page: 'ai-analysis',
                requestId: result.id,
                errorMessage
              });
              
              if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                  `הניתוח נכשל: ${errorMessage}`,
                  'system'
                );
              }
              
              // Hide progress overlay on failure
              this.hideProgressOverlay();
              
              // Still show the failed result in modal
              this.currentAnalysis = result;
              await this.openResultsModal(result);
              return;
            }
            
            // Store result for display after reload - MUST be set BEFORE reloadFn is called
            this.pendingResult = result;
            
            window.Logger?.info('✅ Analysis rerun successfully - storing pending result', {
              page: 'ai-analysis',
              requestId: result.id,
              status: result.status,
              hasResponseText: !!result.response_text,
              pendingResultSet: !!this.pendingResult
            });
            
            // Save response_text to cache IMMEDIATELY (before reloadFn is called) - ALWAYS save
            if (result.id && result.response_text) {
              const cacheKey = `ai-analysis-response-${result.id}`;
              if (window.UnifiedCacheManager) {
                // Always save to cache (even if exists) to ensure data is up to date
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
              }
            }
          }
        } catch (error) {
          window.Logger?.error('Error reading response before CRUDResponseHandler', {
            page: 'ai-analysis',
            error: error?.message || error
          });
        }

        // Use CRUDResponseHandler if available (same flow as handleGenerateAnalysis)
        if (window.CRUDResponseHandler && typeof window.CRUDResponseHandler.handleSaveResponse === 'function') {
          // Now call CRUDResponseHandler with cloned response
          const crudResult = await window.CRUDResponseHandler.handleSaveResponse(responseClone, {
              modalId: null, // No modal to close for rerun
              successMessage: 'ניתוח נוצר מחדש בהצלחה!',
              entityName: 'ניתוח AI',
              reloadFn: async () => {
                // Reload history after successful analysis creation
                this.history = await window.AIAnalysisData?.loadHistory({ force: true }) || [];
                
                // Update availability for pending result immediately in history (before full check)
                if (this.pendingResult && this.pendingResult.id) {
                  const historyItem = this.history.find(h => h.id === this.pendingResult.id);
                  if (historyItem) {
                    historyItem._availability = {
                      has_cache: true,
                      has_note: false,
                      note_id: null
                    };
                    // Ensure response_text is available from pendingResult
                    if (this.pendingResult.response_text && !historyItem.response_text) {
                      historyItem.response_text = this.pendingResult.response_text;
                    }
                  }
                }
                
                // Check availability AFTER cache is saved (give it a moment for cache to be fully written)
                await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay to ensure cache is saved
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
                  
                  // Ensure we have response_text from pendingResult if not in updatedResult
                  if (!updatedResult.response_text && this.pendingResult.response_text) {
                    updatedResult.response_text = this.pendingResult.response_text;
                  }
                  
                  // Hide progress overlay before opening results modal
                  this.hideProgressOverlay();
                  
                  await this.openResultsModal(updatedResult);
                  this.pendingResult = null; // Clear pending result
                } else {
                  window.Logger?.warn('⚠️ No pending result to display after rerun', {
                    page: 'ai-analysis',
                    pendingResult: this.pendingResult,
                    historyLength: this.history.length
                  });
                }
              },
              requiresHardReload: false,
            });

            // Verify result from CRUDResponseHandler matches what we read
            if (crudResult && crudResult.status === 'success' && crudResult.data) {
              if (!result) {
                result = crudResult.data;
                this.pendingResult = result;
              }
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
                // Always save to cache (even if exists) to ensure data is up to date
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
          
            // Hide progress overlay before opening results modal
            this.hideProgressOverlay();
            
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
        // Hide progress overlay on error
        this.hideProgressOverlay();
        
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
        const response = await fetch(`/api/ai-analysis/history/${analysisId}/availability`, { });
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

      // Ticker - Extract from variables_json (stored as simple key-value dictionary)
      const tickerCell = document.createElement('td');
      let tickerSymbol = '-';
      try {
        if (item.variables_json) {
          let variables = item.variables_json;
          
          // Parse if it's a string
          if (typeof variables === 'string') {
            variables = JSON.parse(variables);
          }
          
          // Variables are stored as simple dictionary: { "stock_ticker": "TSLA", ... }
          // Try to find ticker in variables (can be stock_ticker, ticker_symbol, etc.)
          if (variables && typeof variables === 'object') {
            tickerSymbol = variables.stock_ticker || 
                          variables.ticker_symbol || 
                          '-';
            
            // Clean up ticker symbol if it contains " - " (e.g., "TSLA - Tesla, Inc." -> "TSLA")
            if (tickerSymbol && tickerSymbol !== '-' && typeof tickerSymbol === 'string' && tickerSymbol.includes(' - ')) {
              tickerSymbol = tickerSymbol.split(' - ')[0].trim();
            }
          }
        }
      } catch (error) {
        window.Logger?.warn('Error extracting ticker from variables_json', { page: 'ai-analysis', error, itemId: item.id });
      }
      tickerCell.textContent = tickerSymbol || '-';
      row.appendChild(tickerCell);

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

      // User Object (Note) - Show link if saved as note
      const userObjectCell = document.createElement('td');
      userObjectCell.className = 'col-user-object';
      const availability = item._availability || { has_cache: false, has_note: false, note_id: null };
      
      if (availability.has_note && availability.note_id) {
        // Create link to note
        const noteLink = document.createElement('a');
        noteLink.href = '#';
        noteLink.className = 'entity-link';
        noteLink.textContent = `📝 הערה #${availability.note_id}`;
        noteLink.setAttribute('title', 'צפה בהערה');
        noteLink.onclick = (e) => {
          e.preventDefault();
          if (typeof window.showEntityDetails === 'function') {
            window.showEntityDetails('note', availability.note_id, { mode: 'view' });
          } else if (typeof viewNote === 'function') {
            viewNote(availability.note_id);
          }
        };
        userObjectCell.appendChild(noteLink);
      } else {
        userObjectCell.textContent = '-';
      }
      row.appendChild(userObjectCell);

      // Actions - Use createActionsMenu like other pages
      const actionsCell = document.createElement('td');
      actionsCell.className = 'actions-cell';
      
      // Build actions menu items
      const actionsMenuItems = [];
      
      // Always add "Re-run" action
      actionsMenuItems.push({
        type: 'RERUN',
        onclick: `window.AIAnalysisManager.rerunAnalysis(${item.id})`,
        title: 'הרצה חוזרת של הניתוח לקבלת משוב עדכני מהמנוע'
      });
      
      // Add "View Results" for completed analyses
      if (item.status === 'completed') {
        let viewTooltip = 'התוצאות יטענו מבסיס הנתונים (תמיד זמינות)';
        if (availability.has_note && availability.note_id) {
          viewTooltip = `נשמר כהערה (מזהה: ${availability.note_id})`;
        } else if (availability.has_cache) {
          viewTooltip = 'התוצאות זמינות במטמון';
        }
        
        actionsMenuItems.push({
          type: 'VIEW',
          onclick: `window.AIAnalysisManager.viewHistoryItem(${item.id})`,
          title: viewTooltip
        });
      }
      
      // Always add "Delete" action
      actionsMenuItems.push({
        type: 'DELETE',
        onclick: `window.AIAnalysisManager.deleteAnalysis(${item.id})`,
        title: 'מחק ניתוח זה'
      });
      
      // Use createActionsMenu if available, otherwise fallback to simple buttons
      if (window.createActionsMenu && typeof window.createActionsMenu === 'function') {
        const actionsMenuHTML = window.createActionsMenu(actionsMenuItems);
        actionsCell.innerHTML = actionsMenuHTML;
      } else {
        // Fallback: create simple buttons
        actionsMenuItems.forEach(menuItem => {
          const btn = document.createElement('button');
          btn.className = 'btn btn-sm ms-2';
          btn.setAttribute('data-button-type', menuItem.type);
          btn.setAttribute('data-variant', 'small');
          btn.setAttribute('data-onclick', menuItem.onclick);
          btn.setAttribute('title', menuItem.title);
          if (menuItem.type === 'VIEW') {
            btn.textContent = '👁️';
          } else if (menuItem.type === 'DELETE') {
            btn.textContent = '🗑️';
          } else {
            btn.textContent = '🔄';
          }
          actionsCell.appendChild(btn);
        });
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
            const response = await fetch(`/api/ai-analysis/history/${itemId}`, { });
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

        // Check if item already has response_text (from history or API load)
        let analysisResult = null;
        if (item.response_text) {
          window.Logger?.debug('Found analysis response in item', { page: 'ai-analysis', id: item.id });
          analysisResult = {
            ...item,
            response_text: item.response_text,
            response_json: item.response_json
          };
        }

        // Check cache if not in item
        if (!analysisResult || !analysisResult.response_text) {
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
        }

        // If not in item or cache, try to load from API
        if (!analysisResult || !analysisResult.response_text) {
          const response = await fetch(`/api/ai-analysis/history/${item.id}`, { });

          if (!response.ok) {
            throw new Error('Failed to load analysis');
          }

          const data = await response.json();
          if (data.status === 'success' && data.data) {
            analysisResult = data.data;
            
            // If API returned response_text, save to cache (always save to ensure data is up to date)
            if (analysisResult.response_text && window.UnifiedCacheManager && item.id) {
              const cacheKey = `ai-analysis-response-${item.id}`;
              // Always save to cache (even if exists) to ensure data is up to date
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
            const availabilityResponse = await fetch(`/api/ai-analysis/history/${item.id}/availability`, { });
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
              const noteResponse = await fetch(`/api/notes/${noteId}`, { });
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
      
      // Setup export dropdown menu items
      const exportPDFBtn = document.querySelector('#aiResultsModal #exportPDFBtnModal, #aiResultsModal a[data-onclick*="exportToPDF"]');
      const exportMarkdownBtn = document.querySelector('#aiResultsModal #exportMarkdownBtnModal, #aiResultsModal a[data-onclick*="exportToMarkdown"]');
      const exportHTMLBtn = document.querySelector('#aiResultsModal #exportHTMLBtnModal, #aiResultsModal a[data-onclick*="exportToHTML"]');
      
      [exportPDFBtn, exportMarkdownBtn, exportHTMLBtn].forEach((btn, index) => {
        if (btn) {
          const exportType = index === 0 ? 'PDF' : index === 1 ? 'Markdown' : 'HTML';
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.Logger?.info(`🖱️ Export to ${exportType} button clicked`, { 
              page: 'ai-analysis',
              hasCurrentAnalysis: !!this.currentAnalysis,
              currentAnalysisId: this.currentAnalysis?.id
            });
            if (index === 0) {
              await this.exportToPDF();
            } else if (index === 1) {
              await this.exportToMarkdown();
            } else {
              await this.exportToHTML();
            }
            // Close dropdown
            const dropdownToggle = document.querySelector('#aiResultsModal #exportBtnModal');
            if (dropdownToggle && window.bootstrap?.Dropdown) {
              const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
              if (dropdownInstance) {
                dropdownInstance.hide();
              }
            }
            return false;
          });
          window.Logger?.info(`✅ Export to ${exportType} button connected`, { page: 'ai-analysis' });
        }
      });
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
     * Delete single analysis by ID
     * Includes linked items check and confirmation
     * @param {number} analysisId - Analysis ID to delete
     * @returns {Promise<void>}
     */
    async deleteAnalysis(analysisId) {
      window.Logger?.info('🗑️ deleteAnalysis called', {
        page: 'ai-analysis',
        analysisId
      });

      try {
        if (!analysisId) {
          throw new Error('Analysis ID is required');
        }

        // Get analysis details for confirmation message
        const analysis = this.history.find(a => a.id === analysisId || a.id === parseInt(analysisId));
        let analysisDetails = `ניתוח #${analysisId}`;
        if (analysis) {
          const templateName = analysis.template_name || 'לא מוגדר';
          const statusText = analysis.status === 'completed' ? 'הושלם' :
                            analysis.status === 'failed' ? 'נכשל' :
                            analysis.status === 'pending' ? 'ממתין' : analysis.status || 'לא מוגדר';
          analysisDetails = `ניתוח #${analysisId} - ${templateName}, סטטוס: ${statusText}`;
        }

        // Check linked items first (Notes)
        // Note: AI Analysis might be linked to Notes - check if linked items system supports it
        // For now, we'll skip linked items check as AI Analysis is not yet fully integrated
        // with the linked items system, but we'll leave the structure for future integration
        window.Logger?.debug('🔍 Checking for linked items before deletion', {
          page: 'ai-analysis',
          analysisId
        });

        // Optional: Check linked items if system supports it
        // if (typeof window.checkLinkedItemsBeforeAction === 'function') {
        //   const hasLinkedItems = await window.checkLinkedItemsBeforeAction('ai_analysis', analysisId, 'delete');
        //   if (hasLinkedItems) {
        //     window.Logger?.info('🚫 Analysis has linked items, deletion cancelled', {
        //       page: 'ai-analysis',
        //       analysisId
        //     });
        //     return;
        //   }
        // }

        // Confirm deletion
        const confirmed = await new Promise((resolve) => {
          if (window.showDeleteWarning) {
            window.showDeleteWarning(
              `האם אתה בטוח שברצונך למחוק את הניתוח?\n\n${analysisDetails}\n\nפעולה זו אינה ניתנת לביטול.`,
              () => resolve(true),
              () => resolve(false)
            );
          } else if (window.showConfirmationDialog) {
            window.showConfirmationDialog(
              'מחיקת ניתוח',
              `האם אתה בטוח שברצונך למחוק את הניתוח?\n\n${analysisDetails}\n\nפעולה זו אינה ניתנת לביטול.`,
              () => resolve(true),
              () => resolve(false),
              'danger'
            );
          } else {
            resolve(confirm(`האם אתה בטוח שברצונך למחוק את הניתוח?\n\n${analysisDetails}\n\nפעולה זו אינה ניתנת לביטול.`));
          }
        });

        if (!confirmed) {
          window.Logger?.info('🗑️ Delete cancelled by user', {
            page: 'ai-analysis',
            analysisId
          });
          return;
        }

        // Show loading
        if (window.NotificationSystem) {
          window.NotificationSystem.showInfo('מוחק את הניתוח...', 'system');
        }

        // Delete analysis
        if (!window.AIAnalysisData || !window.AIAnalysisData.deleteAnalysis) {
          throw new Error('AIAnalysisData.deleteAnalysis not available');
        }

        const deleted = await window.AIAnalysisData.deleteAnalysis(analysisId);

        if (!deleted) {
          throw new Error('Failed to delete analysis');
        }

        // Remove from history and re-render
        this.history = this.history.filter(a => a.id !== analysisId && a.id !== parseInt(analysisId));
        this.renderHistory();

        // Update summary stats
        if (window.updatePageSummaryStats) {
          window.updatePageSummaryStats('ai-analysis', this.history);
        }

        // Show success
        if (window.NotificationSystem) {
          window.NotificationSystem.showSuccess(
            'הניתוח נמחק בהצלחה',
            'business'
          );
        }

        window.Logger?.info('✅ Analysis deleted successfully', {
          page: 'ai-analysis',
          analysisId
        });

      } catch (error) {
        window.Logger?.error('❌ Error deleting analysis', error, {
          page: 'ai-analysis',
          analysisId
        });

        if (window.NotificationSystem) {
          window.NotificationSystem.showError(
            `שגיאה במחיקת הניתוח: ${error.message || 'שגיאה לא ידועה'}`,
            'system'
          );
        }

        throw error;
      }
    },

    /**
     * Setup Page Visibility API listener
     * NOTE: We do NOT close modals when switching tabs - this allows users to keep modals open
     * while working in other tabs/windows. This improves UX significantly.
     */
    setupPageVisibilityListener() {
      if (typeof document === 'undefined' || !document.addEventListener) {
        return;
      }

      // Page Visibility API listener is intentionally minimal
      // We do NOT close modals when page visibility changes to preserve user work
      // Modals should only be closed by explicit user action (close button, ESC, etc.)
      
      document.addEventListener('visibilitychange', () => {
        // Log visibility changes for debugging but don't interfere with modals
        if (document.visibilityState === 'visible') {
          window.Logger?.debug('Page became visible', {
            page: 'ai-analysis',
            openModalsCount: document.querySelectorAll('.modal.show').length
          });
        } else {
          window.Logger?.debug('Page became hidden', {
            page: 'ai-analysis',
            openModalsCount: document.querySelectorAll('.modal.show').length
          });
        }
      });
      
      window.Logger?.info('Page Visibility API listener setup for modal management (modals preserved on tab switch)', { page: 'ai-analysis' });
    },
  };

  // Expose to global scope
  window.AIAnalysisManager = AIAnalysisManager;

  // Initialization is handled by page-initialization-configs.js
  // No auto-initialization needed here - customInitializers will call init()
})();

