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
    pendingCurrencySymbol: null
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
   * Monitor visibility of all items to understand why some are hidden
   * Used for debugging visibility issues
   */
  function monitorItemsVisibility(items, tabType) {
    if (!items || items.length === 0) {
      window.Logger?.warn?.('⚠️ [RecentItemsWidget] No items to monitor', { tabType, page: 'recent-items-widget' });
      return;
    }

    window.Logger?.info?.(`🔍 [RecentItemsWidget] Monitoring visibility for ${items.length} items (${tabType})`, {
      tabType,
      totalItems: items.length,
      page: 'recent-items-widget'
    });

    const itemsInfo = Array.from(items).map((item, index) => {
      const rect = item.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(item);
      const parentRect = item.parentElement?.getBoundingClientRect();
      const parentComputedStyle = item.parentElement ? window.getComputedStyle(item.parentElement) : null;

      // Check if item is visible
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       computedStyle.display !== 'none' &&
                       computedStyle.visibility !== 'hidden' &&
                       parseFloat(computedStyle.opacity) > 0;

      // Check parent visibility
      const parentVisible = !parentComputedStyle || (
        parentComputedStyle.display !== 'none' &&
        parentComputedStyle.visibility !== 'hidden' &&
        parseFloat(parentComputedStyle.opacity) > 0
      );

      const info = {
        index,
        entityId: item.getAttribute('data-entity-id'),
        entityType: item.getAttribute('data-entity-type'),
        isVisible,
        parentVisible,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        },
        computedStyles: {
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          position: computedStyle.position,
          zIndex: computedStyle.zIndex,
          transform: computedStyle.transform,
          overflow: computedStyle.overflow,
          height: computedStyle.height,
          minHeight: computedStyle.minHeight,
          maxHeight: computedStyle.maxHeight
        },
        inlineStyles: {
          display: item.style.display || '(none)',
          visibility: item.style.visibility || '(none)',
          opacity: item.style.opacity || '(none)',
          position: item.style.position || '(none)',
          transform: item.style.transform || '(none)'
        },
        parentRect: parentRect ? {
          top: parentRect.top,
          left: parentRect.left,
          width: parentRect.width,
          height: parentRect.height,
          bottom: parentRect.bottom,
          right: parentRect.right
        } : null,
        parentComputedStyles: parentComputedStyle ? {
          display: parentComputedStyle.display,
          visibility: parentComputedStyle.visibility,
          opacity: parentComputedStyle.opacity,
          overflow: parentComputedStyle.overflow,
          height: parentComputedStyle.height,
          maxHeight: parentComputedStyle.maxHeight,
          overflowY: parentComputedStyle.overflowY
        } : null,
        textContent: item.textContent?.trim().substring(0, 50) || '(empty)',
        hasContent: item.textContent?.trim().length > 0,
        classes: item.className,
        parentClasses: item.parentElement?.className || '(none)',
        parentId: item.parentElement?.id || '(none)'
      };

      return info;
    });

    // Find hidden items
    const hiddenItems = itemsInfo.filter(info => !info.isVisible);
    const visibleItems = itemsInfo.filter(info => info.isVisible);

    // Compare first 2 items with rest
    const firstTwoItems = itemsInfo.slice(0, 2);
    const restItems = itemsInfo.slice(2);

    window.Logger?.info?.(`📊 [RecentItemsWidget] Visibility Analysis (${tabType}):`, {
      tabType,
      totalItems: itemsInfo.length,
      visibleItems: visibleItems.length,
      hiddenItems: hiddenItems.length,
      firstTwoItems: firstTwoItems.map(item => ({
        index: item.index,
        isVisible: item.isVisible,
        entityId: item.entityId,
        display: item.computedStyles.display,
        visibility: item.computedStyles.visibility,
        opacity: item.computedStyles.opacity,
        rect: item.rect,
        hasContent: item.hasContent
      })),
      restItems: restItems.map(item => ({
        index: item.index,
        isVisible: item.isVisible,
        entityId: item.entityId,
        display: item.computedStyles.display,
        visibility: item.computedStyles.visibility,
        opacity: item.computedStyles.opacity,
        rect: item.rect,
        hasContent: item.hasContent
      })),
      page: 'recent-items-widget'
    });

    // Detailed comparison between first 2 and rest
    if (firstTwoItems.length > 0 && restItems.length > 0) {
      const differences = [];
      
      // Compare computed styles
      const firstItem = firstTwoItems[0];
      const thirdItem = restItems[0];
      
      Object.keys(firstItem.computedStyles).forEach(key => {
        if (firstItem.computedStyles[key] !== thirdItem.computedStyles[key]) {
          differences.push({
            property: key,
            firstItem: firstItem.computedStyles[key],
            thirdItem: thirdItem.computedStyles[key]
          });
        }
      });

      // Compare parent styles
      if (firstItem.parentComputedStyles && thirdItem.parentComputedStyles) {
        Object.keys(firstItem.parentComputedStyles).forEach(key => {
          if (firstItem.parentComputedStyles[key] !== thirdItem.parentComputedStyles[key]) {
            differences.push({
              property: `parent.${key}`,
              firstItem: firstItem.parentComputedStyles[key],
              thirdItem: thirdItem.parentComputedStyles[key]
            });
          }
        });
      }

      // Compare rect positions
      if (firstItem.rect && thirdItem.rect) {
        const rectDiff = {
          topDiff: firstItem.rect.top - thirdItem.rect.top,
          leftDiff: firstItem.rect.left - thirdItem.rect.left,
          widthDiff: firstItem.rect.width - thirdItem.rect.width,
          heightDiff: firstItem.rect.height - thirdItem.rect.height
        };
        
        differences.push({
          property: 'rect',
          firstItem: firstItem.rect,
          thirdItem: thirdItem.rect,
          differences: rectDiff
        });
      }

      window.Logger?.info?.(`🔍 [RecentItemsWidget] Differences between first 2 items and rest (${tabType}):`, {
        tabType,
        differences,
        firstItemFull: firstItem,
        thirdItemFull: thirdItem,
        page: 'recent-items-widget'
      });
    }

    // Log hidden items details
    if (hiddenItems.length > 0) {
      window.Logger?.warn?.(`⚠️ [RecentItemsWidget] Found ${hiddenItems.length} hidden items (${tabType}):`, {
        tabType,
        hiddenItems: hiddenItems.map(item => ({
          index: item.index,
          entityId: item.entityId,
          reason: !item.isVisible ? 'Item computed styles indicate hidden' : 'Unknown',
          computedStyles: item.computedStyles,
          inlineStyles: item.inlineStyles,
          parentStyles: item.parentComputedStyles,
          rect: item.rect,
          textContent: item.textContent
        })),
        page: 'recent-items-widget'
      });
    }

    // Log all items for detailed inspection
    window.Logger?.info?.(`📋 [RecentItemsWidget] Full items details (${tabType}):`, {
      tabType,
      allItems: itemsInfo,
      page: 'recent-items-widget'
    });
  }

  /**
   * Bind events
   */
  function bindEvents() {
    // Event listeners are bound via Bootstrap Tab events
    // No direct event binding needed here
  }

  /**
   * Monitor and log positioning/heights for debugging
   */
  function logPositioningInfo(tabName) {
    const pane = tabName === 'trades' ? elements.tradesPane : elements.plansPane;
    const list = tabName === 'trades' ? elements.tradesList : elements.plansList;
    const wrapper = pane?.querySelector('.d-flex');
    
    if (!pane) {
      window.Logger?.warn?.('⚠️ [RecentItemsWidget] Pane not found for positioning check', { tabName, page: 'recent-items-widget' });
      return;
    }

    const paneRect = pane.getBoundingClientRect();
    const listRect = list?.getBoundingClientRect();
    const wrapperRect = wrapper?.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(pane);

    window.Logger?.info?.(`📐 [RecentItemsWidget] Positioning info for ${tabName} tab:`, {
      tabName,
      paneTop: paneRect.top,
      paneLeft: paneRect.left,
      paneHeight: paneRect.height,
      paneWidth: paneRect.width,
      listTop: listRect?.top || 'N/A',
      listHeight: listRect?.height || 'N/A',
      wrapperTop: wrapperRect?.top || 'N/A',
      wrapperHeight: wrapperRect?.height || 'N/A',
      computedPosition: computedStyle.position,
      computedDisplay: computedStyle.display,
      computedTop: computedStyle.top,
      computedLeft: computedStyle.left,
      computedTransform: computedStyle.transform,
      hasActiveClass: pane.classList.contains('active'),
      hasShowClass: pane.classList.contains('show'),
      page: 'recent-items-widget'
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
        
        window.Logger?.debug?.('RecentItemsWidget: Switched to trades tab, ensuring content is rendered', { page: 'recent-items-widget' });
        
        // Log positioning info
        setTimeout(() => {
          logPositioningInfo('trades');
        }, 50);
        
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
        
        window.Logger?.info?.('🔍 [RecentItemsWidget] Tab switched to PLANS', {
          initialized: state.initialized,
          stateTradesCount: state.trades?.length || 0,
          stateTradePlansCount: state.tradePlans?.length || 0,
          plansListExists: !!elements.plansList,
          plansPaneExists: !!elements.plansPane,
          page: 'recent-items-widget'
        });
        
        // Log positioning info
        setTimeout(() => {
          logPositioningInfo('plans');
        }, 50);
        
        // Re-render to ensure trade plans are displayed
        if (state.initialized) {
          const tradesToRender = Array.isArray(state.trades) ? state.trades : [];
          const tradePlansToRender = Array.isArray(state.tradePlans) ? state.tradePlans : [];
          const currencySymbol = state.currencySymbol || '$';
          window.Logger?.info?.('🔍 [RecentItemsWidget] Re-rendering after tab switch to plans', {
            tradesToRender: tradesToRender.length,
            tradePlansToRender: tradePlansToRender.length,
            currencySymbol,
            page: 'recent-items-widget'
          });
          renderTrades(tradesToRender, currencySymbol);
          renderTradePlans(tradePlansToRender, currencySymbol);
        } else {
          window.Logger?.warn?.('⚠️ [RecentItemsWidget] Widget not initialized, cannot re-render on tab switch', { page: 'recent-items-widget' });
        }
      });
    }
  }

  /**
   * Handle hover on widget items
   */
  /**
   * Calculate and position overlay using fixed positioning to extend beyond container
   * Note: This function is currently not used - overlay positioning is handled by CSS
   */
  function positionOverlay(item, details) {
    if (!item || !details) {
      window.Logger?.warn?.('RecentItemsWidget: positionOverlay - Missing item or details', {
        hasItem: !!item,
        hasDetails: !!details,
        page: 'recent-items-widget'
      });
      return;
    }

    const itemRect = item.getBoundingClientRect();
    const isRTL = document.documentElement.dir === 'rtl' || 
                  getComputedStyle(document.body).direction === 'rtl';
    
    // Show overlay temporarily to get dimensions
    const originalDisplay = details.style.display || window.getComputedStyle(details).display;
    const originalVisibility = details.style.visibility || window.getComputedStyle(details).visibility;
    const originalOpacity = details.style.opacity || window.getComputedStyle(details).opacity;
    
    // Force visibility to measure
    details.style.position = 'fixed';
    details.style.visibility = 'hidden';
    details.style.opacity = '0';
    details.style.display = 'block';
    details.style.pointerEvents = 'none';
    
    // Get dimensions
    const overlayWidth = Math.max(details.offsetWidth || 300, 280);
    const overlayHeight = details.offsetHeight || 150;
    
    // Position below item
    let top = itemRect.bottom + 8; // 8px gap (0.5rem)
    let left = itemRect.left;
    let right = 'auto';
    
    // For RTL, position from right
    if (isRTL) {
      left = 'auto';
      right = window.innerWidth - itemRect.right;
    }
    
    // Check if overlay goes beyond viewport bottom
    if (top + overlayHeight > window.innerHeight) {
      // Position above item instead
      top = itemRect.top - overlayHeight - 8;
      // If still doesn't fit, position at viewport top
      if (top < 0) {
        top = 8;
      }
    }
    
    // Check horizontal overflow
    if (!isRTL && left + overlayWidth > window.innerWidth) {
      left = window.innerWidth - overlayWidth - 8;
      if (left < 8) left = 8;
    } else if (isRTL && typeof right === 'number') {
      const rightNum = Number(right);
      if (rightNum + overlayWidth > window.innerWidth) {
        right = window.innerWidth - overlayWidth - 8;
        if (right < 8) right = 8;
      }
    }
    
    // Apply fixed positioning
    details.style.position = 'fixed';
    details.style.top = `${top}px`;
    if (isRTL) {
      const rightValue = typeof right === 'number' ? right : window.innerWidth - itemRect.right;
      details.style.right = `${rightValue}px`;
      details.style.left = 'auto';
    } else {
      details.style.left = `${left}px`;
      details.style.right = 'auto';
    }
    details.style.width = `${overlayWidth}px`;
    details.style.maxWidth = '400px';
    details.style.minWidth = '280px';
    details.style.zIndex = '9999'; // Very high z-index to appear above everything
    details.style.display = 'block';
    details.style.visibility = 'visible';
    details.style.pointerEvents = 'auto';
    // Ensure overlay is not clipped
    details.style.overflow = 'visible';
    details.style.clip = 'auto';
    details.style.clipPath = 'none';
    
    // Get actual position after setting styles
    const finalRect = details.getBoundingClientRect();
    
    window.Logger?.debug?.('RecentItemsWidget: Overlay positioned', {
      itemId: item.getAttribute('data-entity-id'),
      position: details.style.position,
      top: details.style.top,
      left: details.style.left,
      right: details.style.right,
      width: details.style.width,
      height: overlayHeight,
      zIndex: details.style.zIndex,
      itemRect: { top: itemRect.top, bottom: itemRect.bottom, left: itemRect.left, right: itemRect.right },
      isRTL,
      page: 'recent-items-widget'
    });
  }

  /**
   * Handle hover on widget items
   */
  function handleItemHover(event) {
    const item = event.target.closest('.recent-items-widget-item');
    if (!item) {
      window.Logger?.warn?.('RecentItemsWidget: handleItemHover - No item found', {
        target: event.target?.className,
        page: 'recent-items-widget'
      });
      return;
    }

    const details = item.querySelector('.recent-items-widget-details-container');
    
    if (event.type === 'mouseenter') {
      item.classList.add('is-hovered');
      
      // CSS class .is-hovered will handle showing the details container
      if (!details) {
        window.Logger?.warn?.('RecentItemsWidget: No details element found', {
          itemId: item.getAttribute('data-entity-id'),
          page: 'recent-items-widget'
        });
      }
    } else if (event.type === 'mouseleave') {
      // Check if mouse is moving to overlay
      const relatedTarget = event.relatedTarget;
      if (details && relatedTarget && details.contains(relatedTarget)) {
        // Mouse is moving to overlay, keep it visible
        return;
      }
      
      item.classList.remove('is-hovered');
      
      // Reset overlay positioning
      if (details) {
        // CSS class should handle opacity - don't set inline style
        // Reset to absolute positioning after transition
        setTimeout(() => {
          if (!item.classList.contains('is-hovered')) {
            details.style.position = '';
            details.style.top = '';
            details.style.left = '';
            details.style.right = '';
            details.style.width = '';
            details.style.zIndex = '';
          }
        }, 200); // Match transition duration
      }
    }
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

    const result = `
      <li class="list-group-item recent-items-widget-item" 
          data-entity-type="trade" 
          data-entity-id="${tradeId}"
          role="button"
          tabindex="0">
        <!-- Header Section - Always Visible -->
        <div class="recent-items-widget-header">
          <div class="recent-items-widget-title">
            <span class="recent-items-widget-title-main">${symbol}</span>
            <div class="recent-items-widget-title-meta">
              ${sideHtml ? `<span>${sideHtml}</span>` : ''}
              ${dateLabel ? `<span>${dateLabel}</span>` : ''}
            </div>
          </div>
          <div class="recent-items-widget-amount">${amountHtml}</div>
        </div>
        <!-- Details Section - Hidden by default, shown on hover -->
        <div class="recent-items-widget-details-container">
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
    const symbol = plan?.ticker?.symbol || plan?.symbol || '';
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

    return `
      <li class="list-group-item recent-items-widget-item" 
          data-entity-type="trade_plan" 
          data-entity-id="${planId}"
          role="button"
          tabindex="0">
        <!-- Header Section - Always Visible -->
        <div class="recent-items-widget-header">
          <div class="recent-items-widget-title">
            <span class="recent-items-widget-title-main">${name}</span>
            <div class="recent-items-widget-title-meta">
              ${symbol ? `<span>${symbol}</span>` : ''}
              ${dateLabel ? `<span>${dateLabel}</span>` : ''}
            </div>
          </div>
          <div class="recent-items-widget-amount">${amountHtml}</div>
        </div>
        <!-- Details Section - Hidden by default, shown on hover -->
        <div class="recent-items-widget-details-container">
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
    window.Logger?.info?.('🔍 [RecentItemsWidget] renderTrades START', {
      tradesCount: Array.isArray(trades) ? trades.length : 0,
      tradesListExists: !!elements.tradesList,
      currencySymbol,
      firstTrade: trades?.[0],
      page: 'recent-items-widget'
    });

    if (!elements.tradesList) {
      window.Logger?.warn?.('⚠️ [RecentItemsWidget] tradesList element not found', { page: 'recent-items-widget' });
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
    elements.tradesList.innerHTML = '';
    
    window.Logger?.debug?.('🔍 [RecentItemsWidget] tradesList cleared', {
      remainingChildren: elements.tradesList.children.length,
      innerHTMLLength: elements.tradesList.innerHTML.length,
      page: 'recent-items-widget'
    });

    // Hide loading/error states
    if (elements.tradesLoading) {
      elements.tradesLoading.classList.add('d-none');
    }
    if (elements.tradesError) {
      elements.tradesError.classList.add('d-none');
    }

    if (!Array.isArray(trades) || trades.length === 0) {
      window.Logger?.debug?.('🔍 [RecentItemsWidget] No trades to render', { 
        trades, 
        isArray: Array.isArray(trades),
        length: trades?.length,
        page: 'recent-items-widget' 
      });
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

    window.Logger?.info?.('🔍 [RecentItemsWidget] Rendering trades', {
      sortedCount: sorted.length,
      topTradesCount: topTrades.length,
      firstTradeData: topTrades[0],
      page: 'recent-items-widget'
    });

    // elements.tradesList is already a <ul> element - just append <li> items directly
    const fragment = document.createDocumentFragment();

    topTrades.forEach((trade, index) => {
      try {
        window.Logger?.debug?.('🔍 [RecentItemsWidget] Building trade item', {
          index,
          tradeId: trade?.id,
          tradeSymbol: trade?.ticker?.symbol || trade?.symbol,
          page: 'recent-items-widget'
        });
        
        const itemHtml = buildTradeItem(trade, currencySymbol);
        
        window.Logger?.debug?.('🔍 [RecentItemsWidget] Trade item HTML generated', {
          index,
          htmlLength: itemHtml?.length,
          htmlPreview: itemHtml?.substring(0, 200),
          page: 'recent-items-widget'
        });
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = itemHtml.trim();
        const item = tempDiv.firstElementChild;
        if (item && item.classList.contains('recent-items-widget-item')) {
          // Ensure item is visible
          item.style.display = '';
          item.style.visibility = 'visible';
          item.style.opacity = '1';
          
          fragment.appendChild(item);
          window.Logger?.debug?.('🔍 [RecentItemsWidget] Trade item appended to fragment', {
            index,
            itemExists: !!item,
            itemClasses: item.className,
            itemHasContent: item.textContent?.trim().length > 0,
            page: 'recent-items-widget'
          });
        } else {
          window.Logger?.warn?.('⚠️ [RecentItemsWidget] Failed to get valid item from HTML', {
            index,
            htmlLength: itemHtml?.length,
            itemExists: !!item,
            itemType: item?.tagName,
            itemClasses: item?.className,
            htmlPreview: itemHtml?.substring(0, 200),
            page: 'recent-items-widget'
          });
        }
      } catch (error) {
        window.Logger?.error?.('❌ [RecentItemsWidget] Error building trade item', {
          error: error?.message,
          trade,
          index,
          page: 'recent-items-widget'
        });
      }
    });

    // Append all items at once to the existing <ul>
    elements.tradesList.appendChild(fragment);

    // Reset positioning after rendering to ensure proper layout
    resetTabPanesPositioning();
    
    window.Logger?.info?.('🔍 [RecentItemsWidget] Trades rendered', {
      itemsInList: elements.tradesList.children.length,
      listHTMLPreview: elements.tradesList.innerHTML.substring(0, 300),
      page: 'recent-items-widget'
    });

    // Bind hover and click events
    const items = elements.tradesList.querySelectorAll('.recent-items-widget-item');
    
    window.Logger?.info?.('🔍 [RecentItemsWidget] Binding events', {
      itemsFound: items.length,
      listElement: elements.tradesList?.id,
      listChildren: elements.tradesList?.children?.length,
      page: 'recent-items-widget'
    });
    
    // Monitor visibility of all items to debug hidden items
    // Only monitor if the tab pane is active (visible)
    if (items.length > 0 && elements.tradesPane && (elements.tradesPane.classList.contains('active') || elements.tradesPane.classList.contains('show'))) {
      monitorItemsVisibility(items, 'trades');
    }
    
    if (items.length === 0) {
      window.Logger?.warn?.('⚠️ [RecentItemsWidget] No items found to bind events!', {
        listHTML: elements.tradesList?.innerHTML?.substring(0, 500),
        listChildren: elements.tradesList?.children?.length,
        page: 'recent-items-widget'
      });
      return;
    }
    
    items.forEach((item) => {
      item.addEventListener('mouseenter', handleItemHover);
      item.addEventListener('mouseleave', handleItemHover);
      item.addEventListener('click', handleItemClick);
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleItemClick(event);
        }
      });
      
      // Store handlers for potential cleanup
      item.__recentItemsHandlers = {
        mouseenter: handleItemHover,
        mouseleave: handleItemHover
      };
    });
    
    window.Logger?.info?.('RecentItemsWidget: Event listeners added', {
      itemsCount: items.length,
      page: 'recent-items-widget'
    });
  }

  /**
   * Render trade plans list
   */
  function renderTradePlans(tradePlans, currencySymbol) {
    window.Logger?.info?.('🔍 [RecentItemsWidget] renderTradePlans START', {
      tradePlansCount: Array.isArray(tradePlans) ? tradePlans.length : 0,
      isArray: Array.isArray(tradePlans),
      plansListExists: !!elements.plansList,
      plansListId: elements.plansList?.id,
      plansPaneExists: !!elements.plansPane,
      plansPaneId: elements.plansPane?.id,
      currencySymbol,
      firstPlan: tradePlans?.[0],
      fullTradePlans: tradePlans,
      page: 'recent-items-widget'
    });
    
    if (!elements.plansList) {
      window.Logger?.warn?.('⚠️ [RecentItemsWidget] plansList element not found', { 
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
    elements.plansList.innerHTML = '';
    
    window.Logger?.debug?.('🔍 [RecentItemsWidget] plansList cleared', {
      remainingChildren: elements.plansList.children.length,
      innerHTMLLength: elements.plansList.innerHTML.length,
      page: 'recent-items-widget'
    });

    // Hide loading/error states
    if (elements.plansLoading) {
      elements.plansLoading.classList.add('d-none');
    }
    if (elements.plansError) {
      elements.plansError.classList.add('d-none');
    }

    if (!Array.isArray(tradePlans) || tradePlans.length === 0) {
      window.Logger?.info?.('🔍 [RecentItemsWidget] No trade plans to render - showing empty state', { 
        isArray: Array.isArray(tradePlans),
        length: tradePlans?.length,
        tradePlans,
        plansEmptyExists: !!elements.plansEmpty,
        page: 'recent-items-widget' 
      });
      if (elements.plansEmpty) {
        elements.plansEmpty.classList.remove('d-none');
        window.Logger?.info?.('🔍 [RecentItemsWidget] Empty state shown', { page: 'recent-items-widget' });
      } else {
        window.Logger?.warn?.('⚠️ [RecentItemsWidget] plansEmpty element not found', { page: 'recent-items-widget' });
      }
      return;
    }
    
    window.Logger?.debug?.('RecentItemsWidget: Rendering trade plans', {
      count: tradePlans.length,
      page: 'recent-items-widget'
    });

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
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = itemHtml.trim();
      const item = tempDiv.firstElementChild;
      if (item && item.classList.contains('recent-items-widget-item')) {
        // Ensure item is visible
        item.style.display = '';
        item.style.visibility = 'visible';
        item.style.opacity = '1';
        
        fragment.appendChild(item);
      } else {
        window.Logger?.warn?.('⚠️ [RecentItemsWidget] Failed to get valid trade plan item from HTML', {
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
    
    window.Logger?.info?.('🔍 [RecentItemsWidget] Trade plans rendered', {
      itemsInList: elements.plansList.children.length,
      listHTMLPreview: elements.plansList.innerHTML.substring(0, 300),
      page: 'recent-items-widget'
    });

    // Bind hover and click events
    const items = elements.plansList.querySelectorAll('.recent-items-widget-item');
    
    window.Logger?.info?.('RecentItemsWidget: Binding events for plans', {
      itemsFound: items.length,
      listElement: elements.plansList?.id,
      listChildren: elements.plansList?.children?.length,
      page: 'recent-items-widget'
    });
    
    if (items.length === 0) {
      window.Logger?.warn?.('RecentItemsWidget: No plan items found to bind events', {
        listHTML: elements.plansList?.innerHTML?.substring(0, 500),
        listChildren: elements.plansList?.children?.length,
        page: 'recent-items-widget'
      });
      return;
    }
    
    // Monitor visibility of all items to debug hidden items
    // Only monitor if the tab pane is active (visible)
    if (items.length > 0 && elements.plansPane && (elements.plansPane.classList.contains('active') || elements.plansPane.classList.contains('show'))) {
      monitorItemsVisibility(items, 'tradePlans');
    }
    
    items.forEach((item) => {
      item.addEventListener('mouseenter', handleItemHover);
      item.addEventListener('mouseleave', handleItemHover);
      item.addEventListener('click', handleItemClick);
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleItemClick(event);
        }
      });
      
      // Store handlers for potential cleanup
      item.__recentItemsHandlers = {
        mouseenter: handleItemHover,
        mouseleave: handleItemHover
      };
    });
  }

  // Public API
  const RecentItemsWidget = {
    /**
     * Initialize widget
     * @param {string} containerId - Container ID (optional, defaults to CONTAINER_ID)
     * @param {object} config - Configuration object (optional)
     */
    init(containerId = CONTAINER_ID, config = {}) {
      if (state.initialized) {
        window.Logger?.info?.('RecentItemsWidget: Already initialized', { page: 'recent-items-widget' });
        return;
      }

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
      
      // Reset positioning after initialization to ensure proper layout
      resetTabPanesPositioning();
      
      // Log initial positioning
      setTimeout(() => {
        logPositioningInfo(state.activeTab);
      }, 100);
      
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
        window.Logger?.info?.('🔍 [RecentItemsWidget] Updating tradePlans in state', {
          hasTradePlans: data.hasOwnProperty('tradePlans'),
          isArray: Array.isArray(data.tradePlans),
          incomingCount: Array.isArray(data.tradePlans) ? data.tradePlans.length : 0,
          currentStateCount: state.tradePlans?.length || 0,
          page: 'recent-items-widget'
        });
        if (Array.isArray(data.tradePlans)) {
          // Update trade plans (even if empty array - allows clearing)
          state.tradePlans = data.tradePlans;
          window.Logger?.info?.('🔍 [RecentItemsWidget] Trade plans state updated', {
            newCount: state.tradePlans.length,
            firstPlan: state.tradePlans[0],
            page: 'recent-items-widget'
          });
        }
        // If tradePlans is explicitly undefined, preserve existing
      } else {
        window.Logger?.debug?.('🔍 [RecentItemsWidget] tradePlans not provided, preserving existing', {
          currentStateCount: state.tradePlans?.length || 0,
          page: 'recent-items-widget'
        });
      }
      
      if (data.hasOwnProperty('currencySymbol')) {
        state.currencySymbol = currencySymbol;
      }

      // Render both tabs with current state (ensure arrays exist)
      const tradesToRender = Array.isArray(state.trades) ? state.trades : [];
      const tradePlansToRender = Array.isArray(state.tradePlans) ? state.tradePlans : [];
      
      window.Logger?.info?.('🔍 [RecentItemsWidget] render() - About to render', {
        tradesCount: tradesToRender.length,
        tradePlansCount: tradePlansToRender.length,
        tradesArrayType: Array.isArray(state.trades),
        tradePlansArrayType: Array.isArray(state.tradePlans),
        stateTradesLength: state.trades?.length,
        stateTradePlansLength: state.tradePlans?.length,
        currencySymbol,
        page: 'recent-items-widget'
      });
      
      renderTrades(tradesToRender, currencySymbol);
      renderTradePlans(tradePlansToRender, currencySymbol);
      
      window.Logger?.info?.('🔍 [RecentItemsWidget] render() - Completed rendering', {
        tradesRendered: tradesToRender.length,
        tradePlansRendered: tradePlansToRender.length,
        page: 'recent-items-widget'
      });

      // Dispatch event to trigger height equalization
      window.dispatchEvent(new CustomEvent('widgetContentUpdated'));
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
      
      // Remove event listeners from items
      const allItems = [
        ...(elements.tradesList?.querySelectorAll('.recent-items-widget-item') || []),
        ...(elements.plansList?.querySelectorAll('.recent-items-widget-item') || [])
      ];
      
      allItems.forEach(item => {
        if (item.__recentItemsHandlers) {
          item.removeEventListener('mouseenter', item.__recentItemsHandlers.mouseenter);
          item.removeEventListener('mouseleave', item.__recentItemsHandlers.mouseleave);
          delete item.__recentItemsHandlers;
        }
      });
      
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

