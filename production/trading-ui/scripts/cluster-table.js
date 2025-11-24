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

      const rows = (cluster.executions || []).map(execution => {
        const executionId = execution.id;
        const isChecked = selectedIds.has(executionId);
        const price = typeof FieldRenderer?.renderAmount === 'function'
          ? FieldRenderer.renderAmount(execution.price, '$', 2, false)
          : `$${(execution.price || 0).toFixed?.(2) ?? execution.price}`;

        const quantity = typeof FieldRenderer?.renderShares === 'function'
          ? FieldRenderer.renderShares(execution.quantity)
          : execution.quantity;

        const executionDate = FieldRenderer?.renderDateShort?.(execution.date)
          || FieldRenderer?.renderDate?.(execution.date, false)
          || execution.date?.display
          || execution.date?.local
          || execution.date?.utc
          || execution.date
          || '-';

        const valueDisplay = execution.value ? `$${execution.value.toFixed(2)}` : '-';
        const feeDisplay = execution.fee ? `$${Number(execution.fee).toFixed(2)}` : '$0.00';

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
      return (cluster.executions || []).map(execution => {
        const date = FieldRenderer?.renderDateShort?.(execution.date)
          || FieldRenderer?.renderDate?.(execution.date, false)
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
      const actionMap = {
        'buy': 'קניה',
        'sell': 'מכירה',
        'short': 'מכירה בחסר',
        'cover': 'כיסוי'
      };
      return actionMap[action.toLowerCase()] || 'קניה';
    }
  };

  // Export to global scope
  window.ClusterTable = ClusterTable;
})();

