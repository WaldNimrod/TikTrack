# Component Style Guide

## Overview

This document provides a comprehensive style guide for all UI components in the TikTrack application. It includes design patterns, CSS classes, and usage examples for consistent component styling.

## Button Components

### Primary Buttons
```css
.btn-primary {
  background-color: var(--apple-blue);
  color: white;
  border: 1px solid var(--apple-blue);
  border-radius: var(--apple-radius-medium);
  padding: var(--apple-spacing-sm) var(--apple-spacing-md);
  font-size: var(--apple-font-size-base);
  font-weight: var(--apple-font-weight-medium);
  transition: all var(--apple-transition-normal);
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--apple-blue-dark);
  border-color: var(--apple-blue-dark);
  transform: translateY(-1px);
  box-shadow: var(--apple-shadow-medium);
}
```

### Secondary Buttons
```css
.btn-secondary {
  background-color: transparent;
  color: var(--apple-text-primary);
  border: 1px solid var(--apple-border);
  border-radius: var(--apple-radius-medium);
  padding: var(--apple-spacing-sm) var(--apple-spacing-md);
  font-size: var(--apple-font-size-base);
  font-weight: var(--apple-font-weight-normal);
  transition: all var(--apple-transition-normal);
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: var(--apple-gray-1);
  border-color: var(--apple-gray-4);
}
```

### Danger Buttons
```css
.btn-danger {
  background-color: var(--apple-danger);
  color: white;
  border: 1px solid var(--apple-danger);
  border-radius: var(--apple-radius-medium);
  padding: var(--apple-spacing-sm) var(--apple-spacing-md);
  font-size: var(--apple-font-size-base);
  font-weight: var(--apple-font-weight-medium);
  transition: all var(--apple-transition-normal);
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}
```

### Small Buttons
```css
.btn-sm {
  padding: var(--apple-spacing-xs) var(--apple-spacing-sm);
  font-size: var(--apple-font-size-sm);
  border-radius: var(--apple-radius-small);
}
```

## Card Components

### Standard Cards
```css
.card {
  background: var(--apple-card-bg);
  border: 1px solid var(--apple-border-light);
  border-radius: var(--apple-radius-large);
  padding: var(--apple-spacing-lg);
  margin-bottom: var(--apple-spacing-md);
  box-shadow: var(--apple-shadow-light);
  transition: all var(--apple-transition-normal);
}

.card:hover {
  box-shadow: var(--apple-shadow-medium);
  transform: translateY(-1px);
}
```

## Modal Components

### Standard Modal Structure
```css
/* Modal Dialog Container */
.modal-dialog.modal-lg {
  border: 2px solid #6c757d !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
  border-radius: 6px;
  overflow: hidden;
}

/* Modal Content */
.modal-content {
  background: var(--apple-bg-elevated);
  border-radius: 6px;
  box-shadow: var(--apple-shadow-heavy);
  border: 1px solid var(--apple-border-light);
  z-index: 1000000000 !important;
}

/* Modal Header Base */
.modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px 6px 0 0;
  border-bottom: none;
}
```

### Modal Header Types

#### Colored Header (Default)
```css
.modal-header-colored {
  background: linear-gradient(135deg, #29a6a8, #1f8a8c) !important;
  color: white !important;
  border-radius: 6px 6px 0 0;
  border-bottom: none;
}
```

#### Danger Header
```css
.modal-header-danger {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
  color: white !important;
  border-radius: 6px 6px 0 0;
  border-bottom: none;
}
```

#### Success Header (Trade Plans)
```css
#addTradePlanModal .modal-header {
  background: linear-gradient(135deg, #28a745, #20c997) !important;
  color: white !important;
  border-radius: 6px 6px 0 0;
  border-bottom: none;
}
```

#### Info Header (Tickers)
```css
#addTickerModal .modal-header,
#editTickerModal .modal-header {
  background: linear-gradient(135deg, #17a2b8, #138496) !important;
  color: white !important;
  border-radius: 6px 6px 0 0;
  border-bottom: none;
}
```

#### Warning Header (Alerts)
```css
#addAlertModal .modal-header,
#editAlertModal .modal-header {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
  color: white !important;
  border-radius: 6px 6px 0 0;
}
```

#### Trade Header
```css
#addTradeModal .modal-header {
  background: linear-gradient(135deg, #ff9c05, #ff8c00);
  color: white;
  border-radius: 6px 6px 0 0;
  border-bottom: none;
}
```

### Modal Z-Index Hierarchy
```css
.modal-dialog {
  z-index: 1000000000 !important;
}

.modal-content {
  z-index: 1000000001 !important;
}

.modal-backdrop {
  z-index: 999999998 !important;
}
```

### Design Cards
```css
.design-card {
  background: var(--apple-card-bg);
  border: 1px solid var(--apple-border-light);
  border-radius: var(--apple-radius-large);
  padding: var(--apple-spacing-lg);
  margin-bottom: var(--apple-spacing-md);
  box-shadow: var(--apple-shadow-light);
  transition: all var(--apple-transition-normal);
  position: relative;
}

.design-card:hover {
  box-shadow: var(--apple-shadow-medium);
  transform: translateY(-2px);
}
```

## Modal Components

### Modal Structure
```css
.modal {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal-content {
  background: var(--apple-bg-elevated);
  border-radius: var(--apple-radius-large);
  box-shadow: var(--apple-shadow-heavy);
  border: 1px solid var(--apple-border-light);
}

.modal-header {
  background-color: var(--apple-bg-primary);
  border-bottom: 1px solid var(--apple-border-light);
  padding: var(--apple-spacing-lg);
  border-radius: var(--apple-radius-large) var(--apple-radius-large) 0 0;
}

.modal-footer {
  background-color: var(--apple-bg-primary);
  border-top: 1px solid var(--apple-border-light);
  padding: var(--apple-spacing-lg);
  border-radius: 0 0 var(--apple-radius-large) var(--apple-radius-large);
}
```

## Form Components

### Form Groups
```css
.form-group {
  margin-bottom: var(--apple-spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--apple-spacing-xs);
  font-weight: var(--apple-font-weight-medium);
  color: var(--apple-text-primary);
  font-size: var(--apple-font-size-base);
}
```

### Form Controls
```css
.form-control {
  width: 100%;
  padding: var(--apple-spacing-sm) var(--apple-spacing-md);
  border: 1px solid var(--apple-border);
  border-radius: var(--apple-radius-medium);
  font-size: var(--apple-font-size-base);
  background-color: var(--apple-bg-primary);
  color: var(--apple-text-primary);
  transition: all var(--apple-transition-normal);
}

.form-control:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 3px rgba(41, 166, 168, 0.1);
}
```

## Table Components

### Data Tables
```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--apple-bg-primary);
  border-radius: var(--apple-radius-large);
  overflow: hidden;
  box-shadow: var(--apple-shadow-light);
}

.data-table th {
  background-color: var(--apple-gray-1);
  padding: var(--apple-spacing-md);
  text-align: right;
  font-weight: var(--apple-font-weight-semibold);
  color: var(--apple-text-primary);
  border-bottom: 1px solid var(--apple-border-light);
}

.data-table td {
  padding: var(--apple-spacing-md);
  border-bottom: 1px solid var(--apple-border-light);
  color: var(--apple-text-primary);
}

.data-table tbody tr:hover {
  background-color: var(--apple-gray-1);
}
```

### Related Object Cells
```css
.related-account {
  background-color: rgba(41, 166, 168, 0.1);
  color: var(--apple-blue);
  padding: var(--apple-spacing-xs) var(--apple-spacing-sm);
  border-radius: var(--apple-radius-small);
  font-size: var(--apple-font-size-sm);
  font-weight: var(--apple-font-weight-medium);
  cursor: pointer;
  transition: all var(--apple-transition-normal);
}

.related-trade {
  background-color: rgba(40, 167, 69, 0.1);
  color: var(--apple-success);
  padding: var(--apple-spacing-xs) var(--apple-spacing-sm);
  border-radius: var(--apple-radius-small);
  font-size: var(--apple-font-size-sm);
  font-weight: var(--apple-font-weight-medium);
  cursor: pointer;
  transition: all var(--apple-transition-normal);
}

.related-plan {
  background-color: rgba(255, 193, 7, 0.1);
  color: var(--apple-warning);
  padding: var(--apple-spacing-xs) var(--apple-spacing-sm);
  border-radius: var(--apple-radius-small);
  font-size: var(--apple-font-size-sm);
  font-weight: var(--apple-font-weight-medium);
  cursor: pointer;
  transition: all var(--apple-transition-normal);
}
```

## Header Components

### Unified Header
```css
#unified-header {
  background: var(--apple-bg-elevated);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: var(--apple-spacing-sm) 0;
  position: sticky;
  top: 0;
  z-index: var(--apple-z-sticky);
  border-bottom: 1px solid var(--apple-border-light);
}

#unified-header .logo-section {
  display: flex;
  align-items: center;
  gap: var(--apple-spacing-sm);
}

#unified-header .nav-item {
  display: flex;
  align-items: center;
  gap: var(--apple-spacing-xs);
  padding: var(--apple-spacing-sm) var(--apple-spacing-md);
  border-radius: var(--apple-radius-medium);
  color: var(--apple-text-secondary);
  text-decoration: none;
  transition: all var(--apple-transition-normal);
  cursor: pointer;
}

#unified-header .nav-item:hover {
  background-color: var(--apple-gray-1);
  color: var(--apple-text-primary);
}

#unified-header .nav-item.active {
  background-color: var(--apple-blue);
  color: white;
}
```

## Utility Classes

### Spacing Utilities
```css
.mt-1 { margin-top: var(--apple-spacing-xs); }
.mt-2 { margin-top: var(--apple-spacing-sm); }
.mt-3 { margin-top: var(--apple-spacing-md); }
.mt-4 { margin-top: var(--apple-spacing-lg); }

.mb-1 { margin-bottom: var(--apple-spacing-xs); }
.mb-2 { margin-bottom: var(--apple-spacing-sm); }
.mb-3 { margin-bottom: var(--apple-spacing-md); }
.mb-4 { margin-bottom: var(--apple-spacing-lg); }

.p-1 { padding: var(--apple-spacing-xs); }
.p-2 { padding: var(--apple-spacing-sm); }
.p-3 { padding: var(--apple-spacing-md); }
.p-4 { padding: var(--apple-spacing-lg); }
```

### Text Utilities
```css
.text-primary { color: var(--apple-text-primary); }
.text-secondary { color: var(--apple-text-secondary); }
.text-success { color: var(--apple-success); }
.text-danger { color: var(--apple-danger); }
.text-warning { color: var(--apple-warning); }
.text-info { color: var(--apple-info); }

.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }

.font-weight-light { font-weight: var(--apple-font-weight-light); }
.font-weight-normal { font-weight: var(--apple-font-weight-normal); }
.font-weight-medium { font-weight: var(--apple-font-weight-medium); }
.font-weight-semibold { font-weight: var(--apple-font-weight-semibold); }
.font-weight-bold { font-weight: var(--apple-font-weight-bold); }
```

## Best Practices

1. **Use CSS variables** for all colors, spacing, and other design tokens
2. **Follow component patterns** established in this guide
3. **Maintain consistency** across similar components
4. **Use semantic class names** that describe the component's purpose
5. **Test components** across different screen sizes
6. **Ensure accessibility** with proper contrast ratios and focus states

## Component Usage Examples

### Button with Icon
```html
<button class="btn btn-primary btn-sm">
  <i class="fas fa-plus"></i>
  Add New
</button>
```

### Card with Actions
```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
  <div class="card-actions">
    <button class="btn btn-secondary btn-sm">Cancel</button>
    <button class="btn btn-primary btn-sm">Save</button>
  </div>
</div>
```

### Modal with Form
```html
<div class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Modal Title</h3>
      <button class="btn-close">&times;</button>
    </div>
    <div class="modal-body">
      <form>
        <div class="form-group">
          <label>Field Label</label>
          <input type="text" class="form-control">
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

## Related Documentation

- [CSS Architecture](./CSS_ARCHITECTURE.md)
- [CSS Organization Process](./CSS_ORGANIZATION_PROCESS.md)
- [CSS Variables Reference](./CSS_VARIABLES.md)
