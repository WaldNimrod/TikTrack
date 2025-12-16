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


// ===== FUNCTION INDEX =====
// === Object Methods ===
// - firstButton.onclick() - Onclick
// - lastButton.onclick() - Onclick
// - nextButton.onclick() - Onclick
// - pageButton.onclick() - Onclick
// - prevButton.onclick() - Onclick

// === Initialization ===
// - initAutocomplete() - Initautocomplete
// - buildDrawerRow() - Builddrawerrow
// - buildEntitySubtitle() - Buildentitysubtitle

// === Event Handlers ===
// - applyHeightConfiguration() - Applyheightconfiguration
// - bindEvents() - Bindevents
// - handleQuickSearchSubmit() - Handlequicksearchsubmit
// - addPaginationControls() - Addpaginationcontrols
// - processButtons() - Processbuttons
// - handleApproveAction() - Handleapproveaction
// - handleRejectAction() - Handlerejectaction

// === UI Functions ===
// - refreshTagCloud() - Refreshtagcloud
// - showTagCloudError() - Showtagclouderror
// - renderTagCloud() - Rendertagcloud
// - updateStatus() - Updatestatus
// - hideDrawerMessages() - Hidedrawermessages
// - showDrawerError() - Showdrawererror
// - renderDrawerRows() - Renderdrawerrows

// === Data Functions ===
// - getTierClass() - Gettierclass
// - getTierNumber() - Gettiernumber
// - hydrateRowMetadata() - Hydraterowmetadata
// - resolveEntityMetadata() - Resolveentitymetadata
// - loadMoreResults() - Loadmoreresults

// === Utility Functions ===
// - formatDate() - Formatdate
// - check() - Check

// === Other ===
// - cacheElements() - Cacheelements
// - ensureDrawerChrome() - Ensuredrawerchrome
// - toggleTagCloudState() - Toggletagcloudstate
// - applyTagFromCloud() - Applytagfromcloud
// - performSearch() - Performsearch
// - countAssignments() - Countassignments
// - waitForRequired() - Waitforrequired
// - openDrawer() - Opendrawer
// - hydrateDrawer() - Hydratedrawer
// - goToPage() - Gotopage
// - navigateToEntity() - Navigatetoentity
// - openEntityDetails() - Openentitydetails
// - escapeHtml() - Escapehtml

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
    config: { ...DEFAULT_CONFIG }, // Store widget configuration
    currentPage: 1, // Current page for pagination
    lastLinkedItems: [] // Store full linked items for pagination
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
    
    // Height configuration applied
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
    // Tabs removed - search is now in header
    // elements.cloudTab = elements.container.querySelector('#tagWidgetCloudTab');
    // elements.searchTab = elements.container.querySelector('#tagWidgetSearchTab');
    // elements.cloudPane = elements.container.querySelector('#tagWidgetCloudPane');
    // elements.searchPane = elements.container.querySelector('#tagWidgetSearchPane');

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
   * Initialize autocomplete for search input
   */
  function initAutocomplete() {
    if (!elements.searchInput) {
      window.Logger?.warn?.('TagWidget: Search input not found', { page: 'tag-widget' });
      return;
    }
    if (!window.AutocompleteService) {
      // AutocompleteService is optional - widget can work without it
      // AutocompleteService not available (optional feature)
      return;
    }

    window.Logger?.info?.('TagWidget: Initializing autocomplete...', { page: 'tag-widget' });

    // Configure autocomplete
    const autocompleteConfig = {
      fetchFunction: async (query) => {
        const entityType = elements.searchFilter?.value || null;
        
        try {
          const result = await window.TagService.getSuggestions({ 
            entityType, 
            limit: 10,
            force: false 
          });
          
          // requestJSON already extracts data, but handle both formats
          const suggestions = Array.isArray(result) ? result : (result?.data || []);
          return suggestions;
        } catch (error) {
          window.Logger?.error?.('TagWidget: Error fetching suggestions for autocomplete', { error, page: 'tag-widget' });
          return [];
        }
      },
      minChars: 0, // Show suggestions even when input is empty
      maxSuggestions: 10,
      itemRenderer: (tag) => {
        // Render with name + usage_count + category
        // Escape HTML to prevent XSS
        const escapeHtml = (text) => {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        };
        
        const name = escapeHtml(tag.name || '');
        const usageText = tag.usage_count ? ` • ${escapeHtml(String(tag.usage_count))} שיוכים` : '';
        const categoryText = tag.category_name ? ` • ${escapeHtml(tag.category_name)}` : '';
        return `${name}${usageText}${categoryText}`;
      },
      onSelect: (tag) => {
        // Fill input + perform search
        if (elements.searchInput) {
          elements.searchInput.value = tag.name || '';
        }
        performSearch({
          query: tag.name || '',
          entityType: elements.searchFilter?.value || '',
          limit: DEFAULT_LIMIT,
          origin: 'autocomplete'
        }).catch(() => {});
      },
      filterFunction: (suggestions, query) => {
        // Filter by query (case-insensitive)
        if (!query || !query.trim()) {
          return suggestions;
        }
        const queryLower = query.trim().toLowerCase();
        return suggestions.filter(tag => 
          tag.name && tag.name.toLowerCase().includes(queryLower)
        );
      },
      zIndex: 10000
    };

    // Initialize autocomplete
    window.AutocompleteService.init(elements.searchInput, autocompleteConfig);

    // Handle entity filter change - refresh suggestions
    if (elements.searchFilter) {
      elements.searchFilter.addEventListener('change', () => {
        // Hide current autocomplete
        window.AutocompleteService.hide(elements.searchInput);
        
        // Show suggestions again with new entity filter
        if (elements.searchInput === document.activeElement) {
          const query = elements.searchInput.value || '';
          if (autocompleteConfig.minChars === 0 || query.length >= autocompleteConfig.minChars) {
            autocompleteConfig.fetchFunction(query).then((suggestions) => {
              if (suggestions && suggestions.length > 0) {
                window.AutocompleteService.show(elements.searchInput, suggestions);
              }
            });
          }
        }
      });
    }
  }

  /**
   * Bind events
   */
  function bindEvents() {
    // Tabs removed - search is now always visible in header
    // No tab switching needed

    // Search form submit
    if (elements.searchForm) {
      elements.searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleQuickSearchSubmit();
      });
    }
    
    // Event delegation for tag cloud buttons (survives ButtonSystem processing)
    if (elements.cloudContainer) {
      elements.cloudContainer.addEventListener('click', (event) => {
        // Find clicked button
        const button = event.target.closest('button[data-tag-id]');
        if (!button) {
          return;
        }
        
        // Get tag ID
        const tagId = button.getAttribute('data-tag-id');
        const tagName = button.getAttribute('data-tag-name') || button.textContent?.trim();
        
        if (tagId && tagName) {
          event.preventDefault();
          event.stopPropagation();
          
          // Try to get full tag data from stored map
          let tagData = null;
          try {
            const tagDataMapStr = elements.cloudContainer.dataset.tagDataMap;
            if (tagDataMapStr) {
              const tagDataMap = new Map(JSON.parse(tagDataMapStr));
              tagData = tagDataMap.get(parseInt(tagId));
            }
          } catch (error) {
            window.Logger?.warn?.('TagWidget: Failed to parse tag data map', { error, page: 'tag-widget' });
          }
          
          // Create tag object from available data
          const tag = tagData || {
            tag_id: parseInt(tagId),
            name: tagName
          };
          
          window.Logger?.info?.('TagWidget: Tag clicked', { tagId, tagName, page: 'tag-widget' });
          applyTagFromCloud(tag);
        }
      });
    }
    
    // Event delegation for approve/reject buttons in search results drawer (same as Unified Pending Actions Widget)
    if (elements.drawerResultsBody) {
      elements.drawerResultsBody.addEventListener('click', async (event) => {
        // Handle APPROVE button
        const approveBtn = event.target.closest('[data-button-type="APPROVE"]');
        if (approveBtn) {
          const item = approveBtn.closest('.list-group-item, [data-entity-type]');
          if (item) {
            await handleApproveAction(item, event);
          }
          return;
        }

        // Handle REJECT/DISMISS button
        const rejectBtn = event.target.closest('[data-button-type="REJECT"], [data-button-type="DISMISS"]');
        if (rejectBtn) {
          const item = rejectBtn.closest('.list-group-item, [data-entity-type]');
          if (item) {
            await handleRejectAction(item, event);
          }
          return;
        }
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
    
    // Store tag data before clearing container (needed for event delegation)
    const usageValues = tags.map((tag) => tag.usage_count || 0);
    const maxUsage = Math.max(...usageValues, 1);

    // Clear container first
    elements.cloudContainer.textContent = '';
    
    if (!Array.isArray(tags) || tags.length === 0) {
      if (elements.cloudEmpty) {
        elements.cloudEmpty.classList.remove('d-none');
      }
      delete elements.cloudContainer.dataset.tagDataMap;
      return;
    }
    if (elements.cloudEmpty) {
      elements.cloudEmpty.classList.add('d-none');
    }

    // Store tag tier info for restoration after button processing
    // Also store full tag data for event delegation
    const tagTierMap = new Map();
    const tagDataMap = new Map(); // Store full tag data by tag_id
    
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
      
      // Store full tag data for click handler
      tagDataMap.set(tag.tag_id, tag);
      
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
      // Store tag name for event delegation fallback
      button.dataset.tagName = tag.name || '';
      elements.cloudContainer.appendChild(button);
    });

    processButtons(elements.cloudContainer, tagTierMap);
    
    // Store tag data map in dataset for event delegation (survives ButtonSystem processing)
    if (tagDataMap.size > 0) {
      try {
        elements.cloudContainer.dataset.tagDataMap = JSON.stringify(Array.from(tagDataMap.entries()));
      } catch (error) {
        window.Logger?.warn?.('TagWidget: Failed to store tag data map', { error, page: 'tag-widget' });
      }
    }

    // Dispatch event to trigger height equalization
    window.dispatchEvent(new CustomEvent('widgetContentUpdated'));
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
    // Don't switch to search tab - stay on cloud tab and just open the drawer
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
    state.currentPage = 1; // Reset to first page on new search

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
   * Wait for required services/elements to be available
   * @param {Object} options - Options object
   * @param {number} options.maxWait - Maximum wait time in milliseconds (default: 2000)
   * @param {string} options.type - Type to wait for: 'modalManager' | 'drawer' | 'both'
   * @returns {Promise<boolean>} - True if all required items are available, false otherwise
   */
  async function waitForRequired({ maxWait = 2000, type = 'both' } = {}) {
    const startTime = Date.now();
    const checkInterval = 100;

    return new Promise((resolve) => {
      const check = () => {
        const modalManagerReady = (type === 'drawer' || window.ModalManagerV2?.showModal);
        const drawerReady = (type === 'modalManager' || document.getElementById('tagSearchDrawer'));

        if (modalManagerReady && drawerReady) {
          resolve(true);
          return;
        }

        if (Date.now() - startTime >= maxWait) {
          window.Logger?.warn?.('Required services/elements not available after waiting', { 
            waitTime: maxWait,
            type,
            modalManagerReady,
            drawerReady,
            page: 'tag-widget' 
          });
          resolve(false);
          return;
        }

        setTimeout(check, checkInterval);
      };

      check();
    });
  }

  /**
   * Open search results drawer
   */
  async function openDrawer({ query, entityType, results, total }) {
    // Wait for required services/elements
    const ready = await waitForRequired({ maxWait: 3000, type: 'both' });
    
    if (!ready) {
      window.Logger?.error?.('Required services/elements not available, cannot open tag search drawer', { 
        page: 'tag-widget',
        ModalManagerV2Exists: typeof window.ModalManagerV2 !== 'undefined',
        hasShowModal: typeof window.ModalManagerV2?.showModal === 'function',
        drawerExists: !!document.getElementById('tagSearchDrawer')
      });
      window.NotificationSystem?.showError?.('מערכת החלונות לא זמינה. אנא רענן את הדף.');
      return;
    }
    
    if (!drawerReady) {
      window.Logger?.warn?.('Tag search drawer not found, attempting to initialize...', { 
        page: 'tag-widget' 
      });
      
      // Try to initialize the drawer if tagSearchDrawerConfig exists
      if (window.tagSearchDrawerConfig && window.ModalManagerV2?.createCRUDModal) {
        try {
          window.ModalManagerV2.createCRUDModal(window.tagSearchDrawerConfig);
          // Wait a bit more for drawer to be created
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          window.Logger?.error?.('Failed to initialize tag search drawer', { error, page: 'tag-widget' });
        }
      }
    }

    try {
      await window.ModalManagerV2.showModal('tagSearchDrawer', 'view');
      // Re-cache drawer elements in case DOM was recreated
      ensureDrawerChrome();
      hydrateDrawer({ query, entityType, results, total });
    } catch (error) {
      window.Logger?.error?.('Failed to open tag search drawer', { 
        error, 
        page: 'tag-widget' 
      });
      window.NotificationSystem?.showError?.('שגיאה בפתיחת חלון החיפוש. אנא נסה שוב.');
    }
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
   * Add pagination controls to linked items table
   * @param {string} tableId - Table ID
   * @param {number} totalItems - Total number of items
   * @param {number} pageSize - Items per page
   * @param {number} currentPage - Current page number
   * @param {number} totalPages - Total number of pages
   */
  function addPaginationControls(tableId, totalItems, pageSize, currentPage, totalPages) {
    if (totalPages <= 1) {
      // No pagination needed
      return;
    }
    
    const table = document.getElementById(tableId);
    if (!table) {
      return;
    }
    
    // Find table wrapper
    const tableWrapper = table.closest('.table-responsive');
    if (!tableWrapper) {
      return;
    }
    
    // Remove existing pagination if any
    const existingPagination = tableWrapper.parentElement.querySelector('.linked-items-pagination');
    if (existingPagination) {
      existingPagination.remove();
    }
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'linked-items-pagination d-flex justify-content-between align-items-center mt-3';
    
    // Page info
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    const pageInfo = document.createElement('div');
    pageInfo.className = 'text-muted small';
    pageInfo.textContent = `מציג ${startItem}-${endItem} מתוך ${totalItems} רשומות`;
    paginationContainer.appendChild(pageInfo);
    
    // Pagination controls
    const paginationControls = document.createElement('div');
    paginationControls.className = 'd-flex gap-2 align-items-center';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'btn btn-sm btn-outline-secondary';
    prevButton.textContent = '← קודם';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
      if (currentPage > 1) {
        goToPage(currentPage - 1);
      }
    };
    paginationControls.appendChild(prevButton);
    
    // Page numbers
    const pageNumbers = document.createElement('div');
    pageNumbers.className = 'd-flex gap-1 align-items-center';
    
    // Show page numbers (max 5 pages)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      const firstButton = document.createElement('button');
      firstButton.type = 'button';
      firstButton.className = 'btn btn-sm btn-outline-secondary';
      firstButton.textContent = '1';
      firstButton.onclick = () => {
        goToPage(1);
      };
      pageNumbers.appendChild(firstButton);
      
      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'text-muted';
        ellipsis.textContent = '...';
        pageNumbers.appendChild(ellipsis);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.type = 'button';
      pageButton.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`;
      pageButton.textContent = String(i);
      pageButton.onclick = () => {
        goToPage(i);
      };
      pageNumbers.appendChild(pageButton);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'text-muted';
        ellipsis.textContent = '...';
        pageNumbers.appendChild(ellipsis);
      }
      
      const lastButton = document.createElement('button');
      lastButton.type = 'button';
      lastButton.className = 'btn btn-sm btn-outline-secondary';
      lastButton.textContent = String(totalPages);
      lastButton.onclick = () => {
        goToPage(totalPages);
      };
      pageNumbers.appendChild(lastButton);
    }
    
    paginationControls.appendChild(pageNumbers);
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'btn btn-sm btn-outline-secondary';
    nextButton.textContent = 'הבא →';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
      if (currentPage < totalPages) {
        goToPage(currentPage + 1);
      }
    };
    paginationControls.appendChild(nextButton);
    
    paginationContainer.appendChild(paginationControls);
    
    // Insert pagination after table wrapper
    tableWrapper.parentElement.insertBefore(paginationContainer, tableWrapper.nextSibling);
  }

  /**
   * Go to specific page in pagination
   * @param {number} page - Page number to navigate to
   */
  function goToPage(page) {
    if (!state.lastLinkedItems || !Array.isArray(state.lastLinkedItems)) {
      window.Logger?.warn?.('TagWidget: Cannot go to page, no linked items available', { page: 'tag-widget' });
      return;
    }
    
    const totalItems = state.lastLinkedItems.length || 0;
    const pageSize = 25; // Default page size
    const totalPages = Math.ceil(totalItems / pageSize);
    
    if (page < 1 || page > totalPages) {
      window.Logger?.warn?.('TagWidget: Invalid page number', { page, totalPages, page: 'tag-widget' });
      return;
    }
    
    state.currentPage = page;
    
    // Update table body with paginated items
    const tableId = 'linkedItemsTable_tag_search';
    const table = document.getElementById(tableId);
    if (!table) {
      window.Logger?.warn?.('TagWidget: Table not found for pagination', { tableId, page: 'tag-widget' });
      return;
    }
    
    // Get paginated items
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = state.lastLinkedItems.slice(startIndex, endIndex);
    
    // Update table body using EntityDetailsRenderer
    if (window.entityDetailsRenderer && typeof window.entityDetailsRenderer.updateLinkedItemsTableBody === 'function') {
      window.entityDetailsRenderer.updateLinkedItemsTableBody(tableId, paginatedItems);
      
      // Update pagination controls
      const tableWrapper = table.closest('.table-responsive');
      if (tableWrapper) {
        const existingPagination = tableWrapper.parentElement.querySelector('.linked-items-pagination');
        if (existingPagination) {
          existingPagination.remove();
        }
        addPaginationControls(tableId, totalItems, pageSize, page, totalPages);
      }
      
      // Re-process buttons after update
      if (window.ButtonSystem && typeof window.ButtonSystem.processButtons === 'function') {
        window.ButtonSystem.processButtons(elements.drawerBody);
      }
      if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
        window.ButtonSystem.initializeButtons();
      }
    } else {
      // Fallback: re-render if updateLinkedItemsTableBody not available
      window.Logger?.warn?.('TagWidget: updateLinkedItemsTableBody not available, re-rendering', { page: 'tag-widget' });
      renderDrawerRows(state.lastResults);
    }
  }

  /**
   * Render drawer rows using EntityDetailsRenderer.renderLinkedItems
   * Uses existing linked items system instead of custom rendering
   */
  function renderDrawerRows(results) {
    if (!elements.drawerBody) {
      return;
    }
    
    if (!Array.isArray(results) || results.length === 0) {
      if (elements.drawerEmpty) {
        elements.drawerEmpty.classList.remove('d-none');
      }
      // Hide table if exists
      const tableWrapper = elements.drawerBody.querySelector('.table-responsive');
      if (tableWrapper) {
        tableWrapper.classList.add('d-none');
      }
      return;
    }

    // Convert search results to linked items format
    const linkedItems = [];
    results.forEach((entry) => {
      const tag = entry.tag;
      (entry.assignments || []).forEach((assignment) => {
        linkedItems.push({
          type: assignment.entity_type,
          id: assignment.entity_id,
          created_at: assignment.created_at || assignment.linked_at,
          updated_at: assignment.updated_at || assignment.linked_at,
          // Store tag info for reference (renderLinkedItems will handle display)
          _tag: tag
        });
      });
    });

    if (linkedItems.length === 0) {
      if (elements.drawerEmpty) {
        elements.drawerEmpty.classList.remove('d-none');
      }
      // Hide table if exists
      const tableWrapper = elements.drawerBody.querySelector('.table-responsive');
      if (tableWrapper) {
        tableWrapper.classList.add('d-none');
      }
      return;
    }

    // Hide empty message
    if (elements.drawerEmpty) {
      elements.drawerEmpty.classList.add('d-none');
    }

    // Use EntityDetailsRenderer.renderLinkedItems to generate the table
    if (!window.entityDetailsRenderer || typeof window.entityDetailsRenderer.renderLinkedItems !== 'function') {
      window.Logger?.error?.('EntityDetailsRenderer.renderLinkedItems not available', { page: 'tag-widget' });
      if (elements.drawerError) {
        elements.drawerError.textContent = 'מערכת הצגת פריטים מקושרים אינה זמינה';
        elements.drawerError.classList.remove('d-none');
      }
      return;
    }

    // Get entity color for the table
    const entityColor = (window.getEntityColor && typeof window.getEntityColor === 'function')
      ? window.getEntityColor('tag')
      : '#6c757d';

    // Create sourceInfo for the drawer
    const sourceInfo = {
      sourceModal: 'tag-search-drawer',
      sourceType: 'tag',
      sourceId: 'search'
    };

    // Store full linked items for pagination (before enrichment)
    // We'll store enriched items after renderLinkedItems completes
    const allLinkedItems = linkedItems;
    
    // Pagination settings
    const pageSize = 25; // Default page size
    const currentPage = state.currentPage || 1;
    const totalPages = Math.ceil(allLinkedItems.length / pageSize);
    
    // Render linked items table with ALL items first for enrichment
    // renderLinkedItems will enrich all items, but we'll handle pagination manually
    // Disable pagination in renderLinkedItems - we'll do it ourselves
    const linkedItemsHtml = window.entityDetailsRenderer.renderLinkedItems(
      allLinkedItems, // Pass ALL items for enrichment
      entityColor,
      'tag',
      'search',
      sourceInfo,
      { enablePagination: false } // Disable built-in pagination - we handle it manually
    );

    // Replace the table wrapper with the linked items section
    // renderLinkedItems returns a full section - we'll insert it and hide its header
    const tableWrapper = elements.drawerBody.querySelector('.table-responsive');
    
    // Remove any existing linked items section from previous search
    const existingSection = elements.drawerBody.querySelector('section.content-section[data-section^="linked-items-"]');
    if (existingSection) {
      existingSection.remove();
    }
    
    if (linkedItemsHtml) {
      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(linkedItemsHtml.trim(), 'text/html');
      
      // Find the section in the generated HTML
      const linkedItemsSection = doc.body.querySelector('section.content-section');
      if (linkedItemsSection) {
        // Hide the section header (we already have title/subtitle in drawer header)
        const sectionHeader = linkedItemsSection.querySelector('.section-header-with-extra-info');
        if (sectionHeader) {
          sectionHeader.style.display = 'none';
        }
        
        // Remove existing linked items section if exists
        const existingLinkedSection = elements.drawerBody.querySelector('section.content-section[data-section^="linked-items-"]');
        if (existingLinkedSection) {
          existingLinkedSection.remove();
        }
        
        // Remove existing table wrapper if exists
        if (tableWrapper) {
          tableWrapper.remove();
        }
        
        // Insert section before footer controls or at the end
        const footerControls = elements.drawerBody.querySelector('#tagSearchModalFooterControls');
        const clonedSection = linkedItemsSection.cloneNode(true);
        
        if (footerControls) {
          elements.drawerBody.insertBefore(clonedSection, footerControls);
        } else {
          elements.drawerBody.appendChild(clonedSection);
        }
        
        // Wait for DOM to update and table to be available before initializing
        setTimeout(() => {
          // Verify table exists in DOM
          const tableId = 'linkedItemsTable_tag_search';
          const table = document.getElementById(tableId);
          
          if (table) {
            // Initialize tooltips and other dynamic features after DOM update
            if (window.ButtonSystem && typeof window.ButtonSystem.processButtons === 'function') {
              window.ButtonSystem.processButtons(elements.drawerBody);
            }
            // Also trigger button initialization from renderLinkedItems
            if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
              window.ButtonSystem.initializeButtons();
            }
            
            // Store enriched items from TableDataRegistry for pagination
            // These are the items that were enriched by renderLinkedItems
            if (window.TableDataRegistry) {
              const tableType = window.TableDataRegistry.resolveTableType?.(tableId) || 'linked_items__tag_search';
              const enrichedItems = window.TableDataRegistry.getFullData?.(tableType, { asReference: true });
              if (Array.isArray(enrichedItems) && enrichedItems.length > 0) {
                // Store enriched items - these will be used for pagination
                state.lastLinkedItems = enrichedItems;
                window.Logger?.debug?.('TagWidget: Stored enriched items for pagination', {
                  count: enrichedItems.length,
                  totalOriginal: allLinkedItems.length,
                  page: 'tag-widget'
                });
                
                // Now paginate: show only items for current page
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedItems = enrichedItems.slice(startIndex, endIndex);
                
                // Update table to show only paginated items
                if (window.entityDetailsRenderer && typeof window.entityDetailsRenderer.updateLinkedItemsTableBody === 'function') {
                  window.entityDetailsRenderer.updateLinkedItemsTableBody(tableId, paginatedItems);
                  // Updated table with paginated items
                }
              } else {
                // Fallback: use original items if enrichment not available
                state.lastLinkedItems = allLinkedItems;
              }
            } else {
              // Fallback: use original items if TableDataRegistry not available
              state.lastLinkedItems = allLinkedItems;
            }
            
            // Add pagination if needed
            addPaginationControls(tableId, allLinkedItems.length, pageSize, currentPage, totalPages);
          } else {
            window.Logger?.warn?.('TagWidget: Table not found in DOM after insertion', {
              tableId,
              page: 'tag-widget'
            });
          }
        }, 200); // Increased timeout to ensure DOM is ready
      }
    }
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
      tagCell.textContent = '';
      const badgeHTML = window.FieldRendererService.renderTagBadges([tag], {
        showTitle: false,
        includeCategory: false
      });
      const parser = new DOMParser();
      const doc = parser.parseFromString(badgeHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
        tagCell.appendChild(node.cloneNode(true));
      });
    } else {
      tagCell.textContent = tag?.name || '-';
    }
    row.appendChild(tagCell);

    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(linked_at);
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
        window.Logger?.warn?.('TagWidget: Container not found', { 
          containerId, 
          page: 'tag-widget',
          containerExists: !!document.getElementById(containerId)
        });
        return;
      }

      // Apply height configuration before binding events
      applyHeightConfiguration();
      
      bindEvents();
      ensureDrawerChrome();
      
      // Initialize autocomplete for search input
      initAutocomplete();
      
      // Set active tab from config
      // Tabs removed - search is now always visible in header
      // No tab switching needed

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
      if (!state.initialized) {
        return;
      }
      
      // Remove event listeners by cloning elements
      if (elements.searchForm) {
        const newForm = elements.searchForm.cloneNode(true);
        elements.searchForm.parentNode?.replaceChild(newForm, elements.searchForm);
      }
      
      if (elements.cloudContainer) {
        const newContainer = elements.cloudContainer.cloneNode(true);
        elements.cloudContainer.parentNode?.replaceChild(newContainer, elements.cloudContainer);
      }
      
      if (elements.drawerLoadMoreBtn) {
        const newBtn = elements.drawerLoadMoreBtn.cloneNode(true);
        elements.drawerLoadMoreBtn.parentNode?.replaceChild(newBtn, elements.drawerLoadMoreBtn);
      }
      
      // Clear state
      state.initialized = false;
      state.tagCloudLoading = false;
      state.searchLoading = false;
      state.lastQuery = '';
      state.lastEntityFilter = '';
      state.lastResults = [];
      state.lastResultCount = 0;
      state.metadataCache.clear();
      state.lastLinkedItems = [];
      
      window.Logger?.info?.('TagWidget: Destroyed and cleaned up', { page: 'tag-widget' });
      
      state.initialized = false;
      state.metadataCache.clear();
      
      // Destroy autocomplete if exists
      if (elements.searchInput && window.AutocompleteService) {
        window.AutocompleteService.destroy(elements.searchInput);
      }
      
      // Remove event listeners
      if (elements.searchFilter) {
        // Clone and replace to remove all event listeners
        const newFilter = elements.searchFilter.cloneNode(true);
        elements.searchFilter.parentNode?.replaceChild(newFilter, elements.searchFilter);
        elements.searchFilter = newFilter;
      }
      
      // Tabs removed - no need to clone
      
      if (elements.searchForm) {
        const newForm = elements.searchForm.cloneNode(true);
        elements.searchForm.parentNode?.replaceChild(newForm, elements.searchForm);
        elements.searchForm = newForm;
      }
      
      if (elements.cloudContainer) {
        const newContainer = elements.cloudContainer.cloneNode(true);
        elements.cloudContainer.parentNode?.replaceChild(newContainer, elements.cloudContainer);
        elements.cloudContainer = newContainer;
      }
      
      if (elements.drawerLoadMoreBtn) {
        const newBtn = elements.drawerLoadMoreBtn.cloneNode(true);
        elements.drawerLoadMoreBtn.parentNode?.replaceChild(newBtn, elements.drawerLoadMoreBtn);
        elements.drawerLoadMoreBtn = newBtn;
      }
      
      // Clear state
      state.tagCloudLoading = false;
      state.searchLoading = false;
      state.lastQuery = '';
      state.lastEntityFilter = '';
      state.lastResults = [];
      state.lastResultCount = 0;
      state.currentLimit = DEFAULT_LIMIT;
      state.currentPage = 1;
      state.lastLinkedItems = [];
      
      window.Logger?.info?.('TagWidget: Destroyed and cleaned up', { page: 'tag-widget' });
    },

    /**
     * Refresh tag cloud
     * @param {object} options - Options (force, etc.)
     */
    refreshTagCloud(options = {}) {
      return refreshTagCloud(options);
    },

    /**
     * Go to specific page in pagination
     * @param {number} page - Page number to navigate to
     */
    goToPage(page) {
      return goToPage(page);
    },

    version: '1.0.0'
  };

  /**
   * Handle APPROVE action - open modal for creation/assignment (same as Unified Pending Actions Widget)
   */
  async function handleApproveAction(item, event) {
    event.preventDefault();
    event.stopPropagation();
    
    window.Logger?.info?.('Handling APPROVE action', { page: 'tag-widget' });
    
    const entityType = item.dataset.entityType;
    const entityId = item.dataset.entityId;
    
    if (!entityType || !entityId) {
      return;
    }
    
    // Handle based on entity type
    if (entityType === 'execution') {
      // Handle execution assignment to trade
      const executionId = Number(entityId);
      if (executionId && window.ExecutionAssignmentService) {
        const highlights = await window.ExecutionAssignmentService.getCachedHighlights() || [];
        const highlight = highlights.find(h => h.execution?.id === executionId);
        if (highlight && highlight.suggestions && highlight.suggestions.length > 0) {
          const firstSuggestion = highlight.suggestions[0];
          const tradeId = firstSuggestion.trade?.id || firstSuggestion.trade_id;
          if (tradeId && window.acceptSuggestion) {
            await window.acceptSuggestion(executionId, Number(tradeId));
            await TagWidget.refreshTagCloud();
          } else {
            if (window.ModalManagerV2?.showModal) {
              await window.ModalManagerV2.showModal('executionsModal', 'edit', { 
                execution_id: executionId,
                trade_id: tradeId ? Number(tradeId) : null
              });
              await TagWidget.refreshTagCloud();
            }
          }
        } else {
          if (window.ModalManagerV2?.showModal) {
            await window.ModalManagerV2.showModal('executionsModal', 'edit', { 
              execution_id: executionId
            });
            await TagWidget.refreshTagCloud();
          }
        }
      }
    } else if (entityType === 'trade' || entityType === 'trade_plan') {
      // Handle plan assignment to trade
      const tradeId = Number(entityId);
      if (tradeId && window.TradePlanAssignmentService) {
        const assignments = await window.TradePlanAssignmentService.getCachedAssignments() || [];
        const assignment = assignments.find(a => (a.trade?.id || a.trade_id) === tradeId);
        if (assignment && assignment.suggestions && assignment.suggestions.length > 0) {
          const firstSuggestion = assignment.suggestions[0];
          const planId = firstSuggestion.plan?.id || firstSuggestion.trade_plan_id;
          if (planId && window.ModalManagerV2?.showModal) {
            await window.ModalManagerV2.showModal('tradesModal', 'edit', { 
              trade_id: tradeId,
              trade_plan_id: Number(planId)
            });
            await TagWidget.refreshTagCloud();
          }
        } else {
          if (window.ModalManagerV2?.showModal) {
            await window.ModalManagerV2.showModal('tradesModal', 'edit', { 
              trade_id: tradeId
            });
            await TagWidget.refreshTagCloud();
          }
        }
      }
    }
  }

  /**
   * Handle REJECT/DISMISS action - remove item from list (same as Unified Pending Actions Widget)
   */
  async function handleRejectAction(item, event) {
    event.preventDefault();
    event.stopPropagation();
    
    window.Logger?.info?.('Handling REJECT action', { page: 'tag-widget' });
    
    const entityType = item.dataset.entityType;
    const entityId = item.dataset.entityId;
    
    if (!entityType || !entityId) {
      return;
    }
    
    // Handle based on entity type
    if (entityType === 'execution') {
      const executionId = entityId;
      if (executionId && window.ExecutionAssignmentService) {
        await window.ExecutionAssignmentService.dismissItem(executionId);
        await TagWidget.refreshTagCloud();
      }
    } else if (entityType === 'trade') {
      const tradeId = entityId;
      const planId = item.dataset.planId;
      if (tradeId && window.TradePlanAssignmentService) {
        if (planId) {
          await window.TradePlanAssignmentService.dismissItem('assignment', tradeId, planId);
        } else {
          await window.TradePlanAssignmentService.dismissItem('creation', tradeId);
        }
        await TagWidget.refreshTagCloud();
      }
    }
  }

  // Export to global scope
  window.TagWidget = TagWidget;
  
  // Log successful load
  if (window.Logger) {
    window.Logger.info('✅ Tag Widget loaded successfully', { page: 'tag-widget', version: '1.0.0' });
  }
})();

