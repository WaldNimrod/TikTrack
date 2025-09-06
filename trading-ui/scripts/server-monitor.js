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
    this.isChangingMode = false; // הוספת משתנה להגנה מפני קריאות כפולות

    this.init();
  }

  init() {
    // 🚀 אתחול ניטור שרת...
    if (typeof window.showNotification === 'function') {
      window.showNotification('אתחול ניטור שרת...', 'info');
    }

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

    // טעינת היסטוריית מצבים
    this.loadModeHistory();

    // רענון אוטומטי
    this.startAutoRefresh();

    // ✅ ניטור שרת אותחל בהצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('ניטור שרת אותחל בהצלחה', 'success');
    }
  }

  initUI() {
    // עדכון סטטוס ראשוני
    this.updateStatusUI();

    // הגדרת event listeners
    this.setupEventListeners();
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
  }

  // בדיקת סטטוס שרת
  async checkServerStatus() {
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        timeout: 5000 
      });
      const data = await response.json();

      if (response.ok) {
        this.updateServerStatus('online', data);
      } else {
        this.updateServerStatus('offline', null);
      }
    } catch (error) {
      // השרת לא זמין - לא נציג הודעת שגיאה כל פעם
      console.log('השרת לא זמין:', error.message);
      this.updateServerStatus('offline', null);
    }
  }

  // ניהול מצבי השרת
  async getCurrentServerMode() {
    try {
      // קבלת המצב האמיתי מה-API
      const response = await fetch('/api/server/current-mode', { 
        method: 'GET',
        timeout: 5000 
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const currentMode = data.data.mode;
        let cacheTTL = 'לא ידוע';

        // קביעת TTL לפי המצב
        switch (currentMode) {
        case 'development':
          cacheTTL = '10 שניות';
          break;
        case 'no-cache':
          cacheTTL = '0 שניות';
          break;
        case 'production':
          cacheTTL = '5 דקות';
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
        console.warn('לא ניתן לקבל מצב שרת:', data.message || 'שגיאה לא ידועה');
        this.updateCurrentModeDisplay('unknown', 'שגיאה');
      }
    } catch (error) {
      // השרת לא זמין - לא נציג הודעת שגיאה כל פעם
      console.log('השרת לא זמין לקבלת מצב:', error.message);
      this.updateCurrentModeDisplay('unknown', 'לא זמין');
    }

    return 'unknown';
  }

  updateCurrentModeDisplay(mode, ttl) {
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
      cacheTTL.textContent = ttl;
    }

    if (lastModeUpdate) {
      const now = new Date();
      lastModeUpdate.textContent = now.toLocaleString('he-IL');
    }

    // עדכון מצב פעיל בכרטיסי המצבים
    ServerMonitor.updateActiveModeCard(mode);
  }

  static updateActiveModeCard(activeMode) {
    const modeCards = document.querySelectorAll('.mode-option-card');
    modeCards.forEach(card => {
      card.classList.remove('active');
      if (card.dataset.mode === activeMode) {
        card.classList.add('active');
      }
    });
  }

  async setServerMode(mode) {
    // הגנה מפני קריאות כפולות
    if (this.isChangingMode) {
      console.log('⚠️ Mode change already in progress, ignoring duplicate request');
      return;
    }

    this.isChangingMode = true;
    console.log('🚀 setServerMode called with mode:', mode);

    try {
      // הצגת הודעה על התחלת השינוי
      if (window.showInfoNotification) {
        window.showInfoNotification(
          `משנה מצב שרת ל: ${ServerMonitor.getModeDisplayName(mode)}...`,
          'info',
        );
      }

      console.log('📡 Sending request to /api/server/change-mode');
      // ביצוע שינוי המצב דרך הסקריפט restart
      const response = await fetch('/api/server/change-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode }),
      });

      console.log('📥 Response received:', response.status, response.ok);
      if (response.ok) {
        const result = await response.json();
        console.log('📋 Response data:', result);

        if (result.status === 'success') {
          console.log('✅ Mode change successful');
          if (window.showSuccessNotification) {
            window.showSuccessNotification(
              `מצב שרת שונה בהצלחה ל: ${ServerMonitor.getModeDisplayName(mode)}`,
              'success',
            );
          }

          // עדכון המצב הנוכחי ורענון הדף
          setTimeout(() => {
            this.getCurrentServerMode();
            // רענון הדף כדי לעדכן את כל התצוגה
            window.location.reload();
          }, 2000);

          // הוספה להיסטוריה
          this.addModeToHistory(mode, 'success');

        } else {
          console.log('❌ Mode change failed:', result.message);
          throw new Error(result.message || 'שגיאה בשינוי המצב');
        }
      } else {
        console.log('❌ HTTP error:', response.status);
        throw new Error(`שגיאת שרת: ${response.status}`);
      }

    } catch (error) {
      console.error('💥 Error in setServerMode:', error);

      if (window.showErrorNotification) {
        window.showErrorNotification(
          `שגיאה בשינוי מצב השרת: ${error.message}`,
          'error',
        );
      }

      // הוספה להיסטוריה עם שגיאה
      this.addModeToHistory(mode, 'error', error.message);
    } finally {
      // שחרור ההגנה
      this.isChangingMode = false;
    }
  }

  static getModeDisplayName(mode) {
    const modeNames = {
      'development': 'מצב פיתוח',
      'no-cache': 'ללא מטמון',
      'production': 'מצב ייצור',
      'preserve': 'שמירת מצב',
    };

    return modeNames[mode] || mode;
  }

  static showModeInfo(mode) {
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
    if (!info) {return;}

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

    // הסרת modal קיים אם יש
    const existingModal = document.getElementById('modeInfoModal');
    if (existingModal) {
      existingModal.remove();
    }

    // הוספת modal חדש
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // הצגת modal
    const modal = new bootstrap.Modal(document.getElementById('modeInfoModal'));
    modal.show();
  }

  addModeToHistory(mode, status, errorMessage = null) {
    const historyList = document.getElementById('modeHistoryList');
    if (!historyList) {
      console.warn('modeHistoryList לא נמצא - לא ניתן להוסיף להיסטוריה');
      return;
    }

    const historyItem = document.createElement('div');
    historyItem.className = 'mode-history-item';

    const now = new Date();
    const timeString = now.toLocaleString('he-IL');

    historyItem.innerHTML = `
      <div class="mode-history-info">
        <div class="mode-history-mode">${ServerMonitor.getModeDisplayName(mode)}</div>
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
  }

  refreshModeHistory() {
    console.log('🔄 refreshModeHistory - כפתור נלחץ');
    const historyList = document.getElementById('modeHistoryList');
    if (!historyList) {
      console.log('❌ refreshModeHistory - historyList לא נמצא');
      return;
    }

    console.log('✅ refreshModeHistory - מתחיל רענון היסטוריה');
    // הצגת loading
    historyList.innerHTML = `
      <div class="loading-history">
        <i class="fas fa-spinner fa-spin"></i>
        <p>מרענן היסטוריה...</p>
      </div>
    `;

    // רענון המצב הנוכחי וטעינת היסטוריה מחדש
    setTimeout(() => {
      this.getCurrentServerMode();
      // טעינת היסטוריה מחדש מהשרת
      this.loadModeHistory();
      console.log('✅ refreshModeHistory - רענון היסטוריה הושלם');
    }, 1000);
  }

  // טעינת היסטוריית מצבים בטעינה ראשונית
  async loadModeHistory() {
    const historyList = document.getElementById('modeHistoryList');
    if (!historyList) {return;}

    // הצגת loading
    historyList.innerHTML = `
      <div class="loading-history">
        <i class="fas fa-spinner fa-spin"></i>
        <p>טוען היסטוריה...</p>
      </div>
    `;

    // טעינת היסטוריה מהשרת
    try {
      const response = await fetch('/api/server/mode-history');
      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data.history) {
        // הצגת היסטוריה מהשרת
        this.displayModeHistory(data.data.history);
      } else {
        // אם אין היסטוריה מהשרת, נציג הודעה
        historyList.innerHTML = `
          <div class="no-history">
            <i class="fas fa-history"></i>
            <p>אין היסטוריה זמינה</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('שגיאה בטעינת היסטוריית מצבים:', error);
      // הצגת הודעה על שגיאה
      historyList.innerHTML = `
        <div class="no-history">
          <i class="fas fa-exclamation-triangle"></i>
          <p>שגיאה בטעינת היסטוריה</p>
        </div>
      `;
    }
  }

  // הצגת היסטוריית מצבים
  displayModeHistory(history) {
    const historyList = document.getElementById('modeHistoryList');
    if (!historyList || !history) {return;}

    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="no-history">
          <i class="fas fa-history"></i>
          <p>אין היסטוריה זמינה</p>
        </div>
      `;
      return;
    }

    const historyHTML = history.map(item => `
      <div class="mode-history-item">
        <div class="mode-history-info">
          <div class="mode-history-mode">${ServerMonitor.getModeDisplayName(item.mode)}</div>
          <div class="mode-history-time">${new Date(item.timestamp).toLocaleString('he-IL')}</div>
        </div>
        <div class="mode-history-status ${item.status}">
          ${item.status === 'success' ? 'הצלחה' : 'שגיאה'}
        </div>
      </div>
    `).join('');

    historyList.innerHTML = historyHTML;
  }

  updateServerStatus(status, data) {
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
          document.getElementById('dbSize').textContent = `${db.details.database_size_mb || 0} MB`;
          document.getElementById('tickerCount').textContent = db.details.ticker_count || 0;
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
          document.getElementById('cpuUsage').textContent = `${system.details.cpu_percent || 0}%`;
          document.getElementById('memoryUsage').textContent = `${system.details.memory_percent || 0}%`;
          
          // עדכון מידע זיכרון מפורט
          const memoryAvailableElement = document.getElementById('memoryAvailable');
          const processMemoryElement = document.getElementById('processMemory');
          
          if (memoryAvailableElement && system.details.memory_available_gb) {
            memoryAvailableElement.textContent = `${system.details.memory_available_gb} GB`;
          }
          if (processMemoryElement && system.details.process_memory_mb) {
            processMemoryElement.textContent = `${system.details.process_memory_mb} MB`;
          }
        }
      }

      // זמן פעילות
      if (data.response_time_ms) {
        document.getElementById('uptime').textContent = ServerMonitor.formatUptime(data.response_time_ms);
      }
    }
  }

  // בדיקת בריאות שרת
  async checkServerHealth() {
    console.log('🔍 checkServerHealth - כפתור נלחץ');
    try {
      window.showInfoNotification('ניטור שרת', 'בודק בריאות שרת...');
      console.log('📡 checkServerHealth - שולח בקשה ל-/api/health');

      const response = await fetch('/api/health');
      const data = await response.json();
      console.log('📥 checkServerHealth - תגובה התקבלה:', response.status, data);

      if (response.ok) {
        const overallScore = data.summary?.overall_score || 0;
        let message = '';

        if (overallScore >= 3.5) {
          message = 'השרת במצב מעולה';
          window.showSuccessNotification('בריאות שרת', message);
        } else if (overallScore >= 2.5) {
          message = 'השרת במצב טוב';
          window.showWarningNotification('בריאות שרת', message);
        } else {
          message = 'השרת במצב גרוע - נדרשת תשומת לב';
          window.showErrorNotification('בריאות שרת', message);
        }

        // עדכון UI
        this.updateServerStatus('online', data);
        console.log('✅ checkServerHealth - הושלם בהצלחה');
      } else {
        window.showErrorNotification('בריאות שרת', 'השרת לא מגיב');
        console.log('❌ checkServerHealth - השרת לא מגיב');
      }
    } catch (error) {
      console.error('💥 checkServerHealth - שגיאה:', error);
      window.showErrorNotification('בריאות שרת', 'שגיאה בבדיקה');
    }
  }

  // הפעלת שרת מחדש
  async restartServer() {
    console.log('🔄 restartServer - כפתור נלחץ');
    
    // Function to execute restart
    const executeRestart = async () => {
      console.log('✅ restartServer - משתמש אישר');
      try {
        window.showInfoNotification('ניטור שרת', 'מפעיל שרת מחדש...');
        console.log('📡 restartServer - שולח בקשה ל-/api/server/change-mode');

        // שליחת בקשת הפעלה מחדש
        const response = await fetch('/api/server/change-mode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode: 'preserve' }),
        });

        console.log('📥 restartServer - תגובה התקבלה:', response.status);
        if (response.ok) {
          window.showSuccessNotification('ניטור שרת', 'השרת מופעל מחדש - ממתין לחיבור...');
          console.log('✅ restartServer - הפעלה מחדש החלה, ממתין 3 שניות...');

          // המתנה ארוכה יותר והתמודדות עם חוסר חיבור
          setTimeout(() => {
            this.waitForServerRestart();
          }, 3000);
        } else {
          window.showErrorNotification('ניטור שרת', 'שגיאה בהפעלה מחדש');
          console.log('❌ restartServer - שגיאה בהפעלה מחדש');
        }
      } catch (error) {
        console.error('💥 restartServer - שגיאה:', error);
        window.showErrorNotification('ניטור שרת', 'שגיאה בהפעלה מחדש');
      }
    };
    
    // Use notification system or fallback to confirm
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'הפעלת שרת מחדש',
        'האם אתה בטוח שברצונך להפעיל את השרת מחדש?',
        executeRestart,
        () => console.log('❌ restartServer - משתמש ביטל')
      );
    } else {
      const confirmed = typeof showConfirmationDialog === 'function' ? 
        await new Promise(resolve => {
          showConfirmationDialog(
            'האם אתה בטוח שברצונך להפעיל את השרת מחדש?',
            () => resolve(true),
            () => resolve(false),
            'הפעלת שרת מחדש',
            'הפעל',
            'ביטול'
          );
        }) : 
        window.confirm('האם אתה בטוח שברצונך להפעיל את השרת מחדש?');
      if (confirmed) {
        await executeRestart();
      } else {
        console.log('❌ restartServer - משתמש ביטל');
      }
    }
  }

  // המתנה לחיבור השרת אחרי הפעלה מחדש
  async waitForServerRestart() {
    let attempts = 0;
    const maxAttempts = 20; // 20 ניסיונות = 60 שניות
    
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          timeout: 5000 
        });
        
        if (response.ok) {
          window.showSuccessNotification('ניטור שרת', 'השרת חזר לפעילות!');
          this.checkServerStatus();
          this.getCurrentServerMode();
          return;
        }
      } catch (error) {
        // השרת עדיין לא זמין
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        window.showInfoNotification('ניטור שרת', `ממתין לחיבור השרת... (${attempts}/${maxAttempts})`);
        setTimeout(checkConnection, 3000);
      } else {
        window.showErrorNotification('ניטור שרת', 'השרת לא חזר לפעילות - נסה להפעיל ידנית');
      }
    };
    
    checkConnection();
  }

  // ניקוי Cache
  async clearCache() {
    console.log('🧹 clearCache - כפתור נלחץ');
    
    // Function to execute cache clearing
    const executeClearCache = async () => {
      console.log('✅ clearCache - משתמש אישר');
      try {
        window.showInfoNotification('ניטור שרת', 'מנקה Cache...');
        console.log('📡 clearCache - שולח בקשה ל-/api/v1/cache/clear');

        const response = await fetch('/api/v1/cache/clear', {
          method: 'POST',
        });

        console.log('📥 clearCache - תגובה התקבלה:', response.status);
        if (response.ok) {
          window.showSuccessNotification('ניטור שרת', 'Cache נוקה בהצלחה - מרענן דף...');
          console.log('✅ clearCache - Cache נוקה, מרענן דף בעוד 2 שניות...');

          // רענון הדף אחרי ניקוי מטמון
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          window.showErrorNotification('ניטור שרת', 'שגיאה בניקוי Cache');
          console.log('❌ clearCache - שגיאה בניקוי Cache');
        }
      } catch (error) {
        console.error('💥 clearCache - שגיאה:', error);
        window.showErrorNotification('ניטור שרת', 'שגיאה בניקוי Cache');
      }
    };
    
    // Use notification system or fallback to confirm
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ניקוי Cache',
        'האם אתה בטוח שברצונך לנקות את ה-Cache?',
        executeClearCache,
        () => console.log('❌ clearCache - משתמש ביטל')
      );
    } else {
      const confirmed = typeof showConfirmationDialog === 'function' ? 
        await new Promise(resolve => {
          showConfirmationDialog(
            'האם אתה בטוח שברצונך לנקות את ה-Cache?',
            () => resolve(true),
            () => resolve(false),
            'ניקוי Cache',
            'נקה',
            'ביטול'
          );
        }) : 
        window.confirm('האם אתה בטוח שברצונך לנקות את ה-Cache?');
      if (confirmed) {
        await executeClearCache();
      } else {
        console.log('❌ clearCache - משתמש ביטל');
      }
    }
  }

  // אופטימיזציית בסיס נתונים
  static async optimizeDatabase() {
    console.log('⚡ optimizeDatabase - כפתור נלחץ');
    
    // Function to execute database optimization
    const executeOptimization = async () => {
      console.log('✅ optimizeDatabase - משתמש אישר');
      try {
        window.showInfoNotification('ניטור שרת', 'מבצע אופטימיזציה...');
        console.log('📡 optimizeDatabase - שולח בקשה ל-/api/v1/query-optimization/optimize');

        const response = await fetch('/api/v1/query-optimization/optimize', {
          method: 'POST',
        });

        console.log('📥 optimizeDatabase - תגובה התקבלה:', response.status);
        if (response.ok) {
          window.showSuccessNotification('ניטור שרת', 'אופטימיזציה הושלמה בהצלחה');
          console.log('✅ optimizeDatabase - אופטימיזציה הושלמה בהצלחה');
        } else {
          window.showErrorNotification('ניטור שרת', 'שגיאה באופטימיזציה');
          console.log('❌ optimizeDatabase - שגיאה באופטימיזציה');
        }
      } catch (error) {
        console.error('💥 optimizeDatabase - שגיאה:', error);
        window.showErrorNotification('ניטור שרת', 'שגיאה באופטימיזציה');
      }
    };
    
    // Use notification system or fallback to confirm
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'אופטימיזציית בסיס נתונים',
        'האם אתה בטוח שברצונך לבצע אופטימיזציה לבסיס הנתונים?',
        executeOptimization,
        () => console.log('❌ optimizeDatabase - משתמש ביטל')
      );
    } else {
      const confirmed = typeof showConfirmationDialog === 'function' ? 
        await new Promise(resolve => {
          showConfirmationDialog(
            'האם אתה בטוח שברצונך לבצע אופטימיזציה לבסיס הנתונים?',
            () => resolve(true),
            () => resolve(false),
            'אופטימיזציה לבסיס נתונים',
            'בצע',
            'ביטול'
          );
        }) : 
        window.confirm('האם אתה בטוח שברצונך לבצע אופטימיזציה לבסיס הנתונים?');
      if (confirmed) {
        await executeOptimization();
      } else {
        console.log('❌ optimizeDatabase - משתמש ביטל');
      }
    }
  }

  // עצירת חירום
  async emergencyStop() {
    console.log('🛑 emergencyStop - כפתור נלחץ');
    
    // Function to execute emergency stop
    const executeEmergencyStop = async () => {
      console.log('✅ emergencyStop - משתמש אישר');
      try {
        window.showWarningNotification('ניטור שרת', 'עוצר שרת בחירום...');

        // ניסיון לעצור את השרת דרך API
        try {
          console.log('📡 emergencyStop - מנסה לעצור דרך /api/v1/server/emergency-stop');
          const response = await fetch('/api/v1/server/emergency-stop', {
            method: 'POST',
            timeout: 5000
          });

          console.log('📥 emergencyStop - תגובה מהשרת:', response.status);
          if (response.ok) {
            window.showErrorNotification('ניטור שרת', 'השרת נעצר בחירום');
            this.updateServerStatus('offline', null);
            console.log('✅ emergencyStop - השרת נעצר בהצלחה');
            return;
          } else {
            throw new Error('API לא זמין');
          }
        } catch (apiError) {
          // אם ה-API לא זמין, ננסה לעצור דרך restart script
          console.log('⚠️ emergencyStop - API לא זמין, מנסה דרך restart script...');
          
          try {
            // שליחת בקשת עצירה דרך restart script
            console.log('📡 emergencyStop - שולח בקשה ל-/api/server/change-mode עם emergency-stop');
            const restartResponse = await fetch('/api/server/change-mode', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ mode: 'emergency-stop' }),
              timeout: 5000
            });

            console.log('📥 emergencyStop - תגובה מ-restart script:', restartResponse.status);
            if (restartResponse.ok) {
              window.showErrorNotification('ניטור שרת', 'השרת נעצר בחירום');
              this.updateServerStatus('offline', null);
              console.log('✅ emergencyStop - השרת נעצר דרך restart script');
            } else {
              throw new Error('לא ניתן לעצור את השרת דרך API');
            }
          } catch (restartError) {
            // אם גם זה נכשל, נציג הודעה למשתמש
            window.showErrorNotification('ניטור שרת', 'לא ניתן לעצור את השרת אוטומטית. נא לעצור ידנית.');
            console.error('💥 emergencyStop - שגיאה בעצירה:', restartError);
          }
        }

      } catch (error) {
        console.error('💥 emergencyStop - שגיאה כללית:', error);
        window.showErrorNotification('ניטור שרת', 'שגיאה בעצירת חירום: ' + error.message);
      }
    };
    
    // Use notification system or fallback to confirm
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'עצירת חירום',
        '⚠️ אזהרה! עצירת חירום תעצור את השרת מיד. האם אתה בטוח?',
        executeEmergencyStop,
        () => console.log('❌ emergencyStop - משתמש ביטל')
      );
    } else {
      const confirmed = typeof showConfirmationDialog === 'function' ? 
        await new Promise(resolve => {
          showConfirmationDialog(
            '⚠️ אזהרה! עצירת חירום תעצור את השרת מיד. האם אתה בטוח?',
            () => resolve(true),
            () => resolve(false),
            'עצירת חירום',
            'עצור',
            'ביטול',
            'danger'
          );
        }) : 
        window.confirm('⚠️ אזהרה! עצירת חירום תעצור את השרת מיד. האם אתה בטוח?');
      if (confirmed) {
        await executeEmergencyStop();
      } else {
        console.log('❌ emergencyStop - משתמש ביטל');
      }
    }
  }

  // ייצוא לוגים
  static async exportLogs() {
    console.log('📥 exportLogs - כפתור נלחץ');
    try {
      window.showInfoNotification('ניטור שרת', 'מייצא לוגים...');
      console.log('📋 exportLogs - יוצר לוג מפורט...');

      // יצירת לוג מפורט
      const detailedLog = await ServerMonitor.generateDetailedLog();
      console.log('✅ exportLogs - לוג מפורט נוצר, גודל:', detailedLog.length, 'תווים');
      
      // יצירת קובץ להורדה
      const blob = new Blob([detailedLog], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tiktrack-logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      console.log('✅ exportLogs - קובץ הורדה נוצר והורד');

      window.showSuccessNotification('ניטור שרת', 'לוגים יוצאו בהצלחה');
    } catch (error) {
      console.error('💥 exportLogs - שגיאה:', error);
      window.showErrorNotification('ניטור שרת', 'שגיאה בייצוא לוגים');
    }
  }

  // הרצת סקריפט
  async runScript(scriptName) {
    console.log(`🚀 runScript - כפתור נלחץ: ${scriptName}`);
    try {
      window.showInfoNotification('ניטור שרת', `מריץ סקריפט: ${scriptName}...`);

      // מיפוי סקריפטים לפעולות זמינות
      const scriptActions = {
        'quick-restart': () => this.restartServer(),
        'complete-restart': () => this.restartServer(),
        'route-check': () => this.checkServerHealth(),
        'clean-logs': () => this.clearLogs()
      };

      const action = scriptActions[scriptName];
      if (action) {
        console.log(`✅ runScript - מפעיל פעולה עבור ${scriptName}`);
        await action();
        window.showSuccessNotification('ניטור שרת', `סקריפט ${scriptName} הושלם בהצלחה`);
        console.log(`✅ runScript - ${scriptName} הושלם בהצלחה`);
      } else {
        window.showErrorNotification('ניטור שרת', `סקריפט ${scriptName} לא נתמך`);
        console.log(`❌ runScript - ${scriptName} לא נתמך`);
      }
    } catch (error) {
      console.error(`💥 runScript - שגיאה ב-${scriptName}:`, error);
      window.showErrorNotification('ניטור שרת', `שגיאה בהרצת סקריפט ${scriptName}`);
    }
  }

  // הצגת מידע על סקריפט
  static showScriptInfo(scriptName) {
    console.log(`ℹ️ showScriptInfo - כפתור נלחץ: ${scriptName}`);
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
      console.log(`✅ showScriptInfo - מציג מידע עבור ${scriptName}:`, info);
      if (window.showInfoNotification) {
        window.showInfoNotification(`${info.description}\n\nזמן ביצוע: ${info.duration}\nרמת סיכון: ${info.risks}`, info.title);
      }
    } else {
      console.log(`❌ showScriptInfo - אין מידע עבור ${scriptName}`);
    }
  }

  // ניטור ביצועים
  startMonitoring() {
    console.log('📊 startMonitoring - כפתור נלחץ');
    if (this.monitoring) {
      console.log('⚠️ startMonitoring - ניטור כבר פעיל');
      return;
    }

    this.monitoring = true;
    window.showInfoNotification('ניטור שרת', 'התחלת ניטור ביצועים...');
    console.log('✅ startMonitoring - ניטור ביצועים התחיל');

    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceData();
    }, 5000); // איסוף נתונים כל 5 שניות
    console.log('⏰ startMonitoring - טיימר ניטור הוגדר (5 שניות)');
  }

  stopMonitoring() {
    console.log('⏹️ stopMonitoring - כפתור נלחץ');
    if (!this.monitoring) {
      console.log('⚠️ stopMonitoring - ניטור לא פעיל');
      return;
    }

    this.monitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('✅ stopMonitoring - טיימר ניטור נעצר');
    }

    window.showInfoNotification('ניטור שרת', 'ניטור ביצועים הופסק');
    console.log('✅ stopMonitoring - ניטור ביצועים הופסק');
  }

  async collectPerformanceData() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();

      if (response.ok && data.components) {
        const timestamp = Date.now();

        // זמן תגובה API
        if (data.response_time_ms) {
          this.performanceData.apiResponse.push({
            timestamp,
            value: data.response_time_ms,
          });
          ServerMonitor.updatePerformanceChart('apiResponseChart', data.response_time_ms);
        }

        // שימוש זיכרון
        if (data.components.system?.details?.memory_percent) {
          this.performanceData.memory.push({
            timestamp,
            value: data.components.system.details.memory_percent,
          });
          ServerMonitor.updatePerformanceChart('memoryChart', data.components.system.details.memory_percent);
        }

        // שימוש CPU
        if (data.components.system?.details?.cpu_percent) {
          this.performanceData.cpu.push({
            timestamp,
            value: data.components.system.details.cpu_percent,
          });
          ServerMonitor.updatePerformanceChart('cpuChart', data.components.system.details.cpu_percent);
        }

        // פעילות בסיס נתונים
        if (data.components.database?.details?.query_time_ms) {
          this.performanceData.database.push({
            timestamp,
            value: data.components.database.details.query_time_ms,
          });
          ServerMonitor.updatePerformanceChart('dbChart', data.components.database.details.query_time_ms);
        }

        // הגבלת כמות נתונים
        this.limitPerformanceData();
      }
    } catch (error) {
      console.error('שגיאה באיסוף נתוני ביצועים:', error);
    }
  }

  static updatePerformanceChart(chartId, value) {
    const chartElement = document.getElementById(chartId);
    if (chartElement) {
      chartElement.textContent = value.toFixed(2);
    }
  }

  limitPerformanceData() {
    const maxEntries = 100;
    Object.keys(this.performanceData).forEach(key => {
      if (this.performanceData[key].length > maxEntries) {
        this.performanceData[key] = this.performanceData[key].slice(-maxEntries);
      }
    });
  }

  // ייצוא נתוני ביצועים
  exportPerformanceData() {
    try {
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

      window.showSuccessNotification('ניטור שרת', 'נתוני ביצועים יוצאו בהצלחה');
    } catch (error) {
      console.error('שגיאה בייצוא נתוני ביצועים:', error);
      window.showErrorNotification('ניטור שרת', 'שגיאה בייצוא נתונים');
    }
  }

  // טעינת לוגים
  async loadLogs() {
    try {
      const response = await fetch('/api/server/logs/recent');
      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data.logs) {
        this.logs = data.data.logs;
        this.displayLogs();
      } else {
        console.warn('לא ניתן לטעון לוגים:', data.message || 'שגיאה לא ידועה');
        this.displayLogs([]);
      }
    } catch (error) {
      console.error('שגיאה בטעינת לוגים:', error);
      this.displayLogs([]);
    }
  }

  displayLogs(logs = this.logs) {
    const container = document.getElementById('logsContent');
    if (!container) {return;}

    if (logs.length === 0) {
      container.innerHTML = `
                <div class="loading-logs">
                    <i class="fas fa-file-alt"></i>
                    <p>אין לוגים זמינים</p>
                </div>
            `;
      return;
    }

    const logsHTML = logs.map(log => ServerMonitor.createLogEntryHTML(log)).join('');
    container.innerHTML = logsHTML;

    // גלילה אוטומטית
    if (document.getElementById('autoScroll')?.checked) {
      container.scrollTop = container.scrollHeight;
    }
  }

  static createLogEntryHTML(log) {
    const timestamp = new Date(log.timestamp).toLocaleString('he-IL');
    const level = log.level || 'info';

    return `
            <div class="log-entry ${level}">
                <span class="log-timestamp">${timestamp}</span>
                <span class="log-level">[${level.toUpperCase()}]</span>
                <span class="log-message">${log.message}</span>
            </div>
        `;
  }

  // פילטור לוגים
  filterLogs() {
    const typeFilter = document.getElementById('logType')?.value;
    const periodFilter = document.getElementById('logPeriod')?.value;

    let filteredLogs = this.logs;

    // פילטר לפי סוג
    if (typeFilter && typeFilter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === typeFilter);
    }

    // פילטר לפי זמן
    if (periodFilter) {
      const now = Date.now();
      const periodMs = this.getPeriodInMs(periodFilter);
      filteredLogs = filteredLogs.filter(log => now - new Date(log.timestamp).getTime() <= periodMs);
    }

    this.displayLogs(filteredLogs);
  }

  // חיפוש בלוגים
  searchLogs(query) {
    if (!query.trim()) {
      this.displayLogs();
      return;
    }

    const filteredLogs = this.logs.filter(log =>
      log.message.toLowerCase().includes(query.toLowerCase()) ||
            log.level.toLowerCase().includes(query.toLowerCase()),
    );

    this.displayLogs(filteredLogs);
  }

  // רענון לוגים
  refreshLogs() {
    console.log('🔄 refreshLogs - כפתור נלחץ');
    this.loadLogs();
    window.showInfoNotification('ניטור שרת', 'לוגים רועננו');
    console.log('✅ refreshLogs - לוגים רועננו');
  }

  // ניקוי לוגים
  clearLogs() {
    console.log('🗑️ clearLogs - כפתור נלחץ');
    
    // Function to execute log clearing
    const executeClearLogs = () => {
      console.log('✅ clearLogs - משתמש אישר');
      this.logs = [];
      this.displayLogs();
      window.showSuccessNotification('ניטור שרת', 'לוגים נוקו');
      console.log('✅ clearLogs - לוגים נוקו');
    };
    
    // Use notification system or fallback to confirm
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ניקוי לוגים',
        'האם אתה בטוח שברצונך לנקות את כל הלוגים?',
        executeClearLogs,
        () => console.log('❌ clearLogs - משתמש ביטל')
      );
    } else {
      const confirmed = typeof showConfirmationDialog === 'function' ? 
        await new Promise(resolve => {
          showConfirmationDialog(
            'האם אתה בטוח שברצונך לנקות את כל הלוגים?',
            () => resolve(true),
            () => resolve(false),
            'ניקוי לוגים',
            'נקה',
            'ביטול'
          );
        }) : 
        window.confirm('האם אתה בטוח שברצונך לנקות את כל הלוגים?');
      if (confirmed) {
        executeClearLogs();
      } else {
        console.log('❌ clearLogs - משתמש ביטל');
      }
    }
  }

  // טעינת מידע מערכת
  async loadSystemInfo() {
    console.log('🔧 loadSystemInfo - מתחיל טעינת מידע מערכת');
    try {
      // ניסיון לקבל מידע מהשרת
      try {
        console.log('📡 loadSystemInfo - מנסה לקבל מידע מ-/api/server/system/info');
        const response = await fetch('/api/server/system/info', { 
          method: 'GET',
          timeout: 5000 
        });
        
        console.log('📥 loadSystemInfo - תגובה מהשרת:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('📋 loadSystemInfo - נתונים מהשרת:', data);
          if (data.status === 'success' && data.data) {
            console.log('✅ loadSystemInfo - משתמש בנתונים מהשרת');
            this.updateSystemInfo(data.data);
            return;
          }
        }
      } catch (apiError) {
        console.log('⚠️ loadSystemInfo - API לא זמין, משתמש במידע סטטי:', apiError.message);
      }

      // יצירת מידע מערכת סטטי כי ה-API לא זמין
      console.log('📝 loadSystemInfo - יוצר מידע מערכת סטטי');
      const systemInfo = {
        server: {
          version: '2.0.0',
          environment: 'development',
          port: 8080
        },
        python: {
          version: 'Python 3.9.6',
          flask: '2.3.3',
          sqlite: '3.39.0'
        },
        os: {
          system: 'macOS',
          architecture: 'x86_64',
          uptime: 'N/A'
        }
      };

      console.log('📋 loadSystemInfo - מידע מערכת סטטי:', systemInfo);
      this.updateSystemInfo(systemInfo);
      console.log('✅ loadSystemInfo - מידע מערכת עודכן');
    } catch (error) {
      console.error('💥 loadSystemInfo - שגיאה:', error);
    }
  }

  updateSystemInfo(data) {
    console.log('🔧 updateSystemInfo - מתחיל עדכון מידע מערכת:', data);
    
    // מידע שרת
    if (data.server) {
      console.log('📊 updateSystemInfo - מעדכן מידע שרת:', data.server);
      ServerMonitor.updateInfoSection('serverInfo', data.server);
    }

    // מידע Python
    if (data.python) {
      console.log('🐍 updateSystemInfo - מעדכן מידע Python:', data.python);
      ServerMonitor.updateInfoSection('pythonInfo', data.python);
    }

    // מידע מערכת הפעלה
    if (data.os) {
      console.log('💻 updateSystemInfo - מעדכן מידע מערכת הפעלה:', data.os);
      ServerMonitor.updateInfoSection('osInfo', data.os);
    }
    
    console.log('✅ updateSystemInfo - סיים עדכון מידע מערכת');
  }

  static updateInfoSection(sectionId, data) {
    console.log(`🔧 updateInfoSection - מעדכן ${sectionId} עם נתונים:`, data);
    const section = document.getElementById(sectionId);
    if (!section) {
      console.log(`❌ updateInfoSection - ${sectionId} לא נמצא`);
      return;
    }

    // אם האלמנט עצמו הוא .info-content, השתמש בו
    // אחרת, חפש .info-content בתוכו
    const content = section.classList.contains('info-content') ? section : section.querySelector('.info-content');
    if (!content) {
      console.log(`❌ updateInfoSection - .info-content לא נמצא ב-${sectionId}`);
      console.log(`🔍 updateInfoSection - האלמנט שנמצא:`, section);
      console.log(`🔍 updateInfoSection - הקלאסים של האלמנט:`, section.className);
      return;
    }

    console.log(`🔍 updateInfoSection - מחפש אלמנטים ב-${sectionId}:`);
    const allItems = content.querySelectorAll('[data-key]');
    console.log(`📋 updateInfoSection - נמצאו ${allItems.length} אלמנטים עם data-key`);
    allItems.forEach(item => {
      console.log(`  - ${item.getAttribute('data-key')}: ${item.textContent}`);
    });

    // עדכון המידע לפי המפתחות
    Object.entries(data).forEach(([key, value]) => {
      const item = content.querySelector(`[data-key="${key}"]`);
      if (item) {
        const valueElement = item.querySelector('.value');
        if (valueElement) {
          valueElement.textContent = value;
          console.log(`✅ updateInfoSection - עודכן ${key}: ${value}`);
        } else {
          console.log(`❌ updateInfoSection - .value לא נמצא עבור ${key}`);
        }
      } else {
        console.log(`⚠️ updateInfoSection - [data-key="${key}"] לא נמצא (זה נורמלי אם המפתח לא קיים ב-HTML)`);
      }
    });
    console.log(`✅ updateInfoSection - סיים עדכון ${sectionId}`);
  }

  // פונקציות עזר
  static formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {return `${days} ימים`;}
    if (hours > 0) {return `${hours} שעות`;}
    if (minutes > 0) {return `${minutes} דקות`;}
    return `${seconds} שניות`;
  }

  static getPeriodInMs(period) {
    switch (period) {
    case '1h': return 3600000;
    case '24h': return 86400000;
    case '7d': return 604800000;
    default: return 86400000;
    }
  }

  static toggleAutoScroll(enabled) {
    const container = document.getElementById('logsContent');
    if (container && enabled) {
      container.scrollTop = container.scrollHeight;
    }
  }

  updateStatusUI() {
    // עדכון כפתורים לפי סטטוס
    const isOnline = document.getElementById('serverStatus')?.textContent === 'מחובר';

    // עדכון כפתורי פעולה
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
      if (btn.classList.contains('success') || btn.classList.contains('danger')) {
        btn.disabled = !isOnline;
        btn.style.opacity = isOnline ? '1' : '0.5';
      }
    });
  }

  // העתקת לוג מפורט
  async copyDetailedLog() {
    console.log('📋 copyDetailedLog - כפתור נלחץ');
    try {
      console.log('📋 copyDetailedLog - מתחיל יצירת לוג מפורט...');

      // יצירת לוג מפורט
      const detailedLog = await ServerMonitor.generateDetailedLog();
      console.log('✅ copyDetailedLog - לוג מפורט נוצר, גודל:', detailedLog.length, 'תווים');

      // העתקה ללוח
      await navigator.clipboard.writeText(detailedLog);
      console.log('✅ copyDetailedLog - לוג הועתק ללוח');

      // הצגת הודעת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('לוג מפורט הועתק ללוח בהצלחה!');
      }

      console.log('✅ copyDetailedLog - הושלם בהצלחה');

    } catch (error) {
      console.error('💥 copyDetailedLog - שגיאה:', error);

      // הצגת הודעת שגיאה
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בהעתקת לוג מפורט');
      }
    }
  }

  // יצירת לוג מפורט
  static async generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    let log = '=== TikTrack Server Monitor - לוג מפורט ===\n';
    log += `זמן יצירה: ${timestamp}\n`;
    log += `עמוד: ${window.location.href}\n\n`;

    // סטטוס שרת
    log += '--- סטטוס שרת ---\n';
    const serverStatus = document.getElementById('serverStatus')?.textContent || 'לא ידוע';
    const databaseStatus = document.getElementById('databaseStatus')?.textContent || 'לא ידוע';
    const cacheStatus = document.getElementById('cacheStatus')?.textContent || 'לא ידוע';
    const systemStatus = document.getElementById('systemStatus')?.textContent || 'לא ידוע';

    log += `שרת: ${serverStatus}\n`;
    log += `בסיס נתונים: ${databaseStatus}\n`;
    log += `מטמון: ${cacheStatus}\n`;
    log += `מערכת: ${systemStatus}\n\n`;

    // מצב מטמון נוכחי
    log += '--- מצב מטמון נוכחי ---\n';
    const currentMode = document.getElementById('currentCacheMode')?.textContent || 'לא ידוע';
    const cacheTTL = document.getElementById('cacheTTL')?.textContent || 'לא ידוע';
    const lastUpdate = document.getElementById('lastModeUpdate')?.textContent || 'לא ידוע';

    log += `מצב: ${currentMode}\n`;
    log += `TTL: ${cacheTTL}\n`;
    log += `עדכון אחרון: ${lastUpdate}\n\n`;

    // מידע מערכת
    log += '--- מידע מערכת ---\n';
    const cpuUsage = document.getElementById('cpuUsage')?.textContent || 'לא ידוע';
    const memoryUsage = document.getElementById('memoryUsage')?.textContent || 'לא ידוע';
    const dbSize = document.getElementById('dbSize')?.textContent || 'לא ידוע';
    const tickerCount = document.getElementById('tickerCount')?.textContent || 'לא ידוע';

    log += `CPU: ${cpuUsage}\n`;
    log += `זיכרון: ${memoryUsage}\n`;
    log += `גודל DB: ${dbSize}\n`;
    log += `מספר טיקרים: ${tickerCount}\n\n`;

    // לוגים אחרונים
    log += '--- לוגים אחרונים ---\n';
    const logsContent = document.getElementById('logsContent');
    if (logsContent) {
      const logEntries = logsContent.querySelectorAll('.log-entry');
      if (logEntries.length > 0) {
        logEntries.forEach((entry, index) => {
          if (index < 10) { // רק 10 לוגים אחרונים
            const timestamp = entry.querySelector('.log-timestamp')?.textContent || '';
            const level = entry.querySelector('.log-level')?.textContent || '';
            const message = entry.querySelector('.log-message')?.textContent || '';
            log += `[${timestamp}] ${level}: ${message}\n`;
          }
        });
      } else {
        log += 'אין לוגים זמינים\n';
      }
    }

    // היסטוריית מצבים
    log += '\n--- היסטוריית מצבים ---\n';
    const modeHistory = document.getElementById('modeHistoryList');
    if (modeHistory) {
      const historyEntries = modeHistory.querySelectorAll('.mode-history-item');
      if (historyEntries.length > 0) {
        historyEntries.forEach((entry, index) => {
          if (index < 5) { // רק 5 היסטוריות אחרונות
            const mode = entry.querySelector('.mode-history-mode')?.textContent || '';
            const status = entry.querySelector('.mode-history-status')?.textContent || '';
            const timestamp = entry.querySelector('.mode-history-time')?.textContent || '';
            log += `[${timestamp}] ${mode}: ${status}\n`;
          }
        });
      } else {
        log += 'אין היסטוריה זמינה\n';
      }
    }

    log += '\n=== סוף לוג מפורט ===\n';
    return log;
  }

  startAutoRefresh() {
    // רענון אוטומטי כל 30 שניות
    setInterval(() => {
      this.checkServerStatus();
    }, 30000);
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
