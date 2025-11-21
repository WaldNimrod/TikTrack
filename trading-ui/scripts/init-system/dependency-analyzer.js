/**
 * Dependency Analyzer - TikTrack Initialization System
 * =====================================================
 * 
 * ניתוח תלויות במניפסט החבילות
 * 
 * Features:
 * - מיפוי כל התלויות במערכת
 * - זיהוי מעגלים (circular dependencies)
 * - זיהוי חוסרים (missing dependencies)
 * - זיהוי תלויות לא מוגדרות
 * - דוח מפורט עם המלצות
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

if (window.Logger) {
  window.Logger.info('🔍 Loading Dependency Analyzer...', { page: 'dependency-analyzer' });
}

/**
 * Dependency Analyzer Class
 */
class DependencyAnalyzer {
    constructor() {
        this.manifest = null;
        this.dependencyGraph = new Map();
        this.circularDependencies = [];
        this.missingDependencies = [];
        this.undefinedDependencies = [];
        this.dependencyTree = {};
    }

    /**
     * Initialize with package manifest
     */
    init() {
        if (typeof window.PACKAGE_MANIFEST === 'undefined') {
            if (window.Logger) {
                window.Logger.error('PACKAGE_MANIFEST not found', {}, { page: 'dependency-analyzer' });
            }
            return false;
        }

        this.manifest = window.PACKAGE_MANIFEST;
        return true;
    }

    /**
     * Analyze all dependencies
     */
    analyze() {
        if (!this.init()) {
            return null;
        }

        // Build dependency graph
        this.buildDependencyGraph();

        // Find circular dependencies
        this.findCircularDependencies();

        // Find missing dependencies
        this.findMissingDependencies();

        // Find undefined dependencies
        this.findUndefinedDependencies();

        // Build dependency tree
        this.buildDependencyTree();

        return {
            dependencyGraph: Object.fromEntries(this.dependencyGraph),
            circularDependencies: this.circularDependencies,
            missingDependencies: this.missingDependencies,
            undefinedDependencies: this.undefinedDependencies,
            dependencyTree: this.dependencyTree,
            summary: {
                totalPackages: Object.keys(this.manifest).length,
                totalDependencies: Array.from(this.dependencyGraph.values()).reduce((sum, deps) => sum + deps.length, 0),
                circularCount: this.circularDependencies.length,
                missingCount: this.missingDependencies.length,
                undefinedCount: this.undefinedDependencies.length,
                issuesCount: this.circularDependencies.length + this.missingDependencies.length + this.undefinedDependencies.length
            }
        };
    }

    /**
     * Build dependency graph
     */
    buildDependencyGraph() {
        this.dependencyGraph.clear();

        Object.entries(this.manifest).forEach(([pkgId, pkg]) => {
            const dependencies = pkg.dependencies || [];
            this.dependencyGraph.set(pkgId, dependencies);
        });
    }

    /**
     * Find circular dependencies using DFS
     */
    findCircularDependencies() {
        this.circularDependencies = [];
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];

        const dfs = (pkgId, path = []) => {
            visited.add(pkgId);
            recursionStack.add(pkgId);
            path.push(pkgId);

            const dependencies = this.dependencyGraph.get(pkgId) || [];
            dependencies.forEach(depId => {
                if (!this.manifest[depId]) {
                    // Missing dependency - will be caught by findMissingDependencies
                    return;
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
        Object.keys(this.manifest).forEach(pkgId => {
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
                    packages: cycle.slice(0, -1) // Remove duplicate last element
                });
            }
        });

        this.circularDependencies = uniqueCycles;
    }

    /**
     * Find missing dependencies
     */
    findMissingDependencies() {
        this.missingDependencies = [];

        this.dependencyGraph.forEach((dependencies, pkgId) => {
            dependencies.forEach(depId => {
                if (!this.manifest[depId]) {
                    this.missingDependencies.push({
                        package: pkgId,
                        missingDependency: depId,
                        severity: 'error'
                    });
                }
            });
        });
    }

    /**
     * Find undefined dependencies (packages that are referenced but not defined)
     */
    findUndefinedDependencies() {
        this.undefinedDependencies = [];

        // Get all unique dependency IDs
        const allDependencyIds = new Set();
        this.dependencyGraph.forEach(dependencies => {
            dependencies.forEach(depId => allDependencyIds.add(depId));
        });

        // Check which ones are not defined in manifest
        allDependencyIds.forEach(depId => {
            if (!this.manifest[depId]) {
                // Find which packages reference this undefined dependency
                const referencingPackages = [];
                this.dependencyGraph.forEach((dependencies, pkgId) => {
                    if (dependencies.includes(depId)) {
                        referencingPackages.push(pkgId);
                    }
                });

                this.undefinedDependencies.push({
                    undefinedDependency: depId,
                    referencedBy: referencingPackages,
                    severity: 'error'
                });
            }
        });
    }

    /**
     * Build dependency tree for visualization
     */
    buildDependencyTree() {
        this.dependencyTree = {};

        Object.entries(this.manifest).forEach(([pkgId, pkg]) => {
            const dependencies = pkg.dependencies || [];
            this.dependencyTree[pkgId] = {
                name: pkg.name || pkgId,
                dependencies: dependencies.map(depId => ({
                    id: depId,
                    name: this.manifest[depId]?.name || depId,
                    exists: !!this.manifest[depId]
                })),
                dependents: this.findDependents(pkgId),
                loadOrder: pkg.loadOrder || 999,
                version: pkg.version || 'unknown'
            };
        });
    }

    /**
     * Find packages that depend on a given package
     */
    findDependents(pkgId) {
        const dependents = [];
        this.dependencyGraph.forEach((dependencies, pkgId2) => {
            if (dependencies.includes(pkgId)) {
                dependents.push(pkgId2);
            }
        });
        return dependents;
    }

    /**
     * Display analysis results
     */
    displayResults(results) {
        if (!results) {
            if (typeof showNotification === 'function') {
                showNotification('לא ניתן לבצע ניתוח - PACKAGE_MANIFEST לא זמין', 'error');
            }
            return;
        }

        const html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-chart-line"></i> סיכום ניתוח תלויות</h6>
                <p><strong>סה"כ חבילות:</strong> ${results.summary.totalPackages}</p>
                <p><strong>סה"כ תלויות:</strong> ${results.summary.totalDependencies}</p>
                <p><strong>מעגלים:</strong> ${results.summary.circularCount}</p>
                <p><strong>תלויות חסרות:</strong> ${results.summary.missingCount}</p>
                <p><strong>תלויות לא מוגדרות:</strong> ${results.summary.undefinedCount}</p>
                <p><strong>סה"כ בעיות:</strong> ${results.summary.issuesCount}</p>
            </div>

            ${results.circularDependencies.length > 0 ? `
                <div class="alert alert-danger">
                    <h6><i class="fas fa-exclamation-triangle"></i> מעגלי תלויות (${results.circularDependencies.length})</h6>
                    <div style="max-height: 300px; overflow-y: auto;">
                        <ol>
                            ${results.circularDependencies.map((cycle, index) => `
                                <li class="mb-2">
                                    <strong>מעגל ${index + 1}:</strong><br>
                                    <code>${cycle.packages.join(' → ')} → ${cycle.packages[0]}</code>
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                </div>
            ` : ''}

            ${results.missingDependencies.length > 0 ? `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-exclamation-circle"></i> תלויות חסרות (${results.missingDependencies.length})</h6>
                    <div style="max-height: 300px; overflow-y: auto;">
                        <ol>
                            ${results.missingDependencies.map((missing, index) => `
                                <li class="mb-2">
                                    <strong>${missing.package}</strong> תלוי ב-<code>${missing.missingDependency}</code> שלא קיים במניפסט
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                </div>
            ` : ''}

            ${results.undefinedDependencies.length > 0 ? `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-question-circle"></i> תלויות לא מוגדרות (${results.undefinedDependencies.length})</h6>
                    <div style="max-height: 300px; overflow-y: auto;">
                        <ol>
                            ${results.undefinedDependencies.map((undefined, index) => `
                                <li class="mb-2">
                                    <code>${undefined.undefinedDependency}</code> מוזכר על ידי: ${undefined.referencedBy.join(', ')}
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                </div>
            ` : ''}

            ${results.summary.issuesCount === 0 ? `
                <div class="alert alert-success">
                    <h6><i class="fas fa-check-circle"></i> מערכת תקינה!</h6>
                    <p>לא נמצאו בעיות בתלויות.</p>
                </div>
            ` : ''}

            <div class="text-center mt-3">
                <button class="btn btn-primary" onclick="dependencyAnalyzer.exportResults()">
                    <i class="fas fa-download"></i> ייצא תוצאות JSON
                </button>
            </div>
        `;

        if (typeof window.showDetailsModal === 'function') {
            window.showDetailsModal('🔍 תוצאות ניתוח תלויות', html);
        } else {
            console.log('Dependency Analysis Results:', results);
        }

        // Save results globally
        window.dependencyAnalysisResults = results;
    }

    /**
     * Export results as JSON
     */
    exportResults() {
        if (!window.dependencyAnalysisResults) {
            if (typeof showNotification === 'function') {
                showNotification('אין תוצאות לייצוא', 'warning');
            }
            return;
        }

        const json = JSON.stringify(window.dependencyAnalysisResults, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dependency-analysis-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification('תוצאות יוצאו בהצלחה', 'success');
        }
    }

    /**
     * Run analysis and display results
     */
    run() {
        const results = this.analyze();
        this.displayResults(results);
        return results;
    }
}

// Create global instance
const dependencyAnalyzer = new DependencyAnalyzer();

// Export globally
window.dependencyAnalyzer = dependencyAnalyzer;

if (window.Logger) {
  window.Logger.info('✅ Dependency Analyzer loaded successfully', { page: 'dependency-analyzer' });
}
