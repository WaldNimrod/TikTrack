/**
 * User Profile SMTP Settings Manager - TikTrack
 * מנהל הגדרות SMTP בעמוד פרופיל משתמש
 *
 * Dependencies:
 * - notification-system.js (NotificationSystem)
 * - logger-service.js (Logger)
 * - api-config.js (API_BASE_URL)
 *
 * File: trading-ui/scripts/user-profile-smtp.js
 * Version: 1.0.0
 * Last Updated: January 28, 2025
 */

(function() {
  'use strict';

  /**
   * SMTP Settings Manager
   * מנהל הגדרות SMTP
   */
  const SMTPManager = {
    version: '1.0.0',
    initialized: false,
    settings: null,

    /**
     * Initialize SMTP settings manager
     * אתחול מנהל הגדרות SMTP
     */
    async init() {
      if (this.initialized) {
        window.Logger?.warn('SMTPManager already initialized', { page: 'user-profile' });
        return;
      }

      try {
        window.Logger?.info('🚀 Initializing SMTP Settings Manager...', { page: 'user-profile' });

        // Load SMTP settings
        await this.loadSMTPSettings();

        // Setup form handlers
        this.setupFormHandlers();

        this.initialized = true;
        window.Logger?.info('✅ SMTP Settings Manager initialized successfully', { page: 'user-profile' });
      } catch (error) {
        window.Logger?.error('❌ Error initializing SMTP Settings Manager', error, { page: 'user-profile' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה באתחול מנהל הגדרות SMTP', 'system');
        }
      }
    },

    /**
     * Load SMTP settings from API
     * טעינת הגדרות SMTP מה-API
     */
    async loadSMTPSettings() {
      try {
        window.Logger?.info('Loading SMTP settings...', { page: 'user-profile' });

        const apiUrl = window.API_BASE_URL || '/api';
        const response = await fetch(`${apiUrl}/system-settings/smtp`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          this.settings = data.data;
          this.populateForm(this.settings);
          window.Logger?.info('✅ SMTP settings loaded successfully', { page: 'user-profile' });
        } else {
          throw new Error(data.error || 'Failed to load SMTP settings');
        }
      } catch (error) {
        window.Logger?.error('Error loading SMTP settings', error, { page: 'user-profile' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בטעינת הגדרות SMTP', 'system');
        }
      }
    },

    /**
     * Populate form with SMTP settings
     * מילוי טופס עם הגדרות SMTP
     */
    populateForm(settings) {
      try {
        const hostEl = document.getElementById('smtpHost');
        const portEl = document.getElementById('smtpPort');
        const userEl = document.getElementById('smtpUser');
        const passwordEl = document.getElementById('smtpPassword');
        const fromEmailEl = document.getElementById('smtpFromEmail');
        const fromNameEl = document.getElementById('smtpFromName');
        const useTlsEl = document.getElementById('smtpUseTls');
        const enabledEl = document.getElementById('smtpEnabled');
        const testEmailEl = document.getElementById('smtpTestEmail');

        if (hostEl) hostEl.value = settings.smtp_host || '';
        if (portEl) portEl.value = settings.smtp_port || '';
        if (userEl) userEl.value = settings.smtp_user || '';
        if (passwordEl) passwordEl.value = ''; // Don't populate password for security
        if (fromEmailEl) fromEmailEl.value = settings.smtp_from_email || '';
        if (fromNameEl) fromNameEl.value = settings.smtp_from_name || '';
        if (useTlsEl) useTlsEl.checked = settings.smtp_use_tls !== false;
        if (enabledEl) enabledEl.checked = settings.smtp_enabled !== false;
        if (testEmailEl) testEmailEl.value = settings.smtp_test_email || '';

        window.Logger?.info('SMTP form populated successfully', { page: 'user-profile' });
      } catch (error) {
        window.Logger?.error('Error populating SMTP form', error, { page: 'user-profile' });
      }
    },

    /**
     * Setup form event handlers
     * הגדרת מטפלי אירועים לטפסים
     */
    setupFormHandlers() {
      // SMTP settings form
      const smtpForm = document.getElementById('smtpSettingsForm');
      if (smtpForm) {
        smtpForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleUpdateSettings(e);
        });
      }

      // Test connection button
      const testConnectionBtn = document.getElementById('testConnectionBtn');
      if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', () => {
          this.handleTestConnection();
        });
      }

      // Send test email button
      const sendTestEmailBtn = document.getElementById('sendTestEmailBtn');
      if (sendTestEmailBtn) {
        sendTestEmailBtn.addEventListener('click', () => {
          this.handleSendTestEmail();
        });
      }

      // Toggle password visibility
      const togglePasswordBtn = document.getElementById('togglePasswordBtn');
      if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
          this.togglePasswordVisibility();
        });
      }
    },

    /**
     * Handle update SMTP settings
     * טיפול בעדכון הגדרות SMTP
     */
    async handleUpdateSettings(event) {
      event.preventDefault();

      const settings = {
        smtp_host: document.getElementById('smtpHost')?.value || '',
        smtp_port: parseInt(document.getElementById('smtpPort')?.value) || 587,
        smtp_user: document.getElementById('smtpUser')?.value || '',
        smtp_password: document.getElementById('smtpPassword')?.value || null,
        smtp_from_email: document.getElementById('smtpFromEmail')?.value || '',
        smtp_from_name: document.getElementById('smtpFromName')?.value || '',
        smtp_use_tls: document.getElementById('smtpUseTls')?.checked || false,
        smtp_enabled: document.getElementById('smtpEnabled')?.checked || false,
        smtp_test_email: document.getElementById('smtpTestEmail')?.value || ''
      };

      // Don't send password if it's empty (to keep existing password)
      if (!settings.smtp_password || settings.smtp_password.trim() === '') {
        delete settings.smtp_password;
      }

      // Set loading state
      this.setLoadingState(true, 'updateSmtpBtn', 'updateSmtpBtnText', 'updateSmtpBtnSpinner');

      try {
        window.Logger?.info('Updating SMTP settings...', { page: 'user-profile' });

        const apiUrl = window.API_BASE_URL || '/api';
        const response = await fetch(`${apiUrl}/system-settings/smtp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(settings),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          window.Logger?.info('SMTP settings updated successfully', { page: 'user-profile' });

          // Update local settings
          this.settings = { ...this.settings, ...settings };
          if (!settings.smtp_password) {
            // Keep existing password (don't clear the field)
            document.getElementById('smtpPassword')?.setAttribute('placeholder', 'הסיסמה לא השתנתה');
          } else {
            // Clear password field after successful update
            const passwordEl = document.getElementById('smtpPassword');
            if (passwordEl) passwordEl.value = '';
          }

          // Show success notification
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('הגדרות SMTP עודכנו בהצלחה', 'business');
          }

          // Reload settings to get updated values
          await this.loadSMTPSettings();
        } else {
          const errorMessage = data.error || 'שגיאה בעדכון הגדרות SMTP';
          window.Logger?.error('Failed to update SMTP settings', { message: errorMessage }, { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(errorMessage, 'system');
          }
        }
      } catch (error) {
        window.Logger?.error('Error updating SMTP settings', error, { page: 'user-profile' });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בעדכון הגדרות SMTP: ' + (error.message || 'שגיאה לא ידועה'), 'system');
        }
      } finally {
        this.setLoadingState(false, 'updateSmtpBtn', 'updateSmtpBtnText', 'updateSmtpBtnSpinner');
      }
    },

    /**
     * Handle test SMTP connection
     * טיפול בבדיקת חיבור SMTP
     */
    async handleTestConnection() {
      // Set loading state
      this.setLoadingState(true, 'testConnectionBtn', 'testConnectionBtnText', 'testConnectionBtnSpinner');

      try {
        window.Logger?.info('Testing SMTP connection...', { page: 'user-profile' });

        const apiUrl = window.API_BASE_URL || '/api';
        const response = await fetch(`${apiUrl}/system-settings/smtp/test`, {
          method: 'POST',
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.success) {
          window.Logger?.info('SMTP connection test successful', { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('חיבור SMTP תקין', 'business');
          }

          this.showStatus('success', 'חיבור SMTP תקין');
        } else {
          const errorMessage = data.error || 'שגיאת חיבור SMTP';
          window.Logger?.error('SMTP connection test failed', { message: errorMessage }, { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(errorMessage, 'system');
          }

          this.showStatus('error', errorMessage);
        }
      } catch (error) {
        window.Logger?.error('Error testing SMTP connection', error, { page: 'user-profile' });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בבדיקת חיבור SMTP: ' + (error.message || 'שגיאה לא ידועה'), 'system');
        }

        this.showStatus('error', 'שגיאה בבדיקת חיבור');
      } finally {
        this.setLoadingState(false, 'testConnectionBtn', 'testConnectionBtnText', 'testConnectionBtnSpinner');
      }
    },

    /**
     * Handle send test email
     * טיפול בשליחת מייל בדיקה
     */
    async handleSendTestEmail() {
      const testEmail = document.getElementById('smtpTestEmail')?.value || '';

      if (!testEmail || testEmail.trim() === '') {
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('נא להכניס כתובת אימייל לבדיקה', 'system');
        }
        return;
      }

      // Set loading state
      this.setLoadingState(true, 'sendTestEmailBtn', 'sendTestEmailBtnText', 'sendTestEmailBtnSpinner');

      try {
        window.Logger?.info('Sending test email...', { page: 'user-profile', email: testEmail });

        const apiUrl = window.API_BASE_URL || '/api';
        const response = await fetch(`${apiUrl}/system-settings/smtp/test-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email: testEmail }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          window.Logger?.info('Test email sent successfully', { page: 'user-profile', email: testEmail });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess(`מייל בדיקה נשלח ל-${testEmail}`, 'business');
          }

          this.showStatus('success', `מייל בדיקה נשלח ל-${testEmail}`);
        } else {
          const errorMessage = data.error || 'שגיאה בשליחת מייל בדיקה';
          window.Logger?.error('Failed to send test email', { message: errorMessage }, { page: 'user-profile' });
          
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(errorMessage, 'system');
          }

          this.showStatus('error', errorMessage);
        }
      } catch (error) {
        window.Logger?.error('Error sending test email', error, { page: 'user-profile' });
        
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בשליחת מייל בדיקה: ' + (error.message || 'שגיאה לא ידועה'), 'system');
        }

        this.showStatus('error', 'שגיאה בשליחת מייל');
      } finally {
        this.setLoadingState(false, 'sendTestEmailBtn', 'sendTestEmailBtnText', 'sendTestEmailBtnSpinner');
      }
    },

    /**
     * Toggle password visibility
     * החלפת הצגת סיסמה
     */
    togglePasswordVisibility() {
      const passwordEl = document.getElementById('smtpPassword');
      const toggleIcon = document.getElementById('togglePasswordIcon');

      if (passwordEl && toggleIcon) {
        if (passwordEl.type === 'password') {
          passwordEl.type = 'text';
          toggleIcon.textContent = '🙈';
        } else {
          passwordEl.type = 'password';
          toggleIcon.textContent = '👁️';
        }
      }
    },

    /**
     * Show status message
     * הצגת הודעת סטטוס
     */
    showStatus(type, message) {
      const statusEl = document.getElementById('smtpStatus');
      const statusTextEl = document.getElementById('smtpStatusText');

      if (statusEl && statusTextEl) {
        statusEl.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
        statusTextEl.textContent = message;
        statusEl.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
          statusEl.style.display = 'none';
        }, 5000);
      }
    },

    /**
     * Set loading state for buttons
     * הגדרת מצב טעינה לכפתורים
     */
    setLoadingState(isLoading, buttonId, textId, spinnerId) {
      const button = document.getElementById(buttonId);
      const text = document.getElementById(textId);
      const spinner = document.getElementById(spinnerId);

      if (button) {
        button.disabled = isLoading;
      }

      if (text) {
        text.style.display = isLoading ? 'none' : 'inline';
      }

      if (spinner) {
        spinner.style.display = isLoading ? 'inline' : 'none';
      }
    },
  };

  // Export to global scope
  window.SMTPManager = SMTPManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      SMTPManager.init();
    });
  } else {
    SMTPManager.init();
  }

  window.Logger?.info('✅ SMTPManager loaded successfully', { page: 'user-profile' });
})();

