/**
 * Background Jobs UI — Phase D
 * --------------------------------------------------------
 * Fetches GET /admin/background-jobs, renders jobs table
 * with job_name, last_run_at, last_status, trigger button.
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

async function fetchBackgroundJobs() {
  try {
    await sharedServices.init();
    const res = await sharedServices.get('/admin/background-jobs');
    const jobs = res?.jobs ?? [];
    return Array.isArray(jobs) ? jobs : [];
  } catch (e) {
    maskedLog('[BackgroundJobs] Fetch error:', { status: e?.status });
    return [];
  }
}

async function triggerJob(jobName) {
  try {
    await sharedServices.init();
    await sharedServices.post(`/admin/background-jobs/${encodeURIComponent(jobName)}/trigger`);
    renderJobs(await fetchBackgroundJobs());
  } catch (e) {
    maskedLog('[BackgroundJobs] Trigger error:', { jobName, status: e?.status });
  }
}

function renderJobs(jobs) {
  const panel = document.getElementById('backgroundJobsPanel');
  if (!panel) return;

  if (!jobs.length) {
    panel.innerHTML = '<p class="settings-note">אין משימות רקע רשומות</p>';
    return;
  }

  const rows = jobs.map((j) => {
    const name = j.job_name ?? j.jobName ?? '—';
    const lastRun = formatDate(j.last_run_at ?? j.lastRunAt);
    const lastStatus = j.last_status ?? j.lastStatus ?? '—';
    const enabled = (j.enabled != null ? j.enabled : j.is_scheduled) !== false;
    return `
      <tr>
        <td>${name}</td>
        <td>${lastRun}</td>
        <td>${lastStatus}</td>
        <td>
          <button type="button" class="phoenix-modal__save-btn js-trigger-job" data-job-name="${encodeURIComponent(name)}" ${!enabled ? 'disabled' : ''} title="הפעל עכשיו">
            הפעל
          </button>
        </td>
      </tr>
    `;
  }).join('');

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
      <tbody>${rows}</tbody>
    </table>
  `;

  panel.querySelectorAll('.js-trigger-job').forEach((btn) => {
    btn.addEventListener('click', () => {
      const jobName = btn.dataset.jobName;
      if (jobName) triggerJob(jobName);
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
