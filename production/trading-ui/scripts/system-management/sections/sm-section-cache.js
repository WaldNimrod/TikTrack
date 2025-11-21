/**
 * System Management Cache Section - TikTrack
 * ========================================
 * 
 * Cache section for advanced cache system management
 * Shows cache statistics, health, and management operations
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMCacheSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, config);
    this.apiEndpoints = {
      stats: '/api/cache/stats',
      health: '/api/cache/health',
      info: '/api/cache/info'
    };
  }

  /**
   * Load cache data from APIs
   * טעינת נתוני מטמון מה-APIs
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`🗄️ Loading cache data from multiple endpoints`);

      // Load data from multiple endpoints in parallel
      const [statsData, healthData, infoData] = await Promise.allSettled([
        this.fetchCacheStats(),
        this.fetchCacheHealth(),
        this.fetchCacheInfo()
      ]);

      // Combine data from all sources
      const combinedData = {
        stats: statsData.status === 'fulfilled' ? statsData.value : null,
        health: healthData.status === 'fulfilled' ? healthData.value : null,
        info: infoData.status === 'fulfilled' ? infoData.value : null,
        timestamp: new Date().toISOString()
      };

      this.lastData = combinedData;
      this.render(combinedData);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('❌ Failed to load cache data:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch cache statistics
   * קבלת סטטיסטיקות מטמון
   */
  async fetchCacheStats() {
    try {
      const response = await fetch(this.apiEndpoints.stats, {
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
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch cache stats:', error);
      return null;
    }
  }

  /**
   * Fetch cache health
   * קבלת בריאות מטמון
   */
  async fetchCacheHealth() {
    try {
      const response = await fetch(this.apiEndpoints.health, {
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
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch cache health:', error);
      return null;
    }
  }

  /**
   * Fetch cache info
   * קבלת מידע מטמון
   */
  async fetchCacheInfo() {
    try {
      const response = await fetch(this.apiEndpoints.info, {
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
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch cache info:', error);
      return null;
    }
  }

  /**
   * Render cache data
   * הצגת נתוני מטמון
   */
  render(data) {
    if (!data || (!data.stats && !data.health && !data.info)) {
      this.showEmptyState('אין נתוני מטמון זמינים');
      return;
    }

    try {
      const cacheHtml = this.createCacheHTML(data);
      this.container.innerHTML = cacheHtml;
      
      console.log('✅ Cache section rendered successfully');
      
    } catch (error) {
      console.error('❌ Failed to render cache section:', error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'render',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create cache HTML
   * יצירת HTML של מטמון
   */
  createCacheHTML(data) {
    const { stats, health, info } = data;

    return `
      <div class="cache-overview">
        <!-- Cache Overview Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            ${this.createCacheStatsCard(stats)}
          </div>
          <div class="col-md-3">
            ${this.createCacheHealthCard(health)}
          </div>
          <div class="col-md-3">
            ${this.createCachePerformanceCard(stats)}
          </div>
          <div class="col-md-3">
            ${this.createCacheActionsCard()}
          </div>
        </div>

        <!-- Cache Layers Status -->
        <div class="row mb-4">
          <div class="col-12">
            ${this.createCacheLayersCard(stats, health, info)}
          </div>
        </div>

        <!-- Cache Operations -->
        <div class="row">
          <div class="col-12">
            ${this.createCacheOperationsCard(stats)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create cache statistics card
   * יצירת כרטיס סטטיסטיקות מטמון
   */
  createCacheStatsCard(stats) {
    if (!stats) {
      return SMUIComponents.createStatusCard(
        'סטטיסטיקות מטמון',
        'לא זמין',
        'warning',
        'fa-chart-bar',
        'נתונים לא זמינים'
      );
    }

    const hitRate = stats.hit_rate || 0;
    const missRate = stats.miss_rate || 0;
    const totalRequests = stats.total_requests || 0;

    return `
      <div class="card cache-stats-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-chart-bar"></i> סטטיסטיקות</h5>
          
          <div class="cache-metric">
            <div class="metric-value" style="color: ${this.getHitRateColor(hitRate)}">
              ${hitRate.toFixed(1)}%
            </div>
            <div class="metric-label">Hit Rate</div>
          </div>
          
          <div class="cache-metric">
            <div class="metric-value text-warning">
              ${missRate.toFixed(1)}%
            </div>
            <div class="metric-label">Miss Rate</div>
          </div>
          
          <div class="cache-metric">
            <div class="metric-value text-info">
              ${SMUIComponents.formatNumber(totalRequests)}
            </div>
            <div class="metric-label">בקשות כולל</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create cache health card
   * יצירת כרטיס בריאות מטמון
   */
  createCacheHealthCard(health) {
    if (!health) {
      return SMUIComponents.createStatusCard(
        'בריאות מטמון',
        'לא זמין',
        'warning',
        'fa-heartbeat',
        'נתונים לא זמינים'
      );
    }

    const status = health.status || 'unknown';
    const statusColor = this.getHealthStatusColor(status);
    const statusText = this.getHealthStatusText(status);

    return SMUIComponents.createStatusCard(
      'בריאות מטמון',
      statusText,
      statusColor,
      'fa-heartbeat',
      health.message || 'מטמון פועל תקין'
    );
  }

  /**
   * Create cache performance card
   * יצירת כרטיס ביצועי מטמון
   */
  createCachePerformanceCard(stats) {
    if (!stats) {
      return SMUIComponents.createStatusCard(
        'ביצועים',
        'לא זמין',
        'warning',
        'fa-tachometer-alt',
        'נתונים לא זמינים'
      );
    }

    const avgResponseTime = stats.average_response_time || 0;
    const totalSize = stats.total_size || 0;

    return `
      <div class="card cache-performance-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-tachometer-alt"></i> ביצועים</h5>
          
          <div class="performance-metric">
            <div class="metric-value text-primary">
              ${avgResponseTime.toFixed(2)}ms
            </div>
            <div class="metric-label">זמן תגובה ממוצע</div>
          </div>
          
          <div class="performance-metric">
            <div class="metric-value text-info">
              ${SMUIComponents.formatBytes(totalSize)}
            </div>
            <div class="metric-label">גודל כולל</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create cache actions card
   * יצירת כרטיס פעולות מטמון
   */
  createCacheActionsCard() {
    return `
      <div class="card cache-actions-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-cogs"></i> פעולות</h5>
          
          <div class="cache-actions">
            <button class="btn btn-warning btn-sm mb-2 w-100" onclick="SMCacheSection.clearCache('light')">
              <i class="fas fa-broom"></i> נקה קל
            </button>
            
            <button class="btn btn-warning btn-sm mb-2 w-100" onclick="SMCacheSection.clearCache('medium')">
              <i class="fas fa-trash-alt"></i> נקה בינוני
            </button>
            
            <button class="btn btn-danger btn-sm mb-2 w-100" onclick="SMCacheSection.clearCache('full')">
              <i class="fas fa-fire"></i> נקה מלא
            </button>
            
            <button class="btn btn-dark btn-sm w-100" onclick="SMCacheSection.clearCache('nuclear')">
              <i class="fas fa-bomb"></i> נקה גרעיני
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create cache layers card
   * יצירת כרטיס שכבות מטמון
   */
  createCacheLayersCard(stats, health, info) {
    const layers = this.getCacheLayers(stats, health, info);

    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-layer-group"></i> שכבות מטמון</h5>
        </div>
        <div class="card-body">
          <div class="row">
            ${layers.map(layer => `
              <div class="col-md-3">
                <div class="cache-layer-card">
                  <div class="layer-header">
                    <i class="fas ${layer.icon}"></i>
                    <h6>${layer.name}</h6>
                  </div>
                  
                  <div class="layer-status">
                    <span class="badge bg-${layer.statusColor}">
                      ${layer.status}
                    </span>
                  </div>
                  
                  <div class="layer-metrics">
                    <div class="metric">
                      <span class="metric-label">גודל:</span>
                      <span class="metric-value">${layer.size}</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">פריטים:</span>
                      <span class="metric-value">${layer.items}</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">Hit Rate:</span>
                      <span class="metric-value">${layer.hitRate}%</span>
                    </div>
                  </div>
                  
                  ${layer.progressBar ? `
                    <div class="layer-progress">
                      ${SMUIComponents.createProgressBar(
                        layer.usage,
                        100,
                        'שימוש',
                        this.getProgressColor(layer.usage)
                      )}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create cache operations card
   * יצירת כרטיס פעולות מטמון
   */
  createCacheOperationsCard(stats) {
    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-tools"></i> פעולות מטמון</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>פעולות ניקוי</h6>
              <div class="operation-buttons">
                <button class="btn btn-outline-warning btn-sm me-2 mb-2" onclick="SMCacheSection.clearCache('light')">
                  <i class="fas fa-broom"></i> נקה קל (localStorage)
                </button>
                <button class="btn btn-outline-warning btn-sm me-2 mb-2" onclick="SMCacheSection.clearCache('medium')">
                  <i class="fas fa-trash-alt"></i> נקה בינוני (+ IndexedDB)
                </button>
                <button class="btn btn-outline-danger btn-sm me-2 mb-2" onclick="SMCacheSection.clearCache('full')">
                  <i class="fas fa-fire"></i> נקה מלא (+ Backend)
                </button>
                <button class="btn btn-outline-dark btn-sm mb-2" onclick="SMCacheSection.clearCache('nuclear')">
                  <i class="fas fa-bomb"></i> נקה גרעיני (כל + reload)
                </button>
              </div>
            </div>
            <div class="col-md-6">
              <h6>פעולות מידע</h6>
              <div class="operation-buttons">
                <button class="btn btn-outline-info btn-sm me-2 mb-2" onclick="SMCacheSection.refreshStats()">
                  <i class="fas fa-sync-alt"></i> רענן סטטיסטיקות
                </button>
                <button class="btn btn-outline-secondary btn-sm me-2 mb-2" onclick="SMCacheSection.exportStats()">
                  <i class="fas fa-download"></i> ייצא נתונים
                </button>
                <button class="btn btn-outline-primary btn-sm mb-2" onclick="SMCacheSection.showCacheDetails()">
                  <i class="fas fa-info-circle"></i> פרטים נוספים
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get cache layers information
   * קבלת מידע שכבות מטמון
   */
  getCacheLayers(stats, health, info) {
    const layers = [
      {
        name: 'Memory',
        icon: 'fa-memory',
        status: 'פעיל',
        statusColor: 'success',
        size: 'לא זמין',
        items: 'לא זמין',
        hitRate: 0,
        usage: 0,
        progressBar: false
      },
      {
        name: 'localStorage',
        icon: 'fa-hdd',
        status: 'פעיל',
        statusColor: 'success',
        size: 'לא זמין',
        items: 'לא זמין',
        hitRate: 0,
        usage: 0,
        progressBar: true
      },
      {
        name: 'IndexedDB',
        icon: 'fa-database',
        status: 'פעיל',
        statusColor: 'success',
        size: 'לא זמין',
        items: 'לא זמין',
        hitRate: 0,
        usage: 0,
        progressBar: true
      },
      {
        name: 'Backend',
        icon: 'fa-server',
        status: 'פעיל',
        statusColor: 'success',
        size: 'לא זמין',
        items: 'לא זמין',
        hitRate: 0,
        usage: 0,
        progressBar: false
      }
    ];

    // Update with actual data if available
    if (stats && stats.layers) {
      stats.layers.forEach((layerData, index) => {
        if (layers[index]) {
          layers[index].size = layerData.size ? SMUIComponents.formatBytes(layerData.size) : 'לא זמין';
          layers[index].items = layerData.items || 0;
          layers[index].hitRate = layerData.hit_rate || 0;
          layers[index].usage = layerData.usage_percent || 0;
          layers[index].status = layerData.status === 'healthy' ? 'פעיל' : 'בעיה';
          layers[index].statusColor = layerData.status === 'healthy' ? 'success' : 'warning';
        }
      });
    }

    return layers;
  }

  /**
   * Get hit rate color
   * קבלת צבע hit rate
   */
  getHitRateColor(hitRate) {
    const semanticColors = window.SMUIColorUtils || null;
    if (hitRate >= 80) {
      return semanticColors?.get('success', '#28a745') || '#28a745';
    }
    if (hitRate >= 60) {
      return semanticColors?.get('warning', '#ffc107') || '#ffc107';
    }
    if (hitRate >= 40) {
      return semanticColors?.getCSSVariableValue?.('--entity-cash_flow-color', '#fd7e14') || '#fd7e14';
    }
    return semanticColors?.get('danger', '#dc3545') || '#dc3545';
  }

  /**
   * Get health status color
   * קבלת צבע סטטוס בריאות
   */
  getHealthStatusColor(status) {
    const colors = {
      'healthy': 'success',
      'warning': 'warning',
      'error': 'danger',
      'unknown': 'secondary'
    };
    return colors[status] || 'secondary';
  }

  /**
   * Get health status text
   * קבלת טקסט סטטוס בריאות
   */
  getHealthStatusText(status) {
    const texts = {
      'healthy': 'בריא',
      'warning': 'אזהרה',
      'error': 'שגיאה',
      'unknown': 'לא ידוע'
    };
    return texts[status] || 'לא ידוע';
  }

  /**
   * Get progress bar color
   * קבלת צבע פס התקדמות
   */
  getProgressColor(percent) {
    if (window.SMUIComponents && typeof window.SMUIComponents.getProgressColor === 'function') {
      return window.SMUIComponents.getProgressColor(percent);
    }
    if (percent >= 90) return 'var(--color-danger, #dc3545)';
    if (percent >= 75) return 'var(--color-warning, #ffc107)';
    if (percent >= 50) return 'var(--color-info, #17a2b8)';
    return 'var(--color-success, #28a745)';
  }

  /**
   * Clear cache (static method for global access)
   * ניקוי מטמון (מתודה סטטית לגישה גלובלית)
   * Uses existing UnifiedCacheManager functions to avoid duplication
   */
  static async clearCache(level) {
    try {
      console.log(`🧹 Clearing cache level: ${level} via UnifiedCacheManager`);
      
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
      
      // Refresh cache section if it exists
      const cacheSection = document.getElementById('sm-cache');
      if (cacheSection) {
        const sectionInstance = window.systemManagementMain?.sections?.get('sm-cache');
        if (sectionInstance) {
          await sectionInstance.refresh();
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בניקוי מטמון: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Refresh cache stats (static method for global access)
   * רענון סטטיסטיקות מטמון (מתודה סטטית לגישה גלובלית)
   */
  static async refreshStats() {
    const cacheSection = document.getElementById('sm-cache');
    if (cacheSection) {
      const sectionInstance = window.systemManagementMain?.sections?.get('sm-cache');
      if (sectionInstance) {
        await sectionInstance.refresh();
      }
    }
  }

  /**
   * Export cache stats (static method for global access)
   * ייצוא סטטיסטיקות מטמון (מתודה סטטית לגישה גלובלית)
   */
  static exportStats() {
    const cacheSection = document.getElementById('sm-cache');
    if (cacheSection) {
      const sectionInstance = window.systemManagementMain?.sections?.get('sm-cache');
      if (sectionInstance && sectionInstance.lastData) {
        const dataStr = JSON.stringify(sectionInstance.lastData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cache-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  }

  /**
   * Show cache details (static method for global access)
   * הצגת פרטי מטמון (מתודה סטטית לגישה גלובלית)
   */
  static showCacheDetails() {
    const cacheSection = document.getElementById('sm-cache');
    if (cacheSection) {
      const sectionInstance = window.systemManagementMain?.sections?.get('sm-cache');
      if (sectionInstance && sectionInstance.lastData) {
        alert(`פרטי מטמון:\n${JSON.stringify(sectionInstance.lastData, null, 2)}`);
      }
    }
  }
}

// Export for use in other modules
window.SMCacheSection = SMCacheSection;
