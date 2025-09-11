/**
 * Preferences System - Advanced Client
 * ====================================
 * 
 * מערכת העדפות מתקדמת עם פרופילים מרובים,
 * יבוא/יצוא, ובדיקות תקינות מתקדמות.
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Date: January 2025
 */

class Preferences {
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
      console.log('🚀 Initializing Preferences  system...');
      
      // טען פרופילים
      await this.loadProfiles();
      
      // טען הגדרות לפרופיל הנוכחי
      await this.loadPreferences();
      
      // בדוק תאימות עם       await this.checkCompatibility();
      
      // עדכן ממשק
      this.updateUI();
      
      // הגדר event listeners
      this.setupEventListeners();
      
      console.log('✅ Preferences  system initialized');
      
    } catch (error) {
      console.error('❌ Error initializing Preferences :', error);
      this.showError('שגיאה באתחול מערכת העדפות ');
    }
  }
  
  async loadProfiles() {
    try {
      // נסה לטעון פרופילים מהשרת
      const response = await fetch('/api/v1/user/preferences');
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
      console.warn('⚠️ Profiles API not available, using fallback');
      
      // Fallback - צור פרופיל ברירת מחדל
      this.profiles = [{
        id: 1,
        name: 'ברירת מחדל', 
        isDefault: true,
        description: 'פרופיל ברירת מחדל'
      }];
      this.currentProfile = this.profiles[0];
      
      console.log('✅ Created fallback profile');
      return true; // נחשב להצלחה כי יצרנו fallback
    }
  }
  
  async loadPreferences(profileId = null) {
    try {
      const targetProfileId = profileId || this.currentProfile?.id;
      if (!targetProfileId) {
        throw new Error('No profile selected');
      }
      
      // נסה לטעון העדפות מהשרת
      const response = await fetch('/api/v1/user/preferences');
      
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
      console.warn('⚠️ Preferences API not available, using fallback defaults');
      this.preferences = await this.getDefaultPreferences();
      console.log('✅ Loaded fallback preferences');
      return true; // נחשב להצלחה כי טענו fallback
    }
  }
  
  async checkCompatibility() {
    try {
      // Skip  compatibility check - using  API directly
      return;
    } catch (error) {
      console.warn('⚠️ Could not check  compatibility:', error);
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
  
  async saveAllPreferences() {
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
      this.showInfo('מבצע העברה מ ל...');
      
      const response = await fetch('/api/v2/preferences/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force: true })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showSuccess('העברה הושלמה בהצלחה!');
        
        // הסתר התראת העברה
        document.getElementById('transferAlert').classList.add('d-none');
        
        // רענן נתונים
        await this.loadProfiles();
        await this.loadPreferences();
        this.updateUI();
        
      } else {
        throw new Error(data.error || 'שגיאה בהעברה');
      }
      
    } catch (error) {
      console.error('❌ Error running transfer:', error);
      this.showError('שגיאה בהעברה: ' + error.message);
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
    const saveBtn = document.querySelector('[onclick="saveAllPreferences()"]');
    if (saveBtn && !saveBtn.classList.contains('btn-warning')) {
      saveBtn.classList.add('btn-warning');
      saveBtn.innerHTML = '<i class="bi bi-save"></i> שמור שינויים *';
    }
  }
  
  markClean() {
    this.isDirty = false;
    const saveBtn = document.querySelector('[onclick="saveAllPreferences()"]');
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
    const alert = document.getElementById('transferAlert');
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
      'transfer_from_v1': '🔄 העברה מ'
    };
    return labels[changeType] || changeType;
  }
  
  async getDefaultPreferences() {
    try {
      // נסה לטעון ברירות מחדל מהשרת
      const response = await fetch('/api/v1/preferences/defaults');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Loaded defaults from server');
          return data.data.defaults;
        }
      }
      
      // Fallback לברירות מחדל מקומיות
      console.log('📋 Using local fallback defaults');
      return this.getFallbackDefaults();
      
    } catch (error) {
      console.log('📋 Using local fallback defaults (API not available)');
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
      window.showSuccessNotification('הגדרות ', message);
    } else {
      console.log('✅', message);
    }
  }
  
  showError(message) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('הגדרות ', message);
    } else {
      console.error('❌', message);
    }
  }
  
  showInfo(message) {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('הגדרות ', message);
    } else {
      console.log('ℹ️', message);
    }
  }
  
  showWarning(message) {
    if (typeof window.showWarningNotification === 'function') {
      window.showWarningNotification('הגדרות ', message);
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
    if (window.preferences) {
      window.preferences.updateEntityColor(entity, color);
    }
  }
}

// פונקציות שיוצאו לגלובל
/**
 * טעינת העדפות  * טוען את כל ההעדפות מהשרת
 */
function loadPreferences() {
  try {
    console.log('📊 טוען העדפות ...');
    
    // הצגת אינדיקטור טעינה
    if (typeof window.showNotification === 'function') {
      window.showNotification('טוען העדפות ...', 'info');
    }
    
    // טעינת העדפות
    if (window.preferencesInstance) {
      window.preferencesInstance.loadPreferences();
    } else {
      // יצירת instance חדש
      window.preferencesInstance = new Preferences();
    }
    
    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('העדפות  נטענו בהצלחה');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('העדפות  נטענו בהצלחה', 'success');
    }
    
  } catch (error) {
    console.error('שגיאה בטעינת העדפות :', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת העדפות ', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת העדפות ', 'error');
    }
  }
}

/**
 * עדכון העדפה  * מעדכן העדפה ספציפית
 * @param {string} key - מפתח ההעדפה
 * @param {any} value - ערך ההעדפה
 */
function updatePreference(key, value) {
  try {
    console.log('📝 מעדכן העדפה :', key, value);
    
    // עדכון ההעדפה
    if (window.preferencesInstance) {
      window.preferencesInstance.updatePreference(key, value);
    } else {
      throw new Error('Preferences  instance not initialized');
    }
    
    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('העדפה עודכנה בהצלחה');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('העדפה עודכנה בהצלחה', 'success');
    }
    
  } catch (error) {
    console.error('שגיאה בעדכון העדפה :', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון העדפה ', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בעדכון העדפה ', 'error');
    }
  }
}

/**
 * מחיקת העדפה  * מוחק העדפה ספציפית
 * @param {string} key - מפתח ההעדפה
 */
function deletePreference(key) {
  try {
    console.log('🗑️ מוחק העדפה :', key);
    
    // הצגת חלון אישור
    const confirmMessage = `האם אתה בטוח שברצונך למחוק את ההעדפה "${key}"?`;
    
    if (confirm(confirmMessage)) {
      // מחיקת ההעדפה
      if (window.preferencesInstance) {
        window.preferencesInstance.deletePreference(key);
      } else {
        throw new Error('Preferences  instance not initialized');
      }
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('העדפה נמחקה בהצלחה');
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('העדפה נמחקה בהצלחה', 'success');
      }
    }
    
  } catch (error) {
    console.error('שגיאה במחיקת העדפה :', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במחיקת העדפה ', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה במחיקת העדפה ', 'error');
    }
  }
}

/**
 * יצירת פרופיל חדש  * יוצר פרופיל העדפות חדש
 * @param {string} name - שם הפרופיל
 * @param {string} description - תיאור הפרופיל
 */
function createProfile(name, description = '') {
  try {
    console.log('➕ יוצר פרופיל  חדש:', name);
    
    // ולידציה בסיסית
    if (!name || name.trim() === '') {
      throw new Error('שם הפרופיל נדרש');
    }
    
    // יצירת הפרופיל
    if (window.preferencesInstance) {
      window.preferencesInstance.createProfile(name, description);
    } else {
      throw new Error('Preferences  instance not initialized');
    }
    
    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('פרופיל נוצר בהצלחה');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('פרופיל נוצר בהצלחה', 'success');
    }
    
  } catch (error) {
    console.error('שגיאה ביצירת פרופיל :', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה ביצירת פרופיל ', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה ביצירת פרופיל ', 'error');
    }
  }
}

/**
 * מחיקת פרופיל  * מוחק פרופיל העדפות
 * @param {number} profileId - מזהה הפרופיל
 */
function deleteProfile(profileId) {
  try {
    console.log('🗑️ מוחק פרופיל :', profileId);
    
    // הצגת חלון אישור
    const confirmMessage = `האם אתה בטוח שברצונך למחוק את הפרופיל?\n\nפעולה זו אינה ניתנת לביטול.`;
    
    if (confirm(confirmMessage)) {
      // מחיקת הפרופיל
      if (window.preferencesInstance) {
        window.preferencesInstance.deleteProfile(profileId);
      } else {
        throw new Error('Preferences  instance not initialized');
      }
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('פרופיל נמחק בהצלחה');
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('פרופיל נמחק בהצלחה', 'success');
      }
    }
    
  } catch (error) {
    console.error('שגיאה במחיקת פרופיל :', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במחיקת פרופיל ', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה במחיקת פרופיל ', 'error');
    }
  }
}

function saveAllPreferences() {
  if (window.preferences) {
    window.preferences.saveAllPreferences();
  }
}

function createNewProfile() {
  if (window.preferences) {
    window.preferences.createNewProfile();
  }
}

function submitCreateProfile() {
  if (window.preferences) {
    window.preferences.submitCreateProfile();
  }
}

function runMigration() {
  if (window.preferences) {
    window.preferences.runMigration();
  }
}

function exportPreferences() {
  if (window.preferences) {
    window.preferences.exportPreferences();
  }
}

function importPreferences() {
  if (window.preferences) {
    window.preferences.importPreferences();
  }
}

function handleFileImport(event) {
  if (window.preferences) {
    window.preferences.handleFileImport(event);
  }
}

function validateSettings() {
  if (window.preferences) {
    window.preferences.validateSettings();
  }
}

function viewHistory() {
  if (window.preferences) {
    window.preferences.viewHistory();
  }
}

function resetToDefaults() {
  if (window.preferences && confirm('האם אתה בטוח שברצונך לאפס את כל ההגדרות לברירת מחדל?')) {
    // יישום איפוס
    window.preferences.preferences = window.preferences.getDefaultPreferences();
    window.preferences.updateUI();
    window.preferences.markDirty();
  }
}

async function saveCurrentAsDefaults() {
  if (window.preferences) {
    await window.preferences.saveCurrentAsDefaults();
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
  console.log('🎯 DOM loaded, initializing Preferences ...');
  window.preferences = new Preferences();
});