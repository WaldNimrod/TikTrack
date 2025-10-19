#!/usr/bin/env node

/**
 * Notification System Cleanup Script
 * ==================================
 * 
 * סקריפט אוטומטי לניקוי קריאות alert/confirm ישנות
 * והחלפתן במערכת ההתראות החדשה
 * 
 * שימוש:
 * node scripts/notification-cleanup-script.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// הגדרות
const SCRIPTS_DIR = path.join(__dirname, '..', 'trading-ui', 'scripts');
const BACKUP_DIR = path.join(__dirname, '..', 'backups', 'notification-cleanup-' + new Date().toISOString().slice(0,10));

// דפוסי חיפוש
const PATTERNS = {
    // alert() פשוטים
    simpleAlert: {
        pattern: /alert\((['"`])([^'"`]+)\1\)/g,
        replacement: (match, quote, message) => `window.showInfoNotification(${quote}${message}${quote})`,
        type: 'alert'
    },
    
    // confirm() פשוטים
    simpleConfirm: {
        pattern: /confirm\((['"`])([^'"`]+)\1\)/g,
        replacement: (match, quote, message) => `window.showConfirmationDialog('אישור', ${quote}${message}${quote})`,
        type: 'confirm'
    },
    
    // window.showNotification ישן
    oldShowNotification: {
        pattern: /window\.showNotification\((['"`])([^'"`]+)\1,\s*(['"`])(success|error|warning|info)\3\)/g,
        replacement: (match, quote1, message, quote2, type) => {
            const newFunction = {
                'success': 'window.showSuccessNotification',
                'error': 'window.showErrorNotification', 
                'warning': 'window.showWarningNotification',
                'info': 'window.showInfoNotification'
            }[type];
            return `${newFunction}(${quote1}${message}${quote1})`;
        },
        type: 'showNotification'
    }
};

// רשימת קבצים לניקוי
const TARGET_FILES = [
    'trading_accounts.js',
    'alerts.js', 
    'cash_flows.js',
    'executions.js',
    'tickers.js',
    'notes.js',
    'trade_plans.js',
    'trades.js',
    'server-monitor-v2.js',
    'entity-details-api.js',
    'preferences-admin.js',
    'preferences-page.js',
    'constraint-manager.js'
];

// פונקציה ליצירת גיבוי
function createBackup() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        console.log(`📁 נוצר תיקיית גיבוי: ${BACKUP_DIR}`);
    }
}

// פונקציה לגיבוי קובץ
function backupFile(filePath) {
    const fileName = path.basename(filePath);
    const backupPath = path.join(BACKUP_DIR, fileName);
    fs.copyFileSync(filePath, backupPath);
    console.log(`💾 גיבוי: ${fileName}`);
}

// פונקציה לניקוי קובץ
function cleanupFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;
    
    // ניקוי כל דפוס
    Object.values(PATTERNS).forEach(pattern => {
        const matches = content.match(pattern.pattern);
        if (matches) {
            content = content.replace(pattern.pattern, pattern.replacement);
            changes += matches.length;
            console.log(`  🔄 ${pattern.type}: ${matches.length} מופעים`);
        }
    });
    
    if (changes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${path.basename(filePath)}: ${changes} שינויים`);
        return changes;
    }
    
    return 0;
}

// פונקציה לבדיקת תחביר
function checkSyntax(filePath) {
    try {
        execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
        return true;
    } catch (error) {
        console.error(`❌ שגיאת תחביר ב-${path.basename(filePath)}`);
        return false;
    }
}

// פונקציה ראשית
function main() {
    console.log('🚀 מתחיל ניקוי מערכת התראות...');
    console.log('=====================================');
    
    // יצירת גיבוי
    createBackup();
    
    let totalChanges = 0;
    let processedFiles = 0;
    
    // עיבוד כל קובץ
    TARGET_FILES.forEach(fileName => {
        const filePath = path.join(SCRIPTS_DIR, fileName);
        
        if (fs.existsSync(filePath)) {
            console.log(`\n📄 מעבד: ${fileName}`);
            
            // גיבוי
            backupFile(filePath);
            
            // ניקוי
            const changes = cleanupFile(filePath);
            totalChanges += changes;
            
            if (changes > 0) {
                // בדיקת תחביר
                if (checkSyntax(filePath)) {
                    processedFiles++;
                } else {
                    console.error(`❌ שגיאה ב-${fileName} - החזרת גיבוי`);
                    fs.copyFileSync(path.join(BACKUP_DIR, fileName), filePath);
                }
            }
        } else {
            console.log(`⚠️  קובץ לא נמצא: ${fileName}`);
        }
    });
    
    // סיכום
    console.log('\n=====================================');
    console.log('📊 סיכום הניקוי:');
    console.log(`   קבצים מעובדים: ${processedFiles}`);
    console.log(`   סה"כ שינויים: ${totalChanges}`);
    console.log(`   גיבויים ב: ${BACKUP_DIR}`);
    
    if (totalChanges > 0) {
        console.log('\n✅ הניקוי הושלם בהצלחה!');
        console.log('🔍 מומלץ לבדוק את הקבצים לפני commit');
    } else {
        console.log('\nℹ️  לא נמצאו שינויים נדרשים');
    }
}

// הרצה
if (require.main === module) {
    main();
}

module.exports = { main, PATTERNS, TARGET_FILES };


