/**
 * D15 Page Structure Validator
 * ============================
 * 
 * This script validates the critical page structure to prevent horizontal scrolling.
 * Run in browser console: copy-paste and execute
 * 
 * Checks:
 * 1. HTML/Body overflow settings
 * 2. Page wrapper structure and width
 * 3. Page container max-width and centering
 * 4. Any elements causing horizontal overflow
 * 5. Background colors (gray wrapper, white containers)
 */

(function() {
  console.log('🔍 D15 Page Structure Validator');
  console.log('=================================\n');
  
  const issues = [];
  const warnings = [];
  
  // 1. HTML/Body Overflow Check
  console.log('1️⃣ Checking HTML/Body Overflow Settings...');
  const html = document.documentElement;
  const body = document.body;
  
  const htmlOverflowX = window.getComputedStyle(html).overflowX;
  const bodyOverflowX = window.getComputedStyle(body).overflowX;
  
  if (htmlOverflowX !== 'hidden' && htmlOverflowX !== 'visible') {
    warnings.push(`⚠️ HTML overflow-x: ${htmlOverflowX} (should be 'hidden' or 'visible')`);
  } else {
    console.log(`  ✅ HTML overflow-x: ${htmlOverflowX}`);
  }
  
  if (bodyOverflowX !== 'hidden' && bodyOverflowX !== 'visible') {
    warnings.push(`⚠️ Body overflow-x: ${bodyOverflowX} (should be 'hidden' or 'visible')`);
  } else {
    console.log(`  ✅ Body overflow-x: ${bodyOverflowX}`);
  }
  
  // Check for horizontal scrollbar
  const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  if (hasHorizontalScroll) {
    issues.push(`❌ Horizontal scrollbar detected! Document width: ${document.documentElement.scrollWidth}px, Viewport: ${document.documentElement.clientWidth}px`);
  } else {
    console.log(`  ✅ No horizontal scrollbar (Document: ${document.documentElement.scrollWidth}px, Viewport: ${document.documentElement.clientWidth}px)`);
  }
  
  // 2. Page Wrapper Check
  console.log('\n2️⃣ Checking Page Wrapper Structure...');
  const pageWrapper = document.querySelector('.page-wrapper');
  
  if (!pageWrapper) {
    issues.push('❌ Page wrapper (.page-wrapper) not found!');
  } else {
    const wrapperStyles = window.getComputedStyle(pageWrapper);
    const wrapperWidth = wrapperStyles.width;
    const wrapperMargin = wrapperStyles.margin;
    const wrapperPadding = wrapperStyles.padding;
    const wrapperBg = wrapperStyles.backgroundColor;
    
    console.log(`  ✅ Page wrapper found`);
    console.log(`     Width: ${wrapperWidth}`);
    console.log(`     Margin: ${wrapperMargin}`);
    console.log(`     Padding: ${wrapperPadding}`);
    console.log(`     Background: ${wrapperBg}`);
    
    if (wrapperWidth !== '100%' && !wrapperWidth.includes('100%')) {
      issues.push(`❌ Page wrapper width: ${wrapperWidth} (should be 100%)`);
    }
    
    if (wrapperMargin !== '0px') {
      warnings.push(`⚠️ Page wrapper margin: ${wrapperMargin} (should be 0px)`);
    }
    
    if (wrapperPadding !== '0px') {
      warnings.push(`⚠️ Page wrapper padding: ${wrapperPadding} (should be 0px)`);
    }
    
    // Check wrapper actual width vs viewport
    const wrapperRect = pageWrapper.getBoundingClientRect();
    if (wrapperRect.width > window.innerWidth) {
      issues.push(`❌ Page wrapper width (${wrapperRect.width}px) exceeds viewport (${window.innerWidth}px)`);
    }
  }
  
  // 3. Page Container Check
  console.log('\n3️⃣ Checking Page Container Structure...');
  const pageContainer = document.querySelector('.page-container');
  
  if (!pageContainer) {
    issues.push('❌ Page container (.page-container) not found!');
  } else {
    const containerStyles = window.getComputedStyle(pageContainer);
    const containerMaxWidth = containerStyles.maxWidth;
    const containerWidth = containerStyles.width;
    const containerMargin = containerStyles.marginLeft || containerStyles.marginRight;
    const containerPadding = containerStyles.padding;
    
    console.log(`  ✅ Page container found`);
    console.log(`     Max-width: ${containerMaxWidth}`);
    console.log(`     Width: ${containerWidth}`);
    console.log(`     Margin: ${containerMargin}`);
    console.log(`     Padding: ${containerPadding}`);
    
    if (!containerMaxWidth.includes('1400')) {
      issues.push(`❌ Page container max-width: ${containerMaxWidth} (should be 1400px)`);
    }
    
    // Check container actual width
    const containerRect = pageContainer.getBoundingClientRect();
    if (containerRect.width > 1400) {
      issues.push(`❌ Page container width (${containerRect.width}px) exceeds max-width (1400px)`);
    }
    
    // Check if container is centered
    const containerLeft = containerRect.left;
    const containerRight = window.innerWidth - containerRect.right;
    const marginDiff = Math.abs(containerLeft - containerRight);
    if (marginDiff > 10) { // Allow 10px tolerance
      warnings.push(`⚠️ Page container not centered: left margin ${containerLeft}px, right margin ${containerRight}px`);
    } else {
      console.log(`  ✅ Page container is centered (left: ${containerLeft}px, right: ${containerRight}px)`);
    }
  }
  
  // 4. Find Elements Causing Overflow
  console.log('\n4️⃣ Checking for Elements Causing Overflow...');
  const allElements = document.querySelectorAll('*');
  const overflowElements = [];
  
  allElements.forEach(el => {
    const styles = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    
    // Check if element extends beyond viewport
    if (rect.right > window.innerWidth || rect.left < 0) {
      const elementInfo = {
        element: el,
        tag: el.tagName,
        class: el.className || 'none',
        id: el.id || 'none',
        width: rect.width,
        right: rect.right,
        viewportWidth: window.innerWidth
      };
      
      // Only report if it's significantly outside (more than 1px)
      if (rect.right > window.innerWidth + 1 || rect.left < -1) {
        overflowElements.push(elementInfo);
      }
    }
    
    // Check for fixed widths that might cause issues
    if (styles.width && !styles.width.includes('%') && !styles.width.includes('auto') && !styles.width.includes('fit-content')) {
      const widthValue = parseFloat(styles.width);
      if (widthValue > window.innerWidth) {
        warnings.push(`⚠️ Element ${el.tagName}.${el.className} has fixed width ${styles.width} exceeding viewport`);
      }
    }
  });
  
  if (overflowElements.length > 0) {
    console.log(`  ⚠️ Found ${overflowElements.length} elements extending beyond viewport:`);
    overflowElements.slice(0, 10).forEach((info, index) => {
      console.log(`     ${index + 1}. ${info.tag}${info.class ? '.' + info.class : ''}${info.id ? '#' + info.id : ''} - Width: ${info.width}px, Right edge: ${info.right}px (viewport: ${info.viewportWidth}px)`);
    });
    if (overflowElements.length > 10) {
      console.log(`     ... and ${overflowElements.length - 10} more`);
    }
    warnings.push(`⚠️ ${overflowElements.length} elements extend beyond viewport`);
  } else {
    console.log('  ✅ No elements extending beyond viewport');
  }
  
  // 5. Background Colors Check
  console.log('\n5️⃣ Checking Background Colors...');
  const bodyBg = window.getComputedStyle(body).backgroundColor;
  const wrapperBg = pageWrapper ? window.getComputedStyle(pageWrapper).backgroundColor : null;
  
  console.log(`  Body background: ${bodyBg}`);
  if (wrapperBg) {
    console.log(`  Wrapper background: ${wrapperBg}`);
  }
  
  // Check if background is gray (should be #F2F2F7 or similar)
  const isGray = bodyBg.includes('242') || bodyBg.includes('247') || bodyBg.includes('F2F2F7');
  if (!isGray && !bodyBg.includes('rgba(0, 0, 0, 0)')) {
    warnings.push(`⚠️ Body background is not gray: ${bodyBg}`);
  } else {
    console.log('  ✅ Body background is gray');
  }
  
  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed! Page structure is correct.');
  } else {
    if (issues.length > 0) {
      console.log(`\n❌ Critical Issues found: ${issues.length}`);
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
    hasHorizontalScroll,
    pageWrapper: pageWrapper ? {
      width: window.getComputedStyle(pageWrapper).width,
      actualWidth: pageWrapper.getBoundingClientRect().width
    } : null,
    pageContainer: pageContainer ? {
      maxWidth: window.getComputedStyle(pageContainer).maxWidth,
      actualWidth: pageContainer.getBoundingClientRect().width
    } : null,
    overflowElements: overflowElements.length
  };
})();
