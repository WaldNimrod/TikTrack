#!/usr/bin/env python3
"""
Cleanup Documentation Files
============================

Removes unnecessary documentation files and directories that should not
be in the development environment after updates.

Purpose: Keep documentation clean and prevent unwanted files from returning
Location: scripts/cleanup_documentation.py
"""

import shutil
import sys
from pathlib import Path
from typing import List

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
DOCUMENTATION_DIR = PROJECT_ROOT / "documentation"

# Directories to remove (if they exist)
DIRECTORIES_TO_REMOVE = [
    "01-OVERVIEW",
    "02-ARCHITECTURE",
    "03-API_REFERENCE",
    "04-FEATURES",
    "04-USAGE_EXAMPLES",
    "05-PAGE_DOCUMENTATION",
    "05-REPORTS",
    "05-USER-GUIDES",
    "06-ARCHIVE",
    "06-CODING_STANDARDS",
    "07-INDEXES",
    "api",
    "backend",
    "database",
    "developers",
    "features",
    "guides",
    "infrastructure-improvement",
    "issues",
    "pages",
    "plans",
    "project",
    "reports",
    "rules",
    "systems",
    "testing",
    "todo",
    "tools",
    "user",
    "USER_GUIDES",
    "user-guides",
]

# Files to remove from root documentation/ directory
FILES_TO_REMOVE = [
    "BROWSER_CACHE_SOLUTION_IMPLEMENTED.md",
    "CACHE_TESTING_INTERFACE_ADDED.md",
    "CHANGELOG.md",
    "CRITICAL_BROWSER_CACHE_ISSUE_ANALYSIS.md",
    "CRITICAL_SYSTEMS_VERIFICATION_REPORT.md",
    "CRUD_UI_FIX_PLAYBOOK.md",
    "CSS_MASTER_FILE_GUIDE.md",
    "DATA_LOAD_ERROR_STANDARDIZATION_REPORT.md",
    "DOCS_AUDIT_REPORT.md",
    "DOCUMENTATION_CLEANUP_REPORT.md",
    "DOCUMENTATION_CONSOLIDATION_REPORT.md",
    "FUTURE_DEVELOPMENT_ROADMAP.md",
    "LOADING_STANDARDIZATION_PROGRESS.md",
    "LOADING_SYSTEM_STANDARDIZATION_REPORT.md",
    "LOGGER_SYSTEM_SPECIFICATION.md",
    "PREFERENCES_MIGRATION_GUIDE.md",
    "PREFERENCES_USER_GUIDE.md",
    "RTL_HEBREW_GUIDE.md",
    "SCATTERED_FILES_INVENTORY.md",
    "TESTING_AND_VALIDATION.md",
    "TESTING_CHECKLIST_LOADING_STANDARDIZATION.md",
    "USER_MANAGEMENT_SYSTEM.md",
    "תבנית עמוד ניהול - 20251026.html",
]

# Files to keep in frontend/ (only these)
FRONTEND_FILES_TO_KEEP = {
    "GENERAL_SYSTEMS_LIST.md",
    "JAVASCRIPT_ARCHITECTURE.md",
    "README.md",
}

# Directories to keep
DIRECTORIES_TO_KEEP = {
    "03-DEVELOPMENT",
    "development",
    "frontend",
    "production",
    "server",
}

# Root files to keep
ROOT_FILES_TO_KEEP = {
    "INDEX.md",
    "README.md",
    "PAGES_LIST.md",
    "DOCUMENTATION_WORKING_RULES.md",
    "version-manifest.json",
}


def remove_directory(dir_path: Path) -> bool:
    """Remove a directory if it exists"""
    if dir_path.exists() and dir_path.is_dir():
        try:
            shutil.rmtree(dir_path)
            return True
        except Exception as e:
            print(f"  ⚠️  Error removing {dir_path}: {e}")
            return False
    return False


def remove_file(file_path: Path) -> bool:
    """Remove a file if it exists"""
    if file_path.exists() and file_path.is_file():
        try:
            file_path.unlink()
            return True
        except Exception as e:
            print(f"  ⚠️  Error removing {file_path}: {e}")
            return False
    return False


def cleanup_frontend_directory():
    """Clean up frontend/ directory - keep only essential files"""
    frontend_dir = DOCUMENTATION_DIR / "frontend"
    if not frontend_dir.exists():
        return 0
    
    removed_count = 0
    
    # Remove all files except those in FRONTEND_FILES_TO_KEEP
    for item in frontend_dir.iterdir():
        if item.is_file() and item.name not in FRONTEND_FILES_TO_KEEP:
            if remove_file(item):
                removed_count += 1
                print(f"  ✅ Removed: frontend/{item.name}")
        elif item.is_dir():
            # Remove all subdirectories
            if remove_directory(item):
                removed_count += 1
                print(f"  ✅ Removed: frontend/{item.name}/")
    
    return removed_count


def main():
    """Main cleanup function"""
    print("=" * 70)
    print("Documentation Cleanup")
    print("=" * 70)
    print(f"Target: {DOCUMENTATION_DIR}")
    print()
    
    if not DOCUMENTATION_DIR.exists():
        print(f"❌ Documentation directory not found: {DOCUMENTATION_DIR}")
        return False
    
    removed_dirs = 0
    removed_files = 0
    
    # Remove unwanted directories
    print("🗑️  Removing unwanted directories...")
    for dir_name in DIRECTORIES_TO_REMOVE:
        dir_path = DOCUMENTATION_DIR / dir_name
        if remove_directory(dir_path):
            removed_dirs += 1
            print(f"  ✅ Removed: {dir_name}/")
    
    # Remove unwanted root files
    print()
    print("🗑️  Removing unwanted root files...")
    for file_name in FILES_TO_REMOVE:
        file_path = DOCUMENTATION_DIR / file_name
        if remove_file(file_path):
            removed_files += 1
            print(f"  ✅ Removed: {file_name}")
    
    # Clean up frontend/ directory
    print()
    print("🗑️  Cleaning frontend/ directory...")
    frontend_removed = cleanup_frontend_directory()
    removed_files += frontend_removed
    
    # Summary
    print()
    print("=" * 70)
    print("Cleanup Complete")
    print("=" * 70)
    print(f"✅ Removed {removed_dirs} directories")
    print(f"✅ Removed {removed_files} files")
    print()
    
    # Verify what remains
    remaining_dirs = [d.name for d in DOCUMENTATION_DIR.iterdir() if d.is_dir()]
    remaining_files = [f.name for f in DOCUMENTATION_DIR.iterdir() if f.is_file() and f.suffix == '.md']
    
    print("📋 Remaining structure:")
    print(f"  Directories: {', '.join(sorted(remaining_dirs))}")
    print(f"  Root .md files: {', '.join(sorted(remaining_files))}")
    print()
    
    return True


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)

