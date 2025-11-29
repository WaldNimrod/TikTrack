/**
 * AI Analysis Data Service
 * ======================================
 * Unified loader for AI analysis data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load templates list via API (with cache bust for local file protocol)
 * - Generate analysis requests
 * - Load analysis history
 * - Manage LLM provider settings
 * - Save analysis as note
 * - Export analysis (PDF, Markdown, HTML)
 * - CacheSyncManager integration for automatic cache invalidation
 *
 * Related Documentation:
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * - documentation/04-FEATURES/AI_ANALYSIS_SYSTEM_DEVELOPER_GUIDE.md
 *
 * @version 1.0.0
 * @created January 28, 2025
 * @author TikTrack Development Team
 */
(function aiAnalysisDataService() {
  const TEMPLATES_CACHE_KEY = 'ai-analysis-templates';
  const HISTORY_CACHE_KEY = 'ai-analysis-history';
  const TEMPLATES_TTL = 60 * 60 * 1000; // 1 hour
  const HISTORY_TTL = 5 * 60 * 1000; // 5 minutes
  const PAGE_LOG_CONTEXT = { page: 'ai-analysis-data' };

  function resolveBaseUrl() {
    if (typeof window.API_BASE_URL === 'string' && window.API_BASE_URL.length > 0) {
      return window.API_BASE_URL.endsWith('/') ? window.API_BASE_URL : `${window.API_BASE_URL}/`;
    }

    if (window.location?.origin && window.location.origin !== 'null') {
      return window.location.origin.endsWith('/')
        ? window.location.origin
        : `${window.location.origin}/`;
    }

    return '';
  }

  function buildUrl(path) {
    const base = resolveBaseUrl();
    if (!base || path.startsWith('http')) {
      return path;
    }
    return `${base}${path.replace(/^\//, '')}`;
  }

  async function saveToCache(key, data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }

    const ttl = options.ttl || TEMPLATES_TTL;
    try {
      await window.UnifiedCacheManager.save(key, data, { ttl });
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to save AI analysis cache', {
        ...PAGE_LOG_CONTEXT,
        key,
        error: error?.message,
      });
    }
  }

  async function getFromCache(key, options = {}) {
    if (!window.UnifiedCacheManager?.get) {
      return null;
    }

    const ttl = options.ttl || TEMPLATES_TTL;
    try {
      return await window.UnifiedCacheManager.get(key, { ttl });
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to get AI analysis cache', {
        ...PAGE_LOG_CONTEXT,
        key,
        error: error?.message,
      });
      return null;
    }
  }

  async function invalidateCache(key) {
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('ai-analysis-updated');
        return;
      } catch (error) {
        window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      }
    }

    if (!window.UnifiedCacheManager) {
      return;
    }

    try {
      if (typeof window.UnifiedCacheManager.invalidate === 'function') {
        await window.UnifiedCacheManager.invalidate(key);
        return;
      }

      if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
        await window.UnifiedCacheManager.clearByPattern(key);
      }
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to invalidate AI analysis cache', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
    }
  }

  /**
   * Load templates from API
   */
  async function loadTemplates(options = {}) {
    try {
      const { force = false } = options || {};

      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure && !force) {
        return await window.CacheTTLGuard.ensure('ai-analysis-templates', async () => {
          window.Logger?.debug?.('🔄 Loading templates from API...', PAGE_LOG_CONTEXT);
          const response = await fetch(buildUrl('/api/ai-analysis/templates'));

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const templates = Array.isArray(data?.data) ? data.data : [];

          window.Logger?.debug?.('✅ Templates loaded from API', {
            ...PAGE_LOG_CONTEXT,
            count: templates.length,
          });
          return templates;
        });
      }

      // Fallback if CacheTTLGuard not available (existing logic)
      if (!force) {
        const cached = await getFromCache(TEMPLATES_CACHE_KEY, { ttl: TEMPLATES_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 Templates loaded from cache', PAGE_LOG_CONTEXT);
          return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
        }
      }

      window.Logger?.debug?.('🔄 Loading templates from API...', PAGE_LOG_CONTEXT);
      const response = await fetch(buildUrl('/api/ai-analysis/templates'));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const templates = Array.isArray(data?.data) ? data.data : [];

      await saveToCache(TEMPLATES_CACHE_KEY, templates, { ttl: TEMPLATES_TTL });

      window.Logger?.debug?.('✅ Templates loaded from API', {
        ...PAGE_LOG_CONTEXT,
        count: templates.length,
      });
      return templates;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading templates', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      window.showErrorNotification?.('שגיאה', 'שגיאה בטעינת תבניות');
      throw error;
    }
  }

  /**
   * Generate analysis
   */
  async function generateAnalysis(templateId, variables, provider) {
    try {
      window.Logger?.info?.('🚀 Generating AI analysis...', {
        ...PAGE_LOG_CONTEXT,
        templateId,
        provider,
      });

      const response = await fetch(buildUrl('/api/ai-analysis/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          template_id: templateId,
          variables: variables,
          provider: provider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        // Invalidate history cache
        await invalidateCache(HISTORY_CACHE_KEY);

        window.Logger?.info?.('✅ Analysis generated successfully', {
          ...PAGE_LOG_CONTEXT,
          requestId: data.data?.id,
        });

        return data.data;
      } else {
        throw new Error(data.message || 'שגיאה ביצירת ניתוח');
      }
    } catch (error) {
      window.Logger?.error?.('❌ Error generating analysis', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      window.showErrorNotification?.('שגיאה', error.message || 'שגיאה ביצירת ניתוח');
      throw error;
    }
  }

  /**
   * Load analysis history
   */
  async function loadHistory(options = {}) {
    try {
      const { force = false, limit = 50, offset = 0 } = options || {};

      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure && !force) {
        return await window.CacheTTLGuard.ensure('ai-analysis-history', async () => {
          window.Logger?.debug?.('🔄 Loading history from API...', PAGE_LOG_CONTEXT);
          const url = new URL(buildUrl('/api/ai-analysis/history'));
          url.searchParams.set('limit', limit);
          url.searchParams.set('offset', offset);

          const response = await fetch(url.toString(), {
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const history = Array.isArray(data?.data) ? data.data : [];

          window.Logger?.debug?.('✅ History loaded from API', {
            ...PAGE_LOG_CONTEXT,
            count: history.length,
          });
          return history;
        });
      }

      // Fallback if CacheTTLGuard not available (existing logic)
      if (!force) {
        const cached = await getFromCache(HISTORY_CACHE_KEY, { ttl: HISTORY_TTL });
        if (cached) {
          window.Logger?.debug?.('📦 History loaded from cache', PAGE_LOG_CONTEXT);
          return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
        }
      }

      window.Logger?.debug?.('🔄 Loading history from API...', PAGE_LOG_CONTEXT);
      const url = new URL(buildUrl('/api/ai-analysis/history'));
      url.searchParams.set('limit', limit);
      url.searchParams.set('offset', offset);

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const history = Array.isArray(data?.data) ? data.data : [];

      await saveToCache(HISTORY_CACHE_KEY, history, { ttl: HISTORY_TTL });

      window.Logger?.debug?.('✅ History loaded from API', {
        ...PAGE_LOG_CONTEXT,
        count: history.length,
      });
      return history;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading history', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      window.showErrorNotification?.('שגיאה', 'שגיאה בטעינת היסטוריה');
      throw error;
    }
  }

  /**
   * Get LLM provider settings
   */
  async function getLLMProviderSettings() {
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure('ai-analysis-providers', async () => {
          const response = await fetch(buildUrl('/api/ai-analysis/llm-provider'), {
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return data.status === 'success' ? data.data : null;
        });
      }

      // Fallback if CacheTTLGuard not available
      const response = await fetch(buildUrl('/api/ai-analysis/llm-provider'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.status === 'success' ? data.data : null;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading LLM provider settings', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      throw error;
    }
  }

  /**
   * Update LLM provider settings
   */
  async function updateLLMProviderSettings(provider, apiKey, validate = true) {
    try {
      const response = await fetch(buildUrl('/api/ai-analysis/llm-provider'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          provider: provider,
          api_key: apiKey,
          validate: validate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.status === 'success' ? data.data : null;
    } catch (error) {
      window.Logger?.error?.('❌ Error updating LLM provider settings', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      throw error;
    }
  }

  /**
   * Save analysis as note
   */
  async function saveAsNote(analysisResult, relatedType, relatedId) {
    try {
      if (!window.NotesData?.createNote) {
        throw new Error('NotesData service not available');
      }

      // Convert markdown to HTML (basic conversion)
      const htmlContent = await convertMarkdownToHTML(analysisResult.response_text);

      const payload = {
        content: htmlContent,
        related_type_id: relatedType,
        related_id: relatedId,
      };

      const response = await window.NotesData.createNote({ payload });

      window.Logger?.info?.('✅ Analysis saved as note', {
        ...PAGE_LOG_CONTEXT,
        relatedType,
        relatedId,
      });

      return response;
    } catch (error) {
      window.Logger?.error?.('❌ Error saving analysis as note', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      throw error;
    }
  }

  /**
   * Convert markdown to HTML
   */
  async function convertMarkdownToHTML(markdownText) {
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
  }

  /**
   * Export to PDF
   */
  async function exportToPDF(analysisResult) {
    try {
      if (typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF library not available');
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Convert markdown to HTML first
      const htmlContent = await convertMarkdownToHTML(analysisResult.response_text);

      // Create a temporary div to render HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Get text content
      const textContent = tempDiv.textContent || tempDiv.innerText || '';

      // Split text into pages
      const lines = doc.splitTextToSize(textContent, 180);
      let y = 20;

      doc.setFontSize(16);
      doc.text('ניתוח AI', 105, y, { align: 'center' });
      y += 10;

      doc.setFontSize(12);
      lines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 10, y);
        y += 7;
      });

      document.body.removeChild(tempDiv);

      // Save PDF
      doc.save(`ai-analysis-${analysisResult.id || Date.now()}.pdf`);

      window.Logger?.info?.('✅ Analysis exported to PDF', PAGE_LOG_CONTEXT);
    } catch (error) {
      window.Logger?.error?.('❌ Error exporting to PDF', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      window.showErrorNotification?.('שגיאה', 'שגיאה בייצוא ל-PDF');
      throw error;
    }
  }

  /**
   * Export to Markdown
   */
  async function exportToMarkdown(analysisResult) {
    try {
      const blob = new Blob([analysisResult.response_text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-analysis-${analysisResult.id || Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.Logger?.info?.('✅ Analysis exported to Markdown', PAGE_LOG_CONTEXT);
    } catch (error) {
      window.Logger?.error?.('❌ Error exporting to Markdown', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      window.showErrorNotification?.('שגיאה', 'שגיאה בייצוא ל-Markdown');
      throw error;
    }
  }

  /**
   * Export to HTML
   */
  async function exportToHTML(analysisResult) {
    try {
      const htmlContent = await convertMarkdownToHTML(analysisResult.response_text);
      const fullHTML = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ניתוח AI - ${analysisResult.id || 'Analysis'}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.2.0/github-markdown.min.css">
    <style>
        body { padding: 20px; }
        .markdown-body { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="markdown-body">
        ${htmlContent}
    </div>
</body>
</html>`;

      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-analysis-${analysisResult.id || Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.Logger?.info?.('✅ Analysis exported to HTML', PAGE_LOG_CONTEXT);
    } catch (error) {
      window.Logger?.error?.('❌ Error exporting to HTML', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      window.showErrorNotification?.('שגיאה', 'שגיאה בייצוא ל-HTML');
      throw error;
    }
  }

  // Expose to global scope
  window.AIAnalysisData = {
    loadTemplates,
    generateAnalysis,
    loadHistory,
    getLLMProviderSettings,
    updateLLMProviderSettings,
    saveAsNote,
    exportToPDF,
    exportToMarkdown,
    exportToHTML,
  };

  window.Logger?.info?.('✅ AI Analysis Data Service loaded', PAGE_LOG_CONTEXT);
})();

