/**
 * Services Test Script - TikTrack
 * ===============================
 * 
 * סקריפט בדיקה למערכות השירות החדשות
 * 
 * @version 1.0.0
 * @created January 2025
 */

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
        console.log('🧪 Testing DataCollectionService...');
        
        // איסוף נתונים
        const data = window.DataCollectionService.collectFormData({
            textField: { id: 'testText', type: 'text' },
            numberField: { id: 'testNumber', type: 'number' },
            dateField: { id: 'testDate', type: 'dateOnly' }
        });
        
        console.log('✅ Data collected:', data);
        
        // הצגת תוצאות
        const result = document.getElementById('result1');
        result.style.display = 'block';
        result.innerHTML = `
            <h5>נתונים שנאספו:</h5>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
        
        testResults.dataCollection = true;
        updateSummary();
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        testResults.dataCollection = false;
        updateSummary();
    }
}

function testSetFormData() {
    try {
        console.log('🧪 Testing setFormData...');
        
        window.DataCollectionService.setFormData({
            textField: { id: 'testText', type: 'text' },
            numberField: { id: 'testNumber', type: 'number' }
        }, {
            textField: 'New Value',
            numberField: 999.99
        });
        
        console.log('✅ Form data set successfully');
        window.showSuccessNotification('הצלחה', 'נתונים הוגדרו בהצלחה');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

function testResetForm() {
    try {
        console.log('🧪 Testing resetForm...');
        
        window.DataCollectionService.resetForm('testForm1', true);
        
        console.log('✅ Form reset successfully');
        window.showSuccessNotification('הצלחה', 'טופס נוקה בהצלחה');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// ===== TEST 2: FIELD RENDERER SERVICE =====

function testFieldRenderer() {
    try {
        console.log('🧪 Testing FieldRendererService...');
        
        // בדיקת status badges
        const statusBadges = [
            window.FieldRendererService.renderStatus('open', 'account'),
            window.FieldRendererService.renderStatus('closed', 'trade'),
            window.FieldRendererService.renderStatus('active', 'alert'),
            window.FieldRendererService.renderStatus('pending', 'note'),
            window.FieldRendererService.renderStatus('cancelled', 'trade')
        ];
        document.getElementById('statusBadges').innerHTML = statusBadges.join(' ');
        
        // בדיקת side badges
        const sideBadges = [
            window.FieldRendererService.renderSide('Long'),
            window.FieldRendererService.renderSide('Short')
        ];
        document.getElementById('sideBadges').innerHTML = sideBadges.join(' ');
        
        // בדיקת PnL badges
        const pnlBadges = [
            window.FieldRendererService.renderPnL(1250.50, '$'),
            window.FieldRendererService.renderPnL(-350.75, '$'),
            window.FieldRendererService.renderPnL(0, '$')
        ];
        document.getElementById('pnlBadges').innerHTML = pnlBadges.join(' ');
        
        // בדיקת type badges
        const typeBadges = [
            window.FieldRendererService.renderType('swing'),
            window.FieldRendererService.renderType('investment'),
            window.FieldRendererService.renderType('passive')
        ];
        document.getElementById('typeBadges').innerHTML = typeBadges.join(' ');
        
        // בדיקת action badges
        const actionBadges = [
            window.FieldRendererService.renderAction('buy'),
            window.FieldRendererService.renderAction('sell')
        ];
        document.getElementById('actionBadges').innerHTML = actionBadges.join(' ');
        
        // בדיקת priority badges
        const priorityBadges = [
            window.FieldRendererService.renderPriority('high'),
            window.FieldRendererService.renderPriority('medium'),
            window.FieldRendererService.renderPriority('low')
        ];
        document.getElementById('priorityBadges').innerHTML = priorityBadges.join(' ');
        
        console.log('✅ All badges rendered successfully');
        testResults.fieldRenderer = true;
        updateSummary();
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        testResults.fieldRenderer = false;
        updateSummary();
    }
}

// ===== TEST 3: SELECT POPULATOR SERVICE =====

async function testSelectPopulator() {
    try {
        console.log('🧪 Testing SelectPopulatorService...');
        
        const result = document.getElementById('result3');
        result.style.display = 'block';
        result.innerHTML = '⏳ טוען נתונים...';
        
        // טעינת כל ה-selects
        await Promise.all([
            window.SelectPopulatorService.populateTickersSelect('testTickerSelect'),
            window.SelectPopulatorService.populateAccountsSelect('testAccountSelect', { defaultFromPreferences: true }),
            window.SelectPopulatorService.populateCurrenciesSelect('testCurrencySelect', { defaultFromPreferences: true }),
            window.SelectPopulatorService.populateTradePlansSelect('testPlanSelect')
        ]);
        
        result.innerHTML = `
            <h5>✅ כל ה-Select Boxes נטענו בהצלחה!</h5>
            <p>בדוק את התפריטים הנפתחים למעלה.</p>
        `;
        
        console.log('✅ All selects populated successfully');
        testResults.selectPopulator = true;
        updateSummary();
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        const result = document.getElementById('result3');
        result.innerHTML = `<h5 class="text-danger">❌ שגיאה: ${error.message}</h5>`;
        testResults.selectPopulator = false;
        updateSummary();
    }
}

// ===== TEST 4: CRUD RESPONSE HANDLER =====

function testCRUDSuccess() {
    console.log('🧪 Testing CRUDResponseHandler - Success...');
    
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
    console.log('🧪 Testing CRUDResponseHandler - Validation Error...');
    
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
    console.log('🧪 Testing CRUDResponseHandler - Server Error...');
    
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
        console.log('🧪 Testing DefaultValueSetter...');
        
        // הגדרת תאריך נוכחי
        window.DefaultValueSetter.setCurrentDate('testDefaultDate');
        
        // הגדרת תאריך + שעה
        window.DefaultValueSetter.setCurrentDateTime('testDefaultDateTime');
        
        // הגדרת ערך לוגי
        window.DefaultValueSetter.setLogicalDefault('testDefaultStatus', 'open');
        
        const result = document.getElementById('result5');
        result.style.display = 'block';
        result.innerHTML = `
            <h5>✅ ברירות מחדל הוגדרו בהצלחה!</h5>
            <p>תאריך: ${document.getElementById('testDefaultDate').value}</p>
            <p>תאריך + שעה: ${document.getElementById('testDefaultDateTime').value}</p>
            <p>סטטוס: ${document.getElementById('testDefaultStatus').value}</p>
        `;
        
        console.log('✅ Default values set successfully');
        testResults.defaultValues = true;
        updateSummary();
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        testResults.defaultValues = false;
        updateSummary();
    }
}

async function testPreferenceValues() {
    try {
        console.log('🧪 Testing preference values...');
        
        // נסה לטעון ברירת מחדל למטבע (אם קיימת)
        const currency = await window.DefaultValueSetter.setPreferenceValue('testDefaultStatus', 'default_currency');
        
        console.log('✅ Preference value loaded:', currency);
        window.showInfoNotification('מידע', `ברירת מחדל: ${currency || 'לא הוגדר'}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// ===== TEST 6: STATISTICS CALCULATOR =====

function testStatistics() {
    try {
        console.log('🧪 Testing StatisticsCalculator...');
        
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
        result.innerHTML = `
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
        
        console.log('✅ Statistics calculated successfully');
        testResults.statistics = true;
        updateSummary();
        
    } catch (error) {
        console.error('❌ Test failed:', error);
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
    
    summary.innerHTML = html;
}

// ===== INITIALIZATION =====

window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Services Test Page Initialized');
    
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

