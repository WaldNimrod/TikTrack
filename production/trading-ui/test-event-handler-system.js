// ==========================================
// בדיקות מערכת Event Handler - data-onclick
// ==========================================
// העתק את הקוד הזה לקונסולה של הדפדפן ובדוק את התוצאות

console.log('🧪 === בדיקות מערכת Event Handler ===\n');

// בדיקה 1: האם EventHandlerManager טעון
console.log('📋 בדיקה 1: EventHandlerManager');
const hasEventHandler = typeof window.eventHandlerManager !== 'undefined' || 
                        document.querySelector('script[src*="event-handler-manager"]') !== null;
console.log('✅ EventHandlerManager טעון:', hasEventHandler ? 'כן' : 'לא');
if (!hasEventHandler) {
    console.warn('⚠️ EventHandlerManager לא נמצא - בדוק שהקובץ נטען');
}

// בדיקה 2: האם יש כפתורים עם data-onclick
console.log('\n📋 בדיקה 2: כפתורים עם data-onclick');
const buttonsWithDataOnclick = document.querySelectorAll('button[data-onclick]');
console.log('✅ מספר כפתורים עם data-onclick:', buttonsWithDataOnclick.length);
if (buttonsWithDataOnclick.length > 0) {
    console.log('📝 דוגמאות:');
    buttonsWithDataOnclick.forEach((btn, idx) => {
        if (idx < 5) {
            console.log(`   ${idx + 1}. "${btn.textContent.trim()}" - ${btn.getAttribute('data-onclick')}`);
        }
    });
}

// בדיקה 3: האם יש כפתורים עם onclick רגיל (לא אמור להיות)
console.log('\n📋 בדיקה 3: כפתורים עם onclick רגיל (לא רצוי)');
const buttonsWithOnclick = document.querySelectorAll('button[onclick]');
console.log('⚠️ מספר כפתורים עם onclick רגיל:', buttonsWithOnclick.length);
if (buttonsWithOnclick.length > 0) {
    console.warn('⚠️ נמצאו כפתורים עם onclick - יש לשנות ל-data-onclick!');
    buttonsWithOnclick.forEach((btn, idx) => {
        if (idx < 5) {
            console.log(`   ${idx + 1}. "${btn.textContent.trim()}" - ${btn.getAttribute('onclick')}`);
        }
    });
}

// בדיקה 4: בדיקת כפתור דינמי
console.log('\n📋 בדיקה 4: יצירת כפתור דינמי עם data-onclick');
const testContainer = document.createElement('div');
testContainer.id = 'test-dynamic-button-container';
testContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: white; padding: 10px; border: 2px solid #26baac;';
document.body.appendChild(testContainer);

let clickCount = 0;
const dynamicButton = document.createElement('button');
dynamicButton.setAttribute('data-onclick', 'window.testDynamicButtonClick()');
dynamicButton.textContent = '🧪 כפתור בדיקה דינמי';
dynamicButton.className = 'btn btn-primary';
dynamicButton.style.cssText = 'margin: 5px;';
testContainer.appendChild(dynamicButton);

// הגדרת הפונקציה הגלובלית
window.testDynamicButtonClick = function() {
    clickCount++;
    console.log(`✅ כפתור דינמי נלחץ ${clickCount} פעמים!`);
    dynamicButton.textContent = `🧪 נלחץ ${clickCount} פעמים`;
    if (clickCount >= 3) {
        testContainer.remove();
        console.log('✅ כפתור דינמי עובד מצוין!');
    }
};

console.log('✅ כפתור דינמי נוצר - לחץ עליו כדי לבדוק!');

// בדיקה 5: בדיקת Bootstrap modals
console.log('\n📋 בדיקה 5: תאימות Bootstrap modals');
const modalsWithBsDismiss = document.querySelectorAll('[data-bs-dismiss]');
console.log('✅ מספר אלמנטים עם data-bs-dismiss:', modalsWithBsDismiss.length);
if (modalsWithBsDismiss.length === 0) {
    console.log('ℹ️ לא נמצאו modals - יצירת modal בדיקה');
    const testModal = document.createElement('div');
    testModal.className = 'modal fade';
    testModal.id = 'test-modal';
    testModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Modal בדיקה</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>זה modal בדיקה.</p>
                    <button class="btn btn-primary" data-onclick="window.testModalButtonClick()">כפתור עם data-onclick</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(testModal);
    
    window.testModalButtonClick = function() {
        console.log('✅ כפתור בתוך modal עובד!');
        if (window.bootstrap && window.bootstrap.Modal) {
            const modalInstance = window.bootstrap.Modal.getInstance(document.getElementById('test-modal'));
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    };
    
    console.log('✅ Modal בדיקה נוצר - פתח אותו עם: bootstrap.Modal.getInstance(document.getElementById("test-modal")).show()');
}

// בדיקה 6: בדיקת sortable headers
console.log('\n📋 בדיקה 6: Sortable headers');
const sortableHeaders = document.querySelectorAll('.sortable-header');
console.log('✅ מספר sortable headers:', sortableHeaders.length);
const sortableWithDataOnclick = Array.from(sortableHeaders).filter(btn => btn.hasAttribute('data-onclick'));
const sortableWithOnclick = Array.from(sortableHeaders).filter(btn => btn.hasAttribute('onclick'));
console.log('✅ עם data-onclick:', sortableWithDataOnclick.length);
console.log('⚠️ עם onclick:', sortableWithOnclick.length);
if (sortableWithOnclick.length > 0) {
    console.warn('⚠️ יש sortable headers עם onclick - יש לשנות ל-data-onclick!');
}

// סיכום
console.log('\n📊 === סיכום בדיקות ===');
console.log(`✅ כפתורים עם data-onclick: ${buttonsWithDataOnclick.length}`);
console.log(`⚠️ כפתורים עם onclick: ${buttonsWithOnclick.length}`);
console.log(`✅ Sortable headers עם data-onclick: ${sortableWithDataOnclick.length}`);
console.log(`⚠️ Sortable headers עם onclick: ${sortableWithOnclick.length}`);
console.log(`✅ Modals עם data-bs-dismiss: ${modalsWithBsDismiss.length}`);

if (buttonsWithOnclick.length === 0 && sortableWithOnclick.length === 0) {
    console.log('\n🎉 כל הכפתורים משתמשים ב-data-onclick! מעולה!');
} else {
    console.log('\n⚠️ יש עדיין כפתורים עם onclick - יש לתקן!');
}

console.log('\n✅ === סיום בדיקות ===');
console.log('💡 טיפ: לחץ על הכפתור הדינמי שנוצר כדי לבדוק שהוא עובד!');

