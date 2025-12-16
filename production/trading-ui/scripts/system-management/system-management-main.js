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
        priority: 1,
        // Dashboard is now part of top section, so use special container
        containerId: 'sm-dashboard-content'
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
      'sm-system-settings': {
        autoRefresh: false,
        refreshInterval: 0,
        priority: 10
      },
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

      // Wait for all section classes to load
      await this.waitForScriptsToLoad();

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
   * @param {number} retryCount - Current retry count
   * @returns {Promise<void>}
   */
  async initializeSection(sectionId, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 500;
    
    console.log(`🔧 Initializing section: ${sectionId}`);
    
    // Check if section exists in DOM
    // Special handling for sm-dashboard which is in the top section
    let sectionElement = document.getElementById(sectionId);
    if (!sectionElement && sectionId === 'sm-dashboard') {
      // Try to find the dashboard container in the top section
      sectionElement = document.getElementById('sm-dashboard-content') || 
                      document.querySelector('.top-section[data-section="top"]');
    }
    if (!sectionElement) {
      // For sm-dashboard, this is expected - it's rendered into the top section
      if (sectionId !== 'sm-dashboard') {
        console.warn(`⚠️ Section element ${sectionId} not found in DOM`);
        return;
      }
      // Don't return for sm-dashboard - it will be handled by the section class
    }

    // Get section class name from data attribute or convention
    const sectionClassName = this.getSectionClassName(sectionId);
    
    // Check if section class exists with retry logic
    if (!window[sectionClassName]) {
      if (retryCount < maxRetries) {
        console.warn(`⚠️ Section class ${sectionClassName} not found, retrying... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.initializeSection(sectionId, retryCount + 1);
      } else {
        console.error(`❌ Section class ${sectionClassName} not found after ${maxRetries} retries`);
        return;
      }
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
   * Wait for all required section classes to load
   * @function waitForScriptsToLoad
   * @async
   * @returns {Promise<boolean>} True if all classes loaded, false otherwise
   */
  async waitForScriptsToLoad() {
    const requiredClasses = [
      'SMDashboardSection',
      'SMServerSection',
      'SMCacheSection',
      'SMPerformanceSection',
      'SMExternalDataSection',
      'SMAlertsSection',
      'SMDatabaseSection',
      'SMBackgroundTasksSection',
      'SMOperationsSection',
      'SMSystemSettingsSection'
    ];
    
    const maxWait = 5000; // 5 seconds
    const checkInterval = 100;
    let elapsed = 0;
    
    console.log('⏳ Waiting for section classes to load...');
    
    while (elapsed < maxWait) {
      const missing = requiredClasses.filter(cls => !window[cls]);
      if (missing.length === 0) {
        console.log('✅ All section classes loaded');
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }
    
    const stillMissing = requiredClasses.filter(cls => !window[cls]);
    if (stillMissing.length > 0) {
      console.warn(`⚠️ Some section classes still not loaded: ${stillMissing.join(', ')}`);
    }
    return stillMissing.length === 0;
  }

  /**
   * Get section class name
   * @function getSectionClassName
   * @param {string} sectionId - Section ID
   * @returns {string} Section class name
   */
  getSectionClassName(sectionId) {
    // Convert sm-dashboard to SMDashboardSection
    // Convert sm-system-settings to SMSystemSettingsSection
    const parts = sectionId.split('-');
    // First part should be 'SM' (uppercase), rest should be capitalized
    const className = 'SM' + parts.slice(1).map(part => 
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

    // Quick restart button
    const quickRestartBtn = document.getElementById('quickRestartSystemBtn');
    if (quickRestartBtn) {
      quickRestartBtn.addEventListener('click', async () => {
        try {
          if (window.NotificationSystem) {
            window.NotificationSystem.showInfo('מתחיל איתחול מהיר של השרת...', 'system');
          }
          const response = await fetch('/api/server/restart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restart_type: 'quick' })
          });
          const result = await response.json();
          if (result.status === 'success') {
            if (window.NotificationSystem) {
              window.NotificationSystem.showSuccess('השרת מתחיל מחדש...', 'system');
            }
          } else {
            throw new Error(result.message || 'Restart failed');
          }
        } catch (error) {
          console.error('❌ Restart failed:', error);
          if (window.NotificationSystem) {
            window.NotificationSystem.showError(`שגיאה באיתחול: ${error.message}`, 'system');
          }
        }
      });
    }

    // Change cache mode button
    const changeModeBtn = document.getElementById('changeModeSystemBtn');
    if (changeModeBtn) {
      changeModeBtn.addEventListener('click', () => {
        // Open cache management page for mode change
        window.location.href = '/cache-management';
      });
    }

    // Open server monitor button
    const openServerMonitorBtn = document.getElementById('openServerMonitorBtn');
    if (openServerMonitorBtn) {
      openServerMonitorBtn.addEventListener('click', () => {
        window.location.href = '/server-monitor';
      });
    }

    // Refresh system data button
    const refreshSystemDataBtn = document.getElementById('refreshSystemDataBtn');
    if (refreshSystemDataBtn) {
      refreshSystemDataBtn.addEventListener('click', () => {
        if (window.systemManagementMain) {
          window.systemManagementMain.refreshAllSections();
        }
      });
    }

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
      refreshBtn.textContent = '';
      const icon = document.createElement('i');
      icon.className = 'fas fa-sync-alt';
      refreshBtn.appendChild(icon);
      refreshBtn.appendChild(document.createTextNode(' רענן הכל'));
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
      toggleBtn.textContent = '';
      const icon = document.createElement('i');
      icon.className = 'fas fa-eye';
      toggleBtn.appendChild(icon);
      toggleBtn.appendChild(document.createTextNode(' הצג/הסתר הכל'));
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
    // Use the standard section toggle system
    const sections = document.querySelectorAll('.content-section[data-section]');
    
    if (sections.length === 0) return;
    
    // Check if any section is visible (expanded)
    const anyExpanded = Array.from(sections).some(section => {
      const sectionBody = section.querySelector('.section-body');
      return sectionBody && sectionBody.style.display !== 'none';
    });
    
    // Toggle all sections using the standard toggleSection function
    sections.forEach(section => {
      const sectionId = section.getAttribute('data-section');
      if (sectionId && typeof window.toggleSection === 'function') {
        // If any are expanded, collapse all; otherwise expand all
        if (anyExpanded) {
          // Collapse all
          const sectionBody = section.querySelector('.section-body');
          if (sectionBody) {
            sectionBody.style.display = 'none';
            section.classList.remove('expanded');
            section.classList.add('collapsed');
          }
        } else {
          // Expand all
          const sectionBody = section.querySelector('.section-body');
          if (sectionBody) {
            sectionBody.style.display = 'block';
            section.classList.remove('collapsed');
            section.classList.add('expanded');
          }
        }
      }
    });
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
    
    // Wait a bit for all scripts to load (reduced since we have waitForScriptsToLoad)
    await new Promise(resolve => setTimeout(resolve, 200));
    
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

// Export toggleAllSections as global function for HTML onclick
window.toggleAllSections = function() {
  if (window.systemManagementMain) {
    window.systemManagementMain.toggleAllSections();
  } else {
    console.warn('⚠️ SystemManagementMain not initialized yet');
  }
};
