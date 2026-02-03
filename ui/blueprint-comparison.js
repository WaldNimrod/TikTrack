/**
 * Blueprint Comparison Script - Enhanced Version
 * 
 * This script compares the actual rendered page with the blueprint specifications.
 * Run this in the browser console (F12) on http://localhost:8080/
 * 
 * Usage:
 * 1. Open http://localhost:8080/ in your browser
 * 2. Open DevTools (F12) → Console
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 
 * The script will output detailed comparison results for:
 * - Dropdown menus and filters
 * - Active alerts structure and styling
 * - Info summary structure, styling, and behavior
 * - Widget placeholders structure and styling
 * - Portfolio section header filters
 */

(function() {
  'use strict';

  console.log('%c🔍 Blueprint Comparison Script - Enhanced Version', 'color: #26baac; font-size: 16px; font-weight: bold;');
  console.log('='.repeat(80));

  const results = {
    errors: [],
    warnings: [],
    info: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  /**
   * Get computed styles for an element
   */
  function getComputedStyles(element) {
    if (!element) return null;
    return window.getComputedStyle(element);
  }

  /**
   * Compare CSS values (handles different formats)
   */
  function compareCSSValue(actual, expected, property) {
    // Normalize values
    const normalize = (val) => {
      if (!val) return '';
      return val.toString().trim().toLowerCase().replace(/\s+/g, ' ');
    };

    const actualNorm = normalize(actual);
    const expectedNorm = normalize(expected);

    // Handle rem to px conversion (approximate)
    const remToPx = (val) => {
      const match = val.match(/([\d.]+)rem/);
      if (match) {
        return parseFloat(match[1]) * 16;
      }
      return null;
    };

    // Exact match
    if (actualNorm === expectedNorm) return true;

    // Check if both are rem values that convert to same px
    const actualPx = remToPx(actualNorm);
    const expectedPx = remToPx(expectedNorm);
    if (actualPx !== null && expectedPx !== null && Math.abs(actualPx - expectedPx) < 0.1) {
      return true;
    }

    return false;
  }

  /**
   * Check if element exists and has required structure
   */
  function checkElementStructure(element, selector, requiredChildren = []) {
    if (!element) {
      results.summary.total++;
      results.summary.failed++;
      results.errors.push({
        element: selector,
        property: 'existence',
        actual: 'Not found',
        expected: 'Should exist'
      });
      return false;
    }

    // Check required children
    for (const childSelector of requiredChildren) {
      const child = element.querySelector(childSelector);
      if (!child) {
        results.summary.total++;
        results.summary.failed++;
        results.errors.push({
          element: selector,
          property: 'structure',
          actual: `Missing child: ${childSelector}`,
          expected: `Should have child: ${childSelector}`
        });
      }
    }

    return true;
  }

  /**
   * Check dropdown menu spacing
   */
  function checkDropdownSpacing() {
    console.log('\n%c📋 Checking Dropdown Menu Spacing', 'color: #ff9500; font-weight: bold;');
    
    const dropdownMenus = document.querySelectorAll('#unified-header .tiktrack-dropdown-menu');
    const dropdownItems = document.querySelectorAll('#unified-header .tiktrack-dropdown-item');
    const separators = document.querySelectorAll('#unified-header .separator');

    // Check dropdown menu padding
    if (dropdownMenus.length > 0) {
      const menu = dropdownMenus[0];
      const styles = getComputedStyles(menu);
      const paddingTop = styles.paddingTop;
      const paddingBottom = styles.paddingBottom;
      
      const expectedPadding = '0.0625rem';
      const expectedPaddingPx = '1px';
      
      const topMatch = compareCSSValue(paddingTop, expectedPadding, 'padding-top') || 
                       compareCSSValue(paddingTop, expectedPaddingPx, 'padding-top');
      const bottomMatch = compareCSSValue(paddingBottom, expectedPadding, 'padding-bottom') || 
                          compareCSSValue(paddingBottom, expectedPaddingPx, 'padding-bottom');

      results.summary.total++;
      if (topMatch && bottomMatch) {
        results.summary.passed++;
        console.log('✅ Dropdown menu padding:', paddingTop, '/', paddingBottom);
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Dropdown Menu',
          property: 'padding',
          actual: `${paddingTop} / ${paddingBottom}`,
          expected: `${expectedPadding} / ${expectedPadding}`
        });
        console.log('❌ Dropdown menu padding:', paddingTop, '/', paddingBottom, 'Expected:', expectedPadding);
      }
    }

    // Check dropdown item padding
    if (dropdownItems.length > 0) {
      const item = dropdownItems[0];
      const styles = getComputedStyles(item);
      const paddingTop = styles.paddingTop;
      const paddingRight = styles.paddingRight;
      const paddingBottom = styles.paddingBottom;
      const paddingLeft = styles.paddingLeft;

      const expectedTop = '0.0625rem';
      const expectedRight = '1rem';
      const expectedBottom = '0.0625rem';
      const expectedLeft = '0.25rem';

      const topMatch = compareCSSValue(paddingTop, expectedTop, 'padding-top');
      const rightMatch = compareCSSValue(paddingRight, expectedRight, 'padding-right');
      const bottomMatch = compareCSSValue(paddingBottom, expectedBottom, 'padding-bottom');
      const leftMatch = compareCSSValue(paddingLeft, expectedLeft, 'padding-left');

      results.summary.total++;
      if (topMatch && rightMatch && bottomMatch && leftMatch) {
        results.summary.passed++;
        console.log('✅ Dropdown item padding:', `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`);
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Dropdown Item',
          property: 'padding',
          actual: `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`,
          expected: `${expectedTop} ${expectedRight} ${expectedBottom} ${expectedLeft}`
        });
        console.log('❌ Dropdown item padding:', `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`);
      }
    }

    // Check separator margin and shadow
    if (separators.length > 0) {
      const separator = separators[0];
      const styles = getComputedStyles(separator);
      const height = styles.height;
      const marginTop = styles.marginTop;
      const marginBottom = styles.marginBottom;
      const boxShadow = styles.boxShadow;

      const expectedHeight = '1px';
      const expectedMargin = '0.0625rem';
      const expectedShadow = 'rgba(0, 0, 0, 0.05)';

      const heightMatch = compareCSSValue(height, expectedHeight, 'height');
      const marginTopMatch = compareCSSValue(marginTop, expectedMargin, 'margin-top');
      const marginBottomMatch = compareCSSValue(marginBottom, expectedMargin, 'margin-bottom');
      const shadowMatch = boxShadow.includes('0.05') || boxShadow.includes('rgba(0, 0, 0, 0.05)');

      results.summary.total++;
      if (heightMatch && marginTopMatch && marginBottomMatch && shadowMatch) {
        results.summary.passed++;
        console.log('✅ Separator styles:', { height, marginTop, marginBottom, boxShadow });
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Separator',
          property: 'height/margin/shadow',
          actual: `height: ${height}, margin: ${marginTop}/${marginBottom}, shadow: ${boxShadow}`,
          expected: `height: ${expectedHeight}, margin: ${expectedMargin}, shadow: ${expectedShadow}`
        });
        console.log('❌ Separator styles');
      }
    }
  }

  /**
   * Check filter user section position
   */
  function checkFilterUserPosition() {
    console.log('\n%c👤 Checking Filter User Section Position', 'color: #ff9500; font-weight: bold;');
    
    const userSection = document.querySelector('#unified-header .filter-user-section');
    if (!userSection) {
      results.summary.total++;
      results.summary.failed++;
      results.errors.push({
        element: 'Filter User Section',
        property: 'existence',
        actual: 'Not found',
        expected: 'Should exist'
      });
      console.log('❌ Filter user section not found');
      return;
    }

    const styles = getComputedStyles(userSection);
    const order = styles.order;
    const marginInlineStart = styles.marginInlineStart;

    const expectedOrder = '999';
    const orderMatch = order === expectedOrder;
    const marginMatch = marginInlineStart === 'auto';

    results.summary.total++;
    if (orderMatch && marginMatch) {
      results.summary.passed++;
      console.log('✅ Filter user section position:', { order, marginInlineStart });
    } else {
      results.summary.failed++;
      results.errors.push({
        element: 'Filter User Section',
        property: 'position',
        actual: `order: ${order}, margin-inline-start: ${marginInlineStart}`,
        expected: 'order: 999, margin-inline-start: auto'
      });
      console.log('❌ Filter user section position');
    }
  }

  /**
   * Check investment type filter options
   */
  function checkInvestmentTypeFilter() {
    console.log('\n%c💰 Checking Investment Type Filter Options', 'color: #ff9500; font-weight: bold;');
    
    const typeFilterItems = document.querySelectorAll('#unified-header .type-filter-item');
    const expectedOptions = ['הכול'];
    const actualOptions = Array.from(typeFilterItems).map(item => {
      const textSpan = item.querySelector('.option-text');
      return textSpan ? textSpan.textContent.trim() : '';
    }).filter(text => text);

    results.summary.total++;
    if (actualOptions.length === 1 && actualOptions[0] === 'הכול') {
      results.summary.passed++;
      console.log('✅ Investment type filter options:', actualOptions);
    } else {
      results.summary.failed++;
      results.errors.push({
        element: 'Investment Type Filter',
        property: 'options',
        actual: actualOptions.join(', '),
        expected: expectedOptions.join(', ')
      });
      console.log('❌ Investment type filter options:', actualOptions, 'Expected:', expectedOptions);
    }
  }

  /**
   * Check active alerts structure and styling - ENHANCED
   */
  function checkActiveAlertsDesign() {
    console.log('\n%c🚨 Checking Active Alerts Structure & Design', 'color: #ff9500; font-weight: bold;');
    
    const alertsList = document.querySelector('.active-alerts__list');
    if (!alertsList) {
      console.log('⚠️ Active alerts list not found');
      return;
    }

    // Check grid layout
    const styles = getComputedStyles(alertsList);
    const display = styles.display;
    const gridTemplateColumns = styles.gridTemplateColumns;
    const gap = styles.gap;

    results.summary.total++;
    if (display === 'grid') {
      results.summary.passed++;
      console.log('✅ Active alerts list is grid:', { display, gridTemplateColumns, gap });
    } else {
      results.summary.failed++;
      results.errors.push({
        element: 'Active Alerts List',
        property: 'display',
        actual: display,
        expected: 'grid'
      });
      console.log('❌ Active alerts list display:', display, 'Expected: grid');
    }

    // Check alert cards structure
    const alertCards = document.querySelectorAll('.active-alerts__card');
    console.log(`📋 Found ${alertCards.length} alert cards`);

    if (alertCards.length > 0) {
      const card = alertCards[0];
      
      // Check card structure
      const hasHeader = card.querySelector('.active-alerts__card-header');
      const hasBody = card.querySelector('.active-alerts__card-body');
      const hasFooter = card.querySelector('.active-alerts__card-footer');
      
      results.summary.total++;
      if (hasHeader && hasBody && hasFooter) {
        results.summary.passed++;
        console.log('✅ Alert card structure: header, body, footer present');
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Active Alerts Card',
          property: 'structure',
          actual: `header: ${!!hasHeader}, body: ${!!hasBody}, footer: ${!!hasFooter}`,
          expected: 'header: true, body: true, footer: true'
        });
        console.log('❌ Alert card structure incomplete');
      }

      // Check card styling
      const cardStyles = getComputedStyles(card);
      const backgroundColor = cardStyles.backgroundColor;
      const borderColor = cardStyles.borderColor;
      const borderRadius = cardStyles.borderRadius;
      const padding = cardStyles.padding;

      console.log('📋 Alert card styles:', {
        backgroundColor,
        borderColor,
        borderRadius,
        padding
      });

      // Check card header structure
      if (hasHeader) {
        const linkedEntity = hasHeader.querySelector('.linked-object-card');
        const detailsBtn = hasHeader.querySelector('.btn-view-alert');
        
        results.summary.total++;
        if (linkedEntity && detailsBtn) {
          results.summary.passed++;
          console.log('✅ Alert card header structure: linked entity + details button');
        } else {
          results.summary.failed++;
          results.errors.push({
            element: 'Active Alerts Card Header',
            property: 'structure',
            actual: `linked entity: ${!!linkedEntity}, details button: ${!!detailsBtn}`,
            expected: 'linked entity: true, details button: true'
          });
        }
      }

      // Check card body structure (rows)
      if (hasBody) {
        const rows = hasBody.querySelectorAll('.active-alerts__row');
        const conditionRow = hasBody.querySelector('.active-alerts__row--condition');
        const messageRow = hasBody.querySelector('.active-alerts__row--message');
        
        results.summary.total++;
        if (rows.length >= 2 && conditionRow && messageRow) {
          results.summary.passed++;
          console.log(`✅ Alert card body: ${rows.length} rows (condition + message)`);
        } else {
          results.summary.failed++;
          results.errors.push({
            element: 'Active Alerts Card Body',
            property: 'structure',
            actual: `rows: ${rows.length}, condition: ${!!conditionRow}, message: ${!!messageRow}`,
            expected: 'rows: >= 2, condition: true, message: true'
          });
        }

        // Check row structure
        if (conditionRow) {
          const label = conditionRow.querySelector('.active-alerts__row-label');
          const value = conditionRow.querySelector('.active-alerts__row-value');
          
          results.summary.total++;
          if (label && value) {
            results.summary.passed++;
            console.log('✅ Alert row structure: label + value');
          } else {
            results.summary.failed++;
            results.errors.push({
              element: 'Active Alerts Row',
              property: 'structure',
              actual: `label: ${!!label}, value: ${!!value}`,
              expected: 'label: true, value: true'
            });
          }
        }
      }

      // Check card footer structure
      if (hasFooter) {
        const timestamp = hasFooter.querySelector('.active-alerts__timestamp');
        const actions = hasFooter.querySelector('.active-alerts__actions');
        const markReadBtn = hasFooter.querySelector('.active-alerts__mark_read');
        
        results.summary.total++;
        if (timestamp && actions && markReadBtn) {
          results.summary.passed++;
          console.log('✅ Alert card footer structure: timestamp + actions');
        } else {
          results.summary.failed++;
          results.errors.push({
            element: 'Active Alerts Card Footer',
            property: 'structure',
            actual: `timestamp: ${!!timestamp}, actions: ${!!actions}, mark read: ${!!markReadBtn}`,
            expected: 'timestamp: true, actions: true, mark read: true'
          });
        }
      }

      // Check entity-specific styling (card classes)
      const cardClasses = card.className;
      const hasEntityClass = cardClasses.includes('active-alerts__card--trade') || 
                            cardClasses.includes('active-alerts__card--account') || 
                            cardClasses.includes('active-alerts__card--ticker');
      
      results.summary.total++;
      if (hasEntityClass) {
        results.summary.passed++;
        console.log('✅ Alert card has entity-specific class');
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Active Alerts Card',
          property: 'entity class',
          actual: cardClasses,
          expected: 'Should have active-alerts__card--trade/account/ticker'
        });
      }
    }
  }

  /**
   * Check info summary structure, styling, and behavior - ENHANCED
   */
  function checkInfoSummaryLayout() {
    console.log('\n%c📊 Checking Info Summary Structure & Design', 'color: #ff9500; font-weight: bold;');
    
    const infoSummary = document.querySelector('.info-summary');
    if (!infoSummary) {
      console.log('⚠️ Info summary not found');
      return;
    }

    // Check container styling
    const containerStyles = getComputedStyles(infoSummary);
    const containerBg = containerStyles.backgroundColor;
    const containerBorder = containerStyles.border;
    const containerBorderRadius = containerStyles.borderRadius;
    const containerPadding = containerStyles.padding;

    console.log('📋 Info summary container styles:', {
      backgroundColor: containerBg,
      border: containerBorder,
      borderRadius: containerBorderRadius,
      padding: containerPadding
    });

    // Check first row structure
    const firstRow = document.querySelector('.info-summary__row.info-summary__row--first, .info-summary__row:first-child');
    if (!firstRow) {
      console.log('⚠️ Info summary first row not found');
      return;
    }

    const rowStyles = getComputedStyles(firstRow);
    const justifyContent = rowStyles.justifyContent;
    const display = rowStyles.display;

    // Expected: justify-content: flex-start (text at start, button at end)
    const expectedJustify = 'flex-start';
    const justifyMatch = justifyContent === expectedJustify || justifyContent === 'start';
    const displayMatch = display === 'flex';

    results.summary.total++;
    if (justifyMatch && displayMatch) {
      results.summary.passed++;
      console.log('✅ Info summary row layout:', { display, justifyContent });
    } else {
      results.summary.failed++;
      results.errors.push({
        element: 'Info Summary Row',
        property: 'layout',
        actual: `display: ${display}, justify-content: ${justifyContent}`,
        expected: `display: flex, justify-content: ${expectedJustify}`
      });
      console.log('❌ Info summary row layout');
    }

    // Check toggle button
    const toggleBtn = firstRow.querySelector('.portfolio-summary__toggle-btn');
    if (toggleBtn) {
      const btnStyles = getComputedStyles(toggleBtn);
      const marginInlineStart = btnStyles.marginInlineStart;
      const btnDisplay = btnStyles.display;
      const btnWidth = btnStyles.width;
      const btnHeight = btnStyles.height;

      // Expected: margin-inline-start: auto (button at end)
      const marginMatch = marginInlineStart === 'auto';

      results.summary.total++;
      if (marginMatch) {
        results.summary.passed++;
        console.log('✅ Toggle button position:', { marginInlineStart, display: btnDisplay, width: btnWidth, height: btnHeight });
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Toggle Button',
          property: 'margin-inline-start',
          actual: `margin-inline-start: ${marginInlineStart}`,
          expected: 'margin-inline-start: auto'
        });
        console.log('❌ Toggle button margin');
      }

      // Check button has SVG icon
      const svgIcon = toggleBtn.querySelector('svg');
      results.summary.total++;
      if (svgIcon) {
        results.summary.passed++;
        console.log('✅ Toggle button has SVG icon');
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Toggle Button',
          property: 'icon',
          actual: 'No SVG icon',
          expected: 'Should have SVG icon'
        });
      }
    } else {
      results.summary.total++;
      results.summary.failed++;
      results.errors.push({
        element: 'Info Summary Row',
        property: 'toggle button',
        actual: 'Not found',
        expected: 'Should have toggle button'
      });
    }

    // Check second row (hidden by default)
    const secondRow = document.querySelector('.info-summary__row.info-summary__row--second, .info-summary__row:nth-child(2)');
    if (secondRow) {
      const secondRowStyles = getComputedStyles(secondRow);
      const secondRowDisplay = secondRowStyles.display;
      
      // Should be hidden by default (display: none or hidden via style attribute)
      const isHidden = secondRowDisplay === 'none' || secondRow.style.display === 'none';
      
      results.summary.total++;
      if (isHidden) {
        results.summary.passed++;
        console.log('✅ Second row is hidden by default');
      } else {
        results.warnings.push('Second row should be hidden by default but is visible');
        console.log('⚠️ Second row is visible (should be hidden by default)');
      }
    } else {
      results.warnings.push('Second row not found - may be dynamically created');
    }

    // Check row content structure
    const rowContent = firstRow.querySelectorAll('div, span');
    results.summary.total++;
    if (rowContent.length >= 4) {
      results.summary.passed++;
      console.log(`✅ First row has ${rowContent.length} content items`);
    } else {
      results.summary.failed++;
      results.errors.push({
        element: 'Info Summary Row',
        property: 'content',
        actual: `${rowContent.length} items`,
        expected: '>= 4 items'
      });
    }
  }

  /**
   * Check widget placeholders structure and styling - ENHANCED
   */
  function checkWidgetPlaceholders() {
    console.log('\n%c🎨 Checking Widget Placeholders Structure & Design', 'color: #ff9500; font-weight: bold;');
    
    const widgets = document.querySelectorAll('.widget-placeholder');
    console.log(`📋 Found ${widgets.length} widget placeholders`);

    if (widgets.length === 0) {
      results.summary.total++;
      results.summary.failed++;
      results.errors.push({
        element: 'Widget Placeholders',
        property: 'existence',
        actual: '0 found',
        expected: 'Should have widget placeholders'
      });
      return;
    }

    widgets.forEach((widget, index) => {
      console.log(`\n📦 Widget ${index + 1}:`);

      // Check widget container structure
      const hasHeader = widget.querySelector('.widget-placeholder__header');
      const hasBody = widget.querySelector('.widget-placeholder__body');

      results.summary.total++;
      if (hasHeader && hasBody) {
        results.summary.passed++;
        console.log('  ✅ Widget structure: header + body');
      } else {
        results.summary.failed++;
        results.errors.push({
          element: `Widget ${index + 1}`,
          property: 'structure',
          actual: `header: ${!!hasHeader}, body: ${!!hasBody}`,
          expected: 'header: true, body: true'
        });
        console.log('  ❌ Widget structure incomplete');
      }

      // Check header structure
      if (hasHeader) {
        const titleRow = hasHeader.querySelector('.widget-placeholder__header-title-row');
        const title = hasHeader.querySelector('.widget-placeholder__title');
        const tabs = hasHeader.querySelector('.widget-placeholder__tabs');
        const badges = hasHeader.querySelector('.widget-placeholder__header-badges');
        const searchForm = hasHeader.querySelector('.widget-placeholder__search-form');
        const refreshBtn = hasHeader.querySelector('.widget-placeholder__refresh-btn');

        results.summary.total++;
        if (titleRow && title) {
          results.summary.passed++;
          console.log('  ✅ Header has title row and title');
        } else {
          results.summary.failed++;
          results.errors.push({
            element: `Widget ${index + 1} Header`,
            property: 'title structure',
            actual: `titleRow: ${!!titleRow}, title: ${!!title}`,
            expected: 'titleRow: true, title: true'
          });
        }

        // Check title icon
        const titleIcon = title ? title.querySelector('.widget-placeholder__title-icon, img') : null;
        results.summary.total++;
        if (titleIcon) {
          results.summary.passed++;
          console.log('  ✅ Title has icon');
        } else {
          results.warnings.push(`Widget ${index + 1} title missing icon`);
        }

        // Check optional elements (tabs, badges, search, refresh)
        if (tabs) {
          const tabItems = tabs.querySelectorAll('.widget-placeholder__tab-item');
          console.log(`  📋 Has ${tabItems.length} tabs`);
        }
        if (badges) {
          console.log('  📋 Has badges');
        }
        if (searchForm) {
          console.log('  📋 Has search form');
        }
        if (refreshBtn) {
          console.log('  📋 Has refresh button');
        }
      }

      // Check body structure
      if (hasBody) {
        const tabContent = hasBody.querySelectorAll('.widget-placeholder__tab-content');
        const list = hasBody.querySelector('.widget-placeholder__list');
        const text = hasBody.querySelector('.widget-placeholder__text');
        const tagCloud = hasBody.querySelector('.widget-placeholder__tag-cloud');
        const chartGrid = hasBody.querySelector('.widget-placeholder__chart-grid');

        if (tabContent.length > 0) {
          console.log(`  📋 Body has ${tabContent.length} tab content panels`);
        }
        if (list) {
          const listItems = list.querySelectorAll('.widget-placeholder__list-item');
          console.log(`  📋 Body has list with ${listItems.length} items`);
        }
        if (text) {
          console.log('  📋 Body has text content');
        }
        if (tagCloud) {
          console.log('  📋 Body has tag cloud');
        }
        if (chartGrid) {
          console.log('  📋 Body has chart grid');
        }
      }

      // Check widget styling
      const widgetStyles = getComputedStyles(widget);
      const widgetBg = widgetStyles.backgroundColor;
      const widgetBorder = widgetStyles.border;
      const widgetBorderRadius = widgetStyles.borderRadius;
      const widgetDisplay = widgetStyles.display;
      const widgetFlexDirection = widgetStyles.flexDirection;

      results.summary.total++;
      if (widgetDisplay === 'flex' && widgetFlexDirection === 'column') {
        results.summary.passed++;
        console.log('  ✅ Widget uses flex column layout');
      } else {
        results.summary.failed++;
        results.errors.push({
          element: `Widget ${index + 1}`,
          property: 'layout',
          actual: `display: ${widgetDisplay}, flex-direction: ${widgetFlexDirection}`,
          expected: 'display: flex, flex-direction: column'
        });
      }

      console.log('  📋 Widget styles:', {
        backgroundColor: widgetBg,
        border: widgetBorder,
        borderRadius: widgetBorderRadius
      });
    });
  }

  /**
   * Check portfolio section header filters - ENHANCED
   */
  function checkPortfolioFilters() {
    console.log('\n%c💼 Checking Portfolio Section Header Filters', 'color: #ff9500; font-weight: bold;');
    
    const portfolioSection = document.querySelector('tt-section[data-section="portfolio"]');
    if (!portfolioSection) {
      console.log('⚠️ Portfolio section not found');
      return;
    }

    const headerActions = portfolioSection.querySelector('.index-section__header-actions, .dashboard-section__header-actions');
    if (!headerActions) {
      console.log('⚠️ Portfolio header actions not found');
      return;
    }

    const filtersContainer = headerActions.querySelector('.portfolio-header-filters');
    if (!filtersContainer) {
      results.summary.total++;
      results.summary.failed++;
      results.errors.push({
        element: 'Portfolio Header Filters',
        property: 'existence',
        actual: 'Not found',
        expected: 'Should exist in portfolio section header'
      });
      console.log('❌ Portfolio header filters container not found');
      return;
    }

    // Check filters container styling
    const filtersStyles = getComputedStyles(filtersContainer);
    const filtersDisplay = filtersStyles.display;
    const filtersGap = filtersStyles.gap;

    results.summary.total++;
    if (filtersDisplay === 'flex') {
      results.summary.passed++;
      console.log('✅ Portfolio filters container uses flex layout:', { display: filtersDisplay, gap: filtersGap });
    } else {
      results.summary.failed++;
      results.errors.push({
        element: 'Portfolio Header Filters',
        property: 'display',
        actual: filtersDisplay,
        expected: 'flex'
      });
    }

    // Check account filter select
    const accountFilter = filtersContainer.querySelector('.portfolio-filter-select');
    if (accountFilter) {
      const accountFilterStyles = getComputedStyles(accountFilter);
      const accountFilterHeight = accountFilterStyles.height;
      const accountFilterBorder = accountFilterStyles.border;
      const accountFilterBorderRadius = accountFilterStyles.borderRadius;

      results.summary.total++;
      if (accountFilterHeight === '32px') {
        results.summary.passed++;
        console.log('✅ Account filter select height:', accountFilterHeight);
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Portfolio Account Filter',
          property: 'height',
          actual: accountFilterHeight,
          expected: '32px'
        });
      }

      console.log('📋 Account filter styles:', {
        height: accountFilterHeight,
        border: accountFilterBorder,
        borderRadius: accountFilterBorderRadius
      });
    } else {
      results.warnings.push('Portfolio account filter select not found');
    }

    // Check side filter buttons
    const sideFilters = filtersContainer.querySelector('.portfolio-side-filters');
    if (sideFilters) {
      const sideFilterBtns = sideFilters.querySelectorAll('.portfolio-side-filter-btn');
      console.log(`📋 Found ${sideFilterBtns.length} side filter buttons`);

      if (sideFilterBtns.length >= 3) {
        results.summary.total++;
        results.summary.passed++;
        console.log('✅ Side filters have 3 buttons (all, long, short)');
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Portfolio Side Filters',
          property: 'button count',
          actual: `${sideFilterBtns.length} buttons`,
          expected: '3 buttons (all, long, short)'
        });
      }

      // Check button classes
      const hasLongBtn = Array.from(sideFilterBtns).some(btn => btn.classList.contains('portfolio-side-filter-long'));
      const hasShortBtn = Array.from(sideFilterBtns).some(btn => btn.classList.contains('portfolio-side-filter-short'));

      results.summary.total++;
      if (hasLongBtn && hasShortBtn) {
        results.summary.passed++;
        console.log('✅ Side filter buttons have correct classes (long, short)');
      } else {
        results.summary.failed++;
        results.errors.push({
          element: 'Portfolio Side Filters',
          property: 'button classes',
          actual: `long: ${hasLongBtn}, short: ${hasShortBtn}`,
          expected: 'long: true, short: true'
        });
      }
    } else {
      results.warnings.push('Portfolio side filters not found');
    }

    // Check checkboxes container
    const checkboxesContainer = filtersContainer.querySelector('.portfolio-checkboxes-container');
    if (checkboxesContainer) {
      const checkboxLabels = checkboxesContainer.querySelectorAll('.portfolio-checkbox-label');
      console.log(`📋 Found ${checkboxLabels.length} checkbox labels`);

      if (checkboxLabels.length >= 2) {
        results.summary.total++;
        results.summary.passed++;
        console.log('✅ Checkboxes container has labels');
      } else {
        results.warnings.push('Portfolio checkboxes container has fewer than 2 labels');
      }
    } else {
      results.warnings.push('Portfolio checkboxes container not found');
    }
  }

  /**
   * Print summary
   */
  function printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('%c📊 SUMMARY', 'color: #26baac; font-size: 16px; font-weight: bold;');
    console.log('='.repeat(80));
    console.log(`Total checks: ${results.summary.total}`);
    console.log(`%c✅ Passed: ${results.summary.passed}`, 'color: green; font-weight: bold;');
    console.log(`%c❌ Failed: ${results.summary.failed}`, 'color: red; font-weight: bold;');
    
    if (results.errors.length > 0) {
      console.log('\n%c❌ ERRORS:', 'color: red; font-weight: bold; font-size: 14px;');
      results.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.element} - ${error.property}`);
        console.log('   Actual:', error.actual);
        console.log('   Expected:', error.expected);
      });
    }

    if (results.warnings.length > 0) {
      console.log('\n%c⚠️ WARNINGS:', 'color: orange; font-weight: bold; font-size: 14px;');
      results.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    console.log('\n' + '='.repeat(80));
  }

  // Run all checks
  try {
    checkDropdownSpacing();
    checkFilterUserPosition();
    checkInvestmentTypeFilter();
    checkActiveAlertsDesign();
    checkInfoSummaryLayout();
    checkWidgetPlaceholders();
    checkPortfolioFilters();
    printSummary();
  } catch (error) {
    console.error('❌ Error running comparison:', error);
  }

  // Return results for programmatic access
  return results;
})();
