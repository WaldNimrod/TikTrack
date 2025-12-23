/**
 * Development Tools Page Controller
 * ================================
 *
 * Responsibilities:
 * - Display comprehensive overview of all system pages and tools
 * - Provide navigation links to all pages organized by categories
 * - Show system statistics and documentation links
 * - Handle page interactions and user actions
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initialize() - Main initialization function

// === Event Handlers ===
// - attachEventListeners() - Attach event listeners

// === UI Functions ===
// - refreshDevToolsData() - Refresh development tools data
// - showDevToolsStats() - Show development tools statistics
// - toggleSection() - Toggle section visibility

// === Utility Functions ===
// - log() - Logging function

(function devToolsPageModule() {
    'use strict';

    // ===== CONFIGURATION =====

    const CONFIG = {
        version: '1.0.0',
        debug: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        pageId: 'dev_tools'
    };

    // ===== STATE =====

    let state = {
        initialized: false,
        sectionsCollapsed: new Set(),
        lastRefresh: null
    };

    // ===== INITIALIZATION =====

    /**
     * Main initialization function
     */
    function initialize() {
        if (state.initialized) {
            log('Already initialized, skipping...');
            return;
        }

        log('Initializing Development Tools page...');

        try {
            // Attach event listeners
            attachEventListeners();

            // Initialize UI state
            initializeUI();

            // Load initial data
            loadPageData();

            state.initialized = true;
            state.lastRefresh = new Date();

            log('Development Tools page initialized successfully');

        } catch (error) {
            log('Error during initialization:', error);
            showError('שגיאה באתחול עמוד כלי הפיתוח: ' + error.message);
        }
    }

    /**
     * Initialize UI components
     */
    function initializeUI() {
        // Load collapsed sections state from preferences
        loadSectionStates();

        // Update page title and meta
        updatePageInfo();
    }

    /**
     * Load section collapsed states from preferences
     */
    function loadSectionStates() {
        try {
            const preferences = window.PreferencesSystem?.getAllPreferences?.() || {};
            const devToolsPrefs = preferences.dev_tools || {};

            // Apply saved collapsed states
            devToolsPrefs.collapsedSections?.forEach(sectionId => {
                state.sectionsCollapsed.add(sectionId);
                const section = document.getElementById(sectionId);
                if (section) {
                    const body = section.querySelector('.section-body');
                    if (body) {
                        body.classList.add('d-none');
                    }
                }
            });
        } catch (error) {
            log('Error loading section states:', error);
        }
    }

    /**
     * Update page information
     */
    function updatePageInfo() {
        // Update last refresh time if available
        const refreshTimeElement = document.getElementById('last-refresh-time');
        if (refreshTimeElement && state.lastRefresh) {
            refreshTimeElement.textContent = state.lastRefresh.toLocaleString('he-IL');
        }
    }

    /**
     * Load page data and statistics
     */
    function loadPageData() {
        // This page is mostly static, but we could load dynamic data here
        log('Loading page data...');

        // Update statistics if needed
        updateStatistics();
    }

    /**
     * Update page statistics
     */
    function updateStatistics() {
        // For now, statistics are static in HTML
        // Could be made dynamic by counting actual pages
        log('Statistics updated');
    }

    // ===== EVENT HANDLERS =====

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        // Make functions available globally for HTML onclick handlers
        window.refreshDevToolsData = refreshDevToolsData;
        window.showDevToolsStats = showDevToolsStats;
        window.toggleSection = toggleSection;

        log('Event listeners attached');
    }

    // ===== UI FUNCTIONS =====

    /**
     * Refresh development tools data
     */
    function refreshDevToolsData() {
        log('Refreshing development tools data...');

        // Show loading state
        const refreshBtn = document.querySelector('[data-onclick="window.refreshDevToolsData()"]');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<img src="images/icons/tabler/loader.svg" width="16" height="16" alt="loading" class="icon spinning"> מרענן...';
        }

        try {
            // Reload page data
            loadPageData();

            // Update refresh timestamp
            state.lastRefresh = new Date();
            updatePageInfo();

            // Show success notification
            if (window.NotificationSystem) {
                window.NotificationSystem.showNotification({
                    type: 'success',
                    title: 'נתונים עודכנו',
                    message: 'מידע כלי הפיתוח עודכן בהצלחה',
                    duration: 3000
                });
            }

        } catch (error) {
            log('Error refreshing data:', error);
            showError('שגיאה ברענון הנתונים: ' + error.message);
        } finally {
            // Reset button state
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '🔄 רענן נתונים';
            }
        }
    }

    /**
     * Show development tools statistics
     */
    function showDevToolsStats() {
        log('Showing development tools statistics...');

        const stats = {
            totalPages: 77,
            mainPages: 17,
            technicalPages: 12,
            devTools: 10,
            authPages: 4,
            testPages: 15,
            mockups: 11,
            documentationLinks: 25
        };

        let message = `📊 סטטיסטיקות כלי פיתוח:\n\n`;
        message += `• סה"כ עמודים: ${stats.totalPages}\n`;
        message += `• עמודים מרכזיים: ${stats.mainPages}\n`;
        message += `• עמודים טכניים: ${stats.technicalPages}\n`;
        message += `• כלי פיתוח: ${stats.devTools}\n`;
        message += `• עמודי אימות: ${stats.authPages}\n`;
        message += `• עמודי בדיקה: ${stats.testPages}+\n`;
        message += `• עמודי מוקאפים: ${stats.mockups}\n`;
        message += `• קישורי תיעוד: ${stats.documentationLinks}+`;

        if (window.NotificationSystem) {
            window.NotificationSystem.showNotification({
                type: 'info',
                title: 'סטטיסטיקות כלי פיתוח',
                message: message,
                duration: 8000
            });
        } else {
            alert(message);
        }
    }

    /**
     * Toggle section visibility
     * @param {string} sectionId - Section ID to toggle
     */
    function toggleSection(sectionId) {
        log(`Toggling section: ${sectionId}`);

        const section = document.getElementById(sectionId);
        if (!section) {
            log(`Section not found: ${sectionId}`);
            return;
        }

        const body = section.querySelector('.section-body');
        if (!body) {
            log(`Section body not found: ${sectionId}`);
            return;
        }

        // Toggle visibility
        const isCollapsed = body.classList.contains('d-none');
        body.classList.toggle('d-none');

        // Update button icon
        const toggleBtn = section.querySelector('[data-onclick*="toggleSection"]');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('.icon');
            if (icon) {
                icon.textContent = isCollapsed ? '▲' : '▼';
            }
        }

        // Update state
        if (isCollapsed) {
            state.sectionsCollapsed.delete(sectionId);
        } else {
            state.sectionsCollapsed.add(sectionId);
        }

        // Save state to preferences
        saveSectionStates();
    }

    /**
     * Save section collapsed states to preferences
     */
    function saveSectionStates() {
        try {
            if (window.PreferencesSystem?.savePreferenceGroup) {
                const collapsedSections = Array.from(state.sectionsCollapsed);
                window.PreferencesSystem.savePreferenceGroup('dev_tools', {
                    collapsedSections: collapsedSections
                });
            }
        } catch (error) {
            log('Error saving section states:', error);
        }
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Show error message
     * @param {string} message - Error message to show
     */
    function showError(message) {
        log('Error:', message);

        if (window.NotificationSystem) {
            window.NotificationSystem.showNotification({
                type: 'error',
                title: 'שגיאה',
                message: message,
                duration: 5000
            });
        } else {
            alert('שגיאה: ' + message);
        }
    }

    /**
     * Logging function
     * @param {...any} args - Arguments to log
     */
    function log(...args) {
        if (CONFIG.debug) {
            if (window.Logger) {
                window.Logger.debug('[DevTools]', ...args);
            } else {
                console.log('[DevTools]', ...args);
            }
        }
    }

    // ===== PUBLIC API =====

    // Expose public methods if needed
    window.DevToolsPage = {
        refresh: refreshDevToolsData,
        showStats: showDevToolsStats,
        toggleSection: toggleSection
    };

    // ===== INITIALIZATION =====

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    log('Development Tools module loaded');

})();
