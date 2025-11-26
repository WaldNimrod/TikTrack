/**
 * בדיקת Entity Details Modal בדפדפן
 * Browser Testing Script for Entity Details Modal
 * 
 * סקריפט זה בודק שהמערכת נטענת נכון ופועלת
 * Run this in browser console after loading a page
 */

(function() {
    'use strict';
    
    console.log('='.repeat(80));
    console.log('🧪 בדיקת Entity Details Modal בדפדפן');
    console.log('='.repeat(80));
    console.log();
    
    const tests = {
        filesLoaded: false,
        globalsAvailable: false,
        functionsWorking: false,
        modalInitialized: false
    };
    
    const errors = [];
    const warnings = [];
    
    // Test 1: Check if files are loaded
    console.log('📋 בדיקה 1: טעינת קבצים...');
    const requiredFiles = [
        'entity-details-api.js',
        'entity-details-renderer.js',
        'entity-details-modal.js'
    ];
    
    const scripts = Array.from(document.querySelectorAll('script[src]'))
        .map(s => s.src)
        .filter(src => src.includes('entity-details'));
    
    const loadedFiles = scripts.map(src => {
        const match = src.match(/([^/]+\.js)/);
        return match ? match[1] : null;
    }).filter(Boolean);
    
    const missingFiles = requiredFiles.filter(file => 
        !loadedFiles.some(loaded => file === loaded || loaded.includes(file))
    );
    
    if (missingFiles.length === 0) {
        tests.filesLoaded = true;
        console.log('  ✅ כל הקבצים נטענו:', loadedFiles);
    } else {
        errors.push(`חסרים קבצים: ${missingFiles.join(', ')}`);
        console.log('  ❌ קבצים חסרים:', missingFiles);
        console.log('  ℹ️  קבצים שנטענו:', loadedFiles);
    }
    
    console.log();
    
    // Test 2: Check if globals are available
    console.log('📋 בדיקה 2: זמינות פונקציות גלובליות...');
    
    const requiredGlobals = [
        'window.showEntityDetails',
        'window.entityDetailsModal',
        'window.EntityDetailsAPI',
        'window.EntityDetailsRenderer'
    ];
    
    const missingGlobals = requiredGlobals.filter(global => {
        try {
            const exists = eval(`typeof ${global}`) !== 'undefined';
            return !exists;
        } catch (e) {
            return true;
        }
    });
    
    if (missingGlobals.length === 0) {
        tests.globalsAvailable = true;
        console.log('  ✅ כל הפונקציות הגלובליות זמינות');
        
        // Check types
        console.log('  📊 סוגי פונקציות:');
        console.log(`    - showEntityDetails: ${typeof window.showEntityDetails}`);
        console.log(`    - entityDetailsModal: ${typeof window.entityDetailsModal}`);
        console.log(`    - EntityDetailsAPI: ${typeof window.EntityDetailsAPI}`);
        console.log(`    - EntityDetailsRenderer: ${typeof window.EntityDetailsRenderer}`);
    } else {
        errors.push(`חסרות פונקציות גלובליות: ${missingGlobals.join(', ')}`);
        console.log('  ❌ פונקציות חסרות:', missingGlobals);
    }
    
    console.log();
    
    // Test 3: Check if modal is initialized
    console.log('📋 בדיקה 3: אתחול מודל...');
    
    if (window.entityDetailsModal) {
        if (window.entityDetailsModal.isInitialized) {
            tests.modalInitialized = true;
            console.log('  ✅ המודל אותחל נכון');
            console.log(`    - isInitialized: ${window.entityDetailsModal.isInitialized}`);
        } else {
            warnings.push('המודל קיים אבל לא אותחל');
            console.log('  ⚠️  המודל קיים אבל לא אותחל');
        }
    } else {
        errors.push('window.entityDetailsModal לא קיים');
        console.log('  ❌ window.entityDetailsModal לא קיים');
    }
    
    console.log();
    
    // Test 4: Check if showEntityDetails is callable
    console.log('📋 בדיקה 4: בדיקת פונקציונליות showEntityDetails...');
    
    if (typeof window.showEntityDetails === 'function') {
        tests.functionsWorking = true;
        console.log('  ✅ showEntityDetails היא פונקציה תקינה');
        
        // Test calling it (but don't actually show modal)
        try {
            // Just check if it's callable, don't actually call it
            const funcString = window.showEntityDetails.toString();
            if (funcString.includes('entityDetailsModal') || funcString.includes('show')) {
                console.log('  ✅ הפונקציה מכילה לוגיקה נכונה');
            }
        } catch (e) {
            warnings.push(`שגיאה בבדיקת showEntityDetails: ${e.message}`);
        }
    } else {
        errors.push('showEntityDetails לא קיימת או לא פונקציה');
        console.log('  ❌ showEntityDetails לא קיימת או לא פונקציה');
    }
    
    console.log();
    
    // Summary
    console.log('='.repeat(80));
    console.log('📊 סיכום בדיקות');
    console.log('='.repeat(80));
    console.log();
    
    const allTests = Object.values(tests);
    const passedTests = allTests.filter(t => t).length;
    const totalTests = allTests.length;
    
    console.log(`✅ בדיקות שעברו: ${passedTests}/${totalTests}`);
    console.log();
    
    if (errors.length > 0) {
        console.log('❌ שגיאות:');
        errors.forEach(error => console.log(`  - ${error}`));
        console.log();
    }
    
    if (warnings.length > 0) {
        console.log('⚠️  אזהרות:');
        warnings.forEach(warning => console.log(`  - ${warning}`));
        console.log();
    }
    
    if (passedTests === totalTests && errors.length === 0) {
        console.log('🎉 כל הבדיקות עברו בהצלחה!');
    } else {
        console.log('⚠️  יש בעיות שצריך לטפל בהן');
    }
    
    console.log('='.repeat(80));
    
    // Return test results for programmatic access
    return {
        tests,
        errors,
        warnings,
        passed: passedTests === totalTests && errors.length === 0
    };
})();

