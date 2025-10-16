// קוד בדיקה מקיף לטבלאות
console.log('🔍 בדיקה מקיפה של טבלאות - TikTrack');

// פונקציה לבדיקה מקיפה
function debugComplete() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 בדיקה מקיפה של טבלת תזרימי מזומנים');
    console.log('='.repeat(80));
    
    // 1. בדיקת טבלה
    const table = document.getElementById('cashFlowsTable');
    if (!table) {
        console.log('❌ טבלה לא נמצאה');
        return;
    }
    
    console.log('\n1️⃣ מידע בסיסי על הטבלה:');
    console.log('  - ID:', table.id);
    console.log('  - Classes:', table.className);
    console.log('  - Data type:', table.getAttribute('data-table-type'));
    console.log('  - רוחב טבלה:', table.offsetWidth + 'px');
    console.log('  - גובה טבלה:', table.offsetHeight + 'px');
    
    // 2. בדיקת viewport
    console.log('\n2️⃣ מידע על המסך:');
    console.log('  - רוחב viewport:', window.innerWidth + 'px');
    console.log('  - גובה viewport:', window.innerHeight + 'px');
    console.log('  - רוחב מסך:', screen.width + 'px');
    console.log('  - גובה מסך:', screen.height + 'px');
    
    // 3. בדיקת media queries
    console.log('\n3️⃣ בדיקת media queries:');
    const mediaQueries = [
        { query: '(max-width: 479px)', name: 'XS - טלפונים קטנים' },
        { query: '(max-width: 767px)', name: 'SM - טלפונים' },
        { query: '(max-width: 991px)', name: 'MD - טאבלטים' },
        { query: '(max-width: 1199px)', name: 'LG - מחשבים קטנים' },
        { query: '(min-width: 1200px)', name: 'XL - מחשבים גדולים' }
    ];
    
    mediaQueries.forEach(mq => {
        const matches = window.matchMedia(mq.query).matches;
        console.log(`  - ${mq.name}: ${matches ? '✅ פעיל' : '❌ לא פעיל'}`);
    });
    
    // 4. בדיקת כותרות
    console.log('\n4️⃣ בדיקת כותרות עמודות:');
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        const style = getComputedStyle(header);
        console.log(`  ${index + 1}. ${header.textContent.trim()}`);
        console.log(`     Classes: ${header.className}`);
        console.log(`     Width: ${header.offsetWidth}px (computed: ${style.width})`);
        console.log(`     Min-width: ${style.minWidth}`);
        console.log(`     Max-width: ${style.maxWidth}`);
    });
    
    // 5. בדיקת תאים
    console.log('\n5️⃣ בדיקת תאים:');
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length > 0) {
        const firstRow = rows[0];
        const cells = firstRow.querySelectorAll('td');
        cells.forEach((cell, index) => {
            const style = getComputedStyle(cell);
            console.log(`  ${index + 1}. ${cell.className}`);
            console.log(`     Width: ${cell.offsetWidth}px (computed: ${style.width})`);
            console.log(`     Min-width: ${style.minWidth}`);
            console.log(`     Max-width: ${style.maxWidth}`);
            console.log(`     Padding: ${style.padding}`);
            console.log(`     Overflow: ${style.overflow}`);
        });
    }
    
    // 6. בדיקת עמודת פעולות
    console.log('\n6️⃣ בדיקת עמודת פעולות:');
    const actionsCell = table.querySelector('.col-actions');
    if (actionsCell) {
        const style = getComputedStyle(actionsCell);
        console.log('  ✅ עמודת פעולות נמצאה');
        console.log('  - Classes:', actionsCell.className);
        console.log('  - Width:', actionsCell.offsetWidth + 'px (computed: ' + style.width + ')');
        console.log('  - Min-width:', style.minWidth);
        console.log('  - Max-width:', style.maxWidth);
        console.log('  - Padding:', style.padding);
        console.log('  - Overflow:', style.overflow);
        console.log('  - White-space:', style.whiteSpace);
        console.log('  - Display:', style.display);
        
        // בדיקת כפתורים
        const buttons = actionsCell.querySelectorAll('.btn');
        console.log(`  - כפתורים: ${buttons.length}`);
        buttons.forEach((btn, index) => {
            const btnStyle = getComputedStyle(btn);
            console.log(`    ${index + 1}. ${btn.textContent.trim()}`);
            console.log(`       Classes: ${btn.className}`);
            console.log(`       Width: ${btn.offsetWidth}px (computed: ${btnStyle.width})`);
            console.log(`       Height: ${btn.offsetHeight}px (computed: ${btnStyle.height})`);
            console.log(`       Margin: ${btnStyle.margin}`);
            console.log(`       Padding: ${btnStyle.padding}`);
            console.log(`       Display: ${btnStyle.display}`);
        });
    } else {
        console.log('  ❌ עמודת פעולות לא נמצאה');
    }
    
    // 7. בדיקת קונטיינר
    console.log('\n7️⃣ בדיקת קונטיינר:');
    const container = table.closest('.table-container') || table.closest('.content-wrapper') || table.parentElement;
    if (container) {
        const containerStyle = getComputedStyle(container);
        console.log('  ✅ קונטיינר נמצא');
        console.log('  - Classes:', container.className);
        console.log('  - Width:', container.offsetWidth + 'px (computed: ' + containerStyle.width + ')');
        console.log('  - Max-width:', containerStyle.maxWidth);
        console.log('  - Overflow:', containerStyle.overflow);
    } else {
        console.log('  ❌ קונטיינר לא נמצא');
    }
    
    // 8. בדיקת CSS rules
    console.log('\n8️⃣ בדיקת CSS rules:');
    const tableStyle = getComputedStyle(table);
    console.log('  - Table-layout:', tableStyle.tableLayout);
    console.log('  - Width:', tableStyle.width);
    console.log('  - Min-width:', tableStyle.minWidth);
    console.log('  - Max-width:', tableStyle.maxWidth);
    console.log('  - Overflow:', tableStyle.overflow);
    console.log('  - Overflow-x:', tableStyle.overflowX);
    console.log('  - Direction:', tableStyle.direction);
    
    // 9. סיכום
    console.log('\n9️⃣ סיכום:');
    const totalWidth = Array.from(headers).reduce((sum, header) => sum + header.offsetWidth, 0);
    console.log('  - רוחב כולל של כל העמודות:', totalWidth + 'px');
    console.log('  - רוחב הטבלה:', table.offsetWidth + 'px');
    console.log('  - רוחב viewport:', window.innerWidth + 'px');
    console.log('  - האם יש גלילה?', totalWidth > window.innerWidth ? '✅ כן' : '❌ לא');
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ בדיקה מקיפה הושלמה');
    console.log('='.repeat(80));
}

// הרצה אוטומטית
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugComplete);
} else {
    debugComplete();
}

// הוספה ל-global scope
window.debugComplete = debugComplete;

console.log('✅ קוד בדיקה מקיף נטען - הרץ debugComplete() לבדיקה ידנית');
