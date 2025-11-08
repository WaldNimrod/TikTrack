/**
 * Runtime Validator
 * מערכת ולידציה בזמן ריצה
 */
class RuntimeValidator {
  constructor() {
    this.results = {
      duplicates: [],
      missing: [],
      orderIssues: [],
      versionIssues: []
    };
  }
  
  /**
   * Run all checks
   */
  runChecks() {
    console.group('🔍 Runtime Validator - בדיקות תקינות');
    
    this.checkDuplicates();
    this.checkMissingSystems();
    this.checkLoadOrder();
    this.checkVersions();
    
    this.report();
    
    console.groupEnd();
    
    return this.results;
  }
  
  /**
   * Check for duplicate scripts
   */
  checkDuplicates() {
    const scripts = document.querySelectorAll('script[src]');
    const seen = new Map();
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (seen.has(src)) {
        this.results.duplicates.push({
          src: src,
          count: seen.get(src) + 1
        });
        seen.set(src, seen.get(src) + 1);
      } else {
        seen.set(src, 1);
      }
    });
    
    if (this.results.duplicates.length > 0) {
      console.error('🔴 סקריפטים כפולים:', this.results.duplicates);
    } else {
      console.log('✅ אין סקריפטים כפולים');
    }
  }
  
  /**
   * Check missing systems
   */
  checkMissingSystems() {
    if (!window.PAGE_CONFIGS) return;
    
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    const config = window.PAGE_CONFIGS[pageName];
    
    if (!config || !config.requiredGlobals) return;
    
    config.requiredGlobals.forEach(globalName => {
      if (!this.checkGlobal(globalName)) {
        this.results.missing.push(globalName);
      }
    });
    
    if (this.results.missing.length > 0) {
      console.error('🔴 מערכות חסרות:', this.results.missing);
    } else {
      console.log('✅ כל המערכות הנדרשות נטענו');
    }
  }
  
  /**
   * Check global exists
   */
  checkGlobal(globalPath) {
    try {
      const parts = globalPath.replace('window.', '').split('.');
      let obj = window;
      for (const part of parts) {
        if (obj[part] === undefined) return false;
        obj = obj[part];
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Check load order
   */
  checkLoadOrder() {
    // בדיקה שחבילות עם dependencies נטענו אחרי התלויות שלהן
    if (!window.PAGE_CONFIGS || !window.PACKAGE_MANIFEST) {
      console.log('✅ סדר טעינה תקין (אין מידע על חבילות)');
      return;
    }
    
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    const config = window.PAGE_CONFIGS[pageName];
    
    if (!config || !config.packages) {
      console.log('✅ סדר טעינה תקין (אין חבילות מוגדרות)');
      return;
    }
    
    // בדיקה בסיסית של סדר טעינה
    const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    let orderIssues = 0;
    
    config.packages.forEach(pkgName => {
      const pkg = window.PACKAGE_MANIFEST[pkgName];
      if (pkg && pkg.dependencies) {
        pkg.dependencies.forEach(depName => {
          const depPkg = window.PACKAGE_MANIFEST[depName];
          if (depPkg) {
            // בדיקה שהחבילה התלויה נטענה לפני החבילה הנוכחית
            const depScripts = depPkg.scripts.map(s => s.file);
            const pkgScripts = pkg.scripts.map(s => s.file);
            
            depScripts.forEach(depScript => {
              pkgScripts.forEach(pkgScript => {
                const depIndex = scripts.findIndex(s => s.includes(depScript));
                const pkgIndex = scripts.findIndex(s => s.includes(pkgScript));
                
                if (depIndex !== -1 && pkgIndex !== -1 && depIndex > pkgIndex) {
                  orderIssues++;
                  this.results.orderIssues.push({
                    dependency: depScript,
                    package: pkgScript,
                    message: `${depScript} נטען אחרי ${pkgScript}`
                  });
                }
              });
            });
          }
        });
      }
    });
    
    if (orderIssues > 0) {
      console.warn('⚠️ בעיות סדר טעינה:', this.results.orderIssues);
    } else {
      console.log('✅ סדר טעינה תקין');
    }
  }
  
  /**
   * Check versions
   */
  checkVersions() {
    const scripts = document.querySelectorAll('script[src]');
    const withoutVersion = [];
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('scripts/') && !src.includes('?v=')) {
        withoutVersion.push(src);
      }
    });
    
    this.results.versionIssues = withoutVersion;
    
    if (withoutVersion.length > 0) {
      console.warn('⚠️ סקריפטים ללא גרסה:', withoutVersion);
    } else {
      console.log('✅ כל הסקריפטים עם version query');
    }
  }
  
  /**
   * Generate report
   */
  report() {
    const total = this.results.duplicates.length +
                  this.results.missing.length +
                  this.results.orderIssues.length +
                  this.results.versionIssues.length;
    
    if (total === 0) {
      console.log('✅ כל הבדיקות עברו בהצלחה!');
    } else {
      console.warn(`⚠️ נמצאו ${total} בעיות`);
    }
    
    return {
      totalIssues: total,
      duplicates: this.results.duplicates.length,
      missing: this.results.missing.length,
      orderIssues: this.results.orderIssues.length,
      versionIssues: this.results.versionIssues.length,
      details: this.results
    };
  }
  
  /**
   * Get detailed report for UI
   */
  getDetailedReport() {
    const report = this.report();
    
    return {
      summary: {
        totalIssues: report.totalIssues,
        status: report.totalIssues === 0 ? 'success' : 'warning'
      },
      issues: {
        duplicates: {
          count: report.duplicates,
          items: this.results.duplicates.map(d => ({
            src: d.src,
            count: d.count,
            message: `סקריפט נטען ${d.count} פעמים`
          }))
        },
        missing: {
          count: report.missing,
          items: this.results.missing.map(m => ({
            global: m,
            message: `מערכת חסרה: ${m}`
          }))
        },
        orderIssues: {
          count: report.orderIssues,
          items: this.results.orderIssues.map(o => ({
            dependency: o.dependency,
            package: o.package,
            message: o.message
          }))
        },
        versionIssues: {
          count: report.versionIssues,
          items: this.results.versionIssues.map(v => ({
            src: v,
            message: 'סקריפט ללא version query'
          }))
        }
      }
    };
  }
}

// Auto-run in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const validator = new RuntimeValidator();
      window.runtimeValidator = validator;
      validator.runChecks();
    }, 1000);
  });
}

window.RuntimeValidator = RuntimeValidator;
