# CSS Architecture Documentation

## Overview

This document describes the CSS architecture and organization system for the TikTrack application. The CSS has been completely reorganized to eliminate duplications, establish clear hierarchy, and maintain consistency across all pages.

## File Structure

```
trading-ui/styles/
├── apple-theme.css          # Base theme variables and core styles
├── typography.css           # Font definitions and typography
├── styles.css              # General components and utilities
├── table.css               # Table-specific styles
├── header-system.css       # Header and navigation system
└── research-summary.css    # Page-specific styles
```

## Hierarchy and Loading Order

CSS files are loaded in the following order (weakest to strongest):

1. **apple-theme.css** - Base theme variables and core styles
2. **typography.css** - Font definitions and typography
3. **styles.css** - General components and utilities
4. **table.css** - Table-specific styles
5. **header-system.css** - Header and navigation system
6. **research-summary.css** - Page-specific styles

## File Responsibilities

### apple-theme.css
- CSS variables (colors, spacing, shadows)
- Base body styles
- Core form elements
- Card components (excluding design cards)
- Modal base styles

### typography.css
- Font family definitions for all elements
- Heading styles (h1-h6)
- Text direction and alignment
- Typography utilities

### styles.css
- Button styles (.btn-primary, .btn-secondary, .btn-danger, .btn-sm)
- Modal styles (.modal-header, .modal-footer)
- RTL layout definitions
- Refresh button styles
- General page layout
- Notification system
- Utility classes

### table.css
- Data table styles
- Related object styles (.related-account, .related-trade, .related-plan)
- Table-specific components
- Grid layout for tables

### header-system.css
- Unified header component (#unified-header)
- Logo and navigation styles
- Menu system
- Header-specific utilities

### research-summary.css
- Page-specific styles for research summary
- Daily table styles
- Research-specific components

## Key Principles

1. **Single Source of Truth**: Each style definition exists in only one file
2. **Clear Hierarchy**: Files are loaded in order of specificity
3. **Component-Based**: Styles are organized by component type
4. **Maintainable**: Easy to locate and modify specific styles
5. **Consistent**: Uniform approach across all pages

## Migration Notes

- Removed `menu.css` (obsolete)
- Consolidated duplicate styles from multiple files
- Established clear file responsibilities
- Updated all HTML files to use new hierarchy

## Related Documentation

- [CSS Organization Process](./CSS_ORGANIZATION_PROCESS.md)
- [CSS Variables Reference](./CSS_VARIABLES.md)
- [Component Style Guide](./COMPONENT_STYLE_GUIDE.md)
