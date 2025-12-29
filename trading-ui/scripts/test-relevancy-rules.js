/**
 * Test Relevancy Rules - TikTrack
 * Defines which tests are relevant/irrelevant for which pages
 *
 * Author: Team C (Backend Services/APIs)
 * Date: December 2025
 */

const RELEVANCY_RULES = {
  // ===== Page-Specific Rules =====

  // Dashboard/Index - Only basic init tests
  "index.html": {
    relevant: ["init-monitoring", "ui-navigation", "auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "specialized"],
    skipReasons: {
      "crud-e2e": "Dashboard has no CRUD operations",
      "ui-table": "Dashboard uses cards, not tables",
      "ui-modal": "Dashboard has no modals",
      "specialized": "Dashboard is general purpose"
    }
  },

  // Research - Analysis focused, limited CRUD
  "research.html": {
    relevant: ["init-monitoring", "ui-table", "auth"],
    irrelevant: ["crud-e2e", "ui-modal", "specialized"],
    skipReasons: {
      "crud-e2e": "Research page has read-only analysis",
      "ui-modal": "Research uses inline analysis, not modals",
      "specialized": "Research is not specialized like AI or journals"
    }
  },

  // Trades - Full CRUD page
  "trades.html": {
    relevant: ["crud-e2e", "ui-table", "ui-modal", "init-monitoring", "sorting-testing", "defaults-testing", "auth"],
    irrelevant: ["specialized"],
    skipReasons: {
      "specialized": "Trades page uses standard CRUD, not specialized features"
    }
  },

  // Executions - Read-heavy with clustering
  "executions.html": {
    relevant: ["page-init", "ui-table", "sorting-testing", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-modal", "defaults-testing", "specialized"],
    skipReasons: {
      "crud-e2e": "Executions are read-only (historical data)",
      "ui-modal": "Executions don't have edit/create modals",
      "defaults-testing": "Executions show historical data, not defaults",
      "specialized": "Executions use standard table features"
    }
  },

  // Alerts - Full CRUD
  "alerts.html": {
    relevant: ["crud-e2e", "ui-table", "ui-modal", "init-monitoring", "sorting-testing", "defaults-testing", "auth"],
    irrelevant: ["specialized"],
    skipReasons: {
      "specialized": "Alerts use standard CRUD features"
    }
  },

  // Trade Plans - Full CRUD
  "trade_plans.html": {
    relevant: ["crud-e2e", "ui-table", "ui-modal", "init-monitoring", "sorting-testing", "defaults-testing", "auth"],
    irrelevant: ["specialized"],
    skipReasons: {
      "specialized": "Trade plans use standard CRUD features"
    }
  },

  // Tickers - Full CRUD
  "tickers.html": {
    relevant: ["crud-e2e", "ui-table", "ui-modal", "init-monitoring", "sorting-testing", "defaults-testing", "auth"],
    irrelevant: ["specialized"],
    skipReasons: {
      "specialized": "Tickers use standard CRUD features"
    }
  },

  // Trading Accounts - Full CRUD
  "trading_accounts.html": {
    relevant: ["crud-e2e", "ui-table", "ui-modal", "init-monitoring", "sorting-testing", "defaults-testing", "auth"],
    irrelevant: ["specialized"],
    skipReasons: {
      "specialized": "Accounts use standard CRUD features"
    }
  },

  // Notes - Full CRUD
  "notes.html": {
    relevant: ["crud-e2e", "ui-table", "ui-modal", "init-monitoring", "sorting-testing", "defaults-testing", "auth"],
    irrelevant: ["specialized"],
    skipReasons: {
      "specialized": "Notes use standard CRUD features"
    }
  },

  // Cash Flows - Read-heavy
  "cash_flows.html": {
    relevant: ["ui-table", "sorting-testing", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-modal", "defaults-testing", "specialized"],
    skipReasons: {
      "crud-e2e": "Cash flows are read-only (financial reports)",
      "ui-modal": "Cash flows don't have edit/create modals",
      "defaults-testing": "Cash flows show historical data",
      "specialized": "Cash flows use standard table features"
    }
  },

  // Trade History - Read-only historical
  "trade_history.html": {
    relevant: ["ui-table", "sorting-testing", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-modal", "defaults-testing", "specialized"],
    skipReasons: {
      "crud-e2e": "Trade history is read-only",
      "ui-modal": "No editing of historical trades",
      "defaults-testing": "Historical data, not defaults",
      "specialized": "Standard table features"
    }
  },

  // Trading Journal - Notes-style specialized
  "trading_journal.html": {
    relevant: ["specialized", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing"],
    skipReasons: {
      "crud-e2e": "Journal uses notes-style interface, not CRUD",
      "ui-table": "Journal uses timeline/notes layout",
      "ui-modal": "Journal has inline editing",
      "sorting-testing": "Journal uses timeline sorting",
      "defaults-testing": "Journal has custom defaults"
    }
  },

  // AI Analysis - Specialized AI features
  "ai_analysis.html": {
    relevant: ["specialized", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing"],
    skipReasons: {
      "crud-e2e": "AI Analysis has no CRUD operations",
      "ui-table": "AI uses wizard/analysis interface",
      "ui-modal": "AI uses inline analysis",
      "sorting-testing": "AI results are not sortable",
      "defaults-testing": "AI has specific configuration, not defaults"
    }
  },

  // Watch Lists - CRUD + specialized defaults
  "watch_lists.html": {
    relevant: ["crud-specialized", "ui-table", "ui-modal", "init-monitoring", "sorting-testing", "defaults-testing", "auth"],
    irrelevant: [],
    skipReasons: {}
  },

  // User Profile - User-specific settings
  "user_profile.html": {
    relevant: ["init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing", "specialized"],
    skipReasons: {
      "crud-e2e": "Profile manages single user record",
      "ui-table": "Profile uses form layout",
      "ui-modal": "Profile has no modals",
      "sorting-testing": "No sortable data",
      "defaults-testing": "Profile has user preferences, not defaults",
      "specialized": "Profile is standard user management"
    }
  },

  // User Management - Admin CRUD
  "user_management.html": {
    relevant: ["admin-crud", "ui-table", "ui-modal", "init-monitoring", "sorting-testing", "auth"],
    irrelevant: ["crud-e2e", "defaults-testing", "specialized"],
    skipReasons: {
      "crud-e2e": "User management requires admin permissions",
      "defaults-testing": "Users have individual settings",
      "specialized": "Standard admin CRUD"
    }
  },

  // Ticker Dashboard - UI/Visualization focused
  "ticker_dashboard.html": {
    relevant: ["ui-specialized", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing"],
    skipReasons: {
      "crud-e2e": "Dashboard is read-only visualization",
      "ui-table": "Dashboard uses charts/widgets",
      "ui-modal": "Dashboard has no modals",
      "sorting-testing": "Dashboard data is not sortable",
      "defaults-testing": "Dashboard shows current data"
    }
  },

  // Portfolio State - Analysis/Dashboard
  "portfolio_state.html": {
    relevant: ["ui-specialized", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing", "specialized"],
    skipReasons: {
      "crud-e2e": "Portfolio state is read-only analysis",
      "ui-table": "Portfolio uses charts/summaries",
      "ui-modal": "No modals in portfolio view",
      "sorting-testing": "Portfolio data is aggregated",
      "defaults-testing": "Shows current portfolio state",
      "specialized": "Standard portfolio analysis"
    }
  },

  // Data Import - Admin specialized
  "data_import.html": {
    relevant: ["admin-import", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing", "specialized"],
    skipReasons: {
      "crud-e2e": "Import is specialized workflow, not CRUD",
      "ui-table": "Import uses wizard/file interface",
      "ui-modal": "Import has inline workflow",
      "sorting-testing": "Import data is processed",
      "defaults-testing": "Import has configuration, not defaults",
      "specialized": "Import is specialized admin function"
    }
  },

  // Strategy Analysis - Admin analysis
  "strategy_analysis.html": {
    relevant: ["admin-analysis", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing", "specialized"],
    skipReasons: {
      "crud-e2e": "Strategy analysis is read-only",
      "ui-table": "Strategy uses charts/analysis",
      "ui-modal": "Strategy has inline analysis",
      "sorting-testing": "Strategy data is analyzed",
      "defaults-testing": "Strategy shows analysis results",
      "specialized": "Strategy analysis is specialized"
    }
  },

  // Preferences - Configuration
  "preferences.html": {
    relevant: ["init-preferences", "init-monitoring", "auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing", "specialized"],
    skipReasons: {
      "crud-e2e": "Preferences manage single config record",
      "ui-table": "Preferences use form layout",
      "ui-modal": "Preferences has inline editing",
      "sorting-testing": "No sortable data",
      "defaults-testing": "Preferences ARE the defaults",
      "specialized": "Preferences is standard configuration"
    }
  },

  // Tag Management - Full CRUD
  "tag_management.html": {
    relevant: ["crud-e2e", "ui-table", "ui-modal", "init-monitoring", "sorting-testing", "defaults-testing", "auth"],
    irrelevant: ["specialized"],
    skipReasons: {
      "specialized": "Tags use standard CRUD features"
    }
  },

  // ===== Authentication Pages =====
  // These typically only need basic auth tests

  "login.html": {
    relevant: ["auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing", "init-monitoring", "specialized"],
    skipReasons: {
      "crud-e2e": "Login has no CRUD operations",
      "ui-table": "Login uses form only",
      "ui-modal": "Login has no modals",
      "sorting-testing": "No data to sort",
      "defaults-testing": "Login has no defaults",
      "init-monitoring": "Login is static page",
      "specialized": "Login is standard auth"
    }
  },

  "register.html": {
    relevant: ["auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing", "init-monitoring", "specialized"],
    skipReasons: {
      "crud-e2e": "Registration creates user account",
      "ui-table": "Registration uses form only",
      "ui-modal": "Registration has no modals",
      "sorting-testing": "No data to sort",
      "defaults-testing": "Registration has no defaults",
      "init-monitoring": "Registration is static page",
      "specialized": "Registration is standard auth"
    }
  },

  "forgot_password.html": {
    relevant: ["auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing", "init-monitoring", "specialized"],
    skipReasons: {
      "crud-e2e": "Password reset has no CRUD",
      "ui-table": "Password reset uses form only",
      "ui-modal": "Password reset has no modals",
      "sorting-testing": "No data to sort",
      "defaults-testing": "No defaults",
      "init-monitoring": "Static page",
      "specialized": "Standard auth flow"
    }
  },

  "reset_password.html": {
    relevant: ["auth"],
    irrelevant: ["crud-e2e", "ui-table", "ui-modal", "sorting-testing", "defaults-testing", "init-monitoring", "specialized"],
    skipReasons: {
      "crud-e2e": "Password reset has no CRUD",
      "ui-table": "Password reset uses form only",
      "ui-modal": "Password reset has no modals",
      "sorting-testing": "No data to sort",
      "defaults-testing": "No defaults",
      "init-monitoring": "Static page",
      "specialized": "Standard auth flow"
    }
  }
};

// ===== Utility Functions =====

/**
 * Get relevancy rules for a specific page
 */
function getRelevancyForPage(page) {
  return RELEVANCY_RULES[page] || {
    relevant: [],
    irrelevant: [],
    skipReasons: {}
  };
}

/**
 * Check if a test category is relevant for a page
 */
function isCategoryRelevantForPage(category, page) {
  const rules = getRelevancyForPage(page);
  return rules.relevant.includes(category);
}

/**
 * Check if a test category is irrelevant for a page
 */
function isCategoryIrrelevantForPage(category, page) {
  const rules = getRelevancyForPage(page);
  return rules.irrelevant.includes(category);
}

/**
 * Get skip reason for irrelevant test category
 */
function getSkipReason(category, page) {
  const rules = getRelevancyForPage(page);
  return rules.skipReasons[category] || "Not relevant for this page";
}

/**
 * Filter tests by relevancy for a specific page
 */
function filterRelevantTests(tests, page) {
  return tests.filter(test => {
    return isCategoryRelevantForPage(test.category, page);
  });
}

/**
 * Mark tests as skipped if irrelevant for page
 */
function markIrrelevantTests(tests, page) {
  return tests.map(test => {
    if (isCategoryIrrelevantForPage(test.category, page)) {
      return {
        ...test,
        status: 'skipped',
        skipReason: getSkipReason(test.category, page)
      };
    }
    return test;
  });
}

// Export for browser usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RELEVANCY_RULES,
    getRelevancyForPage,
    isCategoryRelevantForPage,
    isCategoryIrrelevantForPage,
    getSkipReason,
    filterRelevantTests,
    markIrrelevantTests
  };
} else {
  window.TestRelevancyRules = {
    RELEVANCY_RULES,
    getRelevancyForPage,
    isCategoryRelevantForPage,
    isCategoryIrrelevantForPage,
    getSkipReason,
    filterRelevantTests,
    markIrrelevantTests
  };
}
