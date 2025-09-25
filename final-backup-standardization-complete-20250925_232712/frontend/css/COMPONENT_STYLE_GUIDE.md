# TikTrack Component Style Guide

## Overview
The TikTrack Component Style Guide provides comprehensive guidelines for styling components consistently across the application. This guide covers buttons, forms, tables, modals, and other UI components with best practices and examples.

## Component Style Guidelines ✅ **RECENTLY ENHANCED**

### 1. Button Components

#### Primary Buttons
```css
/* Primary button styling */
.btn-primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md) var(--spacing-lg);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    transition: var(--transition-fast);
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    text-align: center;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium);
}

.btn-primary:active {
    transform: translateY(0);
    box-shadow: var(--shadow-light);
}
```

#### Success Buttons
```css
/* Success button styling */
.btn-success {
    background: linear-gradient(135deg, var(--success-color) 0%, #20c997 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md) var(--spacing-lg);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    transition: var(--transition-fast);
    cursor: pointer;
}

.btn-success:hover {
    background: linear-gradient(135deg, #218838 0%, #1ea085 100%);
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium);
}
```

#### Danger Buttons
```css
/* Danger button styling */
.btn-danger {
    background: linear-gradient(135deg, var(--danger-color) 0%, #fd7e14 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md) var(--spacing-lg);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    transition: var(--transition-fast);
    cursor: pointer;
}

.btn-danger:hover {
    background: linear-gradient(135deg, #c82333 0%, #e55a00 100%);
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium);
}
```

#### Secondary Buttons
```css
/* Secondary button styling */
.btn-secondary {
    background: linear-gradient(135deg, var(--muted-color) 0%, #495057 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md) var(--spacing-lg);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    transition: var(--transition-fast);
    cursor: pointer;
}

.btn-secondary:hover {
    background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium);
}
```

#### Button Sizes
```css
/* Small buttons */
.btn-sm {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
    border-radius: var(--border-radius-sm);
}

/* Large buttons */
.btn-lg {
    padding: var(--spacing-lg) var(--spacing-xl);
    font-size: var(--font-size-lg);
    border-radius: var(--border-radius-md);
}
```

### 2. Form Components

#### Form Controls
```css
/* Form control styling */
.form-control {
    border-radius: var(--border-radius-md);
    border: 2px solid #e9ecef;
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
    font-family: var(--font-family-base);
    transition: var(--transition-fast);
    background-color: white;
    color: #495057;
}

.form-control:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    outline: none;
}

.form-control:disabled {
    background-color: #e9ecef;
    opacity: 0.65;
    cursor: not-allowed;
}
```

#### Form Labels
```css
/* Form label styling */
.form-label {
    font-weight: var(--font-weight-semibold);
    color: #495057;
    margin-bottom: var(--spacing-sm);
    display: block;
    font-size: var(--font-size-base);
    font-family: var(--font-family-base);
}

.form-label.required::after {
    content: " *";
    color: var(--danger-color);
}
```

#### Form Select
```css
/* Form select styling */
.form-select {
    border-radius: var(--border-radius-md);
    border: 2px solid #e9ecef;
    padding: var(--spacing-md);
    padding-right: 2.5rem;
    font-size: var(--font-size-base);
    font-family: var(--font-family-base);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    transition: var(--transition-fast);
    background-color: white;
    color: #495057;
}

.form-select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    outline: none;
}
```

#### Form Validation
```css
/* Valid form control */
.form-control.is-valid {
    border-color: var(--success-color);
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

/* Invalid form control */
.form-control.is-invalid {
    border-color: var(--danger-color);
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* Validation feedback */
.valid-feedback {
    display: block;
    width: 100%;
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--success-color);
}

.invalid-feedback {
    display: block;
    width: 100%;
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--danger-color);
}
```

### 3. Table Components

#### Basic Table
```css
/* Table styling */
.table {
    background: white;
    border-radius: var(--border-radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-light);
    margin-bottom: var(--spacing-lg);
    width: 100%;
    border-collapse: collapse;
}

/* Table header */
.table thead th {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 2px solid #dee2e6;
    font-weight: var(--font-weight-semibold);
    color: #495057;
    padding: var(--spacing-md);
    text-align: right;
    vertical-align: middle;
}

/* Table body */
.table tbody tr {
    transition: var(--transition-fast);
}

.table tbody tr:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: var(--shadow-light);
}

.table tbody td {
    border-bottom: 1px solid #dee2e6;
    padding: var(--spacing-md);
    vertical-align: middle;
    color: #495057;
}

/* Table responsive */
@media (max-width: 768px) {
    .table {
        font-size: var(--font-size-sm);
    }
    
    .table td, .table th {
        padding: var(--spacing-sm);
    }
}
```

#### Striped Table
```css
/* Striped table */
.table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.02);
}

.table-striped tbody tr:nth-of-type(odd):hover {
    background-color: #f8f9fa;
}
```

#### Bordered Table
```css
/* Bordered table */
.table-bordered {
    border: 1px solid #dee2e6;
}

.table-bordered th,
.table-bordered td {
    border: 1px solid #dee2e6;
}
```

### 4. Modal Components ✅ **RECENTLY ENHANCED**

#### Warning Modal
```css
/* Warning modal styling */
.warning-modal {
    z-index: var(--z-index-modal);
    backdrop-filter: blur(5px);
}

.warning-modal .modal-content {
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-heavy);
    border: none;
    overflow: hidden;
    background: white;
}

.warning-modal .modal-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    padding: var(--spacing-lg);
    border-bottom: none;
}

.warning-modal .modal-title {
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-lg);
    margin: 0;
}

.warning-modal .modal-body {
    padding: var(--spacing-lg);
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: #495057;
}

.warning-modal .modal-footer {
    border-top: 1px solid #dee2e6;
    padding: var(--spacing-md) var(--spacing-lg);
    background: #f8f9fa;
    border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
}

/* Warning modal buttons */
.warning-modal .btn-warning {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    border: none;
    color: white;
    font-weight: var(--font-weight-semibold);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius-md);
    transition: var(--transition-fast);
}

.warning-modal .btn-secondary {
    background: linear-gradient(135deg, var(--muted-color) 0%, #495057 100%);
    border: none;
    color: white;
    font-weight: var(--font-weight-semibold);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius-md);
    transition: var(--transition-fast);
}
```

#### Standard Modal
```css
/* Standard modal styling */
.modal {
    z-index: var(--z-index-modal);
}

.modal .modal-content {
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-heavy);
    border: none;
    overflow: hidden;
}

.modal .modal-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    padding: var(--spacing-lg);
    border-bottom: none;
}

.modal .modal-body {
    padding: var(--spacing-lg);
    color: #495057;
}

.modal .modal-footer {
    border-top: 1px solid #dee2e6;
    padding: var(--spacing-md) var(--spacing-lg);
    background: #f8f9fa;
}
```

### 5. Card Components

#### Basic Card
```css
/* Card styling */
.card {
    background: white;
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-light);
    border: 1px solid #e9ecef;
    overflow: hidden;
    transition: var(--transition-fast);
}

.card:hover {
    box-shadow: var(--shadow-medium);
    transform: translateY(-2px);
}

.card-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid #e9ecef;
    font-weight: var(--font-weight-semibold);
    color: #495057;
}

.card-body {
    padding: var(--spacing-lg);
    color: #495057;
}

.card-footer {
    background: #f8f9fa;
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid #e9ecef;
}
```

### 6. Alert Components

#### Success Alert
```css
/* Success alert */
.alert-success {
    background: linear-gradient(135deg, var(--success-color) 0%, #20c997 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md) var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    font-weight: var(--font-weight-medium);
}
```

#### Danger Alert
```css
/* Danger alert */
.alert-danger {
    background: linear-gradient(135deg, var(--danger-color) 0%, #fd7e14 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md) var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    font-weight: var(--font-weight-medium);
}
```

#### Warning Alert
```css
/* Warning alert */
.alert-warning {
    background: linear-gradient(135deg, var(--warning-color) 0%, #ff8c00 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md) var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    font-weight: var(--font-weight-medium);
}
```

### 7. Navigation Components

#### Navigation Menu
```css
/* Navigation menu */
.nav-menu {
    background: white;
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-light);
    border: 1px solid #e9ecef;
    overflow: hidden;
}

.nav-item {
    border-bottom: 1px solid #e9ecef;
}

.nav-item:last-child {
    border-bottom: none;
}

.nav-link {
    display: block;
    padding: var(--spacing-md) var(--spacing-lg);
    color: #495057;
    text-decoration: none;
    transition: var(--transition-fast);
    font-weight: var(--font-weight-medium);
}

.nav-link:hover {
    background-color: #f8f9fa;
    color: var(--primary-color);
}

.nav-link.active {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    font-weight: var(--font-weight-semibold);
}
```

## Recent Improvements ✅ **RECENTLY ENHANCED**

### System Enhancements
1. **Enhanced Button System**: Added gradient backgrounds and hover effects
2. **Improved Form Components**: Enhanced validation and focus states
3. **Better Table Styling**: Added hover effects and responsive design
4. **Enhanced Modal System**: Improved warning modal styling with gradients

### Warning System Integration
1. **Warning Modal Styling**: Added specific styling for warning modals
2. **Gradient Support**: Enhanced visual appeal with gradient backgrounds
3. **Consistent Design**: Unified styling across all modal components
4. **Responsive Design**: Optimized for all screen sizes

### Technical Improvements
1. **Performance**: Optimized component styling for better performance
2. **Accessibility**: Improved color contrast and readability
3. **Maintainability**: Better organization of component styles
4. **Documentation**: Enhanced documentation with usage examples

## Best Practices

### 1. Component Design
- **Consistent Styling**: Use consistent styling patterns across components
- **Responsive Design**: Ensure components work on all screen sizes
- **Accessibility**: Maintain good color contrast and keyboard navigation
- **Performance**: Optimize CSS for fast rendering

### 2. Styling Guidelines
- **Use CSS Variables**: Leverage CSS variables for consistent theming
- **Gradient Backgrounds**: Use gradients for enhanced visual appeal
- **Hover Effects**: Add subtle hover effects for better user experience
- **Transitions**: Use smooth transitions for interactive elements

### 3. Maintenance
- **Documentation**: Document all component styles and their purposes
- **Testing**: Test components across different browsers and devices
- **Performance**: Monitor component performance and optimize as needed
- **Updates**: Regular updates to maintain consistency

## Future Enhancements

### Planned Improvements
1. **Advanced Components**: More sophisticated component patterns
2. **Animation System**: Advanced animation and transition system
3. **Theme System**: Multiple theme support for components
4. **Component Library**: Comprehensive component library

### Technical Debt
1. **Component Optimization**: Further optimization of component styles
2. **Browser Support**: Enhanced browser compatibility
3. **Performance Monitoring**: Component performance monitoring tools
4. **Code Quality**: Component style linting and quality tools

---

**Last Updated**: 2025-01-26  
**Maintainer**: TikTrack Development Team
