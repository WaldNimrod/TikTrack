# TikTrack Development Guide

## 🚀 Latest Updates

**Version 4.1** - *September 1, 2025*

### ✅ **Advanced Development Infrastructure - Complete Implementation**

#### **New Development Infrastructure**
- **Advanced Caching System**: Smart cache with TTL, dependencies, and memory optimization
- **Query Optimization**: Automatic query analysis and optimization
- **Performance Monitoring**: Real-time performance tracking and health checks
- **Background Tasks**: Automated background processes
- **Rate Limiting**: Advanced request throttling
- **Error Handling**: Comprehensive error handling with correlation IDs

#### **Development Modes & Cache Management**
- **Multiple Development Modes**: Normal, No-Cache, and Production modes
- **Smart Cache Management**: Environment-based cache configuration
- **Quick Cache Clear**: UI button and keyboard shortcuts for cache clearing
- **Unified Restart System**: Centralized server management with environment variables
- **Performance Optimization**: Database indexing and query optimization
- **Smart Cache Preservation**: Automatic cache state preservation across restarts
- **Interactive Restart Modes**: User-guided restart with cache mode selection
- **Automatic Cache Detection**: Intelligent detection of current cache state

#### **Current Status**
- ✅ **Advanced caching system operational**
- ✅ **Query optimization system working**
- ✅ **Performance monitoring active**
- ✅ **Development modes implemented**
- ✅ **Cache management UI complete**
- ✅ **Unified restart system operational**
- ✅ **Smart cache preservation working**
- ✅ **Interactive restart modes functional**
- ✅ **Automatic cache detection operational**
- ✅ **Cache state persistence across restarts**

### ✅ **Previous: Code Cleanup & Modular Architecture - Complete Implementation**

### ✅ **Code Cleanup & Modular Architecture - Complete Implementation**

#### **Major Code Refactoring**
- **Duplicate Code Elimination**: Removed 15+ duplicate functions across multiple files
- **Global Function Consolidation**: Created centralized utility modules
- **Modular Architecture**: Improved code organization and maintainability
- **Performance Optimization**: Reduced code duplication and improved loading times

#### **New Utility Modules Created**
- **`crud-utils.js`**: Global CRUD operations (edit, delete, cancel records)
- **`validation-utils.js`**: Global form validation functions
- **Enhanced `tables.js`**: Global table sorting functionality
- **Enhanced `main.js`**: Global section toggle functions
- **Enhanced `filter-system.js`**: Global filter reset functionality

#### **Files Cleaned & Updated**
- **6 JavaScript files** cleaned of duplicate functions
- **4 HTML files** updated with new script dependencies
- **Complete backward compatibility** maintained
- **Global function exports** properly configured

#### **Current Status**
- ✅ **100% duplicate code elimination**
- ✅ **Modular architecture implemented**
- ✅ **Global functions properly exported**
- ✅ **Backward compatibility maintained**
- ✅ **Performance improvements achieved**
- ✅ **Comprehensive documentation updated**

### ✅ **Previous: Filter System - Complete Implementation & Bug Fixes**

#### **Fixed Critical Issues**
- **Date Filter Implementation**: Complete date filter functionality with proper display updates
- **Button Selection Logic**: Fixed broken display when selecting "All" options
- **Null/Undefined Protection**: Added comprehensive protection for all preference conversion functions
- **Table-Specific Filtering**: Smart filtering logic that adapts to different table types

#### **Enhanced Features**
- **Comprehensive Logging System**: Detailed logs for all filter operations with table summaries
- **Smart Field Detection**: Automatically detects available fields per table type
- **Error Handling**: Robust error handling with fallback mechanisms
- **Performance Optimizations**: Efficient DOM queries and filter processing

#### **Current Status**
- ✅ **All filter types working correctly**
- ✅ **Display updates properly**
- ✅ **Button selections working**
- ✅ **Multi-table filtering operational**
- ✅ **Comprehensive logging system**
- ✅ **Error handling and fallbacks**
- ✅ **Performance optimizations**

## 📋 Overview

This guide provides comprehensive information for developers working on the TikTrack Trading Management System. It covers setup, development practices, testing, and deployment procedures.

## 🏗️ System Architecture

### Backend (Python Flask)
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: SQLite with WAL mode and advanced indexing
- **API**: RESTful API design with versioning
- **Authentication**: Session-based authentication
- **Advanced Caching**: Smart cache with TTL and dependencies
- **Query Optimization**: Automatic query analysis and optimization
- **Performance Monitoring**: Real-time performance tracking
- **Background Tasks**: Automated background processes
- **Rate Limiting**: Advanced request throttling
- **Error Handling**: Comprehensive error handling with correlation IDs
- **Smart Cache Preservation**: Automatic cache state preservation across restarts
- **Environment Configuration**: Dynamic environment-based cache settings
- **Unified Restart System**: Centralized server management with cache state preservation

### Frontend (JavaScript)
- **Framework**: Vanilla JavaScript with modular architecture
- **UI Framework**: Custom CSS with responsive design
- **Filter System**: Advanced multi-table filtering with preference management
- **Header System**: Unified navigation and filtering interface
- **Cache Management UI**: Quick cache clearing button with loading states
- **Development Tools**: Keyboard shortcuts and UI indicators for cache management

### Core Components
1. **Header System** (`header-system.js`): Navigation, filter interface, and cache management
2. **Filter System** (`simple-filter.js`): Advanced filtering across all tables
3. **Warning System** (`warning-system.js`): Centralized modal management
4. **Translation System** (`translation-utils.js`): Hebrew/English translation utilities
5. **Cache Management UI** (`header-system.js`): Quick cache clearing with loading states
6. **Development Shortcuts** (`main.js`): Keyboard shortcuts for cache management

### Advanced Development Systems
1. **Cache Management System**: Smart caching with TTL and dependencies
2. **Query Optimization System**: Automatic query analysis and optimization
3. **Performance Monitoring**: Real-time performance tracking and health checks
4. **Background Task System**: Automated background processes
5. **Rate Limiting System**: Advanced request throttling
6. **Error Handling System**: Comprehensive error handling with correlation IDs
7. **Smart Cache Preservation**: Automatic cache state preservation across restarts
8. **Interactive Restart System**: User-guided restart with cache mode selection
9. **Automatic Cache Detection**: Intelligent detection of current cache state
10. **Unified Restart Management**: Centralized server management with environment variables

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js (for frontend development)
- SQLite (included)
- Modern web browser

## 🎯 Development Modes & Cache Management

### Available Development Modes

#### **1. No-Cache Mode** (Recommended for Active Development)
```bash
npm run dev:no-cache
```
- Cache completely disabled
- All code changes visible immediately
- Best for active development
- Lower performance

#### **2. Normal Development Mode** (Cache: 10 seconds)
```bash
npm run dev:normal
```
- Cache enabled with 10-second TTL
- Good for testing
- Still see changes quickly
- Balanced performance

#### **3. Production Mode** (Cache: 5 minutes)
```bash
npm run dev:production
```
- Cache enabled with 5-minute TTL
- Maximum performance
- Good for pre-deployment testing

### Smart Restart System

#### **Automatic Cache Preservation (Default):**
```bash
./restart                    # Quick mode + preserves current cache state
./restart quick             # Quick mode + preserves current cache state
./restart complete          # Complete mode + preserves current cache state
```

#### **Explicit Cache Mode Changes:**
```bash
./restart --cache-mode=development    # Quick + development cache (10s TTL)
./restart --cache-mode=no-cache       # Quick + no-cache (disabled)
./restart --cache-mode=production     # Quick + production cache (5min TTL)
./restart --preserve-cache            # Preserves current cache state
```

#### **Interactive Mode:**
```bash
./restart --interactive               # User-guided restart with choices
./restart --status                    # Current system status
./restart --info                      # Information about available modes
```

### Quick Cache Management

#### **UI Button:**
- Menu "Settings" → "Clear Cache (Development)"
- Red button with trash icon
- Shows loading state during cache clearing
- Returns to normal state after completion

#### **Keyboard Shortcuts:**
- `Cmd+Shift+C` (Mac)
- `Ctrl+Shift+C` (Windows/Linux)

#### **Manual Commands:**
```bash
npm run cache:clear
curl -X POST http://localhost:8080/api/v1/cache/clear
```

#### **Cache Management via Restart:**
```bash
./restart --cache-mode=no-cache        # Restart with cache disabled
./restart --cache-mode=development     # Restart with development cache
```

### Environment Configuration
```bash
# Development mode
export TIKTRACK_DEV_MODE=true

# Disable cache
export TIKTRACK_CACHE_DISABLED=true

# Start server
./restart quick
```

### Automatic Cache State Detection
The system automatically detects and preserves your current cache configuration:

- **Cache TTL: 0** → NO-CACHE mode
- **Cache TTL: 10** → DEVELOPMENT mode  
- **Cache TTL: 300** → PRODUCTION mode
- **Cache TTL: other** → CUSTOM mode

### Cache State Persistence
```bash
# Automatic preservation (default)
./restart                    # Keeps current cache state

# Explicit changes
./restart --cache-mode=development    # Changes to 10 seconds
./restart --cache-mode=no-cache       # Disables cache
./restart --cache-mode=production     # Changes to 5 minutes
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd TikTrackApp

# Install backend dependencies
cd Backend
pip install -r requirements.txt

# Initialize database
python -c "from app import db; db.create_all()"

# Or use the comprehensive database recreation script
python3 create_fresh_database.py

# Start development server
./restart quick

# Access application
# Open http://localhost:8080 in browser
```

### Server Management
```bash
# Quick restart (recommended for development)
./restart quick

# Complete restart (for troubleshooting)
./restart complete

# Interactive restart with user choices
./restart --interactive

# Check system status
./restart --status

# Show restart mode information
./restart --info
```

### Development Environment Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_ENV=development
export FLASK_DEBUG=1

# Start development server
./restart quick
```

## 📁 Project Structure

```
TikTrackApp/
├── Backend/                    # Python Flask backend
│   ├── dev_server.py          # Development server
│   ├── models/                # Database models
│   │   ├── __init__.py
│   │   ├── account.py
│   │   ├── trade.py
│   │   ├── alert.py
│   │   └── ...
│   ├── routes/                # API routes
│   │   ├── __init__.py
│   │   ├── api/               # API endpoints
│   │   └── pages.py           # Page routes
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── account_service.py
│   │   ├── trade_service.py
│   │   └── ...
│   ├── config/                # Configuration
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── settings.py        # Environment-based cache settings
│   │   └── logging.py
│   ├── db/                    # Database files
│   ├── migrations/            # Database migrations
│   └── trading-ui/            # Frontend files
│       ├── scripts/           # JavaScript files
│       │   ├── header-system.js
│       │   ├── simple-filter.js
│       │   ├── warning-system.js
│       │   ├── translation-utils.js
│       │   ├── data-utils.js
│       │   ├── ui-utils.js
│       │   ├── tables.js
│       │   ├── date-utils.js
│       │   ├── linked-items.js
│       │   ├── page-utils.js
│       │   ├── main.js
│       │   └── ...
│       ├── styles/            # CSS files
│       │   ├── apple-theme.css
│       │   ├── header-system.css
│       │   ├── warning-system.css
│       │   └── ...
│       └── *.html            # HTML pages
├── scripts/                   # Server management scripts
│   ├── restart                # Unified restart system
│   ├── restart_server_quick.sh    # Quick restart script
│   └── restart_server_complete.sh # Complete restart script
├── documentation/             # System documentation
└── backups/                  # System backups
```

## 🔧 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Set development mode
npm run dev:development

# Make changes
# Test thoroughly
# Update documentation

# Commit changes
git add .
git commit -m "Add new feature: description"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

### 2. Active Development (No Cache)
```bash
# Switch to no-cache mode for immediate feedback
npm run dev:no-cache

# Or use restart with cache mode
./restart --cache-mode=no-cache

# Make rapid changes and see immediate results
# Use quick cache clear button for testing
```

### 2. Bug Fixes
```bash
# Create bug fix branch
git checkout -b fix/bug-description

# Set no-cache mode for debugging
npm run dev:no-cache

# Fix the bug
# Add tests
# Update documentation

# Commit fix
git commit -m "Fix: description of the fix"

# Push and create pull request
```

### 3. Performance Testing
```bash
# Switch to production mode for performance testing
npm run dev:production

# Or use restart with production cache
./restart --cache-mode=production

# Test performance with full cache enabled
# Monitor cache hit rates and response times
```

### 3. Code Review Process
1. **Self Review**: Review your own code before submitting
2. **Peer Review**: Have another developer review your code
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update relevant documentation
5. **Cache Testing**: Test cache functionality and performance
6. **Restart Testing**: Test server restart with cache preservation
7. **Merge**: Merge after approval

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
cd Backend
# Manual testing - no automated test suite currently
# Test all functionality manually through the web interface

# Test cache management
curl -s http://localhost:8080/api/v1/cache/status
curl -s http://localhost:8080/api/v1/cache/stats
curl -X POST http://localhost:8080/api/v1/cache/clear

# Test server health
curl -s http://localhost:8080/api/health
```

### Frontend Testing
```bash
# Manual testing with browser dev tools
# Console logging for debugging
# Comprehensive error handling

# Test filter system
# Test navigation system
# Test warning system
# Test translation system

# Test cache management UI
# Test cache clearing button
# Test keyboard shortcuts (Cmd+Shift+C)
# Test loading states and error handling
```

### UI Cache Testing
```bash
# Test cache button visibility
# Check if button appears in menu
# Verify button styling and text

# Test cache clearing functionality
# Click button and verify loading state
# Check console for success/error messages
# Verify button returns to normal state

# Test keyboard shortcuts
# Press Cmd+Shift+C (Mac) or Ctrl+Shift+C (Windows)
# Verify cache clearing action
# Check console for feedback
```

### Environment Testing
```bash
# Test environment variable setting
export TIKTRACK_DEV_MODE=true
export TIKTRACK_CACHE_DISABLED=true

# Test npm scripts
npm run dev:no-cache
npm run dev:development
npm run dev:production

# Test restart with environment variables
./restart --cache-mode=development
./restart --cache-mode=no-cache
./restart --cache-mode=production

# Verify environment variables are applied
env | grep TIKTRACK
curl -s http://localhost:8080/api/v1/cache/stats
```

### Performance Testing
```bash
# Test cache performance
curl -s http://localhost:8080/api/v1/cache/health | jq '.data.performance'

# Test query optimization
curl -s http://localhost:8080/api/v1/query-optimization/stats | jq '.data'

# Test system health
curl -s http://localhost:8080/api/health | jq '.components.cache.performance'

# Monitor cache hit rates
curl -s http://localhost:8080/api/v1/cache/stats | jq '.data.hit_rate_percent'
```

### Integration Testing
```bash
# Test complete cache workflow
./restart --cache-mode=development
# Make some API calls to populate cache
curl -s http://localhost:8080/api/v1/accounts/
curl -s http://localhost:8080/api/v1/cache/stats
# Clear cache via UI or API
curl -X POST http://localhost:8080/api/v1/cache/clear
# Verify cache is cleared
curl -s http://localhost:8080/api/v1/cache/stats
```

### Error Testing
```bash
# Test cache service errors
# Stop cache service and test error handling
# Test invalid cache operations
# Test cache timeout scenarios

# Test restart script errors
# Test with invalid cache modes
# Test with missing environment variables
# Test with server already running

# Test UI error handling
# Test cache button with server down
# Test keyboard shortcuts with errors
# Test loading state timeouts
```

### Test Structure
```
Backend/
├── tests/
│   ├── test_accounts.py
│   ├── test_trades.py
│   ├── test_alerts.py
│   ├── test_api.py
│   └── ...
```

### Cache Testing
```bash
# Test cache functionality
curl -s http://localhost:8080/api/v1/cache/status
curl -s http://localhost:8080/api/v1/cache/stats
curl -X POST http://localhost:8080/api/v1/cache/clear

# Test cache performance
curl -s http://localhost:8080/api/v1/cache/health | jq '.data'

# Test cache state preservation
./restart --cache-mode=development
./restart  # Should preserve development mode
curl -s http://localhost:8080/api/v1/cache/stats | jq '.data'
```

### Restart Testing
```bash
# Test quick restart
./restart quick

# Test complete restart
./restart complete

# Test interactive restart
./restart --interactive

# Test cache mode changes
./restart --cache-mode=no-cache
./restart --cache-mode=development
./restart --cache-mode=production

# Test status and info
./restart --status
./restart --info
```

## 📊 Filter System Development

### Architecture Overview
The filter system is built around the `SimpleFilter` class in `simple-filter.js`:

```javascript
class SimpleFilter {
    constructor() {
        this.currentFilters = {
            status: [],
            type: [],
            account: [],
            date: [],
            search: ''
        };
    }
    
    async init() {
        await this.waitForElements();
        await this.initializeDefaultFilters();
        this.setupEventListeners();
    }
}
```

### Key Components

#### 1. Filter Application
```javascript
applyFilters() {
    this.applyFiltersToTradePlansTable();
    this.applyFiltersToAlertsTable();
    this.applyFiltersToDatabaseDisplayTables();
}
```

#### 2. Table-Specific Filtering
```javascript
applyFiltersToDatabaseTable(tableId) {
    const table = document.getElementById(tableId);
    const tableType = table.getAttribute('data-table-type');
    
    // Extract data based on table type
    // Apply filters with comprehensive logging
    // Update row visibility
}
```

#### 3. Preference Management
```javascript
async initializeDefaultFilters() {
    const response = await fetch('/api/v1/preferences/');
    const preferences = await response.json();
    this.currentFilters = {
        status: this.convertStatusPreference(preferences.defaultStatusFilter),
        type: this.convertTypePreference(preferences.defaultTypeFilter),
        account: this.convertAccountPreference(preferences.defaultAccountFilter),
        date: this.convertDatePreference(preferences.defaultDateRangeFilter),
        search: preferences.defaultSearchFilter || ''
    };
}
```

### Development Guidelines

#### 1. Adding New Filter Types
1. **Update `currentFilters`**: Add new filter property
2. **Add conversion function**: Create `convert*Preference()` function
3. **Add application logic**: Update `applyFiltersToDatabaseTable()`
4. **Add display updates**: Create `update*Display()` function
5. **Add button selections**: Create `update*ButtonSelections()` function
6. **Update HTML**: Add filter menu and display elements
7. **Add logging**: Include comprehensive logging

#### 2. Adding New Table Types
1. **Define table type**: Add `data-table-type` attribute
2. **Add case statement**: Update switch statement in `applyFiltersToDatabaseTable()`
3. **Define data extraction**: Specify how to extract filterable data
4. **Test thoroughly**: Test with all filter combinations

#### 3. Performance Optimization
1. **Efficient DOM queries**: Use specific selectors
2. **Debounced search**: Prevent excessive filtering during typing
3. **Smart updates**: Only update necessary elements
4. **Memory management**: Proper cleanup of event listeners

## 🎨 Frontend Development

### JavaScript Architecture

#### Module Organization
1. **`header-system.js`**: Navigation and filter interface
2. **`simple-filter.js`**: Advanced filtering system
3. **`warning-system.js`**: Centralized modal management
4. **`translation-utils.js`**: Hebrew/English translation utilities
5. **`data-utils.js`**: Data handling and API calls
6. **`ui-utils.js`**: UI utility functions
7. **`tables.js`**: Table management and sorting
8. **`date-utils.js`**: Date formatting and utilities
9. **`linked-items.js`**: Linked items management
10. **`page-utils.js`**: Page-specific utilities
11. **`main.js`**: Core initializer and dependency checker

#### Loading Order
```html
<!-- Core systems -->
<script src="scripts/header-system.js"></script>
<script src="scripts/console-cleanup.js"></script>
<script src="scripts/simple-filter.js"></script>
<script src="scripts/translation-utils.js"></script>
<script src="scripts/data-utils.js"></script>
<script src="scripts/ui-utils.js"></script>

<!-- Utility modules -->
<script src="scripts/table-mappings.js"></script>
<script src="scripts/date-utils.js"></script>
<script src="scripts/tables.js"></script>
<script src="scripts/linked-items.js"></script>
<script src="scripts/page-utils.js"></script>

<!-- Core initializer -->
<script src="scripts/main.js"></script>

<!-- Page-specific files -->
<script src="scripts/accounts.js"></script>
```

### CSS Architecture

#### File Organization
1. **`apple-theme.css`**: Base theme and variables
2. **`header-system.css`**: Header and navigation styles
3. **`warning-system.css`**: Modal and warning styles
4. **`styles.css`**: General styles and utilities

#### Responsive Design
```css
/* Mobile-first approach */
@media (max-width: 768px) {
    /* Mobile styles */
}

@media (min-width: 769px) and (max-width: 1024px) {
    /* Tablet styles */
}

@media (min-width: 1025px) {
    /* Desktop styles */
}
```

### HTML Structure

#### Required Elements
```html
<!-- Header System -->
<div id="unified-header">
    <!-- Navigation -->
    <nav class="main-navigation">
        <!-- Navigation items -->
    </nav>
    
    <!-- Filter System -->
    <div id="headerFilters">
        <!-- Filter groups -->
    </div>
</div>

<!-- Tables -->
<table id="tableId" data-table-type="table_type">
    <thead>
        <tr>
            <th>Column 1</th>
            <th>Column 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data 1</td>
            <td>Data 2</td>
        </tr>
    </tbody>
</table>
```

## 🔒 Security

### Input Validation
```python
# Backend validation
from flask import request
from services.validation_service import ValidationService

def validate_trade_data(data):
    validator = ValidationService()
    return validator.validate_trade(data)
```

### SQL Injection Prevention
```python
# Use parameterized queries
def get_trades_by_status(status):
    return Trade.query.filter_by(status=status).all()
```

### XSS Prevention
```javascript
// Frontend sanitization
function sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
}
```

## 📈 Performance

### Backend Optimization
```python
# Database optimization
def get_trades_with_accounts():
    return Trade.query.options(
        joinedload(Trade.account)
    ).all()

# Cache optimization
from services.cache_service import CacheService

cache_service = CacheService()

@cache_service.cached(timeout=300)
def get_accounts():
    return Account.query.all()
```

### Frontend Optimization
```javascript
// Debounced search
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applySearchFilter(e.target.value);
    }, 300);
});
```

### Caching
```python
# Smart caching with TTL and dependencies
from services.cache_service import CacheService

cache_service = CacheService()

@cache_service.cached(timeout=300, dependencies=['accounts'])
def get_accounts():
    return Account.query.all()

# Environment-based cache configuration
import os
if os.getenv('TIKTRACK_DEV_MODE') == 'true':
    CACHE_TTL = 10  # 10 seconds for development
else:
    CACHE_TTL = 300  # 5 minutes for production
```

## 🚀 Deployment

### Development Deployment
```bash
# Start development server
cd Backend
./restart quick

# Or with specific cache mode
./restart --cache-mode=development
./restart --cache-mode=no-cache
```

### Production Deployment
```bash
# Set production environment
export FLASK_ENV=production
export SECRET_KEY=your-secret-key

# Start production server
./restart --cache-mode=production
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8080

# Use the unified restart system
CMD ["./restart", "--cache-mode=production"]
```

## 🐛 Debugging

### Backend Debugging
```python
# Enable debug mode
app.config['DEBUG'] = True

# Add logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Cache debugging
from services.cache_service import CacheService
cache_service = CacheService()

# Check cache status
print(f"Cache enabled: {cache_service.is_enabled()}")
print(f"Cache TTL: {cache_service.get_ttl()}")
```

### Frontend Debugging
```javascript
// Console logging
console.log('🔄 Debug message:', data);

// Error handling
try {
    // Code that might fail
} catch (error) {
    console.error('❌ Error:', error);
}

// Cache debugging
console.log('Cache button found:', document.querySelector('[onclick*="clearDevelopmentCache"]'));
console.log('Cache status:', await fetch('/api/v1/cache/status').then(r => r.json()));
```

### Database Debugging
```python
# Enable SQL logging
app.config['SQLALCHEMY_ECHO'] = True

# Cache debugging
from services.cache_service import CacheService
cache_service = CacheService()

# Check cache performance
print(f"Cache hit rate: {cache_service.get_hit_rate()}")
print(f"Cache memory usage: {cache_service.get_memory_usage()}")
```

## 📚 Best Practices

### Code Organization
1. **Separation of Concerns**: Keep logic separate from presentation
2. **DRY Principle**: Don't repeat yourself
3. **Single Responsibility**: Each function should do one thing
4. **Consistent Naming**: Use clear, descriptive names

### Error Handling
1. **Graceful Degradation**: Handle errors gracefully
2. **User Feedback**: Provide clear error messages
3. **Logging**: Log errors for debugging
4. **Fallbacks**: Provide alternative functionality

### Testing
1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test component interactions
3. **End-to-End Tests**: Test complete workflows
4. **Performance Tests**: Test system performance
5. **Cache Tests**: Test cache functionality and performance
6. **Restart Tests**: Test server restart with cache preservation

### Documentation
1. **Inline Comments**: Comment complex logic
2. **Function Documentation**: Document function parameters and return values
3. **API Documentation**: Document API endpoints
4. **User Documentation**: Document user-facing features
5. **Cache Management**: Document cache modes and restart procedures
6. **Development Modes**: Document development environment setup

### Cache Management Best Practices
1. **Development Mode Selection**: Choose appropriate cache mode for your development phase
2. **Cache State Preservation**: Use automatic cache preservation for consistent development
3. **Quick Cache Clearing**: Use UI button or keyboard shortcuts for immediate cache clearing
4. **Restart Strategy**: Use quick restart for development, complete restart for troubleshooting
5. **Environment Configuration**: Set appropriate environment variables for your development needs
6. **Cache Performance Monitoring**: Monitor cache hit rates and memory usage

## 🤝 Contributing

### Development Process
1. **Fork Repository**: Create your own fork
2. **Create Branch**: Create feature branch
3. **Make Changes**: Implement your changes
4. **Test Thoroughly**: Ensure all tests pass
5. **Update Documentation**: Update relevant documentation
6. **Submit Pull Request**: Create pull request for review

### Code Review Checklist
> 📋 **כל הבדיקות הועברו ל**: [../../CENTRAL_TASKS_TODO.md](../../CENTRAL_TASKS_TODO.md)

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process changes

## 🛠️ Troubleshooting

### Common Cache Issues
1. **Cache Not Clearing**: Check if cache service is running and accessible
2. **Cache State Not Preserved**: Verify restart script is using correct environment variables
3. **Cache Button Not Working**: Check browser console for JavaScript errors
4. **Cache Performance Issues**: Monitor cache hit rates and memory usage

### Common Restart Issues
1. **Server Not Starting**: Check logs and port availability
2. **Cache Mode Not Applied**: Verify environment variables are set correctly
3. **Restart Script Errors**: Check script permissions and dependencies
4. **Cache State Detection Failed**: Verify cache API endpoints are accessible

### Debugging Steps
```bash
# Check server status
./restart --status

# Check cache status
curl -s http://localhost:8080/api/v1/cache/status

# Check environment variables
env | grep TIKTRACK

# Check server logs
tail -f Backend/logs/server_detailed.log
```

### Performance Monitoring
```bash
# Monitor cache performance
curl -s http://localhost:8080/api/v1/cache/stats | jq '.data'

# Monitor system health
curl -s http://localhost:8080/api/health | jq '.components'

# Monitor database performance
curl -s http://localhost:8080/api/v1/query-optimization/stats | jq '.data'
```

## 📞 Support

### Getting Help
- **Documentation**: Check relevant documentation
- **Issues**: Search existing issues
- **Discussions**: Use GitHub discussions
- **Team**: Contact development team

### Reporting Issues
1. **Check Existing Issues**: Search for similar issues
2. **Provide Details**: Include error messages and steps to reproduce
3. **Include Environment**: Specify OS, browser, and version
4. **Attach Logs**: Include relevant logs and screenshots

---

**Last Updated**: September 1, 2025  
**Version**: 4.1 (Advanced Development Infrastructure & Smart Cache Management)  
**Maintainer**: TikTrack Development Team
