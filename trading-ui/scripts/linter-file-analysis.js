// ====================================================================================================
// LINTER FILE ANALYSIS MODULE
// ====================================================================================================
// 
// מודול לאנליזה של קבצים - כולל JS, HTML, Python, CSS ואחרים
// מופרד מהקובץ הראשי לשיפור ארגון הקוד

// Analyze actual file content for real issues
function analyzeFileContent(fileName, content) {
    const lines = content.split('\n');
    const issues = [];
    let issuesFound = 0;

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();

        // Check for console.log statements (error)
        if (line.includes('console.log') && !line.includes('//') && !line.includes('console.error') && !line.includes('console.warn')) {
            issues.push({
                type: 'error',
                message: 'console.log statement found in production code',
                line: lineNumber,
                fix: 'הסר או החלף ב-logger ייעודי'
            });
            issuesFound++;
        }

        // Check for alert() calls (error)
        if (line.includes('alert(') && !line.includes('//')) {
            issues.push({
                type: 'error',
                message: 'alert() call found - use notification system instead',
                line: lineNumber,
                fix: 'השתמש במערכת ההתראות הגלובלית'
            });
            issuesFound++;
        }

        // Check for missing semicolons in simple statements (warning)
        if (trimmedLine.match(/^(var|let|const)\s+\w+\s*=\s*[^;{}]+$/) && !trimmedLine.endsWith(';')) {
            issues.push({
                type: 'warning',
                message: 'Missing semicolon',
                line: lineNumber,
                fix: 'הוסף נקודה-פסיק בסוף השורה'
            });
            issuesFound++;
        }

        // Check for TODO comments (info)
        if (line.includes('TODO') || line.includes('FIXME')) {
            issues.push({
                type: 'info',
                message: 'TODO/FIXME comment found',
                line: lineNumber,
                fix: 'טפל בהערה זו'
            });
            issuesFound++;
        }

        // Check for very long lines (warning)
        if (line.length > 150) {
            issues.push({
                type: 'warning',
                message: 'Line too long (>150 characters)',
                line: lineNumber,
                fix: 'פצל את השורה למספר שורות'
            });
            issuesFound++;
        }
    });

    // Check file size (warning for very large files)
    if (lines.length > 500) {
        issues.push({
            type: 'warning',
            message: `File too large (${lines.length} lines)`,
            line: 1,
            fix: 'שקול לפצל לקבצים קטנים יותר'
        });
        issuesFound++;
    }

    return { issues, issuesFound };
}

// Analyze HTML file content for issues
function analyzeHtmlContent(fileName, content) {
    const issues = [];
    let issuesFound = 0;

    // Check for missing alt attributes on images
    const imgRegex = /<img[^>]*>/gi;
    const imgMatches = content.match(imgRegex) || [];
    
    imgMatches.forEach((img, index) => {
        if (!img.includes('alt=')) {
            issues.push({
                type: 'warning',
                message: 'Image missing alt attribute',
                line: getLineNumber(content, img),
                fix: 'הוסף תכונת alt לנגישות'
            });
            issuesFound++;
        }
    });

    // Check for inline styles (warning)
    const inlineStyleCount = (content.match(/style\s*=/gi) || []).length;
    if (inlineStyleCount > 0) {
        issues.push({
            type: 'warning',
            message: `${inlineStyleCount} inline style attributes found`,
            line: 1,
            fix: 'העבר עיצובים לקובץ CSS נפרד'
        });
        issuesFound++;
    }

    // Check for missing DOCTYPE
    if (!content.includes('<!DOCTYPE')) {
        issues.push({
            type: 'warning',
            message: 'Missing DOCTYPE declaration',
            line: 1,
            fix: 'הוסף <!DOCTYPE html> בתחילת הקובץ'
        });
        issuesFound++;
    }

    return { issues, issuesFound };
}

// Analyze Python file content for issues
function analyzePythonContent(fileName, content) {
    const issues = [];
    let issuesFound = 0;
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();

        // Check for print statements without parentheses (Python 2 style)
        if (trimmedLine.match(/^print\s+[^(]/)) {
            issues.push({
                type: 'error',
                message: 'Python 2 style print statement',
                line: lineNumber,
                fix: 'השתמש ב-print() עם סוגריים'
            });
            issuesFound++;
        }

        // Check for missing imports
        if (trimmedLine.includes('json.') && !content.includes('import json')) {
            issues.push({
                type: 'error',
                message: 'Missing json import',
                line: lineNumber,
                fix: 'הוסף import json בתחילת הקובץ'
            });
            issuesFound++;
        }

        // Check for very long lines
        if (line.length > 120) {
            issues.push({
                type: 'warning',
                message: 'Line too long (>120 characters)',
                line: lineNumber,
                fix: 'פצל את השורה למספר שורות'
            });
            issuesFound++;
        }
    });

    return { issues, issuesFound };
}

// Analyze CSS file content for issues
function analyzeCssContent(fileName, content) {
    const issues = [];
    let issuesFound = 0;

    // Check for !important usage (warning)
    const importantCount = (content.match(/!important/gi) || []).length;
    if (importantCount > 0) {
        issues.push({
            type: 'warning',
            message: `${importantCount} !important declarations found`,
            line: 1,
            fix: 'נסה להימנע מ-!important, השתמש בספציפיות נכונה'
        });
        issuesFound++;
    }

    // Check for unused vendor prefixes
    const vendorPrefixes = (content.match(/-webkit-|-moz-|-ms-|-o-/g) || []).length;
    if (vendorPrefixes > 0) {
        issues.push({
            type: 'info',
            message: `${vendorPrefixes} vendor prefixes found`,
            line: 1,
            fix: 'בדוק אם עדיין נדרשים עבור הדפדפנים הנתמכים'
        });
        issuesFound++;
    }

    // Check for universal selectors
    const universalSelectors = (content.match(/\*/g) || []).length;
    if (universalSelectors > 3) {
        issues.push({
            type: 'warning',
            message: `${universalSelectors} universal selectors found`,
            line: 1,
            fix: 'שקול להשתמש בסלקטורים ספציפיים יותר'
        });
        issuesFound++;
    }

    return { issues, issuesFound };
}

// Analyze other file types (JSON, MD, SQL, etc.)
function analyzeOtherContent(fileName, content) {
    const issues = [];
    let issuesFound = 0;
    const fileExt = fileName.split('.').pop().toLowerCase();

    switch (fileExt) {
        case 'json':
            try {
                JSON.parse(content);
            } catch (e) {
                issues.push({
                    type: 'error',
                    message: 'Invalid JSON syntax',
                    line: 1,
                    fix: 'תקן את תחביר ה-JSON'
                });
                issuesFound++;
            }
            break;

        case 'md':
            // Check for missing headers
            if (!content.includes('#')) {
                issues.push({
                    type: 'info',
                    message: 'No headers found in markdown',
                    line: 1,
                    fix: 'הוסף כותרות לשיפור הקריאות'
                });
                issuesFound++;
            }
            break;

        case 'sql':
            // Check for uppercase SQL keywords
            const uppercaseCommands = (content.match(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/g) || []).length;
            const lowercaseCommands = (content.match(/\b(select|insert|update|delete|create|drop|alter)\b/g) || []).length;
            
            if (lowercaseCommands > uppercaseCommands) {
                issues.push({
                    type: 'info',
                    message: 'Consider using uppercase for SQL keywords',
                    line: 1,
                    fix: 'השתמש באותיות גדולות עבור מילות מפתח SQL'
                });
                issuesFound++;
            }
            break;
    }

    return { issues, issuesFound };
}

// Helper function to get line number from content
function getLineNumber(content, searchString) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchString)) {
            return i + 1;
        }
    }
    return 1;
}

// Export functions for use in main linter
if (typeof window !== 'undefined') {
    window.analyzeFileContent = analyzeFileContent;
    window.analyzeHtmlContent = analyzeHtmlContent;
    window.analyzePythonContent = analyzePythonContent;
    window.analyzeCssContent = analyzeCssContent;
    window.analyzeOtherContent = analyzeOtherContent;
    window.getLineNumber = getLineNumber;
}
