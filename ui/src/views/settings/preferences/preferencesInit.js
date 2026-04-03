/**
 * Preferences Page Init — D39 User Preferences (S003-P003-WP001)
 * LLD400 §4.1 — 6 tt-section groups, collapsible-container, maskedLog
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

const DEFAULT_PREFERENCES = {
  language: 'en',
  timezone: 'UTC',
  primary_currency: 'USD',
  date_format: 'YYYY-MM-DD',
  default_trading_account: null,
  default_order_type: 'LIMIT',
  default_time_in_force: 'DAY',
  default_commission_unit: '%',
  pl_method: 'FIFO',
  default_price_type: 'CLOSE',
  email_notifications_enabled: false,
  alert_trigger_email: true,
  weekly_summary_email: false,
  price_alert_threshold_pct: 5.0,
  default_status_filter: 'active',
  rows_per_page: 25,
  default_sort_column: 'updated_at',
  api_rate_limit: 1000,
  api_key_count: 0,
  high_contrast_mode: false,
  font_size: 'medium',
  rtl_mode: false,
  decimal_separator: '.',
};

async function loadPreferences() {
  try {
    await sharedServices.init();
    const res = await sharedServices.get('/me/preferences', {});
    const data = res?.data ?? res;
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      return { ok: true, data };
    }
    return { ok: false, data: DEFAULT_PREFERENCES };
  } catch (e) {
    if (e?.status === 404 || e?.code === 'HTTP_404') {
      maskedLog('[Preferences] API /me/preferences not yet available (404)', {
        fallback: 'DEFAULT_PREFERENCES',
      });
      return { ok: false, data: DEFAULT_PREFERENCES };
    }
    maskedLog('[Preferences] Load error:', {
      status: e?.status,
      message: e?.message,
    });
    throw e;
  }
}

async function savePreferences(payload) {
  await sharedServices.init();
  return sharedServices.patch('/me/preferences', payload);
}

function renderSectionA(container, prefs) {
  container.innerHTML = `
    <p class="settings-note">תצוגה ושפה — timezone, language (read-only)</p>
    <div class="form-group">
      <label for="preferences-timezone" data-testid="preferences-timezone-label">אזור זמן</label>
      <select id="preferences-timezone" class="form-control" data-key="timezone">
        <option value="UTC" ${prefs.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
        <option value="America/New_York" ${prefs.timezone === 'America/New_York' ? 'selected' : ''}>America/New_York</option>
        <option value="Europe/London" ${prefs.timezone === 'Europe/London' ? 'selected' : ''}>Europe/London</option>
        <option value="Asia/Jerusalem" ${prefs.timezone === 'Asia/Jerusalem' ? 'selected' : ''}>Asia/Jerusalem</option>
      </select>
    </div>
    <div class="form-group">
      <label for="preferences-language" data-testid="preferences-language-label">שפה</label>
      <input type="text" id="preferences-language" data-key="language" value="${prefs.language || 'en'}" disabled class="form-control" data-testid="preferences-language" title="עתידי" />
      <span class="form-hint">עתידי</span>
    </div>
  `;
}

function renderSectionB(container, prefs) {
  container.innerHTML = `
    <p class="settings-note">ברירות מחדל למסחר</p>
    <div class="form-group">
      <label for="preferences-default-order-type">סוג פקודה</label>
      <select id="preferences-default-order-type" class="form-control" data-key="default_order_type">
        <option value="LIMIT" ${prefs.default_order_type === 'LIMIT' ? 'selected' : ''}>LIMIT</option>
        <option value="MARKET" ${prefs.default_order_type === 'MARKET' ? 'selected' : ''}>MARKET</option>
      </select>
    </div>
    <div class="form-group">
      <label for="preferences-default-time-in-force">Time in Force</label>
      <select id="preferences-default-time-in-force" class="form-control" data-key="default_time_in_force">
        <option value="DAY" ${prefs.default_time_in_force === 'DAY' ? 'selected' : ''}>DAY</option>
        <option value="GTC" ${prefs.default_time_in_force === 'GTC' ? 'selected' : ''}>GTC</option>
      </select>
    </div>
  `;
}

function renderSectionC(container, prefs) {
  container.innerHTML = `
    <p class="settings-note">התראות</p>
    <div class="form-group">
      <label><input type="checkbox" data-key="email_notifications_enabled" ${prefs.email_notifications_enabled ? 'checked' : ''} /> הפעלת התראות במייל</label>
    </div>
    <div class="form-group">
      <label><input type="checkbox" data-key="alert_trigger_email" ${prefs.alert_trigger_email ? 'checked' : ''} /> התראות על טריגר התראות</label>
    </div>
    <div class="form-group">
      <label><input type="checkbox" data-key="weekly_summary_email" ${prefs.weekly_summary_email ? 'checked' : ''} /> סיכום שבועי במייל</label>
    </div>
  `;
}

function renderSectionD(container, prefs) {
  container.innerHTML = `
    <p class="settings-note">פריסת דשבורד</p>
    <div class="form-group">
      <label for="preferences-rows-per-page" data-testid="preferences-rows-per-page-label">שורות לעמוד</label>
      <select id="preferences-rows-per-page" class="form-control" data-key="rows_per_page" data-testid="preferences-rows-per-page">
        <option value="10" ${prefs.rows_per_page === 10 ? 'selected' : ''}>10</option>
        <option value="25" ${(prefs.rows_per_page || 25) === 25 ? 'selected' : ''}>25</option>
        <option value="50" ${prefs.rows_per_page === 50 ? 'selected' : ''}>50</option>
        <option value="100" ${prefs.rows_per_page === 100 ? 'selected' : ''}>100</option>
      </select>
    </div>
  `;
}

function renderSectionE(container, prefs) {
  container.innerHTML = `
    <p class="settings-note">API — קריאה בלבד</p>
    <div class="form-group">
      <label>מפתחות API</label>
      <input type="text" value="${prefs.api_key_count ?? 0}" readonly class="form-control" />
    </div>
    <div class="form-group">
      <label>מגבלת קצב</label>
      <input type="text" value="${prefs.api_rate_limit ?? 1000}" readonly class="form-control" />
    </div>
  `;
}

function renderSectionF(container, prefs) {
  container.innerHTML = `
    <p class="settings-note">נגישות</p>
    <div class="form-group">
      <label><input type="checkbox" data-key="high_contrast_mode" ${prefs.high_contrast_mode ? 'checked' : ''} /> מצב ניגודיות גבוהה</label>
    </div>
    <div class="form-group">
      <label><input type="checkbox" data-key="rtl_mode" data-testid="preferences-rtl-mode" ${prefs.rtl_mode ? 'checked' : ''} /> מצב RTL (כתיבה מימין לשמאל)</label>
    </div>
    <div class="form-group">
      <label for="preferences-font-size">גודל גופן</label>
      <select id="preferences-font-size" class="form-control" data-key="font_size">
        <option value="small" ${prefs.font_size === 'small' ? 'selected' : ''}>קטן</option>
        <option value="medium" ${(prefs.font_size || 'medium') === 'medium' ? 'selected' : ''}>בינוני</option>
        <option value="large" ${prefs.font_size === 'large' ? 'selected' : ''}>גדול</option>
      </select>
    </div>
  `;
}

function collectSectionData(sectionKey) {
  const section = document.querySelector(`[data-section="${sectionKey}"]`);
  if (!section) return {};
  const payload = {};
  const inputs = section.querySelectorAll('[data-key]');
  inputs.forEach((el) => {
    if (el.disabled) return;
    const key = el.dataset.key;
    if (el.type === 'checkbox') {
      payload[key] = el.checked;
    } else {
      const val = el.value;
      if (val !== undefined && val !== '') payload[key] = val;
    }
  });
  return payload;
}

async function handleSave(group, currentPrefs) {
  const btn = document.querySelector(`[data-save-group="${group}"]`);
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'שומר...';
  const errEl = document.getElementById(`preferences-err-${group}`);
  if (errEl) errEl.textContent = '';

  try {
    const payload = collectSectionData(`preferences-group-${group}`);
    if (Object.keys(payload).length === 0) {
      if (errEl) errEl.textContent = 'לא בוצעו שינויים.';
      btn.disabled = false;
      btn.textContent = 'שמירה';
      return;
    }
    await savePreferences(payload);
    if (window.TT)
      window.TT.preferences = {
        ...(window.TT.preferences || currentPrefs),
        ...payload,
      };
    if (errEl) errEl.textContent = '';
    const okEl = document.getElementById(`preferences-ok-${group}`);
    if (okEl) {
      okEl.textContent = 'נשמר בהצלחה';
      setTimeout(() => {
        okEl.textContent = '';
      }, 2000);
    }
  } catch (e) {
    maskedLog('[Preferences] Save error:', { group, status: e?.status });
    if (errEl)
      errEl.textContent =
        e?.status === 404 ? 'API עדיין לא זמין' : e?.message || 'שגיאה בשמירה';
  } finally {
    btn.disabled = false;
    btn.textContent = 'שמירה';
  }
}

function bindSaveButtons(prefs) {
  ['a', 'b', 'c', 'd', 'e', 'f'].forEach((group) => {
    const btn = document.querySelector(`[data-save-group="${group}"]`);
    if (btn) {
      btn.replaceWith(btn.cloneNode(true));
      const newBtn = document.querySelector(`[data-save-group="${group}"]`);
      if (newBtn)
        newBtn.addEventListener('click', () => handleSave(group, prefs));
    }
  });
}

(async function initPreferencesPage() {
  'use strict';

  const container = document.querySelector(
    'tt-container.collapsible-container[data-testid="preferences-page"]',
  );
  if (!container) return;

  const apiNotice = document.getElementById('preferences-api-notice');
  if (apiNotice) apiNotice.remove();

  try {
    const { ok, data } = await loadPreferences();
    if (!ok) {
      const notice = document.createElement('p');
      notice.id = 'preferences-api-notice';
      notice.className = 'settings-note settings-note--warning';
      notice.textContent =
        'API /me/preferences עדיין לא זמין. מוצגות ברירות מחדל.';
      container.insertBefore(notice, container.firstChild);
    }
    if (window.TT) window.TT.preferences = data;

    const sections = {
      a: document.getElementById('pref-section-a'),
      b: document.getElementById('pref-section-b'),
      c: document.getElementById('pref-section-c'),
      d: document.getElementById('pref-section-d'),
      e: document.getElementById('pref-section-e'),
      f: document.getElementById('pref-section-f'),
    };
    if (sections.a) renderSectionA(sections.a, data);
    if (sections.b) renderSectionB(sections.b, data);
    if (sections.c) renderSectionC(sections.c, data);
    if (sections.d) renderSectionD(sections.d, data);
    if (sections.e) renderSectionE(sections.e, data);
    if (sections.f) renderSectionF(sections.f, data);

    bindSaveButtons(data);
  } catch (e) {
    maskedLog('[Preferences] Init failed:', e);
    const err = document.createElement('p');
    err.className = 'settings-error';
    err.textContent = 'לא ניתן לטעון העדפות. יש להתחבר מחדש.';
    container.appendChild(err);
  }
})();
