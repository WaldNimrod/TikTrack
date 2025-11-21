/**
 * Button Color Checker - בודק צבעי כפתורים
 * 
 * סקריפט לבדיקת צבעי כפתורים ווריאנטים
 */

const DESIGNS_DIAGNOSTICS_STORAGE_KEY = 'designs:diagnostics';
const DESIGNS_PAGE_STATE_KEY = 'designs';

let designsDiagnosticsState = {};

function getDiagnosticsContainer() {
    return document.getElementById('diagnosticsOutput');
}

function createDiagnosticsSection(title, badgeLabel, badgeClass, timestamp, rows = [], extraContent = null) {
    const section = document.createElement('div');
    section.className = 'mb-4';

    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-2';

    const heading = document.createElement('h6');
    heading.className = 'mb-0';
    heading.textContent = title;

    const badge = document.createElement('span');
    badge.className = `badge bg-${badgeClass}`;
    badge.textContent = badgeLabel;

    header.appendChild(heading);
    header.appendChild(badge);

    section.appendChild(header);

    if (timestamp) {
        const timeEl = document.createElement('p');
        timeEl.className = 'text-muted small mb-2';
        timeEl.textContent = `עודכן לאחרונה: ${new Date(timestamp).toLocaleString('he-IL')}`;
        section.appendChild(timeEl);
    }

    if (rows.length) {
        const list = document.createElement('ul');
        list.className = 'list-unstyled small mb-0';

        rows.forEach((row) => {
            const item = document.createElement('li');
            item.className = 'd-flex justify-content-between align-items-center mb-1';

            const label = document.createElement('span');
            label.className = 'text-muted';
            label.textContent = row.label;

            const valueWrapper = document.createElement('div');
            valueWrapper.className = 'd-flex align-items-center gap-2';

            if (row.color) {
                const chip = document.createElement('span');
                chip.className = 'rounded-pill border';
                chip.style.display = 'inline-block';
                chip.style.width = '16px';
                chip.style.height = '16px';
                chip.style.background = row.color;
                valueWrapper.appendChild(chip);
            }

            const value = document.createElement('code');
            value.textContent = row.value;
            valueWrapper.appendChild(value);

            item.appendChild(label);
            item.appendChild(valueWrapper);
            list.appendChild(item);
        });

        section.appendChild(list);
    }

    if (extraContent) {
        section.appendChild(extraContent);
    }

    return section;
}

function renderDiagnostics() {
    const container = getDiagnosticsContainer();
    if (!container) {
        return;
    }

    container.innerHTML = '';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const sections = [];

    const colorCheck = designsDiagnosticsState.colorCheck;
    if (colorCheck) {
        const issuesPreview = colorCheck.issues?.slice(0, 5) || [];
        let extraContent = null;

        if (issuesPreview.length) {
            const issuesList = document.createElement('div');
            issuesList.className = 'mt-3';

            const title = document.createElement('p');
            title.className = 'text-muted small mb-2';
            title.textContent = 'דוגמאות לבעיות שנמצאו:';
            issuesList.appendChild(title);

            issuesPreview.forEach((issue) => {
                const issueRow = document.createElement('div');
                issueRow.className = 'border rounded p-2 mb-2 bg-light small';
                issueRow.innerHTML = `
                    <div><strong>${issue.button?.buttonType || 'כפתור'}</strong> (${issue.button?.variant || 'full'})</div>
                    <div>בעיה: ${issue.message}</div>
                    <div class="text-muted">צבע: ${issue.button?.color || 'לא זמין'}</div>
                `;
                issuesList.appendChild(issueRow);
            });

            extraContent = issuesList;
        }

        sections.push(createDiagnosticsSection(
            'בדיקת צבעי כפתורים',
            colorCheck.issueCount > 0 ? `${colorCheck.issueCount} בעיות` : 'ללא בעיות',
            colorCheck.issueCount > 0 ? 'warning' : 'success',
            colorCheck.timestamp,
            [
                { label: 'סה״כ כפתורים', value: colorCheck.totalButtons },
                { label: 'בעיות שנמצאו', value: colorCheck.issueCount },
                { label: 'כפתורים עם רקע שקוף', value: colorCheck.transparentBackgroundCount || 0 },
                { label: 'בעיות צבע לא תואם', value: colorCheck.wrongColorCount || 0 }
            ],
            extraContent
        ));
    }

    const lastFix = designsDiagnosticsState.lastFix;
    if (lastFix) {
        sections.push(createDiagnosticsSection(
            'תיקון צבעים',
            lastFix.fixedCount > 0 ? `${lastFix.fixedCount} כפתורים עודכנו` : 'לא נדרשו שינויים',
            lastFix.fixedCount > 0 ? 'success' : 'info',
            lastFix.timestamp,
            [
                { label: 'כפתורים שעברו בדיקה', value: lastFix.totalButtons || '-' },
                { label: 'תיקונים שבוצעו', value: lastFix.fixedCount }
            ]
        ));
    }

    if (!sections.length) {
        const emptyState = document.createElement('p');
        emptyState.className = 'text-muted mb-0';
        emptyState.textContent = 'טרם הופעלו בדיקות צבעים בעמוד זה.';
        cardBody.appendChild(emptyState);
    } else {
        sections.forEach((section) => cardBody.appendChild(section));
    }

    container.appendChild(cardBody);
}

async function persistDiagnosticsState() {
    const payload = { diagnostics: designsDiagnosticsState };

    if (window.PageStateManager?.initialized) {
        try {
            const previous = await window.PageStateManager.loadPageState(DESIGNS_PAGE_STATE_KEY) || {};
            await window.PageStateManager.savePageState(DESIGNS_PAGE_STATE_KEY, { ...previous, ...payload });
            return;
        } catch (error) {
            window.Logger?.warn('Designs diagnostics: failed to persist via PageStateManager', { error });
        }
    }

    try {
        localStorage.setItem(DESIGNS_DIAGNOSTICS_STORAGE_KEY, JSON.stringify(payload));
    } catch (storageError) {
        window.Logger?.warn('Designs diagnostics: failed to persist in localStorage', { storageError });
    }
}

async function loadDiagnosticsState() {
    let state = null;

    if (window.PageStateManager?.initialized) {
        try {
            state = await window.PageStateManager.loadPageState(DESIGNS_PAGE_STATE_KEY);
        } catch (error) {
            window.Logger?.warn('Designs diagnostics: failed to load from PageStateManager', { error });
        }
    }

    if (!state) {
        try {
            const stored = localStorage.getItem(DESIGNS_DIAGNOSTICS_STORAGE_KEY);
            if (stored) {
                state = JSON.parse(stored);
            }
        } catch (storageError) {
            window.Logger?.warn('Designs diagnostics: failed to load from localStorage', { storageError });
        }
    }

    designsDiagnosticsState = state?.diagnostics || {};
    renderDiagnostics();
}

function updateDiagnosticsState(partialState) {
    designsDiagnosticsState = { ...designsDiagnosticsState, ...partialState };
    renderDiagnostics();
    persistDiagnosticsState();
}

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

        window.Logger?.warn('Designs color check: issues detected', {
            issueCount: issues.length,
            issueTypes
        });
        window.showWarningNotification?.(
            `נמצאו ${issues.length} בעיות בצבעי הכפתורים`,
            'פרטים נוספים זמינים בסקשן הדיאגנוסטיקה'
        );
    } else {
        console.log('✅ כל הכפתורים נראים תקינים!');
        window.Logger?.info('Designs color check: all buttons passed');
        window.showSuccessNotification?.('בדיקת צבעים הושלמה', 'כל הכפתורים עומדים בסטנדרט');
    }

    const transparentBackgroundCount = issues.filter(issue => issue.type === 'transparent_background').length;
    const wrongColorCount = issues.filter(issue => issue.type === 'wrong_color').length;

    updateDiagnosticsState({
        colorCheck: {
            timestamp: Date.now(),
            totalButtons: Object.keys(results).length,
            issueCount: issues.length,
            transparentBackgroundCount,
            wrongColorCount,
            issues: issues.map(issue => ({
                type: issue.type,
                message: issue.message,
                button: issue.button
            }))
        }
    });

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
    if (fixedCount > 0) {
        window.Logger?.info('Designs color fix: buttons updated', { fixedCount });
        window.showSuccessNotification?.(
            `תוקנו ${fixedCount} כפתורים`,
            'הבדיקה תרוץ מחדש לאימות'
        );
    } else {
        window.Logger?.info('Designs color fix: no changes required');
        window.showInfoNotification?.('לא נדרשו שינויים בצבעים', 'כל הכפתורים כבר עומדים בסטנדרט');
    }

    updateDiagnosticsState({
        lastFix: {
            timestamp: Date.now(),
            fixedCount,
            totalButtons: buttons.length
        }
    });

    // בדיקה חוזרת
    setTimeout(() => {
        checkButtonColors();
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    loadDiagnosticsState();
});

// הוספה לגלובל
window.checkButtonColors = checkButtonColors;
window.fixButtonColors = fixButtonColors;
