// קוד בדיקה סופי לרוץ ישירות מהקונסול
// העתק והדבק את הקוד הזה בקונסול

console.log('🔍 בדיקה סופית של טבלת תזרימי מזומנים');

function debugFinal() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 בדיקה סופית של טבלת תזרימי מזומנים');
    console.log('='.repeat(60));
    
    // 1. בדיקת טבלה
    const table = document.getElementById('cashFlowsTable');
    if (!table) {
        console.log('❌ טבלה לא נמצאה');
        return;
    }
    
    console.log('\n1️⃣ מידע בסיסי:');
    console.log('  - טבלה:', table.id);
    console.log('  - רוחב viewport:', window.innerWidth + 'px');
    console.log('  - רוחב טבלה:', table.offsetWidth + 'px');
    
    // 2. בדיקת שורות
    const rows = table.querySelectorAll('tbody tr');
    console.log(`\n2️⃣ שורות: ${rows.length}`);
    
    if (rows.length > 0) {
        const firstRow = rows[0];
        console.log('  - שורה ראשונה:', firstRow);
        
        // בדיקת תאים
        const cells = firstRow.querySelectorAll('td');
        console.log(`  - תאים: ${cells.length}`);
        
        cells.forEach((cell, index) => {
            console.log(`    ${index + 1}. ${cell.className}: ${cell.textContent.trim()}`);
        });
        
        // בדיקת עמודת פעולות
        const actionsCell = firstRow.querySelector('.col-actions');
        if (actionsCell) {
            console.log('\n3️⃣ עמודת פעולות:');
            console.log('  - נמצאה:', actionsCell.className);
            console.log('  - רוחב:', actionsCell.offsetWidth + 'px');
            console.log('  - תוכן HTML:', actionsCell.innerHTML);
            
            // בדיקת כפתורים
            const buttons = actionsCell.querySelectorAll('.btn');
            console.log(`  - כפתורים: ${buttons.length}`);
            
            buttons.forEach((btn, index) => {
                console.log(`    ${index + 1}. ${btn.className}: ${btn.textContent.trim()}`);
                console.log(`       רוחב: ${btn.offsetWidth}px`);
            });
        } else {
            console.log('\n3️⃣ עמודת פעולות לא נמצאה');
        }
    } else {
        console.log('\n2️⃣ אין שורות בטבלה');
    }
    
    // 4. בדיקת נתונים
    console.log('\n4️⃣ בדיקת נתונים:');
    console.log('  - cashFlowsData:', typeof window.cashFlowsData);
    if (window.cashFlowsData) {
        console.log('  - מספר רשומות:', window.cashFlowsData.length);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ בדיקה סופית הושלמה');
    console.log('='.repeat(60));
}

// הרצה
debugFinal();

console.log('✅ הבדיקה הסופית הושלמה - הרץ debugFinal() לבדיקה נוספת');
