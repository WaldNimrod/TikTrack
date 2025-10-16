/**
 * Debug FontAwesome - TikTrack
 * ============================
 * 
 * בדיקת FontAwesome
 */

function debugFontAwesome() {
    console.clear();
    console.log('🔍 בודק FontAwesome...\n');
    
    // בדוק אם FontAwesome נטען
    const fontAwesomeLink = document.querySelector('link[href*="fontawesome"]');
    if (fontAwesomeLink) {
        console.log('✅ FontAwesome link נמצא:');
        console.log(`   📍 href: ${fontAwesomeLink.href}`);
        console.log(`   📏 loaded: ${fontAwesomeLink.sheet ? 'כן' : 'לא'}`);
    } else {
        console.log('❌ FontAwesome link לא נמצא!');
    }
    
    // בדוק אם יש איקונים
    const icons = document.querySelectorAll('.fas, .fa, .far, .fab');
    console.log(`\n🎨 נמצאו ${icons.length} איקונים`);
    
    if (icons.length > 0) {
        console.log('📋 דוגמאות איקונים:');
        Array.from(icons).slice(0, 10).forEach((icon, i) => {
            console.log(`   ${i+1}. ${icon.className} - "${icon.textContent}"`);
        });
    }
    
    // בדוק אם יש כפתורים עם איקונים
    const buttonsWithIcons = document.querySelectorAll('.btn .fas, .btn .fa, .btn .far, .btn .fab');
    console.log(`\n🔘 נמצאו ${buttonsWithIcons.length} כפתורים עם איקונים`);
    
    if (buttonsWithIcons.length > 0) {
        console.log('📋 דוגמאות כפתורים עם איקונים:');
        Array.from(buttonsWithIcons).slice(0, 5).forEach((icon, i) => {
            const button = icon.closest('.btn');
            console.log(`   ${i+1}. "${button.textContent.trim()}" - ${icon.className}`);
        });
    }
    
    // בדוק אם יש כפתורים ריקים
    const emptyButtons = document.querySelectorAll('.btn');
    const reallyEmpty = Array.from(emptyButtons).filter(btn => 
        btn.textContent.trim() === '' && btn.innerHTML.trim() === ''
    );
    console.log(`\n⚠️ נמצאו ${reallyEmpty.length} כפתורים ריקים לחלוטין`);
    
    if (reallyEmpty.length > 0) {
        console.log('📋 דוגמאות כפתורים ריקים:');
        Array.from(reallyEmpty).slice(0, 5).forEach((btn, i) => {
            console.log(`   ${i+1}. Classes: "${btn.className}" - ${btn.offsetWidth}x${btn.offsetHeight}`);
        });
    }
    
    // בדוק אם יש כפתורים עם איקונים אבל בלי טקסט
    const buttonsWithIconsNoText = Array.from(emptyButtons).filter(btn => {
        const hasIcon = btn.querySelector('.fas, .fa, .far, .fab');
        return hasIcon && btn.textContent.trim() === '';
    });
    console.log(`\n🎯 נמצאו ${buttonsWithIconsNoText.length} כפתורים עם איקונים אבל בלי טקסט`);
    
    if (buttonsWithIconsNoText.length > 0) {
        console.log('📋 דוגמאות:');
        Array.from(buttonsWithIconsNoText).slice(0, 5).forEach((btn, i) => {
            const icon = btn.querySelector('.fas, .fa, .far, .fab');
            console.log(`   ${i+1}. ${icon.className} - ${btn.offsetWidth}x${btn.offsetHeight}`);
        });
    }
}

// הפעל בדיקה
debugFontAwesome();

// הוסף לגלובל
window.debugFontAwesome = debugFontAwesome;

console.log('\n💡 השתמש ב: debugFontAwesome() לבדיקה חוזרת');
