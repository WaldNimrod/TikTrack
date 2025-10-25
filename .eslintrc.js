module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jquery: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: [
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