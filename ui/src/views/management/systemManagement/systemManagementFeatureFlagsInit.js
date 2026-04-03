/**
 * D40 Feature Flags — GET/PATCH /api/v1/admin/feature-flags
 * S003-P003-WP001 LLD400 §4.2
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

async function loadFeatureFlags() {
  try {
    await sharedServices.init();
    const res = await sharedServices.get('/admin/feature-flags', {});
    const items = res?.items ?? res?.data?.items ?? [];
    return items;
  } catch (e) {
    if (e?.status === 403) {
      maskedLog('[System Management] Feature flags — 403 (non-admin)', {});
      return [];
    }
    maskedLog('[System Management] Feature flags load failed:', {
      status: e?.status,
    });
    throw e;
  }
}

async function patchFeatureFlag(key, payload) {
  await sharedServices.init();
  return sharedServices.patch(`/admin/feature-flags/${key}`, payload);
}

function renderFlags(container, items) {
  if (!items || items.length === 0) {
    container.innerHTML =
      '<p class="settings-note">אין דגלי תכונות או אין הרשאה.</p>';
    return;
  }
  container.innerHTML = items
    .map(
      (f) => `
    <div class="form-group" data-feature-key="${f.key}">
      <label>
        <input type="checkbox" class="js-feature-flag" data-key="${f.key}" ${f.value_bool ? 'checked' : ''} />
        ${f.key}${f.description ? ` — ${f.description}` : ''}
      </label>
    </div>
  `,
    )
    .join('');

  container.querySelectorAll('.js-feature-flag').forEach((cb) => {
    cb.addEventListener('change', async () => {
      const key = cb.dataset.key;
      const value = cb.checked;
      try {
        await patchFeatureFlag(key, { value_bool: value });
        maskedLog('[System Management] Feature flag updated', { key, value });
      } catch (e) {
        maskedLog('[System Management] Feature flag patch failed:', {
          key,
          status: e?.status,
        });
        cb.checked = !value;
      }
    });
  });
}

(async function initFeatureFlags() {
  const container = document.getElementById('featureFlagsPanel');
  if (!container) return;

  try {
    const items = await loadFeatureFlags();
    renderFlags(container, items);
  } catch (e) {
    container.innerHTML =
      '<p class="settings-error">לא ניתן לטעון דגלי תכונות.</p>';
  }
})();
