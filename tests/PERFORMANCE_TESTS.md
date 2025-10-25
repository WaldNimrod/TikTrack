# בדיקות ביצועים - TikTrack
## Performance Tests

### 📋 **מטרה**

בדיקות ביצועים בודקות את הביצועים של המערכת תחת עומסים שונים.

### 🎯 **מדדי ביצועים**

#### 1. **Page Load Time**
```javascript
describe('Page Load Performance', () => {
  test('should load index page within 2 seconds', async () => {
    const startTime = Date.now();
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000); // < 2 seconds
  });
  
  test('should load trades page within 3 seconds', async () => {
    const startTime = Date.now();
    await page.goto('http://localhost:8080/trades');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // < 3 seconds
  });
});
```

#### 2. **Memory Usage**
```javascript
describe('Memory Usage', () => {
  test('should not exceed 100MB memory usage', async () => {
    const memoryBefore = await page.evaluate(() => performance.memory.usedJSHeapSize);
    
    // Load large dataset
    await page.goto('http://localhost:8080/trades');
    await page.waitForLoadState('networkidle');
    
    const memoryAfter = await page.evaluate(() => performance.memory.usedJSHeapSize);
    const memoryIncrease = memoryAfter - memoryBefore;
    
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // < 100MB
  });
});
```

#### 3. **Cache Performance**
```javascript
describe('Cache Performance', () => {
  test('should cache operations within 100ms', async () => {
    const startTime = Date.now();
    
    // Cache operation
    await page.evaluate(() => {
      return UnifiedCacheManager.set('test-key', 'test-value');
    });
    
    const cacheTime = Date.now() - startTime;
    expect(cacheTime).toBeLessThan(100); // < 100ms
  });
  
  test('should retrieve cached data within 50ms', async () => {
    // First, cache some data
    await page.evaluate(() => {
      return UnifiedCacheManager.set('test-key', 'test-value');
    });
    
    const startTime = Date.now();
    
    // Retrieve cached data
    await page.evaluate(() => {
      return UnifiedCacheManager.get('test-key');
    });
    
    const retrieveTime = Date.now() - startTime;
    expect(retrieveTime).toBeLessThan(50); // < 50ms
  });
});
```

### 🔧 **הגדרות**

#### **Test Environment**
```javascript
// tests/performance/setup.js
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Enable performance monitoring
  await page.addInitScript(() => {
    // Monitor performance metrics
    window.performanceMetrics = {
      loadTime: 0,
      memoryUsage: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    // Override performance.now for consistent timing
    const originalNow = performance.now;
    let startTime = 0;
    performance.now = () => startTime++;
  });
});
```

#### **Test Data**
```javascript
// tests/fixtures/performance-data.json
{
  "largeDatasets": {
    "trades": {
      "count": 1000,
      "data": "Array of 1000 trade objects"
    },
    "accounts": {
      "count": 100,
      "data": "Array of 100 account objects"
    }
  },
  "performanceThresholds": {
    "pageLoad": 2000,
    "memoryUsage": 100,
    "cacheOperations": 100,
    "tableRendering": 500
  }
}
```

### 📊 **תרחישי בדיקה**

#### 1. **Large Dataset Performance**
```javascript
describe('Large Dataset Performance', () => {
  test('should handle 1000+ trades efficiently', async () => {
    // Mock large dataset
    await page.route('**/api/trades**', route => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        symbol: `STOCK${i}`,
        quantity: Math.floor(Math.random() * 1000),
        price: Math.random() * 1000
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeDataset)
      });
    });
    
    const startTime = Date.now();
    await page.goto('http://localhost:8080/trades');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // < 5 seconds
    
    // Verify table is rendered
    await expect(page.locator('#trades-table')).toBeVisible();
    
    // Check memory usage
    const memoryUsage = await page.evaluate(() => performance.memory.usedJSHeapSize);
    expect(memoryUsage).toBeLessThan(200 * 1024 * 1024); // < 200MB
  });
});
```

#### 2. **Concurrent User Performance**
```javascript
describe('Concurrent User Performance', () => {
  test('should handle multiple concurrent users', async () => {
    const userCount = 10;
    const promises = [];
    
    for (let i = 0; i < userCount; i++) {
      promises.push(
        page.goto('http://localhost:8080/trades')
          .then(() => page.waitForLoadState('networkidle'))
      );
    }
    
    const startTime = Date.now();
    await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    expect(totalTime).toBeLessThan(10000); // < 10 seconds for 10 users
  });
});
```

#### 3. **Cache Performance Under Load**
```javascript
describe('Cache Performance Under Load', () => {
  test('should maintain cache performance under load', async () => {
    const operations = 1000;
    const startTime = Date.now();
    
    // Perform many cache operations
    for (let i = 0; i < operations; i++) {
      await page.evaluate((key, value) => {
        return UnifiedCacheManager.set(key, value);
      }, `test-key-${i}`, `test-value-${i}`);
    }
    
    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / operations;
    
    expect(avgTime).toBeLessThan(10); // < 10ms per operation
  });
});
```

### 🚀 **הרצת בדיקות**

```bash
# בדיקות ביצועים
npm run test:performance

# בדיקות ביצועים עם דוח
npm run test:performance:report

# בדיקות ביצועים עם פרופייל
npm run test:performance:profile
```

### 📈 **מדדי איכות**

- **Page Load Time**: <2 seconds
- **Memory Usage**: <100MB
- **Cache Operations**: <100ms
- **Table Rendering**: <500ms
- **Chart Rendering**: <1 second

### 🔄 **CI/CD Integration**

הבדיקות רצות אוטומטית ב:
- Pre-commit hooks
- Pull request validation
- Deployment pipeline
- Nightly regression tests

### 📚 **משאבים נוספים**

- [Playwright Performance Testing](https://playwright.dev/docs/test-performance)
- [Lighthouse Performance](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)

---

**נוצר**: ינואר 2025  
**גרסה**: 1.0.0  
**צוות**: TikTrack Development Team
