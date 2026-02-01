/**
 * D15_INDEX Visual Accuracy Checker
 * ===================================
 * 
 * This script validates visual accuracy requirements for D15_INDEX.html
 * Run in browser console: copy-paste and execute
 * 
 * Checks:
 * 1. Logo and slogan sizes/colors
 * 2. Summary info layout (two rows, centered, full width, toggle button position)
 * 3. Container background transparency (data-section elements)
 * 4. Widget card consistency (header/content structure)
 * 5. Portfolio header layout (account select width, checkboxes, count text styling)
 */

(function() {
  console.log('🔍 D15_INDEX Visual Accuracy Checker');
  console.log('=====================================\n');
  
  const issues = [];
  const warnings = [];
  
  // 1. Logo and Slogan Check
  console.log('1️⃣ Checking Logo and Slogan...');
  const logoImage = document.querySelector('#unified-header .logo-image');
  const logoSlogan = document.querySelector('#unified-header .logo-text');
  
  if (logoImage) {
    const logoStyles = window.getComputedStyle(logoImage);
    const logoWidth = parseFloat(logoStyles.width);
    const logoHeight = parseFloat(logoStyles.height);
    
    if (logoWidth !== 125 || logoHeight !== 37.5) {
      issues.push(`❌ Logo size incorrect: ${logoWidth}x${logoHeight} (expected: 125x37.5)`);
    } else {
      console.log('  ✅ Logo size: 125x37.5px');
    }
  } else {
    issues.push('❌ Logo image not found');
  }
  
  if (logoSlogan) {
    const sloganStyles = window.getComputedStyle(logoSlogan);
    const fontSize = sloganStyles.fontSize;
    const fontWeight = sloganStyles.fontWeight;
    const color = sloganStyles.color;
    
    if (fontSize !== '16px' && fontSize !== '1rem') {
      issues.push(`❌ Slogan font-size: ${fontSize} (expected: 1rem/16px)`);
    }
    if (fontWeight !== '300') {
      issues.push(`❌ Slogan font-weight: ${fontWeight} (expected: 300)`);
    }
    if (!color.includes('26baac') && !color.includes('rgb(38, 186, 172)')) {
      issues.push(`❌ Slogan color: ${color} (expected: #26baac)`);
    }
    
    if (fontSize === '16px' || fontSize === '1rem') {
      console.log('  ✅ Slogan font-size: 1rem');
    }
    if (fontWeight === '300') {
      console.log('  ✅ Slogan font-weight: 300');
    }
    if (color.includes('26baac') || color.includes('rgb(38, 186, 172)')) {
      console.log('  ✅ Slogan color: #26baac');
    }
  } else {
    issues.push('❌ Logo slogan not found');
  }
  
  // 2. Summary Info Layout Check
  console.log('\n2️⃣ Checking Summary Info Layout...');
  const summaryStats = document.getElementById('summaryStats');
  const portfolioSummary = document.getElementById('portfolioSummaryContent');
  
  if (summaryStats) {
    const summaryStyles = window.getComputedStyle(summaryStats);
    const justifyContent = summaryStyles.justifyContent;
    const width = summaryStyles.width;
    
    if (justifyContent !== 'center') {
      issues.push(`❌ Summary stats not centered: ${justifyContent}`);
    } else {
      console.log('  ✅ Summary stats centered');
    }
    
    if (!width.includes('100%')) {
      issues.push(`❌ Summary stats not full width: ${width}`);
    } else {
      console.log('  ✅ Summary stats full width');
    }
    
    // Check toggle button position - should be in first row of summaryStats
    const firstRow = summaryStats.querySelector('.info-summary__row--first');
    const toggleBtn = summaryStats.querySelector('.portfolio-summary__toggle-btn');
    
    if (firstRow && toggleBtn && !firstRow.contains(toggleBtn)) {
      issues.push('❌ Toggle button not in first row of summaryStats');
    } else if (firstRow && toggleBtn) {
      console.log('  ✅ Toggle button in first row of summaryStats');
    } else if (!toggleBtn) {
      issues.push('❌ Toggle button not found in summaryStats');
    }
  } else {
    issues.push('❌ Summary stats element not found');
  }
  
  if (portfolioSummary) {
    // portfolioSummaryContent is the second row that should be toggled
    const display = window.getComputedStyle(portfolioSummary).display;
    if (display === 'none') {
      console.log('  ✅ Portfolio summary row hidden by default');
    } else {
      console.log(`  ℹ️ Portfolio summary row display: ${display}`);
    }
  } else {
    issues.push('❌ Portfolio summary content element not found');
  }
  
  // 3. Container Background Check
  console.log('\n3️⃣ Checking Container Backgrounds...');
  const sections = document.querySelectorAll('tt-section[data-section]');
  sections.forEach(section => {
    const sectionStyles = window.getComputedStyle(section);
    const bgColor = sectionStyles.backgroundColor;
    const bgTransparent = bgColor === 'rgba(0, 0, 0, 0)' || 
                         bgColor === 'transparent' ||
                         bgColor.includes('rgba(0, 0, 0, 0)');
    
    if (!bgTransparent && bgColor !== 'rgb(255, 255, 255)') {
      warnings.push(`⚠️ Section ${section.getAttribute('data-section')} has background: ${bgColor} (should be transparent)`);
    } else if (bgTransparent) {
      console.log(`  ✅ Section ${section.getAttribute('data-section')} background transparent`);
    }
  });
  
  // 4. Widget Card Consistency Check
  console.log('\n4️⃣ Checking Widget Card Consistency...');
  const widgets = document.querySelectorAll('.widget-placeholder');
  widgets.forEach((widget, index) => {
    const header = widget.querySelector('.widget-placeholder__header');
    const body = widget.querySelector('.widget-placeholder__body');
    
    if (!header) {
      issues.push(`❌ Widget ${index + 1} missing header`);
    }
    if (!body) {
      issues.push(`❌ Widget ${index + 1} missing body`);
    }
    
    if (header && body) {
      const headerHeight = parseFloat(window.getComputedStyle(header).height);
      if (headerHeight > 60) {
        warnings.push(`⚠️ Widget ${index + 1} header height: ${headerHeight}px (should be < 60px)`);
      }
    }
  });
  
  // Check "Recent Items" widget specifically
  const recentItemsWidget = Array.from(widgets).find(w => 
    w.querySelector('.widget-placeholder__title')?.textContent.includes('טריידים אחרונים') ||
    w.querySelector('.widget-placeholder__tabs')
  );
  if (recentItemsWidget) {
    const header = recentItemsWidget.querySelector('.widget-placeholder__header');
    const body = recentItemsWidget.querySelector('.widget-placeholder__body');
    if (!header || !body) {
      issues.push('❌ Recent Items widget missing header/body structure');
    }
  }
  
  // 5. Portfolio Header Layout Check
  console.log('\n5️⃣ Checking Portfolio Header Layout...');
  const portfolioHeader = document.querySelector('[data-section="portfolio"] .index-section__header');
  if (portfolioHeader) {
    const accountFilter = portfolioHeader.querySelector('#portfolioAccountFilter');
    const checkboxes = portfolioHeader.querySelectorAll('.portfolio-checkbox-label');
    const countText = portfolioHeader.querySelector('#portfolioCount');
    
    if (accountFilter) {
      const filterWidth = parseFloat(window.getComputedStyle(accountFilter).width);
      const parentWidth = parseFloat(window.getComputedStyle(accountFilter.parentElement).width);
      const widthPercent = (filterWidth / parentWidth) * 100;
      
      if (widthPercent > 60) {
        issues.push(`❌ Account filter too wide: ${widthPercent.toFixed(1)}% (should be ~50%)`);
      } else {
        console.log(`  ✅ Account filter width: ${widthPercent.toFixed(1)}%`);
      }
    }
    
    checkboxes.forEach((checkbox, index) => {
      const container = checkbox.closest('.portfolio-checkboxes-container');
      if (container) {
        const border = window.getComputedStyle(container).border;
        if (border && border !== '0px none rgb(0, 0, 0)') {
          issues.push(`❌ Checkbox container ${index + 1} has border (should be borderless)`);
        } else {
          console.log(`  ✅ Checkbox container ${index + 1} borderless`);
        }
      }
    });
    
    if (countText) {
      const countStyles = window.getComputedStyle(countText);
      const textAlign = countStyles.textAlign;
      const color = countStyles.color;
      const opacity = countStyles.opacity;
      
      if (textAlign !== 'center') {
        issues.push(`❌ Count text not centered: ${textAlign}`);
      } else {
        console.log('  ✅ Count text centered');
      }
      
      if (opacity !== '0.8') {
        issues.push(`❌ Count text opacity: ${opacity} (expected: 0.8)`);
      } else {
        console.log('  ✅ Count text opacity: 0.8');
      }
    }
  }
  
  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed!');
  } else {
    if (issues.length > 0) {
      console.log(`\n❌ Issues found: ${issues.length}`);
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    if (warnings.length > 0) {
      console.log(`\n⚠️ Warnings: ${warnings.length}`);
      warnings.forEach(warning => console.log(`  ${warning}`));
    }
  }
  
  return {
    issues,
    warnings,
    passed: issues.length === 0
  };
})();
