/**
 * JS Scanner - TikTrack Frontend
 * ==============================
 * 
 * Script for scanning JavaScript files and extracting function information
 * 
 * Features:
 * - Parse JS files for functions
 * - Extract function annotations and documentation
 * - Parse function parameters and return values
 * - Generate function mapping data
 * 
 * Architecture:
 * - File content parsing
 * - Function pattern matching
 * - Annotation extraction
 * - Data structure generation
 * 
 * Dependencies:
 * - None (standalone scanner)
 * 
 * @author TikTrack Development Team
 * @version 1.0
 * @lastUpdated August 26, 2025
 * 
 * INDEX:
 * ======
 * 
 * CLASSES:
 * - JsScanner: Main scanner class for parsing JS files
 * 
 * METHODS (JsScanner):
 * - scanAllJsFiles(): Scan all JS files and extract function information
 * - getJsFilesList(): Get list of JS files to scan
 * - scanJsFile(): Scan a single JS file
 * - getFileContent(): Get file content from server
 * - extractFunctions(): Extract functions from file content
 * - isValidFunctionName(): Check if function name is valid
 * - extractAnnotations(): Extract annotations above function
 * - extractFunctionCode(): Extract function code (first 10 lines)
 * - parseParameters(): Parse function parameters
 * - extractReturnValue(): Extract return value from annotations
 * - extractDescription(): Extract function description from annotations
 * - generatePageMapping(): Generate page mapping based on function analysis
 * - getFunctionDetails(): Get function details by name and file
 * - searchFunctions(): Search functions by name or description
 * 
 * GLOBAL FUNCTIONS:
 * - scanJsFiles(): Scan all JS files
 * - getFunctionDetails(): Get function details
 * - searchFunctions(): Search functions
 */

/**
 * סריקת קבצי JS וחילוץ פונקציות
 * מנתח קבצי JS ומחלץ מידע על פונקציות
 */

class JsScanner {
    constructor() {
        this.functionsData = {};
        this.pageMapping = {};
    }

    /**
     * Scan all JS files and extract function information
     */
    async scanAllJsFiles() {
      

        try {
            // Get list of JS files
            const jsFiles = await this.getJsFilesList();

            // Scan each file
            for (const file of jsFiles) {
                await this.scanJsFile(file);
            }

            // Generate page mapping
            this.generatePageMapping();

          
            return {
                functions: this.functionsData,
                pageMapping: this.pageMapping
            };

        } catch (error) {
            console.error('❌ Error scanning JS files:', error);
            throw error;
        }
    }

    /**
     * Get list of JS files to scan
     */
    async getJsFilesList() {
        try {
            const response = await fetch('/api/js-map/files-list');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('⚠️ Using fallback JS files list');
        }

        // Fallback list
        return [
            'main.js', 'header-system.js', 'ui-utils.js',
            'translation-utils.js', 'data-utils.js', 'table-mappings.js',
            'date-utils.js', 'tables.js', 'linked-items.js', 'page-utils.js',
            'alerts.js', 'active-alerts-component.js', 'trades.js', 'trade_plans.js',
            'research.js', 'executions.js', 'tickers.js', 'ticker-service.js',
            'accounts.js', 'cash_flows.js', 'notes.js', 'preferences.js',
            'database.js', 'db-extradata.js', 'constraint-manager.js',
            'tests.js', 'currencies.js', 'auth.js'
        ];
    }

    /**
     * Scan a single JS file
     */
    async scanJsFile(filename) {
        try {
          

            // Get file content
            const content = await this.getFileContent(filename);
            if (!content) {
                console.warn(`⚠️ Could not read file: ${filename}`);
                return;
            }

            // Extract functions from content
            const functions = this.extractFunctions(content, filename);

            // Store functions data
                          this.functionsData[filename] = functions;
  
              console.log(`✅ Extracted ${functions.length} functions from ${filename}`);          

        } catch (error) {
            console.error(`❌ Error scanning file ${filename}:`, error);
            this.functionsData[filename] = [];
        }
    }

    /**
     * Get file content
     */
    async getFileContent(filename) {
        try {
            const response = await fetch(`/api/js-map/file-content?file=${encodeURIComponent(filename)}`);
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn(`⚠️ Could not fetch file content for ${filename}`);
        }

        return null;
    }

    /**
     * Extract functions from file content
     */
    extractFunctions(content, filename) {
        const functions = [];

        // Function patterns to match
        const patterns = [
            // Function declaration: function name(params) { ... }
            /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{/g,
            // Arrow function: const name = (params) => { ... }
            /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(([^)]*)\)\s*=>/g,
            // Method definition: methodName(params) { ... }
            /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{/g,
            // Class method: methodName(params) { ... }
            /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{/g
        ];

        let match;
        let lineNumber = 1;
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check each pattern
            for (const pattern of patterns) {
                pattern.lastIndex = 0; // Reset regex state

                while ((match = pattern.exec(line)) !== null) {
                    const functionName = match[1];
                    const params = match[2] || '';

                    // Skip if it's not a valid function name
                    if (!this.isValidFunctionName(functionName)) {
                        continue;
                    }

                    // Get function annotations (comments above the function)
                    const annotations = this.extractAnnotations(lines, i);

                    // Get function code (first 10 lines)
                    const code = this.extractFunctionCode(lines, i);

                    // Parse parameters and return value
                    const parsedParams = this.parseParameters(params);
                    const returnValue = this.extractReturnValue(annotations);

                    // Create function object
                    const func = {
                        name: functionName,
                        description: this.extractDescription(annotations),
                        params: parsedParams,
                        returns: returnValue,
                        annotations: annotations,
                        code: code,
                        line: lineNumber,
                        file: filename
                    };

                    functions.push(func);
                }
            }

            lineNumber++;
        }

        return functions;
    }

    /**
     * Check if function name is valid
     */
    isValidFunctionName(name) {
        // Skip common non-function patterns
        const invalidPatterns = [
            /^if$/, /^else$/, /^for$/, /^while$/, /^switch$/, /^case$/,
            /^try$/, /^catch$/, /^finally$/, /^return$/, /^break$/, /^continue$/,
            /^class$/, /^extends$/, /^super$/, /^new$/, /^delete$/, /^typeof$/,
            /^instanceof$/, /^in$/, /^of$/, /^import$/, /^export$/, /^default$/,
            /^async$/, /^await$/, /^yield$/, /^get$/, /^set$/, /^static$/
        ];

        return !invalidPatterns.some(pattern => pattern.test(name));
    }

    /**
     * Extract annotations (comments) above function
     */
    extractAnnotations(lines, functionLineIndex) {
        const annotations = [];
        let i = functionLineIndex - 1;

        // Look for comments above the function
        while (i >= 0) {
            const line = lines[i].trim();

            // Stop if we hit a non-comment line
            if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
                break;
            }

            // Add comment to annotations
            if (line.startsWith('//')) {
                annotations.unshift(line.substring(2).trim());
            } else if (line.startsWith('/*') || line.startsWith('*')) {
                annotations.unshift(line.replace(/^\/?\*+\/?/, '').trim());
            }

            i--;
        }

        return annotations.join('\n');
    }

    /**
     * Extract function code (first 10 lines)
     */
    extractFunctionCode(lines, functionLineIndex) {
        const code = [];
        let braceCount = 0;
        let started = false;
        let lineCount = 0;

        for (let i = functionLineIndex; i < lines.length && lineCount < 10; i++) {
            const line = lines[i];

            if (!started) {
                started = true;
            }

            code.push(line);
            lineCount++;

            // Count braces to track function scope
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }

            // Stop if we've closed the function
            if (started && braceCount === 0) {
                break;
            }
        }

        return code.join('\n');
    }

    /**
     * Parse function parameters
     */
    parseParameters(paramsString) {
        if (!paramsString.trim()) {
            return 'אין פרמטרים';
        }

        const params = paramsString.split(',').map(param => {
            return param.trim().split('=')[0]; // Remove default values
        });

        return params.join(', ');
    }

    /**
     * Extract return value from annotations
     */
    extractReturnValue(annotations) {
        const returnPatterns = [
            /@returns?\s+(.+)/i,
            /@return\s+(.+)/i,
            /returns?\s+(.+)/i,
            /return\s+(.+)/i
        ];

        for (const pattern of returnPatterns) {
            const match = annotations.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return 'אין ערך מוחזר';
    }

    /**
     * Extract function description from annotations
     */
    extractDescription(annotations) {
        // Look for description in annotations
        const lines = annotations.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip empty lines and special annotations
            if (!trimmed || trimmed.startsWith('@') || trimmed.startsWith('*')) {
                continue;
            }

            // Return first non-empty description line
            return trimmed;
        }

        return 'אין תיאור';
    }

    /**
     * Generate page mapping based on function analysis
     */
    generatePageMapping() {
        // Define known page to JS file mappings
        const pageMappings = {
            'index.html': ['main.js', 'header-system.js'],
            'trades.html': ['trades.js', 'header-system.js', 'ui-utils.js'],
            'trade_plans.html': ['trade_plans.js', 'header-system.js', 'ui-utils.js'],
            'research.html': ['research.js', 'header-system.js', 'ui-utils.js'],
            'alerts.html': ['alerts.js', 'active-alerts-component.js', 'header-system.js'],
            'executions.html': ['executions.js', 'header-system.js', 'ui-utils.js'],
            'tickers.html': ['tickers.js', 'ticker-service.js', 'header-system.js'],
            'accounts.html': ['accounts.js', 'header-system.js', 'ui-utils.js'],
            'cash_flows.html': ['cash_flows.js', 'header-system.js', 'ui-utils.js'],
            'notes.html': ['notes.js', 'header-system.js', 'ui-utils.js'],
            'preferences.html': ['preferences.js', 'header-system.js', 'ui-utils.js'],
            'db_display.html': ['database.js', 'db-extradata.js', 'header-system.js'],
            'db_extradata.html': ['db-extradata.js', 'header-system.js'],
            'constraints.html': ['constraint-manager.js', 'header-system.js'],
            'tests.html': ['tests.js', 'header-system.js'],
            'styles.html': ['header-system.js']
        };

        this.pageMapping = pageMappings;
    }

    /**
     * Get function details by name and file
     */
    getFunctionDetails(filename, functionName) {
        if (!this.functionsData[filename]) {
            return null;
        }

        return this.functionsData[filename].find(func => func.name === functionName) || null;
    }

    /**
     * Search functions by name or description
     */
    searchFunctions(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        Object.keys(this.functionsData).forEach(filename => {
            this.functionsData[filename].forEach(func => {
                if (func.name.toLowerCase().includes(lowerQuery) ||
                    func.description.toLowerCase().includes(lowerQuery) ||
                    func.annotations.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        ...func,
                        file: filename
                    });
                }
            });
        });

        return results;
    }

    /**
     * Scan function calls across all JS files
     */
    async scanFunctionCalls() {
      

        const functionCallCounts = {};
        const functionCallDetails = {};

        try {
            // Get list of JS files
            const jsFiles = await this.getJsFilesList();

            // Initialize counts
            jsFiles.forEach(file => {
                functionCallCounts[file] = 0;
                functionCallDetails[file] = [];
            });

            // Scan each file for function calls
            for (const file of jsFiles) {
                const content = await this.getFileContent(file);
                if (content) {
                    const calls = this.extractFunctionCalls(content, file);
                    functionCallCounts[file] = calls.length;
                    functionCallDetails[file] = calls;
                }
            }

            // Store details globally for access by modal
            window.jsScanner.functionCallDetails = functionCallDetails;

          
            return {
                counts: functionCallCounts,
                details: functionCallDetails
            };

        } catch (error) {
            console.error('❌ Error scanning function calls:', error);
            return this.getFallbackFunctionCalls();
        }
    }

    /**
     * Extract function calls from file content
     */
    extractFunctionCalls(content, filename) {
        const calls = [];
        const lines = content.split('\n');

        // Patterns for function calls
        const callPatterns = [
            // Direct function calls: functionName()
            /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
            // Method calls: object.method()
            /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
            // Window calls: window.functionName()
            /window\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
            // Document calls: document.functionName()
            /document\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g
        ];

        let lineNumber = 1;

        for (const line of lines) {
            // Skip comments and strings
            if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
                lineNumber++;
                continue;
            }

            // Check each pattern
            for (const pattern of callPatterns) {
                pattern.lastIndex = 0; // Reset regex state

                let match;
                while ((match = pattern.exec(line)) !== null) {
                    let functionName = match[1];

                    // For method calls, use the method name
                    if (match[2]) {
                        functionName = match[2];
                    }

                    // Skip invalid function names
                    if (!this.isValidFunctionName(functionName)) {
                        continue;
                    }

                    // Skip common built-in functions
                    if (this.isBuiltInFunction(functionName)) {
                        continue;
                    }

                    calls.push({
                        functionName: functionName,
                        line: lineNumber,
                        file: filename,
                        context: line.trim().substring(0, 100) + '...'
                    });
                }
            }

            lineNumber++;
        }

        return calls;
    }

    /**
     * Check if function name is a built-in function
     */
    isBuiltInFunction(name) {
        const builtIns = [
            'console', 'log', 'warn', 'error', 'info', 'debug',
            'alert', 'confirm', 'prompt',
            'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
            'parseInt', 'parseFloat', 'isNaN', 'isFinite',
            'encodeURI', 'decodeURI', 'encodeURIComponent', 'decodeURIComponent',
            'escape', 'unescape',
            'JSON', 'parse', 'stringify',
            'Math', 'floor', 'ceil', 'round', 'abs', 'max', 'min', 'random',
            'Date', 'getTime', 'getDate', 'getMonth', 'getFullYear',
            'String', 'Number', 'Boolean', 'Array', 'Object', 'Function',
            'RegExp', 'Error', 'TypeError', 'ReferenceError',
            'fetch', 'XMLHttpRequest', 'Promise', 'async', 'await',
            'localStorage', 'sessionStorage', 'getItem', 'setItem', 'removeItem',
            'addEventListener', 'removeEventListener', 'dispatchEvent',
            'querySelector', 'querySelectorAll', 'getElementById', 'getElementsByClassName',
            'appendChild', 'removeChild', 'insertBefore', 'replaceChild',
            'setAttribute', 'getAttribute', 'removeAttribute',
            'classList', 'add', 'remove', 'toggle', 'contains',
            'style', 'innerHTML', 'textContent', 'value'
        ];

        return builtIns.includes(name);
    }

    /**
     * Get fallback function call data
     */
    getFallbackFunctionCalls() {
      

        const sampleFunctionCalls = {
            'header-system.js': 45,

            'ui-utils.js': 32,
            'main.js': 15,
            'trades.js': 28,
            'alerts.js': 22,
            'tickers.js': 25,
            'accounts.js': 18,
            'cash_flows.js': 16,
            'notes.js': 14,
            'preferences.js': 12,
            'database.js': 20,
            'db-extradata.js': 15,
            'constraint-manager.js': 8,
            'tests.js': 6,

            'currencies.js': 8,
            'auth.js': 5,
            'js-map.js': 3,
            'js-scanner.js': 2,
            'translation-utils.js': 12,
            'data-utils.js': 18,
            'table-mappings.js': 14,
            'date-utils.js': 16,
            'tables.js': 20,
            'linked-items.js': 12,
            'page-utils.js': 15,
            'active-alerts-component.js': 8,
            'trade_plans.js': 18,
            'research.js': 16,
            'executions.js': 14,
            'ticker-service.js': 12,
            'console-cleanup.js': 3
        };

        return {
            counts: sampleFunctionCalls,
            details: {}
        };
    }
}

// Global instance
window.jsScanner = new JsScanner();

// Global functions for external use
function scanJsFiles() {
    return window.jsScanner.scanAllJsFiles();
}

function getFunctionDetails(filename, functionName) {
    return window.jsScanner.getFunctionDetails(filename, functionName);
}

function searchFunctions(query) {
    return window.jsScanner.searchFunctions(query);
}
