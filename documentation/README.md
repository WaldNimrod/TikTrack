# TikTrack Documentation

## 📋 Overview
This is the main documentation directory for the TikTrack investment management system. All project documentation is organized here in a logical structure.

## 🆕 Recent Updates (Version 1.5.0)

### 🎯 New Completed Modules
- **Currency Management System**: Complete CRUD operations for currencies with validation
- **Note Relation Types System**: Complete CRUD operations for note relation types
- **Database Extra Data Page**: New page for managing auxiliary database tables
- **Dynamic Table Constraints**: Real-time display of database constraints under tables

### 🔧 System Architecture Improvements
- **Table Identification System**: Implemented sophisticated table identification system supporting both dedicated pages and unified database views
  - **CSS Class-Based Identification**: For specific pages (tickers, accounts, trades) using `content-section [page]-page` classes
  - **Data Attribute-Based Identification**: For database display page using `data-table-type` attributes
  - **Centralized Table Mappings**: Unified column mapping system in `table-mappings.js`
  - **Universal Sorting System**: Global `sortTableData()` function working across all table types
  - **Enhanced Filter Integration**: Filter system now works with both page types seamlessly

### 🎨 UI/UX Improvements
- **Modal Styling Fixes**: Fixed white gaps between modal headers and borders
- **Preferences Auto-Save**: Removed all manual save buttons - settings save automatically
- **Table Header Updates**: Updated terminology for consistency
- **Button Styling**: Consistent button design for modals (white background, colored borders)
- **Section Toggle System**: Improved section collapse/expand functionality

### 🔧 Bug Fixes
- **API Endpoint Fixes**: Updated preferences API from `/api/preferences` to `/api/v1/preferences`
- **Missing Assets**: Created missing preferences icon and translation functions
- **Modal Consistency**: Standardized border-radius across all modal components
- **Infinite Loop Fix**: Fixed toggleAllSections function to prevent stack overflow
- **CSS File References**: Removed references to non-existent CSS files

### 📚 Documentation Updates
- **Updated CHANGELOG.md**: Added comprehensive version 1.5.0 documentation
- **Enhanced CSS Documentation**: Added modal styling standards to CSS_ARCHITECTURE.md
- **Created MODAL_STYLING_GUIDE.md**: New comprehensive guide for modal styling standards
- **Updated Preferences Documentation**: Added auto-save system and new fields documentation
- **Created VERSION_1.5.0_SUMMARY.md**: Comprehensive summary of all version 1.5.0 changes
- **Updated HANDOVER_SUMMARY.md**: Added new completed modules and features

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
