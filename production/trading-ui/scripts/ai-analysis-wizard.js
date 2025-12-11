/**
 * AI Analysis Wizard
 * ======================================
 * Wizard interface for creating AI analysis with 3 steps
 * Based on import-user-data modal structure
 *
 * Responsibilities:
 * - Manage 3-step wizard flow
 * - Handle template selection, filters, variables
 * - Display results and handle export/save
 *
 * @version 1.0.0
 * @created December 2025
 * @author TikTrack Development Team
 */

/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * STATE MANAGEMENT
 *   - init() - Initialize wizard
 *   - reset() - Reset wizard state
 * 
 * STEP NAVIGATION
 *   - openWizard() - Open wizard in new/rerun mode
 *   - goToStep() - Navigate to specific step
 *   - updateStepIndicators() - Update step indicators UI
 *   - showStepContent() - Show/hide step content
 *   - updateHeaderActions() - Update header action buttons
 * 
 * STEP 1 LOGIC
 *   - loadStep1() - Load step 1 content
 *   - handleTemplateSelection() - Handle template selection
 *   - validateStep1() - Validate step 1 before proceeding
 * 
 * STEP 2 LOGIC
 *   - loadStep2() - Load step 2 content
 *   - renderFiltersSection() - Render filters accordion section
 *   - renderVariablesSection() - Render variables accordion section
 *   - setupAccordionForStep2() - Setup accordion behavior
 *   - validateStep2() - Validate step 2 before proceeding
 * 
 * STEP 3 LOGIC
 *   - loadStep3() - Load step 3 content
 *   - generateAnalysis() - Generate analysis from collected data
 *   - loadAnalysisResults() - Load and display analysis results
 * 
 * UTILITIES
 *   - collectStep2Data() - Collect data from step 2 form
 *   - buildAnalysisPayload() - Build API payload for analysis
 *   - setElementDisplay() - Helper to set element display
 * ==========================================
 */

(function() {
  'use strict';

  const AIAnalysisWizard = {
    version: '1.0.0',
    initialized: false,
    currentStep: 1,
    selectedTemplate: null,
    selectedProvider: null,
    selectedLanguage: 'hebrew',
    filters: {},
    promptVariables: {},
    currentAnalysis: null,
    templates: [],
    llmProviderSettings: null,

    /**
     * Initialize wizard
     */
    async init() {
      if (this.initialized) {
        window.Logger?.warn('AIAnalysisWizard already initialized', { page: 'ai-analysis' });
        return;
      }

      try {
        window.Logger?.info('🚀 Initializing AI Analysis Wizard...', { page: 'ai-analysis' });

        // Load templates
        if (window.AIAnalysisData && typeof window.AIAnalysisData.loadTemplates === 'function') {
          this.templates = await window.AIAnalysisData.loadTemplates() || [];
        }

        // Load LLM provider settings
        if (window.AIAnalysisData && typeof window.AIAnalysisData.getLLMProviderSettings === 'function') {
          try {
            this.llmProviderSettings = await window.AIAnalysisData.getLLMProviderSettings();
          } catch (error) {
            window.Logger?.warn('Could not load LLM provider settings', { page: 'ai-analysis', error });
          }
        }

        this.initialized = true;
        window.Logger?.info('✅ AI Analysis Wizard initialized successfully', { page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('❌ Error initializing AI Analysis Wizard', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Reset wizard state
     */
    reset() {
      this.currentStep = 1;
      this.selectedTemplate = null;
      this.selectedProvider = null;
      this.selectedLanguage = 'hebrew';
      this.filters = {};
      this.promptVariables = {};
      this.currentAnalysis = null;
      window.Logger?.debug('Wizard state reset', { page: 'ai-analysis' });
    },

    /**
     * Helper function to set element display using Bootstrap classes
     */
    setElementDisplay(element, displayValue) {
      if (!element) return;
      
      element.classList.remove('d-none', 'd-block', 'd-flex', 'd-inline-flex', 'd-inline', 'd-inline-block');
      
      if (!displayValue || displayValue === 'none') {
        element.classList.add('d-none');
      } else if (displayValue === 'block') {
        element.classList.add('d-block');
      } else if (displayValue === 'flex' || displayValue === 'inline-flex') {
        element.classList.add('d-flex');
      } else if (displayValue === 'inline') {
        element.classList.add('d-inline');
      } else if (displayValue === 'inline-block') {
        element.classList.add('d-inline-block');
      } else {
        element.style.display = displayValue;
      }
    },

    /**
     * Open wizard
     * @param {string} mode - 'new' or 'rerun'
     * @param {Object} analysisData - Analysis data for rerun mode
     */
    async openWizard(mode = 'new', analysisData = null) {
      try {
        window.Logger?.info('Opening AI Analysis Wizard', { mode, page: 'ai-analysis' });

        // Reset state
        this.reset();

        // Ensure initialization
        if (!this.initialized) {
          await this.init();
        }

        // Show modal using ModalManagerV2
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          await window.ModalManagerV2.showModal('aiAnalysisWizardModal', 'view');
        } else {
          window.Logger?.error('ModalManagerV2 not available', { page: 'ai-analysis' });
          if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
          }
          return;
        }

        if (mode === 'rerun' && analysisData) {
          // Load data from existing analysis
          await this.loadRerunData(analysisData);
          // Go directly to step 3
          await this.goToStep(3);
          // Load results
          await this.loadAnalysisResults(analysisData.id);
        } else {
          // Start from step 1
          await this.goToStep(1);
        }
      } catch (error) {
        window.Logger?.error('Error opening wizard', error, { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה', `שגיאה בפתיחת וויזארד: ${error.message}`);
        }
      }
    },

    /**
     * Load data from existing analysis for rerun
     */
    async loadRerunData(analysisData) {
      try {
        // Find template
        const templateId = analysisData.template_id;
        this.selectedTemplate = this.templates.find(t => t.id === templateId);
        
        if (!this.selectedTemplate && window.AIAnalysisData) {
          // Try to load template if not in cache
          const template = await window.AIAnalysisData.loadTemplate(templateId);
          if (template) {
            this.selectedTemplate = template;
          }
        }

        // Load provider and language
        this.selectedProvider = analysisData.provider || 'gemini';
        
        // Parse variables_json
        let variables = {};
        if (analysisData.variables_json) {
          if (typeof analysisData.variables_json === 'string') {
            variables = JSON.parse(analysisData.variables_json);
          } else {
            variables = analysisData.variables_json;
          }
        }

        // Separate filters and prompt_variables
        if (variables.version === '2.0') {
          this.filters = variables.filters || {};
          this.promptVariables = variables.prompt_variables || {};
          this.selectedLanguage = variables.prompt_variables?.response_language || 'hebrew';
        } else {
          // Legacy format - separate manually
          const filterKeys = ['trading_account', 'trading_account_id', 'account_id'];
          this.filters = {};
          this.promptVariables = {};
          
          Object.keys(variables).forEach(key => {
            if (filterKeys.includes(key)) {
              if (key === 'trading_account') {
                this.filters['trading_account_id'] = variables[key];
              } else {
                this.filters[key] = variables[key];
              }
            } else {
              this.promptVariables[key] = variables[key];
            }
          });
          
          this.selectedLanguage = variables.response_language || 'hebrew';
        }

        window.Logger?.info('Loaded rerun data', { 
          templateId, 
          provider: this.selectedProvider,
          page: 'ai-analysis' 
        });
      } catch (error) {
        window.Logger?.error('Error loading rerun data', error, { page: 'ai-analysis' });
        throw error;
      }
    },

    /**
     * Navigate to specific step
     */
    async goToStep(step) {
      const targetStep = Number(step);
      if (Number.isNaN(targetStep) || targetStep < 1 || targetStep > 3) {
        window.Logger?.warn('Invalid step navigation', { step, page: 'ai-analysis' });
        return;
      }

      window.Logger?.info('Navigating to step', { 
        from: this.currentStep, 
        to: targetStep, 
        page: 'ai-analysis' 
      });

      // Validate before moving forward
      if (targetStep > this.currentStep) {
        if (this.currentStep === 1 && !this.validateStep1()) {
          return;
        }
        if (this.currentStep === 2 && !this.validateStep2()) {
          return;
        }
      }

      this.currentStep = targetStep;

      // Update UI
      this.updateStepIndicators();
      this.showStepContent(step);
      this.updateHeaderActions(step);

      // Load step-specific content
      if (targetStep === 1) {
        await this.loadStep1();
      } else if (targetStep === 2) {
        await this.loadStep2();
      } else if (targetStep === 3) {
        await this.loadStep3();
      }

      // Process buttons after step change
      const modal = document.getElementById('aiAnalysisWizardModal');
      if (modal) {
        const currentStepElement = modal.querySelector(`.import-step[data-step="${targetStep}"]`);
        if (currentStepElement) {
          if (window.processButtons) {
            window.processButtons(currentStepElement);
          } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
            window.advancedButtonSystem.processButtons(currentStepElement);
          }
        }
        
        // Process header actions
        const headerActions = document.getElementById('wizardHeaderActions');
        if (headerActions) {
          if (window.processButtons) {
            window.processButtons(headerActions);
          } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
            window.advancedButtonSystem.processButtons(headerActions);
          }
        }
      }

      window.Logger?.info('Step navigation completed', { currentStep: this.currentStep, page: 'ai-analysis' });
    },

    /**
     * Update step indicators
     */
    updateStepIndicators() {
      const modal = document.getElementById('aiAnalysisWizardModal');
      if (!modal) return;

      const indicators = modal.querySelectorAll('.import-steps-indicator .step');
      indicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        indicator.classList.remove('active', 'completed');
        const numberEl = indicator.querySelector('.step-number');
        const labelEl = indicator.querySelector('.step-label');
        
        if (numberEl) {
          numberEl.classList.remove('active', 'completed');
        }
        if (labelEl) {
          labelEl.classList.remove('active', 'completed');
        }
        
        if (stepNumber < this.currentStep) {
          indicator.classList.add('completed');
          if (numberEl) numberEl.classList.add('completed');
          if (labelEl) labelEl.classList.add('completed');
        } else if (stepNumber === this.currentStep) {
          indicator.classList.add('active');
          if (numberEl) numberEl.classList.add('active');
          if (labelEl) labelEl.classList.add('active');
        }
      });
    },

    /**
     * Show step content
     */
    showStepContent(step) {
      const modal = document.getElementById('aiAnalysisWizardModal');
      if (!modal) return;

      // Hide all steps
      const steps = modal.querySelectorAll('.import-step');
      steps.forEach(stepElement => {
        this.setElementDisplay(stepElement, 'none');
      });

      // Show current step
      const currentStepElement = modal.querySelector(`.import-step[data-step="${step}"]`);
      if (currentStepElement) {
        this.setElementDisplay(currentStepElement, 'block');
        window.Logger?.debug('Step content shown', { step, elementId: currentStepElement.id, page: 'ai-analysis' });
      } else {
        window.Logger?.error('Step content element not found', { step, page: 'ai-analysis' });
      }
    },

    /**
     * Update header actions based on current step
     */
    updateHeaderActions(step) {
      const modal = document.getElementById('aiAnalysisWizardModal');
      if (!modal) return;

      // Hide all action groups
      const actionGroups = modal.querySelectorAll('.step-header-group');
      actionGroups.forEach(group => {
        this.setElementDisplay(group, 'none');
      });

      // Show relevant action group
      let actionGroupId = null;
      if (step === 1) {
        actionGroupId = 'wizardStep1Actions';
      } else if (step === 2) {
        actionGroupId = 'wizardStep2Actions';
      } else if (step === 3) {
        actionGroupId = 'wizardStep3Actions';
      }

      if (actionGroupId) {
        const actionGroup = document.getElementById(actionGroupId);
        if (actionGroup) {
          this.setElementDisplay(actionGroup, 'flex');
        }
      }
    },

    /**
     * Load step 1 content
     */
    async loadStep1() {
      const stepContainer = document.getElementById('ai-wizard-step-1');
      if (!stepContainer) {
        window.Logger?.warn('Step 1 container not found', { page: 'ai-analysis' });
        return;
      }

      try {
        // Render templates
        const templatesContainer = stepContainer.querySelector('#wizardTemplatesContainer');
        if (templatesContainer && window.AITemplateSelector) {
          // Clear container
          templatesContainer.textContent = '';
          
          // Render templates inline (adapted from AITemplateSelector)
          if (this.templates.length === 0) {
            const alert = document.createElement('div');
            alert.className = 'alert alert-warning';
            alert.textContent = 'אין תבניות זמינות';
            templatesContainer.appendChild(alert);
            return;
          }

          for (const template of this.templates) {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-3 mb-3';

            const card = document.createElement('div');
            card.className = `card h-100 template-card ${this.selectedTemplate?.id === template.id ? 'border-primary' : ''}`;
            card.setAttribute('data-onclick', `window.AIAnalysisWizard.handleTemplateSelection(${template.id})`);

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';

            const icon = document.createElement('div');
            icon.className = 'text-center mb-3';
            
            let iconHTML = '';
            if (window.IconSystem && typeof window.IconSystem.renderIcon === 'function') {
              try {
                iconHTML = await window.IconSystem.renderIcon('entity', 'research', {
                  size: '48',
                  alt: 'תבנית',
                  class: 'section-icon template-icon'
                });
              } catch (error) {
                iconHTML = '<img src="images/icons/entities/research.svg" alt="תבנית" class="section-icon template-icon">';
              }
            } else {
              iconHTML = '<img src="images/icons/entities/research.svg" alt="תבנית" class="section-icon template-icon">';
            }
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(iconHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
              icon.appendChild(node.cloneNode(true));
            });

            const title = document.createElement('h5');
            title.className = 'card-title text-center';
            title.textContent = template.name_he || template.name;

            const description = document.createElement('p');
            description.className = 'card-text text-muted small flex-grow-1';
            description.textContent = template.description || '';

            const badge = document.createElement('span');
            badge.className = 'badge bg-primary';
            badge.textContent = 'בחר תבנית';

            cardBody.appendChild(icon);
            cardBody.appendChild(title);
            cardBody.appendChild(description);
            cardBody.appendChild(badge);
            card.appendChild(cardBody);
            col.appendChild(card);
            templatesContainer.appendChild(col);
          }
        }

        // Update provider select
        const providerSelect = stepContainer.querySelector('#wizardProviderSelect');
        if (providerSelect && this.llmProviderSettings) {
          // Set default provider
          if (this.llmProviderSettings.default_provider) {
            providerSelect.value = this.llmProviderSettings.default_provider;
            this.selectedProvider = this.llmProviderSettings.default_provider;
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
        } else if (providerSelect && this.selectedProvider) {
          providerSelect.value = this.selectedProvider;
        }

        // Update language select
        const languageSelect = stepContainer.querySelector('#wizardLanguageSelect');
        if (languageSelect) {
          languageSelect.value = this.selectedLanguage;
          
          // Add event listener for language change
          languageSelect.addEventListener('change', () => {
            this.selectedLanguage = languageSelect.value || 'hebrew';
            this.validateStep1();
          });
        }

        // Add event listener for provider change
        if (providerSelect) {
          providerSelect.addEventListener('change', () => {
            this.selectedProvider = providerSelect.value;
            this.validateStep1();
          });
        }

        window.Logger?.info('Step 1 loaded', { page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('Error loading step 1', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Handle template selection
     */
    handleTemplateSelection(templateId) {
      const id = typeof templateId === 'string' ? parseInt(templateId, 10) : templateId;
      this.selectedTemplate = this.templates.find(t => t.id === id);
      
      if (!this.selectedTemplate) {
        window.Logger?.warn('Template not found', { templateId: id, page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה', 'תבנית לא נמצאה');
        }
        return;
      }

      // Update UI to show selected template
      const stepContainer = document.getElementById('ai-wizard-step-1');
      if (stepContainer) {
        const cards = stepContainer.querySelectorAll('.template-card');
        cards.forEach(card => {
          card.classList.remove('border-primary');
          const onclick = card.getAttribute('data-onclick');
          if (onclick && onclick.includes(`(${id})`)) {
            card.classList.add('border-primary');
          }
        });
      }

      // Check if we can proceed (if provider is also selected)
      this.validateStep1();

      window.Logger?.info('Template selected', { templateId: id, page: 'ai-analysis' });
    },

    /**
     * Validate step 1
     */
    validateStep1() {
      const errors = [];

      if (!this.selectedTemplate) {
        errors.push('יש לבחור תבנית ניתוח');
      }

      const stepContainer = document.getElementById('ai-wizard-step-1');
      if (stepContainer) {
        const providerSelect = stepContainer.querySelector('#wizardProviderSelect');
        if (providerSelect) {
          this.selectedProvider = providerSelect.value;
          if (!this.selectedProvider) {
            errors.push('יש לבחור מנוע AI');
          }
        }

        const languageSelect = stepContainer.querySelector('#wizardLanguageSelect');
        if (languageSelect) {
          this.selectedLanguage = languageSelect.value || 'hebrew';
        }
      }

      // Enable/disable continue button
      const continueBtn = document.getElementById('wizardContinueToStep2');
      if (continueBtn) {
        continueBtn.disabled = errors.length > 0;
      }

      if (errors.length > 0 && window.Logger) {
        window.Logger.debug('Step 1 validation errors', { errors, page: 'ai-analysis' });
      }

      return errors.length === 0;
    },

    /**
     * Load step 2 content
     */
    async loadStep2() {
      const stepContainer = document.getElementById('ai-wizard-step-2');
      if (!stepContainer) {
        window.Logger?.warn('Step 2 container not found', { page: 'ai-analysis' });
        return;
      }

      // Clear any previous error messages
      const existingErrors = stepContainer.querySelectorAll('.validation-error-alert');
      existingErrors.forEach(err => err.remove());
      
      // Also clear results container if exists
      const resultsContainer = document.getElementById('wizardResultsContainer');
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
      }

      if (!this.selectedTemplate) {
        window.Logger?.error('No template selected for step 2', { page: 'ai-analysis' });
        return;
      }

      try {
        // Render filters and variables sections
        await this.renderFiltersSection(stepContainer);
        await this.renderVariablesSection(stepContainer);
        
        // Setup accordion
        await this.setupAccordionForStep2();
        
        // Setup validation listeners for step 2 fields
        this.setupStep2ValidationListeners();

        window.Logger?.info('Step 2 loaded', { page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('Error loading step 2', error, { page: 'ai-analysis' });
      }
    },

    /**
     * Render filters section
     */
    async renderFiltersSection(stepContainer) {
      const filtersContainer = stepContainer.querySelector('#wizardFiltersContainer');
      if (!filtersContainer) {
        window.Logger?.warn('Filters container not found', { page: 'ai-analysis' });
        return;
      }

      // Clear container
      filtersContainer.textContent = '';

      // Get variables from template
      const variables = this.selectedTemplate?.variables_json?.variables || [];
      
      // Filter keys that should be in filters section (not sent to LLM)
      const filterKeys = ['trading_account', 'trading_account_id', 'account_id'];
      
      // Find filter variables
      const filterVariables = variables.filter(v => filterKeys.includes(v.key));
      
      if (filterVariables.length === 0) {
        // No filters - hide the section
        const filtersSection = stepContainer.querySelector('#wizardFiltersSection');
        if (filtersSection) {
          this.setElementDisplay(filtersSection, 'none');
        }
        return;
      }

      // Show filters section
      const filtersSection = stepContainer.querySelector('#wizardFiltersSection');
      if (filtersSection) {
        this.setElementDisplay(filtersSection, 'block');
      }

      // Render filter fields (similar to variables but these are filters)
      for (const variable of filterVariables) {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-3';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = variable.label || variable.key;
        label.setAttribute('for', `wizard_filter_${variable.key}`);

        // Create select for trading account
        const select = document.createElement('select');
        select.className = 'form-select';
        select.id = `wizard_filter_${variable.key}`;
        select.name = variable.key;

        // Populate with accounts if needed
        if ((variable.key === 'trading_account' || variable.key === 'trading_account_id' || variable.key === 'account_id') &&
            window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
          // Mark for population but don't populate here - will be done in single batch after all filters are rendered
          select.setAttribute('data-populate-accounts', 'true');
          select.setAttribute('data-populate-type', 'filter');
        } else {
          const emptyOption = document.createElement('option');
          emptyOption.value = '';
          emptyOption.textContent = 'בחר...';
          select.appendChild(emptyOption);
        }

        if (variable.required) {
          select.required = true;
          // Add required asterisk to label
          const asterisk = document.createElement('span');
          asterisk.className = 'text-danger';
          asterisk.textContent = ' *';
          label.appendChild(asterisk);
        }

        col.appendChild(label);
        col.appendChild(select);
        filtersContainer.appendChild(col);
      }

      // Populate all account selects in filters (batch population to avoid duplicates)
      const filterAccountSelects = filtersContainer.querySelectorAll('select[data-populate-accounts="true"][data-populate-type="filter"]');
      if (filterAccountSelects.length > 0) {
        setTimeout(async () => {
          for (const select of filterAccountSelects) {
            if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
              try {
                // Clear existing options first to avoid duplicates
                select.innerHTML = '';
                
                await window.SelectPopulatorService.populateAccountsSelect(select, {
                  includeEmpty: true,
                  emptyText: 'בחר חשבון מסחר...',
                  defaultFromPreferences: true
                });
                
                // Set value if we have it from rerun
                if (this.filters[select.name] || this.filters['trading_account_id']) {
                  select.value = this.filters[select.name] || this.filters['trading_account_id'];
                }
                
                select.removeAttribute('data-populate-accounts');
                select.removeAttribute('data-populate-type');
              } catch (error) {
                window.Logger?.warn('Error populating accounts for filter', error, { page: 'ai-analysis' });
              }
            }
          }
        }, 150);
      }

      window.Logger?.info('Filters section rendered', { filterCount: filterVariables.length, page: 'ai-analysis' });
    },

    /**
     * Render variables section
     * Uses logic similar to renderVariablesFormModal but adapted for wizard
     */
    async renderVariablesSection(stepContainer) {
      const variablesContainer = stepContainer.querySelector('#wizardVariablesContainer');
      if (!variablesContainer) {
        window.Logger?.warn('Variables container not found', { page: 'ai-analysis' });
        return;
      }

      // Clear container
      variablesContainer.textContent = '';

      if (!this.selectedTemplate) {
        window.Logger?.warn('No template selected for rendering variables', { page: 'ai-analysis' });
        return;
      }

      // Check if trading_account is in filters - if so, exclude it from variables
      const filtersContainer = stepContainer.querySelector('#wizardFiltersContainer');
      const hasAccountInFilters = filtersContainer && filtersContainer.querySelector('select[id*="trading_account"], select[id*="account_id"]');
      const filterKeys = ['trading_account', 'trading_account_id', 'account_id'];
      
      // Use existing renderVariablesFormModal by rendering to modal container then copying
      const originalModalContainer = document.getElementById('variablesContainerModal');
      
      if (window.AIAnalysisManager && typeof window.AIAnalysisManager.renderVariablesFormModal === 'function' && originalModalContainer) {
        try {
          // Store original container state
          const originalHtml = originalModalContainer.innerHTML;
          const originalDisplay = originalModalContainer.style.display;
          const originalClass = originalModalContainer.className;
          
          // Prepare container for rendering
          originalModalContainer.innerHTML = '';
          originalModalContainer.className = 'row g-3';
          originalModalContainer.style.display = 'block';
          originalModalContainer.style.visibility = 'hidden'; // Hide but keep in DOM for rendering
          originalModalContainer.style.position = 'absolute';
          originalModalContainer.style.left = '-9999px';
          
          // Render to the existing modal container
          await window.AIAnalysisManager.renderVariablesFormModal(this.selectedTemplate);
          
          // Remove trading_account fields from variables if they're in filters
          if (hasAccountInFilters) {
            const accountFields = originalModalContainer.querySelectorAll('[id*="var_modal_trading_account"], [id*="var_modal_account_id"], [name="trading_account"], [name="account_id"]');
            accountFields.forEach(field => {
              const col = field.closest('.col-md-4, .col-md-6, .col-12');
              if (col) {
                col.remove();
                window.Logger?.debug('Removed trading_account field from variables (already in filters)', { page: 'ai-analysis' });
              }
            });
          }
          
          // Wait for async operations (population, etc.)
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Clone all children and update IDs
          const children = Array.from(originalModalContainer.children);
          variablesContainer.textContent = '';
          variablesContainer.className = 'row g-3';
          
          // Track date range picker IDs for initialization
          const dateRangePickerIds = [];
          
          children.forEach(child => {
            const cloned = child.cloneNode(true);
            
            // Update all IDs from var_modal_ to wizard_var_
            const allElements = cloned.querySelectorAll('*');
            allElements.forEach(el => {
              // Update ID
              if (el.id && el.id.includes('var_modal_')) {
                el.id = el.id.replace(/var_modal_/g, 'wizard_var_');
              }
              // Update name attribute  
              if (el.name && el.name.includes('var_modal_')) {
                el.name = el.name.replace(/var_modal_/g, 'wizard_var_');
              }
              // Update for labels
              if (el.tagName === 'LABEL' && el.getAttribute('for')) {
                const forAttr = el.getAttribute('for');
                if (forAttr.includes('var_modal_')) {
                  el.setAttribute('for', forAttr.replace(/var_modal_/g, 'wizard_var_'));
                }
              }
              // Update for date range picker
              if (el.hasAttribute('data-date-range-picker-id')) {
                const pickerId = el.getAttribute('data-date-range-picker-id');
                if (pickerId && pickerId.includes('var_modal_')) {
                  const newPickerId = pickerId.replace(/var_modal_/g, 'wizard_var_');
                  el.setAttribute('data-date-range-picker-id', newPickerId);
                  dateRangePickerIds.push(newPickerId);
                }
              }
              // Update input IDs that reference date range picker
              if ((el.tagName === 'INPUT' || el.tagName === 'SELECT') && el.id && el.id.includes('var_modal_')) {
                const oldId = el.id;
                el.id = el.id.replace(/var_modal_/g, 'wizard_var_');
                // Update associated label if exists
                const associatedLabel = cloned.querySelector(`label[for="${oldId}"]`);
                if (associatedLabel) {
                  associatedLabel.setAttribute('for', el.id);
                }
              }
            });
            
            // Fix event handlers for "אחר" inputs - update references
            const selectsWithOther = cloned.querySelectorAll('select');
            selectsWithOther.forEach(select => {
              if (select.id && select.id.includes('wizard_var_')) {
                // Remove any existing handlers
                const newSelect = select.cloneNode(true);
                select.parentNode.replaceChild(newSelect, select);
                
                // Add change handler for "אחר" option
                newSelect.addEventListener('change', function() {
                  const otherInputId = this.id + '_other';
                  const otherInput = document.getElementById(otherInputId);
                  if (otherInput) {
                    if (this.value === '__other__') {
                      otherInput.classList.add('show');
                      otherInput.required = this.hasAttribute('required');
                    } else {
                      otherInput.classList.remove('show');
                      otherInput.value = '';
                      otherInput.required = false;
                    }
                  }
                });
              }
            });
            
            variablesContainer.appendChild(cloned);
          });
          
          // Initialize date range pickers after cloning
          if (dateRangePickerIds.length > 0 && window.DateRangePickerService) {
            setTimeout(() => {
              dateRangePickerIds.forEach(pickerId => {
                try {
                  window.DateRangePickerService.initialize(pickerId);
                  window.Logger?.debug('Initialized date range picker', { pickerId, page: 'ai-analysis' });
                } catch (error) {
                  window.Logger?.warn('Error initializing date range picker', { pickerId, error, page: 'ai-analysis' });
                }
              });
            }, 100);
          }
          
          // Restore original container state
          originalModalContainer.innerHTML = originalHtml;
          originalModalContainer.className = originalClass;
          originalModalContainer.style.display = originalDisplay;
          originalModalContainer.style.visibility = '';
          originalModalContainer.style.position = '';
          originalModalContainer.style.left = '';
          
        } catch (error) {
          window.Logger?.error('Error rendering variables using existing function', error, { page: 'ai-analysis' });
          variablesContainer.innerHTML = '<div class="alert alert-danger">שגיאה בטעינת המשתנים. אנא נסה שוב.</div>';
          
          // Try to restore original container
          if (originalModalContainer) {
            try {
              originalModalContainer.innerHTML = '';
              originalModalContainer.style.display = '';
              originalModalContainer.style.visibility = '';
              originalModalContainer.style.position = '';
              originalModalContainer.style.left = '';
            } catch (restoreError) {
              window.Logger?.warn('Error restoring original container', restoreError, { page: 'ai-analysis' });
            }
          }
        }
      } else {
        // Fallback: simple message
        variablesContainer.innerHTML = '<div class="alert alert-warning">טוען משתנים... (פונקציית הרינדור לא זמינה)</div>';
      }

      // Populate selects that need population (after content is in DOM)
      setTimeout(async () => {
        // Populate tickers
        const tickerSelects = variablesContainer.querySelectorAll('select[data-populate-tickers="true"], select[data-needs-ticker-population="true"]');
        for (const select of tickerSelects) {
          if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function') {
            try {
              await window.SelectPopulatorService.populateTickersSelect(select, {
                includeEmpty: true,
                emptyText: 'בחר טיקר...'
              });
              
              // Add "אחר" option
              const otherOption = document.createElement('option');
              otherOption.value = '__other__';
              otherOption.textContent = 'אחר';
              select.appendChild(otherOption);
              
              select.removeAttribute('data-populate-tickers');
              select.removeAttribute('data-needs-ticker-population');
            } catch (error) {
              window.Logger?.warn('Error populating tickers in wizard', error, { page: 'ai-analysis' });
            }
          }
        }

        // Populate trading methods
        const tradingMethodsSelects = variablesContainer.querySelectorAll('select[data-populate-trading-methods="true"]');
        for (const select of tradingMethodsSelects) {
          if (window.AIAnalysisManager && typeof window.AIAnalysisManager.populateTradingMethodsSelect === 'function') {
            try {
              await window.AIAnalysisManager.populateTradingMethodsSelect(select);
              
              // Add "אחר" option
              const otherOption = document.createElement('option');
              otherOption.value = '__other__';
              otherOption.textContent = 'אחר';
              select.appendChild(otherOption);
              
              select.removeAttribute('data-populate-trading-methods');
            } catch (error) {
              window.Logger?.warn('Error populating trading methods in wizard', error, { page: 'ai-analysis' });
            }
          }
        }

        // Populate accounts
        const accountSelects = variablesContainer.querySelectorAll('select[data-populate-accounts="true"]');
        for (const select of accountSelects) {
          if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
            try {
              await window.SelectPopulatorService.populateAccountsSelect(select, {
                includeEmpty: true,
                emptyText: 'בחר חשבון מסחר...',
                defaultFromPreferences: true
              });
              
              select.removeAttribute('data-populate-accounts');
            } catch (error) {
              window.Logger?.warn('Error populating accounts in wizard', error, { page: 'ai-analysis' });
            }
          }
        }

        // Set values from rerun if available
        Object.keys(this.promptVariables).forEach(key => {
          const field = variablesContainer.querySelector(`#wizard_var_${key}, select[name="${key}"], input[name="${key}"]`);
          if (field && this.promptVariables[key]) {
            field.value = this.promptVariables[key];
            // Trigger change event for date range pickers
            if (field.hasAttribute('data-date-range-picker-id')) {
              field.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      }, 250);

      window.Logger?.info('Variables section rendered', { page: 'ai-analysis' });
    },

    /**
     * Setup accordion for step 2
     */
    async setupAccordionForStep2() {
      // Use the existing accordion system from ui-utils.js
      // The accordion will work automatically with toggleSection function
      // We just need to ensure the sections are initialized properly
      
      const stepContainer = document.getElementById('ai-wizard-step-2');
      if (!stepContainer) return;

      // Check if toggleSection is available
      if (typeof window.toggleSection !== 'function' && window.uiUtils && typeof window.uiUtils.toggleSection === 'function') {
        // Make toggleSection globally available if needed
        window.toggleSection = window.uiUtils.toggleSection;
      }

      // Initialize sections state - use accordion mode
      // Variables section open by default, filters section closed
      const filtersSection = stepContainer.querySelector('#wizardFiltersSection');
      const variablesSection = stepContainer.querySelector('#wizardVariablesSection');
      
      if (filtersSection) {
        const sectionBody = filtersSection.querySelector('.section-body');
        if (sectionBody) {
          // Initially closed (if there are filters)
          const hasFilters = filtersSection.querySelector('#wizardFiltersContainer')?.children.length > 0;
          if (hasFilters) {
            this.setElementDisplay(sectionBody, 'none');
          } else {
            // No filters - hide entire section
            this.setElementDisplay(filtersSection, 'none');
          }
        }
      }

      if (variablesSection) {
        const sectionBody = variablesSection.querySelector('.section-body');
        if (sectionBody) {
          // Variables section open by default
          this.setElementDisplay(sectionBody, 'block');
        }
      }
      
      // Setup accordion behavior - when one opens, close the other
      // This is handled by toggleSection with accordionMode, but we need to ensure
      // sections in wizard work with the accordion system
      if (filtersSection && variablesSection) {
        // Add custom accordion handler if toggleSection doesn't work in modal
        const handleAccordion = (sectionToOpen) => {
          const sections = [filtersSection, variablesSection];
          sections.forEach(sec => {
            if (sec !== sectionToOpen) {
              const body = sec.querySelector('.section-body');
              if (body) {
                this.setElementDisplay(body, 'none');
              }
            }
          });
        };
        
        // Store handler for later use
        if (!window.wizardAccordionHandler) {
          window.wizardAccordionHandler = handleAccordion;
        }
      }

      window.Logger?.debug('Accordion setup completed for step 2', { page: 'ai-analysis' });
    },

    /**
     * Setup validation listeners for step 2
     */
    setupStep2ValidationListeners() {
      const stepContainer = document.getElementById('ai-wizard-step-2');
      if (!stepContainer) return;

      // Add change listeners to all inputs in step 2
      const allInputs = stepContainer.querySelectorAll('#wizardVariablesContainer select, #wizardVariablesContainer input, #wizardVariablesContainer textarea, #wizardFiltersContainer select, #wizardFiltersContainer input');
      allInputs.forEach(input => {
        input.addEventListener('change', () => {
          this.validateStep2();
        });
        input.addEventListener('blur', () => {
          this.validateStep2();
        });
      });
    },

    /**
     * Validate step 2 using general validation system
     */
    validateStep2() {
      const stepContainer = document.getElementById('ai-wizard-step-2');
      if (!stepContainer) {
        return false;
      }

      // Clear previous validation errors
      const allFields = stepContainer.querySelectorAll('#wizardVariablesContainer input, #wizardVariablesContainer select, #wizardVariablesContainer textarea, #wizardFiltersContainer input, #wizardFiltersContainer select');
      allFields.forEach(field => {
        if (window.clearFieldValidation) {
          window.clearFieldValidation(field);
        } else if (window.clearFieldError) {
          window.clearFieldError(field);
        }
      });

      let isValid = true;
      const errors = [];

      // Validate filters
      const filtersContainer = stepContainer.querySelector('#wizardFiltersContainer');
      if (filtersContainer) {
        const requiredFilterFields = filtersContainer.querySelectorAll('[required]');
        requiredFilterFields.forEach(field => {
          if (!field.value || field.value.trim() === '') {
            const fieldLabel = window.getFieldLabel ? window.getFieldLabel(field) : (field.labels?.[0]?.textContent || field.name || 'שדה');
            const errorMsg = `${fieldLabel} הוא שדה חובה`;
            
            if (window.showFieldError) {
              window.showFieldError(field, errorMsg);
            }
            
            errors.push(errorMsg);
            isValid = false;
          }
        });
      }

      // Validate required fields in variables container
      const variablesContainer = stepContainer.querySelector('#wizardVariablesContainer');
      if (variablesContainer) {
        const requiredFields = variablesContainer.querySelectorAll('[required]');
        requiredFields.forEach(field => {
          if (!field.value || field.value.trim() === '') {
            const fieldLabel = window.getFieldLabel ? window.getFieldLabel(field) : (field.labels?.[0]?.textContent || field.name || 'שדה');
            const errorMsg = `${fieldLabel} הוא שדה חובה`;
            
            if (window.showFieldError) {
              window.showFieldError(field, errorMsg);
            }
            
            errors.push(errorMsg);
            isValid = false;
          }
        });

        // Validate "אחר" inputs if selected
        const selects = variablesContainer.querySelectorAll('select');
        selects.forEach(select => {
          if (select.value === '__other__') {
            const otherInput = document.getElementById(`${select.id}_other`);
            if (otherInput && otherInput.required && (!otherInput.value || otherInput.value.trim() === '')) {
              const fieldLabel = window.getFieldLabel ? window.getFieldLabel(select) : (select.labels?.[0]?.textContent || select.name || 'שדה');
              const errorMsg = `יש למלא את שדה "אחר" עבור ${fieldLabel}`;
              
              if (window.showFieldError) {
                window.showFieldError(otherInput, errorMsg);
              }
              
              errors.push(errorMsg);
              isValid = false;
            }
          }
        });
      }

      // Enable/disable continue button
      const continueBtn = document.getElementById('wizardContinueToStep3');
      if (continueBtn) {
        continueBtn.disabled = !isValid;
      }

      if (!isValid && errors.length > 0) {
        window.Logger?.debug('Step 2 validation errors', { errors, page: 'ai-analysis' });
        // Show first error as simple notification (using general validation system)
        if (window.showSimpleErrorNotification) {
          window.showSimpleErrorNotification('שגיאת ולידציה', errors[0]);
        } else if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאת ולידציה: ' + errors[0], 'system');
        }
      }

      return isValid;
    },

    /**
     * Load step 3 content
     */
    async loadStep3(analysisId = null) {
      const stepContainer = document.getElementById('ai-wizard-step-3');
      if (!stepContainer) {
        window.Logger?.warn('Step 3 container not found', { page: 'ai-analysis' });
        return;
      }

      if (analysisId) {
        // Load existing analysis results
        await this.loadAnalysisResults(analysisId);
      } else {
        // Generate new analysis
        await this.generateAnalysis();
      }
    },

    /**
     * Generate analysis
     */
    async generateAnalysis() {
      try {
        // Collect data from step 2
        const step2Data = this.collectStep2Data();
        
        if (!this.selectedTemplate || !this.selectedProvider) {
          if (window.NotificationSystem) {
            window.NotificationSystem.showError('נא לבחור תבנית ומנוע AI', 'system');
          }
          return;
        }

        // Build payload
        const payload = this.buildAnalysisPayload();

        window.Logger?.info('🚀 Starting analysis generation', {
          templateId: this.selectedTemplate.id,
          provider: this.selectedProvider,
          payload: JSON.stringify(payload),
          filters: this.filters,
          promptVariables: this.promptVariables,
          page: 'ai-analysis'
        });

        // Show progress overlay
        if (window.AIAnalysisManager && typeof window.AIAnalysisManager.showProgressOverlay === 'function') {
          window.AIAnalysisManager.showProgressOverlay(1, 'מתחיל תהליך יצירת הניתוח...', 'מאתחל את המערכת ומכין את הנתונים');
        }

        // Validate request if validation function available
        if (window.AIAnalysisData?.validateAnalysisRequest) {
          try {
            if (window.AIAnalysisManager && typeof window.AIAnalysisManager.showProgressOverlay === 'function') {
              window.AIAnalysisManager.showProgressOverlay(2, 'מאמת נתונים...', 'בודק תקינות הנתונים והגדרות');
            }

            const validationResult = await window.AIAnalysisData.validateAnalysisRequest({
              template_id: payload.template_id,
              variables: payload.variables,
              provider: payload.provider
            });

            if (!validationResult.is_valid) {
              if (window.AIAnalysisManager && typeof window.AIAnalysisManager.hideProgressOverlay === 'function') {
                window.AIAnalysisManager.hideProgressOverlay();
              }
              
              // Parse validation errors and mark specific fields
              const errorMessage = validationResult.errors.join(', ');
              window.Logger?.error('Validation failed', { errors: validationResult.errors, payload, page: 'ai-analysis' });
              
              // Go back to step 2 so user can fix the issues (values are preserved)
              await this.goToStep(2);
              
              // Mark specific fields with errors using general validation system
              const step2Container = document.getElementById('ai-wizard-step-2');
              if (step2Container) {
                // Try to parse field-specific errors and mark them
                validationResult.errors.forEach(error => {
                  // Try to find field mentioned in error message
                  const variablesContainer = step2Container.querySelector('#wizardVariablesContainer');
                  const filtersContainer = step2Container.querySelector('#wizardFiltersContainer');
                  
                  // Look for common field names in error message
                  const fieldKeys = ['template_id', 'trading_account', 'account_id', 'ticker', 'date_range', 'goal', 'investment_thesis'];
                  fieldKeys.forEach(key => {
                    if (error.toLowerCase().includes(key)) {
                      const field = variablesContainer?.querySelector(`[id*="${key}"], [name*="${key}"]`) ||
                                   filtersContainer?.querySelector(`[id*="${key}"], [name*="${key}"]`);
                      if (field && window.showFieldError) {
                        window.showFieldError(field, error);
                      }
                    }
                  });
                });
                
                // Show general error alert
                let errorAlert = step2Container.querySelector('.validation-error-alert');
                if (!errorAlert) {
                  errorAlert = document.createElement('div');
                  errorAlert.className = 'alert alert-danger validation-error-alert';
                  errorAlert.style.marginTop = '1rem';
                  step2Container.insertBefore(errorAlert, step2Container.firstChild);
                }
                errorAlert.innerHTML = `<strong>שגיאת ולידציה:</strong> ${errorMessage}`;
                
                // Scroll to first error field
                const firstErrorField = step2Container.querySelector('.is-invalid');
                if (firstErrorField) {
                  firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  firstErrorField.focus();
                }
              }
              
              // Show simple error notification
              if (window.showSimpleErrorNotification) {
                window.showSimpleErrorNotification('שגיאת ולידציה', validationResult.errors[0]);
              } else if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאת ולידציה: ' + validationResult.errors[0], 'system');
              }
              
              return;
            }
          } catch (error) {
            window.Logger?.warn('Validation error (continuing anyway)', error, { page: 'ai-analysis' });
          }
        }

        // Generate analysis using AIAnalysisData
        if (window.AIAnalysisData && typeof window.AIAnalysisData.generateAnalysis === 'function') {
          if (window.AIAnalysisManager && typeof window.AIAnalysisManager.showProgressOverlay === 'function') {
            window.AIAnalysisManager.showProgressOverlay(3, 'שולח בקשה...', 'מתחבר למנוע AI ושולח את הבקשה');
          }

          // Pass individual parameters to generateAnalysis (not the whole payload)
          const result = await window.AIAnalysisData.generateAnalysis(
            payload.template_id,
            payload.variables,
            payload.provider
          );

          if (window.AIAnalysisManager && typeof window.AIAnalysisManager.showProgressOverlay === 'function') {
            window.AIAnalysisManager.showProgressOverlay(4, 'ממתין לתגובה...', 'המנוע מעבד את הבקשה');
          }

          if (result && result.id) {
            this.currentAnalysis = result;
            
            // Wait for analysis to complete
            await this.waitForAnalysisComplete(result.id);
            
            // Load and display results
            await this.loadAnalysisResults(result.id);
          } else {
            throw new Error('Analysis generation failed - no ID returned');
          }
        } else {
          throw new Error('AIAnalysisData.generateAnalysis not available');
        }
      } catch (error) {
        window.Logger?.error('Error generating analysis', error, { page: 'ai-analysis' });
        if (window.AIAnalysisManager && typeof window.AIAnalysisManager.hideProgressOverlay === 'function') {
          window.AIAnalysisManager.hideProgressOverlay();
        }
        
        // Build detailed error message
        let errorMessage = error.message || 'שגיאה לא ידועה ביצירת הניתוח';
        const errorDetails = error.errorDetails || [];
        
        // Show notification with main message
        if (window.NotificationSystem) {
          // Extract main message (first line if multiline)
          const mainMsg = errorMessage.split('\n\n')[0];
          window.NotificationSystem.showError('❌ שגיאה ביצירת הניתוח: ' + mainMsg, 'system', { duration: 10000 });
        }
        
        // Go back to step 2 on error so user can fix issues
        await this.goToStep(2);
        
        // Show detailed error in step 2
        const step2Container = document.getElementById('ai-wizard-step-2');
        if (step2Container) {
          let errorAlert = step2Container.querySelector('.validation-error-alert');
          if (!errorAlert) {
            errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger validation-error-alert';
            errorAlert.style.marginTop = '1rem';
            step2Container.insertBefore(errorAlert, step2Container.firstChild);
          }
          
          // Build detailed error HTML
          let errorHTML = `<strong>שגיאה ביצירת הניתוח:</strong><br>${errorMessage.split('\n\n')[0]}`;
          
          if (errorDetails.length > 0) {
            errorHTML += '<br><br><strong>פרטים נוספים:</strong><ul style="margin-bottom: 0; padding-right: 1.5rem;">';
            errorDetails.forEach(detail => {
              errorHTML += `<li>${detail}</li>`;
            });
            errorHTML += '</ul>';
          }
          
          // Add link to settings if quota/rate limit error
          if (error.errorCode && (error.errorCode === 'AI_1007' || error.errorCode === 'AI_1004')) {
            errorHTML += '<br><small><a href="preferences.html#ai-settings" class="text-white text-decoration-underline">לבדיקת הגדרות מכסה ומפתחות API</a></small>';
          }
          
          errorAlert.innerHTML = errorHTML;
        }
      }
    },

    /**
     * Wait for analysis to complete
     */
    async waitForAnalysisComplete(analysisId, maxWait = 60000) {
      const startTime = Date.now();
      while (Date.now() - startTime < maxWait) {
        try {
          if (window.AIAnalysisData && typeof window.AIAnalysisData.getAnalysis === 'function') {
            const analysis = await window.AIAnalysisData.getAnalysis(analysisId);
            if (analysis && analysis.status === 'completed') {
              return analysis;
            }
            if (analysis && analysis.status === 'failed') {
              // Extract detailed error message with provider and reset time info
              let errorMsg = analysis.error_message || 'Analysis failed';
              const errorDetails = [];
              
              // Parse error code and message
              if (errorMsg.includes(': ')) {
                const parts = errorMsg.split(': ', 2);
                if (parts.length >= 2 && parts[0].startsWith('AI_')) {
                  errorMsg = parts[1]; // Use the message part
                }
              }
              
              // Extract additional info from error_data_json if available
              if (analysis.error_data_json) {
                try {
                  const errorData = JSON.parse(analysis.error_data_json);
                  if (errorData.provider) {
                    const providerNames = { 'gemini': 'Gemini', 'perplexity': 'Perplexity' };
                    errorDetails.push(`מנוע: ${providerNames[errorData.provider] || errorData.provider}`);
                  }
                  if (errorData.reset_time) {
                    try {
                      const resetDate = new Date(errorData.reset_time);
                      const formattedTime = resetDate.toLocaleString('he-IL', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      });
                      errorDetails.push(`המכסה מתאפסת ב: ${formattedTime}`);
                    } catch (e) {
                      errorDetails.push(`המכסה מתאפסת ב: ${errorData.reset_time}`);
                    }
                  } else if (errorData.retry_after_minutes !== null && errorData.retry_after_minutes !== undefined) {
                    errorDetails.push(`ניתן לנסות שוב בעוד: ${errorData.retry_after_minutes} דקות`);
                  }
                } catch (e) {
                  window.Logger?.warn('Error parsing error_data_json in wizard', { error: e, page: 'ai-analysis' });
                }
              }
              
              // Build full error message
              let fullErrorMsg = errorMsg;
              if (errorDetails.length > 0) {
                fullErrorMsg += '\n\nפרטים נוספים:\n' + errorDetails.join('\n');
              }
              
              const error = new Error(fullErrorMsg);
              error.errorCode = analysis.error_message?.split(':')[0] || null;
              error.errorDetails = errorDetails;
              throw error;
            }
          }
          // Wait 2 seconds before checking again
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          window.Logger?.warn('Error checking analysis status', error, { page: 'ai-analysis' });
        }
      }
      throw new Error('Analysis timeout - took too long to complete');
    },

    /**
     * Load analysis results
     */
    async loadAnalysisResults(analysisId) {
      const resultsContainer = document.querySelector('#wizardResultsContainer');
      if (!resultsContainer) {
        window.Logger?.warn('Results container not found', { page: 'ai-analysis' });
        return;
      }

      try {
        // Show loading
        resultsContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">טוען תוצאות...</span></div></div>';

        // Load analysis data
        let analysis = null;
        if (window.AIAnalysisData && typeof window.AIAnalysisData.getAnalysis === 'function') {
          analysis = await window.AIAnalysisData.getAnalysis(analysisId);
        }

        if (!analysis) {
          throw new Error('Analysis not found');
        }

        this.currentAnalysis = analysis;
        
        // Update AIAnalysisManager.currentAnalysis so saveAsNote and export work
        if (window.AIAnalysisManager) {
          window.AIAnalysisManager.currentAnalysis = analysis;
        }

        // Hide progress overlay
        if (window.AIAnalysisManager && typeof window.AIAnalysisManager.hideProgressOverlay === 'function') {
          window.AIAnalysisManager.hideProgressOverlay();
        }

        // Render results using AIResultRenderer
        if (window.AIResultRenderer && typeof window.AIResultRenderer.render === 'function') {
          await window.AIResultRenderer.render(analysis, resultsContainer);
        } else {
          // Fallback: simple display
          resultsContainer.innerHTML = `<div class="markdown-body">${analysis.response_text || 'אין תוצאות להצגה'}</div>`;
        }

        // Update history if manager is available
        if (window.AIAnalysisManager && typeof window.AIAnalysisManager.renderHistory === 'function') {
          // Reload history to show new analysis
          if (window.AIAnalysisData && typeof window.AIAnalysisData.loadHistory === 'function') {
            const history = await window.AIAnalysisData.loadHistory({ force: true });
            window.AIAnalysisManager.history = history || [];
            window.AIAnalysisManager.renderHistory();
          }
        }

        window.Logger?.info('Analysis results loaded and displayed', { analysisId, page: 'ai-analysis' });
      } catch (error) {
        window.Logger?.error('Error loading analysis results', error, { page: 'ai-analysis' });
        if (resultsContainer) {
          resultsContainer.innerHTML = `<div class="alert alert-danger">שגיאה בטעינת התוצאות: ${error.message}</div>`;
        }
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בטעינת התוצאות', 'system');
        }
      }
    },

    /**
     * Collect data from step 2
     */
    collectStep2Data() {
      const stepContainer = document.getElementById('ai-wizard-step-2');
      if (!stepContainer) {
        window.Logger?.warn('Step 2 container not found for data collection', { page: 'ai-analysis' });
        return { filters: {}, promptVariables: {} };
      }

      // Collect filters
      const filtersContainer = stepContainer.querySelector('#wizardFiltersContainer');
      const filters = {};
      if (filtersContainer) {
        const filterInputs = filtersContainer.querySelectorAll('select, input');
        filterInputs.forEach(input => {
          if (input.name && input.value) {
            filters[input.name] = input.value;
          }
        });
      }

      // Collect prompt variables (exclude filters and trading_account if it's already in filters)
      const variablesContainer = stepContainer.querySelector('#wizardVariablesContainer');
      const promptVariables = {};
      const filterKeys = ['trading_account', 'trading_account_id', 'account_id'];
      
      // Check if trading_account is already in filters - if so, exclude it from variables
      const hasAccountInFilters = Object.keys(filters).some(key => filterKeys.includes(key));
      
      if (variablesContainer) {
        const variableInputs = variablesContainer.querySelectorAll('select, input, textarea');
        variableInputs.forEach(input => {
          // Skip "אחר" inputs - handle them separately
          if (input.id && input.id.endsWith('_other')) {
            // Check if "אחר" is selected for the related select
            const selectId = input.id.replace('_other', '');
            const select = document.getElementById(selectId);
            if (select && select.value === '__other__' && input.value) {
              // Remove wizard_var_ prefix if exists to get the real key
              let key = selectId;
              if (key.includes('wizard_var_')) {
                key = key.replace('wizard_var_', '');
              }
              // Skip if it's a filter key or if account is already in filters
              if (!filterKeys.includes(key) && !(hasAccountInFilters && filterKeys.includes(key))) {
                promptVariables[key] = input.value;
              }
            }
            return;
          }
          
          // Get key from name or id
          let key = null;
          if (input.name) {
            key = input.name.replace('wizard_var_', '').replace('var_modal_', '');
          } else if (input.id && input.id.includes('wizard_var_')) {
            key = input.id.replace('wizard_var_', '').replace('var_modal_', '');
          } else if (input.id && input.id.includes('var_modal_')) {
            key = input.id.replace('var_modal_', '');
          }
          
          if (!key) {
            return; // Skip if we can't determine the key
          }
          
          // Skip trading_account if it's already in filters
          if (hasAccountInFilters && filterKeys.includes(key)) {
            window.Logger?.debug('Skipping trading_account from variables - already in filters', { key, page: 'ai-analysis' });
            return;
          }
          
          // Skip if no value and not required
          if (!input.value || input.value.trim() === '') {
            if (input.required) {
              // Required field is empty - still collect it but with empty value for validation
              promptVariables[key] = '';
            }
            return;
          }
          
          if (!key) return;

          // Skip filters (handled separately)
          if (filterKeys.includes(key)) return;
          
          // Skip if no value (empty selects/inputs)
          if (!input.value) return;

          // Handle ticker fields - convert ID to symbol text
          if ((key === 'stock_ticker' || key === 'ticker_symbol') && input.tagName === 'SELECT') {
            const selectedOption = input.options[input.selectedIndex];
            if (selectedOption && selectedOption.textContent) {
              const optionText = selectedOption.textContent.trim();
              const tickerSymbol = optionText.includes(' - ') 
                ? optionText.split(' - ')[0].trim()
                : optionText;
              promptVariables[key] = tickerSymbol;
            }
          } else {
            promptVariables[key] = input.value;
          }
        });

        // Handle date range from DateRangePickerService (wizard_var_ prefix)
        if (window.DateRangePickerService) {
          // Try both wizard_var_ and var_modal_ prefixes
          const dateRangeIds = [
            'wizard_var_date_range',
            'var_modal_date_range'
          ];
          
          for (const dateRangeId of dateRangeIds) {
            const dateRangeField = variablesContainer.querySelector(`[data-date-range-picker-id="${dateRangeId}"]`);
            if (dateRangeField) {
              try {
                const dateRangeValue = window.DateRangePickerService.getRangeString(dateRangeId);
                if (dateRangeValue) {
                  promptVariables['date_range'] = dateRangeValue;
                  window.Logger?.debug('Collected date_range from DateRangePickerService', {
                    dateRangeId,
                    dateRangeValue,
                    page: 'ai-analysis'
                  });
                  break; // Found and collected, no need to check other IDs
                }
              } catch (error) {
                window.Logger?.warn('Error getting date range from DateRangePickerService', {
                  dateRangeId,
                  error: error.message,
                  page: 'ai-analysis'
                });
              }
            }
          }
          
          // Also check for any date range picker in container
          const dateRangeFields = variablesContainer.querySelectorAll('[data-date-range-picker-id]');
          if (dateRangeFields.length > 0 && !promptVariables['date_range']) {
            dateRangeFields.forEach(dateRangeField => {
              const dateRangeId = dateRangeField.getAttribute('data-date-range-picker-id');
              if (dateRangeId) {
                try {
                  const dateRangeValue = window.DateRangePickerService.getRangeString(dateRangeId);
                  if (dateRangeValue) {
                    promptVariables['date_range'] = dateRangeValue;
                    window.Logger?.debug('Collected date_range from DateRangePickerService (fallback)', {
                      dateRangeId,
                      dateRangeValue,
                      page: 'ai-analysis'
                    });
                  }
                } catch (error) {
                  window.Logger?.warn('Error getting date range (fallback)', {
                    dateRangeId,
                    error: error.message,
                    page: 'ai-analysis'
                  });
                }
              }
            });
          }
        }
      }

      // Convert trading_account to trading_account_id for filters
      if (filters.trading_account && !filters.trading_account_id) {
        filters.trading_account_id = filters.trading_account;
        delete filters.trading_account;
      }

      this.filters = filters;
      this.promptVariables = promptVariables;

      window.Logger?.debug('Collected step 2 data', {
        filtersCount: Object.keys(filters).length,
        variablesCount: Object.keys(promptVariables).length,
        page: 'ai-analysis'
      });

      return { filters, promptVariables };
    },

    /**
     * Build analysis payload
     */
    buildAnalysisPayload() {
      // Collect data from step 2 (always fresh collection)
      const step2Data = this.collectStep2Data();
      this.filters = step2Data.filters;
      this.promptVariables = step2Data.promptVariables;

      window.Logger?.debug('Building analysis payload', {
        filters: this.filters,
        promptVariables: this.promptVariables,
        filtersCount: Object.keys(this.filters).length,
        variablesCount: Object.keys(this.promptVariables).length,
        page: 'ai-analysis'
      });

      // Build v2.0 structure - ensure prompt_variables is not empty or has at least response_language
      const prompt_variables = {
        ...this.promptVariables,
        response_language: this.selectedLanguage
      };

      // Ensure prompt_variables is not completely empty (must have at least response_language)
      if (Object.keys(prompt_variables).length === 0 || (Object.keys(prompt_variables).length === 1 && prompt_variables.response_language)) {
        window.Logger?.warn('Warning: prompt_variables is empty or only has response_language', {
          prompt_variables,
          filters: this.filters,
          page: 'ai-analysis'
        });
      }

      // Build v2.0 structure
      const variables = {
        version: '2.0',
        prompt_variables: prompt_variables,
        filters: this.filters,
        trade_selection: {},
        metadata: {
          analysis_scope: this.selectedTemplate?.name || 'unknown',
          filters_applied: Object.keys(this.filters),
          created_via: 'wizard'
        }
      };

      const payload = {
        template_id: this.selectedTemplate.id,
        provider: this.selectedProvider,
        variables: variables
      };

      window.Logger?.debug('Built payload', {
        template_id: payload.template_id,
        provider: payload.provider,
        variables_version: variables.version,
        prompt_variables_count: Object.keys(prompt_variables).length,
        filters_count: Object.keys(this.filters).length,
        page: 'ai-analysis'
      });

      return payload;
    }
  };

  // Expose to global scope
  window.AIAnalysisWizard = AIAnalysisWizard;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AIAnalysisWizard.init();
    });
  } else {
    AIAnalysisWizard.init();
  }
})();

