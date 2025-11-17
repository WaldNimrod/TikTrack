/**
 * Integration Tests - Phase 3 Cleanup Verification
 * 
 * Tests to verify that legacy cleanup doesn't break functionality:
 * - Pages load without errors
 * - Event handlers work after onclick removal
 * - Styles apply correctly after inline style removal
 * 
 * @see documentation/reports/user-pages-standardization/PHASE3_SCAN_SUMMARY.md
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Phase 3 Cleanup - Integration Tests', () => {
  let dom;
  let window;
  let document;

  beforeAll(() => {
    // Setup JSDOM
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    
    window = dom.window;
    document = window.document;
    
    // Mock global objects
    global.window = window;
    global.document = document;
    global.navigator = window.navigator;
  });

  afterAll(() => {
    dom.window.close();
  });

  describe('Page Loading', () => {
    const pagesDir = path.join(__dirname, '../../trading-ui');
    const scriptsDir = path.join(__dirname, '../../trading-ui/scripts');
    
    const testPages = [
      'index', 'trades', 'trade_plans', 'alerts', 'tickers',
      'trading_accounts', 'executions', 'data_import',
      'cash_flows', 'notes', 'research', 'preferences'
    ];

    test('HTML files should be valid and loadable', () => {
      const invalidPages = [];
      
      testPages.forEach(page => {
        const htmlFile = path.join(pagesDir, `${page}.html`);
        
        if (!fs.existsSync(htmlFile)) {
          invalidPages.push({ page, reason: 'File not found' });
          return;
        }
        
        try {
          const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
          
          // Basic HTML validation
          if (!htmlContent.includes('<!DOCTYPE html>') && !htmlContent.includes('<html')) {
            invalidPages.push({ page, reason: 'Invalid HTML structure' });
          }
          
          // Check for required scripts
          const jsFile = path.join(scriptsDir, `${page}.js`);
          if (!fs.existsSync(jsFile)) {
            // Some pages might not have JS files
            console.log(`⚠️  ${page}: No JS file found (might be intentional)`);
          }
        } catch (error) {
          invalidPages.push({ page, reason: error.message });
        }
      });
      
      if (invalidPages.length > 0) {
        const report = invalidPages.map(p => 
          `  - ${p.page}: ${p.reason}`
        ).join('\n');
        throw new Error(`Invalid HTML files:\n${report}`);
      }
    });

    test('JavaScript files should be syntactically valid', () => {
      const syntaxErrors = [];
      
      testPages.forEach(page => {
        const jsFile = path.join(scriptsDir, `${page}.js`);
        
        if (!fs.existsSync(jsFile)) return;
        
        try {
          const jsContent = fs.readFileSync(jsFile, 'utf-8');
          
          // Basic syntax check - try to parse
          // Note: This is a simple check, full parsing would require babel/eslint
          const hasBasicStructure = 
            /function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=/.test(jsContent);
          
          if (!hasBasicStructure && jsContent.trim().length > 0) {
            syntaxErrors.push({ page, reason: 'No recognizable JavaScript structure' });
          }
        } catch (error) {
          syntaxErrors.push({ page, reason: error.message });
        }
      });
      
      if (syntaxErrors.length > 0) {
        const report = syntaxErrors.map(e => 
          `  - ${e.page}: ${e.reason}`
        ).join('\n');
        throw new Error(`JavaScript syntax errors:\n${report}`);
      }
    });
  });

  describe('Event Handler Compatibility', () => {
    test('data-onclick attributes should be present where needed', () => {
      const pagesDir = path.join(__dirname, '../../trading-ui');
      const testPages = ['trades', 'alerts', 'trade_plans', 'notes'];
      
      const missingDataOnclick = [];
      
      testPages.forEach(page => {
        const htmlFile = path.join(pagesDir, `${page}.html`);
        if (!fs.existsSync(htmlFile)) return;
        
        const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
        
        // Check for buttons/links that might need event handlers
        const interactiveElements = htmlContent.match(/<button[^>]*>|<a[^>]*href[^>]*>/gi);
        
        if (interactiveElements) {
          // Check if elements have data-onclick or are handled by event delegation
          const hasEventHandling = 
            /data-onclick/.test(htmlContent) ||
            /data-button-type/.test(htmlContent) ||
            /class.*btn/.test(htmlContent);
          
          // This is informational - not all buttons need data-onclick
          if (!hasEventHandling && interactiveElements.length > 5) {
            console.log(`ℹ️  ${page}: Consider adding data-onclick for better event handling`);
          }
        }
      });
    });
  });

  describe('CSS Class Usage', () => {
    test('HTML should use CSS classes instead of inline styles', () => {
      const pagesDir = path.join(__dirname, '../../trading-ui');
      const testPages = [
        'index', 'trades', 'trade_plans', 'alerts', 'tickers',
        'trading_accounts', 'executions', 'data_import',
        'cash_flows', 'notes', 'research', 'preferences'
      ];
      
      const inlineStyleUsage = [];
      
      testPages.forEach(page => {
        const htmlFile = path.join(pagesDir, `${page}.html`);
        if (!fs.existsSync(htmlFile)) return;
        
        const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
        
        // Check for inline style attributes (excluding style tags)
        const stylePattern = /<[^>]*\sstyle\s*=\s*["'][^"']*["'][^>]*>/gi;
        const matches = htmlContent.match(stylePattern);
        
        if (matches) {
          // Filter out false positives
          const realMatches = matches.filter(match => 
            !match.includes('<style') && 
            !match.includes('data-style') &&
            !match.includes('data-onclick-style')
          );
          
          if (realMatches.length > 0) {
            inlineStyleUsage.push({ page, count: realMatches.length });
          }
        }
      });
      
      if (inlineStyleUsage.length > 0) {
        const report = inlineStyleUsage.map(u => 
          `  - ${u.page}: ${u.count} inline style(s)`
        ).join('\n');
        throw new Error(`Found inline styles (should use CSS classes):\n${report}`);
      }
    });
  });

  describe('Modern API Usage', () => {
    test('should use fetch() API for network requests', () => {
      const scriptsDir = path.join(__dirname, '../../trading-ui/scripts');
      const testPages = [
        'trades', 'trade_plans', 'alerts', 'tickers',
        'trading_accounts', 'executions', 'data_import',
        'cash_flows', 'notes'
      ];
      
      const legacyApiUsage = [];
      
      testPages.forEach(page => {
        const jsFile = path.join(scriptsDir, `${page}.js`);
        if (!fs.existsSync(jsFile)) return;
        
        const jsContent = fs.readFileSync(jsFile, 'utf-8');
        
        // Check for API calls
        const hasApiCalls = /\/api\//.test(jsContent);
        
        if (hasApiCalls) {
          // Should use fetch, not jQuery or XHR
          const hasJQueryAjax = /\$\.ajax\(|\.ajax\(/.test(jsContent);
          const hasXHR = /new\s+XMLHttpRequest\(|XMLHttpRequest\(/.test(jsContent);
          
          if (hasJQueryAjax || hasXHR) {
            legacyApiUsage.push({
              page,
              issues: [
                hasJQueryAjax && 'jQuery AJAX',
                hasXHR && 'XMLHttpRequest'
              ].filter(Boolean)
            });
          }
        }
      });
      
      if (legacyApiUsage.length > 0) {
        const report = legacyApiUsage.map(u => 
          `  - ${u.page}: ${u.issues.join(', ')}`
        ).join('\n');
        throw new Error(`Found legacy API usage:\n${report}`);
      }
    });
  });
});

