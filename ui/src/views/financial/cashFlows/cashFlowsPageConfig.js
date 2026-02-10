/**
 * Cash Flows Page Config - UAI Configuration
 * --------------------------------------------------------
 * External JS file for UAI Config (Hybrid Scripts Policy Compliance)
 * 
 * @description Configuration for Cash Flows page using UAI (Unified App Init)
 * @version v1.0.0
 */

// Initialize UAI namespace if not exists
window.UAI = window.UAI || {};

// Set config
window.UAI.config = {
  // Required fields
  pageType: 'cashFlows',
  requiresAuth: true,
  requiresHeader: true,
  
  // Data configuration
  dataEndpoints: [
    'cash_flows',
    'cash_flows/currency_conversions',
    'cash_flows/summary'
  ],
  dataLoader: '/src/views/financial/cashFlows/cashFlowsDataLoader.js',
  
  // Component initialization
  tableInit: '/src/views/financial/cashFlows/cashFlowsTableInit.js',
  headerHandlers: '/src/views/financial/cashFlows/cashFlowsHeaderHandlers.js',
  
  // Components
  components: ['table', 'filter', 'summary', 'pagination', 'actions'],
  
  // Filters (SSOT v1.2.0 — Filter Keys Lock: D21 internal = flowType; global = tradingAccount, dateRange, search)
  filters: {
    internal: ['flowType'],
    global: ['tradingAccount', 'dateRange', 'search']
  },
  
  // Tables
  tables: [
    {
      id: 'cashFlowsTable',
      type: 'cash_flows',
      pageSize: 25,
      sortable: true,
      filterable: true
    },
    {
      id: 'currencyConversionsTable',
      type: 'currency_conversions',
      pageSize: 25,
      sortable: true,
      filterable: false
    }
  ],
  
  // Summary
  summary: {
    enabled: true,
    toggleEnabled: true,
    endpoint: 'cash_flows/summary'
  },
  
  // Metadata
  metadata: {
    title: 'תזרימי מזומנים',
    description: 'ניהול תזרימי מזומנים והמרות מטבע',
    version: '1.0.0'
  }
};
