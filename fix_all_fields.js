// קוד לתיקון שמירה ועדכון של כל השדות
console.log('🔧 תיקון שמירה ועדכון של כל השדות');
console.log('===================================');

async function fixAllFields() {
    try {
        // 1. איסוף כל השדות מהטופס
        console.log('\n📋 איסוף כל השדות מהטופס:');
        const formElements = document.querySelectorAll('input, select, textarea');
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
        
        console.log(`   Collected ${Object.keys(formData).length} fields`);
        
        // 2. שמירה לשרת
        console.log('\n💾 שמירה לשרת:');
        const profilesResponse = await fetch('/api/preferences/profiles?user_id=1');
        const profilesData = await profilesResponse.json();
        
        if (profilesData.success) {
            const activeProfile = profilesData.data.profiles.find(p => p.active);
            if (activeProfile) {
                console.log(`   Saving to profile: ${activeProfile.name} (ID: ${activeProfile.id})`);
                
                const response = await fetch('/api/preferences/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        preferences: formData,
                        user_id: 1,
                        profile_id: activeProfile.id
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        console.log('   ✅ כל השדות נשמרו בהצלחה לשרת');
                        
                        // 3. ניקוי מטמון
                        console.log('\n🗑️ ניקוי מטמון:');
                        if (window.preferencesCache && window.preferencesCache.clear) {
                            window.preferencesCache.clear();
                            console.log('   ✅ מטמון העדפות נוקה');
                        }
                        
                        if (window.UnifiedCacheManager && window.UnifiedCacheManager.remove) {
                            await window.UnifiedCacheManager.remove('user-preferences');
                            console.log('   ✅ מטמון מאוחד נוקה');
                        }
                        
                        // 4. טעינה מחדש מהשרת
                        console.log('\n🔄 טעינה מחדש מהשרת:');
                        const prefsResponse = await fetch(`/api/preferences/user?user_id=1&profile_id=${activeProfile.id}`);
                        const prefsData = await prefsResponse.json();
                        
                        if (prefsData.success) {
                            const serverPrefs = prefsData.data.preferences;
                            console.log(`   Loaded ${Object.keys(serverPrefs).length} preferences from server`);
                            
                            // 5. עדכון הטופס
                            console.log('\n📝 עדכון הטופס:');
                            let updatedFields = 0;
                            
                            Object.keys(serverPrefs).forEach(key => {
                                const element = document.getElementById(key);
                                if (element) {
                                    if (element.type === 'checkbox') {
                                        element.checked = serverPrefs[key];
                                    } else if (element.type === 'color') {
                                        element.value = serverPrefs[key];
                                    } else {
                                        element.value = serverPrefs[key];
                                    }
                                    updatedFields++;
                                }
                            });
                            
                            console.log(`   ✅ עודכנו ${updatedFields} שדות בטופס`);
                            
                            // 6. עדכון מערכת הצבעים
                            if (window.colorSchemeSystem && window.colorSchemeSystem.loadColorSettings) {
                                window.colorSchemeSystem.loadColorSettings();
                                console.log('   ✅ מערכת הצבעים רועננה');
                            }
                            
                            // 7. עדכון מצב הכפתור
                            if (window.updateSaveButtonState) {
                                window.updateSaveButtonState();
                                console.log('   ✅ מצב הכפתור עודכן');
                            }
                            
                            console.log('\n🎉 כל השדות עודכנו בהצלחה!');
                            
                        } else {
                            throw new Error('שגיאה בטעינה מחדש מהשרת');
                        }
                        
                    } else {
                        throw new Error(`שגיאה בשמירה: ${result.message}`);
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } else {
                throw new Error('לא נמצא פרופיל פעיל');
            }
        } else {
            throw new Error('שגיאה בטעינת פרופילים');
        }
        
    } catch (error) {
        console.error('❌ שגיאה בתיקון השדות:', error);
    }
}

// הרצת התיקון
fixAllFields();
