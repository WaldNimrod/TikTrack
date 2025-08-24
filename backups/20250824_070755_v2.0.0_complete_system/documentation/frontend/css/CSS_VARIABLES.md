# CSS Variables Reference

## Overview

This document provides a comprehensive reference for all CSS variables used in the TikTrack application. These variables are defined in `apple-theme.css` and provide consistent theming across the entire application.

## Color Variables

### Primary Colors
```css
--apple-blue: #29a6a8;           /* Primary brand color */
--apple-blue-dark: #1f8a8c;      /* Darker shade for hover states */
--apple-text-primary: #1d1d1f;   /* Primary text color */
--apple-text-secondary: #86868b; /* Secondary text color */
```

### Background Colors
```css
--apple-bg-primary: #ffffff;      /* Primary background */
--apple-bg-secondary: #f5f5f7;   /* Secondary background */
--apple-bg-elevated: #ffffff;    /* Elevated surface background */
--apple-card-bg: #ffffff;        /* Card background */
```

### Border Colors
```css
--apple-border: #d2d2d7;         /* Standard border */
--apple-border-light: #e5e5e7;   /* Light border */
```

### Status Colors
```css
--apple-success: #28a745;        /* Success/positive actions */
--apple-warning: #ffc107;        /* Warning states */
--apple-danger: #dc3545;         /* Error/danger states */
--apple-info: #17a2b8;           /* Informational states */
```

### Gray Scale
```css
--apple-gray-1: #f8f9fa;         /* Lightest gray */
--apple-gray-2: #e9ecef;         /* Very light gray */
--apple-gray-3: #dee2e6;         /* Light gray */
--apple-gray-4: #ced4da;         /* Medium light gray */
--apple-gray-5: #adb5bd;         /* Medium gray */
--apple-gray-6: #6c757d;         /* Dark gray */
--apple-gray-7: #495057;         /* Very dark gray */
--apple-gray-8: #343a40;         /* Darkest gray */
```

## Spacing Variables

### Base Spacing
```css
--apple-spacing-xs: 4px;         /* Extra small spacing */
--apple-spacing-sm: 8px;         /* Small spacing */
--apple-spacing-md: 16px;        /* Medium spacing */
--apple-spacing-lg: 24px;        /* Large spacing */
--apple-spacing-xl: 32px;        /* Extra large spacing */
--apple-spacing-xxl: 48px;       /* Double extra large spacing */
```

## Border Radius Variables

```css
--apple-radius-small: 4px;       /* Small border radius */
--apple-radius-medium: 8px;      /* Medium border radius */
--apple-radius-large: 12px;      /* Large border radius */
--apple-radius-xl: 16px;         /* Extra large border radius */
```

## Shadow Variables

```css
--apple-shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);      /* Light shadow */
--apple-shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);     /* Medium shadow */
--apple-shadow-heavy: 0 10px 25px rgba(0, 0, 0, 0.15);   /* Heavy shadow */
```

## Typography Variables

### Font Sizes
```css
--apple-font-size-xs: 12px;      /* Extra small text */
--apple-font-size-sm: 14px;      /* Small text */
--apple-font-size-base: 16px;    /* Base text size */
--apple-font-size-lg: 18px;      /* Large text */
--apple-font-size-xl: 20px;      /* Extra large text */
--apple-font-size-xxl: 24px;     /* Double extra large text */
```

### Font Weights
```css
--apple-font-weight-light: 300;  /* Light weight */
--apple-font-weight-normal: 400; /* Normal weight */
--apple-font-weight-medium: 500; /* Medium weight */
--apple-font-weight-semibold: 600; /* Semi-bold weight */
--apple-font-weight-bold: 700;   /* Bold weight */
```

## Z-Index Variables

```css
--apple-z-dropdown: 1000;        /* Dropdown menus */
--apple-z-sticky: 1020;          /* Sticky elements */
--apple-z-fixed: 1030;           /* Fixed elements */
--apple-z-modal-backdrop: 1040;  /* Modal backdrop */
--apple-z-modal: 1050;           /* Modal content */
--apple-z-popover: 1060;         /* Popovers */
--apple-z-tooltip: 1070;         /* Tooltips */
```

## Animation Variables

```css
--apple-transition-fast: 0.15s;  /* Fast transitions */
--apple-transition-normal: 0.2s; /* Normal transitions */
--apple-transition-slow: 0.3s;   /* Slow transitions */
```

## Usage Examples

### Button Styling
```css
.btn-primary {
  background-color: var(--apple-blue);
  color: white;
  border-radius: var(--apple-radius-medium);
  padding: var(--apple-spacing-sm) var(--apple-spacing-md);
  transition: all var(--apple-transition-normal);
}

.btn-primary:hover {
  background-color: var(--apple-blue-dark);
  box-shadow: var(--apple-shadow-medium);
}
```

### Card Styling
```css
.card {
  background: var(--apple-card-bg);
  border: 1px solid var(--apple-border-light);
  border-radius: var(--apple-radius-large);
  padding: var(--apple-spacing-lg);
  box-shadow: var(--apple-shadow-light);
}
```

### Text Styling
```css
.text-primary {
  color: var(--apple-text-primary);
  font-size: var(--apple-font-size-base);
  font-weight: var(--apple-font-weight-normal);
}

.text-secondary {
  color: var(--apple-text-secondary);
  font-size: var(--apple-font-size-sm);
}
```

## Best Practices

1. **Always use variables** instead of hardcoded values
2. **Maintain consistency** by using the same variable across similar elements
3. **Follow naming conventions** when creating new variables
4. **Group related variables** together in the CSS file
5. **Document new variables** in this reference

## Adding New Variables

When adding new CSS variables:

1. **Choose appropriate naming** following existing patterns
2. **Place in correct section** in `apple-theme.css`
3. **Add documentation** to this reference
4. **Test across components** to ensure consistency
5. **Update related documentation** if needed

## Related Documentation

- [CSS Architecture](./CSS_ARCHITECTURE.md)
- [CSS Organization Process](./CSS_ORGANIZATION_PROCESS.md)
- [Component Style Guide](./COMPONENT_STYLE_GUIDE.md)
