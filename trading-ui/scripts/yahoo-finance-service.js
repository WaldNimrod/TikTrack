/**
 * Yahoo Finance Service - TikTrack Global External Data Integration
 * =================================================================
 *
 * מערכת גלובלית לניהול נתוני Yahoo Finance
 *
 * תכונות:
 * - קבלת מחירים בזמן אמת
 * - עדכון מחירים עבור מספר טיקרים
 * - מערכת cache לביצועים משופרים
 * - פונקציות עזר לעיצוב נתונים
 * - תמיכה בכל העמודים במערכת
 *
 * שימוש:
 * - window.YahooFinanceService.getQuote('AAPL')
 * - window.YahooFinanceService.getMultipleQuotes(['AAPL', 'GOOGL'])
 * - window.YahooFinanceService.formatPrice(236.94)
 * - window.YahooFinanceService.formatChange(3.14)
 *
 * תלויות:
 * - notification-system.js (לתצוגת הודעות)
 *
 * @version 1.0
 * @created September 3, 2025
 * @author TikTrack Development Team
 */

// ===== Yahoo Finance Service Class =====
class YahooFinanceService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.isLoading = false;
    this.loadingPromises = new Map();
  }

  /**
   * קבלת נתוני מחיר עבור טיקר בודד
   * @param {string} symbol - סימבול הטיקר (AAPL, GOOGL, וכו')
   * @param {boolean} useCache - האם להשתמש ב-cache (ברירת מחדל: true)
   * @returns {Promise<Object|null>} נתוני המחיר או null אם נכשל
   */
  async getQuote(symbol, useCache = true) {
    try {
      const upperSymbol = symbol.toUpperCase();

      // בדיקת cache
      if (useCache && this.isCacheValid(upperSymbol)) {
        return this.cache.get(upperSymbol).data;
      }

      // בדיקה אם כבר טוען את הנתונים
      if (this.loadingPromises.has(upperSymbol)) {
        return await this.loadingPromises.get(upperSymbol);
      }

      // יצירת promise לטעינה
      const loadingPromise = this._fetchSingleQuote(upperSymbol);
      this.loadingPromises.set(upperSymbol, loadingPromise);

      const result = await loadingPromise;

      // ניקוי ה-promise מה-map
      this.loadingPromises.delete(upperSymbol);

      return result;

    } catch (error) {
// Console statement removed for no-console compliance
      return null;
    }
  }

  /**
   * קבלת נתוני מחיר עבור מספר טיקרים
   * @param {Array<string>} symbols - מערך סימבולי טיקרים
   * @param {boolean} useCache - האם להשתמש ב-cache
   * @returns {Promise<Object>} אובייקט עם נתוני מחיר לכל טיקר
   */
  async getMultipleQuotes(symbols, useCache = true) {
    try {
      if (!symbols || symbols.length === 0) {
        return {};
      }

      const upperSymbols = symbols.map(s => s.toUpperCase());
      const results = {};
      const symbolsToFetch = [];

      // בדיקת cache עבור כל טיקר
      if (useCache) {
        upperSymbols.forEach(symbol => {
          if (this.isCacheValid(symbol)) {
            results[symbol] = this.cache.get(symbol).data;
          } else {
            symbolsToFetch.push(symbol);
          }
        });
      } else {
        symbolsToFetch.push(...upperSymbols);
      }

      // אם כל הנתונים ב-cache
      if (symbolsToFetch.length === 0) {
        return results;
      }

      // טעינת נתונים חדשים
      const freshData = await this._fetchMultipleQuotes(symbolsToFetch);

      // איחוד התוצאות
      return { ...results, ...freshData };

    } catch (error) {
// Console statement removed for no-console compliance
      return {};
    }
  }

  /**
   * רענון נתונים עבור רשימת טיקרים (עם הודעות)
   * @param {Array<string>} symbols - מערך סימבולי טיקרים
   * @param {string} buttonId - ID של הכפתור לעדכון מצב טעינה (אופציונלי)
   * @returns {Promise<Object>} נתוני המחירים המעודכנים
   */
  async refreshQuotes(symbols, buttonId = null) {
    let button = null;

    try {
      // הצגת מצב טעינה
      if (buttonId) {
        button = document.getElementById(buttonId);
        if (button) {
          button.disabled = true;
          const originalHtml = button.innerHTML;
          button.innerHTML = button.innerHTML.replace(/🔄|⏳/, '⏳');
          button.dataset.originalHtml = originalHtml;
        }
      }

      // טעינת נתונים חדשים (ללא cache)
      const data = await this.getMultipleQuotes(symbols, false);

      const successCount = Object.keys(data).filter(symbol =>
        data[symbol] && !data[symbol].error,
      ).length;

      if (successCount > 0) {
        this._showNotification(`עודכנו נתונים עבור ${successCount} טיקרים`, 'success');
      } else {
        this._showNotification('לא ניתן לעדכן נתונים', 'warning');
      }

      return data;

    } catch (error) {
// Console statement removed for no-console compliance
      this._showNotification(`שגיאה ברענון נתונים: ${error.message}`, 'error');
      return {};
    } finally {
      // החזרת הכפתור למצב רגיל
      if (button && button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
        button.disabled = false;
        delete button.dataset.originalHtml;
      }
    }
  }

  /**
   * רענון שקט ללא הודעות
   * @param {Array<string>} symbols - מערך סימבולי טיקרים
   * @returns {Promise<Object>} נתוני המחירים המעודכנים
   */
  async refreshQuotesSilently(symbols) {
    try {
      const data = await this.getMultipleQuotes(symbols, false);
      const successCount = Object.keys(data).filter(symbol =>
        data[symbol] && !data[symbol].error,
      ).length;

// Console statement removed for no-console compliance
      return data;
    } catch (error) {
// Console statement removed for no-console compliance
      return {};
    }
  }

  // ===== פונקציות עיצוב =====

  /**
   * עיצוב מחיר
   * @param {number} price - המחיר
   * @param {string} currency - המטבע (ברירת מחדל: USD)
   * @returns {string} מחיר מעוצב
   */
  formatPrice(price, currency = 'USD') {
    if (price === null || price === undefined || isNaN(price)) {
      return 'אין נתונים';
    }

    const symbol = currency === 'USD' ? '$' : currency;
    return `${symbol}${parseFloat(price).toFixed(2)}`;
  }

  /**
   * עיצוב שינוי אחוזים
   * @param {number} changePercent - אחוז השינוי
   * @returns {string} שינוי מעוצב
   */
  formatChange(changePercent) {
    if (changePercent === null || changePercent === undefined || isNaN(changePercent)) {
      return 'אין נתונים';
    }

    const formatted = parseFloat(changePercent).toFixed(2);
    const sign = changePercent > 0 ? '+' : '';
    return `${sign}${formatted}%`;
  }

  /**
   * קבלת CSS class לפי שינוי מחיר
   * @param {number} changePercent - אחוז השינוי
   * @returns {string} CSS class
   */
  getChangeClass(changePercent) {
    if (changePercent === null || changePercent === undefined || isNaN(changePercent)) {
      return '';
    }

    return changePercent > 0 ? 'text-success' :
      changePercent < 0 ? 'text-danger' : '';
  }

  /**
   * עיצוב נפח מסחר
   * @param {number} volume - נפח המסחר
   * @returns {string} נפח מעוצב
   */
  formatVolume(volume) {
    if (volume === null || volume === undefined || isNaN(volume)) {
      return 'אין נתונים';
    }

    return parseInt(volume).toLocaleString();
  }

  // ===== פונקציות פרטיות =====

  /**
   * טעינת נתוני טיקר בודד מה-API
   */
  async _fetchSingleQuote(symbol) {
    try {
      const response = await fetch(`/api/external-data/yahoo/quote/${symbol}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        // שמירה ב-cache
        this.cache.set(symbol, {
          data: result.data,
          timestamp: Date.now(),
        });

        return result.data;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
// Console statement removed for no-console compliance
      return null;
    }
  }

  /**
   * טעינת נתוני מספר טיקרים מה-API
   */
  async _fetchMultipleQuotes(symbols) {
    try {
      const response = await fetch('/api/external-data/yahoo/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        // שמירה ב-cache
        Object.entries(result.data).forEach(([symbol, data]) => {
          this.cache.set(symbol, {
            data,
            timestamp: Date.now(),
          });
        });

        return result.data;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
// Console statement removed for no-console compliance
      return {};
    }
  }

  /**
   * בדיקה האם נתוני cache תקפים
   */
  isCacheValid(symbol) {
    const cached = this.cache.get(symbol);
    if (!cached) {return false;}

    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  /**
   * ניקוי cache ישן
   */
  cleanCache() {
    const now = Date.now();
    for (const [symbol, data] of this.cache.entries()) {
      if (now - data.timestamp > this.cacheTimeout) {
        this.cache.delete(symbol);
      }
    }
  }

  /**
   * הצגת הודעה (עם fallback)
   */
  _showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    } else {
// Console statement removed for no-console compliance
    }
  }

  // ===== פונקציות עזר גלובליות =====

  /**
   * עדכון אלמנט HTML עם נתוני מחיר
   * @param {string} elementId - ID של האלמנט
   * @param {Object} quoteData - נתוני המחיר
   * @param {string} displayType - סוג התצוגה ('price', 'change', 'volume')
   */
  updateElement(elementId, quoteData, displayType = 'price') {
    const element = document.getElementById(elementId);
    if (!element || !quoteData) {return;}

    switch (displayType) {
    case 'price':
      element.textContent = this.formatPrice(quoteData.price, quoteData.currency);
      break;
    case 'change':
      element.textContent = this.formatChange(quoteData.change_percent);
      element.className = element.className.replace(/text-(success|danger)/, '') +
                           ' ' + this.getChangeClass(quoteData.change_percent);
      break;
    case 'volume':
      element.textContent = this.formatVolume(quoteData.volume);
      break;
    }
  }

  /**
   * קבלת סטטיסטיקות cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout / 1000 / 60, // בדקות
      isLoading: this.isLoading,
    };
  }
}

// ===== יצירת instance גלובלי =====
window.YahooFinanceService = new YahooFinanceService();

// ניקוי cache כל 10 דקות
setInterval(() => {
  window.YahooFinanceService.cleanCache();
}, 10 * 60 * 1000);

// ===== Export functions לתאימות לאחור =====
window.getYahooQuote = symbol => window.YahooFinanceService.getQuote(symbol);
window.getMultipleYahooQuotes = symbols => window.YahooFinanceService.getMultipleQuotes(symbols);
window.formatYahooPrice = (price, currency) => window.YahooFinanceService.formatPrice(price, currency);
window.formatYahooChange = change => window.YahooFinanceService.formatChange(change);

// Console statement removed for no-console compliance
