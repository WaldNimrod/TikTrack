/**
 * Recent Items Widget - Unified Recent Trades and Trade Plans
 * ============================================================
 * 
 * Unified widget for displaying recent trades and trade plans with Bootstrap Tabs.
 * Features hover overlay for detailed information display.
 * 
 * This widget relies on general systems:
 * - FieldRendererService for formatting
 * - ButtonSystem for buttons
 * - NotificationSystem for errors
 * - ModalManagerV2 for entity details modals
 * 
 * API:
 * - init(containerId, config) - Initialize widget
 * - render(data) - Render/update widget with trades and trade plans
 * - destroy() - Cleanup widget and remove event listeners
 * 
 * Configuration:
 * - defaultTab: 'trades' | 'plans' - Default active tab
 * - maxItems: number - Maximum items to display per tab (default: 5)
 * 
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/RECENT_ITEMS_WIDGET_DEVELOPER_GUIDE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - setupOverlayForList() - Setupoverlayforlist
// - buildTradeItem() - Buildtradeitem
// - buildTradePlanItem() - Buildtradeplanitem

// === Event Handlers ===
// - bindItemEvents() - Binditemevents
// - resetTabPanesPositioning() - Resettabpanespositioning
// - bindEvents() - Bindevents
// - handleItemClick() - Handleitemclick

// === UI Functions ===
// - renderTrades() - Rendertrades
// - renderTradePlans() - Rendertradeplans

// === Utility Functions ===
// - formatDateShort() - Formatdateshort
// - formatAmount() - Formatamount

// === Other ===
// - resolveDateValue() - Resolvedatevalue
// - sortByDate() - Sortbydate
// - cacheElements() - Cacheelements

;(function () {
  'use strict';

  const CONTAINER_ID = 'recentItemsWidgetContainer';
  const DEFAULT_MAX_ITEMS = 5; // Default max items if not specified in config

  // Default configuration
  const DEFAULT_CONFIG = {
    defaultTab: 'trades', // 'trades' or 'plans'
    maxItems: DEFAULT_MAX_ITEMS // Maximum number of items to display per tab
  };

  // State
  const state = {
    initialized: false,
    activeTab: 'trades',
    trades: [],
    tradePlans: [],
    currencySymbol: '$',
    config: { ...DEFAULT_CONFIG },
    pendingTrades: null,
    pendingTradePlans: null,
    pendingCurrencySymbol: null,
    overlaySetup: {} // Track which lists have overlay setup (same as Unified Pending Actions Widget)
  };

  // DOM Elements cache
  const elements = {
    container: null,
    tradesTab: null,
    plansTab: null,
    tradesPane: null,
    plansPane: null,
    tradesList: null,
    plansList: null,
    tradesLoading: null,
    plansLoading: null,
    tradesEmpty: null,
    plansEmpty: null,
    tradesError: null,
    plansError: null
  };

  /**
   * Resolve date value from various formats
   */
  function resolveDateValue(value) {
    if (!value && value !== 0) {
      return null;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object') {
      return value.utc || value.local || value.display || value.iso || value.date || null;
    }
    return null;
  }

  /**
   * Format date using FieldRendererService
   */
  function formatDateShort(value) {
    const resolved = resolveDateValue(value);
    if (!resolved) {
      return '';
    }
    
    if (window.FieldRendererService?.renderDateShort) {
      return window.FieldRendererService.renderDateShort(resolved) || '';
    }
    
    if (window.FieldRendererService?.renderDate) {
      return window.FieldRendererService.renderDate(resolved, false);
    }
    
    try {
      const dateObj = new Date(resolved);
      if (!Number.isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
    } catch (error) {
      window.Logger?.warn?.('RecentItemsWidget: formatDateShort failed', { error: error?.message });
    }
    
    return '';
  }

  /**
   * Format amount using FieldRendererService
   */
  function formatAmount(value, currencySymbol = '$') {
    const numeric = Number(value) || 0;
    
    if (window.FieldRendererService?.renderAmount) {
      return window.FieldRendererService.renderAmount(numeric, currencySymbol, 2, true);
    }
    
    return `${currencySymbol}${numeric.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Sort items by date (newest first)
   */
  function sortByDate(items, dateField) {
    return [...items].sort((a, b) => {
      const dateA = resolveDateValue(a?.[dateField] || a?.created_at || a?.opened_at || a?.entry_date);
      const dateB = resolveDateValue(b?.[dateField] || b?.created_at || b?.opened_at || b?.entry_date);
      
      if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
        const sortValueA = window.TableSortValueAdapter.getSortValue({ value: dateA, type: 'date' });
        const sortValueB = window.TableSortValueAdapter.getSortValue({ value: dateB, type: 'date' });
        return (sortValueB || 0) - (sortValueA || 0);
      }
      
      const epochA = dateA ? new Date(dateA).getTime() : 0;
      const epochB = dateB ? new Date(dateB).getTime() : 0;
      return epochB - epochA;
    });
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.container = document.getElementById(CONTAINER_ID);
    if (!elements.container) {
      return false;
    }

    // Tab buttons
    elements.tradesTab = elements.container.querySelector('#recentItemsTradesTab');
    elements.plansTab = elements.container.querySelector('#recentItemsPlansTab');

    // Tab panes
    elements.tradesPane = elements.container.querySelector('#recentItemsWidgetTradesPane');
    elements.plansPane = elements.container.querySelector('#recentItemsWidgetPlansPane');

    // Lists
    elements.tradesList = elements.container.querySelector('#recentItemsWidgetTradesList');
    elements.plansList = elements.container.querySelector('#recentItemsWidgetPlansList');

    // Loading/Empty/Error elements
    elements.tradesLoading = elements.container.querySelector('#recentItemsWidgetTradesLoading');
    elements.plansLoading = elements.container.querySelector('#recentItemsWidgetPlansLoading');
    elements.tradesEmpty = elements.container.querySelector('#recentItemsWidgetTradesEmpty');
    elements.plansEmpty = elements.container.querySelector('#recentItemsWidgetPlansEmpty');
    elements.tradesError = elements.container.querySelector('#recentItemsWidgetTradesError');
    elements.plansError = elements.container.querySelector('#recentItemsWidgetPlansError');

    return true;
  }


  /**
   * Setup overlay hover for a list element
   * @param {HTMLElement} listElement - The list element to setup overlay for
   * @param {string} itemSelector - Selector for items
   * @param {string} detailsSelector - Selector for details container
   */
  /**
   * Setup overlay hover for a list element (only once per list)
   * Same logic as Unified Pending Actions Widget
   * @param {HTMLElement} listElement - The list element to setup overlay for
   * @param {string} listKey - Key for tracking (e.g., 'trades' or 'plans')
   */
  function setupOverlayForList(listElement, listKey) {
    if (!window.WidgetOverlayService || !listElement || state.overlaySetup[listKey]) {
      return;
    }
    
    // Destroy existing handlers first to prevent duplicates
    window.WidgetOverlayService.destroy(listElement);
    
    // Setup immediately - no requestAnimationFrame (same as Unified Pending Actions Widget)
    window.WidgetOverlayService.setupOverlayHover(
      listElement,
      '.recent-items-widget-item',
      '[data-overlay="true"]',
      {
        hoverClass: 'is-hovered',
        gap: 8, // Standard gap
        minWidth: 280,
        maxWidth: 400,
        zIndex: 1050,
        useAnimations: true, // Enable GSAP animations
        transitionDuration: 100 // Faster animation (same as Unified Pending Actions Widget)
        // No placement - let UnifiedUIPositioning handle it automatically
      }
    );
    state.overlaySetup[listKey] = true;
  }

  /**
   * Bind click and keyboard events to items using event delegation
   * @param {HTMLElement} listElement - The list element to bind events to
   */
  function bindItemEvents(listElement) {
    if (!listElement) {
      return;
    }
    
    // Use event delegation on the list element instead of binding to each item
    listElement.addEventListener('click', (event) => {
      const item = event.target.closest('.recent-items-widget-item');
      if (item) {
        handleItemClick(event);
      }
    });
    
    listElement.addEventListener('keydown', (event) => {
      const item = event.target.closest('.recent-items-widget-item');
      if (item && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleItemClick(event);
      }
    });
  }

  /**
   * Reset positioning for tab panes to prevent stacking issues
   */
  function resetTabPanesPositioning() {
    [elements.tradesPane, elements.plansPane].forEach(pane => {
      if (!pane) return;
      
      // Remove any transform or positioning that might cause issues
      // DO NOT set display - let Bootstrap control it via .active/.show classes
      pane.style.top = '';
      pane.style.left = '';
      pane.style.transform = '';
      pane.style.display = ''; // Remove inline display - let CSS handle it via classes
      pane.style.position = 'relative';

      // Reset wrapper positioning too
      const wrapper = pane.querySelector('.recent-items-tab-content-wrapper');
      if (wrapper) {
        wrapper.style.top = '';
        wrapper.style.left = '';
        wrapper.style.transform = '';
        wrapper.style.position = 'relative';
      }

      // Reset list positioning
      const list = pane.querySelector('ul[id*="List"]');
      if (list) {
        list.style.top = '';
        list.style.left = '';
        list.style.transform = '';
      }
    });
  }

  function bindEvents() {
    // Tab switching (Bootstrap tabs) - re-render content when switching tabs
    if (elements.tradesTab) {
      elements.tradesTab.addEventListener('shown.bs.tab', () => {
        state.activeTab = 'trades';
        
        // Reset positioning before rendering
        resetTabPanesPositioning();
        
        
        // Re-render to ensure trades are displayed (they should already be rendered, but this ensures it)
        if (state.initialized) {
          const tradesToRender = Array.isArray(state.trades) ? state.trades : [];
          const tradePlansToRender = Array.isArray(state.tradePlans) ? state.tradePlans : [];
          const currencySymbol = state.currencySymbol || '$';
          renderTrades(tradesToRender, currencySymbol);
          renderTradePlans(tradePlansToRender, currencySymbol);
        }
      });
    }
    if (elements.plansTab) {
      elements.plansTab.addEventListener('shown.bs.tab', () => {
        state.activeTab = 'plans';
        
        // Reset positioning before rendering
        resetTabPanesPositioning();
        
        // Re-render to ensure trade plans are displayed
        if (state.initialized) {
          const tradesToRender = Array.isArray(state.trades) ? state.trades : [];
          const tradePlansToRender = Array.isArray(state.tradePlans) ? state.tradePlans : [];
          const currencySymbol = state.currencySymbol || '$';
          renderTrades(tradesToRender, currencySymbol);
          renderTradePlans(tradePlansToRender, currencySymbol);
        } else {
          window.Logger?.warn?.('RecentItemsWidget: Widget not initialized, cannot re-render on tab switch', { page: 'recent-items-widget' });
        }
      });
    }
    
    // Event delegation for approve/reject buttons (same as Unified Pending Actions Widget)
    const allLists = [elements.tradesList, elements.plansList].filter(Boolean);
    allLists.forEach(list => {
      if (list) {
        list.addEventListener('click', async (event) => {
          // Handle APPROVE button
          const approveBtn = event.target.closest('[data-button-type="APPROVE"]');
          if (approveBtn) {
            const item = approveBtn.closest('.recent-items-widget-item');
            if (item) {
              await handleApproveAction(item, event);
            }
            return;
          }

          // Handle REJECT/DISMISS button
          const rejectBtn = event.target.closest('[data-button-type="REJECT"], [data-button-type="DISMISS"]');
          if (rejectBtn) {
            const item = rejectBtn.closest('.recent-items-widget-item');
            if (item) {
              await handleRejectAction(item, event);
            }
            return;
          }
        });
      }
    });
  }

  /**
   * Handle click on widget item - open entity details
   */
  function handleItemClick(event) {
    const item = event.target.closest('.recent-items-widget-item');
    if (!item) {
      return;
    }

    // Don't open if clicking on buttons or links
    if (event.target.closest('button, a')) {
      return;
    }

    const entityType = item.dataset.entityType;
    const entityId = item.dataset.entityId;

    if (entityType && entityId) {
      if (typeof window.showEntityDetails === 'function') {
        window.showEntityDetails(entityType, entityId);
      } else if (window.ModalManagerV2?.showModal) {
        const modalId = `${entityType}Modal`;
        window.ModalManagerV2.showModal(modalId, 'view', { entityId }).catch(() => {
          window.Logger?.warn?.('RecentItemsWidget: Failed to open modal', { entityType, entityId });
        });
      }
    }
  }

  /**
   * Build trade item HTML - using FieldRendererService like tables
   */
  function buildTradeItem(trade, currencySymbol) {
    const tradeId = trade?.id;
    const symbol = trade?.ticker?.symbol || trade?.ticker_symbol || trade?.symbol || (tradeId ? `טרייד #${tradeId}` : 'לא זמין');
    const side = trade?.side || trade?.position?.side || '';
    const quantity = trade?.position?.quantity ?? trade?.quantity;
    const amount = trade?.position?.market_value ?? trade?.position?.amount ?? trade?.amount ?? trade?.total_pl ?? trade?.entry_price;
    const date = trade?.created_at || trade?.opened_at || trade?.entry_date;
    const status = trade?.status || '';
    const investmentType = trade?.investment_type || '';

    // Use FieldRendererService for all rendering - like in trades.js table
    const FieldRenderer = window.FieldRendererService;
    
    // Title section (always visible)
    const sideHtml = side && FieldRenderer?.renderSide 
      ? FieldRenderer.renderSide(side) 
      : '';
    
    const dateLabel = formatDateShort(date);
    const amountHtml = amount !== undefined && amount !== null && FieldRenderer?.renderAmount
      ? FieldRenderer.renderAmount(Number(amount) || 0, currencySymbol, 2, true)
      : (amount !== undefined && amount !== null ? formatAmount(amount, currencySymbol) : 'לא זמין');

    // Details section (shown on hover) - use FieldRendererService
    const sideDisplay = side && FieldRenderer?.renderSide 
      ? FieldRenderer.renderSide(side) 
      : (side || '-');
    
    const quantityDisplay = quantity !== undefined && quantity !== null
      ? (FieldRenderer?.renderShares 
          ? FieldRenderer.renderShares(Number(quantity), 'numeric-ltr')
          : `${Number(quantity).toLocaleString('he-IL')}`)
      : '-';

    const dateDisplay = dateLabel || '-';
    const amountDisplay = amount !== undefined && amount !== null && FieldRenderer?.renderAmount
      ? FieldRenderer.renderAmount(Number(amount) || 0, currencySymbol, 2, true)
      : (amount !== undefined && amount !== null ? formatAmount(amount, currencySymbol) : '-');
    
    const statusDisplay = status && FieldRenderer?.renderStatus
      ? FieldRenderer.renderStatus(status, 'trade')
      : '';
    
    const typeDisplay = investmentType && FieldRenderer?.renderType
      ? FieldRenderer.renderType(investmentType)
      : '';

    // Get trade icon
    const tradeIconPath = '/trading-ui/images/icons/entities/trades.svg';
    
    const result = `
      <li class="list-group-item recent-items-widget-item" 
          data-entity-type="trade" 
          data-entity-id="${tradeId}"
          data-widget-overlay="true"
          role="button"
          tabindex="0">
        <!-- Header Section - Always Visible -->
        <div class="recent-items-widget-header">
          <div class="recent-items-widget-title">
            <div class="recent-items-widget-title-main-row">
              <img src="${tradeIconPath}" alt="טרייד" class="recent-items-widget-icon" width="16" height="16">
              <span class="recent-items-widget-title-main">${symbol}</span>
            </div>
            <div class="recent-items-widget-title-meta">
              ${statusDisplay ? `<span class="recent-items-widget-meta-item">${statusDisplay}</span>` : ''}
              ${dateLabel ? `<span class="recent-items-widget-meta-item">${dateLabel}</span>` : ''}
            </div>
          </div>
          <div class="recent-items-widget-amount">
            ${quantity !== undefined && quantity !== null ? `
              <div class="recent-items-widget-amount-quantity">${quantityDisplay}</div>
            ` : ''}
            <div class="recent-items-widget-amount-value">${amountHtml}</div>
          </div>
        </div>
        <!-- Details Section - Hidden by default, shown on hover -->
        <div class="recent-items-widget-details" data-overlay="true" data-role="widget-detail" data-entity-id="${tradeId}">
          <div class="recent-items-widget-details-content">
            ${side ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">צד:</span>
                <span class="recent-items-widget-details-value">${sideDisplay}</span>
              </div>
            ` : ''}
            ${statusDisplay ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">סטטוס:</span>
                <span class="recent-items-widget-details-value">${statusDisplay}</span>
              </div>
            ` : ''}
            ${typeDisplay ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">סוג:</span>
                <span class="recent-items-widget-details-value">${typeDisplay}</span>
              </div>
            ` : ''}
            ${quantity !== undefined && quantity !== null ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">כמות:</span>
                <span class="recent-items-widget-details-value">${quantityDisplay}</span>
              </div>
            ` : ''}
            ${amount !== undefined && amount !== null ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">סכום:</span>
                <span class="recent-items-widget-details-value">${amountDisplay}</span>
              </div>
            ` : ''}
            ${dateLabel ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">תאריך:</span>
                <span class="recent-items-widget-details-value">${dateDisplay}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </li>
    `;
    
    return result;
  }

  /**
   * Build trade plan item HTML - using FieldRendererService like tables
   */
  function buildTradePlanItem(plan, currencySymbol) {
    const planId = plan?.id;
    const name = plan?.name || plan?.title || (planId ? `תוכנית #${planId}` : 'לא זמין');
    // Try multiple ways to get ticker symbol
    const symbol = plan?.ticker?.symbol || plan?.ticker_symbol || plan?.symbol || 
                  // Note: getTickerSymbol may return a Promise, so we use ticker symbol from data
                  '';
    const investmentType = plan?.investment_type || plan?.type || '';
    const amount = plan?.planned_amount || plan?.amount || plan?.total_amount || plan?.investment_amount;
    const date = plan?.created_at || plan?.opened_at || plan?.entry_date;
    const status = plan?.status || '';
    const side = plan?.side || '';

    // Use FieldRendererService for all rendering - like in trade_plans.js table
    const FieldRenderer = window.FieldRendererService;

    // Title section (always visible)
    const dateLabel = formatDateShort(date);
    const amountHtml = amount !== undefined && amount !== null && FieldRenderer?.renderAmount
      ? FieldRenderer.renderAmount(Number(amount) || 0, currencySymbol, 2, true)
      : (amount !== undefined && amount !== null ? formatAmount(amount, currencySymbol) : 'לא זמין');

    // Details section (shown on hover) - use FieldRendererService
    const symbolDisplay = symbol || '-';
    
    const investmentTypeDisplay = investmentType && FieldRenderer?.renderType
      ? FieldRenderer.renderType(investmentType)
      : (investmentType || '-');
    
    const amountDisplay = amount !== undefined && amount !== null && FieldRenderer?.renderAmount
      ? FieldRenderer.renderAmount(Number(amount) || 0, currencySymbol, 2, true)
      : (amount !== undefined && amount !== null ? formatAmount(amount, currencySymbol) : '-');
    
    const dateDisplay = dateLabel || '-';
    
    const statusHtml = status && FieldRenderer?.renderStatus
      ? FieldRenderer.renderStatus(status, 'trade_plan')
      : '';
    
    const sideHtml = side && FieldRenderer?.renderSide
      ? FieldRenderer.renderSide(side)
      : '';

    // Get trade plan icon
    const planIconPath = '/trading-ui/images/icons/entities/trade_plans.svg';
    
    return `
      <li class="list-group-item recent-items-widget-item" 
          data-entity-type="trade_plan" 
          data-entity-id="${planId}"
          data-widget-overlay="true"
          role="button"
          tabindex="0">
        <!-- Header Section - Always Visible -->
        <div class="recent-items-widget-header">
          <div class="recent-items-widget-title">
            <div class="recent-items-widget-title-main-row">
              <img src="${planIconPath}" alt="תוכנית" class="recent-items-widget-icon" width="16" height="16">
              <span class="recent-items-widget-title-main">${symbol || name}</span>
            </div>
            <div class="recent-items-widget-title-meta">
              ${statusHtml ? `<span class="recent-items-widget-meta-item">${statusHtml}</span>` : ''}
              ${dateLabel ? `<span class="recent-items-widget-meta-item">${dateLabel}</span>` : ''}
            </div>
          </div>
          <div class="recent-items-widget-amount">
            <div class="recent-items-widget-amount-value">${amountHtml}</div>
          </div>
        </div>
        <!-- Details Section - Hidden by default, shown on hover -->
        <div class="recent-items-widget-details" data-overlay="true" data-role="widget-detail" data-entity-id="${planId}">
          <div class="recent-items-widget-details-content">
            ${symbol ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">סימבול:</span>
                <span class="recent-items-widget-details-value">${symbolDisplay}</span>
              </div>
            ` : ''}
            ${sideHtml ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">צד:</span>
                <span class="recent-items-widget-details-value">${sideHtml}</span>
              </div>
            ` : ''}
            ${investmentType ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">סוג השקעה:</span>
                <span class="recent-items-widget-details-value">${investmentTypeDisplay}</span>
              </div>
            ` : ''}
            ${amount !== undefined && amount !== null ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">סכום:</span>
                <span class="recent-items-widget-details-value">${amountDisplay}</span>
              </div>
            ` : ''}
            ${dateLabel ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">תאריך:</span>
                <span class="recent-items-widget-details-value">${dateDisplay}</span>
              </div>
            ` : ''}
            ${statusHtml ? `
              <div class="recent-items-widget-details-row">
                <span class="recent-items-widget-details-label">סטטוס:</span>
                <span class="recent-items-widget-details-value">${statusHtml}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </li>
    `;
  }

  /**
   * Render trades list
   */
  function renderTrades(trades, currencySymbol) {

    if (!elements.tradesList) {
      window.Logger?.warn?.('RecentItemsWidget: tradesList element not found', { page: 'recent-items-widget' });
      return;
    }

    // Remove all existing event listeners from previous items before clearing
    const existingItems = elements.tradesList.querySelectorAll('.recent-items-widget-item');
    existingItems.forEach(item => {
      // Clone and replace to remove all event listeners
      const newItem = item.cloneNode(true);
      item.parentNode?.replaceChild(newItem, item);
    });

    // Clear list completely - remove all children
    while (elements.tradesList.firstChild) {
      elements.tradesList.removeChild(elements.tradesList.firstChild);
    }
    
    // Also clear innerHTML as backup
    elements.tradesList.textContent = '';
    
    // List cleared

    // Hide loading/error states
    if (elements.tradesLoading) {
      elements.tradesLoading.classList.add('d-none');
    }
    if (elements.tradesError) {
      elements.tradesError.classList.add('d-none');
    }

    if (!Array.isArray(trades) || trades.length === 0) {
      if (elements.tradesEmpty) {
        elements.tradesEmpty.classList.remove('d-none');
      }
      return;
    }

    if (elements.tradesEmpty) {
      elements.tradesEmpty.classList.add('d-none');
    }

    const sorted = sortByDate(trades, 'created_at');
    const maxItems = state.config?.maxItems || DEFAULT_MAX_ITEMS;
    const topTrades = sorted.slice(0, maxItems);


    // elements.tradesList is already a <ul> element - just append <li> items directly
    const fragment = document.createDocumentFragment();

    topTrades.forEach((trade, index) => {
      try {
        const itemHtml = buildTradeItem(trade, currencySymbol);
        const parser = new DOMParser();
        const doc = parser.parseFromString(itemHtml.trim(), 'text/html');
        const item = doc.body.firstElementChild;
        if (item && item.classList.contains('recent-items-widget-item')) {
          // Ensure item is visible
          item.style.display = '';
          item.style.visibility = 'visible';
          item.style.opacity = '1';
          
          fragment.appendChild(item);
        } else {
          window.Logger?.warn?.('RecentItemsWidget: Failed to get valid item from HTML', {
            index,
            tradeId: trade?.id,
            page: 'recent-items-widget'
          });
        }
      } catch (error) {
        window.Logger?.error?.('RecentItemsWidget: Error building trade item', {
          error: error?.message,
          tradeId: trade?.id,
          index,
          page: 'recent-items-widget'
        });
      }
    });

    // Append all items at once to the existing <ul>
    elements.tradesList.appendChild(fragment);

    // Reset positioning after rendering to ensure proper layout
    resetTabPanesPositioning();
    
    // Dispatch event to trigger height equalization after content update (same as Unified Pending Actions Widget)
    window.dispatchEvent(new CustomEvent('widgetContentUpdated'));
    
    // Wait for DOM to update before initializing buttons and overlay (same as Unified Pending Actions Widget)
    requestAnimationFrame(() => {
      if (elements.tradesList && elements.tradesList.parentNode && elements.tradesList.innerHTML) {
        // Initialize buttons only if list has content and is in DOM
        if (window.ButtonSystem?.initializeButtons) {
          try {
            window.ButtonSystem.initializeButtons(elements.tradesList);
          } catch (error) {
            window.Logger?.warn?.('Failed to initialize buttons', { error, page: 'recent-items-widget' });
          }
        }
        
        // Setup overlay hover AFTER items are rendered and buttons initialized (same as Unified Pending Actions Widget)
        setupOverlayForList(elements.tradesList, 'trades');
      }
    });
    
    // Bind events using event delegation
    bindItemEvents(elements.tradesList);
  }

  /**
   * Render trade plans list
   */
  function renderTradePlans(tradePlans, currencySymbol) {
    
    if (!elements.plansList) {
      window.Logger?.warn?.('RecentItemsWidget: plansList element not found', { 
        containerExists: !!elements.container,
        containerId: elements.container?.id,
        page: 'recent-items-widget' 
      });
      return;
    }

    // Remove all existing event listeners from previous items before clearing
    const existingItems = elements.plansList.querySelectorAll('.recent-items-widget-item');
    existingItems.forEach(item => {
      // Clone and replace to remove all event listeners
      const newItem = item.cloneNode(true);
      item.parentNode?.replaceChild(newItem, item);
    });

    // Clear list completely - remove all children
    while (elements.plansList.firstChild) {
      elements.plansList.removeChild(elements.plansList.firstChild);
    }
    
    // Also clear innerHTML as backup
    elements.plansList.textContent = '';
    
    // List cleared

    // Hide loading/error states
    if (elements.plansLoading) {
      elements.plansLoading.classList.add('d-none');
    }
    if (elements.plansError) {
      elements.plansError.classList.add('d-none');
    }

    if (!Array.isArray(tradePlans) || tradePlans.length === 0) {
      if (elements.plansEmpty) {
        elements.plansEmpty.classList.remove('d-none');
      }
      return;
    }
    
    // Rendering trade plans

    if (elements.plansEmpty) {
      elements.plansEmpty.classList.add('d-none');
    }

    const sorted = sortByDate(tradePlans, 'created_at');
    const maxItems = state.config?.maxItems || DEFAULT_MAX_ITEMS;
    const topPlans = sorted.slice(0, maxItems);

    // elements.plansList is already a <ul> element - just append <li> items directly
    const fragment = document.createDocumentFragment();

    topPlans.forEach(plan => {
      const itemHtml = buildTradePlanItem(plan, currencySymbol);
      const parser = new DOMParser();
      const doc = parser.parseFromString(itemHtml.trim(), 'text/html');
      const item = doc.body.firstElementChild;
      if (item && item.classList.contains('recent-items-widget-item')) {
        // Ensure item is visible
        item.style.display = '';
        item.style.visibility = 'visible';
        item.style.opacity = '1';
        
        fragment.appendChild(item);
      } else {
        window.Logger?.warn?.('RecentItemsWidget: Failed to get valid trade plan item from HTML', {
          planId: plan?.id,
          itemExists: !!item,
          itemType: item?.tagName,
          itemClasses: item?.className,
          htmlPreview: itemHtml?.substring(0, 200),
          page: 'recent-items-widget'
        });
      }
    });

    // Append all items at once to the existing <ul>
    elements.plansList.appendChild(fragment);

    // Reset positioning after rendering to ensure proper layout
    resetTabPanesPositioning();
    
    // Dispatch event to trigger height equalization after content update (same as Unified Pending Actions Widget)
    window.dispatchEvent(new CustomEvent('widgetContentUpdated'));
    
    // Wait for DOM to update before initializing buttons and overlay (same as Unified Pending Actions Widget)
    requestAnimationFrame(() => {
      if (elements.plansList && elements.plansList.parentNode && elements.plansList.innerHTML) {
        // Initialize buttons only if list has content and is in DOM
        if (window.ButtonSystem?.initializeButtons) {
          try {
            window.ButtonSystem.initializeButtons(elements.plansList);
          } catch (error) {
            window.Logger?.warn?.('Failed to initialize buttons', { error, page: 'recent-items-widget' });
          }
        }
        
        // Setup overlay hover AFTER items are rendered and buttons initialized (same as Unified Pending Actions Widget)
        setupOverlayForList(elements.plansList, 'plans');
      }
    });
    
    // Bind events using event delegation
    bindItemEvents(elements.plansList);
  }

  // Public API
  const RecentItemsWidget = {
    /**
     * Initialize widget
     * @param {string} containerId - Container ID (optional, defaults to CONTAINER_ID)
     * @param {object} config - Configuration object (optional)
     */
    init(containerId = CONTAINER_ID, config = {}) {
      // Deduplication: prevent multiple initialization calls
      if (state.initialized) {
        window.Logger?.debug?.('RecentItemsWidget: Already initialized, skipping duplicate init', { 
          page: 'recent-items-widget',
          containerId 
        });
        return;
      }
      
      // Mark as initializing to prevent race conditions
      if (state._initializing) {
        window.Logger?.debug?.('RecentItemsWidget: Initialization already in progress, skipping duplicate call', { 
          page: 'recent-items-widget',
          containerId 
        });
        return;
      }
      state._initializing = true;

      // Merge configuration with defaults
      state.config = {
        ...DEFAULT_CONFIG,
        ...config
      };

      window.Logger?.info?.('RecentItemsWidget: Initializing...', { 
        containerId, 
        config: state.config,
        page: 'recent-items-widget' 
      });

      if (!cacheElements()) {
        window.Logger?.warn?.('RecentItemsWidget: Container not found, will retry...', { 
          containerId, 
          page: 'recent-items-widget',
          containerExists: !!document.getElementById(containerId)
        });
        // Retry after a short delay if DOM might not be ready
        setTimeout(() => {
          if (!state.initialized && cacheElements()) {
            window.Logger?.info?.('RecentItemsWidget: Container found on retry, initializing...', { page: 'recent-items-widget' });
            bindEvents();
            state.activeTab = state.config.defaultTab || 'trades';
            state.initialized = true;
          }
        }, 500);
        return;
      }

      window.Logger?.info?.('RecentItemsWidget: Container found, binding events...', { page: 'recent-items-widget' });
      
      bindEvents();
      
      // Set active tab from config
      if (state.config.defaultTab === 'plans' && elements.plansTab && window.bootstrap?.Tab) {
        const plansTabInstance = new window.bootstrap.Tab(elements.plansTab);
        plansTabInstance.show();
        state.activeTab = 'plans';
      } else {
        state.activeTab = 'trades';
      }
      
      state.initialized = true;
      state._initializing = false; // Clear initializing flag
      
      // Reset positioning after initialization to ensure proper layout
      resetTabPanesPositioning();
      
      window.Logger?.info?.('RecentItemsWidget: Initialization complete', { page: 'recent-items-widget' });
    },

    /**
     * Render/update widget data
     * @param {object} data - Data object
     * @param {Array} data.trades - Array of trades
     * @param {Array} data.tradePlans - Array of trade plans
     * @param {string} data.currencySymbol - Currency symbol (optional)
     */
    render(data = {}) {
      // Auto-initialize if not already initialized
      if (!state.initialized) {
        // Try to initialize - don't fail if container not found yet
        this.init();
        
        // If still not initialized, store data for later
        if (!state.initialized) {
          window.Logger?.warn?.('RecentItemsWidget: Not initialized yet, storing data for later', { page: 'recent-items-widget' });
          state.pendingTrades = Array.isArray(data.trades) ? data.trades : [];
          state.pendingTradePlans = Array.isArray(data.tradePlans) ? data.tradePlans : [];
          state.pendingCurrencySymbol = data.currencySymbol || '$';
          
          // Retry after delay
          setTimeout(() => {
            if (!state.initialized) {
              this.init();
              if (state.initialized && (state.pendingTrades || state.pendingTradePlans)) {
                this.render({
                  trades: state.pendingTrades,
                  tradePlans: state.pendingTradePlans,
                  currencySymbol: state.pendingCurrencySymbol
                });
              }
            }
          }, 1000);
          return;
        }
      }
      
      // Check if we have pending data from before initialization
      if (state.initialized && (state.pendingTrades || state.pendingTradePlans)) {
        data.trades = data.trades && data.trades.length > 0 ? data.trades : (state.pendingTrades || []);
        data.tradePlans = data.tradePlans && data.tradePlans.length > 0 ? data.tradePlans : (state.pendingTradePlans || []);
        data.currencySymbol = data.currencySymbol || state.pendingCurrencySymbol || '$';
        state.pendingTrades = null;
        state.pendingTradePlans = null;
        state.pendingCurrencySymbol = null;
      }

      if (!state.initialized) {
        window.Logger?.warn?.('RecentItemsWidget: Failed to initialize, cannot render', { page: 'recent-items-widget' });
        return;
      }

      const currencySymbol = data.currencySymbol || state.currencySymbol || '$';

      // Update state - update each property independently
      // Trades: update if provided AND has items (preserve existing if empty array passed)
      if (data.hasOwnProperty('trades')) {
        if (Array.isArray(data.trades)) {
          if (data.trades.length > 0) {
            // Update if we have trades to display
            state.trades = data.trades;
          }
          // If empty array passed, only update if state was already empty (initial state)
          // Otherwise preserve existing trades (don't overwrite with empty)
          else if (state.trades.length === 0) {
            // Only set to empty if state was already empty (initial state)
            state.trades = data.trades;
          }
          // Otherwise preserve existing trades (don't overwrite with empty)
        }
        // If trades is explicitly undefined, preserve existing
      }
      
      // Trade Plans: update if provided (undefined means don't update - preserve existing)
      if (data.hasOwnProperty('tradePlans')) {
        if (Array.isArray(data.tradePlans)) {
          // Update trade plans (even if empty array - allows clearing)
          state.tradePlans = data.tradePlans;
        }
        // If tradePlans is explicitly undefined, preserve existing
      }
      
      if (data.hasOwnProperty('currencySymbol')) {
        state.currencySymbol = currencySymbol;
      }

      // Render both tabs with current state (ensure arrays exist)
      const tradesToRender = Array.isArray(state.trades) ? state.trades : [];
      const tradePlansToRender = Array.isArray(state.tradePlans) ? state.tradePlans : [];
      
      // About to render
      
      renderTrades(tradesToRender, currencySymbol);
      renderTradePlans(tradePlansToRender, currencySymbol);
      
      // Completed rendering

      // Dispatch event to trigger height equalization
      window.dispatchEvent(new CustomEvent('widgetContentUpdated'));
    },

    /**
     * Refresh widget data and re-render
     * 
     * @param {Object} data - Optional new data to render
     */
    async refresh(data = null) {
      if (!state.initialized) {
        return;
      }

      // If new data provided, use it; otherwise re-render with existing data
      if (data) {
        await RecentItemsWidget.render(data);
      } else {
        // Re-render with current state
        await RecentItemsWidget.render({
          trades: state.trades,
          tradePlans: state.tradePlans,
          currencySymbol: state.currencySymbol || '$'
        });
      }
    },

    /**
     * Destroy widget and cleanup
     */
    destroy() {
      if (!state.initialized) {
        return;
      }
      
      state.initialized = false;
      state.trades = [];
      state.tradePlans = [];
      state.pendingTrades = null;
      state.pendingTradePlans = null;
      state.pendingCurrencySymbol = null;
      state.overlaySetup = {}; // Reset overlay setup tracking (same as Unified Pending Actions Widget)
      
      // Remove event listeners by cloning elements
      if (elements.tradesTab) {
        const newTab = elements.tradesTab.cloneNode(true);
        elements.tradesTab.parentNode?.replaceChild(newTab, elements.tradesTab);
        elements.tradesTab = newTab;
      }
      
      if (elements.plansTab) {
        const newTab = elements.plansTab.cloneNode(true);
        elements.plansTab.parentNode?.replaceChild(newTab, elements.plansTab);
        elements.plansTab = newTab;
      }
      
      // Cleanup overlay handlers from WidgetOverlayService
      if (window.WidgetOverlayService) {
        if (elements.tradesList) {
          window.WidgetOverlayService.destroy(elements.tradesList);
        }
        if (elements.plansList) {
          window.WidgetOverlayService.destroy(elements.plansList);
        }
      }
      
      // Event listeners are cleaned up via event delegation on list elements
      // No need to manually remove them from individual items
      
      window.Logger?.info?.('RecentItemsWidget: Destroyed and cleaned up', { page: 'recent-items-widget' });
    },

    version: '1.0.0'
  };

  // Export to global scope
  window.RecentItemsWidget = RecentItemsWidget;
  
  // Expose state for debugging (read-only) - after object creation
  Object.defineProperty(RecentItemsWidget, 'state', {
    get: () => state,
    enumerable: false,
    configurable: false
  });
  
  // Log successful load
  if (window.Logger) {
    window.Logger.info('Recent Items Widget loaded successfully', { page: 'recent-items-widget', version: '1.0.0' });
  }
})();




