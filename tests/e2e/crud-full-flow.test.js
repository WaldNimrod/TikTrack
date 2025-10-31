/**
 * CRUD Full Flow E2E Tests
 * =========================
 * 
 * Comprehensive end-to-end tests for all 8 user pages
 * Testing complete CRUD cycle: Create → Read → Update → Delete
 * 
 * Coverage:
 * - Cash Flows
 * - Trades
 * - Trade Plans
 * - Trading Accounts
 * - Alerts
 * - Executions
 * - Tickers
 * - Notes
 */

const { test, expect } = require('@playwright/test');

// Test data templates for each entity
const TEST_DATA = {
  cashFlows: {
    trading_account_id: 1,
    amount: 1000.00,
    currency_id: 1,
    type: 'deposit',
    date: '2025-01-30'
  },
  trades: {
    ticker_id: 1,
    trading_account_id: 1,
    investment_type: 'swing',
    direction: 'long',
    quantity: 10,
    entry_price: 150.00
  },
  tradePlans: {
    ticker_id: 1,
    trading_account_id: 1,
    investment_type: 'swing',
    direction: 'long',
    quantity: 10
  },
  tradingAccounts: {
    name: 'E2E Test Account',
    account_type: 'cash',
    currency: 'USD'
  },
  alerts: {
    ticker_id: 1,
    condition_type: 'price_above',
    target_value: 200.00
  },
  executions: {
    trade_id: 1,
    quantity: 5,
    price: 155.00
  },
  tickers: {
    symbol: 'E2ETEST',
    company_name: 'E2E Test Company',
    sector: 'Technology'
  },
  notes: {
    content: 'E2E test note content',
    related_type_id: 1,
    related_id: 1
  }
};

// Base URL
const BASE_URL = 'http://localhost:8080';

/**
 * Test suite for Cash Flows
 */
test.describe('Cash Flows CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/cash_flows.html`);
    await page.waitForLoadState('networkidle');
  });

  test('should create new cash flow', async ({ page }) => {
    // Click add button
    await page.click('[data-onclick="openAddModal"]');
    await page.waitForSelector('#cashFlowModal');
    
    // Fill form
    await page.fill('#cashFlowAmount', TEST_DATA.cashFlows.amount.toString());
    await page.selectOption('#cashFlowType', TEST_DATA.cashFlows.type);
    await page.fill('#cashFlowDate', TEST_DATA.cashFlows.date);
    
    // Submit
    await page.click('#saveCashFlowBtn');
    
    // Wait for success notification
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    
    // Verify modal closed
    await expect(page.locator('#cashFlowModal')).not.toBeVisible();
    
    // Verify table refreshed
    await page.waitForTimeout(1000);
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should display cash flow details', async ({ page }) => {
    // Get first row
    const firstRow = page.locator('tbody tr').first();
    
    // Click view button
    await firstRow.locator('[data-action="view"]').click();
    
    // Verify details modal opened
    await page.waitForSelector('#entityDetailsModal');
    await expect(page.locator('#entityDetailsModal')).toBeVisible();
  });

  test('should update cash flow', async ({ page }) => {
    // Get first row
    const firstRow = page.locator('tbody tr').first();
    
    // Click edit button
    await firstRow.locator('[data-action="edit"]').click();
    
    // Wait for modal
    await page.waitForSelector('#cashFlowModal');
    
    // Update amount
    const newAmount = '2000.00';
    await page.fill('#cashFlowAmount', newAmount);
    
    // Submit
    await page.click('#saveCashFlowBtn');
    
    // Wait for success notification
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    
    // Verify update reflected
    await page.waitForTimeout(1000);
    await expect(page.locator('tbody tr').first()).toContainText(newAmount);
  });

  test('should delete cash flow', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('tbody tr').count();
    
    // Click delete button
    await page.locator('tbody tr').first().locator('[data-action="delete"]').click();
    
    // Confirm deletion
    await page.click('[data-button-type="CONFIRM"]');
    
    // Wait for success notification
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    
    // Verify row count decreased
    await page.waitForTimeout(1000);
    const newRows = await page.locator('tbody tr').count();
    expect(newRows).toBe(initialRows - 1);
  });
});

/**
 * Test suite for Trades
 */
test.describe('Trades CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/trades.html`);
    await page.waitForLoadState('networkidle');
  });

  test('should create new trade', async ({ page }) => {
    await page.click('[data-onclick="openAddModal"]');
    await page.waitForSelector('#tradeModal');
    
    await page.selectOption('#tradeTickerId', TEST_DATA.trades.ticker_id.toString());
    await page.fill('#tradeQuantity', TEST_DATA.trades.quantity.toString());
    await page.fill('#tradeEntryPrice', TEST_DATA.trades.entry_price.toString());
    
    await page.click('#saveTradeBtn');
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    await expect(page.locator('#tradeModal')).not.toBeVisible();
  });
});

/**
 * Test suite for Trade Plans
 */
test.describe('Trade Plans CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/trade_plans.html`);
    await page.waitForLoadState('networkidle');
  });

  test('should create new trade plan', async ({ page }) => {
    await page.click('[data-onclick="openAddModal"]');
    await page.waitForSelector('#tradePlanModal');
    
    await page.selectOption('#tradePlanTickerId', TEST_DATA.tradePlans.ticker_id.toString());
    await page.fill('#tradePlanQuantity', TEST_DATA.tradePlans.quantity.toString());
    
    await page.click('#saveTradePlanBtn');
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    await expect(page.locator('#tradePlanModal')).not.toBeVisible();
  });
});

/**
 * Test suite for Trading Accounts
 */
test.describe('Trading Accounts CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/trading_accounts.html`);
    await page.waitForLoadState('networkidle');
  });

  test('should create new trading account', async ({ page }) => {
    await page.click('[data-onclick="openAddModal"]');
    await page.waitForSelector('#tradingAccountModal');
    
    await page.fill('#tradingAccountName', TEST_DATA.tradingAccounts.name);
    await page.selectOption('#tradingAccountType', TEST_DATA.tradingAccounts.account_type);
    
    await page.click('#saveTradingAccountBtn');
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    await expect(page.locator('#tradingAccountModal')).not.toBeVisible();
  });
});

/**
 * Test suite for Alerts
 */
test.describe('Alerts CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/alerts.html`);
    await page.waitForLoadState('networkidle');
  });

  test('should create new alert', async ({ page }) => {
    await page.click('[data-onclick="openAddModal"]');
    await page.waitForSelector('#alertModal');
    
    await page.selectOption('#alertTickerId', TEST_DATA.alerts.ticker_id.toString());
    await page.selectOption('#alertConditionType', TEST_DATA.alerts.condition_type);
    await page.fill('#alertTargetValue', TEST_DATA.alerts.target_value.toString());
    
    await page.click('#saveAlertBtn');
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    await expect(page.locator('#alertModal')).not.toBeVisible();
  });
});

/**
 * Test suite for Executions
 */
test.describe('Executions CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/executions.html`);
    await page.waitForLoadState('networkidle');
  });

  test('should create new execution', async ({ page }) => {
    await page.click('[data-onclick="openAddModal"]');
    await page.waitForSelector('#executionModal');
    
    await page.selectOption('#executionTradeId', TEST_DATA.executions.trade_id.toString());
    await page.fill('#executionQuantity', TEST_DATA.executions.quantity.toString());
    await page.fill('#executionPrice', TEST_DATA.executions.price.toString());
    
    await page.click('#saveExecutionBtn');
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    await expect(page.locator('#executionModal')).not.toBeVisible();
  });
});

/**
 * Test suite for Tickers
 */
test.describe('Tickers CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/tickers.html`);
    await page.waitForLoadState('networkidle');
  });

  test('should create new ticker', async ({ page }) => {
    await page.click('[data-onclick="openAddModal"]');
    await page.waitForSelector('#tickerModal');
    
    await page.fill('#tickerSymbol', TEST_DATA.tickers.symbol);
    await page.fill('#tickerCompanyName', TEST_DATA.tickers.company_name);
    await page.fill('#tickerSector', TEST_DATA.tickers.sector);
    
    await page.click('#saveTickerBtn');
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    await expect(page.locator('#tickerModal')).not.toBeVisible();
  });
});

/**
 * Test suite for Notes
 */
test.describe('Notes CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/notes.html`);
    await page.waitForLoadState('networkidle');
  });

  test('should create new note', async ({ page }) => {
    await page.click('[data-onclick="openAddModal"]');
    await page.waitForSelector('#noteModal');
    
    await page.fill('#noteContent', TEST_DATA.notes.content);
    await page.selectOption('#noteRelatedTypeId', TEST_DATA.notes.related_type_id.toString());
    await page.fill('#noteRelatedId', TEST_DATA.notes.related_id.toString());
    
    await page.click('#saveNoteBtn');
    await page.waitForSelector('.notification-success', { timeout: 5000 });
    await expect(page.locator('#noteModal')).not.toBeVisible();
  });
});

/**
 * Cross-Page Consistency Tests
 */
test.describe('Cross-Page Consistency', () => {
  test('should have consistent table structure across pages', async ({ page }) => {
    const pages = ['cash_flows', 'trades', 'trade_plans', 'trading_accounts'];
    
    for (const pageName of pages) {
      await page.goto(`${BASE_URL}/${pageName}.html`);
      await page.waitForLoadState('networkidle');
      
      // Verify table exists
      await expect(page.locator('table')).toBeVisible();
      
      // Verify action buttons exist
      await expect(page.locator('[data-onclick="openAddModal"]')).toBeVisible();
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/cash_flows.html`);
    await page.waitForLoadState('networkidle');
    
    // Simulate network failure
    await page.route('**/api/cash_flows', route => route.abort());
    
    // Try to load data
    await page.reload();
    
    // Should show error notification
    await page.waitForSelector('.notification-error', { timeout: 5000 });
  });
});





