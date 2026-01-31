/**
 * HEADER COMPLETE COMPARISON INSPECTOR - Team 30 Frontend
 * =======================================================
 * כלי השוואה מפורט בין Header חדש ל-Legacy
 * 
 * שימוש:
 * 1. פתח את הדף החדש בדפדפן
 * 2. פתח קונסולה (F12 > Console)
 * 3. העתק והדבק את הקוד הזה
 * 4. הסקריפט יציג דוח מפורט על כל הממדים והסגנונות
 * 5. העתק את הדוח והשווה עם הדוח מה-Legacy
 * 
 * גרסה: 2.0.0
 * תאריך: 2026-01-31
 */

(function() {
  'use strict';

  // ===== פונקציות עזר =====
  function getComputedStyleValue(element, property) {
    const computed = window.getComputedStyle(element);
    return computed.getPropertyValue(property).trim() || computed[property] || 'N/A';
  }

  function parsePx(value) {
    if (!value || value === 'N/A') return null;
    const match = value.match(/([\d.]+)px/);
    return match ? parseFloat(match[1]) : null;
  }

  function parseRem(value) {
    if (!value || value === 'N/A') return null;
    const match = value.match(/([\d.]+)rem/);
    return match ? parseFloat(match[1]) * 16 : null; // Convert rem to px
  }

  function getNumericValue(value) {
    return parsePx(value) || parseRem(value) || null;
  }

  function inspectElement(selector, name) {
    const element = document.querySelector(selector);
    if (!element) {
      return { name, exists: false };
    }

    const computed = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return {
      name,
      exists: true,
      dimensions: {
        width: rect.width,
        height: rect.height,
        widthPx: `${rect.width}px`,
        heightPx: `${rect.height}px`
      },
      layout: {
        display: computed.display,
        position: computed.position,
        flexDirection: computed.flexDirection,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems,
        gap: computed.gap,
        flexWrap: computed.flexWrap
      },
      spacing: {
        marginTop: computed.marginTop,
        marginRight: computed.marginRight,
        marginBottom: computed.marginBottom,
        marginLeft: computed.marginLeft,
        paddingTop: computed.paddingTop,
        paddingRight: computed.paddingRight,
        paddingBottom: computed.paddingBottom,
        paddingLeft: computed.paddingLeft,
        marginTopPx: getNumericValue(computed.marginTop),
        marginRightPx: getNumericValue(computed.marginRight),
        marginBottomPx: getNumericValue(computed.marginBottom),
        marginLeftPx: getNumericValue(computed.marginLeft),
        paddingTopPx: getNumericValue(computed.paddingTop),
        paddingRightPx: getNumericValue(computed.paddingRight),
        paddingBottomPx: getNumericValue(computed.paddingBottom),
        paddingLeftPx: getNumericValue(computed.paddingLeft)
      },
      typography: {
        fontSize: computed.fontSize,
        fontSizePx: parsePx(computed.fontSize),
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        fontFamily: computed.fontFamily,
        color: computed.color,
        textAlign: computed.textAlign
      },
      borders: {
        borderTop: computed.borderTop,
        borderRight: computed.borderRight,
        borderBottom: computed.borderBottom,
        borderLeft: computed.borderLeft,
        borderRadius: computed.borderRadius
      },
      background: {
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage
      },
      positioning: {
        top: computed.top,
        left: computed.left,
        right: computed.right,
        bottom: computed.bottom,
        zIndex: computed.zIndex
      }
    };
  }

  function inspectFilterElements() {
    const filterContainer = document.querySelector('.filters-container');
    if (!filterContainer) {
      return { exists: false };
    }

    const inputs = filterContainer.querySelectorAll('input[type="text"], input[type="date"], select');
    const buttons = filterContainer.querySelectorAll('button');
    
    const filterInputs = Array.from(inputs).map((input, idx) => {
      const computed = window.getComputedStyle(input);
      const rect = input.getBoundingClientRect();
      return {
        index: idx,
        type: input.type || input.tagName.toLowerCase(),
        placeholder: input.placeholder || 'N/A',
        dimensions: {
          width: rect.width,
          height: rect.height,
          widthPx: `${rect.width}px`,
          heightPx: `${rect.height}px`
        },
        spacing: {
          padding: computed.padding,
          paddingTop: computed.paddingTop,
          paddingRight: computed.paddingRight,
          paddingBottom: computed.paddingBottom,
          paddingLeft: computed.paddingLeft,
          paddingTopPx: getNumericValue(computed.paddingTop),
          paddingRightPx: getNumericValue(computed.paddingRight),
          paddingBottomPx: getNumericValue(computed.paddingBottom),
          paddingLeftPx: getNumericValue(computed.paddingLeft),
          margin: computed.margin
        },
        typography: {
          fontSize: computed.fontSize,
          fontSizePx: parsePx(computed.fontSize),
          fontWeight: computed.fontWeight,
          fontFamily: computed.fontFamily
        },
        borders: {
          border: computed.border,
          borderRadius: computed.borderRadius,
          borderColor: computed.borderColor
        }
      };
    });

    return {
      exists: true,
      container: inspectElement('.filters-container', 'Filters Container'),
      inputs: filterInputs,
      inputCount: filterInputs.length,
      buttonCount: buttons.length
    };
  }

  function inspectNavigation() {
    const navItems = document.querySelectorAll('.tiktrack-nav-item');
    const navLinks = document.querySelectorAll('.tiktrack-nav-link');
    const dropdownMenus = document.querySelectorAll('.tiktrack-dropdown-menu');

    const items = Array.from(navItems).map((item, idx) => {
      const computed = window.getComputedStyle(item);
      const rect = item.getBoundingClientRect();
      const link = item.querySelector('.tiktrack-nav-link');
      const linkComputed = link ? window.getComputedStyle(link) : null;

      return {
        index: idx,
        text: link ? link.textContent.trim() : 'N/A',
        dimensions: {
          width: rect.width,
          height: rect.height,
          widthPx: `${rect.width}px`,
          heightPx: `${rect.height}px`
        },
        spacing: {
          margin: computed.margin,
          padding: computed.padding,
          gap: computed.gap
        },
        link: linkComputed ? {
          fontSize: linkComputed.fontSize,
          fontSizePx: parsePx(linkComputed.fontSize),
          fontWeight: linkComputed.fontWeight,
          color: linkComputed.color,
          padding: linkComputed.padding,
          paddingTopPx: getNumericValue(linkComputed.paddingTop),
          paddingRightPx: getNumericValue(linkComputed.paddingRight),
          paddingBottomPx: getNumericValue(linkComputed.paddingBottom),
          paddingLeftPx: getNumericValue(linkComputed.paddingLeft)
        } : null
      };
    });

    return {
      navItems: items,
      navItemCount: items.length,
      navLinkCount: navLinks.length,
      dropdownCount: dropdownMenus.length
    };
  }

  // ===== בדיקות עיקריות =====
  const header = inspectElement('#unified-header', 'Unified Header');
  const headerContent = inspectElement('.header-content', 'Header Content');
  const headerTop = inspectElement('.header-top', 'Header Top');
  const headerContainer = inspectElement('.header-container', 'Header Container');
  const headerFilters = inspectElement('.header-filters', 'Header Filters');
  const filtersContainer = inspectFilterElements();
  const navigation = inspectNavigation();
  const logo = inspectElement('.logo-section', 'Logo Section');
  const logoImage = inspectElement('.logo-image', 'Logo Image');
  const logoText = inspectElement('.logo-text', 'Logo Text');

  // ===== חישוב גבהים =====
  const headerHeight = header.exists ? header.dimensions.height : null;
  const headerTopHeight = headerTop.exists ? headerTop.dimensions.height : null;
  const headerFiltersHeight = headerFilters.exists ? headerFilters.dimensions.height : null;
  const totalCalculatedHeight = headerTopHeight && headerFiltersHeight ? headerTopHeight + headerFiltersHeight : null;

  // ===== דוח =====
  const report = {
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
    header: {
      ...header,
      expectedHeight: 158,
      actualHeight: headerHeight,
      heightMatch: headerHeight === 158,
      expectedZIndex: 950,
      actualZIndex: header.exists ? parseInt(getComputedStyleValue(document.querySelector('#unified-header'), 'zIndex')) : null,
      zIndexMatch: header.exists ? parseInt(getComputedStyleValue(document.querySelector('#unified-header'), 'zIndex')) === 950 : false
    },
    headerTop: {
      ...headerTop,
      expectedHeight: 98,
      actualHeight: headerTopHeight,
      heightMatch: headerTopHeight === 98
    },
    headerFilters: {
      ...headerFilters,
      expectedHeight: 60,
      actualHeight: headerFiltersHeight,
      heightMatch: headerFiltersHeight === 60
    },
    totalHeight: {
      expected: 158,
      calculated: totalCalculatedHeight,
      actual: headerHeight,
      match: totalCalculatedHeight === 158 && headerHeight === 158
    },
    headerContainer: headerContainer,
    filters: filtersContainer,
    navigation: navigation,
    logo: {
      section: logo,
      image: logoImage,
      text: logoText
    }
  };

  // ===== הצגת הדוח =====
  console.group('🔍 HEADER COMPLETE COMPARISON INSPECTOR');
  console.log('Timestamp:', report.timestamp);
  console.log('Page URL:', report.pageUrl);

  console.group('\n📏 Header Dimensions:');
  console.log('Expected Total Height:', report.header.expectedHeight + 'px');
  console.log('Actual Total Height:', report.header.actualHeight ? report.header.actualHeight + 'px' : 'N/A');
  console.log('Height Match:', report.header.heightMatch ? '✅' : '❌');
  console.log('Expected Z-Index:', report.header.expectedZIndex);
  console.log('Actual Z-Index:', report.header.actualZIndex);
  console.log('Z-Index Match:', report.header.zIndexMatch ? '✅' : '❌');
  console.groupEnd();

  console.group('\n📐 Header Top Row:');
  console.log('Expected Height:', report.headerTop.expectedHeight + 'px');
  console.log('Actual Height:', report.headerTop.actualHeight ? report.headerTop.actualHeight + 'px' : 'N/A');
  console.log('Height Match:', report.headerTop.heightMatch ? '✅' : '❌');
  if (report.headerTop.exists) {
    console.log('Padding:', report.headerTop.spacing.paddingTop, report.headerTop.spacing.paddingRight, report.headerTop.spacing.paddingBottom, report.headerTop.spacing.paddingLeft);
    console.log('Border Bottom:', report.headerTop.borders.borderBottom);
  }
  console.groupEnd();

  console.group('\n📐 Header Filters Row:');
  console.log('Expected Height:', report.headerFilters.expectedHeight + 'px');
  console.log('Actual Height:', report.headerFilters.actualHeight ? report.headerFilters.actualHeight + 'px' : 'N/A');
  console.log('Height Match:', report.headerFilters.heightMatch ? '✅' : '❌');
  console.groupEnd();

  if (report.filters.exists) {
    console.group('\n🔍 Filter Elements:');
    console.log('Input Count:', report.filters.inputCount);
    console.log('Button Count:', report.filters.buttonCount);
    report.filters.inputs.forEach((input, idx) => {
      console.group(`Input ${idx + 1} (${input.type}):`);
      console.log('Placeholder:', input.placeholder);
      console.log('Dimensions:', input.dimensions.widthPx + ' × ' + input.dimensions.heightPx);
      console.log('Padding:', `${input.spacing.paddingTopPx}px ${input.spacing.paddingRightPx}px ${input.spacing.paddingBottomPx}px ${input.spacing.paddingLeftPx}px`);
      console.log('Font Size:', input.typography.fontSize, `(${input.typography.fontSizePx}px)`);
      console.log('Font Weight:', input.typography.fontWeight);
      console.log('Border:', input.borders.border);
      console.log('Border Radius:', input.borders.borderRadius);
      console.groupEnd();
    });
    console.groupEnd();
  }

  console.group('\n🧭 Navigation:');
  console.log('Nav Items:', report.navigation.navItemCount);
  console.log('Nav Links:', report.navigation.navLinkCount);
  console.log('Dropdowns:', report.navigation.dropdownCount);
  report.navigation.navItems.forEach((item, idx) => {
    if (item.link) {
      console.log(`Item ${idx + 1} (${item.text}):`, item.link.fontSize, item.link.fontWeight, item.link.color);
    }
  });
  console.groupEnd();

  console.group('\n🎨 Logo:');
  if (report.logo.section.exists) {
    console.log('Logo Section Dimensions:', report.logo.section.dimensions.widthPx + ' × ' + report.logo.section.dimensions.heightPx);
  }
  if (report.logo.image.exists) {
    console.log('Logo Image Dimensions:', report.logo.image.dimensions.widthPx + ' × ' + report.logo.image.dimensions.heightPx);
  }
  if (report.logo.text.exists) {
    console.log('Logo Text:', report.logo.text.typography.fontSize, report.logo.text.typography.fontWeight, report.logo.text.typography.color);
  }
  console.groupEnd();

  console.groupEnd();

  // ===== פונקציה להעתקת הדוח =====
  window.copyHeaderComparisonReport = function() {
    const json = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      console.log('✅ Report copied to clipboard!');
    }).catch(() => {
      console.log('📋 Report JSON:\n', json);
    });
  };

  // שמירה ב-global scope
  window.headerComparisonReport = report;

  console.log('\n💡 Tips:');
  console.log('  • Full report available at: window.headerComparisonReport');
  console.log('  • Copy report: window.copyHeaderComparisonReport()');
  console.log('  • Run this script on both NEW and LEGACY versions for comparison');

  return report;
})();
