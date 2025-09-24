/**
 * Configuration Constants - Header System
 * קבועי הגדרות למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

const HEADER_CONFIG = {
  // הגדרות מערכת
  SYSTEM: {
    VERSION: '2.0.0',
    NAME: 'TikTrack Header System',
    DEBUG: false,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    AUTO_INIT: true,
    INIT_DELAY: 100, // מילישניות
    DESTROY_ON_UNLOAD: true
  },

  // הגדרות תפריט
  MENU: {
    AUTO_CLOSE_DELAY: 300, // מילישניות
    HOVER_DELAY: 150, // מילישניות
    ANIMATION_DURATION: 200, // מילישניות
    MAX_DEPTH: 3, // עומק מקסימלי של תפריטים
    RTL_SUPPORT: true,
    KEYBOARD_NAVIGATION: true,
    ARIA_SUPPORT: true
  },

  // הגדרות פילטרים
  FILTERS: {
    AUTO_APPLY_DELAY: 300, // מילישניות
    DEBOUNCE_DELAY: 150, // מילישניות
    SAVE_STATE: true,
    LOAD_STATE: true,
    RESET_ON_PAGE_LOAD: false,
    MULTI_SELECT: {
      STATUS: true,
      TYPE: true,
      ACCOUNT: true,
      DATE: false,
      SEARCH: false
    },
    DEFAULT_VALUES: {
      STATUS: [],
      TYPE: [],
      ACCOUNT: [],
      DATE: 'כל זמן',
      SEARCH: ''
    }
  },

  // הגדרות ניווט
  NAVIGATION: {
    UPDATE_URL: true,
    SAVE_STATE: true,
    LOAD_STATE: true,
    HIGHLIGHT_ACTIVE: true,
    SMOOTH_SCROLL: true,
    SCROLL_OFFSET: 0
  },

  // הגדרות מצב
  STATE: {
    STORAGE_TYPE: 'localStorage', // 'localStorage', 'sessionStorage', 'indexedDB', 'mixed'
    AUTO_SAVE: true,
    SAVE_INTERVAL: 5000, // מילישניות
    MAX_STATE_SIZE: 1024 * 1024, // 1MB
    COMPRESS_STATE: false,
    ENCRYPT_STATE: false
  },

  // הגדרות העדפות
  PREFERENCES: {
    AUTO_LOAD: true,
    AUTO_SAVE: true,
    SAVE_DELAY: 1000, // מילישניות
    SERVER_SYNC: true,
    SYNC_INTERVAL: 30000, // מילישניות
    FALLBACK_TO_DEFAULTS: true
  },

  // הגדרות תרגום
  TRANSLATION: {
    DEFAULT_LANGUAGE: 'he',
    SUPPORTED_LANGUAGES: ['he', 'en'],
    AUTO_DETECT: true,
    FALLBACK_LANGUAGE: 'en',
    CACHE_TRANSLATIONS: true,
    CACHE_SIZE: 1000 // מספר תרגומים מקסימלי
  },

  // הגדרות UI
  UI: {
    THEME: 'light', // 'light', 'dark', 'auto'
    ANIMATIONS: true,
    ANIMATION_DURATION: 200, // מילישניות
    RESPONSIVE: true,
    MOBILE_BREAKPOINT: 768, // פיקסלים
    TABLET_BREAKPOINT: 1024, // פיקסלים
    RTL_SUPPORT: true,
    HIGH_CONTRAST: false,
    REDUCED_MOTION: false
  },

  // הגדרות חשבונות
  ACCOUNTS: {
    AUTO_LOAD: true,
    CACHE_ACCOUNTS: true,
    CACHE_DURATION: 300000, // 5 דקות
    REFRESH_INTERVAL: 600000, // 10 דקות
    SHOW_INACTIVE: false,
    MAX_ACCOUNTS: 100
  },

  // הגדרות ביצועים
  PERFORMANCE: {
    LAZY_LOAD: true,
    VIRTUAL_SCROLLING: false,
    DEBOUNCE_SEARCH: true,
    THROTTLE_RESIZE: true,
    THROTTLE_SCROLL: true,
    MAX_RENDER_TIME: 16, // מילישניות (60 FPS)
    MEMORY_LIMIT: 50 * 1024 * 1024 // 50MB
  },

  // הגדרות שגיאות
  ERROR_HANDLING: {
    SHOW_ERRORS: true,
    LOG_ERRORS: true,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // מילישניות
    FALLBACK_MODE: true,
    GRACEFUL_DEGRADATION: true
  },

  // הגדרות נגישות
  ACCESSIBILITY: {
    ARIA_LABELS: true,
    KEYBOARD_NAVIGATION: true,
    SCREEN_READER_SUPPORT: true,
    HIGH_CONTRAST_MODE: false,
    FOCUS_INDICATORS: true,
    SKIP_LINKS: true
  },

  // הגדרות אבטחה
  SECURITY: {
    SANITIZE_INPUT: true,
    VALIDATE_DATA: true,
    CSP_COMPLIANT: true,
    XSS_PROTECTION: true,
    CSRF_PROTECTION: false
  },

  // הגדרות API
  API: {
    BASE_URL: '/api',
    TIMEOUT: 10000, // מילישניות
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // מילישניות
    CACHE_RESPONSES: true,
    CACHE_DURATION: 300000 // 5 דקות
  },

  // הגדרות לוגים
  LOGGING: {
    ENABLED: true,
    LEVEL: 'info',
    CONSOLE: true,
    REMOTE: false,
    REMOTE_URL: null,
    MAX_LOG_SIZE: 1000,
    LOG_ROTATION: true
  },

  // הגדרות בדיקות
  TESTING: {
    MOCK_DATA: false,
    MOCK_DELAY: 100, // מילישניות
    VERBOSE_LOGGING: false,
    PERFORMANCE_MONITORING: false,
    MEMORY_MONITORING: false
  }
};

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HEADER_CONFIG;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.HEADER_CONFIG = HEADER_CONFIG;
}

console.log('✅ HEADER_CONFIG נוצר ופועל');
