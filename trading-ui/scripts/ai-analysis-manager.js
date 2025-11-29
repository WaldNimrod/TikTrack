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
          await window.AITemplateSelector.render(this.templates);
        }

        // Load LLM provider settings
        try {
          this.llmProviderSettings = await window.AIAnalysisData?.getLLMProviderSettings();
          this.updateProviderSelect();
        } catch (error) {
          window.Logger?.warn('Could not load LLM provider settings', { page: 'ai-analysis', error });
        }

        // Load history
        try {
          this.history = await window.AIAnalysisData?.loadHistory() || [];
          this.renderHistory();
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
     * Update provider select with settings
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
     * Open template selection modal
     */
    async openTemplateSelectionModal(templateId) {
      try {
        this.selectedTemplate = this.templates.find((t) => t.id === templateId);
        if (!this.selectedTemplate) {
          throw new Error('Template not found');
        }

        // Close template selection modal if open
        const templateModal = bootstrap.Modal.getInstance(document.getElementById('aiTemplateSelectionModal'));
        if (templateModal) {
          templateModal.hide();
        }

        // Open variables modal
        await this.openVariablesModal();

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

        // Render variables form in modal
        await this.renderVariablesFormModal(this.selectedTemplate);

        // Update provider select
        this.updateProviderSelectModal();

        // Show modal using ModalManagerV2
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          await window.ModalManagerV2.showModal('aiVariablesModal', 'add');
        } else if (window.bootstrap && window.bootstrap.Modal) {
          const modalElement = document.getElementById('aiVariablesModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement, { backdrop: false, keyboard: true });
            modal.show();
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
     * Handle template selection (legacy - kept for compatibility)
     */
    async handleTemplateSelection(templateId) {
      await this.openTemplateSelectionModal(templateId);
    },

    /**
     * Render variables form in modal
     */
    async renderVariablesFormModal(template) {
      const container = document.getElementById('variablesContainerModal');
      if (!container) {
        window.Logger?.warn('Variables container modal not found', { page: 'ai-analysis' });
        return;
      }

      container.innerHTML = '';

      try {
        const variables = template.variables_json?.variables || [];
        
        for (const variable of variables) {
          const col = document.createElement('div');
          col.className = 'col-md-6';

          const label = document.createElement('label');
          label.className = 'form-label';
          label.textContent = variable.label || variable.key;
          label.setAttribute('for', `var_modal_${variable.key}`);

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

          input.id = `var_modal_${variable.key}`;
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
        window.Logger?.error('Error rendering variables form in modal', error, { page: 'ai-analysis' });
        container.innerHTML = '<div class="alert alert-danger">שגיאה בטעינת משתנים</div>';
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
              optionEl.textContent = ticker.symbol || `Ticker #${ticker.id}`;
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

      // Build field map dynamically from template
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

      // Use DataCollectionService for uniform data collection
      let variables = {};
      if (window.DataCollectionService && Object.keys(fieldMap).length > 0) {
        variables = window.DataCollectionService.collectFormData(fieldMap);
        window.Logger?.debug('Collected variables using DataCollectionService', {
          page: 'ai-analysis',
          variableCount: Object.keys(variables).length
        });
      } else {
        // Fallback to manual collection - check both modal and page
        window.Logger?.warn('DataCollectionService not available, using manual collection', { page: 'ai-analysis' });
        const variableInputs = document.querySelectorAll('#variablesContainerModal input, #variablesContainerModal select, #variablesContainerModal textarea, #variablesContainer input, #variablesContainer select, #variablesContainer textarea');
        variableInputs.forEach((input) => {
          if (input.name && input.value) {
            variables[input.name] = input.value;
          }
        });
      }

      // Set loading state - check both modal and page
      const isModal = document.getElementById('generateAnalysisBtnModal');
      if (isModal) {
        this.setLoadingState(true, 'generateAnalysisBtnModal', 'generateAnalysisBtnTextModal', 'generateAnalysisBtnSpinnerModal');
      } else {
        this.setLoadingState(true, 'generateAnalysisBtn', 'generateAnalysisBtnText', 'generateAnalysisBtnSpinner');
      }

      try {
        window.Logger?.info('Generating analysis...', {
          page: 'ai-analysis',
          templateId: this.selectedTemplate.id,
          provider,
        });

        const result = await window.AIAnalysisData?.generateAnalysis(
          this.selectedTemplate.id,
          variables,
          provider
        );

        if (result) {
          this.currentAnalysis = result;
          
          // Close variables modal
          const variablesModal = bootstrap.Modal.getInstance(document.getElementById('aiVariablesModal'));
          if (variablesModal) {
            variablesModal.hide();
          }

          // Open results modal
          await this.openResultsModal(result);

          // Reload history
          this.history = await window.AIAnalysisData?.loadHistory({ force: true }) || [];
          this.renderHistory();

          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('ניתוח נוצר בהצלחה!', 'business');
          }
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

        // Show modal using ModalManagerV2
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          await window.ModalManagerV2.showModal('aiResultsModal', 'view');
        } else if (window.bootstrap && window.bootstrap.Modal) {
          const modalElement = document.getElementById('aiResultsModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement, { backdrop: false, keyboard: true });
            modal.show();
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

      if (!analysisResult || !analysisResult.response_text) {
        container.innerHTML = '<div class="alert alert-warning">אין תוצאות להצגה</div>';
        return;
      }

      try {
        // Convert markdown to HTML
        let htmlContent;
        if (typeof marked !== 'undefined') {
          htmlContent = marked.parse(analysisResult.response_text);
        } else {
          // Basic fallback
          htmlContent = analysisResult.response_text
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
     * Render history
     */
    renderHistory() {
      const container = document.getElementById('historyContainer');
      if (!container) return;

      if (!this.history || this.history.length === 0) {
        container.innerHTML = '<div class="alert alert-info">אין ניתוחים בהיסטוריה</div>';
        return;
      }

      container.innerHTML = '';

      this.history.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'card mb-2';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const title = document.createElement('h6');
        title.className = 'card-title';
        title.textContent = item.template_name || 'ניתוח';

        const meta = document.createElement('div');
        meta.className = 'text-muted small mb-2';

        const providerSpan = document.createElement('span');
        providerSpan.textContent = `מנוע: ${item.provider}`;

        const dateSpan = document.createElement('span');
        if (window.FieldRendererService) {
          dateSpan.innerHTML = `תאריך: ${window.FieldRendererService.renderDate(item.created_at, true)}`;
        } else {
          dateSpan.textContent = `תאריך: ${new Date(item.created_at).toLocaleString('he-IL')}`;
        }

        const statusSpan = document.createElement('span');
        if (window.FieldRendererService) {
          // Map AI analysis status to standard status format
          let statusForRender = item.status;
          if (item.status === 'completed') statusForRender = 'completed';
          else if (item.status === 'failed') statusForRender = 'cancelled';
          else statusForRender = 'open';
          
          statusSpan.innerHTML = `סטטוס: ${window.FieldRendererService.renderStatus(statusForRender, 'ai_analysis')}`;
        } else {
          statusSpan.textContent = `סטטוס: ${item.status === 'completed' ? 'הושלם' : item.status === 'failed' ? 'נכשל' : 'ממתין'}`;
        }

        meta.appendChild(providerSpan);
        meta.appendChild(document.createTextNode(' | '));
        meta.appendChild(dateSpan);
        meta.appendChild(document.createTextNode(' | '));
        meta.appendChild(statusSpan);

        const actions = document.createElement('div');
        actions.className = 'mt-2';
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm btn-primary me-2';
        viewBtn.textContent = 'צפה בתוצאות';
        viewBtn.setAttribute('data-onclick', `window.AIAnalysisManager.viewHistoryItem(${JSON.stringify(item)})`);
        actions.appendChild(viewBtn);

        cardBody.appendChild(title);
        cardBody.appendChild(meta);
        cardBody.appendChild(actions);
        card.appendChild(cardBody);
        container.appendChild(card);
      });
    },

    /**
     * View history item
     */
    async viewHistoryItem(itemOrId) {
      try {
        // Handle both item object and item ID
        let item = itemOrId;
        if (typeof itemOrId === 'number' || typeof itemOrId === 'string') {
          // Find item in history by ID
          item = this.history.find(h => h.id === parseInt(itemOrId, 10));
          if (!item) {
            window.Logger?.warn('History item not found', { page: 'ai-analysis', id: itemOrId });
            if (window.NotificationSystem) {
              window.NotificationSystem.showError('פריט לא נמצא בהיסטוריה', 'system');
            }
            return;
          }
        }

        // Load full analysis
        const response = await fetch(`/api/ai-analysis/history/${item.id}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load analysis');
        }

        const data = await response.json();
        if (data.status === 'success' && data.data) {
          this.currentAnalysis = data.data;
          
          // Open results modal instead of showing section
          await this.openResultsModal(data.data);
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
     */
    setLoadingState(loading, btnId, textId, spinnerId) {
      const btn = document.getElementById(btnId);
      const text = document.getElementById(textId);
      const spinner = document.getElementById(spinnerId);

      if (btn) {
        btn.disabled = loading;
      }

      if (text) {
        text.style.display = loading ? 'none' : 'inline';
      }

      if (spinner) {
        spinner.style.display = loading ? 'inline' : 'none';
      }
    },
  };

  // Expose to global scope
  window.AIAnalysisManager = AIAnalysisManager;

  // Auto-initialize when page is ready
  // Use handlePageSpecificFunctions from unified-app-initializer.js
  // This is called after initializeUnifiedApp completes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait for UnifiedAppInitializer to complete
      const waitForInit = async () => {
        // Wait for initializeUnifiedApp to complete
        let attempts = 0;
        while (attempts < 50) {
          if (window.unifiedAppInit && window.unifiedAppInit.initialized) {
            // UnifiedAppInitializer has completed, now wait for handlePageSpecificFunctions
            // The customInitializers in page-initialization-configs.js will call init()
            // But we also provide a fallback
            setTimeout(() => {
              if (!AIAnalysisManager.initialized) {
                AIAnalysisManager.init();
              }
            }, 500);
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        // Fallback initialization after timeout
        if (!AIAnalysisManager.initialized) {
          AIAnalysisManager.init();
        }
      };
      waitForInit();
    });
  } else {
    // Page already loaded - same logic
    const waitForInit = async () => {
      let attempts = 0;
      while (attempts < 50) {
        if (window.unifiedAppInit && window.unifiedAppInit.initialized) {
          setTimeout(() => {
            if (!AIAnalysisManager.initialized) {
              AIAnalysisManager.init();
            }
          }, 500);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      if (!AIAnalysisManager.initialized) {
        AIAnalysisManager.init();
      }
    };
    waitForInit();
  }
})();

