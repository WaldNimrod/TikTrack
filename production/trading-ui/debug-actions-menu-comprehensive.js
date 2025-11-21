/**
 * קוד בדיקה מקיף למערכת תפריט פעולות
 * הרץ את הקוד הזה בקונסול הדפדפן
 */

console.log('=== 🔍 בדיקה מקיפה למערכת תפריט פעולות ===');

// בדיקה 1: ActionsMenuSystem class
console.log('1. ActionsMenuSystem class:', typeof window.ActionsMenuSystem);

// בדיקה 2: actionsMenuSystem instance
console.log('2. actionsMenuSystem instance:', typeof window.actionsMenuSystem);

// בדיקה 3: createActionsMenu function
console.log('3. createActionsMenu function:', typeof window.createActionsMenu);

// בדיקה 4: debugActionsMenu function
console.log('4. debugActionsMenu function:', typeof window.debugActionsMenu);

// בדיקה 5: בדיקת console messages
console.log('5. בדוק את הקונסול להודעות ActionsMenuSystem');

// בדיקה 6: test createActionsMenu
if (typeof window.createActionsMenu === 'function') {
    console.log('6. מנסה ליצור תפריט בדיקה...');
    try {
        const testButtons = [
            { type: 'VIEW', onclick: 'console.log("test view")', title: 'צפה' },
            { type: 'EDIT', onclick: 'console.log("test edit")', title: 'ערוך' }
        ];
        
        const result = window.createActionsMenu(testButtons);
        console.log('6. createActionsMenu result:', result);
        
        // הוסף את התוצאה לעמוד
        const testDiv = document.createElement('div');
        testDiv.innerHTML = result;
        testDiv.style.border = '1px solid #ccc';
        testDiv.style.padding = '10px';
        testDiv.style.margin = '10px 0';
        document.body.appendChild(testDiv);
        
    } catch (error) {
        console.error('6. Error in createActionsMenu:', error);
    }
} else {
    console.error('6. createActionsMenu is not a function!');
}

// בדיקה 7: בדיקת scripts loaded
console.log('7. בדיקת סקריפטים שנטענו:');
const scripts = document.querySelectorAll('script[src*="actions-menu-system"]');
console.log('Scripts found:', scripts.length);
scripts.forEach((script, index) => {
    console.log(`Script ${index + 1}:`, script.src);
});

// בדיקה 8: בדיקת errors
console.log('8. בדיקת שגיאות JavaScript:');
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// בדיקה 9: בדיקת network requests
console.log('9. בדיקת בקשות רשת:');
const networkErrors = [];
const originalFetch = window.fetch;
window.fetch = function(...args) {
    return originalFetch.apply(this, args)
        .then(response => {
            if (!response.ok) {
                networkErrors.push(`Failed to load: ${args[0]}`);
            }
            return response;
        })
        .catch(error => {
            networkErrors.push(`Network error: ${error.message}`);
            throw error;
        });
};

// בדיקה 10: בדיקת DOM elements
console.log('10. בדיקת אלמנטי DOM:');
const actionsCells = document.querySelectorAll('.actions-cell');
console.log('Actions cells found:', actionsCells.length);

const actionsMenus = document.querySelectorAll('.actions-menu-popup');
console.log('Actions menus found:', actionsMenus.length);

// בדיקה 11: בדיקת event listeners
console.log('11. בדיקת event listeners:');
const buttons = document.querySelectorAll('button[data-button-type]');
console.log('Action buttons found:', buttons.length);

// בדיקה 12: בדיקת CSS
console.log('12. בדיקת CSS:');
const styles = document.querySelectorAll('link[href*="actions-menu"]');
console.log('Action menu CSS files:', styles.length);

// בדיקה 13: בדיקת console messages
console.log('13. בדיקת הודעות קונסול:');
const consoleMessages = [];
const originalLog = console.log;
console.log = function(...args) {
    consoleMessages.push(args.join(' '));
    originalLog.apply(console, args);
};

// בדיקה 14: בדיקת timing
console.log('14. בדיקת timing:');
setTimeout(() => {
    console.log('After 1 second:');
    console.log('createActionsMenu still available:', typeof window.createActionsMenu);
    console.log('actionsMenuSystem still available:', typeof window.actionsMenuSystem);
}, 1000);

// בדיקה 15: בדיקת fallback
console.log('15. בדיקת fallback:');
const fallbackButtons = document.querySelectorAll('button[data-button-type="VIEW"]');
console.log('Fallback buttons found:', fallbackButtons.length);

// בדיקה 16: בדיקת initialization
console.log('16. בדיקת אתחול:');
if (window.actionsMenuSystem) {
    console.log('actionsMenuSystem methods:', Object.getOwnPropertyNames(window.actionsMenuSystem));
    console.log('actionsMenuSystem prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.actionsMenuSystem)));
}

// בדיקה 17: בדיקת dependencies
console.log('17. בדיקת dependencies:');
console.log('jQuery available:', typeof $ !== 'undefined');
console.log('Bootstrap available:', typeof bootstrap !== 'undefined');

// בדיקה 18: בדיקת page load
console.log('18. בדיקת טעינת עמוד:');
console.log('Document ready state:', document.readyState);
console.log('Window loaded:', window.performance.timing.loadEventEnd > 0);

// בדיקה 19: בדיקת errors
console.log('19. בדיקת שגיאות:');
if (networkErrors.length > 0) {
    console.error('Network errors:', networkErrors);
}

// בדיקה 20: בדיקת console messages
console.log('20. בדיקת הודעות קונסול:');
if (consoleMessages.length > 0) {
    console.log('Console messages:', consoleMessages);
}

console.log('=== ✅ בדיקה הושלמה ===');
console.log('אם יש בעיות, בדוק את התוצאות למעלה');

