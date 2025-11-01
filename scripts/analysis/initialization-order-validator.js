#!/usr/bin/env node

/**
 * Initialization Order Validator - TikTrack
 * ==========================================
 * 
 * בדיקת ואימות סדר אתחול של מערכות
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    packageManifestFile: 'trading-ui/scripts/init-system/package-manifest.js',
    pageConfigsFile: 'trading-ui/scripts/page-initialization-configs.js'
};

class InitializationOrderValidator {
    constructor() {
        this.validationResults = {
            packageOrder: {},
            violations: [],
            optimalOrder: {},
            dependencies: {},
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validate package order from package-manifest
     */
    async validatePackageOrder() {
        const manifestPath = path.join(process.cwd(), CONFIG.packageManifestFile);
        
        if (!fs.existsSync(manifestPath)) {
            throw new Error('Package manifest not found');
        }
        
        const content = fs.readFileSync(manifestPath, 'utf8');
        
        // Extract package loadOrder
        const packages = this.extractPackages(content);
        
        // Validate order
        const violations = [];
        const packageNames = Object.keys(packages);
        
        for (let i = 0; i < packageNames.length; i++) {
            const current = packages[packageNames[i]];
            const currentOrder = current.loadOrder || 999;
            
            // Check dependencies
            if (current.dependencies && current.dependencies.length > 0) {
                current.dependencies.forEach(dep => {
                    const depPackage = packages[dep];
                    if (depPackage) {
                        const depOrder = depPackage.loadOrder || 999;
                        if (depOrder >= currentOrder) {
                            violations.push({
                                package: packageNames[i],
                                dependency: dep,
                                issue: `Package ${packageNames[i]} (order ${currentOrder}) depends on ${dep} (order ${depOrder})`,
                                severity: 'error',
                                type: 'Dependency Order Violation'
                            });
                        }
                    }
                });
            }
            
            // Check for duplicate load orders
            const sameOrder = packageNames.filter(p => 
                packages[p].loadOrder === currentOrder && p !== packageNames[i]
            );
            
            if (sameOrder.length > 0) {
                violations.push({
                    package: packageNames[i],
                    issue: `Multiple packages with loadOrder ${currentOrder}`,
                    conflicts: sameOrder,
                    severity: 'warning',
                    type: 'Duplicate Load Order'
                });
            }
        }
        
        this.validationResults.packageOrder = packages;
        this.validationResults.violations = violations;
        
        return {
            packages: packages,
            violations: violations
        };
    }

    /**
     * Extract packages from manifest
     */
    extractPackages(content) {
        const packages = {};
        
        // Find package definitions
        const packagePattern = /(['"]?\w+['"]?):\s*\{/g;
        let match;
        
        while ((match = packagePattern.exec(content)) !== null) {
            const packageName = match[1].replace(/['"]/g, '');
            
            // Extract properties
            const packageStart = content.indexOf(match[0]);
            const packageEnd = this.findMatchingBrace(content, packageStart + match[0].length - 1);
            const packageContent = content.substring(packageStart, packageEnd);
            
            packages[packageName] = {
                loadOrder: this.extractProperty(packageContent, 'loadOrder'),
                dependencies: this.extractArrayProperty(packageContent, 'dependencies'),
                scripts: this.extractScripts(packageContent)
            };
        }
        
        return packages;
    }

    /**
     * Extract scripts from package
     */
    extractScripts(packageContent) {
        const scripts = [];
        const scriptPattern = /file:\s*['"]([^'"]+)['"]/g;
        
        let match;
        while ((match = scriptPattern.exec(packageContent)) !== null) {
            const file = match[1];
            const scriptStart = packageContent.lastIndexOf('{', match.index);
            const scriptEnd = packageContent.indexOf('}', match.index);
            const scriptContent = packageContent.substring(scriptStart, scriptEnd);
            
            scripts.push({
                file: file,
                loadOrder: this.extractProperty(scriptContent, 'loadOrder'),
                required: this.extractProperty(scriptContent, 'required'),
                globalCheck: this.extractProperty(scriptContent, 'globalCheck')
            });
        }
        
        return scripts;
    }

    /**
     * Check load order in package-manifest
     */
    checkLoadOrder() {
        const manifestPath = path.join(process.cwd(), CONFIG.packageManifestFile);
        
        if (!fs.existsSync(manifestPath)) {
            return { error: 'Manifest not found' };
        }
        
        const content = fs.readFileSync(manifestPath, 'utf8');
        const packages = this.extractPackages(content);
        
        // Build order map
        const orderMap = {};
        Object.entries(packages).forEach(([name, pkg]) => {
            if (pkg.scripts) {
                pkg.scripts.forEach(script => {
                    if (script.loadOrder) {
                        orderMap[script.file] = {
                            package: name,
                            order: script.loadOrder,
                            required: script.required
                        };
                    }
                });
            }
        });
        
        return orderMap;
    }

    /**
     * Detect order violations
     */
    detectOrderViolations(packages, dependencies) {
        const violations = [];
        
        // Check if dependencies are loaded before dependents
        Object.entries(packages).forEach(([pkgName, pkg]) => {
            if (pkg.dependencies) {
                pkg.dependencies.forEach(dep => {
                    const depPkg = packages[dep];
                    const pkgOrder = pkg.loadOrder || 999;
                    const depOrder = depPkg ? (depPkg.loadOrder || 999) : 999;
                    
                    if (depOrder >= pkgOrder) {
                        violations.push({
                            package: pkgName,
                            dependency: dep,
                            issue: `Package ${pkgName} (order ${pkgOrder}) depends on ${dep} (order ${depOrder})`,
                            severity: 'error'
                        });
                    }
                });
            }
        });
        
        return violations;
    }

    /**
     * Generate optimal order suggestion
     */
    generateOptimalOrder(packages, violations) {
        // Topological sort based on dependencies
        const ordered = [];
        const visited = new Set();
        const visiting = new Set();
        
        const visit = (pkgName) => {
            if (visiting.has(pkgName)) {
                // Circular dependency detected
                return;
            }
            
            if (visited.has(pkgName)) {
                return;
            }
            
            visiting.add(pkgName);
            
            const pkg = packages[pkgName];
            if (pkg && pkg.dependencies) {
                pkg.dependencies.forEach(dep => visit(dep));
            }
            
            visiting.delete(pkgName);
            visited.add(pkgName);
            ordered.push(pkgName);
        };
        
        Object.keys(packages).forEach(pkgName => visit(pkgName));
        
        // Assign new load orders
        const optimalOrder = {};
        ordered.forEach((pkgName, index) => {
            optimalOrder[pkgName] = {
                suggestedOrder: index + 1,
                currentOrder: packages[pkgName].loadOrder || 999
            };
        });
        
        return optimalOrder;
    }

    /**
     * Helper: Extract property value from object string
     */
    extractProperty(content, propName) {
        const pattern = new RegExp(`${propName}:\\s*([^,}\\n]+)`, 'g');
        const match = pattern.exec(content);
        
        if (match) {
            const value = match[1].trim();
            // Remove quotes and convert to appropriate type
            if (value.startsWith('"') || value.startsWith("'")) {
                return value.slice(1, -1);
            } else if (value === 'true') {
                return true;
            } else if (value === 'false') {
                return false;
            } else if (/^\d+$/.test(value)) {
                return parseInt(value);
            }
            return value;
        }
        
        return null;
    }

    /**
     * Helper: Extract array property
     */
    extractArrayProperty(content, propName) {
        const pattern = new RegExp(`${propName}:\\s*\\[([^\\]]+)\\]`, 'g');
        const match = pattern.exec(content);
        
        if (match) {
            return match[1]
                .split(',')
                .map(item => item.trim().replace(/['"]/g, ''))
                .filter(item => item.length > 0);
        }
        
        return [];
    }

    /**
     * Helper: Find matching closing brace
     */
    findMatchingBrace(content, startIndex) {
        let depth = 1;
        let i = startIndex;
        
        while (i < content.length && depth > 0) {
            if (content[i] === '{') depth++;
            if (content[i] === '}') depth--;
            i++;
        }
        
        return i;
    }

    /**
     * Save validation results
     */
    async saveResults() {
        const outputDir = path.join(process.cwd(), 'reports/integration-analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputFile = path.join(outputDir, 'initialization-order-validation.json');
        fs.writeFileSync(outputFile, JSON.stringify(this.validationResults, null, 2));
        
        console.log(`💾 Validation results saved to: ${outputFile}`);
        return outputFile;
    }
}

// Export for use in other scripts
module.exports = InitializationOrderValidator;

// Command line usage
if (require.main === module) {
    const validator = new InitializationOrderValidator();
    
    validator.validatePackageOrder()
        .then(() => validator.saveResults())
        .then(() => {
            console.log('\n✅ Initialization order validation complete!');
            
            if (validator.validationResults.violations.length > 0) {
                console.log(`⚠️  Found ${validator.validationResults.violations.length} violations`);
                validator.validationResults.violations.forEach(v => {
                    console.log(`   - ${v.issue}`);
                });
            } else {
                console.log('✅ No violations detected');
            }
        })
        .catch(error => {
            console.error('❌ Validation failed:', error);
            process.exit(1);
        });
}


