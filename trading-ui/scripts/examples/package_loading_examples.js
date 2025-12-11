/**
 * דוגמאות להוספת חבילות לעמודים - הדרך הנכונה והשגויה
 *
 * לקח חשוב: תמיד ודא ש-script tags קיימים ב-HTML!
 * ========================================================
 */

/**
 * ✅ דוגמה נכונה: הוספת חבילה חדשה לעמוד
 *
 * שלב 1: הגדרה ב-package-manifest.js
 */
const correctPackageDefinition = {
  'my-feature': {
    id: 'my-feature',
    name: 'My Feature Package',
    description: 'Amazing new feature for pages',
    version: '1.0.0',
    critical: false,
    loadOrder: 25.0, // אחרי כל החבילות הקיימות
    dependencies: ['base', 'services'],
    loadingStrategy: 'defer',
    scripts: [
      {
        file: 'my-feature.js',
        globalCheck: 'window.MyFeature',
        description: 'Core feature functionality',
        required: true,
        loadOrder: 1
      }
    ]
  }
};

/**
 * שלב 2: הוספה ל-page-initialization-configs.js
 */
const correctPageConfig = {
  'my-page': {
    name: 'My Page',
    packages: [
      'base', 'services', 'ui-advanced', 'crud',
      'my-feature'  // ✅ חבילה חדשה נוספה!
    ],
    requiredGlobals: [
      'window.UnifiedAppInitializer',
      'window.MyFeature'  // ✅ Global נוסף!
    ]
  }
};

/**
 * שלב 3: הוספת script tags ל-HTML (השלב הכי חשוב!)
 */
const correctHtmlSnippet = `
<!-- [25.0] Load Order: 25.0 | Strategy: defer -->
<script src="../../scripts/my-feature.js?v=1.0.0" defer></script> <!-- My Feature Package -->
`;

/**
 * ❌ דוגמה שגויה: חבילה ללא script tags ב-HTML
 *
 * זה גורם לשגיאה: "Missing required globals for my-page"
 */
const wrongPageConfig = {
  'my-page': {
    packages: [
      'base', 'services', 'ui-advanced', 'crud',
      'my-feature'  // ✅ חבילה מוגדרת נכון
    ],
    requiredGlobals: [
      'window.UnifiedAppInitializer',
      'window.MyFeature'  // ✅ Global מוגדר נכון
    ]
  }
};

// אבל ב-HTML חסרים ה-script tags!
// ❌ שגיאה: my-page.html לא מכיל:
// <script src="../../scripts/my-feature.js?v=1.0.0" defer></script>

/**
 * 🔍 איך לבדוק אם הכל בסדר
 */

// פונקציית בדיקה פשוטה
function checkPackageLoading(packageName) {
  const manifest = window.PACKAGE_MANIFEST?.[packageName];
  const inPageConfig = window.PAGE_CONFIGS?.[window.currentPage]?.packages?.includes(packageName);
  const scriptInDom = !!document.querySelector(`script[src*="${packageName}"]`);
  const globalAvailable = !!window[packageName.replace('-', '').toUpperCase()];

  console.log(`Package ${packageName} check:`, {
    manifest: !!manifest,
    inPageConfig: inPageConfig,
    scriptInDom: scriptInDom,
    globalAvailable: globalAvailable,
    allGood: manifest && inPageConfig && scriptInDom && globalAvailable
  });

  return {
    manifest: !!manifest,
    inPageConfig: inPageConfig,
    scriptInDom: scriptInDom,
    globalAvailable: globalAvailable,
    allGood: manifest && inPageConfig && scriptInDom && globalAvailable
  };
}

// שימוש:
// checkPackageLoading('my-feature');
// checkPackageLoading('info-summary'); // הדוגמה שלנו

/**
 * 📚 כלל הזהב:
 *
 * "package-manifest.js מגדיר WHAT לטעון,
 * אבל HTML מגדיר WHERE לטען אותו"
 *
 * תמיד בדוק את השלושה:
 * 1. package-manifest.js (הגדרת חבילה)
 * 2. page-initialization-configs.js (שיוך לעמוד)
 * 3. HTML file (טעינת סקריפט)
 */

/**
 * 🚨 תזכורת למפתחים עתידיים:
 *
 * אם אתה רואה שגיאה "Missing required globals for [page-name]",
 * זה אומר שחבילה מוגדרת אבל script tags חסרים מה-HTML!
 *
 * הפתרון: הוסף את ה-script tags ל-HTML בקבצים הנכונים.
 */
