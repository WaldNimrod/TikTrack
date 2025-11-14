/**
 * Preferences Page E2E Tests - TikTrack
 * ======================================
 * 
 * End-to-end tests for the preferences page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadPageTemplate } = require('../../utils/page-test-utils');

describe('Preferences Page E2E Tests', () => {
    let htmlContent;

    beforeAll(() => {
        htmlContent = loadPageTemplate('preferences');
    });

    test('should load preferences page successfully', () => {
        expect(htmlContent.includes('preferences-page')).toBe(true);
    });

    test('should have preferences form', () => {
        expect(
            htmlContent.includes('preferencesForm') ||
            htmlContent.includes('preferences-form') ||
            htmlContent.includes('<form')
        ).toBe(true);
    });

    test('should have preference sections', () => {
        expect(
            htmlContent.includes('data-section') ||
            htmlContent.includes('content-section')
        ).toBe(true);
    });

    test('should load required scripts', () => {
        expect(htmlContent.includes('<script')).toBe(true);
    });

    test('should have proper page structure', () => {
        expect(
            htmlContent.includes('main-content') ||
            htmlContent.includes('page-body')
        ).toBe(true);
    });

    test('should be responsive', () => {
        expect(htmlContent.includes('meta name="viewport"')).toBe(true);
    });
});
