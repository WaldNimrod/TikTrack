# Dependency Analyzer Guide - TikTrack

## סקירה כללית

**Dependency Analyzer Guide** מספק הדרכה מקיפה לשימוש בכלי ניתוח התלויות של TikTrack. הכלי מנתח את התלויות בין מודולים, קבצים ורכיבים במערכת ומספק תובנות לביצועים ולתחזוקה.

## מטרות הכלי

### 1. ניתוח ביצועים

- זיהוי bottlenecks בתלויות
- אופטימיזציה של טעינת משאבים
- הפחתת bundle size

### 2. תחזוקה

- זיהוי circular dependencies
- מציאת unused dependencies
- שיפור code organization

### 3. איכות קוד

- אימות dependency injection
- בדיקת coupling levels
- שיפור modularity

## ארכיטקטורה

### רכיבי הליבה

#### 1. DependencyScanner

- **תפקיד:** סריקה של קבצי JavaScript וניתוח imports/exports
- **פלט:** dependency graph של כל המודולים
- **אלגוריתם:** AST parsing עם esprima

#### 2. BundleAnalyzer

- **תפקיד:** ניתוח גודל bundles וחלוקת משאבים
- **פלט:** דוח מפורט על bundle composition
- **כלים:** webpack-bundle-analyzer integration

#### 3. CircularDependencyDetector

- **תפקיד:** זיהוי circular dependencies במערכת
- **פלט:** רשימת מחזורים עם נתיבים
- **אלגוריתם:** graph traversal עם cycle detection

#### 4. UsageAnalyzer

- **תפקיד:** ניתוח שימוש ב-dependencies
- **פלט:** unused/duplicate dependencies
- **שיטה:** static analysis + runtime tracking

### זרימת ניתוח

```javascript
// Complete dependency analysis flow
async function analyzeDependencies() {
  // 1. Scan all JavaScript files
  const files = await DependencyScanner.scan('trading-ui/scripts/');

  // 2. Build dependency graph
  const graph = DependencyScanner.buildGraph(files);

  // 3. Detect circular dependencies
  const circularDeps = CircularDependencyDetector.findCycles(graph);

  // 4. Analyze bundle sizes
  const bundleStats = await BundleAnalyzer.analyze();

  // 5. Generate reports
  const report = {
    circularDependencies: circularDeps,
    bundleStats: bundleStats,
    recommendations: generateRecommendations(graph, bundleStats)
  };

  return report;
}
```

## שימוש בכלי

### סריקה בסיסית

```bash
# Scan all dependencies
npm run analyze:dependencies

# Scan specific directory
npm run analyze:dependencies -- --path trading-ui/scripts/services/

# Generate HTML report
npm run analyze:dependencies -- --report html
```

### ניתוח מעמיק

```bash
# Include bundle analysis
npm run analyze:full

# Check for unused dependencies
npm run analyze:unused

# Detect circular dependencies
npm run analyze:circular
```

### CI/CD Integration

```yaml
# GitHub Actions workflow
- name: Dependency Analysis
  run: npm run analyze:dependencies
- name: Bundle Size Check
  run: npm run analyze:bundle
  # Fail if bundle > 500KB
```

## סוגי ניתוח

### 1. Static Analysis

ניתוח קוד סטטי ללא הרצה

```javascript
// Static dependency scanning
const staticAnalysis = {
  imports: scanImports(file),
  exports: scanExports(file),
  dependencies: extractDependencies(file),
  unused: findUnusedImports(file)
};
```

### 2. Dynamic Analysis

ניתוח בזמן ריצה עם instrumentation

```javascript
// Runtime dependency tracking
window.DependencyTracker = {
  loadedModules: new Set(),
  loadOrder: [],

  track(moduleName) {
    this.loadedModules.add(moduleName);
    this.loadOrder.push({
      name: moduleName,
      timestamp: Date.now(),
      dependencies: this.getModuleDependencies(moduleName)
    });
  }
};
```

### 3. Bundle Analysis

ניתוח גודל וחלוקת bundles

```javascript
// Bundle composition analysis
const bundleAnalysis = {
  totalSize: calculateTotalSize(),
  chunks: analyzeChunks(),
  duplicates: findDuplicateModules(),
  treeShaking: analyzeTreeShaking()
};
```

## דוחות ותובנות

### Dependency Graph Report

```json
{
  "modules": {
    "UnifiedTableSystem": {
      "dependencies": ["CacheManager", "EventManager"],
      "dependents": ["TradesPage", "PortfolioPage"],
      "size": "45KB",
      "loadTime": "120ms"
    }
  },
  "circularDependencies": [],
  "optimizationOpportunities": [
    {
      "type": "lazyLoading",
      "module": "ChartLibrary",
      "saving": "30KB"
    }
  ]
}
```

### Bundle Analysis Report

```json
{
  "totalSize": "425KB",
  "chunks": [
    {
      "name": "core",
      "size": "150KB",
      "modules": 25
    },
    {
      "name": "trading",
      "size": "180KB",
      "modules": 35
    },
    {
      "name": "analytics",
      "size": "95KB",
      "modules": 15
    }
  ],
  "recommendations": [
    "Consider code splitting for analytics modules",
    "Remove unused Chart.js components"
  ]
}
```

## אופטימיזציות נפוצות

### Code Splitting

```javascript
// Dynamic imports for code splitting
const loadAnalytics = () => import('./analytics.js');
const loadCharts = () => import('./charts.js');

// Route-based splitting
const routes = {
  '/trades': () => import('./pages/trades.js'),
  '/analytics': () => import('./pages/analytics.js')
};
```

### Lazy Loading

```javascript
// Component lazy loading
const LazyTable = lazy(() => import('./UnifiedTableSystem'));

// With fallback
<Suspense fallback={<div>Loading...</div>}>
  <LazyTable data={data} />
</Suspense>
```

### Tree Shaking Optimization

```javascript
// Named exports for better tree shaking
export { UnifiedTableSystem, FilterSystem, SortSystem };

// Avoid default exports for libraries
import { render } from 'react'; // Good
import React from 'react'; // Avoid if possible
```

### Bundle Size Reduction

```javascript
// Remove unused code
const usedIcons = ['check', 'close', 'edit'];
const icons = pick(IconLibrary, usedIcons); // Instead of importing all

// Compress assets
import compressedImage from './logo.png?compress';
```

## תרחישי שימוש

### ניתוח ביצועים

```javascript
// Performance analysis workflow
async function analyzePerformance() {
  // 1. Measure current load times
  const baseline = await measureLoadTime();

  // 2. Analyze dependencies
  const analysis = await DependencyAnalyzer.analyze();

  // 3. Identify bottlenecks
  const bottlenecks = analysis.modules.filter(m => m.loadTime > 200);

  // 4. Generate optimization plan
  const optimizations = generateOptimizations(bottlenecks);

  return {
    baseline,
    bottlenecks,
    optimizations,
    expectedImprovement: calculateImprovement(optimizations)
  };
}
```

### תחזוקת קוד

```javascript
// Code maintenance workflow
async function maintenanceCheck() {
  // 1. Find circular dependencies
  const circular = await CircularDependencyDetector.scan();

  // 2. Identify unused code
  const unused = await UsageAnalyzer.findUnused();

  // 3. Check coupling levels
  const coupling = await CouplingAnalyzer.measure();

  // 4. Generate refactoring suggestions
  const suggestions = generateRefactoringSuggestions({
    circular,
    unused,
    coupling
  });

  return suggestions;
}
```

## שילוב עם כלים אחרים

### עם Linter

```javascript
// ESLint plugin for dependency rules
module.exports = {
  rules: {
    'no-circular-dependencies': 'error',
    'max-dependencies': ['warn', { max: 10 }],
    'no-unused-dependencies': 'error'
  }
};
```

### עם Bundler

```javascript
// Webpack configuration
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors'
        }
      }
    }
  },
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

### עם CI/CD

```yaml
# Dependency check in pipeline
stages:
  - test
  - analyze

analyze_dependencies:
  stage: analyze
  script:
    - npm run analyze:dependencies
    - npm run analyze:bundle
  artifacts:
    reports:
      dependency_scanning: gl-dependency-scanning-report.json
```

## טיפים לשימוש יעיל

### 1. הפעלה תדירה

- הרץ analysis לפני כל release
- כלול ב-CI pipeline
- נטר שינויים לאורך זמן

### 2. פרשנות תוצאות

- התמקד בבקבוקי צוואר קריטיים
- אל תנסה לייעל הכל בבת אחת
- שקול trade-offs (size vs performance)

### 3. שיתוף תובנות

- שתף דוחות עם הצוות
- דון באופטימיזציות מוצעות
- עקב אחר הטמעת שיפורים

### 4. מדידת הצלחה

- עקב אחר bundle size לאורך זמן
- מדוד load time improvements
- נטר code quality metrics

---

**גרסה:** 1.0.0
**תאריך:** 1 בינואר 2026
**סטטוס:** ✅ פעיל ומתועד
