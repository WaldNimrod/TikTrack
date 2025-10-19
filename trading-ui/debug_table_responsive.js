/**
 * בדיקת הגדרות טבלה רספונסיבית - ITCSS Style
 * ============================================
 */

console.log('🔍 בדיקת הגדרות טבלה רספונסיבית - ITCSS Analysis');
console.log('================================================');

// בדיקת טבלה
const table = document.querySelector('#cashFlowsTable');
if (table) {
    console.log('✅ טבלה נמצאה:', table);
    
    // בדיקת computed styles - רק מה שחשוב
    const computedStyles = window.getComputedStyle(table);
    console.log('🎨 הגדרות computed של הטבלה:');
    console.log('  width:', computedStyles.width);
    console.log('  min-width:', computedStyles.minWidth);
    console.log('  table-layout:', computedStyles.tableLayout);
    
    // בדיקת קונטיינר
    const container = document.querySelector('#cashFlowsContainer');
    if (container) {
        console.log('✅ קונטיינר נמצא:', container);
        const containerStyles = window.getComputedStyle(container);
        console.log('🎨 הגדרות computed של הקונטיינר:');
        console.log('  width:', containerStyles.width);
        console.log('  overflow-x:', containerStyles.overflowX);
    }
    
    // בדיקת רוחב מסך
    console.log('📱 רוחב מסך נוכחי:', window.innerWidth + 'px');
    
    // בדיקת media queries
    const smQuery = window.matchMedia('(max-width: 767px)');
    const mdQuery = window.matchMedia('(max-width: 991px)');
    const lgQuery = window.matchMedia('(max-width: 1199px)');
    
    console.log('📺 Media Queries פעילות:');
    console.log('  SM (≤767px):', smQuery.matches ? '✅ פעיל' : '❌ לא פעיל');
    console.log('  MD (≤991px):', mdQuery.matches ? '✅ פעיל' : '❌ לא פעיל');
    console.log('  LG (≤1199px):', lgQuery.matches ? '✅ פעיל' : '❌ לא פעיל');
    
    // בדיקת רוחב בפועל
    console.log('📏 רוחב בפועל:');
    console.log('  טבלה:', table.offsetWidth + 'px');
    console.log('  קונטיינר:', container ? container.offsetWidth + 'px' : 'לא נמצא');
    
    // בדיקת גלילה
    console.log('🔄 בדיקת גלילה:');
    if (container) {
        console.log('  scrollWidth:', container.scrollWidth + 'px');
        console.log('  clientWidth:', container.clientWidth + 'px');
        console.log('  צריך גלילה:', container.scrollWidth > container.clientWidth ? '✅ כן' : '❌ לא');
    }
    
    // בדיקת מחלקות CSS
    console.log('🏷️ מחלקות CSS של הטבלה:');
    console.log('  class:', table.className);
    console.log('  id:', table.id);
    
    // בדיקת מחלקות CSS של הקונטיינר
    if (container) {
        console.log('🏷️ מחלקות CSS של הקונטיינר:');
        console.log('  class:', container.className);
        console.log('  id:', container.id);
    }
    
} else {
    console.log('❌ טבלה לא נמצאה');
}

console.log('================================================');
console.log('🎯 עכשיו אני יכול לזהות איזה מחלקות CSS צריך לעדכן!');
console.log('🎉 בדיקה הושלמה!');
