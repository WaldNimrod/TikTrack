/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 3
 * 
 * DATA MANIPULATION (1)
 * - saveAsNote() - Save analysis result as note using standard notes modal interface
 * 
 * UTILITIES (3)
 * - createAnalysisHeader() - Create header HTML indicating note is from AI analysis
 * - _escapeHtml() - Escape HTML to prevent XSS
 * - convertMarkdownToHTML() - Convert markdown text to HTML
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
     * Uses the standard notes modal interface - user selects related type and object within the modal
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

      if (!window.ModalManagerV2) {
        window.Logger?.warn('ModalManagerV2 not available for opening notes modal', { page: 'ai-analysis' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('לא ניתן לפתוח מודול הערות', 'system');
        }
        return;
      }

      try {
        // Convert markdown to HTML
        window.Logger?.info('Converting markdown to HTML', { 
          page: 'ai-analysis',
          responseTextLength: analysisResult.response_text?.length || 0
        });
        const htmlContent = await this.convertMarkdownToHTML(analysisResult.response_text);
        
        // Add header indicating this is an AI Analysis note
        const analysisHeader = this.createAnalysisHeader(analysisResult);
        const fullContent = `${analysisHeader}\n${htmlContent}`;

        // Open notes modal with pre-filled content
        // User will select related type and object within the modal (standard interface)
        window.Logger?.info('Opening notes modal with pre-filled content', { 
          page: 'ai-analysis',
          htmlContentLength: fullContent?.length || 0
        });
        
        await window.ModalManagerV2.showModal('notesModal', 'add', null, {
          prefill: {
            noteContent: fullContent
          }
        });
        
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
     * Create header for AI Analysis note
     * Indicates that this note was created from an AI analysis
     */
    createAnalysisHeader(analysisResult) {
      const templateName = analysisResult.template_name || 'לא ידוע';
      const provider = analysisResult.provider || 'לא ידוע';
      const createdAt = analysisResult.created_at ? 
        (window.dateUtils?.formatDateTime ? window.dateUtils.formatDateTime(analysisResult.created_at) : new Date(analysisResult.created_at).toLocaleString('he-IL')) :
        'לא ידוע';
      
      return `<div style="border-bottom: 2px solid #26baac; padding-bottom: 10px; margin-bottom: 15px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
          <span style="font-size: 18px;">🤖</span>
          <strong style="color: #26baac; font-size: 16px;">ניתוח AI</strong>
        </div>
        <div style="font-size: 13px; color: #666; margin-top: 5px;">
          <div>תבנית: <strong>${this._escapeHtml(templateName)}</strong></div>
          <div>מנוע AI: <strong>${this._escapeHtml(provider)}</strong></div>
          <div>נוצר ב: <strong>${createdAt}</strong></div>
        </div>
      </div>`;
    },

    /**
     * Escape HTML to prevent XSS
     */
    _escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
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

  };

  // Expose to global scope
  window.AINotesIntegration = AINotesIntegration;

  window.Logger?.info('✅ AI Notes Integration loaded', { page: 'ai-analysis' });
})();

