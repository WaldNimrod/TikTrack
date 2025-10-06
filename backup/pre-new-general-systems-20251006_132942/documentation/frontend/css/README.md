# TikTrack CSS Documentation

## Overview
The TikTrack CSS system provides consistent styling across all pages with page-specific themes, gradient backgrounds, and responsive design. The system includes global styles, page-specific themes, and component styling.

## Architecture

### File Structure
```
trading-ui/styles/
├── styles.css              # Global styles and page themes ✅ RECENTLY ENHANCED
├── header-system.css       # Header and navigation styles
├── table.css              # Table-specific styles
├── db-display.css         # Database display styles
├── apple-theme.css        # Apple-inspired theme
├── warning-system.css     # Warning modal styles
└── [page-specific].css    # Page-specific stylesheets
```

### CSS Organization
- **Global Styles**: Base styles and utilities
- **Page Themes**: Page-specific color schemes and gradients
- **Component Styles**: Reusable component styling
- **Responsive Design**: Mobile and tablet optimization

## Global Styles ✅ **RECENTLY ENHANCED**

### Page-Specific Themes
```css
/* Cash Flows Page Theme */
.cash-flows-page .section-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Accounts Page Theme */
.accounts-page .section-header {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Alerts Page Theme */
.alerts-page .section-header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Executions Page Theme */
.executions-page .section-header {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Tickers Page Theme */
.tickers-page .section-header {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Notes Page Theme */
.notes-page .section-header {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Database Display Page Theme */
.db-display-page .section-header {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Extra Data Page Theme */
.extra-data-page .section-header {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Constraints Page Theme */
.constraints-page .section-header {
    background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Designs Page Theme */
.designs-page .section-header {
    background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* Research Page Theme */
.research-page .section-header {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}
```

### Global Utility Classes
```css
/* Color utilities */
.text-success { color: #28a745; }
.text-danger { color: #dc3545; }
.text-warning { color: #ffc107; }
.text-info { color: #17a2b8; }
.text-muted { color: #6c757d; }

/* Background utilities */
.bg-success { background-color: #d4edda; }
.bg-danger { background-color: #f8d7da; }
.bg-warning { background-color: #fff3cd; }
.bg-info { background-color: #d1ecf1; }

/* Spacing utilities */
.mt-1 { margin-top: 0.25rem; }
.mb-1 { margin-bottom: 0.25rem; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 1rem; }
```

## Component Styles

### Warning System Styles ✅ **RECENTLY ENHANCED**
```css
/* Warning modal styling */
.warning-modal {
    z-index: 1050;
    backdrop-filter: blur(5px);
}

.warning-modal .modal-content {
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    border: none;
}

.warning-modal .modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0;
}

.warning-modal .modal-body {
    padding: 1.5rem;
    font-size: 1.1rem;
}

.warning-modal .modal-footer {
    border-top: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
}

/* Warning button styles */
.warning-modal .btn-warning {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    border: none;
    color: white;
    font-weight: 600;
}

.warning-modal .btn-secondary {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    border: none;
    color: white;
    font-weight: 600;
}
```

### Table Styles
```css
/* Table styling */
.table {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.table thead th {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 2px solid #dee2e6;
    font-weight: 600;
    color: #495057;
}

.table tbody tr:hover {
    background-color: #f8f9fa;
    transition: background-color 0.2s ease;
}

.table tbody td {
    border-bottom: 1px solid #dee2e6;
    padding: 0.75rem;
    vertical-align: middle;
}
```

### Form Styles
```css
/* Form styling */
.form-control {
    border-radius: 8px;
    border: 2px solid #e9ecef;
    padding: 0.75rem;
    transition: border-color 0.2s ease;
}

.form-control:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
}

.form-select {
    border-radius: 8px;
    border: 2px solid #e9ecef;
    padding: 0.75rem;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
}
```

### Button Styles
```css
/* Button styling */
.btn {
    border-radius: 8px;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    transition: all 0.2s ease;
    border: none;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
}

.btn-danger {
    background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
    color: white;
}

.btn-secondary {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    color: white;
}
```

## Responsive Design

### Mobile Optimization
```css
/* Mobile-first responsive design */
@media (max-width: 768px) {
    .section-header {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
    }
    
    .table {
        font-size: 0.9rem;
    }
    
    .table td, .table th {
        padding: 0.5rem;
    }
    
    .btn {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
    
    .form-control {
        padding: 0.5rem;
    }
}

@media (max-width: 576px) {
    .section-header {
        padding: 0.5rem;
        margin-bottom: 0.5rem;
    }
    
    .table {
        font-size: 0.8rem;
    }
    
    .table td, .table th {
        padding: 0.25rem;
    }
    
    .btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
    }
}
```

### Tablet Optimization
```css
@media (min-width: 769px) and (max-width: 1024px) {
    .section-header {
        padding: 0.875rem;
        margin-bottom: 0.875rem;
    }
    
    .table {
        font-size: 0.95rem;
    }
    
    .table td, .table th {
        padding: 0.625rem;
    }
}
```

## Recent Improvements ✅ **RECENTLY ENHANCED**

### System Enhancements
1. **Page-Specific Themes**: Added gradient backgrounds for all pages
2. **Warning System Styling**: Enhanced modal styling with gradients
3. **Consistent Design**: Unified design language across all components
4. **Responsive Design**: Improved mobile and tablet optimization

### Cash Flows Module
1. **Page Theme**: Added cash flows specific gradient theme
2. **Component Styling**: Enhanced form and table styling
3. **Modal Integration**: Integrated with warning system styling
4. **Responsive Design**: Optimized for all screen sizes

### Technical Improvements
1. **Performance**: Optimized CSS loading and rendering
2. **Accessibility**: Improved color contrast and readability
3. **Maintainability**: Better CSS organization and structure
4. **Documentation**: Enhanced CSS documentation and examples

## Best Practices

### 1. CSS Organization
- **Modular Design**: Organize CSS by component and page
- **Consistent Naming**: Use consistent class naming conventions
- **Responsive Design**: Mobile-first responsive design approach
- **Performance**: Optimize CSS for fast loading and rendering

### 2. Styling Guidelines
- **Color Consistency**: Use consistent color schemes across pages
- **Typography**: Maintain consistent font sizes and weights
- **Spacing**: Use consistent spacing and padding
- **Animations**: Subtle animations for better user experience

### 3. Maintenance
- **Documentation**: Document all CSS classes and their purposes
- **Testing**: Test across different browsers and devices
- **Performance**: Monitor CSS performance and optimize as needed
- **Updates**: Regular updates to maintain consistency

## Future Enhancements

### Planned Improvements
1. **Advanced Themes**: More sophisticated theme system
2. **CSS Variables**: Enhanced CSS custom properties usage
3. **Animation System**: Advanced animation and transition system
4. **Dark Mode**: Dark mode theme support (planned for future release - not currently implemented)

### Technical Debt
1. **CSS Optimization**: Further CSS optimization and minification
2. **Browser Support**: Enhanced browser compatibility
3. **Performance Monitoring**: CSS performance monitoring tools
4. **Code Quality**: CSS linting and quality tools

---

**Last Updated**: 2025-01-26  
**Maintainer**: TikTrack Development Team
