// קוד לבדיקת כל השדות במערכת העדפות
console.log('🔍 בדיקת כל השדות במערכת העדפות');
console.log('==================================');

async function debugAllFields() {
    try {
        // 1. בדיקת כל השדות בטופס
        console.log('\n📋 כל השדות בטופס:');
        const formElements = document.querySelectorAll('input, select, textarea');
        console.log(`   Total form elements: ${formElements.length}`);
        
        const formData = {};
        formElements.forEach(element => {
            if (element.id && element.id !== '') {
                if (element.type === 'checkbox') {
                    formData[element.id] = element.checked;
                } else if (element.type === 'color') {
                    formData[element.id] = element.value;
                } else {
                    formData[element.id] = element.value;
                }
            }
        });
        
        console.log(`   Collected fields: ${Object.keys(formData).length}`);
        
        // 2. בדיקת מה נשמר בשרת
        console.log('\n📡 מה נשמר בשרת:');
        const profilesResponse = await fetch('/api/preferences/profiles?user_id=1');
        const profilesData = await profilesResponse.json();
        
        if (profilesData.success) {
            const activeProfile = profilesData.data.profiles.find(p => p.active);
            if (activeProfile) {
                const prefsResponse = await fetch(`/api/preferences/user?user_id=1&profile_id=${activeProfile.id}`);
                const prefsData = await prefsResponse.json();
                
                if (prefsData.success) {
                    const serverPrefs = prefsData.data.preferences;
                    console.log(`   Server preferences: ${Object.keys(serverPrefs).length}`);
                    
                    // השוואה בין הטופס לשרת
                    console.log('\n🔄 השוואה בין הטופס לשרת:');
                    const differences = [];
                    
                    Object.keys(formData).forEach(key => {
                        const formValue = formData[key];
                        const serverValue = serverPrefs[key];
                        
                        if (formValue !== serverValue) {
                            differences.push({
                                field: key,
                                form: formValue,
                                server: serverValue
                            });
                        }
                    });
                    
                    if (differences.length > 0) {
                        console.log(`   ⚠️ נמצאו ${differences.length} הבדלים:`);
                        differences.forEach(diff => {
                            console.log(`     ${diff.field}: טופס="${diff.form}", שרת="${diff.server}"`);
                        });
                    } else {
                        console.log('   ✅ כל השדות תואמים בין הטופס לשרת');
                    }
                }
            }
        }

        // 3. בדיקת מטמון
        console.log('\n💾 מצב המטמון:');
        if (window.preferencesCache) {
            const cached = window.preferencesCache.get();
            console.log(`   Cache size: ${Object.keys(cached || {}).length}`);
            
            if (cached) {
                const cacheDifferences = [];
                Object.keys(formData).forEach(key => {
                    const formValue = formData[key];
                    const cacheValue = cached[key];
                    
                    if (formValue !== cacheValue) {
                        cacheDifferences.push({
                            field: key,
                            form: formValue,
                            cache: cacheValue
                        });
                    }
                });
                
                if (cacheDifferences.length > 0) {
                    console.log(`   ⚠️ נמצאו ${cacheDifferences.length} הבדלים בין הטופס למטמון:`);
                    cacheDifferences.forEach(diff => {
                        console.log(`     ${diff.field}: טופס="${diff.form}", מטמון="${diff.cache}"`);
                    });
                } else {
                    console.log('   ✅ כל השדות תואמים בין הטופס למטמון');
                }
            }
        }

        // 4. המלצות
        console.log('\n💡 המלצות:');
        if (differences && differences.length > 0) {
            console.log('   ⚠️ יש הבדלים בין הטופס לשרת - צריך לשמור');
        }
        
        if (cacheDifferences && cacheDifferences.length > 0) {
            console.log('   ⚠️ יש הבדלים בין הטופס למטמון - צריך לנקות מטמון');
        }

    } catch (error) {
        console.error('❌ שגיאה בבדיקת השדות:', error);
    }
}

// הרצת הבדיקה
debugAllFields();
