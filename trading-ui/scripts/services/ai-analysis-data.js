/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 12
 * 
 * DATA LOADING (3)
 * - loadTemplates() - Load AI analysis templates from API with cache support
 * - loadHistory() - Load analysis history from API with cache support
 * - getLLMProviderSettings() - Get LLM provider settings (Gemini/Perplexity)
 * 
 * DATA MANIPULATION (5)
 * - generateAnalysis() - Generate AI analysis request via API (with validation)
 * - updateLLMProviderSettings() - Update LLM provider settings (API key, validation)
 * - saveAsNote() - Save analysis result as note
 * - exportToPDF() - Export analysis result to PDF format
 * - exportToMarkdown() - Export analysis result to Markdown format
 * - exportToHTML() - Export analysis result to HTML format
 * 
 * VALIDATION (2)
 * - validateAnalysisRequest() - Validate AI analysis request using Business Logic Layer
 * - validateVariables() - Validate AI analysis variables using Business Logic Layer
 * 
 * UTILITIES (1)
 * - convertMarkdownToHTML() - Convert markdown text to HTML using marked.js or fallback
 * 
 * ==========================================
 */
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
            // Handle 401 authentication errors
            if (response.status === 401) {
              window.Logger?.warn?.('⚠️ Authentication required - redirecting to login', PAGE_LOG_CONTEXT);
              if (window.NotificationSystem) {
                window.NotificationSystem.showError('נדרשת התחברות', 'system');
              }
              setTimeout(() => {
                window.location.href = 'login.html';
              }, 1000);
              throw new Error('Authentication required');
            }
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
   * Validate AI analysis request using Business Logic Layer
   * Uses CacheTTLGuard for caching validation results (TTL: 60 seconds)
   */
  async function validateAnalysisRequest(data) {
    // Log input data for debugging
    window.Logger?.debug?.('🔍 validateAnalysisRequest called', {
      ...PAGE_LOG_CONTEXT,
      dataType: typeof data,
      dataKeys: data ? Object.keys(data) : [],
      template_id: data?.template_id,
      template_id_type: typeof data?.template_id,
      template_id_value: data?.template_id,
      provider: data?.provider,
      has_variables: !!data?.variables
    });
    
    // Validate input structure
    if (!data || typeof data !== 'object') {
      window.Logger?.error?.('❌ validateAnalysisRequest: invalid data parameter', {
        ...PAGE_LOG_CONTEXT,
        data: data
      });
      return {
        is_valid: false,
        errors: ['Invalid validation data: must be an object']
      };
    }
    
    // Ensure template_id is a number, not an object
    if (data.template_id && typeof data.template_id === 'object') {
      window.Logger?.error?.('❌ validateAnalysisRequest: template_id is an object!', {
        ...PAGE_LOG_CONTEXT,
        template_id: data.template_id,
        template_id_type: typeof data.template_id,
        full_data: data
      });
      // Try to extract actual template_id
      if (data.template_id.template_id !== undefined) {
        data.template_id = data.template_id.template_id;
        window.Logger?.warn?.('⚠️ Extracted template_id from nested object', {
          ...PAGE_LOG_CONTEXT,
          extracted_template_id: data.template_id
        });
      } else {
        return {
          is_valid: false,
          errors: ['Invalid template_id: expected number, got object']
        };
      }
    }
    
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-ai-analysis', data)
      : `business:validate-ai-analysis:${JSON.stringify(data)}`;
    
    window.Logger?.debug?.('🔑 Generated cache key', {
      ...PAGE_LOG_CONTEXT,
      cacheKey: cacheKey
    });
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          // Log before sending request
          window.Logger?.debug?.('📤 Sending validation request to API', {
            ...PAGE_LOG_CONTEXT,
            data: data,
            data_json: JSON.stringify(data)
          });
          const response = await fetch(buildUrl('/api/business/ai-analysis/validate'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            let errorData = {};
            try {
              const text = await response.text();
              if (text) {
                errorData = JSON.parse(text);
              }
            } catch (parseError) {
              window.Logger?.warn?.('⚠️ Failed to parse validation error response', {
                ...PAGE_LOG_CONTEXT,
                parseError: parseError?.message,
                status: response.status
              });
            }
            
            // Extract errors - handle both array and string formats
            let errors = [];
            if (errorData.error) {
              if (Array.isArray(errorData.error.errors)) {
                errors = errorData.error.errors;
              } else if (errorData.error.message) {
                errors = [errorData.error.message];
              } else if (typeof errorData.error === 'string') {
                errors = [errorData.error];
              }
            } else if (errorData.errors) {
              errors = Array.isArray(errorData.errors) ? errorData.errors : [errorData.errors];
            } else if (errorData.message) {
              errors = [errorData.message];
            }
            
            if (errors.length === 0) {
              errors = [`Validation failed (HTTP ${response.status})`];
            }
            
            window.Logger?.warn?.('⚠️ Validation response not OK', {
              ...PAGE_LOG_CONTEXT,
              status: response.status,
              statusText: response.statusText,
              errorData: errorData,
              extractedErrors: errors
            });
            
            return {
              is_valid: false,
              errors: errors
            };
          }

          const result = await response.json();
          if (result.status === 'success') {
            return {
              is_valid: true,
              errors: []
            };
          } else {
            // Handle error response (status: 'error' with 200 OK)
            return {
              is_valid: false,
              errors: result.error?.errors || [result.error?.message || 'Validation failed']
            };
          }
        }, { ttl: 60 * 1000 });
      }
      
      // Fallback if CacheTTLGuard not available
      const response = await fetch(buildUrl('/api/business/ai-analysis/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let errorData = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          window.Logger?.warn?.('⚠️ Failed to parse validation error response (fallback)', {
            ...PAGE_LOG_CONTEXT,
            parseError: parseError?.message,
            status: response.status
          });
        }
        
        // Extract errors - handle both array and string formats
        let errors = [];
        if (errorData.error) {
          if (Array.isArray(errorData.error.errors)) {
            errors = errorData.error.errors;
          } else if (errorData.error.message) {
            errors = [errorData.error.message];
          } else if (typeof errorData.error === 'string') {
            errors = [errorData.error];
          }
        } else if (errorData.errors) {
          errors = Array.isArray(errorData.errors) ? errorData.errors : [errorData.errors];
        } else if (errorData.message) {
          errors = [errorData.message];
        }
        
        if (errors.length === 0) {
          errors = [`Validation failed (HTTP ${response.status})`];
        }
        
        window.Logger?.warn?.('⚠️ Validation response not OK (fallback)', {
          ...PAGE_LOG_CONTEXT,
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          extractedErrors: errors
        });
        
        return {
          is_valid: false,
          errors: errors
        };
      }

      const result = await response.json();
      if (result.status === 'success') {
        return {
          is_valid: true,
          errors: []
        };
      } else {
        // Handle error response (status: 'error' with 200 OK)
        return {
          is_valid: false,
          errors: result.error?.errors || [result.error?.message || 'Validation failed']
        };
      }
    } catch (error) {
      window.Logger?.error?.('❌ Error validating analysis request', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      return {
        is_valid: false,
        errors: [error.message || 'Validation error']
      };
    }
  }

  /**
   * Validate AI analysis variables using Business Logic Layer
   * Uses CacheTTLGuard for caching validation results (TTL: 60 seconds)
   */
  async function validateVariables(variables) {
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-ai-analysis-variables', variables)
      : `business:validate-ai-analysis-variables:${JSON.stringify(variables)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch(buildUrl('/api/business/ai-analysis/validate-variables'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ variables })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              is_valid: false,
              errors: errorData.error?.errors || [errorData.error?.message || 'Variables validation failed']
            };
          }

          const result = await response.json();
          return {
            is_valid: result.status === 'success',
            errors: []
          };
        }, { ttl: 60 * 1000 });
      }
      
      // Fallback if CacheTTLGuard not available
      const response = await fetch(buildUrl('/api/business/ai-analysis/validate-variables'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ variables })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          is_valid: false,
          errors: errorData.error?.errors || [errorData.error?.message || 'Variables validation failed']
        };
      }

      const result = await response.json();
      return {
        is_valid: result.status === 'success',
        errors: []
      };
    } catch (error) {
      window.Logger?.error?.('❌ Error validating variables', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      return {
        is_valid: false,
        errors: [error.message || 'Variables validation error']
      };
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

      // Validate request using Business Logic Layer before sending
      const validationResult = await validateAnalysisRequest({
        template_id: templateId,
        variables: variables,
        provider: provider
      });

      if (!validationResult.is_valid) {
        const errorMessage = validationResult.errors.join(', ');
        window.Logger?.warn?.('⚠️ Validation failed before generating analysis', {
          ...PAGE_LOG_CONTEXT,
          errors: validationResult.errors,
        });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(
            'שגיאת ולידציה: ' + errorMessage,
            'system'
          );
        }
        
        throw new Error('Validation failed: ' + errorMessage);
      }

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
        // Handle 401 authentication errors
        if (response.status === 401) {
          window.Logger?.warn?.('⚠️ Authentication required - redirecting to login', PAGE_LOG_CONTEXT);
          if (window.NotificationSystem) {
            window.NotificationSystem.showError('נדרשת התחברות', 'system');
          }
          // Redirect to login
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1000);
          throw new Error('Authentication required');
        }
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
        errorCode: error?.errorCode,
        errorAction: error?.errorAction,
      });
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'שגיאה ביצירת ניתוח';
      if (window.NotificationSystem) {
        window.NotificationSystem.showError(
          `❌ הניתוח נכשל: ${errorMessage}`,
          'system',
          { duration: 8000 }
        );
      } else {
        window.showErrorNotification?.('שגיאה', errorMessage);
      }
      
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
            // Handle 401 authentication errors - return empty array instead of throwing
            if (response.status === 401) {
              window.Logger?.debug?.('ℹ️ Authentication required (expected for unauthenticated users)', PAGE_LOG_CONTEXT);
              return []; // Return empty array instead of throwing error
            }
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
        // Handle 401 authentication errors - return empty array instead of throwing
        if (response.status === 401) {
          window.Logger?.debug?.('ℹ️ Authentication required (expected for unauthenticated users)', PAGE_LOG_CONTEXT);
          return []; // Return empty array instead of throwing error
        }
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
      // Only log non-authentication errors as warnings
      if (error?.message?.includes('Authentication required')) {
        window.Logger?.debug?.('ℹ️ History not available (authentication required)', PAGE_LOG_CONTEXT);
        return []; // Return empty array instead of throwing
      }
      window.Logger?.warn?.('⚠️ Error loading history (will continue without history)', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      return []; // Return empty array instead of throwing to allow page to continue
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
            // Handle 401 authentication errors - return null instead of throwing
            if (response.status === 401) {
              window.Logger?.debug?.('ℹ️ Authentication required (expected for unauthenticated users)', PAGE_LOG_CONTEXT);
              return null; // Return null instead of throwing error
            }
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
        // Handle 401 authentication errors - return null instead of throwing
        if (response.status === 401) {
          window.Logger?.debug?.('ℹ️ Authentication required (expected for unauthenticated users)', PAGE_LOG_CONTEXT);
          return null; // Return null instead of throwing error
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.status === 'success' ? data.data : null;
    } catch (error) {
      // Only log non-authentication errors as warnings
      if (error?.message?.includes('Authentication required')) {
        window.Logger?.debug?.('ℹ️ LLM provider settings not available (authentication required)', PAGE_LOG_CONTEXT);
        return null; // Return null instead of throwing
      }
      window.Logger?.warn?.('⚠️ Error loading LLM provider settings (will use defaults)', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
      return null; // Return null instead of throwing to allow page to continue
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
        // Handle 401 authentication errors
        if (response.status === 401) {
          window.Logger?.warn?.('⚠️ Authentication required - redirecting to login', PAGE_LOG_CONTEXT);
          if (window.NotificationSystem) {
            window.NotificationSystem.showError('נדרשת התחברות', 'system');
          }
          // Redirect to login
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1000);
          throw new Error('Authentication required');
        }
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

      // Parse HTML using DOMParser
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
      const tempDiv = htmlDoc.body;
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

  /**
   * Delete specific AI analysis by ID
   * @param {number} analysisId - Analysis ID to delete
   * @returns {Promise<boolean>} - True if deleted successfully, false otherwise
   */
  async function deleteAnalysis(analysisId) {
    if (!analysisId) {
      throw new Error('Analysis ID is required');
    }

    try {
      const url = buildUrl(`/api/ai-analysis/history/${analysisId}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error?.message || `Failed to delete analysis: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        // Clear cache for this specific analysis
        if (window.UnifiedCacheManager) {
          try {
            const cacheKey = `ai-analysis-response-${analysisId}`;
            await window.UnifiedCacheManager.delete(cacheKey);
            window.Logger?.debug?.('✅ Cleared cache for deleted analysis', {
              ...PAGE_LOG_CONTEXT,
              analysisId,
              cacheKey
            });
          } catch (cacheError) {
            window.Logger?.warn?.('⚠️ Error clearing cache for deleted analysis', {
              ...PAGE_LOG_CONTEXT,
              analysisId,
              error: cacheError?.message || cacheError
            });
          }
        }

        // Invalidate history cache to refresh the list
        if (window.UnifiedCacheManager) {
          try {
            await window.UnifiedCacheManager.delete(HISTORY_CACHE_KEY);
            window.Logger?.debug?.('✅ Cleared history cache after deletion', PAGE_LOG_CONTEXT);
          } catch (cacheError) {
            window.Logger?.warn?.('⚠️ Error clearing history cache', {
              ...PAGE_LOG_CONTEXT,
              error: cacheError?.message || cacheError
            });
          }
        }

        window.Logger?.info?.('✅ Analysis deleted successfully', {
          ...PAGE_LOG_CONTEXT,
          analysisId
        });

        return true;
      } else {
        throw new Error(result.message || 'Failed to delete analysis');
      }
    } catch (error) {
      window.Logger?.error?.('❌ Error deleting analysis', {
        ...PAGE_LOG_CONTEXT,
        analysisId,
        error: error?.message || error,
      });
      throw error;
    }
  }

  /**
   * Delete all AI analysis records
   * @returns {Promise<Object>} - Result with deleted_count
   */
  async function deleteAllAnalyses() {
    try {
      const apiUrl = buildUrl('/api/ai-analysis/delete-all');
      
      window.Logger?.info?.('🗑️ Deleting all analyses...', PAGE_LOG_CONTEXT);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        window.Logger?.info?.('✅ All analyses deleted successfully', {
          ...PAGE_LOG_CONTEXT,
          deletedCount: result.deleted_count || 0
        });
        
        // Clear all AI analysis cache entries
        if (window.UnifiedCacheManager) {
          try {
            // Clear all response cache entries (ai-analysis-response-*)
            if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
              await window.UnifiedCacheManager.clearByPattern('ai-analysis-response-');
              window.Logger?.info?.('🧹 Cleared AI analysis response cache', PAGE_LOG_CONTEXT);
            } else if (typeof window.UnifiedCacheManager.invalidate === 'function') {
              await window.UnifiedCacheManager.invalidate('ai-analysis-response-*');
              window.Logger?.info?.('🧹 Invalidated AI analysis response cache', PAGE_LOG_CONTEXT);
            }
            
            // Clear history cache
            await invalidateCache('ai-analysis-history');
            
            // Also clear any other AI analysis related cache
            if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
              await window.UnifiedCacheManager.clearByPattern('ai-analysis-');
            }
          } catch (cacheError) {
            window.Logger?.warn?.('⚠️ Error clearing cache', {
              ...PAGE_LOG_CONTEXT,
              error: cacheError?.message || cacheError
            });
          }
        }
        
        return result;
      } else {
        throw new Error(result.message || 'Failed to delete analyses');
      }
    } catch (error) {
      window.Logger?.error?.('❌ Error deleting all analyses', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || error,
      });
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
    validateAnalysisRequest,
    validateVariables,
    deleteAnalysis,
    deleteAllAnalyses,
  };

  window.Logger?.info?.('✅ AI Analysis Data Service loaded', PAGE_LOG_CONTEXT);
})();

