/**
 * ========================================
 * Trades Business Logic Layer
 * ========================================
 * 
 * אחראי על:
 * - חישובים (רווח/הפסד, אחוזים)
 * - Validation (טפסים, נתונים)
 * - המרות (סכום למניות וחזרה)
 * - כללי עסק
 */

/**
 * חישוב רווח/הפסד לטרייד
 * @param {Object} trade - טרייד
 * @returns {Object} רווח/הפסד
 */
function calculateTradeProfitLoss(trade) {
  if (!trade || !trade.entry_price || !trade.quantity) {
    return { profit: 0, loss: 0, percentage: 0, unrealized: 0 };
  }

  const entryPrice = parseFloat(trade.entry_price);
  const quantity = parseFloat(trade.quantity);
  const currentPrice = parseFloat(trade.current_price || trade.entry_price);
  const exitPrice = parseFloat(trade.exit_price || currentPrice);
  
  // רווח/הפסד ממומש (אם הטרייד נסגר)
  const realizedProfit = trade.status === 'closed' ? 
    (exitPrice - entryPrice) * quantity : 0;
  
  // רווח/הפסד לא ממומש (אם הטרייד פתוח)
  const unrealizedProfit = trade.status === 'open' ? 
    (currentPrice - entryPrice) * quantity : 0;
  
  const totalProfit = realizedProfit + unrealizedProfit;
  const percentage = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0;
  
  return {
    profit: totalProfit.toFixed(2),
    loss: totalProfit < 0 ? Math.abs(totalProfit).toFixed(2) : 0,
    percentage: percentage.toFixed(2),
    unrealized: unrealizedProfit.toFixed(2),
    realized: realizedProfit.toFixed(2)
  };
}

/**
 * חישוב יחס סיכון/תשואה לטרייד
 * @param {Object} trade - טרייד
 * @returns {Object} יחס סיכון/תשואה
 */
function calculateTradeRiskReward(trade) {
  if (!trade || !trade.entry_price || !trade.stop_loss || !trade.take_profit) {
    return { risk: 0, reward: 0, ratio: 0 };
  }

  const entryPrice = parseFloat(trade.entry_price);
  const stopLoss = parseFloat(trade.stop_loss);
  const takeProfit = parseFloat(trade.take_profit);
  
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);
  const ratio = risk > 0 ? (reward / risk).toFixed(2) : 0;
  
  return {
    risk: risk.toFixed(2),
    reward: reward.toFixed(2),
    ratio: ratio
  };
}

/**
 * בדיקת תקינות טרייד
 * @param {Object} tradeData - נתוני הטרייד
 * @returns {Object} תוצאת הבדיקה
 */
function validateTrade(tradeData) {
  const errors = [];
  const warnings = [];

  // בדיקת שדות חובה
  if (!tradeData.ticker_symbol || tradeData.ticker_symbol.trim() === '') {
    errors.push('שם הטיקר הוא שדה חובה');
  }

  if (!tradeData.entry_price || parseFloat(tradeData.entry_price) <= 0) {
    errors.push('מחיר כניסה חייב להיות גדול מ-0');
  }

  if (!tradeData.quantity || parseFloat(tradeData.quantity) <= 0) {
    errors.push('כמות מניות חייבת להיות גדולה מ-0');
  }

  if (!tradeData.trade_type || !['buy', 'sell'].includes(tradeData.trade_type)) {
    errors.push('סוג טרייד חייב להיות buy או sell');
  }

  // בדיקת מחירי עצירה ויעד
  if (tradeData.stop_loss && parseFloat(tradeData.stop_loss) <= 0) {
    errors.push('מחיר עצירה חייב להיות גדול מ-0');
  }

  if (tradeData.take_profit && parseFloat(tradeData.take_profit) <= 0) {
    errors.push('מחיר יעד חייב להיות גדול מ-0');
  }

  // בדיקת הגיון עסקי
  if (tradeData.entry_price && tradeData.stop_loss) {
    const entryPrice = parseFloat(tradeData.entry_price);
    const stopLoss = parseFloat(tradeData.stop_loss);
    
    if (tradeData.trade_type === 'buy' && stopLoss >= entryPrice) {
      warnings.push('מחיר עצירה גבוה ממחיר כניסה - זה לא הגיוני לרכישה');
    }
    
    if (tradeData.trade_type === 'sell' && stopLoss <= entryPrice) {
      warnings.push('מחיר עצירה נמוך ממחיר כניסה - זה לא הגיוני למכירה');
    }
  }

  if (tradeData.entry_price && tradeData.take_profit) {
    const entryPrice = parseFloat(tradeData.entry_price);
    const takeProfit = parseFloat(tradeData.take_profit);
    
    if (tradeData.trade_type === 'buy' && takeProfit <= entryPrice) {
      warnings.push('מחיר יעד נמוך ממחיר כניסה - זה לא הגיוני לרכישה');
    }
    
    if (tradeData.trade_type === 'sell' && takeProfit >= entryPrice) {
      warnings.push('מחיר יעד גבוה ממחיר כניסה - זה לא הגיוני למכירה');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}

/**
 * בדיקת תקינות מחיר יציאה
 * @param {number|string} exitPrice - מחיר יציאה
 * @param {number|string} entryPrice - מחיר כניסה
 * @param {string} tradeType - סוג טרייד
 * @returns {boolean} האם המחיר תקין
 */
function validateExitPrice(exitPrice, entryPrice, tradeType) {
  const exit = parseFloat(exitPrice);
  const entry = parseFloat(entryPrice);
  
  if (isNaN(exit) || isNaN(entry) || exit <= 0 || entry <= 0) {
    return false;
  }
  
  // לרכישה - מחיר יציאה צריך להיות גבוה ממחיר כניסה
  if (tradeType === 'buy') {
    return exit > entry;
  }
  
  // למכירה - מחיר יציאה צריך להיות נמוך ממחיר כניסה
  if (tradeType === 'sell') {
    return exit < entry;
  }
  
  return true;
}

/**
 * חישוב מחיר ממוצע
 * @param {Array} trades - רשימת טריידים
 * @returns {number} מחיר ממוצע
 */
function calculateAveragePrice(trades) {
  if (!trades || trades.length === 0) {
    return 0;
  }

  let totalValue = 0;
  let totalQuantity = 0;

  trades.forEach(trade => {
    const price = parseFloat(trade.entry_price);
    const quantity = parseFloat(trade.quantity);
    
    if (!isNaN(price) && !isNaN(quantity)) {
      totalValue += price * quantity;
      totalQuantity += quantity;
    }
  });

  return totalQuantity > 0 ? (totalValue / totalQuantity).toFixed(2) : 0;
}

/**
 * חישוב סך רווח/הפסד
 * @param {Array} trades - רשימת טריידים
 * @returns {Object} סך רווח/הפסד
 */
function calculateTotalProfitLoss(trades) {
  if (!trades || trades.length === 0) {
    return { totalProfit: 0, totalLoss: 0, netResult: 0 };
  }

  let totalProfit = 0;
  let totalLoss = 0;

  trades.forEach(trade => {
    const profitLoss = calculateTradeProfitLoss(trade);
    const profit = parseFloat(profitLoss.profit);
    
    if (profit > 0) {
      totalProfit += profit;
    } else {
      totalLoss += Math.abs(profit);
    }
  });

  const netResult = totalProfit - totalLoss;

  return {
    totalProfit: totalProfit.toFixed(2),
    totalLoss: totalLoss.toFixed(2),
    netResult: netResult.toFixed(2)
  };
}

/**
 * חישוב אחוז הצלחה
 * @param {Array} trades - רשימת טריידים
 * @returns {number} אחוז הצלחה
 */
function calculateSuccessRate(trades) {
  if (!trades || trades.length === 0) {
    return 0;
  }

  const closedTrades = trades.filter(trade => trade.status === 'closed');
  if (closedTrades.length === 0) {
    return 0;
  }

  const profitableTrades = closedTrades.filter(trade => {
    const profitLoss = calculateTradeProfitLoss(trade);
    return parseFloat(profitLoss.profit) > 0;
  });

  return ((profitableTrades.length / closedTrades.length) * 100).toFixed(2);
}

/**
 * חישוב זמן ממוצע לטרייד
 * @param {Array} trades - רשימת טריידים
 * @returns {number} זמן ממוצע בימים
 */
function calculateAverageTradeDuration(trades) {
  if (!trades || trades.length === 0) {
    return 0;
  }

  const closedTrades = trades.filter(trade => 
    trade.status === 'closed' && trade.entry_date && trade.exit_date
  );

  if (closedTrades.length === 0) {
    return 0;
  }

  let totalDays = 0;

  closedTrades.forEach(trade => {
    const entryDate = new Date(trade.entry_date);
    const exitDate = new Date(trade.exit_date);
    const days = Math.ceil((exitDate - entryDate) / (1000 * 60 * 60 * 24));
    totalDays += days;
  });

  return (totalDays / closedTrades.length).toFixed(1);
}

/**
 * פורמט תאריך
 * @param {string|Date} date - תאריך
 * @param {string} format - פורמט (he-IL, en-US)
 * @returns {string} תאריך מעוצב
 */
function formatDate(date, format = 'he-IL') {
  if (!date) {
    return 'לא ידוע';
  }

  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(format);
  } catch (error) {
    return 'לא תקין';
  }
}

/**
 * פורמט זמן
 * @param {string|Date} date - תאריך/זמן
 * @param {string} format - פורמט (he-IL, en-US)
 * @returns {string} זמן מעוצב
 */
function formatDateTime(date, format = 'he-IL') {
  if (!date) {
    return 'לא ידוע';
  }

  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleString(format);
  } catch (error) {
    return 'לא תקין';
  }
}

/**
 * פורמט סטטוס טרייד
 * @param {string} status - סטטוס
 * @returns {string} סטטוס מעוצב
 */
function formatTradeStatus(status) {
  const statusMap = {
    'open': 'פתוח',
    'closed': 'סגור',
    'cancelled': 'בוטל',
    'pending': 'ממתין'
  };

  return statusMap[status] || status || 'לא ידוע';
}

/**
 * פורמט סוג טרייד
 * @param {string} tradeType - סוג טרייד
 * @returns {string} סוג מעוצב
 */
function formatTradeType(tradeType) {
  const typeMap = {
    'buy': 'רכישה',
    'sell': 'מכירה',
    'long': 'ארוך',
    'short': 'קצר'
  };

  return typeMap[tradeType] || tradeType || 'לא ידוע';
}

// ייצוא המודול
window.TradesBusiness = {
  calculateTradeProfitLoss,
  calculateTradeRiskReward,
  validateTrade,
  validateExitPrice,
  calculateAveragePrice,
  calculateTotalProfitLoss,
  calculateSuccessRate,
  calculateAverageTradeDuration,
  formatDate,
  formatDateTime,
  formatTradeStatus,
  formatTradeType
};

console.log('✅ Trades Business module loaded');
