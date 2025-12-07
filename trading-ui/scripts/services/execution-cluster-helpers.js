/**
 * Execution Cluster Helpers
 * ======================================
 * Shared helper functions for managing execution clusters.
 * Used by both executions page and unified widget.
 *
 * Responsibilities:
 * - Rendering cluster cards for executions page (detailed view)
 * - Rendering cluster items for widget (simple view)
 * - Computing selection summaries
 * - Opening trade modal from cluster
 * - Handling trade created from cluster
 * - Batch assigning executions to trade
 *
 * Related Documentation:
 * - documentation/03-DEVELOPMENT/GUIDES/REFACTORING_PLAN_UNIFIED_WIDGET.md
 *
 * Function Index:
 * ==============
 *
 * RENDERING:
 * - renderClusterCard(cluster, selectedIds, options) - Render detailed card for executions page
 * - renderClusterListItem(cluster, selectedIds, options) - Render simple item for widget
 * - renderTickerBadge(cluster) - Render ticker badge
 * - renderAccountBadge(cluster) - Render account badge
 * - renderSummaryBadge(label, value) - Render summary badge
 * - renderDateRange(range) - Render date range
 *
 * CALCULATIONS:
 * - computeSelectionSummary(cluster, selectedIds) - Compute summary for selected executions
 * - getExecutionDateValue(date) - Get numeric date value for sorting
 *
 * ACTIONS:
 * - openTradeModalFromCluster(clusterId, cluster, selectedIds) - Open trade modal with prefill
 * - handleTradeCreated(result, clusterId, executionIds) - Handle trade created and assign executions
 * - buildTradePrefill(cluster, summary) - Build prefill data for trade modal
 *
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */
(function executionClusterHelpers() {
  'use strict';

  const PAGE_LOG_CONTEXT = { page: 'execution-cluster-helpers' };

  /**
   * Get numeric date value for sorting
   * @param {string|Date|Object} date - Date value
   * @returns {number|null} Timestamp for sorting
   */
  function getExecutionDateValue(date) {
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

  /**
   * Compute selection summary for cluster
   * @param {Object} cluster - Cluster data
   * @param {Set<number>} selectedIds - Set of selected execution IDs
   * @returns {Object} Summary object
   */
  function computeSelectionSummary(cluster, selectedIds) {
    const executions = cluster.executions || [];
    let totalQuantity = 0;
    let totalValue = 0;
    let totalFee = 0;
    let selectedCount = 0;

    executions.forEach(execution => {
      if (!selectedIds.size || selectedIds.has(execution.id)) {
        selectedCount += 1;
        const quantity = Number(execution.quantity) || 0;
        const value = Number(execution.value) || (quantity * (Number(execution.price) || 0));
        const fee = Number(execution.fee) || 0;
        totalQuantity += quantity;
        totalValue += value;
        totalFee += fee;
      }
    });

    const averagePrice = totalQuantity ? totalValue / totalQuantity : null;

    return {
      totalQuantity,
      totalValue,
      totalFee,
      averagePrice,
      selectedCount
    };
  }

  /**
   * Render ticker badge
   * @param {Object} cluster - Cluster data
   * @returns {string} HTML string
   */
  function renderTickerBadge(cluster) {
    const FieldRenderer = window.FieldRendererService;
    if (FieldRenderer?.renderLinkedEntity) {
      return FieldRenderer.renderLinkedEntity('ticker', cluster.ticker?.id, cluster.ticker?.symbol || 'לא מוגדר', { short: true }) || '';
    }
    return `<span class="badge bg-body-secondary text-body">${cluster.ticker?.symbol || 'לא מוגדר'}</span>`;
  }

  /**
   * Render account badge
   * @param {Object} cluster - Cluster data
   * @returns {string} HTML string
   */
  function renderAccountBadge(cluster) {
    const FieldRenderer = window.FieldRendererService;
    if (cluster.trading_account?.id) {
      if (FieldRenderer?.renderLinkedEntity) {
        return FieldRenderer.renderLinkedEntity('trading_account', cluster.trading_account.id, cluster.trading_account.name || 'לא מוגדר', { short: true }) || '';
      }
      return `<span class="badge bg-body-secondary text-body">${cluster.trading_account.name || 'חשבון לא ידוע'}</span>`;
    }
    return `<span class="badge bg-body-secondary text-body">ללא חשבון</span>`;
  }

  /**
   * Render summary badge
   * @param {string} label - Badge label
   * @param {string|number} value - Badge value
   * @returns {string} HTML string
   */
  function renderSummaryBadge(label, value) {
    return `<span class="badge bg-light text-body trade-create-summary-badge"><span class="text-muted">${label}:</span> ${value}</span>`;
  }

  /**
   * Render date range
   * @param {Object} range - Date range object with start and end
   * @returns {string} Formatted date range string
   */
  function renderDateRange(range) {
    const FieldRenderer = window.FieldRendererService;
    const start = FieldRenderer?.renderDateShort?.(range.start) || range.start?.display || range.start?.local || range.start?.utc || '';
    const end = FieldRenderer?.renderDateShort?.(range.end) || range.end?.display || range.end?.local || range.end?.utc || '';
    if (start && end && start !== end) {
      return `${start} - ${end}`;
    }
    return start || end || '';
  }

  /**
   * Build trade prefill data from cluster
   * @param {Object} cluster - Cluster data
   * @param {Object} summary - Selection summary
   * @returns {Object} Prefill data object
   */
  function buildTradePrefill(cluster, summary) {
    const earliestDate = cluster.stats?.date_range?.start;
    return {
      ticker_id: cluster.ticker?.id,
      trading_account_id: cluster.trading_account?.id,
      side: cluster.side === 'short' ? 'Short' : 'Long',
      investment_type: cluster.suggested_trade?.investment_type || 'swing',
      created_at: earliestDate,
      entry_price: summary.averagePrice || cluster.suggested_trade?.entry_price || null,
      quantity: summary.totalQuantity || cluster.suggested_trade?.quantity || null,
      notes: cluster.suggested_trade?.notes || null
    };
  }

  /**
   * Format date for input field
   * @param {Object} envelope - Date envelope
   * @returns {string} Formatted date string
   */
  function formatDateForInput(envelope) {
    if (!envelope) {
      return '';
    }
    const iso = envelope.utc || envelope.local || envelope.display || envelope;
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) {
        return '';
      }
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16);
    } catch (error) {
      return '';
    }
  }

  /**
   * Open trade modal from cluster with prefill
   * @param {string} clusterId - Cluster ID
   * @param {Object} cluster - Cluster data
   * @param {Set<number>} selectedIds - Selected execution IDs
   * @param {Object} context - Context object to store active context (optional)
   * @returns {Promise<void>}
   */
  async function openTradeModalFromCluster(clusterId, cluster, selectedIds, context = null) {
    if (!cluster) {
      window.Logger?.warn?.('⚠️ Cluster not found', { clusterId, ...PAGE_LOG_CONTEXT });
      return;
    }

    if (!selectedIds || selectedIds.size === 0) {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('לא נבחרו ביצועים', 'בחר לפחות ביצוע אחד לפני יצירת טרייד');
      }
      return;
    }

    const selectionSummary = computeSelectionSummary(cluster, selectedIds);
    const selectedExecutions = (cluster.executions || []).filter(execution => selectedIds.has(execution.id));

    if (!selectedExecutions.length) {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('לא נבחרו ביצועים', 'בחר לפחות ביצוע אחד לפני יצירת טרייד');
      }
      return;
    }

    // Store context if provided (for handling trade created)
    if (context) {
      context.clusterId = clusterId;
      context.executionIds = Array.from(selectedIds);
      context.summary = selectionSummary;
    }

    try {
      await window.ModalManagerV2?.showModal('tradesModal', 'add');
      const modalInfo = window.ModalManagerV2?.getModalInfo('tradesModal');
      const modalElement = modalInfo?.element;

      if (!modalElement) {
        throw new Error('Modal element not available for tradesModal');
      }

      const form = modalElement.querySelector('form');
      if (form) {
        form.dataset.tradeCreationSource = 'execution-cluster';
        form.dataset.clusterId = clusterId;
        form.dataset.selectedExecutionIds = Array.from(selectedIds).join(',');
      }

      const prefill = buildTradePrefill(cluster, selectionSummary);
      await window.ModalManagerV2.populateForm(modalElement, prefill);

      // Apply additional prefill
      applyAdditionalPrefill(modalElement, prefill, selectionSummary);
    } catch (error) {
      window.Logger?.error?.('❌ Failed to open trade modal with prefill', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  /**
   * Apply additional prefill to modal
   * @param {HTMLElement} modalElement - Modal element
   * @param {Object} prefill - Prefill data
   * @param {Object} summary - Selection summary
   */
  function applyAdditionalPrefill(modalElement, prefill, summary) {
    const form = modalElement.querySelector('form');
    if (!form) {
      return;
    }

    const totalInvestmentField = form.querySelector('#tradeTotalInvestment');
    if (totalInvestmentField) {
      if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        window.DataCollectionService.setValue(totalInvestmentField.id, summary.totalValue ? summary.totalValue.toFixed(2) : '', 'number');
      } else {
        totalInvestmentField.value = summary.totalValue ? summary.totalValue.toFixed(2) : '';
      }
    }

    const entryDateField = form.querySelector('#tradeEntryDate');
    if (entryDateField) {
      const entryValue = formatDateForInput(prefill.created_at);
      if (entryValue) {
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
          window.DataCollectionService.setValue(entryDateField.id, entryValue, 'date');
        } else {
          entryDateField.value = entryValue;
        }
      }
    }

    const noteText = prefill.notes;
    if (noteText && typeof window.ModalManagerV2?._setRichTextContent === 'function') {
      window.ModalManagerV2._setRichTextContent('tradeNotes', noteText);
    }

    if (window.InvestmentCalculationService?.resync) {
      window.InvestmentCalculationService.resync(modalElement, { force: true }).catch(() => {});
    }
  }

  /**
   * Render cluster card for executions page (detailed view)
   * @param {Object} cluster - Cluster data
   * @param {Set<number>} selectedIds - Set of selected execution IDs
   * @param {Object} options - Rendering options
   * @returns {HTMLElement} Card element
   */
  function renderClusterCard(cluster, selectedIds, options = {}) {
    const summary = computeSelectionSummary(cluster, selectedIds);
    const dateRange = cluster.stats?.date_range || {};
    const totalValueDisplay = summary.totalValue ? `$${summary.totalValue.toFixed(2)}` : '-';
    const averagePriceDisplay = summary.averagePrice ? `$${summary.averagePrice.toFixed(4)}` : '-';
    const dateRangeText = dateRange.start ? renderDateRange(dateRange) : '';

    const card = document.createElement('div');
    card.className = 'card trade-create-cluster-card mb-3';
    card.dataset.clusterId = cluster.cluster_id;
    card.style.position = 'relative';

    const tickerBadge = renderTickerBadge(cluster);
    const accountBadge = renderAccountBadge(cluster);
    const sideBadgeClass = cluster.side === 'long' ? 'badge-long' : 'badge-short';
    const sideBadgeText = cluster.side === 'long' ? 'לונג' : 'שורט';

    // Use ClusterTable for rendering executions table if available
    // Fallback: ClusterTable uses its own _getExecutionDateValue method internally
    let executionsTableHtml = '';
    if (window.ClusterTable?.renderExecutionsTable) {
      try {
        executionsTableHtml = window.ClusterTable.renderExecutionsTable(cluster, selectedIds, options);
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to render executions table via ClusterTable', { error: error?.message, ...PAGE_LOG_CONTEXT });
        executionsTableHtml = '<div class="text-muted small">שגיאה בטעינת טבלת ביצועים</div>';
      }
    } else {
      window.Logger?.warn?.('⚠️ ClusterTable not available for rendering executions table', PAGE_LOG_CONTEXT);
      executionsTableHtml = '<div class="text-muted small">טבלת ביצועים זמינה בקרוב</div>';
    }

    // Build card HTML and insert using tempDiv
    const cardHTML = `
      <div class="card-body">
        <div class="d-flex flex-wrap align-items-start gap-3">
          <div class="flex-grow-1">
            <div class="d-flex flex-wrap align-items-center gap-2 trade-create-cluster-header">
              ${tickerBadge}
              ${accountBadge}
              <span class="badge ${sideBadgeClass}">${sideBadgeText}</span>
              <span class="text-muted small">${cluster.stats.execution_count} ביצועים</span>
            </div>
          </div>
          <div class="trade-create-actions d-flex gap-2 align-items-center">
            <button
              data-button-type="APPROVE"
              data-variant="small"
              data-role="create-trade"
              data-cluster-id="${cluster.cluster_id}"
              data-text="פתח טרייד חדש"
              title="יצירת טרייד חדש עבור הביצועים הנבחרים">
            </button>
            <button
              data-button-type="REFRESH"
              data-variant="small"
              data-role="refresh-cluster"
              data-cluster-id="${cluster.cluster_id}"
              data-text="רענן אשכול"
              title="טעינת נתונים מחדש לאשכול">
            </button>
            <button
              data-button-type="REJECT"
              data-variant="small"
              data-role="dismiss-cluster"
              data-cluster-id="${cluster.cluster_id}"
              data-text="התעלם"
              title="הסתרת האשכול מהממשק">
            </button>
          </div>
        </div>
        <!-- Execution details - shown on hover -->
        <div class="trade-create-cluster-details" data-role="cluster-details" data-cluster-id="${cluster.cluster_id}">
          <div class="trade-create-summary mt-2 mb-3">
            ${renderSummaryBadge('כמות', summary.totalQuantity.toLocaleString('en-US'))}
            ${renderSummaryBadge('שווי', totalValueDisplay)}
            ${renderSummaryBadge('מחיר ממוצע', averagePriceDisplay)}
            ${renderSummaryBadge('עלות עמלה', `$${summary.totalFee.toFixed(2)}`)}
            ${renderSummaryBadge('נבחרו', `${summary.selectedCount}/${cluster.stats.execution_count}`)}
            ${dateRangeText ? `<span class="badge bg-body-secondary text-body trade-create-summary-badge">טווח: ${dateRangeText}</span>` : ''}
          </div>
          <div class="trade-create-executions-table">
            ${executionsTableHtml}
          </div>
        </div>
      </div>
    `;
    card.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(cardHTML, 'text/html');
    doc.body.childNodes.forEach(node => {
      card.appendChild(node.cloneNode(true));
    });

    // Hover handlers are now managed by unified-pending-actions-widget.js
    // No need to add them here - the widget handles all hover events

    // Setup button handlers
    setupClusterCardButtons(card, cluster, selectedIds, options);

    return card;
  }

  /**
   * Setup button handlers for cluster card
   * @param {HTMLElement} card - Card element
   * @param {Object} cluster - Cluster data
   * @param {Set<number>} selectedIds - Selected execution IDs
   * @param {Object} options - Options including context and callbacks
   */
  function setupClusterCardButtons(card, cluster, selectedIds, options = {}) {
    const createButton = card.querySelector('[data-role="create-trade"]');
    const refreshButton = card.querySelector('[data-role="refresh-cluster"]');
    const dismissButton = card.querySelector('[data-role="dismiss-cluster"]');

    if (createButton) {
      createButton.addEventListener('click', async () => {
        const context = options.context || {};
        await openTradeModalFromCluster(cluster.cluster_id, cluster, selectedIds, context);
      });
    }

    if (refreshButton) {
      refreshButton.addEventListener('click', async () => {
        if (options.onRefresh) {
          await options.onRefresh(cluster.cluster_id);
        } else if (window.ExecutionClusteringService?.invalidateCache) {
          await window.ExecutionClusteringService.invalidateCache();
          if (options.onReload) {
            await options.onReload();
          }
        }
      });
    }

    if (dismissButton) {
      dismissButton.addEventListener('click', async () => {
        const clusterId = cluster.cluster_id;
        if (window.ExecutionClusteringService?.dismissCluster) {
          await window.ExecutionClusteringService.dismissCluster(clusterId);
          if (options.onDismiss) {
            await options.onDismiss(clusterId);
          }
        }
      });
    }
  }

  /**
   * Render cluster list item for widget (simple view)
   * @param {Object} cluster - Cluster data
   * @param {Set<number>} selectedIds - Set of selected execution IDs
   * @param {Object} options - Rendering options
   * @returns {string} HTML string for list item
   */
  function renderClusterListItem(cluster, selectedIds, options = {}) {
    const summary = computeSelectionSummary(cluster, selectedIds);
    const dateRange = cluster.stats?.date_range || {};
    const totalValueDisplay = summary.totalValue ? `$${summary.totalValue.toFixed(2)}` : '-';
    const averagePriceDisplay = summary.averagePrice ? `$${summary.averagePrice.toFixed(4)}` : '-';
    const dateRangeText = dateRange.start ? renderDateRange(dateRange) : '';

    const tickerBadge = renderTickerBadge(cluster);
    const accountBadge = renderAccountBadge(cluster);
    const sideBadgeClass = cluster.side === 'long' ? 'badge-long' : 'badge-short';
    const sideBadgeText = cluster.side === 'long' ? 'לונג' : 'שורט';

    // Use ClusterTable for rendering executions list if available
    let executionsListHtml = '';
    if (window.ClusterTable?.renderExecutionsList) {
      try {
        executionsListHtml = window.ClusterTable.renderExecutionsList(cluster, options);
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to render executions list via ClusterTable', { error: error?.message, ...PAGE_LOG_CONTEXT });
        executionsListHtml = '';
      }
    }

    return `
      <li class="list-group-item trade-create-widget-item" 
          data-cluster-id="${cluster.cluster_id}"
          data-widget-overlay="true">
        <div class="trade-create-widget-top d-flex flex-wrap align-items-center gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge ${sideBadgeClass}">${sideBadgeText}</span>
            <span class="text-muted small d-flex flex-column">
              <span>${summary.selectedCount}/${cluster.stats.execution_count} ביצועים</span>
              ${dateRangeText ? `<span>${dateRangeText}</span>` : ''}
            </span>
          </div>
          <div class="ms-auto d-flex gap-1">
            <button
              data-button-type="APPROVE"
              data-variant="small"
              data-role="create-trade"
              data-cluster-id="${cluster.cluster_id}"
              data-text="פתח טרייד"
              title="יצירת טרייד חדש עבור האשכול">
            </button>
            <button
              data-button-type="REJECT"
              data-variant="small"
              data-role="dismiss-cluster"
              data-cluster-id="${cluster.cluster_id}"
              data-text="התעלם"
              title="הסתרת האשכול מהממשק">
            </button>
          </div>
        </div>
        <div class="trade-create-entity-row d-flex align-items-center gap-2 mt-2">
          <span class="entity-icon-circle entity-icon-circle-sm d-flex align-items-center justify-content-center">
            <img src="images/icons/tickers.svg" alt="טיקר" width="12" height="12" />
          </span>
          ${tickerBadge}
          <span class="entity-icon-circle entity-icon-circle-sm d-flex align-items-center justify-content-center">
            <img src="images/icons/trading_accounts.svg" alt="חשבון" width="12" height="12" />
          </span>
          ${accountBadge}
        </div>
        <div class="trade-create-widget-details" 
             data-overlay="true" 
             data-role="widget-detail" 
             data-cluster-id="${cluster.cluster_id}">
          <div class="trade-create-widget-stats text-muted small mb-2 d-flex flex-wrap gap-2">
            <span>שווי כולל: ${totalValueDisplay}</span>
            <span>•</span>
            <span>מחיר ממוצע: ${averagePriceDisplay}</span>
            ${dateRange.start ? `<span>•</span><span>טווח: ${renderDateRange(dateRange)}</span>` : ''}
          </div>
          ${executionsListHtml}
        </div>
      </li>
    `;
  }

  /**
   * Handle trade created - assign executions to trade
   * @param {Object} result - Trade creation result
   * @param {string} clusterId - Cluster ID
   * @param {Array<number>} executionIds - Execution IDs to assign
   * @returns {Promise<void>}
   */
  async function handleTradeCreated(result, clusterId, executionIds) {
    try {
      const tradeId = result?.data?.id || result?.data?.trade?.id || null;
      if (!tradeId) {
        window.Logger?.warn?.('⚠️ Trade created but response missing ID', { result, ...PAGE_LOG_CONTEXT });
        return;
      }

      const assignments = executionIds.map(executionId => ({
        execution_id: executionId,
        trade_id: tradeId
      }));

      if (!assignments.length) {
        return;
      }

      const response = await fetch('/api/executions/batch-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignments })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Failed to assign executions to trade');
      }

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'הביצועים נקשו אוטומטית לטרייד שיצרת');
      }

      // Invalidate caches
      if (window.ExecutionClusteringService?.invalidateCache) {
        await window.ExecutionClusteringService.invalidateCache();
      }
      if (window.ExecutionAssignmentService?.invalidateCache) {
        await window.ExecutionAssignmentService.invalidateCache();
      }

      // Reload data
      if (typeof window.loadExecutionsData === 'function') {
        window.loadExecutionsData();
      }
      if (typeof window.loadTradeSuggestionsForAll === 'function') {
        window.loadTradeSuggestionsForAll();
      }
    } catch (error) {
      window.Logger?.error?.('❌ Failed to link executions to created trade', { ...PAGE_LOG_CONTEXT, error: error?.message });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', error.message || 'נכשל קישור ביצועים לטרייד');
      }
    }
  }

  // Export public API
  window.ExecutionClusterHelpers = {
    getExecutionDateValue,
    computeSelectionSummary,
    renderTickerBadge,
    renderAccountBadge,
    renderSummaryBadge,
    renderDateRange,
    buildTradePrefill,
    formatDateForInput,
    openTradeModalFromCluster,
    applyAdditionalPrefill,
    handleTradeCreated,
    renderClusterCard,
    renderClusterListItem,
    setupClusterCardButtons
  };

  window.Logger?.info?.('✅ ExecutionClusterHelpers loaded', PAGE_LOG_CONTEXT);
})();