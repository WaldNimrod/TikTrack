const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Global variables used in the project
        'window': 'readonly',
        'document': 'readonly',
        'localStorage': 'readonly',
        'sessionStorage': 'readonly',
        'fetch': 'readonly',
        'console': 'readonly',
        'bootstrap': 'readonly', // Bootstrap framework
        'jQuery': 'readonly', // jQuery if used
        '$': 'readonly', // jQuery alias
        // Error handler functions from error-handlers.js
        'handleApiError': 'readonly',
        'handleElementNotFound': 'readonly',
        'handleFunctionNotFound': 'readonly',
        'handleValidationError': 'readonly',
        'handleDataLoadError': 'readonly',
        'handleSaveError': 'readonly',
        'handleDeleteError': 'readonly',
        'handleSystemError': 'readonly',
        // UI utility functions from ui-utils.js
        'showSecondConfirmationModal': 'readonly',
        'createWarningModal': 'readonly',
        // Account functions from accounts.js
        'showSuccessMessage': 'readonly',
        'showErrorMessage': 'readonly',
        // Date utility functions from date-utils.js
        'formatDate': 'readonly',
        'formatDateTime': 'readonly',
        'formatDateOnly': 'readonly',
        'formatShortDate': 'readonly',
        'formatLongDate': 'readonly',
        'formatTimeOnly': 'readonly',
        // Data loading functions
        'loadDashboardData': 'readonly',
        'onLogout': 'readonly',
        'getCashFlowTypeText': 'readonly',
        // Button functions from button-icons.js
        'createLinkButton': 'readonly',
        'createEditButton': 'readonly',
        'createDeleteButton': 'readonly',
        'createCancelButton': 'readonly',
        'createDeleteButtonByType': 'readonly',
        // Cash flow functions
        'confirmDeleteCashFlow': 'readonly',
        // DB extradata functions
        'showAddCurrencyModal': 'readonly',
        'restoreCurrenciesSectionState': 'readonly',
        'toggleCurrenciesSection': 'readonly',
        'updateTriggerButtonsCount': 'readonly',
        // Validation functions from validation-utils.js
        'validateForm': 'readonly',
        'showFieldError': 'readonly',
        'showFieldSuccess': 'readonly',
        'clearFieldError': 'readonly',
        'clearFieldValidation': 'readonly',
        // Notification functions from notification-system.js
        'showErrorNotification': 'readonly',
        'showSuccessNotification': 'readonly',
        'showWarningNotification': 'readonly',
        'showInfoNotification': 'readonly',
        'showValidationWarning': 'readonly',
        'showConfirmationDialog': 'readonly',
        'showDeleteWarning': 'readonly',
        // Translation/formatting functions from translation-utils.js
        'formatCurrency': 'readonly',
        'formatCurrencyWithCommas': 'readonly',
        'formatNumber': 'readonly',
        'formatNumberWithCommas': 'readonly',
        // Page utility functions from page-utils.js
        'getCurrentPageName': 'readonly',
        'restoreDesignsSectionState': 'readonly',
        // Data utility functions from data-utils.js  
        'convertAmountToShares': 'readonly',
        'convertSharesToAmount': 'readonly',
        'getUserPreference': 'readonly',
        'calculateDefaultPrices': 'readonly',
        // Global data variables
        'tickersData': 'readonly',
        'trade_plansData': 'readonly',
        'tickerId': 'readonly',
        // UI functions
        'openFunctionModal': 'readonly',
        'updateSortIcons': 'readonly'
      },
    },
    rules: {
      // === BASIC CODE QUALITY RULES ===
      'no-console': 'warn', // Allow console but warn
      'no-debugger': 'error',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'no-undef': 'error',
      'no-var': 'error', // Prefer const/let
      'prefer-const': 'error',
      
      // === CODE STYLE RULES ===
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      
      // === BEST PRACTICES ===
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-loop-func': 'error',
      'no-param-reassign': 'warn',
      
      // === PERFORMANCE ===
      'no-new-object': 'error',
      'no-array-constructor': 'error',
      
      // === SECURITY ===
      'no-script-url': 'error',
      
      // === PROJECT SPECIFIC RULES ===
      'camelcase': 'off', // Hebrew/English mixed code
      'max-len': ['warn', { 'code': 120, 'ignoreUrls': true, 'ignoreStrings': true }],
      
      // === VARIABLES ===
      'no-use-before-define': ['error', { 'functions': false, 'classes': true }],
      'no-shadow': 'warn',
      'no-redeclare': 'error',
      
      // === FUNCTIONS ===
      'no-return-assign': 'error',
      'no-sequences': 'error',
      
      // === OBJECTS ===
      'object-shorthand': 'error',
      'prefer-object-spread': 'error',
      
      // === ARRAYS ===
      'prefer-spread': 'error',
      'array-callback-return': 'error',
      
      // === STRINGS ===
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      
      // === NUMBERS ===
      'prefer-numeric-literals': 'error',
      
      // === COMMENTS ===
      'spaced-comment': ['error', 'always'],
      
      // === WHITESPACE ===
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
      'eol-last': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      
      // === SEMICOLONS ===
      'semi-spacing': ['error', { 'before': false, 'after': true }],
      'no-extra-semi': 'error',
      
      // === COMMAS ===
      'comma-spacing': ['error', { 'before': false, 'after': true }],
      'comma-style': ['error', 'last'],
      
      // === ARROWS ===
      'arrow-spacing': ['error', { 'before': true, 'after': true }],
      'arrow-parens': ['error', 'as-needed'],
      'arrow-body-style': ['error', 'as-needed'],
      
      // === CLASSES ===
      'class-methods-use-this': 'warn',
      'no-dupe-class-members': 'error',
      'no-useless-constructor': 'error',
      
      // === MODULES ===
      'no-duplicate-imports': 'error',
      
      // === ASYNC ===
      'require-await': 'warn',
      
      // === REGEX ===
      'no-control-regex': 'error',
      'no-regex-spaces': 'error',
      'prefer-regex-literals': 'error',
      
      // === SWITCH ===
      'no-fallthrough': 'error',
      'default-case-last': 'error',
      'no-duplicate-case': 'error',
      
      // === LOOPS ===
      'no-constant-condition': 'error',
      'for-direction': 'error',
      
      // === TRY-CATCH ===
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      
      // === MISCELLANEOUS ===
      'no-cond-assign': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-else-if': 'error',
      'no-empty': 'error',
      'no-extra-boolean-cast': 'error',
      'no-extra-parens': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-inner-declarations': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-obj-calls': 'error',
      'no-prototype-builtins': 'error',
      'no-template-curly-in-string': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
    },
  },
  {
    // Rules for test files
    files: ['**/*.test.js', '**/*.spec.js'],
    rules: {
      'no-console': 'off', // Allow console in tests
    },
  },
];
