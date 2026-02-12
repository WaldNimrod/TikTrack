/**
 * INDEX PAGE COMPLETE INSPECTOR - Team 31 (Blueprint)
 * ====================================================
 * כלי ניתוח מפורט לדף הבית (Index/Dashboard)
 * 
 * שימוש:
 * 1. פתח את דף הבית (Index) בדפדפן (Phoenix או Legacy)
 * 2. פתח קונסולה (F12 > Console)
 * 3. העתק והדבק את הקוד הזה
 * 4. הסקריפט יציג דוח מפורט על כל המבנה, הסגנונות והאלמנטים
 * 
 * גרסה: 1.0.0
 * תאריך: 2026-01-31
 * Team: Team 31 (Blueprint)
 */

(function() {
  'use strict';

  console.log('%c🔍 INDEX PAGE COMPLETE INSPECTOR', 'font-size: 16px; font-weight: bold; color: #26baac;');
  console.log('=====================================\n');

  const analysis = {
    pageTitle: document.title,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    isLegacy: window.location.href.includes('Legace') || document.querySelector('.background-wrapper') !== null,
    structure: {},
    sections: [],
    components: [],
    styles: {},
    rtl: false
  };

  // Check RTL
  analysis.rtl = document.documentElement.dir === 'rtl' || 
                 document.documentElement.getAttribute('dir') === 'rtl' ||
                 document.body.dir === 'rtl';

  // Helper: Get computed styles
  function getComputedStyles(element) {
    const styles = window.getComputedStyle(element);
    return {
      display: styles.display,
      position: styles.position,
      width: styles.width,
      height: styles.height,
      padding: styles.padding,
      margin: styles.margin,
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      border: styles.border,
      borderRadius: styles.borderRadius
    };
  }

  // Helper: Parse numeric values
  function parsePx(value) {
    if (!value) return null;
    const match = value.match(/([\d.]+)px/);
    return match ? parseFloat(match[1]) : null;
  }

  // Analyze Header
  function analyzeHeader() {
    const header = document.getElementById('unified-header');
    if (!header) {
      return { exists: false };
    }

    const rect = header.getBoundingClientRect();
    const styles = getComputedStyles(header);
    
    return {
      exists: true,
      height: rect.height,
      width: rect.width,
      zIndex: styles.zIndex,
      backgroundColor: styles.backgroundColor,
      structure: {
        headerTop: analyzeElement('.header-top'),
        headerFilters: analyzeElement('.header-filters'),
        logo: analyzeElement('.logo-section'),
        nav: analyzeElement('.header-nav')
      }
    };
  }

  // Analyze Element
  function analyzeElement(selector) {
    const element = document.querySelector(selector);
    if (!element) return { exists: false };

    const rect = element.getBoundingClientRect();
    const styles = getComputedStyles(element);
    
    return {
      exists: true,
      height: rect.height,
      width: rect.width,
      padding: styles.padding,
      margin: styles.margin,
      display: styles.display,
      classes: Array.from(element.classList || [])
    };
  }

  // Analyze Sections
  function analyzeSections() {
    const sections = [];
    
    // Legacy sections
    const legacySections = document.querySelectorAll('.top-section, .content-section, .main-content');
    legacySections.forEach((section, index) => {
      const header = section.querySelector('.section-header');
      const body = section.querySelector('.section-body');
      
      sections.push({
        type: 'legacy',
        index: index,
        selector: section.className,
        header: header ? {
          title: header.querySelector('.table-title')?.textContent?.trim(),
          icon: header.querySelector('.section-icon')?.src,
          actions: Array.from(header.querySelectorAll('.table-actions button')).map(btn => ({
            type: btn.getAttribute('data-button-type'),
            tooltip: btn.getAttribute('data-tooltip')
          }))
        } : null,
        body: body ? {
          hasContent: body.children.length > 0,
          widgets: Array.from(body.querySelectorAll('[class*="widget"], [class*="card"]')).map(w => ({
            class: w.className,
            type: w.tagName.toLowerCase()
          }))
        } : null
      });
    });

    // Phoenix sections (LEGO)
    const phoenixSections = document.querySelectorAll('tt-section');
    phoenixSections.forEach((section, index) => {
      const header = section.querySelector('.index-section__header, .dashboard-section__header');
      const body = section.querySelector('.index-section__body, .dashboard-section__body');
      
      sections.push({
        type: 'phoenix',
        index: index,
        dataSection: section.getAttribute('data-section'),
        header: header ? {
          title: header.querySelector('.index-section__header-text, .dashboard-section__header-text')?.textContent?.trim(),
          icon: header.querySelector('.index-section__header-icon, .dashboard-section__header-icon'),
          meta: header.querySelector('.index-section__header-count, .dashboard-section__header-count')?.textContent?.trim(),
          actions: Array.from(header.querySelectorAll('button')).map(btn => ({
            ariaLabel: btn.getAttribute('aria-label'),
            class: btn.className
          }))
        } : null,
        body: body ? {
          hasContent: body.children.length > 0,
          components: Array.from(body.children).map(child => ({
            tag: child.tagName.toLowerCase(),
            class: child.className,
            id: child.id
          }))
        } : null
      });
    });

    return sections;
  }

  // Analyze Components
  function analyzeComponents() {
    const components = [];

    // Active Alerts
    const activeAlerts = document.querySelector('.active-alerts');
    if (activeAlerts) {
      components.push({
        type: 'active-alerts',
        exists: true,
        header: {
          title: activeAlerts.querySelector('.active-alerts__title-text')?.textContent?.trim(),
          count: activeAlerts.querySelector('.active-alerts__count-badge')?.textContent?.trim()
        },
        body: {
          isEmpty: activeAlerts.querySelector('.active-alerts__empty') !== null,
          hasList: activeAlerts.querySelector('.active-alerts__list') !== null,
          itemsCount: activeAlerts.querySelectorAll('.active-alerts__card').length
        }
      });
    }

    // Info Summary
    const infoSummary = document.querySelector('.info-summary');
    if (infoSummary) {
      const items = Array.from(infoSummary.querySelectorAll('.info-summary__item'));
      components.push({
        type: 'info-summary',
        exists: true,
        items: items.map(item => ({
          label: item.querySelector('.info-summary__label')?.textContent?.trim(),
          value: item.querySelector('.info-summary__value')?.textContent?.trim()
        }))
      });
    }

    // Portfolio Summary (Legacy uses .info-summary.portfolio-summary-card)
    const portfolioSummary = document.querySelector('.info-summary.portfolio-summary-card, .portfolio-summary');
    if (portfolioSummary) {
      const statsRow = portfolioSummary.querySelector('.portfolio-summary__stats-row, .d-flex.flex-wrap');
      const stats = statsRow ? Array.from(statsRow.querySelectorAll('span')).map(s => s.textContent?.trim()).filter(Boolean) : [];
      components.push({
        type: 'portfolio-summary',
        exists: true,
        stats: stats.length > 0 ? stats : statsRow?.textContent?.trim() || 'N/A',
        hasToggleBtn: portfolioSummary.querySelector('button') !== null
      });
    }

    // Widget Placeholders
    const widgets = document.querySelectorAll('.widget-placeholder');
    if (widgets.length > 0) {
      components.push({
        type: 'widget-placeholders',
        count: widgets.length,
        widgets: Array.from(widgets).map(w => ({
          title: w.querySelector('.widget-placeholder__title')?.textContent?.trim(),
          text: w.querySelector('.widget-placeholder__text')?.textContent?.trim()
        }))
      });
    }

    return components;
  }

  // Analyze LEGO Components
  function analyzeLEGO() {
    const lego = {
      containers: document.querySelectorAll('tt-container').length,
      sections: document.querySelectorAll('tt-section').length,
      sectionRows: document.querySelectorAll('tt-section-row').length
    };

    return lego;
  }

  // Run Analysis
  analysis.header = analyzeHeader();
  analysis.sections = analyzeSections();
  analysis.components = analyzeComponents();
  analysis.lego = analyzeLEGO();

  // Output Results
  console.log('📄 Page Information:');
  console.log(`   Title: ${analysis.pageTitle}`);
  console.log(`   URL: ${analysis.url}`);
  console.log(`   Type: ${analysis.isLegacy ? 'Legacy' : 'Phoenix'}`);
  console.log(`   RTL: ${analysis.rtl ? '✅ Yes' : '❌ No'}`);
  console.log(`   Timestamp: ${analysis.timestamp}\n`);

  console.log('🏗️ Header Analysis:');
  if (analysis.header.exists) {
    console.log(`   Height: ${analysis.header.height}px`);
    console.log(`   Width: ${analysis.header.width}px`);
    console.log(`   Z-Index: ${analysis.header.zIndex}`);
    console.log(`   Background: ${analysis.header.backgroundColor}`);
    if (analysis.header.structure.headerTop.exists) {
      console.log(`   Top Row Height: ${analysis.header.structure.headerTop.height}px`);
    }
    if (analysis.header.structure.headerFilters.exists) {
      console.log(`   Filters Row Height: ${analysis.header.structure.headerFilters.height}px`);
    }
  } else {
    console.log('   ❌ Header not found');
  }
  console.log('');

  console.log('📋 Sections Analysis:');
  console.log(`   Total Sections: ${analysis.sections.length}`);
  analysis.sections.forEach((section, index) => {
    console.log(`   ${index + 1}. ${section.type.toUpperCase()} Section:`);
    if (section.header) {
      console.log(`      Title: ${section.header.title || 'N/A'}`);
      if (section.header.meta) {
        console.log(`      Meta: ${section.header.meta}`);
      }
    }
    if (section.body) {
      console.log(`      Has Content: ${section.body.hasContent ? 'Yes' : 'No'}`);
      if (section.body.components) {
        console.log(`      Components: ${section.body.components.length}`);
      }
      if (section.body.widgets) {
        console.log(`      Widgets: ${section.body.widgets.length}`);
      }
    }
  });
  console.log('');

  console.log('🧩 Components Analysis:');
  analysis.components.forEach((comp, index) => {
    console.log(`   ${index + 1}. ${comp.type}:`);
    if (comp.exists !== undefined) {
      console.log(`      Exists: ${comp.exists ? 'Yes' : 'No'}`);
    }
    if (comp.count !== undefined) {
      console.log(`      Count: ${comp.count}`);
    }
    if (comp.header) {
      console.log(`      Header: ${JSON.stringify(comp.header)}`);
    }
    if (comp.items) {
      console.log(`      Items: ${comp.items.length}`);
    }
  });
  console.log('');

  console.log('🧱 LEGO Components:');
  console.log(`   Containers: ${analysis.lego.containers}`);
  console.log(`   Sections: ${analysis.lego.sections}`);
  console.log(`   Section Rows: ${analysis.lego.sectionRows}`);
  console.log('');

  // Export for further analysis
  window.INDEX_ANALYSIS = analysis;
  console.log('✅ Analysis complete! Data available in window.INDEX_ANALYSIS');
  console.log('💾 Copy this object for further processing:\n');
  console.log(JSON.stringify(analysis, null, 2));

  return analysis;
})();
