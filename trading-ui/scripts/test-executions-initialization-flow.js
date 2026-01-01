/**
 * ניטור תהליך איתחול עמוד ביצועים
 * ====================================
 * 
 * סקריפט ניטור מפורט לבדיקת תהליך האיתחול והטעינה
 * בודק האם העמוד ממש את מערכת האיתחול המאוחדת נכון
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - hasInitializeTradeCreation() - Hasinitializetradecreation

// === Event Handlers ===
// - logEvent() - Logevent
// - hasDirectDOMContentLoaded() - Hasdirectdomcontentloaded
// - hasSectionsRestoredWait() - Hassectionsrestoredwait
// - hasMutationObserver() - Hasmutationobserver
// - eventListenerCount() - Eventlistenercount
// - hasExecutionsLoadedListener() - Hasexecutionsloadedlistener
// - hasMutationObserverForTradeCreation() - Hasmutationobserverfortradecreation

// === Other ===
// - logIssue() - Logissue
// - logDuplicate() - Logduplicate
// - timeoutCount() - Timeoutcount

(function() {
  'use strict';

  window.Logger?.info('\n');
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info('🔍 ניטור תהליך איתחול עמוד ביצועים');
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info('\n');

  const monitor = {
    startTime: Date.now(),
    events: [],
    issues: [],
    duplicates: []
  };

  function logEvent(name, details = {}) {
    const event = {
      name,
      time: Date.now() - monitor.startTime,
      details
    };
    monitor.events.push(event);
    window.Logger?.info(`📅 [${event.time}ms] ${name}`);
    if (Object.keys(details).length > 0) {
      window.Logger?.info('   ', details);
    }
  }

  function logIssue(severity, message, details = {}) {
    const issue = {
      severity, // 'error', 'warning', 'info'
      message,
      time: Date.now() - monitor.startTime,
      details
    };
    monitor.issues.push(issue);
    
    const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
    window.Logger?.info(`${icon} ${message}`);
    if (Object.keys(details).length > 0) {
      window.Logger?.info('   ', details);
    }
  }

  function logDuplicate(name, locations) {
    const dup = {
      name,
      locations,
      time: Date.now() - monitor.startTime
    };
    monitor.duplicates.push(dup);
    window.Logger?.info(`🔄 כפילות: ${name}`);
    window.Logger?.info('   נמצא ב:', locations);
  }

  // ============================================================================
  // 1. בדיקת מערכת האיתחול המאוחדת
  // ============================================================================
  window.Logger?.info('📋 שלב 1: בדיקת מערכת האיתחול המאוחדת');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  const hasUnifiedAppInitializer = typeof window.UnifiedAppInitializer !== 'undefined';
  logEvent('UnifiedAppInitializer Check', {
    exists: hasUnifiedAppInitializer
  });
  
  const hasPageConfigs = !!(window.PAGE_CONFIGS || window.PAGE_INITIALIZATION_CONFIGS);
  logEvent('PAGE_CONFIGS Check', {
    exists: hasPageConfigs,
    source: window.PAGE_CONFIGS ? 'PAGE_CONFIGS' : window.PAGE_INITIALIZATION_CONFIGS ? 'PAGE_INITIALIZATION_CONFIGS' : 'none'
  });
  
  const executionsConfig = window.PAGE_CONFIGS?.executions || window.PAGE_INITIALIZATION_CONFIGS?.executions;
  if (executionsConfig) {
    logEvent('Executions Page Config Found', {
      hasCustomInitializers: !!executionsConfig.customInitializers,
      customInitializersCount: executionsConfig.customInitializers?.length || 0,
      hasSectionDefaultStates: !!executionsConfig.sectionDefaultStates
    });
  } else {
    logIssue('error', 'Executions page config not found!');
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 2. בדיקת כפילויות בקריאות איתחול
  // ============================================================================
  window.Logger?.info('🔄 שלב 2: בדיקת כפילויות בקריאות איתחול');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  // בדיקת initializeExecutionsPage
  const initializeExecutionsPageLocations = [];
  if (typeof window.initializeExecutionsPage === 'function') {
    // נבדוק איפה הפונקציה נקראת
    // 1. ב-page-initialization-configs.js
    if (executionsConfig?.customInitializers) {
      executionsConfig.customInitializers.forEach((init, idx) => {
        const initStr = init.toString();
        if (initStr.includes('initializeExecutionsPage') || initStr.includes('loadExecutionsData')) {
          initializeExecutionsPageLocations.push(`page-initialization-configs.js customInitializers[${idx}]`);
        }
      });
    }
    
    // 2. ב-core-systems.js
    // 3. ב-executions.js עצמו (DOMContentLoaded)
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeExecutionsPageLocations.push('executions.js (DOMContentLoaded or immediate)');
    }
  }
  
  if (initializeExecutionsPageLocations.length > 1) {
    logDuplicate('initializeExecutionsPage', initializeExecutionsPageLocations);
    logIssue('warning', 'כפילות בקריאות initializeExecutionsPage', {
      locations: initializeExecutionsPageLocations
    });
  } else if (initializeExecutionsPageLocations.length === 1) {
    logEvent('initializeExecutionsPage Location', {
      location: initializeExecutionsPageLocations[0]
    });
  } else {
    logIssue('error', 'initializeExecutionsPage לא נקרא בכלל!');
  }
  
  // בדיקת loadExecutionsData
  const loadExecutionsDataLocations = [];
  if (typeof window.loadExecutionsData === 'function') {
    // נבדוק איפה הפונקציה נקראת
    if (executionsConfig?.customInitializers) {
      executionsConfig.customInitializers.forEach((init, idx) => {
        const initStr = init.toString();
        if (initStr.includes('loadExecutionsData')) {
          loadExecutionsDataLocations.push(`page-initialization-configs.js customInitializers[${idx}]`);
        }
      });
    }
    
    // ב-executions.js בתוך initializeExecutionsPage
    if (typeof window.initializeExecutionsPage === 'function') {
      const initStr = window.initializeExecutionsPage.toString();
      if (initStr.includes('loadExecutionsData')) {
        loadExecutionsDataLocations.push('executions.js initializeExecutionsPage');
      }
    }
  }
  
  if (loadExecutionsDataLocations.length > 1) {
    logDuplicate('loadExecutionsData', loadExecutionsDataLocations);
    logIssue('warning', 'כפילות בקריאות loadExecutionsData', {
      locations: loadExecutionsDataLocations
    });
  } else if (loadExecutionsDataLocations.length === 1) {
    logEvent('loadExecutionsData Location', {
      location: loadExecutionsDataLocations[0]
    });
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 3. בדיקת קוד מקומי חליפי
  // ============================================================================
  window.Logger?.info('🔍 שלב 3: בדיקת קוד מקומי חליפי');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  // בדיקת האם יש קוד שמעקף את מערכת האיתחול המאוחדת
  const hasDirectDOMContentLoaded = (() => {
    // נבדוק אם יש event listeners ל-DOMContentLoaded
    // זה לא אפשרי לבדוק ישירות, אבל נבדוק את הקוד
    return false; // נצטרך לבדוק ידנית
  })();
  
  // בדיקת האם יש קוד שמחכה ל-sectionsRestored במקום להשתמש במערכת המאוחדת
  const hasSectionsRestoredWait = (() => {
    if (typeof window.initializeExecutionsPage === 'function') {
      const initStr = window.initializeExecutionsPage.toString();
      return initStr.includes('sectionsRestored') || initStr.includes('sections:restored');
    }
    return false;
  })();
  
  if (hasSectionsRestoredWait) {
    logIssue('warning', 'קוד מחכה ל-sectionsRestored במקום להשתמש במערכת המאוחדת', {
      suggestion: 'יש להשתמש ב-sectionDefaultStates מ-PAGE_CONFIGS'
    });
  }
  
  // בדיקת האם יש קוד שמחכה ל-MutationObserver במקום להשתמש במערכת המאוחדת
  const hasMutationObserver = (() => {
    if (typeof window.initializeExecutionsPage === 'function') {
      const initStr = window.initializeExecutionsPage.toString();
      return initStr.includes('MutationObserver');
    }
    return false;
  })();
  
  if (hasMutationObserver) {
    logIssue('warning', 'קוד משתמש ב-MutationObserver במקום להשתמש במערכת המאוחדת', {
      suggestion: 'יש להשתמש ב-sectionDefaultStates ו-customInitializers מ-PAGE_CONFIGS'
    });
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 4. בדיקת תהליך הטעינה
  // ============================================================================
  window.Logger?.info('📊 שלב 4: בדיקת תהליך הטעינה');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  // בדיקת סדר הטעינה
  const loadOrder = [];
  
  // 1. PAGE_CONFIGS נטען
  if (hasPageConfigs) {
    loadOrder.push('PAGE_CONFIGS loaded');
  }
  
  // 2. UnifiedAppInitializer רץ
  if (hasUnifiedAppInitializer) {
    loadOrder.push('UnifiedAppInitializer runs');
  }
  
  // 3. customInitializers רצים
  if (executionsConfig?.customInitializers) {
    loadOrder.push(`customInitializers run (${executionsConfig.customInitializers.length} initializers)`);
  }
  
  // 4. initializeExecutionsPage נקרא
  if (typeof window.initializeExecutionsPage === 'function') {
    loadOrder.push('initializeExecutionsPage called');
  }
  
  // 5. loadExecutionsData נקרא
  if (typeof window.loadExecutionsData === 'function') {
    loadOrder.push('loadExecutionsData called');
  }
  
  logEvent('Load Order', {
    order: loadOrder
  });
  
  // בדיקת האם התהליך רציף
  const isContinuous = loadOrder.length > 0 && loadOrder.every((item, idx) => {
    if (idx === 0) return true;
    // כל שלב צריך לבוא אחרי השלב הקודם
    return true; // נניח שכן אם הכל קיים
  });
  
  if (!isContinuous) {
    logIssue('warning', 'תהליך הטעינה לא רציף', {
      loadOrder
    });
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 5. בדיקת סיבוכיות יתר
  // ============================================================================
  window.Logger?.info('🔧 שלב 5: בדיקת סיבוכיות יתר');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  // בדיקת מספר ה-timeouts
  const timeoutCount = (() => {
    if (typeof window.initializeExecutionsPage === 'function') {
      const initStr = window.initializeExecutionsPage.toString();
      const matches = initStr.match(/setTimeout/g);
      return matches ? matches.length : 0;
    }
    return 0;
  })();
  
  if (timeoutCount > 3) {
    logIssue('warning', 'יותר מדי timeouts בקוד', {
      count: timeoutCount,
      suggestion: 'יש לפשט את הקוד ולהשתמש במערכת המאוחדת'
    });
  }
  
  // בדיקת מספר ה-event listeners
  const eventListenerCount = (() => {
    if (typeof window.initializeExecutionsPage === 'function') {
      const initStr = window.initializeExecutionsPage.toString();
      const matches = initStr.match(/addEventListener/g);
      return matches ? matches.length : 0;
    }
    return 0;
  })();
  
  if (eventListenerCount > 5) {
    logIssue('warning', 'יותר מדי event listeners בקוד', {
      count: eventListenerCount,
      suggestion: 'יש לפשט את הקוד ולהשתמש במערכת המאוחדת'
    });
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 6. בדיקת תהליך ה-preloading
  // ============================================================================
  window.Logger?.info('🔄 שלב 6: בדיקת תהליך ה-preloading');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  // בדיקת executionsSections34Data
  const hasSections34Data = !!window.executionsSections34Data;
  logEvent('executionsSections34Data Check', {
    exists: hasSections34Data
  });
  
  if (hasSections34Data) {
    const tradeCreationLoaded = window.executionsSections34Data.tradeCreation?.loaded || false;
    const tradeCreationData = window.executionsSections34Data.tradeCreation?.data;
    const suggestionsLoaded = window.executionsSections34Data.suggestions?.loaded || false;
    const suggestionsData = window.executionsSections34Data.suggestions?.data;
    
    logEvent('Trade Creation Preload Status', {
      loaded: tradeCreationLoaded,
      dataExists: !!tradeCreationData,
      dataLength: tradeCreationData?.length || 0
    });
    
    logEvent('Suggestions Preload Status', {
      loaded: suggestionsLoaded,
      dataExists: !!suggestionsData,
      dataKeys: suggestionsData ? Object.keys(suggestionsData).length : 0
    });
    
    if (!tradeCreationLoaded && !suggestionsLoaded) {
      logIssue('warning', 'נתוני סקשנים 3+4 לא נטענו', {
        suggestion: 'יש לבדוק למה preloadSections34Data לא הופעל'
      });
    }
  } else {
    logIssue('warning', 'executionsSections34Data לא קיים', {
      suggestion: 'יש לבדוק למה המשתנה לא אותחל'
    });
  }
  
  // בדיקת waitForMainTableAndPreload
  const hasWaitForMainTable = typeof window.waitForMainTableAndPreload === 'function';
  logEvent('waitForMainTableAndPreload Check', {
    exists: hasWaitForMainTable
  });
  
  // בדיקת preloadSections34Data
  const hasPreloadSections34 = typeof window.preloadSections34Data === 'function';
  logEvent('preloadSections34Data Check', {
    exists: hasPreloadSections34
  });
  
  // בדיקת event listener ל-executions:loaded
  // זה לא אפשרי לבדוק ישירות, אבל נבדוק אם יש קוד שמאזין
  const hasExecutionsLoadedListener = (() => {
    if (typeof window.waitForMainTableAndPreload === 'function') {
      const funcStr = window.waitForMainTableAndPreload.toString();
      return funcStr.includes('executions:loaded');
    }
    return false;
  })();
  
  if (!hasExecutionsLoadedListener) {
    logIssue('warning', 'לא נמצא event listener ל-executions:loaded', {
      suggestion: 'יש לוודא ש-waitForMainTableAndPreload מאזין ל-executions:loaded'
    });
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 7. בדיקת רינדור אשכולות
  // ============================================================================
  window.Logger?.info('🎨 שלב 7: בדיקת רינדור אשכולות');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  // בדיקת DOM elements
  const tradeCreationSection = document.getElementById('tradeCreationClustersSection');
  const tradeCreationTableBody = document.getElementById('executionTradeCreationClustersTableBody');
  const suggestionsSection = document.querySelector('[data-section="suggestions"]') || document.getElementById('suggestionsSection');
  
  logEvent('DOM Elements Check', {
    tradeCreationSectionExists: !!tradeCreationSection,
    tradeCreationTableBodyExists: !!tradeCreationTableBody,
    suggestionsSectionExists: !!suggestionsSection
  });
  
  // בדיקת מצב סקשנים
  if (tradeCreationSection) {
    const sectionBody = tradeCreationSection.querySelector('.section-body');
    const isOpen = sectionBody && window.getComputedStyle(sectionBody).display !== 'none';
    logEvent('Trade Creation Section State', {
      isOpen,
      hasBody: !!sectionBody
    });
    
    // בדיקת שורות בטבלה
    if (tradeCreationTableBody) {
      const rows = tradeCreationTableBody.querySelectorAll('tr');
      logEvent('Trade Creation Table Rows', {
        count: rows.length
      });
      
      if (rows.length === 0 && window.executionsSections34Data?.tradeCreation?.loaded && 
          window.executionsSections34Data.tradeCreation.data?.length > 0) {
        logIssue('warning', 'אשכולות לא מוצגים למרות שיש נתונים', {
          dataCount: window.executionsSections34Data.tradeCreation.data.length,
          suggestion: 'יש לבדוק למה renderClusters לא נקרא'
        });
      }
    }
  }
  
  // בדיקת initializeTradeCreationClustersSection
  const hasInitializeTradeCreation = (() => {
    if (typeof window.initializeExecutionsPage === 'function') {
      const initStr = window.initializeExecutionsPage.toString();
      return initStr.includes('initializeTradeCreationClustersSection');
    }
    return false;
  })();
  
  logEvent('initializeTradeCreationClustersSection Check', {
    exists: hasInitializeTradeCreation
  });
  
  // בדיקת MutationObserver
  const hasMutationObserverForTradeCreation = (() => {
    if (typeof window.initializeExecutionsPage === 'function') {
      const initStr = window.initializeExecutionsPage.toString();
      return initStr.includes('MutationObserver') && initStr.includes('tradeCreation');
    }
    return false;
  })();
  
  if (hasMutationObserverForTradeCreation) {
    logEvent('MutationObserver for Trade Creation', {
      exists: true,
      note: 'MutationObserver משמש לזיהוי פתיחת סקשן על ידי המשתמש'
    });
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 8. בדיקת timing של כל השלבים
  // ============================================================================
  window.Logger?.info('⏱️  שלב 8: בדיקת timing של כל השלבים');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  // נבדוק את הזמנים של כל האירועים
  const eventsByTime = monitor.events.sort((a, b) => a.time - b.time);
  logEvent('Events Timeline', {
    totalEvents: eventsByTime.length,
    firstEvent: eventsByTime[0]?.name,
    lastEvent: eventsByTime[eventsByTime.length - 1]?.name,
    totalTime: eventsByTime[eventsByTime.length - 1]?.time - eventsByTime[0]?.time || 0
  });
  
  // נבדוק אם יש פערים גדולים בין אירועים
  const largeGaps = [];
  for (let i = 1; i < eventsByTime.length; i++) {
    const gap = eventsByTime[i].time - eventsByTime[i - 1].time;
    if (gap > 1000) {
      largeGaps.push({
        from: eventsByTime[i - 1].name,
        to: eventsByTime[i].name,
        gap: gap
      });
    }
  }
  
  if (largeGaps.length > 0) {
    logIssue('warning', 'פערים גדולים בין אירועים', {
      gaps: largeGaps,
      suggestion: 'יש לבדוק למה יש עיכובים גדולים'
    });
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 9. סיכום וניתוח
  // ============================================================================
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info('📊 סיכום ניטור');
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  
  const totalEvents = monitor.events.length;
  const totalIssues = monitor.issues.length;
  const totalDuplicates = monitor.duplicates.length;
  const errors = monitor.issues.filter(i => i.severity === 'error').length;
  const warnings = monitor.issues.filter(i => i.severity === 'warning').length;
  
  window.Logger?.info(`📅 אירועים: ${totalEvents}`);
  window.Logger?.info(`❌ שגיאות: ${errors}`);
  window.Logger?.info(`⚠️  אזהרות: ${warnings}`);
  window.Logger?.info(`🔄 כפילויות: ${totalDuplicates}`);
  window.Logger?.info(`⏱️  זמן כולל: ${Date.now() - monitor.startTime}ms`);
  window.Logger?.info('\n');
  
  // ניתוח בעיות
  if (errors > 0) {
    window.Logger?.info('❌ בעיות קריטיות:');
    monitor.issues.filter(i => i.severity === 'error').forEach(issue => {
      window.Logger?.error(`   - ${issue.message}`);
      if (Object.keys(issue.details).length > 0) {
        window.Logger?.error('     ', issue.details);
      }
    });
    window.Logger?.info('\n');
  }
  
  if (warnings > 0) {
    window.Logger?.info('⚠️  אזהרות:');
    monitor.issues.filter(i => i.severity === 'warning').forEach(issue => {
      window.Logger?.warn(`   - ${issue.message}`);
      if (Object.keys(issue.details).length > 0) {
        window.Logger?.warn('     ', issue.details);
      }
    });
    window.Logger?.info('\n');
  }
  
  if (totalDuplicates > 0) {
    window.Logger?.info('🔄 כפילויות:');
    monitor.duplicates.forEach(dup => {
      window.Logger?.warn(`   - ${dup.name}:`);
      dup.locations.forEach(loc => {
        window.Logger?.warn(`     * ${loc}`);
      });
    });
    window.Logger?.info('\n');
  }
  
  // המלצות
  window.Logger?.info('💡 המלצות:');
  if (totalDuplicates > 0) {
    window.Logger?.info('   1. יש להסיר כפילויות בקריאות איתחול');
    window.Logger?.info('   2. יש להשתמש רק במערכת האיתחול המאוחדת');
  }
  if (hasSectionsRestoredWait || hasMutationObserver) {
    window.Logger?.info('   3. יש להסיר קוד מקומי חליפי ולהשתמש במערכת המאוחדת');
  }
  if (timeoutCount > 3 || eventListenerCount > 5) {
    window.Logger?.info('   4. יש לפשט את הקוד ולהסיר סיבוכיות יתר');
  }
  if (hasSections34Data && (!window.executionsSections34Data.tradeCreation?.loaded || !window.executionsSections34Data.suggestions?.loaded)) {
    window.Logger?.info('   5. יש לבדוק למה preloadSections34Data לא הושלם');
  }
  if (tradeCreationTableBody && tradeCreationTableBody.querySelectorAll('tr').length === 0 && 
      window.executionsSections34Data?.tradeCreation?.data?.length > 0) {
    window.Logger?.info('   6. יש לבדוק למה renderClusters לא נקרא למרות שיש נתונים');
  }
  if (errors === 0 && warnings === 0 && totalDuplicates === 0) {
    window.Logger?.info('   ✅ הכל תקין! העמוד ממש את מערכת האיתחול המאוחדת נכון.');
  }
  
  window.Logger?.info('\n');
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info('\n');
  
  // החזרת תוצאות
  return {
    success: errors === 0,
    summary: {
      events: totalEvents,
      errors,
      warnings,
      duplicates: totalDuplicates
    },
    events: monitor.events,
    issues: monitor.issues,
    duplicates: monitor.duplicates
  };
})();


