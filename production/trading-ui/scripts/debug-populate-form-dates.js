/**
 * Debug script for populateForm date handling
 * קוד ניטור לבדיקת טיפול בתאריכים ב-populateForm
 * 
 * Run in console: debugPopulateFormDates(executionId)
 */


// ===== FUNCTION INDEX =====

// === Other ===
// - addTimeline() - Addtimeline

window.debugPopulateFormDates = async function(executionId) {
    console.log('🔍 ===== DEBUG: PopulateForm Date Handling =====');
    console.log('📅 Start time:', new Date().toISOString());
    
    const report = {
        startTime: new Date().toISOString(),
        executionId: executionId,
        apiResponse: null,
        dateFieldValue: null,
        tickerFieldValue: null,
        dateEnvelopeDetected: false,
        dateUtilsAvailable: false,
        errors: [],
        timeline: []
    };
    
    // Helper to add timeline event
    const addTimeline = (event, data = {}) => {
        const entry = {
            time: new Date().toISOString(),
            event,
            ...data
        };
        report.timeline.push(entry);
        console.log(`⏱️ [${entry.time}] ${event}`, data);
    };
    
    try {
        // 1. Check dateUtils availability
        report.dateUtilsAvailable = !!(window.dateUtils && typeof window.dateUtils.toDateObject === 'function');
        addTimeline('DateUtils check', { available: report.dateUtilsAvailable });
        
        // 2. Fetch execution data from API
        addTimeline('Fetching execution from API', { executionId });
        const response = await fetch(`/api/executions/${executionId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        report.apiResponse = result;
        addTimeline('API response received', {
            status: result.status,
            hasData: !!result.data,
            dataKeys: result.data ? Object.keys(result.data) : []
        });
        
        if (!result.data) {
            throw new Error('No data in API response');
        }
        
        const executionData = result.data;
        
        // 3. Check date field
        const dateValue = executionData.date;
        report.dateFieldValue = dateValue;
        addTimeline('Date field analysis', {
            value: dateValue,
            type: typeof dateValue,
            isDateEnvelope: window.dateUtils ? window.dateUtils.isDateEnvelope(dateValue) : (dateValue && typeof dateValue === 'object' && 'epochMs' in dateValue && 'utc' in dateValue),
            isDateObject: dateValue instanceof Date,
            isString: typeof dateValue === 'string',
            keys: dateValue && typeof dateValue === 'object' ? Object.keys(dateValue) : null
        });
        
        if (dateValue && typeof dateValue === 'object' && ('epochMs' in dateValue || 'utc' in dateValue)) {
            report.dateEnvelopeDetected = true;
            addTimeline('DateEnvelope detected', {
                utc: dateValue.utc,
                epochMs: dateValue.epochMs,
                local: dateValue.local,
                timezone: dateValue.timezone,
                display: dateValue.display
            });
            
            // Test conversion
            if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                try {
                    const dateObj = window.dateUtils.toDateObject(dateValue);
                    addTimeline('DateEnvelope conversion test', {
                        success: !!dateObj,
                        dateObj: dateObj ? dateObj.toISOString() : null,
                        isValid: dateObj && !isNaN(dateObj.getTime())
                    });
                    
                    if (dateObj && !isNaN(dateObj.getTime())) {
                        // Format as datetime-local
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
                        addTimeline('Formatted datetime-local', { formatted });
                    }
                } catch (error) {
                    report.errors.push(`DateEnvelope conversion error: ${error.message}`);
                    addTimeline('DateEnvelope conversion error', { error: error.message });
                }
            }
        }
        
        // 4. Check ticker field
        const tickerValue = executionData.ticker_id;
        report.tickerFieldValue = tickerValue;
        addTimeline('Ticker field analysis', {
            value: tickerValue,
            type: typeof tickerValue
        });
        
        // 5. Check modal state
        const modal = document.getElementById('executionsModal');
        if (modal) {
            const dateField = modal.querySelector('#executionDate');
            const tickerField = modal.querySelector('#executionTicker');
            
            report.modalState = {
                modalExists: !!modal,
                dateFieldExists: !!dateField,
                tickerFieldExists: !!tickerField,
                dateFieldValue: dateField ? dateField.value : null,
                tickerFieldValue: tickerField ? tickerField.value : null,
                tickerFieldOptions: tickerField ? Array.from(tickerField.options).map(opt => ({
                    value: opt.value,
                    text: opt.textContent,
                    selected: opt.selected
                })) : null
            };
            addTimeline('Modal state', report.modalState);
        }
        
    } catch (error) {
        report.errors.push(`Fatal error: ${error.message}`);
        console.error('❌ Fatal error in debug:', error);
    }
    
    report.endTime = new Date().toISOString();
    report.duration = new Date(report.endTime) - new Date(report.startTime);
    
    console.log('📊 ===== DEBUG REPORT =====');
    console.log(JSON.stringify(report, null, 2));
    console.log('📊 ===== END REPORT =====');
    
    return report;
};

console.log('✅ Debug script loaded. Run debugPopulateFormDates(executionId) in console to test.');

