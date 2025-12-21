/*
 * ==========================================
 * PACKAGE MANIFEST - Critical Loading Order
 * ==========================================
 *
 * 🚨 CRITICAL FIX: Loading Order Dependencies (2025-12-12)
 * --------------------------------------------------
 * The loading order was FIXED to resolve ReferenceError issues that caused
 * 95% of console errors across all pages.
 *
 * KEY FIX: auth package (loadOrder: 1.0) now loads BEFORE header package (loadOrder: 1.2)
 * This ensures window.TikTrackAuth.showLoginModal is available when header-system.js needs it.
 *
 * IMPACT: Reduced console errors from 3,863 to ~150 total across all pages.
 *
 * This file defines the PACKAGE MANIFEST structure.
 * 
 * MAIN STRUCTURE:
 * - PACKAGE_MANIFEST - Main manifest object with all packages
 * 
 * PACKAGE STRUCTURE:
 * Each package has:
 * - id: Package identifier
 * - name: Display name
 * - description: Package description
 * - version: Package version
 * - critical: Whether package is critical
 * - loadOrder: Loading order (1 = first, higher = later)
 * - dependencies: Array of package IDs this package depends on
 * - loadingStrategy: Script loading strategy ('defer', 'async', or 'sync')
 *   - 'defer': Load in parallel, execute after HTML parsing (maintains order) - RECOMMENDED for critical scripts
 *   - 'async': Load in parallel, execute immediately when ready (doesn't maintain order) - For non-critical scripts
 *   - 'sync': Load and execute synchronously (blocks parsing) - RARE, only for special cases
 * - scripts: Array of script objects
 *   - file: Script file path
 *   - globalCheck: Global variable to check for script availability
 *   - description: Script description
 *   - required: Whether script is required
 *   - loadOrder: Script loading order within package
 *   - loadingStrategy: Optional - Script-specific loading strategy (if not set, uses package loadingStrategy)
 * 
 * TOTAL PACKAGES: 25 (after removing advanced-notifications)
 * 
 * ==========================================
 */

/**
 * Package Manifest - TikTrack Initialization System
 * Central package manifest for dependency management and health checks
 *
 * ⚠️ IMPORTANT FOR DEVELOPERS:
 * ============================
 *
 * This file defines the PACKAGE STRUCTURE for the monitoring system.
 * When you add new scripts to pages, you MUST update this file to avoid monitoring errors.
 * 
 * **שינוי חשוב (דצמבר 2025):**
 * - `core-systems.js` הועבר מ-`base` package ל-`init-system` package
 * - `init-system` תלוי רק ב-`base` package (1 תלות במקום 25)
 * - `advanced-notifications` package הוסר (deprecated, ריק)
 * 
 * @fileoverview מניפסט מרכזי לכל החבילות במערכת
 * @version 1.6.0
 * @author TikTrack Development Team
 * @created October 2025
 * @updated December 2025 - Refactored initialization system
 * 
 * @see {@link documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md|Unified Initialization System Documentation}
 *
 * 🔧 COMPLETE WORKFLOW FOR ADDING NEW SCRIPTS:
 * ============================================
 *
 * STEP 1: Create the Script
 * -------------------------
 * // scripts/my-new-script.js
 * (function() {
 *     'use strict';
 *     
 *     function myNewFunction() {
 *         console.log('New script loaded!');
 *     }
 *     
 *     // IMPORTANT: Create Global for identification
 *     window.MyNewScript = {
 *         init: myNewFunction,
 *         version: '1.0.0'
 *     };
 *     
 *     console.log('✅ MyNewScript loaded successfully');
 * })();
 *
 * STEP 2: Update This File (Package Manifest)
 * -------------------------------------------
 * Add to appropriate package:
 * 'my-package': {
 *     id: 'my-package',
 *     name: 'My Package',
 *     loadingStrategy: 'defer', // defer (critical), async (non-critical), or sync (rare)
 *     scripts: [
 *         {
 *             file: 'my-new-script.js',
 *             globalCheck: 'window.MyNewScript', // IMPORTANT: Global for identification
 *             description: 'My new script',
 *             required: true,
 *             loadingStrategy: 'defer' // Optional - if not set, uses package loadingStrategy
 *         }
 *     ]
 * }
 *
 * STEP 3: Update Page Configuration
 * ---------------------------------
 * Update page-initialization-configs.js for the specific page:
 * 'my-page': {
 *     packages: ['base', 'my-package'],
 *     requiredGlobals: ['window.MyNewScript']
 * }
 *
 * STEP 4: Test the Integration
 * ----------------------------
 * 1. Load the page
 * 2. Check console for "✅ MyNewScript loaded successfully"
 * 3. Run monitoring system to verify no errors
 *
 * 📋 PACKAGE STRUCTURE (Updated December 2025):
 * ============================================
 *
 * 1. BASE (28+ scripts) - Required for all pages
 *    - Includes: Bootstrap JS, Floating UI (optional), core systems
 * 2. SERVICES (25+ scripts) - General services
 *    - Includes: UnifiedUIPositioningService (uses Floating UI with fallback)
 * 3. UI-ADVANCED (5 scripts) - Advanced interface
 * 4. CRUD (3 scripts) - Pages with tables
 * 5. PREFERENCES (15 scripts) - Preferences
 * 6. VALIDATION (1 script) - Validation
 * 7. EXTERNAL-DATA (3 scripts) - External data
 * 8. LOGS (3 scripts) - Logs
 * 9. CACHE (2 scripts) - Cache
 * 10. ENTITY-SERVICES (15+ scripts) - Entity services
 * 11. HELPER (5 scripts) - Helper
 * 12. MANAGEMENT (2 scripts) - Management
 * 13. INIT (8 scripts) - Initialization
 * 14. DASHBOARD-WIDGETS (8 scripts) - Dashboard widgets
 * 15. MODULES (25+ scripts) - Modules and modals
 *
 * @version 1.6.0
 * @created October 2025
 * @updated December 2025
 * @author TikTrack Development Team
 */

const PACKAGE_MANIFEST = {
  // 1. BASE PACKAGE - Required for all pages
  base: {
    id: 'base',
    name: 'Base Package',
    description: 'Core systems required for all pages',
    version: '1.5.0',
    critical: true,
    loadOrder: 1,
    dependencies: [],
    loadingStrategy: 'defer', // Critical package - must load first, defer ensures proper initialization order
    scripts: [
      {
        file: 'api-config.js',
        globalCheck: 'window.API_BASE_URL',
        description: 'Central API configuration',
        required: true,
        loadOrder: 0
      },
      {
        file: 'api-fetch-wrapper.js',
        globalCheck: 'window.APIFetchWrapper',
        description: 'Global fetch wrapper for Authorization injection and 401 handling',
        required: true,
        loadOrder: 0.5
      },
      {
        file: 'global-favicon.js',
        globalCheck: 'window.setFavicon',
        description: 'Favicon management',
        required: true,
        loadOrder: 1
      },
      // REMOVED: notification-system.js - May cause conflicts when bundled, loaded separately
      {
        file: 'cache-sync-manager.js',
        globalCheck: 'window.CacheSyncManager',
        description: 'Cache synchronization manager',
        required: true,
        loadOrder: 3
      },
      // REMOVED: ui-utils.js - May cause conflicts when bundled, loaded separately
      // REMOVED: warning-system.js - May cause conflicts when bundled, loaded separately
      {
        file: 'error-handlers.js',
        globalCheck: 'window.handleApiError',
        description: 'Error handling system',
        required: true,
        loadOrder: 6
      },
      {
        file: 'unified-cache-manager.js',
        globalCheck: 'window.UnifiedCacheManager',
        description: 'Unified cache manager',
        required: true,
        loadOrder: 7
      },
      {
        file: 'icon-mappings.js',
        globalCheck: 'window.IconMappings',
        description: 'Central icon mappings',
        required: true,
        loadOrder: 7.5
      },
      {
        file: 'icon-system.js',
        globalCheck: 'window.IconSystem',
        description: 'Central icon system',
        required: true,
        loadOrder: 7.6
      },
      {
        file: 'icon-replacement-helper.js',
        globalCheck: 'window.replaceIconsInContext',
        description: 'Icon replacement helper for standardizing icon usage',
        required: true,
        loadOrder: 7.7
      },
      {
        file: 'cache-clear-menu.js',
        globalCheck: 'window.CacheControlMenu',
        description: 'Cache clearing control (Stage B-Lite)',
        required: true,
        loadOrder: 8
      },
      {
        file: 'cache-ttl-guard.js',
        globalCheck: 'window.CacheTTLGuard',
        description: 'TTL guard for entity loaders',
        required: true,
        loadOrder: 9
      },
      // REMOVED: auth.js - Causes conflicts when bundled, loaded separately
      // REMOVED: auth-guard.js - Causes conflicts when bundled, loaded separately
      // REMOVED: logger-service.js - May cause conflicts when bundled, loaded separately
      // REMOVED: header-system.js - May cause conflicts when bundled, loaded separately
      {
        file: 'quick-quality-check.js',
        globalCheck: 'window.runQuickQualityCheck',
        description: 'Quick quality check for header button',
        required: false,
        loadOrder: 11.5
      },
      {
        file: 'page-state-manager.js',
        globalCheck: 'window.PageStateManager',
        description: 'Unified page state manager',
        required: true,
        loadOrder: 12
      },
      {
        file: 'page-utils.js',
        globalCheck: 'window.loadPageState',
        description: 'Page utilities',
        required: true,
        loadOrder: 13
      },
      {
        file: 'translation-utils.js',
        globalCheck: 'window.translateStatus',
        description: 'Translations',
        required: true,
        loadOrder: 14
      },
      {
        file: 'button-icons.js',
        globalCheck: 'window.BUTTON_ICONS',
        description: 'Icon and button system',
        required: true,
        loadOrder: 15
      },
      {
        file: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
        globalCheck: 'window.bootstrap',
        description: 'Bootstrap JS Bundle (Tooltips & Modals)',
        required: true,
        loadOrder: 16,
        external: true
      },
      {
        file: 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.0/dist/floating-ui.dom.min.js',
        globalCheck: 'window.computePosition',
        description: 'Floating UI DOM - Smart positioning library (for overlay/tooltip positioning)',
        required: false, // Optional - UnifiedUIPositioningService has fallback
        loadOrder: 16.5,
        external: true
      },
      {
        file: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
        globalCheck: 'window.gsap',
        description: 'GSAP - GreenSock Animation Platform (for smooth animations)',
        required: false, // Optional - UnifiedUIPositioningService has CSS transitions fallback
        loadOrder: 16.6,
        external: true
      },
      // REMOVED: event-handler-manager.js - May cause conflicts when bundled, loaded separately
      {
        file: 'button-system-init.js',
        globalCheck: 'window.ButtonSystem',
        description: 'Button system',
        required: true,
        loadOrder: 18
      },
      {
        file: 'color-scheme-system.js',
        globalCheck: 'window.loadDynamicColors',
        description: 'Dynamic color system',
        required: true,
        loadOrder: 19
      },
      {
        file: 'debug-modal-z-index.js',
        globalCheck: 'window.debugModalZIndex',
        description: 'Debug tool for checking modal z-index layers',
        required: false,
        loadOrder: 20
      },
      // core-systems.js moved to init-system package
      // {
      //   file: 'modules/core-systems.js',
      //   globalCheck: 'window.UnifiedAppInitializer',
      //   description: 'Unified initialization system - single entry point (required for all pages)',
      //   required: true,
      //   loadOrder: 21
      // }
    ],
    estimatedSize: '~280KB',
    initTime: '~150ms'
  },

  // 1.1. CORE UI PACKAGE - Core UI systems (loaded separately to avoid bundle conflicts)
  'core-ui': {
    id: 'core-ui',
    name: 'Core UI Package',
    description: 'Core UI systems loaded separately to avoid bundle conflicts',
    version: '1.5.0',
    critical: true,
    loadOrder: 1.1,
    dependencies: ['base'],
    loadingStrategy: 'defer',
    files: [
      'notification-system.js',
      'ui-utils.js',
      'warning-system.js',
      'logger-service.js',
      'event-handler-manager.js'
    ],
    scripts: [
      {
        file: 'notification-system.js',
        globalCheck: 'window.NotificationSystem',
        description: 'Notification system',
        required: true,
        loadOrder: 1
      },
      {
        file: 'ui-utils.js',
        globalCheck: 'window.toggleSection',
        description: 'UI utilities',
        required: true,
        loadOrder: 2
      },
      {
        file: 'warning-system.js',
        globalCheck: 'window.WarningSystem',
        description: 'Warning system',
        required: true,
        loadOrder: 3
      },
      {
        file: 'logger-service.js',
        globalCheck: 'window.Logger',
        description: 'Advanced logging service',
        required: true,
        loadOrder: 4
      },
      {
        file: 'event-handler-manager.js',
        globalCheck: 'window.EventHandlerManager',
        description: 'Central event management system',
        required: true,
        loadOrder: 5
      }
    ],
    estimatedSize: '~120KB',
    initTime: '~70ms'
  },

  // 1.2. HEADER PACKAGE - Header system (loaded separately to avoid conflicts)
  header: {
    id: 'header',
    name: 'Header Package',
    description: 'Header and filter systems loaded separately to avoid bundle conflicts',
    version: '1.5.0',
    critical: true,
    loadOrder: 1.2,
    dependencies: ['base'],
    loadingStrategy: 'defer',
    files: [
      'header-system.js'
    ],
    scripts: [
      {
        file: 'header-system.js',
        globalCheck: 'window.HeaderSystem',
        description: 'Header system',
        required: true,
        loadOrder: 1
      }
    ],
    estimatedSize: '~50KB',
    initTime: '~30ms'
  },

  // 1.5. AUTH PACKAGE - Authentication (loaded separately to avoid conflicts)
  // 🔴 CRITICAL: AUTH PACKAGE - Must load FIRST (loadOrder: 1.0)
  // 📋 Dependencies: Required by header-system.js (window.TikTrackAuth.showLoginModal)
  // 📅 Updated: 2025-12-12 - Changed loadOrder from 1.5 to 1.0 to fix ReferenceError issues
  // 🎯 Impact: Resolved 95% of console errors across all pages
  auth: {
    id: 'auth',
    name: 'Authentication Package',
    description: 'Authentication systems loaded FIRST to provide dependencies for other packages',
    version: '1.5.0',
    critical: true,
    loadOrder: 1.0,
    dependencies: ['base'],
    loadingStrategy: 'defer',
    files: [
      'auth.js',
      'auth-guard.js'
    ],
    scripts: [
      {
        file: 'auth.js',
        globalCheck: 'window.TikTrackAuth',
        description: 'Authentication system',
        required: true,
        loadOrder: 1
      },
      {
        file: 'auth-guard.js',
        globalCheck: 'window.AuthGuard',
        description: 'Page protection - authentication guard',
        required: true,
        loadOrder: 2
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~80ms'
  },

  // 2. SERVICES PACKAGE - General services
  services: {
    id: 'services',
    name: 'Services Package',
    description: 'General services',
    version: '1.5.0',
    critical: false,
    loadOrder: 2,
    dependencies: ['base'],
    loadingStrategy: 'defer', // Critical package - required for most pages, has dependencies on base
    scripts: [
      {
        file: 'services/data-collection-service.js',
        globalCheck: 'window.DataCollectionService',
        description: 'Data collection service',
        required: true,
        loadOrder: 1
      },
      {
        file: 'services/date-range-picker-service.js',
        globalCheck: 'window.DateRangePickerService',
        description: 'Date range picker service with preset options and calendar UI',
        required: false,
        loadOrder: 1.5
      },
      {
        file: 'services/field-renderer-service.js',
        globalCheck: 'window.FieldRendererService',
        description: 'Field rendering service',
        required: true,
        loadOrder: 2
      },
      {
        file: 'services/select-populator-service.js',
        globalCheck: 'window.SelectPopulatorService',
        description: 'Select box population service',
        required: true,
        loadOrder: 3
      },
      {
        file: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        globalCheck: 'window.jspdf',
        description: 'jsPDF library (for AI analysis PDF export)',
        required: true, // Required for ai-analysis-data.js exportToPDF function
        loadOrder: 3.5
      },
      {
        file: 'services/ai-analysis-data.js',
        globalCheck: 'window.AIAnalysisData',
        description: 'AI Analysis data service',
        required: true,
        loadOrder: 4
      },
      {
        file: 'services/statistics-calculator.js',
        globalCheck: 'window.StatisticsCalculator',
        description: 'Statistics calculator',
        required: true,
        loadOrder: 4
      },
      {
        file: 'services/default-value-setter.js',
        globalCheck: 'window.DefaultValueSetter',
        description: 'Default value service',
        required: true,
        loadOrder: 5
      },
      {
        file: 'services/preferences-data.js',
        globalCheck: 'window.PreferencesData',
        description: 'Preferences data service (API + Cache)',
        required: true,
        loadOrder: 5.1
      },
      {
        file: 'services/executions-data.js',
        globalCheck: 'window.ExecutionsData',
        description: 'Executions data service (API + Cache + CRUD)',
        required: false, // Required only for executions page, not all pages
        loadOrder: 5.2
      },
      {
        file: 'services/crud-response-handler.js',
        globalCheck: 'window.CrudResponseHandler',
        description: 'CRUD response handler',
        required: true,
        loadOrder: 6
      },
      {
        file: 'services/unified-crud-service.js',
        globalCheck: 'window.UnifiedCRUDService',
        description: 'Unified CRUD service for all entities',
        required: true,
        loadOrder: 6.5
      },
      {
        file: 'services/research-data.js',
        globalCheck: 'window.ResearchData',
        description: 'Research data service',
        required: false,
        loadOrder: 6.6
      },
      {
        file: 'services/investment-calculation-service.js',
        globalCheck: 'window.InvestmentCalculationService',
        description: 'Investment form amount ↔ quantity calculations',
        required: true,
        loadOrder: 7
      },
      {
        file: 'services/unified-progress-manager.js',
        globalCheck: 'window.UnifiedProgressManager',
        description: 'Unified progress manager for process tracking',
        required: true,
        loadOrder: 5.5
      },
      {
        file: 'services/tag-service.js',
        globalCheck: 'window.TagService',
        description: 'Central tag service (tag management and retrieval)',
        required: true,
        loadOrder: 8
      },
      {
        file: 'services/autocomplete-service.js',
        globalCheck: 'window.AutocompleteService',
        description: 'General autocomplete service for reusable suggestions dropdown',
        required: false,
        loadOrder: 8.1
      },
      {
        file: 'services/widget-z-index-manager.js',
        globalCheck: 'window.WidgetZIndexManager',
        description: 'Central z-index manager for widget overlays',
        required: false,
        loadOrder: 8.1
      },
      {
        file: 'services/unified-ui-positioning-service.js',
        globalCheck: 'window.UnifiedUIPositioning',
        description: 'Unified UI positioning service using Floating UI (with fallback)',
        required: false,
        loadOrder: 8.15
      },
      {
        file: 'services/widget-overlay-service.js',
        globalCheck: 'window.WidgetOverlayService',
        description: 'Central widget overlay service for hover details',
        required: false,
        loadOrder: 8.2
      },
      {
        file: 'services/widget-overlay-debugger.js',
        globalCheck: 'window.WidgetOverlayDebugger',
        description: 'Visual debugging tool for widget overlay positioning issues',
        required: false,
        loadOrder: 8.3
      },
      {
        file: 'services/table-sort-value-adapter.js',
        globalCheck: 'window.TableSortValueAdapter',
        description: 'Adapter for unified sort values (DateEnvelope, legacy)',
        required: true,
        loadOrder: 9
      },
      {
        file: 'services/lint-status-service.js',
        globalCheck: 'window.LintStatusService',
        description: 'Unified linter status service (API reading and data conversion)',
        required: true,
        loadOrder: 10
      },
      {
        file: 'services/alert-condition-renderer.js',
        globalCheck: 'window.AlertConditionRenderer',
        description: 'Alert condition renderer',
        required: false,
        loadOrder: 11
      },
      {
        file: 'https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js',
        globalCheck: 'window.Quill',
        description: 'Quill.js - Rich Text Editor Library',
        required: true,
        loadOrder: 12,
        external: true
      },
      {
        file: 'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js',
        globalCheck: 'window.DOMPurify',
        description: 'DOMPurify - HTML Sanitizer',
        required: true,
        loadOrder: 13,
        external: true
      },
      {
        file: 'services/rich-text-editor-service.js',
        globalCheck: 'window.RichTextEditorService',
        description: 'Rich text editor service',
        required: true,
        loadOrder: 14
      },
      {
        file: 'services/pending-actions-cache-service.js',
        globalCheck: 'window.PendingActionsCacheService',
        description: 'Pending actions cache service (dismissed items management)',
        required: false,
        loadOrder: 15
      },
      {
        file: 'services/execution-clustering-service.js',
        globalCheck: 'window.ExecutionClusteringService',
        description: 'Execution clustering service (trade creation clusters)',
        required: false,
        loadOrder: 16
      },
      {
        file: 'services/execution-assignment-service.js',
        globalCheck: 'window.ExecutionAssignmentService',
        description: 'Execution assignment service (highlights/suggestions)',
        required: false,
        loadOrder: 17
      },
      {
        file: 'services/trade-plan-assignment-service.js',
        globalCheck: 'window.TradePlanAssignmentService',
        description: 'Trade plan assignment service (assignments and creations)',
        required: false,
        loadOrder: 18
      },
      {
        file: 'services/execution-cluster-helpers.js',
        globalCheck: 'window.ExecutionClusterHelpers',
        description: 'Execution cluster helper functions (rendering, actions, calculations)',
        required: false,
        loadOrder: 19
      },
      {
        file: 'services/modal-helper-service.js',
        globalCheck: 'window.ModalHelperService',
        description: 'Modal helper service - provides showModalSafe function globally',
        required: true,  // Required for all pages with modal functionality
        loadOrder: 20
      }
    ],
    estimatedSize: '~180KB',
    initTime: '~100ms'
  },

  // 3. UI-ADVANCED PACKAGE - Advanced interface
  'ui-advanced': {
    id: 'ui-advanced',
    name: 'UI Advanced Package',
    description: 'Advanced user interface',
    version: '1.5.0',
    critical: false,
    loadOrder: 3,
    dependencies: ['base', 'services', 'modules'],
    loadingStrategy: 'defer', // Critical package - tables and advanced UI, has dependencies on modules
    scripts: [
      {
        file: 'table-mappings.js',
        globalCheck: 'window.TABLE_COLUMN_MAPPINGS',
        description: 'Table mappings (optional - only for pages with tables)',
        required: false, // Optional - not needed for dashboard/index page
        loadOrder: 0
      },
      {
        file: 'tables.js',
        globalCheck: 'window.sortTableData',
        description: 'Table system',
        required: true,
        loadOrder: 1
      },
      {
        file: 'table-data-registry.js',
        globalCheck: 'window.TableDataRegistry',
        description: 'Table data registry',
        required: true,
        loadOrder: 2
      },
      {
        file: 'pagination-system.js',
        globalCheck: 'window.PaginationSystem',
        description: 'Pagination system',
        required: true,
        loadOrder: 3
      },
      {
        file: 'modules/actions-menu-system.js',
        globalCheck: 'window.ActionsMenuSystem',
        description: 'Actions menu system',
        required: true,
        loadOrder: 4
      }
    ],
    estimatedSize: '~80KB',
    initTime: '~50ms'
  },

  // 2.5. MODULES PACKAGE - Modules (loads before ui-advanced because tables.js uses ModalManagerV2)
  modules: {
    id: 'modules',
    name: 'Modules Package',
    description: 'General modules',
    version: '1.5.0',
    critical: false,
    loadOrder: 2.5,
    dependencies: ['base', 'services'],
    loadingStrategy: 'defer', // Defer to maintain dependency order with base package
    // initializationGuard: 'window.__BUNDLE_INITIALIZED_BASE && window.showModalSafe', // Temporarily disabled for testing
    scripts: [
      {
        file: 'modal-navigation-manager.js',
        globalCheck: 'window.modalNavigationManager',
        description: 'Nested modal navigation system',
        required: true,
        loadOrder: 1
      },
      {
        file: 'modal-z-index-manager.js',
        globalCheck: 'window.ModalZIndexManager',
        description: 'Dynamic z-index management for nested modals',
        required: true,
        loadOrder: 1.5
      },
      {
        file: 'modal-z-index-monitor.js',
        globalCheck: 'window.modalZIndexMonitor',
        description: 'Z-index monitoring tool for nested modals',
        required: false,
        loadOrder: 1.6
      },
      {
        file: 'modal-backdrop-monitor.js',
        globalCheck: 'window.modalBackdropMonitor',
        description: 'Backdrop monitoring tool for nested modals',
        required: false,
        loadOrder: 1.7
      },
      {
        file: 'modal-stack-monitor.js',
        globalCheck: 'window.modalStackMonitor',
        description: 'Stack monitoring tool for nested modals',
        required: false,
        loadOrder: 1.8
      },
      {
        file: 'modal-quantum-system-tests.js',
        globalCheck: 'window.modalQuantumSystemTests',
        description: 'Automated tests for modal quantum system',
        required: false,
        loadOrder: 1.9
      },
      {
        file: 'tag-ui-manager.js',
        globalCheck: 'window.TagUIManager',
        description: 'Tag selection management in modals',
        required: true,
        loadOrder: 2
      },
      {
        file: 'tag-events.js',
        globalCheck: 'window.TagEvents',
        description: 'Global tag events system',
        required: true,
        loadOrder: 3
      },
      {
        file: 'modules/data-basic.js',
        globalCheck: 'window.DataBasic',
        description: 'Basic data',
        required: true,
        loadOrder: 4
      },
      {
        file: 'modules/ui-basic.js',
        globalCheck: 'window.UIBasic',
        description: 'Basic interface',
        required: true,
        loadOrder: 5
      },
      {
        file: 'modules/data-advanced.js',
        globalCheck: 'window.DataAdvanced',
        description: 'Advanced data',
        required: true,
        loadOrder: 6
      },
      {
        file: 'modules/ui-advanced.js',
        globalCheck: 'window.UIAdvanced',
        description: 'Advanced interface',
        required: true,
        loadOrder: 7,
        exports: ['window.loadUserPreferences'] // Explicitly document that this script exports loadUserPreferences
      },
      {
        file: 'modules/communication-module.js',
        globalCheck: 'window.CommunicationModule',
        description: 'Communication module',
        required: true,
        loadOrder: 8
      },
      {
        file: 'modules/business-module.js',
        globalCheck: 'window.BusinessModule',
        description: 'Business module',
        required: true,
        loadOrder: 9
      },
      {
        file: 'modules/localstorage-sync.js',
        globalCheck: 'window.LocalStorageSync',
        description: 'localStorage synchronization',
        required: true,
        loadOrder: 10
      },
      {
        file: 'modules/dynamic-loader-config.js',
        globalCheck: 'window.DynamicLoaderConfig',
        description: 'Dynamic loader configuration',
        required: true,
        loadOrder: 11
      },
      {
        file: 'import-user-data.js',
        globalCheck: 'window.openImportUserDataModal',
        description: 'Execution data import modal',
        required: true,
        loadOrder: 12
      },
      // ⚠️ CRITICAL: All modal configs MUST load BEFORE modal-manager-v2.js
      // ModalManagerV2 needs these configs to be available when it initializes
      {
        file: 'modal-configs/trading-accounts-config.js',
        globalCheck: 'window.tradingAccountsModalConfig',
        description: 'Trading accounts modal configuration',
        required: false,
        loadOrder: 13
      },
      {
        file: 'modal-configs/alerts-config.js',
        globalCheck: 'window.alertsModalConfig',
        description: 'Alerts modal configuration',
        required: false,
        loadOrder: 14
      },
      {
        file: 'modal-configs/trades-config.js',
        globalCheck: 'window.tradesModalConfig',
        description: 'Trades modal configuration',
        required: true,
        loadOrder: 15
      },
      {
        file: 'modal-configs/executions-config.js',
        globalCheck: 'window.executionsModalConfig',
        description: 'Executions modal configuration (specific to executions page)',
        required: false,
        loadOrder: 16
      },
      {
        file: 'modal-configs/trade-plans-config.js',
        globalCheck: 'window.tradePlansModalConfig',
        description: 'Trade plans modal configuration',
        required: true,
        loadOrder: 17
      },
      {
        file: 'modal-configs/tickers-config.js',
        globalCheck: 'window.tickersModalConfig',
        description: 'Tickers modal configuration',
        required: false,
        loadOrder: 18
      },
      {
        file: 'modal-configs/watch-lists-config.js',
        globalCheck: 'window.watchListModalConfig',
        description: 'Watch lists modal configuration',
        required: true,
        loadOrder: 19
      },
      {
        file: 'modal-configs/cash-flows-config.js',
        globalCheck: 'window.cashFlowModalConfig',
        description: 'Cash flows modal configuration',
        required: true, // Required for cash_flows page
        loadOrder: 19
      },
      {
        file: 'modal-configs/notes-config.js',
        globalCheck: 'window.notesModalConfig',
        description: 'Notes modal configuration',
        required: false, // Not required for tag-management page. Required for ai-analysis page (loaded via ai-analysis package)
        loadOrder: 20
      },
      {
        file: 'modal-configs/tag-management-config.js',
        globalCheck: 'window.tagModalConfig',
        description: 'Tag system modal configuration',
        required: true,
        loadOrder: 21
      },
      {
        file: 'trade-selector-modal.js',
        globalCheck: 'window.tradeSelectorModal',
        description: 'Trade selector modal',
        required: false,
        loadOrder: 22
      },
      // ⚠️ CRITICAL: Additional modal configs from other packages
      // These must load before modal-manager-v2.js
      {
        file: 'modal-configs/conditions-config.js',
        globalCheck: 'window.conditionsModalConfig',
        description: 'Condition modal configuration (from conditions package)',
        required: false, // Only required for pages with conditions package
        loadOrder: 23
      },
      {
        file: 'modal-configs/tag-search-config.js',
        globalCheck: 'window.tagSearchDrawerConfig',
        description: 'Tag search drawer configuration (from dashboard package)',
        required: false, // Only required for pages with dashboard package
        loadOrder: 24
      },
      // ⚠️ CRITICAL: modal-manager-v2.js MUST load AFTER all modal configs
      // It needs all configs to be available when it initializes
      {
        file: 'modal-manager-v2.js',
        globalCheck: 'window.ModalManagerV2',
        description: 'Modal manager V2 - MUST load after all modal configs',
        required: true,
        loadOrder: 25
      }
    ],
    estimatedSize: '~250KB',
    initTime: '~140ms'
  },

  // 4. CRUD PACKAGE - Pages with tables
  crud: {
    id: 'crud',
    name: 'CRUD Operations Package',
    description: 'Data and table management systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 4,
    dependencies: ['base', 'services'],
    loadingStrategy: 'defer', // Critical package - CRUD operations, has dependencies on base and services
    scripts: [
      {
        file: 'date-utils.js',
        globalCheck: 'window.formatDate',
        description: 'Date utilities',
        required: true,
        loadOrder: 1
      },
      {
        file: 'data-utils.js',
        globalCheck: 'window.isNumeric',
        description: 'General data utilities',
        required: true,
        loadOrder: 2
      },
      {
        file: 'unified-table-system.js',
        globalCheck: 'window.UnifiedTableSystem',
        description: 'Unified central table system',
        required: true,
        loadOrder: 3
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~80ms'
  },

  // 5.2. TAG MANAGEMENT PAGE PACKAGE - Tag management
  'tag-management': {
    id: 'tag-management',
    name: 'Tag Management Page Package',
    description: 'Dedicated logic for tag management page',
    version: '1.0.0',
    critical: false,
    loadOrder: 5.2,
    dependencies: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences'],
    loadingStrategy: 'defer', // Critical package - tag management, has dependencies on multiple packages
    scripts: [
      {
        file: 'tag-management-page.js',
        globalCheck: 'window.TagManagementPage',
        description: 'Tag management page display management',
        required: true,
        loadOrder: 1
      }
    ],
    estimatedSize: '~45KB',
    initTime: '~35ms'
  },

  // 5. PREFERENCES PACKAGE - Preferences
  preferences: {
    id: 'preferences',
    name: 'Preferences Package',
    description: 'User preferences system v2.0 (10 files)',
    version: '1.5.0',
    critical: false,
    loadOrder: 5,
    dependencies: ['base', 'services'], // Added 'services' dependency for preferences-data.js
    loadingStrategy: 'defer', // Critical package - preferences system, has dependencies on base and services
    scripts: [
      {
        file: 'preferences-cache.js',
        globalCheck: 'window.PreferencesCache',
        description: 'Preferences cache management layer',
        required: true,
        loadOrder: 0
      },
      {
        file: 'preferences-events.js',
        globalCheck: 'window.PreferencesEvents',
        description: 'Preferences event system',
        required: true,
        loadOrder: 1
      },
      {
        file: 'preferences-ui-layer.js',
        globalCheck: 'window.PreferencesUILayer',
        description: 'Preferences UI layer',
        required: true,
        loadOrder: 2
      },
      {
        file: 'preferences-manager.js',
        globalCheck: 'window.PreferencesManager',
        description: 'Preferences manager (central)',
        required: true,
        loadOrder: 3
      },
      {
        file: 'services/preferences-v4.js',
        globalCheck: 'window.PreferencesV4',
        description: 'Preferences V4 SDK (group-first)',
        required: true,
        loadOrder: 0.5  // Must load before preferences-core-new.js
      },
      {
        file: 'preferences-core-new.js',
        globalCheck: 'window.PreferencesCore',
        description: 'Preferences core (without colors)',
        required: true,
        loadOrder: 1
      },
      {
        file: 'preferences-colors.js',
        globalCheck: 'window.ColorManager',
        description: 'Color system (60+ preferences)',
        required: true,
        loadOrder: 2
      },
      {
        file: 'preferences-profiles.js',
        globalCheck: 'window.ProfileManager',
        description: 'Profile management',
        required: true,
        loadOrder: 3
      },
      {
        file: 'preferences-lazy-loader.js',
        globalCheck: 'window.LazyLoader',
        description: 'lazy loading system',
        required: true,
        loadOrder: 4
      },
      {
        file: 'preferences-validation.js',
        globalCheck: 'window.PreferenceValidator',
        description: 'validation system',
        required: true,
        loadOrder: 5
      },
      {
        file: 'preferences-ui-v4.js',
        globalCheck: 'window.PreferencesUIV4',
        description: 'User interface V4 (Group-First)',
        required: true,
        loadOrder: 5.5  // Must load before preferences-ui.js and preferences-group-manager.js
      },
      {
        file: 'preferences-ui.js',
        globalCheck: 'window.PreferencesUI',
        description: 'User interface',
        required: true,
        loadOrder: 6
      },
      {
        file: 'preferences-page.js',
        globalCheck: 'window.loadAccountsForPreferences',
        description: 'Preferences page specific functions',
        required: false,
        loadOrder: 7
      },
      {
        file: 'preferences-debug-monitor.js',
        globalCheck: 'window.PreferencesDebugMonitor',
        description: 'Monitoring and debugging code for preferences issues',
        required: false,
        loadOrder: 7.1
      },
      {
        file: 'preferences-group-manager.js',
        globalCheck: 'window.PreferencesGroupManager',
        description: 'Preferences group manager',
        required: true,
        loadOrder: 8
      },
      {
        file: 'testing/automated/preferences-browser-test.js',
        globalCheck: 'window.runAllPreferenceTests',
        description: 'Automated browser test suite for preferences',
        required: false,
        loadOrder: 9
      }
    ],
    estimatedSize: '~170KB',
    initTime: '~95ms'
  },

  // 2.4. VALIDATION PACKAGE - Validation (must load before modules/ui-basic.js)
  validation: {
    id: 'validation',
    name: 'Validation Package',
    description: 'Validation systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 2.4, // Must load before modules (2.5) because ui-basic.js uses validation functions
    dependencies: ['base'],
    loadingStrategy: 'defer', // Critical package - validation system, has dependencies on base
    scripts: [
      {
        file: 'validation-utils.js',
        globalCheck: 'window.validateSelectField',
        description: 'Validation utilities',
        required: true
      }
    ],
    estimatedSize: '~15KB',
    initTime: '~10ms'
  },

  // 6.5. CONDITIONS PACKAGE - Conditions
  conditions: {
    id: 'conditions',
    name: 'Conditions Package',
    description: 'Condition systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 6.5,
    dependencies: ['base', 'validation'],
    loadingStrategy: 'defer', // Critical package - conditions system, has dependencies on base and validation
    scripts: [
      {
        file: 'conditions/conditions-translations.js',
        globalCheck: 'window.conditionsTranslations',
        description: 'Condition translations',
        required: true,
        loadOrder: 1
      },
      {
        file: 'conditions/conditions-validator.js',
        globalCheck: 'window.conditionsValidator',
        description: 'Condition validator',
        required: true,
        loadOrder: 2
      },
      {
        file: 'conditions/conditions-form-generator.js',
        globalCheck: 'window.conditionsFormGenerator',
        description: 'Condition form generator',
        required: true,
        loadOrder: 3
      },
      {
        file: 'conditions/conditions-crud-manager.js',
        globalCheck: 'window.conditionsCRUDManager',
        description: 'Condition CRUD manager',
        required: true,
        loadOrder: 4
      },
      {
        file: 'conditions/conditions-initializer.js',
        globalCheck: 'window.conditionsInitializer',
        description: 'Condition initializer',
        required: true,
        loadOrder: 5
      },
      // ⚠️ NOTE: conditions-config.js moved to modules package (loadOrder: 23)
      // It must load before modal-manager-v2.js which is in modules package
      {
        file: 'conditions/conditions-ui-manager.js',
        globalCheck: 'window.ConditionsUIManager',
        description: 'Condition UI manager',
        required: true,
        loadOrder: 7
      },
      {
        file: 'conditions/conditions-modal-controller.js',
        globalCheck: 'window.ConditionsModalController',
        description: 'Condition modal controller',
        required: true,
        loadOrder: 8
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~80ms'
  },

  // 7. EXTERNAL-DATA PACKAGE - External data
  'external-data': {
    id: 'external-data',
    name: 'External Data Package',
    description: 'External data systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 7,
    dependencies: ['base', 'services'],
    loadingStrategy: 'async', // Non-critical - only for external data dashboard page
    scripts: [
      {
        file: 'yahoo-finance-service.js',
        globalCheck: 'window.YahooFinanceService',
        description: 'Yahoo Finance service',
        required: true
      },
      {
        file: 'external-data-service.js',
        globalCheck: 'window.ExternalDataService',
        description: 'External data service',
        required: true
      },
      {
        file: 'external-data-settings-service.js',
        globalCheck: 'window.ExternalDataSettingsService',
        description: 'External data settings',
        required: true
      }
    ],
    estimatedSize: '~200KB',
    initTime: '~120ms'
  },

  // 8. CHARTS PACKAGE - Charts
  charts: {
    id: 'charts',
    name: 'Charts Package',
    description: 'Chart and graph systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 8,
    dependencies: ['base', 'services'],
    loadingStrategy: 'async', // Non-critical - only for pages with charts
    scripts: [
      {
        file: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
        globalCheck: 'window.Chart',
        description: 'Chart.js library (CDN)',
        required: true,
        loadOrder: 0,
        external: true
      },
      {
        file: 'charts/chart-theme.js',
        globalCheck: 'window.ChartTheme',
        description: 'Chart theme',
        required: true,
        loadOrder: 1
      },
      {
        file: 'charts/chart-system.js',
        globalCheck: 'window.ChartSystem',
        description: 'Chart system',
        required: true,
        loadOrder: 2
      },
      {
        file: 'charts/chart-loader.js',
        globalCheck: 'window.ChartLoader',
        description: 'Chart loader',
        required: true,
        loadOrder: 3
      },
      {
        file: 'charts/chart-export.js',
        globalCheck: 'window.ChartExport',
        description: 'Chart export',
        required: true,
        loadOrder: 4
      },
      {
        file: 'charts/adapters/performance-adapter.js',
        globalCheck: 'window.PerformanceAdapter',
        description: 'Performance adapter',
        required: true,
        loadOrder: 5
      },
      {
        file: 'charts/adapters/trades-adapter.js',
        globalCheck: 'window.TradesAdapter',
        description: 'Trades adapter',
        required: true,
        loadOrder: 6
      }
    ],
    estimatedSize: '~300KB',
    initTime: '~150ms'
  },

  // 9. LOGS PACKAGE - Logs
  logs: {
    id: 'logs',
    name: 'Logs Package',
    description: 'Log systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 9,
    dependencies: ['base', 'services'],
    loadingStrategy: 'async', // Non-critical - only for log pages
    scripts: [
      {
        file: 'unified-log-api.js',
        globalCheck: 'window.UnifiedLogAPI',
        description: 'Unified log API',
        required: true,
        loadOrder: 1
      },
      {
        file: 'unified-log-manager.js',
        globalCheck: 'window.UnifiedLogManager',
        description: 'Unified log manager',
        required: true,
        loadOrder: 2
      },
      {
        file: 'unified-log-display.js',
        globalCheck: 'window.UnifiedLogDisplay',
        description: 'Unified log display',
        required: true,
        loadOrder: 3
      }
    ],
    estimatedSize: '~80KB',
    initTime: '~50ms'
  },

  // 9. CACHE PACKAGE - Cache
  cache: {
    id: 'cache',
    name: 'Cache Package',
    description: 'Cache systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 9.5, // Changed from 9 to 9.5 to differentiate from logs (9)
    dependencies: ['base', 'services'],
    loadingStrategy: 'defer', // Critical package - cache system, has dependencies on base and services
    scripts: [
      {
        file: 'cache-policy-manager.js',
        globalCheck: 'window.CachePolicyManager',
        description: 'Cache policy manager',
        required: true,
        loadOrder: 1
      },
      {
        file: 'cache-management.js',
        globalCheck: 'window.cacheManagementPage',
        description: 'Cache management',
        required: true,
        loadOrder: 2
      }
    ],
    estimatedSize: '~40KB',
    initTime: '~25ms'
  },

  // 10. ENTITY-SERVICES PACKAGE - Entity services
  'entity-services': {
    id: 'entity-services',
    name: 'Entity Services Package',
    description: 'Entity services',
    version: '1.5.0',
    critical: false,
    loadOrder: 8, // Changed from 10 to 8 to load before TradingView Charts (19) - fixes loading order issue
    dependencies: ['base', 'services'],
    loadingStrategy: 'defer', // Critical package - entity services, has dependencies on base and services
    scripts: [
      {
        file: 'services/trades-data.js',
        globalCheck: 'window.TradesData',
        description: 'Trades data service (CRUD + Cache)',
        required: false,  // Required only for trades page, not all pages
        loadOrder: 0
      },
      {
        file: 'services/trade-history-data.js',
        globalCheck: 'window.TradeHistoryData',
        description: 'Trade history data service',
        required: false,  // Required only for trade-history-page
        loadOrder: 8
      },
      {
        file: 'services/portfolio-state-data.js',
        globalCheck: 'window.PortfolioStateData',
        description: 'Portfolio state data service',
        required: false,  // Required only for portfolio-state
        loadOrder: 8.5
      },
      {
        file: 'services/trading-journal-data.js',
        globalCheck: 'window.TradingJournalData',
        description: 'Trading journal data service',
        required: false,  // Required only for trading-journal-page
        loadOrder: 9
      },
      {
        file: 'trade-history-page.js',
        globalCheck: 'window.tradeHistoryPage',
        description: 'Trade history page script (page-specific)',
        required: false,  // Required only for trade-history page
        loadOrder: 10
      },
      {
        file: 'calendar/calendar-date-utils.js',
        globalCheck: 'window.CalendarDateUtils',
        description: 'Calendar date utilities for trading journal',
        required: false,  // Required only for trading-journal-page
        loadOrder: 10.5
      },
      {
        file: 'account-service.js',
        globalCheck: 'window.getAccounts',
        description: 'Account service',
        required: true,
        loadOrder: 1
      },
      {
        file: 'alert-service.js',
        globalCheck: 'window.getAlertState',
        description: 'Alert service',
        required: true,
        loadOrder: 3
      },
      {
        file: 'ticker-service.js',
        globalCheck: 'window.tickerService',
        description: 'Ticker service',
        required: true,
        loadOrder: 4
      },
      {
        file: 'services/trade-plans-data.js',
        globalCheck: 'window.TradePlansData',
        description: 'Trade plans data service',
        required: true,  // Required for trade-plan-service.js
        loadOrder: 4.5  // Load BEFORE trade-plan-service.js
      },
      {
        file: 'trade-plan-service.js',
        globalCheck: 'window.getTradePlans',
        description: 'Trade plan service',
        required: true,
        loadOrder: 5  // Load AFTER trade-plans-data.js
      },
      {
        file: 'services/notes-data.js',
        globalCheck: 'window.NotesData',
        description: 'Notes data service',
        required: false,
        loadOrder: 6.5
      },
      {
        file: 'services/alerts-data.js',
        globalCheck: 'window.AlertsData',
        description: 'Alerts data service',
        required: false,
        loadOrder: 6.6
      },
      {
        file: 'services/tickers-data.js',
        globalCheck: 'window.TickersData',
        description: 'Tickers data service',
        required: false,
        loadOrder: 6.7
      },
      {
        file: 'services/trading-accounts-data.js',
        globalCheck: 'window.TradingAccountsData',
        description: 'Trading accounts data service',
        required: false,
        loadOrder: 6.8
      },
      {
        file: 'services/cash-flows-data.js',
        globalCheck: 'window.CashFlowsData',
        description: 'Cash flows data service',
        required: false,
        loadOrder: 6.9
      },
      {
        file: 'services/trade-history-data.js',
        globalCheck: 'window.TradeHistoryData',
        description: 'Trade history data service',
        required: false,
        loadOrder: 7
      },
      {
        file: 'services/portfolio-state-data.js',
        globalCheck: 'window.PortfolioStateData',
        description: 'Portfolio state data service',
        required: false,
        loadOrder: 7.5
      },
      {
        file: 'services/trading-journal-data.js',
        globalCheck: 'window.TradingJournalData',
        description: 'Trading journal data service',
        required: false,
        loadOrder: 8
      },
      {
        file: 'condition-translator.js',
        globalCheck: 'window.conditionTranslator',
        description: 'Condition translator',
        required: true,
        loadOrder: 9
      },
      {
        file: 'constraints.js',
        globalCheck: 'window.toggleLayer',
        description: 'Constraints system',
        required: true,
        loadOrder: 10
      },
      {
        file: 'services/linked-items-service.js',
        globalCheck: 'window.LinkedItemsService',
        description: 'Shared logic service for linked items',
        required: true,
        loadOrder: 11
      },
      {
        file: 'linked-items.js',
        globalCheck: 'window.viewLinkedItems',
        description: 'Linked items',
        required: true,
        loadOrder: 12
      },
      {
        file: 'account-activity.js',
        globalCheck: 'window.initAccountActivity',
        description: 'Account activity system',
        required: false,
        loadOrder: 14
      },
      {
        file: 'positions-portfolio.js',
        globalCheck: 'window.initPositionsPortfolio',
        description: 'Positions and portfolio system',
        required: false,
        loadOrder: 15
      }
    ],
    estimatedSize: '~180KB',
    initTime: '~110ms'
  },

  // 11. HELPER PACKAGE - Helper
  helper: {
    id: 'helper',
    name: 'Helper Package',
    description: 'Helper systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 11,
    dependencies: ['base', 'services'],
    loadingStrategy: 'defer', // Critical package - helper functions, has dependencies on base and services
    scripts: [
      {
        file: 'utils/cache-key-helper.js',
        globalCheck: 'window.CacheKeyHelper',
        description: 'Helper for creating optimal cache keys',
        required: false,
        loadOrder: 0
      },
      {
        file: 'utils/business-logic-batch-helper.js',
        globalCheck: 'window.BusinessLogicBatchHelper',
        description: 'Helper for Batch Operations with Business Logic API',
        required: false,
        loadOrder: 1
      },
      {
        file: 'utils/request-deduplication-helper.js',
        globalCheck: 'window.RequestDeduplicationHelper',
        description: 'Helper for Request Deduplication',
        required: false,
        loadOrder: 2
      },
      {
        file: 'currencies.js',
        globalCheck: 'window.openCurrencyDetails',
        description: 'Currency system',
        required: true,
        loadOrder: 1
      },
      {
        file: 'designs.js',
        globalCheck: 'window.generateDetailedLog',
        description: 'Design system',
        required: true,
        loadOrder: 2
      },
      {
        file: 'notes.js',
        globalCheck: 'window.loadNotesData',
        description: 'Notes system',
        required: true,
        loadOrder: 3
      },
      {
        file: 'research.js',
        globalCheck: 'window.initializeResearchPage',
        description: 'Research system',
        required: true,
        loadOrder: 4
      }
    ],
    estimatedSize: '~60KB',
    initTime: '~40ms'
  },

  // 12. SYSTEM-MANAGEMENT PACKAGE - System management
  'system-management': {
    id: 'system-management',
    name: 'System Management Package',
    description: 'Advanced system management',
    version: '1.5.0',
    critical: false,
    loadOrder: 12,
    dependencies: ['base', 'services'],
    loadingStrategy: 'async', // Non-critical - only for system management pages
    scripts: [
      {
        file: 'system-management/system-management-main.js',
        globalCheck: 'window.SystemManagementMain',
        description: 'Main system management',
        required: true
      },
      {
        file: 'system-management/core/sm-base.js',
        globalCheck: 'window.SMBaseSection',
        description: 'System management base',
        required: true
      },
      {
        file: 'system-management/core/sm-error-handler.js',
        globalCheck: 'window.SMErrorHandler',
        description: 'System management error handler',
        required: true
      },
      {
        file: 'system-management/core/sm-data-validators.js',
        globalCheck: 'window.SMDataValidators',
        description: 'System management data validators',
        required: true
      },
      {
        file: 'system-management/core/sm-ui-components.js',
        globalCheck: 'window.SMUIComponents',
        description: 'System management UI components',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-alerts.js',
        globalCheck: 'window.SMSectionAlerts',
        description: 'Alerts section',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-background-tasks.js',
        globalCheck: 'window.SMSectionBackgroundTasks',
        description: 'Background tasks section',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-cache.js',
        globalCheck: 'window.SMSectionCache',
        description: 'Cache section',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-dashboard.js',
        globalCheck: 'window.SMSectionDashboard',
        description: 'Dashboard section',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-database.js',
        globalCheck: 'window.SMSectionDatabase',
        description: 'Database section',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-external-data.js',
        globalCheck: 'window.SMSectionExternalData',
        description: 'External data section',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-operations.js',
        globalCheck: 'window.SMSectionOperations',
        description: 'Operations section',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-performance.js',
        globalCheck: 'window.SMSectionPerformance',
        description: 'Performance section',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-server.js',
        globalCheck: 'window.SMSectionServer',
        description: 'Server section',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-system-settings.js',
        globalCheck: 'window.SMSystemSettingsSection',
        description: 'System settings section',
        required: true
      },
      {
        file: 'system-management/sm-detailed-log.js',
        globalCheck: 'window.generateSystemManagementDetailedLog',
        description: 'System management detailed log generator',
        required: false
      }
    ],
    estimatedSize: '~400KB',
    initTime: '~200ms'
  },

  // 13. MANAGEMENT PACKAGE - Management
  management: {
    id: 'management',
    name: 'Management Package',
    description: 'Management systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 13,
    dependencies: ['base', 'services'],
    loadingStrategy: 'async', // Non-critical - only for management pages
    scripts: [
      // NOTE: auth.js removed - already in base package to avoid duplicate loading
      {
        file: 'background-tasks.js',
        globalCheck: 'window.startScheduler',
        description: 'Background tasks',
        required: true,
        loadOrder: 1
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~100ms'
  },

  // 14. DEV-TOOLS PACKAGE - Development tools
  'dev-tools': {
    id: 'dev-tools',
    name: 'Development Tools Package',
    description: 'Development and debugging tools',
    version: '1.5.0',
    critical: false,
    loadOrder: 14,
    dependencies: ['base', 'services'],
    loadingStrategy: 'async', // Non-critical - only for development tools pages
    scripts: [
      {
        file: 'init-system/dev-tools/page-template-generator.js',
        globalCheck: 'window.PageTemplateGenerator',
        description: 'Page template generator',
        required: true
      },
      {
        file: 'init-system/dev-tools/script-analyzer.js',
        globalCheck: 'window.ScriptAnalyzer',
        description: 'Script analyzer',
        required: true
      },
      {
        file: 'init-system/validators/runtime-validator.js',
        globalCheck: 'window.RuntimeValidator',
        description: 'Runtime validator',
        required: true
      },
      {
        file: 'debug-filter-tooltips-comprehensive.js',
        globalCheck: 'window.debugFilterTooltips',
        description: 'Debug tool for filter tooltips',
        required: false,
        loadOrder: 4
      }
    ],
    estimatedSize: '~100KB',
    initTime: '~60ms'
  },

  // 15. FILTERS PACKAGE - Filter system
  filters: {
    id: 'filters',
    name: 'Filters Package',
    description: 'Integrated filter system (embedded in header-system.js)',
    version: '1.5.0',
    critical: false,
    loadOrder: 15,
    dependencies: ['base', 'ui-advanced'],
    loadingStrategy: 'defer', // Critical package - filter system, embedded in header-system.js
    scripts: [],
    estimatedSize: '~0KB',
    initTime: '~0ms',
    notes: 'The system is active through window.filterSystem created inside header-system.js; no dedicated loading file.'
  },

  // 16. ADVANCED-NOTIFICATIONS PACKAGE - Advanced notifications
  // ⚠️ DEPRECATED: This package contains scripts that are already in base package
  // notification-system.js and warning-system.js are already loaded in base package
  // advanced-notifications package removed - deprecated, empty package
  // 'advanced-notifications': {
  //   id: 'advanced-notifications',
  //   name: 'Advanced Notifications Package',
  //   description: '⚠️ DEPRECATED: Scripts already in base package. Use base package instead.',
  //   version: '1.5.0',
  //   critical: false,
  //   loadOrder: 16,
  //   dependencies: ['base'],
  //   scripts: [], // ⚠️ Scripts removed - already in base package
  //   estimatedSize: '~0KB',
  //   initTime: '~0ms',
  //   deprecated: true,
  //   notes: 'This package is deprecated. notification-system.js and warning-system.js are already loaded in base package (loadOrder 2 and 5). Do not use this package.'
  // },


  // 17. ENTITY DETAILS PACKAGE - Entity details
  'entity-details': {
    id: 'entity-details',
    name: 'Entity Details Package',
    description: 'Entity details systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 17,
    dependencies: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services'],
    loadingStrategy: 'defer', // Critical package - entity details, has dependencies on multiple packages
    scripts: [
      {
        file: 'entity-details-api.js',
        globalCheck: 'window.EntityDetailsAPI',
        description: 'Entity details API',
        required: true,
        loadOrder: 1
      },
      {
        file: 'entity-details-renderer.js',
        globalCheck: 'window.EntityDetailsRenderer',
        description: 'Entity details renderer',
        required: true,
        loadOrder: 2
      },
      {
        file: 'entity-details-modal.js',
        globalCheck: 'window.showEntityDetails',
        description: 'Entity details modal',
        required: true,
        loadOrder: 3
      }
    ],
    estimatedSize: '~45KB',
    initTime: '~30ms'
  },

  // 18. INFO SUMMARY PACKAGE - Unified data summary system
  'info-summary': {
    id: 'info-summary',
    name: 'Info Summary Package',
    description: 'Unified data summary system for all pages',
    version: '1.0.0',
    critical: false,
    loadOrder: 17.5, // Changed from 18 to 17.5 to load before TradingView Charts (19)
    dependencies: ['base', 'services'],
    loadingStrategy: 'defer', // Critical package - info summary, has dependencies on base and services

    // CRITICAL LESSON: Always verify script loading in HTML!
    // This package was missing from portfolio-state.html causing "Missing required globals" errors
    // Remember: package-manifest.js defines WHAT to load, but HTML defines WHERE to load it
    // Always check both when adding new packages to pages!

    scripts: [
      {
        file: 'info-summary-system.js',
        globalCheck: 'window.InfoSummarySystem',
        description: 'Core data summary system',
        required: true,
        loadOrder: 1
      },
      {
        file: 'info-summary-configs.js',
        globalCheck: 'window.INFO_SUMMARY_CONFIGS',
        description: 'Page configurations for data summary',
        required: true,
        loadOrder: 2
      }
    ],
    estimatedSize: '~25KB',
    initTime: '~15ms'
  },

  // 19. TRADINGVIEW CHARTS PACKAGE - TradingView charts
  'tradingview-charts': {
    id: 'tradingview-charts',
    name: 'TradingView Charts Package',
    description: 'TradingView Lightweight Charts system',
    version: '1.0.0',
    critical: false,
    loadOrder: 19, // Changed from 20 to 19 to load before init-system (22) and after dashboard-widgets (20.5)
    dependencies: ['base'],
    loadingStrategy: 'async', // Non-critical - only for TradingView chart pages
    scripts: [
      {
        file: 'charts/vendor/lightweight-charts.standalone.production.js',
        globalCheck: 'window.LightweightCharts',
        description: 'TradingView Lightweight Charts',
        required: true,
        loadOrder: 0
      },
      {
        file: 'charts/tradingview-theme.js',
        globalCheck: 'window.TradingViewTheme',
        description: 'TradingView theme',
        required: true,
        loadOrder: 1
      },
      {
        file: 'charts/tradingview-adapter.js',
        globalCheck: 'window.TradingViewChartAdapter',
        description: 'TradingView system adapter',
        required: true,
        loadOrder: 2
      }
    ],
    estimatedSize: '~35KB',
    initTime: '~20ms'
  },

  // 20. WATCH LISTS PACKAGE - Watch Lists management system
  'watch-lists': {
    id: 'watch-lists',
    name: 'Watch Lists Package',
    description: 'Watch lists management system - full production implementation with API integration',
    version: '1.0.0',
    critical: false,
    loadOrder: 20,
    dependencies: ['base', 'services', 'ui-advanced', 'crud', 'entity-services'],
    loadingStrategy: 'defer', // Changed to defer to ensure WatchListsPage global is available when checked
    scripts: [
      {
        file: 'services/watch-lists-data.js',
        globalCheck: 'window.WatchListsDataService',
        description: 'Watch lists data service (API + Cache + CRUD)',
        required: true,
        loadOrder: 1
      },
      {
        file: 'services/watch-lists-ui-service.js',
        globalCheck: 'window.WatchListsUIService',
        description: 'Watch lists UI service',
        required: true,
        loadOrder: 2
      },
      {
        file: 'watch-lists-page.js',
        globalCheck: 'window.WatchListsPage',
        description: 'Watch lists main page',
        required: true,
        loadOrder: 3
      },
      {
        file: 'flag-quick-action.js',
        globalCheck: 'window.FlagQuickAction',
        description: 'Flag quick action palette',
        required: false,
        loadOrder: 4
      }
    ],
    estimatedSize: '~50KB',
    initTime: '~100ms',
    notes: 'Mockup mode - UI layer only, no API calls'
  },

  // 20.5. AI-ANALYSIS PACKAGE - AI Analysis System
  'ai-analysis': {
    id: 'ai-analysis',
    name: 'AI Analysis Package',
    description: 'AI analysis system with LLM integration',
    version: '1.0.0',
    critical: false,
    loadOrder: 20.5, // After entity-services, before init-system
    dependencies: ['base', 'services', 'ui-advanced', 'modules', 'preferences', 'entity-services'],
    loadingStrategy: 'defer', // Critical package - AI analysis, has dependencies on multiple packages
    scripts: [
      {
        file: 'https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js',
        globalCheck: 'marked',
        description: 'Markdown parser library (for AI result rendering)',
        required: true,
        loadOrder: 0.5
      },
      {
        file: 'ai-analysis-manager.js',
        globalCheck: 'window.AIAnalysisManager',
        description: 'AI Analysis UI manager',
        required: true,
        loadOrder: 1
      },
      {
        file: 'ai-template-selector.js',
        globalCheck: 'window.AITemplateSelector',
        description: 'Template selector component',
        required: true,
        loadOrder: 2
      },
      {
        file: 'ai-result-renderer.js',
        globalCheck: 'window.AIResultRenderer',
        description: 'AI result renderer with markdown and infographics',
        required: true,
        loadOrder: 3
      },
      {
        file: 'ai-notes-integration.js',
        globalCheck: 'window.AINotesIntegration',
        description: 'AI analysis notes integration',
        required: true,
        loadOrder: 4
      },
      {
        file: 'ai-export-service.js',
        globalCheck: 'window.AIExportService',
        description: 'AI analysis export service',
        required: true,
        loadOrder: 5
      }
      // ⚠️ NOTE: notes-config.js is already in modules package (loadOrder: 20)
      // It must load before modal-manager-v2.js which is in modules package
    ],
    estimatedSize: '~80KB',
    initTime: '~50ms'
  },

  // 21. INIT PACKAGE - Initialization
  'init-system': {
    id: 'init-system',
    name: 'Initialization Package',
    description: 'Initialization and monitoring systems',
    version: '1.5.0',
    critical: false,
    loadOrder: 22, // Changed from 20 to 22 to load after all other packages (dashboard-widgets 20.5, tradingview-charts 19, tradingview-widgets 21, watch-lists 20)
    dependencies: ['base'], // Only base is required for Logger and basic systems
    loadingStrategy: 'defer', // Critical package - initialization system, must load last, has dependencies on base
    scripts: [
      {
        file: 'init-system/package-manifest.js',
        globalCheck: 'window.PACKAGE_MANIFEST',
        description: 'Package manifest',
        required: true,
        loadOrder: 1
      },
      {
        file: 'page-initialization-configs.js',
        globalCheck: 'window.PAGE_INITIALIZATION_CONFIGS',
        description: 'Page initialization configurations',
        required: true,
        loadOrder: 2
      },
      {
        file: 'init-system-check.js',
        globalCheck: 'window.initSystemCheck',
        description: 'Initialization system check',
        required: true,
        loadOrder: 3
      },
      {
        file: 'monitoring-functions.js',
        globalCheck: 'window.runDetailedPageScan',
        description: 'Page monitoring functions',
        required: true,
        loadOrder: 4
      },
      {
        file: 'modules/core-systems.js',
        globalCheck: 'window.UnifiedAppInitializer',
        description: 'Unified initialization system - single entry point (required for all pages)',
        required: true,
        loadOrder: 5
      },
      {
        file: 'init-system/all-pages-monitoring-test.js',
        globalCheck: 'window.allPagesMonitoringTest',
        description: 'Automatic check of all pages',
        required: false,
        loadOrder: 6
      },
      {
        file: 'init-system/pages-standardization-plan.js',
        globalCheck: 'window.pagesStandardizationPlan',
        description: 'Standardization plan for all pages',
        required: false,
        loadOrder: 7
      },
      {
        file: 'init-system/dependency-analyzer.js',
        globalCheck: 'window.dependencyAnalyzer',
        description: 'Dependencies analysis in package manifest',
        required: false,
        loadOrder: 8
      },
      {
        file: 'init-system/load-order-validator.js',
        globalCheck: 'window.loadOrderValidator',
        description: 'Actual loading order check in pages',
        required: false,
        loadOrder: 9
      },
      // unified-app-initializer.js removed - initialization now handled by core-systems.js
    ],
    estimatedSize: '~45KB',
    initTime: '~30ms'
  },

  // 20.5 DASHBOARD WIDGETS PACKAGE - Dashboard page components
  'dashboard-widgets': {
    id: 'dashboard-widgets',
    name: 'Dashboard Widgets',
    description: 'Widgets and dashboard interfaces (Pending Executions, Trade Creation)',
    version: '1.0.0',
    critical: false,
    loadOrder: 20.6, // Changed from 20.5 to 20.6 to load after ai-analysis (20.5)
    dependencies: ['base', 'services', 'ui-advanced', 'entity-services', 'modules', 'entity-details', 'watch-lists'],
    loadingStrategy: 'defer', // Critical package - dashboard widgets, has dependencies on multiple packages
    scripts: [
      {
        file: 'services/dashboard-data.js',
        globalCheck: 'window.DashboardData',
        description: 'Unified dashboard data service',
        required: true,
        loadOrder: 0
      },
      {
        file: 'widgets/recent-items-widget.js',
        globalCheck: 'window.RecentItemsWidget',
        description: 'Unified recent trades and trade plans widget',
        required: true,
        loadOrder: 1
      },
      {
        file: 'widgets/recent-trades-widget.js',
        globalCheck: 'window.RecentTradesWidget',
        description: 'Recent trades widget (deprecated - use RecentItemsWidget)',
        required: false,
        loadOrder: 1.5
      },
      // Note: Old pending widgets removed - replaced by shared services:
      // - ExecutionClusteringService (replaces pending-execution-trade-creation.js)
      // - ExecutionAssignmentService (replaces pending-executions-widget.js)
      // - TradePlanAssignmentService (replaces pending-trade-plan-widget.js)
      // - ExecutionClusterHelpers (shared rendering helpers)
      // - PendingActionsCacheService (shared cache management)
      {
        file: 'widgets/unified-pending-actions-widget.js',
        globalCheck: 'window.UnifiedPendingActionsWidget',
        description: 'Unified pending actions widget',
        required: true,
        loadOrder: 2
      },
      {
        file: 'widgets/tag-widget.js',
        globalCheck: 'window.TagWidget',
        description: 'Unified tag widget (cloud + search)',
        required: true,
        loadOrder: 5
      },
      {
        file: 'active-alerts-component.js',
        globalCheck: 'window.updateActiveAlertsComponent',
        description: 'Active alerts component',
        required: true,
        loadOrder: 5
      },
      {
        file: 'widgets/ticker-list-widget.js',
        globalCheck: 'window.TickerListWidget',
        description: 'Ticker list widget with KPI cards',
        required: true,
        loadOrder: 6
      },
      {
        file: 'widgets/ticker-chart-widget.js',
        globalCheck: 'window.TickerChartWidget',
        description: 'Ticker chart widget with mini charts',
        required: true,
        loadOrder: 7
      },
      {
        file: 'widgets/watch-lists-widget.js',
        globalCheck: 'window.WatchListsWidget',
        description: 'Watch lists widget for dashboard',
        required: false,
        loadOrder: 8
      },
      {
        file: 'widgets/widget-monitor.js',
        globalCheck: 'window.WidgetMonitor',
        description: 'Widget monitoring and debugging system',
        required: false,
        loadOrder: 99 // Load after all widgets
      },
      // ⚠️ NOTE: tag-search-config.js moved to modules package (loadOrder: 24)
      // It must load before modal-manager-v2.js which is in modules package
      {
        file: 'index.js',
        globalCheck: 'window.initializeIndexPage',
        description: 'Dashboard page logic',
        required: true,
        loadOrder: 9
      }
    ],
    estimatedSize: '~110KB',
    initTime: '~60ms'
  },

  // Game plan: dynamic loader uses PAGE_REQUIREMENTS; add validation dependencies for dashboard use cases
  'dashboard': {
    id: 'dashboard-modules',
    name: 'Dashboard Modules',
    description: 'Dashboard-specific modules including trade creation support',
    version: '1.0.0',
    critical: false,
    loadOrder: 6.1,
    dependencies: ['modules', 'validation'],
    loadingStrategy: 'defer', // Critical package - dashboard modules, has dependencies on modules and validation
    scripts: [
      {
        file: 'trade-selector-modal.js',
        globalCheck: 'window.openTradeSelectorModal',
        description: 'Trade selector module',
        required: false,
        loadOrder: 0
      },
      {
        file: 'modal-configs/trades-config.js',
        globalCheck: 'window.tradesModalConfig',
        description: 'Trades modal configuration',
        required: false,
        loadOrder: 1
      }
    ],
    estimatedSize: '~20KB',
    initTime: '~10ms'
  },

  // 21. TRADINGVIEW WIDGETS PACKAGE - TradingView widgets
  'tradingview-widgets': {
    id: 'tradingview-widgets',
    name: 'TradingView Widgets Package',
    description: 'Central system for managing TradingView widgets',
    version: '1.0.0',
    critical: false,
    loadOrder: 21,
    dependencies: ['base', 'preferences'],
    loadingStrategy: 'async', // Non-critical - only for TradingView widget pages
    scripts: [
      {
        file: 'tradingview-widgets/tradingview-widgets-config.js',
        globalCheck: 'window.TradingViewWidgetsConfig',
        description: 'Widget configuration',
        required: true,
        loadOrder: 1
      },
      {
        file: 'tradingview-widgets/tradingview-widgets-colors.js',
        globalCheck: 'window.TradingViewWidgetsColors',
        description: 'Color system integration',
        required: true,
        loadOrder: 2
      },
      {
        file: 'tradingview-widgets/tradingview-widgets-factory.js',
        globalCheck: 'window.TradingViewWidgetsFactory',
        description: 'Factory for creating widgets',
        required: true,
        loadOrder: 3
      },
      {
        file: 'tradingview-widgets/tradingview-widgets-core.js',
        globalCheck: 'window.TradingViewWidgetsManager',
        description: 'Central widget management system',
        required: true,
        loadOrder: 4
      }
    ],
    estimatedSize: '~45KB',
    initTime: '~30ms'
  }
};

/**
 * Package Manifest Manager Class
 * Advanced package manager with helper functions
 */
class PackageManifest {
  /**
   * Get all packages
   */
  getAllPackages() {
    return Object.values(PACKAGE_MANIFEST);
  }

  /**
   * Get package by ID
   */
  getPackage(packageId) {
    return PACKAGE_MANIFEST[packageId];
  }

  /**
   * Get packages by load order
   */
  getPackagesByLoadOrder() {
    return this.getAllPackages().sort((a, b) => a.loadOrder - b.loadOrder);
  }

  /**
   * Get critical packages only
   */
  getCriticalPackages() {
    return this.getAllPackages().filter(pkg => pkg.critical);
  }

  /**
   * Get package dependencies (recursive)
   */
  getPackageDependencies(packageId) {
    const dependencies = [];
    const visited = new Set();
    
    const collectDeps = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const depPkg = this.getPackage(id);
      if (depPkg && depPkg.dependencies) {
        depPkg.dependencies.forEach(depId => {
          dependencies.push(depId);
          collectDeps(depId);
        });
      }
    };
    
    collectDeps(packageId);
    return dependencies;
  }

  /**
   * Get all scripts for packages
   */
  getScriptsForPackages(packageIds) {
    const scripts = [];
    const seen = new Set();

    packageIds.forEach(pkgId => {
      const pkg = this.getPackage(pkgId);
      if (pkg && pkg.scripts) {
        pkg.scripts.forEach(script => {
          // Only load scripts that are required (required: true or undefined)
          // Skip scripts marked as required: false
          if (script.required !== false && !seen.has(script.file)) {
            scripts.push(script);
            seen.add(script.file);
          }
        });
      }
    });

    return scripts;
  }

  /**
   * Validate package configuration
   */
  validatePackage(packageId) {
    const pkg = this.getPackage(packageId);
    if (!pkg) {
      return { valid: false, error: `Package ${packageId} not found` };
    }
    
    const errors = [];
    
    // Check required fields
    if (!pkg.id) errors.push('Missing id');
    if (!pkg.name) errors.push('Missing name');
    if (!pkg.scripts || pkg.scripts.length === 0) errors.push('No scripts defined');
    
    // Check dependencies exist
    if (pkg.dependencies) {
      pkg.dependencies.forEach(depId => {
        if (!this.getPackage(depId)) {
          errors.push(`Dependency ${depId} not found`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get package statistics
   */
  getStats() {
    const packages = this.getAllPackages();
    const critical = packages.filter(pkg => pkg.critical).length;
    const totalScripts = packages.reduce((sum, pkg) => sum + (pkg.scripts?.length || 0), 0);
    const totalSize = packages.reduce((sum, pkg) => {
      const size = pkg.estimatedSize?.replace(/[^\d]/g, '') || '0';
      return sum + parseInt(size);
    }, 0);
    
    return {
      totalPackages: packages.length,
      criticalPackages: critical,
      totalScripts: totalScripts,
      estimatedTotalSize: `${totalSize}KB`
    };
  }
}

// Export to global scope
if (typeof window !== 'undefined') {
  window.PACKAGE_MANIFEST = PACKAGE_MANIFEST;
  window.PackageManifest = PackageManifest;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PACKAGE_MANIFEST, PackageManifest };
}
