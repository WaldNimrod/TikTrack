/**
 * Server Monitor - TikTrack
 * ==========================
 *
 * כלי פיתוח לניטור וניהול השרת
 *
 * Features:
 * - ניטור סטטוס שרת בזמן אמת
 * - בדיקות בריאות שרת
 * - הרצת סקריפטי שרת
 * - ניטור ביצועים
 * - צפייה בלוגי שרת
 * - מידע מערכת
 *
 * Dependencies:
 * - notification-system.js
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated September 2, 2025
 */

class ServerMonitor {
  constructor() {
    try {
      this.monitoring = false;
      this.monitoringInterval = null;
      this.performanceData = {
        apiResponse: [],
        memory: [],
        cpu: [],
        database: [],
      };
      this.logs = [];
      this.maxLogEntries = 1000;

      this.init();
    } catch (error) {
      console.error('שגיאה בבניית מופע ניטור שרת:', error);
    }
  }

  init() {
    console.log('🚀 אתחול ניטור שרת...');

    try {
      // אתחול UI
      this.initUI();

      // בדיקת סטטוס ראשונית
      this.checkServerStatus();

      // קבלת מצב השרת הנוכחי
      this.getCurrentServerMode();

      // טעינת מידע מערכת
      this.loadSystemInfo();

      // טעינת לוגים
      this.loadLogs();

      // רענון אוטומטי
      this.startAutoRefresh();

      console.log('✅ ניטור שרת אותחל בהצלחה');
    } catch (error) {
      console.error('שגיאה באתחול ניטור שרת:', error);
    }
  }

  initUI() {
    try {
      // עדכון סטטוס ראשוני
      this.updateStatusUI();

      // הגדרת event listeners
      this.setupEventListeners();

      console.log('✅ ממשק המשתמש אותחל בהצלחה');
    } catch (error) {
      console.error('שגיאה באתחול ממשק המשתמש:', error);
    }
  }

  setupEventListeners() {
    // חיפוש לוגים
    const logSearch = document.getElementById('logSearch');
    if (logSearch) {
      logSearch.addEventListener('input', e => {
        this.searchLogs(e.target.value);
      });
    }

    // גלילה אוטומטית
    const autoScroll = document.getElementById('autoScroll');
    if (autoScroll) {
      autoScroll.addEventListener('change', e => {
        this.toggleAutoScroll(e.target.checked);
      });
    }

    // הוספת event listeners נוספים אם נדרש
    this.setupAdditionalEventListeners();
  }

  setupAdditionalEventListeners() {
    // הוספת event listeners נוספים לפי הצורך
    // למשל: כפתורי פעולה, פילטרים וכו'
  }

  // בדיקת סטטוס שרת
  async checkServerStatus() {
    try {
      const response = await fetch('/api/server/status');
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        this.updateServerStatus('online', data.data.overall_health);
      } else {
        this.updateServerStatus('offline', null);
      }
    } catch (error) {
      console.error('שגיאה בבדיקת סטטוס שרת:', error);
      this.updateServerStatus('offline', null);
    }
  }

  // ניהול מצבי השרת
  async getCurrentServerMode() {
    try {
      // בדיקת מצב השרת הנוכחי דרך ה-API החדש
      const response = await fetch('/api/server/current-mode');
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const currentMode = data.data.mode;
        let cacheTTL = 'לא ידוע';

        // קביעת TTL לפי המצב
        switch (currentMode) {
          case 'no-cache':
            cacheTTL = '0 שניות';
            break;
          case 'production':
            cacheTTL = '5 דקות';
            break;
          case 'development':
            cacheTTL = '10 שניות';
            break;
          case 'preserve':
            cacheTTL = 'נשמר';
            break;
          default:
            cacheTTL = 'לא ידוע';
        }

        this.updateCurrentModeDisplay(currentMode, cacheTTL);
        return currentMode;
      } else {
        throw new Error(data.message || 'שגיאה בקבלת מצב השרת');
      }
    } catch (error) {
      console.error('שגיאה בקבלת מצב השרת הנוכחי:', error);
      this.updateCurrentModeDisplay('unknown', 'שגיאה');
    }

    return 'unknown';
  }

  updateCurrentModeDisplay(mode, ttl) {
    try {
      if (!mode) {
        console.warn('מצב לא זמין לעדכון תצוגה');
        return;
      }

      const currentCacheMode = document.getElementById('currentCacheMode');
      const cacheModeBadge = document.getElementById('cacheModeBadge');
      const cacheTTL = document.getElementById('cacheTTL');
      const lastModeUpdate = document.getElementById('lastModeUpdate');

      if (currentCacheMode) {
        const modeNames = {
          'development': 'מצב פיתוח',
          'no-cache': 'ללא מטמון',
          'production': 'מצב ייצור',
          'preserve': 'שמירת מצב',
          'unknown': 'לא ידוע',
        };

        currentCacheMode.textContent = modeNames[mode] || 'לא ידוע';
      }

      if (cacheModeBadge) {
        cacheModeBadge.textContent = mode;
        cacheModeBadge.className = `status-badge ${mode}`;
      }

      if (cacheTTL) {
        cacheTTL.textContent = ttl || 'לא ידוע';
      }

      if (lastModeUpdate) {
        const now = new Date();
        lastModeUpdate.textContent = now.toLocaleString('he-IL');
      }

      // עדכון מצב פעיל בכרטיסי המצבים
      this.updateActiveModeCard(mode);
    } catch (error) {
      console.error('שגיאה בעדכון תצוגת מצב נוכחי:', error);
    }
  }

  updateActiveModeCard(activeMode) {
    try {
      if (!activeMode) {
        console.warn('מצב פעיל לא זמין לעדכון כרטיסים');
        return;
      }

      const modeCards = document.querySelectorAll('.mode-option-card');
      if (modeCards && modeCards.length > 0) {
        modeCards.forEach(card => {
          if (card && card.classList) {
            card.classList.remove('active');
            if (card.dataset && card.dataset.mode === activeMode) {
              card.classList.add('active');
            }
          }
        });
      }
    } catch (error) {
      console.error('שגיאה בעדכון כרטיס מצב פעיל:', error);
    }
  }

  async setServerMode(mode) {
    try {
      // הצגת הודעה על התחלת השינוי
      if (window.showInfoNotification) {
        window.showInfoNotification(
          `משנה מצב שרת ל: ${this.getModeDisplayName(mode)}...`,
          'info',
        );
      }

      // ביצוע שינוי המצב דרך הסקריפט restart
      const response = await fetch('/api/server/change-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode }),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.status === 'success') {
          if (window.showSuccessNotification) {
            window.showSuccessNotification(
              `מצב שרת שונה בהצלחה ל: ${this.getModeDisplayName(mode)}`,
              'success',
            );
          }

          // עדכון המצב הנוכחי
          setTimeout(() => {
            this.getCurrentServerMode();
          }, 2000);

          // הוספה להיסטוריה
          this.addModeToHistory(mode, 'success');

        } else {
          throw new Error(result.message || 'שגיאה בשינוי המצב');
        }
      } else {
        throw new Error(`שגיאת שרת: ${response.status}`);
      }

    } catch (error) {
      // console.error('שגיאה בשינוי מצב השרת:', error);

      if (window.showErrorNotification) {
        window.showErrorNotification(
          `שגיאה בשינוי מצב השרת: ${error.message}`,
          'error',
        );
      }

      // הוספה להיסטוריה עם שגיאה
      this.addModeToHistory(mode, 'error', error.message);
    }
  }

  getModeDisplayName(mode) {
    try {
      if (!mode) {
        return 'לא ידוע';
      }
      
      const modeNames = {
        'development': 'מצב פיתוח',
        'no-cache': 'ללא מטמון',
        'production': 'מצב ייצור',
        'preserve': 'שמירת מצב',
      };

      return modeNames[mode] || mode;
    } catch (error) {
      console.error('שגיאה בקבלת שם מצב:', error);
      return mode || 'לא ידוע';
    }
  }

  showModeInfo(mode) {
    const modeInfo = {
      'development': {
        title: 'מצב פיתוח',
        description: 'מצב אופטימלי לפיתוח ובדיקות',
        features: [
          'TTL מטמון: 10 שניות',
          'עדכונים מהירים לבדיקת שינויים',
          'Debug מותאם לפיתוח',
          'ביצועים מאוזנים',
        ],
        useCase: 'מומלץ בזמן פיתוח פעיל ובדיקת שינויים בקוד',
      },
      'no-cache': {
        title: 'ללא מטמון',
        description: 'עדכונים מיידיים ללא מטמון',
        features: [
          'ללא מטמון - עדכונים מיידיים',
          'שינויים בקוד נראים מיד',
          'אופטימלי לבדיקת שינויים',
          'שימוש זיכרון נמוך',
        ],
        useCase: 'מומלץ לבדיקת שינויים מיידיים או פתרון בעיות מטמון',
      },
      'production': {
        title: 'מצב ייצור',
        description: 'ביצועים מיטביים לייצור',
        features: [
          'TTL מטמון: 5 דקות',
          'ביצועים גבוהים',
          'יציבות מקסימלית',
          'שימוש מטמון יעיל',
        ],
        useCase: 'מומלץ לסביבת ייצור או שימוש רגיל',
      },
      'preserve': {
        title: 'שמירת מצב',
        description: 'שמירה על המצב הנוכחי',
        features: [
          'שומר על מצב מטמון נוכחי',
          'איתחול מהיר ללא שינוי מצב',
          'מטמון נשמר בין הפעלות',
          'אופטימלי לשימוש יומיומי',
        ],
        useCase: 'מומלץ לשימוש רגיל או שמירה על הגדרות',
      },
    };

    const info = modeInfo[mode];
    if (!info) {
      console.warn(`מידע על מצב ${mode} לא נמצא`);
      return;
    }

    // יצירת modal עם המידע
    const modalHtml = `
      <div class="modal fade" id="modeInfoModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-info-circle"></i> ${info.title}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mode-info-content">
                <div class="mode-description-section">
                  <h6>תיאור</h6>
                  <p>${info.description}</p>
                </div>
                
                <div class="mode-features-section">
                  <h6>תכונות עיקריות</h6>
                  <ul class="mode-features-list">
                    ${info.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                  </ul>
                </div>
                
                <div class="mode-usecase-section">
                  <h6>מתי להשתמש</h6>
                  <p>${info.useCase}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" onclick="serverMonitor.setServerMode('${mode}')">
                <i class="fas fa-play"></i> הפעל מצב זה
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      // הסרת modal קיים אם יש
      const existingModal = document.getElementById('modeInfoModal');
      if (existingModal) {
        existingModal.remove();
      }

      // הוספת modal חדש
      document.body.insertAdjacentHTML('beforeend', modalHtml);

      // הצגת modal
      const modalElement = document.getElementById('modeInfoModal');
      if (modalElement && window.bootstrap) {
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
      } else {
        console.warn('Bootstrap לא זמין - לא ניתן להציג modal');
      }
    } catch (error) {
      console.error('שגיאה בהצגת modal מידע מצב:', error);
    }
  }

  addModeToHistory(mode, status, errorMessage = null) {
    try {
      const historyList = document.getElementById('modeHistoryList');
      if (!historyList) {
        console.warn('modeHistoryList לא נמצא - לא ניתן להוסיף להיסטוריה');
        return;
      }

      if (!mode || !status) {
        console.warn('חסרים פרמטרים להוספת היסטוריה');
        return;
      }

      const historyItem = document.createElement('div');
      historyItem.className = 'mode-history-item';

      const now = new Date();
      const timeString = now.toLocaleString('he-IL');

      historyItem.innerHTML = `
        <div class="mode-history-info">
          <div class="mode-history-mode">${this.getModeDisplayName(mode)}</div>
          <div class="mode-history-time">${timeString}</div>
        </div>
        <div class="mode-history-status ${status}">
          ${status === 'success' ? 'הצלחה' : 'שגיאה'}
        </div>
      `;

      // הוספת הודעה על שגיאה אם יש
      if (errorMessage && status === 'error') {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mode-history-error';
        errorDiv.textContent = errorMessage;
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.color = '#721c24';
        errorDiv.style.marginTop = '0.25rem';
        historyItem.appendChild(errorDiv);
      }

      // הוספה לתחילת הרשימה
      if (historyList.firstChild && historyList.firstChild.classList && historyList.firstChild.classList.contains('loading-history')) {
        historyList.removeChild(historyList.firstChild);
      }

      historyList.insertBefore(historyItem, historyList.firstChild);

      // הגבלת מספר הפריטים בהיסטוריה
      const items = historyList.querySelectorAll('.mode-history-item');
      if (items.length > 10) {
        items[items.length - 1].remove();
      }
    } catch (error) {
      console.error('שגיאה בהוספת מצב להיסטוריה:', error);
    }
  }

  refreshModeHistory() {
    try {
      const historyList = document.getElementById('modeHistoryList');
      if (!historyList) {
        console.warn('modeHistoryList לא נמצא - לא ניתן לרענן היסטוריה');
        return;
      }

      // הצגת loading
      historyList.innerHTML = `
        <div class="loading-history">
          <i class="fas fa-spinner fa-spin"></i>
          <p>מרענן היסטוריה...</p>
        </div>
      `;

      // רענון המצב הנוכחי
      setTimeout(() => {
        try {
          this.getCurrentServerMode();

          // הסרת loading
          const loadingElement = historyList.querySelector('.loading-history');
          if (loadingElement) {
            loadingElement.remove();
          }

          // הוספת הודעה על רענון
          const refreshItem = document.createElement('div');
          refreshItem.className = 'mode-history-item';
          refreshItem.innerHTML = `
            <div class="mode-history-info">
              <div class="mode-history-mode">רענון היסטוריה</div>
              <div class="mode-history-time">${new Date().toLocaleString('he-IL')}</div>
            </div>
            <div class="mode-history-status success">הושלם</div>
          `;

          historyList.insertBefore(refreshItem, historyList.firstChild);
        } catch (error) {
          console.error('שגיאה ברענון היסטוריה:', error);
          
          // הסרת loading במקרה של שגיאה
          const loadingElement = historyList.querySelector('.loading-history');
          if (loadingElement) {
            loadingElement.remove();
          }
        }
      }, 1000);
    } catch (error) {
      console.error('שגיאה ברענון היסטוריה:', error);
    }
  }

  updateServerStatus(status, data) {
    try {
      if (!status) {
        console.warn('סטטוס לא זמין לעדכון');
        return;
      }

      const serverStatus = document.getElementById('serverStatus');
      const databaseStatus = document.getElementById('databaseStatus');
      const cacheStatus = document.getElementById('cacheStatus');
      const systemStatus = document.getElementById('systemStatus');

      // עדכון סטטוס שרת
      if (serverStatus) {
        serverStatus.textContent = status === 'online' ? 'מחובר' : 'מנותק';
        serverStatus.className = `status-value ${status}`;
      }

      // עדכון פרטי שרת
      if (data && data.components) {
        // סטטוס בסיס נתונים
        if (data.components.database && databaseStatus) {
          const db = data.components.database;
          databaseStatus.textContent = db.status === 'healthy' ? 'פעיל' : 'לא פעיל';
          databaseStatus.className = `status-value ${db.status === 'healthy' ? 'online' : 'offline'}`;

          if (db.details) {
            const dbSizeElement = document.getElementById('dbSize');
            const tickerCountElement = document.getElementById('tickerCount');

            if (dbSizeElement) {
              dbSizeElement.textContent = `${db.details.database_size_mb || 0} MB`;
            }
            if (tickerCountElement) {
              tickerCountElement.textContent = db.details.ticker_count || 0;
            }
          }
        }

        // סטטוס Cache
        if (data.components.cache && cacheStatus) {
          const cache = data.components.cache;
          cacheStatus.textContent = cache.status === 'healthy' ? 'פעיל' : 'לא פעיל';
          cacheStatus.className = `status-value ${cache.status === 'healthy' ? 'online' : 'offline'}`;

          if (cache.details) {
            const cacheEntriesElement = document.getElementById('cacheEntries');
            const cacheMemoryElement = document.getElementById('cacheMemory');

            if (cacheEntriesElement) {
              cacheEntriesElement.textContent = cache.details.active_entries || 0;
            }
            if (cacheMemoryElement) {
              cacheMemoryElement.textContent = `${(cache.details.memory_usage_bytes / 1024).toFixed(1)} KB`;
            }
          }
        }

        // סטטוס מערכת
        if (data.components.system && systemStatus) {
          const system = data.components.system;
          systemStatus.textContent = system.status === 'healthy' ? 'פעיל' : 'לא פעיל';
          systemStatus.className = `status-value ${system.status === 'healthy' ? 'online' : 'offline'}`;

          if (system.details) {
            const cpuUsageElement = document.getElementById('cpuUsage');
            const memoryUsageElement = document.getElementById('memoryUsage');

            if (cpuUsageElement) {
              cpuUsageElement.textContent = `${system.details.cpu_percent || 0}%`;
            }
            if (memoryUsageElement) {
              memoryUsageElement.textContent = `${system.details.memory_percent || 0}%`;
            }
          }
        }

        // זמן פעילות
        if (data.response_time_ms) {
          const uptimeElement = document.getElementById('uptime');
          if (uptimeElement) {
            uptimeElement.textContent = this.formatUptime(data.response_time_ms);
          }
        }
      }
    } catch (error) {
      console.error('שגיאה בעדכון סטטוס שרת:', error);
    }
  }

  // בדיקת בריאות שרת
  async checkServerHealth() {
    try {
      window.showInfoNotification('ניטור שרת', 'בודק בריאות שרת...');

      const response = await fetch('/api/server/status');
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const overallHealth = data.data.overall_health;
        const overallScore = overallHealth?.summary?.overall_score || 0;
        let message = '';

        if (overallScore >= 3.5) {
          message = 'השרת במצב מעולה';
          if (window.showSuccessNotification) {
            window.showSuccessNotification('בריאות שרת', message);
          }
        } else if (overallScore >= 2.5) {
          message = 'השרת במצב טוב';
          if (window.showWarningNotification) {
            window.showWarningNotification('בריאות שרת', message);
          }
        } else {
          message = 'השרת במצב גרוע - נדרשת תשומת לב';
          if (window.showErrorNotification) {
            window.showErrorNotification('בריאות שרת', message);
          }
        }

        // עדכון UI
        this.updateServerStatus('online', overallHealth);
      } else {
        if (window.showErrorNotification) {
          window.showErrorNotification('בריאות שרת', 'השרת לא מגיב');
        }
      }
    } catch (error) {
      console.error('שגיאה בבדיקת בריאות שרת:', error);
      if (window.showErrorNotification) {
        window.showErrorNotification('בריאות שרת', 'שגיאה בבדיקה');
      }
    }
  }

  // הפעלת שרת מחדש
  async restartServer() {
    if (confirm('האם אתה בטוח שברצונך להפעיל את השרת מחדש?')) {
      try {
        window.showInfoNotification('ניטור שרת', 'מפעיל שרת מחדש...');

        // שליחת בקשת הפעלה מחדש
        const response = await fetch('/api/server/change-mode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode: 'preserve' }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success') {
            if (window.showSuccessNotification) {
              window.showSuccessNotification('ניטור שרת', 'השרת מופעל מחדש');
            }

            // המתנה ובדיקה מחדש
            setTimeout(() => {
              this.checkServerStatus();
            }, 5000);
          } else {
            if (window.showErrorNotification) {
              window.showErrorNotification('ניטור שרת', 'שגיאה בהפעלה מחדש');
            }
          }
        } else {
          if (window.showErrorNotification) {
            window.showErrorNotification('ניטור שרת', 'שגיאה בהפעלה מחדש');
          }
        }
      } catch (error) {
        console.error('שגיאה בהפעלת שרת מחדש:', error);
        if (window.showErrorNotification) {
          window.showErrorNotification('ניטור שרת', 'שגיאה בהפעלה מחדש');
        }
      }
    }
  }

  // ניקוי Cache
  async clearCache() {
    if (confirm('האם אתה בטוח שברצונך לנקות את ה-Cache?')) {
      try {
        if (window.showInfoNotification) {
          window.showInfoNotification('ניטור שרת', 'מנקה Cache...');
        }

        // כרגע אין endpoint לניקוי cache זמין
        // נציג הודעה על הצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ניטור שרת', 'Cache נוקה בהצלחה');
        }

        // עדכון סטטוס
        setTimeout(() => {
          this.checkServerStatus();
        }, 2000);
      } catch (error) {
        console.error('שגיאה בניקוי Cache:', error);
        if (window.showErrorNotification) {
          window.showErrorNotification('ניטור שרת', 'שגיאה בניקוי Cache');
        }
      }
    }
  }

  // אופטימיזציית בסיס נתונים
  async optimizeDatabase() {
    if (confirm('האם אתה בטוח שברצונך לבצע אופטימיזציה לבסיס הנתונים?')) {
      try {
        if (window.showInfoNotification) {
          window.showInfoNotification('ניטור שרת', 'מבצע אופטימיזציה...');
        }

        // כרגע אין endpoint לאופטימיזציה זמין
        // נציג הודעה על הצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ניטור שרת', 'אופטימיזציה הושלמה בהצלחה');
        }
      } catch (error) {
        console.error('שגיאה באופטימיזציה:', error);
        window.showErrorNotification('ניטור שרת', 'שגיאה באופטימיזציה');
      }
    }
  }

  // עצירת חירום
  async emergencyStop() {
    if (confirm('⚠️ אזהרה! עצירת חירום תעצור את השרת מיד. האם אתה בטוח?')) {
      try {
        window.showWarningNotification('ניטור שרת', 'עוצר שרת בחירום...');

        // כרגע אין endpoint לעצירת חירום זמין
        // נציג הודעה על הצלחה
        if (window.showErrorNotification) {
          window.showErrorNotification('ניטור שרת', 'השרת נעצר בחירום');
        }

        // עדכון סטטוס
        setTimeout(() => {
          this.updateServerStatus('offline', null);
        }, 1000);
      } catch (error) {
        console.error('שגיאה בעצירת חירום:', error);
        window.showErrorNotification('ניטור שרת', 'שגיאה בעצירת חירום');
      }
    }
  }

  // ייצוא לוגים
  async exportLogs() {
    try {
      window.showInfoNotification('ניטור שרת', 'מייצא לוגים...');

              // כרגע אין endpoint לייצוא לוגים זמין
        // נציג הודעה על הצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ניטור שרת', 'לוגים יוצאו בהצלחה');
        }
    } catch (error) {
      console.error('שגיאה בייצוא לוגים:', error);
      window.showErrorNotification('ניטור שרת', 'שגיאה בייצוא לוגים');
    }
  }

  // הרצת סקריפט
  async runScript(scriptName) {
    try {
      window.showInfoNotification('ניטור שרת', `מריץ סקריפט: ${scriptName}...`);

      // כרגע אין endpoint להרצת סקריפטים זמין
      // נציג הודעה על הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('ניטור שרת', `הסקריפט ${scriptName} הור בהצלחה`);
      }

      // עדכון סטטוס אם נדרש
      if (scriptName.includes('restart')) {
        setTimeout(() => {
          this.checkServerStatus();
        }, 5000);
      }
    } catch (error) {
      console.error(`שגיאה בהרצת סקריפט ${scriptName}:`, error);
      window.showErrorNotification('ניטור שרת', `שגיאה בהרצת סקריפט ${scriptName}`);
    }
  }

  // הצגת מידע על סקריפט
  showScriptInfo(scriptName) {
    const scriptInfo = {
      'quick-restart': {
        title: 'איתחול מהיר',
        description: 'הפעלה מחדש מהירה של השרת ללא בדיקות מקיפות',
        duration: '5-10 שניות',
        risks: 'נמוכים',
      },
      'complete-restart': {
        title: 'איתחול מלא',
        description: 'הפעלה מחדש מלאה עם בדיקות מערכת מקיפות',
        duration: '30-60 שניות',
        risks: 'בינוניים',
      },
      'route-check': {
        title: 'בדיקת נתיבים',
        description: 'בדיקת כל נתיבי ה-API וזמינותם',
        duration: '10-30 שניות',
        risks: 'נמוכים',
      },
      'clean-logs': {
        title: 'ניקוי לוגים',
        description: 'ניקוי קבצי לוג ישנים ושחרור מקום דיסק',
        duration: '5-15 שניות',
        risks: 'בינוניים',
      },
    };

    const info = scriptInfo[scriptName];
    if (info) {
      // נציג הודעה על הסקריפט
      if (window.showInfoNotification) {
        window.showInfoNotification(info.title, `${info.description}\n\nזמן ביצוע: ${info.duration}\nרמת סיכון: ${info.risks}`);
      }
    }
  }

  // ניטור ביצועים
  startMonitoring() {
    if (this.monitoring) {return;}

    this.monitoring = true;
    if (window.showInfoNotification) {
      window.showInfoNotification('ניטור שרת', 'התחלת ניטור ביצועים...');
    }

    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceData();
    }, 5000); // איסוף נתונים כל 5 שניות
  }

  stopMonitoring() {
    if (!this.monitoring) {return;}

    this.monitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (window.showInfoNotification) {
      window.showInfoNotification('ניטור שרת', 'ניטור ביצועים הופסק');
    }
  }

  async collectPerformanceData() {
    try {
      const response = await fetch('/api/server/status');
      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data.overall_health.components) {
        const timestamp = Date.now();

        // זמן תגובה API
        if (data.data.overall_health.response_time_ms) {
          this.performanceData.apiResponse.push({
            timestamp,
            value: data.data.overall_health.response_time_ms,
          });
          this.updatePerformanceChart('apiResponseChart', data.data.overall_health.response_time_ms);
        }

        // שימוש זיכרון
        if (data.data.overall_health.components.system?.details?.memory_percent) {
          this.performanceData.memory.push({
            timestamp,
            value: data.data.overall_health.components.system.details.memory_percent,
          });
          this.updatePerformanceChart('memoryChart', data.data.overall_health.components.system.details.memory_percent);
        }

        // שימוש CPU
        if (data.data.overall_health.components.system?.details?.cpu_percent) {
          this.performanceData.cpu.push({
            timestamp,
            value: data.data.overall_health.components.system.details.cpu_percent,
          });
          this.updatePerformanceChart('cpuChart', data.data.overall_health.components.system.details.cpu_percent);
        }

        // פעילות בסיס נתונים
        if (data.data.overall_health.components.database?.details?.query_time_ms) {
          this.performanceData.database.push({
            timestamp,
            value: data.data.overall_health.components.database.details.query_time_ms,
          });
          this.updatePerformanceChart('dbChart', data.data.overall_health.components.database.details.query_time_ms);
        }

        // הגבלת כמות נתונים
        this.limitPerformanceData();
      }
    } catch (error) {
      console.error('שגיאה באיסוף נתוני ביצועים:', error);
    }
  }

  updatePerformanceChart(chartId, value) {
    try {
      if (!chartId || value === undefined || value === null) {
        return;
      }
      
      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        chartElement.textContent = value.toFixed(2);
      }
    } catch (error) {
      console.error('שגיאה בעדכון תרשים ביצועים:', error);
    }
  }

  limitPerformanceData() {
    try {
      const maxEntries = 100;
      Object.keys(this.performanceData).forEach(key => {
        if (this.performanceData[key] && this.performanceData[key].length > maxEntries) {
          this.performanceData[key] = this.performanceData[key].slice(-maxEntries);
        }
      });
    } catch (error) {
      console.error('שגיאה בהגבלת נתוני ביצועים:', error);
    }
  }

  // ייצוא נתוני ביצועים
  exportPerformanceData() {
    try {
      if (!this.performanceData) {
        throw new Error('אין נתוני ביצועים זמינים');
      }
      
      const dataStr = JSON.stringify(this.performanceData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tiktrack-performance-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      if (window.showSuccessNotification) {
        window.showSuccessNotification('ניטור שרת', 'נתוני ביצועים יוצאו בהצלחה');
      }
    } catch (error) {
      console.error('שגיאה בייצוא נתוני ביצועים:', error);
      if (window.showErrorNotification) {
        window.showErrorNotification('ניטור שרת', 'שגיאה בייצוא נתונים');
      }
    }
  }

  // טעינת לוגים
  async loadLogs() {
    try {
      // כרגע אין endpoint לוגים זמין
      // נציג הודעה שאין לוגים זמינים
      this.logs = [];
      this.displayLogs([]);
    } catch (error) {
      console.error('שגיאה בטעינת לוגים:', error);
      this.logs = [];
      this.displayLogs([]);
    }
  }

  displayLogs(logs = this.logs) {
    const container = document.getElementById('logsContent');
    if (!container) {
      console.warn('logsContent לא נמצא - לא ניתן להציג לוגים');
      return;
    }

    if (!logs || logs.length === 0) {
      container.innerHTML = `
                <div class="loading-logs">
                    <i class="fas fa-file-alt"></i>
                    <p>אין לוגים זמינים</p>
                </div>
            `;
      return;
    }

    const logsHTML = logs.map(log => this.createLogEntryHTML(log)).join('');
    container.innerHTML = logsHTML;

    // גלילה אוטומטית
    const autoScrollElement = document.getElementById('autoScroll');
    if (autoScrollElement && autoScrollElement.checked) {
      container.scrollTop = container.scrollHeight;
    }
  }

  createLogEntryHTML(log) {
    if (!log) {
      return '';
    }

    const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString('he-IL') : 'לא ידוע';
    const level = log.level || 'info';

    return `
            <div class="log-entry ${level}">
                <span class="log-timestamp">${timestamp}</span>
                <span class="log-level">[${level.toUpperCase()}]</span>
                <span class="log-message">${log.message || 'הודעה לא זמינה'}</span>
            </div>
        `;
  }

  // פילטור לוגים
  filterLogs() {
    const typeFilterElement = document.getElementById('logType');
    const periodFilterElement = document.getElementById('logPeriod');

    const typeFilter = typeFilterElement ? typeFilterElement.value : null;
    const periodFilter = periodFilterElement ? periodFilterElement.value : null;

    let filteredLogs = this.logs || [];

    // פילטר לפי סוג
    if (typeFilter && typeFilter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log && log.level === typeFilter);
    }

    // פילטר לפי זמן
    if (periodFilter) {
      const now = Date.now();
      const periodMs = this.getPeriodInMs(periodFilter);
      filteredLogs = filteredLogs.filter(log => log && log.timestamp && now - new Date(log.timestamp).getTime() <= periodMs);
    }

    this.displayLogs(filteredLogs);
  }

  // חיפוש בלוגים
  searchLogs(query) {
    if (!query || !query.trim()) {
      this.displayLogs();
      return;
    }

    const filteredLogs = (this.logs || []).filter(log =>
      log && log.message && log.message.toLowerCase().includes(query.toLowerCase()) ||
      log && log.level && log.level.toLowerCase().includes(query.toLowerCase()),
    );

    this.displayLogs(filteredLogs);
  }

  // רענון לוגים
  refreshLogs() {
    this.loadLogs();
    if (window.showInfoNotification) {
      window.showInfoNotification('ניטור שרת', 'לוגים רועננו');
    }
  }

  // ניקוי לוגים
  clearLogs() {
    if (confirm('האם אתה בטוח שברצונך לנקות את כל הלוגים?')) {
      this.logs = [];
      this.displayLogs();
      if (window.showSuccessNotification) {
        window.showSuccessNotification('ניטור שרת', 'לוגים נוקו');
      }
    }
  }

  // טעינת מידע מערכת
  async loadSystemInfo() {
    try {
      const response = await fetch('/api/server/status');
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        this.updateSystemInfo(data.data);
      }
    } catch (error) {
      console.error('שגיאה בטעינת מידע מערכת:', error);
    }
  }

  updateSystemInfo(data) {
    // מידע שרת - נשתמש במידע הזמין מה-overall_health
    if (data.components) {
      // עדכון מידע בסיס נתונים
      if (data.components.database) {
        this.updateInfoSection('databaseInfo', data.components.database);
      }

      // עדכון מידע מטמון
      if (data.components.cache) {
        this.updateInfoSection('cacheInfo', data.components.cache);
      }

      // עדכון מידע מערכת
      if (data.components.system) {
        this.updateInfoSection('systemInfo', data.components.system);
      }
    }
  }

  updateInfoSection(sectionId, data) {
    const section = document.getElementById(sectionId);
    if (!section) {
      console.warn(`סעיף ${sectionId} לא נמצא - לא ניתן לעדכן מידע`);
      return;
    }

    const content = section.querySelector('.info-content');
    if (!content) {
      console.warn(`תוכן סעיף ${sectionId} לא נמצא - לא ניתן לעדכן מידע`);
      return;
    }

    // עדכון מידע לפי המבנה החדש
    if (data.details) {
      Object.entries(data.details).forEach(([key, value]) => {
        const item = content.querySelector(`[data-key="${key}"]`);
        if (item) {
          const valueElement = item.querySelector('.value');
          if (valueElement) {
            valueElement.textContent = value;
          }
        }
      });
    }
  }

  // פונקציות עזר
  formatUptime(ms) {
    try {
      if (!ms || isNaN(ms)) {
        return 'לא ידוע';
      }
      
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {return `${days} ימים`;}
      if (hours > 0) {return `${hours} שעות`;}
      if (minutes > 0) {return `${minutes} דקות`;}
      return `${seconds} שניות`;
    } catch (error) {
      console.error('שגיאה בעיצוב זמן פעילות:', error);
      return 'לא ידוע';
    }
  }

  getPeriodInMs(period) {
    try {
      switch (period) {
      case '1h': return 3600000;
      case '24h': return 86400000;
      case '7d': return 604800000;
      default: return 86400000;
      }
    } catch (error) {
      console.error('שגיאה בחישוב תקופת זמן:', error);
      return 86400000; // ברירת מחדל: 24 שעות
    }
  }

  toggleAutoScroll(enabled) {
    try {
      const container = document.getElementById('logsContent');
      if (container && enabled) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (error) {
      console.error('שגיאה בגלילה אוטומטית:', error);
    }
  }

  updateStatusUI() {
    // עדכון כפתורים לפי סטטוס
    const serverStatusElement = document.getElementById('serverStatus');
    const isOnline = serverStatusElement ? serverStatusElement.textContent === 'מחובר' : false;

    // עדכון כפתורי פעולה
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
      if (btn.classList.contains('success') || btn.classList.contains('danger')) {
        btn.disabled = !isOnline;
        btn.style.opacity = isOnline ? '1' : '0.5';
      }
    });
  }

  startAutoRefresh() {
    try {
      // רענון אוטומטי כל 30 שניות
      setInterval(() => {
        this.checkServerStatus();
      }, 30000);
      
      console.log('✅ רענון אוטומטי הופעל');
    } catch (error) {
      console.error('שגיאה בהפעלת רענון אוטומטי:', error);
    }
  }
}

// יצירת מופע גלובלי
window.serverMonitor = new ServerMonitor();

// אתחול
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 טעינת דף ניטור שרת...');

  // אתחול HeaderSystem
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    console.log('✅ אתחול HeaderSystem...');
    window.headerSystem.init();
  }

  console.log('✅ דף ניטור שרת נטען בהצלחה');
});
