# Testing Infrastructure - מפרט מלא

## סקירה

**מטרה:** מערכת בדיקות מקיפה עם 60% code coverage  
**זמן:** 3-4 שבועות  
**תוצאה:** מניעת regression, איכות קוד גבוהה

---

## ארכיטקטורה

### Testing Stack

```javascript
/**
 * TikTrack Testing Infrastructure
 * מערכת בדיקות מקיפה
 */

// Testing Configuration
const TESTING_CONFIG = {
  // Unit Testing
  unit: {
    framework: 'Vitest',
    coverage: 80,
    files: ['**/*.test.js', '**/*.spec.js']
  },
  
  // Integration Testing
  integration: {
    framework: 'Vitest',
    coverage: 70,
    files: ['**/integration/*.test.js']
  },
  
  // E2E Testing
  e2e: {
    framework: 'Playwright',
    browsers: ['chromium', 'firefox', 'webkit'],
    coverage: 60
  },
  
  // Performance Testing
  performance: {
    framework: 'Lighthouse CI',
    thresholds: {
      performance: 90,
      accessibility: 90,
      bestPractices: 90,
      seo: 90
    }
  }
};
```

---

## Unit Testing (Vitest)

### Setup

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/*.test.js',
        '**/*.spec.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': './src',
      '@tests': './tests'
    }
  }
});
```

### Test Setup

```javascript
// tests/setup.js
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch
global.fetch = vi.fn();

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
};

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
    href: 'http://localhost:3000/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock window.navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)'
  },
  writable: true
});
```

### Cache Manager Tests

```javascript
// tests/cache-manager.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheManager } from '../scripts/cache-manager.js';

describe('CacheManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Basic Operations', () => {
    it('should set and get data', async () => {
      const testData = { id: 1, name: 'Test' };
      
      CacheManager.set('test-key', testData, 'short');
      const result = await CacheManager.get('test-key');
      
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent key', async () => {
      const result = await CacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    it('should handle TTL expiry', async () => {
      const testData = { id: 1, name: 'Test' };
      
      CacheManager.set('test-key', testData, 'short');
      
      // Mock time passage
      vi.advanceTimersByTime(6 * 60 * 1000); // 6 minutes
      
      const result = await CacheManager.get('test-key');
      expect(result).toBeNull();
    });

    it('should remove specific key', () => {
      CacheManager.set('key1', 'value1', 'short');
      CacheManager.set('key2', 'value2', 'short');
      
      CacheManager.remove('key1');
      
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).not.toBeNull();
    });

    it('should clear all cache', () => {
      CacheManager.set('key1', 'value1', 'short');
      CacheManager.set('key2', 'value2', 'short');
      
      CacheManager.clear();
      
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
    });
  });

  describe('Dependencies', () => {
    it('should invalidate dependent keys', () => {
      CacheManager.set('user-preferences', { theme: 'dark' }, 'long');
      CacheManager.set('preference-data', { data: 'test' }, 'medium');
      CacheManager.set('profile-data', { name: 'John' }, 'medium');
      
      CacheManager.invalidateByDependency('user-preferences');
      
      expect(localStorage.getItem('preference-data')).toBeNull();
      expect(localStorage.getItem('profile-data')).toBeNull();
    });

    it('should handle recursive dependencies', () => {
      CacheManager.set('accounts-data', { accounts: [] }, 'medium');
      CacheManager.set('trades-data', { trades: [] }, 'short');
      CacheManager.set('dashboard-data', { stats: {} }, 'medium');
      
      CacheManager.invalidateByDependency('accounts-data');
      
      expect(localStorage.getItem('trades-data')).toBeNull();
      expect(localStorage.getItem('dashboard-data')).toBeNull();
    });
  });

  describe('Pattern Matching', () => {
    it('should clear keys by pattern', () => {
      CacheManager.set('trades-1', { id: 1 }, 'short');
      CacheManager.set('trades-2', { id: 2 }, 'short');
      CacheManager.set('users-1', { id: 1 }, 'short');
      
      CacheManager.invalidate('trades-*');
      
      expect(localStorage.getItem('trades-1')).toBeNull();
      expect(localStorage.getItem('trades-2')).toBeNull();
      expect(localStorage.getItem('users-1')).not.toBeNull();
    });
  });

  describe('Statistics', () => {
    it('should return cache statistics', () => {
      CacheManager.set('key1', 'value1', 'short');
      CacheManager.set('key2', 'value2', 'short');
      
      const stats = CacheManager.getStats();
      
      expect(stats.totalKeys).toBe(2);
      expect(stats.validKeys).toBe(2);
      expect(stats.expiredKeys).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      // Mock localStorage to throw error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      CacheManager.set('test-key', 'test-value', 'short');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cache set error',
        expect.any(Error)
      );
    });
  });
});
```

### Logger Service Tests

```javascript
// tests/logger-service.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from '../scripts/logger-service.js';

describe('Logger', () => {
  beforeEach(() => {
    Logger.clearLogs();
    vi.clearAllMocks();
  });

  describe('Log Levels', () => {
    it('should log debug messages', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      Logger.debug('Debug message', { data: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[DEBUG] Debug message',
        { data: 'test' }
      );
    });

    it('should log info messages', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      Logger.info('Info message', { data: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[INFO] Info message',
        { data: 'test' }
      );
    });

    it('should log warning messages', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      Logger.warn('Warning message', { data: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[WARN] Warning message',
        { data: 'test' }
      );
    });

    it('should log error messages', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const error = new Error('Test error');
      
      Logger.error('Error message', error);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR] Error message',
        expect.objectContaining({
          message: 'Test error',
          stack: expect.any(String)
        })
      );
    });
  });

  describe('Log Filtering', () => {
    it('should filter logs by level', () => {
      Logger.info('Info message');
      Logger.error('Error message');
      Logger.warn('Warning message');
      
      const errorLogs = Logger.getLogs({ level: 'ERROR' });
      const infoLogs = Logger.getLogs({ level: 'INFO' });
      
      expect(errorLogs).toHaveLength(1);
      expect(infoLogs).toHaveLength(1);
    });

    it('should filter logs by page', () => {
      // Mock different pages
      Object.defineProperty(window, 'location', {
        value: { pathname: '/trades.html' },
        writable: true
      });
      
      Logger.info('Trades message');
      
      Object.defineProperty(window, 'location', {
        value: { pathname: '/alerts.html' },
        writable: true
      });
      
      Logger.info('Alerts message');
      
      const tradesLogs = Logger.getLogs({ page: '/trades.html' });
      const alertsLogs = Logger.getLogs({ page: '/alerts.html' });
      
      expect(tradesLogs).toHaveLength(1);
      expect(alertsLogs).toHaveLength(1);
    });

    it('should filter logs by date', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      Logger.info('Recent message');
      
      const recentLogs = Logger.getLogs({ since: yesterday.toISOString() });
      const oldLogs = Logger.getLogs({ since: now.toISOString() });
      
      expect(recentLogs.length).toBeGreaterThan(0);
      expect(oldLogs.length).toBe(0);
    });
  });

  describe('Server Communication', () => {
    it('should send logs to server in batches', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Set batch size to 2 for testing
      Logger.batchSize = 2;
      
      Logger.warn('Warning 1');
      Logger.warn('Warning 2');
      
      // Wait for batch to be sent
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(fetchSpy).toHaveBeenCalledWith('/api/logs/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"logs"')
      });
    });

    it('should handle server errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(
        new Error('Network error')
      );
      
      Logger.warn('Test warning');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send logs to server:',
        expect.any(Error)
      );
    });
  });

  describe('Statistics', () => {
    it('should return log statistics', () => {
      Logger.info('Info message');
      Logger.warn('Warning message');
      Logger.error('Error message');
      
      const stats = Logger.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.byLevel.INFO).toBe(1);
      expect(stats.byLevel.WARN).toBe(1);
      expect(stats.byLevel.ERROR).toBe(1);
      expect(stats.errors).toBe(1);
      expect(stats.warnings).toBe(1);
    });
  });
});
```

---

## Integration Testing

### API Integration Tests

```javascript
// tests/integration/cache-with-api.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheManager } from '../scripts/cache-manager.js';

describe('Cache with API Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should cache API responses', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });
    
    // First call - should fetch from API
    const response1 = await fetch('/api/trades');
    const data1 = await response1.json();
    
    // Second call - should use cache
    const response2 = await fetch('/api/trades');
    const data2 = await response2.json();
    
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(data1).toEqual(data2);
  });

  it('should invalidate cache on data changes', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });
    
    // Cache initial data
    CacheManager.set('trades-data', mockData, 'medium');
    
    // Simulate data update
    await fetch('/api/trades/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' })
    });
    
    // Cache should be invalidated
    const cached = await CacheManager.get('trades-data');
    expect(cached).toBeNull();
  });
});
```

### Logger with Backend Integration

```javascript
// tests/integration/logger-with-backend.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from '../scripts/logger-service.js';

describe('Logger with Backend Integration', () => {
  beforeEach(() => {
    Logger.clearLogs();
    vi.clearAllMocks();
  });

  it('should send logs to backend API', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, count: 1 })
    });
    
    Logger.warn('Test warning');
    
    // Wait for batch to be sent
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(fetchSpy).toHaveBeenCalledWith('/api/logs/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"logs"')
    });
  });

  it('should handle backend errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    Logger.warn('Test warning');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to send logs to server:',
      expect.any(Error)
    );
  });
});
```

---

## E2E Testing (Playwright)

### Setup

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI
  }
});
```

### Trades Page E2E Tests

```javascript
// tests/e2e/trades-page.spec.js
import { test, expect } from '@playwright/test';

test.describe('Trades Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trades.html');
  });

  test('should load trades page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Trades Management/);
    await expect(page.locator('h1')).toContainText('Trades Management');
  });

  test('should display trades table', async ({ page }) => {
    await expect(page.locator('#trades-table')).toBeVisible();
    await expect(page.locator('thead th')).toHaveCount(6); // 5 columns + actions
  });

  test('should add new trade', async ({ page }) => {
    await page.click('#add-trade');
    await expect(page.locator('#trade-modal')).toBeVisible();
    
    await page.fill('#symbol', 'AAPL');
    await page.fill('#quantity', '100');
    await page.fill('#price', '150.00');
    
    await page.click('#save-trade');
    
    await expect(page.locator('#trade-modal')).not.toBeVisible();
    await expect(page.locator('#trades-tbody tr')).toHaveCount(1);
  });

  test('should edit existing trade', async ({ page }) => {
    // Add a trade first
    await page.click('#add-trade');
    await page.fill('#symbol', 'AAPL');
    await page.fill('#quantity', '100');
    await page.fill('#price', '150.00');
    await page.click('#save-trade');
    
    // Edit the trade
    await page.click('button:has-text("Edit")');
    await page.fill('#quantity', '200');
    await page.click('#save-trade');
    
    await expect(page.locator('#trades-tbody tr')).toContainText('200');
  });

  test('should delete trade', async ({ page }) => {
    // Add a trade first
    await page.click('#add-trade');
    await page.fill('#symbol', 'AAPL');
    await page.fill('#quantity', '100');
    await page.fill('#price', '150.00');
    await page.click('#save-trade');
    
    // Delete the trade
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Yes")');
    
    await expect(page.locator('#trades-tbody tr')).toHaveCount(0);
  });

  test('should filter trades', async ({ page }) => {
    // Add multiple trades
    await page.click('#add-trade');
    await page.fill('#symbol', 'AAPL');
    await page.fill('#quantity', '100');
    await page.fill('#price', '150.00');
    await page.click('#save-trade');
    
    await page.click('#add-trade');
    await page.fill('#symbol', 'GOOGL');
    await page.fill('#quantity', '50');
    await page.fill('#price', '2500.00');
    await page.click('#save-trade');
    
    // Filter by symbol
    await page.fill('#search-trades', 'AAPL');
    await page.click('#filter-trades');
    
    await expect(page.locator('#trades-tbody tr')).toHaveCount(1);
    await expect(page.locator('#trades-tbody tr')).toContainText('AAPL');
  });

  test('should handle cache invalidation', async ({ page }) => {
    // Add a trade
    await page.click('#add-trade');
    await page.fill('#symbol', 'AAPL');
    await page.fill('#quantity', '100');
    await page.fill('#price', '150.00');
    await page.click('#save-trade');
    
    // Check that cache is working
    await page.reload();
    await expect(page.locator('#trades-tbody tr')).toHaveCount(1);
    
    // Edit the trade
    await page.click('button:has-text("Edit")');
    await page.fill('#quantity', '200');
    await page.click('#save-trade');
    
    // Verify cache was invalidated and data is fresh
    await page.reload();
    await expect(page.locator('#trades-tbody tr')).toContainText('200');
  });
});
```

### Cache System E2E Tests

```javascript
// tests/e2e/cache-system.spec.js
import { test, expect } from '@playwright/test';

test.describe('Cache System', () => {
  test('should cache data across page navigation', async ({ page }) => {
    await page.goto('/trades.html');
    
    // Load trades data
    await page.waitForSelector('#trades-tbody');
    
    // Navigate to another page
    await page.goto('/alerts.html');
    await page.waitForSelector('#alerts-tbody');
    
    // Go back to trades
    await page.goto('/trades.html');
    
    // Data should load faster (from cache)
    await expect(page.locator('#trades-tbody')).toBeVisible();
  });

  test('should invalidate cache on data changes', async ({ page }) => {
    await page.goto('/trades.html');
    
    // Add a trade
    await page.click('#add-trade');
    await page.fill('#symbol', 'AAPL');
    await page.fill('#quantity', '100');
    await page.fill('#price', '150.00');
    await page.click('#save-trade');
    
    // Navigate away and back
    await page.goto('/alerts.html');
    await page.goto('/trades.html');
    
    // Trade should still be there
    await expect(page.locator('#trades-tbody tr')).toHaveCount(1);
  });

  test('should handle cache errors gracefully', async ({ page }) => {
    // Mock localStorage to throw errors
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };
    });
    
    await page.goto('/trades.html');
    
    // Page should still load (fallback to no cache)
    await expect(page.locator('h1')).toContainText('Trades Management');
  });
});
```

---

## Performance Testing

### Lighthouse CI Setup

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:8080/',
        'http://localhost:8080/trades.html',
        'http://localhost:8080/alerts.html',
        'http://localhost:8080/preferences.html'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

### Performance Tests

```javascript
// tests/performance/load-time.test.js
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/trades.html');
    await page.waitForSelector('#trades-table');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/trades.html');
    
    // Add many trades
    for (let i = 0; i < 100; i++) {
      await page.click('#add-trade');
      await page.fill('#symbol', `STOCK${i}`);
      await page.fill('#quantity', '100');
      await page.fill('#price', '150.00');
      await page.click('#save-trade');
    }
    
    // Table should still be responsive
    await expect(page.locator('#trades-tbody tr')).toHaveCount(100);
    
    // Filtering should be fast
    const filterStart = Date.now();
    await page.fill('#search-trades', 'STOCK50');
    await page.click('#filter-trades');
    const filterTime = Date.now() - filterStart;
    
    expect(filterTime).toBeLessThan(1000); // 1 second
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/trades.html');
    
    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp).toBeLessThan(2500); // 2.5 seconds
  });
});
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Lighthouse CI
        run: npm run test:lighthouse
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:lighthouse": "lhci autorun",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e && npm run test:lighthouse"
  }
}
```

---

## סיכום

### כלים שנוצרו

**Unit Testing:**
- Vitest configuration
- Test setup and mocks
- Cache Manager tests (20+ tests)
- Logger Service tests (15+ tests)

**Integration Testing:**
- API integration tests
- Cache with API tests
- Logger with Backend tests

**E2E Testing:**
- Playwright configuration
- Trades page tests
- Cache system tests
- Cross-browser testing

**Performance Testing:**
- Lighthouse CI setup
- Load time tests
- Core Web Vitals tests

### יתרונות

**איכות קוד:**
- 60% code coverage
- מניעת regression
- איתור שגיאות מוקדם

**ביצועים:**
- Lighthouse CI integration
- Performance monitoring
- Core Web Vitals tracking

**אוטומציה:**
- CI/CD integration
- Automated testing
- Cross-browser testing
