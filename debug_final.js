// קוד מקיף לדיבוג כל מערכת העדפות
console.log('🔍 דיבוג מקיף - מערכת העדפות');
console.log('===============================');

async function debugFinal() {
    try {
        // 1. בדיקת מצב השרת
        console.log('\n📡 מצב השרת:');
        const profilesResponse = await fetch('/api/preferences/profiles?user_id=1');
        const profilesData = await profilesResponse.json();
        
        if (profilesData.success) {
            const activeProfile = profilesData.data.profiles.find(p => p.active);
            console.log(`   פרופיל פעיל: ${activeProfile?.name || 'לא נמצא'} (ID: ${activeProfile?.id || 'N/A'})`);
            
            if (activeProfile) {
                const prefsResponse = await fetch(`/api/preferences/user?user_id=1&profile_id=${activeProfile.id}`);
                const prefsData = await prefsResponse.json();
                
                if (prefsData.success) {
                    const prefs = prefsData.data.preferences;
                    console.log(`   Primary Color: "${prefs.primaryColor || 'לא מוגדר'}"`);
                    console.log(`   Secondary Color: "${prefs.secondaryColor || 'לא מוגדר'}"`);
                    console.log(`   Total preferences: ${Object.keys(prefs).length}`);
                }
            }
        }

        // 2. בדיקת מצב הממשק
        console.log('\n🖥️ מצב הממשק:');
        const profileSelect = document.getElementById('profileSelect');
        const saveButton = document.querySelector('button[onclick="saveAllPreferences()"]');
        const primaryColorInput = document.getElementById('primaryColor');
        const secondaryColorInput = document.getElementById('secondaryColor');
        
        console.log(`   Profile dropdown: "${profileSelect?.value || 'לא נמצא'}"`);
        console.log(`   Save button text: "${saveButton?.textContent?.trim() || 'לא נמצא'}"`);
        console.log(`   Save button color: "${saveButton?.style?.backgroundColor || 'לא מוגדר'}"`);
        console.log(`   Primary color input: "${primaryColorInput?.value || 'לא נמצא'}"`);
        console.log(`   Secondary color input: "${secondaryColorInput?.value || 'לא נמצא'}"`);

        // 3. בדיקת מצב המטמון
        console.log('\n💾 מצב המטמון:');
        if (window.preferencesCache) {
            const cached = window.preferencesCache.get();
            console.log(`   Local cache size: ${Object.keys(cached || {}).length} items`);
            console.log(`   Cached primary: "${cached?.primaryColor || 'לא מוגדר'}"`);
            console.log(`   Cached secondary: "${cached?.secondaryColor || 'לא מוגדר'}"`);
        }

        // 4. בדיקת משתני CSS
        console.log('\n🎨 משתני CSS:');
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        console.log(`   --logo-orange: "${computedStyle.getPropertyValue('--logo-orange')}"`);
        console.log(`   --apple-green: "${computedStyle.getPropertyValue('--apple-green')}"`);

        // 5. בדיקת פונקציות
        console.log('\n🔧 פונקציות:');
        console.log(`   updateSaveButtonState: ${typeof window.updateSaveButtonState}`);
        console.log(`   hasUnsavedChanges: ${typeof window.hasUnsavedChanges !== 'undefined' ? window.hasUnsavedChanges : 'לא מוגדר'}`);

        // 6. המלצות
        console.log('\n💡 המלצות:');
        if (activeProfile) {
            const prefs = prefsData.data.preferences;
            if (prefs.primaryColor !== '#34C759') {
                console.log('   ⚠️ הצבע הראשי לא ירוק הלוגו - מומלץ לעדכן ל-#34C759');
            }
            if (prefs.secondaryColor !== '#ff9e04') {
                console.log('   ⚠️ הצבע המשני לא כתום הלוגו - מומלץ לעדכן ל-#ff9e04');
            }
        }

    } catch (error) {
        console.error('❌ שגיאה בבדיקת המצב:', error);
    }
}

// הרצת הבדיקה
debugFinal();
