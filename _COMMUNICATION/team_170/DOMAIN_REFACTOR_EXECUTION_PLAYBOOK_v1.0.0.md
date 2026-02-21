# Domain Refactor — Execution Playbook v1.0.0

**id:** TEAM_170_DOMAIN_REFACTOR_EXECUTION_PLAYBOOK_v1.0.0  
**from:** Team 170  
**re:** TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0  
**date:** 2026-02-21  
**project_domain:** AGENTS_OS  
**purpose:** סדר עבודה ממוקד ויעיל — סריקה אחת, החלטות באצווה, ביצוע לפי שלבים עם נקודות בדיקה.

---

## 1) מקור הדרישה והסקופ

| פריט | מקור |
|------|------|
| **דרישה מקורית** | Team 100 (Development Architecture Lead) — TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0 |
| **קישור למסמך** | `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0.md` |
| **סקופ יישום** | TEAM_170_DOMAIN_REFACTOR_SCOPING_v1.0.0 — צמצום: legacy/ארכיון לא עורכים; עדכון מלא רק ל־in-scope (תוכניות פעילות, קנון, שלבים לא סגורים). |

---

## 2) סדר עבודה ממוקד (ללא כפילות)

### שלב A — הכנה (פעם אחת)

| # | פעולה | תוצר |
|---|--------|------|
| A1 | יצירת מבנה `agents_os/` + 7 תת־תיקיות | ✅ בוצע |
| A2 | יצירת `_COMMUNICATION/99-ARCHIVE/` + README | ✅ בוצע |
| A3 | רשימת קבצי in-scope קבועה: קבצי S001-P001-WP001 (מרשימת WORK_PACKAGE_DEFINITION + MASTER_TASK_LIST), קנון (SSM, Gate protocol, Bible, TT2, Gateway, Master List, רג'יסטרים, תבניות), קבצי GATE נוכחי | קובץ DOMAIN_REFACTOR_IN_SCOPE_LIST_v1.0.0.md |

### שלב B — סריקה וסיווג (פעם אחת)

| # | פעולה | תוצר |
|---|--------|------|
| B1 | סריקת repo: כל .md שמזכירים Agent_OS, Agents_OS, Governance runtime | רשימת נתיבים |
| B2 | לכל קובץ: האם בתוך in-scope? (active WP / canonical / stage not closed) → כן = IN_SCOPE, לא = LEGACY_OR_ARCHIVE | מטריצת סיווג (path \| TIKTRACK/AGENTS_OS/SHARED \| IN_SCOPE/LEGACY/ARCHIVE) |
| B3 | החלטה באצווה: קבצי LEGACY — ארכיון (העברה ל־99-ARCHIVE) **או** הוספת שורת legacy אחת בלבד (ללא עריכת תוכן) | רשימת פעולות |

### שלב C — ביצוע לפי סדר (מסודר)

| # | פעולה | בדיקה |
|---|--------|--------|
| C1 | ארכיון: העברת קבצים שנבחרו ל־99-ARCHIVE; תיעוד ב־REFACTOR_LOG או בדוח | אין קבצים נמחקו בלי מיקום ארכיון |
| C2 | Legacy: הוספת שורת `project_domain: … — legacy; no structural edit per domain refactor directive.` רק לקבצים שנבחרו ל־legacy (אם לא הועברו) | מינימלי; לא עריכת תוכן |
| C3 | In-scope: הוספת `project_domain: TIKTRACK \| AGENTS_OS \| SHARED` + תיקון נתיבים (_COMMUNICATION/_ARCHITECT_INBOX) רק לרשימת IN_SCOPE | כל קבצי ה־WP הפעיל + קנון מעודכנים |
| C4 | איחוד inbox: וידוא שכל האזכורים ל־_ARCHITECTURAL_INBOX מוחלפים ב־_COMMUNICATION/_ARCHITECT_INBOX (בקבצי in-scope); אם קיים תוכן פיזי תחת root inbox — העברה | נתיב קנוני בלבד |
| C5 | העברת ארטיפקטים AGENTS_OS: MOVE (לא copy) ל־agents_os/ עם provenance (MOVED_FROM בכותרת או REFACTOR_LOG) | אין כפילות; provenance קיים |

### שלב D — דוח והגשה

| # | פעולה | תוצר |
|---|--------|------|
| D1 | כתיבת DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md — מיפוי מבנה, סיווג, evidence-by-path, ארכיון/legacy/in-scope | דוח סופי |
| D2 | הגשת בקשת ולידציה ל־Team 190 — כולל סקופ, דרישה מקורית, קישור למסמך Team 100 | TEAM_170_TO_TEAM_190_DOMAIN_REFACTOR_VALIDATION_REQUEST_v1.0.0.md |

---

## 3) כללי דיוק

- **סריקה אחת** — תוצאות נשמרות במטריצה; לא לסרוק מחדש בכל שלב.
- **החלטות באצווה** — סיווג IN_SCOPE vs LEGACY/ARCHIVE פעם אחת; ביצוע לפי הרשימות.
- **עדכון רק in-scope** — לא לערוך קבצי legacy/ארכיון מעבר לשורת legacy או העברה.
- **Provenance** — כל העברה: MOVED_FROM או רשומה ב־REFACTOR_LOG/דוח.

---

## 4) קישורים

- **דרישת Team 100:** `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0.md`
- **סקופינג:** `_COMMUNICATION/team_170/TEAM_170_DOMAIN_REFACTOR_SCOPING_v1.0.0.md`
- **קליטה:** `_COMMUNICATION/team_170/TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_INTAKE_v1.0.0.md`
- **בקשת ולידציה (לאחר ביצוע):** `_COMMUNICATION/team_170/TEAM_170_TO_TEAM_190_DOMAIN_REFACTOR_VALIDATION_REQUEST_v1.0.0.md`

---

**log_entry | TEAM_170 | DOMAIN_REFACTOR_PLAYBOOK | v1.0.0 | 2026-02-21**
