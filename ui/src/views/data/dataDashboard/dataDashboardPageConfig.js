/**
 * Data Dashboard Page Config - UAI Configuration
 * --------------------------------------------------------
 * דשבורד נתונים — תבנית בלבד (ללא לוגיקה/API)
 * מקושר מכפתור "נתונים" בתפריט
 */

window.UAI = window.UAI || {};

window.UAI.config = {
  pageType: 'dataDashboard',
  requiresAuth: true,
  requiresHeader: true,
  components: [],
  metadata: {
    title: 'דשבורד נתונים',
    description: 'דף דשבורד — תצוגת סיכום נתונים',
    version: '1.0.0',
  },
};
