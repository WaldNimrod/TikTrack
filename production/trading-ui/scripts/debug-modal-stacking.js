/**
 * Modal Stacking Debug Tool
 * כלי בדיקה לבעיות z-index ו-backdrop במודולים מקוננים
 * 
 * הפעלה: הדבק את הקוד הזה בקונסול או טען את הקובץ
 */

window.debugModalStacking = function() {
    console.log('🔍 ===== MODAL STACKING DEBUG =====');
    console.log('');
    
    // 1. בדיקת כל המודולים ב-DOM
    console.log('📋 1. כל המודולים ב-DOM:');
    const allModals = document.querySelectorAll('.modal');
    console.log(`   נמצאו ${allModals.length} מודולים:`);
    allModals.forEach((modal, index) => {
        const modalId = modal.id || '(ללא ID)';
        const isShown = modal.classList.contains('show') || modal.style.display === 'block';
        // קריאת z-index מ-inline style קודם (יותר מדויק), ואז מ-computed style
        const zIndexInline = modal.style.zIndex || '';
        const zIndexComputed = window.getComputedStyle(modal).zIndex || 'auto';
        const zIndex = zIndexInline || zIndexComputed;
        const dialog = modal.querySelector('.modal-dialog');
        const dialogZIndexInline = dialog ? (dialog.style.zIndex || '') : '';
        const dialogZIndexComputed = dialog ? (window.getComputedStyle(dialog).zIndex || 'auto') : 'N/A';
        const dialogZIndex = dialogZIndexInline || dialogZIndexComputed;
        const content = modal.querySelector('.modal-content');
        const contentZIndexInline = content ? (content.style.zIndex || '') : '';
        const contentZIndexComputed = content ? (window.getComputedStyle(content).zIndex || 'auto') : 'N/A';
        const contentZIndex = contentZIndexInline || contentZIndexComputed;
        
        console.log(`   ${index + 1}. ${modalId}`);
        console.log(`      - פתוח: ${isShown ? '✅ כן' : '❌ לא'}`);
        console.log(`      - z-index: ${zIndex}`);
        console.log(`      - dialog z-index: ${dialogZIndex}`);
        console.log(`      - content z-index: ${contentZIndex}`);
        console.log(`      - classes: ${modal.className}`);
        console.log('');
    });
    
    // 2. בדיקת כל ה-backdrops
    console.log('🖼️  2. כל ה-backdrops ב-DOM:');
    const allBackdrops = Array.from(document.querySelectorAll('.modal-backdrop'));
    
    // בדיקה מפורשת של globalModalBackdrop (אם לא נמצא ב-querySelector)
    const globalBackdropById = document.getElementById('globalModalBackdrop');
    if (globalBackdropById && !allBackdrops.includes(globalBackdropById)) {
        allBackdrops.push(globalBackdropById);
        console.log('   💡 נמצא globalModalBackdrop לפי ID (לא נמצא ב-querySelector)');
    }
    
    console.log(`   נמצאו ${allBackdrops.length} backdrops (אמור להיות 1 בלבד!):`);
    if (allBackdrops.length === 0) {
        console.log('   ⚠️ אין backdrops ב-DOM!');
    }
    allBackdrops.forEach((backdrop, index) => {
        const backdropId = backdrop.id || '(ללא ID)';
        const zIndexInline = backdrop.style.zIndex || '';
        const zIndexComputed = window.getComputedStyle(backdrop).zIndex || 'auto';
        const zIndex = zIndexInline || zIndexComputed;
        const isGlobal = backdrop.id === 'globalModalBackdrop' || backdrop.classList.contains('global-modal-backdrop');
        const display = window.getComputedStyle(backdrop).display;
        const visibility = window.getComputedStyle(backdrop).visibility;
        const opacity = window.getComputedStyle(backdrop).opacity;
        
        console.log(`   ${index + 1}. ${backdropId}`);
        console.log(`      - z-index (inline): ${zIndexInline || 'לא מוגדר'}`);
        console.log(`      - z-index (computed): ${zIndexComputed}`);
        console.log(`      - z-index (בשימוש): ${zIndex}`);
        console.log(`      - גלובלי: ${isGlobal ? '✅ כן' : '❌ לא'}`);
        console.log(`      - display: ${display}`);
        console.log(`      - visibility: ${visibility}`);
        console.log(`      - opacity: ${opacity}`);
        console.log(`      - classes: ${backdrop.className}`);
        console.log(`      - element:`, backdrop);
        console.log('');
    });
    
    if (allBackdrops.length > 1) {
        console.warn('⚠️  בעיה: נמצאו יותר מ-backdrop אחד! זה לא תקין במערכת שלנו.');
        console.warn('   כל ה-backdrops חוץ מה-global צריכים להימחק.');
    }
    
    // 3. בדיקת ModalNavigationService
    console.log('📚 3. מצב ModalNavigationService:');
    if (window.ModalNavigationService) {
        const stack = window.ModalNavigationService.getStack ? window.ModalNavigationService.getStack({ includeElements: true }) : [];
        console.log('   ✅ ModalNavigationService זמין');
        console.log(`   - Stack length: ${stack.length}`);
        if (stack.length > 0) {
            console.log('   - ערכים ב-stack:');
            stack.forEach((entry, index) => {
                console.log(`     ${index + 1}. ${entry.modalId || '(ללא ID)'}`);
                console.log(`        - Modal Type: ${entry.modalType || 'N/A'}`);
                console.log(`        - Entity Type: ${entry.entityType || 'N/A'}`);
                console.log(`        - Entity ID: ${entry.entityId ?? 'N/A'}`);
                console.log(`        - Title: ${entry.title || 'N/A'}`);
                console.log(`        - Source Info: ${entry.sourceInfo ? '✅ יש' : '❌ אין'}`);
                console.log(`        - Element:`, entry.element || null);
                console.log('');
            });
        } else {
            console.log('   - אין מודולים ב-stack');
        }
    } else {
        console.log('   ❌ ModalNavigationService לא זמין!');
    }
    
    // 4. בדיקת מודולים פתוחים בפועל
    console.log('👁️  4. מודולים פתוחים בפועל:');
    const openModals = document.querySelectorAll('.modal.show');
    console.log(`   נמצאו ${openModals.length} מודולים פתוחים:`);
    openModals.forEach((modal, index) => {
        const modalId = modal.id || '(ללא ID)';
        console.log(`   ${index + 1}. ${modalId}`);
        
        // בדיקה אם המודול רשום ב-ModalNavigationManager
        if (window.ModalNavigationService?.getStack) {
            const stack = window.ModalNavigationService.getStack({ includeElements: true });
            const isTracked = stack.some(entry => entry.element === modal || entry.modalId === modal.id);
            console.log(`      - רשום ב-ModalNavigationService: ${isTracked ? '✅ כן' : '❌ לא'}`);
        }
    });
    
    // 5. בדיקת z-index hierarchy
    console.log('');
    console.log('📊 5. היררכיית z-index:');
    const zIndexValues = [];
    
    // Backdrops - קריאת inline style קודם
    // הערה: allBackdrops כבר כולל את globalModalBackdrop (נבדק בסעיף 2)
    allBackdrops.forEach(backdrop => {
        const zIndexInline = backdrop.style.zIndex || '';
        const zIndexComputed = window.getComputedStyle(backdrop).zIndex || 'auto';
        const zIndex = zIndexInline ? parseInt(zIndexInline) : (parseInt(zIndexComputed) || 0);
        zIndexValues.push({
            type: 'backdrop',
            element: backdrop.id || backdrop.className || 'modal-backdrop',
            zIndex: zIndex,
            source: zIndexInline ? 'inline' : 'computed'
        });
    });
    
    // Modals - קריאת inline style קודם
    allModals.forEach(modal => {
        const zIndexInline = modal.style.zIndex || '';
        const zIndexComputed = window.getComputedStyle(modal).zIndex || 'auto';
        const zIndex = zIndexInline ? parseInt(zIndexInline) : (parseInt(zIndexComputed) || 0);
        if (zIndex > 0) {
            zIndexValues.push({
                type: 'modal',
                element: modal.id || '(ללא ID)',
                zIndex: zIndex,
                source: zIndexInline ? 'inline' : 'computed'
            });
        }
    });
    
    // Dialog - קריאת inline style קודם
    allModals.forEach(modal => {
        const dialog = modal.querySelector('.modal-dialog');
        if (dialog) {
            const zIndexInline = dialog.style.zIndex || '';
            const zIndexComputed = window.getComputedStyle(dialog).zIndex || 'auto';
            const zIndex = zIndexInline ? parseInt(zIndexInline) : (parseInt(zIndexComputed) || 0);
            if (zIndex > 0) {
                zIndexValues.push({
                    type: 'dialog',
                    element: `${modal.id || '(ללא ID)'} > .modal-dialog`,
                    zIndex: zIndex,
                    source: zIndexInline ? 'inline' : 'computed'
                });
            }
        }
    });
    
    // Content - קריאת inline style קודם
    allModals.forEach(modal => {
        const content = modal.querySelector('.modal-content');
        if (content) {
            const zIndexInline = content.style.zIndex || '';
            const zIndexComputed = window.getComputedStyle(content).zIndex || 'auto';
            const zIndex = zIndexInline ? parseInt(zIndexInline) : (parseInt(zIndexComputed) || 0);
            if (zIndex > 0) {
                zIndexValues.push({
                    type: 'content',
                    element: `${modal.id || '(ללא ID)'} > .modal-content`,
                    zIndex: zIndex,
                    source: zIndexInline ? 'inline' : 'computed'
                });
            }
        }
    });
    
    // מיון לפי z-index
    zIndexValues.sort((a, b) => a.zIndex - b.zIndex);
    
    console.log('   היררכיית z-index (מנמוך לגבוה):');
    zIndexValues.forEach((item, index) => {
        const sourceLabel = item.source === 'inline' ? '📌 inline' : '🎨 CSS';
        console.log(`   ${index + 1}. [${item.type}] ${item.element}: z-index = ${item.zIndex} (${sourceLabel})`);
    });
    
    // 6. המלצות
    console.log('');
    console.log('💡 6. המלצות:');
    
    if (allBackdrops.length > 1) {
        console.log('   ❌ יש יותר מ-backdrop אחד!');
        console.log('   ✅ פתרון: מחק את כל ה-backdrops חוץ מ-globalModalBackdrop');
        console.log('   ✅ קוד תיקון:');
        console.log('      document.querySelectorAll(".modal-backdrop:not(#globalModalBackdrop)").forEach(b => b.remove());');
    }
    
    const openModalsNotInHistory = [];
    openModals.forEach(modal => {
        if (window.ModalNavigationService?.getStack) {
            const stack = window.ModalNavigationService.getStack({ includeElements: true });
            const isTracked = stack.some(entry => entry.element === modal || entry.modalId === modal.id);
            if (!isTracked) {
                openModalsNotInHistory.push(modal.id || '(ללא ID)');
            }
        }
    });
    
    if (openModalsNotInHistory.length > 0) {
        console.log('   ❌ יש מודולים פתוחים שלא רשומים ב-ModalNavigationService!');
        console.log('   ✅ מודולים:', openModalsNotInHistory);
    }
    
    console.log('');
    console.log('✅ ===== סיום בדיקה =====');
    console.log('');
    
    // החזרת תוצאות
    return {
        modals: allModals.length,
        openModals: openModals.length,
        backdrops: allBackdrops.length,
        hasMultipleBackdrops: allBackdrops.length > 1,
        historyLength: window.ModalNavigationService ? (window.ModalNavigationService.getStack ? window.ModalNavigationService.getStack({ includeElements: true }).length : 0) : 0,
        zIndexHierarchy: zIndexValues
    };
};

// פונקציה לתיקון מהיר של בעיית backdrop כפול
window.fixDuplicateBackdrops = function() {
    console.log('🔧 מתקן backdrops כפולים...');
    
    const allBackdrops = document.querySelectorAll('.modal-backdrop');
    const globalBackdrop = document.getElementById('globalModalBackdrop');
    
    let removed = 0;
    allBackdrops.forEach(backdrop => {
        if (backdrop !== globalBackdrop) {
            console.log(`   🗑️  מוחק backdrop:`, backdrop);
            backdrop.remove();
            removed++;
        }
    });
    
    console.log(`✅ הוסרו ${removed} backdrops כפולים`);
    
    // וידוא שיש backdrop גלובלי
    if (!globalBackdrop) {
        console.log('   ℹ️ אין backdrop גלובלי פעיל. Bootstrap ייצור אותו מחדש עם המודל הבא.');
    }
    
    return removed;
};

// פונקציה לבדיקת מודול ספציפי
window.debugSpecificModal = function(modalId) {
    console.log(`🔍 בדיקת מודול: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ מודול ${modalId} לא נמצא!`);
        return null;
    }
    
    const info = {
        id: modalId,
        isShown: modal.classList.contains('show'),
        zIndex: window.getComputedStyle(modal).zIndex,
        dialog: modal.querySelector('.modal-dialog'),
        content: modal.querySelector('.modal-content'),
        isInHistory: false,
        historyIndex: -1
    };
    
    if (info.dialog) {
        info.dialogZIndex = window.getComputedStyle(info.dialog).zIndex;
    }
    
    if (info.content) {
        info.contentZIndex = window.getComputedStyle(info.content).zIndex;
    }
    
    if (window.ModalNavigationService?.getStack) {
        const stack = window.ModalNavigationService.getStack({ includeElements: true });
        const index = stack.findIndex(entry => entry.element === modal);
        if (index >= 0) {
            info.historyIndex = index;
            info.historyInfo = stack[index];
        }
    }
    
    console.log('📋 מידע על המודול:', info);
    return info;
};

console.log('✅ כלי בדיקת מודולים נטען!');
console.log('   הפעל: debugModalStacking()');
console.log('   תיקון מהיר: fixDuplicateBackdrops()');
console.log('   בדיקת מודול ספציפי: debugSpecificModal("modalId")');
