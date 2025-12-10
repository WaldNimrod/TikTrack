/**
 * Trading Journal Page - Trading journal with calendar view
 *
 * This file handles the trading journal page functionality for the mockup.
 *
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeHeader() - Initializeheader
// - createAddEntryDropdown() - Createaddentrydropdown
// - initializePage() - Initializepage
// - initializeMonthYearSelectors() - Initializemonthyearselectors
// - setupActivityChartLazyLoading() - Setupactivitychartlazyloading

// === Event Handlers ===
// - replaceIconsWithIconSystem() - Replaceiconswithiconsystem
// - renderMenuIcons() - Rendermenuicons
// - handleAddEntry() - Handleaddentry
// - updateMonthDisplay() - Updatemonthdisplay
// - setMonthYear() - Setmonthyear
// - navigateMonth() - Navigatemonth
// - generateEntityTypeFilterButtons() - Generateentitytypefilterbuttons
// - handleEntryClickById() - Handleentryclickbyid
// - handleEntryClick() - Handleentryclick
// - handleDoubleClickEntry() - Handledoubleclickentry
// - prevMonth() - Prevmonth
// - nextMonth() - Nextmonth
// - handleActivityChartToggle() - Handleactivitycharttoggle
// - convertDateToChartTime() - Convertdatetocharttime

// === UI Functions ===
// - loadAndRenderCalendar() - Loadandrendercalendar
// - renderJournalEntriesTable() - Renderjournalentriestable
// - renderJournalEntriesCards() - Renderjournalentriescards
// - loadAndRenderJournalEntries() - Loadandrenderjournalentries
// - updateJournalEntriesTableBody() - Updatejournalentriestablebody
// - renderJournalEntriesTableForModal() - Renderjournalentriestableformodal
// - renderJournalEntriesCardsForModal() - Renderjournalentriescardsformodal
// - loadAndRenderActivityChart() - Loadandrenderactivitychart
// - showDropdown() - Showdropdown
// - hideDropdown() - Hidedropdown

// === Data Functions ===
// - getCSSVariableValue() - Getcssvariablevalue
// - loadPageState() - Loadpagestate
// - savePageState() - Savepagestate
// - loadTickerFilter() - Loadtickerfilter

// === Other ===
// - applyDynamicColors() - Applydynamiccolors
// - navigateToToday() - Navigatetotoday
// - filterJournalByEntityType() - Filterjournalbyentitytype
// - filterJournalByTicker() - Filterjournalbyticker
// - switchViewMode() - Switchviewmode
// - zoomToDay() - Zoomtoday
// - waitForElements() - Waitforelements

(function() {
  'use strict';

  // Current month and year for calendar navigation
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Page name for state management
  const PAGE_NAME = 'trading-journal-page';

  /**
   * Helpers for date normalization using global date utilities
   */
  const getEntryDateEnvelope = (entry) => {
    if (!entry) {return null;}
    const candidates = [
      entry.date,
      entry.created_at,
      entry.execution_date,
      entry.updated_at,
      entry.closed_at,
      entry.entry_date,
    ];
    const raw = candidates.find(v => v);
    if (window.dateUtils?.ensureDateEnvelope) {
      return window.dateUtils.ensureDateEnvelope(raw);
    }
    return raw || null;
  }

  const entryToDate = (entry) => {
    const envelope = getEntryDateEnvelope(entry);
    if (!envelope) {return null;}

    if (window.dateUtils?.toDate) {
      const d = window.dateUtils.toDate(envelope);
      if (d && !isNaN(d.getTime())) {return d;}
    }

    if (envelope && typeof envelope === 'object' && (envelope.utc || envelope.local)) {
      const d = new Date(envelope.utc || envelope.local);
      if (!isNaN(d.getTime())) {return d;}
    }

    const d = new Date(envelope);
    return isNaN(d.getTime()) ? null : d;
  }

  /**
     * Initialize Header System
     */
  async function initializeHeader() {
    // Wait for HeaderSystem to be available
    if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
      try {
        await window.HeaderSystem.initialize();
        if (window.Logger) {
          window.Logger.info('✅ Header System initialized', { page: 'trading-journal-page' });
        }
      } catch (error) {
        if (window.Logger) {
          window.Logger.error('Error initializing Header System', {
            page: 'trading-journal-page',
            error,
          });
        }
      }
    } else {
      // Retry after a short delay if HeaderSystem not loaded yet
      setTimeout(() => {
        if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
          window.HeaderSystem.initialize().catch(error => {
            if (window.Logger) {
              window.Logger.error('Error initializing Header System (retry)', {
                page: 'trading-journal-page',
                error,
              });
            }
          });
        } else {
          if (window.Logger) {
            window.Logger.warn('HeaderSystem not available after retry', { page: 'trading-journal-page' });
          }
        }
      }, 500);
    }
  }

  /**
     * Helper function to get CSS variable value
     * @param {string} variableName - CSS variable name
     * @param {string} fallback - Fallback value
     * @returns {string} CSS variable value or fallback
     */
  const getCSSVariableValue = (variableName, fallback) => {
    try {
      const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
      return value && value.trim() ? value.trim() : fallback;
    } catch (error) {
      return fallback;
    }
  }

  /**
     * Replace all <img> tags with IconSystem.renderIcon()
     * @returns {Promise<void>}
     */
  async function replaceIconsWithIconSystem() {
    if (!window.IconSystem || !window.IconSystem.initialized) {
      // Wait for IconSystem to be ready
      if (window.IconSystem && typeof window.IconSystem.initialize === 'function') {
        await window.IconSystem.initialize();
      } else {
        // Retry after delay
        setTimeout(() => replaceIconsWithIconSystem(), 500);
        return;
      }
    }

    // Icon mapping: img src path -> IconSystem type and name
    const iconMappings = {
      // Navigation and page icons
      'link.svg': { type: 'button', name: 'link' },
      'book.svg': { type: 'page', name: 'notebook' },
      'calendar.svg': { type: 'button', name: 'calendar' },
      'list.svg': { type: 'button', name: 'list' },

      // Entity icons
      'activity.svg': { type: 'entity', name: 'execution' },
      'cash.svg': { type: 'entity', name: 'cash_flow' },
      'plus-circle.svg': { type: 'button', name: 'plus' },
      'check-circle.svg': { type: 'button', name: 'check' },
      'x-circle.svg': { type: 'button', name: 'x' },
      'note.svg': { type: 'entity', name: 'note' },
      'bell.svg': { type: 'entity', name: 'alert' },

      // Meta icons
      'wallet.svg': { type: 'button', name: 'wallet' },
      'database.svg': { type: 'button', name: 'database' },
      'info-circle.svg': { type: 'button', name: 'info-circle' },
      'tag.svg': { type: 'button', name: 'tag' },
      'arrow-left-right.svg': { type: 'button', name: 'arrows-left-right' },
      'currency-dollar.svg': { type: 'button', name: 'currency-dollar' },
      'paperclip.svg': { type: 'button', name: 'paperclip' },
      'check.svg': { type: 'button', name: 'check' },
    };

    // Find all img tags with icon class
    const imgTags = document.querySelectorAll('img.icon, img[src*="icons"]');

    for (const img of imgTags) {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const size = img.getAttribute('width') || '16';
      const className = img.getAttribute('class') || 'icon';

      // Extract icon name from path
      const iconFileName = src.split('/').pop();
      const mapping = iconMappings[iconFileName];

      if (mapping) {
        try {
          const iconHTML = await window.IconSystem.renderIcon(mapping.type, mapping.name, {
            size,
            alt,
            class: className,
          });

          // Replace img with rendered icon
          const tempDiv = document.createElement('div');
          tempDiv.textContent = '';
          const parser = new DOMParser();
          const doc = parser.parseFromString(iconHTML, 'text/html');
          doc.body.childNodes.forEach(node => {
            tempDiv.appendChild(node.cloneNode(true));
          });
          const newIcon = tempDiv.firstElementChild;

          if (newIcon) {
            img.parentNode.replaceChild(newIcon, img);
          }
        } catch (error) {
          if (window.Logger) {
            window.Logger.warn('Failed to render icon', {
              icon: iconFileName,
              error,
              page: 'trading-journal-page',
            });
          }
        }
      }
    }
  }

  /**
   * Handle add entry action
   * @param {string} entityType - Entity type to add
   */
  const handleAddEntry = (entityType) => {
    if (window.Logger) {
      window.Logger.info('Add entry clicked', { entityType, page: 'trading-journal-page' });
    }

    // TODO: Implement actual add entry functionality
    // For now, just show a notification
    if (typeof window.showNotification === 'function') {
      const entityLabels = {
        'note': 'הערות',
        'alert': 'התראות',
        'execution': 'ביצועים',
        'cash_flow': 'תזרימי מזומנים',
        'trade_plan': 'תוכנית',
        'trade': 'טרייד',
      };

      window.showNotification(
        `פתיחת טופס הוספת ${entityLabels[entityType] || entityType}`,
        'info',
        'יומן מסחר',
        3000,
        'ui',
      );
    }
  };

  /**
   * Create dropdown menu for "Add Entry" button
   */
  const createAddEntryDropdown = () => {
    // Try multiple selectors to find the button
    const addButton = document.getElementById('add-entry-btn') ||
                         document.getElementById('add-entry-button') ||
                         document.querySelector('button[data-button-type="ADD"][id*="add-entry"]') ||
                         document.querySelector('button[data-button-type="ADD"][data-text="הוסף רשומה"]') ||
                         document.querySelector('button[data-button-type="ADD"]');

    if (!addButton) {
      if (window.Logger) {
        window.Logger.warn('Add entry button not found', { page: 'trading-journal-page' });
      }
      return;
    }

    // Entity types for journal entries (ordered as requested)
    const entityTypes = [
      { type: 'note', label: 'הערות', icon: 'note' },
      { type: 'alert', label: 'התראות', icon: 'bell' },
      { type: 'execution', label: 'ביצועים', icon: 'activity' },
      { type: 'cash_flow', label: 'תזרימי מזומן', icon: 'cash' },
      { type: 'trade_plan', label: 'תוכנית', icon: 'file-text' },
      { type: 'trade', label: 'טרייד', icon: 'trending-up' },
    ];

    // Create wrapper for dropdown
    const wrapper = document.createElement('div');
    wrapper.className = 'add-entry-dropdown-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'add-entry-dropdown-menu';
    dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 4px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 200px;
            padding: 8px;
            display: none;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
        `;

    // Create menu items
    entityTypes.forEach(({ type, label, icon }) => {
      const menuItem = document.createElement('button');
      menuItem.className = 'add-entry-menu-item';
      menuItem.setAttribute('data-entity-type', type);
      menuItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 8px 12px;
                border: none;
                background: none;
                text-align: right;
                cursor: pointer;
                font-size: 14px;
                border-radius: 4px;
                transition: background-color 0.2s;
            `;

      // Add entity color dynamically
      menuItem.style.setProperty('--entity-type', type);

      // Create icon placeholder (will be replaced by IconSystem)
      const iconSpan = document.createElement('span');
      iconSpan.className = 'menu-item-icon';
      iconSpan.setAttribute('data-icon-type', 'entity');
      iconSpan.setAttribute('data-icon-name', type);
      iconSpan.style.width = '16px';
      iconSpan.style.height = '16px';
      iconSpan.style.display = 'inline-block';

      const labelSpan = document.createElement('span');
      labelSpan.textContent = label;

      menuItem.appendChild(iconSpan);
      menuItem.appendChild(labelSpan);

      // Add click handler
      menuItem.addEventListener('click', e => {
        e.stopPropagation();
        handleAddEntry(type);
        hideDropdown();
      });

      // Add hover effect
      menuItem.addEventListener('mouseenter', () => {
        const entityColor = getCSSVariableValue(`--entity-${type.replace('_', '-')}-color`, '#007bff');
        const entityBg = getCSSVariableValue(`--entity-${type.replace('_', '-')}-bg`, 'rgba(0, 123, 255, 0.1)');
        menuItem.style.backgroundColor = entityBg;
        menuItem.style.color = entityColor;
      });

      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.backgroundColor = '';
        menuItem.style.color = '';
      });

      dropdown.appendChild(menuItem);
    });

    // Insert wrapper before button
    addButton.parentNode.insertBefore(wrapper, addButton);
    wrapper.appendChild(addButton);
    wrapper.appendChild(dropdown);

    // Setup hover behavior
    let hoverTimeout = null;
    let hideTimeout = null;

    const hideDropdown = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      hideTimeout = setTimeout(() => {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        setTimeout(() => {
          dropdown.style.display = 'none';
        }, 200);
      }, 150);
    };

    const showDropdown = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      hoverTimeout = setTimeout(() => {
        dropdown.style.display = 'block';
        setTimeout(() => {
          dropdown.style.opacity = '1';
          dropdown.style.visibility = 'visible';
        }, 10);
      }, 150);
    };
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      hideTimeout = setTimeout(() => {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        setTimeout(() => {
          dropdown.style.display = 'none';
        }, 200);
      }, 200);
    };

    wrapper.addEventListener('mouseenter', showDropdown);
    wrapper.addEventListener('mouseleave', hideDropdown);
    dropdown.addEventListener('mouseenter', () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    });
    dropdown.addEventListener('mouseleave', hideDropdown);

    // Render icons in menu items
    setTimeout(() => renderMenuIcons(), 500);
  }

  /**
     * Load page state from PageStateManager
     */
  const loadPageState = async () => {
    if (window.PageStateManager && typeof window.PageStateManager.loadPageState === 'function') {
      try {
        const state = await window.PageStateManager.loadPageState(PAGE_NAME);
        if (state && state.entityFilters) {
          // Restore month/year if saved
          if (state.entityFilters.calendarMonth !== undefined) {
            currentMonth = state.entityFilters.calendarMonth;
          }
          if (state.entityFilters.calendarYear !== undefined) {
            currentYear = state.entityFilters.calendarYear;
          }
          // Restore entity filter if saved
          if (state.entityFilters.entityFilter) {
            window.currentEntityFilter = state.entityFilters.entityFilter;
          }
        }
      } catch (error) {
        if (window.Logger) {
          window.Logger.warn('Failed to load page state', {
            page: PAGE_NAME,
            error: error?.message,
          });
        }
      }
    }
  }

  /**
     * Save page state to PageStateManager
     */
  const savePageState = async () => {
    if (window.PageStateManager && typeof window.PageStateManager.savePageState === 'function') {
      try {
        await window.PageStateManager.savePageState(PAGE_NAME, {
          entityFilters: {
            calendarMonth: currentMonth,
            calendarYear: currentYear,
            entityFilter: window.currentEntityFilter || 'all',
          },
        });
      } catch (error) {
        if (window.Logger) {
          window.Logger.warn('Failed to save page state', {
            page: PAGE_NAME,
            error: error?.message,
          });
        }
      }
    }
  }

  /**
     * Initialize page
     */
  const initializePage = async () => {
    // Initialize Header System first
    initializeHeader();

    // Wait for Preferences to be loaded
    if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
      window.PreferencesCore.initializeWithLazyLoading().catch(error => {
        if (window.Logger) {
          window.Logger.warn('Preferences initialization failed (non-critical)', {
            page: PAGE_NAME,
            error,
          });
        }
      });
    }

    // Load saved page state
    await loadPageState();
    if (!window.currentEntityFilter) {
      window.currentEntityFilter = 'all';
    }
    updateMonthDisplay();
    initializeMonthYearSelectors();

    // Wait for IconSystem and DOM to be ready
    const initAfterLoad = async () => {
      // Wait for Button System to process buttons
      let retries = 0;
      const maxRetries = 10;

      const waitForElements = () => {
        const addButton = document.getElementById('add-entry-btn') ||
                                 document.getElementById('add-entry-button') ||
                                 document.querySelector('button[data-button-type="ADD"]');
        const prevButton = document.getElementById('prev-month-btn') ||
                                  document.querySelector('button[data-action="prev-month"]');
        const nextButton = document.getElementById('next-month-btn') ||
                                  document.querySelector('button[data-action="next-month"]');

        return !!(addButton && prevButton && nextButton);
      };

      // Wait for elements to be available
      while (!waitForElements() && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200));
        retries++;
      }

      // Replace icons
      await replaceIconsWithIconSystem();

      // Create dropdown menu
      createAddEntryDropdown();

      // Update initial month display
      const monthDisplay = document.getElementById('current-month-display');
      if (monthDisplay) {
        monthDisplay.textContent = window.CalendarDateUtils.formatMonthDisplay(currentYear, currentMonth);
      }

      // Show loading state
      const calendarContainer = document.getElementById('calendar-container') || document.querySelector('.calendar-container');
      if (calendarContainer && typeof window.showLoadingState === 'function') {
        window.showLoadingState(calendarContainer.id || 'calendar-container');
      }

      // Load and render initial calendar with data
      await loadAndRenderCalendar();

      // Hide loading state
      if (calendarContainer && typeof window.hideLoadingState === 'function') {
        window.hideLoadingState(calendarContainer.id || 'calendar-container');
      }

      // Load and render journal entries (default: cards view)
      window.tradingJournalViewMode = 'cards';
      await loadAndRenderJournalEntries();

      // Load ticker filter dropdown
      await loadTickerFilter();

      // Generate entity type filter buttons
      await generateEntityTypeFilterButtons();

      // Setup lazy loading for activity chart (only load when section is opened)
      setupActivityChartLazyLoading();

      // Apply dynamic colors
      applyDynamicColors();
    };

    // Wait a bit for all systems to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initAfterLoad, 500);
      });
    } else {
      setTimeout(initAfterLoad, 500);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    // DOM already loaded
    initializePage();
  }

  /**
     * Load and render calendar with data
     * Uses CalendarDataLoader and CalendarRenderer
     */
  async function loadAndRenderCalendar() {
    // Show loading state
    const calendarContainer = document.getElementById('calendar') ||
                                 document.querySelector('.calendar-grid') ||
                                 document.querySelector('.calendar') ||
                                 document.getElementById('calendar-container') ||
                                 document.querySelector('.calendar-container');
    const containerId = calendarContainer ? calendarContainer.id || 'calendar' : 'calendar';
    if (calendarContainer && typeof window.showLoadingState === 'function') {
      window.showLoadingState(containerId);
    }

    try {
      // Try to load EOD portfolio metrics for the month
      let eodPortfolioData = null;
      if (window.EODIntegrationHelper && window.EODIntegrationHelper.isEODAvailable()) {
        try {
          const userId = window.g?.user_id || window.TikTrackAuth?.currentUser?.id;
          if (userId) {
            // Calculate date range for the month
            const monthStart = new Date(currentYear, currentMonth, 1);
            const monthEnd = new Date(currentYear, currentMonth + 1, 0);

            if (window.Logger) {
              window.Logger.info('🔄 Loading EOD portfolio metrics for calendar month', {
                userId,
                year: currentYear,
                month: currentMonth,
                dateFrom: monthStart.toISOString().split('T')[0],
                dateTo: monthEnd.toISOString().split('T')[0],
                page: PAGE_NAME,
              });
            }

            // Load EOD portfolio metrics for the entire month - NO FALLBACK!
            const eodResult = await window.EODIntegrationHelper.loadEODPortfolioMetrics(
              userId,
              {
                date_from: monthStart.toISOString().split('T')[0],
                date_to: monthEnd.toISOString().split('T')[0],
              },
            );

            if (eodResult && eodResult.data && Array.isArray(eodResult.data) && eodResult.data.length > 0) {
              eodPortfolioData = eodResult.data;
              if (window.Logger) {
                window.Logger.info('✅ EOD portfolio metrics loaded for calendar', {
                  userId,
                  recordsCount: eodPortfolioData.length,
                  source: eodResult.source,
                  page: PAGE_NAME,
                });
              }
            }
          }
        } catch (eodError) {
          if (window.Logger) {
            window.Logger.warn('⚠️ EOD loading failed for calendar, proceeding without', {
              error: eodError.message,
              year: currentYear,
              month: currentMonth,
              page: PAGE_NAME,
            });
          }
        }
      }

      // Load data using CalendarDataLoader
      // CRITICAL: Pass both entityFilter and tickerFilter to calendar
      const dayData = await window.CalendarDataLoader.loadMonthDataWithCache(
        currentYear,
        currentMonth,
        {
          entityFilter: window.currentEntityFilter || 'all',
          tickerFilter: window.currentTickerFilter || null,
          eodPortfolioData, // Pass EOD data to enrich calendar
        },
      );

      // Render using CalendarRenderer
      await window.CalendarRenderer.render(currentYear, currentMonth, dayData);

      // If we have EOD data, enhance the calendar with portfolio snapshots
      if (eodPortfolioData && eodPortfolioData.length > 0) {
        try {
          await enhanceCalendarWithEODData(eodPortfolioData, currentYear, currentMonth);
        } catch (enhanceError) {
          if (window.Logger) {
            window.Logger.warn('⚠️ Failed to enhance calendar with EOD data', {
              error: enhanceError.message,
              recordsCount: eodPortfolioData.length,
              page: PAGE_NAME,
            });
          }
        }
      }

      // Hide loading state
      if (calendarContainer && typeof window.hideLoadingState === 'function') {
        window.hideLoadingState(containerId);
      }
    } catch (error) {
      // Hide loading state on error
      if (calendarContainer && typeof window.hideLoadingState === 'function') {
        window.hideLoadingState(containerId);
      }

      const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
      if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
        window.NotificationSystem.showError('שגיאה בטעינת יומן מסחר',
          `לא ניתן לטעון את היומן. ${errorMsg}`);
      } else if (window.Logger) {
        window.Logger.error('Error loading calendar', { page: PAGE_NAME, error });
      }
      throw error;
    }
  }

  /**
     * Enhance calendar with EOD portfolio data
     *
     * @param {Array} eodPortfolioData - EOD portfolio metrics array
     * @param {number} year - Current year
     * @param {number} month - Current month (0-based)
     */
  async function enhanceCalendarWithEODData(eodPortfolioData, year, month) {
    if (!eodPortfolioData || !Array.isArray(eodPortfolioData)) {
      return;
    }

    // Create a map of date -> EOD data for quick lookup
    const eodDataMap = {};
    eodPortfolioData.forEach(record => {
      if (record && record.date_utc) {
        const dateKey = record.date_utc.split('T')[0]; // YYYY-MM-DD
        eodDataMap[dateKey] = record;
      }
    });

    // Find all calendar day elements
    const dayElements = document.querySelectorAll('.calendar-day, .day-cell, [data-date]');
    if (dayElements.length === 0) {
      if (window.Logger) {
        window.Logger.warn('⚠️ No calendar day elements found for EOD enhancement', {
          dayElementsCount: dayElements.length,
          page: PAGE_NAME,
        });
      }
      return;
    }

    let enhancedCount = 0;
    dayElements.forEach(dayElement => {
      try {
        // Extract date from element (try different selectors)
        let dateStr = null;

        // Try data-date attribute
        if (dayElement.dataset && dayElement.dataset.date) {
          dateStr = dayElement.dataset.date;
        }
        // Try text content or other attributes
        else if (dayElement.textContent && dayElement.textContent.trim()) {
          // Try to extract date from text or other attributes
          const dateMatch = dayElement.textContent.trim().match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            dateStr = dateMatch[1];
          }
        }

        if (dateStr && eodDataMap[dateStr]) {
          const eodRecord = eodDataMap[dateStr];

          // Add EOD indicator to the day element
          const eodIndicator = document.createElement('div');
          eodIndicator.className = 'eod-portfolio-indicator';
          eodIndicator.title = `NAV: $${(eodRecord.nav_total || 0).toLocaleString()}\nP&L: $${(eodRecord.unrealized_pl_amount || 0).toLocaleString()}`;
          eodIndicator.innerHTML = `
                        <small class="text-muted">
                            <i class="fas fa-chart-line"></i>
                            NAV: $${((eodRecord.nav_total || 0) / 1000).toFixed(1)}K
                        </small>
                    `;

          // Add to day element
          dayElement.appendChild(eodIndicator);
          enhancedCount++;
        }
      } catch (elementError) {
        if (window.Logger) {
          window.Logger.warn('⚠️ Failed to enhance calendar day with EOD', {
            error: elementError.message,
            dayElement: dayElement.outerHTML?.substring(0, 100),
            page: PAGE_NAME,
          });
        }
      }
    });

    if (window.Logger) {
      window.Logger.info('✅ Enhanced calendar with EOD portfolio data', {
        totalDays: dayElements.length,
        enhancedDays: enhancedCount,
        eodRecords: eodPortfolioData.length,
        page: PAGE_NAME,
      });
    }
  }

  /**
     * Update month display labels and selectors
     */
  const updateMonthDisplay = () => {
    const label = window.CalendarDateUtils?.formatMonthDisplay(currentYear, currentMonth) ||
                      new Date(currentYear, currentMonth, 1).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
    const monthTitle = document.getElementById('currentMonthYear');
    if (monthTitle) {
      monthTitle.textContent = label;
    }
    const altDisplay = document.getElementById('current-month-display');
    if (altDisplay) {
      altDisplay.textContent = label;
    }
    const monthSelect = document.getElementById('monthSelect');
    if (monthSelect) {
      monthSelect.value = String(currentMonth);
    }
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
      yearSelect.value = String(currentYear);
    }
  }

  /**
     * Initialize month/year selectors for quick navigation
     */
  const initializeMonthYearSelectors = () => {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    if (!monthSelect || !yearSelect) {return;}

    // Populate months (0-11)
    if (!monthSelect.hasChildNodes()) {
      const monthNames = Array.from({ length: 12 }, (_, i) =>
        new Date(2000, i, 1).toLocaleString('he-IL', { month: 'long' }),
      );
      monthNames.forEach((name, idx) => {
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = name;
        monthSelect.appendChild(opt);
      });
    }

    // Populate years (range: currentYear-5 .. currentYear+5)
    if (!yearSelect.hasChildNodes()) {
      const minYear = currentYear - 5;
      const maxYear = currentYear + 5;
      for (let y = maxYear; y >= minYear; y--) {
        const opt = document.createElement('option');
        opt.value = String(y);
        opt.textContent = String(y);
        yearSelect.appendChild(opt);
      }
    }

    // Set current values
    monthSelect.value = String(currentMonth);
    yearSelect.value = String(currentYear);

    // Attach change handlers
    monthSelect.onchange = async e => {
      const newMonth = parseInt(e.target.value, 10);
      await setMonthYear(currentYear, newMonth);
    };
    yearSelect.onchange = async e => {
      const newYear = parseInt(e.target.value, 10);
      await setMonthYear(newYear, currentMonth);
    };
  }

  /**
     * Set month and year, then reload calendar and entries
     */
  const setMonthYear = async (year, month) => {
    currentYear = year;
    currentMonth = month;
    updateMonthDisplay();
    await loadAndRenderCalendar();
    await loadAndRenderJournalEntries();
    await savePageState();
  }

  /**
     * Navigate to previous or next month
     * @param {string} direction - 'prev' or 'next'
     */
  const navigateMonth = async (direction) => {
    const result = window.CalendarDateUtils.navigateMonth(currentYear, currentMonth, direction);
    await setMonthYear(result.year, result.month);

    if (window.Logger) {
      window.Logger.info(`${direction === 'prev' ? 'Previous' : 'Next'} month navigated`, {
        month: currentMonth,
        year: currentYear,
        page: PAGE_NAME,
      });
    }
  }

  /**
     * Navigate to current month (today)
     */
  const navigateToToday = async () => {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();

    // Update display
    const monthDisplay = document.getElementById('current-month-display');
    if (monthDisplay) {
      monthDisplay.textContent = window.CalendarDateUtils.formatMonthDisplay(currentYear, currentMonth);
    }

    // Load and render calendar for current month
    await loadAndRenderCalendar();

    // Reload journal entries for current month
    await loadAndRenderJournalEntries();

    // Save page state
    await savePageState();

    if (window.Logger) {
      window.Logger.info('Navigated to current month', {
        month: currentMonth,
        year: currentYear,
        page: PAGE_NAME,
      });
    }
  }

  /**
     * Filter journal entries by entity type
     * @param {string} entityType - Entity type to filter by ('all', 'execution', 'cash_flow', 'trade', 'trade_plan', 'note', 'alert')
     */
  async function filterJournalByEntityType(entityType) {
    const normalizedType = entityType || 'all';
    window.currentEntityFilter = normalizedType;

    // Update filter buttons
    const filterButtons = document.querySelectorAll('.filter-buttons-container button[data-type]');
    filterButtons.forEach(btn => {
      if (btn.getAttribute('data-type') === normalizedType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Reload calendar with new filter
    await loadAndRenderCalendar();

    // Reload journal entries with new filter
    await loadAndRenderJournalEntries();

    // Save page state
    await savePageState();

    if (window.Logger) {
      window.Logger.info('Journal filtered by entity type', {
        entityType: normalizedType,
        page: PAGE_NAME,
      });
    }
  }

  /**
     * Filter journal entries by ticker
     * @param {string} tickerSymbol - Ticker symbol to filter by (empty string for all)
     */
  async function filterJournalByTicker(tickerSymbol) {
    const normalizedTicker = tickerSymbol || '';
    window.currentTickerFilter = normalizedTicker || null;

    // Reload calendar with new filter
    await loadAndRenderCalendar();

    // Reload journal entries with new filter
    await loadAndRenderJournalEntries();

    // Save page state
    await savePageState();

    if (window.Logger) {
      window.Logger.info('Journal filtered by ticker', {
        ticker: normalizedTicker,
        page: PAGE_NAME,
      });
    }
  }

  /**
     * Load and populate ticker filter dropdown
     */
  async function loadTickerFilter() {
    try {
      const tickerSelect = document.getElementById('tickerFilterSelect');
      if (!tickerSelect) {
        if (window.Logger) {
          window.Logger.warn('Ticker filter select not found', { page: PAGE_NAME });
        }
        return;
      }

      // Use SelectPopulatorService to load tickers with company names
      if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function') {
        await window.SelectPopulatorService.populateTickersSelect(tickerSelect, {
          includeEmpty: true,
          emptyText: 'כל הטיקרים',
        });

        // SelectPopulatorService uses 'id' as value, but we need 'symbol'
        // So we need to fetch tickers again and update values
        try {
          const response = await fetch('/api/tickers/my');
          if (response.ok) {
            const responseData = await response.json();
            const tickers = responseData.data || responseData || [];
            const tickerMap = new Map();
            tickers.forEach(ticker => {
              tickerMap.set(ticker.id, ticker.symbol);
            });

            // Update option values to use symbol instead of id
            Array.from(tickerSelect.options).forEach(option => {
              if (option.value && option.value !== '' && !isNaN(option.value)) {
                const symbol = tickerMap.get(parseInt(option.value));
                if (symbol) {
                  option.value = symbol;
                }
              }
            });
          }
        } catch (error) {
          if (window.Logger) {
            window.Logger.warn('Error updating ticker select values', {
              page: PAGE_NAME,
              error: error?.message || error,
            });
          }
        }

        if (window.Logger) {
          window.Logger.info('Ticker filter loaded via SelectPopulatorService', {
            page: PAGE_NAME,
            tickerCount: tickerSelect.options.length - 1,
          });
        }
      } else {
        // Fallback to TickerService if SelectPopulatorService not available
        let retries = 0;
        while (!window.TickerService && retries < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }

        if (!window.TickerService) {
          if (window.Logger) {
            window.Logger.warn('TickerService not available for ticker filter', { page: PAGE_NAME });
          }
          return;
        }

        const tickers = await window.TickerService.getAllTickers({ force: false });

        // Clear existing options (except "כל הטיקרים")
        while (tickerSelect.options.length > 1) {
          tickerSelect.remove(1);
        }

        // Add ticker options with company names
        if (Array.isArray(tickers) && tickers.length > 0) {
          tickers.forEach(ticker => {
            const option = document.createElement('option');
            option.value = ticker.symbol || ticker;
            const displayName = ticker.name_custom || ticker.name || '';
            option.textContent = displayName ? `${ticker.symbol} - ${displayName}` : ticker.symbol;
            tickerSelect.appendChild(option);
          });
        }
      }

    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error loading ticker filter', {
          page: PAGE_NAME,
          error: error?.message || error,
        });
      }
    }
  }

  /**
     * Render journal entries as table
     */
  async function renderJournalEntriesTable(entries) {
    const tableContainer = document.getElementById('journalEntriesTable');
    if (!tableContainer) {
      if (window.Logger) {
        window.Logger.warn('Journal entries table container not found', { page: PAGE_NAME });
      }
      return;
    }

    // Show table view, hide cards view
    tableContainer.classList.remove('d-none');
    const cardsContainer = document.getElementById('journalEntriesCards');
    if (cardsContainer) {
      cardsContainer.classList.add('d-none');
    }

    const table = document.getElementById('journal-entries-table');
    if (!table) {
      if (window.Logger) {
        window.Logger.warn('Journal entries table not found', { page: PAGE_NAME });
      }
      return;
    }

    // Register table with UnifiedTableSystem if not already registered
    const tableType = 'trading-journal-entries';
    if (window.UnifiedTableSystem && !window.UnifiedTableSystem.registry.isRegistered(tableType)) {
      window.UnifiedTableSystem.registry.register(tableType, {
        dataGetter: () => entries,
        updateFunction: rows => updateJournalEntriesTableBody(rows),
        tableSelector: '#journal-entries-table',
        columns: ['date', 'entity_type', 'status', 'ticker_symbol', 'account_name', 'description'],
        filterable: true,
        sortable: true,
        defaultSort: { columnIndex: 0, direction: 'desc', key: 'date' },
      });

      // Setup sort handlers
      if (window.UnifiedTableSystem?.events?.setupSortHandlers) {
        window.UnifiedTableSystem.events.setupSortHandlers(tableType);
      }
    }

    // Use updateTableWithPagination for proper rendering
    if (window.updateTableWithPagination) {
      await window.updateTableWithPagination({
        tableId: 'journal-entries-table',
        tableType,
        data: entries,
        render: async (pageData, context) => {
          await updateJournalEntriesTableBody(pageData);
        },
        pageSize: 20,
      });
    } else {
      // Fallback to direct rendering
      await updateJournalEntriesTableBody(entries);
    }

    // Replace icons after rendering
    await replaceIconsWithIconSystem();
  }

  /**
     * Render journal entries as cards
     */
  async function renderJournalEntriesCards(entries) {
    const cardsContainer = document.getElementById('journalEntriesCards');
    if (!cardsContainer) {
      if (window.Logger) {
        window.Logger.warn('Journal entries cards container not found', { page: PAGE_NAME });
      }
      return;
    }

    // Show cards view, hide table view
    cardsContainer.classList.remove('d-none');
    const tableContainer = document.getElementById('journalEntriesTable');
    if (tableContainer) {
      tableContainer.classList.add('d-none');
    }

    const cardsList = cardsContainer.querySelector('.journal-entries-list');
    if (!cardsList) {
      if (window.Logger) {
        window.Logger.warn('Journal entries cards list not found', { page: PAGE_NAME });
      }
      return;
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      cardsList.innerHTML = `
                <div class="alert alert-info text-center w-100">
                    <span class="icon-placeholder icon" data-icon="info-circle" data-size="16" data-alt="info-circle" aria-label="info-circle"></span>
                    לא נמצאו רשומות יומן לחודש זה
                </div>
            `;
      await replaceIconsWithIconSystem();
      return;
    }

    // Render cards
    const FieldRenderer = window.FieldRendererService;
    const cardsHTML = entries.map(entry => {
      const date = entry.date || entry.created_at || '';
      const entityType = entry.entity_type || 'unknown';
      const status = entry.status || '';
      const side = entry.side || '';
      const tickerSymbol = entry.ticker_symbol || '';
      const accountName = entry.account_name || '';
      const description = entry.description || entry.summary || entry.content || entry.message || '';

      // Format date (prefer envelope + FieldRenderer)
      const dateEnvelope = getEntryDateEnvelope(entry) || date;
      const dateDisplay = FieldRenderer ?
        FieldRenderer.renderDate(dateEnvelope, true) :
        date ? new Date(date).toLocaleDateString('he-IL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) : '';

      // Get entity label
      const entityLabel = {
        'execution': 'ביצוע',
        'cash_flow': 'תזרים מזומן',
        'trade': entry.subtype === 'trade_created' ? 'טרייד נוצר' : entry.subtype === 'trade_closed' ? 'טרייד נסגר' : 'טרייד',
        'trade_plan': entry.subtype === 'trade_plan_created' ? 'תוכנית נוצרה' : entry.subtype === 'trade_plan_cancelled' ? 'תוכנית בוטלה' : 'תוכנית',
        'note': 'הערה',
        'alert': 'התראה',
      }[entityType] || entityType;

      // Build content based on entity type
      let contentHTML = '';
      if (entityType === 'execution') {
        contentHTML = `
                    <strong>${tickerSymbol || ''}</strong> | 
                    <strong>${side || ''}</strong> | 
                    כמות: <strong>${entry.quantity || ''}</strong> | 
                    מחיר: <strong>${entry.price ? '$' + entry.price : ''}</strong>
                `;
      } else if (entityType === 'cash_flow') {
        contentHTML = `
                    <strong>${entry.type || ''}</strong> | 
                    סכום: <strong>${entry.amount ? '$' + entry.amount : ''}</strong> | 
                    ${description}
                `;
      } else if (entityType === 'trade' || entityType === 'trade_plan') {
        contentHTML = `
                    <strong>${tickerSymbol || ''}</strong> | 
                    ${entry.entry_price ? 'מחיר: <strong>$' + entry.entry_price + '</strong>' : ''}
                    ${description ? ' | ' + description : ''}
                `;
      } else {
        contentHTML = description || '';
      }

      // Build meta items
      const metaItems = [];
      if (tickerSymbol) {
        metaItems.push(`<span class="icon-placeholder icon" data-icon="chart-line" data-size="16"></span> ${tickerSymbol}`);
      }
      if (accountName) {
        metaItems.push(`<span class="icon-placeholder icon" data-icon="wallet" data-size="16"></span> ${accountName}`);
      }
      if (status && entityType !== 'execution') {
        metaItems.push(`<span class="icon-placeholder icon" data-icon="info-circle" data-size="16"></span> ${status}`);
      }
      if (side && entityType === 'execution') {
        metaItems.push(`<span class="icon-placeholder icon" data-icon="arrows-sort" data-size="16"></span> ${side}`);
      }

      return `
                <div class="journal-entry-item" data-entry-type="${entityType}" data-entity-id="${entry.entity_id}">
                    <div class="journal-entry-header">
                        <div>
                            <div class="journal-entry-date">${dateDisplay}</div>
                            <div class="journal-entry-type-badge">
                                ${FieldRenderer ? FieldRenderer.renderLinkedEntity(entityType, null, { short: true }) : entityLabel}
                            </div>
                            <div class="journal-entry-content">${contentHTML}</div>
                            ${metaItems.length > 0 ? `
                                <div class="journal-entry-meta">
                                    ${metaItems.map(item => `<div class="journal-entry-meta-item">${item}</div>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="journal-entry-actions">
                            <button data-button-type="VIEW" data-variant="small" data-icon="/trading-ui/images/icons/tabler/eye.svg" 
                                    data-entity-type="${entityType}"
                                    data-entity-id="${entry.entity_id}"
                                    data-onclick="if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClickById) { window.tradingJournalPage.handleEntryClickById('${entityType}', ${entry.entity_id}); }" 
                                    title="צפה בפרטים"></button>
                        </div>
                    </div>
                </div>
            `;
    }).join('');

    cardsList.innerHTML = cardsHTML;

    // Replace icons after rendering
    await replaceIconsWithIconSystem();
  }

  /**
     * Switch between table and cards view
     */
  async function switchViewMode(mode) {
    window.tradingJournalViewMode = mode;

    // Update button states
    const cardsBtn = document.getElementById('viewModeCardsBtn');
    const tableBtn = document.getElementById('viewModeTableBtn');
    if (cardsBtn && tableBtn) {
      if (mode === 'cards') {
        cardsBtn.classList.add('active');
        tableBtn.classList.remove('active');
      } else {
        tableBtn.classList.add('active');
        cardsBtn.classList.remove('active');
      }
    }

    // Render based on mode
    const entries = window.tradingJournalEntries || [];
    if (mode === 'table') {
      await renderJournalEntriesTable(entries);
    } else {
      await renderJournalEntriesCards(entries);
    }
  }

  /**
     * Generate entity type filter buttons using related-object-filters system
     */
  async function generateEntityTypeFilterButtons() {
    try {
      // Wait for generateEntityTypeFilterButton to be available
      let retries = 0;
      while (typeof window.generateEntityTypeFilterButton === 'undefined' && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (typeof window.generateEntityTypeFilterButton === 'undefined') {
        if (window.Logger) {
          window.Logger.warn('generateEntityTypeFilterButton not available', { page: PAGE_NAME });
        }
        return;
      }

      const container = document.getElementById('entityTypeFilterButtons');
      if (!container) {
        if (window.Logger) {
          window.Logger.warn('Entity type filter buttons container not found', { page: PAGE_NAME });
        }
        return;
      }

      // Entity types to show
      const entityTypes = [
        { type: 'all', label: 'הכל' },
        { type: 'trade', label: 'טריידים' },
        { type: 'trade_plan', label: 'תוכניות' },
        { type: 'execution', label: 'ביצועים' },
        { type: 'note', label: 'הערות' },
        { type: 'cash_flow', label: 'תזרימי מזומנים' },
        { type: 'alert', label: 'התראות' },
      ];

      // Icon mappings for entity types
      const iconMappings = {
        all: '/trading-ui/images/icons/tabler/settings.svg',
        trade: '/trading-ui/images/icons/entities/trades.svg',
        trade_plan: '/trading-ui/images/icons/entities/trade_plans.svg',
        execution: '/trading-ui/images/icons/entities/executions.svg',
        note: '/trading-ui/images/icons/entities/notes.svg',
        cash_flow: '/trading-ui/images/icons/entities/cash_flows.svg',
        alert: '/trading-ui/images/icons/entities/alerts.svg',
      };

      // Entity labels
      const entityLabels = {
        all: 'הכל',
        trade: 'טריידים',
        trade_plan: 'תוכניות',
        execution: 'ביצועים',
        note: 'הערות',
        cash_flow: 'תזרימי מזומנים',
        alert: 'התראות',
      };

      const currentFilter = window.currentEntityFilter || 'all';

      // Generate buttons HTML using ButtonSystem
      let buttonsHTML = '';

      entityTypes.forEach(({ type, label }) => {
        const iconPath = iconMappings[type] || '/trading-ui/images/icons/entities/home.svg';
        const entityLabel = entityLabels[type] || label;
        const isActive = type === currentFilter;

        buttonsHTML += `
                    <button
                        data-button-type="FILTER"
                        data-variant="small"
                        data-icon="${iconPath}"
                        data-classes="btn-sm ${isActive ? 'active' : ''} filter-icon-btn"
                        data-onclick="window.filterJournalByEntityType('${type}')"
                        data-type="${type}"
                        title="${entityLabel}"
                        data-tooltip="סינון לפי: ${entityLabel}"
                        data-tooltip-placement="top"
                        data-tooltip-trigger="hover">
                    </button>
                `;
      });

      container.innerHTML = buttonsHTML;

      // ButtonSystem will process these buttons automatically

    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error generating entity type filter buttons', {
          page: PAGE_NAME,
          error: error?.message || error,
        });
      }
    }
  }

  /**
     * Load and render journal entries for current month
     */
  async function loadAndRenderJournalEntries() {
    try {
      // Get date range for current month
      const { start, end } = window.CalendarDateUtils?.getMonthDateRange(currentYear, currentMonth) ||
                                  { start: new Date(currentYear, currentMonth, 1), end: new Date(currentYear, currentMonth + 1, 0) };

      // Wait for TradingJournalData to be available
      let retries = 0;
      while (!window.TradingJournalData && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!window.TradingJournalData) {
        throw new Error('TradingJournalData service not available after waiting');
      }

      const entityFilter = window.currentEntityFilter || 'all';

      // Use full ISO with end-of-day to avoid excluding last-day entries
      const startISO = new Date(start);
      startISO.setHours(0, 0, 0, 0);
      const endISO = new Date(end);
      endISO.setHours(23, 59, 59, 999);

      const result = await window.TradingJournalData.loadEntries({
        start_date: startISO.toISOString(),
        end_date: endISO.toISOString(),
      }, {
        entity_type: entityFilter === 'all' ? 'all' : entityFilter,
        ticker_symbol: window.currentTickerFilter || null,
      }, {
        force: false,
      });

      const entries = result?.entries || [];

      // Hard guard: ensure we only keep entries within the currently displayed month
      const entriesForMonth = entries.filter(entry => {
        const d = entryToDate(entry);
        return d && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });

      // Store entries globally for view switching
      window.tradingJournalEntries = entriesForMonth;

      // Render based on current view mode (default: cards)
      const currentViewMode = window.tradingJournalViewMode || 'cards';
      if (currentViewMode === 'table') {
        await renderJournalEntriesTable(entries);
      } else {
        await renderJournalEntriesCards(entries);
      }

    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error loading journal entries', {
          page: PAGE_NAME,
          error: error?.message || error,
        });
      }

      const noEntriesMsg = document.getElementById('noEntriesMessage');
      if (noEntriesMsg) {
        noEntriesMsg.classList.remove('d-none');
        noEntriesMsg.innerHTML = `
                    <span class="icon-placeholder icon" data-icon="alert-circle" data-size="16" data-alt="error" aria-label="error"></span>
                    שגיאה בטעינת רשומות יומן: ${error?.message || 'שגיאה לא ידועה'}
                `;
      }

      if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה בטעינת יומן מסחר',
          `לא ניתן לטעון את רשומות היומן. ${error?.message || 'שגיאה לא ידועה'}`);
      }
    }
  }

  /**
     * Update journal entries table body
     */
  async function updateJournalEntriesTableBody(entries) {
    // Wait a bit for DOM to be ready
    let table = document.getElementById('journal-entries-table');
    let retries = 0;
    while (!table && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      table = document.getElementById('journal-entries-table');
      retries++;
    }

    if (!table) {
      // Try to find the container and create table if needed
      const container = document.getElementById('journalEntriesList');
      if (container) {
        // Create table structure
        // Table should already exist in HTML, just find it
        const existingTable = document.getElementById('journal-entries-table');
        if (!existingTable) {
          container.innerHTML = `
                        <table id="journal-entries-table" class="table table-striped table-hover" data-table-type="trading-journal-entries">
                            <thead>
                                <tr>
                                    <th>
                                        <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="תאריך" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trading-journal-entries', 0)"></button>
                                    </th>
                                    <th>
                                        <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="סוג" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trading-journal-entries', 1)"></button>
                                    </th>
                                    <th>
                                        <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="סטטוס" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trading-journal-entries', 2)"></button>
                                    </th>
                                    <th>
                                        <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="טיקר" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trading-journal-entries', 3)"></button>
                                    </th>
                                    <th>
                                        <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="חשבון" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trading-journal-entries', 4)"></button>
                                    </th>
                                    <th>
                                        <button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="תיאור" data-classes="btn-link sortable-header px-0" data-onclick="window.sortTable('trading-journal-entries', 5)"></button>
                                    </th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    `;
        }
        table = document.getElementById('journal-entries-table');
      }
    }

    if (!table) {
      if (window.Logger) {
        window.Logger.warn('Journal entries table not found and could not be created', { page: PAGE_NAME });
      }
      return;
    }

    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="alert alert-info mb-0">
                            <span class="icon-placeholder icon" data-icon="info-circle" data-size="16" data-alt="info-circle" aria-label="info-circle"></span>
                            לא נמצאו רשומות יומן
                        </div>
                    </td>
                </tr>
            `;
      await replaceIconsWithIconSystem();
      return;
    }

    const FieldRenderer = window.FieldRendererService;
    const rowsHTML = entries.map(entry => {
      const date = entry.date || entry.created_at || '';
      const entityType = entry.entity_type || 'unknown';
      const status = entry.status || '';
      const side = entry.side || '';
      const tickerSymbol = entry.ticker_symbol || '';
      const accountName = entry.account_name || '';
      const description = entry.description || entry.summary || '';

      // Render date using FieldRendererService with envelope normalization
      const dateEnvelope = getEntryDateEnvelope(entry) || date;
      const dateCell = FieldRenderer ?
        FieldRenderer.renderDate(dateEnvelope, true) :
        date ? new Date(date).toLocaleString('he-IL') : '';

      // Render entity type using FieldRendererService
      const entityTypeCell = FieldRenderer ?
        FieldRenderer.renderLinkedEntity(entityType, null, { short: true }) :
        entityType;

      // Render status using FieldRendererService
      // For executions, include side in status cell if available
      let statusCell = '';
      if (entityType === 'execution' && side && FieldRenderer) {
        // For executions, show side in status column
        statusCell = FieldRenderer.renderSide(side);
      } else if (status && FieldRenderer) {
        statusCell = FieldRenderer.renderStatus(status, entityType);
      } else {
        statusCell = status || '';
      }

      // Render ticker - just display the symbol (no special rendering needed for simple symbol)
      const tickerCell = tickerSymbol || '';

      return `
                <tr data-entry-type="${entityType}" 
                    data-entity-id="${entry.entity_id}"
                    style="cursor: pointer;"
                    data-onclick="if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClickById) { window.tradingJournalPage.handleEntryClickById('${entityType}', ${entry.entity_id}); }">
                    <td>${dateCell}</td>
                    <td>${entityTypeCell}</td>
                    <td>${statusCell}</td>
                    <td>${tickerCell}</td>
                    <td>${accountName}</td>
                    <td>${description}</td>
                    <td>
                        <button data-button-type="VIEW" data-variant="small" data-icon="/trading-ui/images/icons/tabler/eye.svg" 
                                data-entity-type="${entityType}"
                                data-entity-id="${entry.entity_id}"
                                data-onclick="event.stopPropagation(); if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClickById) { window.tradingJournalPage.handleEntryClickById('${entityType}', ${entry.entity_id}); }" 
                                title="צפה בפרטים"></button>
                    </td>
                </tr>
            `;
    }).join('');

    tbody.innerHTML = rowsHTML;

    // Add double-click handler to rows
    tbody.querySelectorAll('tr[data-entity-id]').forEach(row => {
      row.addEventListener('dblclick', e => {
        e.stopPropagation();
        const entityType = row.getAttribute('data-entry-type');
        const entityId = row.getAttribute('data-entity-id');
        if (entityType && entityId && window.tradingJournalPage && window.tradingJournalPage.handleDoubleClickEntry) {
          const entry = entries.find(e => e.entity_type === entityType && e.entity_id == entityId);
          if (entry) {
            window.tradingJournalPage.handleDoubleClickEntry(entry);
          }
        }
      });
    });

    // Replace icons after rendering
    await replaceIconsWithIconSystem();
  }

  /**
     * Handle click on journal entry by ID (finds entry from stored entries)
     * @param {string} entityType - Entity type
     * @param {number|string} entityId - Entity ID
     */
  async function handleEntryClickById(entityType, entityId) {
    if (!entityType || !entityId) {
      if (window.Logger) {
        window.Logger.warn('Invalid parameters for handleEntryClickById', { page: PAGE_NAME, entityType, entityId });
      }
      return;
    }

    // Find entry from stored entries (check both main entries and day zoom entries)
    const entries = window.tradingJournalEntries || window.tradingJournalDayZoomEntries || [];
    const entry = entries.find(e => e.entity_type === entityType && e.entity_id == entityId);

    if (!entry) {
      if (window.Logger) {
        window.Logger.warn('Entry not found for handleEntryClickById', { page: PAGE_NAME, entityType, entityId });
      }
      // Fallback: open entity details directly
      if (window.showEntityDetails && typeof window.showEntityDetails === 'function') {
        await window.showEntityDetails(entityType, entityId, {
          mode: 'view',
          sourceInfo: {
            sourceModal: 'trading-journal',
            sourceType: 'journal_entry',
            sourceId: entityId,
          },
        });
      }
      return;
    }

    // Use existing handleEntryClick function
    await handleEntryClick(entry);
  }

  /**
     * Handle click on journal entry
     */
  async function handleEntryClick(entry) {
    if (!entry || !entry.entity_type || !entry.entity_id) {
      if (window.Logger) {
        window.Logger.warn('Invalid entry for handleEntryClick', { page: PAGE_NAME, entry });
      }
      return;
    }

    // Open entity details
    if (window.showEntityDetails && typeof window.showEntityDetails === 'function') {
      try {
        await window.showEntityDetails(entry.entity_type, entry.entity_id, {
          mode: 'view',
          sourceInfo: {
            sourceModal: 'trading-journal',
            sourceType: 'journal_entry',
            sourceId: entry.id || entry.entity_id,
          },
        });
      } catch (error) {
        if (window.Logger) {
          window.Logger.error('Error opening entity details', { page: PAGE_NAME, error, entry });
        }
        if (window.NotificationSystem) {
          window.NotificationSystem.showError('שגיאה', 'לא ניתן לפתוח פרטי רשומה: ' + (error?.message || 'שגיאה לא ידועה'));
        }
      }
    } else {
      if (window.Logger) {
        window.Logger.warn('showEntityDetails not available', { page: PAGE_NAME });
      }
      if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה', 'מערכת פרטי ישויות לא זמינה');
      }
    }
  }

  /**
     * Zoom to specific day - show entries for that day in a modal
     */
  async function zoomToDay(day, month, year) {
    if (window.Logger) {
      window.Logger.info('Zooming to day', { page: PAGE_NAME, day, month, year });
    }

    // Get date range for the day
    const date = new Date(year, month, day);
    const startDate = new Date(year, month, day);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, day);
    endDate.setHours(23, 59, 59, 999);

    // Full ISO to preserve time range (avoid truncating to 00:00)
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    try {
      const entityFilter = window.currentEntityFilter || 'all';
      const tickerFilter = window.currentTickerFilter || null;

      // Try to reuse already-loaded month data to keep parity across views
      const fromCache = Array.isArray(window.tradingJournalEntries) ? window.tradingJournalEntries : [];
      const entriesFromCache = fromCache.filter(entry => {
        const d = window.CalendarDateUtils?.parseDate(entry.date || entry.created_at) || new Date(entry.date || entry.created_at);
        if (!d || isNaN(d.getTime())) {return false;}
        const sameDay = d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        const matchEntity = entityFilter === 'all' || entry.entity_type === entityFilter;
        const matchTicker = !tickerFilter || entry.ticker_symbol === tickerFilter;
        return sameDay && matchEntity && matchTicker;
      });

      let entries = entriesFromCache;

      // Fallback: fetch for the day if cache empty (keeps filters)
      if (!entries || entries.length === 0) {
        const result = await window.TradingJournalData.loadEntries({
          start_date: startDateStr,
          end_date: endDateStr,
        }, {
          entity_type: entityFilter === 'all' ? 'all' : entityFilter,
          ticker_symbol: tickerFilter,
        }, {
          force: false,
        });

        // Keep only entries that truly fall inside this day (timezone-safe)
        const dayStart = new Date(startDate);
        const dayEnd = new Date(endDate);
        entries = (result?.entries || []).filter(entry => {
          const d = window.CalendarDateUtils?.parseDate(entry.date || entry.created_at) || new Date(entry.date || entry.created_at);
          return d && !isNaN(d.getTime()) && d >= dayStart && d <= dayEnd;
        });
      }

      if (entries.length === 0) {
        if (window.NotificationSystem) {
          window.NotificationSystem.showInfo('אין רשומות', `לא נמצאו רשומות יומן ליום ${day}/${month + 1}/${year}`);
        }
        return;
      }

      // Format date for display
      const dateDisplay = date.toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // Create modal content with entries
      const modalId = 'tradingJournalDayZoomModal';
      const modalContent = `
                <div class="modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <span class="icon-placeholder icon" data-icon="calendar" data-size="16"></span>
                                    רשומות יומן - ${dateDisplay}
                                </h5>
                                <button data-button-type="CLOSE" data-variant="small" data-attributes="data-bs-dismiss='modal' type='button'"></button>
                            </div>
                            <div class="modal-body">
                                <div id="dayZoomEntriesContainer">
                                    <div class="text-center py-4">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">טוען...</span>
                                        </div>
                                        <p class="mt-2">טוען רשומות...</p>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button data-button-type="CLOSE" data-attributes="data-bs-dismiss='modal' type='button'"></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

      // Remove existing modal if any
      const existingModal = document.getElementById(modalId);
      if (existingModal) {
        existingModal.remove();
      }

      // Add modal to body
      document.body.insertAdjacentHTML('beforeend', modalContent);

      // Store entries for handleEntryClickById
      window.tradingJournalDayZoomEntries = entries;

      // Render entries in modal - use table view
      const container = document.getElementById('dayZoomEntriesContainer');
      if (container) {
        // Render as table for better view in modal
        await renderJournalEntriesTableForModal(entries, container);
      }

      // Show modal using ModalManagerV2
      const modalElement = document.getElementById(modalId);
      if (modalElement && window.ModalManagerV2) {
        // Cleanup backdrops before opening
        if (window.ModalManagerV2._cleanupBootstrapBackdrops) {
          window.ModalManagerV2._cleanupBootstrapBackdrops();
        }

        await window.ModalManagerV2.showModal(modalId, 'view');

        // Update z-index
        if (window.ModalZIndexManager && typeof window.ModalZIndexManager.forceUpdate === 'function') {
          requestAnimationFrame(() => {
            window.ModalZIndexManager.forceUpdate(modalElement);
          });
        }
      } else if (modalElement && window.bootstrap?.Modal) {
        // Fallback to Bootstrap
        const modal = new window.bootstrap.Modal(modalElement, { backdrop: true });
        modal.show();
      }

    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error zooming to day', { page: PAGE_NAME, error, day, month, year });
      }
      if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה', `לא ניתן לטעון רשומות ליום: ${error?.message || 'שגיאה לא ידועה'}`);
      }
    }
  }

  /**
     * Render journal entries as table for modal view (summary + pagination)
     */
  async function renderJournalEntriesTableForModal(entries, container) {
    if (!Array.isArray(entries) || entries.length === 0) {
      container.innerHTML = `
                <div class="alert alert-info text-center w-100">
                    <span class="icon-placeholder icon" data-icon="info-circle" data-size="16" data-alt="info-circle" aria-label="info-circle"></span>
                    לא נמצאו רשומות יומן
                </div>
            `;
      await replaceIconsWithIconSystem();
      return;
    }

    const FieldRenderer = window.FieldRendererService;
    const pageSize = 10;
    const typeLabels = {
      execution: 'ביצועים',
      trade: 'טריידים',
      trade_plan: 'תוכניות',
      note: 'הערות',
      alert: 'התראות',
      cash_flow: 'תזרימי מזומנים',
      other: 'אחר',
    };
    const typeIcons = {
      execution: 'activity',
      trade: 'trades',
      trade_plan: 'clipboard-list',
      note: 'note',
      alert: 'bell',
      cash_flow: 'cash',
      other: 'list',
    };

    const counts = entries.reduce((acc, entry) => {
      const t = entry.entity_type || 'other';
      acc[t] = (acc[t] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, {});

    const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
    let currentPage = 1;

    const renderPage = async page => {
      currentPage = Math.min(Math.max(page, 1), totalPages);
      const start = (currentPage - 1) * pageSize;
      const pageEntries = entries.slice(start, start + pageSize);

      const summaryHTML = `
                <div class="d-flex flex-wrap gap-2 mb-3">
                    ${['execution', 'trade', 'trade_plan', 'note', 'alert', 'cash_flow', 'other'].map(type => {
    const count = counts[type] || 0;
    if (count === 0) {return '';}
    const icon = typeIcons[type] || 'list';
    const label = typeLabels[type] || type;
    return `
                            <span class="badge bg-light text-dark d-flex align-items-center gap-1" data-type="${type}">
                                <span class="icon-placeholder icon" data-icon="${icon}" data-size="14"></span>
                                ${label}: ${count}
                            </span>
                        `;
  }).join('')}
                    <span class="badge bg-primary text-light">סה\"כ: ${counts.total || entries.length}</span>
                </div>
            `;

      const tableHTML = `
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>תאריך</th>
                            <th>סוג</th>
                            <th>סטטוס</th>
                            <th>טיקר</th>
                            <th>חשבון</th>
                            <th>תיאור</th>
                            <th>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageEntries.map(entry => {
    const date = entry.date || entry.created_at || '';
    const entityType = entry.entity_type || 'unknown';
    const status = entry.status || '';
    const tickerSymbol = entry.ticker_symbol || '';
    const accountName = entry.account_name || '';
    const description = entry.description || entry.summary || entry.content || entry.message || '';

    // Format date
    const dateEnvelope = getEntryDateEnvelope(entry) || date;
    const dateDisplay = FieldRenderer ?
      FieldRenderer.renderDate(dateEnvelope, true) :
      date ? new Date(date).toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) : '';

    return `
                                <tr data-entry-type="${entityType}" data-entity-id="${entry.entity_id}">
                                    <td>${dateDisplay}</td>
                                    <td>${FieldRenderer ? FieldRenderer.renderLinkedEntity(entityType, null, { short: true }) : entityType}</td>
                                    <td>${FieldRenderer && status ? FieldRenderer.renderStatus(status, entityType) : status || '-'}</td>
                                    <td>${tickerSymbol || '-'}</td>
                                    <td>${accountName || '-'}</td>
                                    <td>${description || '-'}</td>
                                    <td>
                                        <button 
                                            data-button-type="VIEW" 
                                            data-variant="small" 
                                            data-icon="/trading-ui/images/icons/tabler/eye.svg" 
                                            data-entity-type="${entityType}"
                                            data-entity-id="${entry.entity_id}"
                                            data-onclick="if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClickById) { window.tradingJournalPage.handleEntryClickById('${entityType}', ${entry.entity_id}); }" 
                                            title="צפה בפרטים">
                                        </button>
                                    </td>
                                </tr>
                            `;
  }).join('')}
                    </tbody>
                </table>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="small text-muted">דף ${currentPage} מתוך ${totalPages}</div>
                    <div class="d-flex align-items-center gap-2">
                        <button data-button-type="NAV" data-variant="small" data-icon="chevron-right" data-text="הקודם" ${currentPage === 1 ? 'disabled' : ''} data-action="prev-page"></button>
                        <button data-button-type="NAV" data-variant="small" data-icon="chevron-left" data-text="הבא" ${currentPage === totalPages ? 'disabled' : ''} data-action="next-page"></button>
                    </div>
                </div>
            `;

      container.innerHTML = `${summaryHTML}${tableHTML}`;

      // Replace icons after rendering
      await replaceIconsWithIconSystem();

      // Process buttons with ButtonSystem - wait a bit for DOM to settle
      setTimeout(() => {
        if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtonElement === 'function') {
          const buttons = container.querySelectorAll('button[data-button-type]');
          buttons.forEach((btn, index) => {
            if (!btn.hasAttribute('data-button-processed')) {
              try {
                window.advancedButtonSystem.processButtonElement(btn, index);
              } catch (error) {
                if (window.Logger) {
                  window.Logger.warn('Error processing button in modal', {
                    page: PAGE_NAME,
                    error: error?.message || error,
                  });
                }
              }
            }
          });
        } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
          window.advancedButtonSystem.processButtons(container);
        } else if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
          window.ButtonSystem.initializeButtons();
        }
      }, 50);

      // Pagination handlers
      const prevBtn = container.querySelector('button[data-action="prev-page"]');
      const nextBtn = container.querySelector('button[data-action="next-page"]');
      if (prevBtn) {
        prevBtn.addEventListener('click', e => {
          e.stopPropagation();
          renderPage(currentPage - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', e => {
          e.stopPropagation();
          renderPage(currentPage + 1);
        });
      }
    };

    await renderPage(1);
  }

  /**
     * Render journal entries as cards for modal view (deprecated - use table)
     */
  async function renderJournalEntriesCardsForModal(entries, container) {
    if (!Array.isArray(entries) || entries.length === 0) {
      container.innerHTML = `
                <div class="alert alert-info text-center w-100">
                    <span class="icon-placeholder icon" data-icon="info-circle" data-size="16" data-alt="info-circle" aria-label="info-circle"></span>
                    לא נמצאו רשומות יומן
                </div>
            `;
      await replaceIconsWithIconSystem();
      return;
    }

    // Render cards (similar to renderJournalEntriesCards but for modal)
    const FieldRenderer = window.FieldRendererService;
    const cardsHTML = entries.map(entry => {
      const date = entry.date || entry.created_at || '';
      const entityType = entry.entity_type || 'unknown';
      const status = entry.status || '';
      const side = entry.side || '';
      const tickerSymbol = entry.ticker_symbol || '';
      const accountName = entry.account_name || '';
      const description = entry.description || entry.summary || entry.content || entry.message || '';

      // Format date
      const dateDisplay = date ? new Date(date).toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) : '';

      // Get entity label
      const entityLabel = {
        'execution': 'ביצוע',
        'cash_flow': 'תזרים מזומן',
        'trade': entry.subtype === 'trade_created' ? 'טרייד נוצר' : entry.subtype === 'trade_closed' ? 'טרייד נסגר' : 'טרייד',
        'trade_plan': entry.subtype === 'trade_plan_created' ? 'תוכנית נוצרה' : entry.subtype === 'trade_plan_cancelled' ? 'תוכנית בוטלה' : 'תוכנית',
        'note': 'הערה',
        'alert': 'התראה',
      }[entityType] || entityType;

      // Build content based on entity type
      let contentHTML = '';
      if (entityType === 'execution') {
        contentHTML = `
                    <strong>${tickerSymbol || ''}</strong> | 
                    <strong>${side || ''}</strong> | 
                    כמות: <strong>${entry.quantity || ''}</strong> | 
                    מחיר: <strong>${entry.price ? '$' + entry.price : ''}</strong>
                `;
      } else if (entityType === 'cash_flow') {
        contentHTML = `
                    <strong>${entry.type || ''}</strong> | 
                    סכום: <strong>${entry.amount ? '$' + entry.amount : ''}</strong> | 
                    ${description}
                `;
      } else if (entityType === 'trade' || entityType === 'trade_plan') {
        contentHTML = `
                    <strong>${tickerSymbol || ''}</strong> | 
                    ${entry.entry_price ? 'מחיר: <strong>$' + entry.entry_price + '</strong>' : ''}
                    ${description ? ' | ' + description : ''}
                `;
      } else {
        contentHTML = description || '';
      }

      return `
                <div class="journal-entry-item mb-3" data-entry-type="${entityType}" data-entity-id="${entry.entity_id}">
                    <div class="journal-entry-header">
                        <div>
                            <div class="journal-entry-date">${dateDisplay}</div>
                            <div class="journal-entry-type-badge">
                                ${FieldRenderer ? FieldRenderer.renderLinkedEntity(entityType, null, { short: true }) : entityLabel}
                            </div>
                            <div class="journal-entry-content">${contentHTML}</div>
                        </div>
                        <div class="journal-entry-actions">
                            <button data-button-type="VIEW" data-variant="small" data-icon="/trading-ui/images/icons/tabler/eye.svg" 
                                    data-entity-type="${entityType}"
                                    data-entity-id="${entry.entity_id}"
                                    data-onclick="if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClickById) { window.tradingJournalPage.handleEntryClickById('${entityType}', ${entry.entity_id}); }" 
                                    title="צפה בפרטים"></button>
                        </div>
                    </div>
                </div>
            `;
    }).join('');

    container.innerHTML = `<div class="journal-entries-list">${cardsHTML}</div>`;

    // Replace icons after rendering
    await replaceIconsWithIconSystem();
  }

  /**
     * Handle double click on journal entry - open entity details
     */
  async function handleDoubleClickEntry(entry) {
    await handleEntryClick(entry);
  }

  /**
     * Navigate to previous month
     */
  async function prevMonth() {
    await navigateMonth('prev');
  }

  /**
     * Navigate to next month
     */
  async function nextMonth() {
    await navigateMonth('next');
  }

  /**
     * Setup lazy loading for activity chart
     * Chart will only load when the section is opened
     */
  const setupActivityChartLazyLoading = () => {
    const chartSection = document.querySelector('[data-section="activity-chart-section"]');
    if (!chartSection) {
      if (window.Logger) {
        window.Logger.warn('Activity chart section not found', { page: PAGE_NAME });
      }
      return;
    }

    const sectionBody = chartSection.querySelector('.section-body');
    if (!sectionBody) {
      if (window.Logger) {
        window.Logger.warn('Activity chart section body not found', { page: PAGE_NAME });
      }
      return;
    }

    // Check if chart is already loaded
    let chartLoaded = false;

    // Listen for section opening using MutationObserver
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const isVisible = sectionBody.style.display !== 'none' &&
                                    sectionBody.style.display !== '' &&
                                    !sectionBody.classList.contains('d-none');
          if (isVisible && !chartLoaded) {
            chartLoaded = true;
            loadAndRenderActivityChart().catch(error => {
              if (window.Logger) {
                window.Logger.error('Error loading activity chart (lazy)', {
                  page: PAGE_NAME,
                  error: error?.message || error,
                });
              }
            });
            observer.disconnect(); // Stop observing after first load
          }
        }
      });
    });

    observer.observe(sectionBody, { attributes: true, attributeFilter: ['style'] });

    // Also check initial state
    const isInitiallyVisible = sectionBody.style.display !== 'none' &&
                                  sectionBody.style.display !== '' &&
                                  !sectionBody.classList.contains('d-none');
    if (isInitiallyVisible && !chartLoaded) {
      chartLoaded = true;
      loadAndRenderActivityChart().catch(error => {
        if (window.Logger) {
          window.Logger.error('Error loading activity chart (initial)', {
            page: PAGE_NAME,
            error: error?.message || error,
          });
        }
      });
      observer.disconnect();
    }
  }

  /**
     * Handle activity chart section toggle
     */
  const handleActivityChartToggle = async () => {
    const chartSection = document.querySelector('[data-section="activity-chart-section"]');
    if (!chartSection) {return;}

    const sectionBody = chartSection.querySelector('.section-body');
    if (!sectionBody) {return;}

    const isVisible = sectionBody.style.display !== 'none' &&
                        sectionBody.style.display !== '' &&
                        !sectionBody.classList.contains('d-none');
    if (isVisible) {
      // Section is opening - load chart if not already loaded
      const container = document.getElementById('activity-chart-container');
      if (container && !container.querySelector('canvas') && !container.querySelector('.alert')) {
        await loadAndRenderActivityChart();
      }
    }
  }

  /**
     * Load and render activity chart
     */
  const loadAndRenderActivityChart = async () => {
    const container = document.getElementById('activity-chart-container');
    if (!container) {
      if (window.Logger) {
        window.Logger.warn('Activity chart container not found', { page: PAGE_NAME });
      }
      return;
    }

    try {
      // Wait for TradingViewChartAdapter to be available
      let retries = 0;
      while ((!window.TradingViewChartAdapter || !window.LightweightCharts) && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!window.TradingViewChartAdapter || !window.LightweightCharts) {
        throw new Error('TradingView chart libraries not available after waiting');
      }

      // Wait for TradingJournalData to be available
      if (!window.TradingJournalData) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!window.TradingJournalData) {
        throw new Error('TradingJournalData service not available');
      }

      // Get date range - from 2020-01-01 to today (all available data)
      const startDate = '2020-01-01';
      const endDate = new Date().toISOString().split('T')[0];
      const tickerFilter = window.currentTickerFilter || null;

      // Load activity statistics
      const result = await window.TradingJournalData.loadStatistics({
        start_date: startDate,
        end_date: endDate,
      }, {
        ticker_symbol: tickerFilter,
      });

      const stats = result?.stats || [];

      if (stats.length === 0) {
        container.innerHTML = `
                    <div class="alert alert-info text-center">
                        <span class="icon-placeholder icon" data-icon="info-circle" data-size="16" data-alt="info-circle" aria-label="info-circle"></span>
                        לא נמצאו נתוני פעילות לתצוגה
                    </div>
                `;
        await replaceIconsWithIconSystem();
        return;
      }

      // Clear container
      container.innerHTML = '';

      // Create chart
      const chart = window.TradingViewChartAdapter.createChart(container, {
        width: container.offsetWidth,
        height: 400,
        layout: {
          background: { color: 'transparent' },
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#e0e0e0' },
          horzLines: { color: '#e0e0e0' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Add executions series (bar chart)
      const executionsSeries = window.TradingViewChartAdapter.addHistogramSeries(chart, {
        color: '#26baac',
        title: 'ביצועים',
      });

      // Add planning series (bar chart)
      const planningSeries = window.TradingViewChartAdapter.addHistogramSeries(chart, {
        color: '#fc5a06',
        title: 'תכנון',
      });

      // Helper function to convert date to TradingView format (yyyy-mm-dd)
      const convertDateToChartTime = dateValue => {
        if (!dateValue) {return null;}

        // If it's already a string in yyyy-mm-dd format
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }

        // If it's a Date object
        if (dateValue instanceof Date) {
          return dateValue.toISOString().split('T')[0];
        }

        // If it's a DateEnvelope object
        if (typeof dateValue === 'object' && dateValue.utc) {
          return dateValue.utc.split('T')[0];
        }

        // If it's a string, try to parse it
        if (typeof dateValue === 'string') {
          // Try ISO format first
          if (dateValue.includes('T')) {
            return dateValue.split('T')[0];
          }
          // Try dd.mm.yyyy format
          if (/^\d{2}\.\d{2}\.\d{4}/.test(dateValue)) {
            const datePart = dateValue.split(' ')[0];
            const [day, month, year] = datePart.split('.');
            return `${year}-${month}-${day}`;
          }
          // Try to parse as Date
          const parsed = new Date(dateValue);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
          }
        }

        return null;
      };

      // Transform data for chart
      // Note: Backend returns 'period' field, not 'date'
      const executionsData = stats
        .map(stat => {
          const time = convertDateToChartTime(stat.period || stat.date);
          if (!time) {return null;}
          return {
            time,
            value: stat.executions_count || 0,
          };
        })
        .filter(item => item !== null);

      const planningData = stats
        .map(stat => {
          const time = convertDateToChartTime(stat.period || stat.date);
          if (!time) {return null;}
          return {
            time,
            value: stat.planning_count || 0,
          };
        })
        .filter(item => item !== null);

      // Set data
      executionsSeries.setData(executionsData);
      planningSeries.setData(planningData);

      // Fit content
      chart.timeScale().fitContent();

    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error loading activity chart', {
          page: PAGE_NAME,
          error: error?.message || error,
        });
      }

      if (container) {
        container.innerHTML = `
                    <div class="alert alert-danger text-center">
                        <span class="icon-placeholder icon" data-icon="alert-circle" data-size="16" data-alt="error" aria-label="error"></span>
                        שגיאה בטעינת גרף פעילות: ${error?.message || 'שגיאה לא ידועה'}
                    </div>
                `;
      }
    }
  }

  // Export functions to window
  window.tradingJournalPage = {
    navigateMonth,
    prevMonth,
    nextMonth,
    navigateToToday,
    filterJournalByEntityType,
    loadAndRenderCalendar,
    loadAndRenderJournalEntries,
    renderJournalEntriesTable,
    renderJournalEntriesCards,
    switchViewMode,
    loadAndRenderActivityChart,
    setupActivityChartLazyLoading,
    handleActivityChartToggle,
    handleEntryClick,
    handleEntryClickById,
    handleDoubleClickEntry,
    zoomToDay,
    updateJournalEntriesTableBody,
    filterJournalByTicker,
    loadTickerFilter,
    currentMonth: () => currentMonth,
    currentYear: () => currentYear,
  };

  // Make filter functions available globally (for HTML onclick)
  window.filterJournalByEntityType = filterJournalByEntityType;
  window.filterJournalByTicker = filterJournalByTicker;

  /**
   * Render icons in dropdown menu items
   */
  const renderMenuIcons = () => {
    if (!window.IconSystem || !window.IconSystem.initialized) {
      setTimeout(() => renderMenuIcons(), 500);
      return;
    }

    const iconSpans = document.querySelectorAll('.menu-item-icon[data-icon-type="entity"]');

    for (const span of iconSpans) {
      const entityType = span.getAttribute('data-icon-name');
      if (!entityType) {continue;}

      try {
        // Render icon using IconSystem
        const iconPath = `/trading-ui/images/icons/entities/${entityType}s.svg`;
        window.IconSystem.renderIcon(span, iconPath, '16px', '16px');
      } catch (error) {
        if (window.Logger) {
          window.Logger.warn('Failed to render icon', {
            icon: iconPath,
            error,
            page: 'trading-journal-page',
          });
        }
      }
    }
  };

})();
