/**
 * Background Tasks Management - TikTrack
 * Comprehensive background task management system
 *
 * Features:
 * - System status monitoring
 * - Task management and execution
 * - Execution history tracking
 * - Performance analytics
 * - Real-time updates
 *
 * Author: TikTrack Development Team
 * Version: 2.0
 * Date: September 2025
 */

// Global variables
let currentTaskName = null;
let refreshInterval = null;

// API endpoints
const API_BASE = '/api/v1/background-tasks';
const API_ENDPOINTS = {
  status: `${API_BASE}/`,
  tasks: `${API_BASE}/tasks`,
  history: `${API_BASE}/history`,
  analytics: `${API_BASE}/analytics`,
  scheduler: {
    start: `${API_BASE}/scheduler/start`,
    stop: `${API_BASE}/scheduler/stop`,
  },
  task: {
    execute: name => `${API_BASE}/tasks/${name}/execute`,
    toggle: name => `${API_BASE}/tasks/${name}/toggle`,
    details: name => `${API_BASE}/tasks/${name}`,
  },
};

// Utility functions
const utils = {
  /**
     * Format duration in milliseconds to human readable format
     */
  formatDuration: ms => {
    if (ms < 1000) {return `${ms.toFixed(2)}ms`;}
    if (ms < 60000) {return `${(ms / 1000).toFixed(2)}s`;}
    if (ms < 3600000) {return `${(ms / 60000).toFixed(2)}m`;}
    return `${(ms / 3600000).toFixed(2)}h`;
  },

  /**
     * Format timestamp to local date string
     */
  formatTimestamp: timestamp => {
    if (!timestamp) {return 'לא זמין';}
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('he-IL');
    } catch (e) {
      return timestamp;
    }
  },

  /**
     * Show notification message
     */
  showNotification: (message, type = 'info') => {
    // Use existing notification system if available
    if (window.notificationSystem) {
      window.notificationSystem.show(message, type);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    } else {
      // Fallback למקרה שמערכת התראות לא זמינה
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  },

  /**
     * Show loading state
     */
  showLoading: (elementId, show = true) => {
    const element = document.getElementById(elementId);
    if (!element) {return;}

    if (show) {
      element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> טוען...';
      element.classList.add('loading');
    } else {
      element.classList.remove('loading');
    }
  },

  /**
     * Format success rate percentage
     */
  formatSuccessRate: rate => {
    if (rate === null || rate === undefined) {return '0%';}
    return `${rate.toFixed(1)}%`;
  },
};

// API service
const apiService = {
  /**
     * Make API request with error handling
     */
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      utils.showNotification(`שגיאה בפנייה לשרת: ${error.message}`, 'error');
      throw error;
    }
  },

  /**
     * Get system status
     */
  async getStatus() {
    return await this.request(API_ENDPOINTS.status);
  },

  /**
     * Get tasks list
     */
  async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.tasks}?${queryString}` : API_ENDPOINTS.tasks;
    return await this.request(url);
  },

  /**
     * Get task details
     */
  async getTaskDetails(taskName) {
    return await this.request(API_ENDPOINTS.task.details(taskName));
  },

  /**
     * Execute task
     */
  async executeTask(taskName) {
    return await this.request(API_ENDPOINTS.task.execute(taskName), {
      method: 'POST',
    });
  },

  /**
     * Toggle task status
     */
  async toggleTask(taskName) {
    return await this.request(API_ENDPOINTS.task.toggle(taskName), {
      method: 'POST',
    });
  },

  /**
     * Start scheduler
     */
  async startScheduler() {
    return await this.request(API_ENDPOINTS.scheduler.start, {
      method: 'POST',
    });
  },

  /**
     * Stop scheduler
     */
  async stopScheduler() {
    return await this.request(API_ENDPOINTS.scheduler.stop, {
      method: 'POST',
    });
  },

  /**
     * Get execution history
     */
  async getHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.history}?${queryString}` : API_ENDPOINTS.history;
    return await this.request(url);
  },

  /**
     * Get analytics
     */
  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.analytics}?${queryString}` : API_ENDPOINTS.analytics;
    return await this.request(url);
  },
};

// UI Manager
const uiManager = {
  /**
     * Update system status display
     */
  updateStatus(status) {
    // Update scheduler status
    const schedulerStatus = document.getElementById('scheduler-status');
    if (schedulerStatus) {
      schedulerStatus.textContent = status.scheduler_running ? 'פועל' : 'עצור';
      schedulerStatus.className = `status-value ${status.scheduler_running ? 'running' : 'stopped'}`;
    }

    // Update performance metrics
    const metrics = status.performance_metrics || {};
    this.updateElement('total-tasks', metrics.total_tasks || 0);
    this.updateElement('enabled-tasks', metrics.enabled_tasks || 0);
    this.updateElement('running-tasks', metrics.running_tasks || 0);
    this.updateElement('success-rate', utils.formatSuccessRate(metrics.success_rate_overall));
    this.updateElement('total-executions', metrics.total_executions || 0);

    // Update button states
    this.updateSchedulerButtons(status.scheduler_running);
  },

  /**
     * Update scheduler button states
     */
  updateSchedulerButtons(isRunning) {
    const startBtn = document.getElementById('start-scheduler');
    const stopBtn = document.getElementById('stop-scheduler');

    if (startBtn) {startBtn.disabled = isRunning;}
    if (stopBtn) {stopBtn.disabled = !isRunning;}
  },

  /**
     * Update element text content
     */
  updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  },

  /**
     * Render tasks table
     */
  renderTasks(tasks) {
    const tbody = document.getElementById('tasks-tbody');
    if (!tbody) {return;}

    if (!tasks || tasks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="no-data">אין משימות זמינות</td></tr>';
      return;
    }

    tbody.innerHTML = tasks.map(task => `
            <tr>
                <td><strong>${task.name}</strong></td>
                <td>${task.description || 'אין תיאור'}</td>
                <td>${task.schedule_interval || 'N/A'}</td>
                <td>
                    <span class="task-status ${task.enabled ? 'enabled' : 'disabled'}">
                        ${task.enabled ? 'פעיל' : 'לא פעיל'}
                    </span>
                </td>
                <td>
                    ${task.last_run ? utils.formatTimestamp(task.last_run) : 'לא בוצע'}
                    ${task.last_duration_ms ? ` (${utils.formatDuration(task.last_duration_ms)})` : ''}
                </td>
                <td>${utils.formatSuccessRate(task.success_rate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-success" onclick="executeTask('${task.name}')" ${!task.enabled ? 'disabled' : ''}>
                            <i class="fas fa-play"></i> הפעל
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="toggleTask('${task.name}')">
                            <i class="fas fa-toggle-${task.enabled ? 'on' : 'off'}"></i>
                            ${task.enabled ? 'כבה' : 'הפעל'}
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="showTaskDetails('${task.name}')">
                            <i class="fas fa-info-circle"></i> פרטים
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
  },

  /**
     * Render history table
     */
  renderHistory(history) {
    const tbody = document.getElementById('history-tbody');
    if (!tbody) {return;}

    if (!history || history.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="no-data">אין היסטוריה זמינה</td></tr>';
      return;
    }

    tbody.innerHTML = history.map(entry => `
            <tr>
                <td>${utils.formatTimestamp(entry.timestamp)}</td>
                <td><strong>${entry.task_name}</strong></td>
                <td>
                    <span class="task-status ${entry.status === 'success' ? 'enabled' : 'disabled'}">
                        ${entry.status === 'success' ? 'הצלחה' : 'שגיאה'}
                    </span>
                </td>
                <td>${utils.formatDuration(entry.duration_ms || 0)}</td>
                <td>
                    ${entry.result ?
    `<span class="result-summary">${JSON.stringify(entry.result).substring(0, 50)}...</span>` :
    'אין תוצאה'
}
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showHistoryDetails('${entry.execution_id || entry.timestamp}')">
                        <i class="fas fa-eye"></i> צפה
                    </button>
                </td>
            </tr>
        `).join('');
  },

  /**
     * Render analytics
     */
  renderAnalytics(analytics) {
    // Update general stats
    this.updateElement('analytics-total-executions', analytics.total_executions || 0);
    this.updateElement('analytics-success-rate', utils.formatSuccessRate(analytics.success_rate));
    this.updateElement('analytics-avg-duration', utils.formatDuration(analytics.average_duration_ms || 0));

    // Render task performance chart
    this.renderTaskPerformanceChart(analytics.task_performance || {});
  },

  /**
     * Render task performance chart
     */
  renderTaskPerformanceChart(taskPerformance) {
    const chartContainer = document.getElementById('task-performance-chart');
    if (!chartContainer) {return;}

    if (Object.keys(taskPerformance).length === 0) {
      chartContainer.innerHTML = '<div class="no-data">אין נתוני ביצועים זמינים</div>';
      return;
    }

    const chartHtml = Object.entries(taskPerformance).map(([taskName, stats]) => `
            <div class="performance-item">
                <div class="performance-header">
                    <span class="task-name">${taskName}</span>
                    <span class="execution-count">${stats.executions} ביצועים</span>
                </div>
                <div class="performance-bar">
                    <div class="success-bar" style="width: ${stats.success_rate}%"></div>
                </div>
                <div class="performance-stats">
                    <span class="success-rate">${utils.formatSuccessRate(stats.success_rate)}</span>
                    <span class="avg-duration">${utils.formatDuration(stats.average_duration_ms)}</span>
                </div>
            </div>
        `).join('');

    chartContainer.innerHTML = `
            <div class="performance-chart">
                ${chartHtml}
            </div>
        `;
  },
};

// Modal Manager
const modalManager = {
  /**
     * Show task details modal
     */
  async showTaskDetails(taskName) {
    currentTaskName = taskName;
    const modal = document.getElementById('task-details-modal');
    const modalTaskName = document.getElementById('modal-task-name');
    const modalDetails = document.getElementById('modal-task-details');

    if (!modal || !modalTaskName || !modalDetails) {return;}

    // Update modal title
    modalTaskName.textContent = `פרטי משימה: ${taskName}`;

    // Show loading
    modalDetails.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> טוען פרטים...</div>';

    try {
      // Get task details
      const details = await apiService.getTaskDetails(taskName);

      // Render details
      modalDetails.innerHTML = this.renderTaskDetails(details);

      // Show modal
      modal.style.display = 'block';

    } catch (error) {
      modalDetails.innerHTML = `<div class="error-message">שגיאה בטעינת פרטי המשימה: ${error.message}</div>`;
      modal.style.display = 'block';
    }
  },

  /**
     * Render task details
     */
  renderTaskDetails(details) {
    return `
            <div class="task-details">
                <div class="detail-section">
                    <h4>מידע כללי</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">תיאור:</span>
                            <span class="detail-value">${details.description || 'אין תיאור'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">תזמון:</span>
                            <span class="detail-value">${details.schedule_interval || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">סטטוס:</span>
                            <span class="detail-value">
                                <span class="task-status ${details.enabled ? 'enabled' : 'disabled'}">
                                    ${details.enabled ? 'פעיל' : 'לא פעיל'}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>סטטיסטיקות</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">סה"כ ביצועים:</span>
                            <span class="detail-value">${details.run_count || 0}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">הצלחות:</span>
                            <span class="detail-value">${details.success_count || 0}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">שגיאות:</span>
                            <span class="detail-value">${details.error_count || 0}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">אחוז הצלחה:</span>
                            <span class="detail-value">${utils.formatSuccessRate(details.success_rate)}</span>
                        </div>
                    </div>
                </div>
                
                ${details.history && details.history.length > 0 ? `
                    <div class="detail-section">
                        <h4>היסטוריית ביצועים (24 שעות אחרונות)</h4>
                        <div class="history-list">
                            ${details.history.map(entry => `
                                <div class="history-item">
                                    <div class="history-time">${utils.formatTimestamp(entry.timestamp)}</div>
                                    <div class="history-status ${entry.status === 'success' ? 'success' : 'error'}">
                                        ${entry.status === 'success' ? 'הצלחה' : 'שגיאה'}
                                    </div>
                                    <div class="history-duration">${utils.formatDuration(entry.duration_ms || 0)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
  },

  /**
     * Close modal
     */
  closeModal() {
    const modal = document.getElementById('task-dasks-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    currentTaskName = null;
  },
};

// Event Handlers
const eventHandlers = {
  /**
     * Initialize event handlers
     */
  init() {
    // Scheduler controls
    document.getElementById('start-scheduler')?.addEventListener('click', this.startScheduler);
    document.getElementById('stop-scheduler')?.addEventListener('click', this.stopScheduler);
    document.getElementById('refresh-status')?.addEventListener('click', this.refreshStatus);

    // Task management
    document.getElementById('refresh-tasks')?.addEventListener('click', this.refreshTasks);
    document.getElementById('status-filter')?.addEventListener('change', this.applyTaskFilters);
    document.getElementById('type-filter')?.addEventListener('change', this.applyTaskFilters);

    // History management
    document.getElementById('refresh-history')?.addEventListener('click', this.refreshHistory);
    document.getElementById('history-hours')?.addEventListener('change', this.refreshHistory);
    document.getElementById('task-name-filter')?.addEventListener('input', this.applyHistoryFilters);
    document.getElementById('history-status-filter')?.addEventListener('change', this.applyHistoryFilters);

    // Analytics
    document.getElementById('refresh-analytics')?.addEventListener('click', this.refreshAnalytics);
    document.getElementById('analytics-period')?.addEventListener('change', this.refreshAnalytics);

    // Modal controls
    document.querySelector('.close')?.addEventListener('click', modalManager.closeModal);
    document.getElementById('modal-execute-task')?.addEventListener('click', this.executeModalTask);
    document.getElementById('modal-toggle-task')?.addEventListener('click', this.toggleModalTask);

    // Close modal when clicking outside
    window.addEventListener('click', event => {
      const modal = document.getElementById('task-details-modal');
      if (event.target === modal) {
        modalManager.closeModal();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        modalManager.closeModal();
      }
    });
  },

  /**
     * Start scheduler
     */
  async startScheduler() {
    try {
      utils.showLoading('start-scheduler', true);
      await apiService.startScheduler();
      utils.showNotification('Scheduler הופעל בהצלחה', 'success');
      await this.refreshStatus();
    } catch (error) {
      utils.showNotification(`שגיאה בהפעלת Scheduler: ${error.message}`, 'error');
    } finally {
      utils.showLoading('start-scheduler', false);
    }
  },

  /**
     * Stop scheduler
     */
  async stopScheduler() {
    try {
      utils.showLoading('stop-scheduler', true);
      await apiService.stopScheduler();
      utils.showNotification('Scheduler נעצר בהצלחה', 'success');
      await this.refreshStatus();
    } catch (error) {
      utils.showNotification(`שגיאה בעצירת Scheduler: ${error.message}`, 'error');
    } finally {
      utils.showLoading('stop-scheduler', false);
    }
  },

  /**
     * Refresh system status
     */
  async refreshStatus() {
    try {
      const status = await apiService.getStatus();
      uiManager.updateStatus(status);
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  },

  /**
     * Refresh tasks list
     */
  async refreshTasks() {
    try {
      utils.showLoading('refresh-tasks', true);
      const tasks = await apiService.getTasks();
      uiManager.renderTasks(tasks.tasks || []);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    } finally {
      utils.showLoading('refresh-tasks', false);
    }
  },

  /**
     * Apply task filters
     */
  async applyTaskFilters() {
    const statusFilter = document.getElementById('status-filter')?.value;
    const typeFilter = document.getElementById('type-filter')?.value;

    const params = {};
    if (statusFilter) {params.status = statusFilter;}
    if (typeFilter) {params.type = typeFilter;}

    try {
      const tasks = await apiService.getTasks(params);
      uiManager.renderTasks(tasks.tasks || []);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    }
  },

  /**
     * Refresh history
     */
  async refreshHistory() {
    try {
      utils.showLoading('refresh-history', true);
      const hours = document.getElementById('history-hours')?.value || 24;
      const history = await apiService.getHistory({ hours });
      uiManager.renderHistory(history.history || []);
    } catch (error) {
      console.error('Failed to refresh history:', error);
    } finally {
      utils.showLoading('refresh-history', false);
    }
  },

  /**
     * Apply history filters
     */
  async applyHistoryFilters() {
    const taskNameFilter = document.getElementById('task-name-filter')?.value;
    const statusFilter = document.getElementById('history-status-filter')?.value;
    const hours = document.getElementById('history-hours')?.value || 24;

    const params = { hours };
    if (taskNameFilter) {params.task_name = taskNameFilter;}
    if (statusFilter) {params.status = statusFilter;}

    try {
      const history = await apiService.getHistory(params);
      uiManager.renderHistory(history.history || []);
    } catch (error) {
      console.error('Failed to apply history filters:', error);
    }
  },

  /**
     * Refresh analytics
     */
  async refreshAnalytics() {
    try {
      utils.showLoading('refresh-analytics', true);
      const period = document.getElementById('analytics-period')?.value || '7d';
      const analytics = await apiService.getAnalytics({ period });
      uiManager.renderAnalytics(analytics);
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      utils.showLoading('refresh-analytics', false);
    }
  },

  /**
     * Execute task from modal
     */
  async executeModalTask() {
    if (!currentTaskName) {return;}

    try {
      await executeTask(currentTaskName);
      modalManager.closeModal();
    } catch (error) {
      console.error('Failed to execute modal task:', error);
    }
  },

  /**
     * Toggle task from modal
     */
  async toggleModalTask() {
    if (!currentTaskName) {return;}

    try {
      await toggleTask(currentTaskName);
      modalManager.closeModal();
      await this.refreshTasks();
    } catch (error) {
      console.error('Failed to toggle modal task:', error);
    }
  },
};

// Global functions for onclick handlers
window.executeTask = async function(taskName) {
  try {
    utils.showNotification(`מפעיל משימה: ${taskName}`, 'info');
    const result = await apiService.executeTask(taskName);
    utils.showNotification(`משימה ${taskName} הופעלה בהצלחה`, 'success');

    // Refresh data
    await eventHandlers.refreshStatus();
    await eventHandlers.refreshTasks();
    await eventHandlers.refreshHistory();
    await eventHandlers.refreshAnalytics();

    return result;
  } catch (error) {
    utils.showNotification(`שגיאה בהפעלת משימה ${taskName}: ${error.message}`, 'error');
    throw error;
  }
};

window.toggleTask = async function(taskName) {
  try {
    const result = await apiService.toggleTask(taskName);
    const newStatus = result.new_status ? 'הופעלה' : 'כובתה';
    utils.showNotification(`משימה ${taskName} ${newStatus} בהצלחה`, 'success');

    // Refresh data
    await eventHandlers.refreshStatus();
    await eventHandlers.refreshTasks();

    return result;
  } catch (error) {
    utils.showNotification(`שגיאה בשינוי סטטוס משימה ${taskName}: ${error.message}`, 'error');
    throw error;
  }
};

window.showTaskDetails = function(taskName) {
  modalManager.showTaskDetails(taskName);
};

window.showHistoryDetails = function(executionId) {
  // TODO: Implement history details modal
  utils.showNotification('פונקציונליות זו תתווסף בקרוב', 'info');
};

window.closeModal = function() {
  modalManager.closeModal();
};

// Auto-refresh functionality
const autoRefresh = {
  /**
     * Start auto-refresh
     */
  start() {
    if (refreshInterval) {return;}

    refreshInterval = setInterval(async () => {
      try {
        await eventHandlers.refreshStatus();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 30000); // Refresh every 30 seconds

    console.log('Auto-refresh started');
  },

  /**
     * Stop auto-refresh
     */
  stop() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
      console.log('Auto-refresh stopped');
    }
  },
};

// Main initialization
async function initializeBackgroundTasks() {
  try {
    console.log('Initializing Background Tasks Management...');

    // Initialize event handlers
    eventHandlers.init();

    // Load initial data
    await Promise.all([
      eventHandlers.refreshStatus(),
      eventHandlers.refreshTasks(),
      eventHandlers.refreshHistory(),
      eventHandlers.refreshAnalytics(),
    ]);

    // Start auto-refresh
    autoRefresh.start();

    console.log('Background Tasks Management initialized successfully');

  } catch (error) {
    console.error('Failed to initialize Background Tasks Management:', error);
    utils.showNotification('שגיאה באתחול מערכת ניהול המשימות', 'error');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBackgroundTasks);
} else {
  initializeBackgroundTasks();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    apiService,
    uiManager,
    modalManager,
    eventHandlers,
    utils,
  };
}
