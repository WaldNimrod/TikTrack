/**
 * ========================================
 * Trade Plans Main Orchestrator
 * ========================================
 * 
 * אחראי על:
 * - אתחול העמוד
 * - קישור בין שכבות
 * - ייצוא פונקציות גלובליות
 * - ניהול מצב עמוד
 */

/**
 * אתחול עמוד תוכניות מסחר
 */
async function initializeTradePlansPage() {
  try {
    console.log('🚀 Initializing Trade Plans page...');

    // טעינת נתונים
    const data = await window.TradePlansData.loadTradePlansData();
    window.tradePlansData = data;

    // אתחול UI
    window.TradePlansUI.initialize();
    
    // עדכון טבלה
    window.TradePlansUI.updateTradePlansTable(data);
    
    // עדכון סטטיסטיקות
    window.TradePlansUI.updateSummaryStats(data);

    // שחזור מצב עמוד
    await restorePlanningSectionState();

    console.log('✅ Trade Plans page initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Trade Plans page:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה באתחול עמוד תוכניות מסחר');
    }
  }
}

/**
 * שחזור מצב סקשן התכנון
 */
async function restorePlanningSectionState() {
  try {
    // שחזור מצב סקשן עליון
    let topCollapsed = false;
    if (typeof window.UnifiedCacheManager?.get === 'function') {
      const result = await window.UnifiedCacheManager.get('planningTopSectionCollapsed');
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
      const result = await window.UnifiedCacheManager.get('planningMainSectionCollapsed');
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

    console.log('✅ Planning section state restored');
  } catch (error) {
    console.error('❌ Error restoring planning section state:', error);
  }
}

/**
 * שמירת מצב סקשן התכנון
 * @param {string} section - שם הסקשן
 * @param {boolean} isCollapsed - האם הסקשן מקופל
 */
async function savePlanningSectionState(section, isCollapsed) {
  try {
    const key = `planning${section.charAt(0).toUpperCase() + section.slice(1)}SectionCollapsed`;
    
    if (typeof window.UnifiedCacheManager?.save === 'function') {
      await window.UnifiedCacheManager.save(key, !isCollapsed);
    }

    console.log(`✅ Planning ${section} section state saved:`, !isCollapsed);
  } catch (error) {
    console.error(`❌ Error saving planning ${section} section state:`, error);
  }
}

/**
 * עדכון מידע טיקר בטופס הוספה
 * @param {string} tickerId - מזהה הטיקר
 */
async function updateAddTickerInfo(tickerId) {
  try {
    if (!tickerId) {
      return;
    }

    // טעינת מידע טיקר
    if (typeof window.tickerService?.getTickerInfo === 'function') {
      const tickerInfo = await window.tickerService.getTickerInfo(tickerId);
      
      if (tickerInfo && tickerInfo.current_price) {
        // חישוב מחירים ברירת מחדל
        const prices = window.TradePlansBusiness.calculateDefaultPrices(tickerInfo.current_price);
        
        // עדכון שדות המחיר
        const stopPriceInput = document.getElementById('addTradePlanStopPrice');
        const targetPriceInput = document.getElementById('addTradePlanTargetPrice');
        
        if (stopPriceInput && !stopPriceInput.value) {
          stopPriceInput.value = prices.stopPrice;
        }
        
        if (targetPriceInput && !targetPriceInput.value) {
          targetPriceInput.value = prices.targetPrice;
        }
      }
    }

    console.log('✅ Add ticker info updated for ticker:', tickerId);
  } catch (error) {
    console.error('❌ Error updating add ticker info:', error);
  }
}

/**
 * שמירת תוכנית מסחר חדשה
 * @param {Object} formData - נתוני הטופס
 */
async function saveNewTradePlan(formData) {
  try {
    // בדיקת תקינות
    const validation = window.TradePlansBusiness.validateTradePlan(formData);
    if (!validation.isValid) {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', validation.errors.join('\n'));
      }
      return;
    }

    // שמירה
    const result = await window.TradePlansData.saveTradePlan(formData);
    
    // עדכון טבלה
    const data = await window.TradePlansData.loadTradePlansData();
    window.tradePlansData = data;
    window.TradePlansUI.updateTradePlansTable(data);
    window.TradePlansUI.updateSummaryStats(data);

    // סגירת מודל
    window.TradePlansUI.closeModal('addTradePlanModal');

    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', 'תוכנית מסחר נשמרה בהצלחה');
    }

    console.log('✅ New trade plan saved:', result);
  } catch (error) {
    console.error('❌ Error saving new trade plan:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בשמירת תוכנית מסחר');
    }
  }
}

/**
 * עריכת תוכנית מסחר
 * @param {Object} formData - נתוני הטופס
 */
async function editTradePlan(formData) {
  try {
    const planId = formData.id;
    if (!planId) {
      throw new Error('מזהה תוכנית לא נמצא');
    }

    // בדיקת תקינות
    const validation = window.TradePlansBusiness.validateTradePlan(formData);
    if (!validation.isValid) {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', validation.errors.join('\n'));
      }
      return;
    }

    // עדכון
    const result = await window.TradePlansData.updateTradePlan(planId, formData);
    
    // עדכון טבלה
    const data = await window.TradePlansData.loadTradePlansData();
    window.tradePlansData = data;
    window.TradePlansUI.updateTradePlansTable(data);
    window.TradePlansUI.updateSummaryStats(data);

    // סגירת מודל
    window.TradePlansUI.closeModal('editTradePlanModal');

    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', 'תוכנית מסחר עודכנה בהצלחה');
    }

    console.log('✅ Trade plan edited:', result);
  } catch (error) {
    console.error('❌ Error editing trade plan:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בעדכון תוכנית מסחר');
    }
  }
}

/**
 * הצגת פריטים מקושרים לתוכנית מסחר
 * @param {number} planId - מזהה התוכנית
 */
function viewLinkedItemsForTradePlan(planId) {
  try {
    console.log('🔗 הצגת פריטים מקושרים לתוכנית מסחר:', planId);
    if (typeof window.viewLinkedItems === 'function') {
      window.viewLinkedItems('trade_plan', planId);
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
 * פילטור תוכניות מסחר
 * @param {string} filterType - סוג הפילטר
 * @param {string} filterValue - ערך הפילטר
 */
async function filterTradePlans(filterType, filterValue) {
  try {
    if (!window.tradePlansData || !Array.isArray(window.tradePlansData)) {
      console.warn('⚠️ No trade plans data available for filtering');
      return;
    }

    let filteredData = [...window.tradePlansData];

    if (filterType && filterValue) {
      switch (filterType) {
        case 'status':
          filteredData = filteredData.filter(plan => plan.status === filterValue);
          break;
        case 'ticker':
          filteredData = filteredData.filter(plan => 
            plan.ticker_symbol && plan.ticker_symbol.toLowerCase().includes(filterValue.toLowerCase())
          );
          break;
        case 'name':
          filteredData = filteredData.filter(plan => 
            plan.name && plan.name.toLowerCase().includes(filterValue.toLowerCase())
          );
          break;
      }
    }

    window.TradePlansUI.updateTradePlansTable(filteredData);
    console.log(`✅ Filtered trade plans: ${filteredData.length} results`);
  } catch (error) {
    console.error('❌ Error filtering trade plans:', error);
  }
}

/**
 * רענון נתוני תוכניות מסחר
 */
async function refreshTradePlansData() {
  try {
    console.log('🔄 Refreshing trade plans data...');
    
    // ביטול מטמון
    await window.TradePlansData.invalidateTradePlansCache();
    
    // טעינה מחדש
    const data = await window.TradePlansData.loadTradePlansData();
    window.tradePlansData = data;
    
    // עדכון UI
    window.TradePlansUI.updateTradePlansTable(data);
    window.TradePlansUI.updateSummaryStats(data);
    
    console.log('✅ Trade plans data refreshed');
  } catch (error) {
    console.error('❌ Error refreshing trade plans data:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה ברענון נתוני תוכניות מסחר');
    }
  }
}

// אתחול העמוד
document.addEventListener('DOMContentLoaded', async () => {
  await initializeTradePlansPage();
});

// ייצוא פונקציות גלובליות
window.loadTradePlansData = () => window.TradePlansData.loadTradePlansData();
window.showAddTradePlanModal = () => window.TradePlansUI.showAddTradePlanModal();
window.updateTradePlansTable = (data) => window.TradePlansUI.updateTradePlansTable(data);
window.updateAddTickerInfo = updateAddTickerInfo;
window.enableAddFormFields = () => window.TradePlansUI.enableAddFormFields();
window.disableAddFormFields = () => window.TradePlansUI.disableAddFormFields();
window.saveNewTradePlan = saveNewTradePlan;
window.editTradePlan = editTradePlan;
window.viewLinkedItemsForTradePlan = viewLinkedItemsForTradePlan;
window.filterTradePlans = filterTradePlans;
window.refreshTradePlansData = refreshTradePlansData;
window.savePlanningSectionState = savePlanningSectionState;
window.restorePlanningSectionState = restorePlanningSectionState;

console.log('✅ Trade Plans Main module loaded');
