/**
 * D15 Widget Header Research Script
 * ==================================
 * 
 * This script analyzes widget header structure and alignment issues.
 * Run in browser console: copy-paste and execute
 * 
 * Analyzes:
 * 1. Widget header structure (Type 1 vs Type 2)
 * 2. Border-bottom visibility
 * 3. Vertical alignment of elements
 * 4. Refresh button positioning
 * 5. Content positioning issues
 */

(function() {
  console.log('🔍 D15 Widget Header Research');
  console.log('==============================\n');
  
  const widgets = document.querySelectorAll('.widget-placeholder');
  const results = {
    type1: [], // תגיות + גרף טיקרים (no tabs)
    type2: []  // טריידים אחרונים, פעולות ממתינות, רשימת טיקרים (with tabs)
  };
  
  widgets.forEach((widget, index) => {
    const header = widget.querySelector('.widget-placeholder__header');
    const titleRow = widget.querySelector('.widget-placeholder__header-title-row');
    const tabs = widget.querySelector('.widget-placeholder__tabs');
    const refreshBtn = widget.querySelector('.widget-placeholder__refresh-btn');
    const title = widget.querySelector('.widget-placeholder__title');
    const titleText = title ? title.textContent.trim() : 'Unknown';
    
    const widgetInfo = {
      index: index + 1,
      title: titleText,
      hasTabs: !!tabs,
      hasRefreshBtn: !!refreshBtn,
      type: tabs ? 'Type 2' : 'Type 1'
    };
    
    if (header) {
      const headerStyles = window.getComputedStyle(header);
      const headerRect = header.getBoundingClientRect();
      
      widgetInfo.header = {
        height: headerRect.height,
        borderBottom: headerStyles.borderBottom,
        borderBottomWidth: headerStyles.borderBottomWidth,
        borderBottomColor: headerStyles.borderBottomColor,
        borderBottomStyle: headerStyles.borderBottomStyle,
        paddingBottom: headerStyles.paddingBottom,
        marginBottom: headerStyles.marginBottom
      };
    }
    
    if (titleRow) {
      const titleRowStyles = window.getComputedStyle(titleRow);
      const titleRowRect = titleRow.getBoundingClientRect();
      
      widgetInfo.titleRow = {
        height: titleRowRect.height,
        paddingTop: titleRowStyles.paddingTop,
        paddingBottom: titleRowStyles.paddingBottom,
        marginTop: titleRowStyles.marginTop,
        marginBottom: titleRowStyles.marginBottom,
        alignItems: titleRowStyles.alignItems,
        display: titleRowStyles.display
      };
      
      // Check vertical alignment
      const titleRect = title ? title.getBoundingClientRect() : null;
      const refreshBtnRect = refreshBtn ? refreshBtn.getBoundingClientRect() : null;
      
      if (titleRect && titleRowRect) {
        const titleCenterY = titleRect.top + (titleRect.height / 2);
        const rowCenterY = titleRowRect.top + (titleRowRect.height / 2);
        widgetInfo.titleRow.titleAlignment = {
          titleCenterY: titleCenterY,
          rowCenterY: rowCenterY,
          offset: titleCenterY - rowCenterY,
          aligned: Math.abs(titleCenterY - rowCenterY) < 2
        };
      }
      
      if (refreshBtnRect && titleRowRect) {
        const btnCenterY = refreshBtnRect.top + (refreshBtnRect.height / 2);
        const rowCenterY = titleRowRect.top + (titleRowRect.height / 2);
        widgetInfo.titleRow.refreshBtnAlignment = {
          btnCenterY: btnCenterY,
          rowCenterY: rowCenterY,
          offset: btnCenterY - rowCenterY,
          aligned: Math.abs(btnCenterY - rowCenterY) < 2,
          btnTop: refreshBtnRect.top,
          rowTop: titleRowRect.top,
          btnClipped: refreshBtnRect.top < titleRowRect.top
        };
      }
    }
    
    if (tabs) {
      const tabsStyles = window.getComputedStyle(tabs);
      const tabsRect = tabs.getBoundingClientRect();
      
      widgetInfo.tabs = {
        height: tabsRect.height,
        paddingTop: tabsStyles.paddingTop,
        paddingBottom: tabsStyles.paddingBottom,
        marginTop: tabsStyles.marginTop,
        marginBottom: tabsStyles.marginBottom,
        borderTop: tabsStyles.borderTop,
        borderBottom: tabsStyles.borderBottom
      };
      
      // Check if tabs overlap with title row border
      if (titleRow) {
        const titleRowRect = titleRow.getBoundingClientRect();
        const gap = tabsRect.top - titleRowRect.bottom;
        widgetInfo.tabs.gapFromTitleRow = gap;
        widgetInfo.tabs.overlapsBorder = gap < 0;
      }
    }
    
    // Check border visibility
    if (header && titleRow) {
      const headerRect = header.getBoundingClientRect();
      const titleRowRect = titleRow.getBoundingClientRect();
      const tabsRect = tabs ? tabs.getBoundingClientRect() : null;
      
      // Border should be visible between titleRow and tabs (Type 2) or at bottom of header (Type 1)
      if (tabs) {
        // Type 2: Border should be between titleRow and tabs
        const borderShouldBeAt = titleRowRect.bottom;
        const borderActualAt = tabsRect ? tabsRect.top : headerRect.bottom;
        widgetInfo.borderVisibility = {
          expected: borderShouldBeAt,
          actual: borderActualAt,
          visible: Math.abs(borderShouldBeAt - borderActualAt) < 5,
          gap: tabsRect ? tabsRect.top - titleRowRect.bottom : null
        };
      } else {
        // Type 1: Border should be at bottom of header
        widgetInfo.borderVisibility = {
          expected: headerRect.bottom,
          actual: headerRect.bottom,
          visible: true
        };
      }
    }
    
    // Check entity color accent (left border)
    if (header) {
      const headerStyles = window.getComputedStyle(header);
      const borderLeft = headerStyles.borderLeft;
      const borderLeftWidth = headerStyles.borderLeftWidth;
      widgetInfo.entityAccent = {
        borderLeft: borderLeft,
        borderLeftWidth: borderLeftWidth,
        hasAccent: parseFloat(borderLeftWidth) > 0
      };
    }
    
    // Categorize
    if (widgetInfo.hasTabs) {
      results.type2.push(widgetInfo);
    } else {
      results.type1.push(widgetInfo);
    }
  });
  
  // Report Type 1 (תגיות + גרף טיקרים)
  console.log('📊 Type 1: Widgets WITHOUT tabs (תגיות + גרף טיקרים)');
  console.log('=====================================================');
  results.type1.forEach(widget => {
    console.log(`\n${widget.index}. ${widget.title}`);
    console.log(`   Header height: ${widget.header?.height}px`);
    console.log(`   Title row height: ${widget.titleRow?.height}px`);
    console.log(`   Border bottom: ${widget.header?.borderBottom}`);
    console.log(`   Refresh button: ${widget.hasRefreshBtn ? 'Yes' : 'No'}`);
    if (widget.titleRow?.refreshBtnAlignment) {
      const align = widget.titleRow.refreshBtnAlignment;
      console.log(`   Refresh button alignment:`);
      console.log(`     - Offset from center: ${align.offset.toFixed(2)}px`);
      console.log(`     - Aligned: ${align.aligned ? '✅' : '❌'}`);
      console.log(`     - Clipped at top: ${align.btnClipped ? '⚠️ YES' : '✅ No'}`);
      if (align.btnTop < align.rowTop) {
        console.log(`     ⚠️ Button top (${align.btnTop.toFixed(2)}px) is ABOVE row top (${align.rowTop.toFixed(2)}px)`);
      }
    }
  });
  
  // Report Type 2 (טריידים אחרונים, פעולות ממתינות, רשימת טיקרים)
  console.log('\n\n📊 Type 2: Widgets WITH tabs (טריידים אחרונים, פעולות ממתינות, רשימת טיקרים)');
  console.log('================================================================================');
  results.type2.forEach(widget => {
    console.log(`\n${widget.index}. ${widget.title}`);
    console.log(`   Header height: ${widget.header?.height}px`);
    console.log(`   Title row height: ${widget.titleRow?.height}px`);
    console.log(`   Tabs height: ${widget.tabs?.height}px`);
    console.log(`   Gap between title row and tabs: ${widget.tabs?.gapFromTitleRow?.toFixed(2)}px`);
    console.log(`   Border visibility:`);
    if (widget.borderVisibility) {
      console.log(`     - Expected at: ${widget.borderVisibility.expected.toFixed(2)}px`);
      console.log(`     - Actual gap: ${widget.borderVisibility.gap?.toFixed(2)}px`);
      console.log(`     - Visible: ${widget.borderVisibility.visible ? '✅' : '❌'}`);
    }
    console.log(`   Entity accent (left border): ${widget.entityAccent?.hasAccent ? '✅' : '❌'} (${widget.entityAccent?.borderLeftWidth})`);
    if (widget.titleRow?.refreshBtnAlignment) {
      const align = widget.titleRow.refreshBtnAlignment;
      console.log(`   Refresh button alignment:`);
      console.log(`     - Offset from center: ${align.offset.toFixed(2)}px`);
      console.log(`     - Aligned: ${align.aligned ? '✅' : '❌'}`);
      console.log(`     - Clipped at top: ${align.btnClipped ? '⚠️ YES' : '✅ No'}`);
    }
    if (widget.titleRow?.titleAlignment) {
      const align = widget.titleRow.titleAlignment;
      console.log(`   Title alignment:`);
      console.log(`     - Offset from center: ${align.offset.toFixed(2)}px`);
      console.log(`     - Aligned: ${align.aligned ? '✅' : '❌'}`);
    }
  });
  
  // Summary
  console.log('\n\n📋 Summary');
  console.log('==========');
  console.log(`Type 1 widgets: ${results.type1.length}`);
  console.log(`Type 2 widgets: ${results.type2.length}`);
  
  const type1Issues = results.type1.filter(w => {
    const align = w.titleRow?.refreshBtnAlignment;
    return align && (!align.aligned || align.btnClipped);
  });
  
  const type2Issues = results.type2.filter(w => {
    const borderVisible = w.borderVisibility?.visible;
    const align = w.titleRow?.refreshBtnAlignment;
    return !borderVisible || (align && (!align.aligned || align.btnClipped));
  });
  
  console.log(`\nType 1 issues: ${type1Issues.length}`);
  type1Issues.forEach(w => console.log(`  - ${w.title}`));
  
  console.log(`\nType 2 issues: ${type2Issues.length}`);
  type2Issues.forEach(w => console.log(`  - ${w.title}`));
  
  return {
    type1: results.type1,
    type2: results.type2,
    type1Issues,
    type2Issues
  };
})();
