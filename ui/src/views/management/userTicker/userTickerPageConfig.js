/**
 * User Ticker Page Config - הטיקרים שלי
 * --------------------------------------------------------
 * Configuration for "My Tickers" page
 * Data source: GET /me/tickers (Team 20)
 */

window.UAI = window.UAI || {};

window.UAI.config = {
  pageType: 'userTicker',
  requiresAuth: true,
  requiresHeader: true,
  dataEndpoints: ['/me/tickers'],
  tableInit: '/src/views/management/userTicker/userTickerTableInit.js',
  components: ['table', 'summary', 'pagination', 'actions'],
  tables: [
    {
      id: 'userTickersTable',
      type: 'user_tickers',
      pageSize: 25,
      sortable: true,
      filterable: false,
    },
  ],
  summary: {
    enabled: true,
  },
  metadata: {
    title: 'הטיקרים שלי',
    description: 'ניהול הטיקרים שלי - הוספה והסרה',
    version: '1.0.0',
  },
};
