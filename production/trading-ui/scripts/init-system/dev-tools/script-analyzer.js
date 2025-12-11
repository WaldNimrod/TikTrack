/**
 * Script Analyzer
 * כלי ניתוח סקריפטים
 */
class ScriptAnalyzer {

// ===== FUNCTION INDEX =====

// === Other ===
// - ScriptAnalyzer.analyze() - Analyze

  /**
   * Analyze page scripts
   */
  analyze() {
    const results = {
      totalScripts: 0,
      duplicates: [],
      missingVersions: [],
      loadOrder: [],
      size: 0,
      packages: [],
      performance: {
        loadTime: 0,
        blockingScripts: 0
      }
    };
    
    const scripts = document.querySelectorAll('script[src]');
    results.totalScripts = scripts.length;
    
    // ניתוח כפילויות
    const seen = new Map();
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (seen.has(src)) {
        results.duplicates.push(src);
      }
      seen.set(src, true);
    });
    
    // ניתוח גרסאות
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('scripts/') && !src.includes('?v=')) {
        results.missingVersions.push(src);
      }
    });
    
    // ניתוח חבילות
    if (window.PAGE_CONFIGS && window.PACKAGE_MANIFEST) {
      const pageName = window.location.pathname.split('/').pop().replace('.html', '');
      const config = window.PAGE_CONFIGS[pageName];
      
      if (config && config.packages) {
        results.packages = config.packages.map(pkgName => {
          const pkg = window.PACKAGE_MANIFEST[pkgName];
          return {
            name: pkgName,
            displayName: pkg?.name || pkgName,
            scripts: pkg?.scripts?.length || 0,
            size: pkg?.estimatedSize || 'Unknown',
            loadTime: pkg?.initTime || 'Unknown'
          };
        });
      }
    }
    
    // ניתוח ביצועים
    const startTime = performance.now();
    results.performance.loadTime = startTime;
    
    // ספירת סקריפטים חוסמים
    scripts.forEach(script => {
      if (!script.async && !script.defer) {
        results.performance.blockingScripts++;
      }
    });
    
    return results;
  }
  
  /**
   * Display report
   */
  displayReport() {
    const report = this.analyze();
    
    console.group('📊 Script Analysis Report');
    console.log(`סה"כ סקריפטים: ${report.totalScripts}`);
    console.log(`כפילויות: ${report.duplicates.length}`);
    console.log(`חסרי גרסה: ${report.missingVersions.length}`);
    console.log(`סקריפטים חוסמים: ${report.performance.blockingScripts}`);
    
    if (report.packages.length > 0) {
      console.log('חבילות נטענות:');
      report.packages.forEach(pkg => {
        console.log(`  - ${pkg.displayName}: ${pkg.scripts} סקריפטים, ${pkg.size}, ${pkg.loadTime}`);
      });
    }
    
    if (report.duplicates.length > 0) {
      console.warn('סקריפטים כפולים:', report.duplicates);
    }
    
    if (report.missingVersions.length > 0) {
      console.warn('סקריפטים ללא גרסה:', report.missingVersions);
    }
    
    console.groupEnd();
    
    return report;
  }
  
  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions() {
    const report = this.analyze();
    const suggestions = [];
    
    if (report.duplicates.length > 0) {
      suggestions.push({
        type: 'duplicates',
        priority: 'high',
        message: `הסר ${report.duplicates.length} סקריפטים כפולים`,
        details: report.duplicates
      });
    }
    
    if (report.missingVersions.length > 0) {
      suggestions.push({
        type: 'versions',
        priority: 'medium',
        message: `הוסף version query ל-${report.missingVersions.length} סקריפטים`,
        details: report.missingVersions
      });
    }
    
    if (report.performance.blockingScripts > 5) {
      suggestions.push({
        type: 'performance',
        priority: 'medium',
        message: `שקול async/defer ל-${report.performance.blockingScripts} סקריפטים`,
        details: 'סקריפטים רבים חוסמים את הטעינה'
      });
    }
    
    if (report.packages.length > 8) {
      suggestions.push({
        type: 'packages',
        priority: 'low',
        message: `שקול אופטימיזציה של ${report.packages.length} חבילות`,
        details: 'יותר מדי חבילות עלולות להאט את הטעינה'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Generate HTML report
   */
  generateHTMLReport() {
    const report = this.analyze();
    const suggestions = this.getOptimizationSuggestions();
    
    let html = `
      <div class="script-analysis-report">
        <h3>📊 דוח ניתוח סקריפטים</h3>
        
        <div class="summary">
          <div class="stat">
            <span class="label">סה"כ סקריפטים:</span>
            <span class="value">${report.totalScripts}</span>
          </div>
          <div class="stat">
            <span class="label">כפילויות:</span>
            <span class="value ${report.duplicates.length > 0 ? 'error' : 'success'}">${report.duplicates.length}</span>
          </div>
          <div class="stat">
            <span class="label">חסרי גרסה:</span>
            <span class="value ${report.missingVersions.length > 0 ? 'warning' : 'success'}">${report.missingVersions.length}</span>
          </div>
          <div class="stat">
            <span class="label">חוסמים:</span>
            <span class="value ${report.performance.blockingScripts > 5 ? 'warning' : 'success'}">${report.performance.blockingScripts}</span>
          </div>
        </div>
    `;
    
    if (report.packages.length > 0) {
      html += `
        <div class="packages">
          <h4>חבילות נטענות:</h4>
          <ul>
            ${report.packages.map(pkg => `
              <li>${pkg.displayName}: ${pkg.scripts} סקריפטים, ${pkg.size}, ${pkg.loadTime}</li>
            `).join('')}
          </ul>
        </div>
      `;
    }
    
    if (suggestions.length > 0) {
      html += `
        <div class="suggestions">
          <h4>הצעות אופטימיזציה:</h4>
          <ul>
            ${suggestions.map(suggestion => `
              <li class="suggestion ${suggestion.priority}">
                <strong>${suggestion.message}</strong>
                ${suggestion.details ? `<br><small>${suggestion.details}</small>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
    
    html += '</div>';
    
    return html;
  }
}

window.ScriptAnalyzer = ScriptAnalyzer;
