// קוד בדיקה ליישור התפריט
console.log('🔍 בדיקת יישור התפריט - מתחיל');

// בדיקת אלמנטים
const headerContainer = document.querySelector('.header-container');
const headerNav = document.querySelector('.header-nav');
const mainNav = document.querySelector('.main-nav');
const logoSection = document.querySelector('.logo-section');

console.log('📋 אלמנטים שנמצאו:');
console.log('header-container:', headerContainer);
console.log('header-nav:', headerNav);
console.log('main-nav:', mainNav);
console.log('logo-section:', logoSection);

if (headerContainer) {
  const containerStyles = window.getComputedStyle(headerContainer);
  console.log('🎨 header-container styles:');
  console.log('  display:', containerStyles.display);
  console.log('  justify-content:', containerStyles.justifyContent);
  console.log('  align-items:', containerStyles.alignItems);
  console.log('  flex-direction:', containerStyles.flexDirection);
}

if (headerNav) {
  const navStyles = window.getComputedStyle(headerNav);
  console.log('🎨 header-nav styles:');
  console.log('  display:', navStyles.display);
  console.log('  justify-content:', navStyles.justifyContent);
  console.log('  flex:', navStyles.flex);
  console.log('  width:', navStyles.width);
}

if (mainNav) {
  const mainNavStyles = window.getComputedStyle(mainNav);
  console.log('🎨 main-nav styles:');
  console.log('  display:', mainNavStyles.display);
  console.log('  justify-content:', mainNavStyles.justifyContent);
  console.log('  width:', mainNavStyles.width);
}

if (logoSection) {
  const logoStyles = window.getComputedStyle(logoSection);
  console.log('🎨 logo-section styles:');
  console.log('  display:', logoStyles.display);
  console.log('  justify-content:', logoStyles.justifyContent);
  console.log('  width:', logoStyles.width);
}

// בדיקת מיקום אלמנטים
if (headerContainer) {
  const containerRect = headerContainer.getBoundingClientRect();
  console.log('📍 header-container position:');
  console.log('  left:', containerRect.left);
  console.log('  right:', containerRect.right);
  console.log('  width:', containerRect.width);
}

if (logoSection) {
  const logoRect = logoSection.getBoundingClientRect();
  console.log('📍 logo-section position:');
  console.log('  left:', logoRect.left);
  console.log('  right:', logoRect.right);
  console.log('  width:', logoRect.width);
}

if (headerNav) {
  const navRect = headerNav.getBoundingClientRect();
  console.log('📍 header-nav position:');
  console.log('  left:', navRect.left);
  console.log('  right:', navRect.right);
  console.log('  width:', navRect.width);
}

// בדיקת CSS rules
console.log('🔍 בדיקת CSS rules:');
const allStyles = document.styleSheets;
let foundRules = 0;

for (let i = 0; i < allStyles.length; i++) {
  try {
    const sheet = allStyles[i];
    if (sheet.cssRules) {
      for (let j = 0; j < sheet.cssRules.length; j++) {
        const rule = sheet.cssRules[j];
        if (rule.selectorText && (
          rule.selectorText.includes('header-container') ||
          rule.selectorText.includes('header-nav') ||
          rule.selectorText.includes('main-nav') ||
          rule.selectorText.includes('logo-section')
        )) {
          console.log(`📝 CSS Rule: ${rule.selectorText}`);
          console.log(`   ${rule.style.cssText}`);
          foundRules++;
        }
      }
    }
  } catch (e) {
    // Skip cross-origin stylesheets
  }
}

console.log(`✅ נמצאו ${foundRules} CSS rules רלוונטיים`);
console.log('🔍 בדיקת יישור התפריט - הסתיים');
