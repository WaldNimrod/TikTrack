#!/usr/bin/env node

/**
 * System File Analyzer - TikTrack
 * ===============================
 * 
 * ניתוח מפורט של קובץ יחיד לזיהוי נקודות אינטגרציה
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

class SystemFileAnalyzer {
    constructor() {
        this.knownSystems = new Set([
            'DataCollectionService', 'CRUDResponseHandler', 'SelectPopulatorService',
            'DefaultValueSetter', 'LinkedItemsService', 'FieldRendererService',
            'StatisticsCalculator', 'AlertConditionRenderer', 'ModalManagerV2',
            'UnifiedCacheManager', 'CacheSyncManager', 'CachePolicyManager',
            'ModalNavigationManager', 'EventHandlerManager', 'PreferencesGroupManager',
            'NotificationSystem', 'Logger', 'HeaderSystem', 'ButtonSystem',
            'ActionsMenuSystem', 'InfoSummarySystem', 'ColorSchemeSystem',
            'UnifiedAppInitializer', 'AlertService', 'TickerService',
            'TradePlanService', 'AccountService', 'EntityDetailsModal',
            'EntityDetailsRenderer', 'EntityDetailsAPI', 'PreferencesCore',
            'PreferencesSystem', 'toggleSection', 'showSuccessNotification',
            'showErrorNotification', 'showWarningNotification', 'showInfoNotification',
            'showFieldError', 'clearValidation', 'loadTableData', 'getPageDataFunctions'
        ]);
    }

    /**
     * Analyze a single file for integration points
     */
    analyzeFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);

        return {
            file: fileName,
            path: filePath,
            imports: this.extractImports(content),
            globalUsage: this.extractGlobalUsage(content),
            functionCalls: this.extractFunctionCalls(content),
            integrationPoints: this.identifyIntegrationPoints(content),
            systemExports: this.extractSystemExports(content),
            metadata: {
                lines: content.split('\n').length,
                size: fs.statSync(filePath).size,
                analyzed: new Date().toISOString()
            }
        };
    }

    /**
     * Extract import/require statements
     */
    extractImports(content) {
        const imports = [];
        
        // ES6 imports: import ... from ...
        const es6ImportPattern = /import\s+(?:[\w\s,{}*]+\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;
        while ((match = es6ImportPattern.exec(content)) !== null) {
            imports.push({
                type: 'ES6',
                source: match[1],
                line: this.getLineNumber(content, match.index)
            });
        }
        
        // CommonJS requires: require('...')
        const requirePattern = /require\(['"]([^'"]+)['"]\)/g;
        while ((match = requirePattern.exec(content)) !== null) {
            imports.push({
                type: 'CommonJS',
                source: match[1],
                line: this.getLineNumber(content, match.index)
            });
        }
        
        return imports;
    }

    /**
     * Extract global window.* usage
     */
    extractGlobalUsage(content) {
        const globals = [];
        
        // Pattern: window.SystemName
        const globalPattern = /window\.(\w+)/g;
        let match;
        
        while ((match = globalPattern.exec(content)) !== null) {
            const globalName = match[1];
            
            if (this.knownSystems.has(globalName)) {
                globals.push({
                    name: globalName,
                    line: this.getLineNumber(content, match.index),
                    context: this.getContext(content, match.index, 50)
                });
            }
        }
        
        return globals;
    }

    /**
     * Extract function calls to known systems
     */
    extractFunctionCalls(content) {
        const calls = [];
        
        // Pattern: window.System.method() or System.method()
        const callPatterns = [
            /window\.(\w+)\.(\w+)\(/g,
            /(\w+Service|\w+Manager|\w+System|ModalManagerV2|UnifiedCacheManager)\.(\w+)\(/g
        ];
        
        callPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const systemName = match[1];
                const methodName = match[2];
                
                if (this.knownSystems.has(systemName)) {
                    calls.push({
                        system: systemName,
                        method: methodName,
                        line: this.getLineNumber(content, match.index),
                        context: this.getContext(content, match.index, 80),
                        isOptional: this.isOptionalCall(content, match.index)
                    });
                }
            }
        });
        
        return calls;
    }

    /**
     * Identify integration points - places where systems interact
     */
    identifyIntegrationPoints(content) {
        const points = [];
        
        // 1. Direct system initialization
        const initPattern = /(?:new\s+)?(\w+Service|\w+Manager|\w+System|ModalManagerV2|UnifiedCacheManager)(?:\(|\.initialize)/g;
        let match;
        while ((match = initPattern.exec(content)) !== null) {
            const systemName = match[1];
            if (this.knownSystems.has(systemName)) {
                points.push({
                    type: 'initialization',
                    system: systemName,
                    line: this.getLineNumber(content, match.index),
                    context: this.getContext(content, match.index, 100)
                });
            }
        }
        
        // 2. System method calls
        const methodCalls = this.extractFunctionCalls(content);
        methodCalls.forEach(call => {
            points.push({
                type: 'method_call',
                system: call.system,
                method: call.method,
                line: call.line,
                optional: call.isOptional
            });
        });
        
        // 3. System property access
        const propPattern = /window\.(\w+)\.(\w+)(?!\s*\()/g;
        while ((match = propPattern.exec(content)) !== null) {
            const systemName = match[1];
            const property = match[2];
            
            if (this.knownSystems.has(systemName)) {
                points.push({
                    type: 'property_access',
                    system: systemName,
                    property: property,
                    line: this.getLineNumber(content, match.index)
                });
            }
        }
        
        // 4. Conditional checks for system availability
        const conditionalPattern = /(?:if\s*\(|&&)\s*(?:typeof\s+)?window\.(\w+)/g;
        while ((match = conditionalPattern.exec(content)) !== null) {
            const systemName = match[1];
            
            if (this.knownSystems.has(systemName)) {
                points.push({
                    type: 'availability_check',
                    system: systemName,
                    line: this.getLineNumber(content, match.index),
                    integrationType: 'Optional'
                });
            }
        }
        
        return points;
    }

    /**
     * Extract what this system exports (makes available)
     */
    extractSystemExports(content) {
        const exports = {
            classes: [],
            functions: [],
            globals: [],
            constants: []
        };
        
        // Class declarations
        const classPattern = /class\s+(\w+)/g;
        let match;
        while ((match = classPattern.exec(content)) !== null) {
            exports.classes.push({
                name: match[1],
                line: this.getLineNumber(content, match.index)
            });
        }
        
        // Function exports to window
        const windowExportPattern = /window\.(\w+)\s*=\s*(?:function|=>|\(|class|new\s+(\w+))/g;
        while ((match = windowExportPattern.exec(content)) !== null) {
            const exportName = match[1];
            const className = match[2] || null;
            
            exports.globals.push({
                name: exportName,
                type: className ? 'Class' : 'Function',
                line: this.getLineNumber(content, match.index)
            });
        }
        
        // Module.exports
        const moduleExportPattern = /module\.exports\s*=\s*\{([^}]+)\}/s;
        const moduleMatch = content.match(moduleExportPattern);
        if (moduleMatch) {
            const exportBlock = moduleMatch[1];
            const exportNames = exportBlock.match(/(\w+):/g);
            if (exportNames) {
                exportNames.forEach(exp => {
                    exports.functions.push({
                        name: exp.replace(':', ''),
                        line: this.getLineNumber(content, moduleMatch.index)
                    });
                });
            }
        }
        
        return exports;
    }

    /**
     * Check if a call is optional (has guards)
     */
    isOptionalCall(content, index) {
        // Look backwards for optional checks
        const beforeIndex = Math.max(0, index - 200);
        const contextBefore = content.substring(beforeIndex, index);
        
        // Check for: window.X && or typeof window.X or window.X?
        const optionalPatterns = [
            /window\.\w+\s*&&/,
            /typeof\s+window\.\w+/,
            /window\.\w+\?\./
        ];
        
        return optionalPatterns.some(pattern => pattern.test(contextBefore));
    }

    /**
     * Get context around a position
     */
    getContext(content, index, length = 100) {
        const start = Math.max(0, index - length);
        const end = Math.min(content.length, index + length);
        return content.substring(start, end).replace(/\n/g, ' ').trim();
    }

    /**
     * Get line number from content and index
     */
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }
}

// Export for use in other scripts
module.exports = SystemFileAnalyzer;

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('Usage: node system-file-analyzer.js <file-path>');
        process.exit(1);
    }
    
    const filePath = args[0];
    const analyzer = new SystemFileAnalyzer();
    
    try {
        const result = analyzer.analyzeFile(filePath);
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}


