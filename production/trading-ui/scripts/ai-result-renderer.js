/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 2
 * 
 * UI UPDATES (1)
 * - render() - Render analysis result in modal or page container
 * 
 * UTILITIES (1)
 * - convertMarkdownBasic() - Basic markdown to HTML conversion (fallback)
 * 
 * ==========================================
 */
/**
 * AI Result Renderer
 * ======================================
 * Component for rendering AI analysis results
 *
 * Responsibilities:
 * - Render markdown results
 * - Display infographics
 * - Show action buttons
 *
 * @version 1.0.0
 * @created January 28, 2025
 * @author TikTrack Development Team
 */
(function() {
  'use strict';

  const AIResultRenderer = {
    version: '1.0.0',

    /**
     * Render analysis result
     */
    async render(analysisResult) {
      // Check if we're in modal or page
      const container = document.getElementById('resultsContainerModal') || document.getElementById('resultsContainer');
      if (!container) {
        window.Logger?.warn('Results container not found', { page: 'ai-analysis' });
        return;
      }

      if (!analysisResult || !analysisResult.response_text) {
        container.textContent = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-warning';
        alert.textContent = 'אין תוצאות להצגה';
        container.appendChild(alert);
        return;
      }

      try {
        // Convert markdown to HTML
        let htmlContent;
        if (typeof marked !== 'undefined') {
          htmlContent = marked.parse(analysisResult.response_text);
        } else {
          // Basic fallback
          htmlContent = this.convertMarkdownBasic(analysisResult.response_text);
        }

        container.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        doc.body.childNodes.forEach(node => {
            container.appendChild(node.cloneNode(true));
        });
        container.className = 'markdown-body';

        window.Logger?.info('Results rendered', { page: 'ai-analysis', requestId: analysisResult.id });
      } catch (error) {
        window.Logger?.error('Error rendering results', error, { page: 'ai-analysis' });
        container.textContent = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.textContent = 'שגיאה בהצגת תוצאות';
        container.appendChild(alert);
      }
    },

    /**
     * Basic markdown conversion (fallback)
     */
    convertMarkdownBasic(text) {
      return text
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    },
  };

  // Expose to global scope
  window.AIResultRenderer = AIResultRenderer;

  window.Logger?.info('✅ AI Result Renderer loaded', { page: 'ai-analysis' });
})();

