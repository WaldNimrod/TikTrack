/**
 * Trading Accounts Page Config - UAI Configuration
 * --------------------------------------------------------
 * External JS file for UAI Config (Hybrid Scripts Policy Compliance)
 *
 * @description Configuration for Trading Accounts page using UAI (Unified App Init)
 * @version v1.0.0
 */

// Initialize UAI namespace if not exists
window.UAI = window.UAI || {};

// Set config
window.UAI.config = {
  // Required fields
  pageType: 'tradingAccounts',
  requiresAuth: true,
  requiresHeader: true,

  // Data configuration (SSOT v1.2.0: trading_accounts/summary REQUIRED - Backend implemented)
  dataEndpoints: ['trading_accounts', 'trading_accounts/summary'],
  dataLoader:
    '/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js',

  // Component initialization
  tableInit: '/src/views/financial/tradingAccounts/tradingAccountsTableInit.js',
  headerHandlers:
    '/src/views/financial/tradingAccounts/tradingAccountsHeaderHandlers.js',

  // Components
  components: ['table', 'filter', 'summary', 'pagination', 'actions'],

  // Filters (SSOT v1.2.0 — Filter Keys Lock: D16 all global, no internal)
  filters: {
    internal: [],
    global: [
      'status',
      'investmentType',
      'tradingAccount',
      'dateRange',
      'search',
    ],
  },

  // Tables
  tables: [
    {
      id: 'tradingAccountsTable',
      type: 'trading_accounts',
      pageSize: 25,
      sortable: true,
      filterable: true,
    },
  ],

  // Summary (SSOT v1.2.0: endpoint REQUIRED - Backend implemented)
  summary: {
    enabled: true,
    toggleEnabled: false,
    endpoint: 'trading_accounts/summary',
  },

  // Metadata
  metadata: {
    title: 'חשבונות מסחר',
    description: 'ניהול חשבונות מסחר',
    version: '1.0.0',
  },
};
