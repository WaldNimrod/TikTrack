# ESLint Configuration - TikTrack

## Overview
תצורת ESLint מקיפה למערכת TikTrack עם כללים מותאמים אישית.

## 📋 Configuration Files

### 1. Main ESLint Configuration (.eslintrc.js)

```javascript
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jquery: true
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: [
        '@typescript-eslint',
        'jsdoc'
    ],
    rules: {
        // ===== CODE QUALITY =====
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-alert': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
        
        // ===== VARIABLES =====
        'no-unused-vars': ['error', { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],
        'no-undef': 'error',
        'no-undefined': 'off',
        
        // ===== FUNCTIONS =====
        'no-duplicate-parameters': 'error',
        'no-empty-function': 'warn',
        'no-extra-bind': 'error',
        'no-return-assign': 'error',
        'no-return-await': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-useless-call': 'error',
        'no-useless-return': 'error',
        
        // ===== OBJECTS =====
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-empty': 'warn',
        'no-extra-boolean-cast': 'error',
        'no-obj-calls': 'error',
        'no-sparse-arrays': 'error',
        
        // ===== STRINGS =====
        'no-template-curly-in-string': 'error',
        'prefer-template': 'error',
        'template-curly-spacing': 'error',
        
        // ===== ARROWS =====
        'arrow-spacing': 'error',
        'arrow-parens': ['error', 'always'],
        'arrow-body-style': ['error', 'as-needed'],
        
        // ===== ASYNC/AWAIT =====
        'require-await': 'error',
        'no-async-promise-executor': 'error',
        'no-await-in-loop': 'warn',
        'no-promise-executor-return': 'error',
        
        // ===== CLASSES =====
        'constructor-super': 'error',
        'no-class-assign': 'error',
        'no-const-assign': 'error',
        'no-dupe-class-members': 'error',
        'no-duplicate-imports': 'error',
        'no-new-symbol': 'error',
        'no-this-before-super': 'error',
        'no-useless-constructor': 'error',
        
        // ===== MODULES =====
        'no-duplicate-exports': 'error',
        'no-import-assign': 'error',
        'no-restricted-imports': 'off',
        
        // ===== STYLING =====
        'indent': ['error', 4, { 
            SwitchCase: 1,
            VariableDeclarator: 1,
            outerIIFEBody: 1
        }],
        'quotes': ['error', 'single', { 
            avoidEscape: true,
            allowTemplateLiterals: true
        }],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'comma-spacing': ['error', { 
            before: false, 
            after: true 
        }],
        'comma-style': ['error', 'last'],
        'computed-property-spacing': ['error', 'never'],
        'func-call-spacing': ['error', 'never'],
        'key-spacing': ['error', { 
            beforeColon: false, 
            afterColon: true 
        }],
        'keyword-spacing': ['error', { 
            before: true, 
            after: true 
        }],
        'object-curly-spacing': ['error', 'always'],
        'space-before-blocks': ['error', 'always'],
        'space-before-function-paren': ['error', {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always'
        }],
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': 'error',
        'space-unary-ops': ['error', {
            words: true,
            nonwords: false
        }],
        
        // ===== TIKTRACK SPECIFIC =====
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-destructuring': ['error', {
            array: true,
            object: true
        }, {
            enforceForRenamedProperties: false
        }],
        
        // ===== JSDOC =====
        'jsdoc/check-alignment': 'error',
        'jsdoc/check-indentation': 'error',
        'jsdoc/check-param-names': 'error',
        'jsdoc/check-tag-names': 'error',
        'jsdoc/check-types': 'error',
        'jsdoc/newline-after-description': 'error',
        'jsdoc/require-description': 'error',
        'jsdoc/require-param': 'error',
        'jsdoc/require-param-description': 'error',
        'jsdoc/require-param-name': 'error',
        'jsdoc/require-param-type': 'error',
        'jsdoc/require-returns': 'error',
        'jsdoc/require-returns-description': 'error',
        'jsdoc/require-returns-type': 'error',
        'jsdoc/valid-types': 'error'
    },
    overrides: [
        {
            files: ['*.test.js', '*.spec.js'],
            env: {
                jest: true
            },
            rules: {
                'no-console': 'off'
            }
        },
        {
            files: ['*.html'],
            env: {
                browser: true
            },
            rules: {
                'no-undef': 'off'
            }
        }
    ],
    globals: {
        // TikTrack specific globals
        'window': 'readonly',
        'document': 'readonly',
        'console': 'readonly',
        'Logger': 'readonly',
        'UnifiedCacheManager': 'readonly',
        'showNotification': 'readonly',
        'showSuccessNotification': 'readonly',
        'showErrorNotification': 'readonly',
        'showWarningNotification': 'readonly',
        'showInfoNotification': 'readonly',
        'FieldRendererService': 'readonly',
        'ButtonSystem': 'readonly',
        'TableSystem': 'readonly',
        'ChartSystem': 'readonly'
    }
};
```

### 2. Prettier Configuration (.prettierrc.js)

```javascript
module.exports = {
    // Basic formatting
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: true,
    trailingComma: 'none',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
    
    // Range formatting
    rangeStart: 0,
    rangeEnd: Infinity,
    requirePragma: false,
    insertPragma: false,
    proseWrap: 'preserve',
    htmlWhitespaceSensitivity: 'css',
    vueIndentScriptAndStyle: false,
    endOfLine: 'lf',
    embeddedLanguageFormatting: 'auto',
    
    // Override for specific file types
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2
            }
        },
        {
            files: '*.md',
            options: {
                tabWidth: 2,
                proseWrap: 'always'
            }
        },
        {
            files: '*.html',
            options: {
                tabWidth: 2,
                htmlWhitespaceSensitivity: 'ignore'
            }
        }
    ]
};
```

### 3. Package.json Scripts

```json
{
    "scripts": {
        "lint": "eslint . --ext .js,.html",
        "lint:fix": "eslint . --ext .js,.html --fix",
        "lint:report": "eslint . --ext .js,.html --format html --output-file lint-report.html",
        "format": "prettier --write .",
        "format:check": "prettier --check .",
        "lint:staged": "lint-staged",
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage"
    },
    "lint-staged": {
        "*.js": [
            "eslint --fix",
            "prettier --write"
        ],
        "*.html": [
            "eslint --fix",
            "prettier --write"
        ],
        "*.css": [
            "prettier --write"
        ],
        "*.md": [
            "prettier --write"
        ]
    }
}
```

### 4. Husky Configuration (.husky/pre-commit)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run tests
npm run test

# Check for console.log statements
if grep -r "console\.log" trading-ui/scripts/ --exclude-dir=node_modules; then
    echo "❌ Found console.log statements. Please remove them."
    exit 1
fi

# Check for debugger statements
if grep -r "debugger" trading-ui/scripts/ --exclude-dir=node_modules; then
    echo "❌ Found debugger statements. Please remove them."
    exit 1
fi
```

## 🔧 Custom Rules

### 1. TikTrack Specific Rules

```javascript
// Custom rule: No hardcoded URLs
'no-hardcoded-urls': {
    create: function(context) {
        return {
            Literal: function(node) {
                if (typeof node.value === 'string' && 
                    (node.value.startsWith('http://') || 
                     node.value.startsWith('https://'))) {
                    context.report({
                        node: node,
                        message: 'Hardcoded URL detected. Use configuration or environment variables.'
                    });
                }
            }
        };
    }
},

// Custom rule: Require error handling
'require-error-handling': {
    create: function(context) {
        return {
            CallExpression: function(node) {
                if (node.callee.name === 'fetch') {
                    const parent = node.parent;
                    if (parent.type !== 'AwaitExpression' && 
                        parent.type !== 'CallExpression') {
                        context.report({
                            node: node,
                            message: 'Fetch calls must be wrapped in try-catch or handled with .catch()'
                        });
                    }
                }
            }
        };
    }
}
```

### 2. Performance Rules

```javascript
// Rule: No synchronous operations
'no-sync-operations': {
    create: function(context) {
        return {
            CallExpression: function(node) {
                const syncMethods = [
                    'localStorage.getItem',
                    'localStorage.setItem',
                    'sessionStorage.getItem',
                    'sessionStorage.setItem'
                ];
                
                if (syncMethods.includes(node.callee.property?.name)) {
                    context.report({
                        node: node,
                        message: 'Avoid synchronous storage operations. Use async alternatives.'
                    });
                }
            }
        };
    }
}
```

## 📊 ESLint Rules Categories

### 1. Code Quality Rules
- `no-console` - Warn about console statements
- `no-debugger` - Error on debugger statements
- `no-eval` - Error on eval usage
- `no-implied-eval` - Error on implied eval
- `no-new-func` - Error on Function constructor

### 2. Variable Rules
- `no-unused-vars` - Error on unused variables
- `no-undef` - Error on undefined variables
- `no-undefined` - Allow undefined usage

### 3. Function Rules
- `no-duplicate-parameters` - Error on duplicate parameters
- `no-empty-function` - Warn on empty functions
- `no-extra-bind` - Error on unnecessary bind
- `no-return-assign` - Error on return assignment

### 4. Object Rules
- `no-dupe-keys` - Error on duplicate keys
- `no-duplicate-case` - Error on duplicate cases
- `no-empty` - Warn on empty blocks
- `no-extra-boolean-cast` - Error on unnecessary boolean cast

### 5. String Rules
- `no-template-curly-in-string` - Error on template in string
- `prefer-template` - Prefer template literals
- `template-curly-spacing` - Spacing in template literals

### 6. Arrow Function Rules
- `arrow-spacing` - Spacing around arrows
- `arrow-parens` - Parentheses around arrow parameters
- `arrow-body-style` - Arrow function body style

### 7. Async/Await Rules
- `require-await` - Require await in async functions
- `no-async-promise-executor` - No async in promise executor
- `no-await-in-loop` - Warn on await in loops
- `no-promise-executor-return` - No return in promise executor

### 8. Class Rules
- `constructor-super` - Require super in constructor
- `no-class-assign` - Error on class assignment
- `no-const-assign` - Error on const assignment
- `no-dupe-class-members` - Error on duplicate class members

### 9. Module Rules
- `no-duplicate-exports` - Error on duplicate exports
- `no-import-assign` - Error on import assignment
- `no-restricted-imports` - Restrict specific imports

### 10. Styling Rules
- `indent` - Indentation rules
- `quotes` - Quote style rules
- `semi` - Semicolon rules
- `comma-dangle` - Comma dangle rules
- `comma-spacing` - Comma spacing rules
- `comma-style` - Comma style rules
- `computed-property-spacing` - Computed property spacing
- `func-call-spacing` - Function call spacing
- `key-spacing` - Object key spacing
- `keyword-spacing` - Keyword spacing
- `object-curly-spacing` - Object curly spacing
- `space-before-blocks` - Space before blocks
- `space-before-function-paren` - Space before function parentheses
- `space-in-parens` - Space in parentheses
- `space-infix-ops` - Space around infix operators
- `space-unary-ops` - Space around unary operators

## 🎯 Best Practices

### 1. Rule Configuration
- Use `error` for critical issues
- Use `warn` for style and minor issues
- Use `off` for disabled rules
- Use `['error', options]` for rules with options

### 2. File-Specific Rules
- Use `overrides` for different file types
- Use `env` for different environments
- Use `globals` for global variables

### 3. Custom Rules
- Create project-specific rules
- Document custom rules
- Test custom rules thoroughly

### 4. Integration
- Use with Prettier for formatting
- Use with Husky for git hooks
- Use with lint-staged for staged files
- Use with Jest for testing

## 🚀 Usage

### 1. Install Dependencies
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin jsdoc eslint-plugin-jsdoc prettier husky lint-staged
```

### 2. Run ESLint
```bash
# Check all files
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Generate HTML report
npm run lint:report
```

### 3. Run Prettier
```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### 4. Run Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Monitoring

### 1. ESLint Report
```bash
# Generate detailed report
npm run lint:report

# View report
open lint-report.html
```

### 2. Coverage Report
```bash
# Generate coverage report
npm run test:coverage

# View coverage
open coverage/lcov-report/index.html
```

### 3. Performance Monitoring
```bash
# Monitor ESLint performance
npm run lint -- --debug

# Monitor test performance
npm run test -- --verbose
```

## 🔧 Troubleshooting

### 1. Common Issues
- **Parser errors**: Check file extensions and parser configuration
- **Rule conflicts**: Check rule precedence and overrides
- **Performance issues**: Use `.eslintignore` for large directories
- **Memory issues**: Increase Node.js memory limit

### 2. Debug Commands
```bash
# Debug ESLint
npm run lint -- --debug

# Debug Prettier
npm run format -- --debug

# Debug Jest
npm run test -- --verbose
```

### 3. Configuration Validation
```bash
# Validate ESLint config
npx eslint --print-config file.js

# Validate Prettier config
npx prettier --check file.js
```

## 📚 Additional Resources

- [ESLint Documentation](https://eslint.org/docs/)
- [Prettier Documentation](https://prettier.io/docs/)
- [JSDoc Documentation](https://jsdoc.app/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
