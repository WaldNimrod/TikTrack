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
      const response = await this.fetchWithTimeout(this.apiEndpoints.stats, {
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
      const response = await this.fetchWithTimeout(this.apiEndpoints.health, {
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
      const response = await this.fetchWithTimeout(this.apiEndpoints.info, {
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
  async render(data) {
    if (!data || (!data.stats && !data.health && !data.info)) {
      this.showEmptyState('אין נתוני מטמון זמינים');
      return;
    }

    try {
      const cacheHtml = await this.createCacheHTML(data);
      this.container.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(cacheHtml, 'text/html');
      doc.body.childNodes.forEach(node => {
        this.container.appendChild(node.cloneNode(true));
      });
      
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
  async createCacheHTML(data) {
    const { stats, health, info } = data;

    // Get cache layers card (async operation)
    const layersCard = await this.createCacheLayersCard(stats, health, info);

    return `
      <div class="cache-overview">
        <!-- Quick Link -->
        <div class="row mb-3">
          <div class="col-12">
            <div class="d-flex justify-content-end">
              <a href="/cache_management" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-external-link-alt me-1"></i> ניהול מטמון מלא
              </a>
            </div>
          </div>
        </div>

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
            ${layersCard}
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
      return SMUIComponents.createStatsCard(
        'סטטיסטיקות מטמון',
        [
          { label: 'נתונים', value: 'לא זמין', icon: 'fa-exclamation-triangle', color: 'warning' }
        ],
        { icon: 'fa-chart-bar' }
      );
    }

    const hitRate = stats.hit_rate || 0;
    const missRate = stats.miss_rate || 0;
    const totalRequests = stats.total_requests || 0;

    return SMUIComponents.createStatsCard(
      'סטטיסטיקות מטמון',
      [
        {
          label: 'Hit Rate',
          value: `${hitRate.toFixed(1)}%`,
          icon: 'fa-check-circle',
          color: this.getHitRateColor(hitRate) === '#28a745' ? 'success' : this.getHitRateColor(hitRate) === '#ffc107' ? 'warning' : 'danger'
        },
        {
          label: 'Miss Rate',
          value: `${missRate.toFixed(1)}%`,
          icon: 'fa-times-circle',
          color: 'warning'
        },
        {
          label: 'בקשות כולל',
          value: SMUIComponents.formatNumber(totalRequests),
          icon: 'fa-list'
        }
      ],
      { icon: 'fa-chart-bar' }
    );
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
      return SMUIComponents.createStatsCard(
        'ביצועים',
        [
          { label: 'נתונים', value: 'לא זמין', icon: 'fa-exclamation-triangle', color: 'warning' }
        ],
        { icon: 'fa-tachometer-alt' }
      );
    }

    const avgResponseTime = stats.average_response_time || 0;
    const totalSize = stats.total_size || 0;

    return SMUIComponents.createStatsCard(
      'ביצועים',
      [
        {
          label: 'זמן תגובה ממוצע',
          value: `${avgResponseTime.toFixed(2)}ms`,
          icon: 'fa-clock',
          color: 'primary'
        },
        {
          label: 'גודל כולל',
          value: SMUIComponents.formatBytes(totalSize),
          icon: 'fa-hdd',
          color: 'info'
        }
      ],
      { icon: 'fa-tachometer-alt' }
    );
  }

  /**
   * Create cache actions card
   * יצירת כרטיס פעולות מטמון
   */
  createCacheActionsCard() {
    return SMUIComponents.createActionsCard(
      'פעולות מטמון',
      [
        {
          title: 'פעולות ניקוי',
          actions: [
            {
              text: 'נקה קל',
              icon: 'fa-broom',
              variant: 'warning',
              onclick: 'SMCacheSection.clearCache("light")',
              title: 'נקה localStorage בלבד'
            },
            {
              text: 'נקה בינוני',
              icon: 'fa-trash-alt',
              variant: 'warning',
              onclick: 'SMCacheSection.clearCache("medium")',
              title: 'נקה localStorage + IndexedDB'
            },
            {
              text: 'נקה מלא',
              icon: 'fa-fire',
              variant: 'danger',
              onclick: 'SMCacheSection.clearCache("full")',
              title: 'נקה כל המטמון כולל Backend'
            },
            {
              text: 'נקה גרעיני',
              icon: 'fa-bomb',
              variant: 'dark',
              onclick: 'SMCacheSection.clearCache("nuclear")',
              title: 'נקה הכל + רענון דף'
            }
          ]
        }
      ],
      { icon: 'fa-cogs', direction: 'vertical' }
    );
  }

  /**
   * Create cache layers card
   * יצירת כרטיס שכבות מטמון
   */
  async createCacheLayersCard(stats, health, info) {
    const layers = await this.getCacheLayers(stats, health, info);

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
    return SMUIComponents.createActionsCard(
      'פעולות מטמון',
      [
        {
          title: 'פעולות ניקוי',
          actions: [
            {
              text: 'נקה קל (localStorage)',
              icon: 'fa-broom',
              variant: 'outline-warning',
              onclick: 'SMCacheSection.clearCache("light")',
              title: 'נקה localStorage בלבד'
            },
            {
              text: 'נקה בינוני (+ IndexedDB)',
              icon: 'fa-trash-alt',
              variant: 'outline-warning',
              onclick: 'SMCacheSection.clearCache("medium")',
              title: 'נקה localStorage + IndexedDB'
            },
            {
              text: 'נקה מלא (+ Backend)',
              icon: 'fa-fire',
              variant: 'outline-danger',
              onclick: 'SMCacheSection.clearCache("full")',
              title: 'נקה כל המטמון כולל Backend'
            },
            {
              text: 'נקה גרעיני (כל + reload)',
              icon: 'fa-bomb',
              variant: 'outline-dark',
              onclick: 'SMCacheSection.clearCache("nuclear")',
              title: 'נקה הכל + רענון דף'
            }
          ]
        },
        {
          title: 'פעולות מידע',
          actions: [
            {
              text: 'רענן סטטיסטיקות',
              icon: 'fa-sync-alt',
              variant: 'outline-info',
              onclick: 'SMCacheSection.refreshStats()',
              title: 'רענן את נתוני המטמון'
            },
            {
              text: 'ייצא נתונים',
              icon: 'fa-download',
              variant: 'outline-secondary',
              onclick: 'SMCacheSection.exportStats()',
              title: 'ייצא נתוני מטמון'
            },
            {
              text: 'פרטים נוספים',
              icon: 'fa-info-circle',
              variant: 'outline-primary',
              onclick: 'SMCacheSection.showCacheDetails()',
              title: 'הצג פרטים נוספים על המטמון'
            }
          ]
        }
      ],
      { icon: 'fa-tools' }
    );
  }

  /**
   * Get cache layers information
   * קבלת מידע שכבות מטמון
   */
  async getCacheLayers(stats, health, info) {
    // Get frontend cache data from UnifiedCacheManager if available
    let frontendCacheData = null;
    if (window.UnifiedCacheManager) {
      try {
        const unifiedStats = window.UnifiedCacheManager.getStats();
        const indexedDBStats = await this.getIndexedDBStats();
        
        frontendCacheData = {
          localStorage: this.getLocalStorageStats(),
          indexedDB: indexedDBStats,
          memory: this.getMemoryCacheStats(unifiedStats || stats)
        };
      } catch (error) {
        console.warn('⚠️ Failed to get frontend cache stats:', error);
      }
    }

    // Backend cache data from API
    const backendCacheData = stats || {};

    const layers = [
      {
        name: 'Memory',
        icon: 'fa-memory',
        status: 'פעיל',
        statusColor: 'success',
        size: frontendCacheData?.memory?.size || (backendCacheData.estimated_memory_mb ? `${backendCacheData.estimated_memory_mb.toFixed(2)} MB` : 'לא זמין'),
        items: frontendCacheData?.memory?.items || backendCacheData.total_entries || 0,
        hitRate: backendCacheData.hit_rate_percent || 0,
        usage: 0,
        progressBar: false
      },
      {
        name: 'localStorage',
        icon: 'fa-hdd',
        status: 'פעיל',
        statusColor: 'success',
        size: frontendCacheData?.localStorage?.size || 'לא זמין',
        items: frontendCacheData?.localStorage?.items || 0,
        hitRate: 0,
        usage: frontendCacheData?.localStorage?.usage || 0,
        progressBar: true
      },
      {
        name: 'IndexedDB',
        icon: 'fa-database',
        status: 'פעיל',
        statusColor: 'success',
        size: frontendCacheData?.indexedDB?.size || 'לא זמין',
        items: frontendCacheData?.indexedDB?.items || 0,
        hitRate: 0,
        usage: frontendCacheData?.indexedDB?.usage || 0,
        progressBar: true
      },
      {
        name: 'Backend',
        icon: 'fa-server',
        status: health?.status === 'healthy' ? 'פעיל' : 'בעיה',
        statusColor: health?.status === 'healthy' ? 'success' : 'warning',
        size: backendCacheData.estimated_memory_mb ? `${backendCacheData.estimated_memory_mb.toFixed(2)} MB` : 'לא זמין',
        items: backendCacheData.total_entries || 0,
        hitRate: backendCacheData.hit_rate_percent || 0,
        usage: 0,
        progressBar: false
      }
    ];

    return layers;
  }

  /**
   * Get localStorage statistics
   * קבלת סטטיסטיקות localStorage
   */
  getLocalStorageStats() {
    try {
      let totalSize = 0;
      let itemCount = 0;
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const item = localStorage.getItem(key);
          totalSize += item ? item.length : 0;
          itemCount++;
        }
      }
      
      // Calculate usage percentage (assuming 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const usage = Math.min(100, Math.round((totalSize / maxSize) * 100));
      
      return {
        size: SMUIComponents.formatBytes(totalSize),
        items: itemCount,
        usage: usage
      };
    } catch (error) {
      console.warn('⚠️ Failed to get localStorage stats:', error);
      return { size: 'לא זמין', items: 0, usage: 0 };
    }
  }

  /**
   * Get IndexedDB statistics
   * קבלת סטטיסטיקות IndexedDB
   */
  async getIndexedDBStats() {
    try {
      // Try to get IndexedDB size (this is approximate)
      if ('indexedDB' in window) {
        // For now, return placeholder - full implementation would require database inspection
        return { size: 'לא זמין', items: 0, usage: 0 };
      }
      return { size: 'לא זמין', items: 0, usage: 0 };
    } catch (error) {
      console.warn('⚠️ Failed to get IndexedDB stats:', error);
      return { size: 'לא זמין', items: 0, usage: 0 };
    }
  }

  /**
   * Get memory cache statistics
   * קבלת סטטיסטיקות מטמון זיכרון
   */
  getMemoryCacheStats(stats) {
    if (!stats) return { size: 'לא זמין', items: 0 };
    
    return {
      size: stats.estimated_memory_mb ? `${stats.estimated_memory_mb.toFixed(2)} MB` : 'לא זמין',
      items: stats.total_entries || 0
    };
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
        if (window.showInfoNotification) {
          window.showInfoNotification(`פרטי מטמון:\n${JSON.stringify(sectionInstance.lastData, null, 2)}`, 'info');
        } else {
          alert(`פרטי מטמון:\n${JSON.stringify(sectionInstance.lastData, null, 2)}`);
        }
      }
    }
  }
}

// Export for use in other modules
window.SMCacheSection = SMCacheSection;
