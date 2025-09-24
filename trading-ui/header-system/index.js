/**
 * Header System - Main Entry Point
 * ================================
 * 
 * This is the main entry point for the new modular header system.
 * It coordinates all components and provides a unified interface.
 * 
 * Architecture: Component-Based Architecture
 * Version: 1.0.0
 * Last Updated: January 2025
 * 
 * @author TikTrack Development Team
 */

// Import all components
import { HeaderComponent } from './components/HeaderComponent.js';
import { MenuComponent } from './components/MenuComponent.js';
import { FilterComponent } from './components/FilterComponent.js';
import { NavigationComponent } from './components/NavigationComponent.js';
import { StateComponent } from './components/StateComponent.js';
import { UIComponent } from './components/UIComponent.js';
import { TranslationComponent } from './components/TranslationComponent.js';
import { PreferencesComponent } from './components/PreferencesComponent.js';

// Import services
import { EventService } from './services/EventService.js';
import { StateService } from './services/StateService.js';
import { UIService } from './services/UIService.js';

// Import utilities
import { DOMUtils } from './utils/DOMUtils.js';
import { EventUtils } from './utils/EventUtils.js';
import { StateUtils } from './utils/StateUtils.js';

// Import constants
import { EVENTS } from './constants/Events.js';
import { SELECTORS } from './constants/Selectors.js';
import { CONFIG } from './constants/Config.js';

/**
 * Header System Class
 * Main coordinator for all header components
 */
class HeaderSystem {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        this.services = {};
        this.utils = {};
        this.constants = {
            EVENTS,
            SELECTORS,
            CONFIG
        };
    }

    /**
     * Initialize the header system
     */
    async init() {
        if (this.isInitialized) {
            console.warn('HeaderSystem already initialized');
            return;
        }

        try {
            console.log('🚀 Initializing Header System...');

            // Initialize services first
            await this.initializeServices();

            // Initialize components
            await this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Load saved state
            await this.loadSavedState();

            this.isInitialized = true;
            console.log('✅ Header System initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize Header System:', error);
            throw error;
        }
    }

    /**
     * Initialize all services
     */
    async initializeServices() {
        console.log('🔧 Initializing services...');

        this.services.eventService = new EventService();
        this.services.stateService = new StateService();
        this.services.uiService = new UIService();

        await this.services.eventService.init();
        await this.services.stateService.init();
        await this.services.uiService.init();

        console.log('✅ Services initialized');
    }

    /**
     * Initialize all components
     */
    async initializeComponents() {
        console.log('🔧 Initializing components...');

        this.components.header = new HeaderComponent(this.services);
        this.components.menu = new MenuComponent(this.services);
        this.components.filter = new FilterComponent(this.services);
        this.components.navigation = new NavigationComponent(this.services);
        this.components.state = new StateComponent(this.services);
        this.components.ui = new UIComponent(this.services);
        this.components.translation = new TranslationComponent(this.services);
        this.components.preferences = new PreferencesComponent(this.services);

        // Initialize each component
        for (const [name, component] of Object.entries(this.components)) {
            await component.init();
            console.log(`✅ ${name} component initialized`);
        }

        console.log('✅ All components initialized');
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');

        // Listen for page navigation
        this.services.eventService.on('navigation:change', (data) => {
            this.components.navigation.handleNavigationChange(data);
        });

        // Listen for filter changes
        this.services.eventService.on('filter:change', (data) => {
            this.components.filter.handleFilterChange(data);
        });

        // Listen for state changes
        this.services.eventService.on('state:change', (data) => {
            this.components.state.handleStateChange(data);
        });

        console.log('✅ Event listeners setup complete');
    }

    /**
     * Load saved state from storage
     */
    async loadSavedState() {
        try {
            console.log('🔧 Loading saved state...');
            const savedState = await this.services.stateService.loadState();
            
            if (savedState) {
                // Restore component states
                for (const [name, component] of Object.entries(this.components)) {
                    if (component.restoreState && savedState[name]) {
                        await component.restoreState(savedState[name]);
                    }
                }
                console.log('✅ Saved state loaded');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load saved state:', error);
        }
    }

    /**
     * Save current state to storage
     */
    async saveState() {
        try {
            const state = {};
            
            // Collect state from all components
            for (const [name, component] of Object.entries(this.components)) {
                if (component.getState) {
                    state[name] = await component.getState();
                }
            }

            await this.services.stateService.saveState(state);
            console.log('✅ State saved');
        } catch (error) {
            console.error('❌ Failed to save state:', error);
        }
    }

    /**
     * Get component by name
     */
    getComponent(name) {
        return this.components[name];
    }

    /**
     * Get service by name
     */
    getService(name) {
        return this.services[name];
    }

    /**
     * Destroy the header system
     */
    destroy() {
        console.log('🔧 Destroying Header System...');

        // Destroy all components
        for (const [name, component] of Object.entries(this.components)) {
            if (component.destroy) {
                component.destroy();
            }
        }

        // Destroy all services
        for (const [name, service] of Object.entries(this.services)) {
            if (service.destroy) {
                service.destroy();
            }
        }

        this.components = {};
        this.services = {};
        this.isInitialized = false;

        console.log('✅ Header System destroyed');
    }
}

// Export the main class
export { HeaderSystem };

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    window.HeaderSystem = HeaderSystem;
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const headerSystem = new HeaderSystem();
            headerSystem.init().catch(console.error);
            window.headerSystem = headerSystem;
        });
    } else {
        const headerSystem = new HeaderSystem();
        headerSystem.init().catch(console.error);
        window.headerSystem = headerSystem;
    }
}
