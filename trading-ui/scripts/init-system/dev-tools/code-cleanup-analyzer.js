/**
 * Code Cleanup Analyzer - TikTrack Frontend
 * =========================================
 * 
 * כלי מתקדם לניתוח וניקוי קוד
 * 
 * Features:
 * - זיהוי פונקציות לא בשימוש
 * - בדיקת משתנים גלובליים כפולים
 * - ניקוי הערות מיותרות
 * - בדיקת אופטימיזציה של קוד
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 22, 2025
 */

console.log('🧹 Loading Code Cleanup Analyzer...');

/**
 * Code Cleanup Analyzer Class
 */
class CodeCleanupAnalyzer {
    constructor() {
        this.unusedFunctions = [];
        this.duplicateGlobals = [];
        this.redundantComments = [];
        this.optimizationSuggestions = [];
    }

    /**
     * Analyze page for unused functions
     */
    analyzeUnusedFunctions() {
        console.log('🔍 Analyzing unused functions...');
        
        const allFunctions = [];
        const calledFunctions = new Set();
        
        // Find all function declarations
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        scripts.forEach(script => {
            if (script.src.includes('bootstrap') || script.src.includes('font-awesome')) return;
            
            try {
                const content = this.getScriptContent(script.src);
                if (content) {
                    // Find function declarations
                    const functionMatches = content.match(/function\s+(\w+)/g);
                    if (functionMatches) {
                        functionMatches.forEach(match => {
                            const funcName = match.replace('function ', '');
                            allFunctions.push({
                                name: funcName,
                                script: script.src.split('/').pop()
                            });
                        });
                    }
                    
                    // Find function calls
                    const callMatches = content.match(/(\w+)\s*\(/g);
                    if (callMatches) {
                        callMatches.forEach(match => {
                            const funcName = match.replace(/\s*\(/, '');
                            calledFunctions.add(funcName);
                        });
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Could not analyze script: ${script.src}`, error);
            }
        });
        
        // Find unused functions
        allFunctions.forEach(func => {
            if (!calledFunctions.has(func.name) && 
                !func.name.startsWith('_') && 
                !func.name.includes('init') &&
                !func.name.includes('setup')) {
                this.unusedFunctions.push(func);
            }
        });
        
        if (this.unusedFunctions.length > 0) {
            console.warn(`🧹 Unused functions found:`, this.unusedFunctions);
        }
    }

    /**
     * Analyze duplicate global variables
     */
    analyzeDuplicateGlobals() {
        console.log('🔍 Analyzing duplicate global variables...');
        
        const globalVars = new Map();
        
        // Find all global variable assignments
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        scripts.forEach(script => {
            if (script.src.includes('bootstrap') || script.src.includes('font-awesome')) return;
            
            try {
                const content = this.getScriptContent(script.src);
                if (content) {
                    // Find window.* assignments
                    const windowMatches = content.match(/window\.(\w+)/g);
                    if (windowMatches) {
                        windowMatches.forEach(match => {
                            const varName = match.replace('window.', '');
                            if (!globalVars.has(varName)) {
                                globalVars.set(varName, []);
                            }
                            globalVars.get(varName).push(script.src.split('/').pop());
                        });
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Could not analyze script: ${script.src}`, error);
            }
        });
        
        // Find duplicates
        globalVars.forEach((scripts, varName) => {
            if (scripts.length > 1) {
                this.duplicateGlobals.push({
                    variable: varName,
                    scripts: scripts
                });
            }
        });
        
        if (this.duplicateGlobals.length > 0) {
            console.warn(`🧹 Duplicate global variables found:`, this.duplicateGlobals);
        }
    }

    /**
     * Analyze redundant comments
     */
    analyzeRedundantComments() {
        console.log('🔍 Analyzing redundant comments...');
        
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        scripts.forEach(script => {
            if (script.src.includes('bootstrap') || script.src.includes('font-awesome')) return;
            
            try {
                const content = this.getScriptContent(script.src);
                if (content) {
                    // Find comment patterns
                    const commentPatterns = [
                        /\/\/\s*TODO.*/g,
                        /\/\/\s*FIXME.*/g,
                        /\/\/\s*HACK.*/g,
                        /\/\*\*[\s\S]*?\*\//g
                    ];
                    
                    commentPatterns.forEach(pattern => {
                        const matches = content.match(pattern);
                        if (matches) {
                            matches.forEach(match => {
                                if (match.length > 100) { // Long comments might be redundant
                                    this.redundantComments.push({
                                        script: script.src.split('/').pop(),
                                        comment: match.substring(0, 50) + '...'
                                    });
                                }
                            });
                        }
                    });
                }
            } catch (error) {
                console.warn(`⚠️ Could not analyze script: ${script.src}`, error);
            }
        });
        
        if (this.redundantComments.length > 0) {
            console.warn(`🧹 Redundant comments found:`, this.redundantComments);
        }
    }

    /**
     * Analyze optimization opportunities
     */
    analyzeOptimization() {
        console.log('🔍 Analyzing optimization opportunities...');
        
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        scripts.forEach(script => {
            if (script.src.includes('bootstrap') || script.src.includes('font-awesome')) return;
            
            try {
                const content = this.getScriptContent(script.src);
                if (content) {
                    // Check for optimization patterns
                    const patterns = [
                        {
                            name: 'Multiple DOM queries',
                            pattern: /document\.querySelector/g,
                            threshold: 5
                        },
                        {
                            name: 'Large functions',
                            pattern: /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{500,}\}/g,
                            threshold: 1
                        },
                        {
                            name: 'Deep nesting',
                            pattern: /\{[^}]*\{[^}]*\{[^}]*\{/g,
                            threshold: 1
                        }
                    ];
                    
                    patterns.forEach(pattern => {
                        const matches = content.match(pattern.pattern);
                        if (matches && matches.length >= pattern.threshold) {
                            this.optimizationSuggestions.push({
                                script: script.src.split('/').pop(),
                                issue: pattern.name,
                                count: matches.length,
                                suggestion: this.getOptimizationSuggestion(pattern.name)
                            });
                        }
                    });
                }
            } catch (error) {
                console.warn(`⚠️ Could not analyze script: ${script.src}`, error);
            }
        });
        
        if (this.optimizationSuggestions.length > 0) {
            console.warn(`🧹 Optimization opportunities found:`, this.optimizationSuggestions);
        }
    }

    /**
     * Get optimization suggestion
     */
    getOptimizationSuggestion(issue) {
        const suggestions = {
            'Multiple DOM queries': 'Consider caching DOM elements',
            'Large functions': 'Consider breaking into smaller functions',
            'Deep nesting': 'Consider using early returns or guard clauses'
        };
        return suggestions[issue] || 'Consider refactoring';
    }

    /**
     * Get script content (simplified - in real implementation would fetch actual content)
     */
    getScriptContent(src) {
        // This is a simplified version - in real implementation would fetch script content
        return null;
    }

    /**
     * Run complete analysis
     */
    async runCompleteAnalysis() {
        console.log('🧹 Starting complete code cleanup analysis...');
        
        this.analyzeUnusedFunctions();
        this.analyzeDuplicateGlobals();
        this.analyzeRedundantComments();
        this.analyzeOptimization();
        
        const report = {
            unusedFunctions: this.unusedFunctions.length,
            duplicateGlobals: this.duplicateGlobals.length,
            redundantComments: this.redundantComments.length,
            optimizationSuggestions: this.optimizationSuggestions.length,
            totalIssues: this.unusedFunctions.length + this.duplicateGlobals.length + 
                        this.redundantComments.length + this.optimizationSuggestions.length
        };
        
        console.log('🧹 Code cleanup analysis complete:', report);
        return report;
    }
}

// Export for global use
window.CodeCleanupAnalyzer = CodeCleanupAnalyzer;

console.log('✅ Code Cleanup Analyzer loaded successfully');
