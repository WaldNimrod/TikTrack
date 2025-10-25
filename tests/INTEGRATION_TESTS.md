# בדיקות אינטגרציה - TikTrack
## Integration Tests

### 📋 **מטרה**

בדיקות אינטגרציה בודקות את האינטראקציה בין מערכות שונות במערכת TikTrack.

### 🎯 **מערכות נבדקות**

#### 1. **Cache + Logger Integration**
```javascript
describe('Cache + Logger Integration', () => {
  test('should log cache operations', async () => {
    // Cache operation
    await cacheManager.set('test-key', 'test-value');
    
    // Verify logging
    expect(Logger.info).toHaveBeenCalledWith(
      'Cache operation completed',
      expect.objectContaining({ key: 'test-key' })
    );
  });
});
```

#### 2. **Field Renderer + Button System Integration**
```javascript
describe('Field Renderer + Button Integration', () => {
  test('should render buttons with field data', () => {
    const fieldData = { id: 1, status: 'active' };
    const buttons = FieldRendererService.renderActionButtons(fieldData);
    
    expect(buttons).toContain('edit-button');
    expect(buttons).toContain('delete-button');
  });
});
```

#### 3. **Table + Chart Integration**
```javascript
describe('Table + Chart Integration', () => {
  test('should update chart when table data changes', () => {
    const tableData = [{ id: 1, value: 100 }];
    TableSystem.updateTable('trades-table', tableData);
    
    expect(ChartSystem.updateChart).toHaveBeenCalledWith(
      'trades-chart',
      expect.objectContaining({ data: tableData })
    );
  });
});
```

### 🔧 **הגדרות**

#### **Test Environment**
```javascript
// tests/integration/setup.js
beforeAll(() => {
  // Mock all systems
  global.Logger = { info: jest.fn(), error: jest.fn() };
  global.UnifiedCacheManager = new UnifiedCacheManager();
  global.FieldRendererService = new FieldRendererService();
  global.ButtonSystem = new ButtonSystem();
  global.TableSystem = new TableSystem();
  global.ChartSystem = new ChartSystem();
});
```

#### **Test Data**
```javascript
// tests/fixtures/integration-data.json
{
  "trades": [
    { "id": 1, "symbol": "AAPL", "price": 150.00 },
    { "id": 2, "symbol": "GOOGL", "price": 2800.00 }
  ],
  "accounts": [
    { "id": 1, "name": "Main Account", "balance": 50000.00 }
  ]
}
```

### 📊 **תרחישי בדיקה**

#### 1. **User Workflow: Create Trade**
```javascript
describe('User Workflow: Create Trade', () => {
  test('should create trade and update all systems', async () => {
    // 1. User creates trade
    const tradeData = { symbol: 'AAPL', quantity: 100, price: 150.00 };
    
    // 2. Cache the data
    await UnifiedCacheManager.set('new-trade', tradeData);
    
    // 3. Render in table
    const tableRow = TableSystem.renderTradeRow(tradeData);
    expect(tableRow).toContain('AAPL');
    
    // 4. Update chart
    ChartSystem.updateChart('trades-chart', { data: [tradeData] });
    
    // 5. Log the operation
    expect(Logger.info).toHaveBeenCalledWith('Trade created', tradeData);
  });
});
```

#### 2. **System Performance: Large Dataset**
```javascript
describe('System Performance: Large Dataset', () => {
  test('should handle 1000+ trades efficiently', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      symbol: `STOCK${i}`,
      price: Math.random() * 100
    }));
    
    // Test cache performance
    const startTime = Date.now();
    await UnifiedCacheManager.set('large-dataset', largeDataset);
    const cacheTime = Date.now() - startTime;
    expect(cacheTime).toBeLessThan(1000); // < 1 second
    
    // Test table rendering
    const tableStart = Date.now();
    TableSystem.renderTable('trades-table', largeDataset);
    const tableTime = Date.now() - tableStart;
    expect(tableTime).toBeLessThan(500); // < 0.5 seconds
  });
});
```

#### 3. **Error Handling: System Failure**
```javascript
describe('Error Handling: System Failure', () => {
  test('should handle cache failure gracefully', async () => {
    // Mock cache failure
    UnifiedCacheManager.set = jest.fn().mockRejectedValue(new Error('Cache failed'));
    
    // System should still work
    const result = await TableSystem.loadTableData('trades-table');
    expect(result).toBeDefined();
    
    // Should log the error
    expect(Logger.error).toHaveBeenCalledWith('Cache operation failed');
  });
});
```

### 🚀 **הרצת בדיקות**

```bash
# בדיקות אינטגרציה
npm run test:integration

# בדיקות אינטגרציה עם כיסוי
npm run test:integration -- --coverage

# בדיקות אינטגרציה במצב watch
npm run test:integration -- --watch
```

### 📈 **מדדי איכות**

- **Test Coverage**: >90%
- **Test Execution Time**: <30 seconds
- **Test Reliability**: >99%
- **Integration Points**: 15+ systems

### 🔄 **CI/CD Integration**

הבדיקות רצות אוטומטית ב:
- Pre-commit hooks
- Pull request validation
- Deployment pipeline
- Nightly regression tests

### 📚 **משאבים נוספים**

- [Jest Integration Testing](https://jestjs.io/docs/testing-frameworks)
- [Testing Library Integration](https://testing-library.com/docs/guide-which-query)
- [Cypress E2E Testing](https://www.cypress.io/)

---

**נוצר**: ינואר 2025  
**גרסה**: 1.0.0  
**צוות**: TikTrack Development Team
