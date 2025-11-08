// ===== DIAGNOSTIC CODE FOR TRADING ACCOUNTS PAGE COLORS =====
// העתק את כל הקוד הזה לקונסולה ותראה את כל המידע

(async function debugAccountColors() {
    console.log('🔍 ===== DIAGNOSTIC: Trading Accounts Page Colors =====');
    console.log('');
    
    // 1. בדיקת body class
    console.log('1️⃣ BODY CLASS:');
    const body = document.body;
    const bodyClasses = Array.from(body.classList);
    console.log('   Classes:', bodyClasses);
    const pageClass = bodyClasses.find(cls => cls.endsWith('-page'));
    console.log('   Page Class:', pageClass);
    console.log('   Expected: trading-accounts-page');
    console.log('   Match:', pageClass === 'trading-accounts-page');
    console.log('');
    
    // 2. בדיקת מיפוי PAGE_TO_ENTITY_MAPPING
    console.log('2️⃣ PAGE TO ENTITY MAPPING:');
    if (window.PAGE_TO_ENTITY_MAPPING) {
        console.log('   Mapping exists:', true);
        console.log('   trading-accounts-page ->', window.PAGE_TO_ENTITY_MAPPING['trading-accounts-page']);
        console.log('   accounts-page ->', window.PAGE_TO_ENTITY_MAPPING['accounts-page']);
    } else {
        console.log('   ⚠️ PAGE_TO_ENTITY_MAPPING NOT FOUND');
        // נסה למצוא אותו בקובץ color-scheme-system
        const scripts = Array.from(document.scripts);
        const colorSchemeScript = scripts.find(s => s.src && s.src.includes('color-scheme-system'));
        console.log('   color-scheme-system.js loaded:', !!colorSchemeScript);
    }
    console.log('');
    
    // 3. בדיקת ENTITY_COLORS
    console.log('3️⃣ ENTITY_COLORS:');
    if (window.ENTITY_COLORS) {
        console.log('   ENTITY_COLORS exists:', true);
        console.log('   ENTITY_COLORS.account:', window.ENTITY_COLORS.account);
        console.log('   ENTITY_COLORS.trading_account:', window.ENTITY_COLORS.trading_account);
        console.log('   All entity types:', Object.keys(window.ENTITY_COLORS));
    } else {
        console.log('   ⚠️ ENTITY_COLORS NOT FOUND');
    }
    console.log('');
    
    // 4. בדיקת העדפות נוכחיות
    console.log('4️⃣ CURRENT PREFERENCES:');
    if (window.currentPreferences) {
        console.log('   currentPreferences exists:', true);
        console.log('   entityTradingAccountColor:', window.currentPreferences.entityTradingAccountColor);
        console.log('   entityTradingAccountColorDark:', window.currentPreferences.entityTradingAccountColorDark);
        console.log('   entityTradingAccountColorLight:', window.currentPreferences.entityTradingAccountColorLight);
        console.log('   entityColors object:', window.currentPreferences.entityColors);
        if (window.currentPreferences.entityColors) {
            console.log('   entityColors.trading_account:', window.currentPreferences.entityColors.trading_account);
            console.log('   entityColors.account:', window.currentPreferences.entityColors.account);
        }
    } else {
        console.log('   ⚠️ currentPreferences NOT FOUND');
    }
    console.log('');
    
    // 5. בדיקת CSS Variables
    console.log('5️⃣ CSS VARIABLES:');
    const computedStyle = getComputedStyle(document.documentElement);
    const cssVars = {
        '--entity-trading-account-color': computedStyle.getPropertyValue('--entity-trading-account-color').trim(),
        '--entity-account-color': computedStyle.getPropertyValue('--entity-account-color').trim(),
        '--entity-trading-account-bg': computedStyle.getPropertyValue('--entity-trading-account-bg').trim(),
        '--entity-account-bg': computedStyle.getPropertyValue('--entity-account-bg').trim(),
        '--entity-trading-account-text': computedStyle.getPropertyValue('--entity-trading-account-text').trim(),
        '--entity-account-text': computedStyle.getPropertyValue('--entity-account-text').trim(),
        '--current-entity-color': computedStyle.getPropertyValue('--current-entity-color').trim(),
    };
    console.log('   CSS Variables:', cssVars);
    console.log('');
    
    // 6. בדיקת אלמנטים בדף
    console.log('6️⃣ PAGE ELEMENTS:');
    const sectionHeaders = document.querySelectorAll('.section-header');
    console.log('   Section headers found:', sectionHeaders.length);
    sectionHeaders.forEach((header, index) => {
        const classes = Array.from(header.classList);
        const hasEntityClass = classes.some(c => c.startsWith('entity-'));
        console.log(`   Header ${index + 1}:`, {
            text: header.textContent?.trim().substring(0, 50),
            classes: classes,
            hasEntityClass: hasEntityClass,
            entityClasses: classes.filter(c => c.startsWith('entity-')),
            computedBgColor: getComputedStyle(header).backgroundColor,
            computedColor: getComputedStyle(header).color,
        });
    });
    console.log('');
    
    // 7. בדיקת פונקציות זמינות
    console.log('7️⃣ AVAILABLE FUNCTIONS:');
    console.log('   applyEntityColorsToHeaders:', typeof window.applyEntityColorsToHeaders);
    console.log('   getEntityColor:', typeof window.getEntityColor);
    console.log('   loadEntityColorsFromPreferences:', typeof window.loadEntityColorsFromPreferences);
    console.log('   loadColorPreferences:', typeof window.loadColorPreferences);
    console.log('');
    
    // 8. בדיקת entity-details-renderer
    console.log('8️⃣ ENTITY DETAILS RENDERER:');
    if (window.entityDetailsRenderer) {
        console.log('   entityDetailsRenderer exists:', true);
        console.log('   entityColors:', window.entityDetailsRenderer.entityColors);
        console.log('   entityColors.account:', window.entityDetailsRenderer.entityColors?.account);
        console.log('   entityColors.trading_account:', window.entityDetailsRenderer.entityColors?.trading_account);
    } else {
        console.log('   ⚠️ entityDetailsRenderer NOT FOUND');
    }
    console.log('');
    
    // 9. בדיקת loadEntityColorsFromPreferences
    console.log('9️⃣ TESTING ENTITY COLOR LOADING:');
    if (window.loadEntityColorsFromPreferences && window.currentPreferences) {
        console.log('   Testing loadEntityColorsFromPreferences...');
        const beforeColors = { ...window.ENTITY_COLORS };
        if (typeof window.loadEntityColorsFromPreferences === 'function') {
            window.loadEntityColorsFromPreferences(window.currentPreferences);
            const afterColors = { ...window.ENTITY_COLORS };
            console.log('   Before account:', beforeColors.account);
            console.log('   After account:', afterColors.account);
            console.log('   Before trading_account:', beforeColors.trading_account);
            console.log('   After trading_account:', afterColors.trading_account);
        }
    } else {
        console.log('   ⚠️ Cannot test - functions not available');
    }
    console.log('');
    
    // 10. בדיקת מה יקרה אם נקרא ל-applyEntityColorsToHeaders
    console.log('🔟 TESTING applyEntityColorsToHeaders:');
    const testEntityTypes = ['account', 'trading_account'];
    testEntityTypes.forEach(entityType => {
        console.log(`   Testing with entityType: ${entityType}`);
        const color = window.getEntityColor ? window.getEntityColor(entityType) : 'N/A';
        console.log(`     getEntityColor('${entityType}'):`, color);
        const hasColor = window.ENTITY_COLORS && window.ENTITY_COLORS[entityType];
        console.log(`     ENTITY_COLORS['${entityType}']:`, hasColor || 'NOT FOUND');
    });
    console.log('');
    
    // 11. בדיקת API
    console.log('1️⃣1️⃣ API CHECK:');
    try {
        const response = await fetch('/api/preferences/user/preference?name=entityTradingAccountColor');
        const data = await response.json();
        console.log('   API entityTradingAccountColor:', data);
    } catch (error) {
        console.log('   ⚠️ API error:', error.message);
    }
    console.log('');
    
    // 12. סיכום והמלצות
    console.log('📋 SUMMARY & RECOMMENDATIONS:');
    const issues = [];
    const recommendations = [];
    
    if (pageClass !== 'trading-accounts-page') {
        issues.push('❌ Page class is not trading-accounts-page');
    }
    
    if (!window.ENTITY_COLORS || !window.ENTITY_COLORS.trading_account) {
        issues.push('❌ ENTITY_COLORS.trading_account is missing');
        recommendations.push('Run: window.loadEntityColorsFromPreferences(window.currentPreferences)');
    }
    
    if (!window.currentPreferences || !window.currentPreferences.entityTradingAccountColor) {
        issues.push('❌ entityTradingAccountColor not in currentPreferences');
        recommendations.push('Run: await window.loadUserPreferences({ force: true })');
    }
    
    if (sectionHeaders.length === 0) {
        issues.push('❌ No section headers found on page');
    } else {
        const headersWithColors = Array.from(sectionHeaders).filter(h => {
            const bg = getComputedStyle(h).backgroundColor;
            return bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)';
        });
        if (headersWithColors.length === 0) {
            issues.push('❌ Section headers have no background color (white/transparent)');
            recommendations.push('Run: window.applyEntityColorsToHeaders("trading_account")');
        }
    }
    
    if (issues.length === 0) {
        console.log('   ✅ No obvious issues found');
    } else {
        console.log('   Issues found:');
        issues.forEach(issue => console.log(`     ${issue}`));
    }
    
    if (recommendations.length > 0) {
        console.log('   Recommendations:');
        recommendations.forEach(rec => console.log(`     ${rec}`));
    }
    
    console.log('');
    console.log('✅ Diagnostic complete!');
    console.log('=====================================');
})();

