/**
 * D41 User Management — GET /admin/users, PATCH status/role
 * S003-P003-WP001 LLD400 §4.3
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

const ROWS_OPTIONS = [10, 25, 50, 100];
const rowsPerPage =
  (window.TT?.preferences?.rows_per_page &&
    ROWS_OPTIONS.includes(Number(window.TT.preferences.rows_per_page))) ||
  25;

async function loadUsers(params = {}) {
  await sharedServices.init();
  const q = new URLSearchParams();
  if (params.page) q.set('page', params.page);
  if (params.rows_per_page) q.set('rows_per_page', params.rows_per_page);
  if (params.search) q.set('search', params.search);
  if (params.role) q.set('role', params.role);
  if (params.is_active !== undefined && params.is_active !== '')
    q.set('is_active', params.is_active);
  const qs = q.toString();
  const url = qs ? `/admin/users?${qs}` : '/admin/users';
  const res = await sharedServices.get(url, {});
  return res?.data ?? res;
}

async function patchUserStatus(userId, isActive) {
  await sharedServices.init();
  return sharedServices.patch(`/admin/users/${userId}/status`, {
    is_active: isActive,
  });
}

async function patchUserRole(userId, role) {
  await sharedServices.init();
  return sharedServices.patch(`/admin/users/${userId}/role`, { role });
}

function renderTable(container, data, currentUserId, filterState = {}) {
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const pages = data?.pages ?? 1;
  const search = filterState.search ?? '';
  const role = filterState.role ?? '';
  const isActiveFilter = filterState.is_active ?? '';

  container.innerHTML = `
    <div class="form-group" data-testid="d41-users-search-wrap">
      <label for="d41-users-search">חיפוש</label>
      <input type="text" id="d41-users-search" class="form-control" data-testid="d41-users-search" placeholder="אימייל, שם..." value="${search.replace(/"/g, '&quot;')}" />
    </div>
    <div class="form-group">
      <label for="d41-users-filter-role">תפקיד</label>
      <select id="d41-users-filter-role" class="form-control" data-testid="d41-users-filter-role">
        <option value="" ${role === '' ? 'selected' : ''}>הכל</option>
        <option value="USER" ${role === 'USER' ? 'selected' : ''}>USER</option>
        <option value="ADMIN" ${role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
        <option value="SUPERADMIN" ${role === 'SUPERADMIN' ? 'selected' : ''}>SUPERADMIN</option>
      </select>
    </div>
    <div class="form-group">
      <label for="d41-users-filter-status">סטטוס</label>
      <select id="d41-users-filter-status" class="form-control" data-testid="d41-users-filter-status">
        <option value="" ${isActiveFilter === '' ? 'selected' : ''}>הכל</option>
        <option value="true" ${isActiveFilter === 'true' ? 'selected' : ''}>פעיל</option>
        <option value="false" ${isActiveFilter === 'false' ? 'selected' : ''}>לא פעיל</option>
      </select>
    </div>
    <table class="phoenix-table" data-testid="d41-users-table">
      <thead>
        <tr>
          <th>אימייל</th>
          <th>שם</th>
          <th>תפקיד</th>
          <th>סטטוס</th>
          <th>פעולות</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((u) => {
            const isSelf = u.id === currentUserId;
            const isSuperadmin = u.role === 'SUPERADMIN';
            let actions = '';
            if (isSuperadmin) {
              actions = '<span class="settings-note">SUPERADMIN</span>';
            } else if (!isSelf) {
              const promote =
                u.role === 'USER'
                  ? `<button type="button" class="btn btn-sm d41-user-action-promote" data-id="${u.id}" data-role="ADMIN">העלאה ל-ADMIN</button>`
                  : '';
              const demote =
                u.role === 'ADMIN'
                  ? `<button type="button" class="btn btn-sm d41-user-action-demote" data-id="${u.id}" data-role="USER">הורדה ל-USER</button>`
                  : '';
              const deactivate = u.is_active
                ? `<button type="button" class="btn btn-sm d41-user-action-deactivate" data-id="${u.id}">השבתה</button>`
                : '';
              actions = [promote, demote, deactivate].filter(Boolean).join(' ');
            }
            return `
                <tr data-user-id="${u.id}" data-testid="d41-user-row-${u.id}" class="${isSuperadmin ? 'd41-superadmin-row' : ''}">
                  <td>${u.email || '-'}</td>
                  <td>${u.display_name || '-'}</td>
                  <td>${u.role}</td>
                  <td>${u.is_active ? 'פעיל' : 'לא פעיל'}</td>
                  <td>${actions}</td>
                </tr>
              `;
          })
          .join('')}
      </tbody>
    </table>
    <div class="pagination" data-testid="d41-users-pagination">
      <span>עמוד ${page} מתוך ${pages} (${total} משתמשים)</span>
      ${page > 1 ? `<button type="button" class="btn btn-sm js-prev-page">הקודם</button>` : ''}
      ${page < pages ? `<button type="button" class="btn btn-sm js-next-page">הבא</button>` : ''}
    </div>
  `;

  const prevBtn = container.querySelector('.js-prev-page');
  const nextBtn = container.querySelector('.js-next-page');
  const searchInput = container.querySelector('#d41-users-search');
  const roleFilter = container.querySelector('#d41-users-filter-role');
  const statusFilter = container.querySelector('#d41-users-filter-status');

  const reload = (opts = {}) => {
    const p = {
      page: opts.page ?? page,
      rows_per_page: opts.rows_per_page ?? rowsPerPage,
      search:
        opts.search !== undefined ? opts.search : searchInput?.value || '',
      role: opts.role !== undefined ? opts.role : roleFilter?.value || '',
      is_active:
        opts.is_active !== undefined
          ? opts.is_active
          : statusFilter?.value === ''
            ? undefined
            : statusFilter?.value,
    };
    initUsers(p);
  };

  if (prevBtn)
    prevBtn.addEventListener('click', () => reload({ page: page - 1 }));
  if (nextBtn)
    nextBtn.addEventListener('click', () => reload({ page: page + 1 }));
  if (searchInput)
    searchInput.addEventListener('change', () => reload({ page: 1 }));
  if (roleFilter)
    roleFilter.addEventListener('change', () => reload({ page: 1 }));
  if (statusFilter)
    statusFilter.addEventListener('change', () => reload({ page: 1 }));

  container.querySelectorAll('.d41-user-action-promote').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      try {
        await patchUserRole(id, 'ADMIN');
        reload();
      } catch (e) {
        maskedLog('[User Management] Promote failed:', {
          id,
          status: e?.status,
        });
      }
    });
  });
  container.querySelectorAll('.d41-user-action-demote').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      try {
        await patchUserRole(id, 'USER');
        reload();
      } catch (e) {
        maskedLog('[User Management] Demote failed:', {
          id,
          status: e?.status,
        });
      }
    });
  });
  container.querySelectorAll('.d41-user-action-deactivate').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      try {
        await patchUserStatus(id, false);
        reload();
      } catch (e) {
        maskedLog('[User Management] Deactivate failed:', {
          id,
          status: e?.status,
        });
      }
    });
  });
}

let currentUserId = null;

async function initUsers(params = {}) {
  const container = document.getElementById('d41UsersListContainer');
  if (!container) return;

  try {
    const data = await loadUsers({
      page: params.page ?? 1,
      rows_per_page: params.rows_per_page ?? rowsPerPage,
      search: params.search || '',
      role: params.role || '',
      is_active: params.is_active,
    });
    if (!currentUserId) {
      try {
        const me = await sharedServices.get('/users/me', {});
        const meData = me?.data ?? me;
        currentUserId = meData?.id ?? null;
      } catch (_) {}
    }
    renderTable(container, data, currentUserId, {
      search: params.search || '',
      role: params.role || '',
      is_active: params.is_active,
    });
  } catch (e) {
    if (e?.status === 403) {
      container.innerHTML =
        '<p class="settings-error">אין הרשאה — נדרש תפקיד Admin.</p>';
    } else {
      maskedLog('[User Management] Load failed:', { status: e?.status });
      container.innerHTML =
        '<p class="settings-error">לא ניתן לטעון רשימת משתמשים.</p>';
    }
  }
}

(async function initUserManagementPage() {
  const container = document.getElementById('d41UsersListContainer');
  if (!container) return;
  container.innerHTML = '<p class="settings-note">טוען...</p>';
  await initUsers({});
})();
