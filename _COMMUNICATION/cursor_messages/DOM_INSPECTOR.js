/**
 * Phoenix DOM Inspector - Complete DOM & CSS Hierarchy Analyzer
 * ----------------------------------------------------------------
 * תפקיד: מחזיר DOM מלא ומדויק כולל כל המחלקות, היררכיה, ו-CSS computed styles
 * שימוש: העתק והדבק בקונסולת הדפדפן (F12 > Console)
 * ----------------------------------------------------------------
 */

(function() {
  'use strict';

  // Helper: Get computed styles for element
  function getComputedStyles(element) {
    const styles = window.getComputedStyle(element);
    const important = {};
    
    // Extract key CSS properties
    const props = [
      'display', 'position', 'width', 'height', 'max-width', 'min-width',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'margin-inline-start', 'margin-inline-end', 'margin-block-start', 'margin-block-end',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'padding-inline-start', 'padding-inline-end', 'padding-block-start', 'padding-block-end',
      'border', 'border-radius', 'background', 'background-color',
      'color', 'font-size', 'font-weight', 'font-family',
      'box-shadow', 'z-index', 'direction', 'text-align',
      'flex-direction', 'justify-content', 'align-items', 'gap'
    ];
    
    props.forEach(prop => {
      const value = styles.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'normal' && value !== '0px') {
        important[prop] = value;
      }
    });
    
    return important;
  }

  // Helper: Get all classes (including from stylesheets)
  function getAllClasses(element) {
    const classes = {
      html: Array.from(element.classList || []),
      computed: []
    };
    
    // Check if element matches any CSS selectors
    const sheets = Array.from(document.styleSheets);
    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          if (rule.selectorText) {
            try {
              if (element.matches(rule.selectorText)) {
                classes.computed.push(rule.selectorText);
              }
            } catch(e) {}
          }
        });
      } catch(e) {
        // Cross-origin stylesheet
      }
    });
    
    return classes;
  }

  // Recursive DOM tree builder
  function buildDOMTree(element, depth = 0, maxDepth = 20) {
    if (depth > maxDepth) return null;
    
    const node = {
      tag: element.tagName?.toLowerCase() || '#text',
      type: element.nodeType,
      depth: depth,
      id: element.id || null,
      classes: getAllClasses(element),
      attributes: {},
      text: element.textContent?.trim().substring(0, 100) || null,
      children: [],
      css: element.nodeType === 1 ? getComputedStyles(element) : null,
      lego: {
        isContainer: element.tagName === 'TT-CONTAINER',
        isSection: element.tagName === 'TT-SECTION',
        isSectionRow: element.tagName === 'TT-SECTION-ROW',
        isLego: ['TT-CONTAINER', 'TT-SECTION', 'TT-SECTION-ROW'].includes(element.tagName)
      }
    };
    
    // Get all attributes
    if (element.attributes) {
      Array.from(element.attributes).forEach(attr => {
        node.attributes[attr.name] = attr.value;
      });
    }
    
    // Process children
    if (element.childNodes && element.childNodes.length > 0) {
      Array.from(element.childNodes).forEach(child => {
        // Skip text nodes that are only whitespace
        if (child.nodeType === 3 && !child.textContent.trim()) {
          return;
        }
        const childTree = buildDOMTree(child, depth + 1, maxDepth);
        if (childTree) {
          node.children.push(childTree);
        }
      });
    }
    
    return node;
  }

  // CSS Hierarchy Analyzer
  function analyzeCSSHierarchy() {
    const analysis = {
      legoElements: [],
      customClasses: [],
      issues: [],
      recommendations: []
    };
    
    // Find all LEGO elements
    const containers = document.querySelectorAll('tt-container');
    const sections = document.querySelectorAll('tt-section');
    const rows = document.querySelectorAll('tt-section-row');
    
    analysis.legoElements = {
      containers: containers.length,
      sections: sections.length,
      rows: rows.length
    };
    
    // Find custom classes (non-LEGO)
    const allElements = document.querySelectorAll('*');
    const customClassesSet = new Set();
    
    allElements.forEach(el => {
      if (el.classList) {
        Array.from(el.classList).forEach(cls => {
          // Skip LEGO-related
          if (!cls.startsWith('tt-') && !['auth-layout-root', 'system-body'].includes(cls)) {
            customClassesSet.add(cls);
          }
        });
      }
    });
    
    analysis.customClasses = Array.from(customClassesSet).sort();
    
    // Check for issues
    // Issue 1: Custom classes that should use LEGO
    const shouldBeLego = ['card', 'section', 'container', 'row'];
    analysis.customClasses.forEach(cls => {
      if (shouldBeLego.some(lego => cls.includes(lego))) {
        analysis.issues.push({
          type: 'custom-class-should-be-lego',
          class: cls,
          recommendation: `Consider using LEGO component instead of .${cls}`
        });
      }
    });
    
    // Issue 2: Check LEGO hierarchy
    sections.forEach(section => {
      const parent = section.parentElement;
      if (parent && parent.tagName !== 'TT-CONTAINER' && !parent.closest('tt-container')) {
        analysis.issues.push({
          type: 'lego-hierarchy',
          element: section,
          issue: 'tt-section should be inside tt-container'
        });
      }
    });
    
    // Issue 3: Check for page-specific classes in auth pages
    const authClasses = ['auth-header', 'auth-title', 'auth-subtitle', 'auth-card'];
    authClasses.forEach(cls => {
      if (document.querySelector(`.${cls}`)) {
        analysis.issues.push({
          type: 'page-specific-class',
          class: cls,
          recommendation: 'Consider if this should be a LEGO component or utility class'
        });
      }
    });
    
    return analysis;
  }

  // Main execution
  function inspectDOM() {
    const root = document.querySelector('body') || document.documentElement;
    const phoenixRoot = document.querySelector('#phoenix-root') || root;
    
    const result = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      dom: buildDOMTree(phoenixRoot),
      cssAnalysis: analyzeCSSHierarchy(),
      summary: {
        totalElements: document.querySelectorAll('*').length,
        legoElements: {
          containers: document.querySelectorAll('tt-container').length,
          sections: document.querySelectorAll('tt-section').length,
          rows: document.querySelectorAll('tt-section-row').length
        },
        customClasses: document.querySelectorAll('[class]').length
      }
    };
    
    return result;
  }

  // Export to console and return
  const inspection = inspectDOM();
  
  console.log('%c🔍 PHOENIX DOM INSPECTION COMPLETE', 'font-size: 16px; font-weight: bold; color: #26baac;');
  console.log('=====================================');
  console.log('%c📊 Summary', 'font-weight: bold;');
  console.table(inspection.summary);
  console.log('%c🏗️ CSS Analysis', 'font-weight: bold;');
  console.log('LEGO Elements:', inspection.cssAnalysis.legoElements);
  console.log('Custom Classes:', inspection.cssAnalysis.customClasses);
  if (inspection.cssAnalysis.issues.length > 0) {
    console.warn('%c⚠️ Issues Found:', 'font-weight: bold; color: orange;');
    inspection.cssAnalysis.issues.forEach(issue => {
      console.warn(`- ${issue.type}: ${issue.class || issue.element?.tagName}`, issue);
    });
  }
  console.log('%c🌳 Full DOM Tree', 'font-weight: bold;');
  console.log(inspection.dom);
  console.log('=====================================');
  console.log('%c💾 Full result available as: window.phoenixDOMInspection', 'color: #26baac;');
  console.log('%c📋 Use: copy(JSON.stringify(window.phoenixDOMInspection, null, 2))', 'color: #666;');
  
  // Make available globally
  window.phoenixDOMInspection = inspection;
  
  // Helper function to copy JSON
  window.copyPhoenixDOM = function() {
    const json = JSON.stringify(inspection, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => {
        console.log('✅ DOM inspection copied to clipboard!');
      });
    } else {
      console.log('📋 Copy this JSON:');
      console.log(json);
    }
  };
  
  return inspection;
})();
