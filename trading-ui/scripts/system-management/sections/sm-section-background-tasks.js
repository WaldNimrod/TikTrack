/**
 * System Management Background Tasks Section - TikTrack
 * ================================================
 * 
 * Background tasks section for background tasks management
 * Shows scheduler status, active tasks, success rates, and task operations
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMBackgroundTasksSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, config);
    this.apiEndpoints = {
      tasks: '/api/background-tasks/',
      history: '/api/background-tasks/history',
      status: '/api/background-tasks/' // Use main endpoint for status
    };
  }

  /**
   * Load background tasks data from APIs
   * טעינת נתוני משימות רקע מה-APIs
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`⚙️ Loading background tasks data from multiple endpoints`);

      // Load data from multiple endpoints in parallel
      const [tasksData, historyData, statusData] = await Promise.allSettled([
        this.fetchBackgroundTasks(),
        this.fetchBackgroundTasksHistory(),
        this.fetchBackgroundTasksStatus()
      ]);

      // Combine data from all sources
      const combinedData = {
        tasks: tasksData.status === 'fulfilled' ? tasksData.value : null,
        history: historyData.status === 'fulfilled' ? historyData.value : null,
        status: statusData.status === 'fulfilled' ? statusData.value : null,
        timestamp: new Date().toISOString()
      };

      this.lastData = combinedData;
      this.render(combinedData);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('❌ Failed to load background tasks data:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch background tasks
   * קבלת משימות רקע
   */
  async fetchBackgroundTasks() {
    try {
      const response = await this.fetchWithTimeout(this.apiEndpoints.tasks, {
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
      // Handle different response formats
      if (result.status === 'success') {
        return Array.isArray(result.data) ? result.data : (result.data?.tasks || result.data || []);
      }
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.warn('⚠️ Failed to fetch background tasks:', error);
      return [];
    }
  }

  /**
   * Fetch background tasks history
   * קבלת היסטוריית משימות רקע
   */
  async fetchBackgroundTasksHistory() {
    try {
      const response = await this.fetchWithTimeout(this.apiEndpoints.history, {
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
      // Handle different response formats
      if (result.status === 'success') {
        return Array.isArray(result.data) ? result.data : (result.data?.history || result.data || []);
      }
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.warn('⚠️ Failed to fetch background tasks history:', error);
      return [];
    }
  }

  /**
   * Fetch background tasks status
   * קבלת סטטוס משימות רקע
   */
  async fetchBackgroundTasksStatus() {
    try {
      const response = await this.fetchWithTimeout(this.apiEndpoints.status, {
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
      return result.status === 'success' ? result.data : (result.data || result || {});
    } catch (error) {
      console.warn('⚠️ Failed to fetch background tasks status:', error);
      return {};
    }
  }

  /**
   * Render background tasks data
   * הצגת נתוני משימות רקע
   */
  render(data) {
    // Handle case where data might be empty or have empty arrays
    // Always show the section, even if there are no tasks
    if (!data) {
      this.showEmptyState('אין נתוני משימות רקע זמינים');
      return;
    }

    try {
      const backgroundTasksHtml = this.createBackgroundTasksHTML(data);
      this.container.innerHTML = backgroundTasksHtml;
      
      console.log('✅ Background tasks section rendered successfully');
      
    } catch (error) {
      console.error('❌ Failed to render background tasks section:', error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'render',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create background tasks HTML
   * יצירת HTML של משימות רקע
   */
  createBackgroundTasksHTML(data) {
    const { tasks, history, status } = data;

    return `
      <div class="background-tasks-overview">
        <!-- Background Tasks Overview Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            ${this.createSchedulerStatusCard(status)}
          </div>
          <div class="col-md-3">
            ${this.createActiveTasksCard(tasks)}
          </div>
          <div class="col-md-3">
            ${this.createSuccessRateCard(tasks, history)}
          </div>
          <div class="col-md-3">
            ${this.createTasksActionsCard()}
          </div>
        </div>

        <!-- Active Tasks List -->
        <div class="row mb-4">
          <div class="col-12">
            ${this.createActiveTasksListCard(tasks)}
          </div>
        </div>

        <!-- Tasks History -->
        <div class="row">
          <div class="col-12">
            ${this.createTasksHistoryCard(history)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create scheduler status card
   * יצירת כרטיס סטטוס מתזמן
   */
  createSchedulerStatusCard(status) {
    const schedulerStatus = this.getSchedulerStatus(status);
    const statusColor = this.getSchedulerStatusColor(schedulerStatus);
    const statusText = this.getSchedulerStatusText(schedulerStatus);

    return `
      <div class="card scheduler-status-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-clock"></i> סטטוס מתזמן</h5>
          
          <div class="scheduler-status">
            <div class="status-icon status-${statusColor}">
              <i class="fas fa-${this.getSchedulerStatusIcon(schedulerStatus)}"></i>
            </div>
            <div class="status-text">${statusText}</div>
          </div>
          
          <div class="scheduler-details">
            <div class="detail-item">
              <span class="detail-label">משימות מתוזמנות:</span>
              <span class="detail-value">${this.getScheduledTasksCount(status)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">משימות פעילות:</span>
              <span class="detail-value">${this.getActiveTasksCount(status)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create active tasks card
   * יצירת כרטיס משימות פעילות
   */
  createActiveTasksCard(tasks) {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return `
        <div class="card active-tasks-card">
          <div class="card-body text-center">
            <h5><i class="fas fa-play"></i> משימות פעילות</h5>
            <div class="alert alert-info mt-3">
              <i class="fas fa-info-circle"></i>
              אין משימות פעילות כרגע
            </div>
          </div>
        </div>
      `;
    }
    
    const activeTasksCount = this.getActiveTasksCount(tasks);
    const runningTasksCount = this.getRunningTasksCount(tasks);

    return `
      <div class="card active-tasks-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-play"></i> משימות פעילות</h5>
          
          <div class="tasks-metric">
            <div class="metric-value text-primary">
              ${activeTasksCount}
            </div>
            <div class="metric-label">משימות פעילות</div>
          </div>
          
          <div class="tasks-details">
            <div class="detail-item">
              <span class="detail-label">רצות כרגע:</span>
              <span class="detail-value">${runningTasksCount}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ממתינות:</span>
              <span class="detail-value">${Math.max(0, activeTasksCount - runningTasksCount)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create success rate card
   * יצירת כרטיס שיעור הצלחה
   */
  createSuccessRateCard(tasks, history) {
    const successRate = this.getSuccessRate(tasks, history);
    const successRateColor = this.getSuccessRateColor(successRate);

    return `
      <div class="card success-rate-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-chart-line"></i> שיעור הצלחה</h5>
          
          <div class="success-rate-metric">
            <div class="metric-value" style="color: ${successRateColor}">
              ${successRate.toFixed(1)}%
            </div>
            <div class="metric-label">שיעור הצלחה</div>
          </div>
          
          <div class="success-rate-details">
            <div class="detail-item">
              <span class="detail-label">הצלחות:</span>
              <span class="detail-value">${this.getSuccessfulTasksCount(tasks, history)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">כישלונות:</span>
              <span class="detail-value">${this.getFailedTasksCount(tasks, history)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create tasks actions card
   * יצירת כרטיס פעולות משימות
   */
  createTasksActionsCard() {
    return `
      <div class="card tasks-actions-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-cogs"></i> פעולות משימות</h5>
          
          <div class="tasks-actions">
            <button class="btn btn-primary btn-sm mb-2 w-100" onclick="SMBackgroundTasksSection.startScheduler()">
              <i class="fas fa-play"></i> הפעל מתזמן
            </button>
            
            <button class="btn btn-warning btn-sm mb-2 w-100" onclick="SMBackgroundTasksSection.stopScheduler()">
              <i class="fas fa-stop"></i> עצור מתזמן
            </button>
            
            <button class="btn btn-info btn-sm mb-2 w-100" onclick="SMBackgroundTasksSection.refreshTasks()">
              <i class="fas fa-sync-alt"></i> רענן משימות
            </button>
            
            <button class="btn btn-secondary btn-sm w-100" onclick="SMBackgroundTasksSection.viewTaskLogs()">
              <i class="fas fa-list-alt"></i> צפה בלוגים
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create active tasks list card
   * יצירת כרטיס רשימת משימות פעילות
   */
  createActiveTasksListCard(tasks) {
    if (!tasks || !Array.isArray(tasks)) {
      return `
        <div class="card">
          <div class="card-header">
            <h5><i class="fas fa-tasks"></i> משימות פעילות</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info">
              <i class="fas fa-info-circle"></i>
              אין משימות פעילות
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-tasks"></i> משימות פעילות (${tasks.length})</h5>
        </div>
        <div class="card-body">
          <div class="tasks-list">
            ${tasks.map(task => `
              <div class="task-item task-${task.status || 'unknown'}">
                <div class="task-header">
                  <div class="task-icon">
                    <i class="fas ${this.getTaskIcon(task.status)}"></i>
                  </div>
                  <div class="task-info">
                    <h6 class="task-title">${task.name || 'משימה'}</h6>
                    <span class="task-type">${task.type || 'לא ידוע'}</span>
                  </div>
                  <div class="task-status">
                    <span class="badge bg-${this.getTaskStatusColor(task.status)}">
                      ${this.getTaskStatusText(task.status)}
                    </span>
                  </div>
                  <div class="task-actions">
                    ${task.status === 'running' ? `
                      <button class="btn btn-sm btn-outline-warning" onclick="SMBackgroundTasksSection.stopTask('${task.id}')">
                        <i class="fas fa-stop"></i>
                      </button>
                    ` : `
                      <button class="btn btn-sm btn-outline-primary" onclick="SMBackgroundTasksSection.runTask('${task.id}')">
                        <i class="fas fa-play"></i>
                      </button>
                    `}
                    <button class="btn btn-sm btn-outline-info" onclick="SMBackgroundTasksSection.viewTaskDetails('${task.id}')">
                      <i class="fas fa-info"></i>
                    </button>
                  </div>
                </div>
                <div class="task-body">
                  <div class="task-details">
                    <div class="detail-item">
                      <span class="detail-label">마지막 הרצה:</span>
                      <span class="detail-value">${task.last_run || 'לא ידוע'}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">הרצה הבאה:</span>
                      <span class="detail-value">${task.next_run || 'לא מתוזמן'}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">שיעור הצלחה:</span>
                      <span class="detail-value">${task.success_rate || 0}%</span>
                    </div>
                  </div>
                  
                  ${task.description ? `
                    <div class="task-description">
                      <p>${task.description}</p>
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
   * Create tasks history card
   * יצירת כרטיס היסטוריית משימות
   */
  createTasksHistoryCard(history) {
    if (!history || !Array.isArray(history)) {
      return `
        <div class="card">
          <div class="card-header">
            <h5><i class="fas fa-history"></i> היסטוריית משימות</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info">
              <i class="fas fa-info-circle"></i>
              אין היסטוריית משימות זמינה
            </div>
          </div>
        </div>
      `;
    }

    // Show only last 15 history items
    const recentHistory = history.slice(0, 15);

    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-history"></i> היסטוריית משימות (15 האחרונות)</h5>
        </div>
        <div class="card-body">
          <div class="tasks-history">
            ${recentHistory.map(item => `
              <div class="history-item history-${item.status || 'unknown'}">
                <div class="history-header">
                  <div class="history-icon">
                    <i class="fas ${this.getTaskIcon(item.status)}"></i>
                  </div>
                  <div class="history-info">
                    <h6 class="history-title">${item.task_name || 'משימה'}</h6>
                    <span class="history-time">${item.executed_at || 'לא ידוע'}</span>
                  </div>
                  <div class="history-status">
                    <span class="badge bg-${this.getTaskStatusColor(item.status)}">
                      ${this.getTaskStatusText(item.status)}
                    </span>
                  </div>
                  <div class="history-duration">
                    <span class="duration-text">${item.duration || 'לא ידוע'}</span>
                  </div>
                </div>
                <div class="history-body">
                  ${item.message ? `
                    <p class="history-message">${item.message}</p>
                  ` : ''}
                  
                  ${item.error ? `
                    <div class="history-error">
                      <small class="text-danger">שגיאה: ${item.error}</small>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
            
            ${history.length > 15 ? `
              <div class="text-center mt-3">
                <button class="btn btn-outline-primary btn-sm" onclick="SMBackgroundTasksSection.showAllHistory()">
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
   * Get scheduler status
   * קבלת סטטוס מתזמן
   */
  getSchedulerStatus(status) {
    if (status && status.scheduler_status) {
      return status.scheduler_status;
    }
    
    return 'unknown';
  }

  /**
   * Get scheduler status color
   * קבלת צבע סטטוס מתזמן
   */
  getSchedulerStatusColor(status) {
    const colors = {
      'running': 'success',
      'stopped': 'danger',
      'paused': 'warning',
      'unknown': 'secondary'
    };
    return colors[status] || 'secondary';
  }

  /**
   * Get scheduler status text
   * קבלת טקסט סטטוס מתזמן
   */
  getSchedulerStatusText(status) {
    const texts = {
      'running': 'פועל',
      'stopped': 'עצור',
      'paused': 'מושהה',
      'unknown': 'לא ידוע'
    };
    return texts[status] || 'לא ידוע';
  }

  /**
   * Get scheduler status icon
   * קבלת אייקון סטטוס מתזמן
   */
  getSchedulerStatusIcon(status) {
    const icons = {
      'running': 'fa-play-circle',
      'stopped': 'fa-stop-circle',
      'paused': 'fa-pause-circle',
      'unknown': 'fa-question-circle'
    };
    return icons[status] || 'fa-question-circle';
  }

  /**
   * Get scheduled tasks count
   * קבלת מספר משימות מתוזמנות
   */
  getScheduledTasksCount(status) {
    if (status && status.scheduled_tasks_count) {
      return status.scheduled_tasks_count;
    }
    
    return 0;
  }

  /**
   * Get active tasks count
   * קבלת מספר משימות פעילות
   */
  getActiveTasksCount(tasks) {
    if (tasks && Array.isArray(tasks)) {
      return tasks.filter(task => task.status === 'active' || task.status === 'running').length;
    }
    
    return 0;
  }

  /**
   * Get running tasks count
   * קבלת מספר משימות רצות
   */
  getRunningTasksCount(tasks) {
    if (tasks && Array.isArray(tasks)) {
      return tasks.filter(task => task.status === 'running').length;
    }
    
    return 0;
  }

  /**
   * Get success rate
   * קבלת שיעור הצלחה
   */
  getSuccessRate(tasks, history) {
    if (history && Array.isArray(history)) {
      const total = history.length;
      const successful = history.filter(item => item.status === 'success' || item.status === 'completed').length;
      return total > 0 ? (successful / total) * 100 : 0;
    }
    
    if (tasks && Array.isArray(tasks)) {
      const total = tasks.length;
      const successful = tasks.filter(task => task.success_rate && task.success_rate > 0).length;
      return total > 0 ? (successful / total) * 100 : 0;
    }
    
    return 0;
  }

  /**
   * Get success rate color
   * קבלת צבע שיעור הצלחה
   */
  getSuccessRateColor(rate) {
    if (rate >= 90) return '#28a745'; // Green
    if (rate >= 70) return '#ffc107'; // Yellow
    if (rate >= 50) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  }

  /**
   * Get successful tasks count
   * קבלת מספר משימות מוצלחות
   */
  getSuccessfulTasksCount(tasks, history) {
    if (history && Array.isArray(history)) {
      return history.filter(item => item.status === 'success' || item.status === 'completed').length;
    }
    
    return 0;
  }

  /**
   * Get failed tasks count
   * קבלת מספר משימות כושלות
   */
  getFailedTasksCount(tasks, history) {
    if (history && Array.isArray(history)) {
      return history.filter(item => item.status === 'failed' || item.status === 'error').length;
    }
    
    return 0;
  }

  /**
   * Get task icon
   * קבלת אייקון משימה
   */
  getTaskIcon(status) {
    const icons = {
      'running': 'fa-play-circle',
      'completed': 'fa-check-circle',
      'failed': 'fa-times-circle',
      'pending': 'fa-clock',
      'paused': 'fa-pause-circle',
      'default': 'fa-tasks'
    };
    return icons[status] || icons.default;
  }

  /**
   * Get task status color
   * קבלת צבע סטטוס משימה
   */
  getTaskStatusColor(status) {
    const colors = {
      'running': 'primary',
      'completed': 'success',
      'failed': 'danger',
      'pending': 'warning',
      'paused': 'secondary',
      'default': 'secondary'
    };
    return colors[status] || colors.default;
  }

  /**
   * Get task status text
   * קבלת טקסט סטטוס משימה
   */
  getTaskStatusText(status) {
    const texts = {
      'running': 'רצה',
      'completed': 'הושלמה',
      'failed': 'נכשלה',
      'pending': 'ממתינה',
      'paused': 'מושהה',
      'default': 'לא ידוע'
    };
    return texts[status] || texts.default;
  }

  /**
   * Start scheduler (static method for global access)
   * הפעלת מתזמן (מתודה סטטית לגישה גלובלית)
   */
  static async startScheduler() {
    try {
      console.log('▶️ Starting scheduler...');
      
      const response = await fetch('/api/background-tasks/start', {
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
          window.showNotification(result.message || 'מתזמן הופעל בהצלחה', 'success');
        }
        
        // Refresh background tasks section
        const backgroundTasksSection = document.getElementById('sm-background-tasks');
        if (backgroundTasksSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-background-tasks');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to start scheduler');
      }
      
    } catch (error) {
      console.error('❌ Failed to start scheduler:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בהפעלת מתזמן: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Stop scheduler (static method for global access)
   * עצירת מתזמן (מתודה סטטית לגישה גלובלית)
   */
  static async stopScheduler() {
    try {
      console.log('⏹️ Stopping scheduler...');
      
      const response = await fetch('/api/background-tasks/stop', {
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
          window.showNotification(result.message || 'מתזמן נעצר בהצלחה', 'success');
        }
        
        // Refresh background tasks section
        const backgroundTasksSection = document.getElementById('sm-background-tasks');
        if (backgroundTasksSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-background-tasks');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to stop scheduler');
      }
      
    } catch (error) {
      console.error('❌ Failed to stop scheduler:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בעצירת מתזמן: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Refresh tasks (static method for global access)
   * רענון משימות (מתודה סטטית לגישה גלובלית)
   */
  static async refreshTasks() {
    const backgroundTasksSection = document.getElementById('sm-background-tasks');
    if (backgroundTasksSection) {
      const sectionInstance = window.systemManagementMain?.sections?.get('sm-background-tasks');
      if (sectionInstance) {
        await sectionInstance.refresh();
      }
    }
  }

  /**
   * View task logs (static method for global access)
   * צפייה בלוגי משימות (מתודה סטטית לגישה גלובלית)
   */
  static viewTaskLogs() {
    console.log('📋 Viewing task logs');
    alert('פתיחת לוגי משימות רקע');
  }

  /**
   * Run task (static method for global access)
   * הרצת משימה (מתודה סטטית לגישה גלובלית)
   */
  static async runTask(taskId) {
    try {
      console.log(`▶️ Running task ${taskId}...`);
      
      const response = await fetch(`/api/background-tasks/${taskId}/run`, {
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
          window.showNotification(result.message || 'משימה הופעלה בהצלחה', 'success');
        }
        
        // Refresh background tasks section
        const backgroundTasksSection = document.getElementById('sm-background-tasks');
        if (backgroundTasksSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-background-tasks');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to run task');
      }
      
    } catch (error) {
      console.error('❌ Failed to run task:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בהרצת משימה: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Stop task (static method for global access)
   * עצירת משימה (מתודה סטטית לגישה גלובלית)
   */
  static async stopTask(taskId) {
    try {
      console.log(`⏹️ Stopping task ${taskId}...`);
      
      const response = await fetch(`/api/background-tasks/${taskId}/stop`, {
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
          window.showNotification(result.message || 'משימה נעצרה בהצלחה', 'success');
        }
        
        // Refresh background tasks section
        const backgroundTasksSection = document.getElementById('sm-background-tasks');
        if (backgroundTasksSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-background-tasks');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to stop task');
      }
      
    } catch (error) {
      console.error('❌ Failed to stop task:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בעצירת משימה: ${error.message}`, 'error');
      }
    }
  }

  /**
   * View task details (static method for global access)
   * צפייה בפרטי משימה (מתודה סטטית לגישה גלובלית)
   */
  static viewTaskDetails(taskId) {
    console.log(`📋 Viewing task details for ${taskId}`);
    alert(`פתיחת פרטי משימה: ${taskId}`);
  }

  /**
   * Show all history (static method for global access)
   * הצגת כל ההיסטוריה (מתודה סטטית לגישה גלובלית)
   */
  static showAllHistory() {
    console.log('📋 Showing all tasks history');
    alert('פתיחת כל היסטוריית המשימות');
  }
}

// Export for use in other modules
window.SMBackgroundTasksSection = SMBackgroundTasksSection;
