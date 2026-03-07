/**
 * Notification Bell — G7 Phase D
 * --------------------------------------------------------
 * Polls GET /notifications every 60s, renders dropdown with list.
 * Mark read (PATCH), mark all read button.
 * Loaded via headerLoader after unified-header is injected.
 */

(function () {
  'use strict';

  const POLL_INTERVAL_MS = 60000;
  let pollTimer = null;
  let dropdownEl = null;

  /**
   * GATE_4 R2: Do NOT call notifications API when guest (no token).
   * Prevents 401 SEVERE errors — API correctly returns 401 for unauthenticated requests.
   */
  function hasAuthToken() {
    const t = localStorage.getItem('access_token') || localStorage.getItem('authToken') ||
      sessionStorage.getItem('access_token') || sessionStorage.getItem('authToken');
    return !!(t && t.trim());
  }

  async function fetchNotifications() {
    if (!hasAuthToken()) {
      return { items: [], count: 0 };
    }
    try {
      const { default: sharedServices } = await import('./sharedServices.js');
      await sharedServices.init();
      const res = await sharedServices.get('/notifications', { is_read: false, limit: 20 });
      const items = res?.items ?? res?.data ?? [];
      const count = res?.count ?? items.length;
      return { items: Array.isArray(items) ? items : [], count };
    } catch (e) {
      return { items: [], count: 0 };
    }
  }

  async function markRead(notificationId) {
    try {
      const { default: sharedServices } = await import('./sharedServices.js');
      await sharedServices.init();
      await sharedServices.patch(`/notifications/${notificationId}/read`);
    } catch (e) {}
  }

  async function markAllRead() {
    try {
      const { default: sharedServices } = await import('./sharedServices.js');
      await sharedServices.init();
      await sharedServices.patch('/notifications/read-all');
      if (dropdownEl) dropdownEl.innerHTML = '<div class="notification-bell-empty">אין התראות חדשות</div>';
      updateBadge(0);
    } catch (e) {}
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  function updateBadge(count) {
    const btn = document.getElementById('notificationBellBtn');
    if (btn) {
      btn.dataset.unreadCount = String(count);
      btn.setAttribute('aria-label', count > 0 ? `התראות (${count} לא נקראו)` : 'התראות');
    }
  }

  function renderDropdown(items, unreadCount) {
    if (!dropdownEl) return;
    if (!items.length) {
      dropdownEl.innerHTML = '<div class="notification-bell-empty">אין התראות חדשות</div>';
      return;
    }
    const listHtml = items.map((n) => {
      const id = n.id ?? n.external_ulid ?? '';
      const title = (n.title ?? n.message ?? '').trim() || 'התראה';
      const createdAt = formatDate(n.created_at ?? n.createdAt);
      return `
        <div class="notification-bell-item" data-notification-id="${id}">
          <div class="notification-bell-item__title">${String(title).replace(/</g, '&lt;')}</div>
          <div class="notification-bell-item__date">${createdAt}</div>
        </div>
      `;
    }).join('');
    const markAllHtml = unreadCount > 1 ? `
      <button type="button" class="notification-bell-mark-all js-notification-mark-all">סמן הכל כנקרא</button>
    ` : '';
    dropdownEl.innerHTML = `
      <div class="notification-bell-list">${listHtml}</div>
      ${markAllHtml}
    `;
    dropdownEl.querySelectorAll('.notification-bell-item').forEach((el) => {
      el.addEventListener('click', async () => {
        const nid = el.dataset.notificationId;
        if (nid) {
          await markRead(nid);
          el.remove();
          const remaining = dropdownEl.querySelectorAll('.notification-bell-item').length;
          updateBadge(remaining);
        }
      });
    });
    const markAllBtn = dropdownEl.querySelector('.js-notification-mark-all');
    if (markAllBtn) markAllBtn.addEventListener('click', markAllRead);
  }

  async function refresh() {
    const { items, count } = await fetchNotifications();
    updateBadge(count);
    renderDropdown(items, count);
  }

  function showDropdown() {
    if (!dropdownEl) {
      dropdownEl = document.createElement('div');
      dropdownEl.className = 'notification-bell-dropdown';
      dropdownEl.setAttribute('role', 'menu');
      const btn = document.getElementById('notificationBellBtn');
      const wrapper = btn?.closest('.notification-bell-wrapper');
      if (wrapper) {
        wrapper.appendChild(dropdownEl);
      } else if (btn) {
        btn.parentNode.insertBefore(dropdownEl, btn.nextSibling);
      }
    }
    dropdownEl.classList.toggle('notification-bell-dropdown--open', true);
    refresh();
  }

  function hideDropdown() {
    if (dropdownEl) dropdownEl.classList.remove('notification-bell-dropdown--open');
  }

  function init() {
    const btn = document.getElementById('notificationBellBtn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownEl?.classList.contains('notification-bell-dropdown--open');
      if (isOpen) hideDropdown();
      else showDropdown();
    });
    document.addEventListener('click', () => hideDropdown());
    refresh();
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(refresh, POLL_INTERVAL_MS);
  }

  function initWhenReady() {
    if (document.getElementById('notificationBellBtn')) {
      init();
    } else {
      setTimeout(initWhenReady, 200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initWhenReady, 500));
  } else {
    setTimeout(initWhenReady, 500);
  }
})();
