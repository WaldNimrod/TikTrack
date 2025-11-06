/**
 * Unified Color Scheme System - Clean Version
 * מערכת מפתח צבעים מאוחדת - גרסה נקייה
 *
 * קובץ זה מגדיר את כל מפתחות הצבעים במערכת בצורה מאוחדת
 * ומאפשר שימוש עקבי בכל העמודים והמודולים
 *
 * @author TikTrack System
 * @version 2.1.0
 * @lastUpdated January 21, 2025
 * @since 2025-01-09
 */

// ===== ENTITY TYPE DEFINITIONS =====
const VALID_ENTITY_TYPES = [
  'trade', 'trade_plan', 'execution', 'account', 'cash_flow',
  'ticker', 'alert', 'note', 'constraint', 'design', 'research', 'preference'
];

// ===== COLOR DEFINITIONS =====
const ENTITY_COLORS = {
  trade: '#007bff',
  trade_plan: '#28a745',
  execution: '#17a2b8',
  account: '#6f42c1',
  cash_flow: '#fd7e14',
  ticker: '#20c997',
  alert: '#dc3545',
  note: '#6c757d',
  constraint: '#e83e8c',
  design: '#6f42c1',
  research: '#17a2b8',
  preference: '#28a745'
};

const ENTITY_BACKGROUND_COLORS = {
  trade: 'rgba(0, 123, 255, 0.1)',
  trade_plan: 'rgba(40, 167, 69, 0.1)',
  execution: 'rgba(23, 162, 184, 0.1)',
  account: 'rgba(111, 66, 193, 0.1)',
  cash_flow: 'rgba(253, 126, 20, 0.1)',
  ticker: 'rgba(32, 201, 151, 0.1)',
  alert: 'rgba(220, 53, 69, 0.1)',
  note: 'rgba(108, 117, 125, 0.1)',
  constraint: 'rgba(232, 62, 140, 0.1)',
  design: 'rgba(111, 66, 193, 0.1)',
  research: 'rgba(23, 162, 184, 0.1)',
  preference: 'rgba(40, 167, 69, 0.1)'
};

const ENTITY_TEXT_COLORS = {
  trade: '#0056b3',
  trade_plan: '#1e7e34',
  execution: '#117a8b',
  account: '#59359a',
  cash_flow: '#e55100',
  ticker: '#1a9d7a',
  alert: '#c82333',
  note: '#495057',
  constraint: '#d91a72',
  design: '#59359a',
  research: '#117a8b',
  preference: '#1e7e34'
};

const ENTITY_BORDER_COLORS = {
  trade: 'rgba(0, 123, 255, 0.3)',
  trade_plan: 'rgba(40, 167, 69, 0.3)',
  execution: 'rgba(23, 162, 184, 0.3)',
  account: 'rgba(111, 66, 193, 0.3)',
  cash_flow: 'rgba(253, 126, 20, 0.3)',
  ticker: 'rgba(32, 201, 151, 0.3)',
  alert: 'rgba(220, 53, 69, 0.3)',
  note: 'rgba(108, 117, 125, 0.3)',
  constraint: 'rgba(232, 62, 140, 0.3)',
  design: 'rgba(111, 66, 193, 0.3)',
  research: 'rgba(23, 162, 184, 0.3)',
  preference: 'rgba(40, 167, 69, 0.3)'
};

const STATUS_COLORS = {
  active: '#28a745',
  inactive: '#6c757d',
  pending: '#ffc107',
  completed: '#17a2b8',
  cancelled: '#dc3545',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  success: '#28a745'
};

const INVESTMENT_TYPE_COLORS = {
  swing: {
    medium: '#007bff',
    light: 'rgba(0, 123, 255, 0.1)',
    border: 'rgba(0, 123, 255, 0.3)'
  },
  day: {
    medium: '#28a745',
    light: 'rgba(40, 167, 69, 0.1)',
    border: 'rgba(40, 167, 69, 0.3)'
  },
  scalping: {
    medium: '#dc3545',
    light: 'rgba(220, 53, 69, 0.1)',
    border: 'rgba(220, 53, 69, 0.3)'
  }
};

const NUMERIC_VALUE_COLORS = {
  positive: {
    medium: '#28a745',
    light: 'rgba(40, 167, 69, 0.1)',
    border: 'rgba(40, 167, 69, 0.3)'
  },
  negative: {
    medium: '#dc3545',
    light: 'rgba(220, 53, 69, 0.1)',
    border: 'rgba(220, 53, 69, 0.3)'
  },
  zero: {
    medium: '#6c757d',
    light: 'rgba(108, 117, 125, 0.1)',
    border: 'rgba(108, 117, 125, 0.3)'
  }
};

// ===== UTILITY FUNCTIONS =====
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function darkenColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = (100 - percent) / 100;
  return `rgb(${Math.round(rgb.r * factor)}, ${Math.round(rgb.g * factor)}, ${Math.round(rgb.b * factor)})`;
}

// ===== ENTITY COLOR FUNCTIONS =====
function getEntityColor(entityType) {
  return ENTITY_COLORS[entityType] || ENTITY_COLORS.trade;
}

function getEntityBackgroundColor(entityType) {
  return ENTITY_BACKGROUND_COLORS[entityType] || ENTITY_BACKGROUND_COLORS.trade;
}

function getEntityTextColor(entityType) {
  return ENTITY_TEXT_COLORS[entityType] || ENTITY_TEXT_COLORS.trade;
}

function getEntityBorderColor(entityType) {
  return ENTITY_BORDER_COLORS[entityType] || ENTITY_BORDER_COLORS.trade;
}

function isValidEntityType(entityType) {
  return VALID_ENTITY_TYPES.includes(entityType);
}

function getEntityLabel(entityType) {
  const labels = {
    trade: 'טרייד',
    trade_plan: 'תכנית השקעה',
    execution: 'עסקה',
    account: 'חשבון מסחר',
    cash_flow: 'תזרים מזומנים',
    ticker: 'טיקר',
    alert: 'התראה',
    note: 'הערה',
    constraint: 'אילוץ',
    design: 'עיצוב',
    research: 'מחקר',
    preference: 'העדפה'
  };
  return labels[entityType] || entityType;
}

// ===== STATUS COLOR FUNCTIONS =====
function getStatusColor(status, intensity = 'medium') {
  return STATUS_COLORS[status] || STATUS_COLORS.active;
}

function getStatusBackgroundColor(status) {
  const color = getStatusColor(status);
  return color.replace('rgb', 'rgba').replace(')', ', 0.1)');
}

function getStatusTextColor(status) {
  return getStatusColor(status);
}

function getStatusBorderColor(status) {
  const color = getStatusColor(status);
  return color.replace('rgb', 'rgba').replace(')', ', 0.3)');
}

// ===== INVESTMENT TYPE FUNCTIONS =====
function getInvestmentTypeColor(investmentType, intensity = 'medium') {
  const normalizedType = investmentType?.toLowerCase() || 'swing';
  return INVESTMENT_TYPE_COLORS[normalizedType]?.[intensity] || INVESTMENT_TYPE_COLORS.swing[intensity];
}

function getInvestmentTypeBackgroundColor(investmentType) {
  return getInvestmentTypeColor(investmentType, 'light');
}

function getInvestmentTypeTextColor(investmentType) {
  return getInvestmentTypeColor(investmentType, 'medium');
}

function getInvestmentTypeBorderColor(investmentType) {
  return getInvestmentTypeColor(investmentType, 'border');
}

// ===== NUMERIC VALUE FUNCTIONS =====
function getNumericValueColor(value, colorType = 'medium') {
  if (value > 0) {
    return NUMERIC_VALUE_COLORS.positive[colorType] || NUMERIC_VALUE_COLORS.positive.medium;
  } else if (value < 0) {
    return NUMERIC_VALUE_COLORS.negative[colorType] || NUMERIC_VALUE_COLORS.negative.medium;
  } else {
    return NUMERIC_VALUE_COLORS.zero[colorType] || NUMERIC_VALUE_COLORS.zero.medium;
  }
}

function getNumericValueBackgroundColor(value) {
  return getNumericValueColor(value, 'light');
}

function getNumericValueTextColor(value) {
  return getNumericValueColor(value, 'medium');
}

function getNumericValueBorderColor(value) {
  return getNumericValueColor(value, 'border');
}

function isPositiveValue(value) {
  return value > 0;
}

function isNegativeValue(value) {
  return value < 0;
}

function isZeroValue(value) {
  return value === 0;
}

function getValueType(value) {
  if (isPositiveValue(value)) return 'positive';
  if (isNegativeValue(value)) return 'negative';
  return 'zero';
}

function getNumericValueCSSClass(value) {
  return `numeric-${getValueType(value)}`;
}

// ===== CSS GENERATION FUNCTIONS =====
function generateEntityCSS() {
  let css = '';
  Object.keys(ENTITY_COLORS).forEach(entityType => {
    css += `
      .entity-${entityType} {
        color: ${getEntityTextColor(entityType)};
        background-color: ${getEntityBackgroundColor(entityType)};
        border-color: ${getEntityBorderColor(entityType)};
      }
    `;
  });
  return css;
}

function generateStatusCSS() {
  let css = '';
  Object.keys(STATUS_COLORS).forEach(status => {
    css += `
      .status-${status} {
        color: ${getStatusTextColor(status)};
        background-color: ${getStatusBackgroundColor(status)};
        border-color: ${getStatusBorderColor(status)};
      }
    `;
  });
  return css;
}

function generateInvestmentTypeCSS() {
  let css = '';
  Object.keys(INVESTMENT_TYPE_COLORS).forEach(type => {
    const colors = INVESTMENT_TYPE_COLORS[type];
    css += `
      .investment-${type} {
        color: ${colors.medium};
        background-color: ${colors.light};
        border-color: ${colors.border};
      }
    `;
  });
  return css;
}

function generateNumericValueCSS() {
  return `
    .numeric-positive {
      color: ${NUMERIC_VALUE_COLORS.positive.medium};
      background-color: ${NUMERIC_VALUE_COLORS.positive.light};
      border-color: ${NUMERIC_VALUE_COLORS.positive.border};
    }
    .numeric-negative {
      color: ${NUMERIC_VALUE_COLORS.negative.medium};
      background-color: ${NUMERIC_VALUE_COLORS.negative.light};
      border-color: ${NUMERIC_VALUE_COLORS.negative.border};
    }
    .numeric-zero {
      color: ${NUMERIC_VALUE_COLORS.zero.medium};
      background-color: ${NUMERIC_VALUE_COLORS.zero.light};
      border-color: ${NUMERIC_VALUE_COLORS.zero.border};
    }
  `;
}

// ===== COLOR SCHEME FUNCTIONS =====
function applyColorScheme(schemeName = 'light', customColors = null) {
  try {
    console.log(`🎨 Applying color scheme: ${schemeName}`);
    
    // Remove existing scheme classes
    document.body.classList.remove('light-scheme', 'dark-scheme', 'custom-scheme');
    
    // Apply new scheme
    document.body.classList.add(`${schemeName}-scheme`);
    
    // Store current scheme
    localStorage.setItem('colorScheme', schemeName);
    
    // Apply scheme-specific colors
    switch (schemeName) {
      case 'light':
        applyLightScheme();
        break;
      case 'dark':
        applyDarkScheme();
        break;
      case 'custom':
        if (customColors) {
          applyCustomScheme(customColors);
        }
        break;
      default:
        console.warn(`⚠️ Unknown color scheme: ${schemeName}`);
        applyLightScheme();
    }
    
    // Update CSS variables
    updateCSSVariablesFromPreferences(window.currentPreferences || {});
    
    // Dispatch event for other systems
    window.dispatchEvent(new CustomEvent('colorSchemeChanged', {
      detail: { scheme: schemeName, customColors }
    }));
    
  } catch (error) {
    console.error('❌ Error applying color scheme:', error);
  }
}

function applyLightScheme() {
  // Apply light theme colors
  document.documentElement.style.setProperty('--primary-color', '#007bff');
  document.documentElement.style.setProperty('--secondary-color', '#6c757d');
  document.documentElement.style.setProperty('--success-color', '#28a745');
  document.documentElement.style.setProperty('--danger-color', '#dc3545');
  document.documentElement.style.setProperty('--warning-color', '#ffc107');
  document.documentElement.style.setProperty('--info-color', '#17a2b8');
}

function applyDarkScheme() {
  // Apply dark theme colors
  document.documentElement.style.setProperty('--primary-color', '#0d6efd');
  document.documentElement.style.setProperty('--secondary-color', '#6c757d');
  document.documentElement.style.setProperty('--success-color', '#198754');
  document.documentElement.style.setProperty('--danger-color', '#dc3545');
  document.documentElement.style.setProperty('--warning-color', '#ffc107');
  document.documentElement.style.setProperty('--info-color', '#0dcaf0');
}

function applyCustomScheme(customColors) {
  try {
    console.log('🎨 Applying custom color scheme');
    
    // Apply custom colors to CSS variables
    Object.entries(customColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--custom-${key}`, value);
    });
    
  } catch (error) {
    console.error('❌ Error applying custom scheme:', error);
  }
}

function toggleColorScheme() {
  const currentScheme = getCurrentColorScheme();
  const newScheme = currentScheme === 'light' ? 'dark' : 'light';
  applyColorScheme(newScheme);
}

function loadColorScheme() {
  const savedScheme = localStorage.getItem('colorScheme') || 'light';
  applyColorScheme(savedScheme);
}

function saveColorScheme(schemeName, customColors = null) {
  localStorage.setItem('colorScheme', schemeName);
  if (customColors) {
    localStorage.setItem('customColors', JSON.stringify(customColors));
  }
}

function getCurrentColorScheme() {
  return localStorage.getItem('colorScheme') || 'light';
}

function getAvailableColorSchemes() {
  return [
    { name: 'light', label: 'בהיר', description: 'סכמת צבעים בהירה' },
    { name: 'dark', label: 'כהה', description: 'סכמת צבעים כהה' },
    { name: 'custom', label: 'מותאם אישית', description: 'סכמת צבעים מותאמת אישית' }
  ];
}

// ===== DYNAMIC COLORS LOADER =====
async function loadDynamicColors() {
  try {
    // Load color scheme from preferences
    if (typeof window.loadColorScheme === 'function') {
      await window.loadColorScheme();
    }
    
    // Apply current color scheme
    if (typeof window.applyColorScheme === 'function') {
      window.applyColorScheme();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error loading dynamic colors:', error);
    return false;
  }
}

// ===== PAGE ENTITY COLOR FUNCTIONS =====
async function setCurrentEntityColorFromPage() {
  try {
    const body = document.body;
    if (!body) return;
    
    const pageClass = findPageClass(body);
    if (pageClass) {
      const entityType = pageClass.replace('-page', '');
      if (isValidEntityType(entityType)) {
        await getEntityColorFromPreferences(entityType);
      }
    }
  } catch (error) {
    console.error('❌ Error setting current entity color:', error);
  }
}

function findPageClass(body) {
  const classList = Array.from(body.classList);
  return classList.find(cls => cls.endsWith('-page'));
}

async function getEntityColorFromPreferences(entityType, variant = 'primary') {
  try {
    if (!isValidEntityType(entityType)) {
      console.warn(`⚠️ Invalid entity type: ${entityType}`);
      return;
    }
    
    // Load preferences and apply colors
    const preferences = await loadColorPreferences();
    if (preferences && preferences.colorScheme) {
      updateEntityColors(preferences);
    }
  } catch (error) {
    console.error('❌ Error getting entity color from preferences:', error);
  }
}

async function getAllEntityColorVariantsFromPreferences(entityType) {
  try {
    const preferences = await loadColorPreferences();
    if (preferences && preferences.colorScheme && preferences.colorScheme.entities) {
      return preferences.colorScheme.entities[entityType] || {};
    }
    return {};
  } catch (error) {
    console.error('❌ Error getting all entity color variants:', error);
    return {};
  }
}

// ===== PREFERENCES FUNCTIONS =====
async function loadColorPreferences() {
  try {
    // This would typically load from the preferences API
    // For now, return default preferences
    return {
      colorScheme: {
        entities: ENTITY_COLORS,
        statuses: STATUS_COLORS,
        investmentTypes: INVESTMENT_TYPE_COLORS,
        numericValues: NUMERIC_VALUE_COLORS
      }
    };
  } catch (error) {
    console.error('❌ Error loading color preferences:', error);
    return null;
  }
}

function updateEntityColors(preferences) {
  try {
    if (preferences && preferences.colorScheme && preferences.colorScheme.entities) {
      Object.assign(ENTITY_COLORS, preferences.colorScheme.entities);
    }
  } catch (error) {
    console.error('❌ Error updating entity colors:', error);
  }
}

function updateCSSVariablesFromPreferences(preferences) {
  try {
    if (preferences && preferences.colorScheme) {
      // Update CSS variables based on preferences
      if (preferences.colorScheme.entities) {
        Object.entries(preferences.colorScheme.entities).forEach(([entityType, color]) => {
          document.documentElement.style.setProperty(`--entity-${entityType}-color`, color);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error updating CSS variables from preferences:', error);
  }
}

// ===== GLOBAL EXPORTS =====
window.colorSchemeSystem = {
  // Entity functions
  getColor: getEntityColor,
  getBackgroundColor: getEntityBackgroundColor,
  getTextColor: getEntityTextColor,
  getBorderColor: getEntityBorderColor,
  isValid: isValidEntityType,
  getLabel: getEntityLabel,
  
  // Status functions
  getStatusColor,
  getStatusBackgroundColor,
  getStatusTextColor,
  getStatusBorderColor,
  
  // Investment type functions
  getInvestmentTypeColor,
  getInvestmentTypeBackgroundColor,
  getInvestmentTypeTextColor,
  getInvestmentTypeBorderColor,
  
  // Numeric value functions
  getNumericValueColor,
  getNumericValueBackgroundColor,
  getNumericValueTextColor,
  getNumericValueBorderColor,
  isPositiveValue,
  isNegativeValue,
  isZeroValue,
  getValueType,
  getNumericValueCSSClass,
  
  // CSS generation functions
  generateEntityCSS,
  generateStatusCSS,
  generateInvestmentTypeCSS,
  generateNumericValueCSS,
  
  // Color scheme functions
  applyColorScheme,
  toggleColorScheme,
  loadColorScheme,
  saveColorScheme,
  getCurrentColorScheme,
  getAvailableColorSchemes,
  
  // Utility functions
  hexToRgb,
  darkenColor,
  
  // Constants
  VALID_ENTITY_TYPES,
  ENTITY_COLORS,
  ENTITY_BACKGROUND_COLORS,
  ENTITY_TEXT_COLORS,
  ENTITY_BORDER_COLORS,
  STATUS_COLORS,
  INVESTMENT_TYPE_COLORS,
  NUMERIC_VALUE_COLORS
};

// Export individual functions
window.applyColorScheme = applyColorScheme;
window.toggleColorScheme = toggleColorScheme;
window.loadColorScheme = loadColorScheme;
window.saveColorScheme = saveColorScheme;
window.getCurrentColorScheme = getCurrentColorScheme;
window.getAvailableColorSchemes = getAvailableColorSchemes;

window.getEntityColor = getEntityColor;
window.getEntityBackgroundColor = getEntityBackgroundColor;
window.getEntityTextColor = getEntityTextColor;
window.getEntityBorderColor = getEntityBorderColor;
window.isValidEntityType = isValidEntityType;
window.getEntityLabel = getEntityLabel;

window.getStatusColor = getStatusColor;
window.getStatusBackgroundColor = getStatusBackgroundColor;
window.getStatusTextColor = getStatusTextColor;
window.getStatusBorderColor = getStatusBorderColor;

window.getInvestmentTypeColor = getInvestmentTypeColor;
window.getInvestmentTypeBackgroundColor = getInvestmentTypeBackgroundColor;
window.getInvestmentTypeTextColor = getInvestmentTypeTextColor;
window.getInvestmentTypeBorderColor = getInvestmentTypeBorderColor;

window.getNumericValueColor = getNumericValueColor;
window.getNumericValueBackgroundColor = getNumericValueBackgroundColor;
window.getNumericValueTextColor = getNumericValueTextColor;
window.getNumericValueBorderColor = getNumericValueBorderColor;

window.generateEntityCSS = generateEntityCSS;
window.generateStatusCSS = generateStatusCSS;
window.generateInvestmentTypeCSS = generateInvestmentTypeCSS;
window.generateNumericValueCSS = generateNumericValueCSS;

window.loadDynamicColors = loadDynamicColors;
window.setCurrentEntityColorFromPage = setCurrentEntityColorFromPage;
window.getEntityColorFromPreferences = getEntityColorFromPreferences;
window.getAllEntityColorVariantsFromPreferences = getAllEntityColorVariantsFromPreferences;

// Export constants
window.VALID_ENTITY_TYPES = VALID_ENTITY_TYPES;
window.ENTITY_COLORS = ENTITY_COLORS;
window.ENTITY_BACKGROUND_COLORS = ENTITY_BACKGROUND_COLORS;
window.ENTITY_TEXT_COLORS = ENTITY_TEXT_COLORS;
window.ENTITY_BORDER_COLORS = ENTITY_BORDER_COLORS;
window.STATUS_COLORS = STATUS_COLORS;
window.INVESTMENT_TYPE_COLORS = INVESTMENT_TYPE_COLORS;
window.NUMERIC_VALUE_COLORS = NUMERIC_VALUE_COLORS;

// Set current entity color when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setCurrentEntityColorFromPage());
} else {
  setCurrentEntityColorFromPage();
}

// Color Scheme System loaded successfully
window.colorSchemeSystemReady = true;
console.log('✅ Color Scheme System ready');
