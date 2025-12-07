/**
 * System Management Error Handler - TikTrack
 * =========================================
 * 
 * Centralized error handling for system management sections
 * Provides professional error display and logging
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMErrorHandler {
  /**
   * Display error in section container
   * הצגת שגיאה בקונטיינר הסקשן
   */
  static display(error, container, context = {}) {
    if (!container) {
      console.error('❌ Cannot display error: container not provided');
      return;
    }

    const severity = this.getSeverity(error);
    const errorId = this.generateErrorId();
    
    // Log error for debugging
    this.logError(error, context, errorId);
    
    // Create error card HTML
    const errorCard = this.createErrorCard(error, context, severity, errorId);
    
    // Insert error card into container
    container.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(errorCard, 'text/html');
    doc.body.childNodes.forEach(node => {
      container.appendChild(node.cloneNode(true));
    });
    
    // Setup error card event listeners
    this.setupErrorCardListeners(errorId);
  }

  /**
   * Determine error severity
   * קביעת חומרת השגיאה
   */
  static getSeverity(error) {
    if (!error) return 'unknown';
    
    const message = error.message?.toLowerCase() || '';
    const status = error.status || error.statusCode || 0;
    
    // Critical errors
    if (status >= 500 || 
        message.includes('network') || 
        message.includes('connection') ||
        message.includes('timeout') ||
        message.includes('server error')) {
      return 'critical';
    }
    
    // Warning errors
    if (status >= 400 || 
        message.includes('not found') ||
        message.includes('unauthorized') ||
        message.includes('forbidden')) {
      return 'warning';
    }
    
    // Info errors
    if (status >= 300 || 
        message.includes('redirect') ||
        message.includes('cached')) {
      return 'info';
    }
    
    return 'unknown';
  }

  /**
   * Create error card HTML
   * יצירת HTML של כרטיס שגיאה
   */
  static createErrorCard(error, context, severity, errorId) {
    const severityConfig = this.getSeverityConfig(severity);
    const timestamp = new Date().toLocaleString('he-IL');
    
    return `
      <div class="sm-error-card error-${severity}" id="error-${errorId}">
        <div class="error-header">
          <div class="error-icon">
            <i class="fas ${severityConfig.icon}"></i>
          </div>
          <div class="error-title">
            <h4>${severityConfig.title}</h4>
            <span class="error-severity">${severityConfig.label}</span>
          </div>
          <div class="error-actions">
            <button class="error-close-btn" onclick="SMErrorHandler.closeError('${errorId}')" title="סגור">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="error-body">
          <div class="error-message">
            <strong>הודעת שגיאה:</strong>
            <p>${this.escapeHtml(error.message || 'שגיאה לא ידועה')}</p>
          </div>
          
          <div class="error-details">
            <div class="error-detail-item">
              <strong>סקשן:</strong>
              <span>${context.section || 'לא ידוע'}</span>
            </div>
            
            <div class="error-detail-item">
              <strong>פעולה:</strong>
              <span>${context.action || 'לא ידוע'}</span>
            </div>
            
            <div class="error-detail-item">
              <strong>זמן:</strong>
              <span>${context.timestamp || timestamp}</span>
            </div>
            
            ${context.url ? `
            <div class="error-detail-item">
              <strong>URL:</strong>
              <span>${context.url}</span>
            </div>
            ` : ''}
            
            ${error.status ? `
            <div class="error-detail-item">
              <strong>סטטוס HTTP:</strong>
              <span class="status-${this.getStatusClass(error.status)}">${error.status}</span>
            </div>
            ` : ''}
            
            <div class="error-detail-item">
              <strong>מזהה שגיאה:</strong>
              <span class="error-id">${errorId}</span>
            </div>
          </div>
          
          ${this.getTroubleshootingTips(severity)}
        </div>
        
        <div class="error-footer">
          <div class="error-actions">
            <button class="btn btn-primary btn-sm" onclick="SMErrorHandler.retrySection('${context.section}')" title="נסה לטעון שוב">
              <i class="fas fa-redo"></i> נסה שוב
            </button>
            <button class="btn btn-info btn-sm" onclick="SMErrorHandler.toggleDetails('${errorId}')" title="הצג/הסתר פרטים">
              <i class="fas fa-info-circle"></i> פרטים נוספים
            </button>
            <button class="btn btn-outline-secondary btn-sm" onclick="location.reload()" title="רענן את העמוד">
              <i class="fas fa-sync-alt"></i> רענן עמוד
            </button>
          </div>
        </div>
        <div class="error-details-expanded" id="error-details-${errorId}" style="display: none;">
          <div class="error-stack mt-3">
            <strong>Stack Trace:</strong>
            <pre class="bg-dark text-light p-2 rounded mt-2" style="max-height: 200px; overflow: auto;">${this.escapeHtml(error.stack || 'לא זמין')}</pre>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get severity configuration
   * קבלת הגדרות חומרה
   */
  static getSeverityConfig(severity) {
    const configs = {
      critical: {
        icon: 'fa-exclamation-triangle',
        title: 'שגיאה קריטית',
        label: 'CRITICAL',
        color: '#dc3545'
      },
      warning: {
        icon: 'fa-exclamation-circle',
        title: 'אזהרה',
        label: 'WARNING',
        color: '#ffc107'
      },
      info: {
        icon: 'fa-info-circle',
        title: 'מידע',
        label: 'INFO',
        color: '#17a2b8'
      },
      unknown: {
        icon: 'fa-question-circle',
        title: 'שגיאה לא ידועה',
        label: 'UNKNOWN',
        color: '#6c757d'
      }
    };
    
    return configs[severity] || configs.unknown;
  }

  /**
   * Get troubleshooting tips
   * קבלת טיפים לפתרון בעיות
   */
  static getTroubleshootingTips(severity) {
    const tips = {
      critical: `
        <div class="troubleshooting-tips">
          <h5>💡 טיפים לפתרון:</h5>
          <ul>
            <li>בדוק את חיבור האינטרנט</li>
            <li>ודא שהשרת פועל</li>
            <li>נסה לרענן את העמוד</li>
            <li>אם הבעיה נמשכת, פנה לתמיכה טכנית</li>
          </ul>
        </div>
      `,
      warning: `
        <div class="troubleshooting-tips">
          <h5>💡 טיפים לפתרון:</h5>
          <ul>
            <li>בדוק את ההרשאות שלך</li>
            <li>ודא שהנתונים קיימים</li>
            <li>נסה שוב בעוד כמה רגעים</li>
          </ul>
        </div>
      `,
      info: `
        <div class="troubleshooting-tips">
          <h5>ℹ️ מידע נוסף:</h5>
          <ul>
            <li>ייתכן שהנתונים זמנית לא זמינים</li>
            <li>המערכת מנסה לטעון נתונים חדשים</li>
          </ul>
        </div>
      `
    };
    
    return tips[severity] || tips.info;
  }

  /**
   * Setup error card event listeners
   * הגדרת מאזינים לכרטיס שגיאה
   */
  static setupErrorCardListeners(errorId) {
    // Auto-close error after 30 seconds for info level
    const errorCard = document.getElementById(`error-${errorId}`);
    if (errorCard && errorCard.classList.contains('error-info')) {
      setTimeout(() => {
        this.closeError(errorId);
      }, 30000);
    }
  }

  /**
   * Close error card
   * סגירת כרטיס שגיאה
   */
  static closeError(errorId) {
    const errorCard = document.getElementById(`error-${errorId}`);
    if (errorCard) {
      errorCard.remove();
    }
  }

  /**
   * Retry section
   * ניסיון חוזר של הסקשן
   */
  static retrySection(sectionId) {
    if (!sectionId) {
      console.warn('⚠️ Cannot retry: section ID not provided');
      return;
    }
    
    // Find the section instance and retry
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      // Trigger refresh button click
      const refreshBtn = document.querySelector(`[data-section="${sectionId}"]`);
      if (refreshBtn) {
        refreshBtn.click();
      }
    }
  }

  /**
   * Toggle detailed error information
   * החלפת הצגת פרטי שגיאה מפורטים
   */
  static toggleDetails(errorId) {
    const detailsElement = document.getElementById(`error-details-${errorId}`);
    if (detailsElement) {
      const isVisible = detailsElement.style.display !== 'none';
      detailsElement.style.display = isVisible ? 'none' : 'block';
    }
  }

  /**
   * Show detailed error information
   * הצגת פרטי שגיאה מפורטים
   */
  static showErrorDetails(errorId) {
    this.toggleDetails(errorId);
  }

  /**
   * Log error for debugging
   * רישום שגיאה לדיבוג
   */
  static logError(error, context, errorId) {
    const logData = {
      errorId,
      timestamp: new Date().toISOString(),
      section: context.section,
      action: context.action,
      error: {
        message: error.message,
        status: error.status,
        stack: error.stack
      },
      context
    };
    
    console.error('🚨 System Management Error:', logData);
    
    // Store in localStorage for debugging
    try {
      const errorLogs = JSON.parse(localStorage.getItem('sm-error-logs') || '[]');
      errorLogs.push(logData);
      
      // Keep only last 50 errors
      if (errorLogs.length > 50) {
        errorLogs.splice(0, errorLogs.length - 50);
      }
      
      localStorage.setItem('sm-error-logs', JSON.stringify(errorLogs));
    } catch (e) {
      console.warn('⚠️ Could not save error to localStorage:', e);
    }
  }

  /**
   * Generate unique error ID
   * יצירת מזהה שגיאה ייחודי
   */
  static generateErrorId() {
    return `sm-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get HTTP status CSS class
   * קבלת מחלקת CSS לסטטוס HTTP
   */
  static getStatusClass(status) {
    if (status >= 500) return 'error';
    if (status >= 400) return 'warning';
    if (status >= 300) return 'info';
    if (status >= 200) return 'success';
    return 'unknown';
  }

  /**
   * Escape HTML to prevent XSS
   * בריחה מ-HTML למניעת XSS
   */
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get error logs from localStorage
   * קבלת לוגי שגיאות מ-localStorage
   */
  static getErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('sm-error-logs') || '[]');
    } catch (e) {
      console.warn('⚠️ Could not retrieve error logs:', e);
      return [];
    }
  }

  /**
   * Clear error logs
   * מחיקת לוגי שגיאות
   */
  static clearErrorLogs() {
    localStorage.removeItem('sm-error-logs');
    console.log('🧹 Error logs cleared');
  }
}

// Export for use in other modules
window.SMErrorHandler = SMErrorHandler;
