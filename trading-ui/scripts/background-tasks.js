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


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeBackgroundTasks() - Initializebackgroundtasks

// === Other ===
// - copyDetailedLogLocal() - Copydetailedloglocal
// - generateDetailedLog() - Generatedetailedlog

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
const API_BASE = '/api/background-tasks';
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
      window.Logger?.debug(`${type.toUpperCase()}: ${message}`);
    }
  },

  /**
     * Show loading state
     */
  showLoading: async (elementId, show = true) => {
    const element = document.getElementById(elementId);
    if (!element) {return;}

    if (show) {
      // Use IconSystem to render loader icon
      // Use IconSystem if available
      let loaderIcon = '';
      if (window.IconSystem && typeof window.IconSystem.renderIcon === 'function') {
        loaderIcon = await window.IconSystem.renderIcon('tabler', 'loader', { size: '16', alt: 'loading', class: 'icon fa-spin me-1' });
      } else {
        loaderIcon = '<img src="/trading-ui/images/icons/tabler/loader.svg" width="16" height="16" alt="loading" class="icon fa-spin me-1">';
      }
      if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
        try {
          loaderIcon = await window.IconSystem.renderIcon('button', 'loader', {
            size: '16',
            alt: 'loading',
            class: 'icon fa-spin me-1'
          });
        } catch (error) {
          // Fallback already set
        }
      }
      element.textContent = '';
      const tempDiv = document.createElement('div');
      tempDiv.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(loaderIcon, 'text/html');
      doc.body.childNodes.forEach(node => {
        tempDiv.appendChild(node.cloneNode(true));
      });
      while (tempDiv.firstChild) {
        element.appendChild(tempDiv.firstChild);
      }
      element.appendChild(document.createTextNode(' טוען...'));
      element.classList.add('loading');
      element.disabled = true;
    } else {
      element.classList.remove('loading');
      element.disabled = false;
      // Restore original content based on element type
      if (elementId.includes('start-scheduler')) {
        element.textContent = 'התחל';
      } else if (elementId.includes('stop-scheduler')) {
        // Use IconSystem to render stop icon
        // Use IconSystem if available
        let stopIcon = '';
        if (window.IconSystem && typeof window.IconSystem.renderIcon === 'function') {
          stopIcon = await window.IconSystem.renderIcon('tabler', 'player-stop', { size: '16', alt: 'stop', class: 'icon me-1' });
        } else {
          stopIcon = '<img src="/trading-ui/images/icons/tabler/player-stop.svg" width="16" height="16" alt="stop" class="icon me-1">';
        }
        if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
          try {
            stopIcon = await window.IconSystem.renderIcon('button', 'stop', {
              size: '16',
              alt: 'stop',
              class: 'icon me-1'
            });
          } catch (error) {
            // Fallback already set
          }
        }
        element.textContent = '';
        const tempDiv = document.createElement('div');
        tempDiv.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(stopIcon, 'text/html');
        doc.body.childNodes.forEach(node => {
          tempDiv.appendChild(node.cloneNode(true));
        });
        while (tempDiv.firstChild) {
          element.appendChild(tempDiv.firstChild);
        }
        element.appendChild(document.createTextNode(' עצור Scheduler'));
      } else if (elementId.includes('refresh-')) {
        // Use IconSystem to render refresh icon
        // Use IconSystem if available
        let refreshIcon = '';
        if (window.IconSystem && typeof window.IconSystem.renderIcon === 'function') {
          refreshIcon = await window.IconSystem.renderIcon('tabler', 'refresh', { size: '16', alt: 'refresh', class: 'icon me-1' });
        } else {
          refreshIcon = '<img src="/trading-ui/images/icons/tabler/refresh.svg" width="16" height="16" alt="refresh" class="icon me-1">';
        }
        if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
          try {
            refreshIcon = await window.IconSystem.renderIcon('button', 'refresh', {
              size: '16',
              alt: 'refresh',
              class: 'icon me-1'
            });
          } catch (error) {
            // Fallback already set
          }
        }
        element.textContent = '';
        const parser = new DOMParser();
        const iconDoc = parser.parseFromString(refreshIcon, 'text/html');
        iconDoc.body.childNodes.forEach(node => {
          element.appendChild(node.cloneNode(true));
        });
        element.appendChild(document.createTextNode(' רענן'));
      }
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
      window.Logger?.debug('📡 API Request URL:', urlWithCacheBuster);

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
      window.Logger?.error('❌ API request failed:', error);
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
    
    // Update summary stats
    this.updateElement('schedulerStatusStats', status.scheduler_running ? 'פועל' : 'עצור');
    this.updateElement('enabledTasksStats', metrics.enabled_tasks || 0);
    this.updateElement('runningTasksStats', metrics.running_tasks || 0);
    this.updateElement('overallStatus', metrics.success_rate_overall ? `${metrics.success_rate_overall}%` : '0%');

    // Update button states
    this.updateSchedulerButtons(status.scheduler_running);
  },

  /**
     * Update scheduler button states
     */
  updateSchedulerButtons(isRunning) {
    const startBtn = document.getElementById('start-scheduler');
    const stopBtn = document.getElementById('stop-scheduler');

    if (startBtn && stopBtn) {
      if (isRunning) {
        // Scheduler is running - show only stop button
        startBtn.style.setProperty('display', 'none', 'important');
        stopBtn.style.setProperty('display', 'inline-block', 'important');
        stopBtn.textContent = 'עצור';
        stopBtn.disabled = false;
      } else {
        // Scheduler is stopped - show only start button
        startBtn.style.setProperty('display', 'inline-block', 'important');
        stopBtn.style.setProperty('display', 'none', 'important');
        startBtn.textContent = 'הפעל';
        startBtn.disabled = false;
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
    const tbody = document.querySelector('#tasks-table tbody');
    if (!tbody) {
      window.Logger?.error('❌ tasks-table tbody not found');
      return;
    }
    window.Logger?.debug('✅ Found tbody, rendering', tasks?.length || 0, 'tasks');

    if (!tasks || tasks.length === 0) {
      tbody.textContent = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 7;
      cell.className = 'no-data';
      cell.textContent = 'אין משימות זמינות';
      row.appendChild(cell);
      tbody.appendChild(row);
      return;
    }

    tbody.textContent = '';
    const tasksHTML = tasks.map(task => `
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
                <td class="actions-cell">
                    ${window.createActionsMenu ? window.createActionsMenu([
                        { type: 'PLAY', onclick: `executeTask('${task.name.replace(/'/g, "\\'")}')`, title: 'הפעל משימה' },
                        { type: task.enabled ? 'PAUSE' : 'PLAY', onclick: `toggleTask('${task.name.replace(/'/g, "\\'")}')`, title: task.enabled ? 'כבה משימה' : 'הפעל משימה' },
                        { type: 'STOP', onclick: `stopTask('${task.name.replace(/'/g, "\\'")}')`, title: 'עצור משימה' },
                        { type: 'VIEW', onclick: `showTaskDetails('${task.name.replace(/'/g, "\\'")}')`, title: 'פרטי משימה' }
                    ]) : `
                    <div class="action-buttons">
                        <button class="btn btn-sm" onclick="executeTask('${task.name.replace(/'/g, "\\'")}')" ${!task.enabled ? 'disabled' : ''} title="הפעל משימה">
                            ▶️
                        </button>
                        <button class="btn btn-sm" onclick="toggleTask('${task.name.replace(/'/g, "\\'")}')" title="${task.enabled ? 'כבה משימה' : 'הפעל משימה'}">
                            ${task.enabled ? '⏸️' : '▶️'}
                        </button>
                        <button class="btn btn-sm" onclick="stopTask('${task.name.replace(/'/g, "\\'")}')" ${!task.enabled ? 'disabled' : ''} title="עצור משימה">
                            ⏹️
                        </button>
                        <button class="btn btn-sm" onclick="showTaskDetails('${task.name.replace(/'/g, "\\'")}')" title="פרטי משימה">
                            ℹ️
                        </button>
                    </div>
                    `}
                </td>
            </tr>
        `).join('');
  },

  /**
     * Render history table
     */
  renderHistory(history) {
    // History UI elements not implemented yet - silently ignore
  },

  /**
     * Render analytics
     */
  renderAnalytics(analytics) {
    // Analytics UI elements not implemented yet - silently ignore
  },

  /**
     * Render task performance chart
     */
  renderTaskPerformanceChart(taskPerformance) {
    const chartContainer = document.getElementById('task-performance-chart');
    if (!chartContainer) {return;}

    if (Object.keys(taskPerformance).length === 0) {
      chartContainer.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'no-data';
        div.textContent = 'אין נתוני ביצועים זמינים';
        chartContainer.innerHTML.appendChild(div);
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

    chartContainer.textContent = '';
        // Convert HTML string to DOM elements safely
        const parser = new DOMParser();
        const doc = parser.parseFromString(`
            <div class="performance-chart">
                ${chartHtml}
            </div>
        `, 'text/html');
        const fragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => {
            fragment.appendChild(node.cloneNode(true));
        });
        chartContainer.appendChild(fragment);
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

    // Show loading - Use IconSystem to render loader icon
    let loaderIcon = '<img src="/trading-ui/images/icons/tabler/loader.svg" width="16" height="16" alt="loading" class="icon fa-spin me-1">';
    if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
      try {
        loaderIcon = await window.IconSystem.renderIcon('button', 'loader', {
          size: '16',
          alt: 'loading',
          class: 'icon fa-spin me-1'
        });
      } catch (error) {
        // Fallback already set
      }
    }
    modalDetails.textContent = '';
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-message';
    const parser = new DOMParser();
    const iconDoc = parser.parseFromString(loaderIcon, 'text/html');
    iconDoc.body.childNodes.forEach(node => {
      loadingDiv.appendChild(node.cloneNode(true));
    });
    loadingDiv.appendChild(document.createTextNode(' טוען פרטים...'));
    modalDetails.appendChild(loadingDiv);

    try {
      // Get task details
      const details = await apiService.getTaskDetails(taskName);

      // Render details
      modalDetails.textContent = '';
      const detailsHTML = this.renderTaskDetails(details);
      const parser = new DOMParser();
      const doc = parser.parseFromString(detailsHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
        modalDetails.appendChild(node.cloneNode(true));
      });

      // Show modal
      modal.style.display = 'block';

    } catch (error) {
      modalDetails.textContent = '';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = `שגיאה בטעינת פרטי המשימה: ${error.message}`;
      modalDetails.appendChild(errorDiv);
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
    window.Logger?.debug('🔧 EventHandlers init - fixing button connections 20250903-2050');

    // Check if buttons exist
    const startBtn = document.getElementById('start-scheduler');
    const stopBtn = document.getElementById('stop-scheduler');
    const refreshBtn = document.getElementById('refresh-status');

    window.Logger?.debug('🔍 Button check:', {
      startBtn: !!startBtn,
      stopBtn: !!stopBtn,
      refreshBtn: !!refreshBtn,
    });

    // Scheduler controls
    if (startBtn) {
      startBtn.addEventListener('click', eventHandlers.startScheduler);
      window.Logger?.debug('✅ Start scheduler button connected');
    } else {
      window.Logger?.error('❌ Start scheduler button not found!');
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', eventHandlers.stopScheduler);
      window.Logger?.debug('✅ Stop scheduler button connected');
    } else {
      window.Logger?.error('❌ Stop scheduler button not found!');
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', eventHandlers.refreshStatus);
      window.Logger?.debug('✅ Refresh status button connected');
    } else {
      window.Logger?.error('❌ Refresh status button not found!');
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
    try {
      await utils.showLoading('start-scheduler', true);
      const result = await apiService.startScheduler();
      utils.showNotification('Scheduler הופעל בהצלחה', 'success');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await eventHandlers.refreshStatus();
    } catch (error) {
      window.Logger?.error('❌ Error in startScheduler:', error);
      utils.showNotification(`שגיאה בהפעלת Scheduler: ${error.message}`, 'error');
    } finally {
      await utils.showLoading('start-scheduler', false);
    }
  },

  /**
     * Stop scheduler
     */
  async stopScheduler() {
    try {
      await utils.showLoading('stop-scheduler', true);
      const result = await apiService.stopScheduler();
      utils.showNotification('Scheduler נעצר בהצלחה', 'success');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await eventHandlers.refreshStatus();
      await eventHandlers.refreshTasks();
    } catch (error) {
      window.Logger?.error('❌ Error in stopScheduler:', error);
      utils.showNotification(`שגיאה בעצירת Scheduler: ${error.message}`, 'error');
    } finally {
      await utils.showLoading('stop-scheduler', false);
    }
  },

  /**
     * Refresh system status
     */
  async refreshStatus() {
    try {
      // Clear cache before refreshing to ensure fresh data
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        await window.UnifiedCacheManager.clear('memory');
        window.Logger?.debug('🧹 Cleared memory cache before refreshing status');
      }
      
      const response = await apiService.getStatus();
      const status = response.data || response;
      uiManager.updateStatus(status);
    } catch (error) {
      window.Logger?.error('❌ Failed to refresh status:', error);
      utils.showNotification('שגיאה בטעינת סטטוס המערכת', 'error');
    }
  },

  /**
     * Refresh tasks list
     */
  async refreshTasks() {
    try {
      await utils.showLoading('refresh-tasks', true);
      
      // Clear cache before refreshing to ensure fresh data
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        await window.UnifiedCacheManager.clear('memory');
        window.Logger?.debug('🧹 Cleared memory cache before refreshing tasks');
      }
      
      const response = await apiService.getTasks();
      const tasks = response.tasks || response.data?.tasks || [];
      window.Logger?.debug('📋 refreshTasks: received', tasks?.length || 0, 'tasks');
      uiManager.renderTasks(tasks);
    } catch (error) {
      window.Logger?.error('❌ Failed to refresh tasks:', error);
      utils.showNotification('שגיאה בטעינת רשימת המשימות', 'error');
    } finally {
      await utils.showLoading('refresh-tasks', false);
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
      // window.Logger?.error('Failed to apply filters:', error);
    }
  },

  /**
     * Refresh history
     */
  async refreshHistory() {
    try {
      await utils.showLoading('refresh-history', true);
      
      // Clear cache before refreshing to ensure fresh data
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        await window.UnifiedCacheManager.clear('memory');
        window.Logger?.debug('🧹 Cleared memory cache before refreshing history');
      }
      
      const hours = document.getElementById('history-hours')?.value || 24;
      const response = await apiService.getHistory({ hours });
      const history = response.history || response.data?.history || [];
      uiManager.renderHistory(history);
    } catch (error) {
      window.Logger?.error('❌ Failed to refresh history:', error);
      utils.showNotification('שגיאה בטעינת היסטוריית המשימות', 'error');
    } finally {
      await utils.showLoading('refresh-history', false);
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
      // window.Logger?.error('Failed to apply history filters:', error);
    }
  },

  /**
     * Refresh analytics
     */
  async refreshAnalytics() {
    try {
      await utils.showLoading('refresh-analytics', true);
      
      // Clear cache before refreshing to ensure fresh data
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        await window.UnifiedCacheManager.clear('memory');
        window.Logger?.debug('🧹 Cleared memory cache before refreshing analytics');
      }
      
      const period = document.getElementById('analytics-period')?.value || '7d';
      const response = await apiService.getAnalytics({ period });
      const analytics = response.data || response;
      uiManager.renderAnalytics(analytics);
    } catch (error) {
      window.Logger?.error('❌ Failed to refresh analytics:', error);
      utils.showNotification('שגיאה בטעינת אנליטיקס המשימות', 'error');
    } finally {
      await utils.showLoading('refresh-analytics', false);
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
      window.Logger?.error('Failed to execute modal task:', error);
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
      window.Logger?.error('Failed to toggle modal task:', error);
    }
  },
};

// Global functions for onclick handlers
window.executeTask = async function(taskName) {
  try {
    utils.showNotification(`מפעיל משימה: ${taskName}`, 'info');
    const result = await apiService.executeTask(taskName);
    utils.showNotification(`משימה ${taskName} הופעלה בהצלחה`, 'success');

    // Refresh data with delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    await eventHandlers.refreshTasks();
    await new Promise(resolve => setTimeout(resolve, 500));
    await eventHandlers.refreshHistory();

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

    // Refresh data with delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    await eventHandlers.refreshTasks();

    return result;
  } catch (error) {
    utils.showNotification(`שגיאה בשינוי סטטוס משימה ${taskName}: ${error.message}`, 'error');
    throw error;
  }
};

window.executeTask = async function(taskName) {
  try {
    utils.showNotification(`מפעיל משימה: ${taskName}`, 'info');
    const result = await apiService.executeTask(taskName);
    utils.showNotification(`משימה ${taskName} הופעלה בהצלחה`, 'success');

    // Refresh data with delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    await eventHandlers.refreshTasks();
    await new Promise(resolve => setTimeout(resolve, 500));
    await eventHandlers.refreshHistory();

    return result;
  } catch (error) {
    utils.showNotification(`שגיאה בהפעלת משימה ${taskName}: ${error.message}`, 'error');
    throw error;
  }
};

window.toggleTask = async function(taskName) {
  window.Logger?.debug('🔄 toggleTask called with:', taskName);
  try {
    const result = await apiService.toggleTask(taskName);
    window.Logger?.debug('✅ toggleTask result:', result);
    const newStatus = result.new_status ? 'הופעלה' : 'כובתה';
    utils.showNotification(`משימה ${taskName} ${newStatus} בהצלחה`, 'success');

    // Refresh data with delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    await eventHandlers.refreshTasks();
    await new Promise(resolve => setTimeout(resolve, 500));
    await eventHandlers.refreshHistory();

    return result;
  } catch (error) {
    window.Logger?.error('❌ toggleTask error:', error);
    utils.showNotification(`שגיאה בשינוי סטטוס משימה ${taskName}: ${error.message}`, 'error');
    throw error;
  }
};

window.stopTask = async function(taskName) {
  window.Logger?.debug('🛑 stopTask called with:', taskName);
  try {
    utils.showNotification(`עוצר משימה: ${taskName}`, 'info');
    
    // First disable the task
    const result = await apiService.toggleTask(taskName);
    window.Logger?.debug('✅ stopTask result:', result);
    
    if (result.new_status === false) {
      utils.showNotification(`משימה ${taskName} נעצרה בהצלחה`, 'success');
    } else {
      utils.showNotification(`משימה ${taskName} כבר לא פעילה`, 'warning');
    }

    // Refresh data with delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    await eventHandlers.refreshTasks();
    await new Promise(resolve => setTimeout(resolve, 500));
    await eventHandlers.refreshHistory();

    return result;
  } catch (error) {
    window.Logger?.error('❌ stopTask error:', error);
    utils.showNotification(`שגיאה בעצירת משימה ${taskName}: ${error.message}`, 'error');
    throw error;
  }
};

window.showTaskDetails = async function(taskName) {
  try {
    // Get task details from API
    const details = await apiService.getTaskDetails(taskName);
    
    // Format details for display
    const content = `
      <div class="task-details">
        <h5>פרטי משימה: ${taskName}</h5>
        <div class="details-grid">
          <div class="detail-item">
            <strong>שם:</strong> ${details.name || taskName}
          </div>
          <div class="detail-item">
            <strong>תיאור:</strong> ${details.description || 'אין תיאור'}
          </div>
          <div class="detail-item">
            <strong>תזמון:</strong> ${details.schedule_interval || 'N/A'}
          </div>
          <div class="detail-item">
            <strong>סטטוס:</strong> ${details.enabled ? 'פעיל' : 'לא פעיל'}
          </div>
          <div class="detail-item">
            <strong>ביצוע אחרון:</strong> ${details.last_run ? utils.formatTimestamp(details.last_run) : 'לא בוצע'}
          </div>
          <div class="detail-item">
            <strong>משך ביצוע:</strong> ${details.last_duration_ms ? utils.formatDuration(details.last_duration_ms) : 'N/A'}
          </div>
          <div class="detail-item">
            <strong>אחוז הצלחה:</strong> ${utils.formatSuccessRate(details.success_rate)}
          </div>
        </div>
      </div>
    `;
    
    // Show details modal using notification system
    window.showDetailsModal(`פרטי משימה: ${taskName}`, content);
    
  } catch (error) {
    utils.showNotification(`שגיאה בטעינת פרטי המשימה: ${error.message}`, 'error');
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

window.showHistoryDetails = function(executionId) {
  // TODO: Implement history details modal - ראה: CENTRAL_TASKS_TODO.md (משימה 5)
  utils.showNotification('פונקציונליות זו תתווסף בקרוב', 'info');
};

// window.closeModal removed - using global version from tables.js

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
        window.Logger?.error('Auto-refresh failed:', error);
      }
    }, 30000); // Refresh every 30 seconds

    window.Logger?.debug('Auto-refresh started');
  },

  /**
     * Stop auto-refresh
     */
  stop() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
      window.Logger?.debug('Auto-refresh stopped');
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
      window.Logger?.debug('=== לוג מפורט שהועתק ===');
      window.Logger?.debug(log);
      window.Logger?.debug('=== סוף הלוג ===');

    } catch (error) {
      window.Logger?.error('Failed to copy log:', error);
      utils.showNotification('שגיאה בהעתקת הלוג: ' + error.message, 'error');

      // Fallback: show in console
      const log = this.generateDetailedLog();
      window.Logger?.debug('=== לוג מפורט (לא הועתק) ===');
      window.Logger?.debug(log);
      window.Logger?.debug('=== סוף הלוג ===');
    }
  },
};

// Main initialization
async function initializeBackgroundTasks() {
  try {

    // Initialize event handlers
    eventHandlers.init();

    // Initialize real-time log listener

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
    const copyLogBtn = document.getElementById('Btn');
    if (copyLogBtn) {
      copyLogBtn.addEventListener('click', () => {
        detailedLogGenerator.copyDetailedLog();
      });
    }

    // Initialize background tasks log
    if (typeof window.initializeBackgroundTasksLog === 'function') {
      setTimeout(() => {
        window.initializeBackgroundTasksLog();
      }, 1000); // Wait 1 second for all systems to load
    }

    

  } catch (error) {
    window.Logger?.error('Failed to initialize Background Tasks Management:', error);
    utils.showNotification('שגיאה באתחול מערכת ניהול המשימות', 'error');
  }
}

// Initialize when DOM is ready
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', initializeBackgroundTasks);
// } else {
//   initializeBackgroundTasks();
// }

// Global functions for onclick handlers - Background Tasks specific
// Local  function for background-tasks page
function copyDetailedLogLocal() {
  if (typeof detailedLogGenerator !== 'undefined' && detailedLogGenerator.copyDetailedLog) {
    detailedLogGenerator.copyDetailedLog();
  } else {
    window.Logger?.error('❌ detailedLogGenerator לא זמין');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'מערכת לוג מפורט לא זמינה');
    }
  }
}

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

// window.toggleSection export removed - using global version from ui-utils.js

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






window.clearLog = function() {
  const logElement = document.getElementById('console-output');
  if (logElement) {
    logElement.textContent = '';
    window.Logger?.debug('Log cleared');
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

// ייצוא לגלובל scope
// window. export removed - using global version from system-management.js

/**
 * Register background_tasks table with UnifiedTableSystem
 */
window.registerBackgroundTasksTable = function() {
    if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
        // UnifiedTableSystem is optional - silently skip if not available
        if (window.Logger?.debug) {
          window.Logger.debug('UnifiedTableSystem not available for background_tasks registration (optional)', { page: 'background-tasks' });
        }
        return false;
    }

    const tableType = 'background_tasks';

    if (window.UnifiedTableSystem.registry.isRegistered && window.UnifiedTableSystem.registry.isRegistered(tableType)) {
        window.Logger?.debug?.('ℹ️ Background tasks table already registered', { page: 'background-tasks' });
        return true;
    }

    window.UnifiedTableSystem.registry.register(tableType, {
        dataGetter: () => {
            return window.backgroundTasksState?.tasks || [];
        },
        updateFunction: (data) => {
            if (window.backgroundTasksState && typeof window.backgroundTasksState.renderTasks === 'function') {
                window.backgroundTasksState.renderTasks(Array.isArray(data) ? data : []);
            }
        },
        tableSelector: '#tasks-table',
        columns: window.TABLE_COLUMN_MAPPINGS?.background_tasks || [],
        sortable: true,
        filterable: true,
        defaultSort: { columnIndex: 0, direction: 'asc' }
    });

    window.Logger?.info?.('✅ Registered background_tasks table with UnifiedTableSystem', { page: 'background-tasks' });
    return true;
};

// Auto-register when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (typeof window.registerBackgroundTasksTable === 'function') {
                window.registerBackgroundTasksTable();
            }
        }, 1000);
    });
} else {
    setTimeout(() => {
        if (typeof window.registerBackgroundTasksTable === 'function') {
            window.registerBackgroundTasksTable();
        }
    }, 1000);
}

// ===== REAL-TIME LOG LISTENER =====


