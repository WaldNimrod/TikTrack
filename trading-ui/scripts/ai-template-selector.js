/**
 * AI Template Selector
 * ======================================
 * Component for selecting AI analysis templates
 *
 * Responsibilities:
 * - Display templates as cards
 * - Handle template selection
 * - Integrate with AIAnalysisManager
 *
 * @version 1.0.0
 * @created January 28, 2025
 * @author TikTrack Development Team
 */
(function() {
  'use strict';

  const AITemplateSelector = {
    version: '1.0.0',
    templates: [],

    /**
     * Render templates
     */
    async render(templates) {
      const container = document.getElementById('templatesContainer');
      if (!container) {
        window.Logger?.warn('Templates container not found', { page: 'ai-analysis' });
        return;
      }

      this.templates = templates || [];

      if (this.templates.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-warning">אין תבניות זמינות</div></div>';
        return;
      }

      container.innerHTML = '';

      this.templates.forEach((template) => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-3';

        const card = document.createElement('div');
        card.className = 'card h-100';
        card.style.cursor = 'pointer';
        // Use string template with quotes for template ID to ensure proper evaluation
        // Open template selection modal first, then variables modal
        card.setAttribute('data-onclick', `window.AIAnalysisManager.openTemplateSelectionModal('${template.id}')`);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body d-flex flex-column';

        const icon = document.createElement('div');
        icon.className = 'text-center mb-3';
        icon.innerHTML = '<img src="images/icons/entities/research.svg" alt="תבנית" class="section-icon" style="width: 48px; height: 48px;">';

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
        container.appendChild(col);
      });

      window.Logger?.info('Templates rendered', { page: 'ai-analysis', count: this.templates.length });
    },

    /**
     * Render templates in modal
     */
    async renderModal(templates) {
      const container = document.getElementById('templatesContainerModal');
      if (!container) {
        window.Logger?.warn('Templates container modal not found', { page: 'ai-analysis' });
        return;
      }

      this.templates = templates || [];

      if (this.templates.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-warning">אין תבניות זמינות</div></div>';
        return;
      }

      container.innerHTML = '';

      this.templates.forEach((template) => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-3';

        const card = document.createElement('div');
        card.className = 'card h-100';
        card.style.cursor = 'pointer';
        // Open variables modal directly from template selection modal
        card.setAttribute('data-onclick', `window.AIAnalysisManager.openTemplateSelectionModal('${template.id}')`);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body d-flex flex-column';

        const icon = document.createElement('div');
        icon.className = 'text-center mb-3';
        icon.innerHTML = '<img src="images/icons/entities/research.svg" alt="תבנית" class="section-icon" style="width: 48px; height: 48px;">';

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
        container.appendChild(col);
      });

      window.Logger?.info('Templates rendered in modal', { page: 'ai-analysis', count: this.templates.length });
    },

    /**
     * Select template
     */
    selectTemplate(templateId) {
      window.Logger?.info('selectTemplate called', { page: 'ai-analysis', templateId, AIAnalysisManagerAvailable: !!window.AIAnalysisManager });
      
      if (window.AIAnalysisManager) {
        // Convert templateId to number if it's a string
        const id = typeof templateId === 'string' ? parseInt(templateId, 10) : templateId;
        window.AIAnalysisManager.handleTemplateSelection(id);
      } else {
        window.Logger?.error('AIAnalysisManager not available', { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('מערכת ניתוח AI לא זמינה', 'system');
        }
      }
    },

    /**
     * Get selected template
     */
    getSelectedTemplate() {
      if (window.AIAnalysisManager) {
        return window.AIAnalysisManager.selectedTemplate;
      }
      return null;
    },
  };

  // Expose to global scope
  window.AITemplateSelector = AITemplateSelector;

  window.Logger?.info('✅ AI Template Selector loaded', { page: 'ai-analysis' });
})();

