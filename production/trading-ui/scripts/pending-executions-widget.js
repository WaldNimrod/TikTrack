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
            autoRefreshTimer: null,
            totalEligibleCount: 0
        },

        init() {
            this.ensureCardExists();
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

        ensureCardExists() {
            if (document.querySelector(SELECTORS.card)) {
                return;
            }

            const rowContainer = document.querySelector('#main .section-body .row');
            if (!rowContainer) {
                window.Logger?.warn('⚠️ Pending Executions highlights container row not found', { page: 'index' });
                return;
            }

            const column = document.createElement('div');
            column.className = 'col-12 col-lg-6 col-xl-4';
            column.innerHTML = `
                <div class="card h-100" id="pendingExecutionsHighlightsCard">
                    <div class="card-header d-flex align-items-center justify-content-between gap-2">
                        <h5 class="mb-0">
                            <a
                                href="executions.html"
                                class="d-inline-flex align-items-center gap-2 widget-title-link"
                                data-onclick="navigateToPage('executions', { preserveState: true })"
                            >
                                <img src="images/icons/executions.svg" alt="ביצועים" width="20" height="20">
                                <span>המלצות שיוך בולטות</span>
                            </a>
                        </h5>
                        <span class="badge entity-execution" id="pendingExecutionsHighlightsCount">0</span>
                    </div>
                    <div class="card-body d-flex flex-column gap-3">
                        <div id="pendingExecutionsHighlightsLoading" class="d-flex align-items-center justify-content-center text-muted small">
                            <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                            <span>טוען המלצות...</span>
                        </div>
                        <div id="pendingExecutionsHighlightsError" class="alert alert-danger d-none" role="alert"></div>
                        <div id="pendingExecutionsHighlightsEmpty" class="alert alert-success d-none" role="status">
                            אין כרגע ביצועים שממתינים לשיוך. המשך עבודה מצוינת!
                        </div>
                        <ul class="list-group list-group-flush flex-grow-1" id="pendingExecutionsHighlightsList"></ul>
                    </div>
                </div>
            `;

            rowContainer.prepend(column);
            window.Logger?.info('🧩 Pending Executions highlights card auto-inserted', { page: 'index' });
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
                const totalEligibleCount = data.filter(highlight => {
                    const bestScore = this.getBestScore(highlight);
                    return typeof bestScore === 'number' && bestScore >= 50;
                }).length;

                const filtered = data.filter(item => !this.state.dismissed.has(item.execution_id));
                this.state.totalEligibleCount = totalEligibleCount;
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

            this.setupHoverDetails();
        },

        renderHighlightItem(item) {
            const execution = item.execution || {};
            const suggestions = Array.isArray(item.suggestions) ? item.suggestions : [];
            const primarySuggestion = item.primary_suggestion || suggestions[0] || null;
            const additionalSuggestions = item.additional_suggestions ?? Math.max(suggestions.length - 1, 0);
            const rawScore = item.best_score ?? (primarySuggestion ? primarySuggestion.score : null);
            const score = this.normalizeScore(rawScore);

            const FieldRenderer = window.FieldRendererService;

            const tickerLink = FieldRenderer?.renderLinkedEntity('ticker', execution.ticker_id, execution.ticker_symbol, { short: true }) || execution.ticker_symbol || '-';
            const actionBadgeDetailed = FieldRenderer?.renderAction?.(execution.action) || `<span class="badge bg-secondary">${execution.action || '-'}</span>`;
            const quantityDisplay = FieldRenderer?.renderShares?.(execution.quantity) || `<span class="text-muted">${execution.quantity ?? '-'}</span>`;
            let quantityCompact = FieldRenderer?.renderShares?.(execution.quantity, 'numeric-ltr text-muted small') || '';
            if (!quantityCompact || quantityCompact === '-') {
                quantityCompact = '<span class="text-muted small">-</span>';
            }
            const executionDate = FieldRenderer?.renderDateShort?.(execution.date)
                || (FieldRenderer?.renderDate?.(execution.date, false) || '-');
            const executionDateCompact = `<span class="text-muted small">${executionDate}</span>`;
            const executionPrice = typeof FieldRenderer?.renderAmount === 'function'
                ? FieldRenderer.renderAmount(execution.price, '$', 2, false)
                : (execution.price ? `<span class="text-muted">$${parseFloat(execution.price).toFixed(2)}</span>` : '<span class="text-muted">-</span>');
            const executionFee = typeof FieldRenderer?.renderAmount === 'function'
                ? FieldRenderer.renderAmount(execution.fee, '$', 2, false)
                : (execution.fee ? `<span class="text-muted">$${parseFloat(execution.fee).toFixed(2)}</span>` : '');
            const executionRealized = typeof FieldRenderer?.renderAmount === 'function'
                ? FieldRenderer.renderAmount(execution.realized_pl, '$', 2, true)
                : (execution.realized_pl ? `<span class="text-muted">$${parseFloat(execution.realized_pl).toFixed(2)}</span>` : '');
            const executionSource = execution.source ? `<span class="badge bg-body-secondary text-body">${execution.source}</span>` : '';
            const executionExternalId = execution.external_id ? `<span class="text-muted small">${execution.external_id}</span>` : '';
            const executionNotes = execution.notes && typeof FieldRenderer?.renderTextPreview === 'function'
                ? FieldRenderer.renderTextPreview(execution.notes, { maxLength: 80, tooltip: true, className: 'text-muted small' })
                : (execution.notes ? `<span class="text-muted small">${execution.notes}</span>` : '');
            const actionLower = (execution.action || '').toString().toLowerCase();
            const isBuyAction = actionLower === 'buy' || actionLower === 'קניה' || actionLower === 'קנייה';
            const actionDirectionBadge = execution.action
                ? `<span class="badge ${isBuyAction ? 'badge-long' : 'badge-short'}" data-tooltip="${isBuyAction ? 'קניה' : 'מכירה'}" data-tooltip-placement="top" data-tooltip-trigger="hover">${isBuyAction ? '↑' : '↓'}</span>`
                : '';
            const actionSummaryInline = `
                <div class="d-flex align-items-center gap-2 flex-shrink-0">
                    ${actionDirectionBadge}
                    <div class="d-flex align-items-center gap-1">
                        ${quantityCompact}
                        <span class="text-muted small">|</span>
                        ${executionDateCompact}
                    </div>
                </div>
            `;
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
                <div class="d-flex align-items-center flex-wrap text-muted small gap-1">
                    <span class="entity-icon-circle entity-icon-circle-sm d-flex align-items-center justify-content-center">
                        <img src="images/icons/tickers.svg" alt="טיקר" width="12" height="12" />
                    </span>
                    ${tickerLink}
                    <span class="entity-icon-circle entity-icon-circle-sm d-flex align-items-center justify-content-center">
                        <img src="images/icons/trading_accounts.svg" alt="חשבון מסחר" width="12" height="12" />
                    </span>
                    ${sharedAccount || '<span class="text-muted">לא מוגדר</span>'}
                </div>
            `;

            const tradeStatus = primarySuggestion && FieldRenderer?.renderStatus
                ? FieldRenderer.renderStatus(primarySuggestion.status, 'trade')
                : (primarySuggestion?.status || '');

            const tradeSide = primarySuggestion && FieldRenderer?.renderSide
                ? FieldRenderer.renderSide(primarySuggestion.side)
                : (primarySuggestion?.side ? `<span class="badge bg-info text-dark">${primarySuggestion.side}</span>` : '');

            const investmentType = primarySuggestion && FieldRenderer?.renderType
                ? FieldRenderer.renderType(primarySuggestion.investment_type)
                : (primarySuggestion?.investment_type ? `<span class="badge bg-light text-body">${primarySuggestion.investment_type}</span>` : '');

            const tradeDate = primarySuggestion && FieldRenderer?.renderDateShort
                ? FieldRenderer.renderDateShort(primarySuggestion.created_at)
                : (primarySuggestion && FieldRenderer?.renderDate ? FieldRenderer.renderDate(primarySuggestion.created_at, false) : (primarySuggestion?.created_at || '-'));
            const tradeClosedDate = primarySuggestion && FieldRenderer?.renderDateShort
                ? FieldRenderer.renderDateShort(primarySuggestion.closed_at)
                : (primarySuggestion && FieldRenderer?.renderDate ? FieldRenderer.renderDate(primarySuggestion.closed_at, false) : (primarySuggestion?.closed_at || ''));
            const tradeMatchReasons = Array.isArray(primarySuggestion?.match_reasons) ? primarySuggestion.match_reasons : [];
            const matchReasonsHtml = tradeMatchReasons.length
                ? `<ul class="list-unstyled mb-0 text-muted small">${tradeMatchReasons.map(reason => `<li class="d-flex align-items-center gap-1"><span class="badge bg-light text-body-secondary">•</span>${reason}</li>`).join('')}</ul>`
                : '';
            const secondarySuggestions = suggestions.slice(1, 4);
            const secondarySuggestionsHtml = secondarySuggestions.length
                ? `<div class="text-muted small">הצעות נוספות:</div><ul class="list-unstyled mb-0 text-muted small">${secondarySuggestions.map(item => {
                        const itemScore = this.normalizeScore(item?.score);
                        const itemDate = FieldRenderer?.renderDateShort ? FieldRenderer.renderDateShort(item?.created_at) : (item?.created_at || '-');
                        return `<li class="d-flex align-items-center gap-1"><span class="badge bg-body-secondary text-body">${itemScore ?? '-'}</span><span>#${item?.trade_id || '-'}</span><span class="text-muted">${itemDate}</span></li>`;
                    }).join('')}</ul>`
                : '';

            const scoreTooltip = 'טיקר תואם • חשבון מסחר תואם • תאריך בטווח הטרייד';
            const scoreBadge = typeof score === 'number'
                ? `<span class="badge entity-trade" data-tooltip="${scoreTooltip}" data-tooltip-placement="top" data-tooltip-trigger="hover">${score}</span>`
                : '';

            const additionalText = additionalSuggestions > 0
                ? `<span class="text-muted small">+${additionalSuggestions} הצעות נוספות</span>`
                : '';

            const itemIdAttr = execution.id ? `data-execution-id="${execution.id}"` : '';

            const topRow = `
                <div class="d-flex flex-column gap-1">
                    <div class="d-flex flex-wrap align-items-center gap-2">
                        ${actionSummaryInline}
                        <div class="d-flex align-items-center gap-1 ms-auto">
                            ${scoreBadge}
                            ${additionalText}
                            <div class="d-flex align-items-center gap-1 ms-1">
                                <button
                                    data-button-type="APPROVE"
                                    data-variant="small"
                                    data-classes="btn btn-sm btn-outline-success table-btn-small"
                                    data-text="אשר שיוך"
                                    data-onclick="PendingExecutionsHighlights.acceptSuggestion(${execution.id}, ${primarySuggestion?.trade_id || 'null'}, ${typeof score === 'number' ? score : 'null'})"
                                    ${primarySuggestion ? '' : 'disabled'}
                                ></button>
                                <button
                                    data-button-type="REJECT"
                                    data-variant="small"
                                    data-classes="btn btn-sm btn-outline-danger table-btn-small"
                                    data-text="דחה"
                                    data-onclick="PendingExecutionsHighlights.rejectSuggestion(${execution.id}, ${typeof score === 'number' ? score : 'null'})"
                                ></button>
                            </div>
                        </div>
                    </div>
                    ${sharedTickerRow}
                </div>
            `;

            const executionDetails = `
                <div class="col-12 col-md-6">
                    <div class="bg-body-tertiary rounded-3 p-3 d-flex flex-column gap-2 h-100 cursor-pointer" role="button" tabindex="0"
                        onclick="PendingExecutionsHighlights.openExecutionDetails(${execution.id})"
                        onkeypress="if(event.key==='Enter'){PendingExecutionsHighlights.openExecutionDetails(${execution.id});}">
                        <div class="fw-semibold text-muted">פרטי ביצוע</div>
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                            ${actionBadgeDetailed}
                        </div>
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                            ${quantityDisplay}
                            ${executionPrice}
                        </div>
                        <div class="text-muted small d-flex flex-wrap gap-2 align-items-center">
                            <span>${executionDate}</span>
                            ${executionSource ? `<span>${executionSource}</span>` : ''}
                        </div>
                        ${executionFee ? `<div class="text-muted small">עמלה: ${executionFee}</div>` : ''}
                        ${executionRealized ? `<div class="text-muted small">רווח/הפסד: ${executionRealized}</div>` : ''}
                        ${executionExternalId ? `<div class="text-muted small">מזהה חיצוני: ${executionExternalId}</div>` : ''}
                        ${executionNotes ? `<div class="text-muted small">הערות: ${executionNotes}</div>` : ''}
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
                                ${tradeStatus}
                            </div>
                            <div class="d-flex flex-wrap gap-2 align-items-center">
                                ${tradeSide}
                                ${investmentType}
                            </div>
                            <div class="text-muted small d-flex flex-wrap gap-2 align-items-center">
                                <span>נפתח: ${tradeDate}</span>
                                ${tradeClosedDate ? `<span>נסגר: ${tradeClosedDate}</span>` : ''}
                            </div>
                            ${matchReasonsHtml ? `<div class="mt-1">${matchReasonsHtml}</div>` : ''}
                            ${secondarySuggestionsHtml ? `<div class="mt-2">${secondarySuggestionsHtml}</div>` : ''}
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
                    <div class="pending-highlight-details">
                        <div class="row g-2 align-items-stretch">
                            ${executionDetails}
                            ${tradeDetails}
                        </div>
                    </div>
                </li>
            `;
        },

        setupHoverDetails() {
            if (!this.dom?.list) {
                return;
            }

            const items = this.dom.list.querySelectorAll('.pending-highlight-item');
            items.forEach(item => {
                if (item.dataset.hoverBound === 'true') {
                    return;
                }

                let hideTimer = null;

                const showDetails = () => {
                    if (hideTimer) {
                        clearTimeout(hideTimer);
                        hideTimer = null;
                    }
                    item.classList.add('is-hovered');
                };

                const hideDetails = () => {
                    if (hideTimer) {
                        clearTimeout(hideTimer);
                    }
                    hideTimer = window.setTimeout(() => {
                        item.classList.remove('is-hovered');
                        hideTimer = null;
                    }, 160);
                };

                item.addEventListener('mouseenter', showDetails);
                item.addEventListener('mouseleave', hideDetails);

                item.addEventListener('focusin', showDetails);
                item.addEventListener('focusout', (event) => {
                    if (!item.contains(event.relatedTarget)) {
                        hideDetails();
                    }
                });

                item.dataset.hoverBound = 'true';
            });
        },

        updateCountBadge() {
            if (!this.dom.count) {
                return;
            }
            const count = this.state.totalEligibleCount ?? 0;
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

        async acceptSuggestion(executionId, tradeId, score = null) {
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

                this.state.dismissed.add(executionId);
                this.removeExecutionFromState(executionId, score);
                await this.delay(250);
                this.fetchHighlights();
            } catch (error) {
                window.Logger?.error('❌ Failed to accept highlight suggestion', { error: error?.message, executionId, tradeId }, { page: 'index' });
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה בשיוך', error?.message || 'השיוך נכשל');
                }
            }
        },

        rejectSuggestion(executionId, score = null) {
            if (!executionId) {
                return;
            }

            window.Logger?.info('🚫 Highlight suggestion dismissed', { executionId }, { page: 'index' });
            this.state.dismissed.add(executionId);
            this.persistDismissedExecutionIds();
            this.removeExecutionFromState(executionId, score);
        },

        removeExecutionFromState(executionId, score = null) {
            const normalizedScore = this.normalizeScore(score);
            this.state.items = this.state.items.filter(item => item.execution_id !== executionId);
            if (typeof normalizedScore === 'number' && normalizedScore >= 50 && this.state.totalEligibleCount > 0) {
                this.state.totalEligibleCount = Math.max(0, this.state.totalEligibleCount - 1);
            }
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
        },

        getBestScore(highlight) {
            if (!highlight) {
                return null;
            }
            if (highlight.best_score !== undefined && highlight.best_score !== null) {
                return this.normalizeScore(highlight.best_score);
            }
            const primary = highlight.primary_suggestion;
            if (primary && primary.score !== undefined && primary.score !== null) {
                return this.normalizeScore(primary.score);
            }
            const suggestions = Array.isArray(highlight.suggestions) ? highlight.suggestions : [];
            return suggestions.length ? this.normalizeScore(suggestions[0]?.score) : null;
        },

        delay(ms) {
            return new Promise(resolve => window.setTimeout(resolve, ms));
        },

        normalizeScore(value) {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            if (typeof value === 'number') {
                return Number.isFinite(value) ? value : null;
            }
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : null;
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

