# TikTrack Frontend Documentation

## Overview
The TikTrack frontend is built with HTML, JavaScript, and CSS using Bootstrap 5 for responsive design. The system features a modular architecture with global utilities and consistent styling across all pages.

## Architecture

### File Structure
```
trading-ui/
├── *.html                 # Main page files
├── scripts/
│   ├── *.js              # Page-specific JavaScript files
│   ├── warning-system.js  # Centralized warning system
│   ├── translation-utils.js # Global translation utilities
│   └── main.js           # General utilities and functions
├── styles/
│   ├── *.css             # Page-specific styles
│   ├── styles.css        # Global styles and page themes
│   └── header-system.css # Header and navigation styles
└── images/
    └── icons/            # SVG icons and images
```

### Modular Design
- **Page-Specific Files**: Each page has its own HTML and JavaScript files
- **Global Utilities**: Shared functionality across all modules
- **Consistent Styling**: Unified design system with page-specific themes

## Global Systems

### 1. Warning System ✅ **RECENTLY ENHANCED**
- **Purpose**: Centralized modal system for confirmations and warnings
- **File**: `scripts/warning-system.js`
- **Features**:
  - Delete confirmations with customizable messages
  - Validation warnings with field-specific guidance
  - Linked item warnings for data integrity
  - Consistent UI across all modules
  - Global callback management for actions
- **Recent Improvements**:
  - Enhanced global callback management
  - Improved modal responsiveness
  - Better error handling and user feedback
  - Consistent styling across all modules

### 2. Translation System ✅ **RECENTLY ENHANCED**
- **Purpose**: Global translation utilities for consistent text display
- **File**: `scripts/translation-utils.js`
- **Features**:
  - Alert condition translation
  - Trade status translation
  - Currency display formatting
  - Consistent text rendering across modules
- **Recent Additions**:
  - `translateAlertCondition()` function
  - `translateTradeStatus()` function
  - Enhanced currency display utilities

### 3. Number Formatting System
- **Purpose**: Global functions for consistent number and currency display
- **Features**:
  - Currency formatting with commas
  - Number formatting with commas
  - Color coding for positive/negative values
  - Consistent display across all modules

### 4. Page Styling System ✅ **RECENTLY ENHANCED**
- **Purpose**: Consistent page-specific styling with gradient backgrounds
- **File**: `styles/styles.css`
- **Features**:
  - Page-specific color schemes
  - Gradient backgrounds for headers
  - Consistent theming across all pages
  - Responsive design support
- **Recent Improvements**:
  - Added gradient backgrounds for all pages
  - Enhanced page-specific styling
  - Improved visual consistency
  - Better responsive design

## Page-Specific Modules

### 1. Cash Flows Module ✅ **RECENTLY COMPLETED**
- **File**: `cash_flows.html`, `scripts/cash_flows.js`
- **Features**:
  - Full CRUD operations for cash flows
  - Account linking with validation
  - Currency support with proper defaults
  - Date handling with SQLite compatibility
  - Type validation (income, expense, fee, tax, interest)
  - Source tracking (manual, automatic)
  - Centralized warning system integration
  - Proper form validation and error handling
- **Recent Improvements**:
  - Fixed currency_id nullable constraint with default value
  - Implemented proper date string to Python date object conversion
  - Added missing ENUM values (fee, interest) to database constraints
  - Integrated centralized warning system for delete operations
  - Fixed modal responsiveness issues
  - Added proper page-specific styling with gradient backgrounds
  - Enhanced form validation and error handling

### 2. Accounts Module
- **File**: `accounts.html`, `scripts/accounts.js`
- **Features**:
  - Account creation, editing, and deletion
  - Account status management (open/closed)
  - Currency support with proper validation
  - Balance tracking and updates
  - Account linking with other modules

### 3. Alerts Module
- **File**: `alerts.html`, `scripts/alerts.js`
- **Features**:
  - Alert creation with condition builder
  - Multiple alert types and conditions
  - Status tracking (active/inactive/triggered)
  - Account and ticker linking
  - Real-time alert monitoring

### 4. Notes Module
- **File**: `notes.html`, `scripts/notes.js`
- **Features**:
  - Note creation and editing
  - Relationship type management
  - Linking with other entities
  - Rich text support

## API Integration

### RESTful Communication
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Data Format**: JSON
- **Error Handling**: Comprehensive error responses
- **Validation**: Client-side and server-side validation

### Global API Functions
- **Data Loading**: Standardized data loading functions
- **Form Submission**: Consistent form handling
- **Error Display**: Unified error notification system
- **Success Feedback**: Consistent success messaging

## Styling System

### Bootstrap 5 Integration
- **Responsive Grid**: Mobile-first responsive design
- **Component Library**: Pre-built UI components
- **Customization**: Extended with custom CSS
- **Consistency**: Unified design language

### Page-Specific Themes
- **Color Schemes**: Each page has its own color theme
- **Gradient Backgrounds**: Consistent header styling
- **Component Styling**: Themed buttons, forms, and tables
- **Visual Hierarchy**: Clear information architecture

### CSS Architecture
- **Global Styles**: Base styles and utilities
- **Page Styles**: Page-specific styling
- **Component Styles**: Reusable component styles
- **Responsive Design**: Mobile and tablet optimization

## JavaScript Architecture

### Module Pattern
- **Encapsulation**: Each module is self-contained
- **Global Functions**: Shared utilities accessible across modules
- **Event Handling**: Consistent event management
- **Error Handling**: Comprehensive error management

### Data Management
- **State Management**: Local state for each module
- **Data Validation**: Client-side validation
- **API Communication**: Standardized API calls
- **Error Recovery**: Graceful error handling

### Performance Optimization
- **Lazy Loading**: Load data on demand
- **Event Delegation**: Efficient event handling
- **DOM Manipulation**: Optimized DOM updates
- **Memory Management**: Proper cleanup and disposal

## Development Guidelines

### Code Standards
1. **Modular Design**: Keep modules self-contained
2. **Global Utilities**: Use shared functions for common operations
3. **Consistent Naming**: Follow established naming conventions
4. **Error Handling**: Implement comprehensive error handling
5. **Documentation**: Comment complex logic and functions

### Best Practices
1. **Responsive Design**: Ensure mobile compatibility
2. **Accessibility**: Follow accessibility guidelines
3. **Performance**: Optimize for speed and efficiency
4. **Maintainability**: Write clean, readable code
5. **Testing**: Test across different browsers and devices

### File Organization
1. **Page-Specific Files**: Keep page logic separate
2. **Global Utilities**: Share common functionality
3. **Style Organization**: Maintain consistent CSS structure
4. **Asset Management**: Organize images and icons properly

## Recent Improvements

### System Enhancements
1. **Warning System**: Centralized modal system for confirmations
2. **Translation System**: Global translation utilities
3. **Page Styling**: Consistent gradient backgrounds
4. **Error Handling**: Improved error messages and logging

### Cash Flows Module
1. **Currency Integration**: Proper currency_id handling with defaults
2. **Date Compatibility**: SQLite-compatible date handling
3. **Type Validation**: Enhanced type constraint management
4. **Source Tracking**: Manual/automatic source differentiation
5. **Form Validation**: Comprehensive client and server validation

### UI/UX Improvements
1. **Consistent Styling**: Unified design across all pages
2. **Better Feedback**: Enhanced user notifications
3. **Modal Management**: Improved modal responsiveness
4. **Form Validation**: Real-time validation feedback

## Future Enhancements

### Planned Improvements
1. **Advanced Filtering**: Implement complex filtering capabilities
2. **Sorting System**: Add column sorting functionality
3. **Real-time Updates**: Implement WebSocket connections
4. **Offline Support**: Add offline functionality
5. **Progressive Web App**: PWA capabilities

### Technical Debt
1. **Testing Coverage**: Need comprehensive testing suite
2. **Performance Monitoring**: Implement performance monitoring
3. **Code Quality**: Add code quality tools
4. **Documentation**: Enhance technical documentation

---

**Last Updated**: 2025-01-26  
**Maintainer**: TikTrack Development Team
