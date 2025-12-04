/**
 * Unified Pending Actions Widget - TikTrack Dashboard
 * ====================================================
 * 
 * Unified widget that uses shared services for data fetching and rendering.
 * 
 * This widget unifies 3 existing widgets with nested tabs:
 * - Action Type: "שיוך" (Assign) / "יצירת חדש" (Create)
 * - Entity Type: "תוכניות" (Plans) / "טריידים" (Trades)
 * 
 * Uses shared services:
 * - ExecutionClusteringService (Create → Trades) - For execution clusters
 * - ExecutionAssignmentService (Assign → Trades) - For execution assignment highlights
 * - TradePlanAssignmentService (Assign/Create → Plans) - For trade plan assignments/creations
 * - ExecutionClusterHelpers (Rendering helpers) - For rendering cluster items
 * - PendingActionsCacheService - For dismissed items cache
 * - ButtonSystem - For button processing
 * - Logger - For logging
 * 
 * API:
 * - init(containerId, config) - Initialize widget
 * - render() - Render current active combination
 * - refresh() - Refresh all data
 * - destroy() - Cleanup widget
 * 
 * Configuration:
 * - defaultItemsLimit: number - Default limit for items per combination (default: 4)
 * - defaultAction: 'assign' | 'create' - Default active action tab (default: 'assign')
 * - defaultEntity: 'plans' | 'trades' - Default active entity tab (default: 'plans')
 * 
 * Note: This widget currently uses fallback to old widgets for rendering some combinations.
 * Future work: Complete migration to use only services and ExecutionClusterHelpers.
 * 
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/UNIFIED_PENDING_ACTIONS_WIDGET_DEVELOPER_GUIDE.md
 */

;(function () {
  'use strict';

  // ===== Constants =====
  const CONTAINER_ID = 'unifiedPendingActionsWidgetContainer';
  
  // Default configuration
  const DEFAULT_CONFIG = {
    defaultItemsLimit: 4,
    defaultAction: 'assign',
    defaultEntity: 'plans'
  };

  // ===== State =====
  const state = {
    initialized: false,
    activeAction: 'assign', // 'assign' | 'create'
    activeEntity: 'plans',  // 'plans' | 'trades'
    config: { ...DEFAULT_CONFIG },
    dataCache: {}, // Cache for combination data to avoid multiple fetches
    overlaySetup: {} // Track which lists have overlay setup
  };

  // ===== DOM Elements Cache =====
  const elements = {
    container: null,
    title: null,
    badge: null,
    actionTabs: null,
    actionTabAssign: null,
    actionTabCreate: null,
    entityTabs: null,
    entityTabPlans: null,
    entityTabTrades: null,
    paneAssignPlans: null,
    paneAssignTrades: null,
    paneCreatePlans: null,
    paneCreateTrades: null,
    loading: {},
    error: {},
    empty: {},
    list: {},
    count: {},
    generalMessage: null // For showing general message when all tabs are empty
  };

  // ===== Helper Functions =====
  
  /**
   * Get combination key from action and entity
   */
  function getCombinationKey(action, entity) {
    return `${action}${entity.charAt(0).toUpperCase() + entity.slice(1)}`;
  }
  
  /**
   * Setup overlay hover for a list element (only once per list)
   * @param {HTMLElement} listElement - The list element to setup overlay for
   * @param {string} combination - Combination key for tracking
   */
  function setupOverlayForList(listElement, combination) {
    if (!window.WidgetOverlayService || !listElement || state.overlaySetup[combination]) {
      return;
    }
    
    // Destroy existing handlers first to prevent duplicates
    window.WidgetOverlayService.destroy(listElement);
    
    // Setup immediately - no requestAnimationFrame (removed for faster response)
    window.WidgetOverlayService.setupOverlayHover(
      listElement,
      '.unified-pending-list-item, .trade-create-widget-item',
      '[data-overlay="true"]',
      {
        hoverClass: 'is-hovered',
        gap: 8,
        minWidth: 280,
        maxWidth: 400,
        zIndex: 1050,
        useAnimations: true, // Enable GSAP animations
        transitionDuration: 100 // Faster animation (reduced from 200)
      }
    );
    state.overlaySetup[combination] = true;
  }

  /**
   * Get data for a specific combination using shared services (with caching)
   */
  async function getDataForCombination(combination) {
    // Return cached data if available
    if (state.dataCache[combination] !== undefined) {
      return state.dataCache[combination];
    }
    try {
      if (combination === 'createTrades') {
        if (!window.ExecutionClusteringService) {
          window.Logger?.warn?.('ExecutionClusteringService not available', { combination, page: 'unified-pending-actions-widget' });
          return [];
        }
        // Getting cached clusters for createTrades
        const clusters = await window.ExecutionClusteringService.getCachedClusters();
        if (!clusters || clusters.length === 0) {
          state.dataCache[combination] = [];
          return [];
        }
        const dismissed = await window.PendingActionsCacheService.getDismissed('trade-creation-clusters');
        const filtered = clusters
          .filter(cluster => !dismissed.has(cluster.cluster_id))
          .slice(0, state.config.defaultItemsLimit);
        state.dataCache[combination] = filtered;
        return filtered;
      }
      
      if (combination === 'assignTrades') {
        if (!window.ExecutionAssignmentService) return [];
        const highlights = await window.ExecutionAssignmentService.getCachedHighlights();
        if (!highlights || highlights.length === 0) return [];
        const dismissedItems = await window.ExecutionAssignmentService.getDismissedItems();
        return highlights
          .filter(item => {
            const executionId = item.execution?.id;
            if (!executionId) return false;
            const executionKey = window.ExecutionAssignmentService.getDismissKey(executionId);
            if (dismissedItems.has(executionKey)) return false;
            // Check if specific trade suggestion is dismissed
            const suggestions = item.suggestions || [];
            if (suggestions.length > 0) {
              return suggestions.some(suggestion => {
                const tradeId = suggestion?.trade_id;
                if (!tradeId) return true;
                const itemKey = window.ExecutionAssignmentService.getDismissKey(executionId, tradeId);
                return !dismissedItems.has(itemKey);
              });
            }
            return true;
          })
          .slice(0, state.config.defaultItemsLimit);
        state.dataCache[combination] = result;
        return result;
      }
      
      if (combination === 'assignPlans') {
        if (!window.TradePlanAssignmentService) return [];
        const assignments = await window.TradePlanAssignmentService.getCachedAssignments();
        if (!assignments || assignments.length === 0) return [];
        const dismissedItems = await window.TradePlanAssignmentService.getDismissedItems();
        return assignments
          .filter(item => {
            const tradeId = item.trade?.id || item.trade_id;
            const planId = item?.primary_suggestion?.plan?.id || item?.primary_suggestion?.trade_plan_id;
            const dismissKey = window.TradePlanAssignmentService.getDismissKey('assignment', tradeId, planId);
            return dismissKey && !dismissedItems.has(dismissKey);
          })
          .slice(0, state.config.defaultItemsLimit);
        state.dataCache[combination] = result;
        return result;
      }
      
      if (combination === 'createPlans') {
        if (!window.TradePlanAssignmentService) return [];
        const creations = await window.TradePlanAssignmentService.getCachedCreations();
        if (!creations || creations.length === 0) return [];
        const dismissedItems = await window.TradePlanAssignmentService.getDismissedItems();
        return creations
          .filter(item => {
            const tradeId = item.trade?.id || item.trade_id;
            const dismissKey = window.TradePlanAssignmentService.getDismissKey('creation', tradeId);
            return dismissKey && !dismissedItems.has(dismissKey);
          })
          .slice(0, state.config.defaultItemsLimit);
        state.dataCache[combination] = result;
        return result;
      }
    } catch (error) {
      window.Logger?.error?.('Error getting data for combination', { error, combination, page: 'unified-pending-actions-widget' });
      state.dataCache[combination] = [];
      return [];
    }
    
    state.dataCache[combination] = [];
    return [];
  }
  
  /**
   * Check if combination has data
   * Note: This function is async but may be called without await in some places
   */
  async function hasData(combination) {
    try {
      const data = await getDataForCombination(combination);
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      window.Logger?.error?.('Failed to check data for combination', { error, combination, page: 'unified-pending-actions-widget' });
      return false;
    }
  }
  
  /**
   * Load data for combination using shared services
   */
  async function loadCombinationData(action, entity) {
    const combination = getCombinationKey(action, entity);
    
    // Set loading state
    setLoading(combination, true);
    hideError(combination);
    
    try {
      if (combination === 'createTrades') {
        if (window.ExecutionClusteringService) {
          window.Logger?.info?.('Fetching clusters for createTrades', { page: 'unified-pending-actions-widget' });
          const clusters = await window.ExecutionClusteringService.fetchClusters({ force: true });
          window.Logger?.info?.('Clusters fetched', { 
            clustersLength: clusters?.length || 0,
            page: 'unified-pending-actions-widget' 
          });
        } else {
          window.Logger?.warn?.('ExecutionClusteringService not available for createTrades', { page: 'unified-pending-actions-widget' });
        }
      } else if (combination === 'assignTrades') {
        if (window.ExecutionAssignmentService) {
          await window.ExecutionAssignmentService.fetchHighlights({ force: true });
        }
      } else if (combination === 'assignPlans') {
        if (window.TradePlanAssignmentService) {
          await window.TradePlanAssignmentService.fetchAssignments({ force: true });
        }
      } else if (combination === 'createPlans') {
        if (window.TradePlanAssignmentService) {
          await window.TradePlanAssignmentService.fetchCreations({ force: true });
        }
      }
    } catch (error) {
      window.Logger?.error?.('Failed to load combination data', { error, combination, page: 'unified-pending-actions-widget' });
      showError(combination, error.message || 'שגיאה בטעינת נתונים');
    } finally {
      setLoading(combination, false);
      await renderCombination(combination);
      await checkTabsVisibility();

      // Dispatch event to trigger height equalization
      window.dispatchEvent(new CustomEvent('widgetContentUpdated'));
    }
  }
  
  /**
   * Render item using shared helper functions or fallback to old widgets
   */
  function renderListItem(item, combination) {
    try {
      if (combination === 'createTrades') {
        // Use ExecutionClusterHelpers for rendering
        if (window.ExecutionClusterHelpers?.renderClusterListItem) {
          const selectedIds = window.ExecutionClusteringService?.getSelection?.(item.cluster_id) || new Set(item.execution_ids || []);
          return window.ExecutionClusterHelpers.renderClusterListItem(item, selectedIds, {
            onSelectionChange: async (clusterId, executionId, isChecked) => {
              const clusters = await window.ExecutionClusteringService?.getCachedClusters() || [];
              const currentCluster = clusters.find(c => c.cluster_id === clusterId);
              if (!currentCluster) return;
              let currentSelection = window.ExecutionClusteringService?.getSelection?.(clusterId);
              if (!currentSelection) {
                currentSelection = new Set(currentCluster.execution_ids.map(id => Number(id)));
                window.ExecutionClusteringService?.setSelection?.(clusterId, currentSelection);
              }
              if (isChecked) {
                currentSelection.add(executionId);
              } else {
                currentSelection.delete(executionId);
              }
            },
            onOpenTradeModal: (clusterId, clusterData, selectedExecIds) => {
              window.ExecutionClusterHelpers.openTradeModalFromCluster(clusterId, clusterData, selectedExecIds, {
                handleTradeCreated: async (result) => {
                  await window.ExecutionClusterHelpers.handleTradeCreated(result, clusterId, Array.from(selectedExecIds));
                  // Refresh widget after trade creation
                  const currentCombination = getCombinationKey(state.activeAction, state.activeEntity);
                  if (currentCombination === 'createTrades') {
                    await loadCombinationData(state.activeAction, state.activeEntity);
                  }
                }
              });
            },
            onDismiss: async (clusterIdToDismiss) => {
              await window.PendingActionsCacheService.dismissItem('trade-creation-clusters', clusterIdToDismiss);
              // Refresh widget after dismiss
              const currentCombination = getCombinationKey(state.activeAction, state.activeEntity);
              if (currentCombination === 'createTrades') {
                await loadCombinationData(state.activeAction, state.activeEntity);
              }
            }
          });
        }
        // Fallback to old widget
        const widget = window.PendingExecutionTradeCreation;
        if (widget?.buildDashboardClusterItem) {
          const selectedIds = widget.state?.selection?.get(item.cluster_id) || new Set();
          const domItem = widget.buildDashboardClusterItem(item, selectedIds);
          return domItem.outerHTML;
        }
      }
      
      if (combination === 'assignTrades') {
        // Render highlight item like Recent Items - same structure and details
        const execution = item.execution || {};
        const executionId = execution.id;
        const suggestions = item.suggestions || [];
        const ticker = execution.ticker || {};
        const account = execution.trading_account || execution.account || {};
        const date = execution.date || execution.execution_date || execution.created_at;
        const action = execution.action || execution.type || '';
        const value = execution.value || (execution.quantity && execution.price ? execution.quantity * execution.price : null);
        
        const FieldRenderer = window.FieldRendererService;
        // Try multiple ways to get ticker symbol
        // Note: getTickerSymbol may return a Promise, so we need to handle it synchronously
        // For now, we'll use the ticker symbol from the data or fallback to ID
        const symbol = ticker?.symbol || execution?.ticker_symbol || execution?.ticker?.symbol || 
                       (executionId ? `ביצוע #${executionId}` : 'לא זמין');
        const dateLabel = date && FieldRenderer?.renderDateShort 
          ? FieldRenderer.renderDateShort(date)
          : (date ? (typeof date === 'object' && date.display ? date.display : String(date).substring(0, 10)) : '');
        const actionDisplay = action && FieldRenderer?.renderAction 
          ? FieldRenderer.renderAction(action)
          : (action || '-');
        const valueDisplay = value !== undefined && value !== null && FieldRenderer?.renderAmount
          ? FieldRenderer.renderAmount(Number(value) || 0, '$', 2, true)
          : (value !== undefined && value !== null ? `$${Number(value).toFixed(2)}` : 'לא זמין');
        
        // Note: IconSystem.getEntityIcon returns a Promise, so we use fallback path directly
        const executionIconPath = 'images/icons/entities/executions.svg';
        
        return `
          <li class="list-group-item unified-pending-list-item" 
              data-execution-id="${executionId}"
              data-widget-overlay="true">
            <!-- Header Section - Always Visible (like Recent Items) -->
            <div class="unified-pending-item-header">
              <div class="unified-pending-item-title">
                <div class="unified-pending-item-title-main-row">
                  <img src="${executionIconPath}" alt="ביצוע" class="unified-pending-item-icon" width="16" height="16">
                  <span class="unified-pending-item-title-main">${symbol}</span>
                </div>
                <div class="unified-pending-item-title-meta">
                  ${actionDisplay ? `<span class="unified-pending-meta-item">${actionDisplay}</span>` : ''}
                  ${dateLabel ? `<span class="unified-pending-meta-item">${dateLabel}</span>` : ''}
                </div>
              </div>
              <div class="unified-pending-item-amount">
                <div class="unified-pending-item-amount-value">${valueDisplay}</div>
                ${suggestions.length > 0 ? `<div class="unified-pending-item-amount-quantity text-muted small">${suggestions.length} הצעות</div>` : ''}
              </div>
              <div class="unified-pending-item-actions">
                <button
                  data-button-type="APPROVE"
                  data-variant="small"
                  data-execution-id="${executionId}"
                  data-text="אשר"
                  title="פתח מודול שיוך">
                </button>
                <button
                  data-button-type="REJECT"
                  data-variant="small"
                  data-execution-id="${executionId}"
                  data-text="התעלם"
                  title="הסר מהרשימה">
                </button>
              </div>
            </div>
            <!-- Details Section - Hidden by default, shown on hover -->
            <div class="unified-pending-details" data-overlay="true" data-role="widget-detail" data-execution-id="${executionId}">
              <div class="unified-pending-details-content">
                ${symbol ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">סימבול:</span>
                    <span class="unified-pending-details-value">${symbol}</span>
                  </div>
                ` : ''}
                ${account.name || account.display_name ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">חשבון:</span>
                    <span class="unified-pending-details-value">${account.name || account.display_name}</span>
                  </div>
                ` : ''}
                ${actionDisplay ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">פעולה:</span>
                    <span class="unified-pending-details-value">${actionDisplay}</span>
                  </div>
                ` : ''}
                ${dateLabel ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">תאריך:</span>
                    <span class="unified-pending-details-value">${dateLabel}</span>
                  </div>
                ` : ''}
                ${valueDisplay ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">שווי:</span>
                    <span class="unified-pending-details-value">${valueDisplay}</span>
                  </div>
                ` : ''}
                ${suggestions.length > 0 ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">הצעות שיוך:</span>
                    <span class="unified-pending-details-value">${suggestions.length}</span>
                  </div>
                  <div class="unified-pending-details-suggestions mt-2">
                    ${suggestions.slice(0, 3).map(suggestion => {
                      const trade = suggestion.trade || {};
                      const matchScore = suggestion.match_score || 0;
                      return `
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <span>טרייד #${trade.id || suggestion.trade_id || '-'}</span>
                          <span class="badge bg-body-secondary">${matchScore}% התאמה</span>
                        </div>
                      `;
                    }).join('')}
                    ${suggestions.length > 3 ? `<span class="text-muted small">+${suggestions.length - 3} עוד</span>` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          </li>
        `;
      }
      
      if (combination === 'assignPlans') {
        // Render assignment item like Recent Items - same structure and details
        const trade = item.trade || {};
        const tradeId = trade.id || item.trade_id;
        const suggestion = item.primary_suggestion || {};
        const plan = suggestion.plan || {};
        const planId = plan.id || suggestion.trade_plan_id;
        const suggestions = item.suggestions || [];
        
        const FieldRenderer = window.FieldRendererService;
        const ticker = trade.ticker || {};
        // Try multiple ways to get ticker symbol
        // Note: getTickerSymbol may return a Promise, so we need to handle it synchronously
        // For now, we'll use the ticker symbol from the data or fallback to ID
        const symbol = ticker?.symbol || trade?.ticker_symbol || trade?.symbol || 
                       (tradeId ? `טרייד #${tradeId}` : 'לא זמין');
        const status = trade.status || '';
        const date = trade.created_at || trade.opened_at || trade.entry_date;
        const amount = trade.position?.market_value ?? trade.position?.amount ?? trade.amount ?? trade.total_pl ?? trade.entry_price;
        
        const dateLabel = date && FieldRenderer?.renderDateShort 
          ? FieldRenderer.renderDateShort(date)
          : (date ? (typeof date === 'object' && date.display ? date.display : String(date).substring(0, 10)) : '');
        const statusDisplay = status && FieldRenderer?.renderStatus
          ? FieldRenderer.renderStatus(status, 'trade')
          : '';
        const amountDisplay = amount !== undefined && amount !== null && FieldRenderer?.renderAmount
          ? FieldRenderer.renderAmount(Number(amount) || 0, '$', 2, true)
          : (amount !== undefined && amount !== null ? `$${Number(amount).toFixed(2)}` : 'לא זמין');
        
        // Note: IconSystem.getEntityIcon returns a Promise, so we use fallback path directly
        const tradeIconPath = 'images/icons/entities/trades.svg';
        
        return `
          <li class="list-group-item unified-pending-list-item" 
              data-trade-id="${tradeId}" 
              data-plan-id="${planId}"
              data-widget-overlay="true">
            <!-- Header Section - Always Visible (like Recent Items) -->
            <div class="unified-pending-item-header">
              <div class="unified-pending-item-title">
                <div class="unified-pending-item-title-main-row">
                  <img src="${tradeIconPath}" alt="טרייד" class="unified-pending-item-icon" width="16" height="16">
                  <span class="unified-pending-item-title-main">${symbol}</span>
                </div>
                <div class="unified-pending-item-title-meta">
                  ${statusDisplay ? `<span class="unified-pending-meta-item">${statusDisplay}</span>` : ''}
                  ${dateLabel ? `<span class="unified-pending-meta-item">${dateLabel}</span>` : ''}
                </div>
              </div>
              <div class="unified-pending-item-amount">
                <div class="unified-pending-item-amount-value">${amountDisplay}</div>
                ${suggestions.length > 0 ? `<div class="unified-pending-item-amount-quantity text-muted small">${suggestions.length} הצעות</div>` : ''}
              </div>
              <div class="unified-pending-item-actions">
                <button
                  data-button-type="APPROVE"
                  data-variant="small"
                  data-trade-id="${tradeId}"
                  data-plan-id="${planId}"
                  data-text="אשר"
                  title="פתח מודול שיוך">
                </button>
                <button
                  data-button-type="REJECT"
                  data-variant="small"
                  data-trade-id="${tradeId}"
                  data-plan-id="${planId}"
                  data-text="התעלם"
                  title="הסר מהרשימה">
                </button>
              </div>
            </div>
            <!-- Details Section - Hidden by default, shown on hover -->
            <div class="unified-pending-details" data-overlay="true" data-role="widget-detail" data-trade-id="${tradeId}">
              <div class="unified-pending-details-content">
                ${symbol ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">סימבול:</span>
                    <span class="unified-pending-details-value">${symbol}</span>
                  </div>
                ` : ''}
                ${statusDisplay ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">סטטוס:</span>
                    <span class="unified-pending-details-value">${statusDisplay}</span>
                  </div>
                ` : ''}
                ${dateLabel ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">תאריך:</span>
                    <span class="unified-pending-details-value">${dateLabel}</span>
                  </div>
                ` : ''}
                ${amountDisplay ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">סכום:</span>
                    <span class="unified-pending-details-value">${amountDisplay}</span>
                  </div>
                ` : ''}
                ${suggestions.length > 0 ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">הצעות שיוך:</span>
                    <span class="unified-pending-details-value">${suggestions.length}</span>
                  </div>
                  <div class="unified-pending-details-suggestions mt-2">
                    ${suggestions.slice(0, 3).map(s => {
                      const p = s.plan || {};
                      return `
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <span>${p.name || `תוכנית #${p.id || s.trade_plan_id || '-'}`}</span>
                        </div>
                      `;
                    }).join('')}
                    ${suggestions.length > 3 ? `<span class="text-muted small">+${suggestions.length - 3} עוד</span>` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          </li>
        `;
      }
      
      if (combination === 'createPlans') {
        // Render creation item like Recent Items - same structure and details
        const trade = item.trade || {};
        const tradeId = trade.id || item.trade_id;
        const ticker = trade.ticker || {};
        const status = trade.status || '';
        const date = trade.created_at || trade.opened_at || trade.entry_date;
        const amount = trade.position?.market_value ?? trade.position?.amount ?? trade.amount ?? trade.total_pl ?? trade.entry_price;
        
        const FieldRenderer = window.FieldRendererService;
        // Try multiple ways to get ticker symbol
        // Note: getTickerSymbol may return a Promise, so we need to handle it synchronously
        // For now, we'll use the ticker symbol from the data or fallback to ID
        const symbol = ticker?.symbol || trade?.ticker_symbol || trade?.symbol || 
                       (tradeId ? `טרייד #${tradeId}` : 'לא זמין');
        const dateLabel = date && FieldRenderer?.renderDateShort 
          ? FieldRenderer.renderDateShort(date)
          : (date ? (typeof date === 'object' && date.display ? date.display : String(date).substring(0, 10)) : '');
        const statusDisplay = status && FieldRenderer?.renderStatus
          ? FieldRenderer.renderStatus(status, 'trade')
          : '';
        const amountDisplay = amount !== undefined && amount !== null && FieldRenderer?.renderAmount
          ? FieldRenderer.renderAmount(Number(amount) || 0, '$', 2, true)
          : (amount !== undefined && amount !== null ? `$${Number(amount).toFixed(2)}` : 'לא זמין');
        
        // Note: IconSystem.getEntityIcon returns a Promise, so we use fallback path directly
        const tradeIconPath = 'images/icons/entities/trades.svg';
        
        return `
          <li class="list-group-item unified-pending-list-item" 
              data-trade-id="${tradeId}"
              data-widget-overlay="true">
            <!-- Header Section - Always Visible (like Recent Items) -->
            <div class="unified-pending-item-header">
              <div class="unified-pending-item-title">
                <div class="unified-pending-item-title-main-row">
                  <img src="${tradeIconPath}" alt="טרייד" class="unified-pending-item-icon" width="16" height="16">
                  <span class="unified-pending-item-title-main">${symbol}</span>
                </div>
                <div class="unified-pending-item-title-meta">
                  ${statusDisplay ? `<span class="unified-pending-meta-item">${statusDisplay}</span>` : ''}
                  ${dateLabel ? `<span class="unified-pending-meta-item">${dateLabel}</span>` : ''}
                </div>
              </div>
              <div class="unified-pending-item-amount">
                <div class="unified-pending-item-amount-value">${amountDisplay}</div>
                <div class="unified-pending-item-amount-quantity text-muted small">מוכן ליצירת תוכנית</div>
              </div>
              <div class="unified-pending-item-actions">
                <button
                  data-button-type="APPROVE"
                  data-variant="small"
                  data-trade-id="${tradeId}"
                  data-text="אשר"
                  title="פתח מודול יצירת תוכנית">
                </button>
                <button
                  data-button-type="REJECT"
                  data-variant="small"
                  data-trade-id="${tradeId}"
                  data-text="התעלם"
                  title="הסר מהרשימה">
                </button>
              </div>
            </div>
            <!-- Details Section - Hidden by default, shown on hover -->
            <div class="unified-pending-details" data-overlay="true" data-role="widget-detail" data-trade-id="${tradeId}">
              <div class="unified-pending-details-content">
                ${symbol ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">סימבול:</span>
                    <span class="unified-pending-details-value">${symbol}</span>
                  </div>
                ` : ''}
                ${statusDisplay ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">סטטוס:</span>
                    <span class="unified-pending-details-value">${statusDisplay}</span>
                  </div>
                ` : ''}
                ${dateLabel ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">תאריך:</span>
                    <span class="unified-pending-details-value">${dateLabel}</span>
                  </div>
                ` : ''}
                ${amountDisplay ? `
                  <div class="unified-pending-details-row">
                    <span class="unified-pending-details-label">סכום:</span>
                    <span class="unified-pending-details-value">${amountDisplay}</span>
                  </div>
                ` : ''}
                <div class="unified-pending-details-row">
                  <span class="unified-pending-details-label">סטטוס:</span>
                  <span class="unified-pending-details-value">מוכן ליצירת תוכנית חדשה</span>
                </div>
              </div>
            </div>
          </li>
        `;
      }
    } catch (error) {
      window.Logger?.error?.('Failed to render item', { error, combination, item, page: 'unified-pending-actions-widget' });
    }
    
    return '';
  }
  
  /**
   * Render a combination using shared services data and rendering
   */
  async function renderCombination(combination) {
    const pane = elements.panes?.[combination];
    if (!pane) return;
    
    const list = elements.list[combination];
    if (!list) return;
    
    const data = await getDataForCombination(combination);
    
    // Hide loading
    setLoading(combination, false);
    
    // Check if empty
    if (data.length === 0) {
      showEmptyState(combination);
      hideList(combination);
      updateCount(combination, 0);
      return;
    }
    
    // Hide empty state and show list
    hideEmptyState(combination);
    showList(combination);
    
    // Render items
    if (!list || !list.parentNode) {
      window.Logger?.warn?.('List element not in DOM', { combination, page: 'unified-pending-actions-widget' });
      return;
    }
    
    
    const html = data.map(item => renderListItem(item, combination)).filter(Boolean).join('');
    
    if (!html) {
      showEmptyState(combination);
      hideList(combination);
      updateCount(combination, 0);
      return;
    }
    
    // Set HTML content using DOMParser
    list.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.body.childNodes.forEach(node => {
      list.appendChild(node.cloneNode(true));
    });
    
    // Dispatch event to trigger height equalization after content update
    window.dispatchEvent(new CustomEvent('widgetContentUpdated'));
    
    // Wait for DOM to update before initializing buttons and overlay
    requestAnimationFrame(() => {
      if (list && list.parentNode && list.innerHTML) {
        // Initialize buttons only if list has content and is in DOM
        if (window.ButtonSystem?.initializeButtons) {
          try {
            window.ButtonSystem.initializeButtons(list);
          } catch (error) {
            window.Logger?.warn?.('Failed to initialize buttons', { combination, error, page: 'unified-pending-actions-widget' });
          }
        }
        
        // Setup overlay hover AFTER items are rendered and buttons initialized
        // Setup overlay using shared function (only once per list)
        setupOverlayForList(list, combination);
      }
    });
    
    // Update count
    updateCount(combination, data.length);
  }
  
  /**
   * Check tabs visibility and show/hide based on data availability
   */
  async function checkTabsVisibility() {
    const assignPlansHasData = await hasData('assignPlans');
    const assignTradesHasData = await hasData('assignTrades');
    const createPlansHasData = await hasData('createPlans');
    const createTradesHasData = await hasData('createTrades');
    
    const assignHasData = assignPlansHasData || assignTradesHasData;
    const createHasData = createPlansHasData || createTradesHasData;
    
    // If both action tabs are empty, hide tabs and show general message
    if (!assignHasData && !createHasData) {
      hideAllTabs();
      showGeneralMessage('כל הפעולות עודכנו. עבודה מצוינת!');
      return;
    }
    
    // Show tabs
    showAllTabs();
    hideGeneralMessage();
    
    // Show messages in empty entity tabs
    if (assignHasData) {
      if (!assignPlansHasData && !assignTradesHasData) {
        // This shouldn't happen, but handle it
        showEmptyMessage('assign', 'כל הקישורים עודכנו');
      }
    }
    
    if (createHasData) {
      if (!createPlansHasData && !createTradesHasData) {
        // This shouldn't happen, but handle it
        showEmptyMessage('create', 'אין פעולות ממתינות');
      }
    }
  }
  
  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.container = document.getElementById(CONTAINER_ID);
    if (!elements.container) {
      window.Logger?.error?.('cacheElements: Container not found', { 
        containerId: CONTAINER_ID,
        page: 'unified-pending-actions-widget' 
      });
      return false;
    }
    
    elements.title = elements.container.querySelector('#unifiedPendingActionsWidgetTitle');
    elements.badge = elements.container.querySelector('#unifiedPendingActionsWidgetBadge');
    // All tabs are now in a single row
    elements.allTabs = elements.container.querySelector('#unifiedPendingActionsAllTabs');
    elements.actionTabAssign = elements.container.querySelector('#actionTabAssign');
    elements.actionTabCreate = elements.container.querySelector('#actionTabCreate');
    elements.entityTabPlans = elements.container.querySelector('#entityTabPlans');
    elements.entityTabTrades = elements.container.querySelector('#entityTabTrades');
    
    elements.paneAssignPlans = elements.container.querySelector('#paneAssignPlans');
    elements.paneAssignTrades = elements.container.querySelector('#paneAssignTrades');
    elements.paneCreatePlans = elements.container.querySelector('#paneCreatePlans');
    elements.paneCreateTrades = elements.container.querySelector('#paneCreateTrades');
    
    elements.panes = {
      assignPlans: elements.paneAssignPlans,
      assignTrades: elements.paneAssignTrades,
      createPlans: elements.paneCreatePlans,
      createTrades: elements.paneCreateTrades
    };
    
      // Cache elements for each pane
      const combinations = ['assignPlans', 'assignTrades', 'createPlans', 'createTrades'];
      combinations.forEach(combination => {
        const pane = elements.panes[combination];
        if (pane) {
          elements.loading[combination] = pane.querySelector(`#${combination}Loading`);
          elements.error[combination] = pane.querySelector(`#${combination}Error`);
          elements.empty[combination] = pane.querySelector(`#${combination}Empty`);
          elements.list[combination] = pane.querySelector(`#${combination}List`);
          // Count elements are now in header, not in pane
          elements.count[combination] = document.getElementById(`${combination}CountHeader`);
        }
      });
    
      // Cache general message element
      elements.generalMessage = elements.container.querySelector('#unifiedPendingActionsGeneralMessage');
    
    return true;
  }
  
  /**
   * Set active tabs
   */
  async function setActiveAction(action) {
    state.activeAction = action;
    
    if (elements.actionTabAssign) {
      elements.actionTabAssign.classList.toggle('active', action === 'assign');
    }
    if (elements.actionTabCreate) {
      elements.actionTabCreate.classList.toggle('active', action === 'create');
    }
    
    // Update entity tabs visibility and active state
    updateEntityTabsVisibility();
    
    // Update counts visibility for all combinations
    const combinations = ['assignPlans', 'assignTrades', 'createPlans', 'createTrades'];
    await Promise.all(combinations.map(async (comb) => {
      const data = await getDataForCombination(comb);
      const activeCombination = getCombinationKey(state.activeAction, state.activeEntity);
      const isActive = comb === activeCombination;
      const countEl = elements.count[comb];
      if (countEl) {
        countEl.textContent = String(data.length);
        countEl.classList.toggle('d-none', data.length === 0 || !isActive);
      }
    }));
    
    // Load data for new combination
    await loadCombinationData(state.activeAction, state.activeEntity);
  }
  
  async function setActiveEntity(entity) {
    state.activeEntity = entity;
    
    if (elements.entityTabPlans) {
      elements.entityTabPlans.classList.toggle('active', entity === 'plans');
    }
    if (elements.entityTabTrades) {
      elements.entityTabTrades.classList.toggle('active', entity === 'trades');
    }
    
    // Update active pane
    updateActivePane();
    
    // Update counts visibility for all combinations
    const combinations = ['assignPlans', 'assignTrades', 'createPlans', 'createTrades'];
    await Promise.all(combinations.map(async (comb) => {
      const data = await getDataForCombination(comb);
      const activeCombination = getCombinationKey(state.activeAction, state.activeEntity);
      const isActive = comb === activeCombination;
      const countEl = elements.count[comb];
      if (countEl) {
        countEl.textContent = String(data.length);
        countEl.classList.toggle('d-none', data.length === 0 || !isActive);
      }
    }));
    
    // Load data for new combination
    await loadCombinationData(state.activeAction, state.activeEntity);
  }
  
  function updateEntityTabsVisibility() {
    // Entity tabs are always visible in this implementation
    if (elements.entityTabs) {
      elements.entityTabs.style.display = '';
    }
  }
  
  function updateActivePane() {
    const combination = getCombinationKey(state.activeAction, state.activeEntity);
    
    // Hide all panes
    Object.values(elements.panes).forEach(pane => {
      if (pane) {
        pane.classList.remove('show', 'active');
      }
    });
    
    // Show active pane
    const activePane = elements.panes[combination];
    if (activePane) {
      activePane.classList.add('show', 'active');
    }
  }
  
  /**
   * Bind events
   */
  function bindEvents() {
    // Action tabs
    if (elements.actionTabAssign) {
      elements.actionTabAssign.addEventListener('click', () => setActiveAction('assign'));
    }
    if (elements.actionTabCreate) {
      elements.actionTabCreate.addEventListener('click', () => setActiveAction('create'));
    }
    
    // Entity tabs
    if (elements.entityTabPlans) {
      elements.entityTabPlans.addEventListener('click', () => setActiveEntity('plans'));
    }
    if (elements.entityTabTrades) {
      elements.entityTabTrades.addEventListener('click', () => setActiveEntity('trades'));
    }
    
    // Listen for clicks on action buttons and handle hover
    const allLists = Object.values(elements.list);
    allLists.forEach(list => {
      if (list) {
        // Click handlers
        list.addEventListener('click', async (event) => {
          const createBtn = event.target.closest('[data-role="create-trade"]');
          if (createBtn) {
            const clusterId = createBtn.dataset.clusterId;
            if (window.ExecutionClusteringService && window.ExecutionClusterHelpers) {
              const clusters = await window.ExecutionClusteringService.getCachedClusters() || [];
              const cluster = clusters.find(c => c.cluster_id === clusterId);
              if (cluster) {
                const selectedIds = window.ExecutionClusteringService.getSelection?.(clusterId) || new Set(cluster.execution_ids.map(id => Number(id)));
                await window.ExecutionClusterHelpers.openTradeModalFromCluster(clusterId, cluster, selectedIds, {
                  handleTradeCreated: async (result) => {
                    await window.ExecutionClusterHelpers.handleTradeCreated(result, clusterId, Array.from(selectedIds));
                    await loadCombinationData(state.activeAction, state.activeEntity);
                  }
                });
              }
            }
            return;
          }

          const dismissBtn = event.target.closest('[data-role="dismiss-cluster"]');
          if (dismissBtn) {
            const clusterId = dismissBtn.dataset.clusterId;
            await window.PendingActionsCacheService.dismissItem('trade-creation-clusters', clusterId);
            await loadCombinationData(state.activeAction, state.activeEntity);
            return;
          }

          // Handle APPROVE button (which button)
          const approveBtn = event.target.closest('[data-button-type="APPROVE"]');
          if (approveBtn) {
            // Get item data from closest list item
            const item = approveBtn.closest('.unified-pending-list-item, .trade-create-widget-item, .list-group-item');
            if (item) {
              await handleApproveAction(item, event);
            }
            return;
          }

          // Handle REJECT/DISMISS button
          const rejectBtn = event.target.closest('[data-button-type="REJECT"], [data-button-type="DISMISS"]');
          if (rejectBtn) {
            const item = rejectBtn.closest('.unified-pending-list-item, .trade-create-widget-item, .list-group-item');
            if (item) {
              await handleRejectAction(item, event);
            }
            return;
          }

          // For other buttons, refresh after action
          if (event.target.closest('[data-button-type]')) {
            setTimeout(async () => {
              await renderCombination(getCombinationKey(state.activeAction, state.activeEntity));
              await checkTabsVisibility();
            }, 500);
          }
        });

        // Overlay setup is now done in renderCombination after items are rendered
        // This code is kept for backward compatibility but should not be needed
      }
    });
  }

  /**
   * Handle hover on widget items
   * NOTE: This function is no longer used - overlay is handled by WidgetOverlayService
   * Kept for reference but can be removed in future cleanup
   */

  /**
   * Handle APPROVE action - open modal for creation/assignment
   */
  async function handleApproveAction(item, event) {
    event.preventDefault();
    event.stopPropagation();
    
    const combination = getCombinationKey(state.activeAction, state.activeEntity);
    window.Logger?.info?.('Handling APPROVE action', { combination, page: 'unified-pending-actions-widget' });
    
    if (combination === 'createTrades') {
      // Handle trade creation from cluster
      const clusterId = item.dataset.clusterId;
      if (clusterId && window.ExecutionClusteringService && window.ExecutionClusterHelpers) {
        const clusters = await window.ExecutionClusteringService.getCachedClusters() || [];
        const cluster = clusters.find(c => c.cluster_id === clusterId);
        if (cluster) {
          const selectedIds = window.ExecutionClusteringService.getSelection?.(clusterId) || new Set(cluster.execution_ids.map(id => Number(id)));
          await window.ExecutionClusterHelpers.openTradeModalFromCluster(clusterId, cluster, selectedIds, {
            handleTradeCreated: async (result) => {
              await window.ExecutionClusterHelpers.handleTradeCreated(result, clusterId, Array.from(selectedIds));
              await loadCombinationData(state.activeAction, state.activeEntity);
            }
          });
        }
      }
    } else if (combination === 'assignTrades') {
      // Handle execution assignment to trade
      const executionId = item.dataset.executionId;
      if (executionId && window.ExecutionAssignmentService) {
        // Get suggested trades
        const highlights = await window.ExecutionAssignmentService.getCachedHighlights() || [];
        const highlight = highlights.find(h => h.execution?.id === Number(executionId));
        if (highlight && highlight.suggestions && highlight.suggestions.length > 0) {
          // Use first suggestion or let user choose
          const firstSuggestion = highlight.suggestions[0];
          const tradeId = firstSuggestion.trade?.id || firstSuggestion.trade_id;
          if (tradeId && window.acceptSuggestion) {
            await window.acceptSuggestion(Number(executionId), Number(tradeId));
            await loadCombinationData(state.activeAction, state.activeEntity);
          } else {
            // Open executions modal for manual assignment
            if (window.ModalManagerV2?.showModal) {
              await window.ModalManagerV2.showModal('executionsModal', 'edit', { 
                execution_id: Number(executionId),
                trade_id: tradeId ? Number(tradeId) : null
              });
              await loadCombinationData(state.activeAction, state.activeEntity);
            }
          }
        } else {
          // No suggestions - open executions modal for manual assignment
          if (window.ModalManagerV2?.showModal) {
            await window.ModalManagerV2.showModal('executionsModal', 'edit', { 
              execution_id: Number(executionId)
            });
            await loadCombinationData(state.activeAction, state.activeEntity);
          }
        }
      }
    } else if (combination === 'createPlans' || combination === 'assignPlans') {
      // Handle plan creation/assignment
      const tradeId = item.dataset.tradeId;
      if (tradeId && window.TradePlanAssignmentService) {
        if (combination === 'createPlans') {
          // Open plan creation modal with trade prefill
          if (window.ModalManagerV2?.showModal) {
            await window.ModalManagerV2.showModal('tradePlanModal', 'add', { 
              trade_id: Number(tradeId)
            });
            await loadCombinationData(state.activeAction, state.activeEntity);
          }
        } else {
          // Open plan assignment - use first suggestion or open modal
          const assignments = await window.TradePlanAssignmentService.getCachedAssignments() || [];
          const assignment = assignments.find(a => (a.trade?.id || a.trade_id) === Number(tradeId));
          if (assignment && assignment.suggestions && assignment.suggestions.length > 0) {
            const firstSuggestion = assignment.suggestions[0];
            const planId = firstSuggestion.plan?.id || firstSuggestion.trade_plan_id;
            if (planId && window.ModalManagerV2?.showModal) {
              // Open trade modal to assign plan
              await window.ModalManagerV2.showModal('tradesModal', 'edit', { 
                trade_id: Number(tradeId),
                trade_plan_id: Number(planId)
              });
              await loadCombinationData(state.activeAction, state.activeEntity);
            }
          } else {
            // No suggestions - open trade modal for manual assignment
            if (window.ModalManagerV2?.showModal) {
              await window.ModalManagerV2.showModal('tradesModal', 'edit', { 
                trade_id: Number(tradeId)
              });
              await loadCombinationData(state.activeAction, state.activeEntity);
            }
          }
        }
      }
    }
  }

  /**
   * Handle REJECT/DISMISS action - remove item from list
   */
  async function handleRejectAction(item, event) {
    event.preventDefault();
    event.stopPropagation();
    
    const combination = getCombinationKey(state.activeAction, state.activeEntity);
    window.Logger?.info?.('Handling REJECT action', { combination, page: 'unified-pending-actions-widget' });
    
    if (combination === 'createTrades') {
      const clusterId = item.dataset.clusterId;
      if (clusterId) {
        await window.PendingActionsCacheService.dismissItem('trade-creation-clusters', clusterId);
        await loadCombinationData(state.activeAction, state.activeEntity);
      }
    } else if (combination === 'assignTrades') {
      const executionId = item.dataset.executionId;
      if (executionId && window.ExecutionAssignmentService) {
        await window.ExecutionAssignmentService.dismissItem(executionId);
        await loadCombinationData(state.activeAction, state.activeEntity);
      }
    } else if (combination === 'createPlans' || combination === 'assignPlans') {
      const tradeId = item.dataset.tradeId;
      if (tradeId && window.TradePlanAssignmentService) {
        if (combination === 'createPlans') {
          await window.TradePlanAssignmentService.dismissItem('creation', tradeId);
        } else {
          const planId = item.dataset.planId;
          if (planId) {
            await window.TradePlanAssignmentService.dismissItem('assignment', tradeId, planId);
          }
        }
        await loadCombinationData(state.activeAction, state.activeEntity);
      }
    }
  }
  
  /**
   * UI Helper Functions
   */
  function setLoading(combination, isLoading) {
    const loadingEl = elements.loading[combination];
    if (loadingEl) {
      loadingEl.classList.toggle('d-none', !isLoading);
    }
  }
  
  function showError(combination, message) {
    const errorEl = elements.error[combination];
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('d-none');
    }
  }
  
  function hideError(combination) {
    const errorEl = elements.error[combination];
    if (errorEl) {
      errorEl.classList.add('d-none');
    }
  }
  
  function showEmptyState(combination) {
    const emptyEl = elements.empty[combination];
    if (emptyEl) {
      emptyEl.classList.remove('d-none');
    }
  }
  
  function hideEmptyState(combination) {
    const emptyEl = elements.empty[combination];
    if (emptyEl) {
      emptyEl.classList.add('d-none');
    }
  }
  
  function showList(combination) {
    const list = elements.list[combination];
    if (list) {
      list.classList.remove('d-none');
      list.style.display = '';
    }
  }
  
  function hideList(combination) {
    const list = elements.list[combination];
    if (list) {
      list.classList.add('d-none');
    }
  }
  
  async function updateCount(combination, count) {
    // Update the specific count element in header for this combination
    const countEl = elements.count[combination];
    if (countEl) {
      countEl.textContent = String(count);
      // Show/hide based on count and active combination
      const activeCombination = getCombinationKey(state.activeAction, state.activeEntity);
      const isActive = combination === activeCombination;
      countEl.classList.toggle('d-none', count === 0 || !isActive);
      
      // Apply color classes based on combination type
      // Entity combinations (Trade/Plan) - Primary color
      // Action combinations (Assign/Create) - Secondary color
      countEl.classList.remove('badge-primary', 'badge-secondary', 'entity-trade', 'entity-trade_plan');
      
      if (combination === 'assignPlans' || combination === 'assignTrades') {
        // Action: Assign - Secondary color (orange)
        countEl.classList.add('badge-secondary');
        countEl.style.backgroundColor = 'var(--brand-secondary-color, #fc5a06)';
        countEl.style.color = '#fff';
      } else if (combination === 'createPlans') {
        // Entity: Plan - Green color (#28a745)
        countEl.classList.add('entity-trade_plan');
        countEl.style.backgroundColor = '#28a745';
        countEl.style.color = '#fff';
      } else if (combination === 'createTrades') {
        // Entity: Trade - Primary color (turquoise #26baac)
        countEl.classList.add('entity-trade');
        countEl.style.backgroundColor = 'var(--brand-primary-color, #26baac)';
        countEl.style.color = '#fff';
      }
    }
    
    // Update total badge with sum of all 4 combinations
    if (elements.badge) {
      const assignPlansCount = (await getDataForCombination('assignPlans')).length;
      const assignTradesCount = (await getDataForCombination('assignTrades')).length;
      const createPlansCount = (await getDataForCombination('createPlans')).length;
      const createTradesCount = (await getDataForCombination('createTrades')).length;
      const totalCount = assignPlansCount + assignTradesCount + createPlansCount + createTradesCount;
      elements.badge.textContent = String(totalCount);
    }
    
    // Update visibility of all count badges based on active combination
    const activeCombination = getCombinationKey(state.activeAction, state.activeEntity);
    const combinations = ['assignPlans', 'assignTrades', 'createPlans', 'createTrades'];
    
    // Update all counts
    await Promise.all(combinations.map(async (comb) => {
      const el = elements.count[comb];
      if (el) {
        const combCount = comb === combination ? count : (await getDataForCombination(comb)).length;
        const isActive = comb === activeCombination;
        el.textContent = String(combCount);
        el.classList.toggle('d-none', combCount === 0 || !isActive);
      }
    }));
  }
  
  function hideAllTabs() {
    if (elements.allTabs) elements.allTabs.style.display = 'none';
  }
  
  function showAllTabs() {
    if (elements.allTabs) elements.allTabs.style.display = '';
  }
  
  function showGeneralMessage(message) {
    if (elements.generalMessage) {
      elements.generalMessage.textContent = message;
      elements.generalMessage.classList.remove('d-none');
    }
  }
  
  function hideGeneralMessage() {
    if (elements.generalMessage) {
      elements.generalMessage.classList.add('d-none');
    }
  }
  
  function showEmptyMessage(actionType, message) {
    // Show message in both entity tabs for the action type
    // Implementation depends on HTML structure
  }
  
  /**
   * Wait for required services to be available
   */
  async function waitForRequiredServices(timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const hasClusteringService = !!window.ExecutionClusteringService;
      const hasAssignmentService = !!window.ExecutionAssignmentService;
      const hasTradePlanService = !!window.TradePlanAssignmentService;
      const hasCacheService = !!window.PendingActionsCacheService;
      const hasClusterHelpers = !!window.ExecutionClusterHelpers;
      
      if (hasClusteringService && hasAssignmentService && hasTradePlanService && hasCacheService && hasClusterHelpers) {
        // Wait a bit more for services to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    window.Logger?.warn?.('Some required services not available', {
      hasClusteringService: !!window.ExecutionClusteringService,
      hasAssignmentService: !!window.ExecutionAssignmentService,
      hasTradePlanService: !!window.TradePlanAssignmentService,
      hasCacheService: !!window.PendingActionsCacheService,
      hasClusterHelpers: !!window.ExecutionClusterHelpers,
      page: 'unified-pending-actions-widget'
    });
    
    return false;
  }
  
  
  // ===== Public API =====
  
  const UnifiedPendingActionsWidget = {
    /**
     * Initialize widget
     */
    async init(containerId = CONTAINER_ID, config = {}) {
      if (state.initialized) {
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Already initialized', { page: 'unified-pending-actions-widget' });
        return;
      }
      
      // Merge configuration
      state.config = { ...DEFAULT_CONFIG, ...config };
      state.activeAction = config.defaultAction || DEFAULT_CONFIG.defaultAction;
      state.activeEntity = config.defaultEntity || DEFAULT_CONFIG.defaultEntity;
      
      // Cache elements
      const elementsCached = cacheElements();
      
      if (!elementsCached) {
        window.Logger?.error?.('UnifiedPendingActionsWidget: Container not found', { 
          containerId,
          page: 'unified-pending-actions-widget' 
        });
        return;
      }
      
      // Wait for required services
      const servicesAvailable = await waitForRequiredServices();
      if (!servicesAvailable) {
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Some required services not available', { 
          hasClusteringService: !!window.ExecutionClusteringService,
          hasAssignmentService: !!window.ExecutionAssignmentService,
          hasTradePlanService: !!window.TradePlanAssignmentService,
          hasCacheService: !!window.PendingActionsCacheService,
          hasClusterHelpers: !!window.ExecutionClusterHelpers,
          page: 'unified-pending-actions-widget' 
        });
        // Continue anyway - we'll handle missing services gracefully
      }
      
      // Bind events
      bindEvents();
      
      // Set initial active tabs
      setActiveAction(state.activeAction);
      setActiveEntity(state.activeEntity);
      
      // Initial render
      await checkTabsVisibility();
      
      // Load initial data
      await loadCombinationData(state.activeAction, state.activeEntity);
      
      state.initialized = true;
    },
    
    /**
     * Render widget (refresh all combinations)
     */
    async render() {
      if (!state.initialized) {
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Cannot render - not initialized', { page: 'unified-pending-actions-widget' });
        return;
      }
      
      // Re-render all combinations
      for (const combination of ['assignPlans', 'assignTrades', 'createPlans', 'createTrades']) {
        await renderCombination(combination);
      }
      
      // Check tabs visibility
      await checkTabsVisibility();

      // Dispatch event to trigger height equalization
      window.dispatchEvent(new CustomEvent('widgetContentUpdated'));
    },
    
    /**
     * Refresh widget - reload all data and re-render
     */
    async refresh() {
      if (!state.initialized) {
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Cannot refresh - not initialized', { page: 'unified-pending-actions-widget' });
        return;
      }
      
      // Reload data for all combinations
      await loadCombinationData('assign', 'plans');
      await loadCombinationData('assign', 'trades');
      await loadCombinationData('create', 'plans');
      await loadCombinationData('create', 'trades');
      
      // Re-render current active combination
      await renderCombination(getCombinationKey(state.activeAction, state.activeEntity));
      
      // Check tabs visibility
      await checkTabsVisibility();
    },
    
    /**
     * Get current state
     */
    getState() {
      return {
        initialized: state.initialized,
        activeAction: state.activeAction,
        activeEntity: state.activeEntity,
        config: { ...state.config }
      };
    },
    
    /**
     * Destroy widget and cleanup
     */
    destroy() {
      if (!state.initialized) {
        return;
      }
      
      state.initialized = false;
      
      // Remove event listeners by cloning elements
      if (elements.actionTabAssign) {
        const newTab = elements.actionTabAssign.cloneNode(true);
        elements.actionTabAssign.parentNode?.replaceChild(newTab, elements.actionTabAssign);
        elements.actionTabAssign = newTab;
      }
      
      if (elements.actionTabCreate) {
        const newTab = elements.actionTabCreate.cloneNode(true);
        elements.actionTabCreate.parentNode?.replaceChild(newTab, elements.actionTabCreate);
        elements.actionTabCreate = newTab;
      }
      
      if (elements.entityTabPlans) {
        const newTab = elements.entityTabPlans.cloneNode(true);
        elements.entityTabPlans.parentNode?.replaceChild(newTab, elements.entityTabPlans);
        elements.entityTabPlans = newTab;
      }
      
      if (elements.entityTabTrades) {
        const newTab = elements.entityTabTrades.cloneNode(true);
        elements.entityTabTrades.parentNode?.replaceChild(newTab, elements.entityTabTrades);
        elements.entityTabTrades = newTab;
      }
      
      // Cleanup overlay handlers from WidgetOverlayService
      if (window.WidgetOverlayService) {
        Object.values(elements.list).forEach(list => {
          if (list) {
            window.WidgetOverlayService.destroy(list);
          }
        });
      }
      
      // Clear all lists
      Object.values(elements.list).forEach(list => {
        if (list) {
          list.textContent = '';
        }
      });
      
      // Clear caches
      state.dataCache = {};
      state.overlaySetup = {};
      
      window.Logger?.info?.('UnifiedPendingActionsWidget: Destroyed and cleaned up', { page: 'unified-pending-actions-widget' });
    },
    
    version: '2.0.0'
  };

  // Export to global scope
  window.UnifiedPendingActionsWidget = UnifiedPendingActionsWidget;
  
  // Log successful load
  if (window.Logger) {
    window.Logger.info('✅ Unified Pending Actions Widget loaded successfully', { 
      page: 'unified-pending-actions-widget', 
      version: '2.0.0' 
    });
  }
})();

