/**
 * Page Templates - TikTrack Smart Initialization System
 * ====================================================
 * 
 * Predefined templates for different page types with standardized configurations
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @created October 19, 2025
 */

class PageTemplates {
  constructor() {
    this.templates = new Map();
    this.initialized = false;
    
    // Initialize with predefined templates
    this.initializeTemplates();
  }

  /**
   * Initialize predefined page templates
   * אתחול תבניות עמודים מוגדרות מראש
   */
  initializeTemplates() {
    console.log('📄 Initializing Page Templates...');

    // 1. Simple Page Template - עמוד פשוט
    this.registerTemplate('simple-page', {
      name: 'Simple Page',
      description: 'עמוד פשוט עם פונקציונליות בסיסית',
      packages: ['base'],
      systems: [],
      features: [],
      customInitializers: ['initSimplePage'],
      requiredScripts: [],
      optionalScripts: [],
      cssFiles: [],
      loadOrder: 1,
      complexity: 'low',
      useCases: [
        'עמודים סטטיים',
        'עמודי מידע',
        'עמודים פשוטים ללא אינטראקציה'
      ],
      examples: ['preferences.html', 'notes.html', 'designs.html']
    });

    // 2. CRUD Page Template - עמוד CRUD
    this.registerTemplate('crud-page', {
      name: 'CRUD Page',
      description: 'עמוד עם פונקציונליות CRUD מלאה',
      packages: ['base', 'crud', 'filters'],
      systems: [
        'tables',
        'data-utils',
        'pagination-system',
        'header-filters',
        'category-detector'
      ],
      features: [
        'data-loading',
        'data-editing',
        'data-deletion',
        'data-creation',
        'filtering',
        'pagination',
        'search'
      ],
      customInitializers: ['initCRUDPage'],
      requiredScripts: [
        'scripts/tables.js',
        'scripts/data-utils.js',
        'scripts/pagination-system.js'
      ],
      optionalScripts: [
        'scripts/advanced-filters.js',
        'scripts/bulk-operations.js'
      ],
      cssFiles: [
        'styles-new/06-components/_tables.css',
        'styles-new/06-components/_pagination-system.css'
      ],
      loadOrder: 2,
      complexity: 'high',
      useCases: [
        'עמודים עם טבלאות נתונים',
        'עמודים עם פונקציונליות עריכה',
        'עמודים עם סינון וחיפוש'
      ],
      examples: ['trades.html', 'alerts.html', 'executions.html', 'tickers.html']
    });

    // 3. Dashboard Page Template - עמוד דשבורד
    this.registerTemplate('dashboard-page', {
      name: 'Dashboard Page',
      description: 'עמוד דשבורד עם גרפים וסטטיסטיקות',
      packages: ['base', 'crud', 'charts', 'advanced-notifications'],
      systems: [
        'tables',
        'data-utils',
        'chart-system',
        'chart-export',
        'notification-category-detector',
        'global-notification-collector'
      ],
      features: [
        'data-visualization',
        'real-time-updates',
        'interactive-charts',
        'statistics-display',
        'notification-center',
        'data-export'
      ],
      customInitializers: ['initDashboardPage'],
      requiredScripts: [
        'scripts/tables.js',
        'scripts/data-utils.js',
        'scripts/charts/chart-system.js',
        'scripts/notification-category-detector.js'
      ],
      optionalScripts: [
        'scripts/charts/chart-export.js',
        'scripts/real-time-updates.js'
      ],
      cssFiles: [
        'styles-new/06-components/_tables.css',
        'styles-new/06-components/_charts.css'
      ],
      loadOrder: 3,
      complexity: 'high',
      useCases: [
        'עמודים עם גרפים',
        'עמודים עם סטטיסטיקות',
        'עמודים עם עדכונים בזמן אמת'
      ],
      examples: ['index.html', 'research.html', 'external-data-dashboard.html']
    });

    // 4. Dev Tools Page Template - עמוד כלי פיתוח
    this.registerTemplate('dev-tools-page', {
      name: 'Development Tools Page',
      description: 'עמוד כלי פיתוח וניטור',
      packages: ['base', 'crud', 'advanced-notifications', 'ui-advanced'],
      systems: [
        'tables',
        'data-utils',
        'notification-category-detector',
        'global-notification-collector',
        'active-alerts-component',
        'button-system',
        'color-scheme-system'
      ],
      features: [
        'system-monitoring',
        'debug-tools',
        'performance-metrics',
        'log-viewing',
        'system-controls',
        'advanced-ui'
      ],
      customInitializers: ['initDevToolsPage'],
      requiredScripts: [
        'scripts/tables.js',
        'scripts/data-utils.js',
        'scripts/notification-category-detector.js',
        'scripts/button-system-init.js'
      ],
      optionalScripts: [
        'scripts/debug-tools.js',
        'scripts/performance-monitor.js'
      ],
      cssFiles: [
        'styles-new/06-components/_tables.css',
        'styles-new/06-components/_system-management.css'
      ],
      loadOrder: 4,
      complexity: 'high',
      useCases: [
        'עמודים לניטור מערכת',
        'עמודים לכלי פיתוח',
        'עמודים לניהול מערכת'
      ],
      examples: ['system-management.html', 'server-monitor.html', 'linter-realtime-monitor.html']
    });

    // 5. Settings Page Template - עמוד הגדרות
    this.registerTemplate('settings-page', {
      name: 'Settings Page',
      description: 'עמוד הגדרות והעדפות',
      packages: ['base', 'preferences', 'ui-advanced'],
      systems: [
        'preferences-system',
        'preferences-admin',
        'button-system',
        'color-scheme-system'
      ],
      features: [
        'preferences-management',
        'settings-validation',
        'theme-controls',
        'user-preferences',
        'system-settings'
      ],
      customInitializers: ['initSettingsPage'],
      requiredScripts: [
        'scripts/preferences.js',
        'scripts/preferences-admin.js',
        'scripts/button-system-init.js'
      ],
      optionalScripts: [
        'scripts/advanced-preferences.js',
        'scripts/theme-manager.js'
      ],
      cssFiles: [
        'styles-new/06-components/_forms-advanced.css',
        'styles-new/06-components/_buttons-advanced.css'
      ],
      loadOrder: 5,
      complexity: 'medium',
      useCases: [
        'עמודים להגדרות משתמש',
        'עמודים להעדפות מערכת',
        'עמודים לניהול תצורה'
      ],
      examples: ['preferences.html', 'css-management.html']
    });

    this.initialized = true;
    console.log(`✅ Page Templates initialized with ${this.templates.size} templates`);
  }

  /**
   * Register a page template
   * רישום תבנית עמוד
   */
  registerTemplate(id, config) {
    if (this.templates.has(id)) {
      console.warn(`⚠️ Template '${id}' already registered, overwriting...`);
    }

    // Validate template configuration
    this.validateTemplateConfig(id, config);

    this.templates.set(id, {
      id,
      ...config,
      registeredAt: new Date().toISOString()
    });

    console.log(`📄 Registered template: ${id} - ${config.name}`);
  }

  /**
   * Validate template configuration
   * ולידציה של קונפיגורציית תבנית
   */
  validateTemplateConfig(id, config) {
    const required = ['name', 'description', 'packages', 'systems', 'features', 'customInitializers'];
    const missing = required.filter(field => !config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Template '${id}' missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(config.packages)) {
      throw new Error(`Template '${id}' packages must be an array`);
    }

    if (!Array.isArray(config.systems)) {
      throw new Error(`Template '${id}' systems must be an array`);
    }

    if (!Array.isArray(config.features)) {
      throw new Error(`Template '${id}' features must be an array`);
    }

    if (!Array.isArray(config.customInitializers)) {
      throw new Error(`Template '${id}' customInitializers must be an array`);
    }
  }

  /**
   * Get template by ID
   * קבלת תבנית לפי מזהה
   */
  getTemplate(id) {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   * קבלת כל התבניות
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by complexity
   * קבלת תבניות לפי מורכבות
   */
  getTemplatesByComplexity(complexity) {
    return this.getAllTemplates().filter(template => template.complexity === complexity);
  }

  /**
   * Get templates by use case
   * קבלת תבניות לפי מקרה שימוש
   */
  getTemplatesByUseCase(useCase) {
    return this.getAllTemplates().filter(template => 
      template.useCases.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))
    );
  }

  /**
   * Generate page configuration from template
   * יצירת קונפיגורציית עמוד מתבנית
   */
  generatePageConfig(templateId, pageName, customizations = {}) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const config = {
      name: pageName,
      template: templateId,
      packages: [...template.packages],
      systems: [...template.systems],
      features: [...template.features],
      customInitializers: [...template.customInitializers],
      requiredScripts: [...template.requiredScripts],
      optionalScripts: [...template.optionalScripts],
      cssFiles: [...template.cssFiles],
      loadOrder: template.loadOrder,
      complexity: template.complexity,
      useCases: [...template.useCases],
      examples: [...template.examples],
      ...customizations,
      generatedAt: new Date().toISOString()
    };

    return config;
  }

  /**
   * Get scripts for template
   * קבלת סקריפטים לתבנית
   */
  getScriptsForTemplate(templateId) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return {
      required: template.requiredScripts || [],
      optional: template.optionalScripts || [],
      all: [...(template.requiredScripts || []), ...(template.optionalScripts || [])]
    };
  }

  /**
   * Get CSS files for template
   * קבלת קבצי CSS לתבנית
   */
  getCSSFilesForTemplate(templateId) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return template.cssFiles || [];
  }

  /**
   * Validate template for page
   * ולידציה של תבנית לעמוד
   */
  validateTemplateForPage(templateId, pageName) {
    const template = this.getTemplate(templateId);
    if (!template) {
      return { valid: false, errors: [`Template not found: ${templateId}`] };
    }

    const errors = [];
    const warnings = [];

    // Check if page name is provided
    if (!pageName) {
      errors.push('Page name is required');
    }

    // Check if template has required packages
    if (!template.packages || template.packages.length === 0) {
      warnings.push('Template has no packages defined');
    }

    // Check if template has required systems
    if (!template.systems || template.systems.length === 0) {
      warnings.push('Template has no systems defined');
    }

    // Check if template has custom initializers
    if (!template.customInitializers || template.customInitializers.length === 0) {
      warnings.push('Template has no custom initializers defined');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get template statistics
   * קבלת סטטיסטיקות תבניות
   */
  getStatistics() {
    const allTemplates = this.getAllTemplates();
    
    return {
      total: allTemplates.length,
      byComplexity: {
        low: allTemplates.filter(t => t.complexity === 'low').length,
        medium: allTemplates.filter(t => t.complexity === 'medium').length,
        high: allTemplates.filter(t => t.complexity === 'high').length
      },
      totalPackages: allTemplates.reduce((sum, t) => sum + t.packages.length, 0),
      totalSystems: allTemplates.reduce((sum, t) => sum + t.systems.length, 0),
      totalFeatures: allTemplates.reduce((sum, t) => sum + t.features.length, 0),
      totalScripts: allTemplates.reduce((sum, t) => sum + (t.requiredScripts?.length || 0) + (t.optionalScripts?.length || 0), 0)
    };
  }

  /**
   * Find template for page
   * מציאת תבנית לעמוד
   */
  findTemplateForPage(pageName, pageFeatures = []) {
    const templates = this.getAllTemplates();
    
    // Score templates based on feature match
    const scoredTemplates = templates.map(template => {
      let score = 0;
      
      // Check if template features match page features
      for (const feature of pageFeatures) {
        if (template.features.includes(feature)) {
          score += 2;
        }
      }
      
      // Check if template examples include similar pages
      for (const example of template.examples) {
        if (example.toLowerCase().includes(pageName.toLowerCase()) || 
            pageName.toLowerCase().includes(example.toLowerCase())) {
          score += 3;
        }
      }
      
      // Prefer simpler templates for simple pages
      if (template.complexity === 'low' && pageFeatures.length === 0) {
        score += 1;
      }
      
      return { template, score };
    });
    
    // Sort by score and return best match
    scoredTemplates.sort((a, b) => b.score - a.score);
    
    return scoredTemplates[0]?.template || null;
  }

  /**
   * Export template configuration
   * ייצוא קונפיגורציית תבנית
   */
  exportConfiguration() {
    return {
      templates: Object.fromEntries(this.templates),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Create global instance
window.PageTemplates = PageTemplates;
window.pageTemplates = new PageTemplates();
window.PAGE_TEMPLATES = window.pageTemplates.templates;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PageTemplates;
}

console.log('📄 Page Templates loaded successfully');
