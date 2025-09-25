// בדיקת order בפועל
console.log('🔍 בדיקת order בפועל - מתחיל');

const headerContainer = document.querySelector('.header-container');
const logoSection = document.querySelector('.logo-section');
const headerNav = document.querySelector('.header-nav');

if (headerContainer) {
  const containerStyles = window.getComputedStyle(headerContainer);
  console.log('📋 header-container:');
  console.log('  display:', containerStyles.display);
  console.log('  flex-direction:', containerStyles.flexDirection);
  console.log('  justify-content:', containerStyles.justifyContent);
}

if (logoSection) {
  const logoStyles = window.getComputedStyle(logoSection);
  console.log('📋 logo-section:');
  console.log('  order:', logoStyles.order);
  console.log('  margin-right:', logoStyles.marginRight);
  console.log('  position:', logoSection.getBoundingClientRect());
}

if (headerNav) {
  const navStyles = window.getComputedStyle(headerNav);
  console.log('📋 header-nav:');
  console.log('  order:', navStyles.order);
  console.log('  margin-left:', navStyles.marginLeft);
  console.log('  position:', headerNav.getBoundingClientRect());
}

// בדיקת מיקום יחסי
if (logoSection && headerNav) {
  const logoRect = logoSection.getBoundingClientRect();
  const navRect = headerNav.getBoundingClientRect();
  
  console.log('📍 מיקום יחסי:');
  console.log('  logo left:', logoRect.left);
  console.log('  nav left:', navRect.left);
  console.log('  logo right:', logoRect.right);
  console.log('  nav right:', navRect.right);
  
  if (logoRect.left < navRect.left) {
    console.log('✅ לוגו משמאל, תפריט מימין - נכון!');
  } else {
    console.log('❌ לוגו מימין, תפריט משמאל - לא נכון!');
  }
}

// בדיקת CSS rules עם order
console.log('🔍 בדיקת CSS rules עם order:');
const allStyles = document.styleSheets;
let foundOrderRules = 0;

for (let i = 0; i < allStyles.length; i++) {
  try {
    const sheet = allStyles[i];
    if (sheet.cssRules) {
      for (let j = 0; j < sheet.cssRules.length; j++) {
        const rule = sheet.cssRules[j];
        if (rule.selectorText && rule.style.cssText && 
            (rule.style.cssText.includes('order') || 
             rule.selectorText.includes('logo-section') || 
             rule.selectorText.includes('header-nav'))) {
          console.log(`📝 CSS Rule: ${rule.selectorText}`);
          console.log(`   ${rule.style.cssText}`);
          foundOrderRules++;
        }
      }
    }
  } catch (e) {
    // Skip cross-origin stylesheets
  }
}

console.log(`✅ נמצאו ${foundOrderRules} CSS rules עם order`);
console.log('🔍 בדיקת order בפועל - הסתיים');
