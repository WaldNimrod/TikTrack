// בדיקת קונטיינר
console.log('🔍 בדיקת קונטיינר');

function debugContainer() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 בדיקת קונטיינר');
    console.log('='.repeat(60));
    
    // 1. בדיקת טבלה
    const table = document.getElementById('cashFlowsTable');
    if (!table) {
        console.log('❌ טבלה לא נמצאה');
        return;
    }
    
    // 2. בדיקת קונטיינר
    const container = table.closest('.table-container') || table.closest('.content-wrapper') || table.parentElement;
    if (container) {
        console.log('\n📦 קונטיינר:');
        console.log('  - element:', container);
        console.log('  - classes:', container.className);
        console.log('  - רוחב:', container.offsetWidth + 'px');
        console.log('  - computed width:', getComputedStyle(container).width);
        console.log('  - computed max-width:', getComputedStyle(container).maxWidth);
        console.log('  - computed overflow:', getComputedStyle(container).overflow);
        console.log('  - computed overflow-x:', getComputedStyle(container).overflowX);
    }
    
    // 3. בדיקת טבלה
    console.log('\n📊 טבלה:');
    console.log('  - רוחב:', table.offsetWidth + 'px');
    console.log('  - computed width:', getComputedStyle(table).width);
    console.log('  - computed min-width:', getComputedStyle(table).minWidth);
    console.log('  - computed max-width:', getComputedStyle(table).maxWidth);
    console.log('  - computed overflow:', getComputedStyle(table).overflow);
    console.log('  - computed overflow-x:', getComputedStyle(table).overflowX);
    console.log('  - computed table-layout:', getComputedStyle(table).tableLayout);
    
    // 4. בדיקת עמודת פעולות
    const actionsCell = table.querySelector('.col-actions');
    if (actionsCell) {
        console.log('\n🔘 עמודת פעולות:');
        console.log('  - רוחב:', actionsCell.offsetWidth + 'px');
        console.log('  - computed width:', getComputedStyle(actionsCell).width);
        console.log('  - computed min-width:', getComputedStyle(actionsCell).minWidth);
        console.log('  - computed max-width:', getComputedStyle(actionsCell).maxWidth);
        console.log('  - computed padding:', getComputedStyle(actionsCell).padding);
        console.log('  - computed overflow:', getComputedStyle(actionsCell).overflow);
        console.log('  - computed white-space:', getComputedStyle(actionsCell).whiteSpace);
        console.log('  - computed display:', getComputedStyle(actionsCell).display);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ בדיקת קונטיינר הושלמה');
    console.log('='.repeat(60));
}

// הרצה עם עיכוב
setTimeout(debugContainer, 1000);

// הוספה ל-global scope
window.debugContainer = debugContainer;

console.log('✅ קוד בדיקת קונטיינר נטען - הרץ debugContainer() לבדיקה ידנית');
