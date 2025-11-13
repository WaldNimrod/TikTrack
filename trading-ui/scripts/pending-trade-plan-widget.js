/**
 * Trade Plan Suggestions Widget
 * =============================
 * ווידג'ט דף הבית לניהול טריידים ללא תוכנית מסחר:
 * - הצעות לשיוך טרייד לתוכנית קיימת
 * - הצעות ליצירת תוכנית חדשה מתוך טרייד
 *
 * נשען על מערכות כלליות קיימות: FieldRendererService, ButtonSystem,
 * ModalManagerV2, UnifiedCacheManager, CacheSyncManager ו-NotificationSystem.
 *
 * Function Index:
 * ---------------
 * INIT & STATE
 * - init()
 * - ensureCardExists()
 * - cacheDom()
 * - loadDismissedItems()
 * - persistDismissedItems()
 * - startAutoRefresh()
 * - stopAutoRefresh()
 *
 * DATA FLOW
 * - fetchData(options)
 * - fetchAssignments(limit)
 * - fetchCreations(limit, assignmentIndex)
 *
 * RENDERING
 * - render()
 * - renderAssignments(list)
 * - renderAssignmentItem(item)
 * - renderCreations(list)
 * - renderCreationItem(item)
 *
 * ACTIONS
 * - handleAssignButton(tradeId, planId)
 * - handleCreateButton(tradeId)
 * - handleDismissAssignment(tradeId, planId)
 * - handleDismissCreation(tradeId)
 * - assignTradeToPlan(tradeId, planId)
 * - openPlanCreationModal(tradeId)
 * - preparePlanModal(tradeId, prefill)
 * - dismissSuggestion(key)
 *
 * HELPERS
 * - normalizeScore(value)
 * - formatDate(value)
 * - formatQuantity(value)
 * - getDismissKey(kind, tradeId, planId)
 * - updateCounts()
 * - setLoading(isLoading)
 * - showError(message)
 * - hideError()
 * - showEmptyState()
 * - hideEmptyState()
 * - refreshSoon(delay)
 * - clearCachesAfterLink()
 */

(function () {
    const ASSIGNMENTS_ENDPOINT = '/api/trades/pending-plan/assignments';
    const CREATIONS_ENDPOINT = '/api/trades/pending-plan/creations';
    const LINK_ENDPOINT = (tradeId) => `/api/trades/${tradeId}/link-plan`;

    const DISMISSED_CACHE_KEY = 'pending-trade-plan-widget-dismissed';
    const DISMISSED_TTL_SECONDS = 3600;
    const AUTO_REFRESH_INTERVAL = 60000;

    const SELECTORS = {
        card: '#pendingTradePlanWidgetCard',
        loading: '#pendingTradePlanWidgetLoading',
        error: '#pendingTradePlanWidgetError',
        empty: '#pendingTradePlanWidgetEmpty',
        count: '#pendingTradePlanWidgetCount',
        assignmentsSection: '#pendingTradePlanAssignmentsSection',
        assignmentsList: '#pendingTradePlanAssignmentsList',
        assignmentsCount: '#pendingTradePlanAssignmentsCount',
        creationsSection: '#pendingTradePlanCreationsSection',
        creationsList: '#pendingTradePlanCreationsList',
        creationsCount: '#pendingTradePlanCreationsCount',
        divider: '#pendingTradePlanDivider'
    };

    const PendingTradePlanWidget = {
        state: {
            assignments: [],
            creations: [],
            dismissed: new Set(),
            isLoading: false,
            autoRefreshTimer: null
        },

        init() {
            this.ensureCardExists();
            this.cacheDom();
            if (!this.dom.card) {
                window.Logger?.warn('⚠️ Trade plan widget card not found', { page: 'index' });
                return;
            }

            this.loadDismissedItems();
            this.bindEvents();
            this.fetchData({ initial: true });
            this.startAutoRefresh();

            window.Logger?.info('🧭 Trade plan widget initialized', { page: 'index' });
        },

        ensureCardExists() {
            if (document.querySelector(SELECTORS.card)) {
                return;
            }

            const rowContainer = document.querySelector('#main .section-body .row');
            if (!rowContainer) {
                return;
            }

            const column = document.createElement('div');
            column.className = 'col-12 col-lg-6 col-xl-4';
            column.innerHTML = `
                <div class="card h-100" id="pendingTradePlanWidgetCard">
                    <div class="card-header d-flex align-items-center justify-content-between gap-2">
                        <h5 class="mb-0">
                            <a href="trades.html"
                                class="d-inline-flex align-items-center gap-2 widget-title-link"
                                data-onclick="navigateToPage('trades', { preserveState: true })">
                                <img src="images/icons/trade_plans.svg" alt="תוכניות מסחר" width="20" height="20">
                                <span>שיוך תוכניות למסחר</span>
                            </a>
                        </h5>
                        <span class="badge entity-trade" id="pendingTradePlanWidgetCount">0</span>
                    </div>
                    <div class="card-body d-flex flex-column gap-3">
                        <div id="pendingTradePlanWidgetLoading" class="d-flex align-items-center justify-content-center text-muted small">
                            <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                            <span>טוען הצעות לתוכניות...</span>
                        </div>
                        <div id="pendingTradePlanWidgetError" class="alert alert-danger d-none" role="alert"></div>
                        <div id="pendingTradePlanWidgetEmpty" class="alert alert-success d-none" role="status">
                            כל הטריידים מלווים בתוכנית מתאימה. עבודה מצוינת!
                        </div>
                        <div class="d-flex flex-column gap-2 widget-section" id="pendingTradePlanAssignmentsSection">
                            <div class="d-flex align-items-center justify-content-between">
                                <h6 class="mb-0 text-muted">שיוך לתוכנית קיימת</h6>
                                <span class="badge bg-body-secondary text-body" id="pendingTradePlanAssignmentsCount">0</span>
                            </div>
                            <ul class="list-group list-group-flush" id="pendingTradePlanAssignmentsList"></ul>
                        </div>
                        <hr class="my-1 d-none" id="pendingTradePlanDivider">
                        <div class="d-flex flex-column gap-2 widget-section" id="pendingTradePlanCreationsSection">
                            <div class="d-flex align-items-center justify-content-between">
                                <h6 class="mb-0 text-muted">יצירת תוכנית חדשה</h6>
                                <span class="badge bg-body-secondary text-body" id="pendingTradePlanCreationsCount">0</span>
                            </div>
                            <ul class="list-group list-group-flush" id="pendingTradePlanCreationsList"></ul>
                        </div>
                    </div>
                </div>
            `;

            rowContainer.prepend(column);
        },

        cacheDom() {
            this.dom = {
                card: document.querySelector(SELECTORS.card),
                loading: document.querySelector(SELECTORS.loading),
                error: document.querySelector(SELECTORS.error),
                empty: document.querySelector(SELECTORS.empty),
                count: document.querySelector(SELECTORS.count),
                assignmentsSection: document.querySelector(SELECTORS.assignmentsSection),
                assignmentsList: document.querySelector(SELECTORS.assignmentsList),
                assignmentsCount: document.querySelector(SELECTORS.assignmentsCount),
                creationsSection: document.querySelector(SELECTORS.creationsSection),
                creationsList: document.querySelector(SELECTORS.creationsList),
                creationsCount: document.querySelector(SELECTORS.creationsCount),
                divider: document.querySelector(SELECTORS.divider)
            };
        },

        bindEvents() {
            if (this.dom?.assignmentsList) {
                this.dom.assignmentsList.addEventListener('click', (event) => this.handleListClick(event, 'assignment'));
            }
            if (this.dom?.creationsList) {
                this.dom.creationsList.addEventListener('click', (event) => this.handleListClick(event, 'creation'));
            }
        },

        handleListClick(event, kind) {
            const actionButton = event.target.closest('[data-role]');
            if (!actionButton) {
                return;
            }

            const role = actionButton.dataset.role;
            const tradeId = Number(actionButton.dataset.tradeId);
            const planId = actionButton.dataset.planId ? Number(actionButton.dataset.planId) : null;

            if (!tradeId) {
                return;
            }

            if (role === 'assign-plan' && planId) {
                this.assignTradeToPlan(tradeId, planId);
                return;
            }

            if (role === 'create-plan') {
                this.openPlanCreationModal(tradeId);
                return;
            }

            if (role === 'dismiss-suggestion') {
                const dismissKey = this.getDismissKey(kind, tradeId, planId);
                this.dismissSuggestion(dismissKey);
            }
        },

        loadDismissedItems() {
            try {
                const cached = window.UnifiedCacheManager?.get?.(DISMISSED_CACHE_KEY);
                if (Array.isArray(cached)) {
                    this.state.dismissed = new Set(cached);
                }
            } catch (error) {
                window.Logger?.warn('⚠️ Failed to load dismissed trade plan suggestions', { error: error?.message }, { page: 'index' });
            }
        },

        persistDismissedItems() {
            try {
                window.UnifiedCacheManager?.set?.(
                    DISMISSED_CACHE_KEY,
                    Array.from(this.state.dismissed),
                    { ttl: DISMISSED_TTL_SECONDS }
                );
            } catch (error) {
                window.Logger?.warn('⚠️ Failed to persist dismissed trade plan suggestions', { error: error?.message }, { page: 'index' });
            }
        },

        startAutoRefresh() {
            this.stopAutoRefresh();
            this.state.autoRefreshTimer = window.setInterval(() => {
                this.fetchData();
            }, AUTO_REFRESH_INTERVAL);
        },

        stopAutoRefresh() {
            if (this.state.autoRefreshTimer) {
                window.clearInterval(this.state.autoRefreshTimer);
                this.state.autoRefreshTimer = null;
            }
        },

        async fetchData(options = {}) {
            if (this.state.isLoading && !options.force) {
                return;
            }

            this.setLoading(true);
            this.hideError();

            try {
                const limitParam = options.limit ?? undefined;
                const [assignments, assignmentIndex] = await this.fetchAssignments(limitParam);
                const creations = await this.fetchCreations(limitParam, assignmentIndex);

                this.state.assignments = assignments;
                this.state.creations = creations;

                this.render();
            } catch (error) {
                const message = error?.message || 'שגיאה בלתי צפויה בטעינת ההצעות';
                this.showError(message);
                window.Logger?.error('❌ Failed to load trade plan suggestions', { error: error?.message }, { page: 'index' });
            } finally {
                this.setLoading(false);
            }
        },

        async fetchAssignments(limit) {
            const params = new URLSearchParams();
            if (Number.isFinite(limit)) {
                params.set('limit', String(limit));
            }
            params.set('suggestions', '3');
            params.set('_t', Date.now().toString());

            const response = await fetch(`${ASSIGNMENTS_ENDPOINT}?${params.toString()}`, {
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const payload = await response.json();
            if (payload.status !== 'success') {
                throw new Error(payload?.error?.message || 'API error');
            }

            const data = Array.isArray(payload.data) ? payload.data : [];

            const filtered = data.filter(item => {
                const dismissKey = this.getDismissKey('assignment', item.trade_id, item?.primary_suggestion?.trade_plan_id);
                return !this.state.dismissed.has(dismissKey);
            });

            const assignmentIndex = {};
            data.forEach(item => {
                assignmentIndex[item.trade_id] = item.best_score ?? null;
            });

            return [filtered, assignmentIndex];
        },

        async fetchCreations(limit, assignmentIndex) {
            const params = new URLSearchParams();
            if (Number.isFinite(limit)) {
                params.set('limit', String(limit));
            }
            params.set('_t', Date.now().toString());

            const response = await fetch(`${CREATIONS_ENDPOINT}?${params.toString()}`, {
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const payload = await response.json();
            if (payload.status !== 'success') {
                throw new Error(payload?.error?.message || 'API error');
            }

            const data = Array.isArray(payload.data) ? payload.data : [];

            const filtered = data.filter(item => {
                const dismissKey = this.getDismissKey('creation', item.trade_id);
                return !this.state.dismissed.has(dismissKey);
            }).map(item => ({
                ...item,
                has_assignment_suggestion: assignmentIndex[item.trade_id] != null
            }));

            return filtered;
        },

        render() {
            this.updateCounts();

            const hasAssignments = this.state.assignments.length > 0;
            const hasCreations = this.state.creations.length > 0;
            if (!hasAssignments && !hasCreations) {
                this.showEmptyState();
            } else {
                this.hideEmptyState();
            }

            if (this.dom.assignmentsSection) {
                this.dom.assignmentsSection.classList.toggle('d-none', !hasAssignments);
            }
            if (this.dom.creationsSection) {
                this.dom.creationsSection.classList.toggle('d-none', !hasCreations);
            }
            if (this.dom.divider) {
                this.dom.divider.classList.toggle('d-none', !(hasAssignments && hasCreations));
            }

            this.renderAssignments(this.state.assignments);
            this.renderCreations(this.state.creations);

            if (window.ButtonSystem?.initializeButtons) {
                window.ButtonSystem.initializeButtons(this.dom.card);
            } else if (window.initializeButtons) {
                window.initializeButtons(this.dom.card);
            }
        },

        renderAssignments(items) {
            if (!this.dom.assignmentsList) {
                return;
            }
            if (!items?.length) {
                this.dom.assignmentsList.innerHTML = '';
                return;
            }
            const html = items.map(item => this.renderAssignmentItem(item)).join('');
            this.dom.assignmentsList.innerHTML = html;
        },

        renderAssignmentItem(item) {
            const trade = item.trade || {};
            const suggestion = item.primary_suggestion || {};
            const plan = suggestion.plan || {};
            const score = this.normalizeScore(item.best_score ?? suggestion.score);

            const FieldRenderer = window.FieldRendererService;
            const tradeTitle = FieldRenderer?.renderLinkedEntity?.('trade', trade.id, trade.ticker_symbol || `טרייד #${trade.id}`, { short: true })
                || `<span class="fw-semibold">${trade.ticker_symbol || `טרייד #${trade.id}`}</span>`;
            const accountBadge = FieldRenderer?.renderLinkedEntity?.('trading_account', trade.trading_account_id, trade.account_name, { short: true })
                || (trade.account_name ? `<span class="badge bg-body-secondary text-body">${trade.account_name}</span>` : '');

            const planBadge = FieldRenderer?.renderLinkedEntity?.('trade_plan', plan.id, plan.ticker_symbol ? `${plan.ticker_symbol} • ${plan.status || ''}` : `תכנון #${plan.id}`, { short: true })
                || (plan.id ? `<span class="badge bg-body-secondary text-body">תכנון #${plan.id}</span>` : '<span class="text-muted small">תוכנית לא ידועה</span>');

            const statusBadge = FieldRenderer?.renderStatus?.(plan.status, 'trade_plan') || '';
            const sideBadge = FieldRenderer?.renderSide?.(trade.side) || '';
            const scoreBadge = typeof score === 'number'
                ? `<span class="badge entity-trade" data-tooltip="מדד התאמה (טיקר, חשבון, תאריך)"> ${score} </span>`
                : '';

            const reasons = Array.isArray(suggestion.match_reasons) ? suggestion.match_reasons : [];
            const reasonsList = reasons.length
                ? `<ul class="list-unstyled mb-0 text-muted small">
                        ${reasons.map(reason => `<li class="d-flex align-items-center gap-1"><span class="badge bg-body-secondary text-body">•</span>${reason}</li>`).join('')}
                   </ul>`
                : '';

            const createdAt = this.formatDate(trade.created_at);

            return `
                <li class="list-group-item d-flex flex-column gap-2" data-trade-id="${trade.id}">
                    <div class="d-flex align-items-start gap-2">
                        <div class="flex-grow-1">
                            <div class="d-flex flex-wrap align-items-center gap-2">
                                ${tradeTitle}
                                ${accountBadge || ''}
                                ${sideBadge || ''}
                                <span class="text-muted small">${createdAt}</span>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            ${scoreBadge}
                            <button
                                data-button-type="APPROVE"
                                data-variant="small"
                                data-role="assign-plan"
                                data-trade-id="${trade.id}"
                                data-plan-id="${plan.id}"
                                data-text="שייך"
                                data-onclick="PendingTradePlanWidget.handleAssignButton(${trade.id}, ${plan.id})"
                                title="שיוך לתוכנית קיימת">
                            </button>
                            <button
                                data-button-type="REJECT"
                                data-variant="small"
                                data-role="dismiss-suggestion"
                                data-trade-id="${trade.id}"
                                data-plan-id="${plan.id}"
                                data-text="דחה"
                                data-onclick="PendingTradePlanWidget.handleDismissAssignment(${trade.id}, ${plan.id})"
                                title="הסתר הצעה זו">
                            </button>
                        </div>
                    </div>
                    <div class="bg-body-tertiary rounded-3 p-3 d-flex flex-column gap-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="text-muted small fw-semibold">תוכנית מומלצת:</span>
                            ${planBadge}
                            ${statusBadge || ''}
                        </div>
                        ${reasonsList}
                    </div>
                </li>
            `;
        },

        renderCreations(items) {
            if (!this.dom.creationsList) {
                return;
            }
            if (!items?.length) {
                this.dom.creationsList.innerHTML = '';
                return;
            }
            const html = items.map(item => this.renderCreationItem(item)).join('');
            this.dom.creationsList.innerHTML = html;
        },

        renderCreationItem(item) {
            const trade = item.trade || {};
            const metrics = item.metrics || {};
            const prefill = item.prefill || {};
            const score = this.normalizeScore(item.score);
            const FieldRenderer = window.FieldRendererService;

            const tradeTitle = FieldRenderer?.renderLinkedEntity?.('trade', trade.id, trade.ticker_symbol || `טרייד #${trade.id}`, { short: true })
                || `<span class="fw-semibold">${trade.ticker_symbol || `טרייד #${trade.id}`}</span>`;
            const accountBadge = FieldRenderer?.renderLinkedEntity?.('trading_account', trade.trading_account_id, trade.account_name, { short: true })
                || (trade.account_name ? `<span class="badge bg-body-secondary text-body">${trade.account_name}</span>` : '');
            const sideBadge = FieldRenderer?.renderSide?.(trade.side) || '';
            const createdAt = this.formatDate(trade.created_at);
            const quantity = this.formatQuantity(metrics.net_quantity ?? metrics.buy_quantity);
            const amount = typeof prefill.planned_amount === 'number'
                ? FieldRenderer?.renderAmount?.(prefill.planned_amount, '$', 2, false)
                : null;

            const assignmentNotice = item.has_assignment_suggestion
                ? `<div class="alert alert-warning py-2 px-3 mb-0 text-muted small">
                        טרייד זה קיבל גם הצעת שיוך לתוכנית קיימת (הוצג בעדיפות נמוכה ביצירת תוכנית).
                   </div>`
                : '';

            const scoreBadge = typeof score === 'number'
                ? `<span class="badge bg-body-secondary text-body" data-tooltip="מדד עדיפות ליצירת תוכנית חדשה">${score}</span>`
                : '';

            return `
                <li class="list-group-item d-flex flex-column gap-2" data-trade-id="${trade.id}">
                    <div class="d-flex align-items-start gap-2">
                        <div class="flex-grow-1">
                            <div class="d-flex flex-wrap align-items-center gap-2">
                                ${tradeTitle}
                                ${accountBadge || ''}
                                ${sideBadge || ''}
                                <span class="text-muted small">${createdAt}</span>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            ${scoreBadge}
                            <button
                                data-button-type="ADD"
                                data-variant="small"
                                data-role="create-plan"
                                data-trade-id="${trade.id}"
                                data-text="פתח תוכנית"
                                data-onclick="PendingTradePlanWidget.handleCreateButton(${trade.id})"
                                title="יצירת תוכנית חדשה">
                            </button>
                            <button
                                data-button-type="REJECT"
                                data-variant="small"
                                data-role="dismiss-suggestion"
                                data-trade-id="${trade.id}"
                                data-text="דחה"
                                data-onclick="PendingTradePlanWidget.handleDismissCreation(${trade.id})"
                                title="הסתר הצעה זו">
                            </button>
                        </div>
                    </div>
                    <div class="bg-body-tertiary rounded-3 p-3 d-flex flex-column gap-2">
                        <div class="d-flex flex-wrap align-items-center gap-2 text-muted small">
                            <span>כמות מוצעת: ${quantity}</span>
                            <span>•</span>
                            <span>סכום מתוכנן: ${amount || '-'} </span>
                            <span>•</span>
                            <span>תאריך כניסה: ${this.formatDate(prefill.entry_date)}</span>
                        </div>
                        ${assignmentNotice}
                    </div>
                </li>
            `;
        },

        handleAssignButton(tradeId, planId) {
            const numericTradeId = Number(tradeId);
            const numericPlanId = Number(planId);
            if (!Number.isFinite(numericTradeId) || !Number.isFinite(numericPlanId)) {
                window.Logger?.warn('⚠️ Invalid identifiers for handleAssignButton', { tradeId, planId }, { page: 'index' });
                return;
            }
            this.assignTradeToPlan(numericTradeId, numericPlanId);
        },

        handleCreateButton(tradeId) {
            const numericTradeId = Number(tradeId);
            if (!Number.isFinite(numericTradeId)) {
                window.Logger?.warn('⚠️ Invalid tradeId for handleCreateButton', { tradeId }, { page: 'index' });
                return;
            }
            this.openPlanCreationModal(numericTradeId);
        },

        handleDismissAssignment(tradeId, planId) {
            const numericTradeId = Number(tradeId);
            const numericPlanId = Number(planId);
            if (!Number.isFinite(numericTradeId)) {
                return;
            }
            const dismissKey = this.getDismissKey('assignment', numericTradeId, Number.isFinite(numericPlanId) ? numericPlanId : null);
            this.dismissSuggestion(dismissKey);
        },

        handleDismissCreation(tradeId) {
            const numericTradeId = Number(tradeId);
            if (!Number.isFinite(numericTradeId)) {
                return;
            }
            const dismissKey = this.getDismissKey('creation', numericTradeId);
            this.dismissSuggestion(dismissKey);
        },

        async assignTradeToPlan(tradeId, planId) {
            if (!tradeId || !planId) {
                return;
            }

            try {
                window.Logger?.info('🔗 Linking trade to plan', { tradeId, planId }, { page: 'index' });

                const response = await fetch(LINK_ENDPOINT(tradeId), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trade_plan_id: planId })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData?.error?.message || 'שיוך לתוכנית נכשל');
                }

                const payload = await response.json().catch(() => null);
                if (!payload || payload.status !== 'success') {
                    throw new Error(payload?.error?.message || 'שיוך לתוכנית נכשל');
                }

                await this.clearCachesAfterLink();

                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('שיוך הושלם', `טרייד #${tradeId} שויך לתוכנית #${planId}`);
                }

                const dismissKey = this.getDismissKey('assignment', tradeId, planId);
                this.state.dismissed.add(dismissKey);
                this.persistDismissedItems();

                this.refreshSoon();
            } catch (error) {
                window.Logger?.error('❌ Failed to link trade to plan', { tradeId, planId, error: error?.message }, { page: 'index' });
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה בשיוך תוכנית', error?.message || 'שיוך התוכנית נכשל');
                }
            }
        },

        async openPlanCreationModal(tradeId) {
            const creation = this.state.creations.find(item => item.trade_id === tradeId);
            if (!creation) {
                return;
            }

            const ensureDependencies = window.PendingExecutionTradeCreation?.ensureTradeModalDependencies
                || window.ensureTradeModalDependencies;

            try {
                if (typeof ensureDependencies === 'function') {
                    await ensureDependencies.call(window.PendingExecutionTradeCreation || null);
                }
            } catch (error) {
                window.Logger?.error('❌ Failed to load trade plan modal dependencies', { error: error?.message }, { page: 'index' });
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה בטעינת מודל תוכניות', error?.message || 'לא ניתן לפתוח את מודל התוכנית כעת');
                }
                return;
            }

            try {
                await window.ModalManagerV2?.showModal('tradePlansModal', 'add');
                await this.preparePlanModal(tradeId, creation.prefill || {});
            } catch (error) {
                window.Logger?.error('❌ Failed to open trade plan modal', { error: error?.message }, { page: 'index' });
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה בפתיחת מודל תוכנית', error?.message || 'לא ניתן לפתוח את מודל התוכנית');
                }
            }
        },

        async preparePlanModal(tradeId, prefill) {
            const modalInfo = window.ModalManagerV2?.getModalInfo?.('tradePlansModal');
            const modalElement = modalInfo?.element;
            if (!modalElement) {
                return;
            }

            const form = modalElement.querySelector('form');
            if (form) {
                form.dataset.tradePlanSource = 'dashboard-widget';
                form.dataset.sourceTradeId = String(tradeId);
            }

            const populatePayload = {
                tradePlanTicker: prefill.ticker_id ?? null,
                tradePlanAccount: prefill.trading_account_id ?? null,
                tradePlanSide: prefill.side ?? 'long',
                tradePlanType: prefill.investment_type ?? 'swing',
                tradePlanEntryPrice: prefill.entry_price ?? null,
                tradePlanEntryDate: this.formatDateForInput(prefill.entry_date),
                tradePlanQuantity: prefill.quantity ?? null,
                planAmount: prefill.planned_amount ?? null,
                tradePlanNotes: prefill.notes ?? ''
            };

            const tickerSelect = modalElement.querySelector('#tradePlanTicker');
            if (tickerSelect && window.SelectPopulatorService?.populateTickersSelect) {
                try {
                    await window.SelectPopulatorService.populateTickersSelect(tickerSelect, {
                        defaultValue: populatePayload.tradePlanTicker,
                        includeEmpty: false
                    });
                } catch (error) {
                    window.Logger?.warn('⚠️ populateTickersSelect failed for trade plan modal', { error: error?.message }, { page: 'index' });
                }
            }

            const accountSelect = modalElement.querySelector('#tradePlanAccount');
            if (accountSelect && window.SelectPopulatorService?.populateAccountsSelect) {
                try {
                    await window.SelectPopulatorService.populateAccountsSelect(accountSelect, {
                        defaultValue: populatePayload.tradePlanAccount,
                        defaultFromPreferences: true,
                        includeEmpty: false
                    });
                } catch (error) {
                    window.Logger?.warn('⚠️ populateAccountsSelect failed for trade plan modal', { error: error?.message }, { page: 'index' });
                }
            }

            await window.ModalManagerV2?.populateForm?.(modalElement, populatePayload);

            if (populatePayload.tradePlanTicker && typeof window.loadTradePlanTickerInfo === 'function') {
                try {
                    await window.loadTradePlanTickerInfo(populatePayload.tradePlanTicker);
                } catch (error) {
                    window.Logger?.warn('⚠️ loadTradePlanTickerInfo failed', { error: error?.message, tickerId: populatePayload.tradePlanTicker }, { page: 'index' });
                }
            }

            if (typeof window.applyTradePlanDefaultRiskLevels === 'function') {
                window.applyTradePlanDefaultRiskLevels({ force: true, modalElement });
            }
        },

        dismissSuggestion(dismissKey) {
            if (!dismissKey) {
                return;
            }
            this.state.dismissed.add(dismissKey);
            this.persistDismissedItems();
            this.state.assignments = this.state.assignments.filter(item => this.getDismissKey('assignment', item.trade_id, item?.primary_suggestion?.plan?.id) !== dismissKey);
            this.state.creations = this.state.creations.filter(item => this.getDismissKey('creation', item.trade_id) !== dismissKey);
            this.render();
        },

        refreshSoon(delay = 350) {
            window.setTimeout(() => {
                this.fetchData({ force: true });
            }, delay);
        },

        async clearCachesAfterLink() {
            const cacheKeys = [
                'trades',
                'trade-data',
                'trades-data',
                'dashboard',
                'dashboard-data',
                'pending-trade-plan-assignments',
                'pending-trade-plan-creations'
            ];

            if (window.CacheSyncManager?.invalidateByAction) {
                try {
                    await window.CacheSyncManager.invalidateByAction('trade-plan-linked');
                } catch (error) {
                    window.Logger?.warn('⚠️ CacheSyncManager.invalidateByAction failed', { error: error?.message }, { page: 'index' });
                }
            }

            if (window.UnifiedCacheManager?.remove) {
                await Promise.allSettled(cacheKeys.map(async (key) => {
                    try {
                        await window.UnifiedCacheManager.remove(key);
                    } catch (error) {
                        window.Logger?.warn('⚠️ UnifiedCacheManager.remove failed', { key, error: error?.message }, { page: 'index' });
                    }
                }));
            }

            if (window.dashboardDataState) {
                window.dashboardDataState.lastLoadedAt = null;
                window.dashboardDataState.source = null;
            }

            if (!this.state.pendingHardReload) {
                const delayMs = 1500;

                if (window.notificationSystem?.showNotification) {
                    window.notificationSystem.showNotification(
                        'העמוד ירוענן כדי להציג נתונים מעודכנים.',
                        'info',
                        'ריענון קשיח',
                        delayMs + 1000,
                        'system'
                    );
                } else if (typeof window.showInfoNotification === 'function') {
                    window.showInfoNotification('ריענון קשיח', 'העמוד ירוענן כדי להציג נתונים מעודכנים.');
                } else if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('ריענון קשיח', 'העמוד ירוענן כדי להציג נתונים מעודכנים.');
                }

                this.state.pendingHardReload = window.setTimeout(() => {
                    this.state.pendingHardReload = null;
                    try {
                        if (typeof window.hardReload === 'function') {
                            window.hardReload();
                        } else {
                            window.location.reload();
                        }
                    } catch (error) {
                        window.Logger?.error('❌ Hard reload after trade-plan link failed', { error: error?.message }, { page: 'index' });
                        window.location.reload();
                    }
                }, delayMs);
            }
        },

        updateCounts() {
            const assignmentsCount = this.state.assignments.length;
            const creationsCount = this.state.creations.length;
            const totalCount = assignmentsCount + creationsCount;

            if (this.dom.count) {
                this.dom.count.textContent = String(totalCount);
                this.dom.count.classList.toggle('bg-success', totalCount === 0);
                this.dom.count.classList.toggle('entity-trade', totalCount > 0);
            }
            if (this.dom.assignmentsCount) {
                this.dom.assignmentsCount.textContent = String(assignmentsCount);
            }
            if (this.dom.creationsCount) {
                this.dom.creationsCount.textContent = String(creationsCount);
            }
        },

        setLoading(isLoading) {
            this.state.isLoading = isLoading;
            if (this.dom.loading) {
                this.dom.loading.classList.toggle('d-none', !isLoading);
            }
        },

        showError(message) {
            if (this.dom.error) {
                this.dom.error.textContent = message;
                this.dom.error.classList.remove('d-none');
            }
            if (this.dom.count) {
                this.dom.count.textContent = '!';
                this.dom.count.classList.remove('entity-trade', 'bg-success');
                this.dom.count.classList.add('bg-danger');
            }
        },

        hideError() {
            if (this.dom.error) {
                this.dom.error.classList.add('d-none');
                this.dom.error.textContent = '';
            }
        },

        showEmptyState() {
            if (this.dom.empty) {
                this.dom.empty.classList.remove('d-none');
            }
        },

        hideEmptyState() {
            if (this.dom.empty) {
                this.dom.empty.classList.add('d-none');
            }
        },

        normalizeScore(value) {
            if (value === null || value === undefined) {
                return null;
            }
            if (typeof value === 'number') {
                return Number.isFinite(value) ? Math.round(value) : null;
            }
            const parsed = Number(value);
            return Number.isFinite(parsed) ? Math.round(parsed) : null;
        },

        formatDate(value) {
            if (!value) {
                return '-';
            }
            const FieldRenderer = window.FieldRendererService;
            return FieldRenderer?.renderDateShort?.(value)
                || FieldRenderer?.renderDate?.(value, false)
                || value;
        },

        formatDateForInput(value) {
            if (window.PendingExecutionTradeCreation?.formatDateForInput) {
                return window.PendingExecutionTradeCreation.formatDateForInput(value);
            }
            if (!value) {
                return '';
            }
            try {
                const date = new Date(value);
                if (Number.isNaN(date.getTime())) {
                    return '';
                }
                const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                return local.toISOString().slice(0, 16);
            } catch (error) {
                return '';
            }
        },

        formatQuantity(value) {
            if (value === null || value === undefined) {
                return '-';
            }
            if (window.FieldRendererService?.renderShares) {
                return window.FieldRendererService.renderShares(value);
            }
            return Number(value).toLocaleString('he-IL');
        },

        getDismissKey(kind, tradeId, planId = null) {
            if (!tradeId) {
                return null;
            }
            if (kind === 'assignment') {
                return `assignment-${tradeId}-${planId || 'none'}`;
            }
            if (kind === 'creation') {
                return `creation-${tradeId}`;
            }
            return null;
        }
    };

    window.PendingTradePlanWidget = PendingTradePlanWidget;
    window.refreshPendingTradePlanWidget = () => {
        PendingTradePlanWidget.fetchData({ force: true });
    };
    window.initializePendingTradePlanWidget = () => {
        PendingTradePlanWidget.init();
    };

    window.Logger?.info('🧭 Trade plan widget script loaded', { page: 'index' });
})();


