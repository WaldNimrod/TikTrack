# Section Toggle System Documentation - TikTrack

## 📋 Overview

The Section Toggle System is a centralized JavaScript system that handles opening and closing of page sections across all TikTrack pages. It provides consistent behavior, state persistence, and easy maintenance.

## 🏗️ System Architecture

### Core Files
- **`ui-utils.js`** - Contains all toggle functions
- **`main.js`** - Initialization and state restoration (functions moved to ui-utils.js)

### System Components
1. **Toggle Functions** - Core functionality for opening/closing sections
2. **State Management** - localStorage persistence for section states
3. **Icon Management** - Visual feedback with arrow rotation
4. **Page-Specific Logic** - Special handling for different page types

## 🎯 Available Functions

### 1. `window.toggleTopSection()`
**Purpose**: Toggle the top section (header section with alerts/summary)

**Usage**:
```html
<button class="filter-toggle-btn" onclick="toggleTopSection()" title="הצג/הסתר סקשן">
    <span class="section-toggle-icon">▼</span>
</button>
```

**Behavior**:
- Searches for `.top-section .section-body`
- Toggles between `display: block` and `display: none`
- Updates icon between `▼` and `▲`
- Saves state to localStorage with page-specific key

**Special Handling**:
- **Notes page**: Uses `notesTopSection` ID and `notesTopSectionHidden` storage key
- **Other pages**: Uses page-specific storage keys (e.g., `alertsTopSectionCollapsed`)

### 2. `window.toggleMainSection()`
**Purpose**: Toggle the main content section

**Usage**:
```html
<button class="filter-toggle-btn" onclick="toggleMainSection()" title="הצג/הסתר סקשן">
    <span class="section-toggle-icon">▼</span>
</button>
```

**Behavior**:
- Searches for `.content-section .section-body`
- Toggles visibility and updates icon
- Saves state to localStorage

### 3. `window.toggleSection(sectionId)`
**Purpose**: Toggle a specific section by ID

**Usage**:
```html
<button class="filter-toggle-btn" onclick="toggleSection('sectionId')" title="הצג/הסתר סקשן">
    <span class="section-toggle-icon">▼</span>
</button>
```

**Parameters**:
- `sectionId` (string) - The ID of the section to toggle

**Behavior**:
- Searches for section by ID or `data-section` attribute
- Finds `.section-body` within the section
- Toggles visibility and updates icon
- Saves state to localStorage with section-specific key

### 4. `window.toggleAllSections()`
**Purpose**: Toggle all content sections at once

**Usage**:
```html
<button class="filter-toggle-btn" onclick="toggleAllSections()" title="פתח/סגור הכל">
    <span class="section-toggle-icon">▼</span>
</button>
```

**Behavior**:
- Finds all `.content-section` elements
- Determines if all are collapsed or expanded
- Toggles all sections to the opposite state
- Updates all icons and saves states

## 🎨 Visual Elements

### Icon Classes
The system supports multiple icon classes for backward compatibility:
- **`.section-toggle-icon`** - Current standard (recommended)
- **`.filter-icon`** - Legacy support
- **`.filter-arrow`** - Legacy support

### Icon States
- **`▼`** - Section is open (can be closed)
- **`▲`** - Section is closed (can be opened)

### Button Classes
- **`.filter-toggle-btn`** - Standard toggle button class

## 💾 State Management

### localStorage Keys
The system uses page-specific localStorage keys to maintain section states:

#### Top Section Keys
- `topSectionCollapsed` - Default
- `alertsTopSectionCollapsed` - Alerts page
- `tradesTopSectionCollapsed` - Trades page
- `accountsTopSectionCollapsed` - Accounts page
- `tickersTopSectionCollapsed` - Tickers page
- `notesTopSectionHidden` - Notes page (special case)

#### Main Section Keys
- `mainSectionCollapsed` - Default
- `alertsMainSectionCollapsed` - Alerts page
- `tradesMainSectionCollapsed` - Trades page
- And so on...

#### Individual Section Keys
- `{sectionId}SectionCollapsed` - For each specific section

### State Restoration
The system automatically restores section states on page load through the initialization process in `main.js`.

## 🔧 Technical Implementation

### Function Structure
```javascript
window.toggleTopSection = function () {
  console.log('🔧 ui-utils.js toggleTopSection called');
  const currentPath = window.location.pathname;

  // Special handling for specific pages
  if (currentPath.includes('/notes')) {
    // Notes page specific logic
    return;
  }

  // Regular handling for other pages
  const section = document.querySelector('.top-section .section-body');
  const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // Update icon
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // Save state with page-specific key
    localStorage.setItem(storageKey, !isCollapsed);
  }
};
```

### Error Handling
- Console logging for debugging
- Graceful handling of missing elements
- Backward compatibility with legacy classes

## 📱 Page-Specific Behavior

### Notes Page
- Uses specific element IDs (`notesTopSection`, `notesMainSection`)
- Different storage keys (`notesTopSectionHidden`)
- Special toggle logic

### Database Display Page
- Multiple sections with individual toggle buttons
- Section-specific storage keys
- Dynamic section identification

### Regular Pages
- Standard section structure
- Page-specific storage keys
- Consistent behavior

## 🚀 Benefits

### 1. **Centralized Management**
- All toggle functions in one place (`ui-utils.js`)
- Easy to maintain and update
- Consistent behavior across all pages

### 2. **State Persistence**
- Sections remember their open/closed state
- User preferences are preserved across sessions
- Page-specific state management

### 3. **Backward Compatibility**
- Supports legacy icon classes
- Gradual migration path
- No breaking changes

### 4. **Performance**
- Efficient DOM queries
- Minimal reflows
- Optimized state management

### 5. **Developer Experience**
- Clear function names and parameters
- Comprehensive logging
- Easy to debug and extend

## 🔄 Migration Guide

### From Legacy Systems
1. **Update HTML**: Change `filter-arrow` to `section-toggle-icon`
2. **Remove Local Functions**: Delete page-specific toggle functions
3. **Ensure Loading**: Make sure `ui-utils.js` is loaded
4. **Test Functionality**: Verify all sections work correctly

### Adding New Pages
1. **Use Standard Structure**: Follow the HTML template
2. **Add Page-Specific Keys**: Update localStorage key logic if needed
3. **Test State Persistence**: Verify states are saved and restored

## 🐛 Troubleshooting

### Common Issues

#### 1. **Icons Not Rotating**
- Check that the icon has the correct class (`.section-toggle-icon`)
- Verify the function is finding the icon element
- Check console for error messages

#### 2. **States Not Persisting**
- Verify localStorage keys are correct
- Check that the page-specific logic is working
- Ensure the storage key matches the page

#### 3. **Functions Not Found**
- Verify `ui-utils.js` is loaded before use
- Check that functions are exported to `window` object
- Ensure no conflicts with other scripts

### Debug Commands
```javascript
// Check if functions are available
typeof window.toggleTopSection === 'function'
typeof window.toggleSection === 'function'

// Check current section states
localStorage.getItem('topSectionCollapsed')
localStorage.getItem('section1SectionCollapsed')

// Test function manually
window.toggleTopSection()
```

## 📚 Related Documentation

- [JavaScript Architecture](JAVASCRIPT_ARCHITECTURE.md)
- [Page Update Guide](PAGE_UPDATE_GUIDE.md)
- [UI Utils Implementation](../scripts/ui-utils.js)

---

**Last Updated**: January 15, 2025  
**Version**: 2.0.0  
**Maintained By**: TikTrack Development Team
