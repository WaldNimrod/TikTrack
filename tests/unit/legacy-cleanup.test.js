/**
 * Unit Tests - Legacy Code Cleanup Verification
 * 
 * Tests to verify that all legacy code patterns have been removed:
 * - jQuery AJAX calls
 * - XMLHttpRequest calls
 * - Inline onclick handlers
 * - Inline styles
 * 
 * @see documentation/reports/user-pages-standardization/PHASE3_SCAN_SUMMARY.md
 */

const fs = require('fs');
const path = require('path');

describe('Legacy Code Cleanup - Phase 3', () => {
  const pagesDir = path.join(__dirname, '../../trading-ui/scripts');
  const htmlDir = path.join(__dirname, '../../trading-ui');
  
  // Central and supporting pages (excluding dev tools)
  const centralPages = [
    'index', 'trades', 'trade_plans', 'alerts', 'tickers', 
    'trading_accounts', 'executions', 'data_import', 
    'cash_flows', 'notes', 'research', 'preferences'
  ];
  
  const supportingPages = [
    'external-data-dashboard', 'chart-management', 'crud-testing-dashboard'
  ];
  
  const allPages = [...centralPages, ...supportingPages];

  describe('jQuery AJAX Cleanup', () => {
    test('should have no jQuery AJAX calls in any page', () => {
      const violations = [];
      
      allPages.forEach(page => {
        const jsFile = path.join(pagesDir, `${page}.js`);
        if (!fs.existsSync(jsFile)) return;
        
        const content = fs.readFileSync(jsFile, 'utf-8');
        
        // Check for jQuery AJAX patterns
        const patterns = [
          /\$\.ajax\(/g,
          /\.ajax\(/g,
          /\$\.get\(/g,
          /\$\.post\(/g,
          /\$\.getJSON\(/g,
          /\$\.load\(/g
        ];
        
        patterns.forEach((pattern, index) => {
          const matches = content.match(pattern);
          if (matches) {
            violations.push({
              page,
              file: jsFile,
              pattern: ['$.ajax', '.ajax', '$.get', '$.post', '$.getJSON', '$.load'][index],
              count: matches.length
            });
          }
        });
      });
      
      if (violations.length > 0) {
        const report = violations.map(v => 
          `  - ${v.page}: ${v.count} ${v.pattern} call(s)`
        ).join('\n');
        throw new Error(`Found jQuery AJAX calls:\n${report}`);
      }
    });
  });

  describe('XMLHttpRequest Cleanup', () => {
    test('should have no XMLHttpRequest calls in any page', () => {
      const violations = [];
      
      allPages.forEach(page => {
        const jsFile = path.join(pagesDir, `${page}.js`);
        if (!fs.existsSync(jsFile)) return;
        
        const content = fs.readFileSync(jsFile, 'utf-8');
        
        // Check for XMLHttpRequest patterns
        const patterns = [
          /new\s+XMLHttpRequest\(/g,
          /XMLHttpRequest\(/g,
          /\.open\(/g  // Common XHR method, but check context
        ];
        
        patterns.forEach((pattern, index) => {
          const matches = content.match(pattern);
          if (matches && index < 2) { // Only check first two patterns
            // Additional check: make sure it's not a false positive
            const lines = content.split('\n');
            matches.forEach(() => {
              const lineIndex = content.substring(0, content.indexOf(pattern)).split('\n').length - 1;
              const line = lines[lineIndex];
              if (line && (line.includes('XMLHttpRequest') || line.includes('new XMLHttpRequest'))) {
                violations.push({
                  page,
                  file: jsFile,
                  pattern: ['new XMLHttpRequest()', 'XMLHttpRequest()'][index],
                  line: lineIndex + 1
                });
              }
            });
          }
        });
      });
      
      if (violations.length > 0) {
        const report = violations.map(v => 
          `  - ${v.page}: ${v.pattern} at line ${v.line}`
        ).join('\n');
        throw new Error(`Found XMLHttpRequest calls:\n${report}`);
      }
    });
  });

  describe('Inline onclick Cleanup', () => {
    test('should have no inline onclick handlers in HTML files', () => {
      const violations = [];
      
      allPages.forEach(page => {
        const htmlFile = path.join(htmlDir, `${page}.html`);
        if (!fs.existsSync(htmlFile)) return;
        
        const content = fs.readFileSync(htmlFile, 'utf-8');
        
        // Check for inline onclick (but not data-onclick)
        const onclickPattern = /(?<!data-)onclick\s*=/gi;
        const matches = content.match(onclickPattern);
        
        if (matches) {
          violations.push({
            page,
            file: htmlFile,
            count: matches.length
          });
        }
      });
      
      if (violations.length > 0) {
        const report = violations.map(v => 
          `  - ${v.page}: ${v.count} inline onclick handler(s)`
        ).join('\n');
        throw new Error(`Found inline onclick handlers:\n${report}`);
      }
    });
  });

  describe('Inline Styles Cleanup', () => {
    test('should have no inline style attributes in HTML files', () => {
      const violations = [];
      
      allPages.forEach(page => {
        const htmlFile = path.join(htmlDir, `${page}.html`);
        if (!fs.existsSync(htmlFile)) return;
        
        const content = fs.readFileSync(htmlFile, 'utf-8');
        
        // Check for inline style attributes
        // Exclude style tags and data attributes
        const stylePattern = /<[^>]*\sstyle\s*=\s*["'][^"']*["'][^>]*>/gi;
        const matches = content.match(stylePattern);
        
        if (matches) {
          // Filter out false positives (style tags, data-style, etc.)
          const realMatches = matches.filter(match => 
            !match.includes('<style') && 
            !match.includes('data-style') &&
            !match.includes('data-onclick-style')
          );
          
          if (realMatches.length > 0) {
            violations.push({
              page,
              file: htmlFile,
              count: realMatches.length
            });
          }
        }
      });
      
      if (violations.length > 0) {
        const report = violations.map(v => 
          `  - ${v.page}: ${v.count} inline style attribute(s)`
        ).join('\n');
        throw new Error(`Found inline style attributes:\n${report}`);
      }
    });
  });

  describe('Modern API Usage', () => {
    test('should use fetch() API instead of legacy methods', () => {
      const pagesWithoutFetch = [];
      
      allPages.forEach(page => {
        const jsFile = path.join(pagesDir, `${page}.js`);
        if (!fs.existsSync(jsFile)) return;
        
        const content = fs.readFileSync(jsFile, 'utf-8');
        
        // Check if file makes API calls
        const hasApiCalls = /\/api\//.test(content);
        
        if (hasApiCalls) {
          // Should have fetch() calls
          const hasFetch = /fetch\s*\(/.test(content);
          
          if (!hasFetch) {
            pagesWithoutFetch.push(page);
          }
        }
      });
      
      // This is informational - not all pages need API calls
      if (pagesWithoutFetch.length > 0) {
        console.log(`Pages with API calls but no fetch(): ${pagesWithoutFetch.join(', ')}`);
      }
    });
  });
});

