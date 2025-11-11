// Debug script - בדיקת showEditTradingAccountModalById
// להעתקה לקונסולה או להרצה ישירות

(function debugShowEditTradingAccountModalById() {
  console.log('🔍 === DEBUG: showEditTradingAccountModalById ===');
  
  // בדיקה 1: האם הפונקציה מוגדרת ב-window?
  console.log('1. typeof window.showEditTradingAccountModalById:', typeof window.showEditTradingAccountModalById);
  console.log('2. window.showEditTradingAccountModalById:', window.showEditTradingAccountModalById);
  
  // בדיקה 2: האם הקובץ trading_accounts.js נטען?
  const scripts = Array.from(document.querySelectorAll('script[src*="trading_accounts.js"]'));
  console.log('3. trading_accounts.js scripts found:', scripts.length);
  if (scripts.length > 0) {
    scripts.forEach((script, idx) => {
      console.log(`   Script ${idx + 1}:`, script.src, 'loaded:', script.complete);
    });
  }
  
  // בדיקה 3: האם יש שגיאות בטעינת הסקריפט?
  console.log('4. Checking for script loading errors...');
  
  // בדיקה 4: רשימת כל הפונקציות ב-window שמתחילות ב-showEdit
  const showEditFunctions = Object.keys(window).filter(key => 
    key.includes('showEdit') || key.includes('TradingAccount')
  );
  console.log('5. Available window functions (showEdit/TradingAccount):', showEditFunctions);
  
  // בדיקה 5: האם ModalManagerV2 קיים?
  console.log('6. window.ModalManagerV2:', typeof window.ModalManagerV2);
  if (window.ModalManagerV2) {
    console.log('   - window.ModalManagerV2.showEditModal:', typeof window.ModalManagerV2.showEditModal);
  }
  
  // בדיקה 6: בדיקה ידנית - ניסיון להגדיר את הפונקציה
  console.log('7. Attempting to manually define function...');
  if (typeof window.showEditTradingAccountModalById === 'undefined') {
    window.showEditTradingAccountModalById = function(accountId) {
      console.log('🔧 [Manual] showEditTradingAccountModalById called with:', accountId);
      if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
        window.ModalManagerV2.showEditModal('tradingAccountsModal', 'account', accountId);
      } else {
        console.error('❌ ModalManagerV2 not available');
      }
    };
    console.log('   ✅ Manually defined window.showEditTradingAccountModalById');
    console.log('   - typeof window.showEditTradingAccountModalById:', typeof window.showEditTradingAccountModalById);
  } else {
    console.log('   ℹ️ Function already exists');
  }
  
  console.log('🔍 === END DEBUG ===');
})();

