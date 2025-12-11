/**
 * Portfolio State Page - Field Values Validation Script
 * 
 * בדיקת ערכים מדויקים בשדות כל התהליכים
 * 
 * הרצה: debugPortfolioFields() בקונסולה
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - checkDateRangeOptions() - Checkdaterangeoptions

// === Utility Functions ===
// - checkTradingAccounts() - Checktradingaccounts
// - checkInvestmentTypes() - Checkinvestmenttypes

// === Other ===
// - compareWithHeaderSystem() - Comparewithheadersystem

(function() {
    'use strict';
    
    // Only load on portfolio-state-page
    const isPortfolioStatePage = window.location.pathname.includes('portfolio-state-page') || 
                                  window.location.pathname.includes('daily-snapshots');
    
    if (!isPortfolioStatePage) {
        // Not on portfolio state page, skip initialization
        return;
    }
    
    // Entity Labels for translation
    const ENTITY_LABELS = {
        ticker: 'טיקר',
        trade: 'טרייד',
        trade_plan: 'תכנון',
        execution: 'ביצוע',
        trading_account: 'חשבון מסחר',
        account: 'חשבון מסחר',
        alert: 'התראה',
        cash_flow: 'תזרים מזומנים',
        note: 'הערה'
    };
    
    // Standard Investment Types from system
    const STANDARD_INVESTMENT_TYPES = [
        { value: 'swing', label: 'סווינג' },
        { value: 'investment', label: 'השקעה' },
        { value: 'passive', label: 'פאסיבי' }
    ];
    
    // Standard Date Range Options from header-system
    const STANDARD_DATE_RANGE_OPTIONS = [
        'כל זמן',
        'היום',
        'אתמול',
        'השבוע',
        'שבוע',
        'שבוע קודם',
        'החודש',
        'חודש',
        'חודש קודם',
        'השנה',
        'שנה',
        'שנה קודמת',
        'מותאם אישית'
    ];
    
    /**
     * Debug and validate all fields in portfolio state page
     */
    window.debugPortfolioFields = function() {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('   🔍 בדיקת ערכים מדויקים - Portfolio State Page');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        
        const results = {
            dateRange: checkDateRangeOptions(),
            tradingAccounts: checkTradingAccounts(),
            investmentTypes: checkInvestmentTypes(),
            comparisons: compareWithHeaderSystem()
        };
        
        // Summary
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('   📊 סיכום תוצאות');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        console.log('✅ Date Range:', results.dateRange.isValid ? 'תקין' : '❌ בעיות');
        console.log('✅ Trading Accounts:', results.tradingAccounts.isValid ? 'תקין' : '❌ בעיות');
        console.log('✅ Investment Types:', results.investmentTypes.isValid ? 'תקין' : '❌ בעיות');
        console.log('');
        
        if (!results.dateRange.isValid) {
            console.log('❌ בעיות ב-Date Range:');
            results.dateRange.issues.forEach(issue => console.log('   -', issue));
        }
        if (!results.tradingAccounts.isValid) {
            console.log('❌ בעיות ב-Trading Accounts:');
            results.tradingAccounts.issues.forEach(issue => console.log('   -', issue));
        }
        if (!results.investmentTypes.isValid) {
            console.log('❌ בעיות ב-Investment Types:');
            results.investmentTypes.issues.forEach(issue => console.log('   -', issue));
        }
        
        return results;
    };
    
    /**
     * Check Date Range options
     */
    function checkDateRangeOptions() {
        console.log('1️⃣ בודק Date Range Options...');
        
        const menu = document.getElementById('dateRangeFilterMenu');
        const issues = [];
        
        if (!menu) {
            issues.push('תפריט Date Range לא נמצא');
            return { isValid: false, issues, found: [], expected: STANDARD_DATE_RANGE_OPTIONS };
        }
        
        const items = menu.querySelectorAll('.date-range-filter-item');
        const foundOptions = Array.from(items).map(item => {
            const value = item.getAttribute('data-value');
            const text = item.querySelector('.option-text')?.textContent?.trim() || '';
            return { value, text, element: item };
        });
        
        console.log(`   נמצאו ${foundOptions.length} אופציות`);
        foundOptions.forEach(opt => {
            console.log(`   - "${opt.value}" (${opt.text})`);
        });
        
        // Check if all standard options exist
        const missingOptions = STANDARD_DATE_RANGE_OPTIONS.filter(opt => 
            !foundOptions.find(f => f.value === opt)
        );
        
        if (missingOptions.length > 0) {
            issues.push(`חסרות ${missingOptions.length} אופציות: ${missingOptions.join(', ')}`);
        }
        
        // Check for extra options
        const extraOptions = foundOptions.filter(opt => 
            !STANDARD_DATE_RANGE_OPTIONS.includes(opt.value)
        );
        
        if (extraOptions.length > 0) {
            issues.push(`יש ${extraOptions.length} אופציות נוספות שלא אמורות להיות: ${extraOptions.map(o => o.value).join(', ')}`);
        }
        
        // Check visibility
        const isVisible = menu.classList.contains('show') || 
                         getComputedStyle(menu).display !== 'none';
        if (!isVisible) {
            console.log('   ℹ️ התפריט מוסתר (זה תקין - הוא נפתח בלחיצה)');
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            found: foundOptions.map(o => o.value),
            expected: STANDARD_DATE_RANGE_OPTIONS
        };
    }
    
    /**
     * Check Trading Accounts
     */
    function checkTradingAccounts() {
        console.log('');
        console.log('2️⃣ בודק Trading Accounts...');
        
        const menu = document.getElementById('accountFilterMenu');
        const issues = [];
        
        if (!menu) {
            issues.push('תפריט Trading Account לא נמצא');
            return { isValid: false, issues, found: [], loaded: 0 };
        }
        
        const items = menu.querySelectorAll('.account-filter-item');
        const foundAccounts = Array.from(items)
            .filter(item => item.getAttribute('data-value') !== 'הכול')
            .map(item => {
                const value = item.getAttribute('data-value');
                const text = item.querySelector('.option-text')?.textContent?.trim() || '';
                return { value, text, element: item };
            });
        
        console.log(`   נמצאו ${foundAccounts.length} חשבונות בתפריט`);
        foundAccounts.forEach(acc => {
            console.log(`   - ID: ${acc.value}, שם: ${acc.text}`);
        });
        
        // Check if window.portfolioStatePage.allTradingAccounts exists
        if (window.portfolioStatePage && window.portfolioStatePage.allTradingAccounts !== undefined) {
            const loadedAccounts = window.portfolioStatePage.allTradingAccounts || [];
            console.log(`   נטענו ${loadedAccounts.length} חשבונות ב-allTradingAccounts`);
            
            if (loadedAccounts.length === 0) {
                issues.push('לא נטענו חשבונות (allTradingAccounts ריק)');
            } else {
                loadedAccounts.forEach(acc => {
                    console.log(`   - ID: ${acc.id}, שם: ${acc.name}`);
                });
            }
            
            // Compare
            if (loadedAccounts.length !== foundAccounts.length) {
                issues.push(`חוסר התאמה: ${loadedAccounts.length} נטענו אבל ${foundAccounts.length} בתפריט`);
            }
        } else {
            issues.push('allTradingAccounts לא קיים ב-window.portfolioStatePage');
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            found: foundAccounts.map(a => ({ id: a.value, name: a.text })),
            loaded: window.portfolioStatePage?.allTradingAccounts?.length || 0
        };
    }
    
    /**
     * Check Investment Types
     */
    function checkInvestmentTypes() {
        console.log('');
        console.log('3️⃣ בודק Investment Types...');
        
        const select = document.getElementById('filterInvestmentType');
        const issues = [];
        
        if (!select) {
            issues.push('Select Investment Type לא נמצא');
            return { isValid: false, issues, found: [], expected: STANDARD_INVESTMENT_TYPES };
        }
        
        const options = Array.from(select.options).map(opt => ({
            value: opt.value,
            text: opt.textContent.trim(),
            element: opt
        }));
        
        console.log(`   נמצאו ${options.length} אופציות`);
        options.forEach(opt => {
            console.log(`   - "${opt.value}" (${opt.text})`);
        });
        
        // Check against standard
        const standardValues = STANDARD_INVESTMENT_TYPES.map(t => t.value);
        const foundValues = options.filter(o => o.value).map(o => o.value);
        
        const missingValues = standardValues.filter(v => !foundValues.includes(v));
        if (missingValues.length > 0) {
            issues.push(`חסרים ${missingValues.length} סוגי השקעה: ${missingValues.join(', ')}`);
        }
        
        const extraValues = foundValues.filter(v => !standardValues.includes(v) && v !== '');
        if (extraValues.length > 0) {
            issues.push(`יש ${extraValues.length} סוגי השקעה נוספים שלא אמורים להיות: ${extraValues.join(', ')}`);
        }
        
        // Check labels match
        STANDARD_INVESTMENT_TYPES.forEach(std => {
            const found = options.find(o => o.value === std.value);
            if (found && found.text !== std.label) {
                issues.push(`תווית לא תואמת עבור "${std.value}": צפוי "${std.label}", נמצא "${found.text}"`);
            }
        });
        
        return {
            isValid: issues.length === 0,
            issues,
            found: options,
            expected: STANDARD_INVESTMENT_TYPES
        };
    }
    
    /**
     * Compare with header system
     */
    function compareWithHeaderSystem() {
        console.log('');
        console.log('4️⃣ השוואה עם Header System...');
        
        const headerDateMenu = document.querySelector('#unified-header #dateRangeFilterMenu');
        const headerAccountMenu = document.querySelector('#unified-header #accountFilterMenu');
        const headerTypeMenu = document.querySelector('#unified-header #typeFilterMenu');
        
        const comparisons = {
            dateRange: { same: false, headerOptions: [], pageOptions: [] },
            tradingAccounts: { same: false, headerCount: 0, pageCount: 0 },
            investmentTypes: { same: false, headerOptions: [], pageOptions: [] }
        };
        
        // Compare Date Range
        if (headerDateMenu) {
            const headerDateOptions = Array.from(headerDateMenu.querySelectorAll('.date-range-filter-item'))
                .map(item => item.getAttribute('data-value'))
                .filter(v => v);
            
            const pageDateOptions = Array.from(document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item'))
                .map(item => item.getAttribute('data-value'))
                .filter(v => v);
            
            comparisons.dateRange.headerOptions = headerDateOptions;
            comparisons.dateRange.pageOptions = pageDateOptions;
            comparisons.dateRange.same = JSON.stringify(headerDateOptions.sort()) === JSON.stringify(pageDateOptions.sort());
            
            console.log(`   Date Range: Header (${headerDateOptions.length}) vs Page (${pageDateOptions.length})`);
            if (!comparisons.dateRange.same) {
                console.log('   ❌ לא תואמים!');
                const diff = headerDateOptions.filter(o => !pageDateOptions.includes(o));
                if (diff.length > 0) {
                    console.log(`   חסרים בעמוד: ${diff.join(', ')}`);
                }
                const extra = pageDateOptions.filter(o => !headerDateOptions.includes(o));
                if (extra.length > 0) {
                    console.log(`   נוספים בעמוד: ${extra.join(', ')}`);
                }
            } else {
                console.log('   ✅ תואמים');
            }
        }
        
        // Compare Trading Accounts count
        if (headerAccountMenu) {
            const headerAccountCount = headerAccountMenu.querySelectorAll('.account-filter-item:not([data-value="הכול"])').length;
            const pageAccountCount = document.querySelectorAll('#accountFilterMenu .account-filter-item:not([data-value="הכול"])').length;
            
            comparisons.tradingAccounts.headerCount = headerAccountCount;
            comparisons.tradingAccounts.pageCount = pageAccountCount;
            comparisons.tradingAccounts.same = headerAccountCount === pageAccountCount;
            
            console.log(`   Trading Accounts: Header (${headerAccountCount}) vs Page (${pageAccountCount})`);
            if (!comparisons.tradingAccounts.same) {
                console.log('   ❌ לא תואמים!');
            } else {
                console.log('   ✅ תואמים');
            }
        }
        
        // Compare Investment Types
        if (headerTypeMenu) {
            const headerTypeOptions = Array.from(headerTypeMenu.querySelectorAll('.type-filter-item'))
                .map(item => {
                    const value = item.getAttribute('data-value');
                    const text = item.querySelector('.option-text')?.textContent?.trim() || '';
                    return { value, text };
                })
                .filter(o => o.value !== 'הכול');
            
            const pageTypeOptions = Array.from(document.querySelectorAll('#filterInvestmentType option'))
                .map(opt => ({
                    value: opt.value,
                    text: opt.textContent.trim()
                }))
                .filter(o => o.value);
            
            comparisons.investmentTypes.headerOptions = headerTypeOptions;
            comparisons.investmentTypes.pageOptions = pageTypeOptions;
            
            const headerValues = headerTypeOptions.map(o => o.value).sort();
            const pageValues = pageTypeOptions.map(o => o.value).sort();
            comparisons.investmentTypes.same = JSON.stringify(headerValues) === JSON.stringify(pageValues);
            
            console.log(`   Investment Types: Header (${headerTypeOptions.length}) vs Page (${pageTypeOptions.length})`);
            if (!comparisons.investmentTypes.same) {
                console.log('   ❌ לא תואמים!');
                console.log(`   Header: ${headerValues.join(', ')}`);
                console.log(`   Page: ${pageValues.join(', ')}`);
            } else {
                console.log('   ✅ תואמים');
            }
        }
        
        return comparisons;
    }
    
    // Auto-run if page is portfolio-state-page
    if (document.body && document.body.classList.contains('portfolio-state-page')) {
        // Wait for page to load
        if (document.readyState === 'complete') {
            setTimeout(() => {
                console.log('🚀 Auto-running field validation in 2 seconds...');
                setTimeout(() => window.debugPortfolioFields(), 2000);
            }, 100);
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    console.log('🚀 Auto-running field validation in 2 seconds...');
                    setTimeout(() => window.debugPortfolioFields(), 2000);
                }, 100);
            });
        }
    }
    
    console.log('✅ Portfolio State Page Field Validation Script loaded');
    console.log('   הרץ: debugPortfolioFields() בקונסולה');
    
    // Make sure function is available immediately (not just after DOM load)
    if (typeof window !== 'undefined') {
        // Function is already defined above via window.debugPortfolioFields
        window.Logger?.info?.('✅ Portfolio State Page Field Validation script loaded', { page: 'portfolio-state-page-field-validation' });
    }
})();
