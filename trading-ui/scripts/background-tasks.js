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

// Advanced logging system
window.consoleLogs = [];
window.errorLog = [];

// Enhanced logging system using notifications
const logSystem = {
  log: message => {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'info');
    }
  },
  error: message => {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'error');
    }
  },
  warn: message => {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'warning');
    }
  },
  info: message => {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'info');
    }
  },
};

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
    } catch {
      return timestamp;
    }
  },

  /**
     * Show notification message
     */
  showNotification: (message, type = 'info') => {
    // Use existing global notification system
    if (typeof window.showNotification === 'function') {
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
      // Add cache buster to all requests
      const separator = url.includes('?') ? '&' : '?';
      const urlWithCacheBuster = `${url}${separator}_t=${Date.now()}`;
      console.log('📡 API Request URL:', urlWithCacheBuster);

      const response = await fetch(urlWithCacheBuster, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API request failed:', error);
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
    console.log('🔧 Updating UI status:', status);

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
    console.log('🔧 Updating scheduler buttons, isRunning:', isRunning);
    const startBtn = document.getElementById('start-scheduler');
    const stopBtn = document.getElementById('stop-scheduler');

    if (startBtn && stopBtn) {
      if (isRunning) {
        // Scheduler is running - show only stop button
        startBtn.style.setProperty('display', 'none', 'important');
        stopBtn.style.setProperty('display', 'inline-block', 'important');
        stopBtn.innerHTML = '<i class="fas fa-stop me-1"></i> עצור Scheduler';
        stopBtn.disabled = false;
        console.log('🟢 Scheduler running - showing stop button');
      } else {
        // Scheduler is stopped - show only start button
        startBtn.style.setProperty('display', 'inline-block', 'important');
        stopBtn.style.setProperty('display', 'none', 'important');
        startBtn.innerHTML = '<i class="fas fa-play me-1"></i> הפעל Scheduler';
        startBtn.disabled = false;
        console.log('🔴 Scheduler stopped - showing start button');
      }
    }
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
                    <button class="btn btn-sm btn-primary" 
                            onclick="showHistoryDetails('${entry.execution_id || entry.timestamp}')">
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
    console.log('🔧 EventHandlers init - fixing button connections 20250903-2050');

    // Check if buttons exist
    const startBtn = document.getElementById('start-scheduler');
    const stopBtn = document.getElementById('stop-scheduler');
    const refreshBtn = document.getElementById('refresh-status');

    console.log('🔍 Button check:', {
      startBtn: !!startBtn,
      stopBtn: !!stopBtn,
      refreshBtn: !!refreshBtn,
    });

    // Scheduler controls
    if (startBtn) {
      startBtn.addEventListener('click', eventHandlers.startScheduler);
      console.log('✅ Start scheduler button connected');
    } else {
      console.error('❌ Start scheduler button not found!');
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', eventHandlers.stopScheduler);
      console.log('✅ Stop scheduler button connected');
    } else {
      console.error('❌ Stop scheduler button not found!');
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', eventHandlers.refreshStatus);
      console.log('✅ Refresh status button connected');
    } else {
      console.error('❌ Refresh status button not found!');
    }

    // Task management
    document.getElementById('refresh-tasks')?.addEventListener('click', eventHandlers.refreshTasks);
    document.getElementById('status-filter')?.addEventListener('change', eventHandlers.applyTaskFilters);
    document.getElementById('type-filter')?.addEventListener('change', eventHandlers.applyTaskFilters);

    // History management
    document.getElementById('refresh-history')?.addEventListener('click', eventHandlers.refreshHistory);
    document.getElementById('history-hours')?.addEventListener('change', eventHandlers.refreshHistory);
    document.getElementById('task-name-filter')?.addEventListener('input', eventHandlers.applyHistoryFilters);
    document.getElementById('history-status-filter')?.addEventListener('change', eventHandlers.applyHistoryFilters);

    // Analytics
    document.getElementById('refresh-analytics')?.addEventListener('click', eventHandlers.refreshAnalytics);
    document.getElementById('analytics-period')?.addEventListener('change', eventHandlers.refreshAnalytics);

    // Modal controls
    document.querySelector('.close')?.addEventListener('click', modalManager.closeModal);
    document.getElementById('modal-execute-task')?.addEventListener('click', eventHandlers.executeModalTask);
    document.getElementById('modal-toggle-task')?.addEventListener('click', eventHandlers.toggleModalTask);

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
    console.log('🚀 startScheduler clicked!');
    try {
      utils.showLoading('start-scheduler', true);
      console.log('📡 Calling API to start scheduler...');
      const result = await apiService.startScheduler();
      console.log('📡 Start scheduler API response:', result);
      utils.showNotification('Scheduler הופעל בהצלחה', 'success');
      console.log('🔄 Refreshing status after start...');
      // Wait a bit for server to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      await eventHandlers.refreshStatus();
      console.log('✅ startScheduler completed successfully');
    } catch (error) {
      console.error('❌ Error in startScheduler:', error);
      utils.showNotification(`שגיאה בהפעלת Scheduler: ${error.message}`, 'error');
    } finally {
      utils.showLoading('start-scheduler', false);
      console.log('🔄 startScheduler loading cleared');
    }
  },

  /**
     * Stop scheduler
     */
  async stopScheduler() {
    console.log('🛑 stopScheduler clicked!');
    try {
      utils.showLoading('stop-scheduler', true);
      console.log('📡 Calling API to stop scheduler...');
      const result = await apiService.stopScheduler();
      console.log('📡 Stop scheduler API response:', result);
      utils.showNotification('Scheduler נעצר בהצלחה', 'success');
      console.log('🔄 Refreshing status after stop...');
      // Wait a bit for server to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      await eventHandlers.refreshStatus();
      console.log('✅ stopScheduler completed successfully');
    } catch (error) {
      console.error('❌ Error in stopScheduler:', error);
      utils.showNotification(`שגיאה בעצירת Scheduler: ${error.message}`, 'error');
    } finally {
      utils.showLoading('stop-scheduler', false);
      console.log('🔄 stopScheduler loading cleared');
    }
  },

  /**
     * Refresh system status
     */
  async refreshStatus() {
    console.log('🔄 refreshStatus started');
    try {
      const status = await apiService.getStatus();
      console.log('📊 Status received:', status);
      uiManager.updateStatus(status);
      console.log('✅ refreshStatus completed');
    } catch (error) {
      console.error('❌ Failed to refresh status:', error);
    }
  },

  /**
     * Refresh tasks list
     */
  async refreshTasks() {
    console.log('🔄 refreshTasks started');
    try {
      utils.showLoading('refresh-tasks', true);
      const tasks = await apiService.getTasks();
      console.log('📋 Tasks received:', tasks);
      uiManager.renderTasks(tasks.tasks || []);
      console.log('✅ refreshTasks completed');
    } catch (error) {
      console.error('❌ Failed to refresh tasks:', error);
    } finally {
      utils.showLoading('refresh-tasks', false);
      console.log('🔄 refreshTasks loading cleared');
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
    } catch {
      // console.error('Failed to apply filters:', error);
    }
  },

  /**
     * Refresh history
     */
  async refreshHistory() {
    console.log('🔄 refreshHistory started');
    try {
      utils.showLoading('refresh-history', true);
      const hours = document.getElementById('history-hours')?.value || 24;
      const history = await apiService.getHistory({ hours });
      console.log('📜 History received:', history);
      uiManager.renderHistory(history.history || []);
      console.log('✅ refreshHistory completed');
    } catch (error) {
      console.error('❌ Failed to refresh history:', error);
    } finally {
      utils.showLoading('refresh-history', false);
      console.log('🔄 refreshHistory loading cleared');
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
    } catch {
      // console.error('Failed to apply history filters:', error);
    }
  },

  /**
     * Refresh analytics
     */
  async refreshAnalytics() {
    console.log('🔄 refreshAnalytics started');
    try {
      utils.showLoading('refresh-analytics', true);
      const period = document.getElementById('analytics-period')?.value || '7d';
      const analytics = await apiService.getAnalytics({ period });
      console.log('📊 Analytics received:', analytics);
      uiManager.renderAnalytics(analytics);
      console.log('✅ refreshAnalytics completed');
    } catch (error) {
      console.error('❌ Failed to refresh analytics:', error);
    } finally {
      utils.showLoading('refresh-analytics', false);
      console.log('🔄 refreshAnalytics loading cleared');
    }
  },

  /**
     * Execute task from modal
     */
  async executeModalTask() {
    if (!currentTaskName) {return;}

    try {
      await window.executeTask(currentTaskName);
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
      await window.toggleTask(currentTaskName);
      modalManager.closeModal();
      await eventHandlers.refreshTasks();
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
  // TODO: Implement history details modal - ראה: CENTRAL_TASKS_TODO.md (משימה 5)
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

// Detailed log generation and copying functionality
const detailedLogGenerator = {
  /**
   * Generate comprehensive log of all system status and tests
   */
  generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט של מערכת ניהול המשימות ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push('');

    // System Status
    log.push('--- מצב המערכת ---');
    const schedulerStatus = document.getElementById('scheduler-status')?.textContent || 'לא זמין';
    const totalTasks = document.getElementById('total-tasks')?.textContent || 'לא זמין';
    const enabledTasks = document.getElementById('enabled-tasks')?.textContent || 'לא זמין';
    const runningTasks = document.getElementById('running-tasks')?.textContent || 'לא זמין';
    const successRate = document.getElementById('success-rate')?.textContent || 'לא זמין';

    log.push(`סטטוס Scheduler: ${schedulerStatus}`);
    log.push(`סה"כ משימות: ${totalTasks}`);
    log.push(`משימות פעילות: ${enabledTasks}`);
    log.push(`משימות רצות: ${runningTasks}`);
    log.push(`אחוז הצלחה: ${successRate}`);
    log.push('');

    // Console Logs (last 20 entries)
    log.push('--- לוגים אחרונים מהקונסול ---');
    if (window.consoleLogs && window.consoleLogs.length > 0) {
      const recentLogs = window.consoleLogs.slice(-20);
      recentLogs.forEach(entry => {
        log.push(`[${entry.timestamp}] ${entry.level}: ${entry.message}`);
      });
    } else {
      log.push('אין לוגים זמינים בקונסול');
    }
    log.push('');

    // API Status
    log.push('--- סטטוס API ---');
    log.push(`API Base: ${API_BASE}`);
    log.push(`Server Time: ${new Date().toISOString()}`);
    log.push(`Local Time: ${new Date().toString()}`);
    log.push('');

    // Browser Information
    log.push('--- מידע על הדפדפן ---');
    log.push(`User Agent: ${navigator.userAgent}`);
    log.push(`Language: ${navigator.language}`);
    log.push(`Platform: ${navigator.platform}`);
    log.push(`Cookies Enabled: ${navigator.cookieEnabled}`);
    log.push('');

    // Page Elements Status
    log.push('--- סטטוס אלמנטי העמוד ---');
    const elements = [
      'scheduler-status', 'total-tasks', 'enabled-tasks', 'running-tasks',
      'success-rate', 'tasks-table', 'history-table', 'task-performance-chart',
    ];

    elements.forEach(elementId => {
      const element = document.getElementById(elementId);
      const status = element ? 'קיים' : 'חסר';
      const content = element ? element.textContent || element.innerHTML.substring(0, 50) : 'N/A';
      log.push(`${elementId}: ${status} - ${content}`);
    });
    log.push('');

    // Performance Information
    log.push('--- מידע על ביצועים ---');
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      log.push(`Memory Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      log.push(`Memory Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      log.push(`Memory Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    }

    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      log.push(`Page Load Time: ${loadTime}ms`);
    }
    log.push('');

    // Error Summary
    log.push('--- סיכום שגיאות ---');
    if (window.errorLog && window.errorLog.length > 0) {
      window.errorLog.forEach(error => {
        log.push(`שגיאה: ${error.message} - ${error.stack}`);
      });
    } else {
      log.push('אין שגיאות מתועדות');
    }
    log.push('');

    log.push('=== סוף הלוג ===');

    return log.join('\n');
  },

  /**
   * Copy detailed log to clipboard
   */
  async copyDetailedLog() {
    try {
      const log = this.generateDetailedLog();

      // Use existing clipboard system (like in external-data-dashboard.js)
      await navigator.clipboard.writeText(log);
      utils.showNotification('הלוג המפורט הועתק בהצלחה ללוח!', 'success');

      // Show log in console for easy access
      console.log('=== לוג מפורט שהועתק ===');
      console.log(log);
      console.log('=== סוף הלוג ===');

    } catch (error) {
      console.error('Failed to copy log:', error);
      utils.showNotification('שגיאה בהעתקת הלוג: ' + error.message, 'error');

      // Fallback: show in console
      const log = this.generateDetailedLog();
      console.log('=== לוג מפורט (לא הועתק) ===');
      console.log(log);
      console.log('=== סוף הלוג ===');
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

    // Initialize detailed log button
    const copyLogBtn = document.getElementById('copyDetailedLogBtn');
    if (copyLogBtn) {
      copyLogBtn.addEventListener('click', () => {
        detailedLogGenerator.copyDetailedLog();
      });
      console.log('Detailed log button initialized');
    }

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

// Global functions for onclick handlers - Background Tasks specific
window.copyDetailedLog = function() {
  detailedLogGenerator.copyDetailedLog();
};

window.toggleAllSections = function() {
  const sections = document.querySelectorAll('.content-section, .top-section .section-body');
  const toggleIcon = document.querySelector('.header-actions .section-toggle-icon');
  
  // Check if any section is open
  let anyOpen = false;
  sections.forEach(section => {
    const body = section.querySelector ? section.querySelector('.section-body') : section;
    if (body && body.style.display !== 'none') {
      anyOpen = true;
    }
  });
  
  // Toggle all sections
  const shouldShow = !anyOpen;
  
  sections.forEach(section => {
    const body = section.querySelector ? section.querySelector('.section-body') : section;
    const icon = section.querySelector ? section.querySelector('.section-toggle-icon') : null;
    if (body) {
      body.style.display = shouldShow ? 'block' : 'none';
    }
    if (icon) {
      icon.textContent = shouldShow ? '▼' : '▶';
    }
  });
  
  // Update main toggle icon
  if (toggleIcon) {
    toggleIcon.textContent = shouldShow ? '▼' : '▶';
  }
};

window.toggleSection = function(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  const body = section.querySelector('.section-body');
  const icon = section.querySelector('.section-toggle-icon');
  
  if (body) {
    const isHidden = body.style.display === 'none';
    body.style.display = isHidden ? 'block' : 'none';
    if (icon) {
      icon.textContent = isHidden ? '▼' : '▶';
    }
  }
};

window.startScheduler = function() {
  eventHandlers.startScheduler();
};

window.stopScheduler = function() {
  eventHandlers.stopScheduler();
};

window.refreshStatus = function() {
  eventHandlers.refreshStatus();
};

window.refreshTasks = function() {
  eventHandlers.refreshTasks();
};

window.refreshIndexedDBStats = async function() {
  try {
    console.log('📊 Refreshing IndexedDB stats...');
    const data = await apiService.request('/api/indexeddb/stats');
    
    // Update UI with IndexedDB stats
    const updateElement = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };
    
    updateElement('indexeddb-size', data.total_size_mb.toFixed(1));
    updateElement('indexeddb-max-size', data.max_size_mb);
    updateElement('indexeddb-usage', data.usage_percentage.toFixed(1) + '%');
    updateElement('indexeddb-entries', data.total_entries);
    
    // Update progress bar color based on usage
    const usageElement = document.getElementById('indexeddb-usage');
    const usagePercent = data.usage_percentage;
    
    if (usagePercent < 60) {
      usageElement.className = 'badge bg-success fs-5';
    } else if (usagePercent < 80) {
      usageElement.className = 'badge bg-warning fs-5';
    } else {
      usageElement.className = 'badge bg-danger fs-5';
    }
    
    console.log(`✅ IndexedDB stats updated: ${data.total_size_mb.toFixed(1)}MB (${data.total_entries} entries)`);
    utils.showNotification('IndexedDB stats updated', 'success');
  } catch (error) {
    console.error('❌ Error updating IndexedDB stats:', error);
    utils.showNotification(`Error updating stats: ${error.message}`, 'error');
  }
};

window.manualIndexedDBCleanup = async function() {
  try {
    const maxSize = document.getElementById('maxSizeInput')?.value || '100';
    console.log(`🧹 Starting manual IndexedDB cleanup (max size: ${maxSize}MB)...`);
    
    const data = await apiService.request(`/api/indexeddb/cleanup/${maxSize}`, {
      method: 'POST'
    });
    
    console.log(`✅ IndexedDB cleanup completed: removed ${data.entries_removed} entries, freed ${data.space_freed_mb}MB`);
    utils.showNotification(
      `Cleanup completed: removed ${data.entries_removed} entries (${data.space_freed_mb}MB freed)`,
      'success'
    );
    
    // Refresh stats after cleanup
    setTimeout(window.refreshIndexedDBStats, 1000);
  } catch (error) {
    console.error('❌ Error in IndexedDB cleanup:', error);
    utils.showNotification(`Error in cleanup: ${error.message}`, 'error');
  }
};

window.createIndexedDBBackup = async function() {
  try {
    console.log('💾 Creating IndexedDB backup...');
    const data = await apiService.request('/api/indexeddb/backup');
    
    console.log(`✅ Backup created: ${data.backup_file}`);
    utils.showNotification(`Backup created: ${data.backup_file}`, 'success');
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    utils.showNotification(`Error creating backup: ${error.message}`, 'error');
  }
};

window.restoreIndexedDBBackup = async function() {
  try {
    const backupFile = prompt('Enter backup file name:', 'indexeddb_backup_20250118.json');
    if (!backupFile) return;
    
    console.log(`🔄 Restoring from backup: ${backupFile}...`);
    
    const data = await apiService.request('/api/indexeddb/restore', {
      method: 'POST',
      body: JSON.stringify({ backup_file: backupFile }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`✅ Restore completed: restored ${data.entries_restored} entries`);
    utils.showNotification(
      `Restore completed: restored ${data.entries_restored} entries`,
      'success'
    );
    
    // Refresh stats after restore
    setTimeout(window.refreshIndexedDBStats, 1000);
  } catch (error) {
    console.error('❌ Error restoring from backup:', error);
    utils.showNotification(`Error restoring: ${error.message}`, 'error');
  }
};

window.clearAllIndexedDB = async function() {
  if (!confirm('⚠️ Are you sure you want to clear all IndexedDB?\nThis action will permanently delete all data!')) {
    return;
  }
  
  try {
    console.log('🗑️ Clearing all IndexedDB...');
    const data = await apiService.request('/api/indexeddb/clear', {
      method: 'POST'
    });
    
    console.log(`✅ IndexedDB cleared: removed ${data.databases_cleared} databases`);
    utils.showNotification(
      `IndexedDB cleared: removed ${data.databases_cleared} databases`,
      'warning'
    );
    
    // Refresh stats after clear
    setTimeout(window.refreshIndexedDBStats, 1000);
  } catch (error) {
    console.error('❌ Error clearing IndexedDB:', error);
    utils.showNotification(`Error clearing: ${error.message}`, 'error');
  }
};

window.clearLog = function() {
  const logElement = document.getElementById('console-output');
  if (logElement) {
    logElement.textContent = '';
    console.log('Log cleared');
  }
};

window.stopTask = async function(taskName) {
  try {
    console.log(`🛑 Stopping task: ${taskName}`);
    await apiService.request(`/api/v1/background-tasks/tasks/${taskName}/stop`, {
      method: 'POST'
    });
    console.log(`✅ Task ${taskName} stopped successfully`);
    utils.showNotification(`Task ${taskName} stopped successfully`, 'success');
    setTimeout(window.refreshStatus, 2000);
  } catch (error) {
    console.error(`❌ Error stopping task ${taskName}:`, error);
    utils.showNotification(`Error stopping task: ${error.message}`, 'error');
  }
};

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

/**
 * Generate detailed log for Background Tasks
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - ניהול משימות רקע ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // סטטוס כללי
    log.push('--- סטטוס כללי ---');
    const topSection = document.querySelector('.top-section .section-body');
    const isTopOpen = topSection && topSection.style.display !== 'none';
    log.push(`סקשן עליון: ${isTopOpen ? 'פתוח' : 'סגור'}`);
    
    // תצוגה מפורטת לפי סקשנים
    log.push('--- תצוגה מפורטת לפי סקשנים ---');
    
    // סקשן עליון - סטטיסטיקות משימות
    const taskStats = document.querySelectorAll('.task-stat');
    taskStats.forEach((stat, index) => {
        const label = stat.querySelector('.stat-label')?.textContent || 'לא זמין';
        const value = stat.querySelector('.stat-value')?.textContent || 'לא זמין';
        log.push(`סטטיסטיקה ${index + 1}: ${label} = "${value}"`);
    });

    // טבלאות ונתונים
    log.push('--- טבלאות ונתונים ---');
    const taskRows = document.querySelectorAll('.task-row');
    taskRows.forEach((row, index) => {
        const taskName = row.querySelector('.task-name')?.textContent || 'לא זמין';
        const status = row.querySelector('.task-status')?.textContent || 'לא זמין';
        const lastRun = row.querySelector('.task-last-run')?.textContent || 'לא זמין';
        log.push(`משימה ${index + 1}: ${taskName} | סטטוס: ${status} | הרצה אחרונה: ${lastRun}`);
    });

    // סטטיסטיקות וביצועים
    log.push('--- סטטיסטיקות וביצועים ---');
    log.push(`זמן טעינת עמוד: ${Date.now() - performance.timing.navigationStart}ms`);
    if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        log.push(`זיכרון בשימוש: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    }

    // לוגים ושגיאות
    log.push('--- לוגים ושגיאות ---');
    if (window.consoleLogs && window.consoleLogs.length > 0) {
        const recentLogs = window.consoleLogs.slice(-10);
        recentLogs.forEach(entry => {
            log.push(`[${entry.timestamp}] ${entry.level}: ${entry.message}`);
        });
    } else {
        log.push('אין לוגים זמינים');
    }

    // מידע טכני
    log.push('--- מידע טכני ---');
    log.push(`User Agent: ${navigator.userAgent}`);
    log.push(`Language: ${navigator.language}`);
    log.push(`Platform: ${navigator.platform}`);

    log.push('=== סוף הלוג ===');
    return log.join('\n');
}

/**
 * Copy detailed log to clipboard
 */
async function copyDetailedLog() {
    try {
        const log = generateDetailedLog();
        await navigator.clipboard.writeText(log);
        window.showNotification('הלוג המפורט הועתק בהצלחה ללוח!', 'success');
        console.log('=== לוג מפורט שהועתק ===');
        console.log(log);
        console.log('=== סוף הלוג ===');
    } catch (error) {
        console.error('Failed to copy log:', error);
        window.showNotification('שגיאה בהעתקת הלוג: ' + error.message, 'error');
        // Fallback: show in console
        const log = generateDetailedLog();
        console.log('=== לוג מפורט (לא הועתק) ===');
        console.log(log);
        console.log('=== סוף הלוג ===');
    }
}

// ייצוא לגלובל scope
window.copyDetailedLog = copyDetailedLog;
