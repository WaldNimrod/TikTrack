/**
 * Active Alerts Component (Light DOM)
 * קומפוננטה להצגת התראות פעילות שמשתמשת בסגנונות הכלליים של האתר
 * שימוש: <active-alerts></active-alerts>
 *
 * Dependencies:
 * - main.js (global utilities and alert functions)
 * - translation-utils.js (translation functions)
 * - alerts.js (formatAlertCondition and parseAlertCondition functions)
 *
 * File: trading-ui/scripts/active-alerts-component.js
 * Version: 1.9.9
 * Last Updated: August 26, 2025
 *
 * Features:
 * - מציג איקון פעמון עם מספר אדום בכותרת הסקשן כשיש התראות חדשות
 * - עובד גם בסקשן סגור
 * - עדכון אוטומטי של האיקון כשהתראות משתנות
 * - תצוגת כרטיסיות התראות עם פרטים מלאים
 * - רקע צבעוני לפי סוג האובייקט המקושר (לא לפי סוג ההתראה)
 * - כרטיסיית תנאי עם עיצוב מיוחד לפני המחיר
 * - איקונים לפי סוג האובייקט המקושר (🏦📈📋📊)
 * - מקרא צבעים חמוד מתחת להתראות
 * - סגירה אוטומטית של הסקשן כשאין התראות
 * - פתיחה אוטומטית של הסקשן כשיש התראות
 * - מיון התראות לפי זמן (חדשות קודם)
 * - לחיצה על כותרת הסימבול פותחת דף טיקר (בפיתוח)
 * - לחיצה על אובייקט מקושר פותחת מודל (בפיתוח)
 * - תמיכה במבנה מורכב של תנאים: variable | operator | value
 * - תמיכה בערכים פשוטים: price_target, stop_loss, וכו'
 *
 * Color Scheme by Related Object Type:
 * - 💰 חשבון (type=1): צבע טורקיז #29a6a8 / #1f8a8c
 * - 📈 טרייד (type=2): צבע ירוק #28a745 / #1e7e34
 * - 📋 תוכנית טרייד (type=3): צבע כתום #ff9500 / #e67e00
 * - 📊 טיקר (type=4): צבע אדום #dc3545 / #c82333
 *
 * Database Constraints:
 * - שדה condition מוגבל לאילוץ CHECK
 * - מבנה מורכב: variable | operator | value
 * - ערכים פשוטים: above, below, price_target, stop_loss, וכו'
 *
 * Related Object Display Format:
 * - טרייד: "🔗 טרייד | סווינג | Long | 24.3.25"
 * - תוכנית: "🔗 תוכנית | השקעה | Short | 24.3.25"
 * - חשבון: "🔗 חשבון מעודכן (USD)"
 * - טיקר: "🔗 טיקר: AAPL"
 *
 * Styling Features:
 * - רקע שקוף 10% (0.1) לפי סוג האובייקט
 * - קו שמאלי צבעוני 4px
 * - כותרת בצבע מתאים לרקע
 * - כרטיסיית תנאי עם רקע לבן שקוף
 * - מקרא צבעים ללא כותרת וללא איקונים
 * - grid layout עם minmax(350px, 1fr)
 * - רווח פנימי 20px לאיקון ההתראות
 * - קישורים בצבע ירוק טורקיז #29a6a8
 */

class ActiveAlertsComponent extends HTMLElement {
  constructor() {
    super();
    this.alerts = [];
    this.isLoading = false;
    this._functionsChecked = false;
    this._sectionHeader = null;
    this._alertIcon = null;
    this._relatedData = {
      accounts: [],
      trades: [],
      tradePlans: [],
      tickers: [],
    };
    this._relatedDataLoaded = false;
  }

  connectedCallback() {
    this.render();
    this.checkGlobalFunctions();
    this.loadActiveAlerts();
    this.setupSectionHeaderAlertIcon();

    // עדכון איקון ההתראות כל 5 שניות
    this._alertIconInterval = setInterval(() => {
      if (this.isConnected) {
        this.updateSectionHeaderAlertIcon();
      }
    }, 5000);

    // האזנה לשינויים במצב הסקשן
    this.setupSectionToggleListener();

    // בדיקה שהסגנונות נטענו
    ActiveAlertsComponent.checkStylesLoaded();
  }

  disconnectedCallback() {
    // ניקוי interval אם הקומפוננטה מוסרת
    if (this._alertIconInterval) {
      clearInterval(this._alertIconInterval);
      this._alertIconInterval = null;
    }

    // הסרת איקון ההתראות מהכותרת
    this.removeSectionHeaderAlertIcon();
  }

  render() {
    this.innerHTML = `
      <div class="active-alerts" data-role="container">
        <div class="active-alerts__header">
          <div class="active-alerts__title-group">
            <span class="active-alerts__title-icon" aria-hidden="true">🔔</span>
            <span class="active-alerts__title-text" data-role="title-text">התראות פעילות</span>
            <span class="active-alerts__count-badge is-hidden" data-role="count" aria-live="polite">0</span>
              </div>
          <div class="active-alerts__legend" data-role="legend">
            <div class="active-alerts__legend-item" data-entity-type="ticker">
              <img src="images/icons/tickers.svg" alt="טיקר" class="active-alerts__legend-icon">
              <span class="active-alerts__legend-label">טיקר</span>
            </div>
            <div class="active-alerts__legend-item" data-entity-type="trade_plan">
              <img src="images/icons/trade_plans.svg" alt="תוכנית" class="active-alerts__legend-icon">
              <span class="active-alerts__legend-label">תוכנית</span>
              </div>
            <div class="active-alerts__legend-item" data-entity-type="trade">
              <img src="images/icons/trades.svg" alt="טרייד" class="active-alerts__legend-icon">
              <span class="active-alerts__legend-label">טרייד</span>
            </div>
            <div class="active-alerts__legend-item" data-entity-type="trading_account">
              <img src="images/icons/trading_accounts.svg" alt="חשבון מסחר" class="active-alerts__legend-icon">
              <span class="active-alerts__legend-label">חשבון</span>
              </div>
            </div>
              </div>

        <div class="active-alerts__body">
          <div class="active-alerts__loading is-hidden" data-role="loading">
            <span class="active-alerts__loading-spinner" aria-hidden="true"></span>
            <span class="active-alerts__loading-text">טוען התראות...</span>
            </div>
          <div class="active-alerts__list is-hidden" data-role="list" role="list"></div>
          <div class="active-alerts__empty is-hidden" data-role="empty-state">
            <span class="active-alerts__empty-icon" aria-hidden="true">🔕</span>
            <span class="active-alerts__empty-text">אין התראות חדשות</span>
          </div>
        </div>
      </div>
    `;

    this.cacheElements();
    this.updateHeaderState();
  }

  cacheElements() {
    this._elements = {
      container: this.querySelector('[data-role="container"]'),
      titleText: this.querySelector('[data-role="title-text"]'),
      countBadge: this.querySelector('[data-role="count"]'),
      legend: this.querySelector('[data-role="legend"]'),
      list: this.querySelector('[data-role="list"]'),
      emptyState: this.querySelector('[data-role="empty-state"]'),
      loading: this.querySelector('[data-role="loading"]'),
    };
  }

  /**
   * בדיקת זמינות פונקציות גלובליות
   */
  checkGlobalFunctions() {
    if (this._functionsChecked) {return;}
      this._functionsChecked = true;
  }

  async loadActiveAlerts() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.setLoadingState(true);

    try {
      const response = await fetch('/api/alerts/unread');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const apiData = await response.json();
      this.alerts = Array.isArray(apiData?.data) ? apiData.data : [];

      await this.ensureRelatedData();

      this.renderAlerts();
      this.updateHeaderState();
      this.updateSectionHeaderAlertIcon();
      this.log('info', 'Active alerts loaded', { count: this.alerts.length });
    } catch (error) {
      this.alerts = [];
      this.renderAlerts();
      this.updateHeaderState();
      this.updateSectionHeaderAlertIcon();
      this.handleLoadError(error);
    } finally {
      this.isLoading = false;
      this.setLoadingState(false);
    }
  }

  updateHeaderState() {
    const hasAlerts = this.alerts.length > 0;

    if (this._elements?.countBadge) {
      this._elements.countBadge.textContent = String(this.alerts.length);
      this._elements.countBadge.classList.toggle('is-hidden', !hasAlerts);
    }

    if (this._elements?.titleText) {
      this._elements.titleText.classList.toggle('active-alerts__title-text--muted', !hasAlerts);
    }

    if (this._elements?.legend) {
      this._elements.legend.classList.toggle('is-hidden', !hasAlerts);
    }

    if (this._elements?.list) {
      this._elements.list.classList.toggle('is-hidden', !hasAlerts);
    }

    if (this._elements?.emptyState) {
      this._elements.emptyState.classList.toggle('is-hidden', hasAlerts);
    }
  }

  renderAlerts() {
    const listContainer = this._elements?.list;
    if (!listContainer) {
      return;
    }

    listContainer.innerHTML = '';

    if (!this.alerts.length) {
      return;
    }

    const sortedAlerts = [...this.alerts].sort((a, b) => {
      const timeA = new Date(a.triggered_at || a.created_at || 0);
      const timeB = new Date(b.triggered_at || b.created_at || 0);
      return timeB - timeA;
    });

    const fragment = document.createDocumentFragment();

    sortedAlerts.forEach(alert => {
      const card = this.createAlertCardElement(alert);
      if (card) {
        fragment.appendChild(card);
      }
    });

    listContainer.appendChild(fragment);
  }

  createAlertCardElement(alert) {
    if (!alert || typeof alert !== 'object') {
      this.log('warn', 'Skipping invalid alert entry', { alert });
      return null;
    }

    const alertId = Number(alert.id);
    const symbol = this.resolveSymbol(alert);
    const relatedType = this.resolveRelatedType(alert);
    const metaInfo = this.buildRelatedMeta(alert, relatedType, symbol);
    const relatedMeta = metaInfo.meta;
    const displayName = metaInfo.displayName;
    const conditionText = this.buildConditionText(alert);
    const timestamp = this.formatAlertTimestamp(alert);

    const card = document.createElement('article');
    card.className = 'active-alerts__card';
    card.setAttribute('role', 'listitem');
    if (Number.isFinite(alertId)) {
      card.dataset.alertId = String(alertId);
    }

    const header = document.createElement('div');
    header.className = 'active-alerts__card-header';

    header.appendChild(this.createHeaderContent(alert, relatedType, relatedMeta, displayName, symbol));
    header.appendChild(this.createStatusElement(alert));

    const body = document.createElement('div');
    body.className = 'active-alerts__card-body';

    if (conditionText) {
      const conditionRow = document.createElement('div');
      conditionRow.className = 'active-alerts__row active-alerts__row--condition';
      const conditionLabel = document.createElement('span');
      conditionLabel.className = 'active-alerts__row-label';
      conditionLabel.textContent = 'תנאי';
      const conditionValue = document.createElement('span');
      conditionValue.className = 'active-alerts__row-value';
      conditionValue.textContent = conditionText;
      conditionRow.appendChild(conditionLabel);
      conditionRow.appendChild(conditionValue);
      body.appendChild(conditionRow);
    }

    if (alert.message) {
      const messageRow = document.createElement('div');
      messageRow.className = 'active-alerts__row active-alerts__row--message';
      const messageLabel = document.createElement('span');
      messageLabel.className = 'active-alerts__row-label';
      messageLabel.textContent = 'הודעה';
      const messageValue = document.createElement('span');
      messageValue.className = 'active-alerts__row-value';
      messageValue.textContent = String(alert.message);
      messageRow.appendChild(messageLabel);
      messageRow.appendChild(messageValue);
      body.appendChild(messageRow);
    }

    const footer = document.createElement('div');
    footer.className = 'active-alerts__card-footer';

    const timeEl = document.createElement('time');
    timeEl.className = 'active-alerts__timestamp';
    timeEl.textContent = timestamp.display;
    if (timestamp.iso) {
      timeEl.dateTime = timestamp.iso;
    }
    footer.appendChild(timeEl);

    const actions = document.createElement('div');
    actions.className = 'active-alerts__actions';

    if (Number.isFinite(alertId)) {
      const markBtn = document.createElement('button');
      markBtn.type = 'button';
      markBtn.className = 'active-alerts__mark-read';
      markBtn.dataset.alertId = String(alertId);
      markBtn.setAttribute('aria-label', 'סמן התראה כנקראה');
      markBtn.textContent = window.BUTTON_ICONS?.READ || '✓';
      markBtn.addEventListener('click', () => this.markAlertAsRead(alertId, markBtn));
      actions.appendChild(markBtn);
    }

    footer.appendChild(actions);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    return card;
  }

  createHeaderContent(alert, relatedType, relatedMeta, displayName, symbol) {
    const container = document.createElement('div');
    container.className = 'active-alerts__header-linked';

    if (window.FieldRendererService && typeof window.FieldRendererService.renderLinkedEntity === 'function') {
      try {
        const html = window.FieldRendererService.renderLinkedEntity(
          relatedType,
          alert?.related_id,
          displayName || symbol,
          relatedMeta,
        );
        if (html) {
          container.innerHTML = html;
          const linkedElement = container.firstElementChild;
          if (linkedElement) {
            linkedElement.classList.add('active-alerts__linked-entity');
            if (symbol) {
              linkedElement.addEventListener('click', (event) => {
                event.preventDefault();
                this.handleSymbolClick(symbol);
              });
            }
            return container;
          }
        }
      } catch (error) {
        this.log('warn', 'Falling back to basic header rendering', { error: error?.message });
      }
    }

    const fallbackGroup = document.createElement('div');
    fallbackGroup.className = 'active-alerts__fallback';

    const headerLine = document.createElement('div');
    headerLine.className = 'active-alerts__fallback-primary';

    const iconPath = this.getIconPath(relatedType);
    const entityLabel = this.getEntityLabel(relatedType);

    if (iconPath) {
      const icon = document.createElement('img');
      icon.className = 'active-alerts__symbol-icon';
      icon.src = iconPath;
      icon.alt = entityLabel;
      icon.width = 20;
      icon.height = 20;
      headerLine.appendChild(icon);
    }

    const primaryText = document.createElement('span');
    primaryText.className = 'active-alerts__fallback-text';
    const parts = [entityLabel];
    if (displayName) {
      parts.push(displayName);
    }
    const formattedDate = this.formatMetaDate(relatedMeta?.date);
    if (formattedDate) {
      parts.push(formattedDate);
    }
    primaryText.textContent = parts.filter(Boolean).join(' | ');
    headerLine.appendChild(primaryText);

    fallbackGroup.appendChild(headerLine);

    const secondaryLine = document.createElement('div');
    secondaryLine.className = 'active-alerts__fallback-secondary';

    const statusBadge = this.createStatusBadge(relatedMeta?.status, relatedType);
    if (statusBadge) {
      secondaryLine.appendChild(statusBadge);
    }

    if (relatedMeta?.side) {
      secondaryLine.appendChild(this.createSideBadge(relatedMeta.side));
    }

    if (relatedMeta?.investment_type) {
      secondaryLine.appendChild(this.createTypeBadge(relatedMeta.investment_type));
    }

    if (secondaryLine.children.length > 0) {
      fallbackGroup.appendChild(secondaryLine);
    }

    container.appendChild(fallbackGroup);
    return container;
  }

  async ensureRelatedData() {
    if (this._relatedDataLoaded) {
      return;
    }

    try {
      const [accountsRes, tradesRes, tradePlansRes, tickersRes] = await Promise.all([
        fetch('/api/trading_accounts/').then(r => (r.ok ? r.json() : { data: [] })).catch(() => ({ data: [] })),
        fetch('/api/trades/').then(r => (r.ok ? r.json() : { data: [] })).catch(() => ({ data: [] })),
        fetch('/api/trade_plans/').then(r => (r.ok ? r.json() : { data: [] })).catch(() => ({ data: [] })),
        fetch('/api/tickers/').then(r => (r.ok ? r.json() : { data: [] })).catch(() => ({ data: [] })),
      ]);

      this._relatedData = {
        accounts: (accountsRes.data || accountsRes || []).filter(item => item && typeof item === 'object'),
        trades: (tradesRes.data || tradesRes || []).filter(item => item && typeof item === 'object'),
        tradePlans: (tradePlansRes.data || tradePlansRes || []).filter(item => item && typeof item === 'object'),
        tickers: (tickersRes.data || tickersRes || []).filter(item => item && typeof item === 'object'),
      };

      this._relatedDataLoaded = true;
    } catch (error) {
      this.log('warn', 'Failed to load related data for active alerts component', { error: error?.message });
      this._relatedData = {
        accounts: [],
        trades: [],
        tradePlans: [],
        tickers: [],
      };
    }
  }

  async markAlertAsRead(alertId, triggerButton) {
    if (!Number.isFinite(alertId)) {
      return;
    }

    if (triggerButton) {
      triggerButton.disabled = true;
      triggerButton.classList.add('is-loading');
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}/mark-read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const card = this._elements?.list?.querySelector(`[data-alert-id="${alertId}"]`);
      if (card) {
        card.classList.add('is-dismissing');
        setTimeout(() => card.remove(), 180);
      }

      this.alerts = this.alerts.filter(alert => Number(alert.id) !== alertId);
      this.updateHeaderState();
      this.updateSectionHeaderAlertIcon();

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('התראה עודכנה', 'התראה סומנה כנקראה');
      }

      await this.loadActiveAlerts();
      this.log('info', 'Alert marked as read', { alertId });
    } catch (error) {
      this.log('error', 'Failed to mark alert as read', { alertId, error: error?.message });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון התראה', error?.message || 'אירעה שגיאה בעת סימון ההתראה כנקראה');
      }
      if (triggerButton) {
        triggerButton.disabled = false;
      }
    } finally {
      if (triggerButton) {
        triggerButton.classList.remove('is-loading');
      }
    }
  }

  handleSymbolClick(symbol) {
    if (!symbol) {
      if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'אין סימול זמין להתראה זו');
      }
      return;
    }

    if (typeof window.showTickerPage === 'function') {
      window.showTickerPage(symbol);
      return;
    }

    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', `דף הטיקר עבור ${symbol} ייפתח בקרוב`);
    }
  }

  buildRelatedMeta(alert, relatedType, symbol) {
    const relatedId = alert?.related_id || alert?.related_object_id || null;
    const data = this._relatedData || {};
    const { accounts = [], trades = [], tradePlans = [], tickers = [] } = data;

    const baseMeta = {
      meta: {
        renderMode: 'notes-table',
        date: this.ensureDateEnvelope(alert?.created_at),
        status: alert?.status,
        side: alert?.side,
        investment_type: alert?.investment_type,
        ticker: symbol,
        id: relatedId,
      },
      displayName: symbol,
    };

    switch (relatedType) {
    case 'trading_account': {
      const account = accounts.find(acc => acc && Number(acc.id) === Number(relatedId));
      const accountName = account?.name || account?.account_name || `חשבון מסחר ${relatedId || ''}`.trim();
      return {
        displayName: accountName,
        meta: {
          ...baseMeta.meta,
          name: accountName,
          currency: account?.currency_symbol || account?.currency || '',
        },
      };
    }
    case 'trade': {
      const trade = trades.find(tr => tr && Number(tr.id) === Number(relatedId));
      const tradeTicker = trade?.ticker_symbol ||
        trade?.ticker?.symbol ||
        (trade?.ticker_id ? this.findTickerSymbol(tickers, trade.ticker_id) : symbol);
      return {
        displayName: tradeTicker || symbol || `טרייד ${relatedId}`,
        meta: {
          ...baseMeta.meta,
          ticker: tradeTicker || symbol,
          date: this.ensureDateEnvelope(
            trade?.created_at_envelope || trade?.createdAtEnvelope || trade?.created_at || trade?.opened_at || trade?.date,
          ),
          side: trade?.side || '',
          investment_type: trade?.investment_type || '',
          status: trade?.status || alert?.status,
        },
      };
    }
    case 'trade_plan': {
      const plan = tradePlans.find(tp => tp && Number(tp.id) === Number(relatedId));
      const planTicker = plan?.ticker_symbol ||
        plan?.ticker?.symbol ||
        (plan?.ticker_id ? this.findTickerSymbol(tickers, plan.ticker_id) : symbol);
      return {
        displayName: planTicker || symbol || `תוכנית ${relatedId}`,
        meta: {
          ...baseMeta.meta,
          ticker: planTicker || symbol,
          date: this.ensureDateEnvelope(
            plan?.created_at_envelope || plan?.createdAtEnvelope || plan?.created_at || plan?.date,
          ),
          side: plan?.side || '',
          investment_type: plan?.investment_type || '',
          status: plan?.status || alert?.status,
        },
      };
    }
    case 'ticker': {
      const ticker = tickers.find(tk => tk && Number(tk.id) === Number(relatedId));
      const tickerSymbol = ticker?.symbol || symbol || `טיקר ${relatedId}`;
      return {
        displayName: tickerSymbol,
        meta: {
          ...baseMeta.meta,
          ticker: tickerSymbol,
          date: this.ensureDateEnvelope(alert?.triggered_at || alert?.created_at),
        },
      };
    }
    default:
      return baseMeta;
    }
  }

  resolveRelatedType(alert) {
    if (alert?.related_type) {
      return String(alert.related_type);
    }

    switch (Number(alert?.related_type_id)) {
    case 1:
      return 'trading_account';
    case 2:
      return 'trade';
    case 3:
      return 'trade_plan';
    case 4:
      return 'ticker';
    default:
      return 'alert';
    }
  }

  resolveSymbol(alert) {
    if (!alert) {
      return null;
    }

    if (alert.ticker_symbol) {
      return String(alert.ticker_symbol).trim();
    }

    if (alert.symbol) {
      return String(alert.symbol).trim();
    }

    return null;
  }

  getEntityLabel(relatedType) {
    if (window.LinkedItemsService && typeof window.LinkedItemsService.getEntityLabel === 'function') {
      try {
        return window.LinkedItemsService.getEntityLabel(relatedType);
      } catch (error) {
        this.log('warn', 'Failed to resolve entity label via LinkedItemsService', { relatedType, error: error?.message });
      }
    }

    const fallback = {
      trading_account: 'חשבון מסחר',
      trade: 'טרייד',
      trade_plan: 'תוכנית',
      ticker: 'טיקר',
      alert: 'התראה',
    };

    return fallback[relatedType] || 'פריט';
  }

  getIconPath(relatedType) {
  findTickerSymbol(tickers, tickerId) {
    const ticker = tickers.find(tk => tk && Number(tk.id) === Number(tickerId));
    return ticker?.symbol || null;
  }

  ensureDateEnvelope(value) {
    if (!value) {
      return null;
    }

    if (window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function') {
      return window.dateUtils.ensureDateEnvelope(value);
    }

    const date = this.toDate(value);
    if (!date) {
      return null;
    }
    return {
      epochMs: date.getTime(),
      utc: date.toISOString(),
    };
  }

  formatMetaDate(envelope) {
    if (!envelope) {
      return '';
    }

    if (window.FieldRendererService && typeof window.FieldRendererService.renderDateShort === 'function') {
      try {
        return window.FieldRendererService.renderDateShort(envelope);
      } catch {
        // ignore
      }
    }

    const date = this.toDate(envelope);
    if (!date) {
      return '';
    }

    return date.toLocaleDateString('he-IL');
  }

  createStatusBadge(status, relatedType) {
    if (!status) {
      return null;
    }

    if (window.FieldRendererService && typeof window.FieldRendererService.renderStatus === 'function') {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = window.FieldRendererService.renderStatus(status, relatedType);
      return wrapper.firstElementChild;
    }

    const badge = document.createElement('span');
    badge.className = 'active-alerts__fallback-badge';
    badge.textContent = status;
    return badge;
  }

  createSideBadge(side) {
    if (!side) {
      return null;
    }

    if (window.FieldRendererService && typeof window.FieldRendererService.renderSide === 'function') {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = window.FieldRendererService.renderSide(side);
      return wrapper.firstElementChild;
    }

    const badge = document.createElement('span');
    badge.className = 'active-alerts__fallback-badge';
    badge.textContent = side;
    return badge;
  }

  createTypeBadge(investmentType) {
    if (!investmentType) {
      return null;
    }

    if (window.FieldRendererService && typeof window.FieldRendererService.renderType === 'function') {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = window.FieldRendererService.renderType(investmentType);
      return wrapper.firstElementChild;
    }

    const badge = document.createElement('span');
    badge.className = 'active-alerts__fallback-badge';
    badge.textContent = investmentType;
    return badge;
  }

    if (window.LinkedItemsService && typeof window.LinkedItemsService.getLinkedItemIcon === 'function') {
      try {
        return window.LinkedItemsService.getLinkedItemIcon(relatedType);
      } catch (error) {
        this.log('warn', 'Failed to resolve icon via LinkedItemsService', { relatedType, error: error?.message });
      }
    }

    const fallback = {
      trading_account: 'images/icons/trading_accounts.svg',
      trade: 'images/icons/trades.svg',
      trade_plan: 'images/icons/trade_plans.svg',
      ticker: 'images/icons/tickers.svg',
      alert: 'images/icons/alerts.svg',
    };

    return fallback[relatedType] || 'images/icons/alerts.svg';
  }

  buildConditionText(alert) {
    if (!alert) {return '';}

    if (typeof window.translateConditionFields === 'function' &&
      alert.condition_attribute && alert.condition_operator !== undefined && alert.condition_number !== undefined) {
      try {
        return window.translateConditionFields(alert.condition_attribute, alert.condition_operator, alert.condition_number);
      } catch (error) {
        this.log('warn', 'translateConditionFields failed', { error: error?.message });
      }
    }

    if (alert.condition_display_text) {
      return String(alert.condition_display_text);
    }

    if (alert.condition) {
      return String(alert.condition);
    }

    return '';
  }

  createStatusElement(alert) {
    const statusContainer = document.createElement('div');
    statusContainer.className = 'active-alerts__status';

    if (window.FieldRendererService && typeof window.FieldRendererService.renderStatus === 'function') {
      try {
        statusContainer.innerHTML = window.FieldRendererService.renderStatus(alert.status, 'alert');
        return statusContainer;
      } catch (error) {
        this.log('warn', 'renderStatus failed', { error: error?.message });
      }
    }

    const statusSpan = document.createElement('span');
    statusSpan.className = 'active-alerts__status-text';
    statusSpan.textContent = this.getStatusDisplay(alert);
    statusContainer.appendChild(statusSpan);
    return statusContainer;
  }

  getStatusDisplay(alert) {
    if (typeof window.getAlertStatusDisplay === 'function') {
      try {
        return window.getAlertStatusDisplay(alert.status, alert.is_triggered);
      } catch (error) {
        this.log('warn', 'getAlertStatusDisplay failed', { error: error?.message });
      }
    }

    return alert?.status ? String(alert.status) : 'לא זמין';
  }

  formatAlertTimestamp(alert) {
    const source = alert?.triggered_at || alert?.created_at;
    const date = this.toDate(source);
    if (!date) {
      return { display: 'תאריך לא זמין', iso: null };
    }

    const absolute = typeof window.formatDateTime === 'function'
      ? window.formatDateTime(date)
      : date.toLocaleString('he-IL');

    const relative = this.getRelativeTime(date);
    return {
      display: relative ? `${relative} · ${absolute}` : absolute,
      iso: date.toISOString(),
    };
  }

  getRelativeTime(date) {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 0) {return null;}
    if (diffSeconds < 60) {return 'עכשיו';}
    if (diffSeconds < 3600) {return `לפני ${Math.floor(diffSeconds / 60)} דקות`;}
    if (diffSeconds < 86400) {return `לפני ${Math.floor(diffSeconds / 3600)} שעות`;}
    if (diffSeconds < 604800) {return `לפני ${Math.floor(diffSeconds / 86400)} ימים`;}

    return null;
  }

  toDate(value) {
    if (!value) {return null;}

    if (typeof window.toDateObject === 'function') {
      const converted = window.toDateObject(value);
      if (converted instanceof Date && !Number.isNaN(converted.getTime())) {
        return converted;
      }
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  setLoadingState(isLoading) {
    if (this._elements?.loading) {
      this._elements.loading.classList.toggle('is-hidden', !isLoading);
    }

    if (isLoading && this._elements?.list) {
      this._elements.list.classList.add('is-hidden');
    }

    if (isLoading && this._elements?.emptyState) {
      this._elements.emptyState.classList.add('is-hidden');
    }
  }

  handleLoadError(error) {
    this.log('error', 'Failed to load active alerts', { error: error?.message });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת התראות פעילות', error?.message || 'אירעה שגיאה בעת טעינת ההתראות');
    }
  }

  log(level, message, extra = {}) {
    if (window.Logger && typeof window.Logger[level] === 'function') {
      window.Logger[level](message, { component: 'ActiveAlertsComponent', ...extra });
    }
  }

  /**
 * מציאת כותרת הסקשן והוספת איקון התראות
 */
  setupSectionHeaderAlertIcon() {
    // חיפוש כותרת הסקשן - נחפש את הכותרת הקרובה ביותר
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      // חיפוש בסקשן האב
      const parentSection = currentElement.closest('.content-section, .top-section, .section-container');
      if (parentSection) {
        const sectionHeader = parentSection.querySelector('.section-header');
        if (sectionHeader) {
          this._sectionHeader = sectionHeader;
          this.createAlertIcon();
          break;
        }
      }

      // חיפוש בתוך הסקשן הנוכחי (רק אם לא מצאנו בסקשן האב)
      if (!this._sectionHeader) {
        const sectionHeader = currentElement.querySelector('.section-header, .alerts-header');
        if (sectionHeader) {
          this._sectionHeader = sectionHeader;
          this.createAlertIcon();
          break;
        }
      }

      currentElement = currentElement.parentElement;
    }
  }

  /**
   * יצירת איקון התראות בכותרת הסקשן
   */
  createAlertIcon() {
    if (!this._sectionHeader) {return;}

    // הסרת איקון קיים אם יש
    this.removeSectionHeaderAlertIcon();

    // יצירת איקון חדש
    this._alertIcon = document.createElement('div');
    this._alertIcon.className = 'section-alert-icon active-alerts__section-icon';

    const bellButton = document.createElement('button');
    bellButton.type = 'button';
    bellButton.className = 'active-alerts__section-trigger';
    bellButton.setAttribute('aria-label', 'פתח התראות פעילות');

    const bellIcon = document.createElement('span');
    bellIcon.className = 'active-alerts__section-bell';
    bellIcon.setAttribute('aria-hidden', 'true');
    bellIcon.textContent = '🔔';

    const badge = document.createElement('span');
    badge.className = 'active-alerts__section-count is-hidden';
    badge.id = 'sectionAlertCount';
    badge.textContent = '0';

    bellButton.appendChild(bellIcon);
    bellButton.appendChild(badge);
    this._alertIcon.appendChild(bellButton);

    // הוספת event listener לאיקון
    bellButton.addEventListener('click', () => {
        this.openSectionWithAlerts();
      });

    // הוספה לכותרת הסקשן - בצד שמאל (ימין ב-RTL) ליד כפתור הסגירה
    const tableActions = this._sectionHeader.querySelector('.table-actions');
    if (tableActions) {
      // הוספה בתחילת table-actions (לפני כפתור הסגירה)
      tableActions.insertBefore(this._alertIcon, tableActions.firstChild);
    } else {
      // אם אין table-actions, נוסיף בסוף הכותרת
      this._sectionHeader.appendChild(this._alertIcon);
    }

    // עדכון האיקון עם מספר ההתראות הנוכחי
    this.updateSectionHeaderAlertIcon();
  }

  /**
   * פתיחת הסקשן שמכיל את ההתראות
   */
  openSectionWithAlerts() {
    // חיפוש הסקשן שמכיל את הקומפוננט
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      // חיפוש בסקשן האב
      const parentSection = currentElement.closest('.content-section, .top-section, .section-container');
      if (parentSection) {
        // חיפוש כפתור פתיחה/סגירה של הסקשן
        const toggleBtn = parentSection.querySelector('.filter-toggle-btn, .top-toggle-btn, [onclick*="toggle"]');
        if (toggleBtn) {
          // בדיקה אם הסקשן סגור
          const sectionBody = parentSection.querySelector('.section-body, .active-alerts__list');
          if (sectionBody && (sectionBody.style.display === 'none' || sectionBody.classList.contains('is-hidden'))) {
            // לחיצה על כפתור הפתיחה
            toggleBtn.click();
          }
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }

    // גלילה לסקשן ההתראות
    setTimeout(() => {
      this.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  /**
 * עדכון איקון ההתראות בכותרת הסקשן
 */
  updateSectionHeaderAlertIcon() {
    // בדיקה אם האיקון קיים, אם לא - יצירתו מחדש
    if (!this._alertIcon || !this._alertIcon.isConnected) {
      this.setupSectionHeaderAlertIcon();
      return;
    }

    const countBadge = this._alertIcon.querySelector('#sectionAlertCount');
    if (countBadge) {
      countBadge.textContent = String(this.alerts.length);
      countBadge.classList.toggle('is-hidden', this.alerts.length === 0);
    }

    const shouldHighlight = this.alerts.length > 0 && this.isSectionClosed();
    this._alertIcon.classList.toggle('has-alerts', shouldHighlight);
    this._alertIcon.classList.toggle('is-hidden', !shouldHighlight);
  }

  /**
   * בדיקה אם הסקשן סגור
   */
  isSectionClosed() {
    // חיפוש הסקשן שמכיל את הקומפוננט
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      const parentSection = currentElement.closest('.content-section, .top-section, .section-container');
      if (parentSection) {
        // חיפוש הגוף של הסקשן
        const sectionBody = parentSection.querySelector('.section-body, .active-alerts__list');
        if (sectionBody) {
          // בדיקה אם הגוף מוסתר
          return sectionBody.style.display === 'none' ||
            sectionBody.style.height === '0px' ||
            sectionBody.classList.contains('collapsed') ||
            sectionBody.classList.contains('is-hidden');
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  }

  /**
   * הגדרת האזנה לשינויים במצב הסקשן
   */
  setupSectionToggleListener() {
    // חיפוש הסקשן שמכיל את הקומפוננט
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      const parentSection = currentElement.closest('.content-section, .top-section, .section-container');
      if (parentSection) {
        // חיפוש כפתור הפתיחה/סגירה
        const toggleBtn = parentSection.querySelector('.filter-toggle-btn, .top-toggle-btn, [onclick*="toggle"]');
        if (toggleBtn) {
          // האזנה ללחיצות על כפתור הפתיחה/סגירה
          toggleBtn.addEventListener('click', () => {
            // עדכון האיקון אחרי קצת זמן (לתת לסקשן להתעדכן)
            setTimeout(() => {
              this.updateSectionHeaderAlertIcon();
            }, 100);
          });
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }
  }

  /**
   * בדיקה שהסגנונות נטענו
   */
  static checkStylesLoaded() {
    // בדיקה שהסגנונות שלנו נטענו
    const styleSheets = Array.from(document.styleSheets);
    const hasStyles = styleSheets.some(sheet => {
      try {
        const href = sheet?.href || '';
        return href.includes('_notifications.css') || href.includes('master.css');
      } catch {
        return false;
      }
    });

    if (!hasStyles && window.Logger) {
      window.Logger.warn('ActiveAlertsComponent: component styles not detected');
    }
  }

  /**
   * הסרת איקון ההתראות מהכותרת
   */
  removeSectionHeaderAlertIcon() {
    if (this._alertIcon && this._alertIcon.parentNode) {
      this._alertIcon.parentNode.removeChild(this._alertIcon);
      this._alertIcon = null;
    }
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
    // עדכון איקון ההתראות
    if (component.updateSectionHeaderAlertIcon) {
      component.updateSectionHeaderAlertIcon();
    }
  });
};

// פונקציה לעדכון איקון ההתראות בכל הקומפוננטים
window.updateAllAlertIcons = function () {
  const components = document.querySelectorAll('active-alerts');
  components.forEach(component => {
    if (component.updateSectionHeaderAlertIcon) {
      component.updateSectionHeaderAlertIcon();
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

// האזנה לשינויים בדף (כמו פתיחה/סגירה של סקשנים)
// window.addEventListener('DOMContentLoaded', () => {
//   // עדכון איקונים אחרי טעינת הדף
//   setTimeout(() => {
//     window.updateAllAlertIcons();
//   }, 500);
// });

// האזנה לשינויים ב-URL (ניווט בין עמודים)
let currentUrl = window.location.href;
window.addEventListener('popstate', () => {
  if (currentUrl !== window.location.href) {
    currentUrl = window.location.href;
    // עדכון איקונים אחרי ניווט
    setTimeout(() => {
      window.updateAllAlertIcons();
    }, 300);
  }
});

// פונקציה גלובלית להצגת הודעה על אובייקט מקושר
if (typeof window.showLinkedObjectMessage !== 'function') {
window.showLinkedObjectMessage = function () {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('אובייקט מקושר', 'הקישור לאובייקט המקושר יופעל בהמשך');
  }
};
}

// פונקציה גלובלית לפתיחת דף טיקר
if (typeof window.showTickerPage !== 'function') {
window.showTickerPage = function (symbol) {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('דף טיקר', `דף הטיקר עבור ${symbol} ייפתח בקרוב`);
  }
};
}

// פונקציה גלובלית להצגת מודל אובייקטים מקושרים
if (typeof window.showRelatedObjectModal !== 'function') {
window.showRelatedObjectModal = function (relatedTypeId, relatedObjectId) {
    if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification(
      'אובייקט מקושר',
        `פתיחת אובייקט מסוג ${relatedTypeId} עם מזהה ${relatedObjectId} - ייפתח בקרוב`,
      );
  }
};
}

// הפונקציות formatAlertCondition ו-parseAlertCondition הועברו לקובץ alerts.js


