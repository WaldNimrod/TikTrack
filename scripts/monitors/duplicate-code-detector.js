#!/usr/bin/env node

/**
 * Duplicate Code Detector
 * Scans JavaScript files for duplicate functions and similar patterns
 * 
 * Usage: node scripts/monitors/duplicate-code-detector.js
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    scriptsDir: path.resolve(process.cwd(), 'trading-ui', 'scripts'),
    outputDir: 'reports',
    corePages: [
        'index.js',
        'trades.js', 
        'executions.js',
        'alerts.js',
        'trade_plans.js',
        'cash_flows.js',
        'research.js',
        'notes.js',
        'preferences-page.js',
        'tickers.js',
        'trading_accounts.js',
        'database.js'
    ],
    minSimilarityThreshold: 0.8, // 80% similarity
    minFunctionLength: 10 // minimum lines to consider
};

class DuplicateCodeDetector {
    constructor() {
        this.functions = new Map(); // functionName -> {file, content, lines}
        this.similarFunctions = [];
        this.globalFunctions = new Map(); // global functions that might be duplicated
    }

    /**
     * Extract functions from a JavaScript file
     */
    extractFunctions(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const functions = [];
            
            // Extract function declarations
            const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)|(\w+)\s*:\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;
            
            let match;
            while ((match = functionRegex.exec(content)) !== null) {
                const functionName = match[1] || match[2] || match[3];
                if (functionName && !this.isSystemFunction(functionName)) {
                    const functionInfo = this.extractFunctionInfo(content, match.index, functionName);
                    if (functionInfo && functionInfo.lines.length >= CONFIG.minFunctionLength) {
                        functions.push({
                            name: functionName,
                            file: path.basename(filePath),
                            content: functionInfo.content,
                            lines: functionInfo.lines,
                            startLine: functionInfo.startLine
                        });
                    }
                }
            }
            
            return functions;
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error.message);
            return [];
        }
    }

    /**
     * Extract function content and line numbers
     */
    extractFunctionInfo(content, startIndex, functionName) {
        try {
            const lines = content.substring(0, startIndex).split('\n');
            const startLine = lines.length;
            
            // Find function end (simplified approach)
            const functionStart = content.indexOf(functionName, startIndex);
            if (functionStart === -1) return null;
            
            // Look for opening brace
            let braceIndex = content.indexOf('{', functionStart);
            if (braceIndex === -1) return null;
            
            // Count braces to find function end
            let braceCount = 1;
            let currentIndex = braceIndex + 1;
            
            while (braceCount > 0 && currentIndex < content.length) {
                const char = content[currentIndex];
                if (char === '{') braceCount++;
                else if (char === '}') braceCount--;
                currentIndex++;
            }
            
            if (braceCount === 0) {
                const functionContent = content.substring(functionStart, currentIndex);
                const functionLines = functionContent.split('\n');
                
                return {
                    content: functionContent,
                    lines: functionLines,
                    startLine: startLine
                };
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if function is a system function (should be ignored)
     */
    isSystemFunction(functionName) {
        const systemFunctions = [
            'console', 'alert', 'confirm', 'prompt',
            'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
            'fetch', 'XMLHttpRequest', 'addEventListener', 'removeEventListener',
            'querySelector', 'querySelectorAll', 'getElementById', 'getElementsByClassName',
            'createElement', 'appendChild', 'removeChild', 'insertBefore',
            'JSON', 'parse', 'stringify', 'Math', 'Date', 'Array', 'Object',
            'window', 'document', 'location', 'history', 'navigator'
        ];
        
        return systemFunctions.includes(functionName) || 
               functionName.startsWith('_') || 
               functionName.includes('$') ||
               functionName.length < 3;
    }

    /**
     * Calculate similarity between two functions
     */
    calculateSimilarity(func1, func2) {
        // Normalize function content (remove whitespace, comments, variable names)
        const normalize = (content) => {
            return content
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
                .replace(/\/\/.*$/gm, '') // Remove line comments
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/\b\w+\b/g, 'VAR') // Replace variable names
                .replace(/\d+/g, 'NUM') // Replace numbers
                .replace(/['"]/g, 'STR') // Replace strings
                .trim();
        };
        
        const norm1 = normalize(func1.content);
        const norm2 = normalize(func2.content);
        
        // Simple similarity calculation (Levenshtein distance based)
        const maxLength = Math.max(norm1.length, norm2.length);
        if (maxLength === 0) return 0;
        
        const distance = this.levenshteinDistance(norm1, norm2);
        return 1 - (distance / maxLength);
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Find similar functions across all files
     */
    findSimilarFunctions() {
        const allFunctions = Array.from(this.functions.values());
        
        for (let i = 0; i < allFunctions.length; i++) {
            for (let j = i + 1; j < allFunctions.length; j++) {
                const func1 = allFunctions[i];
                const func2 = allFunctions[j];
                
                // Skip if same file
                if (func1.file === func2.file) continue;
                
                const similarity = this.calculateSimilarity(func1, func2);
                
                if (similarity >= CONFIG.minSimilarityThreshold) {
                    this.similarFunctions.push({
                        func1: func1,
                        func2: func2,
                        similarity: similarity,
                        type: this.classifySimilarity(func1, func2, similarity)
                    });
                }
            }
        }
        
        // Sort by similarity (highest first)
        this.similarFunctions.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Classify the type of similarity
     */
    classifySimilarity(func1, func2, similarity) {
        if (similarity >= 0.95) return 'EXACT_DUPLICATE';
        if (similarity >= 0.9) return 'NEAR_DUPLICATE';
        if (similarity >= 0.8) return 'SIMILAR_PATTERN';
        return 'POTENTIAL_DUPLICATE';
    }

    /**
     * Identify functions that should use global systems
     */
    identifyGlobalSystemCandidates() {
        const globalSystemPatterns = {
            'notification': ['showNotification', 'showError', 'showSuccess', 'showInfo'],
            'logger': ['log', 'info', 'warn', 'error', 'debug'],
            'cache': ['get', 'set', 'clear', 'has'],
            'api': ['fetch', 'get', 'post', 'put', 'delete'],
            'ui': ['render', 'update', 'refresh', 'toggle', 'show', 'hide'],
            'validation': ['validate', 'check', 'verify', 'isValid'],
            'format': ['format', 'parse', 'convert', 'transform']
        };
        
        const candidates = [];
        
        for (const [category, patterns] of Object.entries(globalSystemPatterns)) {
            for (const func of this.functions.values()) {
                for (const pattern of patterns) {
                    if (func.name.toLowerCase().includes(pattern.toLowerCase())) {
                        candidates.push({
                            function: func,
                            category: category,
                            pattern: pattern,
                            suggestion: `Consider using global ${category} system instead`
                        });
                    }
                }
            }
        }
        
        return candidates;
    }

    /**
     * Generate report
     */
    generateReport() {
        const timestamp = Date.now();
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFunctions: this.functions.size,
                similarFunctions: this.similarFunctions.length,
                exactDuplicates: this.similarFunctions.filter(s => s.type === 'EXACT_DUPLICATE').length,
                nearDuplicates: this.similarFunctions.filter(s => s.type === 'NEAR_DUPLICATE').length,
                similarPatterns: this.similarFunctions.filter(s => s.type === 'SIMILAR_PATTERN').length
            },
            similarFunctions: this.similarFunctions,
            globalSystemCandidates: this.identifyGlobalSystemCandidates(),
            recommendations: this.generateRecommendations()
        };

        // Save JSON report
        const jsonPath = path.join(CONFIG.outputDir, `duplicate-code-${timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

        // Generate Markdown report
        const markdownPath = path.join(CONFIG.outputDir, `duplicate-code-${timestamp}.md`);
        const markdown = this.generateMarkdownReport(reportData);
        fs.writeFileSync(markdownPath, markdown);

        console.log(`\n📊 Duplicate Code Detection Report Generated:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`   Markdown: ${markdownPath}`);
        console.log(`\n📈 Summary:`);
        console.log(`   Total Functions: ${reportData.summary.totalFunctions}`);
        console.log(`   Similar Functions: ${reportData.summary.similarFunctions}`);
        console.log(`   Exact Duplicates: ${reportData.summary.exactDuplicates}`);
        console.log(`   Near Duplicates: ${reportData.summary.nearDuplicates}`);
        console.log(`   Similar Patterns: ${reportData.summary.similarPatterns}`);

        return reportData;
    }

    /**
     * Generate recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Group by file pairs
        const filePairs = new Map();
        for (const similar of this.similarFunctions) {
            const key = `${similar.func1.file}-${similar.func2.file}`;
            if (!filePairs.has(key)) {
                filePairs.set(key, []);
            }
            filePairs.get(key).push(similar);
        }
        
        // Generate recommendations for each file pair
        for (const [filePair, similarities] of filePairs) {
            const [file1, file2] = filePair.split('-');
            const exactDuplicates = similarities.filter(s => s.type === 'EXACT_DUPLICATE');
            
            if (exactDuplicates.length > 0) {
                recommendations.push({
                    type: 'CRITICAL',
                    title: `Exact Duplicates Found`,
                    description: `${exactDuplicates.length} exact duplicate functions between ${file1} and ${file2}`,
                    action: `Move duplicate functions to a shared utility file`,
                    functions: exactDuplicates.map(s => ({
                        name: s.func1.name,
                        similarity: s.similarity
                    }))
                });
            }
        }
        
        return recommendations;
    }

    /**
     * Generate Markdown report
     */
    generateMarkdownReport(data) {
        let markdown = `# Duplicate Code Detection Report\n\n`;
        markdown += `**Generated**: ${new Date(data.timestamp).toLocaleString()}\n\n`;
        markdown += `---\n\n`;
        
        markdown += `## Summary\n\n`;
        markdown += `- **Total Functions**: ${data.summary.totalFunctions}\n`;
        markdown += `- **Similar Functions**: ${data.summary.similarFunctions}\n`;
        markdown += `- **Exact Duplicates**: ${data.summary.exactDuplicates}\n`;
        markdown += `- **Near Duplicates**: ${data.summary.nearDuplicates}\n`;
        markdown += `- **Similar Patterns**: ${data.summary.similarPatterns}\n\n`;
        
        if (data.similarFunctions.length > 0) {
            markdown += `## Similar Functions\n\n`;
            
            for (const similar of data.similarFunctions.slice(0, 20)) { // Show top 20
                markdown += `### ${similar.func1.name} (${similar.similarity.toFixed(2)} similarity)\n\n`;
                markdown += `- **File 1**: ${similar.func1.file} (line ${similar.func1.startLine})\n`;
                markdown += `- **File 2**: ${similar.func2.file} (line ${similar.func2.startLine})\n`;
                markdown += `- **Type**: ${similar.type}\n`;
                markdown += `- **Similarity**: ${(similar.similarity * 100).toFixed(1)}%\n\n`;
            }
        }
        
        if (data.globalSystemCandidates.length > 0) {
            markdown += `## Global System Candidates\n\n`;
            markdown += `Functions that might benefit from using global systems:\n\n`;
            
            for (const candidate of data.globalSystemCandidates.slice(0, 10)) {
                markdown += `- **${candidate.function.name}** (${candidate.function.file})\n`;
                markdown += `  - Category: ${candidate.category}\n`;
                markdown += `  - Suggestion: ${candidate.suggestion}\n\n`;
            }
        }
        
        if (data.recommendations.length > 0) {
            markdown += `## Recommendations\n\n`;
            
            for (const rec of data.recommendations) {
                markdown += `### ${rec.title}\n\n`;
                markdown += `**Type**: ${rec.type}\n\n`;
                markdown += `**Description**: ${rec.description}\n\n`;
                markdown += `**Action**: ${rec.action}\n\n`;
                
                if (rec.functions) {
                    markdown += `**Functions**:\n`;
                    for (const func of rec.functions) {
                        markdown += `- ${func.name} (${(func.similarity * 100).toFixed(1)}% similarity)\n`;
                    }
                    markdown += `\n`;
                }
            }
        }
        
        return markdown;
    }

    /**
     * Run the detection process
     */
    async run() {
        console.log('🔍 Starting Duplicate Code Detection...\n');
        
        // Extract functions from all core pages
        for (const fileName of CONFIG.corePages) {
            const filePath = path.join(CONFIG.scriptsDir, fileName);
            if (fs.existsSync(filePath)) {
                console.log(`📄 Processing ${fileName}...`);
                const functions = this.extractFunctions(filePath);
                
                for (const func of functions) {
                    this.functions.set(`${func.file}:${func.name}`, func);
                }
                
                console.log(`   Found ${functions.length} functions`);
            } else {
                console.log(`⚠️  File not found: ${fileName}`);
            }
        }
        
        console.log(`\n📊 Total functions found: ${this.functions.size}`);
        
        // Find similar functions
        console.log('\n🔍 Analyzing function similarities...');
        this.findSimilarFunctions();
        
        // Generate report
        console.log('\n📝 Generating report...');
        const report = this.generateReport();
        
        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const detector = new DuplicateCodeDetector();
    detector.run().catch(console.error);
}

module.exports = DuplicateCodeDetector;
