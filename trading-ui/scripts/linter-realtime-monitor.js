/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 *
 * INITIALIZATION
 * - initializeLintMonitor()            - נקודת כניסה עיקרית לעמוד ניטור הלינטר
 * - LintMonitorController.init()       - אתחול הבקר: טעינת נתונים, רישום טבלאות, אירועים
 *
 * DATA FLOW
 * - LintMonitorController.loadData()   - טעינת דוח אחרון והיסטוריה מה-API
 * - LintMonitorController.refreshIssuesTable() - רענון טבלת הסוגיות לאחר טעינה/מיון
 *
 * UI UPDATES
 * - LintMonitorController.renderSummaryCards()  - סיכום עליון (תאריך אחרון, כמות שגיאות וכו')
 * - LintMonitorController.renderTaskStatus()    - טבלת סטטוס לכלי הלינטר (ESLint וכו')
 * - LintMonitorController.renderIssuesTable()   - עידכון טבלת הסוגיות
 * - LintMonitorController.renderHistory()       - רשימת היסטוריה של ריצות
 * - LintMonitorController.toggleEmptyState()    - הצגת מצב ללא נתונים
 *
 * UTILITIES
 * - LintMonitorController.registerTables()      - רישום הטבלה במערכת UnifiedTableSystem
 * - LintMonitorController.cacheElements()       - אחסון הפניות ל-DOM
 * - LintMonitorController.attachEvents()        - חיבור כפתורי רענון/קישורים
 * - LintMonitorController.setLoadingState()     - עדכון אינדיקציית טעינה וכפתורים
 *
 * ==========================================
 */

/**
 * Linter Monitor Controller
 * =========================
 *
 * מנהל את זרימת הנתונים ותצוגת ניטור הלינטר.
 * נשען על LintStatusService לקבלת הנתונים מהשרת ועל UnifiedTableSystem להצגת הטבלאות.
 *
 * תיעוד ארכיטקטורי: documentation/02-ARCHITECTURE/FRONTEND/LINTER_MONITOR_REBUILD_PLAN.md
 */

/* global LintStatusService */

const LINT_MONITOR_TABLE_TYPE = 'lint_monitor_issues';
const LINT_MONITOR_HOST_PAGE = 'code-quality-dashboard';

class LintMonitorController {
  constructor() {
    this.state = {
      latestReport: null,
      history: [],
      issues: [],
      isRunningCollect: false,
      runMeta: {
        status: 'idle',
        timestamp: null,
        exitCode: null,
        message: null,
      },
    };

    this.elements = {};
    this.tableRegistered = false;
  }

  async init() {
    this.cacheElements();
    this.attachEvents();
    this.registerTables();
    this.updateRunStatus({ status: 'idle', timestamp: null, exitCode: null, message: null });
    await this.loadData();
  }

  cacheElements() {
    this.elements.summaryContainer = document.getElementById('lint-summary-cards');
    this.elements.taskTableBody = document.getElementById('lint-tool-status-body');
    this.elements.issuesTable = document.getElementById('lint-issues-table');
    this.elements.issuesTableBody = document.getElementById('lint-issues-table-body');
    this.elements.historyList = document.getElementById('lint-history-list');
    this.elements.emptyState = document.getElementById('lint-empty-state');
    this.elements.lastUpdatedLabel = document.getElementById('lint-last-updated');
    this.elements.refreshButton = document.getElementById('lint-refresh-button');
    this.elements.copyButton = document.getElementById('lint-copy-log-button');
    this.elements.loadingIndicator = document.getElementById('lint-loading-indicator');
    this.elements.runCollectButton = document.getElementById('lint-run-collect-button');
    this.elements.downloadReportButton = document.getElementById('lint-download-report-button');
    this.elements.runStatusLabel = document.getElementById('lint-run-status');
    this.elements.downloadHeaderButton = document.getElementById('lint-download-header-button');
    this.elements.copyReportButton = document.getElementById('lint-copy-report-button');
  }

  attachEvents() {
    if (this.elements.refreshButton) {
      this.elements.refreshButton.addEventListener('click', async event => {
        event?.preventDefault();
        await this.loadData({ showToast: true });
      });
    }

    if (this.elements.copyButton) {
      this.elements.copyButton.addEventListener('click', async event => {
        event?.preventDefault();
        if (typeof window.copyLintMonitorDetailedLog === 'function') {
          await window.copyLintMonitorDetailedLog();
        }
      });
    }

    if (this.elements.runCollectButton) {
      this.elements.runCollectButton.addEventListener('click', async event => {
        event?.preventDefault();
        await this.runLintCollection();
      });
    }

    if (this.elements.downloadReportButton) {
      this.elements.downloadReportButton.addEventListener('click', async event => {
        event?.preventDefault();
        await this.downloadLatestReport();
      });
    }

    if (this.elements.downloadHeaderButton) {
      this.elements.downloadHeaderButton.addEventListener('click', async event => {
        event?.preventDefault();
        await this.downloadLatestReport();
      });
    }

    if (this.elements.copyReportButton) {
      this.elements.copyReportButton.addEventListener('click', async event => {
        event?.preventDefault();
        await this.copyLatestReportToClipboard();
      });
    }
  }

  registerTables() {
    if (this.tableRegistered || !window.UnifiedTableSystem) {
      return;
    }

    const controller = this;

    window.UnifiedTableSystem.registry.register(LINT_MONITOR_TABLE_TYPE, {
      dataGetter: () => controller.state.issues,
      updateFunction: data => controller.renderIssuesTable(data),
      tableSelector: '#lint-issues-table',
      columns: window.TABLE_COLUMN_MAPPINGS?.[LINT_MONITOR_TABLE_TYPE] || [],
      sortable: true,
      filterable: false,
      defaultSort: window.getDefaultSortChain
        ? window.getDefaultSortChain(LINT_MONITOR_TABLE_TYPE)
        : [{ columnIndex: 0, direction: 'desc' }],
    });

    this.tableRegistered = true;
  }

  async loadData(options = {}) {
    const { showToast = false } = options;
    this.setLoadingState(true);

    try {
      const [latestReport, history] = await Promise.all([
        LintStatusService.fetchLatestReport(),
        LintStatusService.fetchHistory(),
      ]);

      this.state.latestReport = latestReport;
      this.state.history = history;
      this.state.issues = latestReport ? LintStatusService.extractIssues(latestReport) : [];

      if (!this.state.isRunningCollect) {
        const defaultStatus = this.state.latestReport ? 'ready' : 'empty';
        this.updateRunStatus({
          status: defaultStatus,
          timestamp: this.state.latestReport?.generatedAt || null,
          exitCode: null,
          message: null,
        });
      }

      this.renderSummaryCards();
      this.renderTaskStatus();
      this.renderHistory();
      await this.refreshIssuesTable();
      this.toggleEmptyState();
      this.updateLastUpdatedLabel();

      if (showToast && typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('דוח הלינטר עודכן בהצלחה');
      }
    } catch (error) {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('נכשל בטעינת מצב הלינטר. בדוק את הלוגים ונסה שוב.');
      }
      window.Logger?.error('[LintMonitor] Failed to load lint data:', error, {
        page: LINT_MONITOR_HOST_PAGE,
      });
      this.updateRunStatus({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      this.setLoadingState(false);
    }
  }

  async refreshIssuesTable() {
    const issues = Array.isArray(this.state.issues) ? this.state.issues : [];

    if (!this.tableRegistered || !window.UnifiedTableSystem) {
      this.renderIssuesTable(issues);
      return;
    }

    if (issues.length === 0) {
      this.renderIssuesTable([]);
      return;
    }

    try {
      const sorted = await window.UnifiedTableSystem.sorter.applyDefaultSort(LINT_MONITOR_TABLE_TYPE);
      if (!sorted || sorted.length === 0) {
        this.renderIssuesTable(issues);
      }
    } catch (error) {
      window.Logger?.warn('[LintMonitor] Failed to apply default sort:', error, {
        page: LINT_MONITOR_HOST_PAGE,
      });
      this.renderIssuesTable(issues);
    }
  }

  renderSummaryCards() {
    if (!this.elements.summaryContainer) {
      return;
    }

    const summary = LintStatusService.buildSummaryTiles(this.state.latestReport);
    if (!summary.length) {
      this.elements.summaryContainer.innerHTML = `
        <div class="empty-summary">
          <span>לא נמצאו נתונים. הרץ <code>npm run lint:collect</code> ושוב לרענון.</span>
        </div>
    `;
      return;
    }

    const cardsHtml = summary
      .map(tile => {
        const value = tile.value === 'Invalid Date' || tile.value === '' ? 'לא זמין' : tile.value;
        return `
          <div class="lint-summary-card">
            <div class="lint-summary-icon">${tile.icon}</div>
            <div class="lint-summary-content">
              <div class="lint-summary-value">${value}</div>
              <div class="lint-summary-label">${tile.label}</div>
            </div>
          </div>
        `;
      })
      .join('');

    this.elements.summaryContainer.innerHTML = cardsHtml;
  }

  renderTaskStatus() {
    if (!this.elements.taskTableBody) {
      return;
    }

    const tasks = LintStatusService.buildTaskSummaries(this.state.latestReport);

    if (!tasks.length) {
      this.elements.taskTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="lint-table-empty">לא קיימים נתונים להצגה</td>
            </tr>
        `;
      return;
    }

    const rows = tasks
      .map(task => {
        const statusBadge = LintMonitorController.getStatusBadge(task.status);
        const durationSeconds = (task.durationMs ?? 0) / 1000;
        return `
          <tr>
            <td class="lint-tool-name">${task.label}</td>
            <td>${statusBadge}</td>
            <td>${task.errors}</td>
            <td>${task.warnings}</td>
            <td>${durationSeconds.toFixed(1)} שניות</td>
          </tr>
        `;
      })
      .join('');

    this.elements.taskTableBody.innerHTML = rows;
  }

  renderIssuesTable(data) {
    if (!this.elements.issuesTableBody) {
      return;
    }

    if (!data || data.length === 0) {
      this.elements.issuesTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="lint-table-empty">אין סוגיות פעילות כרגע 🎉</td>
            </tr>
        `;
      return;
    }

    const rows = data
      .map(issue => {
        const location = issue.line ? `${issue.line}:${issue.column || 0}` : '—';
        return `
          <tr data-severity="${issue.severity}">
            <td>${issue.tool}</td>
            <td>
              <span class="lint-severity lint-severity-${issue.severity}">
                ${LintMonitorController.getSeverityLabel(issue.severity)}
              </span>
            </td>
            <td class="lint-issue-file">${issue.file}</td>
            <td>${issue.rule}</td>
            <td class="lint-issue-message">${issue.message}</td>
            <td>${location}</td>
          </tr>
        `;
      })
      .join('');

    this.elements.issuesTableBody.innerHTML = rows;
  }

  renderHistory() {
    if (!this.elements.historyList) {
      return;
    }

    if (!this.state.history.length) {
      this.elements.historyList.innerHTML = `
        <li class="lint-history-empty">אין היסטוריה זמינה</li>
      `;
      return;
    }

    const historyItems = this.state.history
      .slice()
      .reverse()
      .map(entry => {
        const timestamp = LintStatusService._formatTimestamp(entry.generatedAt);
        const status = entry.totals?.failed || entry.totals?.error ? 'failed' : 'passed';
        const badge = LintMonitorController.getStatusBadge(status);
        const issues = entry.totals?.issues ?? 0;

        return `
          <li class="lint-history-item">
            <div class="lint-history-meta">
              <span class="lint-history-date">${timestamp}</span>
              ${badge}
            </div>
            <div class="lint-history-details">
              <span>סה״כ סוגיות: ${issues}</span>
              <span>שגיאות: ${entry.totals?.errors ?? 0}</span>
              <span>אזהרות: ${entry.totals?.warnings ?? 0}</span>
            </div>
          </li>
        `;
      })
      .join('');

    this.elements.historyList.innerHTML = historyItems;
  }

  toggleEmptyState() {
    if (!this.elements.emptyState) {
      return;
    }

    const hasData = Boolean(this.state.latestReport && this.state.issues.length);
    this.elements.emptyState.classList.toggle('hidden', hasData);
  }

  updateLastUpdatedLabel() {
    if (!this.elements.lastUpdatedLabel) {
      return;
    }

    const formatted = this.state.latestReport?.generatedAt
      ? LintStatusService._formatTimestamp(this.state.latestReport.generatedAt)
      : '';

    this.elements.lastUpdatedLabel.textContent = formatted || 'לא זמין';
  }

  setLoadingState(isLoading) {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.classList.toggle('hidden', !isLoading);
    }
    if (this.elements.refreshButton) {
      this.elements.refreshButton.disabled = isLoading;
    }
    if (!this.state.isRunningCollect) {
      if (this.elements.runCollectButton) {
        this.elements.runCollectButton.disabled = isLoading;
      }
      if (this.elements.downloadReportButton) {
        this.elements.downloadReportButton.disabled = isLoading;
      }
      if (this.elements.downloadHeaderButton) {
        this.elements.downloadHeaderButton.disabled = isLoading;
      }
      if (this.elements.copyReportButton) {
        this.elements.copyReportButton.disabled = isLoading;
      }
    }
  }

  toggleActionButtons(isDisabled) {
    if (this.elements.runCollectButton) {
      this.elements.runCollectButton.disabled = isDisabled;
    }
    if (this.elements.downloadReportButton) {
      this.elements.downloadReportButton.disabled = isDisabled;
    }
    if (this.elements.downloadHeaderButton) {
      this.elements.downloadHeaderButton.disabled = isDisabled;
    }
    if (this.elements.copyReportButton) {
      this.elements.copyReportButton.disabled = isDisabled;
    }
  }

  updateRunStatus(update = {}) {
    const previous = this.state.runMeta || {};
    const merged = {
      status: update.status || previous.status || 'idle',
      timestamp:
        update.timestamp !== undefined
          ? update.timestamp
          : previous.timestamp !== undefined
            ? previous.timestamp
            : null,
      exitCode:
        update.exitCode !== undefined
          ? update.exitCode
          : previous.exitCode !== undefined
            ? previous.exitCode
            : null,
      message:
        update.message !== undefined
          ? update.message
          : previous.message !== undefined
            ? previous.message
            : null,
    };

    this.state.runMeta = merged;

    if (!this.elements.runStatusLabel) {
      return;
    }

    let displayText = 'מוכן להרצה';

    switch (merged.status) {
      case 'running':
        displayText = 'מריץ דוח...';
        break;
      case 'success':
        displayText = `הסתיים בהצלחה (${LintStatusService._formatTimestamp(merged.timestamp) || 'זמן לא זמין'})`;
        break;
      case 'failed':
        displayText = `הסתיים עם כשלים (${LintStatusService._formatTimestamp(merged.timestamp) || 'זמן לא זמין'})`;
        break;
      case 'error':
        displayText = `כשל בהרצה: ${merged.message || 'לא ידוע'}`;
        break;
      case 'empty':
        displayText = 'טרם הופעלה הרצה.';
        break;
      default:
        if (merged.timestamp) {
          displayText = `עודכן: ${LintStatusService._formatTimestamp(merged.timestamp)}`;
        }
        break;
    }

    this.elements.runStatusLabel.textContent = displayText;
  }

  async runLintCollection() {
    if (this.state.isRunningCollect) {
      return;
    }

    this.state.isRunningCollect = true;
    this.updateRunStatus({ status: 'running', message: null });
    this.toggleActionButtons(true);

    try {
      const result = await LintStatusService.runCollection('manual-ui-run');

      if (result.status === 'success') {
        if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification(
            'הרצת הלינטר הושלמה',
            'הנתונים עודכנו בעמוד ניטור איכות הקוד'
          );
        }
      } else {
        this.showLintFailureModal(result);
      }

      await this.loadData();

      this.updateRunStatus({
        status: result.status === 'success' ? 'success' : 'failed',
        timestamp:
          result.latestReport?.generatedAt ||
          this.state.latestReport?.generatedAt ||
          result.timestamp ||
          null,
        exitCode: result.exitCode,
        message: result.status === 'success' ? null : result.stderr || result.stdout || '',
      });
    } catch (error) {
      this.updateRunStatus({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      this.showLintFailureModal({
        status: 'error',
        message: error.message,
        stderr: error.stack || '',
        stdout: '',
        timestamp: new Date().toISOString(),
      });
    } finally {
      this.state.isRunningCollect = false;
      this.toggleActionButtons(false);
    }
  }

  showLintFailureModal(result = {}) {
    if (typeof window.showDetailsModal !== 'function') {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בהרצת הלינטר', result.message || 'נדרש לבדוק את הלוגים');
      }
      return;
    }

    const content = this.buildFailureModalContent(result);
    window.showDetailsModal('שגיאת לינטר - פירוט ההרצה', content, {
      category: 'system',
    });
  }

  buildFailureModalContent(result = {}) {
    const latestReport = result.latestReport || this.state.latestReport || null;
    const totals = latestReport?.totals || {};
    const timestamp =
      (result.timestamp && LintStatusService._formatTimestamp(result.timestamp)) ||
      (latestReport?.generatedAt && LintStatusService._formatTimestamp(latestReport.generatedAt)) ||
      new Date().toLocaleString('he-IL');
    const exitCode =
      result.exitCode !== undefined && result.exitCode !== null ? String(result.exitCode) : 'לא זמין';
    const summaryItems = [
      { label: 'סה״כ כלים', value: totals.tools ?? '—' },
      { label: 'עברו', value: totals.passed ?? 0 },
      { label: 'אזהרות', value: totals.warning ?? totals.warnings ?? 0 },
      { label: 'נכשלו', value: totals.failed ?? 0 },
      { label: 'שגיאות קריטיות', value: totals.error ?? totals.errors ?? 0 },
      { label: 'סה״כ סוגיות', value: totals.issues ?? this.state.issues.length ?? 0 },
    ];

    const tasks = Array.isArray(latestReport?.tasks) ? latestReport.tasks : [];
    const failingTasks = tasks.filter(task => task.status !== 'passed');
    const failingRows = failingTasks.length
      ? failingTasks
          .map(task => {
            const duration =
              typeof task.durationMs === 'number' ? `${(task.durationMs / 1000).toFixed(2)} שניות` : '—';
            const statusBadge = LintMonitorController.getStatusBadge(task.status);
            const errors = task.summary?.errors ?? 0;
            const warnings = task.summary?.warnings ?? 0;
            return `
              <tr>
                <td>${this.escapeHtml(task.label || task.id || 'לא ידוע')}</td>
                <td>${statusBadge}</td>
                <td>${errors}</td>
                <td>${warnings}</td>
                <td>${duration}</td>
                <td>${task.exitCode ?? '—'}</td>
              </tr>
            `;
          })
          .join('')
      : `
        <tr>
          <td colspan="6" class="text-center text-muted">לא אותרו משימות כושלות בדוח האחרון</td>
        </tr>
      `;

    const issues = tasks.flatMap(task =>
      (task.issues || []).map(issue => ({
        tool: task.label,
        file: issue.file,
        message: issue.message,
        rule: issue.rule,
        severity: issue.severity || 'warning',
        location: issue.line ? `${issue.line}:${issue.column ?? 0}` : '—',
      })),
    );
    const topIssues = issues.slice(0, 8);
    const issuesList = topIssues.length
      ? `
        <ol class="ps-3">
          ${topIssues
            .map(
              issue => `
                <li class="mb-2">
                  <div><strong>${this.escapeHtml(issue.tool || 'כלי לא ידוע')}</strong> · ${this.escapeHtml(issue.severity)}</div>
                  <div class="text-muted small">${this.escapeHtml(issue.file || '—')} (${this.escapeHtml(issue.location)})</div>
                  <div>${this.escapeHtml(issue.message || '—')}</div>
                  <div class="text-muted small">כלל: ${this.escapeHtml(issue.rule || '—')}</div>
                </li>
              `,
            )
            .join('')}
        </ol>
      `
      : '<p class="text-muted mb-0">אין פירוט סוגיות בדוח המצורף.</p>';

    const stdout = this.formatCliOutput(result.stdout);
    const stderr = this.formatCliOutput(result.stderr);
    const noteMessage = result.message ? `<p class="mb-0">${this.escapeHtml(result.message)}</p>` : '';

    return `
      <div class="lint-run-details">
        <div class="alert alert-danger" role="alert">
          <strong>ההרצה הסתיימה במצב ${this.escapeHtml(result.status || 'error')}.</strong>
          <div>Exit Code: <span dir="ltr">${this.escapeHtml(exitCode)}</span></div>
          <div>זמן הריצה: ${this.escapeHtml(timestamp || 'לא זמין')}</div>
          ${noteMessage}
        </div>

        <div class="row g-3">
          ${summaryItems
            .map(
              item => `
                <div class="col-6 col-md-4">
                  <div class="p-3 border rounded bg-light h-100">
                    <div class="text-muted small">${item.label}</div>
                    <div class="fw-bold fs-5">${this.escapeHtml(String(item.value))}</div>
                  </div>
                </div>
              `,
            )
            .join('')}
        </div>

        <h5 class="mt-4">משימות שנכשלו</h5>
        <div class="table-responsive">
          <table class="table table-sm table-striped align-middle">
            <thead>
              <tr>
                <th>כלי</th>
                <th>סטטוס</th>
                <th>שגיאות</th>
                <th>אזהרות</th>
                <th>משך</th>
                <th>Exit Code</th>
              </tr>
            </thead>
            <tbody>
              ${failingRows}
            </tbody>
          </table>
        </div>

        <h5 class="mt-4">סוגיות בולטות</h5>
        ${issuesList}

        <h5 class="mt-4">פלט CLI</h5>
        <div class="row g-3">
          <div class="col-md-6">
            <h6>stdout</h6>
            <pre dir="ltr" class="lint-cli-output bg-dark text-white p-3 rounded">${stdout}</pre>
          </div>
          <div class="col-md-6">
            <h6>stderr</h6>
            <pre dir="ltr" class="lint-cli-output bg-dark text-white p-3 rounded">${stderr}</pre>
          </div>
        </div>

        <div class="alert alert-info mt-4" role="alert">
          <p class="mb-1">הדוח האחרון נשמר תמיד בקובץ <code>reports/linter/latest.json</code>.</p>
          <p class="mb-1">היסטוריית הריצות נשמרת בקובץ <code>reports/linter/history.json</code>.</p>
          <p class="mb-0">ניתן להוריד את הדוח גם מהכפתור “הורד דוח JSON” בסקשן “בדיקות ידניות ותהליכי תחזוקה”.</p>
        </div>
      </div>
    `;
  }

  formatCliOutput(value) {
    if (value === null || value === undefined) {
      return this.escapeHtml('— אין פלט —');
    }
    const raw = typeof value === 'string' ? value.trim() : JSON.stringify(value, null, 2);
    if (!raw) {
      return this.escapeHtml('— אין פלט —');
    }
    const limit = 1800;
    const output = raw.length > limit ? `${raw.slice(0, limit)}…` : raw;
    return this.escapeHtml(output);
  }

  escapeHtml(text) {
    if (text === null || text === undefined) {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  async downloadLatestReport() {
    try {
      const report = this.state.latestReport || (await LintStatusService.fetchLatestReport());

      if (!report) {
        if (typeof window.showNotification === 'function') {
          window.showNotification('לא נמצא דוח זמין להורדה', 'warning');
        }
        return;
      }

      const timestampRaw = report.generatedAt || new Date().toISOString();
      const safeTimestamp = timestampRaw.replace(/[:.]/g, '-').replace('T', '_').replace(/Z$/, '');
      const filename = `lint-report-${safeTimestamp}.json`;

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('דוח הורד בהצלחה', filename);
      }
    } catch (error) {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בהורדת הדוח', error.message);
      }
      window.Logger?.error('[LintMonitor] Failed to download report:', error, {
        page: LINT_MONITOR_HOST_PAGE,
      });
    }
  }

  async copyLatestReportToClipboard() {
    try {
      const report = this.state.latestReport || (await LintStatusService.fetchLatestReport());
      if (!report) {
        if (typeof window.showWarningNotification === 'function') {
          window.showWarningNotification('אין דוח להעתקה', 'הרץ lint:collect ורענן את העמוד.');
        }
        return;
      }

      const serialized = JSON.stringify(report, null, 2);
      await copyTextToClipboard(serialized);

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('דוח הלינטר הועתק ללוח', 'ניתן להדביק בכל עורך טקסט');
      }
    } catch (error) {
      window.Logger?.error('[LintMonitor] Failed to copy report JSON:', error, {
        page: LINT_MONITOR_HOST_PAGE,
      });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בהעתקת הדוח', error.message);
      }
    }
  }

  static getStatusBadge(status) {
    const normalized = status || 'unknown';
    const labels = {
      passed: { text: 'עבר', className: 'lint-status-success' },
      warning: { text: 'אזהרות', className: 'lint-status-warning' },
      failed: { text: 'נכשל', className: 'lint-status-error' },
      error: { text: 'שגיאה', className: 'lint-status-error' },
      unknown: { text: 'לא ידוע', className: 'lint-status-muted' },
    };

    const badge = labels[normalized] || labels.unknown;
    return `<span class="lint-status-badge ${badge.className}">${badge.text}</span>`;
  }

  static getSeverityLabel(severity) {
    const labels = {
      error: 'שגיאה',
      warning: 'אזהרה',
      info: 'מידע',
    };

    return labels[severity] || severity || 'לא ידוע';
  }
}

// ===== GLOBAL INITIALIZER =====

window.initializeLintMonitor = async function initializeLintMonitor() {
  if (!window.LintStatusService) {
    window.Logger?.error('[LintMonitor] LintStatusService לא נטען. בדוק את package-manifest.', {
      page: LINT_MONITOR_HOST_PAGE,
    });
    return;
  }

  if (window.lintMonitorController) {
    await window.lintMonitorController.loadData();
    return;
  }

  window.lintMonitorController = new LintMonitorController();
  await window.lintMonitorController.init();
};

function buildLintDetailedLog() {
  const controller = window.lintMonitorController;
  const state = controller?.state || {};
  const report = state.latestReport;
  const tasks = Array.isArray(report?.tasks) ? report.tasks : [];
  const history = Array.isArray(state.history) ? state.history : [];
  const issues = Array.isArray(state.issues) ? state.issues : [];
  const timestamp = new Date().toLocaleString('he-IL');
  const log = [];

  log.push('=== לוג מפורט - ניטור איכות קוד ===');
  log.push(`זמן יצירה: ${timestamp}`);
  log.push(`עמוד: ${window.location.href}`);
  log.push('');

  log.push('--- מצב סקשנים ---');
  const sections = document.querySelectorAll('.top-section, .content-section');
  sections.forEach((section, index) => {
    const headerTitle = section.querySelector('.section-header .table-title, .section-header h2');
    const body = section.querySelector('.section-body');
    const title = headerTitle ? headerTitle.textContent.trim() : `סקשן ${index + 1}`;
    const isOpen = body && body.style.display !== 'none';
    log.push(`  ${index + 1}. "${title}": ${isOpen ? 'פתוח' : 'סגור'}`);
  });

  const lastUpdatedElement = document.getElementById('lint-last-updated');
  const formattedLastUpdated =
    lastUpdatedElement?.textContent?.trim() &&
    lastUpdatedElement.textContent.trim() !== 'Invalid Date'
      ? lastUpdatedElement.textContent.trim()
      : LintStatusService._formatTimestamp(report?.generatedAt);

  log.push('');
  log.push('--- סיכומי ממשק ---');
  log.push(`עודכן לאחרונה (UI): ${formattedLastUpdated || 'לא זמין'}`);

  const summaryCards = document.querySelectorAll('#lint-summary-cards .lint-summary-card');
  if (summaryCards.length > 0) {
    summaryCards.forEach((card, index) => {
      const label =
        card.querySelector('.lint-summary-label')?.textContent?.trim() || `כרטיס ${index + 1}`;
      const value = card.querySelector('.lint-summary-value')?.textContent?.trim() || 'לא זמין';
      log.push(`  ${label}: ${value}`);
    });
  } else {
    log.push('  אין כרטיסי סיכום להצגה');
  }

  log.push('');
  log.push('--- נתוני דוח אחרון ---');
  if (report) {
    const totals = report.totals || {};
    const formattedGeneratedAt =
      LintStatusService._formatTimestamp(report.generatedAt) || report.generatedAt || 'זמן לא זמין';
    const totalsSummaryLine = [
      `סה"כ כלים: ${totals.tools ?? 'לא זמין'}`,
      ` | עברו: ${totals.passed ?? 0}`,
      ` | אזהרות: ${totals.warning ?? 0}`,
      ` | נכשלו: ${totals.failed ?? 0}`,
      ` | שגיאות: ${totals.error ?? 0}`,
    ].join('');
    const issuesSummaryLine = [
      `סה"כ סוגיות: ${totals.issues ?? issues.length}`,
      ` | שגיאות קריטיות: ${totals.errors ?? 0}`,
      ` | אזהרות: ${totals.warnings ?? 0}`,
    ].join('');

    log.push(`מצב דוח: נטען (${formattedGeneratedAt})`);
    log.push(totalsSummaryLine);
    log.push(issuesSummaryLine);

    if (tasks.length > 0) {
      log.push('');
      log.push('--- סטטוס כלי לינטר ---');
      tasks.forEach((task, index) => {
        const durationSeconds = task.durationMs ? (task.durationMs / 1000).toFixed(2) : 'N/A';
        const errors = task.summary?.errors ?? 0;
        const warnings = task.summary?.warnings ?? 0;
        const taskLine = [
          `  ${index + 1}. ${task.label}`,
          ` | סטטוס: ${task.status}`,
          ` | שגיאות: ${errors}`,
          ` | אזהרות: ${warnings}`,
          ` | משך: ${durationSeconds} שניות`,
          ` | ExitCode: ${task.exitCode ?? 'N/A'}`,
        ].join('');
        log.push(taskLine);
      });
    } else {
      log.push('אין נתוני כלי לינטר להצגה');
    }
  } else {
    log.push('לא נטען דוח אחרון - ייתכן שהסריקה לא הורצה או נכשלה');
  }

  log.push('');
  log.push('--- סוגיות פעילות (עד 10 ראשונות) ---');
  if (issues.length > 0) {
    log.push(`סה"כ סוגיות: ${issues.length}`);
    issues.slice(0, 10).forEach((issue, index) => {
      const location = issue.line ? `${issue.line}:${issue.column || 0}` : 'N/A';
      const issueLine = [
        `  ${index + 1}. [${issue.severity}] ${issue.tool}`,
        ` | ${issue.file}`,
        ` | כלל: ${issue.rule}`,
        ` | מיקום: ${location}`,
      ].join('');
      log.push(issueLine);
      log.push(`     הודעה: ${issue.message}`);
    });
    if (issues.length > 10) {
      log.push(`  ...ועוד ${issues.length - 10} סוגיות נוספות`);
    }
  } else {
    log.push('אין סוגיות פעילות בדוח הנוכחי');
  }

  log.push('');
  log.push('--- היסטוריית ריצות (עד 5 אחרונות) ---');
  if (history.length > 0) {
    log.push(`סה"כ ריצות בהיסטוריה: ${history.length}`);
    history
      .slice(-5)
      .reverse()
      .forEach((entry, index) => {
        const totals = entry.totals || {};
        const entryTimestamp =
          LintStatusService._formatTimestamp(entry.generatedAt) ||
          entry.generatedAt ||
          'תאריך לא זמין';
        const historyLine = [
          `  ${index + 1}. ${entryTimestamp}`,
          ` | סטטוס: עברו ${totals.passed ?? 0}/${totals.tools ?? 0}`,
          ` | שגיאות: ${totals.errors ?? 0}`,
          ` | אזהרות: ${totals.warnings ?? 0}`,
        ].join('');
        log.push(historyLine);
      });
  } else {
    log.push('אין נתוני היסטוריה זמינים');
  }

  log.push('');
  log.push('--- שגיאות והערות מהקונסולה ---');
  log.push('⚠️ חשוב: הלוג חייב לכלול שגיאות קונסולה כדי לפתור תקלות.');
  log.push('📋 פתח את Developer Tools (F12) → Console והוסף שגיאות רלוונטיות ללוג לפני שליחה.');

  log.push('');
  log.push('--- שניוּנים בממשק ---');
  const refreshButtonDisabled = document.getElementById('lint-refresh-button')?.disabled
    ? 'מבוטל'
    : 'פעיל';
  const copyButtonVisible =
    document.getElementById('lint-copy-log-button')?.offsetParent !== null ? 'נראה' : 'לא נראה';
  log.push(`כפתור רענן נתונים: ${refreshButtonDisabled}`);
  log.push(`כפתור העתק לוג מפורט: ${copyButtonVisible}`);

  log.push('');
  log.push('--- מידע טכני ---');
  log.push(`גרסת דפדפן: ${navigator.userAgent}`);
  log.push(`שפת דפדפן: ${navigator.language}`);
  log.push(`פלטפורמה: ${navigator.platform}`);
  log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
  log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);

  if (performance.timing) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    if (!Number.isNaN(loadTime) && loadTime >= 0) {
      log.push(`זמן טעינת עמוד (performance.timing): ${loadTime}ms`);
    }
  }

  if (window.performance && window.performance.memory) {
    const memoryUsed = Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024);
    log.push(`זיכרון JavaScript בשימוש: ${memoryUsed}MB`);
  }

  log.push('');
  log.push('=== סוף הלוג ===');
  return log.join('\n');
}

async function copyTextToClipboard(text) {
  if (!text) {
    throw new Error('לא נמצא טקסט להעתקה');
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

async function copyLintMonitorDetailedLog() {
  try {
    const detailedLog = buildLintDetailedLog();
    await copyTextToClipboard(detailedLog);

    if (typeof window.showSuccessNotification === 'function') {
      const successTitle = 'לוג מפורט הועתק ללוח';
      const successMessage = 'הלוג כולל נתונים עדכניים מעמוד ניטור איכות הקוד';
      window.showSuccessNotification(successTitle, successMessage);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('לוג מפורט הועתק ללוח', 'success');
    } else {
      alert('לוג מפורט הועתק ללוח!');
    }
  } catch (error) {
    window.Logger?.error('[LintMonitor] שגיאה בהעתקת הלוג המפורט:', error, {
      page: LINT_MONITOR_HOST_PAGE,
    });
    if (typeof window.showErrorNotification === 'function') {
      const errorTitle = 'שגיאה בהעתקת הלוג';
      window.showErrorNotification(errorTitle, error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהעתקת הלוג', 'error');
    } else {
      alert(`שגיאה בהעתקת הלוג: ${error.message}`);
    }
  }
}

window.copyLintMonitorDetailedLog = copyLintMonitorDetailedLog;
window.copyDetailedLog = copyLintMonitorDetailedLog;

window.LintMonitorActions = {
  async copyDetailedLog(event) {
    if (event) {
      event.preventDefault();
    }
    await copyLintMonitorDetailedLog();
  },
  async refreshData(event) {
    if (event) {
      event.preventDefault();
    }
    if (window.lintMonitorController) {
      await window.lintMonitorController.loadData({ showToast: true });
    }
  },
  async downloadReport(event) {
    if (event) {
      event.preventDefault();
    }
    if (window.lintMonitorController) {
      await window.lintMonitorController.downloadLatestReport();
    }
  },
  async copyReport(event) {
    if (event) {
      event.preventDefault();
    }
    if (window.lintMonitorController) {
      await window.lintMonitorController.copyLatestReportToClipboard();
    }
  },
};
