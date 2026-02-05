/**
 * LOGIN COMPARISON INSPECTOR - Team 30 Frontend
 * ===============================================
 * כלי דיבוג להשוואה בין עמוד הלוגאין החדש ללגסי
 * 
 * שימוש:
 * 1. פתח את עמוד הלוגאין החדש בדפדפן
 * 2. פתח קונסולה (F12 > Console)
 * 3. העתק והדבק את הקוד הזה
 * 4. הסקריפט יציג דוח מפורט על כל ההבדלים
 * 
 * אחרי זה:
 * 5. פתח את עמוד הלוגאין הלגסי
 * 6. העתק את הדוח (window.copyLoginComparisonReport())
 * 7. השווה בין הדוחות
 * 
 * גרסה: 1.0.0
 * תאריך: 2026-01-31
 */

(function() {
  'use strict';

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
    return remValue * 16;
  }

  function getColorValue(value) {
    if (!value) return null;
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

  function inspectElement(element, name) {
    if (!element) return null;
    
    const styles = window.getComputedStyle(element);
    return {
      name: name,
      selector: element.className || element.tagName.toLowerCase(),
      // Typography
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontSizePx: parsePx(styles.fontSize) || parseRem(styles.fontSize),
      fontWeight: parseInt(styles.fontWeight) || 0,
      lineHeight: styles.lineHeight,
      lineHeightNum: parseFloat(styles.lineHeight) || 0,
      letterSpacing: styles.letterSpacing,
      textTransform: styles.textTransform,
      // Colors
      color: getColorValue(styles.color),
      backgroundColor: getColorValue(styles.backgroundColor),
      // Spacing
      padding: styles.padding,
      paddingTop: styles.paddingTop,
      paddingRight: styles.paddingRight,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft,
      margin: styles.margin,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
      // Borders
      border: styles.border,
      borderWidth: styles.borderWidth,
      borderStyle: styles.borderStyle,
      borderColor: getColorValue(styles.borderColor),
      borderRadius: styles.borderRadius,
      // Box Model
      width: element.offsetWidth,
      height: element.offsetHeight,
      boxSizing: styles.boxSizing,
      // Effects
      boxShadow: styles.boxShadow,
      textShadow: styles.textShadow,
      // Display
      display: styles.display,
      // Other
      textAlign: styles.textAlign,
      whiteSpace: styles.whiteSpace
    };
  }

  // ===== בדיקת אלמנטים =====
  function inspectLoginPage() {
    const report = {
      timestamp: new Date().toISOString(),
      page: window.location.href.includes('login') ? 'login' : 'unknown',
      url: window.location.href,
      body: {},
      logo: {},
      title: {},
      subtitle: {},
      formLabels: [],
      formInputs: [],
      buttons: [],
      links: [],
      checkboxes: []
    };

    // Body
    report.body = inspectElement(document.body, 'body');

    // Logo
    const logo = document.querySelector('.auth-logo img, .login-logo img, .login-header img, .auth-header img');
    if (logo) {
      report.logo = inspectElement(logo, 'logo');
    }

    // Title
    const title = document.querySelector('.auth-title, .login-title, h1');
    if (title) {
      report.title = inspectElement(title, 'title');
    }

    // Subtitle
    const subtitle = document.querySelector('.auth-subtitle, .login-subtitle, .auth-header p, .login-header p');
    if (subtitle) {
      report.subtitle = inspectElement(subtitle, 'subtitle');
    }

    // Form Labels
    const labels = document.querySelectorAll('.form-label, label:not([for="rememberMe"])');
    report.formLabels = Array.from(labels).map((label, idx) => ({
      ...inspectElement(label, `form-label-${idx}`),
      text: label.textContent.trim()
    }));

    // Form Inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
    report.formInputs = Array.from(inputs).map((input, idx) => ({
      ...inspectElement(input, `form-input-${idx}`),
      placeholder: input.placeholder || '',
      type: input.type
    }));

    // Buttons
    const buttons = document.querySelectorAll('button, .btn, .btn-primary, [type="submit"], .btn-login');
    report.buttons = Array.from(buttons).map((btn, idx) => ({
      ...inspectElement(btn, `button-${idx}`),
      text: btn.textContent.trim(),
      classes: btn.className
    }));

    // Links
    const links = document.querySelectorAll('a');
    report.links = Array.from(links).map((link, idx) => ({
      ...inspectElement(link, `link-${idx}`),
      text: link.textContent.trim(),
      href: link.href
    }));

    // Checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    report.checkboxes = Array.from(checkboxes).map((checkbox, idx) => ({
      ...inspectElement(checkbox, `checkbox-${idx}`),
      width: checkbox.offsetWidth,
      height: checkbox.offsetHeight
    }));

    return report;
  }

  // ===== הרצת הבדיקה והצגת התוצאות =====
  const report = inspectLoginPage();

  // שמירה ב-global scope לנוחות
  window.loginComparisonReport = report;

  // הצגת דוח מפורט בקונסולה
  console.group('📝 LOGIN COMPARISON INSPECTOR');
  console.log('Timestamp:', report.timestamp);
  console.log('Page URL:', report.url);
  console.log('Page Type:', report.page);
  
  // Body
  if (report.body) {
    console.group('\n📄 Body:');
    console.log('Font Family:', report.body.fontFamily);
    console.log('Font Size:', report.body.fontSize, `(${report.body.fontSizePx}px)`);
    console.log('Line Height:', report.body.lineHeight);
    console.log('Background Color:', report.body.backgroundColor);
    console.log('Color:', report.body.color);
    console.groupEnd();
  }

  // Logo
  if (report.logo && report.logo.element) {
    console.group('\n🖼️ Logo:');
    console.log('Width:', report.logo.width, 'px');
    console.log('Height:', report.logo.height, 'px');
    console.groupEnd();
  }

  // Title
  if (report.title && report.title.element) {
    console.group('\n📌 Title:');
    console.log('Text:', report.title.element.textContent.trim());
    console.log('Font Family:', report.title.fontFamily);
    console.log('Font Size:', report.title.fontSize, `(${report.title.fontSizePx}px)`);
    console.log('Font Weight:', report.title.fontWeight);
    console.log('Line Height:', report.title.lineHeight, `(${report.title.lineHeightNum})`);
    console.log('Color:', report.title.color);
    console.log('Margin:', report.title.margin);
    console.groupEnd();
  }

  // Subtitle
  if (report.subtitle && report.subtitle.element) {
    console.group('\n📌 Subtitle:');
    console.log('Text:', report.subtitle.element.textContent.trim());
    console.log('Font Family:', report.subtitle.fontFamily);
    console.log('Font Size:', report.subtitle.fontSize, `(${report.subtitle.fontSizePx}px)`);
    console.log('Font Weight:', report.subtitle.fontWeight);
    console.log('Line Height:', report.subtitle.lineHeight, `(${report.subtitle.lineHeightNum})`);
    console.log('Color:', report.subtitle.color);
    console.log('Margin:', report.subtitle.margin);
    console.groupEnd();
  }

  // Form Labels
  if (report.formLabels.length > 0) {
    console.group(`\n🏷️ Form Labels (${report.formLabels.length}):`);
    report.formLabels.forEach((label, idx) => {
      console.group(`Label ${idx + 1}: "${label.text}"`);
      console.log('Font Family:', label.fontFamily);
      console.log('Font Size:', label.fontSize, `(${label.fontSizePx}px)`);
      console.log('Font Weight:', label.fontWeight);
      console.log('Line Height:', label.lineHeight, `(${label.lineHeightNum})`);
      console.log('Color:', label.color);
      console.log('Margin:', label.margin);
      console.groupEnd();
    });
    console.groupEnd();
  }

  // Form Inputs
  if (report.formInputs.length > 0) {
    console.group(`\n📝 Form Inputs (${report.formInputs.length}):`);
    report.formInputs.forEach((input, idx) => {
      console.group(`Input ${idx + 1} (${input.type}): "${input.placeholder}"`);
      console.log('Font Family:', input.fontFamily);
      console.log('Font Size:', input.fontSize, `(${input.fontSizePx}px)`);
      console.log('Font Weight:', input.fontWeight);
      console.log('Line Height:', input.lineHeight, `(${input.lineHeightNum})`);
      console.log('Padding:', input.padding);
      console.log('Border:', input.border);
      console.log('Border Radius:', input.borderRadius);
      console.log('Background Color:', input.backgroundColor);
      console.log('Color:', input.color);
      console.log('Width:', input.width, 'px');
      console.log('Height:', input.height, 'px');
      console.groupEnd();
    });
    console.groupEnd();
  }

  // Buttons
  if (report.buttons.length > 0) {
    console.group(`\n🔘 Buttons (${report.buttons.length}):`);
    report.buttons.forEach((btn, idx) => {
      console.group(`Button ${idx + 1}: "${btn.text}"`);
      console.log('Classes:', btn.classes);
      console.log('Font Family:', btn.fontFamily);
      console.log('Font Size:', btn.fontSize, `(${btn.fontSizePx}px)`);
      console.log('Font Weight:', btn.fontWeight);
      console.log('Line Height:', btn.lineHeight, `(${btn.lineHeightNum})`);
      console.log('Padding:', btn.padding);
      console.log('Border:', btn.border);
      console.log('Border Radius:', btn.borderRadius);
      console.log('Background Color:', btn.backgroundColor);
      console.log('Color:', btn.color);
      console.log('Box Shadow:', btn.boxShadow);
      console.log('Width:', btn.width, 'px');
      console.log('Height:', btn.height, 'px');
      console.groupEnd();
    });
    console.groupEnd();
  }

  // Links
  if (report.links.length > 0) {
    console.group(`\n🔗 Links (${report.links.length}):`);
    report.links.forEach((link, idx) => {
      console.group(`Link ${idx + 1}: "${link.text}"`);
      console.log('Font Family:', link.fontFamily);
      console.log('Font Size:', link.fontSize, `(${link.fontSizePx}px)`);
      console.log('Font Weight:', link.fontWeight);
      console.log('Color:', link.color);
      console.log('Text Decoration:', getComputedStyleValue(link.element, 'text-decoration'));
      console.groupEnd();
    });
    console.groupEnd();
  }

  // Checkboxes
  if (report.checkboxes.length > 0) {
    console.group(`\n☑️ Checkboxes (${report.checkboxes.length}):`);
    report.checkboxes.forEach((checkbox, idx) => {
      console.group(`Checkbox ${idx + 1}:`);
      console.log('Width:', checkbox.width, 'px');
      console.log('Height:', checkbox.height, 'px');
      console.groupEnd();
    });
    console.groupEnd();
  }

  console.groupEnd();

  // פונקציה להעתקת הדוח
  window.copyLoginComparisonReport = function() {
    const json = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      console.log('✅ Report copied to clipboard!');
      console.log('📋 Paste this in a text file and compare with legacy report');
    }).catch(() => {
      console.log('📋 Report JSON:\n', json);
    });
  };

  console.log('\n💡 Instructions:');
  console.log('  1. Run this script on NEW login page');
  console.log('  2. Copy report: window.copyLoginComparisonReport()');
  console.log('  3. Open LEGACY login page');
  console.log('  4. Run script again');
  console.log('  5. Copy legacy report');
  console.log('  6. Compare both reports side-by-side');
  console.log('\n📊 Full report available at: window.loginComparisonReport');
  
  return report;
})();
