/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 4
 * 
 * UI UPDATES (2)
 * - render() - Render templates as cards in page container
 * - renderModal() - Render templates as cards in modal container
 * 
 * DATA LOADING (1)
 * - getSelectedTemplate() - Get currently selected template from AIAnalysisManager
 * 
 * EVENT HANDLING (1)
 * - selectTemplate() - Handle template selection (legacy - redirects to modal flow)
 * 
 * ==========================================
 */
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

      // Clear container but preserve structure
      const sectionBody = container.closest('.section-body');
      if (sectionBody) {
        // Only clear the container, not the entire section
        container.innerHTML = '';
      } else {
        container.innerHTML = '';
      }

      // Use for...of loop instead of forEach to support async/await
      for (const template of this.templates) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-3';

        const card = document.createElement('div');
        card.className = 'card h-100 template-card';
        // Use string template with quotes for template ID to ensure proper evaluation
        // Open template selection modal first, then variables modal
        card.setAttribute('data-onclick', `window.AIAnalysisManager.handleTemplateSelectionFromModal('${template.id}')`);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body d-flex flex-column';

        const icon = document.createElement('div');
        icon.className = 'text-center mb-3';
        
        // Use IconSystem to render icon
        let iconHTML = '';
        if (window.IconSystem && typeof window.IconSystem.renderIcon === 'function') {
          try {
            iconHTML = await window.IconSystem.renderIcon('entity', 'research', {
              size: '48',
              alt: 'תבנית',
              class: 'section-icon template-icon'
            });
          } catch (error) {
            window.Logger?.warn('Failed to render icon via IconSystem, using fallback', { error, page: 'ai-analysis' });
            iconHTML = '<img src="images/icons/entities/research.svg" alt="תבנית" class="section-icon template-icon">';
          }
        } else {
          // Fallback if IconSystem not available
          iconHTML = '<img src="images/icons/entities/research.svg" alt="תבנית" class="section-icon template-icon">';
        }
        icon.innerHTML = iconHTML;

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
      }

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

      // Use for...of loop instead of forEach to support async/await
      for (const template of this.templates) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-3';

        const card = document.createElement('div');
        card.className = 'card h-100 template-card';
        // Open variables modal directly from template selection modal
        card.setAttribute('data-onclick', `window.AIAnalysisManager.handleTemplateSelectionFromModal('${template.id}')`);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body d-flex flex-column';

        const icon = document.createElement('div');
        icon.className = 'text-center mb-3';
        
        // Use IconSystem to render icon
        let iconHTML = '';
        if (window.IconSystem && typeof window.IconSystem.renderIcon === 'function') {
          try {
            iconHTML = await window.IconSystem.renderIcon('entity', 'research', {
              size: '48',
              alt: 'תבנית',
              class: 'section-icon template-icon'
            });
          } catch (error) {
            window.Logger?.warn('Failed to render icon via IconSystem, using fallback', { error, page: 'ai-analysis' });
            iconHTML = '<img src="images/icons/entities/research.svg" alt="תבנית" class="section-icon template-icon">';
          }
        } else {
          // Fallback if IconSystem not available
          iconHTML = '<img src="images/icons/entities/research.svg" alt="תבנית" class="section-icon template-icon">';
        }
        icon.innerHTML = iconHTML;

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
      }

      window.Logger?.info('Templates rendered in modal', { page: 'ai-analysis', count: this.templates.length });
    },

    /**
     * Select template (legacy - redirects to new modal flow)
     */
    async selectTemplate(templateId) {
      window.Logger?.info('selectTemplate called', { page: 'ai-analysis', templateId, AIAnalysisManagerAvailable: !!window.AIAnalysisManager });
      
      if (window.AIAnalysisManager) {
        // Convert templateId to string for handleTemplateSelectionFromModal
        const id = typeof templateId === 'number' ? String(templateId) : templateId;
        // Use the new modal flow - ensure we call it with proper context
        await window.AIAnalysisManager.handleTemplateSelectionFromModal.call(window.AIAnalysisManager, id);
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

