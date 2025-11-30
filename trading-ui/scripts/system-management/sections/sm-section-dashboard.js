/**
 * System Management Dashboard Section - TikTrack
 * ============================================
 * 
 * Dashboard section for system overview and KPIs
 * Shows health score, uptime, response time, and key metrics
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
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
   * Load dashboard data from API
   * טעינת נתוני dashboard מה-API
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`📊 Loading dashboard data from ${this.apiEndpoint}`);

      // Load both overview and environment data in parallel
      const [overviewResponse, envResponse] = await Promise.allSettled([
        fetch(this.apiEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        fetch('/api/system/environment', {
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
   * Create dashboard HTML
   * יצירת HTML של dashboard
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
      metrics = {}
    } = data;

    // Calculate health score color
    const healthScoreColor = this.getHealthScoreColor(system_score);
    
    // Format uptime
    const formattedUptime = this.formatUptime(uptime);
    
    // Format response time
    const formattedResponseTime = SMUIComponents.formatDuration(response_time_ms);

    return `
      <div class="dashboard-overview">
        <!-- Health Score Card -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card health-score-card">
              <div class="card-body text-center">
                <div class="health-score-circle" style="border-color: ${healthScoreColor}">
                  <div class="health-score-value" style="color: ${healthScoreColor}">
                    ${system_score}%
                  </div>
                  <div class="health-score-label">בריאות מערכת</div>
                </div>
                <div class="health-status mt-3">
                  <span class="badge bg-${this.getStatusBadgeColor(overall_status)} fs-6">
                    ${this.getStatusText(overall_status)}
                  </span>
                  <span class="badge bg-${this.getPerformanceBadgeColor(overall_performance)} fs-6 ms-2">
                    ${this.getPerformanceText(overall_performance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Environment Info -->
        ${data.environment ? `
        <div class="row mb-4">
          <div class="col-md-4">
            ${SMUIComponents.createMetricCard(
              'סביבה',
              data.environment.environment === 'production' ? 'ייצור' : 'פיתוח',
              '',
              data.environment.environment === 'production' ? 'danger' : 'info',
              'fa-code-branch'
            )}
          </div>
          <div class="col-md-4">
            ${SMUIComponents.createMetricCard(
              'פורט שרת',
              data.environment.port || 'N/A',
              '',
              null,
              'fa-network-wired'
            )}
          </div>
          <div class="col-md-4">
            ${SMUIComponents.createMetricCard(
              'בסיס נתונים',
              data.environment.database?.name || 'N/A',
              '',
              null,
              'fa-database'
            )}
          </div>
        </div>
        ` : ''}

        <!-- Quick Links -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">קישורים מהירים</h6>
              </div>
              <div class="card-body">
                <div class="d-flex flex-wrap gap-2">
                  <a href="/cache-management" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-layer-group me-1"></i> ניהול מטמון מלא
                  </a>
                  <a href="/server-monitor" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-server me-1"></i> ניטור שרת מלא
                  </a>
                  <a href="/external-data-dashboard" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-globe me-1"></i> דשבורד נתונים חיצוניים
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Metrics Grid -->
        <div class="row mb-4">
          <div class="col-md-3">
            ${SMUIComponents.createMetricCard(
              'זמן פעילות',
              formattedUptime,
              '',
              null,
              'fa-clock'
            )}
          </div>
          <div class="col-md-3">
            ${SMUIComponents.createMetricCard(
              'זמן תגובה',
              formattedResponseTime,
              '',
              null,
              'fa-tachometer-alt'
            )}
          </div>
          <div class="col-md-3">
            ${SMUIComponents.createMetricCard(
              'זיכרון זמין',
              this.formatMemoryUsage(summary.memory_usage_percent || 0),
              '%',
              null,
              'fa-memory'
            )}
          </div>
          <div class="col-md-3">
            ${SMUIComponents.createMetricCard(
              'עומס CPU',
              this.formatCPUUsage(summary.cpu_usage_percent || 0),
              '%',
              null,
              'fa-microchip'
            )}
          </div>
        </div>

        <!-- System Components Status -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-cogs"></i> סטטוס רכיבי מערכת</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    ${SMUIComponents.createStatusCard(
                      'שרת',
                      this.getComponentStatus(health.server),
                      this.getComponentStatusColor(health.server),
                      'fa-server',
                      'Backend API'
                    )}
                  </div>
                  <div class="col-md-3">
                    ${SMUIComponents.createStatusCard(
                      'בסיס נתונים',
                      this.getComponentStatus(health.database),
                      this.getComponentStatusColor(health.database),
                      'fa-database',
                      data.environment?.database?.type || 'PostgreSQL'
                    )}
                  </div>
                  <div class="col-md-3">
                    ${SMUIComponents.createStatusCard(
                      'מטמון',
                      this.getComponentStatus(health.cache),
                      this.getComponentStatusColor(health.cache),
                      'fa-layer-group',
                      'Multi-layer Cache'
                    )}
                  </div>
                  <div class="col-md-3">
                    ${SMUIComponents.createStatusCard(
                      'נתונים חיצוניים',
                      this.getComponentStatus(health.external_data),
                      this.getComponentStatusColor(health.external_data),
                      'fa-globe',
                      'Yahoo Finance API'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Indicators -->
        ${this.createPerformanceIndicators(metrics)}
      </div>
    `;
  }

  /**
   * Create performance indicators
   * יצירת אינדיקטורי ביצועים
   */
  createPerformanceIndicators(metrics) {
    if (!metrics || !metrics.performance) {
      return '';
    }

    const { performance } = metrics;
    const { system = {} } = performance;

    return `
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5><i class="fas fa-chart-line"></i> מדדי ביצועים</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>זיכרון מערכת</h6>
                  ${SMUIComponents.createProgressBar(
                    system.memory_percent || 0,
                    100,
                    'זיכרון בשימוש',
                    this.getProgressColor(system.memory_percent || 0)
                  )}
                </div>
                <div class="col-md-6">
                  <h6>עומס CPU</h6>
                  ${SMUIComponents.createProgressBar(
                    system.cpu_percent || 0,
                    100,
                    'עומס מעבד',
                    this.getProgressColor(system.cpu_percent || 0)
                  )}
                </div>
              </div>
              <div class="row mt-3">
                <div class="col-md-6">
                  <h6>שימוש בדיסק</h6>
                  ${SMUIComponents.createProgressBar(
                    system.disk_percent || 0,
                    100,
                    'שטח דיסק',
                    this.getProgressColor(system.disk_percent || 0)
                  )}
                </div>
                <div class="col-md-6">
                  <h6>חיבורי רשת</h6>
                  <div class="network-stats">
                    <div class="stat-item">
                      <span class="stat-label">חיבורים פעילים:</span>
                      <span class="stat-value">${system.active_connections || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
