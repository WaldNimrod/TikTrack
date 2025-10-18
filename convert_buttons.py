#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
סקריפט המרה אוטומטי לכפתורים
Auto Button Conversion Script

נוצר אוטומטית על ידי scan_all_buttons.py
"""

import re
import os
from pathlib import Path

def convert_file(file_path: str, conversions: list):
    """המרת קובץ בודד"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for conversion in conversions:
            old_pattern = re.escape(conversion['old'])
            new_replacement = conversion['new']
            content = re.sub(old_pattern, new_replacement, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ עודכן: {file_path}")
            return True
        else:
            print(f"⏭️  ללא שינויים: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ שגיאה ב-{file_path}: {e}")
        return False

def main():
    """פונקציה ראשית"""
    print("🔄 מתחיל המרה אוטומטית של כפתורים...")
    
    conversions = [
        {
            "file": "trading-ui/scripts/server-monitor.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/server-monitor.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary"\ onclick="serverMonitor\.executeCacheMode\('\$\{mode\.value\}'\);\ bootstrap\.Modal\.getInstance\(document\.getElementById\('modeSelectorModal'\)\)\.hide\(\);">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="serverMonitor.executeCacheMode(" data-classes="btn btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ class="popup\-close"\ onclick="this\.parentElement\.parentElement\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="this.parentElement.parentElement.remove()" data-classes="popup-close"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ class="btn\ btn\-success\ export\-btn"\ data\-format="csv">",
            "new": "<button data-button-type="ADD" data-classes="btn btn-success export-btn"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ class="btn\ btn\-info\ export\-btn"\ data\-format="json">",
            "new": "<button data-button-type="LINK" data-classes="btn btn-info export-btn"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ class="btn\ btn\-warning\ export\-btn"\ data\-format="clipboard">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-warning export-btn"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-modal.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-modal.js",
            "old": r"<button\ class="btn\ btn\-outline\-light\ btn\-sm"\ onclick="viewLinkedItemsForTicker\(\$\{entityData\.id\}\)"\ title="פריטים\ מקושרים">",
            "new": "<button data-button-type="EDIT" data-onclick="viewLinkedItemsForTicker(${entityData.id})" data-classes="btn btn-outline-light btn-sm" title="פריטים מקושרים"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-modal.js",
            "old": r"<button\ class="btn\ btn\-outline\-light\ btn\-sm"\ onclick="editTicker\(\$\{entityData\.id\}\)"\ title="ערוך\ טיקר">",
            "new": "<button data-button-type="EDIT" data-onclick="editTicker(${entityData.id})" data-classes="btn btn-outline-light btn-sm" title="ערוך טיקר"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-modal.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-primary"\ onclick="window\.entityDetailsModal\.retry\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.entityDetailsModal.retry()" data-classes="btn btn-outline-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/header-system.js",
            "old": r"<button\ class="filter\-toggle\ type\-filter\-toggle"\ id="typeFilterToggle"\ onclick="toggleTypeFilterMenu\(\)">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleTypeFilterMenu()" data-classes="filter-toggle type-filter-toggle" id="typeFilterToggle"></button>"
        },
        {
            "file": "trading-ui/scripts/header-system.js",
            "old": r"<button\ class="search\-clear\-btn"\ onclick="clearSearchFilter\(\)"\ title="נקה\ חיפוש">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearSearchFilter()" data-classes="search-clear-btn" title="נקה חיפוש"></button>"
        },
        {
            "file": "trading-ui/scripts/header-system.js",
            "old": r"<button\ class="reset\-btn"\ onclick="resetAllFilters\(\)"\ title="איפוס\ פילטרים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="resetAllFilters()" data-classes="reset-btn" title="איפוס פילטרים"></button>"
        },
        {
            "file": "trading-ui/scripts/header-system.js",
            "old": r"<button\ class="clear\-btn"\ onclick="clearAllFilters\(\)"\ title="נקה\ כל\ הפילטרים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearAllFilters()" data-classes="clear-btn" title="נקה כל הפילטרים"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="exportLinkedItemsData\('\$\{itemType\}',\ \$\{itemId\}\)">",
            "new": "<button data-button-type="EDIT" data-onclick="exportLinkedItemsData(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ class="btn\ btn\-outline\-secondary"\ onclick="editItem\('\$\{item\.type\}',\ \$\{item\.id\}\)"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="editItem(" data-classes="btn btn-outline-secondary" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ class="btn\ btn\-outline\-info"\ onclick="openItemPage\('\$\{item\.type\}',\ \$\{item\.id\}\)"\ title="פתח\ דף">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="openItemPage(" data-classes="btn btn-outline-info" title="פתח דף"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ class="btn\ btn\-outline\-danger"\ onclick="deleteItem\('\$\{item\.type\}',\ \$\{item\.id\}\)"\ title="מחק">",
            "new": "<button data-button-type="DELETE" data-onclick="deleteItem(" data-classes="btn btn-outline-danger" title="מחק"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ type="button"\ class="btn\-close\-custom\ btn\-close\-\$\{mode\}"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close-custom btn-close-${mode}" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-light\ p\-0"\ style="width:\ 16px;\ height:\ 16px;\ font\-size:\ 10px;"\ onclick="pageScriptsMatrix\.viewFileDetails\('\$\{script\}'\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.viewFileDetails(" data-classes="btn btn-sm btn-outline-light p-0" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-light\ p\-0"\ style="width:\ 16px;\ height:\ 16px;\ font\-size:\ 10px;"\ onclick="pageScriptsMatrix\.viewFileDetails\('\$\{script\}'\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.viewFileDetails(" data-classes="btn btn-sm btn-outline-light p-0" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-light\ p\-0"\ style="width:\ 16px;\ height:\ 16px;\ font\-size:\ 10px;"\ onclick="pageScriptsMatrix\.viewFileDetails\('\$\{script\}'\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.viewFileDetails(" data-classes="btn btn-sm btn-outline-light p-0" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-light\ p\-0"\ style="width:\ 16px;\ height:\ 16px;\ font\-size:\ 10px;"\ onclick="pageScriptsMatrix\.viewFileDetails\('\$\{script\}'\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.viewFileDetails(" data-classes="btn btn-sm btn-outline-light p-0" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-success\ ms\-2"\ onclick="pageScriptsMatrix\.refreshFilesList\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="pageScriptsMatrix.refreshFilesList()" data-classes="btn btn-sm btn-success ms-2"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.downloadFile\('\$\{filename\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.downloadFile(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="this\.previousElementSibling\.select\(\);\ document\.execCommand\('copy'\);">",
            "new": "<button data-button-type="SAVE" data-onclick="this.previousElementSibling.select(); document.execCommand(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.analyzeDependencies\(\)"\ id="analyzeDepsBtn">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.analyzeDependencies()" data-classes="btn btn-primary" id="analyzeDepsBtn"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-secondary\ ms\-2"\ onclick="pageScriptsMatrix\.viewDependencyGraph\(\)"\ id="viewGraphBtn"\ style="display:\ none;">",
            "new": "<button data-button-type="CANCEL" data-onclick="pageScriptsMatrix.viewDependencyGraph()" data-classes="btn btn-secondary ms-2" id="viewGraphBtn"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="pageScriptsMatrix\.refreshSystemStats\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="pageScriptsMatrix.refreshSystemStats()" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.backupData\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.backupData()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="pageScriptsMatrix\.cleanupOldData\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.cleanupOldData()" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-info"\ onclick="pageScriptsMatrix\.optimizeStorage\(\)">",
            "new": "<button data-button-type="LINK" data-onclick="pageScriptsMatrix.optimizeStorage()" data-classes="btn btn-info"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.renderStorageManagement\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.renderStorageManagement()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="pageScriptsMatrix\.runArchitectureCheck\(\)"\ id="archCheckBtn">",
            "new": "<button data-button-type="ADD" data-onclick="pageScriptsMatrix.runArchitectureCheck()" data-classes="btn btn-success" id="archCheckBtn"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-secondary\ ms\-2"\ onclick="pageScriptsMatrix\.viewArchitectureReport\(\)"\ id="viewArchReportBtn"\ style="display:\ none;">",
            "new": "<button data-button-type="CANCEL" data-onclick="pageScriptsMatrix.viewArchitectureReport()" data-classes="btn btn-secondary ms-2" id="viewArchReportBtn"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.syncWithSystems\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.syncWithSystems()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary\ btn\-sm"\ onclick="pageScriptsMatrix\.downloadBackup\('\$\{backupFilename\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.downloadBackup(" data-classes="btn btn-primary btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ btn\-sm\ ms\-2"\ onclick="pageScriptsMatrix\.copyBackupInfo\('\$\{backupFilename\}'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.copyBackupInfo(" data-classes="btn btn-outline-primary btn-sm ms-2"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ data\-bs\-dismiss="modal"\ onclick="window\.confirmDialogResult\ =\ 'cancel'">",
            "new": "<button data-button-type="CANCEL" data-onclick="window.confirmDialogResult = " data-classes="btn btn-secondary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-warning"\ data\-bs\-dismiss="modal"\ onclick="window\.confirmDialogResult\ =\ 'cleanup'">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.confirmDialogResult = " data-classes="btn btn-warning" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ data\-bs\-dismiss="modal"\ onclick="window\.confirmDialogResult\ =\ 'backup'">",
            "new": "<button data-button-type="SAVE" data-onclick="window.confirmDialogResult = " data-classes="btn btn-primary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ onclick="document\.getElementById\('logModal'\)\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="document.getElementById(" data-classes="btn-close" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ onclick="document\.getElementById\('logModal'\)\.remove\(\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="document.getElementById(" data-classes="btn btn-secondary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.copyToClipboard\('\$\{logText\.replace\(/'/g,\ "\\\\'"\)\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.copyToClipboard(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-success"\ onclick="pageScriptsMatrix\.downloadLog\('\$\{logText\.replace\(/'/g,\ "\\\\'"\)\}'\)">",
            "new": "<button data-button-type="ADD" data-onclick="pageScriptsMatrix.downloadLog(" data-classes="btn btn-success" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.copyDependencyGraph\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.copyDependencyGraph()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.copyArchitectureReport\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.copyArchitectureReport()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/notes.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-primary"\ onclick="loadNotesData\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="loadNotesData()" data-classes="btn btn-sm btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/notes.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-primary"\ onclick="openNoteDetails\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="openNoteDetails()" data-classes="btn btn-sm btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/notes.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-success"\ disabled>",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-success" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/notes.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="clearSelectedFile\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearSelectedFile()" data-classes="btn btn-sm btn-outline-secondary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ class="notification\-close"\ onclick="this\.parentElement\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="this.parentElement.remove()" data-classes="notification-close"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-light"\ id="\$\{modalId\}\-copy\-btn"\ title="העתק\ ללוח">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-light" id="${modalId}-copy-btn" type="button" title="העתק ללוח"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-light"\ id="\$\{modalId\}\-close\-btn"\ title="סגור">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-light" id="${modalId}-close-btn" type="button" title="סגור"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ id="\$\{modalId\}\-footer\-close">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" id="${modalId}-footer-close" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\-close\ btn\-close\-white"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="copyToClipboard\('\$\{message\.replace\(/'/g,\ "\\\\'"\)\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="copyToClipboard(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-primary\ btn\-sm"\ onclick="window\.editTicker\(\$\{entityId\}\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.editTicker(${entityId})" data-classes="btn btn-primary btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="window\.entityDetailsModal\.showLinkedItems\('\$\{entityType\}',\ \$\{entityId\}\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.entityDetailsModal.showLinkedItems(" data-classes="btn btn-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-warning\ btn\-sm"\ onclick="window\.entityDetailsModal\.exportEntity\('\$\{entityType\}',\ \$\{entityId\}\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.entityDetailsModal.exportEntity(" data-classes="btn btn-warning btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ btn\-sm\ mt\-2"\ onclick="window\.showLinkedItemsModal\ \&\&\ window\.showLinkedItemsModal\(\[\],\ 'ticker',\ window\.currentEntityId\ \|\|\ 'null'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], " data-classes="btn btn-outline-primary btn-sm mt-2"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary"\ onclick="window\.showLinkedItemsModal\ \&\&\ window\.showLinkedItemsModal\(\[\],\ 'ticker',\ window\.currentEntityId\ \|\|\ 'null'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], " data-classes="btn btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ \$\{buttonSize\}\ \$\{buttonClass\}"\ \$\{onclick\}\ title="\$\{title\}">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn ${buttonSize} ${buttonClass}" title="${title}"></button>"
        },
        {
            "file": "trading-ui/scripts/constraint-manager.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/constraint-manager.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-danger"\ onclick="removeEnumValue\(this\)">",
            "new": "<button data-button-type="DELETE" data-onclick="removeEnumValue(this)" data-classes="btn btn-sm btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/auth.js",
            "old": r"<button\ type="submit"\ class="btn\-login"\ id="loginBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-login" id="loginBtn" type="submit"></button>"
        },
        {
            "file": "trading-ui/scripts/auth.js",
            "old": r"<button\ class="btn\ btn\-outline\-danger"\ onclick="logout\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="logout()" data-classes="btn btn-outline-danger"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-info"\ onclick="if\ \(typeof\ window\.showEntityDetails\ ===\ 'function'\)\ \{\ window\.showEntityDetails\('trade_plan',\ \$\{design\.id\}\);\ \}"\ title="קישור">",
            "new": "<button data-button-type="LINK" data-onclick="if (typeof window.showEntityDetails === " data-classes="btn btn-sm btn-info" title="קישור"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-info"\ onclick="if\ \(typeof\ window\.viewLinkedItemsForTradePlan\ ===\ 'function'\)\ \{\ window\.viewLinkedItemsForTradePlan\(\$\{design\.id\}\);\ \}"\ title="קישור">",
            "new": "<button data-button-type="EDIT" data-onclick="if (typeof window.viewLinkedItemsForTradePlan === " data-classes="btn btn-sm btn-info" title="קישור"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-secondary"\ onclick="if\ \(typeof\ window\.openEditTradePlanModal\ ===\ 'function'\)\ \{\ window\.openEditTradePlanModal\(\$\{design\.id\}\);\ \}"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="if (typeof window.openEditTradePlanModal === " data-classes="btn btn-sm btn-secondary" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-warning"\ onclick="if\ \(typeof\ window\.cancelTradePlan\ ===\ 'function'\)\ \{\ window\.cancelTradePlan\(\$\{design\.id\}\);\ \}"\ title="בטל">",
            "new": "<button data-button-type="CANCEL" data-onclick="if (typeof window.cancelTradePlan === " data-classes="btn btn-sm btn-warning" title="בטל"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-danger"\ onclick="if\ \(typeof\ window\.openDeleteTradePlanModal\ ===\ 'function'\)\ \{\ window\.openDeleteTradePlanModal\(\$\{design\.id\}\);\ \}"\ title="מחק">",
            "new": "<button data-button-type="DELETE" data-onclick="if (typeof window.openDeleteTradePlanModal === " data-classes="btn btn-sm btn-danger" title="מחק"></button>"
        },
        {
            "file": "trading-ui/scripts/executions.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary\ ms\-2"\ onclick="goToTrade\(\$\{trade\.id\}\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="goToTrade(${trade.id})" data-classes="btn btn-sm btn-outline-primary ms-2"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-manager.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ onclick="window\.cacheEmptyDialogChoice\ =\ 'no';\ document\.getElementById\('cache\-empty\-dialog'\)\.remove\(\);">",
            "new": "<button data-button-type="CANCEL" data-onclick="window.cacheEmptyDialogChoice = " data-classes="btn btn-secondary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-manager.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="window\.cacheEmptyDialogChoice\ =\ 'yes';\ document\.getElementById\('cache\-empty\-dialog'\)\.remove\(\);\ window\.UnifiedLogManager\.triggerAutomaticDataRefresh\(\);">",
            "new": "<button data-button-type="SAVE" data-onclick="window.cacheEmptyDialogChoice = " data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ onclick="window\.close\(\)">",
            "new": "<button data-button-type="CLOSE" data-onclick="window.close()"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="editCssFile\('\$\{filename\}'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="editCssFile(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-danger"\ onclick="confirmDeleteCssFile\('\$\{filename\}'\)">",
            "new": "<button data-button-type="DELETE" data-onclick="confirmDeleteCssFile(" data-classes="btn btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ btn\-sm"\ onclick="viewCssFile\('\$\{result\.file\}'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="viewCssFile(" data-classes="btn btn-outline-primary btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-success\ btn\-sm"\ onclick="editCssFile\('\$\{result\.file\}'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="editCssFile(" data-classes="btn btn-outline-success btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="clearSearchResults\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearSearchResults()" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-danger"\ onclick="executeUnusedCssRemoval\(\)">",
            "new": "<button data-button-type="DELETE" data-onclick="executeUnusedCssRemoval()" data-classes="btn btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary\ ms\-2"\ onclick="resetAllDuplicates\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="resetAllDuplicates()" data-classes="btn btn-sm btn-outline-secondary ms-2"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="showSpecificDuplicateCleanupModal\('\$\{duplicate\.selector\}',\ \{files:\ \[\$\{duplicate\.files\.map\(f\ =>",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showSpecificDuplicateCleanupModal(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="removeSpecificDuplicate\('\$\{duplicate\.selector\}'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="removeSpecificDuplicate(" data-classes="btn btn-sm btn-outline-danger"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="clearDuplicateResults\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearDuplicateResults()" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="proceedWithBackup\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="proceedWithBackup()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="executeDuplicateCleanup\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="executeDuplicateCleanup()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="executeSpecificDuplicateCleanup\('\$\{selector\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="executeSpecificDuplicateCleanup(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-danger"\ onclick="executeDeleteFromFile\('\$\{selector\}'\)">",
            "new": "<button data-button-type="DELETE" data-onclick="executeDeleteFromFile(" data-classes="btn btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="clearComplianceResults\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearComplianceResults()" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="createNewCssFileFromModal\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="createNewCssFileFromModal()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ btn\-sm"\ onclick="viewCssFile\('\$\{file\.path\}'\)"\ title="צפה\ בקובץ">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="viewCssFile(" data-classes="btn btn-outline-primary btn-sm" title="צפה בקובץ"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-warning\ btn\-sm"\ onclick="editCssFile\('\$\{file\.path\}'\)"\ title="ערוך\ קובץ">",
            "new": "<button data-button-type="EDIT" data-onclick="editCssFile(" data-classes="btn btn-outline-warning btn-sm" title="ערוך קובץ"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-danger\ btn\-sm"\ onclick="confirmDeleteCssFile\('\$\{file\.path\}'\)"\ title="מחק\ קובץ">",
            "new": "<button data-button-type="DELETE" data-onclick="confirmDeleteCssFile(" data-classes="btn btn-outline-danger btn-sm" title="מחק קובץ"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-primary"\ onclick="window\.viewConstraint\('\$\{constraint\.constraint_name\}'\)"\ title="צפה\ בפרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.viewConstraint(" data-classes="btn btn-outline-primary" type="button" title="צפה בפרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-success"\ onclick="window\.validateConstraint\('\$\{constraint\.constraint_name\}'\)"\ title="בדוק\ אילוץ">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.validateConstraint(" data-classes="btn btn-outline-success" type="button" title="בדוק אילוץ"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-info"\ onclick="window\.editConstraint\('\$\{constraint\.constraint_name\}'\)"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="window.editConstraint(" data-classes="btn btn-outline-info" type="button" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-warning"\ onclick="window\.toggleConstraint\('\$\{constraint\.constraint_name\}'\)"\ title="\$\{constraint\.is_active\ \?\ 'השבת'\ :\ 'הפעל'\}">",
            "new": "<button data-button-type="TOGGLE" data-onclick="window.toggleConstraint(" data-classes="btn btn-outline-warning" type="button" title="${constraint.is_active ? "></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="alert">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="alert"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="window\.editConstraint\('\$\{constraint\.constraint_name\}'\)"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="EDIT" data-onclick="window.editConstraint(" data-classes="btn btn-primary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="exportValidationReport\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="exportValidationReport()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/warning-system.js",
            "old": r"<button\ type="button"\ class="btn\-close\ btn\-close\-white"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/warning-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-\$\{color\}\ confirm\-btn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-${color} confirm-btn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/preferences-admin.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="window\.editAdminPreference\('\$\{pref\.name\}'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.editAdminPreference(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/preferences-admin.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="window\.resetAdminPreference\('\$\{pref\.name\}'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.resetAdminPreference(" data-classes="btn btn-sm btn-outline-danger"></button>"
        },
        {
            "file": "trading-ui/scripts/preferences-admin.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="\$\{detailsFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="${detailsFunction}(" data-classes="btn btn-sm btn-outline-success" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="\$\{linkedFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="אובייקטים\ מקושרים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="${linkedFunction}(" data-classes="btn btn-sm btn-outline-success" title="אובייקטים מקושרים"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ onclick="\$\{editFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="${editFunction}(" data-classes="btn btn-sm btn-outline-warning" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ \$\{buttonClass\}"\ onclick="\$\{buttonFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="\$\{buttonTitle\}">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="${buttonFunction}(" data-classes="btn btn-sm ${buttonClass}" title="${buttonTitle}"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="\$\{deleteFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="מחק"\ style="font\-size:\ 0\.8em;">",
            "new": "<button data-button-type="DELETE" data-onclick="${deleteFunction}(" data-classes="btn btn-sm btn-outline-danger" title="מחק"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-realtime-monitor.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-realtime-monitor.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="exportSuggestions\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="exportSuggestions()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-realtime-monitor.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-realtime-monitor.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-danger"\ onclick="exportCriticalErrors\(\)">",
            "new": "<button data-button-type="DELETE" data-onclick="exportCriticalErrors()" data-classes="btn btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-export-system.js",
            "old": r"<button\ onclick="restoreVersionSnapshot\('\$\{version\.id\}'\)"\ class="btn\ btn\-sm\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-onclick="restoreVersionSnapshot(" data-classes="btn btn-sm btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/db_display.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="editRecord\('\$\{tableType\}',\ \$\{recordId\}\)"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="editRecord(" data-classes="btn btn-sm btn-outline-primary" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/db_display.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="deleteRecord\('\$\{tableType\}',\ \$\{recordId\}\)"\ title="מחק">",
            "new": "<button data-button-type="DELETE" data-onclick="deleteRecord(" data-classes="btn btn-sm btn-outline-danger" title="מחק"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ log\-refresh\-btn"\ title="רענון">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon log-refresh-btn" title="רענון"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ log\-export\-btn"\ title="ייצוא">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon log-export-btn" title="ייצוא"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ log\-config\-btn"\ title="הגדרות">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon log-config-btn" title="הגדרות"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ filter\-apply"\ title="החל\ סינון">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon filter-apply" title="החל סינון"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ filter\-clear"\ title="נקה">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon filter-clear" title="נקה"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-action\ btn\-primary\ view\-details\-btn"\ title="פרטים">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-action btn-primary view-details-btn" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-action\ btn\-secondary\ copy\-btn"\ title="העתקה">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-action btn-secondary copy-btn" title="העתקה"></button>"
        },
        {
            "file": "trading-ui/scripts/chart-management.js",
            "old": r"<button\ class="action\-btn\ small"\ onclick="refreshChart\(\$\{index\}\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshChart(${index})" data-classes="action-btn small"></button>"
        },
        {
            "file": "trading-ui/scripts/chart-management.js",
            "old": r"<button\ class="action\-btn\ small"\ onclick="exportChart\(\$\{index\}\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="exportChart(${index})" data-classes="action-btn small"></button>"
        },
        {
            "file": "trading-ui/scripts/chart-management.js",
            "old": r"<button\ class="action\-btn\ small\ danger"\ onclick="destroyChart\(\$\{index\}\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="destroyChart(${index})" data-classes="action-btn small danger"></button>"
        },
        {
            "file": "trading-ui/scripts/background-tasks.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-success"\ onclick="executeTask\('\$\{task\.name\}'\)"\ \$\{!task\.enabled\ \?\ 'disabled'\ :\ ''\}\ title="הפעל\ משימה">",
            "new": "<button data-button-type="ADD" data-onclick="executeTask(" data-classes="btn btn-sm btn-success" title="הפעל משימה"></button>"
        },
        {
            "file": "trading-ui/scripts/background-tasks.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-warning"\ onclick="toggleTask\('\$\{task\.name\}'\)"\ title="\$\{task\.enabled\ \?\ 'כבה\ משימה'\ :\ 'הפעל\ משימה'\}">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleTask(" data-classes="btn btn-sm btn-warning" title="${task.enabled ? "></button>"
        },
        {
            "file": "trading-ui/scripts/background-tasks.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-danger"\ onclick="stopTask\('\$\{task\.name\}'\)"\ \$\{!task\.enabled\ \?\ 'disabled'\ :\ ''\}\ title="עצור\ משימה">",
            "new": "<button data-button-type="DELETE" data-onclick="stopTask(" data-classes="btn btn-sm btn-danger" title="עצור משימה"></button>"
        },
        {
            "file": "trading-ui/scripts/background-tasks.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-primary"\ onclick="showTaskDetails\('\$\{task\.name\}'\)"\ title="פרטי\ משימה">",
            "new": "<button data-button-type="SAVE" data-onclick="showTaskDetails(" data-classes="btn btn-sm btn-primary" title="פרטי משימה"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="viewTickerDetails\('\$\{trade\.ticker_id\}'\)"\ title="פרטי\ טיקר"\ style="padding:\ 2px\ 6px;\ font\-size:\ 12px;">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="viewTickerDetails(" data-classes="btn btn-sm btn-outline-secondary" title="פרטי טיקר"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-info"\ onclick="viewLinkedItemsForTrade\(\$\{trade\.id\}\)"\ title="הצג\ פריטים\ מקושרים">",
            "new": "<button data-button-type="EDIT" data-onclick="viewLinkedItemsForTrade(${trade.id})" data-classes="btn btn-sm btn-info" title="הצג פריטים מקושרים"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-secondary"\ onclick="editTradeRecord\('\$\{trade\.id\}'\)"\ title="ערוך\ טרייד">",
            "new": "<button data-button-type="EDIT" data-onclick="editTradeRecord(" data-classes="btn btn-sm btn-secondary" title="ערוך טרייד"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-warning"\ onclick="window\.cancelTrade\(\$\{trade\.id\}\)"\ title="בטל\ טרייד">",
            "new": "<button data-button-type="CANCEL" data-onclick="window.cancelTrade(${trade.id})" data-classes="btn btn-sm btn-warning" title="בטל טרייד"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-danger"\ onclick="deleteTradeRecord\('\$\{trade\.id\}'\)"\ title="מחק\ טרייד">",
            "new": "<button data-button-type="DELETE" data-onclick="deleteTradeRecord(" data-classes="btn btn-sm btn-danger" title="מחק טרייד"></button>"
        },
        {
            "file": "trading-ui/scripts/trading_accounts.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/external-data-dashboard.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-primary"\ onclick="testProvider\('\$\{provider\.id\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="testProvider(" data-classes="btn btn-sm btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/external-data-dashboard.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-secondary"\ onclick="toggleProvider\('\$\{provider\.id\}'\)">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleProvider(" data-classes="btn btn-sm btn-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary\ me\-2"\ onclick="SystemManagement\.copyCheckResultsToClipboard\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="SystemManagement.copyCheckResultsToClipboard()" data-classes="btn btn-sm btn-outline-primary me-2"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="document\.getElementById\('system\-check\-results'\)\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="document.getElementById(" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="SystemManagement\.copyCheckResultsToClipboard\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="SystemManagement.copyCheckResultsToClipboard()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ type="button"\ class="btn\-close\ ms\-auto"\ onclick="this\.parentElement\.parentElement\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="this.parentElement.parentElement.remove()" data-classes="btn-close ms-auto" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary"\ onclick="SystemManagement\.executeCacheMode\('\$\{mode\.value\}'\);\ bootstrap\.Modal\.getInstance\(document\.getElementById\('modeSelectorSystemModal'\)\)\.hide\(\);">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="SystemManagement.executeCacheMode(" data-classes="btn btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="saveConditionsBtn">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="saveConditionsBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ id="testConditionsBtn">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" id="testConditionsBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="addConditionBtn">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="addConditionBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ id="cancelParameterBtn">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" id="cancelParameterBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-primary\ edit\-condition\-btn"\ data\-index="\$\{index\}">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-primary edit-condition-btn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-danger\ delete\-condition\-btn"\ data\-index="\$\{index\}">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-danger delete-condition-btn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-system/entity-details-system.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal"\ aria\-label="סגור">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal" aria-label="סגור"></button>"
        },
        {
            "file": "trading-ui/designs.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/designs.html",
            "old": r"<button\ class="btn\ filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="btn filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ btn\-sm"\ onclick="window\.toggleSection\('infoSummary'\)"\ title="הצג/הסתר">",
            "new": "<button data-button-type="TOGGLE" data-onclick="window.toggleSection(" data-classes="btn btn-outline-secondary btn-sm" title="הצג/הסתר"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ btn\-sm"\ onclick="window\.toggleAllSections\(\)"\ title="הצג/הסתר">",
            "new": "<button data-button-type="TOGGLE" data-onclick="window.toggleAllSections()" data-classes="btn btn-outline-secondary btn-sm" title="הצג/הסתר"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-danger">",
            "new": "<button data-button-type="DELETE" data-classes="btn btn-danger"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-primary\ btn\-sm\ w\-100\ mb\-2"\ onclick="saveNotificationMode\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="saveNotificationMode()" data-classes="btn btn-primary btn-sm w-100 mb-2"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/preferences.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/index.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/index.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/index.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/constraints.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/constraints.html",
            "old": r"<button\ class="btn\ filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ כל\ הסקשנים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="btn filter-toggle-btn" title="הצג/הסתר כל הסקשנים"></button>"
        },
        {
            "file": "trading-ui/constraints.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/constraints.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט\ עם\ כל\ הנתונים\ והסטטוס">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט עם כל הנתונים והסטטוס"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('generalControlSection'\)"\ title="הצג/הסתר\ פאנל\ בקרה\ כללי">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר פאנל בקרה כללי"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('fileMappingSection'\)"\ title="הצג/הסתר\ מיפוי\ קבצים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר מיפוי קבצים"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="window\.discoverProjectFiles\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="window.discoverProjectFiles()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-info"\ onclick="window\.refreshFileList\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="window.refreshFileList()" data-classes="btn btn-info"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="window\.clearFileCache\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.clearFileCache()" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="window\.exportFileList\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="window.exportFileList()" data-classes="btn btn-success"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('scanningSection'\)"\ title="הצג/הסתר\ סריקה">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סריקה"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-primary"\ id="startScanBtn"\ onclick="window\.startFileScan\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="window.startFileScan()" data-classes="btn btn-primary" id="startScanBtn"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-warning"\ id="pauseScanBtn"\ onclick="window\.pauseScan\(\)"\ disabled>",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.pauseScan()" data-classes="btn btn-warning" id="pauseScanBtn"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-danger"\ id="stopScanBtn"\ onclick="window\.stopScan\(\)"\ disabled>",
            "new": "<button data-button-type="DELETE" data-onclick="window.stopScan()" data-classes="btn btn-danger" id="stopScanBtn"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-info"\ onclick="window\.scheduleScan\(\)">",
            "new": "<button data-button-type="LINK" data-onclick="window.scheduleScan()" data-classes="btn btn-info"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('fixesSection'\)"\ title="הצג/הסתר\ תיקונים\ ופעולות\ נוספות">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר תיקונים ופעולות נוספות"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-success"\ id="startFixBtn"\ onclick="window\.fixAllIssues\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="window.fixAllIssues()" data-classes="btn btn-success" id="startFixBtn"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-warning"\ id="fixErrorsBtn"\ onclick="window\.fixAllErrors\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.fixAllErrors()" data-classes="btn btn-warning" id="fixErrorsBtn"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-info"\ id="fixWarningsBtn"\ onclick="window\.fixAllWarnings\(\)">",
            "new": "<button data-button-type="LINK" data-onclick="window.fixAllWarnings()" data-classes="btn btn-info" id="fixWarningsBtn"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-secondary"\ id="ignoreIssuesBtn"\ onclick="window\.ignoreAllIssues\(\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="window.ignoreAllIssues()" data-classes="btn btn-secondary" id="ignoreIssuesBtn"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="window\.runComprehensiveTests\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="window.runComprehensiveTests()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-outline\-success"\ onclick="window\.runQuickHealthCheck\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.runQuickHealthCheck()" data-classes="btn btn-outline-success"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning"\ onclick="window\.resetFixedIssues\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.resetFixedIssues()" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-outline\-info"\ onclick="window\.copyUnresolvedIssuesLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.copyUnresolvedIssuesLog()" data-classes="btn btn-outline-info"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('monitoringSection'\)"\ title="הצג/הסתר\ ניתור\ והיסטוריה">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר ניתור והיסטוריה"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-success"\ id="startMonitoringBtn"\ onclick="startMonitoring\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="startMonitoring()" data-classes="btn btn-success" id="startMonitoringBtn"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-secondary"\ id="stopMonitoringBtn"\ disabled\ onclick="stopMonitoring\(\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="stopMonitoring()" data-classes="btn btn-secondary" id="stopMonitoringBtn"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="window\.refreshChartData\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="window.refreshChartData()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="window\.clearChartHistory\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.clearChartHistory()" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-info"\ onclick="window\.exportChartData\(\)">",
            "new": "<button data-button-type="LINK" data-onclick="window.exportChartData()" data-classes="btn btn-info"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="btn\ btn\-outline\-primary"\ onclick="window\.startRealTimeMonitoring\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.startRealTimeMonitoring()" data-classes="btn btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="refresh\-btn"\ onclick="window\.updateProgressDetailsTable\ \&\&\ window\.updateProgressDetailsTable\(\)"\ title="רענן\ פירוט\ סריקה">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.updateProgressDetailsTable && window.updateProgressDetailsTable()" data-classes="refresh-btn" title="רענן פירוט סריקה"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('progressDetailsSection'\)"\ title="הצג/הסתר\ פירוט\ סריקה">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר פירוט סריקה"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="refresh\-btn"\ onclick="window\.updateProblemFilesTable\ \&\&\ window\.updateProblemFilesTable\(\)"\ title="רענן\ רשימת\ קבצים\ בעייתיים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.updateProblemFilesTable && window.updateProblemFilesTable()" data-classes="refresh-btn" title="רענן רשימת קבצים בעייתיים"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('problemFilesSection'\)"\ title="הצג/הסתר\ קבצים\ בעייתיים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר קבצים בעייתיים"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="refresh\-btn"\ onclick="window\.updateFixDetailsTable\ \&\&\ window\.updateFixDetailsTable\(\)"\ title="רענן\ פירוט\ תיקונים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.updateFixDetailsTable && window.updateFixDetailsTable()" data-classes="refresh-btn" title="רענן פירוט תיקונים"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('fixDetailsSection'\)"\ title="הצג/הסתר\ פירוט\ תיקונים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר פירוט תיקונים"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="refresh\-btn"\ onclick="window\.loadIssues\ \&\&\ window\.loadIssues\(\)"\ title="רענן\ לוגים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.loadIssues && window.loadIssues()" data-classes="refresh-btn" title="רענן לוגים"></button>"
        },
        {
            "file": "trading-ui/linter-realtime-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('logsSection'\)"\ title="הצג/הסתר\ לוגים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר לוגים"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט\ עם\ כל\ הנתונים\ והסטטוס">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט עם כל הנתונים והסטטוס"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ btn\-sm"\ onclick="refreshChartsStatus\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshChartsStatus()" data-classes="btn btn-outline-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-success\ btn\-sm"\ onclick="exportAllCharts\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="exportAllCharts()" data-classes="btn btn-outline-success btn-sm"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ btn\-sm"\ onclick="toggleSection\('overviewSection'\)">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="btn btn-outline-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ btn\-sm"\ onclick="toggleSection\('managementSection'\)">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="btn btn-outline-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-primary\ me\-2"\ onclick="createNewChart\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="createNewChart()" data-classes="btn btn-primary me-2"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-secondary\ me\-2"\ onclick="refreshAllCharts\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshAllCharts()" data-classes="btn btn-secondary me-2"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-danger"\ onclick="destroyAllCharts\(\)">",
            "new": "<button data-button-type="DELETE" data-onclick="destroyAllCharts()" data-classes="btn btn-danger"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-primary\ btn\-sm\ me\-2\ mb\-2"\ onclick="createTestChart\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="createTestChart()" data-classes="btn btn-primary btn-sm me-2 mb-2"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm\ me\-2\ mb\-2"\ onclick="createPerformanceChart\(\)">",
            "new": "<button data-button-type="LINK" data-onclick="createPerformanceChart()" data-classes="btn btn-info btn-sm me-2 mb-2"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-success\ btn\-sm\ me\-2\ mb\-2"\ onclick="createAccountChart\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="createAccountChart()" data-classes="btn btn-success btn-sm me-2 mb-2"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-warning\ btn\-sm\ me\-2\ mb\-2"\ onclick="createMixedChart\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="createMixedChart()" data-classes="btn btn-warning btn-sm me-2 mb-2"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm\ me\-2\ mb\-2"\ onclick="updateTestChart\(\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="updateTestChart()" data-classes="btn btn-secondary btn-sm me-2 mb-2"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ btn\-sm\ me\-2\ mb\-2"\ onclick="exportTestChart\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="exportTestChart()" data-classes="btn btn-outline-primary btn-sm me-2 mb-2"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-danger\ btn\-sm\ mb\-2"\ onclick="destroyTestChart\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="destroyTestChart()" data-classes="btn btn-outline-danger btn-sm mb-2"></button>"
        },
        {
            "file": "trading-ui/chart-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ btn\-sm"\ onclick="toggleSection\('settingsSection'\)">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="btn btn-outline-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ כל\ הסקשנים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="filter-toggle-btn" title="הצג/הסתר כל הסקשנים"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section2'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-secondary">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="loadCssFilesList\(\)"\ title="רענן\ רשימת\ קבצים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="loadCssFilesList()" data-classes="btn btn-sm btn-outline-success" title="רענן רשימת קבצים"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section3'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section4'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-success\ w\-100"\ onclick="refreshCssStats\(\)"\ title="רענן\ נתוני\ CSS">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshCssStats()" data-classes="btn btn-success w-100" title="רענן נתוני CSS"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-info\ w\-100"\ onclick="minifyCss\(\)"\ title="דחוס\ קבצי\ CSS">",
            "new": "<button data-button-type="LINK" data-onclick="minifyCss()" data-classes="btn btn-info w-100" title="דחוס קבצי CSS"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-warning\ w\-100"\ onclick="validateCss\(\)"\ title="בדוק\ תקינות\ CSS">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="validateCss()" data-classes="btn btn-warning w-100" title="בדוק תקינות CSS"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ w\-100"\ onclick="detectCssDuplicates\(\)"\ title="זהה\ כפילויות\ CSS">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="detectCssDuplicates()" data-classes="btn btn-outline-primary w-100" title="זהה כפילויות CSS"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ w\-100"\ onclick="checkArchitectureCompliance\(\)"\ title="בדוק\ תאימות\ ITCSS">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="checkArchitectureCompliance()" data-classes="btn btn-outline-secondary w-100" title="בדוק תאימות ITCSS"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-danger\ w\-100"\ onclick="removeUnusedCss\(\)"\ title="הסר\ CSS\ לא\ בשימוש">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="removeUnusedCss()" data-classes="btn btn-outline-danger w-100" title="הסר CSS לא בשימוש"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-success\ w\-100"\ onclick="showAddCssFileModal\(\)"\ title="הוסף\ קובץ\ CSS\ חדש">",
            "new": "<button data-button-type="ADD" data-onclick="showAddCssFileModal()" data-classes="btn btn-outline-success w-100" title="הוסף קובץ CSS חדש"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section5'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="searchCssRules\(\)"\ title="חפש\ בקבצי\ CSS">",
            "new": "<button data-button-type="SAVE" data-onclick="searchCssRules()" data-classes="btn btn-primary" title="חפש בקבצי CSS"></button>"
        },
        {
            "file": "trading-ui/css-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary"\ onclick="clearCssSearch\(\)"\ title="נקה\ חיפוש">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearCssSearch()" data-classes="btn btn-outline-secondary" title="נקה חיפוש"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="refreshCacheStatus\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshCacheStatus()" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="toggleAllSections\(\)">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ onclick="copyDetailedLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-info"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="clearAllUnifiedCache\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearAllUnifiedCache()" data-classes="btn btn-sm btn-outline-danger"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="optimizeUnifiedCache\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="optimizeUnifiedCache()" data-classes="btn btn-sm btn-outline-success"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="runCacheHealthCheck\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="runCacheHealthCheck()" data-classes="btn btn-sm btn-outline-success"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ onclick="testCachePerformance\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testCachePerformance()" data-classes="btn btn-sm btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ onclick="testCacheIntegration\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testCacheIntegration()" data-classes="btn btn-sm btn-outline-info"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="runUnifiedCacheTest\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="runUnifiedCacheTest()" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="clearAllUnifiedCache\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearAllUnifiedCache()" data-classes="btn btn-sm btn-outline-danger"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="optimizeUnifiedCache\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="optimizeUnifiedCache()" data-classes="btn btn-sm btn-outline-success"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ onclick="fullSystemSync\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="fullSystemSync()" data-classes="btn btn-sm btn-outline-info"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="refreshCacheStatus\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshCacheStatus()" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section2'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="clearUnifiedCacheLayer\('memory'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearUnifiedCacheLayer(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ onclick="clearPageData\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearPageData()" data-classes="btn btn-sm btn-outline-info"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ onclick="refreshUIState\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshUIState()" data-classes="btn btn-sm btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="showMemoryStats\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showMemoryStats()" data-classes="btn btn-sm btn-outline-success"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section3'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="clearUnifiedCacheLayer\('localStorage'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearUnifiedCacheLayer(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ onclick="clearUserPreferences\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearUserPreferences()" data-classes="btn btn-sm btn-outline-info"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ onclick="clearSystemSettings\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearSystemSettings()" data-classes="btn btn-sm btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="showLocalStorageStats\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showLocalStorageStats()" data-classes="btn btn-sm btn-outline-success"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section4'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="clearUnifiedCacheLayer\('indexedDB'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearUnifiedCacheLayer(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ onclick="clearTableData\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearTableData()" data-classes="btn btn-sm btn-outline-info"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ onclick="clearNotificationHistory\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearNotificationHistory()" data-classes="btn btn-sm btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="showIndexedDBStats\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showIndexedDBStats()" data-classes="btn btn-sm btn-outline-success"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section5'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="clearUnifiedCacheLayer\('backend'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearUnifiedCacheLayer(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ onclick="syncWithBackend\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="syncWithBackend()" data-classes="btn btn-sm btn-outline-info"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ onclick="clearExpiredBackendCache\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearExpiredBackendCache()" data-classes="btn btn-sm btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="showBackendStats\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showBackendStats()" data-classes="btn btn-sm btn-outline-success"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section6'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ onclick="clearLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearLog()" data-classes="btn btn-sm btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/cache-test.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ onclick="exportLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="exportLog()" data-classes="btn btn-sm btn-outline-info"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="copyNotificationsToClipboard\(\)"\ title="העתק\ לוג\ התראות\ ללוח">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyNotificationsToClipboard()" data-classes="btn btn-sm btn-outline-primary" title="העתק לוג התראות ללוח"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט\ ללוח">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט ללוח"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-success"\ onclick="testSuccessNotification\(\)"\ title="בדיקת\ הודעת\ הצלחה">",
            "new": "<button data-button-type="ADD" data-onclick="testSuccessNotification()" data-classes="btn btn-sm btn-success" title="בדיקת הודעת הצלחה"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-danger"\ onclick="testErrorNotification\(\)"\ title="בדיקת\ הודעת\ שגיאה">",
            "new": "<button data-button-type="DELETE" data-onclick="testErrorNotification()" data-classes="btn btn-sm btn-danger" title="בדיקת הודעת שגיאה"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-warning"\ onclick="testWarningNotification\(\)"\ title="בדיקת\ הודעת\ אזהרה">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testWarningNotification()" data-classes="btn btn-sm btn-warning" title="בדיקת הודעת אזהרה"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-info"\ onclick="testInfoNotification\(\)"\ title="בדיקת\ הודעת\ מידע">",
            "new": "<button data-button-type="LINK" data-onclick="testInfoNotification()" data-classes="btn btn-sm btn-info" title="בדיקת הודעת מידע"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="testConfirmationDialog\(\)"\ title="בדיקת\ הודעת\ אישור">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testConfirmationDialog()" data-classes="btn btn-sm btn-outline-primary" title="בדיקת הודעת אישור"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="testDetailsModal\(\)"\ title="בדיקת\ מודל\ פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testDetailsModal()" data-classes="btn btn-sm btn-outline-secondary" title="בדיקת מודל פרטים"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('top'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('notification\-modes\-testing'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ w\-100"\ onclick="testNotificationMode\('debug'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testNotificationMode(" data-classes="btn btn-outline-secondary w-100"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ w\-100"\ onclick="testNotificationMode\('development'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testNotificationMode(" data-classes="btn btn-outline-primary w-100"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-outline\-success\ w\-100"\ onclick="testNotificationMode\('work'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testNotificationMode(" data-classes="btn btn-outline-success w-100"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-outline\-danger\ w\-100"\ onclick="testNotificationMode\('silent'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testNotificationMode(" data-classes="btn btn-outline-danger w-100"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="btn\ btn\-primary\ w\-100"\ onclick="runFullNotificationModeTest\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="runFullNotificationModeTest()" data-classes="btn btn-primary w-100"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/notifications-center.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section2'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="analyzeTicker\('GOOGL'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="analyzeTicker(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/research.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="analyzeTicker\('TSLA'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="analyzeTicker(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/db_display.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/db_display.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/db_display.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/db_display.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/db_display.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/db_display.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/db_display.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/notes.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/tickers.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ כל\ הסקשנים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="filter-toggle-btn" title="הצג/הסתר כל הסקשנים"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="refreshProviders\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshProviders()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-secondary"\ onclick="refreshProviders\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshProviders()" data-classes="btn btn-secondary"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section2'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ w\-100\ mb\-2"\ onclick="runUnitTests\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="runUnitTests()" data-classes="btn btn-outline-primary w-100 mb-2"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ w\-100\ mb\-2"\ onclick="testSpecificFunction\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testSpecificFunction()" data-classes="btn btn-outline-secondary w-100 mb-2"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-info\ w\-100"\ onclick="generateTestReport\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="generateTestReport()" data-classes="btn btn-outline-info w-100"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-success\ w\-100\ mb\-2"\ onclick="startPerformanceMonitoring\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="startPerformanceMonitoring()" data-classes="btn btn-outline-success w-100 mb-2"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning\ w\-100\ mb\-2"\ onclick="analyzeBottlenecks\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="analyzeBottlenecks()" data-classes="btn btn-outline-warning w-100 mb-2"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-danger\ w\-100"\ onclick="stopPerformanceMonitoring\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="stopPerformanceMonitoring()" data-classes="btn btn-outline-danger w-100"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-success\ w\-100\ mb\-2"\ onclick="testAllProviders\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testAllProviders()" data-classes="btn btn-outline-success w-100 mb-2"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-info\ w\-100\ mb\-2"\ onclick="exportData\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="exportData()" data-classes="btn btn-outline-info w-100 mb-2"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning\ w\-100"\ onclick="backupData\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="backupData()" data-classes="btn btn-outline-warning w-100"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ w\-100\ mb\-2"\ onclick="testAPIEndpoints\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testAPIEndpoints()" data-classes="btn btn-outline-primary w-100 mb-2"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ w\-100\ mb\-2"\ onclick="testRateLimiting\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testRateLimiting()" data-classes="btn btn-outline-secondary w-100 mb-2"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-outline\-info\ w\-100"\ onclick="testErrorHandling\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="testErrorHandling()" data-classes="btn btn-outline-info w-100"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="refreshPerformanceCharts\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshPerformanceCharts()" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="exportPerformanceData\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="exportPerformanceData()" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section3'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="refreshChart\('responseTimeChart'\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshChart(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="refreshChart\('dataQualityChart'\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshChart(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="refreshChart\('providerComparisonChart'\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshChart(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="refreshChart\('errorAnalysisChart'\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshChart(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/external-data-dashboard.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section4'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-success"\ id="addTradePlanBtn"\ title="הוסף\ תכנון\ חדש"\ onclick="if\ \(typeof\ window\.showAddTradePlanModal\ ===\ 'function'\)\ \{\ window\.showAddTradePlanModal\(\);\ \}">",
            "new": "<button data-button-type="ADD" data-onclick="if (typeof window.showAddTradePlanModal === " data-classes="btn btn-success" id="addTradePlanBtn" type="button" title="הוסף תכנון חדש"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-secondary"\ onclick="toggleSection\('top'\)"\ title="הצג/הסתר\ אזור\ תכנון\ טריידים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="btn btn-outline-secondary" type="button" title="הצג/הסתר אזור תכנון טריידים"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ active"\ data\-type="all"\ title="הצג\ הכל"\ style="background\-color:\ white;\ color:\ \#28a745;\ border\-color:\ \#28a745;"\ onclick="filterTradePlansByType\('all'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="filterTradePlansByType(" data-classes="btn btn-sm active" type="button" title="הצג הכל"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-primary"\ data\-type="swing"\ title="Swing\ Trading"\ style="width:\ 32px;\ height:\ 32px;\ padding:\ 0;\ display:\ flex;\ align\-items:\ center;\ justify\-content:\ center;"\ onclick="filterTradePlansByType\('swing'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="filterTradePlansByType(" data-classes="btn btn-sm btn-outline-primary" type="button" title="Swing Trading"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-primary"\ data\-type="investment"\ title="השקעות"\ style="width:\ 32px;\ height:\ 32px;\ padding:\ 0;\ display:\ flex;\ align\-items:\ center;\ justify\-content:\ center;"\ onclick="filterTradePlansByType\('investment'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="filterTradePlansByType(" data-classes="btn btn-sm btn-outline-primary" type="button" title="השקעות"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-primary"\ data\-type="passive"\ title="השקעות\ פאסיביות"\ style="width:\ 32px;\ height:\ 32px;\ padding:\ 0;\ display:\ flex;\ align\-items:\ center;\ justify\-content:\ center;"\ onclick="filterTradePlansByType\('passive'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="filterTradePlansByType(" data-classes="btn btn-sm btn-outline-primary" type="button" title="השקעות פאסיביות"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(0,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(1,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(2,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(3,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(4,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(5,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(6,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(7,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(8,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ onclick="if\ \(typeof\ window\.sortTableData\ ===\ 'function'\)\ \{\ window\.sortTableData\(9,\ window\.trade_plansData\ \|\|\ \[\],\ 'trade_plans',\ window\.updateTradePlansTable\);\ \}"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTableData === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="nav\-link\ active"\ id="add\-basic\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#add\-basic\-pane"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link active" id="add-basic-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="nav\-link"\ id="add\-conditions\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#add\-conditions\-pane"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="add-conditions-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="nav\-link\ active"\ id="edit\-basic\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#edit\-basic\-pane"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link active" id="edit-basic-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="nav\-link"\ id="edit\-conditions\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#edit\-conditions\-pane"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="edit-conditions-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trade_plans.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/db_extradata.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/db_extradata.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/db_extradata.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/db_extradata.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/db_extradata.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/db_extradata.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/db_extradata.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ id="quickRestartBtn"\ title="איתחול\ מהיר\ של\ השרת">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-success" id="quickRestartBtn" title="איתחול מהיר של השרת"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ id="changeModeBtn"\ title="שינוי\ מצב\ מטמון">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-warning" id="changeModeBtn" title="שינוי מצב מטמון"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ id="monitoringAnalysisBtn"\ title="הצג\ ניתוח\ מפורט\ של\ מצב\ הניתור">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-primary" id="monitoringAnalysisBtn" title="הצג ניתוח מפורט של מצב הניתור"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ id="copyDetailedLogBtn"\ title="העתק\ לוג\ מפורט\ עם\ כל\ הנתונים\ והסטטוס">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-secondary" id="copyDetailedLogBtn" title="העתק לוג מפורט עם כל הנתונים והסטטוס"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ כל\ הסקשנים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="filter-toggle-btn" title="הצג/הסתר כל הסקשנים"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-success\ btn\-sm"\ id="startMonitoringBtn">",
            "new": "<button data-button-type="ADD" data-classes="btn btn-success btn-sm" id="startMonitoringBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-warning\ btn\-sm"\ id="pauseMonitoringBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-warning btn-sm" id="pauseMonitoringBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-danger\ btn\-sm"\ id="stopMonitoringBtn">",
            "new": "<button data-button-type="DELETE" data-classes="btn btn-danger btn-sm" id="stopMonitoringBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ id="openSystemManagementBtn"\ title="פתח\ דשבורד\ ניהול\ מערכת">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-info" id="openSystemManagementBtn" title="פתח דשבורד ניהול מערכת"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ id="openAllDashboardsBtn"\ title="פתח\ כל\ הדשבורדים">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-primary" id="openAllDashboardsBtn" title="פתח כל הדשבורדים"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('cursorTasksSection'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-success"\ id="quickStartBtn">",
            "new": "<button data-button-type="ADD" data-classes="btn btn-success" id="quickStartBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-warning"\ id="quickRestartBtn2">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-warning" id="quickRestartBtn2"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-info"\ id="quickStopBtn">",
            "new": "<button data-button-type="LINK" data-classes="btn btn-info" id="quickStopBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-secondary"\ id="quickStatusBtn">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" id="quickStatusBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-outline\-primary"\ id="devModeBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-primary" id="devModeBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-outline\-danger"\ id="noCacheBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-danger" id="noCacheBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-outline\-success"\ id="productionModeBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-success" id="productionModeBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary"\ id="preserveModeBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-secondary" id="preserveModeBtn"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-success\ w\-100\ mb\-3"\ onclick="restartServerAdvanced\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="restartServerAdvanced()" data-classes="btn btn-success w-100 mb-3"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-warning\ w\-100\ mb\-3"\ onclick="stopServer\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="stopServer()" data-classes="btn btn-warning w-100 mb-3"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-secondary\ w\-100\ mb\-3"\ onclick="clearLogs\(\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="clearLogs()" data-classes="btn btn-secondary w-100 mb-3"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section2'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section3'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="checkApiHealth\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="checkApiHealth()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-success"\ onclick="scanNewEndpoints\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="scanNewEndpoints()" data-classes="btn btn-sm btn-success"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-primary"\ onclick="testAllEndpoints\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="testAllEndpoints()" data-classes="btn btn-sm btn-primary"></button>"
        },
        {
            "file": "trading-ui/server-monitor.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section4'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trading_accounts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="editConditionBtn">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="editConditionBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-success"\ id="createAlertFromConditionBtn">",
            "new": "<button data-button-type="ADD" data-classes="btn btn-success" id="createAlertFromConditionBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="saveAlertFromConditionBtn">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="saveAlertFromConditionBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="runTestBtn">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="runTestBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="list\-group\-item\ list\-group\-item\-action"\ id="bulkActivateBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="list-group-item list-group-item-action" id="bulkActivateBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="list\-group\-item\ list\-group\-item\-action"\ id="bulkDeactivateBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="list-group-item list-group-item-action" id="bulkDeactivateBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="list\-group\-item\ list\-group\-item\-action"\ id="bulkDeleteBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="list-group-item list-group-item-action" id="bulkDeleteBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="list\-group\-item\ list\-group\-item\-action"\ id="bulkCreateAlertsBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="list-group-item list-group-item-action" id="bulkCreateAlertsBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="executeBulkOperationBtn"\ disabled>",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="executeBulkOperationBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ class="nav\-link\ active"\ id="export\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#export\-pane"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link active" id="export-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ class="nav\-link"\ id="import\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#import\-pane"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="import-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="exportConditionsBtn">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="exportConditionsBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="importConditionsBtn"\ disabled>",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="importConditionsBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/conditions-modals.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ id="quickRestartSystemBtn"\ title="איתחול\ מהיר\ של\ השרת">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-success" id="quickRestartSystemBtn" title="איתחול מהיר של השרת"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ id="changeModeSystemBtn"\ title="שינוי\ מצב\ מטמון">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-warning" id="changeModeSystemBtn" title="שינוי מצב מטמון"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-info"\ id="openServerMonitorBtn"\ title="פתח\ דשבורד\ ניטור\ שרת">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-info" id="openServerMonitorBtn" title="פתח דשבורד ניטור שרת"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט\ עם\ כל\ הנתונים\ והסטטוס">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט עם כל הנתונים והסטטוס"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="refreshSystemData\(\)"\ title="רענן\ נתוני\ מערכת">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshSystemData()" data-classes="btn btn-sm btn-outline-primary" title="רענן נתוני מערכת"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ כל\ הסקשנים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="filter-toggle-btn" title="הצג/הסתר כל הסקשנים"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-primary\ btn\-sm"\ onclick="refreshSystemData\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshSystemData()" data-classes="btn btn-primary btn-sm"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-success\ btn\-sm"\ onclick="runSystemCheck\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="runSystemCheck()" data-classes="btn btn-success btn-sm"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm"\ onclick="clearCache\(\)">",
            "new": "<button data-button-type="LINK" data-onclick="clearCache()" data-classes="btn btn-info btn-sm"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ id="openAllDashboardsSystemBtn"\ title="פתח\ כל\ הדשבורדים">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-primary" id="openAllDashboardsSystemBtn" title="פתח כל הדשבורדים"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('cursorTasksSystemSection'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-success"\ id="quickStartSystemBtn">",
            "new": "<button data-button-type="ADD" data-classes="btn btn-success" id="quickStartSystemBtn"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-warning"\ id="quickRestartSystemBtn2">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-warning" id="quickRestartSystemBtn2"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-danger"\ id="quickStopSystemBtn">",
            "new": "<button data-button-type="DELETE" data-classes="btn btn-danger" id="quickStopSystemBtn"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-primary"\ id="devModeSystemBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-primary" id="devModeSystemBtn"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-danger"\ id="noCacheSystemBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-danger" id="noCacheSystemBtn"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-success"\ id="productionModeSystemBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-success" id="productionModeSystemBtn"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-info"\ id="openServerMonitorSystemBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-info" id="openServerMonitorSystemBtn"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary"\ id="openExternalDataBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-secondary" id="openExternalDataBtn"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-dark"\ id="openCrudTestingBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-dark" id="openCrudTestingBtn"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section2'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section3'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section4'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section5'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ refresh\-btn"\ title="רענן\ נתונים">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-primary refresh-btn" title="רענן נתונים"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section6'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="runBackup\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="runBackup()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary\ copy\-log\-btn"\ onclick="copyDetailedLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-outline-secondary copy-log-btn"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="restoreFromBackup\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="restoreFromBackup()" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section8'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-primary"\ onclick="showNotificationLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showNotificationLog()" data-classes="btn btn-outline-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-secondary"\ onclick="showSystemLogs\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showSystemLogs()" data-classes="btn btn-outline-secondary" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-danger"\ onclick="showErrorReports\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showErrorReports()" data-classes="btn btn-outline-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-info"\ onclick="showLinterLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showLinterLog()" data-classes="btn btn-outline-info" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-success"\ onclick="showFileMappings\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showFileMappings()" data-classes="btn btn-outline-success" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-info"\ onclick="showExternalDataLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showExternalDataLog()" data-classes="btn btn-outline-info" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-warning"\ onclick="showServerAppLogs\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showServerAppLogs()" data-classes="btn btn-outline-warning" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-danger"\ onclick="showServerErrorLogs\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showServerErrorLogs()" data-classes="btn btn-outline-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-warning"\ onclick="showServerPerformanceLogs\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showServerPerformanceLogs()" data-classes="btn btn-outline-warning" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-info"\ onclick="showServerDatabaseLogs\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showServerDatabaseLogs()" data-classes="btn btn-outline-info" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-success"\ onclick="showBackgroundTasksFileLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showBackgroundTasksFileLog()" data-classes="btn btn-outline-success" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-success"\ onclick="showCacheLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showCacheLog()" data-classes="btn btn-outline-success" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="testAllLogTypes\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="testAllLogTypes()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ onclick="document\.getElementById\('log\-test\-modal'\)\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="document.getElementById(" data-classes="btn-close" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ onclick="document\.getElementById\('log\-test\-modal'\)\.remove\(\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="document.getElementById(" data-classes="btn btn-secondary" type="button"></button>"
        },
        {
            "file": "trading-ui/system-management.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="window\.testAllLogTypes\(\);\ document\.getElementById\('log\-test\-modal'\)\.remove\(\);">",
            "new": "<button data-button-type="SAVE" data-onclick="window.testAllLogTypes(); document.getElementById(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/cash_flows.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/dynamic-colors-display.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט\ עם\ כל\ הנתונים\ והסטטוס">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט עם כל הנתונים והסטטוס"></button>"
        },
        {
            "file": "trading-ui/dynamic-colors-display.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/dynamic-colors-display.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/dynamic-colors-display.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section2'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/dynamic-colors-display.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section3'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/dynamic-colors-display.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section4'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט\ עם\ כל\ הנתונים\ והסטטוס">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט עם כל הנתונים והסטטוס"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ כל\ הסקשנים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="filter-toggle-btn" title="הצג/הסתר כל הסקשנים"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('systemStatus'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ id="start\-scheduler"\ class="btn\ btn\-success\ btn\-sm"\ onclick="startScheduler\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="startScheduler()" data-classes="btn btn-success btn-sm" id="start-scheduler"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ id="stop\-scheduler"\ class="btn\ btn\-danger\ btn\-sm"\ onclick="stopScheduler\(\)">",
            "new": "<button data-button-type="DELETE" data-onclick="stopScheduler()" data-classes="btn btn-danger btn-sm" id="stop-scheduler"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ id="refresh\-status"\ class="btn\ btn\-primary\ btn\-sm"\ onclick="refreshStatus\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshStatus()" data-classes="btn btn-primary btn-sm" id="refresh-status"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('tasksList'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ id="refresh\-tasks"\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="refreshTasks\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshTasks()" data-classes="btn btn-secondary btn-sm" id="refresh-tasks"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('backgroundTasksLog'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/background-tasks.html",
            "old": r"<button\ id="refresh\-background\-tasks\-log"\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="refreshBackgroundTasksLog\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshBackgroundTasksLog()" data-classes="btn btn-secondary btn-sm" id="refresh-background-tasks-log"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/alerts.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט\ של\ כל\ הממשקים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט של כל הממשקים"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="action\-btn"\ onclick="refreshAllData\(\)"\ title="רענן\ את\ כל\ הנתונים">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshAllData()" data-classes="action-btn" title="רענן את כל הנתונים"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="action\-btn"\ onclick="backupData\(\)"\ title="גיבוי\ נתונים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="backupData()" data-classes="action-btn" title="גיבוי נתונים"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="action\-btn"\ onclick="cleanupOldData\(\)"\ title="ניקוי\ נתונים\ ישנים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="cleanupOldData()" data-classes="action-btn" title="ניקוי נתונים ישנים"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ כל\ הסקשנים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="filter-toggle-btn" title="הצג/הסתר כל הסקשנים"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section2'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section3'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section4'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section5'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/page-scripts-matrix.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section6'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-outline\-warning">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-warning"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-link">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-link"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/executions.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleTopSection\(\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleTopSection()" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="runUnitTests\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="runUnitTests()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-success"\ onclick="runIntegrationTests\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="runIntegrationTests()" data-classes="btn btn-success" type="button"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-info"\ onclick="runPerformanceTests\(\)">",
            "new": "<button data-button-type="LINK" data-onclick="runPerformanceTests()" data-classes="btn btn-info" type="button"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-warning"\ onclick="runAllTests\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="runAllTests()" data-classes="btn btn-warning" type="button"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ onclick="resetSystem\(\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="resetSystem()" data-classes="btn btn-secondary" type="button"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט\ עם\ כל\ הנתונים\ והסטטוס">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" type="button" title="העתק לוג מפורט עם כל הנתונים והסטטוס"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ class="btn\-yes\-no\ btn\-yes"\ title="יש\ טריידים">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-yes-no btn-yes" title="יש טריידים"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ class="btn\-yes\-no\ btn\-yes"\ title="יש\ טריידים">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-yes-no btn-yes" title="יש טריידים"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ class="btn\-yes\-no\ btn\-no"\ title="אין\ טריידים">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-yes-no btn-no" title="אין טריידים"></button>"
        },
        {
            "file": "trading-ui/test-header-only.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section2'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ id="addTradeBtn"\ class="btn\ btn\-success"\ onclick="showAddTradeModal\(\)"\ title="הוסף\ טרייד\ חדש">",
            "new": "<button data-button-type="ADD" data-onclick="showAddTradeModal()" data-classes="btn btn-success" id="addTradeBtn" title="הוסף טרייד חדש"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ id="editTradeBtn"\ class="btn\ btn\-secondary\ d\-none"\ onclick="editTradeRecord\(''\)"\ title="ערוך\ טרייד\ נבחר">",
            "new": "<button data-button-type="EDIT" data-onclick="editTradeRecord(" data-classes="btn btn-secondary d-none" id="editTradeBtn" title="ערוך טרייד נבחר"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ id="deleteTradeBtn"\ class="btn\ btn\-danger\ d\-none"\ onclick="deleteTradeRecord\(''\)"\ title="מחק\ טרייד\ נבחר">",
            "new": "<button data-button-type="DELETE" data-onclick="deleteTradeRecord(" data-classes="btn btn-danger d-none" id="deleteTradeBtn" title="מחק טרייד נבחר"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(0\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(1\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(2\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(3\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(4\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(5\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(6\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(7\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(8\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(9\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(10\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-link\ sortable\-header"\ style="border:\ none;\ background:\ none;\ padding:\ 0;\ margin:\ 0;\ width:\ 100%;\ text\-align:\ center;\ color:\ inherit;\ text\-decoration:\ none;"\ onclick="if\ \(typeof\ window\.sortTable\ ===\ 'function'\)\ \{\ window\.sortTable\(11\);\ \}">",
            "new": "<button data-button-type="SORT" data-onclick="if (typeof window.sortTable === " data-classes="btn btn-link sortable-header"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-info">",
            "new": "<button data-button-type="LINK" data-classes="btn btn-info"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-info\ me\-2"\ onclick="addImportantNote\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="addImportantNote()" data-classes="btn btn-info me-2"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="addReminder\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="addReminder()" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/trades.html",
            "old": r"<button\ class="btn\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="copyDetailedLog\(\)"\ title="העתק\ לוג\ מפורט\ עם\ כל\ הנתונים\ והסטטוס">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary" title="העתק לוג מפורט עם כל הנתונים והסטטוס"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('top'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleAllSections\(\)"\ title="הצג/הסתר\ כל\ הסקשנים">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleAllSections()" data-classes="filter-toggle-btn" title="הצג/הסתר כל הסקשנים"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="filter\-toggle\-btn"\ onclick="toggleSection\('section1'\)"\ title="הצג/הסתר\ סקשן">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleSection(" data-classes="filter-toggle-btn" title="הצג/הסתר סקשן"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-primary\ btn\-sm\ mb\-2"\ onclick="runAllBasicTests\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="runAllBasicTests()" data-classes="btn btn-primary btn-sm mb-2"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-success\ btn\-sm\ mb\-2"\ onclick="runAllCRUDTests\(\)">",
            "new": "<button data-button-type="ADD" data-onclick="runAllCRUDTests()" data-classes="btn btn-success btn-sm mb-2"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-warning\ btn\-sm"\ onclick="checkAllConnections\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="checkAllConnections()" data-classes="btn btn-warning btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm\ mb\-2"\ onclick="generateTestReport\(\)">",
            "new": "<button data-button-type="LINK" data-onclick="generateTestReport()" data-classes="btn btn-info btn-sm mb-2"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm\ mb\-2"\ onclick="exportTestResults\(\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="exportTestResults()" data-classes="btn btn-secondary btn-sm mb-2"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary\ mb\-2"\ onclick="copyDetailedLog\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="copyDetailedLog()" data-classes="btn btn-sm btn-outline-secondary mb-2"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-dark\ btn\-sm"\ onclick="resetAllTests\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="resetAllTests()" data-classes="btn btn-dark btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link\ active"\ id="main\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#main"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link active" id="main-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="trades\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#trades"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="trades-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="trading_accounts\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#trading_accounts"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="trading_accounts-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="alerts\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#alerts"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="alerts-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="tickers\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#tickers"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="tickers-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="executions\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#executions"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="executions-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="cash_flows\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#cash_flows"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="cash_flows-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="trade_plans\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#trade_plans"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="trade_plans-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="constraints\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#constraints"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="constraints-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="notes\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#notes"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="notes-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="research\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#research"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="research-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="nav\-link"\ id="preferences\-tab"\ data\-bs\-toggle="tab"\ data\-bs\-target="\#preferences"\ type="button"\ role="tab">",
            "new": "<button data-button-type="UNKNOWN" data-classes="nav-link" id="preferences-tab" type="button"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm"\ onclick="runBasicTest\('index',\ '/'\)">",
            "new": "<button data-button-type="LINK" data-onclick="runBasicTest(" data-classes="btn btn-info btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="markPageComplete\('index'\)">",
            "new": "<button data-button-type="ADD" data-onclick="markPageComplete(" data-classes="btn btn-success"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="markPagePartial\('index'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="markPagePartial(" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm"\ onclick="runBasicTest\('trades',\ '/trades'\)">",
            "new": "<button data-button-type="LINK" data-onclick="runBasicTest(" data-classes="btn btn-info btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="runCRUDTest\('trades',\ '/api/trades/'\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="runCRUDTest(" data-classes="btn btn-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="markPageComplete\('trades'\)">",
            "new": "<button data-button-type="ADD" data-onclick="markPageComplete(" data-classes="btn btn-success"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="markPagePartial\('trades'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="markPagePartial(" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm"\ onclick="runBasicTest\('trading_accounts',\ '/trading_accounts'\)">",
            "new": "<button data-button-type="LINK" data-onclick="runBasicTest(" data-classes="btn btn-info btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="runCRUDTest\('trading_accounts',\ '/api/trading\-accounts/'\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="runCRUDTest(" data-classes="btn btn-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="markPageComplete\('trading_accounts'\)">",
            "new": "<button data-button-type="ADD" data-onclick="markPageComplete(" data-classes="btn btn-success"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="markPagePartial\('trading_accounts'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="markPagePartial(" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm"\ onclick="runBasicTest\('alerts',\ '/alerts'\)">",
            "new": "<button data-button-type="LINK" data-onclick="runBasicTest(" data-classes="btn btn-info btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="runCRUDTest\('alerts',\ '/api/alerts/'\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="runCRUDTest(" data-classes="btn btn-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="markPageComplete\('alerts'\)">",
            "new": "<button data-button-type="ADD" data-onclick="markPageComplete(" data-classes="btn btn-success"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="markPagePartial\('alerts'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="markPagePartial(" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm"\ onclick="runBasicTest\('tickers',\ '/tickers'\)">",
            "new": "<button data-button-type="LINK" data-onclick="runBasicTest(" data-classes="btn btn-info btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="runCRUDTest\('tickers',\ '/api/tickers/'\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="runCRUDTest(" data-classes="btn btn-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="markPageComplete\('tickers'\)">",
            "new": "<button data-button-type="ADD" data-onclick="markPageComplete(" data-classes="btn btn-success"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="markPagePartial\('tickers'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="markPagePartial(" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm"\ onclick="runBasicTest\('executions',\ '/executions'\)">",
            "new": "<button data-button-type="LINK" data-onclick="runBasicTest(" data-classes="btn btn-info btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="runCRUDTest\('executions',\ '/api/executions/'\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="runCRUDTest(" data-classes="btn btn-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="markPageComplete\('executions'\)">",
            "new": "<button data-button-type="ADD" data-onclick="markPageComplete(" data-classes="btn btn-success"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="markPagePartial\('executions'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="markPagePartial(" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm"\ onclick="runBasicTest\('cash_flows',\ '/cash_flows'\)">",
            "new": "<button data-button-type="LINK" data-onclick="runBasicTest(" data-classes="btn btn-info btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="runCRUDTest\('cash_flows',\ '/api/cash_flows/'\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="runCRUDTest(" data-classes="btn btn-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="markPageComplete\('cash_flows'\)">",
            "new": "<button data-button-type="ADD" data-onclick="markPageComplete(" data-classes="btn btn-success"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="markPagePartial\('cash_flows'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="markPagePartial(" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-info\ btn\-sm"\ onclick="runBasicTest\('trade_plans',\ '/trade_plans'\)">",
            "new": "<button data-button-type="LINK" data-onclick="runBasicTest(" data-classes="btn btn-info btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="runCRUDTest\('trade_plans',\ '/api/trade_plans/'\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="runCRUDTest(" data-classes="btn btn-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="markPageComplete\('trade_plans'\)">",
            "new": "<button data-button-type="ADD" data-onclick="markPageComplete(" data-classes="btn btn-success"></button>"
        },
        {
            "file": "trading-ui/crud-testing-dashboard.html",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="markPagePartial\('trade_plans'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="markPagePartial(" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_models.html",
            "old": r"<button\ class="btn\ btn\-primary"\ id="test\-ticker\-model">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="test-ticker-model"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_models.html",
            "old": r"<button\ class="btn\ btn\-primary"\ id="test\-quote\-model">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="test-quote-model"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_models.html",
            "old": r"<button\ class="btn\ btn\-primary"\ id="test\-preferences\-model">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="test-preferences-model"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_models.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary"\ id="validate\-timezone">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-secondary" id="validate-timezone"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_models.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary"\ id="validate\-interval">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-secondary" id="validate-interval"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_models.html",
            "old": r"<button\ class="btn\ btn\-outline\-secondary"\ id="validate\-mode">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-outline-secondary" id="validate-mode"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_models.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary\ float\-start"\ id="clear\-results">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-secondary float-start" id="clear-results"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_external_data.html",
            "old": r"<button\ class="btn\ btn\-primary"\ type="button"\ id="fetch\-single">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="fetch-single" type="button"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_external_data.html",
            "old": r"<button\ class="btn\ btn\-info"\ type="button"\ id="fetch\-batch">",
            "new": "<button data-button-type="LINK" data-classes="btn btn-info" id="fetch-batch" type="button"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_external_data.html",
            "old": r"<button\ class="btn\ btn\-success"\ type="button"\ id="refresh\-all">",
            "new": "<button data-button-type="ADD" data-classes="btn btn-success" id="refresh-all" type="button"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_external_data.html",
            "old": r"<button\ class="btn\ btn\-warning"\ type="button"\ id="check\-providers">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-warning" id="check-providers" type="button"></button>"
        },
        {
            "file": "trading-ui/external_data_integration_client/pages/test_external_data.html",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary\ float\-start"\ id="clear\-log">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-secondary float-start" id="clear-log"></button>"
        },
        {
            "file": "trading-ui/scripts/server-monitor.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/server-monitor.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary"\ onclick="serverMonitor\.executeCacheMode\('\$\{mode\.value\}'\);\ bootstrap\.Modal\.getInstance\(document\.getElementById\('modeSelectorModal'\)\)\.hide\(\);">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="serverMonitor.executeCacheMode(" data-classes="btn btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ class="popup\-close"\ onclick="this\.parentElement\.parentElement\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="this.parentElement.parentElement.remove()" data-classes="popup-close"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ class="btn\ btn\-success\ export\-btn"\ data\-format="csv">",
            "new": "<button data-button-type="ADD" data-classes="btn btn-success export-btn"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ class="btn\ btn\-info\ export\-btn"\ data\-format="json">",
            "new": "<button data-button-type="LINK" data-classes="btn btn-info export-btn"></button>"
        },
        {
            "file": "trading-ui/scripts/notifications-center.js",
            "old": r"<button\ class="btn\ btn\-warning\ export\-btn"\ data\-format="clipboard">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-warning export-btn"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-modal.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-modal.js",
            "old": r"<button\ class="btn\ btn\-outline\-light\ btn\-sm"\ onclick="viewLinkedItemsForTicker\(\$\{entityData\.id\}\)"\ title="פריטים\ מקושרים">",
            "new": "<button data-button-type="EDIT" data-onclick="viewLinkedItemsForTicker(${entityData.id})" data-classes="btn btn-outline-light btn-sm" title="פריטים מקושרים"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-modal.js",
            "old": r"<button\ class="btn\ btn\-outline\-light\ btn\-sm"\ onclick="editTicker\(\$\{entityData\.id\}\)"\ title="ערוך\ טיקר">",
            "new": "<button data-button-type="EDIT" data-onclick="editTicker(${entityData.id})" data-classes="btn btn-outline-light btn-sm" title="ערוך טיקר"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-modal.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-primary"\ onclick="window\.entityDetailsModal\.retry\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.entityDetailsModal.retry()" data-classes="btn btn-outline-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/header-system.js",
            "old": r"<button\ class="filter\-toggle\ type\-filter\-toggle"\ id="typeFilterToggle"\ onclick="toggleTypeFilterMenu\(\)">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleTypeFilterMenu()" data-classes="filter-toggle type-filter-toggle" id="typeFilterToggle"></button>"
        },
        {
            "file": "trading-ui/scripts/header-system.js",
            "old": r"<button\ class="search\-clear\-btn"\ onclick="clearSearchFilter\(\)"\ title="נקה\ חיפוש">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearSearchFilter()" data-classes="search-clear-btn" title="נקה חיפוש"></button>"
        },
        {
            "file": "trading-ui/scripts/header-system.js",
            "old": r"<button\ class="reset\-btn"\ onclick="resetAllFilters\(\)"\ title="איפוס\ פילטרים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="resetAllFilters()" data-classes="reset-btn" title="איפוס פילטרים"></button>"
        },
        {
            "file": "trading-ui/scripts/header-system.js",
            "old": r"<button\ class="clear\-btn"\ onclick="clearAllFilters\(\)"\ title="נקה\ כל\ הפילטרים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearAllFilters()" data-classes="clear-btn" title="נקה כל הפילטרים"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="exportLinkedItemsData\('\$\{itemType\}',\ \$\{itemId\}\)">",
            "new": "<button data-button-type="EDIT" data-onclick="exportLinkedItemsData(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ class="btn\ btn\-outline\-secondary"\ onclick="editItem\('\$\{item\.type\}',\ \$\{item\.id\}\)"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="editItem(" data-classes="btn btn-outline-secondary" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ class="btn\ btn\-outline\-info"\ onclick="openItemPage\('\$\{item\.type\}',\ \$\{item\.id\}\)"\ title="פתח\ דף">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="openItemPage(" data-classes="btn btn-outline-info" title="פתח דף"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ class="btn\ btn\-outline\-danger"\ onclick="deleteItem\('\$\{item\.type\}',\ \$\{item\.id\}\)"\ title="מחק">",
            "new": "<button data-button-type="DELETE" data-onclick="deleteItem(" data-classes="btn btn-outline-danger" title="מחק"></button>"
        },
        {
            "file": "trading-ui/scripts/linked-items.js",
            "old": r"<button\ type="button"\ class="btn\-close\-custom\ btn\-close\-\$\{mode\}"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close-custom btn-close-${mode}" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-light\ p\-0"\ style="width:\ 16px;\ height:\ 16px;\ font\-size:\ 10px;"\ onclick="pageScriptsMatrix\.viewFileDetails\('\$\{script\}'\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.viewFileDetails(" data-classes="btn btn-sm btn-outline-light p-0" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-light\ p\-0"\ style="width:\ 16px;\ height:\ 16px;\ font\-size:\ 10px;"\ onclick="pageScriptsMatrix\.viewFileDetails\('\$\{script\}'\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.viewFileDetails(" data-classes="btn btn-sm btn-outline-light p-0" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-light\ p\-0"\ style="width:\ 16px;\ height:\ 16px;\ font\-size:\ 10px;"\ onclick="pageScriptsMatrix\.viewFileDetails\('\$\{script\}'\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.viewFileDetails(" data-classes="btn btn-sm btn-outline-light p-0" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-light\ p\-0"\ style="width:\ 16px;\ height:\ 16px;\ font\-size:\ 10px;"\ onclick="pageScriptsMatrix\.viewFileDetails\('\$\{script\}'\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.viewFileDetails(" data-classes="btn btn-sm btn-outline-light p-0" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-success\ ms\-2"\ onclick="pageScriptsMatrix\.refreshFilesList\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="pageScriptsMatrix.refreshFilesList()" data-classes="btn btn-sm btn-success ms-2"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.downloadFile\('\$\{filename\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.downloadFile(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="this\.previousElementSibling\.select\(\);\ document\.execCommand\('copy'\);">",
            "new": "<button data-button-type="SAVE" data-onclick="this.previousElementSibling.select(); document.execCommand(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.analyzeDependencies\(\)"\ id="analyzeDepsBtn">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.analyzeDependencies()" data-classes="btn btn-primary" id="analyzeDepsBtn"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-secondary\ ms\-2"\ onclick="pageScriptsMatrix\.viewDependencyGraph\(\)"\ id="viewGraphBtn"\ style="display:\ none;">",
            "new": "<button data-button-type="CANCEL" data-onclick="pageScriptsMatrix.viewDependencyGraph()" data-classes="btn btn-secondary ms-2" id="viewGraphBtn"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="pageScriptsMatrix\.refreshSystemStats\(\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="pageScriptsMatrix.refreshSystemStats()" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.backupData\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.backupData()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-warning"\ onclick="pageScriptsMatrix\.cleanupOldData\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.cleanupOldData()" data-classes="btn btn-warning"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-info"\ onclick="pageScriptsMatrix\.optimizeStorage\(\)">",
            "new": "<button data-button-type="LINK" data-onclick="pageScriptsMatrix.optimizeStorage()" data-classes="btn btn-info"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.renderStorageManagement\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.renderStorageManagement()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-success"\ onclick="pageScriptsMatrix\.runArchitectureCheck\(\)"\ id="archCheckBtn">",
            "new": "<button data-button-type="ADD" data-onclick="pageScriptsMatrix.runArchitectureCheck()" data-classes="btn btn-success" id="archCheckBtn"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-secondary\ ms\-2"\ onclick="pageScriptsMatrix\.viewArchitectureReport\(\)"\ id="viewArchReportBtn"\ style="display:\ none;">",
            "new": "<button data-button-type="CANCEL" data-onclick="pageScriptsMatrix.viewArchitectureReport()" data-classes="btn btn-secondary ms-2" id="viewArchReportBtn"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.syncWithSystems\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.syncWithSystems()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary\ btn\-sm"\ onclick="pageScriptsMatrix\.downloadBackup\('\$\{backupFilename\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.downloadBackup(" data-classes="btn btn-primary btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ btn\-sm\ ms\-2"\ onclick="pageScriptsMatrix\.copyBackupInfo\('\$\{backupFilename\}'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="pageScriptsMatrix.copyBackupInfo(" data-classes="btn btn-outline-primary btn-sm ms-2"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ data\-bs\-dismiss="modal"\ onclick="window\.confirmDialogResult\ =\ 'cancel'">",
            "new": "<button data-button-type="CANCEL" data-onclick="window.confirmDialogResult = " data-classes="btn btn-secondary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-warning"\ data\-bs\-dismiss="modal"\ onclick="window\.confirmDialogResult\ =\ 'cleanup'">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.confirmDialogResult = " data-classes="btn btn-warning" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ data\-bs\-dismiss="modal"\ onclick="window\.confirmDialogResult\ =\ 'backup'">",
            "new": "<button data-button-type="SAVE" data-onclick="window.confirmDialogResult = " data-classes="btn btn-primary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ onclick="document\.getElementById\('logModal'\)\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="document.getElementById(" data-classes="btn-close" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ onclick="document\.getElementById\('logModal'\)\.remove\(\)">",
            "new": "<button data-button-type="CANCEL" data-onclick="document.getElementById(" data-classes="btn btn-secondary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.copyToClipboard\('\$\{logText\.replace\(/'/g,\ "\\\\'"\)\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.copyToClipboard(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-success"\ onclick="pageScriptsMatrix\.downloadLog\('\$\{logText\.replace\(/'/g,\ "\\\\'"\)\}'\)">",
            "new": "<button data-button-type="ADD" data-onclick="pageScriptsMatrix.downloadLog(" data-classes="btn btn-success" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.copyDependencyGraph\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.copyDependencyGraph()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/page-scripts-matrix.js",
            "old": r"<button\ class="btn\ btn\-primary"\ onclick="pageScriptsMatrix\.copyArchitectureReport\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="pageScriptsMatrix.copyArchitectureReport()" data-classes="btn btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/notes.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-primary"\ onclick="loadNotesData\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="loadNotesData()" data-classes="btn btn-sm btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/notes.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-primary"\ onclick="openNoteDetails\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="openNoteDetails()" data-classes="btn btn-sm btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/notes.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-success"\ disabled>",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-success" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/notes.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="clearSelectedFile\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearSelectedFile()" data-classes="btn btn-sm btn-outline-secondary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ class="notification\-close"\ onclick="this\.parentElement\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="this.parentElement.remove()" data-classes="notification-close"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-light"\ id="\$\{modalId\}\-copy\-btn"\ title="העתק\ ללוח">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-light" id="${modalId}-copy-btn" type="button" title="העתק ללוח"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-light"\ id="\$\{modalId\}\-close\-btn"\ title="סגור">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-light" id="${modalId}-close-btn" type="button" title="סגור"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ id="\$\{modalId\}\-footer\-close">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" id="${modalId}-footer-close" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\-close\ btn\-close\-white"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/notification-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="copyToClipboard\('\$\{message\.replace\(/'/g,\ "\\\\'"\)\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="copyToClipboard(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-primary\ btn\-sm"\ onclick="window\.editTicker\(\$\{entityId\}\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.editTicker(${entityId})" data-classes="btn btn-primary btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-secondary\ btn\-sm"\ onclick="window\.entityDetailsModal\.showLinkedItems\('\$\{entityType\}',\ \$\{entityId\}\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.entityDetailsModal.showLinkedItems(" data-classes="btn btn-secondary btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-warning\ btn\-sm"\ onclick="window\.entityDetailsModal\.exportEntity\('\$\{entityType\}',\ \$\{entityId\}\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.entityDetailsModal.exportEntity(" data-classes="btn btn-warning btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ btn\-sm\ mt\-2"\ onclick="window\.showLinkedItemsModal\ \&\&\ window\.showLinkedItemsModal\(\[\],\ 'ticker',\ window\.currentEntityId\ \|\|\ 'null'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], " data-classes="btn btn-outline-primary btn-sm mt-2"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary"\ onclick="window\.showLinkedItemsModal\ \&\&\ window\.showLinkedItemsModal\(\[\],\ 'ticker',\ window\.currentEntityId\ \|\|\ 'null'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], " data-classes="btn btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-renderer.js",
            "old": r"<button\ class="btn\ \$\{buttonSize\}\ \$\{buttonClass\}"\ \$\{onclick\}\ title="\$\{title\}">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn ${buttonSize} ${buttonClass}" title="${title}"></button>"
        },
        {
            "file": "trading-ui/scripts/constraint-manager.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/constraint-manager.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-danger"\ onclick="removeEnumValue\(this\)">",
            "new": "<button data-button-type="DELETE" data-onclick="removeEnumValue(this)" data-classes="btn btn-sm btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/auth.js",
            "old": r"<button\ type="submit"\ class="btn\-login"\ id="loginBtn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-login" id="loginBtn" type="submit"></button>"
        },
        {
            "file": "trading-ui/scripts/auth.js",
            "old": r"<button\ class="btn\ btn\-outline\-danger"\ onclick="logout\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="logout()" data-classes="btn btn-outline-danger"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-info"\ onclick="if\ \(typeof\ window\.showEntityDetails\ ===\ 'function'\)\ \{\ window\.showEntityDetails\('trade_plan',\ \$\{design\.id\}\);\ \}"\ title="קישור">",
            "new": "<button data-button-type="LINK" data-onclick="if (typeof window.showEntityDetails === " data-classes="btn btn-sm btn-info" title="קישור"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-info"\ onclick="if\ \(typeof\ window\.viewLinkedItemsForTradePlan\ ===\ 'function'\)\ \{\ window\.viewLinkedItemsForTradePlan\(\$\{design\.id\}\);\ \}"\ title="קישור">",
            "new": "<button data-button-type="EDIT" data-onclick="if (typeof window.viewLinkedItemsForTradePlan === " data-classes="btn btn-sm btn-info" title="קישור"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-secondary"\ onclick="if\ \(typeof\ window\.openEditTradePlanModal\ ===\ 'function'\)\ \{\ window\.openEditTradePlanModal\(\$\{design\.id\}\);\ \}"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="if (typeof window.openEditTradePlanModal === " data-classes="btn btn-sm btn-secondary" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-warning"\ onclick="if\ \(typeof\ window\.cancelTradePlan\ ===\ 'function'\)\ \{\ window\.cancelTradePlan\(\$\{design\.id\}\);\ \}"\ title="בטל">",
            "new": "<button data-button-type="CANCEL" data-onclick="if (typeof window.cancelTradePlan === " data-classes="btn btn-sm btn-warning" title="בטל"></button>"
        },
        {
            "file": "trading-ui/scripts/trade_plans.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-danger"\ onclick="if\ \(typeof\ window\.openDeleteTradePlanModal\ ===\ 'function'\)\ \{\ window\.openDeleteTradePlanModal\(\$\{design\.id\}\);\ \}"\ title="מחק">",
            "new": "<button data-button-type="DELETE" data-onclick="if (typeof window.openDeleteTradePlanModal === " data-classes="btn btn-sm btn-danger" title="מחק"></button>"
        },
        {
            "file": "trading-ui/scripts/executions.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary\ ms\-2"\ onclick="goToTrade\(\$\{trade\.id\}\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="goToTrade(${trade.id})" data-classes="btn btn-sm btn-outline-primary ms-2"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-manager.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ onclick="window\.cacheEmptyDialogChoice\ =\ 'no';\ document\.getElementById\('cache\-empty\-dialog'\)\.remove\(\);">",
            "new": "<button data-button-type="CANCEL" data-onclick="window.cacheEmptyDialogChoice = " data-classes="btn btn-secondary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-manager.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="window\.cacheEmptyDialogChoice\ =\ 'yes';\ document\.getElementById\('cache\-empty\-dialog'\)\.remove\(\);\ window\.UnifiedLogManager\.triggerAutomaticDataRefresh\(\);">",
            "new": "<button data-button-type="SAVE" data-onclick="window.cacheEmptyDialogChoice = " data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ onclick="window\.close\(\)">",
            "new": "<button data-button-type="CLOSE" data-onclick="window.close()"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="editCssFile\('\$\{filename\}'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="editCssFile(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-danger"\ onclick="confirmDeleteCssFile\('\$\{filename\}'\)">",
            "new": "<button data-button-type="DELETE" data-onclick="confirmDeleteCssFile(" data-classes="btn btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ btn\-sm"\ onclick="viewCssFile\('\$\{result\.file\}'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="viewCssFile(" data-classes="btn btn-outline-primary btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-success\ btn\-sm"\ onclick="editCssFile\('\$\{result\.file\}'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="editCssFile(" data-classes="btn btn-outline-success btn-sm"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="clearSearchResults\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearSearchResults()" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-danger"\ onclick="executeUnusedCssRemoval\(\)">",
            "new": "<button data-button-type="DELETE" data-onclick="executeUnusedCssRemoval()" data-classes="btn btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary\ ms\-2"\ onclick="resetAllDuplicates\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="resetAllDuplicates()" data-classes="btn btn-sm btn-outline-secondary ms-2"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="showSpecificDuplicateCleanupModal\('\$\{duplicate\.selector\}',\ \{files:\ \[\$\{duplicate\.files\.map\(f\ =>",
            "new": "<button data-button-type="UNKNOWN" data-onclick="showSpecificDuplicateCleanupModal(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="removeSpecificDuplicate\('\$\{duplicate\.selector\}'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="removeSpecificDuplicate(" data-classes="btn btn-sm btn-outline-danger"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="clearDuplicateResults\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearDuplicateResults()" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="proceedWithBackup\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="proceedWithBackup()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="executeDuplicateCleanup\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="executeDuplicateCleanup()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="executeSpecificDuplicateCleanup\('\$\{selector\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="executeSpecificDuplicateCleanup(" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-danger"\ onclick="executeDeleteFromFile\('\$\{selector\}'\)">",
            "new": "<button data-button-type="DELETE" data-onclick="executeDeleteFromFile(" data-classes="btn btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="clearComplianceResults\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="clearComplianceResults()" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="createNewCssFileFromModal\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="createNewCssFileFromModal()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary\ btn\-sm"\ onclick="viewCssFile\('\$\{file\.path\}'\)"\ title="צפה\ בקובץ">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="viewCssFile(" data-classes="btn btn-outline-primary btn-sm" title="צפה בקובץ"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-warning\ btn\-sm"\ onclick="editCssFile\('\$\{file\.path\}'\)"\ title="ערוך\ קובץ">",
            "new": "<button data-button-type="EDIT" data-onclick="editCssFile(" data-classes="btn btn-outline-warning btn-sm" title="ערוך קובץ"></button>"
        },
        {
            "file": "trading-ui/scripts/css-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-danger\ btn\-sm"\ onclick="confirmDeleteCssFile\('\$\{file\.path\}'\)"\ title="מחק\ קובץ">",
            "new": "<button data-button-type="DELETE" data-onclick="confirmDeleteCssFile(" data-classes="btn btn-outline-danger btn-sm" title="מחק קובץ"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-primary"\ onclick="window\.viewConstraint\('\$\{constraint\.constraint_name\}'\)"\ title="צפה\ בפרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.viewConstraint(" data-classes="btn btn-outline-primary" type="button" title="צפה בפרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-success"\ onclick="window\.validateConstraint\('\$\{constraint\.constraint_name\}'\)"\ title="בדוק\ אילוץ">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.validateConstraint(" data-classes="btn btn-outline-success" type="button" title="בדוק אילוץ"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-info"\ onclick="window\.editConstraint\('\$\{constraint\.constraint_name\}'\)"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="window.editConstraint(" data-classes="btn btn-outline-info" type="button" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-outline\-warning"\ onclick="window\.toggleConstraint\('\$\{constraint\.constraint_name\}'\)"\ title="\$\{constraint\.is_active\ \?\ 'השבת'\ :\ 'הפעל'\}">",
            "new": "<button data-button-type="TOGGLE" data-onclick="window.toggleConstraint(" data-classes="btn btn-outline-warning" type="button" title="${constraint.is_active ? "></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="alert">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="alert"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="window\.editConstraint\('\$\{constraint\.constraint_name\}'\)"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="EDIT" data-onclick="window.editConstraint(" data-classes="btn btn-primary" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/constraints.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="exportValidationReport\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="exportValidationReport()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/warning-system.js",
            "old": r"<button\ type="button"\ class="btn\-close\ btn\-close\-white"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/warning-system.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-\$\{color\}\ confirm\-btn">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-${color} confirm-btn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/preferences-admin.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="window\.editAdminPreference\('\$\{pref\.name\}'\)">",
            "new": "<button data-button-type="EDIT" data-onclick="window.editAdminPreference(" data-classes="btn btn-sm btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/preferences-admin.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="window\.resetAdminPreference\('\$\{pref\.name\}'\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="window.resetAdminPreference(" data-classes="btn btn-sm btn-outline-danger"></button>"
        },
        {
            "file": "trading-ui/scripts/preferences-admin.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="\$\{detailsFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="פרטים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="${detailsFunction}(" data-classes="btn btn-sm btn-outline-success" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-success"\ onclick="\$\{linkedFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="אובייקטים\ מקושרים">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="${linkedFunction}(" data-classes="btn btn-sm btn-outline-success" title="אובייקטים מקושרים"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-warning"\ onclick="\$\{editFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="${editFunction}(" data-classes="btn btn-sm btn-outline-warning" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ \$\{buttonClass\}"\ onclick="\$\{buttonFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="\$\{buttonTitle\}">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="${buttonFunction}(" data-classes="btn btn-sm ${buttonClass}" title="${buttonTitle}"></button>"
        },
        {
            "file": "trading-ui/scripts/ui-utils.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="\$\{deleteFunction\}\('\$\{entityType\}',\ \$\{entityId\}\)"\ title="מחק"\ style="font\-size:\ 0\.8em;">",
            "new": "<button data-button-type="DELETE" data-onclick="${deleteFunction}(" data-classes="btn btn-sm btn-outline-danger" title="מחק"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-realtime-monitor.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-realtime-monitor.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="exportSuggestions\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="exportSuggestions()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-realtime-monitor.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-realtime-monitor.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-danger"\ onclick="exportCriticalErrors\(\)">",
            "new": "<button data-button-type="DELETE" data-onclick="exportCriticalErrors()" data-classes="btn btn-danger" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/linter-export-system.js",
            "old": r"<button\ onclick="restoreVersionSnapshot\('\$\{version\.id\}'\)"\ class="btn\ btn\-sm\ btn\-primary">",
            "new": "<button data-button-type="SAVE" data-onclick="restoreVersionSnapshot(" data-classes="btn btn-sm btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/db_display.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary"\ onclick="editRecord\('\$\{tableType\}',\ \$\{recordId\}\)"\ title="ערוך">",
            "new": "<button data-button-type="EDIT" data-onclick="editRecord(" data-classes="btn btn-sm btn-outline-primary" title="ערוך"></button>"
        },
        {
            "file": "trading-ui/scripts/db_display.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-danger"\ onclick="deleteRecord\('\$\{tableType\}',\ \$\{recordId\}\)"\ title="מחק">",
            "new": "<button data-button-type="DELETE" data-onclick="deleteRecord(" data-classes="btn btn-sm btn-outline-danger" title="מחק"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ log\-refresh\-btn"\ title="רענון">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon log-refresh-btn" title="רענון"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ log\-export\-btn"\ title="ייצוא">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon log-export-btn" title="ייצוא"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ log\-config\-btn"\ title="הגדרות">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon log-config-btn" title="הגדרות"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ filter\-apply"\ title="החל\ סינון">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon filter-apply" title="החל סינון"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-icon\ filter\-clear"\ title="נקה">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-icon filter-clear" title="נקה"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-action\ btn\-primary\ view\-details\-btn"\ title="פרטים">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-action btn-primary view-details-btn" title="פרטים"></button>"
        },
        {
            "file": "trading-ui/scripts/unified-log-display.js",
            "old": r"<button\ class="btn\ btn\-action\ btn\-secondary\ copy\-btn"\ title="העתקה">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-action btn-secondary copy-btn" title="העתקה"></button>"
        },
        {
            "file": "trading-ui/scripts/chart-management.js",
            "old": r"<button\ class="action\-btn\ small"\ onclick="refreshChart\(\$\{index\}\)">",
            "new": "<button data-button-type="REFRESH" data-onclick="refreshChart(${index})" data-classes="action-btn small"></button>"
        },
        {
            "file": "trading-ui/scripts/chart-management.js",
            "old": r"<button\ class="action\-btn\ small"\ onclick="exportChart\(\$\{index\}\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="exportChart(${index})" data-classes="action-btn small"></button>"
        },
        {
            "file": "trading-ui/scripts/chart-management.js",
            "old": r"<button\ class="action\-btn\ small\ danger"\ onclick="destroyChart\(\$\{index\}\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="destroyChart(${index})" data-classes="action-btn small danger"></button>"
        },
        {
            "file": "trading-ui/scripts/background-tasks.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-success"\ onclick="executeTask\('\$\{task\.name\}'\)"\ \$\{!task\.enabled\ \?\ 'disabled'\ :\ ''\}\ title="הפעל\ משימה">",
            "new": "<button data-button-type="ADD" data-onclick="executeTask(" data-classes="btn btn-sm btn-success" title="הפעל משימה"></button>"
        },
        {
            "file": "trading-ui/scripts/background-tasks.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-warning"\ onclick="toggleTask\('\$\{task\.name\}'\)"\ title="\$\{task\.enabled\ \?\ 'כבה\ משימה'\ :\ 'הפעל\ משימה'\}">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleTask(" data-classes="btn btn-sm btn-warning" title="${task.enabled ? "></button>"
        },
        {
            "file": "trading-ui/scripts/background-tasks.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-danger"\ onclick="stopTask\('\$\{task\.name\}'\)"\ \$\{!task\.enabled\ \?\ 'disabled'\ :\ ''\}\ title="עצור\ משימה">",
            "new": "<button data-button-type="DELETE" data-onclick="stopTask(" data-classes="btn btn-sm btn-danger" title="עצור משימה"></button>"
        },
        {
            "file": "trading-ui/scripts/background-tasks.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-primary"\ onclick="showTaskDetails\('\$\{task\.name\}'\)"\ title="פרטי\ משימה">",
            "new": "<button data-button-type="SAVE" data-onclick="showTaskDetails(" data-classes="btn btn-sm btn-primary" title="פרטי משימה"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="viewTickerDetails\('\$\{trade\.ticker_id\}'\)"\ title="פרטי\ טיקר"\ style="padding:\ 2px\ 6px;\ font\-size:\ 12px;">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="viewTickerDetails(" data-classes="btn btn-sm btn-outline-secondary" title="פרטי טיקר"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-info"\ onclick="viewLinkedItemsForTrade\(\$\{trade\.id\}\)"\ title="הצג\ פריטים\ מקושרים">",
            "new": "<button data-button-type="EDIT" data-onclick="viewLinkedItemsForTrade(${trade.id})" data-classes="btn btn-sm btn-info" title="הצג פריטים מקושרים"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-secondary"\ onclick="editTradeRecord\('\$\{trade\.id\}'\)"\ title="ערוך\ טרייד">",
            "new": "<button data-button-type="EDIT" data-onclick="editTradeRecord(" data-classes="btn btn-sm btn-secondary" title="ערוך טרייד"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-warning"\ onclick="window\.cancelTrade\(\$\{trade\.id\}\)"\ title="בטל\ טרייד">",
            "new": "<button data-button-type="CANCEL" data-onclick="window.cancelTrade(${trade.id})" data-classes="btn btn-sm btn-warning" title="בטל טרייד"></button>"
        },
        {
            "file": "trading-ui/scripts/trades.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-danger"\ onclick="deleteTradeRecord\('\$\{trade\.id\}'\)"\ title="מחק\ טרייד">",
            "new": "<button data-button-type="DELETE" data-onclick="deleteTradeRecord(" data-classes="btn btn-sm btn-danger" title="מחק טרייד"></button>"
        },
        {
            "file": "trading-ui/scripts/trading_accounts.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal"\ aria\-label="Close">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>"
        },
        {
            "file": "trading-ui/scripts/external-data-dashboard.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-primary"\ onclick="testProvider\('\$\{provider\.id\}'\)">",
            "new": "<button data-button-type="SAVE" data-onclick="testProvider(" data-classes="btn btn-sm btn-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/external-data-dashboard.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-secondary"\ onclick="toggleProvider\('\$\{provider\.id\}'\)">",
            "new": "<button data-button-type="TOGGLE" data-onclick="toggleProvider(" data-classes="btn btn-sm btn-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-primary\ me\-2"\ onclick="SystemManagement\.copyCheckResultsToClipboard\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="SystemManagement.copyCheckResultsToClipboard()" data-classes="btn btn-sm btn-outline-primary me-2"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ class="btn\ btn\-sm\ btn\-outline\-secondary"\ onclick="document\.getElementById\('system\-check\-results'\)\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="document.getElementById(" data-classes="btn btn-sm btn-outline-secondary"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ onclick="SystemManagement\.copyCheckResultsToClipboard\(\)">",
            "new": "<button data-button-type="SAVE" data-onclick="SystemManagement.copyCheckResultsToClipboard()" data-classes="btn btn-primary" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ type="button"\ class="btn\-close\ ms\-auto"\ onclick="this\.parentElement\.parentElement\.remove\(\)">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="this.parentElement.parentElement.remove()" data-classes="btn-close ms-auto" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal"></button>"
        },
        {
            "file": "trading-ui/scripts/system-management.js",
            "old": r"<button\ class="btn\ btn\-outline\-primary"\ onclick="SystemManagement\.executeCacheMode\('\$\{mode\.value\}'\);\ bootstrap\.Modal\.getInstance\(document\.getElementById\('modeSelectorSystemModal'\)\)\.hide\(\);">",
            "new": "<button data-button-type="UNKNOWN" data-onclick="SystemManagement.executeCacheMode(" data-classes="btn btn-outline-primary"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="saveConditionsBtn">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="saveConditionsBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ id="testConditionsBtn">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" id="testConditionsBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-primary"\ id="addConditionBtn">",
            "new": "<button data-button-type="SAVE" data-classes="btn btn-primary" id="addConditionBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-secondary"\ id="cancelParameterBtn">",
            "new": "<button data-button-type="CANCEL" data-classes="btn btn-secondary" id="cancelParameterBtn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-primary\ edit\-condition\-btn"\ data\-index="\$\{index\}">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-primary edit-condition-btn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/conditions/condition-builder.js",
            "old": r"<button\ type="button"\ class="btn\ btn\-sm\ btn\-outline\-danger\ delete\-condition\-btn"\ data\-index="\$\{index\}">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn btn-sm btn-outline-danger delete-condition-btn" type="button"></button>"
        },
        {
            "file": "trading-ui/scripts/entity-details-system/entity-details-system.js",
            "old": r"<button\ type="button"\ class="btn\-close"\ data\-bs\-dismiss="modal"\ aria\-label="סגור">",
            "new": "<button data-button-type="UNKNOWN" data-classes="btn-close" type="button" data-bs-dismiss="modal" aria-label="סגור"></button>"
        },
    ]
    
    # ביצוע המרות
    converted_files = set()
    for conversion in conversions:
        file_path = conversion['file']
        if file_path not in converted_files:
            if convert_file(file_path, [conversion]):
                converted_files.add(file_path)
    
    print(f"\n✅ הושלם! {len(converted_files)} קבצים עודכנו")

if __name__ == "__main__":
    main()
