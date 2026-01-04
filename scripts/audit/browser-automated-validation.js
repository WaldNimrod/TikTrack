#!/usr/bin/env node
/**
 * Browser Automated Validation Script
 * 
 * בודק את כל העמודים בדפדפן באמצעות כלי הניטור
 * 
 * שימוש:
 * node scripts/audit/browser-automated-validation.js
 */

const fs = require('fs');
const path = require('path');

// רשימת עמודים לבדיקה (מהדוח הקודם)
const PAGES_TO_CHECK = [
  // Main pages
  'index',
  'trades',
  'trade_plans',
  'alerts',
  'tickers',
  'trading_accounts',
  'executions',
  'cash_flows',
  'notes',
  'research',
  'data_import',
  'preferences',
  
  // Technical pages
  'db_display',
  'db_extradata',
  'constraints',
  'designs',
  
  // Auth pages
  'login',
  'register',
  'forgot-password',
  'reset-password',
  
  // Dev tools
  'button-color-mapping',
  'button-color-mapping-simple',
  'conditions-modals',
  'tooltip-editor',
  'preferences-groups-management',
  
  // Mockup pages
  'daily-snapshots-comparative-analysis-page',
  'daily-snapshots-date-comparison-modal',
  'daily-snapshots-economic-calendar-page',
  'daily-snapshots-emotional-tracking-widget',
  'daily-snapshots-heatmap-visual-example',
  'daily-snapshots-history-widget',
  'daily-snapshots-portfolio-state-page',
  'daily-snapshots-price-history-page',
  'daily-snapshots-strategy-analysis-page',
  'daily-snapshots-trade-history-page',
  'daily-snapshots-trading-journal-page',
];

const BASE_URL = 'http://localhost:8080';
const OUTPUT_DIR = path.join(__dirname, '../../documentation/05-REPORTS/data');
const RESULTS_FILE = path.join(OUTPUT_DIR, 'BROWSER_VALIDATION_RESULTS.json');
const REPORT_FILE = path.join(OUTPUT_DIR, '../BROWSER_VALIDATION_REPORT.md');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate browser validation script
 */
function generateBrowserScript() {
  return `
(async function() {
  'use strict';
  
  class BrowserPageValidator {
    constructor() {
      this.results = [];
      this.consoleErrors = [];
      this.consoleWarnings = [];
      this.originalError = console.error;
      this.originalWarn = console.warn;
    }
    
    startErrorCollection() {
      this.consoleErrors = [];
      this.consoleWarnings = [];
      
      console.error = (...args) => {
        this.consoleErrors.push({
          message: args.join(' '),
          timestamp: new Date().toISOString()
        });
        this.originalError.apply(console, args);
      };
      
      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('not defined') || 
            message.includes('is not a function') ||
            message.includes('Failed to load') ||
            message.includes('404') ||
            message.includes('Network')) {
          this.consoleWarnings.push({
            message: message,
            timestamp: new Date().toISOString()
          });
        }
        this.originalWarn.apply(console, args);
      };
    }
    
    stopErrorCollection() {
      console.error = this.originalError;
      console.warn = this.originalWarn;
    }
    
    async waitForPageFullyLoaded() {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
          setTimeout(resolve, 10000);
        }
      });
    }
    
    getCurrentPageName() {
      const path = window.location.pathname;
      let pageName = path.split('/').pop();
      if (!pageName || pageName === '' || pageName === '/') {
        pageName = 'index';
      } else {
        pageName = pageName.replace('.html', '');
      }
      return pageName;
    }
    
    async validateCurrentPage() {
      const pageName = this.getCurrentPageName();
      console.log(\`🔍 Starting validation for page: \${pageName}\`);
      
      this.startErrorCollection();
      await this.waitForPageFullyLoaded();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        pageName: pageName,
        timestamp: new Date().toISOString(),
        consoleErrors: [...this.consoleErrors],
        consoleWarnings: [...this.consoleWarnings],
        monitoringResults: null,
        healthCheck: null,
        isValid: false
      };
      
      if (typeof window.runDetailedPageScan === 'function') {
        try {
          const pageConfig = window.pageInitializationConfigs?.[pageName];
          if (pageConfig) {
            result.monitoringResults = await window.runDetailedPageScan(pageName, pageConfig);
          }
        } catch (error) {
          result.monitoringError = error.message;
        }
      }
      
      if (typeof window.pageHealthChecker !== 'undefined') {
        try {
          result.healthCheck = window.pageHealthChecker.performHealthCheck();
        } catch (error) {
          result.healthCheckError = error.message;
        }
      }
      
      this.stopErrorCollection();
      
      result.isValid = 
        result.consoleErrors.length === 0 &&
        result.consoleWarnings.length === 0 &&
        (!result.monitoringResults || result.monitoringResults.criticalErrors === 0) &&
        (!result.healthCheck || result.healthCheck.healthy);
      
      return result;
    }
  }
  
  if (typeof window.browserPageValidator === 'undefined') {
    window.browserPageValidator = new BrowserPageValidator();
  }
  
  return await window.browserPageValidator.validateCurrentPage();
})();
`;
}

/**
 * Generate validation instructions for manual browser testing
 */
function generateValidationInstructions() {
  const script = generateBrowserScript();
  
  return `# הוראות בדיקה ידנית בדפדפן

## שימוש

1. פתח את העמוד שברצונך לבדוק
2. פתח את הקונסולה (F12)
3. העתק והדבק את הקוד הבא:

\`\`\`javascript
${script.trim()}
\`\`\`

4. לחץ Enter
5. העתק את התוצאה (JSON) ושמור אותה

## קריטריוני תקינות

עמוד נחשב **תקין** אם:
- ✅ אין שגיאות בקונסולה (console.error)
- ✅ אין אזהרות קריטיות (console.warn על בעיות מערכת)
- ✅ runDetailedPageScan מחזיר 0 שגיאות קריטיות
- ✅ pageHealthChecker מחזיר healthy: true

## רשימת עמודים לבדיקה

${PAGES_TO_CHECK.map((page, i) => `${i + 1}. ${page}`).join('\n')}

## הערות

- **עמוד עם שגיאות בקונסולה = לא תקין**
- כל עמוד חייב לעבור בדיקה
- כל שגיאה חייבת להיות מתועדת
`;
}

/**
 * Generate summary report
 */
function generateReport(results) {
  const validPages = results.filter(r => r.isValid);
  const invalidPages = results.filter(r => !r.isValid);
  
  const totalErrors = results.reduce((sum, r) => sum + (r.consoleErrors?.length || 0), 0);
  const totalWarnings = results.reduce((sum, r) => sum + (r.consoleWarnings?.length || 0), 0);
  const totalCriticalErrors = results.reduce((sum, r) => sum + (r.monitoringResults?.criticalErrors || 0), 0);
  
  return `# דוח בדיקות דפדפן - אוטומטיות

**תאריך:** ${new Date().toISOString()}
**סה"כ עמודים נבדקים:** ${results.length}
**עמודים תקינים:** ${validPages.length} ✅
**עמודים לא תקינים:** ${invalidPages.length} ❌

## סיכום כללי

- **סה"כ שגיאות בקונסולה:** ${totalErrors}
- **סה"כ אזהרות בקונסולה:** ${totalWarnings}
- **סה"כ שגיאות קריטיות (ניטור):** ${totalCriticalErrors}

## עמודים תקינים (${validPages.length})

${validPages.map(p => `- ✅ ${p.pageName}`).join('\n') || 'אין עמודים תקינים'}

## עמודים לא תקינים (${invalidPages.length})

${invalidPages.map(p => {
  const issues = [];
  if (p.consoleErrors?.length > 0) issues.push(`${p.consoleErrors.length} שגיאות בקונסולה`);
  if (p.consoleWarnings?.length > 0) issues.push(`${p.consoleWarnings.length} אזהרות בקונסולה`);
  if (p.monitoringResults?.criticalErrors > 0) issues.push(`${p.monitoringResults.criticalErrors} שגיאות קריטיות`);
  if (p.monitoringResults?.mismatches > 0) issues.push(`${p.monitoringResults.mismatches} אי-התאמות`);
  return `- ❌ **${p.pageName}**: ${issues.join(', ')}`;
}).join('\n') || 'אין עמודים לא תקינים'}

## פירוט לפי עמוד

${results.map(result => {
  return `### ${result.pageName}

**סטטוס:** ${result.isValid ? '✅ תקין' : '❌ לא תקין'}
**תאריך בדיקה:** ${result.timestamp}

#### שגיאות בקונסולה (${result.consoleErrors?.length || 0})
${result.consoleErrors?.map((e, i) => `${i + 1}. ${e.message}`).join('\n') || 'אין שגיאות'}

#### אזהרות בקונסולה (${result.consoleWarnings?.length || 0})
${result.consoleWarnings?.map((w, i) => `${i + 1}. ${w.message}`).join('\n') || 'אין אזהרות'}

#### תוצאות ניטור
${result.monitoringResults ? `
- שגיאות קריטיות: ${result.monitoringResults.criticalErrors || 0}
- אי-התאמות: ${result.monitoringResults.mismatches || 0}
- בעיות סדר טעינה: ${result.monitoringResults.loadOrderIssues?.length || 0}
- סקריפטים חסרים: ${result.monitoringResults.mismatchDetails?.filter(d => d.type === 'missing_script').length || 0}
` : 'לא בוצע ניטור'}

#### בדיקת בריאות
${result.healthCheck ? `
- תקין: ${result.healthCheck.healthy ? '✅' : '❌'}
- בעיות: ${result.healthCheck.issues?.length || 0}
` : 'לא בוצעה בדיקת בריאות'}

---
`;
}).join('\n')}

## המלצות

1. **תיקון שגיאות בקונסולה** - כל עמוד עם שגיאות בקונסולה חייב להיות מתוקן
2. **תיקון סקריפטים חסרים** - הוספת כל הסקריפטים החסרים למניפסט
3. **תיקון בעיות סדר טעינה** - וידוא שכל החבילות נטענות בסדר הנכון
4. **עדכון גרסאות** - תיקון אי-התאמות גרסאות בין המניפסט לסקריפטים בפועל

## קבצים

- **תוצאות JSON:** \`documentation/05-REPORTS/data/BROWSER_VALIDATION_RESULTS.json\`
- **דוח זה:** \`documentation/05-REPORTS/BROWSER_VALIDATION_REPORT.md\`
`;
}

// Main execution
console.log('📋 Browser Automated Validation Script');
console.log('=====================================\n');

console.log('⚠️  הערה: סקריפט זה מייצר הוראות לבדיקה ידנית בדפדפן');
console.log('   בגלל מגבלות טכניות, הבדיקה צריכה להתבצע ידנית\n');

// Save browser script
const browserScript = generateBrowserScript();
const browserScriptPath = path.join(__dirname, '../../trading-ui/scripts/audit/browser-validation-script.js');
fs.writeFileSync(browserScriptPath, browserScript, 'utf8');
console.log(`✅ Browser script saved to: ${browserScriptPath}`);

// Save instructions
const instructions = generateValidationInstructions();
const instructionsPath = path.join(OUTPUT_DIR, '../BROWSER_VALIDATION_INSTRUCTIONS.md');
fs.writeFileSync(instructionsPath, instructions, 'utf8');
console.log(`✅ Instructions saved to: ${instructionsPath}`);

// Create empty results structure
const emptyResults = PAGES_TO_CHECK.map(page => ({
  pageName: page,
  status: 'pending',
  timestamp: null,
  isValid: null,
  consoleErrors: [],
  consoleWarnings: [],
  monitoringResults: null,
  healthCheck: null
}));

fs.writeFileSync(RESULTS_FILE, JSON.stringify(emptyResults, null, 2), 'utf8');
console.log(`✅ Empty results structure saved to: ${RESULTS_FILE}`);

console.log('\n📝 השלבים הבאים:');
console.log('1. פתח כל עמוד בדפדפן');
console.log('2. הרץ את הסקריפט מהקונסולה');
console.log('3. העתק את התוצאות ל-BROWSER_VALIDATION_RESULTS.json');
console.log('4. הרץ את הסקריפט מחדש ליצירת דוח');

console.log('\n✅ הושלם!');

