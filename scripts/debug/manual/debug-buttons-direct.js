// בדיקה ישירה של הכפתורים שלנו
console.log('🔍 === בדיקת כפתורים ישירה ===');

// בדיקת הכפתור שלנו
const previewButton = document.getElementById('btn-9');
console.log('Preview Button:', previewButton);
console.log('Preview Button onclick:', previewButton?.onclick);
console.log('Preview Button data-onclick:', previewButton?.getAttribute('data-onclick'));

// בדיקת מערכת הכפתורים
console.log('Button System Available:', typeof window.AdvancedButtonSystem);
console.log('Button System Initialized:', window.AdvancedButtonSystem?.initialized);

// בדיקת כפתורים מעובדים
const processedButtons = document.querySelectorAll('[data-button-processed="true"]');
console.log('Processed Buttons Count:', processedButtons.length);
processedButtons.forEach((btn, index) => {
    console.log(`Button ${index + 1}:`, {
        id: btn.id,
        onclick: btn.onclick,
        dataOnclick: btn.getAttribute('data-onclick'),
        text: btn.textContent
    });
});

// בדיקת כפתורים לא מעובדים
const unprocessedButtons = document.querySelectorAll('[data-button-type]:not([data-button-processed])');
console.log('Unprocessed Buttons Count:', unprocessedButtons.length);
unprocessedButtons.forEach((btn, index) => {
    console.log(`Unprocessed Button ${index + 1}:`, {
        id: btn.id,
        onclick: btn.onclick,
        dataOnclick: btn.getAttribute('data-onclick'),
        text: btn.textContent
    });
});

console.log('✅ === בדיקת כפתורים הושלמה ===');
