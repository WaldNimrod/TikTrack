/**
 * Services Test Script - TikTrack
 * ===============================
 * 
 * סקריפט בדיקה למערכות השירות החדשות
 * 
 * @version 1.0.0
 * @created January 2025
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - testDataCollection() - Testdatacollection
// - testCRUDValidation() - Testcrudvalidation

// === UI Functions ===
// - testFieldRenderer() - Testfieldrenderer
// - updateSummary() - Updatesummary

// === Data Functions ===
// - testSetFormData() - Testsetformdata

// === Other ===
// - testResetForm() - Testresetform
// - testSelectPopulator() - Testselectpopulator
// - testCRUDSuccess() - Testcrudsuccess
// - testCRUDServerError() - Testcrudservererror
// - testDefaultValues() - Testdefaultvalues
// - testPreferenceValues() - Testpreferencevalues
// - testStatistics() - Teststatistics

// ===== GLOBAL TEST DATA =====

const testResults = {
    dataCollection: null,
    fieldRenderer: null,
    selectPopulator: null,
    crudHandler: null,
    defaultValues: null,
    statistics: null
};

// ===== TEST 1: DATA COLLECTION SERVICE =====

function testDataCollection() {
    try {
        window.Logger?.info('🧪 Testing DataCollectionService...');
        
        // איסוף נתונים
        const data = window.DataCollectionService.collectFormData({
            textField: { id: 'testText', type: 'text' },
            numberField: { id: 'testNumber', type: 'number' },
            dateField: { id: 'testDate', type: 'dateOnly' }
        });
        
        window.Logger?.info('✅ Data collected:', data);
        
        // הצגת תוצאות
        const result = document.getElementById('result1');
        result.style.display = 'block';
        result.textContent = '';
        const resultHTML = `
            <h5>נתונים שנאספו:</h5>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
        const parser = new DOMParser();
        const doc = parser.parseFromString(resultHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
            result.appendChild(node.cloneNode(true));
        });
        
        testResults.dataCollection = true;
        updateSummary();
        
    } catch (error) {
        window.Logger?.error('❌ Test failed:', error);
        testResults.dataCollection = false;
        updateSummary();
    }
}

function testSetFormData() {
    try {
        window.Logger?.info('🧪 Testing setFormData...');
        
        window.DataCollectionService.setFormData({
            textField: { id: 'testText', type: 'text' },
            numberField: { id: 'testNumber', type: 'number' }
        }, {
            textField: 'New Value',
            numberField: 999.99
        });
        
        window.Logger?.info('✅ Form data set successfully');
        window.showSuccessNotification('הצלחה', 'נתונים הוגדרו בהצלחה');
        
    } catch (error) {
        window.Logger?.error('❌ Test failed:', error);
    }
}

function testResetForm() {
    try {
        window.Logger?.info('🧪 Testing resetForm...');
        
        window.DataCollectionService.resetForm('testForm1', true);
        
        window.Logger?.info('✅ Form reset successfully');
        window.showSuccessNotification('הצלחה', 'טופס נוקה בהצלחה');
        
    } catch (error) {
        window.Logger?.error('❌ Test failed:', error);
    }
}

// ===== TEST 2: FIELD RENDERER SERVICE =====

function testFieldRenderer() {
    try {
        window.Logger?.info('🧪 Testing FieldRendererService...');
        
        // בדיקת status badges
        const statusBadges = [
            window.FieldRendererService.renderStatus('open', 'account'),
            window.FieldRendererService.renderStatus('closed', 'trade'),
            window.FieldRendererService.renderStatus('active', 'alert'),
            window.FieldRendererService.renderStatus('pending', 'note'),
            window.FieldRendererService.renderStatus('cancelled', 'trade')
        ];
        const statusBadgesEl = document.getElementById('statusBadges');
        statusBadgesEl.textContent = '';
        const parser = new DOMParser();
        statusBadges.forEach(badge => {
            const doc = parser.parseFromString(badge, 'text/html');
            doc.body.childNodes.forEach(node => {
                statusBadgesEl.appendChild(node.cloneNode(true));
            });
        });
        
        // בדיקת side badges
        const sideBadges = [
            window.FieldRendererService.renderSide('Long'),
            window.FieldRendererService.renderSide('Short')
        ];
        const sideBadgesEl = document.getElementById('sideBadges');
        sideBadgesEl.textContent = '';
        const parser = new DOMParser();
        sideBadges.forEach(badge => {
            const doc = parser.parseFromString(badge, 'text/html');
            doc.body.childNodes.forEach(node => {
                sideBadgesEl.appendChild(node.cloneNode(true));
            });
        });
        
        // בדיקת PnL badges
        const pnlBadges = [
            window.FieldRendererService.renderPnL(1250.50, '$'),
            window.FieldRendererService.renderPnL(-350.75, '$'),
            window.FieldRendererService.renderPnL(0, '$')
        ];
        const pnlBadgesEl = document.getElementById('pnlBadges');
        pnlBadgesEl.textContent = '';
        const parser = new DOMParser();
        pnlBadges.forEach(badge => {
            const doc = parser.parseFromString(badge, 'text/html');
            doc.body.childNodes.forEach(node => {
                pnlBadgesEl.appendChild(node.cloneNode(true));
            });
        });
        
        // בדיקת type badges
        const typeBadges = [
            window.FieldRendererService.renderType('swing'),
            window.FieldRendererService.renderType('investment'),
            window.FieldRendererService.renderType('passive')
        ];
        const typeBadgesEl = document.getElementById('typeBadges');
        typeBadgesEl.textContent = '';
        const parser = new DOMParser();
        typeBadges.forEach(badge => {
            const doc = parser.parseFromString(badge, 'text/html');
            doc.body.childNodes.forEach(node => {
                typeBadgesEl.appendChild(node.cloneNode(true));
            });
        });
        
        // בדיקת action badges
        const actionBadges = [
            window.FieldRendererService.renderAction('buy'),
            window.FieldRendererService.renderAction('sell')
        ];
        const actionBadgesEl = document.getElementById('actionBadges');
        actionBadgesEl.textContent = '';
        const parser = new DOMParser();
        actionBadges.forEach(badge => {
            const doc = parser.parseFromString(badge, 'text/html');
            doc.body.childNodes.forEach(node => {
                actionBadgesEl.appendChild(node.cloneNode(true));
            });
        });
        
        // בדיקת priority badges
        const priorityBadges = [
            window.FieldRendererService.renderPriority('high'),
            window.FieldRendererService.renderPriority('medium'),
            window.FieldRendererService.renderPriority('low')
        ];
        const priorityBadgesEl = document.getElementById('priorityBadges');
        priorityBadgesEl.textContent = '';
        const parser = new DOMParser();
        priorityBadges.forEach(badge => {
            const doc = parser.parseFromString(badge, 'text/html');
            doc.body.childNodes.forEach(node => {
                priorityBadgesEl.appendChild(node.cloneNode(true));
            });
        });
        
        window.Logger?.info('✅ All badges rendered successfully');
        testResults.fieldRenderer = true;
        updateSummary();
        
    } catch (error) {
        window.Logger?.error('❌ Test failed:', error);
        testResults.fieldRenderer = false;
        updateSummary();
    }
}

// ===== TEST 3: SELECT POPULATOR SERVICE =====

async function testSelectPopulator() {
    try {
        window.Logger?.info('🧪 Testing SelectPopulatorService...');
        
        const result = document.getElementById('result3');
        result.style.display = 'block';
        result.textContent = '⏳ טוען נתונים...';
        
        // טעינת כל ה-selects
        await Promise.all([
            window.SelectPopulatorService.populateTickersSelect('testTickerSelect'),
            window.SelectPopulatorService.populateAccountsSelect('testAccountSelect', { defaultFromPreferences: true }),
            window.SelectPopulatorService.populateCurrenciesSelect('testCurrencySelect', { defaultFromPreferences: true }),
            window.SelectPopulatorService.populateTradePlansSelect('testPlanSelect')
        ]);
        
        result.textContent = '';
        const resultHTML = `
            <h5>✅ כל ה-Select Boxes נטענו בהצלחה!</h5>
            <p>בדוק את התפריטים הנפתחים למעלה.</p>
        `;
        const parser = new DOMParser();
        const doc = parser.parseFromString(resultHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
            result.appendChild(node.cloneNode(true));
        });
        
        window.Logger?.info('✅ All selects populated successfully');
        testResults.selectPopulator = true;
        updateSummary();
        
    } catch (error) {
        window.Logger?.error('❌ Test failed:', error);
        const result = document.getElementById('result3');
        result.textContent = '';
        const errorHTML = `<h5 class="text-danger">❌ שגיאה: ${error.message}</h5>`;
        const parser = new DOMParser();
        const doc = parser.parseFromString(errorHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
            result.appendChild(node.cloneNode(true));
        });
        testResults.selectPopulator = false;
        updateSummary();
    }
}

// ===== TEST 4: CRUD RESPONSE HANDLER =====

function testCRUDSuccess() {
    window.Logger?.info('🧪 Testing CRUDResponseHandler - Success...');
    
    // סימולציה של תגובה מוצלחת
    const mockResponse = new Response(JSON.stringify({ id: 123, name: 'Test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
    
    window.CRUDResponseHandler.handleSaveResponse(mockResponse, {
        successMessage: 'פריט נשמר בהצלחה (סימולציה)',
        entityName: 'פריט בדיקה'
    });
    
    testResults.crudHandler = true;
    updateSummary();
}

function testCRUDValidation() {
    window.Logger?.info('🧪 Testing CRUDResponseHandler - Validation Error...');
    
    // סימולציה של שגיאת ולידציה (400)
    const mockResponse = new Response(JSON.stringify({ message: 'שדה חובה חסר' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
    
    window.CRUDResponseHandler.handleSaveResponse(mockResponse, {
        entityName: 'פריט בדיקה'
    });
}

function testCRUDServerError() {
    window.Logger?.info('🧪 Testing CRUDResponseHandler - Server Error...');
    
    // סימולציה של שגיאת מערכת (500)
    const mockResponse = new Response(JSON.stringify({ message: 'שגיאת שרת פנימית' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
    
    window.CRUDResponseHandler.handleSaveResponse(mockResponse, {
        entityName: 'פריט בדיקה'
    });
}

// ===== TEST 5: DEFAULT VALUE SETTER =====

async function testDefaultValues() {
    try {
        window.Logger?.info('🧪 Testing DefaultValueSetter...');
        
        // הגדרת תאריך נוכחי
        window.DefaultValueSetter.setCurrentDate('testDefaultDate');
        
        // הגדרת תאריך + שעה
        window.DefaultValueSetter.setCurrentDateTime('testDefaultDateTime');
        
        // הגדרת ערך לוגי
        window.DefaultValueSetter.setLogicalDefault('testDefaultStatus', 'open');
        
        const result = document.getElementById('result5');
        result.style.display = 'block';
        result.textContent = '';
        const resultHTML = `
            <h5>✅ ברירות מחדל הוגדרו בהצלחה!</h5>
            <p>תאריך: ${document.getElementById('testDefaultDate').value}</p>
            <p>תאריך + שעה: ${document.getElementById('testDefaultDateTime').value}</p>
            <p>סטטוס: ${document.getElementById('testDefaultStatus').value}</p>
        `;
        const parser = new DOMParser();
        const doc = parser.parseFromString(resultHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
            result.appendChild(node.cloneNode(true));
        });
        
        window.Logger?.info('✅ Default values set successfully');
        testResults.defaultValues = true;
        updateSummary();
        
    } catch (error) {
        window.Logger?.error('❌ Test failed:', error);
        testResults.defaultValues = false;
        updateSummary();
    }
}

async function testPreferenceValues() {
    try {
        window.Logger?.info('🧪 Testing preference values...');
        
        // נסה לטעון ברירת מחדל למטבע (אם קיימת)
        const currency = await window.DefaultValueSetter.setPreferenceValue('testDefaultStatus', 'primaryCurrency');
        
        window.Logger?.info('✅ Preference value loaded:', currency);
        window.showInfoNotification('מידע', `ברירת מחדל: ${currency || 'לא הוגדר'}`);
        
    } catch (error) {
        window.Logger?.error('❌ Test failed:', error);
    }
}

// ===== TEST 6: STATISTICS CALCULATOR =====

function testStatistics() {
    try {
        window.Logger?.info('🧪 Testing StatisticsCalculator...');
        
        // נתוני בדיקה
        const testData = [
            { status: 'open', price: 100, quantity: 10, pl: 250 },
            { status: 'open', price: 200, quantity: 5, pl: -150 },
            { status: 'closed', price: 150, quantity: 8, pl: 500 },
            { status: 'closed', price: 120, quantity: 12, pl: 300 },
            { status: 'pending', price: 180, quantity: 6, pl: 0 }
        ];
        
        // חישובים
        const totalPL = window.StatisticsCalculator.calculateSum(testData, 'pl');
        const avgPrice = window.StatisticsCalculator.calculateAverage(testData, 'price');
        const totalRecords = window.StatisticsCalculator.countRecords(testData);
        const openRecords = window.StatisticsCalculator.countRecords(testData, (item) => item.status === 'open');
        const { min, max } = window.StatisticsCalculator.getMinMax(testData, 'price');
        const byStatus = window.StatisticsCalculator.groupBy(testData, 'status');
        
        // הצגת תוצאות
        const result = document.getElementById('result6');
        result.textContent = '';
        const resultHTML = `
            <div class="alert alert-success">
                <h5>✅ חישובים הושלמו בהצלחה!</h5>
                <ul>
                    <li><strong>סכום PnL:</strong> ${totalPL.toFixed(2)}</li>
                    <li><strong>מחיר ממוצע:</strong> ${avgPrice.toFixed(2)}</li>
                    <li><strong>סה"כ רשומות:</strong> ${totalRecords}</li>
                    <li><strong>רשומות פתוחות:</strong> ${openRecords}</li>
                    <li><strong>מחיר מינימלי:</strong> ${min}</li>
                    <li><strong>מחיר מקסימלי:</strong> ${max}</li>
                    <li><strong>קיבוץ לפי סטטוס:</strong> ${JSON.stringify(Object.keys(byStatus))}</li>
                </ul>
            </div>
        `;
        const parser = new DOMParser();
        const doc = parser.parseFromString(resultHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
            result.appendChild(node.cloneNode(true));
        });
        
        window.Logger?.info('✅ Statistics calculated successfully');
        testResults.statistics = true;
        updateSummary();
        
    } catch (error) {
        window.Logger?.error('❌ Test failed:', error);
        testResults.statistics = false;
        updateSummary();
    }
}

// ===== SUMMARY UPDATE =====

function updateSummary() {
    const summary = document.getElementById('summary');
    
    const tests = [
        { name: 'DataCollectionService', result: testResults.dataCollection },
        { name: 'FieldRendererService', result: testResults.fieldRenderer },
        { name: 'SelectPopulatorService', result: testResults.selectPopulator },
        { name: 'CRUDResponseHandler', result: testResults.crudHandler },
        { name: 'DefaultValueSetter', result: testResults.defaultValues },
        { name: 'StatisticsCalculator', result: testResults.statistics }
    ];
    
    const passed = tests.filter(t => t.result === true).length;
    const failed = tests.filter(t => t.result === false).length;
    const notRun = tests.filter(t => t.result === null).length;
    
    let html = '<div class="row">';
    
    tests.forEach(test => {
        let badge = '';
        if (test.result === true) {
            badge = '<span class="badge bg-success">✅ עבר</span>';
        } else if (test.result === false) {
            badge = '<span class="badge bg-danger">❌ נכשל</span>';
        } else {
            badge = '<span class="badge bg-secondary">⏳ לא רץ</span>';
        }
        
        html += `
            <div class="col-md-4 mb-2">
                <div class="d-flex justify-content-between align-items-center p-2 border rounded">
                    <span>${test.name}</span>
                    ${badge}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    html += `
        <div class="mt-3 alert ${passed === tests.length ? 'alert-success' : 'alert-info'}">
            <h5>סיכום:</h5>
            <ul class="mb-0">
                <li>✅ עברו: ${passed}/6</li>
                <li>❌ נכשלו: ${failed}/6</li>
                <li>⏳ לא רצו: ${notRun}/6</li>
            </ul>
        </div>
    `;
    
    summary.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.body.childNodes.forEach(node => {
        summary.appendChild(node.cloneNode(true));
    });
}

// ===== INITIALIZATION =====

window.addEventListener('DOMContentLoaded', function() {
    window.Logger?.info('🚀 Services Test Page Initialized');
    
    // הצגת summary ריק
    updateSummary();
    
    // הגדרת תאריך ברירת מחדל לבדיקה
    window.DefaultValueSetter.setCurrentDateTime('testDate');
});

// ===== EXPORT FUNCTIONS =====

window.testDataCollection = testDataCollection;
window.testSetFormData = testSetFormData;
window.testResetForm = testResetForm;
window.testFieldRenderer = testFieldRenderer;
window.testSelectPopulator = testSelectPopulator;
window.testCRUDSuccess = testCRUDSuccess;
window.testCRUDValidation = testCRUDValidation;
window.testCRUDServerError = testCRUDServerError;
window.testDefaultValues = testDefaultValues;
window.testPreferenceValues = testPreferenceValues;
window.testStatistics = testStatistics;

