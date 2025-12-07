/**
 * Dependency Analyzer - Analyzes package dependencies
 * ====================================================
 * 
 * Analyzes:
 * 1. Package structure
 * 2. Dependencies between packages
 * 3. Circular dependencies
 * 4. Missing dependencies
 * 5. Load order issues
 * 
 * @version 1.0.0
 * @created January 2025
 */

const fs = require('fs');
const path = require('path');

class DependencyAnalyzer {
  constructor(scriptsDir) {
    this.scriptsDir = scriptsDir;
    this.manifestPath = path.join(scriptsDir, 'init-system/package-manifest.js');
  }

  /**
   * Analyze packages
   */
  async analyze() {
    const manifest = await this.loadManifest();
    
    const packages = Object.keys(manifest);
    const dependencyGraph = this.buildDependencyGraph(manifest);
    const circularDependencies = this.findCircularDependencies(dependencyGraph);
    const missingDependencies = this.findMissingDependencies(manifest);
    const loadOrderIssues = this.findLoadOrderIssues(manifest);
    const unusedDependencies = this.findUnusedDependencies(manifest);
    
    // Count scripts
    let totalScripts = 0;
    Object.values(manifest).forEach(pkg => {
      if (pkg.scripts) {
        totalScripts += pkg.scripts.length;
      }
    });
    
    return {
      totalPackages: packages.length,
      totalScripts,
      structure: this.analyzeStructure(manifest),
      dependencyGraph,
      circularDependencies,
      missingDependencies,
      loadOrderIssues,
      unusedDependencies
    };
  }

  /**
   * Load package manifest
   */
  async loadManifest() {
    if (!fs.existsSync(this.manifestPath)) {
      throw new Error(`Manifest not found: ${this.manifestPath}`);
    }
    
    const content = fs.readFileSync(this.manifestPath, 'utf8');
    
    // Try to extract PACKAGE_MANIFEST using regex first
    const manifestMatch = content.match(/const\s+PACKAGE_MANIFEST\s*=\s*({[\s\S]*?});?\s*(?:module\.exports|window\.PACKAGE_MANIFEST)/);
    
    if (manifestMatch) {
      try {
        // Use VM to evaluate the manifest object
        const vm = require('vm');
        const context = { PACKAGE_MANIFEST: {} };
        vm.createContext(context);
        vm.runInContext(`PACKAGE_MANIFEST = ${manifestMatch[1]};`, context);
        if (Object.keys(context.PACKAGE_MANIFEST).length > 0) {
          return context.PACKAGE_MANIFEST;
        }
      } catch (e) {
        console.warn('Could not parse manifest with regex, trying full evaluation:', e.message);
      }
    }
    
    // Fallback: Use VM to evaluate the entire file
    const vm = require('vm');
    const context = {
      module: {},
      exports: {},
      require: require,
      __dirname: path.dirname(this.manifestPath),
      __filename: this.manifestPath,
      console: console,
      window: {},
      PACKAGE_MANIFEST: {}
    };
    
    try {
      vm.createContext(context);
      vm.runInContext(content, context);
      
      // Try different ways to get the manifest
      if (context.PACKAGE_MANIFEST && Object.keys(context.PACKAGE_MANIFEST).length > 0) {
        return context.PACKAGE_MANIFEST;
      }
      if (context.module && context.module.exports && context.module.exports.PACKAGE_MANIFEST) {
        return context.module.exports.PACKAGE_MANIFEST;
      }
      if (context.window && context.window.PACKAGE_MANIFEST) {
        return context.window.PACKAGE_MANIFEST;
      }
      
      // Last resort: try to extract using regex
      const manifestMatch = content.match(/const\s+PACKAGE_MANIFEST\s*=\s*({[\s\S]*?});/);
      if (manifestMatch) {
        try {
          const extractedContext = { PACKAGE_MANIFEST: {} };
          vm.createContext(extractedContext);
          vm.runInContext(`PACKAGE_MANIFEST = ${manifestMatch[1]};`, extractedContext);
          if (Object.keys(extractedContext.PACKAGE_MANIFEST).length > 0) {
            return extractedContext.PACKAGE_MANIFEST;
          }
        } catch (e) {
          console.warn('Could not extract manifest with regex:', e.message);
        }
      }
      
      console.warn('Manifest loaded but empty, returning empty object');
      return {};
    } catch (e) {
      console.error('Failed to load manifest:', e.message);
      return {};
    }
  }

  /**
   * Build dependency graph
   */
  buildDependencyGraph(manifest) {
    const graph = {};
    
    Object.entries(manifest).forEach(([pkgName, pkg]) => {
      graph[pkgName] = {
        dependencies: pkg.dependencies || [],
        loadOrder: pkg.loadOrder || 999,
        scripts: pkg.scripts || []
      };
    });
    
    return graph;
  }

  /**
   * Find circular dependencies using DFS
   */
  findCircularDependencies(graph) {
    const circular = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        // Found cycle
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart).concat(node);
        circular.push({
          package1: cycle[0],
          package2: cycle[1] || cycle[0],
          cycle: cycle
        });
        return;
      }
      
      if (visited.has(node)) {
        return;
      }
      
      visited.add(node);
      recursionStack.add(node);
      
      const deps = graph[node]?.dependencies || [];
      deps.forEach(dep => {
        if (graph[dep]) {
          dfs(dep, [...path, node]);
        }
      });
      
      recursionStack.delete(node);
    };
    
    Object.keys(graph).forEach(node => {
      if (!visited.has(node)) {
        dfs(node);
      }
    });
    
    // Remove duplicates
    const unique = [];
    const seen = new Set();
    circular.forEach(c => {
      const key = [c.package1, c.package2].sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    });
    
    return unique;
  }

  /**
   * Find missing dependencies
   */
  findMissingDependencies(manifest) {
    const missing = [];
    const validPackages = Object.keys(manifest);
    
    Object.entries(manifest).forEach(([pkgName, pkg]) => {
      const deps = pkg.dependencies || [];
      deps.forEach(dep => {
        if (!validPackages.includes(dep)) {
          missing.push({
            package: pkgName,
            missing: dep,
            issue: `Package '${pkgName}' depends on '${dep}' which does not exist`
          });
        }
      });
    });
    
    return missing;
  }

  /**
   * Find load order issues
   */
  findLoadOrderIssues(manifest) {
    const issues = [];
    
    Object.entries(manifest).forEach(([pkgName, pkg]) => {
      const pkgLoadOrder = pkg.loadOrder || 999;
      const deps = pkg.dependencies || [];
      
      deps.forEach(dep => {
        const depPkg = manifest[dep];
        if (depPkg) {
          const depLoadOrder = depPkg.loadOrder || 999;
          if (depLoadOrder >= pkgLoadOrder) {
            issues.push({
              package: pkgName,
              dependency: dep,
              issue: `Package '${pkgName}' (loadOrder: ${pkgLoadOrder}) depends on '${dep}' (loadOrder: ${depLoadOrder}) but dependency has higher or equal loadOrder`,
              fix: `Change loadOrder of '${dep}' to be less than ${pkgLoadOrder}`
            });
          }
        }
      });
    });
    
    return issues;
  }

  /**
   * Find unused dependencies
   */
  findUnusedDependencies(manifest) {
    const unused = [];
    const used = new Set();
    
    // Find all packages that are used as dependencies
    Object.values(manifest).forEach(pkg => {
      const deps = pkg.dependencies || [];
      deps.forEach(dep => used.add(dep));
    });
    
    // Find packages that are never used as dependencies
    Object.keys(manifest).forEach(pkgName => {
      if (pkgName !== 'base' && !used.has(pkgName)) {
        unused.push({
          package: pkgName,
          issue: `Package '${pkgName}' is never used as a dependency`
        });
      }
    });
    
    return unused;
  }

  /**
   * Analyze package structure
   */
  analyzeStructure(manifest) {
    const structure = {};
    
    Object.entries(manifest).forEach(([pkgName, pkg]) => {
      structure[pkgName] = {
        scriptsCount: (pkg.scripts || []).length,
        loadOrder: pkg.loadOrder || 999,
        dependenciesCount: (pkg.dependencies || []).length,
        hasCircular: false // Will be set by circular dependency check
      };
    });
    
    return structure;
  }
}

module.exports = DependencyAnalyzer;

