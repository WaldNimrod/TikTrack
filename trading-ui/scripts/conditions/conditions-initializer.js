/**
 * Conditions Initializer - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the conditions system initializer for TikTrack including:
 * - System initialization and dependency management
 * - Component loading and setup
 * - Error handling and validation
 * - Integration with unified app initializer
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

/**
 * Conditions System Initializer class
 * @class ConditionsInitializer
 */
class ConditionsInitializer {
    constructor() {
        this.isInitialized = false;
        this.components = {
            translations: null,
            validator: null,
            crudManager: null,
            formGenerator: null
        };
        this.dependencies = [
            'conditions-translations.js',
            'conditions-validator.js', 
            'conditions-crud-manager.js',
            'conditions-form-generator.js'
        ];
    }
    
    /**
     * Initialize conditions system
     * @function initialize
     * @async
     * @returns {Promise<boolean>} Initialization success
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('🔧 Conditions system already initialized');
            return true;
        }
        
        try {
            console.log('🚀 Initializing Conditions System...');
            
            // Check dependencies
            await this.checkDependencies();
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup global access
            this.setupGlobalAccess();
            
            // Register with unified initialization system
            this.registerWithUnifiedSystem();
            
            this.isInitialized = true;
            console.log('✅ Conditions System initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Conditions System:', error);
            return false;
        }
    }
    
    /**
     * Check dependencies
     * @function checkDependencies
     * @async
     * @returns {Promise<void>}
     */
    async checkDependencies() {
        console.log('🔍 Checking Conditions System dependencies...');
        
        const missingDependencies = [];
        
        for (const dependency of this.dependencies) {
            if (!this.isScriptLoaded(dependency)) {
                missingDependencies.push(dependency);
            }
        }
        
        if (missingDependencies.length > 0) {
            throw new Error(`Missing dependencies: ${missingDependencies.join(', ')}`);
        }
        
        console.log('✅ All dependencies loaded');
    }
    
    /**
     * Check if script is loaded
     * @function isScriptLoaded
     * @param {string} scriptName - Script name
     * @returns {boolean} Whether script is loaded
     */
    isScriptLoaded(scriptName) {
        const scripts = document.querySelectorAll('script[src]');
        for (const script of scripts) {
            if (script.src.includes(scriptName)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Initialize components
     * @function initializeComponents
     * @async
     * @returns {Promise<void>}
     */
    async initializeComponents() {
        console.log('🔧 Initializing Conditions System components...');
        
        // Initialize translations
        if (window.conditionsTranslations) {
            this.components.translations = window.conditionsTranslations;
            console.log('✅ Translations component initialized');
        } else {
            throw new Error('Translations component not available');
        }
        
        // Initialize validator
        if (window.conditionsValidator) {
            this.components.validator = window.conditionsValidator;
            console.log('✅ Validator component initialized');
        } else {
            throw new Error('Validator component not available');
        }
        
        // Initialize CRUD manager
        if (window.conditionsCRUDManager) {
            this.components.crudManager = window.conditionsCRUDManager;
            console.log('✅ CRUD Manager component initialized');
        } else {
            throw new Error('CRUD Manager component not available');
        }
        
        // Initialize form generator
        if (window.conditionsFormGenerator) {
            this.components.formGenerator = window.conditionsFormGenerator;
            console.log('✅ Form Generator component initialized');
        } else {
            throw new Error('Form Generator component not available');
        }
    }
    
    /**
     * Setup global access
     * @function setupGlobalAccess
     * @returns {void}
     */
    setupGlobalAccess() {
        console.log('🌐 Setting up global access...');
        
        // Make components globally accessible
        window.conditionsSystem = {
            translations: this.components.translations,
            validator: this.components.validator,
            crudManager: this.components.crudManager,
            formGenerator: this.components.formGenerator,
            initializer: this
        };
        
        // Create convenience methods
        window.conditionsSystem.translate = (key, defaultValue) => {
            return this.components.translations.get(key, defaultValue);
        };
        
        window.conditionsSystem.validate = (data) => {
            return this.components.validator.validateCondition(data);
        };
        
        window.conditionsSystem.create = (tradePlanId, data) => {
            return this.components.crudManager.createCondition(tradePlanId, data);
        };
        
        window.conditionsSystem.read = (tradePlanId) => {
            return this.components.crudManager.readConditions(tradePlanId);
        };
        
        window.conditionsSystem.update = (conditionId, data) => {
            return this.components.crudManager.updateCondition(conditionId, data);
        };
        
        window.conditionsSystem.delete = (conditionId) => {
            return this.components.crudManager.deleteCondition(conditionId);
        };
        
        window.conditionsSystem.generateForm = (containerId, options) => {
            return this.components.formGenerator.generateConditionForm(containerId, options);
        };
        
        console.log('✅ Global access configured');
    }
    
    /**
     * Register with unified system
     * @function registerWithUnifiedSystem
     * @returns {void}
     */
    registerWithUnifiedSystem() {
        console.log('📋 Registering with Unified Initialization System...');
        
        // Register as a system component
        if (window.unifiedAppInitializer) {
            window.unifiedAppInitializer.registerSystem('conditions', {
                name: 'Conditions System',
                version: '1.0.0',
                description: 'Comprehensive conditions and reasons management system',
                components: Object.keys(this.components),
                dependencies: this.dependencies,
                status: 'initialized'
            });
        }
        
        console.log('✅ Registered with Unified Initialization System');
    }
    
    /**
     * Get system status
     * @function getStatus
     * @returns {Object} System status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            components: Object.keys(this.components).map(key => ({
                name: key,
                available: this.components[key] !== null
            })),
            dependencies: this.dependencies.map(dep => ({
                name: dep,
                loaded: this.isScriptLoaded(dep)
            }))
        };
    }
    
    /**
     * Get component
     * @function getComponent
     * @param {string} componentName - Component name
     * @returns {Object|null} Component instance
     */
    getComponent(componentName) {
        if (!this.isInitialized) {
            console.warn('Conditions System not initialized');
            return null;
        }
        
        return this.components[componentName] || null;
    }
    
    /**
     * Reset system
     * @function reset
     * @returns {void}
     */
    reset() {
        console.log('🔄 Resetting Conditions System...');
        
        this.isInitialized = false;
        this.components = {
            translations: null,
            validator: null,
            crudManager: null,
            formGenerator: null
        };
        
        // Clear global access
        if (window.conditionsSystem) {
            delete window.conditionsSystem;
        }
        
        console.log('✅ Conditions System reset');
    }
    
    /**
     * Health check
     * @function healthCheck
     * @returns {Object} Health status
     */
    healthCheck() {
        const status = this.getStatus();
        const issues = [];
        
        if (!status.isInitialized) {
            issues.push('System not initialized');
        }
        
        status.components.forEach(component => {
            if (!component.available) {
                issues.push(`Component ${component.name} not available`);
            }
        });
        
        status.dependencies.forEach(dep => {
            if (!dep.loaded) {
                issues.push(`Dependency ${dep.name} not loaded`);
            }
        });
        
        return {
            healthy: issues.length === 0,
            issues: issues,
            status: status
        };
    }
}

// Create global instance
window.ConditionsInitializer = ConditionsInitializer;
window.conditionsInitializer = new ConditionsInitializer();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.conditionsInitializer.initialize();
    });
} else {
    // DOM already loaded
    window.conditionsInitializer.initialize();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConditionsInitializer;
}





