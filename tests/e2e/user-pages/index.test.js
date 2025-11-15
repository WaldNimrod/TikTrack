/**
 * Index Page E2E Tests - TikTrack
 * ================================
 * 
 * End-to-end tests for the main dashboard page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadPageTemplate } = require('../../utils/page-test-utils');

describe('Index Page E2E Tests', () => {
    let htmlContent;

    beforeAll(() => {
        htmlContent = loadPageTemplate('index');
    });

    test('should load index page successfully', () => {
        expect(htmlContent.includes('background-wrapper')).toBe(true);
    });

    test('should have main dashboard elements', () => {
        expect(htmlContent.includes('main-content')).toBe(true);
        expect(htmlContent.includes('card')).toBe(true);
    });

    test('should have navigation elements', () => {
        expect(htmlContent.includes('unified-header')).toBe(true);
    });

    test('should have footer elements', () => {
        expect(htmlContent.includes('page-body')).toBe(true);
    });

    test('should load required scripts', () => {
        expect(htmlContent.includes('<script')).toBe(true);
    });

    test('should have proper meta tags', () => {
        expect(htmlContent.includes('<meta')).toBe(true);
    });

    test('should have proper CSS links', () => {
        expect(htmlContent.includes('rel="stylesheet"')).toBe(true);
    });

    test('should be responsive', () => {
        expect(htmlContent.includes('meta name="viewport"')).toBe(true);
    });

    test('should have proper language attributes', () => {
        expect(htmlContent.includes('<html lang="')).toBe(true);
    });

    test('should have proper charset', () => {
        expect(htmlContent.includes('meta charset')).toBe(true);
    });
});
