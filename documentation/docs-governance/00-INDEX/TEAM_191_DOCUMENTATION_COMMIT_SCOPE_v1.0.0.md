---
id: TEAM_191_DOCUMENTATION_COMMIT_SCOPE_v1.0.0
type: OPERATIONAL_RULE
from: Team 191 (Git Governance Operations)
date: 2026-03-29
status: ACTIVE
---

# Team 191 — היקף קומיט: `documentation/` מלא מול `_COMMUNICATION/`

## כלל קבוע (non-negotiable לסבבי Team 191)

| אזור | מדיניות |
|------|---------|
| **`documentation/`** | בקומיט שמטרתו **תיעוד**: לכלול את **כל** עץ `documentation/` (כולל `docs-governance/`, `docs-system/`, `docs-agents-os/`, `reports/` וכו') — לפי מה שקיים ב-working tree, **ללא** `git add -A` בשורש הריפו. לפני קומיט: להסיר זבל (למשל קבצי scratch בשם `Untitled`). |
| **`_COMMUNICATION/`** | **לא** נכנס לקומיט האצווה של תיעוד — תיקיות תקשורת מנוהלות בנפרד (מנדטים, הודעות צוותים, promotion לפי Gateway / בעלים). אין bulk-commit של `_COMMUNICATION/` כחלק מסבב "תיעוד מלא". |

## הערות

- שינויים ב־`00_MASTER_INDEX.md` או `AGENTS.md` (שורש הריפו) אינם תחת `documentation/`; נכללים רק כשמנדט מפורש או כקומיט נפרד.
- סמכות קנונית לתוכן ב־`documentation/docs-governance/` נשארת לפי חלוקת Team 170 / Team 70; Team 191 מבצע **פעולת קבצים** בלבד.

**log_entry | TEAM_191 | DOCUMENTATION_COMMIT_SCOPE | PUBLISHED | 2026-03-29**

historical_record: true
