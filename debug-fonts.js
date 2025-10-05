// סקריפט בדיקת פונטים מפורט - TikTrack
// להריץ בקונסול הדפדפן בעמוד cache-test.html

console.clear();
console.log('🔍 בדיקת פונטים מפורטת - TikTrack');
console.log('='.repeat(60));

// 1. בדיקת פונט body
console.log('\n📋 1. בדיקת פונט body:');
const body = document.body;
const bodyStyles = window.getComputedStyle(body);
console.log('Body font-family:', bodyStyles.fontFamily);
console.log('Body font-weight:', bodyStyles.fontWeight);
console.log('Body font-size:', bodyStyles.fontSize);
console.log('Body line-height:', bodyStyles.lineHeight);

// 2. בדיקת פונט paragraphs
console.log('\n📋 2. בדיקת פונט paragraphs:');
const paragraphs = document.querySelectorAll('p');
if (paragraphs.length > 0) {
    const pStyles = window.getComputedStyle(paragraphs[0]);
    console.log('Paragraph font-family:', pStyles.fontFamily);
    console.log('Paragraph font-weight:', pStyles.fontWeight);
    console.log('Paragraph font-size:', pStyles.fontSize);
    console.log('Paragraph line-height:', pStyles.lineHeight);
} else {
    console.log('❌ לא נמצאו paragraphs בעמוד');
}

// 3. בדיקת פונט תפריט
console.log('\n📋 3. בדיקת פונט תפריט:');
const navElements = document.querySelectorAll('.navbar, .nav, .nav-link, .navbar-nav');
if (navElements.length > 0) {
    const navStyles = window.getComputedStyle(navElements[0]);
    console.log('Navigation font-family:', navStyles.fontFamily);
    console.log('Navigation font-weight:', navStyles.fontWeight);
    console.log('Navigation font-size:', navStyles.fontSize);
    console.log('Navigation line-height:', navStyles.lineHeight);
} else {
    console.log('❌ לא נמצאו אלמנטי תפריט בעמוד');
}

// 4. בדיקת פונט כפתורים
console.log('\n📋 4. בדיקת פונט כפתורים:');
const buttons = document.querySelectorAll('.btn');
if (buttons.length > 0) {
    const btnStyles = window.getComputedStyle(buttons[0]);
    console.log('Button font-family:', btnStyles.fontFamily);
    console.log('Button font-weight:', btnStyles.fontWeight);
    console.log('Button font-size:', btnStyles.fontSize);
    console.log('Button line-height:', btnStyles.lineHeight);
} else {
    console.log('❌ לא נמצאו כפתורים בעמוד');
}

// 5. בדיקת פונט כותרות
console.log('\n📋 5. בדיקת פונט כותרות:');
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
if (headings.length > 0) {
    const headingStyles = window.getComputedStyle(headings[0]);
    console.log('Heading font-family:', headingStyles.fontFamily);
    console.log('Heading font-weight:', headingStyles.fontWeight);
    console.log('Heading font-size:', headingStyles.fontSize);
    console.log('Heading line-height:', headingStyles.lineHeight);
} else {
    console.log('❌ לא נמצאו כותרות בעמוד');
}

// 6. בדיקת CSS Variables
console.log('\n📋 6. בדיקת CSS Variables:');
const root = document.documentElement;
const computedStyle = window.getComputedStyle(root);
console.log('--font-family-primary:', computedStyle.getPropertyValue('--font-family-primary'));
console.log('--font-weight-medium:', computedStyle.getPropertyValue('--font-weight-medium'));
console.log('--font-weight-semibold:', computedStyle.getPropertyValue('--font-weight-semibold'));
console.log('--font-weight-bold:', computedStyle.getPropertyValue('--font-weight-bold'));

// 7. בדיקת פונט Noto Sans Hebrew
console.log('\n📋 7. בדיקת פונט Noto Sans Hebrew:');
const testElement = document.createElement('div');
testElement.style.fontFamily = 'Noto Sans Hebrew';
testElement.style.fontSize = '16px';
testElement.textContent = 'בדיקת פונט עברי';
document.body.appendChild(testElement);
const testStyles = window.getComputedStyle(testElement);
console.log('Noto Sans Hebrew font-family:', testStyles.fontFamily);
console.log('Noto Sans Hebrew font-weight:', testStyles.fontWeight);
console.log('Noto Sans Hebrew font-size:', testStyles.fontSize);
document.body.removeChild(testElement);

// 8. בדיקת CSS Rules שמשפיעות על body
console.log('\n📋 8. בדיקת CSS Rules שמשפיעות על body:');
const bodyRules = [];
for (let i = 0; i < document.styleSheets.length; i++) {
    try {
        const sheet = document.styleSheets[i];
        if (sheet.href && sheet.href.includes('styles-new')) {
            for (let j = 0; j < sheet.cssRules.length; j++) {
                const rule = sheet.cssRules[j];
                if (rule.selectorText && rule.selectorText.includes('body')) {
                    bodyRules.push({
                        selector: rule.selectorText,
                        fontFamily: rule.style.fontFamily,
                        fontWeight: rule.style.fontWeight,
                        fontSize: rule.style.fontSize,
                        source: sheet.href
                    });
                }
            }
        }
    } catch (e) {
        // Skip cross-origin stylesheets
    }
}
console.log('Body CSS Rules:', bodyRules);

// 9. בדיקת CSS Rules שמשפיעות על p
console.log('\n📋 9. בדיקת CSS Rules שמשפיעות על p:');
const pRules = [];
for (let i = 0; i < document.styleSheets.length; i++) {
    try {
        const sheet = document.styleSheets[i];
        if (sheet.href && sheet.href.includes('styles-new')) {
            for (let j = 0; j < sheet.cssRules.length; j++) {
                const rule = sheet.cssRules[j];
                if (rule.selectorText && rule.selectorText.includes('p')) {
                    pRules.push({
                        selector: rule.selectorText,
                        fontFamily: rule.style.fontFamily,
                        fontWeight: rule.style.fontWeight,
                        fontSize: rule.style.fontSize,
                        source: sheet.href
                    });
                }
            }
        }
    } catch (e) {
        // Skip cross-origin stylesheets
    }
}
console.log('Paragraph CSS Rules:', pRules);

// 10. בדיקת CSS Rules שמשפיעות על .navbar
console.log('\n📋 10. בדיקת CSS Rules שמשפיעות על .navbar:');
const navRules = [];
for (let i = 0; i < document.styleSheets.length; i++) {
    try {
        const sheet = document.styleSheets[i];
        if (sheet.href && sheet.href.includes('styles-new')) {
            for (let j = 0; j < sheet.cssRules.length; j++) {
                const rule = sheet.cssRules[j];
                if (rule.selectorText && rule.selectorText.includes('.navbar')) {
                    navRules.push({
                        selector: rule.selectorText,
                        fontFamily: rule.style.fontFamily,
                        fontWeight: rule.style.fontWeight,
                        fontSize: rule.style.fontSize,
                        source: sheet.href
                    });
                }
            }
        }
    } catch (e) {
        // Skip cross-origin stylesheets
    }
}
console.log('Navigation CSS Rules:', navRules);

// 11. בדיקת סדר טעינת CSS
console.log('\n📋 11. בדיקת סדר טעינת CSS:');
const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
console.log('סדר טעינת CSS:');
cssLinks.forEach((link, index) => {
    if (link.href.includes('styles-new')) {
        console.log(`${index + 1}. ${link.href.split('/').pop()}`);
    }
});

// 12. בדיקת פונט בפועל
console.log('\n📋 12. בדיקת פונט בפועל:');
const testText = document.createElement('div');
testText.style.cssText = `
    font-family: 'Noto Sans Hebrew', Arial, sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: #333;
    padding: 10px;
    border: 1px solid #ccc;
    margin: 10px 0;
`;
testText.textContent = 'טקסט בדיקה - האם הפונט עבה?';
document.body.appendChild(testText);
const testTextStyles = window.getComputedStyle(testText);
console.log('Test Text font-family:', testTextStyles.fontFamily);
console.log('Test Text font-weight:', testTextStyles.fontWeight);
console.log('Test Text font-size:', testTextStyles.fontSize);

console.log('\n✅ בדיקת פונטים הושלמה!');
console.log('='.repeat(60));
