/**
 * Trading Journal Page - Trading journal with calendar view
 * 
 * This file handles the trading journal page functionality.
 * 
 * Implementation Date: 07.12.2025
 * Status: ✅ Fully Implemented
 * 
 * Features:
 * - Loads journal entries from backend (TradingJournalData)
 * - Dynamic rendering of journal entries
 * - Filters by entity type
 * - Calendar view with indicators
 * - Integration with FieldRendererService, EntityDetailsModal, IconSystem
 * 
 * Documentation: 
 * - documentation/02-ARCHITECTURE/FRONTEND/HISTORICAL_DATA_SERVICES.md
 * - documentation/03-DEVELOPMENT/PLANS/TRADING_JOURNAL_PAGE_GAPS_ANALYSIS.md
 */

(function() {
    'use strict';

    // Current month and year for calendar navigation
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // Page name for state management
    const PAGE_NAME = 'trading-journal-page';
    
    // Current zoom state
    let currentZoomState = {
        type: null, // 'day' or 'entry'
        day: null,
        month: null,
        year: null,
        entry: null
    };

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
                        error 
                    });
                }
            }
        } else {
            // Retry after a short delay if HeaderSystem not loaded yet
            setTimeout(() => {
                if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                    window.HeaderSystem.initialize().catch((error) => {
                        if (window.Logger) {
                            window.Logger.error('Error initializing Header System (retry)', { 
                                page: 'trading-journal-page', 
                                error 
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
    function getCSSVariableValue(variableName, fallback) {
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
            'check.svg': { type: 'button', name: 'check' }
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
                        size: size,
                        alt: alt,
                        class: className
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
                            page: 'trading-journal-page' 
                        });
                    }
                }
            }
        }
    }

    /**
     * Create dropdown menu for "Add Entry" button
     */
    function createAddEntryDropdown() {
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
            { type: 'trade', label: 'טרייד', icon: 'trending-up' }
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
            menuItem.addEventListener('click', (e) => {
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
     * Render icons in dropdown menu items
     */
    async function renderMenuIcons() {
        if (!window.IconSystem || !window.IconSystem.initialized) {
            setTimeout(() => renderMenuIcons(), 500);
            return;
        }

        const iconSpans = document.querySelectorAll('.menu-item-icon[data-icon-type="entity"]');
        
        for (const span of iconSpans) {
            const entityType = span.getAttribute('data-icon-name');
            if (!entityType) continue;

            try {
                const iconHTML = await window.IconSystem.renderIcon('entity', entityType, {
                    size: '16',
                    alt: entityType,
                    class: 'icon'
                });
                
                span.textContent = '';
                const parser = new DOMParser();
                const doc = parser.parseFromString(iconHTML, 'text/html');
                doc.body.childNodes.forEach(node => {
                    span.appendChild(node.cloneNode(true));
                });
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to render menu icon', { 
                        entityType, 
                        error, 
                        page: 'trading-journal-page' 
                    });
                }
            }
        }
    }

    /**
     * Handle add entry action
     * @param {string} entityType - Entity type to add
     */
    function handleAddEntry(entityType) {
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
                'cash_flow': 'תזרימי מזומן',
                'trade_plan': 'תוכנית',
                'trade': 'טרייד'
            };
            
            window.showNotification(
                `פתיחת טופס הוספת ${entityLabels[entityType] || entityType}`,
                'info',
                'יומן מסחר',
                3000,
                'ui'
            );
        }
    }


    /**
     * Apply dynamic colors to journal entries
     * Colors are now handled by CSS variables, but we ensure they're applied correctly
     */
    function applyDynamicColors() {
        const entries = document.querySelectorAll('.journal-entry-item[data-entry-type]');
        
        entries.forEach(entry => {
            const entityType = entry.getAttribute('data-entry-type');
            if (!entityType) return;

            // CSS variables are already set by color-scheme-system
            // We just ensure the border-left is set (CSS should handle it, but JS ensures it)
            const entityColor = getCSSVariableValue(
                `--entity-${entityType.replace('_', '-')}-color`, 
                '#007bff'
            );

            // Apply to entry border (CSS should handle this, but ensure it's set)
            if (!entry.style.borderLeftWidth) {
                entry.style.borderLeftWidth = '3px';
                entry.style.borderLeftStyle = 'solid';
                entry.style.borderLeftColor = entityColor;
            }
        });
    }

    /**
     * Load page state from PageStateManager
     */
    /**
     * Save page state to PageStateManager
     */
    async function savePageState() {
        if (window.PageStateManager && typeof window.PageStateManager.savePageState === 'function') {
            try {
                await window.PageStateManager.savePageState(PAGE_NAME, {
                    entityFilters: {
                        calendarMonth: currentMonth,
                        calendarYear: currentYear,
                        entityFilter: window.currentEntityFilter || 'all',
                        tickerFilter: window.currentTickerFilter || null,
                        zoomState: currentZoomState.type ? {
                            type: currentZoomState.type,
                            day: currentZoomState.day,
                            month: currentZoomState.month,
                            year: currentZoomState.year
                        } : null
                    }
                });
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to save page state', {
                        page: PAGE_NAME,
                        error: error?.message
                    });
                }
            }
        }
    }
    
    /**
     * Restore page state including zoom state
     */
    async function restorePageState() {
        try {
            if (!window.PageStateManager || typeof window.PageStateManager.loadPageState !== 'function') {
                return;
            }
            
            // Initialize PageStateManager if needed
            if (!window.PageStateManager.initialized) {
                await window.PageStateManager.initialize();
            }
            
            const pageState = await window.PageStateManager.loadPageState(PAGE_NAME);
            if (!pageState || !pageState.entityFilters) {
                return;
            }
            
            // Restore calendar month/year
            if (pageState.entityFilters.calendarMonth !== undefined) {
                currentMonth = pageState.entityFilters.calendarMonth;
            }
            if (pageState.entityFilters.calendarYear !== undefined) {
                currentYear = pageState.entityFilters.calendarYear;
            }
            
            // Restore entity filter
            if (pageState.entityFilters.entityFilter) {
                window.currentEntityFilter = pageState.entityFilters.entityFilter;
            }
            
            // Restore ticker filter
            if (pageState.entityFilters.tickerFilter) {
                window.currentTickerFilter = pageState.entityFilters.tickerFilter;
            }
            
            // Restore zoom state
            if (pageState.entityFilters.zoomState && pageState.entityFilters.zoomState.type === 'day') {
                const zoomState = pageState.entityFilters.zoomState;
                currentZoomState = {
                    type: 'day',
                    day: zoomState.day,
                    month: zoomState.month,
                    year: zoomState.year,
                    entry: null
                };
                
                // Show day zoom after page loads
                setTimeout(async () => {
                    await showDayZoom(zoomState.day, zoomState.month, zoomState.year);
                }, 500);
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to restore page state', {
                    page: PAGE_NAME,
                    error: error?.message
                });
            }
        }
    }

    /**
     * Initialize page
     */
    async function initializePage() {
        // Initialize Header System first
        initializeHeader();
        
        // Wait for Preferences to be loaded
        if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
            window.PreferencesCore.initializeWithLazyLoading().catch((error) => {
                if (window.Logger) {
                    window.Logger.warn('Preferences initialization failed (non-critical)', { 
                        page: PAGE_NAME, 
                        error 
                    });
                }
            });
        }

        // Load saved page state
        await restorePageState();

        // Load tickers for filter
        loadTickersForFilter();
        
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
            
            // Load and render journal entries
            await loadAndRenderJournalEntries();
            
            // Load and render activity chart
            await loadAndRenderActivityChart();
            
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
        const calendarContainer = document.getElementById('calendar-container') || document.querySelector('.calendar-container') || document.querySelector('.calendar-grid');
        const containerId = calendarContainer ? (calendarContainer.id || 'calendar-container') : 'calendar-container';
        if (calendarContainer && typeof window.showLoadingState === 'function') {
            window.showLoadingState(containerId);
        }
        
        try {
            // Load data using CalendarDataLoader
            const dayData = await window.CalendarDataLoader.loadMonthDataWithCache(
                currentYear, 
                currentMonth, 
                { entityFilter: window.currentEntityFilter || 'all' }
            );

            // Render using CalendarRenderer
            await window.CalendarRenderer.render(currentYear, currentMonth, dayData);
            
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
     * Navigate to previous or next month
     * @param {string} direction - 'prev' or 'next'
     */
    async function navigateMonth(direction) {
        // Use CalendarDateUtils for navigation
        const result = window.CalendarDateUtils.navigateMonth(currentYear, currentMonth, direction);
        currentYear = result.year;
        currentMonth = result.month;
        
        // Update display
        const monthDisplay = document.getElementById('current-month-display') || document.getElementById('currentMonthYear');
        if (monthDisplay) {
            monthDisplay.textContent = window.CalendarDateUtils.formatMonthDisplay(currentYear, currentMonth);
        }
        
        // Load and render calendar for new month
        await loadAndRenderCalendar();
        
        // Reload journal entries for new month
        await loadAndRenderJournalEntries();
        
        // Reload activity chart for new month
        await loadAndRenderActivityChart();
        
        // Save page state
        await savePageState();
        
        if (window.Logger) {
            window.Logger.info(`${direction === 'prev' ? 'Previous' : 'Next'} month navigated`, { 
                month: currentMonth, 
                year: currentYear, 
                page: PAGE_NAME 
            });
        }
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
     * Navigate to current month (today)
     */
    async function navigateToToday() {
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
        
        // Reload activity chart for current month
        await loadAndRenderActivityChart();
        
        // Save page state
        await savePageState();
        
        if (window.Logger) {
            window.Logger.info('Navigated to current month', { 
                month: currentMonth, 
                year: currentYear, 
                page: PAGE_NAME 
            });
        }
    }

    /**
     * Load and render journal entries for current month
     */
    async function loadAndRenderJournalEntries() {
        const container = document.getElementById('journalEntriesList');
        if (!container) return;
        
        try {
            // Show loading state
            container.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">טוען...</span>
                    </div>
                    <p class="mt-2">טוען רשומות יומן...</p>
                </div>
            `;
            
            // Get date range for current month
            const { start, end } = window.CalendarDateUtils?.getMonthDateRange(currentYear, currentMonth) || 
                                  { start: new Date(currentYear, currentMonth, 1), end: new Date(currentYear, currentMonth + 1, 0) };
            
            // Load entries using TradingJournalData
            // Wait for TradingJournalData to be available (it's loaded with defer)
            let retries = 0;
            while (!window.TradingJournalData && retries < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }
            
            if (!window.TradingJournalData) {
                throw new Error('TradingJournalData service not available after waiting');
            }
            
            const entityFilter = window.currentEntityFilter || 'all';
            const result = await window.TradingJournalData.loadEntries({
                start_date: start.toISOString(),
                end_date: end.toISOString()
            }, {
                entity_type: entityFilter === 'all' ? 'all' : entityFilter,
                ticker_symbol: window.currentTickerFilter || null
            });
            
            const entries = result?.entries || [];
            
            // Render entries
            if (entries.length === 0) {
                container.innerHTML = `
                    <div class="alert alert-info text-center">
                        <span class="icon-placeholder icon" data-icon="info-circle" data-size="16" data-alt="info-circle" aria-label="info-circle"></span>
                        לא נמצאו רשומות יומן לחודש זה
                    </div>
                `;
                // Replace icons
                await replaceIconsWithIconSystem();
                return;
            }
            
            // Render entries as table
            const tableId = 'journalEntriesTable';
            const tableType = 'trading_journal';
            
            // Store entries for sorting
            if (!window.journalEntriesData) {
                window.journalEntriesData = {};
            }
            window.journalEntriesData[tableId] = entries;
            
            // Build table header with dynamic columns FIRST
            const headerConfig = buildTableHeader(entries, tableId, tableType);
            
            // Register table with UnifiedTableSystem if available
            if (window.UnifiedTableSystem?.registry && !window.UnifiedTableSystem.registry.isRegistered(tableType)) {
                // Build dynamic columns list for registration
                const uniqueTypes = getUniqueEntityTypes(entries);
                const allDynamicColumns = new Map();
                uniqueTypes.forEach(type => {
                    const cols = getDynamicColumnsForEntityType(type);
                    cols.dynamic.forEach(col => {
                        if (!allDynamicColumns.has(col.key)) {
                            allDynamicColumns.set(col.key, col);
                        }
                    });
                });
                
                const columns = [
                    { key: 'date', label: 'תאריך/שעה', sortable: true },
                    { key: 'entity_type', label: 'סוג רשומה', sortable: true }
                ];
                
                if (headerConfig.hasTicker) {
                    columns.push({ key: 'ticker', label: 'טיקר', sortable: true });
                }
                if (headerConfig.hasAccount) {
                    columns.push({ key: 'account', label: 'חשבון מסחר', sortable: true });
                }
                
                allDynamicColumns.forEach((col, key) => {
                    columns.push({ key: key, label: col.label, sortable: col.sortable !== false });
                });
                
                columns.push({ key: 'actions', label: 'פעולות', sortable: false });
                
                window.UnifiedTableSystem.registry.register(tableType, {
                    dataGetter: () => window.journalEntriesData[tableId] || [],
                    updateFunction: (rows) => updateJournalEntriesTableBody(tableId, rows),
                    tableSelector: `#${tableId}`,
                    columns: columns,
                    filterable: true,
                    sortable: true,
                    defaultSort: { columnIndex: 0, direction: 'desc', key: 'date' }
                });
            }
            
            // Store column mapping globally for use in renderJournalEntryRow
            window.journalTableColumnMapping = headerConfig.columnMapping;
            
            // Create table HTML
            const tableHTML = `
                <div class="table-responsive">
                    <table class="table table-hover" id="${tableId}" data-table-type="${tableType}">
                        ${headerConfig.html}
                        <tbody>
                            ${entries.map(entry => renderJournalEntryRow(entry, { columnMapping: headerConfig.columnMapping })).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            container.innerHTML = tableHTML;
            
            // Initialize table sorting
            if (window.setupSortableHeaders) {
                await window.setupSortableHeaders(PAGE_NAME);
            }
            
            // Replace icons
            await replaceIconsWithIconSystem();
            
            // Initialize buttons
            if (window.initializeButtons) {
                window.initializeButtons();
            } else if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
                window.ButtonSystem.initializeButtons();
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error loading journal entries', { 
                    page: PAGE_NAME, 
                    error: error?.message || error 
                });
            }
            
            const container = document.getElementById('journalEntriesList');
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-danger text-center">
                        <span class="icon-placeholder icon" data-icon="alert-circle" data-size="16" data-alt="error" aria-label="error"></span>
                        שגיאה בטעינת רשומות יומן: ${error?.message || 'שגיאה לא ידועה'}
                    </div>
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
     * @param {string} tableId - Table ID
     * @param {Array} rows - Sorted rows data
     */
    function updateJournalEntriesTableBody(tableId, rows) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        if (!tbody) return;
        
        // Use stored column mapping
        const columnMapping = window.journalTableColumnMapping || [];
        
        tbody.innerHTML = rows.map(entry => renderJournalEntryRow(entry, { columnMapping })).join('');
        
        // Re-initialize buttons and icons
        if (window.initializeButtons) {
            window.initializeButtons();
        }
        if (window.replaceIconsWithIconSystem) {
            window.replaceIconsWithIconSystem();
        }
    }

    /**
     * Get dynamic columns configuration for entity type
     * @param {string} entityType - Entity type
     * @returns {Array} Array of column definitions
     */
    function getDynamicColumnsForEntityType(entityType) {
        const baseColumns = [
            { key: 'date', label: 'תאריך/שעה', sortable: true, alwaysVisible: true },
            { key: 'entity_type', label: 'סוג רשומה', sortable: true, alwaysVisible: true },
            { key: 'ticker', label: 'טיקר', sortable: true, alwaysVisible: false },
            { key: 'account', label: 'חשבון מסחר', sortable: true, alwaysVisible: false }
        ];
        
        const dynamicColumns = {
            'execution': [
                { key: 'action', label: 'פעולה', sortable: true },
                { key: 'quantity', label: 'כמות', sortable: true },
                { key: 'price', label: 'מחיר', sortable: true },
                { key: 'fee', label: 'עמלה', sortable: true }
            ],
            'cash_flow': [
                { key: 'type', label: 'סוג', sortable: true },
                { key: 'amount', label: 'סכום', sortable: true },
                { key: 'fee_amount', label: 'עמלה', sortable: true },
                { key: 'description', label: 'תיאור', sortable: false }
            ],
            'trade': [
                { key: 'entry_price', label: 'מחיר כניסה', sortable: true },
                { key: 'status', label: 'סטטוס', sortable: true },
                { key: 'side', label: 'צד', sortable: true },
                { key: 'investment_type', label: 'סוג השקעה', sortable: true }
            ],
            'trade_plan': [
                { key: 'planned_amount', label: 'כמות מתוכננת', sortable: true },
                { key: 'entry_price', label: 'מחיר יעד', sortable: true },
                { key: 'status', label: 'סטטוס', sortable: true }
            ],
            'note': [
                { key: 'content', label: 'תוכן', sortable: false },
                { key: 'related_object', label: 'אובייקט מקושר', sortable: true }
            ],
            'alert': [
                { key: 'message', label: 'הודעה', sortable: false },
                { key: 'status', label: 'סטטוס', sortable: true },
                { key: 'condition', label: 'תנאי', sortable: false }
            ]
        };
        
        return {
            base: baseColumns,
            dynamic: dynamicColumns[entityType] || []
        };
    }

    /**
     * Get all unique entity types from entries to determine which dynamic columns to show
     * @param {Array} entries - Journal entries
     * @returns {Array} Array of unique entity types
     */
    function getUniqueEntityTypes(entries) {
        const types = new Set();
        entries.forEach(entry => {
            if (entry.entity_type) {
                types.add(entry.entity_type);
            }
        });
        return Array.from(types);
    }

    /**
     * Build table header with dynamic columns
     * @param {Array} entries - Journal entries to determine columns
     * @param {string} tableId - Table ID
     * @param {string} tableType - Table type
     * @returns {Object} Object with HTML and column mapping
     */
    function buildTableHeader(entries, tableId, tableType) {
        const uniqueTypes = getUniqueEntityTypes(entries);
        const allDynamicColumns = new Map();
        
        // Collect all dynamic columns from all entity types
        uniqueTypes.forEach(type => {
            const cols = getDynamicColumnsForEntityType(type);
            cols.dynamic.forEach(col => {
                if (!allDynamicColumns.has(col.key)) {
                    allDynamicColumns.set(col.key, col);
                }
            });
        });
        
        // Build header HTML
        let headerHTML = '<thead><tr>';
        let colIndex = 0;
        const columnMapping = [];
        
        // Date column
        headerHTML += `
            <th class="col-date">
                <button data-button-type="SORT" data-variant="full" data-icon="arrows-sort" data-text="תאריך/שעה" data-classes="btn-link sortable-header" data-onclick="if (window.sortTableData) { window.sortTableData(${colIndex}, window.journalEntriesData && window.journalEntriesData['${tableId}'] ? window.journalEntriesData['${tableId}'] : [], '${tableType}', function(data) { if (window.tradingJournalPage && window.tradingJournalPage.updateJournalEntriesTableBody) { window.tradingJournalPage.updateJournalEntriesTableBody('${tableId}', data); } }); }">
                </button>
            </th>
        `;
        columnMapping.push({ key: 'date', index: colIndex });
        colIndex++;
        
        // Entity type column
        headerHTML += `
            <th class="col-entity-type">
                <button data-button-type="SORT" data-variant="full" data-icon="arrows-sort" data-text="סוג רשומה" data-classes="btn-link sortable-header" data-onclick="if (window.sortTableData) { window.sortTableData(${colIndex}, window.journalEntriesData && window.journalEntriesData['${tableId}'] ? window.journalEntriesData['${tableId}'] : [], '${tableType}', function(data) { if (window.tradingJournalPage && window.tradingJournalPage.updateJournalEntriesTableBody) { window.tradingJournalPage.updateJournalEntriesTableBody('${tableId}', data); } }); }">
                </button>
            </th>
        `;
        columnMapping.push({ key: 'entity_type', index: colIndex });
        colIndex++;
        
        // Ticker column (if any entry has ticker)
        const hasTicker = entries.some(e => e.ticker_symbol);
        if (hasTicker) {
            headerHTML += `
                <th class="col-ticker">
                    <button data-button-type="SORT" data-variant="full" data-icon="arrows-sort" data-text="טיקר" data-classes="btn-link sortable-header" data-onclick="if (window.sortTableData) { window.sortTableData(${colIndex}, window.journalEntriesData && window.journalEntriesData['${tableId}'] ? window.journalEntriesData['${tableId}'] : [], '${tableType}', function(data) { if (window.tradingJournalPage && window.tradingJournalPage.updateJournalEntriesTableBody) { window.tradingJournalPage.updateJournalEntriesTableBody('${tableId}', data); } }); }">
                    </button>
                </th>
            `;
            columnMapping.push({ key: 'ticker', index: colIndex });
            colIndex++;
        }
        
        // Account column (if any entry has account)
        const hasAccount = entries.some(e => e.account_name);
        if (hasAccount) {
            headerHTML += `
                <th class="col-account">
                    <button data-button-type="SORT" data-variant="full" data-icon="arrows-sort" data-text="חשבון מסחר" data-classes="btn-link sortable-header" data-onclick="if (window.sortTableData) { window.sortTableData(${colIndex}, window.journalEntriesData && window.journalEntriesData['${tableId}'] ? window.journalEntriesData['${tableId}'] : [], '${tableType}', function(data) { if (window.tradingJournalPage && window.tradingJournalPage.updateJournalEntriesTableBody) { window.tradingJournalPage.updateJournalEntriesTableBody('${tableId}', data); } }); }">
                    </button>
                </th>
            `;
            columnMapping.push({ key: 'account', index: colIndex });
            colIndex++;
        }
        
        // Dynamic columns - show all possible columns
        allDynamicColumns.forEach((col, key) => {
            headerHTML += `
                <th class="col-${key}">
                    ${col.sortable ? `
                        <button data-button-type="SORT" data-variant="full" data-icon="arrows-sort" data-text="${col.label}" data-classes="btn-link sortable-header" data-onclick="if (window.sortTableData) { window.sortTableData(${colIndex}, window.journalEntriesData && window.journalEntriesData['${tableId}'] ? window.journalEntriesData['${tableId}'] : [], '${tableType}', function(data) { if (window.tradingJournalPage && window.tradingJournalPage.updateJournalEntriesTableBody) { window.tradingJournalPage.updateJournalEntriesTableBody('${tableId}', data); } }); }">
                        </button>
                    ` : `<span>${col.label}</span>`}
                </th>
            `;
            columnMapping.push({ key: key, index: colIndex, label: col.label });
            colIndex++;
        });
        
        // Actions column
        headerHTML += '<th class="col-actions">פעולות</th>';
        columnMapping.push({ key: 'actions', index: colIndex });
        
        headerHTML += '</tr></thead>';
        
        return { html: headerHTML, columnMapping, hasTicker, hasAccount };
    }

    /**
     * Render cell value for a specific column key
     * @param {Object} entry - Journal entry object
     * @param {string} columnKey - Column key
     * @param {Object} columnMapping - Column mapping from buildTableHeader
     * @returns {string} HTML for cell
     */
    function renderCellValue(entry, columnKey, columnMapping) {
        const FieldRenderer = window.FieldRendererService;
        
        // Entity labels mapping - defined once for reuse
        const entityLabels = {
            'execution': 'ביצוע',
            'cash_flow': 'תזרים מזומן',
            'trade': entry.subtype === 'trade_closed' ? 'טרייד נסגר' : entry.subtype === 'trade_cancelled' ? 'טרייד בוטל' : 'טרייד נוצר',
            'trade_plan': entry.subtype === 'trade_plan_cancelled' ? 'תוכנית בוטלה' : 'תוכנית נוצרה',
            'note': 'הערה',
            'alert': 'התראה הופעלה'
        };
        
        // Get entity label once for reuse
        const entityLabel = entityLabels[entry.entity_type] || entry.entity_type;
        
        switch (columnKey) {
            case 'date':
                let dateDisplay = entry.date || entry.created_at || '';
                if (dateDisplay && FieldRenderer?.renderDate) {
                    dateDisplay = FieldRenderer.renderDate(dateDisplay, true);
                } else if (dateDisplay) {
                    const date = new Date(dateDisplay);
                    dateDisplay = date.toLocaleString('he-IL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                return `<td class="col-date" data-sort-value="${dateDisplay ? new Date(entry.date || entry.created_at).getTime() : ''}">${dateDisplay || '-'}</td>`;
            
            case 'entity_type':
                let entityHtml = '';
                if (FieldRenderer && FieldRenderer.renderLinkedEntity) {
                    const displayName = entry.ticker_symbol || entry.account_name || entityLabel || '';
                    entityHtml = FieldRenderer.renderLinkedEntity(
                        entry.entity_type,
                        entry.entity_id,
                        displayName,
                        {
                            renderMode: 'linked-items-table',
                            status: entry.status,
                            side: entry.side || entry.action,
                            investment_type: entry.investment_type,
                            ticker: entry.ticker_symbol
                        }
                    );
                } else {
                    entityHtml = `<span class="fw-semibold">${entityLabel}</span>`;
                }
                return `<td class="col-entity-type" data-entity-type="${entry.entity_type}">${entityHtml}</td>`;
            
            case 'ticker':
                if (entry.ticker_symbol) {
                    return `<td class="col-ticker">${entry.ticker_symbol}</td>`;
                }
                return '<td class="col-ticker">-</td>';
            
            case 'account':
                if (entry.account_name) {
                    return `<td class="col-account">${entry.account_name}</td>`;
                }
                return '<td class="col-account">-</td>';
            
            case 'action':
                if (entry.entity_type === 'execution') {
                    const sideDisplay = entry.action ? (FieldRenderer?.renderSide ? FieldRenderer.renderSide(entry.action) : entry.action) : '';
                    return `<td class="col-action">${sideDisplay || entry.action || '-'}</td>`;
                }
                return '<td class="col-action">-</td>';
            
            case 'quantity':
                if (entry.entity_type === 'execution' && entry.quantity !== undefined) {
                    return `<td class="col-quantity" data-sort-value="${entry.quantity || 0}">${entry.quantity || 0}</td>`;
                }
                return '<td class="col-quantity" data-sort-value="0">-</td>';
            
            case 'price':
                if (entry.entity_type === 'execution' && entry.price !== undefined) {
                    return `<td class="col-price" data-sort-value="${entry.price || 0}">$${entry.price || 0}</td>`;
                }
                return '<td class="col-price" data-sort-value="0">-</td>';
            
            case 'fee':
                if ((entry.entity_type === 'execution' && entry.fee !== undefined) || 
                    (entry.entity_type === 'cash_flow' && entry.fee_amount !== undefined)) {
                    const fee = entry.fee || entry.fee_amount || 0;
                    return `<td class="col-fee" data-sort-value="${fee}">$${fee}</td>`;
                }
                return '<td class="col-fee" data-sort-value="0">-</td>';
            
            case 'type':
                if (entry.entity_type === 'cash_flow') {
                    const typeLabels = {
                        'deposit': 'הפקדה',
                        'withdrawal': 'משיכה',
                        'fee': 'עמלה',
                        'dividend': 'דיבידנד',
                        'transfer_in': 'העברה פנימה',
                        'transfer_out': 'העברה החוצה'
                    };
                    return `<td class="col-type">${typeLabels[entry.type] || entry.type || '-'}</td>`;
                }
                return '<td class="col-type">-</td>';
            
            case 'amount':
                if (entry.entity_type === 'cash_flow' && entry.amount !== undefined) {
                    return `<td class="col-amount" data-sort-value="${entry.amount || 0}">$${entry.amount || 0}</td>`;
                }
                return '<td class="col-amount" data-sort-value="0">-</td>';
            
            case 'description':
                if (entry.entity_type === 'cash_flow' && entry.description) {
                    const desc = entry.description.length > 100 ? entry.description.substring(0, 100) + '...' : entry.description;
                    return `<td class="col-description" title="${entry.description.replace(/"/g, '&quot;')}">${desc.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
                }
                return '<td class="col-description">-</td>';
            
            case 'entry_price':
                if ((entry.entity_type === 'trade' || entry.entity_type === 'trade_plan') && entry.entry_price !== undefined) {
                    return `<td class="col-entry-price" data-sort-value="${entry.entry_price || 0}">$${entry.entry_price || 0}</td>`;
                }
                return '<td class="col-entry-price" data-sort-value="0">-</td>';
            
            case 'status':
                if ((entry.entity_type === 'trade' || entry.entity_type === 'trade_plan' || entry.entity_type === 'alert') && entry.status) {
                    const statusDisplay = FieldRenderer?.renderStatus ? FieldRenderer.renderStatus(entry.status, entry.entity_type) : entry.status;
                    return `<td class="col-status" data-status="${entry.status}">${statusDisplay}</td>`;
                }
                return '<td class="col-status">-</td>';
            
            case 'side':
                if (entry.entity_type === 'trade' && entry.side) {
                    const sideDisplay = FieldRenderer?.renderSide ? FieldRenderer.renderSide(entry.side) : entry.side;
                    return `<td class="col-side">${sideDisplay}</td>`;
                }
                return '<td class="col-side">-</td>';
            
            case 'investment_type':
                if (entry.entity_type === 'trade' && entry.investment_type) {
                    return `<td class="col-investment-type">${entry.investment_type}</td>`;
                }
                return '<td class="col-investment-type">-</td>';
            
            case 'planned_amount':
                if (entry.entity_type === 'trade_plan' && entry.planned_amount !== undefined) {
                    return `<td class="col-planned-amount" data-sort-value="${entry.planned_amount || 0}">${entry.planned_amount ? `$${entry.planned_amount}` : 'לא מוגדר'}</td>`;
                }
                return '<td class="col-planned-amount" data-sort-value="0">-</td>';
            
            case 'content':
                if (entry.entity_type === 'note' && entry.content) {
                    const content = entry.content.length > 150 ? entry.content.substring(0, 150) + '...' : entry.content;
                    return `<td class="col-content" title="${entry.content.replace(/"/g, '&quot;')}">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
                }
                return '<td class="col-content">-</td>';
            
            case 'related_object':
                if (entry.entity_type === 'note' && entry.related_object) {
                    return `<td class="col-related-object">${entry.related_object.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
                }
                return '<td class="col-related-object">-</td>';
            
            case 'message':
                if (entry.entity_type === 'alert' && entry.message) {
                    const msg = entry.message.length > 150 ? entry.message.substring(0, 150) + '...' : entry.message;
                    return `<td class="col-message" title="${entry.message.replace(/"/g, '&quot;')}">${msg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
                }
                return '<td class="col-message">-</td>';
            
            case 'condition':
                if (entry.entity_type === 'alert' && entry.condition) {
                    return `<td class="col-condition">${entry.condition.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
                }
                return '<td class="col-condition">-</td>';
            
            case 'actions':
                const entryJson = JSON.stringify(entry).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                const actionsHtml = `
                    <button data-button-type="VIEW" data-variant="small" 
                            data-icon="eye"
                            title="צפה ב${entityLabel}"
                            data-onclick="window.tradingJournalPage.handleEntryClick('${entryJson}')"
                            onclick="event.stopPropagation(); if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClick) { window.tradingJournalPage.handleEntryClick('${entryJson}'); } return false;">
                    </button>
                `;
                return `<td class="col-actions" onclick="event.stopPropagation();">${actionsHtml}</td>`;
            
            default:
                return '<td>-</td>';
        }
    }

    /**
     * Render a single journal entry as table row with dynamic columns
     * @param {Object} entry - Journal entry object
     * @param {Object} columnConfig - Column configuration from buildTableHeader
     * @returns {string} - HTML row string
     */
    function renderJournalEntryRow(entry, columnConfig = null) {
        const FieldRenderer = window.FieldRendererService;
        
        // Format date for sorting
        let dateValue = entry.date || entry.created_at || '';
        if (dateValue) {
            const date = new Date(dateValue);
            dateValue = date.getTime();
        }
        
        // Get column mapping from global state or use default
        const columnMapping = columnConfig?.columnMapping || window.journalTableColumnMapping || [];
        
        // Build row HTML
        let rowHTML = `<tr class="journal-entry-row" 
            data-entry-type="${entry.entity_type}" 
            data-entity-id="${entry.entity_id}"
            data-entity-type="${entry.entity_type}"
            data-date="${dateValue}"
            style="cursor: pointer;"
            ondblclick="if (window.tradingJournalPage && window.tradingJournalPage.handleDoubleClickEntry) { window.tradingJournalPage.handleDoubleClickEntry(${JSON.stringify(entry).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}); }"
            onclick="if (!event.target.closest('button') && !event.detail || event.detail === 1) { const entryJson = '${JSON.stringify(entry).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}'; if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClick) { window.tradingJournalPage.handleEntryClick(entryJson); } }">`;
        
        // Render each column
        columnMapping.forEach(col => {
            rowHTML += renderCellValue(entry, col.key, columnMapping);
        });
        
        rowHTML += '</tr>';
        
        return rowHTML;
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
        
        // Update dropdown filter
        const selectedText = document.getElementById('selectedEntityType');
        if (selectedText) {
            const labels = {
                'all': 'הכל',
                'execution': 'ביצועים',
                'cash_flow': 'תזרימי מזומן',
                'trade': 'טריידים',
                'trade_plan': 'תוכניות טרייד',
                'note': 'הערות',
                'alert': 'התראות'
            };
            selectedText.textContent = labels[normalizedType] || 'הכל';
        }
        
        // Update filter menu items
        const menuItems = document.querySelectorAll('#entityTypeFilterMenu .entity-type-filter-item');
        menuItems.forEach(item => {
            const itemValue = item.getAttribute('data-value');
            if (itemValue === normalizedType) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // Close filter menu
        const menu = document.getElementById('entityTypeFilterMenu');
        if (menu) {
            menu.style.display = 'none';
            menu.classList.remove('show');
        }
        
        // Reload entries with new filter
        await loadAndRenderJournalEntries();
        
        // Reload calendar with new filter
        await loadAndRenderCalendar();
        
        // Reload activity chart with new filter
        await loadAndRenderActivityChart();
        
        // Save page state
        await savePageState();
        
        if (window.Logger) {
            window.Logger.info('Journal filtered by entity type', { 
                entityType: normalizedType,
                page: PAGE_NAME 
            });
        }
    }

    /**
     * Load tickers for filter dropdown
     */
    async function loadTickersForFilter() {
        try {
            const menu = document.getElementById('tickerFilterMenu');
            if (!menu) {
                if (window.Logger) {
                    window.Logger.warn('Ticker filter menu not found', { page: PAGE_NAME });
                }
                return;
            }
            
            // Use SelectPopulatorService if available
            if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function') {
                // Create a temporary select element for SelectPopulatorService
                const tempSelect = document.createElement('select');
                await window.SelectPopulatorService.populateTickersSelect(tempSelect, {
                    includeEmpty: false,
                    emptyText: 'כל הטיקרים'
                });
                
                // Extract tickers from options
                const tickers = Array.from(tempSelect.options)
                    .filter(opt => opt.value)
                    .map(opt => ({
                        symbol: opt.value,
                        name: opt.textContent.split(' - ')[1] || opt.textContent
                    }));
                
                // Clear existing options except "all"
                const allOption = menu.querySelector('.ticker-filter-item[data-value=""]');
                menu.innerHTML = '';
                if (allOption) {
                    menu.appendChild(allOption);
                }
                
                // Add ticker options
                tickers.forEach(ticker => {
                    const item = document.createElement('div');
                    item.className = 'ticker-filter-item';
                    item.setAttribute('data-value', ticker.symbol);
                    item.setAttribute('data-onclick', `window.tradingJournalPage.filterJournalByTicker('${ticker.symbol}')`);
                    item.innerHTML = `<span class="option-text">${ticker.symbol}${ticker.name ? ` - ${ticker.name}` : ''}</span>`;
                    menu.appendChild(item);
                });
                
            } else {
                // Fallback to direct API call
                const response = await fetch('/api/tickers/my', { credentials: 'include' });
                if (!response.ok) {
                    const fallbackResponse = await fetch('/api/tickers/', { credentials: 'include' });
                    if (!fallbackResponse.ok) {
                        throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
                    }
                    const fallbackData = await fallbackResponse.json();
                    var tickers = fallbackData.data || fallbackData || [];
                } else {
                    const data = await response.json();
                    var tickers = data.data || data || [];
                }
                
                // Clear existing options except "all"
                const allOption = menu.querySelector('.ticker-filter-item[data-value=""]');
                menu.innerHTML = '';
                if (allOption) {
                    menu.appendChild(allOption);
                }
                
                // Add ticker options
                tickers.forEach(ticker => {
                    const item = document.createElement('div');
                    item.className = 'ticker-filter-item';
                    item.setAttribute('data-value', ticker.symbol || ticker.ticker_symbol);
                    item.setAttribute('data-onclick', `window.tradingJournalPage.filterJournalByTicker('${ticker.symbol || ticker.ticker_symbol}')`);
                    const displayName = ticker.name_custom || ticker.name || ticker.symbol || ticker.ticker_symbol;
                    item.innerHTML = `<span class="option-text">${ticker.symbol || ticker.ticker_symbol}${displayName && displayName !== (ticker.symbol || ticker.ticker_symbol) ? ` - ${displayName}` : ''}</span>`;
                    menu.appendChild(item);
                });
            }
            
            if (window.Logger) {
                window.Logger.info('Tickers loaded for filter', { page: PAGE_NAME });
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error loading tickers for filter', { page: PAGE_NAME, error });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'לא ניתן לטעון רשימת טיקרים: ' + (error?.message || 'שגיאה לא ידועה'));
            }
        }
    }
    
    /**
     * Toggle ticker filter menu
     */
    function toggleTickerFilterMenu() {
        const menu = document.getElementById('tickerFilterMenu');
        if (!menu) {
            if (window.Logger) {
                window.Logger.warn('Ticker filter menu not found', { page: PAGE_NAME });
            }
            return;
        }
        
        const isVisible = menu.style.display === 'block' || 
                         menu.style.display === 'flex' || 
                         menu.classList.contains('show') ||
                         menu.offsetParent !== null;
        
        if (isVisible) {
            menu.style.display = 'none';
            menu.classList.remove('show');
        } else {
            menu.style.display = 'block';
            menu.classList.add('show');
        }
        
        // Close menu when clicking outside
        if (!isVisible) {
            setTimeout(() => {
                const closeMenuOnClick = (e) => {
                    if (!menu.contains(e.target) && 
                        !document.getElementById('tickerFilterToggle')?.contains(e.target)) {
                        menu.style.display = 'none';
                        menu.classList.remove('show');
                        document.removeEventListener('click', closeMenuOnClick);
                    }
                };
                document.addEventListener('click', closeMenuOnClick);
            }, 100);
        }
    }
    
    /**
     * Filter journal entries by ticker
     * @param {string} tickerSymbol - Ticker symbol to filter by (empty string for all)
     */
    async function filterJournalByTicker(tickerSymbol) {
        const normalizedSymbol = tickerSymbol || '';
        window.currentTickerFilter = normalizedSymbol || null;
        
        // Update filter buttons
        const menuItems = document.querySelectorAll('#tickerFilterMenu .ticker-filter-item');
        menuItems.forEach(item => {
            const itemValue = item.getAttribute('data-value') || '';
            if (itemValue === normalizedSymbol) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // Update dropdown filter
        const selectedText = document.getElementById('selectedTicker');
        if (selectedText) {
            if (normalizedSymbol) {
                selectedText.textContent = normalizedSymbol;
            } else {
                selectedText.textContent = 'כל הטיקרים';
            }
        }
        
        // Close filter menu
        const menu = document.getElementById('tickerFilterMenu');
        if (menu) {
            menu.style.display = 'none';
            menu.classList.remove('show');
        }
        
        // Reload entries with new filter
        await loadAndRenderJournalEntries();
        
        // Reload calendar with new filter
        await loadAndRenderCalendar();
        
        // Reload activity chart with new filter
        await loadAndRenderActivityChart();
        
        // Save page state
        await savePageState();
        
        if (window.Logger) {
            window.Logger.info('Journal filtered by ticker', { 
                tickerSymbol: normalizedSymbol || 'all',
                page: PAGE_NAME 
            });
        }
    }

    /**
     * Toggle entity type filter menu
     */
    function toggleEntityTypeFilterMenu() {
        const menu = document.getElementById('entityTypeFilterMenu');
        if (!menu) {
            if (window.Logger) {
                window.Logger.warn('Entity type filter menu not found', { page: PAGE_NAME });
            }
            return;
        }
        
        const isVisible = menu.style.display === 'block' || 
                         menu.style.display === 'flex' || 
                         menu.classList.contains('show') ||
                         menu.offsetParent !== null;
        
        if (isVisible) {
            menu.style.display = 'none';
            menu.classList.remove('show');
        } else {
            menu.style.display = 'block';
            menu.classList.add('show');
        }
        
        // Close menu when clicking outside
        if (!isVisible) {
            setTimeout(() => {
                const closeMenuOnClick = (e) => {
                    if (!menu.contains(e.target) && 
                        !document.getElementById('entityTypeFilterToggle')?.contains(e.target)) {
                        menu.style.display = 'none';
                        menu.classList.remove('show');
                        document.removeEventListener('click', closeMenuOnClick);
                    }
                };
                document.addEventListener('click', closeMenuOnClick);
            }, 100);
        }
    }

    /**
     * Zoom to a specific day - show all entries for that day
     * @param {number} day - Day number
     * @param {number} month - Month (0-11)
     * @param {number} year - Year
     */
    async function zoomToDay(day, month, year) {
        try {
            if (window.Logger) {
                window.Logger.info('Zooming to day', { page: PAGE_NAME, day, month, year });
            }
            
            // Update zoom state
            currentZoomState = {
                type: 'day',
                day: day,
                month: month,
                year: year,
                entry: null
            };
            
            // Save zoom state
            await savePageState();
            
            // Show day zoom UI
            await showDayZoom(day, month, year);
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error zooming to day', { page: PAGE_NAME, error, day, month, year });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'לא ניתן להציג יום: ' + (error?.message || 'שגיאה לא ידועה'));
            }
        }
    }
    
    /**
     * Show day zoom UI - display all entries for a specific day
     * @param {number} day - Day number
     * @param {number} month - Month (0-11)
     * @param {number} year - Year
     */
    async function showDayZoom(day, month, year) {
        try {
            // Format date for display
            const date = new Date(year, month, day);
            const dateStr = date.toLocaleDateString('he-IL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'long'
            });
            
            // Get or create day zoom container
            let dayZoomContainer = document.getElementById('dayZoomContainer');
            if (!dayZoomContainer) {
                dayZoomContainer = document.createElement('div');
                dayZoomContainer.id = 'dayZoomContainer';
                dayZoomContainer.className = 'day-zoom-container content-section';
                
                // Insert before journal entries section
                const journalSection = document.querySelector('[data-section="journal-entries-section"]');
                if (journalSection && journalSection.parentNode) {
                    journalSection.parentNode.insertBefore(dayZoomContainer, journalSection);
                } else {
                    const calendarSection = document.querySelector('[data-section="calendar-section"]');
                    if (calendarSection && calendarSection.parentNode) {
                        calendarSection.parentNode.insertBefore(dayZoomContainer, calendarSection.nextSibling);
                    }
                }
            }
            
            // Build date range for API call
            const startDate = new Date(year, month, day);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(year, month, day);
            endDate.setHours(23, 59, 59, 999);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            // Load entries for this day
            let dayEntries = [];
            if (window.TradingJournalData && typeof window.TradingJournalData.loadEntries === 'function') {
                const response = await window.TradingJournalData.loadEntries({
                    start_date: startDateStr,
                    end_date: endDateStr,
                    entity_type: window.currentEntityFilter || 'all',
                    ticker_symbol: window.currentTickerFilter || null
                });
                
                // Extract entries array from response (could be direct array or object with entries property)
                const allEntries = Array.isArray(response) ? response : (response?.entries || response?.data || []);
                
                // Filter entries for this specific day
                dayEntries = allEntries.filter(entry => {
                    const entryDate = new Date(entry.date || entry.created_at);
                    return entryDate.getDate() === day &&
                           entryDate.getMonth() === month &&
                           entryDate.getFullYear() === year;
                });
                
                // Sort by time (earliest first)
                dayEntries.sort((a, b) => {
                    const dateA = new Date(a.date || a.created_at);
                    const dateB = new Date(b.date || b.created_at);
                    return dateA - dateB;
                });
            }
            
            // Build day zoom HTML
            const dayZoomHTML = `
                <div class="section-header">
                    <h2>
                        <span class="icon-placeholder icon" data-icon="calendar" data-size="16" data-alt="calendar" aria-label="calendar"></span>
                        רשומות ל-${dateStr}
                    </h2>
                    <div class="header-actions">
                        <button class="btn btn-secondary" 
                                data-button-type="NAV"
                                data-icon="arrow-right"
                                data-text="חזרה לחודש"
                                data-onclick="window.tradingJournalPage.exitDayZoom()"
                                onclick="if (window.tradingJournalPage && window.tradingJournalPage.exitDayZoom) { window.tradingJournalPage.exitDayZoom(); }">
                        </button>
                    </div>
                </div>
                <div class="section-body">
                    ${dayEntries.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-hover" id="dayZoomTable" data-table-type="trading_journal_day">
                                <thead>
                                    <tr>
                                        <th>שעה</th>
                                        <th>סוג</th>
                                        <th>פרטים</th>
                                        <th>פעולות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${dayEntries.map(entry => {
                                        const entryDate = new Date(entry.date || entry.created_at);
                                        const timeStr = entryDate.toLocaleTimeString('he-IL', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        const entryJson = JSON.stringify(entry).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                                        const entityLabels = {
                                            'execution': 'ביצוע',
                                            'cash_flow': 'תזרים מזומן',
                                            'trade': 'טרייד',
                                            'trade_plan': 'תוכנית',
                                            'note': 'הערה',
                                            'alert': 'התראה'
                                        };
                                        const entityLabel = entityLabels[entry.entity_type] || entry.entity_type;
                                        
                                        return `
                                            <tr style="cursor: pointer;"
                                                ondblclick="if (window.tradingJournalPage && window.tradingJournalPage.handleDoubleClickEntry) { window.tradingJournalPage.handleDoubleClickEntry('${entryJson}'); }"
                                                onclick="if (!event.target.closest('button') && (!event.detail || event.detail === 1)) { if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClick) { window.tradingJournalPage.handleEntryClick('${entryJson}'); } }">
                                                <td>${timeStr}</td>
                                                <td>${entityLabel}</td>
                                                <td>${entry.ticker_symbol || entry.account_name || '-'}</td>
                                                <td onclick="event.stopPropagation();">
                                                    <button data-button-type="VIEW" data-variant="small" 
                                                            data-icon="eye"
                                                            title="צפה ב${entityLabel}"
                                                            data-onclick="window.tradingJournalPage.handleEntryClick('${entryJson}')"
                                                            onclick="event.stopPropagation(); if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClick) { window.tradingJournalPage.handleEntryClick('${entryJson}'); } return false;">
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="alert alert-info text-center">
                            <span class="icon-placeholder icon" data-icon="info-circle" data-size="16" data-alt="info" aria-label="info"></span>
                            לא נמצאו רשומות ליום זה
                        </div>
                    `}
                </div>
            `;
            
            dayZoomContainer.innerHTML = dayZoomHTML;
            dayZoomContainer.style.display = 'block';
            
            // Initialize buttons and icons
            if (window.initializeButtons) {
                window.initializeButtons();
            }
            if (window.replaceIconsWithIconSystem) {
                await window.replaceIconsWithIconSystem();
            }
            
            // Scroll to day zoom container
            dayZoomContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error showing day zoom', { page: PAGE_NAME, error, day, month, year });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'לא ניתן להציג יום: ' + (error?.message || 'שגיאה לא ידועה'));
            }
        }
    }
    
    /**
     * Exit day zoom - return to month view
     */
    async function exitDayZoom() {
        try {
            if (window.Logger) {
                window.Logger.info('Exiting day zoom', { page: PAGE_NAME });
            }
            
            // Clear zoom state
            currentZoomState = {
                type: null,
                day: null,
                month: null,
                year: null,
                entry: null
            };
            
            // Hide day zoom container
            const dayZoomContainer = document.getElementById('dayZoomContainer');
            if (dayZoomContainer) {
                dayZoomContainer.style.display = 'none';
                dayZoomContainer.innerHTML = '';
            }
            
            // Save page state
            await savePageState();
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error exiting day zoom', { page: PAGE_NAME, error });
            }
        }
    }
    
    /**
     * Handle double click on journal entry - open directly if single, show selection if multiple
     * @param {Object|string} entryOrJson - Journal entry object or JSON string
     */
    async function handleDoubleClickEntry(entryOrJson) {
        try {
            let entry;
            if (typeof entryOrJson === 'string') {
                try {
                    const unescaped = entryOrJson
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&amp;/g, '&');
                    entry = JSON.parse(unescaped);
                } catch (e) {
                    if (window.Logger) {
                        window.Logger.error('Error parsing entry JSON', { page: PAGE_NAME, error: e, entryOrJson });
                    }
                    return;
                }
            } else {
                entry = entryOrJson;
            }
            
            if (!entry || !entry.entity_type || !entry.entity_id) {
                if (window.Logger) {
                    window.Logger.warn('Invalid entry for double click', { page: PAGE_NAME, entry });
                }
                return;
            }
            
            // Get entry date
            const entryDate = new Date(entry.date || entry.created_at);
            const dateStr = entryDate.toISOString().split('T')[0];
            
            // Find duplicate entries (same entity_type and entity_id on same day)
            const duplicates = await findDuplicateEntries(entry.entity_type, entry.entity_id, dateStr);
            
            if (duplicates.length === 1) {
                // Single entry - open directly
                await handleEntryClick(entry);
            } else if (duplicates.length > 1) {
                // Multiple entries - show selection modal
                await showEntrySelectionModal(duplicates);
            } else {
                // No duplicates found - open directly
                await handleEntryClick(entry);
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error handling double click entry', { page: PAGE_NAME, error, entryOrJson });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'לא ניתן לטפל ברשומה: ' + (error?.message || 'שגיאה לא ידועה'));
            }
        }
    }
    
    /**
     * Find duplicate entries (same entity_type and entity_id on same day)
     * @param {string} entityType - Entity type
     * @param {number} entityId - Entity ID
     * @param {string} dateStr - Date string (YYYY-MM-DD)
     * @returns {Promise<Array>} Array of duplicate entries
     */
    async function findDuplicateEntries(entityType, entityId, dateStr) {
        try {
            if (!window.TradingJournalData || typeof window.TradingJournalData.loadEntries !== 'function') {
                return [];
            }
            
            // Load entries for this day
            const startDate = new Date(dateStr);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(dateStr);
            endDate.setHours(23, 59, 59, 999);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            const allEntries = await window.TradingJournalData.loadEntries({
                start_date: startDateStr,
                end_date: endDateStr,
                entity_type: 'all'
            });
            
            // Filter entries with same entity_type and entity_id
            const duplicates = allEntries.filter(e => 
                e.entity_type === entityType && 
                e.entity_id === entityId
            );
            
            return duplicates;
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error finding duplicate entries', { page: PAGE_NAME, error, entityType, entityId, dateStr });
            }
            return [];
        }
    }
    
    /**
     * Show entry selection modal when multiple entries of same type exist
     * @param {Array} entries - Array of duplicate entries
     */
    async function showEntrySelectionModal(entries) {
        try {
            if (!entries || entries.length === 0) {
                return;
            }
            
            // Build modal content
            const modalContent = `
                <div class="entry-selection-modal-content">
                    <h3>בחר רשומה להצגה</h3>
                    <p class="text-muted">נמצאו ${entries.length} רשומות מאותו סוג ביום זה</p>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>שעה</th>
                                    <th>סוג</th>
                                    <th>טיקר</th>
                                    <th>חשבון</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${entries.map(entry => {
                                    const entryDate = new Date(entry.date || entry.created_at);
                                    const timeStr = entryDate.toLocaleTimeString('he-IL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                    const entryJson = JSON.stringify(entry).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                                    const entityLabels = {
                                        'execution': 'ביצוע',
                                        'cash_flow': 'תזרים מזומן',
                                        'trade': 'טרייד',
                                        'trade_plan': 'תוכנית',
                                        'note': 'הערה',
                                        'alert': 'התראה'
                                    };
                                    const entityLabel = entityLabels[entry.entity_type] || entry.entity_type;
                                    
                                    return `
                                        <tr>
                                            <td>${timeStr}</td>
                                            <td>${entityLabel}</td>
                                            <td>${entry.ticker_symbol || '-'}</td>
                                            <td>${entry.account_name || '-'}</td>
                                            <td>
                                                <button class="btn btn-sm btn-primary" 
                                                        data-onclick="if (window.tradingJournalPage && window.tradingJournalPage.handleEntryClick) { window.tradingJournalPage.handleEntryClick('${entryJson}'); } if (window.ModalManagerV2 && window.ModalManagerV2.closeModal) { window.ModalManagerV2.closeModal('entrySelectionModal'); }">
                                                    צפה
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" 
                                data-onclick="if (window.ModalManagerV2 && window.ModalManagerV2.closeModal) { window.ModalManagerV2.closeModal('entrySelectionModal'); }">
                            ביטול
                        </button>
                    </div>
                </div>
            `;
            
            // Use ModalManagerV2 to show modal
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.createModal === 'function') {
                await window.ModalManagerV2.createModal({
                    id: 'entrySelectionModal',
                    title: 'בחר רשומה להצגה',
                    content: modalContent,
                    size: 'large'
                });
            } else if (window.createAndShowModal) {
                await window.createAndShowModal({
                    modalId: 'entrySelectionModal',
                    title: 'בחר רשומה להצגה',
                    body: modalContent,
                    size: 'large'
                });
            } else {
                // Fallback to alert
                if (window.NotificationSystem) {
                    window.NotificationSystem.showInfo('בחר רשומה', `נמצאו ${entries.length} רשומות. אנא בחר אחת מהטבלה.`);
                }
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error showing entry selection modal', { page: PAGE_NAME, error, entries });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'לא ניתן להציג בחירת רשומה: ' + (error?.message || 'שגיאה לא ידועה'));
            }
        }
    }

    /**
     * Handle click on journal entry - open entity details or show selection for merged entries
     * @param {Object|string} entryOrJson - Journal entry object or JSON string
     */
    async function handleEntryClick(entryOrJson) {
        let entry;
        if (typeof entryOrJson === 'string') {
            try {
                // Handle both regular JSON and HTML-escaped JSON
                const unescaped = entryOrJson
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, '&');
                entry = JSON.parse(unescaped);
            } catch (e) {
                if (window.Logger) {
                    window.Logger.error('Failed to parse entry JSON', { page: PAGE_NAME, error: e, entryOrJson: entryOrJson?.substring(0, 100) });
                }
                if (window.NotificationSystem) {
                    window.NotificationSystem.showError('שגיאה', 'לא ניתן לפתוח פרטי רשומה');
                }
                return;
            }
        } else {
            entry = entryOrJson;
        }
        
        if (!entry || !entry.entity_type || (!entry.entity_id && entry.entity_id !== 0)) {
            if (window.Logger) {
                window.Logger.warn('Invalid entry for handleEntryClick', { page: PAGE_NAME, entry });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'רשומה לא תקינה');
            }
            return;
        }
        
        // Check if there are multiple entries with same entity_type and entity_id
        const table = document.querySelector('#journalEntriesTable');
        if (table) {
            const similarEntries = table.querySelectorAll(
                `tr[data-entity-type="${entry.entity_type}"][data-entity-id="${entry.entity_id}"]`
            );
            
            if (similarEntries.length > 1) {
                // Multiple entries with same entity - show selection modal
                // For now, just open the first one. TODO: Implement selection modal
                if (window.Logger) {
                    window.Logger.info('Multiple entries found, opening first', { 
                        page: PAGE_NAME, 
                        count: similarEntries.length,
                        entityType: entry.entity_type,
                        entityId: entry.entity_id
                    });
                }
            }
        }
        
        // Open entity details
        if (window.showEntityDetails && typeof window.showEntityDetails === 'function') {
            try {
                await window.showEntityDetails(entry.entity_type, entry.entity_id, {
                    mode: 'view',
                    sourceInfo: {
                        sourceModal: 'trading-journal',
                        sourceType: 'journal_entry',
                        sourceId: entry.id || entry.entity_id
                    }
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
                window.Logger.warn('showEntityDetails not available', { page: PAGE_NAME, hasShowEntityDetails: typeof window.showEntityDetails });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'מערכת פרטי ישויות לא זמינה');
            }
        }
    }

    // Chart state
    let activityChart = null;
    let currentChartViewMode = 'daily';
    
    /**
     * Set chart view mode (daily/weekly)
     * @param {string} mode - 'daily' or 'weekly'
     */
    async function setChartViewMode(mode) {
        if (mode !== 'daily' && mode !== 'weekly') {
            return;
        }
        
        currentChartViewMode = mode;
        
        // Update button states
        const dailyBtn = document.getElementById('chartViewModeDaily');
        const weeklyBtn = document.getElementById('chartViewModeWeekly');
        
        if (dailyBtn && weeklyBtn) {
            if (mode === 'daily') {
                dailyBtn.classList.add('active');
                weeklyBtn.classList.remove('active');
            } else {
                dailyBtn.classList.remove('active');
                weeklyBtn.classList.add('active');
            }
        }
        
        // Reload chart with new mode
        await loadAndRenderActivityChart();
        
        // Save page state
        await savePageState();
        
        if (window.Logger) {
            window.Logger.info('Chart view mode changed', { 
                mode,
                page: PAGE_NAME 
            });
        }
    }
    
    /**
     * Load and render activity chart
     */
    async function loadAndRenderActivityChart() {
        const container = document.getElementById('activityChartContainer');
        if (!container) {
            if (window.Logger) {
                window.Logger.warn('Activity chart container not found', { page: PAGE_NAME });
            }
            return;
        }
        
        try {
            // Show loading state
            container.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">טוען...</span>
                    </div>
                    <p class="mt-2">טוען נתוני פעילות...</p>
                </div>
            `;
            
            // Calculate date range for current month
            const start = new Date(currentYear, currentMonth, 1);
            const end = new Date(currentYear, currentMonth + 1, 0);
            end.setHours(23, 59, 59, 999);
            
            const startDateStr = start.toISOString().split('T')[0];
            const endDateStr = end.toISOString().split('T')[0];
            
            // Load activity stats from API
            const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
            const params = new URLSearchParams();
            params.append('start_date', startDateStr);
            params.append('end_date', endDateStr);
            params.append('view_mode', currentChartViewMode);
            if (window.currentEntityFilter && window.currentEntityFilter !== 'all') {
                params.append('entity_type', window.currentEntityFilter);
            }
            if (window.currentTickerFilter) {
                params.append('ticker_symbol', window.currentTickerFilter);
            }
            
            const url = `${base}/api/trading-journal/activity-stats?${params.toString()}`;
            const response = await fetch(url, {
                credentials: 'include'
            });
            
            // Handle 401/308 authentication errors
            if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
                throw new Error('Authentication required');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            const stats = result?.data?.stats || [];
            
            if (stats.length === 0) {
                container.innerHTML = `
                    <div class="alert alert-info text-center">
                        <span class="icon-placeholder icon" data-icon="info-circle" data-size="16" data-alt="info" aria-label="info"></span>
                        לא נמצאו נתוני פעילות לתקופה זו
                    </div>
                `;
                return;
            }
            
            // Render chart
            await renderActivityChart(stats, currentChartViewMode, container);
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error loading activity chart', { 
                    page: PAGE_NAME, 
                    error: error?.message || error 
                });
            }
            
            container.innerHTML = `
                <div class="alert alert-danger text-center">
                    <span class="icon-placeholder icon" data-icon="alert-circle" data-size="16" data-alt="error" aria-label="error"></span>
                    שגיאה בטעינת נתוני פעילות: ${error?.message || 'שגיאה לא ידועה'}
                </div>
            `;
            
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 
                    `לא ניתן לטעון נתוני פעילות. ${error?.message || 'שגיאה לא ידועה'}`);
            }
        }
    }
    
    /**
     * Render activity chart using Chart.js
     * @param {Array} stats - Activity statistics array
     * @param {string} viewMode - 'daily' or 'weekly'
     * @param {HTMLElement} container - Container element
     */
    async function renderActivityChart(stats, viewMode, container) {
        try {
            // Wait for Chart.js to be available
            let retries = 0;
            while ((typeof window.Chart === 'undefined' && typeof Chart === 'undefined') && retries < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }
            
            // Use window.Chart or Chart (Chart.js from CDN)
            let ChartLib = window.Chart || Chart;
            
            if (typeof ChartLib === 'undefined') {
                // Try to load Chart.js
                if (window.ChartLoader && typeof window.ChartLoader.load === 'function') {
                    await window.ChartLoader.load();
                    ChartLib = window.Chart || Chart;
                    if (typeof ChartLib === 'undefined') {
                        throw new Error('Chart.js not available after loading');
                    }
                } else {
                    throw new Error('Chart.js not available');
                }
            }
            
            // Destroy existing chart if it exists
            if (activityChart) {
                try {
                    activityChart.destroy();
                } catch (e) {
                    // Ignore
                }
                activityChart = null;
            }
            
            // Create canvas element
            const canvasId = 'activityChartCanvas';
            let canvas = document.getElementById(canvasId);
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = canvasId;
                container.innerHTML = '';
                container.appendChild(canvas);
            } else {
                container.innerHTML = '';
                container.appendChild(canvas);
            }
            
            // Prepare chart data
            const labels = stats.map(stat => stat.period);
            const executionsData = stats.map(stat => stat.executions_count || 0);
            const planningData = stats.map(stat => stat.planning_count || 0);
            
            // Get colors from logo
            const executionsColor = 'rgba(38, 186, 172, 0.7)'; // Primary color (Turquoise-Green)
            const planningColor = 'rgba(252, 90, 6, 0.7)'; // Secondary color (Orange-Red)
            
            // Create chart configuration
            const chartConfig = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'ביצועים',
                            data: executionsData,
                            backgroundColor: executionsColor,
                            borderColor: '#26baac',
                            borderWidth: 1
                        },
                        {
                            label: 'תכנון',
                            data: planningData,
                            backgroundColor: planningColor,
                            borderColor: '#fc5a06',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                padding: 15,
                                usePointStyle: true
                            }
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45,
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            };
            
            // Create chart (use ChartLib that was already defined above)
            activityChart = new ChartLib(canvas, chartConfig);
            
            if (window.Logger) {
                window.Logger.info('Activity chart rendered', { 
                    page: PAGE_NAME,
                    viewMode,
                    dataPoints: stats.length
                });
            }
            
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error rendering activity chart', { 
                    page: PAGE_NAME, 
                    error: error?.message || error 
                });
            }
            
            container.innerHTML = `
                <div class="alert alert-danger text-center">
                    <span class="icon-placeholder icon" data-icon="alert-circle" data-size="16" data-alt="error" aria-label="error"></span>
                    שגיאה ברינדור גרף: ${error?.message || 'שגיאה לא ידועה'}
                </div>
            `;
        }
    }

    // Export functions to window
    window.tradingJournalPage = {
        navigateMonth,
        prevMonth,
        nextMonth,
        navigateToToday,
        filterJournalByEntityType,
        toggleEntityTypeFilterMenu,
        filterJournalByTicker,
        toggleTickerFilterMenu,
        loadTickersForFilter,
        loadAndRenderCalendar,
        loadAndRenderJournalEntries,
        loadAndRenderActivityChart,
        setChartViewMode,
        handleEntryClick,
        handleDoubleClickEntry,
        zoomToDay,
        showDayZoom,
        exitDayZoom,
        findDuplicateEntries,
        showEntrySelectionModal,
        updateJournalEntriesTableBody,
        currentMonth: () => currentMonth,
        currentYear: () => currentYear
    };

    // Make filterJournalByEntityType available globally (for HTML onclick)
    window.filterJournalByEntityType = filterJournalByEntityType;

})();
