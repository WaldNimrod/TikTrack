async function loadAnalytics() {
    try {
        const response = await fetch('/api/cache/analytics');
        if (response.ok) {
            const result = await response.json();
            cacheData.analytics = result; // Keep full response structure
            updateAnalyticsDisplay();
            console.log('✅ Analytics loaded successfully');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error loading analytics:', error);
        cacheData.analytics = null;
        updateAnalyticsDisplay();
        
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'לא ניתן לטעון נתוני ניתוח - השרת לא זמין');
        }
    }
}
