# Evidence: עורך טקסט עשיר — איחוד וכללים
**project_domain:** TIKTRACK
**Session:** SESSION_01 | **Date:** 2026-01-31

## דרישות
1. **טולטיפ לכפתורים** — חובה בממשק
2. **סקואופ מדויק** — קוד אחד לכל המערכת (Notes, CashFlows, וכו')
3. **גובה שדה** — לפחות 5 שורות מקוריות

## יישום

### 1. Phoenix Rich Text Toolbar Config (SSOT)
| File | Change |
|------|--------|
| `ui/src/components/shared/phoenixRichTextToolbarConfig.js` | **נוצר** — PHOENIX_RT_TOOLBAR_BUTTONS, getPhoenixRichTextToolbarHTML() |

**סקואופ מאושר (SOP-012):**
- מודגש, נטוי, קו תחתון
- הצלחה, אזהרה, סכנה, הדגשה (phx-rt--*)
- רשימה, רשימה ממוספרת

**כל כפתור:** title (טולטיפ) + aria-label

### 2. טופסי הערות ותזרימים
| File | Change |
|------|--------|
| `notesForm.js` | שימוש ב־getPhoenixRichTextToolbarHTML + phoenix-rt-editor-wrapper |
| `cashFlowsForm.js` | החלפת toolbar inline ב־getPhoenixRichTextToolbarHTML |

### 3. גובה שדה
| File | Change |
|------|--------|
| `phoenix-components.css` | .phoenix-rt-editor-wrapper min-height: 8.5em |
| | .ProseMirror min-height: 7.5em (5 שורות) |
