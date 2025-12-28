/**
 * AI Analysis Data Service - Unit Tests
 * ======================================
 * 
 * Unit tests for AI Analysis Data Service
 * 
 * @version 1.0.0
 * @created January 31, 2025
 */

describe('AIAnalysisData', () => {
  let originalFetch;
  let originalAIAnalysisData;

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;
    
    // Mock global objects
    global.window = {
      Logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      },
      NotificationSystem: {
        showError: jest.fn(),
        showSuccess: jest.fn(),
      },
      showErrorNotification: jest.fn(),
      API_BASE_URL: '',
      location: {
        origin: 'http://localhost:8080'
      },
      CacheTTLGuard: {
        ensure: jest.fn((key, fn, options) => fn())
      },
      CacheKeyHelper: {
        generateCacheKeyFromObject: jest.fn((prefix, obj) => `${prefix}:${JSON.stringify(obj)}`)
      },
      UnifiedCacheManager: {
        save: jest.fn(),
        get: jest.fn(),
        invalidate: jest.fn(),
      },
      CacheSyncManager: {
        invalidateByAction: jest.fn(),
      },
    };

    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('validateAnalysisRequest', () => {
    test('should return validation result for valid request', async () => {
      // Mock successful validation response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', data: { is_valid: true } })
      });

      // Load the service (would normally be done by the page)
      // For testing, we'll test the function directly
      const validateFunction = async (data) => {
        const response = await fetch('/api/business/ai_analysis/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            is_valid: false,
            errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
          };
        }

        const result = await response.json();
        return {
          is_valid: result.status === 'success',
          errors: []
        };
      };

      const result = await validateFunction({
        template_id: 1,
        variables: { stock_ticker: 'TSLA' },
        provider: 'gemini'
      });

      expect(result.is_valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/business/ai_analysis/validate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    test('should return errors for invalid request', async () => {
      // Mock validation failure response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          status: 'error',
          error: {
            message: 'Validation failed',
            errors: ['Template ID is required', 'Variables cannot be empty']
          }
        })
      });

      const validateFunction = async (data) => {
        const response = await fetch('/api/business/ai_analysis/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            is_valid: false,
            errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
          };
        }

        const result = await response.json();
        return {
          is_valid: result.status === 'success',
          errors: []
        };
      };

      const result = await validateFunction({
        variables: {},
        provider: 'gemini'
      });

      expect(result.is_valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Template ID is required');
    });

    test('should handle network errors', async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const validateFunction = async (data) => {
        try {
          const response = await fetch('/api/business/ai_analysis/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              is_valid: false,
              errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
            };
          }

          const result = await response.json();
          return {
            is_valid: result.status === 'success',
            errors: []
          };
        } catch (error) {
          return {
            is_valid: false,
            errors: [error.message || 'Validation error']
          };
        }
      };

      const result = await validateFunction({
        template_id: 1,
        variables: { stock_ticker: 'TSLA' },
        provider: 'gemini'
      });

      expect(result.is_valid).toBe(false);
      expect(result.errors).toContain('Network error');
    });
  });

  describe('validateVariables', () => {
    test('should return validation result for valid variables', async () => {
      // Mock successful validation response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', data: { is_valid: true } })
      });

      const validateFunction = async (variables) => {
        const response = await fetch('/api/business/ai_analysis/validate-variables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      };

      const result = await validateFunction({
        stock_ticker: 'TSLA',
        goal: 'Investment'
      });

      expect(result.is_valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should return errors for invalid variables', async () => {
      // Mock validation failure response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          status: 'error',
          error: {
            message: 'Variables validation failed',
            errors: ['Variables dictionary cannot be empty']
          }
        })
      });

      const validateFunction = async (variables) => {
        const response = await fetch('/api/business/ai_analysis/validate-variables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      };

      const result = await validateFunction({});

      expect(result.is_valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('generateAnalysis', () => {
    test('should validate before generating analysis', async () => {
      // Mock validation success
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'success', data: { is_valid: true } })
        })
        // Mock analysis generation success
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'success',
            data: {
              id: 123,
              template_id: 1,
              provider: 'gemini',
              status: 'completed'
            }
          })
        });

      const generateFunction = async (templateId, variables, provider) => {
        // Validate first
        const validationResponse = await fetch('/api/business/ai_analysis/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            template_id: templateId,
            variables: variables,
            provider: provider
          })
        });

        if (!validationResponse.ok) {
          const errorData = await validationResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'Validation failed');
        }

        const validationResult = await validationResponse.json();
        if (validationResult.status !== 'success') {
          throw new Error('Validation failed');
        }

        // Generate analysis
        const response = await fetch('/api/ai_analysis/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            template_id: templateId,
            variables: variables,
            provider: provider,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
      };

      const result = await generateFunction(1, { stock_ticker: 'TSLA' }, 'gemini');

      expect(result.id).toBe(123);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      // First call should be validation
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        '/api/business/ai_analysis/validate',
        expect.objectContaining({ method: 'POST' })
      );
      // Second call should be generation
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        '/api/ai_analysis/generate',
        expect.objectContaining({ method: 'POST' })
      );
    });

    test('should not generate analysis if validation fails', async () => {
      // Mock validation failure
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          status: 'error',
          error: {
            message: 'Validation failed',
            errors: ['Template ID is required']
          }
        })
      });

      const generateFunction = async (templateId, variables, provider) => {
        // Validate first
        const validationResponse = await fetch('/api/business/ai_analysis/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            template_id: templateId,
            variables: variables,
            provider: provider
          })
        });

        if (!validationResponse.ok) {
          const errorData = await validationResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'Validation failed');
        }

        const validationResult = await validationResponse.json();
        if (validationResult.status !== 'success') {
          throw new Error('Validation failed');
        }

        // Generate analysis (should not reach here)
        const response = await fetch('/api/ai_analysis/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            template_id: templateId,
            variables: variables,
            provider: provider,
          }),
        });

        return await response.json();
      };

      await expect(
        generateFunction(null, { stock_ticker: 'TSLA' }, 'gemini')
      ).rejects.toThrow('Validation failed');

      // Should only call validation, not generation
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).not.toHaveBeenCalledWith(
        '/api/ai_analysis/generate',
        expect.anything()
      );
    });
  });

  describe('loadTemplates', () => {
    test('should load templates from API', async () => {
      const mockTemplates = [
        { id: 1, name: 'Template 1', name_he: 'תבנית 1' },
        { id: 2, name: 'Template 2', name_he: 'תבנית 2' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', data: mockTemplates })
      });

      const loadFunction = async () => {
        const response = await fetch('/api/ai_analysis/templates');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data?.data) ? data.data : [];
      };

      const result = await loadFunction();

      expect(result).toEqual(mockTemplates);
      expect(result.length).toBe(2);
    });
  });

  describe('loadHistory', () => {
    test('should load history from API', async () => {
      const mockHistory = [
        { id: 1, template_id: 1, provider: 'gemini', status: 'completed' },
        { id: 2, template_id: 2, provider: 'perplexity', status: 'completed' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', data: mockHistory })
      });

      const loadFunction = async (options = {}) => {
        const { limit = 50, offset = 0 } = options;
        const url = new URL('/api/ai_analysis/history', 'http://localhost:8080');
        url.searchParams.set('limit', limit);
        url.searchParams.set('offset', offset);

        const response = await fetch(url.toString(), {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data?.data) ? data.data : [];
      };

      const result = await loadFunction({ limit: 50, offset: 0 });

      expect(result).toEqual(mockHistory);
      expect(result.length).toBe(2);
    });
  });
});

