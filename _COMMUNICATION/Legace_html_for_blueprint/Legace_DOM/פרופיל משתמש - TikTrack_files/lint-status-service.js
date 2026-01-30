/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 *
 * DATA FETCHING
 * - fetchLatestReport()         - שליפת דוח הלינטר האחרון משרת ה-API
 * - fetchHistory()              - שליפת היסטוריית הדוחות (רשימת ריצות)
 *
 * DATA TRANSFORMATION
 * - buildSummaryTiles()         - הפקת סטטיסטיקות ראשיות עבור כרטיסיות סיכום
 * - buildTaskSummaries()        - עיבוד משימות הכלים (ESLint, Stylelint וכו')
 * - extractIssues()             - יצירת מערך בעיות מאוחד להצגה בטבלאות
 *
 * UTILITIES
 * - _normalizeResponse()        - בדיקת סטטוס תשובת ה-API והחזרת נתונים
 * - _formatTimestamp()          - המרת מחרוזת ISO לתצוגה מקומית
 *
 * ==========================================
 */

/**
 * Lint Status Service - TikTrack
 * ==============================
 *
 * מנגיש נתונים מ-API השרת עבור דוח הלינטר וממיר אותם למבני נתונים
 * שהתצוגה יכולה להשתמש בהם.
 *
 * תיעוד: documentation/02-ARCHITECTURE/FRONTEND/LINTER_MONITOR_REBUILD_PLAN.md
 *
 * @class LintStatusService
 */
class LintStatusService {
  /**
   * Fetch latest lint report from backend.
   * @param {AbortSignal} [signal]
   * @returns {Promise<object|null>}
   */
  static async fetchLatestReport(signal) {
    try {
      const response = await fetch('/api/quality/lint', { signal });
      const payload = await response.json();

      const normalized = this._normalizeResponse(payload);
      return normalized?.data ?? null;
    } catch (error) {
      if (typeof window.handleApiError === 'function') {
        window.handleApiError(error, 'LintStatusService.fetchLatestReport');
      } else {
        window.Logger?.error('[LintStatusService] Failed to fetch latest lint report:', error, {
          page: 'lint-status-service',
        });
      }
      throw error;
    }
  }

  /**
   * Fetch lint history (list of past reports).
   * @param {AbortSignal} [signal]
   * @returns {Promise<Array<object>>}
   */
  static async fetchHistory(signal) {
    try {
      const response = await fetch('/api/quality/lint/history', { signal });
      const payload = await response.json();
      const normalized = this._normalizeResponse(payload);
      return Array.isArray(normalized?.data) ? normalized.data : [];
    } catch (error) {
      if (typeof window.handleApiError === 'function') {
        window.handleApiError(error, 'LintStatusService.fetchHistory');
      } else {
        window.Logger?.error('[LintStatusService] Failed to fetch lint history:', error, {
          page: 'lint-status-service',
        });
      }
      throw error;
    }
  }

  /**
   * Trigger lint collection via backend endpoint.
   * @returns {Promise<object>}
   */
  static async runCollection(note) {
    try {
      const response = await fetch('/api/quality/lint/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ note: note || null }),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 404 || response.status === 405) {
          const apiUnavailableMessage =
            'API להרצת דוח הלינטר אינו פעיל (404/405). יש להפעיל מחדש את השרת או לוודא שהעדכון האחרון נפרס.';
          throw new Error(apiUnavailableMessage);
        }
        throw new Error(payload?.message || `HTTP ${response.status}`);
      }

      if (payload?.status === 'error') {
        throw new Error(payload?.message || 'Lint collection failed');
      }

      return payload;
    } catch (error) {
      window.Logger?.error('[LintStatusService] Failed to run lint collection:', error, {
        page: 'lint-status-service',
      });
      throw error;
    }
  }

  /**
   * Build summary tiles for dashboard header.
   * @param {object} report
   * @returns {Array<object>}
   */
  static buildSummaryTiles(report) {
    if (!report || typeof report !== 'object') {
      return [];
    }

    const totals = report.totals || {};
    const generatedAt = this._formatTimestamp(report.generatedAt);

    return [
      {
        id: 'last-run',
        label: 'ריצה אחרונה',
        value: generatedAt || 'לא זמין',
        icon: '🕒',
      },
      {
        id: 'issues-total',
        label: 'סה״כ סוגיות',
        value: totals.issues ?? 0,
        icon: '📊',
      },
      {
        id: 'errors-total',
        label: 'שגיאות קריטיות',
        value: totals.errors ?? 0,
        icon: '❗',
      },
      {
        id: 'warnings-total',
        label: 'אזהרות',
        value: totals.warnings ?? 0,
        icon: '⚠️',
      },
    ];
  }

  /**
   * Summaries for each tool (ESLint, Stylelint, etc.).
   * @param {object} report
   * @returns {Array<object>}
   */
  static buildTaskSummaries(report) {
    if (!report || !Array.isArray(report.tasks)) {
      return [];
    }

    return report.tasks.map(task => ({
      id: task.id,
      label: task.label,
      status: task.status,
      durationMs: task.durationMs,
      issues: task.issues?.length ?? 0,
      errors: task.summary?.errors ?? 0,
      warnings: task.summary?.warnings ?? 0,
      exitCode: task.exitCode,
    }));
  }

  /**
   * Extract issue list for table rendering.
   * @param {object} report
   * @returns {Array<object>}
   */
  static extractIssues(report) {
    if (!report || !Array.isArray(report.tasks)) {
      return [];
    }

    const generatedAt = this._formatTimestamp(report.generatedAt);

    return report.tasks.flatMap(task => {
      if (!Array.isArray(task.issues)) {
        return [];
      }

      return task.issues.map(issue => ({
        tool: task.label,
        severity: issue.severity || (task.status === 'failed' ? 'error' : 'warning'),
        file: issue.file || 'לא ידוע',
        rule: issue.rule || 'לא ידוע',
        message: issue.message || '—',
        line: issue.line ?? 0,
        column: issue.column ?? 0,
        generatedAt,
      }));
    });
  }

  /**
   * Normalize API payload and enforce success/error semantics.
   * @param {object} payload
   * @returns {object|null}
   * @private
   */
  static _normalizeResponse(payload) {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    if (payload.status === 'success') {
      return payload;
    }

    if (payload.status === 'empty') {
      return { data: null, message: payload.message || 'No lint data available.' };
    }

    throw new Error(payload.message || 'Unexpected lint API response');
  }

  /**
   * Format ISO timestamp into local string.
   * @param {string} isoString
   * @returns {string}
   * @private
   */
  static _formatTimestamp(value) {
    if (value === null || value === undefined) {
      return '';
    }

    const rawValue = String(value).trim();
    if (!rawValue || rawValue.toLowerCase().includes('invalid')) {
      return '';
    }

    const tryParse = input => {
      const parsed = Date.parse(input);
      if (Number.isNaN(parsed)) {
        return null;
      }
      return new Date(parsed);
    };

    let date = tryParse(rawValue);

    // Attempt to normalize common DD/MM/YYYY HH:mm formats
    if (!date) {
      const fallbackPattern = /^(\d{2})[./-](\d{2})[./-](\d{4})[ T]?(\d{2}):(\d{2})(?::(\d{2}))?$/u;
      const match = rawValue.match(fallbackPattern);
      if (match) {
        const [, day, month, year, hours, minutes, seconds = '00'] = match;
        const isoCandidate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
        date = tryParse(isoCandidate);
      }
    }

    if (!date) {
      window.Logger?.warn('[LintStatusService] Failed to format timestamp:', rawValue, {
        page: 'lint-status-service',
      });
      return rawValue;
    }

    return date.toLocaleString('he-IL');
  }
}

// Expose globally
window.LintStatusService = LintStatusService;
