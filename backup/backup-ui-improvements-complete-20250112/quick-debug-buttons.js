/**
 * Quick Debug Buttons - TikTrack
 * ==============================
 * 
 * קוד קצר לבדיקה מהירה של כפתורי הלוג
 */

// בדיקה מהירה של כפתורים
function quickDebug() {
    console.clear();
    console.log('🔍 בדיקה מהירה של כפתורי הלוג...\n');
    
    // מצא כפתורים
    const buttons = document.querySelectorAll('.unified-log-display .btn, .log-display-controls .btn');
    console.log(`📊 נמצאו ${buttons.length} כפתורים`);
    
    if (buttons.length === 0) {
        console.log('❌ לא נמצאו כפתורים!');
        console.log('💡 נסה: debugAll() לבדיקה מקיפה');
        return;
    }
    
    // בדוק כל כפתור
    buttons.forEach((btn, i) => {
        const style = window.getComputedStyle(btn);
        console.log(`\n🔘 כפתור ${i+1}: "${btn.textContent.trim()}"`);
        console.log(`   📏 ${style.width} x ${style.height}`);
        console.log(`   🎨 ${style.backgroundColor}`);
        console.log(`   📦 ${style.padding}`);
        console.log(`   🔲 ${style.border}`);
        
        // בדוק בעיות
        const issues = [];
        if (style.width === '0px') issues.push('רוחב 0');
        if (style.height === '0px') issues.push('גובה 0');
        if (style.display === 'none') issues.push('מוסתר');
        if (style.opacity === '0') issues.push('שקוף');
        
        if (issues.length > 0) {
            console.log(`   ⚠️ בעיות: ${issues.join(', ')}`);
        } else {
            console.log(`   ✅ נראה תקין`);
        }
    });
    
    // בדוק CSS variables
    const root = window.getComputedStyle(document.documentElement);
    const vars = ['--apple-blue', '--apple-gray-1', '--apple-gray-3'];
    console.log('\n🎨 משתני CSS:');
    vars.forEach(v => {
        const val = root.getPropertyValue(v);
        console.log(`   ${v}: ${val || '❌ לא מוגדר'}`);
    });
}

// הפעל בדיקה מהירה
quickDebug();

// הוסף לגלובל
window.quickDebug = quickDebug;

console.log('\n💡 השתמש ב: quickDebug() לבדיקה מהירה');
