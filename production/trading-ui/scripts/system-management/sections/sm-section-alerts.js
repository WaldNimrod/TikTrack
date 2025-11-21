/**
 * System Management Alerts Section - TikTrack
 * ========================================
 * 
 * Alerts section for advanced alerts and notifications management
 * Shows active alerts, notification history, and alert types distribution
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMAlertsSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, config);
    this.apiEndpoints = {
      summary: '/api/notifications/summary',
      alerts: '/api/alerts/active',
      history: '/api/notifications/history'
    };
  }

  /**
   * Load alerts data from APIs
   * טעינת נתוני התראות מה-APIs
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`🔔 Loading alerts data from multiple endpoints`);

      // Load data from multiple endpoints in parallel
      const [summaryData, alertsData, historyData] = await Promise.allSettled([
        this.fetchNotificationsSummary(),
        this.fetchActiveAlerts(),
        this.fetchNotificationsHistory()
      ]);

      // Combine data from all sources
      const combinedData = {
        summary: summaryData.status === 'fulfilled' ? summaryData.value : null,
        alerts: alertsData.status === 'fulfilled' ? alertsData.value : null,
        history: historyData.status === 'fulfilled' ? historyData.value : null,
        timestamp: new Date().toISOString()
      };

      this.lastData = combinedData;
      this.render(combinedData);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('❌ Failed to load alerts data:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch notifications summary
   * קבלת סיכום התראות
   */
  async fetchNotificationsSummary() {
    try {
      const response = await fetch(this.apiEndpoints.summary, {
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
      console.warn('⚠️ Failed to fetch notifications summary:', error);
      return null;
    }
  }

  /**
   * Fetch active alerts
   * קבלת התראות פעילות
   */
  async fetchActiveAlerts() {
    try {
      const response = await fetch(this.apiEndpoints.alerts, {
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
      console.warn('⚠️ Failed to fetch active alerts:', error);
      return null;
    }
  }

  /**
   * Fetch notifications history
   * קבלת היסטוריית התראות
   */
  async fetchNotificationsHistory() {
    try {
      const response = await fetch(this.apiEndpoints.history, {
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
      console.warn('⚠️ Failed to fetch notifications history:', error);
      return null;
    }
  }

  /**
   * Render alerts data
   * הצגת נתוני התראות
   */
  render(data) {
    if (!data || (!data.summary && !data.alerts && !data.history)) {
      this.showEmptyState('אין נתוני התראות זמינים');
      return;
    }

    try {
      const alertsHtml = this.createAlertsHTML(data);
      this.container.innerHTML = alertsHtml;
      
      console.log('✅ Alerts section rendered successfully');
      
    } catch (error) {
      console.error('❌ Failed to render alerts section:', error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'render',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create alerts HTML
   * יצירת HTML של התראות
   */
  createAlertsHTML(data) {
    const { summary, alerts, history } = data;

    return `
      <div class="alerts-overview">
        <!-- Alerts Overview Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            ${this.createActiveAlertsCard(summary, alerts)}
          </div>
          <div class="col-md-3">
            ${this.createAlertsBySeverityCard(summary, alerts)}
          </div>
          <div class="col-md-3">
            ${this.createNotificationsHistoryCard(summary, history)}
          </div>
          <div class="col-md-3">
            ${this.createAlertsActionsCard()}
          </div>
        </div>

        <!-- Active Alerts List -->
        <div class="row mb-4">
          <div class="col-12">
            ${this.createActiveAlertsListCard(alerts)}
          </div>
        </div>

        <!-- Alerts History -->
        <div class="row">
          <div class="col-12">
            ${this.createAlertsHistoryCard(history)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create active alerts card
   * יצירת כרטיס התראות פעילות
   */
  createActiveAlertsCard(summary, alerts) {
    const activeAlertsCount = this.getActiveAlertsCount(summary, alerts);
    const alertsTrend = this.getAlertsTrend(summary, alerts);

    return `
      <div class="card alerts-active-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-bell"></i> התראות פעילות</h5>
          
          <div class="alerts-metric">
            <div class="metric-value text-${this.getAlertsCountColor(activeAlertsCount)}">
              ${activeAlertsCount}
            </div>
            <div class="metric-label">התראות פעילות</div>
          </div>
          
          <div class="alerts-trend">
            ${alertsTrend !== null ? `
              <div class="trend-indicator trend-${alertsTrend > 0 ? 'up' : alertsTrend < 0 ? 'down' : 'neutral'}">
                <i class="fas fa-arrow-${alertsTrend > 0 ? 'up' : alertsTrend < 0 ? 'down' : 'minus'}"></i>
                <span>${Math.abs(alertsTrend)}%</span>
              </div>
            ` : ''}
          </div>
          
          <div class="alerts-details">
            <div class="detail-item">
              <span class="detail-label">מאתמול:</span>
              <span class="detail-value">${alertsTrend !== null ? (alertsTrend > 0 ? '+' : '') + alertsTrend + '%' : 'לא זמין'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create alerts by severity card
   * יצירת כרטיס התראות לפי חומרה
   */
  createAlertsBySeverityCard(summary, alerts) {
    const severityStats = this.getSeverityStats(summary, alerts);

    return `
      <div class="card alerts-severity-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-exclamation-triangle"></i> התראות לפי חומרה</h5>
          
          <div class="severity-stats">
            <div class="severity-item">
              <div class="severity-icon text-danger">
                <i class="fas fa-times-circle"></i>
              </div>
              <div class="severity-count">${severityStats.error}</div>
              <div class="severity-label">שגיאות</div>
            </div>
            
            <div class="severity-item">
              <div class="severity-icon text-warning">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="severity-count">${severityStats.warning}</div>
              <div class="severity-label">אזהרות</div>
            </div>
            
            <div class="severity-item">
              <div class="severity-icon text-info">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="severity-count">${severityStats.info}</div>
              <div class="severity-label">מידע</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create notifications history card
   * יצירת כרטיס היסטוריית התראות
   */
  createNotificationsHistoryCard(summary, history) {
    const historyStats = this.getHistoryStats(summary, history);

    return `
      <div class="card alerts-history-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-history"></i> היסטוריית התראות</h5>
          
          <div class="history-metric">
            <div class="metric-value text-primary">
              ${historyStats.last24h}
            </div>
            <div class="metric-label">24 שעות אחרונות</div>
          </div>
          
          <div class="history-details">
            <div class="detail-item">
              <span class="detail-label">היום:</span>
              <span class="detail-value">${historyStats.today}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">השבוע:</span>
              <span class="detail-value">${historyStats.thisWeek}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">החודש:</span>
              <span class="detail-value">${historyStats.thisMonth}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create alerts actions card
   * יצירת כרטיס פעולות התראות
   */
  createAlertsActionsCard() {
    return `
      <div class="card alerts-actions-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-cogs"></i> פעולות התראות</h5>
          
          <div class="alerts-actions">
            <button class="btn btn-warning btn-sm mb-2 w-100" onclick="SMAlertsSection.clearAllAlerts()">
              <i class="fas fa-trash-alt"></i> נקה כל ההתראות
            </button>
            
            <button class="btn btn-info btn-sm mb-2 w-100" onclick="SMAlertsSection.markAllAsRead()">
              <i class="fas fa-check"></i> סמן הכל כנקרא
            </button>
            
            <button class="btn btn-primary btn-sm mb-2 w-100" onclick="SMAlertsSection.refreshAlerts()">
              <i class="fas fa-sync-alt"></i> רענן התראות
            </button>
            
            <button class="btn btn-secondary btn-sm w-100" onclick="SMAlertsSection.exportAlerts()">
              <i class="fas fa-download"></i> ייצא התראות
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create active alerts list card
   * יצירת כרטיס רשימת התראות פעילות
   */
  createActiveAlertsListCard(alerts) {
    if (!alerts || !Array.isArray(alerts)) {
      return `
        <div class="card">
          <div class="card-header">
            <h5><i class="fas fa-bell"></i> התראות פעילות</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info">
              <i class="fas fa-info-circle"></i>
              אין התראות פעילות
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-bell"></i> התראות פעילות (${alerts.length})</h5>
        </div>
        <div class="card-body">
          <div class="alerts-list">
            ${alerts.slice(0, 10).map(alert => `
              <div class="alert-item alert-${alert.severity || 'info'}">
                <div class="alert-header">
                  <div class="alert-icon">
                    <i class="fas ${this.getAlertIcon(alert.severity)}"></i>
                  </div>
                  <div class="alert-info">
                    <h6 class="alert-title">${alert.title || 'התראה'}</h6>
                    <span class="alert-time">${alert.created_at || 'לא זמין'}</span>
                  </div>
                  <div class="alert-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="SMAlertsSection.markAsRead('${alert.id}')">
                      <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="SMAlertsSection.dismissAlert('${alert.id}')">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div class="alert-body">
                  <p class="alert-message">${alert.message || 'אין הודעה'}</p>
                  ${alert.source ? `
                    <div class="alert-source">
                      <small class="text-muted">מקור: ${alert.source}</small>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
            
            ${alerts.length > 10 ? `
              <div class="text-center mt-3">
                <button class="btn btn-outline-primary btn-sm" onclick="SMAlertsSection.showAllAlerts()">
                  <i class="fas fa-list"></i> הצג כל ההתראות
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create alerts history card
   * יצירת כרטיס היסטוריית התראות
   */
  createAlertsHistoryCard(history) {
    if (!history || !Array.isArray(history)) {
      return `
        <div class="card">
          <div class="card-header">
            <h5><i class="fas fa-history"></i> היסטוריית התראות</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info">
              <i class="fas fa-info-circle"></i>
              אין היסטוריית התראות זמינה
            </div>
          </div>
        </div>
      `;
    }

    // Show only last 20 history items
    const recentHistory = history.slice(0, 20);

    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-history"></i> היסטוריית התראות (20 האחרונות)</h5>
        </div>
        <div class="card-body">
          <div class="alerts-history">
            ${recentHistory.map(item => `
              <div class="history-item history-${item.severity || 'info'}">
                <div class="history-header">
                  <div class="history-icon">
                    <i class="fas ${this.getAlertIcon(item.severity)}"></i>
                  </div>
                  <div class="history-info">
                    <h6 class="history-title">${item.title || 'התראה'}</h6>
                    <span class="history-time">${item.created_at || 'לא זמין'}</span>
                  </div>
                  <div class="history-status">
                    <span class="badge bg-${this.getHistoryStatusColor(item.status)}">
                      ${this.getHistoryStatusText(item.status)}
                    </span>
                  </div>
                </div>
                <div class="history-body">
                  <p class="history-message">${item.message || 'אין הודעה'}</p>
                  ${item.source ? `
                    <div class="history-source">
                      <small class="text-muted">מקור: ${item.source}</small>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
            
            ${history.length > 20 ? `
              <div class="text-center mt-3">
                <button class="btn btn-outline-primary btn-sm" onclick="SMAlertsSection.showAllHistory()">
                  <i class="fas fa-list"></i> הצג כל ההיסטוריה
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get active alerts count
   * קבלת מספר התראות פעילות
   */
  getActiveAlertsCount(summary, alerts) {
    if (alerts && Array.isArray(alerts)) {
      return alerts.length;
    }
    
    if (summary && summary.active_alerts) {
      return summary.active_alerts;
    }
    
    return 0;
  }

  /**
   * Get alerts trend
   * קבלת מגמת התראות
   */
  getAlertsTrend(summary, alerts) {
    if (summary && summary.alerts_trend) {
      return summary.alerts_trend;
    }
    
    return null;
  }

  /**
   * Get alerts count color
   * קבלת צבע מספר התראות
   */
  getAlertsCountColor(count) {
    if (count === 0) return 'success';
    if (count <= 5) return 'warning';
    return 'danger';
  }

  /**
   * Get severity stats
   * קבלת סטטיסטיקות חומרה
   */
  getSeverityStats(summary, alerts) {
    const stats = {
      error: 0,
      warning: 0,
      info: 0
    };

    if (alerts && Array.isArray(alerts)) {
      alerts.forEach(alert => {
        const severity = alert.severity || 'info';
        if (stats[severity] !== undefined) {
          stats[severity]++;
        }
      });
    } else if (summary && summary.severity_stats) {
      return summary.severity_stats;
    }

    return stats;
  }

  /**
   * Get history stats
   * קבלת סטטיסטיקות היסטוריה
   */
  getHistoryStats(summary, history) {
    if (summary && summary.history_stats) {
      return summary.history_stats;
    }

    return {
      last24h: history ? history.length : 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    };
  }

  /**
   * Get alert icon
   * קבלת אייקון התראה
   */
  getAlertIcon(severity) {
    const icons = {
      'error': 'fa-times-circle',
      'warning': 'fa-exclamation-triangle',
      'info': 'fa-info-circle',
      'success': 'fa-check-circle',
      'default': 'fa-bell'
    };
    return icons[severity] || icons.default;
  }

  /**
   * Get history status color
   * קבלת צבע סטטוס היסטוריה
   */
  getHistoryStatusColor(status) {
    const colors = {
      'read': 'success',
      'unread': 'warning',
      'dismissed': 'secondary',
      'default': 'info'
    };
    return colors[status] || colors.default;
  }

  /**
   * Get history status text
   * קבלת טקסט סטטוס היסטוריה
   */
  getHistoryStatusText(status) {
    const texts = {
      'read': 'נקרא',
      'unread': 'לא נקרא',
      'dismissed': 'נדחה',
      'default': 'לא ידוע'
    };
    return texts[status] || texts.default;
  }

  /**
   * Clear all alerts (static method for global access)
   * ניקוי כל ההתראות (מתודה סטטית לגישה גלובלית)
   */
  static async clearAllAlerts() {
    try {
      console.log('🗑️ Clearing all alerts...');
      
      const response = await fetch('/api/alerts/clear', {
        method: 'POST',
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
          window.showNotification(result.message || 'כל ההתראות נוקו בהצלחה', 'success');
        }
        
        // Refresh alerts section
        const alertsSection = document.getElementById('sm-alerts');
        if (alertsSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-alerts');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to clear alerts');
      }
      
    } catch (error) {
      console.error('❌ Failed to clear alerts:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בניקוי התראות: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Mark all as read (static method for global access)
   * סימון הכל כנקרא (מתודה סטטית לגישה גלובלית)
   */
  static async markAllAsRead() {
    try {
      console.log('✅ Marking all alerts as read...');
      
      const response = await fetch('/api/alerts/mark-all-read', {
        method: 'POST',
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
          window.showNotification(result.message || 'כל ההתראות סומנו כנקראו', 'success');
        }
        
        // Refresh alerts section
        const alertsSection = document.getElementById('sm-alerts');
        if (alertsSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-alerts');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to mark all as read');
      }
      
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בסימון כנקרא: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Refresh alerts (static method for global access)
   * רענון התראות (מתודה סטטית לגישה גלובלית)
   */
  static async refreshAlerts() {
    const alertsSection = document.getElementById('sm-alerts');
    if (alertsSection) {
      const sectionInstance = window.systemManagementMain?.sections?.get('sm-alerts');
      if (sectionInstance) {
        await sectionInstance.refresh();
      }
    }
  }

  /**
   * Export alerts (static method for global access)
   * ייצוא התראות (מתודה סטטית לגישה גלובלית)
   */
  static exportAlerts() {
    const alertsSection = document.getElementById('sm-alerts');
    if (alertsSection) {
      const sectionInstance = window.systemManagementMain?.sections?.get('sm-alerts');
      if (sectionInstance && sectionInstance.lastData) {
        const dataStr = JSON.stringify(sectionInstance.lastData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `alerts-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  }

  /**
   * Mark alert as read (static method for global access)
   * סימון התראה כנקראה (מתודה סטטית לגישה גלובלית)
   */
  static async markAsRead(alertId) {
    try {
      console.log(`✅ Marking alert ${alertId} as read...`);
      
      const response = await fetch(`/api/alerts/${alertId}/mark-read`, {
        method: 'POST',
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
          window.showNotification('התראה סומנה כנקראה', 'success');
        }
        
        // Refresh alerts section
        const alertsSection = document.getElementById('sm-alerts');
        if (alertsSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-alerts');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to mark as read');
      }
      
    } catch (error) {
      console.error('❌ Failed to mark as read:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בסימון כנקרא: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Dismiss alert (static method for global access)
   * דחיית התראה (מתודה סטטית לגישה גלובלית)
   */
  static async dismissAlert(alertId) {
    try {
      console.log(`❌ Dismissing alert ${alertId}...`);
      
      const response = await fetch(`/api/alerts/${alertId}/dismiss`, {
        method: 'POST',
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
          window.showNotification('התראה נדחתה', 'success');
        }
        
        // Refresh alerts section
        const alertsSection = document.getElementById('sm-alerts');
        if (alertsSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-alerts');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to dismiss alert');
      }
      
    } catch (error) {
      console.error('❌ Failed to dismiss alert:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בדחיית התראה: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Show all alerts (static method for global access)
   * הצגת כל ההתראות (מתודה סטטית לגישה גלובלית)
   */
  static showAllAlerts() {
    console.log('📋 Showing all alerts');
    alert('פתיחת כל ההתראות');
  }

  /**
   * Show all history (static method for global access)
   * הצגת כל ההיסטוריה (מתודה סטטית לגישה גלובלית)
   */
  static showAllHistory() {
    console.log('📋 Showing all alerts history');
    alert('פתיחת כל היסטוריית ההתראות');
  }
}

// Export for use in other modules
window.SMAlertsSection = SMAlertsSection;
