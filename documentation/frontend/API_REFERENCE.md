# API Reference
# הפניה ל-API

## Overview | סקירה כללית

This document provides a comprehensive reference for all APIs, functions, and configurations available in the Smart Initialization System. It serves as a complete guide for developers working with the system.

מסמך זה מספק הפניה מקיפה לכל ה-APIs, הפונקציות והקונפיגורציות הזמינות במערכת האתחול החכמה. הוא משמש כמדריך מלא למפתחים העובדים עם המערכת.

## Core System APIs | APIs של מערכת הליבה

### Package Registry API | API של מאגר החבילות

#### `SYSTEM_PACKAGES`
Central registry for system packages.

```javascript
// Structure
const SYSTEM_PACKAGES = {
  'package-name': {
    name: 'Package Display Name',
    description: 'Package description',
    systems: ['system1', 'system2'],
    dependencies: ['other-package'],
    criticality: 'high' | 'medium' | 'low',
    version: '1.0.0'
  }
};

// Example
const SYSTEM_PACKAGES = {
  'base': {
    name: 'Base Package',
    description: 'Essential systems required by all pages',
    systems: ['notification', 'preferences', 'storage'],
    dependencies: [],
    criticality: 'high',
    version: '1.0.0'
  }
};
```

#### `getPackage(packageName)`
Get package information by name.

```javascript
// Usage
const packageInfo = SYSTEM_PACKAGES['base'];
console.log(packageInfo.name); // "Base Package"
```

#### `getPackageSystems(packageName)`
Get systems included in a package.

```javascript
// Usage
const systems = SYSTEM_PACKAGES['base'].systems;
console.log(systems); // ['notification', 'preferences', 'storage']
```

### System Dependency Graph API | API של גרף התלויות

#### `SYSTEM_DEPENDENCIES`
Defines explicit dependencies between systems.

```javascript
// Structure
const SYSTEM_DEPENDENCIES = {
  'system-name': {
    dependencies: ['required-system1', 'required-system2'],
    criticality: 'high' | 'medium' | 'low',
    fallback: () => { /* fallback function */ }
  }
};

// Example
const SYSTEM_DEPENDENCIES = {
  'notification': {
    dependencies: ['storage'],
    criticality: 'high',
    fallback: () => console.warn('Notification system fallback activated')
  }
};
```

#### `getSystemDependencies(systemName)`
Get dependencies for a specific system.

```javascript
// Usage
const dependencies = SYSTEM_DEPENDENCIES['notification'].dependencies;
console.log(dependencies); // ['storage']
```

#### `getSystemCriticality(systemName)`
Get criticality level for a system.

```javascript
// Usage
const criticality = SYSTEM_DEPENDENCIES['notification'].criticality;
console.log(criticality); // 'high'
```

### Page Template System API | API של מערכת תבניות העמודים

#### `PAGE_TEMPLATES`
Predefined configurations for common page types.

```javascript
// Structure
const PAGE_TEMPLATES = {
  'template-name': {
    name: 'Template Display Name',
    description: 'Template description',
    packages: ['package1', 'package2'],
    systems: ['system1', 'system2'],
    performance: {
      enableOptimization: true,
      enableCaching: true,
      monitorPerformance: true
    }
  }
};

// Example
const PAGE_TEMPLATES = {
  'standard': {
    name: 'Standard Page',
    description: 'Standard page with basic functionality',
    packages: ['base', 'ui'],
    systems: ['notification', 'preferences'],
    performance: {
      enableOptimization: true,
      enableCaching: true,
      monitorPerformance: true
    }
  }
};
```

#### `getTemplate(templateName)`
Get template configuration by name.

```javascript
// Usage
const template = PAGE_TEMPLATES['standard'];
console.log(template.name); // "Standard Page"
```

#### `getTemplatePackages(templateName)`
Get packages included in a template.

```javascript
// Usage
const packages = PAGE_TEMPLATES['standard'].packages;
console.log(packages); // ['base', 'ui']
```

### Enhanced Feedback System API | API של מערכת המשוב המשופרת

#### `InitializationFeedback`
Provides methods for displaying feedback messages.

```javascript
// Structure
const InitializationFeedback = {
  showSuccess: function(message, details, system),
  showInfo: function(message, details, system),
  showWarning: function(message, details, system, suggestion),
  showError: function({ message, details, system, suggestion, severity, errorObject }),
  _logToUnifiedLog: function(level, message, details, system, suggestion, errorObject)
};
```

#### `showSuccess(message, details, system)`
Display success message to user.

```javascript
// Usage
InitializationFeedback.showSuccess(
  'Page initialized successfully',
  'All systems loaded correctly',
  'Initialization'
);
```

#### `showError({ message, details, system, suggestion, severity, errorObject })`
Display error message to user.

```javascript
// Usage
InitializationFeedback.showError({
  message: 'Initialization failed',
  details: 'System dependency not found',
  system: 'Initialization',
  suggestion: 'Check system dependencies',
  severity: 'error',
  errorObject: error
});
```

## Smart System APIs | APIs של המערכת החכמה

### Smart App Initializer API | API של מאתחל האפליקציה החכם

#### `SmartAppInitializer`
Main initialization orchestrator class.

```javascript
// Constructor
const initializer = new SmartAppInitializer(pageName);

// Methods
await initializer.initialize();
initializer.handleError(error);
initializer.logSuccess(system, message);
initializer.logError(system, level, message, details);
initializer.updateMonitoringDashboard();
```

#### `initialize()`
Initialize the application with the Smart System.

```javascript
// Usage
const initializer = new SmartAppInitializer('your-page');
const success = await initializer.initialize();

if (success) {
  console.log('✅ Initialization successful');
} else {
  console.error('❌ Initialization failed');
}
```

#### `handleError(error)`
Handle initialization errors.

```javascript
// Usage
try {
  await initializer.initialize();
} catch (error) {
  initializer.handleError(error);
}
```

### Smart Script Loader API | API של טוען הסקריפטים החכם

#### `SmartScriptLoader`
Manages dynamic script loading with dependency management.

```javascript
// Methods
await SmartScriptLoader.loadScript(scriptName, isCritical);
await SmartScriptLoader.loadSystemsForPage(systems);
SmartScriptLoader.isScriptLoaded(scriptName);
SmartScriptLoader._reset();
```

#### `loadScript(scriptName, isCritical)`
Load a script dynamically.

```javascript
// Usage
try {
  const script = await SmartScriptLoader.loadScript('notification-system', true);
  console.log('✅ Script loaded successfully');
} catch (error) {
  console.error('❌ Script loading failed:', error);
}
```

#### `loadSystemsForPage(systems)`
Load systems for a specific page.

```javascript
// Usage
const systems = ['notification', 'preferences', 'storage'];
await SmartScriptLoader.loadSystemsForPage(systems);
```

#### `isScriptLoaded(scriptName)`
Check if a script is already loaded.

```javascript
// Usage
const isLoaded = SmartScriptLoader.isScriptLoaded('notification-system');
console.log('Script loaded:', isLoaded);
```

### Smart Page Configurations API | API של קונפיגורציות העמודים החכמות

#### `SmartPageConfigs`
Provides simplified page configuration management.

```javascript
// Methods
SmartPageConfigs.getPageConfig(pageName);
SmartPageConfigs.getAllPageConfigs();
SmartPageConfigs.validateConfig(pageName, config);
```

#### `getPageConfig(pageName)`
Get configuration for a specific page.

```javascript
// Usage
const pageConfig = SmartPageConfigs.getPageConfig('your-page');
console.log('Page configuration:', pageConfig);
```

#### `getAllPageConfigs()`
Get all page configurations.

```javascript
// Usage
const allConfigs = SmartPageConfigs.getAllPageConfigs();
console.log('All configurations:', allConfigs);
```

#### `validateConfig(pageName, config)`
Validate a page configuration.

```javascript
// Usage
const isValid = SmartPageConfigs.validateConfig('your-page', pageConfig);
console.log('Configuration valid:', isValid);
```

## Optimization APIs | APIs של אופטימיזציה

### Performance Optimizer API | API של אופטימיזר הביצועים

#### `InitPerformanceOptimizer`
Monitors and optimizes initialization performance.

```javascript
// Methods
InitPerformanceOptimizer.startMonitoring();
InitPerformanceOptimizer.stopMonitoring();
InitPerformanceOptimizer.getMetrics();
InitPerformanceOptimizer.applyOptimizations();
InitPerformanceOptimizer.resetMetrics();
```

#### `startMonitoring()`
Start performance monitoring.

```javascript
// Usage
InitPerformanceOptimizer.startMonitoring();
console.log('✅ Performance monitoring started');
```

#### `getMetrics()`
Get current performance metrics.

```javascript
// Usage
const metrics = InitPerformanceOptimizer.getMetrics();
console.log('Performance metrics:', metrics);
// Returns: { initializationTime, memoryUsage, scriptLoadTime, cacheHitRate }
```

#### `applyOptimizations()`
Apply performance optimizations.

```javascript
// Usage
await InitPerformanceOptimizer.applyOptimizations();
console.log('✅ Optimizations applied');
```

### Advanced Cache System API | API של מערכת המטמון המתקדמת

#### `InitAdvancedCache`
Optimizes script loading and reduces initialization time.

```javascript
// Methods
await InitAdvancedCache.initialize();
await InitAdvancedCache.set(key, value);
await InitAdvancedCache.get(key);
await InitAdvancedCache.clear();
InitAdvancedCache.getStats();
await InitAdvancedCache.warmCache();
```

#### `set(key, value)`
Store value in cache.

```javascript
// Usage
await InitAdvancedCache.set('user-preferences', { theme: 'dark', language: 'he' });
console.log('✅ Value cached');
```

#### `get(key)`
Retrieve value from cache.

```javascript
// Usage
const preferences = await InitAdvancedCache.get('user-preferences');
console.log('Cached preferences:', preferences);
```

#### `getStats()`
Get cache statistics.

```javascript
// Usage
const stats = InitAdvancedCache.getStats();
console.log('Cache statistics:', stats);
// Returns: { hitRate, missRate, totalEntries, memoryUsage, status }
```

## Testing APIs | APIs של בדיקות

### Testing System API | API של מערכת הבדיקות

#### `InitTestingSystem`
Comprehensive testing framework.

```javascript
// Methods
await InitTestingSystem.initialize();
await InitTestingSystem.runAllTests();
await InitTestingSystem.runUnitTests();
await InitTestingSystem.runIntegrationTests();
await InitTestingSystem.runPerformanceTests();
InitTestingSystem.getTestResults();
InitTestingSystem.generateReport();
```

#### `runAllTests()`
Run all available tests.

```javascript
// Usage
const results = await InitTestingSystem.runAllTests();
console.log('Test results:', results);
// Returns: { success, totalTests, passedTests, failedTests, results }
```

#### `runUnitTests()`
Run unit tests.

```javascript
// Usage
const unitResults = await InitTestingSystem.runUnitTests();
console.log('Unit test results:', unitResults);
```

#### `getTestResults()`
Get latest test results.

```javascript
// Usage
const results = InitTestingSystem.getTestResults();
console.log('Latest test results:', results);
```

## Configuration APIs | APIs של קונפיגורציה

### Page Configuration Structure | מבנה קונפיגורציית עמוד

```javascript
// Complete page configuration structure
const SMART_PAGE_CONFIGS = {
  'page-name': {
    // Basic configuration
    template: 'standard' | 'dashboard' | 'simple' | 'complex' | 'testing',
    packages: ['package1', 'package2'],
    systems: ['system1', 'system2'],
    customInitializers: ['initFunction1', 'initFunction2'],
    lazyLoad: ['system3', 'system4'],
    
    // Performance configuration
    performance: {
      enableOptimization: true | false,
      enableCaching: true | false,
      monitorPerformance: true | false
    },
    
    // Metadata
    metadata: {
      description: 'Page description',
      author: 'Author name',
      version: '1.0.0',
      lastUpdated: '2025-10-19',
      dependencies: ['dependency1', 'dependency2'],
      notes: 'Additional notes'
    }
  }
};
```

### Template Configuration | קונפיגורציית תבנית

```javascript
// Template configuration structure
const PAGE_TEMPLATES = {
  'template-name': {
    name: 'Template Display Name',
    description: 'Template description',
    packages: ['package1', 'package2'],
    systems: ['system1', 'system2'],
    performance: {
      enableOptimization: true | false,
      enableCaching: true | false,
      monitorPerformance: true | false
    }
  }
};
```

### Package Configuration | קונפיגורציית חבילה

```javascript
// Package configuration structure
const SYSTEM_PACKAGES = {
  'package-name': {
    name: 'Package Display Name',
    description: 'Package description',
    systems: ['system1', 'system2'],
    dependencies: ['other-package'],
    criticality: 'high' | 'medium' | 'low',
    version: '1.0.0'
  }
};
```

### System Dependency Configuration | קונפיגורציית תלות מערכת

```javascript
// System dependency configuration structure
const SYSTEM_DEPENDENCIES = {
  'system-name': {
    dependencies: ['required-system1', 'required-system2'],
    criticality: 'high' | 'medium' | 'low',
    fallback: () => { /* fallback function */ }
  }
};
```

## System Management APIs | APIs של ניהול המערכת

### System Management Dashboard API | API של דשבורד ניהול המערכת

#### `SystemManagement`
Provides system management and monitoring functions.

```javascript
// Methods
SystemManagement.refreshInitializationData();
SystemManagement.updateOptimizationProgress();
SystemManagement.updateSystemComponents();
SystemManagement.updateInitializationStats();
SystemManagement.updateChangesLog();
SystemManagement.validateInitializationSystem();
SystemManagement.initializeInitializationMonitoring();
SystemManagement.updateTestingSystemStatus();
SystemManagement.runComprehensiveTesting();
SystemManagement.validateTestingSystem();
```

#### `validateInitializationSystem()`
Validate the initialization system.

```javascript
// Usage
const validationResults = SystemManagement.validateInitializationSystem();
console.log('Validation results:', validationResults);
// Returns: { unifiedInitializer, pageConfigs, notificationSystem, cacheSystem, headerSystem }
```

#### `runComprehensiveTesting()`
Run comprehensive system tests.

```javascript
// Usage
const testResults = await SystemManagement.runComprehensiveTesting();
console.log('Test results:', testResults);
```

## Error Handling APIs | APIs של טיפול בשגיאות

### Error Object Structure | מבנה אובייקט שגיאה

```javascript
// Error object structure
const errorObject = {
  message: 'Error message',
  details: 'Error details',
  system: 'System name',
  suggestion: 'Suggested solution',
  severity: 'error' | 'warning' | 'info',
  errorObject: originalError
};
```

### Error Handling Methods | שיטות טיפול בשגיאות

```javascript
// Error handling in SmartAppInitializer
initializer.handleError(error);
initializer.logError(system, level, message, details);
initializer.logSuccess(system, message);
initializer.logWarning(system, message, details);
```

## Performance Monitoring APIs | APIs של ניטור ביצועים

### Performance Metrics Structure | מבנה מדדי ביצועים

```javascript
// Performance metrics structure
const performanceMetrics = {
  initializationTime: 2500, // milliseconds
  memoryUsage: 45.2,        // MB
  scriptLoadTime: 1200,     // milliseconds
  cacheHitRate: 85.5,       // percentage
  totalSystems: 12,
  loadedSystems: 10,
  failedSystems: 0
};
```

### Cache Statistics Structure | מבנה סטטיסטיקות מטמון

```javascript
// Cache statistics structure
const cacheStats = {
  hitRate: 85.5,        // percentage
  missRate: 14.5,       // percentage
  totalEntries: 150,    // number
  memoryUsage: 12.3,    // MB
  status: 'active'      // 'active' | 'inactive' | 'error'
};
```

## Testing Results APIs | APIs של תוצאות בדיקות

### Test Results Structure | מבנה תוצאות בדיקות

```javascript
// Test results structure
const testResults = {
  success: true,           // boolean
  totalTests: 15,          // number
  passedTests: 14,         // number
  failedTests: 1,          // number
  results: [               // array of test results
    {
      name: 'test-name',
      status: 'passed' | 'failed',
      duration: 150,       // milliseconds
      message: 'Test message',
      details: 'Test details'
    }
  ]
};
```

## Usage Examples | דוגמאות שימוש

### Basic Page Initialization | אתחול עמוד בסיסי

```javascript
// Basic page initialization
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const initializer = new SmartAppInitializer('your-page');
    const success = await initializer.initialize();
    
    if (success) {
      console.log('✅ Page initialized successfully');
    } else {
      console.error('❌ Page initialization failed');
    }
  } catch (error) {
    console.error('❌ Initialization error:', error);
  }
});
```

### Advanced Page Configuration | קונפיגורציית עמוד מתקדמת

```javascript
// Advanced page configuration
const SMART_PAGE_CONFIGS = {
  'advanced-page': {
    template: 'complex',
    packages: ['base', 'ui', 'crud'],
    systems: ['notification', 'preferences', 'tables'],
    customInitializers: ['initAdvancedPage', 'initCustomFeatures'],
    lazyLoad: ['graphs', 'advanced-ui', 'testing'],
    performance: {
      enableOptimization: true,
      enableCaching: true,
      monitorPerformance: true
    },
    metadata: {
      description: 'Advanced page with multiple features',
      author: 'Development Team',
      version: '1.0.0',
      lastUpdated: '2025-10-19'
    }
  }
};
```

### Performance Monitoring | ניטור ביצועים

```javascript
// Performance monitoring
if (window.InitPerformanceOptimizer) {
  // Start monitoring
  InitPerformanceOptimizer.startMonitoring();
  
  // Get metrics
  const metrics = InitPerformanceOptimizer.getMetrics();
  console.log('Performance metrics:', metrics);
  
  // Apply optimizations
  await InitPerformanceOptimizer.applyOptimizations();
  
  // Stop monitoring
  InitPerformanceOptimizer.stopMonitoring();
}
```

### Cache Management | ניהול מטמון

```javascript
// Cache management
if (window.InitAdvancedCache) {
  // Initialize cache
  await InitAdvancedCache.initialize();
  
  // Store data
  await InitAdvancedCache.set('user-data', { name: 'John', age: 30 });
  
  // Retrieve data
  const userData = await InitAdvancedCache.get('user-data');
  console.log('User data:', userData);
  
  // Get statistics
  const stats = InitAdvancedCache.getStats();
  console.log('Cache statistics:', stats);
}
```

### Comprehensive Testing | בדיקות מקיפות

```javascript
// Comprehensive testing
if (window.InitTestingSystem) {
  // Run all tests
  const results = await InitTestingSystem.runAllTests();
  console.log('Test results:', results);
  
  // Run specific test types
  const unitResults = await InitTestingSystem.runUnitTests();
  const integrationResults = await InitTestingSystem.runIntegrationTests();
  const performanceResults = await InitTestingSystem.runPerformanceTests();
  
  // Generate report
  const report = InitTestingSystem.generateReport();
  console.log('Test report:', report);
}
```

## Best Practices | שיטות עבודה מומלצות

### 1. Error Handling | טיפול בשגיאות

```javascript
// Always wrap initialization in try-catch
try {
  const initializer = new SmartAppInitializer('your-page');
  const success = await initializer.initialize();
  
  if (success) {
    console.log('✅ Initialization successful');
  } else {
    console.error('❌ Initialization failed');
  }
} catch (error) {
  console.error('❌ Initialization error:', error);
  // Handle error appropriately
}
```

### 2. Performance Monitoring | ניטור ביצועים

```javascript
// Enable performance monitoring
const SMART_PAGE_CONFIGS = {
  'your-page': {
    template: 'standard',
    packages: ['base', 'ui'],
    systems: ['notification', 'preferences'],
    performance: {
      enableOptimization: true,
      enableCaching: true,
      monitorPerformance: true
    }
  }
};
```

### 3. Testing | בדיקות

```javascript
// Run tests after initialization
const initializer = new SmartAppInitializer('your-page');
const success = await initializer.initialize();

if (success && window.InitTestingSystem) {
  const testResults = await InitTestingSystem.runAllTests();
  if (!testResults.success) {
    console.warn('⚠️ Some tests failed:', testResults.failedTests);
  }
}
```

---

*This API reference is part of the TikTrack Smart Initialization System. For the latest updates and information, visit the System Management dashboard.*

*הפניה זו ל-API היא חלק ממערכת האתחול החכמה של TikTrack. לעדכונים ומידע אחרון, בקר בדשבורד ניהול המערכת.*
