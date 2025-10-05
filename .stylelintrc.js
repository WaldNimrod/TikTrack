module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    // הרגעת כללים עבור המערכת הקיימת
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'shorthand-property-no-redundant-values': null,
    'color-named': null,  // מתיר שימוש ב-white, black וכו'
    'color-hex-length': null,  // מתיר #ffffff במקום #fff
    'color-function-notation': null,  // מתיר rgba במקום rgb
    'color-function-alias-notation': null,  // מתיר rgba
    'alpha-value-notation': null,  // מתיר 0.1 במקום 10%
    'selector-id-pattern': null,  // מתיר #warningModal וכו'
    'scss/selector-nest-combinators': null,  // מתיר selectors לא nested
    'order/properties-order': null,  // מתיר סדר properties חופשי
    'property-no-deprecated': null,  // מתיר word-wrap
    'rule-empty-line-before': null,  // מתיר כללים ללא שורה ריקה
    'media-feature-range-notation': null,  // מתיר max-width: 768px
    'declaration-block-trailing-semicolon': null,  // מתיר ללא ; בסוף
    'indentation': null,  // מתיר indentation חופשי
    'string-quotes': null,  // מתיר כפול או יחיד
    'color-hex-case': null,  // מתיר case חופשי
    'selector-combinator-space-after': null,
    'selector-attribute-operator-space-before': null,
    'selector-attribute-operator-space-after': null,
    'selector-attribute-brackets-space-inside': null,
    'declaration-colon-space-before': null,
    'declaration-colon-space-after': null,
    'number-leading-zero': null,
    'selector-pseudo-class-parentheses-space-inside': null,
    'media-feature-range-operator-space-before': null,
    'media-feature-range-operator-space-after': null,
    'media-feature-parentheses-space-inside': null,
    'media-feature-colon-space-before': null,
    'media-feature-colon-space-after': null,
    
    // כללים חשובים שכן רוצים לשמור
    'custom-property-pattern': '^[a-z][a-zA-Z0-9-]*$',
    'selector-class-pattern': '^[a-z][a-zA-Z0-9-_]*$',
    'block-no-empty': true,
    'declaration-block-no-duplicate-properties': true,
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'no-duplicate-selectors': true
  }
}