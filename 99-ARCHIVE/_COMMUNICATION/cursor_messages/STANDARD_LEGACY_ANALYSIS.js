/**
 * Standard Legacy Page Analysis Script
 * ====================================
 * 
 * Purpose: Initial analysis script run on legacy HTML files
 * Usage: Copy and paste into browser console when viewing legacy page
 * 
 * This script extracts:
 * - DOM structure and hierarchy
 * - CSS classes and IDs inventory
 * - Component patterns
 * - Styling approach
 * - JavaScript dependencies
 * - RTL/LTR considerations
 */

(function() {
  'use strict';

  console.log('%c🔍 STANDARD LEGACY PAGE ANALYSIS', 'font-size: 16px; font-weight: bold; color: #26baac;');
  console.log('=====================================\n');

  const analysis = {
    pageTitle: document.title,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    structure: {},
    classes: new Set(),
    ids: new Set(),
    components: [],
    styles: {},
    scripts: [],
    rtl: false
  };

  // Check RTL
  analysis.rtl = document.documentElement.dir === 'rtl' || 
                 document.documentElement.getAttribute('dir') === 'rtl' ||
                 document.body.dir === 'rtl';

  // Collect all classes and IDs
  document.querySelectorAll('*').forEach(el => {
    if (el.className && typeof el.className === 'string') {
      el.className.split(/\s+/).forEach(cls => {
        if (cls) analysis.classes.add(cls);
      });
    }
    if (el.id) analysis.ids.add(el.id);
  });

  // Analyze structure
  function analyzeElement(el, depth = 0) {
    const info = {
      tag: el.tagName.toLowerCase(),
      classes: el.className ? el.className.split(/\s+/).filter(c => c) : [],
      id: el.id || null,
      text: el.textContent ? el.textContent.trim().substring(0, 50) : '',
      children: []
    };

    Array.from(el.children).forEach(child => {
      info.children.push(analyzeElement(child, depth + 1));
    });

    return info;
  }

  analysis.structure = analyzeElement(document.body);

  // Find components (common patterns)
  const componentPatterns = [
    { selector: 'form', name: 'Forms' },
    { selector: 'table', name: 'Tables' },
    { selector: '[class*="card"]', name: 'Cards' },
    { selector: '[class*="modal"]', name: 'Modals' },
    { selector: '[class*="dropdown"]', name: 'Dropdowns' },
    { selector: '[class*="nav"]', name: 'Navigation' },
    { selector: '[class*="btn"]', name: 'Buttons' },
    { selector: '[class*="input"]', name: 'Inputs' }
  ];

  componentPatterns.forEach(pattern => {
    const elements = document.querySelectorAll(pattern.selector);
    if (elements.length > 0) {
      analysis.components.push({
        type: pattern.name,
        count: elements.length,
        classes: Array.from(new Set(
          Array.from(elements).flatMap(el => 
            el.className ? el.className.split(/\s+/) : []
          )
        ))
      });
    }
  });

  // Collect script sources
  document.querySelectorAll('script[src]').forEach(script => {
    analysis.scripts.push(script.src);
  });

  // Collect inline styles
  document.querySelectorAll('[style]').forEach(el => {
    const style = el.getAttribute('style');
    const classes = el.className ? el.className.split(/\s+/) : ['no-class'];
    classes.forEach(cls => {
      if (!analysis.styles[cls]) analysis.styles[cls] = [];
      analysis.styles[cls].push(style);
    });
  });

  // Output results
  console.log('📄 Page Information:');
  console.log(`   Title: ${analysis.pageTitle}`);
  console.log(`   URL: ${analysis.url}`);
  console.log(`   RTL: ${analysis.rtl ? '✅ Yes' : '❌ No'}`);
  console.log(`   Timestamp: ${analysis.timestamp}\n`);

  console.log('🏗️ Structure:');
  console.log(`   Total Elements: ${document.querySelectorAll('*').length}`);
  console.log(`   Unique Classes: ${analysis.classes.size}`);
  console.log(`   Unique IDs: ${analysis.ids.size}\n`);

  console.log('🧩 Components Found:');
  analysis.components.forEach(comp => {
    console.log(`   ${comp.type}: ${comp.count} instances`);
    if (comp.classes.length > 0) {
      console.log(`      Classes: ${comp.classes.slice(0, 5).join(', ')}${comp.classes.length > 5 ? '...' : ''}`);
    }
  });
  console.log('');

  console.log('📋 Top 20 Classes:');
  Array.from(analysis.classes).slice(0, 20).forEach((cls, i) => {
    const count = document.querySelectorAll(`.${cls}`).length;
    console.log(`   ${i + 1}. .${cls} (${count} instances)`);
  });
  console.log('');

  if (Object.keys(analysis.styles).length > 0) {
    console.log('⚠️ Inline Styles Found:');
    Object.keys(analysis.styles).slice(0, 10).forEach(cls => {
      console.log(`   .${cls}: ${analysis.styles[cls].length} inline styles`);
    });
    console.log('');
  }

  if (analysis.scripts.length > 0) {
    console.log('📜 External Scripts:');
    analysis.scripts.forEach(script => {
      console.log(`   ${script}`);
    });
    console.log('');
  }

  // Export for further analysis
  window.LEGACY_ANALYSIS = analysis;
  console.log('✅ Analysis complete! Data available in window.LEGACY_ANALYSIS');
  console.log('💾 Copy this object for further processing:\n');
  console.log(JSON.stringify(analysis, null, 2));

  return analysis;
})();
