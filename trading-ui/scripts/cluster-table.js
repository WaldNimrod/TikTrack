/**
 * Cluster Table Component
 * =======================
 * Component for rendering execution tables within clusters
 * 
 * Function Index:
 * - renderExecutionsTable(cluster, selectedIds, options)
 * - renderExecutionsList(cluster, options)
 * - getActionDisplayText(execution)
 */

(function() {
  'use strict';

  const ClusterTable = {
    /**
     * Render executions table for a cluster
     * @param {Object} cluster - Cluster data
     * @param {Set} selectedIds - Set of selected execution IDs
     * @param {Object} options - Rendering options
     * @returns {string} HTML string
     */
    renderExecutionsTable(cluster, selectedIds, options = {}) {
      const FieldRenderer = window.FieldRendererService;
      const { onSelectionChange } = options;

      // Sort executions by date (oldest first)
      const sortedExecutions = [...(cluster.executions || [])].sort((a, b) => {
        const dateA = this._getExecutionDateValue(a.date);
        const dateB = this._getExecutionDateValue(b.date);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA - dateB;
      });

      const rows = sortedExecutions.map(execution => {
        const executionId = execution.id;
        const isChecked = selectedIds.has(executionId);
        const price = typeof FieldRenderer?.renderAmount === 'function'
          ? FieldRenderer.renderAmount(execution.price, '$', 2, false)
          : `$${(execution.price || 0).toFixed?.(2) ?? execution.price}`;

        const quantity = typeof FieldRenderer?.renderShares === 'function'
          ? FieldRenderer.renderShares(execution.quantity)
          : execution.quantity;

        // Use renderExecutionDate for consistent date formatting (same as main executions table)
        const executionDate = FieldRenderer?.renderExecutionDate?.(execution.date)
          || window.renderExecutionDate?.(execution.date)
          || FieldRenderer?.renderDate?.(execution.date, true)
          || window.renderDate?.(execution.date, true)
          || execution.date?.display
          || execution.date?.local
          || execution.date?.utc
          || execution.date
          || '-';

        const valueDisplay = execution.value ? `$${execution.value.toFixed(2)}` : '-';
        const feeDisplay = execution.fee ? `$${Number(execution.fee).toFixed(2)}` : '$0.00';

        // Render created_at date using FieldRendererService
        const createdDate = FieldRenderer?.renderDate?.(execution.created_at, false)
          || window.renderDate?.(execution.created_at, false)
          || execution.created_at?.display
          || execution.created_at?.local
          || execution.created_at?.utc
          || execution.created_at
          || '-';

        return `
          <tr data-execution-id="${executionId}">
            <td class="text-center">
              <input 
                type="checkbox" 
                class="form-check-input" 
                data-role="execution-select" 
                data-cluster-id="${cluster.cluster_id}" 
                data-execution-id="${executionId}" 
                ${isChecked ? 'checked' : ''}>
            </td>
            <td>${executionDate}</td>
            <td>${createdDate}</td>
            <td>${this.getActionDisplayText(execution)}</td>
            <td>${quantity ?? '-'}</td>
            <td>${price ?? '-'}</td>
            <td>${valueDisplay}</td>
            <td>${feeDisplay}</td>
            <td>${execution.source || '-'}</td>
            <td class="text-muted small">${execution.notes ? execution.notes.substring(0, 80) : ''}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th class="text-center" style="width: 48px;"></th>
                <th>תאריך</th>
                <th>תאריך יצירה</th>
                <th>פעולה</th>
                <th>כמות</th>
                <th>מחיר</th>
                <th>שווי</th>
                <th>עמלה</th>
                <th>מקור</th>
                <th>הערות</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    },

    /**
     * Render executions list for dashboard widget
     * @param {Object} cluster - Cluster data
     * @param {Object} options - Rendering options
     * @returns {string} HTML string
     */
    renderExecutionsList(cluster, options = {}) {
      const FieldRenderer = window.FieldRendererService;
      
      // Sort executions by date (oldest first)
      const sortedExecutions = [...(cluster.executions || [])].sort((a, b) => {
        const dateA = this._getExecutionDateValue(a.date);
        const dateB = this._getExecutionDateValue(b.date);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA - dateB;
      });
      
      return sortedExecutions.map(execution => {
        // Use renderExecutionDate for consistent date formatting (same as main executions table)
        const date = FieldRenderer?.renderExecutionDate?.(execution.date)
          || window.renderExecutionDate?.(execution.date)
          || FieldRenderer?.renderDate?.(execution.date, true)
          || window.renderDate?.(execution.date, true)
          || execution.date?.display
          || execution.date?.local
          || execution.date?.utc
          || execution.date
          || '-';
        const value = execution.value ? `$${execution.value.toFixed(2)}` : '-';
        return `
          <div class="trade-create-widget-execution d-flex justify-content-between">
            <span class="text-muted">${date} • ${this.getActionDisplayText(execution)} • ${execution.quantity}</span>
            <span class="text-muted">${value}</span>
          </div>
        `;
      }).join('');
    },

    /**
     * Get display text for execution action
     * @param {Object} execution - Execution object
     * @returns {string} Display text
     */
    getActionDisplayText(execution) {
      const action = execution.normalized_action || execution.action || 'buy';
      // Use Translation Utilities if available
      if (window.translateExecutionAction && typeof window.translateExecutionAction === 'function') {
        return window.translateExecutionAction(action.toLowerCase());
      }
      
      // Fallback to local implementation
      const actionMap = {
        'buy': 'קניה',
        'sell': 'מכירה',
        'short': 'מכירה בחסר',
        'cover': 'כיסוי'
      };
      return actionMap[action.toLowerCase()] || 'קניה';
    },

    /**
     * Get numeric date value for sorting
     * @param {string|Date|Object} date - Date value
     * @returns {number} Timestamp for sorting
     */
    _getExecutionDateValue(date) {
      if (!date) return null;
      if (typeof date === 'object' && date.epochMs) {
        return date.epochMs;
      }
      if (typeof date === 'object' && (date.utc || date.local)) {
        return new Date(date.utc || date.local).getTime();
      }
      if (typeof date === 'string' || date instanceof Date) {
        return new Date(date).getTime();
      }
      return null;
    }
  };

  // Export to global scope
  window.ClusterTable = ClusterTable;
})();

