// קוד לעדכון צבעי הלוגו לפרופיל נימרוד1
console.log('🎨 עדכון צבעי הלוגו לפרופיל נימרוד1');
console.log('=====================================');

async function updateLogoColors() {
    try {
        // 1. קבלת פרופיל פעיל
        const profilesResponse = await fetch('/api/preferences/profiles?user_id=1');
        const profilesData = await profilesResponse.json();
        
        if (!profilesData.success) {
            throw new Error('שגיאה בטעינת פרופילים');
        }
        
        const activeProfile = profilesData.data.profiles.find(p => p.active);
        if (!activeProfile) {
            throw new Error('לא נמצא פרופיל פעיל');
        }
        
        console.log(`📋 עדכון פרופיל: ${activeProfile.name} (ID: ${activeProfile.id})`);
        
        // 2. עדכון הצבעים
        const colorUpdates = {
            primaryColor: '#34C759',    // ירוק הלוגו
            secondaryColor: '#ff9e04'   // כתום הלוגו
        };
        
        console.log('🎨 עדכון צבעים:');
        console.log(`   Primary: ${colorUpdates.primaryColor}`);
        console.log(`   Secondary: ${colorUpdates.secondaryColor}`);
        
        const response = await fetch('/api/preferences/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                preferences: colorUpdates,
                user_id: 1,
                profile_id: activeProfile.id
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log('✅ הצבעים עודכנו בהצלחה!');
                
                // 3. עדכון הממשק
                const primaryColorInput = document.getElementById('primaryColor');
                const secondaryColorInput = document.getElementById('secondaryColor');
                
                if (primaryColorInput) {
                    primaryColorInput.value = colorUpdates.primaryColor;
                    console.log('✅ עדכון שדה primaryColor בממשק');
                }
                
                if (secondaryColorInput) {
                    secondaryColorInput.value = colorUpdates.secondaryColor;
                    console.log('✅ עדכון שדה secondaryColor בממשק');
                }
                
                // 4. ניקוי מטמון ורענון
                if (window.preferencesCache && window.preferencesCache.clear) {
                    window.preferencesCache.clear();
                    console.log('✅ מטמון העדפות נוקה');
                }
                
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.remove) {
                    await window.UnifiedCacheManager.remove('user-preferences');
                    console.log('✅ מטמון מאוחד נוקה');
                }
                
                // 5. רענון מערכת הצבעים
                if (window.colorSchemeSystem && window.colorSchemeSystem.loadColorSettings) {
                    window.colorSchemeSystem.loadColorSettings();
                    console.log('✅ מערכת הצבעים רועננה');
                }
                
                console.log('🎉 עדכון הצבעים הושלם בהצלחה!');
                
            } else {
                throw new Error(`שגיאה בשמירה: ${result.message}`);
            }
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ שגיאה בעדכון הצבעים:', error);
    }
}

// הרצת העדכון
updateLogoColors();
