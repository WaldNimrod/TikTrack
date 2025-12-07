/**
 * AI Analysis - Field Values Validation Script
 * 
 * בדיקת ערכים מדויקים בשדות מודול AI Analysis
 * 
 * הרצה: debugAIAnalysisFields() בקונסולה
 */

(function() {
    'use strict';
    
    // Only load on ai-analysis page
    const isAIAnalysisPage = window.location.pathname.includes('ai-analysis');
    
    if (!isAIAnalysisPage) {
        // Not on AI Analysis page, skip initialization
        return;
    }
    
    // Standard Investment Types from system
    const STANDARD_INVESTMENT_TYPES = [
        { value: 'swing', label: 'סווינג' },
        { value: 'investment', label: 'השקעה' },
        { value: 'passive', label: 'פאסיבי' }
    ];
    
    /**
     * Debug and validate all fields in AI Analysis modal
     */
    window.debugAIAnalysisFields = function() {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('   🔍 בדיקת ערכים מדויקים - AI Analysis Modal');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        
        const modal = document.getElementById('aiVariablesModal');
        if (!modal) {
            console.log('❌ מודול AI Analysis לא פתוח!');
            console.log('   פתח את המודול קודם על ידי בחירת תבנית.');
            return;
        }
        
        const results = {
            ticker: checkTickerField(),
            tradingAccount: checkTradingAccountField(),
            investmentType: checkInvestmentTypeField(),
            tradingMethods: checkTradingMethodsField(),
            dateRange: checkDateRangeField(),
            allFields: getAllFieldsInfo()
        };
        
        // Summary
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('   📊 סיכום תוצאות');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        console.log('✅ Ticker:', results.ticker.isValid ? 'תקין' : '❌ בעיות', `(${results.ticker.optionsCount} אופציות)`);
        console.log('✅ Trading Account:', results.tradingAccount.isValid ? 'תקין' : '❌ בעיות', `(${results.tradingAccount.optionsCount} אופציות)`);
        console.log('✅ Investment Type:', results.investmentType.isValid ? 'תקין' : '❌ בעיות');
        console.log('✅ Trading Methods:', results.tradingMethods.isValid ? 'תקין' : '❌ בעיות', `(${results.tradingMethods.optionsCount} אופציות)`);
        console.log('');
        
        if (!results.tradingAccount.isValid) {
            console.log('❌ בעיות ב-Trading Account:');
            results.tradingAccount.issues.forEach(issue => console.log('   -', issue));
        }
        if (!results.ticker.isValid) {
            console.log('❌ בעיות ב-Ticker:');
            results.ticker.issues.forEach(issue => console.log('   -', issue));
        }
        
        console.log('');
        console.log('📋 כל השדות:');
        results.allFields.forEach(field => {
            console.log(`   • ${field.label}: ${field.type} - ${field.optionsCount} אופציות${field.hasDefault ? ` (ברירת מחדל: ${field.defaultValue})` : ''}`);
        });
        
        return results;
    };
    
    /**
     * Check Ticker field
     */
    function checkTickerField() {
        const select = document.querySelector('#aiVariablesModal select[id*="ticker"]');
        const issues = [];
        
        if (!select) {
            return { isValid: false, issues: ['שדה טיקר לא נמצא'], optionsCount: 0 };
        }
        
        const optionsCount = select.options.length;
        if (optionsCount === 0) {
            issues.push('אין אופציות בטיקר');
        } else if (optionsCount === 1 && select.options[0].value === '') {
            issues.push('רק אופציה ריקה - לא נטענו טיקרים');
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            optionsCount,
            values: Array.from(select.options).map(opt => ({ value: opt.value, text: opt.text }))
        };
    }
    
    /**
     * Check Trading Account field
     */
    function checkTradingAccountField() {
        const select = document.querySelector('#aiVariablesModal select[id*="trading_account"], #aiVariablesModal select[id*="account"]');
        const issues = [];
        
        if (!select) {
            return { isValid: false, issues: ['שדה חשבון מסחר לא נמצא'], optionsCount: 0 };
        }
        
        const optionsCount = select.options.length;
        if (optionsCount === 0) {
            issues.push('אין אופציות בחשבון מסחר');
        } else if (optionsCount === 1 && select.options[0].value === '') {
            issues.push('רק אופציה ריקה - לא נטענו חשבונות');
        }
        
        // Check if default is selected
        const hasDefault = select.value && select.value !== '';
        
        return {
            isValid: issues.length === 0 && optionsCount > 1,
            issues,
            optionsCount,
            hasDefault,
            defaultValue: select.value,
            values: Array.from(select.options).map(opt => ({ value: opt.value, text: opt.text }))
        };
    }
    
    /**
     * Check Investment Type field
     */
    function checkInvestmentTypeField() {
        const select = document.querySelector('#aiVariablesModal select[id*="investment_type"]');
        if (!select) {
            return { isValid: true, note: 'שדה Investment Type לא קיים בתבנית זו' };
        }
        
        const options = Array.from(select.options).map(opt => opt.value);
        const standardValues = STANDARD_INVESTMENT_TYPES.map(t => t.value);
        const issues = [];
        
        standardValues.forEach(stdVal => {
            if (!options.includes(stdVal)) {
                issues.push(`חסר ${stdVal}`);
            }
        });
        
        return {
            isValid: issues.length === 0,
            issues,
            optionsCount: select.options.length,
            values: options
        };
    }
    
    /**
     * Check Trading Methods field
     */
    function checkTradingMethodsField() {
        const select = document.querySelector('#aiVariablesModal select[id*="technical"], #aiVariablesModal select[id*="condition"]');
        if (!select) {
            return { isValid: true, note: 'שדה Trading Methods לא קיים בתבנית זו' };
        }
        
        const optionsCount = select.options.length;
        const issues = [];
        
        if (optionsCount === 0) {
            issues.push('אין אופציות בשיטות מסחר');
        } else if (optionsCount === 1 && select.options[0].value === '') {
            issues.push('רק אופציה ריקה - לא נטענו שיטות מסחר');
        } else if (optionsCount < 6) {
            issues.push(`פחות מ-6 אופציות (צפוי 6, נמצא ${optionsCount})`);
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            optionsCount,
            values: Array.from(select.options).map(opt => ({ value: opt.value, text: opt.text }))
        };
    }
    
    /**
     * Check Date Range field
     */
    function checkDateRangeField() {
        const input = document.querySelector('#aiVariablesModal input[id*="date"]');
        if (!input) {
            return { isValid: true, note: 'שדה Date Range לא קיים בתבנית זו' };
        }
        
        return {
            isValid: true,
            type: input.type,
            value: input.value,
            placeholder: input.placeholder
        };
    }
    
    /**
     * Get all fields info
     */
    function getAllFieldsInfo() {
        const modal = document.getElementById('aiVariablesModal');
        if (!modal) return [];
        
        const fields = [];
        const inputs = modal.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const label = modal.querySelector(`label[for="${input.id}"]`);
            const labelText = label ? label.textContent.trim() : input.id;
            
            let optionsCount = 0;
            if (input.tagName === 'SELECT') {
                optionsCount = input.options.length;
            }
            
            fields.push({
                id: input.id,
                label: labelText,
                type: input.type || input.tagName.toLowerCase(),
                optionsCount,
                value: input.value,
                hasDefault: input.value && input.value !== '',
                defaultValue: input.value || null
            });
        });
        
        return fields;
    }
    
    console.log('✅ AI Analysis Field Validation Script loaded');
    console.log('   הרץ: debugAIAnalysisFields() בקונסולה');
    
})();


