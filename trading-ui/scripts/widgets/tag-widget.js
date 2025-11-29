/**
 * Tag Widget - Unified Tag Cloud and Quick Search
 * ================================================
 * 
 * Unified widget for tag cloud and quick search functionality with Bootstrap Tabs.
 * 
 * This widget relies on general systems:
 * - TagService for tag data
 * - ModalManagerV2 for search results drawer
 * - ButtonSystem for button processing
 * - FieldRendererService for tag rendering
 * 
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/TAG_WIDGET_DEVELOPER_GUIDE.md
 */

;(function () {
  'use strict';

  const DEFAULT_LIMIT = 25;
  const LIMIT_STEP = 25;
  const CONTAINER_ID = 'tagWidgetContainer';
  
  // Default configuration
  const DEFAULT_CONFIG = {
    minRows: 1, // Minimum number of rows to display
    maxRows: 3, // Maximum number of rows to display
    rowHeight: 20 // Height per row in pixels (tag height + margin)
  };

  // State
  const state = {
    initialized: false,
    activeTab: 'cloud', // 'cloud' or 'search'
    tagCloudLoading: false,
    searchLoading: false,
    lastQuery: '',
    lastEntityFilter: '',
    lastResults: [],
    lastResultCount: 0,
    currentLimit: DEFAULT_LIMIT,
    metadataCache: new Map(),
    config: { ...DEFAULT_CONFIG } // Store widget configuration
  };

  // DOM Elements cache
  const elements = {
    container: null,
    cloudTab: null,
    searchTab: null,
    cloudPane: null,
    searchPane: null,
    cloudLoading: null,
    cloudError: null,
    cloudEmpty: null,
    cloudContainer: null,
    searchForm: null,
    searchInput: null,
    searchFilter: null,
    searchStatus: null,
    drawer: null,
    drawerLoading: null,
    drawerError: null,
    drawerEmpty: null,
    drawerBody: null,
    drawerCount: null,
    drawerResultsBody: null,
    drawerLoadMoreBtn: null,
    drawerTitle: null,
    drawerSubtitle: null
  };

  // Entity page mapping
  const entityPageMap = {
    trade: 'trades',
    trade_plan: 'trade_plans',
    execution: 'executions',
    trading_account: 'trading_accounts',
    account: 'trading_accounts',
    ticker: 'tickers',
    alert: 'alerts',
    cash_flow: 'cash_flows',
    note: 'notes'
  };

  /**
   * Apply height configuration to widget container
   * Sets CSS variables for min and max height based on row configuration
   */
  function applyHeightConfiguration() {
    if (!elements.container) {
      return;
    }
    
    const { minRows, maxRows, rowHeight } = state.config;
    
    // Calculate heights in pixels
    const minHeight = minRows * rowHeight;
    const maxHeight = maxRows * rowHeight;
    
    // Set CSS variables on the container
    elements.container.style.setProperty('--tag-widget-min-rows', minRows);
    elements.container.style.setProperty('--tag-widget-max-rows', maxRows);
    elements.container.style.setProperty('--tag-widget-row-height', `${rowHeight}px`);
    elements.container.style.setProperty('--tag-widget-min-height', `${minHeight}px`);
    elements.container.style.setProperty('--tag-widget-max-height', `${maxHeight}px`);
    
    window.Logger?.debug?.('TagWidget: Height configuration applied', {
      minRows,
      maxRows,
      rowHeight,
      minHeight,
      maxHeight,
      page: 'tag-widget'
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
    elements.cloudTab = elements.container.querySelector('#tagWidgetCloudTab');
    elements.searchTab = elements.container.querySelector('#tagWidgetSearchTab');

    // Tab panes
    elements.cloudPane = elements.container.querySelector('#tagWidgetCloudPane');
    elements.searchPane = elements.container.querySelector('#tagWidgetSearchPane');

    // Cloud elements
    elements.cloudLoading = elements.container.querySelector('#tagWidgetCloudLoading');
    elements.cloudError = elements.container.querySelector('#tagWidgetCloudError');
    elements.cloudEmpty = elements.container.querySelector('#tagWidgetCloudEmpty');
    elements.cloudContainer = elements.container.querySelector('#tagWidgetCloudContainer');

    // Search elements
    elements.searchForm = elements.container.querySelector('#tagWidgetSearchForm');
    elements.searchInput = elements.container.querySelector('#tagWidgetSearchInput');
    elements.searchFilter = elements.container.querySelector('#tagWidgetSearchEntityFilter');
    elements.searchStatus = elements.container.querySelector('#tagWidgetSearchStatus');

    return true;
  }

  /**
   * Bind events
   */
  function bindEvents() {
    // Tab switching (Bootstrap tabs)
    if (elements.cloudTab) {
      elements.cloudTab.addEventListener('shown.bs.tab', () => {
        state.activeTab = 'cloud';
      });
    }
    if (elements.searchTab) {
      elements.searchTab.addEventListener('shown.bs.tab', () => {
        state.activeTab = 'search';
      });
    }

    // Search form submit
    if (elements.searchForm) {
      elements.searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleQuickSearchSubmit();
      });
    }
  }

  /**
   * Initialize drawer chrome elements
   */
  function ensureDrawerChrome() {
    elements.drawer = document.getElementById('tagSearchDrawer');
    if (!elements.drawer) {
      return;
    }
    elements.drawerLoading = elements.drawer.querySelector('#tagSearchModalLoading');
    elements.drawerError = elements.drawer.querySelector('#tagSearchModalError');
    elements.drawerEmpty = elements.drawer.querySelector('#tagSearchModalEmpty');
    elements.drawerBody = elements.drawer.querySelector('#tagSearchModalBody');
    elements.drawerCount = elements.drawer.querySelector('#tagSearchModalCount');
    elements.drawerResultsBody = elements.drawer.querySelector('#tagSearchResultsBody');
    elements.drawerLoadMoreBtn = elements.drawer.querySelector('#tagSearchLoadMoreBtn');
    elements.drawerTitle = elements.drawer.querySelector('#tagSearchModalTitle');
    elements.drawerSubtitle = elements.drawer.querySelector('#tagSearchModalSubtitle');

    const footer = elements.drawer.querySelector('.modal-footer');
    if (footer) {
      footer.classList.add('d-none');
    }
    if (elements.drawerLoadMoreBtn) {
      elements.drawerLoadMoreBtn.addEventListener('click', (event) => {
        event.preventDefault();
        loadMoreResults();
      });
    }
  }

  /**
   * Refresh tag cloud
   */
  async function refreshTagCloud({ force = false } = {}) {
    if (!elements.cloudContainer || state.tagCloudLoading) {
      window.Logger?.warn?.('TagWidget: Cannot refresh - container not found or already loading', {
        hasContainer: !!elements.cloudContainer,
        isLoading: state.tagCloudLoading
      });
      return;
    }
    
    if (!window.TagService) {
      window.Logger?.error?.('TagWidget: TagService not available', { page: 'tag-widget' });
      showTagCloudError(new Error('TagService לא זמין'));
      return;
    }
    
    state.tagCloudLoading = true;
    toggleTagCloudState({ loading: true });
    try {
      window.Logger?.info?.('TagWidget: Fetching tag cloud data...', { page: 'tag-widget', force });
      const data = await window.TagService.getTagCloudData({ force });
      window.Logger?.info?.('TagWidget: Tag cloud data received', { 
        page: 'tag-widget', 
        count: Array.isArray(data) ? data.length : 0 
      });
      renderTagCloud(Array.isArray(data) ? data : []);
    } catch (error) {
      window.Logger?.error?.('TagWidget: Failed to fetch tag cloud data', { error, page: 'tag-widget' });
      showTagCloudError(error);
    } finally {
      state.tagCloudLoading = false;
      toggleTagCloudState({ loading: false });
    }
  }

  /**
   * Toggle tag cloud loading state
   */
  function toggleTagCloudState({ loading = false } = {}) {
    if (elements.cloudLoading) {
      elements.cloudLoading.classList.toggle('d-none', !loading);
    }
    if (elements.cloudContainer) {
      elements.cloudContainer.classList.toggle('d-none', loading);
    }
    if (elements.cloudError) {
      elements.cloudError.classList.add('d-none');
    }
  }

  /**
   * Show tag cloud error
   */
  function showTagCloudError(error) {
    const message = error?.message || 'נכשלה טעינת נתוני הענן';
    if (elements.cloudError) {
      elements.cloudError.textContent = message;
      elements.cloudError.classList.remove('d-none');
    }
  }

  /**
   * Render tag cloud
   */
  function renderTagCloud(tags) {
    if (!elements.cloudContainer) {
      return;
    }
    elements.cloudContainer.innerHTML = '';
    if (!Array.isArray(tags) || tags.length === 0) {
      if (elements.cloudEmpty) {
        elements.cloudEmpty.classList.remove('d-none');
      }
      return;
    }
    if (elements.cloudEmpty) {
      elements.cloudEmpty.classList.add('d-none');
    }

    const usageValues = tags.map((tag) => tag.usage_count || 0);
    const maxUsage = Math.max(...usageValues, 1);

    // Store tag tier info for restoration after button processing
    const tagTierMap = new Map();
    
    tags.forEach((tag) => {
      const button = document.createElement('button');
      const usageRatio = (tag.usage_count || 0) / maxUsage;
      const tier = getTierNumber(usageRatio);
      
      // Store tag info with tier
      tagTierMap.set(tag.tag_id, {
        tier: tier,
        name: tag.name,
        usageCount: tag.usage_count || 0
      });
      
      button.type = 'button';
      button.dataset.buttonType = 'FILTER';
      button.dataset.variant = 'full';
      button.dataset.icon = '🏷️';
      button.dataset.text = tag.name;
      button.dataset.classes = `${getTierClass(usageRatio)} me-2 mb-2`;
      button.dataset.tier = tier;
      button.dataset.tooltip = `${tag.name} • ${(tag.usage_count || 0).toLocaleString('he-IL')} שיוכים`;
      button.dataset.tooltipPlacement = 'top';
      button.dataset.tooltipTrigger = 'hover';
      button.dataset.tagId = tag.tag_id;
      button.addEventListener('click', () => applyTagFromCloud(tag));
      elements.cloudContainer.appendChild(button);
    });

    processButtons(elements.cloudContainer, tagTierMap);
  }

  /**
   * Get tier class based on usage ratio
   */
  function getTierClass(ratio) {
    if (ratio >= 0.75) {
      return 'fs-2';
    }
    if (ratio >= 0.5) {
      return 'fs-3';
    }
    if (ratio >= 0.3) {
      return 'fs-4';
    }
    return 'fs-5';
  }

  /**
   * Get tier number (1-4) based on usage ratio
   */
  function getTierNumber(ratio) {
    if (ratio >= 0.75) {
      return '1';
    }
    if (ratio >= 0.5) {
      return '2';
    }
    if (ratio >= 0.3) {
      return '3';
    }
    return '4';
  }

  /**
   * Apply tag from cloud to search
   */
  function applyTagFromCloud(tag) {
    if (elements.searchInput) {
      // Use DataCollectionService to set value if available
      if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        window.DataCollectionService.setValue(elements.searchInput.id, tag.name || '', 'text');
      } else {
        elements.searchInput.value = tag.name || '';
      }
      elements.searchInput.focus();
      
      // Switch to search tab
      if (elements.searchTab && window.bootstrap?.Tab) {
        const searchTabInstance = new window.bootstrap.Tab(elements.searchTab);
        searchTabInstance.show();
      }
    }
    performSearch({
      query: tag.name || '',
      entityType: elements.searchFilter?.value || '',
      limit: DEFAULT_LIMIT,
      origin: 'cloud'
    }).catch(() => {});
  }

  /**
   * Handle quick search form submit
   */
  function handleQuickSearchSubmit() {
    const query = (elements.searchInput?.value || '').trim();
    if (query.length < 2) {
      updateStatus('יש להזין לפחות שני תווים לחיפוש', 'warning');
      return;
    }
    const entityType = elements.searchFilter?.value || '';
    performSearch({
      query,
      entityType,
      limit: DEFAULT_LIMIT,
      origin: 'form'
    }).catch(() => {});
  }

  /**
   * Perform tag search
   */
  async function performSearch({ query, entityType = '', limit = DEFAULT_LIMIT, origin = 'form', force = false }) {
    if (!window.TagService || state.searchLoading) {
      return;
    }
    state.searchLoading = true;
    state.lastQuery = query;
    state.lastEntityFilter = entityType;
    state.currentLimit = limit;

    if (origin === 'form' && elements.searchStatus) {
      updateStatus('מבצע חיפוש...', 'info');
    }

    try {
      const payload = await window.TagService.searchTags({
        query,
        entityType: entityType || null,
        limit,
        includeInactive: false,
        force
      });
      state.lastResults = Array.isArray(payload) ? payload : [];
      state.lastResultCount = countAssignments(state.lastResults);
      await openDrawer({
        query,
        entityType,
        results: state.lastResults,
        total: state.lastResultCount
      });

      if (elements.searchStatus) {
        const LinkedItemsService = window.LinkedItemsService;
        const label = entityType ? ` (${LinkedItemsService?.getEntityLabel?.(entityType) || entityType})` : '';
        updateStatus(`נמצאו ${state.lastResultCount} רשומות${label}`, 'success');
      }
    } catch (error) {
      const message = error?.message || 'החיפוש נכשל';
      updateStatus(message, 'error');
      showDrawerError(message);
      window.Logger?.error?.('❌ Tag search failed', { error, page: 'index' });
      window.NotificationSystem?.showError?.(message);
    } finally {
      state.searchLoading = false;
    }
  }

  /**
   * Count total assignments in results
   */
  function countAssignments(results) {
    if (!Array.isArray(results)) {
      return 0;
    }
    return results.reduce((sum, entry) => {
      const assignments = Array.isArray(entry.assignments) ? entry.assignments.length : 0;
      return sum + assignments;
    }, 0);
  }

  /**
   * Update search status message
   */
  function updateStatus(message, variant = 'info') {
    if (!elements.searchStatus) {
      return;
    }
    const classes = {
      info: 'text-muted',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-danger'
    };
    elements.searchStatus.className = `small ${classes[variant] || 'text-muted'}`;
    elements.searchStatus.textContent = message;
  }

  /**
   * Open search results drawer
   */
  async function openDrawer({ query, entityType, results, total }) {
    if (!window.ModalManagerV2) {
      window.Logger?.warn?.('ModalManagerV2 missing, cannot open tag search drawer', { page: 'index' });
      return;
    }
    await window.ModalManagerV2.showModal('tagSearchDrawer', 'view');
    // Re-cache drawer elements in case DOM was recreated
    ensureDrawerChrome();
    hydrateDrawer({ query, entityType, results, total });
  }

  /**
   * Hydrate drawer with search results
   */
  function hydrateDrawer({ query, entityType, results, total }) {
    if (!elements.drawer) {
      return;
    }

    const LinkedItemsService = window.LinkedItemsService;

    if (elements.drawerTitle) {
      elements.drawerTitle.textContent = `חיפוש: ${query}`;
    }
    if (elements.drawerSubtitle) {
      elements.drawerSubtitle.textContent = entityType
        ? `סינון לפי ${LinkedItemsService?.getEntityLabel?.(entityType) || entityType}`
        : 'כל היישויות';
    }
    if (elements.drawerCount) {
      elements.drawerCount.textContent = `${total.toLocaleString('he-IL')} רשומות`;
    }
    hideDrawerMessages();
    renderDrawerRows(results);
    if (elements.drawerLoadMoreBtn) {
      elements.drawerLoadMoreBtn.classList.toggle('d-none', total < state.currentLimit);
    }
  }

  /**
   * Hide drawer messages
   */
  function hideDrawerMessages() {
    [elements.drawerLoading, elements.drawerError, elements.drawerEmpty].forEach((el) => {
      if (el) {
        el.classList.add('d-none');
      }
    });
  }

  /**
   * Show drawer error
   */
  function showDrawerError(message) {
    if (elements.drawerError) {
      elements.drawerError.textContent = message;
      elements.drawerError.classList.remove('d-none');
    }
  }

  /**
   * Render drawer rows
   */
  function renderDrawerRows(results) {
    if (!elements.drawerResultsBody) {
      return;
    }
    elements.drawerResultsBody.innerHTML = '';
    if (!Array.isArray(results) || results.length === 0) {
      if (elements.drawerEmpty) {
        elements.drawerEmpty.classList.remove('d-none');
      }
      return;
    }

    const flattened = [];
    results.forEach((entry) => {
      const tag = entry.tag;
      (entry.assignments || []).forEach((assignment) => {
        flattened.push({
          entity_type: assignment.entity_type,
          entity_id: assignment.entity_id,
          linked_at: assignment.linked_at,
          tag
        });
      });
    });

    if (flattened.length === 0 && elements.drawerEmpty) {
      elements.drawerEmpty.classList.remove('d-none');
      return;
    }

    flattened.forEach((item) => {
      const row = buildDrawerRow(item);
      elements.drawerResultsBody.appendChild(row);
      hydrateRowMetadata(row, item);
    });
  }

  /**
   * Build drawer row
   */
  function buildDrawerRow({ entity_type, entity_id, linked_at, tag }) {
    const row = document.createElement('tr');
    const LinkedItemsService = window.LinkedItemsService;
    const entityLabel = LinkedItemsService?.getEntityLabel?.(entity_type) || entity_type;

    const typeCell = document.createElement('td');
    typeCell.textContent = entityLabel;
    row.appendChild(typeCell);

    const nameCell = document.createElement('td');
    const namePrimary = document.createElement('div');
    namePrimary.className = 'fw-semibold';
    namePrimary.textContent = `#${entity_id}`;
    namePrimary.dataset.entityNameTarget = `${entity_type}:${entity_id}`;
    const nameSecondary = document.createElement('div');
    nameSecondary.className = 'text-muted small';
    nameSecondary.textContent = 'טוען פרטים...';
    nameSecondary.dataset.entityMetaTarget = `${entity_type}:${entity_id}`;
    nameCell.appendChild(namePrimary);
    nameCell.appendChild(nameSecondary);
    row.appendChild(nameCell);

    const tagCell = document.createElement('td');
    if (window.FieldRendererService?.renderTagBadges) {
      tagCell.innerHTML = window.FieldRendererService.renderTagBadges([tag], {
        showTitle: false,
        includeCategory: false
      });
    } else {
      tagCell.textContent = tag?.name || '-';
    }
    row.appendChild(tagCell);

    const dateCell = document.createElement('td');
    dateCell.innerHTML = formatDate(linked_at);
    row.appendChild(dateCell);

    const actionsCell = document.createElement('td');
    actionsCell.className = 'text-end';
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'd-inline-flex gap-2';
    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.dataset.buttonType = 'VIEW';
    openBtn.dataset.variant = 'small';
    openBtn.dataset.icon = '🔗';
    openBtn.dataset.text = 'פתח';
    openBtn.addEventListener('click', () => navigateToEntity(entity_type, entity_id));
    actionsWrapper.appendChild(openBtn);
    const modalBtn = document.createElement('button');
    modalBtn.type = 'button';
    modalBtn.dataset.buttonType = 'LINKED';
    modalBtn.dataset.variant = 'small';
    modalBtn.dataset.icon = '👁️';
    modalBtn.dataset.text = 'פרטים';
    modalBtn.addEventListener('click', () => openEntityDetails(entity_type, entity_id));
    actionsWrapper.appendChild(modalBtn);
    actionsCell.appendChild(actionsWrapper);
    row.appendChild(actionsCell);

    processButtons(actionsWrapper);

    return row;
  }

  /**
   * Format date
   */
  function formatDate(value) {
    if (window.FieldRendererService?.renderDateTime) {
      try {
        return window.FieldRendererService.renderDateTime(value) || '-';
      } catch (error) {
        window.Logger?.warn?.('renderDateTime failed', { error, page: 'index' });
      }
    }
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString('he-IL');
  }

  /**
   * Hydrate row metadata
   */
  function hydrateRowMetadata(row, { entity_type, entity_id }) {
    const cacheKey = `${entity_type}:${entity_id}`;
    const nameTarget = row.querySelector(`[data-entity-name-target="${cacheKey}"]`);
    const metaTarget = row.querySelector(`[data-entity-meta-target="${cacheKey}"]`);

    resolveEntityMetadata(entity_type, entity_id)
      .then((details) => {
        if (!details) {
          return;
        }
        if (nameTarget) {
          nameTarget.textContent = details.symbol || details.name || details.title || `#${entity_id}`;
        }
        if (metaTarget) {
          metaTarget.textContent = buildEntitySubtitle(details, entity_type);
        }
      })
      .catch((error) => {
        window.Logger?.warn?.('Entity metadata fetch failed', { error, entity_type, entity_id });
        if (metaTarget) {
          metaTarget.textContent = 'לא ניתן לטעון נתונים';
        }
      });
  }

  /**
   * Build entity subtitle
   */
  function buildEntitySubtitle(details, entityType) {
    if (!details) {
      return '';
    }
    const parts = [];
    if (entityType === 'trade' || entityType === 'trade_plan' || entityType === 'execution') {
      if (details.ticker_symbol || details.symbol) {
        parts.push(details.ticker_symbol || details.symbol);
      }
      if (details.side) {
        parts.push(details.side);
      }
    } else if (entityType === 'trading_account') {
      if (details.currency_symbol) {
        parts.push(details.currency_symbol);
      }
    } else if (entityType === 'ticker') {
      if (details.type) {
        parts.push(details.type);
      }
    } else if (entityType === 'alert' && details.status) {
      parts.push(details.status);
    }
    if (details.status && !parts.includes(details.status)) {
      parts.push(details.status);
    }
    return parts.filter(Boolean).join(' • ') || '';
  }

  /**
   * Resolve entity metadata
   */
  async function resolveEntityMetadata(entityType, entityId) {
    const cacheKey = `${entityType}:${entityId}`;
    if (state.metadataCache.has(cacheKey)) {
      return state.metadataCache.get(cacheKey);
    }
    if (!window.entityDetailsAPI?.getEntityDetails) {
      return null;
    }
    try {
      const data = await window.entityDetailsAPI.getEntityDetails(entityType, entityId, {
        includeLinkedItems: false
      });
      state.metadataCache.set(cacheKey, data);
      return data;
    } catch (error) {
      window.Logger?.warn?.('entityDetailsAPI failed', { error, entityType, entityId });
      return null;
    }
  }

  /**
   * Navigate to entity page
   */
  function navigateToEntity(entityType, entityId) {
    const targetPage = entityPageMap[entityType];
    if (targetPage && typeof window.navigateToPage === 'function') {
      window.navigateToPage(targetPage, { entityId, preserveState: true });
    } else {
      window.location.href = `${targetPage || entityType}.html#${entityId}`;
    }
  }

  /**
   * Open entity details modal
   */
  function openEntityDetails(entityType, entityId) {
    if (typeof window.showLinkedItemsModal === 'function') {
      window.showLinkedItemsModal(entityId, entityType);
      return;
    }
    navigateToEntity(entityType, entityId);
  }

  /**
   * Load more search results
   */
  function loadMoreResults() {
    const nextLimit = state.currentLimit + LIMIT_STEP;
    performSearch({
      query: state.lastQuery,
      entityType: state.lastEntityFilter,
      limit: nextLimit,
      origin: 'drawer',
      force: true
    }).catch(() => {});
  }

  /**
   * Process buttons with ButtonSystem
   */
  function processButtons(container, tagTierMap = null) {
    if (!container) {
      return;
    }
    
    if (window.ButtonSystem?.processButtons) {
      window.ButtonSystem.processButtons(container);
    } else if (window.ButtonSystem?.hydrateButtons) {
      window.ButtonSystem.hydrateButtons(container);
    }
    
    // Restore data-tier after processing by tagId
    if (tagTierMap && tagTierMap.size > 0) {
      setTimeout(() => {
        const processedButtons = container.querySelectorAll('button[data-button-type="FILTER"]');
        processedButtons.forEach(button => {
          const tagId = button.getAttribute('data-tag-id') || 
                       button.getAttribute('data-tagId') || 
                       button.getAttribute('data-tag_id') ||
                       button.dataset.tagId;
          if (tagId) {
            const tagIdNum = parseInt(tagId);
            if (!isNaN(tagIdNum) && tagTierMap.has(tagIdNum)) {
              const tagInfo = tagTierMap.get(tagIdNum);
              button.setAttribute('data-tier', tagInfo.tier);
            }
          } else {
            // Fallback: try by button text
            const buttonText = button.textContent?.trim();
            if (buttonText) {
              for (const [id, tagInfo] of tagTierMap.entries()) {
                if (buttonText.includes(tagInfo.name)) {
                  button.setAttribute('data-tier', tagInfo.tier);
                  button.setAttribute('data-tag-id', id.toString());
                  break;
                }
              }
            }
          }
        });
      }, 100);
    }
  }

  // Public API
  const TagWidget = {
    /**
     * Initialize widget
     * @param {string} containerId - Container ID (optional, defaults to CONTAINER_ID)
     * @param {object} config - Configuration object (optional)
     */
    init(containerId = CONTAINER_ID, config = {}) {
      if (state.initialized) {
        window.Logger?.info?.('TagWidget: Already initialized', { page: 'tag-widget' });
        return;
      }

      // Merge configuration with defaults
      state.config = {
        ...DEFAULT_CONFIG,
        ...config
      };

      window.Logger?.info?.('TagWidget: Initializing...', { 
        containerId, 
        config: state.config,
        page: 'tag-widget' 
      });

      if (!cacheElements()) {
        window.Logger?.warn?.('TagWidget: Container not found, will retry...', { 
          containerId, 
          page: 'tag-widget',
          containerExists: !!document.getElementById(containerId)
        });
        // Retry after a short delay if DOM might not be ready
        setTimeout(() => {
          if (!state.initialized && cacheElements()) {
            window.Logger?.info?.('TagWidget: Container found on retry, initializing...', { page: 'tag-widget' });
            applyHeightConfiguration();
            bindEvents();
            ensureDrawerChrome();
            refreshTagCloud().catch((error) => {
              window.Logger?.error?.('TagWidget: Error during initial refresh (retry)', { error, page: 'tag-widget' });
            });
            state.initialized = true;
          }
        }, 500);
        return;
      }

      window.Logger?.info?.('TagWidget: Container found, binding events...', { page: 'tag-widget' });
      
      // Apply height configuration before binding events
      applyHeightConfiguration();
      
      bindEvents();
      ensureDrawerChrome();
      
      // Set active tab from config
      if (config.defaultTab === 'search' && elements.searchTab && window.bootstrap?.Tab) {
        const searchTabInstance = new window.bootstrap.Tab(elements.searchTab);
        searchTabInstance.show();
        state.activeTab = 'search';
      }

      window.Logger?.info?.('TagWidget: Starting tag cloud refresh...', { page: 'tag-widget' });
      refreshTagCloud().catch((error) => {
        window.Logger?.error?.('TagWidget: Error during initial refresh', { error, page: 'tag-widget' });
      });
      
      state.initialized = true;
      window.Logger?.info?.('TagWidget: Initialization complete', { page: 'tag-widget' });
    },

    /**
     * Render/update widget data
     * @param {object} data - Data object (optional)
     */
    render(data = {}) {
      if (data.tags) {
        renderTagCloud(data.tags);
      }
    },

    /**
     * Destroy widget and cleanup
     */
    destroy() {
      state.initialized = false;
      state.metadataCache.clear();
      // Clear event listeners if needed
    },

    /**
     * Refresh tag cloud
     * @param {object} options - Options (force, etc.)
     */
    refreshTagCloud(options = {}) {
      return refreshTagCloud(options);
    },

    version: '1.0.0'
  };

  // Export to global scope
  window.TagWidget = TagWidget;
  
  // Log successful load
  if (window.Logger) {
    window.Logger.info('✅ Tag Widget loaded successfully', { page: 'tag-widget', version: '1.0.0' });
  }
})();

