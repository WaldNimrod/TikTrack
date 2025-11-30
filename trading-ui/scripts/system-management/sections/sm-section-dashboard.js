/**
 * System Management Dashboard Section - TikTrack
 * ============================================
 * 
 * Dashboard section for system overview and KPIs
 * Shows health score, uptime, response time, and key metrics
 * Now integrated into top section with small cards organized by topic
 * 
 * @version 1.1.0
 * @lastUpdated January 30, 2025
 * @author TikTrack Development Team
 */

class SMDashboardSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, config);
    this.apiEndpoint = '/api/system/overview';
    // Dashboard is now part of top section, so we use a different container
    this.dashboardContainerId = 'sm-dashboard-content';
  }
  
  /**
   * Initialize the section
   * אתחול הסקשן
   */
  async init() {
    if (this.isInitialized) {
      console.warn(`⚠️ Section ${this.sectionId} already initialized`);
      return;
    }

    try {
      console.log(`🚀 Initializing section: ${this.sectionId}`);
      
      // Dashboard is now part of top section, so find the dashboard content container
      this.container = document.getElementById(this.dashboardContainerId);
      if (!this.container) {
        // Fallback: try to find in top section
        const topSection = document.querySelector('.top-section[data-section="top"]');
        if (topSection) {
          const sectionBody = topSection.querySelector('.section-body');
          if (sectionBody) {
            // Create dashboard container if it doesn't exist
            const dashboardDiv = document.createElement('div');
            dashboardDiv.id = this.dashboardContainerId;
            sectionBody.appendChild(dashboardDiv);
            this.container = dashboardDiv;
          }
        }
      }
      
      if (!this.container) {
        throw new Error(`Dashboard container ${this.dashboardContainerId} not found`);
      }

      // Show loading state
      if (this.config.showLoadingState) {
        this.showLoadingState();
      }

      // Load initial data
      await this.loadData();

      // Setup auto-refresh
      this.setupAutoRefresh();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log(`✅ Section ${this.sectionId} initialized successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to initialize section ${this.sectionId}:`, error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'init',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Load dashboard data from API
   * טעינת נתוני dashboard מה-API
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`📊 Loading dashboard data from ${this.apiEndpoint}`);

      // Load both overview and environment data in parallel
      const [overviewResponse, envResponse] = await Promise.allSettled([
        this.fetchWithTimeout(this.apiEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        this.fetchWithTimeout('/api/system/environment', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      ]);

      // Process overview data
      let overviewData = null;
      if (overviewResponse.status === 'fulfilled' && overviewResponse.value.ok) {
        const result = await overviewResponse.value.json();
        if (result.status === 'success') {
          overviewData = result.data;
        }
      }

      // Process environment data
      let envData = null;
      if (envResponse.status === 'fulfilled' && envResponse.value.ok) {
        const result = await envResponse.value.json();
        if (result.status === 'success') {
          envData = result.data;
        }
      }

      // Validate and normalize data
      let validatedOverview = null;
      if (overviewData) {
        const validation = window.SMDataValidators?.validateSystemOverview(overviewData);
        if (validation && validation.valid) {
          validatedOverview = validation.data;
        } else {
          console.warn('⚠️ System overview validation failed:', validation?.error);
          validatedOverview = overviewData; // Use original data if validation fails
        }
      }

      let validatedEnv = null;
      if (envData) {
        const validation = window.SMDataValidators?.validateEnvironmentData(envData);
        if (validation && validation.valid) {
          validatedEnv = validation.data;
        } else {
          console.warn('⚠️ Environment data validation failed:', validation?.error);
          validatedEnv = envData; // Use original data if validation fails
        }
      }

      // Merge data
      const mergedData = {
        ...validatedOverview,
        environment: validatedEnv
      };

      if (!mergedData || (!validatedOverview && !validatedEnv)) {
        throw new Error('Failed to load system data');
      }

      this.lastData = mergedData;
      this.render(mergedData);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render dashboard data
   * הצגת נתוני dashboard
   */
  render(data) {
    if (!data) {
      this.showEmptyState('אין נתונים להצגה');
      return;
    }

    try {
      const dashboardHtml = this.createDashboardHTML(data);
      this.container.innerHTML = dashboardHtml;
      
      console.log('✅ Dashboard rendered successfully');
      
    } catch (error) {
      console.error('❌ Failed to render dashboard:', error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'render',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create dashboard HTML with standardized stats cards
   * יצירת HTML של dashboard עם כרטיסי סטטיסטיקות סטנדרטיים
   */
  createDashboardHTML(data) {
    const {
      overall_status = 'unknown',
      overall_performance = 'unknown',
      system_score = 0,
      response_time_ms = 0,
      uptime = 'unknown',
      summary = {},
      health = {},
      metrics = {},
      environment = null
    } = data;

    // Format values
    const formattedUptime = this.formatUptime(uptime);
    const formattedResponseTime = SMUIComponents.formatDuration(response_time_ms);
    const healthScoreColor = system_score >= 90 ? 'success' : system_score >= 75 ? 'warning' : system_score >= 50 ? 'info' : 'danger';

    return `
      <div class="dashboard-overview">
        <div class="row g-3">
          <!-- בריאות מערכת -->
          <div class="col-md-6 col-lg-4">
            ${SMUIComponents.createStatsCard(
              'בריאות מערכת',
              [
                {
                  label: 'סטטוס כללי',
                  value: this.getStatusText(overall_status),
                  icon: 'fa-heartbeat',
                  badge: { text: this.getStatusText(overall_status), variant: this.getStatusBadgeColor(overall_status) }
                },
                {
                  label: 'ביצועים',
                  value: this.getPerformanceText(overall_performance),
                  icon: 'fa-tachometer-alt'
                },
                {
                  label: 'ציון בריאות',
                  value: `${system_score}%`,
                  icon: 'fa-chart-line',
                  color: healthScoreColor
                }
              ],
              { icon: 'fa-heartbeat' }
            )}
          </div>

          <!-- ביצועים וזמנים -->
          <div class="col-md-6 col-lg-4">
            ${SMUIComponents.createStatsCard(
              'ביצועים וזמנים',
              [
                {
                  label: 'זמן תגובה ממוצע',
                  value: formattedResponseTime,
                  icon: 'fa-clock',
                  color: 'success'
                },
                {
                  label: 'זמן פעילות שרת',
                  value: formattedUptime,
                  icon: 'fa-history',
                  color: 'primary'
                },
                {
                  label: 'זמן פעילות מערכת',
                  value: this.formatUptime(metrics.uptime || uptime),
                  icon: 'fa-calendar-alt'
                }
              ],
              { icon: 'fa-tachometer-alt' }
            )}
          </div>

          <!-- משאבי מערכת -->
          <div class="col-md-6 col-lg-4">
            ${SMUIComponents.createStatsCard(
              'משאבי מערכת',
              [
                {
                  label: 'שימוש בזיכרון',
                  value: `${this.formatMemoryUsage(summary.memory_usage_percent || 0)}%`,
                  icon: 'fa-memory',
                  color: summary.memory_usage_percent > 80 ? 'danger' : summary.memory_usage_percent > 60 ? 'warning' : 'info'
                },
                {
                  label: 'עומס מעבד',
                  value: `${this.formatCPUUsage(summary.cpu_usage_percent || 0)}%`,
                  icon: 'fa-microchip',
                  color: summary.cpu_usage_percent > 80 ? 'danger' : summary.cpu_usage_percent > 60 ? 'warning' : 'info'
                },
                {
                  label: 'שימוש בדיסק',
                  value: `${summary.disk_usage_percent || 0}%`,
                  icon: 'fa-hdd',
                  color: summary.disk_usage_percent > 80 ? 'danger' : summary.disk_usage_percent > 60 ? 'warning' : 'warning'
                }
              ],
              { icon: 'fa-server' }
            )}
          </div>

          <!-- סביבה ומידע -->
          ${environment ? `
          <div class="col-md-6 col-lg-4">
            ${SMUIComponents.createStatsCard(
              'סביבה ומידע',
              [
                {
                  label: 'סביבת עבודה',
                  value: environment.environment === 'production' ? 'ייצור' : 'פיתוח',
                  icon: 'fa-globe',
                  badge: { text: environment.environment === 'production' ? 'ייצור' : 'פיתוח', variant: environment.environment === 'production' ? 'danger' : 'info' }
                },
                {
                  label: 'פורט שרת',
                  value: environment.port || 'N/A',
                  icon: 'fa-plug'
                },
                {
                  label: 'בסיס נתונים',
                  value: environment.database?.name || 'N/A',
                  icon: 'fa-database'
                },
                {
                  label: 'סוג בסיס נתונים',
                  value: environment.database?.type || 'PostgreSQL',
                  icon: 'fa-database'
                },
                {
                  label: 'גרסת מערכת',
                  value: '2.0.5',
                  icon: 'fa-code-branch'
                }
              ],
              { icon: 'fa-info-circle' }
            )}
          </div>
          ` : ''}

          <!-- סטטוס רכיבי מערכת -->
          <div class="col-md-6 col-lg-4">
            ${SMUIComponents.createStatsCard(
              'סטטוס רכיבי מערכת',
              [
                {
                  label: 'שרת',
                  value: this.getComponentStatus(health.server),
                  icon: 'fa-server',
                  badge: { text: this.getComponentStatus(health.server), variant: this.getComponentStatusColor(health.server) }
                },
                {
                  label: 'בסיס נתונים',
                  value: this.getComponentStatus(health.database),
                  icon: 'fa-database',
                  badge: { text: this.getComponentStatus(health.database), variant: this.getComponentStatusColor(health.database) }
                },
                {
                  label: 'מטמון',
                  value: this.getComponentStatus(health.cache),
                  icon: 'fa-layer-group',
                  badge: { text: this.getComponentStatus(health.cache), variant: this.getComponentStatusColor(health.cache) }
                },
                {
                  label: 'נתונים חיצוניים',
                  value: this.getComponentStatus(health.external_data),
                  icon: 'fa-globe',
                  badge: { text: this.getComponentStatus(health.external_data), variant: this.getComponentStatusColor(health.external_data) }
                }
              ],
              { icon: 'fa-cogs' }
            )}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get health score color
   * קבלת צבע ציון בריאות
   */
  getHealthScoreColor(score) {
    const palette = window.SMUIColorUtils || null;
    if (score >= 90) {
      return palette?.get('success', '#28a745') || '#28a745';
    }
    if (score >= 75) {
      return palette?.get('warning', '#ffc107') || '#ffc107';
    }
    if (score >= 50) {
      return palette?.getCSSVariableValue?.('--entity-cash_flow-color', '#fd7e14') || '#fd7e14';
    }
    return palette?.get('danger', '#dc3545') || '#dc3545';
  }

  /**
   * Get status badge color
   * קבלת צבע תג סטטוס
   */
  getStatusBadgeColor(status) {
    const colors = {
      'healthy': 'success',
      'warning': 'warning',
      'error': 'danger',
      'unknown': 'secondary'
    };
    return colors[status] || 'secondary';
  }

  /**
   * Get performance badge color
   * קבלת צבע תג ביצועים
   */
  getPerformanceBadgeColor(performance) {
    const colors = {
      'excellent': 'success',
      'good': 'info',
      'fair': 'warning',
      'poor': 'danger',
      'unknown': 'secondary'
    };
    return colors[performance] || 'secondary';
  }

  /**
   * Get status text in Hebrew
   * קבלת טקסט סטטוס בעברית
   */
  getStatusText(status) {
    const texts = {
      'healthy': 'בריא',
      'warning': 'אזהרה',
      'error': 'שגיאה',
      'unknown': 'לא ידוע'
    };
    return texts[status] || 'לא ידוע';
  }

  /**
   * Get performance text in Hebrew
   * קבלת טקסט ביצועים בעברית
   */
  getPerformanceText(performance) {
    const texts = {
      'excellent': 'מעולה',
      'good': 'טוב',
      'fair': 'בינוני',
      'poor': 'גרוע',
      'unknown': 'לא ידוע'
    };
    return texts[performance] || 'לא ידוע';
  }

  /**
   * Get component status
   * קבלת סטטוס רכיב
   */
  getComponentStatus(component) {
    if (!component) return 'לא ידוע';
    
    if (component.status === 'healthy' || component.status === 'success') return 'פעיל';
    if (component.status === 'warning') return 'אזהרה';
    if (component.status === 'error' || component.status === 'failed') return 'שגיאה';
    
    return 'לא ידוע';
  }

  /**
   * Get component status color
   * קבלת צבע סטטוס רכיב
   */
  getComponentStatusColor(component) {
    if (!component) return 'secondary';
    
    if (component.status === 'healthy' || component.status === 'success') return 'success';
    if (component.status === 'warning') return 'warning';
    if (component.status === 'error' || component.status === 'failed') return 'danger';
    
    return 'secondary';
  }

  /**
   * Format uptime
   * עיצוב זמן פעילות
   */
  formatUptime(uptime) {
    if (!uptime || uptime === 'unknown') return 'לא ידוע';
    
    // If it's already formatted, return as is
    if (typeof uptime === 'string' && uptime.includes(':')) {
      return uptime;
    }
    
    // If it's a number (seconds), format it
    if (typeof uptime === 'number') {
      return SMUIComponents.formatDuration(uptime * 1000);
    }
    
    return uptime;
  }

  /**
   * Format memory usage
   * עיצוב שימוש זיכרון
   */
  formatMemoryUsage(percent) {
    return Math.round(percent || 0);
  }

  /**
   * Format CPU usage
   * עיצוב שימוש CPU
   */
  formatCPUUsage(percent) {
    return Math.round(percent || 0);
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
}

// Export for use in other modules
window.SMDashboardSection = SMDashboardSection;
