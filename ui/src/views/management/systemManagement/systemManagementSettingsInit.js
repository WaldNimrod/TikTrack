/**
 * System Management Settings Init — Market Data Settings (MD-SETTINGS)
 * TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE
 * TEAM_20_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_COORDINATION
 *
 * GET /settings/market-data — טעינה
 * PATCH /settings/market-data — שמירה (Admin-only)
 * הצגת שגיאות 400/403/422; state reload אחרי שמירה.
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

const FIELD_HINTS = {
  max_active_tickers:
    'מספר מקסימלי של טיקרים שמקבלים עדכון Intraday בו-זמנית. ≥50 = עומס גבוה.',
  intraday_interval_minutes:
    'כל כמה דקות מתבצע עדכון Intraday. ערך נמוך = עומס API גבוה.',
  off_hours_interval_minutes:
    'מרווח בין עדכונים מחוץ לשעות המסחר. ניתן לקבוע ערך גבוה יותר לחיסכון בAPI.',
  provider_cooldown_minutes:
    'המתנה אחרי קבלת שגיאת 429 (Rate Limit). ערך נמוך = סיכון לחסימה חוזרת.',
  alpha_quota_cooldown_hours:
    'המתנה לאחר ניצול quota יומי של Alpha Vantage. ברירת מחדל: 24 שעות.',
  max_symbols_per_request:
    'כמה סימבולים שולחים בבקשה אחת ל-Yahoo. Yahoo מגביל לפחות מ-50 במקביל.',
  delay_between_symbols_seconds:
    'השהייה בין בקשות. ערך גבוה = פחות 429, זמן sync ארוך יותר.',
  intraday_enabled: 'כיבוי → Intraday sync לא פועל כלל. EOD עדיין פועל.',
};

const FIELDS = [
  {
    key: 'max_active_tickers',
    label: 'מקסימום טיקרים פעילים (Intraday)',
    type: 'number',
    min: 1,
    max: 500,
    default: 50,
  },
  {
    key: 'intraday_interval_minutes',
    label: 'מרווח Intraday (דקות)',
    type: 'number',
    min: 5,
    max: 240,
    default: 15,
  },
  {
    key: 'off_hours_interval_minutes',
    label: 'מרווח מחוץ לשעות מסחר (דקות)',
    type: 'number',
    min: 15,
    max: 240,
    default: 60,
  },
  {
    key: 'provider_cooldown_minutes',
    label: 'זמן Cooldown אחרי 429 (דקות)',
    type: 'number',
    min: 5,
    max: 120,
    default: 15,
  },
  {
    key: 'alpha_quota_cooldown_hours',
    label: 'המתנת Quota Alpha (שעות)',
    type: 'number',
    min: 6,
    max: 48,
    default: 24,
  },
  {
    key: 'max_symbols_per_request',
    label: 'מקסימום סימבולים לבקשה',
    type: 'number',
    min: 1,
    max: 50,
    default: 50,
  },
  {
    key: 'delay_between_symbols_seconds',
    label: 'רווח (שניות) בין סימבולים',
    type: 'number',
    min: 0,
    max: 30,
    default: 1,
  },
  {
    key: 'intraday_enabled',
    label: 'הפעלת רענון Intraday',
    type: 'boolean',
    default: true,
  },
];

const ERROR_MESSAGES = {
  403: 'אין הרשאה — נדרש תפקיד Admin.',
  500: 'שגיאה בשמירה. נסה שוב.',
  503: 'הגדרות עדיין לא זמינות. יש לתאם עם DevOps.',
};

let currentValues = {};

function renderHeatCard(panel, settings, summary) {
  let heatEl = panel.querySelector('.market-data-heat-card');
  if (!heatEl) {
    heatEl = document.createElement('div');
    heatEl.className = 'market-data-heat-card';
    heatEl.setAttribute('aria-label', 'עומס נתוני שוק');
    panel.insertBefore(heatEl, panel.querySelector('.settings-note'));
  }
  const active = summary?.active_tickers ?? 0;
  const max = Number(settings?.max_active_tickers) || 50;
  const loadPct = max > 0 ? Math.round((active / max) * 100) : 0;
  const level = loadPct >= 80 ? 'high' : loadPct >= 50 ? 'medium' : 'low';
  heatEl.innerHTML = `
    <div class="heat-card__title">עומס מערכת</div>
    <div class="heat-card__value">
      <span class="heat-indicator heat-indicator--${level}">${loadPct}%</span>
    </div>
    <div class="heat-card__detail">
      <span>טיקרים פעילים: <strong id="heatActiveTickers">${active}</strong></span>
      <span>מקסימום: <strong id="heatMaxTickers">${max}</strong></span>
    </div>
  `;
}

async function loadSettings() {
  const panel = document.getElementById('marketDataSettingsPanel');
  const container = document.getElementById('marketDataSettingsValues');
  if (!panel) return;
  const errorEl = document.getElementById('marketDataSettingsError');
  const successEl = document.getElementById('marketDataSettingsSuccess');
  if (!container) return;

  if (errorEl) errorEl.textContent = '';
  if (successEl) successEl.textContent = '';

  try {
    await sharedServices.init();
    const res = await sharedServices.get('/settings/market-data', {});
    const data = res?.data ?? res;
    if (!data || typeof data !== 'object') throw new Error('No data');

    currentValues = { ...data };
    let summary = { active_tickers: 0 };
    try {
      const sumRes = await sharedServices.get('/tickers/summary', {});
      summary = sumRes?.data ?? sumRes ?? summary;
    } catch (_) {}
    renderHeatCard(panel, data, summary);
    renderForm(container, data);
  } catch (e) {
    maskedLog('[System Management] Failed to load market-data settings:', e);
    const msg =
      e.status === 403
        ? ERROR_MESSAGES[403]
        : e.status === 503
          ? ERROR_MESSAGES[503]
          : 'לא ניתן לטעון הגדרות. יש לבדוק חיבור ל-Backend.';
    container.innerHTML = `<p class="settings-error">${msg}</p>`;
  }
}

function renderForm(container, data) {
  container.innerHTML = '';
  const form = document.createElement('form');
  form.className = 'market-data-settings-form';
  form.id = 'marketDataSettingsForm';

  FIELDS.forEach((f) => {
    const row = document.createElement('div');
    row.className = 'settings-row settings-row--editable';

    const hint = FIELD_HINTS[f.key] || '';
    if (f.type === 'boolean') {
      const checked = data[f.key] === true || data[f.key] === 'true';
      row.innerHTML = `
        <label class="settings-row__label" for="md-${f.key}">${f.label}${hint ? ` <span class="settings-row__field-hint" title="${hint.replace(/"/g, '&quot;')}">ℹ</span>` : ''}</label>
        <div class="settings-row__input-wrap">
          <input type="checkbox" id="md-${f.key}" name="${f.key}" data-key="${f.key}" ${checked ? 'checked' : ''} class="js-market-data-input" />
        </div>
      `;
    } else {
      const val = data[f.key] ?? f.default;
      row.innerHTML = `
        <label class="settings-row__label" for="md-${f.key}">${f.label} <span class="settings-row__hint">(${f.min}–${f.max})</span>${hint ? ` <span class="settings-row__field-hint" title="${hint.replace(/"/g, '&quot;')}">ℹ</span>` : ''}</label>
        <div class="settings-row__input-wrap">
          <input type="number" id="md-${f.key}" name="${f.key}" data-key="${f.key}" 
            min="${f.min}" max="${f.max}" value="${Number(val) ?? f.default}" 
            class="js-market-data-input" />
          <span class="field-error-message" id="md-err-${f.key}" role="alert"></span>
        </div>
      `;
    }
    form.appendChild(row);
  });

  const actions = document.createElement('div');
  actions.className = 'settings-actions';
  actions.innerHTML = `<button type="submit" class="btn btn-primary js-save-market-data">שמירת הגדרות</button>`;
  form.appendChild(actions);

  form.addEventListener('submit', handleSave);
  container.appendChild(form);
}

async function handleSave(ev) {
  ev.preventDefault();
  const form = document.getElementById('marketDataSettingsForm');
  const errorEl = document.getElementById('marketDataSettingsError');
  const successEl = document.getElementById('marketDataSettingsSuccess');
  const btn = form?.querySelector('.js-save-market-data');
  if (!form || !btn) return;

  if (errorEl) errorEl.textContent = '';
  if (successEl) successEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'שמירה...';

  const payload = {};
  const inputs = form.querySelectorAll('.js-market-data-input');
  inputs.forEach((input) => {
    const key = input.dataset.key;
    const field = FIELDS.find((f) => f.key === key);
    if (!field) return;
    if (field.type === 'boolean') {
      if (
        input.checked !==
        (currentValues[key] === true || currentValues[key] === 'true')
      ) {
        payload[key] = input.checked;
      }
    } else {
      const num = Number(input.value);
      if (!Number.isNaN(num) && num !== Number(currentValues[key]))
        payload[key] = num;
    }
  });

  if (Object.keys(payload).length === 0) {
    if (errorEl) errorEl.textContent = 'לא בוצעו שינויים.';
    btn.disabled = false;
    btn.textContent = 'שמירת הגדרות';
    return;
  }

  try {
    await sharedServices.init();
    const res = await sharedServices.patch('/settings/market-data', payload);
    const data = res?.data ?? res;
    if (data && typeof data === 'object') {
      currentValues = { ...currentValues, ...data };
    }
    if (successEl) successEl.textContent = 'נשמר בהצלחה.';
    let summary = { active_tickers: 0 };
    try {
      const sumRes = await sharedServices.get('/tickers/summary', {});
      summary = sumRes?.data ?? sumRes ?? summary;
    } catch (_) {}
    const panel = document.getElementById('marketDataSettingsPanel');
    if (panel) renderHeatCard(panel, currentValues, summary);
    renderForm(
      document.getElementById('marketDataSettingsValues'),
      currentValues,
    );
    const newForm = document.getElementById('marketDataSettingsForm');
    if (newForm) newForm.addEventListener('submit', handleSave);
  } catch (e) {
    maskedLog('[System Management] PATCH market-data failed:', e);
    if (form)
      form
        .querySelectorAll('.input--error')
        .forEach((el) => el.classList.remove('input--error'));
    form.querySelectorAll('.field-error-message').forEach((el) => {
      el.textContent = '';
    });
    let msg = ERROR_MESSAGES[e.status] ?? 'שגיאה בשמירה. נסה שוב.';
    if (e.status === 422 && e.validation_errors?.length) {
      e.validation_errors.forEach((v) => {
        const input = form.querySelector(`[data-key="${v.key}"]`);
        const errEl = document.getElementById(`md-err-${v.key}`);
        if (input) {
          input.classList.add('input--error');
          if (errEl) errEl.textContent = v.error || '';
        }
      });
      msg = e.validation_errors.map((v) => `${v.key}: ${v.error}`).join('; ');
    } else if (e.status === 422 && e.detail) {
      const d =
        typeof e.detail === 'string'
          ? e.detail
          : (e.detail?.message ?? JSON.stringify(e.detail));
      msg = d;
    }
    if (errorEl) errorEl.textContent = msg;
  } finally {
    btn.disabled = false;
    btn.textContent = 'שמירת הגדרות';
  }
}

(async function initSystemManagementSettings() {
  'use strict';

  const panel = document.getElementById('marketDataSettingsPanel');
  if (!panel) return;

  const errorEl = document.createElement('div');
  errorEl.id = 'marketDataSettingsError';
  errorEl.className = 'settings-error';
  errorEl.setAttribute('aria-live', 'polite');
  panel.insertBefore(errorEl, panel.querySelector('.settings-note'));

  const successEl = document.createElement('div');
  successEl.id = 'marketDataSettingsSuccess';
  successEl.className = 'settings-success';
  successEl.setAttribute('aria-live', 'polite');
  panel.insertBefore(successEl, panel.querySelector('.settings-note'));

  await loadSettings();
})();
