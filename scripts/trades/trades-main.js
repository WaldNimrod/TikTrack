/**
 * ========================================
 * Trades Main Orchestrator
 * ========================================
 * 
 * אחראי על:
 * - אתחול העמוד
 * - קישור בין שכבות
 * - ייצוא פונקציות גלובליות
 * - ניהול מצב עמוד
 */

/**
 * אתחול עמוד טריידים
 */
async function initializeTradesPage() {
  try {
    console.log('🚀 Initializing Trades page...');

    // טעינת נתונים
    const data = await window.TradesData.loadTradesData();
    window.tradesData = data;

    // אתחול UI
    window.TradesUI.initialize();
    
    // עדכון טבלה
    window.TradesUI.updateTradesTable(data);
    
    // עדכון סטטיסטיקות
    window.TradesUI.updateSummaryStats(data);

    // שחזור מצב עמוד
    await restoreTradingSectionState();

    console.log('✅ Trades page initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Trades page:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה באתחול עמוד טריידים');
    }
  }
}

/**
 * שחזור מצב סקשן המסחר
 */
async function restoreTradingSectionState() {
  try {
    // שחזור מצב סקשן עליון
    let topCollapsed = false;
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      const result = await window.UnifiedCacheManager.get('tradingTopSectionCollapsed');
      topCollapsed = result === 'true';
    }

    const topSection = document.querySelector('[data-section="top"]');
    if (topSection) {
      if (topCollapsed) {
        topSection.style.display = 'none';
      } else {
        topSection.style.display = 'block';
      }
    }

    // שחזור מצב סקשן ראשי
    let mainCollapsed = false;
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      const result = await window.UnifiedCacheManager.get('tradingMainSectionCollapsed');
      mainCollapsed = result === 'true';
    }

    const mainSection = document.querySelector('[data-section="main"]');
    if (mainSection) {
      if (mainCollapsed) {
        mainSection.style.display = 'none';
      } else {
        mainSection.style.display = 'block';
      }
    }

    console.log('✅ Trading section state restored');
  } catch (error) {
    console.error('❌ Error restoring trading section state:', error);
  }
}

/**
 * שמירת מצב סקשן המסחר
 * @param {string} section - שם הסקשן
 * @param {boolean} isCollapsed - האם הסקשן מקופל
 */
async function saveTradingSectionState(section, isCollapsed) {
  try {
    const key = `trading${section.charAt(0).toUpperCase() + section.slice(1)}SectionCollapsed`;
    
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save(key, !isCollapsed);
    }

    console.log(`✅ Trading ${section} section state saved:`, !isCollapsed);
  } catch (error) {
    console.error(`❌ Error saving trading ${section} section state:`, error);
  }
}

/**
 * שמירת טרייד חדש
 * @param {Object} formData - נתוני הטופס
 */
async function saveNewTrade(formData) {
  try {
    // בדיקת תקינות
    const validation = window.TradesBusiness.validateTrade(formData);
    if (!validation.isValid) {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', validation.errors.join('\n'));
      }
      return;
    }

    // שמירה
    const result = await window.TradesData.saveTrade(formData);
    
    // עדכון טבלה
    const data = await window.TradesData.loadTradesData();
    window.tradesData = data;
    window.TradesUI.updateTradesTable(data);
    window.TradesUI.updateSummaryStats(data);

    // סגירת מודל
    window.TradesUI.closeModal('addTradeModal');

    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', 'טרייד נשמר בהצלחה');
    }

    console.log('✅ New trade saved:', result);
  } catch (error) {
    console.error('❌ Error saving new trade:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בשמירת טרייד');
    }
  }
}

/**
 * עריכת טרייד
 * @param {Object} formData - נתוני הטופס
 */
async function editTrade(formData) {
  try {
    const tradeId = formData.id;
    if (!tradeId) {
      throw new Error('מזהה טרייד לא נמצא');
    }

    // בדיקת תקינות
    const validation = window.TradesBusiness.validateTrade(formData);
    if (!validation.isValid) {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', validation.errors.join('\n'));
      }
      return;
    }

    // עדכון
    const result = await window.TradesData.updateTrade(tradeId, formData);
    
    // עדכון טבלה
    const data = await window.TradesData.loadTradesData();
    window.tradesData = data;
    window.TradesUI.updateTradesTable(data);
    window.TradesUI.updateSummaryStats(data);

    // סגירת מודל
    window.TradesUI.closeModal('editTradeModal');

    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', 'טרייד עודכן בהצלחה');
    }

    console.log('✅ Trade edited:', result);
  } catch (error) {
    console.error('❌ Error editing trade:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בעדכון טרייד');
    }
  }
}

/**
 * סגירת טרייד
 * @param {Object} formData - נתוני הטופס
 */
async function closeTrade(formData) {
  try {
    const tradeId = formData.id;
    if (!tradeId) {
      throw new Error('מזהה טרייד לא נמצא');
    }

    // בדיקת תקינות מחיר יציאה
    const trade = await window.TradesData.getTradeDetails(tradeId);
    if (!window.TradesBusiness.validateExitPrice(formData.exit_price, trade.entry_price, trade.trade_type)) {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'מחיר יציאה לא תקין');
      }
      return;
    }

    // סגירה
    const result = await window.TradesData.closeTrade(tradeId, formData);
    
    // עדכון טבלה
    const data = await window.TradesData.loadTradesData();
    window.tradesData = data;
    window.TradesUI.updateTradesTable(data);
    window.TradesUI.updateSummaryStats(data);

    // סגירת מודל
    window.TradesUI.closeModal('closeTradeModal');

    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', 'טרייד נסגר בהצלחה');
    }

    console.log('✅ Trade closed:', result);
  } catch (error) {
    console.error('❌ Error closing trade:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בסגירת טרייד');
    }
  }
}

/**
 * הצגת פריטים מקושרים לטרייד
 * @param {number} tradeId - מזהה הטרייד
 */
function viewLinkedItemsForTrade(tradeId) {
  try {
    console.log('🔗 הצגת פריטים מקושרים לטרייד:', tradeId);
    if (typeof window.viewLinkedItems === 'function') {
      window.viewLinkedItems('trade', tradeId);
    } else {
      console.error('פונקציה viewLinkedItems לא נטענה');
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'פונקציה viewLinkedItems לא נטענה');
      }
    }
  } catch (error) {
    console.error('שגיאה בהצגת פריטים מקושרים:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בהצגת פריטים מקושרים');
    }
  }
}

/**
 * פילטור טריידים
 * @param {string} filterType - סוג הפילטר
 * @param {string} filterValue - ערך הפילטר
 */
async function filterTrades(filterType, filterValue) {
  try {
    if (!window.tradesData || !Array.isArray(window.tradesData)) {
      console.warn('⚠️ No trades data available for filtering');
      return;
    }

    let filteredData = [...window.tradesData];

    if (filterType && filterValue) {
      switch (filterType) {
        case 'status':
          filteredData = filteredData.filter(trade => trade.status === filterValue);
          break;
        case 'type':
          filteredData = filteredData.filter(trade => trade.trade_type === filterValue);
          break;
        case 'ticker':
          filteredData = filteredData.filter(trade => 
            trade.ticker_symbol && trade.ticker_symbol.toLowerCase().includes(filterValue.toLowerCase())
          );
          break;
        case 'profit':
          filteredData = filteredData.filter(trade => {
            const profitLoss = window.TradesBusiness.calculateTradeProfitLoss(trade);
            return parseFloat(profitLoss.profit) > 0;
          });
          break;
        case 'loss':
          filteredData = filteredData.filter(trade => {
            const profitLoss = window.TradesBusiness.calculateTradeProfitLoss(trade);
            return parseFloat(profitLoss.profit) < 0;
          });
          break;
      }
    }

    window.TradesUI.updateTradesTable(filteredData);
    console.log(`✅ Filtered trades: ${filteredData.length} results`);
  } catch (error) {
    console.error('❌ Error filtering trades:', error);
  }
}

/**
 * רענון נתוני טריידים
 */
async function refreshTradesData() {
  try {
    console.log('🔄 Refreshing trades data...');
    
    // ביטול מטמון
    await window.TradesData.invalidateTradesCache();
    
    // טעינה מחדש
    const data = await window.TradesData.loadTradesData();
    window.tradesData = data;
    
    // עדכון UI
    window.TradesUI.updateTradesTable(data);
    window.TradesUI.updateSummaryStats(data);
    
    console.log('✅ Trades data refreshed');
  } catch (error) {
    console.error('❌ Error refreshing trades data:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה ברענון נתוני טריידים');
    }
  }
}

/**
 * ייצוא נתונים ל-CSV
 */
function exportTradesToCSV() {
  try {
    if (!window.tradesData || !Array.isArray(window.tradesData)) {
      console.warn('⚠️ No trades data available for export');
      return;
    }

    // יצירת CSV
    const headers = [
      'ID', 'Ticker', 'Type', 'Quantity', 'Entry Price', 'Current Price', 
      'Exit Price', 'Profit/Loss', 'Percentage', 'Entry Date', 'Exit Date', 'Status'
    ];

    const rows = window.tradesData.map(trade => {
      const profitLoss = window.TradesBusiness.calculateTradeProfitLoss(trade);
      return [
        trade.id,
        trade.ticker_symbol || '',
        trade.trade_type || '',
        trade.quantity || '',
        trade.entry_price || '',
        trade.current_price || '',
        trade.exit_price || '',
        profitLoss.profit,
        profitLoss.percentage,
        trade.entry_date || '',
        trade.exit_date || '',
        trade.status || ''
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // הורדה
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Trades exported to CSV');
  } catch (error) {
    console.error('❌ Error exporting trades to CSV:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בייצוא טריידים');
    }
  }
}

// אתחול העמוד
document.addEventListener('DOMContentLoaded', async () => {
  await initializeTradesPage();
});

// ייצוא פונקציות גלובליות
window.loadTradesData = () => window.TradesData.loadTradesData();
window.showAddTradeModal = () => window.TradesUI.showAddTradeModal();
window.updateTradesTable = (data) => window.TradesUI.updateTradesTable(data);
window.saveNewTrade = saveNewTrade;
window.editTrade = editTrade;
window.closeTrade = closeTrade;
window.viewLinkedItemsForTrade = viewLinkedItemsForTrade;
window.filterTrades = filterTrades;
window.refreshTradesData = refreshTradesData;
window.exportTradesToCSV = exportTradesToCSV;
window.saveTradingSectionState = saveTradingSectionState;
window.restoreTradingSectionState = restoreTradingSectionState;

console.log('✅ Trades Main module loaded');
