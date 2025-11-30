/**
 * Load Order Validator - Validates script loading order
 * ======================================================
 * 
 * Validates:
 * 1. Scripts loaded in HTML vs packages defined
 * 2. Load order in HTML vs manifest
 * 3. Missing scripts
 * 4. Extra scripts
 * 
 * @version 1.0.0
 * @created January 2025
 */

const fs = require('fs');
const path = require('path');

class LoadOrderValidator {
  constructor(scriptsDir, tradingUiDir) {
    this.scriptsDir = scriptsDir;
    this.tradingUiDir = tradingUiDir;
    this.manifestPath = path.join(scriptsDir, 'init-system/package-manifest.js');
    this.configsPath = path.join(scriptsDir, 'page-initialization-configs.js');
  }

  /**
   * Validate load order for all pages
   */
  async validate() {
    const manifest = await this.loadManifest();
    const configs = await this.loadConfigs();
    const htmlFiles = this.getAllHTMLFiles();
    
    const scriptsNotInPackages = [];
    const scriptsMissing = [];
    const loadOrderMismatches = [];
    const globalsMissing = [];
    
    for (const htmlFile of htmlFiles) {
      const pageName = this.getPageName(htmlFile);
      const config = configs[pageName] || configs[pageName + '.html'];
      
      if (!config) {
        continue; // Skip pages without config
      }
      
      const htmlScripts = this.extractScriptsFromHTML(htmlFile);
      const expectedScripts = this.getExpectedScripts(config, manifest);
      
      // Check for scripts not in packages
      htmlScripts.forEach(script => {
        if (!this.isScriptInPackages(script, manifest)) {
          scriptsNotInPackages.push({
            page: pageName,
            script: script,
            issue: 'Script loaded but not defined in any package'
          });
        }
      });
      
      // Check for missing scripts
      expectedScripts.forEach(expected => {
        if (!htmlScripts.some(s => this.scriptsMatch(s, expected))) {
          scriptsMissing.push({
            page: pageName,
            script: expected,
            reason: 'Required by package but not loaded in HTML'
          });
        }
      });
      
      // Check load order
      const orderIssues = this.checkLoadOrder(htmlScripts, config, manifest);
      loadOrderMismatches.push(...orderIssues.map(issue => ({
        page: pageName,
        ...issue
      })));
    }
    
    return {
      scriptsNotInPackages,
      scriptsMissing,
      loadOrderMismatches,
      globalsMissing
    };
  }

  /**
   * Load package manifest
   */
  async loadManifest() {
    const content = fs.readFileSync(this.manifestPath, 'utf8');
    // Try to extract PACKAGE_MANIFEST using regex (more reliable than vm for this file)
    const match = content.match(/const\s+PACKAGE_MANIFEST\s*=\s*({[\s\S]*?});/);
    if (match) {
      try {
        return eval('(' + match[1] + ')');
      } catch (e) {
        console.error('Error parsing PACKAGE_MANIFEST:', e.message);
      }
    }
    // Fallback to vm
    const vm = require('vm');
    const context = {
      module: { exports: {} },
      exports: {},
      require: require,
      __dirname: path.dirname(this.manifestPath),
      __filename: this.manifestPath,
      window: {},
      PACKAGE_MANIFEST: {},
      Object: Object,
      console: console
    };
    vm.createContext(context);
    vm.runInContext(content, context);
    // Try multiple ways to get the manifest
    return context.PACKAGE_MANIFEST || 
           context.module.exports.PACKAGE_MANIFEST || 
           context.window.PACKAGE_MANIFEST || 
           {};
  }

  /**
   * Load page configs
   */
  async loadConfigs() {
    const content = fs.readFileSync(this.configsPath, 'utf8');
    const vm = require('vm');
    const context = {
      module: {},
      exports: {},
      require: require,
      __dirname: path.dirname(this.configsPath),
      window: { PAGE_CONFIGS: {} },
      PAGE_CONFIGS: {}
    };
    vm.createContext(context);
    vm.runInContext(content, context);
    return context.PAGE_CONFIGS || context.window.PAGE_CONFIGS || {};
  }

  /**
   * Get all HTML files
   */
  getAllHTMLFiles() {
    const files = [];
    
    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.name === 'node_modules' || entry.name.includes('backup')) {
          continue;
        }
        
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          // Skip test and smart files
          if (!entry.name.includes('-smart') && !entry.name.includes('test-') && !entry.name.includes('smart-')) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDir(this.tradingUiDir);
    return files;
  }

  /**
   * Get page name from file path
   */
  getPageName(filePath) {
    const relativePath = path.relative(this.tradingUiDir, filePath);
    let pageName = path.basename(filePath, '.html');
    
    if (relativePath.includes('mockups/')) {
      const mockupPath = relativePath.replace('mockups/', '').replace('.html', '');
      pageName = mockupPath.replace(/\//g, '-');
    }
    
    return pageName;
  }

  /**
   * Extract scripts from HTML
   */
  extractScriptsFromHTML(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const scripts = [];
    
    // Match script tags: <script src="..."></script>
    const scriptPattern = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = scriptPattern.exec(content)) !== null) {
      let scriptPath = match[1];
      
      // Remove query strings
      scriptPath = scriptPath.split('?')[0];
      
      // Normalize path
      if (scriptPath.startsWith('scripts/')) {
        scripts.push(scriptPath);
      } else if (scriptPath.startsWith('http://') || scriptPath.startsWith('https://')) {
        scripts.push(scriptPath); // External scripts
      } else if (!scriptPath.startsWith('/')) {
        // Relative path - try to resolve
        scripts.push(scriptPath);
      }
    }
    
    return scripts;
  }

  /**
   * Get expected scripts from config and manifest
   */
  getExpectedScripts(config, manifest) {
    const scripts = [];
    const packages = config.packages || [];
    
    packages.forEach(pkgName => {
      const pkg = manifest[pkgName];
      if (pkg && pkg.scripts) {
        pkg.scripts.forEach(script => {
          scripts.push(script.file);
        });
      }
    });
    
    return scripts;
  }

  /**
   * Check if script is in packages
   */
  isScriptInPackages(scriptPath, manifest) {
    for (const pkg of Object.values(manifest)) {
      if (pkg.scripts) {
        for (const script of pkg.scripts) {
          if (this.scriptsMatch(scriptPath, script.file)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if two script paths match
   */
  scriptsMatch(script1, script2) {
    // Normalize paths
    const normalize = (s) => {
      s = s.replace(/\\/g, '/');
      s = s.replace(/^scripts\//, '');
      s = s.split('?')[0]; // Remove query strings
      return s.toLowerCase();
    };
    
    return normalize(script1) === normalize(script2);
  }

  /**
   * Check load order
   */
  checkLoadOrder(htmlScripts, config, manifest) {
    const issues = [];
    const packages = config.packages || [];
    
    // Build expected order
    const packageOrder = packages
      .map(pkgName => ({
        name: pkgName,
        loadOrder: manifest[pkgName]?.loadOrder || 999
      }))
      .sort((a, b) => a.loadOrder - b.loadOrder);
    
    // Check if packages are loaded in correct order
    const packagePositions = {};
    htmlScripts.forEach((script, index) => {
      packages.forEach(pkgName => {
        const pkg = manifest[pkgName];
        if (pkg && pkg.scripts) {
          pkg.scripts.forEach(pkgScript => {
            if (this.scriptsMatch(script, pkgScript.file)) {
              if (!packagePositions[pkgName]) {
                packagePositions[pkgName] = index;
              }
            }
          });
        }
      });
    });
    
    // Check order
    for (let i = 0; i < packageOrder.length - 1; i++) {
      const pkg1 = packageOrder[i];
      const pkg2 = packageOrder[i + 1];
      
      if (packagePositions[pkg1.name] !== undefined && packagePositions[pkg2.name] !== undefined) {
        if (packagePositions[pkg1.name] > packagePositions[pkg2.name]) {
          issues.push({
            issue: `Package '${pkg1.name}' (loadOrder: ${pkg1.loadOrder}) should load before '${pkg2.name}' (loadOrder: ${pkg2.loadOrder})`,
            fix: `Reorder scripts so '${pkg1.name}' loads before '${pkg2.name}'`
          });
        }
      }
    }
    
    return issues;
  }
}

module.exports = LoadOrderValidator;

