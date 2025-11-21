/**
 * Core Systems Module - TikTrack
 * מערכות ליבה חיוניות
 *
 * @fileoverview מודול מערכות ליבה הכולל את המערכות הבסיסיות ביותר
 * @version 1.0.0
 * @author TikTrack Development Team
 * @created 2025-01-06
 */

// ============================================================================
// GLOBAL FALLBACKS - Bootstrap CDN Failover
// ============================================================================
(() => {
  if (typeof window === 'undefined') {
    return;
  }

  const needsModalFallback = !window.bootstrap || !window.bootstrap.Modal;
  const needsTooltipFallback = !window.bootstrap || !window.bootstrap.Tooltip;

  if (!needsModalFallback && !needsTooltipFallback) {
    return;
  }

  console.warn(
    '⚠️ [Bootstrap Fallback] Bootstrap assets not available - installing lightweight fallback for modals/tooltips'
  );

  const dispatchEvent = (element, name) => {
    if (!element) {
      return;
    }
    try {
      const event = new Event(name, { bubbles: true, cancelable: false });
      element.dispatchEvent(event);
    } catch (error) {
      // Older browsers fallback
      try {
        const event = document.createEvent('Event');
        event.initEvent(name, true, false);
        element.dispatchEvent(event);
      } catch (e) {
        console.error('❌ [Bootstrap Fallback] Failed to dispatch event', name, e);
      }
    }
  };

  class BootstrapModalFallback {
    constructor(element, options = {}) {
      if (!element) {
        throw new Error('BootstrapModalFallback requires a DOM element');
      }
      this._element = element;
      this._options = {
        backdrop: options.backdrop !== undefined ? options.backdrop : true,
        keyboard: options.keyboard !== undefined ? options.keyboard : true,
        focus: options.focus !== undefined ? options.focus : true,
      };
      this._isShown = false;
      this._backdrop = null;
      this._handleKeydown = null;
      this._previouslyFocused = null;
      BootstrapModalFallback._instances.set(element, this);
    }

    show() {
      if (this._isShown) {
        return;
      }

      dispatchEvent(this._element, 'show.bs.modal');
      this._isShown = true;

      if (this._options.backdrop !== false) {
        this._createBackdrop();
      }

      this._element.style.display = 'block';
      this._element.removeAttribute('aria-hidden');
      this._element.setAttribute('aria-modal', 'true');
      this._element.classList.add('show');

      document.body.classList.add('modal-open');
      this._originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      if (this._options.focus !== false) {
        this._previouslyFocused = document.activeElement;
        try {
          this._element.focus({ preventScroll: true });
        } catch (error) {
          // ignore focus errors
        }
      }

      if (this._options.keyboard !== false) {
        this._handleKeydown = event => {
          if (event.key === 'Escape') {
            this.hide();
          }
        };
        document.addEventListener('keydown', this._handleKeydown);
      }

      setTimeout(() => dispatchEvent(this._element, 'shown.bs.modal'), 0);
    }

    hide() {
      if (!this._isShown) {
        return;
      }

      dispatchEvent(this._element, 'hide.bs.modal');
      this._isShown = false;

      if (this._handleKeydown) {
        document.removeEventListener('keydown', this._handleKeydown);
        this._handleKeydown = null;
      }

      if (this._options.backdrop !== false && this._backdrop) {
        this._backdrop.remove();
        this._backdrop = null;
      }

      this._element.classList.remove('show');
      this._element.style.display = 'none';
      this._element.setAttribute('aria-hidden', 'true');
      this._element.removeAttribute('aria-modal');

      document.body.classList.remove('modal-open');
      if (this._originalBodyOverflow !== undefined) {
        document.body.style.overflow = this._originalBodyOverflow;
      }

      if (this._previouslyFocused && typeof this._previouslyFocused.focus === 'function') {
        try {
          this._previouslyFocused.focus({ preventScroll: true });
        } catch (error) {
          // ignore focus errors
        }
      }
      this._previouslyFocused = null;

      setTimeout(() => dispatchEvent(this._element, 'hidden.bs.modal'), 0);
    }

    toggle() {
      if (this._isShown) {
        this.hide();
      } else {
        this.show();
      }
    }

    dispose() {
      this.hide();
      BootstrapModalFallback._instances.delete(this._element);
      this._element = null;
    }

    _createBackdrop() {
      if (this._backdrop) {
        return;
      }
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      this._backdrop = backdrop;
    }

    static getInstance(element) {
      return BootstrapModalFallback._instances.get(element) || null;
    }

    static get VERSION() {
      return 'fallback-1.0.0';
    }
  }

  BootstrapModalFallback._instances = new WeakMap();

  BootstrapModalFallback.getOrCreateInstance = function (element, options = {}) {
    const existingInstance = BootstrapModalFallback.getInstance(element);
    return existingInstance || new BootstrapModalFallback(element, options);
  };

  class BootstrapTooltipFallback {
    constructor(element, options = {}) {
      if (!element) {
        throw new Error('BootstrapTooltipFallback requires a DOM element');
      }
      this._element = element;
      this._options = options;
      BootstrapTooltipFallback._instances.set(element, this);

      const title =
        options?.title ||
        element.getAttribute('title') ||
        element.getAttribute('data-bs-original-title');
      if (title) {
        element.setAttribute('data-bs-original-title', title);
        element.setAttribute('title', title);
      }
    }

    dispose() {
      BootstrapTooltipFallback._instances.delete(this._element);
    }

    static getInstance(element) {
      return BootstrapTooltipFallback._instances.get(element) || null;
    }

    static get VERSION() {
      return 'fallback-1.0.0';
    }
  }

  BootstrapTooltipFallback._instances = new WeakMap();

  const bootstrapGlobal = window.bootstrap ? { ...window.bootstrap } : {};
  if (needsModalFallback) {
    bootstrapGlobal.Modal = BootstrapModalFallback;
  }
  if (needsTooltipFallback) {
    bootstrapGlobal.Tooltip = BootstrapTooltipFallback;
  }
  bootstrapGlobal.__isFallback = true;

  window.bootstrap = bootstrapGlobal;
})();

// ===== UNIFIED APP INITIALIZER =====

if (typeof window.UnifiedAppInitializer === 'undefined') {
  class UnifiedAppInitializer {
    constructor() {
      this.initialized = false;
      this.initializationInProgress = false;
      this.pageInfo = null;
      this.availableSystems = new Set();
      this.performanceMetrics = {
        startTime: null,
        endTime: null,
        stageTimes: {},
        totalTime: 0,
      };
      this.errorHandlers = [];
      this.customInitializers = [];
      this.legacySupport = true;
      this._preferencesInitialized = false; // Track preferences initialization to prevent duplicates

      // Dynamic Loading Support
      this.dynamicLoadingEnabled = false; // Static loading only
      this.loadedModules = new Set();
      this.moduleDependencies = new Map();
      this.loadingPromises = new Map();
      this.moduleConfigs = new Map();

      // Initialize module configurations
      this.initializeModuleConfigs();
    }

    /**
     * Initialize module configurations for dynamic loading
     * אתחול תצורות מודולים לטעינה דינמית
     */
    initializeModuleConfigs() {
      this.moduleConfigs.set('core-systems', {
        name: 'Core Systems',
        path: 'modules/core-systems.js',
        priority: 1,
        dependencies: [],
        required: true,
        size: '92KB',
      });

      this.moduleConfigs.set('ui-basic', {
        name: 'UI Basic',
        path: 'modules/ui-basic.js',
        priority: 2,
        dependencies: ['core-systems'],
        required: false,
        size: '56KB',
      });

      this.moduleConfigs.set('data-basic', {
        name: 'Data Basic',
        path: 'modules/data-basic.js',
        priority: 2,
        dependencies: ['core-systems'],
        required: false,
        size: '81KB',
      });

      this.moduleConfigs.set('ui-advanced', {
        name: 'UI Advanced',
        path: 'modules/ui-advanced.js',
        priority: 3,
        dependencies: ['ui-basic'],
        required: false,
        size: '100KB',
      });

      this.moduleConfigs.set('data-advanced', {
        name: 'Data Advanced',
        path: 'modules/data-advanced.js',
        priority: 3,
        dependencies: ['data-basic'],
        required: false,
        size: '14KB',
      });

      this.moduleConfigs.set('business-module', {
        name: 'Business Module',
        path: 'modules/business-module.js',
        priority: 4,
        dependencies: ['data-basic', 'ui-basic'],
        required: false,
        size: '124KB',
      });

      this.moduleConfigs.set('communication-module', {
        name: 'Communication Module',
        path: 'modules/communication-module.js',
        priority: 4,
        dependencies: ['core-systems'],
        required: false,
        size: '6.1KB',
      });

      this.moduleConfigs.set('cache-module', {
        name: 'Cache Module',
        path: 'modules/cache-module.js',
        priority: 2,
        dependencies: ['core-systems'],
        required: false,
        size: '38KB',
      });

      console.log('🔧 Module configurations initialized:', this.moduleConfigs.size, 'modules');
    }

    /**
     * Load module dynamically
     * טעינת מודול דינמית
     *
     * @param {string} moduleName - Name of module to load
     * @returns {Promise<boolean>} Success status
     */
    async loadModule(moduleName) {
      if (this.loadedModules.has(moduleName)) {
        // console.log(`✅ Module ${moduleName} already loaded`);
        return true;
      }

      // Special check for core-systems - if UnifiedAppInitializer exists, mark as loaded
      if (moduleName === 'core-systems' && window.UnifiedAppInitializer) {
        // console.log(`✅ Module ${moduleName} already loaded (UnifiedAppInitializer exists)`);
        this.loadedModules.add(moduleName);
        return true;
      }

      if (this.loadingPromises.has(moduleName)) {
        console.log(`⏳ Module ${moduleName} already loading...`);
        return await this.loadingPromises.get(moduleName);
      }

      const config = this.moduleConfigs.get(moduleName);
      if (!config) {
        console.error(`❌ Module ${moduleName} not found in configurations`);
        return false;
      }

      console.log(`🚀 Loading module: ${config.name} (${config.size})`);

      const loadingPromise = this._loadModuleScript(moduleName, config);
      this.loadingPromises.set(moduleName, loadingPromise);

      try {
        const success = await loadingPromise;
        if (success) {
          this.loadedModules.add(moduleName);
          console.log(`✅ Module ${moduleName} loaded successfully`);
        }
        return success;
      } finally {
        this.loadingPromises.delete(moduleName);
      }
    }

    /**
     * Load module script
     * טעינת סקריפט מודול
     *
     * @param {string} moduleName - Module name
     * @param {Object} config - Module configuration
     * @returns {Promise<boolean>} Success status
     */
    async _loadModuleScript(moduleName, config) {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector(`script[data-module="${moduleName}"]`);
        if (existingScript) {
          // console.log(`✅ Module ${moduleName} script already exists`);
          resolve(true);
          return;
        }

        // Special check for core-systems module - check if UnifiedAppInitializer already exists
        if (moduleName === 'core-systems' && window.UnifiedAppInitializer) {
          // console.log(`✅ Module ${moduleName} already loaded (UnifiedAppInitializer exists)`);
          resolve(true);
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = `scripts/${config.path}`;
        script.setAttribute('data-module', moduleName);
        script.setAttribute('data-priority', config.priority);
        script.setAttribute('data-size', config.size);

        // Handle load success
        script.onload = () => {
          // console.log(`✅ Module ${moduleName} script loaded successfully`);
          resolve(true);
        };

        // Handle load error
        script.onerror = error => {
          console.error(`❌ Failed to load module ${moduleName}:`, error);
          resolve(false);
        };

        // Add to document
        document.head.appendChild(script);
      });
    }

    /**
     * Load modules based on page requirements
     * טעינת מודולים לפי דרישות העמוד
     *
     * @param {Object} pageConfig - Page configuration
     * @returns {Promise<boolean>} Success status
     */
    async loadRequiredModules(pageConfig) {
      console.log('🔧 Loading required modules for page:', pageConfig.name);

      const requiredModules = this.getRequiredModules(pageConfig);
      console.log('📋 Required modules:', requiredModules);

      // Special handling for core-systems - if already loaded, mark as loaded
      if (requiredModules.includes('core-systems') && window.UnifiedAppInitializer) {
        // console.log('✅ Core systems already loaded, marking as loaded');
        this.loadedModules.add('core-systems');
      }

      // Load modules in priority order
      const sortedModules = this.sortModulesByPriority(requiredModules);

      for (const moduleName of sortedModules) {
        const success = await this.loadModule(moduleName);
        if (!success && this.moduleConfigs.get(moduleName).required) {
          console.error(`❌ Failed to load required module: ${moduleName}`);
          return false;
        }
      }

      // console.log('✅ All required modules loaded successfully');
      return true;
    }

    /**
     * Get required modules for page
     * קבלת מודולים נדרשים לעמוד
     *
     * @param {Object} pageConfig - Page configuration
     * @returns {Array<string>} Required module names
     */
    getRequiredModules(pageConfig) {
      const required = ['core-systems']; // Always required

      // Add modules based on page requirements
      if (pageConfig.requiresTables || pageConfig.requiresValidation) {
        required.push('data-basic');
      }

      if (pageConfig.requiresFilters || pageConfig.requiresCharts || pageConfig.requiresUI) {
        required.push('ui-basic');
      }

      if (pageConfig.requiresCharts) {
        required.push('ui-advanced');
      }

      if (pageConfig.requiresDataExport || pageConfig.requiresDataImport) {
        required.push('data-advanced');
      }

      if (pageConfig.requiresBusinessLogic) {
        required.push('business-module');
      }

      if (pageConfig.requiresCommunication) {
        required.push('communication-module');
      }

      if (pageConfig.requiresCache) {
        required.push('cache-module');
      }

      // TEMPORARY FIX: Always load ui-advanced and business-module for trading pages
      // This ensures getTableColors and handleFunctionNotFound are available
      if (pageConfig.name && ['Executions', 'Trades', 'Alerts'].includes(pageConfig.name)) {
        if (!required.includes('ui-advanced')) {
          required.push('ui-advanced');
        }
        if (!required.includes('business-module')) {
          required.push('business-module');
        }
      }

      return [...new Set(required)]; // Remove duplicates
    }

    /**
     * Sort modules by priority
     * מיון מודולים לפי עדיפות
     *
     * @param {Array<string>} moduleNames - Module names
     * @returns {Array<string>} Sorted module names
     */
    sortModulesByPriority(moduleNames) {
      return moduleNames.sort((a, b) => {
        const configA = this.moduleConfigs.get(a);
        const configB = this.moduleConfigs.get(b);
        return (configA?.priority || 999) - (configB?.priority || 999);
      });
    }

    /**
     * Get loading statistics
     * קבלת סטטיסטיקות טעינה
     *
     * @returns {Object} Loading statistics
     */
    getLoadingStats() {
      const totalModules = this.moduleConfigs.size;
      const loadedModules = this.loadedModules.size;
      const loadingModules = this.loadingPromises.size;

      let totalSize = 0;
      let loadedSize = 0;

      for (const [name, config] of this.moduleConfigs) {
        const size = parseInt(config.size.replace('KB', ''));
        totalSize += size;

        if (this.loadedModules.has(name)) {
          loadedSize += size;
        }
      }

      return {
        totalModules,
        loadedModules,
        loadingModules,
        totalSize: `${totalSize}KB`,
        loadedSize: `${loadedSize}KB`,
        loadingProgress: `${Math.round((loadedModules / totalModules) * 100)}%`,
      };
    }

    /**
     * Main initialization function - Single Point of Entry
     */
    async initialize() {
      if (this.initialized) {
        // console.log('✅ Application already initialized');
        return this.getStatus();
      }

      if (this.initializationInProgress) {
        console.log('⏳ Initialization already in progress...');
        return this.getStatus();
      }

      console.log('🎯 Starting Unified App Initialization...');
      this.initializationInProgress = true;
      this.performanceMetrics.startTime = Date.now();

      try {
        // Stage 1: Detect and analyze
        await this.detectAndAnalyze();

        // Stage 2: Prepare configuration
        const config = this.prepareConfiguration();

        // Stage 3: Execute initialization
        await this.executeInitialization(config);

        // Stage 4: Finalize
        await this.finalizeInitialization(config);

        this.performanceMetrics.endTime = Date.now();
        this.performanceMetrics.totalTime =
          this.performanceMetrics.endTime - this.performanceMetrics.startTime;

        this.initialized = true;
        this.logSuccess();

        return this.getStatus();
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.initializationInProgress = false;
      }
    }

    /**
     * Stage 1: Detect and analyze page and systems
     */
    async detectAndAnalyze() {
      console.log('🔍 Stage 1: Detecting and analyzing...');
      const stageStart = Date.now();

      // Detect page information
      this.pageInfo = this.detectPageInfo();

      // Detect available systems
      this.availableSystems = this.detectAvailableSystems();

      // Analyze page requirements
      this.analyzePageRequirements();

      this.performanceMetrics.stageTimes.detect = Date.now() - stageStart;
      console.log('✅ Stage 1 Complete:', {
        page: this.pageInfo.name,
        systems: this.availableSystems.size,
        requirements: this.pageInfo.requirements,
      });
    }

    /**
     * Stage 2: Prepare optimal configuration
     */
    prepareConfiguration() {
      console.log('⚙️ Stage 2: Preparing configuration...');
      const stageStart = Date.now();

      // Load page-specific configuration from page-initialization-configs.js
      let pageConfig = null;
      // Debug info only in verbose mode

      if (
        typeof window.pageInitializationConfigs !== 'undefined' &&
        window.pageInitializationConfigs[this.pageInfo.name]
      ) {
        pageConfig = window.pageInitializationConfigs[this.pageInfo.name];
        console.log(`📋 Loaded page config for ${this.pageInfo.name}:`, pageConfig);
      } else if (
        typeof window.PAGE_CONFIGS !== 'undefined' &&
        window.PAGE_CONFIGS[this.pageInfo.name]
      ) {
        // Fallback to PAGE_CONFIGS if pageInitializationConfigs not available
        pageConfig = window.PAGE_CONFIGS[this.pageInfo.name];
        console.log(`📋 Loaded page config from PAGE_CONFIGS for ${this.pageInfo.name}:`, pageConfig);
      } else {
        console.log(`⚠️ No page config found for ${this.pageInfo.name}`);
      }

      // Store custom initializers from page config
      if (pageConfig?.customInitializers) {
        this.customInitializers = pageConfig.customInitializers;
      }

      const config = {
        name: this.pageInfo.name,
        type: pageConfig?.pageType || this.pageInfo.type,
        requiresFilters: pageConfig?.requiresFilters ?? this.pageInfo.requirements.filters,
        requiresValidation: pageConfig?.requiresValidation ?? this.pageInfo.requirements.validation,
        requiresTables: pageConfig?.requiresTables ?? this.pageInfo.requirements.tables,
        requiresCharts: this.pageInfo.requirements.charts,
        customInitializers: this.customInitializers,
        availableSystems: Array.from(this.availableSystems),
        // Add packages and metadata from pageConfig (critical for preferences initialization)
        packages: pageConfig?.packages || [],
        requiredGlobals: pageConfig?.requiredGlobals || [],
        description: pageConfig?.description || '',
        pageType: pageConfig?.pageType || this.pageInfo.type,
        preloadAssets: pageConfig?.preloadAssets || [],
        cacheStrategy: pageConfig?.cacheStrategy || 'standard',
      };

      this.performanceMetrics.stageTimes.prepare = Date.now() - stageStart;
      console.log('✅ Stage 2 Complete:', config);

      return config;
    }

    /**
     * Validate required dependencies before initialization
     * בדיקת תלויות נדרשות לפני אתחול
     * @private
     * @returns {Object} Validation result with missing dependencies
     */
    _validateRequiredDependencies() {
      const required = {
        UnifiedCacheManager: {
          available:
            typeof window.UnifiedCacheManager !== 'undefined' &&
            window.UnifiedCacheManager !== null,
          initialized: window.UnifiedCacheManager?.initialized === true,
          optional: false,
        },
        PreferencesCore: {
          available:
            typeof window.PreferencesCore !== 'undefined' && window.PreferencesCore !== null,
          initialized: window.PreferencesCore?.initialized === true || true, // PreferencesCore doesn't have explicit initialized flag
          optional: false,
        },
        Logger: {
          available: typeof window.Logger !== 'undefined' && window.Logger !== null,
          initialized: window.Logger?.initialized !== false, // Logger usually doesn't have explicit initialized flag
          optional: false,
        },
        NotificationSystem: {
          available:
            typeof window.NotificationSystem !== 'undefined' && window.NotificationSystem !== null,
          initialized: window.NotificationSystem?.initialized !== false,
          optional: false,
        },
        ActionsMenuSystem: {
          available:
            typeof window.ActionsMenuSystem !== 'undefined' && window.ActionsMenuSystem !== null,
          initialized: true, // ActionsMenuSystem doesn't have explicit initialized flag
          optional: false,
        },
        HeaderSystem: {
          available: typeof window.HeaderSystem !== 'undefined' && window.HeaderSystem !== null,
          initialized: true, // HeaderSystem doesn't have explicit initialized flag
          optional: false,
        },
        toggleSection: {
          available: typeof window.toggleSection === 'function',
          initialized: true, // toggleSection is a function, not a system
          optional: true, // Indirect dependency, can work without it
        },
      };

      const missing = [];
      const notInitialized = [];

      for (const [name, dep] of Object.entries(required)) {
        if (!dep.optional) {
          if (!dep.available) {
            missing.push(name);
          } else if (!dep.initialized) {
            notInitialized.push(name);
          }
        }
      }

      return {
        allAvailable: missing.length === 0,
        allInitialized: notInitialized.length === 0,
        missing,
        notInitialized,
        details: required,
      };
    }

    /**
     * Stage 3: Execute initialization
     */
    async executeInitialization(config) {
      console.log('🚀 Stage 3: Executing initialization...');
      const stageStart = Date.now();

      try {
        // Log package loading if packages are defined
        if (config.packages && config.packages.length > 0) {
          this.logPackageLoading(config.packages);
        }

        // Static loading - all modules already loaded
        console.log('✅ Static loading - all modules already loaded');

        // Validate required dependencies BEFORE initialization
        console.log('🔍 Validating required dependencies...');
        const dependencyCheck = this._validateRequiredDependencies();

        if (!dependencyCheck.allAvailable) {
          const errorMsg = `❌ Missing required dependencies: ${dependencyCheck.missing.join(', ')}`;
          console.error(errorMsg);
          if (typeof window.Logger !== 'undefined' && window.Logger.error) {
            window.Logger.error(
              errorMsg,
              { missing: dependencyCheck.missing },
              { page: 'core-systems' }
            );
          }
          // Continue with fallback - don't throw, but log warning
          console.warn('⚠️ Continuing with missing dependencies - some features may not work');
        } else {
          console.log('✅ All required dependencies available');
        }

        if (!dependencyCheck.allInitialized && dependencyCheck.notInitialized.length > 0) {
          console.warn(
            `⚠️ Some dependencies not initialized: ${dependencyCheck.notInitialized.join(', ')}`
          );
          console.warn('⚠️ Will attempt to initialize them or use fallbacks');
        }

        // Initialize IndexedDB first (blocking) to prevent race conditions
        await this.initializeCacheSystem();

        // Minimal delay for IndexedDB stability (reduced from 500ms for performance)
        await new Promise(resolve => setTimeout(resolve, 50));

        // Verify cache system is ready
        console.log('🔍 Verifying cache system readiness...');
        console.log('UnifiedCacheManager available:', !!window.UnifiedCacheManager);

        if (window.UnifiedCacheManager) {
          console.log('UnifiedCacheManager initialized:', window.UnifiedCacheManager.initialized);
        } else if (!dependencyCheck.details.UnifiedCacheManager.optional) {
          console.error(
            '❌ UnifiedCacheManager is required but not available - using localStorage fallback'
          );
        }

        // Set global flag for other systems
        window.cacheSystemReady =
          window.UnifiedCacheManager && window.UnifiedCacheManager.initialized;

        if (window.cacheSystemReady) {
          console.log('✅ Cache system ready (4-layer architecture)');
        } else {
          console.log('⚠️ Cache system not ready, using localStorage fallback');
        }

        // Initialize preferences system (standardized loading for all pages)
        // This ensures single point of entry, proper cache usage, and no duplicate API calls
        await this.initializePreferencesForPage(config);

        // Use the application initializer if available
        if (typeof window.initializeApplication === 'function') {
          console.log('🔧 Using application initializer with config:', config);
          await window.initializeApplication(config);
        } else {
          console.log('⚠️ Application initializer not found, using manual initialization');
          // Fallback to manual initialization
          await this.manualInitialization(config);
        }
      } catch (error) {
        if (typeof window.Logger !== 'undefined' && window.Logger.error) {
          window.Logger.error('❌ Error in executeInitialization:', error, {
            page: 'core-systems',
          });
        } else {
          console.error('❌ Error in executeInitialization:', error);
        }
        throw error;
      } finally {
        this.performanceMetrics.stageTimes.execute = Date.now() - stageStart;
        console.log('✅ Stage 3 Complete');
      }
    }

    /**
     * Log package loading
     */
    logPackageLoading(packages) {
      if (!packages || packages.length === 0) return;

      console.group('📦 טוען חבילות:');
      packages.forEach(pkgName => {
        const pkg = window.PACKAGE_MANIFEST?.[pkgName];
        if (pkg) {
          console.log(`  ✓ ${pkg.name} (${pkg.scripts.length} סקריפטים, ~${pkg.initTime})`);
        } else {
          console.warn(`  ⚠️ ${pkgName} (לא מוגדר)`);
        }
      });
      console.groupEnd();
    }

    /**
     * Manual initialization fallback
     * Called when window.initializeApplication is not available
     */
    async manualInitialization(config) {
      console.log('🔧 Manual initialization fallback...');

      // Initialize Header + Notifications + Actions Menu System in parallel (all independent of cache)
      console.log('🎯 Initializing UI Systems in parallel...');
      await Promise.all([
        // Header System - has localStorage fallback, doesn't need cache
        (async () => {
          if (typeof window.initializeHeaderSystem === 'function') {
            console.log('🎯 Initializing Header System...');
            window.initializeHeaderSystem();
          } else {
            console.warn('⚠️ initializeHeaderSystem not available');
          }
        })(),

        // Notification System
        (async () => {
          if (
            this.availableSystems.has('notification') &&
            typeof window.NotificationSystem !== 'undefined'
          ) {
            console.log('🔔 Initializing Notification System...');
            await window.NotificationSystem.initialize();
          }
        })(),

        // Actions Menu System - required for table action menus
        (async () => {
          if (typeof window.ActionsMenuSystem !== 'undefined') {
            console.log('🎯 Initializing Actions Menu System...');
            // Initialize ActionsMenuSystem instance if not already initialized
            if (!window.actionsMenuSystemInstance) {
              window.actionsMenuSystemInstance = new window.ActionsMenuSystem();
              console.log('✅ Actions Menu System instance created');
            } else {
              console.log('✅ Actions Menu System already initialized');
            }
          } else {
            console.warn('⚠️ ActionsMenuSystem not available');
          }
        })(),
      ]);
      console.log('✅ UI Systems initialized');

      // Initialize page-specific systems
      if (config.requiresFilters && this.availableSystems.has('pageFilters')) {
        await window.initializePageFilters(config.name);
      }

      if (config.requiresValidation && this.availableSystems.has('validation')) {
        const forms = document.querySelectorAll('form[id]');
        for (const form of forms) {
          await window.initializeValidation(form.id);
        }
      }

      if (config.requiresTables && this.availableSystems.has('tables')) {
        window.setupSortableHeaders();
      }

      console.log('✅ Manual initialization completed');
    }

    /**
     * Initialize preferences system for the page
     * Standardized preferences loading - single point of entry for all pages
     * 
     * @param {Object} config - Page configuration
     * @returns {Promise<void>}
     */
    async initializePreferencesForPage(config) {
      // Check if page has preferences package
      console.log('📦 Checking packages for preferences:', config.packages);
      if (!config.packages || !config.packages.includes('preferences')) {
        console.log('⏭️ Page does not require preferences package, skipping initialization');
        return; // Page doesn't need preferences
      }

      // Get page name from pageInfo (detected from URL) or config
      const pageName = this.pageInfo?.name || 'unknown';
      const isPreferencesPage = pageName === 'preferences';

      // Deduplication: prevent multiple calls
      if (this._preferencesInitialized) {
        window.Logger?.debug?.('⏭️ Preferences already initialized, skipping', {
          page: 'core-systems',
          pageName,
        });
        return;
      }

      try {
        // Preferences page: use PreferencesUIV4 with lazy loading first (like other pages)
        // This ensures preferences are loaded to window.currentPreferences before UI initialization
        if (isPreferencesPage) {
          // First: Bootstrap to get profile context and determine correct userId/profileId
          let resolvedUserId = 1;
          let resolvedProfileId = 0;
          
          if (window.PreferencesV4 && typeof window.PreferencesV4.bootstrap === 'function') {
            try {
              // Updated to match actual group names in database:
              // - ui_settings (not 'ui')
              // - trading_settings (not 'trading')
              // - colors_unified (not 'colors')
              const bootstrapResult = await window.PreferencesV4.bootstrap(['ui_settings', 'trading_settings', 'colors_unified'], null, 1);
              const profileContext = bootstrapResult?.profileContext;
              if (profileContext) {
                resolvedUserId = profileContext?.user_id ?? profileContext?.user?.id ?? 1;
                resolvedProfileId = profileContext?.resolved_profile_id ?? profileContext?.resolved_profile?.id ?? 0;
                window.Logger?.info?.('📄 Bootstrapped profile context for preferences page', {
                  page: 'core-systems',
                  pageName,
                  userId: resolvedUserId,
                  profileId: resolvedProfileId,
                });
              }
            } catch (bootstrapError) {
              window.Logger?.warn?.('⚠️ Bootstrap failed for preferences page, using defaults', {
                page: 'core-systems',
                pageName,
                error: bootstrapError?.message,
              });
            }
          }
          
          // Second: Initialize lazy loading with correct userId/profileId
          if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
            const initStartTime = performance.now();
            window.Logger?.info?.('📄 Initializing preferences with lazy loading for preferences page', {
              page: 'core-systems',
              pageName,
              userId: resolvedUserId,
              profileId: resolvedProfileId,
            });
            
            // Detect environment for timeout configuration
            const environment = window.API_ENV || 'development';
            const timeoutMs = environment === 'production' ? 5000 : 3000;
            
            // Initialize with correct userId/profileId to ensure preferences are loaded for the right profile
            const initPromise = window.PreferencesCore.initializeWithLazyLoading(resolvedUserId, resolvedProfileId);
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error(`Preferences initialization timeout after ${timeoutMs}ms`));
              }, timeoutMs);
            });
            
            try {
              await Promise.race([initPromise, timeoutPromise]);
              const initDuration = performance.now() - initStartTime;
              window.Logger?.info?.('✅ Preferences lazy loading initialized for preferences page', {
                page: 'core-systems',
                pageName,
                duration: `${initDuration.toFixed(2)}ms`,
                environment,
                userId: resolvedUserId,
                profileId: resolvedProfileId,
              });
            } catch (error) {
              const initDuration = performance.now() - initStartTime;
              window.Logger?.warn?.('⚠️ Preferences lazy loading initialization failed or timed out for preferences page', {
                page: 'core-systems',
                pageName,
                duration: `${initDuration.toFixed(2)}ms`,
                environment,
                error: error?.message || error,
              });
              // Continue - don't block page load
            }
          }
          
          // Third: Initialize UI (this will populate forms and display preferences)
          if (window.PreferencesUIV4 && typeof window.PreferencesUIV4.initialize === 'function') {
            window.Logger?.info?.('📄 Initializing Preferences UI V4 for preferences page', {
              page: 'core-systems',
              pageName,
            });
            await window.PreferencesUIV4.initialize();
            this._preferencesInitialized = true;
            return;
          } else if (window.PreferencesUI && typeof window.PreferencesUI.initialize === 'function') {
            // Fallback to PreferencesUI if V4 not available
            window.Logger?.info?.('📄 Initializing Preferences UI (legacy) for preferences page', {
              page: 'core-systems',
              pageName,
            });
            await window.PreferencesUI.initialize();
            this._preferencesInitialized = true;
            return;
          }
        }

        // Other pages: use PreferencesCore.initializeWithLazyLoading() with cache (force: false)
        // This loads critical preferences immediately from cache if available, rest in background
        if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
          const initStartTime = performance.now();
          window.Logger?.info?.('📄 Initializing preferences with lazy loading (using cache)', {
            page: 'core-systems',
            pageName,
          });
          
          // Detect environment for timeout configuration
          const environment = window.API_ENV || 'development';
          const timeoutMs = environment === 'production' ? 5000 : 3000; // Production: 5s, Development: 3s
          
          // Initialize with await to ensure critical preferences are loaded before continuing
          // Use Promise.race with timeout to prevent indefinite blocking
          const initPromise = window.PreferencesCore.initializeWithLazyLoading();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Preferences initialization timeout after ${timeoutMs}ms`));
            }, timeoutMs);
          });
          
          try {
            await Promise.race([initPromise, timeoutPromise]);
            const initDuration = performance.now() - initStartTime;
            window.Logger?.info?.('✅ Preferences lazy loading initialized successfully', {
              page: 'core-systems',
              pageName,
              duration: `${initDuration.toFixed(2)}ms`,
              environment,
            });
          } catch (error) {
            const initDuration = performance.now() - initStartTime;
            window.Logger?.warn?.('⚠️ Preferences lazy loading initialization failed or timed out', {
              page: 'core-systems',
              pageName,
              duration: `${initDuration.toFixed(2)}ms`,
              environment,
              error: error?.message || error,
            });
            // Continue initialization even if preferences loading fails - don't block page load
          }
          
          this._preferencesInitialized = true;
        } else {
          window.Logger?.warn?.('⚠️ PreferencesCore.initializeWithLazyLoading not available', {
            page: 'core-systems',
            pageName,
          });
        }
      } catch (error) {
        window.Logger?.error?.('❌ Error initializing preferences', {
          page: 'core-systems',
          pageName,
          error: error?.message || error,
        });
        // Don't throw - preferences loading failure shouldn't block page initialization
      }
    }

    /**
     * Stage 4: Finalize initialization
     */
    async finalizeInitialization(config) {
      console.log('🎯 Stage 4: Finalizing...');
      const stageStart = Date.now();

      // Restore page state
      if (typeof window.loadPageState === 'function') {
        await window.loadPageState();
      }

      // Initialize globalInitializationState if not exists
      if (!window.globalInitializationState) {
        window.globalInitializationState = {
          unifiedAppInitialized: false,
          unifiedAppInitializing: false,
          pageInitializers: new Map(),
          customInitializers: new Map(),
        };
      }
      if (!window.globalInitializationState.customInitializers) {
        window.globalInitializationState.customInitializers = new Map();
      }

      // Execute custom finalizers with double initialization prevention
      // Check if customInitializers exists and is an array
      if (!this.customInitializers || !Array.isArray(this.customInitializers)) {
        console.log('⚠️ No custom initializers found or not an array, skipping...');
        return;
      }

      if (!this.pageInfo || !this.pageInfo.name) {
        console.warn('⚠️ pageInfo or pageInfo.name is missing, cannot execute custom initializers');
        return;
      }

      console.log('🔧 Executing custom initializers:', this.customInitializers.length);
      for (let i = 0; i < this.customInitializers.length; i++) {
        const initializer = this.customInitializers[i];
        const initializerKey = `${this.pageInfo.name}_${i}`;

        // Ensure globalInitializationState exists before accessing it
        if (!window.globalInitializationState) {
          window.globalInitializationState = {
            unifiedAppInitialized: false,
            unifiedAppInitializing: false,
            pageInitializers: new Map(),
            customInitializers: new Map(),
          };
        }
        if (!window.globalInitializationState.customInitializers) {
          window.globalInitializationState.customInitializers = new Map();
        }

        // Check if this initializer was already executed
        if (window.globalInitializationState.customInitializers.has(initializerKey)) {
          console.log(`⚠️ Custom initializer ${i + 1} already executed, skipping...`);
          continue;
        }

        console.log(
          `🔧 Executing custom initializer ${i + 1}/${this.customInitializers.length}:`,
          typeof initializer
        );
        if (typeof initializer === 'function') {
          try {
            // Pass config to initializer (as in unified-app-initializer.js)
            await initializer(config || {});
            // Ensure globalInitializationState still exists before marking as executed
            if (!window.globalInitializationState) {
              window.globalInitializationState = {
                unifiedAppInitialized: false,
                unifiedAppInitializing: false,
                pageInitializers: new Map(),
                customInitializers: new Map(),
              };
            }
            if (!window.globalInitializationState.customInitializers) {
              window.globalInitializationState.customInitializers = new Map();
            }
            // Mark as executed to prevent double execution
            window.globalInitializationState.customInitializers.set(initializerKey, {
              executed: true,
              timestamp: Date.now(),
              page: this.pageInfo.name,
            });
            console.log(`✅ Custom initializer ${i + 1} completed successfully`);
          } catch (error) {
            console.error(`❌ Custom initializer ${i + 1} failed:`, error);
            if (typeof window.Logger !== 'undefined' && window.Logger.error) {
              window.Logger.error(`❌ Custom initializer ${i + 1} failed:`, error, {
                page: 'core-systems',
              });
            }
          }
        } else {
          console.warn(`⚠️ Custom initializer ${i + 1} is not a function:`, typeof initializer);
        }
      }

      // === Preferences propagation listeners (storage + visibility) ===
      try {
        if (!window.__ttPreferencesListenersBound) {
          window.__ttPreferencesListenersBound = true;

          // storage listener to react to changes from other tabs/pages
          // Only reload if version actually changed to avoid unnecessary API calls
          window.addEventListener('storage', async e => {
            if (e && e.key === 'tt:preferences' && e.newValue) {
              try {
                const payload = JSON.parse(e.newValue);
                const incomingVersion = payload?.version || payload?.profileContext?.versions?.last_update || payload?.profileContext?.last_update;
                const currentVersion = window.__ttPreferencesVersion;
                
                // Only reload if version actually changed (avoid duplicate calls)
                if (incomingVersion && incomingVersion !== currentVersion) {
                  window.__ttPreferencesVersion = incomingVersion;
                  if (typeof window.loadUserPreferences === 'function') {
                    await window.loadUserPreferences({ force: true, source: 'storage' });
                  }
                  window.dispatchEvent(
                    new CustomEvent('preferences:updated', {
                      detail: {
                        source: 'storage',
                        profileId: payload.profileId,
                        version: incomingVersion,
                      },
                    })
                  );
                }
              } catch {}
            }
          });

          // visibility/focus lightweight version check
          let lastCheckTs = 0;
          document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible') {
              const now = Date.now();
              if (now - lastCheckTs < 30000) return; // throttle 30s
              lastCheckTs = now;
              try {
                // Use PreferencesData/Core instead of direct fetch to preferences endpoints
                const payload = await (window.PreferencesData?.loadAllPreferencesRaw
                  ? window.PreferencesData.loadAllPreferencesRaw({ force: false })
                  : Promise.resolve({ profileContext: null }));
                const incoming = payload?.profileContext?.versions?.last_update
                  || payload?.profileContext?.last_update
                  || null;
                const current = window.__ttPreferencesVersion;
                if (incoming && incoming !== current) {
                  window.__ttPreferencesVersion = incoming;
                  if (typeof window.loadUserPreferences === 'function') {
                    await window.loadUserPreferences({ force: true, source: 'visibility-check' });
                  }
                }
              } catch (err) {
                // Silently ignore errors - data service may be unavailable or network issues
              }
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ Failed binding preferences listeners:', err);
      }

      // Initial preferences load removed - now handled by unified-app-initializer.js
      // Preferences are loaded centrally through initializePreferencesForPage() which ensures:
      // - Single point of entry
      // - Proper cache usage (force: false for regular pages, force: true only for preferences page)
      // - No duplicate API calls
      // - Non-blocking initialization for better page load performance

      this.performanceMetrics.stageTimes.finalize = Date.now() - stageStart;
      console.log('✅ Stage 4 Complete');
    }

    /**
     * Detect page information
     */
    detectPageInfo() {
      const path = window.location.pathname;
      const filename = path.split('/').pop() || 'index';
      const pageName = filename.replace('.html', '');

      console.log('🔍 Page detection:', { path, filename, pageName });

      const pageInfo = {
        name: pageName,
        path: path,
        filename: filename,
        type: this.determinePageType(pageName),
        requirements: {
          filters: this.requiresFilters(pageName),
          validation: this.requiresValidation(pageName),
          tables: this.requiresTables(pageName),
          charts: this.requiresCharts(pageName),
        },
      };

      console.log('📊 Detected page info:', pageInfo);
      return pageInfo;
    }

    /**
     * Detect available systems
     */
    detectAvailableSystems() {
      const systems = new Set();

      // Core Systems
      if (typeof window.NotificationSystem !== 'undefined') systems.add('notification');
      if (typeof window.HeaderSystem !== 'undefined') systems.add('header');
      if (typeof window.FilterSystem !== 'undefined') systems.add('filter');

      // Page Systems
      if (typeof window.initializePageFilters === 'function') systems.add('pageFilters');
      if (typeof window.initializeValidation === 'function') systems.add('validation');
      if (typeof window.setupSortableHeaders === 'function') systems.add('tables');

      // Preferences & Storage
      if (typeof window.preferencesCache !== 'undefined') systems.add('preferences');
      if (typeof window.IndexedDB !== 'undefined') systems.add('indexeddb');

      // UI Systems
      if (typeof window.toggleSection === 'function') systems.add('uiUtils');
      if (typeof window.showNotification === 'function') systems.add('notifications');

      return systems;
    }

    /**
     * Analyze page requirements
     */
    analyzePageRequirements() {
      // This is already done in detectPageInfo, but can be extended
      console.log('📊 Page requirements analyzed');
    }

    /**
     * Determine page type
     */
    determinePageType(pageName) {
      if (['trades', 'executions', 'alerts'].includes(pageName)) return 'trading';
      if (
        ['system-management', 'crud-testing-dashboard', 'code-quality-dashboard'].includes(pageName)
      )
        return 'development';
      if (['preferences'].includes(pageName)) return 'preferences';
      if (['index'].includes(pageName)) return 'dashboard';
      return 'general';
    }

    /**
     * Check if page requires filters
     */
    requiresFilters(pageName) {
      const filterPages = [
        'index',
        'trades',
        'executions',
        'alerts',
        'trading_accounts',
        'cash_flows',
        'tickers',
        'research',
        'notes',
      ];
      return (
        filterPages.includes(pageName) ||
        document.querySelectorAll('.filter-section, .header-filters').length > 0
      );
    }

    /**
     * Check if page requires validation
     */
    requiresValidation(pageName) {
      const validationPages = [
        'trades',
        'executions',
        'alerts',
        'trading_accounts',
        'cash_flows',
        'tickers',
        'notes',
      ];
      return validationPages.includes(pageName) || document.querySelectorAll('form[id]').length > 0;
    }

    /**
     * Check if page requires tables
     */
    requiresTables(pageName) {
      const tablePages = [
        'index',
        'trades',
        'executions',
        'alerts',
        'trading_accounts',
        'cash_flows',
        'tickers',
        'research',
        'notes',
      ];
      return tablePages.includes(pageName) || document.querySelectorAll('table[id]').length > 0;
    }

    /**
     * Check if page requires charts
     */
    requiresCharts(pageName) {
      const chartPages = ['index'];
      return (
        chartPages.includes(pageName) ||
        document.querySelectorAll('canvas[id], .chart-container').length > 0
      );
    }

    /**
     * Initialize Unified Cache System
     */
    async initializeCacheSystem() {
      console.log('🔧 Initializing Unified Cache System...');

      // Initialize UnifiedCacheManager with timeout
      if (typeof window.UnifiedCacheManager !== 'undefined') {
        try {
          if (!window.UnifiedCacheManager.initialized) {
            console.log('🔧 Initializing UnifiedCacheManager...');

            // Add timeout to prevent hanging
            const initPromise = window.UnifiedCacheManager.initialize();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('UnifiedCacheManager initialization timeout')),
                10000
              )
            );

            const initResult = await Promise.race([initPromise, timeoutPromise]);
            if (initResult) {
              console.log('✅ UnifiedCacheManager initialized successfully');
            } else {
              throw new Error('UnifiedCacheManager initialization returned false');
            }
          } else {
            console.log('✅ UnifiedCacheManager already initialized');
          }
        } catch (error) {
          if (typeof window.Logger !== 'undefined' && window.Logger.error) {
            window.Logger.error('❌ UnifiedCacheManager initialization failed:', error, {
              page: 'core-systems',
            });
          } else {
            console.error('❌ UnifiedCacheManager initialization failed:', error);
          }
          console.warn('⚠️ Using localStorage fallback');
          // Set a flag to indicate cache system is not available
          window.UnifiedCacheManager = null;
        }
      } else {
        console.warn('⚠️ UnifiedCacheManager not available, using localStorage fallback');
      }
    }

    /**
     * Handle errors
     */
    handleError(error) {
      if (typeof window.Logger !== 'undefined' && window.Logger.error) {
        window.Logger.error('❌ Unified App Initialization Error:', error, {
          page: 'core-systems',
        });
      } else {
        console.error('❌ Unified App Initialization Error:', error);
      }

      // Execute error handlers
      for (const handler of this.errorHandlers) {
        try {
          handler(error);
        } catch (handlerError) {
          if (typeof window.Logger !== 'undefined' && window.Logger.error) {
            window.Logger.error('❌ Error handler failed:', handlerError, { page: 'core-systems' });
          } else {
            console.error('❌ Error handler failed:', handlerError);
          }
        }
      }

      // Show user notification
      if (typeof window.showNotification === 'function') {
        window.showNotification('❌ Application initialization failed', 'error');
      }
    }

    /**
     * Log success
     */
    logSuccess() {
      // Success notification is optional and can be disabled for cleaner console
      // if (typeof window.showNotification === 'function') {
      //     window.showNotification('✅ Application initialized successfully', 'success', 'business');
      // }
    }

    /**
     * Get initialization status
     */
    getStatus() {
      return {
        initialized: this.initialized,
        inProgress: this.initializationInProgress,
        pageInfo: this.pageInfo,
        availableSystems: Array.from(this.availableSystems),
        performanceMetrics: this.performanceMetrics,
        customInitializers: this.customInitializers.length,
        errorHandlers: this.errorHandlers.length,
      };
    }

    /**
     * Reset for testing
     */
    reset() {
      this.initialized = false;
      this.initializationInProgress = false;
      this.pageInfo = null;
      this.availableSystems.clear();
      this.performanceMetrics = {
        startTime: null,
        endTime: null,
        stageTimes: {},
        totalTime: 0,
      };
      this.errorHandlers = [];
      this.customInitializers = [];
    }
  }

  window.UnifiedAppInitializer = UnifiedAppInitializer;
} // End of UnifiedAppInitializer class definition

// Methods outside class (legacy support) - should be inside class
// These methods were moved outside for backward compatibility
// They are now part of the UnifiedAppInitializer class above

/**
 * Detect page information (Legacy - moved inside class)
 */
function detectPageInfo() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index';
  const pageName = filename.replace('.html', '');

  console.log('🔍 Page detection:', { path, filename, pageName });

  // Use global helper functions (defined below) instead of local duplicates
  const pageInfo = {
    name: pageName,
    path: path,
    filename: filename,
    type: determinePageType(pageName),
    requirements: {
      filters: requiresFilters(pageName),
      validation: requiresValidation(pageName),
      tables: requiresTables(pageName),
      charts: requiresCharts(pageName),
    },
  };

  console.log('📊 Detected page info:', pageInfo);
  return pageInfo;
}

/**
 * Detect available systems (Legacy - moved outside class)
 */
function detectAvailableSystems() {
  const systems = new Set();

  // Core Systems
  if (typeof window.NotificationSystem !== 'undefined') systems.add('notification');
  if (typeof window.HeaderSystem !== 'undefined') systems.add('header');
  if (typeof window.FilterSystem !== 'undefined') systems.add('filter');

  // Page Systems
  if (typeof window.initializePageFilters === 'function') systems.add('pageFilters');
  if (typeof window.initializeValidation === 'function') systems.add('validation');
  if (typeof window.setupSortableHeaders === 'function') systems.add('tables');

  // Preferences & Storage
  if (typeof window.preferencesCache !== 'undefined') systems.add('preferences');
  if (typeof window.IndexedDB !== 'undefined') systems.add('indexeddb');

  // UI Systems
  if (typeof window.toggleSection === 'function') systems.add('uiUtils');
  if (typeof window.showNotification === 'function') systems.add('notifications');
  if (typeof window.ActionsMenuSystem !== 'undefined') systems.add('actionsMenu');

  return systems;
}

/**
 * Analyze page requirements (Legacy - moved outside class)
 */
function analyzePageRequirements() {
  // This is already done in detectPageInfo, but can be extended
  console.log('📊 Page requirements analyzed');
}

/**
 * Determine page type (Legacy - moved outside class)
 */
function determinePageType(pageName) {
  if (['trades', 'executions', 'alerts'].includes(pageName)) return 'trading';
  if (
    [
      'system-management',
      'crud-testing-dashboard',
      'code-quality-dashboard',
      'cache-management',
    ].includes(pageName)
  )
    return 'development';
  if (['preferences'].includes(pageName)) return 'preferences';
  if (['index'].includes(pageName)) return 'dashboard';
  return 'general';
}

/**
 * Check if page requires filters (Legacy - moved outside class)
 */
function requiresFilters(pageName) {
  const filterPages = [
    'index',
    'trades',
    'executions',
    'alerts',
    'trading_accounts',
    'cash_flows',
    'tickers',
    'research',
  ];
  return (
    filterPages.includes(pageName) ||
    document.querySelectorAll('.filter-section, .header-filters').length > 0
  );
}

/**
 * Check if page requires validation (Legacy - moved outside class)
 */
function requiresValidation(pageName) {
  const validationPages = [
    'preferences',
    'trades',
    'alerts',
    'trading_accounts',
    'notes',
    'crud-testing-dashboard',
  ];
  return validationPages.includes(pageName) || document.querySelectorAll('form').length > 0;
}

/**
 * Check if page requires tables (Legacy - moved outside class)
 */
function requiresTables(pageName) {
  const tablePages = [
    'index',
    'trades',
    'executions',
    'alerts',
    'trading_accounts',
    'cash_flows',
    'tickers',
    'db_display',
    'crud-testing-dashboard',
    'external-data-dashboard',
  ];
  return tablePages.includes(pageName) || document.querySelectorAll('table').length > 0;
}

/**
 * Check if page requires charts (Legacy - moved outside class)
 */
function requiresCharts(pageName) {
  return pageName === 'index' || document.querySelectorAll('canvas, .chart-container').length > 0;
}

/**
 * Initialize Unified Cache System (Legacy - moved outside class)
 */
async function initializeCacheSystem() {
  console.log('🔧 Initializing Unified Cache System...');

  // Initialize UnifiedCacheManager with timeout - only if not already initialized
  if (
    typeof window.UnifiedCacheManager !== 'undefined' &&
    !window.UnifiedCacheManager.initialized
  ) {
    try {
      console.log('🔧 Initializing UnifiedCacheManager...');

      // Add timeout to prevent hanging
      const initPromise = window.UnifiedCacheManager.initialize();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('UnifiedCacheManager initialization timeout')), 10000)
      );

      const initResult = await Promise.race([initPromise, timeoutPromise]);
      if (initResult) {
        console.log('✅ UnifiedCacheManager initialized successfully');
      } else {
        throw new Error('UnifiedCacheManager initialization returned false');
      }
    } catch (error) {
      console.error('❌ UnifiedCacheManager initialization failed:', error);
      console.log('⚠️ Using localStorage fallback');
      // Set a flag to indicate cache system is not available
      window.UnifiedCacheManager = null;
    }
  } else if (window.UnifiedCacheManager?.initialized) {
    console.log('✅ UnifiedCacheManager already initialized');
  } else {
    console.log('⚠️ UnifiedCacheManager not available, using localStorage fallback');
  }

  // Advanced cache systems (CacheSyncManager, CachePolicyManager, MemoryOptimizer)
  // are optional and not currently loaded in the standard loading system.
  // UnifiedCacheManager provides all necessary functionality for now.

  // Initialize registered core systems - only if not already initialized
  if (window.UnifiedInitializationSystem && !window.coreSystemsInitialized) {
    await window.UnifiedInitializationSystem.initializeCoreSystems();
    window.coreSystemsInitialized = true;
  } else if (window.coreSystemsInitialized) {
    console.log('✅ Core systems already initialized, skipping...');
  }

  // Final verification and reporting - removed reportCacheSystemStatus call (not available as standalone function)
}

// REMOVED: Orphaned methods - these are already part of UnifiedAppInitializer class (lines 14-703)
// - addCustomInitializer (part of UnifiedAppInitializer class)
// - addErrorHandler (part of UnifiedAppInitializer class)
// - handleError (part of UnifiedAppInitializer class)
// - logSuccess (part of UnifiedAppInitializer class)
// - getStatus (part of UnifiedAppInitializer class)
// - reset (part of UnifiedAppInitializer class)

// ===== GLOBAL INSTANCE =====

window.UnifiedAppInitializer = UnifiedAppInitializer;
window.unifiedAppInit = new UnifiedAppInitializer();

// ===== GLOBAL EXPORT =====

window.initializeUnifiedApp = async function () {
  return await window.unifiedAppInit.initialize();
};

window.getUnifiedAppStatus = function () {
  return window.unifiedAppInit.getStatus();
};

/**
 * Clear global initialization state (for testing/debugging)
 */
window.clearGlobalInitializationState = function () {
  window.globalInitializationState = {
    unifiedAppInitialized: false,
    unifiedAppInitializing: false,
    pageInitializers: new Set(),
    customInitializers: new Map(),
  };
  console.log('🧹 Global initialization state cleared');
};

/**
 * Get global initialization state (for debugging)
 */
window.getGlobalInitializationState = function () {
  return {
    unifiedAppInitialized: window.globalInitializationState.unifiedAppInitialized,
    unifiedAppInitializing: window.globalInitializationState.unifiedAppInitializing,
    pageInitializersCount: window.globalInitializationState.pageInitializers.size,
    customInitializersCount: window.globalInitializationState.customInitializers.size,
    customInitializers: Array.from(window.globalInitializationState.customInitializers.entries()),
  };
};

// ===== AUTO-INITIALIZATION =====

// Global initialization tracking to prevent double initialization
window.globalInitializationState = {
  unifiedAppInitialized: false,
  unifiedAppInitializing: false,
  pageInitializers: new Set(),
  customInitializers: new Map(),
};

// Single DOMContentLoaded listener - replaces all others
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎯 DOM Content Loaded - Starting Unified App Initialization');
  console.log('🔍 Current URL:', window.location.href);
  console.log('🔍 Current pathname:', window.location.pathname);

  // Initialize globalInitializationState if not exists
  if (!window.globalInitializationState) {
    window.globalInitializationState = {
      unifiedAppInitialized: false,
      unifiedAppInitializing: false,
      pageInitializers: new Set(),
      customInitializers: new Map(),
    };
  }

  // Prevent double initialization
  if (
    window.globalInitializationState.unifiedAppInitialized ||
    window.globalInitializationState.unifiedAppInitializing
  ) {
    console.log('⚠️ Unified App already initialized or initializing, skipping...');
    return;
  }

  window.globalInitializationState.unifiedAppInitializing = true;

  try {
    // Small delay to ensure all scripts are loaded
    setTimeout(async () => {
      console.log('🚀 About to call initializeUnifiedApp...');
      await window.initializeUnifiedApp();
      if (window.globalInitializationState) {
        window.globalInitializationState.unifiedAppInitialized = true;
        window.globalInitializationState.unifiedAppInitializing = false;
      }
      console.log('✅ Unified App Initialization completed');
    }, 100);
  } catch (error) {
    console.error('❌ Unified App auto-initialization failed:', error);
    if (window.globalInitializationState) {
      window.globalInitializationState.unifiedAppInitializing = false;
    }
  }
});

// ===== ERROR HANDLING =====

window.addEventListener('error', event => {
  const details = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    errorObject: event.error ?? null,
    time: new Date().toISOString(),
  };

  window.__LAST_GLOBAL_ERROR = details;

  if (window.Logger?.error) {
    window.Logger.error('❌ Global Error captured', details, { page: 'core-systems' });
  } else {
    console.error('❌ Global Error:', details);
  }

  if (event.error && typeof window.showNotification === 'function') {
    window.showNotification('❌ System error occurred', 'error');
  }
});

window.addEventListener('unhandledrejection', event => {
  const details = {
    reason: event.reason,
    stack: event.reason?.stack,
    time: new Date().toISOString(),
  };

  window.__LAST_GLOBAL_REJECTION = details;

  if (window.Logger?.error) {
    window.Logger.error('❌ Unhandled Promise Rejection', details, { page: 'core-systems' });
  } else {
    console.error('❌ Unhandled Promise Rejection:', details);
  }

  if (event.reason && typeof window.showNotification === 'function') {
    window.showNotification('❌ Promise rejection occurred', 'error');
  }
});

// יצירת UnifiedInitializationSystem למערכות אחרות
window.UnifiedInitializationSystem = {
  coreSystems: new Map(),

  addCoreSystem(name, initFunction) {
    console.log(`📝 Registering core system: ${name}`);
    this.coreSystems.set(name, initFunction);
  },

  async initializeCoreSystems() {
    console.log('🔧 Initializing registered core systems...');
    for (const [name, initFunction] of this.coreSystems) {
      try {
        // בדיקה אם המערכת כבר מאותחלת
        const systemKey = name.toLowerCase().replace(/\s+/g, '');
        if (window[`${systemKey}Initialized`] || (window[name] && window[name].initialized)) {
          console.log(`✅ ${name} already initialized, skipping...`);
          continue;
        }

        console.log(`🔧 Initializing ${name}...`);
        await initFunction();
        // console.log(`✅ ${name} initialized successfully`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${name}:`, error);
      }
    }
  },
};

// ===== NOTIFICATION SYSTEM ======
/**
 * Notification System - TikTrack
 * =============================
 *
 * מערכת התראות מרכזית לפרויקט TikTrack
 *
 * קובץ זה מכיל שלושה מערכות עיקריות:
 * 1. ALERTS SYSTEM - התראות עסקיות לתנאי שוק
 * 2. NOTIFICATION SYSTEM - הודעות מערכת למשוב משתמש
 * 3. LINKED ITEMS SYSTEM - הצגה וניהול פריטים מקושרים
 *
 * קובץ: trading-ui/scripts/notification-system.js
 * גרסה: 3.1
 * עדכון אחרון: 31 באוגוסט 2025
 *
 * תיקונים אחרונים (31 באוגוסט 2025):
 * - שיפור תמיכה בעמוד תכנונים
 * - תיקון הודעות הצלחה ושגיאה
 * - שיפור מערכת אישור מחיקה
 * - תמיכה במערכת ביטול תכנונים
 */

// Utility function to generate unique notification IDs
function generateNotificationId() {
  return Date.now() + Math.random();
}

/**
 * תלויות:
 * - linked-items.js (לפונקציות הצגת מודלים)
 * - Bootstrap 5.3.0 (לפונקציונליות מודלים)
 *
 * דוקומנטציה מפורטת: documentation/frontend/NOTIFICATION_SYSTEM.md
 */

// ===== ALERTS SYSTEM FUNCTIONS =====
// These functions handle business alerts for market conditions

/**
 * Create a new alert
 * ALERTS SYSTEM - Creates business alert for market conditions
 *
 * @param {Object} alertData - Alert data object
 * @returns {Promise} Promise that resolves when alert is created
 */
async function createAlert(alertData) {
  try {
    // שמירה במטמון מאוחד
    if (window.UnifiedCacheManager) {
      await window.UnifiedCacheManager.save('alerts-data', alertData, {
        syncToBackend: true,
        dependencies: ['accounts-data'],
      });
    }

    // עדכון היסטוריית התראות
    await updateNotificationHistory('alert-created', alertData);

    console.log('✅ Alert created successfully');
  } catch (error) {
    console.error('❌ Failed to create alert:', error);
    throw error;
  }
}

/**
 * Update notification history
 * Updates notification history in unified cache
 *
 * @param {string} action - Action performed
 * @param {Object} data - Related data
 * @returns {Promise} Promise that resolves when history is updated
 */
async function updateNotificationHistory(action, data) {
  try {
    if (window.UnifiedCacheManager) {
      // קבלת היסטוריה קיימת
      let history = await window.UnifiedCacheManager.get('notifications-history', {
        fallback: () => [],
      });

      if (!Array.isArray(history)) {
        history = [];
      }

      // הוספת רשומה חדשה
      const entry = {
        action,
        data,
        timestamp: Date.now(),
        id: Date.now() + Math.random(),
      };

      history.unshift(entry); // הוספה לתחילת הרשימה

      // הגבלת גודל היסטוריה
      if (history.length > 1000) {
        history = history.slice(0, 1000);
      }

      // שמירה במטמון מאוחד
      await window.UnifiedCacheManager.save('notifications-history', history, {
        layer: 'indexedDB',
        compress: true,
        ttl: 86400000, // 24 שעות
      });
    }
  } catch (error) {
    console.error('❌ Failed to update notification history:', error);
  }
}

/**
 * Update an alert
 * ALERTS SYSTEM - Updates existing business alert
 *
 * @param {number} alertId - ID of alert to update
 * @param {Object} alertData - Updated alert data
 * @returns {Promise} Promise that resolves when alert is updated
 */
function updateAlert(_alertId, _alertData) {
  // Implementation for updating business alerts
  // TODO: Implement alert update logic
}

/**
 * Mark alert as triggered
 * ALERTS SYSTEM - Marks business alert as triggered when conditions are met
 *
 * @param {number} alertId - ID of alert to mark as triggered
 * @returns {Promise} Promise that resolves when alert is marked
 */
function markAlertAsTriggered(_alertId) {
  // Implementation for marking alerts as triggered
  // TODO: Implement alert trigger logic
}

/**
 * Mark alert as read
 * ALERTS SYSTEM - Marks business alert as read by user
 *
 * @param {number} alertId - ID of alert to mark as read
 * @returns {Promise} Promise that resolves when alert is marked
 */
function markAlertAsRead(_alertId) {
  // Implementation for marking alerts as triggered
  // TODO: Implement alert read logic
}

// ===== NOTIFICATION SYSTEM FUNCTIONS =====
// These functions handle system messages for user feedback

/**
 * Get notification icon based on type
 * NOTIFICATION SYSTEM - Returns appropriate FontAwesome icon for notification type
 *
 * @param {string} type - Type of notification (success, error, warning, info)
 * @returns {string} FontAwesome icon class
 */
function getNotificationIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };
  return icons[type] || icons.info;
}

/**
 * Check if notification should be shown based on category preferences
 * NOTIFICATION SYSTEM - Checks user preferences for notification category
 *
 * @param {string} category - Category of notification (development, system, business, performance, ui)
 * @returns {Promise<boolean>} - Whether notification should be shown
 */
async function shouldShowNotification(category) {
  try {
    const preferenceName = `notifications_${category}_enabled`;
    console.log(`🔍 Checking preference: ${preferenceName}`);

    if (typeof window.getPreference !== 'function') {
      // Preferences system not loaded yet - show notifications by default (this is normal during initialization)
      return true;
    }

    const isEnabled = await window.getPreference(preferenceName);
    if (window.DEBUG_MODE) {
      console.log(`🔍 Preference ${preferenceName} value:`, isEnabled, typeof isEnabled);
    }

    // If preference is not found (null), show notifications by default for critical categories
    // This ensures error notifications are always shown even if preferences are not set up
    if (isEnabled === null) {
      // For import-user-data category, always show errors and warnings
      if (category === 'import-user-data') {
        console.log(`⚠️ Preference ${preferenceName} not found - showing notification by default for import-user-data`);
        return true;
      }
      console.log(`⚠️ Preference ${preferenceName} not found - notification disabled`);
      return false;
    }

    const result = isEnabled === 'true' || isEnabled === true;
    if (window.DEBUG_MODE) {
      console.log(`🔍 Should show notification for ${category}:`, result);
    }
    return result;
  } catch (error) {
    if (window.DEBUG_MODE) {
      console.warn('Failed to check notification preference, showing by default:', error);
    }
    // For general category, map to system category; for others, show by default
    if (category === 'general') {
      // Map general to system category since general doesn't exist
      return await shouldShowNotification('system');
    }
    return true; // Default: show notification
  }
}

/**
 * Check if console log should be written based on category preferences
 * NOTIFICATION SYSTEM - Checks user preferences for console log category
 *
 * @param {string} category - Category of log (development, system, business, performance, ui)
 * @returns {Promise<boolean>} - Whether log should be written to console
 */
async function shouldLogToConsole(category) {
  try {
    const preferenceName = `console_logs_${category}_enabled`;
    const isEnabled = await window.getPreference(preferenceName);
    return isEnabled === 'true' || isEnabled === true;
  } catch (error) {
    console.warn('Failed to check console log preference, logging by default:', error);
    return true; // Default: write to console
  }
}

/**
 * Log with category support
 * NOTIFICATION SYSTEM - Logs message to console with category filtering
 *
 * @param {string} level - Log level (log, warn, error, info)
 * @param {string} message - Message to log
 * @param {string} category - Category of log (development, system, business, performance, ui)
 * @param {any} details - Additional details to log
 */
async function logWithCategory(level, message, category = 'system', details = null) {
  if (await shouldLogToConsole(category)) {
    const emoji = getLogEmoji(level);
    const timestamp = new Date().toLocaleTimeString('he-IL');
    console[level](`${emoji} [${category.toUpperCase()}] ${timestamp}: ${message}`, details);
  }
}

/**
 * Get emoji for log level
 * NOTIFICATION SYSTEM - Returns appropriate emoji for log level
 *
 * @param {string} level - Log level
 * @returns {string} Emoji for log level
 */
function getLogEmoji(level) {
  const emojis = {
    log: '📝',
    warn: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };
  return emojis[level] || '📝';
}

/**
 * _REMOVED_showNotification - Function removed as duplicate
 * NOTIFICATION SYSTEM - This function was a duplicate of showNotification in notification-system.js
 *
 * The global showNotification from notification-system.js is more advanced and contains:
 * - Same category detection logic
 * - Additional options parameter
 * - Better logging with window.Logger
 * - User-initiated action tracking
 *
 * All calls should use window.showNotification from notification-system.js instead.
 *
 * This local version has been removed to eliminate code duplication.
 */

/**
 * Get notification icon based on type
 */
// Function already defined above

// ייצוא הפונקציה הגלובלית - יועבר למטה

// ===== LINKED ITEMS SYSTEM FUNCTIONS =====
// These functions handle linked items display and management

/**
 * Load linked items data from server
 * LINKED ITEMS SYSTEM - Fetches linked items data for any entity type
 *
 * @param {string} itemType - Type of the item
 * @param {number|string} itemId - ID of the item
 * @returns {Object} Linked items data
 */
async function loadLinkedItemsData(itemType, itemId) {
  const response = await fetch(`/api/linked-items/${itemType}/${itemId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Create notification container if not exists
 * NOTIFICATION SYSTEM - Creates container for system notifications
 *
 * @returns {HTMLElement} Notification container element
 */
function createNotificationContainer() {
  let container = document.getElementById('notification-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Hide notification with animation
 * NOTIFICATION SYSTEM - Hides system notification with smooth animation
 *
 * @param {HTMLElement} notification - Notification element to hide
 */
function hideNotification(notification) {
  if (notification && notification.parentElement) {
    notification.classList.add('hide');

    // Remove from DOM after animation
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }
}

// This function is already defined above - removing duplicate

// ===== SPECIFIC NOTIFICATION FUNCTIONS =====
// These are convenience functions for different notification types

// REMOVED: showSuccessNotification - use window.showSuccessNotification from notification-system.js

// REMOVED: showErrorNotification - use window.showErrorNotification from notification-system.js
// Note: The global version is simpler and calls showNotification directly
// If critical error handling is needed, use window.showCriticalErrorNotification directly

/**
 * Show simple error notification (legacy mode)
 * NOTIFICATION SYSTEM - Displays simple error notification without modal
 *
 * @param {string} title - Error notification title
 * @param {string} message - Error notification message
 * @param {number} duration - Display duration in milliseconds (default: 6000)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showSimpleErrorNotification(title, message, duration = 6000, category = null) {
  // Use the global notification system from notification-system.js
  if (typeof window.showNotification === 'function') {
    await window.showNotification(message, 'error', title, duration, category);
  } else {
    console.error('showNotification not available');
  }
}

/**
 * Helper function: Create and show Bootstrap modal without ARIA warnings
 * MODAL SYSTEM - Creates dynamic modal and shows it properly
 *
 * @param {string} modalHtml - HTML string of the modal
 * @param {string} modalId - ID of the modal element
 * @param {Object} options - Bootstrap modal options (optional)
 * @returns {Object} Bootstrap modal instance
 */
window.createAndShowModal = function (modalHtml, modalId, options = {}) {
  // Remove ALL existing modals with this ID (in case of duplicates)
  // querySelectorAll catches all instances, not just the first one
  const existingModals = document.querySelectorAll(`#${modalId}`);
  existingModals.forEach(modal => {
    modal.remove();
  });

  // Also remove any orphaned backdrops
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => {
    backdrop.remove();
  });

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Get modal element
  const modalElement = document.getElementById(modalId);
  if (!modalElement) {
    console.error(`Modal element not found: ${modalId}`);
    return null;
  }

  // Fix ARIA accessibility: Use MutationObserver to prevent aria-hidden
  // Bootstrap keeps adding aria-hidden, we need to remove it continuously
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
        if (modalElement.getAttribute('aria-hidden') === 'true') {
          modalElement.removeAttribute('aria-hidden');
          modalElement.removeAttribute('inert');
        }
      }
    });
  });

  // Start observing (will cover both show AND hide transitions)
  observer.observe(modalElement, { attributes: true, attributeFilter: ['aria-hidden', 'inert'] });

  // Initialize Bootstrap modal - ללא backdrop (ננהל אותו מרכזית)
  const modalOptions = { ...options, backdrop: false };
  const modal = new bootstrap.Modal(modalElement, modalOptions);

  // Show modal
  modal.show();

  // Backdrop handled by Bootstrap

  // Stop observing only after modal is fully hidden (not after shown!)
  // This ensures we catch aria-hidden during close transition too
  modalElement.addEventListener(
    'hidden.bs.modal',
    () => {
      observer.disconnect();
    },
    { once: true }
  );

  return modal;
};

/**
 * Show final success notification with detailed logging
 * NOTIFICATION SYSTEM - Displays final success for process completion that requires user acknowledgment
 *
 * @param {string} title - Final success notification title
 * @param {string} message - Final success notification message
 * @param {Object} details - Additional success details (optional)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showFinalSuccessNotification(title, message, details = {}, category = 'system') {
  console.log('🎉 Final success notification:', { title, message, details, category });

  // Collect detailed success information
  const successInfo = {
    title,
    message,
    details,
    category,
    timestamp: new Date().toISOString(),
    type: 'critical-success',
    id: generateNotificationId(),
  };

  // Add browser and system information
  successInfo.browser = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  };

  successInfo.system = {
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  // Add performance information if available
  if (performance.memory) {
    successInfo.performance = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    };
  }

  // Save to history
  saveNotificationToGlobalHistory('success', title, message, category);

  // Show modal with detailed information
  showFinalSuccessModal(successInfo);

  // Log to console with full details
  console.group('🎉 Final Success Details');
  console.log('Title:', title);
  console.log('Message:', message);
  console.log('Category:', category);
  console.log('Details:', details);
  console.log('Full Success Object:', successInfo);
  console.groupEnd();

  return successInfo;
}

/**
 * Show critical error notification with detailed logging
 * NOTIFICATION SYSTEM - Displays critical error that requires user action
 *
 * @param {string} title - Error notification title
 * @param {string} message - Error notification message
 * @param {Object} details - Additional error details (optional)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showCriticalErrorNotification(title, message, details = {}, category = 'system') {
  console.log('🚨 Critical error notification:', { title, message, details, category });

  // Collect detailed error information
  const errorInfo = {
    title,
    message,
    details,
    category,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    url: window.location.href,
    userAgent: navigator.userAgent,
    stack: details.stack || new Error().stack,
    source: details.source || 'unknown',
    function: details.function || 'unknown',
    line: details.line || 'unknown',
  };

  // Create detailed error message for logging
  const detailedMessage = createDetailedErrorMessage(errorInfo);

  // Show modal with error details
  await showCriticalErrorModal(errorInfo, detailedMessage);
}

/**
 * Create detailed error message for logging
 * NOTIFICATION SYSTEM - Formats error information for detailed logging
 *
 * @param {Object} errorInfo - Error information object
 * @returns {string} Formatted error message
 */
function createDetailedErrorMessage(errorInfo) {
  const lines = [
    '=== CRITICAL ERROR REPORT ===',
    `Timestamp: ${errorInfo.timestamp}`,
    `Page: ${errorInfo.page}`,
    `URL: ${errorInfo.url}`,
    `Title: ${errorInfo.title}`,
    `Message: ${errorInfo.message}`,
    `Category: ${errorInfo.category}`,
    `Source: ${errorInfo.source}`,
    `Function: ${errorInfo.function}`,
    `Line: ${errorInfo.line}`,
    '',
    '=== DETAILS ===',
    JSON.stringify(errorInfo.details, null, 2),
    '',
    '=== STACK TRACE ===',
    errorInfo.stack,
    '',
    '=== BROWSER INFO ===',
    `User Agent: ${errorInfo.userAgent}`,
    `Screen: ${screen.width}x${screen.height}`,
    `Viewport: ${window.innerWidth}x${window.innerHeight}`,
    `Language: ${navigator.language}`,
    `Platform: ${navigator.platform}`,
    '',
    '=== END OF REPORT ===',
  ];

  return lines.join('\n');
}

/**
 * Show critical error modal with copy functionality
 * NOTIFICATION SYSTEM - Displays modal with error details and copy button
 *
 * @param {Object} errorInfo - Error information object
 * @param {string} detailedMessage - Detailed error message for copying
 */
/**
 * Show Clear Cache Confirmation Modal
 * Returns a promise that resolves to true/false based on user choice
 *
 * @param {string} level - 'light'|'medium'|'full'|'nuclear'
 * @param {Object} currentStats - Current cache statistics
 * @returns {Promise<boolean>} User confirmation
 */
window.showClearCacheConfirmation = async function (level, currentStats) {
  return new Promise(resolve => {
    const levelConfig = {
      light: {
        emoji: '🟢',
        name: 'Light - ניקוי קל',
        color: '#28a745',
        warning: 'ניקוי קל - בטוח למבחנים',
        items: [
          `✅ Memory Layer: ${currentStats.memory?.entries || 0} entries`,
          `✅ Service Caches: ~7-9 services`,
          `❌ localStorage: ${currentStats.localStorage?.entries || 0} entries (ישארו)`,
          `❌ Orphan Keys: ~15-20 keys (ישארו)`,
        ],
        safety: 'גבוהה',
        reversible: 'כן',
      },
      medium: {
        emoji: '🔵',
        name: 'Medium - ניקוי בינוני',
        color: '#26baac',
        warning: 'ניקוי בינוני - מומלץ לפיתוח יומיומי',
        items: [
          `✅ כל Light (Memory + Services)`,
          `✅ localStorage tiktrack_*: ${currentStats.localStorage?.entries || 0} entries`,
          `✅ IndexedDB store: ${currentStats.indexedDB?.entries || 0} entries`,
          `✅ Backend layer: ${currentStats.backend?.entries || 0} entries`,
          `❌ Orphan Keys: ~15-20 keys (ישארו)`,
        ],
        safety: 'בינונית',
        reversible: 'חלקי',
      },
      full: {
        emoji: '🟠',
        name: 'Full - ניקוי מלא',
        color: '#fd7e14',
        warning: 'ניקוי מלא - כולל orphans וauth keys!',
        items: [
          `✅ כל Medium`,
          `✅ Orphan Keys: ~15-20 keys`,
          `⚠️ כולל: authToken, currentUser`,
          `⚠️ כולל: colorScheme, preferences`,
        ],
        safety: 'נמוכה',
        reversible: 'לא',
      },
      nuclear: {
        emoji: '☢️',
        name: 'Nuclear - גרעיני',
        color: '#dc3545',
        warning: '⚠️⚠️⚠️ אזהרה קריטית! מוחק הכל!',
        items: [
          `☢️ כל Full`,
          `☢️ ALL localStorage (כולל non-TikTrack!)`,
          `☢️ DELETE UnifiedCacheDB database`,
          `☢️ sessionStorage`,
          `⚠️ דורש: refresh + login + setup מחדש`,
        ],
        safety: 'אפס',
        reversible: 'לא - בלתי הפיך!',
      },
    };

    const config = levelConfig[level] || levelConfig['medium'];
    const totalEntries =
      (currentStats.memory?.entries || 0) +
      (currentStats.localStorage?.entries || 0) +
      (currentStats.indexedDB?.entries || 0) +
      (currentStats.backend?.entries || 0);

    // Create modal HTML
    const modalHtml = `
            <div class="modal fade" id="clearCacheConfirmationModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header text-white" data-entity-type="${config.entityType || ''}" style="direction: rtl;">
                            <h4 class="modal-title">
                                ${config.emoji} ${config.name}
                            </h4>
                        </div>
                        <div class="modal-body" style="direction: rtl;">
                            <div class="alert alert-${level === 'nuclear' ? 'danger' : level === 'full' ? 'warning' : 'info'}">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>${config.warning}</strong>
                            </div>
                            
                            <h5>מה ינוקה:</h5>
                            <ul style="text-align: right;">
                                ${config.items.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            
                            <div class="row mt-3">
                                <div class="col-md-4">
                                    <div class="stat-box text-center p-2 border rounded">
                                        <small class="text-muted">סה"כ נוכחי:</small>
                                        <h5 class="mb-0">${totalEntries} entries</h5>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-box text-center p-2 border rounded">
                                        <small class="text-muted">בטיחות:</small>
                                        <h5 class="mb-0">${config.safety}</h5>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-box text-center p-2 border rounded">
                                        <small class="text-muted">הפיך:</small>
                                        <h5 class="mb-0">${config.reversible}</h5>
                                    </div>
                                </div>
                            </div>
                            
                            ${
                              level === 'full' || level === 'nuclear'
                                ? `
                            <div class="alert alert-danger mt-3">
                                <i class="fas fa-exclamation-circle"></i>
                                <strong>שים לב:</strong>
                                ${
                                  level === 'full'
                                    ? 'פעולה זו תמחק את authToken ו-currentUser - ידרוש login מחדש!'
                                    : 'פעולה זו בלתי הפיכה ותמחק גם נתונים של אתרים אחרים ב-localhost!'
                                }
                            </div>
                            `
                                : ''
                            }
                        </div>
                        <div class="modal-footer" style="direction: rtl;">
                            <button type="button" class="btn btn-secondary" id="clearCache-cancel-btn" data-onclick="window.clearCacheCancel()">
                                ביטול
                            </button>
                            <button type="button" class="btn btn-${level === 'nuclear' ? 'danger' : level === 'full' ? 'warning' : 'primary'}" id="clearCache-confirm-btn" data-onclick="window.clearCacheConfirm()">
                                ${config.emoji} ${level === 'nuclear' ? 'כן, מחק הכל' : level === 'full' ? 'אני מבין - מחק הכל' : 'אישור'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Remove existing modal if any
    // Use the unified helper function to create and show modal without ARIA warnings
    const modal = window.createAndShowModal(modalHtml, 'clearCacheConfirmationModal');
    const modalElement = document.getElementById('clearCacheConfirmationModal');

    // Create global functions for buttons (with data-onclick)
    window.clearCacheConfirm = () => {
      modal.hide();
      setTimeout(() => modalElement.remove(), 300);
      resolve(true);
      // Clean up functions after use
      delete window.clearCacheConfirm;
      delete window.clearCacheCancel;
    };

    window.clearCacheCancel = () => {
      modal.hide();
      setTimeout(() => modalElement.remove(), 300);
      resolve(false);
      // Clean up functions after use
      delete window.clearCacheConfirm;
      delete window.clearCacheCancel;
    };

    // Show modal
    modal.show();
  });
};

/**
 * Show final success modal with detailed information
 * NOTIFICATION SYSTEM - Displays modal with final success details and requires user acknowledgment
 *
 * @param {Object} successInfo - Success information object
 */
function showFinalSuccessModal(successInfo) {
  console.log('🔍 showFinalSuccessModal called:', { successInfo });
  const headerColors = getBlockingModalColors('success');
  const headerStyle = `direction: rtl; background-color: ${headerColors.backgroundColor}; color: ${headerColors.textColor}; border-bottom: 1px solid ${headerColors.borderColor};`;

  // Create modal HTML
  // Note: Don't add aria-hidden or inert - let Bootstrap manage these automatically
  const modalHtml = `
    <div class="modal fade" id="finalSuccessModal" tabindex="-1" aria-labelledby="finalSuccessModalLabel">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header modal-header-success d-flex justify-content-between align-items-center" style="${headerStyle}">
            <h4 class="modal-title fw-bold" id="finalSuccessModalLabel">
              <i class="fas fa-check-circle"></i> ${successInfo.title}
            </h4>
            <div class="d-flex gap-2">
              <button data-button-type="COPY" id="finalSuccessModal-copy-btn" data-text="העתק" title="העתק פרטי הצלחה"></button>
              <button data-button-type="CLOSE" id="finalSuccessModal-close-btn" data-text="סגור" title="סגור"></button>
            </div>
          </div>
          <div class="modal-body">
            <div class="alert alert-success" role="alert">
              <h6 class="alert-heading">
                <i class="fas fa-check-circle"></i> ${successInfo.message}
              </h6>
              <hr>
              <p class="mb-0">
                <strong>זמן:</strong> ${window.formatDate ? window.formatDate(new Date(successInfo.timestamp), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(successInfo.timestamp), { includeTime: true }) : new Date(successInfo.timestamp).toLocaleString('he-IL'))}<br>
                <strong>קטגוריה:</strong> ${successInfo.category}<br>
                <strong>מזהה:</strong> ${successInfo.id}
              </p>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <h6><i class="fas fa-info-circle text-success"></i> פרטי הצלחה:</h6>
                <pre class="bg-light p-2 rounded" style="font-size: 0.8rem; max-height: 200px; overflow-y: auto;">${JSON.stringify(successInfo.details, null, 2)}</pre>
              </div>
              <div class="col-md-6">
                <h6><i class="fas fa-desktop text-success"></i> מידע מערכת:</h6>
                <pre class="bg-light p-2 rounded" style="font-size: 0.8rem; max-height: 200px; overflow-y: auto;">${JSON.stringify(
                  {
                    browser: successInfo.browser,
                    system: successInfo.system,
                    performance: successInfo.performance,
                  },
                  null,
                  2
                )}</pre>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
            <button data-button-type="COPY" id="finalSuccessModal-footer-copy" data-text="העתק" title="העתק פרטי הצלחה"></button>
            <button data-button-type="CLOSE" id="finalSuccessModal-footer-close" data-text="סגור" title="סגור"></button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Use the unified helper function to create and show modal without ARIA warnings
  const modal = window.createAndShowModal(modalHtml, 'finalSuccessModal');

  // Store success info globally for copying
  window.currentSuccessInfo = successInfo;

  // Add copy button functionality
  const modalElement = document.getElementById('finalSuccessModal');
  const modalInstance = modal;

  const copyButtons = modalElement
    ? modalElement.querySelectorAll('#finalSuccessModal-copy-btn, #finalSuccessModal-footer-copy')
    : [];
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      copyBlockingModalContent(modalElement, successInfo.title, [
        formatSuccessForCopy(successInfo),
      ]);
    });
  });

  const closeButtons = modalElement
    ? modalElement.querySelectorAll('#finalSuccessModal-close-btn, #finalSuccessModal-footer-close')
    : [];
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (modalInstance) {
        modalInstance.hide();
      }
    });
  });
}

/**
 * Show final success notification with reload option
 * NOTIFICATION SYSTEM - Shows success modal and allows user to choose reload
 */
async function showFinalSuccessNotificationWithReload(
  title,
  message,
  details = {},
  category = 'system'
) {
  console.log('🎉 Final success notification with reload option:', {
    title,
    message,
    details,
    category,
  });

  // Collect detailed success information
  const successInfo = {
    title,
    message,
    details,
    category,
    timestamp: new Date().toISOString(),
    type: 'critical-success-with-reload',
    id: generateNotificationId(),
  };

  // Add browser and system information (same as regular function)
  successInfo.browser = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  };

  successInfo.system = {
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  // Add performance information if available
  if (performance.memory) {
    successInfo.performance = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    };
  }

  // Save to history
  saveNotificationToGlobalHistory('success', title, message, category);

  // Show modal with reload option
  showFinalSuccessModalWithReload(successInfo);

  return successInfo;
}

/**
 * Show final success modal with reload button
 */
function showFinalSuccessModalWithReload(successInfo) {
  console.log('🔍 showFinalSuccessModalWithReload called:', { successInfo });
  const headerColors = getBlockingModalColors('success');
  const headerStyle = `direction: rtl; background-color: ${headerColors.backgroundColor}; color: ${headerColors.textColor}; border-bottom: 1px solid ${headerColors.borderColor};`;

  // Create modal HTML with reload button
  const modalHtml = `
    <div class="modal fade" id="finalSuccessModalWithReload" tabindex="-1" aria-labelledby="finalSuccessModalWithReloadLabel">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header modal-header-success d-flex justify-content-between align-items-center" style="${headerStyle}">
            <h4 class="modal-title fw-bold" id="finalSuccessModalWithReloadLabel">
              <i class="fas fa-check-circle"></i> ${successInfo.title}
            </h4>
            <div class="d-flex gap-2">
              <button data-button-type="COPY" id="finalSuccessModalWithReload-copy-btn" data-text="העתק" title="העתק פרטי הצלחה"></button>
              <button data-button-type="CLOSE" id="finalSuccessModalWithReload-close-btn" data-text="סגור" title="סגור"></button>
            </div>
          </div>
          <div class="modal-body">
            <div class="alert alert-success" role="alert">
              <h6 class="alert-heading">
                <i class="fas fa-check-circle"></i> ${successInfo.message.replace(/🔄.*$/m, '')}
              </h6>
              <hr>
              <p class="mb-2">
                <strong>זמן:</strong> ${window.formatDate ? window.formatDate(new Date(successInfo.timestamp), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(successInfo.timestamp), { includeTime: true }) : new Date(successInfo.timestamp).toLocaleString('he-IL'))}<br>
                <strong>קטגוריה:</strong> ${successInfo.category}<br>
                <strong>מזהה:</strong> ${successInfo.id}
              </p>
              <div class="alert alert-warning mt-2">
                <i class="fas fa-exclamation-triangle"></i> <strong>חשוב:</strong> כדי לראות את תוצאות הולידציה ולבצע רענון מלא של המטמון, לחץ על "רענן עכשיו".
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <h6><i class="fas fa-info-circle text-success"></i> פרטי הצלחה:</h6>
                <pre class="bg-light p-2 rounded" style="font-size: 0.8rem; max-height: 200px; overflow-y: auto;">${JSON.stringify(successInfo.details, null, 2)}</pre>
              </div>
              <div class="col-md-6">
                <h6><i class="fas fa-desktop text-success"></i> מידע מערכת:</h6>
                <pre class="bg-light p-2 rounded" style="font-size: 0.8rem; max-height: 200px; overflow-y: auto;">${JSON.stringify(
                  {
                    browser: successInfo.browser,
                    system: successInfo.system,
                    performance: successInfo.performance,
                  },
                  null,
                  2
                )}</pre>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="justify-content: space-between; direction: rtl;">
            <div class="d-flex gap-2">
              <button data-button-type="COPY" id="finalSuccessModalWithReload-footer-copy" data-text="העתק" title="העתק פרטי הצלחה"></button>
              <button data-button-type="CLOSE" id="finalSuccessModalWithReload-footer-close" data-text="סגור" title="סגור"></button>
            </div>
            <button type="button" class="btn btn-primary" id="finalSuccessModal-reload-btn">
              <i class="fas fa-sync-alt"></i> רענן עכשיו
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Use the unified helper function to create and show modal
  const modal = window.createAndShowModal(modalHtml, 'finalSuccessModalWithReload');

  // Store success info globally for copying
  window.currentSuccessInfo = successInfo;

  // Add copy button functionality
  const modalElement = document.getElementById('finalSuccessModalWithReload');
  const modalInstance = modal;

  const copyButtons = modalElement
    ? modalElement.querySelectorAll(
        '#finalSuccessModalWithReload-copy-btn, #finalSuccessModalWithReload-footer-copy'
      )
    : [];
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      copyBlockingModalContent(modalElement, successInfo.title, [
        formatSuccessForCopy(successInfo),
      ]);
    });
  });

  const closeButtons = modalElement
    ? modalElement.querySelectorAll(
        '#finalSuccessModalWithReload-close-btn, #finalSuccessModalWithReload-footer-close'
      )
    : [];
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (modalInstance) {
        modalInstance.hide();
      }
    });
  });

  // Add reload button functionality
  const reloadButton = document.getElementById('finalSuccessModal-reload-btn');
  if (reloadButton) {
    reloadButton.addEventListener('click', async () => {
      console.log('🔄 User requested reload after cache clearing');

      // Close modal first
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }

      // Wait a moment for modal to close, then reload
      setTimeout(async () => {
        if (window.pendingCacheReload) {
          try {
            // Reload fresh data from all cleared layers
            await reloadClearedCacheData(
              window.pendingCacheReload.level,
              window.pendingCacheReload.results
            );

            // Perform reload with cache busting
            window.location.href =
              window.location.href +
              (window.location.href.includes('?') ? '&' : '?') +
              '_cb=' +
              Date.now();
          } catch (error) {
            console.error('❌ Error during user-initiated reload:', error);
            // Fallback reload
            window.location.reload();
          }
        } else {
          // Fallback if no pending reload data
          window.location.href =
            window.location.href +
            (window.location.href.includes('?') ? '&' : '?') +
            '_cb=' +
            Date.now();
        }
      }, 300);
    });
  }
}

async function showCriticalErrorModal(errorInfo, detailedMessage) {
  console.log('🔍 showCriticalErrorModal called:', { errorInfo, detailedMessage });
  const headerColors = getBlockingModalColors('error');
  const headerStyle = `direction: rtl; background-color: ${headerColors.backgroundColor}; color: ${headerColors.textColor}; border-bottom: 1px solid ${headerColors.borderColor};`;

  // Close any existing modals
  closeAllDetailsModals();

  // Create unique modal ID
  const modalId = `critical-error-modal-${Date.now()}`;

  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header modal-header-danger d-flex justify-content-between align-items-center" style="${headerStyle}">
            <h4 class="modal-title fw-bold" id="${modalId}-label">
              <i class="fas fa-exclamation-triangle"></i> ${errorInfo.title}
            </h4>
            <div class="d-flex gap-2">
              <button data-button-type="COPY" id="${modalId}-copy-btn" data-text="העתק" title="העתק פרטי שגיאה"></button>
              <button data-button-type="CLOSE" id="${modalId}-close-btn" data-text="סגור" title="סגור"></button>
            </div>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger" role="alert">
              <h5 class="alert-heading">
                <i class="fas fa-exclamation-circle"></i> שגיאה קריטית
              </h5>
              <p class="mb-0">${errorInfo.message}</p>
            </div>
            
            <div class="error-details">
              <h6><i class="fas fa-info-circle"></i> פרטים נוספים:</h6>
              <div class="row">
                <div class="col-md-6">
                  <p><strong>עמוד:</strong> ${errorInfo.page}</p>
                  <p><strong>מקור:</strong> ${errorInfo.source}</p>
                  <p><strong>פונקציה:</strong> ${errorInfo.function}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>שורה:</strong> ${errorInfo.line}</p>
                  <p><strong>קטגוריה:</strong> ${errorInfo.category}</p>
                  <p><strong>זמן:</strong> ${window.formatDate ? window.formatDate(new Date(errorInfo.timestamp), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(errorInfo.timestamp), { includeTime: true }) : new Date(errorInfo.timestamp).toLocaleString('he-IL'))}</p>
                </div>
              </div>
              
              ${
                Object.keys(errorInfo.details).length > 0
                  ? `
                <h6><i class="fas fa-list"></i> פרטים נוספים:</h6>
                <pre class="bg-light p-3 rounded"><code>${JSON.stringify(errorInfo.details, null, 2)}</code></pre>
              `
                  : ''
              }
            </div>
          </div>
          <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
            <button data-button-type="COPY" id="${modalId}-copy-details-btn" data-text="העתק" title="העתק פרטי שגיאה"></button>
            <button data-button-type="CLOSE" id="${modalId}-footer-close" data-text="סגור" title="סגור"></button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Get modal element
  const modal = document.getElementById(modalId);

  // Show modal using simple system (no Bootstrap dependency)
  modal.style.display = 'block';
  modal.classList.add('show');

  // Backdrop handled by Bootstrap

  // Copy button in header
  const copyButton = modal.querySelector(`#${modalId}-copy-btn`);
  const copyDetailsButton = modal.querySelector(`#${modalId}-copy-details-btn`);
  [copyButton, copyDetailsButton].forEach(button => {
    if (button) {
      button.addEventListener('click', () => {
        copyBlockingModalContent(modal, errorInfo.title, [detailedMessage]);
      });
    }
  });

  // Close button in header
  const headerCloseButton = modal.querySelector(`#${modalId}-close-btn`);
  if (headerCloseButton) {
    headerCloseButton.addEventListener('click', () => {
      hideModal(modalId);
    });
  }

  // Close button in footer
  const footerCloseBtn = modal.querySelector(`#${modalId}-footer-close`);
  if (footerCloseBtn) {
    footerCloseBtn.addEventListener('click', () => {
      hideModal(modalId);
    });
  }

  console.log('✅ Critical error modal shown:', modalId);
}

/**
 * Helper function to create critical error with automatic context detection
 * NOTIFICATION SYSTEM - Automatically detects context and creates detailed error
 *
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {Object} additionalDetails - Additional error details (optional)
 * @param {string} category - Error category (default: 'system')
 */
function createCriticalError(title, message, additionalDetails = {}, category = 'system') {
  // Get current function name from stack trace
  const stack = new Error().stack;
  const stackLines = stack.split('\n');
  const callerLine = stackLines[2] || stackLines[1] || '';

  // Extract function name and line number
  const functionMatch = callerLine.match(/at\s+(\w+)/);
  const lineMatch = callerLine.match(/:(\d+):/);

  const errorDetails = {
    source: 'automatic-detection',
    function: functionMatch ? functionMatch[1] : 'unknown',
    line: lineMatch ? lineMatch[1] : 'unknown',
    stack: stack,
    ...additionalDetails,
  };

  // Show critical error notification
  showCriticalErrorNotification(title, message, errorDetails, category);
}

/**
 * Helper function to wrap existing functions with critical error handling
 * NOTIFICATION SYSTEM - Wraps functions to automatically show critical errors on failure
 *
 * @param {Function} func - Function to wrap
 * @param {string} errorTitle - Error title for critical errors
 * @param {string} errorMessage - Error message for critical errors
 * @returns {Function} Wrapped function
 */
function withCriticalErrorHandling(
  func,
  errorTitle = 'שגיאה קריטית',
  errorMessage = 'אירעה שגיאה קריטית'
) {
  return async function (...args) {
    try {
      return await func.apply(this, args);
    } catch (error) {
      console.error('Critical error caught:', error);

      const errorDetails = {
        source: 'error-handler',
        function: func.name || 'anonymous',
        line: 'wrapped-function',
        stack: error.stack,
        originalError: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        arguments: args,
      };

      showCriticalErrorNotification(errorTitle, errorMessage, errorDetails, 'system');

      // Re-throw the error to maintain normal error flow
      throw error;
    }
  };
}

// REMOVED: showWarningNotification - use window.showWarningNotification from notification-system.js

// REMOVED: showInfoNotification - use window.showInfoNotification from notification-system.js

/**
 * Show details modal
 * NOTIFICATION SYSTEM - Displays details in a modal dialog
 *
 * @param {string} title - Modal title
 * @param {string} content - Modal content (HTML or text)
 * @param {Object} options - Additional options
 */
async function showDetailsModal(title, content, options = {}) {
  console.log('🔍 showDetailsModal called:', { title, content, options });

  // סגירת כל החלונות הקודמים
  closeAllDetailsModals();

  // Create unique modal ID
  const modalId = `details-modal-${Date.now()}`;

  // Extract text content for copying
  const textContent = extractTextFromHTML(content);

  // Check if copy button should be included
  const includeCopyButton = options.includeCopyButton || false;

  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header modal-header-info text-white d-flex justify-content-between align-items-center" style="direction: rtl;">
            <h4 class="modal-title fw-bold" id="${modalId}-label">${title}</h4>
            <div class="d-flex gap-2">
              ${
                includeCopyButton
                  ? `<button type="button" class="btn btn-sm btn-primary" id="${modalId}-copy-btn" title="העתק ללוח">
                <i class="fas fa-copy"></i> העתק
              </button>`
                  : ''
              }
              <button type="button" class="btn btn-sm btn-secondary" id="${modalId}-close-btn" title="סגור">
                X
              </button>
            </div>
          </div>
          <div class="modal-body">
            <div class="details-content">
              ${content}
            </div>
          </div>
          <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
            <button type="button" class="btn btn-secondary" id="${modalId}-footer-close">סגור</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Get modal element
  const modal = document.getElementById(modalId);

  // Ensure content is properly rendered as HTML
  const detailsContent = modal.querySelector('.details-content');
  if (detailsContent) {
    detailsContent.innerHTML = content;
  }

  // Show modal using simple system (no Bootstrap dependency)
  modal.style.display = 'block';
  modal.classList.add('show');
  document.body.classList.add('modal-open');

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  backdrop.id = `${modalId}-backdrop`;
  document.body.appendChild(backdrop);

  // סגירה בלחיצה על הרקע
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      hideModal(modalId);
    }
  });

  // כפתור העתקה
  const copyButton = modal.querySelector(`#${modalId}-copy-btn`);
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      // אם יש קוד שנוצר, השתמש בו; אחרת השתמש בתוכן הטקסט
      const codeToCopy = window.lastGeneratedCode || textContent;
      if (window.lastGeneratedCode) {
        // העתקת קוד שנוצר
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard
            .writeText(codeToCopy)
            .then(() => {
              if (typeof showNotification === 'function') {
                showNotification('✅ הקוד הועתק ללוח בהצלחה!', 'success');
              }
            })
            .catch(err => {
              console.error('Clipboard API failed:', err);
              copyToClipboard(codeToCopy, title);
            });
        } else {
          copyToClipboard(codeToCopy, title);
        }
      } else {
        copyToClipboard(textContent, title);
      }
    });
  }

  // כפתור סגירה בכותרת
  const headerCloseButton = modal.querySelector(`#${modalId}-close-btn`);
  if (headerCloseButton) {
    headerCloseButton.addEventListener('click', () => {
      hideModal(modalId);
    });
  }

  // כפתור סגירה ב-footer
  const footerCloseBtn = modal.querySelector(`#${modalId}-footer-close`);
  if (footerCloseBtn) {
    footerCloseBtn.addEventListener('click', () => {
      hideModal(modalId);
    });
  }

  console.log('✅ Details modal shown:', modalId);
}

// Helper function to hide modal
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  const backdrop = document.getElementById(`${modalId}-backdrop`);

  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    modal.remove();
  }

  if (backdrop) {
    backdrop.remove();
  }

  // Backdrop handled by Bootstrap
}

// Helper function to close all details modals
function closeAllDetailsModals() {
  // Find all existing details modals
  const existingModals = document.querySelectorAll('[id^="details-modal-"]');
  existingModals.forEach(modal => {
    const modalId = modal.id;
    hideModal(modalId);
  });

  // Remove any remaining backdrops
  const existingBackdrops = document.querySelectorAll('[id^="details-modal-"][id$="-backdrop"]');
  existingBackdrops.forEach(backdrop => {
    backdrop.remove();
  });
}

// Helper function to extract text content from HTML
function extractTextFromHTML(htmlContent) {
  // Create temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Extract text content
  let textContent = tempDiv.textContent || tempDiv.innerText || '';

  // Clean up the text
  textContent = textContent
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s+/g, '\n') // Clean up line breaks
    .trim();

  return textContent;
}

// Helper function to copy text to clipboard
function copyToClipboard(textContent, title) {
  // Format the content with title
  const formattedContent = `${title}\n${'='.repeat(title.length)}\n\n${textContent}`;

  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(formattedContent)
        .then(() => {
          window.showSuccessNotification('התוכן הועתק ללוח בהצלחה', 'העתקה');
          console.log('✅ Content copied to clipboard via Clipboard API');
        })
        .catch(err => {
          console.warn('Clipboard API failed, trying fallback:', err);
          fallbackCopyToClipboard(formattedContent);
        });
    } else {
      // Fallback for older browsers or non-secure contexts
      fallbackCopyToClipboard(formattedContent);
    }
  } catch (error) {
    console.error('❌ Error copying to clipboard:', error);
    fallbackCopyToClipboard(formattedContent);
  }
}

// Fallback copy function
function fallbackCopyToClipboard(text) {
  try {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      showSuccessNotification('התוכן הועתק ללוח בהצלחה', 'העתקה');
      console.log('✅ Content copied to clipboard via fallback method');
    } else {
      throw new Error('execCommand failed');
    }
  } catch (error) {
    console.error('❌ Fallback copy failed:', error);
    window.showErrorNotification('שגיאה בהעתקה ללוח', 'שגיאה');
  }
}

// WARNING FUNCTIONS MOVED TO warning-system.js
// showValidationWarning, showConfirmationDialog, and showDeleteWarning
// are now located in scripts/warning-system.js

// ===== LEGACY SUPPORT =====
// These functions provide backward compatibility

// REMOVED: showNotificationLegacy - legacy function not used, only console.log
// function _REMOVED_showNotificationLegacy(message, type = 'info', duration = 4000) {
//   // Direct console log to avoid recursion
//   console.log(`🔔 ${type.toUpperCase()}: ${message}`);
// }

// ===== GLOBAL NOTIFICATION HISTORY SYSTEM =====
/**
 * Save notification to global history for notifications center
 * NOTIFICATION SYSTEM - Saves all notifications to UnifiedIndexedDB for global access
 *
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
async function saveNotificationToGlobalHistory(type, title, message, category = 'general') {
  try {
    // יצירת אובייקט התראה
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      category,
      time: new Date(),
      timestamp: Date.now(),
      page: window.location.pathname,
      url: window.location.href,
    };

    // שמירה למערכת המטמון המאוחדת החדשה רק אם מאותחלת ולא נשמרה כבר
    if (
      window.UnifiedCacheManager &&
      window.UnifiedCacheManager.initialized &&
      !notification._savedToCache
    ) {
      try {
        await window.UnifiedCacheManager.save('notification_history', notification, {
          layer: 'indexedDB',
          ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
          category: 'notification',
        });
        notification._savedToCache = true; // סימון שנשמרה
      } catch (error) {
        console.warn('שגיאה בשמירה במערכת המטמון החדשה, עובר ל-localStorage:', error.message);
      }
    } else if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
      // מערכת מטמון לא מאותחלת - מדלג על שמירה
      console.debug('⚠️ Cache system not initialized - skipping notification history save');
    }

    // Fallback דרך UnifiedCacheManager - כלל 44
    try {
      let globalHistory = [];
      if (
        window.UnifiedCacheManager &&
        (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())
      ) {
        try {
          const savedHistory = await window.UnifiedCacheManager.get(
            'tiktrack_global_notifications_history',
            {
              layer: 'localStorage',
            }
          );
          if (savedHistory) {
            globalHistory = savedHistory;
          }
        } catch (cacheErr) {
          console.warn('שגיאה בטעינה מ-UnifiedCacheManager:', cacheErr);
        }
      } else {
        console.warn('UnifiedCacheManager לא זמין - לא ניתן לשמור היסטוריית התראות');
        return;
      }

      globalHistory.unshift(notification);
      if (globalHistory.length > 100) {
        globalHistory = globalHistory.slice(0, 100);
      }

      await window.UnifiedCacheManager.save(
        'tiktrack_global_notifications_history',
        globalHistory,
        {
          layer: 'localStorage',
          ttl: null,
        }
      );
    } catch (e) {
      console.error('שגיאה בשמירת היסטוריית התראות (כלל 44 violation prevented):', e);
    }

    // עדכון סטטיסטיקות גלובליות
    await updateGlobalNotificationStats();

    // console.log('✅ התראה נשמרה להיסטוריה גלובלית');
  } catch (error) {
    console.warn('שגיאה בשמירת התראה להיסטוריה גלובלית:', error);
  }
}

/**
 * Update global notification statistics
 * NOTIFICATION SYSTEM - Updates global stats for notifications center
 */
async function updateGlobalNotificationStats() {
  try {
    let history = [];

    // טעינת היסטוריה מ-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      try {
        history = await window.UnifiedIndexedDB.getNotificationHistory();
      } catch (error) {
        console.warn('שגיאה בטעינה מ-IndexedDB, עובר ל-localStorage:', error.message);
        history = [];
      }
    } else {
      // מערכת מטמון לא מאותחלת - מדלג על טעינה
      console.debug('⚠️ Cache system not initialized - skipping notification history load');
      history = [];
    }

    // Fallback ל-localStorage
    if (history.length === 0) {
      try {
        if (
          window.UnifiedCacheManager &&
          (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())
        ) {
          const savedHistory = await window.UnifiedCacheManager.get(
            'tiktrack_global_notifications_history',
            {
              layer: 'localStorage',
            }
          );
          if (savedHistory) {
            history = savedHistory;
          }
        } else {
          console.warn('UnifiedCacheManager לא זמין - לא ניתן לטעון היסטוריית התראות');
        }
      } catch (e) {
        console.warn('שגיאה בטעינת היסטוריה דרך UnifiedCacheManager:', e);
      }
    }

    const stats = {
      success: history.filter(n => n.type === 'success').length,
      error: history.filter(n => n.type === 'error').length,
      warning: history.filter(n => n.type === 'warning').length,
      info: history.filter(n => n.type === 'info').length,
      total: history.length,
      lastUpdated: Date.now(),
    };

    // שמירה למערכת המטמון המאוחדת - רק אם לא נשמרו כבר
    if (
      window.UnifiedCacheManager &&
      window.UnifiedCacheManager.initialized &&
      !stats._savedToCache
    ) {
      try {
        await window.UnifiedCacheManager.save('notification_stats', stats, {
          layer: 'indexedDB',
          ttl: 24 * 60 * 60 * 1000, // 24 hours
          category: 'notification',
        });
        stats._savedToCache = true; // סימון שנשמרו
      } catch (error) {
        console.warn('שגיאה בשמירת סטטיסטיקות ב-IndexedDB:', error.message);
      }
    } else if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
      // מערכת מטמון לא מאותחלת - מדלג על שמירת סטטיסטיקות
      console.debug('⚠️ Cache system not initialized - skipping notification stats save');
    }

    // Fallback דרך UnifiedCacheManager - כלל 44
    try {
      if (
        window.UnifiedCacheManager &&
        (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())
      ) {
        await window.UnifiedCacheManager.save('tiktrack_global_notifications_stats', stats, {
          layer: 'localStorage',
          ttl: 24 * 60 * 60 * 1000, // 24 hours
        });
      } else {
        console.warn('UnifiedCacheManager לא זמין - לא ניתן לשמור סטטיסטיקות התראות');
      }
    } catch (e) {
      console.error(
        'שגיאה בשמירת סטטיסטיקות דרך UnifiedCacheManager (כלל 44 violation prevented):',
        e
      );
    }
  } catch (error) {
    console.warn('שגיאה בעדכון סטטיסטיקות גלובליות:', error);
  }
}

/**
 * Load global notification history
 * NOTIFICATION SYSTEM - Loads global history for notifications center
 *
 * @returns {Promise<Array>} Global notification history
 */
async function loadGlobalNotificationHistory() {
  try {
    // טעינה מ-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      const history = await window.UnifiedIndexedDB.getAll('notificationHistory');
      if (history && history.length > 0) {
        return history;
      }
    } else {
      // IndexedDB לא זמין או לא מאותחל - מדלג על טעינה מ-IndexedDB
      // console.log('UnifiedIndexedDB לא מאותחל עדיין, מדלג על טעינת היסטוריה');
    }

    // Fallback דרך UnifiedCacheManager - כלל 44
    if (window.UnifiedCacheManager?.initialized) {
      try {
        const savedHistory = await window.UnifiedCacheManager.get(
          'tiktrack_global_notifications_history',
          {
            layer: 'localStorage',
          }
        );
        return savedHistory ? savedHistory : [];
      } catch (cacheErr) {
        console.warn('שגיאה בטעינה דרך UnifiedCacheManager:', cacheErr);
        return [];
      }
    } else {
      console.warn('UnifiedCacheManager לא זמין - לא ניתן לטעון היסטוריית התראות');
      return [];
    }
  } catch (error) {
    console.warn('שגיאה בטעינת היסטוריית התראות גלובלית:', error);
    return [];
  }
}

/**
 * Load global notification statistics
 * NOTIFICATION SYSTEM - Loads global stats for notifications center
 *
 * @returns {Promise<Object>} Global notification statistics
 */
async function loadGlobalNotificationStats() {
  try {
    // טעינה מ-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      const stats = await window.UnifiedIndexedDB.getNotificationStats();
      if (stats) {
        return stats;
      }
    } else {
      // IndexedDB לא זמין או לא מאותחל - מדלג על טעינה מ-IndexedDB
      console.log('UnifiedIndexedDB לא מאותחל עדיין, מדלג על טעינת סטטיסטיקות');
    }

    // Fallback דרך UnifiedCacheManager - כלל 44
    if (window.UnifiedCacheManager?.initialized) {
      try {
        const savedStats = await window.UnifiedCacheManager.get(
          'tiktrack_global_notifications_stats',
          {
            layer: 'localStorage',
          }
        );
        if (savedStats) {
          return savedStats;
        }
      } catch (cacheErr) {
        console.warn('שגיאה בטעינה דרך UnifiedCacheManager:', cacheErr);
      }
    } else {
      console.warn('UnifiedCacheManager לא זמין - לא ניתן לטעון סטטיסטיקות התראות');
    }
  } catch (error) {
    console.warn('שגיאה בטעינת סטטיסטיקות גלובליות:', error);
  }

  // סטטיסטיקות ברירת מחדל
  return {
    success: 0,
    error: 0,
    warning: 0,
    info: 0,
    total: 0,
    lastUpdated: Date.now(),
  };
}

const BLOCKING_MODAL_COLOR_FALLBACK = {
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
};

function getBlockingModalColors(type) {
  let backgroundColor =
    BLOCKING_MODAL_COLOR_FALLBACK[type] || BLOCKING_MODAL_COLOR_FALLBACK.success;

  try {
    if (typeof window.getNotificationColor === 'function') {
      backgroundColor = window.getNotificationColor(type);
    } else if (typeof window.getEntityColor === 'function') {
      switch (type) {
        case 'success':
          backgroundColor = window.getEntityColor('account') || backgroundColor;
          break;
        case 'error':
          backgroundColor = window.getEntityColor('ticker') || backgroundColor;
          break;
        case 'warning':
          backgroundColor = window.getEntityColor('alert') || backgroundColor;
          break;
        case 'info':
          backgroundColor = window.getEntityColor('execution') || backgroundColor;
          break;
        default:
          backgroundColor = window.getEntityColor(type) || backgroundColor;
      }
    }
  } catch (error) {
    if (window.Logger && window.Logger.warn) {
      window.Logger.warn('⚠️ Failed to resolve blocking modal color, using fallback', error, {
        page: 'core-systems',
      });
    } else {
      console.warn('⚠️ Failed to resolve blocking modal color, using fallback:', error);
    }
  }

  return {
    backgroundColor,
    borderColor: backgroundColor,
    textColor: '#ffffff',
  };
}

function extractModalContentText(modalElement) {
  if (!modalElement) {
    return '';
  }

  const contentElement = modalElement.querySelector('.modal-content');
  if (!contentElement) {
    return '';
  }

  // Clone element to avoid modifying DOM
  const clone = contentElement.cloneNode(true);

  // Remove buttons to avoid duplicating action labels if needed
  clone.querySelectorAll('button').forEach(button => {
    button.remove();
  });

  const rawText = clone.innerText || '';
  return rawText
    .replace(/\u00A0/g, ' ') // replace non-breaking spaces
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function copyBlockingModalContent(modalElement, title, fallbackSegments = []) {
  const segments = [];
  const modalText = extractModalContentText(modalElement);
  if (modalText) {
    segments.push(modalText);
  }

  (fallbackSegments || []).forEach(segment => {
    if (segment) {
      segments.push(segment);
    }
  });

  if (!segments.length) {
    segments.push('תוכן לא זמין להעתקה');
  }

  const content = segments.join('\n\n');
  const resolvedTitle = title || 'TikTrack Modal Details';

  copyToClipboard(content, resolvedTitle);
}

/**
 * Format success information for copying
 * NOTIFICATION SYSTEM - Formats success details for clipboard
 *
 * @param {Object} successInfo - Success information object
 * @returns {string} Formatted success message
 */
function formatSuccessForCopy(successInfo) {
  return `
═══════════════════════════════════════════════════════════════
  🎉 פרטי הצלחה מפורטים - TikTrack System Success Details
═══════════════════════════════════════════════════════════════

📋 כותרת:
${successInfo.title}

📝 הודעה:
${successInfo.message}

🏷️ קטגוריה:
${successInfo.category}

🆔 מזהה:
${successInfo.id}

⏰ זמן:
${window.formatDate ? window.formatDate(new Date(successInfo.timestamp), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(successInfo.timestamp), { includeTime: true }) : new Date(successInfo.timestamp).toLocaleString('he-IL'))}

📊 פרטי הצלחה:
${JSON.stringify(successInfo.details, null, 2)}

🖥️ מידע דפדפן:
${JSON.stringify(successInfo.browser, null, 2)}

⚙️ מידע מערכת:
${JSON.stringify(successInfo.system, null, 2)}

${successInfo.performance ? `⚡ ביצועים:\n${JSON.stringify(successInfo.performance, null, 2)}\n` : ''}

═══════════════════════════════════════════════════════════════
  נוצר על ידי מערכת TikTrack - ${window.formatDate ? window.formatDate(new Date(), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(), { includeTime: true }) : new Date().toLocaleString('he-IL'))}
═══════════════════════════════════════════════════════════════
  `.trim();
}

// Global function for copying success details
window.copySuccessDetails = function () {
  if (!window.currentSuccessInfo) {
    if (window.Logger && window.Logger.warn) {
      window.Logger.warn('⚠️ copySuccessDetails called without currentSuccessInfo', null, {
        page: 'core-systems',
      });
    } else {
      console.warn('⚠️ copySuccessDetails called without currentSuccessInfo');
    }
    return;
  }

  const modalElement =
    document.getElementById('finalSuccessModal') ||
    document.getElementById('finalSuccessModalWithReload');
  copyBlockingModalContent(modalElement, window.currentSuccessInfo.title, [
    formatSuccessForCopy(window.currentSuccessInfo),
  ]);
};

// ===== EXPORT TO GLOBAL SCOPE =====

// Export ALERTS SYSTEM functions to global scope
window.createAlert = createAlert;
window.updateAlert = updateAlert;
window.markAlertAsTriggered = markAlertAsTriggered;
window.markAlertAsRead = markAlertAsRead;

// Export NOTIFICATION SYSTEM functions to global scope
// Export NOTIFICATION SYSTEM functions to global scope
// Note: showSuccessNotification, showErrorNotification, showWarningNotification, showInfoNotification
// are exported from notification-system.js - removed local duplicates
// Note: showNotification is also exported from notification-system.js - removed local duplicate
// Use window.showNotification from notification-system.js (more advanced version with options parameter)
window.showFinalSuccessNotification = showFinalSuccessNotification;
window.showFinalSuccessNotificationWithReload = showFinalSuccessNotificationWithReload;
// window.showSuccessNotification - use global from notification-system.js
// window.showErrorNotification - use global from notification-system.js
window.showSimpleErrorNotification = showSimpleErrorNotification;
window.showCriticalErrorNotification = showCriticalErrorNotification;
window.createCriticalError = createCriticalError;
window.withCriticalErrorHandling = withCriticalErrorHandling;
// window.showWarningNotification - use global from notification-system.js
// window.showInfoNotification - use global from notification-system.js
window.showDetailsModal = showDetailsModal;

// Export NOTIFICATION CATEGORIES SYSTEM functions to global scope
window.shouldShowNotification = shouldShowNotification;
window.shouldLogToConsole = shouldLogToConsole;
window.logWithCategory = logWithCategory;
window.getLogEmoji = getLogEmoji;

// Export GLOBAL NOTIFICATION HISTORY functions
window.saveNotificationToGlobalHistory = saveNotificationToGlobalHistory;
window.loadGlobalNotificationHistory = loadGlobalNotificationHistory;
window.loadGlobalNotificationStats = loadGlobalNotificationStats;
window.updateGlobalNotificationStats = updateGlobalNotificationStats;

// WARNING SYSTEM functions now exported from warning-system.js
// window.showValidationWarning, window.showConfirmationDialog, window.showDeleteWarning

// Export LINKED ITEMS SYSTEM functions to global scope
window.loadLinkedItemsData = loadLinkedItemsData;

// Export the module itself
window.notificationSystem = {
  // ALERTS SYSTEM functions
  createAlert,
  updateAlert,
  markAlertAsTriggered,
  markAlertAsRead,

  // NOTIFICATION SYSTEM functions
  // Note: showSuccessNotification, showWarningNotification, showInfoNotification use global functions from notification-system.js
  showNotification, // Keep local - has complex logic
  showFinalSuccessNotification,
  // showErrorNotification - use global from notification-system.js
  showSimpleErrorNotification,
  showCriticalErrorNotification,
  createCriticalError,
  withCriticalErrorHandling,
  createNotificationContainer,
  hideNotification,
  getNotificationIcon,

  // NOTIFICATION CATEGORIES SYSTEM functions
  shouldShowNotification,
  shouldLogToConsole,
  logWithCategory,
  getLogEmoji,

  // WARNING SYSTEM functions moved to warning-system.js
  // showValidationWarning, showConfirmationDialog, showDeleteWarning

  // LINKED ITEMS SYSTEM functions
  loadLinkedItemsData,
};

// Global NotificationSystem object for compatibility
window.NotificationSystem = {
  show: window.showNotification,
  showSuccess: window.showSuccessNotification, // From notification-system.js
  showFinalSuccess: window.showFinalSuccessNotification,
  showError: window.showErrorNotification, // From notification-system.js
  showSimpleError: window.showSimpleErrorNotification,
  showCriticalError: window.showCriticalErrorNotification,
  createCriticalError: window.createCriticalError,
  withCriticalErrorHandling: window.withCriticalErrorHandling,
  showWarning: window.showWarningNotification, // From notification-system.js
  showInfo: window.showInfoNotification, // From notification-system.js
  showDetails: window.showDetailsModal,
  shouldShow: window.shouldShowNotification,
  logWithCategory: window.logWithCategory,
  getCategoryIcon: window.getCategoryIcon,
  addGlobal: window.addGlobalNotification,
  getGlobal: window.getGlobalNotifications,
  clearGlobal: window.clearGlobalNotifications,
  migrate: window.migrateNotifications,
  isMigrationNeeded: window.isMigrationNeeded,
  initialize: function () {
    console.log('🚀 NotificationSystem.initialize called');
    // Initialize notification system if needed
    // if (window.notificationSystemTester) {
    //     window.notificationSystemTester.runAllTests();
    // }
    return true;
  },
};

// פונקציה להצגת הודעה מפורטת בחלון
window.showDetailedNotification = async function (
  title,
  message,
  type = 'info',
  duration = 8000,
  category = null
) {
  try {
    // יצירת modal עם התוכן המפורט
    const modalId = `detailed-notification-${Date.now()}`;
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'} text-white">
              <h5 class="modal-title" id="${modalId}Label">${title}</h5>
              ${window.createCloseButton ? window.createCloseButton('', 'Close') : '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'}
            </div>
            <div class="modal-body">
              <div style="white-space: pre-line; font-family: monospace; font-size: 0.9em;">${message}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
              <button type="button" class="btn btn-primary" data-copy-text="${message.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" id="${modalId}-copy-btn">העתק</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Use the unified helper function to create and show modal without ARIA warnings
    const modal = window.createAndShowModal(modalHtml, modalId);
    const modalElement = document.getElementById(modalId);

    // הוספת event listener לכפתור העתקה (למניעת בעיות escape)
    const copyBtn = document.getElementById(`${modalId}-copy-btn`);
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const textToCopy = copyBtn.getAttribute('data-copy-text') || message;
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(textToCopy, title);
        } else if (typeof copyToClipboard === 'function') {
          copyToClipboard(textToCopy, title);
        } else {
          // Fallback: use navigator.clipboard directly
          navigator.clipboard.writeText(textToCopy).then(() => {
            if (typeof window.showSuccessNotification === 'function') {
              window.showSuccessNotification('התוכן הועתק ללוח', 'העתקה');
            }
          }).catch(err => {
            console.error('Failed to copy:', err);
          });
        }
      });
    }

    // הסרת ה-modal אחרי סגירה
    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
    });

    // סגירה אוטומטית אחרי הזמן שצוין
    if (duration > 0) {
      setTimeout(() => {
        if (modalElement && document.contains(modalElement)) {
          modal.hide();
        }
      }, duration);
    }

    return true;
  } catch (error) {
    console.error('❌ Error showing detailed notification:', error);
    // fallback להודעה רגילה
    return await window.showNotification(message, type, title, duration, category);
  }
};

// Export new helper functions to global scope
window.closeAllDetailsModals = closeAllDetailsModals;
window.extractTextFromHTML = extractTextFromHTML;
window.copyToClipboard = copyToClipboard;

// בדיקת פונקציות בסוף טעינת notification-system.js
// notification-system.js נטען
// WARNING FUNCTIONS moved to warning-system.js
// showDeleteWarning, showConfirmationDialog, showValidationWarning now in warning-system.js

// ===== DYNAMIC LOADING GLOBAL FUNCTIONS =====

/**
 * Load module dynamically (Global function)
 * טעינת מודול דינמית (פונקציה גלובלית)
 *
 * @param {string} moduleName - Name of module to load
 * @returns {Promise<boolean>} Success status
 */
window.loadModule = async function (moduleName) {
  if (window.UnifiedAppInitializer) {
    return await window.UnifiedAppInitializer.loadModule(moduleName);
  } else {
    console.error('❌ UnifiedAppInitializer not available');
    return false;
  }
};

/**
 * Get loading statistics (Global function)
 * קבלת סטטיסטיקות טעינה (פונקציה גלובלית)
 *
 * @returns {Object} Loading statistics
 */
window.getLoadingStats = function () {
  if (window.UnifiedAppInitializer) {
    return window.UnifiedAppInitializer.getLoadingStats();
  } else {
    return {
      totalModules: 0,
      loadedModules: 0,
      loadingModules: 0,
      totalSize: '0KB',
      loadedSize: '0KB',
      loadingProgress: '0%',
    };
  }
};

/**
 * Check if module is loaded (Global function)
 * בדיקה אם מודול נטען (פונקציה גלובלית)
 *
 * @param {string} moduleName - Name of module to check
 * @returns {boolean} Whether module is loaded
 */
window.isModuleLoaded = function (moduleName) {
  if (window.UnifiedAppInitializer) {
    return window.UnifiedAppInitializer.loadedModules.has(moduleName);
  } else {
    return false;
  }
};

/**
 * Get available modules (Global function)
 * קבלת מודולים זמינים (פונקציה גלובלית)
 *
 * @returns {Array<string>} Available module names
 */
window.getAvailableModules = function () {
  if (window.UnifiedAppInitializer) {
    return Array.from(window.UnifiedAppInitializer.moduleConfigs.keys());
  } else {
    return [];
  }
};

/**
 * Enable/disable dynamic loading (Global function)
 * הפעלה/ביטול טעינה דינמית (פונקציה גלובלית)
 *
 * @param {boolean} enabled - Whether to enable dynamic loading
 */
window.setDynamicLoading = function (enabled) {
  if (window.UnifiedAppInitializer) {
    window.UnifiedAppInitializer.dynamicLoadingEnabled = enabled;
    console.log(`🔧 Dynamic loading ${enabled ? 'enabled' : 'disabled'}`);
  } else {
    console.error('❌ UnifiedAppInitializer not available');
  }
};

console.log('✅ Core Systems module loaded successfully (Static Loading)');

// ===== PAGE INITIALIZATION CONFIGURATIONS =====
// NOTE: PAGE_CONFIGS is now defined in page-initialization-configs.js
// This file (core-systems.js) uses window.pageInitializationConfigs which is set by page-initialization-configs.js
// The PAGE_CONFIGS definition below is kept for backward compatibility but should not be used
// All page configurations with packages array are in page-initialization-configs.js

// ARCHIVED: PAGE_CONFIGS definition removed - use page-initialization-configs.js instead
// This ensures single source of truth and includes packages array required for preferences initialization
if (false && typeof window.PAGE_CONFIGS === 'undefined') {
  const PAGE_CONFIGS = {
    // Main Pages
    index: {
      name: 'Dashboard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        // Dashboard-specific initialization
        async pageConfig => {
          console.log('📊 Initializing Dashboard...');

          // Call unified initialization function
          if (typeof window.initializeIndexPage === 'function') {
            window.initializeIndexPage();
          }
        },
      ],
    },

    preferences: {
      name: 'Preferences',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: false,
      customInitializers: [
        // Preferences-specific initialization - NEW v2.0 Architecture
        async pageConfig => {
          console.log('⚙️ Initializing Preferences (v2.0 - OOP Architecture)...');

          // NEW: Single initialization call to PreferencesSystem
          if (window.PreferencesSystem) {
            await window.PreferencesSystem.initialize();
            console.log('✅ Preferences v2.0 initialization complete');
          } else {
            console.error('❌ PreferencesSystem not found! preferences-core.js not loaded?');
          }

          // Initialize validation for preferences form
          if (typeof window.initializeValidation === 'function') {
            console.log('🔧 Initializing validation for preferences form...');
            window.initializeValidation('preferencesForm', {});
            console.log('✅ Preferences form validation initialized');
          } else {
            console.warn('⚠️ Validation system not available for preferences form');
          }
        },
      ],
    },

    // Trading Pages
    trades: {
      name: 'Trades',
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('📈 Initializing Trades...');

          // Load trades data
          if (typeof window.loadTradesData === 'function') {
            await window.loadTradesData();
          }

          // Setup trade-specific handlers
          if (typeof window.setupTradeHandlers === 'function') {
            window.setupTradeHandlers();
          }
        },
      ],
    },

    trade_plans: {
      name: 'Trade Plans',
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('📋 Initializing Trade Plans...');

          // Load trade plans data directly
          if (typeof window.loadTradePlansData === 'function') {
            await window.loadTradePlansData();
          } else {
            console.warn('⚠️ loadTradePlansData function not available');
          }
        },
      ],
    },

    executions: {
      name: 'Executions',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      requiresCommunication: true,
      requiresCharts: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info?.('⚡ Initializing Executions (from core-systems)...', {
            page: 'core-systems',
          });

          // Use page-initialization-configs if available, otherwise fallback
          if (window.PAGE_CONFIGS?.executions?.customInitializers) {
            const pageConfigInitializers = window.PAGE_CONFIGS.executions.customInitializers;
            window.Logger?.info?.('📋 Using page-initialization-configs initializers', {
              count: pageConfigInitializers.length,
              page: 'core-systems',
            });
            for (const init of pageConfigInitializers) {
              if (typeof init === 'function') {
                try {
                  await init(pageConfig);
                } catch (error) {
                  window.Logger?.error?.('❌ Error in page-initialization-configs initializer', {
                    error: error?.message,
                    page: 'core-systems',
                  });
                }
              }
            }
          } else if (typeof window.initializeExecutionsPage === 'function') {
            window.Logger?.info?.('📋 Using initializeExecutionsPage fallback', {
              page: 'core-systems',
            });
            await window.initializeExecutionsPage();
          } else {
            window.Logger?.warn?.('⚠️ No executions initialization method available', {
              page: 'core-systems',
            });
          }
        },
      ],
    },

    alerts: {
      name: 'Alerts',
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('🔔 Initializing Alerts...');

          if (typeof window.initializeAlertsPage === 'function') {
            window.initializeAlertsPage();
          }
        },
      ],
    },

    // Account Management
    // REMOVED: Duplicate 'trading_accounts' - see line 213 for the correct implementation

    cash_flows: {
      name: 'Cash Flows',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      // No custom initializers - use standard initialization pattern
      // Page-specific initialization should be called from the page script itself
      // using DOMContentLoaded or the standard initialization hooks
    },

    // Data Management
    tickers: {
      name: 'Tickers',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('📊 Initializing Tickers...');

          if (typeof window.initializeTickersPage === 'function') {
            window.initializeTickersPage();
          }
        },
      ],
    },

    notes: {
      name: 'Notes',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          // Use general system getPageDataFunctions() instead of local code
          if (typeof window.getPageDataFunctions === 'function') {
            const { loadData } = window.getPageDataFunctions();
            if (loadData && typeof loadData === 'function') {
              console.log('📝 Initializing Notes via general system...');
              try {
                await loadData();
                console.log('✅ Notes data loaded successfully');
              } catch (error) {
                console.error('❌ Error loading notes data:', error);
              }
            } else {
              // Fallback to direct function call
              if (typeof window.loadNotesData === 'function') {
                console.log('📝 Initializing Notes (fallback)...');
                try {
                  await window.loadNotesData();
                  console.log('✅ Notes data loaded successfully');
                } catch (error) {
                  console.error('❌ Error in loadNotesData:', error);
                }
              } else {
                console.warn('⚠️ loadNotesData function not available');
              }
            }
          } else {
            // Fallback if getPageDataFunctions doesn't exist
            if (typeof window.loadNotesData === 'function') {
              console.log('📝 Initializing Notes (direct)...');
              try {
                await window.loadNotesData();
                console.log('✅ Notes data loaded successfully');
              } catch (error) {
                console.error('❌ Error in loadNotesData:', error);
              }
            } else {
              console.warn('⚠️ loadNotesData function not available');
            }
          }
        },
      ],
    },

    trading_accounts: {
      name: 'Trading Accounts',
      requiresFilters: true, // נדרש - פילטרים עובדים
      requiresValidation: true, // נדרש - ולידציה של נתונים
      requiresTables: true, // נדרש - טבלאות עובדות
      customInitializers: [
        async pageConfig => {
          console.log('💼 Initializing Trading Accounts...');

          // אתחול modals ואלמנטים
          if (typeof window.initializeTradingAccountsModals === 'function') {
            window.initializeTradingAccountsModals();
          }

          // טעינת נתונים ועדכון UI פשוט
          if (window.tradingAccountsController) {
            // הגדרת event listeners
            if (typeof window.tradingAccountsController.setupEventListeners === 'function') {
              window.tradingAccountsController.setupEventListeners();
            }

            // טעינת נתונים
            if (typeof window.tradingAccountsController.loadData === 'function') {
              await window.tradingAccountsController.loadData();
            }

            // עדכון UI
            if (typeof window.tradingAccountsController.updateUI === 'function') {
              window.tradingAccountsController.updateUI();
            }

            console.log('✅ Trading Accounts initialized successfully');
          } else {
            console.error('❌ tradingAccountsController not found');
          }
        },
      ],
    },

    // Development Tools
    'system-management': {
      name: 'System Management',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      requiresUI: true,
      customInitializers: [
        async pageConfig => {
          console.log('🔧 Initializing System Management...');

          if (typeof window.loadSystemInfo === 'function') {
            await window.loadSystemInfo();
          }

          // Initialize Unified Log System
          if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
            try {
              await window.UnifiedLogAPI.initialize();
              console.log('✅ Unified Log System initialized for System Management');
            } catch (error) {
              console.warn('⚠️ Failed to initialize Unified Log System:', error);
            }
          }
        },
      ],
    },

    'server-monitor': {
      name: 'Server Monitor',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          console.log('🔧 Initializing Server Monitor...');

          // Initialize server monitor if available
          if (window.serverMonitor) {
            console.log('✅ Server Monitor already initialized');
          } else {
            console.log('⚠️ Server Monitor not available');
          }

          console.log('✅ Server Monitor initialization completed');
        },
      ],
    },

    constraints: {
      name: 'Constraints',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('🔒 Initializing Constraints...');

          if (typeof window.initializeConstraints === 'function') {
            window.initializeConstraints();
          }
        },
      ],
    },

    'css-management': {
      name: 'CSS Management',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          console.log('🎨 Initializing CSS Management...');

          if (typeof window.initializeCssManagement === 'function') {
            window.initializeCssManagement();
          }
        },
      ],
    },

    'chart-management': {
      name: 'Chart Management',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          console.log('📊 Initializing Chart Management...');

          // Chart management initializes automatically via its own DOMContentLoaded
          // Just log that we're aware of it
          console.log('✅ Chart Management system ready');
        },
      ],
    },

    'crud-testing-dashboard': {
      name: 'CRUD Testing',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('🧪 Initializing CRUD Testing...');

          if (typeof window.initializeCRUDTesting === 'function') {
            await window.initializeCRUDTesting();
          }
        },
      ],
    },

    'external-data-dashboard': {
      name: 'External Data',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('🌐 Initializing External Data...');

          // Check if ExternalDataDashboard class is available
          console.log('🔍 Checking ExternalDataDashboard availability:', {
            ExternalDataDashboard: typeof ExternalDataDashboard,
            windowExternalDataDashboard: typeof window.ExternalDataDashboard,
          });

          if (typeof window.loadExternalData === 'function') {
            await window.loadExternalData();
          }

          // Initialize External Data Dashboard
          if (typeof ExternalDataDashboard !== 'undefined' && !window.externalDataDashboard) {
            try {
              window.externalDataDashboard = new ExternalDataDashboard();
              window.externalDataDashboard.init();
              console.log('✅ External Data Dashboard initialized');
            } catch (error) {
              console.error('❌ Failed to initialize External Data Dashboard:', error);
            }
          } else {
            console.log('🔍 External Data Dashboard check:', {
              ExternalDataDashboard: typeof ExternalDataDashboard,
              externalDataDashboard: typeof window.externalDataDashboard,
            });
          }

          // Initialize Unified Log System
          if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
            try {
              await window.UnifiedLogAPI.initialize();
              console.log('✅ Unified Log System initialized for External Data Dashboard');
            } catch (error) {
              console.warn('⚠️ Failed to initialize Unified Log System:', error);
            }
          }

          // Define global functions for button onclick handlers
          console.log('🔧 Defining global functions for External Data Dashboard...');

          window.testProvider = function (providerId) {
            // console.log('🧪 Testing provider:', providerId);
            // Implementation for testing specific provider
          };

          window.toggleProvider = function (providerId) {
            // console.log('🔄 Toggling provider:', providerId);
            // Implementation for toggling provider status
          };

          window.refreshLogs = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.loadLogs();
            }
          };

          window.saveSettings = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.saveSettings();
            }
          };

          window.clearLogs = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.clearLogs();
            }
          };

          window.analyzeData = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.analyzeData();
            }
          };

          window.backupData = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.backupData();
            }
          };

          window.optimizeCache = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.optimizeCache();
            }
          };

          window.refreshProviders = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.loadProviders();
            }
          };

          window.testAllProviders = function () {
            console.log('🔔 testAllProviders called from global function');
            if (window.externalDataDashboard) {
              window.externalDataDashboard.testAllProviders();
            } else {
              console.error('❌ externalDataDashboard not available');
            }
          };

          window.exportData = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.exportData();
            }
          };

          window.resetSettings = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.resetSettings();
            }
          };

          window.refreshGroupHistory = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.loadGroupRefreshHistory();
            }
          };

          window.exportGroupHistory = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.exportGroupHistory();
            }
          };

          window.validateData = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.validateData();
            }
          };

          window.runUnitTests = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.runUnitTests();
            }
          };

          window.testSpecificFunction = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.testSpecificFunction();
            }
          };

          window.generateTestReport = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.generateTestReport();
            }
          };

          window.startPerformanceMonitoring = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.startPerformanceMonitoring();
            }
          };

          window.analyzeBottlenecks = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.analyzeBottlenecks();
            }
          };

          window.stopPerformanceMonitoring = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.stopPerformanceMonitoring();
            }
          };

          window.testAPIEndpoints = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.testAPIEndpoints();
            }
          };

          window.testRateLimiting = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.testRateLimiting();
            }
          };

          window.testErrorHandling = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.testErrorHandling();
            }
          };

          window.refreshPerformanceCharts = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.refreshPerformanceCharts();
            }
          };

          window.exportPerformanceData = function () {
            if (window.externalDataDashboard) {
              window.externalDataDashboard.exportPerformanceData();
            }
          };

          window.refreshChart = function (chartId) {
            if (window.externalDataDashboard) {
              switch (chartId) {
                case 'responseTimeChart':
                  window.externalDataDashboard.refreshPerformanceCharts();
                  break;
                case 'dataQualityChart':
                  window.externalDataDashboard.refreshPerformanceCharts();
                  break;
                case 'providerComparisonChart':
                  window.externalDataDashboard.refreshPerformanceCharts();
                  break;
                case 'errorAnalysisChart':
                  window.externalDataDashboard.refreshPerformanceCharts();
                  break;
                default:
                  console.warn(`Unknown chart ID: ${chartId}`);
              }
            }
          };

          console.log('✅ Global functions defined for External Data Dashboard');

          // Load external data log after page initialization
          setTimeout(async () => {
            try {
              if (typeof window.loadExternalDataLog === 'function') {
                await window.loadExternalDataLog();
                console.log('✅ External data log loaded after page initialization');
              }
            } catch (error) {
              console.error('❌ Failed to load external data log:', error);
            }
          }, 1000); // Wait 1 second after page load
        },
      ],
    },

    'code-quality-dashboard': {
      name: 'Code Quality Dashboard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async () => {
          console.log('📊 Initializing Code Quality Dashboard...');

          if (window.codeQualityDashboard && !window.codeQualityDashboard.isInitialized) {
            window.codeQualityDashboard.init();
          }

          if (typeof window.initializeLintMonitor === 'function') {
            await window.initializeLintMonitor();
          }
        },
      ],
    },

    'notifications-center': {
      name: 'Notifications Center',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          console.log('📬 Initializing Notifications Center...');

          if (typeof window.initializeNotificationsCenter === 'function') {
            await window.initializeNotificationsCenter();
          } else if (typeof window.loadNotifications === 'function') {
            await window.loadNotifications();
          }
        },
      ],
    },
    'notifications-center.html': {
      name: 'Notifications Center HTML',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          console.log('📬 Initializing Notifications Center HTML...');

          if (typeof window.initializeNotificationsCenter === 'function') {
            await window.initializeNotificationsCenter();
          } else if (typeof window.loadNotifications === 'function') {
            await window.loadNotifications();
          }

          // Initialize Unified Log System if available
          if (window.UnifiedLogAPI) {
            console.log('📊 Initializing Unified Log System for notifications center...');
            try {
              await window.UnifiedLogAPI.initialize();

              // Load notification log in the correct container
              const logContainer = document.getElementById('notification-log-container');
              if (logContainer && !logContainer.querySelector('.unified-log-display')) {
                console.log('🔄 Loading notification log in container...');
                await window.showNotificationLog('notification-log-container', {
                  displayConfig: 'default',
                  autoRefresh: true,
                  refreshInterval: 10000,
                });
              }
            } catch (error) {
              console.warn('⚠️ Failed to initialize Unified Log System:', error);
            }
          }
        },
      ],
    },

    'unified-logs-demo.html': {
      name: 'Unified Logs Demo',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          console.log('📊 Initializing Unified Logs Demo...');

          // Initialize Unified Log System
          if (window.UnifiedLogAPI) {
            try {
              await window.UnifiedLogAPI.initialize();
              console.log('✅ Unified Log System initialized for demo');
            } catch (error) {
              console.warn('⚠️ Failed to initialize Unified Log System for demo:', error);
            }
          }
        },
      ],
    },

    db_display: {
      name: 'Database Display',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('🗄️ Initializing Database Display...');

          if (typeof window.loadDatabaseInfo === 'function') {
            await window.loadDatabaseInfo();
          }
        },
      ],
    },

    db_extradata: {
      name: 'Database Extra Data',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('🗄️ Initializing Database Extra Data...');

          if (typeof window.loadExtraDataInfo === 'function') {
            await window.loadExtraDataInfo();
          }
        },
      ],
    },

    research: {
      name: 'Research',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          console.log('🔬 Initializing Research...');

          if (typeof window.initializeResearchTools === 'function') {
            await window.initializeResearchTools();
          }
        },
      ],
    },

    'cache-management': {
      name: 'Cache Management',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          console.log('⚙️ Initializing Cache Management Page via UnifiedAppInitializer...');

          // Initialize Cache Management Page if not already initialized
          if (!window.cacheManagementPage) {
            console.log('🚀 Creating Cache Management Page instance...');

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
              await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
              });
            }

            // Create and initialize Cache Management Page
            if (typeof CacheManagementPage !== 'undefined') {
              window.cacheManagementPage = new CacheManagementPage();
              window.cacheManagementPage.init();
              console.log('✅ Cache Management Page initialized via UnifiedAppInitializer');
            } else {
              console.error('❌ CacheManagementPage class not available');
            }
          } else {
            console.log('✅ Cache Management Page already initialized');
          }

          // Ensure cache systems are ready
          if (typeof window.initializeAllCacheSystems === 'function') {
            try {
              await window.initializeAllCacheSystems(true); // isInitialLoad = true
              console.log('✅ Cache systems initialized for Cache Management Page');
            } catch (error) {
              console.error('❌ Failed to initialize cache systems:', error);
            }
          }
        },
      ],
    },

    'test-header-only': {
      name: 'Test Header Only',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('🧪 Initializing Test Header Only...');

          // Initialize test page
          if (typeof window.initializeTestHeaderPage === 'function') {
            await window.initializeTestHeaderPage();
          } else {
            console.warn('⚠️ initializeTestHeaderPage not available');
          }

          console.log('✅ Test Header Only initialized');
        },
      ],
    },
  };

  // ===== CONFIGURATION HELPER FUNCTIONS =====

  /**
   * Get page configuration by page name
   * @param {string} pageName - Page name
   * @returns {Object} Page configuration
   */
  window.getPageConfig = function (pageName) {
    return (
      PAGE_CONFIGS[pageName] || {
        name: pageName,
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [],
      }
    );
  };

  /**
   * Get all available page configurations
   * @returns {Object} All page configurations
   */
  window.getAllPageConfigs = function () {
    return PAGE_CONFIGS;
  };

  /**
   * Check if page requires specific system
   * @param {string} pageName - Page name
   * @param {string} system - System name (filters, validation, tables)
   * @returns {boolean} Whether page requires the system
   */
  window.pageRequiresSystem = function (pageName, system) {
    const config = window.getPageConfig(pageName);

    switch (system) {
      case 'filters':
        return config.requiresFilters;
      case 'validation':
        return config.requiresValidation;
      case 'tables':
        return config.requiresTables;
      default:
        return false;
    }
  };

  /**
   * Get page initialization summary
   * @param {string} pageName - Page name
   * @returns {Object} Initialization summary
   */
  window.getPageInitSummary = function (pageName) {
    const config = window.getPageConfig(pageName);

    return {
      name: config.name,
      systems: {
        filters: config.requiresFilters,
        validation: config.requiresValidation,
        tables: config.requiresTables,
      },
      customInitializers: config.customInitializers.length,
      totalSystems:
        (config.requiresFilters ? 1 : 0) +
        (config.requiresValidation ? 1 : 0) +
        (config.requiresTables ? 1 : 0) +
        config.customInitializers.length,
    };
  };

  // ===== GLOBAL EXPORT =====
  // REMOVED: PAGE_CONFIGS export - use page-initialization-configs.js instead
  // window.PAGE_CONFIGS = PAGE_CONFIGS;
  // window.PAGE_CONFIGS.__SOURCE = 'core-systems';
  // window.pageInitializationConfigs = PAGE_CONFIGS;
}
