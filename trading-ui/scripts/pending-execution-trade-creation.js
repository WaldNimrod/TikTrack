/**
 * Pending Execution Trade Creation
 * ==========================================
 * ממשק משותף לדף העסקאות ולדף הבית עבור יצירת טרייד חדש
 * מתוך אשכול ביצועים ללא שיוך. משתמש במערכות הכלליות:
 * - FieldRendererService
 * - ButtonSystem
 * - ModalManagerV2
 * - UnifiedCacheManager
 * - CRUDResponseHandler
 *
 * Function Index:
 * - initializeExecutionsSection(options)
 * - initializeDashboardWidget(options)
 * - refreshClusters({ source, force })
 * - ensureTradeModalDependencies()
 * - openTradeModalFromCluster(clusterId)
 * - handleTradeCreated(result)
 * - dismissCluster(clusterId, source)
 * - forceRefresh(source)
 */

(function () {
  const API_ENDPOINT = '/api/executions/pending-assignment/trade-creation-clusters';
  const DISMISSED_CACHE_KEY = 'pending-trade-create-clusters-dismissed';
  const MAX_WIDGET_ITEMS = 4;

  const PendingExecutionTradeCreation = {
    state: {
      clusters: [],
      clusterMap: new Map(),
      isLoading: false,
      error: null,
      dismissed: new Set(),
      selection: new Map(),
      activeContext: null,
      lastFetchedAt: null
    },

    executionsConfig: null,
    dashboardConfig: null,

    initializeExecutionsSection(options = {}) {
      const {
        containerId,
        countElementId,
        emptyStateId,
        errorElementId,
        loadingElementId
      } = options;

      const container = document.getElementById(containerId || 'executionTradeCreationClustersContainer');
      if (!container) {
        window.Logger?.warn('⚠️ PendingExecutionTradeCreation: executions container not found');
        return;
      }

      this.executionsConfig = {
        container,
        countEl: document.getElementById(countElementId || 'executionTradeCreationClustersCount'),
        emptyEl: emptyStateId ? document.getElementById(emptyStateId) : null,
        errorEl: errorElementId ? document.getElementById(errorElementId) : null,
        loadingEl: loadingElementId ? document.getElementById(loadingElementId) : null,
        handlersAttached: false
      };

      this.fetchDismissedClusters();
      this.refreshClusters({ source: 'executions' });
    },

    initializeDashboardWidget(options = {}) {
      const card = document.querySelector(options.cardSelector || '#pendingExecutionsTradeCreationCard');
      if (!card) {
        window.Logger?.warn('⚠️ PendingExecutionTradeCreation: dashboard card not found');
        return;
      }

      this.dashboardConfig = {
        card,
        listEl: card.querySelector(options.listSelector || '#pendingTradeCreationWidgetList'),
        countEl: card.querySelector(options.countSelector || '#pendingExecutionsTradeCreationCount'),
        loadingEl: card.querySelector(options.loadingSelector || '#pendingExecutionsTradeCreationLoading'),
        emptyEl: card.querySelector(options.emptySelector || '#pendingExecutionsTradeCreationEmpty'),
        errorEl: card.querySelector(options.errorSelector || '#pendingExecutionsTradeCreationError'),
        handlersAttached: false
      };

      this.fetchDismissedClusters();
      this.refreshClusters({ source: 'dashboard' });
    },

    async refreshClusters({ source = 'executions', force = false } = {}) {
      try {
        if (this.state.isLoading && !force) {
          return;
        }

        this.state.isLoading = true;
        this.state.error = null;
        this.toggleLoadingState(true, source);

        const response = await fetch(API_ENDPOINT, {
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const payload = await response.json();
        if (payload.status !== 'success') {
          throw new Error(payload?.error?.message || 'Unknown API error');
        }

        const clusters = Array.isArray(payload.data) ? payload.data : [];
        this.state.clusters = clusters;
        this.state.clusterMap = new Map(clusters.map(cluster => [cluster.cluster_id, cluster]));
        this.state.selection = new Map(
          clusters.map(cluster => [
            cluster.cluster_id,
            new Set(cluster.execution_ids || cluster.executions?.map(execution => execution.id) || [])
          ])
        );
        this.state.lastFetchedAt = Date.now();

        this.renderExecutionsSection();
        this.renderDashboardWidget();
      } catch (error) {
        this.state.error = error;
        window.Logger?.error('❌ Failed to load trade creation clusters', { error: error?.message }, { page: 'trade-create-widget' });
        this.renderExecutionsSection();
        this.renderDashboardWidget();
      } finally {
        this.state.isLoading = false;
        this.toggleLoadingState(false, source);
      }
    },

    toggleLoadingState(isLoading, source) {
      if (source === 'executions' && this.executionsConfig?.loadingEl) {
        this.executionsConfig.loadingEl.classList.toggle('d-none', !isLoading);
      }
      if (source === 'dashboard' && this.dashboardConfig?.loadingEl) {
        this.dashboardConfig.loadingEl.classList.toggle('d-none', !isLoading);
      }
    },

    fetchDismissedClusters() {
      try {
        const cached = window.UnifiedCacheManager?.get(DISMISSED_CACHE_KEY);
        if (Array.isArray(cached)) {
          this.state.dismissed = new Set(cached);
        }
      } catch (error) {
        window.Logger?.warn('⚠️ Failed to load dismissed clusters from cache', { error: error?.message }, { page: 'trade-create-widget' });
      }
    },

    persistDismissedClusters() {
      try {
        window.UnifiedCacheManager?.set(DISMISSED_CACHE_KEY, Array.from(this.state.dismissed), { ttl: 3600 });
      } catch (error) {
        window.Logger?.warn('⚠️ Failed to persist dismissed clusters', { error: error?.message }, { page: 'trade-create-widget' });
      }
    },

    getVisibleClustersForWidget() {
      return this.state.clusters.filter(cluster => !this.state.dismissed.has(cluster.cluster_id)).slice(0, MAX_WIDGET_ITEMS);
    },

    renderExecutionsSection() {
      if (!this.executionsConfig?.container) {
        return;
      }

      const { container, countEl, emptyEl, errorEl } = this.executionsConfig;
      container.innerHTML = '';

      if (this.state.error) {
        if (errorEl) {
          errorEl.textContent = this.state.error.message || 'שגיאה בטעינת אשכולות ליצירת טרייד';
          errorEl.classList.remove('d-none');
        }
        if (emptyEl) {
          emptyEl.classList.add('d-none');
        }
        return;
      }

      if (errorEl) {
        errorEl.classList.add('d-none');
      }

      const clusters = this.state.clusters;
      if (!clusters.length) {
        if (emptyEl) {
          emptyEl.classList.remove('d-none');
        }
        if (countEl) {
          countEl.textContent = '0';
        }
        return;
      }

      if (emptyEl) {
        emptyEl.classList.add('d-none');
      }

      const fragment = document.createDocumentFragment();

      clusters.forEach(cluster => {
        const selectedIds = this.state.selection.get(cluster.cluster_id) || new Set();
        const card = this.buildExecutionsClusterCard(cluster, selectedIds);
        fragment.appendChild(card);
      });

      container.appendChild(fragment);

      if (!this.executionsConfig.handlersAttached) {
        container.addEventListener('change', this.handleExecutionsChange.bind(this));
        container.addEventListener('click', this.handleExecutionsClick.bind(this));
        this.executionsConfig.handlersAttached = true;
      }

      if (countEl) {
        countEl.textContent = String(clusters.length);
      }

      this.initializeButtons(container);
    },

    renderDashboardWidget() {
      if (!this.dashboardConfig?.card) {
        return;
      }

      const { card, listEl, countEl, emptyEl, errorEl } = this.dashboardConfig;

      if (!listEl) {
        return;
      }

      listEl.innerHTML = '';

      if (this.state.error) {
        if (errorEl) {
          errorEl.textContent = this.state.error.message || 'שגיאה בטעינת אשכולות ליצירת טרייד';
          errorEl.classList.remove('d-none');
        }
        if (emptyEl) {
          emptyEl.classList.add('d-none');
        }
        return;
      }

      if (errorEl) {
        errorEl.classList.add('d-none');
      }

      const clusters = this.getVisibleClustersForWidget();

      if (!clusters.length) {
        if (emptyEl) {
          emptyEl.classList.remove('d-none');
        }
        if (countEl) {
          countEl.textContent = '0';
        }
        return;
      }

      if (emptyEl) {
        emptyEl.classList.add('d-none');
      }

      const fragment = document.createDocumentFragment();

      clusters.forEach(cluster => {
        const selectedIds = this.state.selection.get(cluster.cluster_id) || new Set(cluster.execution_ids || []);
        const item = this.buildDashboardClusterItem(cluster, selectedIds);
        fragment.appendChild(item);
      });

      listEl.appendChild(fragment);

      if (!this.dashboardConfig.handlersAttached) {
        listEl.addEventListener('click', this.handleDashboardClick.bind(this));
        listEl.addEventListener('mouseenter', this.handleDashboardHover.bind(this), true);
        listEl.addEventListener('mouseleave', this.handleDashboardHover.bind(this), true);
        this.dashboardConfig.handlersAttached = true;
      }

      if (countEl) {
        countEl.textContent = String(this.state.clusters.length);
      }

      this.initializeButtons(listEl);
    },

    buildExecutionsClusterCard(cluster, selectedIds) {
      const card = document.createElement('div');
      card.className = 'card trade-create-cluster-card mb-3';
      card.dataset.clusterId = cluster.cluster_id;

      const summary = this.computeSelectionSummary(cluster, selectedIds);

      card.innerHTML = `
        <div class=\"card-body\">
          <div class=\"d-flex flex-wrap align-items-start gap-3\">
            <div class=\"flex-grow-1\">
              <div class=\"d-flex flex-wrap align-items-center gap-2 trade-create-cluster-header\">
                ${this.renderTickerBadge(cluster)}
                ${this.renderAccountBadge(cluster)}
                <span class=\"badge ${cluster.side === 'long' ? 'badge-long' : 'badge-short'}\">${cluster.side === 'long' ? 'לונג' : 'שורט'}</span>
                <span class=\"text-muted small\">${cluster.stats.execution_count} ביצועים</span>
              </div>
              <div class=\"trade-create-summary mt-2\" data-cluster-summary=\"${cluster.cluster_id}\">
                ${this.renderSummaryBadge('כמות', summary.totalQuantity.toLocaleString('en-US'))}
                ${this.renderSummaryBadge('שווי', `$${summary.totalValue.toFixed(2)}`)}
                ${this.renderSummaryBadge('מחיר ממוצע', summary.averagePrice ? `$${summary.averagePrice.toFixed(4)}` : '-')}
                ${this.renderSummaryBadge('עלות עמלה', `$${summary.totalFee.toFixed(2)}`)}
                ${this.renderSummaryBadge('נבחרו', `${summary.selectedCount}/${cluster.stats.execution_count}`)}
              </div>
            </div>
            <div class=\"trade-create-actions d-flex flex-column gap-2 align-items-end\">
              <button
                data-button-type="APPROVE"
                data-variant="small"
                data-role="create-trade"
                data-cluster-id="${cluster.cluster_id}"
                data-text="פתח טרייד חדש" 
                data-onclick="PendingExecutionTradeCreation.openTradeModalFromCluster('${cluster.cluster_id}')"
                title="יצירת טרייד חדש עבור הביצועים הנבחרים">
              </button>
              <button
                data-button-type="REFRESH"
                data-variant="small"
                data-role="refresh-cluster"
                data-cluster-id="${cluster.cluster_id}"
                data-text="רענן אשכול"
                data-onclick="PendingExecutionTradeCreation.forceRefresh('executions')"
                title="טעינת נתונים מחדש לאשכול">
              </button>
              <button
                data-button-type="REJECT"
                data-variant="small"
                data-role="dismiss-cluster"
                data-cluster-id="${cluster.cluster_id}"
                data-text="התעלם"
                data-onclick="PendingExecutionTradeCreation.dismissCluster('${cluster.cluster_id}', 'executions')"
                title="הסתרת האשכול מהממשק">
              </button>
            </div>
          </div>
          <div class=\"trade-create-executions-table mt-3\">
            ${this.renderExecutionsTable(cluster, selectedIds)}
          </div>
        </div>
      `;

      return card;
    },

    buildDashboardClusterItem(cluster, selectedIds) {
      const item = document.createElement('li');
      item.className = 'list-group-item trade-create-widget-item';
      item.dataset.clusterId = cluster.cluster_id;

      const summary = this.computeSelectionSummary(cluster, selectedIds);
      const dateRange = cluster.stats?.date_range || {};
 
      const totalValueDisplay = summary.totalValue ? `$${summary.totalValue.toFixed(2)}` : '-';
      const averagePriceDisplay = summary.averagePrice ? `$${summary.averagePrice.toFixed(4)}` : '-';
      const dateRangeText = dateRange.start ? this.renderDateRange(dateRange) : '';

      item.innerHTML = `
        <div class="trade-create-widget-top d-flex flex-wrap align-items-center gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge ${cluster.side === 'long' ? 'badge-long' : 'badge-short'}">${cluster.side === 'long' ? 'לונג' : 'שורט'}</span>
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
              data-onclick="PendingExecutionTradeCreation.openTradeModalFromCluster('${cluster.cluster_id}')"
              title="יצירת טרייד חדש עבור האשכול">
            </button>
            <button
              data-button-type="REJECT"
              data-variant="small"
              data-role="dismiss-cluster"
              data-cluster-id="${cluster.cluster_id}"
              data-text="התעלם"
              data-onclick="PendingExecutionTradeCreation.dismissCluster('${cluster.cluster_id}', 'dashboard')"
              title="הסתרת האשכול מהממשק">
            </button>
          </div>
        </div>
        <div class="trade-create-entity-row d-flex align-items-center gap-2 mt-2">
          <span class="entity-icon-circle entity-icon-circle-sm d-flex align-items-center justify-content-center">
            <img src="images/icons/tickers.svg" alt="טיקר" width="12" height="12" />
          </span>
          ${this.renderTickerBadge(cluster)}
          <span class="entity-icon-circle entity-icon-circle-sm d-flex align-items-center justify-content-center">
            <img src="images/icons/trading_accounts.svg" alt="חשבון" width="12" height="12" />
          </span>
          ${this.renderAccountBadge(cluster)}
        </div>
        <div class="trade-create-widget-details" data-role="widget-detail" data-cluster-id="${cluster.cluster_id}">
          <div class="trade-create-widget-stats text-muted small mb-2 d-flex flex-wrap gap-2">
            <span>שווי כולל: ${totalValueDisplay}</span>
            <span>•</span>
            <span>מחיר ממוצע: ${averagePriceDisplay}</span>
            ${dateRange.start ? `<span>•</span><span>טווח: ${this.renderDateRange(dateRange)}</span>` : ''}
          </div>
          ${this.renderExecutionsList(cluster)}
        </div>
      `;

      return item;
    },

    renderTickerBadge(cluster) {
      const FieldRenderer = window.FieldRendererService;
      if (FieldRenderer?.renderLinkedEntity) {
        return FieldRenderer.renderLinkedEntity('ticker', cluster.ticker?.id, cluster.ticker?.symbol || 'לא מוגדר', { short: true }) || '';
      }
      return `<span class=\"badge bg-body-secondary text-body\">${cluster.ticker?.symbol || 'לא מוגדר'}</span>`;
    },

    renderAccountBadge(cluster) {
      const FieldRenderer = window.FieldRendererService;
      if (cluster.trading_account?.id) {
        if (FieldRenderer?.renderLinkedEntity) {
          return FieldRenderer.renderLinkedEntity('trading_account', cluster.trading_account.id, cluster.trading_account.name || 'לא מוגדר', { short: true }) || '';
        }
        return `<span class=\"badge bg-body-secondary text-body\">${cluster.trading_account.name || 'חשבון לא ידוע'}</span>`;
      }
      return `<span class=\"badge bg-body-secondary text-body\">ללא חשבון</span>`;
    },

    renderSummaryBadge(label, value) {
      return `<span class=\"badge bg-light text-body trade-create-summary-badge\"><span class=\"text-muted\">${label}:</span> ${value}</span>`;
    },

    renderExecutionsTable(cluster, selectedIds) {
      const FieldRenderer = window.FieldRendererService;

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
          <tr data-execution-id=\"${executionId}\">
            <td class=\"text-center\">
              <input 
                type=\"checkbox\" 
                class=\"form-check-input\" 
                data-role=\"execution-select\" 
                data-cluster-id=\"${cluster.cluster_id}\" 
                data-execution-id=\"${executionId}\" 
                ${isChecked ? 'checked' : ''}>
            </td>
            <td>${executionDate}</td>
            <td>${execution.action === 'sale' ? 'מכירה' : 'קניה'}</td>
            <td>${quantity ?? '-'}</td>
            <td>${price ?? '-'}</td>
            <td>${valueDisplay}</td>
            <td>${feeDisplay}</td>
            <td>${execution.source || '-'}</td>
            <td class=\"text-muted small\">${execution.notes ? execution.notes.substring(0, 80) : ''}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class=\"table-responsive\">
          <table class=\"table table-sm align-middle\">
            <thead>
              <tr>
                <th class=\"text-center\" style=\"width: 48px;\"></th>
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

    renderExecutionsList(cluster) {
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
          <div class=\"trade-create-widget-execution d-flex justify-content-between\">
            <span class=\"text-muted\">${date} • ${execution.action === 'sale' ? 'מכירה' : 'קניה'} • ${execution.quantity}</span>
            <span class=\"text-muted\">${value}</span>
          </div>
        `;
      }).join('');
    },

    renderDateRange(range) {
      const FieldRenderer = window.FieldRendererService;
      const start = FieldRenderer?.renderDateShort?.(range.start) || range.start?.display || range.start?.local || range.start?.utc || '';
      const end = FieldRenderer?.renderDateShort?.(range.end) || range.end?.display || range.end?.local || range.end?.utc || '';
      if (start && end && start !== end) {
        return `${start} - ${end}`;
      }
      return start || end || '';
    },

    computeSelectionSummary(cluster, selectedIds) {
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
    },

    handleExecutionsChange(event) {
      const target = event.target;
      if (!target.matches('input[data-role=\"execution-select\"]')) {
        return;
      }

      const clusterId = target.dataset.clusterId;
      const executionId = Number(target.dataset.executionId);
      const selectedSet = this.state.selection.get(clusterId) || new Set();

      if (target.checked) {
        selectedSet.add(executionId);
      } else {
        selectedSet.delete(executionId);
      }

      this.state.selection.set(clusterId, selectedSet);
      this.updateExecutionsSummary(clusterId);
    },

    handleExecutionsClick(event) {
      const createBtn = event.target.closest('[data-role="create-trade"]');
      if (createBtn) {
        const clusterId = createBtn.dataset.clusterId;
        this.openTradeModalFromCluster(clusterId);
        return;
      }

      const refreshBtn = event.target.closest('[data-role="refresh-cluster"]');
      if (refreshBtn) {
        this.forceRefresh('executions');
        return;
      }

      const dismissBtn = event.target.closest('[data-role="dismiss-cluster"]');
      if (dismissBtn) {
        const clusterId = dismissBtn.dataset.clusterId;
        this.dismissCluster(clusterId, 'executions');
      }
    },

    handleDashboardClick(event) {
      const createBtn = event.target.closest('[data-role="create-trade"]');
      if (createBtn) {
        const clusterId = createBtn.dataset.clusterId;
        this.openTradeModalFromCluster(clusterId);
        return;
      }

      const dismissBtn = event.target.closest('[data-role="dismiss-cluster"]');
      if (dismissBtn) {
        const clusterId = dismissBtn.dataset.clusterId;
        this.dismissCluster(clusterId, 'dashboard');
      }
    },

    handleDashboardHover(event) {
      const item = event.target.closest('.trade-create-widget-item');
      if (!item) {
        return;
      }

      if (event.type === 'mouseenter') {
        item.classList.add('is-hovered');
      } else {
        item.classList.remove('is-hovered');
      }
    },

    updateExecutionsSummary(clusterId) {
      const cluster = this.state.clusterMap.get(clusterId);
      if (!cluster) {
        return;
      }

      const selectedSet = this.state.selection.get(clusterId) || new Set();
      const summary = this.computeSelectionSummary(cluster, selectedSet);
      const summaryContainer = this.executionsConfig?.container.querySelector(`[data-cluster-summary=\"${clusterId}\"]`);
      if (!summaryContainer) {
        return;
      }

      summaryContainer.innerHTML = `
        ${this.renderSummaryBadge('כמות', summary.totalQuantity.toLocaleString('en-US'))}
        ${this.renderSummaryBadge('שווי', `$${summary.totalValue.toFixed(2)}`)}
        ${this.renderSummaryBadge('מחיר ממוצע', summary.averagePrice ? `$${summary.averagePrice.toFixed(4)}` : '-')}
        ${this.renderSummaryBadge('עלות עמלה', `$${summary.totalFee.toFixed(2)}`)}
        ${this.renderSummaryBadge('נבחרו', `${summary.selectedCount}/${cluster.stats.execution_count}`)}
      `;
    },

    /**
     * Ensure all modal dependencies are loaded before opening the trade modal.
     * Loads scripts sequentially with caching and validates required globals.
     *
     * @returns {Promise<void>} Resolves when dependencies are available.
     */
    async ensureTradeModalDependencies() {
      if (this.dependencyPromise) {
        return this.dependencyPromise;
      }

      const coreScripts = [
        'scripts/modal-navigation-manager.js?v=1.0.0',
        'scripts/modal-manager-v2.js?v=1.0.0'
      ];
      const dependentScripts = [
        'scripts/services/investment-calculation-service.js?v=1.0.0',
        'scripts/trade-selector-modal.js?v=1.0.0',
        'scripts/modal-configs/trades-config.js?v=1.0.0',
        'scripts/trades.js?v=1.0.0',
        'scripts/validation-utils.js?v=1.0.0'
      ];
      const bootstrapScript = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';

      const fallbackLoader = async (sources) => {
        if (typeof window.loadScriptsOnce === 'function') {
          await window.loadScriptsOnce(sources);
          return;
        }

        for (const source of sources) {
          if (!source) {
            continue;
          }
          if (typeof window.loadScriptOnce === 'function') {
            await window.loadScriptOnce(source);
            continue;
          }

          await new Promise((resolve, reject) => {
            const scriptElement = document.createElement('script');
            scriptElement.src = source;
            scriptElement.async = true;
            scriptElement.dataset.loader = 'pending-execution-trade-creation/fallback';
            scriptElement.onload = resolve;
            scriptElement.onerror = (event) => {
              const error = new Error(`Failed to load script: ${source}`);
              error.event = event;
              reject(error);
            };
            document.head.appendChild(scriptElement);
          });
        }
      };

      const ensureModalManagerReady = () => {
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          return;
        }

        if (typeof ModalManagerV2 === 'function') {
          try {
            // Lazy instantiate to replace the DOMContentLoaded auto-init that already fired
            new ModalManagerV2();
            window.Logger?.info('✅ ModalManagerV2 initialized via lazy loader', { page: 'trade-create-widget' });
          } catch (error) {
            window.Logger?.error('❌ Failed to lazily initialize ModalManagerV2', { page: 'trade-create-widget', error: error?.message });
          }
        }
      };

      this.dependencyPromise = (async () => {
        if (!window.bootstrap) {
          await fallbackLoader([bootstrapScript]);
        }
        await fallbackLoader(coreScripts);
        ensureModalManagerReady();
        if (!window.bootstrap) {
          await fallbackLoader([bootstrapScript]);
        }
        await fallbackLoader(dependentScripts);
        ensureModalManagerReady();

        if (!window.ModalManagerV2 || typeof window.ModalManagerV2.showModal !== 'function') {
          throw new Error('ModalManagerV2 not available after loading dependencies');
        }
        if (!window.bootstrap) {
          throw new Error('Bootstrap not available after loading dependencies');
        }
        if (!window.saveTrade) {
          throw new Error('saveTrade handler not available after loading dependencies');
        }
        if (!window.validateEntityForm) {
          throw new Error('Validation system not available after loading dependencies');
        }
      })().catch(error => {
        this.dependencyPromise = null;
        throw error;
      });

      return this.dependencyPromise;
    },

    /**
     * Open the trade modal with prefilled data for the selected execution cluster.
     *
     * @param {string} clusterId - Identifier of the execution cluster.
     * @returns {Promise<void>}
     */
    async openTradeModalFromCluster(clusterId) {
      const cluster = this.state.clusterMap.get(clusterId);
      if (!cluster) {
        window.Logger?.warn('⚠️ PendingExecutionTradeCreation: cluster not found', { clusterId });
        return;
      }

      const selectedSet = this.state.selection.get(clusterId) || new Set(cluster.execution_ids || []);
      if (!selectedSet.size) {
        if (typeof window.showWarningNotification === 'function') {
          window.showWarningNotification('לא נבחרו ביצועים', 'בחר לפחות ביצוע אחד לפני יצירת טרייד');
        }
        return;
      }

      const selectionSummary = this.computeSelectionSummary(cluster, selectedSet);
      const selectedExecutions = (cluster.executions || []).filter(execution => selectedSet.has(execution.id));

      if (!selectedExecutions.length) {
        if (typeof window.showWarningNotification === 'function') {
          window.showWarningNotification('לא נבחרו ביצועים', 'בחר לפחות ביצוע אחד לפני יצירת טרייד');
        }
        return;
      }

      try {
        await this.ensureTradeModalDependencies();
      } catch (error) {
        window.Logger?.error('❌ Failed to load trade modal dependencies', { error: error?.message }, { page: 'trade-create-widget' });
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification('שגיאה בטעינת רכיבי יצירת טרייד', error?.message || 'לא ניתן לטעון את רכיבי המודל כעת. נסה שוב מאוחר יותר.');
        }
        return;
      }

      this.state.activeContext = {
        clusterId,
        executionIds: Array.from(selectedSet),
        summary: selectionSummary
      };

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
          form.dataset.selectedExecutionIds = this.state.activeContext.executionIds.join(',');
        }

        const prefill = this.buildTradePrefill(cluster, selectionSummary);
        await window.ModalManagerV2.populateForm(modalElement, prefill);

        this.applyAdditionalPrefill(modalElement, prefill, selectionSummary);
      } catch (error) {
        window.Logger?.error('❌ Failed to open trade modal with prefill', { error: error?.message });
      }
    },

    buildTradePrefill(cluster, summary) {
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
    },

    applyAdditionalPrefill(modalElement, prefill, summary) {
      const form = modalElement.querySelector('form');
      if (!form) {
        return;
      }

      const totalInvestmentField = form.querySelector('#tradeTotalInvestment');
      if (totalInvestmentField) {
        totalInvestmentField.value = summary.totalValue ? summary.totalValue.toFixed(2) : '';
      }

      const entryDateField = form.querySelector('#tradeEntryDate');
      if (entryDateField) {
        const entryValue = this.formatDateForInput(prefill.created_at);
        if (entryValue) {
          entryDateField.value = entryValue;
        }
      }

      const noteText = prefill.notes;
      if (noteText && typeof window.ModalManagerV2?._setRichTextContent === 'function') {
        window.ModalManagerV2._setRichTextContent('tradeNotes', noteText);
      }

      if (window.InvestmentCalculationService?.resync) {
        window.InvestmentCalculationService.resync(modalElement, { force: true }).catch(() => {});
      }
    },

    formatDateForInput(envelope) {
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
    },

    async handleTradeCreated(result) {
      try {
        const context = this.state.activeContext;
        this.state.activeContext = null;

        if (!context) {
          return;
        }

        const tradeId = result?.data?.id || result?.data?.trade?.id || null;
        if (!tradeId) {
          window.Logger?.warn('⚠️ Trade created but response missing ID', { result });
          return;
        }

        const assignments = context.executionIds.map(executionId => ({
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

        this.removeCluster(context.clusterId);

        if (typeof window.loadExecutionsData === 'function') {
          window.loadExecutionsData();
        }
        if (typeof window.loadTradeSuggestionsForAll === 'function') {
          window.loadTradeSuggestionsForAll();
        }
        this.refreshClusters({ force: true, source: 'executions' });
      } catch (error) {
        window.Logger?.error('❌ Failed to link executions to created trade', { error: error?.message });
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification('שגיאה', error.message || 'נכשל קישור ביצועים לטרייד');
        }
      }
    },

    removeCluster(clusterId) {
      this.state.clusters = this.state.clusters.filter(cluster => cluster.cluster_id !== clusterId);
      this.state.clusterMap.delete(clusterId);
      this.state.selection.delete(clusterId);

      this.renderExecutionsSection();
      this.renderDashboardWidget();
    },

    initializeButtons(container) {
      if (window.ButtonSystem?.initializeButtons) {
        window.ButtonSystem.initializeButtons(container);
      } else if (typeof window.initializeButtons === 'function') {
        window.initializeButtons(container);
      }
    },

    removeExecutionFromState(executionId, score = null) {
      this.state.items = this.state.items.filter(item => item.execution_id !== executionId);
      if (typeof score === 'number' && score >= 50 && this.state.totalEligibleCount > 0) {
        this.state.totalEligibleCount = Math.max(0, this.state.totalEligibleCount - 1);
      }
      this.render();
    },
 
    dismissCluster(clusterId, source = 'dashboard') {
      if (!clusterId) {
        return;
      }

      this.state.dismissed.add(clusterId);
      this.persistDismissedClusters();
      this.removeCluster(clusterId);

      if (source === 'dashboard') {
        this.renderDashboardWidget();
      } else if (source === 'executions') {
        this.renderExecutionsSection();
      }
    },

    forceRefresh(source = 'executions') {
      this.refreshClusters({ source, force: true });
    },

    openExecutionDetails(executionId) {
      if (!executionId) {
        return;
      }
      if (typeof window.showEntityDetails === 'function') {
        window.showEntityDetails(executionId);
      }
    }
  };

  window.PendingExecutionTradeCreation = PendingExecutionTradeCreation;
})();

