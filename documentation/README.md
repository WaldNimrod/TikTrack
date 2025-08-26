# TikTrack Documentation

## 📋 Overview
This is the main documentation directory for the TikTrack investment management system. All project documentation is organized here in a logical structure.

## 🆕 Recent Updates (Version 3.0 - Unified Filter System)

### 🎯 New Completed Systems
- **Unified Filter System**: Complete centralized filtering solution for all data tables
- **Enhanced Header System**: Comprehensive integration with unified filter system
- **Preference-Based Filtering**: Server-based default filter preferences
- **Hebrew Translation System**: Automatic conversion of English preferences to Hebrew display

### 🔧 System Architecture Improvements
- **SimpleFilter Class**: Centralized filter management class with preference loading
- **Multi-Table Support**: Automatic filtering of all tables on page
- **Real-Time Updates**: Instant filtering with visual feedback and button state management
- **Error Handling**: Graceful fallback when preferences unavailable
- **Performance Optimized**: Debounced search, efficient DOM queries, minimal re-renders

### 🎨 UI/UX Improvements
- **Filter Display Updates**: Real-time updates of filter display text
- **Button State Management**: Visual indication of active filters
- **Cross-Page Consistency**: Same filter behavior across all pages
- **Preference Integration**: Automatic loading of user preferences on page load
- **Error Recovery**: Robust error handling and fallback mechanisms

### 🔧 Technical Improvements
- **Preference System**: Server-based default filter preferences (`/api/v1/preferences/`)
- **Hebrew Translation**: Automatic conversion of English preferences to Hebrew arrays
- **Event Handling**: Comprehensive event listener management
- **Display Management**: Real-time filter display updates
- **Memory Management**: Proper cleanup of event listeners

### 📚 Documentation Updates
- **Created FILTER_SYSTEM_README.md**: Comprehensive documentation for unified filter system
- **Updated HEADER_SYSTEM_README.md**: Enhanced with filter system integration
- **Updated main README.md**: Added unified filter system documentation
- **Added Integration Guides**: Complete integration and troubleshooting guides
- **Performance Documentation**: Added performance optimization guidelines

## 🏗️ Structure

### 📁 Main Categories

#### 📊 **Project Documentation**
- **`project/`** - General project information, summaries, and changelog
- **`INDEX.md`** - Quick navigation index for all documentation

#### 🎯 **Feature Documentation**
- **`features/currencies/`** - Currency system documentation
- **`features/preferences/`** - User preferences system documentation  
- **`features/alerts/`** - Alert system documentation

#### 🗄️ **Database Documentation**
- **`database/`** - All database-related documentation
  - Schema documentation
  - Migration guides
  - Change logs
  - Rules and reports

#### 🖥️ **Server Documentation**
- **`server/`** - Server configuration and deployment
  - Configuration guides
  - Deployment instructions
  - Troubleshooting
  - Known issues

#### 🎨 **Frontend Documentation**
- **`frontend/`** - User interface documentation
  - UI components
  - Console cleanup system
  - User guides
  - [מערכת התראות והודעות](frontend/NOTIFICATION_SYSTEM.md) - הסבר מפורט על ההבדל בין מערכת ההתראות למערכת ההודעות

#### ⚙️ **Backend Documentation**
- **`backend/`** - Backend system documentation
  - Grid system
  - Notes system
  - API documentation

#### 🛠️ **Development Documentation**
- **`development/`** - Development guides and workflows
  - New developer guide
  - Development guidelines
  - Workflow documentation

#### 🧪 **Testing Documentation**
- **`testing/`** - Testing system documentation
  - Test guides
  - Testing workflows

#### ⚠️ **Issues Documentation**
- **`issues/`** - Known issues and current problems
  - Current issues
  - Known problems

#### 📝 **Rules and TODOs**
- **`rules/`** - System rules and guidelines
- **`todo/`** - TODO items and planned features

## 🚀 Quick Start

### For New Developers
1. Start with `development/NEW_DEVELOPER.md`
2. Review `project/PROJECT_SUMMARY.md`
3. Check `database/README.md` for database structure
4. Review `server/README.md` for server setup

### For System Understanding
1. Review `project/PROJECT_SUMMARY.md`
2. Check `features/` for specific feature documentation
3. Review `database/README.md` for data structure
4. Check `frontend/README.md` for UI components

### For Deployment
1. Review `server/CONFIGURATIONS.md`
2. Check `server/DEPLOYMENT.md`
3. Review `server/TROUBLESHOOTING.md` if issues arise

## 📚 Documentation Standards

### File Naming
- Use English names only
- Use descriptive names
- Use UPPERCASE for main files
- Use lowercase for sub-files

### Content Standards
- Keep documentation up to date
- Include examples where relevant
- Link to related documentation
- Use clear, concise language

### Structure Standards
- Each major feature has its own folder
- Include README.md in each folder
- Use consistent formatting
- Include table of contents for long documents

## 🔗 Related Links

- **Main Project README:** `../README.md`
- **Backend Code:** `../Backend/`
- **Frontend Code:** `../trading-ui/`
- **Testing System:** `../Backend/testing_suite/`

## 📝 Contributing

When adding new documentation:
1. Place files in appropriate folders
2. Update this README.md if needed
3. Update `INDEX.md` with new entries
4. Follow naming conventions
5. Include links to related documentation

## 🆘 Support

For documentation issues or questions:
- Check `issues/` folder for known problems
- Review `server/TROUBLESHOOTING.md` for server issues
- Contact development team for technical questions

---

**Last Updated:** August 22, 2025  
**Version:** 1.0  
**Maintainer:** TikTrack Development Team
