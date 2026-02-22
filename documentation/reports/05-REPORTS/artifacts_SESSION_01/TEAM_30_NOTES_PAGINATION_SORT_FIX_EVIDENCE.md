# Evidence: Notes Pagination & Sort Fix
**project_domain:** TIKTRACK
**Session:** SESSION_01 | **Date:** 2026-01-31

## Problem
- טבלת הערות מציגה 2 רשומות אך הספירת עמודים מציגה "מציג 0-0 מתוך 0 רשומות"
- חוסר אובייקט קבוע ל־pagination/sort — כל טבלה מיישמת קוד שונה
- PhoenixTableSortManager לא מפעיל אירוע `phoenix-table-sorted` לטבלאות data-driven

## Solution Implemented

### 1. PhoenixTablePagination (אובייקט קבוע חדש)
| File | Change |
|------|--------|
| `ui/src/cubes/shared/PhoenixTablePagination.js` | **נוצר** — SSOT ל־pagination: `computeState()`, `formatInfoText()`, `extractTableData()` |
| `ui/scripts/page-manifest.json` | הוספת טעינת PhoenixTablePagination לעמוד notes |
| `notes.html` | נוצר מחדש (generate-pages) — כולל PhoenixTablePagination |

### 2. Notes Table Init
| File | Change |
|------|--------|
| `notesTableInit.js` | `updatePagination()` משתמש ב־PhoenixTablePagination.computeState + formatInfoText |
| `notesTableInit.js` | `renderTable()` — חילוץ `notes?.data ?? notes?.notes ?? notes?.results ?? notes?.items` + defensive total |
| `notesTableInit.js` | initSortManager — מאזין ל־phoenix-table-sorted, מנרמל sortDir ל־lowercase |
| `notesDataLoader.js` | `fetchNotes()` — `response?.data ?? response?.notes ?? response?.results ?? response?.items` + Math.max(total, data.length) |

### 3. PhoenixTableSortManager
| File | Change |
|------|--------|
| `PhoenixTableSortManager.js` | **הפעלת אירוע** `phoenix-table-sorted` בסוף handleSort — detail: sortKey, sortDirection, sortDir, sortType, sortState |

## Verification
- [x] Pagination תצוגה: `Math.max(total, data.length)` — לעולם לא 0 כשיש רשומות
- [x] אובייקט קבוע: PhoenixTablePagination — כל טבלה יכולה להשתמש
- [x] אירוע sort: PhoenixTableSortManager מפעיל phoenix-table-sorted
- [x] generate-pages הורץ — notes.html מעודכן

## Files Modified
- `ui/src/cubes/shared/PhoenixTablePagination.js` (new)
- `ui/src/cubes/shared/PhoenixTableSortManager.js` (event dispatch)
- `ui/src/views/data/notes/notesTableInit.js`
- `ui/src/views/data/notes/notesDataLoader.js`
- `ui/scripts/page-manifest.json`
- `ui/src/views/data/notes/notes.html` (regenerated)
