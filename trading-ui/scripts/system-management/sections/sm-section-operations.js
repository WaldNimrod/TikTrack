/**
 * System Management Operations Section - TikTrack
 * ===========================================
 * 
 * Operations section for system management operations
 * Shows server restart, cache operations, and external tools access
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMOperationsSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, config);
    this.apiEndpoints = {
      restart: '/api/server/restart',
      cache: '/api/cache/clear',
      mode: '/api/server/change-mode'
    };
  }

  /**
   * Load operations data from APIs
   * טעינת נתוני פעולות מה-APIs
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`🔧 Loading operations data`);

      // Operations section doesn't need to load data from APIs
      // It's mainly for performing operations
      const operationsData = {
        timestamp: new Date().toISOString(),
        availableOperations: this.getAvailableOperations()
      };

      this.lastData = operationsData;
      this.render(operationsData);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('❌ Failed to load operations data:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get available operations
   * קבלת פעולות זמינות
   */
  getAvailableOperations() {
    return {
      server: {
        restart: true,
        changeMode: true,
        status: true
      },
      cache: {
        clear: true,
        stats: true,
        health: true
      },
      external: {
        serverMonitor: true,
        externalDataDashboard: true,
        logs: true
      }
    };
  }

  /**
   * Render operations data
   * הצגת נתוני פעולות
   */
  render(data) {
    if (!data) {
      this.showEmptyState('אין נתוני פעולות זמינים');
      return;
    }

    try {
      const operationsHtml = this.createOperationsHTML(data);
      this.container.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(operationsHtml, 'text/html');
      doc.body.childNodes.forEach(node => {
        this.container.appendChild(node.cloneNode(true));
      });
      
      console.log('✅ Operations section rendered successfully');
      
    } catch (error) {
      console.error('❌ Failed to render operations section:', error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'render',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create operations HTML
   * יצירת HTML של פעולות
   */
  createOperationsHTML(data) {
    const { availableOperations } = data;

    return `
      <div class="operations-overview">
        <!-- Server Operations -->
        <div class="row mb-4">
          <div class="col-12">
            ${this.createServerOperationsCard(availableOperations.server)}
          </div>
        </div>

        <!-- Cache Operations -->
        <div class="row mb-4">
          <div class="col-12">
            ${this.createCacheOperationsCard(availableOperations.cache)}
          </div>
        </div>

        <!-- External Tools -->
        <div class="row">
          <div class="col-12">
            ${this.createExternalToolsCard(availableOperations.external)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create server operations card
   * יצירת כרטיס פעולות שרת
   */
  createServerOperationsCard(serverOps) {
    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-server"></i> פעולות שרת</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>הפעלת שרת מחדש</h6>
              <div class="operation-buttons">
                <button class="btn btn-warning btn-sm me-2 mb-2" onclick="SMOperationsSection.restartServer('quick')">
                  <i class="fas fa-sync-alt"></i> הפעלה מהירה
                </button>
                <button class="btn btn-danger btn-sm me-2 mb-2" onclick="SMOperationsSection.restartServer('full')">
                  <i class="fas fa-redo"></i> הפעלה מלאה
                </button>
              </div>
              
              <h6 class="mt-3">שינוי מצב שרת</h6>
              <div class="operation-buttons">
                <button class="btn btn-outline-primary btn-sm me-2 mb-2" onclick="SMOperationsSection.changeServerMode('development')">
                  <i class="fas fa-code"></i> מצב פיתוח
                </button>
                <button class="btn btn-outline-success btn-sm me-2 mb-2" onclick="SMOperationsSection.changeServerMode('production')">
                  <i class="fas fa-rocket"></i> מצב ייצור
                </button>
                <button class="btn btn-outline-warning btn-sm me-2 mb-2" onclick="SMOperationsSection.changeServerMode('no-cache')">
                  <i class="fas fa-broom"></i> ללא מטמון
                </button>
              </div>
            </div>
            
            <div class="col-md-6">
              <h6>פעולות נוספות</h6>
              <div class="operation-buttons">
                <button class="btn btn-outline-info btn-sm me-2 mb-2" onclick="SMOperationsSection.checkServerStatus()">
                  <i class="fas fa-heartbeat"></i> בדיקת סטטוס
                </button>
                <button class="btn btn-outline-secondary btn-sm me-2 mb-2" onclick="SMOperationsSection.viewServerLogs()">
                  <i class="fas fa-list-alt"></i> צפייה בלוגים
                </button>
                <button class="btn btn-outline-primary btn-sm me-2 mb-2" onclick="SMOperationsSection.exportServerConfig()">
                  <i class="fas fa-download"></i> ייצוא הגדרות
                </button>
              </div>
              
              <div class="server-info mt-3">
                <div class="info-item">
                  <span class="info-label">מצב נוכחי:</span>
                  <span class="info-value" id="current-server-mode">לא ידוע</span>
                </div>
                <div class="info-item">
                  <span class="info-label">זמן פעילות:</span>
                  <span class="info-value" id="server-uptime">לא ידוע</span>
                </div>
                <div class="info-item">
                  <span class="info-label">גרסה:</span>
                  <span class="info-value" id="server-version">לא ידוע</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create cache operations card
   * יצירת כרטיס פעולות מטמון
   */
  createCacheOperationsCard(cacheOps) {
    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-layer-group"></i> פעולות מטמון</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>ניקוי מטמון</h6>
              <div class="operation-buttons">
                <button class="btn btn-outline-warning btn-sm me-2 mb-2" onclick="SMOperationsSection.clearCache('light')">
                  <i class="fas fa-broom"></i> ניקוי קל
                </button>
                <button class="btn btn-outline-warning btn-sm me-2 mb-2" onclick="SMOperationsSection.clearCache('medium')">
                  <i class="fas fa-trash-alt"></i> ניקוי בינוני
                </button>
                <button class="btn btn-outline-danger btn-sm me-2 mb-2" onclick="SMOperationsSection.clearCache('full')">
                  <i class="fas fa-fire"></i> ניקוי מלא
                </button>
                <button class="btn btn-outline-dark btn-sm me-2 mb-2" onclick="SMOperationsSection.clearCache('nuclear')">
                  <i class="fas fa-bomb"></i> ניקוי גרעיני
                </button>
              </div>
              
              <h6 class="mt-3">פעולות מטמון</h6>
              <div class="operation-buttons">
                <button class="btn btn-outline-info btn-sm me-2 mb-2" onclick="SMOperationsSection.viewCacheStats()">
                  <i class="fas fa-chart-bar"></i> סטטיסטיקות
                </button>
                <button class="btn btn-outline-success btn-sm me-2 mb-2" onclick="SMOperationsSection.checkCacheHealth()">
                  <i class="fas fa-heartbeat"></i> בדיקת בריאות
                </button>
              </div>
            </div>
            
            <div class="col-md-6">
              <h6>מידע מטמון</h6>
              <div class="cache-info">
                <div class="info-item">
                  <span class="info-label">Hit Rate:</span>
                  <span class="info-value" id="cache-hit-rate">לא ידוע</span>
                </div>
                <div class="info-item">
                  <span class="info-label">גודל כולל:</span>
                  <span class="info-value" id="cache-total-size">לא ידוע</span>
                </div>
                <div class="info-item">
                  <span class="info-label">פריטים:</span>
                  <span class="info-value" id="cache-items-count">לא ידוע</span>
                </div>
                <div class="info-item">
                  <span class="info-label">סטטוס:</span>
                  <span class="info-value" id="cache-status">לא ידוע</span>
                </div>
              </div>
              
              <div class="cache-actions mt-3">
                <button class="btn btn-outline-primary btn-sm me-2" onclick="SMOperationsSection.refreshCacheInfo()">
                  <i class="fas fa-sync-alt"></i> רענן מידע
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="SMOperationsSection.exportCacheData()">
                  <i class="fas fa-download"></i> ייצא נתונים
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create external tools card
   * יצירת כרטיס כלים חיצוניים
   */
  createExternalToolsCard(externalOps) {
    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-external-link-alt"></i> כלים חיצוניים</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <h6>מעקב שרת</h6>
              <div class="tool-buttons">
                <button class="btn btn-outline-primary btn-sm me-2 mb-2" onclick="SMOperationsSection.openServerMonitor()">
                  <i class="fas fa-desktop"></i> Server Monitor
                </button>
                <button class="btn btn-outline-info btn-sm me-2 mb-2" onclick="SMOperationsSection.openSystemLogs()">
                  <i class="fas fa-list-alt"></i> System Logs
                </button>
              </div>
            </div>
            
            <div class="col-md-4">
              <h6>נתונים חיצוניים</h6>
              <div class="tool-buttons">
                <button class="btn btn-outline-success btn-sm me-2 mb-2" onclick="SMOperationsSection.openExternalDataDashboard()">
                  <i class="fas fa-chart-line"></i> External Data Dashboard
                </button>
                <button class="btn btn-outline-warning btn-sm me-2 mb-2" onclick="SMOperationsSection.openDataLogs()">
                  <i class="fas fa-database"></i> Data Logs
                </button>
              </div>
            </div>
            
            <div class="col-md-4">
              <h6>כלים נוספים</h6>
              <div class="tool-buttons">
                <button class="btn btn-outline-secondary btn-sm me-2 mb-2" onclick="SMOperationsSection.openUnifiedLogs()">
                  <i class="fas fa-file-alt"></i> Unified Logs
                </button>
                <button class="btn btn-outline-dark btn-sm me-2 mb-2" onclick="SMOperationsSection.openSystemInfo()">
                  <i class="fas fa-info-circle"></i> System Info
                </button>
              </div>
            </div>
          </div>
          
          <div class="row mt-3">
            <div class="col-12">
              <div class="external-tools-info">
                <div class="info-item">
                  <span class="info-label">כלים זמינים:</span>
                  <span class="info-value">${Object.keys(externalOps).length} קטגוריות</span>
                </div>
                <div class="info-item">
                  <span class="info-label">סטטוס:</span>
                  <span class="info-value">כל הכלים פעילים</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Restart server (static method for global access)
   * הפעלת שרת מחדש (מתודה סטטית לגישה גלובלית)
   */
  static async restartServer(restartType) {
    try {
      console.log(`🔄 Restarting server (${restartType})...`);
      
      const response = await fetch('/api/server/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          mode: 'development', // Default mode
          restart_type: restartType 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(result.message || 'השרת מופעל מחדש...', 'info');
        }
        
        // Show countdown or redirect
        setTimeout(() => {
          if (window.showNotification) {
            window.showNotification('השרת מופעל מחדש, העמוד יטען בעוד רגע...', 'warning');
          }
        }, 2000);
        
      } else {
        throw new Error(result.message || 'Failed to restart server');
      }
      
    } catch (error) {
      console.error('❌ Failed to restart server:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בהפעלת שרת מחדש: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Change server mode (static method for global access)
   * שינוי מצב שרת (מתודה סטטית לגישה גלובלית)
   */
  static async changeServerMode(mode) {
    try {
      console.log(`🔧 Changing server mode to ${mode}...`);
      
      const response = await fetch('/api/server/change-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ mode })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(result.message || `מצב שרת שונה ל-${mode}`, 'success');
        }
        
        // Update UI
        const modeElement = document.getElementById('current-server-mode');
        if (modeElement) {
          modeElement.textContent = mode;
        }
        
      } else {
        throw new Error(result.message || 'Failed to change server mode');
      }
      
    } catch (error) {
      console.error('❌ Failed to change server mode:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בשינוי מצב שרת: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Clear cache (static method for global access)
   * ניקוי מטמון (מתודה סטטית לגישה גלובלית)
   * Uses existing UnifiedCacheManager functions to avoid duplication
   */
  static async clearCache(level) {
    try {
      console.log(`🧹 Clearing cache (${level}) via UnifiedCacheManager...`);
      
      // Use existing UnifiedCacheManager functions instead of duplicating
      if (level === 'light' && typeof window.clearCacheLayer === 'function') {
        await window.clearCacheLayer('localStorage');
      } else if (level === 'medium' && typeof window.clearAllCacheAdvanced === 'function') {
        await window.clearAllCacheAdvanced();
      } else if (level === 'full' && typeof window.clearAllCacheAdvanced === 'function') {
        await window.clearAllCacheAdvanced();
      } else if (level === 'nuclear' && typeof window.clearCacheFull === 'function') {
        await window.clearCacheFull();
      } else {
        // Fallback to basic cache clearing
        if (typeof window.clearAllCacheAdvanced === 'function') {
          await window.clearAllCacheAdvanced();
        } else {
          throw new Error('No cache clearing functions available');
        }
      }
      
      // Refresh cache info
      SMOperationsSection.refreshCacheInfo();
      
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בניקוי מטמון: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Check server status (static method for global access)
   * בדיקת סטטוס שרת (מתודה סטטית לגישה גלובלית)
   */
  static async checkServerStatus() {
    try {
      console.log('🔍 Checking server status...');
      
      const response = await fetch('/api/server/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification('סטטוס שרת נבדק בהצלחה', 'success');
        }
        
        // Update UI with server info
        const data = result.data;
        if (data) {
          const uptimeElement = document.getElementById('server-uptime');
          const versionElement = document.getElementById('server-version');
          
          if (uptimeElement && data.uptime) {
            uptimeElement.textContent = data.uptime;
          }
          if (versionElement && data.version) {
            versionElement.textContent = data.version;
          }
        }
        
      } else {
        throw new Error(result.message || 'Failed to check server status');
      }
      
    } catch (error) {
      console.error('❌ Failed to check server status:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בבדיקת סטטוס שרת: ${error.message}`, 'error');
      }
    }
  }

  /**
   * View server logs (static method for global access)
   * צפייה בלוגי שרת (מתודה סטטית לגישה גלובלית)
   */
  static viewServerLogs() {
    console.log('📋 Viewing server logs');
    window.open('/system-logs', '_blank');
  }

  /**
   * Export server config (static method for global access)
   * ייצוא הגדרות שרת (מתודה סטטית לגישה גלובלית)
   */
  static exportServerConfig() {
    console.log('📤 Exporting server config');
    if (window.showInfoNotification) {
      window.showInfoNotification('ייצוא הגדרות שרת', 'info');
    } else {
      alert('ייצוא הגדרות שרת');
    }
  }

  /**
   * View cache stats (static method for global access)
   * צפייה בסטטיסטיקות מטמון (מתודה סטטית לגישה גלובלית)
   */
  static async viewCacheStats() {
    try {
      console.log('📊 Viewing cache stats...');
      
      const response = await fetch('/api/cache/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification('סטטיסטיקות מטמון נטענו', 'success');
        }
        
        // Update UI with cache stats
        const data = result.data;
        if (data) {
          const hitRateElement = document.getElementById('cache-hit-rate');
          const totalSizeElement = document.getElementById('cache-total-size');
          const itemsCountElement = document.getElementById('cache-items-count');
          
          if (hitRateElement && data.hit_rate) {
            hitRateElement.textContent = `${data.hit_rate.toFixed(1)}%`;
          }
          if (totalSizeElement && data.total_size) {
            totalSizeElement.textContent = SMUIComponents.formatBytes(data.total_size);
          }
          if (itemsCountElement && data.total_items) {
            itemsCountElement.textContent = data.total_items;
          }
        }
        
      } else {
        throw new Error(result.message || 'Failed to get cache stats');
      }
      
    } catch (error) {
      console.error('❌ Failed to view cache stats:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בטעינת סטטיסטיקות מטמון: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Check cache health (static method for global access)
   * בדיקת בריאות מטמון (מתודה סטטית לגישה גלובלית)
   */
  static async checkCacheHealth() {
    try {
      console.log('🔍 Checking cache health...');
      
      const response = await fetch('/api/cache/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification('בריאות מטמון נבדקה', 'success');
        }
        
        // Update UI with cache health
        const data = result.data;
        if (data) {
          const statusElement = document.getElementById('cache-status');
          if (statusElement && data.status) {
            statusElement.textContent = data.status;
          }
        }
        
      } else {
        throw new Error(result.message || 'Failed to check cache health');
      }
      
    } catch (error) {
      console.error('❌ Failed to check cache health:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בבדיקת בריאות מטמון: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Refresh cache info (static method for global access)
   * רענון מידע מטמון (מתודה סטטית לגישה גלובלית)
   */
  static async refreshCacheInfo() {
    await Promise.all([
      SMOperationsSection.viewCacheStats(),
      SMOperationsSection.checkCacheHealth()
    ]);
  }

  /**
   * Export cache data (static method for global access)
   * ייצוא נתוני מטמון (מתודה סטטית לגישה גלובלית)
   */
  static exportCacheData() {
    console.log('📤 Exporting cache data');
    if (window.showInfoNotification) {
      window.showInfoNotification('ייצוא נתוני מטמון', 'info');
    } else {
      alert('ייצוא נתוני מטמון');
    }
  }

  /**
   * Open server monitor (static method for global access)
   * פתיחת מעקב שרת (מתודה סטטית לגישה גלובלית)
   */
  static openServerMonitor() {
    console.log('🖥️ Opening server monitor');
    window.open('/server_monitor', '_blank');
  }

  /**
   * Open system logs (static method for global access)
   * פתיחת לוגי מערכת (מתודה סטטית לגישה גלובלית)
   */
  static openSystemLogs() {
    console.log('📋 Opening system logs');
    window.open('/system-logs', '_blank');
  }

  /**
   * Open external data dashboard (static method for global access)
   * פתיחת דשבורד נתונים חיצוניים (מתודה סטטית לגישה גלובלית)
   */
  static openExternalDataDashboard() {
    console.log('📊 Opening external data dashboard');
    window.open('/external_data_dashboard', '_blank');
  }

  /**
   * Open data logs (static method for global access)
   * פתיחת לוגי נתונים (מתודה סטטית לגישה גלובלית)
   */
  static openDataLogs() {
    console.log('📋 Opening data logs');
    window.open('/data-logs', '_blank');
  }

  /**
   * Open unified logs (static method for global access)
   * פתיחת לוגים מאוחדים (מתודה סטטית לגישה גלובלית)
   */
  static openUnifiedLogs() {
    console.log('📋 Opening unified logs');
    window.open('/unified-logs', '_blank');
  }

  /**
   * Open system info (static method for global access)
   * פתיחת מידע מערכת (מתודה סטטית לגישה גלובלית)
   */
  static openSystemInfo() {
    console.log('ℹ️ Opening system info');
    window.open('/system-info', '_blank');
  }
}

// Export for use in other modules
window.SMOperationsSection = SMOperationsSection;
