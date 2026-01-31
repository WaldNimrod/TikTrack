/**
 * LOGIN TYPOGRAPHY INSPECTOR - Team 30 Frontend
 * ==============================================
 * כלי דיבוג מפורט לבדיקת פונטים, טיפוגרפיה וכפתורים בעמוד הלוגאין
 * 
 * שימוש:
 * 1. פתח את עמוד הלוגאין בדפדפן (חדש או לגסי)
 * 2. פתח קונסולה (F12 > Console)
 * 3. העתק והדבק את הקוד הזה
 * 4. הסקריפט יציג דוח מפורט על כל הפונטים, ריווחים וכפתורים
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
    return remValue * 16; // Convert to px (assuming 16px base)
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
      element: element,
      // Typography
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: parseInt(styles.fontWeight) || 0,
      lineHeight: styles.lineHeight,
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
      body: {},
      logo: {},
      title: {},
      subtitle: {},
      formLabels: {},
      formInputs: {},
      buttons: {},
      links: {},
      issues: []
    };

    // Body
    report.body = inspectElement(document.body, 'body');

    // Logo
    const logo = document.querySelector('.auth-logo img, .login-logo img, .login-header img');
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
    const labels = document.querySelectorAll('.form-label, label');
    if (labels.length > 0) {
      const firstLabel = labels[0];
      report.formLabels = {
        ...inspectElement(firstLabel, 'form-label'),
        count: labels.length,
        all: Array.from(labels).map((label, idx) => inspectElement(label, `label-${idx}`))
      };
    }

    // Form Inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
    if (inputs.length > 0) {
      const firstInput = inputs[0];
      report.formInputs = {
        ...inspectElement(firstInput, 'form-input'),
        count: inputs.length,
        all: Array.from(inputs).map((input, idx) => inspectElement(input, `input-${idx}`))
      };
    }

    // Buttons
    const buttons = document.querySelectorAll('button, .btn, .btn-primary, [type="submit"]');
    if (buttons.length > 0) {
      const firstButton = buttons[0];
      report.buttons = {
        ...inspectElement(firstButton, 'button'),
        count: buttons.length,
        all: Array.from(buttons).map((btn, idx) => inspectElement(btn, `button-${idx}`))
      };
    }

    // Links
    const links = document.querySelectorAll('a');
    if (links.length > 0) {
      const firstLink = links[0];
      report.links = {
        ...inspectElement(firstLink, 'link'),
        count: links.length,
        all: Array.from(links).map((link, idx) => inspectElement(link, `link-${idx}`))
      };
    }

    return report;
  }

  // ===== הרצת הבדיקה והצגת התוצאות =====
  const report = inspectLoginPage();

  // שמירה ב-global scope לנוחות
  window.loginTypographyReport = report;

  // הצגת דוח מפורט בקונסולה
  console.group('📝 LOGIN TYPOGRAPHY INSPECTOR');
  console.log('Timestamp:', report.timestamp);
  console.log('Page:', report.page);
  
  // Body
  if (report.body) {
    console.group('\n📄 Body Styles:');
    console.log('Font Family:', report.body.fontFamily);
    console.log('Font Size:', report.body.fontSize);
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
    console.log('Font Family:', report.title.fontFamily);
    console.log('Font Size:', report.title.fontSize);
    console.log('Font Weight:', report.title.fontWeight);
    console.log('Line Height:', report.title.lineHeight);
    console.log('Color:', report.title.color);
    console.log('Margin:', report.title.margin);
    console.groupEnd();
  }

  // Subtitle
  if (report.subtitle && report.subtitle.element) {
    console.group('\n📌 Subtitle:');
    console.log('Font Family:', report.subtitle.fontFamily);
    console.log('Font Size:', report.subtitle.fontSize);
    console.log('Font Weight:', report.subtitle.fontWeight);
    console.log('Line Height:', report.subtitle.lineHeight);
    console.log('Color:', report.subtitle.color);
    console.log('Margin:', report.subtitle.margin);
    console.groupEnd();
  }

  // Form Labels
  if (report.formLabels && report.formLabels.element) {
    console.group('\n🏷️ Form Labels:');
    console.log('Count:', report.formLabels.count);
    console.log('Font Family:', report.formLabels.fontFamily);
    console.log('Font Size:', report.formLabels.fontSize);
    console.log('Font Weight:', report.formLabels.fontWeight);
    console.log('Line Height:', report.formLabels.lineHeight);
    console.log('Color:', report.formLabels.color);
    console.log('Margin:', report.formLabels.margin);
    console.groupEnd();
  }

  // Form Inputs
  if (report.formInputs && report.formInputs.element) {
    console.group('\n📝 Form Inputs:');
    console.log('Count:', report.formInputs.count);
    console.log('Font Family:', report.formInputs.fontFamily);
    console.log('Font Size:', report.formInputs.fontSize);
    console.log('Font Weight:', report.formInputs.fontWeight);
    console.log('Line Height:', report.formInputs.lineHeight);
    console.log('Padding:', report.formInputs.padding);
    console.log('Border:', report.formInputs.border);
    console.log('Border Radius:', report.formInputs.borderRadius);
    console.log('Background Color:', report.formInputs.backgroundColor);
    console.log('Color:', report.formInputs.color);
    console.groupEnd();
  }

  // Buttons
  if (report.buttons && report.buttons.element) {
    console.group('\n🔘 Buttons:');
    console.log('Count:', report.buttons.count);
    console.log('Font Family:', report.buttons.fontFamily);
    console.log('Font Size:', report.buttons.fontSize);
    console.log('Font Weight:', report.buttons.fontWeight);
    console.log('Line Height:', report.buttons.lineHeight);
    console.log('Padding:', report.buttons.padding);
    console.log('Border:', report.buttons.border);
    console.log('Border Radius:', report.buttons.borderRadius);
    console.log('Background Color:', report.buttons.backgroundColor);
    console.log('Color:', report.buttons.color);
    console.log('Box Shadow:', report.buttons.boxShadow);
    console.groupEnd();
  }

  // Links
  if (report.links && report.links.element) {
    console.group('\n🔗 Links:');
    console.log('Count:', report.links.count);
    console.log('Font Family:', report.links.fontFamily);
    console.log('Font Size:', report.links.fontSize);
    console.log('Font Weight:', report.links.fontWeight);
    console.log('Color:', report.links.color);
    console.log('Text Decoration:', getComputedStyleValue(report.links.element, 'text-decoration'));
    console.groupEnd();
  }

  console.groupEnd();

  // פונקציה להעתקת הדוח
  window.copyLoginTypographyReport = function() {
    const json = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      console.log('✅ Report copied to clipboard!');
    }).catch(() => {
      console.log('📋 Report JSON:\n', json);
    });
  };

  console.log('\n💡 Tips:');
  console.log('  • Full report available at: window.loginTypographyReport');
  console.log('  • Copy report: window.copyLoginTypographyReport()');
  console.log('  • Run this on BOTH new and legacy pages to compare');
  
  return report;
})();
