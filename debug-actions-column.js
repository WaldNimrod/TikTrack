// הרץ בConsole של הדפדפן (F12)

console.log("🔍 DEBUG: Actions Column Width");
console.log("================================");

// 1. מצא את העמודה
const actionsCell = document.querySelector('.actions-cell');
if (!actionsCell) {
    console.error("❌ לא נמצא .actions-cell בדף!");
} else {
    console.log("✅ נמצא .actions-cell");
    
    // 2. בדוק computed styles
    const computed = window.getComputedStyle(actionsCell);
    console.log("\n📊 Computed Styles:");
    console.log("   width:", computed.width);
    console.log("   min-width:", computed.minWidth);
    console.log("   max-width:", computed.maxWidth);
    console.log("   display:", computed.display);
    
    // 3. בדוק inline styles
    console.log("\n🏷️ Inline Styles:");
    console.log("   style attribute:", actionsCell.getAttribute('style') || "אין");
    
    // 4. בדוק classes
    console.log("\n🎨 Classes:");
    console.log("   classList:", Array.from(actionsCell.classList).join(', '));
    
    // 5. בדוק CSS rules שמשפיעים
    console.log("\n📜 CSS Rules Applied:");
    const sheets = Array.from(document.styleSheets);
    let rulesFound = 0;
    
    sheets.forEach(sheet => {
        try {
            const rules = Array.from(sheet.cssRules || []);
            rules.forEach(rule => {
                if (rule.selectorText && 
                    (rule.selectorText.includes('.actions-cell') || 
                     rule.selectorText.includes('.col-actions'))) {
                    console.log(`   ${rule.selectorText}`);
                    if (rule.style.width) console.log(`      width: ${rule.style.width}`);
                    if (rule.style.minWidth) console.log(`      min-width: ${rule.style.minWidth}`);
                    if (rule.style.maxWidth) console.log(`      max-width: ${rule.style.maxWidth}`);
                    rulesFound++;
                }
            });
        } catch (e) {
            // CORS - skip external stylesheets
        }
    });
    
    console.log(`\n   סה"כ נמצאו: ${rulesFound} rules`);
    
    // 6. בדוק אם _tables.css נטען
    console.log("\n📂 _tables.css Status:");
    const tablesCSS = Array.from(document.querySelectorAll('link[href*="_tables.css"]'));
    if (tablesCSS.length === 0) {
        console.error("   ❌ _tables.css לא נטען!");
    } else {
        tablesCSS.forEach(link => {
            console.log("   ✅ נטען:", link.href);
            console.log("      version:", link.href.match(/\?v=([^&]+)/)?.[1] || "ללא גרסה");
        });
    }
    
    // 7. המלצות
    console.log("\n💡 המלצות:");
    if (computed.width !== "80px") {
        console.warn("   ⚠️ width לא 80px - יש CSS שדורס!");
        console.log("   → חפש CSS עם specificity גבוה יותר");
    }
    if (actionsCell.classList.contains('actions-3-btn')) {
        console.warn("   ⚠️ יש class actions-3-btn שעלול לדרוס");
    }
}
