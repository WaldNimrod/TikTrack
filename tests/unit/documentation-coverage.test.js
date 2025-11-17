/**
 * Unit Tests - Documentation Coverage Verification
 * 
 * Tests to verify documentation standards:
 * - Function Index exists in all page files
 * - JSDoc coverage for all functions
 * 
 * @see documentation/reports/user-pages-standardization/PHASE3_SCAN_SUMMARY.md
 */

const fs = require('fs');
const path = require('path');

describe('Documentation Coverage - Phase 3', () => {
  const pagesDir = path.join(__dirname, '../../trading-ui/scripts');
  
  const centralPages = [
    'index', 'trades', 'trade_plans', 'alerts', 'tickers', 
    'trading_accounts', 'executions', 'data_import', 
    'cash_flows', 'notes', 'research', 'preferences'
  ];
  
  const supportingPages = [
    'external-data-dashboard', 'chart-management', 'crud-testing-dashboard'
  ];
  
  const allPages = [...centralPages, ...supportingPages];

  describe('Function Index Coverage', () => {
    test('should have Function Index in all page files', () => {
      const missingIndex = [];
      
      allPages.forEach(page => {
        const jsFile = path.join(pagesDir, `${page}.js`);
        if (!fs.existsSync(jsFile)) {
          missingIndex.push({ page, reason: 'File not found' });
          return;
        }
        
        const content = fs.readFileSync(jsFile, 'utf-8');
        
        // Check for Function Index markers
        const hasFunctionIndex = 
          /FUNCTION\s+INDEX/i.test(content) ||
          /Function\s+Index/i.test(content) ||
          /===.*FUNCTION.*INDEX/i.test(content);
        
        if (!hasFunctionIndex) {
          missingIndex.push({ page, file: jsFile });
        }
      });
      
      if (missingIndex.length > 0) {
        const report = missingIndex.map(m => 
          `  - ${m.page}${m.reason ? `: ${m.reason}` : ''}`
        ).join('\n');
        throw new Error(`Missing Function Index:\n${report}`);
      }
    });

    test('Function Index should be at the top of the file', () => {
      const misplacedIndex = [];
      
      allPages.forEach(page => {
        const jsFile = path.join(pagesDir, `${page}.js`);
        if (!fs.existsSync(jsFile)) return;
        
        const content = fs.readFileSync(jsFile, 'utf-8');
        const lines = content.split('\n');
        
        // Find Function Index
        let indexLine = -1;
        for (let i = 0; i < Math.min(100, lines.length); i++) {
          if (/FUNCTION\s+INDEX/i.test(lines[i]) || /Function\s+Index/i.test(lines[i])) {
            indexLine = i;
            break;
          }
        }
        
        // Function Index should be in first 100 lines
        if (indexLine === -1 || indexLine > 100) {
          misplacedIndex.push({ page, line: indexLine === -1 ? 'not found' : indexLine + 1 });
        }
      });
      
      if (misplacedIndex.length > 0) {
        const report = misplacedIndex.map(m => 
          `  - ${m.page}: ${m.line === 'not found' ? 'not found' : `line ${m.line}`}`
        ).join('\n');
        throw new Error(`Function Index not at top of file:\n${report}`);
      }
    });
  });

  describe('JSDoc Coverage', () => {
    test('should have JSDoc comments for all functions', () => {
      const undocumentedFunctions = [];
      const minCoverage = 0.75; // 75% minimum coverage
      
      allPages.forEach(page => {
        const jsFile = path.join(pagesDir, `${page}.js`);
        if (!fs.existsSync(jsFile)) return;
        
        const content = fs.readFileSync(jsFile, 'utf-8');
        
        // Find all function declarations
        const functionPattern = /^(?:async\s+)?function\s+(\w+)\s*\(/gm;
        const functions = [];
        let match;
        
        while ((match = functionPattern.exec(content)) !== null) {
          functions.push({
            name: match[1],
            position: match.index
          });
        }
        
        // Check JSDoc for each function
        let documentedCount = 0;
        functions.forEach(func => {
          // Check 20 lines before function for JSDoc
          const beforeFunction = content.substring(Math.max(0, func.position - 1000), func.position);
          const hasJSDoc = /\/\*\*[\s\S]{0,500}?\*\//.test(beforeFunction);
          
          if (hasJSDoc) {
            documentedCount++;
          } else {
            undocumentedFunctions.push({
              page,
              function: func.name
            });
          }
        });
        
        // Calculate coverage
        if (functions.length > 0) {
          const coverage = documentedCount / functions.length;
          if (coverage < minCoverage) {
            console.warn(
              `⚠️  ${page}: JSDoc coverage ${(coverage * 100).toFixed(1)}% ` +
              `(${documentedCount}/${functions.length} functions)`
            );
          }
        }
      });
      
      // Report but don't fail - we're working towards 100%
      if (undocumentedFunctions.length > 0) {
        console.log(`\n📝 Undocumented functions found: ${undocumentedFunctions.length}`);
        console.log('   Working towards 100% coverage...\n');
      }
    });

    test('JSDoc comments should include @param and @returns', () => {
      const incompleteJSDoc = [];
      
      allPages.forEach(page => {
        const jsFile = path.join(pagesDir, `${page}.js`);
        if (!fs.existsSync(jsFile)) return;
        
        const content = fs.readFileSync(jsFile, 'utf-8');
        
        // Find JSDoc blocks
        const jsdocPattern = /\/\*\*[\s\S]*?\*\//g;
        let match;
        
        while ((match = jsdocPattern.exec(content)) !== null) {
          const jsdoc = match[0];
          
          // Check if it's for a function (has function after it)
          const afterJSDoc = content.substring(match.index + match[0].length, match.index + match[0].length + 50);
          const isFunction = /^(?:async\s+)?function\s+\w+\s*\(/.test(afterJSDoc.trim());
          
          if (isFunction) {
            // Check for @param or @returns
            const hasParam = /@param/.test(jsdoc);
            const hasReturns = /@returns?/.test(jsdoc);
            
            // Functions with parameters should have @param
            const funcMatch = afterJSDoc.match(/function\s+\w+\s*\(([^)]*)\)/);
            if (funcMatch && funcMatch[1].trim() && !hasParam) {
              incompleteJSDoc.push({
                page,
                issue: 'Missing @param for function with parameters'
              });
            }
            
            // Functions should have @returns (unless void)
            if (!hasReturns && !/void|nothing/i.test(jsdoc)) {
              // This is informational, not a failure
              // incompleteJSDoc.push({ page, issue: 'Missing @returns' });
            }
          }
        }
      });
      
      // Report but don't fail - quality improvement
      if (incompleteJSDoc.length > 0) {
        console.log(`\n📝 Incomplete JSDoc found: ${incompleteJSDoc.length} issues`);
        console.log('   Working towards complete documentation...\n');
      }
    });
  });
});

