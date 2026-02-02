/**
 * TEMPLATE V2 VALIDATION
 * 
 * בדיקת תבנית V2 - Final Governance Lock Compliant
 * 
 * שימוש:
 * 1. פתח את D15_PAGE_TEMPLATE_V2.html בדפדפן
 * 2. פתח את הקונסול (F12)
 * 3. העתק והדבק את הקוד הזה
 * 4. בדוק את התוצאות
 * 
 * בדיקות:
 * - Clean Slate Rule: אין JavaScript בתוך HTML
 * - Fluid Design: שימוש ב-clamp, min, max, Grid auto-fit/auto-fill
 * - Design Tokens SSOT: שימוש ב-CSS Variables מ-phoenix-base.css בלבד
 * - LEGO System: מבנה מודולרי תקין
 * - Header + Footer: תבנית בסיסית מלאה
 */

(function validateTemplateV2() {
  console.log('🔍 בדיקת תבנית V2 - Final Governance Lock Compliant...\n');
  
  const issues = [];
  const warnings = [];
  const compliance = {
    cleanSlate: true,
    fluidDesign: true,
    designTokensSSOT: true,
    legoSystem: true,
    headerFooter: true
  };
  
  // ============================================
  // בדיקת Clean Slate Rule: אין JavaScript בתוך HTML
  // ============================================
  console.log('📋 בודק Clean Slate Rule...');
  const inlineScripts = document.querySelectorAll('script:not([src])');
  if (inlineScripts.length > 0) {
    compliance.cleanSlate = false;
    issues.push(`❌ Clean Slate Rule: נמצאו ${inlineScripts.length} תגי <script> פנימיים - כל הסקריפטים חייבים להיות בקבצים חיצוניים`);
    inlineScripts.forEach((script, i) => {
      const content = script.textContent.trim();
      if (content.length > 0) {
        issues.push(`   ${i + 1}. תג <script> פנימי עם תוכן (${content.substring(0, 50)}...)`);
      }
    });
  } else {
    console.log('   ✅ אין תגי <script> פנימיים');
  }
  
  // בדיקת inline event handlers
  const inlineHandlers = document.querySelectorAll('[onclick], [onchange], [onsubmit], [onload], [onerror]');
  if (inlineHandlers.length > 0) {
    compliance.cleanSlate = false;
    issues.push(`❌ Clean Slate Rule: נמצאו ${inlineHandlers.length} inline event handlers - כל ה-handlers חייבים להיות בקבצים חיצוניים`);
    inlineHandlers.forEach((el, i) => {
      const handler = el.getAttribute('onclick') || el.getAttribute('onchange') || el.getAttribute('onsubmit') || el.getAttribute('onload') || el.getAttribute('onerror');
      issues.push(`   ${i + 1}. ${el.tagName} עם ${handler.substring(0, 30)}...`);
    });
  } else {
    console.log('   ✅ אין inline event handlers');
  }
  
  // בדיקת קבצי JavaScript חיצוניים
  const externalScripts = document.querySelectorAll('script[src]');
  const requiredScripts = ['footer-loader.js', 'header-filters.js', 'section-toggle.js'];
  const loadedScripts = Array.from(externalScripts).map(s => s.src.split('/').pop());
  requiredScripts.forEach(script => {
    if (!loadedScripts.includes(script)) {
      warnings.push(`⚠️ Clean Slate Rule: חסר קובץ JavaScript חיצוני: ${script}`);
    }
  });
  console.log(`   ✅ נמצאו ${externalScripts.length} קבצי JavaScript חיצוניים`);
  
  // ============================================
  // בדיקת Fluid Design: שימוש ב-clamp, min, max, Grid
  // ============================================
  console.log('\n📋 בודק Fluid Design...');
  // בדיקה זו דורשת בדיקה ידנית של CSS - רק אזהרה
  warnings.push('⚠️ Fluid Design: יש לבדוק ידנית שימוש ב-clamp, min, max, Grid auto-fit/auto-fill');
  warnings.push('⚠️ Fluid Design: אין Media Queries עבור גדלי פונטים וריווחים');
  
  // ============================================
  // בדיקת Design Tokens SSOT: CSS Variables בלבד
  // ============================================
  console.log('\n📋 בודק Design Tokens SSOT...');
  const loadedStylesheets = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return sheet.href ? new URL(sheet.href).pathname.split('/').pop() : 'inline';
      } catch (e) {
        return 'unknown';
      }
    });
  
  console.log('📋 קבצי CSS שנטענו:', loadedStylesheets);
  
  // בדיקה אם design-tokens.css נטען (אסור)
  const hasDesignTokens = loadedStylesheets.some(s => s.includes('design-tokens'));
  if (hasDesignTokens) {
    compliance.designTokensSSOT = false;
    issues.push('❌ Design Tokens SSOT: נמצא קובץ design-tokens.css - אסור! רק phoenix-base.css');
  }
  
  // בדיקה אם phoenix-base.css נטען (חובה)
  const hasPhoenixBase = loadedStylesheets.some(s => s.includes('phoenix-base'));
  if (!hasPhoenixBase) {
    compliance.designTokensSSOT = false;
    issues.push('❌ Design Tokens SSOT: חסר קובץ phoenix-base.css - חובה!');
  } else {
    console.log('   ✅ phoenix-base.css נטען');
  }
  
  // ============================================
  // בדיקת LEGO System: מבנה מודולרי תקין
  // ============================================
  console.log('\n📋 בודק LEGO System...');
  const containers = document.querySelectorAll('tt-container');
  const sections = document.querySelectorAll('tt-section');
  const sectionRows = document.querySelectorAll('tt-section-row');
  
  if (containers.length === 0) {
    compliance.legoSystem = false;
    issues.push('❌ LEGO System: חסר tt-container');
  } else {
    console.log(`   ✅ נמצאו ${containers.length} tt-container`);
  }
  
  if (sections.length === 0) {
    compliance.legoSystem = false;
    issues.push('❌ LEGO System: חסר tt-section');
  } else {
    console.log(`   ✅ נמצאו ${sections.length} tt-section`);
    
    sections.forEach((section, index) => {
      const sectionId = section.getAttribute('data-section') || `section-${index}`;
      const header = section.querySelector('.index-section__header, .dashboard-section__header');
      const body = section.querySelector('.index-section__body, .dashboard-section__body');
      
      if (!header) {
        compliance.legoSystem = false;
        issues.push(`❌ LEGO System: סקשן ${sectionId} חסר header`);
      }
      
      if (!body) {
        compliance.legoSystem = false;
        issues.push(`❌ LEGO System: סקשן ${sectionId} חסר body`);
      }
    });
  }
  
  if (sectionRows.length === 0) {
    warnings.push('⚠️ LEGO System: אין tt-section-row (אופציונלי)');
  } else {
    console.log(`   ✅ נמצאו ${sectionRows.length} tt-section-row`);
  }
  
  // ============================================
  // בדיקת Header + Footer: תבנית בסיסית מלאה
  // ============================================
  console.log('\n📋 בודק Header + Footer...');
  const header = document.getElementById('unified-header');
  if (!header) {
    compliance.headerFooter = false;
    issues.push('❌ Header + Footer: חסר unified-header');
  } else {
    console.log('   ✅ נמצא unified-header');
  }
  
  const footer = document.querySelector('.page-footer');
  if (!footer) {
    compliance.headerFooter = false;
    issues.push('❌ Header + Footer: חסר .page-footer');
  } else {
    console.log('   ✅ נמצא .page-footer');
  }
  
  // בדיקת G-Bridge Banner
  const gBridgeBanner = document.querySelector('.g-bridge-banner');
  if (!gBridgeBanner) {
    warnings.push('⚠️ Header + Footer: חסר .g-bridge-banner');
  } else {
    console.log('   ✅ נמצא .g-bridge-banner');
  }
  
  // ============================================
  // סיכום
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 סיכום בדיקה:');
  console.log('='.repeat(60));
  
  console.log('\n✅ עמידה בקללים:');
  Object.entries(compliance).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '❌'} ${key}: ${value ? 'עומד' : 'לא עומד'}`);
  });
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✅ הכל תקין! אין בעיות.');
  } else {
    if (issues.length > 0) {
      console.log(`\n❌ נמצאו ${issues.length} בעיות:`);
      issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log(`\n⚠️ נמצאו ${warnings.length} אזהרות:`);
      warnings.forEach((warning, i) => console.log(`${i + 1}. ${warning}`));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 המלצה:');
  console.log('אם יש בעיות, יש לבדוק:');
  console.log('1. כל הסקריפטים בקבצים חיצוניים (Clean Slate Rule)');
  console.log('2. שימוש ב-clamp, min, max, Grid auto-fit/auto-fill (Fluid Design)');
  console.log('3. שימוש ב-CSS Variables מ-phoenix-base.css בלבד (Design Tokens SSOT)');
  console.log('4. מבנה LEGO System תקין (tt-container > tt-section > tt-section-row)');
  console.log('5. Header + Footer מופיעים בכל העמודים');
  console.log('='.repeat(60));
  
  return {
    issues,
    warnings,
    compliance,
    containersCount: containers.length,
    sectionsCount: sections.length,
    sectionRowsCount: sectionRows.length,
    externalScriptsCount: externalScripts.length
  };
})();
