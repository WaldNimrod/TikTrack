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
   * Create dashboard HTML with small cards organized by topic
   * יצירת HTML של dashboard עם כרטיסים קטנים מסודרים לפי נושאים
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
        <!-- Dashboard Cards by Topic - Organized in small cards -->
        <div class="row g-3 mb-3">
          <!-- בריאות מערכת -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🏥 בריאות</div>
                <div class="mb-2">
                  <span class="badge bg-${this.getStatusBadgeColor(overall_status)} fs-6">
                    ${this.getStatusText(overall_status)}
                  </span>
                </div>
                <div class="small text-muted">${this.getPerformanceText(overall_performance)}</div>
              </div>
            </div>
          </div>
          
          <!-- ציון מערכת -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">📊 ציון</div>
                <div class="h4 mb-2" style="color: ${healthScoreColor}">${system_score}%</div>
                <div class="small text-muted">בריאות מערכת</div>
              </div>
            </div>
          </div>
          
          <!-- זמן תגובה -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">⏱️ תגובה</div>
                <div class="h4 mb-2 text-success">${formattedResponseTime}</div>
                <div class="small text-muted">זמן תגובה ממוצע</div>
              </div>
            </div>
          </div>
          
          <!-- זמן פעילות -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🔄 פעילות</div>
                <div class="h4 mb-2 text-primary">${formattedUptime}</div>
                <div class="small text-muted">זמן פעילות שרת</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- משאבי מערכת -->
        <div class="row g-3 mb-3">
          <!-- זיכרון -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">💾 זיכרון</div>
                <div class="h4 mb-2 text-secondary">${this.formatMemoryUsage(summary.memory_usage_percent || 0)}%</div>
                <div class="small text-muted">שימוש בזיכרון</div>
              </div>
            </div>
          </div>
          
          <!-- CPU -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">⚡ מעבד</div>
                <div class="h4 mb-2 text-info">${this.formatCPUUsage(summary.cpu_usage_percent || 0)}%</div>
                <div class="small text-muted">עומס מעבד</div>
              </div>
            </div>
          </div>
          
          <!-- מטמון -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🗄️ מטמון</div>
                <div class="h4 mb-2 text-primary">${health.cache?.status === 'healthy' ? 'פעיל' : 'בעיה'}</div>
                <div class="small text-muted">סטטוס מטמון</div>
              </div>
            </div>
          </div>
          
          <!-- דיסק -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">💿 דיסק</div>
                <div class="h4 mb-2 text-warning">${summary.disk_usage_percent || 0}%</div>
                <div class="small text-muted">שימוש בדיסק</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- סביבה ושרת -->
        ${data.environment ? `
        <div class="row g-3 mb-3">
          <!-- סביבה -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🌐 סביבה</div>
                <div class="h4 mb-2 text-${data.environment.environment === 'production' ? 'danger' : 'info'}">
                  ${data.environment.environment === 'production' ? 'ייצור' : 'פיתוח'}
                </div>
                <div class="small text-muted">סביבת עבודה</div>
              </div>
            </div>
          </div>
          
          <!-- פורט -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🔌 פורט</div>
                <div class="h4 mb-2">${data.environment.port || 'N/A'}</div>
                <div class="small text-muted">פורט שרת</div>
              </div>
            </div>
          </div>
          
          <!-- בסיס נתונים -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🗃️ בסיס נתונים</div>
                <div class="h6 mb-2">${data.environment.database?.name || 'N/A'}</div>
                <div class="small text-muted">${data.environment.database?.type || 'PostgreSQL'}</div>
              </div>
            </div>
          </div>
          
          <!-- גרסה -->
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">📋 גרסה</div>
                <div class="h4 mb-2 text-secondary">2.0.5</div>
                <div class="small text-muted">גרסת מערכת</div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- סטטוס רכיבי מערכת -->
        <div class="row g-3 mb-3">
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🖥️ שרת</div>
                <div class="mb-2">
                  <span class="badge bg-${this.getComponentStatusColor(health.server)}">
                    ${this.getComponentStatus(health.server)}
                  </span>
                </div>
                <div class="small text-muted">Backend API</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🗄️ בסיס נתונים</div>
                <div class="mb-2">
                  <span class="badge bg-${this.getComponentStatusColor(health.database)}">
                    ${this.getComponentStatus(health.database)}
                  </span>
                </div>
                <div class="small text-muted">${data.environment?.database?.type || 'PostgreSQL'}</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🗄️ מטמון</div>
                <div class="mb-2">
                  <span class="badge bg-${this.getComponentStatusColor(health.cache)}">
                    ${this.getComponentStatus(health.cache)}
                  </span>
                </div>
                <div class="small text-muted">Multi-layer Cache</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 col-sm-6">
            <div class="card h-100">
              <div class="card-body text-center">
                <div class="h5 mb-2">🌐 נתונים חיצוניים</div>
                <div class="mb-2">
                  <span class="badge bg-${this.getComponentStatusColor(health.external_data)}">
                    ${this.getComponentStatus(health.external_data)}
                  </span>
                </div>
                <div class="small text-muted">Yahoo Finance API</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- קישורים מהירים -->
        <div class="row">
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
