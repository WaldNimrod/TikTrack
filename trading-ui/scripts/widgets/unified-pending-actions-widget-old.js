/**
 * Unified Pending Actions Widget - TikTrack Dashboard
 * ====================================================
 * 
 * Unified widget for pending assignments and creations with nested tabs:
 * - Action Type: "שיוך" (Assign) / "יצירת חדש" (Create)
 * - Entity Type: "תוכניות" (Plans) / "טריידים" (Trades)
 * 
 * This widget unifies 3 existing widgets:
 * - Pending Executions Highlights (Assign → Trades)
 * - Pending Execution Trade Creation (Create → Trades)
 * - Pending Trade Plan Widget (Assign/Create → Plans)
 * 
 * This widget relies on general systems:
 * - FieldRendererService for formatting
 * - ButtonSystem for buttons
 * - NotificationSystem for errors
 * - ModalManagerV2 for modals
 * - UnifiedCacheManager for cache
 * - CacheSyncManager for cache invalidation
 * 
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/UNIFIED_PENDING_ACTIONS_WIDGET_DEVELOPER_GUIDE.md
 */

;(function () {
  'use strict';

  // ===== Constants =====
  const CONTAINER_ID = 'unifiedPendingActionsWidgetContainer';
  
  // API Endpoints
  const API_ENDPOINTS = {
    assignPlans: '/api/trades/pending-plan/assignments',
    assignTrades: '/api/executions/pending-assignment/highlights',
    createPlans: '/api/trades/pending-plan/creations',
    createTrades: '/api/executions/pending-assignment/trade-creation-clusters'
  };
  
  const AUTO_REFRESH_INTERVAL = 60000; // 60 seconds
  const DISMISSED_CACHE_KEY_PREFIX = 'unified-pending-actions-dismissed';
  const DISMISSED_TTL_SECONDS = 3600; // 1 hour
  
  // Default configuration
  const DEFAULT_CONFIG = {
    defaultItemsLimit: 4,
    defaultAction: 'assign',
    defaultEntity: 'plans',
    autoRefreshInterval: AUTO_REFRESH_INTERVAL
  };

  // ===== State =====
  const state = {
    initialized: false,
    activeAction: 'assign', // 'assign' | 'create'
    activeEntity: 'plans',  // 'plans' | 'trades'
    
    // Data per combination
    data: {
      assignPlans: [],
      assignTrades: [],
      createPlans: [],
      createTrades: []
    },
    
    // Loading states
    loading: {
      assignPlans: false,
      assignTrades: false,
      createPlans: false,
      createTrades: false
    },
    
    // Errors per combination
    errors: {
      assignPlans: null,
      assignTrades: null,
      createPlans: null,
      createTrades: null
    },
    
    // Dismissed items per combination
    dismissed: new Map(),
    
    // Auto refresh timer
    autoRefreshTimer: null,
    
    // Configuration
    config: { ...DEFAULT_CONFIG },
    
    // Counts per combination
    counts: {
      assignPlans: 0,
      assignTrades: 0,
      createPlans: 0,
      createTrades: 0
    }
  };

  // ===== DOM Elements Cache =====
  const elements = {
    container: null,
    
    // Header
    title: null,
    badge: null,
    
    // Action Tabs (Row 1)
    actionTabs: null,
    actionTabAssign: null,
    actionTabCreate: null,
    
    // Entity Tabs (Row 2)
    entityTabs: null,
    entityTabPlans: null,
    entityTabTrades: null,
    
    // Tab Content Panes
    paneAssignPlans: null,
    paneAssignTrades: null,
    paneCreatePlans: null,
    paneCreateTrades: null,
    
    // Common elements per pane
    loading: {},
    error: {},
    empty: {},
    list: {},
    count: {}
  };

  // ===== Private Functions =====
  
  /**
   * Get combination key from action and entity
   */
  function getCombinationKey(action, entity) {
    return `${action}${entity.charAt(0).toUpperCase() + entity.slice(1)}`;
  }
  
  /**
   * Get dismissed cache key for combination
   */
  function getDismissedCacheKey(combination) {
    return `${DISMISSED_CACHE_KEY_PREFIX}-${combination}`;
  }
  
  /**
   * Cache DOM elements
   */
  function cacheElements() {
    console.log('🔵 cacheElements called, CONTAINER_ID:', CONTAINER_ID);
    window.Logger?.info?.('🔵 cacheElements called, looking for container:', { containerId: CONTAINER_ID });
    
    elements.container = document.getElementById(CONTAINER_ID);
    
    console.log('🔵 Container found:', !!elements.container);
    window.Logger?.info?.('🔵 Container found:', { 
      found: !!elements.container,
      containerId: CONTAINER_ID
    });
    
    if (!elements.container) {
      console.error('🔴 cacheElements: Container not found!', CONTAINER_ID);
      window.Logger?.error?.('🔴 cacheElements: Container not found!', { containerId: CONTAINER_ID });
      return false;
    }

    try {
      console.log('🟢 Container found, starting to cache elements...');
      window.Logger?.info?.('🟢 Container found, caching elements...');
      
      // Header
      console.log('🟢 Caching header elements...');
      elements.title = elements.container.querySelector('#unifiedPendingActionsWidgetTitle');
      elements.badge = elements.container.querySelector('#unifiedPendingActionsWidgetBadge');
      
      // Action Tabs
      console.log('🟢 Caching action tabs...');
      elements.actionTabs = elements.container.querySelector('#unifiedPendingActionsActionTabs');
      elements.actionTabAssign = elements.container.querySelector('#actionTabAssign');
      elements.actionTabCreate = elements.container.querySelector('#actionTabCreate');
      
      // Entity Tabs
      console.log('🟢 Caching entity tabs...');
      elements.entityTabs = elements.container.querySelector('#unifiedPendingActionsEntityTabs');
      elements.entityTabPlans = elements.container.querySelector('#entityTabPlans');
      elements.entityTabTrades = elements.container.querySelector('#entityTabTrades');
      
      // Content Panes - using camelCase property names
      console.log('🟢 Caching content panes...');
      elements.paneAssignPlans = elements.container.querySelector('#paneAssignPlans');
      elements.paneAssignTrades = elements.container.querySelector('#paneAssignTrades');
      elements.paneCreatePlans = elements.container.querySelector('#paneCreatePlans');
      elements.paneCreateTrades = elements.container.querySelector('#paneCreateTrades');
      
      console.log('🟢 Panes found:', {
        assignPlans: !!elements.paneAssignPlans,
        assignTrades: !!elements.paneAssignTrades,
        createPlans: !!elements.paneCreatePlans,
        createTrades: !!elements.paneCreateTrades
      });
      
      // Store in a map for easier lookup
      elements.panes = {
        assignPlans: elements.paneAssignPlans,
        assignTrades: elements.paneAssignTrades,
        createPlans: elements.paneCreatePlans,
        createTrades: elements.paneCreateTrades
      };
      
      // Cache elements for each pane
      console.log('🟢 Caching pane elements...');
      const combinations = ['assignPlans', 'assignTrades', 'createPlans', 'createTrades'];
      combinations.forEach(combination => {
        try {
          const pane = elements.panes[combination];
          console.log(`🟢 Processing combination: ${combination}, pane found:`, !!pane);
          if (pane) {
            elements.loading[combination] = pane.querySelector(`#${combination}Loading`);
            elements.error[combination] = pane.querySelector(`#${combination}Error`);
            elements.empty[combination] = pane.querySelector(`#${combination}Empty`);
            elements.list[combination] = pane.querySelector(`#${combination}List`);
            elements.count[combination] = pane.querySelector(`#${combination}Count`);
            console.log(`🟢 ${combination} elements cached:`, {
              loading: !!elements.loading[combination],
              error: !!elements.error[combination],
              empty: !!elements.empty[combination],
              list: !!elements.list[combination],
              count: !!elements.count[combination]
            });
          } else {
            console.warn(`⚠️ Pane not found for combination: ${combination}`);
          }
        } catch (error) {
          console.error(`🔴 Error caching elements for ${combination}:`, error);
          window.Logger?.error?.('Error caching elements for combination', { combination, error });
        }
      });

      console.log('✅ cacheElements completed successfully');
      window.Logger?.info?.('✅ cacheElements completed successfully');
      return true;
    } catch (error) {
      console.error('🔴 Error in cacheElements:', error);
      window.Logger?.error?.('Error in cacheElements', { error: error.message, stack: error.stack });
      return false;
    }
  }
  
  /**
   * Load dismissed items from cache
   */
  function loadDismissedItems() {
    const combinations = ['assignPlans', 'assignTrades', 'createPlans', 'createTrades'];
    
    combinations.forEach(combination => {
      try {
        const cacheKey = getDismissedCacheKey(combination);
        const cached = window.UnifiedCacheManager?.get(cacheKey);
        if (Array.isArray(cached) && cached.length > 0) {
          state.dismissed.set(combination, new Set(cached));
        } else {
          state.dismissed.set(combination, new Set());
        }
      } catch (error) {
        window.Logger?.warn?.('Failed to load dismissed items', { error, combination });
        state.dismissed.set(combination, new Set());
      }
    });
  }
  
  /**
   * Persist dismissed items to cache
   */
  function persistDismissedItems(combination) {
    try {
      const cacheKey = getDismissedCacheKey(combination);
      const dismissedSet = state.dismissed.get(combination) || new Set();
      window.UnifiedCacheManager?.set(
        cacheKey,
        Array.from(dismissedSet),
        { ttl: DISMISSED_TTL_SECONDS }
      );
    } catch (error) {
      window.Logger?.warn?.('Failed to persist dismissed items', { error, combination });
    }
  }
  
  /**
   * Get dismiss key for item
   */
  function getDismissKey(combination, item) {
    if (combination === 'assignPlans') {
      return `assignment-${item.trade_id}-${item?.primary_suggestion?.trade_plan_id || 'none'}`;
    }
    if (combination === 'createPlans') {
      return `creation-${item.trade_id}`;
    }
    if (combination === 'assignTrades') {
      return `execution-${item.execution?.id || 'none'}`;
    }
    if (combination === 'createTrades') {
      return `cluster-${item.cluster_id || 'none'}`;
    }
    return `item-${JSON.stringify(item)}`;
  }
  
  /**
   * Bind events
   */
  function bindEvents() {
    // Action tab switching - custom logic (not Bootstrap tabs)
    if (elements.actionTabAssign) {
      elements.actionTabAssign.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveAction('assign');
      });
    }
    
    if (elements.actionTabCreate) {
      elements.actionTabCreate.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveAction('create');
      });
    }
    
    // Entity tab switching - custom logic (not Bootstrap tabs)
    if (elements.entityTabPlans) {
      elements.entityTabPlans.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveEntity('plans');
      });
    }
    
    if (elements.entityTabTrades) {
      elements.entityTabTrades.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveEntity('trades');
      });
    }
    
    // Delegate click events for action buttons
    Object.keys(elements.list).forEach(combination => {
      if (elements.list[combination]) {
        elements.list[combination].addEventListener('click', (event) => {
          handleListItemClick(event, combination);
        });
        
        // Hover events for expandable details - using event delegation
        let hideTimer = null;
        elements.list[combination].addEventListener('mouseenter', (event) => {
          const item = event.target.closest('.unified-pending-list-item');
          if (item) {
            if (hideTimer) {
              clearTimeout(hideTimer);
              hideTimer = null;
            }
            item.classList.add('is-hovered');
          }
        }, true);
        
        elements.list[combination].addEventListener('mouseleave', (event) => {
          const item = event.target.closest('.unified-pending-list-item');
          if (item) {
            if (hideTimer) {
              clearTimeout(hideTimer);
            }
            hideTimer = setTimeout(() => {
              item.classList.remove('is-hovered');
              hideTimer = null;
            }, 160);
          }
        }, true);
        
        // Focus events for accessibility
        elements.list[combination].addEventListener('focusin', (event) => {
          const item = event.target.closest('.unified-pending-list-item');
          if (item) {
            if (hideTimer) {
              clearTimeout(hideTimer);
              hideTimer = null;
            }
            item.classList.add('is-hovered');
          }
        }, true);
        
        elements.list[combination].addEventListener('focusout', (event) => {
          const item = event.target.closest('.unified-pending-list-item');
          if (item && !item.contains(event.relatedTarget)) {
            if (hideTimer) {
              clearTimeout(hideTimer);
            }
            hideTimer = setTimeout(() => {
              item.classList.remove('is-hovered');
              hideTimer = null;
            }, 160);
          }
        }, true);
      }
    });
  }
  
  /**
   * Set active action and update UI
   */
  function setActiveAction(action) {
    if (state.activeAction === action) return;
    
    state.activeAction = action;
    
    // Update action tabs
    if (elements.actionTabAssign) {
      elements.actionTabAssign.classList.toggle('active', action === 'assign');
    }
    if (elements.actionTabCreate) {
      elements.actionTabCreate.classList.toggle('active', action === 'create');
    }
    
    // Update active pane based on new action + current entity
    updateActivePane();
    
    // Load data for new combination
    loadCombinationData(state.activeAction, state.activeEntity);
  }
  
  /**
   * Set active entity and update UI
   */
  function setActiveEntity(entity) {
    if (state.activeEntity === entity) return;
    
    state.activeEntity = entity;
    
    // Update entity tabs
    if (elements.entityTabPlans) {
      elements.entityTabPlans.classList.toggle('active', entity === 'plans');
    }
    if (elements.entityTabTrades) {
      elements.entityTabTrades.classList.toggle('active', entity === 'trades');
    }
    
    // Update active pane based on current action + new entity
    updateActivePane();
    
    // Load data for new combination
    loadCombinationData(state.activeAction, state.activeEntity);
  }
  
  /**
   * Update active pane based on current action + entity combination
   */
  function updateActivePane() {
    const combination = getCombinationKey(state.activeAction, state.activeEntity);
    
    // Hide all panes
    Object.keys(elements.panes).forEach(key => {
      const pane = elements.panes[key];
      if (pane) {
        pane.classList.remove('active', 'show');
        pane.style.display = 'none';
      }
    });
    
    // Show active pane using the combination key
    const activePane = elements.panes[combination];
    
    if (activePane) {
      activePane.classList.add('active', 'show');
      activePane.style.display = 'flex';
    }
    
    window.Logger?.debug?.('Updated active pane', { 
      action: state.activeAction,
      entity: state.activeEntity,
      combination,
      hasPane: !!activePane
    });
  }
  
  /**
   * Update entity tabs visibility based on active action
   */
  function updateEntityTabsVisibility() {
    if (!elements.entityTabs) return;
    
    // Both entity tabs are always visible, but we ensure correct active state
    // This function can be extended if we need to hide/show tabs dynamically
    window.Logger?.debug?.('Updated entity tabs visibility', { 
      action: state.activeAction,
      entity: state.activeEntity 
    });
  }
  
  /**
   * Handle list item click
   */
  function handleListItemClick(event, combination) {
    const button = event.target.closest('[data-button-type]');
    if (!button) return;
    
    const buttonType = button.dataset.buttonType;
    const itemId = button.dataset.itemId;
    
    if (!itemId) return;
    
    // Find the item in data - check multiple ID sources
    const items = state.data[combination] || [];
    const item = items.find(i => {
      const id = getItemId(i, combination);
      // Also check specific IDs from button data attributes
      if (combination === 'assignPlans' || combination === 'createPlans') {
        const tradeId = button.dataset.tradeId;
        return String(id) === String(itemId) || 
               (tradeId && (i.trade_id === Number(tradeId) || i.trade?.id === Number(tradeId)));
      }
      if (combination === 'assignTrades') {
        const executionId = button.dataset.executionId;
        return String(id) === String(itemId) || 
               (executionId && i.execution?.id === Number(executionId));
      }
      if (combination === 'createTrades') {
        const clusterId = button.dataset.clusterId;
        return String(id) === String(itemId) || 
               (clusterId && i.cluster_id === clusterId);
      }
      return String(id) === String(itemId);
    });
    
    if (!item) {
      window.Logger?.warn?.('Item not found for click', { itemId, combination, buttonType });
      return;
    }
    
    // Prevent default if it's a form button
    if (button.type === 'submit') {
      event.preventDefault();
    }
    
    if (buttonType === 'APPROVE' || buttonType === 'PRIMARY') {
      handleApprove(item, combination);
    } else if (buttonType === 'REJECT' || buttonType === 'DISMISS') {
      handleDismiss(item, combination);
    }
  }
  
  /**
   * Get item ID based on combination
   */
  function getItemId(item, combination) {
    if (combination === 'assignPlans' || combination === 'createPlans') {
      return item.trade_id || item.trade?.id;
    }
    if (combination === 'assignTrades') {
      return item.execution?.id;
    }
    if (combination === 'createTrades') {
      return item.cluster_id;
    }
    return item.id;
  }
  
  /**
   * Handle approve action
   */
  async function handleApprove(item, combination) {
    window.Logger?.info?.('Handling approve action', { combination, item });
    
    try {
      if (combination === 'assignPlans') {
        await UnifiedPendingActionsWidget.assignTradeToPlan(item);
      } else if (combination === 'assignTrades') {
        await UnifiedPendingActionsWidget.assignExecutionToTrade(item);
      } else if (combination === 'createPlans') {
        await UnifiedPendingActionsWidget.openPlanCreationModal(item);
      } else if (combination === 'createTrades') {
        await UnifiedPendingActionsWidget.openTradeCreationModal(item);
      }
    } catch (error) {
      window.Logger?.error?.('Approve action failed', { error, combination });
      window.NotificationSystem?.showError?.('הפעולה נכשלה. נא לנסות שוב.');
    }
  }
  
  /**
   * Handle dismiss action
   */
  function handleDismiss(item, combination) {
    window.Logger?.info?.('Handling dismiss action', { combination, item });
    
    const dismissKey = getDismissKey(combination, item);
    const dismissedSet = state.dismissed.get(combination) || new Set();
    dismissedSet.add(dismissKey);
    state.dismissed.set(combination, dismissedSet);
    
    persistDismissedItems(combination);
    
    // Remove item from data and re-render
    state.data[combination] = state.data[combination].filter(i => {
      const id = getItemId(i, combination);
      const itemIdToRemove = getItemId(item, combination);
      return String(id) !== String(itemIdToRemove);
    });
    
    // Update count for this combination
    state.counts[combination] = state.data[combination].length;
    
    // Update count badge for this combination
    if (elements.count[combination]) {
      elements.count[combination].textContent = state.counts[combination];
    }
    
    renderCombination(combination);
    updateBadge();
  }
  
  /**
   * Load data for specific combination
   */
  async function loadCombinationData(action, entity) {
    const combination = getCombinationKey(action, entity);
    
    if (state.loading[combination]) {
      return; // Already loading
    }
    
    state.loading[combination] = true;
    state.errors[combination] = null;
    
    toggleLoadingState(combination, true);
    hideError(combination);
    
    try {
      const endpoint = API_ENDPOINTS[combination];
      if (!endpoint) {
        throw new Error(`No endpoint defined for combination: ${combination}`);
      }
      
      const params = new URLSearchParams();
      params.set('limit', String(state.config.defaultItemsLimit));
      params.set('_t', String(Date.now())); // Cache busting
      
      // Add combination-specific parameters
      if (combination === 'assignPlans') {
        params.set('suggestions', '3');
      }
      
      window.Logger?.info?.('Fetching data for combination', { combination, endpoint });
      
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      // Handle errors with CRUDResponseHandler if available
      if (!response.ok && window.CRUDResponseHandler?.handleLoadResponse) {
        window.CRUDResponseHandler.handleLoadResponse(response, {
          tableId: `${combination}List`,
          entityName: `הצעות ${combination}`,
          onRetry: () => loadCombinationData(action, entity)
        });
        state.data[combination] = [];
        state.counts[combination] = 0;
        if (elements.count[combination]) {
          elements.count[combination].textContent = '0';
        }
        renderCombination(combination);
        updateBadge();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const payload = await response.json();
      if (payload.status !== 'success') {
        throw new Error(payload?.error?.message || 'API error');
      }
      
      let data = Array.isArray(payload.data) ? payload.data : [];
      
      // Special handling for assignTrades - filter by score >= 50
      if (combination === 'assignTrades') {
        data = data.filter(highlight => {
          const bestScore = normalizeScore(highlight.best_score ?? highlight.primary_suggestion?.score);
          return typeof bestScore === 'number' && bestScore >= 50;
        });
      }
      
      // Filter dismissed items
      const dismissedSet = state.dismissed.get(combination) || new Set();
      data = data.filter(item => {
        const dismissKey = getDismissKey(combination, item);
        return !dismissedSet.has(dismissKey);
      });
      
      state.data[combination] = data;
      
      window.Logger?.info?.('🔵 Data loaded for combination', { 
        combination, 
        dataLength: data.length,
        dataIsArray: Array.isArray(data),
        firstItemKeys: data.length > 0 ? Object.keys(data[0]) : null,
        firstItemSample: data.length > 0 ? JSON.stringify(data[0]).substring(0, 200) : null
      });
      
      // Store in state
      state.data[combination] = data || [];
      
      window.Logger?.info?.('🟢 Data stored in state', {
        combination,
        stateDataLength: state.data[combination]?.length || 0,
        stateDataExists: !!state.data[combination],
        stateDataIsArray: Array.isArray(state.data[combination])
      });
      
      // Calculate count per combination
      if (combination === 'assignPlans' || combination === 'createPlans') {
        state.counts[combination] = data.length;
      } else if (combination === 'assignTrades') {
        // For assignTrades, use total_eligible from meta or filtered count
        state.counts[combination] = payload.meta?.total_eligible || data.length;
      } else if (combination === 'createTrades') {
        state.counts[combination] = data.length;
      }
      
      window.Logger?.info?.('🟡 Count calculated', {
        combination,
        count: state.counts[combination],
        dataLength: data.length
      });
      
      // Update count badge for this combination
      if (elements.count[combination]) {
        elements.count[combination].textContent = state.counts[combination];
        // Show/hide count badge based on count
        if (state.counts[combination] > 0) {
          elements.count[combination].classList.remove('d-none');
        } else {
          elements.count[combination].classList.add('d-none');
        }
        window.Logger?.info?.('🟢 Count badge updated', {
          combination,
          countElement: elements.count[combination].textContent,
          countElementId: elements.count[combination].id
        });
      } else {
        window.Logger?.error?.('🔴 Count element not found!', {
          combination,
          availableCounts: Object.keys(elements.count)
        });
      }
      
      window.Logger?.info?.('🟡 About to render combination', { 
        combination, 
        dataLength: state.data[combination]?.length || 0,
        count: state.counts[combination],
        stateData: state.data[combination] ? 'exists' : 'missing'
      });
      
      renderCombination(combination);
      updateBadge();
      
    } catch (error) {
      window.Logger?.error?.('Failed to load data for combination', { error, combination });
      state.errors[combination] = error;
      showError(combination, error.message || 'שגיאה בטעינת הנתונים');
    } finally {
      state.loading[combination] = false;
      toggleLoadingState(combination, false);
    }
  }
  
  /**
   * Toggle loading state
   */
  function toggleLoadingState(combination, isLoading) {
    if (elements.loading[combination]) {
      elements.loading[combination].classList.toggle('d-none', !isLoading);
    }
    if (elements.list[combination]) {
      elements.list[combination].classList.toggle('d-none', isLoading);
    }
  }
  
  /**
   * Show error
   */
  function showError(combination, message) {
    if (elements.error[combination]) {
      elements.error[combination].textContent = message;
      elements.error[combination].classList.remove('d-none');
    }
  }
  
  /**
   * Hide error
   */
  function hideError(combination) {
    if (elements.error[combination]) {
      elements.error[combination].classList.add('d-none');
    }
  }
  
  /**
   * Render combination
   */
  function renderCombination(combination) {
    const data = state.data[combination] || [];
    const loading = state.loading[combination];
    const error = state.errors[combination];
    
    window.Logger?.info?.('🔴 renderCombination called', { 
      combination, 
      dataLength: data.length,
      dataIsArray: Array.isArray(data),
      dataType: typeof data,
      dataSample: data.length > 0 ? JSON.stringify(data[0]).substring(0, 200) : 'empty',
      loading, 
      hasError: !!error,
      listElement: !!elements.list[combination],
      listElementId: elements.list[combination]?.id || 'not found'
    });
    
    // Hide loading state
    if (elements.loading[combination]) {
      elements.loading[combination].classList.add('d-none');
    }
    
    // Hide error state
    if (elements.error[combination]) {
      elements.error[combination].classList.add('d-none');
    }
    
    if (loading) {
      // Show loading, hide list
      if (elements.loading[combination]) {
        elements.loading[combination].classList.remove('d-none');
      }
      if (elements.list[combination]) {
        elements.list[combination].classList.add('d-none');
      }
      return;
    }
    
    if (error) {
      showError(combination, error.message || 'שגיאה בטעינת הנתונים');
      hideEmptyState(combination);
      if (elements.list[combination]) {
        elements.list[combination].classList.add('d-none');
      }
      return;
    }
    
    if (data.length === 0) {
      window.Logger?.warn?.('🟠 renderCombination: No data, showing empty state', { combination });
      showEmptyState(combination);
      if (elements.list[combination]) {
        elements.list[combination].classList.add('d-none');
      }
      return;
    }
    
    // We have data - show list, hide empty state
    hideEmptyState(combination);
    
    const list = elements.list[combination];
    if (!list) {
      window.Logger?.error?.('🔴 renderCombination: List element not found!', { 
        combination,
        availableLists: Object.keys(elements.list),
        listExists: !!elements.list[combination]
      });
      return;
    }
    
    window.Logger?.info?.('🟢 renderCombination: List element found', {
      combination,
      listId: list.id,
      listClassName: list.className,
      listTagName: list.tagName,
      listInnerHTMLBefore: list.innerHTML.substring(0, 50)
    });
    
    // Ensure list is visible
    list.classList.remove('d-none');
    list.style.display = 'block';
    
    // Clear existing content
    list.innerHTML = '';
    
    // Limit items based on config
    const maxItems = state.config.defaultItemsLimit || 4;
    const itemsToShow = data.slice(0, maxItems);
    
    window.Logger?.info?.('🔵 Rendering combination items', { 
      combination, 
      totalItems: data.length, 
      showingItems: itemsToShow.length,
      maxItems,
      itemsToShowSample: itemsToShow.length > 0 ? Object.keys(itemsToShow[0]) : []
    });
    
    if (itemsToShow.length === 0) {
      window.Logger?.warn?.('No items to show after filtering', { combination, dataLength: data.length });
      showEmptyState(combination);
      return;
    }
    
    // Render all items as HTML string (like old widgets)
    const htmlItems = itemsToShow.map((item, index) => {
      try {
        window.Logger?.info?.('🔵 Rendering list item', { 
          combination, 
          index, 
          itemKeys: Object.keys(item),
          itemSample: JSON.stringify(item).substring(0, 200)
        });
        const html = renderListItem(item, combination, index);
        window.Logger?.info?.('🟡 renderListItem returned', {
          combination,
          index,
          htmlLength: html ? html.length : 0,
          htmlStartsWith: html ? html.substring(0, 50) : 'null',
          htmlEndsWith: html && html.length > 50 ? html.substring(html.length - 50) : 'null'
        });
        if (html && html.trim().length > 0) {
          return html;
        } else {
          window.Logger?.error?.('🔴 renderListItem returned empty!', { combination, index, item });
          return '';
        }
      } catch (error) {
        window.Logger?.error?.('🔴 Error rendering list item', { 
          error: error.message, 
          combination, 
          index, 
          item,
          errorStack: error.stack 
        });
        return '';
      }
    }).filter(html => html && html.trim().length > 0);
    
    window.Logger?.info?.('🟢 All items rendered', {
      combination,
      htmlItemsCount: htmlItems.length,
      itemsToShowCount: itemsToShow.length,
      totalHTMLLength: htmlItems.join('').length,
      firstHTMLSample: htmlItems.length > 0 ? htmlItems[0].substring(0, 100) : 'no items'
    });
    
    // Set HTML directly (like old widgets do)
    if (htmlItems.length > 0) {
      const fullHTML = htmlItems.join('');
      window.Logger?.info?.('🟢 About to set innerHTML', {
        combination,
        itemsCount: htmlItems.length,
        htmlLength: fullHTML.length,
        listId: list.id,
        listBeforeLength: list.innerHTML.length
      });
      list.innerHTML = fullHTML;
      window.Logger?.info?.('✅ List HTML set successfully!', { 
        combination, 
        itemsCount: htmlItems.length, 
        htmlLength: fullHTML.length,
        listAfterLength: list.innerHTML.length,
        listChildrenCount: list.children.length,
        listChildren: Array.from(list.children).map(child => ({ tag: child.tagName, id: child.id, class: child.className }))
      });
    } else {
      window.Logger?.error?.('🔴 No HTML items generated!', { 
        combination, 
        itemsToShowLength: itemsToShow.length,
        dataLength: data.length
      });
      showEmptyState(combination);
    }
    
    // Process buttons after rendering
    if (window.ButtonSystem?.processButtons) {
      window.ButtonSystem.processButtons(list);
    }
    
    window.Logger?.info?.('Combination rendered successfully', { 
      combination, 
      itemsCount: itemsToShow.length,
      listElementExists: !!list,
      listChildrenCount: list.children.length
    });
  }
  
  /**
   * Show empty state
   */
  function showEmptyState(combination) {
    if (elements.empty[combination]) {
      elements.empty[combination].classList.remove('d-none');
    }
    // Hide list when showing empty state
    if (elements.list[combination]) {
      elements.list[combination].classList.add('d-none');
    }
  }
  
  /**
   * Hide empty state
   */
  function hideEmptyState(combination) {
    if (elements.empty[combination]) {
      elements.empty[combination].classList.add('d-none');
    }
    // Show list when hiding empty state
    if (elements.list[combination]) {
      elements.list[combination].classList.remove('d-none');
    }
  }
  
  /**
   * Helper: Normalize score value
   */
  function normalizeScore(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  
  /**
   * Helper: Format date
   */
  function formatDate(value) {
    if (window.FieldRendererService?.renderDateShort) {
      try {
        return window.FieldRendererService.renderDateShort(value) || '-';
      } catch (error) {
        window.Logger?.warn?.('renderDateShort failed', { error });
      }
    }
    if (window.FieldRendererService?.renderDate) {
      try {
        return window.FieldRendererService.renderDate(value, false) || '-';
      } catch (error) {
        window.Logger?.warn?.('renderDate failed', { error });
      }
    }
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  /**
   * Helper: Format quantity
   */
  function formatQuantity(value) {
    if (window.FieldRendererService?.renderShares) {
      try {
        return window.FieldRendererService.renderShares(value) || '-';
      } catch (error) {
        window.Logger?.warn?.('renderShares failed', { error });
      }
    }
    if (value === null || value === undefined) return '-';
    return String(value);
  }
  
  /**
   * Helper: Format date range
   */
  function formatDateRange(dateRange) {
    if (!dateRange || (!dateRange.start && !dateRange.end)) return '';
    const start = formatDate(dateRange.start);
    const end = formatDate(dateRange.end);
    if (start === end) return start;
    return `${start} - ${end}`;
  }
  
  /**
   * Render list item HTML string - like old widgets
   * Each render*Item function should return full HTML with <li> tag
   */
  function renderListItem(item, combination, index) {
    let html = '';
    
    if (combination === 'assignPlans') {
      html = renderAssignPlansItem(item);
    } else if (combination === 'assignTrades') {
      html = renderAssignTradesItem(item);
    } else if (combination === 'createPlans') {
      html = renderCreatePlansItem(item);
    } else if (combination === 'createTrades') {
      html = renderCreateTradesItem(item);
    } else {
      const itemId = getItemId(item, combination);
      html = `<li class="unified-pending-list-item" data-item-id="${itemId}"><p>Unknown combination: ${combination}</p></li>`;
    }
    
    // Validate that HTML starts with <li
    if (!html.trim().startsWith('<li')) {
      const itemId = getItemId(item, combination);
      window.Logger?.warn?.('renderListItem: HTML does not start with <li, wrapping it', { combination, html: html.substring(0, 100) });
      html = `<li class="unified-pending-list-item" data-item-id="${itemId}">${html}</li>`;
    }
    
    return html;
  }
  
  /**
   * Render Assign Plans item (assign trade to existing plan)
   */
  function renderAssignPlansItem(item) {
    window.Logger?.info?.('🟡 renderAssignPlansItem called', {
      itemKeys: Object.keys(item),
      hasTrade: !!item.trade,
      hasSuggestion: !!item.primary_suggestion
    });
    const trade = item.trade || {};
    const suggestion = item.primary_suggestion || {};
    const plan = suggestion.plan || {};
    const score = normalizeScore(item.best_score ?? suggestion.score);
    const FieldRenderer = window.FieldRendererService;
    const itemId = getItemId(item, 'assignPlans');
    
    const tradeTitle = FieldRenderer?.renderLinkedEntity?.('trade', trade.id, trade.ticker_symbol || `טרייד #${trade.id}`, { short: true })
      || `<span class="fw-semibold">${trade.ticker_symbol || `טרייד #${trade.id}`}</span>`;
    const accountBadge = FieldRenderer?.renderLinkedEntity?.('trading_account', trade.trading_account_id, trade.account_name, { short: true })
      || (trade.account_name ? `<span class="badge bg-body-secondary text-body">${trade.account_name}</span>` : '');
    const planBadge = FieldRenderer?.renderLinkedEntity?.('trade_plan', plan.id, plan.ticker_symbol ? `${plan.ticker_symbol} • ${plan.status || ''}` : `תכנון #${plan.id}`, { short: true })
      || (plan.id ? `<span class="badge bg-body-secondary text-body">תכנון #${plan.id}</span>` : '<span class="text-muted small">תוכנית לא ידועה</span>');
    const statusBadge = FieldRenderer?.renderStatus?.(plan.status, 'trade_plan') || '';
    const sideBadge = FieldRenderer?.renderSide?.(trade.side) || '';
    const scoreBadge = typeof score === 'number'
      ? `<span class="badge unified-pending-badge-score" data-tooltip="מדד התאמה">${score}</span>`
      : '';
    
    const reasons = Array.isArray(suggestion.match_reasons) ? suggestion.match_reasons : [];
    const reasonsList = reasons.length
      ? `<ul class="list-unstyled mb-0 text-muted small mt-2">
          ${reasons.map(reason => `<li class="d-flex align-items-center gap-1"><span class="badge bg-body-secondary text-body">•</span>${reason}</li>`).join('')}
         </ul>`
      : '';
    
    const createdAt = formatDate(trade.created_at);
    
    // Return full HTML with <li> tag (like old widgets)
    const html = `
      <li class="unified-pending-list-item" data-item-id="${itemId}">
        <div class="unified-pending-item-header">
          <div class="unified-pending-item-title d-flex flex-wrap align-items-center gap-2">
            ${tradeTitle}
            ${accountBadge || ''}
            ${sideBadge || ''}
            <span class="text-muted small">${createdAt}</span>
          </div>
          <div class="unified-pending-item-actions">
            ${scoreBadge}
            <button
              data-button-type="APPROVE"
              data-variant="small"
              data-item-id="${itemId}"
              data-trade-id="${trade.id}"
              data-plan-id="${plan.id}"
              data-text="שייך"
              title="שיוך לתוכנית קיימת">
            </button>
            <button
              data-button-type="REJECT"
              data-variant="small"
              data-item-id="${itemId}"
              data-trade-id="${trade.id}"
              data-plan-id="${plan.id}"
              data-text="דחה"
              title="הסתר הצעה זו">
            </button>
          </div>
        </div>
        <div class="unified-pending-details">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="text-muted small fw-semibold">תוכנית מומלצת:</span>
            ${planBadge}
            ${statusBadge || ''}
          </div>
          ${reasonsList}
        </div>
      </li>
    `;
    
    window.Logger?.info?.('✅ renderAssignPlansItem returning HTML', {
      htmlLength: html.length,
      htmlStartsWith: html.substring(0, 100),
      startsWithLi: html.trim().startsWith('<li'),
      itemId
    });
    
    return html;
  }
  
  /**
   * Render Assign Trades item (assign execution to trade)
   */
  function renderAssignTradesItem(item) {
    const execution = item.execution || {};
    const suggestions = Array.isArray(item.suggestions) ? item.suggestions : [];
    const primarySuggestion = item.primary_suggestion || suggestions[0] || null;
    const rawScore = item.best_score ?? (primarySuggestion ? primarySuggestion.score : null);
    const score = normalizeScore(rawScore);
    const FieldRenderer = window.FieldRendererService;
    
    const tickerLink = FieldRenderer?.renderLinkedEntity('ticker', execution.ticker_id, execution.ticker_symbol, { short: true }) || execution.ticker_symbol || '-';
    const actionBadge = FieldRenderer?.renderAction?.(execution.action) || `<span class="badge bg-secondary">${execution.action || '-'}</span>`;
    const actionBadgeDetailed = FieldRenderer?.renderAction?.(execution.action) || `<span class="badge bg-secondary">${execution.action || '-'}</span>`;
    const quantityDisplay = FieldRenderer?.renderShares?.(execution.quantity) || `<span class="text-muted">${execution.quantity ?? '-'}</span>`;
    const executionDate = formatDate(execution.date);
    const executionPrice = typeof FieldRenderer?.renderAmount === 'function'
      ? FieldRenderer.renderAmount(execution.price, '$', 2, false)
      : (execution.price ? `$${parseFloat(execution.price).toFixed(2)}` : '-');
    
    const scoreBadge = typeof score === 'number'
      ? `<span class="badge unified-pending-badge-score" data-tooltip="מדד התאמה">${score}</span>`
      : '';
    
    const additionalSuggestions = item.additional_suggestions ?? Math.max(suggestions.length - 1, 0);
    const additionalText = additionalSuggestions > 0
      ? `<span class="text-muted small">+${additionalSuggestions} נוספות</span>`
      : '';
    
    const itemId = getItemId(item, 'assignTrades');
    
    // Build execution details for hover
    const executionFee = typeof FieldRenderer?.renderAmount === 'function'
      ? FieldRenderer.renderAmount(execution.fee, '$', 2, false)
      : (execution.fee ? `$${parseFloat(execution.fee).toFixed(2)}` : '-');
    const executionValue = typeof FieldRenderer?.renderAmount === 'function'
      ? FieldRenderer.renderAmount(execution.value, '$', 2, false)
      : (execution.value ? `$${parseFloat(execution.value).toFixed(2)}` : '-');
    
    // Trade details
    const trade = primarySuggestion?.trade || {};
    const tradeStatus = FieldRenderer?.renderStatus?.(trade.status, 'trade') || '';
    const tradeSide = FieldRenderer?.renderSide?.(trade.side) || '';
    const investmentType = trade.investment_type ? `<span class="badge bg-body-secondary text-body">${trade.investment_type}</span>` : '';
    const tradeDate = formatDate(trade.created_at);
    const tradeClosedDate = trade.closed_at ? formatDate(trade.closed_at) : null;
    
    // Match reasons
    const matchReasons = Array.isArray(primarySuggestion?.match_reasons) ? primarySuggestion.match_reasons : [];
    const matchReasonsHtml = matchReasons.length > 0
      ? `<ul class="list-unstyled mb-0 text-muted small mt-2">
          ${matchReasons.map(reason => `<li class="d-flex align-items-center gap-1"><span class="badge bg-body-secondary text-body">•</span>${reason}</li>`).join('')}
         </ul>`
      : '';
    
    const tradeLink = primarySuggestion?.trade_id
      ? FieldRenderer?.renderLinkedEntity('trade', primarySuggestion.trade_id, `טרייד #${primarySuggestion.trade_id}`, { short: true }) || `טרייד #${primarySuggestion.trade_id}`
      : null;
    
    // Return full HTML with <li> tag (like old widgets)
    return `
      <li class="unified-pending-list-item" data-item-id="${itemId}">
        <div class="unified-pending-item-header">
          <div class="unified-pending-item-title d-flex flex-wrap align-items-center gap-2">
            ${tickerLink}
            ${actionBadge}
            ${quantityDisplay}
            <span class="text-muted small">${executionDate}</span>
            ${additionalText}
          </div>
          <div class="unified-pending-item-actions">
            ${scoreBadge}
            <button
              data-button-type="APPROVE"
              data-variant="small"
              data-item-id="${itemId}"
              data-execution-id="${execution.id}"
              data-trade-id="${primarySuggestion?.trade_id || ''}"
              data-text="אשר שיוך"
              ${!primarySuggestion ? 'disabled' : ''}
              title="שיוך ביצוע לטרייד">
            </button>
            <button
              data-button-type="REJECT"
              data-variant="small"
              data-item-id="${itemId}"
              data-execution-id="${execution.id}"
              data-text="דחה"
              title="הסתר הצעה זו">
            </button>
          </div>
        </div>
        <div class="unified-pending-details">
          <div class="row g-2">
            <div class="col-12 col-md-6">
              <div class="bg-body-tertiary rounded-3 p-3 d-flex flex-column gap-2">
                <div class="fw-semibold text-muted small">פרטי ביצוע</div>
                <div class="d-flex flex-wrap gap-2 align-items-center">
                  ${actionBadgeDetailed}
                </div>
                <div class="d-flex flex-wrap gap-2 align-items-center">
                  ${quantityDisplay}
                  ${executionPrice}
                </div>
                <div class="text-muted small d-flex flex-wrap gap-2">
                  <span>${executionDate}</span>
                </div>
                ${executionFee !== '-' ? `<div class="text-muted small">עמלה: ${executionFee}</div>` : ''}
                ${executionValue !== '-' ? `<div class="text-muted small">שווי: ${executionValue}</div>` : ''}
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="bg-body-tertiary rounded-3 p-3 d-flex flex-column gap-2">
                <div class="fw-semibold text-muted small">פרטי טרייד מומלץ</div>
                ${primarySuggestion && tradeLink ? `
                  <div class="d-flex flex-wrap gap-2 align-items-center">
                    ${tradeLink}
                    ${tradeStatus}
                  </div>
                  <div class="d-flex flex-wrap gap-2 align-items-center">
                    ${tradeSide}
                    ${investmentType}
                  </div>
                  <div class="text-muted small d-flex flex-wrap gap-2">
                    <span>נפתח: ${tradeDate}</span>
                    ${tradeClosedDate ? `<span>נסגר: ${tradeClosedDate}</span>` : ''}
                  </div>
                  ${matchReasonsHtml}
                ` : `
                  <span class="text-muted">אין טרייד מומלץ</span>
                `}
              </div>
            </div>
          </div>
        </div>
      </li>
    `;
  }
  
  /**
   * Render Create Plans item (create new plan from trade)
   */
  function renderCreatePlansItem(item) {
    const trade = item.trade || {};
    const metrics = item.metrics || {};
    const prefill = item.prefill || {};
    const score = normalizeScore(item.score);
    const FieldRenderer = window.FieldRendererService;
    
    const tradeTitle = FieldRenderer?.renderLinkedEntity?.('trade', trade.id, trade.ticker_symbol || `טרייד #${trade.id}`, { short: true })
      || `<span class="fw-semibold">${trade.ticker_symbol || `טרייד #${trade.id}`}</span>`;
    const accountBadge = FieldRenderer?.renderLinkedEntity?.('trading_account', trade.trading_account_id, trade.account_name, { short: true })
      || (trade.account_name ? `<span class="badge bg-body-secondary text-body">${trade.account_name}</span>` : '');
    const sideBadge = FieldRenderer?.renderSide?.(trade.side) || '';
    const createdAt = formatDate(trade.created_at);
    const quantity = formatQuantity(metrics.net_quantity ?? metrics.buy_quantity);
    const amount = typeof prefill.planned_amount === 'number'
      ? FieldRenderer?.renderAmount?.(prefill.planned_amount, '$', 2, false)
      : null;
    
    const assignmentNotice = item.has_assignment_suggestion
      ? `<div class="alert alert-warning py-2 px-3 mb-2 text-muted small">
          טרייד זה קיבל גם הצעת שיוך לתוכנית קיימת (הוצג בעדיפות נמוכה ביצירת תוכנית).
         </div>`
      : '';
    
    const scoreBadge = typeof score === 'number'
      ? `<span class="badge unified-pending-badge-score" data-tooltip="מדד עדיפות">${score}</span>`
      : '';
    
    const itemId = getItemId(item, 'createPlans');
    
    // Return full HTML with <li> tag (like old widgets)
    return `
      <li class="unified-pending-list-item" data-item-id="${itemId}">
        <div class="unified-pending-item-header">
          <div class="unified-pending-item-title d-flex flex-wrap align-items-center gap-2">
            ${tradeTitle}
            ${accountBadge || ''}
            ${sideBadge || ''}
            <span class="text-muted small">${createdAt}</span>
          </div>
          <div class="unified-pending-item-actions">
            ${scoreBadge}
            <button
              data-button-type="PRIMARY"
              data-variant="small"
              data-item-id="${itemId}"
              data-trade-id="${trade.id}"
              data-text="פתח תוכנית"
              title="יצירת תוכנית חדשה">
            </button>
            <button
              data-button-type="REJECT"
              data-variant="small"
              data-item-id="${itemId}"
              data-trade-id="${trade.id}"
              data-text="דחה"
              title="הסתר הצעה זו">
            </button>
          </div>
        </div>
        <div class="unified-pending-details">
          <div class="details-stats">
            <span>כמות מוצעת: ${quantity}</span>
            ${amount ? `<span>•</span><span>סכום מתוכנן: ${amount}</span>` : ''}
            ${prefill.entry_date ? `<span>•</span><span>תאריך כניסה: ${formatDate(prefill.entry_date)}</span>` : ''}
          </div>
          ${assignmentNotice}
        </div>
      </li>
    `;
  }
  
  /**
   * Render Create Trades item (create trade from execution cluster)
   */
  function renderCreateTradesItem(item) {
    const cluster = item;
    const ticker = cluster.ticker || {};
    const tradingAccount = cluster.trading_account || {};
    const stats = cluster.stats || {};
    const dateRange = stats.date_range || {};
    
    const FieldRenderer = window.FieldRendererService;
    const tickerBadge = FieldRenderer?.renderLinkedEntity('ticker', ticker.id, ticker.symbol || 'לא מוגדר', { short: true }) || `<span class="badge bg-body-secondary text-body">${ticker.symbol || 'לא מוגדר'}</span>`;
    const accountBadge = tradingAccount.id
      ? FieldRenderer?.renderLinkedEntity('trading_account', tradingAccount.id, tradingAccount.name || 'לא מוגדר', { short: true }) || `<span class="badge bg-body-secondary text-body">${tradingAccount.name || 'חשבון לא ידוע'}</span>`
      : '<span class="badge bg-body-secondary text-body">ללא חשבון</span>';
    
    const sideBadge = cluster.side === 'long' 
      ? `<span class="badge badge-long">לונג</span>`
      : `<span class="badge badge-short">שורט</span>`;
    
    const executionCount = stats.execution_count || 0;
    const dateRangeText = formatDateRange(dateRange);
    
    // Calculate summary for details - use stats if available, otherwise compute
    const executions = cluster.executions || [];
    let totalValue = stats.total_value || 0;
    let avgPrice = stats.average_price || 0;
    
    if (!totalValue && executions.length > 0) {
      totalValue = executions.reduce((sum, exec) => {
        const value = parseFloat(exec.value) || (parseFloat(exec.price) || 0) * (parseFloat(exec.quantity) || 0);
        return sum + value;
      }, 0);
      
      const totalQuantity = executions.reduce((sum, exec) => sum + (parseFloat(exec.quantity) || 0), 0);
      avgPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;
    }
    
    const totalValueDisplay = totalValue ? `$${totalValue.toFixed(2)}` : '-';
    const averagePriceDisplay = avgPrice ? `$${avgPrice.toFixed(4)}` : '-';
    
    const itemId = getItemId(item, 'createTrades');
    
    // Return full HTML with <li> tag (like old widgets)
    return `
      <li class="unified-pending-list-item" data-item-id="${itemId}">
        <div class="unified-pending-item-header">
          <div class="unified-pending-item-title d-flex flex-wrap align-items-center gap-2">
            ${sideBadge}
            <span class="text-muted small">${executionCount} ביצועים</span>
            ${dateRangeText ? `<span class="text-muted small">${dateRangeText}</span>` : ''}
          </div>
          <div class="unified-pending-item-actions">
            <button
              data-button-type="APPROVE"
              data-variant="small"
              data-item-id="${itemId}"
              data-cluster-id="${cluster.cluster_id}"
              data-text="פתח טרייד"
              title="יצירת טרייד חדש עבור האשכול">
            </button>
            <button
              data-button-type="REJECT"
              data-variant="small"
              data-item-id="${itemId}"
              data-cluster-id="${cluster.cluster_id}"
              data-text="התעלם"
              title="הסתרת האשכול מהממשק">
            </button>
          </div>
        </div>
        <div class="unified-pending-item-meta d-flex flex-wrap align-items-center gap-2 mt-2">
          <span class="entity-icon-circle entity-icon-circle-sm d-flex align-items-center justify-content-center">
            <img src="images/icons/tickers.svg" alt="טיקר" width="12" height="12" />
          </span>
          ${tickerBadge}
          <span class="entity-icon-circle entity-icon-circle-sm d-flex align-items-center justify-content-center">
            <img src="images/icons/trading_accounts.svg" alt="חשבון" width="12" height="12" />
          </span>
          ${accountBadge}
        </div>
        <div class="unified-pending-details">
          <div class="details-stats">
            <span>שווי כולל: ${totalValueDisplay}</span>
            <span>•</span>
            <span>מחיר ממוצע: ${averagePriceDisplay}</span>
          </div>
          <div class="details-content mt-2">
            ${renderExecutionsList(cluster)}
          </div>
        </div>
      </li>
    `;
  }
  
  /**
   * Render executions list for cluster
   */
  function renderExecutionsList(cluster) {
    const executions = cluster.executions || [];
    if (executions.length === 0) return '';
    
    const FieldRenderer = window.FieldRendererService;
    
    return `
      <div class="trade-create-widget-executions">
        ${executions.map(exec => {
          const date = FieldRenderer?.renderExecutionDate?.(exec.date)
            || FieldRenderer?.renderDate?.(exec.date, true)
            || formatDate(exec.date);
          const value = exec.value ? `$${parseFloat(exec.value).toFixed(2)}` : 
                       (exec.quantity && exec.price ? `$${(parseFloat(exec.quantity) * parseFloat(exec.price)).toFixed(2)}` : '-');
          const actionText = FieldRenderer?.renderAction?.(exec.action || exec.type)?.replace(/<[^>]*>/g, '') || 
                            (exec.action || exec.type || 'buy');
          const quantity = exec.quantity || '-';
          
          return `
            <div class="trade-create-widget-execution d-flex justify-content-between gap-2">
              <span class="text-muted">${date} • ${actionText} • ${quantity}</span>
              <span class="text-muted">${value}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  
  /**
   * Update badge with total count
   */
  function updateBadge() {
    if (!elements.badge) return;
    
    const totalCount = Object.values(state.counts).reduce((sum, count) => sum + count, 0);
    elements.badge.textContent = totalCount;
  }
  
  /**
   * Start auto refresh
   */
  function startAutoRefresh() {
    if (state.autoRefreshTimer) {
      clearInterval(state.autoRefreshTimer);
    }
    
    state.autoRefreshTimer = setInterval(() => {
      const combination = getCombinationKey(state.activeAction, state.activeEntity);
      loadCombinationData(state.activeAction, state.activeEntity);
    }, state.config.autoRefreshInterval);
  }
  
  /**
   * Stop auto refresh
   */
  function stopAutoRefresh() {
    if (state.autoRefreshTimer) {
      clearInterval(state.autoRefreshTimer);
      state.autoRefreshTimer = null;
    }
  }
  
  /**
   * Prepare plan modal with prefill data
   */
  function preparePlanModal(tradeId, prefill) {
    const modalInfo = window.ModalManagerV2?.getModalInfo?.('tradePlansModal');
    const modalElement = modalInfo?.element;
    if (!modalElement) {
      window.Logger?.warn?.('Trade plan modal not found');
      return;
    }
    
    const form = modalElement.querySelector('form');
    if (form) {
      form.dataset.tradePlanSource = 'unified-pending-actions-widget';
      form.dataset.sourceTradeId = String(tradeId);
    }
    
    // Populate selects first
    if (prefill.ticker_id && window.SelectPopulatorService?.populateTickersSelect) {
      window.SelectPopulatorService.populateTickersSelect('tradePlanTicker').then(() => {
        if (prefill.trading_account_id && window.SelectPopulatorService?.populateAccountsSelect) {
          window.SelectPopulatorService.populateAccountsSelect('tradePlanAccount').then(() => {
            populatePlanFormFields(modalElement, tradeId, prefill);
          });
        } else {
          populatePlanFormFields(modalElement, tradeId, prefill);
        }
      });
    } else {
      populatePlanFormFields(modalElement, tradeId, prefill);
    }
  }
  
  /**
   * Populate plan form fields
   */
  function populatePlanFormFields(modalElement, tradeId, prefill) {
    const populatePayload = {
      tradePlanTicker: prefill.ticker_id ?? null,
      tradePlanAccount: prefill.trading_account_id ?? null,
      tradePlanSide: prefill.side ?? 'long',
      tradePlanType: prefill.investment_type ?? 'swing',
      tradePlanEntryPrice: prefill.entry_price ?? null,
      tradePlanEntryDate: formatDateForInput(prefill.entry_date),
      tradePlanQuantity: prefill.quantity ?? null,
      planAmount: prefill.planned_amount ?? null,
      tradePlanNotes: prefill.notes ?? ''
    };
    
    window.ModalManagerV2?.populateForm?.(modalElement, populatePayload);
    
    // Load ticker info if available
    if (prefill.ticker_id && typeof window.loadTradePlanTickerInfo === 'function') {
      window.loadTradePlanTickerInfo(prefill.ticker_id);
    }
    
    // Apply default risk levels
    if (typeof window.applyTradePlanDefaultRiskLevels === 'function') {
      window.applyTradePlanDefaultRiskLevels({ force: true, modalElement });
    }
  }
  
  /**
   * Format date for input field
   */
  function formatDateForInput(value) {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      window.Logger?.warn?.('Failed to format date for input', { error, value });
      return '';
    }
  }
  
  /**
   * Clear caches after action
   */
  async function clearCachesAfterAction(combination) {
    try {
      // Invalidate cache sync
      if (window.CacheSyncManager?.invalidateByAction) {
        if (combination === 'assignPlans' || combination === 'createPlans') {
          await window.CacheSyncManager.invalidateByAction('trade-plan-linked');
        } else if (combination === 'assignTrades' || combination === 'createTrades') {
          await window.CacheSyncManager.invalidateByAction('execution-linked');
        }
      }
      
      // Clear specific cache keys
      const cacheKeys = [
        'trades',
        'trade-data',
        'trades-data',
        'dashboard',
        'dashboard-data',
        'pending-trade-plan-assignments',
        'pending-trade-plan-creations',
        'executions',
        'execution-data'
      ];
      
      if (window.UnifiedCacheManager) {
        cacheKeys.forEach(key => {
          try {
            window.UnifiedCacheManager.remove(key);
          } catch (error) {
            window.Logger?.warn?.('Failed to remove cache key', { error, key });
          }
        });
      }
      
      // Refresh dashboard data
      if (window.DashboardData?.load) {
        await window.DashboardData.load({ force: true });
      }
      
      // Schedule hard reload notification
      setTimeout(() => {
        if (window.NotificationSystem?.showInfo) {
          window.NotificationSystem.showInfo('המערכת תרענן אוטומטית בעוד מספר שניות...', { duration: 3000 });
        }
        setTimeout(() => {
          if (typeof window.hardReload === 'function') {
            window.hardReload();
          } else {
            window.location.reload();
          }
        }, 3000);
      }, 500);
      
    } catch (error) {
      window.Logger?.error?.('Failed to clear caches after action', { error, combination });
    }
  }

  // ===== Public API =====
  
  const UnifiedPendingActionsWidget = {
    /**
     * Initialize widget
     * @param {string} containerId - Container ID (optional)
     * @param {object} config - Configuration object (optional)
     */
    init(containerId = CONTAINER_ID, config = {}) {
      console.log('🔴🔴🔴🔴🔴 UnifiedPendingActionsWidget.init CALLED!!!', { containerId, config, initialized: state.initialized });
      window.Logger?.error?.('🔴🔴🔴🔴🔴 UnifiedPendingActionsWidget.init CALLED!!!', { 
        containerId, 
        config, 
        initialized: state.initialized,
        page: 'index' 
      });
      
      if (state.initialized) {
        console.log('⚠️ Already initialized, resetting for testing...');
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Already initialized, resetting state for testing', { page: 'index' });
        // Allow re-initialization for testing
        state.initialized = false;
        // Clear existing data
        state.data = {
          assignPlans: [],
          assignTrades: [],
          createPlans: [],
          createTrades: []
        };
        state.loading = {
          assignPlans: false,
          assignTrades: false,
          createPlans: false,
          createTrades: false
        };
        state.errors = {
          assignPlans: null,
          assignTrades: null,
          createPlans: null,
          createTrades: null
        };
      }

      // Merge configuration
      state.config = {
        ...DEFAULT_CONFIG,
        ...config
      };
      
      state.activeAction = config.defaultAction || DEFAULT_CONFIG.defaultAction;
      state.activeEntity = config.defaultEntity || DEFAULT_CONFIG.defaultEntity;

      console.log('🔴🔴🔴 UnifiedPendingActionsWidget.init STARTED!!!', { containerId, config: state.config });
      window.Logger?.info?.('🔴🔴🔴 UnifiedPendingActionsWidget.init STARTED!!!', { 
        containerId, 
        config: state.config,
        activeAction: state.activeAction,
        activeEntity: state.activeEntity,
        page: 'index' 
      });

      window.Logger?.info?.('🟡 About to call cacheElements...', { containerId, page: 'index' });
      
      const cacheResult = cacheElements();
      window.Logger?.info?.('🟡 cacheElements returned:', { 
        result: cacheResult,
        containerFound: !!elements.container,
        page: 'index' 
      });
      
      if (!cacheResult) {
        window.Logger?.error?.('🔴 UnifiedPendingActionsWidget: Container not found!', { 
          containerId, 
          page: 'index',
          containerExists: !!document.getElementById(containerId)
        });
        return;
      }

      window.Logger?.info?.('🟢 Container found, loading dismissed items...', { page: 'index' });
      loadDismissedItems();
      
      window.Logger?.info?.('🟢 Dismissed items loaded, binding events...', { page: 'index' });
      bindEvents();
      
      window.Logger?.info?.('🟢 Events bound, setting active tabs...', { 
        activeAction: state.activeAction,
        activeEntity: state.activeEntity,
        page: 'index' 
      });
      
      // Set initial active tabs and pane
      setActiveAction(state.activeAction);
      setActiveEntity(state.activeEntity);
      
      window.Logger?.info?.('🟢 Active tabs set, loading initial data...', { 
        activeAction: state.activeAction,
        activeEntity: state.activeEntity,
        page: 'index' 
      });
      
      // Load initial data
      loadCombinationData(state.activeAction, state.activeEntity);
      
      window.Logger?.info?.('🟢 Data loading started, starting auto refresh...', { page: 'index' });
      
      // Start auto refresh
      startAutoRefresh();
      
      state.initialized = true;
      window.Logger?.info?.('✅✅✅ UnifiedPendingActionsWidget: Initialization complete!', { page: 'index' });
    },
    
    /**
     * Set active tabs programmatically
     */
    setActiveTabs(action, entity) {
      if (action) {
        setActiveAction(action);
      }
      if (entity) {
        setActiveEntity(entity);
      }
    },
    
    /**
     * Assign trade to plan
     */
    async assignTradeToPlan(item) {
      const tradeId = item.trade_id || item.trade?.id;
      const planId = item?.primary_suggestion?.trade_plan_id || item?.primary_suggestion?.plan?.id;
      
      if (!tradeId || !planId) {
        window.Logger?.warn?.('Missing trade/plan ID for assignment', { item });
        window.NotificationSystem?.showError?.('חסרים פרטים נדרשים לשיוך');
        return;
      }
      
      try {
        window.Logger?.info?.('🔗 Linking trade to plan', { tradeId, planId }, { page: 'index' });
        
        const response = await fetch(`/api/trades/${tradeId}/link-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trade_plan_id: planId })
        });
        
        let result = null;
        if (window.CRUDResponseHandler?.handleSaveResponse) {
          result = await window.CRUDResponseHandler.handleSaveResponse(response, {
            modalId: null,
            successMessage: `טרייד #${tradeId} שויך לתוכנית #${planId}`,
            entityName: 'שיוך תוכנית',
            reloadFn: null,
            requiresHardReload: true
          });
        } else {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || 'שיוך לתוכנית נכשל');
          }
          const payload = await response.json().catch(() => null);
          if (!payload || payload.status !== 'success') {
            throw new Error(payload?.error?.message || 'שיוך לתוכנית נכשל');
          }
          result = payload;
          window.NotificationSystem?.showSuccess?.(`טרייד #${tradeId} שויך לתוכנית #${planId}`);
        }
        
        if (result) {
          await clearCachesAfterAction('assignPlans');
          const combination = 'assignPlans';
          handleDismiss(item, combination);
          setTimeout(() => {
            loadCombinationData(state.activeAction, state.activeEntity);
          }, 350);
        }
      } catch (error) {
        window.Logger?.error?.('❌ Failed to link trade to plan', { error, tradeId, planId }, { page: 'index' });
        if (!window.CRUDResponseHandler?.handleError) {
          window.NotificationSystem?.showError?.('שגיאה בשיוך תוכנית', error?.message || 'שיוך התוכנית נכשל');
        }
      }
    },
    
    /**
     * Assign execution to trade
     */
    async assignExecutionToTrade(item) {
      const executionId = item.execution?.id;
      const tradeId = item?.primary_suggestion?.trade_id || item.suggestions?.[0]?.trade_id;
      
      if (!executionId || !tradeId) {
        window.Logger?.warn?.('Missing execution/trade ID for assignment', { item });
        window.NotificationSystem?.showError?.('חסרים פרטים נדרשים לשיוך');
        return;
      }
      
      try {
        window.Logger?.info?.('✅ Assigning execution to trade', { executionId, tradeId }, { page: 'index' });
        
        const response = await fetch(`/api/executions/${executionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trade_id: tradeId })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.error?.message || 'Failed to assign execution to trade');
        }
        
        window.NotificationSystem?.showSuccess?.(`ביצוע #${executionId} שויך לטרייד #${tradeId}`);
        
        await clearCachesAfterAction('assignTrades');
        const combination = 'assignTrades';
        handleDismiss(item, combination);
        setTimeout(() => {
          loadCombinationData(state.activeAction, state.activeEntity);
        }, 250);
      } catch (error) {
        window.Logger?.error?.('❌ Failed to assign execution to trade', { error, executionId, tradeId }, { page: 'index' });
        window.NotificationSystem?.showError?.('שגיאה בשיוך', error?.message || 'השיוך נכשל');
      }
    },
    
    /**
     * Open plan creation modal
     */
    async openPlanCreationModal(item) {
      const tradeId = item.trade_id || item.trade?.id;
      const prefill = item.prefill || {};
      
      if (!tradeId) {
        window.Logger?.warn?.('Missing trade ID for plan creation', { item });
        window.NotificationSystem?.showError?.('חסר מזהה טרייד');
        return;
      }
      
      try {
        // Ensure modal dependencies
        const ensureDependencies = window.PendingExecutionTradeCreation?.ensureTradeModalDependencies
          || window.ensureTradeModalDependencies;
        
        if (typeof ensureDependencies === 'function') {
          await ensureDependencies.call(window.PendingExecutionTradeCreation || null);
        }
        
        // Also ensure trade plan modal dependencies
        if (window.PendingTradePlanWidget?.ensurePlanModalDependencies) {
          await window.PendingTradePlanWidget.ensurePlanModalDependencies();
        }
        
        // Open modal
        await window.ModalManagerV2?.showModal('tradePlansModal', 'add');
        
        // Prepare modal with prefill data
        preparePlanModal(tradeId, prefill);
      } catch (error) {
        window.Logger?.error?.('❌ Failed to open plan creation modal', { error, tradeId }, { page: 'index' });
        window.NotificationSystem?.showError?.('שגיאה בפתיחת מודל תוכנית', error?.message || 'לא ניתן לפתוח את מודל התוכנית');
      }
    },
    
    /**
     * Open trade creation modal
     */
    async openTradeCreationModal(item) {
      const clusterId = item.cluster_id;
      
      if (!clusterId) {
        window.Logger?.warn?.('Missing cluster ID for trade creation', { item });
        window.NotificationSystem?.showError?.('חסר מזהה אשכול');
        return;
      }
      
      try {
        // Use existing function from PendingExecutionTradeCreation
        if (window.PendingExecutionTradeCreation?.openTradeModalFromCluster) {
          await window.PendingExecutionTradeCreation.openTradeModalFromCluster(clusterId);
          
          // Dismiss after modal opens (similar to original widget behavior)
          const combination = 'createTrades';
          handleDismiss(item, combination);
        } else {
          throw new Error('Trade creation modal not available');
        }
      } catch (error) {
        window.Logger?.error?.('❌ Failed to open trade creation modal', { error, clusterId }, { page: 'index' });
        window.NotificationSystem?.showError?.('שגיאה בפתיחת מודל טרייד', error?.message || 'לא ניתן לפתוח את מודל הטרייד');
      }
    },
    
    /**
     * Destroy widget
     */
    destroy() {
      stopAutoRefresh();
      state.initialized = false;
      state.dismissed.clear();
    },
    
    version: '1.0.0'
  };

  // Export to global scope
  window.UnifiedPendingActionsWidget = UnifiedPendingActionsWidget;
  
  // Log successful load
  if (window.Logger) {
    window.Logger.info('✅ Unified Pending Actions Widget loaded successfully', { 
      page: 'unified-pending-actions-widget', 
      version: '1.0.0' 
    });
  }
})();

