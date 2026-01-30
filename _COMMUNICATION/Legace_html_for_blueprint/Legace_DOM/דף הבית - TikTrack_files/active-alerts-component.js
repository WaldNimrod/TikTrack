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
    this.activeFilterType = 'all';
    this._currentFilteredAlerts = null;
    this._filtersInitialized = false;
    this.cacheKey = 'alerts-data';
    this.defaultTitleText = 'התראות פעילות';
    this.emptyTitleText = 'אין התראות פעילות';
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
    this.textContent = '';
    const componentHTML = `
      <div class="active-alerts" data-role="container">
        <div class="active-alerts__header">
          <div class="active-alerts__title-group">
            <button
              type="button"
              class="active-alerts__title-trigger"
              data-onclick="navigateToPage('alerts')"
              aria-label="פתח עמוד ההתראות">
              <span class="active-alerts__title-icon" aria-hidden="true">🔔</span>
              <span class="active-alerts__title-text" data-role="title-text">${this.defaultTitleText}</span>
            </button>
            <span class="active-alerts__count-badge is-hidden" data-role="count" aria-live="polite">0</span>
          </div>
          <div class="active-alerts__filters" data-role="filters" aria-label="סינון לפי סוג התראה"></div>
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
    const parser = new DOMParser();
    const doc = parser.parseFromString(componentHTML, 'text/html');
    doc.body.childNodes.forEach(node => {
        this.appendChild(node.cloneNode(true));
    });

    this.cacheElements();
    this.initializeFilters();
    this.updateHeaderState();
  }

  cacheElements() {
    this._elements = {
      container: this.querySelector('[data-role="container"]'),
      titleGroup: this.querySelector('.active-alerts__title-group'),
      titleTrigger: this.querySelector('.active-alerts__title-trigger'),
      titleText: this.querySelector('[data-role="title-text"]'),
      countBadge: this.querySelector('[data-role="count"]'),
      filters: this.querySelector('[data-role="filters"]'),
      list: this.querySelector('[data-role="list"]'),
      emptyState: this.querySelector('[data-role="empty-state"]'),
      loading: this.querySelector('[data-role="loading"]'),
    };
  }

  initializeFilters(retryCount = 0) {
    if (this._filtersInitialized) {
      this.updateFilterButtons();
      return;
    }

    const container = this._elements?.filters;
    if (!container) {
      return;
    }

    const canGenerateFilters = typeof window.generateEntityTypeFilterButtons === 'function'
      && typeof window.generateAllFilterButton === 'function';

    if (!canGenerateFilters) {
      if (retryCount < 8) {
        setTimeout(() => this.initializeFilters(retryCount + 1), 200);
      }
      return;
    }

    const allButtonHtml = window.generateAllFilterButton({
      interactionMode: 'none',
      buttonClassName: 'active-alerts__filter-button active-alerts__filter-button--all',
      disableInlineStyles: true,
      label: 'הכל',
    });

    const entityButtonsHtml = window.generateEntityTypeFilterButtons(this.getFilterTypes(), {
      interactionMode: 'none',
      buttonClassName: 'active-alerts__filter-button',
      disableInlineStyles: true,
      iconSize: 18,
      showLabel: true,
      labelClassName: 'active-alerts__filter-label',
      iconClassName: 'active-alerts__filter-icon',
    });

    container.textContent = '';
    const filtersHTML = `
      <div class="active-alerts__filters-inner">
        ${allButtonHtml}
        ${entityButtonsHtml}
      </div>
    `;
    const parser = new DOMParser();
    const doc = parser.parseFromString(filtersHTML, 'text/html');
    doc.body.childNodes.forEach(node => {
        container.appendChild(node.cloneNode(true));
    });

    const buttons = container.querySelectorAll('button[data-type]');
    buttons.forEach(button => {
      const normalizedType = this.normalizeFilterType(button.dataset.type);
      button.dataset.type = normalizedType;
      button.type = 'button';
      if (!button.classList.contains('active-alerts__filter-button')) {
        button.classList.add('active-alerts__filter-button');
      }
      button.setAttribute('data-onclick', `window.ActiveAlertsFilterRouter && window.ActiveAlertsFilterRouter('${normalizedType}')`);
    });

    this._filtersInitialized = true;
    this.updateFilterButtons();
  }

  getFilterTypes() {
    return ['trading_account', 'trade', 'trade_plan', 'ticker'];
  }

  normalizeFilterType(type) {
    if (!type) {
      return 'all';
    }

    const normalized = String(type).trim();
    if (!normalized) {
      return 'all';
    }

    if (normalized === 'all') {
      return 'all';
    }

    if (normalized === 'account') {
      return 'trading_account';
    }

    const supportedTypes = this.getFilterTypes();
    return supportedTypes.includes(normalized) ? normalized : 'all';
  }

  mapFilterTypeToRelatedTypeId(type) {
    const mapping = {
      trading_account: 1,
      account: 1,
      trade: 2,
      trade_plan: 3,
      ticker: 4,
    };
    return Object.prototype.hasOwnProperty.call(mapping, type) ? mapping[type] : null;
  }

  async applyFilter(type) {
    const normalized = this.normalizeFilterType(type);
    if (normalized === this.activeFilterType) {
      return true;
    }

    this.activeFilterType = normalized;
    this.resetFilteredAlertsCache();
    this.updateFilterButtons();
    await this.renderAlerts();
    return true;
  }

  updateFilterButtons() {
    const container = this._elements?.filters;
    if (!container) {
      return;
    }

    const buttons = container.querySelectorAll('button[data-type]');
    buttons.forEach(button => {
      const buttonType = this.normalizeFilterType(button.dataset.type);
      const isActive = buttonType === this.activeFilterType;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
      button.disabled = this.alerts.length === 0 && buttonType !== 'all';
    });
  }

  getFilteredAlerts(force = false) {
    if (!force && Array.isArray(this._currentFilteredAlerts)) {
      return this._currentFilteredAlerts;
    }

    const alertsArray = Array.isArray(this.alerts) ? this.alerts : [];
    const filterType = this.normalizeFilterType(this.activeFilterType);

    if (filterType === 'all') {
      this._currentFilteredAlerts = alertsArray;
      return this._currentFilteredAlerts;
    }

    const targetTypeId = this.mapFilterTypeToRelatedTypeId(filterType);
    if (targetTypeId === null) {
      this._currentFilteredAlerts = [];
      return this._currentFilteredAlerts;
    }

    this._currentFilteredAlerts = alertsArray.filter(alert => Number(alert?.related_type_id) === targetTypeId);
    return this._currentFilteredAlerts;
  }

  resetFilteredAlertsCache() {
    this._currentFilteredAlerts = null;
  }

  updateEmptyStateMessage(totalCount, filteredCount) {
    const emptyState = this._elements?.emptyState;
    if (!emptyState) {
      return;
    }

    const textElement = emptyState.querySelector('.active-alerts__empty-text');
    if (!textElement) {
      return;
    }

    if (totalCount === 0) {
      textElement.textContent = 'אין התראות חדשות';
    } else if (filteredCount === 0) {
      textElement.textContent = 'אין התראות מתאימות לסינון הנוכחי';
    }
  }

  /**
   * בדיקת זמינות פונקציות גלובליות
   */
  checkGlobalFunctions() {
    if (this._functionsChecked) {return;}
    this._functionsChecked = true;
  }

  getCacheKey() {
    return this.cacheKey;
  }

  getCacheManager() {
    return window.UnifiedCacheManager || window.unifiedCacheManager || null;
  }

  getCacheTTL() {
    const env = String(window.API_ENV || 'development').toLowerCase();
    return env === 'production' ? 60000 : 0;
  }

  shouldUseCache() {
    const manager = this.getCacheManager();
    return Boolean(manager && manager.initialized === true && this.getCacheTTL() > 0);
  }

  async saveAlertsToCache(alerts) {
    if (!this.shouldUseCache()) {
      return;
    }

    const manager = this.getCacheManager();
    if (typeof manager?.save !== 'function') {
      return;
    }

    try {
      await manager.save(this.getCacheKey(), alerts, {
        layer: 'memory',
        ttl: this.getCacheTTL(),
        dependencies: ['accounts-data'],
        compress: false,
      });
    } catch (error) {
      this.log('warn', 'Failed to persist alerts data into cache', { error: error?.message });
    }
  }

  async invalidateAlertsCache() {
    const manager = this.getCacheManager();
    const cacheKey = this.getCacheKey();

    if (manager) {
      try {
        if (typeof manager.invalidate === 'function') {
          await manager.invalidate(cacheKey);
        } else if (typeof manager.clearByPattern === 'function') {
          await manager.clearByPattern(cacheKey);
        } else if (typeof manager.remove === 'function') {
          await manager.remove(cacheKey);
        }
      } catch (error) {
        this.log('warn', 'Failed to invalidate frontend alerts cache', { error: error?.message });
      }
    }

    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('alert-updated');
      } catch (error) {
        this.log('warn', 'CacheSyncManager invalidateByAction failed', { error: error?.message });
      }
    }
  }

  async fetchAlertsFromApi() {
    const response = await fetch('/api/alerts/unread', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const apiData = await response.json();
    return Array.isArray(apiData?.data) ? apiData.data : [];
  }

  async applyAlertsState(alerts) {
    this.alerts = Array.isArray(alerts) ? alerts : [];
    this.resetFilteredAlertsCache();
    await this.renderAlerts();
    this.updateHeaderState();
    this.updateSectionHeaderAlertIcon();
  }

  async loadActiveAlerts(options = {}) {
    const { force = false } = options;
    
    // CRITICAL: Track call stack to detect recursion
    if (!window.__LOAD_ACTIVE_ALERTS_CALL_STACK__) {
      window.__LOAD_ACTIVE_ALERTS_CALL_STACK__ = [];
    }
    
    const callInfo = {
      timestamp: Date.now(),
      stack: new Error().stack,
      force
    };
    
    // Check for recursion - if called again within 100ms
    const recentCall = window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.find(c => 
      Date.now() - c.timestamp < 100
    );
    
    if (recentCall && this.isLoading) {
      console.error('🚨 RECURSION DETECTED in loadActiveAlerts:', {
        callStack: window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.map(c => ({
          timestamp: c.timestamp,
          force: c.force
        })),
        recentCall: recentCall.stack
      });
      return; // Break recursion
    }
    
    window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.push(callInfo);
    // Keep only last 10 calls
    if (window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.length > 10) {
      window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.shift();
    }
    
    if (this.isLoading) {
      // Remove from call stack if already loading
      const index = window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.findIndex(c => 
        Math.abs(c.timestamp - callInfo.timestamp) < 10
      );
      if (index !== -1) {
        window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.splice(index, 1);
      }
      return;
    }

    this.isLoading = true;
    this.setLoadingState(true);

    const cacheManager = this.getCacheManager();
    const cacheEnabled = !force && this.shouldUseCache();

    const finalize = async (alerts, source) => {
      try {
        const normalizedAlerts = Array.isArray(alerts) ? alerts : [];
        await this.ensureRelatedData();
        await this.applyAlertsState(normalizedAlerts);
        this.log('info', 'Active alerts loaded', { source, count: this.alerts.length });
      } finally {
        // Remove from call stack
        const index = window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.findIndex(c => 
          Math.abs(c.timestamp - callInfo.timestamp) < 10
        );
        if (index !== -1) {
          window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.splice(index, 1);
        }
      }
    };

    try {
      if (cacheEnabled && typeof window.CacheTTLGuard?.ensure === 'function') {
        let resolvedFromCache = false;
        const cacheOptions = {
          layer: 'memory',
          ttl: this.getCacheTTL(),
          dependencies: ['accounts-data'],
          afterRead: () => { resolvedFromCache = true; },
        };

        const result = await window.CacheTTLGuard.ensure(this.getCacheKey(), async () => await this.fetchAlertsFromApi(), cacheOptions);

        await finalize(result, resolvedFromCache ? 'cache-hit' : 'api-refresh');
        return;
      }

      if (cacheEnabled && cacheManager) {
        let alerts = [];
        try {
          alerts = await cacheManager.get?.(this.getCacheKey(), {
            ttl: this.getCacheTTL(),
            dependencies: ['accounts-data'],
          });
        } catch (error) {
          this.log('warn', 'Failed to read alerts cache, falling back to API', { error: error?.message });
        }

        if (Array.isArray(alerts) && alerts.length) {
          await finalize(alerts, 'cache-hit');
          return;
        }

        const freshAlerts = await this.fetchAlertsFromApi();
        await this.saveAlertsToCache(freshAlerts);
        await finalize(freshAlerts, 'api-refresh');
        return;
      }

      const freshAlerts = await this.fetchAlertsFromApi();
      if (this.shouldUseCache()) {
        await this.saveAlertsToCache(freshAlerts);
      }
      await finalize(freshAlerts, force ? 'api-force' : 'api-direct');
    } catch (error) {
      this.alerts = [];
      this.resetFilteredAlertsCache();
      await this.renderAlerts();
      this.updateHeaderState();
      this.updateSectionHeaderAlertIcon();
      this.handleLoadError(error);
    } finally {
      this.isLoading = false;
      this.setLoadingState(false);
      this.updateHeaderState();
      
      // Remove from call stack
      const index = window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.findIndex(c => 
        Math.abs(c.timestamp - callInfo.timestamp) < 10
      );
      if (index !== -1) {
        window.__LOAD_ACTIVE_ALERTS_CALL_STACK__.splice(index, 1);
      }
    }
  }

  updateHeaderState() {
    const totalCount = Array.isArray(this.alerts) ? this.alerts.length : 0;
    const filteredAlerts = this.getFilteredAlerts();
    const filteredCount = filteredAlerts.length;
    const hasAnyAlerts = totalCount > 0;
    const hasFilteredAlerts = filteredCount > 0;

    if (this._elements?.container) {
      this._elements.container.classList.toggle('active-alerts--empty', !hasAnyAlerts);
    }

    if (this._elements?.countBadge) {
      const countText = !hasAnyAlerts || this.activeFilterType === 'all'
        ? String(totalCount)
        : `${filteredCount}/${totalCount}`;
      this._elements.countBadge.textContent = countText;
      this._elements.countBadge.classList.toggle('is-hidden', !hasAnyAlerts);
      if (this.activeFilterType !== 'all' && hasAnyAlerts) {
        this._elements.countBadge.setAttribute('title', `מסונן: ${filteredCount} מתוך ${totalCount}`);
      } else {
        this._elements.countBadge.removeAttribute('title');
      }
    }

    if (this._elements?.titleText) {
      const targetText = hasAnyAlerts ? this.defaultTitleText : this.emptyTitleText;
      if (this._elements.titleText.textContent !== targetText) {
        this._elements.titleText.textContent = targetText;
      }
      this._elements.titleText.classList.toggle('active-alerts__title-text--muted', !hasAnyAlerts);
    }

    if (this._elements?.filters) {
      this._elements.filters.classList.toggle('is-hidden', !hasAnyAlerts);
    }

    if (!this.isLoading && this._elements?.list) {
      this._elements.list.classList.toggle('is-hidden', !hasFilteredAlerts);
    }

    if (!this.isLoading && this._elements?.emptyState) {
      this.updateEmptyStateMessage(totalCount, filteredCount);
      this._elements.emptyState.classList.toggle('is-hidden', hasFilteredAlerts);
    }

    this.updateFilterButtons();
  }

  async renderAlerts() {
    const listContainer = this._elements?.list;
    if (!listContainer) {
      return;
    }

    listContainer.textContent = '';

    const filteredAlerts = this.getFilteredAlerts(true);
    if (!filteredAlerts.length) {
      this.updateHeaderState();
      return;
    }

    const sortedAlerts = filteredAlerts.slice().sort((a, b) => {
      const timeA = new Date(a.triggered_at || a.created_at || 0);
      const timeB = new Date(b.triggered_at || b.created_at || 0);
      return timeB - timeA;
    });

    const fragment = document.createDocumentFragment();

    // Use Promise.all to create all cards in parallel (createAlertCardElement is now async)
    const cardPromises = sortedAlerts.map(alert => this.createAlertCardElement(alert));
    const cards = await Promise.all(cardPromises);
    
    cards.forEach(card => {
      if (card) {
        fragment.appendChild(card);
      }
    });

    listContainer.appendChild(fragment);
    this.updateHeaderState();
  }

  async createAlertCardElement(alert) {
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
    const entityTypeAttr = relatedType || 'alert';
    card.dataset.entityType = entityTypeAttr;
    card.classList.add(`active-alerts__card--${entityTypeAttr.replace(/_/g, '-')}`);
    this.applyEntityColorTheme(card, entityTypeAttr);

    const header = document.createElement('div');
    header.className = 'active-alerts__card-header';

    // createHeaderContent is now async, so we need to await it
    const headerContent = await this.createHeaderContent(alert, relatedType, relatedMeta, displayName, symbol);
    header.appendChild(headerContent);
    header.appendChild(this.createDetailsButton(alert));

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

    // Show condition source if alert is from a condition
    if (alert.plan_condition_id || alert.trade_condition_id) {
      const sourceRow = document.createElement('div');
      sourceRow.className = 'active-alerts__row active-alerts__row--source';
      const sourceLabel = document.createElement('span');
      sourceLabel.className = 'active-alerts__row-label';
      sourceLabel.textContent = 'מקור';
      const sourceValue = document.createElement('span');
      sourceValue.className = 'active-alerts__row-value';
      
      if (alert.plan_condition_id) {
        const planId = alert.trade_plan_id || alert.related_id;
        const badge = document.createElement('span');
        badge.className = 'badge bg-success me-2';
        badge.textContent = '📋 מתנאי תכנית';
        sourceValue.appendChild(badge);
        if (planId && typeof showEntityDetails === 'function') {
          const link = document.createElement('a');
          link.href = '#';
          link.className = 'ms-2';
          link.textContent = `תכנית #${planId}`;
          link.onclick = (e) => {
            e.preventDefault();
            showEntityDetails('trade_plan', planId);
            return false;
          };
          sourceValue.appendChild(link);
        }
      } else if (alert.trade_condition_id) {
        const tradeId = alert.trade_id || alert.related_id;
        const badge = document.createElement('span');
        badge.className = 'badge bg-primary me-2';
        badge.textContent = '📈 מתנאי טרייד';
        sourceValue.appendChild(badge);
        if (tradeId && typeof showEntityDetails === 'function') {
          const link = document.createElement('a');
          link.href = '#';
          link.className = 'ms-2';
          link.textContent = `טרייד #${tradeId}`;
          link.onclick = (e) => {
            e.preventDefault();
            showEntityDetails('trade', tradeId);
            return false;
          };
          sourceValue.appendChild(link);
        }
      }
      
      sourceRow.appendChild(sourceLabel);
      sourceRow.appendChild(sourceValue);
      body.appendChild(sourceRow);
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
      markBtn.className = 'active-alerts__mark_read';
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

  applyEntityColorTheme(cardElement, entityType) {
    if (!cardElement) {
      return;
    }

    const normalizedType = this.normalizeColorEntityType(entityType);
    if (!normalizedType) {
      return;
    }

    const backgroundColor = typeof window.getEntityBackgroundColor === 'function'
      ? window.getEntityBackgroundColor(normalizedType)
      : '';
    const borderColor = typeof window.getEntityBorderColor === 'function'
      ? window.getEntityBorderColor(normalizedType)
      : '';
    const textColor = typeof window.getEntityTextColor === 'function'
      ? window.getEntityTextColor(normalizedType)
      : '';

    if (backgroundColor) {
      cardElement.style.setProperty('--active-alert-card-bg', backgroundColor);
    }
    if (borderColor) {
      cardElement.style.setProperty('--active-alert-card-border', borderColor);
    }
    if (textColor) {
      cardElement.style.setProperty('--active-alert-card-text', textColor);
    }
  }

  normalizeColorEntityType(entityType) {
    if (!entityType) {
      return 'alert';
    }

    const normalized = String(entityType).trim().toLowerCase();
    if (normalized === 'account') {
      return 'trading_account';
    }

    switch (normalized) {
    case 'trading_account':
    case 'trade':
    case 'trade_plan':
    case 'ticker':
    case 'alert':
      return normalized;
    default:
      return normalized || 'alert';
    }
  }

  normalizeConditionAttribute(attribute) {
    if (attribute === null || attribute === undefined) {
      return '';
    }

    const normalized = String(attribute).trim();

    if (!normalized || normalized === '-' || normalized === 'null' || normalized === 'undefined') {
      return '';
    }

    return normalized;
  }

  normalizeConditionOperator(operator) {
    if (operator === null || operator === undefined) {
      return '';
    }

    const normalized = String(operator).trim();

    if (!normalized || normalized === '-' || normalized === 'null' || normalized === 'undefined') {
      return '';
    }

    return normalized;
  }

  normalizeConditionNumber(number) {
    if (number === null || number === undefined) {
      return '';
    }

    if (typeof number === 'number') {
      return number;
    }

    const normalized = String(number).trim();

    if (!normalized || normalized === '-' || normalized === 'null' || normalized === 'undefined') {
      return '';
    }

    const numericValue = Number(normalized.replace(/,/g, ''));
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    return normalized;
  }

  async createHeaderContent(alert, relatedType, relatedMeta, displayName, symbol) {
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
          container.textContent = '';
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          doc.body.childNodes.forEach(node => {
              container.appendChild(node.cloneNode(true));
          });
          const linkedElement = container.firstElementChild;
          if (linkedElement) {
            linkedElement.classList.add('active-alerts__linked-entity');
            if (symbol) {
              linkedElement.addEventListener('click', event => {
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

    const entityLabel = this.getEntityLabel(relatedType);

    // Use IconSystem directly (new icon system)
    if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
      try {
        // Normalize entity type for IconSystem
        const entityTypeMap = {
          'trading_account': 'account',
          'trading_accounts': 'account',
          'trade': 'trade',
          'trades': 'trade',
          'trade_plan': 'trade_plan',
          'trade_plans': 'trade_plan',
          'ticker': 'ticker',
          'tickers': 'ticker',
          'alert': 'alert',
          'alerts': 'alert',
          'execution': 'execution',
          'executions': 'execution',
          'cash_flow': 'cash_flow',
          'cash_flows': 'cash_flow',
          'note': 'note',
          'notes': 'note'
        };
        const normalizedEntityType = entityTypeMap[relatedType] || relatedType;
        
        const iconHTML = await window.IconSystem.renderIcon('entity', normalizedEntityType, {
          size: '20',
          alt: entityLabel,
          class: 'active-alerts__symbol-icon'
        });
        
        const tempDiv = document.createElement('div');
        tempDiv.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(iconHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
            tempDiv.appendChild(node.cloneNode(true));
        });
        const icon = tempDiv.firstElementChild;
        if (icon) {
          headerLine.appendChild(icon);
        } else {
          // Fallback to basic icon if renderIcon returns empty
          this.log('warn', 'IconSystem.renderIcon returned empty HTML', { relatedType, normalizedEntityType });
        }
      } catch (error) {
        this.log('warn', 'Failed to render icon via IconSystem', { relatedType, error: error?.message });
      }
    } else {
      // Fallback if IconSystem not available - use old method
      const iconPath = this.getIconPathSync(relatedType);
      if (iconPath) {
        const icon = document.createElement('img');
        icon.className = 'active-alerts__symbol-icon';
        icon.src = iconPath;
        icon.alt = entityLabel;
        icon.width = 20;
        icon.height = 20;
        headerLine.appendChild(icon);
      }
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
        fetch('/api/trading_accounts/').then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
        fetch('/api/trades/').then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
        fetch('/api/trade_plans/').then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
        fetch('/api/tickers/').then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
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
      const response = await fetch(`/api/alerts/${alertId}/mark_read`, {
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
      this.resetFilteredAlertsCache();
      this.updateHeaderState();
      this.updateSectionHeaderAlertIcon();

      await this.invalidateAlertsCache();

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('התראה עודכנה', 'התראה סומנה כנקראה');
      }

      // CRITICAL: Prevent infinite recursion - don't reload if already loading
      // The state is already updated above, so we don't need to reload
      // await this.loadActiveAlerts({ force: true });
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

  /**
   * Get icon path synchronously (fallback only - use IconSystem instead)
   * @deprecated Use IconSystem.renderIcon() instead
   */
  getIconPathSync(relatedType) {
    const iconMap = {
      trading_account: 'images/icons/trading_accounts.svg',
      trading_accounts: 'images/icons/trading_accounts.svg',
      trade: 'images/icons/trades.svg',
      trades: 'images/icons/trades.svg',
      trade_plan: 'images/icons/trade_plans.svg',
      trade_plans: 'images/icons/trade_plans.svg',
      ticker: 'images/icons/tickers.svg',
      tickers: 'images/icons/tickers.svg',
      alert: 'images/icons/alerts.svg',
      alerts: 'images/icons/alerts.svg',
      execution: 'images/icons/executions.svg',
      executions: 'images/icons/executions.svg',
      cash_flow: 'images/icons/cash_flows.svg',
      cash_flows: 'images/icons/cash_flows.svg',
      note: 'images/icons/notes.svg',
      notes: 'images/icons/notes.svg',
      default: 'images/icons/alerts.svg',
    };

    return iconMap[relatedType] || iconMap.default;
  }

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

  /**
   * Create status badge - משתמש ב-FieldRendererService המרכזי
   * @deprecated - השתמש ישירות ב-window.FieldRendererService.renderStatus() (מחזיר HTML string)
   * @param {string} status - סטטוס
   * @param {string} relatedType - סוג ישות
   * @returns {HTMLElement|null} DOM element או null
   */
  createStatusBadge(status, relatedType) {
    if (!status) {
      return null;
    }

    // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
    if (window.FieldRendererService?.renderStatus) {
      const wrapper = document.createElement('span');
      wrapper.textContent = '';
      const statusHTML = window.FieldRendererService.renderStatus(status, relatedType);
      const parser = new DOMParser();
      const doc = parser.parseFromString(statusHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
          wrapper.appendChild(node.cloneNode(true));
      });
      return wrapper.firstElementChild;
    }

    // Fallback למקרה נדיר ביותר שהמערכת לא זמינה
    const badge = document.createElement('span');
    badge.className = 'active-alerts__fallback-badge';
    badge.textContent = status;
    return badge;
  }

  /**
   * Create side badge - משתמש ב-FieldRendererService המרכזי
   * @deprecated - השתמש ישירות ב-window.FieldRendererService.renderSide() (מחזיר HTML string)
   * @param {string} side - צד (Long/Short)
   * @returns {HTMLElement|null} DOM element או null
   */
  createSideBadge(side) {
    if (!side) {
      return null;
    }

    // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
    if (window.FieldRendererService?.renderSide) {
      const wrapper = document.createElement('span');
      wrapper.textContent = '';
      const sideHTML = window.FieldRendererService.renderSide(side);
      const parser = new DOMParser();
      const doc = parser.parseFromString(sideHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
          wrapper.appendChild(node.cloneNode(true));
      });
      return wrapper.firstElementChild;
    }

    // Fallback למקרה נדיר ביותר שהמערכת לא זמינה
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
      wrapper.textContent = '';
      const typeHTML = window.FieldRendererService.renderType(investmentType);
      const parser = new DOMParser();
      const doc = parser.parseFromString(typeHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
          wrapper.appendChild(node.cloneNode(true));
      });
      return wrapper.firstElementChild;
    }

    const badge = document.createElement('span');
    badge.className = 'active-alerts__fallback-badge';
    badge.textContent = investmentType;
    return badge;
  }

  buildConditionText(alert) {
    if (!alert) {return '';}

    const attributeRaw = alert?.condition_attribute ?? alert?.attribute ?? alert?.conditionAttribute;
    const operatorRaw = alert?.condition_operator ?? alert?.operator ?? alert?.conditionOperator;
    const numberRaw = alert?.condition_number ?? alert?.condition_value ?? alert?.conditionValue ?? alert?.value;

    const attribute = this.normalizeConditionAttribute(attributeRaw);
    const operator = this.normalizeConditionOperator(operatorRaw);
    const number = this.normalizeConditionNumber(numberRaw);

    if (attribute && operator !== undefined && number !== undefined) {
      if (window.AlertConditionRenderer && typeof window.AlertConditionRenderer.renderConditionText === 'function') {
        try {
          const rendered = window.AlertConditionRenderer.renderConditionText(attribute, operator, number);
          if (rendered) {
            return rendered;
          }
        } catch (error) {
          this.log('warn', 'AlertConditionRenderer.renderConditionText failed', { error: error?.message });
        }
      }

      if (typeof window.translateConditionFields === 'function') {
        try {
          return window.translateConditionFields(attribute, operator, number);
        } catch (error) {
          this.log('warn', 'translateConditionFields failed', { error: error?.message });
        }
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

  createDetailsButton(alert) {
    const container = document.createElement('div');
    container.className = 'active-alerts__details';

    const alertId = Number(alert?.id);
    if (Number.isFinite(alertId)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-button-type', 'VIEW');
      button.setAttribute('data-variant', 'small');
      button.setAttribute('data-tooltip', 'פרטי התראה');
      button.setAttribute('data-tooltip-placement', 'top');
      button.setAttribute('data-tooltip-trigger', 'hover');
      button.setAttribute('aria-label', 'פרטי התראה');
      button.setAttribute('data-onclick', `window.showEntityDetails && window.showEntityDetails('alert', ${alertId}, { mode: 'view' })`);

      container.appendChild(button);

      if (typeof window.processButtons === 'function') {
        window.processButtons(container);
      }
    }

    return container;
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

    // Use window.dateUtils.toDateObject (window.toDateObject doesn't exist)
    if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
      const converted = window.dateUtils.toDateObject(value);
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
    // CRITICAL: Prevent recursion - don't use Logger or showNotification if loadActiveAlerts is in progress
    // or if getPreference is in progress (to avoid Logger -> getPreference -> Logger loop)
    if (this.isLoading || window.__GET_PREFERENCE_IN_PROGRESS__) {
      // Use console directly during loading to avoid recursion
      if (window.DEBUG_MODE) {
        console.error('[ActiveAlertsComponent] Failed to load active alerts', { error: error?.message });
      }
      return;
    }
    
    this.log('error', 'Failed to load active alerts', { error: error?.message });
    
    // CRITICAL: Only show notification if not currently loading preferences to avoid recursion
    if (!window.__GET_PREFERENCE_IN_PROGRESS__ && typeof window.showErrorNotification === 'function') {
      try {
        window.showErrorNotification('שגיאה בטעינת התראות פעילות', error?.message || 'אירעה שגיאה בעת טעינת ההתראות');
      } catch (notifError) {
        // Fallback to console if notification fails
        if (window.DEBUG_MODE) {
          console.error('[ActiveAlertsComponent] Failed to show error notification', notifError);
        }
      }
    }
  }

  log(level, message, extra = {}) {
    // CRITICAL: Prevent recursion - don't use Logger if loadActiveAlerts is in progress
    // or if getPreference is in progress (to avoid Logger -> getPreference -> Logger loop)
    if (this.isLoading || window.__GET_PREFERENCE_IN_PROGRESS__) {
      // Use console directly during loading to avoid recursion
      if (window.DEBUG_MODE) {
        const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
        consoleMethod(`[ActiveAlertsComponent] ${message}`, extra);
      }
      return;
    }
    
    if (window.Logger && typeof window.Logger[level] === 'function') {
      try {
        window.Logger[level](message, { component: 'ActiveAlertsComponent', ...extra });
      } catch (error) {
        // Fallback to console if Logger fails
        if (window.DEBUG_MODE) {
          const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
          consoleMethod(`[ActiveAlertsComponent] ${message}`, extra);
        }
      }
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

if (typeof window.ActiveAlertsFilterRouter !== 'function') {
  window.ActiveAlertsFilterRouter = function (type) {
    const normalizedType = typeof type === 'string' ? type : 'all';
    const components = document.querySelectorAll('active-alerts');
    components.forEach(component => {
      if (typeof component.applyFilter === 'function') {
        component.applyFilter(normalizedType);
      }
    });
    return true;
  };
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

