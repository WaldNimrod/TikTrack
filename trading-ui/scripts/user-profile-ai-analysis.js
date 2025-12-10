/**
 * User Profile AI Analysis Settings Manager - TikTrack
 * מנהל הגדרות AI Analysis בעמוד פרופיל משתמש
 *
 * Dependencies:
 * - notification-system.js (NotificationSystem)
 * - logger-service.js (Logger)
 * - api-config.js (API_BASE_URL)
 * - button-system-init.js (ButtonSystem)
 *
 * File: trading-ui/scripts/user-profile-ai-analysis.js
 * Version: 1.0.0
 * Last Updated: January 28, 2025
 */


// ===== FUNCTION INDEX =====

// === AI Analysis ===
// - UserProfileAIAnalysis.init() - Init
// - UserProfileAIAnalysis.analyzeProfile() - Analyze Profile
// - UserProfileAIAnalysis.generateInsights() - Generate Insights

// === UI Functions ===
// - UserProfileAIAnalysis.displayResults() - Display Results
// - UserProfileAIAnalysis.updateUI() - Update Ui

(function() {
  'use strict';

  /**
   * AI Analysis Settings Manager
   * מנהל הגדרות AI Analysis
   */
  const AIAnalysisManager = {
    version: '1.0.0',
    initialized: false,
    settings: null,

    /**
     * Initialize AI Analysis settings manager
     * אתחול מנהל הגדרות AI Analysis
     */
    async init() {
      if (this.initialized) {
        window.Logger?.warn('AIAnalysisManager already initialized', { page: 'user-profile' });
        return;
      }

      try {
        window.Logger?.info('🚀 Initializing AI Analysis Settings Manager...', { page: 'user-profile' });

        // Load AI Analysis settings
        await this.loadSettings();

        // Setup form handlers
        this.setupFormHandlers();

        // Restore button children after ButtonSystem processing
        this.restoreButtonChildren();

        this.initialized = true;
        window.Logger?.info('✅ AI Analysis Settings Manager initialized successfully', { page: 'user-profile' });
      } catch (error) {
        window.Logger?.error('❌ Error initializing AI Analysis Settings Manager', error, { page: 'user-profile' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה באתחול מנהל הגדרות AI Analysis', 'system');
        }
      }
    },

    /**
     * Load AI Analysis settings from API
     * טעינת הגדרות AI Analysis מה-API
     */
    async loadSettings() {
      try {
        window.Logger?.info('Loading AI Analysis settings...', { page: 'user-profile' });

        const apiUrl = window.API_BASE_URL || '/api';
        const response = await fetch(`${apiUrl}/ai-analysis/llm-provider`, {
          method: 'GET', });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success' && data.data) {
          this.settings = data.data;
          this.populateForm(data.data);
          window.Logger?.info('AI Analysis settings loaded successfully', { page: 'user-profile' });
        } else {
          // No settings yet - use defaults
          this.settings = {
            default_provider: 'gemini',
            providers_configured: [],
            gemini_configured: false,
            perplexity_configured: false
          };
          this.populateForm(this.settings);
          window.Logger?.info('No AI Analysis settings found, using defaults', { page: 'user-profile' });
        }
      } catch (error) {
        window.Logger?.error('Error loading AI Analysis settings', error, { page: 'user-profile' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בטעינת הגדרות AI Analysis', 'system');
        }
      }
    },

    /**
     * Populate form with AI Analysis settings
     * מילוי טופס עם הגדרות AI Analysis
     */
    populateForm(settings) {
      try {
        const defaultProviderEl = document.getElementById('aiDefaultProvider');
        const geminiKeyEl = document.getElementById('geminiApiKey');
        const perplexityKeyEl = document.getElementById('perplexityApiKey');

        if (defaultProviderEl) {
          defaultProviderEl.value = settings.default_provider || 'gemini';
        }

        // Don't populate API keys for security - they're encrypted anyway
        if (geminiKeyEl) {
          geminiKeyEl.value = '';
          this.updateKeyStatus('gemini', settings.gemini_configured || false);
        }

        if (perplexityKeyEl) {
          perplexityKeyEl.value = '';
          this.updateKeyStatus('perplexity', settings.perplexity_configured || false);
        }

        window.Logger?.info('AI Analysis form populated successfully', { page: 'user-profile' });
      } catch (error) {
        window.Logger?.error('Error populating AI Analysis form', error, { page: 'user-profile' });
      }
    },

    /**
     * Update API key status display
     * עדכון תצוגת סטטוס מפתח API
     */
    updateKeyStatus(provider, configured) {
      const statusEl = document.getElementById(`${provider}KeyStatus`);
      if (!statusEl) return;

      if (configured) {
        statusEl.textContent = '';
        const span = document.createElement('span');
        span.className = 'badge bg-success';
        span.textContent = 'מפתח מוגדר';
        statusEl.appendChild(span);
        statusEl.style.display = 'block';
      } else {
        statusEl.textContent = '';
        const span = document.createElement('span');
        span.className = 'badge bg-warning';
        span.textContent = 'מפתח לא מוגדר';
        statusEl.appendChild(span);
        statusEl.style.display = 'block';
      }
    },

    /**
     * Setup form event handlers
     * הגדרת מטפלי אירועים לטפסים
     */
    setupFormHandlers() {
      // Toggle password visibility for Gemini key
      const toggleGeminiBtn = document.getElementById('toggleGeminiKeyBtn');
      if (toggleGeminiBtn) {
        toggleGeminiBtn.addEventListener('click', () => {
          const keyEl = document.getElementById('geminiApiKey');
          const iconEl = document.getElementById('toggleGeminiKeyIcon');
          if (keyEl && iconEl) {
            if (keyEl.type === 'password') {
              keyEl.type = 'text';
              iconEl.textContent = '🙈';
            } else {
              keyEl.type = 'password';
              iconEl.textContent = '👁️';
            }
          }
        });
      }

      // Toggle password visibility for Perplexity key
      const togglePerplexityBtn = document.getElementById('togglePerplexityKeyBtn');
      if (togglePerplexityBtn) {
        togglePerplexityBtn.addEventListener('click', () => {
          const keyEl = document.getElementById('perplexityApiKey');
          const iconEl = document.getElementById('togglePerplexityKeyIcon');
          if (keyEl && iconEl) {
            if (keyEl.type === 'password') {
              keyEl.type = 'text';
              iconEl.textContent = '🙈';
            } else {
              keyEl.type = 'password';
              iconEl.textContent = '👁️';
            }
          }
        });
      }
    },

    /**
     * Save AI Analysis settings
     * שמירת הגדרות AI Analysis
     */
    async saveSettings() {
      const defaultProvider = document.getElementById('aiDefaultProvider')?.value || 'gemini';
      const geminiKey = document.getElementById('geminiApiKey')?.value?.trim() || '';
      const perplexityKey = document.getElementById('perplexityApiKey')?.value?.trim() || '';

      // Set loading state
      this.setLoadingState(true, 'saveAiAnalysisBtn', 'saveAiAnalysisBtnText', 'saveAiAnalysisBtnSpinner');

      try {
        window.Logger?.info('Saving AI Analysis settings...', { page: 'user-profile' });

        const apiUrl = window.API_BASE_URL || '/api';
        const updates = [];

        // Save default provider (if changed)
        if (this.settings?.default_provider !== defaultProvider) {
          // Update default provider - we'll do this after saving API keys
        }

        // Save Gemini API key if provided
        if (geminiKey) {
          const response = await fetch(`${apiUrl}/ai-analysis/llm-provider`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }, body: JSON.stringify({
              provider: 'gemini',
              api_key: geminiKey,
              validate: true
            }),
          });

          const data = await response.json();
          if (response.ok && data.status === 'success') {
            updates.push('Gemini API key');
            this.updateKeyStatus('gemini', true);
          } else {
            throw new Error(data.message || 'שגיאה בשמירת Gemini API key');
          }
        }

        // Save Perplexity API key if provided
        if (perplexityKey) {
          const response = await fetch(`${apiUrl}/ai-analysis/llm-provider`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }, body: JSON.stringify({
              provider: 'perplexity',
              api_key: perplexityKey,
              validate: true
            }),
          });

          const data = await response.json();
          if (response.ok && data.status === 'success') {
            updates.push('Perplexity API key');
            this.updateKeyStatus('perplexity', true);
          } else {
            throw new Error(data.message || 'שגיאה בשמירת Perplexity API key');
          }
        }

        // Update default provider if needed
        if (this.settings?.default_provider !== defaultProvider) {
          // For now, we'll update this in a future enhancement
          // The default provider is stored in user_llm_providers table
        }

        if (updates.length > 0) {
          window.Logger?.info('AI Analysis settings saved successfully', { page: 'user-profile', updates });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess(`הגדרות AI Analysis נשמרו בהצלחה: ${updates.join(', ')}`, 'business');
          }

          this.showStatus('success', 'הגדרות נשמרו בהצלחה');
          
          // Clear password fields
          if (geminiKey) document.getElementById('geminiApiKey').value = '';
          if (perplexityKey) document.getElementById('perplexityApiKey').value = '';
          
          // Reload settings
          await this.loadSettings();
        } else {
          if (window.NotificationSystem) {
            window.NotificationSystem.showInfo('לא בוצעו שינויים', 'system');
          }
        }
      } catch (error) {
        window.Logger?.error('Error saving AI Analysis settings', error, { page: 'user-profile' });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בשמירת הגדרות AI Analysis: ' + (error.message || 'שגיאה לא ידועה'), 'system');
        }

        this.showStatus('error', error.message || 'שגיאה בשמירה');
      } finally {
        this.setLoadingState(false, 'saveAiAnalysisBtn', 'saveAiAnalysisBtnText', 'saveAiAnalysisBtnSpinner');
      }
    },

    /**
     * Validate Gemini API key
     * בדיקת תקינות Gemini API key
     */
    async validateGeminiKey() {
      const geminiKey = document.getElementById('geminiApiKey')?.value?.trim() || '';

      if (!geminiKey) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('נא להכניס Gemini API key', 'system');
        }
        return;
      }

      // Set loading state
      this.setLoadingState(true, 'validateGeminiBtn', 'validateGeminiBtnText', 'validateGeminiBtnSpinner');

      try {
        window.Logger?.info('Validating Gemini API key...', { page: 'user-profile' });

        const apiUrl = window.API_BASE_URL || '/api';
        const response = await fetch(`${apiUrl}/ai-analysis/llm-provider`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, body: JSON.stringify({
            provider: 'gemini',
            api_key: geminiKey,
            validate: true
          }),
        });

        const data = await response.json();

        if (response.ok && data.status === 'success' && data.data?.validated) {
          window.Logger?.info('Gemini API key validation successful', { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('Gemini API key תקין', 'business');
          }

          this.updateKeyStatus('gemini', true);
          this.showStatus('success', 'Gemini API key תקין');
        } else {
          const errorMessage = data.message || 'Gemini API key לא תקין';
          window.Logger?.error('Gemini API key validation failed', { message: errorMessage }, { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(errorMessage, 'system');
          }

          this.updateKeyStatus('gemini', false);
          this.showStatus('error', errorMessage);
        }
      } catch (error) {
        window.Logger?.error('Error validating Gemini API key', error, { page: 'user-profile' });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בבדיקת Gemini API key: ' + (error.message || 'שגיאה לא ידועה'), 'system');
        }

        this.showStatus('error', 'שגיאה בבדיקה');
      } finally {
        this.setLoadingState(false, 'validateGeminiBtn', 'validateGeminiBtnText', 'validateGeminiBtnSpinner');
      }
    },

    /**
     * Validate Perplexity API key
     * בדיקת תקינות Perplexity API key
     */
    async validatePerplexityKey() {
      const perplexityKey = document.getElementById('perplexityApiKey')?.value?.trim() || '';

      if (!perplexityKey) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('נא להכניס Perplexity API key', 'system');
        }
        return;
      }

      // Set loading state
      this.setLoadingState(true, 'validatePerplexityBtn', 'validatePerplexityBtnText', 'validatePerplexityBtnSpinner');

      try {
        window.Logger?.info('Validating Perplexity API key...', { page: 'user-profile' });

        const apiUrl = window.API_BASE_URL || '/api';
        const response = await fetch(`${apiUrl}/ai-analysis/llm-provider`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, body: JSON.stringify({
            provider: 'perplexity',
            api_key: perplexityKey,
            validate: true
          }),
        });

        const data = await response.json();

        if (response.ok && data.status === 'success' && data.data?.validated) {
          window.Logger?.info('Perplexity API key validation successful', { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('Perplexity API key תקין', 'business');
          }

          this.updateKeyStatus('perplexity', true);
          this.showStatus('success', 'Perplexity API key תקין');
        } else {
          const errorMessage = data.message || 'Perplexity API key לא תקין';
          window.Logger?.error('Perplexity API key validation failed', { message: errorMessage }, { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(errorMessage, 'system');
          }

          this.updateKeyStatus('perplexity', false);
          this.showStatus('error', errorMessage);
        }
      } catch (error) {
        window.Logger?.error('Error validating Perplexity API key', error, { page: 'user-profile' });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בבדיקת Perplexity API key: ' + (error.message || 'שגיאה לא ידועה'), 'system');
        }

        this.showStatus('error', 'שגיאה בבדיקה');
      } finally {
        this.setLoadingState(false, 'validatePerplexityBtn', 'validatePerplexityBtnText', 'validatePerplexityBtnSpinner');
      }
    },

    /**
     * Show help modal for API key
     * הצגת מודל עזרה למפתח API
     */
    showHelpModal(provider) {
      const providerName = provider === 'gemini' ? 'Gemini' : 'Perplexity';
      const helpText = provider === 'gemini' 
        ? `איך להשיג Gemini API Key:
1. עבור ל-https://aistudio.google.com/
2. התחבר עם חשבון Google שלך
3. לחץ על "Get API Key"
4. בחר "Create API Key"
5. העתק את המפתח`
        : `איך להשיג Perplexity API Key:
1. עבור ל-https://www.perplexity.ai/api
2. התחבר או צור חשבון
3. עבור ל-"API Keys"
4. לחץ על "Create API Key"
5. העתק את המפתח`;

      if (window.NotificationSystem) {
        window.NotificationSystem.showInfo(helpText, 'system', 10000);
      } else {
        if (window.showInfoNotification) {
          window.showInfoNotification(helpText, 'info');
        } else {
          alert(helpText);
        }
      }
    },

    /**
     * Show status message
     * הצגת הודעת סטטוס
     */
    showStatus(type, message) {
      const statusEl = document.getElementById('aiAnalysisStatus');
      const statusTextEl = document.getElementById('aiAnalysisStatusText');

      if (!statusEl || !statusTextEl) return;

      statusTextEl.textContent = message;
      statusEl.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'}`;
      statusEl.style.display = 'block';

      // Auto-hide after 5 seconds
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
    },

    /**
     * Restore button children after ButtonSystem processing
     * שחזור ילדי כפתורים אחרי עיבוד ButtonSystem
     */
    restoreButtonChildren() {
      // Wait for ButtonSystem to finish processing
      setTimeout(() => {
        // Save Settings Button
        const saveBtn = document.getElementById('saveAiAnalysisBtn');
        if (saveBtn) {
          // If button is empty or missing text, restore it
          const currentText = saveBtn.textContent?.trim() || '';
          const dataText = saveBtn.getAttribute('data-text') || 'שמור הגדרות';
          
          if (!currentText || currentText.length === 0) {
            // Button is empty - restore text and spans
            saveBtn.textContent = '';
            const textSpan = document.createElement('span');
            textSpan.id = 'saveAiAnalysisBtnText';
            textSpan.textContent = dataText;
            saveBtn.appendChild(textSpan);
            const spinnerSpan = document.createElement('span');
            spinnerSpan.id = 'saveAiAnalysisBtnSpinner';
            spinnerSpan.className = 'btn-spinner d-none';
            spinnerSpan.textContent = '⏳ שומר...';
            saveBtn.appendChild(spinnerSpan);
          } else if (!saveBtn.querySelector('#saveAiAnalysisBtnText')) {
            // Button has text but no spans - wrap existing text
            saveBtn.textContent = '';
            const textSpan = document.createElement('span');
            textSpan.id = 'saveAiAnalysisBtnText';
            textSpan.textContent = currentText;
            saveBtn.appendChild(textSpan);
            const spinnerSpan = document.createElement('span');
            spinnerSpan.id = 'saveAiAnalysisBtnSpinner';
            spinnerSpan.className = 'btn-spinner d-none';
            spinnerSpan.textContent = '⏳ שומר...';
            saveBtn.appendChild(spinnerSpan);
          }
        }

        // Validate Gemini Button
        const geminiBtn = document.getElementById('validateGeminiBtn');
        if (geminiBtn) {
          const currentText = geminiBtn.textContent?.trim() || '';
          const dataText = geminiBtn.getAttribute('data-text') || 'בדוק Gemini Key';
          
          if (!currentText || currentText.length === 0) {
            geminiBtn.textContent = '';
            const textSpan = document.createElement('span');
            textSpan.id = 'validateGeminiBtnText';
            textSpan.textContent = dataText;
            geminiBtn.appendChild(textSpan);
            const spinnerSpan = document.createElement('span');
            spinnerSpan.id = 'validateGeminiBtnSpinner';
            spinnerSpan.className = 'btn-spinner d-none';
            spinnerSpan.textContent = '⏳ בודק...';
            geminiBtn.appendChild(spinnerSpan);
          } else if (!geminiBtn.querySelector('#validateGeminiBtnText')) {
            geminiBtn.textContent = '';
            const textSpan = document.createElement('span');
            textSpan.id = 'validateGeminiBtnText';
            textSpan.textContent = currentText;
            geminiBtn.appendChild(textSpan);
            const spinnerSpan = document.createElement('span');
            spinnerSpan.id = 'validateGeminiBtnSpinner';
            spinnerSpan.className = 'btn-spinner d-none';
            spinnerSpan.textContent = '⏳ בודק...';
            geminiBtn.appendChild(spinnerSpan);
          }
        }

        // Validate Perplexity Button
        const perplexityBtn = document.getElementById('validatePerplexityBtn');
        if (perplexityBtn) {
          const currentText = perplexityBtn.textContent?.trim() || '';
          const dataText = perplexityBtn.getAttribute('data-text') || 'בדוק Perplexity Key';
          
          if (!currentText || currentText.length === 0) {
            perplexityBtn.textContent = '';
            const textSpan = document.createElement('span');
            textSpan.id = 'validatePerplexityBtnText';
            textSpan.textContent = dataText;
            perplexityBtn.appendChild(textSpan);
            const spinnerSpan = document.createElement('span');
            spinnerSpan.id = 'validatePerplexityBtnSpinner';
            spinnerSpan.className = 'btn-spinner d-none';
            spinnerSpan.textContent = '⏳ בודק...';
            perplexityBtn.appendChild(spinnerSpan);
          } else if (!perplexityBtn.querySelector('#validatePerplexityBtnText')) {
            perplexityBtn.textContent = '';
            const textSpan = document.createElement('span');
            textSpan.id = 'validatePerplexityBtnText';
            textSpan.textContent = currentText;
            perplexityBtn.appendChild(textSpan);
            const spinnerSpan = document.createElement('span');
            spinnerSpan.id = 'validatePerplexityBtnSpinner';
            spinnerSpan.className = 'btn-spinner d-none';
            spinnerSpan.textContent = '⏳ בודק...';
            perplexityBtn.appendChild(spinnerSpan);
          }
        }
      }, 500);
    },

    /**
     * Set loading state for button
     * הגדרת מצב טעינה לכפתור
     */
    setLoadingState(loading, btnId, textId, spinnerId) {
      const btn = document.getElementById(btnId);
      const text = document.getElementById(textId);
      const spinner = document.getElementById(spinnerId);

      if (btn) {
        btn.disabled = loading;
        
        // If button was processed by ButtonSystem and children don't exist,
        // work directly with button textContent
        if (!text && !spinner) {
          const originalText = btn.getAttribute('data-text') || btn.textContent?.trim() || '';
          if (loading) {
            // Store original text if not already stored
            if (!btn.hasAttribute('data-original-text')) {
              btn.setAttribute('data-original-text', originalText);
            }
            btn.textContent = '⏳ ' + (originalText || 'טוען...');
          } else {
            // Restore original text
            const storedText = btn.getAttribute('data-original-text') || originalText;
            btn.textContent = storedText;
            btn.removeAttribute('data-original-text');
          }
          return;
        }
      }

      if (text) {
        text.style.display = loading ? 'none' : 'inline';
      }

      if (spinner) {
        spinner.style.display = loading ? 'inline' : 'none';
      }
    }
  };

  // Expose to global scope
  window.AIAnalysisManager = AIAnalysisManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AIAnalysisManager.init();
    });
  } else {
    AIAnalysisManager.init();
  }
})();

