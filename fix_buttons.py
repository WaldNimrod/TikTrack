#!/usr/bin/env python3
import os
import re
import glob

def fix_buttons_in_file(file_path):
    """Fix button template literals in HTML files"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix createCopyButton
    content = re.sub(
        r'\$\{window\.createCopyButton[^}]*\}',
        '<button class="btn btn-sm btn-outline-secondary" onclick="copyDetailedLog()" title="העתק לוג מפורט"><i class="fas fa-copy"></i> העתק לוג מפורט</button>',
        content
    )
    
    # Fix createToggleButton
    content = re.sub(
        r'\$\{window\.createToggleButton[^}]*\}',
        '<button class="filter-toggle-btn" onclick="toggleSection(\'top\')" title="הצג/הסתר"><span class="filter-icon">▲</span></button>',
        content
    )
    
    # Fix createAddButton
    content = re.sub(
        r'\$\{window\.createAddButton[^}]*\}',
        '<button class="refresh-btn" onclick="showAddModal()" title="הוסף"><img src="images/icons/add.svg" alt="הוסף" class="action-icon"> הוסף</button>',
        content
    )
    
    # Fix createCloseButton
    content = re.sub(
        r'\$\{window\.createCloseButton[^}]*\}',
        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
        content
    )
    
    # Fix createFormCancelButton
    content = re.sub(
        r'\$\{window\.createFormCancelButton[^}]*\}',
        '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>',
        content
    )
    
    # Fix createSaveButton
    content = re.sub(
        r'\$\{window\.createSaveButton[^}]*\}',
        '<button type="button" class="btn btn-success" onclick="saveForm()">שמור</button>',
        content
    )
    
    # Fix createEditButton
    content = re.sub(
        r'\$\{window\.createEditButton[^}]*\}',
        '<button class="refresh-btn" onclick="editRecord()" title="ערוך"><img src="images/icons/edit.svg" alt="ערוך" class="action-icon"> ערוך</button>',
        content
    )
    
    # Fix createDeleteButton
    content = re.sub(
        r'\$\{window\.createDeleteButton[^}]*\}',
        '<button class="refresh-btn" onclick="deleteRecord()" title="מחק"><img src="images/icons/delete.svg" alt="מחק" class="action-icon"> מחק</button>',
        content
    )
    
    # Fix createLinkButton
    content = re.sub(
        r'\$\{window\.createLinkButton[^}]*\}',
        '<button type="button" class="btn btn-outline-primary btn-sm" onclick="openLinkedItems()" title="פריטים מקושרים"><i class="fas fa-link"></i></button>',
        content
    )
    
    # Fix createNoteButton
    content = re.sub(
        r'\$\{window\.createNoteButton[^}]*\}',
        '<button type="button" class="btn btn-outline-info btn-sm" onclick="addNote()" title="הוסף הערה"><i class="fas fa-sticky-note"></i></button>',
        content
    )
    
    # Fix createReminderButton
    content = re.sub(
        r'\$\{window\.createReminderButton[^}]*\}',
        '<button type="button" class="btn btn-outline-warning btn-sm" onclick="addReminder()" title="הוסף תזכורת"><i class="fas fa-bell"></i></button>',
        content
    )
    
    # Fix createFilterButton
    content = re.sub(
        r'\$\{window\.createFilterButton[^}]*\}',
        '<button class="btn btn-sm btn-outline-primary" onclick="filterItems()" title="פילטר"><i class="fas fa-filter"></i></button>',
        content
    )
    
    # Fix createFilterAllButton
    content = re.sub(
        r'\$\{window\.createFilterAllButton[^}]*\}',
        '<button class="btn btn-sm active" onclick="filterAll()" title="הכל">הכל</button>',
        content
    )
    
    # Fix createRefreshButton
    content = re.sub(
        r'\$\{window\.createRefreshButton[^}]*\}',
        '<button class="refresh-btn" onclick="refreshData()" title="רענן"><span class="action-icon">🔄</span> רענן</button>',
        content
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed buttons in {file_path}")

def main():
    # Get all HTML files in trading-ui directory
    html_files = glob.glob('trading-ui/*.html')
    
    for file_path in html_files:
        if os.path.basename(file_path) not in ['index.html', 'trades.html', 'alerts.html']:  # Skip already fixed
            fix_buttons_in_file(file_path)
    
    print("All button fixes completed!")

if __name__ == "__main__":
    main()

