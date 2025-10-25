# בדיקות End-to-End - TikTrack
## E2E Tests

### 📋 **מטרה**

בדיקות End-to-End בודקות את המערכת כולה מנקודת מבט המשתמש.

### 🎯 **זרימות משתמש**

#### 1. **User Login & Dashboard**
```javascript
describe('User Login & Dashboard', () => {
  test('should login and view dashboard', async () => {
    // 1. Navigate to login page
    await page.goto('http://localhost:8080/login');
    
    // 2. Fill login form
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'testpass');
    await page.click('#login-button');
    
    // 3. Verify dashboard loads
    await expect(page.locator('#dashboard')).toBeVisible();
    await expect(page.locator('#trades-table')).toBeVisible();
    await expect(page.locator('#performance-chart')).toBeVisible();
  });
});
```

#### 2. **Create New Trade**
```javascript
describe('Create New Trade', () => {
  test('should create trade successfully', async () => {
    // 1. Navigate to trades page
    await page.goto('http://localhost:8080/trades');
    
    // 2. Click add trade button
    await page.click('#add-trade-button');
    
    // 3. Fill trade form
    await page.fill('#symbol', 'AAPL');
    await page.fill('#quantity', '100');
    await page.fill('#price', '150.00');
    await page.selectOption('#side', 'buy');
    
    // 4. Submit form
    await page.click('#save-trade-button');
    
    // 5. Verify trade appears in table
    await expect(page.locator('#trades-table')).toContainText('AAPL');
    await expect(page.locator('#trades-table')).toContainText('100');
    await expect(page.locator('#trades-table')).toContainText('150.00');
  });
});
```

#### 3. **Edit Existing Trade**
```javascript
describe('Edit Existing Trade', () => {
  test('should edit trade successfully', async () => {
    // 1. Navigate to trades page
    await page.goto('http://localhost:8080/trades');
    
    // 2. Click edit button on first trade
    await page.click('#trades-table tr:first-child .edit-button');
    
    // 3. Modify trade data
    await page.fill('#quantity', '150');
    await page.fill('#price', '155.00');
    
    // 4. Save changes
    await page.click('#save-trade-button');
    
    // 5. Verify changes appear
    await expect(page.locator('#trades-table')).toContainText('150');
    await expect(page.locator('#trades-table')).toContainText('155.00');
  });
});
```

#### 4. **Delete Trade**
```javascript
describe('Delete Trade', () => {
  test('should delete trade successfully', async () => {
    // 1. Navigate to trades page
    await page.goto('http://localhost:8080/trades');
    
    // 2. Get initial trade count
    const initialCount = await page.locator('#trades-table tr').count();
    
    // 3. Click delete button on first trade
    await page.click('#trades-table tr:first-child .delete-button');
    
    // 4. Confirm deletion
    await page.click('#confirm-delete-button');
    
    // 5. Verify trade is removed
    const finalCount = await page.locator('#trades-table tr').count();
    expect(finalCount).toBe(initialCount - 1);
  });
});
```

### 🔧 **הגדרות**

#### **Test Environment**
```javascript
// tests/e2e/setup.js
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Mock API responses
  await page.route('**/api/trades**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, symbol: 'AAPL', quantity: 100, price: 150.00 }
      ])
    });
  });
  
  // Mock cache operations
  await page.addInitScript(() => {
    window.UnifiedCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn()
    };
  });
});
```

#### **Test Data**
```javascript
// tests/fixtures/e2e-data.json
{
  "users": [
    { "username": "testuser", "password": "testpass" }
  ],
  "trades": [
    { "id": 1, "symbol": "AAPL", "quantity": 100, "price": 150.00 },
    { "id": 2, "symbol": "GOOGL", "quantity": 50, "price": 2800.00 }
  ],
  "accounts": [
    { "id": 1, "name": "Main Account", "balance": 50000.00 }
  ]
}
```

### 📊 **תרחישי בדיקה**

#### 1. **Complete User Journey**
```javascript
describe('Complete User Journey', () => {
  test('should complete full user workflow', async () => {
    // 1. Login
    await page.goto('http://localhost:8080/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'testpass');
    await page.click('#login-button');
    
    // 2. View dashboard
    await expect(page.locator('#dashboard')).toBeVisible();
    await expect(page.locator('#trades-table')).toBeVisible();
    
    // 3. Create trade
    await page.click('#add-trade-button');
    await page.fill('#symbol', 'AAPL');
    await page.fill('#quantity', '100');
    await page.fill('#price', '150.00');
    await page.click('#save-trade-button');
    
    // 4. Verify trade appears
    await expect(page.locator('#trades-table')).toContainText('AAPL');
    
    // 5. Edit trade
    await page.click('#trades-table tr:first-child .edit-button');
    await page.fill('#quantity', '150');
    await page.click('#save-trade-button');
    
    // 6. Verify changes
    await expect(page.locator('#trades-table')).toContainText('150');
    
    // 7. Delete trade
    await page.click('#trades-table tr:first-child .delete-button');
    await page.click('#confirm-delete-button');
    
    // 8. Verify deletion
    await expect(page.locator('#trades-table')).not.toContainText('AAPL');
  });
});
```

#### 2. **Performance Testing**
```javascript
describe('Performance Testing', () => {
  test('should load page within 3 seconds', async () => {
    const startTime = Date.now();
    await page.goto('http://localhost:8080/trades');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // < 3 seconds
  });
  
  test('should handle 1000+ trades efficiently', async () => {
    // Mock large dataset
    await page.route('**/api/trades**', route => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        symbol: `STOCK${i}`,
        quantity: 100,
        price: Math.random() * 100
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
  });
});
```

#### 3. **Error Handling**
```javascript
describe('Error Handling', () => {
  test('should handle API errors gracefully', async () => {
    // Mock API error
    await page.route('**/api/trades**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('http://localhost:8080/trades');
    
    // Should show error message
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('Error loading trades');
  });
  
  test('should handle network failures', async () => {
    // Mock network failure
    await page.route('**/api/trades**', route => {
      route.abort('Failed');
    });
    
    await page.goto('http://localhost:8080/trades');
    
    // Should show offline message
    await expect(page.locator('#offline-message')).toBeVisible();
  });
});
```

### 🚀 **הרצת בדיקות**

```bash
# בדיקות E2E
npm run test:e2e

# בדיקות E2E עם כיסוי
npm run test:e2e -- --coverage

# בדיקות E2E במצב watch
npm run test:e2e -- --watch

# בדיקות E2E עם דפדפן גלוי
npm run test:e2e -- --headed
```

### 📈 **מדדי איכות**

- **Test Coverage**: >80%
- **Test Execution Time**: <60 seconds
- **Test Reliability**: >99%
- **User Scenarios**: 20+ workflows

### 🔄 **CI/CD Integration**

הבדיקות רצות אוטומטית ב:
- Pre-commit hooks
- Pull request validation
- Deployment pipeline
- Nightly regression tests

### 📚 **משאבים נוספים**

- [Playwright E2E Testing](https://playwright.dev/)
- [Cypress E2E Testing](https://www.cypress.io/)
- [Testing Library E2E](https://testing-library.com/docs/guide-which-query)

---

**נוצר**: ינואר 2025  
**גרסה**: 1.0.0  
**צוות**: TikTrack Development Team
