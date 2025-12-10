/**
 * Watch Lists Widget - TikTrack Dashboard
 * ========================================
 * 
 * Widget for displaying watch list items in compact view on the home page.
 * Features:
 * - Compact view only (read-only)
 * - List selection dropdown in header
 * - Loading and empty states
 * - Hover overlay with additional details
 * 
 * This widget relies on general systems:
 * - WatchListsDataService for data fetching
 * - FieldRendererService for formatting
 * - Logger for logging
 * - NotificationSystem for errors
 * - WidgetOverlayService for hover overlays
 * - UnifiedCacheManager for state persistence
 * 
 * API:
 * - init(containerId, config) - Initialize widget
 * - render() - Render/update widget with current list items
 * - refresh() - Refresh data and re-render
 * - destroy() - Cleanup widget
 * 
 * Configuration:
 * - maxItems: number - Maximum items to display (default: 10)
 * 
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/WATCH_LISTS_WIDGET_DEVELOPER_GUIDE.md
 */

;(function () {
  'use strict';

  // ===== Constants =====
  const CONTAINER_ID = 'watchListsWidgetContainer';
  const DEFAULT_MAX_ITEMS = 10;
  const CACHE_KEY_LAST_LIST = 'watch-lists-widget-last-list-id';
  const PAGE_LOG_CONTEXT = { page: 'watch-lists-widget' };

  // Default configuration
  const DEFAULT_CONFIG = {
    maxItems: DEFAULT_MAX_ITEMS
  };

  // ===== State =====
  const state = {
    initialized: false,
    config: { ...DEFAULT_CONFIG },
    watchLists: [],
    activeListId: null,
    activeListItems: [],
    overlaySetup: false
  };

  async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (response.status === 429) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 8000);
          window.Logger?.warn?.('⚠️ watch-lists: Rate limited, retrying', { attempt: attempt + 1, waitTime, page: 'watch-lists-widget' });
          if (attempt < maxRetries - 1) {
            await new Promise(r => setTimeout(r, waitTime));
            continue;
          }
        }
        return response;
      } catch (err) {
        lastError = err;
      }
    }
    if (lastError) throw lastError;
    throw new Error('Rate limit exceeded after retries');
  }

  // ===== DOM Elements Cache =====
  const elements = {
    container: null,
    header: null,
    select: null,
    body: null,
    list: null,
    loading: null,
    empty: null,
    error: null
  };

  // ===== Helper Functions =====

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.container = document.getElementById(CONTAINER_ID);
    if (!elements.container) {
      return false;
    }

    elements.header = elements.container.querySelector('.card-header');
    elements.select = elements.container.querySelector('#watchListsWidgetSelect');
    elements.body = elements.container.querySelector('.card-body');
    elements.list = elements.container.querySelector('#watchListsWidgetList');
    elements.loading = elements.container.querySelector('#watchListsWidgetLoading');
    elements.empty = elements.container.querySelector('#watchListsWidgetEmpty');
    elements.error = elements.container.querySelector('#watchListsWidgetError');

    return true;
  }

  /**
   * Get last selected list ID from cache
   * @returns {Promise<number|null>}
   */
  async function getLastSelectedListId() {
    try {
      if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
        const lastListId = await window.UnifiedCacheManager.get(CACHE_KEY_LAST_LIST);
        if (lastListId && !isNaN(parseInt(lastListId))) {
          return parseInt(lastListId);
        }
      }
      // Fallback to PageStateManager
      if (window.PageStateManager) {
        const pageState = await window.PageStateManager.loadPageState('watch-lists-page');
        if (pageState && pageState.activeListId) {
          return parseInt(pageState.activeListId);
        }
      }
    } catch (error) {
      window.Logger?.warn?.('Error getting last selected list', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
    return null;
  }

  /**
   * Save selected list ID to cache
   * @param {number} listId
   */
  async function saveSelectedListId(listId) {
    try {
      if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
        await window.UnifiedCacheManager.set(CACHE_KEY_LAST_LIST, listId, { ttl: 7 * 24 * 60 * 60 * 1000 }); // 7 days
      }
    } catch (error) {
      window.Logger?.warn?.('Error saving selected list', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  /**
   * Select list to display (last opened or first)
   * @returns {Promise<number|null>}
   */
  async function selectListToDisplay() {
    if (!state.watchLists || state.watchLists.length === 0) {
      return null;
    }

    // Try to get last selected list
    const lastListId = await getLastSelectedListId();
    if (lastListId) {
      const lastList = state.watchLists.find(list => list.id === lastListId);
      if (lastList) {
        return lastListId;
      }
    }

    // Fallback to first list
    return state.watchLists[0].id;
  }

  /**
   * Create flag button (read-only, display only)
   * @param {Object} item - Watch list item
   * @returns {HTMLElement}
   */
  function createFlagButton(item) {
    const flagBtn = document.createElement('span');
    flagBtn.className = 'watch-lists-widget-flag';
    
    const flagColor = item.flag_color;
    if (flagColor) {
      flagBtn.setAttribute('data-flag-color', flagColor);
      flagBtn.style.setProperty('color', flagColor, 'important');
      flagBtn.style.setProperty('border-color', flagColor, 'important');
      flagBtn.style.setProperty('border-width', '2px', 'important');
      flagBtn.style.setProperty('border-style', 'solid', 'important');
      flagBtn.style.setProperty('background-color', 'transparent', 'important');
      flagBtn.style.setProperty('opacity', '1', 'important');
    } else {
      flagBtn.style.setProperty('border-color', '#6c757d', 'important');
      flagBtn.style.setProperty('border-width', '1px', 'important');
      flagBtn.style.setProperty('border-style', 'solid', 'important');
      flagBtn.style.setProperty('background-color', 'transparent', 'important');
      flagBtn.style.setProperty('color', '#6c757d', 'important');
      flagBtn.style.setProperty('opacity', '0.5', 'important');
    }
    
    const flagIcon = document.createElement('span');
    flagIcon.className = 'icon-placeholder icon';
    flagIcon.setAttribute('data-icon', flagColor ? 'flag-filled' : 'flag');
    flagIcon.setAttribute('data-size', '11');
    flagIcon.setAttribute('data-alt', 'flag');
    flagIcon.setAttribute('aria-label', 'flag');
    
    const iconColor = flagColor || '#6c757d';
    if (flagColor) {
      flagIcon.style.setProperty('color', flagColor, 'important');
      flagIcon.style.setProperty('fill', flagColor, 'important');
      flagIcon.style.setProperty('stroke', flagColor, 'important');
      flagIcon.setAttribute('data-color', flagColor);
    } else {
      flagIcon.style.setProperty('color', '#6c757d', 'important');
      flagIcon.style.setProperty('fill', '#6c757d', 'important');
      flagIcon.style.setProperty('stroke', '#6c757d', 'important');
    }
    flagBtn.appendChild(flagIcon);
    
    // Render icon if IconSystem is available
    if (window.IconSystem && window.IconSystem.initialized && window.IconSystem.renderIcon) {
      const iconName = flagColor ? 'flag-filled' : 'flag';
      window.IconSystem.renderIcon('span', iconName, {
        size: '11',
        alt: 'flag',
        class: 'icon',
        style: `color: ${iconColor} !important; fill: ${iconColor} !important; stroke: ${iconColor} !important;`
      }).then(iconHTML => {
        if (iconHTML && flagIcon.parentNode) {
          const temp = document.createElement('div');
          temp.innerHTML = iconHTML;
          const newIcon = temp.firstElementChild;
          if (newIcon && newIcon.tagName === 'svg') {
            newIcon.setAttribute('fill', 'none');
            newIcon.setAttribute('stroke', 'currentColor');
            newIcon.style.setProperty('color', iconColor, 'important');
            newIcon.style.setProperty('fill', 'none', 'important');
            newIcon.style.setProperty('stroke', iconColor, 'important');
            const paths = newIcon.querySelectorAll('path, circle, rect, line, polyline, polygon');
            paths.forEach(path => {
              path.removeAttribute('fill');
              path.removeAttribute('stroke');
              path.style.setProperty('fill', 'none', 'important');
              path.style.setProperty('stroke', iconColor, 'important');
              path.style.setProperty('color', iconColor, 'important');
            });
            flagIcon.replaceWith(newIcon);
          }
        }
      }).catch(error => {
        window.Logger?.warn?.('Failed to render flag icon', { ...PAGE_LOG_CONTEXT, error: error?.message });
      });
    }
    
    return flagBtn;
  }

  /**
   * Render compact view items (read-only)
   * @param {Array} items - Watch list items
   */
  async function renderCompactView(items) {
    if (!elements.list) {
      return;
    }

    // Clear existing items
    elements.list.innerHTML = '';

    if (!items || items.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'list-group-item text-center text-muted py-4';
      emptyMsg.textContent = 'אין פריטים ברשימה זו.';
      elements.list.appendChild(emptyMsg);
      return;
    }

    // Limit items
    const itemsToRender = items.slice(0, state.config.maxItems);

    // Render each item
    for (const item of itemsToRender) {
      const ticker = item.ticker || {};
      const currencySymbol = ticker.currency_symbol || ticker.currency?.symbol || '$';
      const price = ticker.current_price ?? ticker.price ?? null;
      const changePercent = ticker.change_percent ?? ticker.change_percentage ?? null;
      const dailyChangePercent = ticker.daily_change_percent ?? ticker.daily_change_percentage ?? null;
      const symbol = ticker.symbol || item.external_symbol || `טיקר #${item.id}`;
      
      // Calculate change amount
      let change = ticker.daily_change ?? ticker.change_amount ?? ticker.change_amount_day ?? ticker.change ?? null;
      if ((change === null || change === undefined || isNaN(parseFloat(change))) && 
          price !== null && price !== undefined && !isNaN(parseFloat(price)) &&
          changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent))) {
        change = parseFloat(price) * (parseFloat(changePercent) / 100);
      }
      
      // Position data
      const position = ticker.position || item.position || null;
      const positionQty = position && position.quantity !== undefined && position.quantity !== null ? parseFloat(position.quantity) : null;
      
      // Calculate value change
      let valueChange = null;
      if (positionQty !== null && positionQty !== 0) {
        const qtyAbs = Math.abs(positionQty);
        if (change !== null && change !== undefined && !isNaN(parseFloat(change))) {
          valueChange = parseFloat(change) * qtyAbs;
        } else if (changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent)) && price !== null && price !== undefined && !isNaN(parseFloat(price))) {
          valueChange = parseFloat(price) * qtyAbs * (parseFloat(changePercent) / 100);
        }
      }
      
      // P/L data
      const pl = ticker.profit_loss ?? ticker.pl ?? null;
      const plPercent = ticker.profit_loss_percent ?? ticker.pl_percent ?? null;
      
      // ATR data
      const atr = ticker.atr || null;
      const atrPercent = ticker.atr_percent || (atr !== null && price !== null && price > 0 ? (parseFloat(atr) / parseFloat(price) * 100) : null);

      const listItem = document.createElement('div');
      listItem.className = 'list-group-item watch-lists-widget-item';
      listItem.setAttribute('data-item-id', item.id);
      listItem.setAttribute('data-widget-overlay', 'true');
      listItem.setAttribute('role', 'button');
      listItem.setAttribute('tabindex', '0');

      const itemContent = document.createElement('div');
      itemContent.className = 'd-flex justify-content-between align-items-center';

      const leftContent = document.createElement('div');
      leftContent.className = 'd-flex align-items-center gap-2';

      // Flag button (read-only)
      const flagBtn = createFlagButton(item);
      leftContent.appendChild(flagBtn);

      // Symbol
      const symbolStrong = document.createElement('strong');
      symbolStrong.textContent = symbol;
      if (item.external_symbol) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-secondary ms-2';
        badge.textContent = 'חיצוני';
        symbolStrong.appendChild(badge);
      }
      leftContent.appendChild(symbolStrong);

      // Price
      const priceSpan = document.createElement('span');
      if (price !== null && price !== undefined && !isNaN(parseFloat(price)) && Number.isFinite(parseFloat(price)) && window.FieldRendererService?.renderAmount) {
        priceSpan.innerHTML = window.FieldRendererService.renderAmount(parseFloat(price), currencySymbol, 2, false);
      } else {
        priceSpan.textContent = 'לא זמין';
        priceSpan.className = 'text-muted';
      }
      leftContent.appendChild(priceSpan);

      // Change %
      const changePercentSpan = document.createElement('span');
      if (changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent)) && window.FieldRendererService?.renderNumericValue) {
        changePercentSpan.innerHTML = window.FieldRendererService.renderNumericValue(parseFloat(changePercent), '%', true);
      } else {
        changePercentSpan.textContent = '-';
        changePercentSpan.className = 'text-muted';
      }
      leftContent.appendChild(changePercentSpan);

      itemContent.appendChild(leftContent);
      listItem.appendChild(itemContent);

      // Overlay with additional details (hidden by default, shown on hover)
      const overlayDiv = document.createElement('div');
      overlayDiv.className = 'watch-lists-widget-overlay';
      overlayDiv.setAttribute('data-overlay', 'true');
      overlayDiv.setAttribute('data-role', 'widget-detail');
      overlayDiv.style.display = 'none';
      
      const overlayContent = document.createElement('div');
      overlayContent.className = 'watch-lists-widget-overlay-content';
      
      // Change amount
      if (change !== null && change !== undefined && !isNaN(parseFloat(change)) && Number.isFinite(parseFloat(change))) {
        const row = document.createElement('div');
        row.className = 'watch-lists-widget-overlay-row';
        const label = document.createElement('span');
        label.className = 'watch-lists-widget-overlay-label';
        label.textContent = 'שינוי בערך:';
        const value = document.createElement('span');
        value.className = 'watch-lists-widget-overlay-value';
        if (window.FieldRendererService?.renderAmount) {
          value.innerHTML = window.FieldRendererService.renderAmount(parseFloat(change), currencySymbol, 2, true);
        } else {
          value.textContent = `${currencySymbol}${parseFloat(change).toFixed(2)}`;
        }
        row.appendChild(label);
        row.appendChild(value);
        overlayContent.appendChild(row);
      }
      
      // Daily Change %
      if (dailyChangePercent !== null && dailyChangePercent !== undefined && !isNaN(parseFloat(dailyChangePercent))) {
        const row = document.createElement('div');
        row.className = 'watch-lists-widget-overlay-row';
        const label = document.createElement('span');
        label.className = 'watch-lists-widget-overlay-label';
        label.textContent = 'שינוי היום %:';
        const value = document.createElement('span');
        value.className = 'watch-lists-widget-overlay-value';
        if (window.FieldRendererService?.renderNumericValue) {
          value.innerHTML = window.FieldRendererService.renderNumericValue(parseFloat(dailyChangePercent), '%', true);
        } else {
          value.textContent = `${dailyChangePercent >= 0 ? '+' : ''}${parseFloat(dailyChangePercent).toFixed(2)}%`;
        }
        row.appendChild(label);
        row.appendChild(value);
        overlayContent.appendChild(row);
      }
      
      // ATR
      if (atr !== null && atrPercent !== null) {
        const row = document.createElement('div');
        row.className = 'watch-lists-widget-overlay-row';
        const label = document.createElement('span');
        label.className = 'watch-lists-widget-overlay-label';
        label.textContent = 'ATR:';
        const value = document.createElement('span');
        value.className = 'watch-lists-widget-overlay-value';
        if (window.FieldRendererService?.renderATR) {
          value.textContent = 'טוען...';
          (async () => {
            try {
              const atrHtml = await window.FieldRendererService.renderATR(atr, atrPercent);
              value.innerHTML = atrHtml;
            } catch (e) {
              window.Logger?.warn?.('Error rendering ATR', { ...PAGE_LOG_CONTEXT, error: e });
              value.textContent = atrPercent ? `${atrPercent.toFixed(2)}%` : '-';
            }
          })();
        } else {
          value.textContent = atrPercent ? `${atrPercent.toFixed(2)}%` : '-';
        }
        row.appendChild(label);
        row.appendChild(value);
        overlayContent.appendChild(row);
      }
      
      // Position
      if (position && positionQty !== null && positionQty !== 0) {
        const row = document.createElement('div');
        row.className = 'watch-lists-widget-overlay-row';
        const label = document.createElement('span');
        label.className = 'watch-lists-widget-overlay-label';
        label.textContent = 'פוזיציה:';
        const value = document.createElement('span');
        value.className = 'watch-lists-widget-overlay-value';
        const quantity = parseFloat(positionQty) || 0;
        const side = position.side || (quantity > 0 ? 'long' : quantity < 0 ? 'short' : 'closed');
        const quantityAbs = Math.abs(quantity);
        const sign = quantity > 0 ? '+' : '-';
        if (window.FieldRendererService?.renderSide) {
          value.innerHTML = `${window.FieldRendererService.renderSide(side)} #${sign}${quantityAbs.toLocaleString()}`;
        } else {
          const sideLabel = side === 'long' ? 'לונג' : side === 'short' ? 'שורט' : '';
          value.innerHTML = `<span class="badge badge-${side} me-1">${sideLabel}</span>#${sign}${quantityAbs.toLocaleString()}`;
        }
        row.appendChild(label);
        row.appendChild(value);
        overlayContent.appendChild(row);
      }
      
      // Value Change
      if (valueChange !== null && valueChange !== undefined && !isNaN(valueChange)) {
        const row = document.createElement('div');
        row.className = 'watch-lists-widget-overlay-row';
        const label = document.createElement('span');
        label.className = 'watch-lists-widget-overlay-label';
        label.textContent = 'שינוי בערך פוזיציה:';
        const value = document.createElement('span');
        value.className = 'watch-lists-widget-overlay-value';
        if (window.FieldRendererService?.renderAmount) {
          value.innerHTML = window.FieldRendererService.renderAmount(valueChange, currencySymbol, 2, true);
        } else {
          value.textContent = `${currencySymbol}${valueChange.toFixed(2)}`;
        }
        row.appendChild(label);
        row.appendChild(value);
        overlayContent.appendChild(row);
      }
      
      // P/L
      if (pl !== null && pl !== undefined && !isNaN(parseFloat(pl))) {
        const row = document.createElement('div');
        row.className = 'watch-lists-widget-overlay-row';
        const label = document.createElement('span');
        label.className = 'watch-lists-widget-overlay-label';
        label.textContent = 'P/L:';
        const value = document.createElement('span');
        value.className = 'watch-lists-widget-overlay-value';
        if (window.FieldRendererService?.renderAmount) {
          value.innerHTML = window.FieldRendererService.renderAmount(parseFloat(pl), currencySymbol, 2, true);
        } else {
          value.textContent = `${currencySymbol}${parseFloat(pl).toFixed(2)}`;
        }
        row.appendChild(label);
        row.appendChild(value);
        overlayContent.appendChild(row);
      }
      
      // P/L %
      if (plPercent !== null && plPercent !== undefined && !isNaN(parseFloat(plPercent))) {
        const row = document.createElement('div');
        row.className = 'watch-lists-widget-overlay-row';
        const label = document.createElement('span');
        label.className = 'watch-lists-widget-overlay-label';
        label.textContent = 'P/L %:';
        const value = document.createElement('span');
        value.className = 'watch-lists-widget-overlay-value';
        if (window.FieldRendererService?.renderNumericValue) {
          value.innerHTML = window.FieldRendererService.renderNumericValue(parseFloat(plPercent), '%', true);
        } else {
          value.textContent = `${plPercent >= 0 ? '+' : ''}${parseFloat(plPercent).toFixed(2)}%`;
        }
        row.appendChild(label);
        row.appendChild(value);
        overlayContent.appendChild(row);
      }
      
      overlayDiv.appendChild(overlayContent);
      listItem.appendChild(overlayDiv);
      elements.list.appendChild(listItem);
    }

    // Setup overlay hover
    if (window.WidgetOverlayService && elements.list && !state.overlaySetup) {
      window.WidgetOverlayService.destroy(elements.list);
      window.WidgetOverlayService.setupOverlayHover(
        elements.list,
        '.watch-lists-widget-item',
        '[data-overlay="true"]',
        {
          hoverClass: 'is-hovered',
          gap: 8,
          minWidth: 280,
          maxWidth: 400,
          zIndex: 1050,
          useAnimations: true,
          transitionDuration: 100
        }
      );
      state.overlaySetup = true;
    }

    window.Logger?.debug?.('Compact view rendered', { ...PAGE_LOG_CONTEXT, count: itemsToRender.length });
  }

  /**
   * Load watch lists
   * @returns {Promise<Array>}
   */
  async function loadWatchLists() {
    try {
      if (window.WatchListsDataService?.loadWatchListsData) {
        const lists = await window.WatchListsDataService.loadWatchListsData({ force: false });
        return lists || [];
      } else {
        // Fallback to direct API call
        const response = await fetchWithRetry('/api/watch-lists', { method: 'GET' });
        if (!response.ok) {
          throw new Error(`Failed to load watch lists: ${response.status}`);
        }
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      window.Logger?.error?.('Error loading watch lists', { ...PAGE_LOG_CONTEXT, error: error?.message });
      if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה בטעינת רשימות צפייה', 'system');
      }
      return [];
    }
  }

  /**
   * Load watch list items
   * @param {number} listId - List ID
   * @returns {Promise<Array>}
   */
  async function loadWatchListItems(listId) {
    try {
      if (window.WatchListsDataService?.loadWatchListItemsData) {
        const items = await window.WatchListsDataService.loadWatchListItemsData(listId, { includeExternalData: true });
        return items || [];
      } else {
        // Fallback to direct API call
        const response = await fetchWithRetry(`/api/watch-lists/${listId}/items?includeExternalData=true`, { method: 'GET' });
        if (!response.ok) {
          throw new Error(`Failed to load watch list items: ${response.status}`);
        }
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      window.Logger?.error?.('Error loading watch list items', { ...PAGE_LOG_CONTEXT, error: error?.message, listId });
      return [];
    }
  }

  /**
   * Populate select dropdown with watch lists
   */
  function populateSelect() {
    if (!elements.select) {
      return;
    }

    // Clear existing options
    elements.select.innerHTML = '';

    if (!state.watchLists || state.watchLists.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'אין רשימות';
      elements.select.appendChild(option);
      return;
    }

    // Add options
    state.watchLists.forEach(list => {
      const option = document.createElement('option');
      option.value = list.id;
      const tickerCount = list.item_count || 0;
      option.textContent = `${list.name || `רשימה #${list.id}`} (${tickerCount})`;
      if (list.id === state.activeListId) {
        option.selected = true;
      }
      elements.select.appendChild(option);
    });
  }

  /**
   * Show loading state
   */
  function showLoading() {
    if (elements.loading) elements.loading.classList.remove('d-none');
    if (elements.list) elements.list.classList.add('d-none');
    if (elements.empty) elements.empty.classList.add('d-none');
    if (elements.error) elements.error.classList.add('d-none');
  }

  /**
   * Show empty state
   * @param {string} message - Empty state message
   */
  function showEmpty(message) {
    if (elements.loading) elements.loading.classList.add('d-none');
    if (elements.list) elements.list.classList.add('d-none');
    if (elements.empty) {
      elements.empty.classList.remove('d-none');
      const emptyText = elements.empty.querySelector('.alert-text') || elements.empty;
      if (emptyText.textContent !== undefined) {
        emptyText.textContent = message;
      }
    }
    if (elements.error) elements.error.classList.add('d-none');
  }

  /**
   * Show error state
   * @param {string} message - Error message
   */
  function showError(message) {
    if (elements.loading) elements.loading.classList.add('d-none');
    if (elements.list) elements.list.classList.add('d-none');
    if (elements.empty) elements.empty.classList.add('d-none');
    if (elements.error) {
      elements.error.classList.remove('d-none');
      const errorText = elements.error.querySelector('.alert-text') || elements.error;
      if (errorText.textContent !== undefined) {
        errorText.textContent = message;
      }
    }
  }

  /**
   * Show list content
   */
  function showList() {
    if (elements.loading) elements.loading.classList.add('d-none');
    if (elements.list) elements.list.classList.remove('d-none');
    if (elements.empty) elements.empty.classList.add('d-none');
    if (elements.error) elements.error.classList.add('d-none');
  }

  /**
   * Handle list selection change
   * @param {Event} event
   */
  async function handleListChange(event) {
    const listId = parseInt(event.target.value);
    if (!listId || isNaN(listId)) {
      return;
    }

    state.activeListId = listId;
    await saveSelectedListId(listId);
    await loadAndRenderItems();
  }

  /**
   * Load and render items for current list
   */
  async function loadAndRenderItems() {
    if (!state.activeListId) {
      showEmpty('אין רשימה נבחרת');
      return;
    }

    showLoading();
    
    try {
      const items = await loadWatchListItems(state.activeListId);
      state.activeListItems = items || [];
      
      if (state.activeListItems.length === 0) {
        showEmpty('אין פריטים ברשימה זו.');
      } else {
        showList();
        await renderCompactView(state.activeListItems);
      }
    } catch (error) {
      window.Logger?.error?.('Error loading items', { ...PAGE_LOG_CONTEXT, error: error?.message });
      showError('שגיאה בטעינת פריטי הרשימה');
    }
  }

  // ===== Public API =====

  const WatchListsWidget = {
    /**
     * Initialize widget
     * @param {string} containerId - Container ID (optional, defaults to CONTAINER_ID)
     * @param {Object} config - Configuration object
     * @returns {Promise<boolean>}
     */
    async init(containerId, config) {
      if (state.initialized) {
        window.Logger?.warn?.('Widget already initialized', PAGE_LOG_CONTEXT);
        return true;
      }

      // Merge config
      if (config) {
        state.config = { ...DEFAULT_CONFIG, ...config };
      }

      // Cache elements
      if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
          elements.container = container;
        }
      }

      if (!cacheElements()) {
        window.Logger?.warn?.('Container not found', { ...PAGE_LOG_CONTEXT, containerId: containerId || CONTAINER_ID });
        return false;
      }

      // Wait for required systems
      if (!window.WatchListsDataService) {
        window.Logger?.warn?.('WatchListsDataService not available, waiting...', PAGE_LOG_CONTEXT);
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (window.WatchListsDataService) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 5000);
        });
      }

      // Load watch lists
      showLoading();
      state.watchLists = await loadWatchLists();

      if (state.watchLists.length === 0) {
        showEmpty('אין רשימות צפייה. צור רשימה חדשה בעמוד רשימות צפייה.');
        populateSelect();
        state.initialized = true;
        return true;
      }

      // Select list to display
      state.activeListId = await selectListToDisplay();
      if (!state.activeListId) {
        showEmpty('אין רשימה זמינה');
        populateSelect();
        state.initialized = true;
        return true;
      }

      // Populate select
      populateSelect();

      // Bind select change event
      if (elements.select) {
        elements.select.addEventListener('change', handleListChange);
      }

      // Load and render items
      await loadAndRenderItems();

      state.initialized = true;
      window.Logger?.info?.('Watch Lists Widget initialized', { ...PAGE_LOG_CONTEXT, listId: state.activeListId });
      return true;
    },

    /**
     * Render widget (refresh display)
     */
    async render() {
      if (!state.initialized) {
        window.Logger?.warn?.('Widget not initialized', PAGE_LOG_CONTEXT);
        return;
      }

      await loadAndRenderItems();
    },

    /**
     * Refresh data and re-render
     */
    async refresh() {
      if (!state.initialized) {
        window.Logger?.warn?.('Widget not initialized', PAGE_LOG_CONTEXT);
        return;
      }

      // Reload watch lists
      state.watchLists = await loadWatchLists();
      populateSelect();

      // Reload items
      await loadAndRenderItems();
    },

    /**
     * Destroy widget and cleanup
     */
    destroy() {
      if (elements.select) {
        elements.select.removeEventListener('change', handleListChange);
      }

      if (elements.list && window.WidgetOverlayService) {
        window.WidgetOverlayService.destroy(elements.list);
      }

      state.initialized = false;
      state.watchLists = [];
      state.activeListId = null;
      state.activeListItems = [];
      state.overlaySetup = false;

      // Clear elements cache
      Object.keys(elements).forEach(key => {
        elements[key] = null;
      });
    },

    version: '1.0.0'
  };

  // Export to global scope
  window.WatchListsWidget = WatchListsWidget;

  // Log that widget is loaded (always log, even if Logger not available)
  console.log('✅ Watch Lists Widget loaded', PAGE_LOG_CONTEXT);
  if (window.Logger) {
    window.Logger.info?.('Watch Lists Widget loaded', PAGE_LOG_CONTEXT);
  }
})();

