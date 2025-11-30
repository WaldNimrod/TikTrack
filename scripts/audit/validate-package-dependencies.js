/**
 * Package Dependencies and Load Order Validator
 * ==============================================
 * 
 * Validates:
 * 1. Package dependencies are correctly defined
 * 2. Load order is correct based on dependencies
 * 3. No circular dependencies exist
 * 4. All dependencies exist in manifest
 * 5. Load order matches dependency requirements
 * 
 * @version 1.0.0
 * @created November 2025
 */

const fs = require('fs');
const path = require('path');

class PackageDependencyValidator {
  constructor(scriptsDir) {
    this.scriptsDir = scriptsDir;
    this.manifestPath = path.join(scriptsDir, 'init-system/package-manifest.js');
    this.manifest = null;
  }

  /**
   * Load package manifest
   */
  loadManifest() {
    const content = fs.readFileSync(this.manifestPath, 'utf8');
    // Try to extract PACKAGE_MANIFEST using regex (more reliable than vm for this file)
    const match = content.match(/const\s+PACKAGE_MANIFEST\s*=\s*({[\s\S]*?});/);
    if (match) {
      try {
        this.manifest = eval('(' + match[1] + ')');
        return this.manifest;
      } catch (e) {
        console.error('Error parsing PACKAGE_MANIFEST:', e.message);
      }
    }
    return {};
  }

  /**
   * Validate all dependencies exist
   */
  validateDependenciesExist() {
    const issues = [];
    
    for (const [pkgId, pkg] of Object.entries(this.manifest)) {
      if (!pkg.dependencies || pkg.dependencies.length === 0) {
        continue;
      }
      
      for (const depId of pkg.dependencies) {
        if (!this.manifest[depId]) {
          issues.push({
            package: pkgId,
            issue: `Dependency '${depId}' does not exist in manifest`,
            severity: 'error'
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Validate load order matches dependencies
   */
  validateLoadOrder() {
    const issues = [];
    
    for (const [pkgId, pkg] of Object.entries(this.manifest)) {
      if (!pkg.dependencies || pkg.dependencies.length === 0) {
        continue;
      }
      
      const pkgLoadOrder = pkg.loadOrder || 0;
      
      for (const depId of pkg.dependencies) {
        const depPkg = this.manifest[depId];
        if (!depPkg) {
          continue; // Already reported in validateDependenciesExist
        }
        
        const depLoadOrder = depPkg.loadOrder || 0;
        
        if (depLoadOrder >= pkgLoadOrder) {
          issues.push({
            package: pkgId,
            dependency: depId,
            packageLoadOrder: pkgLoadOrder,
            dependencyLoadOrder: depLoadOrder,
            issue: `Package '${pkgId}' (loadOrder: ${pkgLoadOrder}) depends on '${depId}' (loadOrder: ${depLoadOrder}), but dependency should load first`,
            severity: 'error'
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies() {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (pkgId, path) => {
      if (recursionStack.has(pkgId)) {
        // Found a cycle
        const cycleStart = path.indexOf(pkgId);
        const cycle = path.slice(cycleStart).concat(pkgId);
        cycles.push({
          cycle: cycle,
          issue: `Circular dependency detected: ${cycle.join(' → ')}`,
          severity: 'error'
        });
        return;
      }
      
      if (visited.has(pkgId)) {
        return;
      }
      
      visited.add(pkgId);
      recursionStack.add(pkgId);
      
      const pkg = this.manifest[pkgId];
      if (pkg && pkg.dependencies) {
        for (const depId of pkg.dependencies) {
          if (this.manifest[depId]) {
            dfs(depId, [...path, pkgId]);
          }
        }
      }
      
      recursionStack.delete(pkgId);
    };
    
    for (const pkgId of Object.keys(this.manifest)) {
      if (!visited.has(pkgId)) {
        dfs(pkgId, []);
      }
    }
    
    return cycles;
  }

  /**
   * Validate load order is sequential
   */
  validateLoadOrderSequential() {
    const issues = [];
    const packages = Object.values(this.manifest);
    const sortedByLoadOrder = packages
      .filter(pkg => pkg.loadOrder !== undefined)
      .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));
    
    // Check for duplicate load orders
    const loadOrderMap = new Map();
    for (const pkg of sortedByLoadOrder) {
      const loadOrder = pkg.loadOrder;
      if (loadOrderMap.has(loadOrder)) {
        issues.push({
          package: pkg.id,
          conflictingPackage: loadOrderMap.get(loadOrder).id,
          loadOrder: loadOrder,
          issue: `Package '${pkg.id}' has same loadOrder (${loadOrder}) as '${loadOrderMap.get(loadOrder).id}'`,
          severity: 'warning'
        });
      } else {
        loadOrderMap.set(loadOrder, pkg);
      }
    }
    
    return issues;
  }

  /**
   * Validate all packages have required fields
   */
  validatePackageStructure() {
    const issues = [];
    const requiredFields = ['id', 'name', 'loadOrder'];
    
    for (const [pkgId, pkg] of Object.entries(this.manifest)) {
      for (const field of requiredFields) {
        if (!(field in pkg)) {
          issues.push({
            package: pkgId,
            field: field,
            issue: `Package '${pkgId}' is missing required field '${field}'`,
            severity: 'error'
          });
        }
      }
      
      // Validate loadOrder is a number
      if (pkg.loadOrder !== undefined && typeof pkg.loadOrder !== 'number') {
        issues.push({
          package: pkgId,
          issue: `Package '${pkgId}' has invalid loadOrder type: ${typeof pkg.loadOrder}`,
          severity: 'error'
        });
      }
      
      // Validate dependencies is an array
      if (pkg.dependencies !== undefined && !Array.isArray(pkg.dependencies)) {
        issues.push({
          package: pkgId,
          issue: `Package '${pkgId}' has invalid dependencies type: ${typeof pkg.dependencies}`,
          severity: 'error'
        });
      }
    }
    
    return issues;
  }

  /**
   * Generate dependency graph
   */
  generateDependencyGraph() {
    const graph = {};
    
    for (const [pkgId, pkg] of Object.entries(this.manifest)) {
      graph[pkgId] = {
        id: pkgId,
        name: pkg.name,
        loadOrder: pkg.loadOrder,
        dependencies: pkg.dependencies || [],
        dependents: []
      };
    }
    
    // Build reverse dependencies (dependents)
    for (const [pkgId, pkg] of Object.entries(this.manifest)) {
      if (pkg.dependencies) {
        for (const depId of pkg.dependencies) {
          if (graph[depId]) {
            graph[depId].dependents.push(pkgId);
          }
        }
      }
    }
    
    return graph;
  }

  /**
   * Validate all packages
   */
  validate() {
    console.log('🔍 טוען מניפסט...\n');
    this.loadManifest();
    
    if (!this.manifest || Object.keys(this.manifest).length === 0) {
      console.error('❌ לא ניתן לטעון את המניפסט');
      return null;
    }
    
    console.log(`✅ נטען מניפסט עם ${Object.keys(this.manifest).length} חבילות\n`);
    
    const results = {
      dependenciesExist: this.validateDependenciesExist(),
      loadOrder: this.validateLoadOrder(),
      circularDependencies: this.detectCircularDependencies(),
      loadOrderSequential: this.validateLoadOrderSequential(),
      packageStructure: this.validatePackageStructure(),
      dependencyGraph: this.generateDependencyGraph()
    };
    
    return results;
  }

  /**
   * Print validation report
   */
  printReport(results) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 דוח בדיקת תלויות וסדר טעינה');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    let totalIssues = 0;
    let totalErrors = 0;
    let totalWarnings = 0;
    
    // Package Structure
    console.log('1️⃣  בדיקת מבנה חבילות:');
    if (results.packageStructure.length === 0) {
      console.log('   ✅ כל החבילות בעלות מבנה תקין\n');
    } else {
      totalIssues += results.packageStructure.length;
      results.packageStructure.forEach(issue => {
        if (issue.severity === 'error') totalErrors++;
        if (issue.severity === 'warning') totalWarnings++;
        console.log(`   ${issue.severity === 'error' ? '❌' : '⚠️'} ${issue.issue}`);
      });
      console.log('');
    }
    
    // Dependencies Exist
    console.log('2️⃣  בדיקת קיום תלויות:');
    if (results.dependenciesExist.length === 0) {
      console.log('   ✅ כל התלויות קיימות במניפסט\n');
    } else {
      totalIssues += results.dependenciesExist.length;
      totalErrors += results.dependenciesExist.length;
      results.dependenciesExist.forEach(issue => {
        console.log(`   ❌ ${issue.issue}`);
      });
      console.log('');
    }
    
    // Load Order
    console.log('3️⃣  בדיקת סדר טעינה:');
    if (results.loadOrder.length === 0) {
      console.log('   ✅ סדר הטעינה תואם לתלויות\n');
    } else {
      totalIssues += results.loadOrder.length;
      totalErrors += results.loadOrder.length;
      results.loadOrder.forEach(issue => {
        console.log(`   ❌ ${issue.issue}`);
        console.log(`      Package: ${issue.package} (loadOrder: ${issue.packageLoadOrder})`);
        console.log(`      Dependency: ${issue.dependency} (loadOrder: ${issue.dependencyLoadOrder})`);
      });
      console.log('');
    }
    
    // Circular Dependencies
    console.log('4️⃣  בדיקת מעגלי תלויות:');
    if (results.circularDependencies.length === 0) {
      console.log('   ✅ לא נמצאו מעגלי תלויות\n');
    } else {
      totalIssues += results.circularDependencies.length;
      totalErrors += results.circularDependencies.length;
      results.circularDependencies.forEach(cycle => {
        console.log(`   ❌ ${cycle.issue}`);
      });
      console.log('');
    }
    
    // Load Order Sequential
    console.log('5️⃣  בדיקת סדר טעינה רציף:');
    if (results.loadOrderSequential.length === 0) {
      console.log('   ✅ אין כפילויות בסדר הטעינה\n');
    } else {
      totalIssues += results.loadOrderSequential.length;
      totalWarnings += results.loadOrderSequential.length;
      results.loadOrderSequential.forEach(issue => {
        console.log(`   ⚠️  ${issue.issue}`);
      });
      console.log('');
    }
    
    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 סיכום:');
    console.log(`   ✅ חבילות נבדקו: ${Object.keys(this.manifest).length}`);
    console.log(`   ❌ שגיאות: ${totalErrors}`);
    console.log(`   ⚠️  אזהרות: ${totalWarnings}`);
    console.log(`   📋 סה"כ בעיות: ${totalIssues}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Dependency Graph Summary
    console.log('📊 סיכום גרף תלויות:');
    const sortedPackages = Object.values(results.dependencyGraph)
      .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));
    
    sortedPackages.forEach(pkg => {
      const deps = pkg.dependencies.length > 0 ? pkg.dependencies.join(', ') : 'none';
      const dependents = pkg.dependents.length > 0 ? pkg.dependents.join(', ') : 'none';
      console.log(`   ${pkg.id} (loadOrder: ${pkg.loadOrder})`);
      console.log(`      → תלוי ב: ${deps}`);
      console.log(`      ← תלוי בו: ${dependents}`);
    });
    
    return {
      totalIssues,
      totalErrors,
      totalWarnings,
      isValid: totalErrors === 0
    };
  }
}

// Main execution
if (require.main === module) {
  const scriptsDir = path.join(__dirname, '../../trading-ui/scripts');
  const validator = new PackageDependencyValidator(scriptsDir);
  
  const results = validator.validate();
  if (results) {
    const summary = validator.printReport(results);
    
    // Save detailed report
    const reportPath = path.join(__dirname, '../../documentation/05-REPORTS/PACKAGE_DEPENDENCIES_VALIDATION.md');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    let report = `# דוח בדיקת תלויות וסדר טעינה - חבילות\n`;
    report += `**תאריך:** ${new Date().toISOString().split('T')[0]}\n`;
    report += `**גרסה:** 1.0.0\n`;
    report += `**סטטוס:** ${summary.isValid ? '✅ תקין' : '❌ בעיות נמצאו'}\n\n`;
    report += `---\n\n`;
    report += `## 📊 סיכום\n\n`;
    report += `- **חבילות נבדקו:** ${Object.keys(validator.manifest).length}\n`;
    report += `- **שגיאות:** ${summary.totalErrors}\n`;
    report += `- **אזהרות:** ${summary.totalWarnings}\n`;
    report += `- **סה"כ בעיות:** ${summary.totalIssues}\n\n`;
    report += `---\n\n`;
    
    if (results.packageStructure.length > 0) {
      report += `## 1️⃣ מבנה חבילות\n\n`;
      results.packageStructure.forEach(issue => {
        report += `- **${issue.package}**: ${issue.issue}\n`;
      });
      report += `\n`;
    }
    
    if (results.dependenciesExist.length > 0) {
      report += `## 2️⃣ תלויות חסרות\n\n`;
      results.dependenciesExist.forEach(issue => {
        report += `- **${issue.package}**: ${issue.issue}\n`;
      });
      report += `\n`;
    }
    
    if (results.loadOrder.length > 0) {
      report += `## 3️⃣ בעיות סדר טעינה\n\n`;
      results.loadOrder.forEach(issue => {
        report += `- **${issue.package}**: ${issue.issue}\n`;
        report += `  - Package loadOrder: ${issue.packageLoadOrder}\n`;
        report += `  - Dependency loadOrder: ${issue.dependencyLoadOrder}\n`;
      });
      report += `\n`;
    }
    
    if (results.circularDependencies.length > 0) {
      report += `## 4️⃣ מעגלי תלויות\n\n`;
      results.circularDependencies.forEach(cycle => {
        report += `- ${cycle.issue}\n`;
      });
      report += `\n`;
    }
    
    if (results.loadOrderSequential.length > 0) {
      report += `## 5️⃣ כפילויות בסדר טעינה\n\n`;
      results.loadOrderSequential.forEach(issue => {
        report += `- ${issue.issue}\n`;
      });
      report += `\n`;
    }
    
    report += `---\n\n`;
    report += `## 📊 גרף תלויות\n\n`;
    const sortedPackages = Object.values(results.dependencyGraph)
      .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));
    
    sortedPackages.forEach(pkg => {
      report += `### ${pkg.id} (loadOrder: ${pkg.loadOrder})\n\n`;
      report += `- **תלוי ב:** ${pkg.dependencies.length > 0 ? pkg.dependencies.join(', ') : 'none'}\n`;
      report += `- **תלוי בו:** ${pkg.dependents.length > 0 ? pkg.dependents.join(', ') : 'none'}\n\n`;
    });
    
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 דוח מפורט נשמר ב: ${reportPath}\n`);
    
    process.exit(summary.isValid ? 0 : 1);
  } else {
    process.exit(1);
  }
}

module.exports = PackageDependencyValidator;

