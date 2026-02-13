/**
 * Tickers Page Config - UAI Configuration
 * --------------------------------------------------------
 * Configuration for Tickers Management page
 * @description ניהול טיקרים - CRUD
 */

window.UAI = window.UAI || {};

window.UAI.config = {
  pageType: 'tickers',
  requiresAuth: true,
  requiresHeader: true,
  dataEndpoints: ['tickers', 'tickers/summary'],
  tableInit: '/src/views/management/tickers/tickersTableInit.js',
  components: ['table', 'summary', 'pagination', 'actions'],
  tables: [
    {
      id: 'tickersTable',
      type: 'tickers',
      pageSize: 25,
      sortable: true,
      filterable: true,
    },
  ],
  summary: {
    enabled: true,
    endpoint: 'tickers/summary',
  },
  metadata: {
    title: 'ניהול טיקרים',
    description: 'ניהול טיקרים במערכת',
    version: '1.0.0',
  },
};
