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

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Preferences Page E2E Tests', () => {
    let dom;
    let document;
    let window;

    beforeAll(async () => {
        // Load the HTML file
        const htmlPath = path.join(__dirname, '../../../trading-ui/preferences.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Create JSDOM instance
        dom = new JSDOM(htmlContent, {
            url: 'http://localhost:8080/preferences.html',
            pretendToBeVisual: true,
            resources: 'usable'
        });
        
        document = dom.window.document;
        window = dom.window;
        global.window = window;
        global.document = document;
    });

    afterAll(() => {
        if (dom) {
            dom.window.close();
        }
    });

    test('should load preferences page successfully', () => {
        expect(document.title).toBeDefined();
        expect(document.body).toBeDefined();
    });

    test('should have preferences form', () => {
        // Check for preferences form
        const preferencesForm = document.querySelector('#preferencesForm') ||
                               document.querySelector('.preferences-form') ||
                               document.querySelector('form');
        expect(preferencesForm).toBeTruthy();
    });

    test('should have preference sections', () => {
        // Check for preference sections
        const sections = document.querySelectorAll('.preference-section') ||
                        document.querySelectorAll('.preferences-section');
        expect(sections.length).toBeGreaterThan(0);
    });

    test('should load required scripts', () => {
        // Check for required script tags
        const scripts = document.querySelectorAll('script[src]');
        const scriptSources = Array.from(scripts).map(script => script.src);
        
        // Check for essential scripts
        expect(scriptSources.some(src => src.includes('preferences'))).toBe(true);
    });

    test('should have proper page structure', () => {
        // Check for main content area
        const mainContent = document.querySelector('main') ||
                           document.querySelector('.main-content') ||
                           document.querySelector('#main');
        expect(mainContent).toBeTruthy();
    });

    test('should be responsive', () => {
        // Check for viewport meta tag
        const viewport = document.querySelector('meta[name="viewport"]');
        expect(viewport).toBeTruthy();
    });
});
