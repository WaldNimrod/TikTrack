/**
 * TEMPLATE STYLES VALIDATION
 * 
 * בדיקת סגנונות חסרים בתבנית שלב א מול דף הבית
 * 
 * שימוש:
 * 1. פתח את D15_PAGE_TEMPLATE_STAGE_1.html בדפדפן
 * 2. פתח את הקונסול (F12)
 * 3. העתק והדבק את הקוד הזה
 * 4. בדוק את התוצאות
 */

(function validateTemplateStyles() {
  console.log('🔍 בדיקת סגנונות תבנית שלב א...\n');
  
  const issues = [];
  const warnings = [];
  
  // בדיקת קובצי CSS שנטענו
  const loadedStylesheets = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return sheet.href ? new URL(sheet.href).pathname.split('/').pop() : 'inline';
      } catch (e) {
        return 'unknown';
      }
    });
  
  console.log('📋 קבצי CSS שנטענו:', loadedStylesheets);
  
  // בדיקה אם D15_DASHBOARD_STYLES.css נטען
  const hasDashboardStyles = loadedStylesheets.some(s => s.includes('D15_DASHBOARD_STYLES'));
  if (hasDashboardStyles) {
    warnings.push('⚠️ D15_DASHBOARD_STYLES.css נטען - זה לא אמור להיות בתבנית שלב א');
  }
  
  // בדיקת סקשנים
  const sections = document.querySelectorAll('tt-section');
  console.log(`\n📦 נמצאו ${sections.length} סקשנים`);
  
  sections.forEach((section, index) => {
    const sectionId = section.getAttribute('data-section') || `section-${index}`;
    console.log(`\n🔍 בודק סקשן: ${sectionId}`);
    
    const header = section.querySelector('.index-section__header');
    const body = section.querySelector('.index-section__body');
    
    if (!header) {
      issues.push(`❌ סקשן ${sectionId}: חסר .index-section__header`);
    } else {
      // בדיקת סגנונות header
      const headerStyles = window.getComputedStyle(header);
      
      // בדיקת רקע
      const bg = headerStyles.backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
        issues.push(`❌ סקשן ${sectionId} header: חסר רקע לבן (צריך: rgb(255, 255, 255))`);
      }
      
      // בדיקת מסגרת
      const border = headerStyles.borderWidth;
      if (!border || border === '0px') {
        issues.push(`❌ סקשן ${sectionId} header: חסר מסגרת`);
      }
      
      // בדיקת צל
      const shadow = headerStyles.boxShadow;
      if (!shadow || shadow === 'none') {
        issues.push(`❌ סקשן ${sectionId} header: חסר צל`);
      }
      
      // בדיקת גובה קבוע
      const height = headerStyles.height;
      if (height !== '60px') {
        issues.push(`❌ סקשן ${sectionId} header: גובה לא תקין (${height}, צריך: 60px)`);
      }
      
      // בדיקת border-radius
      const borderRadius = headerStyles.borderRadius;
      if (!borderRadius || borderRadius === '0px') {
        issues.push(`❌ סקשן ${sectionId} header: חסר border-radius`);
      }
      
      // בדיקת צבע ישות (border-inline-start)
      const borderStart = headerStyles.borderInlineStartWidth;
      if (!borderStart || borderStart === '0px') {
        issues.push(`❌ סקשן ${sectionId} header: חסר צבע ישות (border-inline-start)`);
      }
      
      // בדיקת אלמנטי header
      const title = header.querySelector('.index-section__header-title');
      const icon = header.querySelector('.index-section__header-icon');
      const text = header.querySelector('.index-section__header-text');
      const meta = header.querySelector('.index-section__header-meta');
      const actions = header.querySelector('.index-section__header-actions');
      
      if (!title) issues.push(`❌ סקשן ${sectionId}: חסר .index-section__header-title`);
      if (!icon) issues.push(`❌ סקשן ${sectionId}: חסר .index-section__header-icon`);
      if (!text) issues.push(`❌ סקשן ${sectionId}: חסר .index-section__header-text`);
      if (!meta) warnings.push(`⚠️ סקשן ${sectionId}: חסר .index-section__header-meta (אופציונלי)`);
      if (!actions) issues.push(`❌ סקשן ${sectionId}: חסר .index-section__header-actions`);
      
      // בדיקת גודל איקון
      if (icon) {
        const iconStyles = window.getComputedStyle(icon);
        const iconWidth = iconStyles.width;
        const iconHeight = iconStyles.height;
        if (iconWidth !== '35px' || iconHeight !== '35px') {
          issues.push(`❌ סקשן ${sectionId} icon: גודל לא תקין (${iconWidth}x${iconHeight}, צריך: 35px x 35px)`);
        }
      }
    }
    
    if (!body) {
      issues.push(`❌ סקשן ${sectionId}: חסר .index-section__body`);
    } else {
      // בדיקת סגנונות body
      const bodyStyles = window.getComputedStyle(body);
      
      // בדיקת רקע
      const bg = bodyStyles.backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
        issues.push(`❌ סקשן ${sectionId} body: חסר רקע לבן (צריך: rgb(255, 255, 255))`);
      }
      
      // בדיקת מסגרת
      const border = bodyStyles.borderWidth;
      if (!border || border === '0px') {
        issues.push(`❌ סקשן ${sectionId} body: חסר מסגרת`);
      }
      
      // בדיקת צל
      const shadow = bodyStyles.boxShadow;
      if (!shadow || shadow === 'none') {
        issues.push(`❌ סקשן ${sectionId} body: חסר צל`);
      }
      
      // בדיקת padding
      const padding = bodyStyles.padding;
      if (!padding || padding === '0px') {
        issues.push(`❌ סקשן ${sectionId} body: חסר padding`);
      }
      
      // בדיקת border-radius
      const borderRadius = bodyStyles.borderRadius;
      if (!borderRadius || borderRadius === '0px') {
        issues.push(`❌ סקשן ${sectionId} body: חסר border-radius`);
      }
    }
  });
  
  // בדיקת פוטר
  const footer = document.querySelector('.page-footer');
  if (!footer) {
    issues.push('❌ חסר .page-footer');
  } else {
    const footerStyles = window.getComputedStyle(footer);
    const footerHeight = footerStyles.height;
    if (footerHeight !== '200px') {
      issues.push(`❌ פוטר: גובה לא תקין (${footerHeight}, צריך: 200px)`);
    }
    const footerBg = footerStyles.backgroundColor;
    if (!footerBg || footerBg === 'rgba(0, 0, 0, 0)' || footerBg === 'transparent') {
      issues.push('❌ פוטר: חסר רקע אפור');
    }
  }
  
  // סיכום
  console.log('\n' + '='.repeat(60));
  console.log('📊 סיכום בדיקה:');
  console.log('='.repeat(60));
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ הכל תקין! אין בעיות.');
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
  console.log('אם יש בעיות, יש להעביר את הסגנונות הבסיסיים של');
  console.log('.index-section__header ו-.index-section__body');
  console.log('לקובץ מרכזי (phoenix-components.css או phoenix-sections.css)');
  console.log('='.repeat(60));
  
  return {
    issues,
    warnings,
    sectionsCount: sections.length,
    hasDashboardStyles
  };
})();
