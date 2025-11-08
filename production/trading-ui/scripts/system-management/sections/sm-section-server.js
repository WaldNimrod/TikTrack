/**
 * System Management Server Section - TikTrack
 * =========================================
 * 
 * Server section for server status and system information
 * Shows server status, resources, OS info, and process details
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMServerSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, config);
    this.apiEndpoints = {
      status: '/api/server/status',
      resources: '/api/system/resources',
      overview: '/api/system/overview'
    };
  }

  /**
   * Load server data from APIs
   * טעינת נתוני שרת מה-APIs
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`🖥️ Loading server data from multiple endpoints`);

      // Load data from multiple endpoints in parallel
      const [statusData, resourcesData, overviewData] = await Promise.allSettled([
        this.fetchServerStatus(),
        this.fetchSystemResources(),
        this.fetchSystemOverview()
      ]);

      // Combine data from all sources
      const combinedData = {
        status: statusData.status === 'fulfilled' ? statusData.value : null,
        resources: resourcesData.status === 'fulfilled' ? resourcesData.value : null,
        overview: overviewData.status === 'fulfilled' ? overviewData.value : null,
        timestamp: new Date().toISOString()
      };

      this.lastData = combinedData;
      this.render(combinedData);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('❌ Failed to load server data:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch server status
   * קבלת סטטוס שרת
   */
  async fetchServerStatus() {
    try {
      const response = await fetch(this.apiEndpoints.status, {
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
      console.warn('⚠️ Failed to fetch server status:', error);
      return null;
    }
  }

  /**
   * Fetch system resources
   * קבלת משאבי מערכת
   */
  async fetchSystemResources() {
    try {
      const response = await fetch(this.apiEndpoints.resources, {
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
      console.warn('⚠️ Failed to fetch system resources:', error);
      return null;
    }
  }

  /**
   * Fetch system overview
   * קבלת סקירת מערכת
   */
  async fetchSystemOverview() {
    try {
      const response = await fetch(this.apiEndpoints.overview, {
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
      console.warn('⚠️ Failed to fetch system overview:', error);
      return null;
    }
  }

  /**
   * Render server data
   * הצגת נתוני שרת
   */
  render(data) {
    if (!data || (!data.status && !data.resources && !data.overview)) {
      this.showEmptyState('אין נתוני שרת זמינים');
      return;
    }

    try {
      const serverHtml = this.createServerHTML(data);
      this.container.innerHTML = serverHtml;
      
      console.log('✅ Server section rendered successfully');
      
    } catch (error) {
      console.error('❌ Failed to render server section:', error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'render',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create server HTML
   * יצירת HTML של שרת
   */
  createServerHTML(data) {
    const { status, resources, overview } = data;

    return `
      <div class="server-overview">
        <!-- Server Status Card -->
        <div class="row mb-4">
          <div class="col-12">
            ${this.createServerStatusCard(status, overview)}
          </div>
        </div>

        <!-- System Resources -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-server"></i> משאבי מערכת</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    ${this.createResourceUsageCard(resources, overview)}
                  </div>
                  <div class="col-md-6">
                    ${this.createProcessInfoCard(status, overview)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Information -->
        <div class="row">
          <div class="col-12">
            ${this.createSystemInfoCard(status, resources, overview)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create server status card
   * יצירת כרטיס סטטוס שרת
   */
  createServerStatusCard(status, overview) {
    const serverStatus = this.getServerStatus(status, overview);
    const statusColor = this.getServerStatusColor(serverStatus);
    const uptime = this.getServerUptime(status, overview);

    return `
      <div class="card server-status-card">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="server-status-info">
                <h4 class="mb-2">
                  <i class="fas fa-server text-${statusColor}"></i>
                  סטטוס שרת TikTrack
                </h4>
                <div class="server-status-badges">
                  <span class="badge bg-${statusColor} fs-6 me-2">${serverStatus}</span>
                  <span class="badge bg-info fs-6">${uptime}</span>
                </div>
                <div class="server-details mt-2">
                  <small class="text-muted">
                    <i class="fas fa-clock"></i> 
                    עדכון אחרון: ${new Date().toLocaleString('he-IL')}
                  </small>
                </div>
              </div>
            </div>
            <div class="col-md-4 text-end">
              <div class="server-status-indicator">
                <div class="status-light status-${statusColor}">
                  <i class="fas fa-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create resource usage card
   * יצירת כרטיס שימוש משאבים
   */
  createResourceUsageCard(resources, overview) {
    const metrics = this.extractResourceMetrics(resources, overview);

    return `
      <div class="resource-usage-card">
        <h6><i class="fas fa-chart-pie"></i> שימוש במשאבים</h6>
        
        <div class="resource-item">
          <div class="resource-label">
            <i class="fas fa-microchip"></i>
            מעבד (CPU)
          </div>
          ${SMUIComponents.createProgressBar(
            metrics.cpu,
            100,
            `${metrics.cpu}%`,
            this.getProgressColor(metrics.cpu)
          )}
        </div>

        <div class="resource-item">
          <div class="resource-label">
            <i class="fas fa-memory"></i>
            זיכרון (RAM)
          </div>
          ${SMUIComponents.createProgressBar(
            metrics.memory,
            100,
            `${metrics.memory}%`,
            this.getProgressColor(metrics.memory)
          )}
        </div>

        <div class="resource-item">
          <div class="resource-label">
            <i class="fas fa-hdd"></i>
            דיסק
          </div>
          ${SMUIComponents.createProgressBar(
            metrics.disk,
            100,
            `${metrics.disk}%`,
            this.getProgressColor(metrics.disk)
          )}
        </div>
      </div>
    `;
  }

  /**
   * Create process info card
   * יצירת כרטיס מידע תהליכים
   */
  createProcessInfoCard(status, overview) {
    const processInfo = this.extractProcessInfo(status, overview);

    return `
      <div class="process-info-card">
        <h6><i class="fas fa-tasks"></i> מידע תהליכים</h6>
        
        <div class="process-stats">
          <div class="stat-item">
            <span class="stat-label">תהליכים פעילים:</span>
            <span class="stat-value">${processInfo.activeProcesses}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">חיבורים פעילים:</span>
            <span class="stat-value">${processInfo.activeConnections}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">זמן תגובה:</span>
            <span class="stat-value">${processInfo.responseTime}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">זמן טעינה:</span>
            <span class="stat-value">${processInfo.loadTime}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create system information card
   * יצירת כרטיס מידע מערכת
   */
  createSystemInfoCard(status, resources, overview) {
    const systemInfo = this.extractSystemInfo(status, resources, overview);

    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-info-circle"></i> מידע מערכת</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>מערכת הפעלה:</strong></td>
                    <td>${systemInfo.os}</td>
                  </tr>
                  <tr>
                    <td><strong>גרסת Python:</strong></td>
                    <td>${systemInfo.pythonVersion}</td>
                  </tr>
                  <tr>
                    <td><strong>גרסת Flask:</strong></td>
                    <td>${systemInfo.flaskVersion}</td>
                  </tr>
                  <tr>
                    <td><strong>ארכיטקטורה:</strong></td>
                    <td>${systemInfo.architecture}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-6">
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>זיכרון זמין:</strong></td>
                    <td>${systemInfo.totalMemory}</td>
                  </tr>
                  <tr>
                    <td><strong>שטח דיסק זמין:</strong></td>
                    <td>${systemInfo.totalDisk}</td>
                  </tr>
                  <tr>
                    <td><strong>מעבדים:</strong></td>
                    <td>${systemInfo.cpuCount}</td>
                  </tr>
                  <tr>
                    <td><strong>זמן הפעלה:</strong></td>
                    <td>${systemInfo.uptime}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get server status
   * קבלת סטטוס שרת
   */
  getServerStatus(status, overview) {
    if (status && status.status) {
      return status.status === 'running' ? 'פועל' : 'לא פועל';
    }
    
    if (overview && overview.overall_status) {
      return overview.overall_status === 'healthy' ? 'פועל' : 'בעיה';
    }
    
    return 'לא ידוע';
  }

  /**
   * Get server status color
   * קבלת צבע סטטוס שרת
   */
  getServerStatusColor(serverStatus) {
    if (serverStatus === 'פועל') return 'success';
    if (serverStatus === 'בעיה') return 'warning';
    if (serverStatus === 'לא פועל') return 'danger';
    return 'secondary';
  }

  /**
   * Get server uptime
   * קבלת זמן פעילות שרת
   */
  getServerUptime(status, overview) {
    if (overview && overview.summary && overview.summary.uptime) {
      return overview.summary.uptime;
    }
    
    if (status && status.uptime) {
      return status.uptime;
    }
    
    return 'לא ידוע';
  }

  /**
   * Extract resource metrics
   * חילוץ מדדי משאבים
   */
  extractResourceMetrics(resources, overview) {
    const metrics = {
      cpu: 0,
      memory: 0,
      disk: 0
    };

    // Try to get from overview first
    if (overview && overview.summary) {
      metrics.cpu = overview.summary.cpu_usage_percent || 0;
      metrics.memory = overview.summary.memory_usage_percent || 0;
      metrics.disk = overview.summary.disk_usage_percent || 0;
    }

    // Override with resources data if available
    if (resources) {
      if (resources.cpu_percent !== undefined) metrics.cpu = resources.cpu_percent;
      if (resources.memory_percent !== undefined) metrics.memory = resources.memory_percent;
      if (resources.disk_percent !== undefined) metrics.disk = resources.disk_percent;
    }

    return metrics;
  }

  /**
   * Extract process info
   * חילוץ מידע תהליכים
   */
  extractProcessInfo(status, overview) {
    return {
      activeProcesses: status?.process_count || overview?.summary?.active_processes || 0,
      activeConnections: overview?.summary?.active_connections || status?.active_connections || 0,
      responseTime: overview?.response_time_ms ? SMUIComponents.formatDuration(overview.response_time_ms) : 'לא ידוע',
      loadTime: status?.load_time ? SMUIComponents.formatDuration(status.load_time) : 'לא ידוע'
    };
  }

  /**
   * Extract system info
   * חילוץ מידע מערכת
   */
  extractSystemInfo(status, resources, overview) {
    return {
      os: status?.os_info || resources?.os_name || 'לא ידוע',
      pythonVersion: status?.python_version || resources?.python_version || 'לא ידוע',
      flaskVersion: status?.flask_version || resources?.flask_version || 'לא ידוע',
      architecture: resources?.architecture || 'לא ידוע',
      totalMemory: resources?.total_memory ? SMUIComponents.formatBytes(resources.total_memory) : 'לא ידוע',
      totalDisk: resources?.total_disk ? SMUIComponents.formatBytes(resources.total_disk) : 'לא ידוע',
      cpuCount: resources?.cpu_count || status?.cpu_count || 'לא ידוע',
      uptime: overview?.summary?.uptime || status?.uptime || 'לא ידוע'
    };
  }

  /**
   * Get progress bar color
   * קבלת צבע פס התקדמות
   */
  getProgressColor(percent) {
    if (percent >= 90) return '#dc3545'; // Red
    if (percent >= 75) return '#ffc107'; // Yellow
    if (percent >= 50) return '#17a2b8'; // Blue
    return '#28a745'; // Green
  }
}

// Export for use in other modules
window.SMServerSection = SMServerSection;
