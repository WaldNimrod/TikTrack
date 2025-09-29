// קוד בדיקה פשוט לטבלאות
console.log('🔍 בדיקה פשוטה של טבלת תזרימי מזומנים');

function debugSimple() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 בדיקה פשוטה של טבלת תזרימי מזומנים');
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
    
    // 2. בדיקת עמודות
    console.log('\n2️⃣ רוחב עמודות:');
    const headers = table.querySelectorAll('th');
    let totalWidth = 0;
    headers.forEach((header, index) => {
        const width = header.offsetWidth;
        totalWidth += width;
        console.log(`  ${index + 1}. ${header.textContent.trim()}: ${width}px`);
    });
    console.log(`  📊 סה"כ: ${totalWidth}px`);
    
    // 3. בדיקת עמודת פעולות
    console.log('\n3️⃣ עמודת פעולות:');
    const actionsCell = table.querySelector('.col-actions');
    if (actionsCell) {
        const width = actionsCell.offsetWidth;
        const buttons = actionsCell.querySelectorAll('.btn');
        console.log(`  - רוחב: ${width}px`);
        console.log(`  - כפתורים: ${buttons.length}`);
        buttons.forEach((btn, index) => {
            console.log(`    ${index + 1}. ${btn.textContent.trim()}: ${btn.offsetWidth}px`);
        });
    } else {
        console.log('  ❌ עמודת פעולות לא נמצאה');
    }
    
    // 4. בדיקת media queries
    console.log('\n4️⃣ Media Queries:');
    const queries = [
        { query: '(max-width: 479px)', name: 'XS' },
        { query: '(max-width: 767px)', name: 'SM' },
        { query: '(max-width: 991px)', name: 'MD' },
        { query: '(max-width: 1199px)', name: 'LG' },
        { query: '(min-width: 1200px)', name: 'XL' }
    ];
    
    queries.forEach(mq => {
        const matches = window.matchMedia(mq.query).matches;
        console.log(`  - ${mq.name}: ${matches ? '✅' : '❌'}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ בדיקה פשוטה הושלמה');
    console.log('='.repeat(60));
}

// הרצה אוטומטית
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugSimple);
} else {
    debugSimple();
}

// הוספה ל-global scope
window.debugSimple = debugSimple;

console.log('✅ קוד בדיקה פשוט נטען - הרץ debugSimple() לבדיקה ידנית');
