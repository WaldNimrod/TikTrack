// קוד בדיקה מהיר למערכת תפריט פעולות
// הרץ את הקוד הזה בקונסול הדפדפן

console.log('=== 🔍 בדיקה מהירה למערכת תפריט פעולות ===');

// בדיקה 1: ActionsMenuSystem
console.log('1. ActionsMenuSystem:', typeof window.ActionsMenuSystem);

// בדיקה 2: actionsMenuSystem instance
console.log('2. actionsMenuSystem instance:', typeof window.actionsMenuSystem);

// בדיקה 3: createActionsMenu function
console.log('3. createActionsMenu function:', typeof window.createActionsMenu);

// בדיקה 4: debugActionsMenu function
console.log('4. debugActionsMenu function:', typeof window.debugActionsMenu);

// בדיקה 5: test createActionsMenu
if (typeof window.createActionsMenu === 'function') {
    console.log('5. מנסה ליצור תפריט בדיקה...');
    try {
        const testButtons = [
            { type: 'VIEW', onclick: 'console.log("test view")', title: 'צפה' },
            { type: 'EDIT', onclick: 'console.log("test edit")', title: 'ערוך' }
        ];
        
        const result = window.createActionsMenu(testButtons);
        console.log('5. createActionsMenu result:', result);
        
        // הוסף את התוצאה לעמוד
        const testDiv = document.createElement('div');
        testDiv.innerHTML = result;
        testDiv.style.border = '1px solid #ccc';
        testDiv.style.padding = '10px';
        testDiv.style.margin = '10px 0';
        document.body.appendChild(testDiv);
        
    } catch (error) {
        console.error('5. Error in createActionsMenu:', error);
    }
} else {
    console.error('5. createActionsMenu is not a function!');
}

// בדיקה 6: בדיקת scripts loaded
console.log('6. בדיקת סקריפטים שנטענו:');
const scripts = document.querySelectorAll('script[src*="actions-menu-system"]');
console.log('Scripts found:', scripts.length);
scripts.forEach((script, index) => {
    console.log(`Script ${index + 1}:`, script.src);
});

// בדיקה 7: בדיקת DOM elements
console.log('7. בדיקת אלמנטי DOM:');
const actionsCells = document.querySelectorAll('.actions-cell');
console.log('Actions cells found:', actionsCells.length);

const actionsMenus = document.querySelectorAll('.actions-menu-popup');
console.log('Actions menus found:', actionsMenus.length);

// בדיקה 8: בדיקת fallback
console.log('8. בדיקת fallback:');
const fallbackButtons = document.querySelectorAll('button[data-button-type="VIEW"]');
console.log('Fallback buttons found:', fallbackButtons.length);

// בדיקה 9: בדיקת initialization
console.log('9. בדיקת אתחול:');
if (window.actionsMenuSystem) {
    console.log('actionsMenuSystem methods:', Object.getOwnPropertyNames(window.actionsMenuSystem));
}

// בדיקה 10: בדיקת errors
console.log('10. בדיקת שגיאות:');
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

console.log('=== ✅ בדיקה הושלמה ===');
console.log('אם יש בעיות, בדוק את התוצאות למעלה');