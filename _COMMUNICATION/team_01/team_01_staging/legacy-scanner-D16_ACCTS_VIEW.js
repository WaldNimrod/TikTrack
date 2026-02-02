/**
 * Phoenix-Legacy-Scanner-Ver: v1.0.0 | Legacy Page Scanner
 * Sync-Time: 2026-02-01 20:30:00 IST
 * Team: Team 31 (Blueprint)
 * Status: ✅ LEGACY SCANNER FOR D16_ACCTS_VIEW
 * 
 * Purpose:
 * Scans legacy HTML file (D16_ACCTS_VIEW.html) at runtime to extract:
 * - Page structure and components
 * - Content elements and their hierarchy
 * - Styling classes and patterns
 * - Interactive elements (buttons, forms, etc.)
 * - Data structure and relationships
 * 
 * Usage:
 * Run this script in browser console while viewing the legacy page,
 * or load it as a bookmarklet/extension to scan the page structure.
 * 
 * Output:
 * Generates a comprehensive report of the legacy page structure
 * to guide Phoenix V2 implementation.
 */

(function scanLegacyPage() {
  'use strict';
  
  console.log('🔍 Phoenix Legacy Scanner: Starting scan of D16_ACCTS_VIEW.html');
  console.log('='.repeat(80));
  
  const report = {
    pageTitle: document.title,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    structure: {},
    components: [],
    styles: [],
    interactions: [],
    data: []
  };
  
  // 1. Scan Page Structure
  console.log('\n📐 Scanning Page Structure...');
  const body = document.body;
  report.structure = {
    hasGlobalPageTemplate: !!document.querySelector('GlobalPageTemplate'),
    hasTtSection: !!document.querySelector('TtSection'),
    hasTtSectionRow: !!document.querySelector('TtSectionRow'),
    hasFooter: !!document.querySelector('footer'),
    bodyClasses: Array.from(body.classList),
    bodyDirectChildren: Array.from(body.children).map(child => ({
      tagName: child.tagName,
      className: child.className,
      id: child.id
    }))
  };
  
  // 2. Scan Components
  console.log('\n🧩 Scanning Components...');
  const accountCards = document.querySelectorAll('.account-card');
  accountCards.forEach((card, index) => {
    const component = {
      type: 'account-card',
      index: index,
      title: card.querySelector('.card-title')?.textContent?.trim(),
      balances: [],
      status: card.querySelector('.card-footer')?.textContent?.trim(),
      classes: Array.from(card.classList),
      structure: {
        hasTitle: !!card.querySelector('.card-title'),
        hasBalanceGrid: !!card.querySelector('.balance-grid'),
        hasFooter: !!card.querySelector('.card-footer')
      }
    };
    
    // Extract balance items
    const balanceItems = card.querySelectorAll('.balance-item');
    balanceItems.forEach(item => {
      const currency = item.querySelector('.currency')?.textContent?.trim();
      const amount = item.querySelector('.amount')?.textContent?.trim();
      component.balances.push({ currency, amount });
    });
    
    report.components.push(component);
  });
  
  // 3. Scan Styles
  console.log('\n🎨 Scanning Styles...');
  const allElements = document.querySelectorAll('*');
  const classSet = new Set();
  allElements.forEach(el => {
    if (el.className && typeof el.className === 'string') {
      el.className.split(' ').forEach(cls => {
        if (cls.trim()) classSet.add(cls.trim());
      });
    }
  });
  report.styles = Array.from(classSet).sort();
  
  // 4. Scan Interactions
  console.log('\n🖱️ Scanning Interactions...');
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    report.interactions.push({
      type: 'button',
      text: btn.textContent?.trim(),
      classes: Array.from(btn.classList),
      id: btn.id,
      onClick: btn.getAttribute('onclick') || null
    });
  });
  
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    if (link.href && link.href !== '#') {
      report.interactions.push({
        type: 'link',
        text: link.textContent?.trim(),
        href: link.href,
        classes: Array.from(link.classList)
      });
    }
  });
  
  // 5. Scan Data Structure
  console.log('\n📊 Scanning Data Structure...');
  const sections = document.querySelectorAll('TtSection');
  sections.forEach((section, index) => {
    const sectionData = {
      index: index,
      title: section.getAttribute('title') || section.querySelector('[title]')?.getAttribute('title'),
      hasRows: !!section.querySelector('TtSectionRow'),
      rowCount: section.querySelectorAll('TtSectionRow').length,
      componentCount: section.querySelectorAll('.account-card').length,
      hasActions: !!section.querySelector('.section-actions-footer')
    };
    report.data.push(sectionData);
  });
  
  // 6. Extract Entity Context
  const globalTemplate = document.querySelector('GlobalPageTemplate');
  if (globalTemplate) {
    report.entityContext = globalTemplate.getAttribute('entityContext');
    report.pageTitleAttr = globalTemplate.getAttribute('pageTitle');
  }
  
  // 7. Output Report
  console.log('\n📋 SCAN COMPLETE - Full Report:');
  console.log('='.repeat(80));
  console.log(JSON.stringify(report, null, 2));
  console.log('='.repeat(80));
  
  // 8. Generate Summary
  console.log('\n📊 SUMMARY:');
  console.log(`Page Title: ${report.pageTitle}`);
  console.log(`Entity Context: ${report.entityContext || 'N/A'}`);
  console.log(`Account Cards Found: ${report.components.length}`);
  console.log(`Unique CSS Classes: ${report.styles.length}`);
  console.log(`Interactive Elements: ${report.interactions.length}`);
  console.log(`Sections: ${report.data.length}`);
  
  // 9. Save to window for export
  window.phoenixLegacyScan = report;
  console.log('\n💾 Report saved to window.phoenixLegacyScan');
  console.log('📋 Copy with: JSON.stringify(window.phoenixLegacyScan, null, 2)');
  
  return report;
})();
