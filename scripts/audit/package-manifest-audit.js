/**
 * Package Manifest Comprehensive Audit Tool
 * ==========================================
 * 
 * כלי בדיקה מקיף למערכת הטעינה והחבילות
 * 
 * בודק:
 * 1. מיפוי עמודים - השוואת תעוד מול קוד
 * 2. חבילות - חלוקה ותלויות
 * 3. עמודים - הגדרות ותאימות
 * 4. ניתור טעינה - בדיקה בפועל
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Import helper modules
const PageMapper = require('./page-mapper');
const DependencyAnalyzer = require('./dependency-analyzer');
const LoadOrderValidator = require('./load-order-validator');

class PackageManifestAudit {
  constructor() {
    this.rootDir = path.join(__dirname, '../..');
    this.tradingUiDir = path.join(this.rootDir, 'trading-ui');
    this.scriptsDir = path.join(this.tradingUiDir, 'scripts');
    this.docsDir = path.join(this.rootDir, 'documentation');
    
    this.results = {
      summary: {
        totalPages: 0,
        pagesInDocs: 0,
        pagesInConfigs: 0,
        pagesInHTML: 0,
        totalPackages: 0,
        totalScripts: 0,
        issues: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      },
      pages: {
        missingInDocs: [],
        missingInConfigs: [],
        extraInConfigs: [],
        duplicates: []
      },
      packages: {
        structure: {},
        dependencies: {},
        loadOrder: {},
        issues: []
      },
      pagesConfig: {
        missingPackages: [],
        invalidPackages: [],
        missingGlobals: [],
        loadOrderIssues: []
      },
      loading: {
        scriptsNotInPackages: [],
        scriptsMissing: [],
        loadOrderMismatches: [],
        globalsMissing: []
      }
    };
  }

  /**
   * Run complete audit
   */
  async run() {
    console.log('🔍 Starting Package Manifest Comprehensive Audit...\n');
    
    try {
      // Step 1: Map all pages
      console.log('📄 Step 1: Mapping pages...');
      await this.mapPages();
      
      // Step 2: Analyze packages
      console.log('📦 Step 2: Analyzing packages...');
      await this.analyzePackages();
      
      // Step 3: Validate page configurations
      console.log('⚙️ Step 3: Validating page configurations...');
      await this.validatePageConfigs();
      
      // Step 4: Check loading order
      console.log('📋 Step 4: Checking load order...');
      await this.checkLoadOrder();
      
      // Step 5: Generate report
      console.log('📊 Step 5: Generating report...');
      await this.generateReport();
      
      console.log('\n✅ Audit completed successfully!');
      console.log(`📄 Report saved to: ${path.join(this.docsDir, '05-REPORTS/PACKAGE_MANIFEST_AUDIT_REPORT.md')}`);
      console.log(`📊 Data saved to: ${path.join(this.docsDir, '05-REPORTS/data/PACKAGE_MANIFEST_AUDIT_DATA.json')}`);
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      throw error;
    }
  }

  /**
   * Map all pages - compare documentation vs code
   */
  async mapPages() {
    const mapper = new PageMapper(this.rootDir);
    const mappingResults = await mapper.map();
    
    this.results.pages = mappingResults;
    this.results.summary.totalPages = mappingResults.allPages.length;
    this.results.summary.pagesInDocs = mappingResults.documentedPages.length;
    this.results.summary.pagesInConfigs = mappingResults.configPages.length;
    this.results.summary.pagesInHTML = mappingResults.htmlPages.length;
    
    // Count issues
    this.results.summary.issues.critical += mappingResults.missingInConfigs.length;
    this.results.summary.issues.high += mappingResults.missingInDocs.length;
    this.results.summary.issues.medium += mappingResults.extraInConfigs.length;
    this.results.summary.issues.low += mappingResults.duplicates.length;
  }

  /**
   * Analyze packages structure and dependencies
   */
  async analyzePackages() {
    const analyzer = new DependencyAnalyzer(this.scriptsDir);
    const analysisResults = await analyzer.analyze();
    
    this.results.packages = analysisResults;
    this.results.summary.totalPackages = analysisResults.totalPackages;
    this.results.summary.totalScripts = analysisResults.totalScripts;
    
    // Count issues
    this.results.summary.issues.critical += analysisResults.circularDependencies.length;
    this.results.summary.issues.high += analysisResults.missingDependencies.length;
    this.results.summary.issues.medium += analysisResults.loadOrderIssues.length;
    this.results.summary.issues.low += analysisResults.unusedDependencies.length;
  }

  /**
   * Validate page configurations
   */
  async validatePageConfigs() {
    const configsPath = path.join(this.scriptsDir, 'page-initialization-configs.js');
    const manifestPath = path.join(this.scriptsDir, 'init-system/package-manifest.js');
    
    if (!fs.existsSync(configsPath) || !fs.existsSync(manifestPath)) {
      throw new Error('Required files not found');
    }
    
    // Load package manifest
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    
    // Evaluate manifest
    const vm = require('vm');
    const manifestContext = { 
      module: {}, 
      exports: {}, 
      require: require, 
      __dirname: path.dirname(manifestPath),
      window: {}
    };
    vm.createContext(manifestContext);
    vm.runInContext(manifestContent, manifestContext);
    const PACKAGE_MANIFEST = manifestContext.PACKAGE_MANIFEST || {};
    
    // Load page configs - extract using regex (simpler approach)
    const configsContent = fs.readFileSync(configsPath, 'utf8');
    
    // Extract pageInitializationConfigs object using regex
    // Look for: const pageInitializationConfigs = { ... };
    let pageInitializationConfigs = {};
    
    // Try to find the pageInitializationConfigs definition
    const configsMatch = configsContent.match(/const\s+pageInitializationConfigs\s*=\s*({[\s\S]*?});/);
    if (configsMatch) {
      try {
        // Evaluate the object
        const vm = require('vm');
        const context = { pageInitializationConfigs: {} };
        vm.createContext(context);
        vm.runInContext(`pageInitializationConfigs = ${configsMatch[1]};`, context);
        pageInitializationConfigs = context.pageInitializationConfigs;
      } catch (e) {
        console.warn('Could not parse pageInitializationConfigs, trying alternative method:', e.message);
        // Alternative: extract page names directly
        const pagePattern = /['"]([a-z0-9_-]+(?:\.html)?)['"]\s*:\s*\{/gi;
        const pages = new Set();
        let match;
        while ((match = pagePattern.exec(configsContent)) !== null) {
          pages.add(match[1].replace(/\.html$/, ''));
        }
        // Create minimal configs for validation
        pages.forEach(pageName => {
          pageInitializationConfigs[pageName] = { packages: [] };
        });
      }
    }
    
    this.validateConfigs(pageInitializationConfigs, PACKAGE_MANIFEST);
  }

  /**
   * Validate configs helper
   */
  validateConfigs(pageInitializationConfigs, PACKAGE_MANIFEST) {
    // Validate each page config
    const validPackages = Object.keys(PACKAGE_MANIFEST);
    const allGlobals = new Set();
    
    // Collect all globals from manifest
    Object.values(PACKAGE_MANIFEST).forEach(pkg => {
      if (pkg.scripts) {
        pkg.scripts.forEach(script => {
          if (script.globalCheck) {
            const global = script.globalCheck.replace(/^window\./, '');
            allGlobals.add(global);
          }
        });
      }
    });
    
    for (const [pageName, config] of Object.entries(pageInitializationConfigs)) {
      if (!config || !config.packages) continue;
      
      // Check packages exist
      for (const pkg of config.packages) {
        if (!validPackages.includes(pkg)) {
          this.results.pagesConfig.invalidPackages.push({
            page: pageName,
            package: pkg,
            issue: 'Package does not exist in manifest'
          });
        }
      }
      
      // Check required globals
      if (config.requiredGlobals) {
        for (const global of config.requiredGlobals) {
          const globalName = global.replace(/^window\./, '');
          if (!allGlobals.has(globalName)) {
            this.results.pagesConfig.missingGlobals.push({
              page: pageName,
              global: global,
              issue: 'Global not found in any package'
            });
          }
        }
      }
    }
    
    // Count issues
    this.results.summary.issues.high += this.results.pagesConfig.invalidPackages.length;
    this.results.summary.issues.medium += this.results.pagesConfig.missingGlobals.length;
  }

  /**
   * Check load order
   */
  async checkLoadOrder() {
    const validator = new LoadOrderValidator(this.scriptsDir, this.tradingUiDir);
    const validationResults = await validator.validate();
    
    this.results.loading = validationResults;
    
    // Count issues
    this.results.summary.issues.critical += validationResults.loadOrderMismatches.length;
    this.results.summary.issues.high += validationResults.scriptsMissing.length;
    this.results.summary.issues.medium += validationResults.scriptsNotInPackages.length;
    this.results.summary.issues.low += validationResults.globalsMissing.length;
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    const reportPath = path.join(this.docsDir, '05-REPORTS/PACKAGE_MANIFEST_AUDIT_REPORT.md');
    const dataPath = path.join(this.docsDir, '05-REPORTS/data/PACKAGE_MANIFEST_AUDIT_DATA.json');
    
    // Ensure directories exist
    const reportDir = path.dirname(reportPath);
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    
    // Generate JSON data
    fs.writeFileSync(dataPath, JSON.stringify(this.results, null, 2), 'utf8');
    
    // Generate Markdown report
    const report = this.generateMarkdownReport();
    fs.writeFileSync(reportPath, report, 'utf8');
  }

  /**
   * Generate Markdown report
   */
  generateMarkdownReport() {
    const { summary, pages, packages, pagesConfig, loading } = this.results;
    
    let report = `# דוח בדיקה מקיף - מערכת הטעינה והחבילות
**תאריך:** ${new Date().toLocaleDateString('he-IL')}
**גרסה:** 1.0.0
**סטטוס:** ✅ הושלם

---

## 📊 סיכום מנהלים

### סטטיסטיקות כלליות

| מדד | כמות |
|-----|------|
| **סה"כ עמודים בפועל** | ${summary.pagesInHTML} |
| **עמודים מתועדים** | ${summary.pagesInDocs} |
| **עמודים בהגדרות** | ${summary.pagesInConfigs} |
| **סה"כ חבילות** | ${summary.totalPackages} |
| **סה"כ סקריפטים** | ${summary.totalScripts} |

### סיכום בעיות

| עדיפות | כמות |
|--------|------|
| 🔴 **קריטי** | ${summary.issues.critical} |
| 🟠 **גבוה** | ${summary.issues.high} |
| 🟡 **בינוני** | ${summary.issues.medium} |
| 🟢 **נמוך** | ${summary.issues.low} |
| **סה"כ** | ${summary.issues.critical + summary.issues.high + summary.issues.medium + summary.issues.low} |

---

## 📄 עמודים חסרים

### עמודים חסרים בתעוד

${pages.missingInDocs.length > 0 ? pages.missingInDocs.map(p => `- **${p}** - קיים בקוד אבל לא מתועד`).join('\n') : '✅ אין עמודים חסרים בתעוד'}

### עמודים חסרים בהגדרות

${pages.missingInConfigs.length > 0 ? pages.missingInConfigs.map(p => `- **${p}** - קיים בקוד אבל לא מוגדר ב-page-initialization-configs.js`).join('\n') : '✅ אין עמודים חסרים בהגדרות'}

### עמודים מיותרים בהגדרות

${pages.extraInConfigs.length > 0 ? pages.extraInConfigs.map(p => `- **${p}** - מוגדר אבל לא קיים בקוד`).join('\n') : '✅ אין עמודים מיותרים בהגדרות'}

### כפילויות בהגדרות

${pages.duplicates.length > 0 ? pages.duplicates.map(d => `- **${d.page}** - מוגדר ${d.count} פעמים`).join('\n') : '✅ אין כפילויות בהגדרות'}

---

## 📦 בעיות חבילות

### מעגלי תלויות

${packages.circularDependencies && packages.circularDependencies.length > 0 ? packages.circularDependencies.map(c => `- **${c.package1}** ↔ **${c.package2}** - תלות מעגלית`).join('\n') : '✅ אין מעגלי תלויות'}

### תלויות חסרות

${packages.missingDependencies && packages.missingDependencies.length > 0 ? packages.missingDependencies.map(d => `- **${d.package}** - תלוי ב-**${d.missing}** שלא מוגדר כתלות`).join('\n') : '✅ אין תלויות חסרות'}

### בעיות סדר טעינה

${packages.loadOrderIssues && packages.loadOrderIssues.length > 0 ? packages.loadOrderIssues.map(i => `- **${i.package}** - ${i.issue}`).join('\n') : '✅ אין בעיות סדר טעינה'}

---

## ⚙️ בעיות הגדרות עמודים

### חבילות לא תקינות

${pagesConfig.invalidPackages.length > 0 ? pagesConfig.invalidPackages.map(i => `- **${i.page}** - חבילה **${i.package}** לא קיימת במניפסט`).join('\n') : '✅ אין חבילות לא תקינות'}

### Globals חסרים

${pagesConfig.missingGlobals.length > 0 ? pagesConfig.missingGlobals.map(i => `- **${i.page}** - Global **${i.global}** לא נמצא באף חבילה`).join('\n') : '✅ אין globals חסרים'}

---

## 📋 בעיות טעינה

### סקריפטים שנטענים אבל לא בחבילות

${loading.scriptsNotInPackages.length > 0 ? loading.scriptsNotInPackages.map(s => `- **${s.page}** - \`${s.script}\``).join('\n') : '✅ אין סקריפטים מיותרים'}

### סקריפטים שצריכים להיטען אבל חסרים

${loading.scriptsMissing.length > 0 ? loading.scriptsMissing.map(s => `- **${s.page}** - \`${s.script}\` - ${s.reason}`).join('\n') : '✅ אין סקריפטים חסרים'}

### אי-התאמות סדר טעינה

${loading.loadOrderMismatches.length > 0 ? loading.loadOrderMismatches.map(m => `- **${m.page}** - ${m.issue}`).join('\n') : '✅ אין אי-התאמות סדר טעינה'}

---

## 🔧 המלצות תיקון

### עדיפות קריטית

${this.generateFixRecommendations('critical')}

### עדיפות גבוהה

${this.generateFixRecommendations('high')}

### עדיפות בינונית

${this.generateFixRecommendations('medium')}

---

**הערות:**
- דוח זה נוצר אוטומטית על ידי כלי הבדיקה המקיף
- כל הבעיות מתועדות עם מיקום מדויק ופתרון מוצע
- נתונים גולמיים זמינים ב: \`documentation/05-REPORTS/data/PACKAGE_MANIFEST_AUDIT_DATA.json\`
`;

    return report;
  }

  /**
   * Generate fix recommendations
   */
  generateFixRecommendations(priority) {
    const { pages, packages, pagesConfig, loading } = this.results;
    
    let recommendations = [];
    
    if (priority === 'critical') {
      // Missing pages in configs
      if (pages.missingInConfigs.length > 0) {
        recommendations.push(`**הוסף הגדרות לעמודים חסרים:**`);
        pages.missingInConfigs.forEach(page => {
          recommendations.push(`- הוסף הגדרה ל-\`${page}\` ב-\`page-initialization-configs.js\``);
        });
      }
      
      // Circular dependencies
      if (packages.circularDependencies && packages.circularDependencies.length > 0) {
        recommendations.push(`**תקן מעגלי תלויות:**`);
        packages.circularDependencies.forEach(c => {
          recommendations.push(`- הסר תלות בין \`${c.package1}\` ו-\`${c.package2}\``);
        });
      }
      
      // Load order mismatches
      if (loading.loadOrderMismatches.length > 0) {
        recommendations.push(`**תקן סדר טעינה:**`);
        loading.loadOrderMismatches.forEach(m => {
          recommendations.push(`- ${m.page}: ${m.fix}`);
        });
      }
    }
    
    if (priority === 'high') {
      // Missing pages in docs
      if (pages.missingInDocs.length > 0) {
        recommendations.push(`**עדכן תעוד:**`);
        pages.missingInDocs.forEach(page => {
          recommendations.push(`- הוסף \`${page}\` ל-\`PAGES_LIST.md\``);
        });
      }
      
      // Invalid packages
      if (pagesConfig.invalidPackages.length > 0) {
        recommendations.push(`**תקן חבילות לא תקינות:**`);
        pagesConfig.invalidPackages.forEach(i => {
          recommendations.push(`- ${i.page}: הסר או תיקן חבילה \`${i.package}\``);
        });
      }
    }
    
    if (priority === 'medium') {
      // Extra configs
      if (pages.extraInConfigs.length > 0) {
        recommendations.push(`**הסר הגדרות מיותרות:**`);
        pages.extraInConfigs.forEach(page => {
          recommendations.push(`- הסר הגדרה ל-\`${page}\` מ-\`page-initialization-configs.js\``);
        });
      }
      
      // Missing globals
      if (pagesConfig.missingGlobals.length > 0) {
        recommendations.push(`**תקן globals חסרים:**`);
        pagesConfig.missingGlobals.forEach(i => {
          recommendations.push(`- ${i.page}: הסר או תיקן global \`${i.global}\``);
        });
      }
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : '✅ אין המלצות תיקון';
  }
}

// Run if called directly
if (require.main === module) {
  const audit = new PackageManifestAudit();
  audit.run().catch(console.error);
}

module.exports = PackageManifestAudit;

