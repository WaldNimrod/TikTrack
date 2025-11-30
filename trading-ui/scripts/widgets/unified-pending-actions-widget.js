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
    config: { ...DEFAULT_CONFIG }
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
   * Get data for a specific combination using shared services
   */
  async function getDataForCombination(combination) {
    try {
      if (combination === 'createTrades') {
        if (!window.ExecutionClusteringService) return [];
        const clusters = await window.ExecutionClusteringService.getCachedClusters();
        if (!clusters || clusters.length === 0) return [];
        const dismissed = await window.PendingActionsCacheService.getDismissed('trade-creation-clusters');
        return clusters
          .filter(cluster => !dismissed.has(cluster.cluster_id))
          .slice(0, state.config.defaultItemsLimit);
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
      }
    } catch (error) {
      window.Logger?.error?.('Error getting data for combination', { error, combination, page: 'index' });
    }
    
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
      window.Logger?.error?.('Failed to check data for combination', { error, combination, page: 'index' });
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
          await window.ExecutionClusteringService.fetchClusters({ force: true });
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
      window.Logger?.error?.('Failed to load combination data', { error, combination, page: 'index' });
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
            onSelectionChange: (clusterId, executionId, isChecked) => {
              const currentCluster = window.ExecutionClusteringService?.getCachedClusters()?.find(c => c.cluster_id === clusterId);
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
        // Use ExecutionAssignmentService data structure
        // For now, fallback to old widget rendering
        const widget = window.PendingExecutionsHighlights;
        if (widget?.renderHighlightItem) {
          return widget.renderHighlightItem(item);
        }
      }
      
      if (combination === 'assignPlans') {
        // Use TradePlanAssignmentService data structure
        // For now, fallback to old widget rendering
        const widget = window.PendingTradePlanWidget;
        if (widget?.renderAssignmentItem) {
          return widget.renderAssignmentItem(item);
        }
      }
      
      if (combination === 'createPlans') {
        // Use TradePlanAssignmentService data structure
        // For now, fallback to old widget rendering
        const widget = window.PendingTradePlanWidget;
        if (widget?.renderCreationItem) {
          return widget.renderCreationItem(item);
        }
      }
    } catch (error) {
      window.Logger?.error?.('Failed to render item', { error, combination, item, page: 'index' });
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
    
    window.Logger?.debug?.('getDataForCombination result', { 
      combination, 
      dataLength: data.length,
      hasData: data.length > 0,
      page: 'index' 
    });
    
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
      window.Logger?.warn?.('List element not in DOM', { combination, page: 'index' });
      return;
    }
    
    window.Logger?.debug?.('Rendering combination', { 
      combination, 
      dataLength: data.length,
      page: 'index' 
    });
    
    const html = data.map(item => renderListItem(item, combination)).filter(Boolean).join('');
    
    if (!html) {
      window.Logger?.debug?.('No HTML generated for combination', { combination, dataLength: data.length, page: 'index' });
      showEmptyState(combination);
      hideList(combination);
      updateCount(combination, 0);
      return;
    }
    
    // Set HTML content
    list.innerHTML = html;
    window.Logger?.debug?.('List HTML set', { combination, htmlLength: html.length, page: 'index' });
    
    // Dispatch event to trigger height equalization after content update
    window.dispatchEvent(new CustomEvent('widgetContentUpdated'));
    
    // Wait for DOM to update before initializing buttons
    requestAnimationFrame(() => {
      if (list && list.parentNode && list.innerHTML) {
        // Initialize buttons only if list has content and is in DOM
        if (window.ButtonSystem?.initializeButtons) {
          try {
            window.ButtonSystem.initializeButtons(list);
          } catch (error) {
            window.Logger?.warn?.('Failed to initialize buttons', { combination, error, page: 'index' });
          }
        }
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
    window.Logger?.debug?.('cacheElements: Looking for container', { 
      containerId: CONTAINER_ID,
      containerExists: !!document.getElementById(CONTAINER_ID),
      page: 'index' 
    });
    
    elements.container = document.getElementById(CONTAINER_ID);
    if (!elements.container) {
      window.Logger?.error?.('cacheElements: Container not found', { 
        containerId: CONTAINER_ID,
        page: 'index' 
      });
      return false;
    }
    
    window.Logger?.debug?.('cacheElements: Container found', { 
      containerId: CONTAINER_ID,
      page: 'index' 
    });
    
    elements.title = elements.container.querySelector('#unifiedPendingActionsWidgetTitle');
    elements.badge = elements.container.querySelector('#unifiedPendingActionsWidgetBadge');
    elements.actionTabs = elements.container.querySelector('#unifiedPendingActionsActionTabs');
    elements.actionTabAssign = elements.container.querySelector('#actionTabAssign');
    elements.actionTabCreate = elements.container.querySelector('#actionTabCreate');
    elements.entityTabs = elements.container.querySelector('#unifiedPendingActionsEntityTabs');
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
        elements.count[combination] = pane.querySelector(`#${combination}Count`);
      }
    });
    
      // Cache general message element
      elements.generalMessage = elements.container.querySelector('#unifiedPendingActionsGeneralMessage');
    
    return true;
  }
  
  /**
   * Set active tabs
   */
  function setActiveAction(action) {
    state.activeAction = action;
    
    if (elements.actionTabAssign) {
      elements.actionTabAssign.classList.toggle('active', action === 'assign');
    }
    if (elements.actionTabCreate) {
      elements.actionTabCreate.classList.toggle('active', action === 'create');
    }
    
    // Update entity tabs visibility and active state
    updateEntityTabsVisibility();
    
    // Load data for new combination
    loadCombinationData(state.activeAction, state.activeEntity);
  }
  
  function setActiveEntity(entity) {
    state.activeEntity = entity;
    
    if (elements.entityTabPlans) {
      elements.entityTabPlans.classList.toggle('active', entity === 'plans');
    }
    if (elements.entityTabTrades) {
      elements.entityTabTrades.classList.toggle('active', entity === 'trades');
    }
    
    // Update active pane
    updateActivePane();
    
    // Load data for new combination
    loadCombinationData(state.activeAction, state.activeEntity);
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
    
    // Listen for clicks on action buttons
    const allLists = Object.values(elements.list);
    allLists.forEach(list => {
      if (list) {
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

          // For other buttons, refresh after action
          if (event.target.closest('[data-button-type]')) {
            setTimeout(async () => {
              await renderCombination(getCombinationKey(state.activeAction, state.activeEntity));
              await checkTabsVisibility();
            }, 500);
          }
        });
      }
    });
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
    const countEl = elements.count[combination];
    if (countEl) {
      countEl.textContent = String(count);
      countEl.classList.toggle('d-none', count === 0);
    }
    
    // Update total badge
    if (elements.badge) {
      const totalCount = (
        (await getDataForCombination('assignPlans')).length +
        (await getDataForCombination('assignTrades')).length +
        (await getDataForCombination('createPlans')).length +
        (await getDataForCombination('createTrades')).length
      );
      elements.badge.textContent = String(totalCount);
    }
  }
  
  function hideAllTabs() {
    if (elements.actionTabs) elements.actionTabs.style.display = 'none';
    if (elements.entityTabs) elements.entityTabs.style.display = 'none';
  }
  
  function showAllTabs() {
    if (elements.actionTabs) elements.actionTabs.style.display = '';
    if (elements.entityTabs) elements.entityTabs.style.display = '';
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
      page: 'index'
    });
    
    return false;
  }
  
  
  // ===== Public API =====
  
  const UnifiedPendingActionsWidget = {
    /**
     * Initialize widget
     */
    async init(containerId = CONTAINER_ID, config = {}) {
      window.Logger?.info?.('🔵🔵🔵 UnifiedPendingActionsWidget.init() CALLED', { 
        containerId, 
        config,
        initialized: state.initialized,
        page: 'index' 
      });
      
      if (state.initialized) {
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Already initialized', { page: 'index' });
        return;
      }
      
      // Merge configuration
      state.config = { ...DEFAULT_CONFIG, ...config };
      state.activeAction = config.defaultAction || DEFAULT_CONFIG.defaultAction;
      state.activeEntity = config.defaultEntity || DEFAULT_CONFIG.defaultEntity;
      
      window.Logger?.info?.('🔵🔵🔵 UnifiedPendingActionsWidget: Configuration merged', { 
        config: state.config,
        activeAction: state.activeAction,
        activeEntity: state.activeEntity,
        page: 'index' 
      });
      
      // Cache elements
      const elementsCached = cacheElements();
      window.Logger?.info?.('🔵🔵🔵 UnifiedPendingActionsWidget: cacheElements() result', { 
        elementsCached,
        containerId,
        page: 'index' 
      });
      
      if (!elementsCached) {
        window.Logger?.error?.('UnifiedPendingActionsWidget: Container not found', { 
          containerId,
          containerExists: !!document.getElementById(containerId),
          page: 'index' 
        });
        return;
      }
      
      // Wait for required services
      const servicesAvailable = await waitForRequiredServices();
      if (!servicesAvailable) {
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Some required services not available', { page: 'index' });
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
      window.Logger?.info?.('UnifiedPendingActionsWidget: Initialization complete', { page: 'index' });
    },
    
    /**
     * Render widget (refresh all combinations)
     */
    async render() {
      if (!state.initialized) {
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Cannot render - not initialized', { page: 'index' });
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
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Cannot refresh - not initialized', { page: 'index' });
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
      
      // Clear all lists
      Object.values(elements.list).forEach(list => {
        if (list) {
          list.innerHTML = '';
        }
      });
      
      window.Logger?.info?.('UnifiedPendingActionsWidget: Destroyed and cleaned up', { page: 'index' });
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

