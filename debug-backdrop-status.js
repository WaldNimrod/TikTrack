/**
 * קוד בדיקה למצב Backdrop במערכת
 * 
 * העתק והדבק את כל הקוד הזה לקונסולה כדי לבדוק את המצב הנוכחי
 */

(function() {
  console.log('%c🔍 בדיקת מצב Backdrop ומודולים', 'font-size: 16px; font-weight: bold; color: #26baac;');
  console.log('='.repeat(60));
  
  // 1. בדיקת Backdrops
  const allBackdrops = document.querySelectorAll('.modal-backdrop');
  const globalBackdrop = document.getElementById('globalModalBackdrop');
  const nonGlobalBackdrops = Array.from(allBackdrops).filter(b => b.id !== 'globalModalBackdrop');
  
  console.log('\n📊 סטטיסטיקות Backdrop:');
  console.log(`  • סך הכל backdrops: ${allBackdrops.length}`);
  console.log(`  • Backdrop גלובלי (globalModalBackdrop): ${globalBackdrop ? '✅ קיים' : '❌ לא קיים'}`);
  console.log(`  • Backdrops אחרים (לא גלובלי): ${nonGlobalBackdrops.length}`);
  
  if (allBackdrops.length > 0) {
    console.log('\n📋 פרטי Backdrops:');
    allBackdrops.forEach((backdrop, index) => {
      const styles = window.getComputedStyle(backdrop);
      console.log(`\n  [${index + 1}] ID: ${backdrop.id || '(ללא ID)'}`);
      console.log(`      Classes: ${backdrop.className}`);
      console.log(`      Z-Index: ${styles.zIndex}`);
      console.log(`      Display: ${styles.display}`);
      console.log(`      Visibility: ${styles.visibility}`);
      console.log(`      Opacity: ${styles.opacity}`);
      console.log(`      Parent: ${backdrop.parentElement?.tagName || 'none'}`);
      console.log(`      Is Global: ${backdrop.id === 'globalModalBackdrop' ? '✅' : '❌'}`);
    });
  }
  
  // 2. בדיקת מודולים פתוחים
  const modalsWithShowClass = document.querySelectorAll('.modal.show');
  const modalsWithDisplayBlock = Array.from(document.querySelectorAll('.modal')).filter(m => {
    const style = window.getComputedStyle(m);
    return style.display === 'block';
  });
  const allOpenModals = new Set([...modalsWithShowClass, ...modalsWithDisplayBlock]);
  
  console.log('\n📦 סטטיסטיקות מודולים:');
  console.log(`  • מודולים עם class 'show': ${modalsWithShowClass.length}`);
  console.log(`  • מודולים עם display:block: ${modalsWithDisplayBlock.length}`);
  console.log(`  • סך הכל מודולים פתוחים (יחיד): ${allOpenModals.size}`);
  
  if (allOpenModals.size > 0) {
    console.log('\n📋 פרטי מודולים פתוחים:');
    allOpenModals.forEach((modal, index) => {
      const styles = window.getComputedStyle(modal);
      const bsModal = bootstrap?.Modal?.getInstance(modal);
      console.log(`\n  [${index + 1}] ID: ${modal.id || '(ללא ID)'}`);
      console.log(`      Classes: ${modal.className}`);
      console.log(`      Display: ${styles.display}`);
      console.log(`      Visibility: ${styles.visibility}`);
      console.log(`      Aria-hidden: ${modal.getAttribute('aria-hidden') || 'לא מוגדר'}`);
      console.log(`      Bootstrap Instance: ${bsModal ? '✅ קיים' : '❌ לא קיים'}`);
      if (bsModal) {
        console.log(`      Backdrop option: ${bsModal._config?.backdrop !== false ? '✅ מופעל' : '❌ מושבת'}`);
      }
    });
  }
  
  // 3. בדיקת ModalNavigationManager
  const navManager = window.modalNavigationManager;
  console.log('\n🎯 סטטוס ModalNavigationManager:');
  if (navManager) {
    console.log(`  • מותאחל: ${navManager.isInitialized ? '✅' : '❌'}`);
    console.log(`  • Backdrop גלובלי: ${navManager.globalBackdrop ? '✅ קיים' : '❌ לא קיים'}`);
    console.log(`  • אורך היסטוריה: ${navManager.modalHistory?.length || 0}`);
    console.log(`  • Backdrop Observer: ${navManager.backdropObserver ? '✅ פעיל' : '❌ לא פעיל'}`);
    console.log(`  • Cleanup Interval: ${navManager.backdropCleanupInterval ? '✅ פעיל' : '❌ לא פעיל'}`);
    
    if (navManager.modalHistory && navManager.modalHistory.length > 0) {
      console.log('\n📜 היסטוריית מודולים:');
      navManager.modalHistory.forEach((item, index) => {
        console.log(`  [${index + 1}] ${item.info?.entityType || 'unknown'}#${item.info?.entityId || 'unknown'} - ${item.element?.id || 'no element'}`);
      });
    }
  } else {
    console.log('  ❌ ModalNavigationManager לא קיים');
  }
  
  // 4. בדיקת Body
  console.log('\n🌐 סטטוס Body:');
  console.log(`  • Class 'modal-open': ${document.body.classList.contains('modal-open') ? '✅ כן' : '❌ לא'}`);
  console.log(`  • Padding-right: ${document.body.style.paddingRight || window.getComputedStyle(document.body).paddingRight}`);
  
  // 5. בדיקת התאמה בין מודולים ל-backdrop
  console.log('\n⚖️ בדיקת התאמה:');
  const shouldHaveBackdrop = allOpenModals.size > 0 || (navManager && navManager.modalHistory?.length > 0);
  const hasBackdrop = allBackdrops.length > 0;
  const hasCorrectBackdrop = globalBackdrop && nonGlobalBackdrops.length === 0;
  
  console.log(`  • צריך backdrop: ${shouldHaveBackdrop ? '✅ כן' : '❌ לא'}`);
  console.log(`  • יש backdrop: ${hasBackdrop ? '✅ כן' : '❌ לא'}`);
  console.log(`  • Backdrop תקין (רק גלובלי): ${hasCorrectBackdrop ? '✅ כן' : '❌ לא'}`);
  
  if (shouldHaveBackdrop && !hasBackdrop) {
    console.log('\n⚠️ בעיה: צריך backdrop אבל אין!');
  }
  if (!shouldHaveBackdrop && hasBackdrop) {
    console.log('\n⚠️ בעיה: יש backdrop אבל לא צריך!');
  }
  if (nonGlobalBackdrops.length > 0) {
    console.log(`\n⚠️ בעיה: יש ${nonGlobalBackdrops.length} backdrop(s) נוספים פרט לגלובלי!`);
    console.log('   IDs:', nonGlobalBackdrops.map(b => b.id || '(ללא ID)').join(', '));
  }
  if (hasCorrectBackdrop && shouldHaveBackdrop && hasBackdrop) {
    console.log('\n✅ מצב תקין: יש רק backdrop גלובלי אחד כנדרש');
  }
  
  // 6. סיכום והמלצות
  console.log('\n💡 המלצות:');
  if (nonGlobalBackdrops.length > 0) {
    console.log('  • יש לבדוק למה נוצרו backdrops נוספים');
    console.log('  • להריץ: window.modalNavigationManager.manageBackdrop()');
  }
  if (shouldHaveBackdrop && !globalBackdrop) {
    console.log('  • יש ליצור backdrop גלובלי');
    console.log('  • להריץ: window.modalNavigationManager.createGlobalBackdrop()');
  }
  if (!shouldHaveBackdrop && hasBackdrop) {
    console.log('  • יש לנקות backdrop שאינם נדרשים');
    console.log('  • להריץ: window.modalNavigationManager.manageBackdrop()');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ בדיקה הושלמה');
  console.log('\n💻 פקודות שימושיות:');
  console.log('  • window.modalNavigationManager.manageBackdrop() - ניהול backdrop מחדש');
  console.log('  • document.querySelectorAll(".modal-backdrop").forEach(b => b.remove()) - הסרת כל ה-backdrops');
  console.log('  • document.querySelectorAll(".modal.show") - רשימת מודולים פתוחים');
  
  // החזרת אובייקט עם הנתונים
  return {
    backdrops: {
      total: allBackdrops.length,
      global: globalBackdrop ? 1 : 0,
      others: nonGlobalBackdrops.length,
      list: Array.from(allBackdrops).map(b => ({
        id: b.id,
        classes: b.className,
        zIndex: window.getComputedStyle(b).zIndex
      }))
    },
    modals: {
      open: allOpenModals.size,
      withShowClass: modalsWithShowClass.length,
      withDisplayBlock: modalsWithDisplayBlock.length,
      list: Array.from(allOpenModals).map(m => ({
        id: m.id,
        classes: m.className,
        ariaHidden: m.getAttribute('aria-hidden')
      }))
    },
    navigationManager: navManager ? {
      initialized: navManager.isInitialized,
      hasGlobalBackdrop: !!navManager.globalBackdrop,
      historyLength: navManager.modalHistory?.length || 0,
      hasObserver: !!navManager.backdropObserver,
      hasCleanupInterval: !!navManager.backdropCleanupInterval
    } : null,
    body: {
      hasModalOpen: document.body.classList.contains('modal-open'),
      paddingRight: document.body.style.paddingRight || window.getComputedStyle(document.body).paddingRight
    },
    status: {
      shouldHaveBackdrop,
      hasBackdrop,
      hasCorrectBackdrop,
      isHealthy: shouldHaveBackdrop === hasBackdrop && hasCorrectBackdrop
    }
  };
})();

