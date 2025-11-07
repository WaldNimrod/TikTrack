// קוד בדיקה לקונסולה - פתרון בעיות ייבוא
console.log('🔍 === DEBUG IMPORT MODAL ===');

// 1. בדיקת אלמנטים
console.log('📋 1. בדיקת אלמנטים:');
const modal = document.getElementById('importUserDataModal');
const stepAnalysis = document.getElementById('step-analysis');
const problemResolutionSection = document.getElementById('problemResolutionSection');
const missingTickersSection = document.getElementById('missingTickersSection');
const tradingAccountSelect = document.getElementById('tradingAccountSelect');

console.log('Modal:', !!modal);
console.log('Step Analysis:', !!stepAnalysis);
console.log('Problem Resolution Section:', !!problemResolutionSection);
console.log('Missing Tickers Section:', !!missingTickersSection);
console.log('Trading Account Select:', !!tradingAccountSelect);

// 2. בדיקת ערכי DOM
console.log('\n📊 2. בדיקת ערכי DOM:');
if (tradingAccountSelect) {
    console.log('Trading Account Value:', tradingAccountSelect.value);
    console.log('Trading Account Options:', tradingAccountSelect.options.length);
    console.log('Selected Option:', tradingAccountSelect.options[tradingAccountSelect.selectedIndex]?.textContent);
}

// 3. בדיקת משתנים גלובליים
console.log('\n🌐 3. בדיקת משתנים גלובליים:');
console.log('currentSessionId:', window.currentSessionId || 'undefined');
console.log('selectedFile:', window.selectedFile || 'undefined');
console.log('selectedAccount:', window.selectedAccount || 'undefined');
console.log('selectedConnector:', window.selectedConnector || 'undefined');

// 4. בדיקת פונקציות
console.log('\n⚙️ 4. בדיקת פונקציות:');
console.log('handleAccountSelect:', typeof window.handleAccountSelect);
console.log('updateAnalyzeButton:', typeof window.updateAnalyzeButton);
console.log('loadProblemResolution:', typeof window.loadProblemResolution);
console.log('displayProblemResolutionDetailed:', typeof window.displayProblemResolutionDetailed);

// 5. בדיקת event listeners
console.log('\n🎧 5. בדיקת event listeners:');
if (tradingAccountSelect) {
    const listeners = getEventListeners ? getEventListeners(tradingAccountSelect) : 'getEventListeners not available';
    console.log('Account Select Listeners:', listeners);
}

// 6. בדיקת שלבים
console.log('\n📈 6. בדיקת שלבים:');
const allSteps = document.querySelectorAll('.import-step');
allSteps.forEach((step, index) => {
    console.log(`Step ${index + 1} (${step.id}):`, step.style.display);
});

// 7. בדיקת נתוני ניתוח
console.log('\n📊 7. בדיקת נתוני ניתוח:');
console.log('analysisResults:', window.analysisResults || 'undefined');

// 8. בדיקת נתוני preview
console.log('\n👁️ 8. בדיקת נתוני preview:');
console.log('previewData:', window.previewData || 'undefined');

// 9. בדיקת API calls
console.log('\n🌐 9. בדיקת API calls:');
if (window.currentSessionId) {
    fetch(`/api/user-data-import/session/${window.currentSessionId}/preview`)
        .then(response => response.json())
        .then(data => {
            console.log('Preview API Response:', data);
            if (data.success) {
                console.log('Preview Data Keys:', Object.keys(data.preview_data || {}));
                console.log('Missing Tickers:', data.preview_data?.missing_tickers?.length || 0);
                console.log('Within File Duplicates:', data.preview_data?.within_file_duplicates?.length || 0);
                console.log('Existing Records:', data.preview_data?.existing_records?.length || 0);
            }
        })
        .catch(error => console.error('Preview API Error:', error));
} else {
    console.log('No currentSessionId - cannot test API');
}

// 10. בדיקת CSS
console.log('\n🎨 10. בדיקת CSS:');
if (problemResolutionSection) {
    console.log('Problem Resolution Section Display:', window.getComputedStyle(problemResolutionSection).display);
    console.log('Problem Resolution Section Visibility:', window.getComputedStyle(problemResolutionSection).visibility);
}

console.log('\n✅ === DEBUG COMPLETE ===');
