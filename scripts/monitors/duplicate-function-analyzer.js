#!/usr/bin/env node

/**
 * Duplicate Function Analyzer
 * Analyzes duplicate functions to determine which to keep and which to remove
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

class DuplicateFunctionAnalyzer {
    constructor() {
        this.analysisResults = new Map();
    }

    /**
     * Extract all function definitions with their context
     */
    extractFunctionDefinitions(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const functions = [];
            
            // Find all function definitions
            const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
            let match;
            
            while ((match = functionRegex.exec(content)) !== null) {
                const functionName = match[1];
                const startIndex = match.index;
                
                // Extract function body
                const body = this.extractFunctionBody(content, startIndex);
                
                // Extract context (lines before and after)
                const context = this.extractContext(content, startIndex);
                
                // Extract JSDoc if exists
                const jsdoc = this.extractJSDoc(content, startIndex);
                
                functions.push({
                    name: functionName,
                    startIndex: startIndex,
                    body: body,
                    context: context,
                    jsdoc: jsdoc,
                    lineNumber: this.getLineNumber(content, startIndex),
                    file: path.basename(filePath)
                });
            }
            
            return functions;
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error.message);
            return [];
        }
    }

    /**
     * Extract function body
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
     * Extract context around function
     */
    extractContext(content, startIndex) {
        const lines = content.split('\n');
        const functionLine = this.getLineNumber(content, startIndex);
        
        const startLine = Math.max(0, functionLine - 3);
        const endLine = Math.min(lines.length - 1, functionLine + 10);
        
        return lines.slice(startLine, endLine + 1).join('\n');
    }

    /**
     * Extract JSDoc comment before function
     */
    extractJSDoc(content, startIndex) {
        try {
            const beforeFunction = content.substring(0, startIndex);
            const jsdocMatch = beforeFunction.match(/\/\*\*\s*\n(?:\s*\*\s*.*\n)*?\s*\*\/\s*$/);
            
            if (jsdocMatch) {
                return jsdocMatch[0].replace(/\/\*\*|\*\/|\*/g, '').trim();
            }
            
            return '';
        } catch (error) {
            return '';
        }
    }

    /**
     * Get line number from index
     */
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    /**
     * Analyze function quality and completeness
     */
    analyzeFunctionQuality(func) {
        const analysis = {
            hasJSDoc: func.jsdoc.length > 0,
            hasErrorHandling: func.body.includes('try') && func.body.includes('catch'),
            hasLogging: func.body.includes('Logger') || func.body.includes('console'),
            hasValidation: func.body.includes('validate') || func.body.includes('check'),
            hasNotification: func.body.includes('showErrorNotification') || func.body.includes('showSuccessNotification'),
            bodyLength: func.body.length,
            complexity: this.calculateComplexity(func.body),
            completeness: 0
        };
        
        // Calculate completeness score
        let score = 0;
        if (analysis.hasJSDoc) score += 20;
        if (analysis.hasErrorHandling) score += 25;
        if (analysis.hasLogging) score += 15;
        if (analysis.hasValidation) score += 15;
        if (analysis.hasNotification) score += 15;
        if (analysis.bodyLength > 50) score += 10; // Not too short
        
        analysis.completeness = score;
        return analysis;
    }

    /**
     * Calculate function complexity (simple metric)
     */
    calculateComplexity(body) {
        if (!body) return 0;
        
        const complexityIndicators = [
            'if', 'else', 'for', 'while', 'switch', 'case',
            '&&', '||', '?', ':', 'return'
        ];
        
        let complexity = 0;
        for (const indicator of complexityIndicators) {
            const matches = body.match(new RegExp(indicator, 'g'));
            if (matches) complexity += matches.length;
        }
        
        return complexity;
    }

    /**
     * Determine which function to keep based on analysis
     */
    determineKeepFunction(func1, func2) {
        const quality1 = this.analyzeFunctionQuality(func1);
        const quality2 = this.analyzeFunctionQuality(func2);
        
        const decision = {
            keep: null,
            remove: null,
            reason: '',
            confidence: 0
        };
        
        // Rule 1: Keep function with higher completeness score
        if (quality1.completeness > quality2.completeness) {
            decision.keep = func1;
            decision.remove = func2;
            decision.reason = `Higher completeness score (${quality1.completeness} vs ${quality2.completeness})`;
            decision.confidence = 0.8;
        } else if (quality2.completeness > quality1.completeness) {
            decision.keep = func2;
            decision.remove = func1;
            decision.reason = `Higher completeness score (${quality2.completeness} vs ${quality1.completeness})`;
            decision.confidence = 0.8;
        }
        
        // Rule 2: If completeness is equal, keep function with JSDoc
        else if (quality1.hasJSDoc && !quality2.hasJSDoc) {
            decision.keep = func1;
            decision.remove = func2;
            decision.reason = 'Has JSDoc documentation';
            decision.confidence = 0.7;
        } else if (quality2.hasJSDoc && !quality1.hasJSDoc) {
            decision.keep = func2;
            decision.remove = func1;
            decision.reason = 'Has JSDoc documentation';
            decision.confidence = 0.7;
        }
        
        // Rule 3: If still equal, keep function with error handling
        else if (quality1.hasErrorHandling && !quality2.hasErrorHandling) {
            decision.keep = func1;
            decision.remove = func2;
            decision.reason = 'Has error handling';
            decision.confidence = 0.6;
        } else if (quality2.hasErrorHandling && !quality1.hasErrorHandling) {
            decision.keep = func2;
            decision.remove = func1;
            decision.reason = 'Has error handling';
            decision.confidence = 0.6;
        }
        
        // Rule 4: If still equal, keep function with more functionality
        else if (quality1.bodyLength > quality2.bodyLength) {
            decision.keep = func1;
            decision.remove = func2;
            decision.reason = `More functionality (${quality1.bodyLength} vs ${quality2.bodyLength} chars)`;
            decision.confidence = 0.5;
        } else if (quality2.bodyLength > quality1.bodyLength) {
            decision.keep = func2;
            decision.remove = func1;
            decision.reason = `More functionality (${quality2.bodyLength} vs ${quality1.bodyLength} chars)`;
            decision.confidence = 0.5;
        }
        
        // Rule 5: If still equal, keep the first one (arbitrary)
        else {
            decision.keep = func1;
            decision.remove = func2;
            decision.reason = 'Equal quality - keeping first occurrence';
            decision.confidence = 0.3;
        }
        
        return decision;
    }

    /**
     * Analyze duplicate functions in a file
     */
    analyzeFile(fileName) {
        const filePath = path.join(CONFIG.scriptsDir, fileName);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${fileName}`);
            return null;
        }
        
        console.log(`\n📄 Analyzing duplicate functions in ${fileName}...`);
        
        const functions = this.extractFunctionDefinitions(filePath);
        const duplicates = [];
        
        // Group functions by name
        const functionGroups = new Map();
        for (const func of functions) {
            if (!functionGroups.has(func.name)) {
                functionGroups.set(func.name, []);
            }
            functionGroups.get(func.name).push(func);
        }
        
        // Find duplicates
        for (const [name, funcs] of functionGroups) {
            if (funcs.length > 1) {
                console.log(`   🔍 Found ${funcs.length} instances of "${name}"`);
                
                // Analyze each pair
                for (let i = 0; i < funcs.length; i++) {
                    for (let j = i + 1; j < funcs.length; j++) {
                        const func1 = funcs[i];
                        const func2 = funcs[j];
                        
                        const decision = this.determineKeepFunction(func1, func2);
                        
                        duplicates.push({
                            functionName: name,
                            function1: func1,
                            function2: func2,
                            decision: decision,
                            quality1: this.analyzeFunctionQuality(func1),
                            quality2: this.analyzeFunctionQuality(func2)
                        });
                    }
                }
            }
        }
        
        const result = {
            file: fileName,
            totalFunctions: functions.length,
            duplicateGroups: functionGroups.size,
            duplicates: duplicates,
            duplicateCount: duplicates.length
        };
        
        if (duplicates.length > 0) {
            console.log(`   📊 Found ${duplicates.length} duplicate pairs`);
            duplicates.forEach((dup, index) => {
                console.log(`      ${index + 1}. "${dup.functionName}" - Keep: Line ${dup.decision.keep.lineNumber}, Remove: Line ${dup.decision.remove.lineNumber}`);
                console.log(`         Reason: ${dup.decision.reason} (Confidence: ${dup.decision.confidence})`);
            });
        } else {
            console.log(`   ✅ No duplicate functions found`);
        }
        
        return result;
    }

    /**
     * Generate analysis report
     */
    generateReport() {
        const timestamp = Date.now();
        const allResults = Array.from(this.analysisResults.values());
        
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: allResults.length,
                filesWithDuplicates: allResults.filter(r => r.duplicateCount > 0).length,
                totalDuplicates: allResults.reduce((sum, r) => sum + r.duplicateCount, 0),
                highConfidenceDecisions: allResults.reduce((sum, r) => 
                    sum + r.duplicates.filter(d => d.decision.confidence >= 0.7).length, 0),
                mediumConfidenceDecisions: allResults.reduce((sum, r) => 
                    sum + r.duplicates.filter(d => d.decision.confidence >= 0.5 && d.decision.confidence < 0.7).length, 0),
                lowConfidenceDecisions: allResults.reduce((sum, r) => 
                    sum + r.duplicates.filter(d => d.decision.confidence < 0.5).length, 0)
            },
            files: allResults,
            recommendations: this.generateRecommendations(allResults)
        };

        // Save JSON report
        const jsonPath = path.join(CONFIG.outputDir, `duplicate-analysis-${timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

        // Generate Markdown report
        const mdPath = path.join(CONFIG.outputDir, `duplicate-analysis-${timestamp}.md`);
        const mdContent = this.generateMarkdownReport(reportData);
        fs.writeFileSync(mdPath, mdContent);

        console.log(`\n📊 Duplicate Function Analysis Report Generated:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`   Markdown: ${mdPath}`);
        console.log(`\n📈 Summary:`);
        console.log(`   Total Files: ${reportData.summary.totalFiles}`);
        console.log(`   Files with Duplicates: ${reportData.summary.filesWithDuplicates}`);
        console.log(`   Total Duplicates: ${reportData.summary.totalDuplicates}`);
        console.log(`   High Confidence Decisions: ${reportData.summary.highConfidenceDecisions}`);
        console.log(`   Medium Confidence Decisions: ${reportData.summary.mediumConfidenceDecisions}`);
        console.log(`   Low Confidence Decisions: ${reportData.summary.lowConfidenceDecisions}`);

        return reportData;
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(results) {
        const recommendations = [];
        
        // High confidence decisions
        const highConfidenceFiles = results.filter(r => 
            r.duplicates.some(d => d.decision.confidence >= 0.7)
        );
        
        if (highConfidenceFiles.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                action: 'Remove duplicate functions with high confidence',
                files: highConfidenceFiles.map(f => f.file),
                count: highConfidenceFiles.reduce((sum, f) => 
                    sum + f.duplicates.filter(d => d.decision.confidence >= 0.7).length, 0)
            });
        }
        
        // Medium confidence decisions
        const mediumConfidenceFiles = results.filter(r => 
            r.duplicates.some(d => d.decision.confidence >= 0.5 && d.decision.confidence < 0.7)
        );
        
        if (mediumConfidenceFiles.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Review duplicate functions with medium confidence',
                files: mediumConfidenceFiles.map(f => f.file),
                count: mediumConfidenceFiles.reduce((sum, f) => 
                    sum + f.duplicates.filter(d => d.decision.confidence >= 0.5 && d.decision.confidence < 0.7).length, 0)
            });
        }
        
        return recommendations;
    }

    /**
     * Generate Markdown report
     */
    generateMarkdownReport(data) {
        let md = `# Duplicate Function Analysis Report\n\n`;
        md += `**Generated**: ${new Date().toLocaleString()}\n\n`;
        md += `---\n\n`;
        
        md += `## Summary\n\n`;
        md += `- **Total Files**: ${data.summary.totalFiles}\n`;
        md += `- **Files with Duplicates**: ${data.summary.filesWithDuplicates}\n`;
        md += `- **Total Duplicates**: ${data.summary.totalDuplicates}\n`;
        md += `- **High Confidence Decisions**: ${data.summary.highConfidenceDecisions}\n`;
        md += `- **Medium Confidence Decisions**: ${data.summary.mediumConfidenceDecisions}\n`;
        md += `- **Low Confidence Decisions**: ${data.summary.lowConfidenceDecisions}\n\n`;
        
        if (data.recommendations.length > 0) {
            md += `## Recommendations\n\n`;
            data.recommendations.forEach((rec, index) => {
                md += `### ${index + 1}. ${rec.action} (${rec.priority})\n\n`;
                md += `**Files**: ${rec.files.join(', ')}\n\n`;
                md += `**Count**: ${rec.count} duplicate functions\n\n`;
            });
        }
        
        md += `## Detailed Analysis\n\n`;
        data.files.forEach(file => {
            if (file.duplicateCount > 0) {
                md += `### ${file.file}\n\n`;
                md += `- **Total Functions**: ${file.totalFunctions}\n`;
                md += `- **Duplicate Groups**: ${file.duplicateGroups}\n`;
                md += `- **Duplicate Pairs**: ${file.duplicateCount}\n\n`;
                
                md += `**Duplicate Functions**:\n`;
                file.duplicates.forEach((dup, index) => {
                    md += `${index + 1}. **${dup.functionName}**\n`;
                    md += `   - Keep: Line ${dup.decision.keep.lineNumber} (${dup.decision.reason})\n`;
                    md += `   - Remove: Line ${dup.decision.remove.lineNumber}\n`;
                    md += `   - Confidence: ${dup.decision.confidence}\n\n`;
                });
            }
        });
        
        return md;
    }

    /**
     * Run the analysis
     */
    async run() {
        console.log('🔍 Starting Duplicate Function Analysis...\n');
        console.log(`📄 Analyzing ${CONFIG.corePages.length} core user pages\n`);
        
        // Analyze each file
        for (const fileName of CONFIG.corePages) {
            const result = this.analyzeFile(fileName);
            if (result) {
                this.analysisResults.set(fileName, result);
            }
        }
        
        // Generate report
        console.log('\n📝 Generating analysis report...');
        const report = this.generateReport();
        
        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const analyzer = new DuplicateFunctionAnalyzer();
    analyzer.run().catch(console.error);
}

module.exports = DuplicateFunctionAnalyzer;
