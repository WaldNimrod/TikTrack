/**
 * סקריפט בדיקה סופי לטבלה הרספונסיבית
 * בודק את כל המחלקות והגדרות החדשות
 */

console.log('🔍 בדיקת טבלה רספונסיבית - גרסה סופית');
console.log('=====================================');

// בדיקת טבלה
setTimeout(() => {
    const table = document.querySelector('#cashFlowsTable');
    if (!table) {
        console.log('❌ טבלה לא נמצאה');
        return;
    }

    console.log('✅ טבלה נמצאה:', table);

    // בדיקת כותרות
    const headers = table.querySelectorAll('thead th');
    console.log(`📋 כותרות טבלה (${headers.length}):`);
    headers.forEach((header, index) => {
        const classes = header.className;
        const text = header.textContent.trim();
        console.log(`  ${index + 1}. "${text}" - מחלקות: ${classes}`);
    });

    // בדיקת שורות
    const rows = table.querySelectorAll('tbody tr');
    console.log(`📊 שורות נתונים (${rows.length}):`);
    
    if (rows.length > 0) {
        const firstRow = rows[0];
        const cells = firstRow.querySelectorAll('td');
        console.log(`  📝 תאים בשורה ראשונה (${cells.length}):`);
        cells.forEach((cell, index) => {
            const classes = cell.className;
            const text = cell.textContent.trim().substring(0, 30);
            console.log(`    ${index + 1}. "${text}..." - מחלקות: ${classes}`);
        });
    }

    // בדיקת מחלקות פעולות
    const actionCells = table.querySelectorAll('.actions-cell');
    console.log(`🎯 עמודות פעולות (${actionCells.length}):`);
    actionCells.forEach((cell, index) => {
        const classes = cell.className;
        console.log(`  ${index + 1}. מחלקות: ${classes}`);
        
        // בדיקת כפתורים
        const buttons = cell.querySelectorAll('button');
        console.log(`    כפתורים: ${buttons.length}`);
        buttons.forEach((btn, btnIndex) => {
            const title = btn.getAttribute('title') || btn.textContent.trim();
            console.log(`      ${btnIndex + 1}. ${title}`);
        });
    });

    // בדיקת רוחב מסך
    const screenWidth = window.innerWidth;
    console.log(`📱 רוחב מסך נוכחי: ${screenWidth}px`);
    
    // בדיקת CSS משתנים
    const root = getComputedStyle(document.documentElement);
    const containerXl = root.getPropertyValue('--container-xl');
    const actions3Btn = root.getPropertyValue('--actions-3-btn-width');
    const colActions = root.getPropertyValue('--col-actions-width');
    
    console.log('🎨 משתני CSS:');
    console.log(`  --container-xl: ${containerXl}`);
    console.log(`  --actions-3-btn-width: ${actions3Btn}`);
    console.log(`  --col-actions-width: ${colActions}`);

    // בדיקת Media Queries פעילות
    console.log('📺 Media Queries פעילות:');
    const breakpoints = [
        { name: 'XS', max: 479 },
        { name: 'SM', max: 767 },
        { name: 'MD', max: 991 },
        { name: 'LG', max: 1199 },
        { name: 'XL', min: 1200 }
    ];
    
    breakpoints.forEach(bp => {
        let active = false;
        if (bp.max && screenWidth <= bp.max) active = true;
        if (bp.min && screenWidth >= bp.min) active = true;
        
        console.log(`  ${bp.name}: ${active ? '✅ פעיל' : '❌ לא פעיל'}`);
    });

    console.log('=====================================');
    console.log('🎉 בדיקה הושלמה בהצלחה!');

}, 2000); // המתן 2 שניות לטעינת הנתונים
