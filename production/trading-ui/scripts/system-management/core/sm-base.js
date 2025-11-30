/**
 * System Management Base Section - TikTrack
 * ========================================
 * 
 * Base class for all system management sections
 * Provides common functionality and structure
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMBaseSection {
  constructor(sectionId, config = {}) {
    this.sectionId = sectionId;
    this.config = {
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      showLoadingState: true,
      showErrorState: true,
      ...config
    };
    
    this.container = null;
    this.isLoading = false;
    this.lastError = null;
    this.lastData = null;
    this.autoRefreshInterval = null;
    this.isInitialized = false;
    this.retryCount = 0;
  }

  /**
   * Initialize the section
   * אתחול הסקשן
   */
  async init() {
    if (this.isInitialized) {
      console.warn(`⚠️ Section ${this.sectionId} already initialized`);
      return;
    }

    try {
      console.log(`🚀 Initializing section: ${this.sectionId}`);
      
      // Find container - look for section element first, then find section-body within it
      const sectionElement = document.getElementById(this.sectionId);
      if (!sectionElement) {
        throw new Error(`Section container ${this.sectionId} not found`);
      }
      
      // Find section-body within the section element, or use the section element itself as fallback
      this.container = sectionElement.querySelector('.section-body') || sectionElement;

      // Show loading state
      if (this.config.showLoadingState) {
        this.showLoadingState();
      }

      // Load initial data
      await this.loadData();

      // Setup auto-refresh
      this.setupAutoRefresh();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log(`✅ Section ${this.sectionId} initialized successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to initialize section ${this.sectionId}:`, error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'init',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Fetch with timeout
   * קבלת נתונים עם timeout
   * @param {string} url - URL to fetch
   * @param {Object} options - Fetch options
   * @param {number} timeout - Timeout in milliseconds (default: 10000)
   * @returns {Promise<Response>}
   */
  async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Load data with retry logic
   * טעינת נתונים עם לוגיקת retry
   * @param {number} maxRetries - Maximum number of retries (default: 3)
   * @returns {Promise<void>}
   */
  async loadDataWithRetry(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.loadData();
        this.retryCount = 0; // Reset retry count on success
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.warn(`⚠️ Load attempt ${attempt} failed for section ${this.sectionId}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Load data from APIs
   * טעינת נתונים מה-APIs
   * Override this method in child classes
   */
  async loadData() {
    throw new Error('loadData must be implemented by child class');
  }

  /**
   * Render data to UI
   * הצגת נתונים בממשק
   * Override this method in child classes
   */
  render(data) {
    throw new Error('render must be implemented by child class');
  }

  /**
   * Handle errors with retry logic
   * טיפול בשגיאות עם לוגיקת retry
   */
  async handleError(error, context) {
    console.error(`❌ Error in section ${this.sectionId}:`, error);
    
    this.lastError = error;
    
    // Try to retry if we haven't exceeded retry attempts
    if (this.retryCount < this.config.retryAttempts) {
      this.retryCount++;
      console.log(`🔄 Retrying section ${this.sectionId} (attempt ${this.retryCount}/${this.config.retryAttempts})`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * this.retryCount));
      
      try {
        await this.loadData();
        this.retryCount = 0; // Reset retry count on success
        return;
      } catch (retryError) {
        // Continue to error display if retry fails
      }
    }

    // Display error if all retries failed or if showErrorState is enabled
    if (this.config.showErrorState) {
      SMErrorHandler.display(error, this.container, context);
    }
  }

  /**
   * Show loading state
   * הצגת מצב טעינה
   */
  showLoadingState() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="sm-loading-state">
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">טוען...</span>
          </div>
        </div>
        <div class="loading-text">
          <p class="mb-1">טוען נתוני ${this.sectionId}...</p>
          <small class="text-muted">אנא המתן</small>
        </div>
      </div>
    `;
  }

  /**
   * Show empty state
   * הצגת מצב ריק
   */
  showEmptyState(message = 'אין נתונים להצגה') {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="sm-empty-state">
        <i class="fas fa-inbox"></i>
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * Setup auto-refresh
   * הגדרת רענון אוטומטי
   */
  setupAutoRefresh() {
    if (this.config.autoRefresh && !this.autoRefreshInterval) {
      this.autoRefreshInterval = setInterval(async () => {
        try {
          await this.loadData();
        } catch (error) {
          console.warn(`⚠️ Auto-refresh failed for section ${this.sectionId}:`, error);
        }
      }, this.config.refreshInterval);
    }
  }

  /**
   * Setup event listeners
   * הגדרת מאזינים לאירועים
   */
  setupEventListeners() {
    // Listen for manual refresh button clicks
    const refreshBtn = document.querySelector(`[data-section="${this.sectionId}"]`);
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await this.refresh();
      });
    }

    // Listen for section toggle
    const toggleBtn = document.querySelector(`.sm-toggle-btn[data-section="${this.sectionId}"]`);
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleSection();
      });
    }
  }

  /**
   * Manual refresh
   * רענון ידני
   */
  async refresh() {
    console.log(`🔄 Manual refresh for section: ${this.sectionId}`);
    this.retryCount = 0; // Reset retry count
    await this.loadData();
  }

  /**
   * Toggle section visibility
   * החלפת נראות הסקשן
   */
  toggleSection() {
    const sectionBody = this.container?.querySelector('.sm-section-body');
    const toggleBtn = document.querySelector(`.sm-toggle-btn[data-section="${this.sectionId}"]`);
    
    if (sectionBody && toggleBtn) {
      const isHidden = sectionBody.style.display === 'none';
      sectionBody.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? '▼' : '▲';
    }
  }

  /**
   * Cleanup resources
   * ניקוי משאבים
   */
  cleanup() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
    
    this.isInitialized = false;
    console.log(`🧹 Cleaned up section: ${this.sectionId}`);
  }

  /**
   * Get section status
   * קבלת סטטוס הסקשן
   */
  getStatus() {
    return {
      sectionId: this.sectionId,
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      hasError: !!this.lastError,
      lastError: this.lastError,
      hasData: !!this.lastData,
      retryCount: this.retryCount,
      autoRefreshActive: !!this.autoRefreshInterval
    };
  }

  /**
   * Update configuration
   * עדכון הגדרות
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Restart auto-refresh if interval changed
    if (newConfig.refreshInterval && this.autoRefreshInterval) {
      this.cleanup();
      this.setupAutoRefresh();
    }
  }
}

// Export for use in other modules
window.SMBaseSection = SMBaseSection;

