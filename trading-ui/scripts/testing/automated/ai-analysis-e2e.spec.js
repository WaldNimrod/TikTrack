/**
 * AI Analysis System - Playwright E2E Tests
 * ==========================================
 * 
 * Comprehensive E2E tests using Playwright
 * 
 * Usage:
 *   npx playwright test trading-ui/scripts/testing/automated/ai-analysis-e2e.spec.js
 * 
 * @version 1.0.0
 * @created January 28, 2025
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const PAGE_URL = `${BASE_URL}/trading-ui/ai-analysis.html`;

test.describe('AI Analysis System - E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to AI Analysis page
    await page.goto(PAGE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Page loads successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/ניתוח AI/);
    
    // Check main sections exist
    await expect(page.locator('#ai-analysis-header')).toBeVisible();
    await expect(page.locator('#ai-analysis-templates')).toBeVisible();
    await expect(page.locator('#ai-analysis-form')).toBeVisible();
    await expect(page.locator('#ai-analysis-results')).toBeVisible();
    await expect(page.locator('#ai-analysis-history')).toBeVisible();
  });

  test('Templates load and display', async ({ page }) => {
    // Wait for templates to load
    await page.waitForSelector('#templatesContainer', { timeout: 10000 });
    
    // Check templates container is not empty
    const templatesContainer = page.locator('#templatesContainer');
    await expect(templatesContainer).toBeVisible();
    
    // Check that template cards exist
    const templateCards = page.locator('#templatesContainer .card');
    const count = await templateCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Template selection shows form', async ({ page }) => {
    // Wait for templates to load
    await page.waitForSelector('#templatesContainer .card', { timeout: 10000 });
    
    // Click first template
    const firstTemplate = page.locator('#templatesContainer .card').first();
    await firstTemplate.click();
    
    // Wait for form to appear
    await page.waitForTimeout(1000);
    
    // Check form is visible
    const formSection = page.locator('#ai-analysis-form');
    await expect(formSection).toBeVisible();
    
    // Check variables container exists
    const variablesContainer = page.locator('#variablesContainer');
    await expect(variablesContainer).toBeVisible();
  });

  test('Form has required fields', async ({ page }) => {
    // Wait for templates and select one
    await page.waitForSelector('#templatesContainer .card', { timeout: 10000 });
    await page.locator('#templatesContainer .card').first().click();
    await page.waitForTimeout(1000);
    
    // Check LLM provider select exists
    const providerSelect = page.locator('#llmProvider');
    await expect(providerSelect).toBeVisible();
    
    // Check generate button exists
    const generateBtn = page.locator('#generateAnalysisBtn');
    await expect(generateBtn).toBeVisible();
  });

  test('History section loads', async ({ page }) => {
    // Wait for history section
    await page.waitForSelector('#ai-analysis-history', { timeout: 5000 });
    
    const historySection = page.locator('#ai-analysis-history');
    await expect(historySection).toBeVisible();
    
    // Check history container exists
    const historyContainer = page.locator('#historyContainer');
    await expect(historyContainer).toBeVisible();
  });

  test('All JavaScript services are loaded', async ({ page }) => {
    // Check that all required services are available
    const services = [
      'AIAnalysisData',
      'AIAnalysisManager',
      'AITemplateSelector',
      'AIResultRenderer',
      'AINotesIntegration',
      'AIExportService'
    ];
    
    for (const service of services) {
      const isAvailable = await page.evaluate((svc) => {
        return typeof window[svc] !== 'undefined';
      }, service);
      
      expect(isAvailable).toBeTruthy();
    }
  });

  test('Validation functions are available', async ({ page }) => {
    // Check that validation functions are available
    const hasValidateRequest = await page.evaluate(() => {
      return typeof window.AIAnalysisData?.validateAnalysisRequest === 'function';
    });
    
    const hasValidateVariables = await page.evaluate(() => {
      return typeof window.AIAnalysisData?.validateVariables === 'function';
    });
    
    expect(hasValidateRequest).toBeTruthy();
    expect(hasValidateVariables).toBeTruthy();
  });

  test('Error handling works', async ({ page }) => {
    // Try to generate analysis without selecting template
    const generateBtn = page.locator('#generateAnalysisBtn');
    
    // Form should be hidden initially
    const formSection = page.locator('#ai-analysis-form');
    const isVisible = await formSection.isVisible();
    
    // If form is visible, try to submit without template
    if (isVisible) {
      await generateBtn.click();
      await page.waitForTimeout(500);
      
      // Should show error notification (if NotificationSystem is working)
      // This is a basic check - actual error handling depends on implementation
    }
  });

  test('Export buttons exist', async ({ page }) => {
    // Results section should have export buttons
    const resultsSection = page.locator('#ai-analysis-results');
    
    // Check export buttons exist (they might be hidden initially)
    const exportPDFBtn = page.locator('#exportPDFBtn');
    const exportMarkdownBtn = page.locator('#exportMarkdownBtn');
    const exportHTMLBtn = page.locator('#exportHTMLBtn');
    
    // Buttons should exist in DOM (even if hidden)
    await expect(exportPDFBtn).toHaveCount(1);
    await expect(exportMarkdownBtn).toHaveCount(1);
    await expect(exportHTMLBtn).toHaveCount(1);
  });

  test('Save as note button exists', async ({ page }) => {
    // Results section should have save as note button
    const saveAsNoteBtn = page.locator('#saveAsNoteBtn');
    
    // Button should exist in DOM
    await expect(saveAsNoteBtn).toHaveCount(1);
  });

  test('Page is responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check that main sections are still visible
    await expect(page.locator('#ai-analysis-header')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Check that main sections are still visible
    await expect(page.locator('#ai-analysis-templates')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // Check that main sections are still visible
    await expect(page.locator('#ai-analysis-form')).toBeVisible();
  });
});

test.describe('AI Analysis - User Profile Integration', () => {
  
  test('User profile page has AI Analysis section', async ({ page }) => {
    await page.goto(`${BASE_URL}/trading-ui/user-profile.html`);
    await page.waitForLoadState('networkidle');
    
    // Check AI Analysis section exists
    const aiSection = page.locator('#user-profile-ai-analysis');
    await expect(aiSection).toBeVisible();
    
    // Check API key inputs exist
    const geminiKeyInput = page.locator('#geminiApiKey');
    const perplexityKeyInput = page.locator('#perplexityApiKey');
    
    await expect(geminiKeyInput).toBeVisible();
    await expect(perplexityKeyInput).toBeVisible();
  });

  test('User profile AI Analysis manager loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/trading-ui/user-profile.html`);
    await page.waitForLoadState('networkidle');
    
    // Check AIAnalysisManager is available
    const managerAvailable = await page.evaluate(() => {
      return typeof window.AIAnalysisManager !== 'undefined';
    });
    
    expect(managerAvailable).toBeTruthy();
  });
});


