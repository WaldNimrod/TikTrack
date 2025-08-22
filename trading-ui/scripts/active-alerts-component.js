/**
 * Active Alerts Component (Light DOM)
 * קומפוננטה להצגת התראות פעילות שמשתמשת בסגנונות הכלליים של האתר
 * שימוש: <active-alerts></active-alerts>
 */

class ActiveAlertsComponent extends HTMLElement {
  constructor() {
    super();
    this.alerts = [];
    this.isLoading = false;
    this._checkAttempts = 0;
    this._functionsChecked = false;
    this._checkTimeout = null;
  }

  connectedCallback() {
    this.render();
    this.checkGlobalFunctions();
    this.loadActiveAlerts();

    // ניקוי הודעות קונסולה ישנות אחרי 10 שניות (רק אם יש הרבה הודעות)
    setTimeout(() => {
      // בדיקה אם יש הרבה הודעות בקונסולה
      if (this._checkAttempts > 3) {
        console.log('🧹 Clearing console messages to reduce clutter...');
        if (console.clear) {
          console.clear();
        }
      }
    }, 10000);
  }

  disconnectedCallback() {
    // ניקוי timeout אם הקומפוננטה מוסרת
    if (this._checkTimeout) {
      clearTimeout(this._checkTimeout);
      this._checkTimeout = null;
    }
  }

  render() {
    this.innerHTML = `
      <div class="alerts-cards-container">
        <div class="alerts-header">
          <h3 id="alertsTitle">🔔 התראות פעילות</h3>
          <div class="alerts-header-actions">
            <div class="alerts-count" id="newAlertsCount">0 התראות</div>
          </div>
        </div>
        <div class="alerts-cards" id="alertsCards" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%;">

          <div class="loading">
            <div class="loading-spinner"></div>
            <p>טוען התראות...</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * בדיקת זמינות פונקציות גלובליות
   */
  checkGlobalFunctions() {
    // בדיקה אם כבר בדקנו ופונקציות זמינות
    if (this._functionsChecked) {
      return;
    }

    console.log('🔍 === CHECKING GLOBAL FUNCTIONS (ACTIVE ALERTS COMPONENT) ===');
    console.log('🔍 formatAlertCondition available:', typeof window.formatAlertCondition);
    console.log('🔍 parseAlertCondition available:', typeof window.parseAlertCondition);

    // בדיקה אם שתי הפונקציות זמינות
    if (window.formatAlertCondition && window.parseAlertCondition) {
      console.log('✅ All global functions are available');
      this._functionsChecked = true;
      // ניקוי timeout אם יש אחד פעיל
      if (this._checkTimeout) {
        clearTimeout(this._checkTimeout);
        this._checkTimeout = null;
      }
      return;
    }

    // אם הפונקציות לא זמינות, ננסה שוב רק אם לא ניסינו יותר מדי פעמים
    if (!this._checkAttempts) {
      this._checkAttempts = 0;
    }

    if (this._checkAttempts < 5) { // מקסימום 5 ניסיונות
      this._checkAttempts++;
      console.warn(`⚠️ Global functions not available (attempt ${this._checkAttempts}/5) - retrying in 2 seconds`);
      this._checkTimeout = setTimeout(() => {
        // בדיקה אם הקומפוננטה עדיין מחוברת
        if (this.isConnected) {
          this.checkGlobalFunctions();
        }
      }, 2000);
    } else {
      console.warn('⚠️ Global functions not available after 5 attempts - using local versions');
      this._functionsChecked = true;
      // ניקוי timeout אם יש אחד פעיל
      if (this._checkTimeout) {
        clearTimeout(this._checkTimeout);
        this._checkTimeout = null;
      }
    }
  }

  async loadActiveAlerts() {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
      const response = await fetch(`${base}/api/v1/alerts/unread`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const apiData = await response.json();
      this.alerts = (apiData && apiData.status === 'success' && Array.isArray(apiData.data)) ? apiData.data : [];

      this.updateCount();
      this.renderAlerts();
    } catch (err) {
      console.error('failed loading active alerts', err);
      this.alerts = [];
      this.renderAlerts();
    } finally {
      this.isLoading = false;
    }
  }

  updateCount() {
    const countEl = this.querySelector('#newAlertsCount');
    const titleEl = this.querySelector('#alertsTitle');
    const cardsContainer = this.querySelector('#alertsCards');

    if (countEl) {
      countEl.textContent = `${this.alerts.length} התראות`;
      // עדכון שקיפות של מונה ההתראות
      if (this.alerts.length === 0) {
        countEl.style.opacity = '0.5';
      } else {
        countEl.style.opacity = '1';
      }
    }

    if (titleEl) {
      if (this.alerts.length === 0) {
        titleEl.textContent = '🔕 אין התראות חדשות';
        titleEl.style.opacity = '0.5';
      } else {
        titleEl.textContent = '🔔 התראות פעילות';
        titleEl.style.opacity = '1';
      }
    }

    // הסתרת/הצגת מיכל הכרטיסיות
    if (cardsContainer) {
      if (this.alerts.length === 0) {
        cardsContainer.style.display = 'none';
      } else {
        cardsContainer.style.display = 'grid';
      }
    }
  }

  renderAlerts() {
    const container = this.querySelector('#alertsCards');
    if (!container) return;

    if (!this.alerts.length) {
      // הסתרת המיכל כשאין התראות
      container.style.display = 'none';
      this.updateCount(); // עדכון הכותרת למצב ריק
      return;
    }

    // הצגת המיכל כשיש התראות
    container.style.display = 'grid';
    container.innerHTML = this.alerts.map(a => this.createAlertCardHTML(a)).join('');
    this.setupCardEventListeners();
    this.updateCount(); // עדכון הכותרת למצב עם התראות
  }

  createAlertCardHTML(alert) {
    const timeAgo = this.getTimeAgo(alert.created_at);
    const icon = this.getAlertIcon(alert.type);
    const ticker = this.extractTickerFromCondition(alert.condition) || this.getRandomTicker();
    const currentPrice = this.getCurrentPrice(ticker);
    const dailyChange = this.getDailyChange(ticker);
    const changeClass = this.getDailyChangeClass(ticker);

    // שימוש בפונקציה formatAlertCondition לתרגום התנאי
    const formattedCondition = window.formatAlertCondition ? window.formatAlertCondition(alert.condition) : this.formatAlertCondition(alert.condition);

    // טיפול בשדות undefined
    const message = alert.message || '';
    const relatedType = this.getRelatedTypeFromId(alert.related_type_id);

    return `
      <div class="alert-card" data-alert-id="${alert.id}">
        <div class="alert-card-header">
          <h4 class="alert-card-title">${icon} ${ticker || 'התראה'}</h4>
          <span class="alert-card-time">${timeAgo}</span>
        </div>
        <div class="alert-card-content">
          ${message ? `<p class="alert-card-message"><strong>${message}</strong></p>` : ''}
          <p class="alert-card-message">${formattedCondition}</p>
          <div class="alert-card-details">
            <span class="alert-detail-item">${this.getAlertTypeDisplay(alert.type)}</span>
            <span class="alert-detail-item">${this.getEntityTypeDisplay(relatedType)}</span>
            <span class="alert-detail-item">$${currentPrice}</span>
            <span class="alert-detail-item ${changeClass}">${dailyChange}%</span>
          </div>
        </div>
        <div class="alert-card-footer" style="justify-content:flex-end;">
          <button class="button-primary btn-mark-read" data-alert-id="${alert.id}">✓ קראתי</button>
        </div>
      </div>
    `;
  }

  setupCardEventListeners() {
    this.querySelectorAll('.btn-mark-read').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.alertId);
        this.markAlertAsRead(id);
      });
    });
  }

  async markAlertAsRead(alertId) {
    const btn = this.querySelector(`button[data-alert-id="${alertId}"]`);
    if (btn) { btn.disabled = true; btn.textContent = '✓ נקרא'; }
    try {
      const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
      const res = await fetch(`${base}/api/v1/alerts/${alertId}/mark-read`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const card = this.querySelector(`[data-alert-id="${alertId}"]`);
      if (card) {
        card.style.opacity = '0.5';
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.remove();
          this.alerts = this.alerts.filter(a => a.id !== alertId);
          this.updateCount();
          if (!this.alerts.length) this.renderAlerts();
          setTimeout(() => this.loadActiveAlerts(), 400);
        }, 220);
      }
    } catch (err) {
      console.error('failed marking alert as read', err);
      if (btn) { btn.disabled = false; btn.textContent = '✓ קראתי'; }
    }
  }

  // Helpers
  getTimeAgo(s) {
    const now = new Date();
    const d = new Date(s);
    const mins = Math.floor((now - d) / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'עכשיו';
    if (mins < 60) return `לפני ${mins} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days < 7) return `לפני ${days} ימים`;
    return d.toLocaleDateString('he-IL');
  }

  getAlertIcon(t) {
    const m = { price_alert: '🎯', stop_loss: '⚠️', volume_alert: '📊', custom_alert: '🔔' };
    return m[t] || '🔔';
  }

  getAlertTypeDisplay(t) {
    const m = { price_alert: 'התראת מחיר', stop_loss: 'עצירת הפסד', volume_alert: 'התראת נפח', custom_alert: 'התראה מותאמת' };
    return m[t] || t;
  }

  getEntityTypeDisplay(t) {
    const m = { account: 'חשבון', trade: 'טרייד', trade_plan: 'תכנון', ticker: 'טיקר' };
    return m[t] || t;
  }

  getRelatedTypeFromId(typeId) {
    const typeMap = {
      1: 'account',
      2: 'trade',
      3: 'trade_plan',
      4: 'ticker'
    };
    return typeMap[typeId] || 'unknown';
  }

  extractTickerFromCondition(c) {
    if (!c) return '';
    const m = c.match(/\b(AAPL|GOOGL|MSFT|TSLA|NVDA|SPY|QQQ|IWM|AMZN|META|NFLX|AMD|INTC|ORCL|CRM|ADBE)\b/i);
    return m ? m[1].toUpperCase() : '';
  }

  getRandomTicker() {
    const tickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'IWM', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE'];
    return tickers[Math.floor(Math.random() * tickers.length)];
  }

  getCurrentPrice(sym) {
    const p = {
      AAPL: '185.50', GOOGL: '2750.00', MSFT: '420.75', TSLA: '250.25',
      NVDA: '850.00', SPY: '450.30', QQQ: '380.45', IWM: '185.20',
      AMZN: '3200.00', META: '380.50', NFLX: '580.25', AMD: '120.75',
      INTC: '45.80', ORCL: '125.40', CRM: '280.90', ADBE: '520.60'
    };
    return p[sym] || '—';
  }

  getDailyChange(sym) {
    const c = {
      AAPL: '+2.5', GOOGL: '-1.2', MSFT: '+3.1', TSLA: '-0.8',
      NVDA: '+5.2', SPY: '+1.8', QQQ: '+2.3', IWM: '-0.5',
      AMZN: '+1.7', META: '-2.1', NFLX: '+4.3', AMD: '+6.8',
      INTC: '-1.5', ORCL: '+0.9', CRM: '+2.4', ADBE: '-0.7'
    };
    return c[sym] || '—';
  }

  getDailyChangeClass(sym) {
    const v = this.getDailyChange(sym);
    return typeof v === 'string' && v.startsWith('+') ? 'positive-change' : (typeof v === 'string' && v.startsWith('-') ? 'negative-change' : '');
  }

  /**
   * פונקציה לתרגום תנאי התראה לעברית
   * משתמשת בפונקציה הגלובלית אם זמינה, אחרת משתמשת בגרסה מקומית
   */
  formatAlertCondition(condition) {
    // בדיקה אם הפונקציה הגלובלית זמינה
    if (window.formatAlertCondition) {
      return window.formatAlertCondition(condition);
    }

    // גרסה מקומית כגיבוי
    if (!condition) return '-';

    const parsed = this.parseAlertCondition(condition);

    // המרת משתנה לעברית
    const variableLabels = {
      'price': 'מחיר',
      'daily_change': 'שינוי יומי',
      'moving_average': 'ממוצע נע',
      'volume': 'נפח מסחר'
    };

    // המרת אופרטור לעברית
    const operatorLabels = {
      'greater_than': '>',
      'less_than': '<',
      'crosses': 'חוצה',
      'crosses_up': 'חוצה למעלה',
      'crosses_down': 'חוצה למטה',
      'increases_by': 'עולה ב',
      'decreases_by': 'יורד ב',
      'increases_by_percent': 'עולה ב%',
      'decreases_by_percent': 'יורד ב%'
    };

    const variableDisplay = variableLabels[parsed.variable] || parsed.variable;
    const operatorDisplay = operatorLabels[parsed.operator] || parsed.operator;

    if (parsed.operator && parsed.value) {
      return `${variableDisplay} ${operatorDisplay} ${parsed.value}`;
    } else if (parsed.variable) {
      return parsed.variable; // אם אין אופרטור או ערך, נציג רק את המשתנה
    } else {
      return condition; // אם לא הצלחנו לפרק, נציג את המקורי
    }
  }

  /**
   * פונקציה לפרסור תנאי התראה
   * משתמשת בפונקציה הגלובלית אם זמינה, אחרת משתמשת בגרסה מקומית
   */
  parseAlertCondition(condition) {
    // בדיקה אם הפונקציה הגלובלית זמינה
    if (window.parseAlertCondition) {
      return window.parseAlertCondition(condition);
    }

    // גרסה מקומית כגיבוי
    if (!condition) return { variable: '', operator: '', value: '' };

    const parts = condition.split('|');
    if (parts.length >= 3) {
      return {
        variable: parts[0] || '',
        operator: parts[1] || '',
        value: parts[2] || ''
      };
    } else if (parts.length === 2) {
      return {
        variable: parts[0] || '',
        operator: parts[1] || '',
        value: ''
      };
    } else if (parts.length === 1) {
      return {
        variable: parts[0] || '',
        operator: '',
        value: ''
      };
    }

    return { variable: '', operator: '', value: '' };
  }
}

customElements.define('active-alerts', ActiveAlertsComponent);

// פונקציה לעדכון הקומפוננטה כאשר הפונקציות הגלובליות נטענות
window.updateActiveAlertsComponent = function () {
  const components = document.querySelectorAll('active-alerts');
  components.forEach(component => {
    if (component.checkGlobalFunctions && !component._functionsChecked) {
      component.checkGlobalFunctions();
    }
  });
};

// האזנה לשינויים בפונקציות הגלובליות
window.addEventListener('load', () => {
  // בדיקה אם הפונקציות זמינות אחרי טעינת הדף
  setTimeout(() => {
    if (window.formatAlertCondition && window.parseAlertCondition) {
      window.updateActiveAlertsComponent();
    }
  }, 1000);
});

// הפונקציות formatAlertCondition ו-parseAlertCondition הועברו לקובץ alerts.js
