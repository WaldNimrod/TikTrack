/**
 * Unified Color Scheme System
 * מערכת מפתח צבעים מאוחדת
 *
 * קובץ זה מגדיר את כל מפתחות הצבעים במערכת בצורה מאוחדת
 * ומאפשר שימוש עקבי בכל העמודים והמודולים
 *
 * @author TikTrack System
 * @version 2.0.0
 * @since 2025-01-09
 */

// ===== ENTITY TYPE DEFINITIONS =====
// הגדרות סוגי ישויות במערכת

/**
 * סוגי ישויות תקפים במערכת
 * Valid entity types in the system
 */
const VALID_ENTITY_TYPES = [
  // Trading & Investment
  'trade',           // טריידים
  'trade_plan',      // תכנוני השקעה
  'execution',       // עסקאות

  // Financial
  'account',         // חשבונות
  'cash_flow',       // תזרים מזומנים

  // Market Data
  'ticker',          // טיקרים
  'alert',           // התראות

  // Documentation
  'note',            // הערות

  // System
  'constraint',      // אילוצים
  'design',          // עיצובים
  'research',        // מחקר
  'preference',       // העדפות
];

// ===== UNIFIED COLOR SCHEME =====
// מפתח צבעים מאוחד

/**
 * מפתח צבעים עיקרי לכל סוגי הישויות
 * Primary color scheme for all entity types
 */
const ENTITY_COLORS = {
  // Trading & Investment - כחולים
  'trade': '#007bff',           // כחול בהיר
  'trade_plan': '#0056b3',      // כחול כהה
  'execution': '#17a2b8',       // כחול טורקיז

  // Financial - ירוקים
  'account': '#28a745',         // ירוק בהיר
  'cash_flow': '#20c997',       // ירוק טורקיז

  // Market Data - אדומים וכתומים
  'ticker': '#dc3545',          // אדום
  'alert': '#ff9c05',           // כתום לוגו

  // Documentation - סגולים
  'note': '#6f42c1',            // סגול

  // System - אפורים
  'constraint': '#6c757d',      // אפור
  'design': '#495057',          // אפור כהה
  'research': '#343a40',        // אפור כהה מאוד
  'preference': '#adb5bd',       // אפור בהיר
};

/**
 * מפתח צבעי רקע שקופים
 * Transparent background colors
 */
const ENTITY_BACKGROUND_COLORS = {
  'trade': 'rgba(0, 123, 255, 0.1)',
  'trade_plan': 'rgba(0, 86, 179, 0.1)',
  'execution': 'rgba(23, 162, 184, 0.1)',
  'account': 'rgba(40, 167, 69, 0.1)',
  'cash_flow': 'rgba(32, 201, 151, 0.1)',
  'ticker': 'rgba(220, 53, 69, 0.1)',
  'alert': 'rgba(255, 156, 5, 0.1)',
  'note': 'rgba(111, 66, 193, 0.1)',
  'constraint': 'rgba(108, 117, 125, 0.1)',
  'design': 'rgba(73, 80, 87, 0.1)',
  'research': 'rgba(52, 58, 64, 0.1)',
  'preference': 'rgba(173, 181, 189, 0.1)',
};

/**
 * מפתח צבעי טקסט על רקע צבעוני
 * Text colors for colored backgrounds
 */
const ENTITY_TEXT_COLORS = {
  'trade': '#0056b3',
  'trade_plan': '#004085',
  'execution': '#138496',
  'account': '#1e7e34',
  'cash_flow': '#17a2b8',
  'ticker': '#c82333',
  'alert': '#e55a00',
  'note': '#5a32a3',
  'constraint': '#495057',
  'design': '#343a40',
  'research': '#212529',
  'preference': '#6c757d',
};

/**
 * מפתח צבעי גבולות
 * Border colors
 */
const ENTITY_BORDER_COLORS = {
  'trade': 'rgba(0, 123, 255, 0.3)',
  'trade_plan': 'rgba(0, 86, 179, 0.3)',
  'execution': 'rgba(23, 162, 184, 0.3)',
  'account': 'rgba(40, 167, 69, 0.3)',
  'cash_flow': 'rgba(32, 201, 151, 0.3)',
  'ticker': 'rgba(220, 53, 69, 0.3)',
  'alert': 'rgba(255, 156, 5, 0.3)',
  'note': 'rgba(111, 66, 193, 0.3)',
  'constraint': 'rgba(108, 117, 125, 0.3)',
  'design': 'rgba(73, 80, 87, 0.3)',
  'research': 'rgba(52, 58, 64, 0.3)',
  'preference': 'rgba(173, 181, 189, 0.3)',
};

// ===== INVESTMENT TYPE SPECIFIC COLORS =====
// צבעים ספציפיים לסוגי השקעה (לשמירה על תאימות לאחור)

/**
 * סוגי השקעה תקפים במערכת
 * Valid investment types in the system
 */
const VALID_INVESTMENT_TYPES = [
  'swing',      // השקעות סווינג - Swing Trading
  'investment', // השקעות ארוכות טווח - Long-term Investment
  'passive',     // השקעות פאסיביות - Passive Investment
];

/**
 * תרגום סוגי השקעה לעברית
 * Investment type translations to Hebrew
 */
const INVESTMENT_TYPE_LABELS = {
  'swing': 'סווינג',
  'investment': 'השקעה',
  'passive': 'פאסיבי',
};

/**
 * תיאור סוגי השקעה
 * Investment type descriptions
 */
const INVESTMENT_TYPE_DESCRIPTIONS = {
  'swing': 'מסחר לטווח קצר עד בינוני',
  'investment': 'השקעה ארוכת טווח',
  'passive': 'השקעה פאסיבית ללא פעילות מסחרית',
};

/**
 * מפתח צבעים לסוגי השקעה (מתאים לצבעי הישויות)
 * Investment type colors (matching entity colors)
 */
const INVESTMENT_TYPE_COLORS = {
  'swing': ENTITY_COLORS.trade,        // כחול - כמו טריידים
  'investment': ENTITY_COLORS.account, // ירוק - כמו חשבונות
  'passive': ENTITY_COLORS.note,        // סגול - כמו הערות
};

// ===== UTILITY FUNCTIONS =====
// פונקציות עזר

/**
 * קבלת צבע לישות
 * Get color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
function getEntityColor(entityType) {
  if (!entityType) {
    return '#6c757d'; // אפור לנתונים חסרים
  }

  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_COLORS[normalizedType] || '#6c757d';
}

/**
 * קבלת צבע רקע לישות
 * Get background color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
function getEntityBackgroundColor(entityType) {
  if (!entityType) {
    return 'rgba(108, 117, 125, 0.1)'; // אפור שקוף לנתונים חסרים
  }

  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_BACKGROUND_COLORS[normalizedType] || 'rgba(108, 117, 125, 0.1)';
}

/**
 * קבלת צבע טקסט לישות
 * Get text color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
function getEntityTextColor(entityType) {
  if (!entityType) {
    return '#495057'; // אפור כהה לנתונים חסרים
  }

  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_TEXT_COLORS[normalizedType] || '#495057';
}

/**
 * קבלת צבע גבול לישות
 * Get border color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
function getEntityBorderColor(entityType) {
  if (!entityType) {
    return 'rgba(108, 117, 125, 0.3)'; // אפור שקוף לנתונים חסרים
  }

  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_BORDER_COLORS[normalizedType] || 'rgba(108, 117, 125, 0.3)';
}

/**
 * בדיקה אם סוג ישות תקף
 * Check if entity type is valid
 *
 * @param {string} entityType - סוג הישות
 * @returns {boolean} האם תקף
 */
function isValidEntityType(entityType) {
  if (!entityType) {
    return false;
  }

  const normalizedType = entityType.toLowerCase().trim();
  return VALID_ENTITY_TYPES.includes(normalizedType);
}

/**
 * קבלת תרגום עברי לישות
 * Get Hebrew translation for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} התרגום העברי
 */
function getEntityLabel(entityType) {
  if (!entityType) {
    return 'לא מוגדר';
  }

  const normalizedType = entityType.toLowerCase().trim();

  // תרגומים ספציפיים
  const labels = {
    'trade': 'טרייד',
    'trade_plan': 'תכנון השקעה',
    'execution': 'עסקה',
    'account': 'חשבון',
    'cash_flow': 'תזרים מזומנים',
    'ticker': 'טיקר',
    'alert': 'התראה',
    'note': 'הערה',
    'constraint': 'אילוץ',
    'design': 'עיצוב',
    'research': 'מחקר',
    'preference': 'העדפה',
  };

  return labels[normalizedType] || entityType;
}

// ===== BACKWARD COMPATIBILITY FUNCTIONS =====
// פונקציות תאימות לאחור

/**
 * קבלת צבע לסוג השקעה (תאימות לאחור)
 * Get color for investment type (backward compatibility)
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeColor(investmentType) {
  if (!investmentType) {
    return '#6c757d'; // אפור לנתונים חסרים
  }

  const normalizedType = investmentType.toLowerCase().trim();
  return INVESTMENT_TYPE_COLORS[normalizedType] || '#6c757d';
}

/**
 * קבלת צבע רקע לסוג השקעה (תאימות לאחור)
 * Get background color for investment type (backward compatibility)
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeBackgroundColor(investmentType) {
  if (!investmentType) {
    return 'rgba(108, 117, 125, 0.1)'; // אפור שקוף לנתונים חסרים
  }

  const normalizedType = investmentType.toLowerCase().trim();
  const entityType = getInvestmentTypeEntityType(investmentType);
  return getEntityBackgroundColor(entityType);
}

/**
 * קבלת צבע טקסט לסוג השקעה (תאימות לאחור)
 * Get text color for investment type (backward compatibility)
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeTextColor(investmentType) {
  if (!investmentType) {
    return '#495057'; // אפור כהה לנתונים חסרים
  }

  const normalizedType = investmentType.toLowerCase().trim();
  const entityType = getInvestmentTypeEntityType(investmentType);
  return getEntityTextColor(entityType);
}

/**
 * קבלת צבע גבול לסוג השקעה (תאימות לאחור)
 * Get border color for investment type (backward compatibility)
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeBorderColor(investmentType) {
  if (!investmentType) {
    return 'rgba(108, 117, 125, 0.3)'; // אפור שקוף לנתונים חסרים
  }

  const normalizedType = investmentType.toLowerCase().trim();
  const entityType = getInvestmentTypeEntityType(investmentType);
  return getEntityBorderColor(entityType);
}

/**
 * מיפוי סוג השקעה לישות
 * Map investment type to entity type
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} סוג הישות
 */
function getInvestmentTypeEntityType(investmentType) {
  const mapping = {
    'swing': 'trade',
    'investment': 'account',
    'passive': 'note',
  };

  return mapping[investmentType] || 'trade';
}

// ===== CSS CLASS GENERATION =====
// יצירת מחלקות CSS

/**
 * יצירת מחלקות CSS לכל סוגי הישויות
 * Generate CSS classes for all entity types
 *
 * @returns {string} CSS classes
 */
function generateEntityCSS() {
  let css = '';

  VALID_ENTITY_TYPES.forEach(type => {
    const color = ENTITY_COLORS[type];
    const bgColor = ENTITY_BACKGROUND_COLORS[type];
    const borderColor = ENTITY_BORDER_COLORS[type];
    const textColor = ENTITY_TEXT_COLORS[type];

    css += `
.entity-${type} {
  background-color: ${bgColor} !important;
  border-color: ${borderColor} !important;
  color: ${textColor} !important;
}

.entity-${type}-badge {
  background-color: ${color} !important;
  color: white !important;
  border: 1px solid ${color} !important;
}

.entity-${type}-border {
  border-left: 4px solid ${color} !important;
}

.entity-${type}-text {
  color: ${color} !important;
}

.entity-${type}-header {
  background: linear-gradient(135deg, ${color}, ${darkenColor(color, 20)}) !important;
  color: white !important;
  border-bottom: 2px solid ${darkenColor(color, 20)} !important;
}
`;
  });

  // מחלקות לסוגי השקעה (תאימות לאחור)
  VALID_INVESTMENT_TYPES.forEach(type => {
    const entityType = getInvestmentTypeEntityType(type);
    const color = ENTITY_COLORS[entityType];
    const bgColor = ENTITY_BACKGROUND_COLORS[entityType];
    const borderColor = ENTITY_BORDER_COLORS[entityType];
    const textColor = ENTITY_TEXT_COLORS[entityType];

    css += `
.investment-type-${type} {
  background-color: ${bgColor} !important;
  border-color: ${borderColor} !important;
  color: ${textColor} !important;
}

.investment-type-${type}-badge {
  background-color: ${color} !important;
  color: white !important;
  border: 1px solid ${color} !important;
}

.investment-type-${type}-border {
  border-left: 4px solid ${color} !important;
}

.investment-type-${type}-text {
  color: ${color} !important;
}
`;
  });

  return css;
}

/**
 * הכהת צבע
 * Darken color
 *
 * @param {string} color - קוד הצבע
 * @param {number} percent - אחוז הכהה
 * @returns {string} צבע מוכהה
 */
function darkenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// ===== LEGEND GENERATION =====
// יצירת סולמות צבעים

/**
 * יצירת אלמנט סולם צבעים לכל הישויות
 * Create color legend element for all entities
 *
 * @param {Object} options - אפשרויות עיצוב
 * @returns {HTMLElement} אלמנט הסולם
 */
function createEntityLegend(options = {}) {
  const {
    title = '🎨 מפתח צבעים - סוגי ישויות:',
    containerClass = 'entity-color-legend',
    showDescriptions = false,
    compact = false,
    entityTypes = VALID_ENTITY_TYPES,
  } = options;

  const legendContainer = document.createElement('div');
  legendContainer.className = containerClass;
  legendContainer.style.cssText = `
    margin: 10px 0;
    padding: ${compact ? '6px 10px' : '8px 12px'};
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: ${compact ? '0.8em' : '0.85em'};
  `;

  const legendTitle = document.createElement('div');
  legendTitle.textContent = title;
  legendTitle.style.cssText = `
    font-weight: bold;
    margin-bottom: ${compact ? '6px' : '8px'};
    color: #495057;
  `;

  const legendItems = document.createElement('div');
  legendItems.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: ${compact ? '6px' : '8px'};
    align-items: center;
  `;

  entityTypes.forEach(type => {
    const color = ENTITY_COLORS[type];
    const label = getEntityLabel(type);

    const legendItem = document.createElement('span');
    legendItem.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: ${compact ? '1px 4px' : '2px 6px'};
      border-radius: 4px;
      background: white;
      border: 1px solid #dee2e6;
      font-size: ${compact ? '0.75em' : '0.8em'};
      cursor: help;
            title: ${type}`;

    const colorDot = document.createElement('span');
    colorDot.style.cssText = `
      width: ${compact ? '10px' : '12px'};
      height: ${compact ? '10px' : '12px'};
      border-radius: 50%;
      background-color: ${color};
      border: 1px solid #dee2e6;
    `;

    const labelText = document.createElement('span');
    labelText.textContent = label;

    legendItem.appendChild(colorDot);
    legendItem.appendChild(labelText);
    legendItems.appendChild(legendItem);
  });

  legendContainer.appendChild(legendTitle);
  legendContainer.appendChild(legendItems);

  return legendContainer;
}

/**
 * יצירת אלמנט סולם צבעים לסוגי השקעה (תאימות לאחור)
 * Create color legend element for investment types (backward compatibility)
 *
 * @param {Object} options - אפשרויות עיצוב
 * @returns {HTMLElement} אלמנט הסולם
 */
function createInvestmentTypeLegend(options = {}) {
  return createEntityLegend({
    title: '🎨 סולם צבעים - סוגי השקעה:',
    containerClass: 'investment-type-legend',
    entityTypes: VALID_INVESTMENT_TYPES,
    ...options,
  });
}

// ========================================
// 🎨 מערכת צבעים מאוחדת לערכים מספריים
// ========================================

/**
 * צבעים ברירת מחדל לערכים מספריים
 */
const NUMERIC_VALUE_COLORS = {
    positive: {
        light: '#d4edda',      // רקע בהיר לערכים חיוביים
        medium: '#28a745',     // טקסט לערכים חיוביים
        dark: '#155724',       // טקסט כהה לערכים חיוביים
        border: '#c3e6cb'      // גבול לערכים חיוביים
    },
    negative: {
        light: '#f8d7da',      // רקע בהיר לערכים שליליים
        medium: '#dc3545',     // טקסט לערכים שליליים
        dark: '#721c24',       // טקסט כהה לערכים שליליים
        border: '#f5c6cb'      // גבול לערכים שליליים
    },
    zero: {
        light: '#e2e3e5',      // רקע לערך אפס
        medium: '#6c757d',     // טקסט לערך אפס
        dark: '#383d41',       // טקסט כהה לערך אפס
        border: '#d6d8db'      // גבול לערך אפס
    }
};

/**
 * קבלת צבע לערך מספרי
 * @param {number} value - הערך המספרי
 * @param {string} colorType - סוג הצבע (light, medium, dark, border)
 * @returns {string} קוד הצבע
 */
function getNumericValueColor(value, colorType = 'medium') {
    if (value > 0) {
        return NUMERIC_VALUE_COLORS.positive[colorType] || NUMERIC_VALUE_COLORS.positive.medium;
    } else if (value < 0) {
        return NUMERIC_VALUE_COLORS.negative[colorType] || NUMERIC_VALUE_COLORS.negative.medium;
    } else {
        return NUMERIC_VALUE_COLORS.zero[colorType] || NUMERIC_VALUE_COLORS.zero.medium;
    }
}

/**
 * קבלת צבע רקע לערך מספרי
 * @param {number} value - הערך המספרי
 * @returns {string} קוד הצבע
 */
function getNumericValueBackgroundColor(value) {
    return getNumericValueColor(value, 'light');
}

/**
 * קבלת צבע טקסט לערך מספרי
 * @param {number} value - הערך המספרי
 * @returns {string} קוד הצבע
 */
function getNumericValueTextColor(value) {
    return getNumericValueColor(value, 'medium');
}

/**
 * קבלת צבע גבול לערך מספרי
 * @param {number} value - הערך המספרי
 * @returns {string} קוד הצבע
 */
function getNumericValueBorderColor(value) {
    return getNumericValueColor(value, 'border');
}

/**
 * קבלת צבע כהה לערך מספרי
 * @param {number} value - הערך המספרי
 * @returns {string} קוד הצבע
 */
function getNumericValueDarkColor(value) {
    return getNumericValueColor(value, 'dark');
}

/**
 * בדיקה אם ערך הוא חיובי
 * @param {number} value - הערך לבדיקה
 * @returns {boolean} true אם חיובי
 */
function isPositiveValue(value) {
    return value > 0;
}

/**
 * בדיקה אם ערך הוא שלילי
 * @param {number} value - הערך לבדיקה
 * @returns {boolean} true אם שלילי
 */
function isNegativeValue(value) {
    return value < 0;
}

/**
 * בדיקה אם ערך הוא אפס
 * @param {number} value - הערך לבדיקה
 * @returns {boolean} true אם אפס
 */
function isZeroValue(value) {
    return value === 0;
}

/**
 * קבלת סוג הערך (positive, negative, zero)
 * @param {number} value - הערך המספרי
 * @returns {string} סוג הערך
 */
function getValueType(value) {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'zero';
}

/**
 * קבלת CSS class לערך מספרי
 * @param {number} value - הערך המספרי
 * @returns {string} שם ה-CSS class
 */
function getNumericValueCSSClass(value) {
    const type = getValueType(value);
    return `numeric-value-${type}`;
}

/**
 * יצירת CSS דינמי לערכים מספריים
 * @returns {string} CSS דינמי
 */
function generateNumericValueCSS() {
    const css = `
        /* ערכים חיוביים */
        .numeric-value-positive {
            color: ${NUMERIC_VALUE_COLORS.positive.medium} !important;
            background-color: ${NUMERIC_VALUE_COLORS.positive.light} !important;
            border-color: ${NUMERIC_VALUE_COLORS.positive.border} !important;
        }
        
        .numeric-value-positive.text-only {
            color: ${NUMERIC_VALUE_COLORS.positive.medium} !important;
        }
        
        .numeric-value-positive.background-only {
            background-color: ${NUMERIC_VALUE_COLORS.positive.light} !important;
        }
        
        .numeric-value-positive.border-only {
            border-color: ${NUMERIC_VALUE_COLORS.positive.border} !important;
        }
        
        /* ערכים שליליים */
        .numeric-value-negative {
            color: ${NUMERIC_VALUE_COLORS.negative.medium} !important;
            background-color: ${NUMERIC_VALUE_COLORS.negative.light} !important;
            border-color: ${NUMERIC_VALUE_COLORS.negative.border} !important;
        }
        
        .numeric-value-negative.text-only {
            color: ${NUMERIC_VALUE_COLORS.negative.medium} !important;
        }
        
        .numeric-value-negative.background-only {
            background-color: ${NUMERIC_VALUE_COLORS.negative.light} !important;
        }
        
        .numeric-value-negative.border-only {
            border-color: ${NUMERIC_VALUE_COLORS.negative.border} !important;
        }
        
        /* ערך אפס */
        .numeric-value-zero {
            color: ${NUMERIC_VALUE_COLORS.zero.medium} !important;
            background-color: ${NUMERIC_VALUE_COLORS.zero.light} !important;
            border-color: ${NUMERIC_VALUE_COLORS.zero.border} !important;
        }
        
        .numeric-value-zero.text-only {
            color: ${NUMERIC_VALUE_COLORS.zero.medium} !important;
        }
        
        .numeric-value-zero.background-only {
            background-color: ${NUMERIC_VALUE_COLORS.zero.light} !important;
        }
        
        .numeric-value-zero.border-only {
            border-color: ${NUMERIC_VALUE_COLORS.zero.border} !important;
        }
    `;
    
    return css;
}

/**
 * עדכון צבעים לערכים מספריים
 * @param {Object} newColors - צבעים חדשים
 */
function updateNumericValueColors(newColors) {
    // עדכון הצבעים הגלובליים
    Object.assign(NUMERIC_VALUE_COLORS, newColors);
    
    // יצירת CSS חדש
    const newCSS = generateNumericValueCSS();
    
    // עדכון או יצירת style element
    let styleElement = document.getElementById('numeric-value-colors');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'numeric-value-colors';
        document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = newCSS;
}

// ========================================
// 📤 ייצוא פונקציות לערכים מספריים
// ========================================

// ייצוא לפונקציות ערכים מספריים
window.getNumericValueColor = getNumericValueColor;
window.getNumericValueBackgroundColor = getNumericValueBackgroundColor;
window.getNumericValueTextColor = getNumericValueTextColor;
window.getNumericValueBorderColor = getNumericValueBorderColor;
window.getNumericValueDarkColor = getNumericValueDarkColor;
window.isPositiveValue = isPositiveValue;
window.isNegativeValue = isNegativeValue;
window.isZeroValue = isZeroValue;
window.getValueType = getValueType;
window.getNumericValueCSSClass = getNumericValueCSSClass;
window.generateNumericValueCSS = generateNumericValueCSS;
window.updateNumericValueColors = updateNumericValueColors;

// ייצוא לקבועים
window.NUMERIC_VALUE_COLORS = NUMERIC_VALUE_COLORS;

// ייצוא לאובייקט הגלובלי
window.colorSchemeSystem = {
    ...window.colorSchemeSystem,
    // פונקציות ערכים מספריים
    getNumericValueColor,
    getNumericValueBackgroundColor,
    getNumericValueTextColor,
    getNumericValueBorderColor,
    getNumericValueDarkColor,
    isPositiveValue,
    isNegativeValue,
    isZeroValue,
    getValueType,
    getNumericValueCSSClass,
    generateNumericValueCSS,
    updateNumericValueColors,
    
    // קבועים
    NUMERIC_VALUE_COLORS
};

// ===== EXPORTS =====
// ייצוא הפונקציות

// Export to global scope for backward compatibility
window.getInvestmentTypeColor = getInvestmentTypeColor;
window.getInvestmentTypeBackgroundColor = getInvestmentTypeBackgroundColor;
window.getInvestmentTypeTextColor = getInvestmentTypeTextColor;
window.getInvestmentTypeBorderColor = getInvestmentTypeBorderColor;
window.createInvestmentTypeLegend = createInvestmentTypeLegend;

// Export new unified functions
window.getEntityColor = getEntityColor;
window.getEntityBackgroundColor = getEntityBackgroundColor;
window.getEntityTextColor = getEntityTextColor;
window.getEntityBorderColor = getEntityBorderColor;
window.isValidEntityType = isValidEntityType;
window.getEntityLabel = getEntityLabel;
window.createEntityLegend = createEntityLegend;
window.generateEntityCSS = generateEntityCSS;

// Export constants
window.VALID_INVESTMENT_TYPES = VALID_INVESTMENT_TYPES;
window.INVESTMENT_TYPE_LABELS = INVESTMENT_TYPE_LABELS;
window.INVESTMENT_TYPE_DESCRIPTIONS = INVESTMENT_TYPE_DESCRIPTIONS;
window.INVESTMENT_TYPE_COLORS = INVESTMENT_TYPE_COLORS;

window.VALID_ENTITY_TYPES = VALID_ENTITY_TYPES;
window.ENTITY_COLORS = ENTITY_COLORS;
window.ENTITY_BACKGROUND_COLORS = ENTITY_BACKGROUND_COLORS;
window.ENTITY_TEXT_COLORS = ENTITY_TEXT_COLORS;
window.ENTITY_BORDER_COLORS = ENTITY_BORDER_COLORS;

// Export as module object
window.colorSchemeSystem = {
  // Entity functions
  getColor: getEntityColor,
  getBackgroundColor: getEntityBackgroundColor,
  getTextColor: getEntityTextColor,
  getBorderColor: getEntityBorderColor,
  isValid: isValidEntityType,
  getLabel: getEntityLabel,
  createLegend: createEntityLegend,
  generateCSS: generateEntityCSS,

  // Investment type functions (backward compatibility)
  getInvestmentTypeColor,
  getInvestmentTypeBackgroundColor,
  getInvestmentTypeTextColor,
  getInvestmentTypeBorderColor,
  createInvestmentTypeLegend,

  // Numeric value functions
  getNumericValueColor,
  getNumericValueBackgroundColor,
  getNumericValueTextColor,
  getNumericValueBorderColor,
  getNumericValueDarkColor,
  isPositiveValue,
  isNegativeValue,
  isZeroValue,
  getValueType,
  getNumericValueCSSClass,
  generateNumericValueCSS,
  updateNumericValueColors,

  // Constants
  VALID_ENTITY_TYPES,
  ENTITY_COLORS,
  ENTITY_BACKGROUND_COLORS,
  ENTITY_TEXT_COLORS,
  ENTITY_BORDER_COLORS,

  VALID_INVESTMENT_TYPES,
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPE_DESCRIPTIONS,
  INVESTMENT_TYPE_COLORS,

  NUMERIC_VALUE_COLORS
};

console.log('🎨 Unified Color Scheme System loaded successfully!');
console.log('📋 Available entity types:', VALID_ENTITY_TYPES);
console.log('🔧 Use window.colorSchemeSystem for advanced features');
