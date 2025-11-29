/**
 * AI Export Service
 * ======================================
 * Service for exporting AI analysis results
 *
 * Responsibilities:
 * - Export to PDF
 * - Export to Markdown
 * - Export to HTML
 *
 * @version 1.0.0
 * @created January 28, 2025
 * @author TikTrack Development Team
 */
(function() {
  'use strict';

  const AIExportService = {
    version: '1.0.0',

    /**
     * Export to PDF
     */
    async exportToPDF(analysisResult) {
      if (!analysisResult) {
        throw new Error('No analysis result to export');
      }

      await window.AIAnalysisData?.exportToPDF(analysisResult);
    },

    /**
     * Export to Markdown
     */
    async exportToMarkdown(analysisResult) {
      if (!analysisResult) {
        throw new Error('No analysis result to export');
      }

      await window.AIAnalysisData?.exportToMarkdown(analysisResult);
    },

    /**
     * Export to HTML
     */
    async exportToHTML(analysisResult) {
      if (!analysisResult) {
        throw new Error('No analysis result to export');
      }

      await window.AIAnalysisData?.exportToHTML(analysisResult);
    },
  };

  // Expose to global scope
  window.AIExportService = AIExportService;

  window.Logger?.info('✅ AI Export Service loaded', { page: 'ai-analysis' });
})();

