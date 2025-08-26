# TikTrack CSS Variables Documentation

## Overview
The TikTrack CSS variables system provides a comprehensive set of design tokens for consistent styling across all components. The system includes color palettes, spacing, typography, shadows, and other design elements.

## CSS Variables System ✅ **RECENTLY ENHANCED**

### Root Variables Definition
```css
:root {
    /* Color Palette */
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --muted-color: #6c757d;
    
    /* Spacing System */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Border Radius */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    
    /* Shadows */
    --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
    --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.15);
    --shadow-heavy: 0 8px 24px rgba(0, 0, 0, 0.2);
    
    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-medium: 0.3s ease;
    --transition-slow: 0.5s ease;
    
    /* Typography */
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
    --font-size-base: 1rem;
    --font-size-sm: 0.875rem;
    --font-size-lg: 1.125rem;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    /* Z-Index */
    --z-index-dropdown: 1000;
    --z-index-sticky: 1020;
    --z-index-fixed: 1030;
    --z-index-modal-backdrop: 1040;
    --z-index-modal: 1050;
    --z-index-popover: 1060;
    --z-index-tooltip: 1070;
}
```

## Color System

### Primary Colors
```css
/* Primary color palette */
--primary-color: #667eea;        /* Main brand color */
--secondary-color: #764ba2;      /* Secondary brand color */

/* Usage examples */
.btn-primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
}

.section-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}
```

### Semantic Colors
```css
/* Success colors */
--success-color: #28a745;        /* Green for success states */
--success-light: #d4edda;        /* Light green background */
--success-dark: #1e7e34;         /* Dark green for hover states */

/* Danger colors */
--danger-color: #dc3545;         /* Red for error states */
--danger-light: #f8d7da;         /* Light red background */
--danger-dark: #c82333;          /* Dark red for hover states */

/* Warning colors */
--warning-color: #ffc107;        /* Yellow for warning states */
--warning-light: #fff3cd;        /* Light yellow background */
--warning-dark: #e0a800;         /* Dark yellow for hover states */

/* Info colors */
--info-color: #17a2b8;           /* Blue for info states */
--info-light: #d1ecf1;           /* Light blue background */
--info-dark: #138496;            /* Dark blue for hover states */

/* Muted colors */
--muted-color: #6c757d;          /* Gray for muted text */
--muted-light: #f8f9fa;          /* Light gray background */
--muted-dark: #495057;           /* Dark gray for hover states */
```

### Page-Specific Color Themes
```css
/* Cash Flows Page */
.cash-flows-page {
    --page-primary: #667eea;
    --page-secondary: #764ba2;
    --page-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Accounts Page */
.accounts-page {
    --page-primary: #f093fb;
    --page-secondary: #f5576c;
    --page-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* Alerts Page */
.alerts-page {
    --page-primary: #4facfe;
    --page-secondary: #00f2fe;
    --page-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* Executions Page */
.executions-page {
    --page-primary: #43e97b;
    --page-secondary: #38f9d7;
    --page-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
```

## Spacing System

### Spacing Scale
```css
/* Spacing variables */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-xxl: 3rem;     /* 48px */

/* Usage examples */
.section-header {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.btn {
    padding: var(--spacing-md) var(--spacing-lg);
}

.form-control {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
}
```

### Margin and Padding Utilities
```css
/* Margin utilities */
.mt-1 { margin-top: var(--spacing-xs); }
.mt-2 { margin-top: var(--spacing-sm); }
.mt-3 { margin-top: var(--spacing-md); }
.mt-4 { margin-top: var(--spacing-lg); }
.mt-5 { margin-top: var(--spacing-xl); }

.mb-1 { margin-bottom: var(--spacing-xs); }
.mb-2 { margin-bottom: var(--spacing-sm); }
.mb-3 { margin-bottom: var(--spacing-md); }
.mb-4 { margin-bottom: var(--spacing-lg); }
.mb-5 { margin-bottom: var(--spacing-xl); }

/* Padding utilities */
.p-1 { padding: var(--spacing-xs); }
.p-2 { padding: var(--spacing-sm); }
.p-3 { padding: var(--spacing-md); }
.p-4 { padding: var(--spacing-lg); }
.p-5 { padding: var(--spacing-xl); }
```

## Border Radius System

### Border Radius Scale
```css
/* Border radius variables */
--border-radius-sm: 4px;   /* Small radius */
--border-radius-md: 8px;   /* Medium radius */
--border-radius-lg: 12px;  /* Large radius */
--border-radius-xl: 16px;  /* Extra large radius */

/* Usage examples */
.btn {
    border-radius: var(--border-radius-md);
}

.form-control {
    border-radius: var(--border-radius-md);
}

.modal-content {
    border-radius: var(--border-radius-lg);
}

.card {
    border-radius: var(--border-radius-md);
}
```

## Shadow System

### Shadow Scale
```css
/* Shadow variables */
--shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);      /* Light shadow */
--shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.15);   /* Medium shadow */
--shadow-heavy: 0 8px 24px rgba(0, 0, 0, 0.2);     /* Heavy shadow */

/* Usage examples */
.card {
    box-shadow: var(--shadow-light);
}

.modal-content {
    box-shadow: var(--shadow-heavy);
}

.btn:hover {
    box-shadow: var(--shadow-medium);
}

.table {
    box-shadow: var(--shadow-light);
}
```

## Transition System

### Transition Variables
```css
/* Transition variables */
--transition-fast: 0.2s ease;    /* Fast transition */
--transition-medium: 0.3s ease;  /* Medium transition */
--transition-slow: 0.5s ease;    /* Slow transition */

/* Usage examples */
.btn {
    transition: var(--transition-fast);
}

.form-control {
    transition: var(--transition-fast);
}

.modal {
    transition: var(--transition-medium);
}

.table tbody tr {
    transition: var(--transition-fast);
}
```

## Typography System

### Font Variables
```css
/* Typography variables */
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
--font-size-base: 1rem;
--font-size-sm: 0.875rem;
--font-size-lg: 1.125rem;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Usage examples */
body {
    font-family: var(--font-family-base);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
}

.btn {
    font-weight: var(--font-weight-semibold);
}

.form-label {
    font-weight: var(--font-weight-semibold);
}

.table th {
    font-weight: var(--font-weight-semibold);
}
```

## Z-Index System

### Z-Index Scale
```css
/* Z-index variables */
--z-index-dropdown: 1000;
--z-index-sticky: 1020;
--z-index-fixed: 1030;
--z-index-modal-backdrop: 1040;
--z-index-modal: 1050;
--z-index-popover: 1060;
--z-index-tooltip: 1070;

/* Usage examples */
.dropdown-menu {
    z-index: var(--z-index-dropdown);
}

.modal-backdrop {
    z-index: var(--z-index-modal-backdrop);
}

.modal {
    z-index: var(--z-index-modal);
}

.tooltip {
    z-index: var(--z-index-tooltip);
}
```

## Component-Specific Variables

### Warning System Variables ✅ **RECENTLY ENHANCED**
```css
/* Warning system specific variables */
.warning-modal {
    --warning-modal-z-index: var(--z-index-modal);
    --warning-modal-backdrop-blur: 5px;
    --warning-modal-border-radius: var(--border-radius-lg);
    --warning-modal-shadow: var(--shadow-heavy);
}

.warning-modal .modal-header {
    --warning-header-gradient: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    --warning-header-padding: var(--spacing-lg);
    --warning-header-color: white;
}

.warning-modal .btn-warning {
    --warning-btn-gradient: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    --warning-btn-padding: var(--spacing-sm) var(--spacing-lg);
    --warning-btn-border-radius: var(--border-radius-md);
    --warning-btn-transition: var(--transition-fast);
}
```

### Table System Variables
```css
/* Table system specific variables */
.table {
    --table-background: white;
    --table-border-radius: var(--border-radius-md);
    --table-shadow: var(--shadow-light);
    --table-margin-bottom: var(--spacing-lg);
}

.table thead th {
    --table-header-gradient: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    --table-header-border: 2px solid #dee2e6;
    --table-header-font-weight: var(--font-weight-semibold);
    --table-header-color: #495057;
    --table-header-padding: var(--spacing-md);
}

.table tbody td {
    --table-cell-border: 1px solid #dee2e6;
    --table-cell-padding: var(--spacing-md);
    --table-cell-vertical-align: middle;
}
```

### Form System Variables
```css
/* Form system specific variables */
.form-control {
    --form-control-border-radius: var(--border-radius-md);
    --form-control-border: 2px solid #e9ecef;
    --form-control-padding: var(--spacing-md);
    --form-control-transition: var(--transition-fast);
    --form-control-font-size: var(--font-size-base);
}

.form-control:focus {
    --form-control-focus-border-color: var(--primary-color);
    --form-control-focus-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-label {
    --form-label-font-weight: var(--font-weight-semibold);
    --form-label-color: #495057;
    --form-label-margin-bottom: var(--spacing-sm);
}
```

## Recent Improvements ✅ **RECENTLY ENHANCED**

### System Enhancements
1. **Enhanced Color System**: Added comprehensive color palette with semantic colors
2. **Page-Specific Themes**: Added page-specific color variables
3. **Improved Spacing**: Enhanced spacing system with more granular options
4. **Better Typography**: Enhanced typography system with font weights and sizes

### Warning System Integration
1. **Warning Modal Variables**: Added specific variables for warning system styling
2. **Gradient Support**: Added gradient variables for enhanced visual appeal
3. **Consistent Styling**: Unified styling across all warning components
4. **Responsive Design**: Added responsive variables for different screen sizes

### Technical Improvements
1. **Performance**: Optimized variable usage for better performance
2. **Maintainability**: Better organization of variables by component
3. **Documentation**: Enhanced documentation with usage examples
4. **Consistency**: Improved consistency across all components

## Best Practices

### 1. Variable Usage
- **Use variables consistently** across all components
- **Avoid hardcoded values** in favor of variables
- **Group related variables** together
- **Document variable purposes** clearly

### 2. Naming Conventions
- **Use descriptive names** for variables
- **Follow consistent naming patterns**
- **Group variables by category**
- **Use semantic names** when possible

### 3. Maintenance
- **Update variables systematically** when design changes
- **Test variable changes** across all components
- **Document variable changes** in changelog
- **Maintain backward compatibility** when possible

## Future Enhancements

### Planned Improvements
1. **Advanced Color System**: More sophisticated color management
2. **Dynamic Variables**: Runtime variable updates
3. **Theme System**: Multiple theme support
4. **CSS Custom Properties**: Enhanced custom properties usage

### Technical Debt
1. **Variable Optimization**: Further optimization of variable usage
2. **Browser Support**: Enhanced browser compatibility
3. **Performance Monitoring**: Variable performance monitoring
4. **Code Quality**: Variable linting and quality tools

---

**Last Updated**: 2025-01-26  
**Maintainer**: TikTrack Development Team
