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
  }

  connectedCallback() {
    this.render();
    this.loadActiveAlerts();
  }

  render() {
    this.innerHTML = `
      <div class="alerts-cards-container">
        <div class="alerts-header">
          <h3>🔔 התראות פעילות</h3>
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

  async loadActiveAlerts() {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      const response = await fetch('/api/v1/alerts/unread');
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
    const el = this.querySelector('#newAlertsCount');
    if (el) el.textContent = `${this.alerts.length} התראות`;
  }

  renderAlerts() {
    const container = this.querySelector('#alertsCards');
    if (!container) return;

    if (!this.alerts.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔕</div>
          <h4>אין התראות פעילות</h4>
          <p>כל ההתראות נקראו או שאין התראות חדשות כרגע</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.alerts.map(a => this.createAlertCardHTML(a)).join('');
    this.setupCardEventListeners();
  }

  createAlertCardHTML(alert) {
    const timeAgo = this.getTimeAgo(alert.created_at);
    const icon = this.getAlertIcon(alert.type);
    const ticker = this.extractTickerFromCondition(alert.condition) || this.getRandomTicker();
    const currentPrice = this.getCurrentPrice(ticker);
    const dailyChange = this.getDailyChange(ticker);
    const changeClass = this.getDailyChangeClass(ticker);

    return `
      <div class="alert-card" data-alert-id="${alert.id}">
        <div class="alert-card-header">
          <h4 class="alert-card-title">${icon} ${ticker || 'התראה'}</h4>
          <span class="alert-card-time">${timeAgo}</span>
        </div>
        <div class="alert-card-content">
          <p class="alert-card-message"><strong>${alert.message || alert.condition || ''}</strong></p>
          <p class="alert-card-message">${alert.condition || ''}</p>
          <div class="alert-card-details">
            <span class="alert-detail-item">${this.getAlertTypeDisplay(alert.type)}</span>
            <span class="alert-detail-item">${this.getEntityTypeDisplay(alert.related_type)}</span>
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
      const res = await fetch(`/api/v1/alerts/${alertId}/mark-read`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });
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
}

customElements.define('active-alerts', ActiveAlertsComponent);
