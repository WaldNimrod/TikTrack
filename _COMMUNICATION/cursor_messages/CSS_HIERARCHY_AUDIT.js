/**
 * CSS HIERARCHY AUDIT - Team 30 Frontend
 * ========================================
 * כלי לבדיקת היררכיית CSS, כפילויות ועמידה בסטנדרט הלגסי
 * 
 * שימוש:
 * 1. פתח את הדף בדפדפן
 * 2. פתח קונסולה (F12 > Console)
 * 3. העתק והדבק את הקוד הזה
 * 4. הסקריפט יציג דוח מפורט על כל המחלקות והסגנונות
 * 
 * גרסה: 1.0.0
 * תאריך: 2026-01-31
 */

(function() {
  'use strict';

  // ===== פונקציות עזר =====
  function getAllStylesheets() {
    const sheets = [];
    for (let sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules || [];
        sheets.push({
          href: sheet.href || 'inline',
          rules: Array.from(rules).map(rule => {
            if (rule.selectorText) {
              return {
                selector: rule.selectorText,
                cssText: rule.cssText,
                style: rule.style ? Object.fromEntries(
                  Array.from(rule.style).map(prop => [prop, rule.style.getPropertyValue(prop)])
                ) : {}
              };
            }
            return null;
          }).filter(Boolean)
        });
      } catch (e) {
        console.warn('Cannot access stylesheet:', sheet.href, e);
      }
    }
    return sheets;
  }

  function parseSelector(selector) {
    const parts = selector.split(/\s*,\s*/);
    return parts.map(part => {
      const specificity = {
        id: (part.match(/#/g) || []).length,
        class: (part.match(/\./g) || []).length,
        element: (part.match(/^[a-zA-Z]/) ? 1 : 0) + (part.match(/\s+[a-zA-Z]/g) || []).length
      };
      return {
        selector: part.trim(),
        specificity: specificity.id * 100 + specificity.class * 10 + specificity.element
      };
    });
  }

  function findDuplicates(sheets) {
    const selectorMap = new Map();
    const duplicates = [];

    sheets.forEach((sheet, sheetIdx) => {
      sheet.rules.forEach((rule, ruleIdx) => {
        const selectors = parseSelector(rule.selector);
        selectors.forEach(({ selector, specificity }) => {
          if (!selectorMap.has(selector)) {
            selectorMap.set(selector, []);
          }
          selectorMap.get(selector).push({
            sheet: sheet.href,
            specificity,
            cssText: rule.cssText,
            index: ruleIdx
          });
        });
      });
    });

    selectorMap.forEach((occurrences, selector) => {
      if (occurrences.length > 1) {
        duplicates.push({
          selector,
          occurrences,
          count: occurrences.length
        });
      }
    });

    return duplicates;
  }

  function auditCSS() {
    const sheets = getAllStylesheets();
    const duplicates = findDuplicates(sheets);
    
    const report = {
      timestamp: new Date().toISOString(),
      stylesheets: sheets.map(s => ({
        href: s.href,
        ruleCount: s.rules.length
      })),
      duplicates: duplicates,
      summary: {
        totalStylesheets: sheets.length,
        totalRules: sheets.reduce((sum, s) => sum + s.rules.length, 0),
        duplicateSelectors: duplicates.length,
        totalDuplicateOccurrences: duplicates.reduce((sum, d) => sum + d.count, 0)
      }
    };

    return report;
  }

  // ===== הרצת הבדיקה והצגת התוצאות =====
  const report = auditCSS();

  // שמירה ב-global scope לנוחות
  window.cssHierarchyAudit = report;

  // הצגת דוח מפורט בקונסולה
  console.group('🔍 CSS HIERARCHY AUDIT');
  console.log('Timestamp:', report.timestamp);
  
  console.group('\n📊 Summary:');
  console.log('Total Stylesheets:', report.summary.totalStylesheets);
  console.log('Total Rules:', report.summary.totalRules);
  console.log('Duplicate Selectors:', report.summary.duplicateSelectors);
  console.log('Total Duplicate Occurrences:', report.summary.totalDuplicateOccurrences);
  console.groupEnd();

  console.group('\n📄 Stylesheets:');
  report.stylesheets.forEach((sheet, idx) => {
    console.log(`${idx + 1}. ${sheet.href} (${sheet.ruleCount} rules)`);
  });
  console.groupEnd();

  if (report.duplicates.length > 0) {
    console.group('\n⚠️ Duplicate Selectors Found:');
    report.duplicates.forEach((dup, idx) => {
      console.group(`\n${idx + 1}. "${dup.selector}" (${dup.count} occurrences):`);
      dup.occurrences.forEach((occ, occIdx) => {
        console.log(`  ${occIdx + 1}. ${occ.sheet} (specificity: ${occ.specificity})`);
        console.log(`     ${occ.cssText.substring(0, 100)}...`);
      });
      console.groupEnd();
    });
    console.groupEnd();
  } else {
    console.log('\n✅ No duplicate selectors found!');
  }

  console.groupEnd();

  // פונקציה להעתקת הדוח
  window.copyCSSAuditReport = function() {
    const json = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      console.log('✅ Report copied to clipboard!');
    }).catch(() => {
      console.log('📋 Report JSON:\n', json);
    });
  };

  console.log('\n💡 Tips:');
  console.log('  • Full report available at: window.cssHierarchyAudit');
  console.log('  • Copy report: window.copyCSSAuditReport()');
  
  return report;
})();
