/**
 * Models Test JavaScript - Simple Interface
 * 
 * This script provides a simple interface for testing external data integration
 * models without complex validation logic.
 * 
 * User System: Single user system (user_id = 1 always)
 * - No user authentication required
 * - All preferences are assigned to user 1
 * - Future: Can be extended to multi-user system
 * 
 * Author: TikTrack Development Team
 * Created: January 2025
 * Version: 2.1 - Single User System
 */

class SimpleModelsTester extends BaseTester {
    constructor() {
        super();
        console.log('🔧 SimpleModelsTester initialized');
        this.initializeEventListeners();
        this.addInitialMessage();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        // Preferences model test
        const testPreferencesBtn = document.getElementById('test-preferences-model');
        if (testPreferencesBtn) {
            testPreferencesBtn.addEventListener('click', () => {
                this.testPreferencesModel();
            });
            console.log('✅ Preferences button listener added');
        }

        // Quote model test
        const testQuoteBtn = document.getElementById('test-quote-model');
        if (testQuoteBtn) {
            testQuoteBtn.addEventListener('click', () => {
                this.testQuoteModel();
            });
            console.log('✅ Quote button listener added');
        }

        // Ticker model test
        const testTickerBtn = document.getElementById('test-ticker-model');
        if (testTickerBtn) {
            testTickerBtn.addEventListener('click', () => {
                this.testTickerModel();
            });
            console.log('✅ Ticker button listener added');
        }

        // Validation tests
        const testDataValidationBtn = document.getElementById('test-data-validation');
        if (testDataValidationBtn) {
            testDataValidationBtn.addEventListener('click', () => {
                this.testDataValidation();
            });
            console.log('✅ Data validation button listener added');
        }

        const testStructureValidationBtn = document.getElementById('test-structure-validation');
        if (testStructureValidationBtn) {
            testStructureValidationBtn.addEventListener('click', () => {
                this.testStructureValidation();
            });
            console.log('✅ Structure validation button listener added');
        }
    }

    /**
     * Add initial message
     */
    addInitialMessage() {
        setTimeout(() => {
            this.addResult('System', 'info', 'ממשק בדיקת מודלים מוכן לשימוש');
            this.addResult('System', 'info', 'מערכת חד-משתמשית: כל ההעדפות יוקצו למשתמש 1');
        }, 500);
    }



    /**
     * Test Preferences Model - Simple version
     */
    testPreferencesModel() {
        console.log('🧪 Testing preferences model...');
        
        const preferencesDataElement = document.getElementById('preferences-data');
        if (!preferencesDataElement) {
            this.addResult('Preferences Model', 'error', 'אלמנט preferences-data לא נמצא');
            return;
        }

        const dataText = preferencesDataElement.value.trim();
        if (!dataText) {
            this.addResult('Preferences Model', 'error', 'אין נתונים לבדיקה');
            return;
        }

        try {
            const data = JSON.parse(dataText);
            
            // Ensure user_id is always 1 for now (single user system)
            const preferencesWithUser = {
                ...data,
                user_id: 1,
                created_at: data.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            this.addResult('Preferences Model', 'success', 
                `העדפות נוצרו בהצלחה עבור משתמש 1 (מערכת חד-משתמשית)`, 
                preferencesWithUser
            );
        } catch (error) {
            this.addResult('Preferences Model', 'error', `שגיאה בניתוח JSON: ${error.message}`);
        }
    }

    /**
     * Test Quote Model - Simple version
     */
    testQuoteModel() {
        console.log('🧪 Testing quote model...');
        
        const quoteDataElement = document.getElementById('quote-data');
        if (!quoteDataElement) {
            this.addResult('Quote Model', 'error', 'אלמנט quote-data לא נמצא');
            return;
        }

        const dataText = quoteDataElement.value.trim();
        if (!dataText) {
            this.addResult('Quote Model', 'error', 'אין נתונים לבדיקה');
            return;
        }

        try {
            const data = JSON.parse(dataText);
            this.addResult('Quote Model', 'success', 
                `מחיר נוצר בהצלחה עבור ${data.symbol || 'לא ידוע'}`, 
                data
            );
        } catch (error) {
            this.addResult('Quote Model', 'error', `שגיאה בניתוח JSON: ${error.message}`);
        }
    }

    /**
     * Test Ticker Model - Simple version
     */
    testTickerModel() {
        console.log('🧪 Testing ticker model...');
        
        const tickerDataElement = document.getElementById('ticker-data');
        if (!tickerDataElement) {
            this.addResult('Ticker Model', 'error', 'אלמנט ticker-data לא נמצא');
            return;
        }

        const dataText = tickerDataElement.value.trim();
        if (!dataText) {
            this.addResult('Ticker Model', 'error', 'אין נתונים לבדיקה');
            return;
        }

        try {
            const data = JSON.parse(dataText);
            this.addResult('Ticker Model', 'success', 
                `טיקר נוצר בהצלחה: ${data.symbol || 'לא ידוע'} - ${data.name || 'ללא שם'}`, 
                data
            );
        } catch (error) {
            this.addResult('Ticker Model', 'error', `שגיאה בניתוח JSON: ${error.message}`);
        }
    }

    /**
     * Test Data Validation - Simple version
     */
    testDataValidation() {
        console.log('🧪 Testing data validation...');
        
        const elements = [
            { id: 'preferences-data', name: 'העדפות' },
            { id: 'quote-data', name: 'מחיר' },
            { id: 'ticker-data', name: 'טיקר' }
        ];

        let validCount = 0;
        let totalCount = 0;

        elements.forEach(element => {
            const el = document.getElementById(element.id);
            if (el && el.value.trim()) {
                totalCount++;
                try {
                    JSON.parse(el.value.trim());
                    validCount++;
                    this.addResult('Data Validation', 'success', `נתוני ${element.name} תקינים`);
                } catch (error) {
                    this.addResult('Data Validation', 'error', `שגיאה בנתוני ${element.name}: ${error.message}`);
                }
            }
        });

        if (totalCount === 0) {
            this.addResult('Data Validation', 'warning', 'אין נתונים לבדיקה');
        } else {
            this.addResult('Data Validation', 'info', `בדיקה הושלמה: ${validCount}/${totalCount} תקינים`);
        }
    }

    /**
     * Test Structure Validation - Simple version
     */
    testStructureValidation() {
        console.log('🧪 Testing structure validation...');
        
        const structures = [
            { 
                id: 'preferences-data', 
                name: 'העדפות', 
                required: ['timezone'] // user_id will be auto-assigned as 1
            },
            { 
                id: 'quote-data', 
                name: 'מחיר', 
                required: ['symbol', 'price'] 
            },
            { 
                id: 'ticker-data', 
                name: 'טיקר', 
                required: ['symbol', 'name'] 
            }
        ];

        structures.forEach(structure => {
            const el = document.getElementById(structure.id);
            if (el && el.value.trim()) {
                try {
                    const data = JSON.parse(el.value.trim());
                    const missing = structure.required.filter(field => !data.hasOwnProperty(field));
                    
                    if (missing.length === 0) {
                        this.addResult('Structure Validation', 'success', `מבנה ${structure.name} תקין`);
                    } else {
                        this.addResult('Structure Validation', 'error', 
                            `שדות חסרים ב${structure.name}: ${missing.join(', ')}`);
                    }
                } catch (error) {
                    this.addResult('Structure Validation', 'error', 
                        `שגיאה במבנה ${structure.name}: ${error.message}`);
                }
            }
        });
    }

    /**
     * Add result to display
     */
    addResult(model, status, message, data = null) {
        console.log('📝 Adding result:', { model, status, message });
        
        const result = {
            timestamp: new Date().toLocaleTimeString('he-IL'),
            model: model,
            status: status,
            message: message,
            data: data
        };
        
        this.displayResult(result);
    }

    /**
     * Display result in the UI
     */
    displayResult(result) {
        const resultsContainer = document.getElementById('model-test-logs');
        if (!resultsContainer) {
            console.error('❌ Results container not found');
            return;
        }

        const resultElement = document.createElement('div');
        resultElement.className = `alert alert-${this.getStatusClass(result.status)} mb-2 fade-in`;
        
        let content = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong>${result.model}</strong> - ${result.message}
                    <br><small class="text-muted">${result.timestamp}</small>
                </div>
                <span class="badge bg-${this.getStatusClass(result.status)}">
                    ${this.getStatusText(result.status)}
                </span>
            </div>
        `;
        
        if (result.data) {
            content += `
                <details class="mt-2">
                    <summary>פרטי הנתונים</summary>
                    <pre class="mt-2 bg-light p-2 rounded"><code>${JSON.stringify(result.data, null, 2)}</code></pre>
                </details>
            `;
        }
        
        resultElement.innerHTML = content;
        resultsContainer.appendChild(resultElement);
        
        // Scroll to bottom
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
        
        console.log('✅ Result displayed');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing SimpleModelsTester');
    window.modelsTester = new SimpleModelsTester();
    console.log('✅ SimpleModelsTester initialized');
});



// Update labels when textareas change
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all textarea edit functionality
    initializeAllTextareaEdits();
});
