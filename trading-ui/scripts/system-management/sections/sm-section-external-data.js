/**
 * System Management External Data Section - TikTrack
 * ==============================================
 * 
 * External data section for external data providers management
 * Shows provider status, data accuracy, and refresh information
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMExternalDataSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, { autoRefresh: true, refreshInterval: 120000, ...config });
    this.layoutReady = false;
    this.hasFetchedOnce = false;
  }

  async ensureDashboard() {
    // Try to get existing dashboard instance
    if (window.externalDataDashboard) {
      if (!window.externalDataDashboard.isInitialized) {
        await window.externalDataDashboard.init();
      }
      return window.externalDataDashboard;
    }
    
    // Try to create new instance if class is available
    if (typeof window.ExternalDataDashboard === 'function') {
      window.externalDataDashboard = new window.ExternalDataDashboard();
      if (!window.externalDataDashboard.isInitialized) {
        await window.externalDataDashboard.init();
      }
      return window.externalDataDashboard;
    }
    
    // If dashboard is not available, return null and handle gracefully
    // Note: ExternalDataDashboard is optional for system-management page
    // It's only loaded on the external-data-dashboard page itself
    return null;
  }

  async loadData() {
    try {
      const dashboard = await this.ensureDashboard();
      
      // If dashboard is not available, show empty state
      if (!dashboard) {
        this.showEmptyState('External Data Dashboard לא זמין - נא לטעון את העמוד מחדש');
        return;
      }

      if (this.hasFetchedOnce) {
        await Promise.allSettled([
          dashboard.loadSystemStatus(),
          dashboard.loadCacheStats(),
          dashboard.loadProviders(),
          dashboard.loadLogs()
        ]);
      } else {
        this.hasFetchedOnce = true;
      }

      const data = {
        status: dashboard.statusData || null,
        cache: dashboard.cacheStats?.data || dashboard.cacheStats || null,
        providers: Array.isArray(dashboard.providers) ? dashboard.providers : [],
        logs: Array.isArray(dashboard.logs) ? dashboard.logs : []
      };

      this.lastData = data;
      this.render(data);
    } catch (error) {
      console.error('❌ Failed to load external data:', error);
      this.showEmptyState('שגיאה בטעינת נתוני External Data');
      throw error;
    }
  }

  ensureLayout() {
    if (this.layoutReady || !this.container) {
      return;
    }

    this.container.classList.add('sm-external-data-container');
    this.container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            <h3 class="mb-0">מערכת נתונים חיצוניים</h3>
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <a href="/external-data-dashboard" class="btn btn-sm btn-outline-primary me-2">
                <i class="fas fa-external-link-alt me-1"></i> דשבורד מלא
              </a>
              <div id="smExtActions">
              <button data-button-type="REFRESH" data-text="רענון סטטוס" data-onclick="ExternalDataDashboardActions.refreshStatus(event)" data-refresh-after-action="true"></button>
              <button data-button-type="REFRESH" data-text="רענון ספקים" data-onclick="ExternalDataDashboardActions.refreshProviders(event)" data-refresh-after-action="true"></button>
              <button data-button-type="PLAY" data-text="רענון מלא" data-onclick="ExternalDataDashboardActions.refreshAllExternalData(event)" data-refresh-after-action="true"></button>
              <button data-button-type="MENU" data-text="ניקוי מטמון" data-onclick="ExternalDataDashboardActions.clearExternalCache(event)" data-refresh-after-action="true"></button>
              <button data-button-type="MENU" data-text="אופטימיזציה" data-onclick="ExternalDataDashboardActions.optimizeExternalCache(event)" data-refresh-after-action="true"></button>
              <button data-button-type="REFRESH" data-text="רענון לוגים" data-onclick="ExternalDataDashboardActions.refreshLogs(event)" data-size="small" data-refresh-after-action="true"></button>
              <button data-button-type="COPY" data-text="העתקת לוג" data-onclick="ExternalDataDashboardActions.copyDetailedLog(event)"></button>
              </div>
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-sm-6 col-lg-3">
              <div class="card h-100">
                <div class="card-body">
                  <div class="text-muted small">ספקים פעילים</div>
                  <div class="h4 mb-0" id="smExtProvidersActive">-</div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-lg-3">
              <div class="card h-100">
                <div class="card-body">
                  <div class="text-muted small">ספקים בריאים</div>
                  <div class="h4 mb-0" id="smExtProvidersHealthy">-</div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-lg-3">
              <div class="card h-100">
                <div class="card-body">
                  <div class="text-muted small">רשומות במטמון</div>
                  <div class="h4 mb-0" id="smExtCacheRecords">-</div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-lg-3">
              <div class="card h-100">
                <div class="card-body">
                  <div class="text-muted small">אחוז פגיעות</div>
                  <div class="h4 mb-0" id="smExtCacheHitRate">-</div>
                </div>
              </div>
            </div>
          </div>

          <div class="small text-muted mb-3" id="smExtLastRefresh">עדכון אחרון: לא זמין</div>

          <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>סטטוס ספקים</span>
              <button data-button-type="REFRESH" data-text="רענון" data-onclick="ExternalDataDashboardActions.refreshProviders(event)" data-size="small" data-refresh-after-action="true"></button>
            </div>
            <div class="card-body p-0">
              <div id="smExtProvidersList" class="list-group list-group-flush"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>לוגים אחרונים</span>
              <button data-button-type="COPY" data-text="העתק" data-onclick="ExternalDataDashboardActions.copyDetailedLog(event)" data-size="small"></button>
            </div>
            <div class="card-body p-0">
              <div id="smExtLogs" class="list-group list-group-flush"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.layoutReady = true;
  }

  render(data) {
    this.ensureLayout();
    this.updateSummary(data);
    this.updateProviders(data.providers);
    this.updateLogs(data.logs);
  }

  updateSummary(data) {
    const status = data.status || {};
    const providersSummary = status.providers?.summary || {};
    const providers = Array.isArray(data.providers) ? data.providers : [];
    const cacheData = data.cache || {};

    const totalProviders = providersSummary.total ?? providers.length;
    const activeProviders = providersSummary.active ?? providers.filter((provider) => provider.is_active).length;
    const healthyProviders = providersSummary.healthy ?? providers.filter((provider) => provider.is_healthy).length;

    setElementText('smExtProvidersActive', formatNumberValue(activeProviders, '-'));
    setElementText('smExtProvidersHealthy', formatNumberValue(healthyProviders, '-'));
    setElementText('smExtCacheRecords', formatNumberValue(cacheData.total_quotes ?? cacheData.total_entries, '-'));
    setElementText('smExtCacheHitRate', formatPercentValue(cacheData.cache_hit_rate ?? cacheData.hit_rate, '-'));

    const lastRefresh = status.refresh?.last_successful ?? status.last_refresh ?? status.timestamp ?? null;
    setElementText('smExtLastRefresh', `עדכון אחרון: ${formatDateTimeValue(lastRefresh)}`);
  }

  updateProviders(providers) {
    const container = document.getElementById('smExtProvidersList');
    if (!container) {
      return;
    }

    if (!providers || !providers.length) {
      container.innerHTML = '<div class="list-group-item text-muted">אין נתונים זמינים</div>';
      return;
    }

    const items = providers.slice(0, 5).map((provider) => {
      const statusBadge = provider.is_active
        ? provider.is_healthy
          ? '<span class="badge bg-success">פעיל</span>'
          : '<span class="badge bg-warning text-dark">בעיה</span>'
        : '<span class="badge bg-secondary">כבוי</span>';

      const displayName = sanitizeText(provider.display_name || provider.name || 'לא ידוע');
      const lastUpdated = provider.last_successful_request
        ? formatRelativeTimeValue(provider.last_successful_request)
        : 'לא זמין';
      const lastError = provider.last_error
        ? `<div class="text-danger small mt-1">${sanitizeText(provider.last_error)}</div>`
        : '';
      const successRateValue = provider.recent_activity?.success_rate ?? provider.recent_success_rate ?? null;
      const successRate = formatPercentValue(successRateValue, '-');

      return `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <strong>${displayName}</strong>
            ${statusBadge}
          </div>
          <div class="small text-muted mt-1">
            אחוז הצלחה: ${successRate} · עדכון אחרון: ${lastUpdated}
          </div>
          ${lastError}
        </div>
      `;
    }).join('');

    if (providers.length > 5) {
      const additional = providers.length - 5;
      container.innerHTML = `${items}<div class="list-group-item text-muted small">+${formatNumberValue(additional)} ספקים נוספים</div>`;
    } else {
      container.innerHTML = items;
    }
  }

  updateLogs(logs) {
    const container = document.getElementById('smExtLogs');
    if (!container) {
      return;
    }

    if (!logs || !logs.length) {
      container.innerHTML = '<div class="list-group-item text-muted">אין אירועים אחרונים</div>';
      return;
    }

    const items = logs.slice(0, 5).map((log) => {
      const levelBadge = this.getLogLevelBadge(log.level);
      const message = sanitizeText(log.message || '—');
      const timestamp = formatDateTimeValue(log.timestamp);
      return `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <span>${message}</span>
            ${levelBadge}
          </div>
          <div class="small text-muted mt-1">${timestamp}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = items;
  }

  getLogLevelBadge(level) {
    const normalized = (level || '').toLowerCase();
    switch (normalized) {
      case 'error':
        return '<span class="badge bg-danger">שגיאה</span>';
      case 'warning':
        return '<span class="badge bg-warning text-dark">אזהרה</span>';
      case 'info':
        return '<span class="badge bg-primary">מידע</span>';
      case 'debug':
        return '<span class="badge bg-secondary">דיבאג</span>';
      default:
        return '<span class="badge bg-light text-dark">אחר</span>';
    }
  }

  setupEventListeners() {
    if (!this.container) {
      return;
    }

    this.container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-refresh-after-action]');
      if (button) {
        setTimeout(() => {
          this.loadData().catch((error) => console.warn('⚠️ Failed to refresh external data section:', error));
        }, 1200);
      }
    });
  }
}

function sanitizeText(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setElementText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function formatNumberValue(value, fallback = '-') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return fallback;
  }
  return new Intl.NumberFormat('he-IL').format(Number(value));
}

function formatPercentValue(value, fallback = '-') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return fallback;
  }
  let numeric = Number(value);
  if (Math.abs(numeric) <= 1) {
    numeric *= 100;
  }
  return `${new Intl.NumberFormat('he-IL', { maximumFractionDigits: 1 }).format(numeric)}%`;
}

function formatDateTimeValue(value) {
  if (!value) {
    return 'לא זמין';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'לא זמין';
  }
  const dateStr = window.formatDate ? window.formatDate(date) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(date) : date.toLocaleDateString('he-IL'));
  const timeStr = window.formatTimeOnly ? window.formatTimeOnly(date) : (window.dateUtils?.formatTimeOnly ? window.dateUtils.formatTimeOnly(date) : date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));
  return `${dateStr} ${timeStr}`;
}

function formatRelativeTimeValue(value) {
  if (!value) {
    return 'לא זמין';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'לא זמין';
  }
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat('he', { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minutes');
  }
  const diffHours = Math.round(diffMs / 3600000);
  if (Math.abs(diffHours) < 48) {
    return rtf.format(diffHours, 'hours');
  }
  const diffDays = Math.round(diffMs / 86400000);
  return rtf.format(diffDays, 'days');
}

window.SMExternalDataSection = SMExternalDataSection;
