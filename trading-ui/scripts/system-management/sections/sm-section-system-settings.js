/**
 * System Management System Settings Section - TikTrack
 * ===================================================
 * 
 * System settings section for managing all system-level settings
 * Includes SMTP settings, External Data settings, and other system configuration groups
 * 
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 * @author TikTrack Development Team
 */

class SMSystemSettingsSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, { autoRefresh: false, ...config });
    this.smtpSettings = null;
    this.externalDataSettings = null;
    this.settingGroups = [];
    this.layoutReady = false;
  }

  /**
   * Load all system settings data
   * טעינת כל הגדרות המערכת
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`🔧 Loading system settings data`);

      // Load all settings in parallel
      const [smtpData, externalDataData, groupsData] = await Promise.allSettled([
        this.loadSMTPSettings(),
        this.loadExternalDataSettings(),
        this.loadSettingGroups()
      ]);

      // Extract successful results
      this.smtpSettings = smtpData.status === 'fulfilled' ? smtpData.value : null;
      this.externalDataSettings = externalDataData.status === 'fulfilled' ? externalDataData.value : null;
      this.settingGroups = groupsData.status === 'fulfilled' ? groupsData.value : [];

      const data = {
        smtp: this.smtpSettings,
        externalData: this.externalDataSettings,
        groups: this.settingGroups,
        timestamp: new Date().toISOString()
      };

      this.lastData = data;
      this.render(data);
      this.retryCount = 0;

    } catch (error) {
      console.error('❌ Failed to load system settings data:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load SMTP settings
   * טעינת הגדרות SMTP
   */
  async loadSMTPSettings() {
    try {
      const apiUrl = window.API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/system-settings/smtp`, {
        method: 'GET', });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to load SMTP settings');
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      return null;
    }
  }

  /**
   * Load External Data settings
   * טעינת הגדרות נתונים חיצוניים
   */
  async loadExternalDataSettings() {
    try {
      const apiUrl = window.API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/system-settings/external-data`, {
        method: 'GET', });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to load external data settings');
      }
    } catch (error) {
      console.error('Error loading external data settings:', error);
      return null;
    }
  }

  /**
   * Load all setting groups
   * טעינת כל קבוצות ההגדרות
   */
  async loadSettingGroups() {
    try {
      const apiUrl = window.API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/system-setting-groups`, {
        method: 'GET', });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success' && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to load setting groups');
      }
    } catch (error) {
      console.error('Error loading setting groups:', error);
      return [];
    }
  }

  /**
   * Ensure layout is created
   * וידוא שהמבנה נוצר
   */
  ensureLayout() {
    if (this.layoutReady || !this.container) {
      return;
    }

    this.container.classList.add('sm-system-settings-container');
    this.layoutReady = true;
  }

  /**
   * Render system settings
   * הצגת הגדרות מערכת
   */
  render(data) {
    this.ensureLayout();

    if (!this.container) {
      return;
    }

    const containerHTML = `
      <div class="system-settings-overview">
        <!-- SMTP Settings Card -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <img src="/trading-ui/images/icons/tabler/inbox.svg" width="20" height="20" alt="SMTP" class="icon me-2">
              הגדרות SMTP
            </h5>
          </div>
          <div class="card-body">
            ${this.renderSMTPSettings(data.smtp)}
          </div>
        </div>

        <!-- External Data Settings Card -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <img src="/trading-ui/images/icons/tabler/world.svg" width="20" height="20" alt="External Data" class="icon me-2">
              הגדרות נתונים חיצוניים
            </h5>
          </div>
          <div class="card-body">
            ${this.renderExternalDataSettings(data.externalData)}
          </div>
        </div>

        <!-- Other Setting Groups -->
        ${data.groups && data.groups.length > 0 ? this.renderSettingGroupsCards(data.groups) : ''}
      </div>
    `;
    this.container.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(containerHTML, 'text/html');
    doc.body.childNodes.forEach(node => {
      this.container.appendChild(node.cloneNode(true));
    });

    // Setup event listeners after rendering
    this.setupEventListeners();
  }

  /**
   * Render SMTP settings form
   * הצגת טופס הגדרות SMTP
   */
  renderSMTPSettings(settings) {
    if (!settings) {
      return '<p class="text-muted">טוען הגדרות SMTP...</p>';
    }

    return `
      <form id="smSmtpSettingsForm">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label" for="smSmtpHost">שרת SMTP (Host)</label>
            <input type="text" id="smSmtpHost" class="form-control" placeholder="smtp.gmail.com" value="${settings.smtp_host || ''}" required>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="smSmtpPort">פורט (Port)</label>
            <input type="number" id="smSmtpPort" class="form-control" placeholder="587" value="${settings.smtp_port || 587}" required>
          </div>
          <div class="col-md-3">
            <label class="form-label">שימוש ב-TLS</label>
            <div class="form-check mt-2">
              <input class="form-check-input" type="checkbox" id="smSmtpUseTls" ${settings.smtp_use_tls !== false ? 'checked' : ''}>
              <label class="form-check-label" for="smSmtpUseTls">מופעל</label>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="smSmtpUser">שם משתמש (User)</label>
            <input type="text" id="smSmtpUser" class="form-control" placeholder="admin@mezoo.co" value="${settings.smtp_user || ''}" required>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="smSmtpPassword">סיסמה (Password)</label>
            <div class="input-group">
              <input type="password" id="smSmtpPassword" class="form-control" placeholder="הכנס סיסמה (השאר ריק לשמירת הסיסמה הקיימת)">
              <button class="btn btn-outline-secondary" type="button" id="smTogglePasswordBtn">
                <span id="smTogglePasswordIcon">👁️</span>
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="smSmtpFromEmail">כתובת אימייל שולח (From Email)</label>
            <input type="email" id="smSmtpFromEmail" class="form-control" placeholder="admin@mezoo.co" value="${settings.smtp_from_email || ''}" required>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="smSmtpFromName">שם שולח (From Name)</label>
            <input type="text" id="smSmtpFromName" class="form-control" placeholder="TikTrack" value="${settings.smtp_from_name || ''}" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">הפעלת שירות SMTP</label>
            <div class="form-check mt-2">
              <input class="form-check-input" type="checkbox" id="smSmtpEnabled" ${settings.smtp_enabled !== false ? 'checked' : ''}>
              <label class="form-check-label" for="smSmtpEnabled">מופעל</label>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="smSmtpTestEmail">כתובת אימייל לבדיקה</label>
            <input type="email" id="smSmtpTestEmail" class="form-control" placeholder="test@example.com" value="${settings.smtp_test_email || ''}">
          </div>
          <div class="col-12">
            <div class="d-flex gap-2 flex-wrap">
              <button type="submit" class="btn btn-primary" id="smUpdateSmtpBtn">
                <span id="smUpdateSmtpBtnText">שמור הגדרות SMTP</span>
                <span id="smUpdateSmtpBtnSpinner" class="btn-spinner" style="display: none;">⏳ שומר...</span>
              </button>
              <button type="button" class="btn btn-outline-info" id="smTestConnectionBtn">
                <span id="smTestConnectionBtnText">בדיקת חיבור</span>
                <span id="smTestConnectionBtnSpinner" class="btn-spinner" style="display: none;">⏳ בודק...</span>
              </button>
              <button type="button" class="btn btn-outline-success" id="smSendTestEmailBtn">
                <span id="smSendTestEmailBtnText">שליחת מייל בדיקה</span>
                <span id="smSendTestEmailBtnSpinner" class="btn-spinner" style="display: none;">⏳ שולח...</span>
              </button>
            </div>
          </div>
          <div class="col-12">
            <div id="smSmtpStatus" class="alert alert-info" style="display: none;">
              <strong>סטטוס:</strong> <span id="smSmtpStatusText"></span>
            </div>
          </div>
        </div>
      </form>
    `;
  }

  /**
   * Render External Data settings
   * הצגת הגדרות נתונים חיצוניים
   */
  renderExternalDataSettings(settings) {
    if (!settings) {
      return '<p class="text-muted">טוען הגדרות נתונים חיצוניים...</p>';
    }

    return `
      <form id="smExternalDataSettingsForm">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label" for="smTtlActiveSeconds">TTL Active (שניות)</label>
            <input type="number" id="smTtlActiveSeconds" class="form-control" value="${settings.ttlActiveSeconds || 300}">
          </div>
          <div class="col-md-3">
            <label class="form-label" for="smTtlOpenSeconds">TTL Open (שניות)</label>
            <input type="number" id="smTtlOpenSeconds" class="form-control" value="${settings.ttlOpenSeconds || 900}">
          </div>
          <div class="col-md-3">
            <label class="form-label" for="smTtlClosedSeconds">TTL Closed (שניות)</label>
            <input type="number" id="smTtlClosedSeconds" class="form-control" value="${settings.ttlClosedSeconds || 3600}">
          </div>
          <div class="col-md-3">
            <label class="form-label" for="smTtlCancelledSeconds">TTL Cancelled (שניות)</label>
            <input type="number" id="smTtlCancelledSeconds" class="form-control" value="${settings.ttlCancelledSeconds || 7200}">
          </div>
          <div class="col-md-6">
            <label class="form-label">מתזמן נתונים חיצוניים</label>
            <div class="form-check mt-2">
              <input class="form-check-input" type="checkbox" id="smExternalDataSchedulerEnabled" ${settings.externalDataSchedulerEnabled !== false ? 'checked' : ''}>
              <label class="form-check-label" for="smExternalDataSchedulerEnabled">מופעל</label>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="smExternalDataMaxBatchSize">גודל אצווה מקסימלי</label>
            <input type="number" id="smExternalDataMaxBatchSize" class="form-control" value="${settings.externalDataMaxBatchSize || 100}">
          </div>
          <div class="col-12">
            <button type="submit" class="btn btn-primary" id="smUpdateExternalDataBtn">
              <span id="smUpdateExternalDataBtnText">שמור הגדרות נתונים חיצוניים</span>
              <span id="smUpdateExternalDataBtnSpinner" class="btn-spinner" style="display: none;">⏳ שומר...</span>
            </button>
          </div>
        </div>
      </form>
    `;
  }

  /**
   * Render setting groups as separate cards
   * הצגת קבוצות הגדרות ככרטיסים נפרדים
   */
  renderSettingGroupsCards(groups) {
    if (!groups || groups.length === 0) {
      return '';
    }

    // Filter out groups we already handle (smtp_settings, external_data_settings)
    const otherGroups = groups.filter(g => 
      g.name !== 'smtp_settings' && g.name !== 'external_data_settings'
    );

    if (otherGroups.length === 0) {
      return '';
    }

    return otherGroups.map(group => `
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <img src="/trading-ui/images/icons/tabler/settings.svg" width="20" height="20" alt="${group.display_name || group.name}" class="icon me-2">
            ${group.display_name || group.name}
          </h5>
        </div>
        <div class="card-body">
          ${this.renderSettingGroup(group)}
        </div>
      </div>
    `).join('');
  }

  /**
   * Render setting group
   * הצגת קבוצת הגדרות
   */
  renderSettingGroup(group) {
    if (!group || !group.settings) {
      return '<p class="text-muted">אין הגדרות בקבוצה זו</p>';
    }

    return `
      <form id="smSettingGroupForm_${group.name}" class="setting-group-form">
        <div class="row g-3">
          ${Object.entries(group.settings).map(([key, setting]) => `
            <div class="col-md-${setting.type === 'boolean' ? '12' : '6'}">
              <label class="form-label" for="smSetting_${group.name}_${key}">${setting.label || key}</label>
              ${setting.type === 'boolean' ? `
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="smSetting_${group.name}_${key}" ${setting.value ? 'checked' : ''}>
                  <label class="form-check-label" for="smSetting_${group.name}_${key}">${setting.description || 'מופעל'}</label>
                </div>
              ` : setting.type === 'number' ? `
                <input type="number" id="smSetting_${group.name}_${key}" class="form-control" value="${setting.value || ''}" ${setting.required ? 'required' : ''}>
              ` : `
                <input type="text" id="smSetting_${group.name}_${key}" class="form-control" value="${setting.value || ''}" ${setting.required ? 'required' : ''}>
              `}
              ${setting.description && setting.type !== 'boolean' ? `
                <small class="text-muted">${setting.description}</small>
              ` : ''}
            </div>
          `).join('')}
          <div class="col-12">
            <button type="submit" class="btn btn-primary" id="smSaveGroupBtn_${group.name}">
              <span id="smSaveGroupBtnText_${group.name}">שמור הגדרות ${group.display_name || group.name}</span>
              <span id="smSaveGroupBtnSpinner_${group.name}" class="btn-spinner" style="display: none;">⏳ שומר...</span>
            </button>
          </div>
        </div>
      </form>
    `;
  }

  /**
   * Render setting groups (legacy - for backward compatibility)
   * הצגת קבוצות הגדרות (legacy)
   */
  renderSettingGroups(groups) {
    if (!groups || groups.length === 0) {
      return '<p class="text-muted">אין קבוצות הגדרות נוספות</p>';
    }

    // Filter out groups we already handle (smtp_settings, external_data_settings)
    const otherGroups = groups.filter(g => 
      g.name !== 'smtp_settings' && g.name !== 'external_data_settings'
    );

    if (otherGroups.length === 0) {
      return '<p class="text-muted">אין קבוצות הגדרות נוספות</p>';
    }

    return `
      <div class="list-group">
        ${otherGroups.map(group => `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">${group.name}</h6>
                <p class="mb-0 text-muted small">${group.description || 'אין תיאור'}</p>
              </div>
              <button class="btn btn-sm btn-outline-primary" onclick="window.smSystemSettingsSection?.loadGroupSettings('${group.name}')">
                ניהול
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Setup event listeners
   * הגדרת מטפלי אירועים
   */
  setupEventListeners() {
    // SMTP form submit
    const smtpForm = document.getElementById('smSmtpSettingsForm');
    if (smtpForm) {
      smtpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUpdateSMTPSettings(e);
      });
    }

    // Test connection button
    const testConnectionBtn = document.getElementById('smTestConnectionBtn');
    if (testConnectionBtn) {
      testConnectionBtn.addEventListener('click', () => {
        this.handleTestSMTPConnection();
      });
    }

    // Send test email button
    const sendTestEmailBtn = document.getElementById('smSendTestEmailBtn');
    if (sendTestEmailBtn) {
      sendTestEmailBtn.addEventListener('click', () => {
        this.handleSendTestEmail();
      });
    }

    // Toggle password visibility
    const togglePasswordBtn = document.getElementById('smTogglePasswordBtn');
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        this.togglePasswordVisibility();
      });
    }

    // External Data form submit
    const externalDataForm = document.getElementById('smExternalDataSettingsForm');
    if (externalDataForm) {
      externalDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUpdateExternalDataSettings(e);
      });
    }
  }

  /**
   * Handle update SMTP settings
   * טיפול בעדכון הגדרות SMTP
   */
  async handleUpdateSMTPSettings(event) {
    event.preventDefault();

    const settings = {
      smtp_host: document.getElementById('smSmtpHost')?.value || '',
      smtp_port: parseInt(document.getElementById('smSmtpPort')?.value) || 587,
      smtp_user: document.getElementById('smSmtpUser')?.value || '',
      smtp_password: document.getElementById('smSmtpPassword')?.value || null,
      smtp_from_email: document.getElementById('smSmtpFromEmail')?.value || '',
      smtp_from_name: document.getElementById('smSmtpFromName')?.value || '',
      smtp_use_tls: document.getElementById('smSmtpUseTls')?.checked || false,
      smtp_enabled: document.getElementById('smSmtpEnabled')?.checked || false,
      smtp_test_email: document.getElementById('smSmtpTestEmail')?.value || ''
    };

    // Don't send password if it's empty
    if (!settings.smtp_password || settings.smtp_password.trim() === '') {
      delete settings.smtp_password;
    }

    this.setLoadingState(true, 'smUpdateSmtpBtn', 'smUpdateSmtpBtnText', 'smUpdateSmtpBtnSpinner');

    try {
      const apiUrl = window.API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/system-settings/smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.smtpSettings = { ...this.smtpSettings, ...settings };
        if (!settings.smtp_password) {
          document.getElementById('smSmtpPassword')?.setAttribute('placeholder', 'הסיסמה לא השתנתה');
        } else {
          document.getElementById('smSmtpPassword').value = '';
        }

        if (window.NotificationSystem) {
          window.NotificationSystem.showSuccess('הגדרות SMTP עודכנו בהצלחה', 'system');
        }

        await this.loadSMTPSettings();
      } else {
        const errorMessage = data.error || 'שגיאה בעדכון הגדרות SMTP';
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(errorMessage, 'system');
        }
      }
    } catch (error) {
      console.error('Error updating SMTP settings:', error);
      if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה בעדכון הגדרות SMTP: ' + (error.message || 'שגיאה לא ידועה'), 'system');
      }
    } finally {
      this.setLoadingState(false, 'smUpdateSmtpBtn', 'smUpdateSmtpBtnText', 'smUpdateSmtpBtnSpinner');
    }
  }

  /**
   * Handle test SMTP connection
   * טיפול בבדיקת חיבור SMTP
   */
  async handleTestSMTPConnection() {
    this.setLoadingState(true, 'smTestConnectionBtn', 'smTestConnectionBtnText', 'smTestConnectionBtnSpinner');

    try {
      const apiUrl = window.API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/system-settings/smtp/test`, {
        method: 'POST', });

      const data = await response.json();

      if (response.ok && data.success) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showSuccess('חיבור SMTP תקין', 'system');
        }
        this.showStatus('success', 'חיבור SMTP תקין');
      } else {
        const errorMessage = data.error || 'שגיאת חיבור SMTP';
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(errorMessage, 'system');
        }
        this.showStatus('error', errorMessage);
      }
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה בבדיקת חיבור SMTP: ' + (error.message || 'שגיאה לא ידועה'), 'system');
      }
      this.showStatus('error', 'שגיאה בבדיקת חיבור');
    } finally {
      this.setLoadingState(false, 'smTestConnectionBtn', 'smTestConnectionBtnText', 'smTestConnectionBtnSpinner');
    }
  }

  /**
   * Handle send test email
   * טיפול בשליחת מייל בדיקה
   */
  async handleSendTestEmail() {
    const testEmail = document.getElementById('smSmtpTestEmail')?.value || '';

    if (!testEmail || testEmail.trim() === '') {
      if (window.NotificationSystem) {
        window.NotificationSystem.showError('נא להכניס כתובת אימייל לבדיקה', 'system');
      }
      return;
    }

    this.setLoadingState(true, 'smSendTestEmailBtn', 'smSendTestEmailBtnText', 'smSendTestEmailBtnSpinner');

    try {
      const apiUrl = window.API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/system-settings/smtp/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: testEmail })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showSuccess(`מייל בדיקה נשלח ל-${testEmail}`, 'system');
        }
        this.showStatus('success', `מייל בדיקה נשלח ל-${testEmail}`);
      } else {
        const errorMessage = data.error || 'שגיאה בשליחת מייל בדיקה';
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(errorMessage, 'system');
        }
        this.showStatus('error', errorMessage);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה בשליחת מייל בדיקה: ' + (error.message || 'שגיאה לא ידועה'), 'system');
      }
      this.showStatus('error', 'שגיאה בשליחת מייל');
    } finally {
      this.setLoadingState(false, 'smSendTestEmailBtn', 'smSendTestEmailBtnText', 'smSendTestEmailBtnSpinner');
    }
  }

  /**
   * Handle update External Data settings
   * טיפול בעדכון הגדרות נתונים חיצוניים
   */
  async handleUpdateExternalDataSettings(event) {
    event.preventDefault();

    const settings = {
      ttlActiveSeconds: parseInt(document.getElementById('smTtlActiveSeconds')?.value) || 300,
      ttlOpenSeconds: parseInt(document.getElementById('smTtlOpenSeconds')?.value) || 900,
      ttlClosedSeconds: parseInt(document.getElementById('smTtlClosedSeconds')?.value) || 3600,
      ttlCancelledSeconds: parseInt(document.getElementById('smTtlCancelledSeconds')?.value) || 7200,
      externalDataSchedulerEnabled: document.getElementById('smExternalDataSchedulerEnabled')?.checked || false,
      externalDataMaxBatchSize: parseInt(document.getElementById('smExternalDataMaxBatchSize')?.value) || 100
    };

    this.setLoadingState(true, 'smUpdateExternalDataBtn', 'smUpdateExternalDataBtnText', 'smUpdateExternalDataBtnSpinner');

    try {
      const apiUrl = window.API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/system-settings/external-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.externalDataSettings = { ...this.externalDataSettings, ...settings };
        if (window.NotificationSystem) {
          window.NotificationSystem.showSuccess('הגדרות נתונים חיצוניים עודכנו בהצלחה', 'system');
        }
        await this.loadExternalDataSettings();
      } else {
        const errorMessage = data.error || 'שגיאה בעדכון הגדרות נתונים חיצוניים';
        if (window.NotificationSystem) {
          window.NotificationSystem.showError(errorMessage, 'system');
        }
      }
    } catch (error) {
      console.error('Error updating external data settings:', error);
      if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה בעדכון הגדרות נתונים חיצוניים: ' + (error.message || 'שגיאה לא ידועה'), 'system');
      }
    } finally {
      this.setLoadingState(false, 'smUpdateExternalDataBtn', 'smUpdateExternalDataBtnText', 'smUpdateExternalDataBtnSpinner');
    }
  }

  /**
   * Toggle password visibility
   * החלפת הצגת סיסמה
   */
  togglePasswordVisibility() {
    const passwordEl = document.getElementById('smSmtpPassword');
    const toggleIcon = document.getElementById('smTogglePasswordIcon');

    if (passwordEl && toggleIcon) {
      if (passwordEl.type === 'password') {
        passwordEl.type = 'text';
        toggleIcon.textContent = '🙈';
      } else {
        passwordEl.type = 'password';
        toggleIcon.textContent = '👁️';
      }
    }
  }

  /**
   * Show status message
   * הצגת הודעת סטטוס
   */
  showStatus(type, message) {
    const statusEl = document.getElementById('smSmtpStatus');
    const statusTextEl = document.getElementById('smSmtpStatusText');

    if (statusEl && statusTextEl) {
      statusEl.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
      statusTextEl.textContent = message;
      statusEl.style.display = 'block';

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Set loading state for buttons
   * הגדרת מצב טעינה לכפתורים
   */
  setLoadingState(isLoading, buttonId, textId, spinnerId) {
    const button = document.getElementById(buttonId);
    const text = document.getElementById(textId);
    const spinner = document.getElementById(spinnerId);

    if (button) button.disabled = isLoading;
    if (text) text.style.display = isLoading ? 'none' : 'inline';
    if (spinner) spinner.style.display = isLoading ? 'inline' : 'none';
  }

  /**
   * Load group settings (for future use)
   * טעינת הגדרות קבוצה (לשימוש עתידי)
   */
  async loadGroupSettings(groupName) {
    // This can be expanded to load and display settings for other groups
    console.log(`Loading settings for group: ${groupName}`);
    if (window.NotificationSystem) {
      window.NotificationSystem.showInfo(`טעינת הגדרות עבור ${groupName}...`, 'system');
    }
  }
}

// Export for global access
window.SMSystemSettingsSection = SMSystemSettingsSection;

