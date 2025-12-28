/**
 * בדיקה מפורטת של עמוד מוקאפ - כל 5 השלבים
 * Detailed Mockup Page Testing - All 5 Stages
 * 
 * שלבים:
 * 1. בדיקת טעינה בדפדפן
 * 2. בדיקת קוד טעינה (runtime-validator)
 * 3. בדיקת ITCSS compliance
 * 4. בדיקת קונסולה נקייה
 * 5. בדיקת CRUD+E2E (אם רלוונטי)
 */

class MockupPageDetailedTester {
    constructor(pageName) {
        this.pageName = pageName;
        this.pageUrl = `/trading-ui/mockups/daily-snapshots/${pageName}`;
        this.results = {
            pageName: pageName,
            timestamp: new Date().toISOString(),
            stage1_browser_load: { status: 'pending', errors: [], warnings: [] },
            stage2_loading_code: { status: 'pending', errors: [], warnings: [], validatorResults: null },
            stage3_itcss: { status: 'pending', errors: [], warnings: [], complianceResults: null },
            stage4_console: { status: 'pending', errors: [], warnings: [], logs: [] },
            stage5_crud_e2e: { status: 'pending', errors: [], warnings: [], testResults: null }
        };
    }

    /**
     * שלב 1: בדיקת טעינה בדפדפן
     */
    async stage1_browserLoad() {
        console.log(`🔍 שלב 1: בדיקת טעינה - ${this.pageName}`);
        
        try {
            // בדוק שהדף נטען
            if (document.readyState === 'complete') {
                this.results.stage1_browser_load.status = 'success';
                this.results.stage1_browser_load.messages = ['דף נטען בהצלחה'];
                
                // בדוק שהמערכת המאוחדת נטענה (אם רלוונטי)
                if (typeof window.UnifiedAppInitializer !== 'undefined' || typeof window.unifiedAppInit !== 'undefined') {
                    this.results.stage1_browser_load.messages.push('מערכת אתחול מאוחדת נטענה');
                }
            } else {
                this.results.stage1_browser_load.status = 'warning';
                this.results.stage1_browser_load.warnings.push('דף עדיין בטעינה');
            }
        } catch (error) {
            this.results.stage1_browser_load.status = 'error';
            this.results.stage1_browser_load.errors.push(error.message);
        }
        
        return this.results.stage1_browser_load;
    }

    /**
     * שלב 2: בדיקת קוד טעינה (runtime-validator)
     */
    async stage2_loadingCode() {
        console.log(`🔍 שלב 2: בדיקת קוד טעינה - ${this.pageName}`);
        
        try {
            // בדוק אם RuntimeValidator זמין
            if (typeof window.RuntimeValidator === 'undefined') {
                // נסה לטעון את ה-validator
                await this.loadScript('/trading-ui/scripts/init-system/validators/runtime-validator.js');
            }
            
            if (typeof window.RuntimeValidator === 'undefined') {
                this.results.stage2_loading_code.status = 'warning';
                this.results.stage2_loading_code.warnings.push('RuntimeValidator לא זמין - דילוג על בדיקה זו');
                return this.results.stage2_loading_code;
            }
            
            // הרץ את הבדיקות
            const validator = new window.RuntimeValidator();
            const results = await validator.runChecks();
            
            this.results.stage2_loading_code.validatorResults = results;
            
            // בדוק שגיאות
            if (results.errors && results.errors.length > 0) {
                this.results.stage2_loading_code.status = 'error';
                this.results.stage2_loading_code.errors = results.errors;
            } else if (results.warnings && results.warnings.length > 0) {
                this.results.stage2_loading_code.status = 'warning';
                this.results.stage2_loading_code.warnings = results.warnings;
            } else {
                this.results.stage2_loading_code.status = 'success';
            }
        } catch (error) {
            this.results.stage2_loading_code.status = 'error';
            this.results.stage2_loading_code.errors.push(error.message);
        }
        
        return this.results.stage2_loading_code;
    }

    /**
     * שלב 3: בדיקת ITCSS compliance
     */
    async stage3_itcss() {
        console.log(`🔍 שלב 3: בדיקת ITCSS compliance - ${this.pageName}`);
        
        try {
            // בדוק אם css-management זמין
            if (typeof window.checkArchitectureCompliance === 'undefined') {
                await this.loadScript('/trading-ui/scripts/css_management.js');
            }
            
            if (typeof window.checkArchitectureCompliance === 'undefined') {
                this.results.stage3_itcss.status = 'warning';
                this.results.stage3_itcss.warnings.push('checkArchitectureCompliance לא זמין - דילוג על בדיקה זו');
                return this.results.stage3_itcss;
            }
            
            // הרץ בדיקת תאימות
            const results = window.checkArchitectureCompliance();
            
            this.results.stage3_itcss.complianceResults = results;
            
            // בדוק שגיאות
            if (results.errors && results.errors.length > 0) {
                this.results.stage3_itcss.status = 'error';
                this.results.stage3_itcss.errors = results.errors;
            } else if (results.warnings && results.warnings.length > 0) {
                this.results.stage3_itcss.status = 'warning';
                this.results.stage3_itcss.warnings = results.warnings;
            } else {
                this.results.stage3_itcss.status = 'success';
            }
        } catch (error) {
            this.results.stage3_itcss.status = 'error';
            this.results.stage3_itcss.errors.push(error.message);
        }
        
        return this.results.stage3_itcss;
    }

    /**
     * שלב 4: בדיקת קונסולה נקייה
     */
    async stage4_console() {
        console.log(`🔍 שלב 4: בדיקת קונסולה נקייה - ${this.pageName}`);
        
        try {
            // אסוף את כל הודעות הקונסולה שנאספו
            const consoleMessages = window._consoleMessages || [];
            
            // קטגוריות
            const errors = consoleMessages.filter(m => m.level === 'error');
            const warnings = consoleMessages.filter(m => m.level === 'warn');
            const logs = consoleMessages.filter(m => m.level === 'log' || m.level === 'info');
            
            this.results.stage4_console.errors = errors.map(m => m.message);
            this.results.stage4_console.warnings = warnings.map(m => m.message);
            this.results.stage4_console.logs = logs.map(m => m.message);
            
            // קבע סטטוס
            if (errors.length > 0) {
                this.results.stage4_console.status = 'error';
            } else if (warnings.length > 0) {
                this.results.stage4_console.status = 'warning';
            } else {
                this.results.stage4_console.status = 'success';
            }
        } catch (error) {
            this.results.stage4_console.status = 'error';
            this.results.stage4_console.errors.push(error.message);
        }
        
        return this.results.stage4_console;
    }

    /**
     * שלב 5: בדיקת CRUD+E2E (אם רלוונטי)
     */
    async stage5_crudE2E() {
        console.log(`🔍 שלב 5: בדיקת CRUD+E2E - ${this.pageName}`);
        
        try {
            // עמודי מוקאפ הם בעיקר עמודי צפייה - בדיקה בסיסית
            this.results.stage5_crud_e2e.status = 'skipped';
            this.results.stage5_crud_e2e.messages = ['עמודי מוקאפ הם עמודי צפייה - אין פעולות CRUD'];
        } catch (error) {
            this.results.stage5_crud_e2e.status = 'error';
            this.results.stage5_crud_e2e.errors.push(error.message);
        }
        
        return this.results.stage5_crud_e2e;
    }

    /**
     * הרצת כל הבדיקות
     */
    async runAllTests() {
        console.log(`\n🚀 התחלת בדיקות מפורטות: ${this.pageName}\n`);
        
        await this.stage1_browserLoad();
        await this.stage2_loadingCode();
        await this.stage3_itcss();
        await this.stage4_console();
        await this.stage5_crudE2E();
        
        // סטטוס כללי
        const allStages = [
            this.results.stage1_browser_load,
            this.results.stage2_loading_code,
            this.results.stage3_itcss,
            this.results.stage4_console,
            this.results.stage5_crud_e2e
        ];
        
        const hasErrors = allStages.some(s => s.status === 'error');
        const hasWarnings = allStages.some(s => s.status === 'warning');
        
        this.results.overallStatus = hasErrors ? 'error' : (hasWarnings ? 'warning' : 'success');
        
        console.log(`\n✅ סיום בדיקות: ${this.pageName}`);
        console.log(`📊 סטטוס כללי: ${this.results.overallStatus}`);
        
        return this.results;
    }

    /**
     * עזר: טעינת סקריפט
     */
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * הצגת תוצאות
     */
    getReport() {
        return {
            pageName: this.pageName,
            overallStatus: this.results.overallStatus,
            timestamp: this.results.timestamp,
            stages: {
                stage1: this.results.stage1_browser_load,
                stage2: this.results.stage2_loading_code,
                stage3: this.results.stage3_itcss,
                stage4: this.results.stage4_console,
                stage5: this.results.stage5_crud_e2e
            }
        };
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.MockupPageDetailedTester = MockupPageDetailedTester;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockupPageDetailedTester;
}

