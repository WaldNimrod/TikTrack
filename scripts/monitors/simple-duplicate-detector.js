#!/usr/bin/env node

/**
 * Simple Duplicate Detector - Quick Test Version
 * Tests the duplicate detection system with limited scope
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    scriptsDir: 'trading-ui/scripts',
    outputDir: 'reports',
    testPages: ['index.js', 'trades.js', 'executions.js'] // Only 3 pages for testing
};

class SimpleDuplicateDetector {
    constructor() {
        this.functions = new Map();
        this.duplicates = [];
    }

    /**
     * Extract functions from a JavaScript file (simplified)
     */
    extractFunctions(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const functions = [];
            
            // Simple function extraction
            const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
            let match;
            
            while ((match = functionRegex.exec(content)) !== null) {
                const functionName = match[1];
                if (this.isValidFunction(functionName)) {
                    functions.push({
                        name: functionName,
                        file: path.basename(filePath),
                        content: this.extractFunctionContent(content, match.index)
                    });
                }
            }
            
            return functions;
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error.message);
            return [];
        }
    }

    /**
     * Extract function content (simplified)
     */
    extractFunctionContent(content, startIndex) {
        try {
            let braceIndex = content.indexOf('{', startIndex);
            if (braceIndex === -1) return '';
            
            let braceCount = 1;
            let currentIndex = braceIndex + 1;
            
            while (braceCount > 0 && currentIndex < content.length) {
                const char = content[currentIndex];
                if (char === '{') braceCount++;
                else if (char === '}') braceCount--;
                currentIndex++;
            }
            
            if (braceCount === 0) {
                return content.substring(startIndex, currentIndex);
            }
            
            return '';
        } catch (error) {
            return '';
        }
    }

    /**
     * Check if function is valid
     */
    isValidFunction(functionName) {
        const systemFunctions = [
            'console', 'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval',
            'clearTimeout', 'clearInterval', 'fetch', 'XMLHttpRequest',
            'addEventListener', 'removeEventListener', 'querySelector', 'querySelectorAll',
            'getElementById', 'getElementsByClassName', 'createElement', 'appendChild',
            'removeChild', 'insertBefore', 'JSON', 'parse', 'stringify', 'Math',
            'Date', 'Array', 'Object', 'window', 'document', 'location', 'history'
        ];
        
        return !systemFunctions.includes(functionName) && 
               !functionName.startsWith('_') && 
               !functionName.includes('$') &&
               functionName.length >= 3 &&
               !functionName.match(/^\d/);
    }

    /**
     * Calculate simple similarity between functions
     */
    calculateSimilarity(func1, func2) {
        // Name similarity
        const nameSimilarity = this.calculateNameSimilarity(func1.name, func2.name);
        
        // Content similarity (simplified)
        const contentSimilarity = this.calculateContentSimilarity(func1.content, func2.content);
        
        // Weighted average
        return (nameSimilarity * 0.4) + (contentSimilarity * 0.6);
    }

    /**
     * Calculate name similarity
     */
    calculateNameSimilarity(name1, name2) {
        const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const norm1 = normalize(name1);
        const norm2 = normalize(name2);
        
        if (norm1 === norm2) return 1.0;
        
        // Check for common patterns
        const patterns = ['validate', 'format', 'load', 'get', 'set', 'show', 'hide', 'update', 'refresh'];
        for (const pattern of patterns) {
            if (norm1.includes(pattern) && norm2.includes(pattern)) {
                return 0.8;
            }
        }
        
        return 0.0;
    }

    /**
     * Calculate content similarity (simplified)
     */
    calculateContentSimilarity(content1, content2) {
        const normalize = (content) => {
            return content
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\/\/.*$/gm, '')
                .replace(/\s+/g, ' ')
                .replace(/\b\w+\b/g, 'VAR')
                .replace(/\d+/g, 'NUM')
                .replace(/['"]/g, 'STR')
                .toLowerCase()
                .trim();
        };
        
        const norm1 = normalize(content1);
        const norm2 = normalize(content2);
        
        if (norm1 === norm2) return 1.0;
        
        const maxLength = Math.max(norm1.length, norm2.length);
        if (maxLength === 0) return 0;
        
        // Simple similarity based on common substrings
        let commonLength = 0;
        const minLength = Math.min(norm1.length, norm2.length);
        
        for (let i = 0; i < minLength; i++) {
            if (norm1[i] === norm2[i]) {
                commonLength++;
            }
        }
        
        return commonLength / maxLength;
    }

    /**
     * Detect duplicates
     */
    detectDuplicates() {
        const allFunctions = Array.from(this.functions.values());
        
        for (let i = 0; i < allFunctions.length; i++) {
            for (let j = i + 1; j < allFunctions.length; j++) {
                const func1 = allFunctions[i];
                const func2 = allFunctions[j];
                
                // Skip if same file
                if (func1.file === func2.file) continue;
                
                const similarity = this.calculateSimilarity(func1, func2);
                
                if (similarity >= 0.7) { // 70% similarity threshold
                    this.duplicates.push({
                        func1: func1,
                        func2: func2,
                        similarity: similarity,
                        type: similarity >= 0.9 ? 'EXACT' : similarity >= 0.8 ? 'NEAR' : 'SIMILAR'
                    });
                }
            }
        }
        
        // Sort by similarity
        this.duplicates.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Generate simple report
     */
    generateReport() {
        const timestamp = Date.now();
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFunctions: this.functions.size,
                totalDuplicates: this.duplicates.length,
                exactDuplicates: this.duplicates.filter(d => d.type === 'EXACT').length,
                nearDuplicates: this.duplicates.filter(d => d.type === 'NEAR').length,
                similarPatterns: this.duplicates.filter(d => d.type === 'SIMILAR').length
            },
            duplicates: this.duplicates.slice(0, 20) // Show top 20 only
        };

        // Save JSON report
        const jsonPath = path.join(CONFIG.outputDir, `simple-duplicates-${timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

        console.log(`\n📊 Simple Duplicate Detection Report Generated:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`\n📈 Summary:`);
        console.log(`   Total Functions: ${reportData.summary.totalFunctions}`);
        console.log(`   Total Duplicates: ${reportData.summary.totalDuplicates}`);
        console.log(`   Exact Duplicates: ${reportData.summary.exactDuplicates}`);
        console.log(`   Near Duplicates: ${reportData.summary.nearDuplicates}`);
        console.log(`   Similar Patterns: ${reportData.summary.similarPatterns}`);

        if (this.duplicates.length > 0) {
            console.log(`\n🔍 Top Duplicates Found:`);
            this.duplicates.slice(0, 10).forEach((dup, index) => {
                console.log(`   ${index + 1}. ${dup.func1.name} ↔ ${dup.func2.name} (${(dup.similarity * 100).toFixed(1)}% similarity)`);
                console.log(`      Files: ${dup.func1.file} ↔ ${dup.func2.file}`);
            });
        }

        return reportData;
    }

    /**
     * Run the detection process
     */
    async run() {
        console.log('🔍 Starting Simple Duplicate Detection (Test Version)...\n');
        
        // Extract functions from test pages only
        console.log('📄 Processing test pages...');
        for (const fileName of CONFIG.testPages) {
            const filePath = path.join(CONFIG.scriptsDir, fileName);
            if (fs.existsSync(filePath)) {
                console.log(`   Processing ${fileName}...`);
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
        
        // Detect duplicates
        console.log('\n🔍 Analyzing function similarities...');
        this.detectDuplicates();
        
        // Generate report
        console.log('\n📝 Generating report...');
        const report = this.generateReport();
        
        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const detector = new SimpleDuplicateDetector();
    detector.run().catch(console.error);
}

module.exports = SimpleDuplicateDetector;
