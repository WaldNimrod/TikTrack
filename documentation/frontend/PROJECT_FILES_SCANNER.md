# Project Files Scanner Documentation

## 📋 Overview

The **Project Files Scanner** is a global JavaScript module that provides comprehensive file discovery and caching functionality for the TikTrack project. It enables efficient scanning of all project files across different types and directories.

## 🎯 Purpose

- **File Discovery**: Automatically discover and catalog all project files
- **Caching**: Implement intelligent caching to improve performance
- **Type Classification**: Organize files by type (JS, HTML, CSS, Python, Other)
- **Statistics**: Provide detailed file statistics and counts
- **Integration**: Seamless integration with the Linter system

## 📊 File Coverage

### Current File Counts
- **JavaScript Files**: 62 files (trading-ui/scripts/)
- **HTML Files**: 50 files (trading-ui/*.html)
- **CSS Files**: 79 files (styles/ + styles-new/)
- **Python Files**: 99 files (Backend/)
- **Other Files**: 100+ files (docs, config, scripts)
- **Total**: 400+ files

### File Types Supported
- **JavaScript**: `.js` files
- **HTML**: `.html`, `.htm` files
- **CSS**: `.css` files
- **Python**: `.py` files
- **Other**: `.md`, `.json`, `.txt`, `.yml`, `.yaml`, `.xml`, `.sql`, `.sh`, `.bat` files

## 🔧 API Reference

### Core Functions

#### `getProjectFiles()`
```javascript
const files = await window.getProjectFiles();
```
**Returns**: Object containing arrays of files by type
**Caching**: 24-hour cache with automatic refresh

#### `getFilesByType(type)`
```javascript
const jsFiles = await window.getFilesByType('js');
```
**Parameters**: 
- `type` (string): File type ('js', 'html', 'css', 'python', 'other')
**Returns**: Array of file paths for the specified type

#### `getTotalFileCount()`
```javascript
const total = await window.getTotalFileCount();
```
**Returns**: Total number of files across all types

#### `getFileStatistics()`
```javascript
const stats = await window.getFileStatistics();
```
**Returns**: Object with detailed statistics:
```javascript
{
  total: 400,
  js: 62,
  html: 50,
  css: 79,
  python: 99,
  other: 110
}
```

#### `clearProjectFilesCache()`
```javascript
window.clearProjectFilesCache();
```
**Purpose**: Clear the cache and force fresh discovery

### Global Instance

#### `window.projectFilesScanner`
The global scanner instance with all methods and properties.

## 🏗️ Architecture

### Class Structure
```javascript
class ProjectFilesScanner {
  constructor() {
    this.cache = { files: null, timestamp: null, maxAge: 24 * 60 * 60 * 1000 };
    this.fileTypes = { js: {...}, html: {...}, css: {...}, python: {...}, other: {...} };
    this.excludePatterns = [...];
  }
}
```

### Caching Strategy
- **Cache Duration**: 24 hours
- **Storage**: localStorage with fallback
- **Validation**: Automatic cache validation
- **Refresh**: Automatic refresh when cache expires

### File Discovery Process
1. **Cache Check**: Check if valid cache exists
2. **Static Lists**: Use comprehensive static file lists
3. **Filtering**: Apply exclusion patterns
4. **Caching**: Store results in cache
5. **Return**: Return organized file structure

## 🔄 Integration

### Linter System Integration
The scanner is fully integrated with the Linter system:

```javascript
// In linter-realtime-monitor.js
if (typeof window.projectFilesScanner !== 'undefined') {
  const projectFiles = await window.projectFilesScanner.getProjectFiles();
  // Process files for scanning
}
```

### HTML Integration
```html
<script src="scripts/project-files-scanner.js"></script>
```

## 📁 File Organization

### Directory Structure
```
trading-ui/scripts/
├── project-files-scanner.js    # Main scanner module
├── linter-realtime-monitor.js  # Linter integration
└── ...
```

### Static File Lists
The scanner maintains comprehensive static lists of files:

- **Core System Files**: Main application files
- **Trading System**: Trading-related functionality
- **CRUD System**: Database operations
- **Preferences System**: User preferences
- **Development Tools**: Development utilities
- **Test Files**: Testing and validation
- **Additional Core Files**: Extended functionality

## 🚀 Performance

### Optimization Features
- **Intelligent Caching**: Reduces file system access
- **Static Lists**: Pre-defined file lists for speed
- **Exclusion Patterns**: Skip unnecessary files
- **Lazy Loading**: Load files only when needed

### Memory Management
- **Cache Limits**: 24-hour cache expiration
- **Cleanup**: Automatic cache cleanup
- **Efficient Storage**: Optimized localStorage usage

## 🔧 Configuration

### Exclusion Patterns
Files matching these patterns are excluded:
- `node_modules`
- `.git`
- `__pycache__`
- `.pytest_cache`
- `venv`, `env`, `.env`
- `dist`, `build`, `coverage`
- `backup`, `backups`
- `temp`, `tmp`
- `.DS_Store`, `Thumbs.db`

### File Type Extensions
```javascript
fileTypes: {
  js: { extensions: ['.js'] },
  html: { extensions: ['.html', '.htm'] },
  css: { extensions: ['.css'] },
  python: { extensions: ['.py'] },
  other: { extensions: ['.md', '.json', '.txt', '.yml', '.yaml', '.xml', '.sql', '.sh', '.bat'] }
}
```

## 🐛 Error Handling

### Robust Error Management
- **Try-Catch Blocks**: Comprehensive error handling
- **Fallback Mechanisms**: Graceful degradation
- **Logging**: Detailed error logging
- **Recovery**: Automatic recovery from errors

### Common Error Scenarios
- **Cache Corruption**: Automatic cache clearing
- **File Access Issues**: Graceful handling
- **Memory Limits**: Efficient memory management
- **Network Issues**: Offline functionality

## 📈 Usage Examples

### Basic Usage
```javascript
// Get all files
const allFiles = await window.getProjectFiles();

// Get specific file type
const jsFiles = await window.getFilesByType('js');

// Get statistics
const stats = await window.getFileStatistics();
console.log(`Total files: ${stats.total}`);
```

### Advanced Usage
```javascript
// Clear cache and refresh
window.clearProjectFilesCache();

// Check cache validity
const isValid = window.projectFilesScanner.isCacheValid();

// Get file type for specific file
const fileType = window.projectFilesScanner.getFileType('script.js');
```

## 🔄 Maintenance

### Adding New Files
1. Update static file lists in `getStaticFileLists()`
2. Add new file patterns if needed
3. Update exclusion patterns if necessary
4. Test with new file types

### Updating File Types
1. Modify `fileTypes` object
2. Update `getFileType()` method
3. Test file classification
4. Update documentation

## 🎯 Benefits

### For Developers
- **Comprehensive Coverage**: All project files included
- **Performance**: Fast file discovery with caching
- **Flexibility**: Easy to extend and modify
- **Integration**: Seamless integration with existing systems

### For the System
- **Efficiency**: Reduced file system access
- **Reliability**: Robust error handling
- **Scalability**: Easy to add new file types
- **Maintainability**: Clean, organized code

## 📝 Version History

### v1.0.0 (September 19, 2025)
- **Initial Release**: Complete project files scanner
- **File Coverage**: 400+ files across 5 types
- **Caching**: 24-hour intelligent caching
- **Integration**: Full Linter system integration
- **Error Handling**: Comprehensive error management

## 🔗 Related Documentation

- [JavaScript Architecture](JAVASCRIPT_ARCHITECTURE.md)
- [Linter System](LINTER_SYSTEM.md)
- [File Organization](FILE_ORGANIZATION.md)

---

**Last Updated**: September 19, 2025  
**Version**: 1.0.0  
**Author**: TikTrack Development Team

