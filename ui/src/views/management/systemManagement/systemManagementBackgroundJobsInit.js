/**
 * Background Jobs UI — Phase D
 * T30-2: Inline history expand ▼ היסטוריה (N)
 * T30-8: Toggle button (enable/disable)
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

const JOB_HEBREW = {
  sync_ticker_prices_intraday: 'סנכרון מחירי טיקרים (Intraday)',
  sync_exchange_rates_eod: 'סנכרון שערי חליפין (EOD)',
  check_alert_conditions: 'בדיקת תנאי התראות',
};

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function statusBadge(s) {
  if (!s) return '<span class="badge badge--secondary">טרם רץ</span>';
  const map = {
    COMPLETED: 'badge--success',
    FAILED: 'badge--error',
    RUNNING: 'badge--info',
    PENDING: 'badge--secondary',
  };
  const label = {
    COMPLETED: 'הסתיים',
    FAILED: 'נכשל',
    RUNNING: 'פועל',
    PENDING: 'ממתין',
  };
  const c = map[s] || 'badge--secondary';
  return `<span class="badge ${c}">${label[s] || s}</span>`;
}

async function fetchBackgroundJobs() {
  try {
    await sharedServices.init();
    const res = await sharedServices.get('/admin/background-jobs');
    const jobs = res?.jobs ?? [];
    const list = Array.isArray(jobs) ? jobs : [];
    const withHistory = await Promise.all(
      list.map(async (j) => {
        try {
          const d = await sharedServices.get(
            `/admin/background-jobs/${encodeURIComponent(j.job_name ?? j.jobName)}`,
          );
          return { ...j, historyCount: (d?.history ?? []).length };
        } catch {
          return { ...j, historyCount: 0 };
        }
      }),
    );
    return withHistory;
  } catch (e) {
    maskedLog('[BackgroundJobs] Fetch error:', { status: e?.status });
    return [];
  }
}

async function triggerJob(jobName) {
  try {
    await sharedServices.init();
    await sharedServices.post(
      `/admin/background-jobs/${encodeURIComponent(jobName)}/trigger`,
    );
    renderJobs(await fetchBackgroundJobs());
  } catch (e) {
    maskedLog('[BackgroundJobs] Trigger error:', {
      jobName,
      status: e?.status,
    });
  }
}

async function toggleJob(jobName) {
  try {
    await sharedServices.init();
    await sharedServices.post(
      `/admin/background-jobs/${encodeURIComponent(jobName)}/toggle`,
    );
    renderJobs(await fetchBackgroundJobs());
  } catch (e) {
    maskedLog('[BackgroundJobs] Toggle error:', { jobName, status: e?.status });
  }
}

function renderJobs(jobs) {
  const panel = document.getElementById('backgroundJobsPanel');
  if (!panel) return;

  if (!jobs.length) {
    panel.innerHTML = '<p class="settings-note">אין משימות רקע רשומות</p>';
    return;
  }

  panel.innerHTML = `
    <table class="phoenix-table" role="table">
      <thead>
        <tr>
          <th>משימה</th>
          <th>הרצה אחרונה</th>
          <th>סטטוס</th>
          <th>פעולות</th>
        </tr>
      </thead>
      <tbody>
        ${jobs
          .map((j) => {
            const name = j.job_name ?? j.jobName ?? '—';
            const desc = JOB_HEBREW[name] || (j.description ?? '');
            const lastRun = formatDate(j.last_run_at ?? j.lastRunAt);
            const enabled =
              (j.enabled != null ? j.enabled : j.is_scheduled) !== false;
            const scheduled = j.is_scheduled !== false;
            const N = j.historyCount ?? 0;
            return `
      <tr data-job-name="${encodeURIComponent(name)}">
        <td>${name} — ${desc}</td>
        <td>${lastRun}</td>
        <td>${statusBadge(j.last_status ?? j.lastStatus)}</td>
        <td>
          <button type="button" class="btn btn-sm js-trigger-job" data-job-name="${encodeURIComponent(name)}" ${!enabled || !scheduled ? 'disabled' : ''}>הפעל</button>
          <button type="button" class="btn btn-sm js-toggle-job" data-job-name="${encodeURIComponent(name)}">${scheduled ? 'עצור' : 'הפעל'}</button>
          <button type="button" class="btn btn-sm js-history-toggle" data-job-name="${encodeURIComponent(name)}" data-history-count="${N}">▼ היסטוריה (${N})</button>
        </td>
      </tr>
      <tr class="job-history-row" data-job-history-for="${encodeURIComponent(name)}" hidden>
        <td colspan="4" class="job-history-cell">
          <div class="job-history-content"></div>
        </td>
      </tr>`;
          })
          .join('')}
      </tbody>
    </table>
  `;

  panel.querySelectorAll('.js-trigger-job').forEach((btn) => {
    btn.addEventListener('click', () => {
      const jobName = btn.dataset.jobName;
      if (jobName) triggerJob(jobName);
    });
  });

  panel.querySelectorAll('.js-toggle-job').forEach((btn) => {
    btn.addEventListener('click', () => {
      const jobName = btn.dataset.jobName;
      if (jobName) toggleJob(jobName);
    });
  });

  panel.querySelectorAll('.js-history-toggle').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const jobName = btn.dataset.jobName;
      if (!jobName) return;
      const row = panel.querySelector(`tr[data-job-history-for="${jobName}"]`);
      const content = row?.querySelector('.job-history-content');
      if (!row || !content) return;
      if (row.hidden) {
        row.hidden = false;
        content.textContent = 'טוען...';
        let items = [];
        try {
          const res = await sharedServices.get(
            `/admin/background-jobs/${decodeURIComponent(jobName)}/history`,
            { limit: 5 },
          );
          items = res?.items ?? [];
          content.innerHTML = items.length
            ? `
            <table class="phoenix-table phoenix-table--compact">
              <thead><tr><th>תאריך</th><th>סטטוס</th><th>משך (ms)</th><th>רשומות</th><th>שגיאות</th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (r) => `
                  <tr>
                    <td>${formatDate(r.started_at)}</td>
                    <td>${statusBadge(r.status)}</td>
                    <td>${r.duration_ms ?? '—'}</td>
                    <td>${r.records_processed ?? '—'}</td>
                    <td>${r.error_count ?? 0}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          `
            : '<p class="settings-note">אין ריצות ב-24 השעות האחרונות</p>';
        } catch {
          content.innerHTML =
            '<p class="settings-error">לא ניתן לטעון היסטוריה</p>';
        }
        btn.dataset.historyCount = String(items.length);
        btn.textContent = '▲ הסתר היסטוריה';
      } else {
        row.hidden = true;
        const n = btn.dataset.historyCount || '0';
        btn.textContent = `▼ היסטוריה (${n})`;
      }
    });
  });
}

async function init() {
  const panel = document.getElementById('backgroundJobsPanel');
  if (!panel) return;
  const jobs = await fetchBackgroundJobs();
  renderJobs(jobs);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
