// קוד בדיקה ספציפי לבעיית פתרון בעיות
console.log('🔍 === DEBUG PROBLEM RESOLUTION ===');

// 1. בדיקת אלמנטים
console.log('📋 1. בדיקת אלמנטים:');
const problemResolutionSection = document.getElementById('problemResolutionSection');
const missingTickersSection = document.getElementById('missingTickersSection');
const withinFileDuplicatesSection = document.getElementById('withinFileDuplicatesSection');
const existingRecordsSection = document.getElementById('existingRecordsSection');

console.log('Problem Resolution Section:', !!problemResolutionSection);
console.log('Missing Tickers Section:', !!missingTickersSection);
console.log('Within File Duplicates Section:', !!withinFileDuplicatesSection);
console.log('Existing Records Section:', !!existingRecordsSection);

// 2. בדיקת CSS
console.log('\n🎨 2. בדיקת CSS:');
if (problemResolutionSection) {
    console.log('Problem Resolution Display:', window.getComputedStyle(problemResolutionSection).display);
    console.log('Problem Resolution Visibility:', window.getComputedStyle(problemResolutionSection).visibility);
    console.log('Problem Resolution Height:', window.getComputedStyle(problemResolutionSection).height);
}

// 3. בדיקת משתנים
console.log('\n🌐 3. בדיקת משתנים:');
console.log('currentSessionId:', window.currentSessionId);
console.log('previewData:', window.previewData);

// 4. בדיקת פונקציות
console.log('\n⚙️ 4. בדיקת פונקציות:');
console.log('loadProblemResolution:', typeof window.loadProblemResolution);
console.log('displayProblemResolutionDetailed:', typeof window.displayProblemResolutionDetailed);
console.log('displayMissingTickers:', typeof window.displayMissingTickers);
console.log('displayWithinFileDuplicates:', typeof window.displayWithinFileDuplicates);
console.log('displayExistingRecords:', typeof window.displayExistingRecords);

// 5. בדיקת API
console.log('\n🌐 5. בדיקת API:');
if (window.currentSessionId) {
    console.log('Testing API call...');
    fetch(`/api/user-data-import/session/${window.currentSessionId}/preview`)
        .then(response => {
            console.log('API Response Status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);
            if (data.success) {
                console.log('Preview Data:', data.preview_data);
                console.log('Missing Tickers:', data.preview_data?.missing_tickers);
                console.log('Within File Duplicates:', data.preview_data?.within_file_duplicates);
                console.log('Existing Records:', data.preview_data?.existing_records);
            } else {
                console.log('API Error:', data.error);
            }
        })
        .catch(error => {
            console.error('API Error:', error);
        });
} else {
    console.log('No currentSessionId - cannot test API');
}

// 6. בדיקת שלבים
console.log('\n📈 6. בדיקת שלבים:');
const stepAnalysis = document.getElementById('step-analysis');
const stepProblems = document.getElementById('step-problems');

console.log('Step Analysis:', !!stepAnalysis, stepAnalysis?.style.display);
console.log('Step Problems:', !!stepProblems, stepProblems?.style.display);

// 7. בדיקת תוכן
console.log('\n📄 7. בדיקת תוכן:');
if (problemResolutionSection) {
    console.log('Problem Resolution HTML:', problemResolutionSection.innerHTML.substring(0, 200) + '...');
}

if (missingTickersSection) {
    console.log('Missing Tickers HTML:', missingTickersSection.innerHTML.substring(0, 200) + '...');
}

// 8. בדיקת containers
console.log('\n📦 8. בדיקת containers:');
const missingTickersContainer = document.getElementById('missingTickersContainer');
const withinFileDuplicatesContainer = document.getElementById('withinFileDuplicatesContainer');
const existingRecordsContainer = document.getElementById('existingRecordsContainer');

console.log('Missing Tickers Container:', !!missingTickersContainer);
console.log('Within File Duplicates Container:', !!withinFileDuplicatesContainer);
console.log('Existing Records Container:', !!existingRecordsContainer);

console.log('\n✅ === PROBLEM RESOLUTION DEBUG COMPLETE ===');
