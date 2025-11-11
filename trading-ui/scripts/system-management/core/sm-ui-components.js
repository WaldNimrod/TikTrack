/**
 * System Management UI Components - TikTrack
 * ========================================
 * 
 * Reusable UI components for system management sections
 * Provides consistent UI elements and patterns
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

function getCSSVariableValue(variableName, fallback) {
  try {
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
      if (value) {
        const trimmed = value.trim();
        if (trimmed) {
          return trimmed;
        }
      }
    }
  } catch (error) {
    window.Logger?.warn('⚠️ Failed to read CSS variable', { variableName, error }, { page: 'sm-ui-components' });
  }
  return fallback;
}

const SM_SEMANTIC_COLORS = {
  success: () => getCSSVariableValue('--color-success', '#28a745'),
  warning: () => getCSSVariableValue('--color-warning', '#ffc107'),
  danger: () => getCSSVariableValue('--color-danger', '#dc3545'),
  info: () => getCSSVariableValue('--color-info', '#17a2b8'),
  primary: () => getCSSVariableValue('--primary-color', '#26baac'),
  secondary: () => getCSSVariableValue('--numeric-zero-medium', '#6c757d')
};

class SMUIComponents {
  /**
   * Create a status card
   * יצירת כרטיס סטטוס
   */
  static createStatusCard(title, value, status = 'info', icon = null, subtitle = null) {
    const statusConfig = this.getStatusConfig(status);
    
    return `
      <div class="sm-status-card status-${status}">
        <div class="status-header">
          ${icon ? `<i class="fas ${icon}"></i>` : ''}
          <h5>${title}</h5>
        </div>
        <div class="status-body">
          <div class="status-value">${value}</div>
          ${subtitle ? `<div class="status-subtitle">${subtitle}</div>` : ''}
        </div>
        <div class="status-indicator" style="background-color: ${statusConfig.color}"></div>
      </div>
    `;
  }

  /**
   * Create a metric card
   * יצירת כרטיס מדד
   */
  static createMetricCard(title, value, unit = '', trend = null, icon = null) {
    const trendClass = trend ? (trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-neutral') : '';
    const trendIcon = trend ? (trend > 0 ? 'fa-arrow-up' : trend < 0 ? 'fa-arrow-down' : 'fa-minus') : '';
    
    return `
      <div class="sm-metric-card ${trendClass}">
        <div class="metric-header">
          ${icon ? `<i class="fas ${icon}"></i>` : ''}
          <h6>${title}</h6>
        </div>
        <div class="metric-body">
          <div class="metric-value">
            ${value}
            ${unit ? `<span class="metric-unit">${unit}</span>` : ''}
          </div>
          ${trend !== null ? `
            <div class="metric-trend">
              <i class="fas ${trendIcon}"></i>
              <span>${Math.abs(trend)}%</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create a progress bar
   * יצירת פס התקדמות
   */
  static createProgressBar(value, max = 100, label = '', color = null) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const barColor = color || this.getProgressColor(percentage);
    
    return `
      <div class="sm-progress-container">
        ${label ? `<div class="progress-label">${label}</div>` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%; background-color: ${barColor};"></div>
        </div>
        <div class="progress-text">${value}/${max} (${percentage.toFixed(1)}%)</div>
      </div>
    `;
  }

  /**
   * Create a data table
   * יצירת טבלת נתונים
   */
  static createDataTable(headers, rows, options = {}) {
    const {
      striped = true,
      bordered = true,
      hover = true,
      responsive = true,
      emptyMessage = 'אין נתונים להצגה'
    } = options;
    
    const tableClasses = [
      'table',
      striped && 'table-striped',
      bordered && 'table-bordered',
      hover && 'table-hover'
    ].filter(Boolean).join(' ');
    
    const tableHtml = `
      <div class="table-responsive">
        <table class="${tableClasses}">
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.length > 0 ? 
              rows.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell}</td>`).join('')}
                </tr>
              `).join('') :
              `<tr><td colspan="${headers.length}" class="text-center text-muted">${emptyMessage}</td></tr>`
            }
          </tbody>
        </table>
      </div>
    `;
    
    return responsive ? tableHtml : `<table class="${tableClasses}">${tableHtml}</table>`;
  }

  /**
   * Create a button group
   * יצירת קבוצת כפתורים
   */
  static createButtonGroup(buttons, options = {}) {
    const {
      size = 'sm',
      variant = 'outline',
      direction = 'horizontal'
    } = options;
    
    const buttonClasses = `btn-group ${direction === 'vertical' ? 'btn-group-vertical' : ''}`;
    
    return `
      <div class="${buttonClasses}" role="group">
        ${buttons.map(button => `
          <button type="button" 
                  class="btn btn-${variant} btn-${size} ${button.className || ''}"
                  ${button.onclick ? `onclick="${button.onclick}"` : ''}
                  ${button.title ? `title="${button.title}"` : ''}
                  ${button.disabled ? 'disabled' : ''}>
            ${button.icon ? `<i class="fas ${button.icon}"></i>` : ''}
            ${button.text || ''}
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * Create an alert box
   * יצירת קופסת התראה
   */
  static createAlert(message, type = 'info', dismissible = true) {
    const typeConfig = this.getAlertConfig(type);
    
    return `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <i class="fas ${typeConfig.icon}"></i>
        <span>${message}</span>
        ${dismissible ? `
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="סגור">
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Create a loading spinner
   * יצירת ספינר טעינה
   */
  static createLoadingSpinner(text = 'טוען...', size = 'medium') {
    const sizeClass = size === 'small' ? 'fa-sm' : size === 'large' ? 'fa-lg' : '';
    
    return `
      <div class="sm-loading-spinner">
        <div class="spinner-container">
          <i class="fas fa-spinner fa-spin ${sizeClass}"></i>
        </div>
        <div class="spinner-text">${text}</div>
      </div>
    `;
  }

  /**
   * Create a badge
   * יצירת תג
   */
  static createBadge(text, variant = 'secondary', size = 'normal') {
    const sizeClass = size === 'small' ? 'badge-sm' : size === 'large' ? 'badge-lg' : '';
    
    return `<span class="badge bg-${variant} ${sizeClass}">${text}</span>`;
  }

  /**
   * Create a card container
   * יצירת קונטיינר כרטיס
   */
  static createCard(title, content, options = {}) {
    const {
      headerIcon = null,
      headerActions = null,
      footer = null,
      className = '',
      collapsible = false
    } = options;
    
    const cardId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return `
      <div class="card ${className}" id="${cardId}">
        ${title ? `
          <div class="card-header">
            <div class="card-title">
              ${headerIcon ? `<i class="fas ${headerIcon}"></i>` : ''}
              <h5 class="mb-0">${title}</h5>
            </div>
            ${headerActions ? `<div class="card-actions">${headerActions}</div>` : ''}
            ${collapsible ? `
              <button class="card-toggle" data-bs-toggle="collapse" data-bs-target="#${cardId}-body">
                <i class="fas fa-chevron-down"></i>
              </button>
            ` : ''}
          </div>
        ` : ''}
        
        <div class="card-body ${collapsible ? 'collapse' : ''}" ${collapsible ? `id="${cardId}-body"` : ''}>
          ${content}
        </div>
        
        ${footer ? `<div class="card-footer">${footer}</div>` : ''}
      </div>
    `;
  }

  /**
   * Create a stats grid
   * יצירת רשת סטטיסטיקות
   */
  static createStatsGrid(stats, columns = 4) {
    const colClass = this.getColumnClass(columns);
    
    return `
      <div class="row">
        ${stats.map(stat => `
          <div class="${colClass}">
            ${this.createStatusCard(
              stat.title,
              stat.value,
              stat.status || 'info',
              stat.icon,
              stat.subtitle
            )}
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Create a timeline
   * יצירת ציר זמן
   */
  static createTimeline(events) {
    return `
      <div class="sm-timeline">
        ${events.map((event, index) => `
          <div class="timeline-item">
            <div class="timeline-marker">
              <i class="fas ${event.icon || 'fa-circle'}"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h6>${event.title}</h6>
                <span class="timeline-time">${event.time}</span>
              </div>
              <div class="timeline-body">
                <p>${event.description}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Get status configuration
   * קבלת הגדרות סטטוס
   */
  static getStatusConfig(status) {
    const configs = {
      success: { color: SM_SEMANTIC_COLORS.success(), icon: 'fa-check-circle' },
      warning: { color: SM_SEMANTIC_COLORS.warning(), icon: 'fa-exclamation-triangle' },
      danger: { color: SM_SEMANTIC_COLORS.danger(), icon: 'fa-times-circle' },
      info: { color: SM_SEMANTIC_COLORS.info(), icon: 'fa-info-circle' },
      primary: { color: SM_SEMANTIC_COLORS.primary(), icon: 'fa-circle' },
      secondary: { color: SM_SEMANTIC_COLORS.secondary(), icon: 'fa-circle' }
    };
    
    return configs[status] || configs.info;
  }

  /**
   * Get alert configuration
   * קבלת הגדרות התראה
   */
  static getAlertConfig(type) {
    const configs = {
      success: { icon: 'fa-check-circle' },
      warning: { icon: 'fa-exclamation-triangle' },
      danger: { icon: 'fa-times-circle' },
      info: { icon: 'fa-info-circle' },
      primary: { icon: 'fa-info-circle' },
      secondary: { icon: 'fa-info-circle' }
    };
    
    return configs[type] || configs.info;
  }

  /**
   * Get progress bar color based on percentage
   * קבלת צבע פס התקדמות לפי אחוז
   */
  static getProgressColor(percentage) {
    if (percentage >= 90) return SM_SEMANTIC_COLORS.danger();
    if (percentage >= 75) return SM_SEMANTIC_COLORS.warning();
    if (percentage >= 50) return SM_SEMANTIC_COLORS.info();
    return SM_SEMANTIC_COLORS.success();
  }

  /**
   * Get Bootstrap column class
   * קבלת מחלקת עמודה של Bootstrap
   */
  static getColumnClass(columns) {
    const colMap = {
      1: 'col-12',
      2: 'col-md-6',
      3: 'col-md-4',
      4: 'col-md-3',
      6: 'col-md-2',
      12: 'col-md-1'
    };
    
    return colMap[columns] || 'col-md-3';
  }

  /**
   * Format number with thousands separator
   * עיצוב מספר עם מפריד אלפים
   */
  static formatNumber(number, decimals = 0) {
    return new Intl.NumberFormat('he-IL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  }

  /**
   * Format bytes to human readable format
   * עיצוב bytes לפורמט קריא
   */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format duration in milliseconds to human readable format
   * עיצוב משך זמן במילישניות לפורמט קריא
   */
  static formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  /**
   * Format timestamp to relative time
   * עיצוב חותם זמן לזמן יחסי
   */
  static formatRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return 'לפני רגע';
    if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    
    return date.toLocaleDateString('he-IL');
  }
}

// Export for use in other modules
window.SMUIComponents = SMUIComponents;
window.SMUIColorUtils = {
  get: (token, fallback) => SM_SEMANTIC_COLORS[token]?.() || getCSSVariableValue(token, fallback),
  getCSSVariableValue
};
