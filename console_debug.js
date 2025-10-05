// קוד בדיקה לרוץ ישירות מהקונסול
// העתק והדבק את הקוד הזה בקונסול

console.log('🔍 בדיקה ישירה של טבלת תזרימי מזומנים');

function debugTable() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 בדיקה ישירה של טבלת תזרימי מזומנים');
    console.log('='.repeat(60));
    
    // 1. בדיקת טבלה
    const table = document.getElementById('cashFlowsTable');
    if (!table) {
        console.log('❌ טבלה לא נמצאה');
        return;
    }
    
    console.log('\n1️⃣ מידע בסיסי:');
    console.log('  - רוחב viewport:', window.innerWidth + 'px');
    console.log('  - רוחב טבלה:', table.offsetWidth + 'px');
    console.log('  - גובה טבלה:', table.offsetHeight + 'px');
    
    // 2. בדיקת עמודות
    console.log('\n2️⃣ רוחב עמודות:');
    const headers = table.querySelectorAll('th');
    let totalWidth = 0;
    headers.forEach((header, index) => {
        const width = header.offsetWidth;
        totalWidth += width;
        const style = getComputedStyle(header);
        console.log(`  ${index + 1}. ${header.textContent.trim()}: ${width}px (computed: ${style.width})`);
        console.log(`     Classes: ${header.className}`);
    });
    console.log(`  📊 סה"כ: ${totalWidth}px`);
    
    // 3. בדיקת עמודת פעולות
    console.log('\n3️⃣ עמודת פעולות:');
    const actionsCell = table.querySelector('.col-actions');
    if (actionsCell) {
        const width = actionsCell.offsetWidth;
        const style = getComputedStyle(actionsCell);
        const buttons = actionsCell.querySelectorAll('.btn');
        console.log(`  - רוחב: ${width}px (computed: ${style.width})`);
        console.log(`  - min-width: ${style.minWidth}`);
        console.log(`  - max-width: ${style.maxWidth}`);
        console.log(`  - padding: ${style.padding}`);
        console.log(`  - overflow: ${style.overflow}`);
        console.log(`  - white-space: ${style.whiteSpace}`);
        console.log(`  - כפתורים: ${buttons.length}`);
        buttons.forEach((btn, index) => {
            const btnStyle = getComputedStyle(btn);
            console.log(`    ${index + 1}. ${btn.textContent.trim()}: ${btn.offsetWidth}px (computed: ${btnStyle.width})`);
            console.log(`       margin: ${btnStyle.margin}`);
        });
    } else {
        console.log('  ❌ עמודת פעולות לא נמצאה');
    }
    
    // 4. בדיקת media queries
    console.log('\n4️⃣ Media Queries:');
    const queries = [
        { query: '(max-width: 479px)', name: 'XS - טלפונים קטנים' },
        { query: '(max-width: 767px)', name: 'SM - טלפונים' },
        { query: '(max-width: 991px)', name: 'MD - טאבלטים' },
        { query: '(max-width: 1199px)', name: 'LG - מחשבים קטנים' },
        { query: '(min-width: 1200px)', name: 'XL - מחשבים גדולים' }
    ];
    
    queries.forEach(mq => {
        const matches = window.matchMedia(mq.query).matches;
        console.log(`  - ${mq.name}: ${matches ? '✅ פעיל' : '❌ לא פעיל'}`);
    });
    
    // 5. בדיקת קונטיינר
    console.log('\n5️⃣ קונטיינר:');
    const container = table.closest('.table-container') || table.closest('.content-wrapper') || table.parentElement;
    if (container) {
        const containerStyle = getComputedStyle(container);
        console.log(`  - רוחב: ${container.offsetWidth}px (computed: ${containerStyle.width})`);
        console.log(`  - max-width: ${containerStyle.maxWidth}`);
        console.log(`  - overflow: ${containerStyle.overflow}`);
        console.log(`  - classes: ${container.className}`);
    }
    
    // 6. סיכום
    console.log('\n6️⃣ סיכום:');
    console.log(`  - רוחב כולל עמודות: ${totalWidth}px`);
    console.log(`  - רוחב viewport: ${window.innerWidth}px`);
    console.log(`  - האם יש גלילה? ${totalWidth > window.innerWidth ? '✅ כן' : '❌ לא'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ בדיקה ישירה הושלמה');
    console.log('='.repeat(60));
}

// הרצה
debugTable();

console.log('✅ הבדיקה הושלמה - הרץ debugTable() לבדיקה נוספת');
