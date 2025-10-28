/**
 * System Management Main Orchestrator - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the system management main orchestrator for TikTrack including:
 * - Section management and coordination
 * - Initialization and configuration
 * - Auto-refresh and monitoring
 * - Error handling and reporting
 * - Performance optimization
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

/**
 * System Management Main Orchestrator class
 * @class SystemManagementMain
 */
class SystemManagementMain {
  constructor() {
    this.sections = new Map();
    this.isInitialized = false;
    this.initStartTime = null;
    this.sectionConfigs = this.getDefaultSectionConfigs();
  }

  /**
   * Get default section configurations
   * @function getDefaultSectionConfigs
   * @returns {Object} Section configurations
   */
  getDefaultSectionConfigs() {
    return {
      'sm-dashboard': {
        autoRefresh: true,
        refreshInterval: 30000,
        priority: 1
      },
      'sm-server': {
        autoRefresh: true,
        refreshInterval: 60000,
        priority: 2
      },
      'sm-cache': {
        autoRefresh: true,
        refreshInterval: 45000,
        priority: 3
      },
      'sm-performance': {
        autoRefresh: true,
        refreshInterval: 30000,
        priority: 4
      },
      'sm-external-data': {
        autoRefresh: true,
        refreshInterval: 120000,
        priority: 5
      },
      'sm-alerts': {
        autoRefresh: true,
        refreshInterval: 15000,
        priority: 6
      },
      'sm-database': {
        autoRefresh: true,
        refreshInterval: 90000,
        priority: 7
      },
      'sm-background-tasks': {
        autoRefresh: true,
        refreshInterval: 30000,
        priority: 8
      },
      'sm-operations': {
        autoRefresh: false,
        refreshInterval: 0,
        priority: 9
      },
      'sm-security': {
        autoRefresh: true,
        refreshInterval: 180000,
        priority: 10
      },
      'sm-logs': {
        autoRefresh: false,
        refreshInterval: 0,
        priority: 11
      }
    };
  }

  /**
   * Initialize system management
   * @function init
   * @async
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      console.warn('⚠️ System Management already initialized');
      return;
    }

    try {
      this.initStartTime = Date.now();
      console.log('🚀 Initializing System Management Page...');

      // Show global loading state
      this.showGlobalLoadingState();

      // Initialize sections by priority
      await this.initializeSectionsByPriority();

      // Setup global event listeners
      this.setupGlobalEventListeners();

      // Setup global refresh functionality
      this.setupGlobalRefresh();

      // Setup section visibility toggles
      this.setupSectionToggles();

      // Calculate and display initialization time
      const initTime = Date.now() - this.initStartTime;
      console.log(`✅ System Management initialized in ${initTime}ms`);

      this.isInitialized = true;

      // Hide global loading state
      this.hideGlobalLoadingState();

    } catch (error) {
      console.error('❌ Failed to initialize System Management:', error);
      this.showGlobalError(error);
      throw error;
    }
  }

  /**
   * Initialize sections by priority
   * @function initializeSectionsByPriority
   * @async
   * @returns {Promise<void>}
   */
  async initializeSectionsByPriority() {
    const sectionIds = Object.keys(this.sectionConfigs);
    
    // Sort by priority
    sectionIds.sort((a, b) => {
      return this.sectionConfigs[a].priority - this.sectionConfigs[b].priority;
    });

    console.log(`📋 Initializing ${sectionIds.length} sections by priority...`);

    // Initialize sections sequentially to avoid overwhelming the server
    for (const sectionId of sectionIds) {
      try {
        await this.initializeSection(sectionId);
        
        // Small delay between sections to prevent server overload
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to initialize section ${sectionId}:`, error);
        // Continue with other sections even if one fails
      }
    }
  }

  /**
   * Initialize section
   * @function initializeSection
   * @async
   * @param {string} sectionId - Section ID
   * @returns {Promise<void>}
   */
  async initializeSection(sectionId) {
    console.log(`🔧 Initializing section: ${sectionId}`);
    
    // Check if section exists in DOM
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) {
      console.warn(`⚠️ Section element ${sectionId} not found in DOM`);
      return;
    }

    // Get section class name from data attribute or convention
    const sectionClassName = this.getSectionClassName(sectionId);
    
    // Check if section class exists
    if (!window[sectionClassName]) {
      console.warn(`⚠️ Section class ${sectionClassName} not found`);
      return;
    }

    try {
      // Create section instance
      const config = this.sectionConfigs[sectionId];
      const sectionInstance = new window[sectionClassName](sectionId, config);
      
      // Initialize section
      await sectionInstance.init();
      
      // Store section instance
      this.sections.set(sectionId, sectionInstance);
      
      console.log(`✅ Section ${sectionId} initialized successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to initialize section ${sectionId}:`, error);
      throw error;
    }
  }

  /**
   * Get section class name
   * @function getSectionClassName
   * @param {string} sectionId - Section ID
   * @returns {string} Section class name
   */
  getSectionClassName(sectionId) {
    // Convert sm-dashboard to SMDashboardSection
    const parts = sectionId.split('-');
    const className = parts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('') + 'Section';
    
    return className;
  }

  /**
   * Setup global event listeners
   * @function setupGlobalEventListeners
   * @returns {void}
   */
  setupGlobalEventListeners() {
    // Global refresh button
    const globalRefreshBtn = document.getElementById('global-refresh-btn');
    if (globalRefreshBtn) {
      globalRefreshBtn.addEventListener('click', () => {
        this.refreshAllSections();
      });
    }

    // Global toggle all sections button
    const globalToggleBtn = document.getElementById('global-toggle-btn');
    if (globalToggleBtn) {
      globalToggleBtn.addEventListener('click', () => {
        this.toggleAllSections();
      });
    }

    // Page visibility change - pause/resume auto-refresh
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoRefresh();
      } else {
        this.resumeAutoRefresh();
      }
    });

    // Page unload - cleanup
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    console.log('✅ Global event listeners setup complete');
  }

  /**
   * Setup global refresh
   * @function setupGlobalRefresh
   * @returns {void}
   */
  setupGlobalRefresh() {
    // Add refresh button to header if not exists
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !document.getElementById('global-refresh-btn')) {
      const refreshBtn = document.createElement('button');
      refreshBtn.id = 'global-refresh-btn';
      refreshBtn.className = 'btn btn-sm btn-outline-primary';
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> רענן הכל';
      refreshBtn.title = 'רענן את כל הסקשנים';
      headerActions.appendChild(refreshBtn);
    }
  }

  /**
   * Setup section toggles
   * @function setupSectionToggles
   * @returns {void}
   */
  setupSectionToggles() {
    // Add toggle all button to header if not exists
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !document.getElementById('global-toggle-btn')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'global-toggle-btn';
      toggleBtn.className = 'btn btn-sm btn-outline-secondary';
      toggleBtn.innerHTML = '<i class="fas fa-eye"></i> הצג/הסתר הכל';
      toggleBtn.title = 'הצג/הסתר את כל הסקשנים';
      headerActions.appendChild(toggleBtn);
    }
  }

  /**
   * Refresh all sections
   * @function refreshAllSections
   * @async
   * @returns {Promise<void>}
   */
  async refreshAllSections() {
    console.log('🔄 Refreshing all sections...');
    
    const refreshPromises = Array.from(this.sections.values()).map(section => {
      return section.refresh().catch(error => {
        console.warn(`⚠️ Failed to refresh section ${section.sectionId}:`, error);
      });
    });

    try {
      await Promise.allSettled(refreshPromises);
      console.log('✅ All sections refresh completed');
    } catch (error) {
      console.error('❌ Some sections failed to refresh:', error);
    }
  }

  /**
   * Toggle all sections
   * @function toggleAllSections
   * @returns {void}
   */
  toggleAllSections() {
    const toggleBtn = document.getElementById('global-toggle-btn');
    const sections = document.querySelectorAll('.sm-section-body');
    
    if (sections.length === 0) return;
    
    // Check if any section is visible
    const anyVisible = Array.from(sections).some(section => 
      section.style.display !== 'none'
    );
    
    // Toggle all sections
    sections.forEach(section => {
      section.style.display = anyVisible ? 'none' : 'block';
    });
    
    // Update toggle button text
    if (toggleBtn) {
      toggleBtn.innerHTML = anyVisible ? 
        '<i class="fas fa-eye-slash"></i> הצג הכל' : 
        '<i class="fas fa-eye"></i> הסתר הכל';
    }
  }

  /**
   * Pause auto refresh
   * @function pauseAutoRefresh
   * @returns {void}
   */
  pauseAutoRefresh() {
    console.log('⏸️ Pausing auto-refresh for all sections');
    this.sections.forEach(section => {
      if (section.autoRefreshInterval) {
        clearInterval(section.autoRefreshInterval);
      }
    });
  }

  /**
   * Resume auto refresh
   * @function resumeAutoRefresh
   * @returns {void}
   */
  resumeAutoRefresh() {
    console.log('▶️ Resuming auto-refresh for all sections');
    this.sections.forEach(section => {
      section.setupAutoRefresh();
    });
  }

  /**
   * Show global loading state
   * @function showGlobalLoadingState
   * @returns {void}
   */
  showGlobalLoadingState() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.insertAdjacentHTML('afterbegin', `
        <div id="global-loading-overlay" class="global-loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin fa-2x"></i>
            </div>
            <h4>מאתחל עמוד ניהול המערכת...</h4>
            <p>אנא המתן בזמן שהמערכת נטענת</p>
          </div>
        </div>
      `);
    }
  }

  /**
   * Hide global loading state
   * @function hideGlobalLoadingState
   * @returns {void}
   */
  hideGlobalLoadingState() {
    const overlay = document.getElementById('global-loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Show global error
   * @function showGlobalError
   * @param {Error} error - Error object
   * @returns {void}
   */
  showGlobalError(error) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.insertAdjacentHTML('afterbegin', `
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">
            <i class="fas fa-exclamation-triangle"></i>
            שגיאה באתחול עמוד ניהול המערכת
          </h4>
          <p>${error.message}</p>
          <hr>
          <p class="mb-0">
            <button class="btn btn-danger btn-sm" onclick="location.reload()">
              <i class="fas fa-refresh"></i> רענן עמוד
            </button>
          </p>
        </div>
      `);
    }
  }

  /**
   * Get system status
   * @function getStatus
   * @returns {Object} System status
   */
  getStatus() {
    const sectionStatuses = {};
    this.sections.forEach((section, sectionId) => {
      sectionStatuses[sectionId] = section.getStatus();
    });

    return {
      isInitialized: this.isInitialized,
      initTime: this.initStartTime ? Date.now() - this.initStartTime : 0,
      totalSections: this.sections.size,
      sections: sectionStatuses,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cleanup system management
   * @function cleanup
   * @returns {void}
   */
  cleanup() {
    console.log('🧹 Cleaning up System Management...');
    
    this.sections.forEach(section => {
      section.cleanup();
    });
    
    this.sections.clear();
    this.isInitialized = false;
    
    console.log('✅ System Management cleanup complete');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Starting System Management initialization...');
    
    // Wait a bit for all scripts to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create and initialize main orchestrator
    window.systemManagementMain = new SystemManagementMain();
    await window.systemManagementMain.init();
    
    console.log('🎉 System Management initialization complete!');
    
  } catch (error) {
    console.error('❌ System Management initialization failed:', error);
  }
});

// Export for global access
window.SystemManagementMain = SystemManagementMain;
