/**
 * Blueprint Validation Script
 * ============================
 * 
 * Validates blueprint structure before delivery to Team 30
 * 
 * Usage:
 * 1. Add this script to your blueprint HTML file
 * 2. Open the blueprint in browser
 * 3. Check console for validation results
 * 
 * Example:
 * <script src="./blueprint-validation.js"></script>
 */

(function validateBlueprint() {
  'use strict';
  
  const errors = [];
  const warnings = [];
  const info = [];
  
  /**
   * Validate Section Structure
   * Checks that sections have proper header/body structure and are transparent
   */
  function validateSectionStructure() {
    const sections = document.querySelectorAll('tt-section');
    
    if (sections.length === 0) {
      warnings.push('No tt-section elements found');
      return;
    }
    
    sections.forEach((section, index) => {
      const sectionId = section.getAttribute('data-section') || `section-${index}`;
      const header = section.querySelector('.index-section__header');
      const body = section.querySelector('.index-section__body');
      
      // Check if header exists
      if (!header) {
        errors.push(`❌ ${sectionId}: Missing .index-section__header`);
      }
      
      // Check if body exists
      if (!body) {
        errors.push(`❌ ${sectionId}: Missing .index-section__body`);
      }
      
      // Check if section is transparent
      const sectionStyle = window.getComputedStyle(section);
      const sectionBg = sectionStyle.backgroundColor;
      const isTransparent = sectionBg === 'rgba(0, 0, 0, 0)' || 
                           sectionBg === 'transparent' ||
                           sectionBg === '';
      
      if (!isTransparent) {
        warnings.push(`⚠️ ${sectionId}: Should be transparent (current: ${sectionBg})`);
      } else {
        info.push(`✅ ${sectionId}: Transparent (correct)`);
      }
      
      // Check if header has background
      if (header) {
        const headerStyle = window.getComputedStyle(header);
        const headerBg = headerStyle.backgroundColor;
        const isWhite = headerBg !== 'rgba(0, 0, 0, 0)' && 
                       headerBg !== 'transparent' && 
                       headerBg !== '';
        
        if (!isWhite) {
          warnings.push(`⚠️ ${sectionId}: Header should have background (current: ${headerBg})`);
        } else {
          info.push(`✅ ${sectionId}: Header has background (correct)`);
        }
      }
      
      // Check if body has background
      if (body) {
        const bodyStyle = window.getComputedStyle(body);
        const bodyBg = bodyStyle.backgroundColor;
        const isWhite = bodyBg !== 'rgba(0, 0, 0, 0)' && 
                       bodyBg !== 'transparent' && 
                       bodyBg !== '';
        
        if (!isWhite) {
          warnings.push(`⚠️ ${sectionId}: Body should have background (current: ${bodyBg})`);
        } else {
          info.push(`✅ ${sectionId}: Body has background (correct)`);
        }
      }
    });
  }
  
  /**
   * Validate Unified Header
   * Checks that header exists and has proper structure
   */
  function validateUnifiedHeader() {
    const header = document.querySelector('#unified-header');
    
    if (!header) {
      errors.push('❌ Missing #unified-header');
      return;
    }
    
    info.push('✅ Unified Header found');
    
    // Check header-top
    const headerTop = header.querySelector('.header-top');
    if (!headerTop) {
      warnings.push('⚠️ Missing .header-top');
    } else {
      info.push('✅ Header top found');
    }
    
    // Check header-filters
    const headerFilters = header.querySelector('.header-filters');
    if (!headerFilters) {
      warnings.push('⚠️ Missing .header-filters');
    } else {
      info.push('✅ Header filters found');
    }
    
    // Check dropdown menus alignment
    const dropdownMenus = header.querySelectorAll('.tiktrack-dropdown-menu');
    if (dropdownMenus.length > 0) {
      dropdownMenus.forEach((menu, index) => {
        const style = window.getComputedStyle(menu);
        const insetEnd = style.insetInlineEnd;
        
        if (insetEnd !== '0px' && insetEnd !== '0') {
          warnings.push(`⚠️ Dropdown menu ${index}: Should be aligned to button start (inset-inline-end: 0, current: ${insetEnd})`);
        } else {
          info.push(`✅ Dropdown menu ${index}: Aligned correctly`);
        }
      });
    }
    
    // Check filter toggles
    const filterToggles = header.querySelectorAll('.filter-toggle');
    if (filterToggles.length === 0) {
      warnings.push('⚠️ No filter toggles found');
    } else {
      info.push(`✅ Found ${filterToggles.length} filter toggles`);
    }
  }
  
  /**
   * Validate CSS Files Loading
   * Checks that required CSS files are loaded
   */
  function validateCSSFiles() {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const hrefs = links.map(link => link.href);
    
    const requiredFiles = [
      'phoenix-base.css',
      'phoenix-components.css',
      'phoenix-header.css'
    ];
    
    requiredFiles.forEach(file => {
      const found = hrefs.some(href => href.includes(file));
      if (!found) {
        warnings.push(`⚠️ Missing CSS file: ${file}`);
      } else {
        info.push(`✅ CSS file loaded: ${file}`);
      }
    });
  }
  
  /**
   * Validate JavaScript Files
   * Checks that JavaScript files are external (Clean Slate Rule)
   */
  function validateJavaScriptFiles() {
    // Check for inline scripts (should be minimal - only lucide icons)
    const scripts = Array.from(document.querySelectorAll('script'));
    const inlineScripts = scripts.filter(script => !script.src && script.textContent.trim().length > 0);
    
    // Allow only lucide icons script
    const allowedInline = inlineScripts.filter(script => 
      script.textContent.includes('lucide') || 
      script.textContent.includes('window.onload')
    );
    
    if (inlineScripts.length > allowedInline.length) {
      warnings.push(`⚠️ Found ${inlineScripts.length - allowedInline.length} inline scripts (Clean Slate Rule violation)`);
    } else {
      info.push('✅ No Clean Slate Rule violations');
    }
    
    // Check for external JavaScript files
    const externalScripts = scripts.filter(script => script.src);
    if (externalScripts.length > 0) {
      info.push(`✅ Found ${externalScripts.length} external JavaScript files`);
    }
  }
  
  /**
   * Validate Footer Loader
   * Checks that footer loader is present
   */
  function validateFooterLoader() {
    const footerLoader = document.querySelector('script[src*="footer-loader"]');
    
    if (!footerLoader) {
      warnings.push('⚠️ Footer loader script not found');
    } else {
      info.push('✅ Footer loader script found');
    }
  }
  
  /**
   * Report Results
   * Prints validation results to console
   */
  function reportResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 BLUEPRINT VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    if (errors.length > 0) {
      console.error('\n❌ ERRORS:', errors.length);
      errors.forEach(error => console.error('  ' + error));
    }
    
    if (warnings.length > 0) {
      console.warn('\n⚠️ WARNINGS:', warnings.length);
      warnings.forEach(warning => console.warn('  ' + warning));
    }
    
    if (info.length > 0) {
      console.log('\n✅ INFO:', info.length);
      info.forEach(msg => console.log('  ' + msg));
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ BLUEPRINT VALIDATION PASSED');
    } else if (errors.length === 0) {
      console.log('⚠️ BLUEPRINT VALIDATION PASSED WITH WARNINGS');
    } else {
      console.error('❌ BLUEPRINT VALIDATION FAILED');
    }
    
    console.log('='.repeat(60) + '\n');
    
    // Return results for automated testing
    return {
      errors,
      warnings,
      info,
      passed: errors.length === 0,
      passedWithWarnings: errors.length === 0 && warnings.length > 0
    };
  }
  
  // Run validations when DOM is ready
  function runValidations() {
    validateSectionStructure();
    validateUnifiedHeader();
    validateCSSFiles();
    validateJavaScriptFiles();
    validateFooterLoader();
    
    return reportResults();
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runValidations);
  } else {
    // DOM already loaded
    runValidations();
  }
  
  // Export for manual testing
  window.blueprintValidation = {
    run: runValidations,
    errors: () => errors,
    warnings: () => warnings,
    info: () => info
  };
})();
