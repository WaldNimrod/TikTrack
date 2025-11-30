/**
 * Modal Navigation System E2E Test
 * ==================================
 * 
 * בדיקות E2E מקיפות למערכת Modal Navigation System
 * 
 * בודק:
 * 1. פתיחת מודל ראשי
 * 2. פתיחת מודל מקונן מתוך מודל ראשי
 * 3. בדיקת breadcrumb במודל מקונן
 * 4. בדיקת כפתור חזרה במודל מקונן
 * 5. בדיקת חזרה למודל הקודם
 * 6. בדיקת סגירה נכונה
 * 
 * שימוש:
 * בדפדפן: <script src="scripts/modal-navigation-e2e-test.js"></script>
 * ואז: window.runModalNavigationE2ETests()
 */

(function() {
  'use strict';

  // תוצאות הבדיקות
  const testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  /**
   * בדיקת פתיחת מודל ראשי
   */
  async function testOpenPrimaryModal() {
    const testName = 'פתיחת מודל ראשי';
    try {
      // בדיקה שהמערכת זמינה
      if (!window.ModalNavigationService) {
        throw new Error('ModalNavigationService לא זמין');
      }

      // בדיקה שהמערכת מאותחלת
      await window.ModalNavigationService.init();

      // בדיקה שהמערכת ריקה
      const stack = window.ModalNavigationService.getStack();
      if (stack.length > 0) {
        // ניקוי stack קיים
        await window.ModalNavigationService.clear();
      }

      // פתיחת מודל ראשי (דוגמה - modal עריכה)
      // זה לא צריך להירשם במערכת כי זה מודל ראשי
      const testModalId = 'testPrimaryModal';
      const testModal = document.createElement('div');
      testModal.id = testModalId;
      testModal.className = 'modal';
      testModal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">מודל ראשי</h5>
            </div>
            <div class="modal-body">
              <p>זהו מודל ראשי</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(testModal);

      // בדיקה שהמערכת עדיין ריקה (מודל ראשי לא נרשם)
      const stackAfter = window.ModalNavigationService.getStack();
      if (stackAfter.length !== 0) {
        throw new Error(`מודל ראשי נרשם במערכת (צריך להיות 0, נמצא: ${stackAfter.length})`);
      }

      // ניקוי
      testModal.remove();

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'מודל ראשי לא נרשם במערכת (נכון)' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת פתיחת מודל מקונן
   */
  async function testOpenNestedModal() {
    const testName = 'פתיחת מודל מקונן';
    try {
      if (!window.ModalNavigationService) {
        throw new Error('ModalNavigationService לא זמין');
      }

      await window.ModalNavigationService.init();
      await window.ModalNavigationService.clear();

      // יצירת מודל ראשי (מדומה)
      const primaryModal = document.createElement('div');
      primaryModal.id = 'testPrimaryModal';
      primaryModal.className = 'modal';
      document.body.appendChild(primaryModal);

      // רישום מודל ראשי ידנית (כדי לבדוק מודל מקונן)
      await window.ModalNavigationService.registerModalOpen(primaryModal, {
        modalId: 'testPrimaryModal',
        modalType: 'crud-modal',
        entityType: 'test',
        title: 'מודל ראשי'
      });

      // בדיקה שיש stack
      const stackBefore = window.ModalNavigationService.getStack();
      if (stackBefore.length !== 1) {
        throw new Error(`Stack צריך להיות 1, נמצא: ${stackBefore.length}`);
      }

      // יצירת מודל מקונן
      const nestedModal = document.createElement('div');
      nestedModal.id = 'testNestedModal';
      nestedModal.className = 'modal';
      document.body.appendChild(nestedModal);

      // רישום מודל מקונן
      await window.ModalNavigationService.registerModalOpen(nestedModal, {
        modalId: 'testNestedModal',
        modalType: 'entity-details',
        entityType: 'test',
        title: 'מודל מקונן'
      });

      // בדיקה שיש 2 מודלים ב-stack
      const stackAfter = window.ModalNavigationService.getStack();
      if (stackAfter.length !== 2) {
        throw new Error(`Stack צריך להיות 2, נמצא: ${stackAfter.length}`);
      }

      // בדיקה שהמודל הפעיל הוא המוקדם
      const activeEntry = window.ModalNavigationService.getActiveEntry();
      if (activeEntry.modalId !== 'testNestedModal') {
        throw new Error(`המודל הפעיל צריך להיות testNestedModal, נמצא: ${activeEntry.modalId}`);
      }

      // ניקוי
      await window.ModalNavigationService.clear();
      primaryModal.remove();
      nestedModal.remove();

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'מודל מקונן נרשם נכון במערכת' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת breadcrumb במודל מקונן
   */
  async function testBreadcrumb() {
    const testName = 'בדיקת breadcrumb במודל מקונן';
    try {
      if (!window.ModalNavigationService || !window.modalNavigationManager) {
        throw new Error('ModalNavigationService או modalNavigationManager לא זמין');
      }

      await window.ModalNavigationService.init();
      await window.ModalNavigationService.clear();

      // יצירת מודלים
      const primaryModal = document.createElement('div');
      primaryModal.id = 'testPrimaryModal';
      primaryModal.className = 'modal';
      primaryModal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">מודל ראשי</h5>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(primaryModal);

      const nestedModal = document.createElement('div');
      nestedModal.id = 'testNestedModal';
      nestedModal.className = 'modal';
      nestedModal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">מודל מקונן</h5>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(nestedModal);

      // רישום מודלים
      await window.ModalNavigationService.registerModalOpen(primaryModal, {
        modalId: 'testPrimaryModal',
        modalType: 'crud-modal',
        title: 'מודל ראשי'
      });

      await window.ModalNavigationService.registerModalOpen(nestedModal, {
        modalId: 'testNestedModal',
        modalType: 'entity-details',
        title: 'מודל מקונן'
      });

      // עדכון UI
      if (window.modalNavigationManager.updateModalNavigation) {
        window.modalNavigationManager.updateModalNavigation(nestedModal);
      }

      // בדיקת breadcrumb
      const breadcrumb = window.modalNavigationManager.getBreadcrumb(nestedModal);
      if (!breadcrumb || breadcrumb.trim() === '') {
        throw new Error('Breadcrumb לא נוצר');
      }

      // בדיקה שיש 2 פריטים ב-breadcrumb
      const breadcrumbItems = breadcrumb.match(/breadcrumb-item/g);
      if (!breadcrumbItems || breadcrumbItems.length < 2) {
        throw new Error(`Breadcrumb צריך להכיל לפחות 2 פריטים, נמצא: ${breadcrumbItems ? breadcrumbItems.length : 0}`);
      }

      // ניקוי
      await window.ModalNavigationService.clear();
      primaryModal.remove();
      nestedModal.remove();

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'Breadcrumb נוצר נכון' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת כפתור חזרה
   */
  async function testBackButton() {
    const testName = 'בדיקת כפתור חזרה';
    try {
      if (!window.ModalNavigationService || !window.modalNavigationManager) {
        throw new Error('ModalNavigationService או modalNavigationManager לא זמין');
      }

      await window.ModalNavigationService.init();
      await window.ModalNavigationService.clear();

      // יצירת מודלים
      const primaryModal = document.createElement('div');
      primaryModal.id = 'testPrimaryModal';
      primaryModal.className = 'modal';
      primaryModal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">מודל ראשי</h5>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(primaryModal);

      const nestedModal = document.createElement('div');
      nestedModal.id = 'testNestedModal';
      nestedModal.className = 'modal';
      nestedModal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">מודל מקונן</h5>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(nestedModal);

      // רישום מודלים
      await window.ModalNavigationService.registerModalOpen(primaryModal, {
        modalId: 'testPrimaryModal',
        modalType: 'crud-modal',
        title: 'מודל ראשי'
      });

      await window.ModalNavigationService.registerModalOpen(nestedModal, {
        modalId: 'testNestedModal',
        modalType: 'entity-details',
        title: 'מודל מקונן'
      });

      // עדכון UI
      if (window.modalNavigationManager.updateModalNavigation) {
        window.modalNavigationManager.updateModalNavigation(nestedModal);
      }

      // בדיקת כפתור חזרה
      const backButton = nestedModal.querySelector('[data-button-type="BACK"]') ||
                        nestedModal.querySelector('.modal-back-btn') ||
                        nestedModal.querySelector('#entityDetailsBackBtn');

      if (!backButton) {
        throw new Error('כפתור חזרה לא נוצר');
      }

      // בדיקה שהכפתור לא מוסתר
      if (backButton.style.display === 'none' || backButton.style.visibility === 'hidden') {
        throw new Error('כפתור חזרה מוסתר (לא צריך להיות)');
      }

      // בדיקה שהכפתור לא disabled
      if (backButton.disabled) {
        throw new Error('כפתור חזרה disabled (לא צריך להיות)');
      }

      // ניקוי
      await window.ModalNavigationService.clear();
      primaryModal.remove();
      nestedModal.remove();

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'כפתור חזרה נוצר נכון' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת חזרה למודל הקודם
   */
  async function testGoBack() {
    const testName = 'בדיקת חזרה למודל הקודם';
    try {
      if (!window.ModalNavigationService) {
        throw new Error('ModalNavigationService לא זמין');
      }

      await window.ModalNavigationService.init();
      await window.ModalNavigationService.clear();

      // יצירת מודלים
      const primaryModal = document.createElement('div');
      primaryModal.id = 'testPrimaryModal';
      primaryModal.className = 'modal';
      document.body.appendChild(primaryModal);

      const nestedModal = document.createElement('div');
      nestedModal.id = 'testNestedModal';
      nestedModal.className = 'modal';
      document.body.appendChild(nestedModal);

      // רישום מודלים
      await window.ModalNavigationService.registerModalOpen(primaryModal, {
        modalId: 'testPrimaryModal',
        modalType: 'crud-modal',
        title: 'מודל ראשי'
      });

      const nestedEntry = await window.ModalNavigationService.registerModalOpen(nestedModal, {
        modalId: 'testNestedModal',
        modalType: 'entity-details',
        title: 'מודל מקונן'
      });

      // בדיקה שיש 2 מודלים
      const stackBefore = window.ModalNavigationService.getStack();
      if (stackBefore.length !== 2) {
        throw new Error(`Stack צריך להיות 2, נמצא: ${stackBefore.length}`);
      }

      // בדיקה שהמודל הפעיל הוא המוקדם
      const activeBefore = window.ModalNavigationService.getActiveEntry();
      if (activeBefore.modalId !== 'testNestedModal') {
        throw new Error(`המודל הפעיל צריך להיות testNestedModal, נמצא: ${activeBefore.modalId}`);
      }

      // חזרה למודל הקודם
      const canGoBack = window.ModalNavigationService.canGoBack();
      if (!canGoBack) {
        throw new Error('canGoBack() החזיר false (צריך להיות true)');
      }

      const goBackResult = await window.ModalNavigationService.goBack();
      if (!goBackResult) {
        throw new Error('goBack() החזיר false (צריך להיות true)');
      }

      // בדיקה שהמודל הפעיל הוא הראשי
      const activeAfter = window.ModalNavigationService.getActiveEntry();
      if (activeAfter.modalId !== 'testPrimaryModal') {
        throw new Error(`המודל הפעיל צריך להיות testPrimaryModal, נמצא: ${activeAfter.modalId}`);
      }

      // ניקוי
      await window.ModalNavigationService.clear();
      primaryModal.remove();
      nestedModal.remove();

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'חזרה למודל הקודם עובדת נכון' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת סגירה נכונה
   */
  async function testCloseRegistration() {
    const testName = 'בדיקת רישום סגירה';
    try {
      if (!window.ModalNavigationService) {
        throw new Error('ModalNavigationService לא זמין');
      }

      await window.ModalNavigationService.init();
      await window.ModalNavigationService.clear();

      // יצירת מודל
      const testModal = document.createElement('div');
      testModal.id = 'testModal';
      testModal.className = 'modal';
      document.body.appendChild(testModal);

      // רישום מודל
      const entry = await window.ModalNavigationService.registerModalOpen(testModal, {
        modalId: 'testModal',
        modalType: 'crud-modal',
        title: 'מודל בדיקה'
      });

      // בדיקה שהמודל נרשם
      const stackBefore = window.ModalNavigationService.getStack();
      if (stackBefore.length !== 1) {
        throw new Error(`Stack צריך להיות 1, נמצא: ${stackBefore.length}`);
      }

      // רישום סגירה
      await window.ModalNavigationService.registerModalClose('testModal', { instanceId: entry.instanceId });

      // בדיקה שהמודל הוסר
      const stackAfter = window.ModalNavigationService.getStack();
      if (stackAfter.length !== 0) {
        throw new Error(`Stack צריך להיות 0 אחרי סגירה, נמצא: ${stackAfter.length}`);
      }

      // ניקוי
      testModal.remove();

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'רישום סגירה עובד נכון' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת stack רק למודלים מקוננים
   */
  async function testStackOnlyForNested() {
    const testName = 'בדיקת stack רק למודלים מקוננים';
    try {
      if (!window.ModalNavigationService) {
        throw new Error('ModalNavigationService לא זמין');
      }

      await window.ModalNavigationService.init();
      await window.ModalNavigationService.clear();

      // בדיקה שהמערכת ריקה
      const stackBefore = window.ModalNavigationService.getStack();
      if (stackBefore.length !== 0) {
        throw new Error(`Stack צריך להיות ריק, נמצא: ${stackBefore.length}`);
      }

      // יצירת מודל ראשי (לא צריך להירשם)
      const primaryModal = document.createElement('div');
      primaryModal.id = 'testPrimaryModal';
      primaryModal.className = 'modal';
      document.body.appendChild(primaryModal);

      // בדיקה שהמערכת עדיין ריקה
      const stackAfter = window.ModalNavigationService.getStack();
      if (stackAfter.length !== 0) {
        throw new Error(`Stack צריך להיות ריק גם אחרי יצירת מודל ראשי, נמצא: ${stackAfter.length}`);
      }

      // ניקוי
      primaryModal.remove();

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'מודלים ראשיים לא נרשמים במערכת' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * הרצת כל הבדיקות
   */
  async function runModalNavigationE2ETests() {
    console.log('🧪 Starting Modal Navigation System E2E Tests...\n');

    // איפוס תוצאות
    testResults.passed = 0;
    testResults.failed = 0;
    testResults.errors = [];
    testResults.details = [];

    // הרצת בדיקות
    await testOpenPrimaryModal();
    await testOpenNestedModal();
    await testBreadcrumb();
    await testBackButton();
    await testGoBack();
    await testCloseRegistration();
    await testStackOnlyForNested();

    // סיכום
    const total = testResults.passed + testResults.failed;
    const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;

    console.log('\n📊 Test Results:');
    console.log(`  ✅ Passed: ${testResults.passed}`);
    console.log(`  ❌ Failed: ${testResults.failed}`);
    console.log(`  📈 Success Rate: ${successRate}%`);
    console.log(`  📝 Total: ${total}`);

    if (testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      testResults.errors.forEach(({ test, error }) => {
        console.log(`  - ${test}: ${error}`);
      });
    }

    if (testResults.details.length > 0) {
      console.log('\n📋 Details:');
      testResults.details.forEach(({ test, status, message }) => {
        const icon = status === 'passed' ? '✅' : '❌';
        console.log(`  ${icon} ${test}: ${message}`);
      });
    }

    return {
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate),
      errors: testResults.errors,
      details: testResults.details
    };
  }

  // הוספה ל-window
  if (typeof window !== 'undefined') {
    window.runModalNavigationE2ETests = runModalNavigationE2ETests;
    console.log('✅ Modal Navigation E2E Test loaded. Run: window.runModalNavigationE2ETests()');
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runModalNavigationE2ETests };
  }
})();

