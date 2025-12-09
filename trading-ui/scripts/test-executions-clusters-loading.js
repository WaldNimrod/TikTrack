/**
 * ניטור מפורט לטעינת אשכולות בעמוד ביצועים
 * ============================================
 * 
 * סקריפט בדיקה מפורט לזיהוי מדויק של בעיית טעינת האשכולות
 * 
 * שימוש:
 * 1. פתח את executions.html בדפדפן
 * 2. פתח את הקונסולה (F12)
 * 3. העתק והדבק את התוכן של קובץ זה לקונסולה
 * 4. לחץ Enter
 * 
 * הסקריפט יבצע ניטור מפורט ויציג דוח מפורט
 */

(function() {
  'use strict';

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 ניטור מפורט: טעינת אשכולות בעמוד ביצועים');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

  const monitor = {
    startTime: Date.now(),
    checks: [],
    errors: [],
    warnings: [],
    timeline: []
  };

  function logCheck(name, status, details = {}) {
    const check = {
      name,
      status,
      time: Date.now() - monitor.startTime,
      details
    };
    monitor.checks.push(check);
    
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} [${check.time}ms] ${name}`);
    if (Object.keys(details).length > 0) {
      console.log('   ', details);
    }
    
    if (status === 'fail') {
      monitor.errors.push(check);
    } else if (status === 'warning') {
      monitor.warnings.push(check);
    }
  }

  function logTimeline(event, details = {}) {
    const entry = {
      event,
      time: Date.now() - monitor.startTime,
      details
    };
    monitor.timeline.push(entry);
    console.log(`📅 [${entry.time}ms] ${event}`);
    if (Object.keys(details).length > 0) {
      console.log('   ', details);
    }
  }

  // ============================================================================
  // 1. בדיקת DOM Elements
  // ============================================================================
  console.log('📋 שלב 1: בדיקת אלמנטי DOM');
  console.log('───────────────────────────────────────────────────────────────');
  
  const tradeCreationSection = document.getElementById('tradeCreationClustersSection');
  const tradeCreationContainer = document.getElementById('executionTradeCreationClustersContainer');
  const tradeCreationTableBody = document.getElementById('executionTradeCreationClustersTableBody');
  const tradeCreationCount = document.getElementById('executionTradeCreationClustersCount');
  const tradeCreationLoading = document.getElementById('executionTradeCreationClustersLoading');
  const tradeCreationEmpty = document.getElementById('executionTradeCreationClustersEmpty');
  const tradeCreationError = document.getElementById('executionTradeCreationClustersError');
  
  logCheck('Trade Creation Section', tradeCreationSection ? 'pass' : 'fail', {
    id: 'tradeCreationClustersSection',
    exists: !!tradeCreationSection
  });
  
  logCheck('Trade Creation Container', tradeCreationContainer ? 'pass' : 'fail', {
    id: 'executionTradeCreationClustersContainer',
    exists: !!tradeCreationContainer
  });
  
  logCheck('Trade Creation Table Body', tradeCreationTableBody ? 'pass' : 'fail', {
    id: 'executionTradeCreationClustersTableBody',
    exists: !!tradeCreationTableBody
  });
  
  logCheck('Trade Creation Count Element', tradeCreationCount ? 'pass' : 'warning', {
    id: 'executionTradeCreationClustersCount',
    exists: !!tradeCreationCount,
    currentValue: tradeCreationCount?.textContent || 'N/A'
  });
  
  logCheck('Trade Creation Loading Element', tradeCreationLoading ? 'pass' : 'warning', {
    id: 'executionTradeCreationClustersLoading',
    exists: !!tradeCreationLoading,
    isVisible: tradeCreationLoading ? !tradeCreationLoading.classList.contains('d-none') : false
  });
  
  logCheck('Trade Creation Empty Element', tradeCreationEmpty ? 'pass' : 'warning', {
    id: 'executionTradeCreationClustersEmpty',
    exists: !!tradeCreationEmpty,
    isVisible: tradeCreationEmpty ? !tradeCreationEmpty.classList.contains('d-none') : false
  });
  
  logCheck('Trade Creation Error Element', tradeCreationError ? 'pass' : 'warning', {
    id: 'executionTradeCreationClustersError',
    exists: !!tradeCreationError,
    isVisible: tradeCreationError ? !tradeCreationError.classList.contains('d-none') : false,
    errorText: tradeCreationError?.textContent || ''
  });
  
  console.log('\n');

  // ============================================================================
  // 2. בדיקת מצב הסקשן
  // ============================================================================
  console.log('📊 שלב 2: בדיקת מצב הסקשן');
  console.log('───────────────────────────────────────────────────────────────');
  
  if (tradeCreationSection) {
    const sectionBody = tradeCreationSection.querySelector('.section-body');
    const sectionHeader = tradeCreationSection.querySelector('.section-header');
    const isOpen = sectionBody && window.getComputedStyle(sectionBody).display !== 'none';
    const displayStyle = sectionBody ? window.getComputedStyle(sectionBody).display : 'N/A';
    
    logCheck('Section Body Element', sectionBody ? 'pass' : 'fail', {
      exists: !!sectionBody,
      display: displayStyle
    });
    
    logCheck('Section Header Element', sectionHeader ? 'pass' : 'fail', {
      exists: !!sectionHeader
    });
    
    logCheck('Section State', isOpen ? 'pass' : 'warning', {
      isOpen,
      display: displayStyle,
      expected: 'flex or block (open)',
      actual: displayStyle
    });
    
    // בדיקת data-section attribute
    const dataSection = tradeCreationSection.getAttribute('data-section');
    logCheck('Data Section Attribute', dataSection === 'trade-creation' ? 'pass' : 'warning', {
      expected: 'trade-creation',
      actual: dataSection
    });
  } else {
    logCheck('Section State Check', 'fail', {
      reason: 'Section not found in DOM'
    });
  }
  
  console.log('\n');

  // ============================================================================
  // 3. בדיקת נתונים מוטענים מראש
  // ============================================================================
  console.log('💾 שלב 3: בדיקת נתונים מוטענים מראש');
  console.log('───────────────────────────────────────────────────────────────');
  
  const hasSections34Data = typeof window.executionsSections34Data !== 'undefined';
  logCheck('executionsSections34Data Global', hasSections34Data ? 'pass' : 'fail', {
    exists: hasSections34Data
  });
  
  if (hasSections34Data) {
    const tradeCreationData = window.executionsSections34Data.tradeCreation;
    logCheck('Trade Creation Data Object', tradeCreationData ? 'pass' : 'fail', {
      exists: !!tradeCreationData
    });
    
    if (tradeCreationData) {
      logCheck('Trade Creation Data Loaded', tradeCreationData.loaded ? 'pass' : 'warning', {
        loaded: tradeCreationData.loaded
      });
      
      logCheck('Trade Creation Data Available', tradeCreationData.data ? 'pass' : 'fail', {
        hasData: !!tradeCreationData.data,
        dataLength: Array.isArray(tradeCreationData.data) ? tradeCreationData.data.length : 0,
        dataType: typeof tradeCreationData.data
      });
      
      if (tradeCreationData.data && Array.isArray(tradeCreationData.data)) {
        logCheck('Trade Creation Data Count', tradeCreationData.data.length > 0 ? 'pass' : 'warning', {
          count: tradeCreationData.data.length,
          firstCluster: tradeCreationData.data[0] ? {
            clusterId: tradeCreationData.data[0].cluster_id,
            executionsCount: tradeCreationData.data[0].executions?.length || 0
          } : null
        });
      }
      
      if (tradeCreationData.error) {
        logCheck('Trade Creation Data Error', 'fail', {
          error: tradeCreationData.error
        });
      }
    }
  }
  
  console.log('\n');

  // ============================================================================
  // 4. בדיקת Services
  // ============================================================================
  console.log('🔧 שלב 4: בדיקת Services');
  console.log('───────────────────────────────────────────────────────────────');
  
  const hasExecutionClusteringService = typeof window.ExecutionClusteringService !== 'undefined';
  logCheck('ExecutionClusteringService', hasExecutionClusteringService ? 'pass' : 'fail', {
    exists: hasExecutionClusteringService
  });
  
  if (hasExecutionClusteringService) {
    const hasFetchClusters = typeof window.ExecutionClusteringService.fetchClusters === 'function';
    logCheck('ExecutionClusteringService.fetchClusters', hasFetchClusters ? 'pass' : 'fail', {
      exists: hasFetchClusters
    });
  }
  
  console.log('\n');

  // ============================================================================
  // 5. בדיקת פונקציות אתחול
  // ============================================================================
  console.log('⚙️  שלב 5: בדיקת פונקציות אתחול');
  console.log('───────────────────────────────────────────────────────────────');
  
  const hasInitializeExecutionsPage = typeof window.initializeExecutionsPage === 'function';
  logCheck('initializeExecutionsPage', hasInitializeExecutionsPage ? 'pass' : 'warning', {
    exists: hasInitializeExecutionsPage
  });
  
  // בדיקת האם initializeTradeCreationClustersSection קיימת (לא export ל-window)
  // נבדוק דרך בדיקת קוד
  logCheck('initializeTradeCreationClustersSection', 'warning', {
    note: 'Function is not exported to window - checking via code inspection',
    suggestion: 'Check if function is called in initializeExecutionsPage'
  });
  
  console.log('\n');

  // ============================================================================
  // 6. בדיקת טבלה
  // ============================================================================
  console.log('📋 שלב 6: בדיקת טבלת אשכולות');
  console.log('───────────────────────────────────────────────────────────────');
  
  if (tradeCreationTableBody) {
    const rows = tradeCreationTableBody.querySelectorAll('tr');
    const rowsWithData = Array.from(rows).filter(row => {
      const cells = row.querySelectorAll('td');
      return cells.length > 0 && row.textContent.trim().length > 0;
    });
    
    logCheck('Table Body Rows', rows.length > 0 ? 'pass' : 'warning', {
      totalRows: rows.length,
      rowsWithData: rowsWithData.length,
      isEmpty: rows.length === 0
    });
    
    if (rows.length > 0) {
      const firstRow = rows[0];
      const firstRowText = firstRow.textContent.substring(0, 100);
      logCheck('First Row Content', 'pass', {
        preview: firstRowText,
        hasCells: firstRow.querySelectorAll('td').length > 0
      });
    } else {
      logCheck('Table Body Empty', 'warning', {
        reason: 'No rows found in table body',
        expected: 'Should have rows if data is loaded'
      });
    }
  } else {
    logCheck('Table Body Check', 'fail', {
      reason: 'Table body element not found'
    });
  }
  
  console.log('\n');

  // ============================================================================
  // 7. בדיקת Cache
  // ============================================================================
  console.log('💾 שלב 7: בדיקת Cache');
  console.log('───────────────────────────────────────────────────────────────');
  
  const hasUnifiedCacheManager = typeof window.UnifiedCacheManager !== 'undefined';
  logCheck('UnifiedCacheManager', hasUnifiedCacheManager ? 'pass' : 'warning', {
    exists: hasUnifiedCacheManager
  });
  
  if (hasUnifiedCacheManager && typeof window.UnifiedCacheManager.get === 'function') {
    // ננסה לקבל את ה-cache (async)
    window.UnifiedCacheManager.get('execution-clustering-clusters', { ttl: 60000 })
      .then(cached => {
        logCheck('Clusters Cache', cached ? 'pass' : 'warning', {
          cached: !!cached,
          cachedLength: Array.isArray(cached) ? cached.length : 0
        });
      })
      .catch(() => {
        logCheck('Clusters Cache', 'warning', {
          note: 'Could not retrieve cache (may be normal)'
        });
      });
  }
  
  console.log('\n');

  // ============================================================================
  // 8. בדיקת API Response
  // ============================================================================
  console.log('🌐 שלב 8: בדיקת API Response');
  console.log('───────────────────────────────────────────────────────────────');
  
  // נבדוק את ה-performance entries
  if (window.performance && window.performance.getEntriesByType) {
    const apiCalls = window.performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('/api/executions'));
    
    logCheck('API Calls Found', apiCalls.length > 0 ? 'pass' : 'warning', {
      count: apiCalls.length,
      calls: apiCalls.map(call => ({
        url: call.name.substring(call.name.lastIndexOf('/')),
        duration: `${call.duration.toFixed(2)}ms`,
        status: call.responseStatus || 'unknown'
      }))
    });
  }
  
  // ננסה לקרוא ישירות ל-API
  fetch('/api/executions/pending-assignment/trade-creation-clusters?_ts=' + Date.now())
    .then(response => response.json())
    .then(data => {
      logCheck('API Direct Call', data?.data ? 'pass' : 'warning', {
        success: !!data?.data,
        dataLength: Array.isArray(data?.data) ? data.data.length : 0,
        message: data?.message || 'N/A'
      });
    })
    .catch(error => {
      logCheck('API Direct Call', 'fail', {
        error: error?.message || 'Unknown error'
      });
    });
  
  console.log('\n');

  // ============================================================================
  // 9. בדיקת Event Listeners
  // ============================================================================
  console.log('👂 שלב 9: בדיקת Event Listeners');
  console.log('───────────────────────────────────────────────────────────────');
  
  // נבדוק אם יש event listeners רשומים
  logCheck('Sections Restored Flag', typeof window.sectionsRestored !== 'undefined' ? 'pass' : 'warning', {
    exists: typeof window.sectionsRestored !== 'undefined',
    value: window.sectionsRestored
  });
  
  console.log('\n');

  // ============================================================================
  // 10. סיכום וניתוח
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 סיכום ניטור');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const totalChecks = monitor.checks.length;
  const passedChecks = monitor.checks.filter(c => c.status === 'pass').length;
  const failedChecks = monitor.checks.filter(c => c.status === 'fail').length;
  const warningChecks = monitor.checks.filter(c => c.status === 'warning').length;
  
  console.log(`✅ הצלחות: ${passedChecks}/${totalChecks}`);
  console.log(`❌ כשלונות: ${failedChecks}/${totalChecks}`);
  console.log(`⚠️  אזהרות: ${warningChecks}/${totalChecks}`);
  console.log(`⏱️  זמן כולל: ${Date.now() - monitor.startTime}ms`);
  console.log('\n');
  
  // ניתוח בעיות
  if (failedChecks > 0) {
    console.log('❌ בעיות קריטיות:');
    monitor.errors.forEach(error => {
      console.error(`   - ${error.name}:`, error.details);
    });
    console.log('\n');
  }
  
  if (warningChecks > 0) {
    console.log('⚠️  אזהרות:');
    monitor.warnings.forEach(warning => {
      console.warn(`   - ${warning.name}:`, warning.details);
    });
    console.log('\n');
  }
  
  // המלצות
  console.log('💡 המלצות:');
  const hasData = window.executionsSections34Data?.tradeCreation?.data?.length > 0;
  const hasTableRows = tradeCreationTableBody?.querySelectorAll('tr').length > 0;
  const sectionIsOpen = tradeCreationSection && 
    window.getComputedStyle(tradeCreationSection.querySelector('.section-body')).display !== 'none';
  
  if (hasData && !hasTableRows && sectionIsOpen) {
    console.log('   ⚠️  נתונים קיימים אבל לא מוצגים בטבלה!');
    console.log('   🔍 סיבה אפשרית: initializeTradeCreationClustersSection לא נקרא');
    console.log('   💡 פתרון: בדוק למה checkAndInitialize לא מזהה שהסקשן פתוח');
  } else if (hasData && !hasTableRows && !sectionIsOpen) {
    console.log('   ⚠️  נתונים קיימים אבל הסקשן סגור');
    console.log('   💡 פתרון: פתח את הסקשן ידנית ותבדוק אם הנתונים מוצגים');
  } else if (!hasData) {
    console.log('   ⚠️  אין נתונים מוטענים');
    console.log('   💡 פתרון: בדוק למה preloadSections34Data לא טען נתונים');
  } else if (hasData && hasTableRows) {
    console.log('   ✅ הכל עובד תקין!');
  }
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');
  
  // החזרת תוצאות
  return {
    success: failedChecks === 0,
    summary: {
      total: totalChecks,
      passed: passedChecks,
      failed: failedChecks,
      warnings: warningChecks
    },
    checks: monitor.checks,
    errors: monitor.errors,
    warnings: monitor.warnings,
    timeline: monitor.timeline
  };
})();

















