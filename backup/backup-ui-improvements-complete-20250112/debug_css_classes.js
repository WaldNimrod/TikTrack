// קוד בדיקה למחלקות CSS
console.log('🔍 בדיקת מחלקות CSS - TikTrack');

// פונקציה לבדיקת מחלקות CSS
function debugCSSClasses() {
    console.log('\n1️⃣ בדיקת מחלקות CSS בטבלה:');
    const table = document.getElementById('cashFlowsTable');
    if (!table) {
        console.log('❌ טבלה לא נמצאה');
        return;
    }
    
    // בדיקת מחלקות טבלה
    console.log('📋 מחלקות טבלה:');
    console.log('  - table classes:', table.className);
    console.log('  - table id:', table.id);
    console.log('  - data-table-type:', table.getAttribute('data-table-type'));
    
    // בדיקת מחלקות כותרות
    console.log('\n2️⃣ בדיקת מחלקות כותרות:');
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        console.log(`  ${index + 1}. ${header.textContent.trim()}`);
        console.log(`     classes: ${header.className}`);
        console.log(`     computed width: ${getComputedStyle(header).width}`);
        console.log(`     computed min-width: ${getComputedStyle(header).minWidth}`);
        console.log(`     computed max-width: ${getComputedStyle(header).maxWidth}`);
    });
    
    // בדיקת מחלקות תאים
    console.log('\n3️⃣ בדיקת מחלקות תאים:');
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length > 0) {
        const firstRow = rows[0];
        const cells = firstRow.querySelectorAll('td');
        cells.forEach((cell, index) => {
            console.log(`  ${index + 1}. ${cell.className}`);
            console.log(`     computed width: ${getComputedStyle(cell).width}`);
            console.log(`     computed min-width: ${getComputedStyle(cell).minWidth}`);
            console.log(`     computed max-width: ${getComputedStyle(cell).maxWidth}`);
            console.log(`     computed padding: ${getComputedStyle(cell).padding}`);
            console.log(`     computed overflow: ${getComputedStyle(cell).overflow}`);
        });
    }
    
    // בדיקת מחלקות עמודת פעולות
    console.log('\n4️⃣ בדיקת מחלקות עמודת פעולות:');
    const actionsCell = table.querySelector('.col-actions');
    if (actionsCell) {
        console.log('✅ עמודת פעולות נמצאה');
        console.log('  - classes:', actionsCell.className);
        console.log('  - computed width:', getComputedStyle(actionsCell).width);
        console.log('  - computed min-width:', getComputedStyle(actionsCell).minWidth);
        console.log('  - computed max-width:', getComputedStyle(actionsCell).maxWidth);
        console.log('  - computed padding:', getComputedStyle(actionsCell).padding);
        console.log('  - computed overflow:', getComputedStyle(actionsCell).overflow);
        console.log('  - computed white-space:', getComputedStyle(actionsCell).whiteSpace);
        console.log('  - computed display:', getComputedStyle(actionsCell).display);
        
        // בדיקת כפתורים
        const buttons = actionsCell.querySelectorAll('.btn');
        console.log(`\n🔘 כפתורים: ${buttons.length}`);
        buttons.forEach((btn, index) => {
            console.log(`  ${index + 1}. ${btn.textContent.trim()}`);
            console.log(`     classes: ${btn.className}`);
            console.log(`     computed width: ${getComputedStyle(btn).width}`);
            console.log(`     computed height: ${getComputedStyle(btn).height}`);
            console.log(`     computed margin: ${getComputedStyle(btn).margin}`);
            console.log(`     computed padding: ${getComputedStyle(btn).padding}`);
            console.log(`     computed display: ${getComputedStyle(btn).display}`);
        });
    }
    
    // בדיקת קונטיינר
    console.log('\n5️⃣ בדיקת קונטיינר:');
    const container = table.closest('.table-container') || table.closest('.content-wrapper') || table.parentElement;
    if (container) {
        console.log('✅ קונטיינר נמצא');
        console.log('  - classes:', container.className);
        console.log('  - computed width:', getComputedStyle(container).width);
        console.log('  - computed max-width:', getComputedStyle(container).maxWidth);
        console.log('  - computed overflow:', getComputedStyle(container).overflow);
    }
    
    // בדיקת כל המחלקות הרלוונטיות
    console.log('\n6️⃣ בדיקת כל המחלקות הרלוונטיות:');
    const allClasses = new Set();
    table.querySelectorAll('*').forEach(el => {
        el.className.split(' ').forEach(cls => {
            if (cls.includes('col-') || cls.includes('actions') || cls.includes('table')) {
                allClasses.add(cls);
            }
        });
    });
    
    console.log('📋 מחלקות רלוונטיות:');
    Array.from(allClasses).sort().forEach(cls => {
        console.log(`  - ${cls}`);
    });
}

// הרצה אוטומטית
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugCSSClasses);
} else {
    debugCSSClasses();
}

// הוספה ל-global scope
window.debugCSSClasses = debugCSSClasses;

console.log('✅ קוד בדיקת מחלקות CSS נטען - הרץ debugCSSClasses() לבדיקה ידנית');
