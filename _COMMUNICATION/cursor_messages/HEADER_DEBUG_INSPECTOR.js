/**
 * HEADER DEBUG INSPECTOR - Team 30 Frontend
 * ==========================================
 * כלי דיבוג מפורט לבדיקת אלמנט ראש הדף (Unified Header)
 * 
 * שימוש:
 * 1. פתח את הדף בדפדפן
 * 2. פתח קונסולה (F12 > Console)
 * 3. העתק והדבק את הקוד הזה
 * 4. הסקריפט יציג דוח מפורט על מצב ההדר
 * 
 * גרסה: 1.0.0
 * תאריך: 2026-01-31
 */

(function() {
  'use strict';

  // ===== ערכים רצויים מהלגסי (Reference Values) =====
  const REFERENCE = {
    header: {
      totalHeight: 158,
      topRowHeight: 98,
      bottomRowHeight: 60,
      zIndex: 950
    },
    headerTop: {
      minHeight: 70,
      padding: '0',
      borderBottom: '1px solid rgb(229, 229, 234)' // #e5e5ea
    },
    headerContainer: {
      maxWidth: 1400,
      padding: '16px 20px', // var(--spacing-md, 16px) 20px
      gap: '1rem'
    },
    logo: {
      imageWidth: 125,
      imageHeight: 37.5,
      textFontSize: '16px', // 1rem
      textFontWeight: 300,
      textColor: 'rgb(38, 186, 172)', // #26baac
      textMarginBottom: '-5px'
    },
    navLink: {
      fontSize: '16px',
      fontWeight: 400,
      color: 'rgb(38, 186, 172)', // #26baac
      padding: '0.5rem 1rem',
      gap: '0.5rem',
      lineHeight: 1.4
    },
    dropdownArrow: {
      fontSize: '12px', // 0.75rem
      color: 'rgb(102, 102, 102)', // #666
      marginRight: '0.25rem'
    },
    headerFilters: {
      minHeight: 60,
      padding: '12px 0',
      paddingBottom: '24px'
    },
    filtersContainer: {
      maxWidth: 1400,
      padding: '0 20px',
      gap: '16px' // var(--spacing-md, 16px)
    },
    filterToggle: {
      fontSize: '14.4px', // 0.9rem
      fontWeight: 400,
      padding: '0.25rem 0.9rem',
      border: '1px solid rgb(221, 221, 221)', // #ddd
      borderRadius: '5.4px',
      minWidth: 120,
      lineHeight: 1.4
    },
    filterMenu: {
      borderRadius: '5.4px',
      border: '1px solid rgb(221, 221, 221)', // #ddd
      padding: '0.35rem 0',
      zIndex: 951
    },
    filterItem: {
      fontSize: '14.4px', // 0.9rem
      fontWeight: 300,
      padding: '0.5rem 0.9rem',
      lineHeight: 1.4
    }
  };

  // ===== פונקציות עזר =====
  function getComputedStyleValue(element, property) {
    if (!element) return null;
    const computed = window.getComputedStyle(element);
    return computed.getPropertyValue(property) || computed[property] || null;
  }

  function parsePx(value) {
    if (!value) return 0;
    return parseFloat(value.replace('px', '')) || 0;
  }

  function parseRem(value) {
    if (!value) return 0;
    const remValue = parseFloat(value.replace('rem', '')) || 0;
    return remValue * 16; // Convert to px (assuming 16px base)
  }

  function compareValues(actual, expected, tolerance = 1) {
    const actualNum = typeof actual === 'string' ? parsePx(actual) || parseRem(actual) : actual;
    const expectedNum = typeof expected === 'string' ? parsePx(expected) || parseRem(expected) : expected;
    return Math.abs(actualNum - expectedNum) <= tolerance;
  }

  function getColorValue(value) {
    if (!value) return null;
    // Convert rgb/rgba to hex if needed
    if (value.startsWith('rgb')) {
      const matches = value.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]).toString(16).padStart(2, '0');
        const g = parseInt(matches[1]).toString(16).padStart(2, '0');
        const b = parseInt(matches[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
    }
    return value;
  }

  // ===== בדיקת אלמנטים =====
  function inspectHeader() {
    const header = document.getElementById('unified-header');
    if (!header) {
      return { error: 'Header element not found (#unified-header)' };
    }

    const headerTop = header.querySelector('.header-top');
    const headerContainer = header.querySelector('.header-container');
    const headerFilters = header.querySelector('.header-filters');
    const filtersContainer = header.querySelector('.filters-container');
    const logoSection = header.querySelector('.logo-section');
    const logoImage = header.querySelector('.logo-image');
    const logoText = header.querySelector('.logo-text');
    const navLinks = header.querySelectorAll('.tiktrack-nav-link');
    const dropdownArrows = header.querySelectorAll('.tiktrack-dropdown-arrow');
    const filterToggles = header.querySelectorAll('.filter-toggle');
    const filterMenus = header.querySelectorAll('.filter-menu');
    const filterItems = header.querySelectorAll('.date-range-filter-item, .type-filter-item, .account-filter-item, .status-filter-item');

    const report = {
      timestamp: new Date().toISOString(),
      header: {},
      headerTop: {},
      headerContainer: {},
      logo: {},
      navLinks: {},
      dropdownArrows: {},
      headerFilters: {},
      filtersContainer: {},
      filterToggles: {},
      filterMenus: {},
      filterItems: {},
      issues: []
    };

    // ===== בדיקת Header =====
    if (header) {
      const height = parsePx(getComputedStyleValue(header, 'height')) || header.offsetHeight;
      const zIndex = parseInt(getComputedStyleValue(header, 'z-index')) || 0;
      
      report.header = {
        actual: {
          height: height,
          zIndex: zIndex,
          width: header.offsetWidth
        },
        expected: {
          height: REFERENCE.header.totalHeight,
          zIndex: REFERENCE.header.zIndex
        },
        match: {
          height: compareValues(height, REFERENCE.header.totalHeight, 2),
          zIndex: zIndex === REFERENCE.header.zIndex
        }
      };

      if (!report.header.match.height) {
        report.issues.push(`Header height mismatch: ${height}px (expected: ${REFERENCE.header.totalHeight}px)`);
      }
      if (!report.header.match.zIndex) {
        report.issues.push(`Header z-index mismatch: ${zIndex} (expected: ${REFERENCE.header.zIndex})`);
      }
    }

    // ===== בדיקת Header Top =====
    if (headerTop) {
      const minHeight = parsePx(getComputedStyleValue(headerTop, 'min-height')) || headerTop.offsetHeight;
      const padding = getComputedStyleValue(headerTop, 'padding');
      const borderBottom = getComputedStyleValue(headerTop, 'border-bottom');
      
      report.headerTop = {
        actual: {
          minHeight: minHeight,
          height: headerTop.offsetHeight,
          padding: padding,
          borderBottom: borderBottom
        },
        expected: {
          minHeight: REFERENCE.headerTop.minHeight,
          padding: REFERENCE.headerTop.padding,
          borderBottom: REFERENCE.headerTop.borderBottom
        },
        match: {
          minHeight: compareValues(minHeight, REFERENCE.headerTop.minHeight, 2),
          padding: padding === REFERENCE.headerTop.padding,
          borderBottom: borderBottom.includes('rgb(229, 229, 234)')
        }
      };

      if (!report.headerTop.match.minHeight) {
        report.issues.push(`Header-top min-height mismatch: ${minHeight}px (expected: ${REFERENCE.headerTop.minHeight}px)`);
      }
    }

    // ===== בדיקת Header Container =====
    if (headerContainer) {
      const maxWidth = parsePx(getComputedStyleValue(headerContainer, 'max-width')) || headerContainer.offsetWidth;
      const padding = getComputedStyleValue(headerContainer, 'padding');
      
      report.headerContainer = {
        actual: {
          maxWidth: maxWidth,
          width: headerContainer.offsetWidth,
          padding: padding
        },
        expected: {
          maxWidth: REFERENCE.headerContainer.maxWidth,
          padding: REFERENCE.headerContainer.padding
        },
        match: {
          maxWidth: compareValues(maxWidth, REFERENCE.headerContainer.maxWidth, 10),
          padding: padding.includes('16px') && padding.includes('20px')
        }
      };
    }

    // ===== בדיקת Logo =====
    if (logoImage) {
      const width = logoImage.offsetWidth;
      const height = logoImage.offsetHeight;
      
      report.logo.image = {
        actual: { width, height },
        expected: {
          width: REFERENCE.logo.imageWidth,
          height: REFERENCE.logo.imageHeight
        },
        match: {
          width: compareValues(width, REFERENCE.logo.imageWidth, 2),
          height: compareValues(height, REFERENCE.logo.imageHeight, 2)
        }
      };
    }

    if (logoText) {
      const fontSize = getComputedStyleValue(logoText, 'font-size');
      const fontWeight = parseInt(getComputedStyleValue(logoText, 'font-weight')) || 0;
      const color = getComputedStyleValue(logoText, 'color');
      const marginBottom = getComputedStyleValue(logoText, 'margin-bottom');
      
      report.logo.text = {
        actual: {
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: getColorValue(color),
          marginBottom: marginBottom
        },
        expected: {
          fontSize: REFERENCE.logo.textFontSize,
          fontWeight: REFERENCE.logo.textFontWeight,
          color: REFERENCE.logo.textColor,
          marginBottom: REFERENCE.logo.textMarginBottom
        },
        match: {
          fontSize: compareValues(fontSize, REFERENCE.logo.textFontSize, 1),
          fontWeight: fontWeight === REFERENCE.logo.textFontWeight,
          color: getColorValue(color) === getColorValue(REFERENCE.logo.textColor),
          marginBottom: marginBottom === REFERENCE.logo.textMarginBottom
        }
      };

      if (!report.logo.text.match.fontSize) {
        report.issues.push(`Logo text font-size mismatch: ${fontSize} (expected: ${REFERENCE.logo.textFontSize})`);
      }
      if (!report.logo.text.match.fontWeight) {
        report.issues.push(`Logo text font-weight mismatch: ${fontWeight} (expected: ${REFERENCE.logo.textFontWeight})`);
      }
    }

    // ===== בדיקת Nav Links =====
    if (navLinks.length > 0) {
      const firstLink = navLinks[0];
      const fontSize = getComputedStyleValue(firstLink, 'font-size');
      const fontWeight = parseInt(getComputedStyleValue(firstLink, 'font-weight')) || 0;
      const color = getComputedStyleValue(firstLink, 'color');
      const padding = getComputedStyleValue(firstLink, 'padding');
      const lineHeight = parseFloat(getComputedStyleValue(firstLink, 'line-height')) || 0;
      
      report.navLinks = {
        count: navLinks.length,
        actual: {
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: getColorValue(color),
          padding: padding,
          lineHeight: lineHeight
        },
        expected: {
          fontSize: REFERENCE.navLink.fontSize,
          fontWeight: REFERENCE.navLink.fontWeight,
          color: REFERENCE.navLink.color,
          padding: REFERENCE.navLink.padding,
          lineHeight: REFERENCE.navLink.lineHeight
        },
        match: {
          fontSize: compareValues(fontSize, REFERENCE.navLink.fontSize, 1),
          fontWeight: fontWeight === REFERENCE.navLink.fontWeight,
          color: getColorValue(color) === getColorValue(REFERENCE.navLink.color),
          lineHeight: compareValues(lineHeight, REFERENCE.navLink.lineHeight, 0.1)
        }
      };
    }

    // ===== בדיקת Dropdown Arrows =====
    if (dropdownArrows.length > 0) {
      const firstArrow = dropdownArrows[0];
      const fontSize = getComputedStyleValue(firstArrow, 'font-size');
      const color = getComputedStyleValue(firstArrow, 'color');
      const marginRight = getComputedStyleValue(firstArrow, 'margin-right');
      
      report.dropdownArrows = {
        count: dropdownArrows.length,
        actual: {
          fontSize: fontSize,
          color: getColorValue(color),
          marginRight: marginRight
        },
        expected: {
          fontSize: REFERENCE.dropdownArrow.fontSize,
          color: REFERENCE.dropdownArrow.color,
          marginRight: REFERENCE.dropdownArrow.marginRight
        },
        match: {
          fontSize: compareValues(fontSize, REFERENCE.dropdownArrow.fontSize, 1),
          color: getColorValue(color) === getColorValue(REFERENCE.dropdownArrow.color),
          marginRight: marginRight === REFERENCE.dropdownArrow.marginRight
        }
      };
    }

    // ===== בדיקת Header Filters =====
    if (headerFilters) {
      const minHeight = parsePx(getComputedStyleValue(headerFilters, 'min-height')) || headerFilters.offsetHeight;
      const padding = getComputedStyleValue(headerFilters, 'padding');
      const paddingBottom = getComputedStyleValue(headerFilters, 'padding-bottom');
      
      report.headerFilters = {
        actual: {
          minHeight: minHeight,
          height: headerFilters.offsetHeight,
          padding: padding,
          paddingBottom: paddingBottom
        },
        expected: {
          minHeight: REFERENCE.headerFilters.minHeight,
          padding: REFERENCE.headerFilters.padding,
          paddingBottom: REFERENCE.headerFilters.paddingBottom
        },
        match: {
          minHeight: compareValues(minHeight, REFERENCE.headerFilters.minHeight, 2),
          padding: padding.includes('12px'),
          paddingBottom: paddingBottom === REFERENCE.headerFilters.paddingBottom
        }
      };
    }

    // ===== בדיקת Filters Container =====
    if (filtersContainer) {
      const maxWidth = parsePx(getComputedStyleValue(filtersContainer, 'max-width')) || filtersContainer.offsetWidth;
      const padding = getComputedStyleValue(filtersContainer, 'padding');
      const gap = getComputedStyleValue(filtersContainer, 'gap');
      
      report.filtersContainer = {
        actual: {
          maxWidth: maxWidth,
          width: filtersContainer.offsetWidth,
          padding: padding,
          gap: gap
        },
        expected: {
          maxWidth: REFERENCE.filtersContainer.maxWidth,
          padding: REFERENCE.filtersContainer.padding,
          gap: REFERENCE.filtersContainer.gap
        },
        match: {
          maxWidth: compareValues(maxWidth, REFERENCE.filtersContainer.maxWidth, 10),
          padding: padding.includes('20px'),
          gap: gap === REFERENCE.filtersContainer.gap
        }
      };
    }

    // ===== בדיקת Filter Toggles =====
    if (filterToggles.length > 0) {
      const firstToggle = filterToggles[0];
      const fontSize = getComputedStyleValue(firstToggle, 'font-size');
      const fontWeight = parseInt(getComputedStyleValue(firstToggle, 'font-weight')) || 0;
      const padding = getComputedStyleValue(firstToggle, 'padding');
      const border = getComputedStyleValue(firstToggle, 'border');
      const borderRadius = getComputedStyleValue(firstToggle, 'border-radius');
      const minWidth = parsePx(getComputedStyleValue(firstToggle, 'min-width')) || firstToggle.offsetWidth;
      const lineHeight = parseFloat(getComputedStyleValue(firstToggle, 'line-height')) || 0;
      
      report.filterToggles = {
        count: filterToggles.length,
        actual: {
          fontSize: fontSize,
          fontWeight: fontWeight,
          padding: padding,
          border: border,
          borderRadius: borderRadius,
          minWidth: minWidth,
          lineHeight: lineHeight
        },
        expected: {
          fontSize: `${REFERENCE.filterToggle.fontSize}px`,
          fontWeight: REFERENCE.filterToggle.fontWeight,
          padding: REFERENCE.filterToggle.padding,
          border: REFERENCE.filterToggle.border,
          borderRadius: REFERENCE.filterToggle.borderRadius,
          minWidth: REFERENCE.filterToggle.minWidth,
          lineHeight: REFERENCE.filterToggle.lineHeight
        },
        match: {
          fontSize: compareValues(fontSize, REFERENCE.filterToggle.fontSize, 1),
          fontWeight: fontWeight === REFERENCE.filterToggle.fontWeight,
          padding: padding.includes('0.9rem') && padding.includes('0.25rem'),
          borderRadius: borderRadius === REFERENCE.filterToggle.borderRadius,
          minWidth: compareValues(minWidth, REFERENCE.filterToggle.minWidth, 5),
          lineHeight: compareValues(lineHeight, REFERENCE.filterToggle.lineHeight, 0.1)
        }
      };
    }

    // ===== בדיקת Filter Menus =====
    if (filterMenus.length > 0) {
      const firstMenu = filterMenus[0];
      const borderRadius = getComputedStyleValue(firstMenu, 'border-radius');
      const border = getComputedStyleValue(firstMenu, 'border');
      const padding = getComputedStyleValue(firstMenu, 'padding');
      const zIndex = parseInt(getComputedStyleValue(firstMenu, 'z-index')) || 0;
      
      report.filterMenus = {
        count: filterMenus.length,
        actual: {
          borderRadius: borderRadius,
          border: border,
          padding: padding,
          zIndex: zIndex
        },
        expected: {
          borderRadius: REFERENCE.filterMenu.borderRadius,
          border: REFERENCE.filterMenu.border,
          padding: REFERENCE.filterMenu.padding,
          zIndex: REFERENCE.filterMenu.zIndex
        },
        match: {
          borderRadius: borderRadius === REFERENCE.filterMenu.borderRadius,
          border: border.includes('rgb(221, 221, 221)'),
          padding: padding.includes('0.35rem'),
          zIndex: zIndex === REFERENCE.filterMenu.zIndex
        }
      };
    }

    // ===== בדיקת Filter Items =====
    if (filterItems.length > 0) {
      const firstItem = filterItems[0];
      const fontSize = getComputedStyleValue(firstItem, 'font-size');
      const fontWeight = parseInt(getComputedStyleValue(firstItem, 'font-weight')) || 0;
      const padding = getComputedStyleValue(firstItem, 'padding');
      const lineHeight = parseFloat(getComputedStyleValue(firstItem, 'line-height')) || 0;
      
      report.filterItems = {
        count: filterItems.length,
        actual: {
          fontSize: fontSize,
          fontWeight: fontWeight,
          padding: padding,
          lineHeight: lineHeight
        },
        expected: {
          fontSize: `${REFERENCE.filterItem.fontSize}px`,
          fontWeight: REFERENCE.filterItem.fontWeight,
          padding: REFERENCE.filterItem.padding,
          lineHeight: REFERENCE.filterItem.lineHeight
        },
        match: {
          fontSize: compareValues(fontSize, REFERENCE.filterItem.fontSize, 1),
          fontWeight: fontWeight === REFERENCE.filterItem.fontWeight,
          padding: padding.includes('0.9rem') && padding.includes('0.5rem'),
          lineHeight: compareValues(lineHeight, REFERENCE.filterItem.lineHeight, 0.1)
        }
      };
    }

    return report;
  }

  // ===== הרצת הבדיקה והצגת התוצאות =====
  const report = inspectHeader();

  // שמירה ב-global scope לנוחות
  window.phoenixHeaderDebugReport = report;

  // הצגת דוח מפורט בקונסולה
  console.group('🛡️ PHOENIX HEADER DEBUG INSPECTOR');
  console.log('Timestamp:', report.timestamp);
  
  if (report.error) {
    console.error('❌', report.error);
  } else {
    // סיכום כללי
    const totalChecks = Object.keys(report).filter(k => k !== 'timestamp' && k !== 'issues' && typeof report[k] === 'object' && report[k].match).length;
    const passedChecks = Object.keys(report).filter(k => {
      if (k === 'timestamp' || k === 'issues') return false;
      const section = report[k];
      if (!section || typeof section !== 'object' || !section.match) return false;
      return Object.values(section.match).every(v => v === true);
    }).length;

    console.log(`\n📊 Summary: ${passedChecks}/${totalChecks} sections passed`);
    
    if (report.issues.length > 0) {
      console.group('❌ Issues Found:');
      report.issues.forEach(issue => console.warn('  •', issue));
      console.groupEnd();
    } else {
      console.log('✅ No issues found!');
    }

    // דוח מפורט לכל סקשן
    console.group('\n📋 Detailed Report:');
    
    Object.keys(report).forEach(key => {
      if (key === 'timestamp' || key === 'issues') return;
      const section = report[key];
      if (!section || typeof section !== 'object') return;
      
      console.group(`\n🔍 ${key}:`);
      if (section.match) {
        const allMatch = Object.values(section.match).every(v => v === true);
        console.log(allMatch ? '✅ All checks passed' : '⚠️ Some checks failed');
        Object.keys(section.match).forEach(check => {
          const status = section.match[check] ? '✅' : '❌';
          console.log(`  ${status} ${check}:`, section.actual?.[check] || 'N/A', '→', section.expected?.[check] || 'N/A');
        });
      } else {
        console.log('No checks available');
      }
      console.groupEnd();
    });
    
    console.groupEnd();
  }

  console.groupEnd();

  // פונקציה להעתקת הדוח
  window.copyHeaderDebugReport = function() {
    const json = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      console.log('✅ Report copied to clipboard!');
    }).catch(() => {
      console.log('📋 Report JSON:\n', json);
    });
  };

  console.log('\n💡 Tips:');
  console.log('  • Full report available at: window.phoenixHeaderDebugReport');
  console.log('  • Copy report: window.copyHeaderDebugReport()');
  
  return report;
})();
