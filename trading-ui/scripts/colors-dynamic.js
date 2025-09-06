/**
 * Dynamic Colors System - TikTrack
 * מערכת צבעים דינמית
 */

class DynamicColors {
    constructor() {
        this.colors = {};
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🎨 Loading dynamic colors...');
        await this.loadColors();
        this.updateCSS();
        this.initialized = true;
        console.log('✅ Dynamic colors loaded');
    }

    async loadColors() {
        try {
            const response = await fetch('/api/v1/preferences/');
            if (response.ok) {
                const prefs = await response.json();
                this.colors = {
                    'entity-trade-color': prefs.entityTradeColor || '#007bff',
                    'entity-account-color': prefs.entityAccountColor || '#28a745',
                    'entity-ticker-color': prefs.entityTickerColor || '#dc3545',
                    'entity-alert-color': prefs.entityAlertColor || '#ff9c05'
                };
            } else {
                throw new Error('API failed');
            }
        } catch (error) {
            console.log('Using default colors');
            this.colors = {
                'entity-trade-color': '#007bff',
                'entity-account-color': '#28a745',
                'entity-ticker-color': '#dc3545',
                'entity-alert-color': '#ff9c05'
            };
        }
    }

    updateCSS() {
        Object.entries(this.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
        });
    }
}

window.dynamicColors = new DynamicColors();
document.addEventListener('DOMContentLoaded', () => {
    window.dynamicColors.init();
});