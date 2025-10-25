#!/usr/bin/env node

/**
 * JSDoc Addition Script - TikTrack
 * =================================
 * 
 * Automatically adds JSDoc comments to functions and classes
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
    sourceDir: 'trading-ui/scripts',
    outputDir: 'trading-ui/scripts',
    backupDir: 'backup',
    extensions: ['.js'],
    excludePatterns: ['node_modules/**', '*.min.js', '*.bundle.js'],
    jsdocTemplate: {
        function: `/**
 * {description}
 * 
 * @param {type} param - Parameter description
 * @returns {type} Return description
 * @throws {Error} Error description
 * 
 * @example
 * const result = {functionName}(param);
 */`,
        class: `/**
 * {className} - {description}
 * =================================
 * 
 * {detailedDescription}
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * @example
 * const instance = new {className}();
 */`,
        method: `/**
 * {description}
 * 
 * @param {type} param - Parameter description
 * @returns {type} Return description
 * @throws {Error} Error description
 * 
 * @example
 * const result = instance.{methodName}(param);
 */`
    }
};

/**
 * Main function to add JSDoc to all files
 */
async function main() {
    try {
        console.log('🚀 Starting JSDoc addition process...');
        
        // Find all JavaScript files
        const files = await findJavaScriptFiles();
        console.log(`📁 Found ${files.length} JavaScript files`);
        
        // Process each file
        for (const file of files) {
            await processFile(file);
        }
        
        console.log('✅ JSDoc addition completed successfully!');
        
    } catch (error) {
        console.error('❌ Error adding JSDoc:', error.message);
        process.exit(1);
    }
}

/**
 * Find all JavaScript files in the source directory
 * @returns {Promise<Array<string>>} Array of file paths
 */
async function findJavaScriptFiles() {
    return new Promise((resolve, reject) => {
        const pattern = `${CONFIG.sourceDir}/**/*.js`;
        glob(pattern, { ignore: CONFIG.excludePatterns }, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

/**
 * Process a single file to add JSDoc
 * @param {string} filePath - Path to the file
 */
async function processFile(filePath) {
    try {
        console.log(`📄 Processing file: ${filePath}`);
        
        // Read file content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Create backup
        await createBackup(filePath, content);
        
        // Add JSDoc to content
        const updatedContent = addJSDocToContent(content, filePath);
        
        // Write updated content
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        console.log(`✅ Added JSDoc to: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error processing file ${filePath}:`, error.message);
    }
}

/**
 * Create backup of the original file
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 */
async function createBackup(filePath, content) {
    const backupDir = path.join(CONFIG.backupDir, path.dirname(filePath));
    const backupFile = path.join(backupDir, path.basename(filePath));
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Write backup file
    fs.writeFileSync(backupFile, content, 'utf8');
}

/**
 * Add JSDoc comments to file content
 * @param {string} content - Original file content
 * @param {string} filePath - File path for context
 * @returns {string} Updated content with JSDoc
 */
function addJSDocToContent(content, filePath) {
    let updatedContent = content;
    
    // Add JSDoc to functions
    updatedContent = addJSDocToFunctions(updatedContent, filePath);
    
    // Add JSDoc to classes
    updatedContent = addJSDocToClasses(updatedContent, filePath);
    
    // Add JSDoc to methods
    updatedContent = addJSDocToMethods(updatedContent, filePath);
    
    return updatedContent;
}

/**
 * Add JSDoc to functions
 * @param {string} content - File content
 * @param {string} filePath - File path for context
 * @returns {string} Updated content
 */
function addJSDocToFunctions(content, filePath) {
    // Pattern to match function declarations
    const functionPattern = /^(\s*)(function\s+(\w+)\s*\([^)]*\)\s*{)/gm;
    
    return content.replace(functionPattern, (match, indent, functionDecl, functionName) => {
        // Check if JSDoc already exists
        const beforeMatch = content.substring(0, content.indexOf(match));
        const lastComment = beforeMatch.lastIndexOf('/**');
        const lastFunction = beforeMatch.lastIndexOf('function');
        
        if (lastComment > lastFunction) {
            return match; // JSDoc already exists
        }
        
        // Generate JSDoc for function
        const jsdoc = generateFunctionJSDoc(functionName, functionDecl);
        return `${indent}${jsdoc}\n${indent}${functionDecl}`;
    });
}

/**
 * Add JSDoc to classes
 * @param {string} content - File content
 * @param {string} filePath - File path for context
 * @returns {string} Updated content
 */
function addJSDocToClasses(content, filePath) {
    // Pattern to match class declarations
    const classPattern = /^(\s*)(class\s+(\w+)(?:\s+extends\s+\w+)?\s*{)/gm;
    
    return content.replace(classPattern, (match, indent, classDecl, className) => {
        // Check if JSDoc already exists
        const beforeMatch = content.substring(0, content.indexOf(match));
        const lastComment = beforeMatch.lastIndexOf('/**');
        const lastClass = beforeMatch.lastIndexOf('class');
        
        if (lastComment > lastClass) {
            return match; // JSDoc already exists
        }
        
        // Generate JSDoc for class
        const jsdoc = generateClassJSDoc(className, classDecl);
        return `${indent}${jsdoc}\n${indent}${classDecl}`;
    });
}

/**
 * Add JSDoc to methods
 * @param {string} content - File content
 * @param {string} filePath - File path for context
 * @returns {string} Updated content
 */
function addJSDocToMethods(content, filePath) {
    // Pattern to match method declarations
    const methodPattern = /^(\s*)(\w+)\s*\([^)]*\)\s]*\)\s*{/gm;
    
    return content.replace(methodPattern, (match, indent, methodName) => {
        // Skip if it's a function declaration (already handled)
        if (match.includes('function')) {
            return match;
        }
        
        // Check if JSDoc already exists
        const beforeMatch = content.substring(0, content.indexOf(match));
        const lastComment = beforeMatch.lastIndexOf('/**');
        const lastMethod = beforeMatch.lastIndexOf(methodName);
        
        if (lastComment > lastMethod) {
            return match; // JSDoc already exists
        }
        
        // Generate JSDoc for method
        const jsdoc = generateMethodJSDoc(methodName, match);
        return `${indent}${jsdoc}\n${indent}${match}`;
    });
}

/**
 * Generate JSDoc for a function
 * @param {string} functionName - Function name
 * @param {string} functionDecl - Function declaration
 * @returns {string} JSDoc comment
 */
function generateFunctionJSDoc(functionName, functionDecl) {
    const description = getFunctionDescription(functionName);
    const parameters = extractParameters(functionDecl);
    const returnType = inferReturnType(functionName);
    
    return CONFIG.jsdocTemplate.function
        .replace('{description}', description)
        .replace('{functionName}', functionName)
        .replace('@param {type} param - Parameter description', 
            parameters.map(p => `@param {type} ${p} - ${p} parameter`).join('\n * '))
        .replace('@returns {type}', `@returns {${returnType}}`);
}

/**
 * Generate JSDoc for a class
 * @param {string} className - Class name
 * @param {string} classDecl - Class declaration
 * @returns {string} JSDoc comment
 */
function generateClassJSDoc(className, classDecl) {
    const description = getClassDescription(className);
    const detailedDescription = getDetailedClassDescription(className);
    
    return CONFIG.jsdocTemplate.class
        .replace('{className}', className)
        .replace('{description}', description)
        .replace('{detailedDescription}', detailedDescription);
}

/**
 * Generate JSDoc for a method
 * @param {string} methodName - Method name
 * @param {string} methodDecl - Method declaration
 * @returns {string} JSDoc comment
 */
function generateMethodJSDoc(methodName, methodDecl) {
    const description = getMethodDescription(methodName);
    const parameters = extractParameters(methodDecl);
    const returnType = inferReturnType(methodName);
    
    return CONFIG.jsdocTemplate.method
        .replace('{description}', description)
        .replace('{methodName}', methodName)
        .replace('@param {type} param - Parameter description', 
            parameters.map(p => `@param {type} ${p} - ${p} parameter`).join('\n * '))
        .replace('@returns {type}', `@returns {${returnType}}`);
}

/**
 * Get function description based on name
 * @param {string} functionName - Function name
 * @returns {string} Function description
 */
function getFunctionDescription(functionName) {
    const descriptions = {
        'load': 'Load data from source',
        'save': 'Save data to destination',
        'create': 'Create new item',
        'update': 'Update existing item',
        'delete': 'Delete item',
        'get': 'Get item by ID',
        'set': 'Set item value',
        'init': 'Initialize system',
        'start': 'Start process',
        'stop': 'Stop process',
        'validate': 'Validate input data',
        'format': 'Format data for display',
        'process': 'Process data',
        'handle': 'Handle event or request',
        'render': 'Render UI element',
        'update': 'Update UI element',
        'refresh': 'Refresh data or UI',
        'clear': 'Clear data or UI',
        'reset': 'Reset to default state',
        'toggle': 'Toggle state',
        'show': 'Show element',
        'hide': 'Hide element'
    };
    
    // Find matching description
    for (const [prefix, description] of Object.entries(descriptions)) {
        if (functionName.toLowerCase().startsWith(prefix)) {
            return description;
        }
    }
    
    return `Handle ${functionName} operation`;
}

/**
 * Get class description based on name
 * @param {string} className - Class name
 * @returns {string} Class description
 */
function getClassDescription(className) {
    const descriptions = {
        'Manager': 'Manages system operations',
        'Service': 'Provides system services',
        'System': 'Core system functionality',
        'Handler': 'Handles system events',
        'Controller': 'Controls system behavior',
        'Renderer': 'Renders UI elements',
        'Validator': 'Validates system data',
        'Processor': 'Processes system data',
        'Loader': 'Loads system resources',
        'Cache': 'Manages system cache',
        'Logger': 'Logs system events',
        'Notification': 'Manages system notifications',
        'Button': 'Button system functionality',
        'Table': 'Table system functionality',
        'Chart': 'Chart system functionality',
        'Form': 'Form system functionality'
    };
    
    // Find matching description
    for (const [suffix, description] of Object.entries(descriptions)) {
        if (className.endsWith(suffix)) {
            return description;
        }
    }
    
    return `Core ${className} functionality`;
}

/**
 * Get detailed class description
 * @param {string} className - Class name
 * @returns {string} Detailed description
 */
function getDetailedClassDescription(className) {
    return `Provides comprehensive ${className.toLowerCase()} functionality with error handling, performance optimization, and integration with other system components.`;
}

/**
 * Get method description based on name
 * @param {string} methodName - Method name
 * @returns {string} Method description
 */
function getMethodDescription(methodName) {
    return getFunctionDescription(methodName);
}

/**
 * Extract parameters from function declaration
 * @param {string} functionDecl - Function declaration
 * @returns {Array<string>} Array of parameter names
 */
function extractParameters(functionDecl) {
    const paramMatch = functionDecl.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];
    
    const params = paramMatch[1].split(',').map(p => p.trim().split('=')[0].trim());
    return params.filter(p => p && p !== '');
}

/**
 * Infer return type based on function name
 * @param {string} functionName - Function name
 * @returns {string} Inferred return type
 */
function inferReturnType(functionName) {
    const returnTypes = {
        'load': 'Promise<Object>',
        'save': 'Promise<boolean>',
        'create': 'Promise<Object>',
        'update': 'Promise<Object>',
        'delete': 'Promise<boolean>',
        'get': 'Object',
        'set': 'void',
        'init': 'void',
        'start': 'void',
        'stop': 'void',
        'validate': 'boolean',
        'format': 'string',
        'process': 'Object',
        'handle': 'void',
        'render': 'string',
        'update': 'void',
        'refresh': 'void',
        'clear': 'void',
        'reset': 'void',
        'toggle': 'void',
        'show': 'void',
        'hide': 'void'
    };
    
    // Find matching return type
    for (const [prefix, returnType] of Object.entries(returnTypes)) {
        if (functionName.toLowerCase().startsWith(prefix)) {
            return returnType;
        }
    }
    
    return 'any';
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    main,
    addJSDocToContent,
    generateFunctionJSDoc,
    generateClassJSDoc,
    generateMethodJSDoc
};
