/**
 * System Management Performance Section - TikTrack
 * ============================================
 * 
 * Performance section for system performance monitoring
 * Shows CPU usage, memory trends, response time metrics, and database performance
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMPerformanceSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, config);
    this.apiEndpoints = {
      overview: '/api/system/overview',
      metrics: '/api/system/metrics',
      performance: '/api/system/performance'
    };
  }

  /**
   * Load performance data from APIs
   * טעינת נתוני ביצועים מה-APIs
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`⚡ Loading performance data from multiple endpoints`);

      // Load data from multiple endpoints in parallel
      const [overviewData, metricsData, performanceData] = await Promise.allSettled([
        this.fetchSystemOverview(),
        this.fetchSystemMetrics(),
        this.fetchSystemPerformance()
      ]);

      // Combine data from all sources
      const combinedData = {
        overview: overviewData.status === 'fulfilled' ? overviewData.value : null,
        metrics: metricsData.status === 'fulfilled' ? metricsData.value : null,
        performance: performanceData.status === 'fulfilled' ? performanceData.value : null,
        timestamp: new Date().toISOString()
      };

      this.lastData = combinedData;
      this.render(combinedData);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('❌ Failed to load performance data:', error);
      throw error;
    } finally {
      this.isLoading = false;
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
   * Fetch system metrics
   * קבלת מדדי מערכת
   */
  async fetchSystemMetrics() {
    try {
      const response = await fetch(this.apiEndpoints.metrics, {
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
      console.warn('⚠️ Failed to fetch system metrics:', error);
      return null;
    }
  }

  /**
   * Fetch system performance
   * קבלת ביצועי מערכת
   */
  async fetchSystemPerformance() {
    try {
      const response = await fetch(this.apiEndpoints.performance, {
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
      console.warn('⚠️ Failed to fetch system performance:', error);
      return null;
    }
  }

  /**
   * Render performance data
   * הצגת נתוני ביצועים
   */
  render(data) {
    if (!data || (!data.overview && !data.metrics && !data.performance)) {
      this.showEmptyState('אין נתוני ביצועים זמינים');
      return;
    }

    try {
      const performanceHtml = this.createPerformanceHTML(data);
      this.container.innerHTML = performanceHtml;
      
      console.log('✅ Performance section rendered successfully');
      
    } catch (error) {
      console.error('❌ Failed to render performance section:', error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'render',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create performance HTML
   * יצירת HTML של ביצועים
   */
  createPerformanceHTML(data) {
    const { overview, metrics, performance } = data;

    return `
      <div class="performance-overview">
        <!-- Performance Overview Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            ${this.createCPUUsageCard(overview, metrics, performance)}
          </div>
          <div class="col-md-3">
            ${this.createMemoryUsageCard(overview, metrics, performance)}
          </div>
          <div class="col-md-3">
            ${this.createResponseTimeCard(overview, metrics, performance)}
          </div>
          <div class="col-md-3">
            ${this.createDatabasePerformanceCard(overview, metrics, performance)}
          </div>
        </div>

        <!-- Performance Charts -->
        <div class="row mb-4">
          <div class="col-md-6">
            ${this.createCPUChartCard(overview, metrics, performance)}
          </div>
          <div class="col-md-6">
            ${this.createMemoryChartCard(overview, metrics, performance)}
          </div>
        </div>

        <!-- Performance Details -->
        <div class="row">
          <div class="col-12">
            ${this.createPerformanceDetailsCard(overview, metrics, performance)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create CPU usage card
   * יצירת כרטיס שימוש CPU
   */
  createCPUUsageCard(overview, metrics, performance) {
    const cpuUsage = this.getCPUUsage(overview, metrics, performance);
    const cpuTrend = this.getCPUTrend(overview, metrics, performance);

    return `
      <div class="card cpu-usage-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-microchip"></i> שימוש CPU</h5>
          
          <div class="cpu-metric">
            <div class="metric-value text-${this.getCPUUsageColor(cpuUsage)}">
              ${cpuUsage.toFixed(1)}%
            </div>
            <div class="metric-label">עומס מעבד</div>
          </div>
          
          <div class="cpu-progress">
            ${SMUIComponents.createProgressBar(
              cpuUsage,
              100,
              '',
              this.getCPUUsageColor(cpuUsage)
            )}
          </div>
          
          <div class="cpu-details">
            <div class="detail-item">
              <span class="detail-label">מגמה:</span>
              <span class="detail-value">${cpuTrend !== null ? (cpuTrend > 0 ? 'עולה' : cpuTrend < 0 ? 'יורדת' : 'יציבה') : 'לא ידוע'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ממוצע:</span>
              <span class="detail-value">${this.getCPUAverage(overview, metrics, performance).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create memory usage card
   * יצירת כרטיס שימוש זיכרון
   */
  createMemoryUsageCard(overview, metrics, performance) {
    const memoryUsage = this.getMemoryUsage(overview, metrics, performance);
    const memoryTrend = this.getMemoryTrend(overview, metrics, performance);

    return `
      <div class="card memory-usage-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-memory"></i> שימוש זיכרון</h5>
          
          <div class="memory-metric">
            <div class="metric-value text-${this.getMemoryUsageColor(memoryUsage)}">
              ${memoryUsage.toFixed(1)}%
            </div>
            <div class="metric-label">שימוש זיכרון</div>
          </div>
          
          <div class="memory-progress">
            ${SMUIComponents.createProgressBar(
              memoryUsage,
              100,
              '',
              this.getMemoryUsageColor(memoryUsage)
            )}
          </div>
          
          <div class="memory-details">
            <div class="detail-item">
              <span class="detail-label">זיכרון זמין:</span>
              <span class="detail-value">${this.getAvailableMemory(overview, metrics, performance)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">זיכרון כולל:</span>
              <span class="detail-value">${this.getTotalMemory(overview, metrics, performance)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create response time card
   * יצירת כרטיס זמן תגובה
   */
  createResponseTimeCard(overview, metrics, performance) {
    const responseTime = this.getResponseTime(overview, metrics, performance);
    const responseTrend = this.getResponseTrend(overview, metrics, performance);

    return `
      <div class="card response-time-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-tachometer-alt"></i> זמן תגובה</h5>
          
          <div class="response-metric">
            <div class="metric-value text-${this.getResponseTimeColor(responseTime)}">
              ${responseTime.toFixed(0)}ms
            </div>
            <div class="metric-label">זמן תגובה ממוצע</div>
          </div>
          
          <div class="response-details">
            <div class="detail-item">
              <span class="detail-label">מגמה:</span>
              <span class="detail-value">${responseTrend !== null ? (responseTrend > 0 ? 'עולה' : responseTrend < 0 ? 'יורדת' : 'יציבה') : 'לא ידוע'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">מינימום:</span>
              <span class="detail-value">${this.getMinResponseTime(overview, metrics, performance).toFixed(0)}ms</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">מקסימום:</span>
              <span class="detail-value">${this.getMaxResponseTime(overview, metrics, performance).toFixed(0)}ms</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create database performance card
   * יצירת כרטיס ביצועי בסיס נתונים
   */
  createDatabasePerformanceCard(overview, metrics, performance) {
    const dbPerformance = this.getDatabasePerformance(overview, metrics, performance);

    return `
      <div class="card database-performance-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-database"></i> ביצועי בסיס נתונים</h5>
          
          <div class="db-metric">
            <div class="metric-value text-${this.getDatabasePerformanceColor(dbPerformance)}">
              ${dbPerformance.toFixed(0)}ms
            </div>
            <div class="metric-label">זמן שאילתה ממוצע</div>
          </div>
          
          <div class="db-details">
            <div class="detail-item">
              <span class="detail-label">שאילתות/דקה:</span>
              <span class="detail-value">${this.getQueriesPerMinute(overview, metrics, performance)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">חיבורים פעילים:</span>
              <span class="detail-value">${this.getActiveConnections(overview, metrics, performance)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">גודל בסיס נתונים:</span>
              <span class="detail-value">${this.getDatabaseSize(overview, metrics, performance)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create CPU chart card
   * יצירת כרטיס גרף CPU
   */
  createCPUChartCard(overview, metrics, performance) {
    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-chart-line"></i> מגמת שימוש CPU</h5>
        </div>
        <div class="card-body">
          <div class="cpu-chart">
            <canvas id="cpu-chart" width="400" height="200"></canvas>
          </div>
          
          <div class="chart-details">
            <div class="detail-item">
              <span class="detail-label">עומס מקסימלי:</span>
              <span class="detail-value">${this.getMaxCPUUsage(overview, metrics, performance).toFixed(1)}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">עומס מינימלי:</span>
              <span class="detail-value">${this.getMinCPUUsage(overview, metrics, performance).toFixed(1)}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">עומס ממוצע:</span>
              <span class="detail-value">${this.getCPUAverage(overview, metrics, performance).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create memory chart card
   * יצירת כרטיס גרף זיכרון
   */
  createMemoryChartCard(overview, metrics, performance) {
    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-chart-area"></i> מגמת שימוש זיכרון</h5>
        </div>
        <div class="card-body">
          <div class="memory-chart">
            <canvas id="memory-chart" width="400" height="200"></canvas>
          </div>
          
          <div class="chart-details">
            <div class="detail-item">
              <span class="detail-label">שימוש מקסימלי:</span>
              <span class="detail-value">${this.getMaxMemoryUsage(overview, metrics, performance).toFixed(1)}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">שימוש מינימלי:</span>
              <span class="detail-value">${this.getMinMemoryUsage(overview, metrics, performance).toFixed(1)}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">שימוש ממוצע:</span>
              <span class="detail-value">${this.getMemoryAverage(overview, metrics, performance).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create performance details card
   * יצירת כרטיס פרטי ביצועים
   */
  createPerformanceDetailsCard(overview, metrics, performance) {
    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-info-circle"></i> פרטי ביצועים</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>מדדי מערכת</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>זמן פעילות:</strong></td>
                    <td>${this.getSystemUptime(overview, metrics, performance)}</td>
                  </tr>
                  <tr>
                    <td><strong>עומס מערכת:</strong></td>
                    <td>${this.getSystemLoad(overview, metrics, performance)}</td>
                  </tr>
                  <tr>
                    <td><strong>תהליכים פעילים:</strong></td>
                    <td>${this.getActiveProcesses(overview, metrics, performance)}</td>
                  </tr>
                  <tr>
                    <td><strong>חיבורי רשת:</strong></td>
                    <td>${this.getNetworkConnections(overview, metrics, performance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="col-md-6">
              <h6>מדדי יישום</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>זמן תגובה ממוצע:</strong></td>
                    <td>${this.getResponseTime(overview, metrics, performance).toFixed(0)}ms</td>
                  </tr>
                  <tr>
                    <td><strong>בקשות/דקה:</strong></td>
                    <td>${this.getRequestsPerMinute(overview, metrics, performance)}</td>
                  </tr>
                  <tr>
                    <td><strong>שגיאות/דקה:</strong></td>
                    <td>${this.getErrorsPerMinute(overview, metrics, performance)}</td>
                  </tr>
                  <tr>
                    <td><strong>זמן טעינה ממוצע:</strong></td>
                    <td>${this.getAverageLoadTime(overview, metrics, performance).toFixed(0)}ms</td>
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
   * Get CPU usage
   * קבלת שימוש CPU
   */
  getCPUUsage(overview, metrics, performance) {
    if (performance && performance.cpu_usage) {
      return performance.cpu_usage;
    }
    
    if (metrics && metrics.cpu_percent) {
      return metrics.cpu_percent;
    }
    
    if (overview && overview.summary && overview.summary.cpu_usage_percent) {
      return overview.summary.cpu_usage_percent;
    }
    
    return 0;
  }

  /**
   * Get CPU trend
   * קבלת מגמת CPU
   */
  getCPUTrend(overview, metrics, performance) {
    if (performance && performance.cpu_trend) {
      return performance.cpu_trend;
    }
    
    if (metrics && metrics.cpu_trend) {
      return metrics.cpu_trend;
    }
    
    return null;
  }

  /**
   * Get CPU usage color
   * קבלת צבע שימוש CPU
   */
  getCPUUsageColor(usage) {
    if (usage >= 90) return 'danger';
    if (usage >= 75) return 'warning';
    if (usage >= 50) return 'info';
    return 'success';
  }

  /**
   * Get CPU average
   * קבלת ממוצע CPU
   */
  getCPUAverage(overview, metrics, performance) {
    if (performance && performance.cpu_average) {
      return performance.cpu_average;
    }
    
    if (metrics && metrics.cpu_average) {
      return metrics.cpu_average;
    }
    
    return this.getCPUUsage(overview, metrics, performance);
  }

  /**
   * Get memory usage
   * קבלת שימוש זיכרון
   */
  getMemoryUsage(overview, metrics, performance) {
    if (performance && performance.memory_usage) {
      return performance.memory_usage;
    }
    
    if (metrics && metrics.memory_percent) {
      return metrics.memory_percent;
    }
    
    if (overview && overview.summary && overview.summary.memory_usage_percent) {
      return overview.summary.memory_usage_percent;
    }
    
    return 0;
  }

  /**
   * Get memory trend
   * קבלת מגמת זיכרון
   */
  getMemoryTrend(overview, metrics, performance) {
    if (performance && performance.memory_trend) {
      return performance.memory_trend;
    }
    
    if (metrics && metrics.memory_trend) {
      return metrics.memory_trend;
    }
    
    return null;
  }

  /**
   * Get memory usage color
   * קבלת צבע שימוש זיכרון
   */
  getMemoryUsageColor(usage) {
    if (usage >= 90) return 'danger';
    if (usage >= 75) return 'warning';
    if (usage >= 50) return 'info';
    return 'success';
  }

  /**
   * Get available memory
   * קבלת זיכרון זמין
   */
  getAvailableMemory(overview, metrics, performance) {
    if (performance && performance.available_memory) {
      return SMUIComponents.formatBytes(performance.available_memory);
    }
    
    if (metrics && metrics.available_memory) {
      return SMUIComponents.formatBytes(metrics.available_memory);
    }
    
    return 'לא זמין';
  }

  /**
   * Get total memory
   * קבלת זיכרון כולל
   */
  getTotalMemory(overview, metrics, performance) {
    if (performance && performance.total_memory) {
      return SMUIComponents.formatBytes(performance.total_memory);
    }
    
    if (metrics && metrics.total_memory) {
      return SMUIComponents.formatBytes(metrics.total_memory);
    }
    
    return 'לא זמין';
  }

  /**
   * Get response time
   * קבלת זמן תגובה
   */
  getResponseTime(overview, metrics, performance) {
    if (performance && performance.response_time) {
      return performance.response_time;
    }
    
    if (metrics && metrics.avg_response_time) {
      return metrics.avg_response_time;
    }
    
    if (overview && overview.response_time_ms) {
      return overview.response_time_ms;
    }
    
    return 0;
  }

  /**
   * Get response trend
   * קבלת מגמת זמן תגובה
   */
  getResponseTrend(overview, metrics, performance) {
    if (performance && performance.response_trend) {
      return performance.response_trend;
    }
    
    if (metrics && metrics.response_trend) {
      return metrics.response_trend;
    }
    
    return null;
  }

  /**
   * Get response time color
   * קבלת צבע זמן תגובה
   */
  getResponseTimeColor(time) {
    if (time >= 1000) return 'danger';
    if (time >= 500) return 'warning';
    if (time >= 200) return 'info';
    return 'success';
  }

  /**
   * Get min response time
   * קבלת זמן תגובה מינימלי
   */
  getMinResponseTime(overview, metrics, performance) {
    if (performance && performance.min_response_time) {
      return performance.min_response_time;
    }
    
    if (metrics && metrics.min_response_time) {
      return metrics.min_response_time;
    }
    
    return 0;
  }

  /**
   * Get max response time
   * קבלת זמן תגובה מקסימלי
   */
  getMaxResponseTime(overview, metrics, performance) {
    if (performance && performance.max_response_time) {
      return performance.max_response_time;
    }
    
    if (metrics && metrics.max_response_time) {
      return metrics.max_response_time;
    }
    
    return 0;
  }

  /**
   * Get database performance
   * קבלת ביצועי בסיס נתונים
   */
  getDatabasePerformance(overview, metrics, performance) {
    if (performance && performance.db_query_time) {
      return performance.db_query_time;
    }
    
    if (metrics && metrics.db_avg_query_time) {
      return metrics.db_avg_query_time;
    }
    
    if (overview && overview.database && overview.database.avg_query_time) {
      return overview.database.avg_query_time;
    }
    
    return 0;
  }

  /**
   * Get database performance color
   * קבלת צבע ביצועי בסיס נתונים
   */
  getDatabasePerformanceColor(performance) {
    if (performance >= 100) return 'danger';
    if (performance >= 50) return 'warning';
    if (performance >= 20) return 'info';
    return 'success';
  }

  /**
   * Get queries per minute
   * קבלת שאילתות לדקה
   */
  getQueriesPerMinute(overview, metrics, performance) {
    if (performance && performance.queries_per_minute) {
      return performance.queries_per_minute;
    }
    
    if (metrics && metrics.queries_per_minute) {
      return metrics.queries_per_minute;
    }
    
    return 0;
  }

  /**
   * Get active connections
   * קבלת חיבורים פעילים
   */
  getActiveConnections(overview, metrics, performance) {
    if (performance && performance.active_connections) {
      return performance.active_connections;
    }
    
    if (metrics && metrics.active_connections) {
      return metrics.active_connections;
    }
    
    if (overview && overview.summary && overview.summary.active_connections) {
      return overview.summary.active_connections;
    }
    
    return 0;
  }

  /**
   * Get database size
   * קבלת גודל בסיס נתונים
   */
  getDatabaseSize(overview, metrics, performance) {
    if (performance && performance.db_size) {
      return SMUIComponents.formatBytes(performance.db_size);
    }
    
    if (metrics && metrics.db_size) {
      return SMUIComponents.formatBytes(metrics.db_size);
    }
    
    if (overview && overview.database && overview.database.size) {
      return SMUIComponents.formatBytes(overview.database.size);
    }
    
    return 'לא זמין';
  }

  /**
   * Get max CPU usage
   * קבלת שימוש CPU מקסימלי
   */
  getMaxCPUUsage(overview, metrics, performance) {
    if (performance && performance.cpu_max) {
      return performance.cpu_max;
    }
    
    if (metrics && metrics.cpu_max) {
      return metrics.cpu_max;
    }
    
    return this.getCPUUsage(overview, metrics, performance);
  }

  /**
   * Get min CPU usage
   * קבלת שימוש CPU מינימלי
   */
  getMinCPUUsage(overview, metrics, performance) {
    if (performance && performance.cpu_min) {
      return performance.cpu_min;
    }
    
    if (metrics && metrics.cpu_min) {
      return metrics.cpu_min;
    }
    
    return 0;
  }

  /**
   * Get max memory usage
   * קבלת שימוש זיכרון מקסימלי
   */
  getMaxMemoryUsage(overview, metrics, performance) {
    if (performance && performance.memory_max) {
      return performance.memory_max;
    }
    
    if (metrics && metrics.memory_max) {
      return metrics.memory_max;
    }
    
    return this.getMemoryUsage(overview, metrics, performance);
  }

  /**
   * Get min memory usage
   * קבלת שימוש זיכרון מינימלי
   */
  getMinMemoryUsage(overview, metrics, performance) {
    if (performance && performance.memory_min) {
      return performance.memory_min;
    }
    
    if (metrics && metrics.memory_min) {
      return metrics.memory_min;
    }
    
    return 0;
  }

  /**
   * Get memory average
   * קבלת ממוצע זיכרון
   */
  getMemoryAverage(overview, metrics, performance) {
    if (performance && performance.memory_average) {
      return performance.memory_average;
    }
    
    if (metrics && metrics.memory_average) {
      return metrics.memory_average;
    }
    
    return this.getMemoryUsage(overview, metrics, performance);
  }

  /**
   * Get system uptime
   * קבלת זמן פעילות מערכת
   */
  getSystemUptime(overview, metrics, performance) {
    if (performance && performance.uptime) {
      return performance.uptime;
    }
    
    if (metrics && metrics.uptime) {
      return metrics.uptime;
    }
    
    if (overview && overview.summary && overview.summary.uptime) {
      return overview.summary.uptime;
    }
    
    return 'לא זמין';
  }

  /**
   * Get system load
   * קבלת עומס מערכת
   */
  getSystemLoad(overview, metrics, performance) {
    if (performance && performance.system_load) {
      return performance.system_load;
    }
    
    if (metrics && metrics.system_load) {
      return metrics.system_load;
    }
    
    return 'לא זמין';
  }

  /**
   * Get active processes
   * קבלת תהליכים פעילים
   */
  getActiveProcesses(overview, metrics, performance) {
    if (performance && performance.active_processes) {
      return performance.active_processes;
    }
    
    if (metrics && metrics.active_processes) {
      return metrics.active_processes;
    }
    
    return 0;
  }

  /**
   * Get network connections
   * קבלת חיבורי רשת
   */
  getNetworkConnections(overview, metrics, performance) {
    if (performance && performance.network_connections) {
      return performance.network_connections;
    }
    
    if (metrics && metrics.network_connections) {
      return metrics.network_connections;
    }
    
    return 0;
  }

  /**
   * Get requests per minute
   * קבלת בקשות לדקה
   */
  getRequestsPerMinute(overview, metrics, performance) {
    if (performance && performance.requests_per_minute) {
      return performance.requests_per_minute;
    }
    
    if (metrics && metrics.requests_per_minute) {
      return metrics.requests_per_minute;
    }
    
    return 0;
  }

  /**
   * Get errors per minute
   * קבלת שגיאות לדקה
   */
  getErrorsPerMinute(overview, metrics, performance) {
    if (performance && performance.errors_per_minute) {
      return performance.errors_per_minute;
    }
    
    if (metrics && metrics.errors_per_minute) {
      return metrics.errors_per_minute;
    }
    
    return 0;
  }

  /**
   * Get average load time
   * קבלת זמן טעינה ממוצע
   */
  getAverageLoadTime(overview, metrics, performance) {
    if (performance && performance.avg_load_time) {
      return performance.avg_load_time;
    }
    
    if (metrics && metrics.avg_load_time) {
      return metrics.avg_load_time;
    }
    
    return 0;
  }
}

// Export for use in other modules
window.SMPerformanceSection = SMPerformanceSection;
