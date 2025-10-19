// קוד בדיקה של CSS rules
console.log('🔍 בדיקת CSS Rules - TikTrack');

// פונקציה לבדיקת CSS rules
function debugCSSRules() {
    console.log('\n1️⃣ בדיקת CSS Rules:');
    
    // בדיקת עמודת פעולות
    const actionsCell = document.querySelector('.col-actions');
    if (actionsCell) {
        console.log('✅ עמודת פעולות נמצאה');
        
        // בדיקת computed styles
        const computedStyle = getComputedStyle(actionsCell);
        console.log('\n📋 Computed Styles:');
        console.log('  - width:', computedStyle.width);
        console.log('  - min-width:', computedStyle.minWidth);
        console.log('  - max-width:', computedStyle.maxWidth);
        console.log('  - padding:', computedStyle.padding);
        console.log('  - margin:', computedStyle.margin);
        console.log('  - overflow:', computedStyle.overflow);
        console.log('  - white-space:', computedStyle.whiteSpace);
        console.log('  - display:', computedStyle.display);
        console.log('  - text-align:', computedStyle.textAlign);
        console.log('  - vertical-align:', computedStyle.verticalAlign);
        
        // בדיקת כפתורים
        const buttons = actionsCell.querySelectorAll('.btn');
        if (buttons.length > 0) {
            console.log('\n📋 כפתורים:');
            buttons.forEach((btn, index) => {
                const btnStyle = getComputedStyle(btn);
                console.log(`  ${index + 1}. ${btn.textContent.trim()}`);
                console.log(`     width: ${btnStyle.width}`);
                console.log(`     height: ${btnStyle.height}`);
                console.log(`     margin: ${btnStyle.margin}`);
                console.log(`     padding: ${btnStyle.padding}`);
                console.log(`     display: ${btnStyle.display}`);
                console.log(`     float: ${btnStyle.float}`);
            });
        }
    }
    
    // בדיקת טבלה
    const table = document.getElementById('cashFlowsTable');
    if (table) {
        console.log('\n2️⃣ בדיקת טבלה:');
        const tableStyle = getComputedStyle(table);
        console.log('  - width:', tableStyle.width);
        console.log('  - min-width:', tableStyle.minWidth);
        console.log('  - max-width:', tableStyle.maxWidth);
        console.log('  - table-layout:', tableStyle.tableLayout);
        console.log('  - overflow:', tableStyle.overflow);
        console.log('  - overflow-x:', tableStyle.overflowX);
        console.log('  - direction:', tableStyle.direction);
        
        // בדיקת עמודות
        const headers = table.querySelectorAll('th');
        console.log('\n3️⃣ בדיקת עמודות:');
        headers.forEach((header, index) => {
            const headerStyle = getComputedStyle(header);
            console.log(`  ${index + 1}. ${header.textContent.trim()}`);
            console.log(`     width: ${headerStyle.width}`);
            console.log('     classes:', header.className);
        });
    }
    
    // בדיקת קונטיינר
    const container = table?.closest('.table-container') || table?.closest('.content-wrapper') || table?.parentElement;
    if (container) {
        console.log('\n4️⃣ בדיקת קונטיינר:');
        const containerStyle = getComputedStyle(container);
        console.log('  - width:', containerStyle.width);
        console.log('  - max-width:', containerStyle.maxWidth);
        console.log('  - overflow:', containerStyle.overflow);
        console.log('  - classes:', container.className);
    }
    
    // בדיקת viewport
    console.log('\n5️⃣ בדיקת viewport:');
    console.log('  - window.innerWidth:', window.innerWidth + 'px');
    console.log('  - window.innerHeight:', window.innerHeight + 'px');
    console.log('  - screen.width:', screen.width + 'px');
    console.log('  - screen.height:', screen.height + 'px');
    
    // בדיקת media queries
    console.log('\n6️⃣ בדיקת media queries:');
    const mediaQueries = [
        '(max-width: 479px)',
        '(max-width: 767px)',
        '(max-width: 991px)',
        '(max-width: 1199px)',
        '(min-width: 1200px)'
    ];
    
    mediaQueries.forEach(mq => {
        const matches = window.matchMedia(mq).matches;
        console.log(`  - ${mq}: ${matches ? '✅ פעיל' : '❌ לא פעיל'}`);
    });
}

// הרצה אוטומטית
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugCSSRules);
} else {
    debugCSSRules();
}

// הוספה ל-global scope
window.debugCSSRules = debugCSSRules;

console.log('✅ קוד בדיקת CSS Rules נטען - הרץ debugCSSRules() לבדיקה ידנית');
