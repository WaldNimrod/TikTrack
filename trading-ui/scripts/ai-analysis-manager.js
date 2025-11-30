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
        formModal.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleGenerateAnalysis();
        });
      }

      // Setup handler for page form (legacy - kept for compatibility)
      const form = document.getElementById('aiAnalysisForm');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
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

        // Render variables form in modal
        await this.renderVariablesFormModal(this.selectedTemplate);

        // Update provider select
        const manager = window.AIAnalysisManager || this;
        if (typeof manager.updateProviderSelectModal === 'function') {
          manager.updateProviderSelectModal();
        } else if (typeof manager.updateProviderSelect === 'function') {
          // Fallback to page version
          manager.updateProviderSelect();
        }

        // Show modal using ModalManagerV2 if available, otherwise Bootstrap
        let modalShown = false;
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          try {
            await window.ModalManagerV2.showModal('aiVariablesModal', 'view');
            modalShown = true;
          } catch (error) {
            window.Logger?.warn('ModalManagerV2.showModal failed, trying Bootstrap fallback', { page: 'ai-analysis', error });
          }
        }
        
        if (!modalShown) {
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
            warningDiv.innerHTML = `
              <strong>⚠️ אין מנוע AI מוגדר</strong>
              <p>על מנת להשתמש במערכת ניתוח AI, יש להגדיר מפתח API למנוע AI בפרופיל המשתמש.</p>
              <p><strong>איך להגדיר:</strong></p>
              <ol>
                <li>עבור לעמוד <a href="/user-profile#ai-analysis" target="_blank" class="alert-link"><strong>פרופיל משתמש → הגדרות AI Analysis</strong></a></li>
                <li>גלול לסקשן "הגדרות AI Analysis" (או לחץ על הקישור למעלה)</li>
                <li>הגדר מפתח API למנוע AI (Gemini או Perplexity)</li>
                <li>לחץ על "בדוק מפתח" כדי לוודא שהמפתח תקין</li>
                <li>לחץ על "שמור הגדרות"</li>
              </ol>
              <p><strong>איך להשיג מפתח API:</strong></p>
              <ul>
                <li><strong>Gemini:</strong> עבור ל-<a href="https://aistudio.google.com/" target="_blank" class="alert-link">Google AI Studio</a> ולחץ על "Get API Key"</li>
                <li><strong>Perplexity:</strong> עבור ל-<a href="https://www.perplexity.ai/api" target="_blank" class="alert-link">Perplexity API</a> ולחץ על "Create API Key"</li>
              </ul>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
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
      container.innerHTML = '';
      if (warningDiv) {
        container.appendChild(warningDiv);
      }

      try {
        const variables = template.variables_json?.variables || [];
        
        for (const variable of variables) {
          const col = document.createElement('div');
          col.className = 'col-md-6 mb-3';

          const label = document.createElement('label');
          label.className = 'form-label';
          label.textContent = variable.label || variable.key;
          label.setAttribute('for', `var_modal_${variable.key}`);

          // Always create a select dropdown with "אחר" option
          const select = document.createElement('select');
          select.className = 'form-select';
          select.id = `var_modal_${variable.key}`;
          select.name = variable.key;
          
          // Add empty option
          const emptyOption = document.createElement('option');
          emptyOption.value = '';
          emptyOption.textContent = 'בחר...';
          select.appendChild(emptyOption);

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
          if (select.getAttribute('data-populate-tickers') === 'true') {
            // Use SelectPopulatorService to populate tickers
            // Note: populateTickersSelect will add empty option, so we need to remove it first
            // and add "אחר" after population
            (async () => {
              try {
                await window.SelectPopulatorService.populateTickersSelect(select, {
                  includeEmpty: false, // Don't add empty option - we already have it
                  emptyText: 'בחר טיקר...'
                });
                
                // After tickers are populated, add "אחר" option at the end
                const otherOption = document.createElement('option');
                otherOption.value = '__other__';
                otherOption.textContent = 'אחר';
                select.appendChild(otherOption);
              } catch (error) {
                window.Logger?.warn('Error populating tickers', error, { page: 'ai-analysis' });
                // Add "אחר" even if population failed
                const otherOption = document.createElement('option');
                otherOption.value = '__other__';
                otherOption.textContent = 'אחר';
                select.appendChild(otherOption);
              }
            })();
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

      container.innerHTML = '';

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

        // Fallback to direct API call
        window.Logger?.warn('SelectPopulatorService not available, using direct API call', { page: 'ai-analysis' });
        const response = await fetch('/api/tickers/');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            data.data.forEach((ticker) => {
              const optionEl = document.createElement('option');
              optionEl.value = ticker.symbol || ticker.id;
              // Display ticker + company name
              const displayText = ticker.name ? `${ticker.symbol} - ${ticker.name}` : ticker.symbol;
              optionEl.textContent = displayText || `Ticker #${ticker.id}`;
              select.appendChild(optionEl);
            });
          }
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
          // Check if we're in modal or page
          const fieldId = document.getElementById(`var_modal_${variable.key}`) ? `var_modal_${variable.key}` : `var_${variable.key}`;
          fieldMap[variable.key] = {
            id: fieldId,
            type: variable.type === 'number' ? 'number' : variable.type === 'select' ? 'text' : variable.type === 'textarea' ? 'text' : 'text',
            default: variable.default_value || null
          };
        });
      }

      // Collect variables from form using DataCollectionService
      let variables = {};
      if (window.DataCollectionService && typeof window.DataCollectionService.collectFormData === 'function') {
        // Use DataCollectionService for standard field collection
        variables = window.DataCollectionService.collectFormData(fieldMap) || {};
        
        // Handle "אחר" option - check each select field for "__other__" value
        Object.keys(fieldMap).forEach((key) => {
          const fieldConfig = fieldMap[key];
          const selectElement = document.getElementById(fieldConfig.id);
          
          if (selectElement && selectElement.tagName === 'SELECT' && selectElement.value === '__other__') {
            // Use value from "אחר" input instead
            const otherInputId = `${fieldConfig.id}_other`;
            const otherInput = document.getElementById(otherInputId);
            if (otherInput && otherInput.value) {
              variables[key] = otherInput.value;
            } else {
              // Remove "__other__" if no value in "אחר" input
              delete variables[key];
            }
          }
        });
        
        // Always collect response_language from the modal (it's not in fieldMap)
        const responseLanguageEl = document.getElementById('responseLanguageModal');
        if (responseLanguageEl) {
          variables['response_language'] = responseLanguageEl.value || 'hebrew';
        }
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
              variables[input.name] = select.value;
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
      const isModal = document.getElementById('generateAnalysisBtnModal');
      if (isModal) {
        this.setLoadingState(true, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal');
      } else {
        this.setLoadingState(true, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner');
      }

      // Validate request before generating analysis using Business Logic Layer
      if (window.AIAnalysisData?.validateAnalysisRequest) {
        try {
          window.Logger?.info?.('🔍 Validating analysis request...', { page: 'ai-analysis' });
          
          const validationResult = await window.AIAnalysisData.validateAnalysisRequest({
            template_id: this.selectedTemplate.id,
            variables: variables,
            provider: provider
          });

          if (!validationResult.is_valid) {
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
        } catch (validationError) {
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
        window.Logger?.info('Generating analysis...', {
          page: 'ai-analysis',
          templateId: this.selectedTemplate.id,
          provider,
        });

        // Build API URL
        const apiUrl = window.API_BASE_URL 
          ? (window.API_BASE_URL.endsWith('/') ? window.API_BASE_URL : `${window.API_BASE_URL}/`) + 'api/ai-analysis/generate'
          : '/api/ai-analysis/generate';

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

        // Use CRUDResponseHandler for response handling
        let result = null;
        if (window.CRUDResponseHandler && typeof window.CRUDResponseHandler.handleSaveResponse === 'function') {
          const crudResult = await window.CRUDResponseHandler.handleSaveResponse(response, {
            modalId: 'aiVariablesModal',
            successMessage: 'ניתוח נוצר בהצלחה!',
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

          if (crudResult && crudResult.status === 'success' && crudResult.data) {
            result = crudResult.data;
            
            // Save response_text to cache (not in DB)
            if (result.id && result.response_text) {
              const cacheKey = `ai-analysis-response-${result.id}`;
              if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save(cacheKey, {
                  response_text: result.response_text,
                  response_json: result.response_json || null,
                  cached_at: new Date().toISOString()
                }, {
                  ttl: 7200000, // 2 hours
                  layer: 'indexedDB',
                  compress: true
                });
                window.Logger?.info('✅ Saved AI analysis response to cache', { 
                  page: 'ai-analysis', 
                  requestId: result.id,
                  cacheKey,
                  hasResponseText: !!result.response_text
                });
              }
            }
            
            // Store result for display after reload
            this.pendingResult = result;
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
            
            // Save response_text to cache (not in DB)
            if (result.id && result.response_text) {
              const cacheKey = `ai-analysis-response-${result.id}`;
              if (window.UnifiedCacheManager) {
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
            
            // Close variables modal
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
              window.ModalManagerV2.hideModal('aiVariablesModal');
            } else if (bootstrap?.Modal) {
              const variablesModal = bootstrap.Modal.getInstance(document.getElementById('aiVariablesModal'));
              if (variablesModal) {
                variablesModal.hide();
              }
            }
            
            // Show success notification
            if (window.NotificationSystem) {
              window.NotificationSystem.showSuccess('ניתוח נוצר בהצלחה!', 'business');
            }
            
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
              // Ensure we have the latest result with cache info
              const updatedResult = this.history.find(h => h.id === result.id) || result;
              await this.openResultsModal(updatedResult);
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
        window.Logger?.error('Error generating analysis', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה ביצירת ניתוח: ' + (error.message || 'שגיאה לא ידועה'), 'system');
        }
      } finally {
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
        // Render results in modal
        await this.renderResultsModal(analysisResult);

        // Show modal using ModalManagerV2 if available, otherwise Bootstrap
        let modalShown = false;
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          try {
            await window.ModalManagerV2.showModal('aiResultsModal', 'view');
            modalShown = true;
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
          } else {
            throw new Error('Bootstrap Modal not available');
          }
        }

        window.Logger?.info('Results modal opened', { page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('Error opening results modal', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בפתיחת מודול תוצאות', 'system');
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
        container.innerHTML = '<div class="alert alert-warning">אין תוצאות להצגה</div>';
        return;
      }

      // Check if analysis failed or has no response
      if (analysisResult.status === 'failed') {
        const errorMessage = analysisResult.error_message || 'שגיאה לא ידועה ביצירת הניתוח';
        container.innerHTML = `<div class="alert alert-danger">
          <h5>❌ הניתוח נכשל</h5>
          <p>${errorMessage}</p>
          ${analysisResult.id ? `<small>מספר בקשה: ${analysisResult.id}</small>` : ''}
        </div>`;
        return;
      }

      // Try to get response_text from cache if not in result
      let responseText = analysisResult.response_text;
      if (!responseText && analysisResult.id && window.UnifiedCacheManager) {
        const cacheKey = `ai-analysis-response-${analysisResult.id}`;
        const cachedData = await window.UnifiedCacheManager.get(cacheKey);
        if (cachedData && cachedData.response_text) {
          responseText = cachedData.response_text;
          window.Logger?.debug('Retrieved AI analysis response from cache', { 
            page: 'ai-analysis', 
            requestId: analysisResult.id 
          });
        }
      }

      if (!responseText) {
        container.innerHTML = `<div class="alert alert-warning">
          <h5>⚠️ אין תוצאות להצגה</h5>
          <p>הניתוח הושלם אך התוצאות לא זמינות כרגע. התוצאות נשמרות במטמון למשך 2 שעות בלבד.</p>
          <p>אם שמרת את הניתוח כהערה, תוכל למצוא אותו בעמוד הערות.</p>
          ${analysisResult.status ? `<p><strong>סטטוס:</strong> ${analysisResult.status}</p>` : ''}
          ${analysisResult.id ? `<p><small>מספר בקשה: ${analysisResult.id}</small></p>` : ''}
        </div>`;
        return;
      }

      try {
        
        if (!responseText) {
          container.innerHTML = '<div class="alert alert-warning">אין תוצאות להצגה</div>';
          return;
        }

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

        container.innerHTML = htmlContent;
        container.className = 'markdown-body';

        window.Logger?.info('Results rendered in modal', { page: 'ai-analysis', requestId: analysisResult.id });
      } catch (error) {
        window.Logger?.error('Error rendering results in modal', error, { page: 'ai-analysis' });
        container.innerHTML = '<div class="alert alert-danger">שגיאה בהצגת תוצאות</div>';
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
        container.innerHTML = '<div class="alert alert-info">אין ניתוחים בהיסטוריה</div>';
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
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="תבנית" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 0)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="מנוע" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 1)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="סטטוס" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 2)"></button>
                </th>
                <th>
                  <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="נוצר ב" data-classes="btn-link sortable-header" data-onclick="window.sortTable('ai_analysis_history', 3)"></button>
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

      container.innerHTML = tableHTML;

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
              const cachedData = await window.UnifiedCacheManager.get(cacheKey);
              const hasCache = !!(cachedData && cachedData.response_text);
              if (hasCache) {
                window.Logger?.debug('Found in cache', { page: 'ai-analysis', id, cacheKey });
              } else {
                window.Logger?.debug('Not found in cache', { page: 'ai-analysis', id, cacheKey });
              }
              return {
                id,
                has_cache: hasCache,
                has_note: false,
                note_id: null
              };
            } catch (error) {
              window.Logger?.warn('Error checking cache', { page: 'ai-analysis', id, cacheKey, error });
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
        for (const item of this.history) {
          if (item.status === 'completed' && cacheChecks[item.id]) {
            item._availability = cacheChecks[item.id];
            if (cacheChecks[item.id].has_cache || cacheChecks[item.id].has_note) {
              availableCount++;
            }
          } else if (item.status === 'completed') {
            item._availability = {
              has_cache: false,
              has_note: false,
              note_id: null
            };
          } else {
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
          availableCount: availableCount,
          cacheCount: Object.values(cacheChecks).filter(c => c.has_cache).length,
          noteCount: Object.values(cacheChecks).filter(c => c.has_note).length
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

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          // Use CRUDResponseHandler if available (same flow as handleGenerateAnalysis)
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

            if (crudResult && crudResult.status === 'success' && crudResult.data) {
              const analysisResult = crudResult.data;
              
              // Save response_text to cache (not in DB) - same as handleGenerateAnalysis
              if (analysisResult.id && analysisResult.response_text) {
                const cacheKey = `ai-analysis-response-${analysisResult.id}`;
                if (window.UnifiedCacheManager) {
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
                }
              }
              
              // Store result for display after reload
              this.pendingResult = analysisResult;
            }
          } else {
            // Fallback to manual handling (same as handleGenerateAnalysis)
            window.Logger?.warn('CRUDResponseHandler not available for rerun, using manual handling', { page: 'ai-analysis' });
            
            // Save response_text to cache (not in DB) - same options as handleGenerateAnalysis
            if (result.data.id && result.data.response_text) {
              const cacheKey = `ai-analysis-response-${result.data.id}`;
              if (window.UnifiedCacheManager) {
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
            
            // Open results modal after history is updated
            if (result.data && result.data.id) {
              // Ensure we have the latest result with cache info
              const updatedResult = this.history.find(h => h.id === result.data.id) || result.data;
              await this.openResultsModal(updatedResult);
            }
          }
        } else {
          throw new Error(result.message || 'Failed to generate analysis');
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

      // Template name
      const templateCell = document.createElement('td');
      templateCell.textContent = item.template_name || 'ניתוח';
      row.appendChild(templateCell);

      // Provider
      const providerCell = document.createElement('td');
      providerCell.textContent = item.provider || 'לא זמין';
      row.appendChild(providerCell);

      // Status
      const statusCell = document.createElement('td');
      if (window.FieldRendererService) {
        let statusForRender = item.status;
        if (item.status === 'completed') statusForRender = 'completed';
        else if (item.status === 'failed') statusForRender = 'cancelled';
        else statusForRender = 'open';
        statusCell.innerHTML = window.FieldRendererService.renderStatus(statusForRender, 'ai_analysis');
      } else {
        statusCell.textContent = item.status === 'completed' ? 'הושלם' : item.status === 'failed' ? 'נכשל' : 'ממתין';
      }
      row.appendChild(statusCell);

      // Created at - handle DateEnvelope format
      const dateCell = document.createElement('td');
      if (window.FieldRendererService) {
        // Check if created_at is already a DateEnvelope or needs conversion
        const dateValue = item.created_at_envelope || item.created_at;
        dateCell.innerHTML = window.FieldRendererService.renderDate(dateValue, true);
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
              tbody.innerHTML = '';
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
            
            // If API returned response_text, save to cache
            if (analysisResult.response_text && window.UnifiedCacheManager && item.id) {
              const cacheKey = `ai-analysis-response-${item.id}`;
              await window.UnifiedCacheManager.save(cacheKey, {
                response_text: analysisResult.response_text,
                response_json: analysisResult.response_json
              }, { ttl: 7200000 }); // 2 hours
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
     * Save as note
     */
    async saveAsNote() {
      if (!this.currentAnalysis) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('אין ניתוח לשמירה', 'system');
        }
        return;
      }

      if (!window.AINotesIntegration) {
        window.Logger?.warn('AINotesIntegration not available', { page: 'ai-analysis' });
        return;
      }

      await window.AINotesIntegration.saveAsNote(this.currentAnalysis);
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
     */
    setLoadingState(loading, btnId, textId, spinnerId) {
      const btn = document.getElementById(btnId);
      const text = document.getElementById(textId);
      const spinner = document.getElementById(spinnerId);

      if (btn) {
        btn.disabled = loading;
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
        } else {
          spinner.classList.remove('show');
          spinner.classList.remove('btn-spinner');
        }
      }
    },
  };

  // Expose to global scope
  window.AIAnalysisManager = AIAnalysisManager;

  // Initialization is handled by page-initialization-configs.js
  // No auto-initialization needed here - customInitializers will call init()
})();

