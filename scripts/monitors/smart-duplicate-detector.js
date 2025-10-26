#!/usr/bin/env node

/**
 * Smart Duplicate Detector - Using Existing Function Indexes
 * Leverages the rich information already available in function indexes
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

class SmartDuplicateDetector {
    constructor() {
        this.functionIndexes = new Map(); // file -> functions
        this.duplicates = [];
    }

    /**
     * Extract function index from a JavaScript file
     */
    extractFunctionIndex(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const functions = [];
            
            // Look for Function Index section
            const indexMatch = content.match(/\/\*\*\s*Function Index:[\s\S]*?\*\//);
            if (!indexMatch) {
                console.log(`   No Function Index found in ${path.basename(filePath)}`);
                return [];
            }
            
            const indexContent = indexMatch[0];
            
            // Extract functions from each category
            const categoryRegex = /\*\s*([A-Z\s]+):\s*\n((?:\s*\*\s*-\s*[^\n]+\n?)*)/g;
            let categoryMatch;
            
            while ((categoryMatch = categoryRegex.exec(indexContent)) !== null) {
                const category = categoryMatch[1].trim();
                const functionsText = categoryMatch[2];
                
                // Extract function names from this category
                const functionRegex = /\*\s*-\s*(\w+)\s*\([^)]*\)/g;
                let functionMatch;
                
                while ((functionMatch = functionRegex.exec(functionsText)) !== null) {
                    const functionName = functionMatch[1];
                    
                    functions.push({
                        name: functionName,
                        category: category,
                        description: `${functionName} in ${category}`,
                        file: path.basename(filePath)
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
     * Calculate similarity between two function descriptions
     */
    calculateDescriptionSimilarity(desc1, desc2) {
        const normalize = (text) => {
            return text.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };
        
        const norm1 = normalize(desc1);
        const norm2 = normalize(desc2);
        
        if (norm1 === norm2) return 1.0;
        
        const words1 = new Set(norm1.split(' '));
        const words2 = new Set(norm2.split(' '));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    /**
     * Detect duplicates using function indexes
     */
    detectDuplicates() {
        const allFunctions = [];
        
        // Collect all functions from all files
        for (const [file, functions] of this.functionIndexes) {
            allFunctions.push(...functions);
        }
        
        console.log(`\n🔍 Analyzing ${allFunctions.length} functions for duplicates...`);
        
        // 1. Exact name matches (different files)
        const nameGroups = new Map();
        for (const func of allFunctions) {
            if (!nameGroups.has(func.name)) {
                nameGroups.set(func.name, []);
            }
            nameGroups.get(func.name).push(func);
        }
        
        // Find functions with same name in different files
        for (const [name, functions] of nameGroups) {
            if (functions.length > 1) {
                const files = [...new Set(functions.map(f => f.file))];
                if (files.length > 1) {
                    this.duplicates.push({
                        type: 'EXACT_NAME',
                        functions: functions,
                        similarity: 1.0,
                        reason: `Same function name "${name}" in multiple files: ${files.join(', ')}`
                    });
                }
            }
        }
        
        // 2. Similar descriptions (same category)
        for (let i = 0; i < allFunctions.length; i++) {
            for (let j = i + 1; j < allFunctions.length; j++) {
                const func1 = allFunctions[i];
                const func2 = allFunctions[j];
                
                // Skip if same file
                if (func1.file === func2.file) continue;
                
                // Check if same category and similar description
                if (func1.category === func2.category) {
                    const similarity = this.calculateDescriptionSimilarity(
                        func1.description, func2.description
                    );
                    
                    if (similarity >= 0.7) {
                        this.duplicates.push({
                            type: 'SIMILAR_DESCRIPTION',
                            functions: [func1, func2],
                            similarity: similarity,
                            reason: `Similar descriptions in ${func1.category} category: "${func1.description}" vs "${func2.description}"`
                        });
                    }
                }
            }
        }
        
        // 3. Cross-category similar names (common patterns)
        const commonPatterns = [
            'validate', 'format', 'load', 'get', 'set', 'show', 'hide', 
            'update', 'refresh', 'save', 'delete', 'add', 'edit', 'remove'
        ];
        
        for (const pattern of commonPatterns) {
            const patternFunctions = allFunctions.filter(f => 
                f.name.toLowerCase().includes(pattern.toLowerCase())
            );
            
            if (patternFunctions.length > 1) {
                const files = [...new Set(patternFunctions.map(f => f.file))];
                if (files.length > 1) {
                    this.duplicates.push({
                        type: 'COMMON_PATTERN',
                        functions: patternFunctions,
                        similarity: 0.8,
                        reason: `Common pattern "${pattern}" found in multiple files: ${files.join(', ')}`
                    });
                }
            }
        }
        
        // Sort by similarity
        this.duplicates.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Generate report
     */
    generateReport() {
        const timestamp = Date.now();
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFunctions: Array.from(this.functionIndexes.values()).flat().length,
                totalDuplicates: this.duplicates.length,
                exactNameDuplicates: this.duplicates.filter(d => d.type === 'EXACT_NAME').length,
                similarDescriptionDuplicates: this.duplicates.filter(d => d.type === 'SIMILAR_DESCRIPTION').length,
                commonPatternDuplicates: this.duplicates.filter(d => d.type === 'COMMON_PATTERN').length
            },
            duplicates: this.duplicates.slice(0, 20) // Show top 20
        };

        // Save JSON report
        const jsonPath = path.join(CONFIG.outputDir, `smart-duplicates-${timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

        console.log(`\n📊 Smart Duplicate Detection Report Generated:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`\n📈 Summary:`);
        console.log(`   Total Functions: ${reportData.summary.totalFunctions}`);
        console.log(`   Total Duplicates: ${reportData.summary.totalDuplicates}`);
        console.log(`   Exact Name Duplicates: ${reportData.summary.exactNameDuplicates}`);
        console.log(`   Similar Description Duplicates: ${reportData.summary.similarDescriptionDuplicates}`);
        console.log(`   Common Pattern Duplicates: ${reportData.summary.commonPatternDuplicates}`);

        if (this.duplicates.length > 0) {
            console.log(`\n🔍 Top Duplicates Found:`);
            this.duplicates.slice(0, 10).forEach((dup, index) => {
                console.log(`   ${index + 1}. ${dup.type} (${(dup.similarity * 100).toFixed(1)}% confidence)`);
                console.log(`      ${dup.reason}`);
                if (dup.functions.length <= 4) {
                    dup.functions.forEach(func => {
                        console.log(`      - ${func.name} in ${func.file} (${func.category})`);
                    });
                } else {
                    console.log(`      - ${dup.functions.length} functions across multiple files`);
                }
                console.log('');
            });
        }

        return reportData;
    }

    /**
     * Run the detection process
     */
    async run() {
        console.log('🧠 Starting Smart Duplicate Detection (Using Function Indexes)...\n');
        
        // Extract function indexes from core pages
        console.log('📄 Processing function indexes...');
        for (const fileName of CONFIG.corePages) {
            const filePath = path.join(CONFIG.scriptsDir, fileName);
            if (fs.existsSync(filePath)) {
                console.log(`   Processing ${fileName}...`);
                const functions = this.extractFunctionIndex(filePath);
                
                if (functions.length > 0) {
                    this.functionIndexes.set(fileName, functions);
                    console.log(`   Found ${functions.length} functions in index`);
                } else {
                    console.log(`   No functions found in index`);
                }
            } else {
                console.log(`⚠️  File not found: ${fileName}`);
            }
        }
        
        console.log(`\n📊 Total files with indexes: ${this.functionIndexes.size}`);
        
        // Detect duplicates
        this.detectDuplicates();
        
        // Generate report
        console.log('\n📝 Generating report...');
        const report = this.generateReport();
        
        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const detector = new SmartDuplicateDetector();
    detector.run().catch(console.error);
}

module.exports = SmartDuplicateDetector;
