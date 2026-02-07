/**
 * Brokers Fees Page Config - UAI Configuration
 * --------------------------------------------------------
 * External JS file for UAI Config (Hybrid Scripts Policy Compliance)
 * 
 * @description Configuration for Brokers Fees page using UAI (Unified App Init)
 * @version v1.0.0
 */

// Initialize UAI namespace if not exists
window.UAI = window.UAI || {};

// Set config
window.UAI.config = {
  // Required fields
  pageType: 'brokersFees',
  requiresAuth: true,
  requiresHeader: true,
  
  // Data configuration
  dataEndpoints: [
    'brokers_fees',
    'brokers_fees/summary'
  ],
  dataLoader: '/src/views/financial/brokersFees/brokersFeesDataLoader.js',
  
  // Component initialization
  tableInit: '/src/views/financial/brokersFees/brokersFeesTableInit.js',
  headerHandlers: '/src/views/financial/brokersFees/brokersFeesHeaderHandlers.js',
  
  // Components
  components: ['table', 'filter', 'summary', 'pagination', 'actions'],
  
  // Filters
  filters: {
    internal: [],
    global: ['broker', 'commissionType', 'search']
  },
  
  // Tables
  tables: [
    {
      id: 'brokersTable',
      type: 'brokers_fees', // ✅ Fixed: brokers_fees (matches API/Entity)
      pageSize: 25,
      sortable: true,
      filterable: true
    }
  ],
  
  // Summary
  summary: {
    enabled: true,
    toggleEnabled: false,
    endpoint: 'brokers_fees/summary'
  },
  
  // Metadata
  metadata: {
    title: 'ברוקרים ועמלות',
    description: 'ניהול ברוקרים והגדרות עמלות',
    version: '1.0.0'
  }
};
