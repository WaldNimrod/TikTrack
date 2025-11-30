/**
 * Unified Pending Actions Widget - TikTrack Dashboard
 * ====================================================
 * 
 * WRAPPER widget that uses existing widget code instead of duplicating logic.
 * 
 * This widget unifies 3 existing widgets with nested tabs:
 * - Action Type: "שיוך" (Assign) / "יצירת חדש" (Create)
 * - Entity Type: "תוכניות" (Plans) / "טריידים" (Trades)
 * 
 * Uses existing widgets:
 * - PendingExecutionTradeCreation (Create → Trades)
 * - PendingExecutionsHighlights (Assign → Trades)
 * - PendingTradePlanWidget (Assign/Create → Plans)
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
   * Get data for a specific combination using existing widget states
   */
  function getDataForCombination(combination) {
    if (combination === 'createTrades') {
      const widget = window.PendingExecutionTradeCreation;
      if (!widget) return [];
      // Get visible clusters (already filtered by dismissed)
      const clusters = widget.getVisibleClustersForWidget ? widget.getVisibleClustersForWidget() : [];
      return clusters.slice(0, state.config.defaultItemsLimit);
    }
    
    if (combination === 'assignTrades') {
      const widget = window.PendingExecutionsHighlights;
      if (!widget) return [];
      const items = widget.state?.items || [];
      const dismissed = widget.state?.dismissed || new Set();
      return items.filter(item => {
        const executionId = item.execution?.id;
        return executionId && !dismissed.has(executionId);
      }).slice(0, state.config.defaultItemsLimit);
    }
    
    if (combination === 'assignPlans') {
      const widget = window.PendingTradePlanWidget;
      if (!widget) return [];
      const assignments = widget.state?.assignments || [];
      const dismissed = widget.state?.dismissed || new Set();
      return assignments.filter(item => {
        const dismissKey = widget.getDismissKey ? widget.getDismissKey('assignment', item.trade?.id, item?.primary_suggestion?.plan?.id) : null;
        return dismissKey && !dismissed.has(dismissKey);
      }).slice(0, state.config.defaultItemsLimit);
    }
    
    if (combination === 'createPlans') {
      const widget = window.PendingTradePlanWidget;
      if (!widget) return [];
      const creations = widget.state?.creations || [];
      const dismissed = widget.state?.dismissed || new Set();
      return creations.filter(item => {
        const dismissKey = widget.getDismissKey ? widget.getDismissKey('creation', item.trade?.id, null) : null;
        return dismissKey && !dismissed.has(dismissKey);
      }).slice(0, state.config.defaultItemsLimit);
    }
    
    return [];
  }
  
  /**
   * Check if combination has data
   */
  function hasData(combination) {
    return getDataForCombination(combination).length > 0;
  }
  
  /**
   * Load data for combination using existing widget methods
   */
  async function loadCombinationData(action, entity) {
    const combination = getCombinationKey(action, entity);
    
    // Set loading state
    setLoading(combination, true);
    hideError(combination);
    
    try {
      if (combination === 'createTrades') {
        const widget = window.PendingExecutionTradeCreation;
        if (widget?.refreshClusters) {
          await widget.refreshClusters({ source: 'dashboard', force: true });
        }
      } else if (combination === 'assignTrades') {
        const widget = window.PendingExecutionsHighlights;
        if (widget?.fetchHighlights) {
          await widget.fetchHighlights();
        }
      } else if (combination === 'assignPlans' || combination === 'createPlans') {
        const widget = window.PendingTradePlanWidget;
        if (widget?.fetchData) {
          await widget.fetchData({ force: true });
        }
      }
    } catch (error) {
      window.Logger?.error?.('Failed to load combination data', { error, combination });
      showError(combination, error.message || 'שגיאה בטעינת נתונים');
    } finally {
      setLoading(combination, false);
      renderCombination(combination);
      checkTabsVisibility();
    }
  }
  
  /**
   * Render item using existing widget rendering functions
   */
  function renderListItem(item, combination) {
    try {
      if (combination === 'createTrades') {
        const widget = window.PendingExecutionTradeCreation;
        if (widget?.buildDashboardClusterItem) {
          const selectedIds = widget.state?.selection?.get(item.cluster_id) || new Set();
          const domItem = widget.buildDashboardClusterItem(item, selectedIds);
          return domItem.outerHTML;
        }
      }
      
      if (combination === 'assignTrades') {
        const widget = window.PendingExecutionsHighlights;
        if (widget?.renderHighlightItem) {
          return widget.renderHighlightItem(item);
        }
      }
      
      if (combination === 'assignPlans') {
        const widget = window.PendingTradePlanWidget;
        if (widget?.renderAssignmentItem) {
          return widget.renderAssignmentItem(item);
        }
      }
      
      if (combination === 'createPlans') {
        const widget = window.PendingTradePlanWidget;
        if (widget?.renderCreationItem) {
          return widget.renderCreationItem(item);
        }
      }
    } catch (error) {
      window.Logger?.error?.('Failed to render item', { error, combination, item });
    }
    
    return '';
  }
  
  /**
   * Render a combination using existing widget data and rendering
   */
  function renderCombination(combination) {
    const pane = elements.panes?.[combination];
    if (!pane) return;
    
    const list = elements.list[combination];
    if (!list) return;
    
    const data = getDataForCombination(combination);
    
    // Hide loading
    setLoading(combination, false);
    
    // Check if empty
    if (data.length === 0) {
      showEmptyState(combination);
      hideList(combination);
      return;
    }
    
    // Hide empty state and show list
    hideEmptyState(combination);
    showList(combination);
    
    // Render items
    const html = data.map(item => renderListItem(item, combination)).filter(Boolean).join('');
    list.innerHTML = html;
    
    // Initialize buttons
    if (window.ButtonSystem?.initializeButtons) {
      window.ButtonSystem.initializeButtons(list);
    }
    
    // Update count
    updateCount(combination, data.length);
  }
  
  /**
   * Check tabs visibility and show/hide based on data availability
   */
  function checkTabsVisibility() {
    const assignPlansHasData = hasData('assignPlans');
    const assignTradesHasData = hasData('assignTrades');
    const createPlansHasData = hasData('createPlans');
    const createTradesHasData = hasData('createTrades');
    
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
      return false;
    }
    
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
    
    // Cache general message element (create if doesn't exist)
    elements.generalMessage = elements.container.querySelector('#unifiedPendingActionsGeneralMessage');
    if (!elements.generalMessage && elements.container) {
      elements.generalMessage = document.createElement('div');
      elements.generalMessage.id = 'unifiedPendingActionsGeneralMessage';
      elements.generalMessage.className = 'alert alert-success text-center d-none';
      elements.generalMessage.setAttribute('role', 'status');
      if (elements.container.querySelector('.card-body')) {
        elements.container.querySelector('.card-body').appendChild(elements.generalMessage);
      }
    }
    
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
    
    // Listen for changes in existing widget states
    // We'll use polling or event-based updates if available
    // For now, we'll refresh on tab change
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
  
  function updateCount(combination, count) {
    const countEl = elements.count[combination];
    if (countEl) {
      countEl.textContent = String(count);
      countEl.classList.toggle('d-none', count === 0);
    }
    
    // Update total badge
    if (elements.badge) {
      const totalCount = (
        getDataForCombination('assignPlans').length +
        getDataForCombination('assignTrades').length +
        getDataForCombination('createPlans').length +
        getDataForCombination('createTrades').length
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
   * Wait for required widgets to be available
   */
  async function waitForRequiredWidgets(timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const hasTradeCreation = !!window.PendingExecutionTradeCreation;
      const hasHighlights = !!window.PendingExecutionsHighlights;
      const hasTradePlan = !!window.PendingTradePlanWidget;
      
      if (hasTradeCreation && hasHighlights && hasTradePlan) {
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }
  
  // ===== Public API =====
  
  const UnifiedPendingActionsWidget = {
    /**
     * Initialize widget
     */
    async init(containerId = CONTAINER_ID, config = {}) {
      if (state.initialized) {
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Already initialized', { page: 'index' });
        return;
      }
      
      // Merge configuration
      state.config = { ...DEFAULT_CONFIG, ...config };
      state.activeAction = config.defaultAction || DEFAULT_CONFIG.defaultAction;
      state.activeEntity = config.defaultEntity || DEFAULT_CONFIG.defaultEntity;
      
      // Cache elements
      if (!cacheElements()) {
        window.Logger?.error?.('UnifiedPendingActionsWidget: Container not found', { containerId });
        return;
      }
      
      // Wait for required widgets
      const widgetsAvailable = await waitForRequiredWidgets();
      if (!widgetsAvailable) {
        window.Logger?.warn?.('UnifiedPendingActionsWidget: Some required widgets not available', { page: 'index' });
        // Continue anyway - we'll handle missing widgets gracefully
      }
      
      // Bind events
      bindEvents();
      
      // Set initial active tabs
      setActiveAction(state.activeAction);
      setActiveEntity(state.activeEntity);
      
      // Initial render
      checkTabsVisibility();
      
      // Load initial data
      await loadCombinationData(state.activeAction, state.activeEntity);
      
      state.initialized = true;
      window.Logger?.info?.('UnifiedPendingActionsWidget: Initialization complete', { page: 'index' });
    },
    
    /**
     * Render widget (called after existing widgets update their state)
     */
    render() {
      if (!state.initialized) return;
      
      // Re-render all combinations
      ['assignPlans', 'assignTrades', 'createPlans', 'createTrades'].forEach(combination => {
        renderCombination(combination);
      });
      
      // Check tabs visibility
      checkTabsVisibility();
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
     * Destroy widget
     */
    destroy() {
      state.initialized = false;
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


