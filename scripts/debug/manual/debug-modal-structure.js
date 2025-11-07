// קוד בדיקה מפורט למבנה המודל ופתרון בעיות
console.log('🔍 === DEBUG MODAL STRUCTURE & PROBLEM RESOLUTION ===');

// 1. בדיקת מבנה המודל
console.log('📋 1. מבנה המודל:');
const modal = document.getElementById('importUserDataModal');
const modalDialog = modal?.querySelector('.modal-dialog');
const modalContent = modal?.querySelector('.modal-content');
const modalBody = modal?.querySelector('.modal-body');

console.log('Modal:', modal);
console.log('Modal Dialog:', modalDialog);
console.log('Modal Content:', modalContent);
console.log('Modal Body:', modalBody);

if (modalDialog) {
    console.log('Modal Dialog Classes:', modalDialog.className);
    console.log('Modal Dialog Style:', modalDialog.style.cssText);
    console.log('Modal Dialog Computed Style:', window.getComputedStyle(modalDialog));
}

if (modalContent) {
    console.log('Modal Content Classes:', modalContent.className);
    console.log('Modal Content Style:', modalContent.style.cssText);
    console.log('Modal Content Computed Style:', window.getComputedStyle(modalContent));
}

if (modalBody) {
    console.log('Modal Body Classes:', modalBody.className);
    console.log('Modal Body Style:', modalBody.style.cssText);
    console.log('Modal Body Computed Style:', window.getComputedStyle(modalBody));
}

// 2. בדיקת שלבים
console.log('\n📈 2. בדיקת שלבים:');
const allSteps = document.querySelectorAll('.import-step');
allSteps.forEach((step, index) => {
    const computedStyle = window.getComputedStyle(step);
    console.log(`Step ${index + 1} (${step.id}):`, {
        display: step.style.display,
        computedDisplay: computedStyle.display,
        visibility: computedStyle.visibility,
        height: computedStyle.height,
        maxHeight: computedStyle.maxHeight,
        overflow: computedStyle.overflow
    });
});

// 3. בדיקת פתרון בעיות
console.log('\n🔧 3. בדיקת פתרון בעיות:');
const problemResolutionSection = document.getElementById('problemResolutionSection');
const missingTickersSection = document.getElementById('missingTickersSection');
const withinFileDuplicatesSection = document.getElementById('withinFileDuplicatesSection');
const existingRecordsSection = document.getElementById('existingRecordsSection');

const sections = [
    { name: 'Problem Resolution', element: problemResolutionSection },
    { name: 'Missing Tickers', element: missingTickersSection },
    { name: 'Within File Duplicates', element: withinFileDuplicatesSection },
    { name: 'Existing Records', element: existingRecordsSection }
];

sections.forEach(section => {
    if (section.element) {
        const computedStyle = window.getComputedStyle(section.element);
        console.log(`${section.name} Section:`, {
            display: section.element.style.display,
            computedDisplay: computedStyle.display,
            visibility: computedStyle.visibility,
            height: computedStyle.height,
            maxHeight: computedStyle.maxHeight,
            overflow: computedStyle.overflow,
            overflowY: computedStyle.overflowY,
            padding: computedStyle.padding,
            margin: computedStyle.margin,
            backgroundColor: computedStyle.backgroundColor,
            border: computedStyle.border
        });
    } else {
        console.log(`${section.name} Section: NOT FOUND`);
    }
});

// 4. בדיקת containers
console.log('\n📦 4. בדיקת containers:');
const containers = [
    { name: 'Missing Tickers Container', id: 'missingTickersContainer' },
    { name: 'Within File Duplicates Container', id: 'withinFileDuplicatesContainer' },
    { name: 'Existing Records Container', id: 'existingRecordsContainer' }
];

containers.forEach(container => {
    const element = document.getElementById(container.id);
    if (element) {
        const computedStyle = window.getComputedStyle(element);
        console.log(`${container.name}:`, {
            display: computedStyle.display,
            height: computedStyle.height,
            maxHeight: computedStyle.maxHeight,
            overflow: computedStyle.overflow,
            overflowY: computedStyle.overflowY,
            content: element.innerHTML.substring(0, 100) + '...'
        });
    } else {
        console.log(`${container.name}: NOT FOUND`);
    }
});

// 5. בדיקת CSS rules
console.log('\n🎨 5. בדיקת CSS rules:');
const styleSheets = document.styleSheets;
let importModalRules = [];
let problemResolutionRules = [];

for (let i = 0; i < styleSheets.length; i++) {
    try {
        const rules = styleSheets[i].cssRules || styleSheets[i].rules;
        for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule.selectorText) {
                if (rule.selectorText.includes('importUserDataModal')) {
                    importModalRules.push({
                        selector: rule.selectorText,
                        style: rule.style.cssText
                    });
                }
                if (rule.selectorText.includes('problem-resolution')) {
                    problemResolutionRules.push({
                        selector: rule.selectorText,
                        style: rule.style.cssText
                    });
                }
            }
        }
    } catch (e) {
        console.log(`Cannot access stylesheet ${i}:`, e.message);
    }
}

console.log('Import Modal CSS Rules:', importModalRules);
console.log('Problem Resolution CSS Rules:', problemResolutionRules);

// 6. בדיקת תוכן
console.log('\n📄 6. בדיקת תוכן:');
if (problemResolutionSection) {
    console.log('Problem Resolution HTML Length:', problemResolutionSection.innerHTML.length);
    console.log('Problem Resolution HTML:', problemResolutionSection.innerHTML);
}

if (missingTickersSection) {
    console.log('Missing Tickers HTML Length:', missingTickersSection.innerHTML.length);
    console.log('Missing Tickers HTML:', missingTickersSection.innerHTML);
}

// 7. בדיקת מידות
console.log('\n📏 7. בדיקת מידות:');
if (modal) {
    const modalRect = modal.getBoundingClientRect();
    console.log('Modal Dimensions:', {
        width: modalRect.width,
        height: modalRect.height,
        top: modalRect.top,
        left: modalRect.left,
        right: modalRect.right,
        bottom: modalRect.bottom
    });
}

if (modalBody) {
    const bodyRect = modalBody.getBoundingClientRect();
    console.log('Modal Body Dimensions:', {
        width: bodyRect.width,
        height: bodyRect.height,
        scrollHeight: modalBody.scrollHeight,
        scrollTop: modalBody.scrollTop,
        scrollLeft: modalBody.scrollLeft
    });
}

if (problemResolutionSection) {
    const problemRect = problemResolutionSection.getBoundingClientRect();
    console.log('Problem Resolution Dimensions:', {
        width: problemRect.width,
        height: problemRect.height,
        scrollHeight: problemResolutionSection.scrollHeight,
        scrollTop: problemResolutionSection.scrollTop
    });
}

// 8. בדיקת משתנים
console.log('\n🌐 8. בדיקת משתנים:');
console.log('currentSessionId:', window.currentSessionId);
console.log('previewData:', window.previewData);
console.log('analysisResults:', window.analysisResults);

// 9. בדיקת פונקציות
console.log('\n⚙️ 9. בדיקת פונקציות:');
console.log('loadProblemResolution:', typeof window.loadProblemResolution);
console.log('displayProblemResolutionDetailed:', typeof window.displayProblemResolutionDetailed);
console.log('displayMissingTickers:', typeof window.displayMissingTickers);

// 10. בדיקת API
console.log('\n🌐 10. בדיקת API:');
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
                console.log('Preview Data Keys:', Object.keys(data.preview_data || {}));
                console.log('Missing Tickers Count:', data.preview_data?.missing_tickers?.length || 0);
                console.log('Within File Duplicates Count:', data.preview_data?.within_file_duplicates?.length || 0);
                console.log('Existing Records Count:', data.preview_data?.existing_records?.length || 0);
                
                // בדיקת תוכן מפורט
                if (data.preview_data?.missing_tickers?.length > 0) {
                    console.log('Missing Tickers Sample:', data.preview_data.missing_tickers.slice(0, 3));
                }
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

console.log('\n✅ === MODAL STRUCTURE DEBUG COMPLETE ===');
