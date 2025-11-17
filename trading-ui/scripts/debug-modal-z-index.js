/**
 * Debug Modal Z-Index Layers
 * קוד בדיקה להבנת שכבות z-index של מודלים
 * 
 * שימוש: הקלד בקונסולה: window.debugModalZIndex()
 */

(function() {
    'use strict';

    /**
     * בדיקת שכבות z-index של כל המודלים הפתוחים
     */
    function debugModalZIndex() {
        console.log('🔍 ===== Modal Z-Index Debug Report =====');
        console.log('');

        // מציאת כל המודלים הפתוחים
        const openModals = document.querySelectorAll('.modal.show');
        const allModals = document.querySelectorAll('.modal');
        const backdrops = document.querySelectorAll('.modal-backdrop');

        console.log(`📊 סטטיסטיקה כללית:`);
        console.log(`   - מודלים פתוחים: ${openModals.length}`);
        console.log(`   - מודלים סך הכל: ${allModals.length}`);
        console.log(`   - Backdrops: ${backdrops.length}`);
        console.log('');

        // בדיקת כל מודל פתוח
        if (openModals.length > 0) {
            console.log('📋 מודלים פתוחים (מסודרים לפי z-index):');
            const modalData = Array.from(openModals).map(modal => {
                const computedStyle = window.getComputedStyle(modal);
                const dialog = modal.querySelector('.modal-dialog');
                const content = modal.querySelector('.modal-content');
                const dialogStyle = dialog ? window.getComputedStyle(dialog) : null;
                const contentStyle = content ? window.getComputedStyle(content) : null;

                return {
                    id: modal.id || 'no-id',
                    zIndex: parseInt(computedStyle.zIndex) || 0,
                    dialogZIndex: dialogStyle ? (parseInt(dialogStyle.zIndex) || 0) : 0,
                    contentZIndex: contentStyle ? (parseInt(contentStyle.zIndex) || 0) : 0,
                    hasNestedClass: modal.classList.contains('modal-nested'),
                    nestedOffset: getComputedStyle(modal).getPropertyValue('--modal-nested-offset') || '0',
                    backdrop: modal.getAttribute('data-bs-backdrop'),
                    element: modal
                };
            });

            // מיון לפי z-index
            modalData.sort((a, b) => b.zIndex - a.zIndex);

            modalData.forEach((data, index) => {
                console.log(`\n${index + 1}. ${data.id}:`);
                console.log(`   📍 Modal z-index: ${data.zIndex}`);
                console.log(`   📍 Dialog z-index: ${data.dialogZIndex}`);
                console.log(`   📍 Content z-index: ${data.contentZIndex}`);
                console.log(`   🏷️  Classes: ${data.element.className}`);
                console.log(`   🔗 modal-nested: ${data.hasNestedClass ? '✅ כן' : '❌ לא'}`);
                console.log(`   📐 --modal-nested-offset: ${data.nestedOffset}`);
                console.log(`   🎛️  data-bs-backdrop: ${data.backdrop || 'לא מוגדר'}`);
            });
        } else {
            console.log('⚠️ אין מודלים פתוחים כרגע');
        }

        console.log('');

        // בדיקת Backdrops
        if (backdrops.length > 0) {
            console.log('🎭 Backdrops:');
            backdrops.forEach((backdrop, index) => {
                const computedStyle = window.getComputedStyle(backdrop);
                const zIndex = parseInt(computedStyle.zIndex) || 0;
                console.log(`   ${index + 1}. z-index: ${zIndex}, classes: ${backdrop.className}`);
            });
        } else {
            console.log('⚠️ אין Backdrops כרגע');
        }

        console.log('');

        // בדיקת ModalNavigationService stack
        if (window.ModalNavigationService) {
            const stack = window.ModalNavigationService.getStack();
            console.log('🗂️  ModalNavigationService Stack:');
            console.log(`   - אורך: ${stack.length}`);
            if (stack.length > 0) {
                stack.forEach((entry, index) => {
                    console.log(`   ${index + 1}. ${entry.modalId} (${entry.modalType}) - z-index: ${entry.element ? window.getComputedStyle(entry.element).zIndex : 'N/A'}`);
                });
            }
        } else {
            console.log('⚠️ ModalNavigationService לא זמין');
        }

        console.log('');
        console.log('🔍 ===== End Debug Report =====');
    }

    // ייצוא לקונסולה
    window.debugModalZIndex = debugModalZIndex;

    console.log('✅ Modal Z-Index Debug Tool loaded');
    console.log('   שימוש: הקלד בקונסולה: window.debugModalZIndex()');
})();

