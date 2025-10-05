// קוד לבדיקת מצב הכפתור המלא
console.log('🔍 בדיקת מצב הכפתור המלא');
console.log('==========================');

function debugButtonComplete() {
    const saveButton = document.querySelector('button[onclick="saveAllPreferences()"]');
    
    if (!saveButton) {
        console.log('❌ כפתור שמירה לא נמצא');
        return;
    }
    
    console.log('💾 מצב הכפתור:');
    console.log(`   Text: "${saveButton.textContent.trim()}"`);
    console.log(`   Classes: "${saveButton.className}"`);
    console.log(`   Background: "${saveButton.style.backgroundColor}"`);
    console.log(`   Border: "${saveButton.style.borderColor}"`);
    console.log(`   Color: "${saveButton.style.color}"`);
    console.log(`   Disabled: ${saveButton.disabled}`);
    
    // בדיקת מצב מעקב שינויים
    console.log('\n🔄 מעקב שינויים:');
    console.log(`   hasUnsavedChanges: ${typeof window.hasUnsavedChanges !== 'undefined' ? window.hasUnsavedChanges : 'לא מוגדר'}`);
    
    if (typeof window.originalFormData !== 'undefined') {
        console.log(`   originalFormData size: ${Object.keys(window.originalFormData || {}).length}`);
    }
    
    // בדיקת שינויים נוכחיים
    if (typeof window.collectFormData === 'function') {
        const currentData = window.collectFormData();
        const hasChanges = JSON.stringify(currentData) !== JSON.stringify(window.originalFormData || {});
        console.log(`   Has changes: ${hasChanges}`);
        
        if (hasChanges) {
            console.log('   ⚠️ יש שינויים לא שמורים - הכפתור אמור להיות כתום');
        } else {
            console.log('   ✅ אין שינויים - הכפתור אמור להיות ירוק');
        }
    }
    
    // המלצות
    console.log('\n💡 המלצות:');
    if (saveButton.style.backgroundColor === 'var(--logo-orange)' || saveButton.style.backgroundColor === 'rgb(255, 158, 4)') {
        console.log('   ✅ הכפתור בצבע כתום הלוגו - נכון');
    } else {
        console.log('   ⚠️ הכפתור לא בצבע כתום הלוגו');
    }
    
    if (saveButton.classList.contains('btn-lg')) {
        console.log('   ✅ הכפתור בגודל גדול - נכון');
    } else {
        console.log('   ⚠️ הכפתור לא בגודל גדול');
    }
    
    // בדיקת פונקציות
    console.log('\n🔧 פונקציות:');
    console.log(`   updateSaveButtonState: ${typeof window.updateSaveButtonState}`);
    console.log(`   initializeChangeTracking: ${typeof window.initializeChangeTracking}`);
    console.log(`   collectFormData: ${typeof window.collectFormData}`);
}

// הרצת הבדיקה
debugButtonComplete();
