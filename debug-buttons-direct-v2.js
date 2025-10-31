// בדיקה ישירה של הכפתורים שלנו - גרסה חדשה
console.log('🔍 === בדיקת כפתורים ישירה - גרסה חדשה ===');

// בדיקת הכפתור שלנו
const previewBtn = document.getElementById('btn-9');
console.log('Preview Button:', previewBtn);
console.log('Preview Button onclick:', previewBtn?.onclick);
console.log('Preview Button data-onclick:', previewBtn?.getAttribute('data-onclick'));

// בדיקת מערכת הכפתורים
console.log('Button System Available:', typeof window.AdvancedButtonSystem);
console.log('Button System Initialized:', window.AdvancedButtonSystem?.initialized);

// בדיקת כפתורים מעובדים
const processedBtns = document.querySelectorAll('[data-button-processed="true"]');
console.log('Processed Buttons Count:', processedBtns.length);
processedBtns.forEach((btn, index) => {
    console.log(`Button ${index + 1}:`, {
        id: btn.id,
        onclick: btn.onclick,
        dataOnclick: btn.getAttribute('data-onclick'),
        text: btn.textContent
    });
});

// בדיקת כפתורים לא מעובדים
const unprocessedBtns = document.querySelectorAll('[data-button-type]:not([data-button-processed])');
console.log('Unprocessed Buttons Count:', unprocessedBtns.length);
unprocessedBtns.forEach((btn, index) => {
    console.log(`Unprocessed Button ${index + 1}:`, {
        id: btn.id,
        onclick: btn.onclick,
        dataOnclick: btn.getAttribute('data-onclick'),
        text: btn.textContent
    });
});

console.log('✅ === בדיקת כפתורים הושלמה ===');
