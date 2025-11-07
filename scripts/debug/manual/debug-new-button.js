// בדיקה של הכפתור החדש
console.log('🔍 === בדיקת הכפתור החדש ===');

// בדיקת הכפתור החדש
const previewBtnNew = document.getElementById('btn-preview-continue');
console.log('Preview Button New:', previewBtnNew);
console.log('Preview Button New onclick:', previewBtnNew?.onclick);
console.log('Preview Button New data-onclick:', previewBtnNew?.getAttribute('data-onclick'));

// בדיקת הכפתור הישן
const previewBtnOld = document.getElementById('btn-9');
console.log('Preview Button Old:', previewBtnOld);
console.log('Preview Button Old onclick:', previewBtnOld?.onclick);
console.log('Preview Button Old data-onclick:', previewBtnOld?.getAttribute('data-onclick'));

// בדיקת כל הכפתורים עם data-onclick
const buttonsWithOnclick = document.querySelectorAll('[data-onclick]');
console.log('Buttons with data-onclick:', buttonsWithOnclick.length);
buttonsWithOnclick.forEach((btn, index) => {
    console.log(`Button ${index + 1}:`, {
        id: btn.id,
        onclick: btn.onclick,
        dataOnclick: btn.getAttribute('data-onclick'),
        text: btn.textContent
    });
});

console.log('✅ === בדיקת הכפתור החדש הושלמה ===');
