#!/usr/bin/env node

/**
 * Intra-File Duplicate Detector
 * Scans each file individually for duplicate code patterns
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    scriptsDir: 'trading-ui/scripts',
    outputDir: 'reports',
    corePages: [
        'index.js', 'trades.js', 'executions.js', 'alerts.js',
        'trade_plans.js', 'cash_flows.js', 'research.js', 'notes.js',
        'preferences-page.js', 'tickers.js', 'trading_accounts.js'
    ]
};

class IntraFileDuplicateDetector {
    constructor() {
        this.results = new Map(); // file -> duplicates
        this.totalDuplicates = 0;
    }

    /**
     * Extract all functions from a JavaScript file
     */
    extractFunctions(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const functions = [];
            
            // Multiple function patterns
            const patterns = [
                // Regular functions
                /function\s+(\w+)\s*\([^)]*\)\s*{/g,
                // Arrow functions assigned to variables
                /(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*{/g,
                // Methods in objects
                /(\w+)\s*:\s*(?:async\s+)?function\s*\([^)]*\)\s*{/g,
                // Arrow methods in objects
                /(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>\s*{/g
            ];
            
            for (const pattern of patterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const functionName = match[1];
                    if (this.isValidFunction(functionName)) {
                        functions.push({
                            name: functionName,
                            startIndex: match.index,
                            fullMatch: match[0]
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
     * Check if function name is valid (not system functions)
     */
    isValidFunction(functionName) {
        const systemFunctions = [
            'console', 'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval',
            'clearTimeout', 'clearInterval', 'fetch', 'XMLHttpRequest',
            'addEventListener', 'removeEventListener', 'querySelector', 'querySelectorAll',
            'getElementById', 'getElementsByClassName', 'createElement', 'appendChild',
            'removeChild', 'insertBefore', 'JSON', 'parse', 'stringify', 'Math',
            'Date', 'Array', 'Object', 'window', 'document', 'location', 'history',
            'require', 'module', 'exports', 'process', 'Buffer', 'global'
        ];
        
        return !systemFunctions.includes(functionName) && 
               !functionName.startsWith('_') && 
               !functionName.includes('$') &&
               functionName.length >= 3 &&
               !functionName.match(/^\d/) &&
               !functionName.includes('test') &&
               !functionName.includes('mock');
    }

    /**
     * Extract function body content
     */
    extractFunctionBody(content, startIndex) {
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
                return content.substring(braceIndex + 1, currentIndex - 1).trim();
            }
            
            return '';
        } catch (error) {
            return '';
        }
    }

    /**
     * Calculate similarity between two function bodies
     */
    calculateSimilarity(body1, body2) {
        if (!body1 || !body2) return 0;
        
        // Normalize function bodies
        const normalize = (body) => {
            return body
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
                .replace(/\/\/.*$/gm, '') // Remove line comments
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/\b\w+\b/g, 'VAR') // Replace variable names
                .replace(/\d+/g, 'NUM') // Replace numbers
                .replace(/['"]/g, 'STR') // Replace strings
                .toLowerCase()
                .trim();
        };
        
        const norm1 = normalize(body1);
        const norm2 = normalize(body2);
        
        if (norm1 === norm2) return 1.0;
        
        const maxLength = Math.max(norm1.length, norm2.length);
        if (maxLength === 0) return 0;
        
        // Calculate common substring ratio
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
     * Detect duplicates within a single file
     */
    detectIntraFileDuplicates(filePath) {
        const functions = this.extractFunctions(filePath);
        const duplicates = [];
        
        console.log(`   Found ${functions.length} functions`);
        
        if (functions.length < 2) {
            return duplicates;
        }
        
        // Read file content once
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Compare all function pairs
        for (let i = 0; i < functions.length; i++) {
            for (let j = i + 1; j < functions.length; j++) {
                const func1 = functions[i];
                const func2 = functions[j];
                
                // Skip if same name (exact duplicate)
                if (func1.name === func2.name) {
                    duplicates.push({
                        type: 'EXACT_NAME_DUPLICATE',
                        function1: func1,
                        function2: func2,
                        similarity: 1.0,
                        severity: 'HIGH',
                        reason: `Exact function name duplicate: ${func1.name}`
                    });
                    continue;
                }
                
                // Extract function bodies
                const body1 = this.extractFunctionBody(content, func1.startIndex);
                const body2 = this.extractFunctionBody(content, func2.startIndex);
                
                // Calculate similarity
                const similarity = this.calculateSimilarity(body1, body2);
                
                if (similarity >= 0.7) {
                    let type = 'SIMILAR_CODE';
                    let severity = 'MEDIUM';
                    
                    if (similarity >= 0.9) {
                        type = 'NEAR_DUPLICATE';
                        severity = 'HIGH';
                    } else if (similarity >= 0.8) {
                        type = 'HIGH_SIMILARITY';
                        severity = 'MEDIUM';
                    }
                    
                    duplicates.push({
                        type: type,
                        function1: func1,
                        function2: func2,
                        similarity: similarity,
                        severity: severity,
                        reason: `${type}: ${func1.name} vs ${func2.name} (${(similarity * 100).toFixed(1)}% similar)`
                    });
                }
            }
        }
        
        // Sort by similarity
        duplicates.sort((a, b) => b.similarity - a.similarity);
        
        return duplicates;
    }

    /**
     * Analyze a single file
     */
    analyzeFile(fileName) {
        const filePath = path.join(CONFIG.scriptsDir, fileName);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${fileName}`);
            return null;
        }
        
        console.log(`\n📄 Analyzing ${fileName}...`);
        
        const duplicates = this.detectIntraFileDuplicates(filePath);
        
        const result = {
            file: fileName,
            totalFunctions: this.extractFunctions(filePath).length,
            duplicates: duplicates,
            duplicateCount: duplicates.length,
            severityBreakdown: {
                HIGH: duplicates.filter(d => d.severity === 'HIGH').length,
                MEDIUM: duplicates.filter(d => d.severity === 'MEDIUM').length,
                LOW: duplicates.filter(d => d.severity === 'LOW').length
            }
        };
        
        if (duplicates.length > 0) {
            console.log(`   🔍 Found ${duplicates.length} duplicates:`);
            duplicates.slice(0, 5).forEach((dup, index) => {
                console.log(`      ${index + 1}. ${dup.reason}`);
            });
            if (duplicates.length > 5) {
                console.log(`      ... and ${duplicates.length - 5} more`);
            }
        } else {
            console.log(`   ✅ No duplicates found`);
        }
        
        return result;
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const timestamp = Date.now();
        
        // Calculate summary statistics
        const allResults = Array.from(this.results.values());
        const totalFiles = allResults.length;
        const filesWithDuplicates = allResults.filter(r => r.duplicateCount > 0).length;
        const totalDuplicates = allResults.reduce((sum, r) => sum + r.duplicateCount, 0);
        const highSeverityDuplicates = allResults.reduce((sum, r) => sum + r.severityBreakdown.HIGH, 0);
        const mediumSeverityDuplicates = allResults.reduce((sum, r) => sum + r.severityBreakdown.MEDIUM, 0);
        
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: totalFiles,
                filesWithDuplicates: filesWithDuplicates,
                totalDuplicates: totalDuplicates,
                highSeverityDuplicates: highSeverityDuplicates,
                mediumSeverityDuplicates: mediumSeverityDuplicates,
                averageDuplicatesPerFile: totalFiles > 0 ? (totalDuplicates / totalFiles).toFixed(2) : 0
            },
            files: allResults,
            recommendations: this.generateRecommendations(allResults)
        };

        // Save JSON report
        const jsonPath = path.join(CONFIG.outputDir, `intra-file-duplicates-${timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

        // Generate Markdown report
        const mdPath = path.join(CONFIG.outputDir, `intra-file-duplicates-${timestamp}.md`);
        const mdContent = this.generateMarkdownReport(reportData);
        fs.writeFileSync(mdPath, mdContent);

        console.log(`\n📊 Intra-File Duplicate Detection Report Generated:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`   Markdown: ${mdPath}`);
        console.log(`\n📈 Summary:`);
        console.log(`   Total Files Analyzed: ${totalFiles}`);
        console.log(`   Files with Duplicates: ${filesWithDuplicates}`);
        console.log(`   Total Duplicates Found: ${totalDuplicates}`);
        console.log(`   High Severity: ${highSeverityDuplicates}`);
        console.log(`   Medium Severity: ${mediumSeverityDuplicates}`);
        console.log(`   Average per File: ${reportData.summary.averageDuplicatesPerFile}`);

        return reportData;
    }

    /**
     * Generate recommendations based on findings
     */
    generateRecommendations(results) {
        const recommendations = [];
        
        const highSeverityFiles = results.filter(r => r.severityBreakdown.HIGH > 0);
        if (highSeverityFiles.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'Exact function name duplicates found',
                files: highSeverityFiles.map(f => f.file),
                action: 'Rename duplicate functions or consolidate functionality'
            });
        }
        
        const mediumSeverityFiles = results.filter(r => r.severityBreakdown.MEDIUM > 0);
        if (mediumSeverityFiles.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                issue: 'High similarity code blocks found',
                files: mediumSeverityFiles.map(f => f.file),
                action: 'Review and refactor similar functions to reduce duplication'
            });
        }
        
        return recommendations;
    }

    /**
     * Generate Markdown report
     */
    generateMarkdownReport(data) {
        let md = `# Intra-File Duplicate Detection Report\n\n`;
        md += `**Generated**: ${new Date().toLocaleString()}\n\n`;
        md += `---\n\n`;
        
        md += `## Summary\n\n`;
        md += `- **Total Files Analyzed**: ${data.summary.totalFiles}\n`;
        md += `- **Files with Duplicates**: ${data.summary.filesWithDuplicates}\n`;
        md += `- **Total Duplicates Found**: ${data.summary.totalDuplicates}\n`;
        md += `- **High Severity**: ${data.summary.highSeverityDuplicates}\n`;
        md += `- **Medium Severity**: ${data.summary.mediumSeverityDuplicates}\n`;
        md += `- **Average per File**: ${data.summary.averageDuplicatesPerFile}\n\n`;
        
        if (data.recommendations.length > 0) {
            md += `## Recommendations\n\n`;
            data.recommendations.forEach((rec, index) => {
                md += `### ${index + 1}. ${rec.issue} (${rec.priority})\n\n`;
                md += `**Files**: ${rec.files.join(', ')}\n\n`;
                md += `**Action**: ${rec.action}\n\n`;
            });
        }
        
        md += `## Detailed Findings\n\n`;
        data.files.forEach(file => {
            if (file.duplicateCount > 0) {
                md += `### ${file.file}\n\n`;
                md += `- **Total Functions**: ${file.totalFunctions}\n`;
                md += `- **Duplicates Found**: ${file.duplicateCount}\n`;
                md += `- **High Severity**: ${file.severityBreakdown.HIGH}\n`;
                md += `- **Medium Severity**: ${file.severityBreakdown.MEDIUM}\n\n`;
                
                md += `**Duplicates**:\n`;
                file.duplicates.forEach((dup, index) => {
                    md += `${index + 1}. **${dup.type}** (${dup.severity}) - ${dup.reason}\n`;
                });
                md += `\n`;
            }
        });
        
        return md;
    }

    /**
     * Run the detection process
     */
    async run() {
        console.log('🔍 Starting Intra-File Duplicate Detection...\n');
        console.log(`📄 Analyzing ${CONFIG.corePages.length} core user pages\n`);
        
        // Analyze each file
        for (const fileName of CONFIG.corePages) {
            const result = this.analyzeFile(fileName);
            if (result) {
                this.results.set(fileName, result);
            }
        }
        
        // Generate report
        console.log('\n📝 Generating comprehensive report...');
        const report = this.generateReport();
        
        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const detector = new IntraFileDuplicateDetector();
    detector.run().catch(console.error);
}

module.exports = IntraFileDuplicateDetector;
