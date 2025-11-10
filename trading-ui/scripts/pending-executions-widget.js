/**
 * Pending Execution Highlights Widget
 * ===================================
 * מציג "להיטים" מומלצים לשיוך מהיר בעמוד הבית.
 * משתמש במערכות הכלליות: FieldRendererService, NotificationSystem, ModalManagerV2.
 */

(function () {
    const HIGHLIGHTS_ENDPOINT = '/api/executions/pending-assignment/highlights';
    const ASSIGN_ENDPOINT = (executionId) => `/api/executions/${executionId}`;
    const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
    const DISMISSED_CACHE_KEY = 'pending-execution-highlights-dismissed';
    const DISMISSED_TTL_SECONDS = 3600; // 1 hour

    const SELECTORS = {
        card: '#pendingExecutionsHighlightsCard',
        list: '#pendingExecutionsHighlightsList',
        count: '#pendingExecutionsHighlightsCount',
        loading: '#pendingExecutionsHighlightsLoading',
        empty: '#pendingExecutionsHighlightsEmpty',
        error: '#pendingExecutionsHighlightsError'
    };

    const PendingExecutionsHighlights = {
        state: {
            items: [],
            isLoading: false,
            dismissed: new Set(),
            autoRefreshTimer: null
        },

        init() {
            this.cacheDom();
            if (!this.dom.card) {
                window.Logger?.warn('⚠️ Pending Executions highlights card not found', { page: 'index' });
                return;
            }

            this.loadDismissedExecutionIds();
            this.fetchHighlights();
            this.startAutoRefresh();

            window.Logger?.info('📊 Pending Executions Highlights widget initialized', { page: 'index' });
        },

        cacheDom() {
            this.dom = {
                card: document.querySelector(SELECTORS.card),
                list: document.querySelector(SELECTORS.list),
                count: document.querySelector(SELECTORS.count),
                loading: document.querySelector(SELECTORS.loading),
                empty: document.querySelector(SELECTORS.empty),
                error: document.querySelector(SELECTORS.error)
            };
        },

        loadDismissedExecutionIds() {
            try {
                const cached = window.UnifiedCacheManager?.get(DISMISSED_CACHE_KEY);
                if (Array.isArray(cached) && cached.length > 0) {
                    this.state.dismissed = new Set(cached);
                }
            } catch (error) {
                window.Logger?.warn('⚠️ Failed to load dismissed execution ids from cache', { error: error?.message }, { page: 'index' });
            }
        },

        persistDismissedExecutionIds() {
            try {
                window.UnifiedCacheManager?.set(
                    DISMISSED_CACHE_KEY,
                    Array.from(this.state.dismissed),
                    { ttl: DISMISSED_TTL_SECONDS }
                );
            } catch (error) {
                window.Logger?.warn('⚠️ Failed to persist dismissed execution ids', { error: error?.message }, { page: 'index' });
            }
        },

        setLoading(isLoading) {
            this.state.isLoading = isLoading;
            if (this.dom.loading) {
                this.dom.loading.classList.toggle('d-none', !isLoading);
            }
        },

        async fetchHighlights() {
            this.setLoading(true);
            this.hideError();

            try {
                const response = await fetch(HIGHLIGHTS_ENDPOINT, { headers: { 'Accept': 'application/json' } });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const payload = await response.json();
                if (payload.status !== 'success') {
                    throw new Error(payload?.error?.message || 'Unknown API error');
                }

                const data = Array.isArray(payload.data) ? payload.data : [];
                const filtered = data.filter(item => !this.state.dismissed.has(item.execution_id));
                this.state.items = filtered;

                this.render();
            } catch (error) {
                window.Logger?.error('❌ Failed to load pending execution highlights', { error: error?.message }, { page: 'index' });
                this.showError(error?.message || 'שגיאה בלתי צפויה בטעינת ההמלצות');
            } finally {
                this.setLoading(false);
            }
        },

        render() {
            this.updateCountBadge();

            if (!this.dom.list) {
                return;
            }

            if (!this.state.items.length) {
                this.dom.list.innerHTML = '';
                this.showEmptyState();
                return;
            }

            const itemsHtml = this.state.items.map(item => this.renderHighlightItem(item)).join('');
            this.dom.list.innerHTML = itemsHtml;

            if (this.dom.empty) {
                this.dom.empty.classList.add('d-none');
            }

            if (window.ButtonSystem?.initializeButtons) {
                window.ButtonSystem.initializeButtons();
            } else if (window.initializeButtons) {
                window.initializeButtons();
            }
        },

        renderHighlightItem(item) {
            const execution = item.execution || {};
            const suggestions = Array.isArray(item.suggestions) ? item.suggestions : [];
            const primarySuggestion = item.primary_suggestion || suggestions[0] || null;
            const additionalSuggestions = item.additional_suggestions ?? Math.max(suggestions.length - 1, 0);
            const score = item.best_score ?? (primarySuggestion ? primarySuggestion.score : null);

            const FieldRenderer = window.FieldRendererService;

            const executionBadge = '<span class="badge bg-light text-body">ביצוע</span>';
            const tickerLink = FieldRenderer?.renderLinkedEntity('ticker', execution.ticker_id, execution.ticker_symbol, { short: true }) || execution.ticker_symbol || '-';
            const actionBadge = FieldRenderer?.renderAction?.(execution.action) || `<span class="badge bg-secondary">${execution.action || '-'}</span>`;
            const quantityDisplay = FieldRenderer?.renderShares?.(execution.quantity) || `<span class="text-muted">${execution.quantity ?? '-'}</span>`;
            const executionDate = FieldRenderer?.renderExecutionDate?.(execution.date) || (FieldRenderer?.renderDate?.(execution.date, true) || '-');
            const executionPrice = typeof FieldRenderer?.renderAmount === 'function'
                ? FieldRenderer.renderAmount(execution.price, '$', 2, false)
                : (execution.price ? `<span class="text-muted">$${parseFloat(execution.price).toFixed(2)}</span>` : '<span class="text-muted">-</span>');
            const sharedAccount = execution.trading_account_id || primarySuggestion?.trading_account_id
                ? FieldRenderer?.renderLinkedEntity(
                    'trading_account',
                    execution.trading_account_id || primarySuggestion?.trading_account_id,
                    execution.account_name || primarySuggestion?.account_name,
                    { short: true }
                  )
                : (execution.account_name || primarySuggestion?.account_name
                    ? `<span class="badge rounded-pill bg-body-secondary text-body">${execution.account_name || primarySuggestion?.account_name}</span>`
                    : '');
            const sharedTickerRow = `
                <div class="d-flex align-items-center flex-wrap gap-2 text-muted small flex-grow-1">
                    <div class="d-flex align-items-center gap-2">
                        <span class="entity-icon-circle">
                            <img src="images/icons/tickers.svg" alt="טיקר" />
                        </span>
                        ${tickerLink}
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="entity-icon-circle">
                            <img src="images/icons/trading_accounts.svg" alt="חשבון מסחר" />
                        </span>
                        ${sharedAccount || '<span class="text-muted">לא מוגדר</span>'}
                    </div>
                </div>
            `;

            const tradeBadge = '<span class="badge bg-light text-body">טרייד</span>';

            const tradeStatus = primarySuggestion && FieldRenderer?.renderStatus
                ? FieldRenderer.renderStatus(primarySuggestion.status, 'trade')
                : (primarySuggestion?.status || '');

            const tradeSide = primarySuggestion && FieldRenderer?.renderSide
                ? FieldRenderer.renderSide(primarySuggestion.side)
                : (primarySuggestion?.side ? `<span class="badge bg-info text-dark">${primarySuggestion.side}</span>` : '');

            const investmentType = primarySuggestion && FieldRenderer?.renderType
                ? FieldRenderer.renderType(primarySuggestion.investment_type)
                : (primarySuggestion?.investment_type ? `<span class="badge bg-light text-body">${primarySuggestion.investment_type}</span>` : '');

            const tradeDate = primarySuggestion && FieldRenderer?.renderDate
                ? FieldRenderer.renderDate(primarySuggestion.created_at, false)
                : (primarySuggestion?.created_at || '-');

            const scoreTooltip = 'טיקר תואם • חשבון מסחר תואם • תאריך בטווח הטרייד';
            const scoreBadge = typeof score === 'number'
                ? `<span class="badge entity-trade" data-tooltip="${scoreTooltip}" data-tooltip-placement="top" data-tooltip-trigger="hover">${score}</span>`
                : '';

            const additionalText = additionalSuggestions > 0
                ? `<span class="text-muted small">+${additionalSuggestions} הצעות נוספות</span>`
                : '';

            const itemIdAttr = execution.id ? `data-execution-id="${execution.id}"` : '';

            const topRow = `
                <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
                    ${sharedTickerRow}
                    <div class="d-flex flex-column align-items-end gap-2">
                        <div class="d-flex flex-column align-items-end gap-1">
                            ${scoreBadge}
                            ${additionalText}
                        </div>
                        <div class="d-flex flex-wrap gap-2 justify-content-end">
                            <button
                                data-button-type="APPROVE"
                                data-variant="small"
                                data-classes="btn btn-sm btn-outline-success table-btn-small"
                                data-text="אשר שיוך"
                                data-onclick="PendingExecutionsHighlights.acceptSuggestion(${execution.id}, ${primarySuggestion?.trade_id || 'null'})"
                                ${primarySuggestion ? '' : 'disabled'}
                            ></button>
                            <button
                                data-button-type="REJECT"
                                data-variant="small"
                                data-classes="btn btn-sm btn-outline-danger table-btn-small"
                                data-text="דחה"
                                data-onclick="PendingExecutionsHighlights.rejectSuggestion(${execution.id})"
                            ></button>
                        </div>
                    </div>
                </div>
            `;

            const executionDetails = `
                <div class="col-12 col-md-6">
                    <div class="bg-body-tertiary rounded-3 p-3 d-flex flex-column gap-2 h-100 cursor-pointer" role="button" tabindex="0"
                        onclick="PendingExecutionsHighlights.openExecutionDetails(${execution.id})"
                        onkeypress="if(event.key==='Enter'){PendingExecutionsHighlights.openExecutionDetails(${execution.id});}">
                        <div class="fw-semibold text-muted">פרטי ביצוע</div>
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                            ${executionBadge}
                            ${actionBadge}
                        </div>
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                            ${quantityDisplay}
                            ${executionPrice}
                        </div>
                        <div class="text-muted small">
                            ${executionDate}
                        </div>
                    </div>
                </div>
            `;

            const tradeDetails = primarySuggestion
                ? `
                    <div class="col-12 col-md-6">
                        <div class="bg-body-tertiary rounded-3 p-3 d-flex flex-column gap-2 h-100 cursor-pointer" role="button" tabindex="0"
                            onclick="PendingExecutionsHighlights.openTradeDetails(${primarySuggestion.trade_id})"
                            onkeypress="if(event.key==='Enter'){PendingExecutionsHighlights.openTradeDetails(${primarySuggestion.trade_id});}">
                            <div class="fw-semibold text-muted">פרטי טרייד</div>
                            <div class="d-flex flex-wrap gap-2 align-items-center">
                                ${tradeBadge}
                                ${tradeStatus}
                            </div>
                            <div class="d-flex flex-wrap gap-2 align-items-center">
                                ${tradeSide}
                                ${investmentType}
                            </div>
                            <div class="text-muted small">
                                ${tradeDate}
                            </div>
                        </div>
                    </div>
                `
                : `
                    <div class="col-12 col-md-6">
                        <div class="bg-body-tertiary rounded-3 p-3 d-flex flex-column gap-2 h-100">
                            <div class="fw-semibold text-muted">פרטי טרייד</div>
                            <span class="text-muted">אין טרייד מומלץ</span>
                        </div>
                    </div>
                `;

            return `
                <li class="list-group-item pending-highlight-item" ${itemIdAttr}>
                    ${topRow}
                    <div class="row g-2 mt-2 align-items-stretch">
                        ${executionDetails}
                        ${tradeDetails}
                    </div>
                </li>
            `;
        },

        updateCountBadge() {
            if (!this.dom.count) {
                return;
            }
            const count = this.state.items.length;
            this.dom.count.textContent = count.toString();
            this.dom.count.classList.remove('bg-danger', 'bg-success', 'bg-warning');
            this.dom.count.classList.add(count > 0 ? 'entity-execution' : 'bg-success');
        },

        showEmptyState() {
            if (this.dom.empty) {
                this.dom.empty.classList.remove('d-none');
            }
        },

        showError(message) {
            if (this.dom.error) {
                this.dom.error.textContent = message;
                this.dom.error.classList.remove('d-none');
            }
            if (this.dom.count) {
                this.dom.count.textContent = '!';
                this.dom.count.classList.remove('entity-execution', 'bg-success');
                this.dom.count.classList.add('bg-danger');
            }
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בטעינת המלצות שיוך', message);
            }
        },

        hideError() {
            if (this.dom.error) {
                this.dom.error.classList.add('d-none');
            }
        },

        async acceptSuggestion(executionId, tradeId) {
            if (!executionId || !tradeId) {
                window.Logger?.warn('⚠️ Missing execution/trade id for acceptance', { executionId, tradeId }, { page: 'index' });
                return;
            }

            try {
                window.Logger?.info('✅ Accepting highlight suggestion', { executionId, tradeId }, { page: 'index' });
                const response = await fetch(ASSIGN_ENDPOINT(executionId), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trade_id: tradeId })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData?.error?.message || 'Failed to assign execution to trade');
                }

                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('שיוך הושלם', `ביצוע #${executionId} שויך לטרייד #${tradeId}`);
                }

                this.removeExecutionFromState(executionId);
                this.fetchHighlights();
            } catch (error) {
                window.Logger?.error('❌ Failed to accept highlight suggestion', { error: error?.message, executionId, tradeId }, { page: 'index' });
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה בשיוך', error?.message || 'השיוך נכשל');
                }
            }
        },

        rejectSuggestion(executionId) {
            if (!executionId) {
                return;
            }

            window.Logger?.info('🚫 Highlight suggestion dismissed', { executionId }, { page: 'index' });
            this.state.dismissed.add(executionId);
            this.persistDismissedExecutionIds();
            this.removeExecutionFromState(executionId);
        },

        removeExecutionFromState(executionId) {
            this.state.items = this.state.items.filter(item => item.execution_id !== executionId);
            this.render();
        },

        openExecutionDetails(executionId) {
            if (!executionId) {
                return;
            }
            if (typeof window.showEntityDetails === 'function') {
                window.showEntityDetails('execution', executionId, { source: 'dashboard-widget' });
            } else {
                window.location.href = `/executions?highlight=${executionId}`;
            }
        },

        openTradeDetails(tradeId) {
            if (!tradeId) {
                return;
            }
            if (typeof window.showEntityDetails === 'function') {
                window.showEntityDetails('trade', tradeId, { source: 'dashboard-widget' });
            } else {
                window.location.href = `/trades?highlight=${tradeId}`;
            }
        },

        startAutoRefresh() {
            this.stopAutoRefresh();
            this.state.autoRefreshTimer = window.setInterval(() => {
                this.fetchHighlights();
            }, AUTO_REFRESH_INTERVAL);
        },

        stopAutoRefresh() {
            if (this.state.autoRefreshTimer) {
                window.clearInterval(this.state.autoRefreshTimer);
                this.state.autoRefreshTimer = null;
            }
        }
    };

    window.PendingExecutionsHighlights = PendingExecutionsHighlights;

    window.refreshPendingExecutionsWidget = () => {
        PendingExecutionsHighlights.fetchHighlights();
    };

    window.initializePendingExecutionsWidget = () => {
        PendingExecutionsHighlights.init();
    };

    window.Logger?.info('📊 Pending Executions Highlights script loaded', { page: 'index' });
})();

