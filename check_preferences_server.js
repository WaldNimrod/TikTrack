// קוד לבדיקת מצב העדפות בשרת
console.log('🔍 בדיקת מצב העדפות בשרת');
console.log('============================');

// פונקציה לבדיקת מצב השרת
async function checkServerState() {
    try {
        // 1. בדיקת פרופילים
        console.log('\n📋 פרופילים בשרת:');
        const profilesResponse = await fetch('/api/preferences/profiles?user_id=1');
        const profilesData = await profilesResponse.json();
        
        if (profilesData.success) {
            const profiles = profilesData.data.profiles;
            profiles.forEach(profile => {
                console.log(`   ${profile.name} (ID: ${profile.id}) - Active: ${profile.active}, Default: ${profile.default}`);
            });
        } else {
            console.log('   ❌ שגיאה בטעינת פרופילים');
        }

        // 2. בדיקת העדפות פרופיל פעיל
        console.log('\n🎨 העדפות פרופיל פעיל:');
        const activeProfile = profilesData.data.profiles.find(p => p.active);
        if (activeProfile) {
            console.log(`   פרופיל פעיל: ${activeProfile.name} (ID: ${activeProfile.id})`);
            
            const preferencesResponse = await fetch(`/api/preferences/user?user_id=1&profile_id=${activeProfile.id}`);
            const preferencesData = await preferencesResponse.json();
            
            if (preferencesData.success) {
                const prefs = preferencesData.data.preferences;
                console.log(`   Primary Color: "${prefs.primaryColor || 'לא מוגדר'}"`);
                console.log(`   Secondary Color: "${prefs.secondaryColor || 'לא מוגדר'}"`);
                console.log(`   Total preferences: ${Object.keys(prefs).length}`);
            } else {
                console.log('   ❌ שגיאה בטעינת העדפות');
            }
        }

        // 3. בדיקת בריאות API
        console.log('\n🔧 בריאות API:');
        const healthResponse = await fetch('/api/health');
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log(`   Server status: ${healthData.status}`);
            console.log(`   Database: ${healthData.database ? 'Connected' : 'Disconnected'}`);
        } else {
            console.log('   ❌ שגיאה בבדיקת בריאות השרת');
        }

    } catch (error) {
        console.error('❌ שגיאה בבדיקת מצב השרת:', error);
    }
}

// הרצת הבדיקה
checkServerState();
