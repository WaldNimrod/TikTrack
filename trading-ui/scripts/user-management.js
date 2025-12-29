/**
 * User Management Page - TikTrack
 * עמוד ניהול משתמשים
 *
 * Dependencies:
 * - auth.js (TikTrackAuth)
 * - notification-system.js (NotificationSystem)
 * - logger-service.js (Logger)
 * - unified-table-system.js (UnifiedTableSystem)
 * - modal-manager-v2.js (ModalManagerV2)
 * - crud-response-handler.js (CrudResponseHandler)
 *
 * File: trading-ui/scripts/user-management.js
 * Version: 1.0.0
 * Last Updated: December 28, 2025
 */

(function() {
  'use strict';

  /**
   * User Management Page Manager
   * מנהל עמוד ניהול משתמשים
   */
  const UserManagementPage = {
    version: '1.0.0',
    initialized: false,
    users: [],
    currentSort: { field: 'username', direction: 'asc' },

    /**
     * Initialize the user management page
     * אתחול עמוד ניהול משתמשים
     */
    async init() {
      if (this.initialized) {
        window.Logger?.warn('UserManagementPage already initialized', { page: 'user-management' });
        return;
      }

      try {
        window.Logger?.info('🚀 Initializing User Management Page...', { page: 'user-management' });

        // Wait for required systems to load
        await this.waitForSystems();

        // Load users data
        await this.loadUsersData();

        // Setup table
        this.setupUsersTable();

        // Setup modal handlers
        this.setupModalHandlers();

        // Replace icons with IconSystem
        if (typeof window.replaceIconsInContext === 'function') {
          try {
            await window.replaceIconsInContext(document);
            window.Logger?.debug('✅ Icons replaced with IconSystem', { page: 'user-management' });
          } catch (iconError) {
            window.Logger?.warn('Failed to replace icons', { error: iconError, page: 'user-management' });
          }
        }

        this.initialized = true;
        window.Logger?.info('✅ User Management Page initialized successfully', { page: 'user-management' });
      } catch (error) {
        window.Logger?.error('❌ Error initializing User Management Page', error, { page: 'user-management' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה באתחול עמוד ניהול משתמשים', 'system');
        }
      }
    },

    /**
     * Wait for required systems to load
     * המתנה לטעינת מערכות נדרשות
     */
    async waitForSystems() {
      const requiredSystems = [
        'TikTrackAuth',
        'NotificationSystem',
        'Logger',
        'UnifiedTableSystem',
        'ModalManagerV2',
        'CrudResponseHandler'
      ];

      for (const system of requiredSystems) {
        if (!window[system]) {
          window.Logger?.info(`Waiting for ${system} to load...`, { page: 'user-management' });
          let attempts = 0;
          while (!window[system] && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
          }
          if (!window[system]) {
            throw new Error(`Required system ${system} failed to load`);
          }
        }
      }
    },

    /**
     * Load users data and statistics
     * טעינת נתוני משתמשים וסטטיסטיקות
     */
    async loadUsersData() {
      try {
        window.Logger?.info('Loading users data...', { page: 'user-management' });

        // Load users from API (using window.fetch for auth token injection)
        const usersResponse = await window.fetch('/api/users/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!usersResponse.ok) {
          window.Logger?.error('Users API call failed', {
            page: 'user-management',
            status: usersResponse.status,
            statusText: usersResponse.statusText,
            url: usersResponse.url
          });

          // If unauthorized, redirect to login
          if (usersResponse.status === 401 || usersResponse.status === 403) {
            window.Logger?.warn('API authentication failed, redirecting to login', {
              page: 'user-management',
              status: usersResponse.status
            });
            window.location.href = '/login.html';
            return;
          }
          throw new Error(`HTTP error! status: ${usersResponse.status}`);
        }

        const usersData = await usersResponse.json();

        // Check if response has data array
        if (usersData && Array.isArray(usersData.data)) {
          this.users = usersData.data;
        } else if (Array.isArray(usersData)) {
          // Fallback: if response is directly an array
          this.users = usersData;
        } else {
          this.users = [];
        }

        // Update statistics
        this.updateStatistics();

        // Update table
        this.updateUsersTable();

        window.Logger?.info(`✅ Loaded ${this.users.length} users`, { page: 'user-management' });
      } catch (error) {
        window.Logger?.error('❌ Error loading users data', error, { page: 'user-management' });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה בטעינת נתוני משתמשים', 'api');
        }
        throw error;
      }
    },

    /**
     * Update statistics display
     * עדכון תצוגת סטטיסטיקות
     */
    updateStatistics() {
      const totalUsers = this.users.length;
      const activeUsers = this.users.filter(u => u.is_active).length;
      const inactiveUsers = totalUsers - activeUsers;
      const defaultUser = this.users.find(u => u.is_default)?.username || 'לא נמצא';

      // Update DOM elements
      const totalUsersEl = document.getElementById('totalUsers');
      const activeUsersEl = document.getElementById('activeUsers');
      const inactiveUsersEl = document.getElementById('inactiveUsers');
      const defaultUserEl = document.getElementById('defaultUser');

      if (totalUsersEl) totalUsersEl.textContent = totalUsers;
      if (activeUsersEl) activeUsersEl.textContent = activeUsers;
      if (inactiveUsersEl) inactiveUsersEl.textContent = inactiveUsers;
      if (defaultUserEl) defaultUserEl.textContent = defaultUser;
    },

    /**
     * Setup users table
     * הגדרת טבלת המשתמשים
     */
    setupUsersTable() {
      // Table is already in HTML, just ensure it's properly configured
      window.Logger?.info('Users table setup completed', { page: 'user-management' });
    },

    /**
     * Update users table with current data
     * עדכון טבלת המשתמשים עם הנתונים הנוכחיים
     */
    updateUsersTable() {
      const tbody = document.querySelector('#usersTable tbody');
      if (!tbody) return;

      if (this.users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">לא נמצאו משתמשים</td></tr>';
        return;
      }

      // Sort users
      const sortedUsers = this.sortUsers(this.users);

      tbody.innerHTML = sortedUsers.map(user => this.renderUserRow(user)).join('');
    },

    /**
     * Sort users array
     * מיון מערך המשתמשים
     */
    sortUsers(users) {
      return [...users].sort((a, b) => {
        let aVal = a[this.currentSort.field];
        let bVal = b[this.currentSort.field];

        // Handle null/undefined values
        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';

        // Handle date sorting
        if (this.currentSort.field.includes('at')) {
          aVal = new Date(aVal || 0);
          bVal = new Date(bVal || 0);
        }

        // Handle boolean sorting
        if (typeof aVal === 'boolean') {
          aVal = aVal ? 1 : 0;
          bVal = bVal ? 1 : 0;
        }

        // String comparison
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (this.currentSort.direction === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    },

    /**
     * Render user row HTML
     * יצירת HTML לשורה של משתמש
     */
    renderUserRow(user) {
      const statusBadge = user.is_active ?
        '<span class="badge bg-success">פעיל</span>' :
        '<span class="badge bg-secondary">לא פעיל</span>';

      const defaultBadge = user.is_default ?
        '<span class="badge bg-primary">ברירת מחדל</span>' : '';

      const actions = `
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary btn-sm" onclick="window.UserManagementPage.editUser(${user.id})" title="ערוך">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="window.UserManagementPage.deleteUser(${user.id})" title="מחק">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      return `
        <tr>
          <td>${this.escapeHtml(user.username)}</td>
          <td>${this.escapeHtml(user.email || '')}</td>
          <td>${this.escapeHtml(user.full_name || '')}</td>
          <td>${statusBadge}</td>
          <td>${defaultBadge}</td>
          <td>${this.formatDate(user.created_at)}</td>
          <td>${this.formatDate(user.updated_at)}</td>
          <td>${actions}</td>
        </tr>
      `;
    },

    /**
     * Sort table by field
     * מיון הטבלה לפי שדה
     */
    sortTable(field) {
      if (this.currentSort.field === field) {
        this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSort.field = field;
        this.currentSort.direction = 'asc';
      }

      this.updateUsersTable();
      window.Logger?.info(`Table sorted by ${field} ${this.currentSort.direction}`, { page: 'user-management' });
    },

    /**
     * Setup modal handlers
     * הגדרת מטפלי מודלים
     */
    setupModalHandlers() {
      // Add user modal will be handled by ModalManagerV2
      window.Logger?.info('Modal handlers setup completed', { page: 'user-management' });
    },

    /**
     * Show add user modal
     * הצגת מודל הוספת משתמש
     */
    showAddUserModal() {
      if (window.ModalManagerV2) {
        window.ModalManagerV2.showModal('usersModal', 'add');
      }
    },

    /**
     * Edit user
     * עריכת משתמש
     */
    editUser(userId) {
      if (window.ModalManagerV2) {
        window.ModalManagerV2.showModal('usersModal', 'edit', { userId });
      }
    },

    /**
     * Delete user
     * מחיקת משתמש
     */
    async deleteUser(userId) {
      if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Reload users data
          await this.loadUsersData();
          if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('משתמש נמחק בהצלחה');
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        window.Logger?.error('❌ Error deleting user', error, { page: 'user-management', userId });
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה במחיקת משתמש', 'api');
        }
      }
    },

    /**
     * Format date for display
     * עיצוב תאריך לתצוגה
     */
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
      } catch (error) {
        return dateString;
      }
    },

    /**
     * Escape HTML for security
     * בריחה מ-HTML לבטיחות
     */
    escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Export to global scope
  window.UserManagementPage = UserManagementPage;

  window.Logger?.info('✅ UserManagementPage loaded successfully', { page: 'user-management' });
})();
