// בדיקה ספציפית למה status-badge גבוה יותר
console.log('🔍 בדיקת גובה status-badge');
console.log('==========================');

function debugStatusBadgeHeight() {
    const statusBadges = document.querySelectorAll('.status-badge');
    const badgeTypes = document.querySelectorAll('.badge-type');
    
    if (statusBadges.length === 0 || badgeTypes.length === 0) {
        console.log('❌ לא נמצאו badges לבדיקה');
        return;
    }
    
    const statusBadge = statusBadges[0];
    const badgeType = badgeTypes[0];
    
    console.log('\n📊 השוואת גבהים:');
    console.log(`Status Badge Height: ${statusBadge.getBoundingClientRect().height}px`);
    console.log(`Badge Type Height: ${badgeType.getBoundingClientRect().height}px`);
    
    console.log('\n📋 בדיקת תוכן:');
    console.log(`Status Badge Text: "${statusBadge.textContent}"`);
    console.log(`Badge Type Text: "${badgeType.textContent}"`);
    console.log(`Status Badge Text Length: ${statusBadge.textContent.length}`);
    console.log(`Badge Type Text Length: ${badgeType.textContent.length}`);
    
    console.log('\n🔍 בדיקת CSS:');
    const statusStyle = window.getComputedStyle(statusBadge);
    const typeStyle = window.getComputedStyle(badgeType);
    
    console.log('Status Badge CSS:');
    console.log(`  line-height: ${statusStyle.lineHeight}`);
    console.log(`  font-size: ${statusStyle.fontSize}`);
    console.log(`  padding: ${statusStyle.padding}`);
    console.log(`  border: ${statusStyle.border}`);
    console.log(`  box-sizing: ${statusStyle.boxSizing}`);
    
    console.log('\nBadge Type CSS:');
    console.log(`  line-height: ${typeStyle.lineHeight}`);
    console.log(`  font-size: ${typeStyle.fontSize}`);
    console.log(`  padding: ${typeStyle.padding}`);
    console.log(`  border: ${typeStyle.border}`);
    console.log(`  box-sizing: ${typeStyle.boxSizing}`);
    
    console.log('\n🎯 השוואת CSS Properties:');
    const properties = ['lineHeight', 'fontSize', 'padding', 'border', 'boxSizing', 'height', 'minHeight'];
    
    properties.forEach(prop => {
        const statusValue = statusStyle[prop];
        const typeValue = typeStyle[prop];
        
        if (statusValue !== typeValue) {
            console.log(`⚠️  ${prop}:`);
            console.log(`    Status: ${statusValue}`);
            console.log(`    Type: ${typeValue}`);
        } else {
            console.log(`✅ ${prop}: ${statusValue}`);
        }
    });
    
    console.log('\n🔍 בדיקת HTML Attributes:');
    console.log('Status Badge Attributes:');
    for (let attr of statusBadge.attributes) {
        console.log(`  ${attr.name}: ${attr.value}`);
    }
    
    console.log('\nBadge Type Attributes:');
    for (let attr of badgeType.attributes) {
        console.log(`  ${attr.name}: ${attr.value}`);
    }
    
    console.log('\n🔍 בדיקת CSS Classes:');
    console.log(`Status Badge Classes: ${statusBadge.className}`);
    console.log(`Badge Type Classes: ${badgeType.className}`);
    
    console.log('\n🔍 בדיקת Parent Elements:');
    console.log(`Status Badge Parent: ${statusBadge.parentElement.tagName}`);
    console.log(`Badge Type Parent: ${badgeType.parentElement.tagName}`);
    
    // בדיקת CSS rules ספציפיים
    console.log('\n📋 בדיקת CSS Rules:');
    const statusRules = [];
    const typeRules = [];
    
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i];
            if (sheet.cssRules) {
                for (let j = 0; j < sheet.cssRules.length; j++) {
                    const rule = sheet.cssRules[j];
                    if (rule.selectorText) {
                        if (rule.selectorText.includes('status-badge')) {
                            statusRules.push(rule.selectorText + ': ' + rule.style.cssText);
                        }
                        if (rule.selectorText.includes('badge-type')) {
                            typeRules.push(rule.selectorText + ': ' + rule.style.cssText);
                        }
                    }
                }
            }
        } catch (e) {
            // Skip cross-origin
        }
    }
    
    console.log('Status Badge Rules:');
    statusRules.forEach(rule => console.log(`  ${rule}`));
    
    console.log('\nBadge Type Rules:');
    typeRules.forEach(rule => console.log(`  ${rule}`));
}

// הרצה
debugStatusBadgeHeight();

