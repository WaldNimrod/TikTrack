#!/usr/bin/env node

/**
 * Advanced Duplicate Code Detector
 * Comprehensive system for detecting and categorizing code duplicates
 * Based on Function Index, JSDoc, Error Handling, and Naming Conventions
 * 
 * Usage: node scripts/monitors/advanced-duplicate-detector.js
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    scriptsDir: 'trading-ui/scripts',
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
    globalSystems: [
        'notification-system.js',
        'logger-service.js',
        'unified-cache-manager.js',
        'ui-utils.js',
        'tables.js',
        'main.js'
    ],
    thresholds: {
        exactDuplicate: 0.95,
        nearDuplicate: 0.85,
        similarPattern: 0.75,
        potentialDuplicate: 0.65
    },
    categories: {
        'DATA_LOADING': ['load', 'fetch', 'get', 'retrieve', 'fetchData'],
        'VALIDATION': ['validate', 'check', 'verify', 'isValid', 'isValidData'],
        'FORMATTING': ['format', 'parse', 'convert', 'transform', 'formatData'],
        'UI_MANAGEMENT': ['render', 'update', 'refresh', 'toggle', 'show', 'hide'],
        'NOTIFICATION': ['showNotification', 'showError', 'showSuccess', 'showInfo', 'notify'],
        'LOGGING': ['log', 'info', 'warn', 'error', 'debug', 'Logger'],
        'CACHE': ['get', 'set', 'clear', 'has', 'cache'],
        'API': ['api', 'fetch', 'post', 'put', 'delete', 'request'],
        'EVENT_HANDLING': ['handle', 'onClick', 'onChange', 'onSubmit', 'event'],
        'UTILITY': ['util', 'helper', 'common', 'shared', 'utility']
    }
};

class AdvancedDuplicateDetector {
    constructor() {
        this.functions = new Map();
        this.globalFunctions = new Map();
        this.duplicates = {
            exact: [],
            near: [],
            similar: [],
            potential: []
        };
        this.categories = new Map();
        this.confidenceLevels = new Map();
        this.recommendations = [];
    }

    /**
     * Extract comprehensive function information
     */
    extractFunctionInfo(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const functions = [];
            
            // Extract function declarations with comprehensive patterns
            const patterns = [
                // Standard function declarations
                /function\s+(\w+)\s*\([^)]*\)\s*{/g,
                // Arrow functions
                /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|function)/g,
                // Method declarations
                /(\w+)\s*:\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/g,
                // Class methods
                /(\w+)\s*\([^)]*\)\s*{/g
            ];
            
            for (const pattern of patterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const functionName = match[1];
                    if (this.isValidFunction(functionName)) {
                        const functionInfo = this.extractDetailedFunctionInfo(content, match.index, functionName);
                        if (functionInfo) {
                            functions.push({
                                ...functionInfo,
                                file: path.basename(filePath),
                                filePath: filePath,
                                category: this.categorizeFunction(functionName, functionInfo.jsdoc),
                                confidence: this.calculateConfidence(functionInfo)
                            });
                        }
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
     * Extract detailed function information including JSDoc
     */
    extractDetailedFunctionInfo(content, startIndex, functionName) {
        try {
            const lines = content.substring(0, startIndex).split('\n');
            const startLine = lines.length;
            
            // Find function start and extract JSDoc
            const functionStart = content.lastIndexOf(functionName, startIndex);
            const jsdocStart = content.lastIndexOf('/**', functionStart);
            const jsdocEnd = content.indexOf('*/', jsdocStart);
            
            let jsdoc = '';
            if (jsdocStart !== -1 && jsdocEnd !== -1 && jsdocStart < functionStart) {
                jsdoc = content.substring(jsdocStart, jsdocEnd + 2);
            }
            
            // Find function end
            let braceIndex = content.indexOf('{', startIndex);
            if (braceIndex === -1) return null;
            
            let braceCount = 1;
            let currentIndex = braceIndex + 1;
            
            while (braceCount > 0 && currentIndex < content.length) {
                const char = content[currentIndex];
                if (char === '{') braceCount++;
                else if (char === '}') braceCount--;
                currentIndex++;
            }
            
            if (braceCount === 0) {
                const functionContent = content.substring(startIndex, currentIndex);
                const functionLines = functionContent.split('\n');
                
                return {
                    name: functionName,
                    content: functionContent,
                    lines: functionLines,
                    startLine: startLine,
                    jsdoc: jsdoc,
                    hasTryCatch: functionContent.includes('try') && functionContent.includes('catch'),
                    hasLogger: functionContent.includes('Logger') || functionContent.includes('console'),
                    hasNotification: functionContent.includes('showNotification') || functionContent.includes('Notification'),
                    complexity: this.calculateComplexity(functionContent)
                };
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if function is valid (not system function)
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
     * Categorize function based on name and JSDoc
     */
    categorizeFunction(functionName, jsdoc) {
        const name = functionName.toLowerCase();
        const doc = jsdoc.toLowerCase();
        
        for (const [category, patterns] of Object.entries(CONFIG.categories)) {
            for (const pattern of patterns) {
                if (name.includes(pattern.toLowerCase()) || doc.includes(pattern.toLowerCase())) {
                    return category;
                }
            }
        }
        
        return 'UNCATEGORIZED';
    }

    /**
     * Calculate confidence level for duplicate detection
     */
    calculateConfidence(functionInfo) {
        let confidence = 0;
        
        // JSDoc presence increases confidence
        if (functionInfo.jsdoc && functionInfo.jsdoc.trim().length > 0) {
            confidence += 0.3;
        }
        
        // Error handling increases confidence
        if (functionInfo.hasTryCatch) {
            confidence += 0.2;
        }
        
        // Logger usage increases confidence
        if (functionInfo.hasLogger) {
            confidence += 0.1;
        }
        
        // Notification usage increases confidence
        if (functionInfo.hasNotification) {
            confidence += 0.1;
        }
        
        // Function complexity affects confidence
        if (functionInfo.complexity > 10) {
            confidence += 0.2;
        } else if (functionInfo.complexity > 5) {
            confidence += 0.1;
        }
        
        // Function length affects confidence
        if (functionInfo.lines.length > 20) {
            confidence += 0.1;
        }
        
        return Math.min(confidence, 1.0);
    }

    /**
     * Calculate function complexity
     */
    calculateComplexity(content) {
        let complexity = 1; // Base complexity
        
        // Count control structures
        complexity += (content.match(/if\s*\(/g) || []).length;
        complexity += (content.match(/for\s*\(/g) || []).length;
        complexity += (content.match(/while\s*\(/g) || []).length;
        complexity += (content.match(/switch\s*\(/g) || []).length;
        complexity += (content.match(/catch\s*\(/g) || []).length;
        complexity += (content.match(/&&/g) || []).length;
        complexity += (content.match(/\|\|/g) || []).length;
        
        return complexity;
    }

    /**
     * Calculate advanced similarity between functions
     */
    calculateAdvancedSimilarity(func1, func2) {
        let similarity = 0;
        let factors = 0;
        
        // Name similarity (30% weight)
        const nameSimilarity = this.calculateNameSimilarity(func1.name, func2.name);
        similarity += nameSimilarity * 0.3;
        factors += 0.3;
        
        // JSDoc similarity (25% weight)
        if (func1.jsdoc && func2.jsdoc) {
            const jsdocSimilarity = this.calculateJSDocSimilarity(func1.jsdoc, func2.jsdoc);
            similarity += jsdocSimilarity * 0.25;
            factors += 0.25;
        }
        
        // Content similarity (25% weight)
        const contentSimilarity = this.calculateContentSimilarity(func1.content, func2.content);
        similarity += contentSimilarity * 0.25;
        factors += 0.25;
        
        // Category similarity (10% weight)
        if (func1.category === func2.category) {
            similarity += 0.1;
        }
        factors += 0.1;
        
        // Error handling similarity (10% weight)
        if (func1.hasTryCatch === func2.hasTryCatch) {
            similarity += 0.05;
        }
        if (func1.hasLogger === func2.hasLogger) {
            similarity += 0.05;
        }
        factors += 0.1;
        
        return factors > 0 ? similarity / factors : 0;
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
        
        // Levenshtein distance
        const maxLength = Math.max(norm1.length, norm2.length);
        if (maxLength === 0) return 0;
        
        const distance = this.levenshteinDistance(norm1, norm2);
        return 1 - (distance / maxLength);
    }

    /**
     * Calculate JSDoc similarity
     */
    calculateJSDocSimilarity(jsdoc1, jsdoc2) {
        if (!jsdoc1 || !jsdoc2) return 0;
        
        const normalize = (doc) => {
            return doc
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\/\/.*$/gm, '')
                .replace(/\s+/g, ' ')
                .replace(/@\w+/g, 'TAG')
                .replace(/\{.*?\}/g, 'TYPE')
                .toLowerCase()
                .trim();
        };
        
        const norm1 = normalize(jsdoc1);
        const norm2 = normalize(jsdoc2);
        
        if (norm1 === norm2) return 1.0;
        
        const maxLength = Math.max(norm1.length, norm2.length);
        if (maxLength === 0) return 0;
        
        const distance = this.levenshteinDistance(norm1, norm2);
        return 1 - (distance / maxLength);
    }

    /**
     * Calculate content similarity
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
        
        const maxLength = Math.max(norm1.length, norm2.length);
        if (maxLength === 0) return 0;
        
        const distance = this.levenshteinDistance(norm1, norm2);
        return 1 - (distance / maxLength);
    }

    /**
     * Levenshtein distance calculation
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
     * Detect duplicates across all files
     */
    detectDuplicates() {
        const allFunctions = Array.from(this.functions.values());
        
        for (let i = 0; i < allFunctions.length; i++) {
            for (let j = i + 1; j < allFunctions.length; j++) {
                const func1 = allFunctions[i];
                const func2 = allFunctions[j];
                
                // Skip if same file
                if (func1.file === func2.file) continue;
                
                const similarity = this.calculateAdvancedSimilarity(func1, func2);
                const confidence = (func1.confidence + func2.confidence) / 2;
                
                if (similarity >= CONFIG.thresholds.potentialDuplicate) {
                    const duplicate = {
                        func1: func1,
                        func2: func2,
                        similarity: similarity,
                        confidence: confidence,
                        type: this.classifyDuplicate(similarity),
                        category: func1.category,
                        recommendation: this.generateRecommendation(func1, func2, similarity, confidence)
                    };
                    
                    this.addToCategory(duplicate);
                }
            }
        }
        
        // Sort by similarity and confidence
        Object.keys(this.duplicates).forEach(key => {
            this.duplicates[key].sort((a, b) => {
                const scoreA = a.similarity * a.confidence;
                const scoreB = b.similarity * b.confidence;
                return scoreB - scoreA;
            });
        });
    }

    /**
     * Classify duplicate type
     */
    classifyDuplicate(similarity) {
        if (similarity >= CONFIG.thresholds.exactDuplicate) return 'EXACT';
        if (similarity >= CONFIG.thresholds.nearDuplicate) return 'NEAR';
        if (similarity >= CONFIG.thresholds.similarPattern) return 'SIMILAR';
        return 'POTENTIAL';
    }

    /**
     * Add duplicate to appropriate category
     */
    addToCategory(duplicate) {
        this.duplicates[duplicate.type.toLowerCase()].push(duplicate);
        
        if (!this.categories.has(duplicate.category)) {
            this.categories.set(duplicate.category, []);
        }
        this.categories.get(duplicate.category).push(duplicate);
    }

    /**
     * Generate recommendation for duplicate
     */
    generateRecommendation(func1, func2, similarity, confidence) {
        const recommendations = [];
        
        if (similarity >= CONFIG.thresholds.exactDuplicate) {
            recommendations.push({
                priority: 'HIGH',
                action: 'MERGE_FUNCTIONS',
                description: 'Functions are nearly identical - merge into shared utility',
                steps: [
                    'Create shared utility function',
                    'Update both files to use shared function',
                    'Remove duplicate implementations'
                ]
            });
        } else if (similarity >= CONFIG.thresholds.nearDuplicate) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'REFACTOR_SIMILAR',
                description: 'Functions are very similar - consider refactoring',
                steps: [
                    'Identify common patterns',
                    'Extract shared logic',
                    'Parameterize differences'
                ]
            });
        } else if (similarity >= CONFIG.thresholds.similarPattern) {
            recommendations.push({
                priority: 'LOW',
                action: 'REVIEW_PATTERN',
                description: 'Functions follow similar pattern - review for optimization',
                steps: [
                    'Review both implementations',
                    'Consider if pattern can be generalized',
                    'Document common approach'
                ]
            });
        }
        
        // Add category-specific recommendations
        if (func1.category === 'VALIDATION') {
            recommendations.push({
                priority: 'HIGH',
                action: 'USE_GLOBAL_VALIDATOR',
                description: 'Consider using global validation system',
                steps: [
                    'Check if global validator exists',
                    'Implement shared validation rules',
                    'Use consistent validation approach'
                ]
            });
        }
        
        if (func1.category === 'NOTIFICATION') {
            recommendations.push({
                priority: 'HIGH',
                action: 'USE_NOTIFICATION_SYSTEM',
                description: 'Use global notification system instead of custom implementations',
                steps: [
                    'Replace with window.showNotification()',
                    'Use consistent notification patterns',
                    'Remove custom notification code'
                ]
            });
        }
        
        return recommendations;
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const timestamp = Date.now();
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFunctions: this.functions.size,
                totalDuplicates: Object.values(this.duplicates).reduce((sum, arr) => sum + arr.length, 0),
                exactDuplicates: this.duplicates.exact.length,
                nearDuplicates: this.duplicates.near.length,
                similarPatterns: this.duplicates.similar.length,
                potentialDuplicates: this.duplicates.potential.length,
                categories: Object.fromEntries(this.categories)
            },
            duplicates: this.duplicates,
            categories: Object.fromEntries(this.categories),
            recommendations: this.generateOverallRecommendations()
        };

        // Save JSON report
        const jsonPath = path.join(CONFIG.outputDir, `advanced-duplicates-${timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

        // Generate Markdown report
        const markdownPath = path.join(CONFIG.outputDir, `advanced-duplicates-${timestamp}.md`);
        const markdown = this.generateMarkdownReport(reportData);
        fs.writeFileSync(markdownPath, markdown);

        console.log(`\n📊 Advanced Duplicate Detection Report Generated:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`   Markdown: ${markdownPath}`);
        console.log(`\n📈 Summary:`);
        console.log(`   Total Functions: ${reportData.summary.totalFunctions}`);
        console.log(`   Total Duplicates: ${reportData.summary.totalDuplicates}`);
        console.log(`   Exact Duplicates: ${reportData.summary.exactDuplicates}`);
        console.log(`   Near Duplicates: ${reportData.summary.nearDuplicates}`);
        console.log(`   Similar Patterns: ${reportData.summary.similarPatterns}`);
        console.log(`   Potential Duplicates: ${reportData.summary.potentialDuplicates}`);

        // Output structured data marker for API consumers
        console.log(`__REPORT_JSON__${JSON.stringify(reportData)}`);

        return reportData;
    }

    /**
     * Generate overall recommendations
     */
    generateOverallRecommendations() {
        const recommendations = [];
        
        // High priority recommendations
        if (this.duplicates.exact.length > 0) {
            recommendations.push({
                priority: 'CRITICAL',
                title: 'Exact Duplicates Found',
                description: `${this.duplicates.exact.length} exact duplicate functions detected`,
                action: 'Immediate refactoring required',
                impact: 'High - reduces maintainability and increases bug risk'
            });
        }
        
        // Category-based recommendations
        for (const [category, duplicates] of this.categories) {
            if (duplicates.length > 2) {
                recommendations.push({
                    priority: 'HIGH',
                    title: `Multiple ${category} Duplicates`,
                    description: `${duplicates.length} functions in ${category} category show duplication`,
                    action: `Consider creating shared ${category.toLowerCase()} utility`,
                    impact: 'Medium - affects code consistency'
                });
            }
        }
        
        return recommendations;
    }

    /**
     * Generate detailed Markdown report
     */
    generateMarkdownReport(data) {
        let markdown = `# Advanced Duplicate Code Detection Report\n\n`;
        markdown += `**Generated**: ${new Date(data.timestamp).toLocaleString()}\n\n`;
        markdown += `---\n\n`;
        
        // Summary
        markdown += `## 📊 Summary\n\n`;
        markdown += `- **Total Functions Analyzed**: ${data.summary.totalFunctions}\n`;
        markdown += `- **Total Duplicates Found**: ${data.summary.totalDuplicates}\n`;
        markdown += `- **Exact Duplicates**: ${data.summary.exactDuplicates} 🔴\n`;
        markdown += `- **Near Duplicates**: ${data.summary.nearDuplicates} 🟡\n`;
        markdown += `- **Similar Patterns**: ${data.summary.similarPatterns} 🟠\n`;
        markdown += `- **Potential Duplicates**: ${data.summary.potentialDuplicates} 🔵\n\n`;
        
        // Critical Issues
        if (data.duplicates.exact.length > 0) {
            markdown += `## 🔴 Critical Issues - Exact Duplicates\n\n`;
            markdown += `**Action Required**: Immediate refactoring needed\n\n`;
            
            for (const duplicate of data.duplicates.exact.slice(0, 10)) {
                markdown += `### ${duplicate.func1.name} vs ${duplicate.func2.name}\n\n`;
                markdown += `- **Similarity**: ${(duplicate.similarity * 100).toFixed(1)}%\n`;
                markdown += `- **Confidence**: ${(duplicate.confidence * 100).toFixed(1)}%\n`;
                markdown += `- **Files**: ${duplicate.func1.file} (line ${duplicate.func1.startLine}) ↔ ${duplicate.func2.file} (line ${duplicate.func2.startLine})\n`;
                markdown += `- **Category**: ${duplicate.category}\n\n`;
                
                if (duplicate.recommendation && duplicate.recommendation.length > 0) {
                    markdown += `**Recommendations**:\n`;
                    for (const rec of duplicate.recommendation) {
                        markdown += `- **${rec.priority}**: ${rec.description}\n`;
                        if (rec.steps) {
                            markdown += `  - Steps: ${rec.steps.join(', ')}\n`;
                        }
                    }
                    markdown += `\n`;
                }
            }
        }
        
        // High Priority Issues
        if (data.duplicates.near.length > 0) {
            markdown += `## 🟡 High Priority - Near Duplicates\n\n`;
            
            for (const duplicate of data.duplicates.near.slice(0, 15)) {
                markdown += `### ${duplicate.func1.name} vs ${duplicate.func2.name}\n\n`;
                markdown += `- **Similarity**: ${(duplicate.similarity * 100).toFixed(1)}%\n`;
                markdown += `- **Confidence**: ${(duplicate.confidence * 100).toFixed(1)}%\n`;
                markdown += `- **Files**: ${duplicate.func1.file} ↔ ${duplicate.func2.file}\n`;
                markdown += `- **Category**: ${duplicate.category}\n\n`;
            }
        }
        
        // Category Analysis
        markdown += `## 📋 Category Analysis\n\n`;
        for (const [category, duplicates] of Object.entries(data.summary.categories)) {
            if (duplicates.length > 0) {
                markdown += `### ${category} (${duplicates.length} duplicates)\n\n`;
                
                // Group by similarity level
                const exact = duplicates.filter(d => d.type === 'EXACT').length;
                const near = duplicates.filter(d => d.type === 'NEAR').length;
                const similar = duplicates.filter(d => d.type === 'SIMILAR').length;
                
                markdown += `- Exact: ${exact}, Near: ${near}, Similar: ${similar}\n\n`;
                
                if (exact > 0) {
                    markdown += `**Critical**: ${exact} exact duplicates in ${category} category\n`;
                    markdown += `**Action**: Create shared ${category.toLowerCase()} utility\n\n`;
                }
            }
        }
        
        // Overall Recommendations
        if (data.recommendations.length > 0) {
            markdown += `## 🎯 Overall Recommendations\n\n`;
            
            for (const rec of data.recommendations) {
                markdown += `### ${rec.title}\n\n`;
                markdown += `**Priority**: ${rec.priority}\n\n`;
                markdown += `**Description**: ${rec.description}\n\n`;
                markdown += `**Action**: ${rec.action}\n\n`;
                markdown += `**Impact**: ${rec.impact}\n\n`;
            }
        }
        
        // Manual Review Checklist
        markdown += `## ✅ Manual Review Checklist\n\n`;
        markdown += `### High Priority Review\n`;
        markdown += `- [ ] Review all EXACT duplicates for immediate refactoring\n`;
        markdown += `- [ ] Check if global systems can replace custom implementations\n`;
        markdown += `- [ ] Verify notification system usage consistency\n`;
        markdown += `- [ ] Ensure validation logic is centralized\n\n`;
        
        markdown += `### Medium Priority Review\n`;
        markdown += `- [ ] Review NEAR duplicates for refactoring opportunities\n`;
        markdown += `- [ ] Check for similar patterns that can be generalized\n`;
        markdown += `- [ ] Verify error handling consistency\n`;
        markdown += `- [ ] Ensure logging patterns are consistent\n\n`;
        
        markdown += `### Low Priority Review\n`;
        markdown += `- [ ] Review SIMILAR patterns for optimization\n`;
        markdown += `- [ ] Check for naming convention consistency\n`;
        markdown += `- [ ] Verify JSDoc documentation completeness\n`;
        markdown += `- [ ] Ensure function categorization is accurate\n\n`;
        
        return markdown;
    }

    /**
     * Run the advanced detection process
     */
    async run() {
        console.log('🔍 Starting Advanced Duplicate Code Detection...\n');
        
        // Extract functions from core pages
        console.log('📄 Processing core pages...');
        for (const fileName of CONFIG.corePages) {
            const filePath = path.join(CONFIG.scriptsDir, fileName);
            if (fs.existsSync(filePath)) {
                console.log(`   Processing ${fileName}...`);
                const functions = this.extractFunctionInfo(filePath);
                
                for (const func of functions) {
                    this.functions.set(`${func.file}:${func.name}`, func);
                }
                
                console.log(`   Found ${functions.length} functions`);
            }
        }
        
        // Extract functions from global systems
        console.log('\n🌐 Processing global systems...');
        for (const fileName of CONFIG.globalSystems) {
            const filePath = path.join(CONFIG.scriptsDir, fileName);
            if (fs.existsSync(filePath)) {
                console.log(`   Processing ${fileName}...`);
                const functions = this.extractFunctionInfo(filePath);
                
                for (const func of functions) {
                    this.globalFunctions.set(`${func.file}:${func.name}`, func);
                }
                
                console.log(`   Found ${functions.length} functions`);
            }
        }
        
        console.log(`\n📊 Total functions found: ${this.functions.size}`);
        console.log(`📊 Global functions found: ${this.globalFunctions.size}`);
        
        // Detect duplicates
        console.log('\n🔍 Analyzing function similarities...');
        this.detectDuplicates();
        
        // Generate report
        console.log('\n📝 Generating comprehensive report...');
        const report = this.generateReport();
        
        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const detector = new AdvancedDuplicateDetector();
    detector.run().catch(console.error);
}

module.exports = AdvancedDuplicateDetector;
