/**
 * Button Color Checker - בודק צבעי כפתורים
 * 
 * סקריפט לבדיקת צבעי כפתורים ווריאנטים
 */

function checkButtonColors() {
    console.log('🔍 בודק צבעי כפתורים...');
    
    const buttons = document.querySelectorAll('[data-button-type]');
    const results = {};
    
    buttons.forEach((button, index) => {
        const buttonType = button.getAttribute('data-button-type');
        const variant = button.getAttribute('data-variant') || 'normal';
        const size = button.getAttribute('data-size') || 'normal';
        const style = button.getAttribute('data-style') || 'default';
        const entityType = button.getAttribute('data-entity-type');
        
        const computedStyle = getComputedStyle(button);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;
        const borderColor = computedStyle.borderColor;
        
        const key = `${buttonType}_${variant}_${size}_${style}${entityType ? '_' + entityType : ''}`;
        
        results[key] = {
            buttonType,
            variant,
            size,
            style,
            entityType,
            backgroundColor,
            color,
            borderColor,
            cssClasses: button.className,
            content: button.textContent.trim()
        };
    });
    
    console.log('📊 תוצאות בדיקת צבעים:', results);
    
    // בדיקת כפילויות
    const colorGroups = {};
    Object.values(results).forEach(button => {
        const colorKey = `${button.backgroundColor}_${button.color}_${button.borderColor}`;
        if (!colorGroups[colorKey]) {
            colorGroups[colorKey] = [];
        }
        colorGroups[colorKey].push(button);
    });
    
    console.log('🔍 קבוצות צבעים:', colorGroups);
    
    // בדיקת בעיות
    const issues = [];
    Object.values(results).forEach(button => {
        // בדיקה אם הרקע שקוף במקום לבן
        if (button.backgroundColor === 'rgba(0, 0, 0, 0)' && button.style !== 'negative') {
            issues.push({
                type: 'transparent_background',
                button: button,
                message: 'רקע שקוף במקום לבן'
            });
        }
        
        // בדיקה אם הצבע לא תואם למשתנה CSS
        const expectedColor = getExpectedColor(button.buttonType);
        if (expectedColor && button.color !== expectedColor) {
            issues.push({
                type: 'wrong_color',
                button: button,
                message: `צבע לא תואם: צפוי ${expectedColor}, בפועל ${button.color}`
            });
        }
    });
    
    if (issues.length > 0) {
        console.warn('⚠️ בעיות שנמצאו:', issues);
        
        // הצגת סיכום הבעיות
        const issueTypes = {};
        issues.forEach(issue => {
            if (!issueTypes[issue.type]) {
                issueTypes[issue.type] = 0;
            }
            issueTypes[issue.type]++;
        });
        
        console.log('📋 סיכום בעיות:');
        Object.entries(issueTypes).forEach(([type, count]) => {
            console.log(`  - ${type}: ${count} כפתורים`);
        });
        
        // הצגת דוגמאות לבעיות
        console.log('🔍 דוגמאות לבעיות:');
        issues.slice(0, 5).forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue.button.buttonType} (${issue.button.variant}): ${issue.message}`);
        });
        
        if (issues.length > 5) {
            console.log(`  ... ועוד ${issues.length - 5} בעיות`);
        }
    } else {
        console.log('✅ כל הכפתורים נראים תקינים!');
    }
    
    return { results, colorGroups, issues };
}

function getExpectedColor(buttonType) {
    const colorMap = {
        'EDIT': 'rgb(38, 186, 172)',      // --color-action-edit
        'DELETE': 'rgb(192, 57, 43)',     // --color-action-delete
        'ADD': 'rgb(38, 186, 172)',       // --color-action-add
        'SAVE': 'rgb(252, 90, 6)',        // --color-action-save
        'CANCEL': 'rgb(243, 156, 18)',    // --color-action-cancel
        'LINK': 'rgb(41, 128, 185)',      // --color-action-link
        'CLOSE': 'rgb(243, 156, 18)',     // --color-action-close
        'REFRESH': 'rgb(252, 90, 6)',     // --color-action-refresh
        'EXPORT': 'rgb(38, 186, 172)',    // --color-action-export
        'IMPORT': 'rgb(38, 186, 172)',    // --color-action-import
        'SEARCH': 'rgb(41, 128, 185)',    // --color-action-search
        'FILTER': 'rgb(252, 90, 6)',      // --color-action-filter
        'SORT': 'rgb(252, 90, 6)',        // --color-action-sort
        'TOGGLE': 'rgb(243, 156, 18)',    // --color-action-toggle
        'COPY': 'rgb(252, 90, 6)',        // --color-action-copy
        'REACTIVATE': 'rgb(38, 186, 172)', // --color-action-reactivate
        'VIEW': 'rgb(41, 128, 185)',      // --color-action-view
        'DUPLICATE': 'rgb(38, 186, 172)', // --color-action-duplicate
        'ARCHIVE': 'rgb(243, 156, 18)',   // --color-action-archive
        'RESTORE': 'rgb(38, 186, 172)',   // --color-action-restore
        'APPROVE': 'rgb(38, 186, 172)',   // --color-action-approve
        'REJECT': 'rgb(192, 57, 43)',     // --color-action-reject
        'PAUSE': 'rgb(243, 156, 18)',     // --color-action-pause
        'PLAY': 'rgb(38, 186, 172)',      // --color-action-play
        'STOP': 'rgb(192, 57, 43)',       // --color-action-stop
        'READ': 'rgb(41, 128, 185)',      // --color-action-read
        'CHECK': 'rgb(252, 90, 6)'        // --color-action-check
    };
    
    return colorMap[buttonType];
}

function fixButtonColors() {
    console.log('🔧 מתקן צבעי כפתורים...');
    
    const buttons = document.querySelectorAll('[data-button-type]');
    let fixedCount = 0;
    
    buttons.forEach(button => {
        const buttonType = button.getAttribute('data-button-type');
        const style = button.getAttribute('data-style') || 'default';
        const entityType = button.getAttribute('data-entity-type');
        
        // בדיקה אם הכפתור צריך תיקון
        const computedStyle = getComputedStyle(button);
        const backgroundColor = computedStyle.backgroundColor;
        
        // תיקון רקע שקוף
        if (backgroundColor === 'rgba(0, 0, 0, 0)' && style !== 'negative') {
            button.style.backgroundColor = 'white';
            fixedCount++;
        }
        
        // תיקון צבעים לפי data-button-type
        const expectedColor = getExpectedColor(buttonType);
        if (expectedColor && !entityType) {
            button.style.color = expectedColor;
            button.style.borderColor = expectedColor;
            fixedCount++;
        }
    });
    
    console.log(`✅ תוקנו ${fixedCount} כפתורים`);
    
    // בדיקה חוזרת
    setTimeout(() => {
        checkButtonColors();
    }, 100);
}

// הוספה לגלובל
window.checkButtonColors = checkButtonColors;
window.fixButtonColors = fixButtonColors;
