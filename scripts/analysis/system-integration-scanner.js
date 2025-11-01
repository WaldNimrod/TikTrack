#!/usr/bin/env node

/**
 * System Integration Scanner - TikTrack
 * ====================================
 * 
 * כלי סריקה סטטי לזיהוי אינטגרציה ותלויות בין כל המערכות הכלליות
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    scriptsDir: 'trading-ui/scripts',
    outputDir: 'reports/integration-analysis',
    systemsListFile: 'documentation/frontend/GENERAL_SYSTEMS_LIST.md',
    packageManifestFile: 'trading-ui/scripts/init-system/package-manifest.js'
};

// רשימת מערכות כלליות (מעודכנת מ-GENERAL_SYSTEMS_LIST.md)
const KNOWN_SYSTEMS = {
    // Services
    'DataCollectionService': { file: 'services/data-collection-service.js', type: 'Service' },
    'CRUDResponseHandler': { file: 'services/crud-response-handler.js', type: 'Service' },
    'SelectPopulatorService': { file: 'services/select-populator-service.js', type: 'Service' },
    'DefaultValueSetter': { file: 'services/default-value-setter.js', type: 'Service' },
    'LinkedItemsService': { file: 'services/linked-items-service.js', type: 'Service' },
    'FieldRendererService': { file: 'services/field-renderer-service.js', type: 'Service' },
    'StatisticsCalculator': { file: 'services/statistics-calculator.js', type: 'Service' },
    'AlertConditionRenderer': { file: 'services/alert-condition-renderer.js', type: 'Service' },
    
    // Managers
    'ModalManagerV2': { file: 'modal-manager-v2.js', type: 'Manager' },
    'UnifiedCacheManager': { file: 'unified-cache-manager.js', type: 'Manager' },
    'CacheSyncManager': { file: 'cache-sync-manager.js', type: 'Manager' },
    'CachePolicyManager': { file: 'cache-policy-manager.js', type: 'Manager' },
    'ModalNavigationManager': { file: 'modal-navigation-manager.js', type: 'Manager' },
    'EventHandlerManager': { file: 'event-handler-manager.js', type: 'Manager' },
    'PreferencesGroupManager': { file: 'preferences-group-manager.js', type: 'Manager' },
    
    // Systems
    'NotificationSystem': { file: 'notification-system.js', type: 'System' },
    'Logger': { file: 'logger-service.js', type: 'System' },
    'HeaderSystem': { file: 'header-system.js', type: 'System' },
    'ButtonSystem': { file: 'button-system-init.js', type: 'System' },
    'ActionsMenuSystem': { file: 'modules/actions-menu-system.js', type: 'System' },
    'InfoSummarySystem': { file: 'info-summary-system.js', type: 'System' },
    'ColorSchemeSystem': { file: 'color-scheme-system.js', type: 'System' },
    'UnifiedAppInitializer': { file: 'modules/core-systems.js', type: 'System' },
    
    // Entity Services
    'AlertService': { file: 'alert-service.js', type: 'EntityService' },
    'TickerService': { file: 'ticker-service.js', type: 'EntityService' },
    'TradePlanService': { file: 'trade-plan-service.js', type: 'EntityService' },
    'AccountService': { file: 'account-service.js', type: 'EntityService' },
    
    // Entity Details
    'EntityDetailsModal': { file: 'entity-details-modal.js', type: 'Modal' },
    'EntityDetailsRenderer': { file: 'entity-details-renderer.js', type: 'Renderer' },
    'EntityDetailsAPI': { file: 'entity-details-api.js', type: 'API' },
    
    // Utilities
    'toggleSection': { file: 'ui-utils.js', type: 'Utility' },
    'PreferencesCore': { file: 'preferences-core-new.js', type: 'System' },
    'PreferencesSystem': { file: 'preferences.js', type: 'System' },
    
    // Global functions
    'showSuccessNotification': { file: 'notification-system.js', type: 'Function' },
    'showErrorNotification': { file: 'notification-system.js', type: 'Function' },
    'showWarningNotification': { file: 'notification-system.js', type: 'Function' },
    'showInfoNotification': { file: 'notification-system.js', type: 'Function' },
    'showFieldError': { file: 'validation-utils.js', type: 'Function' },
    'clearValidation': { file: 'validation-utils.js', type: 'Function' },
    'loadTableData': { file: 'business-module.js', type: 'Function' },
    'getPageDataFunctions': { file: 'business-module.js', type: 'Function' }
};

class SystemIntegrationScanner {
    constructor() {
        this.scanResults = {
            systems: {},
            dependencies: [],
            circularDependencies: [],
            integrationIssues: [],
            initializationOrder: {}
        };
        
        this.systemFiles = [];
        this.dependencyGraph = new Map();
    }

    /**
     * Main scan function
     */
    async scan() {
        console.log('🔍 Starting system integration scan...\n');
        
        // Step 1: Load system files
        await this.loadSystemFiles();
        
        // Step 2: Scan each system for dependencies
        await this.scanSystemDependencies();
        
        // Step 3: Map initialization order
        await this.mapInitializationOrder();
        
        // Step 4: Detect circular dependencies
        this.detectCircularDependencies();
        
        // Step 5: Generate dependency graph
        this.generateDependencyGraph();
        
        // Step 6: Identify integration issues
        this.identifyIntegrationIssues();
        
        console.log('\n✅ Scan completed!');
        return this.scanResults;
    }

    /**
     * Load all system files to scan
     */
    async loadSystemFiles() {
        const scriptsDir = path.join(process.cwd(), CONFIG.scriptsDir);
        
        // Load from services directory
        const servicesDir = path.join(scriptsDir, 'services');
        if (fs.existsSync(servicesDir)) {
            const serviceFiles = fs.readdirSync(servicesDir)
                .filter(f => f.endsWith('.js'))
                .map(f => path.join('services', f));
            this.systemFiles.push(...serviceFiles);
        }
        
        // Load from modules directory
        const modulesDir = path.join(scriptsDir, 'modules');
        if (fs.existsSync(modulesDir)) {
            const moduleFiles = fs.readdirSync(modulesDir)
                .filter(f => f.endsWith('.js') && !f.includes('.backup'))
                .map(f => path.join('modules', f));
            this.systemFiles.push(...moduleFiles);
        }
        
        // Load root level system files
        const rootFiles = [
            'modal-manager-v2.js',
            'unified-cache-manager.js',
            'cache-sync-manager.js',
            'cache-policy-manager.js',
            'modal-navigation-manager.js',
            'event-handler-manager.js',
            'notification-system.js',
            'logger-service.js',
            'header-system.js',
            'button-system-init.js',
            'color-scheme-system.js',
            'info-summary-system.js',
            'alert-service.js',
            'ticker-service.js',
            'trade-plan-service.js',
            'account-service.js',
            'preferences-group-manager.js',
            'entity-details-modal.js',
            'entity-details-renderer.js',
            'entity-details-api.js',
            'ui-utils.js',
            'preferences-core-new.js',
            'validation-utils.js'
        ];
        
        rootFiles.forEach(file => {
            const fullPath = path.join(scriptsDir, file);
            if (fs.existsSync(fullPath)) {
                this.systemFiles.push(file);
            }
        });
        
        console.log(`📁 Loaded ${this.systemFiles.length} system files to scan`);
    }

    /**
     * Scan each system for dependencies
     */
    async scanSystemDependencies() {
        for (const file of this.systemFiles) {
            const filePath = path.join(process.cwd(), CONFIG.scriptsDir, file);
            
            if (!fs.existsSync(filePath)) {
                continue;
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            const systemName = this.getSystemNameFromFile(file);
            
            if (!systemName) {
                continue;
            }
            
            const dependencies = {
                direct: [],
                indirect: [],
                optional: [],
                required: [],
                initialization: []
            };
            
            // Scan for direct calls: window.SystemName.method()
            dependencies.direct = this.identifyDirectCalls(content, systemName);
            
            // Scan for indirect calls: typeof window.SystemName
            dependencies.indirect = this.identifyIndirectCalls(content, systemName);
            
            // Scan for optional calls: window.System && window.System.method()
            dependencies.optional = this.identifyOptionalCalls(content, systemName);
            
            // Scan for required calls: window.System.method() without checks
            dependencies.required = this.identifyRequiredCalls(content, systemName);
            
            // Store results
            this.scanResults.systems[systemName] = {
                file: file,
                dependencies: dependencies,
                totalDependencies: this.countTotalDependencies(dependencies)
            };
            
            // Build dependency graph
            const allDeps = [
                ...dependencies.direct.map(d => d.target),
                ...dependencies.indirect.map(d => d.target),
                ...dependencies.optional.map(d => d.target),
                ...dependencies.required.map(d => d.target)
            ];
            
            if (!this.dependencyGraph.has(systemName)) {
                this.dependencyGraph.set(systemName, new Set());
            }
            allDeps.forEach(dep => this.dependencyGraph.get(systemName).add(dep));
        }
        
        console.log(`🔗 Scanned dependencies for ${Object.keys(this.scanResults.systems).length} systems`);
    }

    /**
     * Identify direct calls: window.SystemName.method()
     */
    identifyDirectCalls(content, currentSystem) {
        const calls = [];
        
        // Pattern: window.SystemName.method() or window.SystemName.property
        const directPattern = /window\.(\w+Service|\w+Manager|\w+System|ModalManagerV2|UnifiedCacheManager|Logger|NotificationSystem|FieldRendererService|DataCollectionService|CRUDResponseHandler|SelectPopulatorService|DefaultValueSetter|LinkedItemsService|EventHandlerManager|ActionsMenuSystem|ButtonSystem|EntityDetailsModal|EntityDetailsRenderer|EntityDetailsAPI|AlertService|TickerService|TradePlanService|AccountService|PreferencesGroupManager|InfoSummarySystem|StatisticsCalculator|AlertConditionRenderer|PreferencesCore|PreferencesSystem|toggleSection|showSuccessNotification|showErrorNotification|showWarningNotification|showInfoNotification|showFieldError|clearValidation|loadTableData|getPageDataFunctions)\.(\w+)/g;
        
        let match;
        while ((match = directPattern.exec(content)) !== null) {
            const target = match[1];
            const method = match[2];
            
            if (target !== currentSystem && KNOWN_SYSTEMS[target]) {
                calls.push({
                    target: target,
                    method: method,
                    type: 'direct',
                    line: this.getLineNumber(content, match.index),
                    integrationType: 'Direct'
                });
            }
        }
        
        return calls;
    }

    /**
     * Identify indirect calls: typeof window.SystemName
     */
    identifyIndirectCalls(content, currentSystem) {
        const calls = [];
        
        // Pattern: typeof window.SystemName
        const indirectPattern = /typeof\s+window\.(\w+Service|\w+Manager|\w+System|ModalManagerV2|UnifiedCacheManager|Logger|NotificationSystem|FieldRendererService|DataCollectionService|CRUDResponseHandler|SelectPopulatorService|DefaultValueSetter|LinkedItemsService|EventHandlerManager|ActionsMenuSystem|ButtonSystem|EntityDetailsModal|EntityDetailsRenderer|EntityDetailsAPI|AlertService|TickerService|TradePlanService|AccountService|PreferencesGroupManager|InfoSummarySystem|StatisticsCalculator|AlertConditionRenderer|PreferencesCore|PreferencesSystem|toggleSection)/g;
        
        let match;
        while ((match = indirectPattern.exec(content)) !== null) {
            const target = match[1];
            
            if (target !== currentSystem && KNOWN_SYSTEMS[target]) {
                calls.push({
                    target: target,
                    type: 'indirect',
                    line: this.getLineNumber(content, match.index),
                    integrationType: 'Indirect'
                });
            }
        }
        
        return calls;
    }

    /**
     * Identify optional calls: window.System && window.System.method()
     */
    identifyOptionalCalls(content, currentSystem) {
        const calls = [];
        
        // Pattern: window.System && window.System.method()
        const optionalPattern = /window\.(\w+Service|\w+Manager|\w+System|ModalManagerV2|UnifiedCacheManager|Logger|NotificationSystem|FieldRendererService|DataCollectionService|CRUDResponseHandler|SelectPopulatorService|DefaultValueSetter|LinkedItemsService|EventHandlerManager|ActionsMenuSystem|ButtonSystem|EntityDetailsModal|EntityDetailsRenderer|EntityDetailsAPI|AlertService|TickerService|TradePlanService|AccountService|PreferencesGroupManager|InfoSummarySystem|StatisticsCalculator|AlertConditionRenderer|PreferencesCore|PreferencesSystem|toggleSection)\s*&&\s*window\.\1\.(\w+)/g;
        
        let match;
        while ((match = optionalPattern.exec(content)) !== null) {
            const target = match[1];
            const method = match[2];
            
            if (target !== currentSystem && KNOWN_SYSTEMS[target]) {
                calls.push({
                    target: target,
                    method: method,
                    type: 'optional',
                    line: this.getLineNumber(content, match.index),
                    integrationType: 'Optional'
                });
            }
        }
        
        return calls;
    }

    /**
     * Identify required calls (direct without optional checks)
     */
    identifyRequiredCalls(content, currentSystem) {
        const calls = [];
        const directCalls = this.identifyDirectCalls(content, currentSystem);
        const optionalCalls = this.identifyOptionalCalls(content, currentSystem);
        
        // Find direct calls that are not in optional context
        directCalls.forEach(directCall => {
            const isOptional = optionalCalls.some(opt => 
                opt.target === directCall.target && opt.method === directCall.method
            );
            
            if (!isOptional) {
                calls.push({
                    ...directCall,
                    integrationType: 'Required'
                });
            }
        });
        
        return calls;
    }

    /**
     * Map initialization order from package-manifest.js
     */
    async mapInitializationOrder() {
        const manifestPath = path.join(process.cwd(), CONFIG.packageManifestFile);
        
        if (!fs.existsSync(manifestPath)) {
            console.warn('⚠️  Package manifest not found, skipping initialization order mapping');
            return;
        }
        
        try {
            const content = fs.readFileSync(manifestPath, 'utf8');
            
            // Extract loadOrder from scripts
            const loadOrderPattern = /loadOrder:\s*(\d+)/g;
            const filePattern = /file:\s*['"]([^'"]+)['"]/g;
            
            const orders = {};
            let currentFile = null;
            let match;
            
            // Simple parsing - find file and its loadOrder
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                const fileMatch = line.match(/file:\s*['"]([^'"]+)['"]/);
                if (fileMatch) {
                    currentFile = fileMatch[1];
                }
                
                const orderMatch = line.match(/loadOrder:\s*(\d+)/);
                if (orderMatch && currentFile) {
                    orders[currentFile] = parseInt(orderMatch[1]);
                    currentFile = null;
                }
            }
            
            this.scanResults.initializationOrder = orders;
            console.log(`📋 Mapped initialization order for ${Object.keys(orders).length} files`);
        } catch (error) {
            console.error('❌ Error mapping initialization order:', error.message);
        }
    }

    /**
     * Detect circular dependencies
     */
    detectCircularDependencies() {
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];
        
        const dfs = (node, path = []) => {
            visited.add(node);
            recursionStack.add(node);
            
            const dependencies = this.dependencyGraph.get(node) || new Set();
            
            for (const dep of dependencies) {
                if (!visited.has(dep)) {
                    const newPath = [...path, node];
                    dfs(dep, newPath);
                } else if (recursionStack.has(dep)) {
                    // Found cycle
                    const cycleStart = path.indexOf(dep);
                    const cycle = [...path.slice(cycleStart), dep, node];
                    cycles.push(cycle);
                }
            }
            
            recursionStack.delete(node);
        };
        
        for (const system of this.dependencyGraph.keys()) {
            if (!visited.has(system)) {
                dfs(system);
            }
        }
        
        this.scanResults.circularDependencies = cycles;
        
        if (cycles.length > 0) {
            console.warn(`⚠️  Found ${cycles.length} circular dependencies`);
        } else {
            console.log('✅ No circular dependencies detected');
        }
    }

    /**
     * Generate dependency graph structure
     */
    generateDependencyGraph() {
        const graph = {
            nodes: [],
            edges: []
        };
        
        // Create nodes
        for (const systemName of this.dependencyGraph.keys()) {
            const systemInfo = KNOWN_SYSTEMS[systemName] || { type: 'Unknown' };
            graph.nodes.push({
                id: systemName,
                label: systemName,
                type: systemInfo.type,
                file: systemInfo.file
            });
        }
        
        // Create edges
        for (const [source, dependencies] of this.dependencyGraph.entries()) {
            for (const target of dependencies) {
                graph.edges.push({
                    from: source,
                    to: target,
                    type: 'depends_on'
                });
            }
        }
        
        this.scanResults.dependencyGraph = graph;
        console.log(`📊 Generated dependency graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
    }

    /**
     * Identify integration issues
     */
    identifyIntegrationIssues() {
        const issues = [];
        
        // Check for missing dependencies
        for (const [systemName, deps] of this.dependencyGraph.entries()) {
            for (const dep of deps) {
                if (!KNOWN_SYSTEMS[dep]) {
                    issues.push({
                        system: systemName,
                        issue: 'Unknown dependency',
                        dependency: dep,
                        severity: 'warning',
                        type: 'Missing System Definition'
                    });
                }
            }
        }
        
        // Check for systems without dependencies (potential orphans)
        const systemsWithDeps = new Set();
        for (const deps of this.dependencyGraph.values()) {
            for (const dep of deps) {
                systemsWithDeps.add(dep);
            }
        }
        
        for (const systemName of this.dependencyGraph.keys()) {
            if (!systemsWithDeps.has(systemName) && this.dependencyGraph.get(systemName).size === 0) {
                issues.push({
                    system: systemName,
                    issue: 'No dependencies and not used by others',
                    severity: 'info',
                    type: 'Potential Orphan System'
                });
            }
        }
        
        this.scanResults.integrationIssues = issues;
        
        if (issues.length > 0) {
            console.log(`⚠️  Found ${issues.length} integration issues`);
        } else {
            console.log('✅ No integration issues detected');
        }
    }

    /**
     * Helper: Get system name from file path
     */
    getSystemNameFromFile(file) {
        const fileName = path.basename(file, '.js');
        
        // Try to find in KNOWN_SYSTEMS
        for (const [name, info] of Object.entries(KNOWN_SYSTEMS)) {
            if (info.file === file || info.file.endsWith(fileName + '.js')) {
                return name;
            }
        }
        
        // Try to match by class/global name patterns
        return null;
    }

    /**
     * Helper: Get line number from content and index
     */
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    /**
     * Helper: Count total dependencies
     */
    countTotalDependencies(deps) {
        return deps.direct.length + deps.indirect.length + deps.optional.length + deps.required.length;
    }

    /**
     * Save results to file
     */
    async saveResults() {
        const outputDir = path.join(process.cwd(), CONFIG.outputDir);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputFile = path.join(outputDir, 'integration-scan-results.json');
        fs.writeFileSync(outputFile, JSON.stringify(this.scanResults, null, 2));
        
        console.log(`💾 Results saved to: ${outputFile}`);
        return outputFile;
    }
}

// Main execution
if (require.main === module) {
    const scanner = new SystemIntegrationScanner();
    scanner.scan()
        .then(() => scanner.saveResults())
        .then(() => {
            console.log('\n✅ Integration scan complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Scan failed:', error);
            process.exit(1);
        });
}

module.exports = SystemIntegrationScanner;


