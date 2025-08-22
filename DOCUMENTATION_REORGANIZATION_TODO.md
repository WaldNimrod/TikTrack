# Documentation Reorganization TODO List

## 📋 Overview
This document contains the complete TODO list for reorganizing all documentation files in the TikTrack project.

## 🎯 Goals
1. Create logical folder structure
2. Move files to appropriate locations
3. Clean up outdated files
4. Create new index and main documentation files
5. Update internal links

## 📁 New Structure
```
documentation/
├── README.md (new main file)
├── INDEX.md (new index file)
├── project/
├── features/
│   ├── currencies/
│   ├── preferences/
│   └── alerts/
├── database/ (unique database folder)
├── server/ (unique server folder)
├── frontend/
├── backend/
├── development/
├── testing/
├── issues/
├── todo/
└── rules/
```

## ✅ TODO List

### Phase 1: Create New Structure ✅ COMPLETED
- [x] Create new documentation folders
- [x] Create documentation/README.md (new main file)
- [x] Create documentation/INDEX.md (new index file)

### Phase 2: Process Root Files (29 files)

#### High Priority Files
- [ ] **README.md** - Main project file (keep in root)
- [ ] **CHANGELOG.md** - Move to documentation/project/
- [ ] **SUMMARY_TABLE.md** - Move to documentation/project/
- [ ] **TikTrack_Project_Summary.md** - Move to documentation/project/ (rename to PROJECT_SUMMARY.md)

#### CRUD Files (Move to backup)
- [ ] **CRUD_COMPLETION_STATUS.md** - Move to backups/documentation/
- [ ] **CRUD_FINAL_COMPLETE_STATUS.md** - Move to backups/documentation/
- [ ] **CRUD_FINAL_TESTING_RESULTS.md** - Move to backups/documentation/
- [ ] **CRUD_FINAL_TESTING_TODO.md** - Move to backups/documentation/
- [ ] **CRUD_FINAL_UPDATED_STATUS.md** - Move to backups/documentation/
- [ ] **CRUD_FIXES_TODO.md** - Move to backups/documentation/
- [ ] **CRUD_REMAINING_TODOS.md** - Move to backups/documentation/

#### Currency Files
- [ ] **CURRENCY_MIGRATION_DOCUMENTATION.md** - Move to documentation/features/currencies/MIGRATION.md
- [ ] **CURRENCY_MIGRATION_SUMMARY.md** - Move to documentation/features/currencies/SUMMARY.md

#### Database Files
- [ ] **DATABASE_CHANGES_AUGUST_2025.md** - Move to documentation/database/CHANGES_AUGUST_2025.md
- [ ] **DATABASE_PAGE_IMPROVEMENTS_AUGUST_2025.md** - Move to documentation/database/PAGE_IMPROVEMENTS.md

#### Preferences Files
- [ ] **PREFERENCES_API_DOCUMENTATION.md** - Move to documentation/features/preferences/API.md
- [ ] **PREFERENCES_DOCUMENTATION_INDEX.md** - Move to documentation/features/preferences/INDEX.md
- [ ] **PREFERENCES_JS_DOCUMENTATION.md** - Move to documentation/features/preferences/JAVASCRIPT.md
- [ ] **PREFERENCES_PAGE_REFACTORING.md** - Move to documentation/features/preferences/REFACTORING.md
- [ ] **PREFERENCES_PROJECT_SUMMARY.md** - Move to documentation/features/preferences/PROJECT_SUMMARY.md
- [ ] **PREFERENCES_SYSTEM_README.md** - Move to documentation/features/preferences/README.md
- [ ] **PREFERENCES_USER_GUIDE.md** - Move to documentation/features/preferences/USER_GUIDE.md

#### Development Files
- [ ] **README_DEVELOPMENT.md** - Move to documentation/development/README.md
- [ ] **README_NEW_DEVELOPER.md** - Move to documentation/development/NEW_DEVELOPER.md

#### Issues Files
- [ ] **CURRENT_ISSUES.md** - Move to documentation/issues/CURRENT.md
- [ ] **KNOWN_ISSUES.md** - Move to documentation/issues/KNOWN.md

#### Other Files
- [ ] **HEADER_REDESIGN_TODO.md** - Move to documentation/todo/HEADER_REDESIGN.md
- [ ] **TRADE_PLAN_LINKING_RULES.md** - Move to documentation/rules/TRADE_PLAN_LINKING.md
- [ ] **cursor_javascript_interfaces_and_filter.md** - Move to backups/documentation/ (large Cursor file)

### Phase 3: Process Backend Files
- [ ] **Backend/README_TESTING.md** - Move to documentation/testing/README.md
- [ ] **Backend/SERVER_CONFIGURATIONS.md** - Move to documentation/server/CONFIGURATIONS.md
- [ ] **Backend/DEVELOPMENT_GUIDELINES.md** - Move to documentation/server/GUIDELINES.md
- [ ] **Backend/ALERT_SYSTEM_DOCUMENTATION.md** - Move to documentation/features/alerts/README.md
- [ ] **Backend/SUMMARY_TABLE.md** - Move to documentation/project/BACKEND_SUMMARY.md

### Phase 4: Process Trading-UI Files
- [ ] **trading-ui/README_CONSOLE_CLEANUP.md** - Move to documentation/frontend/CONSOLE_CLEANUP.md
- [ ] **trading-ui/docs/CONSOLE_CLEANUP_SYSTEM.md** - Move to documentation/frontend/CONSOLE_CLEANUP_SYSTEM.md
- [ ] **trading-ui/scripts/README_ACTIVE_ALERTS_COMPONENT.md** - Move to documentation/frontend/components/ACTIVE_ALERTS.md

### Phase 5: Process Documentation Folder Files
- [ ] **documentation/README.md** - Review and update ✅ COMPLETED
- [ ] **documentation/QUICK_INDEX.md** - Review and update
- [ ] **documentation/TABLE_SORTING_SYSTEM.md** - Keep in documentation/
- [ ] **documentation/frontend/*** - Review and organize
- [ ] **documentation/backend/*** - Review and organize
- [ ] **documentation/development/*** - Review and organize
- [ ] **documentation/deployment/*** - Move to documentation/server/
- [ ] **documentation/database/*** - Keep in documentation/database/

### Phase 6: Create New Files
- [ ] Create documentation/database/README.md
- [ ] Create documentation/server/README.md
- [ ] Create documentation/server/ISSUES.md
- [ ] Create documentation/server/TROUBLESHOOTING.md
- [ ] Create documentation/database/SCHEMA.md
- [ ] Create documentation/database/MIGRATIONS.md

### Phase 7: Final Steps
- [ ] Update all internal links
- [ ] Test all links work correctly
- [ ] Update main README.md with new structure
- [ ] Create final documentation/INDEX.md ✅ COMPLETED
- [ ] Remove empty folders
- [ ] Git commit and push

## 📊 Progress Tracking
- **Total Files to Process:** 50+
- **Files Completed:** 3
- **Files Remaining:** 47+
- **Current Phase:** 2

## 🎯 Current Task
**Next File:** Process root files - starting with high priority files

## 📝 Notes
- Each file should be reviewed for content relevance
- Outdated files should be moved to backups
- Internal links should be updated
- File names should be standardized (English, descriptive)
- Use existing documentation files when possible
- Create new files only when necessary
- Always place documentation in relevant documentation/ subfolder
- Write all documentation in English only
