// קוד לבדיקת מצב העדפות בממשק המשתמש
console.log('🔍 בדיקת מצב העדפות בממשק המשתמש');
console.log('=====================================');

// 1. בדיקת פרופיל פעיל
console.log('\n📋 פרופיל פעיל:');
const profileSelect = document.getElementById('profileSelect');
if (profileSelect) {
    console.log(`   Dropdown value: "${profileSelect.value}"`);
    console.log(`   Selected option: "${profileSelect.options[profileSelect.selectedIndex]?.textContent}"`);
} else {
    console.log('   ❌ profileSelect לא נמצא');
}

const activeProfileInfo = document.getElementById('activeProfileInfo');
if (activeProfileInfo) {
    console.log(`   Active profile info: "${activeProfileInfo.textContent}"`);
} else {
    console.log('   ❌ activeProfileInfo לא נמצא');
}

// 2. בדיקת כפתור שמירה
console.log('\n💾 כפתור שמירה:');
const saveButton = document.querySelector('button[onclick="saveAllPreferences()"]');
if (saveButton) {
    console.log(`   Text: "${saveButton.textContent.trim()}"`);
    console.log(`   Classes: "${saveButton.className}"`);
    console.log(`   Background color: "${saveButton.style.backgroundColor}"`);
    console.log(`   Border color: "${saveButton.style.borderColor}"`);
    console.log(`   Disabled: ${saveButton.disabled}`);
} else {
    console.log('   ❌ כפתור שמירה לא נמצא');
}

// 3. בדיקת צבעים בטופס
console.log('\n🎨 צבעים בטופס:');
const primaryColorInput = document.getElementById('primaryColor');
if (primaryColorInput) {
    console.log(`   Primary color: "${primaryColorInput.value}"`);
} else {
    console.log('   ❌ primaryColor לא נמצא');
}

const secondaryColorInput = document.getElementById('secondaryColor');
if (secondaryColorInput) {
    console.log(`   Secondary color: "${secondaryColorInput.value}"`);
} else {
    console.log('   ❌ secondaryColor לא נמצא');
}

// 4. בדיקת מצב מעקב שינויים
console.log('\n🔄 מעקב שינויים:');
if (typeof window.hasUnsavedChanges !== 'undefined') {
    console.log(`   hasUnsavedChanges: ${window.hasUnsavedChanges}`);
} else {
    console.log('   ❌ hasUnsavedChanges לא מוגדר');
}

if (typeof window.originalFormData !== 'undefined') {
    console.log(`   originalFormData keys: ${Object.keys(window.originalFormData || {}).length}`);
} else {
    console.log('   ❌ originalFormData לא מוגדר');
}

// 5. בדיקת מטמון העדפות
console.log('\n💾 מטמון העדפות:');
if (window.preferencesCache) {
    const cached = window.preferencesCache.get();
    console.log(`   Cache size: ${Object.keys(cached || {}).length} items`);
    if (cached && cached.primaryColor) {
        console.log(`   Cached primaryColor: "${cached.primaryColor}"`);
    }
    if (cached && cached.secondaryColor) {
        console.log(`   Cached secondaryColor: "${cached.secondaryColor}"`);
    }
} else {
    console.log('   ❌ preferencesCache לא זמין');
}

// 6. בדיקת משתני CSS
console.log('\n🎨 משתני CSS:');
const root = document.documentElement;
const computedStyle = getComputedStyle(root);
console.log(`   --logo-orange: "${computedStyle.getPropertyValue('--logo-orange')}"`);
console.log(`   --apple-green: "${computedStyle.getPropertyValue('--apple-green')}"`);

// 7. בדיקת פונקציות זמינות
console.log('\n🔧 פונקציות זמינות:');
console.log(`   updateSaveButtonState: ${typeof window.updateSaveButtonState}`);
console.log(`   initializeChangeTracking: ${typeof window.initializeChangeTracking}`);
console.log(`   loadDefaultColors: ${typeof window.loadDefaultColors}`);
console.log(`   collectFormData: ${typeof window.collectFormData}`);

console.log('\n✅ בדיקה הושלמה');
