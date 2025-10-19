/**
 * Debug Table Display - TikTrack
 * ==============================
 * 
 * בדיקת תצוגת הטבלה במערכת הלוגים
 */

function debugTableDisplay() {
    console.clear();
    console.log('🔍 בודק תצוגת הטבלה במערכת הלוגים...\n');
    
    // בדוק את הקונטיינר
    const container = document.getElementById('unified-logs-container');
    if (!container) {
        console.log('❌ unified-logs-container לא נמצא!');
        return;
    }
    
    console.log('✅ unified-logs-container נמצא');
    console.log(`   📏 גודל: ${container.offsetWidth}x${container.offsetHeight}`);
    console.log(`   👁️ נראה: ${container.offsetParent !== null ? 'כן' : 'לא'}`);
    console.log(`   🎨 Display: ${window.getComputedStyle(container).display}`);
    
    // בדוק את הטבלה
    const table = container.querySelector('.log-table');
    if (!table) {
        console.log('❌ .log-table לא נמצא!');
        return;
    }
    
    console.log('✅ .log-table נמצא');
    console.log(`   📏 גודל: ${table.offsetWidth}x${table.offsetHeight}`);
    
    // בדוק את ה-tbody
    const tbody = table.querySelector('.log-table-body');
    if (!tbody) {
        console.log('❌ .log-table-body לא נמצא!');
        return;
    }
    
    console.log('✅ .log-table-body נמצא');
    console.log(`   📏 גודל: ${tbody.offsetWidth}x${tbody.offsetHeight}`);
    console.log(`   👶 Children: ${tbody.children.length}`);
    
    if (tbody.children.length === 0) {
        console.log('⚠️ הטבלה ריקה - אין שורות!');
    } else {
        console.log('✅ הטבלה מכילה שורות:');
        Array.from(tbody.children).forEach((row, i) => {
            console.log(`   ${i+1}. ${row.tagName} - ${row.offsetWidth}x${row.offsetHeight}`);
            const cells = row.querySelectorAll('td');
            console.log(`      תאים: ${cells.length}`);
            cells.forEach((cell, j) => {
                console.log(`         ${j+1}. "${cell.textContent.trim()}"`);
            });
        });
    }
    
    // בדוק את הכותרת
    const thead = table.querySelector('.log-table-header');
    if (thead) {
        console.log('✅ .log-table-header נמצא');
        const headers = thead.querySelectorAll('th');
        console.log(`   כותרות: ${headers.length}`);
        headers.forEach((header, i) => {
            console.log(`      ${i+1}. "${header.textContent.trim()}"`);
        });
    }
    
    // בדוק אם יש הודעת "אין נתונים"
    const emptyMessage = container.querySelector('.empty-message, .no-data, .empty-state');
    if (emptyMessage) {
        console.log('📭 נמצאה הודעת "אין נתונים":');
        console.log(`   "${emptyMessage.textContent.trim()}"`);
    }
    
    // בדוק אם יש הודעת טעינה
    const loadingMessage = container.querySelector('.loading, .spinner, .loading-message');
    if (loadingMessage) {
        console.log('⏳ נמצאה הודעת טעינה:');
        console.log(`   "${loadingMessage.textContent.trim()}"`);
    }
}

// הפעל בדיקה
debugTableDisplay();

// הוסף לגלובל
window.debugTableDisplay = debugTableDisplay;

console.log('\n💡 השתמש ב: debugTableDisplay() לבדיקה חוזרת');
