/**
 * ========================================
 * Trade Plans Business Logic Layer
 * ========================================
 * 
 * אחראי על:
 * - חישובים (מחירים, אחוזים)
 * - Validation (טפסים, נתונים)
 * - המרות (סכום למניות וחזרה)
 * - כללי עסק
 */

/**
 * חישוב מחירים ברירת מחדל
 * @param {number|string} currentPrice - מחיר נוכחי
 * @returns {Object} מחירי עצירה ויעד
 */
function calculateDefaultPrices(currentPrice) {
  const price = parseFloat(currentPrice) || 0;
  
  // מחיר עצירה - 5% למטה
  const stopPrice = (price * 0.95).toFixed(2);
  
  // מחיר יעד - 10% למעלה
  const targetPrice = (price * 1.10).toFixed(2);
  
  return {
    stopPrice: stopPrice,
    targetPrice: targetPrice
  };
}

/**
 * חישוב רווח/הפסד
 * @param {Object} plan - תוכנית מסחר
 * @returns {Object} רווח/הפסד
 */
function calculateProfitLoss(plan) {
  if (!plan || !plan.entry_price || !plan.quantity) {
    return { profit: 0, loss: 0, percentage: 0 };
  }

  const entryPrice = parseFloat(plan.entry_price);
  const quantity = parseFloat(plan.quantity);
  const currentPrice = parseFloat(plan.current_price || plan.entry_price);
  
  const profit = (currentPrice - entryPrice) * quantity;
  const percentage = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0;
  
  return {
    profit: profit.toFixed(2),
    loss: profit < 0 ? Math.abs(profit).toFixed(2) : 0,
    percentage: percentage.toFixed(2)
  };
}

/**
 * חישוב יחס סיכון/תשואה
 * @param {Object} plan - תוכנית מסחר
 * @returns {Object} יחס סיכון/תשואה
 */
function calculateRiskReward(plan) {
  if (!plan || !plan.entry_price || !plan.stop_price || !plan.target_price) {
    return { risk: 0, reward: 0, ratio: 0 };
  }

  const entryPrice = parseFloat(plan.entry_price);
  const stopPrice = parseFloat(plan.stop_price);
  const targetPrice = parseFloat(plan.target_price);
  
  const risk = Math.abs(entryPrice - stopPrice);
  const reward = Math.abs(targetPrice - entryPrice);
  const ratio = risk > 0 ? (reward / risk).toFixed(2) : 0;
  
  return {
    risk: risk.toFixed(2),
    reward: reward.toFixed(2),
    ratio: ratio
  };
}

/**
 * בדיקת תקינות תוכנית מסחר
 * @param {Object} planData - נתוני התוכנית
 * @returns {Object} תוצאת הבדיקה
 */
function validateTradePlan(planData) {
  const errors = [];
  const warnings = [];

  // בדיקת שדות חובה
  if (!planData.ticker_symbol || planData.ticker_symbol.trim() === '') {
    errors.push('שם הטיקר הוא שדה חובה');
  }

  if (!planData.amount || parseFloat(planData.amount) <= 0) {
    errors.push('סכום חייב להיות גדול מ-0');
  }

  if (!planData.entry_price || parseFloat(planData.entry_price) <= 0) {
    errors.push('מחיר כניסה חייב להיות גדול מ-0');
  }

  if (!planData.quantity || parseFloat(planData.quantity) <= 0) {
    errors.push('כמות מניות חייבת להיות גדולה מ-0');
  }

  // בדיקת מחירי עצירה ויעד
  if (planData.stop_price && parseFloat(planData.stop_price) <= 0) {
    errors.push('מחיר עצירה חייב להיות גדול מ-0');
  }

  if (planData.target_price && parseFloat(planData.target_price) <= 0) {
    errors.push('מחיר יעד חייב להיות גדול מ-0');
  }

  // בדיקת הגיון עסקי
  if (planData.entry_price && planData.stop_price) {
    const entryPrice = parseFloat(planData.entry_price);
    const stopPrice = parseFloat(planData.stop_price);
    
    if (stopPrice >= entryPrice) {
      warnings.push('מחיר עצירה גבוה ממחיר כניסה - זה לא הגיוני למכירה');
    }
  }

  if (planData.entry_price && planData.target_price) {
    const entryPrice = parseFloat(planData.entry_price);
    const targetPrice = parseFloat(planData.target_price);
    
    if (targetPrice <= entryPrice) {
      warnings.push('מחיר יעד נמוך ממחיר כניסה - זה לא הגיוני לרכישה');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}

/**
 * בדיקת תקינות טווח מחיר
 * @param {number|string} price - מחיר לבדיקה
 * @param {number} minPrice - מחיר מינימלי
 * @param {number} maxPrice - מחיר מקסימלי
 * @returns {boolean} האם המחיר תקין
 */
function validatePriceRange(price, minPrice = 0, maxPrice = 1000000) {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice >= minPrice && numPrice <= maxPrice;
}

/**
 * בדיקת תקינות כמות
 * @param {number|string} quantity - כמות לבדיקה
 * @param {number} minQuantity - כמות מינימלית
 * @param {number} maxQuantity - כמות מקסימלית
 * @returns {boolean} האם הכמות תקינה
 */
function validateQuantity(quantity, minQuantity = 1, maxQuantity = 1000000) {
  const numQuantity = parseFloat(quantity);
  return !isNaN(numQuantity) && numQuantity >= minQuantity && numQuantity <= maxQuantity;
}

/**
 * המרת סכום למניות
 * @param {number|string} amount - סכום
 * @param {number|string} price - מחיר למניה
 * @returns {number} כמות מניות
 */
async function convertAmountToShares(amount, price) {
  const numAmount = parseFloat(amount);
  const numPrice = parseFloat(price);
  
  if (isNaN(numAmount) || isNaN(numPrice) || numPrice <= 0) {
    throw new Error('נתונים לא תקינים להמרה');
  }
  
  return Math.floor(numAmount / numPrice);
}

/**
 * המרת מניות לסכום
 * @param {number|string} shares - כמות מניות
 * @param {number|string} price - מחיר למניה
 * @returns {number} סכום
 */
async function convertSharesToAmount(shares, price) {
  const numShares = parseFloat(shares);
  const numPrice = parseFloat(price);
  
  if (isNaN(numShares) || isNaN(numPrice) || numPrice <= 0) {
    throw new Error('נתונים לא תקינים להמרה');
  }
  
  return (numShares * numPrice).toFixed(2);
}

/**
 * חישוב אחוז שינוי
 * @param {number|string} oldValue - ערך ישן
 * @param {number|string} newValue - ערך חדש
 * @returns {number} אחוז שינוי
 */
function calculatePercentageChange(oldValue, newValue) {
  const old = parseFloat(oldValue);
  const newVal = parseFloat(newValue);
  
  if (isNaN(old) || isNaN(newVal) || old === 0) {
    return 0;
  }
  
  return (((newVal - old) / old) * 100).toFixed(2);
}

/**
 * עיגול מספר לספרות עשרוניות
 * @param {number|string} number - מספר לעיגול
 * @param {number} decimals - מספר ספרות עשרוניות
 * @returns {string} מספר מעוגל
 */
function roundToDecimals(number, decimals = 2) {
  const num = parseFloat(number);
  if (isNaN(num)) {
    return '0.00';
  }
  return num.toFixed(decimals);
}

/**
 * פורמט מספר כמטבע
 * @param {number|string} amount - סכום
 * @param {string} currency - מטבע (ברירת מחדל: ₪)
 * @returns {string} סכום מעוצב
 */
function formatCurrency(amount, currency = '₪') {
  const num = parseFloat(amount);
  if (isNaN(num)) {
    return `${currency} 0.00`;
  }
  return `${currency} ${num.toFixed(2)}`;
}

/**
 * פורמט מספר כאחוז
 * @param {number|string} number - מספר
 * @param {number} decimals - מספר ספרות עשרוניות
 * @returns {string} אחוז מעוצב
 */
function formatPercentage(number, decimals = 2) {
  const num = parseFloat(number);
  if (isNaN(num)) {
    return '0.00%';
  }
  return `${num.toFixed(decimals)}%`;
}

// ייצוא המודול
window.TradePlansBusiness = {
  calculateDefaultPrices,
  calculateProfitLoss,
  calculateRiskReward,
  validateTradePlan,
  validatePriceRange,
  validateQuantity,
  convertAmountToShares,
  convertSharesToAmount,
  calculatePercentageChange,
  roundToDecimals,
  formatCurrency,
  formatPercentage
};

console.log('✅ Trade Plans Business module loaded');
