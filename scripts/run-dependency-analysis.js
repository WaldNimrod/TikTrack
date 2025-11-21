#!/usr/bin/env node
/**
 * Dependency Analysis Runner - Node.js Script
 * Runs dependency analysis on package-manifest.js
 */

const fs = require('fs');
const path = require('path');

// Read package-manifest.js
const manifestPath = path.join(__dirname, '../trading-ui/scripts/init-system/package-manifest.js');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');

// Extract PACKAGE_MANIFEST object (simple extraction)
const manifestMatch = manifestContent.match(/const PACKAGE_MANIFEST = ({[\s\S]*?});/);
if (!manifestMatch) {
    console.error('❌ Could not extract PACKAGE_MANIFEST');
    process.exit(1);
}

// Evaluate the manifest (in a safe way)
let PACKAGE_MANIFEST;
try {
    eval(manifestMatch[1].replace(/PACKAGE_MANIFEST/g, 'MANIFEST'));
    // Actually, let's parse it more carefully
    const manifestStr = manifestMatch[1];
    // Replace all package references
    PACKAGE_MANIFEST = eval(`(${manifestStr})`);
} catch (error) {
    console.error('❌ Error parsing manifest:', error.message);
    process.exit(1);
}

// Analyze dependencies
const dependencyGraph = new Map();
const circularDependencies = [];
const missingDependencies = [];
const undefinedDependencies = [];

// Build dependency graph
Object.entries(PACKAGE_MANIFEST).forEach(([pkgId, pkg]) => {
    const dependencies = pkg.dependencies || [];
    dependencyGraph.set(pkgId, dependencies);
});

// Find missing dependencies
dependencyGraph.forEach((dependencies, pkgId) => {
    dependencies.forEach(depId => {
        if (!PACKAGE_MANIFEST[depId]) {
            missingDependencies.push({
                package: pkgId,
                missingDependency: depId
            });
        }
    });
});

// Find circular dependencies using DFS
const visited = new Set();
const recursionStack = new Set();
const cycles = [];

const dfs = (pkgId, path = []) => {
    visited.add(pkgId);
    recursionStack.add(pkgId);
    path.push(pkgId);

    const dependencies = dependencyGraph.get(pkgId) || [];
    dependencies.forEach(depId => {
        if (!PACKAGE_MANIFEST[depId]) {
            return; // Missing dependency - already caught
        }

        if (recursionStack.has(depId)) {
            // Found a cycle
            const cycleStart = path.indexOf(depId);
            const cycle = path.slice(cycleStart).concat([depId]);
            cycles.push([...cycle]);
        } else if (!visited.has(depId)) {
            dfs(depId, [...path]);
        }
    });

    recursionStack.delete(pkgId);
};

// Check all packages
Object.keys(PACKAGE_MANIFEST).forEach(pkgId => {
    if (!visited.has(pkgId)) {
        dfs(pkgId);
    }
});

// Remove duplicate cycles
const uniqueCycles = [];
cycles.forEach(cycle => {
    const normalized = cycle.sort().join(' → ');
    if (!uniqueCycles.some(c => c.normalized === normalized)) {
        uniqueCycles.push({
            cycle: cycle,
            normalized: normalized,
            packages: cycle.slice(0, -1)
        });
    }
});

// Find undefined dependencies
const allDependencyIds = new Set();
dependencyGraph.forEach(dependencies => {
    dependencies.forEach(depId => allDependencyIds.add(depId));
});

allDependencyIds.forEach(depId => {
    if (!PACKAGE_MANIFEST[depId]) {
        const referencingPackages = [];
        dependencyGraph.forEach((dependencies, pkgId) => {
            if (dependencies.includes(depId)) {
                referencingPackages.push(pkgId);
            }
        });

        undefinedDependencies.push({
            undefinedDependency: depId,
            referencedBy: referencingPackages
        });
    }
});

// Display results
console.log('\n🔍 Dependency Analysis Results\n');
console.log('='.repeat(60));
console.log(`📦 Total Packages: ${Object.keys(PACKAGE_MANIFEST).length}`);
console.log(`🔗 Total Dependencies: ${Array.from(dependencyGraph.values()).reduce((sum, deps) => sum + deps.length, 0)}`);
console.log(`🔄 Circular Dependencies: ${uniqueCycles.length}`);
console.log(`❌ Missing Dependencies: ${missingDependencies.length}`);
console.log(`⚠️  Undefined Dependencies: ${undefinedDependencies.length}`);
console.log(`📊 Total Issues: ${uniqueCycles.length + missingDependencies.length + undefinedDependencies.length}`);
console.log('='.repeat(60));

if (uniqueCycles.length > 0) {
    console.log('\n🔄 Circular Dependencies:');
    uniqueCycles.forEach((cycle, index) => {
        console.log(`\n  ${index + 1}. ${cycle.packages.join(' → ')} → ${cycle.packages[0]}`);
    });
}

if (missingDependencies.length > 0) {
    console.log('\n❌ Missing Dependencies:');
    missingDependencies.forEach((missing, index) => {
        console.log(`\n  ${index + 1}. ${missing.package} depends on ${missing.missingDependency} (not found in manifest)`);
    });
}

if (undefinedDependencies.length > 0) {
    console.log('\n⚠️  Undefined Dependencies:');
    undefinedDependencies.forEach((undefined, index) => {
        console.log(`\n  ${index + 1}. ${undefined.undefinedDependency} referenced by: ${undefined.referencedBy.join(', ')}`);
    });
}

if (uniqueCycles.length === 0 && missingDependencies.length === 0 && undefinedDependencies.length === 0) {
    console.log('\n✅ No issues found! All dependencies are valid.');
}

console.log('\n');

// Export results
const results = {
    timestamp: new Date().toISOString(),
    summary: {
        totalPackages: Object.keys(PACKAGE_MANIFEST).length,
        totalDependencies: Array.from(dependencyGraph.values()).reduce((sum, deps) => sum + deps.length, 0),
        circularCount: uniqueCycles.length,
        missingCount: missingDependencies.length,
        undefinedCount: undefinedDependencies.length,
        issuesCount: uniqueCycles.length + missingDependencies.length + undefinedDependencies.length
    },
    circularDependencies: uniqueCycles,
    missingDependencies: missingDependencies,
    undefinedDependencies: undefinedDependencies
};

const outputPath = path.join(__dirname, '../dependency-analysis-results.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`📄 Results exported to: ${outputPath}\n`);

