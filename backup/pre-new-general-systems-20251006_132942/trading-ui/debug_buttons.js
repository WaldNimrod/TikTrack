// קוד בדיקה לכפתורים
console.log('🔍 בדיקת כפתורים בטבלה');

function debugButtons() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 בדיקת כפתורים בטבלה');
    console.log('='.repeat(60));
    
    // 1. בדיקת טבלה
    const table = document.getElementById('cashFlowsTable');
    if (!table) {
        console.log('❌ טבלה לא נמצאה');
        return;
    }
    
    console.log('\n1️⃣ מידע בסיסי:');
    console.log('  - טבלה נמצאה:', table.id);
    
    // 2. בדיקת שורות
    const rows = table.querySelectorAll('tbody tr');
    console.log(`\n2️⃣ שורות בטבלה: ${rows.length}`);
    
    if (rows.length > 0) {
        const firstRow = rows[0];
        console.log('  - שורה ראשונה:', firstRow);
        
        // בדיקת תאים
        const cells = firstRow.querySelectorAll('td');
        console.log(`  - תאים בשורה: ${cells.length}`);
        
        cells.forEach((cell, index) => {
            console.log(`    ${index + 1}. ${cell.className}: ${cell.textContent.trim()}`);
        });
        
        // בדיקת עמודת פעולות
        const actionsCell = firstRow.querySelector('.col-actions');
        if (actionsCell) {
            console.log('\n3️⃣ עמודת פעולות:');
            console.log('  - נמצאה:', actionsCell.className);
            console.log('  - תוכן:', actionsCell.innerHTML);
            
            // בדיקת כפתורים
            const buttons = actionsCell.querySelectorAll('.btn');
            console.log(`  - כפתורים: ${buttons.length}`);
            
            buttons.forEach((btn, index) => {
                console.log(`    ${index + 1}. ${btn.className}: ${btn.textContent.trim()}`);
            });
            
            // בדיקת כל האלמנטים
            const allElements = actionsCell.querySelectorAll('*');
            console.log(`  - כל האלמנטים: ${allElements.length}`);
            
            allElements.forEach((el, index) => {
                console.log(`    ${index + 1}. ${el.tagName}: ${el.className}`);
            });
        } else {
            console.log('\n3️⃣ עמודת פעולות לא נמצאה');
        }
    } else {
        console.log('\n2️⃣ אין שורות בטבלה');
    }
    
    // 4. בדיקת פונקציות
    console.log('\n4️⃣ בדיקת פונקציות:');
    console.log('  - createLinkButton:', typeof window.createLinkButton);
    console.log('  - createEditButton:', typeof window.createEditButton);
    console.log('  - createDeleteButton:', typeof window.createDeleteButton);
    
    // 5. בדיקת נתונים
    console.log('\n5️⃣ בדיקת נתונים:');
    console.log('  - cashFlowsData:', typeof window.cashFlowsData);
    if (window.cashFlowsData) {
        console.log('  - מספר רשומות:', window.cashFlowsData.length);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ בדיקת כפתורים הושלמה');
    console.log('='.repeat(60));
}

// הרצה אוטומטית
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugButtons);
} else {
    debugButtons();
}

// הוספה ל-global scope
window.debugButtons = debugButtons;

console.log('✅ קוד בדיקת כפתורים נטען - הרץ debugButtons() לבדיקה ידנית');
