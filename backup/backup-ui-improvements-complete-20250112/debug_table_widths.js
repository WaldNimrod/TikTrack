// קוד בדיקה לרוחב טבלאות
console.log('🔍 בדיקת רוחב טבלאות - TikTrack');

// פונקציה לבדיקת רוחב עמודות
function debugTableWidths() {
    console.log('\n1️⃣ בדיקת הטבלה הראשית:');
    const table = document.getElementById('cashFlowsTable');
    if (!table) {
        console.log('❌ טבלה לא נמצאה');
        return;
    }
    
    console.log('✅ טבלה נמצאה:', table.id);
    console.log('📏 רוחב טבלה:', table.offsetWidth + 'px');
    console.log('📏 רוחב טבלה (computed):', getComputedStyle(table).width);
    
    // בדיקת עמודות
    console.log('\n2️⃣ בדיקת עמודות:');
    const headers = table.querySelectorAll('th');
    const rows = table.querySelectorAll('tbody tr');
    
    if (headers.length > 0) {
        console.log('📋 כותרות עמודות:');
        headers.forEach((header, index) => {
            const classes = header.className;
            const width = header.offsetWidth;
            const computedWidth = getComputedStyle(header).width;
            console.log(`  ${index + 1}. ${header.textContent.trim()} - ${classes}`);
            console.log(`     רוחב: ${width}px, computed: ${computedWidth}`);
        });
    }
    
    if (rows.length > 0) {
        console.log('\n📋 תאים בעמודה הראשונה:');
        const firstRow = rows[0];
        const cells = firstRow.querySelectorAll('td');
        cells.forEach((cell, index) => {
            const classes = cell.className;
            const width = cell.offsetWidth;
            const computedWidth = getComputedStyle(cell).width;
            console.log(`  ${index + 1}. ${classes}`);
            console.log(`     רוחב: ${width}px, computed: ${computedWidth}`);
        });
    }
    
    // בדיקת עמודת פעולות
    console.log('\n3️⃣ בדיקת עמודת פעולות:');
    const actionsCell = table.querySelector('.col-actions');
    if (actionsCell) {
        console.log('✅ עמודת פעולות נמצאה');
        console.log('📏 רוחב:', actionsCell.offsetWidth + 'px');
        console.log('📏 computed width:', getComputedStyle(actionsCell).width);
        console.log('📏 computed max-width:', getComputedStyle(actionsCell).maxWidth);
        console.log('📏 computed min-width:', getComputedStyle(actionsCell).minWidth);
        console.log('📏 computed padding:', getComputedStyle(actionsCell).padding);
        console.log('📏 computed overflow:', getComputedStyle(actionsCell).overflow);
        
        // בדיקת כפתורים
        const buttons = actionsCell.querySelectorAll('.btn');
        console.log(`\n🔘 כפתורים בעמודת פעולות: ${buttons.length}`);
        buttons.forEach((btn, index) => {
            console.log(`  ${index + 1}. ${btn.textContent.trim()} - ${btn.className}`);
            console.log(`     רוחב: ${btn.offsetWidth}px, computed: ${getComputedStyle(btn).width}`);
            console.log(`     margin: ${getComputedStyle(btn).margin}`);
        });
    } else {
        console.log('❌ עמודת פעולות לא נמצאה');
    }
    
    // בדיקת קונטיינר
    console.log('\n4️⃣ בדיקת קונטיינר:');
    const container = table.closest('.table-container') || table.closest('.content-wrapper') || table.parentElement;
    if (container) {
        console.log('✅ קונטיינר נמצא:', container.className);
        console.log('📏 רוחב קונטיינר:', container.offsetWidth + 'px');
        console.log('📏 computed width:', getComputedStyle(container).width);
        console.log('📏 computed max-width:', getComputedStyle(container).maxWidth);
    }
    
    // בדיקת viewport
    console.log('\n5️⃣ בדיקת viewport:');
    console.log('📏 רוחב viewport:', window.innerWidth + 'px');
    console.log('📏 רוחב מסך:', screen.width + 'px');
    
    // בדיקת CSS classes
    console.log('\n6️⃣ בדיקת מחלקות CSS:');
    const allClasses = new Set();
    table.querySelectorAll('*').forEach(el => {
        el.className.split(' ').forEach(cls => {
            if (cls.includes('col-') || cls.includes('actions')) {
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
    document.addEventListener('DOMContentLoaded', debugTableWidths);
} else {
    debugTableWidths();
}

// הוספה ל-global scope
window.debugTableWidths = debugTableWidths;

console.log('✅ קוד בדיקה נטען - הרץ debugTableWidths() לבדיקה ידנית');
