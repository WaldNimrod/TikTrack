/**
 * Test Registry - TikTrack
 * Central registry of all test systems with relevancy mapping
 *
 * Author: Team C (Backend Services/APIs)
 * Date: December 2025
 */

const TEST_REGISTRY = [
  // ===== CRUD / E2E / Page Systems =====

  // Trade CRUD Tests
  {
    id: "trade-crud-e2e",
    name: "CRUD E2E: Trades",
    category: "crud-e2e",
    page: "trades",
    entityType: "trade",
    runner: "runTradeTestOnly",
    relevance: ["user-pages", "crud"],
    prerequisites: ["auth", "tickers", "accounts"],
    estimatedTime: 45,
    file: "crud-automated-test-runner.js"
  },
  {
    id: "trade-comprehensive-crud",
    name: "Comprehensive CRUD: Trades",
    category: "crud-e2e",
    page: "trades",
    entityType: "trade",
    runner: "runComprehensiveTradeTest",
    relevance: ["user-pages", "crud"],
    prerequisites: ["auth", "tickers", "accounts"],
    estimatedTime: 60,
    file: "comprehensive-crud-test-runner.js"
  },
  {
    id: "trade-response-handler-e2e",
    name: "Response Handler E2E: Trades",
    category: "crud-e2e",
    page: "trades",
    entityType: "trade",
    runner: "runTradeResponseHandlerTest",
    relevance: ["user-pages", "crud"],
    prerequisites: ["auth"],
    estimatedTime: 30,
    file: "crud-response-handler-e2e-test.js"
  },

  // Trade Plan CRUD Tests
  {
    id: "trade-plan-crud-e2e",
    name: "CRUD E2E: Trade Plans",
    category: "crud-e2e",
    page: "trade_plans",
    entityType: "trade_plan",
    runner: "runTradePlanTestOnly",
    relevance: ["user-pages", "crud"],
    prerequisites: ["auth", "tickers"],
    estimatedTime: 40,
    file: "crud-automated-test-runner.js"
  },

  // Alert CRUD Tests
  {
    id: "alert-crud-e2e",
    name: "CRUD E2E: Alerts",
    category: "crud-e2e",
    page: "alerts",
    entityType: "alert",
    runner: "runAlertTestOnly",
    relevance: ["user-pages", "crud"],
    prerequisites: ["auth"],
    estimatedTime: 35,
    file: "crud-automated-test-runner.js"
  },

  // Ticker CRUD Tests
  {
    id: "ticker-crud-e2e",
    name: "CRUD E2E: Tickers",
    category: "crud-e2e",
    page: "tickers",
    entityType: "ticker",
    runner: "runTickerTestOnly",
    relevance: ["user-pages", "crud"],
    prerequisites: ["auth"],
    estimatedTime: 40,
    file: "crud-automated-test-runner.js"
  },

  // Account CRUD Tests
  {
    id: "account-crud-e2e",
    name: "CRUD E2E: Trading Accounts",
    category: "crud-e2e",
    page: "trading_accounts",
    entityType: "trading_account",
    runner: "runAccountTestOnly",
    relevance: ["user-pages", "crud"],
    prerequisites: ["auth"],
    estimatedTime: 35,
    file: "crud-automated-test-runner.js"
  },

  // Note CRUD Tests
  {
    id: "note-crud-e2e",
    name: "CRUD E2E: Notes",
    category: "crud-e2e",
    page: "notes",
    entityType: "note",
    runner: "runNoteTestOnly",
    relevance: ["user-pages", "crud"],
    prerequisites: ["auth"],
    estimatedTime: 30,
    file: "crud-automated-test-runner.js"
  },

  // Tag CRUD Tests
  {
    id: "tag-crud-e2e",
    name: "CRUD E2E: Tags",
    category: "crud-e2e",
    page: "tag_management",
    entityType: "tag",
    runner: "runTagTestOnly",
    relevance: ["user-pages", "crud"],
    prerequisites: ["auth"],
    estimatedTime: 25,
    file: "tag-management-test.js"
  },

  // ===== Cross-Page Testing =====
  {
    id: "cross-page-testing",
    name: "Cross-Page Testing System",
    category: "cross-page",
    page: "all-user-pages",
    entityType: "navigation",
    runner: "runCrossPageTests",
    relevance: ["user-pages", "navigation"],
    prerequisites: ["auth"],
    estimatedTime: 120,
    file: "cross-page-testing-system.js"
  },

  // ===== Table/Sorting Tests =====
  {
    id: "sorting-testing",
    name: "Sorting Testing System",
    category: "ui-table",
    page: "all-user-pages",
    entityType: "table",
    runner: "runSortingTests",
    relevance: ["user-pages", "table"],
    prerequisites: ["auth"],
    estimatedTime: 90,
    file: "sorting-testing-system.js"
  },

  // ===== Defaults Testing =====
  {
    id: "defaults-testing",
    name: "Defaults Testing System",
    category: "ui-defaults",
    page: "all-user-pages",
    entityType: "defaults",
    runner: "runDefaultsTests",
    relevance: ["user-pages", "defaults"],
    prerequisites: ["auth"],
    estimatedTime: 60,
    file: "defaults-testing-system.js"
  },

  // ===== Page/Init/Monitoring Tests =====

  // All Pages Monitoring
  {
    id: "all-pages-monitoring",
    name: "All Pages Monitoring Test",
    category: "init-monitoring",
    page: "all-user-pages",
    entityType: "monitoring",
    runner: "runAllPagesMonitoringTest",
    relevance: ["user-pages", "init"],
    prerequisites: [],
    estimatedTime: 180,
    file: "init-system/all-pages-monitoring-test.js"
  },

  // Comprehensive Initialization
  {
    id: "comprehensive-initialization",
    name: "Comprehensive Initialization Test",
    category: "init-monitoring",
    page: "all-user-pages",
    entityType: "init",
    runner: "runComprehensiveInitializationTest",
    relevance: ["user-pages", "init"],
    prerequisites: [],
    estimatedTime: 150,
    file: "init-system/comprehensive-initialization-test.js"
  },

  // Preferences Status Tests
  {
    id: "preferences-status-test",
    name: "Preferences Status Test",
    category: "init-preferences",
    page: "all-user-pages",
    entityType: "preferences",
    runner: "runPreferencesStatusTest",
    relevance: ["user-pages", "preferences"],
    prerequisites: [],
    estimatedTime: 45,
    file: "test-pages-preferences-status.js"
  },

  // Preferences Loading Tests
  {
    id: "preferences-loading-test",
    name: "Preferences Loading Test",
    category: "init-preferences",
    page: "all-user-pages",
    entityType: "preferences",
    runner: "runPreferencesLoadingTest",
    relevance: ["user-pages", "preferences"],
    prerequisites: [],
    estimatedTime: 60,
    file: "test-preferences-loading-across-pages.js"
  },

  // Executions Page Tests
  {
    id: "executions-page-loading",
    name: "Executions Page Loading Test",
    category: "page-init",
    page: "executions",
    entityType: "execution",
    runner: "runExecutionsPageLoadingTest",
    relevance: ["user-pages", "init"],
    prerequisites: ["auth"],
    estimatedTime: 30,
    file: "test-executions-page-loading.js"
  },

  {
    id: "executions-init-flow",
    name: "Executions Initialization Flow Test",
    category: "page-init",
    page: "executions",
    entityType: "execution",
    runner: "runExecutionsInitFlowTest",
    relevance: ["user-pages", "init"],
    prerequisites: ["auth"],
    estimatedTime: 40,
    file: "test-executions-initialization-flow.js"
  },

  {
    id: "executions-clusters-loading",
    name: "Executions Clusters Loading Test",
    category: "page-init",
    page: "executions",
    entityType: "execution",
    runner: "runExecutionsClustersLoadingTest",
    relevance: ["user-pages", "init"],
    prerequisites: ["auth"],
    estimatedTime: 35,
    file: "test-executions-clusters-loading.js"
  },

  // DB Display Page Test
  {
    id: "db-display-page-loading",
    name: "DB Display Page Loading Test",
    category: "page-init",
    page: "db_display",
    entityType: "db",
    runner: "runDBDisplayPageLoadingTest",
    relevance: ["admin-pages", "init"],
    prerequisites: ["auth", "admin"],
    estimatedTime: 25,
    file: "test-db-display-page-loading.js"
  },

  // ===== UI/Table/Modal/Navigation Tests =====

  // Unified Table System
  {
    id: "unified-table-system",
    name: "Unified Table System Test",
    category: "ui-table",
    page: "all-user-pages",
    entityType: "table",
    runner: "runUnifiedTableTests",
    relevance: ["user-pages", "table"],
    prerequisites: ["auth"],
    estimatedTime: 75,
    file: "test-unified-table-system.js"
  },

  // Page State E2E
  {
    id: "page-state-e2e",
    name: "Page State E2E Test",
    category: "ui-navigation",
    page: "all-user-pages",
    entityType: "navigation",
    runner: "runPageStateE2ETest",
    relevance: ["user-pages", "navigation"],
    prerequisites: ["auth"],
    estimatedTime: 90,
    file: "page-state-e2e-test.js"
  },

  // Modal Navigation E2E
  {
    id: "modal-navigation-e2e",
    name: "Modal Navigation E2E Test",
    category: "ui-modal",
    page: "all-user-pages",
    entityType: "modal",
    runner: "runModalNavigationE2ETest",
    relevance: ["user-pages", "modal"],
    prerequisites: ["auth"],
    estimatedTime: 85,
    file: "modal-navigation-e2e-test.js"
  },

  // Modal Quantum System
  {
    id: "modal-quantum-system",
    name: "Modal Quantum System Tests",
    category: "ui-modal",
    page: "all-user-pages",
    entityType: "modal",
    runner: "runModalQuantumSystemTests",
    relevance: ["user-pages", "modal"],
    prerequisites: ["auth"],
    estimatedTime: 70,
    file: "modal-quantum-system-tests.js"
  },

  // Edit Modal Test
  {
    id: "edit-modal-test",
    name: "Edit Modal Test",
    category: "ui-modal",
    page: "all-user-pages",
    entityType: "modal",
    runner: "runEditModalTest",
    relevance: ["user-pages", "modal"],
    prerequisites: ["auth"],
    estimatedTime: 50,
    file: "tests/edit-modal-test.js"
  },

  // ===== Specialized Tests =====

  // AI Analysis (No CRUD)
  {
    id: "ai-analysis-integration",
    name: "AI Analysis Integration Test",
    category: "specialized",
    page: "ai_analysis",
    entityType: "ai",
    runner: "runAIAnalysisTest",
    relevance: ["user-pages", "ai"],
    prerequisites: ["auth"],
    estimatedTime: 45,
    file: "ai-analysis-integration-test.js"
  },

  {
    id: "ai-analysis-browser-test",
    name: "AI Analysis Browser Test",
    category: "specialized",
    page: "ai_analysis",
    entityType: "ai",
    runner: "runAIAnalysisBrowserTest",
    relevance: ["user-pages", "ai"],
    prerequisites: ["auth"],
    estimatedTime: 60,
    file: "testing/automated/ai-analysis-browser-test.js"
  },

  {
    id: "ai-analysis-performance-test",
    name: "AI Analysis Performance Test",
    category: "specialized",
    page: "ai_analysis",
    entityType: "ai",
    runner: "runAIAnalysisPerformanceTest",
    relevance: ["user-pages", "ai"],
    prerequisites: ["auth"],
    estimatedTime: 90,
    file: "testing/automated/ai-analysis-performance-test.js"
  },

  // ===== Cache and System Tests =====

  {
    id: "cache-system-integration",
    name: "Cache System Integration Test",
    category: "system",
    page: "all-pages",
    entityType: "cache",
    runner: "runCacheSystemIntegrationTest",
    relevance: ["all-pages", "system"],
    prerequisites: [],
    estimatedTime: 45,
    file: "testing/test_cache_system_integration.js"
  },

  {
    id: "frontend-wrappers-test",
    name: "Frontend Wrappers Test",
    category: "system",
    page: "all-pages",
    entityType: "wrappers",
    runner: "runFrontendWrappersTest",
    relevance: ["all-pages", "system"],
    prerequisites: [],
    estimatedTime: 30,
    file: "testing/test_frontend_wrappers.js"
  },

  {
    id: "initialization-stages-test",
    name: "Initialization Stages Test",
    category: "init-monitoring",
    page: "all-user-pages",
    entityType: "init",
    runner: "runInitializationStagesTest",
    relevance: ["user-pages", "init"],
    prerequisites: [],
    estimatedTime: 60,
    file: "testing/test_initialization_stages.js"
  },

  {
    id: "packages-page-configs-test",
    name: "Packages and Page Configs Test",
    category: "init-monitoring",
    page: "all-user-pages",
    entityType: "config",
    runner: "runPackagesAndPageConfigsTest",
    relevance: ["user-pages", "init"],
    prerequisites: [],
    estimatedTime: 45,
    file: "testing/test_packages_and_page_configs.js"
  },

  // ===== Preferences Tests =====

  {
    id: "preferences-loading-events-test",
    name: "Preferences Loading Events Test",
    category: "init-preferences",
    page: "all-user-pages",
    entityType: "preferences",
    runner: "runPreferencesLoadingEventsTest",
    relevance: ["user-pages", "preferences"],
    prerequisites: [],
    estimatedTime: 40,
    file: "testing/test_preferences_loading_events.js"
  },

  {
    id: "preferences-optimization-test",
    name: "Preferences Optimization Test",
    category: "init-preferences",
    page: "all-user-pages",
    entityType: "preferences",
    runner: "runPreferencesOptimizationTest",
    relevance: ["user-pages", "preferences"],
    prerequisites: [],
    estimatedTime: 35,
    file: "testing/test-preferences-optimization.js"
  },

  // ===== Comprehensive Tests =====

  {
    id: "comprehensive-cache-clearing",
    name: "Comprehensive Cache Clearing Test",
    category: "system",
    page: "all-pages",
    entityType: "cache",
    runner: "runComprehensiveCacheClearingTest",
    relevance: ["all-pages", "system"],
    prerequisites: [],
    estimatedTime: 75,
    file: "testing/comprehensive-cache-clearing-test.js"
  },

  {
    id: "mockup-pages-comprehensive",
    name: "Mockup Pages Comprehensive Test",
    category: "ui-specialized",
    page: "all-user-pages",
    entityType: "mockup",
    runner: "runMockupPagesComprehensiveTest",
    relevance: ["user-pages", "ui"],
    prerequisites: [],
    estimatedTime: 90,
    file: "testing/mockup-pages-comprehensive-test.js"
  },

  // Watch Lists (CRUD + defaults, no list-of-lists)
  {
    id: "watch-lists-crud",
    name: "Watch Lists CRUD Test",
    category: "crud-specialized",
    page: "watch_lists",
    entityType: "watch_list",
    runner: "runWatchListsCRUDTest",
    relevance: ["user-pages", "crud", "defaults"],
    prerequisites: ["auth", "tickers"],
    estimatedTime: 50,
    file: "watch-lists-crud-test.js"
  },

  // Trading Journal (Notes-style)
  {
    id: "trading-journal-test",
    name: "Trading Journal Test",
    category: "specialized",
    page: "trading_journal",
    entityType: "journal",
    runner: "runTradingJournalTest",
    relevance: ["user-pages", "notes"],
    prerequisites: ["auth"],
    estimatedTime: 35,
    file: "trading-journal-test.js"
  },

  // Ticker Dashboard (No CRUD, only UI/Init)
  {
    id: "ticker-dashboard-ui",
    name: "Ticker Dashboard UI Test",
    category: "ui-specialized",
    page: "ticker_dashboard",
    entityType: "dashboard",
    runner: "runTickerDashboardUITest",
    relevance: ["user-pages", "ui", "init"],
    prerequisites: ["auth", "tickers"],
    estimatedTime: 40,
    file: "ticker-dashboard-ui-test.js"
  },

  // ===== Admin/Development Tests =====

  // User Management
  {
    id: "user-management-crud",
    name: "User Management CRUD Test",
    category: "admin-crud",
    page: "user_management",
    entityType: "user",
    runner: "runUserManagementCRUDTest",
    relevance: ["admin-pages", "crud"],
    prerequisites: ["auth", "admin"],
    estimatedTime: 55,
    file: "user-management-crud-test.js"
  },

  // Data Import
  {
    id: "data-import-test",
    name: "Data Import Test",
    category: "admin-import",
    page: "data_import",
    entityType: "import",
    runner: "runDataImportTest",
    relevance: ["admin-pages", "import"],
    prerequisites: ["auth", "admin"],
    estimatedTime: 65,
    file: "data-import-test.js"
  },

  // Strategy Analysis
  {
    id: "strategy-analysis-test",
    name: "Strategy Analysis Test",
    category: "admin-analysis",
    page: "strategy_analysis",
    entityType: "strategy",
    runner: "runStrategyAnalysisTest",
    relevance: ["admin-pages", "analysis"],
    prerequisites: ["auth", "admin"],
    estimatedTime: 70,
    file: "strategy-analysis-test.js"
  },

  // ===== Authentication Tests =====
  // Note: Auth tests are typically not page-specific, but can be run per-page

  {
    id: "auth-flow-test",
    name: "Authentication Flow Test",
    category: "auth",
    page: "all-pages",
    entityType: "auth",
    runner: "runAuthFlowTest",
    relevance: ["all-pages", "auth"],
    prerequisites: [],
    estimatedTime: 25,
    file: "auth-flow-test.js"
  }
];

// ===== Export Functions =====

/**
 * Get all tests for a specific page
 */
function getTestsForPage(page) {
  return TEST_REGISTRY.filter(test => {
    return test.page === page || test.page === 'all-user-pages' || test.page === 'all-pages';
  });
}

/**
 * Get all tests for a specific category
 */
function getTestsByCategory(category) {
  return TEST_REGISTRY.filter(test => test.category === category);
}

/**
 * Get test by ID
 */
function getTestById(testId) {
  return TEST_REGISTRY.find(test => test.id === testId);
}

/**
 * Get tests that are not relevant for a specific page
 * (for skip/irrelevant marking)
 */
function getIrrelevantTestsForPage(page) {
  return TEST_REGISTRY.filter(test => {
    // Skip tests that are specifically for other pages
    if (test.page !== page && test.page !== 'all-user-pages' && test.page !== 'all-pages') {
      return true;
    }
    return false;
  });
}

/**
 * Validate test registry integrity
 */
function validateRegistry() {
  const errors = [];
  const ids = new Set();

  TEST_REGISTRY.forEach(test => {
    // Check for duplicate IDs
    if (ids.has(test.id)) {
      errors.push(`Duplicate test ID: ${test.id}`);
    }
    ids.add(test.id);

    // Check required fields
    const required = ['id', 'name', 'category', 'page', 'entityType', 'runner', 'relevance'];
    required.forEach(field => {
      if (!test[field]) {
        errors.push(`Missing required field '${field}' for test ${test.id}`);
      }
    });
  });

  return errors;
}

// Export for browser usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEST_REGISTRY,
    getTestsForPage,
    getTestsByCategory,
    getTestById,
    getIrrelevantTestsForPage,
    validateRegistry
  };
} else {
  window.TestRegistry = {
    TEST_REGISTRY,
    getTestsForPage,
    getTestsByCategory,
    getTestById,
    getIrrelevantTestsForPage,
    validateRegistry
  };
}
