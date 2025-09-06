/**
 * Preferences System V2 - Advanced Client
 * =======================================
 * 
 * מערכת העדפות מתקדמת V2 עם פרופילים מרובים,
 * יבוא/יצוא, ובדיקות תקינות מתקדמות.
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Date: January 2025
 */

class PreferencesV2 {
  constructor() {
    this.currentProfile = null;
    this.profiles = [];
    this.preferences = {};
    this.isDirty = false;
    this.validationErrors = {};
    
    this.init();
  }
  
  async init() {
    try {
      console.log('🚀 Initializing Preferences V2 system...');
      
      // טען פרופילים
      await this.loadProfiles();
      
      // טען הגדרות לפרופיל הנוכחי
      await this.loadPreferences();
      
      // בדוק תאימות עם V1
      await this.checkV1Compatibility();
      
      // עדכן ממשק
      this.updateUI();
      
      // הגדר event listeners
      this.setupEventListeners();
      
      console.log('✅ Preferences V2 system initialized');
      
    } catch (error) {
      console.error('❌ Error initializing Preferences V2:', error);
      this.showError('שגיאה באתחול מערכת העדפות V2');
    }
  }
  
  async loadProfiles() {
    try {
      const response = await fetch('/api/v2/preferences/profiles');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        this.profiles = data.data;
        
        // מצא פרופיל ברירת מחדל
        this.currentProfile = this.profiles.find(p => p.isDefault) || this.profiles[0] || null;
        
        console.log(`📁 Loaded ${this.profiles.length} profiles`);
        return true;
      } else {
        throw new Error(data.error || 'Failed to load profiles');
      }
    } catch (error) {
      console.error('❌ Error loading profiles:', error);
      
      // Fallback - צור פרופיל ברירת מחדל
      this.profiles = [{
        id: 1,
        name: 'ברירת מחדל', 
        isDefault: true,
        description: 'פרופיל ברירת מחדל'
      }];
      this.currentProfile = this.profiles[0];
      
      return false;
    }
  }
  
  async loadPreferences(profileId = null) {
    try {
      const targetProfileId = profileId || this.currentProfile?.id;
      if (!targetProfileId) {
        throw new Error('No profile selected');
      }
      
      const url = `/api/v2/preferences/?profile_id=${targetProfileId}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        this.preferences = data.data.preferences;
        console.log('✅ Loaded preferences for profile', targetProfileId);
        return true;
      } else {
        throw new Error(data.error || 'Failed to load preferences');
      }
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
      this.preferences = await this.getDefaultPreferences();
      return false;
    }
  }
  
  async checkV1Compatibility() {
    try {
      const response = await fetch('/api/v2/preferences/compatibility/v1');
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.success && data.data.recommendation === 'migration_needed') {
        this.showMigrationAlert();
      }
    } catch (error) {
      console.warn('⚠️ Could not check V1 compatibility:', error);
    }
  }
  
  updateUI() {
    try {
      // עדכן טאבי פרופילים
      this.updateProfileTabs();
      
      // עדכן שדות הגדרות
      this.updateSettingsFields();
      
      // עדכן סטטיסטיקות
      this.updateStatistics();
      
      // עדכן תצוגת צבעים
      this.updateColorPreviews();
      
    } catch (error) {
      console.error('❌ Error updating UI:', error);
    }
  }
  
  updateProfileTabs() {
    const container = document.getElementById('profileTabs');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.profiles.forEach(profile => {
      const tab = document.createElement('div');
      tab.className = `profile-tab ${this.currentProfile?.id === profile.id ? 'active' : ''}`;
      tab.onclick = () => this.switchProfile(profile.id);
      
      tab.innerHTML = `
        <div>
          <strong>${profile.name}</strong>
          ${profile.isDefault ? '<div class="profile-badge">●</div>' : ''}
        </div>
        ${profile.description ? `<small class="text-muted d-block">${profile.description}</small>` : ''}
      `;
      
      container.appendChild(tab);
    });
  }
  
  updateSettingsFields() {
    if (!this.preferences.general) return;
    
    const fieldMappings = {
      // בסיסיים
      'primaryCurrency': 'general.primaryCurrency',
      'secondaryCurrency': 'general.secondaryCurrency', 
      'timezone': 'general.timezone',
      'language': 'general.language',
      'defaultStopLoss': 'general.defaultStopLoss',
      'defaultTargetPrice': 'general.defaultTargetPrice',
      'defaultCommission': 'general.defaultCommission',
      'riskPercentage': 'general.riskPercentage',
      'defaultTradeAmount': 'general.defaultTradeAmount',
      
      // פילטרים
      'defaultStatusFilter': 'defaultFilters.status',
      'defaultTypeFilter': 'defaultFilters.type',
      'defaultDateRangeFilter': 'defaultFilters.dateRange',
      'defaultSearchFilter': 'defaultFilters.search',
      'defaultProfitFilter': 'defaultFilters.profit',
      
      // ממשק משתמש
      'compactMode': 'ui.compactMode',
      'showAnimations': 'ui.showAnimations',
      'tablePageSize': 'ui.table.pageSize',
      'tableRefreshInterval': 'ui.table.refreshInterval',
      
      // נתונים חיצוניים
      'primaryDataProvider': 'externalData.providers.primary',
      'secondaryDataProvider': 'externalData.providers.secondary',
      'fallbackDataProvider': 'externalData.providers.fallback',
      'dataRefreshInterval': 'externalData.refresh.interval',
      'cacheTtl': 'externalData.refresh.cacheTTL',
      'maxBatchSize': 'externalData.refresh.maxBatchSize'
    };
    
    // עדכן שדות
    Object.entries(fieldMappings).forEach(([elementId, path]) => {
      const element = document.getElementById(elementId);
      if (element) {
        const value = this.getNestedValue(this.preferences, path);
        if (value !== undefined) {
          if (element.type === 'checkbox') {
            element.checked = Boolean(value);
          } else {
            element.value = value;
          }
        }
      }
    });
    
    // עדכן theme
    if (this.preferences.ui?.theme) {
      const themeInput = document.querySelector(`input[name="theme"][value="${this.preferences.ui.theme}"]`);
      if (themeInput) {
        themeInput.checked = true;
      }
    }
  }
  
  updateStatistics() {
    try {
      // עדכן מונה פרופילים
      const totalProfilesEl = document.getElementById('totalProfiles');
      if (totalProfilesEl) {
        totalProfilesEl.textContent = this.profiles.length;
      }
      
      // עדכן מונה הגדרות
      const settingsCountEl = document.getElementById('settingsCount');
      if (settingsCountEl) {
        const totalSettings = this.countTotalSettings();
        settingsCountEl.textContent = totalSettings;
      }
      
      // עדכן זמן עדכון אחרון
      const lastUpdateEl = document.getElementById('lastUpdate');
      if (lastUpdateEl && this.preferences.metadata?.updatedAt) {
        const date = new Date(this.preferences.metadata.updatedAt);
        lastUpdateEl.textContent = date.toLocaleDateString('he-IL');
      }
      
      // עדכן סטטוס תקינות
      const validationStatusEl = document.getElementById('validationStatus');
      if (validationStatusEl) {
        const hasErrors = Object.keys(this.validationErrors).length > 0;
        validationStatusEl.textContent = hasErrors ? '⚠️' : '✅';
      }
      
    } catch (error) {
      console.error('❌ Error updating statistics:', error);
    }
  }
  
  updateColorPreviews() {
    try {
      if (!this.preferences.colorScheme) return;
      
      const { numericValues, entities } = this.preferences.colorScheme;
      
      // עדכן צבעי ערכים מספריים
      if (numericValues) {
        ['positive', 'negative', 'zero'].forEach(type => {
          const preview = document.querySelector(`.color-preview[onclick*="${type}"]`);
          if (preview && numericValues[type]?.text) {
            preview.style.backgroundColor = numericValues[type].text;
          }
        });
      }
      
      // עדכן צבעי ישויות
      if (entities) {
        ['trade', 'account', 'ticker', 'alert'].forEach(entity => {
          const preview = document.querySelector(`.color-preview[onclick*="${entity}"]`);
          if (preview && entities[entity]) {
            preview.style.backgroundColor = entities[entity];
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error updating color previews:', error);
    }
  }
  
  setupEventListeners() {
    // האזנה לשינויים בשדות
    const settingsFields = document.querySelectorAll('#general-body input, #general-body select, #filters-body input, #filters-body select, #ui-body input, #ui-body select, #external-body input, #external-body select');
    
    settingsFields.forEach(field => {
      field.addEventListener('change', (e) => {
        this.markDirty();
        this.updatePreferenceFromField(e.target);
      });
    });
    
    // האזנה לשינוי theme
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.updateTheme(e.target.value);
        }
      });
    });
    
    // האזנה לכפתור Save
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty) {
        e.preventDefault();
        e.returnValue = 'יש לך שינויים לא שמורים. האם אתה בטוח שברצונך לעזוב?';
      }
    });
  }
  
  async switchProfile(profileId) {
    try {
      if (this.isDirty) {
        const confirmed = await this.confirmUnsavedChanges();
        if (!confirmed) return;
      }
      
      const profile = this.profiles.find(p => p.id === profileId);
      if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
      }
      
      this.currentProfile = profile;
      
      // טען הגדרות לפרופיל החדש
      await this.loadPreferences(profileId);
      
      // עדכן ממשק
      this.updateUI();
      this.markClean();
      
      console.log(`✅ Switched to profile: ${profile.name}`);
      
    } catch (error) {
      console.error('❌ Error switching profile:', error);
      this.showError('שגיאה במעבר בין פרופילים');
    }
  }
  
  async saveAllPreferencesV2() {
    try {
      if (!this.currentProfile) {
        throw new Error('No profile selected');
      }
      
      this.showInfo('שומר הגדרות...');
      
      const requestData = {
        profile_id: this.currentProfile.id,
        preferences: this.preferences
      };
      
      const response = await fetch('/api/v2/preferences/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.markClean();
        this.showSuccess('ההגדרות נשמרו בהצלחה!');
        
        // עדכן זמן עדכון אחרון
        if (!this.preferences.metadata) {
          this.preferences.metadata = {};
        }
        this.preferences.metadata.updatedAt = new Date().toISOString();
        this.updateStatistics();
        
      } else {
        throw new Error(data.error || 'שגיאה בשמירת הגדרות');
      }
      
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      this.showError('שגיאה בשמירת הגדרות: ' + error.message);
    }
  }
  
  async createNewProfile() {
    try {
      const modal = new bootstrap.Modal(document.getElementById('createProfileModal'));
      modal.show();
    } catch (error) {
      console.error('❌ Error opening create profile modal:', error);
    }
  }
  
  async submitCreateProfile() {
    try {
      const name = document.getElementById('newProfileName').value.trim();
      const description = document.getElementById('newProfileDescription').value.trim();
      const isDefault = document.getElementById('newProfileIsDefault').checked;
      
      if (!name) {
        this.showError('שם הפרופיל נדרש');
        return;
      }
      
      const requestData = {
        name: name,
        description: description,
        isDefault: isDefault
      };
      
      const response = await fetch('/api/v2/preferences/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showSuccess('פרופיל נוצר בהצלחה!');
        
        // סגור modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createProfileModal'));
        modal.hide();
        
        // רענן פרופילים
        await this.loadProfiles();
        this.updateProfileTabs();
        
        // עבור לפרופיל החדש
        await this.switchProfile(data.data.id);
        
      } else {
        throw new Error(data.error || 'שגיאה ביצירת פרופיל');
      }
      
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      this.showError('שגיאה ביצירת פרופיל: ' + error.message);
    }
  }
  
  async runMigration() {
    try {
      this.showInfo('מבצע מיגרציה מV1 לV2...');
      
      const response = await fetch('/api/v2/preferences/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force: true })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showSuccess('מיגרציה הושלמה בהצלחה!');
        
        // הסתר התראת מיגרציה
        document.getElementById('migrationAlert').classList.add('d-none');
        
        // רענן נתונים
        await this.loadProfiles();
        await this.loadPreferences();
        this.updateUI();
        
      } else {
        throw new Error(data.error || 'שגיאה במיגרציה');
      }
      
    } catch (error) {
      console.error('❌ Error running migration:', error);
      this.showError('שגיאה במיגרציה: ' + error.message);
    }
  }
  
  async exportPreferences() {
    try {
      if (!this.currentProfile) {
        throw new Error('No profile selected');
      }
      
      const profileId = this.currentProfile.id;
      const includeSensitive = confirm('האם לכלול הגדרות רגישות (אבטחה)?');
      
      const url = `/api/v2/preferences/export?profile_id=${profileId}&include_sensitive=${includeSensitive}`;
      
      // יצור link להורדה
      const link = document.createElement('a');
      link.href = url;
      link.download = `tiktrack_preferences_${this.currentProfile.name}_${new Date().toISOString().slice(0,10)}.json`;
      link.click();
      
      this.showSuccess('ההגדרות יוצאו בהצלחה!');
      
    } catch (error) {
      console.error('❌ Error exporting preferences:', error);
      this.showError('שגיאה ביצוא הגדרות: ' + error.message);
    }
  }
  
  importPreferences() {
    try {
      const fileInput = document.getElementById('importFileInput');
      fileInput.click();
    } catch (error) {
      console.error('❌ Error opening import dialog:', error);
    }
  }
  
  async handleFileImport(event) {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      this.showInfo('מעלה הגדרות...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('create_new_profile', 'true');
      formData.append('profile_name', `ייבוא ${new Date().toLocaleString('he-IL')}`);
      
      const response = await fetch('/api/v2/preferences/import', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showSuccess('הגדרות יובאו בהצלחה!');
        
        // רענן פרופילים
        await this.loadProfiles();
        this.updateProfileTabs();
        
      } else {
        throw new Error(data.error || 'שגיאה בייבוא הגדרות');
      }
      
      // נקה את הקלט
      event.target.value = '';
      
    } catch (error) {
      console.error('❌ Error importing preferences:', error);
      this.showError('שגיאה בייבוא הגדרות: ' + error.message);
    }
  }
  
  async validateSettings() {
    try {
      if (!this.currentProfile) return;
      
      this.showInfo('בודק תקינות הגדרות...');
      
      const response = await fetch(`/api/v2/preferences/validate?profile_id=${this.currentProfile.id}`);
      const data = await response.json();
      
      if (data.success) {
        this.validationErrors = data.data.errors || {};
        
        if (data.data.isValid) {
          this.showSuccess('כל ההגדרות תקינות!');
        } else {
          this.showWarning(`נמצאו ${Object.keys(this.validationErrors).length} שגיאות תקינות`);
        }
        
        this.updateStatistics();
      } else {
        throw new Error(data.error || 'שגיאה בבדיקת תקינות');
      }
      
    } catch (error) {
      console.error('❌ Error validating settings:', error);
      this.showError('שגיאה בבדיקת תקינות');
    }
  }
  
  async viewHistory() {
    try {
      if (!this.currentProfile) return;
      
      const modal = new bootstrap.Modal(document.getElementById('historyModal'));
      modal.show();
      
      // טען היסטוריה
      const response = await fetch(`/api/v2/preferences/history?profile_id=${this.currentProfile.id}&days=30`);
      const data = await response.json();
      
      const historyContent = document.getElementById('historyContent');
      
      if (data.success && data.data.length > 0) {
        const historyHTML = data.data.map(entry => `
          <div class="border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between">
              <strong>${this.getChangeTypeLabel(entry.changeType)}</strong>
              <small class="text-muted">${new Date(entry.createdAt).toLocaleString('he-IL')}</small>
            </div>
            ${entry.changeReason ? `<p class="mb-1 text-muted">${entry.changeReason}</p>` : ''}
            ${entry.fieldName ? `<small>שדה: ${entry.fieldName}</small>` : ''}
          </div>
        `).join('');
        
        historyContent.innerHTML = historyHTML;
      } else {
        historyContent.innerHTML = '<p class="text-center text-muted">אין היסטוריה זמינה</p>';
      }
      
    } catch (error) {
      console.error('❌ Error viewing history:', error);
      document.getElementById('historyContent').innerHTML = '<p class="text-center text-danger">שגיאה בטעינת היסטוריה</p>';
    }
  }
  
  // פונקציות עזר
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
  
  updatePreferenceFromField(field) {
    const fieldMappings = {
      'primaryCurrency': 'general.primaryCurrency',
      'secondaryCurrency': 'general.secondaryCurrency',
      'timezone': 'general.timezone',
      'defaultStopLoss': 'general.defaultStopLoss',
      // ... וכו'
    };
    
    const path = fieldMappings[field.id];
    if (path) {
      let value = field.type === 'checkbox' ? field.checked : field.value;
      
      // המרות טיפוס
      if (field.type === 'number') {
        value = parseFloat(value) || 0;
      }
      
      this.setNestedValue(this.preferences, path, value);
    }
  }
  
  updateTheme(theme) {
    if (!this.preferences.ui) {
      this.preferences.ui = {};
    }
    this.preferences.ui.theme = theme;
    this.markDirty();
    
    // הפעל theme מיד
    document.body.className = `theme-${theme}`;
  }
  
  markDirty() {
    this.isDirty = true;
    // עדכן ויזואלי שיש שינויים לא שמורים
    const saveBtn = document.querySelector('[onclick="saveAllPreferencesV2()"]');
    if (saveBtn && !saveBtn.classList.contains('btn-warning')) {
      saveBtn.classList.add('btn-warning');
      saveBtn.innerHTML = '<i class="bi bi-save"></i> שמור שינויים *';
    }
  }
  
  markClean() {
    this.isDirty = false;
    const saveBtn = document.querySelector('[onclick="saveAllPreferencesV2()"]');
    if (saveBtn) {
      saveBtn.classList.remove('btn-warning');
      saveBtn.innerHTML = '<i class="bi bi-save"></i> שמור הגדרות';
    }
  }
  
  countTotalSettings() {
    let count = 0;
    const countObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return 0;
      return Object.keys(obj).length + Object.values(obj).reduce((sum, val) => sum + countObject(val), 0);
    };
    return countObject(this.preferences);
  }
  
  showMigrationAlert() {
    const alert = document.getElementById('migrationAlert');
    if (alert) {
      alert.classList.remove('d-none');
    }
  }
  
  getChangeTypeLabel(changeType) {
    const labels = {
      'create': '✨ יצירה',
      'update': '📝 עדכון', 
      'delete': '🗑️ מחיקה',
      'import': '📤 ייבוא',
      'export': '📥 יצוא',
      'migrate_from_v1': '🔄 מיגרציה מV1'
    };
    return labels[changeType] || changeType;
  }
  
  async getDefaultPreferences() {
    try {
      // נסה לטעון ברירות מחדל מהשרת
      const response = await fetch('/api/v2/preferences/defaults');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Loaded defaults from server');
          return data.data.defaults;
        }
      }
      
      // Fallback לברירות מחדל מקומיות
      console.warn('⚠️ Using fallback defaults');
      return this.getFallbackDefaults();
      
    } catch (error) {
      console.error('❌ Error loading defaults:', error);
      return this.getFallbackDefaults();
    }
  }
  
  getFallbackDefaults() {
    return {
      version: '2.0',
      lastUpdated: new Date().toISOString(),
      description: 'Fallback defaults - server loading failed',
      general: {
        primaryCurrency: 'USD',
        timezone: 'Asia/Jerusalem',
        defaultStopLoss: 5,
        defaultTargetPrice: 10,
        defaultCommission: 1
      },
      defaultFilters: {
        status: 'open',
        type: 'swing', 
        dateRange: 'this_week'
      },
      ui: {
        theme: 'light',
        compactMode: false,
        showAnimations: true
      },
      externalData: {
        providers: {
          primary: 'yahoo',
          secondary: 'google'
        },
        refresh: {
          interval: 5,
          cacheTTL: 5
        }
      }
    };
  }
  
  async confirmUnsavedChanges() {
    return new Promise((resolve) => {
      if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
          'שינויים לא שמורים',
          'יש לך שינויים לא שמורים. האם להמשיך בלי לשמור?',
          () => resolve(true),
          () => resolve(false)
        );
      } else {
        resolve(confirm('יש לך שינויים לא שמורים. האם להמשיך בלי לשמור?'));
      }
    });
  }
  
  // פונקציות ברירות מחדל
  async saveCurrentAsDefaults() {
    try {
      if (!this.currentProfile) {
        this.showError('אין פרופיל נבחר');
        return false;
      }
      
      const response = await fetch('/api/v2/preferences/defaults/save-from-current', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile_id: this.currentProfile.id
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        this.showSuccess('ברירות המחדל נשמרו בהצלחה');
        return true;
      } else {
        throw new Error(data.error || 'Failed to save defaults');
      }
      
    } catch (error) {
      console.error('❌ Error saving defaults:', error);
      this.showError('שגיאה בשמירת ברירות מחדל: ' + error.message);
      return false;
    }
  }
  
  async loadDefaultsFromServer() {
    try {
      const response = await fetch('/api/v2/preferences/defaults');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        return data.data.defaults;
      } else {
        throw new Error(data.error || 'Failed to load defaults');
      }
      
    } catch (error) {
      console.error('❌ Error loading defaults:', error);
      return null;
    }
  }

  // פונקציות התראות
  showSuccess(message) {
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הגדרות V2', message);
    } else {
      console.log('✅', message);
    }
  }
  
  showError(message) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('הגדרות V2', message);
    } else {
      console.error('❌', message);
    }
  }
  
  showInfo(message) {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('הגדרות V2', message);
    } else {
      console.log('ℹ️', message);
    }
  }
  
  showWarning(message) {
    if (typeof window.showWarningNotification === 'function') {
      window.showWarningNotification('הגדרות V2', message);
    } else {
      console.warn('⚠️', message);
    }
  }
}

// פונקציות גלובליות לHTML

function toggleSection(sectionId) {
  const body = document.getElementById(sectionId + '-body');
  const toggle = document.getElementById(sectionId + '-toggle');
  
  if (body && toggle) {
    if (body.classList.contains('collapsed')) {
      body.classList.remove('collapsed');
      toggle.classList.remove('collapsed');
      toggle.textContent = '▼';
    } else {
      body.classList.add('collapsed');
      toggle.classList.add('collapsed'); 
      toggle.textContent = '◀';
    }
  }
}

function openColorPicker(type) {
  const colorInput = document.getElementById(type + 'Color');
  if (colorInput) {
    colorInput.click();
  }
}

function openEntityColorPicker(entity) {
  // פתח דיאלוג בחירת צבע לישות
  const color = prompt(`בחר צבע ל${entity} (hex):`, '#007bff');
  if (color && /^#[0-9A-F]{6}$/i.test(color)) {
    const preview = document.querySelector(`.color-preview[onclick*="${entity}"]`);
    if (preview) {
      preview.style.backgroundColor = color;
    }
    
    // עדכן בהעדפות
    if (window.preferencesV2) {
      window.preferencesV2.updateEntityColor(entity, color);
    }
  }
}

// פונקציות שיוצאו לגלובל
function saveAllPreferencesV2() {
  if (window.preferencesV2) {
    window.preferencesV2.saveAllPreferencesV2();
  }
}

function createNewProfile() {
  if (window.preferencesV2) {
    window.preferencesV2.createNewProfile();
  }
}

function submitCreateProfile() {
  if (window.preferencesV2) {
    window.preferencesV2.submitCreateProfile();
  }
}

function runMigration() {
  if (window.preferencesV2) {
    window.preferencesV2.runMigration();
  }
}

function exportPreferences() {
  if (window.preferencesV2) {
    window.preferencesV2.exportPreferences();
  }
}

function importPreferences() {
  if (window.preferencesV2) {
    window.preferencesV2.importPreferences();
  }
}

function handleFileImport(event) {
  if (window.preferencesV2) {
    window.preferencesV2.handleFileImport(event);
  }
}

function validateSettings() {
  if (window.preferencesV2) {
    window.preferencesV2.validateSettings();
  }
}

function viewHistory() {
  if (window.preferencesV2) {
    window.preferencesV2.viewHistory();
  }
}

function resetToDefaults() {
  if (window.preferencesV2 && confirm('האם אתה בטוח שברצונך לאפס את כל ההגדרות לברירת מחדל?')) {
    // יישום איפוס
    window.preferencesV2.preferences = window.preferencesV2.getDefaultPreferences();
    window.preferencesV2.updateUI();
    window.preferencesV2.markDirty();
  }
}

async function saveCurrentAsDefaults() {
  if (window.preferencesV2) {
    await window.preferencesV2.saveCurrentAsDefaults();
  }
}

function previewSettings() {
  if (typeof showNotification === 'function') {
    showNotification('תכונה זו תתווסף בעתיד - תצוגה מקדימה של ההגדרות', 'info');
  } else {
    alert('תכונה זו תתווסף בעתיד - תצוגה מקדימה של ההגדרות');
  }
}

// אתחול כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 DOM loaded, initializing Preferences V2...');
  window.preferencesV2 = new PreferencesV2();
});